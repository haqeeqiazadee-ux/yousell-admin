import type { ProductResult, ProviderConfig } from "../types";

const PROVIDER = process.env.TIKTOK_PROVIDER || "apify";

export function getTikTokConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: PROVIDER === "apify"
      ? !!process.env.APIFY_API_TOKEN
      : !!process.env.TIKTOK_API_KEY,
  };
}

export async function searchTikTokProducts(
  _query: string
): Promise<ProductResult[]> {
  // Provider implementation will be added in Phase 8
  return [];
}
