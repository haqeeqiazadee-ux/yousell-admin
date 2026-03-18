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

// ─── Clustering Engine API ─────────────────────────────────

export interface ClusterRecord {
  id: string;
  name: string;
  keywords: string[];
  product_count: number;
  avg_score: number;
  platforms: string[];
  trend_stage: string;
  price_range_min: number;
  price_range_max: number;
  updated_at: string;
}

export interface ClusteringParams {
  minScore?: number;
  similarityThreshold?: number;
}

export interface ClusteringResult {
  clustersCreated: number;
  productsAssigned: number;
  errors: string[];
}

export interface ClusteringEngineAPI {
  getClusters(): Promise<{ clusters: ClusterRecord[]; total: number }>;
  runClustering(params?: ClusteringParams): Promise<ClusteringResult>;
}

// ─── Creator Matching Engine API ───────────────────────────

export interface CreatorMatch {
  id: string;
  product_id: string;
  influencer_id: string;
  match_score: number;
  niche_alignment: number;
  engagement_fit: number;
  price_range_fit: number;
  estimated_views: number;
  estimated_conversions: number;
  estimated_profit: number;
  status: string;
  matched_at: string;
  // Joined data
  product_title?: string;
  influencer_username?: string;
}

export interface MatchingParams {
  minProductScore?: number;
  maxCreatorsPerProduct?: number;
}

export interface MatchingResult {
  productsMatched: number;
  matchesCreated: number;
  errors: string[];
}

export interface CreatorMatchingEngineAPI {
  getMatches(productId?: string): Promise<{ matches: CreatorMatch[]; total: number }>;
  runMatching(params?: MatchingParams): Promise<MatchingResult>;
}

// ─── Influencer Discovery Engine API ───────────────────────

export interface InfluencerRecord {
  id: string;
  username: string;
  platform: string;
  followers: number;
  engagement_rate: number;
  niche: string;
  conversion_score: number;
  tier: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface InfluencerFilters {
  platform?: string;
  niche?: string;
  minFollowers?: number;
  sort?: string;
  limit?: number;
}

export interface InfluencerEngineAPI {
  getInfluencers(filters?: InfluencerFilters): Promise<{ influencers: InfluencerRecord[]; total: number }>;
}

// ─── Supplier Discovery Engine API ─────────────────────────

export interface SupplierRecord {
  id: string;
  name: string;
  platform: string;
  url: string;
  country: string;
  min_order: number;
  price_range: string;
  rating: number;
  response_time: string;
  created_at: string;
}

export interface SupplierEngineAPI {
  getSuppliers(productId?: string): Promise<{ suppliers: SupplierRecord[]; total: number }>;
}

// ─── Ad Intelligence Engine API ────────────────────────────

export interface AdRecord {
  id: string;
  external_id: string;
  platform: string;
  advertiser_name: string;
  ad_text: string;
  landing_url: string;
  thumbnail_url: string;
  impressions: number;
  spend_estimate: number;
  days_running: number;
  is_scaling: boolean;
  discovery_query: string;
  discovered_at: string;
}

export interface AdDiscoveryParams {
  query: string;
  platforms?: string[];
  limit?: number;
}

export interface AdDiscoveryResult {
  adsFound: number;
  adsStored: number;
  errors: string[];
}

export interface AdIntelligenceEngineAPI {
  getAds(query?: string): Promise<{ ads: AdRecord[]; total: number }>;
  discoverAds(params: AdDiscoveryParams): Promise<AdDiscoveryResult>;
}

// ─── Trend Detection Engine API ────────────────────────────

export interface TrendRecord {
  id: string;
  keyword: string;
  trend_score: number;
  trend_direction: 'rising' | 'stable' | 'declining';
  volume: number;
  source: string;
  category: string | null;
  fetched_at: string;
}

export interface TrendDetectionResult {
  trendsDetected: number;
  trendsUpdated: number;
  errors: string[];
}

export interface TrendDetectionEngineAPI {
  getTrends(direction?: string): Promise<{ trends: TrendRecord[]; total: number }>;
  runDetection(): Promise<TrendDetectionResult>;
}

// ─── Engine Health API ─────────────────────────────────────

export interface EngineHealthStatus {
  name: string;
  version: string;
  status: 'idle' | 'running' | 'paused' | 'error' | 'stopped';
  healthy: boolean;
  queues: string[];
}

export interface EngineHealthAPI {
  getHealth(): Promise<{ engines: EngineHealthStatus[] }>;
}
