/**
 * Discovery Engine — Converts raw provider results into scored products
 * and stores them in Supabase. Works directly in Next.js (no Express needed).
 *
 * Implements the Engine interface for the YOUSELL engine system.
 * Backward-compatible: runLiveDiscoveryScan is still exported as standalone.
 *
 * Flow: Provider API → ProductResult[] → Score → Upsert to products table
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { searchTikTokProducts } from '@/lib/providers/tiktok';
import { searchAmazonProducts } from '@/lib/providers/amazon';
import { searchShopifyProducts } from '@/lib/providers/shopify';
import { searchPinterestProducts } from '@/lib/providers/pinterest';
import { searchInstagramProducts } from '@/lib/providers/instagram';
import { searchYouTubeProducts } from '@/lib/providers/youtube';
import { searchRedditProducts } from '@/lib/providers/reddit';
import { searchTwitterProducts } from '@/lib/providers/twitter';
import { searchProductHuntProducts } from '@/lib/providers/producthunt';
import { searchEbayProducts } from '@/lib/providers/ebay';
import { searchTikTokShopProducts } from '@/lib/providers/tiktokshop';
import { searchEtsyProducts } from '@/lib/providers/etsy';
import { searchTemuProducts } from '@/lib/providers/temu';
import { searchAliExpressProducts } from '@/lib/providers/aliexpress';
import { calculateFinalScore, getStageFromViralScore } from '@/lib/scoring/composite';
import type { ProductResult } from '@/lib/providers/types';
import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';

type Platform = 'tiktok' | 'amazon' | 'shopify' | 'pinterest' | 'digital' | 'ai_affiliate' | 'physical_affiliate'
  | 'instagram' | 'youtube' | 'reddit' | 'twitter' | 'producthunt' | 'ebay' | 'tiktok_shop' | 'etsy' | 'temu' | 'aliexpress';

// Map of platform → search function (V9: 14 platforms per spec Section 2.2)
const PLATFORM_SEARCHERS: Partial<Record<Platform, (q: string) => Promise<ProductResult[]>>> = {
  tiktok: searchTikTokProducts,
  amazon: searchAmazonProducts,
  shopify: searchShopifyProducts,
  pinterest: searchPinterestProducts,
  instagram: searchInstagramProducts,
  youtube: searchYouTubeProducts,
  reddit: searchRedditProducts,
  twitter: searchTwitterProducts,
  producthunt: searchProductHuntProducts,
  ebay: searchEbayProducts,
  tiktok_shop: searchTikTokShopProducts,
  etsy: searchEtsyProducts,
  temu: searchTemuProducts,
  aliexpress: searchAliExpressProducts,
};

// Default search queries per platform when no query specified
const DEFAULT_QUERIES: Record<string, string[]> = {
  tiktok: ['trending products', 'viral gadgets', 'tiktok made me buy it'],
  amazon: ['best sellers', 'trending products 2026', 'most wished for'],
  shopify: ['trending store products', 'best selling online'],
  pinterest: ['trending products', 'home decor trending'],
  digital: ['digital products', 'online templates'],
  ai_affiliate: ['AI tools', 'AI software'],
  physical_affiliate: ['best affiliate products', 'top selling products'],
  instagram: ['trending products', 'viral products'],
  youtube: ['best product reviews', 'trending gadgets'],
  reddit: ['best products reddit', 'trending buys'],
  twitter: ['viral products', 'trending products'],
  producthunt: ['trending', 'new tools'],
  ebay: ['trending products', 'best sellers'],
  tiktok_shop: ['trending tiktok shop', 'viral products'],
  etsy: ['trending handmade', 'best selling etsy'],
  temu: ['trending products', 'best sellers'],
  aliexpress: ['best sellers', 'trending products'],
};

interface DiscoveryResult {
  platform: string;
  query: string;
  found: number;
  stored: number;
  errors: string[];
}

/**
 * Score a raw ProductResult using available metadata
 */
