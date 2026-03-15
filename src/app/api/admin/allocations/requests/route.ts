import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

export async function PATCH(req: NextRequest) {
  try {
    await authenticateAdmin(req);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabaseAdmin = createAdminClient();
  const body = await req.json();
  const { requestId, status } = body;

  if (!requestId || !["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "requestId and status (approved/rejected) are required" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("product_requests")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }

  return NextResponse.json({ success: true, status });
}
