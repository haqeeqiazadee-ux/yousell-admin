-- ============================================================
-- Migration 022: Add super_admin role + fix clients self-read RLS
-- ============================================================
-- Required by v8 spec Section 5.1: super_admin role for full system access
-- Required by QA BUG-035: clients table missing self-read policy

-- 1. Add super_admin to user_role enum (idempotent)
DO $$
BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Allow clients to read their own profile from the clients table
-- Currently only admins can read clients — clients can't see their own data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Clients can view own profile'
  ) THEN
    CREATE POLICY "Clients can view own profile" ON clients
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
            AND profiles.email = clients.email
            AND profiles.role = 'client'
        )
      );
  END IF;
END $$;

-- 3. Allow clients to update their own profile in the clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'clients' AND policyname = 'Clients can update own profile'
  ) THEN
    CREATE POLICY "Clients can update own profile" ON clients
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
            AND profiles.email = clients.email
            AND profiles.role = 'client'
        )
      );
  END IF;
END $$;

-- 4. Add missing index on product_allocations.visible_to_client for dashboard queries
CREATE INDEX IF NOT EXISTS idx_product_allocations_visible
  ON product_allocations(visible_to_client)
  WHERE visible_to_client = true;
