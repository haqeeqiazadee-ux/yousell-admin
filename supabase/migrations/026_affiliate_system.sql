-- Migration 026: Affiliate referral and commission system
-- Fixes Journey 3: entire affiliate pipeline missing

-- Referral tracking
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_client_id UUID NOT NULL REFERENCES clients(id),
  referred_user_id UUID,
  referred_email TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'signed_up', 'subscribed', 'expired')),
  signed_up_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON affiliate_referrals(referrer_client_id);
CREATE INDEX idx_referrals_code ON affiliate_referrals(referral_code);

-- Commission records
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES affiliate_referrals(id),
  referrer_client_id UUID NOT NULL REFERENCES clients(id),
  subscription_id UUID,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.2000,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_referrer ON affiliate_commissions(referrer_client_id);
CREATE INDEX idx_commissions_status ON affiliate_commissions(status);

-- Add referral_code column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- RLS policies
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all referrals"
  ON affiliate_referrals FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Clients see own referrals"
  ON affiliate_referrals FOR SELECT
  USING (referrer_client_id = auth.uid());

CREATE POLICY "Admins manage all commissions"
  ON affiliate_commissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Clients see own commissions"
  ON affiliate_commissions FOR SELECT
  USING (referrer_client_id = auth.uid());
