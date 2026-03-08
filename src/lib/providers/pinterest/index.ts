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
  _query: string
): Promise<ProductResult[]> {
  // TODO Phase 10: Implement Apify Pinterest scraper
  // TODO: When PINTEREST_APP_ID is set, switch to official Pinterest API
  return [];
}
