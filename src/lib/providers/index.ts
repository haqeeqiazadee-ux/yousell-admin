// === Product Providers ===
export { searchTikTokProducts, getTikTokConfig, searchTikTokTrends } from "./tiktok";
export { searchAmazonProducts, getAmazonConfig } from "./amazon";
export { searchShopifyProducts, getShopifyConfig } from "./shopify";
export { searchPinterestProducts, getPinterestConfig } from "./pinterest";

// === Trends ===
export { searchTrends, getTrendsConfig } from "./trends";

// === Influencer ===
export {
  searchInfluencers,
  getInfluencerConfig,
  getInfluencerTier,
  estimateCPP,
  calculateConversionScore,
  passesFakeFollowerFilter,
} from "./influencer";
export type { InfluencerResult } from "./influencer";

// === Supplier ===
export { searchSuppliers, getSupplierConfig } from "./supplier";
export type { SupplierResult } from "./supplier";

// === Shared Types ===
export type { ProductResult, TrendResult, ProviderConfig, CompetitorResult } from "./types";
