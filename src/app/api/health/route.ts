import { NextResponse } from 'next/server'

/**
 * GET /api/health
 *
 * Public health check endpoint for load balancers, monitoring, and uptime checks.
 * No authentication required.
 */
export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}

  // Check Supabase connectivity
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
        signal: AbortSignal.timeout(5000),
      })
      checks.database = res.ok ? 'ok' : 'error'
    } else {
      checks.database = 'error'
    }
  } catch {
    checks.database = 'error'
  }

  // Check environment essentials
  checks.auth = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'error'
  checks.ai = process.env.ANTHROPIC_API_KEY ? 'ok' : 'error'

  const allOk = Object.values(checks).every(v => v === 'ok')
  const status = allOk ? 'ok' : 'degraded'

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.npm_package_version || '1.0.0',
  }, { status: allOk ? 200 : 503 })
}
