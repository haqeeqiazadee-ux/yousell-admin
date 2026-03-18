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
} from './types';

// ─── Constants ────────────────────────────────────────────
export { ENGINE_EVENTS } from './types';

// ─── Engine Implementations ──────────────────────────────
export { TikTokDiscoveryEngine } from './tiktok-discovery';
export { DiscoveryEngine } from './discovery';
export { ScoringEngine } from './scoring-engine';
