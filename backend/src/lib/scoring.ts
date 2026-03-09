interface Product {
  price: number;
  sales_count: number;
  review_count: number;
  rating: number;
  source: string;
}

interface CompositeScore {
  viral_score: number;
  profitability_score: number;
  overall_score: number;
}

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

export function calculateCompositeScore(product: Product): CompositeScore {
  const profitability_score = calculateProfitability(product);

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

  viral_score = Math.min(100, viral_score);

  // Final Score = Trend(0.40) + Viral(0.35) + Profit(0.25) per spec
  // For discovery scoring, we use viral as a proxy for trend+viral
  const overall_score = Math.round(viral_score * 0.60 + profitability_score * 0.40);

  return { viral_score, profitability_score, overall_score };
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
  if (viralScore >= 85) return 'exploding';
  if (viralScore >= 70) return 'rising';
  if (viralScore >= 40) return 'emerging';
  return 'saturated';
}

// Auto-rejection rules per spec (Section 7)
export function shouldRejectProduct(input: {
  grossMargin: number;
  shippingCostPct: number;
  breakEvenMonths: number;
  isFragileHazardous: boolean;
  hasCertification: boolean;
  fastestUSDeliveryDays: number;
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

  return { rejected: reasons.length > 0, reasons };
}
