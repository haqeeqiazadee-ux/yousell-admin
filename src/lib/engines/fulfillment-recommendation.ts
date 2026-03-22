/**
 * Fulfillment Recommendation Engine (V9 Engine 14)
 *
 * Auto-recommends optimal fulfillment type per product:
 * DROPSHIP / WHOLESALE / POD / DIGITAL / AFFILIATE
 * Based on product type, margin, platform constraints, supplier data.
 * Writes recommendations to DB. Admin can override.
 *
 * V9 Tasks: 14.001–14.034
 * Comm #: 14.001–14.010, 19.001–19.010
 * @engine fulfillment-recommendation
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  FulfillmentPayload, SupplierFoundPayload, ProfitabilityPayload,
} from './types';
import { ENGINE_EVENTS } from './types';

type FulfillmentType = 'DROPSHIP' | 'WHOLESALE' | 'POD' | 'DIGITAL' | 'AFFILIATE' | 'PENDING_REVIEW';

/** Fulfillment recommendation record */
export interface FulfillmentRecommendation {
  product_id: string;
  recommended_type: FulfillmentType;
  confidence: number;
  decision_factors: DecisionFactor[];
  comparison_table: Record<string, { margin: number; upfrontCost: number; risk: string }>;
  overridden: boolean;
  override_type?: FulfillmentType;
  override_by?: string;
  override_reason?: string;
  updated_at: string;
}

