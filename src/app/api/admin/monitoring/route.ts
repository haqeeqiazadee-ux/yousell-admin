/**
 * Monitoring API — Real-time system health and metrics
 * GET /api/admin/monitoring
 *
 * Returns engine health, error rates, latency, queue depths,
 * and system resource status for the monitoring dashboard.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

interface EngineHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastActivity: string | null;
  operationsLast24h: number;
  errorRate: number;
  avgLatencyMs: number;
  costLast24h: number;
}

interface QueueMetrics {
  name: string;
  active: number;
  waiting: number;
  failed: number;
  completed: number;
}

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    // Fetch usage data from last 24h
    const { data: usage } = await supabase
      .from('engine_usage_ledger')
      .select('engine_name, cost_usd, success, latency_ms, created_at')
      .gte('created_at', oneDayAgo);

    const entries = usage || [];

    // Aggregate per engine
    const engineMap: Record<string, {
      ops: number; errors: number; totalLatency: number; cost: number; lastActivity: string | null;
    }> = {};

    for (const entry of entries) {
      const name = entry.engine_name;
      if (!engineMap[name]) {
        engineMap[name] = { ops: 0, errors: 0, totalLatency: 0, cost: 0, lastActivity: null };
      }
      const e = engineMap[name];
      e.ops++;
      if (!entry.success) e.errors++;
      e.totalLatency += (entry.latency_ms || 0);
      e.cost += (entry.cost_usd || 0);
      if (!e.lastActivity || entry.created_at > e.lastActivity) {
        e.lastActivity = entry.created_at;
      }
    }

    // Build engine health array
    const engines: EngineHealth[] = Object.entries(engineMap).map(([name, stats]) => ({
      name,
      status: stats.errors / Math.max(stats.ops, 1) > 0.5 ? 'down'
        : stats.errors / Math.max(stats.ops, 1) > 0.1 ? 'degraded'
        : 'healthy',
      lastActivity: stats.lastActivity,
      operationsLast24h: stats.ops,
      errorRate: Math.round((stats.errors / Math.max(stats.ops, 1)) * 100),
      avgLatencyMs: Math.round(stats.totalLatency / Math.max(stats.ops, 1)),
      costLast24h: Math.round(stats.cost * 1000) / 1000,
    }));

    // Sort by error rate descending (worst first)
    engines.sort((a, b) => b.errorRate - a.errorRate);

    // Recent errors (last hour)
    const recentErrors = entries
      .filter(e => !e.success && e.created_at >= oneHourAgo)
      .slice(0, 20)
      .map(e => ({
        engine: e.engine_name,
        timestamp: e.created_at,
        costUsd: e.cost_usd,
      }));

    // System-level aggregates
    const totalOps = entries.length;
    const totalErrors = entries.filter(e => !e.success).length;
    const totalCost = entries.reduce((sum, e) => sum + (e.cost_usd || 0), 0);

    // Budget envelope status
    const { data: envelopes } = await supabase
      .from('engine_budget_envelopes')
      .select('client_id, global_cost_cap_usd, total_spent_usd, alert_warn_percent, alert_throttle_percent')
      .eq('archived', false);

    const budgetAlerts = (envelopes || [])
      .filter(e => {
        const pct = (e.total_spent_usd / Math.max(e.global_cost_cap_usd, 0.01)) * 100;
        return pct >= (e.alert_warn_percent || 80);
      })
      .map(e => ({
        clientId: e.client_id,
        spentPct: Math.round((e.total_spent_usd / Math.max(e.global_cost_cap_usd, 0.01)) * 100),
        capUsd: e.global_cost_cap_usd,
        spentUsd: Math.round(e.total_spent_usd * 100) / 100,
      }));

    return NextResponse.json({
      timestamp: now.toISOString(),
      system: {
        totalOperations24h: totalOps,
        totalErrors24h: totalErrors,
        errorRate: totalOps > 0 ? Math.round((totalErrors / totalOps) * 100) : 0,
        totalCost24h: Math.round(totalCost * 1000) / 1000,
      },
      engines,
      recentErrors,
      budgetAlerts,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Monitoring API] Error:', error);
    return NextResponse.json({ error: 'Failed to load monitoring data' }, { status: 500 });
  }
}
