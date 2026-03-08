import type { ProductResult, ProviderConfig } from "../types";

const PROVIDER = process.env.TIKTOK_PROVIDER || "apify";

export function getTikTokConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: PROVIDER === "apify"
      ? !!process.env.APIFY_API_TOKEN
      : !!process.env.TIKTOK_API_KEY,
  };
}

export async function searchTikTokProducts(
  query: string
): Promise<ProductResult[]> {
  if (PROVIDER === "apify" && process.env.APIFY_API_TOKEN) {
    return searchViaApify(query);
  }
  return [];
}

async function searchViaApify(query: string): Promise<ProductResult[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQueries: [query],
          resultsPerPage: 20,
          searchSection: "shop",
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) {
      console.error(`Apify TikTok error: ${res.status} ${res.statusText}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, 20).map((item: Record<string, unknown>, i: number) => ({
      id: `tiktok-${(item.id as string) || i}`,
      title: (item.title as string) || (item.text as string) || (item.desc as string) || "Untitled",
      price: parseFloat(String(item.price || item.productPrice || 0)) || 0,
      currency: "USD",
      imageUrl: (item.cover as string) || (item.imageUrl as string) || (item.thumbnail as string) || undefined,
      url: (item.url as string) || (item.webVideoUrl as string) || `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`,
      platform: "tiktok" as const,
      score: typeof item.diggCount === "number" ? Math.min(100, Math.round((item.diggCount as number) / 1000)) : undefined,
      metadata: {
        likes: item.diggCount || item.likes || 0,
        shares: item.shareCount || item.shares || 0,
        comments: item.commentCount || item.comments || 0,
        views: item.playCount || item.views || 0,
        author: item.authorMeta || item.author || null,
        hashtags: item.hashtags || [],
      },
    }));
  } catch (err) {
    console.error("Apify TikTok search failed:", err);
    return [];
  }
}
