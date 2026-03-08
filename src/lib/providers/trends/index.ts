import type { TrendResult, ProviderConfig } from "../types";

const PROVIDER = process.env.TRENDS_PROVIDER || "pytrends";

export function getTrendsConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: true, // pytrends requires no key
  };
}

export async function searchTrends(
  keywords: string[]
): Promise<TrendResult[]> {
  if (process.env.APIFY_API_TOKEN) {
    return searchViaApify(keywords);
  }
  return [];
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
