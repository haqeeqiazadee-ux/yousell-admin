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
  const productId = searchParams.get("product_id");

  let query = supabase
    .from("creator_product_matches")
    .select("*, products(title, source, price), influencers(username, platform, followers, engagement_rate)")
    .order("match_score", { ascending: false })
    .limit(100);

  if (productId) query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ matches: data || [] });
}

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/api/creators/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      productId: body.productId,
      minProductScore: body.minProductScore || 60,
      maxCreatorsPerProduct: body.maxCreatorsPerProduct || 10,
      userId: session.user.id,
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error || "Backend error" }, { status: res.status });
  return NextResponse.json(data);
}
