import type { TrendResult, ProviderConfig } from "../types";

const PROVIDER = process.env.TRENDS_PROVIDER || "pytrends";

export function getTrendsConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: true, // pytrends requires no key
  };
}

export async function searchTrends(
  _keywords: string[]
): Promise<TrendResult[]> {
  // Provider implementation will be added in Phase 7
  return [];
}