interface DecisionFactor {
  factor: string;
  value: string | number;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export class FulfillmentRecommendationEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'fulfillment-recommendation',
    version: '2.0.0',
    dependencies: [],
    queues: ['fulfillment-eval'],
    publishes: [
      ENGINE_EVENTS.FULFILLMENT_RECOMMENDED,
      ENGINE_EVENTS.FULFILLMENT_OVERRIDDEN,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
      ENGINE_EVENTS.SUPPLIER_FOUND,
      ENGINE_EVENTS.PROFITABILITY_CALCULATED,
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
    if (event.type === ENGINE_EVENTS.SUPPLIER_FOUND) {
      const payload = event.payload as SupplierFoundPayload;
      console.log(`[FulfillmentRecommendation] Supplier found for ${payload.productId} (MOQ: ${payload.moq}), re-evaluation eligible`);
    }
    if (event.type === ENGINE_EVENTS.PROFITABILITY_CALCULATED) {
      const payload = event.payload as ProfitabilityPayload;
      console.log(`[FulfillmentRecommendation] Profitability calculated for ${payload.productId} (margin: ${payload.margin}), re-evaluation eligible`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Recommend fulfillment type for a product.
   * Writes recommendation to DB.
   * V9 Tasks: 14.005–14.022 (decision tree)
   */
  async recommend(
    productId: string,
    input: {
      productType: 'physical' | 'digital' | 'custom_apparel' | 'saas' | 'unknown';
      price: number;
      margin: number;
      volumeScore: number;
      targetPlatform: string;
      hasDropshipSupplier: boolean;
    },
  ): Promise<{
    fulfillmentType: FulfillmentType;
    confidence: number;
    comparisonTable: Record<string, { margin: number; upfrontCost: number; risk: string }>;
    decisionFactors: DecisionFactor[];
  }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();
      let fulfillmentType: FulfillmentType = 'PENDING_REVIEW';
      let confidence = 0;
      const decisionFactors: DecisionFactor[] = [];

      // V9 decision tree (Tasks 14.06–14.11)
      switch (input.productType) {
        case 'physical':
          decisionFactors.push({ factor: 'productType', value: 'physical', impact: 'neutral', weight: 0.3 });
          if (input.margin < 0.2 || input.price < 30) {
            fulfillmentType = 'DROPSHIP';
            confidence = 0.8;
            decisionFactors.push({ factor: 'lowMarginOrPrice', value: `margin: ${input.margin}, price: ${input.price}`, impact: 'positive', weight: 0.4 });
          } else if (input.margin >= 0.3 && input.volumeScore > 70) {
            fulfillmentType = 'WHOLESALE';
            confidence = 0.85;
            decisionFactors.push({ factor: 'highMarginHighVolume', value: `margin: ${input.margin}, volume: ${input.volumeScore}`, impact: 'positive', weight: 0.5 });
          } else {
            fulfillmentType = input.hasDropshipSupplier ? 'DROPSHIP' : 'WHOLESALE';
            confidence = 0.6;
            decisionFactors.push({ factor: 'supplierAvailability', value: input.hasDropshipSupplier ? 'has_dropship' : 'no_dropship', impact: 'neutral', weight: 0.3 });
          }
          break;
        case 'custom_apparel':
          fulfillmentType = 'POD';
          confidence = input.margin >= 0.3 ? 0.9 : 0.5;
          decisionFactors.push({ factor: 'productType', value: 'custom_apparel', impact: 'positive', weight: 0.5 });
          break;
        case 'digital':
          fulfillmentType = 'DIGITAL';
          confidence = 0.95;
          decisionFactors.push({ factor: 'productType', value: 'digital', impact: 'positive', weight: 0.9 });
          break;
        case 'saas':
          fulfillmentType = 'AFFILIATE';
          confidence = 0.95;
          decisionFactors.push({ factor: 'productType', value: 'saas', impact: 'positive', weight: 0.9 });
          break;
        default:
          fulfillmentType = 'PENDING_REVIEW';
          confidence = 0.2;
          decisionFactors.push({ factor: 'productType', value: 'unknown', impact: 'negative', weight: 0.1 });
      }

      // Platform-specific overrides (V9 Tasks 14.12–14.16)
      if (input.targetPlatform === 'tiktok-shop' && fulfillmentType === 'DROPSHIP') {
        if (!input.hasDropshipSupplier) {
          fulfillmentType = 'PENDING_REVIEW';
          confidence = 0.3;
          decisionFactors.push({ factor: 'tiktokShipRequirement', value: '2-3 day US shipping required', impact: 'negative', weight: 0.4 });
        }
      }
      if (input.targetPlatform === 'etsy' && fulfillmentType !== 'POD') {
        const prevType = fulfillmentType;
        fulfillmentType = 'POD';
        confidence = Math.min(confidence, 0.6);
        decisionFactors.push({ factor: 'etsyRequirement', value: `overrode ${prevType} → POD`, impact: 'neutral', weight: 0.3 });
      }

      // POD margin check (V9 Tasks 14.17–14.18)
      if (fulfillmentType === 'POD' && input.margin < 0.3) {
        fulfillmentType = 'DROPSHIP';
        confidence = 0.5;
        decisionFactors.push({ factor: 'podMarginCheck', value: `margin ${input.margin} < 0.3 threshold`, impact: 'negative', weight: 0.3 });
      }

      // Build comparison table (V9 Task 14.19)
      const comparisonTable: Record<string, { margin: number; upfrontCost: number; risk: string }> = {
        DROPSHIP: { margin: 0.15, upfrontCost: 0, risk: 'Low' },
        WHOLESALE: { margin: 0.40, upfrontCost: 2000, risk: 'Medium' },
        POD: { margin: 0.40, upfrontCost: 0, risk: 'Low' },
        DIGITAL: { margin: 0.90, upfrontCost: 0, risk: 'Low' },
        AFFILIATE: { margin: 0.10, upfrontCost: 0, risk: 'Zero' },
      };

      // Write recommendation to DB
      const recommendation: FulfillmentRecommendation = {
        product_id: productId,
        recommended_type: fulfillmentType,
        confidence,
        decision_factors: decisionFactors,
        comparison_table: comparisonTable,
        overridden: false,
        updated_at: new Date().toISOString(),
      };

      await db
        .from('fulfillment_recommendations')
        .upsert(recommendation, { onConflict: 'product_id' });

      // Also update products table with fulfillment type
      await db
        .from('products')
        .update({ fulfillment_type: fulfillmentType })
        .eq('id', productId);

      await bus.emit(
        ENGINE_EVENTS.FULFILLMENT_RECOMMENDED,
        {
          productId,
          recommendedType: fulfillmentType as FulfillmentPayload['recommendedType'],
          confidence,
          comparisonTable,
        },
        'fulfillment-recommendation',
      );

      return { fulfillmentType, confidence, comparisonTable, decisionFactors };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Auto-recommend based on DB data (supplier + profitability).
   * V9 Tasks: 14.023–14.024
   */
  async autoRecommendFromData(
    productId: string,
    targetPlatform: string,
  ): Promise<{
    fulfillmentType: FulfillmentType;
    confidence: number;
    comparisonTable: Record<string, { margin: number; upfrontCost: number; risk: string }>;
    decisionFactors: DecisionFactor[];
  } | null> {
    const db = this.getDb();

    // Get product info
    const { data: product } = await db
      .from('products')
      .select('price, category, source')
      .eq('id', productId)
      .single();

    if (!product) return null;

    // Check for dropship supplier
    const { data: supplier } = await db
      .from('product_suppliers')
      .select('fulfillment_type')
      .eq('product_id', productId)
      .eq('verified', true)
      .limit(1)
      .single();

    // Get profitability data
    const { data: profitability } = await db
      .from('profitability_models')
      .select('margin_percent')
      .eq('product_id', productId)
      .limit(1)
      .single();

    // Infer product type from category
    const category = (product.category || '').toLowerCase();
    let productType: 'physical' | 'digital' | 'custom_apparel' | 'saas' | 'unknown' = 'unknown';
    if (category.includes('digital') || category.includes('template') || category.includes('course')) {
      productType = 'digital';
    } else if (category.includes('apparel') || category.includes('clothing') || category.includes('shirt')) {
      productType = 'custom_apparel';
    } else if (category.includes('saas') || category.includes('software') || category.includes('subscription')) {
      productType = 'saas';
    } else {
      productType = 'physical';
    }

    return this.recommend(productId, {
      productType,
      price: product.price || 0,
      margin: (profitability?.margin_percent || 0) / 100,
      volumeScore: 50, // Default moderate volume
      targetPlatform,
      hasDropshipSupplier: supplier?.fulfillment_type === 'dropship' || supplier?.fulfillment_type === 'mixed',
    });
  }

  /**
   * Admin overrides the fulfillment recommendation.
   * V9 Tasks: 14.25–14.26
   */
  async override(
    productId: string,
    newType: FulfillmentType,
    adminId: string,
    reason: string,
  ): Promise<void> {
    const bus = getEventBus();
    const db = this.getDb();

    // Update recommendation in DB
    await db
      .from('fulfillment_recommendations')
      .update({
        overridden: true,
        override_type: newType,
        override_by: adminId,
        override_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId);

    // Update products table
    await db
      .from('products')
      .update({ fulfillment_type: newType })
      .eq('id', productId);

    await bus.emit(
      ENGINE_EVENTS.FULFILLMENT_OVERRIDDEN,
      { productId, newType, overriddenBy: adminId, reason },
      'fulfillment-recommendation',
    );
  }
}

// Minimal type for Supabase client
interface SupabaseMinimalClient {
  from(table: string): {
    select(columns?: string): unknown;
    insert(data: unknown): unknown;
    update(data: unknown): unknown;
    upsert(data: unknown, options?: unknown): unknown;
    eq(column: string, value: unknown): unknown;
    in(column: string, values: unknown[]): unknown;
    order(column: string, options?: unknown): unknown;
    limit(count: number): unknown;
    single(): unknown;
    [key: string]: unknown;
  };
}
