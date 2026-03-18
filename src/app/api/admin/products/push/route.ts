import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth/admin-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    await authenticateAdmin(request)
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { product_id, client_id, channel } = body

    if (!product_id || !client_id || !channel) {
      return NextResponse.json(
        { error: 'product_id, client_id, and channel are required' },
        { status: 400 },
      )
    }

    if (!['shopify', 'tiktok', 'amazon'].includes(channel)) {
      return NextResponse.json(
        { error: 'channel must be shopify, tiktok, or amazon' },
        { status: 400 },
      )
    }

    // Verify product exists
    const { data: product, error: productErr } = await supabase
      .from('products')
      .select('id, title')
      .eq('id', product_id)
      .single()

    if (productErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Verify product is allocated to the client
    const { data: allocation } = await supabase
      .from('product_allocations')
      .select('id')
      .eq('product_id', product_id)
      .eq('client_id', client_id)
      .limit(1)
      .single()

    if (!allocation) {
      return NextResponse.json(
        { error: 'Product is not allocated to this client' },
        { status: 400 },
      )
    }

    // Check client has a connected channel
    const { data: channelConn } = await supabase
      .from('connected_channels')
      .select('id')
      .eq('client_id', client_id)
      .eq('channel_type', channel)
      .limit(1)
      .single()

    const hasChannel = !!channelConn

    // Check for existing push record
    const { data: existing } = await supabase
      .from('shop_products')
      .select('id, push_status')
      .eq('product_id', product_id)
      .eq('client_id', client_id)
      .eq('channel', channel)
      .limit(1)
      .single()

    if (existing) {
      return NextResponse.json({
        shop_product: existing,
        message: `Product already has push status: ${existing.push_status}`,
      })
    }

    // Create shop_products record
    const { data: shopProduct, error: insertErr } = await supabase
      .from('shop_products')
      .insert({
        product_id,
        client_id,
        channel,
        push_status: hasChannel ? 'pending' : 'pending',
        metadata: {
          has_channel_connection: hasChannel,
          product_title: product.title,
        },
      })
      .select()
      .single()

    if (insertErr) {
      console.error('[Push] Insert error:', insertErr)
      return NextResponse.json({ error: 'Failed to create push record' }, { status: 500 })
    }

    // If BullMQ backend is available, try to enqueue push job
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    try {
      await fetch(`${backendUrl}/api/${channel}/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BACKEND_API_KEY || ''}`,
        },
        body: JSON.stringify({ product_id, client_id, shop_product_id: shopProduct.id }),
        signal: AbortSignal.timeout(5000),
      })
    } catch {
      // Backend not available — product stays in pending status for manual push
      console.log('[Push] Backend not reachable — product queued as pending')
    }

    return NextResponse.json({ shop_product: shopProduct }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — Fetch push status for products
export async function GET(request: NextRequest) {
  try {
    await authenticateAdmin(request)
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const clientId = searchParams.get('client_id')

    let query = supabase.from('shop_products').select('*')

    if (productId) query = query.eq('product_id', productId)
    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ shop_products: data || [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
