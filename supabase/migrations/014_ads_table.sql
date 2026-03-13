-- ============================================================
-- 014_ads_table.sql
-- Phase 5 — Ad Intelligence: ad campaigns table
-- ============================================================

CREATE TABLE IF NOT EXISTS ads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     text NOT NULL,
  platform        text NOT NULL,
  advertiser_name text,
  ad_text         text,
  landing_url     text,
  thumbnail_url   text,

  -- Performance metrics
  impressions     bigint DEFAULT 0,
  spend_estimate  numeric(10,2) DEFAULT 0,
  days_running    integer DEFAULT 0,
  is_scaling      boolean DEFAULT false,

  -- Discovery metadata
  discovery_query text,
  discovered_at   timestamptz DEFAULT now(),

  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),

  CONSTRAINT ads_external_platform_key UNIQUE (external_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_ads_platform ON ads (platform);
CREATE INDEX IF NOT EXISTS idx_ads_scaling ON ads (is_scaling) WHERE is_scaling = true;
CREATE INDEX IF NOT EXISTS idx_ads_impressions ON ads (impressions DESC);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_ads" ON ads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

-- Add missing columns to competitors for Shopify intelligence
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS product_count integer DEFAULT 0;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS niche text;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS discovered_at timestamptz DEFAULT now();
ALTER TABLE competitors ADD CONSTRAINT IF NOT EXISTS competitors_name_platform_key UNIQUE (name, platform);
