/**
 * POD-Specific Scoring Modifiers (v8 spec Section 2.2.1)
 *
 * Applied on top of the standard 3-pillar scoring for POD channel products.
 * Adjusts trend, viral, and profit sub-scores based on POD-specific factors.
 */

export interface PodTrendModifiers {
  designTrendVelocity?: number;   // 0-100: rising design aesthetics on Etsy/Pinterest
  seasonalRelevance?: number;     // 0-100: holiday/event-specific designs
  nicheSaturation?: number;       // 0-100: too many similar designs (PENALTY)
}

export interface PodViralModifiers {
  aestheticAppeal?: number;       // 0-100: visually shareable design
  influencerAdoption?: number;    // 0-100: influencer adoption of niche merch
  ugcPotential?: number;          // 0-100: customers sharing photos wearing/using product
}

export interface PodProfitModifiers {
  marginAfterFulfillment?: number; // actual margin % after POD fulfillment costs
  fulfillmentPartnerCost?: number; // 0-100: cheapest partner wins bonus (inverse of cost)
  baseCost?: number;               // raw base cost in $ — high cost penalized
}

export interface PodModifierResult {
  trendAdjustment: number;   // additive adjustment to trend_score (-20 to +20)
  viralAdjustment: number;   // additive adjustment to viral_score (-20 to +20)
  profitAdjustment: number;  // additive adjustment to profit_score (-30 to +20)
  reasons: string[];
}

export function calculatePodModifiers(
  trend: PodTrendModifiers,
  viral: PodViralModifiers,
  profit: PodProfitModifiers,
): PodModifierResult {
  const reasons: string[] = [];
  let trendAdj = 0;
  let viralAdj = 0;
  let profitAdj = 0;

  // --- TREND ADJUSTMENTS ---
  if ((trend.designTrendVelocity ?? 0) >= 70) {
    trendAdj += 15;
    reasons.push('Design trend velocity is high (+15 trend)');
  } else if ((trend.designTrendVelocity ?? 0) >= 40) {
    trendAdj += 8;
  }

  if ((trend.seasonalRelevance ?? 0) >= 60) {
    trendAdj += 10;
    reasons.push('Strong seasonal relevance (+10 trend)');
  }

  if ((trend.nicheSaturation ?? 0) >= 70) {
    trendAdj -= 15;
    reasons.push('High niche saturation (-15 trend)');
  } else if ((trend.nicheSaturation ?? 0) >= 40) {
    trendAdj -= 5;
  }

  // --- VIRAL ADJUSTMENTS ---
  if ((viral.aestheticAppeal ?? 0) >= 70) {
    viralAdj += 15;
    reasons.push('High aesthetic appeal — visually shareable (+15 viral)');
  } else if ((viral.aestheticAppeal ?? 0) >= 40) {
    viralAdj += 8;
  }

  if ((viral.influencerAdoption ?? 0) >= 60) {
    viralAdj += 10;
    reasons.push('Influencer adoption of niche merch (+10 viral)');
  }

  if ((viral.ugcPotential ?? 0) >= 60) {
    viralAdj += 10;
    reasons.push('High UGC potential (+10 viral)');
  }

  // --- PROFIT ADJUSTMENTS ---
  // Must exceed 30% margin after fulfillment costs
  const margin = profit.marginAfterFulfillment ?? 0;
  if (margin < 30) {
    profitAdj -= 25;
    reasons.push(`POD margin ${margin}% is below 30% minimum (-25 profit)`);
  } else if (margin >= 50) {
    profitAdj += 15;
    reasons.push(`Strong POD margin ${margin}% (+15 profit)`);
  } else if (margin >= 40) {
    profitAdj += 8;
  }

  // Fulfillment partner cost comparison bonus
  if ((profit.fulfillmentPartnerCost ?? 50) >= 70) {
    profitAdj += 10;
    reasons.push('Cheapest fulfillment partner available (+10 profit)');
  }

  // High base cost penalty
  if ((profit.baseCost ?? 0) > 25) {
    profitAdj -= 10;
    reasons.push('High base cost item (-10 profit)');
  } else if ((profit.baseCost ?? 0) > 15) {
    profitAdj -= 5;
  }

  return {
    trendAdjustment: Math.max(-20, Math.min(20, trendAdj)),
    viralAdjustment: Math.max(-20, Math.min(20, viralAdj)),
    profitAdjustment: Math.max(-30, Math.min(20, profitAdj)),
    reasons,
  };
}

/**
 * Apply POD modifiers to base scores.
 * Returns adjusted scores clamped to 0-100.
 */
export function applyPodModifiers(
  baseTrend: number,
  baseViral: number,
  baseProfit: number,
  modifiers: PodModifierResult,
): { trend_score: number; viral_score: number; profit_score: number } {
  return {
    trend_score: Math.min(100, Math.max(0, baseTrend + modifiers.trendAdjustment)),
    viral_score: Math.min(100, Math.max(0, baseViral + modifiers.viralAdjustment)),
    profit_score: Math.min(100, Math.max(0, baseProfit + modifiers.profitAdjustment)),
  };
}

// POD sub-categories with typical margins (v8 spec Section 2.2.1)
export const POD_CATEGORIES = {
  apparel:     { examples: 'T-shirts, hoodies, tank tops',        avgMargin: '40-60%', bestPlatforms: ['shopify', 'etsy', 'amazon_merch'] },
  accessories: { examples: 'Phone cases, tote bags, hats',        avgMargin: '35-55%', bestPlatforms: ['shopify', 'etsy'] },
  home_living: { examples: 'Mugs, pillows, blankets, posters',    avgMargin: '30-50%', bestPlatforms: ['etsy', 'shopify'] },
  stationery:  { examples: 'Notebooks, stickers, planners',       avgMargin: '40-65%', bestPlatforms: ['etsy', 'amazon_kdp'] },
  all_over:    { examples: 'Leggings, dresses, swimwear',         avgMargin: '35-50%', bestPlatforms: ['shopify'] },
  pet:         { examples: 'Pet beds, bandanas, bowls',            avgMargin: '35-55%', bestPlatforms: ['etsy', 'shopify'] },
} as const;
