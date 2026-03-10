import { getCachedProducts } from './cache';

export interface AmazonProduct {
  external_id: string;
  title: string;
  price: number;
  url: string;
  image_url: string;
  sales_count: number;
  review_count: number;
  rating: number;
  source: 'amazon';
  bsr_rank?: number;
}

export async function scrapeAmazonProducts(query?: string): Promise<AmazonProduct[]> {
  const cached = await getCachedProducts('amazon', query || '');
  if (cached) return cached as unknown as AmazonProduct[];

  const apiKey = process.env.AMAZON_API_KEY;
  if (!apiKey) {
    console.warn('AMAZON_API_KEY not set, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.rainforestapi.com/request?api_key=${apiKey}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(query || 'trending products')}&sort_by=featured`,
      { signal: AbortSignal.timeout(30000) }
    );

    if (!response.ok) {
      throw new Error(`Amazon API error: ${response.status}`);
    }

    const data = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external API response
    return ((data.search_results || []) as Record<string, any>[]).map((p) => ({
      external_id: String(p.asin || ''),
      title: String(p.title || ''),
      price: Number(p.price?.value || 0),
      url: String(p.link || ''),
      image_url: String(p.image || ''),
      sales_count: Number(p.sales_volume?.value || 0),
      review_count: Number(p.ratings_total || 0),
      rating: Number(p.rating || 0),
      source: 'amazon' as const,
      bsr_rank: p.bestsellers_rank?.[0]?.rank as number | undefined,
    }));
  } catch (error) {
    console.error('Amazon scrape error:', error);
    return [];
  }
}
