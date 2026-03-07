import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/lib/types/database";

/**
 * Get the current user's profile with role information.
 * Works with both server and client Supabase clients.
 */
export async function getUserProfile(
  supabase: SupabaseClient
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

/**
 * Check if the current user has a specific role.
 */
export async function hasRole(
  supabase: SupabaseClient,
  role: UserRole
): Promise<boolean> {
  const profile = await getUserProfile(supabase);
  return profile?.role === role;
}

/**
 * Check if the current user is an admin.
 */
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  return hasRole(supabase, "admin");
}

/**
 * Get the user's role. Returns null if not authenticated.
 */
export async function getUserRole(
  supabase: SupabaseClient
): Promise<UserRole | null> {
  const profile = await getUserProfile(supabase);
  return profile?.role ?? null;
}
