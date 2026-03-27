/**
 * YOUSELL Engine Governor — Plan Engine Allowances
 *
 * Maps subscription tiers to per-engine allowances.
 * These are the templates used to create Client Budget Envelopes
 * when a client subscribes or upgrades.
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 3.2
 * @see src/lib/stripe.ts PRICING_TIERS
 */

import type { EngineName } from '../types';
import type { PlanId, EngineAllowance, BudgetAlertThresholds } from './types';

// ─── Per-Plan Engine Allowance Templates ───────────────────

interface PlanAllowanceTemplate {
  plan: PlanId;
  globalCostCapUSD: number;
  contentCredits: { total: number };
  alerts: BudgetAlertThresholds;
  engines: Partial<Record<EngineName, Pick<EngineAllowance, 'enabled' | 'maxOperations' | 'maxCostUSD'>>>;
}

/** Default alert thresholds */
const DEFAULT_ALERTS: BudgetAlertThresholds = {
  warnAtPercent: 80,
  throttleAtPercent: 95,
  blockAtPercent: 100,
};

/**
 * Plan allowance templates — the source of truth for what each tier gets.
 *
 * maxOperations: -1 = unlimited
 * maxCostUSD: -1 = unlimited
 */
export const PLAN_ALLOWANCE_TEMPLATES: Record<PlanId, PlanAllowanceTemplate> = {
  starter: {
    plan: 'starter',
    globalCostCapUSD: 5.00,
    contentCredits: { total: 50 },
    alerts: DEFAULT_ALERTS,
    engines: {
      'discovery': { enabled: true, maxOperations: 30, maxCostUSD: 3.00 },
      'scoring': { enabled: true, maxOperations: 50, maxCostUSD: 0.50 },
      'trend-detection': { enabled: true, maxOperations: 50, maxCostUSD: 0.50 },
      'clustering': { enabled: true, maxOperations: 20, maxCostUSD: 0.20 },
      'opportunity-feed': { enabled: true, maxOperations: 50, maxCostUSD: 0.25 },
    },
  },

  growth: {
    plan: 'growth',
    globalCostCapUSD: 15.00,
    contentCredits: { total: 200 },
    alerts: DEFAULT_ALERTS,
    engines: {
      'discovery': { enabled: true, maxOperations: 100, maxCostUSD: 5.00 },
      'tiktok-discovery': { enabled: true, maxOperations: 50, maxCostUSD: 3.00 },
      'scoring': { enabled: true, maxOperations: 200, maxCostUSD: 1.00 },
      'trend-detection': { enabled: true, maxOperations: 100, maxCostUSD: 1.00 },
      'clustering': { enabled: true, maxOperations: 50, maxCostUSD: 0.50 },
      'opportunity-feed': { enabled: true, maxOperations: 100, maxCostUSD: 0.50 },
      'content-engine': { enabled: true, maxOperations: 200, maxCostUSD: 3.00 },
      'store-integration': { enabled: true, maxOperations: 50, maxCostUSD: 1.00 },
    },
  },

  professional: {
    plan: 'professional',
    globalCostCapUSD: 40.00,
    contentCredits: { total: 500 },
    alerts: DEFAULT_ALERTS,
    engines: {
      'discovery': { enabled: true, maxOperations: 300, maxCostUSD: 10.00 },
      'tiktok-discovery': { enabled: true, maxOperations: 150, maxCostUSD: 5.00 },
      'product-extraction': { enabled: true, maxOperations: 200, maxCostUSD: 3.00 },
      'scoring': { enabled: true, maxOperations: 500, maxCostUSD: 2.00 },
      'trend-detection': { enabled: true, maxOperations: 200, maxCostUSD: 2.00 },
      'clustering': { enabled: true, maxOperations: 100, maxCostUSD: 1.00 },
      'creator-matching': { enabled: true, maxOperations: 100, maxCostUSD: 2.00 },
      'opportunity-feed': { enabled: true, maxOperations: 200, maxCostUSD: 1.00 },
      'ad-intelligence': { enabled: true, maxOperations: 50, maxCostUSD: 3.00 },
      'content-engine': { enabled: true, maxOperations: 500, maxCostUSD: 5.00 },
      'store-integration': { enabled: true, maxOperations: 100, maxCostUSD: 2.00 },
      'order-tracking': { enabled: true, maxOperations: 200, maxCostUSD: 1.00 },
      'supplier-discovery': { enabled: true, maxOperations: 50, maxCostUSD: 2.00 },
      'financial-model': { enabled: true, maxOperations: 50, maxCostUSD: 1.50 },
      'launch-blueprint': { enabled: true, maxOperations: 20, maxCostUSD: 1.60 },
    },
  },

  enterprise: {
    plan: 'enterprise',
    globalCostCapUSD: 100.00,
    contentCredits: { total: -1 }, // unlimited
    alerts: DEFAULT_ALERTS,
    engines: {
      'discovery': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'tiktok-discovery': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'product-extraction': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'scoring': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'trend-detection': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'clustering': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'creator-matching': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'opportunity-feed': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'ad-intelligence': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'amazon-intelligence': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'shopify-intelligence': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'content-engine': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'store-integration': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'order-tracking': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'supplier-discovery': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'influencer-discovery': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'competitor-intelligence': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'profitability': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'financial-model': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'launch-blueprint': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'pod-engine': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'affiliate-engine': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'client-allocation': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
      'fulfillment-recommendation': { enabled: true, maxOperations: -1, maxCostUSD: -1 },
    },
  },
};

/**
 * Build a fresh EngineAllowance record for a given plan tier.
 * Used when creating a new Client Budget Envelope.
 */
export function buildEngineAllowances(
  plan: PlanId
): Partial<Record<EngineName, EngineAllowance>> {
  const template = PLAN_ALLOWANCE_TEMPLATES[plan];
  const allowances: Partial<Record<EngineName, EngineAllowance>> = {};

  for (const [engineName, config] of Object.entries(template.engines)) {
    if (!config) continue;
    allowances[engineName as EngineName] = {
      engineName: engineName as EngineName,
      enabled: config.enabled,
      maxOperations: config.maxOperations,
      usedOperations: 0,
      maxCostUSD: config.maxCostUSD,
      usedCostUSD: 0,
      utilizationPercent: 0,
    };
  }

  return allowances;
}

/**
 * Get the global cost cap for a plan tier.
 */
export function getPlanGlobalCostCap(plan: PlanId): number {
  return PLAN_ALLOWANCE_TEMPLATES[plan].globalCostCapUSD;
}

/**
 * Get the content credits for a plan tier.
 */
export function getPlanContentCredits(plan: PlanId): number {
  return PLAN_ALLOWANCE_TEMPLATES[plan].contentCredits.total;
}
