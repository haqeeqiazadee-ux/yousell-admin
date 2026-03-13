/**
 * TikTok Cross-Platform Match Worker
 *
 * Takes TikTok-sourced product candidates from the `products` table,
 * searches for matching products on Amazon and Shopify, and enriches
 * the original product record with cross-platform demand validation.
 *
 * v7 spec (Section 28.2): "When a product is detected on one platform,
 * automatically check for presence on others."
 *
 * Phase 1 Batch 04 — TikTok Intelligence.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import { scrapePlatform } from "../lib/providers";
import type { TikTokCrossMatchJobData, RawProduct } from "./types";

export async function processTikTokCrossMatch(
  job: Job<TikTokCrossMatchJobData>
) {
  const {
    keywords,
    platforms = ["amazon", "shopify"],
    minTikTokScore = 40,
    userId,
  } = job.data;

  console.log(
    `[tiktok-cross-match] Starting cross-match for ${keywords.length} keywords on ${platforms.join(", ")}`
  );

  // ── Step 1: Get TikTok products that need cross-matching ─
  const tiktokProducts = await getTikTokProducts(keywords, minTikTokScore);
  await job.updateProgress(20);

  if (tiktokProducts.length === 0) {
    console.log("[tiktok-cross-match] No TikTok products qualify");
    return { matched: 0, crossPlatformProducts: 0 };
  }

  console.log(
    `[tiktok-cross-match] Found ${tiktokProducts.length} TikTok products to cross-match`
  );

  // ── Step 2: Search each platform for matching products ───
  let totalCrossMatches = 0;
  const matchResults: CrossMatchResult[] = [];

  for (let i = 0; i < tiktokProducts.length; i++) {
    const product = tiktokProducts[i];
    const searchTerms = extractSearchTerms(product.title);

    if (!searchTerms) continue;

    const platformMatches: PlatformMatch[] = [];

    for (const platform of platforms) {
      const results = await scrapePlatform(platform, searchTerms);

      if (results.length > 0) {
        const bestMatch = findBestMatch(product.title, results);
        if (bestMatch) {
          platformMatches.push({
            platform,
            external_id: bestMatch.external_id,
            title: bestMatch.title,
            price: bestMatch.price,
            url: bestMatch.url,
            sales_count: bestMatch.sales_count,
            rating: bestMatch.rating,
          });
        }
      }
    }

    if (platformMatches.length > 0) {
      matchResults.push({
        tiktok_product_id: product.id,
        tiktok_title: product.title,
        matches: platformMatches,
      });
      totalCrossMatches += platformMatches.length;
    }

    await job.updateProgress(20 + Math.round((i / tiktokProducts.length) * 60));
  }

  // ── Step 3: Update product records with cross-platform data
  const updated = await updateProductsWithMatches(matchResults);
  await job.updateProgress(100);

  console.log(
    `[tiktok-cross-match] Found ${totalCrossMatches} cross-platform matches for ${matchResults.length} products`
  );

  return {
    tiktokProductsChecked: tiktokProducts.length,
    productsWithMatches: matchResults.length,
    crossPlatformProducts: totalCrossMatches,
    productsUpdated: updated,
  };
}

// ── Types ──────────────────────────────────────────────────

interface TikTokProductRow {
  id: string;
  title: string;
  external_id: string;
  final_score: number;
}

interface PlatformMatch {
  platform: string;
  external_id: string;
  title: string;
  price: number;
  url: string;
  sales_count: number;
  rating: number;
}

interface CrossMatchResult {
  tiktok_product_id: string;
  tiktok_title: string;
  matches: PlatformMatch[];
}

// ── Step 1: Fetch TikTok-sourced products ──────────────────

async function getTikTokProducts(
  keywords: string[],
  minScore: number
): Promise<TikTokProductRow[]> {
  let query = supabase
    .from("products")
    .select("id, title, external_id, final_score")
    .eq("source", "tiktok")
    .gte("final_score", minScore)
    .order("final_score", { ascending: false })
    .limit(50);

  // If keywords provided, filter by title matching
  // (Supabase textSearch or ilike)
  if (keywords.length > 0) {
    const filters = keywords.map((k) => `title.ilike.%${k}%`);
    query = query.or(filters.join(","));
  }

  const { data, error } = await query;
  if (error) {
    console.error("[tiktok-cross-match] DB query error:", error.message);
    return [];
  }

  return (data || []) as TikTokProductRow[];
}

// ── Step 2: Extract meaningful search terms ────────────────

function extractSearchTerms(title: string): string {
  // Remove common filler words and take first 3-5 meaningful words
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "it", "this", "that",
    "i", "my", "me", "we", "you", "your", "so", "just", "get",
    "got", "new", "best", "top", "buy", "shop",
  ]);

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  return words.slice(0, 4).join(" ");
}

// ── Find best matching product from search results ─────────

function findBestMatch(
  tiktokTitle: string,
  candidates: RawProduct[]
): RawProduct | null {
  if (candidates.length === 0) return null;

  const titleWords = new Set(
    tiktokTitle.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/)
  );

  let bestScore = 0;
  let bestMatch: RawProduct | null = null;

  for (const candidate of candidates) {
    const candidateWords = candidate.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/);

    // Simple word overlap scoring
    let overlap = 0;
    for (const word of candidateWords) {
      if (titleWords.has(word) && word.length > 2) overlap++;
    }

    // Require at least 2 matching words
    if (overlap >= 2 && overlap > bestScore) {
      bestScore = overlap;
      bestMatch = candidate;
    }
  }

  return bestMatch;
}

// ── Step 3: Update products with cross-platform data ───────

async function updateProductsWithMatches(
  results: CrossMatchResult[]
): Promise<number> {
  let updated = 0;

  for (const result of results) {
    const crossPlatformData = {
      cross_platform_matches: result.matches.map((m) => ({
        platform: m.platform,
        external_id: m.external_id,
        title: m.title,
        price: m.price,
        url: m.url,
        sales_count: m.sales_count,
        rating: m.rating,
      })),
      cross_platform_count: result.matches.length,
      demand_validated: true,
      validated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("products")
      .update({
        enrichment_data: crossPlatformData,
        enriched_at: new Date().toISOString(),
      })
      .eq("id", result.tiktok_product_id);

    if (error) {
      console.error(
        `[tiktok-cross-match] Update error for ${result.tiktok_product_id}:`,
        error.message
      );
    } else {
      updated++;
    }
  }

  return updated;
}
