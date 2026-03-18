/**
 * Job Orchestration Layer
 *
 * Registers a BullMQ Worker for each queue.  Import this module from
 * the main entry point to start all workers.
 */
import { Worker } from "bullmq";
import { connection } from "../lib/queue";
import { QUEUES } from "./types";

// Default worker options with retry and dead-letter support
const defaultOpts = {
  connection,
  settings: {
    backoffStrategy: (attemptsMade: number) => {
      // Exponential backoff: 5s, 20s, 80s, 320s
      return Math.min(5000 * Math.pow(4, attemptsMade - 1), 300000);
    },
  },
};
import { processProductScan } from "./product-scan";
import { processEnrichProduct } from "./enrich-product";
import { processTrendScan } from "./trend-scan";
import { processInfluencerDiscovery } from "./influencer-discovery";
import { processSupplierDiscovery } from "./supplier-discovery";
import { processTikTokDiscovery } from "./tiktok-discovery";
import { processTikTokProductExtract } from "./tiktok-product-extract";
import { processTikTokEngagementAnalysis } from "./tiktok-engagement-analysis";
import { processTikTokCrossMatch } from "./tiktok-cross-match";
import { processProductClustering } from "./product-clustering";
import { processTrendDetection } from "./trend-detection";
import { processCreatorMatching } from "./creator-matching";
import { processAmazonIntelligence } from "./amazon-intelligence";
import { processShopifyIntelligence } from "./shopify-intelligence";
import { processAdIntelligence } from "./ad-intelligence";
import {
  processTransform, processScoring, processOrderTracking, processFinancialModel, processBlueprint,
  processInfluencerOutreach, processInfluencerRefresh, processSupplierRefresh,
  processAffiliateRefresh, processAffiliateContentGenerate,
  processPushToTiktok, processPushToAmazon,
} from "./stub-workers";
import { processPushToShopify } from "./push-to-shopify";
import { processContentGeneration as processContentQueue } from "./content-generation";
import { processDistribution } from "./distribution";
import { processAffiliateCommission as processAffiliateCommissionTrack } from "./affiliate-commission";
import { processPodDiscovery } from "./pod-discovery";
import { processPodProvision } from "./pod-provision";
import { processPodFulfillmentSync } from "./pod-fulfillment-sync";
import { processNotification } from "./notification";

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
  { ...defaultOpts, concurrency: 2 }
);
logEvents(productScanWorker, "product-scan");

export const enrichProductWorker = new Worker(
  QUEUES.ENRICH_PRODUCT,
  processEnrichProduct,
  { ...defaultOpts, concurrency: 3 }
);
logEvents(enrichProductWorker, "enrich-product");

export const trendScanWorker = new Worker(
  QUEUES.TREND_SCAN,
  processTrendScan,
  { ...defaultOpts, concurrency: 2 }
);
logEvents(trendScanWorker, "trend-scan");

