/**
 * Push-to-Shopify Job Processor
 *
 * Pushes a product to a client's connected Shopify store via the GraphQL Admin API.
 * Uses the `productSet` mutation (REST API is deprecated since April 2025).
 * Feature-flagged: only calls Shopify API when SHOPIFY_PUSH_ENABLED=true.
 *
 * @engine store-integration
 * @queue push-to-shopify
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

// Inline decrypt since backend doesn't share src/lib path
import { createDecipheriv } from 'crypto'

function decryptToken(encoded: string): string {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY not configured (64-char hex string required)')
  }
  const key = Buffer.from(hex, 'hex')
  const packed = Buffer.from(encoded, 'base64')
  const iv = packed.subarray(0, 12)
  const authTag = packed.subarray(packed.length - 16)
  const ciphertext = packed.subarray(12, packed.length - 16)
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

interface PushToShopifyData {
  product_id: string
  client_id: string
  shop_product_id: string
  userId?: string
}

const SHOPIFY_API_VERSION = '2025-01'

const PRODUCT_SET_MUTATION = `
  mutation productSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(input: $input, synchronous: $synchronous) {
      product {
        id
        title
        handle
        onlineStoreUrl
        status
        variants(first: 5) {
          nodes { id price }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

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

    // Decrypt access token
    const accessToken = decryptToken(channel.access_token_encrypted)
    const shopDomain = (channel.metadata as Record<string, string>)?.shop_domain
    if (!shopDomain) {
      throw new Error('Shop domain not found in channel metadata')
    }

    // Check if this is an update (existing external_product_id)
    const { data: existingShopProduct } = await supabase
      .from('shop_products')
      .select('external_product_id')
      .eq('id', shop_product_id)
      .single()

    // Build productSet input
    const input: Record<string, unknown> = {
      title: product.title,
      descriptionHtml: product.description || '',
      vendor: 'YouSell',
      productType: product.category || '',
      tags: [product.source, product.trend_stage].filter(Boolean),
      status: 'ACTIVE',
      productOptions: [{ name: 'Default', values: [{ name: 'Default' }] }],
      variants: [{
        optionValues: [{ optionName: 'Default', name: 'Default' }],
        price: String(product.price || '0.00'),
        position: 1,
      }],
    }

    // If updating existing product, include Shopify GID
    if (existingShopProduct?.external_product_id) {
      input.id = existingShopProduct.external_product_id
    }

    // Add images
    if (product.image_url) {
      input.files = [{ originalSource: product.image_url, contentType: 'IMAGE' }]
    }

    // Call Shopify GraphQL Admin API
    const graphqlUrl = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
    const shopifyResponse = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: PRODUCT_SET_MUTATION,
        variables: { input, synchronous: true },
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!shopifyResponse.ok) {
      const errText = await shopifyResponse.text()
      throw new Error(`Shopify API error ${shopifyResponse.status}: ${errText}`)
    }

    const result = await shopifyResponse.json() as Record<string, any>
    const productSet = result.data?.productSet

    if (productSet?.userErrors?.length > 0) {
      const errors = productSet.userErrors.map((e: any) => e.message).join('; ')
      throw new Error(`Shopify product errors: ${errors}`)
    }

    const shopifyProduct = productSet?.product
    if (!shopifyProduct) {
      throw new Error('productSet returned no product')
    }

    // Update shop_products with success
    const productUrl = shopifyProduct.onlineStoreUrl || `https://${shopDomain}/products/${shopifyProduct.handle}`
    await supabase
      .from('shop_products')
      .update({
        push_status: 'live',
        external_product_id: shopifyProduct.id,
        external_url: productUrl,
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
