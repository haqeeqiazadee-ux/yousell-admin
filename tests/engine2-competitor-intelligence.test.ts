/**
 * Engine 2: Competitor Store Intelligence — V9 Tests
 *
 * Tests the REAL CompetitorIntelligenceEngine class:
 * - Config, lifecycle, healthCheck
 * - Event handling (PRODUCT_DISCOVERED, PRODUCT_SCORED)
 * - Domain methods: scanCompetitors(), detectAdActivity()
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
  CompetitorIntelligenceEngine,
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 2 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof CompetitorIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new CompetitorIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('has correct name, queues, publishes, subscribes', () => {
    expect(engine.config.name).toBe('competitor-intelligence')
    expect(engine.config.queues).toContain('competitor-scan')
    expect(engine.config.queues).toContain('competitor-refresh')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.COMPETITOR_DETECTED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.COMPETITOR_UPDATED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.COMPETITOR_BATCH_COMPLETE)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_DISCOVERED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
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

describe('Engine 2 — Event Handling', () => {
  let engine: InstanceType<typeof CompetitorIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new CompetitorIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('handles PRODUCT_DISCOVERED event (deferred per G10)', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.PRODUCT_DISCOVERED,
      payload: { productId: 'prod-001', title: 'Widget' },
      source: 'discovery',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('Product discovered')
    )
    spy.mockRestore()
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
      expect.stringContaining('competitor deep-scan eligible')
    )
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Domain Methods — scanCompetitors()
// ─────────────────────────────────────────────────────────────

describe('Engine 2 — scanCompetitors()', () => {
  let engine: InstanceType<typeof CompetitorIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new CompetitorIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('returns competitorsFound count', async () => {
    const result = await engine.scanCompetitors('prod-001', 'smart watch', ['shopify', 'amazon'])
    expect(result).toHaveProperty('competitorsFound')
    expect(typeof result.competitorsFound).toBe('number')
  })

  it('emits COMPETITOR_BATCH_COMPLETE event', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.COMPETITOR_BATCH_COMPLETE, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.scanCompetitors('prod-001', 'smart watch', ['shopify', 'amazon'])

    expect(received).toHaveLength(1)
    expect(received[0].payload).toEqual({
      productId: 'prod-001',
      keyword: 'smart watch',
      platforms: ['shopify', 'amazon'],
      competitorsFound: 0,
    })
    expect(received[0].source).toBe('competitor-intelligence')
  })

  it('transitions status: running → idle', async () => {
    // Status returns to idle after completion
    await engine.scanCompetitors('prod-001', 'keyword', ['shopify'])
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Domain Methods — detectAdActivity()
// ─────────────────────────────────────────────────────────────

describe('Engine 2 — detectAdActivity()', () => {
  let engine: InstanceType<typeof CompetitorIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new CompetitorIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('returns hasAds and adSpendEstimate', async () => {
    const result = await engine.detectAdActivity('prod-001', 'https://cool-store.myshopify.com')
    expect(result).toHaveProperty('hasAds')
    expect(result).toHaveProperty('adSpendEstimate')
    expect(typeof result.hasAds).toBe('boolean')
    expect(typeof result.adSpendEstimate).toBe('number')
  })

  it('emits COMPETITOR_UPDATED event with payload', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.COMPETITOR_UPDATED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.detectAdActivity('prod-001', 'https://cool-store.myshopify.com')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      productId: 'prod-001',
      competitorStore: 'https://cool-store.myshopify.com',
    })
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Business Rule Specifications (V9 Tasks)
// These test business logic that will be implemented in production.
// Kept as executable specifications for when engines get real implementations.
// ─────────────────────────────────────────────────────────────

describe('Engine 2 — Business Rule Specs', () => {
  it('store success score formula: revenue*0.30 + ad*0.25 + traffic*0.20 + influencer*0.15 + platform*0.10', () => {
    // This spec defines the scoring formula per V9 task 2.035
    const calculateStoreScore = (inputs: {
      revenue: number
      adConfidence: number
      trafficDiversity: number
      influencerCount: number
      platformCount: number
    }) => {
      return Math.round(
        inputs.revenue * 0.30 +
        inputs.adConfidence * 0.25 +
        inputs.trafficDiversity * 0.20 +
        inputs.influencerCount * 0.15 +
        inputs.platformCount * 0.10
      )
    }

    expect(calculateStoreScore({
      revenue: 80, adConfidence: 100, trafficDiversity: 60,
      influencerCount: 40, platformCount: 80,
    })).toBe(75) // 24+25+12+6+8

    expect(calculateStoreScore({
      revenue: 0, adConfidence: 0, trafficDiversity: 0,
      influencerCount: 0, platformCount: 0,
    })).toBe(0)
  })

  it('ad confidence classification: >=30d HIGH, >=14d MEDIUM, <14d LOW (2.027)', () => {
    const classify = (durationDays: number) =>
      durationDays >= 30 ? 'HIGH' : durationDays >= 14 ? 'MEDIUM' : 'LOW'

    expect(classify(45)).toBe('HIGH')
    expect(classify(30)).toBe('HIGH')
    expect(classify(14)).toBe('MEDIUM')
    expect(classify(7)).toBe('LOW')
  })

  it('entry strategy recommendation logic (2.036)', () => {
    const recommend = (data: {
      avgCompPrice: number
      productPrice: number
      influencerSaturation: string
      hasGaps: boolean
    }) => {
      if (data.hasGaps) return 'niche_positioning'
      if (data.productPrice < data.avgCompPrice * 0.8) return 'price_undercut'
      if (data.influencerSaturation === 'low') return 'influencer_differentiation'
      return 'bundle_strategy'
    }

    expect(recommend({ avgCompPrice: 40, productPrice: 25, influencerSaturation: 'high', hasGaps: false }))
      .toBe('price_undercut')
    expect(recommend({ avgCompPrice: 40, productPrice: 35, influencerSaturation: 'low', hasGaps: false }))
      .toBe('influencer_differentiation')
    expect(recommend({ avgCompPrice: 40, productPrice: 35, influencerSaturation: 'high', hasGaps: true }))
      .toBe('niche_positioning')
  })
})
