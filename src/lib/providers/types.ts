// Provider abstraction — each module has a pluggable provider interface
// Providers are swapped via environment variables (e.g., TIKTOK_PROVIDER=apify)

export interface ProviderConfig {
  name: string;
  isConfigured: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface TrendResult {
  keyword: string;
  volume: number;
  trend: "rising" | "stable" | "declining";
  relatedKeywords: string[];
  source: string;
}

export interface ProductResult {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  url: string;
  platform: "tiktok" | "amazon" | "shopify";
  score?: number;
  metadata: Record<string, unknown>;
}

export interface CompetitorResult {
  id: string;
  name: string;
  url: string;
  platform: string;
  metrics: Record<string, unknown>;
}
