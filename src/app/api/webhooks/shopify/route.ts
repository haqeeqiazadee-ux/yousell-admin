import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderStatusEmail } from '@/lib/email-orders'
import crypto from 'crypto'

function verifyShopifyWebhook(body: string, signature: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const hmac = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-shopify-hmac-sha256')
  const topic = request.headers.get('x-shopify-topic')
  const shopDomain = request.headers.get('x-shopify-shop-domain')

  if (!verifyShopifyWebhook(body, signature)) {
    console.error('[Shopify Webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(body)
  const admin = createAdminClient()

  try {
    if (topic === 'orders/create' || topic === 'orders/updated') {
      // Find client by connected channel
      const { data: channel } = await admin
        .from('connected_channels')
        .select('client_id')
        .eq('channel_type', 'shopify')
        .eq('channel_name', shopDomain)
        .eq('status', 'active')
        .single()

      if (!channel) {
        console.warn(`[Shopify Webhook] No active channel for shop: ${shopDomain}`)
        return NextResponse.json({ received: true })
      }

      const shippingAddress = payload.shipping_address ? {
        name: payload.shipping_address.name,
        address1: payload.shipping_address.address1,
        city: payload.shipping_address.city,
        province: payload.shipping_address.province,
        country: payload.shipping_address.country,
        zip: payload.shipping_address.zip,
      } : null

      const status = mapShopifyStatus(payload.fulfillment_status, payload.financial_status)
      const lineItem = payload.line_items?.[0]

      const orderData = {
        client_id: channel.client_id,
        external_order_id: String(payload.id),
        platform: 'shopify',
        status,
        quantity: payload.line_items?.reduce((sum: number, li: { quantity: number }) => sum + li.quantity, 0) || 1,
        total_amount: parseFloat(payload.total_price) || 0,
        currency: payload.currency || 'USD',
        customer_name: payload.customer?.first_name
          ? `${payload.customer.first_name} ${payload.customer.last_name || ''}`.trim()
          : null,
        customer_email: payload.customer?.email || null,
        shipping_address: shippingAddress,
        product_name: lineItem?.title || null,
        tracking_number: payload.fulfillments?.[0]?.tracking_number || null,
        tracking_url: payload.fulfillments?.[0]?.tracking_url || null,
        fulfilled_at: payload.fulfillments?.[0]?.created_at || null,
      }

      const { error } = await admin
        .from('orders')
        .upsert(orderData, { onConflict: 'external_order_id,platform' })

      if (error) {
        console.error('[Shopify Webhook] DB error:', error)
      }

      // Send status email for shipped/delivered
      if ((status === 'shipped' || status === 'delivered') && orderData.customer_email) {
        await sendOrderStatusEmail({
          to: orderData.customer_email,
          customerName: orderData.customer_name || 'Customer',
          orderNumber: orderData.external_order_id,
          status,
          productName: orderData.product_name || 'Your order',
          trackingNumber: orderData.tracking_number || undefined,
          trackingUrl: orderData.tracking_url || undefined,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Shopify Webhook] Error:', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

function mapShopifyStatus(fulfillmentStatus: string | null, financialStatus: string | null): string {
  if (fulfillmentStatus === 'fulfilled') return 'delivered'
  if (fulfillmentStatus === 'partial') return 'shipped'
  if (financialStatus === 'paid') return 'confirmed'
  return 'pending'
}
