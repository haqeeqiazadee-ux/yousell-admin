import type { ProductResult, ProviderConfig } from '../types';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'clockworks~tiktok-shop-scraper';

export function getTikTokShopConfig(): ProviderConfig {
  return { name: 'apify', isConfigured: !!APIFY_TOKEN };
}

export async function searchTikTokShopProducts(query: string): Promise<ProductResult[]> {
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
      id: `tts_${(item.productId as string) || i}`,
      title: (item.title as string) || (item.name as string) || '',
      price: parseFloat(String(item.price || item.salePrice || 0)),
      currency: 'USD',
      imageUrl: (item.imageUrl as string) || (item.coverImage as string) || undefined,
      url: (item.url as string) || `https://shop.tiktok.com`,
      platform: 'tiktok' as const,
      metadata: {
        source: 'tiktok_shop',
        salesVolume: item.salesVolume || item.sold,
        reviewCount: item.reviewCount,
        rating: item.rating,
        shopName: item.shopName,
        videoCount: item.videoCount,
      },
    }));
  } catch (err) {
    console.error('[TikTok Shop Provider] Error:', err);
    return [];
  }
}
