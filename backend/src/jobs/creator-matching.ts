/**
 * Creator-Product Matching Worker
 * @engine creator-matching
 * @queue creator-matching
 *
 * For products scoring 60+, finds matching influencers based on:
 * niche alignment, engagement quality, price range fit.
 * Stores matches with ROI projections.
 *
 * v7 spec Section 30 — Creator-Product Matching Engine.
 *
 * Phase 3 — Creator Intelligence.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import type { CreatorMatchingJobData } from "./types";

export async function processCreatorMatching(
  job: Job<CreatorMatchingJobData>
) {
  const {
    productId,
    minProductScore = 60,
    maxCreatorsPerProduct = 10,
  } = job.data;

  console.log(`[creator-matching] Starting (productId=${productId || "auto"}, minScore=${minProductScore})`);

  // ── Step 1: Get qualifying products ──────────────────────
  let productQuery = supabase
    .from("products")
    .select("id, title, source, price, category, score_overall, final_score")
    .gte("score_overall", minProductScore)
    .order("score_overall", { ascending: false })
    .limit(50);

  if (productId) {
    productQuery = supabase
      .from("products")
      .select("id, title, source, price, category, score_overall, final_score")
      .eq("id", productId)
      .limit(1);
  }

  const { data: products, error: prodErr } = await productQuery;
  if (prodErr || !products || products.length === 0) {
    console.log("[creator-matching] No qualifying products");
    return { matchesCreated: 0 };
  }

  await job.updateProgress(20);

  // ── Step 2: Get available influencers ────────────────────
  const { data: influencers, error: infErr } = await supabase
    .from("influencers")
    .select("id, platform, username, followers, engagement_rate, niche")
    .gte("followers", 1000)
    .order("engagement_rate", { ascending: false })
    .limit(200);

  if (infErr || !influencers || influencers.length === 0) {
    console.log("[creator-matching] No influencers available");
    return { matchesCreated: 0, productsProcessed: products.length };
  }

  await job.updateProgress(40);

  // ── Step 3: Match products to creators ───────────────────
  let totalMatches = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productPrice = Number(product.price || 0);
    const productCategory = ((product.category as string) || "general").toLowerCase();

    // Score each influencer against this product
    const scored = influencers.map((inf) => {
      const nicheAlign = calculateNicheAlignment(
        productCategory,
        (inf.niche as string) || ""
      );
      const engagementFit = Math.min(100, Number(inf.engagement_rate || 0) * 20);
      const priceRangeFit = calculatePriceRangeFit(
        productPrice,
        Number(inf.followers || 0)
      );

      const matchScore =
        nicheAlign * 0.40 +
        engagementFit * 0.35 +
        priceRangeFit * 0.25;

      // ROI projection (v7 spec Section 30.2)
      const avgViews = Number(inf.followers || 0) * 0.1; // 10% view rate
      const conversionRate = 0.005; // 0.5%
      const estimatedConversions = Math.round(avgViews * conversionRate);
      const profitPerUnit = productPrice * 0.35; // estimated 35% margin
      const estimatedProfit = estimatedConversions * profitPerUnit;

      return {
        influencer_id: inf.id as string,
        match_score: Math.round(matchScore * 100) / 100,
        niche_alignment: Math.round(nicheAlign * 100) / 100,
        engagement_fit: Math.round(engagementFit * 100) / 100,
        price_range_fit: Math.round(priceRangeFit * 100) / 100,
        estimated_views: Math.round(avgViews),
        estimated_conversions: estimatedConversions,
        estimated_profit: Math.round(estimatedProfit * 100) / 100,
      };
    });

    // Take top N matches with score >= 40
    const topMatches = scored
      .filter((s) => s.match_score >= 40)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, maxCreatorsPerProduct);

    if (topMatches.length > 0) {
      const rows = topMatches.map((m) => ({
        product_id: product.id as string,
        ...m,
      }));

      const { error: upsertErr } = await supabase
        .from("creator_product_matches")
        .upsert(rows, { onConflict: "product_id,influencer_id" });

      if (upsertErr) {
        console.error("[creator-matching] Upsert error:", upsertErr.message);
      } else {
        totalMatches += topMatches.length;
      }
    }

    await job.updateProgress(40 + Math.round((i / products.length) * 50));
  }

  await job.updateProgress(100);
  console.log(`[creator-matching] Created ${totalMatches} matches for ${products.length} products`);

  return {
    productsProcessed: products.length,
    matchesCreated: totalMatches,
    influencersConsidered: influencers.length,
  };
}

// ── Helpers ────────────────────────────────────────────────

function calculateNicheAlignment(productCategory: string, influencerNiche: string): number {
  if (!influencerNiche) return 30; // neutral if no niche set

  const pWords = new Set(productCategory.toLowerCase().split(/\s+/));
  const iWords = influencerNiche.toLowerCase().split(/\s+/);

  let overlap = 0;
  for (const w of iWords) {
    if (pWords.has(w)) overlap++;
  }

  if (overlap > 0) return Math.min(100, 50 + overlap * 25);

  // Broad category match
  const broadCategories: Record<string, string[]> = {
    beauty: ["skincare", "makeup", "cosmetics", "beauty", "hair"],
    tech: ["gadgets", "electronics", "technology", "tech", "phone"],
    fitness: ["health", "fitness", "workout", "gym", "wellness"],
    fashion: ["clothing", "fashion", "style", "accessories", "apparel"],
    home: ["home", "kitchen", "decor", "furniture", "household"],
  };

  for (const [, keywords] of Object.entries(broadCategories)) {
    const pMatch = keywords.some((k) => productCategory.includes(k));
    const iMatch = keywords.some((k) => influencerNiche.toLowerCase().includes(k));
    if (pMatch && iMatch) return 60;
  }

  return 20;
}

function calculatePriceRangeFit(productPrice: number, followers: number): number {
  // Micro-influencers (1K-50K) best for impulse buys (<$60)
  // Mid-tier (50K-500K) good for mid-range ($30-$150)
  // Macro (500K+) good for premium ($50+)
  if (followers < 50_000) {
    if (productPrice < 60) return 90;
    if (productPrice < 100) return 60;
    return 30;
  }
  if (followers < 500_000) {
    if (productPrice >= 30 && productPrice <= 150) return 90;
    return 50;
  }
  // Macro
  if (productPrice >= 50) return 80;
  return 40;
}
