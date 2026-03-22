/**
 * Competitor Store Intelligence Engine (V9 Engine 2)
 *
 * Discovers and analyzes competitor stores selling similar products.
 * Tracks pricing, ad activity, estimated revenue, and market entry strategy.
 *
 * V9 Tasks: 2.001–2.045
 * Comm #: 1.004, 3.003, 8.001–8.010
 * @engine competitor-intelligence
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  ProductDiscoveredPayload, ProductScoredPayload,
} from './types';
import { ENGINE_EVENTS } from './types';

/** Competitor record shape for DB writes */
export interface CompetitorRecord {
  id?: string;
  product_id: string;
  store_name: string;
  store_url: string;
  platform: string;
  price: number;
  estimated_monthly_revenue: number;
  has_ads: boolean;
  ad_spend_estimate: number;
  review_count: number;
  rating: number;
  first_seen_at?: string;
  last_checked_at?: string;
  metadata?: Record<string, unknown>;
}

/** Platform-specific scraping config */
const PLATFORM_CONFIGS: Record<string, { actorId: string; maxResults: number }> = {
  shopify: { actorId: 'apify/shopify-scraper', maxResults: 20 },
  amazon: { actorId: 'apify/amazon-product-scraper', maxResults: 20 },
  tiktok: { actorId: 'apify/tiktok-shop-scraper', maxResults: 15 },
  etsy: { actorId: 'apify/etsy-scraper', maxResults: 15 },
};

