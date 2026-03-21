/**
 * Engine 6: Financial Modelling Engine — V9 Task Coverage Tests
 *
 * Tests against V9 tasks 6.001–6.044:
 * - Revenue/cost/profit projection (6.005–6.010)
 * - ROI percentage calculation (6.015)
 * - Payback period in days (6.020)
 * - Influencer campaign ROI (6.031–6.040)
 * - Event emission: FINANCIAL_MODEL_GENERATED, ROI_PROJECTED (6.030)
 * - Event subscription: PROFITABILITY_CALCULATED, SUPPLIER_FOUND, COMPETITOR_DETECTED (6.001)
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
  FinancialModellingEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 6 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof FinancialModellingEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FinancialModellingEngine()
  })

  it('has correct name, queues, publishes, subscribes', () => {
    expect(engine.config.name).toBe('financial-model')
    expect(engine.config.queues).toContain('financial-model')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.ROI_PROJECTED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PROFITABILITY_CALCULATED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.COMPETITOR_DETECTED)
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

  it('handleEvent logs profitability but defers per G10', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.PROFITABILITY_CALCULATED,
      payload: {},
      source: 'profitability',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('model generation deferred'))
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: generateModel Projections
// ─────────────────────────────────────────────────────────────

describe('Engine 6 — Financial Model Generation', () => {
  let engine: InstanceType<typeof FinancialModellingEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FinancialModellingEngine()
  })

  /* Task 6.005: Revenue = sellingPrice * monthlyUnits * months */
  it('projects revenue correctly', async () => {
    const result = await engine.generateModel('prod-001', {
      sellingPrice: 40,
      unitCost: 15,
      monthlyAdBudget: 500,
      estimatedCpa: 10,
      estimatedMonthlyUnits: 100,
      months: 3,
    })
    // revenue = 40 * 100 * 3 = 12000
    expect(result.projectedRevenue).toBe(12000)
  })

  /* Task 6.010: Cost = COGS + ad spend */
  it('projects total cost as COGS + ad spend', async () => {
    const result = await engine.generateModel('prod-001', {
      sellingPrice: 40,
      unitCost: 15,
      monthlyAdBudget: 500,
      estimatedCpa: 10,
      estimatedMonthlyUnits: 100,
      months: 3,
    })
    // COGS = 15 * 100 * 3 = 4500
    // AdSpend = 500 * 3 = 1500
    // total = 6000
    expect(result.projectedCost).toBe(6000)
  })

  /* Task 6.010: Profit = revenue - cost */
  it('projects profit correctly', async () => {
    const result = await engine.generateModel('prod-001', {
      sellingPrice: 40,
      unitCost: 15,
      monthlyAdBudget: 500,
      estimatedCpa: 10,
      estimatedMonthlyUnits: 100,
      months: 3,
    })
    // profit = 12000 - 6000 = 6000
    expect(result.projectedProfit).toBe(6000)
  })

  /* Task 6.015: ROI = (profit / cost) * 100 */
  it('calculates ROI percentage', async () => {
    const result = await engine.generateModel('prod-001', {
      sellingPrice: 40,
      unitCost: 15,
      monthlyAdBudget: 500,
      estimatedCpa: 10,
      estimatedMonthlyUnits: 100,
      months: 3,
    })
    // ROI = (6000 / 6000) * 100 = 100%
    expect(result.roiPercent).toBe(100)
  })

  /* Task 6.020: Payback = (monthlyAdBudget / monthlyProfit) * 30 days */
  it('calculates payback period in days', async () => {
    const result = await engine.generateModel('prod-001', {
      sellingPrice: 40,
      unitCost: 15,
      monthlyAdBudget: 500,
      estimatedCpa: 10,
      estimatedMonthlyUnits: 100,
      months: 3,
    })
    // monthlyProfit = 6000 / 3 = 2000
    // payback = ceil((500 / 2000) * 30) = ceil(7.5) = 8
    expect(result.paybackDays).toBe(8)
  })

  it('returns Infinity payback when unprofitable', async () => {
    const result = await engine.generateModel('prod-loss', {
      sellingPrice: 10,
      unitCost: 15,
      monthlyAdBudget: 1000,
      estimatedCpa: 50,
      estimatedMonthlyUnits: 10,
      months: 3,
    })
    // Revenue = 300, COGS = 450, AdSpend = 3000 → loss
    expect(result.paybackDays).toBe(Infinity)
  })

  it('handles zero total cost gracefully', async () => {
    const result = await engine.generateModel('prod-free', {
      sellingPrice: 50,
      unitCost: 0,
      monthlyAdBudget: 0,
      estimatedCpa: 0,
      estimatedMonthlyUnits: 100,
      months: 1,
    })
    // revenue = 5000, cost = 0, ROI → 0 (per implementation)
    expect(result.roiPercent).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Influencer ROI Projection
// ─────────────────────────────────────────────────────────────

describe('Engine 6 — Influencer ROI', () => {
  let engine: InstanceType<typeof FinancialModellingEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FinancialModellingEngine()
  })

  /* Task 6.031: Influencer ROI = (profit / influencerCost) * 100 */
  it('calculates influencer campaign ROI', async () => {
    const result = await engine.projectInfluencerRoi(
      'prod-001', 500, 50, 40, 15,
    )
    // revenue = 50 * 40 = 2000
    // cogs = 50 * 15 = 750
    // profit = 2000 - 750 - 500 = 750
    // roi = (750 / 500) * 100 = 150%
    expect(result.roi).toBe(150)
  })

  /* Task 6.035: Break-even conversions = influencerCost / marginPerUnit */
  it('calculates break-even conversions', async () => {
    const result = await engine.projectInfluencerRoi(
      'prod-001', 500, 50, 40, 15,
    )
    // marginPerUnit = 40 - 15 = 25
    // breakEven = ceil(500 / 25) = 20
    expect(result.breakEvenConversions).toBe(20)
  })

  it('returns Infinity break-even when no margin', async () => {
    const result = await engine.projectInfluencerRoi(
      'prod-001', 500, 50, 15, 15,
    )
    // marginPerUnit = 0 → Infinity
    expect(result.breakEvenConversions).toBe(Infinity)
  })

  it('handles zero influencer cost', async () => {
    const result = await engine.projectInfluencerRoi(
      'prod-001', 0, 50, 40, 15,
    )
    expect(result.roi).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Event Emission
// ─────────────────────────────────────────────────────────────

describe('Engine 6 — Event Emission', () => {
  let engine: InstanceType<typeof FinancialModellingEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new FinancialModellingEngine()
  })

  it('emits FINANCIAL_MODEL_GENERATED on generateModel', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED, (e) => received.push(e))

    await engine.generateModel('prod-001', {
      sellingPrice: 40, unitCost: 15, monthlyAdBudget: 500,
      estimatedCpa: 10, estimatedMonthlyUnits: 100, months: 3,
    })

    expect(received).toHaveLength(1)
    expect(received[0].source).toBe('financial-model')
    const p = received[0].payload as Record<string, unknown>
    expect(p.productId).toBe('prod-001')
    expect(p.projectedRevenue).toBeDefined()
    expect(p.roiPercent).toBeDefined()
  })

  it('emits ROI_PROJECTED on projectInfluencerRoi', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.ROI_PROJECTED, (e) => received.push(e))

    await engine.projectInfluencerRoi('prod-001', 500, 50, 40, 15)

    expect(received).toHaveLength(1)
    expect(received[0].source).toBe('financial-model')
    const p = received[0].payload as Record<string, unknown>
    expect(p.productId).toBe('prod-001')
    expect(p.roi).toBe(150)
    expect(p.breakEvenConversions).toBe(20)
    expect(p.influencerCost).toBe(500)
  })

  it('returns to idle after generateModel', async () => {
    await engine.generateModel('prod-001', {
      sellingPrice: 40, unitCost: 15, monthlyAdBudget: 500,
      estimatedCpa: 10, estimatedMonthlyUnits: 100, months: 3,
    })
    expect(engine.status()).toBe('idle')
  })
})
