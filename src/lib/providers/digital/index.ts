import type { ProductResult, ProviderConfig } from "../types";

export function getDigitalConfig(): ProviderConfig {
  return {
    name: "digital",
    isConfigured: !!(process.env.PRODUCT_HUNT_API_KEY || process.env.APIFY_API_TOKEN),
  };
}

/**
 * Discover digital products (templates, courses, AI tools).
 * Sources: Product Hunt API, Gumroad scraper (Apify), Reddit
 */
export async function searchDigitalProducts(
  query: string
): Promise<ProductResult[]> {
  if (process.env.APIFY_API_TOKEN) {
    return searchViaApify(query);
  }
  return [];
}

async function searchViaApify(query: string): Promise<ProductResult[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/epctex~gumroad-scraper/run-sync-get-dataset-items?token=${token}`,
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
      console.error(`Apify Digital Products error: ${res.status}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, 20).map((item: Record<string, unknown>, i: number) => ({
      id: `digital-${(item.id as string) || i}`,
      title: (item.name as string) || (item.title as string) || "Untitled",
      price: parseFloat(String(item.price || 0)) || 0,
      currency: "USD",
      imageUrl: (item.thumbnail as string) || (item.image as string) || undefined,
      url: (item.url as string) || "",
      platform: "digital" as const,
      score: typeof item.sales_count === "number" ? Math.min(100, Math.round((item.sales_count as number) / 10)) : undefined,
      metadata: {
        type: "digital",
        creator: item.creator || item.seller || null,
        salesCount: item.sales_count || item.salesCount || 0,
        rating: item.rating || null,
        category: item.category || null,
      },
    }));
  } catch (err) {
    console.error("Apify Digital search failed:", err);
    return [];
  }
}
