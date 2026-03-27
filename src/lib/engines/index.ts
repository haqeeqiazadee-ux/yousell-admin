/**
 * YOUSELL Engine System — Public API
 *
 * Central barrel export for the engine architecture.
 * Import from '@/lib/engines' for all engine system needs.
 */

// ─── Core Infrastructure ─────────────────────────────────
export { getEventBus, resetEventBus, EventBus } from './event-bus';
export { getEngineRegistry, resetEngineRegistry, EngineRegistry } from './registry';

// ─── Types ────────────────────────────────────────────────
export type {
  Engine,
  EngineConfig,
  EngineEvent,
  EngineName,
  EngineStatus,
  EventHandler,
  EngineEventType,
  // Common payloads
  ProductDiscoveredPayload,
  ScanCompletePayload,
  ScanErrorPayload,
  ProductScoredPayload,
  ClusterUpdatedPayload,
  TrendDetectedPayload,
  CreatorMatchedPayload,
  EngineLifecyclePayload,
  // V9 engine payloads
  CompetitorDetectedPayload,
  SupplierFoundPayload,
  ProfitabilityPayload,
  FinancialModelPayload,
  BlueprintPayload,
  AllocationPayload,
  ContentGeneratedPayload,
  StoreProductPushedPayload,
  OrderPayload,
  CommissionPayload,
  FulfillmentPayload,
} from './types';

// ─── Constants ────────────────────────────────────────────
export { ENGINE_EVENTS } from './types';

// ─── Engine Implementations (Phase 0 + Phase B: 8 engines) ──
export { TikTokDiscoveryEngine } from './tiktok-discovery';
export { DiscoveryEngine } from './discovery';
export { ScoringEngine } from './scoring-engine';
export { ClusteringEngine } from './clustering';
export { TrendDetectionEngine } from './trend-detection';
export { CreatorMatchingEngine } from './creator-matching';
export { AdIntelligenceEngine } from './ad-intelligence';
export { OpportunityFeedEngine } from './opportunity-feed';

// ─── V9 Engine Implementations (12 new engines) ─────────
export { CompetitorIntelligenceEngine } from './competitor-intelligence';
export { SupplierDiscoveryEngine } from './supplier-discovery';
export { ProfitabilityEngine } from './profitability-engine';
export { FinancialModellingEngine } from './financial-modelling';
export { LaunchBlueprintEngine } from './launch-blueprint';
export { ClientAllocationEngine } from './client-allocation';
export { ContentCreationEngine } from './content-creation';
export { StoreIntegrationEngine } from './store-integration';
export { OrderTrackingEngine } from './order-tracking';
export { AdminCommandCenterEngine } from './admin-command-center';
export { AffiliateCommissionEngine } from './affiliate-commission';
export { FulfillmentRecommendationEngine } from './fulfillment-recommendation';
export { AmazonIntelligenceEngine } from './amazon-intelligence';
export { ShopifyIntelligenceEngine } from './shopify-intelligence';
export { PodEngine } from './pod-engine';
export { AutomationOrchestratorEngine } from './automation-orchestrator';
