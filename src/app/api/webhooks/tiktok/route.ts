import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderStatusEmail } from '@/lib/email-orders'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const payload = JSON.parse(body)

  // TikTok Shop sends a type field indicating the event
  const eventType = payload.type
  if (!eventType?.startsWith('ORDER')) {
    return NextResponse.json({ received: true })
  }

  const admin = createAdminClient()

  try {
    const orderData = payload.data
    if (!orderData?.order_id) {
      return NextResponse.json({ received: true })
    }

    // Find client by TikTok shop_id in metadata
    const shopId = orderData.shop_id || payload.shop_id
    const { data: channel } = await admin
      .from('connected_channels')
      .select('client_id')
      .eq('channel_type', 'tiktok_shop')
      .eq('status', 'active')
      .contains('metadata', { shop_id: shopId })
      .single()

    if (!channel) {
      console.warn(`[TikTok Webhook] No active channel for shop_id: ${shopId}`)
      return NextResponse.json({ received: true })
    }

    const status = mapTikTokStatus(orderData.order_status)
    const lineItem = orderData.item_list?.[0]

    const order = {
      client_id: channel.client_id,
      external_order_id: String(orderData.order_id),
      platform: 'tiktok_shop',
      status,
      quantity: orderData.item_list?.reduce((sum: number, li: { quantity: number }) => sum + (li.quantity || 1), 0) || 1,
      total_amount: parseFloat(orderData.payment?.total_amount || '0'),
      currency: orderData.payment?.currency || 'USD',
      customer_name: orderData.recipient_address?.name || null,
      customer_email: orderData.buyer_email || null,
      shipping_address: orderData.recipient_address ? {
        name: orderData.recipient_address.name,
        address1: orderData.recipient_address.address_detail,
        city: orderData.recipient_address.city,
        province: orderData.recipient_address.state,
        country: orderData.recipient_address.region,
        zip: orderData.recipient_address.zipcode,
      } : null,
      product_name: lineItem?.product_name || null,
      tracking_number: orderData.tracking_number || null,
      tracking_url: null,
    }

    const { error } = await admin
      .from('orders')
      .upsert(order, { onConflict: 'external_order_id,platform' })

    if (error) {
      console.error('[TikTok Webhook] DB error:', error)
    }

    if ((status === 'shipped' || status === 'delivered') && order.customer_email) {
      await sendOrderStatusEmail({
        to: order.customer_email,
        customerName: order.customer_name || 'Customer',
        orderNumber: order.external_order_id,
        status,
        productName: order.product_name || 'Your order',
        trackingNumber: order.tracking_number || undefined,
      })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[TikTok Webhook] Error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

function mapTikTokStatus(status: string | undefined): string {
  switch (status) {
    case 'AWAITING_SHIPMENT': return 'confirmed'
    case 'AWAITING_COLLECTION':
    case 'IN_TRANSIT': return 'shipped'
    case 'DELIVERED': return 'delivered'
    case 'COMPLETED': return 'delivered'
    default: return 'pending'
  }
}
