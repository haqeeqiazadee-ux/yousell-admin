import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchTikTokProducts } from "@/lib/providers/tiktok";
import { searchAmazonProducts } from "@/lib/providers/amazon";
import { searchShopifyProducts } from "@/lib/providers/shopify";
import { searchPinterestProducts } from "@/lib/providers/pinterest";
import { searchTrends } from "@/lib/providers/trends";
import type { ProductResult } from "@/lib/providers/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .order("started_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Check if at least one scraping provider is configured
    const hasApify = !!process.env.APIFY_API_TOKEN && !process.env.APIFY_API_TOKEN.includes("your-");
    const hasRapidApi = !!process.env.RAPIDAPI_KEY && !process.env.RAPIDAPI_KEY.includes("your-");
    const engineReady = hasApify || hasRapidApi;

    return NextResponse.json({ scans: data || [], engine_ready: engineReady });
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
      : ["trending products", "viral products 2024", "best sellers"];

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

    // Run trends search
    if (scan_mode === "full") {
      searchTrends(searchTerms).catch(console.error);
    }

    const results = await Promise.allSettled(scanPromises);

    // Collect all products
    let totalProducts = 0;
    const errors: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled" && result.value.length > 0) {
        const products = result.value;
        totalProducts += products.length;

        // Upsert products into Supabase
        const rows = products.map((p) => ({
          title: p.title,
          platform: p.platform,
          price: p.price,
          currency: p.currency,
          image_url: p.imageUrl || null,
          url: p.url,
          score_overall: p.score || null,
          metadata: p.metadata,
          status: "active",
        }));

        const { error: insertError } = await supabase
          .from("products")
          .upsert(rows, { onConflict: "url", ignoreDuplicates: true });

        if (insertError) {
          // If upsert fails (e.g., no unique constraint on url), try regular insert
          const { error: fallbackError } = await supabase
            .from("products")
            .insert(rows);
          if (fallbackError) {
            errors.push(`${platformLabels[i]}: ${fallbackError.message}`);
          }
        }
      } else if (result.status === "rejected") {
        errors.push(`${platformLabels[i]}: ${result.reason}`);
      }
    }

    return NextResponse.json({
      status: "completed",
      scan_mode,
      products_found: totalProducts,
      platforms_scanned: platformLabels,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
