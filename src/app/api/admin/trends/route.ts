import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error, count } = await supabase
    .from("trend_keywords")
    .select("*", { count: "exact" })
    .order("trend_score", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trends: data || [], total: count || 0 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