export const influencerDiscoveryWorker = new Worker(
  QUEUES.INFLUENCER_DISCOVERY,
  processInfluencerDiscovery,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(influencerDiscoveryWorker, "influencer-discovery");

export const supplierDiscoveryWorker = new Worker(
  QUEUES.SUPPLIER_DISCOVERY,
  processSupplierDiscovery,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(supplierDiscoveryWorker, "supplier-discovery");

export const tiktokDiscoveryWorker = new Worker(
  QUEUES.TIKTOK_DISCOVERY,
  processTikTokDiscovery,
  { ...defaultOpts, concurrency: 2 }
);
logEvents(tiktokDiscoveryWorker, "tiktok-discovery");

export const tiktokProductExtractWorker = new Worker(
  QUEUES.TIKTOK_PRODUCT_EXTRACT,
  processTikTokProductExtract,
  { ...defaultOpts, concurrency: 2 }
);
logEvents(tiktokProductExtractWorker, "tiktok-product-extract");

export const tiktokEngagementWorker = new Worker(
  QUEUES.TIKTOK_ENGAGEMENT_ANALYSIS,
  processTikTokEngagementAnalysis,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(tiktokEngagementWorker, "tiktok-engagement-analysis");

export const tiktokCrossMatchWorker = new Worker(
  QUEUES.TIKTOK_CROSS_MATCH,
  processTikTokCrossMatch,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(tiktokCrossMatchWorker, "tiktok-cross-match");

// ── Phase 2: Product Intelligence ──────────────────────────

export const productClusteringWorker = new Worker(
  QUEUES.PRODUCT_CLUSTERING,
  processProductClustering,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(productClusteringWorker, "product-clustering");

export const trendDetectionWorker = new Worker(
  QUEUES.TREND_DETECTION,
  processTrendDetection,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(trendDetectionWorker, "trend-detection");

// ── Phase 3: Creator Intelligence ──────────────────────────

export const creatorMatchingWorker = new Worker(
  QUEUES.CREATOR_MATCHING,
  processCreatorMatching,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(creatorMatchingWorker, "creator-matching");

// ── Phase 4: Marketplace Intelligence ──────────────────────

export const amazonIntelligenceWorker = new Worker(
  QUEUES.AMAZON_INTELLIGENCE,
  processAmazonIntelligence,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(amazonIntelligenceWorker, "amazon-intelligence");

export const shopifyIntelligenceWorker = new Worker(
  QUEUES.SHOPIFY_INTELLIGENCE,
  processShopifyIntelligence,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(shopifyIntelligenceWorker, "shopify-intelligence");

// ── Phase 5: Ad Intelligence ───────────────────────────────

export const adIntelligenceWorker = new Worker(
  QUEUES.AD_INTELLIGENCE,
  processAdIntelligence,
  { ...defaultOpts, concurrency: 1 }
);
logEvents(adIntelligenceWorker, "ad-intelligence");

// ── v8 Spec Stub Workers (Phase 2 audit) ─────────────────────

export const transformWorker = new Worker(QUEUES.TRANSFORM_QUEUE, processTransform, { ...defaultOpts, concurrency: 2 });
logEvents(transformWorker, "transform-queue");

export const scoringWorker = new Worker(QUEUES.SCORING_QUEUE, processScoring, { ...defaultOpts, concurrency: 2 });
logEvents(scoringWorker, "scoring-queue");

export const contentQueueWorker = new Worker(QUEUES.CONTENT_QUEUE, processContentQueue, { ...defaultOpts, concurrency: 1 });
logEvents(contentQueueWorker, "content-queue");

export const distributionWorker = new Worker(QUEUES.DISTRIBUTION_QUEUE, processDistribution, { ...defaultOpts, concurrency: 1 });
logEvents(distributionWorker, "distribution-queue");

export const orderTrackingWorker = new Worker(QUEUES.ORDER_TRACKING, processOrderTracking, { ...defaultOpts, concurrency: 1 });
logEvents(orderTrackingWorker, "order-tracking-queue");

export const financialModelWorker = new Worker(QUEUES.FINANCIAL_MODEL, processFinancialModel, { ...defaultOpts, concurrency: 1 });
logEvents(financialModelWorker, "financial-model");

export const blueprintWorker = new Worker(QUEUES.BLUEPRINT_QUEUE, processBlueprint, { ...defaultOpts, concurrency: 1 });
logEvents(blueprintWorker, "blueprint-queue");

export const notificationWorker = new Worker(QUEUES.NOTIFICATION_QUEUE, processNotification, { ...defaultOpts, concurrency: 2 });
logEvents(notificationWorker, "notification-queue");

export const influencerOutreachWorker = new Worker(QUEUES.INFLUENCER_OUTREACH, processInfluencerOutreach, { ...defaultOpts, concurrency: 1 });
logEvents(influencerOutreachWorker, "influencer-outreach");

export const influencerRefreshWorker = new Worker(QUEUES.INFLUENCER_REFRESH, processInfluencerRefresh, { ...defaultOpts, concurrency: 1 });
logEvents(influencerRefreshWorker, "influencer-refresh");

export const supplierRefreshWorker = new Worker(QUEUES.SUPPLIER_REFRESH, processSupplierRefresh, { ...defaultOpts, concurrency: 1 });
logEvents(supplierRefreshWorker, "supplier-refresh");

export const affiliateRefreshWorker = new Worker(QUEUES.AFFILIATE_REFRESH, processAffiliateRefresh, { ...defaultOpts, concurrency: 1 });
logEvents(affiliateRefreshWorker, "affiliate-refresh");

export const affiliateContentWorker = new Worker(QUEUES.AFFILIATE_CONTENT_GENERATE, processAffiliateContentGenerate, { ...defaultOpts, concurrency: 1 });
logEvents(affiliateContentWorker, "affiliate-content-generate");

export const affiliateCommissionWorker = new Worker(QUEUES.AFFILIATE_COMMISSION_TRACK, processAffiliateCommissionTrack, { ...defaultOpts, concurrency: 1 });
logEvents(affiliateCommissionWorker, "affiliate-commission-track");

export const podDiscoveryWorker = new Worker(QUEUES.POD_DISCOVERY, processPodDiscovery, { ...defaultOpts, concurrency: 1 });
logEvents(podDiscoveryWorker, "pod-discovery");

export const podProvisionWorker = new Worker(QUEUES.POD_PROVISION, processPodProvision, { ...defaultOpts, concurrency: 1 });
logEvents(podProvisionWorker, "pod-provision");

export const podFulfillmentSyncWorker = new Worker(QUEUES.POD_FULFILLMENT_SYNC, processPodFulfillmentSync, { ...defaultOpts, concurrency: 1 });
logEvents(podFulfillmentSyncWorker, "pod-fulfillment-sync");

export const pushToShopifyWorker = new Worker(QUEUES.PUSH_TO_SHOPIFY, processPushToShopify, { ...defaultOpts, concurrency: 1 });
logEvents(pushToShopifyWorker, "push-to-shopify");

export const pushToTiktokWorker = new Worker(QUEUES.PUSH_TO_TIKTOK, processPushToTiktok, { ...defaultOpts, concurrency: 1 });
logEvents(pushToTiktokWorker, "push-to-tiktok");

export const pushToAmazonWorker = new Worker(QUEUES.PUSH_TO_AMAZON, processPushToAmazon, { ...defaultOpts, concurrency: 1 });
logEvents(pushToAmazonWorker, "push-to-amazon");

console.log(
  "Job workers started:",
  Object.values(QUEUES).join(", ")
);
