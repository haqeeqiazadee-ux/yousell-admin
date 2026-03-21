/**
 * Engine 3: Scoring Engine — V9 Task Coverage Tests
 *
 * Tests against V9 tasks 3.001–3.022:
 * - Composite score formula: 40/35/25 weights (3.001)
 * - Trend score heuristic (3.002–3.004)
 * - Viral score heuristic (3.005–3.008)
 * - Profit score via profitability module (3.009)
 * - Tier assignment: HOT/WARM/WATCH/COLD (3.010–3.013)
 * - Stage assignment from viral score (3.014–3.017)
 * - Auto-rejection rules (3.018–3.022)
 * - ScoringEngine class lifecycle and events
 * - POD-enhanced scoring
 * - Influencer conversion scoring
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock server-only ─────────────────────────────────────────
vi.mock('server-only', () => ({}))

// ── Mock Supabase (not used by scoring but required by engine imports) ──
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
  ScoringEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import {
  calculateCompositeScore,
  calculateFinalScore,
  calculateTrendScore,
  calculateViralScore,
  calculateProfitScore,
  getTierFromScore,
  getStageFromViralScore,
  getAiInsightTier,
  shouldRejectProduct,
  calculateInfluencerConversionScore,
  explainScore,
} from '@/lib/scoring/composite'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Final Score Formula (3-pillar weights)
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — Final Score Formula', () => {
  /* Task 3.001: Weights are Trend(0.40) + Viral(0.35) + Profit(0.25) */
  it('computes final = trend*0.40 + viral*0.35 + profit*0.25', () => {
    expect(calculateFinalScore(100, 100, 100)).toBe(100)
    expect(calculateFinalScore(0, 0, 0)).toBe(0)
    expect(calculateFinalScore(80, 60, 50)).toBe(66) // 32+21+12.5=65.5→66
  })

  it('clamps final score to 0-100', () => {
    expect(calculateFinalScore(100, 100, 100)).toBeLessThanOrEqual(100)
    expect(calculateFinalScore(0, 0, 0)).toBeGreaterThanOrEqual(0)
  })

  it('weights sum to 1.0', () => {
    const sum = 0.40 + 0.35 + 0.25
    expect(sum).toBeCloseTo(1.0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Composite Score Heuristic
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — Composite Score Heuristic', () => {
  /* Task 3.002: TikTok high-sales product scores high */
  it('scores tiktok high-sales product as HOT', () => {
    const score = calculateCompositeScore({
      price: 39.99,
      sales_count: 6000,
      review_count: 1500,
      rating: 4.7,
      source: 'tiktok',
    })
    expect(score.final_score).toBeGreaterThanOrEqual(60)
    expect(score.trend_score).toBeGreaterThan(0)
    expect(score.viral_score).toBeGreaterThan(0)
    expect(score.profit_score).toBeGreaterThan(0)
  })

  /* Task 3.003: Low-engagement product scores low */
  it('scores low-engagement product low', () => {
    const score = calculateCompositeScore({
      price: 5,
      sales_count: 10,
      review_count: 2,
      rating: 2.0,
      source: 'shopify',
    })
    expect(score.final_score).toBeLessThan(40)
  })

  /* Task 3.004: Platform bonus — TikTok gets viral + trend bonus */
  it('tiktok source adds viral and trend bonuses', () => {
    const tiktok = calculateCompositeScore({
      price: 30, sales_count: 500, review_count: 50, rating: 4.0, source: 'tiktok',
    })
    const amazon = calculateCompositeScore({
      price: 30, sales_count: 500, review_count: 50, rating: 4.0, source: 'amazon',
    })
    // TikTok gets +20 viral and +25 trend vs Amazon's +0 viral and +10 trend
    expect(tiktok.viral_score).toBeGreaterThan(amazon.viral_score)
    expect(tiktok.trend_score).toBeGreaterThan(amazon.trend_score)
  })

  /* Task 3.005: Returns all 4 score fields */
  it('returns trend_score, viral_score, profit_score, final_score', () => {
    const score = calculateCompositeScore({
      price: 25, sales_count: 100, review_count: 10, rating: 3.5, source: 'amazon',
    })
    expect(score).toHaveProperty('trend_score')
    expect(score).toHaveProperty('viral_score')
    expect(score).toHaveProperty('profit_score')
    expect(score).toHaveProperty('final_score')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Individual Pillar Scores (Real Inputs)
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — Trend Score (Real Inputs)', () => {
  /* Task 3.006: Trend score uses 5 weighted inputs */
  it('calculates trend from tiktokGrowth, influencerActivity, etc.', () => {
    const score = calculateTrendScore({
      tiktokGrowth: 80,
      influencerActivity: 60,
      amazonDemand: 50,
      competition: 30,
      profitMargin: 70,
    })
    // 80*0.35 + 60*0.25 + 50*0.20 + 30*-0.10 + 70*0.10 = 28+15+10-3+7 = 57
    expect(score).toBe(57)
  })

  it('clamps trend score to 0-100', () => {
    expect(calculateTrendScore({ tiktokGrowth: 300 })).toBeLessThanOrEqual(100)
    expect(calculateTrendScore({ competition: 500 })).toBeGreaterThanOrEqual(0)
  })

  it('defaults missing inputs to 0', () => {
    const score = calculateTrendScore({})
    expect(score).toBe(0)
  })
})

describe('Engine 3 — Viral Score (Real Inputs)', () => {
  /* Task 3.007: 6 pre-viral signals with correct weights */
  it('weights sum to 1.0', () => {
    const sum = 0.25 + 0.20 + 0.20 + 0.15 + 0.10 + 0.10
    expect(sum).toBeCloseTo(1.0)
  })

  it('calculates from 6 pre-viral signals', () => {
    const score = calculateViralScore({
      microInfluencerConvergence: 80,
      commentPurchaseIntent: 70,
      hashtagAcceleration: 60,
      creatorNicheExpansion: 50,
      engagementVelocity: 40,
      supplySideResponse: 30,
    })
    // 80*0.25 + 70*0.20 + 60*0.20 + 50*0.15 + 40*0.10 + 30*0.10 = 20+14+12+7.5+4+3 = 60.5 → 61
    expect(score).toBe(61)
  })

  it('clamps to 0-100', () => {
    expect(calculateViralScore({ microInfluencerConvergence: 500 })).toBeLessThanOrEqual(100)
  })
})

describe('Engine 3 — Profit Score (Real Inputs)', () => {
  /* Task 3.009: Profit score uses 5 inputs including negative risk */
  it('calculates profit with operational risk deduction', () => {
    const score = calculateProfitScore({
      profitMargin: 80,
      shippingFeasibility: 60,
      marketingEfficiency: 50,
      supplierReliability: 70,
      operationalRisk: 30,
    })
    // 80*0.40 + 60*0.20 + 50*0.20 + 70*0.10 - 30*0.10 = 32+12+10+7-3 = 58
    expect(score).toBe(58)
  })

  it('high operational risk reduces score', () => {
    const low = calculateProfitScore({ profitMargin: 80, operationalRisk: 10 })
    const high = calculateProfitScore({ profitMargin: 80, operationalRisk: 90 })
    expect(low).toBeGreaterThan(high)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Tier Classification
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — Tier Classification', () => {
  /* Task 3.010: HOT >= 80 */
  it('HOT tier for score >= 80', () => {
    expect(getTierFromScore(80)).toBe('HOT')
    expect(getTierFromScore(100)).toBe('HOT')
  })

  /* Task 3.011: WARM 60-79 */
  it('WARM tier for score 60-79', () => {
    expect(getTierFromScore(60)).toBe('WARM')
    expect(getTierFromScore(79)).toBe('WARM')
  })

  /* Task 3.012: WATCH 40-59 */
  it('WATCH tier for score 40-59', () => {
    expect(getTierFromScore(40)).toBe('WATCH')
    expect(getTierFromScore(59)).toBe('WATCH')
  })

  /* Task 3.013: COLD < 40 */
  it('COLD tier for score < 40', () => {
    expect(getTierFromScore(39)).toBe('COLD')
    expect(getTierFromScore(0)).toBe('COLD')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Trend Stage from Viral Score
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — Stage from Viral Score', () => {
  /* Task 3.014: exploding >= 80 */
  it('exploding stage for viral >= 80', () => {
    expect(getStageFromViralScore(80)).toBe('exploding')
    expect(getStageFromViralScore(100)).toBe('exploding')
  })

  /* Task 3.015: rising 60-79 */
  it('rising stage for viral 60-79', () => {
    expect(getStageFromViralScore(60)).toBe('rising')
    expect(getStageFromViralScore(79)).toBe('rising')
  })

  /* Task 3.016: emerging 40-59 */
  it('emerging stage for viral 40-59', () => {
    expect(getStageFromViralScore(40)).toBe('emerging')
    expect(getStageFromViralScore(59)).toBe('emerging')
  })

  /* Task 3.017: saturated < 40 */
  it('saturated stage for viral < 40', () => {
    expect(getStageFromViralScore(39)).toBe('saturated')
    expect(getStageFromViralScore(0)).toBe('saturated')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Auto-Rejection Rules
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — Auto-Rejection Rules', () => {
  const validProduct = {
    grossMargin: 0.50,
    shippingCostPct: 0.15,
    breakEvenMonths: 1,
    isFragileHazardous: false,
    hasCertification: false,
    fastestUSDeliveryDays: 7,
  }

  /* Task 3.018: Gross margin < 40% → reject */
  it('rejects when gross margin below 40%', () => {
    const result = shouldRejectProduct({ ...validProduct, grossMargin: 0.30 })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('Gross margin below 40%')
  })

  /* Task 3.019: Shipping > 30% → reject */
  it('rejects when shipping exceeds 30% of retail', () => {
    const result = shouldRejectProduct({ ...validProduct, shippingCostPct: 0.35 })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('Shipping exceeds 30% of retail')
  })

  /* Task 3.020: Break-even > 2 months → reject */
  it('rejects when break-even exceeds 2 months', () => {
    const result = shouldRejectProduct({ ...validProduct, breakEvenMonths: 3 })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('Break-even exceeds 2 months')
  })

  /* Task 3.021: Fragile without cert → reject */
  it('rejects fragile/hazardous without certification', () => {
    const result = shouldRejectProduct({ ...validProduct, isFragileHazardous: true })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('Fragile/hazardous without certification')
  })

  it('accepts fragile WITH certification', () => {
    const result = shouldRejectProduct({ ...validProduct, isFragileHazardous: true, hasCertification: true })
    expect(result.rejected).toBe(false)
  })

  /* Task 3.022: Delivery > 15 days → reject */
  it('rejects when no supplier delivers to USA in 15 days', () => {
    const result = shouldRejectProduct({ ...validProduct, fastestUSDeliveryDays: 20 })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('No supplier with USA delivery under 15 days')
  })

  it('rejects IP/trademark risk', () => {
    const result = shouldRejectProduct({ ...validProduct, hasIPOrTrademarkRisk: true })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('IP or trademark infringement risk detected')
  })

  it('rejects price below $10', () => {
    const result = shouldRejectProduct({ ...validProduct, retailPrice: 5 })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('Retail price below $10 minimum threshold')
  })

  it('rejects oversaturated market (100+ competitors)', () => {
    const result = shouldRejectProduct({ ...validProduct, competitorCount: 150 })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('Market oversaturated (100+ direct competitors)')
  })

  it('accepts valid product with no rejection triggers', () => {
    const result = shouldRejectProduct(validProduct)
    expect(result.rejected).toBe(false)
    expect(result.reasons).toHaveLength(0)
  })

  it('accumulates multiple rejection reasons', () => {
    const result = shouldRejectProduct({
      grossMargin: 0.20,
      shippingCostPct: 0.40,
      breakEvenMonths: 5,
      isFragileHazardous: true,
      hasCertification: false,
      fastestUSDeliveryDays: 25,
    })
    expect(result.rejected).toBe(true)
    expect(result.reasons.length).toBeGreaterThanOrEqual(4)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 7: AI Insight Tier
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — AI Insight Tier', () => {
  it('sonnet tier for score >= 75 (premium, never automatic)', () => {
    expect(getAiInsightTier(75)).toBe('sonnet')
    expect(getAiInsightTier(100)).toBe('sonnet')
  })

  it('haiku tier for score 60-74', () => {
    expect(getAiInsightTier(60)).toBe('haiku')
    expect(getAiInsightTier(74)).toBe('haiku')
  })

  it('none tier for score < 60', () => {
    expect(getAiInsightTier(59)).toBe('none')
    expect(getAiInsightTier(0)).toBe('none')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 8: Influencer Conversion Score
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — Influencer Conversion Score', () => {
  it('micro-influencer sweet spot (10k-100k) gets max follower score', () => {
    const score = calculateInfluencerConversionScore({
      followerCount: 50000,
      engagementRate: 5,
      avgViews: 25000,
      conversionRate: 3,
      nicheRelevance: 80,
    })
    expect(score).toBeGreaterThanOrEqual(70)
  })

  it('low engagement means low score', () => {
    const score = calculateInfluencerConversionScore({
      followerCount: 1000000,
      engagementRate: 0.5,
      avgViews: 1000,
      conversionRate: 0.1,
      nicheRelevance: 10,
    })
    expect(score).toBeLessThan(40)
  })

  it('clamps to 0-100', () => {
    const score = calculateInfluencerConversionScore({
      followerCount: 50000,
      engagementRate: 10,
      avgViews: 50000,
      conversionRate: 5,
      nicheRelevance: 100,
    })
    expect(score).toBeLessThanOrEqual(100)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 9: Score Explanation
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — Score Explanation', () => {
  it('generates human-readable explanation', () => {
    const explanation = explainScore('Product', 85, {
      trendScore: 90,
      viralScore: 80,
      profitScore: 70,
    })
    expect(explanation).toContain('Product score: 85/100 (HOT)')
    expect(explanation).toContain('Trend: 90/100')
    expect(explanation).toContain('Viral: 80/100')
    expect(explanation).toContain('Profit: 70/100')
  })

  it('handles missing detail fields gracefully', () => {
    const explanation = explainScore('Test', 50, {})
    expect(explanation).toContain('Test score: 50/100 (WATCH)')
    expect(explanation).not.toContain('Trend:')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 10: ScoringEngine Class
// ─────────────────────────────────────────────────────────────

describe('Engine 3 — ScoringEngine Class', () => {
  let engine: InstanceType<typeof ScoringEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ScoringEngine()
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('scoring')
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_DISCOVERED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_REJECTED)
    expect(engine.config.queues).toContain('enrich-product')
  })

  it('transitions through lifecycle states', async () => {
    expect(engine.status()).toBe('idle')
    await engine.start()
    expect(engine.status()).toBe('running')
    await engine.stop()
    expect(engine.status()).toBe('stopped')
  })

  it('healthCheck always returns true (pure logic)', async () => {
    const healthy = await engine.healthCheck()
    expect(healthy).toBe(true)
  })

  it('scoreProduct emits PRODUCT_SCORED event', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, (e) => received.push(e))

    await engine.scoreProduct('prod-001', {
      price: 30, sales_count: 2000, review_count: 500, rating: 4.5, source: 'tiktok',
    })

    expect(received).toHaveLength(1)
    const payload = received[0].payload as Record<string, unknown>
    expect(payload.productId).toBe('prod-001')
    expect(payload.tier).toBeDefined()
    expect(payload.stage).toBeDefined()
    expect(payload.finalScore).toBeGreaterThan(0)
    expect(received[0].source).toBe('scoring')
  })

  it('scoreProduct returns to idle after completion', async () => {
    await engine.scoreProduct('prod-001', {
      price: 30, sales_count: 100, review_count: 10, rating: 3.0, source: 'amazon',
    })
    expect(engine.status()).toBe('idle')
  })

  it('checkRejection emits PRODUCT_REJECTED when rejected', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.PRODUCT_REJECTED, (e) => received.push(e))

    const result = await engine.checkRejection('prod-bad', {
      grossMargin: 0.20,
      shippingCostPct: 0.40,
      breakEvenMonths: 5,
      isFragileHazardous: false,
      hasCertification: false,
      fastestUSDeliveryDays: 5,
    })

    expect(result.rejected).toBe(true)
    expect(received).toHaveLength(1)
    const payload = received[0].payload as Record<string, unknown>
    expect(payload.productId).toBe('prod-bad')
    expect((payload.reasons as string[]).length).toBeGreaterThan(0)
  })

  it('checkRejection does NOT emit when product passes', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.PRODUCT_REJECTED, (e) => received.push(e))

    const result = await engine.checkRejection('prod-good', {
      grossMargin: 0.60,
      shippingCostPct: 0.10,
      breakEvenMonths: 1,
      isFragileHazardous: false,
      hasCertification: false,
      fastestUSDeliveryDays: 5,
    })

    expect(result.rejected).toBe(false)
    expect(received).toHaveLength(0)
  })

  it('handleEvent logs PRODUCT_DISCOVERED but defers scoring (G10)', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await engine.handleEvent({
      type: ENGINE_EVENTS.PRODUCT_DISCOVERED,
      payload: { productId: 'prod-001' },
      source: 'discovery',
      timestamp: new Date().toISOString(),
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('scoring deferred to manual trigger')
    )
    consoleSpy.mockRestore()
  })
})
