-- Migration 017: Critical security fixes
-- BUG-001: RLS policies only check role='admin', missing 'super_admin'
-- BUG-035: Clients table has no self-read policy
-- Safe to re-run (DROP IF EXISTS + CREATE throughout)

-- ============================================================
-- BUG-001 FIX: Update all admin RLS policies to include super_admin
-- ============================================================

-- Helper: update the admin check condition across all tables
-- Pattern: role IN ('admin', 'super_admin') instead of role = 'admin'

-- clients
DROP POLICY IF EXISTS "Admins can manage clients" ON clients;
CREATE POLICY "Admins can manage clients" ON clients FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- product_metrics
DROP POLICY IF EXISTS "Admins can manage product_metrics" ON product_metrics;
CREATE POLICY "Admins can manage product_metrics" ON product_metrics FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- viral_signals
DROP POLICY IF EXISTS "Admins can manage viral_signals" ON viral_signals;
CREATE POLICY "Admins can manage viral_signals" ON viral_signals FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- influencers
DROP POLICY IF EXISTS "Admins can manage influencers" ON influencers;
CREATE POLICY "Admins can manage influencers" ON influencers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- product_influencers
DROP POLICY IF EXISTS "Admins can manage product_influencers" ON product_influencers;
CREATE POLICY "Admins can manage product_influencers" ON product_influencers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- competitor_stores
DROP POLICY IF EXISTS "Admins can manage competitor_stores" ON competitor_stores;
CREATE POLICY "Admins can manage competitor_stores" ON competitor_stores FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- suppliers
DROP POLICY IF EXISTS "Admins can manage suppliers" ON suppliers;
CREATE POLICY "Admins can manage suppliers" ON suppliers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- product_suppliers
DROP POLICY IF EXISTS "Admins can manage product_suppliers" ON product_suppliers;
CREATE POLICY "Admins can manage product_suppliers" ON product_suppliers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- financial_models
DROP POLICY IF EXISTS "Admins can manage financial_models" ON financial_models;
CREATE POLICY "Admins can manage financial_models" ON financial_models FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- marketing_strategies
DROP POLICY IF EXISTS "Admins can manage marketing_strategies" ON marketing_strategies;
CREATE POLICY "Admins can manage marketing_strategies" ON marketing_strategies FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- launch_blueprints
DROP POLICY IF EXISTS "Admins can manage launch_blueprints" ON launch_blueprints;
CREATE POLICY "Admins can manage launch_blueprints" ON launch_blueprints FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- affiliate_programs
DROP POLICY IF EXISTS "Admins can manage affiliate_programs" ON affiliate_programs;
CREATE POLICY "Admins can manage affiliate_programs" ON affiliate_programs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- product_allocations
DROP POLICY IF EXISTS "Admins can manage product_allocations" ON product_allocations;
CREATE POLICY "Admins can manage product_allocations" ON product_allocations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- product_requests
DROP POLICY IF EXISTS "Admins can manage product_requests" ON product_requests;
CREATE POLICY "Admins can manage product_requests" ON product_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- automation_jobs
DROP POLICY IF EXISTS "Admins can manage automation_jobs" ON automation_jobs;
CREATE POLICY "Admins can manage automation_jobs" ON automation_jobs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- scan_history
DROP POLICY IF EXISTS "Admins can manage scan_history" ON scan_history;
CREATE POLICY "Admins can manage scan_history" ON scan_history FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- outreach_emails
DROP POLICY IF EXISTS "Admins can manage outreach_emails" ON outreach_emails;
CREATE POLICY "Admins can manage outreach_emails" ON outreach_emails FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- notifications (admin policy)
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications" ON notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- imported_files
DROP POLICY IF EXISTS "Admins can manage imported_files" ON imported_files;
CREATE POLICY "Admins can manage imported_files" ON imported_files FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- subscriptions (from 009)
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- platform_access (from 009)
DROP POLICY IF EXISTS "Admins can manage platform_access" ON platform_access;
CREATE POLICY "Admins can manage platform_access" ON platform_access FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- engine_toggles (from 009)
DROP POLICY IF EXISTS "Admins can manage engine_toggles" ON engine_toggles;
CREATE POLICY "Admins can manage engine_toggles" ON engine_toggles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- connected_channels (from 009)
DROP POLICY IF EXISTS "Admins can manage connected_channels" ON connected_channels;
CREATE POLICY "Admins can manage connected_channels" ON connected_channels FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- content_queue (from 009)
DROP POLICY IF EXISTS "Admins can manage content_queue" ON content_queue;
CREATE POLICY "Admins can manage content_queue" ON content_queue FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- orders (from 009)
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- usage_tracking (from 009)
DROP POLICY IF EXISTS "Admins can manage usage_tracking" ON usage_tracking;
CREATE POLICY "Admins can manage usage_tracking" ON usage_tracking FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- addons (from 009)
DROP POLICY IF EXISTS "Admins can manage addons" ON addons;
CREATE POLICY "Admins can manage addons" ON addons FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- tiktok_videos (from 010)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tiktok_videos') THEN
    DROP POLICY IF EXISTS "Admins can manage tiktok_videos" ON tiktok_videos;
    CREATE POLICY "Admins can manage tiktok_videos" ON tiktok_videos FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
  END IF;
END $$;

-- tiktok_hashtag_signals (from 011)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tiktok_hashtag_signals') THEN
    DROP POLICY IF EXISTS "Admins can manage tiktok_hashtag_signals" ON tiktok_hashtag_signals;
    CREATE POLICY "Admins can manage tiktok_hashtag_signals" ON tiktok_hashtag_signals FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
  END IF;
END $$;

-- product_clusters (from 012)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'product_clusters') THEN
    DROP POLICY IF EXISTS "Admins can manage product_clusters" ON product_clusters;
    CREATE POLICY "Admins can manage product_clusters" ON product_clusters FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
  END IF;
END $$;

-- creator_product_matches (from 013)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'creator_product_matches') THEN
    DROP POLICY IF EXISTS "Admins can manage creator_product_matches" ON creator_product_matches;
    CREATE POLICY "Admins can manage creator_product_matches" ON creator_product_matches FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
  END IF;
END $$;

-- ads (from 014)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ads') THEN
    DROP POLICY IF EXISTS "Admins can manage ads" ON ads;
    CREATE POLICY "Admins can manage ads" ON ads FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
  END IF;
END $$;


-- ============================================================
-- BUG-035 FIX: Clients can read their own record
-- ============================================================
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
CREATE POLICY "Clients can view own record" ON clients
  FOR SELECT USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Also add client self-read for product_requests
DROP POLICY IF EXISTS "Clients can manage own requests" ON product_requests;
CREATE POLICY "Clients can manage own requests" ON product_requests
  FOR ALL USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
  );
