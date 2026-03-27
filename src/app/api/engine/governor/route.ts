/**
 * Governor Health & Status API
 * GET /api/engine/governor — Returns Governor system health
 *
 * @engine engine-governor
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Check Governor tables exist and are accessible
    const checks = await Promise.allSettled([
      supabase.from('engine_cost_manifests').select('id', { count: 'exact', head: true }),
      supabase.from('engine_budget_envelopes').select('id', { count: 'exact', head: true }).eq('archived', false),
      supabase.from('engine_usage_ledger').select('id', { count: 'exact', head: true }),
      supabase.from('engine_swaps').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('governor_overrides').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('governor_ai_decisions').select('id', { count: 'exact', head: true }),
    ]);

    const tableNames = [
      'engine_cost_manifests',
      'engine_budget_envelopes',
      'engine_usage_ledger',
      'engine_swaps',
      'governor_overrides',
      'governor_ai_decisions',
    ];

    const tables: Record<string, { status: string; count: number }> = {};
    let allHealthy = true;

    checks.forEach((result, i) => {
      if (result.status === 'fulfilled' && !result.value.error) {
        tables[tableNames[i]] = { status: 'ok', count: result.value.count || 0 };
      } else {
        tables[tableNames[i]] = { status: 'error', count: 0 };
        allHealthy = false;
      }
    });

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      version: '1.0',
      tables,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Governor API] Health check error:', error);
    return NextResponse.json(
      { status: 'error', error: 'Governor health check failed' },
      { status: 500 }
    );
  }
}
