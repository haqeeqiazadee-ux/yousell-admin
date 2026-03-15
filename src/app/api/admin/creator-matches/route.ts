import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { runCreatorMatching } from "@/lib/engines/creator-matching";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = createAdminClient();

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");

  let query = supabase
    .from("creator_product_matches")
    .select("*, products(title, platform, price), influencers(username, platform, followers, engagement_rate)")
    .order("match_score", { ascending: false })
    .limit(100);

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ matches: data || [] });
}

export async function POST(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* use defaults */ }

  try {
    const result = await runCreatorMatching(
      Number(body.minProductScore) || 60,
      Number(body.maxCreatorsPerProduct) || 10
    );

    return NextResponse.json({
      status: "completed",
      productsMatched: result.productsMatched,
      matchesCreated: result.matchesCreated,
      ...(result.errors.length > 0 ? { warnings: result.errors } : {}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Matching failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
