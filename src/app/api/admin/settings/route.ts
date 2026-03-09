import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PROVIDERS } from "@/lib/providers/config";

// GET /api/admin/settings — returns provider status and saved settings
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check which providers are configured via env vars
  const providerStatus = PROVIDERS.map((provider) => ({
    id: provider.id,
    name: provider.name,
    description: provider.description,
    category: provider.category,
    phase: provider.phase,
    freeQuota: provider.freeQuota,
    configured: provider.envKeys.every((key) => !!process.env[key]),
    envKeys: provider.envKeys.map((key) => ({
      key,
      set: !!process.env[key],
    })),
  }));

  // Load saved settings from database
  const { data: settings } = await supabase
    .from("admin_settings")
    .select("key, value");

  return NextResponse.json({
    providers: providerStatus,
    settings: settings || [],
  });
}

// POST /api/admin/settings — save a setting
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { key, value } = body;

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const { error } = await supabase.from("admin_settings").upsert(
    {
      key,
      value,
      updated_by: user.id,
    },
    { onConflict: "key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
