import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateProfitability } from "@/lib/scoring/profitability";

// GET /api/admin/financial?product_id=xxx — get financial model for a product
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (productId) {
      const { data, error } = await supabase
        .from("financial_models")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ model: data });
    }

    // List all financial models
    const { data, error, count } = await supabase
      .from("financial_models")
      .select("*, products(title, platform)", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ models: data || [], total: count || 0 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/financial — calculate and store financial model
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { productId, retailPrice, costs, monthlyVelocity, hasUsSupplier, supplierLeadTime, isHazardous, isFragile, requiresSpecialCert } = body;

    if (!productId || !retailPrice) {
      return NextResponse.json({ error: "productId and retailPrice are required" }, { status: 400 });
    }

    const result = calculateProfitability({
      retailPrice,
      costs: costs || {
        manufacturingCost: 0,
        packagingCost: 0,
        shippingCost: 0,
        threePLFbaCost: 0,
        paymentProcessing: 0,
        marketplaceFees: 0,
        influencerMarketing: 0,
        paidAds: 0,
      },
      monthlyVelocity: monthlyVelocity || 100,
      hasUsSupplier: hasUsSupplier ?? false,
      supplierLeadTime: supplierLeadTime ?? 30,
      isHazardous: isHazardous ?? false,
      isFragile: isFragile ?? false,
      requiresSpecialCert: requiresSpecialCert ?? false,
    });

    // Store financial model
    const { data, error } = await supabase
      .from("financial_models")
      .insert({
        product_id: productId,
        retail_price: retailPrice,
        total_cost: result.totalCost,
        gross_margin: result.grossMargin,
        break_even_units: result.breakEvenUnits,
        influencer_roi: null,
        ad_roas_estimate: null,
        revenue_30day: result.revenue30day,
        revenue_60day: result.revenue60day,
        revenue_90day: result.revenue90day,
        cost_breakdown: costs || {},
        risk_flags: result.riskFlags,
        auto_rejected: result.autoRejected,
        rejection_reason: result.rejectionReasons.join("; ") || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ model: data, analysis: result }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
