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

  // Viral score based on sales velocity and source
  let viral_score = 0;

  // Sales-based virality
  if (product.sales_count > 5000) viral_score += 40;
  else if (product.sales_count > 1000) viral_score += 30;
  else if (product.sales_count > 500) viral_score += 20;
  else if (product.sales_count > 100) viral_score += 10;

  // Source bonus (TikTok products tend to be more viral)
  if (product.source === 'tiktok') viral_score += 20;
  else if (product.source === 'pinterest') viral_score += 10;

  // Rating bonus
  if (product.rating >= 4.5) viral_score += 20;
  else if (product.rating >= 4.0) viral_score += 15;
  else if (product.rating >= 3.0) viral_score += 10;

  // Review count as social proof of virality
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
