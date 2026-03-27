export type UserRole = "super_admin" | "admin" | "client" | "viewer";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_by: string | null;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  plan: "starter" | "growth" | "professional" | "enterprise";
  niche: string | null;
  notes: string | null;
  created_at: string;
}

export interface Influencer {
  id: string;
  username: string;
  platform: string;
  followers: number;
  tier: "nano" | "micro" | "mid" | "macro";
  engagement_rate: number;
  us_audience_pct: number;
  fake_follower_pct: number;
  conversion_score: number;
  email: string | null;
  cpp_estimate: number | null;
  niche: string | null;
  commission_preference: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  moq: number;
  unit_price: number;
  shipping_cost: number;
  lead_time: number;
  white_label: boolean;
  dropship: boolean;
  us_warehouse: boolean;
  certifications: string[];
  contact: string | null;
  platform: string;
  created_at: string;
}

export interface CompetitorStore {
  id: string;
  store_name: string;
  platform: string;
  url: string;
  est_monthly_sales: number | null;
  primary_traffic: string | null;
  ad_active: boolean;
  bundle_strategy: string | null;
  success_score: number;
  created_at: string;
}

export interface FinancialModel {
  id: string;
  product_id: string;
  retail_price: number;
  total_cost: number;
  gross_margin: number;
  break_even_units: number;
  influencer_roi: number | null;
  ad_roas_estimate: number | null;
  revenue_30day: number | null;
  revenue_60day: number | null;
  revenue_90day: number | null;
  created_at: string;
}

export interface LaunchBlueprint {
  id: string;
  product_id: string;
  positioning: string;
  product_page_content: string;
  pricing_strategy: string;
  video_script: string;
  ad_blueprint: string;
  launch_timeline: string;
  risk_notes: string;
  generated_at: string;
  generated_by: string;
}

export interface ProductAllocation {
  id: string;
  client_id: string;
  product_id: string;
  platform: string;
  rank: number;
  visible_to_client: boolean;
  allocated_at: string;
  allocated_by: string;
  source: "default_package" | "request_fulfilled";
  notes: string | null;
  status: string;
}

export interface ProductRequest {
  id: string;
  client_id: string;
  platform: string;
  note: string | null;
  status: "pending" | "reviewed" | "fulfilled";
  requested_at: string;
  reviewed_at: string | null;
  fulfilled_at: string | null;
  fulfilled_by: string | null;
  products_released: number;
}

export interface AutomationJob {
  id: string;
  job_name: string;
  status: "disabled" | "enabled" | "running" | "completed" | "failed";
  trigger_type: "manual" | "scheduled";
  started_at: string | null;
  completed_at: string | null;
  records_processed: number;
  api_cost_estimate: number;
  error_log: string | null;
}

export interface ScanHistory {
  id: string;
  scan_mode: "quick" | "full" | "client";
  client_id: string | null;
  started_at: string;
  completed_at: string | null;
  products_found: number;
  hot_products: number;
  cost_estimate: number;
  triggered_by: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  product_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      admin_settings: {
        Row: AdminSetting;
        Insert: Omit<AdminSetting, "id" | "updated_at">;
        Update: Partial<Omit<AdminSetting, "id">>;
      };
    };
  };
}
