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
    // ── Product reverse sync: Shopify → YOUSELL ──
    if (topic === 'products/update' || topic === 'products/create') {
      const shopifyGid = `gid://shopify/Product/${payload.id}`
      const variant = payload.variants?.[0]

      // Find the shop_products record that matches this Shopify product
      const { data: shopProducts } = await admin
        .from('shop_products')
        .select('id, product_id, client_id, push_status')
        .or(`external_product_id.eq.${shopifyGid},external_product_id.eq.${payload.id}`)

      if (shopProducts && shopProducts.length > 0) {
        for (const sp of shopProducts) {
          // Update shop_products with latest Shopify data
          await admin
            .from('shop_products')
            .update({
              last_synced_at: new Date().toISOString(),
              sync_error: null,
              metadata: {
                shopify_title: payload.title,
                shopify_status: payload.status,
                shopify_price: variant?.price,
                shopify_inventory: variant?.inventory_quantity,
                shopify_updated_at: payload.updated_at,
              },
            })
            .eq('id', sp.id)

          // Sync price back to YOUSELL products table if changed
          if (variant?.price && sp.product_id) {
            const newPrice = parseFloat(variant.price)
            const { data: product } = await admin
              .from('products')
              .select('price')
              .eq('id', sp.product_id)
              .single()

            if (product && Math.abs((product.price || 0) - newPrice) > 0.01) {
              await admin
                .from('products')
                .update({
                  price: newPrice,
                  metadata: {
                    shopify_synced_price: newPrice,
                    shopify_synced_at: new Date().toISOString(),
                  },
                })
                .eq('id', sp.product_id)

              console.log(`[Shopify Webhook] Price synced for product ${sp.product_id}: $${product.price} → $${newPrice}`)
            }
          }

          // If Shopify product is archived/draft, update push_status
          if (payload.status === 'archived' || payload.status === 'draft') {
            await admin
              .from('shop_products')
              .update({ push_status: payload.status === 'archived' ? 'removed' : 'draft' })
              .eq('id', sp.id)
          }
        }

        console.log(`[Shopify Webhook] Reverse-synced ${shopProducts.length} product(s) from ${shopDomain}`)
      }

      return NextResponse.json({ received: true })
    }

    if (topic === 'products/delete') {
      const shopifyGid = `gid://shopify/Product/${payload.id}`

      const { data: shopProducts } = await admin
        .from('shop_products')
        .select('id, product_id')
        .or(`external_product_id.eq.${shopifyGid},external_product_id.eq.${payload.id}`)

      if (shopProducts && shopProducts.length > 0) {
        await admin
          .from('shop_products')
          .update({
            push_status: 'removed',
            sync_error: 'Product deleted from Shopify',
            last_synced_at: new Date().toISOString(),
          })
          .in('id', shopProducts.map(sp => sp.id))

        console.log(`[Shopify Webhook] Marked ${shopProducts.length} product(s) as removed (deleted from Shopify)`)
      }

      return NextResponse.json({ received: true })
    }

    if (topic === 'inventory_levels/update') {
      // Inventory level update — sync stock quantity back
      const inventoryItemId = payload.inventory_item_id
      const available = payload.available

      if (inventoryItemId != null && available != null) {
        // Find shop_products via Shopify inventory item metadata
        // The inventory_item_id maps to a variant, which maps to a product
        const { data: shopProducts } = await admin
          .from('shop_products')
          .select('id, product_id, metadata')
          .not('metadata', 'is', null)

        // Filter for products that track this inventory item
        const matching = (shopProducts || []).filter(sp => {
          const meta = sp.metadata as Record<string, unknown>
          return meta?.shopify_inventory_item_id === inventoryItemId
        })

        for (const sp of matching) {
          await admin
            .from('shop_products')
            .update({
              metadata: {
                ...(sp.metadata as Record<string, unknown>),
                shopify_inventory: available,
                shopify_inventory_synced_at: new Date().toISOString(),
              },
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', sp.id)
        }

        if (matching.length > 0) {
          console.log(`[Shopify Webhook] Inventory synced: item=${inventoryItemId}, available=${available}`)
        }
      }

      return NextResponse.json({ received: true })
    }

    // ── Order handling ──
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
