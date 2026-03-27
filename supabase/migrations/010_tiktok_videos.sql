-- ============================================================
-- 010_tiktok_videos.sql
-- Phase 1 — TikTok Intelligence: video discovery table
-- ============================================================

CREATE TABLE IF NOT EXISTS tiktok_videos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id      text NOT NULL,
  url           text NOT NULL,
  description   text,
  author_username text,
  author_id     text,
  author_followers bigint DEFAULT 0,

  -- Engagement signals
  views         bigint DEFAULT 0,
  likes         bigint DEFAULT 0,
  shares        bigint DEFAULT 0,
  comments      bigint DEFAULT 0,

  -- Content metadata
  hashtags      text[] DEFAULT '{}',
  music_title   text,
  thumbnail_url text,

  -- Product signals
  product_urls  text[] DEFAULT '{}',
  has_product_link boolean DEFAULT false,

  -- Discovery metadata
  discovery_query text,
  discovered_at   timestamptz DEFAULT now(),
  create_time     timestamptz,

  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),

  -- Unique constraint: one row per TikTok video
  CONSTRAINT tiktok_videos_video_id_key UNIQUE (video_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_discovered_at ON tiktok_videos (discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_views ON tiktok_videos (views DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_has_product ON tiktok_videos (has_product_link) WHERE has_product_link = true;
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_hashtags ON tiktok_videos USING gin (hashtags);

-- RLS
ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;

-- Admin-only read policy (service role bypasses RLS)
CREATE POLICY "admin_read_tiktok_videos" ON tiktok_videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_tiktok_videos_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tiktok_videos_updated_at
  BEFORE UPDATE ON tiktok_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_tiktok_videos_updated_at();
