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
  _query: string
): Promise<ProductResult[]> {
  // Provider implementation will be added in Phase 9
  return [];
}
