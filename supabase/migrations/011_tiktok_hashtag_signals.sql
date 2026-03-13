-- ============================================================
-- 011_tiktok_hashtag_signals.sql
-- Phase 1 — TikTok Intelligence: hashtag velocity tracking
-- ============================================================

-- Tracks hashtag performance over time to detect velocity changes
CREATE TABLE IF NOT EXISTS tiktok_hashtag_signals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag       text NOT NULL,

  -- Aggregate metrics at snapshot time
  total_videos  integer DEFAULT 0,
  total_views   bigint DEFAULT 0,
  total_likes   bigint DEFAULT 0,
  total_shares  bigint DEFAULT 0,
  total_comments bigint DEFAULT 0,
  unique_creators integer DEFAULT 0,

  -- Velocity metrics (computed vs previous snapshot)
  video_growth_rate  numeric(8,4) DEFAULT 0,   -- % new videos since last snapshot
  view_velocity      numeric(12,2) DEFAULT 0,  -- avg views per video per hour
  creator_growth_rate numeric(8,4) DEFAULT 0,   -- % new creators since last snapshot
  engagement_rate    numeric(8,4) DEFAULT 0,    -- (likes+comments+shares) / views

  -- Product signal
  product_video_pct  numeric(5,2) DEFAULT 0,   -- % of videos with product links

  snapshot_at   timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz DEFAULT now(),

  -- Allow multiple snapshots per hashtag (time-series)
  CONSTRAINT tiktok_hashtag_signals_unique UNIQUE (hashtag, snapshot_at)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hashtag_signals_hashtag ON tiktok_hashtag_signals (hashtag);
CREATE INDEX IF NOT EXISTS idx_hashtag_signals_snapshot ON tiktok_hashtag_signals (snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_hashtag_signals_velocity ON tiktok_hashtag_signals (view_velocity DESC);

-- RLS
ALTER TABLE tiktok_hashtag_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_hashtag_signals" ON tiktok_hashtag_signals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