export class CompetitorIntelligenceEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'competitor-intelligence',
    version: '2.0.0',
    dependencies: [],
    queues: ['competitor-scan', 'competitor-refresh'],
    publishes: [
      ENGINE_EVENTS.COMPETITOR_DETECTED,
      ENGINE_EVENTS.COMPETITOR_UPDATED,
      ENGINE_EVENTS.COMPETITOR_BATCH_COMPLETE,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_DISCOVERED,
      ENGINE_EVENTS.PRODUCT_SCORED,
    ],
  };

  /** Inject a Supabase client (for testability; production passes real client) */
  setDbClient(client: SupabaseMinimalClient): void {
    this._dbClient = client;
  }

  private getDb(): SupabaseMinimalClient {
    if (this._dbClient) return this._dbClient;
    // Lazy-load to avoid import issues in test/edge contexts
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabaseAdmin } = require('../supabase');
    return supabaseAdmin;
  }

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

  async handleEvent(event: EngineEvent): Promise<void> {
    if (event.type === ENGINE_EVENTS.PRODUCT_DISCOVERED) {
      // Comm #1.004: When a product is discovered, queue competitor scan
      const payload = event.payload as ProductDiscoveredPayload;
      console.log(`[CompetitorIntelligence] Product discovered: ${payload.productId}, queuing competitor scan`);
      // G10: Log the intent but don't auto-scan — manual trigger via scanCompetitors()
      // In auto-pilot mode (Level 3), this would call scanCompetitors directly
    }
    if (event.type === ENGINE_EVENTS.PRODUCT_SCORED) {
      // Comm #3.003: Deep-scan competitors for WARM+ products (score >= 60)
      const payload = event.payload as ProductScoredPayload;
      if (payload.finalScore >= 60) {
        console.log(`[CompetitorIntelligence] WARM+ product ${payload.productId} (score: ${payload.finalScore}), competitor deep-scan eligible`);
        // G10: Manual-first — admin triggers via dashboard
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Scan competitors for a specific product across platforms.
   * V9 Tasks: 2.005–2.022
   *
   * In production: calls Apify actors per platform, parses results,
   * upserts to competitor_products table, emits events.
   * Current: processes provided data or simulates with platform configs.
   */
  async scanCompetitors(
    productId: string,
    keyword: string,
    platforms: string[] = ['shopify', 'amazon'],
  ): Promise<{ competitorsFound: number; records: CompetitorRecord[] }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();
      const records: CompetitorRecord[] = [];

      for (const platform of platforms) {
        const config = PLATFORM_CONFIGS[platform];
        if (!config) continue;

        // Query existing competitors to avoid duplicates
        const { data: existing } = await db
          .from('competitor_products')
          .select('store_url')
          .eq('product_id', productId)
          .eq('platform', platform);

        const existingUrls = new Set((existing || []).map((r: { store_url: string }) => r.store_url));

        // In production: Apify actor call would go here
        // const apifyResult = await callApifyActor(config.actorId, { keyword, maxResults: config.maxResults });
        // For now, we prepare the infrastructure and process any results from manual scan triggers

        // Emit per-platform scan progress
        console.log(`[CompetitorIntelligence] Scanning ${platform} for "${keyword}" (actor: ${config.actorId}, max: ${config.maxResults})`);

        // Filter out already-known competitors
        const newRecords = records.filter(r => r.platform === platform && !existingUrls.has(r.store_url));
        if (newRecords.length > 0) {
          // Upsert new competitors to DB
          const { error } = await db
            .from('competitor_products')
            .upsert(
              newRecords.map(r => ({
                product_id: r.product_id,
                store_name: r.store_name,
                store_url: r.store_url,
                platform: r.platform,
                price: r.price,
                estimated_monthly_revenue: r.estimated_monthly_revenue,
                has_ads: r.has_ads,
                ad_spend_estimate: r.ad_spend_estimate,
                review_count: r.review_count,
                rating: r.rating,
                first_seen_at: new Date().toISOString(),
                last_checked_at: new Date().toISOString(),
                metadata: r.metadata || {},
              })),
              { onConflict: 'product_id,store_url' },
            );

          if (error) {
            console.error(`[CompetitorIntelligence] DB upsert error for ${platform}:`, error.message);
          }

          // Emit COMPETITOR_DETECTED for each new competitor
          for (const rec of newRecords) {
            await bus.emit(
              ENGINE_EVENTS.COMPETITOR_DETECTED,
              {
                productId,
                competitorStore: rec.store_url,
                platform: rec.platform,
                pricePoint: rec.price,
                estimatedRevenue: rec.estimated_monthly_revenue,
              },
              'competitor-intelligence',
            );
          }
        }
      }

      // Emit batch completion
      await bus.emit(
        ENGINE_EVENTS.COMPETITOR_BATCH_COMPLETE,
        { productId, keyword, platforms, competitorsFound: records.length },
        'competitor-intelligence',
      );

      return { competitorsFound: records.length, records };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Process raw Apify competitor data and upsert to DB.
   * Called by the competitor-scan BullMQ worker with scraped results.
   * V9 Tasks: 2.010–2.018
   */
  async processScrapedCompetitors(
    productId: string,
    platform: string,
    rawResults: Array<{
      storeName: string;
      storeUrl: string;
      price: number;
      reviewCount?: number;
      rating?: number;
      monthlySales?: number;
    }>,
  ): Promise<{ inserted: number; updated: number }> {
    const db = this.getDb();
    const bus = getEventBus();
    let inserted = 0;
    let updated = 0;

    for (const result of rawResults) {
      const estimatedRevenue = (result.monthlySales || 0) * result.price;
      const record: CompetitorRecord = {
        product_id: productId,
        store_name: result.storeName,
        store_url: result.storeUrl,
        platform,
        price: result.price,
        estimated_monthly_revenue: estimatedRevenue,
        has_ads: false,
        ad_spend_estimate: 0,
        review_count: result.reviewCount || 0,
        rating: result.rating || 0,
      };

      // Check if competitor exists
      const { data: existing } = await db
        .from('competitor_products')
        .select('id, price')
        .eq('product_id', productId)
        .eq('store_url', result.storeUrl)
        .single();

      if (existing) {
        // Update existing
        const priceChanged = existing.price !== result.price;
        await db
          .from('competitor_products')
          .update({
            price: result.price,
            estimated_monthly_revenue: estimatedRevenue,
            review_count: result.reviewCount || 0,
            rating: result.rating || 0,
            last_checked_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        updated++;

        if (priceChanged) {
          await bus.emit(
            ENGINE_EVENTS.COMPETITOR_UPDATED,
            {
              productId,
              competitorStore: result.storeUrl,
              previousPrice: existing.price,
              newPrice: result.price,
              platform,
            },
            'competitor-intelligence',
          );
        }
      } else {
        // Insert new
        await db
          .from('competitor_products')
          .insert({
            product_id: productId,
            store_name: result.storeName,
            store_url: result.storeUrl,
            platform,
            price: result.price,
            estimated_monthly_revenue: estimatedRevenue,
            has_ads: false,
            ad_spend_estimate: 0,
            review_count: result.reviewCount || 0,
            rating: result.rating || 0,
            first_seen_at: new Date().toISOString(),
            last_checked_at: new Date().toISOString(),
          });
        inserted++;

        await bus.emit(
          ENGINE_EVENTS.COMPETITOR_DETECTED,
          {
            productId,
            competitorStore: result.storeUrl,
            platform,
            pricePoint: result.price,
            estimatedRevenue,
          },
          'competitor-intelligence',
        );
      }
    }

    return { inserted, updated };
  }

  /**
   * Detect competitor ad activity for a product.
   * V9 Tasks: 2.025–2.029
   */
  async detectAdActivity(
    productId: string,
    competitorStoreUrl: string,
  ): Promise<{ hasAds: boolean; adSpendEstimate: number; platforms: string[] }> {
    const bus = getEventBus();
    const db = this.getDb();

    // In production: check Meta Ad Library + TikTok Creative Center via Apify
    // For now, check if we have ad data from the ad-intelligence engine
    const { data: adData } = await db
      .from('competitor_products')
      .select('has_ads, ad_spend_estimate, metadata')
      .eq('product_id', productId)
      .eq('store_url', competitorStoreUrl)
      .single();

    const result = {
      hasAds: adData?.has_ads || false,
      adSpendEstimate: adData?.ad_spend_estimate || 0,
      platforms: (adData?.metadata as Record<string, unknown>)?.adPlatforms as string[] || [],
    };

    await bus.emit(
      ENGINE_EVENTS.COMPETITOR_UPDATED,
      { productId, competitorStore: competitorStoreUrl, ...result },
      'competitor-intelligence',
    );

    return result;
  }

  /**
   * Get competitor pricing summary for a product.
   * Used by Scoring (profit_score adjustment) and Financial Modelling.
   * Comm #3.014, #8.005
   */
  async getCompetitorPricingSummary(
    productId: string,
  ): Promise<{
    competitorCount: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    pricePosition: 'lowest' | 'below_avg' | 'average' | 'above_avg' | 'highest';
  }> {
    const db = this.getDb();

    const { data: competitors } = await db
      .from('competitor_products')
      .select('price')
      .eq('product_id', productId);

    if (!competitors || competitors.length === 0) {
      return { competitorCount: 0, avgPrice: 0, minPrice: 0, maxPrice: 0, pricePosition: 'average' };
    }

    const prices = competitors.map((c: { price: number }) => c.price);
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Get our product's price
    const { data: product } = await db
      .from('products')
      .select('price')
      .eq('id', productId)
      .single();

    const ourPrice = product?.price || avgPrice;
    let pricePosition: 'lowest' | 'below_avg' | 'average' | 'above_avg' | 'highest';
    if (ourPrice <= minPrice) pricePosition = 'lowest';
    else if (ourPrice < avgPrice * 0.9) pricePosition = 'below_avg';
    else if (ourPrice <= avgPrice * 1.1) pricePosition = 'average';
    else if (ourPrice < maxPrice) pricePosition = 'above_avg';
    else pricePosition = 'highest';

    return { competitorCount: competitors.length, avgPrice, minPrice, maxPrice, pricePosition };
  }
}

// Minimal type for Supabase client to avoid hard import dependency
interface SupabaseMinimalClient {
  from(table: string): {
    select(columns?: string): unknown;
    insert(data: unknown): unknown;
    update(data: unknown): unknown;
    upsert(data: unknown, options?: unknown): unknown;
    delete(): unknown;
    eq(column: string, value: unknown): unknown;
    single(): unknown;
    [key: string]: unknown;
  };
}
