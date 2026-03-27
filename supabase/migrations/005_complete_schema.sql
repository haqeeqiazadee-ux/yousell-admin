-- Phase 4: Complete database schema — all missing tables per spec
-- Run this in Supabase SQL Editor
-- IDEMPOTENT: safe to run multiple times

-- ============================================================
-- 1. ALTER existing products table to add missing columns
-- ============================================================
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS channel TEXT;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS final_score INTEGER DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS trend_score INTEGER DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS viral_score INTEGER DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS profit_score INTEGER DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS trend_stage TEXT CHECK (trend_stage IN ('emerging', 'rising', 'exploding', 'saturated'));
  ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_insight_haiku TEXT;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS ai_insight_sonnet TEXT;
END $$;

-- Update platform enum
DO $$ BEGIN
  ALTER TYPE product_platform ADD VALUE IF NOT EXISTS 'pinterest';
  ALTER TYPE product_platform ADD VALUE IF NOT EXISTS 'digital';
  ALTER TYPE product_platform ADD VALUE IF NOT EXISTS 'ai_affiliate';
  ALTER TYPE product_platform ADD VALUE IF NOT EXISTS 'physical_affiliate';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add push_token to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- ============================================================
-- 2. CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'professional', 'enterprise')),
  default_product_limit INTEGER NOT NULL DEFAULT 3,
  niche TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage clients" ON clients;
CREATE POLICY "Admins can manage clients" ON clients FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 3. PRODUCT_METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE product_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage product_metrics" ON product_metrics;
CREATE POLICY "Admins can manage product_metrics" ON product_metrics FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_product_metrics_product ON product_metrics(product_id, recorded_at);

-- ============================================================
-- 4. VIRAL_SIGNALS
-- ============================================================
CREATE TABLE IF NOT EXISTS viral_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  scan_id UUID,
  micro_influencer_convergence DECIMAL(5,2) DEFAULT 0,
  comment_purchase_intent DECIMAL(5,2) DEFAULT 0,
  hashtag_acceleration DECIMAL(5,2) DEFAULT 0,
  creator_niche_expansion DECIMAL(5,2) DEFAULT 0,
  engagement_velocity DECIMAL(5,2) DEFAULT 0,
  supply_side_response DECIMAL(5,2) DEFAULT 0,
  early_viral_score DECIMAL(5,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE viral_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage viral_signals" ON viral_signals;
CREATE POLICY "Admins can manage viral_signals" ON viral_signals FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_viral_signals_product ON viral_signals(product_id);

-- ============================================================
-- 5. INFLUENCERS
-- ============================================================
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  platform TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  tier TEXT CHECK (tier IN ('nano', 'micro', 'mid', 'macro')),
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  us_audience_pct DECIMAL(5,2) DEFAULT 0,
  fake_follower_pct DECIMAL(5,2) DEFAULT 0,
  conversion_score DECIMAL(5,2) DEFAULT 0,
  email TEXT,
  cpp_estimate DECIMAL(10,2),
  niche TEXT,
  commission_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage influencers" ON influencers;
CREATE POLICY "Admins can manage influencers" ON influencers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_influencers_platform ON influencers(platform);
CREATE INDEX IF NOT EXISTS idx_influencers_tier ON influencers(tier);

-- ============================================================
-- 6. PRODUCT_INFLUENCERS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  video_urls TEXT[] DEFAULT '{}',
  match_score DECIMAL(5,2) DEFAULT 0,
  outreach_status TEXT DEFAULT 'pending' CHECK (outreach_status IN ('pending', 'sent', 'replied', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE product_influencers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage product_influencers" ON product_influencers;
CREATE POLICY "Admins can manage product_influencers" ON product_influencers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 7. COMPETITOR_STORES
-- ============================================================
CREATE TABLE IF NOT EXISTS competitor_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  store_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT,
  est_monthly_sales DECIMAL(12,2),
  primary_traffic TEXT,
  influencers_promoting TEXT[] DEFAULT '{}',
  ad_active BOOLEAN DEFAULT false,
  pricing_strategy TEXT,
  bundle_strategy TEXT,
  success_score INTEGER DEFAULT 0,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE competitor_stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage competitor_stores" ON competitor_stores;
CREATE POLICY "Admins can manage competitor_stores" ON competitor_stores FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 8. SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'CN',
  moq INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  lead_time INTEGER DEFAULT 0,
  white_label BOOLEAN DEFAULT false,
  dropship BOOLEAN DEFAULT false,
  us_warehouse BOOLEAN DEFAULT false,
  certifications TEXT[] DEFAULT '{}',
  contact TEXT,
  platform TEXT NOT NULL DEFAULT 'alibaba',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage suppliers" ON suppliers;
CREATE POLICY "Admins can manage suppliers" ON suppliers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 9. PRODUCT_SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE product_suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage product_suppliers" ON product_suppliers;
CREATE POLICY "Admins can manage product_suppliers" ON product_suppliers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 10. FINANCIAL_MODELS
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  retail_price DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  gross_margin DECIMAL(5,2) NOT NULL,
  break_even_units INTEGER DEFAULT 0,
  influencer_roi DECIMAL(5,2),
  ad_roas_estimate DECIMAL(5,2),
  revenue_30day DECIMAL(12,2),
  revenue_60day DECIMAL(12,2),
  revenue_90day DECIMAL(12,2),
  cost_breakdown JSONB DEFAULT '{}',
  risk_flags TEXT[] DEFAULT '{}',
  auto_rejected BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE financial_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage financial_models" ON financial_models;
CREATE POLICY "Admins can manage financial_models" ON financial_models FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 11. MARKETING_STRATEGIES
-- ============================================================
CREATE TABLE IF NOT EXISTS marketing_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  primary_channel TEXT,
  secondary_channel TEXT,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  roas_estimate DECIMAL(5,2),
  ai_brief TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE marketing_strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage marketing_strategies" ON marketing_strategies;
CREATE POLICY "Admins can manage marketing_strategies" ON marketing_strategies FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 12. LAUNCH_BLUEPRINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS launch_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  positioning TEXT,
  product_page_content TEXT,
  pricing_strategy TEXT,
  video_script TEXT,
  ad_blueprint TEXT,
  launch_timeline TEXT,
  risk_notes TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by TEXT NOT NULL DEFAULT 'claude-sonnet'
);
ALTER TABLE launch_blueprints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage launch_blueprints" ON launch_blueprints;
CREATE POLICY "Admins can manage launch_blueprints" ON launch_blueprints FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 13. AFFILIATE_PROGRAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  recurring BOOLEAN DEFAULT false,
  cookie_days INTEGER DEFAULT 30,
  network TEXT,
  join_url TEXT,
  niche_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage affiliate_programs" ON affiliate_programs;
CREATE POLICY "Admins can manage affiliate_programs" ON affiliate_programs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 14. PRODUCT_ALLOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  platform TEXT,
  rank INTEGER DEFAULT 0,
  visible_to_client BOOLEAN DEFAULT false,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  allocated_by UUID REFERENCES profiles(id),
  source TEXT DEFAULT 'default_package' CHECK (source IN ('default_package', 'request_fulfilled')),
  notes TEXT,
  status TEXT DEFAULT 'active',
  UNIQUE(client_id, product_id)
);
ALTER TABLE product_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage product_allocations" ON product_allocations;
CREATE POLICY "Admins can manage product_allocations" ON product_allocations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Clients can view own allocations" ON product_allocations;
CREATE POLICY "Clients can view own allocations" ON product_allocations FOR SELECT
  USING (
    visible_to_client = true AND
    EXISTS (
      SELECT 1 FROM clients c
      JOIN profiles p ON p.email = c.email
      WHERE c.id = product_allocations.client_id AND p.id = auth.uid()
    )
  );

-- ============================================================
-- 15. PRODUCT_REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'fulfilled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES profiles(id),
  products_released INTEGER DEFAULT 0
);
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage product_requests" ON product_requests;
CREATE POLICY "Admins can manage product_requests" ON product_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 16. AUTOMATION_JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'disabled' CHECK (status IN ('disabled', 'enabled', 'running', 'completed', 'failed')),
  trigger_type TEXT DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'scheduled')),
  cron_expression TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  api_cost_estimate DECIMAL(10,4) DEFAULT 0,
  error_log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE automation_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage automation_jobs" ON automation_jobs;
