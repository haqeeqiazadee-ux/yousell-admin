/**
 * Push-to-TikTok Shop Job Processor
 *
 * Pushes a product to a client's connected TikTok Shop via the TikTok Shop Open API.
 * Uses encrypted token storage (same pattern as Shopify push).
 * Feature-flagged: only calls TikTok API when TIKTOK_PUSH_ENABLED=true.
 *
 * TikTok Shop Open API docs: https://partner.tiktokshop.com/docv2
 *
 * @engine store-integration
 * @queue push-to-tiktok
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'
import { createDecipheriv, createHmac } from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

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

interface PushToTikTokData {
  product_id: string
  client_id: string
  shop_product_id: string
  userId?: string
}

const TIKTOK_API_BASE = 'https://open-api.tiktokglobalshop.com'

/**
 * Generate TikTok Shop API request signature.
 * Sign = HMAC-SHA256(app_secret, path + sorted_params + body)
 */
function generateSign(
  appSecret: string,
  path: string,
  params: Record<string, string>,
  body: string,
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}${params[k]}`)
    .join('')
  const baseString = `${path}${sortedParams}${body}`
  return createHmac('sha256', appSecret).update(baseString).digest('hex')
}

export async function processPushToTiktok(job: Job<PushToTikTokData>) {
  const { product_id, client_id, shop_product_id } = job.data
  console.log(`[push-to-tiktok] Processing job ${job.id}: product=${product_id}, client=${client_id}`)

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

    // Fetch client's TikTok Shop credentials
    const { data: channel } = await supabase
      .from('connected_channels')
      .select('access_token_encrypted, metadata')
      .eq('client_id', client_id)
      .eq('channel_type', 'tiktok-shop')
      .single()

    if (!channel?.access_token_encrypted) {
      await supabase
        .from('shop_products')
        .update({
          push_status: 'pending',
          sync_error: 'No TikTok Shop connection — connect store first',
        })
        .eq('id', shop_product_id)

      return { status: 'no_connection', product_id }
    }

    // Feature flag check
    const pushEnabled = process.env.TIKTOK_PUSH_ENABLED === 'true'
    if (!pushEnabled) {
      await supabase
        .from('shop_products')
        .update({
          push_status: 'pending',
          sync_error: 'Push disabled — set TIKTOK_PUSH_ENABLED=true to activate',
        })
        .eq('id', shop_product_id)

      return { status: 'disabled', product_id }
    }

    // Decrypt access token
    const accessToken = decryptToken(channel.access_token_encrypted)
    const metadata = channel.metadata as Record<string, string>
    const shopId = metadata?.shop_id
    const appKey = process.env.TIKTOK_APP_KEY || ''
    const appSecret = process.env.TIKTOK_APP_SECRET || ''

    if (!shopId || !appKey || !appSecret) {
      throw new Error('TikTok Shop credentials incomplete — need shop_id, TIKTOK_APP_KEY, TIKTOK_APP_SECRET')
    }

    // Check if updating existing product
    const { data: existingShopProduct } = await supabase
      .from('shop_products')
      .select('external_product_id')
      .eq('id', shop_product_id)
      .single()

    const isUpdate = !!existingShopProduct?.external_product_id

    // Build TikTok Shop product payload
    // https://partner.tiktokshop.com/docv2/page/650a4a82defece02be598a3a
    const productPayload = {
      title: product.title,
      description: product.description || product.title,
      category_id: metadata?.default_category_id || '0',
      brand_id: metadata?.brand_id || undefined,
      images: product.image_url
        ? [{ uri: product.image_url }]
        : [],
      skus: [{
        seller_sku: `YS-${product_id.slice(0, 8)}`,
        original_price: String(Math.round((product.price || 0) * 100)),
        stock_infos: [{
          warehouse_id: metadata?.warehouse_id || '',
          available_stock: 999,
        }],
      }],
      package_weight: {
        value: '500',
        unit: 'GRAM',
      },
      is_cod_allowed: false,
    }

    const body = JSON.stringify(productPayload)
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const path = isUpdate
      ? `/api/products/${existingShopProduct!.external_product_id}`
      : '/api/products'

    const params: Record<string, string> = {
      app_key: appKey,
      timestamp,
      shop_id: shopId,
      access_token: accessToken,
      version: '202309',
    }

    const sign = generateSign(appSecret, path, params, body)
    params.sign = sign

    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const url = `${TIKTOK_API_BASE}${path}?${queryString}`
    const method = isUpdate ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`TikTok Shop API error ${response.status}: ${errText}`)
    }

    const result = await response.json() as Record<string, unknown>

    if (result.code !== 0) {
      throw new Error(`TikTok Shop error: ${result.message || JSON.stringify(result)}`)
    }

    const data = result.data as Record<string, unknown> | undefined
    const tiktokProductId = (data?.product_id as string) || ''

    // Update shop_products with success
    const storeUrl = `https://www.tiktok.com/@${metadata?.shop_name || 'shop'}/product/${tiktokProductId}`
    await supabase
      .from('shop_products')
      .update({
        push_status: 'live',
        external_product_id: tiktokProductId,
        external_url: storeUrl,
        pushed_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        sync_error: null,
      })
      .eq('id', shop_product_id)

    console.log(`[push-to-tiktok] Product ${product_id} pushed to TikTok Shop: ${tiktokProductId}`)
    return { status: 'live', tiktok_product_id: tiktokProductId }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[push-to-tiktok] Failed:`, errorMessage)

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
