/**
 * Governor Swaps API — Engine hot-swapping
 * GET  /api/admin/governor/swaps — List active swaps
 * POST /api/admin/governor/swaps — Create/revert swap
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: swaps, error } = await supabase
      .from('engine_swaps')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const active = (swaps || []).filter(s => s.active);
    const history = (swaps || []).filter(s => !s.active);

    return NextResponse.json({ active, history, totalActive: active.length });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Swaps API] Error:', error);
    return NextResponse.json({ error: 'Failed to load swaps' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action, sourceEngine, targetEngine, reason, createdBy, swapId, expiresInHours } = body;

    if (!action) {
      return NextResponse.json({ error: 'action required' }, { status: 400 });
    }

    switch (action) {
      case 'create': {
        if (!sourceEngine || !targetEngine || !reason || !createdBy) {
          return NextResponse.json(
            { error: 'sourceEngine, targetEngine, reason, createdBy required' },
            { status: 400 }
          );
        }

        // Deactivate any existing swap for this source
        await supabase
          .from('engine_swaps')
          .update({ active: false })
          .eq('source_engine', sourceEngine)
          .eq('active', true);

        const expiresAt = expiresInHours
          ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
          : null;

        const { data, error } = await supabase
          .from('engine_swaps')
          .insert({
            source_engine: sourceEngine,
            target_engine: targetEngine,
            reason,
            created_by: createdBy,
            expires_at: expiresAt,
            active: true,
          })
          .select('id')
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, swapId: data.id });
      }

      case 'revert': {
        if (!swapId) {
          return NextResponse.json({ error: 'swapId required' }, { status: 400 });
        }

        await supabase
          .from('engine_swaps')
          .update({ active: false })
          .eq('id', swapId);

        return NextResponse.json({ success: true, message: 'Swap reverted' });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Swaps API] Error:', error);
    return NextResponse.json({ error: 'Failed to process swap' }, { status: 500 });
  }
}
