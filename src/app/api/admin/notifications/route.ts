import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notifications: data || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = createAdminClient();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ notification: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
