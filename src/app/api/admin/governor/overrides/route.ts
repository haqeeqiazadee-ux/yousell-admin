/**
 * Governor Overrides API — Super admin bypass management
 * GET  /api/admin/governor/overrides — List active overrides
 * POST /api/admin/governor/overrides — Create/deactivate override
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('governor_overrides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const active = (data || []).filter(o => o.active && new Date(o.expires_at) > now);
    const expired = (data || []).filter(o => !o.active || new Date(o.expires_at) <= now);

    return NextResponse.json({ active, expired, totalActive: active.length });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Overrides API] Error:', error);
    return NextResponse.json({ error: 'Failed to load overrides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { action, overrideType, reason, createdBy, targetClientId, targetEngine, durationMinutes, overrideId } = body;

    if (!action) {
      return NextResponse.json({ error: 'action required' }, { status: 400 });
    }

    switch (action) {
      case 'create': {
        if (!overrideType || !reason || !createdBy) {
          return NextResponse.json({ error: 'overrideType, reason, createdBy required' }, { status: 400 });
        }

        // Enforce max durations per type
        const maxMinutes: Record<string, number> = {
          single_request: 1,
          client_bypass: 1440,  // 24h
          engine_bypass: 1440,  // 24h
          full_bypass: 60,      // 1h
        };
        const maxMin = maxMinutes[overrideType] || 60;
        const actualMinutes = Math.min(durationMinutes || maxMin, maxMin);
        const expiresAt = new Date(Date.now() + actualMinutes * 60 * 1000).toISOString();

        const { data, error } = await supabase
          .from('governor_overrides')
          .insert({
            override_type: overrideType,
            created_by: createdBy,
            reason,
            target_client_id: targetClientId || null,
            target_engine: targetEngine || null,
            expires_at: expiresAt,
            active: true,
          })
          .select('id')
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, overrideId: data.id, expiresAt });
      }

      case 'deactivate': {
        if (!overrideId) {
          return NextResponse.json({ error: 'overrideId required' }, { status: 400 });
        }

        await supabase
          .from('governor_overrides')
          .update({ active: false })
          .eq('id', overrideId);

        return NextResponse.json({ success: true, message: 'Override deactivated' });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[Governor Overrides API] Error:', error);
    return NextResponse.json({ error: 'Failed to process override' }, { status: 500 });
  }
}
