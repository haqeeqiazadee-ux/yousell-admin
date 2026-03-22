import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/dashboard/analytics
 *
 * Client-facing analytics endpoint. Returns performance metrics
 * scoped to the authenticated client:
 * - Product allocation stats (total, by tier, by platform)
 * - Content generation stats (total, by type, credits used)
 * - Order/revenue summary (if orders exist)
 * - Usage tracking summary
 */
export async function GET(request: NextRequest) {
  try {
    const clientCtx = await authenticateClient(request)
    const admin = createAdminClient()
    const clientId = clientCtx.clientId

    // Run all queries in parallel
    const [
      allocationsRes,
      contentRes,
      ordersRes,
      creditsRes,
      channelsRes,
      usageRes,
    ] = await Promise.all([
      // Product allocations for this client
      admin
        .from('product_allocations')
        .select('id, product_id, status, created_at')
        .eq('client_id', clientId),

      // Content queue for this client
      admin
        .from('content_queue')
        .select('id, content_type, channel, status, requested_at, completed_at')
        .eq('client_id', clientId),

      // Orders for this client
      admin
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('client_id', clientId),

      // Content credits for current period
      admin
        .from('content_credits')
        .select('total_credits, used_credits, bonus_credits, period_start')
        .eq('client_id', clientId)
        .order('period_start', { ascending: false })
        .limit(1)
        .single(),

      // Connected channels
      admin
        .from('connected_channels')
        .select('channel_type, status, connected_at')
        .eq('client_id', clientId)
        .eq('status', 'active'),

      // Usage tracking
      admin
        .from('usage_tracking')
        .select('resource, action, count')
        .eq('client_id', clientId),
    ])

    const allocations = allocationsRes.data || []
    const content = contentRes.data || []
    const orders = ordersRes.data || []
    const credits = creditsRes.data
    const channels = channelsRes.data || []
    const usage = usageRes.data || []

    // Product allocation stats
    const allocationStats = {
      total: allocations.length,
      active: allocations.filter(a => a.status === 'active' || a.status === 'allocated').length,
      deployed: allocations.filter(a => a.status === 'deployed').length,
    }

    // Content stats
    const contentStats = {
      total: content.length,
      generated: content.filter(c => c.status === 'generated').length,
      published: content.filter(c => c.status === 'published').length,
      failed: content.filter(c => c.status === 'failed').length,
      byType: {} as Record<string, number>,
    }
    for (const c of content) {
      contentStats.byType[c.content_type] = (contentStats.byType[c.content_type] || 0) + 1
    }

    // Credits
    const creditInfo = credits
      ? {
          total: credits.total_credits + credits.bonus_credits,
          used: credits.used_credits,
          remaining: (credits.total_credits + credits.bonus_credits) - credits.used_credits,
          periodStart: credits.period_start,
        }
      : null

    // Revenue stats
    const revenueStats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      fulfilledOrders: orders.filter(o => o.status === 'fulfilled' || o.status === 'delivered').length,
    }

    // Connected channels
    const connectedChannels = channels.map(c => ({
      type: c.channel_type,
      connectedAt: c.connected_at,
    }))

    // Usage summary
    const usageSummary: Record<string, number> = {}
    for (const u of usage) {
      const key = `${u.resource}.${u.action}`
      usageSummary[key] = (usageSummary[key] || 0) + (u.count || 1)
    }

    return NextResponse.json({
      plan: clientCtx.subscription?.plan || 'none',
      allocations: allocationStats,
      content: contentStats,
      credits: creditInfo,
      revenue: revenueStats,
      connectedChannels,
      usage: usageSummary,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
