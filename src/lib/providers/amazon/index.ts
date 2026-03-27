import type { ProductResult, ProviderConfig } from "../types";

const PROVIDER = process.env.AMAZON_PROVIDER || "apify_rapidapi";

export function getAmazonConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: PROVIDER === "apify_rapidapi"
      ? !!(process.env.APIFY_API_TOKEN || process.env.RAPIDAPI_KEY)
      : !!process.env.AMAZON_PA_API_KEY,
  };
}

export async function searchAmazonProducts(
  query: string
): Promise<ProductResult[]> {
  if (process.env.RAPIDAPI_KEY) {
    const results = await searchViaRapidAPI(query);
    if (results.length > 0) return results;
  }
  if (process.env.APIFY_API_TOKEN) {
    return searchViaApify(query);
  }
  if (process.env.AMAZON_PA_API_KEY) {
    return searchViaPAAPI(query);
  }
  return [];
}

// Stub: Amazon Product Advertising API (v8 spec — official API, pending approval)
async function searchViaPAAPI(_query: string): Promise<ProductResult[]> {
  console.log("[Amazon] PA-API provider not yet implemented — pending Amazon approval");
  return [];
}

async function searchViaRapidAPI(query: string): Promise<ProductResult[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&country=US&sort_by=RELEVANCE&page=1`,
      {
        headers: {
          "X-RapidAPI-Key": key,
          "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com",
        },
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!res.ok) {
      console.error(`RapidAPI Amazon error: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const products = json.data?.products || [];

    return products.slice(0, 20).map((item: Record<string, unknown>, i: number) => ({
      id: `amazon-${(item.asin as string) || i}`,
      title: (item.product_title as string) || "Untitled",
      price: parseFloat(String((item.product_price as string || "0").replace("$", ""))) || 0,
      currency: "USD",
      imageUrl: (item.product_photo as string) || undefined,
      url: (item.product_url as string) || `https://amazon.com/dp/${item.asin || ""}`,
      platform: "amazon" as const,
      score: item.product_star_rating ? Math.round(parseFloat(String(item.product_star_rating)) * 20) : undefined,
      metadata: {
        asin: item.asin || null,
        rating: item.product_star_rating || null,
        reviewCount: item.product_num_ratings || 0,
        bsr: item.sales_volume || null,
        isPrime: item.is_prime || false,
      },
    }));
  } catch (err) {
    console.error("RapidAPI Amazon search failed:", err);
    return [];
  }
}

async function searchViaApify(query: string): Promise<ProductResult[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/junglee~amazon-bestsellers-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: query, maxItems: 20, country: "US" }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, 20).map((item: Record<string, unknown>, i: number) => ({
      id: `amazon-${(item.asin as string) || i}`,
      title: (item.title as string) || "Untitled",
      price: parseFloat(String(item.price || 0)) || 0,
      currency: "USD",
      imageUrl: (item.image as string) || (item.thumbnail as string) || undefined,
      url: (item.url as string) || `https://amazon.com/dp/${item.asin || ""}`,
      platform: "amazon" as const,
      score: item.rating ? Math.round(parseFloat(String(item.rating)) * 20) : undefined,
      metadata: { asin: item.asin || null, rating: item.rating || null, reviewCount: item.reviewsCount || 0 },
    }));
  } catch (err) {
    console.error("Apify Amazon search failed:", err);
    return [];
  }
}
