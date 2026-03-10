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
  if (cached) return cached as unknown as TikTokProduct[];

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external API response
    return ((data.products || []) as Record<string, any>[]).map((p) => ({
      external_id: String(p.id || ''),
      title: String(p.title || ''),
      price: Number(p.price || 0) / 100,
      url: String(p.url || ''),
      image_url: String(p.image_url || ''),
      sales_count: Number(p.sales_count || 0),
      review_count: Number(p.review_count || 0),
      rating: Number(p.rating || 0),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cached Supabase response
    return (cached as Record<string, any>[]).map((t) => ({
      keyword: String(t.keyword || ''),
      volume: Number(t.volume || 0),
      growth: Number(t.growth || 0),
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external API response
    return ((data.trends || []) as Record<string, any>[]).map((t) => ({
      keyword: String(t.keyword || ''),
      volume: Number(t.volume || 0),
      growth: Number(t.growth_rate || 0),
    }));
  } catch {
    return [];
  }
}
