/**
 * Smart UX / AI Features API — Feature toggles, A/B tests, personalization
 * GET   /api/admin/smart-ux — List features, A/B tests, personalization rules
 * POST  /api/admin/smart-ux — Toggle feature, create A/B test, create rule
 * PATCH /api/admin/smart-ux — Update feature config, A/B test split
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = request.nextUrl;
    const section = searchParams.get('section');

    if (section === 'features') {
      const { data, error } = await supabase
        .from('smart_ux_features')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ features: data || [] });
    }

    if (section === 'tests') {
      const status = searchParams.get('status');
      let query = supabase
        .from('ab_tests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50);

      if (status && status !== 'all') query = query.eq('status', status);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ tests: data || [], total: count || 0 });
    }

    if (section === 'rules') {
      const segment = searchParams.get('segment');
      let query = supabase
        .from('personalization_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (segment && segment !== 'all') query = query.eq('segment', segment);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ rules: data || [], total: (data || []).length });
    }

    // Default: return everything
    const [featuresRes, testsRes, rulesRes] = await Promise.all([
      supabase.from('smart_ux_features').select('*').order('created_at', { ascending: true }),
      supabase.from('ab_tests').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(20),
      supabase.from('personalization_rules').select('*').order('priority', { ascending: false }),
    ]);

    const features = featuresRes.data || [];
    const tests = testsRes.data || [];

    return NextResponse.json({
      features,
      tests,
      totalTests: testsRes.count || 0,
      rules: rulesRes.data || [],
      metrics: {
        enabledFeatures: features.filter(f => f.enabled).length,
        totalFeatures: features.length,
        runningTests: tests.filter(t => t.status === 'running').length,
        completedTests: tests.filter(t => t.status === 'completed').length,
        activeRules: (rulesRes.data || []).filter(r => r.active).length,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Smart UX API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load smart UX data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'toggle_feature') {
      const { featureKey, enabled } = body;
      if (!featureKey) return NextResponse.json({ error: 'featureKey is required' }, { status: 400 });

      const { error } = await supabase
        .from('smart_ux_features')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('feature_key', featureKey);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === 'create_test') {
      const { name, featureKey, variantA, variantAConfig, variantB, variantBConfig, trafficSplitPct } = body;
      if (!name || !featureKey) {
        return NextResponse.json({ error: 'name and featureKey are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('ab_tests')
        .insert({
          name,
          feature_key: featureKey,
          variant_a: variantA || 'Control',
          variant_a_config: variantAConfig || {},
          variant_b: variantB || 'Treatment',
          variant_b_config: variantBConfig || {},
          traffic_split_pct: trafficSplitPct || 50,
          status: 'draft',
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, test: data });
    }

    if (action === 'update_test_status') {
      const { id, status } = body;
      if (!id || !status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 });

      const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'running') updateData.started_at = new Date().toISOString();
      if (status === 'completed') updateData.completed_at = new Date().toISOString();

      const { error } = await supabase.from('ab_tests').update(updateData).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === 'create_rule') {
      const { name, segment, featureKey, conditions, ruleAction, priority } = body;
      if (!name || !segment || !featureKey) {
        return NextResponse.json({ error: 'name, segment, and featureKey are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('personalization_rules')
        .insert({
          name,
          segment,
          feature_key: featureKey,
          conditions: conditions || {},
          action: ruleAction || {},
          priority: priority || 0,
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
        .from('personalization_rules')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Smart UX API] POST error:', error);
    return NextResponse.json({ error: 'Failed to process smart UX action' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, table, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    if (table === 'feature') {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.config !== undefined) updateData.config = updates.config;
      if (updates.description !== undefined) updateData.description = updates.description;

      const { error } = await supabase.from('smart_ux_features').update(updateData).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (table === 'test') {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.trafficSplitPct !== undefined) updateData.traffic_split_pct = updates.trafficSplitPct;
      if (updates.variantAConfig !== undefined) updateData.variant_a_config = updates.variantAConfig;
      if (updates.variantBConfig !== undefined) updateData.variant_b_config = updates.variantBConfig;

      const { error } = await supabase.from('ab_tests').update(updateData).eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'table must be "feature" or "test"' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Smart UX API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update smart UX config' }, { status: 500 });
  }
}
