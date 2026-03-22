import type { ProductResult, ProviderConfig } from '../types';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'epctex~temu-scraper';

export function getTemuConfig(): ProviderConfig {
  return { name: 'apify', isConfigured: !!APIFY_TOKEN };
}

export async function searchTemuProducts(query: string): Promise<ProductResult[]> {
  if (!APIFY_TOKEN) return [];

  try {
    const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchQuery: query, maxItems: 30 }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) return [];
    const items = await res.json() as Array<Record<string, unknown>>;

    return items.slice(0, 30).map((item, i) => ({
      id: `temu_${(item.productId as string) || i}`,
      title: (item.title as string) || (item.name as string) || '',
      price: parseFloat(String(item.price || item.salePrice || 0)),
      currency: 'USD',
      imageUrl: (item.imageUrl as string) || (item.image as string) || undefined,
      url: (item.url as string) || `https://temu.com`,
      platform: 'amazon' as const,
      metadata: {
        source: 'temu',
        soldCount: item.soldCount,
        rating: item.rating,
        reviewCount: item.reviewCount,
        originalPrice: item.originalPrice,
      },
    }));
  } catch (err) {
    console.error('[Temu Provider] Error:', err);
    return [];
  }
}
