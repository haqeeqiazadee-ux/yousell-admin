import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch counts in parallel
  const [products, tiktok, amazon, trends, competitors] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("platform", "tiktok"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("platform", "amazon"),
    supabase.from("trend_keywords").select("*", { count: "exact", head: true }),
    supabase.from("competitors").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    products: products.count || 0,
    tiktok: tiktok.count || 0,
    amazon: amazon.count || 0,
    trends: trends.count || 0,
    competitors: competitors.count || 0,
    services: {
      supabase: true,
      auth: true,
      ai: !!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes("your-"),
      email: !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("your-"),
      apify: !!process.env.APIFY_API_TOKEN && !process.env.APIFY_API_TOKEN.includes("your-"),
      rapidapi: !!process.env.RAPIDAPI_KEY && !process.env.RAPIDAPI_KEY.includes("your-"),
    },
  });
}
