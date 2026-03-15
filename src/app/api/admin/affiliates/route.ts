import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = createAdminClient();

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
