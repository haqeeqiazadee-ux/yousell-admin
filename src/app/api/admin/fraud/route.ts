/**
 * Fraud & Security API — Transaction monitoring & rule management
 * GET   /api/admin/fraud — List flagged transactions, rules, metrics
 * POST  /api/admin/fraud — Create/update rules, take action on flags
 * PATCH /api/admin/fraud — Update rule thresholds
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = request.nextUrl;
    const section = searchParams.get('section'); // rules | flags | metrics

    if (section === 'rules') {
      const { data, error } = await supabase
        .from('fraud_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ rules: data || [], total: (data || []).length });
    }

    if (section === 'flags') {
      const status = searchParams.get('status');
      const riskLevel = searchParams.get('riskLevel');
      const limit = parseInt(searchParams.get('limit') || '50');

      let query = supabase
        .from('fraud_flags')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status && status !== 'all') query = query.eq('status', status);
      if (riskLevel && riskLevel !== 'all') query = query.eq('risk_level', riskLevel);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ flags: data || [], total: count || 0 });
    }

    // Default: return everything with metrics
    const [rulesRes, flagsRes] = await Promise.all([
      supabase.from('fraud_rules').select('*').order('created_at', { ascending: false }),
      supabase.from('fraud_flags').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(100),
    ]);

    const flags = flagsRes.data || [];
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentFlags = flags.filter(f => new Date(f.created_at) >= last24h);

    return NextResponse.json({
      rules: rulesRes.data || [],
      flags,
      totalFlags: flagsRes.count || 0,
      metrics: {
        flagged24h: recentFlags.length,
        blocked: flags.filter(f => f.status === 'blocked').length,
        cleared: flags.filter(f => f.status === 'cleared').length,
        escalated: flags.filter(f => f.status === 'escalated').length,
        fraudRate: flags.length > 0
          ? ((flags.filter(f => f.status === 'blocked').length / flags.length) * 100).toFixed(1)
          : '0',
        protectedRevenue: flags
          .filter(f => f.status === 'blocked')
          .reduce((sum, f) => sum + (f.transaction_amount || 0), 0),
        avgRiskScore: flags.length > 0
          ? Math.round(flags.reduce((sum, f) => sum + (f.risk_score || 0), 0) / flags.length)
          : 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Fraud API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load fraud data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'create_rule') {
      const { name, ruleType, description, threshold, severity, ruleAction } = body;
      if (!name || !ruleType) {
        return NextResponse.json({ error: 'name and ruleType are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('fraud_rules')
        .insert({
          name,
          rule_type: ruleType,
          description: description || '',
          threshold: threshold || {},
          severity: severity || 'medium',
          action: ruleAction || 'flag',
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, rule: data });
    }

    if (action === 'toggle_rule') {
      const { id, active } = body;
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

      const { error } = await supabase
        .from('fraud_rules')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === 'take_action') {
      const { flagId, flagAction, notes, actionBy } = body;
      if (!flagId || !flagAction) {
        return NextResponse.json({ error: 'flagId and flagAction are required' }, { status: 400 });
      }

      if (!['clear', 'block', 'escalate'].includes(flagAction)) {
        return NextResponse.json({ error: 'flagAction must be clear, block, or escalate' }, { status: 400 });
      }

      const statusMap: Record<string, string> = { clear: 'cleared', block: 'blocked', escalate: 'escalated' };

      const { error } = await supabase
        .from('fraud_flags')
        .update({
          status: statusMap[flagAction],
          action_taken_by: actionBy || 'admin',
          action_taken_at: new Date().toISOString(),
          action_notes: notes || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', flagId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: `Transaction ${statusMap[flagAction]}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Fraud API] POST error:', error);
    return NextResponse.json({ error: 'Failed to process fraud action' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.threshold !== undefined) updateData.threshold = updates.threshold;
    if (updates.severity !== undefined) updateData.severity = updates.severity;
    if (updates.ruleAction !== undefined) updateData.action = updates.ruleAction;

    const { error } = await supabase.from('fraud_rules').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Fraud API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update fraud rule' }, { status: 500 });
  }
}
