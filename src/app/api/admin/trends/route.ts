import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = createAdminClient();

  const { data, error, count } = await supabase
    .from("trend_keywords")
    .select("*", { count: "exact" })
    .order("trend_score", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trends: data || [], total: count || 0 });
}

export async function POST(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = createAdminClient();

  const body = await request.json();
  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [body.keyword];

  const inserts = keywords.map((keyword: string) => ({
    keyword: keyword.trim(),
    category: body.category || null,
    created_by: user.id,
  }));

  const { data, error } = await supabase
    .from("trend_keywords")
    .insert(inserts)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trends: data }, { status: 201 });
}
