/**
 * Profitability & Logistics Engine (V9 Engine 5)
 *
 * Calculates full unit economics: COGS, shipping, platform fees,
 * ad cost estimates, margin analysis, and break-even projections.
 *
 * V9 Tasks: 5.001–5.043
 * @engine profitability
 */

import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';

export class ProfitabilityEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'profitability',
    version: '1.0.0',
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
      // Recalculate profitability when new supplier data arrives
      console.log(`[Profitability] Supplier found, recalc deferred per G10`);
    }
    if (event.type === ENGINE_EVENTS.COMPETITOR_DETECTED) {
      // Adjust pricing recommendations based on competitor data
      console.log(`[Profitability] Competitor detected, pricing refresh deferred`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Calculate full profitability model for a product.
   * V9 Tasks: 5.005–5.030
   */
  async calculateProfitability(
    productId: string,
    input: {
      sellingPrice: number;
      unitCost: number;
      shippingCost: number;
      platformFeeRate: number;
      adCostPerUnit: number;
      platform: string;
    },
  ): Promise<{
    margin: number;
    marginPercent: number;
    breakEvenUnits: number;
    recommendedPrice: number;
  }> {
    this._status = 'running';
    try {
      const { sellingPrice, unitCost, shippingCost, platformFeeRate, adCostPerUnit } = input;
      const platformFee = sellingPrice * platformFeeRate;
      const totalCost = unitCost + shippingCost + platformFee + adCostPerUnit;
      const margin = sellingPrice - totalCost;
      const marginPercent = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;
      const breakEvenUnits = margin > 0 ? Math.ceil(100 / margin) : Infinity;
      const recommendedPrice = totalCost / (1 - 0.35); // Target 35% margin

      const bus = getEventBus();
      await bus.emit(
        ENGINE_EVENTS.PROFITABILITY_CALCULATED,
        {
          productId,
          margin,
          marginPercent,
          breakEvenUnits,
          recommendedPrice,
          fulfillmentType: 'DROPSHIP',
        },
        'profitability',
      );

      // Alert if margin is below 15%
      if (marginPercent < 15 && marginPercent > 0) {
        await bus.emit(
          ENGINE_EVENTS.MARGIN_ALERT,
          { productId, margin, marginPercent, threshold: 15 },
          'profitability',
        );
      }

      return { margin, marginPercent, breakEvenUnits, recommendedPrice };
    } finally {
      this._status = 'idle';
    }
  }
}
