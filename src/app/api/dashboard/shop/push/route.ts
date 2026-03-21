/**
 * Push a single product to a client's connected store.
 *
 * POST /api/dashboard/shop/push
 * Body: { productId, channel: 'shopify' | 'tiktok' | 'amazon' }
 *
 * Creates a shop_products record and enqueues a push job.
 * @engine store-integration
 */
import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient, requireEngine } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateClient(request)
    requireEngine(client, 'store_integration')

    const { productId, channel } = await request.json()

    if (!productId || !channel) {
      return NextResponse.json({ error: 'productId and channel are required' }, { status: 400 })
    }

    if (!['shopify', 'tiktok', 'amazon'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel. Must be shopify, tiktok, or amazon' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify product exists and client has access
    const { data: product, error: productErr } = await admin
      .from('products')
      .select('id, title')
      .eq('id', productId)
      .single()

    if (productErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Verify client has an active connection for this channel
    const { data: connection } = await admin
      .from('connected_channels')
      .select('id, status')
      .eq('client_id', client.clientId)
      .eq('channel_type', channel)
      .eq('status', 'active')
      .single()

    if (!connection) {
      return NextResponse.json({
        error: `No active ${channel} connection. Connect your store first.`,
        needsConnection: true,
      }, { status: 422 })
    }

    // Check for existing shop_product to avoid duplicates
    const { data: existing } = await admin
      .from('shop_products')
      .select('id, push_status')
      .eq('product_id', productId)
      .eq('client_id', client.clientId)
      .eq('channel', channel)
      .single()

    if (existing && existing.push_status === 'live') {
      return NextResponse.json({
        error: 'Product is already live on this channel',
        shopProductId: existing.id,
        status: 'already_live',
      }, { status: 409 })
    }

    // Create or update shop_products record
    let shopProductId: string

    if (existing) {
      // Re-push: update status to pending
      await admin
        .from('shop_products')
        .update({ push_status: 'pending', sync_error: null })
        .eq('id', existing.id)
      shopProductId = existing.id
    } else {
      const { data: newRecord, error: insertErr } = await admin
        .from('shop_products')
        .insert({
          product_id: productId,
          client_id: client.clientId,
          channel,
          push_status: 'pending',
        })
        .select('id')
        .single()

      if (insertErr || !newRecord) {
        return NextResponse.json({ error: 'Failed to create shop product record' }, { status: 500 })
      }
      shopProductId = newRecord.id
    }

    // Enqueue push job via Railway backend API
    const backendUrl = process.env.RAILWAY_BACKEND_URL || process.env.NEXT_PUBLIC_RAILWAY_API_URL
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
      } catch (queueErr) {
        console.error('[shop/push] Failed to enqueue job:', queueErr)
        // Don't fail the request — the record is created, job can be retried
      }
    }

    return NextResponse.json({
      shopProductId,
      productId,
      channel,
      status: 'pending',
      message: `Product queued for push to ${channel}`,
    })
  } catch (err) {
    console.error('[shop/push] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401
      : message.includes('Not a client') ? 403
      : message.includes('not included') ? 403
      : 500
    return NextResponse.json({ error: message }, { status })
  }
}
