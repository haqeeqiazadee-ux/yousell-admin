import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const totalCosts = costs
      ? Object.values(costs as Record<string, number>).reduce((sum: number, v: number) => sum + (v || 0), 0)
      : 0;
    const grossMargin = retailPrice > 0 ? (retailPrice - totalCosts) / retailPrice : 0;
    const velocity = monthlyVelocity || 100;
    const breakEvenUnits = grossMargin > 0 ? Math.ceil(totalCosts / (retailPrice * grossMargin)) : 0;

    const riskFlags: string[] = [];
    if (isHazardous) riskFlags.push("hazardous_material");
    if (isFragile) riskFlags.push("fragile");
    if (requiresSpecialCert) riskFlags.push("special_cert_required");
    if (!hasUsSupplier) riskFlags.push("no_us_supplier");
    if ((supplierLeadTime ?? 30) > 45) riskFlags.push("long_lead_time");

    const autoRejected = grossMargin < 0.15 || riskFlags.length >= 3;
    const rejectionReasons: string[] = [];
    if (grossMargin < 0.15) rejectionReasons.push("Margin below 15%");
    if (riskFlags.length >= 3) rejectionReasons.push("Too many risk flags");

    // Store financial model
    const { data, error } = await supabase
      .from("financial_models")
      .insert({
        product_id: productId,
        retail_price: retailPrice,
        total_cost: totalCosts,
        gross_margin: grossMargin,
        break_even_units: breakEvenUnits,
        influencer_roi: null,
        ad_roas_estimate: null,
        revenue_30day: velocity * retailPrice,
        revenue_60day: velocity * retailPrice * 2,
        revenue_90day: velocity * retailPrice * 3,
        cost_breakdown: costs || {},
        risk_flags: riskFlags,
        auto_rejected: autoRejected,
        rejection_reason: rejectionReasons.join("; ") || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ model: data, analysis: { totalCost: totalCosts, grossMargin, breakEvenUnits, riskFlags, autoRejected, rejectionReasons } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
