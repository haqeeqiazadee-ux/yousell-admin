import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = createAdminClient();

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
  if (error) {
    if (error.message.includes("does not exist") || error.code === '42P01') {
      return NextResponse.json({ signals: [], total: 0, warning: "Table not yet created. Run migration 028." });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ signals: data || [], total: count || 0 });
}
