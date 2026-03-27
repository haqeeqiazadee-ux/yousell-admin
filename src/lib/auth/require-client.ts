import { createClient } from "@/lib/supabase/server";
import { PRICING_TIERS } from "@/lib/stripe";

export interface ClientContext {
  userId: string;
  clientId: string;
  email: string;
  subscription: {
    plan: string;
    status: string;
    engines: readonly string[];
    productsPerPlatform: number;
    platforms: number;
  } | null;
}

/**
 * Authenticates the current user as a client and returns their client context.
 * Uses server-side Supabase client (cookie-based auth for dashboard routes).
 * Throws if not authenticated or not a client.
 */
export async function requireClient(): Promise<ClientContext> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  if (!user.email) throw new Error("User has no email");

  // Verify client role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "client") {
    throw new Error("Not a client");
  }

  // Get client record
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!client) throw new Error("Client not found");

  // Get subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("client_id", client.id)
    .single();

  let subscription: ClientContext["subscription"] = null;
  if (sub && sub.status === "active") {
    const tier = PRICING_TIERS[sub.plan as keyof typeof PRICING_TIERS];
    subscription = {
      plan: sub.plan,
      status: sub.status,
      engines: tier?.engines || [],
      productsPerPlatform: tier?.productsPerPlatform || 0,
      platforms: tier?.platforms || 0,
    };
  }

  return {
    userId: user.id,
    clientId: client.id,
    email: user.email,
    subscription,
  };
}
