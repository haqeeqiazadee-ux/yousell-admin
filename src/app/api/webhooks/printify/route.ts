/**
 * Printify Webhook — POD Fulfillment Order Routing
 *
 * Handles Printify order lifecycle events.
 * Events: order:shipping-update, order:created, order:cancelled
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

function verifyPrintifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.PRINTIFY_WEBHOOK_SECRET;
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
  const signature = request.headers.get('x-printify-signature');

  if (!process.env.PRINTIFY_WEBHOOK_SECRET) {
    console.error('[Printify] PRINTIFY_WEBHOOK_SECRET not configured — rejecting request');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }
  if (!verifyPrintifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { type: string; resource?: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case 'order:shipping-update': {
        const resource = event.resource || {};
        const orderId = resource.id;
        const shipments = (resource.shipments || []) as Array<{
          tracking_number?: string;
          tracking_url?: string;
          carrier?: string;
        }>;

        if (orderId && shipments.length > 0) {
          const shipment = shipments[0];
          await supabase
            .from('orders')
            .update({
              status: 'shipped',
              tracking_number: shipment.tracking_number,
              tracking_url: shipment.tracking_url,
              carrier: shipment.carrier,
              shipped_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('external_order_id', String(orderId))
            .eq('fulfillment_provider', 'printify');

          console.log(`[Printify] Order ${orderId} shipped — tracking: ${shipment.tracking_number}`);
        }
        break;
      }

      case 'order:created': {
        const resource = event.resource || {};
        const orderId = resource.id;
        const externalId = resource.external_id;

        if (orderId) {
          await supabase
            .from('orders')
            .upsert({
              external_order_id: String(orderId),
              fulfillment_provider: 'printify',
              status: 'processing',
              platform_order_id: externalId ? String(externalId) : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'external_order_id,fulfillment_provider' });

          console.log(`[Printify] Order ${orderId} created`);
        }
        break;
      }

      case 'order:cancelled': {
        const resource = event.resource || {};
        const orderId = resource.id;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('external_order_id', String(orderId))
            .eq('fulfillment_provider', 'printify');

          console.log(`[Printify] Order ${orderId} cancelled`);
        }
        break;
      }

      case 'order:sent-to-production': {
        const resource = event.resource || {};
        const orderId = resource.id;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'in_production',
              updated_at: new Date().toISOString(),
            })
            .eq('external_order_id', String(orderId))
            .eq('fulfillment_provider', 'printify');

          console.log(`[Printify] Order ${orderId} sent to production`);
        }
        break;
      }

      default:
        console.log(`[Printify] Unhandled event: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Printify] Error processing ${event.type}:`, error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
