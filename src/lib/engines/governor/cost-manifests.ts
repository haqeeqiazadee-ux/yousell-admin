/**
 * YOUSELL Engine Governor — Cost Manifests Registry
 *
 * Centralized cost declarations for all 24 engines.
 * Governor reads these to calculate budgets, enforce caps, and optimize.
 *
 * Costs reflect real infrastructure prices as of 2026-03-22.
 * Admin can override via dashboard (stored in engine_cost_manifests table).
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 2
 */

import type { EngineName } from '../types';
import type { EngineCostManifest, CostTier } from './types';

const UPDATED_AT = '2026-03-22T00:00:00Z';
const MANIFEST_VERSION = '1.0';

/** Helper to build a manifest with defaults */
function manifest(
  engineName: EngineName,
  operations: Array<{
    operation: string;
    label: string;
    baseCostUSD: number;
    externalCosts: Array<{ provider: string; costPerCall: number; callsPerOperation: number }>;
    computeCostUSD: number;
    costTier: CostTier;
    cacheable: boolean;
    cacheTTL?: number;
  }>,
  monthlyFixedCostUSD = 0
): EngineCostManifest {
  return {
    engineName,
    manifestVersion: MANIFEST_VERSION,
    operations,
    monthlyFixedCostUSD,
    updatedAt: UPDATED_AT,
  };
}

// ─── Cost Manifests for All 24 Engines ─────────────────────

