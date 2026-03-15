-- ============================================================
-- Migration 020: RLS Security Fixes
-- QA-B9-001: Drop service_role_all_* policies that disable RLS
-- QA-B9-002: Fix product_requests client policy to SELECT+INSERT only
-- ============================================================

-- ============================================================
-- QA-B9-001: Drop USING(true) policies on 6 tables
-- These policies effectively disable RLS for ALL authenticated users.
-- Service role bypasses RLS automatically — no policy needed.
-- ============================================================

-- tiktok_videos
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_videos' AND policyname = 'service_role_all_tiktok_videos') THEN
    DROP POLICY "service_role_all_tiktok_videos" ON tiktok_videos;
  END IF;
END $$;

-- tiktok_hashtag_signals
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_hashtag_signals' AND policyname = 'service_role_all_hashtag_signals') THEN
    DROP POLICY "service_role_all_hashtag_signals" ON tiktok_hashtag_signals;
  END IF;
END $$;

-- product_clusters
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_clusters' AND policyname = 'service_role_all_clusters') THEN
    DROP POLICY "service_role_all_clusters" ON product_clusters;
  END IF;
END $$;

-- product_cluster_members
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_cluster_members' AND policyname = 'service_role_all_cluster_members') THEN
    DROP POLICY "service_role_all_cluster_members" ON product_cluster_members;
  END IF;
END $$;

-- creator_product_matches
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creator_product_matches' AND policyname = 'service_role_all_creator_matches') THEN
    DROP POLICY "service_role_all_creator_matches" ON creator_product_matches;
  END IF;
END $$;

-- ads
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ads' AND policyname = 'service_role_all_ads') THEN
    DROP POLICY "service_role_all_ads" ON ads;
  END IF;
END $$;

-- ============================================================
-- QA-B9-002: Fix product_requests client policy
-- Was FOR ALL (select+insert+update+delete) — clients should only
-- be able to SELECT their requests and INSERT new ones.
-- Admin manages approve/reject via admin policy.
-- ============================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Clients can manage own requests" ON product_requests;

-- Client can read their own requests
CREATE POLICY "Clients can read own requests" ON product_requests
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
  );

-- Client can insert new requests
CREATE POLICY "Clients can create requests" ON product_requests
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
  );
