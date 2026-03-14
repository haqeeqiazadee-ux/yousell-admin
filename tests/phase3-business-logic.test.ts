/**
 * Phase 3: Edge Case Business Logic Tests
 *
 * Validates:
 * - Scoring engine with boundary values (0, 100, NaN, negatives, etc.)
 * - Tier classification boundaries
 * - Auto-rejection rules with edge cases
 * - Profitability calculator with extreme inputs
 * - Influencer scoring edge cases
 * - Subscription tier limit enforcement logic
 */

import { describe, it, expect } from 'vitest'
import {
  calculateCompositeScore,
  calculateTrendScore,
  calculateViralScore,
  calculateProfitScore,
  calculateFinalScore,
  getTierFromScore,
  getStageFromViralScore,
  getAiInsightTier,
  shouldRejectProduct,
  calculateInfluencerConversionScore,
  explainScore,
} from '@/lib/scoring/composite'
import { calculateProfitability } from '@/lib/scoring/profitability'
import { PRICING_TIERS } from '@/lib/stripe'

// ─── Final Score Formula ──────────────────────────────────────────

describe('Phase 3A: Final Score Formula', () => {
  it('weights sum to 1.0 (trend=0.40, viral=0.35, profit=0.25)', () => {
    // All inputs 100 → output should be 100
    expect(calculateFinalScore(100, 100, 100)).toBe(100)
  })

  it('all zeros → 0', () => {
    expect(calculateFinalScore(0, 0, 0)).toBe(0)
  })

  it('trend-only (100, 0, 0) → 40', () => {
    expect(calculateFinalScore(100, 0, 0)).toBe(40)
  })

  it('viral-only (0, 100, 0) → 35', () => {
    expect(calculateFinalScore(0, 100, 0)).toBe(35)
  })

  it('profit-only (0, 0, 100) → 25', () => {
    expect(calculateFinalScore(0, 0, 100)).toBe(25)
  })

  it('boundary: HOT threshold → 80 exactly', () => {
    // 100*0.40 + 100*0.35 + 20*0.25 = 40+35+5 = 80
    expect(calculateFinalScore(100, 100, 20)).toBe(80)
  })

  it('clamped at 100 even with inputs > 100', () => {
    expect(calculateFinalScore(200, 200, 200)).toBe(100)
  })

  it('clamped at 0 even with negative inputs', () => {
    expect(calculateFinalScore(-50, -50, -50)).toBe(0)
  })

  it('rounds properly', () => {
    // 33*0.40 + 33*0.35 + 33*0.25 = 13.2+11.55+8.25 = 33.0
    expect(calculateFinalScore(33, 33, 33)).toBe(33)
  })
})

// ─── Tier Classification ──────────────────────────────────────────

describe('Phase 3B: Tier Classification Boundaries', () => {
  it('80 → HOT', () => expect(getTierFromScore(80)).toBe('HOT'))
  it('79 → WARM', () => expect(getTierFromScore(79)).toBe('WARM'))
  it('60 → WARM', () => expect(getTierFromScore(60)).toBe('WARM'))
  it('59 → WATCH', () => expect(getTierFromScore(59)).toBe('WATCH'))
  it('40 → WATCH', () => expect(getTierFromScore(40)).toBe('WATCH'))
  it('39 → COLD', () => expect(getTierFromScore(39)).toBe('COLD'))
  it('0 → COLD', () => expect(getTierFromScore(0)).toBe('COLD'))
  it('100 → HOT', () => expect(getTierFromScore(100)).toBe('HOT'))
  it('-1 → COLD', () => expect(getTierFromScore(-1)).toBe('COLD'))
})

describe('Phase 3B2: Trend Stage from Viral Score', () => {
  it('80 → exploding', () => expect(getStageFromViralScore(80)).toBe('exploding'))
  it('79 → rising', () => expect(getStageFromViralScore(79)).toBe('rising'))
  it('60 → rising', () => expect(getStageFromViralScore(60)).toBe('rising'))
  it('59 → emerging', () => expect(getStageFromViralScore(59)).toBe('emerging'))
  it('40 → emerging', () => expect(getStageFromViralScore(40)).toBe('emerging'))
  it('39 → saturated', () => expect(getStageFromViralScore(39)).toBe('saturated'))
  it('0 → saturated', () => expect(getStageFromViralScore(0)).toBe('saturated'))
})

