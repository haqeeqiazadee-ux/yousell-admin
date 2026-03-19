import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderStatusEmail } from '@/lib/email-orders'
import { createHmac } from 'crypto'

function verifyAmazonSignature(body: string, signature: string | null): boolean {
  const secret = process.env.AMAZON_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Amazon Webhook] AMAZON_WEBHOOK_SECRET not configured')
    return false
  }
  if (!signature) return false
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  return signature === expected
}

// Amazon SP-API sends SQS-style notifications via EventBridge or push
export async function POST(request: NextRequest) {
  const body = await request.text()

  // Verify webhook signature
  const signature = request.headers.get('x-amz-signature') || request.headers.get('authorization')
  if (!verifyAmazonSignature(body, signature)) {
    console.warn('[Amazon Webhook] Invalid or missing signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(body)

  const notificationType = payload.NotificationType || payload.notificationType
  if (notificationType !== 'ORDER_CHANGE') {
    return NextResponse.json({ received: true })
  }

  const admin = createAdminClient()

  try {
    const orderPayload = payload.Payload?.OrderChangeNotification || payload.payload
    if (!orderPayload?.AmazonOrderId) {
      return NextResponse.json({ received: true })
    }

    // Find client by Amazon seller ID stored in connected_channels metadata
    const sellerId = orderPayload.SellerId
    const { data: channel } = await admin
      .from('connected_channels')
      .select('client_id')
      .eq('channel_type', 'amazon')
      .eq('status', 'active')
      .single()

    if (!channel) {
      console.warn(`[Amazon Webhook] No active amazon channel for seller: ${sellerId}`)
      return NextResponse.json({ received: true })
    }

    const status = mapAmazonStatus(orderPayload.OrderStatus)
    const item = orderPayload.OrderItems?.[0]

    const order = {
      client_id: channel.client_id,
      external_order_id: orderPayload.AmazonOrderId,
      platform: 'amazon',
      status,
      quantity: orderPayload.NumberOfItemsShipped + orderPayload.NumberOfItemsUnshipped || 1,
      total_amount: parseFloat(orderPayload.OrderTotal?.Amount || '0'),
      currency: orderPayload.OrderTotal?.CurrencyCode || 'USD',
      customer_name: orderPayload.BuyerInfo?.BuyerName || null,
      customer_email: orderPayload.BuyerInfo?.BuyerEmail || null,
      shipping_address: orderPayload.ShippingAddress ? {
        name: orderPayload.ShippingAddress.Name,
        address1: orderPayload.ShippingAddress.AddressLine1,
        city: orderPayload.ShippingAddress.City,
        province: orderPayload.ShippingAddress.StateOrRegion,
        country: orderPayload.ShippingAddress.CountryCode,
        zip: orderPayload.ShippingAddress.PostalCode,
      } : null,
      product_name: item?.Title || null,
      tracking_number: null,
      tracking_url: null,
    }

    const { error } = await admin
      .from('orders')
      .upsert(order, { onConflict: 'external_order_id,platform' })

    if (error) {
      console.error('[Amazon Webhook] DB error:', error)
    }

    if ((status === 'shipped' || status === 'delivered') && order.customer_email) {
      await sendOrderStatusEmail({
        to: order.customer_email,
        customerName: order.customer_name || 'Customer',
        orderNumber: order.external_order_id,
        status,
        productName: order.product_name || 'Your order',
      })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Amazon Webhook] Error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

function mapAmazonStatus(status: string | undefined): string {
  switch (status) {
    case 'Unshipped': return 'confirmed'
    case 'PartiallyShipped':
    case 'Shipped': return 'shipped'
    case 'Delivered': return 'delivered'
    default: return 'pending'
  }
}
