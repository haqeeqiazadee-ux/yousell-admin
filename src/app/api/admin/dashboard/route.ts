import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";
import { PROVIDERS, getProviderStatus } from "@/lib/providers/config";

function providerConnected(id: string): boolean {
  const p = PROVIDERS.find((pr) => pr.id === id);
  return p ? getProviderStatus(p.envKeys) === "connected" : false;
}

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  // Use centralized PROVIDERS config for consistent env var checking
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
      supabase: providerConnected("supabase"),
      auth: providerConnected("supabase"),
      ai: providerConnected("anthropic"),
      email: providerConnected("resend"),
      apify: providerConnected("apify"),
      rapidapi: providerConnected("rapidapi"),
    },
  });
}
