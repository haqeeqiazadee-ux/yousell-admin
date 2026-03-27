-- ============================================================
-- Migration 033: External Engine API Integration
-- ============================================================
-- Enables any external platform with an API to register as an
-- engine replacement, routed through the Governor dispatch.
-- ============================================================

-- 1. External engines registry
CREATE TABLE IF NOT EXISTS external_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  auth_type TEXT NOT NULL DEFAULT 'bearer',
  auth_header_name TEXT NOT NULL DEFAULT 'Authorization',
  auth_token_encrypted TEXT,
  health_endpoint TEXT,
  cost_per_operation_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  timeout_ms INTEGER NOT NULL DEFAULT 30000,
  replaces_engine TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  last_health_check TIMESTAMPTZ,
  last_health_status BOOLEAN,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookup by replacement target
CREATE INDEX IF NOT EXISTS idx_external_engines_replaces
  ON external_engines (replaces_engine) WHERE active = true;

-- 2. Extend engine_swaps for external targets
ALTER TABLE engine_swaps
  ADD COLUMN IF NOT EXISTS is_external BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE engine_swaps
  ADD COLUMN IF NOT EXISTS external_engine_id UUID REFERENCES external_engines(id);

-- Index for dispatch cache refresh (external swaps)
CREATE INDEX IF NOT EXISTS idx_engine_swaps_external
  ON engine_swaps (external_engine_id) WHERE is_external = true AND active = true;

-- 3. RLS policies
ALTER TABLE external_engines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read external engines"
  ON external_engines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admin can manage external engines"
  ON external_engines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );
