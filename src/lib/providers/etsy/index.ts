import type { ProductResult, ProviderConfig } from '../types';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'dtrungtin~etsy-scraper';

export function getEtsyConfig(): ProviderConfig {
  return { name: 'apify', isConfigured: !!APIFY_TOKEN };
}

export async function searchEtsyProducts(query: string): Promise<ProductResult[]> {
  if (!APIFY_TOKEN) return [];

  try {
    const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchQuery: query, maxItems: 30, sortBy: 'most_recent' }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) return [];
    const items = await res.json() as Array<Record<string, unknown>>;

    return items.slice(0, 30).map((item, i) => ({
      id: `etsy_${(item.listingId as string) || i}`,
      title: (item.title as string) || '',
      price: parseFloat(String(item.price || 0)),
      currency: (item.currency as string) || 'USD',
      imageUrl: (item.imageUrl as string) || (item.mainImage as string) || undefined,
      url: (item.url as string) || `https://etsy.com`,
      platform: 'shopify' as const, // Maps to marketplace category
      metadata: {
        source: 'etsy',
        favorites: item.numFavorers || item.favorites,
        salesCount: item.salesCount,
        rating: item.rating,
        shopName: item.shopName,
        reviewCount: item.reviewCount,
      },
    }));
  } catch (err) {
    console.error('[Etsy Provider] Error:', err);
    return [];
  }
}
