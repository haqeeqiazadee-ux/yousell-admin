import { NextRequest, NextResponse } from "next/server";
import { authenticateClientLite } from "@/lib/auth/client-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const client = await authenticateClientLite(req);
    const admin = createAdminClient();

    const { data: requests, error } = await admin
      .from("product_requests")
      .select("*")
      .eq("client_id", client.clientId)
      .order("requested_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests: requests || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    const status = message.includes("Unauthorized") || message.includes("No Authorization") ? 401 : message.includes("Not a client") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateClientLite(request);
    const admin = createAdminClient();

    const body = await request.json();
    const { platform, note } = body;

    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 });
    }

    const { data, error } = await admin
      .from("product_requests")
      .insert({
        client_id: client.clientId,
        platform,
        note: note || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    const status = message.includes("Unauthorized") || message.includes("No Authorization") ? 401 : message.includes("Not a client") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
