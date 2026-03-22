/**
 * Batch push multiple products to a client's connected store.
 *
 * POST /api/dashboard/shop/push-batch
 * Body: { productIds: string[], channel: 'shopify' | 'tiktok' | 'amazon' }
 *
 * Creates shop_products records and enqueues push jobs for each.
 * Max 25 products per batch to prevent abuse.
 * @engine store-integration
 */
import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient, requireEngine } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_BATCH_SIZE = 25

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateClient(request)
    requireEngine(client, 'store_integration')

    const { productIds, channel } = await request.json()

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'productIds must be a non-empty array' }, { status: 400 })
    }

    if (productIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: `Maximum ${MAX_BATCH_SIZE} products per batch` }, { status: 400 })
    }

    if (!['shopify', 'tiktok', 'amazon'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify client has an active connection
    const { data: connection } = await admin
      .from('connected_channels')
      .select('id, status')
      .eq('client_id', client.clientId)
      .eq('channel_type', channel)
      .eq('status', 'active')
      .single()

    if (!connection) {
      return NextResponse.json({
        error: `No active ${channel} connection`,
        needsConnection: true,
      }, { status: 422 })
    }

    // Verify all products exist
    const { data: products } = await admin
      .from('products')
      .select('id')
      .in('id', productIds)

    if (!products) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    const validIds = new Set(products.map(p => p.id))
    const results: Array<{ productId: string; shopProductId: string | null; status: string }> = []

    const backendUrl = process.env.RAILWAY_BACKEND_URL || process.env.NEXT_PUBLIC_RAILWAY_API_URL

    for (const productId of productIds) {
      if (!validIds.has(productId)) {
        results.push({ productId, shopProductId: null, status: 'not_found' })
        continue
      }

      // Check existing
      const { data: existing } = await admin
        .from('shop_products')
        .select('id, push_status')
        .eq('product_id', productId)
        .eq('client_id', client.clientId)
        .eq('channel', channel)
        .single()

      if (existing && existing.push_status === 'live') {
        results.push({ productId, shopProductId: existing.id, status: 'already_live' })
        continue
      }

      let shopProductId: string

      if (existing) {
        await admin
          .from('shop_products')
          .update({ push_status: 'pending', sync_error: null })
          .eq('id', existing.id)
        shopProductId = existing.id
      } else {
        const { data: newRecord } = await admin
          .from('shop_products')
          .insert({
            product_id: productId,
            client_id: client.clientId,
            channel,
            push_status: 'pending',
          })
          .select('id')
          .single()

        if (!newRecord) {
          results.push({ productId, shopProductId: null, status: 'insert_failed' })
          continue
        }
        shopProductId = newRecord.id
      }

      // Enqueue push job
      if (backendUrl) {
        try {
          await fetch(`${backendUrl}/api/queue/push-to-${channel}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Secret': process.env.RAILWAY_API_SECRET || '',
            },
            body: JSON.stringify({
              product_id: productId,
              client_id: client.clientId,
              shop_product_id: shopProductId,
              userId: client.userId,
            }),
            signal: AbortSignal.timeout(10000),
          })
        } catch {
          // Job can be retried — don't fail the batch
        }
      }

      results.push({ productId, shopProductId, status: 'pending' })
    }

    const queued = results.filter(r => r.status === 'pending').length
    const skipped = results.filter(r => r.status === 'already_live').length

    return NextResponse.json({
      channel,
      total: productIds.length,
      queued,
      skipped,
      results,
    })
  } catch (err) {
    console.error('[shop/push-batch] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401
      : message.includes('Not a client') ? 403
      : message.includes('not included') ? 403
      : 500
    return NextResponse.json({ error: message }, { status })
  }
}
