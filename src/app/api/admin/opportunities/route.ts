import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { buildOpportunityFeed } from "@/lib/engines/opportunity-feed";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const { searchParams } = new URL(request.url);
  const minScore = Number(searchParams.get("min_score")) || 0;
  const platform = searchParams.get("platform") || undefined;
  const trendStage = searchParams.get("trend_stage") || undefined;
  const limit = Number(searchParams.get("limit")) || 100;

  try {
    const feed = await buildOpportunityFeed({ minScore, platform, trendStage, limit });
    return NextResponse.json(feed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to build opportunity feed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
