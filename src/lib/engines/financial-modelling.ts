/**
 * Financial Modelling Engine (V9 Engine 6)
 *
 * Generates ROI projections, ad spend models, influencer campaign economics,
 * and payback period calculations for product launch decisions.
 * Writes models to DB. Reads from profitability, suppliers, competitors.
 *
 * V9 Tasks: 6.001–6.044
 * Comm #: 6.001–6.010, 11.001–11.010
 * @engine financial-model
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  ProfitabilityPayload,
} from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

/** Financial model stored in DB */
export interface FinancialModel {
  id?: string;
  product_id: string;
  model_type: 'standard' | 'influencer' | 'pod' | 'affiliate';
  selling_price: number;
  unit_cost: number;
  monthly_ad_budget: number;
  estimated_cpa: number;
  estimated_monthly_units: number;
  months: number;
  projected_revenue: number;
  projected_cost: number;
  projected_profit: number;
  roi_percent: number;
  payback_days: number;
  monthly_profit: number;
  break_even_month: number;
  scenario: 'conservative' | 'moderate' | 'optimistic';
  commission_cost?: number;
  influencer_cost?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/** Scenario multipliers for projections */
const SCENARIO_MULTIPLIERS = {
  conservative: { revenue: 0.7, cost: 1.1 },
  moderate: { revenue: 1.0, cost: 1.0 },
  optimistic: { revenue: 1.3, cost: 0.9 },
};

export class FinancialModellingEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'financial-model',
    version: '2.0.0',
    dependencies: [],
    queues: ['financial-model'],
    publishes: [
      ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED,
      ENGINE_EVENTS.ROI_PROJECTED,
    ],
    subscribes: [
      ENGINE_EVENTS.PROFITABILITY_CALCULATED,
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
    if (event.type === ENGINE_EVENTS.PROFITABILITY_CALCULATED) {
      // Comm #5.005: When profitability is calculated, model generation becomes eligible
      const payload = event.payload as ProfitabilityPayload;
      console.log(`[FinancialModelling] Profitability calculated for ${payload.productId} (margin: ${payload.margin}), model generation eligible`);
    }
    if (event.type === ENGINE_EVENTS.SUPPLIER_FOUND) {
      console.log(`[FinancialModelling] New supplier found, model refresh eligible`);
    }
    if (event.type === ENGINE_EVENTS.COMPETITOR_DETECTED) {
      console.log(`[FinancialModelling] Competitor detected, budget projection adjustment eligible`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Generate a full financial model for a product launch.
   * Creates 3 scenarios (conservative/moderate/optimistic) and writes to DB.
   * V9 Tasks: 6.005–6.030
   */
  async generateModel(
    productId: string,
    input: {
      sellingPrice: number;
      unitCost: number;
      monthlyAdBudget: number;
      estimatedCpa: number;
      estimatedMonthlyUnits: number;
      months: number;
      modelType?: 'standard' | 'influencer' | 'pod' | 'affiliate';
    },
  ): Promise<{
    projectedRevenue: number;
    projectedCost: number;
    projectedProfit: number;
    roiPercent: number;
    paybackDays: number;
    scenarios: Record<string, { revenue: number; cost: number; profit: number; roi: number }>;
  }> {
    this._status = 'running';
    try {
      const { sellingPrice, unitCost, monthlyAdBudget, estimatedMonthlyUnits, months, estimatedCpa } = input;
      const modelType = input.modelType || 'standard';
      const db = this.getDb();
      const bus = getEventBus();

      // Fetch commission cost from affiliate_commissions if available
      let commissionCost = 0;
      try {
        const { data: commissions } = await db
          .from('affiliate_commissions')
          .select('amount')
          .eq('product_id', productId);
        if (commissions && commissions.length > 0) {
          commissionCost = commissions.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0);
        }
      } catch {
        // Non-critical
      }

      // Calculate base model (moderate scenario)
      const totalRevenue = sellingPrice * estimatedMonthlyUnits * months;
      const totalCogs = unitCost * estimatedMonthlyUnits * months;
      const totalAdSpend = monthlyAdBudget * months;
      const totalCost = totalCogs + totalAdSpend + commissionCost;
      const profit = totalRevenue - totalCost;
      const roiPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;
      const monthlyProfit = months > 0 ? profit / months : 0;
      const paybackDays = monthlyProfit > 0
        ? Math.ceil((monthlyAdBudget / monthlyProfit) * 30)
        : -1; // -1 = never breaks even
      const breakEvenMonth = monthlyProfit > 0
        ? Math.ceil(totalAdSpend / monthlyProfit)
        : -1;

      // Generate all 3 scenarios
      const scenarios: Record<string, { revenue: number; cost: number; profit: number; roi: number }> = {};

      for (const [scenario, multipliers] of Object.entries(SCENARIO_MULTIPLIERS)) {
        const sRevenue = totalRevenue * multipliers.revenue;
        const sCost = totalCost * multipliers.cost;
        const sProfit = sRevenue - sCost;
        const sRoi = sCost > 0 ? (sProfit / sCost) * 100 : 0;
        scenarios[scenario] = { revenue: sRevenue, cost: sCost, profit: sProfit, roi: sRoi };

        // Write each scenario to DB
        const model: FinancialModel = {
          product_id: productId,
          model_type: modelType,
          selling_price: sellingPrice,
          unit_cost: unitCost,
          monthly_ad_budget: monthlyAdBudget,
          estimated_cpa: estimatedCpa,
          estimated_monthly_units: estimatedMonthlyUnits,
          months,
          projected_revenue: sRevenue,
          projected_cost: sCost,
          projected_profit: sProfit,
          roi_percent: sRoi,
          payback_days: paybackDays,
          monthly_profit: monthlyProfit * multipliers.revenue,
          break_even_month: breakEvenMonth,
          scenario: scenario as 'conservative' | 'moderate' | 'optimistic',
          commission_cost: commissionCost,
          metadata: { generatedAt: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        };

        await db
          .from('financial_models')
          .upsert(model, { onConflict: 'product_id,scenario' });
      }

      // Emit financial model generated event
      await bus.emit(
        ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED,
        {
          productId,
          projectedRevenue: totalRevenue,
          projectedCost: totalCost,
          projectedProfit: profit,
          roiPercent,
          paybackDays,
        },
        'financial-model',
      );

      return {
        projectedRevenue: totalRevenue,
        projectedCost: totalCost,
        projectedProfit: profit,
        roiPercent,
        paybackDays,
        scenarios,
      };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Project ROI for an influencer campaign.
   * V9 Tasks: 6.031–6.040
   */
  async projectInfluencerRoi(
    productId: string,
    influencerCost: number,
    estimatedConversions: number,
    sellingPrice: number,
    unitCost: number,
  ): Promise<{ roi: number; breakEvenConversions: number }> {
    const revenue = estimatedConversions * sellingPrice;
    const cogs = estimatedConversions * unitCost;
    const profit = revenue - cogs - influencerCost;
    const roi = influencerCost > 0 ? (profit / influencerCost) * 100 : 0;
    const marginPerUnit = sellingPrice - unitCost;
    const breakEvenConversions = marginPerUnit > 0 ? Math.ceil(influencerCost / marginPerUnit) : -1;

    // Write influencer model to DB
    const db = this.getDb();
    await db
      .from('financial_models')
      .upsert({
        product_id: productId,
        model_type: 'influencer',
        selling_price: sellingPrice,
        unit_cost: unitCost,
        monthly_ad_budget: 0,
        estimated_cpa: influencerCost / Math.max(estimatedConversions, 1),
        estimated_monthly_units: estimatedConversions,
        months: 1,
        projected_revenue: revenue,
        projected_cost: cogs + influencerCost,
        projected_profit: profit,
        roi_percent: roi,
        payback_days: profit > 0 ? 1 : -1,
        monthly_profit: profit,
        break_even_month: profit > 0 ? 1 : -1,
        scenario: 'moderate',
        influencer_cost: influencerCost,
        metadata: { breakEvenConversions, estimatedConversions },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'product_id,scenario' });

    const bus = getEventBus();
    await bus.emit(
      ENGINE_EVENTS.ROI_PROJECTED,
      { productId, roi, breakEvenConversions, influencerCost },
      'financial-model',
    );

    return { roi, breakEvenConversions };
  }

  /**
   * Get the best financial model for a product (read from DB).
   * Used by Launch Blueprint and Opportunity Feed.
   */
  async getBestModel(
    productId: string,
  ): Promise<FinancialModel | null> {
    const db = this.getDb();
    const { data } = await db
      .from('financial_models')
      .select('*')
      .eq('product_id', productId)
      .eq('scenario', 'moderate')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return data || null;
  }

  /**
   * Validate a financial model against real order data.
   * Reads actual revenue/quantity from the orders table and compares
   * against the projected model. Returns accuracy metrics and flags
   * models that are significantly off.
   *
   * V9 Tasks: 6.041–6.044
   * Comm #17.006: OrderTracking → FinancialModelling revenue validation
   */
  async validateModel(
    productId: string,
  ): Promise<{
    hasModel: boolean;
    hasOrders: boolean;
    projected: { revenue: number; units: number; months: number } | null;
    actual: { revenue: number; units: number; daysSinceLaunch: number } | null;
    accuracy: {
      revenueAccuracy: number;   // 1.0 = perfect, <1 = under-performed, >1 = over-performed
      unitAccuracy: number;
      monthlyRevenueProjected: number;
      monthlyRevenueActual: number;
      variance: number;          // Absolute % difference
      verdict: 'on_track' | 'under_performing' | 'over_performing' | 'no_data';
    };
  }> {
    const db = this.getDb();

    // Fetch the moderate scenario model
    const model = await this.getBestModel(productId);
    if (!model) {
      return {
        hasModel: false,
        hasOrders: false,
        projected: null,
        actual: null,
        accuracy: {
          revenueAccuracy: 0,
          unitAccuracy: 0,
          monthlyRevenueProjected: 0,
          monthlyRevenueActual: 0,
          variance: 0,
          verdict: 'no_data',
        },
      };
    }

    // Fetch real order data from the orders table
    const { data: orders } = await db
      .from('orders')
      .select('total_amount, quantity, created_at')
      .eq('product_id', productId)
      .not('status', 'eq', 'cancelled');

    const allOrders = orders || [];
    const totalRevenue = allOrders.reduce(
      (sum: number, o: { total_amount: number }) => sum + (o.total_amount || 0), 0,
    );
    const totalUnits = allOrders.reduce(
      (sum: number, o: { quantity: number }) => sum + (o.quantity || 0), 0,
    );

    if (allOrders.length === 0) {
      return {
        hasModel: true,
        hasOrders: false,
        projected: {
          revenue: model.projected_revenue,
          units: model.estimated_monthly_units * model.months,
          months: model.months,
        },
        actual: null,
        accuracy: {
          revenueAccuracy: 0,
          unitAccuracy: 0,
          monthlyRevenueProjected: model.projected_revenue / Math.max(model.months, 1),
          monthlyRevenueActual: 0,
          variance: 100,
          verdict: 'no_data',
        },
      };
    }

    // Calculate days since first order (proxy for launch date)
    const firstOrderDate = allOrders
      .map((o: { created_at: string }) => new Date(o.created_at).getTime())
      .sort((a: number, b: number) => a - b)[0];
    const daysSinceLaunch = Math.max(1, Math.ceil((Date.now() - firstOrderDate) / (1000 * 60 * 60 * 24)));
    const monthsActive = daysSinceLaunch / 30;

    // Normalize to monthly rate for fair comparison
    const monthlyRevenueProjected = model.projected_revenue / Math.max(model.months, 1);
    const monthlyRevenueActual = totalRevenue / Math.max(monthsActive, 0.1);
    const monthlyUnitsProjected = model.estimated_monthly_units;
    const monthlyUnitsActual = totalUnits / Math.max(monthsActive, 0.1);

    const revenueAccuracy = monthlyRevenueProjected > 0
      ? monthlyRevenueActual / monthlyRevenueProjected
      : 0;
    const unitAccuracy = monthlyUnitsProjected > 0
      ? monthlyUnitsActual / monthlyUnitsProjected
      : 0;
    const variance = Math.abs(1 - revenueAccuracy) * 100;

    let verdict: 'on_track' | 'under_performing' | 'over_performing' | 'no_data';
    if (revenueAccuracy >= 0.8 && revenueAccuracy <= 1.2) {
      verdict = 'on_track';
    } else if (revenueAccuracy < 0.8) {
      verdict = 'under_performing';
    } else {
      verdict = 'over_performing';
    }

    // Update the model with validation data
    await db
      .from('financial_models')
      .update({
        metadata: {
          ...(model.metadata || {}),
          validation: {
            validatedAt: new Date().toISOString(),
            actualRevenue: totalRevenue,
            actualUnits: totalUnits,
            daysSinceLaunch,
            revenueAccuracy: Math.round(revenueAccuracy * 100) / 100,
            unitAccuracy: Math.round(unitAccuracy * 100) / 100,
            verdict,
          },
        },
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId)
      .eq('scenario', 'moderate');

    return {
      hasModel: true,
      hasOrders: true,
      projected: {
        revenue: model.projected_revenue,
        units: model.estimated_monthly_units * model.months,
        months: model.months,
      },
      actual: {
        revenue: totalRevenue,
        units: totalUnits,
        daysSinceLaunch,
      },
      accuracy: {
        revenueAccuracy: Math.round(revenueAccuracy * 100) / 100,
        unitAccuracy: Math.round(unitAccuracy * 100) / 100,
        monthlyRevenueProjected: Math.round(monthlyRevenueProjected * 100) / 100,
        monthlyRevenueActual: Math.round(monthlyRevenueActual * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        verdict,
      },
    };
  }
}

