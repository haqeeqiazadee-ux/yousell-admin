import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { PROVIDERS, getEnvVar } from "@/lib/providers/config";
import { PRICING_TIERS } from "@/lib/stripe";

export const dynamic = "force-dynamic";

function providerConnected(id: string, savedKeys: Record<string, string>): boolean {
  const p = PROVIDERS.find((pr) => pr.id === id);
  if (!p) return false;
  return p.envKeys.every((key) => !!getEnvVar(key) || !!savedKeys[key]);
}

export async function GET(req: NextRequest) {
  try {
    await authenticateAdmin(req);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminSb = createAdminClient();

  // Load saved API keys from database
  let savedKeys: Record<string, string> = {};
  try {
    const { data } = await adminSb
      .from("admin_settings")
      .select("value")
      .eq("key", "api_keys")
      .single();
    savedKeys = data?.value ?? {};
  } catch {}

  // Safe count helper using admin client (bypasses RLS)
  async function safeCount(table: string, filter?: { column: string; value: string }) {
    try {
      let query = adminSb.from(table).select("*", { count: "exact", head: true });
      if (filter) query = query.eq(filter.column, filter.value);
      const { count } = await query;
      return count || 0;
    } catch {
      return 0;
    }
  }

  // Fetch counts + products + scan history + revenue data in parallel
  const [
    products, tiktok, amazon, trends, competitors, clients, influencers, suppliers,
    productsList, scansList, subscriptionsList, allocationCount, recentClients
  ] = await Promise.all([
    safeCount("products"),
    safeCount("products", { column: "platform", value: "tiktok" }),
    safeCount("products", { column: "platform", value: "amazon" }),
    safeCount("trend_keywords"),
    safeCount("competitor_stores"),
    safeCount("clients"),
    safeCount("influencers"),
    safeCount("suppliers"),
    // Full product data for dashboard cards
    adminSb.from("products")
      .select("id, title, viral_score, trend_stage, platform, final_score, channel")
      .order("final_score", { ascending: false })
      .limit(100),
    // Recent scan history
    adminSb.from("scan_history")
      .select("id, scan_mode, status, products_found, started_at, hot_products")
      .order("started_at", { ascending: false })
      .limit(5),
    // Active subscriptions for revenue metrics
    adminSb.from("subscriptions")
      .select("id, plan, status, current_period_start, current_period_end")
      .eq("status", "active"),
    // Total allocations
    safeCount("product_allocations"),
    // Recently added clients
    adminSb.from("clients")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Calculate revenue metrics from subscriptions
  const activeSubs = subscriptionsList.data || [];
  const mrr = activeSubs.reduce((sum: number, sub: { plan: string }) => {
    const tier = PRICING_TIERS[sub.plan as keyof typeof PRICING_TIERS];
    return sum + (tier?.price || 0);
  }, 0);

  const planBreakdown: Record<string, number> = {};
  for (const sub of activeSubs) {
    const plan = sub.plan || "free";
    planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
  }

  return NextResponse.json({
    products,
    tiktok,
    amazon,
    trends,
    competitors,
    clients,
    influencers,
    suppliers,
    // Full data for dashboard rendering
    productsList: productsList.data || [],
    scanHistory: scansList.data || [],
    // Revenue & SaaS metrics
    revenue: {
      mrr,
      activeSubscriptions: activeSubs.length,
      totalClients: clients,
      totalAllocations: allocationCount,
      planBreakdown,
    },
    recentClients: recentClients.data || [],
    services: {
      supabase: providerConnected("supabase", savedKeys),
      auth: providerConnected("supabase", savedKeys),
      ai: providerConnected("anthropic", savedKeys),
      email: providerConnected("resend", savedKeys),
      apify: providerConnected("apify", savedKeys),
      rapidapi: providerConnected("rapidapi", savedKeys),
    },
  });
}
