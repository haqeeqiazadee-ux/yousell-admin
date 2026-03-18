/**
 * Engine API Client Type Contracts
 *
 * Defines the typed interfaces for consuming engine APIs from the frontend.
 * Each engine has a strongly-typed client interface matching its API routes.
 *
 * Phase C.1-C.2: Type contracts only — implementations come in Phase D.
 */

// ─── Discovery Engine API ──────────────────────────────────

export interface ScanParams {
  mode: 'quick' | 'full' | 'client';
  query?: string;
  platforms?: string[];
}

export interface ScanResult {
  success: boolean;
  scanId: string;
  productsFound: number;
  hotProducts: number;
  platforms: string[];
  duration: number;
  errors: string[];
}

export interface ProductFilters {
  status?: string;
  platform?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ProductRecord {
  id: string;
  title: string;
  platform: string;
  category: string;
  price: number;
  image_url: string | null;
  external_url: string | null;
  final_score: number;
  trend_score: number;
  viral_score: number;
  profit_score: number;
  trend_stage: string;
  status: string;
  created_at: string;
  tags: string[];
}

export interface PaginatedProducts {
  products: ProductRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface DiscoveryEngineAPI {
  scan(params: ScanParams): Promise<ScanResult>;
  getProducts(filters: ProductFilters): Promise<PaginatedProducts>;
}

// ─── TikTok Discovery Engine API ───────────────────────────

export interface TikTokDiscoverParams {
  query: string;
  limit?: number;
}

export interface TikTokVideo {
  id: string;
  video_id: string;
  url: string;
  description: string;
  author_username: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  hashtags: string[];
  has_product_link: boolean;
  created_at: string;
}

export interface TikTokDiscoverResult {
  success: boolean;
  videosFound: number;
  videosStored: number;
  errors: string[];
}

export interface TikTokVideosResult {
  videos: TikTokVideo[];
  total: number;
}

export interface TikTokEngineAPI {
  discover(params: TikTokDiscoverParams): Promise<TikTokDiscoverResult>;
  getVideos(limit?: number, offset?: number): Promise<TikTokVideosResult>;
}

// ─── Scoring Engine API ────────────────────────────────────

export interface ScoreParams {
  productId: string;
}

export interface ScoreResult {
  productId: string;
  trendScore: number;
  viralScore: number;
  profitScore: number;
  finalScore: number;
  tier: 'HOT' | 'WARM' | 'WATCH' | 'COLD';
  stage: string;
}

export interface BatchScoreResult {
  results: ScoreResult[];
  errors: string[];
}

export interface ScoringEngineAPI {
  calculate(params: ScoreParams): Promise<ScoreResult>;
  getBatchScores(productIds: string[]): Promise<BatchScoreResult>;
}
