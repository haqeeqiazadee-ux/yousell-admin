-- Phase 2: Seed admin user
-- Run AFTER creating your admin user via Supabase Auth
-- Replace 'YOUR_ADMIN_USER_UUID' with the actual UUID from auth.users

-- Option 1: Update by email (recommended)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@yousell.online';

-- Option 2: Update by UUID
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_ADMIN_USER_UUID';

-- To check current profiles:
-- SELECT id, email, role, created_at FROM profiles;
