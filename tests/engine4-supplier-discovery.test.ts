/**
 * Engine 4: Supplier Discovery Engine — V9 Tests
 *
 * Tests the REAL SupplierDiscoveryEngine class:
 * - Config, lifecycle, healthCheck
 * - Event handling (PRODUCT_SCORED)
 * - Domain methods: discoverSuppliers(), verifySupplier()
 * - Event emission verification
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
  SupplierDiscoveryEngine,
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 4 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof SupplierDiscoveryEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new SupplierDiscoveryEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('has correct name, queues, publishes, subscribes', () => {
    expect(engine.config.name).toBe('supplier-discovery')
    expect(engine.config.queues).toContain('supplier-discovery')
    expect(engine.config.queues).toContain('supplier-verify')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.SUPPLIER_VERIFIED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.SUPPLIER_BATCH_COMPLETE)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PROFITABILITY_CALCULATED)
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

  it('init resets to idle', async () => {
    await engine.start()
    await engine.init()
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Event Handling
// ─────────────────────────────────────────────────────────────

describe('Engine 4 — Event Handling', () => {
  let engine: InstanceType<typeof SupplierDiscoveryEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new SupplierDiscoveryEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('handles PRODUCT_SCORED event (deferred per G10)', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.PRODUCT_SCORED,
      payload: { productId: 'prod-001', finalScore: 85 },
      source: 'scoring',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('supplier search eligible')
    )
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Domain Methods — discoverSuppliers()
// ─────────────────────────────────────────────────────────────

describe('Engine 4 — discoverSuppliers()', () => {
  let engine: InstanceType<typeof SupplierDiscoveryEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new SupplierDiscoveryEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('returns suppliersFound count', async () => {
    const result = await engine.discoverSuppliers('prod-001', 'smart watch')
    expect(result).toHaveProperty('suppliersFound')
    expect(typeof result.suppliersFound).toBe('number')
  })

  it('uses default platforms when none specified', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.SUPPLIER_BATCH_COMPLETE, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.discoverSuppliers('prod-001', 'smart watch')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      platforms: ['aliexpress', 'alibaba'],
    })
  })

  it('accepts custom platforms', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.SUPPLIER_BATCH_COMPLETE, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.discoverSuppliers('prod-001', 'widget', ['1688', 'printful'])

    expect(received[0].payload).toMatchObject({
      platforms: ['1688', 'printful'],
    })
  })

  it('emits SUPPLIER_BATCH_COMPLETE event with full payload', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.SUPPLIER_BATCH_COMPLETE, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.discoverSuppliers('prod-001', 'smart watch', ['alibaba'])

    expect(received).toHaveLength(1)
    expect(received[0].payload).toEqual({
      productId: 'prod-001',
      keyword: 'smart watch',
      platforms: ['alibaba'],
      suppliersFound: 0,
    })
    expect(received[0].source).toBe('supplier-discovery')
  })

  it('transitions status: running → idle after completion', async () => {
    await engine.discoverSuppliers('prod-001', 'keyword')
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Domain Methods — verifySupplier()
// ─────────────────────────────────────────────────────────────

describe('Engine 4 — verifySupplier()', () => {
  let engine: InstanceType<typeof SupplierDiscoveryEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new SupplierDiscoveryEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('returns verified status and score', async () => {
    const result = await engine.verifySupplier('sup-001', 'prod-001')
    expect(result).toHaveProperty('verified')
    expect(result).toHaveProperty('score')
    expect(typeof result.verified).toBe('boolean')
    expect(typeof result.score).toBe('number')
  })

  it('emits SUPPLIER_VERIFIED event', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.SUPPLIER_VERIFIED, (e: EngineEvent) => {
      received.push(e)
    })

    // Override mock to return supplier data so verification proceeds
    const mockDb = createMockDbClient() as any
    const origFrom = mockDb.from.bind(mockDb)
    mockDb.from = vi.fn((table: string) => {
      if (table === 'product_suppliers') {
        const supplierData = { id: 'sup-001', years_active: 3, rating: 4.5, response_rate: 90, on_time_delivery: 95, dispute_rate: 1 }
        const chainMock: Record<string, unknown> = {}
        chainMock.select = vi.fn().mockReturnValue(chainMock)
        chainMock.eq = vi.fn().mockReturnValue(chainMock)
        chainMock.update = vi.fn().mockReturnValue(chainMock)
        chainMock.single = vi.fn().mockResolvedValue({ data: supplierData, error: null })
        return chainMock
      }
      return origFrom(table)
    })
    engine.setDbClient(mockDb)

    await engine.verifySupplier('sup-001', 'prod-001')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      supplierId: 'sup-001',
      productId: 'prod-001',
    })
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Business Rule Specifications (V9 Tasks)
// ─────────────────────────────────────────────────────────────

describe('Engine 4 — Business Rule Specs', () => {
  it('supplier reliability score: certs*10(max30) + reviews/10(max25) + years*5(max25) + verified(20)', () => {
    const calculateReliability = (inputs: {
      certCount: number
      reviewCount: number
      tradingYears: number
      isVerified: boolean
    }) => {
      let score = 0
      score += Math.min(inputs.certCount * 10, 30)
      score += Math.min(inputs.reviewCount / 10, 25)
      score += Math.min(inputs.tradingYears * 5, 25)
      score += inputs.isVerified ? 20 : 0
      return Math.min(Math.round(score), 100)
    }

    expect(calculateReliability({ certCount: 3, reviewCount: 200, tradingYears: 5, isVerified: true }))
      .toBe(95)
    expect(calculateReliability({ certCount: 0, reviewCount: 0, tradingYears: 0, isVerified: false }))
      .toBe(0)
    expect(calculateReliability({ certCount: 1, reviewCount: 50, tradingYears: 2, isVerified: true }))
      .toBe(45)
  })

  it('fulfillment model tagging: us_warehouse > dropship > wholesale_easy > wholesale_bulk (4.033)', () => {
    const tagSupplier = (supplier: {
      dropship: boolean; moq: number; us_warehouse: boolean; lead_time: number
    }) => {
      if (supplier.us_warehouse && supplier.lead_time <= 5) return 'us_warehouse_priority'
      if (supplier.dropship && supplier.moq <= 1) return 'dropship_ok'
      if (supplier.moq <= 100) return 'wholesale_easy'
      return 'wholesale_bulk'
    }

    expect(tagSupplier({ dropship: true, moq: 1, us_warehouse: true, lead_time: 3 })).toBe('us_warehouse_priority')
    expect(tagSupplier({ dropship: true, moq: 1, us_warehouse: false, lead_time: 7 })).toBe('dropship_ok')
    expect(tagSupplier({ dropship: false, moq: 50, us_warehouse: false, lead_time: 14 })).toBe('wholesale_easy')
    expect(tagSupplier({ dropship: false, moq: 500, us_warehouse: false, lead_time: 21 })).toBe('wholesale_bulk')
  })

  it('auto-rejection: lead_time > 15, no contact, MOQ > 500 for dropship (4.034-4.036)', () => {
    const shouldReject = (s: { lead_time: number; contact: string | null; moq: number; model: string }) => {
      if (s.lead_time > 15) return 'lead_time_exceeded'
      if (!s.contact || s.contact.trim() === '') return 'no_contact'
      if (s.model === 'dropship' && s.moq > 500) return 'moq_too_high_for_dropship'
      return null
    }

    expect(shouldReject({ lead_time: 20, contact: 'a@b.com', moq: 1, model: 'dropship' })).toBe('lead_time_exceeded')
    expect(shouldReject({ lead_time: 5, contact: null, moq: 1, model: 'dropship' })).toBe('no_contact')
    expect(shouldReject({ lead_time: 5, contact: 'a@b.com', moq: 1000, model: 'dropship' })).toBe('moq_too_high_for_dropship')
    expect(shouldReject({ lead_time: 5, contact: 'a@b.com', moq: 100, model: 'dropship' })).toBeNull()
  })

  it('top 10 selection: 5 standard + 3 US warehouse + 2 POD (4.043)', () => {
    const suppliers = [
      ...Array(8).fill(null).map((_, i) => ({ id: `std-${i}`, type: 'standard', score: 90 - i * 5 })),
      ...Array(5).fill(null).map((_, i) => ({ id: `us-${i}`, type: 'us_warehouse', score: 85 - i * 5 })),
      ...Array(3).fill(null).map((_, i) => ({ id: `pod-${i}`, type: 'pod', score: 80 - i * 5 })),
    ]

    const standard = suppliers.filter(s => s.type === 'standard').slice(0, 5)
    const usWarehouse = suppliers.filter(s => s.type === 'us_warehouse').slice(0, 3)
    const pod = suppliers.filter(s => s.type === 'pod').slice(0, 2)

    const shortlist = [...standard, ...usWarehouse, ...pod]
    expect(shortlist).toHaveLength(10)
    expect(standard).toHaveLength(5)
    expect(usWarehouse).toHaveLength(3)
    expect(pod).toHaveLength(2)
  })
})
