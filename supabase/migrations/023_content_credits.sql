-- ============================================================
-- Migration 023: Content Credits System (v8 spec Section 3.2)
-- ============================================================

-- Content credits tracking per client per billing period
CREATE TABLE IF NOT EXISTS content_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_credits INTEGER NOT NULL DEFAULT 50,
  used_credits INTEGER NOT NULL DEFAULT 0,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, period_start)
);

ALTER TABLE content_credits ENABLE ROW LEVEL SECURITY;

-- Admins can manage all credit records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_credits' AND policyname = 'Admins manage content credits'
  ) THEN
    CREATE POLICY "Admins manage content credits" ON content_credits
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
      );
  END IF;
END $$;

-- Clients can view their own credits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'content_credits' AND policyname = 'Clients view own credits'
  ) THEN
    CREATE POLICY "Clients view own credits" ON content_credits
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM clients c
          JOIN profiles p ON p.email = c.email
          WHERE c.id = content_credits.client_id AND p.id = auth.uid()
        )
      );
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_credits_client ON content_credits(client_id);
CREATE INDEX IF NOT EXISTS idx_content_credits_period ON content_credits(client_id, period_start);
