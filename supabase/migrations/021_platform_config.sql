-- Migration 021: platform_config table
-- Stores per-platform configuration (display names, pricing, enabled state)
-- Referenced in v7 spec Section 3.2
-- Safe to re-run (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  base_price INTEGER DEFAULT 0,
  description TEXT,
  icon TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_config_platform ON platform_config(platform);

ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

-- Admins can manage platform configuration
DROP POLICY IF EXISTS "Admins can manage platform_config" ON platform_config;
CREATE POLICY "Admins can manage platform_config" ON platform_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- All authenticated users can read platform config
DROP POLICY IF EXISTS "Authenticated users can read platform_config" ON platform_config;
CREATE POLICY "Authenticated users can read platform_config" ON platform_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- Seed default platform configuration matching v7 spec Section 2.2
INSERT INTO platform_config (platform, display_name, base_price, description) VALUES
  ('tiktok', 'TikTok Shop', 29, 'Impulse purchase products via TikTok Shop'),
  ('amazon', 'Amazon FBA', 49, 'Search-driven products via Amazon FBA'),
  ('shopify', 'Shopify DTC', 39, 'Direct-to-consumer Shopify stores'),
  ('pinterest', 'Pinterest Commerce', 29, 'Visual discovery products via Pinterest'),
  ('digital', 'Digital Products', 19, 'Templates, courses, AI prompts, tools'),
  ('ai_affiliate', 'AI Affiliate Programs', 29, 'Commission-based AI SaaS affiliate programs'),
  ('physical_affiliate', 'Physical Affiliate', 19, 'TikTok Shop and Amazon affiliate products')
ON CONFLICT (platform) DO NOTHING;
