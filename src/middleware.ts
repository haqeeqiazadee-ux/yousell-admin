import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  const isClientDomain = !isAdminSubdomain && (hostname === 'yousell.online' || hostname.startsWith('www.'))

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

  // Block admin routes on client domain (except API routes shared by both)
  if (isClientDomain && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin routes: require authenticated user with admin role
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/unauthorized') {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Defense-in-depth: check admin role at middleware level
    const { data: role } = await supabase.rpc('check_user_role', { user_id: user.id })

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
    const { data: clientRole } = await supabase.rpc('check_user_role', { user_id: user.id })
    if (clientRole !== 'client') {
      // Admin/super_admin users should go to admin panel, not client dashboard
      if (clientRole === 'admin' || clientRole === 'super_admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}
export const config = { matcher: ['/', '/admin/:path*', '/dashboard/:path*', '/login', '/signup'] }
