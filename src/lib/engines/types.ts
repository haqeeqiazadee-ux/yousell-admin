/**
 * YOUSELL Engine System — Core Type Definitions
 *
 * All engines must implement the Engine interface.
 * Inter-engine communication uses EngineEvent via the EventBus.
 *
 * @see CLAUDE.md Section 9 — Engine Independence Architecture
 * @see docs/YouSell_Platform_Technical_Specification_v8.md Section 9A
 */

// ─── Engine Identity ────────────────────────────────────────

export type EngineName =
  | 'discovery'
  | 'tiktok-discovery'
  | 'product-extraction'
  | 'clustering'
  | 'trend-detection'
  | 'creator-matching'
  | 'opportunity-feed'
  | 'ad-intelligence'
  | 'amazon-intelligence'
  | 'shopify-intelligence'
  | 'scoring'
  | 'supplier-discovery'
  | 'influencer-discovery'
  | 'content-engine'
  | 'store-integration'
  | 'order-tracking'
  | 'launch-blueprint'
  | 'financial-model'
  | 'pod-engine'
  | 'affiliate-engine'
  | 'admin-command-center';

export type EngineStatus = 'idle' | 'running' | 'paused' | 'error' | 'stopped';

export interface EngineConfig {
  /** Unique engine name */
  name: EngineName;
  /** Semver version string */
  version: string;
  /** Engine names this engine depends on */
  dependencies: EngineName[];
  /** BullMQ queue names this engine owns */
  queues: string[];
  /** Event types this engine publishes */
  publishes: string[];
  /** Event types this engine subscribes to */
  subscribes: string[];
}

// ─── Engine Events ──────────────────────────────────────────

export interface EngineEvent<T = unknown> {
  /** Dot-namespaced event type, e.g. 'discovery.product_found' */
  type: string;
  /** Event payload — typed per event */
  payload: T;
  /** Engine that emitted this event */
  source: EngineName;
  /** ISO timestamp of emission */
  timestamp: string;
  /** Optional correlation ID for tracing event chains */
  correlationId?: string;
}

export type EventHandler<T = unknown> = (event: EngineEvent<T>) => void | Promise<void>;

// ─── Engine Interface ───────────────────────────────────────

export interface Engine {
  /** Engine configuration (name, version, deps, queues, events) */
  readonly config: EngineConfig;

  /** Current engine status */
  status(): EngineStatus;

  /**
   * Initialize the engine. Called once during registration.
   * Set up subscriptions, validate dependencies, prepare state.
   */
  init(): Promise<void>;

  /**
   * Start processing. Engine moves from idle/stopped to running.
   */
  start(): Promise<void>;

  /**
   * Stop processing gracefully. Finish in-flight work, then go idle.
   */
  stop(): Promise<void>;

  /**
   * Handle an incoming event from the event bus.
   * Only called for event types listed in config.subscribes.
   */
  handleEvent(event: EngineEvent): Promise<void>;

  /**
   * Health check. Returns true if the engine is operational.
   * Used by the registry for status reporting.
   */
  healthCheck(): Promise<boolean>;
}

// ─── Common Event Payloads ──────────────────────────────────

export interface ProductDiscoveredPayload {
  productId: string;
  platform: string;
  externalId: string;
  title: string;
  finalScore: number;
  tier: 'HOT' | 'WARM' | 'WATCH' | 'COLD';
}

export interface ScanCompletePayload {
  scanId: string;
  mode: 'quick' | 'full' | 'client';
  productsFound: number;
  hotProducts: number;
  platforms: string[];
}

export interface ScanErrorPayload {
  scanId?: string;
  platform: string;
  error: string;
}

export interface ProductScoredPayload {
  productId: string;
  trendScore: number;
  viralScore: number;
  profitScore: number;
  finalScore: number;
  tier: 'HOT' | 'WARM' | 'WATCH' | 'COLD';
  stage: 'emerging' | 'rising' | 'exploding' | 'saturated';
}

export interface ClusterUpdatedPayload {
  clusterId: string;
  clusterName: string;
  productCount: number;
  avgScore: number;
}

export interface TrendDetectedPayload {
  keyword: string;
  score: number;
  direction: 'rising' | 'stable' | 'declining';
  productCount: number;
}

export interface CreatorMatchedPayload {
  productId: string;
  influencerId: string;
  matchScore: number;
  estimatedRoi: number;
}

// ─── Engine Lifecycle Events ────────────────────────────────

export interface EngineLifecyclePayload {
  engineName: EngineName;
  previousStatus: EngineStatus;
  newStatus: EngineStatus;
}

// ─── Event Type Constants ───────────────────────────────────

export const ENGINE_EVENTS = {
  // Lifecycle
  ENGINE_REGISTERED: 'engine.registered',
  ENGINE_STARTED: 'engine.started',
  ENGINE_STOPPED: 'engine.stopped',
  ENGINE_ERROR: 'engine.error',

  // Discovery
  PRODUCT_DISCOVERED: 'discovery.product_discovered',
  SCAN_COMPLETE: 'discovery.scan_complete',
  SCAN_ERROR: 'discovery.scan_error',

  // TikTok
  TIKTOK_VIDEOS_FOUND: 'tiktok.videos_found',
  TIKTOK_HASHTAGS_ANALYZED: 'tiktok.hashtags_analyzed',

  // Scoring
  PRODUCT_SCORED: 'scoring.product_scored',
  PRODUCT_REJECTED: 'scoring.product_rejected',

  // Clustering
  CLUSTER_UPDATED: 'clustering.cluster_updated',
  CLUSTERS_REBUILT: 'clustering.clusters_rebuilt',

  // Trends
  TREND_DETECTED: 'trend.trend_detected',
  TREND_DIRECTION_CHANGED: 'trend.direction_changed',

  // Creator Matching
  CREATOR_MATCHED: 'creator.creator_matched',
  MATCHES_COMPLETE: 'creator.matches_complete',

  // Ad Intelligence
  ADS_DISCOVERED: 'ads.ads_discovered',

  // Amazon / Shopify
  AMAZON_PRODUCTS_FOUND: 'amazon.products_found',
  SHOPIFY_PRODUCTS_FOUND: 'shopify.products_found',
} as const;

export type EngineEventType = typeof ENGINE_EVENTS[keyof typeof ENGINE_EVENTS];
