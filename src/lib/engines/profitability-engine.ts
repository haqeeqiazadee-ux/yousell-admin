/**
 * Profitability & Logistics Engine (V9 Engine 5)
 *
 * Calculates full unit economics: COGS, shipping, platform fees,
 * ad cost estimates, margin analysis, and break-even projections.
 * Writes results to DB and triggers downstream engines.
 *
 * V9 Tasks: 5.001–5.043
 * Comm #: 3.005, 5.001–5.010, 10.001–10.010
 * @engine profitability
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  ProductScoredPayload, SupplierFoundPayload,
} from './types';
import { ENGINE_EVENTS } from './types';

/** Platform fee rates (inclusive of payment processing) */
const PLATFORM_FEE_RATES: Record<string, number> = {
  shopify: 0.029 + 0.02,      // 2.9% + 2% Shopify Payments
  amazon: 0.15,                // 15% referral fee
  tiktok: 0.05,                // 5% commission
  etsy: 0.065 + 0.03,         // 6.5% transaction + 3% payment
  walmart: 0.08,               // 8% referral
  ebay: 0.1289,                // 12.89% final value
};

/** Profitability model stored in DB */
export interface ProfitabilityModel {
  product_id: string;
  selling_price: number;
  unit_cost: number;
  shipping_cost: number;
  platform_fee: number;
  platform_fee_rate: number;
  ad_cost_per_unit: number;
  total_cost_per_unit: number;
  margin: number;
  margin_percent: number;
  break_even_units: number;
  recommended_price: number;
  fulfillment_type: string;
  platform: string;
  supplier_id?: string;
  competitor_avg_price?: number;
  price_position?: string;
  updated_at: string;
}

