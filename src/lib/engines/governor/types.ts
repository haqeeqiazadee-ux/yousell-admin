/**
 * YOUSELL Engine Governor — Type Definitions
 *
 * The Governor is the centralized orchestrator between all client requests
 * and the 24 engines. It controls access (gating), routes operations
 * (dispatch), and records usage (metering).
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md
 * @see CLAUDE.md Section 5 — Canonical Architecture
 */

import { EngineName } from '../types';

// ─── Plan & Tier Types ─────────────────────────────────────

export type PlanId = 'starter' | 'growth' | 'professional' | 'enterprise';

export type CostTier = 'free' | 'low' | 'medium' | 'high' | 'premium';

export type AutomationLevel = 0 | 1 | 2 | 3;

// ─── Engine Cost Manifest ──────────────────────────────────

export interface ExternalCostBreakdown {
  /** External provider name, e.g. 'Apify', 'Claude API', 'Bannerbear' */
  provider: string;
  /** USD cost per single API call */
  costPerCall: number;
  /** How many API calls per 1 engine operation */
  callsPerOperation: number;
}

export interface EngineOperationCost {
  /** Operation identifier, e.g. 'scan', 'generate', 'sync' */
  operation: string;
  /** Human-readable label for admin dashboard */
  label: string;
  /** Base cost in USD per single invocation */
  baseCostUSD: number;
  /** Breakdown of external API costs included in baseCost */
  externalCosts: ExternalCostBreakdown[];
  /** Internal compute cost estimate (Railway CPU/memory) */
  computeCostUSD: number;
  /** Cost tier classification for quick filtering */
  costTier: CostTier;
  /** Whether this operation is cacheable (avoids re-invoking) */
  cacheable: boolean;
  /** Cache TTL in seconds if cacheable */
  cacheTTL?: number;
}

export interface EngineCostManifest {
  /** Engine name (must match EngineName type) */
  engineName: EngineName;
  /** Manifest version (for migration tracking) */
  manifestVersion: string;
  /** All operations this engine exposes */
  operations: EngineOperationCost[];
  /** Monthly fixed cost (infrastructure baseline even if 0 operations) */
  monthlyFixedCostUSD: number;
  /** Last updated timestamp */
  updatedAt: string;
}

// ─── Client Budget Envelope ────────────────────────────────

export interface EngineAllowance {
  engineName: EngineName;
  /** Is this engine enabled for the client's tier? */
  enabled: boolean;
  /** Max operations per billing period (-1 = unlimited) */
  maxOperations: number;
  /** Operations consumed this period */
  usedOperations: number;
  /** Max USD spend for this engine per period (-1 = unlimited) */
  maxCostUSD: number;
  /** USD consumed this period */
  usedCostUSD: number;
  /** Percentage of allowance used (auto-calculated) */
  utilizationPercent: number;
}

export interface BudgetAlertThresholds {
  /** Percentage at which to warn (default 80) */
  warnAtPercent: number;
  /** Percentage at which to throttle to essential-only (default 95) */
  throttleAtPercent: number;
  /** Percentage at which to block (default 100) */
  blockAtPercent: number;
}

export interface ClientBudgetEnvelope {
  clientId: string;
  plan: PlanId;
  billingPeriod: { start: string; end: string };
  /** Per-engine allowances */
  engines: Partial<Record<EngineName, EngineAllowance>>;
  /** Global cost cap across all engines (USD per period) */
  globalCostCapUSD: number;
  /** Total USD spent across all engines this period */
  totalSpentUSD: number;
  /** Content credits (legacy — subsumed into engine allowances) */
  contentCredits: { total: number; used: number };
  /** Alert thresholds */
  alerts: BudgetAlertThresholds;
}

// ─── Gate Types ────────────────────────────────────────────

export type GateDenialCode =
  | 'NOT_IN_PLAN'
  | 'QUOTA_EXCEEDED'
  | 'BUDGET_EXCEEDED'
  | 'ENGINE_DISABLED'
  | 'ENGINE_UNHEALTHY'
  | 'THROTTLED';

export interface GateResult {
  allowed: boolean;
  reason?: string;
  code?: GateDenialCode;
  /** Upgrade suggestion for client-facing messages */
  suggestion?: string;
}

// ─── Dispatch Types ────────────────────────────────────────

export interface DispatchContext {
  clientId: string;
  userId: string;
  correlationId: string;
}

