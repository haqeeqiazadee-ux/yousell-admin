/**
 * External Engine Test API — Test connectivity to an external engine
 * POST /api/admin/governor/external-engines/test
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { checkExternalHealth } from '@/lib/engines/governor/external-adapter';
import { decryptToken } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, apiEndpoint, authType, authToken, authHeaderName, healthEndpoint } = body;

    let engine: {
      apiEndpoint: string;
      authType: string;
      authHeaderName: string;
      authTokenEncrypted: string | null;
      healthEndpoint: string | null;
      engineKey: string;
    };

    if (id) {
      // Test an already-registered engine by ID
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('external_engines')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'External engine not found' }, { status: 404 });
      }

      engine = {
        apiEndpoint: data.api_endpoint,
        authType: data.auth_type,
        authHeaderName: data.auth_header_name,
        authTokenEncrypted: data.auth_token_encrypted,
        healthEndpoint: data.health_endpoint,
        engineKey: data.engine_key,
      };
    } else if (apiEndpoint) {
      // Test a new engine before registering (uses raw inputs)
      const { encryptToken } = await import('@/lib/crypto');
      engine = {
        apiEndpoint,
        authType: authType || 'bearer',
        authHeaderName: authHeaderName || 'Authorization',
        authTokenEncrypted: authToken ? encryptToken(authToken) : null,
        healthEndpoint: healthEndpoint || null,
        engineKey: 'test-engine',
      };
    } else {
      return NextResponse.json({ error: 'Either id or apiEndpoint is required' }, { status: 400 });
    }

    const startTime = Date.now();

    // Test health endpoint
    const healthUrl = engine.healthEndpoint
      ? (engine.healthEndpoint.startsWith('http')
          ? engine.healthEndpoint
          : `${engine.apiEndpoint.replace(/\/+$/, '')}${engine.healthEndpoint}`)
      : engine.apiEndpoint;

    const headers: Record<string, string> = {};
    if (engine.authTokenEncrypted && engine.authType !== 'none') {
      const token = decryptToken(engine.authTokenEncrypted);
      if (engine.authType === 'bearer') {
        headers[engine.authHeaderName] = `Bearer ${token}`;
      } else {
        headers[engine.authHeaderName] = token;
      }
    }

    let reachable = false;
    let statusCode = 0;
    let responseTime = 0;
    let errorMessage = '';

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10_000),
      });

      reachable = response.ok;
      statusCode = response.status;
      responseTime = Date.now() - startTime;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      responseTime = Date.now() - startTime;
    }

    // Update health status in DB if testing existing engine
    if (id) {
      const supabase = createAdminClient();
      await supabase
        .from('external_engines')
        .update({
          last_health_check: new Date().toISOString(),
          last_health_status: reachable,
        })
        .eq('id', id);
    }

    return NextResponse.json({
      reachable,
      statusCode,
      responseTimeMs: responseTime,
      error: errorMessage || undefined,
      testedUrl: healthUrl,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('[External Engines Test API] Error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
