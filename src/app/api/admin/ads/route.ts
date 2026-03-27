import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { discoverAds } from "@/lib/engines/ad-intelligence";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = createAdminClient();

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const scalingOnly = searchParams.get("scaling_only");

  let query = supabase
    .from("ads")
    .select("*")
    .order("impressions", { ascending: false })
    .limit(100);

  if (platform) query = query.eq("platform", platform);
  if (scalingOnly === "true") query = query.eq("is_scaling", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ads: data || [] });
}

export async function POST(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* use defaults */ }

  if (!body.query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  try {
    const result = await discoverAds(
      String(body.query),
      (body.platforms as string[]) || ["facebook", "tiktok"],
      Number(body.limit) || 20
    );

    return NextResponse.json({
      status: "completed",
      adsFound: result.adsFound,
      adsStored: result.adsStored,
      ...(result.errors.length > 0 ? { warnings: result.errors } : {}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Ad discovery failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
