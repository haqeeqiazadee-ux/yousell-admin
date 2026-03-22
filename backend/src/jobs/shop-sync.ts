/**
 * Shop Sync Job Processor
 *
 * Syncs product data between YOUSELL and connected stores (Shopify, TikTok, Amazon).
 * Checks for price/inventory/listing status changes and updates shop_products table.
 * Feature-flagged: only runs when the respective platform push is enabled.
 *
 * @engine store-integration
 * @queue shop-sync
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'
import { createDecipheriv } from 'crypto'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

function decryptToken(encoded: string): string {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY not configured')
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

interface ShopSyncData {
  client_id: string
  channel_type: 'shopify' | 'tiktok' | 'amazon'
  /** If provided, sync only this product. Otherwise sync all live products for the client+channel. */
  shop_product_id?: string
  userId?: string
}

const SHOPIFY_API_VERSION = '2025-01'

const PRODUCT_STATUS_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      status
      onlineStoreUrl
      variants(first: 5) {
        nodes { id price inventoryQuantity }
      }
    }
  }
`

export async function processShopSync(job: Job<ShopSyncData>) {
  const { client_id, channel_type, shop_product_id } = job.data
  console.log(`[shop-sync] Processing: client=${client_id}, channel=${channel_type}`)

  // Fetch channel connection
  const { data: channel } = await supabase
    .from('connected_channels')
    .select('access_token_encrypted, metadata, status')
    .eq('client_id', client_id)
    .eq('channel_type', channel_type)
    .single()

  if (!channel || channel.status !== 'active' || !channel.access_token_encrypted) {
    console.log(`[shop-sync] No active ${channel_type} connection for client ${client_id}`)
    return { status: 'no_connection', synced: 0 }
  }

  // Fetch products to sync
  let query = supabase
    .from('shop_products')
    .select('id, product_id, external_product_id, push_status')
    .eq('client_id', client_id)
    .eq('channel_type', channel_type)
    .in('push_status', ['live', 'pushing'])

  if (shop_product_id) {
    query = query.eq('id', shop_product_id)
  }

  const { data: products } = await query
  if (!products || products.length === 0) {
    return { status: 'nothing_to_sync', synced: 0 }
  }

  let synced = 0
  let errors = 0

  if (channel_type === 'shopify') {
    const accessToken = decryptToken(channel.access_token_encrypted)
    const shopDomain = (channel.metadata as Record<string, string>)?.shop_domain

    if (!shopDomain) {
      console.error(`[shop-sync] No shop_domain in metadata for client ${client_id}`)
      return { status: 'no_domain', synced: 0 }
    }

    for (const prod of products) {
      if (!prod.external_product_id) continue

      try {
        const res = await fetch(
          `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({
              query: PRODUCT_STATUS_QUERY,
              variables: { id: prod.external_product_id },
            }),
            signal: AbortSignal.timeout(15000),
          },
        )

        if (!res.ok) {
          throw new Error(`Shopify ${res.status}`)
        }

        const result = await res.json() as Record<string, any>
        const shopifyProduct = result.data?.product

        if (!shopifyProduct) {
          // Product was deleted on Shopify
          await supabase
            .from('shop_products')
            .update({
              push_status: 'delisted',
              sync_error: 'Product not found on Shopify (may have been deleted)',
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', prod.id)
        } else {
          const variant = shopifyProduct.variants?.nodes?.[0]
          const shopifyPrice = variant ? parseFloat(variant.price) : null

          await supabase
            .from('shop_products')
            .update({
              push_status: shopifyProduct.status === 'ACTIVE' ? 'live' : 'delisted',
              last_synced_at: new Date().toISOString(),
              sync_error: null,
              metadata: {
                shopify_status: shopifyProduct.status,
                shopify_price: shopifyPrice,
                shopify_inventory: variant?.inventoryQuantity,
                online_store_url: shopifyProduct.onlineStoreUrl,
                variants: shopifyProduct.variants?.nodes,
              },
            })
            .eq('id', prod.id)

          // Reverse-sync price to YOUSELL products table
          if (shopifyPrice && prod.product_id) {
            const { data: yousellProduct } = await supabase
              .from('products')
              .select('price')
              .eq('id', prod.product_id)
              .single()

            if (yousellProduct && Math.abs((yousellProduct.price || 0) - shopifyPrice) > 0.01) {
              await supabase
                .from('products')
                .update({
                  price: shopifyPrice,
                  metadata: {
                    shopify_synced_price: shopifyPrice,
                    shopify_synced_at: new Date().toISOString(),
                  },
                })
                .eq('id', prod.product_id)

              console.log(`[shop-sync] Price reverse-synced: product=${prod.product_id}, $${yousellProduct.price} → $${shopifyPrice}`)
            }
          }
        }

        synced++
      } catch (err) {
        errors++
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`[shop-sync] Failed to sync ${prod.id}: ${msg}`)

        await supabase
          .from('shop_products')
          .update({
            sync_error: msg,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', prod.id)
      }
    }
  }

  // TODO: Add TikTok Shop and Amazon sync logic in Phase 2B and Phase 4

  console.log(`[shop-sync] Complete: synced=${synced}, errors=${errors}`)
  return { status: 'complete', synced, errors }
}
