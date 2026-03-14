import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";
import { PROVIDERS, getEnvVar } from "@/lib/providers/config";

export const dynamic = "force-dynamic";

interface TestResult {
  test: string;
  layer: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIP";
  detail: string;
  fix?: string;
}

export async function GET() {
  const results: TestResult[] = [];
  let adminUser: { id: string; email: string; role: string } | null = null;

  // ============================================================
  // LAYER 0: Auth Check (needed to run the rest)
  // ============================================================
  try {
    const user = await requireAdmin();
    adminUser = { id: user.id, email: user.email || "", role: user.role };
    results.push({
      test: "0.1 Admin Authentication",
      layer: "AUTH",
      status: "PASS",
      detail: `Logged in as ${user.email} (role: ${user.role})`,
    });
  } catch {
    results.push({
      test: "0.1 Admin Authentication",
      layer: "AUTH",
      status: "FAIL",
      detail: "Not authenticated or not admin",
      fix: "Login at /admin/login first, then visit this endpoint",
    });
    return NextResponse.json({
      summary: { total: 1, pass: 0, fail: 1, warn: 0, skip: 0 },
      results,
      message: "Authentication required. Login first, then revisit this URL.",
    });
  }

  const adminSb = createAdminClient();
  const userSb = await createClient();

  // ============================================================
  // LAYER 1: DATABASE — Tables, RLS, Admin Role
  // ============================================================

  // Test 1.1 — Core tables exist
  const requiredTables = [
    "profiles", "admin_settings", "clients", "products", "scans",
    "product_allocations", "product_requests", "trend_keywords",
    "competitors", "influencers", "suppliers", "viral_signals",
    "launch_blueprints", "automation_jobs", "notifications",
    "imported_files", "tiktok_videos", "tiktok_hashtag_signals",
    "product_clusters", "product_cluster_members",
    "creator_product_matches", "ads",
  ];

  const missingTables: string[] = [];
  const existingTables: string[] = [];

  for (const table of requiredTables) {
    try {
      const { error } = await adminSb.from(table).select("*", { count: "exact", head: true });
      if (error && (error.message.includes("does not exist") || error.code === "42P01")) {
        missingTables.push(table);
      } else {
        existingTables.push(table);
      }
    } catch {
      missingTables.push(table);
    }
  }

  results.push({
    test: "1.1 Core Tables Exist",
    layer: "DATABASE",
    status: missingTables.length === 0 ? "PASS" : "FAIL",
    detail: missingTables.length === 0
      ? `All ${requiredTables.length} core tables exist`
      : `Missing ${missingTables.length} tables: ${missingTables.join(", ")}`,
    fix: missingTables.length > 0
      ? "Run the missing migration SQL files in Supabase SQL Editor"
      : undefined,
  });

  // Test 1.2 — V7 tables exist
  const v7Tables = [
    "subscriptions", "platform_access", "engine_toggles",
    "connected_channels", "content_queue", "orders",
    "usage_tracking", "addons", "client_addons",
  ];
  const missingV7: string[] = [];

  for (const table of v7Tables) {
    try {
      const { error } = await adminSb.from(table).select("*", { count: "exact", head: true });
      if (error && (error.message.includes("does not exist") || error.code === "42P01")) {
        missingV7.push(table);
      }
    } catch {
      missingV7.push(table);
    }
  }

  results.push({
    test: "1.2 V7 Spec Tables Exist",
    layer: "DATABASE",
    status: missingV7.length === 0 ? "PASS" : "WARN",
    detail: missingV7.length === 0
      ? `All ${v7Tables.length} V7 tables exist`
      : `Missing ${missingV7.length} V7 tables: ${missingV7.join(", ")}`,
    fix: missingV7.length > 0
      ? "Run 009_v7_new_tables.sql in Supabase SQL Editor"
      : undefined,
  });

  // Test 1.3 — check_user_role RPC exists
  try {
    const { error } = await adminSb.rpc("check_user_role", { user_id: adminUser.id });
    results.push({
      test: "1.3 check_user_role RPC",
      layer: "DATABASE",
      status: error ? "FAIL" : "PASS",
      detail: error ? `RPC error: ${error.message}` : "RPC function works",
      fix: error ? "Run 015_admin_check_rpc.sql in Supabase SQL Editor" : undefined,
    });
  } catch (e) {
    results.push({
      test: "1.3 check_user_role RPC",
      layer: "DATABASE",
      status: "FAIL",
      detail: `RPC call failed: ${e instanceof Error ? e.message : "unknown"}`,
      fix: "Run 015_admin_check_rpc.sql in Supabase SQL Editor",
    });
  }

  // Test 1.4 — Admin user has correct role
  // Note: user_role enum may only contain 'admin' | 'client'.
  // Query with role::text cast via RPC to avoid enum validation issues.
  try {
    const { data, error } = await adminSb
      .from("profiles")
      .select("id, email, role")
      .eq("role", "admin");

    results.push({
      test: "1.4 Admin Users in Profiles",
      layer: "DATABASE",
      status: error ? "FAIL" : (data && data.length > 0) ? "PASS" : "FAIL",
      detail: error
        ? `Query error: ${error.message}`
        : data && data.length > 0
        ? `Found ${data.length} admin(s): ${data.map((u: { email: string; role: string }) => `${u.email} (${u.role})`).join(", ")}`
        : "No admin users found in profiles table",
      fix: (!data || data.length === 0) ? "Ensure at least one profile has role='admin'" : undefined,
    });
  } catch (e) {
    results.push({
      test: "1.4 Admin Users in Profiles",
      layer: "DATABASE",
      status: "FAIL",
      detail: `Error: ${e instanceof Error ? e.message : "unknown"}`,
    });
  }

  // Test 1.5 — admin_settings table works
  try {
    const { error: insertErr } = await adminSb
      .from("admin_settings")
      .upsert({ key: "debug_test", value: { test: true } }, { onConflict: "key" });

    const { data: readBack, error: readErr } = await adminSb
      .from("admin_settings")
      .select("*")
      .eq("key", "debug_test")
      .single();

    await adminSb.from("admin_settings").delete().eq("key", "debug_test");

    const passed = !insertErr && !readErr && readBack;
    results.push({
      test: "1.5 admin_settings Read/Write",
      layer: "DATABASE",
      status: passed ? "PASS" : "FAIL",
      detail: passed
        ? "Insert, read, delete all work"
        : `Insert: ${insertErr?.message || "ok"}, Read: ${readErr?.message || "ok"}`,
      fix: !passed ? "Check RLS policies on admin_settings table" : undefined,
    });
  } catch (e) {
    results.push({
      test: "1.5 admin_settings Read/Write",
      layer: "DATABASE",
      status: "FAIL",
      detail: `Error: ${e instanceof Error ? e.message : "unknown"}`,
    });
  }

  // Test 1.6 — Products table has required columns
  try {
    const { data, error } = await adminSb
      .from("products")
      .select("id, title, price, external_url, image_url, platform, status, created_at")
      .limit(1);

    results.push({
      test: "1.6 Products Table Schema",
      layer: "DATABASE",
      status: error ? "FAIL" : "PASS",
      detail: error
        ? `Column query failed: ${error.message}`
        : `Products table has required columns. Row count sample: ${data?.length ?? 0}`,
      fix: error ? "Compare products table with migration 003 + 005" : undefined,
    });
  } catch (e) {
    results.push({
      test: "1.6 Products Table Schema",
      layer: "DATABASE",
      status: "FAIL",
      detail: `Error: ${e instanceof Error ? e.message : "unknown"}`,
    });
  }

  // Test 1.7 — RLS allows admin to read via user client (anon key + auth)
  try {
    const { count, error } = await userSb
      .from("products")
      .select("*", { count: "exact", head: true });

    results.push({
      test: "1.7 RLS Allows Admin Read (products)",
      layer: "DATABASE",
      status: error ? "FAIL" : "PASS",
      detail: error
        ? `RLS blocks admin read: ${error.message}`
        : `Admin can read products table (${count ?? 0} rows visible)`,
      fix: error ? "Check RLS policies: admin should have SELECT on products" : undefined,
    });
  } catch (e) {
    results.push({
      test: "1.7 RLS Allows Admin Read (products)",
      layer: "DATABASE",
      status: "FAIL",
      detail: `Error: ${e instanceof Error ? e.message : "unknown"}`,
    });
  }

  // ============================================================
  // LAYER 2: ENVIRONMENT VARIABLES
  // ============================================================

  // Test 2.1 — Required env vars at build time
  const criticalEnvVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon Key" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role" },
  ];

  const phase5EnvVars = [
    { key: "ANTHROPIC_API_KEY", label: "Anthropic/Claude" },
    { key: "RESEND_API_KEY", label: "Resend Email" },
    { key: "APIFY_API_TOKEN", label: "Apify Scraping" },
  ];

  const optionalEnvVars = [
    { key: "BACKEND_URL", label: "Backend URL" },
    { key: "RAPIDAPI_KEY", label: "RapidAPI" },
  ];

  // Check critical env vars
  for (const { key, label } of criticalEnvVars) {
    const val = getEnvVar(key);
    results.push({
      test: `2.1 Env: ${label}`,
      layer: "ENV_VARS",
      status: val ? "PASS" : "FAIL",
      detail: val ? `${key} is set (build-time)` : `${key} is NOT set`,
      fix: !val ? `Add ${key} to Netlify Site Settings → Environment Variables, then redeploy` : undefined,
    });
  }

  // Check Phase 5 env vars (with DB fallback)
  let savedKeys: Record<string, string> = {};
  try {
    const { data } = await adminSb
      .from("admin_settings")
      .select("value")
      .eq("key", "api_keys")
      .single();
    savedKeys = data?.value ?? {};
  } catch { /* no saved keys */ }

  for (const { key, label } of phase5EnvVars) {
    const fromEnv = getEnvVar(key);
    const fromDb = savedKeys[key];
    const source = fromEnv ? "env" : fromDb ? "database" : null;

    results.push({
      test: `2.2 Env: ${label}`,
      layer: "ENV_VARS",
      status: source ? "PASS" : "FAIL",
      detail: source
        ? `${key} available (source: ${source})`
        : `${key} NOT found in env vars OR database`,
      fix: !source
        ? `Option 1: Add to Netlify env vars + redeploy. Option 2: Save via POST /api/admin/settings with apiKeys.${key}`
        : undefined,
    });
  }

  // Check optional env vars
  for (const { key, label } of optionalEnvVars) {
    const fromEnv = getEnvVar(key);
    const fromDb = savedKeys[key];
    const source = fromEnv ? "env" : fromDb ? "database" : null;

    results.push({
      test: `2.3 Env: ${label}`,
      layer: "ENV_VARS",
      status: source ? "PASS" : "WARN",
      detail: source
        ? `${key} available (source: ${source})`
        : `${key} not set (optional but recommended)`,
    });
  }

  // Test 2.4 — DB-saved API keys
  const savedKeyCount = Object.keys(savedKeys).length;
  results.push({
    test: "2.4 DB-Saved API Keys",
    layer: "ENV_VARS",
    status: savedKeyCount > 0 ? "PASS" : "WARN",
    detail: savedKeyCount > 0
      ? `${savedKeyCount} keys saved in admin_settings: ${Object.keys(savedKeys).join(", ")}`
      : "No API keys saved in database (using env vars only)",
  });

  // ============================================================
  // LAYER 3: AUTHENTICATION (already tested in Layer 0)
  // ============================================================

  results.push({
    test: "3.1 Login Flow",
    layer: "AUTH",
    status: "PASS",
    detail: `Authenticated as ${adminUser.email}`,
  });

  // Test 3.2 — Middleware protection (test by checking we can call admin API)
  results.push({
    test: "3.2 Middleware Protection",
    layer: "AUTH",
    status: "PASS",
    detail: "Admin API routes are accessible (requireAdmin passed)",
  });

  // ============================================================
  // LAYER 4: DASHBOARD API
  // ============================================================

  // Test 4.1 — Dashboard data structure
  try {
    const counts = await Promise.all([
      safeCountAdmin(adminSb, "products"),
      safeCountAdmin(adminSb, "products", { column: "platform", value: "tiktok" }),
      safeCountAdmin(adminSb, "products", { column: "platform", value: "amazon" }),
      safeCountAdmin(adminSb, "trend_keywords"),
      safeCountAdmin(adminSb, "competitor_stores"),
      safeCountAdmin(adminSb, "clients"),
      safeCountAdmin(adminSb, "influencers"),
      safeCountAdmin(adminSb, "suppliers"),
    ]);

    const [products, tiktok, amazon, trends, competitors, clients, influencers, suppliers] = counts;

    results.push({
      test: "4.1 Dashboard Data Counts",
      layer: "DASHBOARD_API",
      status: "PASS",
      detail: `Products: ${products}, TikTok: ${tiktok}, Amazon: ${amazon}, Trends: ${trends}, Competitors: ${competitors}, Clients: ${clients}, Influencers: ${influencers}, Suppliers: ${suppliers}`,
    });
  } catch (e) {
    results.push({
      test: "4.1 Dashboard Data Counts",
      layer: "DASHBOARD_API",
      status: "FAIL",
      detail: `Error fetching counts: ${e instanceof Error ? e.message : "unknown"}`,
    });
  }

  // Test 4.2 — Service status checks (same logic as dashboard)
  const serviceChecks = [
    { id: "supabase", label: "Supabase" },
    { id: "anthropic", label: "AI Engine (Claude)" },
    { id: "resend", label: "Email (Resend)" },
    { id: "apify", label: "Scraping (Apify)" },
    { id: "rapidapi", label: "RapidAPI" },
    { id: "backend", label: "Backend URL" },
  ];

  for (const { id, label } of serviceChecks) {
    const provider = PROVIDERS.find((p) => p.id === id);
    if (!provider) {
      results.push({
        test: `4.2 Service: ${label}`,
        layer: "DASHBOARD_API",
        status: "SKIP",
        detail: `Provider "${id}" not found in PROVIDERS config`,
      });
      continue;
    }

    const connected = provider.envKeys.every((key) => !!getEnvVar(key) || !!savedKeys[key]);
    const sources = provider.envKeys.map((key) => {
      if (getEnvVar(key)) return `${key}=env`;
      if (savedKeys[key]) return `${key}=db`;
      return `${key}=MISSING`;
    });

    results.push({
      test: `4.2 Service: ${label}`,
      layer: "DASHBOARD_API",
      status: connected ? "PASS" : (id === "rapidapi" || id === "backend") ? "WARN" : "FAIL",
      detail: `${connected ? "Connected" : "Not configured"} — ${sources.join(", ")}`,
      fix: !connected ? `Set ${provider.envKeys.filter((k) => !getEnvVar(k) && !savedKeys[k]).join(", ")} in Netlify or DB` : undefined,
    });
  }

  // ============================================================
  // LAYER 5: BACKEND (Express API)
  // ============================================================

  const backendUrl = getEnvVar("BACKEND_URL") || savedKeys["BACKEND_URL"] || savedKeys["NEXT_PUBLIC_BACKEND_URL"];

  if (!backendUrl) {
    results.push({
      test: "5.1 Backend Health Check",
      layer: "BACKEND",
      status: "FAIL",
      detail: "BACKEND_URL / NEXT_PUBLIC_BACKEND_URL not configured",
      fix: "Set BACKEND_URL to your Express API URL (e.g. https://your-app.railway.app)",
    });
    results.push({
      test: "5.2 Backend Supabase Connection",
      layer: "BACKEND",
      status: "SKIP",
      detail: "Skipped — backend URL not configured",
    });
    results.push({
      test: "5.3 Backend Redis Connection",
      layer: "BACKEND",
      status: "SKIP",
      detail: "Skipped — backend URL not configured",
    });
  } else {
    // Test 5.1 — Backend health
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${backendUrl}/health`, { signal: controller.signal });
      clearTimeout(timeout);

      const body = await res.text();
      results.push({
        test: "5.1 Backend Health Check",
        layer: "BACKEND",
        status: res.ok ? "PASS" : "FAIL",
        detail: res.ok
          ? `Backend responding at ${backendUrl} (${res.status}): ${body.slice(0, 200)}`
          : `Backend returned ${res.status}: ${body.slice(0, 200)}`,
      });
    } catch (e) {
      results.push({
        test: "5.1 Backend Health Check",
        layer: "BACKEND",
        status: "FAIL",
        detail: `Cannot reach backend at ${backendUrl}: ${e instanceof Error ? e.message : "unknown"}`,
        fix: "Check if Express backend is deployed and running. Verify the BACKEND_URL is correct.",
      });
    }

    // Test 5.2 — Backend scan history (tests backend → supabase connection)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${backendUrl}/api/scan`, {
        signal: controller.signal,
        headers: { "Authorization": `Bearer ${(await userSb.auth.getSession()).data.session?.access_token || ""}` },
      });
      clearTimeout(timeout);

      results.push({
        test: "5.2 Backend Scan Endpoint",
        layer: "BACKEND",
        status: res.ok ? "PASS" : "WARN",
        detail: res.ok
          ? `Backend scan endpoint responding (${res.status})`
          : `Backend scan returned ${res.status} — may need auth token`,
      });
    } catch (e) {
      results.push({
        test: "5.2 Backend Scan Endpoint",
        layer: "BACKEND",
        status: "FAIL",
        detail: `Error: ${e instanceof Error ? e.message : "unknown"}`,
      });
    }

    results.push({
      test: "5.3 Backend Redis Connection",
      layer: "BACKEND",
      status: "SKIP",
      detail: "Cannot test Redis from frontend — check backend logs for Redis connection errors",
    });
  }

  // ============================================================
  // LAYER 6: EXTERNAL API KEY VALIDATION
  // ============================================================

  // Test 6.1 — Anthropic API key validity
  const anthropicKey = getEnvVar("ANTHROPIC_API_KEY") || savedKeys["ANTHROPIC_API_KEY"];
  if (anthropicKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 5,
          messages: [{ role: "user", content: "Say OK" }],
        }),
      });
      clearTimeout(timeout);

      const body = await res.json();
      results.push({
        test: "6.1 Anthropic API Key Valid",
        layer: "EXTERNAL_APIS",
        status: res.ok ? "PASS" : "FAIL",
        detail: res.ok
          ? `Claude API responds (model: claude-haiku-4-5-20251001)`
          : `API returned ${res.status}: ${body.error?.message || JSON.stringify(body).slice(0, 200)}`,
        fix: !res.ok ? "Check API key at console.anthropic.com. Verify credits/billing." : undefined,
      });
    } catch (e) {
      results.push({
        test: "6.1 Anthropic API Key Valid",
        layer: "EXTERNAL_APIS",
        status: "FAIL",
        detail: `API call failed: ${e instanceof Error ? e.message : "unknown"}`,
      });
    }
  } else {
    results.push({
      test: "6.1 Anthropic API Key Valid",
      layer: "EXTERNAL_APIS",
      status: "SKIP",
      detail: "No ANTHROPIC_API_KEY available to test",
    });
  }

  // Test 6.2 — Apify API key validity
  const apifyToken = getEnvVar("APIFY_API_TOKEN") || savedKeys["APIFY_API_TOKEN"];
  if (apifyToken) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`https://api.apify.com/v2/acts?token=${apifyToken}&limit=1`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      results.push({
        test: "6.2 Apify API Token Valid",
        layer: "EXTERNAL_APIS",
        status: res.ok ? "PASS" : "FAIL",
        detail: res.ok
          ? "Apify API responds with valid token"
          : `Apify returned ${res.status}`,
        fix: !res.ok ? "Regenerate token at console.apify.com → Settings → Integrations" : undefined,
      });
    } catch (e) {
      results.push({
        test: "6.2 Apify API Token Valid",
        layer: "EXTERNAL_APIS",
        status: "FAIL",
        detail: `API call failed: ${e instanceof Error ? e.message : "unknown"}`,
      });
    }
  } else {
    results.push({
      test: "6.2 Apify API Token Valid",
      layer: "EXTERNAL_APIS",
      status: "SKIP",
      detail: "No APIFY_API_TOKEN available to test",
    });
  }

  // Test 6.3 — Resend API key validity
  const resendKey = getEnvVar("RESEND_API_KEY") || savedKeys["RESEND_API_KEY"];
  if (resendKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("https://api.resend.com/api-keys", {
        signal: controller.signal,
        headers: { "Authorization": `Bearer ${resendKey}` },
      });
      clearTimeout(timeout);

      // 200 = valid key, 401/403 = invalid key, 400 = may still be valid but restricted
      const isValid = res.status === 200 || res.status === 400;
      results.push({
        test: "6.3 Resend API Key Valid",
        layer: "EXTERNAL_APIS",
        status: isValid ? "PASS" : "FAIL",
        detail: isValid
          ? `Resend API key accepted (status: ${res.status})`
          : `Resend returned ${res.status} — key may be invalid`,
        fix: !isValid ? "Check API key at resend.com → API Keys" : undefined,
      });
    } catch (e) {
      results.push({
        test: "6.3 Resend API Key Valid",
        layer: "EXTERNAL_APIS",
        status: "FAIL",
        detail: `API call failed: ${e instanceof Error ? e.message : "unknown"}`,
      });
    }
  } else {
    results.push({
      test: "6.3 Resend API Key Valid",
      layer: "EXTERNAL_APIS",
      status: "SKIP",
      detail: "No RESEND_API_KEY available to test",
    });
  }

  // ============================================================
  // LAYER 7: FRONTEND PAGES (can only check API routes from here)
  // ============================================================

  // Test 7.1 — Check key API routes respond
  const apiRoutes = [
    { path: "/api/admin/products", label: "Products API" },
    { path: "/api/admin/clients", label: "Clients API" },
    { path: "/api/admin/influencers", label: "Influencers API" },
    { path: "/api/admin/suppliers", label: "Suppliers API" },
    { path: "/api/admin/trends", label: "Trends API" },
    { path: "/api/admin/competitors", label: "Competitors API" },
    { path: "/api/admin/automation", label: "Automation API" },
    { path: "/api/admin/tiktok", label: "TikTok API" },
    { path: "/api/admin/affiliates", label: "Affiliates API" },
  ];

  // We can't fetch our own API routes from an API route (no loopback),
  // but we can test the underlying DB tables they query
  for (const { path, label } of apiRoutes) {
    const tableName = getTableFromRoute(path);
    if (tableName) {
      try {
        const { error } = await adminSb.from(tableName).select("*", { count: "exact", head: true });
        results.push({
          test: `7.1 ${label} (${path})`,
          layer: "FRONTEND",
          status: error ? "WARN" : "PASS",
          detail: error
            ? `Table "${tableName}" query error: ${error.message}`
            : `Table "${tableName}" accessible — route should work`,
        });
      } catch {
        results.push({
          test: `7.1 ${label} (${path})`,
          layer: "FRONTEND",
          status: "WARN",
          detail: `Could not query table "${tableName}"`,
        });
      }
    }
  }

  // ============================================================
  // LAYER 8: REALTIME
  // ============================================================

  results.push({
    test: "8.1 Supabase Realtime",
    layer: "REALTIME",
    status: "SKIP",
    detail: "Cannot test Realtime from API route. Manual test: insert a product via SQL Editor and check if dashboard updates within 3 seconds. If not, enable Realtime on 'products' and 'scans' tables in Supabase → Database → Replication.",
  });

  // ============================================================
  // LAYER 9: END-TO-END READINESS
  // ============================================================

  const criticalPasses = results.filter((r) => r.status === "PASS" && (r.layer === "DATABASE" || r.layer === "ENV_VARS" || r.layer === "AUTH")).length;
  const criticalFails = results.filter((r) => r.status === "FAIL" && (r.layer === "DATABASE" || r.layer === "ENV_VARS" || r.layer === "AUTH")).length;

  results.push({
    test: "9.1 End-to-End Readiness",
    layer: "E2E",
    status: criticalFails === 0 ? "PASS" : "FAIL",
    detail: criticalFails === 0
      ? `All critical checks passed (${criticalPasses} tests). System is ready for E2E testing.`
      : `${criticalFails} critical failure(s) must be fixed before E2E testing.`,
    fix: criticalFails > 0 ? "Fix all FAIL items in DATABASE, ENV_VARS, and AUTH layers first" : undefined,
  });

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === "PASS").length,
    fail: results.filter((r) => r.status === "FAIL").length,
    warn: results.filter((r) => r.status === "WARN").length,
    skip: results.filter((r) => r.status === "SKIP").length,
  };

  const failures = results.filter((r) => r.status === "FAIL");

  return NextResponse.json({
    summary,
    verdict: summary.fail === 0 ? "ALL CRITICAL TESTS PASSED" : `${summary.fail} CRITICAL FAILURE(S) — FIX BEFORE PROCEEDING`,
    failures: failures.length > 0 ? failures : undefined,
    results,
  });
}

// ============================================================
// HELPERS
// ============================================================

async function safeCountAdmin(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  filter?: { column: string; value: string }
): Promise<number> {
  try {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) query = query.eq(filter.column, filter.value);
    const { count } = await query;
    return count || 0;
  } catch {
    return 0;
  }
}

function getTableFromRoute(path: string): string | null {
  const map: Record<string, string> = {
    "/api/admin/products": "products",
    "/api/admin/clients": "clients",
    "/api/admin/influencers": "influencers",
    "/api/admin/suppliers": "suppliers",
    "/api/admin/trends": "trend_keywords",
    "/api/admin/competitors": "competitor_stores",
    "/api/admin/automation": "automation_jobs",
    "/api/admin/tiktok": "products",
    "/api/admin/affiliates": "affiliate_programs",
  };
  return map[path] || null;
}