export class ProfitabilityEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'profitability',
    version: '2.0.0',
    dependencies: [],
    queues: ['profitability-calc'],
    publishes: [
      ENGINE_EVENTS.PROFITABILITY_CALCULATED,
      ENGINE_EVENTS.MARGIN_ALERT,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
      ENGINE_EVENTS.SUPPLIER_FOUND,
      ENGINE_EVENTS.COMPETITOR_DETECTED,
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
    if (event.type === ENGINE_EVENTS.PRODUCT_SCORED) {
      // Comm #3.005: Auto-calculate profitability for scored products
      const payload = event.payload as ProductScoredPayload;
      console.log(`[Profitability] Product ${payload.productId} scored (${payload.finalScore}), profitability calc eligible`);
      // G10: Manual-first — can be auto-triggered in Level 3 automation
    }
    if (event.type === ENGINE_EVENTS.SUPPLIER_FOUND) {
      // Recalculate profitability when new supplier data arrives
      const payload = event.payload as SupplierFoundPayload;
      console.log(`[Profitability] New supplier found for ${payload.productId} (cost: $${payload.unitCost}), recalc eligible`);
    }
    if (event.type === ENGINE_EVENTS.COMPETITOR_DETECTED) {
      // Adjust pricing recommendations based on competitor data
      console.log(`[Profitability] Competitor detected, pricing adjustment eligible`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Calculate full profitability model for a product.
   * Writes results to profitability_models table.
   * V9 Tasks: 5.005–5.030
   */
  async calculateProfitability(
    productId: string,
    input: {
      sellingPrice: number;
      unitCost: number;
      shippingCost: number;
      platformFeeRate?: number;
      adCostPerUnit: number;
      platform: string;
      fulfillmentType?: string;
      supplierId?: string;
    },
  ): Promise<{
    margin: number;
    marginPercent: number;
    breakEvenUnits: number;
    recommendedPrice: number;
    totalCostPerUnit: number;
  }> {
    this._status = 'running';
    try {
      const { sellingPrice, unitCost, shippingCost, adCostPerUnit, platform } = input;
      const platformFeeRate = input.platformFeeRate || PLATFORM_FEE_RATES[platform] || 0.05;
      const fulfillmentType = input.fulfillmentType || 'DROPSHIP';

      const platformFee = sellingPrice * platformFeeRate;
      const totalCost = unitCost + shippingCost + platformFee + adCostPerUnit;
      const margin = sellingPrice - totalCost;
      const marginPercent = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;
      const breakEvenUnits = margin > 0 ? Math.ceil(100 / margin) : Infinity;
      const recommendedPrice = totalCost / (1 - 0.35); // Target 35% margin

      // Get competitor pricing context
      let competitorAvgPrice: number | undefined;
      let pricePosition: string | undefined;
      try {
        const db = this.getDb();
        const { data: competitors } = await db
          .from('competitor_products')
          .select('price')
          .eq('product_id', productId);

        if (competitors && competitors.length > 0) {
          const prices = competitors.map((c: { price: number }) => c.price);
          competitorAvgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
          if (sellingPrice <= competitorAvgPrice * 0.9) pricePosition = 'below_avg';
          else if (sellingPrice <= competitorAvgPrice * 1.1) pricePosition = 'average';
          else pricePosition = 'above_avg';
        }
      } catch {
        // Non-critical — continue without competitor data
      }

      // Write profitability model to DB
      const db = this.getDb();
      const model: ProfitabilityModel = {
        product_id: productId,
        selling_price: sellingPrice,
        unit_cost: unitCost,
        shipping_cost: shippingCost,
        platform_fee: platformFee,
        platform_fee_rate: platformFeeRate,
        ad_cost_per_unit: adCostPerUnit,
        total_cost_per_unit: totalCost,
        margin,
        margin_percent: marginPercent,
        break_even_units: breakEvenUnits === Infinity ? -1 : breakEvenUnits,
        recommended_price: recommendedPrice,
        fulfillment_type: fulfillmentType,
        platform,
        supplier_id: input.supplierId,
        competitor_avg_price: competitorAvgPrice,
        price_position: pricePosition,
        updated_at: new Date().toISOString(),
      };

      await db
        .from('profitability_models')
        .upsert(model, { onConflict: 'product_id,platform' });

      // Also update products table with latest margin data
      await db
        .from('products')
        .update({
          margin: marginPercent,
          recommended_price: recommendedPrice,
        })
        .eq('id', productId);

      // Emit profitability calculated event
      const bus = getEventBus();
      await bus.emit(
        ENGINE_EVENTS.PROFITABILITY_CALCULATED,
        {
          productId,
          margin,
          marginPercent,
          breakEvenUnits: breakEvenUnits === Infinity ? -1 : breakEvenUnits,
          recommendedPrice,
          fulfillmentType,
        },
        'profitability',
      );

      // Alert if margin is below 15%
      if (marginPercent < 15 && marginPercent > 0) {
        await bus.emit(
          ENGINE_EVENTS.MARGIN_ALERT,
          { productId, margin, marginPercent, threshold: 15, platform },
          'profitability',
        );
      }

      return { margin, marginPercent, breakEvenUnits, recommendedPrice, totalCostPerUnit: totalCost };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Auto-calculate profitability using best available supplier data.
   * V9 Tasks: 5.031–5.038 (auto-calc from DB data)
   */
  async autoCalculateFromSuppliers(
    productId: string,
    platform: string,
  ): Promise<{
    margin: number;
    marginPercent: number;
    breakEvenUnits: number;
    recommendedPrice: number;
    totalCostPerUnit: number;
  } | null> {
    const db = this.getDb();

    // Get product price
    const { data: product } = await db
      .from('products')
      .select('price, title')
      .eq('id', productId)
      .single();

    if (!product?.price) return null;

    // Get cheapest verified supplier
    const { data: supplier } = await db
      .from('product_suppliers')
      .select('unit_cost, shipping_cost, fulfillment_type')
      .eq('product_id', productId)
      .eq('verified', true)
      .order('unit_cost', { ascending: true })
      .limit(1)
      .single();

    if (!supplier) return null;

    return this.calculateProfitability(productId, {
      sellingPrice: product.price,
      unitCost: supplier.unit_cost,
      shippingCost: supplier.shipping_cost || 0,
      adCostPerUnit: product.price * 0.15, // Estimate 15% of price for ads
      platform,
      fulfillmentType: supplier.fulfillment_type?.toUpperCase() || 'DROPSHIP',
    });
  }

  /**
   * Get profitability summary for a product (read from DB).
   * Used by Financial Modelling, Launch Blueprint, Opportunity Feed.
   */
  async getProfitabilitySummary(
    productId: string,
  ): Promise<ProfitabilityModel | null> {
    const db = this.getDb();
    const { data } = await db
      .from('profitability_models')
      .select('*')
      .eq('product_id', productId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return data || null;
  }
}

// Minimal type for Supabase client to avoid hard import dependency
interface SupabaseMinimalClient {
  from(table: string): {
    select(columns?: string): unknown;
    insert(data: unknown): unknown;
    update(data: unknown): unknown;
    upsert(data: unknown, options?: unknown): unknown;
    eq(column: string, value: unknown): unknown;
    order(column: string, options?: unknown): unknown;
    limit(count: number): unknown;
    single(): unknown;
    [key: string]: unknown;
  };
}
