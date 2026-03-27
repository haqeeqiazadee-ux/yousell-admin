import type { TrendResult, ProviderConfig } from "../types";
import { getCachedTrends } from "../cache";

const PROVIDER = process.env.TRENDS_PROVIDER || process.env.GOOGLE_TRENDS_PROVIDER || "pytrends";

export function getTrendsConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: true, // pytrends requires no key
  };
}

/**
 * Search trends with batch processing (groups of 5 per cost rules).
 * Provider priority: pytrends > Apify > SerpAPI
 */
export async function searchTrends(
  keywords: string[]
): Promise<TrendResult[]> {
  // Check 24h cache first
  const cacheKey = [...keywords].sort().join(",");
  const cached = await getCachedTrends(cacheKey);
  if (cached) return cached as unknown as TrendResult[];

  // Batch keywords in groups of 5 (cost rule)
  const batches: string[][] = [];
  for (let i = 0; i < keywords.length; i += 5) {
    batches.push(keywords.slice(i, i + 5));
  }

  const results: TrendResult[] = [];

  for (const batch of batches) {
    if (process.env.APIFY_API_TOKEN) {
      results.push(...await searchViaApify(batch));
    } else if (PROVIDER === "serpapi" && process.env.SERPAPI_KEY) {
      results.push(...await searchViaSerpApi(batch));
    } else {
      // pytrends fallback — placeholder stubs until Railway backend integration
      results.push(...batch.map((keyword) => ({
        keyword,
        volume: 0,
        trend: "stable" as const,
        relatedKeywords: [],
        source: "pytrends",
      })));
    }
  }

  return results;
}

async function searchViaSerpApi(keywords: string[]): Promise<TrendResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return [];
  // Placeholder — actual SerpAPI integration needed
  return keywords.map((keyword) => ({
    keyword,
    volume: 0,
    trend: "stable" as const,
    relatedKeywords: [],
    source: "serpapi",
  }));
}

async function searchViaApify(keywords: string[]): Promise<TrendResult[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/emastra~google-trends-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchTerms: keywords,
          geo: "US",
          timeRange: "past12Months",
          maxItems: 50,
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) {
      console.error(`Apify Trends error: ${res.status}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.map((item: Record<string, unknown>) => {
      const value = parseInt(String(item.value || item.interest || 0), 10);
      let trend: "rising" | "stable" | "declining" = "stable";
      if (item.trend === "rising" || value > 70) trend = "rising";
      else if (item.trend === "declining" || value < 30) trend = "declining";

      return {
        keyword: (item.term as string) || (item.keyword as string) || (item.searchTerm as string) || "",
        volume: value,
        trend,
        relatedKeywords: Array.isArray(item.relatedQueries)
          ? (item.relatedQueries as Record<string, unknown>[]).map((r) => String(r.query || r)).slice(0, 5)
          : [],
        source: "google_trends",
      };
    });
  } catch (err) {
    console.error("Apify Trends search failed:", err);
    return [];
  }
}
