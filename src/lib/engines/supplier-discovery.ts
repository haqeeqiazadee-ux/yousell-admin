/**
 * Supplier Discovery Engine (V9 Engine 4)
 *
 * Finds, verifies, and scores suppliers across AliExpress, Alibaba,
 * 1688, and domestic US/UK/EU sources. Provides dropship + wholesale options.
 *
 * V9 Tasks: 4.001–4.052
 * Comm #: 3.004, 9.001–9.010
 * @engine supplier-discovery
 */

import { getCircuitBreaker } from '@/lib/circuit-breaker';
import { engineLogger } from '@/lib/logger';
import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  ProductScoredPayload,
} from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

const log = engineLogger('supplier-discovery');

/** Supplier record shape for DB writes */
export interface SupplierRecord {
  id?: string;
  product_id: string;
  supplier_name: string;
  supplier_url: string;
  platform: string;
  unit_cost: number;
  moq: number;
  shipping_cost: number;
  ship_days_min: number;
  ship_days_max: number;
  rating: number;
  years_active: number;
  verified: boolean;
  verification_score: number;
  fulfillment_type: 'dropship' | 'wholesale' | 'mixed';
  metadata?: Record<string, unknown>;
}

/** Platform-specific supplier search config — real Apify actor IDs */
const SUPPLIER_PLATFORMS: Record<string, {
  actorId: string;
  maxResults: number;
  buildBody: (keyword: string, max: number) => Record<string, unknown>;
  mapItem: (item: Record<string, unknown>) => {
    supplierName: string;
    supplierUrl: string;
    unitCost: number;
    moq: number;
    shippingCost?: number;
    shipDaysMin?: number;
    shipDaysMax?: number;
    rating?: number;
    yearsActive?: number;
    responseRate?: number;
    onTimeDelivery?: number;
    disputeRate?: number;
  } | null;
}> = {
  aliexpress: {
    actorId: 'epctex~aliexpress-scraper',
    maxResults: 15,
    buildBody: (keyword, max) => ({ search: keyword, maxItems: max }),
    mapItem: (item) => ({
      supplierName: (item.storeName as string) || (item.seller as string) || 'AliExpress Seller',
      supplierUrl: (item.url as string) || (item.productUrl as string) || '',
      unitCost: parseFloat(String(item.price || item.salePrice || 0)) || 0,
      moq: parseInt(String(item.minOrder || item.moq || 1), 10),
      shippingCost: parseFloat(String(item.shippingPrice || item.shippingCost || 0)) || 0,
      shipDaysMin: parseInt(String(item.deliveryDaysMin || item.shippingDaysMin || 7), 10),
      shipDaysMax: parseInt(String(item.deliveryDaysMax || item.shippingDaysMax || 21), 10),
      rating: parseFloat(String(item.rating || item.storeRating || 0)) || 0,
      yearsActive: parseInt(String(item.storeAge || item.yearsActive || 0), 10),
    }),
  },
  alibaba: {
    actorId: 'epctex~alibaba-scraper',
    maxResults: 10,
    buildBody: (keyword, max) => ({ search: keyword, maxItems: max }),
    mapItem: (item) => ({
      supplierName: (item.companyName as string) || (item.supplier as string) || (item.title as string) || 'Unknown',
      supplierUrl: (item.url as string) || (item.contactUrl as string) || '',
      unitCost: parseFloat(String(item.price || item.unitPrice || 0)) || 0,
      moq: parseInt(String(item.moq || item.minOrder || 1), 10),
      shippingCost: parseFloat(String(item.shippingCost || 0)) || 0,
      shipDaysMin: parseInt(String(item.leadTime || 7), 10),
      shipDaysMax: parseInt(String(item.leadTime || 14), 10) + 7,
      rating: parseFloat(String(item.rating || 0)) || 0,
      yearsActive: parseInt(String(item.yearsActive || item.experience || 0), 10),
      responseRate: parseFloat(String(item.responseRate || 0)) || 0,
      onTimeDelivery: parseFloat(String(item.onTimeDelivery || 0)) || 0,
      disputeRate: parseFloat(String(item.disputeRate || 0)) || 0,
    }),
  },
  '1688': {
    actorId: 'epctex~alibaba-scraper',
    maxResults: 10,
    buildBody: (keyword, max) => ({ search: keyword, maxItems: max, marketplace: '1688' }),
    mapItem: (item) => ({
      supplierName: (item.companyName as string) || (item.supplier as string) || 'Unknown',
      supplierUrl: (item.url as string) || '',
      unitCost: parseFloat(String(item.price || item.unitPrice || 0)) || 0,
      moq: parseInt(String(item.moq || item.minOrder || 1), 10),
      shippingCost: 0,
      shipDaysMin: 10,
      shipDaysMax: 25,
      rating: parseFloat(String(item.rating || 0)) || 0,
      yearsActive: parseInt(String(item.yearsActive || 0), 10),
    }),
  },
};

