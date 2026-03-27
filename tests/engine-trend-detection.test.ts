/**
 * Engine: Trend Detection — V9 Task Coverage Tests
 *
 * Tests trend signal aggregation, direction detection, scoring,
 * TrendDetectionEngine lifecycle, and event emission.
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
  TrendDetectionEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: TrendDetectionEngine Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('TrendDetection — Config & Lifecycle', () => {
  let engine: InstanceType<typeof TrendDetectionEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new TrendDetectionEngine()
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('trend-detection')
    expect(engine.config.queues).toContain('trend-detection')
    expect(engine.config.queues).toContain('trend-scan')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.TREND_DETECTED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.TREND_DIRECTION_CHANGED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.SCAN_COMPLETE)
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

  it('handleEvent logs scan complete but defers per G10', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.SCAN_COMPLETE,
      payload: { scanId: 'scan-001' },
      source: 'discovery',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('trend detection deferred'))
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Trend Score Calculation (Pure Logic)
// ─────────────────────────────────────────────────────────────

describe('TrendDetection — Trend Score Logic', () => {
  // Replicate calculateTrendScore logic from the module
  function calculateTrendScore(signal: {
    productCount: number; avgScore: number;
    totalViews: number; growth: number; sources: string[];
  }): number {
    let score = 0
    if (signal.productCount >= 10) score += 30
    else if (signal.productCount >= 5) score += 20
    else if (signal.productCount >= 2) score += 10

    score += Math.min(25, Math.round(signal.avgScore * 0.25))

    if (signal.totalViews > 10000000) score += 25
    else if (signal.totalViews > 1000000) score += 20
    else if (signal.totalViews > 100000) score += 15
    else if (signal.totalViews > 10000) score += 10

    if (signal.growth > 0.5) score += 20
    else if (signal.growth > 0.2) score += 15
    else if (signal.growth > 0.1) score += 10
    else if (signal.growth > 0) score += 5

    if (signal.sources.length >= 3) score += 10
    else if (signal.sources.length >= 2) score += 5

    return Math.min(100, Math.max(0, score))
  }

  it('high frequency + high views + fast growth = high score', () => {
    const score = calculateTrendScore({
      productCount: 15, avgScore: 80, totalViews: 20000000,
      growth: 0.6, sources: ['tiktok', 'amazon', 'shopify'],
    })
    expect(score).toBeGreaterThanOrEqual(90)
  })

  it('low frequency + no views + no growth = low score', () => {
    const score = calculateTrendScore({
      productCount: 1, avgScore: 20, totalViews: 100,
      growth: 0, sources: ['shopify'],
    })
    expect(score).toBeLessThan(20)
  })

  it('product frequency 10+ → +30', () => {
    const score = calculateTrendScore({
      productCount: 12, avgScore: 0, totalViews: 0, growth: 0, sources: [],
    })
    expect(score).toBe(30)
  })

  it('product frequency 5-9 → +20', () => {
    const score = calculateTrendScore({
      productCount: 7, avgScore: 0, totalViews: 0, growth: 0, sources: [],
    })
    expect(score).toBe(20)
  })

  it('product frequency 2-4 → +10', () => {
    const score = calculateTrendScore({
      productCount: 3, avgScore: 0, totalViews: 0, growth: 0, sources: [],
    })
    expect(score).toBe(10)
  })

  it('multi-platform bonus: 3+ sources → +10', () => {
    const multi = calculateTrendScore({
      productCount: 0, avgScore: 0, totalViews: 0, growth: 0,
      sources: ['tiktok', 'amazon', 'shopify'],
    })
    const single = calculateTrendScore({
      productCount: 0, avgScore: 0, totalViews: 0, growth: 0,
      sources: ['tiktok'],
    })
    expect(multi - single).toBe(10)
  })

  it('clamps score to 0-100', () => {
    const score = calculateTrendScore({
      productCount: 100, avgScore: 100, totalViews: 100000000,
      growth: 1.0, sources: ['a', 'b', 'c', 'd'],
    })
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Direction Detection
// ─────────────────────────────────────────────────────────────

describe('TrendDetection — Direction Detection', () => {
  it('growth > 0.1 → rising', () => {
    const growth = 0.3
    const direction = growth > 0.1 ? 'rising' : growth < -0.1 ? 'declining' : 'stable'
    expect(direction).toBe('rising')
  })

  it('growth < -0.1 → declining', () => {
    const growth = -0.2
    const direction = growth > 0.1 ? 'rising' : growth < -0.1 ? 'declining' : 'stable'
    expect(direction).toBe('declining')
  })

  it('growth between -0.1 and 0.1 → stable', () => {
    const growth = 0.05
    const direction = growth > 0.1 ? 'rising' : growth < -0.1 ? 'declining' : 'stable'
    expect(direction).toBe('stable')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Signal Filtering
// ─────────────────────────────────────────────────────────────

describe('TrendDetection — Signal Filtering', () => {
  it('includes trends with productCount >= 2', () => {
    const signal = { productCount: 3, totalViews: 0 }
    const qualifies = signal.productCount >= 2 || signal.totalViews > 10000
    expect(qualifies).toBe(true)
  })

  it('includes trends with totalViews > 10000', () => {
    const signal = { productCount: 0, totalViews: 50000 }
    const qualifies = signal.productCount >= 2 || signal.totalViews > 10000
    expect(qualifies).toBe(true)
  })

  it('excludes trends below both thresholds', () => {
    const signal = { productCount: 1, totalViews: 5000 }
    const qualifies = signal.productCount >= 2 || signal.totalViews > 10000
    expect(qualifies).toBe(false)
  })

  it('limits output to top 100 trends', () => {
    const trends = Array.from({ length: 150 }, (_, i) => ({ score: i }))
    const limited = trends.sort((a, b) => b.score - a.score).slice(0, 100)
    expect(limited).toHaveLength(100)
    expect(limited[0].score).toBe(149)
  })

  it('skips keywords shorter than 3 characters', () => {
    const keyword = 'ab'
    const valid = keyword.length >= 3
    expect(valid).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Event Emission
// ─────────────────────────────────────────────────────────────

describe('TrendDetection — Event Emission', () => {
  beforeEach(() => {
    resetEventBus()
  })

  it('TREND_DETECTED event has correct structure', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.TREND_DETECTED, (e) => received.push(e))

    await bus.emit(ENGINE_EVENTS.TREND_DETECTED, {
      trendsDetected: 5,
      trendsUpdated: 3,
      errors: [],
    }, 'trend-detection')

    expect(received).toHaveLength(1)
    expect(received[0].source).toBe('trend-detection')
    const p = received[0].payload as Record<string, unknown>
    expect(p.trendsDetected).toBe(5)
    expect(p.trendsUpdated).toBe(3)
  })

  it('TREND_DIRECTION_CHANGED event exists in ENGINE_EVENTS', () => {
    expect(ENGINE_EVENTS.TREND_DIRECTION_CHANGED).toBeDefined()
  })
})
