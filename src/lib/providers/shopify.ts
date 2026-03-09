import { getCachedProducts } from './cache';

export interface ShopifyProduct {
  external_id: string;
  title: string;
  price: number;
  url: string;
  image_url: string;
  sales_count: number;
  review_count: number;
  rating: number;
  source: 'shopify';
}

export async function scrapeShopifyProducts(query?: string): Promise<ShopifyProduct[]> {
  const cached = await getCachedProducts('shopify', query || '');
  if (cached) return cached as ShopifyProduct[];

  const apiKey = process.env.SHOPIFY_SCRAPER_KEY;
  if (!apiKey) {
    console.warn('SHOPIFY_SCRAPER_KEY not set, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.shopify-scraper.com/products?query=${encodeURIComponent(query || '')}&limit=50`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.products || []).map((p: any) => ({
      external_id: p.id?.toString(),
      title: p.title,
      price: parseFloat(p.price) || 0,
      url: p.url,
      image_url: p.image?.src || '',
      sales_count: p.sales_count || 0,
      review_count: p.reviews_count || 0,
      rating: p.rating || 0,
      source: 'shopify' as const,
    }));
  } catch (error) {
    console.error('Shopify scrape error:', error);
    return [];
  }
}
