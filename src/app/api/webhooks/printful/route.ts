/**
 * Printful Webhook — POD Fulfillment Order Routing
 *
 * Handles Printful order lifecycle events and routes them
 * to the order-tracking engine.
 *
 * Events: package_shipped, order_created, order_updated, order_failed
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

function verifyPrintfulSignature(body: string, signature: string | null): boolean {
  const secret = process.env.PRINTFUL_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac('sha256', secret).update(body).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-printful-signature');

  const webhookSecret = process.env.PRINTFUL_WEBHOOK_SECRET;
  if (webhookSecret && !verifyPrintfulSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { type: string; data?: Record<string, unknown>; retries?: number };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case 'package_shipped': {
        const data = event.data || {};
        const orderId = data.order?.id || data.id;
        const trackingNumber = data.shipment?.tracking_number;
        const trackingUrl = data.shipment?.tracking_url;
        const carrier = data.shipment?.carrier;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'shipped',
              tracking_number: trackingNumber,
              tracking_url: trackingUrl,
              carrier,
              shipped_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('external_order_id', String(orderId))
            .eq('fulfillment_provider', 'printful');

          console.log(`[Printful] Order ${orderId} shipped — tracking: ${trackingNumber}`);
        }
        break;
      }

      case 'order_created': {
        const data = event.data || {};
        const orderId = data.order?.id || data.id;
        const externalId = data.order?.external_id;

        if (orderId) {
          await supabase
            .from('orders')
            .upsert({
              external_order_id: String(orderId),
              fulfillment_provider: 'printful',
              status: 'processing',
              platform_order_id: externalId ? String(externalId) : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'external_order_id,fulfillment_provider' });

          console.log(`[Printful] Order ${orderId} created`);
        }
        break;
      }

      case 'order_updated': {
        const data = event.data || {};
        const orderId = data.order?.id || data.id;
        const status = data.order?.status;

        if (orderId && status) {
          const statusMap: Record<string, string> = {
            draft: 'pending',
            pending: 'processing',
            failed: 'failed',
            canceled: 'cancelled',
            inprocess: 'processing',
            onhold: 'on_hold',
            partial: 'partial',
            fulfilled: 'fulfilled',
          };

          await supabase
            .from('orders')
            .update({
              status: statusMap[String(status)] || String(status),
              updated_at: new Date().toISOString(),
            })
            .eq('external_order_id', String(orderId))
            .eq('fulfillment_provider', 'printful');

          console.log(`[Printful] Order ${orderId} updated to ${status}`);
        }
        break;
      }

      case 'order_failed': {
        const data = event.data || {};
        const orderId = data.order?.id || data.id;
        const reason = data.reason;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'failed',
              error_message: reason ? String(reason) : 'Printful order failed',
              updated_at: new Date().toISOString(),
            })
            .eq('external_order_id', String(orderId))
            .eq('fulfillment_provider', 'printful');

          console.error(`[Printful] Order ${orderId} failed: ${reason}`);
        }
        break;
      }

      default:
        console.log(`[Printful] Unhandled event: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Printful] Error processing ${event.type}:`, error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
