import { NextRequest, NextResponse } from "next/server";
import { authenticateClientLite } from "@/lib/auth/client-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const client = await authenticateClientLite(req);
    const admin = createAdminClient();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    let query = admin
      .from("product_allocations")
      .select(
        `
        id,
        platform,
        rank,
        visible_to_client,
        allocated_at,
        source,
        notes,
        status,
        products:product_id (
          id,
          title,
          description,
          platform,
          channel,
          status,
          category,
          price,
          cost,
          currency,
          margin_percent,
          final_score,
          trend_score,
          viral_score,
          profit_score,
          trend_stage,
          external_url,
          image_url,
          ai_summary,
          ai_insight_haiku,
          ai_blueprint,
          tags,
          created_at,
          updated_at
        )
      `
      )
      .eq("client_id", client.clientId)
      .eq("visible_to_client", true);

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data: allocations, error: allocError } = await query;

    if (allocError) {
      return NextResponse.json({ error: allocError.message }, { status: 500 });
    }

    const products = (allocations || [])
      .filter((a) => a.products)
      .map((a) => ({
        ...(a.products as unknown as Record<string, unknown>),
        allocation_rank: a.rank,
        allocation_source: a.source,
      }));

    return NextResponse.json({ products });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    const status = message.includes("Unauthorized") || message.includes("No Authorization") ? 401 : message.includes("Not a client") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
