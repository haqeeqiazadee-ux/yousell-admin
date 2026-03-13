-- Migration 009: v7-required tables
-- Adds 8 tables specified in YouSell_Platform_Technical_Specification_v7.md
-- Safe to re-run (IF NOT EXISTS throughout)

-- ============================================================
-- 1. subscriptions — Stripe subscription state
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Clients can view own subscription" ON subscriptions;
CREATE POLICY "Clients can view own subscription" ON subscriptions
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
  );

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. platform_access — per-client platform entitlements
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES profiles(id),
  UNIQUE(client_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_platform_access_client ON platform_access(client_id);

ALTER TABLE platform_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage platform_access" ON platform_access;
CREATE POLICY "Admins can manage platform_access" ON platform_access
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Clients can view own platform access" ON platform_access;
CREATE POLICY "Clients can view own platform access" ON platform_access
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
  );

-- ============================================================
-- 3. engine_toggles — per-client engine on/off switches
-- ============================================================
CREATE TABLE IF NOT EXISTS engine_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  engine TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  toggled_at TIMESTAMPTZ DEFAULT now(),
  toggled_by UUID REFERENCES profiles(id),
  UNIQUE(client_id, engine)
);

CREATE INDEX IF NOT EXISTS idx_engine_toggles_client ON engine_toggles(client_id);

ALTER TABLE engine_toggles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage engine_toggles" ON engine_toggles;
CREATE POLICY "Admins can manage engine_toggles" ON engine_toggles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Clients can view own engine toggles" ON engine_toggles;
CREATE POLICY "Clients can view own engine toggles" ON engine_toggles
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
  );

-- ============================================================
-- 4. connected_channels — OAuth channel connections
-- ============================================================
CREATE TABLE IF NOT EXISTS connected_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  channel_name TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ DEFAULT now(),
  disconnected_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(client_id, channel_type)
);

CREATE INDEX IF NOT EXISTS idx_connected_channels_client ON connected_channels(client_id);
CREATE INDEX IF NOT EXISTS idx_connected_channels_status ON connected_channels(status);

ALTER TABLE connected_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage connected_channels" ON connected_channels;
CREATE POLICY "Admins can manage connected_channels" ON connected_channels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Clients can manage own channels" ON connected_channels;
CREATE POLICY "Clients can manage own channels" ON connected_channels
  FOR ALL USING (
    client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
  );

-- ============================================================
-- 5. content_queue — content generation queue
-- ============================================================
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL,
  channel TEXT,
  prompt TEXT,
  generated_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  requested_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_content_queue_client ON content_queue(client_id);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(status);

ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage content_queue" ON content_queue;
CREATE POLICY "Admins can manage content_queue" ON content_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Clients can view own content" ON content_queue;
CREATE POLICY "Clients can view own content" ON content_queue
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
  );

-- ============================================================
-- 6. orders — order tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  external_order_id TEXT,
  platform TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  quantity INTEGER DEFAULT 1,
  total_amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  customer_name TEXT,
  customer_email TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  tracking_url TEXT,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_platform ON orders(platform);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Clients can view own orders" ON orders;
CREATE POLICY "Clients can view own orders" ON orders
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
  );

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. usage_tracking — API usage metering
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_client ON usage_tracking(client_id, period_start);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource ON usage_tracking(resource, action);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage usage_tracking" ON usage_tracking;
CREATE POLICY "Admins can manage usage_tracking" ON usage_tracking
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Clients can view own usage" ON usage_tracking;
CREATE POLICY "Clients can view own usage" ON usage_tracking
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
  );

-- ============================================================
-- 8. addons — purchasable add-ons
-- ============================================================
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stripe_price_id TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  addon_type TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
  stripe_subscription_item_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(client_id, addon_id)
);

CREATE INDEX IF NOT EXISTS idx_client_addons_client ON client_addons(client_id);

ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage addons" ON addons;
CREATE POLICY "Admins can manage addons" ON addons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Anyone can view active addons" ON addons;
CREATE POLICY "Anyone can view active addons" ON addons
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can manage client_addons" ON client_addons;
CREATE POLICY "Admins can manage client_addons" ON client_addons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Clients can view own addons" ON client_addons;
CREATE POLICY "Clients can view own addons" ON client_addons
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE email = auth.jwt()->>'email')
  );
