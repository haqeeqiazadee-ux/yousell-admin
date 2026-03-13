import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";

export async function GET(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const hasProduct = searchParams.get("has_product");
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  let query = supabase
    .from("tiktok_videos")
    .select("*", { count: "exact" })
    .order("views", { ascending: false })
    .limit(limit);

  if (search) {
    query = query.ilike("description", `%${search}%`);
  }
  if (hasProduct === "true") {
    query = query.eq("has_product_link", true);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ videos: data || [], total: count || 0 });
}
