import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const res = await fetch(`${BACKEND_URL}/api/ads/discover`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      query: body.query,
      platforms: body.platforms || ["tiktok", "facebook"],
      limit: body.limit || 20,
      userId: session.user.id,
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error || "Backend error" }, { status: res.status });
  return NextResponse.json(data);
}
