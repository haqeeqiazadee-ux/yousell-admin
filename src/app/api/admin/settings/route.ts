import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";
import { PROVIDERS, getEnvVar } from "@/lib/providers/config";

// GET /api/admin/settings — returns provider status and saved settings
export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: { user } } = await supabase.auth.getUser();

  // Load saved API keys from database
  const { data: savedKeysRow } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "api_keys")
    .single();

  const savedKeys: Record<string, string> = savedKeysRow?.value ?? {};

  // Check which providers are configured via env vars OR saved DB keys
  const providerStatus = PROVIDERS.map((provider) => ({
    id: provider.id,
    name: provider.name,
    description: provider.description,
    category: provider.category,
    phase: provider.phase,
    freeQuota: provider.freeQuota,
    pendingApproval: provider.pendingApproval,
    fallback: provider.fallback,
    configured: provider.envKeys.every((key) => !!getEnvVar(key) || !!savedKeys[key]),
    envKeys: provider.envKeys.map((key) => ({
      key,
      set: !!getEnvVar(key) || !!savedKeys[key],
      source: getEnvVar(key) ? "env" as const : savedKeys[key] ? "db" as const : null,
    })),
  }));

  // Load other saved settings from database
  const { data: settings } = await supabase
    .from("admin_settings")
    .select("key, value")
    .neq("key", "api_keys");

  return NextResponse.json({
    providers: providerStatus,
    settings: settings || [],
  });
}

// POST /api/admin/settings — save API keys or other settings
export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();

  // Handle API key saves
  if (body.apiKeys) {
    const keys: Record<string, string> = body.apiKeys;

    // Load existing saved keys
    const { data: existing } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "api_keys")
      .single();

    const merged: Record<string, string> = existing?.value ?? {};

    // Merge new keys (empty string = delete)
    for (const [k, v] of Object.entries(keys)) {
      if (v === "") {
        delete merged[k];
      } else {
        merged[k] = v;
      }
    }

    const { error } = await supabase.from("admin_settings").upsert(
      {
        key: "api_keys",
        value: merged,
        updated_by: user!.id,
      },
      { onConflict: "key" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  // Handle generic settings
  const { key, value } = body;

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const { error } = await supabase.from("admin_settings").upsert(
    {
      key,
      value,
      updated_by: user!.id,
    },
    { onConflict: "key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
