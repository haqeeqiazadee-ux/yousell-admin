import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Token-based admin authentication for API routes.
 * Reads Bearer token from Authorization header, verifies via Supabase,
 * and checks admin role. This avoids the cookies() hang on Netlify.
 */
export async function authenticateAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("No Authorization header");

  const admin = createAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) throw new Error(error?.message || "Invalid session");

  const { data: role } = await admin.rpc("check_user_role", { user_id: user.id });
  if (role !== "admin" && role !== "super_admin") throw new Error("Not admin");

  return user;
}
