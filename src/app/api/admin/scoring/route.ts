import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateTrendScore,
  calculateViralScore,
  calculateProfitScore,
  calculateFinalScore,
  getTierFromScore,
  getStageFromViralScore,
  explainScore,
} from "@/lib/scoring/composite";

// POST /api/admin/scoring — calculate and store scores for a product
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { productId, trendInputs, viralInputs, profitInputs } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Calculate all three scores
    const trendScore = trendInputs ? calculateTrendScore(trendInputs) : 0;
    const viralScore = viralInputs ? calculateViralScore(viralInputs) : 0;
    const profitScore = profitInputs ? calculateProfitScore(profitInputs) : 0;
    const finalScore = calculateFinalScore(trendScore, viralScore, profitScore);

    const tier = getTierFromScore(finalScore);
    const trendStage = getStageFromViralScore(viralScore);

    // Generate explanation text (using Haiku placeholder — actual Claude call in Phase 13)
    const explanation = explainScore("final", finalScore, {
      trendScore,
      viralScore,
      profitScore,
    });

    // Update product with scores
    const { error } = await supabase
      .from("products")
      .update({
        final_score: finalScore,
        trend_score: trendScore,
        viral_score: viralScore,
        profit_score: profitScore,
        score_overall: finalScore, // backward compat
        trend_stage: trendStage,
        ai_insight_haiku: explanation,
      })
      .eq("id", productId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Store viral signals if provided
    if (viralInputs) {
      await supabase.from("viral_signals").insert({
        product_id: productId,
        micro_influencer_convergence: viralInputs.microInfluencerConvergence || 0,
        comment_purchase_intent: viralInputs.commentPurchaseIntent || 0,
        hashtag_acceleration: viralInputs.hashtagAcceleration || 0,
        creator_niche_expansion: viralInputs.creatorNicheExpansion || 0,
        engagement_velocity: viralInputs.engagementVelocity || 0,
        supply_side_response: viralInputs.supplySideResponse || 0,
        early_viral_score: viralScore,
      });
    }

    return NextResponse.json({
      productId,
      trendScore,
      viralScore,
      profitScore,
      finalScore,
      tier,
      trendStage,
      explanation,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
