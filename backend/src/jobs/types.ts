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
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

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
