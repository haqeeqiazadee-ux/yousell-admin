import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchTikTokProducts } from "@/lib/providers/tiktok/index";
import { searchAmazonProducts } from "@/lib/providers/amazon/index";
import { searchShopifyProducts } from "@/lib/providers/shopify/index";
import { searchPinterestProducts } from "@/lib/providers/pinterest/index";
import { searchTrends } from "@/lib/providers/trends/index";
import type { ProductResult } from "@/lib/providers/types";
import { sendProductAlert } from "@/lib/email";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Try to fetch scan history — gracefully handle if table doesn't exist yet
    let scans: Record<string, unknown>[] = [];
    try {
      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        scans = data.map((s: Record<string, unknown>) => ({
          id: s.id,
          date: s.started_at,
          mode: s.scan_mode,
          duration: s.completed_at
            ? `${Math.round((new Date(s.completed_at as string).getTime() - new Date(s.started_at as string).getTime()) / 1000)}s`
            : "—",
          products_found: s.products_found || 0,
          hot_products: s.hot_products || 0,
          cost_estimate: s.cost_estimate ? `$${s.cost_estimate}` : "$0.00",
          status: s.status || "completed",
        }));
      }
    } catch {
      // Table may not exist yet
    }

    // Check if at least one scraping provider is configured
    const hasApify = !!process.env.APIFY_API_TOKEN && !process.env.APIFY_API_TOKEN.includes("your-");
    const hasRapidApi = !!process.env.RAPIDAPI_KEY && !process.env.RAPIDAPI_KEY.includes("your-");
    const engineReady = hasApify || hasRapidApi;

    return NextResponse.json({ scans, engine_ready: engineReady });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { scan_mode, keywords } = body;

    if (!scan_mode) {
      return NextResponse.json({ error: "scan_mode is required" }, { status: 400 });
    }

    const searchTerms = keywords?.length
      ? keywords
      : ["trending products", "viral products 2026", "best sellers"];

    // Create scan history entry
    let scanId: string | null = null;
    try {
      const { data: scanRecord } = await supabase
        .from("scan_history")
        .insert({
          scan_mode,
          triggered_by: user.id,
          status: "running",
          progress: 0,
        })
        .select("id")
        .single();
      scanId = scanRecord?.id || null;
    } catch {
      // Table may not exist yet — continue without logging
    }

    // Run all platform scans in parallel
    const scanPromises: Promise<ProductResult[]>[] = [];
    const platformLabels: string[] = [];

    if (scan_mode === "quick" || scan_mode === "full") {
      scanPromises.push(searchTikTokProducts(searchTerms[0]));
      platformLabels.push("tiktok");
      scanPromises.push(searchAmazonProducts(searchTerms[0]));
      platformLabels.push("amazon");
    }

    if (scan_mode === "full") {
      scanPromises.push(searchShopifyProducts(searchTerms[0]));
      platformLabels.push("shopify");
      scanPromises.push(searchPinterestProducts(searchTerms[0]));
      platformLabels.push("pinterest");
    }

    // Run trends search in background for full scans
    if (scan_mode === "full") {
      searchTrends(searchTerms).catch(console.error);
    }

    const results = await Promise.allSettled(scanPromises);

    // Collect all products
    let totalProducts = 0;
    let hotProducts = 0;
    const errors: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled" && result.value.length > 0) {
        const products = result.value;
        totalProducts += products.length;
        hotProducts += products.filter((p) => (p.score || 0) >= 80).length;

        // Upsert products into Supabase
        const rows = products.map((p) => ({
          title: p.title,
          platform: p.platform,
          price: p.price,
          currency: p.currency,
          image_url: p.imageUrl || null,
          external_url: p.url,
          url: p.url,
          score_overall: p.score || null,
          metadata: p.metadata,
          status: "active",
        }));

        const { error: insertError } = await supabase
          .from("products")
          .insert(rows);

        if (insertError) {
          errors.push(`${platformLabels[i]}: ${insertError.message}`);
        }
      } else if (result.status === "rejected") {
        errors.push(`${platformLabels[i]}: ${result.reason}`);
      }
    }

    // Update scan history
    if (scanId) {
      try {
        await supabase
          .from("scan_history")
          .update({
            status: errors.length === 0 ? "completed" : "completed",
            completed_at: new Date().toISOString(),
            products_found: totalProducts,
            hot_products: hotProducts,
            cost_estimate: scan_mode === "quick" ? 0.1 : 0.5,
            progress: 100,
            log: errors.length > 0 ? errors : [],
          })
          .eq("id", scanId);
      } catch {
        // Best effort
      }
    }

    // Send email alerts for HOT (80+) and PRE-VIRAL (85+) products
    if (hotProducts > 0 && user.email) {
      try {
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === "fulfilled") {
            for (const p of result.value) {
              if ((p.score || 0) >= 80) {
                await sendProductAlert(user.email, p.title, p.score || 0);
              }
            }
          }
        }
      } catch {
        // Best effort — don't block scan completion
      }
    }

    return NextResponse.json({
      status: "completed",
      scan_mode,
      products_found: totalProducts,
      hot_products: hotProducts,
      platforms_scanned: platformLabels,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
