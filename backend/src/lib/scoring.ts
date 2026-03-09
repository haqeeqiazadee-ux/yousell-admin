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

  const overall_score = Math.round(viral_score * 0.6 + profitability_score * 0.4);

  return { viral_score, profitability_score, overall_score };
}
