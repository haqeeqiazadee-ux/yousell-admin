-- Migration 025: shop_products table
-- Tracks products pushed to external stores (Shopify, TikTok, Amazon)
-- Fixes Journey 1, Step 10: no way to track pushed products

CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('shopify', 'tiktok', 'amazon')),
  external_product_id TEXT,
  external_url TEXT,
  push_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (push_status IN ('pending', 'pushing', 'live', 'failed', 'delisted')),
  pushed_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shop_products_client ON shop_products(client_id);
CREATE INDEX idx_shop_products_product ON shop_products(product_id);
CREATE INDEX idx_shop_products_channel ON shop_products(channel);

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all shop products"
  ON shop_products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Clients see own shop products"
  ON shop_products FOR SELECT
  USING (client_id = auth.uid());
