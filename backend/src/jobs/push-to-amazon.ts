/**
 * Push-to-Amazon Job Processor
 *
 * Pushes a product to a client's connected Amazon Seller Central via SP-API.
 * Uses encrypted token storage (same pattern as Shopify push).
 * Feature-flagged: only calls Amazon API when AMAZON_PUSH_ENABLED=true.
 *
 * Amazon SP-API Listings Items: https://developer-docs.amazon.com/sp-api/docs/listings-items-api-v2021-08-01-reference
 *
 * @engine store-integration
 * @queue push-to-amazon
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'
import { createDecipheriv, createHmac, createHash } from 'crypto'

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

interface PushToAmazonData {
  product_id: string
  client_id: string
  shop_product_id: string
  userId?: string
}

const AMAZON_SP_API_BASE = 'https://sellingpartnerapi-na.amazon.com'

/**
 * Get an LWA (Login with Amazon) access token from a refresh token.
 * Amazon SP-API requires exchanging refresh tokens for short-lived access tokens.
 */
async function getLwaAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.AMAZON_SP_CLIENT_ID || ''
  const clientSecret = process.env.AMAZON_SP_CLIENT_SECRET || ''

  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`LWA token exchange failed (${res.status}): ${errText}`)
  }

  const data = await res.json() as Record<string, unknown>
  if (!data.access_token) {
    throw new Error('LWA token exchange returned no access_token')
  }

  return data.access_token as string
}

/**
 * Generate AWS Signature V4 for SP-API requests.
 * Simplified version — uses STS assumed role credentials.
 */
