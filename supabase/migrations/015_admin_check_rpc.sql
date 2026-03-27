-- RPC function to check admin role, bypassing RLS
-- This is needed because RLS on the profiles table can block
-- the middleware/server from reading the user's own role.

CREATE OR REPLACE FUNCTION check_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role::TEXT FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users only (not anon — role check
-- should never be callable without a valid JWT session)
GRANT EXECUTE ON FUNCTION check_user_role(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION check_user_role(UUID) FROM anon;
