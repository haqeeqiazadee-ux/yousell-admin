-- ============================================================
-- 028_create_missing_tables_catchup.sql
-- Catch-up migration: creates 4 tables that were defined in
-- migrations 010-013 but never applied to the live database.
-- All statements use IF NOT EXISTS for idempotency.
-- ============================================================

-- 0. Ensure super_admin enum value exists (from 022, may not have been applied)
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block.
-- In the Supabase SQL Editor, run this line SEPARATELY first if it fails:
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- 1. tiktok_videos (from 010)
CREATE TABLE IF NOT EXISTS tiktok_videos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id      text NOT NULL,
  url           text NOT NULL,
  description   text,
  author_username text,
  author_id     text,
  author_followers bigint DEFAULT 0,
  views         bigint DEFAULT 0,
  likes         bigint DEFAULT 0,
  shares        bigint DEFAULT 0,
  comments      bigint DEFAULT 0,
  hashtags      text[] DEFAULT '{}',
  music_title   text,
  thumbnail_url text,
  product_urls  text[] DEFAULT '{}',
  has_product_link boolean DEFAULT false,
  discovery_query text,
  discovered_at   timestamptz DEFAULT now(),
  create_time     timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT tiktok_videos_video_id_key UNIQUE (video_id)
);

CREATE INDEX IF NOT EXISTS idx_tiktok_videos_discovered_at ON tiktok_videos (discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_views ON tiktok_videos (views DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_has_product ON tiktok_videos (has_product_link) WHERE has_product_link = true;
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_hashtags ON tiktok_videos USING gin (hashtags);

ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_videos' AND policyname = 'admin_read_tiktok_videos') THEN
    CREATE POLICY "admin_read_tiktok_videos" ON tiktok_videos
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_tiktok_videos_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tiktok_videos_updated_at ON tiktok_videos;
CREATE TRIGGER trg_tiktok_videos_updated_at
  BEFORE UPDATE ON tiktok_videos FOR EACH ROW
  EXECUTE FUNCTION update_tiktok_videos_updated_at();


-- 2. tiktok_hashtag_signals (from 011)
CREATE TABLE IF NOT EXISTS tiktok_hashtag_signals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag       text NOT NULL,
  total_videos  integer DEFAULT 0,
  total_views   bigint DEFAULT 0,
  total_likes   bigint DEFAULT 0,
  total_shares  bigint DEFAULT 0,
  total_comments bigint DEFAULT 0,
  unique_creators integer DEFAULT 0,
  video_growth_rate  numeric(8,4) DEFAULT 0,
  view_velocity      numeric(12,2) DEFAULT 0,
  creator_growth_rate numeric(8,4) DEFAULT 0,
  engagement_rate    numeric(8,4) DEFAULT 0,
  product_video_pct  numeric(5,2) DEFAULT 0,
  snapshot_at   timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz DEFAULT now(),
  CONSTRAINT tiktok_hashtag_signals_unique UNIQUE (hashtag, snapshot_at)
);

CREATE INDEX IF NOT EXISTS idx_hashtag_signals_hashtag ON tiktok_hashtag_signals (hashtag);
CREATE INDEX IF NOT EXISTS idx_hashtag_signals_snapshot ON tiktok_hashtag_signals (snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_hashtag_signals_velocity ON tiktok_hashtag_signals (view_velocity DESC);

ALTER TABLE tiktok_hashtag_signals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_hashtag_signals' AND policyname = 'admin_read_hashtag_signals') THEN
    CREATE POLICY "admin_read_hashtag_signals" ON tiktok_hashtag_signals
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;


-- 3. product_clusters + junction table (from 012)
CREATE TABLE IF NOT EXISTS product_clusters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  keywords        text[] DEFAULT '{}',
  product_count   integer DEFAULT 0,
  avg_score       numeric(5,2) DEFAULT 0,
  platforms       text[] DEFAULT '{}',
  trend_stage     text DEFAULT 'emerging',
  total_views     bigint DEFAULT 0,
  total_sales     bigint DEFAULT 0,
  price_range_min numeric(10,2) DEFAULT 0,
  price_range_max numeric(10,2) DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  CONSTRAINT product_clusters_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS product_cluster_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id  uuid NOT NULL REFERENCES product_clusters(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  similarity  numeric(5,4) DEFAULT 0,
  added_at    timestamptz DEFAULT now(),
  CONSTRAINT product_cluster_members_unique UNIQUE (cluster_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_clusters_trend ON product_clusters (trend_stage);
CREATE INDEX IF NOT EXISTS idx_product_clusters_score ON product_clusters (avg_score DESC);
CREATE INDEX IF NOT EXISTS idx_cluster_members_product ON product_cluster_members (product_id);
CREATE INDEX IF NOT EXISTS idx_cluster_members_cluster ON product_cluster_members (cluster_id);

ALTER TABLE product_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_cluster_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_clusters' AND policyname = 'admin_read_clusters') THEN
    CREATE POLICY "admin_read_clusters" ON product_clusters
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_cluster_members' AND policyname = 'admin_read_cluster_members') THEN
    CREATE POLICY "admin_read_cluster_members" ON product_cluster_members
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;


-- 4. creator_product_matches (from 013)
CREATE TABLE IF NOT EXISTS creator_product_matches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  influencer_id   uuid NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  match_score     numeric(5,2) DEFAULT 0,
  niche_alignment numeric(5,2) DEFAULT 0,
  engagement_fit  numeric(5,2) DEFAULT 0,
  price_range_fit numeric(5,2) DEFAULT 0,
  estimated_views      bigint DEFAULT 0,
  estimated_conversions integer DEFAULT 0,
  estimated_profit     numeric(10,2) DEFAULT 0,
  status          text DEFAULT 'suggested',
  matched_at      timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now(),
  CONSTRAINT creator_product_matches_unique UNIQUE (product_id, influencer_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_matches_product ON creator_product_matches (product_id);
CREATE INDEX IF NOT EXISTS idx_creator_matches_score ON creator_product_matches (match_score DESC);

ALTER TABLE creator_product_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_product_matches' AND policyname = 'admin_read_creator_matches') THEN
    CREATE POLICY "admin_read_creator_matches" ON creator_product_matches
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;


-- ============================================================
-- ADMIN INSERT/UPDATE/DELETE policies for all 4 tables
-- (service role bypasses RLS, but admin API routes need these)
-- ============================================================

DO $$ BEGIN
  -- tiktok_videos: admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_videos' AND policyname = 'admin_write_tiktok_videos') THEN
    CREATE POLICY "admin_write_tiktok_videos" ON tiktok_videos
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;

  -- tiktok_hashtag_signals: admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_hashtag_signals' AND policyname = 'admin_write_hashtag_signals') THEN
    CREATE POLICY "admin_write_hashtag_signals" ON tiktok_hashtag_signals
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;

  -- product_clusters: admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_clusters' AND policyname = 'admin_write_clusters') THEN
    CREATE POLICY "admin_write_clusters" ON product_clusters
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;

  -- product_cluster_members: admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_cluster_members' AND policyname = 'admin_write_cluster_members') THEN
    CREATE POLICY "admin_write_cluster_members" ON product_cluster_members
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;

  -- creator_product_matches: admin write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_product_matches' AND policyname = 'admin_write_creator_matches') THEN
    CREATE POLICY "admin_write_creator_matches" ON creator_product_matches
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;
