import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the client record matching the authenticated user's email
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("email", user.email!)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Query product_allocations for this client where visible_to_client is true,
    // joined with the products table
    const { data: allocations, error: allocError } = await supabase
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
      .eq("client_id", client.id)
      .eq("visible_to_client", true);

    if (allocError) {
      return NextResponse.json(
        { error: allocError.message },
        { status: 500 }
      );
    }

    // Flatten to product objects, preserving allocation metadata
    const products = (allocations || [])
      .filter((a) => a.products)
      .map((a) => ({
        ...(a.products as unknown as Record<string, unknown>),
        allocation_rank: a.rank,
        allocation_source: a.source,
      }));

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
