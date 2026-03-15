import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROVIDERS, getEnvVar } from "@/lib/providers/config";

export const dynamic = "force-dynamic";

function providerConnected(id: string, savedKeys: Record<string, string>): boolean {
  const p = PROVIDERS.find((pr) => pr.id === id);
  if (!p) return false;
  return p.envKeys.every((key) => !!getEnvVar(key) || !!savedKeys[key]);
}

// Token-based auth (same pattern as scan route — bypasses cookies() hang on Netlify)
async function authenticateAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("No Authorization header");

  const admin = createAdminClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) throw new Error(error?.message || "Invalid session");

  const { data: role } = await admin.rpc("check_user_role", { user_id: user.id });
  if (role !== "admin" && role !== "super_admin") throw new Error("Not admin");

  return user;
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

  // Fetch counts + products + scan history in parallel
  const [
    products, tiktok, amazon, trends, competitors, clients, influencers, suppliers,
    productsList, scansList
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
  ]);

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
