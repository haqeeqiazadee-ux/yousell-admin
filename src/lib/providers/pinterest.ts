import { getCachedProducts } from './cache';

export interface PinterestProduct {
  external_id: string;
  title: string;
  price: number;
  url: string;
  image_url: string;
  sales_count: number;
  review_count: number;
  rating: number;
  source: 'pinterest';
  pin_count?: number;
}

export async function scrapePinterestProducts(query?: string): Promise<PinterestProduct[]> {
  const cached = await getCachedProducts('pinterest', query || '');
  if (cached) return cached as PinterestProduct[];

  const apiKey = process.env.PINTEREST_API_KEY;
  if (!apiKey) {
    console.warn('PINTEREST_API_KEY not set, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.pinterest.com/v5/search/pins?query=${encodeURIComponent(query || 'trending products')}&page_size=50`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Pinterest API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.items || []).map((p: any) => ({
      external_id: p.id,
      title: p.title || p.description?.slice(0, 100),
      price: p.price?.value || 0,
      url: p.link || `https://pinterest.com/pin/${p.id}`,
      image_url: p.media?.images?.['600x']?.url || '',
      sales_count: 0,
      review_count: p.aggregated_pin_data?.aggregated_stats?.saves || 0,
      rating: 0,
      source: 'pinterest' as const,
      pin_count: p.aggregated_pin_data?.aggregated_stats?.saves || 0,
    }));
  } catch (error) {
    console.error('Pinterest scrape error:', error);
    return [];
  }
}