function scoreProduct(result: ProductResult): {
  trendScore: number;
  viralScore: number;
  profitScore: number;
  finalScore: number;
  trendStage: string;
} {
  const meta = result.metadata || {};
  const price = result.price || 0;
  const platform = result.platform;

  // --- Trend Score ---
  let trendScore = 0;

  // Platform bonus
  if (platform === 'tiktok') trendScore += 25;
  else if (platform === 'pinterest') trendScore += 15;
  else if (platform === 'amazon') trendScore += 10;
  else trendScore += 5;

  // Engagement/sales signals
  const views = Number(meta.views || 0);
  const likes = Number(meta.likes || 0);
  const sales = Number(meta.bsr || meta.sales || meta.saves || 0);
  const reviews = Number(meta.reviewCount || meta.comments || 0);

  if (views > 1000000) trendScore += 35;
  else if (views > 100000) trendScore += 25;
  else if (views > 10000) trendScore += 15;
  else if (views > 1000) trendScore += 5;

  if (sales > 5000) trendScore += 20;
  else if (sales > 1000) trendScore += 15;
  else if (sales > 100) trendScore += 10;

  if (reviews > 1000) trendScore += 10;
  else if (reviews > 100) trendScore += 5;

  trendScore = Math.min(100, Math.max(0, trendScore));

  // --- Viral Score ---
  let viralScore = 0;

  if (platform === 'tiktok') viralScore += 20;
  else if (platform === 'pinterest') viralScore += 10;

  // Engagement rate proxy
  if (views > 0) {
    const engagementRate = (likes + Number(meta.shares || 0) + Number(meta.comments || 0)) / views;
    if (engagementRate > 0.1) viralScore += 30;
    else if (engagementRate > 0.05) viralScore += 20;
    else if (engagementRate > 0.02) viralScore += 10;
  }

  if (likes > 100000) viralScore += 25;
  else if (likes > 10000) viralScore += 15;
  else if (likes > 1000) viralScore += 10;

  const rating = Number(meta.rating || 0);
  if (rating >= 4.5) viralScore += 15;
  else if (rating >= 4.0) viralScore += 10;

  viralScore = Math.min(100, Math.max(0, viralScore));

  // --- Profit Score ---
  let profitScore = 0;

  // Price sweet spot
  if (price >= 15 && price <= 60) profitScore += 30;
  else if (price > 60 && price <= 100) profitScore += 20;
  else if (price > 100) profitScore += 15;
  else if (price > 0) profitScore += 10;

  // Margin estimate
  const estimatedMargin = price > 30 ? 0.4 : price > 15 ? 0.3 : 0.2;
  if (estimatedMargin >= 0.4) profitScore += 25;
  else if (estimatedMargin >= 0.3) profitScore += 15;
  else profitScore += 5;

  // Sales volume
  if (sales > 5000) profitScore += 20;
  else if (sales > 1000) profitScore += 15;
  else if (sales > 100) profitScore += 10;

  // Rating
  if (rating >= 4.5) profitScore += 15;
  else if (rating >= 4.0) profitScore += 10;

  profitScore = Math.min(100, Math.max(0, profitScore));

  const finalScore = calculateFinalScore(trendScore, viralScore, profitScore);
  const trendStage = getStageFromViralScore(viralScore);

  return { trendScore, viralScore, profitScore, finalScore, trendStage };
}

/**
 * Convert a ProductResult into a DB row for the products table
 */
function toProductRow(
  result: ProductResult,
  userId: string,
  scanChannel: string
): Record<string, unknown> {
  const scores = scoreProduct(result);
  const meta = result.metadata || {};
  const price = result.price || 0;
  const estimatedCost = price > 0 ? Math.round(price * 0.35 * 100) / 100 : 0;
  const margin = price > 0 ? Math.round(((price - estimatedCost) / price) * 100) : 0;

  return {
    title: result.title,
    description: `Discovered on ${result.platform} via live scan. ${result.url}`,
    platform: result.platform,
    status: 'draft',
    category: String(meta.productType || meta.category || 'General'),
    price,
    cost: estimatedCost,
    currency: result.currency || 'USD',
    margin_percent: margin,
    score_overall: scores.finalScore,
    score_demand: Math.round((scores.trendScore + scores.viralScore) / 2),
    score_competition: Math.min(100, Number(meta.reviewCount || 0) > 1000 ? 75 : Number(meta.reviewCount || 0) > 100 ? 50 : 25),
    score_margin: scores.profitScore,
    score_trend: scores.trendScore,
    external_id: result.id,
    external_url: result.url,
    image_url: result.imageUrl || null,
    tags: extractTags(result),
    metadata: meta,
    channel: scanChannel,
    final_score: scores.finalScore,
    trend_score: scores.trendScore,
    viral_score: scores.viralScore,
    profit_score: scores.profitScore,
    trend_stage: scores.trendStage,
    created_by: userId,
  };
}

function extractTags(result: ProductResult): string[] {
  const tags: string[] = [];
  const meta = result.metadata || {};

  if (Array.isArray(meta.hashtags)) {
    tags.push(...(meta.hashtags as string[]).slice(0, 5));
  }

  if (meta.isPrime) tags.push('prime');
  if (meta.onSale) tags.push('on-sale');
  if (result.platform) tags.push(result.platform);

  return tags.slice(0, 10);
}

/**
 * Run discovery for a single platform + query. Returns results.
 */
