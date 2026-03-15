interface Product {
  price: number;
  sales_count: number;
  review_count: number;
  rating: number;
  source: string;
}

// --- Simple profitability heuristic for discovery scoring ---

function calculateProfitability(product: Product): number {
  let score = 0;

  if (product.price >= 15 && product.price <= 60) score += 30;
  else if (product.price > 60 && product.price <= 100) score += 20;
  else if (product.price > 0) score += 10;

  if (product.sales_count > 1000) score += 25;
  else if (product.sales_count > 500) score += 20;
  else if (product.sales_count > 100) score += 15;
  else if (product.sales_count > 10) score += 10;

  if (product.rating >= 4.5) score += 20;
  else if (product.rating >= 4.0) score += 15;
  else if (product.rating >= 3.5) score += 10;

  if (product.review_count > 500) score += 15;
  else if (product.review_count > 100) score += 10;
  else if (product.review_count > 10) score += 5;

  return Math.min(100, score);
}

// --- Viral score heuristic for discovery (proxy for 6 pre-viral signals) ---

function calculateViralHeuristic(product: Product): number {
  let viral_score = 0;

  if (product.sales_count > 5000) viral_score += 40;
  else if (product.sales_count > 1000) viral_score += 30;
  else if (product.sales_count > 500) viral_score += 20;
  else if (product.sales_count > 100) viral_score += 10;

  if (product.source === 'tiktok') viral_score += 20;
  else if (product.source === 'pinterest') viral_score += 10;

  if (product.rating >= 4.5) viral_score += 20;
  else if (product.rating >= 4.0) viral_score += 15;
  else if (product.rating >= 3.0) viral_score += 10;

  if (product.review_count > 1000) viral_score += 20;
  else if (product.review_count > 100) viral_score += 10;

  return Math.min(100, viral_score);
}

// --- Trend score heuristic (proxy when real trend data unavailable) ---

function calculateTrendHeuristic(product: Product): number {
  let trend_score = 0;

  // Sales velocity as trend proxy
  if (product.sales_count > 5000) trend_score += 35;
  else if (product.sales_count > 1000) trend_score += 25;
  else if (product.sales_count > 500) trend_score += 15;

  // Platform signal
  if (product.source === 'tiktok') trend_score += 25;
  else if (product.source === 'pinterest') trend_score += 15;
  else if (product.source === 'amazon') trend_score += 10;

  // Review momentum as demand proxy
  if (product.review_count > 1000) trend_score += 20;
  else if (product.review_count > 100) trend_score += 10;

  // Rating signal
  if (product.rating >= 4.5) trend_score += 20;
  else if (product.rating >= 4.0) trend_score += 10;

  return Math.min(100, trend_score);
}

// --- 3-Pillar Composite Score: Final = Trend(0.40) + Viral(0.35) + Profit(0.25) ---

export interface ScoringResult {
  trend_score: number;
  viral_score: number;
  profit_score: number;
  final_score: number;
}

export function calculateCompositeScore(product: Product): ScoringResult {
  const trend_score = calculateTrendHeuristic(product);
  const viral_score = calculateViralHeuristic(product);
  const profit_score = calculateProfitability(product);

  const final_score = Math.min(100, Math.max(0, Math.round(
    trend_score * 0.40 +
    viral_score * 0.35 +
    profit_score * 0.25
  )));

  return {
    trend_score,
    viral_score,
    profit_score,
    final_score,
  };
}

// Badge classification per spec: 80+=HOT, 60+=WARM, 40+=WATCH, <40=COLD
export function getTierFromScore(score: number): 'HOT' | 'WARM' | 'WATCH' | 'COLD' {
  if (score >= 80) return 'HOT';
  if (score >= 60) return 'WARM';
  if (score >= 40) return 'WATCH';
  return 'COLD';
}

// Trend lifecycle stage per spec
export function getStageFromScore(viralScore: number): 'emerging' | 'rising' | 'exploding' | 'saturated' {
  if (viralScore >= 80) return 'exploding';
  if (viralScore >= 60) return 'rising';
  if (viralScore >= 40) return 'emerging';
  return 'saturated';
}

// Auto-rejection rules per spec (Section 7) — 8 rules
export function shouldRejectProduct(input: {
  grossMargin: number;
  shippingCostPct: number;
  breakEvenMonths: number;
  isFragileHazardous: boolean;
  hasCertification: boolean;
  fastestUSDeliveryDays: number;
  hasIPOrTrademarkRisk?: boolean;
  retailPrice?: number;
  competitorCount?: number;
}): { rejected: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (input.grossMargin < 0.40)
    reasons.push('Gross margin below 40%');
  if (input.shippingCostPct > 0.30)
    reasons.push('Shipping exceeds 30% of retail');
  if (input.breakEvenMonths > 2)
    reasons.push('Break-even exceeds 2 months');
  if (input.isFragileHazardous && !input.hasCertification)
    reasons.push('Fragile/hazardous without certification');
  if (input.fastestUSDeliveryDays > 15)
    reasons.push('No supplier with USA delivery under 15 days');
  if (input.hasIPOrTrademarkRisk)
    reasons.push('IP or trademark infringement risk detected');
  if (input.retailPrice !== undefined && input.retailPrice < 10)
    reasons.push('Retail price below $10 minimum threshold');
  if (input.competitorCount !== undefined && input.competitorCount > 100)
    reasons.push('Market oversaturated (100+ direct competitors)');

  return { rejected: reasons.length > 0, reasons };
}
