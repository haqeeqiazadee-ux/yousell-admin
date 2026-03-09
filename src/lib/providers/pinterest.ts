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
  if (cached) return cached as unknown as PinterestProduct[];

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external API response
    return ((data.items || []) as Record<string, any>[]).map((p) => ({
      external_id: String(p.id || ''),
      title: String(p.title || (p.description as string)?.slice(0, 100) || ''),
      price: Number(p.price?.value || 0),
      url: String(p.link || `https://pinterest.com/pin/${p.id}`),
      image_url: String(p.media?.images?.['600x']?.url || ''),
      sales_count: 0,
      review_count: Number(p.aggregated_pin_data?.aggregated_stats?.saves || 0),
      rating: 0,
      source: 'pinterest' as const,
      pin_count: Number(p.aggregated_pin_data?.aggregated_stats?.saves || 0),
    }));
  } catch (error) {
    console.error('Pinterest scrape error:', error);
    return [];
  }
}
