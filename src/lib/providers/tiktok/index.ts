import type { ProductResult, ProviderConfig } from "../types";
import { getCachedTrends } from "../cache";

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
  if (PROVIDER === "scrape_creators" && process.env.SCRAPE_CREATORS_API_KEY) {
    return searchViaScrapeCreators(query);
  }
  if (PROVIDER === "creative_center" && process.env.TIKTOK_CREATIVE_CENTER_KEY) {
    return searchViaCreativeCenter(query);
  }
  if (PROVIDER === "research_api" && process.env.TIKTOK_RESEARCH_API_KEY) {
    return searchViaResearchAPI(query);
  }
  return [];
}

// Stub: TikTok ScrapeCreators integration (v8 spec — secondary scraper)
async function searchViaScrapeCreators(_query: string): Promise<ProductResult[]> {
  console.log("[TikTok] ScrapeCreators provider not yet implemented — pending API access");
  return [];
}

// Stub: TikTok Creative Center integration (v8 spec — trend data)
async function searchViaCreativeCenter(_query: string): Promise<ProductResult[]> {
  console.log("[TikTok] Creative Center provider not yet implemented — pending API access");
  return [];
}

// Stub: TikTok Research API integration (v8 spec — official API)
async function searchViaResearchAPI(_query: string): Promise<ProductResult[]> {
  console.log("[TikTok] Research API provider not yet implemented — pending approval");
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

/**
 * Search TikTok-specific trends via the TikTok Shop API.
 * Requires TIKTOK_API_KEY env var.
 */
export async function searchTikTokTrends(
  query?: string
): Promise<{ keyword: string; volume: number; growth: number }[]> {
  const cached = await getCachedTrends(query || "");
  if (cached) {
    return (cached as Record<string, unknown>[]).map((t) => ({
      keyword: String(t.keyword || ""),
      volume: Number(t.volume || 0),
      growth: Number(t.growth || 0),
    }));
  }

  const apiKey = process.env.TIKTOK_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://api.tiktok-shop.com/trends?query=${encodeURIComponent(query || "")}&limit=20`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) return [];
    const data = await response.json();

    return ((data.trends || []) as Record<string, unknown>[]).map((t) => ({
      keyword: String(t.keyword || ""),
      volume: Number(t.volume || 0),
      growth: Number(t.growth_rate || 0),
    }));
  } catch {
    return [];
  }
}
