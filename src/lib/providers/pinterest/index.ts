import type { ProductResult, ProviderConfig } from "../types";

const PROVIDER = process.env.PINTEREST_PROVIDER || "apify";

export function getPinterestConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: PROVIDER === "apify"
      ? !!process.env.APIFY_API_TOKEN
      : !!(process.env.PINTEREST_APP_ID && process.env.PINTEREST_APP_SECRET),
  };
}

/**
 * Search Pinterest for trending product pins.
 * Fallback: Apify Pinterest Trending Pins actor
 * Official: Pinterest Business API (when connected)
 */
export async function searchPinterestProducts(
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
      `https://api.apify.com/v2/acts/alexey~pinterest-crawler/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search: query,
          maxItems: 20,
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) {
      console.error(`Apify Pinterest error: ${res.status}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, 20).map((item: Record<string, unknown>, i: number) => ({
      id: `pinterest-${(item.id as string) || i}`,
      title: (item.title as string) || (item.description as string) || "Untitled Pin",
      price: parseFloat(String(item.price || 0)) || 0,
      currency: "USD",
      imageUrl: (item.imageUrl as string) || (item.image as string) || undefined,
      url: (item.url as string) || (item.link as string) || "",
      platform: "pinterest" as const,
      score: typeof item.saves === "number" ? Math.min(100, Math.round((item.saves as number) / 100)) : undefined,
      metadata: {
        saves: item.saves || item.repinCount || 0,
        comments: item.commentCount || item.comments || 0,
        pinner: item.pinner || item.author || null,
        board: item.board || null,
        link: item.link || null,
      },
    }));
  } catch (err) {
    console.error("Apify Pinterest search failed:", err);
    return [];
  }
}
