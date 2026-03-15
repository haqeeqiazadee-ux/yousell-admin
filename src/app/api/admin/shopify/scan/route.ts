import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchShopifyProducts } from "@/lib/providers/shopify";
import { calculateFinalScore, getStageFromViralScore } from "@/lib/scoring/composite";

export async function POST(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* defaults */ }

  const query = String(body.niche || body.query || "trending products");

  try {
    const results = await searchShopifyProducts(query);

    if (results.length === 0) {
      return NextResponse.json({ status: "completed", productsFound: 0, message: "No Shopify products found for this query" });
    }

    const admin = createAdminClient();
    const rows = results.map(r => {
      const price = r.price || 0;
      const trendScore = Math.min(100, 15 + Math.round(Math.random() * 40));
      const viralScore = Math.min(100, 10 + Math.round(Math.random() * 35));
      const profitScore = price >= 15 && price <= 60 ? 55 + Math.round(Math.random() * 20) : 30 + Math.round(Math.random() * 25);
      const finalScore = calculateFinalScore(trendScore, viralScore, profitScore);

      return {
        title: r.title,
        description: `Shopify product: ${r.url}`,
        platform: 'shopify',
        status: 'draft',
        category: String(r.metadata?.productType || 'General'),
        price,
        cost: Math.round(price * 0.35 * 100) / 100,
        currency: r.currency || 'USD',
        margin_percent: 65,
        score_overall: finalScore,
        score_demand: trendScore,
        score_competition: 40,
        score_margin: profitScore,
        score_trend: trendScore,
        external_id: r.id,
        external_url: r.url,
        image_url: r.imageUrl || null,
        tags: ['shopify', String(r.metadata?.vendor || '').toLowerCase()].filter(Boolean),
        metadata: r.metadata,
        channel: 'shopify-scan',
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
    const msg = err instanceof Error ? err.message : "Shopify scan failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
