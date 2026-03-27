-- Migration 030: Automation Orchestrator Tables
-- Supports Level 1/2/3 automation, approval queues, usage tracking, and action logging.

-- Per-client automation settings
CREATE TABLE IF NOT EXISTS client_automation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  automation_levels JSONB NOT NULL DEFAULT '{"product_upload":1,"content_creation":1,"content_publishing":1,"influencer_outreach":1,"product_discovery":1}',
  guardrails JSONB NOT NULL DEFAULT '{"dailySpendCap":50,"contentVolumeCapPerDay":10,"productUploadCapPerDay":5,"outreachCapPerDay":20,"pauseOnConsecutiveErrors":3}',
  soft_limits JSONB NOT NULL DEFAULT '{"contentApprovalWindowHours":4,"allowedCategories":[],"priceRange":{"min":0,"max":1000},"minimumScore":60,"weeklyDigestEnabled":true}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_automation_client ON client_automation_settings(client_id);

ALTER TABLE client_automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage automation settings"
  ON client_automation_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

CREATE POLICY IF NOT EXISTS "Clients can read own automation settings"
  ON client_automation_settings FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));


-- Pending actions queue (Level 2 approval)
CREATE TABLE IF NOT EXISTS automation_pending_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  result JSONB
);

CREATE INDEX IF NOT EXISTS idx_pending_actions_client ON automation_pending_actions(client_id);
CREATE INDEX IF NOT EXISTS idx_pending_actions_status ON automation_pending_actions(status);
CREATE INDEX IF NOT EXISTS idx_pending_actions_expires ON automation_pending_actions(expires_at);

ALTER TABLE automation_pending_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage pending actions"
  ON automation_pending_actions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));


-- Daily usage tracking (guardrail enforcement)
CREATE TABLE IF NOT EXISTS automation_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_spend NUMERIC(10,2) DEFAULT 0,
  content_count INTEGER DEFAULT 0,
  upload_count INTEGER DEFAULT 0,
  outreach_count INTEGER DEFAULT 0,
  consecutive_errors INTEGER DEFAULT 0,
  UNIQUE(client_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_client_date ON automation_daily_usage(client_id, date);

ALTER TABLE automation_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage daily usage"
  ON automation_daily_usage FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));


-- Action log (audit trail for all automated actions)
CREATE TABLE IF NOT EXISTS automation_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'executed',
  payload JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_log_client ON automation_action_log(client_id);
CREATE INDEX IF NOT EXISTS idx_action_log_created ON automation_action_log(created_at);

ALTER TABLE automation_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can read action log"
  ON automation_action_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));
