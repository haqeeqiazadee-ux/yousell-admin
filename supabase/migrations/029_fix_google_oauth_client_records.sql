-- Fix: Google OAuth users were missing clients records, causing dashboard API
-- to throw "Client not found" after successful login.
--
-- Three fixes applied:
-- 1. Add unique constraint on clients.email (required for ON CONFLICT)
-- 2. Update handle_new_user trigger to also create clients record
-- 3. Add RLS policies on profiles (was enabled with zero policies = blocked all reads)

-- 1. Unique constraint on clients.email
ALTER TABLE public.clients ADD CONSTRAINT clients_email_unique UNIQUE (email);

-- 2. Updated trigger: creates both profiles AND clients records on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'client'
  );

  -- Create client record so dashboard APIs work immediately
  INSERT INTO public.clients (name, email)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 3. RLS policies on profiles (RLS was enabled but had zero policies)
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
