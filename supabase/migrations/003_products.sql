-- Phase 4: Products table and scoring system

CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived', 'enriching');
CREATE TYPE product_platform AS ENUM ('tiktok', 'amazon', 'shopify', 'manual');

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  platform product_platform NOT NULL DEFAULT 'manual',
  status product_status NOT NULL DEFAULT 'draft',
  category TEXT,

  -- Pricing
  price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  margin_percent DECIMAL(5, 2),

  -- Scoring (0-100)
  score_overall INTEGER DEFAULT 0,
  score_demand INTEGER DEFAULT 0,
  score_competition INTEGER DEFAULT 0,
  score_margin INTEGER DEFAULT 0,
  score_trend INTEGER DEFAULT 0,

  -- External references
  external_id TEXT,
  external_url TEXT,
  image_url TEXT,

  -- Enrichment data
  enrichment_data JSONB DEFAULT '{}',
  enriched_at TIMESTAMPTZ,

  -- AI analysis
  ai_summary TEXT,
  ai_blueprint JSONB,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Ownership
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Clients can view active products
CREATE POLICY "Clients can view active products"
  ON products FOR SELECT
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client'
    )
  );

-- Indexes
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_platform ON products(platform);
CREATE INDEX idx_products_score ON products(score_overall DESC);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_by ON products(created_by);

-- Updated at trigger
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