describe('Phase 3B3: AI Insight Tier', () => {
  it('75 → sonnet', () => expect(getAiInsightTier(75)).toBe('sonnet'))
  it('74 → haiku', () => expect(getAiInsightTier(74)).toBe('haiku'))
  it('60 → haiku', () => expect(getAiInsightTier(60)).toBe('haiku'))
  it('59 → none', () => expect(getAiInsightTier(59)).toBe('none'))
  it('0 → none', () => expect(getAiInsightTier(0)).toBe('none'))
})

// ─── Trend Score Calculator ───────────────────────────────────────

describe('Phase 3C: Trend Score', () => {
  it('all zeros → 0', () => {
    expect(calculateTrendScore({})).toBe(0)
  })

  it('all 100 → capped at 100', () => {
    expect(calculateTrendScore({
      tiktokGrowth: 100,
      influencerActivity: 100,
      amazonDemand: 100,
      competition: 0,
      profitMargin: 100,
    })).toBeLessThanOrEqual(100)
  })

  it('high competition reduces score', () => {
    const base = calculateTrendScore({ tiktokGrowth: 50 })
    const withCompetition = calculateTrendScore({ tiktokGrowth: 50, competition: 100 })
    expect(withCompetition).toBeLessThan(base)
  })

  it('handles undefined/missing inputs gracefully', () => {
    expect(() => calculateTrendScore({})).not.toThrow()
    expect(calculateTrendScore({})).toBe(0)
  })

  it('negative values get clamped to 0', () => {
    const score = calculateTrendScore({ tiktokGrowth: -100 })
    expect(score).toBeGreaterThanOrEqual(0)
  })
})

// ─── Viral Score Calculator ───────────────────────────────────────

describe('Phase 3D: Viral Score', () => {
  it('all zeros → 0', () => {
    expect(calculateViralScore({})).toBe(0)
  })

  it('weights sum to 1.0', () => {
    // All 100 → 0.25*100 + 0.20*100 + 0.20*100 + 0.15*100 + 0.10*100 + 0.10*100 = 100
    expect(calculateViralScore({
      microInfluencerConvergence: 100,
      commentPurchaseIntent: 100,
      hashtagAcceleration: 100,
      creatorNicheExpansion: 100,
      engagementVelocity: 100,
      supplySideResponse: 100,
    })).toBe(100)
  })

  it('single signal maxed, rest zero', () => {
    expect(calculateViralScore({ microInfluencerConvergence: 100 })).toBe(25)
    expect(calculateViralScore({ commentPurchaseIntent: 100 })).toBe(20)
  })

  it('handles extreme values without crashing', () => {
    expect(calculateViralScore({
      microInfluencerConvergence: 999,
      commentPurchaseIntent: -50,
    })).toBeGreaterThanOrEqual(0)
    expect(calculateViralScore({
      microInfluencerConvergence: 999,
    })).toBeLessThanOrEqual(100)
  })
})

// ─── Profit Score Calculator ──────────────────────────────────────

describe('Phase 3E: Profit Score', () => {
  it('all zeros → 0', () => {
    expect(calculateProfitScore({})).toBe(0)
  })

  it('high operational risk reduces score', () => {
    const noRisk = calculateProfitScore({ profitMargin: 80 })
    const highRisk = calculateProfitScore({ profitMargin: 80, operationalRisk: 100 })
    expect(highRisk).toBeLessThan(noRisk)
  })

  it('clamped between 0 and 100', () => {
    expect(calculateProfitScore({ profitMargin: 999 })).toBeLessThanOrEqual(100)
    expect(calculateProfitScore({ operationalRisk: 999 })).toBeGreaterThanOrEqual(0)
  })
})

// ─── Auto-Rejection Rules ─────────────────────────────────────────

