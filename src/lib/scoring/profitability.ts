export interface ProfitabilityScore {
  score: number;
  margin_estimate: number;
  competition_level: 'low' | 'medium' | 'high';
}

export function calculateProfitability(product: {
  price: number;
  sales_count: number;
  review_count: number;
  rating: number;
}): ProfitabilityScore {
  let score = 0;

  // Price sweet spot: $15-$60
  if (product.price >= 15 && product.price <= 60) {
    score += 30;
  } else if (product.price > 60 && product.price <= 100) {
    score += 20;
  } else if (product.price > 0) {
    score += 10;
  }

  // Sales velocity
  if (product.sales_count > 1000) score += 25;
  else if (product.sales_count > 500) score += 20;
  else if (product.sales_count > 100) score += 15;
  else if (product.sales_count > 10) score += 10;

  // Rating quality
  if (product.rating >= 4.5) score += 20;
  else if (product.rating >= 4.0) score += 15;
  else if (product.rating >= 3.5) score += 10;

  // Review volume (social proof)
  if (product.review_count > 500) score += 15;
  else if (product.review_count > 100) score += 10;
  else if (product.review_count > 10) score += 5;

  // Margin estimate based on price
  const margin_estimate = product.price > 30 ? 0.4 : product.price > 15 ? 0.3 : 0.2;

  // Competition level
  const competition_level: 'low' | 'medium' | 'high' =
    product.review_count > 1000 ? 'high' :
    product.review_count > 100 ? 'medium' : 'low';

  return {
    score: Math.min(100, score),
    margin_estimate,
    competition_level,
  };
}
