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

  // Fetch all data in parallel
  const [
    productsRes, scansRes, subscriptionsRes, allocationsRes,
    trendKeywordsRes, clientsRes
  ] = await Promise.all([
    adminSb.from("products")
      .select("id, platform, final_score, trend_stage, category, created_at, trend_score, viral_score, profit_score"),
    adminSb.from("scan_history")
      .select("id, scan_mode, status, products_found, started_at, hot_products, duration_seconds")
      .order("started_at", { ascending: false })
      .limit(50),
    adminSb.from("subscriptions")
      .select("id, plan, status, created_at")
      .eq("status", "active"),
    adminSb.from("product_allocations")
      .select("id, client_id, created_at, status")
      .order("created_at", { ascending: false })
      .limit(200),
    adminSb.from("trend_keywords")
      .select("keyword, score, direction, volume")
      .order("score", { ascending: false })
      .limit(20),
    adminSb.from("clients")
      .select("id, name, created_at"),
  ]);

  const products = productsRes.data || [];
  const scans = scansRes.data || [];
  const subscriptions = subscriptionsRes.data || [];
  const allocations = allocationsRes.data || [];
  const trendKeywords = trendKeywordsRes.data || [];
  const clients = clientsRes.data || [];

  // Platform breakdown
  const platformCounts: Record<string, number> = {};
  const platformScores: Record<string, number[]> = {};
  for (const p of products) {
    const plat = p.platform || "unknown";
    platformCounts[plat] = (platformCounts[plat] || 0) + 1;
    if (!platformScores[plat]) platformScores[plat] = [];
    platformScores[plat].push(p.final_score || 0);
  }

  const platformBreakdown = Object.entries(platformCounts).map(([platform, count]) => ({
    platform,
    count,
    avgScore: Math.round(
      (platformScores[platform]?.reduce((a, b) => a + b, 0) || 0) /
      (platformScores[platform]?.length || 1)
    ),
  })).sort((a, b) => b.count - a.count);

  // Score distribution
  const scoreBuckets = [
    { range: "0-19", min: 0, max: 19, count: 0 },
    { range: "20-39", min: 20, max: 39, count: 0 },
    { range: "40-59", min: 40, max: 59, count: 0 },
    { range: "60-79", min: 60, max: 79, count: 0 },
    { range: "80-100", min: 80, max: 100, count: 0 },
  ];
  for (const p of products) {
    const score = p.final_score || 0;
    const bucket = scoreBuckets.find(b => score >= b.min && score <= b.max);
    if (bucket) bucket.count++;
  }

  // Trend stage breakdown
  const trendStages: Record<string, number> = {};
  for (const p of products) {
    const stage = p.trend_stage || "unknown";
    trendStages[stage] = (trendStages[stage] || 0) + 1;
  }

  // Scan performance over time (last 50 scans)
  const scanPerformance = scans.map(s => ({
    date: s.started_at,
    mode: s.scan_mode,
    productsFound: s.products_found || 0,
    hotProducts: s.hot_products || 0,
    duration: s.duration_seconds || 0,
    status: s.status,
  })).reverse();

  // Revenue metrics
  const mrr = subscriptions.reduce((sum: number, sub: { plan: string }) => {
    const tier = PRICING_TIERS[sub.plan as keyof typeof PRICING_TIERS];
    return sum + (tier?.price || 0);
  }, 0);

  const planBreakdown: Record<string, number> = {};
  for (const sub of subscriptions) {
    const plan = sub.plan || "free";
    planBreakdown[plan] = (planBreakdown[plan] || 0) + 1;
  }

  // Score pillar averages
  const pillarAvgs = {
    trend: 0, viral: 0, profit: 0,
  };
  if (products.length > 0) {
    let tSum = 0, vSum = 0, pSum = 0;
    for (const p of products) {
      tSum += p.trend_score || 0;
      vSum += p.viral_score || 0;
      pSum += p.profit_score || 0;
    }
    pillarAvgs.trend = Math.round(tSum / products.length);
    pillarAvgs.viral = Math.round(vSum / products.length);
    pillarAvgs.profit = Math.round(pSum / products.length);
  }

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    const cat = p.category || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    overview: {
      totalProducts: products.length,
      totalScans: scans.length,
      totalClients: clients.length,
      activeSubscriptions: subscriptions.length,
      mrr,
      totalAllocations: allocations.length,
    },
    platformBreakdown,
    scoreDistribution: scoreBuckets,
    trendStages: Object.entries(trendStages).map(([stage, count]) => ({ stage, count })),
    scanPerformance,
    planBreakdown,
    pillarAverages: pillarAvgs,
    topCategories,
    trendKeywords,
  });
}
