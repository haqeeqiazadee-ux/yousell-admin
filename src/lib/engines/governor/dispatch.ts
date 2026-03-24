/**
 * YOUSELL Engine Governor — Dispatch Stage
 *
 * Routes operations to the correct engine implementation.
 * Supports engine swapping — admin can remap engineName → different impl.
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 4.3
 */

import { supabaseAdmin } from '@/lib/supabase';
import { getEngineRegistry } from '../registry';
import type { EngineName } from '../types';
import type { DispatchContext, EngineOperationResult } from './types';

export class GovernorDispatch {
  /** In-memory swap table cache — refreshed from DB periodically */
  private swapCache: Map<EngineName, EngineName> = new Map();
  private swapCacheAge = 0;
  private static readonly SWAP_CACHE_TTL_MS = 30_000; // 30s

  /**
   * Dispatch an operation to the resolved engine.
   * Checks the swap table first, then delegates to the actual engine.
   */
  async dispatch(
    engineName: EngineName,
    operation: string,
    params: Record<string, unknown>,
    context: DispatchContext
  ): Promise<EngineOperationResult> {
    const startTime = Date.now();

    try {
      // 1. Resolve actual engine (check swap table)
      const resolvedEngine = await this.resolveEngine(engineName);

      // 2. Get engine from registry
      const registry = getEngineRegistry();
      const engine = registry.getOrThrow(resolvedEngine);

      // 3. Execute with timeout + error isolation
      const result = await this.executeWithTimeout(
        engine,
        operation,
        params,
        context,
        60_000 // 60s default timeout
      );

      return {
        success: true,
        data: result,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Governor Dispatch] Error dispatching ${engineName}.${operation}:`, message);

      return {
        success: false,
        error: message,
        durationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Check if this engine has been swapped by admin.
   * Returns the replacement engine name, or original if no swap.
   */
  async resolveEngine(engineName: EngineName): Promise<EngineName> {
    await this.refreshSwapCacheIfStale();
    return this.swapCache.get(engineName) ?? engineName;
  }

  /**
   * Force-refresh the swap cache from DB.
   */
  async refreshSwapCache(): Promise<void> {
    const { data } = await supabaseAdmin
      .from('engine_swaps')
      .select('source_engine, target_engine, expires_at')
      .eq('active', true);

    this.swapCache.clear();

    if (data) {
      const now = new Date();
      for (const row of data) {
        // Skip expired swaps
        const expiresAt = row.expires_at as string | null;
        if (expiresAt && new Date(expiresAt) < now) continue;
        this.swapCache.set(
          row.source_engine as EngineName,
          row.target_engine as EngineName,
        );
      }
    }

    this.swapCacheAge = Date.now();
  }

  // ─── Private Helpers ───────────────────────────────────────

  private async refreshSwapCacheIfStale(): Promise<void> {
    if (Date.now() - this.swapCacheAge > GovernorDispatch.SWAP_CACHE_TTL_MS) {
      await this.refreshSwapCache();
    }
  }

  /**
   * Execute an engine operation with timeout protection.
   * The engine's handleEvent is the generic interface — for direct operations,
   * we synthesize an event and route it through the engine.
   */
  private async executeWithTimeout(
    engine: import('../types').Engine,
    operation: string,
    params: Record<string, unknown>,
    context: DispatchContext,
    timeoutMs: number
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Engine operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      );

      // Route through engine's handleEvent with a synthetic governor event
      engine
        .handleEvent({
          type: `governor.dispatch.${operation}`,
          payload: { ...params, _context: context },
          source: 'engine-governor' as EngineName,
          timestamp: new Date().toISOString(),
          correlationId: context.correlationId,
        })
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}
