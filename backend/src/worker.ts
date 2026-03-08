import "dotenv/config";
import { Worker, Job } from "bullmq";
import { connection } from "./lib/queue";
import { supabase } from "./lib/supabase";
import { generateScanResults, Platform } from "./lib/mock-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScanJobData {
  scan_mode: "quick" | "full" | "client";
  client_id: string | null;
  scan_id: string | null;
}

interface ScanStepResult {
  platform: string;
  products_found: number;
}

// ---------------------------------------------------------------------------
// Scan step definitions
// ---------------------------------------------------------------------------

const QUICK_STEPS: { label: string; platform: Platform; weight: number }[] = [
  { label: "TikTok Creative Center", platform: "tiktok", weight: 40 },
  // TODO: Integrate pytrends API for Google Trends data
  // TODO: Integrate Reddit API (or Apify actor) for subreddit scanning
];

const FULL_STEPS: { label: string; platform: Platform; weight: number }[] = [
  { label: "TikTok Creative Center", platform: "tiktok", weight: 15 },
  { label: "Amazon Best Sellers", platform: "amazon", weight: 15 },
  { label: "Shopify Trending Stores", platform: "shopify", weight: 14 },
  { label: "Pinterest Trending Pins", platform: "pinterest", weight: 14 },
  { label: "Digital Products (Gumroad/Notion)", platform: "digital", weight: 14 },
  { label: "AI Affiliate Programs", platform: "ai_affiliate", weight: 14 },
  { label: "Physical Affiliate Products", platform: "physical_affiliate", weight: 14 },
];

const CLIENT_STEPS: { label: string; platform: Platform; weight: number }[] = [
  { label: "Client Niche - TikTok", platform: "tiktok", weight: 15 },
  { label: "Client Niche - Amazon", platform: "amazon", weight: 15 },
  { label: "Client Niche - Shopify", platform: "shopify", weight: 14 },
  { label: "Client Niche - Pinterest", platform: "pinterest", weight: 14 },
  { label: "Client Niche - Digital", platform: "digital", weight: 14 },
  { label: "Client Niche - AI Affiliate", platform: "ai_affiliate", weight: 14 },
  { label: "Client Niche - Physical Affiliate", platform: "physical_affiliate", weight: 14 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateScanHistory(
  scanId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from("scan_history")
    .update(updates)
    .eq("id", scanId);

  if (error) {
    console.error(`[Worker] Failed to update scan_history (${scanId}):`, error.message);
  }
}

// ---------------------------------------------------------------------------
// Main scan processor
// ---------------------------------------------------------------------------

async function processScan(job: Job<ScanJobData>): Promise<Record<string, unknown>> {
  const { scan_mode, client_id, scan_id } = job.data;

  console.log(`[Worker] Starting scan job ${job.id} (mode=${scan_mode}, client=${client_id || "N/A"})`);

  // Mark as running in Supabase
  if (scan_id) {
    await updateScanHistory(scan_id, {
      status: "running",
      progress: 0,
    });
  }

  // Select steps based on scan mode
  let steps: { label: string; platform: Platform; weight: number }[];
  switch (scan_mode) {
    case "quick":
      steps = QUICK_STEPS;
      break;
    case "full":
      steps = FULL_STEPS;
      break;
    case "client":
      steps = CLIENT_STEPS;
      break;
    default:
      throw new Error(`Unknown scan_mode: ${scan_mode}`);
  }

  const stepResults: ScanStepResult[] = [];
  let cumulativeProgress = 0;

  for (const step of steps) {
    console.log(`[Worker] [${job.id}] Running step: ${step.label}...`);

    // TODO: Replace mock delay with actual API calls:
    // - TikTok: Use Apify actor (APIFY_API_TOKEN) to scrape TikTok Creative Center
    // - Amazon: Use Apify actor or Product Advertising API for Best Sellers
    // - Shopify: Use Apify actor to discover trending Shopify stores
    // - Pinterest: Use Pinterest API or Apify actor for trending pins
    // - Digital: Scrape Gumroad trending, Notion template gallery
    // - AI Affiliate: Query affiliate networks (Impact, PartnerStack) for AI tools
    // - Physical Affiliate: Query Amazon Associates, ShareASale for physical products
    // - Google Trends: Use pytrends (via Python subprocess or API proxy)
    // - Reddit: Use Reddit API or Apify for subreddit product mentions

    // Simulate work with a delay (1-3 seconds per step)
    const delayMs = 1000 + Math.random() * 2000;
    await sleep(delayMs);

    // Generate mock products for this step
    const mockCount = scan_mode === "quick" ? 5 : scan_mode === "full" ? 5 : 3;
    stepResults.push({
      platform: step.platform,
      products_found: mockCount,
    });

    cumulativeProgress += step.weight;
    const progress = Math.min(cumulativeProgress, 99);

    await job.updateProgress(progress);
    console.log(`[Worker] [${job.id}] Step "${step.label}" complete. Progress: ${progress}%`);

    // Update Supabase progress
    if (scan_id) {
      await updateScanHistory(scan_id, { progress });
    }
  }

  // Generate final mock results
  const scanResults = generateScanResults(scan_mode, client_id || undefined);

  // Mark as complete
  await job.updateProgress(100);
  console.log(`[Worker] [${job.id}] Scan complete. Found ${scanResults.products.length} products.`);

  const result = {
    scan_mode,
    client_id,
    total_products: scanResults.products.length,
    summary: scanResults.summary,
    step_results: stepResults,
    completed_at: new Date().toISOString(),
  };

  // Update Supabase with final results
  if (scan_id) {
    await updateScanHistory(scan_id, {
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
      results: result,
      products_found: scanResults.products.length,
    });

    // TODO: Insert discovered products into a `discovered_products` table
    // for (const product of scanResults.products) {
    //   await supabase.from("discovered_products").insert({
    //     scan_id,
    //     ...product,
    //   });
    // }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Worker setup
// ---------------------------------------------------------------------------

const worker = new Worker<ScanJobData>("scan", processScan, {
  connection,
  concurrency: 2,
  limiter: {
    max: 5,
    duration: 60_000, // max 5 jobs per minute
  },
});

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

worker.on("failed", async (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);

  // Update Supabase on failure
  if (job?.data?.scan_id) {
    await updateScanHistory(job.data.scan_id, {
      status: "failed",
      error_message: err.message,
      completed_at: new Date().toISOString(),
    });
  }
});

worker.on("error", (err) => {
  console.error("[Worker] Worker error:", err.message);
});

console.log("[Worker] Scan worker started. Waiting for jobs...");
