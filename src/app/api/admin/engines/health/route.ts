import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateAdmin } from '@/lib/auth/admin-api-auth';

/**
 * GET /api/admin/engines/health
 * Returns health status of all intelligence engine dependencies.
 */
export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const admin = createAdminClient();
  const checks: Array<{ name: string; status: 'ok' | 'error' | 'missing'; detail: string }> = [];

  // Check required tables
  const tables = [
    { name: 'products', engine: 'Discovery + Scoring' },
    { name: 'scan_history', engine: 'Scan Control' },
    { name: 'influencers', engine: 'Creator Matching' },
    { name: 'trend_keywords', engine: 'Trend Detection' },
    { name: 'product_clusters', engine: 'Clustering' },
    { name: 'product_cluster_members', engine: 'Clustering' },
    { name: 'creator_product_matches', engine: 'Creator Matching' },
    { name: 'ads', engine: 'Ad Intelligence' },
    { name: 'tiktok_videos', engine: 'TikTok Discovery' },
    { name: 'tiktok_hashtag_signals', engine: 'TikTok Signals' },
  ];

  for (const table of tables) {
    const { error } = await admin.from(table.name).select('id').limit(0);
    if (error) {
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        checks.push({ name: `table:${table.name}`, status: 'missing', detail: `Required by ${table.engine}` });
      } else {
        checks.push({ name: `table:${table.name}`, status: 'error', detail: error.message });
      }
    } else {
      checks.push({ name: `table:${table.name}`, status: 'ok', detail: table.engine });
    }
  }

  // Check API keys
  const apiKeys = [
    { name: 'APIFY_API_TOKEN', engines: 'TikTok Discovery, Shopify Scan, Pinterest Scan, Ad Intelligence' },
    { name: 'RAPIDAPI_KEY', engines: 'Amazon Product Search' },
    { name: 'ANTHROPIC_API_KEY', engines: 'AI Scoring (Haiku/Sonnet)' },
  ];

  for (const key of apiKeys) {
    checks.push({
      name: `env:${key.name}`,
      status: process.env[key.name] ? 'ok' : 'missing',
      detail: key.engines,
    });
  }

  // Check product data
  const { count: productCount } = await admin.from('products').select('id', { count: 'exact', head: true });
  checks.push({
    name: 'data:products',
    status: (productCount ?? 0) > 0 ? 'ok' : 'missing',
    detail: `${productCount ?? 0} products in database`,
  });

  const { count: influencerCount } = await admin.from('influencers').select('id', { count: 'exact', head: true });
  checks.push({
    name: 'data:influencers',
    status: (influencerCount ?? 0) > 0 ? 'ok' : 'missing',
    detail: `${influencerCount ?? 0} influencers (needed for Creator Matching)`,
  });

  // Engine readiness
  const engines = [
    { name: 'Discovery Engine', deps: ['table:products', 'table:scan_history'] },
    { name: 'Clustering Engine', deps: ['table:products', 'table:product_clusters', 'table:product_cluster_members'] },
    { name: 'Trend Detection', deps: ['table:products', 'table:trend_keywords'] },
    { name: 'Creator Matching', deps: ['table:products', 'table:influencers', 'table:creator_product_matches', 'data:influencers'] },
    { name: 'Ad Intelligence', deps: ['table:ads'] },
    { name: 'TikTok Discovery', deps: ['table:tiktok_videos', 'table:tiktok_hashtag_signals', 'env:APIFY_API_TOKEN'] },
    { name: 'Opportunity Feed', deps: ['table:products'] },
  ];

  const checkMap = new Map(checks.map(c => [c.name, c]));
  const engineStatus = engines.map(engine => {
    const depResults = engine.deps.map(d => checkMap.get(d));
    const allOk = depResults.every(r => r?.status === 'ok');
    const missingDeps = engine.deps.filter(d => checkMap.get(d)?.status !== 'ok');
    return {
      name: engine.name,
      ready: allOk,
      missingDeps,
    };
  });

  const allReady = engineStatus.every(e => e.ready);
  const readyCount = engineStatus.filter(e => e.ready).length;

  return NextResponse.json({
    status: allReady ? 'all_engines_ready' : 'some_engines_unavailable',
    readyEngines: readyCount,
    totalEngines: engineStatus.length,
    engines: engineStatus,
    checks,
  });
}
