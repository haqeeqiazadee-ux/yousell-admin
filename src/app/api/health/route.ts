import { NextRequest, NextResponse } from 'next/server'
import { getAllCircuitBreakerStats } from '@/lib/circuit-breaker'

/**
 * GET /api/health
 *
 * Public health check endpoint for load balancers, monitoring, and uptime checks.
 * No authentication required.
 *
 * ?deep=true — runs full connectivity checks (Supabase, Redis, env vars, circuit breakers)
 * Default — fast liveness check only
 */
export async function GET(request: NextRequest) {
  const deep = request.nextUrl.searchParams.get('deep') === 'true'
  const checks: Record<string, 'ok' | 'error' | 'unconfigured'> = {}

  // ─── Fast liveness (always) ───────────────────────────────
  checks.process = 'ok'

  if (!deep) {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version || '1.0.0',
    })
  }

  // ─── Deep checks (on demand) ──────────────────────────────

  // 1. Supabase connectivity
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
        signal: AbortSignal.timeout(5000),
      })
      checks.database = res.ok ? 'ok' : 'error'
    } else {
      checks.database = 'unconfigured'
    }
  } catch {
    checks.database = 'error'
  }

  // 2. Redis connectivity (if configured)
  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    try {
      // Dynamic import to avoid bundling in client
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require('ioredis')
      const client = new Redis(redisUrl, { connectTimeout: 5000, lazyConnect: true })
      await client.connect()
      const pong = await client.ping()
      checks.redis = pong === 'PONG' ? 'ok' : 'error'
      client.disconnect()
    } catch {
      checks.redis = 'error'
    }
  } else {
    checks.redis = 'unconfigured'
  }

  // 3. Environment essentials
  checks.auth = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'unconfigured'
  checks.ai = process.env.ANTHROPIC_API_KEY ? 'ok' : 'unconfigured'
  checks.encryption = process.env.ENCRYPTION_KEY ? 'ok' : 'unconfigured'

  // 4. Backend API connectivity (Railway)
  const backendUrl = process.env.NEXT_PUBLIC_API_URL
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      checks.backend = res.ok ? 'ok' : 'error'
    } catch {
      checks.backend = 'error'
    }
  } else {
    checks.backend = 'unconfigured'
  }

  // 5. Circuit breaker summary
  const circuitBreakers = getAllCircuitBreakerStats()
  const openBreakers = circuitBreakers.filter(b => b.state === 'OPEN')
  checks.circuit_breakers = openBreakers.length === 0 ? 'ok' : 'error'

  // Overall status
  const criticalChecks = ['database', 'process']
  const hasCriticalFailure = criticalChecks.some(c => checks[c] === 'error')
  const hasAnyFailure = Object.values(checks).some(v => v === 'error')

  const status = hasCriticalFailure ? 'unhealthy' : hasAnyFailure ? 'degraded' : 'ok'

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.npm_package_version || '1.0.0',
    ...(openBreakers.length > 0 ? { openCircuitBreakers: openBreakers.map(b => b.name) } : {}),
  }, { status: hasCriticalFailure ? 503 : 200 })
}
