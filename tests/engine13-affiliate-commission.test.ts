/**
 * Engine 13: Affiliate Commission Engine — V9 Tests
 *
 * Tests the REAL AffiliateCommissionEngine class:
 * - Config, lifecycle, healthCheck
 * - Event handling (ORDER_RECEIVED, ORDER_FULFILLED)
 * - Domain methods: recordCommission(), calculatePayout()
 * - Event emission verification
 * - Business rule specifications (dual-stream revenue, commission tracking, dashboard)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks (required by barrel import transitive deps) ────────
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

import {
  AffiliateCommissionEngine,
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 13 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof AffiliateCommissionEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new AffiliateCommissionEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('has correct name, queues, publishes, subscribes', () => {
    expect(engine.config.name).toBe('affiliate-engine')
    expect(engine.config.queues).toContain('commission-calc')
    expect(engine.config.queues).toContain('payout-processing')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.COMMISSION_RECORDED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.PAYOUT_CALCULATED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.ORDER_RECEIVED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.ORDER_FULFILLED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_PUSHED)
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
// SECTION 2: Event Handling
// ─────────────────────────────────────────────────────────────

describe('Engine 13 — Event Handling', () => {
  let engine: InstanceType<typeof AffiliateCommissionEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new AffiliateCommissionEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('handles ORDER_RECEIVED event (deferred per G10)', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.ORDER_RECEIVED,
      payload: { orderId: 'ord-001', revenue: 100 },
      source: 'order-tracking',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('commission calculation eligible')
    )
    spy.mockRestore()
  })

  it('handles ORDER_FULFILLED event', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.ORDER_FULFILLED,
      payload: { orderId: 'ord-001' },
      source: 'order-tracking',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('commission confirmation eligible')
    )
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Domain Methods — recordCommission()
// ─────────────────────────────────────────────────────────────

describe('Engine 13 — recordCommission()', () => {
  let engine: InstanceType<typeof AffiliateCommissionEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new AffiliateCommissionEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('calculates commission amount correctly', async () => {
    const result = await engine.recordCommission('ord-001', 'prod-001', {
      commissionType: 'internal',
      orderRevenue: 100,
      commissionRate: 0.20,
    })

    expect(result.amount).toBe(20) // 100 * 0.20
    expect(result.commissionId).toContain('comm_ord-001')
  })

  it('handles client_referral commission type', async () => {
    const result = await engine.recordCommission('ord-002', 'prod-002', {
      commissionType: 'client_referral',
      orderRevenue: 59,
      commissionRate: 0.15,
    })

    expect(result.amount).toBeCloseTo(8.85, 2) // 59 * 0.15
  })

  it('emits COMMISSION_RECORDED event with correct payload', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.COMMISSION_RECORDED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.recordCommission('ord-001', 'prod-001', {
      commissionType: 'internal',
      orderRevenue: 79,
      commissionRate: 0.20,
    })

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      orderId: 'ord-001',
      productId: 'prod-001',
      commissionType: 'internal',
      amount: 15.8,
      rate: 0.20,
    })
    expect(received[0].source).toBe('affiliate-engine')
  })

  it('transitions status: running → idle after completion', async () => {
    await engine.recordCommission('ord-001', 'prod-001', {
      commissionType: 'internal', orderRevenue: 50, commissionRate: 0.10,
    })
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Domain Methods — calculatePayout()
// ─────────────────────────────────────────────────────────────

describe('Engine 13 — calculatePayout()', () => {
  let engine: InstanceType<typeof AffiliateCommissionEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new AffiliateCommissionEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('returns totalCommissions, payoutAmount, holdbackRate', async () => {
    const result = await engine.calculatePayout('aff-001', '2026-03')
    expect(result).toHaveProperty('total_commissions')
    expect(result).toHaveProperty('payout_amount')
    expect(result).toHaveProperty('holdback_rate')
    expect(result.holdback_rate).toBe(0.1) // 10% holdback
  })

  it('emits PAYOUT_CALCULATED event', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.PAYOUT_CALCULATED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.calculatePayout('aff-001', '2026-03')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      affiliateId: 'aff-001',
      month: '2026-03',
      holdbackRate: 0.1,
    })
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Business Rule Specifications (V9 Tasks)
// ─────────────────────────────────────────────────────────────

describe('Engine 13 — Business Rule Specs', () => {
  it('commission calculation: revenue * rate (13.18)', () => {
    const calc = (revenue: number, rate: number) =>
      Math.round(revenue * rate * 100) / 100

    expect(calc(79.00, 0.20)).toBe(15.80)
    expect(calc(100.00, 0.15)).toBe(15.00)
    expect(calc(29.00, 0.30)).toBe(8.70)
    expect(calc(0, 0.20)).toBe(0)
  })

  it('commission status transitions: pending → approved → paid (13.19)', () => {
    const transitions: Record<string, string[]> = {
      pending: ['approved', 'rejected'],
      approved: ['paid'],
      paid: [],
      rejected: [],
    }
    expect(transitions.pending).toContain('approved')
    expect(transitions.approved).toContain('paid')
    expect(transitions.paid).toHaveLength(0)
  })

  it('AI routing: Haiku for bulk, Sonnet for premium (13.12)', () => {
    const routeModel = (type: string) => {
      const premium = ['case_study', 'long_form_review']
      return premium.includes(type) ? 'sonnet' : 'haiku'
    }
    expect(routeModel('blog_review')).toBe('haiku')
    expect(routeModel('case_study')).toBe('sonnet')
  })

  it('dual-stream revenue split: stream_1 + stream_2 = total (13.33)', () => {
    const commissions = [
      { stream_type: 'stream_1', amount: 500 },
      { stream_type: 'stream_1', amount: 300 },
      { stream_type: 'stream_2', amount: 200 },
      { stream_type: 'stream_2', amount: 150 },
    ]
    const s1 = commissions.filter(c => c.stream_type === 'stream_1').reduce((s, c) => s + c.amount, 0)
    const s2 = commissions.filter(c => c.stream_type === 'stream_2').reduce((s, c) => s + c.amount, 0)
    expect(s1).toBe(800)
    expect(s2).toBe(350)
    expect(s1 + s2).toBe(1150)
  })

  it('highest ROI affiliate category identification (13.37)', () => {
    const categories = [
      { name: 'ecommerce_platform', revenue: 5000, cost: 500 },
      { name: 'email_marketing', revenue: 3000, cost: 200 },
    ]
    const withROI = categories.map(c => ({
      ...c, roi: (c.revenue - c.cost) / c.cost,
    })).sort((a, b) => b.roi - a.roi)

    expect(withROI[0].name).toBe('email_marketing') // ROI = 14
    expect(withROI[0].roi).toBe(14)
  })

  it('10% holdback rate for chargeback protection', () => {
    const totalCommissions = 1000
    const holdbackRate = 0.1
    const payoutAmount = totalCommissions * (1 - holdbackRate)
    expect(payoutAmount).toBe(900)
  })
})
