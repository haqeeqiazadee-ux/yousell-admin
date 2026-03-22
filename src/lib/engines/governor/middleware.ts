/**
 * YOUSELL Engine Governor — Route Middleware Helper
 *
 * Wraps engine API route handlers with Governor gate checks.
 * Use this in engine-namespaced routes that have real implementations
 * (not thin proxies).
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 4
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { EngineName } from '../types';
import type { PlanId } from './types';
import { GovernorGate } from './gate';

const gate = new GovernorGate();

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

interface GovernorContext {
  clientId: string;
  userId: string;
  isSuperAdmin: boolean;
  plan: PlanId;
}

/**
 * Extract client context from a request.
 * Resolves the user from the auth token, then gets their client record.
 */
async function resolveContext(request: NextRequest): Promise<GovernorContext | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabase = getServiceClient();

  // Get user from token
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  // Get user's profile for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'admin' || isSuperAdmin;

  // Admin users bypass client resolution — they operate on behalf of clients
  if (isAdmin) {
    // Admin requests may include client_id in body or query
    const clientId = request.nextUrl.searchParams.get('client_id') || 'admin';
    return {
      clientId,
      userId: user.id,
      isSuperAdmin,
      plan: 'enterprise', // Admins have full access
    };
  }

  // Client users — look up their client record
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!client) return null;

  // Get their subscription plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('client_id', client.id)
    .eq('status', 'active')
    .single();

  return {
    clientId: client.id,
    userId: user.id,
    isSuperAdmin: false,
    plan: (sub?.plan as PlanId) || 'starter',
  };
}

/**
 * Wrap an engine route handler with Governor gate check.
 *
 * Usage:
 * ```ts
 * export const POST = withGovernor('content-engine', 'generate_caption', handler);
 * ```
 */
export function withGovernor(
  engineName: EngineName,
  operation: string,
  handler: (request: NextRequest, context: GovernorContext) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    // 1. Resolve client context
    const ctx = await resolveContext(request);
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Super admin bypass
    if (ctx.isSuperAdmin) {
      return handler(request, ctx);
    }

    // 3. Governor gate check
    const gateResult = await gate.check(ctx.clientId, engineName, operation);
    if (!gateResult.allowed) {
      const status = gateResult.code === 'NOT_IN_PLAN' ? 403
        : gateResult.code === 'QUOTA_EXCEEDED' || gateResult.code === 'BUDGET_EXCEEDED' ? 429
        : gateResult.code === 'ENGINE_UNHEALTHY' ? 503
        : 403;

      return NextResponse.json({
        error: gateResult.reason,
        code: gateResult.code,
        suggestion: gateResult.suggestion,
      }, { status });
    }

    // 4. Execute handler
    return handler(request, ctx);
  };
}
