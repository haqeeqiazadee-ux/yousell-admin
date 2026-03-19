import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/dashboard";
  // Prevent open redirect: must be a relative path, no protocol tricks
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  // Derive origin from host header to avoid Netlify deploy-preview URL issues
  const host = request.headers.get("host") || url.host;
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  // Share auth cookies across subdomains (yousell.online ↔ admin.yousell.online)
  const cookieDomain = host.includes("yousell.online") ? ".yousell.online" : undefined;

  if (code) {
    const cookieStore = await cookies();

    // Capture cookies set by Supabase during exchangeCodeForSession
    // so we can explicitly apply them to the redirect response.
    // On Netlify, cookies set via cookieStore.set() do NOT transfer
    // to NextResponse.redirect() — they must be set on the response directly.
    const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Store for later application to redirect response
              pendingCookies.push({
                name,
                value,
                options: { ...options, ...(cookieDomain ? { domain: cookieDomain } : {}) },
              });
              // Also set on cookieStore for subsequent server-side reads (getUser, profile query)
              try {
                cookieStore.set(name, value, { ...options, ...(cookieDomain ? { domain: cookieDomain } : {}) });
              } catch {
                // Swallow — might fail in certain environments
              }
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check user role to determine correct redirect
      const { data: { user } } = await supabase.auth.getUser();
      let redirectPath = next;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
        const isAdminSubdomain = host.startsWith('admin.');

        if (isAdminSubdomain) {
          redirectPath = isAdmin ? '/admin' : next;
        } else {
          redirectPath = next.startsWith('/admin') ? '/dashboard' : next;
        }
      }

      // Create redirect response and explicitly set auth cookies on it
      const response = NextResponse.redirect(`${origin}${redirectPath}`);
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Record<string, string>);
      });
      return response;
    }
  }

  // Determine which login page to redirect to on error
  const errorRedirect = next.startsWith('/admin') ? '/admin/login' : '/login';
  return NextResponse.redirect(`${origin}${errorRedirect}?error=auth`);
}
