import type { ProductResult, ProviderConfig } from "../types";

export function getShopifyConfig(): ProviderConfig {
  return {
    name: "shopify",
    isConfigured: false, // Requires store connection in Phase 10
  };
}

export async function searchShopifyProducts(
  _query: string
): Promise<ProductResult[]> {
  // Provider implementation will be added in Phase 10
  return [];
}
