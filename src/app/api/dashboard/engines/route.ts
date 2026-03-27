import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateClient } from "@/lib/auth/client-api-auth";
import { PRICING_TIERS } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// GET: List engines available to client based on subscription
export async function GET(req: NextRequest) {
  let auth;
  try {
    auth = await authenticateClient(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSb = createAdminClient();

  // Get client's engine toggles from DB
  const { data: toggles } = await adminSb
    .from("engine_toggles")
    .select("engine, enabled, config")
    .eq("client_id", auth.clientId);

  // Build engine list with entitlement info
  const allEngines = [
    { id: "discovery", name: "Product Discovery", description: "AI-powered product trend detection" },
    { id: "analytics", name: "Analytics & Tracking", description: "Performance metrics and profit tracking" },
    { id: "content", name: "Content Creation", description: "AI-generated marketing content" },
    { id: "influencer", name: "Influencer Outreach", description: "Creator matching and outreach automation" },
    { id: "supplier", name: "Supplier Intelligence", description: "Supplier discovery and comparison" },
    { id: "marketing", name: "Marketing & Ads", description: "Ad campaign management and optimization" },
    { id: "store_integration", name: "Store Integration", description: "Push products to Shopify, TikTok, Amazon" },
    { id: "affiliate", name: "AI Affiliate Revenue", description: "Affiliate program discovery and automation" },
  ];

  const allowedEngines = auth.subscription?.engines || [];
  const toggleMap = new Map((toggles || []).map((t) => [t.engine, t]));

  const engines = allEngines.map((engine) => {
    const toggle = toggleMap.get(engine.id);
    const entitled = allowedEngines.includes(engine.id);
    return {
      ...engine,
      entitled,
      enabled: entitled && (toggle?.enabled ?? true),
      config: toggle?.config || null,
      requiredPlan: getMinimumPlan(engine.id),
    };
  });

  return NextResponse.json({ engines, plan: auth.subscription?.plan || null });
}

// POST: Toggle an engine on/off
export async function POST(req: NextRequest) {
  let auth;
  try {
    auth = await authenticateClient(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { engineId, enabled } = body;

  if (!engineId || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "engineId and enabled are required" }, { status: 400 });
  }

  // Verify client is entitled to this engine
  const allowedEngines = auth.subscription?.engines || [];
  if (!allowedEngines.includes(engineId)) {
    return NextResponse.json(
      { error: "Engine not included in your plan. Upgrade to access this feature." },
      { status: 403 }
    );
  }

  const adminSb = createAdminClient();

  const { error } = await adminSb
    .from("engine_toggles")
    .upsert(
      { client_id: auth.clientId, engine: engineId, enabled },
      { onConflict: "client_id,engine" }
    );

  if (error) {
    return NextResponse.json({ error: "Failed to update engine" }, { status: 500 });
  }

  return NextResponse.json({ engineId, enabled });
}

function getMinimumPlan(engineId: string): string {
  for (const [, tier] of Object.entries(PRICING_TIERS)) {
    if ((tier.engines as readonly string[]).includes(engineId)) return tier.name;
  }
  return "Enterprise";
}