describe('Phase 3F: Auto-Rejection Rules', () => {
  const goodProduct = {
    grossMargin: 0.50,
    shippingCostPct: 0.15,
    breakEvenMonths: 1,
    isFragileHazardous: false,
    hasCertification: false,
    fastestUSDeliveryDays: 7,
  }

  it('good product passes', () => {
    const result = shouldRejectProduct(goodProduct)
    expect(result.rejected).toBe(false)
    expect(result.reasons).toHaveLength(0)
  })

  it('rejects margin below 40%', () => {
    const result = shouldRejectProduct({ ...goodProduct, grossMargin: 0.39 })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('Gross margin below 40%')
  })

  it('margin exactly 40% passes', () => {
    const result = shouldRejectProduct({ ...goodProduct, grossMargin: 0.40 })
    expect(result.rejected).toBe(false)
  })

  it('rejects shipping > 30%', () => {
    const result = shouldRejectProduct({ ...goodProduct, shippingCostPct: 0.31 })
    expect(result.rejected).toBe(true)
    expect(result.reasons).toContain('Shipping exceeds 30% of retail')
  })

  it('rejects break-even > 2 months', () => {
    const result = shouldRejectProduct({ ...goodProduct, breakEvenMonths: 2.1 })
    expect(result.rejected).toBe(true)
  })

  it('break-even exactly 2 months passes', () => {
    const result = shouldRejectProduct({ ...goodProduct, breakEvenMonths: 2 })
    expect(result.rejected).toBe(false)
  })

  it('rejects fragile without certification', () => {
    const result = shouldRejectProduct({
      ...goodProduct,
      isFragileHazardous: true,
      hasCertification: false,
    })
    expect(result.rejected).toBe(true)
  })

  it('fragile WITH certification passes', () => {
    const result = shouldRejectProduct({
      ...goodProduct,
      isFragileHazardous: true,
      hasCertification: true,
    })
    expect(result.rejected).toBe(false)
  })

  it('rejects delivery > 15 days', () => {
    const result = shouldRejectProduct({ ...goodProduct, fastestUSDeliveryDays: 16 })
    expect(result.rejected).toBe(true)
  })

  it('delivery exactly 15 days passes', () => {
    const result = shouldRejectProduct({ ...goodProduct, fastestUSDeliveryDays: 15 })
    expect(result.rejected).toBe(false)
  })

  it('rejects IP risk', () => {
    const result = shouldRejectProduct({ ...goodProduct, hasIPOrTrademarkRisk: true })
    expect(result.rejected).toBe(true)
  })

  it('rejects price below $10', () => {
    const result = shouldRejectProduct({ ...goodProduct, retailPrice: 9.99 })
    expect(result.rejected).toBe(true)
  })

  it('price exactly $10 passes', () => {
    const result = shouldRejectProduct({ ...goodProduct, retailPrice: 10 })
    expect(result.rejected).toBe(false)
  })

  it('rejects 100+ competitors', () => {
    const result = shouldRejectProduct({ ...goodProduct, competitorCount: 101 })
    expect(result.rejected).toBe(true)
  })

  it('100 competitors exactly passes', () => {
    const result = shouldRejectProduct({ ...goodProduct, competitorCount: 100 })
    expect(result.rejected).toBe(false)
  })

  it('multiple rejection reasons accumulate', () => {
    const result = shouldRejectProduct({
      grossMargin: 0.20,
      shippingCostPct: 0.50,
      breakEvenMonths: 6,
      isFragileHazardous: true,
      hasCertification: false,
      fastestUSDeliveryDays: 30,
      hasIPOrTrademarkRisk: true,
      retailPrice: 5,
      competitorCount: 200,
    })
    expect(result.rejected).toBe(true)
    expect(result.reasons.length).toBe(8) // all 8 criteria triggered
  })
})

// ─── Composite Score (Heuristic) ──────────────────────────────────

describe('Phase 3G: Composite Score (Heuristic)', () => {
  it('zero product → low score', () => {
    const result = calculateCompositeScore({
      price: 0, sales_count: 0, review_count: 0, rating: 0, source: 'unknown',
    })
    expect(result.overall_score).toBeLessThanOrEqual(10)
  })

  it('perfect TikTok product → high score', () => {
    const result = calculateCompositeScore({
      price: 30, sales_count: 10000, review_count: 2000, rating: 4.8, source: 'tiktok',
    })
    expect(result.overall_score).toBeGreaterThanOrEqual(70)
    expect(result.viral_score).toBeGreaterThanOrEqual(80)
  })

  it('negative price does not crash', () => {
    expect(() => calculateCompositeScore({
      price: -10, sales_count: 100, review_count: 50, rating: 4.0, source: 'amazon',
    })).not.toThrow()
  })

  it('NaN-like values do not crash', () => {
    expect(() => calculateCompositeScore({
      price: NaN, sales_count: NaN, review_count: NaN, rating: NaN, source: '',
    })).not.toThrow()
  })

  it('very high values are capped at 100', () => {
    const result = calculateCompositeScore({
      price: 50, sales_count: 999999, review_count: 999999, rating: 5.0, source: 'tiktok',
    })
    expect(result.viral_score).toBeLessThanOrEqual(100)
    expect(result.overall_score).toBeLessThanOrEqual(100)
    expect(result.profitability_score).toBeLessThanOrEqual(100)
  })

  it('source affects viral score: tiktok > pinterest > amazon', () => {
    const base = { price: 30, sales_count: 1000, review_count: 500, rating: 4.5 }
    const tiktok = calculateCompositeScore({ ...base, source: 'tiktok' })
    const pinterest = calculateCompositeScore({ ...base, source: 'pinterest' })
    const amazon = calculateCompositeScore({ ...base, source: 'amazon' })
    expect(tiktok.viral_score).toBeGreaterThan(pinterest.viral_score)
    expect(pinterest.viral_score).toBeGreaterThan(amazon.viral_score)
  })
})

