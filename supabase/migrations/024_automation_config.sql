-- ============================================================
-- Migration 024: Client Automation Config (v8 spec Section 6A)
-- ============================================================

CREATE TABLE IF NOT EXISTS client_automation_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE UNIQUE,

  -- Per-feature automation levels (1=Manual, 2=Assisted, 3=Auto-Pilot)
  product_upload_level SMALLINT NOT NULL DEFAULT 1 CHECK (product_upload_level BETWEEN 1 AND 3),
  content_creation_level SMALLINT NOT NULL DEFAULT 1 CHECK (content_creation_level BETWEEN 1 AND 3),
  content_publishing_level SMALLINT NOT NULL DEFAULT 1 CHECK (content_publishing_level BETWEEN 1 AND 3),
  influencer_outreach_level SMALLINT NOT NULL DEFAULT 1 CHECK (influencer_outreach_level BETWEEN 1 AND 3),
  product_discovery_level SMALLINT NOT NULL DEFAULT 1 CHECK (product_discovery_level BETWEEN 1 AND 3),

  -- Hard guardrails
  daily_spend_cap NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  content_volume_cap_per_day INTEGER NOT NULL DEFAULT 10,
  product_upload_cap_per_day INTEGER NOT NULL DEFAULT 5,
  outreach_cap_per_day INTEGER NOT NULL DEFAULT 20,
  pause_on_consecutive_errors INTEGER NOT NULL DEFAULT 3,

  -- Soft limits
  content_approval_window_hours INTEGER NOT NULL DEFAULT 4,
  allowed_categories TEXT[] DEFAULT '{}',
  price_range_min NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_range_max NUMERIC(10,2) NOT NULL DEFAULT 1000,
  minimum_score INTEGER NOT NULL DEFAULT 60,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  weekly_digest_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Emergency controls
  all_automation_paused BOOLEAN NOT NULL DEFAULT false,
  paused_features TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE client_automation_config ENABLE ROW LEVEL SECURITY;

-- Admins can manage all automation configs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_automation_config' AND policyname = 'Admins manage automation config'
  ) THEN
    CREATE POLICY "Admins manage automation config" ON client_automation_config
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- Clients can view and update their own config
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_automation_config' AND policyname = 'Clients manage own automation config'
  ) THEN
    CREATE POLICY "Clients manage own automation config" ON client_automation_config
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM clients c
          JOIN profiles p ON p.email = c.email
          WHERE c.id = client_automation_config.client_id AND p.id = auth.uid()
        )
      );
  END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER update_automation_config_updated_at
  BEFORE UPDATE ON client_automation_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_automation_config_client ON client_automation_config(client_id);
