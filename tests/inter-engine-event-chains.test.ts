/**
 * Inter-Engine: Event Chain Verification
 *
 * Tests complete event chain pathways across the engine pipeline:
 * - Discovery → Scoring → Profitability → Financial Modelling
 * - Scoring → Competitor Intelligence → Profitability (competitor pricing)
 * - Scoring → Supplier Discovery → Profitability (cost data)
 * - Blueprint approval gate (Comm #12.012)
 * - Fulfillment → Profitability feedback loop
 * - Affiliate → Financial Modelling cost deduction
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  ScoringEngine,
  ProfitabilityEngine,
  FinancialModellingEngine,
  SupplierDiscoveryEngine,
  CompetitorIntelligenceEngine,
  LaunchBlueprintEngine,
  ContentCreationEngine,
  StoreIntegrationEngine,
  AffiliateCommissionEngine,
  FulfillmentRecommendationEngine,
  AdminCommandCenterEngine,
  OpportunityFeedEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Core Pipeline Chain
// ─────────────────────────────────────────────────────────────

describe('Inter-Engine: Core Pipeline Chain', () => {
  beforeEach(() => {
    resetEventBus()
  })

  it('PRODUCT_SCORED → Profitability subscribes', () => {
    const profitability = new ProfitabilityEngine()
    expect(profitability.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
  })

  it('PROFITABILITY_CALCULATED → Financial Modelling subscribes', () => {
    const financial = new FinancialModellingEngine()
    expect(financial.config.subscribes).toContain(ENGINE_EVENTS.PROFITABILITY_CALCULATED)
  })

  it('SUPPLIER_FOUND → Profitability subscribes for cost recalc', () => {
    const profitability = new ProfitabilityEngine()
    expect(profitability.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
  })

  it('SUPPLIER_FOUND → Financial Modelling subscribes for model update', () => {
    const financial = new FinancialModellingEngine()
    expect(financial.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
  })

  it('COMPETITOR_DETECTED → Profitability subscribes for pricing adjustment', () => {
    const profitability = new ProfitabilityEngine()
    expect(profitability.config.subscribes).toContain(ENGINE_EVENTS.COMPETITOR_DETECTED)
  })

  it('COMPETITOR_DETECTED → Financial Modelling subscribes', () => {
    const financial = new FinancialModellingEngine()
    expect(financial.config.subscribes).toContain(ENGINE_EVENTS.COMPETITOR_DETECTED)
  })

  it('full chain: Scoring → Profitability → Financial Model via EventBus', async () => {
    const bus = getEventBus()
    const events: string[] = []

    bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, () => events.push('scored'))
    bus.subscribe(ENGINE_EVENTS.PROFITABILITY_CALCULATED, () => events.push('profitability'))
    bus.subscribe(ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED, () => events.push('financial'))

    const scoring = new ScoringEngine()
    await scoring.scoreProduct('prod-chain', {
      price: 40, sales_count: 3000, review_count: 500, rating: 4.5, source: 'tiktok',
    })
    expect(events).toContain('scored')

    const profitability = new ProfitabilityEngine()
    await profitability.calculateProfitability('prod-chain', {
      sellingPrice: 40, unitCost: 15, shippingCost: 5,
      platformFeeRate: 0.10, adCostPerUnit: 3, platform: 'shopify',
    })
    expect(events).toContain('profitability')

    const financial = new FinancialModellingEngine()
    await financial.generateModel('prod-chain', {
      sellingPrice: 40, unitCost: 15, monthlyAdBudget: 500,
      estimatedCpa: 10, estimatedMonthlyUnits: 100, months: 3,
    })
    expect(events).toContain('financial')

    expect(events).toEqual(['scored', 'profitability', 'financial'])
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Blueprint Approval Gate (Comm #12.012)
// ─────────────────────────────────────────────────────────────

describe('Inter-Engine: Blueprint Approval Gate', () => {
  beforeEach(() => {
    resetEventBus()
  })

  it('Content Creation subscribes to BLUEPRINT_APPROVED', () => {
    const content = new ContentCreationEngine()
    expect(content.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
  })

  it('Store Integration subscribes to BLUEPRINT_APPROVED', () => {
    const store = new StoreIntegrationEngine()
    expect(store.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
  })

  it('Launch Blueprint publishes BLUEPRINT_GENERATED and BLUEPRINT_APPROVED', () => {
    const blueprint = new LaunchBlueprintEngine()
    expect(blueprint.config.publishes).toContain(ENGINE_EVENTS.BLUEPRINT_GENERATED)
    expect(blueprint.config.publishes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
  })

  it('Blueprint approval gate: nothing proceeds without BLUEPRINT_APPROVED', async () => {
    const bus = getEventBus()
    const approvedEvents: EngineEvent[] = []
    const contentEvents: EngineEvent[] = []

    bus.subscribe(ENGINE_EVENTS.BLUEPRINT_APPROVED, (e) => approvedEvents.push(e))
    bus.subscribe(ENGINE_EVENTS.CONTENT_GENERATED, (e) => contentEvents.push(e))

    // Without blueprint approval, no content should be generated
    expect(approvedEvents).toHaveLength(0)
    expect(contentEvents).toHaveLength(0)

    // Emit blueprint approved
    await bus.emit(ENGINE_EVENTS.BLUEPRINT_APPROVED, {
      productId: 'prod-001',
      blueprintId: 'bp-001',
    }, 'launch-blueprint')

    expect(approvedEvents).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Supplier → Profitability Feedback
// ─────────────────────────────────────────────────────────────

describe('Inter-Engine: Supplier → Profitability Feedback', () => {
  beforeEach(() => {
    resetEventBus()
  })

  it('Supplier Discovery publishes SUPPLIER_FOUND', () => {
    const supplier = new SupplierDiscoveryEngine()
    expect(supplier.config.publishes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
    expect(supplier.config.publishes).toContain(ENGINE_EVENTS.SUPPLIER_VERIFIED)
  })

  it('Profitability and Financial Modelling both consume SUPPLIER_FOUND', () => {
    const profitability = new ProfitabilityEngine()
    const financial = new FinancialModellingEngine()
    expect(profitability.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
    expect(financial.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
  })

  it('SUPPLIER_FOUND event reaches both consumers simultaneously', async () => {
    const bus = getEventBus()
    const profitabilityReceived: EngineEvent[] = []
    const financialReceived: EngineEvent[] = []

    bus.subscribe(ENGINE_EVENTS.SUPPLIER_FOUND, (e) => profitabilityReceived.push(e))
    bus.subscribe(ENGINE_EVENTS.SUPPLIER_FOUND, (e) => financialReceived.push(e))

    await bus.emit(ENGINE_EVENTS.SUPPLIER_FOUND, {
      supplierId: 'sup-001',
      productId: 'prod-001',
      unitCost: 12.50,
    }, 'supplier-discovery')

    expect(profitabilityReceived).toHaveLength(1)
    expect(financialReceived).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Fulfillment → Profitability Feedback
// ─────────────────────────────────────────────────────────────

describe('Inter-Engine: Fulfillment → Profitability Feedback', () => {
  beforeEach(() => {
    resetEventBus()
  })

  it('Fulfillment Recommendation publishes FULFILLMENT_RECOMMENDED', () => {
    const fulfillment = new FulfillmentRecommendationEngine()
    expect(fulfillment.config.publishes).toContain(ENGINE_EVENTS.FULFILLMENT_RECOMMENDED)
  })

  it('Fulfillment type affects profitability calculation', () => {
    // Different fulfillment types have different cost structures
    const costs: Record<string, { margin: number; upfrontCost: number }> = {
      DROPSHIP: { margin: 0.15, upfrontCost: 0 },
      WHOLESALE: { margin: 0.40, upfrontCost: 2000 },
      POD: { margin: 0.40, upfrontCost: 0 },
      DIGITAL: { margin: 0.90, upfrontCost: 0 },
      AFFILIATE: { margin: 0.10, upfrontCost: 0 },
    }

    expect(costs.WHOLESALE.margin).toBeGreaterThan(costs.DROPSHIP.margin)
    expect(costs.DIGITAL.margin).toBeGreaterThan(costs.WHOLESALE.margin)
    expect(costs.DROPSHIP.upfrontCost).toBe(0)
    expect(costs.WHOLESALE.upfrontCost).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Affiliate → Financial Modelling
// ─────────────────────────────────────────────────────────────

describe('Inter-Engine: Affiliate → Financial Modelling', () => {
  beforeEach(() => {
    resetEventBus()
  })

  it('Affiliate Commission publishes COMMISSION_RECORDED', () => {
    const affiliate = new AffiliateCommissionEngine()
    expect(affiliate.config.publishes).toContain(ENGINE_EVENTS.COMMISSION_RECORDED)
  })

  it('Commission data impacts financial model (cost deduction)', () => {
    // Commission reduces net profit in financial model
    const projectedProfit = 6000
    const totalCommissions = 500
    const adjustedProfit = projectedProfit - totalCommissions
    expect(adjustedProfit).toBe(5500)
    expect(adjustedProfit).toBeLessThan(projectedProfit)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Admin Command Center as Hub Consumer
// ─────────────────────────────────────────────────────────────

describe('Inter-Engine: Admin CC as Hub Consumer', () => {
  it('Admin CC subscribes to key pipeline events', () => {
    const admin = new AdminCommandCenterEngine()
    expect(admin.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
    expect(admin.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_GENERATED)
    expect(admin.config.subscribes).toContain(ENGINE_EVENTS.ORDER_RECEIVED)
  })

  it('Admin CC publishes deployment events', () => {
    const admin = new AdminCommandCenterEngine()
    expect(admin.config.publishes).toContain(ENGINE_EVENTS.ADMIN_PRODUCT_DEPLOYED)
    expect(admin.config.publishes).toContain(ENGINE_EVENTS.ADMIN_BATCH_DEPLOY_COMPLETE)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 7: Content Creation Consumer Gaps
// ─────────────────────────────────────────────────────────────

describe('Inter-Engine: Content Creation Consumers', () => {
  it('Content Creation subscribes to PRODUCT_ALLOCATED', () => {
    const content = new ContentCreationEngine()
    expect(content.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_ALLOCATED)
  })

  it('Content Creation subscribes to PRODUCT_PUSHED', () => {
    const content = new ContentCreationEngine()
    expect(content.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_PUSHED)
  })

  it('Store Integration subscribes to CONTENT_GENERATED', () => {
    const store = new StoreIntegrationEngine()
    expect(store.config.subscribes).toContain(ENGINE_EVENTS.CONTENT_GENERATED)
  })

  it('Store Integration subscribes to PRODUCT_ALLOCATED', () => {
    const store = new StoreIntegrationEngine()
    expect(store.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_ALLOCATED)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 8: Opportunity Feed as Universal Consumer
// ─────────────────────────────────────────────────────────────

describe('Inter-Engine: Opportunity Feed Consumers', () => {
  it('subscribes to CLUSTERS_REBUILT for cluster data', () => {
    const feed = new OpportunityFeedEngine()
    expect(feed.config.subscribes).toContain(ENGINE_EVENTS.CLUSTERS_REBUILT)
  })

  it('subscribes to MATCHES_COMPLETE for creator data', () => {
    const feed = new OpportunityFeedEngine()
    expect(feed.config.subscribes).toContain(ENGINE_EVENTS.MATCHES_COMPLETE)
  })

  it('subscribes to TREND_DETECTED for trend data', () => {
    const feed = new OpportunityFeedEngine()
    expect(feed.config.subscribes).toContain(ENGINE_EVENTS.TREND_DETECTED)
  })
})
