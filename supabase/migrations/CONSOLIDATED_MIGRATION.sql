-- ============================================================
-- YouSell Admin: CONSOLIDATED MIGRATION
-- Run this entire file in Supabase SQL Editor
-- (Dashboard > SQL Editor > New query > Paste > Run)
--
-- This is IDEMPOTENT — safe to run multiple times.
-- Combines all migrations: 001 through 008 + seed data
-- ============================================================

-- ============================================================
-- PHASE 1: Utility Functions
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PHASE 2: Profiles + RBAC (from 001_profiles_and_rbac.sql)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client', 'viewer')),
  avatar_url TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Admin settings
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;
CREATE POLICY "Admins can manage settings"
  ON admin_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- PHASE 3: Products (from 003_products.sql)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived', 'enriching');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE product_platform AS ENUM ('tiktok', 'amazon', 'shopify', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Extend platform enum for all 7 channels
DO $$ BEGIN
  ALTER TYPE product_platform ADD VALUE IF NOT EXISTS 'pinterest';
  ALTER TYPE product_platform ADD VALUE IF NOT EXISTS 'digital';
  ALTER TYPE product_platform ADD VALUE IF NOT EXISTS 'ai_affiliate';
  ALTER TYPE product_platform ADD VALUE IF NOT EXISTS 'physical_affiliate';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  platform product_platform NOT NULL DEFAULT 'manual',
  status product_status NOT NULL DEFAULT 'draft',
  category TEXT,
  price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  currency TEXT NOT NULL DEFAULT 'GBP',
  margin_percent DECIMAL(5, 2),
  score_overall INTEGER DEFAULT 0,
  score_demand INTEGER DEFAULT 0,
  score_competition INTEGER DEFAULT 0,
  score_margin INTEGER DEFAULT 0,
  score_trend INTEGER DEFAULT 0,
  external_id TEXT,
  external_url TEXT,
  image_url TEXT,
  source TEXT,
  sales_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  url TEXT,
  enrichment_data JSONB DEFAULT '{}',
  enriched_at TIMESTAMPTZ,
  ai_summary TEXT,
  ai_blueprint JSONB,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  channel TEXT,
  final_score INTEGER DEFAULT 0,
  trend_score INTEGER DEFAULT 0,
  viral_score INTEGER DEFAULT 0,
  profit_score INTEGER DEFAULT 0,
  trend_stage TEXT CHECK (trend_stage IN ('emerging', 'rising', 'exploding', 'saturated')),
  ai_insight_haiku TEXT,
  ai_insight_sonnet TEXT,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Clients can view active products" ON products;
