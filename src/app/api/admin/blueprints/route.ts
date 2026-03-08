import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/admin/blueprints?product_id=xxx — get blueprint for a product
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (productId) {
      const { data, error } = await supabase
        .from("launch_blueprints")
        .select("*")
        .eq("product_id", productId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ blueprint: data || null });
    }

    const { data, error, count } = await supabase
      .from("launch_blueprints")
      .select("*, products(title, platform, final_score)", { count: "exact" })
      .order("generated_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ blueprints: data || [], total: count || 0 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/blueprints — generate launch blueprint (Claude Sonnet, on-demand only for 60+ products)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Fetch product to check score
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const score = product.final_score || product.score_overall || 0;
    if (score < 60) {
      return NextResponse.json(
        { error: `Product score ${score} is below 60 minimum for blueprint generation` },
        { status: 400 }
      );
    }

    // TODO Phase 16: Replace with actual Claude Sonnet API call
    // For now, generate a structured placeholder blueprint
    const blueprint = {
      positioning: `[MOCK] ${product.title} is positioned as a ${product.trend_stage || "rising"} product in the ${product.category || "general"} category. Target early adopters seeking value in the $${product.price || "20-50"} range.`,
      product_page_content: `[MOCK] SEO Title: "${product.title} - Premium Quality | Free Shipping"\nBenefit bullets:\n- High-quality materials\n- Fast shipping\n- 30-day returns\n- Trending on social media`,
      pricing_strategy: `[MOCK] Recommended retail: $${product.price || 29.99}. Bundle discount: Buy 2 get 10% off. Launch offer: 15% off first week.`,
      video_script: `[MOCK] 15-second script:\n[0-3s] Hook: "This product is going viral for a reason..."\n[3-8s] Demo: Show product in use\n[8-12s] Social proof: "Over 10K sold this week"\n[12-15s] CTA: "Link in bio - limited stock"`,
      ad_blueprint: `[MOCK] TikTok: User-generated content style, target 18-34\nMeta: Carousel ads showcasing product benefits\nGoogle: Search ads targeting "${product.category}" keywords`,
      launch_timeline: `[MOCK] Day 1-3: Seed to micro-influencers\nDay 4-7: Launch TikTok + Meta ads\nDay 8-14: Scale winning creatives\nDay 15-30: Optimize and expand to Google`,
      risk_notes: `[MOCK] Top 3 risks:\n1. Competition may increase rapidly - mitigate with brand differentiation\n2. Supply chain delays - maintain 2-week buffer stock\n3. Ad costs may spike - diversify across platforms`,
    };

    // Store blueprint
    const { data, error } = await supabase
      .from("launch_blueprints")
      .insert({
        product_id: productId,
        ...blueprint,
        generated_by: "mock-sonnet",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ blueprint: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
