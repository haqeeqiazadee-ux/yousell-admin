import type { ProductResult, ProviderConfig } from '../types';

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'quacker~twitter-scraper';

export function getTwitterConfig(): ProviderConfig {
  return { name: 'apify', isConfigured: !!APIFY_TOKEN };
}

export async function searchTwitterProducts(query: string): Promise<ProductResult[]> {
  if (!APIFY_TOKEN) return [];

  try {
    const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerms: [query], maxTweets: 30, sort: 'Top' }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) return [];
    const items = await res.json() as Array<Record<string, unknown>>;

    return items.slice(0, 30).map((item, i) => ({
      id: `tw_${(item.id as string) || i}`,
      title: ((item.text as string) || '').slice(0, 120),
      price: 0,
      currency: 'USD',
      url: (item.url as string) || `https://twitter.com`,
      platform: 'tiktok' as const,
      metadata: {
        source: 'twitter',
        likes: item.likeCount,
        retweets: item.retweetCount,
        replies: item.replyCount,
        authorFollowers: item.authorFollowers,
      },
    }));
  } catch (err) {
    console.error('[Twitter Provider] Error:', err);
    return [];
  }
}
