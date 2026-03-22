/**
 * Governor Fleet API — Engine fleet overview
 * GET /api/admin/governor/fleet
 *
 * Returns all engines with status, health, usage stats, and cost data.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Get usage stats per engine (current period)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: usageStats } = await supabase
      .from('engine_usage_ledger')
      .select('engine_name, cost_usd, success')
      .gte('created_at', thirtyDaysAgo);

    // Aggregate per engine
    const engineStats: Record<string, { operations: number; costUSD: number; failures: number }> = {};
    if (usageStats) {
      for (const entry of usageStats) {
        const name = entry.engine_name;
        if (!engineStats[name]) engineStats[name] = { operations: 0, costUSD: 0, failures: 0 };
        engineStats[name].operations++;
        engineStats[name].costUSD += Number(entry.cost_usd) || 0;
        if (!entry.success) engineStats[name].failures++;
      }
    }

    // Get active swaps
    const { data: swaps } = await supabase
      .from('engine_swaps')
      .select('source_engine, target_engine')
      .eq('active', true);

    const swapMap: Record<string, string> = {};
    if (swaps) {
      for (const s of swaps) swapMap[s.source_engine] = s.target_engine;
    }

    // Get cost manifests
    const { data: manifests } = await supabase
      .from('engine_cost_manifests')
      .select('engine_name, operations, monthly_fixed_cost_usd');

    const manifestMap: Record<string, { operationCount: number; monthlyFixed: number }> = {};
    if (manifests) {
      for (const m of manifests) {
        const ops = Array.isArray(m.operations) ? m.operations.length : 0;
        manifestMap[m.engine_name] = {
          operationCount: ops,
          monthlyFixed: Number(m.monthly_fixed_cost_usd) || 0,
        };
      }
    }

    // Build fleet response
    const { ENGINE_COST_MANIFESTS } = await import('@/lib/engines/governor/cost-manifests');
    const engines = Object.keys(ENGINE_COST_MANIFESTS).map(name => {
      const stats = engineStats[name] || { operations: 0, costUSD: 0, failures: 0 };
      const manifest = manifestMap[name];
      return {
        name,
        status: 'idle', // Would come from EngineRegistry in production
        healthy: stats.failures === 0 || stats.failures / Math.max(stats.operations, 1) < 0.1,
        operations: stats.operations,
        costUSD: Number(stats.costUSD.toFixed(4)),
        failures: stats.failures,
        swappedTo: swapMap[name] || null,
        manifestOperations: manifest?.operationCount || 0,
        monthlyFixedCost: manifest?.monthlyFixed || 0,
      };
    });

    return NextResponse.json({
      engines,
      totalEngines: engines.length,
      totalOperations: engines.reduce((sum, e) => sum + e.operations, 0),
      totalCostUSD: Number(engines.reduce((sum, e) => sum + e.costUSD, 0).toFixed(4)),
      activeSwaps: Object.keys(swapMap).length,
      period: { start: thirtyDaysAgo, end: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[Governor Fleet API] Error:', error);
    return NextResponse.json({ error: 'Failed to load fleet data' }, { status: 500 });
  }
}
