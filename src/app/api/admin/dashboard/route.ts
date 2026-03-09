import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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
    safeCount("competitors"),
    safeCount("clients"),
    safeCount("influencers"),
    safeCount("suppliers"),
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
    services: {
      supabase: true,
      auth: true,
      ai: !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
      email: !!(process.env.RESEND_API_KEY || process.env.RESEND_KEY),
      apify: !!(process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN),
      rapidapi: !!(process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY),
    },
  });
}
