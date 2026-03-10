import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";

export async function GET(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    // If type is provided, query affiliate_programs table
    if (type) {
      let query = supabase
        .from("affiliate_programs")
        .select("*", { count: "exact" })
        .eq("type", type)
        .order("created_at", { ascending: false });

      if (search) query = query.ilike("name", `%${search}%`);

      const { data, error, count } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ programs: data || [], total: count || 0 });
    }

    // Default: query products for affiliate platforms (ai or physical)
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .in("platform", ["ai", "physical"])
      .order("score_overall", { ascending: false })
      .limit(50);

    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ products: data || [], total: count || 0 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
