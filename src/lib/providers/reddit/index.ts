import type { ProductResult, ProviderConfig } from '../types';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'trudax~reddit-scraper';

export function getRedditConfig(): ProviderConfig {
  return { name: 'apify', isConfigured: !!APIFY_TOKEN };
}

export async function searchRedditProducts(query: string): Promise<ProductResult[]> {
  if (!APIFY_TOKEN) return [];

  try {
    const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searches: [query],
        maxItems: 30,
        sort: 'hot',
        time: 'week',
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) return [];
    const items = await res.json() as Array<Record<string, unknown>>;

    return items.slice(0, 30).map((item, i) => ({
      id: `reddit_${(item.id as string) || i}`,
      title: (item.title as string) || '',
      price: 0,
      currency: 'USD',
      url: (item.url as string) || `https://reddit.com`,
      platform: 'tiktok' as const,
      metadata: {
        source: 'reddit',
        subreddit: item.subreddit,
        upvotes: item.upVotes || item.score,
        comments: item.numberOfComments,
        author: item.author,
      },
    }));
  } catch (err) {
    console.error('[Reddit Provider] Error:', err);
    return [];
  }
}
