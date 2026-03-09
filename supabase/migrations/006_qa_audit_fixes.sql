-- ============================================================
-- QA AUDIT FIX MIGRATION — 9 March 2026
-- Fixes schema gaps and missing RLS policies found during audit
-- ============================================================

-- 1. Add missing default_product_limit column to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS default_product_limit INTEGER NOT NULL DEFAULT 3;

-- 2. Add client RLS policy to product_requests (clients can view/create their own requests)
DROP POLICY IF EXISTS "Clients can manage own requests" ON product_requests;
CREATE POLICY "Clients can manage own requests" ON product_requests FOR ALL
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON p.email = c.email
      WHERE p.id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Add client RLS policy to notifications (ensure clients can read their own)
-- Already exists from migration 005 but ensure it covers INSERT for system-generated
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT
  WITH CHECK (true);

-- 4. Add missing index on product_allocations.visible_to_client for client dashboard performance
CREATE INDEX IF NOT EXISTS idx_product_allocations_visible ON product_allocations(visible_to_client);

-- 5. Add missing index on products.platform
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);

-- 6. Add missing index on products.trend_stage
CREATE INDEX IF NOT EXISTS idx_products_trend_stage ON products(trend_stage);
