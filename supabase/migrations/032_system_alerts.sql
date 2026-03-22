-- Migration 032: System Alerts table for monitoring/alerting
-- Phase 8: Production Hardening

CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('error_spike', 'budget_exhaustion', 'engine_down', 'latency_high', 'queue_backup')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  engine_name TEXT,
  client_id UUID,
  metadata JSONB DEFAULT '{}',
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts (severity) WHERE NOT acknowledged;
CREATE INDEX IF NOT EXISTS idx_system_alerts_category ON system_alerts (category);

-- RLS: service role only (admin API uses service role client)
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role full access on system_alerts"
  ON system_alerts FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-cleanup: delete alerts older than 30 days
-- (Run via pg_cron or manual cleanup job)
