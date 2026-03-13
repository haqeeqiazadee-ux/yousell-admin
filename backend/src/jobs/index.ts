/**
 * Job Orchestration Layer
 *
 * Registers a BullMQ Worker for each queue.  Import this module from
 * the main entry point to start all workers.
 */
import { Worker } from "bullmq";
import { connection } from "../lib/queue";
import { QUEUES } from "./types";
import { processProductScan } from "./product-scan";
import { processEnrichProduct } from "./enrich-product";
import { processTrendScan } from "./trend-scan";
import { processInfluencerDiscovery } from "./influencer-discovery";
import { processSupplierDiscovery } from "./supplier-discovery";
import { processTikTokDiscovery } from "./tiktok-discovery";
import { processTikTokProductExtract } from "./tiktok-product-extract";
import { processTikTokEngagementAnalysis } from "./tiktok-engagement-analysis";
import { processTikTokCrossMatch } from "./tiktok-cross-match";

function logEvents(worker: Worker, label: string) {
  worker.on("completed", (job) => {
    console.log(`[${label}] Job ${job.id} completed`);
  });
  worker.on("failed", (job, error) => {
    console.error(`[${label}] Job ${job?.id} failed:`, error);
  });
}

// ── Workers ──────────────────────────────────────────────────

export const productScanWorker = new Worker(
  QUEUES.PRODUCT_SCAN,
  processProductScan,
  { connection, concurrency: 2 }
);
logEvents(productScanWorker, "product-scan");

export const enrichProductWorker = new Worker(
  QUEUES.ENRICH_PRODUCT,
  processEnrichProduct,
  { connection, concurrency: 3 }
);
logEvents(enrichProductWorker, "enrich-product");

export const trendScanWorker = new Worker(
  QUEUES.TREND_SCAN,
  processTrendScan,
  { connection, concurrency: 2 }
);
logEvents(trendScanWorker, "trend-scan");

export const influencerDiscoveryWorker = new Worker(
  QUEUES.INFLUENCER_DISCOVERY,
  processInfluencerDiscovery,
  { connection, concurrency: 1 }
);
logEvents(influencerDiscoveryWorker, "influencer-discovery");

export const supplierDiscoveryWorker = new Worker(
  QUEUES.SUPPLIER_DISCOVERY,
  processSupplierDiscovery,
  { connection, concurrency: 1 }
);
logEvents(supplierDiscoveryWorker, "supplier-discovery");

export const tiktokDiscoveryWorker = new Worker(
  QUEUES.TIKTOK_DISCOVERY,
  processTikTokDiscovery,
  { connection, concurrency: 2 }
);
logEvents(tiktokDiscoveryWorker, "tiktok-discovery");

export const tiktokProductExtractWorker = new Worker(
  QUEUES.TIKTOK_PRODUCT_EXTRACT,
  processTikTokProductExtract,
  { connection, concurrency: 2 }
);
logEvents(tiktokProductExtractWorker, "tiktok-product-extract");

export const tiktokEngagementWorker = new Worker(
  QUEUES.TIKTOK_ENGAGEMENT_ANALYSIS,
  processTikTokEngagementAnalysis,
  { connection, concurrency: 1 }
);
logEvents(tiktokEngagementWorker, "tiktok-engagement-analysis");

export const tiktokCrossMatchWorker = new Worker(
  QUEUES.TIKTOK_CROSS_MATCH,
  processTikTokCrossMatch,
  { connection, concurrency: 1 }
);
logEvents(tiktokCrossMatchWorker, "tiktok-cross-match");

console.log(
  "Job workers started:",
  Object.values(QUEUES).join(", ")
);
