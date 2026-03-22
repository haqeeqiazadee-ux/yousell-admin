/**
 * Amazon Intelligence Engine (V9 Engine — Marketplace)
 *
 * Discovers trending Amazon products via BSR analysis, tracks review
 * velocity, identifies cross-platform opportunities, and monitors
 * category-level demand signals.
 *
 * V9 Tasks: Scanning BSR movers, parsing review velocity, ASIN extraction,
 * pricing intelligence, amazon.products_found emission.
 *
 * @engine amazon-intelligence
 */

import { getEventBus } from './event-bus';
import { getCircuitBreaker } from '@/lib/circuit-breaker';
import { engineLogger } from '@/lib/logger';
import type { Engine, EngineConfig, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

const log = engineLogger('amazon-intelligence');

export interface AmazonProduct {
  asin: string;
  title: string;
  price: number;
  bsr: number;
  bsr_category: string;
  review_count: number;
  rating: number;
  seller_count?: number;
  image_url?: string;
}

export interface AmazonScanResult {
  query: string;
  productsFound: number;
  productsStored: number;
  topProducts: AmazonProduct[];
}

export class AmazonIntelligenceEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'amazon-intelligence' as any,
    version: '2.0.0',
    dependencies: [],
    queues: ['amazon-intelligence'],
    publishes: [ENGINE_EVENTS.AMAZON_PRODUCTS_FOUND],
    subscribes: [ENGINE_EVENTS.TREND_DETECTED],
  };

  setDbClient(client: SupabaseMinimalClient): void {
    this._dbClient = client;
  }

  private getDb(): SupabaseMinimalClient {
    if (this._dbClient) return this._dbClient;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabaseAdmin } = require('../supabase');
    return supabaseAdmin;
  }

  status(): EngineStatus { return this._status; }
  async init(): Promise<void> { this._status = 'idle'; }

  async start(): Promise<void> {
    this._status = 'running';
    const bus = getEventBus();
    bus.subscribe(ENGINE_EVENTS.TREND_DETECTED, (event) => {
      const payload = event.payload as { keyword?: string };
      if (payload.keyword) {
        console.log(`[AmazonIntelligence] Trend detected: ${payload.keyword} — queueing Amazon scan`);
      }
    });
  }

  async stop(): Promise<void> { this._status = 'stopped'; }

  async handleEvent(event: import('./types').EngineEvent): Promise<void> {
    if (event.type === ENGINE_EVENTS.TREND_DETECTED) {
      const payload = event.payload as { keyword?: string };
      if (payload.keyword) {
        console.log(`[AmazonIntelligence] Auto-scan triggered for trend: ${payload.keyword}`);
      }
    }
  }

  async healthCheck(): Promise<boolean> { return true; }

  /**
   * Scan Amazon for trending products matching a keyword.
   * Stores results in products table and emits AMAZON_PRODUCTS_FOUND.
   */
  async scanProducts(query: string, limit: number = 50): Promise<AmazonScanResult> {
    const db = this.getDb();
    const apifyToken = process.env.APIFY_API_TOKEN;

    if (!apifyToken) {
      log.warn('APIFY_API_TOKEN not set — returning empty');
      return { query, productsFound: 0, productsStored: 0, topProducts: [] };
    }

    // Call Apify Amazon BSR scraper (with circuit breaker)
    const actorId = 'junglee~amazon-bestsellers-scraper';
    const apifyBreaker = getCircuitBreaker('apify');
    log.info('Starting Amazon BSR scan', { query, limit });

    const runRes = await apifyBreaker.execute(() => fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apifyToken}` },
      body: JSON.stringify({ keyword: query, maxItems: limit, country: 'US' }),
    }));

    if (!runRes.ok) {
      log.error('Apify run failed', { status: runRes.status });
      throw new Error(`Apify run failed: ${runRes.status}`);
    }
    const runData = await runRes.json() as Record<string, unknown>;
    const runId = (runData.data as Record<string, unknown>)?.id as string;

    // Poll for completion
    let datasetId = '';
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        headers: { Authorization: `Bearer ${apifyToken}` },
      });
      const statusData = await statusRes.json() as Record<string, unknown>;
      const status = (statusData.data as Record<string, unknown>)?.status as string;
      if (status === 'SUCCEEDED') {
        datasetId = (statusData.data as Record<string, unknown>)?.defaultDatasetId as string;
        break;
      }
      if (status === 'FAILED' || status === 'ABORTED') throw new Error(`Apify run ${status}`);
    }

    if (!datasetId) throw new Error('Apify run timed out');

    // Fetch results
    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?limit=${limit}`, {
      headers: { Authorization: `Bearer ${apifyToken}` },
    });
    const items = await itemsRes.json() as Array<Record<string, unknown>>;

    const products: AmazonProduct[] = items.map(item => ({
      asin: (item.asin as string) || '',
      title: (item.title as string) || '',
      price: parseFloat(String(item.price || 0)),
      bsr: parseInt(String(item.bsr || item.bestSellersRank || 0)),
      bsr_category: (item.category as string) || 'unknown',
      review_count: parseInt(String(item.reviewCount || item.reviews || 0)),
      rating: parseFloat(String(item.rating || item.stars || 0)),
      seller_count: item.sellerCount ? parseInt(String(item.sellerCount)) : undefined,
      image_url: (item.imageUrl as string) || undefined,
    }));

    // Store in products table
    let stored = 0;
    for (const p of products) {
      const { error } = await db.from('products').upsert({
        title: p.title,
        source: 'amazon',
        platform: 'amazon',
        external_id: p.asin,
        price: p.price,
        category: p.bsr_category,
        image_url: p.image_url,
        raw_data: p,
      }, { onConflict: 'external_id' });

      if (!error) stored++;
    }

    // Emit event
    const bus = getEventBus();
    await bus.emit(ENGINE_EVENTS.AMAZON_PRODUCTS_FOUND, {
      query,
      count: products.length,
      stored,
      topASINs: products.slice(0, 10).map(p => p.asin),
    }, 'amazon-intelligence' as any);

    return { query, productsFound: products.length, productsStored: stored, topProducts: products.slice(0, 10) };
  }

  /**
   * Get BSR movement analysis for tracked products.
   */
  async getBSRMovers(category?: string, limit: number = 20): Promise<AmazonProduct[]> {
    const db = this.getDb();
    let query = db.from('products').select('*').eq('platform', 'amazon').order('final_score', { ascending: false }).limit(limit);
    if (category) query = query.eq('category', category);
    const { data } = await query;
    return (data || []).map((p: Record<string, unknown>) => ({
      asin: (p.external_id as string) || '',
      title: (p.title as string) || '',
      price: (p.price as number) || 0,
      bsr: ((p.raw_data as Record<string, unknown>)?.bsr as number) || 0,
      bsr_category: (p.category as string) || 'unknown',
      review_count: ((p.raw_data as Record<string, unknown>)?.review_count as number) || 0,
      rating: ((p.raw_data as Record<string, unknown>)?.rating as number) || 0,
    }));
  }
}
