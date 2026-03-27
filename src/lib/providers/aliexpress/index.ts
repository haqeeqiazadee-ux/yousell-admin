import type { ProductResult, ProviderConfig } from '../types';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'epctex~aliexpress-scraper';

export function getAliExpressConfig(): ProviderConfig {
  return { name: 'apify', isConfigured: !!APIFY_TOKEN };
}

export async function searchAliExpressProducts(query: string): Promise<ProductResult[]> {
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
      id: `ali_${(item.productId as string) || i}`,
      title: (item.title as string) || (item.name as string) || '',
      price: parseFloat(String(item.price || item.salePrice || 0)),
      currency: 'USD',
      imageUrl: (item.imageUrl as string) || (item.image as string) || undefined,
      url: (item.url as string) || `https://aliexpress.com`,
      platform: 'amazon' as const,
      metadata: {
        source: 'aliexpress',
        orders: item.orders || item.orderCount,
        rating: item.rating,
        reviewCount: item.reviewCount,
        sellerName: item.sellerName || item.storeName,
        shippingInfo: item.shippingInfo,
      },
    }));
  } catch (err) {
    console.error('[AliExpress Provider] Error:', err);
    return [];
  }
}
