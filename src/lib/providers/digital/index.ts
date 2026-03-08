import type { ProductResult, ProviderConfig } from "../types";

export function getDigitalConfig(): ProviderConfig {
  return {
    name: "digital",
    isConfigured: !!(process.env.PRODUCT_HUNT_TOKEN || process.env.APIFY_API_TOKEN),
  };
}

/**
 * Discover digital products (templates, courses, AI tools).
 * Sources: Product Hunt API, Gumroad scraper (Apify), Reddit
 */
export async function searchDigitalProducts(
  _query: string
): Promise<ProductResult[]> {
  // TODO Phase 11: Implement Product Hunt API integration
  // TODO: Implement Apify Gumroad Top Sellers actor
  // TODO: Reddit digital product discovery
  return [];
}
