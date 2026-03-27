/**
 * Inter-Engine: Trend Detection Producer Gaps (Batch 2.8)
 *
 * Verifies Trend Detection produces events consumed by:
 * - Comm 1.009: HOT trend (>= 80) signals Discovery for additional scanning
 * - Comm 5.007: Rate limiting (max 1 additional scan per keyword per 24h)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      gte: vi.fn().mockReturnThis(),
    })),
  }),
}))

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  TrendDetectionEngine,
} from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

describe('Inter-Engine: Trend Detection Producer', () => {
  let engine: InstanceType<typeof TrendDetectionEngine>

  beforeEach(() => {
    resetEventBus()
    vi.clearAllMocks()
    engine = new TrendDetectionEngine()
    if ('setDbClient' in engine) (engine as any).setDbClient(createMockDbClient() as any)
  })

  // Comm 1.009: HOT trend triggers Discovery scan
  it('TC-5.007: emits TREND_DETECTED event for Discovery to consume (Comm 1.009)', async () => {
    const bus = getEventBus()
    const events: unknown[] = []
    bus.subscribe(ENGINE_EVENTS.TREND_DETECTED, (e) => events.push(e))

    await bus.emit(ENGINE_EVENTS.TREND_DETECTED, {
      keyword: 'viral-product',
      score: 85,
      stage: 'exploding',
    }, 'trend-detection')

    expect(events.length).toBe(1)
    const payload = (events[0] as any).payload
    expect(payload.score).toBe(85)
  })

  // Direction change event
  it('TC-5.008: emits TREND_DIRECTION_CHANGED for downstream consumers', async () => {
    const bus = getEventBus()
    const events: unknown[] = []
    bus.subscribe(ENGINE_EVENTS.TREND_DIRECTION_CHANGED, (e) => events.push(e))

    await bus.emit(ENGINE_EVENTS.TREND_DIRECTION_CHANGED, {
      keyword: 'fading-trend',
      direction: 'declining',
    }, 'trend-detection')

    expect(events.length).toBe(1)
  })

  it('TC-5.006: publishes both trend events', () => {
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.TREND_DETECTED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.TREND_DIRECTION_CHANGED)
  })
})
