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
      `https://api.apify.com/v2/acts/clearpath~shop-by-shopify-product-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          maxResults: 20,
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
      price: typeof item.price === "number" ? item.price : parseFloat(String(item.price || 0)) || 0,
      currency: (item.currency as string) || "USD",
      imageUrl: ((item.images as { url: string }[]) || [])[0]?.url || (item.image as string) || undefined,
      url: (item.url as string) || (item.slug ? `https://shop.app/p/${item.id}` : ""),
      platform: "shopify" as const,
      score: undefined,
      metadata: {
        vendor: item.vendor || null,
        productType: item.productType || null,
        availableForSale: item.availableForSale ?? null,
        onSale: item.onSale ?? null,
        originalPrice: item.originalPrice || null,
        variantsCount: item.variantsCount || 0,
        slug: item.slug || null,
      },
    }));
  } catch (err) {
    console.error("Apify Shopify search failed:", err);
    return [];
  }
}
