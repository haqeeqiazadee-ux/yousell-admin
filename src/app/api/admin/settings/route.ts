import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROVIDERS, getEnvVar } from "@/lib/providers/config";

// GET /api/admin/settings — returns provider status and saved settings
export async function GET(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const url = new URL(request.url);

  // Diagnostic endpoint: /api/admin/settings?debug=true
  if (url.searchParams.get("debug") === "true") {
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase = createAdminClient();

    let dbTest = { ok: false, error: "" };
    try {
      const { error } = await supabase
        .from("admin_settings")
        .select("key")
        .limit(1);
      if (error) {
        dbTest = { ok: false, error: error.message };
      } else {
        dbTest = { ok: true, error: "" };
      }
    } catch (e) {
      dbTest = { ok: false, error: e instanceof Error ? e.message : "unknown" };
    }

    return NextResponse.json({
      env: {
        SUPABASE_SERVICE_ROLE_KEY: hasServiceKey ? "set" : "MISSING",
        NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? "set" : "MISSING",
        BACKEND_URL: process.env.BACKEND_URL ? "set" : "missing",
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL ? "set" : "missing",
      },
      dbConnection: dbTest,
      providerCount: PROVIDERS.length,
    });
  }

  const supabase = createAdminClient();

  // Load saved API keys from database
  let savedKeys: Record<string, string> = {};
  try {
    const { data: savedKeysRow, error } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "api_keys")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine
      console.error("Failed to load saved API keys:", error.message);
    }
    savedKeys = savedKeysRow?.value ?? {};
  } catch (e) {
    console.error("Error loading API keys from DB:", e);
  }

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
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createAdminClient();
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
        updated_by: admin.id,
      },
      { onConflict: "key" }
    );

    if (error) {
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
    }

    return NextResponse.json({ success: true, saved: Object.keys(merged).length });
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
      updated_by: admin.id,
    },
    { onConflict: "key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
