/**
 * Affiliate Commission Engine (V9 Engine 13)
 *
 * Dual-stream revenue tracking: internal content affiliate commissions
 * and client referral commissions. Manages payout calculations,
 * commission attribution, and affiliate link generation.
 * Writes to affiliate_commissions table. Reads orders for attribution.
 *
 * V9 Tasks: 13.001–13.041
 * Comm #: 18.001–18.010, commission cost → Financial Modelling (#18.004)
 * @engine affiliate-engine
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  OrderPayload,
} from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

/** Commission rates by type and program */
const COMMISSION_RATES: Record<string, Record<string, number>> = {
  internal: {
    amazon: 0.04,        // 4% Amazon Associates
    tiktok: 0.05,        // 5% TikTok Shop affiliate
    shopify: 0.08,       // 8% Shopify Collabs
    default: 0.05,       // 5% default
  },
  client_referral: {
    starter: 0.10,       // 10% of client revenue
    growth: 0.08,        // 8%
    professional: 0.06,  // 6%
    enterprise: 0.05,    // 5%
    default: 0.08,
  },
};

/** Commission record */
export interface CommissionRecord {
  id?: string;
  order_id: string;
  product_id: string;
  client_id?: string;
  affiliate_id?: string;
  commission_type: 'internal' | 'client_referral';
  order_revenue: number;
  commission_rate: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'reversed';
  platform: string;
  attribution_source?: string;
  created_at?: string;
  confirmed_at?: string;
  paid_at?: string;
}

/** Payout summary */
export interface PayoutSummary {
  affiliate_id: string;
  month: string;
  total_commissions: number;
  confirmed_commissions: number;
  holdback_rate: number;
  holdback_amount: number;
  payout_amount: number;
  commission_count: number;
  status: 'pending' | 'processing' | 'paid';
}

