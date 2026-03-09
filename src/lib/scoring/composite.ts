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

// --- Functions used by scoring route ---

export interface TrendInputs {
  googleTrendsSlope?: number;
  searchVolume?: number;
  socialMentions?: number;
}

export function calculateTrendScore(inputs: TrendInputs): number {
  let score = 0;
  if ((inputs.googleTrendsSlope ?? 0) > 0.5) score += 40;
  else if ((inputs.googleTrendsSlope ?? 0) > 0) score += 20;
  if ((inputs.searchVolume ?? 0) > 10000) score += 30;
  else if ((inputs.searchVolume ?? 0) > 1000) score += 15;
  if ((inputs.socialMentions ?? 0) > 500) score += 30;
  else if ((inputs.socialMentions ?? 0) > 50) score += 15;
  return Math.min(100, score);
}

export interface ViralInputs {
  microInfluencerConvergence?: number;
  commentPurchaseIntent?: number;
  hashtagAcceleration?: number;
  creatorNicheExpansion?: number;
  engagementVelocity?: number;
  supplySideResponse?: number;
}

export function calculateViralScore(inputs: ViralInputs): number {
  const values = [
    inputs.microInfluencerConvergence ?? 0,
    inputs.commentPurchaseIntent ?? 0,
    inputs.hashtagAcceleration ?? 0,
    inputs.creatorNicheExpansion ?? 0,
    inputs.engagementVelocity ?? 0,
    inputs.supplySideResponse ?? 0,
  ];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.min(100, Math.round(avg));
}

export interface ProfitInputs {
  price?: number;
  costOfGoods?: number;
  shippingCost?: number;
  marketplaceFees?: number;
}

export function calculateProfitScore(inputs: ProfitInputs): number {
  const price = inputs.price ?? 0;
  const totalCost = (inputs.costOfGoods ?? 0) + (inputs.shippingCost ?? 0) + (inputs.marketplaceFees ?? 0);
  if (price <= 0) return 0;
  const margin = (price - totalCost) / price;
  if (margin >= 0.5) return 100;
  if (margin >= 0.3) return 70;
  if (margin >= 0.15) return 40;
  return 10;
}

export function calculateFinalScore(trend: number, viral: number, profit: number): number {
  return Math.round(trend * 0.3 + viral * 0.4 + profit * 0.3);
}

export function getTierFromScore(score: number): string {
  if (score >= 80) return "S";
  if (score >= 60) return "A";
  if (score >= 40) return "B";
  if (score >= 20) return "C";
  return "D";
}

export function getStageFromViralScore(viralScore: number): string {
  if (viralScore >= 80) return "mainstream";
  if (viralScore >= 60) return "accelerating";
  if (viralScore >= 40) return "emerging";
  if (viralScore >= 20) return "early";
  return "pre-viral";
}

export function explainScore(
  type: string,
  score: number,
  details: { trendScore?: number; viralScore?: number; profitScore?: number }
): string {
  const tier = getTierFromScore(score);
  const parts = [`${type} score: ${score}/100 (Tier ${tier}).`];
  if (details.trendScore !== undefined) parts.push(`Trend: ${details.trendScore}/100.`);
  if (details.viralScore !== undefined) parts.push(`Viral: ${details.viralScore}/100.`);
  if (details.profitScore !== undefined) parts.push(`Profit: ${details.profitScore}/100.`);
  return parts.join(" ");
}
