import type { ProductResult, ProviderConfig } from '../types';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'dtrungtin~ebay-items-scraper';

export function getEbayConfig(): ProviderConfig {
  return { name: 'apify', isConfigured: !!APIFY_TOKEN };
}

export async function searchEbayProducts(query: string): Promise<ProductResult[]> {
  if (!APIFY_TOKEN) return [];

  try {
    const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search: query, maxItems: 30, country: 'US' }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) return [];
    const items = await res.json() as Array<Record<string, unknown>>;

    return items.slice(0, 30).map((item, i) => ({
      id: `ebay_${(item.itemId as string) || i}`,
      title: (item.title as string) || '',
      price: parseFloat(String(item.price || 0)),
      currency: 'USD',
      imageUrl: (item.image as string) || undefined,
      url: (item.url as string) || `https://ebay.com`,
      platform: 'amazon' as const, // Maps to marketplace category
      metadata: {
        source: 'ebay',
        soldCount: item.soldCount || item.quantitySold,
        watcherCount: item.watchCount,
        sellerRating: item.sellerRating,
        condition: item.condition,
      },
    }));
  } catch (err) {
    console.error('[eBay Provider] Error:', err);
    return [];
  }
}