// ─── Profitability Calculator ─────────────────────────────────────

describe('Phase 3H: Profitability Calculator', () => {
  it('sweet-spot product ($15-$60) gets max price bonus', () => {
    const result = calculateProfitability({ price: 30, sales_count: 100, review_count: 50, rating: 4.0 })
    expect(result.score).toBeGreaterThanOrEqual(30) // at least the price bonus
  })

  it('$0 product gets minimum price score', () => {
    const result = calculateProfitability({ price: 0, sales_count: 0, review_count: 0, rating: 0 })
    expect(result.score).toBe(0) // price: 0 → no score since not > 0
    expect(result.margin_estimate).toBe(0.2) // default lowest tier
  })

  it('competition level mapping', () => {
    const low = calculateProfitability({ price: 30, sales_count: 50, review_count: 5, rating: 4.0 })
    const medium = calculateProfitability({ price: 30, sales_count: 50, review_count: 200, rating: 4.0 })
    const high = calculateProfitability({ price: 30, sales_count: 50, review_count: 2000, rating: 4.0 })
    expect(low.competition_level).toBe('low')
    expect(medium.competition_level).toBe('medium')
    expect(high.competition_level).toBe('high')
  })

  it('margin estimate tiers: >30 = 0.4, >15 = 0.3, else 0.2', () => {
    expect(calculateProfitability({ price: 50, sales_count: 0, review_count: 0, rating: 0 }).margin_estimate).toBe(0.4)
    expect(calculateProfitability({ price: 20, sales_count: 0, review_count: 0, rating: 0 }).margin_estimate).toBe(0.3)
    expect(calculateProfitability({ price: 10, sales_count: 0, review_count: 0, rating: 0 }).margin_estimate).toBe(0.2)
  })
})

// ─── Influencer Conversion Score ──────────────────────────────────

