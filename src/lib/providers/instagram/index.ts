import type { ProductResult, ProviderConfig } from '../types';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'apify~instagram-scraper';

export function getInstagramConfig(): ProviderConfig {
  return { name: 'apify', isConfigured: !!APIFY_TOKEN };
}

export async function searchInstagramProducts(query: string): Promise<ProductResult[]> {
  if (!APIFY_TOKEN) return [];

  try {
    const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search: query, resultsLimit: 30, searchType: 'hashtag' }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) return [];
    const items = await res.json() as Array<Record<string, unknown>>;

    return items.slice(0, 30).map((item, i) => ({
      id: `ig_${(item.shortCode as string) || i}`,
      title: ((item.caption as string) || '').slice(0, 120),
      price: 0,
      currency: 'USD',
      imageUrl: (item.displayUrl as string) || undefined,
      url: `https://instagram.com/p/${item.shortCode}`,
      platform: 'tiktok' as const, // Maps to social category
      metadata: {
        source: 'instagram',
        likes: item.likesCount,
        comments: item.commentsCount,
        ownerUsername: item.ownerUsername,
        isVideo: item.isVideo,
      },
    }));
  } catch (err) {
    console.error('[Instagram Provider] Error:', err);
    return [];
  }
}
