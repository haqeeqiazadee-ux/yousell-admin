import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRICING_TIERS } from "@/lib/stripe";

export interface ClientAuthResult {
  userId: string;
  email: string;
  clientId: string;
  subscription: {
    plan: string;
    status: string;
    engines: readonly string[];
    productsPerPlatform: number;
    platforms: number;
  } | null;
}

/**
 * Token-based client authentication for dashboard API routes.
 * Reads Bearer token from Authorization header, verifies via Supabase,
 * checks client role, and resolves client context + subscription.
 * This avoids the cookies() hang on Netlify.
 */
export async function authenticateClient(req: NextRequest): Promise<ClientAuthResult> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("No Authorization header");

  const admin = createAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) throw new Error(error?.message || "Invalid session");

  if (!user.email) throw new Error("User has no email");

  // Check role — must be client
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "client") {
    throw new Error("Not a client");
  }

  // Resolve client record
  const { data: client } = await admin
    .from("clients")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!client) throw new Error("Client not found");

  // Resolve subscription
  const { data: sub } = await admin
    .from("subscriptions")
    .select("plan, status")
    .eq("client_id", client.id)
    .single();

  let subscription: ClientAuthResult["subscription"] = null;
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
    email: user.email,
    clientId: client.id,
    subscription,
  };
}

/**
 * Lightweight client auth — just verifies identity and resolves clientId.
 * Use when subscription context is not needed.
 */
export async function authenticateClientLite(req: NextRequest): Promise<{ userId: string; email: string; clientId: string }> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("No Authorization header");

  const admin = createAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) throw new Error(error?.message || "Invalid session");

  if (!user.email) throw new Error("User has no email");

  // Check role — must be client
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "client") {
    throw new Error("Not a client");
  }

  // Resolve client record
  const { data: client } = await admin
    .from("clients")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!client) throw new Error("Client not found");

  return { userId: user.id, email: user.email, clientId: client.id };
}
