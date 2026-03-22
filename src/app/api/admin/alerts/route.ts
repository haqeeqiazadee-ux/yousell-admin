/**
 * Alerts API — System alerts with threshold evaluation
 * GET  /api/admin/alerts — List alerts (optionally trigger evaluation)
 * POST /api/admin/alerts — Acknowledge or dismiss alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { evaluateAlerts } from '@/lib/alerting';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = request.nextUrl;
    const evaluate = searchParams.get('evaluate') === 'true';
    const severity = searchParams.get('severity');
    const acknowledged = searchParams.get('acknowledged');

    // Optionally run evaluation first
    if (evaluate) {
      await evaluateAlerts();
    }

    // Fetch recent alerts
    let query = supabase
      .from('system_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (severity) query = query.eq('severity', severity);
    if (acknowledged === 'false') query = query.eq('acknowledged', false);
    if (acknowledged === 'true') query = query.eq('acknowledged', true);

    const { data: alerts, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const unacknowledged = (alerts || []).filter(a => !a.acknowledged).length;

    return NextResponse.json({
      alerts: alerts || [],
      total: (alerts || []).length,
      unacknowledged,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Alerts API] Error:', error);
    return NextResponse.json({ error: 'Failed to load alerts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action, alertId, alertIds } = body;

    if (action === 'acknowledge' && alertId) {
      await supabase
        .from('system_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);
      return NextResponse.json({ success: true });
    }

    if (action === 'acknowledge_all' && alertIds?.length) {
      await supabase
        .from('system_alerts')
        .update({ acknowledged: true })
        .in('id', alertIds);
      return NextResponse.json({ success: true, count: alertIds.length });
    }

    if (action === 'dismiss' && alertId) {
      await supabase
        .from('system_alerts')
        .delete()
        .eq('id', alertId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Alerts API] Error:', error);
    return NextResponse.json({ error: 'Failed to process alert action' }, { status: 500 });
  }
}
