/**
 * Product Scan Job
 *
 * Scrapes products from configured platforms (TikTok, Amazon, Shopify,
 * Pinterest) and enqueues an enrich-product job for scoring + DB storage.
 */
import { Job, Queue } from "bullmq";
import { connection } from "../lib/queue";
import { supabase } from "../lib/supabase";
import { scrapePlatform } from "../lib/providers";
import type { ProductScanJobData, RawProduct } from "./types";
import { QUEUES } from "./types";

const SCAN_STEPS: Record<string, { platform: string; weight: number }[]> = {
  quick: [
    { platform: "tiktok", weight: 50 },
    { platform: "amazon", weight: 50 },
  ],
  full: [
    { platform: "tiktok", weight: 25 },
    { platform: "amazon", weight: 25 },
    { platform: "shopify", weight: 25 },
    { platform: "pinterest", weight: 25 },
  ],
  client: [
    { platform: "tiktok", weight: 50 },
    { platform: "amazon", weight: 50 },
  ],
};

const enrichQueue = new Queue(QUEUES.ENRICH_PRODUCT, { connection });
const trendQueue = new Queue(QUEUES.TREND_SCAN, { connection });

export async function processProductScan(job: Job<ProductScanJobData>) {
  const { mode, query, userId } = job.data;
  const steps = SCAN_STEPS[mode] || SCAN_STEPS.quick;

  // Create scan record
  const { data: scan, error: scanError } = await supabase
    .from("scan_history")
    .insert({
      mode,
      status: "running",
      started_at: new Date().toISOString(),
      user_id: userId,
      job_id: job.id,
    })
    .select()
    .single();

  if (scanError) {
    throw new Error(`Failed to create scan record: ${scanError.message}`);
  }

  const startTime = Date.now();
  let totalProgress = 0;
  const allProducts: RawProduct[] = [];

  try {
    // Scrape all platforms in parallel
    const scrapeResults = await Promise.all(
      steps.map(async (step) => {
        const products = await scrapePlatform(step.platform, query);
        return { products, weight: step.weight };
      })
    );

    for (const result of scrapeResults) {
      allProducts.push(...result.products);
      totalProgress += result.weight;
    }
    await job.updateProgress(totalProgress);

    // Enqueue trend scan as a separate job
    await trendQueue.add("trend-scan", {
      query,
      scanId: scan.id,
      userId,
    });

    // Enqueue enrichment (scoring + DB upsert + alerts)
    if (allProducts.length > 0) {
      await enrichQueue.add("enrich-products", {
        scanId: scan.id,
        products: allProducts,
      });
    }

    const duration = Date.now() - startTime;

    await supabase
      .from("scan_history")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        product_count: allProducts.length,
        duration_ms: duration,
      })
      .eq("id", scan.id);

    return {
      scanId: scan.id,
      mode,
      totalProducts: allProducts.length,
      platforms: steps.map((s) => s.platform),
      duration,
    };
  } catch (error) {
    await supabase
      .from("scan_history")
      .update({ status: "failed", error: String(error) })
      .eq("id", scan.id);
    throw error;
  }
}
