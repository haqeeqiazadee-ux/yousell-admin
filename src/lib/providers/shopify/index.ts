import type { ProductResult, ProviderConfig } from "../types";

export function getShopifyConfig(): ProviderConfig {
  return {
    name: "shopify",
    isConfigured: !!process.env.APIFY_API_TOKEN,
  };
}

export async function searchShopifyProducts(
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
      `https://api.apify.com/v2/acts/dtrungtin~shopify-product-scraper/run-sync-get-dataset-items?token=${token}`,
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
      console.error(`Apify Shopify error: ${res.status}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, 20).map((item: Record<string, unknown>, i: number) => ({
      id: `shopify-${(item.id as string) || i}`,
      title: (item.title as string) || "Untitled",
      price: parseFloat(String(item.price || (item.variants as Record<string, unknown>[])?.[0]?.price || 0)) || 0,
      currency: "USD",
      imageUrl: (item.image as string) || ((item.images as string[]) || [])[0] || undefined,
      url: (item.url as string) || (item.handle ? `https://shopify.com/products/${item.handle}` : ""),
      platform: "shopify" as const,
      score: undefined,
      metadata: {
        vendor: item.vendor || null,
        productType: item.product_type || item.productType || null,
        tags: item.tags || [],
        variants: Array.isArray(item.variants) ? (item.variants as unknown[]).length : 0,
      },
    }));
  } catch (err) {
    console.error("Apify Shopify search failed:", err);
    return [];
  }
}
