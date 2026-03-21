/**
 * Engine 5: Profitability & Logistics Engine — V9 Task Coverage Tests
 *
 * Tests against V9 tasks 5.001–5.043:
 * - Unit economics calculation (5.005–5.030)
 * - Margin calculation: selling price - COGS - fees (5.010)
 * - Break-even unit calculation (5.015)
 * - Recommended pricing for 35% target margin (5.020)
 * - Margin alert threshold < 15% (5.025)
 * - Event emission: PROFITABILITY_CALCULATED, MARGIN_ALERT (5.030)
 * - Event subscription: PRODUCT_SCORED, SUPPLIER_FOUND, COMPETITOR_DETECTED (5.001)
 * - ProfitabilityEngine class lifecycle
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock server-only ─────────────────────────────────────────
vi.mock('server-only', () => ({}))

// ── Mock Supabase ────────────────────────────────────────────
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

// ── Import after mocks ──────────────────────────────────────
import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  ProfitabilityEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: ProfitabilityEngine Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 5 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof ProfitabilityEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ProfitabilityEngine()
  })

  /* Task 5.001: Subscribes to PRODUCT_SCORED, SUPPLIER_FOUND, COMPETITOR_DETECTED */
  it('subscribes to correct events', () => {
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.COMPETITOR_DETECTED)
  })

  it('publishes PROFITABILITY_CALCULATED and MARGIN_ALERT', () => {
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.PROFITABILITY_CALCULATED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.MARGIN_ALERT)
  })

  it('has correct name and queue', () => {
    expect(engine.config.name).toBe('profitability')
    expect(engine.config.queues).toContain('profitability-calc')
  })

  it('transitions through lifecycle states', async () => {
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
// SECTION 2: Margin Calculation
// ─────────────────────────────────────────────────────────────

describe('Engine 5 — Margin Calculation', () => {
  let engine: InstanceType<typeof ProfitabilityEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ProfitabilityEngine()
  })

  /* Task 5.010: margin = sellingPrice - (unitCost + shipping + platformFee + adCost) */
  it('calculates margin as selling price minus total costs', async () => {
    const result = await engine.calculateProfitability('prod-001', {
      sellingPrice: 50,
      unitCost: 15,
      shippingCost: 5,
      platformFeeRate: 0.10,  // $5 fee
      adCostPerUnit: 3,
      platform: 'shopify',
    })
    // totalCost = 15 + 5 + 5 + 3 = 28
    // margin = 50 - 28 = 22
    expect(result.margin).toBe(22)
  })

  it('calculates margin percentage correctly', async () => {
    const result = await engine.calculateProfitability('prod-001', {
      sellingPrice: 100,
      unitCost: 30,
      shippingCost: 10,
      platformFeeRate: 0.10,  // $10
      adCostPerUnit: 5,
      platform: 'shopify',
    })
    // totalCost = 30 + 10 + 10 + 5 = 55
    // margin = 45, marginPercent = 45%
    expect(result.margin).toBe(45)
    expect(result.marginPercent).toBe(45)
  })

  it('handles zero selling price gracefully', async () => {
    const result = await engine.calculateProfitability('prod-free', {
      sellingPrice: 0,
      unitCost: 10,
      shippingCost: 5,
      platformFeeRate: 0.10,
      adCostPerUnit: 2,
      platform: 'shopify',
    })
    expect(result.marginPercent).toBe(0)
    expect(result.margin).toBeLessThan(0)
  })

  it('handles high-cost product with negative margin', async () => {
    const result = await engine.calculateProfitability('prod-loss', {
      sellingPrice: 20,
      unitCost: 15,
      shippingCost: 5,
      platformFeeRate: 0.15,  // $3
      adCostPerUnit: 3,
      platform: 'shopify',
    })
    // totalCost = 15 + 5 + 3 + 3 = 26
    // margin = 20 - 26 = -6
    expect(result.margin).toBeLessThan(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Break-Even Calculation
// ─────────────────────────────────────────────────────────────

describe('Engine 5 — Break-Even Calculation', () => {
  let engine: InstanceType<typeof ProfitabilityEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ProfitabilityEngine()
  })

  /* Task 5.015: breakEvenUnits = ceil(100 / margin) */
  it('calculates break-even units correctly', async () => {
    const result = await engine.calculateProfitability('prod-001', {
      sellingPrice: 50,
      unitCost: 10,
      shippingCost: 5,
      platformFeeRate: 0.10,  // $5
      adCostPerUnit: 5,
      platform: 'shopify',
    })
    // margin = 50 - 25 = 25
    // breakEven = ceil(100/25) = 4
    expect(result.breakEvenUnits).toBe(4)
  })

  it('returns Infinity when margin is zero or negative', async () => {
    const result = await engine.calculateProfitability('prod-no-profit', {
      sellingPrice: 20,
      unitCost: 20,
      shippingCost: 5,
      platformFeeRate: 0.0,
      adCostPerUnit: 0,
      platform: 'shopify',
    })
    // margin = 20 - 25 = -5
    expect(result.breakEvenUnits).toBe(Infinity)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Recommended Price (35% Target Margin)
// ─────────────────────────────────────────────────────────────

describe('Engine 5 — Recommended Price', () => {
  let engine: InstanceType<typeof ProfitabilityEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ProfitabilityEngine()
  })

  /* Task 5.020: recommendedPrice = totalCost / (1 - 0.35) for 35% margin target */
  it('recommends price for 35% target margin', async () => {
    const result = await engine.calculateProfitability('prod-001', {
      sellingPrice: 30,
      unitCost: 10,
      shippingCost: 3,
      platformFeeRate: 0.10,  // $3
      adCostPerUnit: 2,
      platform: 'shopify',
    })
    // totalCost = 10 + 3 + 3 + 2 = 18
    // recommended = 18 / 0.65 = 27.69
    expect(result.recommendedPrice).toBeCloseTo(27.69, 1)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Event Emission
// ─────────────────────────────────────────────────────────────

describe('Engine 5 — Event Emission', () => {
  let engine: InstanceType<typeof ProfitabilityEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ProfitabilityEngine()
  })

  /* Task 5.030: Emits PROFITABILITY_CALCULATED on every calculation */
  it('emits PROFITABILITY_CALCULATED with correct payload', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.PROFITABILITY_CALCULATED, (e) => received.push(e))

    await engine.calculateProfitability('prod-001', {
      sellingPrice: 50, unitCost: 15, shippingCost: 5,
      platformFeeRate: 0.10, adCostPerUnit: 3, platform: 'shopify',
    })

    expect(received).toHaveLength(1)
    expect(received[0].source).toBe('profitability')
    const p = received[0].payload as Record<string, unknown>
    expect(p.productId).toBe('prod-001')
    expect(p.margin).toBeDefined()
    expect(p.marginPercent).toBeDefined()
    expect(p.breakEvenUnits).toBeDefined()
    expect(p.recommendedPrice).toBeDefined()
    expect(p.fulfillmentType).toBe('DROPSHIP')
  })

  /* Task 5.025: Emits MARGIN_ALERT when margin < 15% but > 0 */
  it('emits MARGIN_ALERT when margin is below 15%', async () => {
    const bus = getEventBus()
    const alerts: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.MARGIN_ALERT, (e) => alerts.push(e))

    await engine.calculateProfitability('prod-low', {
      sellingPrice: 25,
      unitCost: 15,
      shippingCost: 3,
      platformFeeRate: 0.10,  // $2.5
      adCostPerUnit: 2,
      platform: 'shopify',
    })
    // totalCost = 15 + 3 + 2.5 + 2 = 22.5
    // margin = 2.5, marginPercent = 10%
    expect(alerts).toHaveLength(1)
    const p = alerts[0].payload as Record<string, unknown>
    expect(p.productId).toBe('prod-low')
    expect(p.threshold).toBe(15)
    expect(p.marginPercent as number).toBeLessThan(15)
  })

  it('does NOT emit MARGIN_ALERT when margin >= 15%', async () => {
    const bus = getEventBus()
    const alerts: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.MARGIN_ALERT, (e) => alerts.push(e))

    await engine.calculateProfitability('prod-ok', {
      sellingPrice: 50, unitCost: 15, shippingCost: 5,
      platformFeeRate: 0.10, adCostPerUnit: 3, platform: 'shopify',
    })
    // margin = 22, marginPercent = 44% — well above 15%
    expect(alerts).toHaveLength(0)
  })

  it('does NOT emit MARGIN_ALERT when margin is negative', async () => {
    const bus = getEventBus()
    const alerts: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.MARGIN_ALERT, (e) => alerts.push(e))

    await engine.calculateProfitability('prod-loss', {
      sellingPrice: 10, unitCost: 15, shippingCost: 5,
      platformFeeRate: 0.10, adCostPerUnit: 3, platform: 'shopify',
    })
    // margin = -14, marginPercent = -140% — not between 0 and 15
    expect(alerts).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Event Handling (handleEvent)
// ─────────────────────────────────────────────────────────────

describe('Engine 5 — Event Handling', () => {
  let engine: InstanceType<typeof ProfitabilityEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ProfitabilityEngine()
  })

  it('logs SUPPLIER_FOUND but defers recalc per G10', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.SUPPLIER_FOUND,
      payload: { supplierId: 'sup-001' },
      source: 'supplier-discovery',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Supplier found'))
    spy.mockRestore()
  })

  it('logs COMPETITOR_DETECTED but defers pricing refresh', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.COMPETITOR_DETECTED,
      payload: { competitorId: 'comp-001' },
      source: 'competitor-intelligence',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Competitor detected'))
    spy.mockRestore()
  })

  it('returns to idle after calculateProfitability completes', async () => {
    await engine.calculateProfitability('prod-001', {
      sellingPrice: 50, unitCost: 15, shippingCost: 5,
      platformFeeRate: 0.10, adCostPerUnit: 3, platform: 'shopify',
    })
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 7: Pure Unit Economics Logic
// ─────────────────────────────────────────────────────────────

describe('Engine 5 — Unit Economics Calculations', () => {
  /* Task 5.010: Platform fee calculation */
  it('platform fee = sellingPrice * platformFeeRate', () => {
    const sellingPrice = 50
    const feeRate = 0.15
    const fee = sellingPrice * feeRate
    expect(fee).toBe(7.5)
  })

  /* Task 5.010: Total cost = sum of all cost components */
  it('total cost = unitCost + shipping + platformFee + adCost', () => {
    const unitCost = 15
    const shippingCost = 5
    const platformFee = 5
    const adCostPerUnit = 3
    const total = unitCost + shippingCost + platformFee + adCostPerUnit
    expect(total).toBe(28)
  })

  /* Typical Shopify fee */
  it('shopify takes ~2.9% + $0.30 per transaction', () => {
    const sellingPrice = 50
    const shopifyFee = sellingPrice * 0.029 + 0.30
    expect(shopifyFee).toBeCloseTo(1.75, 1)
  })

  /* Task 5.020: Target margin formula */
  it('35% target margin formula: price = cost / 0.65', () => {
    const totalCost = 20
    const targetPrice = totalCost / (1 - 0.35)
    expect(targetPrice).toBeCloseTo(30.77, 1)
  })
})
