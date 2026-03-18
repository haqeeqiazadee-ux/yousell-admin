import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Allow callers to specify where to redirect after sign-out
  // via a "redirect" form field or query param. Default to home page.
  const formData = await request.formData().catch(() => null);
  const rawRedirect = formData?.get("redirect")?.toString()
    || new URL(request.url).searchParams.get("redirect")
    || "/";
  // Prevent open redirect: must be a relative path
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";

  const url = new URL(redirect, request.url);
  return NextResponse.redirect(url, { status: 302 });
}
