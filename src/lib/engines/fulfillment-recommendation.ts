/**
 * Fulfillment Recommendation Engine (V9 Engine 14)
 *
 * Auto-recommends optimal fulfillment type per product:
 * DROPSHIP / WHOLESALE / POD / DIGITAL / AFFILIATE
 * Based on product type, margin, platform constraints, supplier data.
 *
 * V9 Tasks: 14.001–14.034
 * @engine fulfillment-recommendation
 */

import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus, FulfillmentPayload } from './types';
import { ENGINE_EVENTS } from './types';

type FulfillmentType = 'DROPSHIP' | 'WHOLESALE' | 'POD' | 'DIGITAL' | 'AFFILIATE' | 'PENDING_REVIEW';

export class FulfillmentRecommendationEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'fulfillment-recommendation',
    version: '1.0.0',
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
      console.log(`[FulfillmentRecommendation] Supplier found, re-evaluation deferred per G10`);
    }
    if (event.type === ENGINE_EVENTS.PROFITABILITY_CALCULATED) {
      console.log(`[FulfillmentRecommendation] Profitability calculated, re-evaluation deferred`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Recommend fulfillment type for a product.
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
  }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      let fulfillmentType: FulfillmentType = 'PENDING_REVIEW';
      let confidence = 0;

      // V9 decision tree (Tasks 14.06–14.11)
      switch (input.productType) {
        case 'physical':
          if (input.margin < 0.2 || input.price < 30) {
            fulfillmentType = 'DROPSHIP';
            confidence = 0.8;
          } else if (input.margin >= 0.3 && input.volumeScore > 70) {
            fulfillmentType = 'WHOLESALE';
            confidence = 0.85;
          } else {
            fulfillmentType = input.hasDropshipSupplier ? 'DROPSHIP' : 'WHOLESALE';
            confidence = 0.6;
          }
          break;
        case 'custom_apparel':
          fulfillmentType = 'POD';
          confidence = input.margin >= 0.3 ? 0.9 : 0.5;
          break;
        case 'digital':
          fulfillmentType = 'DIGITAL';
          confidence = 0.95;
          break;
        case 'saas':
          fulfillmentType = 'AFFILIATE';
          confidence = 0.95;
          break;
        default:
          fulfillmentType = 'PENDING_REVIEW';
          confidence = 0.2;
      }

      // Platform-specific overrides (V9 Tasks 14.12–14.16)
      if (input.targetPlatform === 'tiktok-shop' && fulfillmentType === 'DROPSHIP') {
        // TikTok Shop requires 2-3 day US shipping
        if (!input.hasDropshipSupplier) {
          fulfillmentType = 'PENDING_REVIEW';
          confidence = 0.3;
        }
      }
      if (input.targetPlatform === 'etsy' && fulfillmentType !== 'POD') {
        // Etsy requires POD or handmade-compatible
        fulfillmentType = 'POD';
        confidence = Math.min(confidence, 0.6);
      }

      // POD margin check (V9 Tasks 14.17–14.18)
      if (fulfillmentType === 'POD' && input.margin < 0.3) {
        fulfillmentType = 'DROPSHIP';
        confidence = 0.5;
      }

      // Build comparison table (V9 Task 14.19)
      const comparisonTable: Record<string, { margin: number; upfrontCost: number; risk: string }> = {
        DROPSHIP: { margin: 0.15, upfrontCost: 0, risk: 'Low' },
        WHOLESALE: { margin: 0.40, upfrontCost: 2000, risk: 'Medium' },
        POD: { margin: 0.40, upfrontCost: 0, risk: 'Low' },
        DIGITAL: { margin: 0.90, upfrontCost: 0, risk: 'Low' },
        AFFILIATE: { margin: 0.10, upfrontCost: 0, risk: 'Zero' },
      };

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

      return { fulfillmentType, confidence, comparisonTable };
    } finally {
      this._status = 'idle';
    }
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
    await bus.emit(
      ENGINE_EVENTS.FULFILLMENT_OVERRIDDEN,
      { productId, newType, overriddenBy: adminId, reason },
      'fulfillment-recommendation',
    );
  }
}
