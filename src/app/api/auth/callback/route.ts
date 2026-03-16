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

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check user role to determine correct redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // Route based on role
        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          return NextResponse.redirect(`${origin}/admin`);
        }
        // Client role or new user: go to dashboard (or requested next)
        return NextResponse.redirect(`${origin}${next === '/admin' ? '/dashboard' : next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Determine which login page to redirect to on error
  const errorRedirect = next.startsWith('/admin') ? '/admin/login' : '/login';
  return NextResponse.redirect(`${origin}${errorRedirect}?error=auth`);
}
