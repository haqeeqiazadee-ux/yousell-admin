import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Security Headers (Phase 7: Compliance) ────────────────
function addSecurityHeaders(response: NextResponse, requestId?: string): NextResponse {
  if (requestId) response.headers.set('X-Request-Id', requestId)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  // HSTS — only on production (yousell.online)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  return response
}

// ─── Rate Limiting (Phase 7: API Protection) ───────────────
// Simple in-memory sliding window. For production at scale, use Upstash Redis.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 60 // 60 requests per minute per IP

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  entry.count++
  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count }
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetAt) rateLimitMap.delete(key)
    }
  }, 300_000)
}

// Build the admin panel URL for cross-domain redirects
function adminUrl(request: NextRequest, path: string): URL {
  const host = request.headers.get('host') || ''
  const protocol = host.includes('localhost') ? 'http' : 'https'
  // On client domain (yousell.online), redirect to admin.yousell.online
  // On localhost or other environments, just use relative path
  if (host === 'yousell.online' || host === 'www.yousell.online') {
    return new URL(`${protocol}://admin.yousell.online${path}`)
  }
  return new URL(path, request.url)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── Request ID (Phase 8: Production Hardening) ───────────
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()

  // Rate limit API routes (except health check and webhooks)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/health') && !pathname.startsWith('/api/webhooks')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    const { allowed } = checkRateLimit(ip)

    if (!allowed) {
      const rateLimitResponse = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
      rateLimitResponse.headers.set('Retry-After', '60')
      rateLimitResponse.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX))
      rateLimitResponse.headers.set('X-RateLimit-Remaining', '0')
      return addSecurityHeaders(rateLimitResponse, requestId)
    }
  }

  let supabaseResponse = NextResponse.next({ request })
  const reqHost = request.headers.get('host') || ''
  // Share auth cookies across subdomains (yousell.online ↔ admin.yousell.online)
  const cookieDomain = reqHost.includes('yousell.online') ? '.yousell.online' : undefined
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { cookies: { getAll() { return request.cookies.getAll() }, setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); supabaseResponse = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, { ...options, ...(cookieDomain ? { domain: cookieDomain } : {}) })) } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const hostname = request.headers.get('host') || ''

  // Subdomain routing: admin.yousell.online vs yousell.online
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isClientDomain = !isAdminSubdomain && (hostname === 'yousell.online' || hostname === 'www.yousell.online')

  // If on admin subdomain, redirect root based on auth state
  if (isAdminSubdomain && pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // If on client domain root, redirect logged-in users based on role; otherwise show homepage
  if (isClientDomain && pathname === '/') {
    if (user) {
      // Check role to route correctly — avoids bounce between /dashboard and /login
      const { data: rootRole } = await supabase.rpc('check_user_role', { user_id: user.id })
      if (rootRole === 'admin' || rootRole === 'super_admin') {
        return NextResponse.redirect(adminUrl(request, '/admin'))
      }
      if (rootRole === 'client') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      // No valid role — show homepage instead of starting a redirect loop
      return supabaseResponse
    }
    // Let unauthenticated users see the homepage
    return supabaseResponse
  }

  // Block client routes on admin subdomain
  if (isAdminSubdomain && (pathname.startsWith('/dashboard') || pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL(user ? '/admin' : '/admin/login', request.url))
  }

  // Block admin routes on client domain — redirect to admin subdomain or login
  if (isClientDomain && pathname.startsWith('/admin')) {
    if (user) {
      return NextResponse.redirect(adminUrl(request, '/admin'))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin routes: require authenticated user with admin role
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/unauthorized') {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Defense-in-depth: check admin role at middleware level
    const { data: role, error: roleError } = await supabase.rpc('check_user_role', { user_id: user.id })

    if (roleError) {
      // RPC failed — don't lock the user out, let the page handle auth
      console.error('check_user_role RPC failed:', roleError.message)
      return supabaseResponse
    }

    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
    }
  }

  // Redirect logged-in users away from login/signup pages
  if (pathname === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Only redirect logged-in users from /login to /dashboard if they don't have
  // a ?error or ?kicked param (which means they were just bounced from /dashboard
  // for having no valid role — redirecting back would create an infinite loop).
  if ((pathname === '/login' || pathname === '/signup') && user) {
    const hasError = request.nextUrl.searchParams.has('error') || request.nextUrl.searchParams.has('kicked')
    if (!hasError) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Client dashboard routes: require authenticated user with client role
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Defense-in-depth: check client role at middleware level
    const { data: clientRole, error: clientRoleError } = await supabase.rpc('check_user_role', { user_id: user.id })

    if (clientRoleError) {
      // RPC failed — don't lock the user out, let the page handle auth
      console.error('check_user_role RPC failed:', clientRoleError.message)
      return supabaseResponse
    }

    if (clientRole !== 'client') {
      // Admin/super_admin users should go to admin panel, not client dashboard
      if (clientRole === 'admin' || clientRole === 'super_admin') {
        return NextResponse.redirect(adminUrl(request, '/admin'))
      }
      // Unknown/null role — use ?kicked to prevent redirect loop with /login
      return NextResponse.redirect(new URL('/login?kicked=no_role', request.url))
    }
  }

  return addSecurityHeaders(supabaseResponse, requestId)
}
export const config = { matcher: ['/', '/admin/:path*', '/dashboard/:path*', '/api/:path*', '/login', '/signup', '/forgot-password', '/reset-password'] }