export interface EngineOperationResult {
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

// ─── Meter Types ───────────────────────────────────────────

export interface UsageLedgerEntry {
  clientId: string;
  engineName: EngineName;
  operation: string;
  costUSD: number;
  timestamp: string;
  durationMs: number;
  success: boolean;
  correlationId: string;
}

// ─── Governor Execute Types ────────────────────────────────

export interface GovernorExecuteContext {
  userId: string;
  isSuperAdmin: boolean;
}

export interface GovernorResponse {
  success: boolean;
  data?: unknown;
  correlationId?: string;
  /** Present when request was denied by the gate */
  denied?: boolean;
  reason?: string;
  code?: GateDenialCode;
  suggestion?: string;
}

// ─── Engine Swap Types ─────────────────────────────────────

export interface EngineSwapEntry {
  /** The engine name clients/APIs reference */
  sourceEngine: EngineName;
  /** The actual engine implementation to use */
  targetEngine: EngineName;
  /** Why this swap was made */
  reason: string;
  /** Who made the swap */
  createdBy: string;
  /** When it was activated */
  activatedAt: string;
  /** Optional: auto-revert after this time */
  expiresAt?: string;
  /** Is this swap currently active? */
  active: boolean;
  /** Whether the target is an external API engine */
  isExternal?: boolean;
  /** Reference to external_engines row when isExternal=true */
  externalEngineId?: string;
}

// ─── External Engine Types ────────────────────────────────

export type ExternalAuthType = 'bearer' | 'api_key' | 'header' | 'none';

export interface ExternalEngineRecord {
  id: string;
  /** Unique slug, e.g. 'ext-openai-scoring' */
  engineKey: string;
  /** Human-readable name */
  displayName: string;
  /** Base API endpoint URL */
  apiEndpoint: string;
  /** Authentication method */
  authType: ExternalAuthType;
  /** Header name for auth (default: Authorization) */
  authHeaderName: string;
  /** Encrypted auth token (AES-256-GCM) */
  authTokenEncrypted: string | null;
  /** Optional health check endpoint path */
  healthEndpoint: string | null;
  /** Cost per operation in USD */
  costPerOperationUSD: number;
  /** Request timeout in milliseconds */
  timeoutMs: number;
  /** Which internal engine this can replace */
  replacesEngine: EngineName | null;
  /** Whether this external engine is active */
  active: boolean;
  /** Last health check timestamp */
  lastHealthCheck: string | null;
  /** Last health check result */
  lastHealthStatus: boolean | null;
  /** Free-form metadata (extra headers, params, etc.) */
  metadata: Record<string, unknown>;
  /** Who registered this engine */
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Automation Types ───────────────────────────────────

export type AIDecisionType =
  | 'reallocation'
  | 'anomaly'
  | 'health_route'
  | 'scaling'
  | 'cost_alert';

export interface GovernorAIDecision {
  id: string;
  timestamp: string;
  level: 1 | 2 | 3;
  type: AIDecisionType;
  description: string;
  confidence: number;
  applied: boolean;
  approvedBy?: string;
  affectedClients: string[];
  affectedEngines: EngineName[];
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  revertible: boolean;
}

// ─── Super Admin Override Types ─────────────────────────────

export type OverrideType =
  | 'single_request'
  | 'client_bypass'
  | 'engine_bypass'
  | 'full_bypass';

export interface GovernorOverride {
  id: string;
  type: OverrideType;
  createdBy: string;
  reason: string;
  targetClientId?: string;
  targetEngine?: EngineName;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

// ─── Governor Event Constants ──────────────────────────────

export const GOVERNOR_EVENTS = {
  // Gate events
  REQUEST_DENIED: 'governor.request_denied',
  REQUEST_THROTTLED: 'governor.request_throttled',

  // Meter events
  USAGE_RECORDED: 'governor.usage_recorded',
  BUDGET_WARN: 'governor.budget_warn',
  BUDGET_THROTTLE: 'governor.budget_throttle',
  BUDGET_BLOCKED: 'governor.budget_blocked',

  // Swap events
  ENGINE_SWAPPED: 'governor.engine_swapped',
  SWAP_REVERTED: 'governor.swap_reverted',

  // AI events
  AI_SUGGESTION: 'governor.ai_suggestion',
  AI_ACTION_APPLIED: 'governor.ai_action_applied',
  AI_ACTION_REVERTED: 'governor.ai_action_reverted',

  // Override events
  OVERRIDE_ACTIVATED: 'governor.override_activated',
  OVERRIDE_EXPIRED: 'governor.override_expired',

  // Health events
  ENGINE_HEALTH_DEGRADED: 'governor.engine_health_degraded',
  ENGINE_HEALTH_RESTORED: 'governor.engine_health_restored',

  // External engine events
  EXTERNAL_ENGINE_REGISTERED: 'governor.external_engine_registered',
  EXTERNAL_ENGINE_REMOVED: 'governor.external_engine_removed',
  EXTERNAL_ENGINE_HEALTH_FAILED: 'governor.external_engine_health_failed',
} as const;

export type GovernorEventType = typeof GOVERNOR_EVENTS[keyof typeof GOVERNOR_EVENTS];
