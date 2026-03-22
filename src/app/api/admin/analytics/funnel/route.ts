import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateAdmin } from '@/lib/auth/admin-api-auth'

/**
 * GET /api/admin/analytics/funnel
 *
 * Product funnel metrics — tracks how products flow through the platform:
 * Discovered → Scored → Allocated → Content Created → Deployed → Orders Received
 *
 * Also includes conversion rates between stages and breakdowns by platform/tier.
 */
export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const admin = createAdminClient()

  // Parallel queries for all funnel stages
  const [
    productsRes,
    scoredRes,
    allocatedRes,
    contentRes,
    deployedRes,
    ordersRes,
  ] = await Promise.all([
    // Stage 1: Discovered (all products)
    admin
      .from('products')
      .select('id, platform, final_score, tier, created_at')
      .order('created_at', { ascending: false })
      .limit(10000),

    // Stage 2: Scored (have a final_score)
    admin
      .from('products')
      .select('id')
      .not('final_score', 'is', null)
      .gt('final_score', 0),

    // Stage 3: Allocated to clients
    admin
      .from('product_allocations')
      .select('id, product_id, client_id, status, created_at'),

    // Stage 4: Content created
    admin
      .from('content_queue')
      .select('id, product_id, status, content_type'),

    // Stage 5: Deployed to stores
    admin
      .from('shop_products')
      .select('id, product_id, channel, push_status'),

    // Stage 6: Orders received
    admin
      .from('orders')
      .select('id, product_id, total_amount, status'),
  ])

  const products = productsRes.data || []
  const scored = scoredRes.data || []
  const allocated = allocatedRes.data || []
  const contentItems = contentRes.data || []
  const deployed = deployedRes.data || []
  const orders = ordersRes.data || []

  // Funnel counts
  const funnel = {
    discovered: products.length,
    scored: scored.length,
    allocated: new Set(allocated.map(a => a.product_id)).size,
    contentCreated: new Set(contentItems.map(c => c.product_id).filter(Boolean)).size,
    deployed: new Set(deployed.filter(d => d.push_status === 'live').map(d => d.product_id)).size,
    ordersReceived: new Set(orders.map(o => o.product_id).filter(Boolean)).size,
  }

  // Conversion rates
  const conversions = {
    discoveredToScored: funnel.discovered > 0 ? (funnel.scored / funnel.discovered * 100).toFixed(1) : '0',
    scoredToAllocated: funnel.scored > 0 ? (funnel.allocated / funnel.scored * 100).toFixed(1) : '0',
    allocatedToContent: funnel.allocated > 0 ? (funnel.contentCreated / funnel.allocated * 100).toFixed(1) : '0',
    contentToDeployed: funnel.contentCreated > 0 ? (funnel.deployed / funnel.contentCreated * 100).toFixed(1) : '0',
    deployedToOrders: funnel.deployed > 0 ? (funnel.ordersReceived / funnel.deployed * 100).toFixed(1) : '0',
    overallConversion: funnel.discovered > 0 ? (funnel.ordersReceived / funnel.discovered * 100).toFixed(2) : '0',
  }

  // Breakdown by platform
  const platformCounts: Record<string, { discovered: number; scored: number }> = {}
  for (const p of products) {
    const platform = p.platform || 'unknown'
    if (!platformCounts[platform]) platformCounts[platform] = { discovered: 0, scored: 0 }
    platformCounts[platform].discovered++
    if (p.final_score != null && p.final_score > 0) platformCounts[platform].scored++
  }

  // Breakdown by tier
  const tierCounts: Record<string, number> = {}
  for (const p of products) {
    const tier = p.tier || (p.final_score >= 80 ? 'HOT' : p.final_score >= 60 ? 'WARM' : p.final_score >= 40 ? 'WATCH' : 'COLD')
    tierCounts[tier] = (tierCounts[tier] || 0) + 1
  }

  // Content production metrics
  const contentMetrics = {
    total: contentItems.length,
    generated: contentItems.filter(c => c.status === 'generated').length,
    published: contentItems.filter(c => c.status === 'published').length,
    failed: contentItems.filter(c => c.status === 'failed').length,
    byType: {} as Record<string, number>,
  }
  for (const c of contentItems) {
    contentMetrics.byType[c.content_type] = (contentMetrics.byType[c.content_type] || 0) + 1
  }

  // Revenue from orders
  const revenue = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    fulfilled: orders.filter(o => o.status === 'fulfilled' || o.status === 'delivered').length,
  }

  return NextResponse.json({
    funnel,
    conversions,
    platformBreakdown: platformCounts,
    tierBreakdown: tierCounts,
    contentMetrics,
    revenue,
  })
}
