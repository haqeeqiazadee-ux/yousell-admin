-- 034_ai_intelligence_tables.sql
-- AI Intelligence Tables: Chatbot, Fraud Detection, Dynamic Pricing,
-- Demand Forecasting, Smart UX Features
-- Aligned with Aalpha AI Ecommerce Intelligence categories

-- ============================================================
-- 1. CONVERSATIONAL AI (Chatbot)
-- ============================================================

CREATE TABLE IF NOT EXISTS chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'claude',          -- claude | gpt | dialogflow
  model TEXT DEFAULT 'claude-haiku-4-5-20251001',
  system_prompt TEXT DEFAULT 'You are a helpful ecommerce assistant for YOUSELL.',
  temperature NUMERIC(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1024,
  channels JSONB DEFAULT '["website"]'::jsonb,      -- website, email, whatsapp, sms
  escalation_threshold NUMERIC(3,2) DEFAULT 0.3,    -- sentiment score below this triggers escalation
  max_bot_turns INTEGER DEFAULT 5,                  -- max exchanges before auto-escalation
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  sample_phrases JSONB DEFAULT '[]'::jsonb,         -- ["where is my order", "track my package"]
  response_template TEXT,
  category TEXT DEFAULT 'general',                   -- general, order, product, support, billing
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  channel TEXT DEFAULT 'website',
  status TEXT DEFAULT 'open',                        -- open, resolved, escalated, abandoned
  satisfaction_score NUMERIC(3,2),                   -- 0.00 to 5.00
  message_count INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  messages JSONB DEFAULT '[]'::jsonb,
  escalated_to TEXT,                                 -- human agent name/id
  escalation_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_status ON chatbot_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_created ON chatbot_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_customer ON chatbot_conversations(customer_id);

-- ============================================================
-- 2. FRAUD & SECURITY
-- ============================================================

CREATE TABLE IF NOT EXISTS fraud_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL,                           -- velocity, amount, geo, device, email, custom
  description TEXT,
  threshold JSONB NOT NULL DEFAULT '{}'::jsonb,      -- {"max_orders_per_hour": 5, "max_amount": 5000}
  severity TEXT DEFAULT 'medium',                    -- low, medium, high, critical
  action TEXT DEFAULT 'flag',                        -- flag, block, escalate
  active BOOLEAN DEFAULT true,
  triggers_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT,
  customer_id UUID,
  customer_email TEXT,
  risk_score INTEGER DEFAULT 0,                      -- 0-100
  risk_level TEXT DEFAULT 'low',                     -- low, medium, high, critical
  risk_factors JSONB DEFAULT '[]'::jsonb,            -- [{"type":"velocity","detail":"5 orders in 1h","weight":30}]
  triggered_rules JSONB DEFAULT '[]'::jsonb,         -- rule IDs that fired
  status TEXT DEFAULT 'flagged',                     -- flagged, blocked, cleared, escalated
  action_taken_by TEXT,
  action_taken_at TIMESTAMPTZ,
  action_notes TEXT,
  transaction_amount NUMERIC(12,2),
  ip_address TEXT,
  device_fingerprint TEXT,
  geo_location TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_flags_status ON fraud_flags(status);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_risk ON fraud_flags(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_created ON fraud_flags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_customer ON fraud_flags(customer_id);

-- ============================================================
-- 3. DYNAMIC PRICING
-- ============================================================

CREATE TABLE IF NOT EXISTS pricing_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  strategy_type TEXT NOT NULL DEFAULT 'competitive',  -- competitive, margin-optimized, demand-based
  constraints JSONB DEFAULT '{}'::jsonb,              -- {"min_margin": 10, "max_margin": 60, "max_change_pct_day": 5}
  active BOOLEAN DEFAULT false,
  applied_to_categories JSONB DEFAULT '[]'::jsonb,    -- ["electronics", "accessories"]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  product_name TEXT,
  current_price NUMERIC(12,2) NOT NULL,
  suggested_price NUMERIC(12,2) NOT NULL,
  competitor_avg_price NUMERIC(12,2),
  margin_pct NUMERIC(5,2),
  demand_signal TEXT DEFAULT 'medium',                -- low, medium, high
  elasticity TEXT DEFAULT 'unit-elastic',              -- elastic, inelastic, unit-elastic
  reason TEXT,                                        -- "competitor undercut", "high demand", "margin optimization"
  auto_apply BOOLEAN DEFAULT false,
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competitor_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  competitor_url TEXT,
  product_name TEXT NOT NULL,
  product_id UUID,
  their_price NUMERIC(12,2) NOT NULL,
  our_price NUMERIC(12,2),
  difference_pct NUMERIC(6,2),
  trend TEXT DEFAULT 'stable',                        -- up, down, stable
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual',                       -- manual, scraper, api
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_suggestions_product ON pricing_suggestions(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_suggestions_applied ON pricing_suggestions(applied);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_product ON competitor_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_competitor_prices_competitor ON competitor_prices(competitor_name);

-- ============================================================
-- 4. DEMAND FORECASTING
-- ============================================================

CREATE TABLE IF NOT EXISTS demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  product_name TEXT,
  current_stock INTEGER DEFAULT 0,
  avg_daily_sales NUMERIC(8,2) DEFAULT 0,
  predicted_demand_7d INTEGER DEFAULT 0,
  predicted_demand_30d INTEGER DEFAULT 0,
  predicted_demand_90d INTEGER DEFAULT 0,
  days_until_stockout INTEGER,
  confidence NUMERIC(5,2) DEFAULT 0,                  -- 0-100 %
  forecast_horizon TEXT DEFAULT '30d',                -- 7d, 30d, 90d
  seasonal_pattern JSONB DEFAULT '{}'::jsonb,         -- {"peak_months": [11,12], "trend": "up"}
  restock_recommendation TEXT,                        -- "order now", "order soon", "adequate", "overstock"
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  product_name TEXT,
  supplier_id UUID,
  supplier_name TEXT,
  current_stock INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  recommended_qty INTEGER DEFAULT 0,
  estimated_cost NUMERIC(12,2),
  urgency TEXT DEFAULT 'ok',                          -- critical, warning, ok
  lead_time_days INTEGER DEFAULT 7,
  status TEXT DEFAULT 'pending',                      -- pending, ordered, received, dismissed
  ordered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demand_forecasts_product ON demand_forecasts(product_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_stockout ON demand_forecasts(days_until_stockout);
CREATE INDEX IF NOT EXISTS idx_restock_alerts_urgency ON restock_alerts(urgency);
CREATE INDEX IF NOT EXISTS idx_restock_alerts_status ON restock_alerts(status);

-- ============================================================
-- 5. SMART UX / AI FEATURES
-- ============================================================

CREATE TABLE IF NOT EXISTS smart_ux_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'conversion',                 -- conversion, engagement, personalization, discovery
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,                   -- feature-specific configuration
  impact_metrics JSONB DEFAULT '{}'::jsonb,           -- {"conversion_lift": 0, "cart_value_change": 0}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  feature_key TEXT REFERENCES smart_ux_features(feature_key),
  variant_a TEXT NOT NULL DEFAULT 'Control',
  variant_a_config JSONB DEFAULT '{}'::jsonb,
  variant_b TEXT NOT NULL DEFAULT 'Treatment',
  variant_b_config JSONB DEFAULT '{}'::jsonb,
  traffic_split_pct INTEGER DEFAULT 50,               -- % going to variant B
  status TEXT DEFAULT 'draft',                        -- draft, running, paused, completed
  current_winner TEXT,                                -- 'A', 'B', or null
  confidence_pct NUMERIC(5,2) DEFAULT 0,
  results JSONB DEFAULT '{}'::jsonb,                  -- {"a_conversions": 0, "b_conversions": 0, ...}
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personalization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  segment TEXT NOT NULL,                              -- new-visitor, returning, high-value, cart-abandoner, frequent-buyer
  feature_key TEXT REFERENCES smart_ux_features(feature_key),
  conditions JSONB DEFAULT '{}'::jsonb,               -- {"min_visits": 3, "cart_value_gt": 100}
  action JSONB DEFAULT '{}'::jsonb,                   -- {"show_popup": true, "discount_pct": 10}
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  triggers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ab_tests_feature ON ab_tests(feature_key);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_personalization_rules_segment ON personalization_rules(segment);
CREATE INDEX IF NOT EXISTS idx_personalization_rules_feature ON personalization_rules(feature_key);

-- ============================================================
-- RLS Policies (admin/super_admin access only)
-- ============================================================

ALTER TABLE chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_ux_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_rules ENABLE ROW LEVEL SECURITY;

-- Admin read/write policies
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'chatbot_config','chatbot_intents','chatbot_conversations',
    'fraud_rules','fraud_flags',
    'pricing_strategies','pricing_suggestions','competitor_prices',
    'demand_forecasts','restock_alerts',
    'smart_ux_features','ab_tests','personalization_rules'
  ])
  LOOP
    EXECUTE format(
      'CREATE POLICY admin_read_%1$s ON %1$I FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN (''admin'',''super_admin''))
      )', tbl);
    EXECUTE format(
      'CREATE POLICY admin_write_%1$s ON %1$I FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN (''admin'',''super_admin''))
      )', tbl);
  END LOOP;
END$$;

-- ============================================================
-- Seed default smart UX features
-- ============================================================

INSERT INTO smart_ux_features (feature_key, display_name, description, category, enabled) VALUES
  ('smart-cart', 'Smart Cart Suggestions', 'AI-powered cross-sell and upsell recommendations in cart', 'conversion', false),
  ('exit-intent', 'Exit-Intent Popups', 'AI-triggered offers when user is about to leave', 'conversion', false),
  ('personalized-homepage', 'Personalized Homepage', 'Dynamic product grid based on user behavior', 'personalization', false),
  ('smart-search', 'Smart Search Autocomplete', 'AI-powered search with NLP understanding', 'discovery', false),
  ('dynamic-bundles', 'Dynamic Bundles', 'Auto-generated product bundles based on purchase patterns', 'conversion', false),
  ('social-proof', 'Social Proof Widgets', 'AI-curated reviews and ratings display', 'engagement', false)
ON CONFLICT (feature_key) DO NOTHING;

-- Seed default chatbot intents
INSERT INTO chatbot_intents (name, display_name, sample_phrases, response_template, category) VALUES
  ('greeting', 'Greeting', '["hello","hi","hey there"]', 'Hello! How can I help you today?', 'general'),
  ('order-status', 'Order Status', '["where is my order","track my package","order status"]', 'Let me look up your order. Could you provide your order number?', 'order'),
  ('product-query', 'Product Query', '["do you have","looking for","is this in stock"]', 'I can help you find what you''re looking for. What product are you interested in?', 'product'),
  ('refund', 'Refund Request', '["I want a refund","return my order","money back"]', 'I understand you''d like a refund. Let me connect you with our support team for this.', 'support'),
  ('faq', 'FAQ', '["shipping time","delivery cost","payment methods"]', 'Great question! Let me find that information for you.', 'general'),
  ('escalation', 'Escalation', '["speak to human","talk to agent","real person"]', 'I''ll connect you with a human agent right away. Please hold.', 'support')
ON CONFLICT (name) DO NOTHING;

-- Seed default fraud rules
INSERT INTO fraud_rules (name, rule_type, description, threshold, severity, action) VALUES
  ('High Value Order', 'amount', 'Flag orders above threshold', '{"max_amount": 5000}', 'high', 'flag'),
  ('Velocity Check', 'velocity', 'Flag rapid successive orders', '{"max_orders_per_hour": 5}', 'high', 'flag'),
  ('Geo Mismatch', 'geo', 'Flag when billing/shipping countries differ', '{"mismatch_countries": true}', 'medium', 'flag'),
  ('Suspicious Email', 'email', 'Block disposable email domains', '{"blocked_domains": ["tempmail.com","throwaway.email"]}', 'medium', 'block'),
  ('New Account High Spend', 'custom', 'Flag new accounts with large first orders', '{"account_age_hours": 24, "min_amount": 1000}', 'high', 'flag')
ON CONFLICT DO NOTHING;

-- Seed default pricing strategy
INSERT INTO pricing_strategies (name, strategy_type, constraints, active) VALUES
  ('Default Competitive', 'competitive', '{"min_margin_pct": 10, "max_margin_pct": 60, "max_change_pct_day": 5, "price_floor_enabled": true}', true)
ON CONFLICT DO NOTHING;