/** Verification scoring weights */
const VERIFICATION_WEIGHTS = {
  yearsActive: 0.2,     // How long the supplier has been active
  rating: 0.25,         // Platform rating (normalized to 0-1)
  responseRate: 0.15,   // Response rate percentage
  onTimeDelivery: 0.2,  // On-time delivery percentage
  disputeRate: 0.2,     // Inverse of dispute rate
};

export class SupplierDiscoveryEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'supplier-discovery',
    version: '2.0.0',
    dependencies: [],
    queues: ['supplier-discovery', 'supplier-verify'],
    publishes: [
      ENGINE_EVENTS.SUPPLIER_FOUND,
      ENGINE_EVENTS.SUPPLIER_VERIFIED,
      ENGINE_EVENTS.SUPPLIER_BATCH_COMPLETE,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
      ENGINE_EVENTS.PROFITABILITY_CALCULATED,
    ],
  };

  /** Inject a Supabase client (for testability) */
  setDbClient(client: SupabaseMinimalClient): void {
    this._dbClient = client;
  }

  private getDb(): SupabaseMinimalClient {
    if (this._dbClient) return this._dbClient;
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
    if (event.type === ENGINE_EVENTS.PRODUCT_SCORED) {
      // Comm #3.004: Search suppliers for WARM+ products
      const payload = event.payload as ProductScoredPayload;
      if (payload.finalScore >= 60) {
        console.log(`[SupplierDiscovery] WARM+ product ${payload.productId} (score: ${payload.finalScore}), supplier search eligible`);
        // G10: Manual-first — admin triggers via dashboard
      }
    }
    if (event.type === ENGINE_EVENTS.PROFITABILITY_CALCULATED) {
      // When profitability is calculated, check if better suppliers exist
      console.log(`[SupplierDiscovery] Profitability calculated, checking for alternative suppliers`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Discover suppliers for a product keyword across platforms.
   * V9 Tasks: 4.005–4.020
   */
  async discoverSuppliers(
    productId: string,
    keyword: string,
    platforms: string[] = ['aliexpress', 'alibaba'],
  ): Promise<{ suppliersFound: number; records: SupplierRecord[] }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();
      const allRecords: SupplierRecord[] = [];

      const token = process.env.APIFY_API_TOKEN;
      if (!token) {
        console.warn('[SupplierDiscovery] APIFY_API_TOKEN not set — skipping live scan');
      }

      for (const platform of platforms) {
        const config = SUPPLIER_PLATFORMS[platform];
        if (!config) continue;

        console.log(`[SupplierDiscovery] Searching ${platform} for "${keyword}" (actor: ${config.actorId})`);

        // Check existing suppliers to avoid duplicates
        const { data: existing } = await db
          .from('product_suppliers')
          .select('supplier_url')
          .eq('product_id', productId)
          .eq('platform', platform);

        const existingUrls = new Set((existing || []).map((r: { supplier_url: string }) => r.supplier_url));

        // Call Apify actor for this platform (with circuit breaker)
        if (token) {
          try {
            log.info('Searching suppliers via Apify', { platform, keyword, actorId: config.actorId });
            const apifyBreaker = getCircuitBreaker('apify');
            const res = await apifyBreaker.execute(() => fetch(
              `https://api.apify.com/v2/acts/${config.actorId}/run-sync-get-dataset-items?token=${token}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config.buildBody(keyword, config.maxResults)),
                signal: AbortSignal.timeout(90000),
              },
            ));

            if (!res.ok) {
              log.error('Apify supplier search failed', { platform, status: res.status, statusText: res.statusText });
              continue;
            }

            const items = await res.json();
            if (!Array.isArray(items)) continue;

            const mapped = items
              .map((item: Record<string, unknown>) => config.mapItem(item))
              .filter((r): r is NonNullable<typeof r> => r !== null && !!r.supplierUrl);

            log.info('Supplier search results', { platform, raw: items.length, mapped: mapped.length });

            // Filter out existing, then process via the standard pipeline
            const newSuppliers = mapped.filter(r => !existingUrls.has(r.supplierUrl));
            if (newSuppliers.length > 0) {
              const result = await this.processScrapedSuppliers(productId, platform, newSuppliers);
              console.log(`[SupplierDiscovery] ${platform}: inserted ${result.inserted}, updated ${result.updated}`);
            }

            // Build records for return value
            for (const s of mapped) {
              const fulfillmentType: 'dropship' | 'wholesale' | 'mixed' =
                s.moq <= 1 ? 'dropship' : s.moq <= 50 ? 'mixed' : 'wholesale';
              allRecords.push({
                product_id: productId,
                supplier_name: s.supplierName,
                supplier_url: s.supplierUrl,
                platform,
                unit_cost: s.unitCost,
                moq: s.moq,
                shipping_cost: s.shippingCost || 0,
                ship_days_min: s.shipDaysMin || 7,
                ship_days_max: s.shipDaysMax || 21,
                rating: s.rating || 0,
                years_active: s.yearsActive || 0,
                verified: false,
                verification_score: 0,
                fulfillment_type: fulfillmentType,
              });
            }
          } catch (err) {
            console.error(`[SupplierDiscovery] Apify ${platform} fetch failed:`, err);
          }
        }
      }

      await bus.emit(
        ENGINE_EVENTS.SUPPLIER_BATCH_COMPLETE,
        { productId, keyword, platforms, suppliersFound: allRecords.length },
        'supplier-discovery',
      );

      return { suppliersFound: allRecords.length, records: allRecords };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Process raw Apify supplier data and upsert to DB.
   * Called by the supplier-discovery BullMQ worker with scraped results.
   * V9 Tasks: 4.010–4.018
   */
  async processScrapedSuppliers(
    productId: string,
    platform: string,
    rawResults: Array<{
      supplierName: string;
      supplierUrl: string;
      unitCost: number;
      moq: number;
      shippingCost?: number;
      shipDaysMin?: number;
      shipDaysMax?: number;
      rating?: number;
      yearsActive?: number;
      responseRate?: number;
      onTimeDelivery?: number;
      disputeRate?: number;
    }>,
  ): Promise<{ inserted: number; updated: number }> {
    const db = this.getDb();
    const bus = getEventBus();
    let inserted = 0;
    let updated = 0;

    for (const result of rawResults) {
      // Calculate verification score
      const verificationScore = this.calculateVerificationScore({
        yearsActive: result.yearsActive || 0,
        rating: result.rating || 0,
        responseRate: result.responseRate || 0,
        onTimeDelivery: result.onTimeDelivery || 0,
        disputeRate: result.disputeRate || 0,
      });

      const fulfillmentType: 'dropship' | 'wholesale' | 'mixed' =
        result.moq <= 1 ? 'dropship' : result.moq <= 50 ? 'mixed' : 'wholesale';

      // Check if supplier exists
      const { data: existing } = await db
        .from('product_suppliers')
        .select('id, unit_cost')
        .eq('product_id', productId)
        .eq('supplier_url', result.supplierUrl)
        .single();

      if (existing) {
        await db
          .from('product_suppliers')
          .update({
            unit_cost: result.unitCost,
            moq: result.moq,
            shipping_cost: result.shippingCost || 0,
            ship_days_min: result.shipDaysMin || 7,
            ship_days_max: result.shipDaysMax || 21,
            rating: result.rating || 0,
            years_active: result.yearsActive || 0,
            verification_score: verificationScore,
            fulfillment_type: fulfillmentType,
            last_checked_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        updated++;
      } else {
        await db
          .from('product_suppliers')
          .insert({
            product_id: productId,
            supplier_name: result.supplierName,
            supplier_url: result.supplierUrl,
            platform,
            unit_cost: result.unitCost,
            moq: result.moq,
            shipping_cost: result.shippingCost || 0,
            ship_days_min: result.shipDaysMin || 7,
            ship_days_max: result.shipDaysMax || 21,
            rating: result.rating || 0,
            years_active: result.yearsActive || 0,
            verified: verificationScore >= 0.7,
            verification_score: verificationScore,
            fulfillment_type: fulfillmentType,
            first_seen_at: new Date().toISOString(),
            last_checked_at: new Date().toISOString(),
          });
        inserted++;

        await bus.emit(
          ENGINE_EVENTS.SUPPLIER_FOUND,
          {
            productId,
            supplierId: result.supplierUrl,
            platform,
            unitCost: result.unitCost,
            moq: result.moq,
            shipDays: result.shipDaysMax || 21,
          },
          'supplier-discovery',
        );
      }
    }

    return { inserted, updated };
  }

  /**
   * Verify a specific supplier (MOQ, ship time, quality signals).
   * V9 Tasks: 4.021–4.035
   */
  async verifySupplier(
    supplierId: string,
    productId: string,
  ): Promise<{ verified: boolean; score: number }> {
    const bus = getEventBus();
    const db = this.getDb();

    // Fetch supplier data from DB
    const { data: supplier } = await db
      .from('product_suppliers')
      .select('*')
      .eq('id', supplierId)
      .single();

    if (!supplier) {
      return { verified: false, score: 0 };
    }

    const score = this.calculateVerificationScore({
      yearsActive: supplier.years_active || 0,
      rating: supplier.rating || 0,
      responseRate: supplier.response_rate || 0,
      onTimeDelivery: supplier.on_time_delivery || 0,
      disputeRate: supplier.dispute_rate || 0,
    });

    const verified = score >= 0.7;

    // Update verification status in DB
    await db
      .from('product_suppliers')
      .update({
        verified,
        verification_score: score,
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', supplierId);

    await bus.emit(
      ENGINE_EVENTS.SUPPLIER_VERIFIED,
      { supplierId, productId, verified, score },
      'supplier-discovery',
    );

    return { verified, score };
  }

  /**
   * Get cheapest supplier for a product.
   * Used by Profitability engine (Comm #10.001) and Financial Modelling.
   */
  async getCheapestSupplier(
    productId: string,
    fulfillmentType?: 'dropship' | 'wholesale' | 'mixed',
  ): Promise<SupplierRecord | null> {
    const db = this.getDb();

    let query = db
      .from('product_suppliers')
      .select('*')
      .eq('product_id', productId)
      .order('unit_cost', { ascending: true })
      .limit(1);

    if (fulfillmentType) {
      query = query.eq('fulfillment_type', fulfillmentType);
    }

    const { data } = await query.single();
    return data || null;
  }

  /**
   * Calculate verification score from supplier metrics.
   * V9 Tasks: 4.025–4.030
   */
  private calculateVerificationScore(metrics: {
    yearsActive: number;
    rating: number;
    responseRate: number;
    onTimeDelivery: number;
    disputeRate: number;
  }): number {
    const { yearsActive, rating, responseRate, onTimeDelivery, disputeRate } = metrics;

    // Normalize each metric to 0-1
    const yearScore = Math.min(yearsActive / 5, 1); // 5+ years = max
    const ratingScore = rating / 5; // Assuming 5-star scale
    const responseScore = responseRate / 100;
    const deliveryScore = onTimeDelivery / 100;
    const disputeScore = 1 - Math.min(disputeRate / 10, 1); // Lower is better

    return (
      yearScore * VERIFICATION_WEIGHTS.yearsActive +
      ratingScore * VERIFICATION_WEIGHTS.rating +
      responseScore * VERIFICATION_WEIGHTS.responseRate +
      deliveryScore * VERIFICATION_WEIGHTS.onTimeDelivery +
      disputeScore * VERIFICATION_WEIGHTS.disputeRate
    );
  }
}

