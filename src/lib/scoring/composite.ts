import { calculateProfitability } from './profitability';

export interface CompositeScore {
  viral_score: number;
  profitability_score: number;
  overall_score: number;
}

export function calculateCompositeScore(product: {
  price: number;
  sales_count: number;
  review_count: number;
  rating: number;
  source: string;
}): CompositeScore {
  const profitability = calculateProfitability(product);

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

  const overall_score = Math.round(viral_score * 0.6 + profitability.score * 0.4);

  return {
    viral_score,
    profitability_score: profitability.score,
    overall_score,
  };
}

// --- Trend Opportunity Score (Section 6 of build brief) ---

export interface TrendInputs {
  tiktokGrowth?: number;
  influencerActivity?: number;
  amazonDemand?: number;
  competition?: number;
  profitMargin?: number;
}

export function calculateTrendScore(inputs: TrendInputs): number {
  return Math.min(100, Math.max(0, Math.round(
    (inputs.tiktokGrowth ?? 0) * 0.35 +
    (inputs.influencerActivity ?? 0) * 0.25 +
    (inputs.amazonDemand ?? 0) * 0.20 +
    (inputs.competition ?? 0) * -0.10 +
    (inputs.profitMargin ?? 0) * 0.10
  )));
}

// --- Early Viral Score (Section 5 — six pre-viral signals) ---

export interface ViralInputs {
  microInfluencerConvergence?: number;
  commentPurchaseIntent?: number;
  hashtagAcceleration?: number;
  creatorNicheExpansion?: number;
  engagementVelocity?: number;
  supplySideResponse?: number;
}

export function calculateViralScore(inputs: ViralInputs): number {
  // Weights MUST sum to 1.0: 0.25+0.20+0.20+0.15+0.10+0.10 = 1.00
  const score =
    (inputs.microInfluencerConvergence ?? 0) * 0.25 +
    (inputs.commentPurchaseIntent ?? 0) * 0.20 +
    (inputs.hashtagAcceleration ?? 0) * 0.20 +
    (inputs.creatorNicheExpansion ?? 0) * 0.15 +
    (inputs.engagementVelocity ?? 0) * 0.10 +
    (inputs.supplySideResponse ?? 0) * 0.10;
  return Math.min(100, Math.max(0, Math.round(score)));
}

// --- Profitability Score (Section 7) ---

export interface ProfitInputs {
  profitMargin?: number;
  shippingFeasibility?: number;
  marketingEfficiency?: number;
  supplierReliability?: number;
  operationalRisk?: number;
}

export function calculateProfitScore(inputs: ProfitInputs): number {
  const score =
    (inputs.profitMargin ?? 0) * 0.40 +
    (inputs.shippingFeasibility ?? 0) * 0.20 +
    (inputs.marketingEfficiency ?? 0) * 0.20 +
    (inputs.supplierReliability ?? 0) * 0.10 -
    (inputs.operationalRisk ?? 0) * 0.10;
  return Math.min(100, Math.max(0, Math.round(score)));
}

// --- Final Opportunity Score (Section 6) ---

export function calculateFinalScore(trend: number, viral: number, profit: number): number {
  // Weights: Trend 0.40, Viral 0.35, Profit 0.25 = 1.00
  return Math.min(100, Math.max(0, Math.round(
    trend * 0.40 +
    viral * 0.35 +
    profit * 0.25
  )));
}

// --- Badge classification (Section 6) ---

export function getTierFromScore(score: number): 'HOT' | 'WARM' | 'WATCH' | 'COLD' {
  if (score >= 80) return 'HOT';
  if (score >= 60) return 'WARM';
  if (score >= 40) return 'WATCH';
  return 'COLD';
}

// --- Trend lifecycle stage (Section 1 of build brief) ---

export function getStageFromViralScore(viralScore: number): 'emerging' | 'rising' | 'exploding' | 'saturated' {
  if (viralScore >= 85) return 'exploding';
  if (viralScore >= 70) return 'rising';
  if (viralScore >= 40) return 'emerging';
  return 'saturated';
}

// --- AI insight tier determination ---

export function getAiInsightTier(finalScore: number): 'none' | 'haiku' | 'sonnet' {
  if (finalScore >= 75) return 'sonnet';  // On-demand only, NEVER automatic
  if (finalScore >= 60) return 'haiku';
  return 'none';
}

// --- Auto-rejection rules (Section 7) ---

export interface RejectionInput {
  grossMargin: number;
  shippingCostPct: number;
  breakEvenMonths: number;
  isFragileHazardous: boolean;
  hasCertification: boolean;
  fastestUSDeliveryDays: number;
}

export function shouldRejectProduct(input: RejectionInput): { rejected: boolean; reasons: string[] } {
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

// --- Score explanation ---

export function explainScore(
  type: string,
  score: number,
  details: { trendScore?: number; viralScore?: number; profitScore?: number }
): string {
  const tier = getTierFromScore(score);
  const parts = [`${type} score: ${score}/100 (${tier}).`];
  if (details.trendScore !== undefined) parts.push(`Trend: ${details.trendScore}/100.`);
  if (details.viralScore !== undefined) parts.push(`Viral: ${details.viralScore}/100.`);
  if (details.profitScore !== undefined) parts.push(`Profit: ${details.profitScore}/100.`);
  return parts.join(' ');
}