async function discoverPlatform(
  platform: Platform,
  query: string,
  userId: string,
  scanChannel: string
): Promise<DiscoveryResult> {
  const result: DiscoveryResult = {
    platform,
    query,
    found: 0,
    stored: 0,
    errors: [],
  };

  const searcher = PLATFORM_SEARCHERS[platform];
  if (!searcher) {
    // No live searcher — skip
    return result;
  }

  try {
    const rawProducts = await searcher(query);
    result.found = rawProducts.length;

    if (rawProducts.length === 0) return result;

    const admin = createAdminClient();
    const rows = rawProducts.map(p => toProductRow(p, userId, scanChannel));

    // Insert products individually to handle duplicates gracefully
    // (no unique constraint on platform+external_id exists yet)
    let inserted = 0;
    for (const row of rows) {
      // Check if product already exists (by external_id + platform)
      if (row.external_id) {
        const { data: existing } = await admin
          .from('products')
          .select('id')
          .eq('platform', row.platform)
          .eq('external_id', row.external_id)
          .maybeSingle();

        if (existing) {
          // Update existing product scores
          await admin
            .from('products')
            .update({
              score_overall: row.score_overall,
              final_score: row.final_score,
              trend_score: row.trend_score,
              viral_score: row.viral_score,
              profit_score: row.profit_score,
              trend_stage: row.trend_stage,
              price: row.price,
              metadata: row.metadata,
            })
            .eq('id', existing.id);
          inserted++;
          continue;
        }
      }

      const { error: insertErr } = await admin.from('products').insert(row);
      if (!insertErr) inserted++;
      else result.errors.push(`Insert "${String(row.title).slice(0, 30)}": ${insertErr.message}`);
    }
    result.stored = inserted;
  } catch (err) {
    result.errors.push(`Provider error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}

/**
 * Run a full discovery scan across multiple platforms.
 * This is the main entry point for the scan route.
 */
export async function runLiveDiscoveryScan(
  mode: 'quick' | 'full' | 'client',
  userId: string,
  clientId?: string
): Promise<{
  scanId: string;
  results: DiscoveryResult[];
  totalFound: number;
  totalStored: number;
  hotProducts: number;
}> {
  const admin = createAdminClient();

  const platformMap: Record<string, Platform[]> = {
    quick: ['tiktok', 'amazon'],
    full: ['tiktok', 'amazon', 'shopify', 'pinterest'],
    client: ['tiktok', 'amazon'],
  };

  const platforms = platformMap[mode] || platformMap.quick;
  const scanChannel = `live-scan-${mode}`;

  // Create scan history record
  const { data: scan, error: scanErr } = await admin
    .from('scan_history')
    .insert({
      scan_mode: mode,
      status: 'running',
      progress: 0,
      triggered_by: userId,
      ...(clientId ? { client_id: clientId } : {}),
      cost_estimate: mode === 'full' ? 0.50 : mode === 'client' ? 0.30 : 0.10,
    })
    .select()
    .single();

  if (scanErr || !scan) {
    throw new Error(`scan_history insert failed: ${scanErr?.message || 'no data'}`);
  }

  const scanId = scan.id;

  try {
    // Run platform discoveries in parallel
    const promises = platforms.map(async (platform) => {
      const queries = DEFAULT_QUERIES[platform];
      const query = queries[Math.floor(Math.random() * queries.length)];
      return discoverPlatform(platform, query, userId, scanChannel);
    });

    const results = await Promise.all(promises);

    const totalFound = results.reduce((s, r) => s + r.found, 0);
    const totalStored = results.reduce((s, r) => s + r.stored, 0);

    // Count hot products from this scan
    const { count } = await admin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('channel', scanChannel)
      .gte('final_score', 80);

    const hotProducts = count ?? 0;

    // Mark completed
    await admin
      .from('scan_history')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        products_found: totalStored,
        hot_products: hotProducts,
      })
      .eq('id', scanId);

    // Emit scan complete event
    const bus = getEventBus();
    await bus.emit(
      ENGINE_EVENTS.SCAN_COMPLETE,
      {
        scanId,
        mode,
        productsFound: totalStored,
        hotProducts,
        platforms: platforms as string[],
      },
      'discovery',
    );

    return { scanId, results, totalFound, totalStored, hotProducts };
  } catch (error) {
    // Emit scan error event
    const bus = getEventBus();
    await bus.emit(
      ENGINE_EVENTS.SCAN_ERROR,
      {
        scanId,
        platform: 'multi',
        error: error instanceof Error ? error.message : String(error),
      },
      'discovery',
    );

    await admin
      .from('scan_history')
      .update({ status: 'failed', progress: 0 })
      .eq('id', scanId);
    throw error;
  }
}

// ─── Engine Class Implementation ────────────────────────────

export class DiscoveryEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'discovery',
    version: '1.0.0',
    dependencies: [],
    queues: ['product-scan'],
    publishes: [
      ENGINE_EVENTS.PRODUCT_DISCOVERED,
      ENGINE_EVENTS.SCAN_COMPLETE,
      ENGINE_EVENTS.SCAN_ERROR,
    ],
    subscribes: [],
  };

  status(): EngineStatus {
    return this._status;
  }

  async init(): Promise<void> {
    this._status = 'idle';
  }

  async start(): Promise<void> {
    this._status = 'running';
  }

  async stop(): Promise<void> {
    this._status = 'stopped';
  }

  async handleEvent(_event: EngineEvent): Promise<void> {
    // Discovery engine doesn't subscribe to events — it's triggered manually
  }

  async healthCheck(): Promise<boolean> {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from('products').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Run discovery via the engine interface.
   * Delegates to the standalone function for backward compatibility.
   */
  async scan(mode: 'quick' | 'full' | 'client', userId: string, clientId?: string) {
    this._status = 'running';
    try {
      return await runLiveDiscoveryScan(mode, userId, clientId);
    } finally {
      this._status = 'idle';
    }
  }
}
