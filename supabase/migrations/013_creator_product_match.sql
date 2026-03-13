-- ============================================================
-- 013_creator_product_match.sql
-- Phase 3 — Creator Intelligence: matching table
-- ============================================================

CREATE TABLE IF NOT EXISTS creator_product_matches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  influencer_id   uuid NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,

  -- Match quality
  match_score     numeric(5,2) DEFAULT 0,
  niche_alignment numeric(5,2) DEFAULT 0,
  engagement_fit  numeric(5,2) DEFAULT 0,
  price_range_fit numeric(5,2) DEFAULT 0,

  -- ROI projection (v7 spec Section 30.2)
  estimated_views      bigint DEFAULT 0,
  estimated_conversions integer DEFAULT 0,
  estimated_profit     numeric(10,2) DEFAULT 0,

  status          text DEFAULT 'suggested',  -- suggested, approved, rejected, contacted
  matched_at      timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now(),

  CONSTRAINT creator_product_matches_unique UNIQUE (product_id, influencer_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_matches_product ON creator_product_matches (product_id);
CREATE INDEX IF NOT EXISTS idx_creator_matches_score ON creator_product_matches (match_score DESC);

ALTER TABLE creator_product_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_creator_matches" ON creator_product_matches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );
