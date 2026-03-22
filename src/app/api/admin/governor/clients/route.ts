/**
 * Governor Clients API — Client budget envelopes
 * GET  /api/admin/governor/clients — List all client envelopes
 * POST /api/admin/governor/clients — Adjust client quota/budget
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: envelopes, error } = await supabase
      .from('engine_budget_envelopes')
      .select(`
        id, client_id, plan_tier, period_start, period_end,
        global_cost_cap_usd, total_spent_usd, engine_allowances,
        alert_warn_percent, alert_throttle_percent, archived,
        created_at
      `)
      .eq('archived', false)
      .order('total_spent_usd', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with client names
    const clientIds = [...new Set((envelopes || []).map(e => e.client_id))];
    const { data: clients } = await supabase
      .from('clients')
      .select('id, business_name, email')
      .in('id', clientIds);

    const clientMap: Record<string, { name: string; email: string }> = {};
    if (clients) {
      for (const c of clients) {
        clientMap[c.id] = { name: c.business_name || 'Unknown', email: c.email || '' };
      }
    }

    const enriched = (envelopes || []).map(e => {
      const globalPct = Number(e.global_cost_cap_usd) > 0
        ? (Number(e.total_spent_usd) / Number(e.global_cost_cap_usd)) * 100
        : 0;
      return {
        ...e,
        clientName: clientMap[e.client_id]?.name || 'Unknown',
        clientEmail: clientMap[e.client_id]?.email || '',
        globalUtilizationPercent: Number(globalPct.toFixed(1)),
        status: globalPct >= 100 ? 'blocked' : globalPct >= 95 ? 'throttled' : globalPct >= 80 ? 'warning' : 'ok',
      };
    });

    return NextResponse.json({
      clients: enriched,
      total: enriched.length,
      atRisk: enriched.filter(e => e.status !== 'ok').length,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Clients API] Error:', error);
    return NextResponse.json({ error: 'Failed to load client data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { clientId, action, engineName, value } = body;

    if (!clientId || !action) {
      return NextResponse.json({ error: 'clientId and action required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'adjust_quota': {
        if (!engineName || value === undefined) {
          return NextResponse.json({ error: 'engineName and value required' }, { status: 400 });
        }
        // Update the engine allowance in the envelope
        const { data: envelope } = await supabase
          .from('engine_budget_envelopes')
          .select('id, engine_allowances')
          .eq('client_id', clientId)
          .eq('archived', false)
          .single();

        if (!envelope) {
          return NextResponse.json({ error: 'No active envelope' }, { status: 404 });
        }

        const allowances = (envelope.engine_allowances || {}) as Record<string, Record<string, unknown>>;
        if (allowances[engineName]) {
          allowances[engineName].maxOperations = value;
        }

        await supabase
          .from('engine_budget_envelopes')
          .update({ engine_allowances: allowances, updated_at: now })
          .eq('id', envelope.id);

        return NextResponse.json({ success: true, message: `Quota adjusted for ${engineName}` });
      }

      case 'adjust_budget': {
        if (value === undefined) {
          return NextResponse.json({ error: 'value required' }, { status: 400 });
        }
        await supabase
          .from('engine_budget_envelopes')
          .update({ global_cost_cap_usd: value, updated_at: now })
          .eq('client_id', clientId)
          .eq('archived', false);

        return NextResponse.json({ success: true, message: 'Budget cap adjusted' });
      }

      case 'reset_period': {
        const { renewBudgetEnvelope } = await import('@/lib/engines/governor/envelope-lifecycle');
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('client_id', clientId)
          .eq('status', 'active')
          .single();

        const plan = (sub?.plan || 'starter') as 'starter' | 'growth' | 'professional' | 'enterprise';
        const result = await renewBudgetEnvelope(
          clientId, plan, new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

        return NextResponse.json({ success: result.success, message: result.success ? 'Period reset' : result.error });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Clients API] Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
