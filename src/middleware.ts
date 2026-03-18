import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { cookies: { getAll() { return request.cookies.getAll() }, setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); supabaseResponse = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options)) } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
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

  // If on client domain root, redirect logged-in users to dashboard; otherwise show homepage
  if (isClientDomain && pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
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

  if ((pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}
export const config = { matcher: ['/', '/admin/:path*', '/dashboard/:path*', '/login', '/signup', '/forgot-password', '/reset-password'] }
