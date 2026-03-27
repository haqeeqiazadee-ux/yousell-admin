/**
 * Dynamic Pricing API — AI pricing intelligence & competitor tracking
 * GET   /api/admin/pricing — List suggestions, competitor prices, rules, history
 * POST  /api/admin/pricing — Apply suggestion, create/update rules, trigger scan
 * PATCH /api/admin/pricing — Update strategy settings
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

    if (section === 'strategies') {
      const { data, error } = await supabase
        .from('pricing_strategies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ strategies: data || [] });
    }

    if (section === 'suggestions') {
      const applied = searchParams.get('applied');
      let query = supabase
        .from('pricing_suggestions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100);

      if (applied === 'true') query = query.eq('applied', true);
      if (applied === 'false') query = query.eq('applied', false);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ suggestions: data || [], total: count || 0 });
    }

    if (section === 'competitors') {
      const { data, error } = await supabase
        .from('competitor_prices')
        .select('*')
        .order('last_checked_at', { ascending: false })
        .limit(100);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ competitorPrices: data || [] });
    }

    // Default: return everything with metrics
    const [strategiesRes, suggestionsRes, competitorsRes] = await Promise.all([
      supabase.from('pricing_strategies').select('*').order('created_at', { ascending: false }),
      supabase.from('pricing_suggestions').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(50),
      supabase.from('competitor_prices').select('*').order('last_checked_at', { ascending: false }).limit(50),
    ]);

    const suggestions = suggestionsRes.data || [];
    const activeStrategy = (strategiesRes.data || []).find(s => s.active);

    return NextResponse.json({
      strategies: strategiesRes.data || [],
      suggestions,
      totalSuggestions: suggestionsRes.count || 0,
      competitorPrices: competitorsRes.data || [],
      metrics: {
        activeStrategy: activeStrategy?.strategy_type || 'none',
        pendingSuggestions: suggestions.filter(s => !s.applied).length,
        appliedToday: suggestions.filter(s => s.applied && new Date(s.applied_at || '').toDateString() === new Date().toDateString()).length,
        avgMargin: suggestions.length > 0
          ? (suggestions.reduce((sum, s) => sum + (s.margin_pct || 0), 0) / suggestions.length).toFixed(1)
          : '0',
        priceChanges24h: suggestions.filter(s => s.applied && new Date(s.applied_at || '') >= new Date(Date.now() - 86400000)).length,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Pricing API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load pricing data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'apply_suggestion') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

      const { error } = await supabase
        .from('pricing_suggestions')
        .update({ applied: true, applied_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: 'Price suggestion applied' });
    }

    if (action === 'create_strategy') {
      const { name, strategyType, constraints, appliedToCategories } = body;
      if (!name || !strategyType) {
        return NextResponse.json({ error: 'name and strategyType are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('pricing_strategies')
        .insert({
          name,
          strategy_type: strategyType,
          constraints: constraints || {},
          applied_to_categories: appliedToCategories || [],
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, strategy: data });
    }

    if (action === 'activate_strategy') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

      // Deactivate all strategies first
      await supabase.from('pricing_strategies').update({ active: false, updated_at: new Date().toISOString() }).neq('id', '');
      // Activate the selected one
      const { error } = await supabase
        .from('pricing_strategies')
        .update({ active: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === 'add_competitor_price') {
      const { competitorName, competitorUrl, productName, productId, theirPrice, ourPrice, source } = body;
      if (!competitorName || !productName || theirPrice === undefined) {
        return NextResponse.json({ error: 'competitorName, productName, and theirPrice are required' }, { status: 400 });
      }

      const differencePct = ourPrice ? (((ourPrice - theirPrice) / theirPrice) * 100).toFixed(2) : null;

      const { data, error } = await supabase
        .from('competitor_prices')
        .insert({
          competitor_name: competitorName,
          competitor_url: competitorUrl || null,
          product_name: productName,
          product_id: productId || null,
          their_price: theirPrice,
          our_price: ourPrice || null,
          difference_pct: differencePct,
          source: source || 'manual',
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, competitorPrice: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Pricing API] POST error:', error);
    return NextResponse.json({ error: 'Failed to process pricing action' }, { status: 500 });
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
    if (updates.strategyType !== undefined) updateData.strategy_type = updates.strategyType;
    if (updates.constraints !== undefined) updateData.constraints = updates.constraints;
    if (updates.appliedToCategories !== undefined) updateData.applied_to_categories = updates.appliedToCategories;
    if (updates.active !== undefined) updateData.active = updates.active;

    const { error } = await supabase.from('pricing_strategies').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Pricing API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update pricing strategy' }, { status: 500 });
  }
}