export class AffiliateCommissionEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'affiliate-engine',
    version: '2.0.0',
    dependencies: [],
    queues: ['commission-calc', 'payout-processing'],
    publishes: [
      ENGINE_EVENTS.COMMISSION_RECORDED,
      ENGINE_EVENTS.PAYOUT_CALCULATED,
    ],
    subscribes: [
      ENGINE_EVENTS.ORDER_RECEIVED,
      ENGINE_EVENTS.ORDER_FULFILLED,
      ENGINE_EVENTS.PRODUCT_PUSHED,
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
    if (event.type === ENGINE_EVENTS.ORDER_RECEIVED) {
      const payload = event.payload as OrderPayload;
      console.log(`[AffiliateCommission] Order ${payload.orderId} received ($${payload.revenue}), commission calculation eligible`);
      // G10: Manual-first — can be auto-triggered in Level 3
    }
    if (event.type === ENGINE_EVENTS.ORDER_FULFILLED) {
      console.log(`[AffiliateCommission] Order fulfilled, commission confirmation eligible`);
    }
    if (event.type === ENGINE_EVENTS.PRODUCT_PUSHED) {
      console.log(`[AffiliateCommission] Product pushed to store, affiliate link generation eligible`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Record a commission for an order.
   * Writes to affiliate_commissions table.
   * V9 Tasks: 13.005–13.020
   */
  async recordCommission(
    orderId: string,
    productId: string,
    input: {
      commissionType: 'internal' | 'client_referral';
      orderRevenue: number;
      commissionRate?: number;
      platform?: string;
      clientId?: string;
      affiliateId?: string;
      attributionSource?: string;
    },
  ): Promise<{ commissionId: string; amount: number }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();

      // Determine commission rate
      const platform = input.platform || 'default';
      const rates = COMMISSION_RATES[input.commissionType] || COMMISSION_RATES.internal;
      const commissionRate = input.commissionRate || rates[platform] || rates.default;
      const amount = input.orderRevenue * commissionRate;
      const commissionId = `comm_${orderId}_${Date.now()}`;

      // Check for duplicate
      const { data: existing } = await db
        .from('affiliate_commissions')
        .select('id')
        .eq('order_id', orderId)
        .eq('commission_type', input.commissionType)
        .single();

      if (existing) {
        console.log(`[AffiliateCommission] Commission already exists for order ${orderId}`);
        return { commissionId: existing.id, amount };
      }

      // Write commission to DB
      const record: CommissionRecord = {
        order_id: orderId,
        product_id: productId,
        client_id: input.clientId,
        affiliate_id: input.affiliateId,
        commission_type: input.commissionType,
        order_revenue: input.orderRevenue,
        commission_rate: commissionRate,
        amount,
        status: 'pending',
        platform,
        attribution_source: input.attributionSource,
        created_at: new Date().toISOString(),
      };

      const { data: inserted } = await db
        .from('affiliate_commissions')
        .insert(record)
        .select('id')
        .single();

      const finalId = inserted?.id || commissionId;

      await bus.emit(
        ENGINE_EVENTS.COMMISSION_RECORDED,
        {
          orderId,
          productId,
          commissionType: input.commissionType,
          amount,
          rate: commissionRate,
          commissionId: finalId,
        },
        'affiliate-engine',
      );

      return { commissionId: finalId, amount };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Confirm a commission (after order is fulfilled and past return window).
   * V9 Tasks: 13.015–13.018
   */
  async confirmCommission(commissionId: string): Promise<{ confirmed: boolean }> {
    const db = this.getDb();

    const { error } = await db
      .from('affiliate_commissions')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', commissionId);

    return { confirmed: !error };
  }

  /**
   * Calculate monthly payout for a client/affiliate.
   * Aggregates confirmed commissions, applies holdback for chargebacks.
   * V9 Tasks: 13.021–13.035
   */
  async calculatePayout(
    affiliateId: string,
    month: string,
  ): Promise<PayoutSummary> {
    const bus = getEventBus();
    const db = this.getDb();

    // Get all commissions for this affiliate in the given month
    const monthStart = `${month}-01T00:00:00Z`;
    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const monthEnd = nextMonth.toISOString();

    const { data: commissions } = await db
      .from('affiliate_commissions')
      .select('amount, status')
      .eq('affiliate_id', affiliateId)
      .gte('created_at', monthStart)
      .lt('created_at', monthEnd);

    const allCommissions = commissions || [];
    const totalCommissions = allCommissions.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0);
    const confirmedCommissions = allCommissions
      .filter((c: { status: string }) => c.status === 'confirmed' || c.status === 'paid')
      .reduce((sum: number, c: { amount: number }) => sum + c.amount, 0);

    const holdbackRate = 0.1; // 10% holdback for chargebacks
    const holdbackAmount = confirmedCommissions * holdbackRate;
    const payoutAmount = confirmedCommissions - holdbackAmount;

    const summary: PayoutSummary = {
      affiliate_id: affiliateId,
      month,
      total_commissions: totalCommissions,
      confirmed_commissions: confirmedCommissions,
      holdback_rate: holdbackRate,
      holdback_amount: holdbackAmount,
      payout_amount: payoutAmount,
      commission_count: allCommissions.length,
      status: 'pending',
    };

    // Write payout summary to DB
    await db
      .from('affiliate_payouts')
      .upsert(summary, { onConflict: 'affiliate_id,month' });

    await bus.emit(
      ENGINE_EVENTS.PAYOUT_CALCULATED,
      {
        affiliateId,
        month,
        totalCommissions,
        payoutAmount,
        holdbackRate,
      },
      'affiliate-engine',
    );

    return summary;
  }

  /**
   * Get total commission cost for a product (used by Financial Modelling).
   * Comm #18.004: commission cost → Financial Modelling
   */
  async getProductCommissionCost(productId: string): Promise<number> {
    const db = this.getDb();
    const { data: commissions } = await db
      .from('affiliate_commissions')
      .select('amount')
      .eq('product_id', productId);

    return (commissions || []).reduce((sum: number, c: { amount: number }) => sum + c.amount, 0);
  }
}

