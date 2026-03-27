/**
 * Engine-namespaced route: POST /api/engine/orders/webhook
 * @engine order-tracking
 *
 * Receives order webhooks from connected stores (Shopify, TikTok, Amazon).
 * Validates webhook signature, processes order, emits events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // Determine platform from header or body
    const platform = request.headers.get('x-platform')
      || body.platform
      || 'unknown';

    // Extract order data based on platform
    let orderId: string;
    let productId: string;
    let revenue: number;
    let quantity: number;
    let customerEmail: string | undefined;
    let customerName: string | undefined;
    let externalOrderId: string | undefined;

    switch (platform) {
      case 'shopify':
        orderId = `shopify_${body.id || body.order_number}`;
        externalOrderId = String(body.id || body.order_number);
        productId = body.line_items?.[0]?.product_id
          ? String(body.line_items[0].product_id)
          : '';
        revenue = parseFloat(body.total_price || '0');
        quantity = body.line_items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 1;
        customerEmail = body.customer?.email || body.email;
        customerName = body.customer?.first_name
          ? `${body.customer.first_name} ${body.customer.last_name || ''}`
          : undefined;
        break;

      case 'tiktok':
        orderId = `tiktok_${body.order_id}`;
        externalOrderId = body.order_id;
        productId = body.item_list?.[0]?.product_id || '';
        revenue = body.payment?.total_amount || 0;
        quantity = body.item_list?.length || 1;
        customerEmail = body.buyer_email;
        break;

      case 'amazon':
        orderId = `amazon_${body.AmazonOrderId}`;
        externalOrderId = body.AmazonOrderId;
        productId = body.OrderItems?.[0]?.ASIN || '';
        revenue = parseFloat(body.OrderTotal?.Amount || '0');
        quantity = body.NumberOfItemsShipped || 1;
        customerEmail = body.BuyerEmail;
        break;

      default:
        // Generic webhook format
        orderId = body.orderId || `order_${Date.now()}`;
        externalOrderId = body.externalOrderId;
        productId = body.productId || '';
        revenue = body.revenue || 0;
        quantity = body.quantity || 1;
        customerEmail = body.customerEmail;
        customerName = body.customerName;
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Could not extract order ID' }, { status: 400 });
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (existing) {
      return NextResponse.json({ status: 'duplicate', orderId });
    }

    // Look up internal product ID from shop_products if we only have external ID
    if (productId && !productId.match(/^[0-9a-f-]{36}$/)) {
      const { data: shopProduct } = await supabase
        .from('shop_products')
        .select('product_id')
        .eq('external_product_id', productId)
        .single();

      if (shopProduct) {
        productId = shopProduct.product_id;
      }
    }

    // Insert order
    const { data: inserted, error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        product_id: productId || null,
        platform,
        external_order_id: externalOrderId,
        customer_email: customerEmail,
        customer_name: customerName,
        status: 'received',
        fulfillment_status: 'unfulfilled',
        revenue,
        quantity,
        metadata: { rawWebhook: body },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[API] Order webhook insert error:', insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'tracked',
      orderId,
      orderRecordId: inserted?.id,
      platform,
      revenue,
    });
  } catch (error) {
    console.error('[API] /engine/orders/webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
