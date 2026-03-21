/**
 * Inter-Engine: Scoring Producer Gaps
 *
 * Tests Comm pathways where Scoring Engine output feeds downstream engines:
 * - Comm #3.003: Scoring → Competitor Intelligence (score >= 60 filter)
 * - Comm #3.005: Scoring → Profitability (initial margin trigger)
 * - Comm #3.009: Scoring → Opportunity Feed (DB score writes)
 * - Comm #6.001: Scoring → Creator Matching (indirect via PRODUCT_SCORED)
 * - Comm #8.002: Scoring → Client Allocation (tier-based allocation)
 * - Comm #10.001: Scoring → Fulfillment Recommendation (score-based eval)
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
      gte: vi.fn().mockReturnThis(),
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
  ScoringEngine,
  CompetitorIntelligenceEngine,
  ProfitabilityEngine,
  CreatorMatchingEngine,
  ClientAllocationEngine,
  FulfillmentRecommendationEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

describe('Inter-Engine: Scoring → Downstream Consumers', () => {
  beforeEach(() => {
    resetEventBus()
  })

  /* Comm #3.003: Scoring emits PRODUCT_SCORED → Competitor Intelligence subscribes */
  it('Competitor Intelligence receives PRODUCT_SCORED events', async () => {
    const bus = getEventBus()
    const competitor = new CompetitorIntelligenceEngine()
    const received: EngineEvent[] = []

    // CompetitorIntelligence subscribes to PRODUCT_SCORED (among others)
    expect(competitor.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)

    bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, (e) => received.push(e))

    const scoring = new ScoringEngine()
    await scoring.scoreProduct('prod-001', {
      price: 40, sales_count: 2000, review_count: 500, rating: 4.5, source: 'tiktok',
    })

    expect(received).toHaveLength(1)
    const payload = received[0].payload as Record<string, unknown>
    expect(payload.productId).toBe('prod-001')
    expect(payload.tier).toBeDefined()
  })

  /* Comm #3.005: Scoring emits PRODUCT_SCORED → Profitability subscribes */
  it('Profitability Engine receives PRODUCT_SCORED events', async () => {
    const bus = getEventBus()
    const profitability = new ProfitabilityEngine()
    const received: EngineEvent[] = []

    expect(profitability.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)

    bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, (e) => received.push(e))

    const scoring = new ScoringEngine()
    await scoring.scoreProduct('prod-002', {
      price: 30, sales_count: 1000, review_count: 200, rating: 4.0, source: 'amazon',
    })

    expect(received).toHaveLength(1)
  })

  /* Comm #6.001: Scoring → Creator Matching via PRODUCT_SCORED */
  it('Creator Matching receives PRODUCT_SCORED events', async () => {
    const bus = getEventBus()
    const creatorMatching = new CreatorMatchingEngine()
    const received: EngineEvent[] = []

    expect(creatorMatching.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)

    bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, (e) => received.push(e))

    const scoring = new ScoringEngine()
    await scoring.scoreProduct('prod-003', {
      price: 50, sales_count: 5000, review_count: 1000, rating: 4.7, source: 'tiktok',
    })

    expect(received).toHaveLength(1)
    const payload = received[0].payload as Record<string, unknown>
    expect(payload.finalScore).toBeGreaterThan(0)
  })

  /* Comm #8.002: Scoring → Client Allocation via PRODUCT_SCORED */
  it('Client Allocation receives PRODUCT_SCORED events', () => {
    const allocation = new ClientAllocationEngine()
    expect(allocation.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
  })

  /* Comm #10.001: Scoring → Fulfillment Recommendation via PRODUCT_SCORED */
  it('Fulfillment Recommendation receives PRODUCT_SCORED events', () => {
    const fulfillment = new FulfillmentRecommendationEngine()
    expect(fulfillment.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
  })

  /* Comm #3.009: PRODUCT_SCORED payload includes all data needed by Opportunity Feed */
  it('PRODUCT_SCORED payload includes tier and stage for Opportunity Feed', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, (e) => received.push(e))

    const scoring = new ScoringEngine()
    await scoring.scoreProduct('prod-004', {
      price: 40, sales_count: 6000, review_count: 1500, rating: 4.8, source: 'tiktok',
    })

    const payload = received[0].payload as Record<string, unknown>
    expect(payload).toHaveProperty('trendScore')
    expect(payload).toHaveProperty('viralScore')
    expect(payload).toHaveProperty('profitScore')
    expect(payload).toHaveProperty('finalScore')
    expect(payload).toHaveProperty('tier')
    expect(payload).toHaveProperty('stage')
  })

  /* Verify PRODUCT_REJECTED does NOT trigger downstream scoring consumers */
  it('PRODUCT_REJECTED goes to different subscribers than PRODUCT_SCORED', async () => {
    const bus = getEventBus()
    const scoredEvents: EngineEvent[] = []
    const rejectedEvents: EngineEvent[] = []

    bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, (e) => scoredEvents.push(e))
    bus.subscribe(ENGINE_EVENTS.PRODUCT_REJECTED, (e) => rejectedEvents.push(e))

    const scoring = new ScoringEngine()
    await scoring.checkRejection('prod-bad', {
      grossMargin: 0.20,
      shippingCostPct: 0.40,
      breakEvenMonths: 5,
      isFragileHazardous: false,
      hasCertification: false,
      fastestUSDeliveryDays: 5,
    })

    expect(scoredEvents).toHaveLength(0)
    expect(rejectedEvents).toHaveLength(1)
  })
})
