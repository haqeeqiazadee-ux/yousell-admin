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

  // Admin routes: require authenticated user with admin role
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/unauthorized') {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Defense-in-depth: check admin role at middleware level
    // Uses SECURITY DEFINER RPC to bypass RLS on profiles table
    const { data: role } = await supabase.rpc('check_user_role', { user_id: user.id })

    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Client dashboard routes: require authenticated user
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
export const config = { matcher: ['/admin/:path*', '/dashboard/:path*'] }
