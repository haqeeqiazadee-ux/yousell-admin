/**
 * External Engines API — Register & manage external engine APIs
 * GET    /api/admin/governor/external-engines — List all external engines
 * POST   /api/admin/governor/external-engines — Register new external engine
 * PATCH  /api/admin/governor/external-engines — Update external engine
 * DELETE /api/admin/governor/external-engines — Deactivate external engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { encryptToken } from '@/lib/crypto';

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('external_engines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Never return encrypted tokens to the client
    const engines = (data || []).map(e => ({
      ...e,
      auth_token_encrypted: e.auth_token_encrypted ? '••••••••' : null,
    }));

    return NextResponse.json({
      engines,
      total: engines.length,
      active: engines.filter(e => e.active).length,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[External Engines API] GET error:', error);
    return NextResponse.json({ error: 'Failed to load external engines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();

    const {
      engineKey,
      displayName,
      apiEndpoint,
      authType = 'bearer',
      authHeaderName = 'Authorization',
      authToken,
      healthEndpoint,
      costPerOperationUsd = 0,
      timeoutMs = 30000,
      replacesEngine,
      metadata = {},
      createdBy = 'admin',
    } = body;

    if (!engineKey || !displayName || !apiEndpoint) {
      return NextResponse.json(
        { error: 'engineKey, displayName, and apiEndpoint are required' },
        { status: 400 }
      );
    }

    // Validate engine key format
    if (!/^[a-z0-9-]+$/.test(engineKey)) {
      return NextResponse.json(
        { error: 'engineKey must be lowercase alphanumeric with hyphens (e.g., ext-openai-scoring)' },
        { status: 400 }
      );
    }

    // Encrypt the auth token if provided
    const authTokenEncrypted = authToken ? encryptToken(authToken) : null;

    const { data, error } = await supabase
      .from('external_engines')
      .insert({
        engine_key: engineKey,
        display_name: displayName,
        api_endpoint: apiEndpoint,
        auth_type: authType,
        auth_header_name: authHeaderName,
        auth_token_encrypted: authTokenEncrypted,
        health_endpoint: healthEndpoint || null,
        cost_per_operation_usd: costPerOperationUsd,
        timeout_ms: timeoutMs,
        replaces_engine: replacesEngine || null,
        metadata,
        created_by: createdBy,
      })
      .select('id, engine_key, display_name')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'An engine with this key already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, engine: data });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[External Engines API] POST error:', error);
    return NextResponse.json({ error: 'Failed to register external engine' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Build update object — only include provided fields
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
    if (updates.apiEndpoint !== undefined) updateData.api_endpoint = updates.apiEndpoint;
    if (updates.authType !== undefined) updateData.auth_type = updates.authType;
    if (updates.authHeaderName !== undefined) updateData.auth_header_name = updates.authHeaderName;
    if (updates.healthEndpoint !== undefined) updateData.health_endpoint = updates.healthEndpoint;
    if (updates.costPerOperationUsd !== undefined) updateData.cost_per_operation_usd = updates.costPerOperationUsd;
    if (updates.timeoutMs !== undefined) updateData.timeout_ms = updates.timeoutMs;
    if (updates.replacesEngine !== undefined) updateData.replaces_engine = updates.replacesEngine;
    if (updates.active !== undefined) updateData.active = updates.active;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    // Re-encrypt token if updated
    if (updates.authToken) {
      updateData.auth_token_encrypted = encryptToken(updates.authToken);
    }

    const { error } = await supabase
      .from('external_engines')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[External Engines API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update external engine' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter required' }, { status: 400 });
    }

    // Soft-delete: deactivate instead of removing
    const { error } = await supabase
      .from('external_engines')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also deactivate any active swaps pointing to this engine
    await supabase
      .from('engine_swaps')
      .update({ active: false })
      .eq('external_engine_id', id)
      .eq('active', true);

    return NextResponse.json({ success: true, message: 'External engine deactivated' });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[External Engines API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to deactivate external engine' }, { status: 500 });
  }
}
