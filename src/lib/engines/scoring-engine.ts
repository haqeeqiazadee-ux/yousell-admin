/**
 * Scoring Engine — Engine-pattern wrapper around the scoring module.
 *
 * The actual scoring logic lives in src/lib/scoring/composite.ts (pure functions).
 * This file provides the Engine interface wrapper for registry integration
 * and event emission when products are scored.
 *
 * Consumers should continue importing scoring functions directly from
 * '@/lib/scoring/composite' — this engine is for lifecycle and event bus only.
 */

import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';
import {
  calculateCompositeScore,
  getTierFromScore,
  getStageFromViralScore,
  shouldRejectProduct,
  type CompositeScore,
  type RejectionInput,
} from '@/lib/scoring/composite';

export class ScoringEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'scoring',
    version: '1.0.0',
    dependencies: [],
    queues: ['enrich-product'],
    publishes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
      ENGINE_EVENTS.PRODUCT_REJECTED,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_DISCOVERED,
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
    if (event.type === ENGINE_EVENTS.PRODUCT_DISCOVERED) {
      // Could auto-score newly discovered products
      // For now, log — manual-first per G10
      console.log(`[ScoringEngine] Product discovered from ${event.source}, scoring deferred to manual trigger`);
    }
  }

  async healthCheck(): Promise<boolean> {
    // Pure scoring logic — always healthy if the module loads
    return true;
  }

  /**
   * Score a product and emit the result via EventBus.
   * This is the event-aware wrapper around calculateCompositeScore.
   */
  async scoreProduct(
    productId: string,
    product: { price: number; sales_count: number; review_count: number; rating: number; source: string },
  ): Promise<CompositeScore> {
    this._status = 'running';
    try {
      const score = calculateCompositeScore(product);
      const tier = getTierFromScore(score.final_score);
      const stage = getStageFromViralScore(score.viral_score);

      const bus = getEventBus();
      await bus.emit(
        ENGINE_EVENTS.PRODUCT_SCORED,
        {
          productId,
          trendScore: score.trend_score,
          viralScore: score.viral_score,
          profitScore: score.profit_score,
          finalScore: score.final_score,
          tier,
          stage,
        },
        'scoring',
      );

      return score;
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Check if a product should be auto-rejected and emit event if so.
   */
  async checkRejection(
    productId: string,
    input: RejectionInput,
  ): Promise<{ rejected: boolean; reasons: string[] }> {
    const result = shouldRejectProduct(input);

    if (result.rejected) {
      const bus = getEventBus();
      await bus.emit(
        ENGINE_EVENTS.PRODUCT_REJECTED,
        { productId, reasons: result.reasons },
        'scoring',
      );
    }

    return result;
  }
}
