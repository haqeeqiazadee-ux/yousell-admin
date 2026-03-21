/**
 * Engine: Fulfillment Recommendation — V9 Task Coverage Tests
 *
 * Tests decision tree (DROPSHIP/WHOLESALE/POD/DIGITAL/AFFILIATE),
 * platform-specific overrides, POD margin check, comparison table,
 * admin override, engine lifecycle, and event emission.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      limit: vi.fn().mockReturnThis(),
    })),
  }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  FulfillmentRecommendationEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('FulfillmentRecommendation — Config & Lifecycle', () => {
  let engine: InstanceType<typeof FulfillmentRecommendationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FulfillmentRecommendationEngine()
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('fulfillment-recommendation')
    expect(engine.config.queues).toContain('fulfillment-eval')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.FULFILLMENT_RECOMMENDED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.FULFILLMENT_OVERRIDDEN)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PROFITABILITY_CALCULATED)
  })

  it('transitions through lifecycle', async () => {
    expect(engine.status()).toBe('idle')
    await engine.start()
    expect(engine.status()).toBe('running')
    await engine.stop()
    expect(engine.status()).toBe('stopped')
  })

  it('healthCheck returns true', async () => {
    expect(await engine.healthCheck()).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Decision Tree — Physical Products
// ─────────────────────────────────────────────────────────────

describe('FulfillmentRecommendation — Physical Products', () => {
  let engine: InstanceType<typeof FulfillmentRecommendationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FulfillmentRecommendationEngine()
  })

  /* Task 14.06: Low margin or low price → DROPSHIP */
  it('recommends DROPSHIP for low-margin physical products', async () => {
    const result = await engine.recommend('prod-001', {
      productType: 'physical',
      price: 20,
      margin: 0.15,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: true,
    })
    expect(result.fulfillmentType).toBe('DROPSHIP')
    expect(result.confidence).toBe(0.8)
  })

  it('recommends DROPSHIP for low price < $30', async () => {
    const result = await engine.recommend('prod-002', {
      productType: 'physical',
      price: 25,
      margin: 0.5,
      volumeScore: 80,
      targetPlatform: 'shopify',
      hasDropshipSupplier: true,
    })
    expect(result.fulfillmentType).toBe('DROPSHIP')
  })

  /* Task 14.07: High margin + high volume → WHOLESALE */
  it('recommends WHOLESALE for high-margin high-volume products', async () => {
    const result = await engine.recommend('prod-003', {
      productType: 'physical',
      price: 50,
      margin: 0.4,
      volumeScore: 80,
      targetPlatform: 'shopify',
      hasDropshipSupplier: true,
    })
    expect(result.fulfillmentType).toBe('WHOLESALE')
    expect(result.confidence).toBe(0.85)
  })

  /* Task 14.08: Medium margin, has supplier → DROPSHIP fallback */
  it('recommends DROPSHIP when margin ok but volume low and has supplier', async () => {
    const result = await engine.recommend('prod-004', {
      productType: 'physical',
      price: 50,
      margin: 0.25,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: true,
    })
    expect(result.fulfillmentType).toBe('DROPSHIP')
    expect(result.confidence).toBe(0.6)
  })

  it('recommends WHOLESALE when no dropship supplier', async () => {
    const result = await engine.recommend('prod-005', {
      productType: 'physical',
      price: 50,
      margin: 0.25,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: false,
    })
    expect(result.fulfillmentType).toBe('WHOLESALE')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Decision Tree — Other Product Types
// ─────────────────────────────────────────────────────────────

describe('FulfillmentRecommendation — Other Product Types', () => {
  let engine: InstanceType<typeof FulfillmentRecommendationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FulfillmentRecommendationEngine()
  })

  /* Task 14.09: Custom apparel → POD */
  it('recommends POD for custom apparel', async () => {
    const result = await engine.recommend('prod-006', {
      productType: 'custom_apparel',
      price: 35,
      margin: 0.4,
      volumeScore: 60,
      targetPlatform: 'shopify',
      hasDropshipSupplier: false,
    })
    expect(result.fulfillmentType).toBe('POD')
    expect(result.confidence).toBe(0.9)
  })

  it('POD with low margin gets lower confidence', async () => {
    const result = await engine.recommend('prod-007', {
      productType: 'custom_apparel',
      price: 20,
      margin: 0.2,
      volumeScore: 60,
      targetPlatform: 'shopify',
      hasDropshipSupplier: false,
    })
    // POD margin < 0.3 → overridden to DROPSHIP
    expect(result.fulfillmentType).toBe('DROPSHIP')
  })

  /* Task 14.10: Digital → DIGITAL */
  it('recommends DIGITAL for digital products', async () => {
    const result = await engine.recommend('prod-008', {
      productType: 'digital',
      price: 20,
      margin: 0.9,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: false,
    })
    expect(result.fulfillmentType).toBe('DIGITAL')
    expect(result.confidence).toBe(0.95)
  })

  /* Task 14.11: SaaS → AFFILIATE */
  it('recommends AFFILIATE for SaaS products', async () => {
    const result = await engine.recommend('prod-009', {
      productType: 'saas',
      price: 100,
      margin: 0.2,
      volumeScore: 70,
      targetPlatform: 'shopify',
      hasDropshipSupplier: false,
    })
    expect(result.fulfillmentType).toBe('AFFILIATE')
    expect(result.confidence).toBe(0.95)
  })

  /* Unknown type → PENDING_REVIEW */
  it('recommends PENDING_REVIEW for unknown product types', async () => {
    const result = await engine.recommend('prod-010', {
      productType: 'unknown',
      price: 50,
      margin: 0.3,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: false,
    })
    expect(result.fulfillmentType).toBe('PENDING_REVIEW')
    expect(result.confidence).toBe(0.2)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Platform-Specific Overrides
// ─────────────────────────────────────────────────────────────

describe('FulfillmentRecommendation — Platform Overrides', () => {
  let engine: InstanceType<typeof FulfillmentRecommendationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FulfillmentRecommendationEngine()
  })

  /* Task 14.12: TikTok Shop requires US shipping → PENDING_REVIEW if no supplier */
  it('overrides to PENDING_REVIEW for TikTok Shop without supplier', async () => {
    const result = await engine.recommend('prod-011', {
      productType: 'physical',
      price: 25,
      margin: 0.15,
      volumeScore: 50,
      targetPlatform: 'tiktok-shop',
      hasDropshipSupplier: false,
    })
    expect(result.fulfillmentType).toBe('PENDING_REVIEW')
    expect(result.confidence).toBe(0.3)
  })

  /* Task 14.13: Etsy forces POD */
  it('overrides to POD for Etsy platform', async () => {
    const result = await engine.recommend('prod-012', {
      productType: 'physical',
      price: 50,
      margin: 0.4,
      volumeScore: 80,
      targetPlatform: 'etsy',
      hasDropshipSupplier: true,
    })
    // WHOLESALE → overridden to POD for Etsy
    expect(result.fulfillmentType).toBe('POD')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Comparison Table
// ─────────────────────────────────────────────────────────────

describe('FulfillmentRecommendation — Comparison Table', () => {
  let engine: InstanceType<typeof FulfillmentRecommendationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FulfillmentRecommendationEngine()
  })

  /* Task 14.19: Always includes 5 fulfillment type comparisons */
  it('returns comparison table with all 5 fulfillment types', async () => {
    const result = await engine.recommend('prod-001', {
      productType: 'physical',
      price: 30,
      margin: 0.3,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: true,
    })

    expect(Object.keys(result.comparisonTable)).toHaveLength(5)
    expect(result.comparisonTable).toHaveProperty('DROPSHIP')
    expect(result.comparisonTable).toHaveProperty('WHOLESALE')
    expect(result.comparisonTable).toHaveProperty('POD')
    expect(result.comparisonTable).toHaveProperty('DIGITAL')
    expect(result.comparisonTable).toHaveProperty('AFFILIATE')
  })

  it('comparison table entries have margin, upfrontCost, risk', async () => {
    const result = await engine.recommend('prod-001', {
      productType: 'digital',
      price: 20,
      margin: 0.9,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: false,
    })

    const dropship = result.comparisonTable.DROPSHIP
    expect(dropship).toHaveProperty('margin')
    expect(dropship).toHaveProperty('upfrontCost')
    expect(dropship).toHaveProperty('risk')
    expect(dropship.upfrontCost).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Admin Override
// ─────────────────────────────────────────────────────────────

describe('FulfillmentRecommendation — Admin Override', () => {
  let engine: InstanceType<typeof FulfillmentRecommendationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FulfillmentRecommendationEngine()
  })

  /* Task 14.25: Admin override emits FULFILLMENT_OVERRIDDEN */
  it('emits FULFILLMENT_OVERRIDDEN on admin override', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.FULFILLMENT_OVERRIDDEN, (e) => received.push(e))

    await engine.override('prod-001', 'WHOLESALE', 'admin-001', 'Better margin with bulk')

    expect(received).toHaveLength(1)
    const p = received[0].payload as Record<string, unknown>
    expect(p.productId).toBe('prod-001')
    expect(p.newType).toBe('WHOLESALE')
    expect(p.overriddenBy).toBe('admin-001')
    expect(p.reason).toBe('Better margin with bulk')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 7: Event Emission
// ─────────────────────────────────────────────────────────────

describe('FulfillmentRecommendation — Event Emission', () => {
  let engine: InstanceType<typeof FulfillmentRecommendationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FulfillmentRecommendationEngine()
  })

  it('emits FULFILLMENT_RECOMMENDED on recommend()', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.FULFILLMENT_RECOMMENDED, (e) => received.push(e))

    await engine.recommend('prod-001', {
      productType: 'digital',
      price: 20,
      margin: 0.9,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: false,
    })

    expect(received).toHaveLength(1)
    expect(received[0].source).toBe('fulfillment-recommendation')
    const p = received[0].payload as Record<string, unknown>
    expect(p.productId).toBe('prod-001')
    expect(p.recommendedType).toBe('DIGITAL')
    expect(p.confidence).toBe(0.95)
  })

  it('returns to idle after recommend()', async () => {
    await engine.recommend('prod-001', {
      productType: 'physical',
      price: 30,
      margin: 0.3,
      volumeScore: 50,
      targetPlatform: 'shopify',
      hasDropshipSupplier: true,
    })
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 8: Event Handling
// ─────────────────────────────────────────────────────────────

describe('FulfillmentRecommendation — Event Handling', () => {
  let engine: InstanceType<typeof FulfillmentRecommendationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FulfillmentRecommendationEngine()
  })

  it('handles SUPPLIER_FOUND event', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.SUPPLIER_FOUND,
      payload: {},
      source: 'supplier-discovery',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('re-evaluation deferred'))
    spy.mockRestore()
  })

  it('handles PROFITABILITY_CALCULATED event', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.PROFITABILITY_CALCULATED,
      payload: {},
      source: 'profitability',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('re-evaluation deferred'))
    spy.mockRestore()
  })
})
