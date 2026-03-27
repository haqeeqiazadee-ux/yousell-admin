/**
 * Amazon Intelligence Worker
 * @engine amazon-intelligence
 * @queue amazon-intelligence
 *
 * Discovers trending Amazon products via Apify BSR scraper,
 * stores results, and identifies cross-platform opportunities.
 *
 * v7 spec: Amazon — BSR movements, new listing growth, review velocity.
 *
 * Phase 4 — Marketplace Intelligence.
 */
import { Job, Queue } from "bullmq";
import { connection } from "../lib/queue";
import { supabase } from "../lib/supabase";
import { QUEUES } from "./types";
import type { AmazonIntelligenceJobData, RawProduct } from "./types";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR = "junglee~amazon-bestsellers-scraper";
const enrichQueue = new Queue(QUEUES.ENRICH_PRODUCT, { connection });

export async function processAmazonIntelligence(
  job: Job<AmazonIntelligenceJobData>
) {
  const { query, limit = 50 } = job.data;

  console.log(`[amazon-intelligence] Starting scan for "${query}" (limit ${limit})`);

  // ── Step 1: Scrape Amazon via Apify ──────────────────────
  const products = await scrapeAmazon(query, limit);
  await job.updateProgress(50);

  if (products.length === 0) {
    console.log("[amazon-intelligence] No products returned");
    return { query, productsFound: 0 };
  }

  // ── Step 2: Forward to enrichment pipeline ───────────────
  const enrichJob = await enrichQueue.add("enrich-amazon-products", {
    scanId: `amazon-intel-${Date.now()}`,
    products,
  });
  await job.updateProgress(100);

  console.log(`[amazon-intelligence] Found ${products.length} products → enrich job ${enrichJob.id}`);

  return {
    query,
    productsFound: products.length,
    enrichJobId: enrichJob.id,
  };
}

async function scrapeAmazon(query: string, limit: number): Promise<RawProduct[]> {
  if (!APIFY_TOKEN) {
    console.warn("[amazon-intelligence] APIFY_API_TOKEN not set");
    return [];
  }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryOrItemUrls: [{ url: `https://www.amazon.com/s?k=${encodeURIComponent(query)}` }],
          maxItems: Math.min(limit, 100),
        }),
        signal: AbortSignal.timeout(90_000),
      }
    );

    if (!res.ok) {
      console.error(`[amazon-intelligence] Apify error: ${res.status}`);
      return [];
    }

    const items: Record<string, unknown>[] = await res.json() as Record<string, unknown>[];
    if (!Array.isArray(items)) return [];

    return items.slice(0, limit).map((item, i) => ({
      external_id: String(item.asin || item.id || `amazon-${i}`),
      title: String(item.title || item.name || "Untitled"),
      price: parseFloat(String(item.price || item.currentPrice || 0)) || 0,
      url: String(item.url || item.link || ""),
      image_url: String(item.thumbnailImage || item.image || ""),
      sales_count: Number(item.bsr || item.salesRank || 0),
      review_count: Number(item.reviewsCount || item.ratings_total || 0),
      rating: parseFloat(String(item.stars || item.rating || 0)) || 0,
      source: "amazon",
    }));
  } catch (err) {
    console.error("[amazon-intelligence] Scrape failed:", err);
    return [];
  }
}
