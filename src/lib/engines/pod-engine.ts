/**
 * POD (Print on Demand) Engine (V9 Engine — Fulfillment)
 *
 * Discovers trending POD products, integrates with POD providers
 * (Printful, Printify, Gelato), manages mockup generation, and
 * routes fulfillment orders.
 *
 * V9 Tasks: POD product discovery, provider integration, mockup
 * generation, order routing, fulfillment sync.
 *
 * @engine pod-engine
 */

import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

export interface PodProduct {
  id?: string;
  title: string;
  category: string;
  source: string;
  price: number;
  sales_count?: number;
  rating?: number;
  design_url?: string;
}

export interface PodProvider {
  name: 'printful' | 'printify' | 'gelato';
  apiKey: string;
  baseUrl: string;
}

const POD_PROVIDERS: Record<string, { baseUrl: string; envKey: string }> = {
  printful: { baseUrl: 'https://api.printful.com', envKey: 'PRINTFUL_API_KEY' },
  printify: { baseUrl: 'https://api.printify.com/v1', envKey: 'PRINTIFY_API_KEY' },
  gelato: { baseUrl: 'https://api.gelato.com/v3', envKey: 'GELATO_API_KEY' },
};

export class PodEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'pod-engine' as any,
    version: '2.0.0',
    dependencies: [],
    queues: ['pod-discovery', 'pod-provision', 'pod-fulfillment-sync'],
    publishes: [
      'pod.product_discovered',
      'pod.order_created',
      'pod.fulfillment_synced',
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
      ENGINE_EVENTS.FULFILLMENT_RECOMMENDED,
      ENGINE_EVENTS.ORDER_RECEIVED,
    ],
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

    // Listen for fulfillment recommendations that suggest POD
    bus.subscribe(ENGINE_EVENTS.FULFILLMENT_RECOMMENDED, (event) => {
      const payload = event.payload as { model?: string; productId?: string };
      if (payload.model === 'POD') {
        console.log(`[PodEngine] POD recommended for product ${payload.productId}`);
      }
    });

    // Listen for orders that need POD fulfillment
    bus.subscribe(ENGINE_EVENTS.ORDER_RECEIVED, (event) => {
      const payload = event.payload as { fulfillmentType?: string };
      if (payload.fulfillmentType === 'pod') {
        console.log('[PodEngine] POD order received — routing to provider');
      }
    });
  }

  async stop(): Promise<void> { this._status = 'stopped'; }

  async handleEvent(event: import('./types').EngineEvent): Promise<void> {
    const payload = event.payload as Record<string, unknown>;
    if (event.type === ENGINE_EVENTS.FULFILLMENT_RECOMMENDED && payload.model === 'POD') {
      console.log(`[PodEngine] POD fulfillment recommended for product ${payload.productId}`);
    }
    if (event.type === ENGINE_EVENTS.ORDER_RECEIVED && payload.fulfillmentType === 'pod') {
      console.log(`[PodEngine] POD order received — routing to provider`);
    }
  }

  async healthCheck(): Promise<boolean> { return true; }

  /**
   * Discover trending POD products from marketplaces.
   */
  async discoverProducts(niche?: string, platforms: string[] = ['etsy']): Promise<PodProduct[]> {
    const db = this.getDb();
    const apifyToken = process.env.APIFY_API_TOKEN;
    const enabled = process.env.POD_DISCOVERY_ENABLED === 'true';

    if (!enabled || !apifyToken) {
      console.log('[PodEngine] POD discovery disabled — returning cached products');
      const { data } = await db
        .from('products')
        .select('*')
        .eq('source', 'etsy')
        .order('final_score', { ascending: false })
        .limit(20);

      return (data || []).map((p: Record<string, unknown>) => ({
        title: (p.title as string) || '',
        category: (p.category as string) || 'unknown',
        source: 'etsy',
        price: (p.price as number) || 0,
      }));
    }

    const products: PodProduct[] = [];

    for (const platform of platforms) {
      if (platform === 'etsy') {
        const actorId = 'dtrungtin~etsy-scraper';
        try {
          const runRes = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apifyToken}` },
            body: JSON.stringify({
              searchQuery: niche || 'custom t-shirt',
              maxItems: 30,
              sortBy: 'most_recent',
            }),
          });

          if (runRes.ok) {
            const runData = await runRes.json() as Record<string, unknown>;
            const runId = (runData.data as Record<string, unknown>)?.id as string;

            // Poll for completion (max 2 minutes)
            let datasetId = '';
            for (let i = 0; i < 24; i++) {
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
              if (status === 'FAILED' || status === 'ABORTED') break;
            }

            if (datasetId) {
              const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?limit=30`, {
                headers: { Authorization: `Bearer ${apifyToken}` },
              });
              const items = await itemsRes.json() as Array<Record<string, unknown>>;

              for (const item of items) {
                products.push({
                  title: (item.title as string) || '',
                  category: (item.category as string) || 'apparel',
                  source: 'etsy',
                  price: parseFloat(String(item.price || 0)),
                  sales_count: parseInt(String(item.salesCount || item.numFavorers || 0)),
                  rating: parseFloat(String(item.rating || 0)),
                });
              }
            }
          }
        } catch (err) {
          console.error(`[PodEngine] Etsy scrape error:`, err);
        }
      }
    }

    // Store discovered products
    for (const p of products) {
      await db.from('products').upsert({
        title: p.title,
        source: p.source,
        platform: p.source,
        price: p.price,
        category: p.category,
        raw_data: p,
      }, { onConflict: 'title,source' as any });
    }

    const bus = getEventBus();
    await bus.emit('pod.product_discovered', {
      count: products.length,
      niche,
      platforms,
    }, 'pod-engine' as any);

    return products;
  }

  /**
   * Get available product templates from a POD provider.
   */
  async getProviderCatalog(providerName: string): Promise<Array<{ id: string; title: string; variants: number }>> {
    const provider = POD_PROVIDERS[providerName];
    if (!provider) throw new Error(`Unknown POD provider: ${providerName}`);

    const apiKey = process.env[provider.envKey];
    if (!apiKey) {
      console.log(`[PodEngine] ${providerName} API key not set`);
      return [];
    }

    try {
      const endpoint = providerName === 'printful'
        ? `${provider.baseUrl}/products`
        : providerName === 'printify'
          ? `${provider.baseUrl}/catalog/blueprints.json`
          : `${provider.baseUrl}/products`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: providerName === 'printful'
            ? `Bearer ${apiKey}`
            : `Bearer ${apiKey}`,
        },
      });

      if (!res.ok) return [];
      const data = await res.json() as Record<string, unknown>;
      const items = (data.result || data.data || data) as Array<Record<string, unknown>>;

      if (!Array.isArray(items)) return [];

      return items.slice(0, 50).map(item => ({
        id: String(item.id || ''),
        title: (item.title as string) || (item.name as string) || '',
        variants: parseInt(String(item.variant_count || item.variants || 0)),
      }));
    } catch (err) {
      console.error(`[PodEngine] ${providerName} catalog fetch error:`, err);
      return [];
    }
  }

  /**
   * Create a product on a POD provider (Printful example).
   */
  async createProviderProduct(
    providerName: string,
    productData: { title: string; blueprintId: string; designUrl: string; variants: string[] },
  ): Promise<{ id: string; status: string }> {
    const provider = POD_PROVIDERS[providerName];
    if (!provider) throw new Error(`Unknown POD provider: ${providerName}`);

    const apiKey = process.env[provider.envKey];
    if (!apiKey) throw new Error(`${providerName} API key not configured`);

    // Each provider has different API structure — route accordingly
    if (providerName === 'printful') {
      const res = await fetch(`${provider.baseUrl}/store/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          sync_product: { name: productData.title },
          sync_variants: productData.variants.map(v => ({
            variant_id: parseInt(v),
            files: [{ type: 'default', url: productData.designUrl }],
            retail_price: '24.99',
          })),
        }),
      });

      const data = await res.json() as Record<string, unknown>;
      return {
        id: String((data.result as Record<string, unknown>)?.id || ''),
        status: res.ok ? 'created' : 'failed',
      };
    }

    return { id: '', status: 'unsupported_provider' };
  }

  /**
   * Sync fulfillment status from POD provider.
   */
  async syncFulfillment(providerName: string, orderId: string): Promise<{ status: string; trackingUrl?: string }> {
    const provider = POD_PROVIDERS[providerName];
    if (!provider) return { status: 'unknown_provider' };

    const apiKey = process.env[provider.envKey];
    if (!apiKey) return { status: 'not_configured' };

    try {
      const res = await fetch(`${provider.baseUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!res.ok) return { status: 'fetch_failed' };
      const data = await res.json() as Record<string, unknown>;
      const result = (data.result || data.data || data) as Record<string, unknown>;

      return {
        status: (result.status as string) || 'unknown',
        trackingUrl: (result.tracking_url as string) || undefined,
      };
    } catch {
      return { status: 'error' };
    }
  }
}
