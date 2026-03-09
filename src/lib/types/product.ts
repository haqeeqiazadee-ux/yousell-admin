export type ProductStatus = "draft" | "active" | "archived" | "enriching";
export type ProductPlatform =
  | "tiktok"
  | "amazon"
  | "shopify"
  | "pinterest"
  | "digital"
  | "ai_affiliate"
  | "physical_affiliate"
  | "manual";

export type ProductChannel =
  | "tiktok_shop"
  | "amazon_fba"
  | "shopify_dtc"
  | "pinterest_commerce"
  | "digital_products"
  | "ai_affiliate"
  | "physical_affiliate";

export type TrendStage = "emerging" | "rising" | "exploding" | "saturated";
export type TierBadge = "hot" | "warm" | "watch" | "cold";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  platform: ProductPlatform;
  channel: ProductChannel | null;
  status: ProductStatus;
  category: string | null;
  price: number | null;
  cost: number | null;
  currency: string;
  margin_percent: number | null;
  // Composite scoring (spec)
  final_score: number;
  trend_score: number;
  viral_score: number;
  profit_score: number;
  trend_stage: TrendStage | null;
  // Legacy scoring fields
  score_overall: number;
  score_demand: number;
  score_competition: number;
  score_margin: number;
  score_trend: number;
  // External references
  external_id: string | null;
  external_url: string | null;
  image_url: string | null;
  // Enrichment
  enrichment_data: Record<string, unknown>;
  enriched_at: string | null;
  // AI analysis
  ai_summary: string | null;
  ai_insight_haiku: string | null;
  ai_insight_sonnet: string | null;
  ai_blueprint: Record<string, unknown> | null;
  // Metadata
  tags: string[];
  metadata: Record<string, unknown>;
  // Ownership
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  title: string;
  description?: string;
  platform?: ProductPlatform;
  channel?: ProductChannel;
  status?: ProductStatus;
  category?: string;
  price?: number;
  cost?: number;
  currency?: string;
  tags?: string[];
  external_url?: string;
  image_url?: string;
}

/** Get tier badge from Final Opportunity Score */
export function getTierBadge(score: number): TierBadge {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "watch";
  return "cold";
}

/** Get trend stage from Early Viral Score per build brief Section 5 */
export function getTrendStage(viralScore: number, declining?: boolean): TrendStage {
  if (declining) return "saturated";
  if (viralScore >= 85) return "exploding";
  if (viralScore >= 70) return "rising";
  if (viralScore >= 40) return "emerging";
  return "saturated";
}

/** Package tier limits per build brief Section 12 */
export const PACKAGE_TIERS = {
  starter: { label: "Starter", productsPerPlatform: 3 },
  growth: { label: "Growth", productsPerPlatform: 10 },
  professional: { label: "Professional", productsPerPlatform: 25 },
  enterprise: { label: "Enterprise", productsPerPlatform: 50 },
} as const;

export type PackageTier = keyof typeof PACKAGE_TIERS;
