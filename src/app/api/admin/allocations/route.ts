import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch pending product requests with client names
    const { data: pendingData } = await supabase
      .from("product_requests")
      .select("id, platform, note, requested_at, status, clients(name)")
      .eq("status", "pending")
      .order("requested_at", { ascending: false })
      .limit(50);

    const pending = (pendingData || []).map((req: Record<string, unknown>) => ({
      id: req.id,
      client_name: (req.clients as Record<string, unknown>)?.name || "Unknown",
      platform: req.platform || "any",
      note: req.note || "",
      requested_at: req.requested_at,
      status: req.status,
    }));

    // Fetch recent allocations with product and client names
    const { data: recentData } = await supabase
      .from("product_allocations")
      .select("id, platform, allocated_at, clients(name), products(title)")
      .order("allocated_at", { ascending: false })
      .limit(20);

    const recent = (recentData || []).map((alloc: Record<string, unknown>) => ({
      id: alloc.id,
      client_name: (alloc.clients as Record<string, unknown>)?.name || "Unknown",
      product_name: (alloc.products as Record<string, unknown>)?.title || "Unknown",
      platform: alloc.platform || "any",
      allocated_at: alloc.allocated_at,
    }));

    return NextResponse.json({ pending, recent });
  } catch {
    return NextResponse.json({ pending: [], recent: [] });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { client_id, product_id, platform, notes } = body;

    if (!client_id || !product_id) {
      return NextResponse.json({ error: "client_id and product_id are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("product_allocations")
      .insert({
        client_id,
        product_id,
        platform,
        notes,
        allocated_by: user.id,
        visible_to_client: true,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ allocation: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
