import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { runProductClustering } from "@/lib/engines/clustering";

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
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* use defaults */ }

  try {
    const result = await runProductClustering(
      Number(body.minScore) || 30,
      Number(body.similarityThreshold) || 0.3
    );

    return NextResponse.json({
      status: "completed",
      clustersCreated: result.clustersCreated,
      productsAssigned: result.productsAssigned,
      ...(result.errors.length > 0 ? { warnings: result.errors } : {}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Clustering failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