describe('Phase 3I: Influencer Conversion Score', () => {
  it('all zeros → minimum base score', () => {
    const score = calculateInfluencerConversionScore({})
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('micro-influencer sweet spot (10k-100k) gets max follower score', () => {
    const micro = calculateInfluencerConversionScore({ followerCount: 50000, engagementRate: 5 })
    const macro = calculateInfluencerConversionScore({ followerCount: 500000, engagementRate: 5 })
    expect(micro).toBeGreaterThanOrEqual(macro)
  })

  it('high engagement rate is heavily weighted', () => {
    const lowER = calculateInfluencerConversionScore({ followerCount: 50000, engagementRate: 0.5 })
    const highER = calculateInfluencerConversionScore({ followerCount: 50000, engagementRate: 6 })
    expect(highER - lowER).toBeGreaterThanOrEqual(20)
  })

  it('score capped at 100', () => {
    const score = calculateInfluencerConversionScore({
      followerCount: 50000,
      engagementRate: 10,
      avgViews: 100000,
      conversionRate: 5,
      nicheRelevance: 100,
    })
    expect(score).toBeLessThanOrEqual(100)
  })

  it('zero followers does not divide by zero', () => {
    expect(() => calculateInfluencerConversionScore({
      followerCount: 0,
      avgViews: 1000,
    })).not.toThrow()
  })
})

// ─── Score Explanation ────────────────────────────────────────────

describe('Phase 3J: Score Explanation', () => {
  it('includes tier badge', () => {
    const text = explainScore('final', 85, { trendScore: 90, viralScore: 80, profitScore: 70 })
    expect(text).toContain('HOT')
    expect(text).toContain('85/100')
  })

  it('includes sub-scores when provided', () => {
    const text = explainScore('final', 50, { trendScore: 60, viralScore: 40, profitScore: 50 })
    expect(text).toContain('Trend: 60/100')
    expect(text).toContain('Viral: 40/100')
    expect(text).toContain('Profit: 50/100')
  })

  it('handles missing sub-scores', () => {
    const text = explainScore('composite', 50, {})
    expect(text).toContain('50/100')
    expect(text).not.toContain('Trend:')
  })
})

// ─── Subscription Tier Limits ─────────────────────────────────────

describe('Phase 3K: Subscription Tier Config', () => {
  it('has all four tiers', () => {
    expect(PRICING_TIERS).toHaveProperty('starter')
    expect(PRICING_TIERS).toHaveProperty('growth')
    expect(PRICING_TIERS).toHaveProperty('professional')
    expect(PRICING_TIERS).toHaveProperty('enterprise')
  })

  it('prices are ascending', () => {
    expect(PRICING_TIERS.starter.price).toBeLessThan(PRICING_TIERS.growth.price)
    expect(PRICING_TIERS.growth.price).toBeLessThan(PRICING_TIERS.professional.price)
    expect(PRICING_TIERS.professional.price).toBeLessThan(PRICING_TIERS.enterprise.price)
  })

  it('product limits are ascending', () => {
    expect(PRICING_TIERS.starter.productsPerPlatform).toBeLessThan(PRICING_TIERS.growth.productsPerPlatform)
    expect(PRICING_TIERS.growth.productsPerPlatform).toBeLessThan(PRICING_TIERS.professional.productsPerPlatform)
    expect(PRICING_TIERS.professional.productsPerPlatform).toBeLessThan(PRICING_TIERS.enterprise.productsPerPlatform)
  })

  it('platform limits are ascending', () => {
    expect(PRICING_TIERS.starter.platforms).toBeLessThanOrEqual(PRICING_TIERS.growth.platforms)
    expect(PRICING_TIERS.growth.platforms).toBeLessThanOrEqual(PRICING_TIERS.professional.platforms)
  })

  it('higher tiers include all lower-tier engines', () => {
    const starterEngines = PRICING_TIERS.starter.engines
    const growthEngines = PRICING_TIERS.growth.engines
    const proEngines = PRICING_TIERS.professional.engines
    const entEngines = PRICING_TIERS.enterprise.engines

    for (const eng of starterEngines) {
      expect(growthEngines).toContain(eng)
    }
    for (const eng of growthEngines) {
      expect(proEngines).toContain(eng)
    }
    for (const eng of proEngines) {
      expect(entEngines).toContain(eng)
    }
  })

  it('starter has exactly 1 platform', () => {
    expect(PRICING_TIERS.starter.platforms).toBe(1)
  })

  it('enterprise has 50 products per platform', () => {
    expect(PRICING_TIERS.enterprise.productsPerPlatform).toBe(50)
  })
})

// ─── Cross-function Integration ───────────────────────────────────

describe('Phase 3L: Cross-Function Integration', () => {
  it('composite score feeds correctly into tier classification', () => {
    const result = calculateCompositeScore({
      price: 30, sales_count: 10000, review_count: 2000, rating: 4.8, source: 'tiktok',
    })
    const tier = getTierFromScore(result.overall_score)
    expect(['HOT', 'WARM', 'WATCH', 'COLD']).toContain(tier)
  })

  it('composite viral_score maps to valid stage', () => {
    const result = calculateCompositeScore({
      price: 30, sales_count: 10000, review_count: 2000, rating: 4.8, source: 'tiktok',
    })
    const stage = getStageFromViralScore(result.viral_score)
    expect(['emerging', 'rising', 'exploding', 'saturated']).toContain(stage)
  })

  it('AI insight tier determined from final score', () => {
    const result = calculateCompositeScore({
      price: 30, sales_count: 10000, review_count: 2000, rating: 4.8, source: 'tiktok',
    })
    const aiTier = getAiInsightTier(result.overall_score)
    expect(['none', 'haiku', 'sonnet']).toContain(aiTier)
  })

  it('end-to-end: product → score → tier → stage → AI tier', () => {
    const products = [
      { price: 5, sales_count: 0, review_count: 0, rating: 1.0, source: 'unknown' },
      { price: 25, sales_count: 200, review_count: 50, rating: 3.5, source: 'amazon' },
      { price: 40, sales_count: 3000, review_count: 800, rating: 4.5, source: 'pinterest' },
      { price: 30, sales_count: 10000, review_count: 5000, rating: 4.9, source: 'tiktok' },
    ]

    for (const product of products) {
      const score = calculateCompositeScore(product)
      const tier = getTierFromScore(score.overall_score)
      const stage = getStageFromViralScore(score.viral_score)
      const aiTier = getAiInsightTier(score.overall_score)

      // All outputs should be valid
      expect(score.overall_score).toBeGreaterThanOrEqual(0)
      expect(score.overall_score).toBeLessThanOrEqual(100)
      expect(['HOT', 'WARM', 'WATCH', 'COLD']).toContain(tier)
      expect(['emerging', 'rising', 'exploding', 'saturated']).toContain(stage)
      expect(['none', 'haiku', 'sonnet']).toContain(aiTier)
    }
  })
})
