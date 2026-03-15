import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

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
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const token = request.headers.get("authorization")?.replace("Bearer ", "") || "";

  const body = await request.json();
  if (!body.query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  try {
    const res = await fetch(`${BACKEND_URL}/api/ads/discover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: body.query,
        platforms: body.platforms || ["tiktok", "facebook"],
        limit: body.limit || 20,
        userId: user.id,
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error || "Backend error" }, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
