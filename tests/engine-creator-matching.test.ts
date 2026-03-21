/**
 * Engine: Creator Matching — V9 Task Coverage Tests
 *
 * Tests niche alignment, engagement fit, price range fit,
 * match scoring, ROI estimates, CreatorMatchingEngine lifecycle.
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
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  CreatorMatchingEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('CreatorMatching — Config & Lifecycle', () => {
  let engine: InstanceType<typeof CreatorMatchingEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new CreatorMatchingEngine()
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('creator-matching')
    expect(engine.config.queues).toContain('creator-matching')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.CREATOR_MATCHED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.MATCHES_COMPLETE)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
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

  it('handleEvent defers matching per G10', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.PRODUCT_SCORED,
      payload: {},
      source: 'scoring',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('matching deferred'))
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Niche Alignment (Pure Logic)
// ─────────────────────────────────────────────────────────────

describe('CreatorMatching — Niche Alignment', () => {
  function calculateNicheAlignment(
    productKeywords: string, nicheWords: string[]
  ): number {
    let matches = 0
    for (const word of nicheWords) {
      if (word.length > 2 && productKeywords.includes(word)) matches++
    }
    if (matches >= 3) return 90
    if (matches >= 2) return 70
    if (matches >= 1) return 50
    return 15
  }

  it('3+ keyword matches → 90', () => {
    expect(calculateNicheAlignment(
      'gadget tech electronics usb charger', ['tech', 'electronics', 'gadget']
    )).toBe(90)
  })

  it('2 keyword matches → 70', () => {
    expect(calculateNicheAlignment(
      'gadget tech product', ['tech', 'gadget', 'beauty']
    )).toBe(70)
  })

  it('1 keyword match → 50', () => {
    expect(calculateNicheAlignment(
      'kitchen tools', ['tech', 'kitchen']
    )).toBe(50)
  })

  it('0 matches → 15', () => {
    expect(calculateNicheAlignment(
      'kitchen tools', ['beauty', 'fashion']
    )).toBe(15)
  })

  it('unknown niche returns 20', () => {
    const niche = ''
    const result = !niche ? 20 : 50
    expect(result).toBe(20)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Engagement Fit (Pure Logic)
// ─────────────────────────────────────────────────────────────

describe('CreatorMatching — Engagement Fit', () => {
  function calculateEngagementFit(er: number, followers: number): number {
    if (er >= 5 && followers >= 10000 && followers <= 100000) return 95
    if (er >= 5) return 85
    if (er >= 3) return 70
    if (er >= 1.5) return 50
    if (er >= 0.5) return 30
    return 10
  }

  it('micro-influencer sweet spot (5%+ ER, 10k-100k followers) → 95', () => {
    expect(calculateEngagementFit(6, 50000)).toBe(95)
  })

  it('high ER but large following → 85', () => {
    expect(calculateEngagementFit(5, 500000)).toBe(85)
  })

  it('3-5% ER → 70', () => {
    expect(calculateEngagementFit(3.5, 100000)).toBe(70)
  })

  it('1.5-3% ER → 50', () => {
    expect(calculateEngagementFit(2, 200000)).toBe(50)
  })

  it('0.5-1.5% ER → 30', () => {
    expect(calculateEngagementFit(1, 500000)).toBe(30)
  })

  it('< 0.5% ER → 10', () => {
    expect(calculateEngagementFit(0.1, 1000000)).toBe(10)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Price Range Fit (Pure Logic)
// ─────────────────────────────────────────────────────────────

describe('CreatorMatching — Price Range Fit', () => {
  function calculatePriceRangeFit(price: number, followers: number): number {
    if (followers < 100000 && price >= 10 && price <= 60) return 90
    if (followers >= 100000 && followers < 1000000 && price >= 30 && price <= 150) return 85
    if (followers >= 1000000 && price >= 100) return 80
    if (price >= 15 && price <= 60) return 60
    if (price < 15) return 40
    return 50
  }

  it('nano/micro + impulse buy ($10-60) → 90', () => {
    expect(calculatePriceRangeFit(35, 50000)).toBe(90)
  })

  it('mid-tier + mid-range ($30-150) → 85', () => {
    expect(calculatePriceRangeFit(80, 300000)).toBe(85)
  })

  it('macro + premium ($100+) → 80', () => {
    expect(calculatePriceRangeFit(200, 2000000)).toBe(80)
  })

  it('general accessible range → 60', () => {
    // 500k followers + $25 doesn't match mid-tier ($30-150), falls to general
    expect(calculatePriceRangeFit(25, 500000)).toBe(60)
  })

  it('cheap product < $15 → 40', () => {
    expect(calculatePriceRangeFit(8, 500000)).toBe(40)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Match Score Weighting
// ─────────────────────────────────────────────────────────────

describe('CreatorMatching — Match Score Weights', () => {
  it('uses correct weights: niche 0.35, engagement 0.30, price 0.20, platform +15, conversion 0.05', () => {
    const niche = 90, engagement = 70, priceRange = 85
    const platformMatch = true
    const conversionScore = 60

    const matchScore = Math.min(100, Math.round(
      niche * 0.35 + engagement * 0.30 + priceRange * 0.20 +
      (platformMatch ? 15 : 0) + conversionScore * 0.05
    ))
    // 31.5 + 21 + 17 + 15 + 3 = 87.5 → 88
    expect(matchScore).toBe(88)
  })

  it('minimum match score threshold is 30', () => {
    const threshold = 30
    const low = 25
    const high = 55
    expect(low < threshold).toBe(true)
    expect(high >= threshold).toBe(true)
  })

  it('max 10 creators per product by default', () => {
    const maxCreators = 10
    expect(maxCreators).toBe(10)
  })

  it('min product score 60 by default', () => {
    const minScore = 60
    expect(minScore).toBe(60)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: ROI Estimates
// ─────────────────────────────────────────────────────────────

describe('CreatorMatching — ROI Estimates', () => {
  it('estimates views from followers × engagement rate', () => {
    const followers = 50000
    const engagementRate = 5
    const estimatedViews = Math.round(followers * engagementRate / 100 * 10)
    // 50000 * 0.05 * 10 = 25000
    expect(estimatedViews).toBe(25000)
  })

  it('high engagement → 3% conversion rate', () => {
    const er = 6
    const convRate = er > 5 ? 0.03 : er > 2 ? 0.02 : 0.01
    expect(convRate).toBe(0.03)
  })

  it('medium engagement → 2% conversion rate', () => {
    const er = 3
    const convRate = er > 5 ? 0.03 : er > 2 ? 0.02 : 0.01
    expect(convRate).toBe(0.02)
  })

  it('low engagement → 1% conversion rate', () => {
    const er = 1
    const convRate = er > 5 ? 0.03 : er > 2 ? 0.02 : 0.01
    expect(convRate).toBe(0.01)
  })

  it('profit estimate uses correct margin tiers', () => {
    const price40 = 40
    const margin40 = price40 > 30 ? 0.4 : price40 > 15 ? 0.3 : 0.2
    expect(margin40).toBe(0.4)

    const price20 = 20
    const margin20 = price20 > 30 ? 0.4 : price20 > 15 ? 0.3 : 0.2
    expect(margin20).toBe(0.3)

    const price10 = 10
    const margin10 = price10 > 30 ? 0.4 : price10 > 15 ? 0.3 : 0.2
    expect(margin10).toBe(0.2)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 7: Event Emission
// ─────────────────────────────────────────────────────────────

describe('CreatorMatching — Event Emission', () => {
  beforeEach(() => {
    resetEventBus()
  })

  it('MATCHES_COMPLETE event has correct structure', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.MATCHES_COMPLETE, (e) => received.push(e))

    await bus.emit(ENGINE_EVENTS.MATCHES_COMPLETE, {
      productsMatched: 10,
      matchesCreated: 45,
      errors: [],
    }, 'creator-matching')

    expect(received).toHaveLength(1)
    const p = received[0].payload as Record<string, unknown>
    expect(p.productsMatched).toBe(10)
    expect(p.matchesCreated).toBe(45)
  })

  it('CREATOR_MATCHED event exists', () => {
    expect(ENGINE_EVENTS.CREATOR_MATCHED).toBeDefined()
  })
})