export const ENGINE_COST_MANIFESTS: Partial<Record<EngineName, EngineCostManifest>> = {
  // ── Engine 1: Discovery ────────────────────────────────────
  'discovery': manifest('discovery', [
    {
      operation: 'scan_quick',
      label: 'Quick Discovery Scan',
      baseCostUSD: 0.10,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.08, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 3600,
    },
    {
      operation: 'scan_full',
      label: 'Full Discovery Scan',
      baseCostUSD: 0.50,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.08, callsPerOperation: 5 },
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 5 },
      ],
      computeCostUSD: 0.00,
      costTier: 'medium',
      cacheable: true,
      cacheTTL: 1800,
    },
  ]),

  // ── Engine 1b: TikTok Discovery ────────────────────────────
  'tiktok-discovery': manifest('tiktok-discovery', [
    {
      operation: 'scan',
      label: 'TikTok Video Scan',
      baseCostUSD: 0.12,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.10, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 3600,
    },
    {
      operation: 'analyze_hashtags',
      label: 'Hashtag Analysis',
      baseCostUSD: 0.05,
      externalCosts: [
        { provider: 'Claude Haiku', costPerCall: 0.05, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 7200,
    },
  ]),

  // ── Product Extraction ─────────────────────────────────────
  'product-extraction': manifest('product-extraction', [
    {
      operation: 'extract',
      label: 'Extract Product Data',
      baseCostUSD: 0.08,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.06, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── Clustering ─────────────────────────────────────────────
  'clustering': manifest('clustering', [
    {
      operation: 'cluster',
      label: 'Product Clustering',
      baseCostUSD: 0.01,
      externalCosts: [],
      computeCostUSD: 0.01,
      costTier: 'free',
      cacheable: true,
      cacheTTL: 7200,
    },
    {
      operation: 'rebuild',
      label: 'Rebuild All Clusters',
      baseCostUSD: 0.05,
      externalCosts: [],
      computeCostUSD: 0.05,
      costTier: 'low',
      cacheable: false,
    },
  ]),

  // ── Trend Detection ────────────────────────────────────────
  'trend-detection': manifest('trend-detection', [
    {
      operation: 'detect',
      label: 'Trend Detection',
      baseCostUSD: 0.01,
      externalCosts: [],
      computeCostUSD: 0.01,
      costTier: 'free',
      cacheable: true,
      cacheTTL: 3600,
    },
    {
      operation: 'analyze',
      label: 'Trend Analysis',
      baseCostUSD: 0.03,
      externalCosts: [
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.01,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── Creator Matching ───────────────────────────────────────
  'creator-matching': manifest('creator-matching', [
    {
      operation: 'match',
      label: 'Creator-Product Matching',
      baseCostUSD: 0.02,
      externalCosts: [
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── Opportunity Feed ───────────────────────────────────────
  'opportunity-feed': manifest('opportunity-feed', [
    {
      operation: 'generate',
      label: 'Generate Opportunity Feed',
      baseCostUSD: 0.005,
      externalCosts: [],
      computeCostUSD: 0.005,
      costTier: 'free',
      cacheable: true,
      cacheTTL: 1800,
    },
  ]),

  // ── Ad Intelligence ────────────────────────────────────────
  'ad-intelligence': manifest('ad-intelligence', [
    {
      operation: 'discover',
      label: 'Ad Discovery',
      baseCostUSD: 0.20,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.15, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.05, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'medium',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── Amazon Intelligence ────────────────────────────────────
  'amazon-intelligence': manifest('amazon-intelligence', [
    {
      operation: 'scan',
      label: 'Amazon Product Scan',
      baseCostUSD: 0.15,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.12, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.03, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'medium',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── Shopify Intelligence ───────────────────────────────────
  'shopify-intelligence': manifest('shopify-intelligence', [
    {
      operation: 'scan',
      label: 'Shopify Store Scan',
      baseCostUSD: 0.10,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.08, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── Scoring ────────────────────────────────────────────────
  'scoring': manifest('scoring', [
    {
      operation: 'score_single',
      label: 'Score Single Product',
      baseCostUSD: 0.001,
      externalCosts: [],
      computeCostUSD: 0.001,
      costTier: 'free',
      cacheable: true,
      cacheTTL: 1800,
    },
    {
      operation: 'score_batch',
      label: 'Score Batch (up to 100)',
      baseCostUSD: 0.05,
      externalCosts: [
        { provider: 'Claude Haiku', costPerCall: 0.05, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: false,
    },
  ]),

  // ── Competitor Intelligence ────────────────────────────────
  'competitor-intelligence': manifest('competitor-intelligence', [
    {
      operation: 'analyze',
      label: 'Competitor Analysis',
      baseCostUSD: 0.15,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.10, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.05, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'medium',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── Supplier Discovery ─────────────────────────────────────
  'supplier-discovery': manifest('supplier-discovery', [
    {
      operation: 'search',
      label: 'Supplier Search',
      baseCostUSD: 0.12,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.08, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.04, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'medium',
      cacheable: true,
      cacheTTL: 7200,
    },
  ]),

  // ── Influencer Discovery ───────────────────────────────────
  'influencer-discovery': manifest('influencer-discovery', [
    {
      operation: 'search',
      label: 'Influencer Search',
      baseCostUSD: 0.10,
      externalCosts: [
        { provider: 'Apify', costPerCall: 0.08, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 7200,
    },
  ]),

  // ── Content Engine ─────────────────────────────────────────
  'content-engine': manifest('content-engine', [
    {
      operation: 'generate_caption',
      label: 'Generate Caption',
      baseCostUSD: 0.01,
      externalCosts: [
        { provider: 'Claude Haiku', costPerCall: 0.01, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: false,
    },
    {
      operation: 'generate_image',
      label: 'Generate Image',
      baseCostUSD: 0.08,
      externalCosts: [
        { provider: 'Bannerbear', costPerCall: 0.06, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'medium',
      cacheable: false,
    },
    {
      operation: 'generate_video',
      label: 'Generate Video',
      baseCostUSD: 0.25,
      externalCosts: [
        { provider: 'Shotstack', costPerCall: 0.20, callsPerOperation: 1 },
        { provider: 'Claude Sonnet', costPerCall: 0.05, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'high',
      cacheable: false,
    },
  ]),

  // ── Store Integration ──────────────────────────────────────
  'store-integration': manifest('store-integration', [
    {
      operation: 'push_product',
      label: 'Push Product to Store',
      baseCostUSD: 0.01,
      externalCosts: [
        { provider: 'Shopify API', costPerCall: 0.00, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.01,
      costTier: 'low',
      cacheable: false,
    },
    {
      operation: 'sync_inventory',
      label: 'Sync Inventory',
      baseCostUSD: 0.02,
      externalCosts: [
        { provider: 'Platform API', costPerCall: 0.00, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.02,
      costTier: 'low',
      cacheable: false,
    },
  ]),

  // ── Order Tracking ─────────────────────────────────────────
  'order-tracking': manifest('order-tracking', [
    {
      operation: 'track',
      label: 'Track Order',
      baseCostUSD: 0.005,
      externalCosts: [
        { provider: 'Platform API', costPerCall: 0.00, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.005,
      costTier: 'free',
      cacheable: true,
      cacheTTL: 300,
    },
  ]),

  // ── Launch Blueprint ───────────────────────────────────────
  'launch-blueprint': manifest('launch-blueprint', [
    {
      operation: 'generate',
      label: 'Generate Launch Blueprint',
      baseCostUSD: 0.08,
      externalCosts: [
        { provider: 'Claude Sonnet', costPerCall: 0.08, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'medium',
      cacheable: true,
      cacheTTL: 86400,
    },
  ]),

  // ── Financial Model ────────────────────────────────────────
  'financial-model': manifest('financial-model', [
    {
      operation: 'project',
      label: 'Financial Projection',
      baseCostUSD: 0.03,
      externalCosts: [
        { provider: 'Claude Haiku', costPerCall: 0.03, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── Profitability ──────────────────────────────────────────
  'profitability': manifest('profitability', [
    {
      operation: 'calculate',
      label: 'Profitability Calculation',
      baseCostUSD: 0.02,
      externalCosts: [
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 3600,
    },
  ]),

  // ── POD Engine ─────────────────────────────────────────────
  'pod-engine': manifest('pod-engine', [
    {
      operation: 'design_generate',
      label: 'Generate POD Design',
      baseCostUSD: 0.15,
      externalCosts: [
        { provider: 'Bannerbear', costPerCall: 0.10, callsPerOperation: 1 },
        { provider: 'Claude Haiku', costPerCall: 0.05, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'medium',
      cacheable: false,
    },
  ]),

  // ── Affiliate Engine ───────────────────────────────────────
  'affiliate-engine': manifest('affiliate-engine', [
    {
      operation: 'track_commission',
      label: 'Track Commission',
      baseCostUSD: 0.001,
      externalCosts: [],
      computeCostUSD: 0.001,
      costTier: 'free',
      cacheable: false,
    },
  ]),

  // ── Client Allocation ──────────────────────────────────────
  'client-allocation': manifest('client-allocation', [
    {
      operation: 'allocate',
      label: 'Allocate Product to Client',
      baseCostUSD: 0.005,
      externalCosts: [],
      computeCostUSD: 0.005,
      costTier: 'free',
      cacheable: false,
    },
  ]),

  // ── Admin Command Center ───────────────────────────────────
  'admin-command-center': manifest('admin-command-center', [
    {
      operation: 'deploy',
      label: 'Deploy Product',
      baseCostUSD: 0.01,
      externalCosts: [],
      computeCostUSD: 0.01,
      costTier: 'free',
      cacheable: false,
    },
  ]),

  // ── Fulfillment Recommendation ─────────────────────────────
  'fulfillment-recommendation': manifest('fulfillment-recommendation', [
    {
      operation: 'recommend',
      label: 'Recommend Fulfillment Type',
      baseCostUSD: 0.02,
      externalCosts: [
        { provider: 'Claude Haiku', costPerCall: 0.02, callsPerOperation: 1 },
      ],
      computeCostUSD: 0.00,
      costTier: 'low',
      cacheable: true,
      cacheTTL: 86400,
    },
  ]),

};

/**
 * Look up cost manifest for an engine.
 * Falls back to the hardcoded registry if no DB override exists.
 */
export function getEngineCostManifest(engineName: EngineName): EngineCostManifest | undefined {
  return ENGINE_COST_MANIFESTS[engineName];
}

/**
 * Look up a specific operation cost for an engine.
 */
export function getOperationCost(
  engineName: EngineName,
  operation: string
): { baseCostUSD: number; costTier: CostTier } | undefined {
  const manifest = ENGINE_COST_MANIFESTS[engineName];
  if (!manifest) return undefined;
  const op = manifest.operations.find((o) => o.operation === operation);
  if (!op) return undefined;
  return { baseCostUSD: op.baseCostUSD, costTier: op.costTier };
}
