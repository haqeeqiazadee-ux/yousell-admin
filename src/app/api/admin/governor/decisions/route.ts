/**
 * Governor AI Decisions API
 * GET  /api/admin/governor/decisions — List AI decisions
 * POST /api/admin/governor/decisions — Approve/dismiss/revert decision
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');
    const level = searchParams.get('level');
    const pending = searchParams.get('pending');

    let query = supabase
      .from('governor_ai_decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (type) query = query.eq('decision_type', type);
    if (level) query = query.eq('level', parseInt(level));
    if (pending === 'true') query = query.eq('applied', false).is('approved_by', null);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const decisions = data || [];
    return NextResponse.json({
      decisions,
      total: decisions.length,
      pending: decisions.filter(d => !d.applied && !d.approved_by).length,
      applied: decisions.filter(d => d.applied).length,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Decisions API] Error:', error);
    return NextResponse.json({ error: 'Failed to load decisions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action, decisionId, approvedBy } = body;

    if (!action || !decisionId) {
      return NextResponse.json({ error: 'action and decisionId required' }, { status: 400 });
    }

    switch (action) {
      case 'approve': {
        await supabase
          .from('governor_ai_decisions')
          .update({ applied: true, approved_by: approvedBy || 'admin' })
          .eq('id', decisionId);
        return NextResponse.json({ success: true, message: 'Decision approved and applied' });
      }

      case 'dismiss': {
        await supabase
          .from('governor_ai_decisions')
          .update({ applied: false, approved_by: `dismissed:${approvedBy || 'admin'}` })
          .eq('id', decisionId);
        return NextResponse.json({ success: true, message: 'Decision dismissed' });
      }

      case 'revert': {
        const { data: decision } = await supabase
          .from('governor_ai_decisions')
          .select('revertible, before_state')
          .eq('id', decisionId)
          .single();

        if (!decision?.revertible) {
          return NextResponse.json({ error: 'Decision is not revertible' }, { status: 400 });
        }

        await supabase
          .from('governor_ai_decisions')
          .update({ reverted: true, applied: false })
          .eq('id', decisionId);

        return NextResponse.json({ success: true, message: 'Decision reverted' });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Decisions API] Error:', error);
    return NextResponse.json({ error: 'Failed to process decision' }, { status: 500 });
  }
}
