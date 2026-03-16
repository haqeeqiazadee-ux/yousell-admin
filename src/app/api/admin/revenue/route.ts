import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { PRICING_TIERS } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await authenticateAdmin(req);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminSb = createAdminClient();

  const [subsResult, clientsResult, usageResult] = await Promise.all([
    adminSb
      .from("subscriptions")
      .select("id, client_id, plan, status, current_period_start, current_period_end, cancel_at_period_end, created_at"),
    adminSb
      .from("clients")
      .select("id, name, email, plan, created_at"),
    adminSb
      .from("usage_tracking")
      .select("client_id, metric, count, period_start, period_end"),
  ]);

  const subs = subsResult.data || [];
  const clients = clientsResult.data || [];
  const usage = usageResult.data || [];

  // MRR calculation
  const activeSubs = subs.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((sum, sub) => {
    const tier = PRICING_TIERS[sub.plan as keyof typeof PRICING_TIERS];
    return sum + (tier?.price || 0);
  }, 0);

  // Plan breakdown
  const planBreakdown: Record<string, { count: number; revenue: number }> = {};
  for (const sub of activeSubs) {
    const plan = sub.plan || "free";
    const tier = PRICING_TIERS[plan as keyof typeof PRICING_TIERS];
    if (!planBreakdown[plan]) planBreakdown[plan] = { count: 0, revenue: 0 };
    planBreakdown[plan].count += 1;
    planBreakdown[plan].revenue += tier?.price || 0;
  }

  // Churn: subscriptions that were cancelled
  const cancelledSubs = subs.filter((s) => s.status === "canceled");
  const churningSubs = activeSubs.filter((s) => s.cancel_at_period_end);

  // Client growth: clients created in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const newClients = clients.filter((c) => c.created_at > thirtyDaysAgo);

  // Usage summary: aggregate by metric
  const usageSummary: Record<string, number> = {};
  for (const u of usage) {
    usageSummary[u.metric] = (usageSummary[u.metric] || 0) + (u.count || 0);
  }

  return NextResponse.json({
    mrr,
    arr: mrr * 12,
    activeSubscriptions: activeSubs.length,
    totalClients: clients.length,
    planBreakdown,
    churn: {
      cancelled: cancelledSubs.length,
      pendingCancellation: churningSubs.length,
    },
    growth: {
      newClientsLast30Days: newClients.length,
      conversionRate: clients.length > 0
        ? Math.round((activeSubs.length / clients.length) * 100)
        : 0,
    },
    usageSummary,
    recentSubscriptions: activeSubs
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 10)
      .map((s) => ({
        id: s.id,
        clientId: s.client_id,
        plan: s.plan,
        status: s.status,
        createdAt: s.created_at,
        periodEnd: s.current_period_end,
      })),
  });
}