function signRequest(
  method: string,
  url: string,
  body: string,
  accessToken: string,
  timestamp: string,
): Record<string, string> {
  // For SP-API, the access token is passed as x-amz-access-token header
  // AWS SigV4 signing is handled by the IAM role credentials
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-amz-access-token': accessToken,
    'x-amz-date': timestamp,
    'user-agent': 'YouSell/1.0 (Platform; Node.js)',
  }

  // If AWS credentials are available, add SigV4
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY
  if (awsAccessKey && awsSecretKey) {
    const date = timestamp.slice(0, 8)
    const region = process.env.AWS_REGION || 'us-east-1'
    const service = 'execute-api'
    const scope = `${date}/${region}/${service}/aws4_request`

    const parsedUrl = new URL(url)
    const canonicalRequest = [
      method,
      parsedUrl.pathname,
      parsedUrl.search.replace('?', ''),
      `content-type:application/json\nhost:${parsedUrl.host}\nx-amz-access-token:${accessToken}\nx-amz-date:${timestamp}\n`,
      'content-type;host;x-amz-access-token;x-amz-date',
      createHash('sha256').update(body).digest('hex'),
    ].join('\n')

    const stringToSign = `AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${createHash('sha256').update(canonicalRequest).digest('hex')}`

    const kDate = createHmac('sha256', `AWS4${awsSecretKey}`).update(date).digest()
    const kRegion = createHmac('sha256', kDate).update(region).digest()
    const kService = createHmac('sha256', kRegion).update(service).digest()
    const kSigning = createHmac('sha256', kService).update('aws4_request').digest()
    const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex')

    headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${awsAccessKey}/${scope}, SignedHeaders=content-type;host;x-amz-access-token;x-amz-date, Signature=${signature}`

    const securityToken = process.env.AWS_SESSION_TOKEN
    if (securityToken) {
      headers['x-amz-security-token'] = securityToken
    }
  }

  return headers
}

export async function processPushToAmazon(job: Job<PushToAmazonData>) {
  const { product_id, client_id, shop_product_id } = job.data
  console.log(`[push-to-amazon] Processing job ${job.id}: product=${product_id}, client=${client_id}`)

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

    // Fetch client's Amazon credentials
    const { data: channel } = await supabase
      .from('connected_channels')
      .select('access_token_encrypted, refresh_token_encrypted, metadata')
      .eq('client_id', client_id)
      .eq('channel_type', 'amazon')
      .single()

    if (!channel?.refresh_token_encrypted) {
      await supabase
        .from('shop_products')
        .update({
          push_status: 'pending',
          sync_error: 'No Amazon connection — connect Seller Central first',
        })
        .eq('id', shop_product_id)

      return { status: 'no_connection', product_id }
    }

    // Feature flag check
    const pushEnabled = process.env.AMAZON_PUSH_ENABLED === 'true'
    if (!pushEnabled) {
      await supabase
        .from('shop_products')
        .update({
          push_status: 'pending',
          sync_error: 'Push disabled — set AMAZON_PUSH_ENABLED=true to activate',
        })
        .eq('id', shop_product_id)

      return { status: 'disabled', product_id }
    }

    // Decrypt refresh token and exchange for access token
    const refreshToken = decryptToken(channel.refresh_token_encrypted)
    const accessToken = await getLwaAccessToken(refreshToken)

    const metadata = channel.metadata as Record<string, string>
    const sellerId = metadata?.seller_id
    const marketplaceId = metadata?.marketplace_id || 'ATVPDKIKX0DER' // US marketplace default

    if (!sellerId) {
      throw new Error('Amazon seller_id not found in channel metadata')
    }

    // Check if updating existing product
    const { data: existingShopProduct } = await supabase
      .from('shop_products')
      .select('external_product_id')
      .eq('id', shop_product_id)
      .single()

    // Generate SKU for this product
    const sku = `YS-${product_id.slice(0, 8)}`

    // Build SP-API Listings Item payload
    // https://developer-docs.amazon.com/sp-api/docs/listings-items-api-v2021-08-01-reference
    const listingPayload = {
      productType: metadata?.product_type || 'PRODUCT',
      requirements: 'LISTING',
      attributes: {
        item_name: [{ value: product.title, marketplace_id: marketplaceId }],
        bullet_point: product.description
          ? [{ value: product.description.slice(0, 500), marketplace_id: marketplaceId }]
          : [],
        manufacturer: [{ value: 'YouSell', marketplace_id: marketplaceId }],
        brand: [{ value: metadata?.brand_name || 'YouSell', marketplace_id: marketplaceId }],
        externally_assigned_product_identifier: product.metadata?.asin
          ? [{ type: 'asin', value: product.metadata.asin, marketplace_id: marketplaceId }]
          : [],
        purchasable_offer: [{
          marketplace_id: marketplaceId,
          currency: 'USD',
          our_price: [{ schedule: [{ value_with_tax: String(product.price || 0) }] }],
        }],
        fulfillment_availability: [{
          fulfillment_channel_code: metadata?.fulfillment_channel || 'DEFAULT',
          quantity: 999,
        }],
        main_product_image_locator: product.image_url
          ? [{ media_location: product.image_url, marketplace_id: marketplaceId }]
          : [],
      },
    }

    const body = JSON.stringify(listingPayload)
    const now = new Date()
    const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

    const url = `${AMAZON_SP_API_BASE}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketplaceId}`
    const headers = signRequest('PUT', url, body, accessToken, timestamp)

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body,
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Amazon SP-API error ${response.status}: ${errText}`)
    }

    const result = await response.json() as Record<string, unknown>

    // Check for submission errors
    const issues = (result.issues as Array<Record<string, unknown>>) || []
    const errors = issues.filter(i => i.severity === 'ERROR')
    if (errors.length > 0) {
      throw new Error(`Amazon listing errors: ${errors.map(e => e.message).join('; ')}`)
    }

    const submissionId = (result.submissionId as string) || ''
    const status = (result.status as string) || 'ACCEPTED'

    // Update shop_products with success
    const productUrl = `https://www.amazon.com/dp/${product.metadata?.asin || sku}`
    await supabase
      .from('shop_products')
      .update({
        push_status: status === 'ACCEPTED' ? 'live' : 'pending',
        external_product_id: sku,
        external_url: productUrl,
        pushed_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        sync_error: null,
        metadata: { submissionId, status, sku },
      })
      .eq('id', shop_product_id)

    console.log(`[push-to-amazon] Product ${product_id} pushed to Amazon: SKU=${sku}, submission=${submissionId}`)
    return { status, sku, submissionId }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[push-to-amazon] Failed:`, errorMessage)

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
