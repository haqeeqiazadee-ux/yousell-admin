import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/roles";
import { PROVIDERS, getEnvVar } from "@/lib/providers/config";

export const dynamic = "force-dynamic";

function providerConnected(id: string, savedKeys: Record<string, string>): boolean {
  const p = PROVIDERS.find((pr) => pr.id === id);
  if (!p) return false;
  return p.envKeys.every((key) => !!getEnvVar(key) || !!savedKeys[key]);
}

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load saved API keys from database (fallback for env vars)
  let savedKeys: Record<string, string> = {};
  try {
    const adminSb = createAdminClient();
    const { data } = await adminSb
      .from("admin_settings")
      .select("value")
      .eq("key", "api_keys")
      .single();
    savedKeys = data?.value ?? {};
  } catch {
    // admin_settings may not exist yet
  }

  // Helper to safely count from a table (returns 0 if table doesn't exist)
  async function safeCount(table: string, filter?: { column: string; value: string }) {
    try {
      let query = supabase.from(table).select("*", { count: "exact", head: true });
      if (filter) query = query.eq(filter.column, filter.value);
      const { count } = await query;
      return count || 0;
    } catch {
      return 0;
    }
  }

  // Fetch counts in parallel
  const [products, tiktok, amazon, trends, competitors, clients, influencers, suppliers] = await Promise.all([
    safeCount("products"),
    safeCount("products", { column: "platform", value: "tiktok" }),
    safeCount("products", { column: "platform", value: "amazon" }),
    safeCount("trend_keywords"),
    safeCount("competitor_stores"),
    safeCount("clients"),
    safeCount("influencers"),
    safeCount("suppliers"),
  ]);

  // Use centralized PROVIDERS config + saved DB keys for consistent checking
  return NextResponse.json({
    products,
    tiktok,
    amazon,
    trends,
    competitors,
    clients,
    influencers,
    suppliers,
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
