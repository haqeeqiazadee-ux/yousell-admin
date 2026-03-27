-- Migration 031: Engine Governor Tables
-- Creates 6 new tables + alters engine_toggles for the Governor system
-- @see docs/v9/V9_Engine_Governor_Architecture.md Section 8

-- ─── 1. Engine Cost Manifests ──────────────────────────────
-- Engine cost declarations (seeded from code, admin-editable)
CREATE TABLE IF NOT EXISTS engine_cost_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_name TEXT NOT NULL,
  manifest_version TEXT NOT NULL DEFAULT '1.0',
  operations JSONB NOT NULL,
  monthly_fixed_cost_usd NUMERIC(10,4) DEFAULT 0,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(engine_name, manifest_version)
);

-- ─── 2. Plan Engine Allowances ─────────────────────────────
-- Per-plan engine allowance templates
CREATE TABLE IF NOT EXISTS plan_engine_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier TEXT NOT NULL,
  engine_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  max_operations INTEGER DEFAULT 0,
  max_cost_usd NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_tier, engine_name)
);

-- ─── 3. Client Budget Envelopes ────────────────────────────
-- Per-client budget envelopes (one per billing period)
CREATE TABLE IF NOT EXISTS engine_budget_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  plan_tier TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  global_cost_cap_usd NUMERIC(10,4) NOT NULL,
  total_spent_usd NUMERIC(10,4) DEFAULT 0,
  engine_allowances JSONB NOT NULL,
  alert_warn_percent INTEGER DEFAULT 80,
  alert_throttle_percent INTEGER DEFAULT 95,
  alert_block_percent INTEGER DEFAULT 100,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. Usage Ledger ───────────────────────────────────────
-- Real-time usage ledger (append-only)
CREATE TABLE IF NOT EXISTS engine_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  engine_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  correlation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_ledger_client_period
  ON engine_usage_ledger(client_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_ledger_engine
  ON engine_usage_ledger(engine_name, created_at);

-- ─── 5. Engine Swaps ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS engine_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_engine TEXT NOT NULL,
  target_engine TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_by TEXT NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. Governor AI Decisions ──────────────────────────────
CREATE TABLE IF NOT EXISTS governor_ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  decision_type TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence NUMERIC(3,2),
  applied BOOLEAN DEFAULT false,
  approved_by TEXT,
  affected_clients JSONB DEFAULT '[]',
  affected_engines JSONB DEFAULT '[]',
  before_state JSONB,
  after_state JSONB,
  revertible BOOLEAN DEFAULT true,
  reverted BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 7. Governor Overrides ─────────────────────────────────
CREATE TABLE IF NOT EXISTS governor_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  override_type TEXT NOT NULL,
  created_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  target_client_id UUID,
  target_engine TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 8. Alter engine_toggles ───────────────────────────────
-- Add Governor-specific columns to existing engine_toggles table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'engine_toggles' AND column_name = 'custom_max_operations'
  ) THEN
    ALTER TABLE engine_toggles
      ADD COLUMN custom_max_operations INTEGER,
      ADD COLUMN custom_max_cost_usd NUMERIC(10,4),
      ADD COLUMN priority_level INTEGER DEFAULT 0,
      ADD COLUMN automation_level_override INTEGER;
  END IF;
END $$;

-- ─── RLS Policies ──────────────────────────────────────────
-- Cost manifests: admin read, super_admin write
ALTER TABLE engine_cost_manifests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read cost manifests"
  ON engine_cost_manifests FOR SELECT
  USING (true);

-- Plan allowances: admin read, super_admin write
ALTER TABLE plan_engine_allowances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read plan allowances"
  ON plan_engine_allowances FOR SELECT
  USING (true);

-- Budget envelopes: clients see their own, admins see all
ALTER TABLE engine_budget_envelopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own budget envelopes"
  ON engine_budget_envelopes FOR SELECT
  USING (client_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Usage ledger: clients see their own, admins see all
ALTER TABLE engine_usage_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own usage ledger"
  ON engine_usage_ledger FOR SELECT
  USING (client_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Engine swaps: admin-only
ALTER TABLE engine_swaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read engine swaps"
  ON engine_swaps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- AI decisions: admin-only
ALTER TABLE governor_ai_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can read AI decisions"
  ON governor_ai_decisions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Overrides: super_admin only
ALTER TABLE governor_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can read overrides"
  ON governor_overrides FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  ));
