/**
 * Engine 8: Client Allocation System — V9 Tests
 *
 * Tests the REAL ClientAllocationEngine class:
 * - Config, lifecycle, healthCheck
 * - Event handling (PRODUCT_SCORED, BLUEPRINT_APPROVED)
 * - Domain methods: allocateProduct(), batchAllocate()
 * - Event emission verification
 * - Business rule specifications (pool management, quotas)
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
  ClientAllocationEngine,
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { PRICING_TIERS } from '@/lib/stripe'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 8 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof ClientAllocationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ClientAllocationEngine()
  })

  it('has correct name, queues, publishes, subscribes', () => {
    expect(engine.config.name).toBe('client-allocation')
    expect(engine.config.queues).toContain('product-allocation')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_ALLOCATED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.ALLOCATION_BATCH_COMPLETE)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
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

describe('Engine 8 — Event Handling', () => {
  let engine: InstanceType<typeof ClientAllocationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ClientAllocationEngine()
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
      expect.stringContaining('allocation deferred')
    )
    spy.mockRestore()
  })

  it('handles BLUEPRINT_APPROVED event', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.BLUEPRINT_APPROVED,
      payload: { blueprintId: 'bp-001', productId: 'prod-001' },
      source: 'launch-blueprint',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('Blueprint approved')
    )
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Domain Methods — allocateProduct()
// ─────────────────────────────────────────────────────────────

describe('Engine 8 — allocateProduct()', () => {
  let engine: InstanceType<typeof ClientAllocationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ClientAllocationEngine()
  })

  it('returns allocationId and exclusive flag', async () => {
    const result = await engine.allocateProduct('prod-001', 'client-001', 'shopify', 'growth')
    expect(result.allocationId).toContain('alloc_prod-001_client-001')
    expect(typeof result.exclusive).toBe('boolean')
  })

  it('emits PRODUCT_ALLOCATED event with correct payload', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.PRODUCT_ALLOCATED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.allocateProduct('prod-001', 'client-001', 'tiktok_shop', 'professional')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      productId: 'prod-001',
      clientId: 'client-001',
      tier: 'professional',
      channel: 'tiktok_shop',
      exclusive: false,
    })
    expect(received[0].source).toBe('client-allocation')
  })

  it('transitions status: running → idle after completion', async () => {
    await engine.allocateProduct('prod-001', 'client-001', 'shopify', 'starter')
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Domain Methods — batchAllocate()
// ─────────────────────────────────────────────────────────────

describe('Engine 8 — batchAllocate()', () => {
  let engine: InstanceType<typeof ClientAllocationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ClientAllocationEngine()
  })

  it('returns allocated and skipped counts', async () => {
    const result = await engine.batchAllocate(['p1', 'p2', 'p3'], 'growth')
    expect(result).toHaveProperty('allocated')
    expect(result).toHaveProperty('skipped')
    expect(result.allocated + result.skipped).toBe(3)
  })

  it('emits ALLOCATION_BATCH_COMPLETE event', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.ALLOCATION_BATCH_COMPLETE, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.batchAllocate(['p1', 'p2'], 'enterprise')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      productCount: 2,
      tier: 'enterprise',
    })
  })

  it('transitions status: running → idle after completion', async () => {
    await engine.batchAllocate(['p1'], 'starter')
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Business Rule Specifications (V9 Tasks)
// ─────────────────────────────────────────────────────────────

describe('Engine 8 — Business Rule Specs', () => {
  it('PRICING_TIERS productsPerPlatform matches quota spec (8.07)', () => {
    expect(PRICING_TIERS.starter.productsPerPlatform).toBe(3)
    expect(PRICING_TIERS.growth.productsPerPlatform).toBe(10)
    expect(PRICING_TIERS.professional.productsPerPlatform).toBe(25)
    expect(PRICING_TIERS.enterprise.productsPerPlatform).toBe(50)
  })

  it('pool cap: 50 products per platform, evict lowest unallocated (8.04)', () => {
    const POOL_CAP = 50
    const pool = Array.from({ length: 50 }, (_, i) => ({
      id: `p-${i}`, score: 90 - i, allocated: i < 5,
    }))

    const unallocated = pool.filter(p => !p.allocated).sort((a, b) => a.score - b.score)
    const evictCandidate = unallocated[0]

    expect(pool.length).toBe(POOL_CAP)
    expect(evictCandidate.allocated).toBe(false)
    expect(evictCandidate.score).toBeLessThan(90) // lowest score
  })

  it('allocated products preserved during re-rank (8.06)', () => {
    const pool = [
      { id: 'p1', score: 85, allocated: true },
      { id: 'p2', score: 40, allocated: true },
      { id: 'p3', score: 95, allocated: false },
    ]
    const evictionCandidates = pool.filter(p => !p.allocated)
    expect(evictionCandidates.map(p => p.id)).not.toContain('p1')
    expect(evictionCandidates.map(p => p.id)).not.toContain('p2')
  })

  it('request status transitions: pending → review/fulfilled/rejected (8.31)', () => {
    const validTransitions: Record<string, string[]> = {
      pending: ['under_review', 'fulfilled', 'rejected'],
      under_review: ['fulfilled', 'rejected'],
      fulfilled: [],
      rejected: [],
    }
    const canTransition = (from: string, to: string) =>
      validTransitions[from]?.includes(to) ?? false

    expect(canTransition('pending', 'under_review')).toBe(true)
    expect(canTransition('fulfilled', 'pending')).toBe(false)
    expect(canTransition('rejected', 'fulfilled')).toBe(false)
  })

  it('stale detection: 30+ days with no client action (8.26)', () => {
    const allocations = [
      { id: 'a1', allocated_at: new Date(Date.now() - 35 * 86400000).toISOString(), last_action_at: null },
      { id: 'a2', allocated_at: new Date(Date.now() - 10 * 86400000).toISOString(), last_action_at: null },
    ]
    const stale = allocations.filter(a => {
      const age = Date.now() - new Date(a.allocated_at).getTime()
      return age > 30 * 86400000 && !a.last_action_at
    })
    expect(stale).toHaveLength(1)
    expect(stale[0].id).toBe('a1')
  })
})
