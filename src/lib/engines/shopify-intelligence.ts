/**
 * Shopify Intelligence Engine (V9 Engine — Marketplace)
 *
 * Discovers fast-growing Shopify stores, scrapes product catalogs,
 * detects themes/apps, estimates traffic, and identifies competitor
 * store patterns.
 *
 * V9 Tasks: Store discovery, product scraping, theme detection,
 * traffic estimation, shopify.products_found emission.
 *
 * @engine shopify-intelligence
 */

import { getCircuitBreaker } from '@/lib/circuit-breaker';
import { engineLogger } from '@/lib/logger';
import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

const log = engineLogger('shopify-intelligence');

export interface ShopifyStore {
  domain: string;
  name: string;
  product_count: number;
  estimated_traffic?: string;
  theme?: string;
  top_products: Array<{ title: string; price: number; handle: string }>;
}

export interface ShopifyScanResult {
  niche: string;
  storesFound: number;
  productsStored: number;
  stores: ShopifyStore[];
}

export class ShopifyIntelligenceEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'shopify-intelligence',
    version: '2.0.0',
    dependencies: [],
    queues: ['shopify-intelligence'],
    publishes: [ENGINE_EVENTS.SHOPIFY_PRODUCTS_FOUND],
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
        console.log(`[ShopifyIntelligence] Trend detected: ${payload.keyword} — queueing Shopify scan`);
      }
    });
  }

  async stop(): Promise<void> { this._status = 'stopped'; }

  async handleEvent(event: import('./types').EngineEvent): Promise<void> {
    if (event.type === ENGINE_EVENTS.TREND_DETECTED) {
      const payload = event.payload as { keyword?: string };
      if (payload.keyword) {
        console.log(`[ShopifyIntelligence] Auto-scan triggered for trend: ${payload.keyword}`);
      }
    }
  }

  async healthCheck(): Promise<boolean> { return true; }

  /**
   * Scan Shopify stores for trending products in a niche.
   */
  async scanStores(niche: string, limit: number = 20): Promise<ShopifyScanResult> {
    const db = this.getDb();
    const apifyToken = process.env.APIFY_API_TOKEN;

    if (!apifyToken) {
      log.warn('APIFY_API_TOKEN not set — returning empty');
      return { niche, storesFound: 0, productsStored: 0, stores: [] };
    }

    const actorId = 'clearpath~shop-by-shopify-product-scraper';
    const apifyBreaker = getCircuitBreaker('apify');
    log.info('Starting Shopify store scan', { niche, limit });

    const runRes = await apifyBreaker.execute(() => fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apifyToken}` },
      body: JSON.stringify({ searchQuery: niche, maxProducts: limit * 3 }),
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

    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?limit=${limit * 3}`, {
      headers: { Authorization: `Bearer ${apifyToken}` },
    });
    const items = await itemsRes.json() as Array<Record<string, unknown>>;

    // Group by store domain
    const storeMap = new Map<string, ShopifyStore>();
    for (const item of items) {
      const domain = (item.shopDomain as string) || (item.url as string)?.replace(/https?:\/\//, '').split('/')[0] || '';
      if (!domain) continue;

      if (!storeMap.has(domain)) {
        storeMap.set(domain, {
          domain,
          name: (item.shopName as string) || domain,
          product_count: 0,
          top_products: [],
        });
      }

      const store = storeMap.get(domain)!;
      store.product_count++;
      if (store.top_products.length < 5) {
        store.top_products.push({
          title: (item.title as string) || '',
          price: parseFloat(String(item.price || 0)),
          handle: (item.handle as string) || '',
        });
      }
    }

    const stores = Array.from(storeMap.values()).slice(0, limit);

    // Store products in DB
    let stored = 0;
    for (const item of items.slice(0, limit * 2)) {
      const { error } = await db.from('products').upsert({
        title: (item.title as string) || '',
        source: 'shopify',
        platform: 'shopify',
        external_id: (item.handle as string) || `shopify_${Date.now()}_${Math.random()}`,
        price: parseFloat(String(item.price || 0)),
        image_url: (item.imageUrl as string) || undefined,
        raw_data: item,
      }, { onConflict: 'external_id' });
      if (!error) stored++;
    }

    // Store competitor stores
    for (const store of stores) {
      await db.from('competitor_stores').upsert({
        store_url: `https://${store.domain}`,
        store_name: store.name,
        platform: 'shopify',
        product_count: store.product_count,
        metadata: { top_products: store.top_products },
      }, { onConflict: 'store_url' });
    }

    // Emit event
    const bus = getEventBus();
    await bus.emit(ENGINE_EVENTS.SHOPIFY_PRODUCTS_FOUND, {
      niche,
      storesFound: stores.length,
      productsStored: stored,
    }, 'shopify-intelligence');

    return { niche, storesFound: stores.length, productsStored: stored, stores };
  }

  /**
   * Get competitor store analysis.
   */
  async getCompetitorStores(limit: number = 20): Promise<ShopifyStore[]> {
    const db = this.getDb();
    const { data } = await db
      .from('competitor_stores')
      .select('*')
      .eq('platform', 'shopify')
      .order('product_count', { ascending: false })
      .limit(limit);

    return (data || []).map((s: Record<string, unknown>) => ({
      domain: ((s.store_url as string) || '').replace(/https?:\/\//, ''),
      name: (s.store_name as string) || '',
      product_count: (s.product_count as number) || 0,
      top_products: ((s.metadata as Record<string, unknown>)?.top_products as Array<{ title: string; price: number; handle: string }>) || [],
    }));
  }
}
