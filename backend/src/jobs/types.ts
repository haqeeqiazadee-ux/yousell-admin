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
