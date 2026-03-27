import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchAmazonProducts } from "@/lib/providers/amazon";
import { calculateFinalScore, getStageFromViralScore } from "@/lib/scoring/composite";

export async function POST(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* defaults */ }

  const query = String(body.query || "best sellers");

  try {
    const results = await searchAmazonProducts(query);

    if (results.length === 0) {
      return NextResponse.json({ status: "completed", productsFound: 0, message: "No Amazon products found" });
    }

    const admin = createAdminClient();
    const rows = results.map(r => {
      const price = r.price || 0;
      const rating = Number(r.metadata?.rating || 0);
      const reviewCount = Number(r.metadata?.reviewCount || 0);

      // Score based on real Amazon data
      let trendScore = 10;
      if (r.metadata?.isPrime) trendScore += 15;
      if (reviewCount > 1000) trendScore += 25;
      else if (reviewCount > 100) trendScore += 15;
      if (rating >= 4.5) trendScore += 20;
      else if (rating >= 4.0) trendScore += 10;
      trendScore = Math.min(100, trendScore);

      let viralScore = 0;
      if (reviewCount > 5000) viralScore += 40;
      else if (reviewCount > 1000) viralScore += 25;
      else if (reviewCount > 100) viralScore += 15;
      if (rating >= 4.5) viralScore += 20;
      viralScore = Math.min(100, viralScore);

      let profitScore = 0;
      if (price >= 15 && price <= 60) profitScore += 30;
      else if (price > 60 && price <= 100) profitScore += 20;
      else if (price > 0) profitScore += 10;
      if (rating >= 4.5) profitScore += 20;
      if (reviewCount < 500) profitScore += 15; // Less competition
      profitScore = Math.min(100, profitScore);

      const finalScore = calculateFinalScore(trendScore, viralScore, profitScore);

      return {
        title: r.title,
        description: `Amazon product: ${r.url}`,
        platform: 'amazon',
        status: 'draft',
        category: 'General',
        price,
        cost: Math.round(price * 0.4 * 100) / 100,
        currency: 'USD',
        margin_percent: 60,
        score_overall: finalScore,
        score_demand: trendScore,
        score_competition: reviewCount > 1000 ? 75 : reviewCount > 100 ? 50 : 25,
        score_margin: profitScore,
        score_trend: trendScore,
        external_id: r.id,
        external_url: r.url,
        image_url: r.imageUrl || null,
        tags: ['amazon', r.metadata?.isPrime ? 'prime' : ''].filter(Boolean),
        metadata: r.metadata,
        channel: 'amazon-scan',
        final_score: finalScore,
        trend_score: trendScore,
        viral_score: viralScore,
        profit_score: profitScore,
        trend_stage: getStageFromViralScore(viralScore),
        created_by: user.id,
      };
    });

    const { data, error } = await admin
      .from('products')
      .insert(rows)
      .select('id');

    return NextResponse.json({
      status: "completed",
      productsFound: results.length,
      productsStored: data?.length ?? 0,
      ...(error ? { warning: error.message } : {}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Amazon scan failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
