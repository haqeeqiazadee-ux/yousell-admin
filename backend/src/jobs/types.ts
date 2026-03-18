/**
 * Job queue names and shared data interfaces for the worker orchestration layer.
 *
 * Each queue handles one concern.  Jobs can be enqueued independently or
 * chained (e.g. product-scan → enrich-product).
 */

// ── Queue names ──────────────────────────────────────────────
export const QUEUES = {
  PRODUCT_SCAN: "product-scan",
  ENRICH_PRODUCT: "enrich-product",
  TREND_SCAN: "trend-scan",
  INFLUENCER_DISCOVERY: "influencer-discovery",
  SUPPLIER_DISCOVERY: "supplier-discovery",
  TIKTOK_DISCOVERY: "tiktok-discovery",
  TIKTOK_PRODUCT_EXTRACT: "tiktok-product-extract",
  TIKTOK_ENGAGEMENT_ANALYSIS: "tiktok-engagement-analysis",
  TIKTOK_CROSS_MATCH: "tiktok-cross-match",
  PRODUCT_CLUSTERING: "product-clustering",
  TREND_DETECTION: "trend-detection",
  CREATOR_MATCHING: "creator-matching",
  AMAZON_INTELLIGENCE: "amazon-intelligence",
  SHOPIFY_INTELLIGENCE: "shopify-intelligence",
  AD_INTELLIGENCE: "ad-intelligence",

  // ── v8 Spec Queues (Phase 2 audit — stub implementations) ──
  TRANSFORM_QUEUE: "transform-queue",
  SCORING_QUEUE: "scoring-queue",
  CONTENT_QUEUE: "content-queue",
  DISTRIBUTION_QUEUE: "distribution-queue",
  ORDER_TRACKING: "order-tracking-queue",
  FINANCIAL_MODEL: "financial-model",
  BLUEPRINT_QUEUE: "blueprint-queue",
  NOTIFICATION_QUEUE: "notification-queue",
  INFLUENCER_OUTREACH: "influencer-outreach",
  INFLUENCER_REFRESH: "influencer-refresh",
  SUPPLIER_REFRESH: "supplier-refresh",
  AFFILIATE_REFRESH: "affiliate-refresh",
  AFFILIATE_CONTENT_GENERATE: "affiliate-content-generate",
  AFFILIATE_COMMISSION_TRACK: "affiliate-commission-track",
  POD_DISCOVERY: "pod-discovery",
  POD_PROVISION: "pod-provision",
  POD_FULFILLMENT_SYNC: "pod-fulfillment-sync",
  PUSH_TO_SHOPIFY: "push-to-shopify",
  PUSH_TO_TIKTOK: "push-to-tiktok",
  PUSH_TO_AMAZON: "push-to-amazon",
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

// ── Engine → Queue ownership map ────────────────────────────
// Maps each queue to the engine that owns it (v8 spec Section 9A)
export const ENGINE_QUEUE_MAP: Record<string, string> = {
  [QUEUES.PRODUCT_SCAN]: 'discovery',
  [QUEUES.ENRICH_PRODUCT]: 'discovery',
  [QUEUES.TREND_SCAN]: 'trend-detection',
  [QUEUES.TIKTOK_DISCOVERY]: 'tiktok-discovery',
  [QUEUES.TIKTOK_PRODUCT_EXTRACT]: 'tiktok-discovery',
  [QUEUES.TIKTOK_ENGAGEMENT_ANALYSIS]: 'tiktok-discovery',
  [QUEUES.TIKTOK_CROSS_MATCH]: 'tiktok-discovery',
  [QUEUES.PRODUCT_CLUSTERING]: 'clustering',
  [QUEUES.TREND_DETECTION]: 'trend-detection',
  [QUEUES.CREATOR_MATCHING]: 'creator-matching',
  [QUEUES.AMAZON_INTELLIGENCE]: 'amazon-intelligence',
  [QUEUES.SHOPIFY_INTELLIGENCE]: 'shopify-intelligence',
  [QUEUES.AD_INTELLIGENCE]: 'ad-intelligence',
  [QUEUES.INFLUENCER_DISCOVERY]: 'influencer-discovery',
  [QUEUES.SUPPLIER_DISCOVERY]: 'supplier-discovery',
  [QUEUES.TRANSFORM_QUEUE]: 'discovery',
  [QUEUES.SCORING_QUEUE]: 'scoring',
  [QUEUES.CONTENT_QUEUE]: 'content',
  [QUEUES.DISTRIBUTION_QUEUE]: 'content',
  [QUEUES.ORDER_TRACKING]: 'store-integration',
  [QUEUES.FINANCIAL_MODEL]: 'analytics',
  [QUEUES.BLUEPRINT_QUEUE]: 'analytics',
  [QUEUES.NOTIFICATION_QUEUE]: 'platform',
  [QUEUES.INFLUENCER_OUTREACH]: 'influencer-discovery',
  [QUEUES.INFLUENCER_REFRESH]: 'influencer-discovery',
  [QUEUES.SUPPLIER_REFRESH]: 'supplier-discovery',
  [QUEUES.AFFILIATE_REFRESH]: 'affiliate',
  [QUEUES.AFFILIATE_CONTENT_GENERATE]: 'affiliate',
  [QUEUES.AFFILIATE_COMMISSION_TRACK]: 'affiliate',
  [QUEUES.POD_DISCOVERY]: 'pod',
  [QUEUES.POD_PROVISION]: 'pod',
  [QUEUES.POD_FULFILLMENT_SYNC]: 'pod',
  [QUEUES.PUSH_TO_SHOPIFY]: 'store-integration',
  [QUEUES.PUSH_TO_TIKTOK]: 'store-integration',
  [QUEUES.PUSH_TO_AMAZON]: 'store-integration',
} as const;

// ── Job data interfaces ──────────────────────────────────────

export interface ProductScanJobData {
  mode: "quick" | "full" | "client";
  query: string;
  userId: string;
  scanId?: string; // set after scan record creation
}

export interface EnrichProductJobData {
  scanId: string;
  products: RawProduct[];
}

export interface RawProduct {
  external_id: string;
  title: string;
  price: number;
  url: string;
  image_url: string;
  sales_count: number;
  review_count: number;
  rating: number;
  source: string;
}

export interface TrendScanJobData {
  query: string;
  scanId?: string;
  userId: string;
}

export interface InfluencerDiscoveryJobData {
  niche: string;
  scanId?: string;
  userId: string;
}

export interface SupplierDiscoveryJobData {
  productName: string;
  category?: string;
  scanId?: string;
  userId: string;
}

export interface TikTokDiscoveryJobData {
  /** Search query or hashtag (e.g. "trending gadgets", "#tiktokmademebuyit") */
  query: string;
  /** Number of results to fetch (default 30, max 100) */
  limit?: number;
  userId: string;
}

export interface TikTokVideo {
  video_id: string;
  url: string;
  description: string;
  author_username: string;
  author_id: string;
  author_followers: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  hashtags: string[];
  music_title: string | null;
  create_time: string;
  thumbnail_url: string | null;
  /** Product signals extracted from the video */
  product_urls: string[];
  has_product_link: boolean;
}

export interface TikTokProductExtractJobData {
  /** Filter: only process videos from this discovery query */
  discoveryQuery?: string;
  /** Minimum view count to consider a video (default 10000) */
  minViews?: number;
  userId: string;
}

export interface TikTokEngagementAnalysisJobData {
  /** Analyze only this specific hashtag, or all if omitted */
  hashtag?: string;
  /** Minimum videos a hashtag must appear in to be analyzed (default 3) */
  minVideoCount?: number;
  userId: string;
}

export interface TikTokCrossMatchJobData {
  /** Product title keywords to search on other platforms */
  keywords: string[];
  /** Platforms to cross-reference (default: amazon, shopify) */
  platforms?: ("amazon" | "shopify")[];
  /** Minimum score on the TikTok side to qualify (default 40) */
  minTikTokScore?: number;
  userId: string;
}

// ── Phase 2: Product Intelligence ──────────────────────────

export interface ProductClusteringJobData {
  /** Minimum score to include products in clustering (default 30) */
  minScore?: number;
  /** Similarity threshold for keyword overlap (0-1, default 0.3) */
  similarityThreshold?: number;
  userId: string;
}

export interface TrendDetectionJobData {
  /** Only analyze products from this platform, or all if omitted */
  platform?: string;
  /** Minimum products in a cluster to flag as trending (default 3) */
  minClusterSize?: number;
  userId: string;
}

// ── Phase 3: Creator Intelligence ──────────────────────────

export interface CreatorMatchingJobData {
  /** Product ID to match creators for, or auto-match all 60+ products */
  productId?: string;
  /** Minimum product score to auto-match (default 60) */
  minProductScore?: number;
  /** Maximum creators to match per product (default 10) */
  maxCreatorsPerProduct?: number;
  userId: string;
}

// ── Phase 4: Marketplace Intelligence ──────────────────────

export interface AmazonIntelligenceJobData {
  /** Search query or category (e.g. "beauty tools", "electronics") */
  query: string;
  /** Number of results to fetch (default 50) */
  limit?: number;
  userId: string;
}

export interface ShopifyIntelligenceJobData {
  /** Niche or category to discover stores in */
  niche: string;
  /** Number of stores to scan (default 20) */
  limit?: number;
  userId: string;
}

// ── Phase 5: Ad Intelligence ───────────────────────────────

export interface AdIntelligenceJobData {
  /** Search query for ad discovery */
  query: string;
  /** Platforms to search (default: tiktok, facebook) */
  platforms?: ("tiktok" | "facebook")[];
  /** Number of ads to fetch per platform (default 20) */
  limit?: number;
  userId: string;
}

// ── v8 Spec Queue Job Data (stub interfaces) ────────────────

export interface TransformJobData {
  scanId: string;
  productIds: string[];
  userId: string;
}

export interface ScoringJobData {
  productIds: string[];
  applyPodModifiers?: boolean;
  userId: string;
}

export interface ContentQueueJobData {
  clientId: string;
  productId: string;
  contentType: string;
  channel?: string;
  userId: string;
}

export interface DistributionJobData {
  contentId: string;
  channels: string[];
  userId: string;
}

export interface OrderTrackingJobData {
  orderId: string;
  channelType: string;
  userId: string;
}

export interface FinancialModelJobData {
  productId: string;
  userId: string;
}

export interface BlueprintJobData {
  productId: string;
  includeSections?: string[];
  userId: string;
}

export interface NotificationJobData {
  recipientId: string;
  type: 'email' | 'in_app' | 'push';
  template: string;
  data: Record<string, unknown>;
}

export interface InfluencerOutreachJobData {
  influencerId: string;
  productId: string;
  templateId?: string;
  userId: string;
}

export interface RefreshJobData {
  entityType: 'influencer' | 'supplier' | 'affiliate';
  entityIds?: string[];
  userId: string;
}

export interface AffiliateContentGenerateJobData {
  programId: string;
  contentType: string;
  userId: string;
}

export interface AffiliateCommissionTrackJobData {
  programId: string;
  period?: string;
  userId: string;
}

export interface PodDiscoveryJobData {
  niche?: string;
  platforms?: string[];
  userId: string;
}

export interface PodProvisionJobData {
  designId: string;
  fulfillmentPartner: 'printful' | 'printify' | 'gelato';
  userId: string;
}

export interface PodFulfillmentSyncJobData {
  orderId: string;
  fulfillmentPartner: string;
  userId: string;
}

export interface StorePushJobData {
  productId: string;
  channelType: 'shopify' | 'tiktok' | 'amazon';
  clientId: string;
  userId: string;
}
