import { getCachedProducts, getCachedTrends } from './cache';

export interface TikTokProduct {
  external_id: string;
  title: string;
  price: number;
  url: string;
  image_url: string;
  sales_count: number;
  review_count: number;
  rating: number;
  source: 'tiktok';
  viral_score?: number;
}

export async function scrapeTikTokProducts(query?: string): Promise<TikTokProduct[]> {
  const cached = await getCachedProducts('tiktok', query || '');
  if (cached) return cached as TikTokProduct[];

  const apiKey = process.env.TIKTOK_API_KEY;
  if (!apiKey) {
    console.warn('TIKTOK_API_KEY not set, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.tiktok-shop.com/products/trending?query=${encodeURIComponent(query || '')}&limit=50`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.products || []).map((p: any) => ({
      external_id: p.id,
      title: p.title,
      price: p.price / 100,
      url: p.url,
      image_url: p.image_url || '',
      sales_count: p.sales_count || 0,
      review_count: p.review_count || 0,
      rating: p.rating || 0,
      source: 'tiktok' as const,
    }));
  } catch (error) {
    console.error('TikTok scrape error:', error);
    return [];
  }
}

export async function searchTrends(query?: string): Promise<{ keyword: string; volume: number; growth: number }[]> {
  const cached = await getCachedTrends(query || '');
  if (cached) {
    return cached.map((t: any) => ({
      keyword: t.keyword,
      volume: t.volume,
      growth: t.growth,
    }));
  }

  const apiKey = process.env.TIKTOK_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://api.tiktok-shop.com/trends?query=${encodeURIComponent(query || '')}&limit=20`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();

    return (data.trends || []).map((t: any) => ({
      keyword: t.keyword,
      volume: t.volume || 0,
      growth: t.growth_rate || 0,
    }));
  } catch {
    return [];
  }
}