CREATE POLICY "Admins can manage automation_jobs" ON automation_jobs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed default automation jobs (ALL disabled)
INSERT INTO automation_jobs (job_name, status, trigger_type, cron_expression) VALUES
  ('trend_scout_early_viral', 'disabled', 'scheduled', '0 */6 * * *'),
  ('tiktok_product_scan', 'disabled', 'scheduled', '0 2 * * *'),
  ('amazon_bsr_scan', 'disabled', 'scheduled', '0 3 * * *'),
  ('pinterest_trend_scan', 'disabled', 'scheduled', '0 4 * * *'),
  ('google_trends_batch', 'disabled', 'scheduled', '0 5 * * *'),
  ('reddit_demand_signals', 'disabled', 'scheduled', '0 */12 * * *'),
  ('digital_product_scan', 'disabled', 'scheduled', '0 6 * * *'),
  ('ai_affiliate_refresh', 'disabled', 'scheduled', '0 0 * * 1'),
  ('shopify_competitor_scan', 'disabled', 'scheduled', '0 0 * * 2'),
  ('influencer_metric_refresh', 'disabled', 'scheduled', '0 0 * * 3'),
  ('supplier_data_refresh', 'disabled', 'scheduled', '0 0 1 * *')
ON CONFLICT (job_name) DO NOTHING;

-- ============================================================
-- 17. SCAN_HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_mode TEXT NOT NULL CHECK (scan_mode IN ('quick', 'full', 'client')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  products_found INTEGER DEFAULT 0,
  hot_products INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10,4) DEFAULT 0,
  triggered_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  log JSONB DEFAULT '[]'
);
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage scan_history" ON scan_history;
CREATE POLICY "Admins can manage scan_history" ON scan_history FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 18. OUTREACH_EMAILS
-- ============================================================
CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  resend_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'bounced', 'opened', 'clicked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage outreach_emails" ON outreach_emails;
CREATE POLICY "Admins can manage outreach_emails" ON outreach_emails FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 19. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications" ON notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- ============================================================
-- 20. IMPORTED_FILES
-- ============================================================
CREATE TABLE IF NOT EXISTS imported_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  type TEXT NOT NULL,
  source_platform TEXT,
  rows_imported INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE imported_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage imported_files" ON imported_files;
CREATE POLICY "Admins can manage imported_files" ON imported_files FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- ADDITIONAL INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_final_score ON products(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_viral_score ON products(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_channel ON products(channel);
CREATE INDEX IF NOT EXISTS idx_product_allocations_client ON product_allocations(client_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_scan_history_mode ON scan_history(scan_mode, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_stores_product ON competitor_stores(product_id);
CREATE INDEX IF NOT EXISTS idx_financial_models_product ON financial_models(product_id);
