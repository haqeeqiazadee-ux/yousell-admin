export type ProductStatus = "draft" | "active" | "archived" | "enriching";
export type ProductPlatform = "tiktok" | "amazon" | "shopify" | "manual";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  platform: ProductPlatform;
  status: ProductStatus;
  category: string | null;
  price: number | null;
  cost: number | null;
  currency: string;
  margin_percent: number | null;
  score_overall: number;
  score_demand: number;
  score_competition: number;
  score_margin: number;
  score_trend: number;
  external_id: string | null;
  external_url: string | null;
  image_url: string | null;
  enrichment_data: Record<string, unknown>;
  enriched_at: string | null;
  ai_summary: string | null;
  ai_blueprint: Record<string, unknown> | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  title: string;
  description?: string;
  platform?: ProductPlatform;
  status?: ProductStatus;
  category?: string;
  price?: number;
  cost?: number;
  currency?: string;
  tags?: string[];
  external_url?: string;
  image_url?: string;
}