CREATE POLICY "Clients can view active products" ON products FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_products_score ON products(score_overall DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_final_score ON products(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_viral_score ON products(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_channel ON products(channel);

-- Upsert support
DO $$ BEGIN
  ALTER TABLE products ADD CONSTRAINT products_source_external_id_unique UNIQUE (source, external_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_source_created_at ON products(source, created_at DESC);

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PHASE 4: Trends + Competitors (from 004_trends_competitors.sql)
-- ============================================================
CREATE TABLE IF NOT EXISTS trend_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  category TEXT,
  volume INTEGER DEFAULT 0,
  trend_direction TEXT CHECK (trend_direction IN ('rising', 'stable', 'declining')) DEFAULT 'stable',
  trend_score INTEGER DEFAULT 0,
  related_keywords TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'pytrends',
  data JSONB DEFAULT '{}',
  last_checked_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE trend_keywords ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage trends" ON trend_keywords;
CREATE POLICY "Admins can manage trends" ON trend_keywords FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_trends_keyword ON trend_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_trends_score ON trend_keywords(trend_score DESC);
DROP TRIGGER IF EXISTS trends_updated_at ON trend_keywords;
CREATE TRIGGER trends_updated_at BEFORE UPDATE ON trend_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT,
  platform TEXT,
  category TEXT,
  notes TEXT,
  metrics JSONB DEFAULT '{}',
  last_analyzed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage competitors" ON competitors;
CREATE POLICY "Admins can manage competitors" ON competitors FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE INDEX IF NOT EXISTS idx_competitors_name ON competitors(name);
DROP TRIGGER IF EXISTS competitors_updated_at ON competitors;
CREATE TRIGGER competitors_updated_at BEFORE UPDATE ON competitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PHASE 5: Clients (with package tiers per Section 10)
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

-- Ensure default_product_limit column exists on older installs
ALTER TABLE clients ADD COLUMN IF NOT EXISTS default_product_limit INTEGER NOT NULL DEFAULT 3;

-- ============================================================
-- PHASE 6: Product Metrics
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
-- PHASE 7: Viral Signals (6 weighted signals per Section 5)
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
-- PHASE 8: Influencers (per Section 8)
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
-- PHASE 9: Product-Influencer junction
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
-- PHASE 10: Competitor Stores
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
CREATE INDEX IF NOT EXISTS idx_competitor_stores_product ON competitor_stores(product_id);

-- ============================================================
-- PHASE 11: Suppliers
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
-- PHASE 12: Product-Supplier junction
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
-- PHASE 13: Financial Models (per Section 6 — 5 auto-rejection rules)
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
CREATE INDEX IF NOT EXISTS idx_financial_models_product ON financial_models(product_id);

-- ============================================================
-- PHASE 14: Marketing Strategies
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
-- PHASE 15: Launch Blueprints (Sonnet-generated, on-demand only)
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
-- PHASE 16: Affiliate Programs (per Section 7)
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
-- PHASE 17: Product Allocations (visibility-controlled per Section 10)
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
CREATE INDEX IF NOT EXISTS idx_product_allocations_client ON product_allocations(client_id);

-- ============================================================
-- PHASE 18: Product Requests (client-initiated)
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
-- Client RLS: clients can create/view own requests (from 008_client_rls_fix.sql)
DROP POLICY IF EXISTS "Clients can manage own requests" ON product_requests;
CREATE POLICY "Clients can manage own requests" ON product_requests
  FOR ALL USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);

-- ============================================================
-- PHASE 19: Automation Jobs (ALL disabled by default)
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

-- Seed default automation jobs (ALL disabled per spec)
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
-- PHASE 20: Scan History
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
CREATE INDEX IF NOT EXISTS idx_scan_history_mode ON scan_history(scan_mode, started_at DESC);

-- Legacy scans table (from 001_initial_schema)
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID REFERENCES profiles(id),
  job_id TEXT,
  product_count INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scans_job_id ON scans(job_id);

-- ============================================================
-- PHASE 21: Outreach Emails (via Resend)
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
-- PHASE 22: Notifications (realtime via Supabase)
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
-- PHASE 23: Imported Files
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

-- Legacy allocations + blueprints tables (from 001_initial_schema)
CREATE TABLE IF NOT EXISTS allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  product_id UUID NOT NULL REFERENCES products(id),
  allocated_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active',
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_allocations_client_status ON allocations(client_id, status);

CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  strategy TEXT,
  target_audience TEXT,
  marketing_plan TEXT,
  pricing_strategy TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHASE 24: Seed Data — 13 AI Affiliate Programs (Section 7)
-- ============================================================
INSERT INTO affiliate_programs (name, platform, commission_rate, recurring, cookie_days, network, niche_tags) VALUES
  ('Jasper AI', 'jasper.ai', 30.00, true, 30, 'PartnerStack', ARRAY['ai', 'writing', 'marketing']),
  ('Copy.ai', 'copy.ai', 45.00, false, 60, 'Direct', ARRAY['ai', 'writing', 'copywriting']),
  ('Synthesia', 'synthesia.io', 25.00, true, 30, 'PartnerStack', ARRAY['ai', 'video', 'marketing']),
  ('Notion', 'notion.so', 50.00, false, 30, 'Direct', ARRAY['productivity', 'ai', 'templates']),
  ('Canva Pro', 'canva.com', 36.00, false, 30, 'Impact', ARRAY['design', 'ai', 'marketing']),
  ('Midjourney', 'midjourney.com', 0.00, false, 0, 'None', ARRAY['ai', 'image', 'art']),
  ('ChatGPT Plus', 'openai.com', 0.00, false, 0, 'None', ARRAY['ai', 'chatbot', 'productivity']),
  ('Descript', 'descript.com', 25.00, true, 30, 'PartnerStack', ARRAY['ai', 'video', 'audio']),
  ('Runway ML', 'runwayml.com', 20.00, false, 30, 'Direct', ARRAY['ai', 'video', 'creative']),
  ('Pictory', 'pictory.ai', 30.00, true, 30, 'PartnerStack', ARRAY['ai', 'video', 'marketing']),
  ('Writesonic', 'writesonic.com', 30.00, true, 60, 'Direct', ARRAY['ai', 'writing', 'seo']),
  ('Lumen5', 'lumen5.com', 25.00, true, 30, 'PartnerStack', ARRAY['ai', 'video', 'marketing']),
  ('Surfer SEO', 'surferseo.com', 25.00, true, 30, 'PartnerStack', ARRAY['ai', 'seo', 'content'])
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE: All 24 phases complete
-- Tables: profiles, admin_settings, products, trend_keywords,
--         competitors, clients, product_metrics, viral_signals,
--         influencers, product_influencers, competitor_stores,
--         suppliers, product_suppliers, financial_models,
--         marketing_strategies, launch_blueprints, affiliate_programs,
--         product_allocations, product_requests, automation_jobs,
--         scan_history, scans, outreach_emails, notifications,
--         imported_files, allocations, blueprints
-- ============================================================
