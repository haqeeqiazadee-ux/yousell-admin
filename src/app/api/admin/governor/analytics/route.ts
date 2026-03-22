/**
 * Governor Analytics API — Cost analytics and usage trends
 * GET /api/admin/governor/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = request.nextUrl;
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Total usage in period
    const { data: usage } = await supabase
      .from('engine_usage_ledger')
      .select('engine_name, operation, cost_usd, success, created_at')
      .gte('created_at', since);

    const entries = usage || [];

    // Per-engine aggregation
    const perEngine: Record<string, { operations: number; costUSD: number; failures: number }> = {};
    let totalCost = 0;
    let totalOps = 0;
    let totalFailures = 0;

    for (const e of entries) {
      const name = e.engine_name;
      if (!perEngine[name]) perEngine[name] = { operations: 0, costUSD: 0, failures: 0 };
      perEngine[name].operations++;
      perEngine[name].costUSD += Number(e.cost_usd) || 0;
      if (!e.success) perEngine[name].failures++;
      totalCost += Number(e.cost_usd) || 0;
      totalOps++;
      if (!e.success) totalFailures++;
    }

    // Top 10 costliest clients
    const clientCosts: Record<string, number> = {};
    const { data: clientUsage } = await supabase
      .from('engine_usage_ledger')
      .select('client_id, cost_usd')
      .gte('created_at', since);

    if (clientUsage) {
      for (const e of clientUsage) {
        clientCosts[e.client_id] = (clientCosts[e.client_id] || 0) + (Number(e.cost_usd) || 0);
      }
    }

    const topClients = Object.entries(clientCosts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([clientId, cost]) => ({ clientId, costUSD: Number(cost.toFixed(4)) }));

    // Daily cost trend
    const dailyCosts: Record<string, number> = {};
    for (const e of entries) {
      const day = e.created_at.slice(0, 10);
      dailyCosts[day] = (dailyCosts[day] || 0) + (Number(e.cost_usd) || 0);
    }

    const dailyTrend = Object.entries(dailyCosts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, cost]) => ({ date, costUSD: Number(cost.toFixed(4)) }));

    return NextResponse.json({
      period: { days, since, until: new Date().toISOString() },
      totals: {
        operations: totalOps,
        costUSD: Number(totalCost.toFixed(4)),
        failures: totalFailures,
        successRate: totalOps > 0 ? Number(((1 - totalFailures / totalOps) * 100).toFixed(1)) : 100,
      },
      perEngine: Object.entries(perEngine)
        .map(([name, stats]) => ({ name, ...stats, costUSD: Number(stats.costUSD.toFixed(4)) }))
        .sort((a, b) => b.costUSD - a.costUSD),
      topClients,
      dailyTrend,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Analytics API] Error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
