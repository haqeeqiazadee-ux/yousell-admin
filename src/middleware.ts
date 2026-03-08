import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const isUnauthorizedPage = pathname === "/admin/unauthorized";
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Protected admin routes — redirect to login if not authenticated
  if (!user && isAdminRoute && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Protected client dashboard — redirect to login if not authenticated
  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Helper: get user role via RPC (bypasses RLS issues)
  async function getUserRole(userId: string): Promise<string | null> {
    const { data } = await supabase.rpc("get_user_role", { user_id: userId });
    return data as string | null;
  }

  // Redirect logged-in users away from login page based on role
  if (user && isLoginPage) {
    const role = await getUserRole(user.id);
    const url = request.nextUrl.clone();
    url.pathname = role === "client" ? "/dashboard" : "/admin";
    return NextResponse.redirect(url);
  }

  // Admin role enforcement — non-admin users redirected from /admin/*
  if (user && isAdminRoute && !isLoginPage && !isUnauthorizedPage) {
    const role = await getUserRole(user.id);

    if (!role || role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "client" ? "/dashboard" : "/admin/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // Dashboard route — admin users get redirected to /admin
  if (user && isDashboardRoute) {
    const role = await getUserRole(user.id);

    if (role === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
