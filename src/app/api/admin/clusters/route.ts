import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("product_clusters")
    .select("*")
    .order("avg_score", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clusters: data || [] });
}

export async function POST(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const token = request.headers.get("authorization")?.replace("Bearer ", "") || "";
  const body = await request.json();

  try {
    const res = await fetch(`${BACKEND_URL}/api/products/cluster`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        minScore: body.minScore || 30,
        similarityThreshold: body.similarityThreshold || 0.3,
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
