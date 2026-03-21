/**
 * Push-to-Shopify Job Processor
 *
 * Pushes a product to a client's connected Shopify store via the Shopify Admin API.
 * Feature-flagged: only calls Shopify API when SHOPIFY_PUSH_ENABLED=true.
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

interface PushToShopifyData {
  product_id: string
  client_id: string
  shop_product_id: string
  userId?: string
}

export async function processPushToShopify(job: Job<PushToShopifyData>) {
  const { product_id, client_id, shop_product_id } = job.data
  console.log(`[push-to-shopify] Processing job ${job.id}: product=${product_id}, client=${client_id}`)

  // Update status to pushing
  await supabase
    .from('shop_products')
    .update({ push_status: 'pushing' })
    .eq('id', shop_product_id)

  try {
    // Fetch product details
    const { data: product, error: productErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single()

    if (productErr || !product) {
      throw new Error(`Product not found: ${product_id}`)
    }

    // Fetch client's Shopify credentials
    const { data: channel } = await supabase
      .from('connected_channels')
      .select('access_token_encrypted, metadata')
      .eq('client_id', client_id)
      .eq('channel_type', 'shopify')
      .single()

    if (!channel?.access_token_encrypted) {
      await supabase
        .from('shop_products')
        .update({
          push_status: 'pending',
          sync_error: 'No Shopify connection — connect store first',
        })
        .eq('id', shop_product_id)

      return { status: 'no_connection', product_id }
    }

    // Feature flag check
    const pushEnabled = process.env.SHOPIFY_PUSH_ENABLED === 'true'
    if (!pushEnabled) {
      await supabase
        .from('shop_products')
        .update({
          push_status: 'pending',
          sync_error: 'Push disabled — set SHOPIFY_PUSH_ENABLED=true to activate',
        })
        .eq('id', shop_product_id)

      return { status: 'disabled', product_id }
    }

    // Call Shopify Admin API to create product
    const shopDomain = (channel.metadata as Record<string, string>)?.shop_domain
    if (!shopDomain) {
      throw new Error('Shop domain not found in channel metadata')
    }

    const shopifyResponse = await fetch(
      `https://${shopDomain}/admin/api/2024-01/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': channel.access_token_encrypted,
        },
        body: JSON.stringify({
          product: {
            title: product.title,
            body_html: product.description || '',
            vendor: 'YouSell',
            product_type: product.category || '',
            tags: [product.source, product.trend_stage].filter(Boolean).join(', '),
            variants: [{
              price: String(product.price || '0.00'),
              inventory_management: null,
            }],
            images: product.image_url ? [{ src: product.image_url }] : [],
          },
        }),
        signal: AbortSignal.timeout(30000),
      },
    )

    if (!shopifyResponse.ok) {
      const errText = await shopifyResponse.text()
      throw new Error(`Shopify API error ${shopifyResponse.status}: ${errText}`)
    }

    const result = (await shopifyResponse.json()) as Record<string, any>
    const shopifyProduct = result.product

    // Update shop_products with success
    await supabase
      .from('shop_products')
      .update({
        push_status: 'live',
        external_product_id: String(shopifyProduct.id),
        external_url: `https://${shopDomain}/products/${shopifyProduct.handle}`,
        pushed_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        sync_error: null,
      })
      .eq('id', shop_product_id)

    console.log(`[push-to-shopify] Product ${product_id} pushed to Shopify: ${shopifyProduct.id}`)
    return { status: 'live', shopify_product_id: shopifyProduct.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[push-to-shopify] Failed:`, errorMessage)

    await supabase
      .from('shop_products')
      .update({
        push_status: 'failed',
        sync_error: errorMessage,
      })
      .eq('id', shop_product_id)

    throw err
  }
}
