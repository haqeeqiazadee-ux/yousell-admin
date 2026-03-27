/**
 * Shopify Intelligence Worker
 * @engine shopify-intelligence
 * @queue shopify-intelligence
 *
 * Discovers fast-growing Shopify stores and their top products
 * via Apify scraper. Identifies competitor stores and emerging brands.
 *
 * v7 spec: Shopify Store — fast-growing stores, top products.
 *
 * Phase 4 — Marketplace Intelligence.
 */
import { Job, Queue } from "bullmq";
import { connection } from "../lib/queue";
import { supabase } from "../lib/supabase";
import { QUEUES } from "./types";
import type { ShopifyIntelligenceJobData, RawProduct } from "./types";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR = "clearpath~shop-by-shopify-product-scraper";
const enrichQueue = new Queue(QUEUES.ENRICH_PRODUCT, { connection });

export async function processShopifyIntelligence(
  job: Job<ShopifyIntelligenceJobData>
) {
  const { niche, limit = 20 } = job.data;

  console.log(`[shopify-intelligence] Starting scan for "${niche}" (limit ${limit})`);

  // ── Step 1: Scrape Shopify stores via Apify ──────────────
  const products = await scrapeShopify(niche, limit);
  await job.updateProgress(50);

  if (products.length === 0) {
    console.log("[shopify-intelligence] No products returned");
    return { niche, productsFound: 0 };
  }

  // ── Step 2: Store competitor store data ──────────────────
  const stores = extractStoreData(products);
  if (stores.length > 0) {
    await supabase.from("competitors").upsert(
      stores.map((s) => ({
        name: s.store,
        platform: "shopify",
        url: s.url,
        product_count: s.productCount,
        niche,
        discovered_at: new Date().toISOString(),
      })),
      { onConflict: "name,platform", ignoreDuplicates: false }
    );
  }
  await job.updateProgress(70);

  // ── Step 3: Forward products to enrichment ───────────────
  const enrichJob = await enrichQueue.add("enrich-shopify-products", {
    scanId: `shopify-intel-${Date.now()}`,
    products,
  });
  await job.updateProgress(100);

  console.log(
    `[shopify-intelligence] Found ${products.length} products from ${stores.length} stores → enrich job ${enrichJob.id}`
  );

  return {
    niche,
    productsFound: products.length,
    storesDiscovered: stores.length,
    enrichJobId: enrichJob.id,
  };
}

async function scrapeShopify(niche: string, limit: number): Promise<RawProduct[]> {
  if (!APIFY_TOKEN) {
    console.warn("[shopify-intelligence] APIFY_API_TOKEN not set");
    return [];
  }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search: niche,
          maxItems: Math.min(limit * 5, 100),
        }),
        signal: AbortSignal.timeout(90_000),
      }
    );

    if (!res.ok) {
      console.error(`[shopify-intelligence] Apify error: ${res.status}`);
      return [];
    }

    const items: Record<string, unknown>[] = await res.json() as Record<string, unknown>[];
    if (!Array.isArray(items)) return [];

    return items.slice(0, limit * 5).map((item, i) => ({
      external_id: String(item.id || item.handle || `shopify-${i}`),
      title: String(item.title || item.name || "Untitled"),
      price: parseFloat(String(
        item.price || (item.variants as Record<string, unknown>[])?.[0]?.price || 0
      )) || 0,
      url: String(item.url || item.onlineStoreUrl || ""),
      image_url: String(
        item.featuredImage || (item.images as string[])?.[0] || ""
      ),
      sales_count: 0,
      review_count: 0,
      rating: 0,
      source: "shopify",
    }));
  } catch (err) {
    console.error("[shopify-intelligence] Scrape failed:", err);
    return [];
  }
}

function extractStoreData(
  products: RawProduct[]
): { store: string; url: string; productCount: number }[] {
  const storeMap = new Map<string, { url: string; count: number }>();

  for (const p of products) {
    try {
      const url = new URL(p.url);
      const store = url.hostname;
      const existing = storeMap.get(store);
      if (existing) {
        existing.count++;
      } else {
        storeMap.set(store, { url: `https://${store}`, count: 1 });
      }
    } catch {
      // invalid URL, skip
    }
  }

  return [...storeMap.entries()].map(([store, data]) => ({
    store,
    url: data.url,
    productCount: data.count,
  }));
}
