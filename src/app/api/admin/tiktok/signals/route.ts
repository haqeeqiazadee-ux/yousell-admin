import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";

export async function GET(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const hashtag = searchParams.get("hashtag");
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  let query = supabase
    .from("tiktok_hashtag_signals")
    .select("*", { count: "exact" })
    .order("view_velocity", { ascending: false })
    .limit(limit);

  if (hashtag) {
    query = query.eq("hashtag", hashtag);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ signals: data || [], total: count || 0 });
}
