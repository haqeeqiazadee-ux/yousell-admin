/**
 * YOUSELL Engine Governor — Dispatch Stage
 *
 * Routes operations to the correct engine implementation.
 * Supports engine swapping — admin can remap engineName → different impl.
 * Supports external engine APIs — routes to HTTP endpoints when swapped to external.
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 4.3
 */

import { supabaseAdmin } from '@/lib/supabase';
import { getEngineRegistry } from '../registry';
import type { EngineName } from '../types';
import type { DispatchContext, EngineOperationResult, ExternalEngineRecord } from './types';
import { callExternalEngine } from './external-adapter';

interface SwapResolution {
  /** Resolved engine name (internal) or original if external */
  engineName: EngineName;
  /** Whether this swap targets an external API */
  isExternal: boolean;
  /** External engine record (populated when isExternal=true) */
  externalEngine?: ExternalEngineRecord;
}

export class GovernorDispatch {
  /** In-memory swap table cache — refreshed from DB periodically */
  private swapCache: Map<EngineName, EngineName> = new Map();
  /** External engine swap cache — keyed by source engine name */
  private externalSwapCache: Map<EngineName, ExternalEngineRecord> = new Map();
  private swapCacheAge = 0;
  private static readonly SWAP_CACHE_TTL_MS = 30_000; // 30s

  /**
   * Dispatch an operation to the resolved engine.
   * Checks the swap table first — routes to internal engine or external API.
   */
  async dispatch(
    engineName: EngineName,
    operation: string,
    params: Record<string, unknown>,
    context: DispatchContext
  ): Promise<EngineOperationResult> {
    const startTime = Date.now();

    try {
      // 1. Resolve actual engine (check swap table — may be internal or external)
      const resolution = await this.resolveEngineWithContext(engineName);

      // 2. Route: external API or internal registry
      if (resolution.isExternal && resolution.externalEngine) {
        return await callExternalEngine(
          resolution.externalEngine,
          operation,
          params,
          context
        );
      }

      // 3. Internal engine — get from registry
      const registry = getEngineRegistry();
      const engine = registry.getOrThrow(resolution.engineName);

      // 4. Execute with timeout + error isolation
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
   * Resolve engine with full context — includes external engine info.
   */
  async resolveEngineWithContext(engineName: EngineName): Promise<SwapResolution> {
    await this.refreshSwapCacheIfStale();

    // Check external swaps first
    const externalEngine = this.externalSwapCache.get(engineName);
    if (externalEngine) {
      return { engineName, isExternal: true, externalEngine };
    }

    // Check internal swaps
    const swappedName = this.swapCache.get(engineName);
    return {
      engineName: swappedName ?? engineName,
      isExternal: false,
    };
  }

  /**
   * Force-refresh the swap cache from DB.
   * Loads both internal and external swaps.
   */
  async refreshSwapCache(): Promise<void> {
    // Load all active swaps with external engine details
    const { data } = await supabaseAdmin
      .from('engine_swaps')
      .select('source_engine, target_engine, expires_at, is_external, external_engine_id')
      .eq('active', true);

    this.swapCache.clear();
    this.externalSwapCache.clear();

    if (!data) {
      this.swapCacheAge = Date.now();
      return;
    }

    const now = new Date();
    const externalIds: string[] = [];

    for (const row of data) {
      // Skip expired swaps
      const expiresAt = row.expires_at as string | null;
      if (expiresAt && new Date(expiresAt) < now) continue;

      if (row.is_external && row.external_engine_id) {
        externalIds.push(row.external_engine_id);
      } else {
        this.swapCache.set(
          row.source_engine as EngineName,
          row.target_engine as EngineName,
        );
      }
    }

    // Load external engine records for external swaps
    if (externalIds.length > 0) {
      const { data: extEngines } = await supabaseAdmin
        .from('external_engines')
        .select('*')
        .in('id', externalIds)
        .eq('active', true);

      if (extEngines) {
        // Map external engine ID → record
        const extMap = new Map(extEngines.map(e => [e.id, e]));

        for (const row of data) {
          if (!row.is_external || !row.external_engine_id) continue;
          const expiresAt = row.expires_at as string | null;
          if (expiresAt && new Date(expiresAt) < now) continue;

          const extRecord = extMap.get(row.external_engine_id);
          if (extRecord) {
            this.externalSwapCache.set(
              row.source_engine as EngineName,
              {
                id: extRecord.id,
                engineKey: extRecord.engine_key,
                displayName: extRecord.display_name,
                apiEndpoint: extRecord.api_endpoint,
                authType: extRecord.auth_type,
                authHeaderName: extRecord.auth_header_name,
                authTokenEncrypted: extRecord.auth_token_encrypted,
                healthEndpoint: extRecord.health_endpoint,
                costPerOperationUSD: Number(extRecord.cost_per_operation_usd),
                timeoutMs: extRecord.timeout_ms,
                replacesEngine: extRecord.replaces_engine as EngineName | null,
                active: extRecord.active,
                lastHealthCheck: extRecord.last_health_check,
                lastHealthStatus: extRecord.last_health_status,
                metadata: extRecord.metadata ?? {},
                createdBy: extRecord.created_by,
                createdAt: extRecord.created_at,
                updatedAt: extRecord.updated_at,
              }
            );
          }
        }
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
