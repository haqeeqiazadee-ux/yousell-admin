import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = createAdminClient();

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sort") || "conversion_score";
    const order = searchParams.get("order") || "desc";

    // Whitelist allowed sort fields to prevent injection
    const allowedSortFields = ["followers", "engagement_rate", "conversion_score", "created_at"];
    const safeSortField = allowedSortFields.includes(sortBy) ? sortBy : "conversion_score";

    let query = supabase
      .from("influencers")
      .select("*", { count: "exact" })
      .order(safeSortField, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (platform) query = query.eq("platform", platform);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ influencers: data || [], total: count || 0 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = createAdminClient();

    const body = await request.json();

    const { data, error } = await supabase
      .from("influencers")
      .insert(body)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ influencer: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
