/**
 * YOUSELL Engine Governor — Singleton Orchestrator
 *
 * The single entry point for ALL engine operations.
 * Pipeline: Gate → Dispatch → Meter
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 4.5
 */

import { randomUUID } from 'crypto';
import { getEngineRegistry } from '../registry';
import type { EngineName } from '../types';
import { GovernorGate } from './gate';
import { GovernorDispatch } from './dispatch';
import { GovernorMeter } from './meter';
import type {
  GovernorExecuteContext,
  GovernorResponse,
  EngineOperationCost,
  EngineCostManifest,
} from './types';

export class EngineGovernor {
  private gate: GovernorGate;
  private dispatch: GovernorDispatch;
  private meter: GovernorMeter;

  constructor() {
    this.gate = new GovernorGate();
    this.dispatch = new GovernorDispatch();
    this.meter = new GovernorMeter();
  }

  /**
   * The single entry point for ALL engine operations.
   *
   * Super admins bypass the gate entirely.
   * Regular clients go through: Gate → Dispatch → Meter.
   */
  async execute(
    clientId: string,
    engineName: EngineName,
    operation: string,
    params: Record<string, unknown>,
    context: GovernorExecuteContext
  ): Promise<GovernorResponse> {
    const correlationId = randomUUID();

    // Super admin bypass
    if (context.isSuperAdmin) {
      return this.executeWithBypass(engineName, operation, params, {
        clientId,
        userId: context.userId,
        correlationId,
      });
    }

    // 1. GATE — Can they?
    const gateResult = await this.gate.check(clientId, engineName, operation);
    if (!gateResult.allowed) {
      return {
        success: false,
        denied: true,
        reason: gateResult.reason,
        code: gateResult.code,
        suggestion: gateResult.suggestion,
        correlationId,
      };
    }

    // 2. DISPATCH — Route it
    const result = await this.dispatch.dispatch(engineName, operation, params, {
      clientId,
      userId: context.userId,
      correlationId,
    });

    // 3. METER — Record it (async, non-blocking)
    const cost = this.lookupOperationCost(engineName, operation);
    this.meter
      .record({
        clientId,
        engineName,
        operation,
        costUSD: cost?.baseCostUSD ?? 0,
        timestamp: new Date().toISOString(),
        durationMs: result.durationMs,
        success: result.success,
        correlationId,
      })
      .catch((err) =>
        console.error('[Governor] Metering error:', err instanceof Error ? err.message : err)
      );

    if (!result.success) {
      return {
        success: false,
        reason: result.error,
        correlationId,
      };
    }

    return {
      success: true,
      data: result.data,
      correlationId,
    };
  }

  /**
   * Super admin bypass — skip gate, still meter for audit trail.
   */
  private async executeWithBypass(
    engineName: EngineName,
    operation: string,
    params: Record<string, unknown>,
    context: { clientId: string; userId: string; correlationId: string }
  ): Promise<GovernorResponse> {
    const result = await this.dispatch.dispatch(engineName, operation, params, context);

    // Still meter bypass usage for audit
    this.meter
      .record({
        clientId: context.clientId,
        engineName,
        operation: `bypass:${operation}`,
        costUSD: 0, // Bypass doesn't count toward budget
        timestamp: new Date().toISOString(),
        durationMs: result.durationMs,
        success: result.success,
        correlationId: context.correlationId,
      })
      .catch((err) =>
        console.error('[Governor] Bypass metering error:', err instanceof Error ? err.message : err)
      );

    if (!result.success) {
      return {
        success: false,
        reason: result.error,
        correlationId: context.correlationId,
      };
    }

    return {
      success: true,
      data: result.data,
      correlationId: context.correlationId,
    };
  }

  /**
   * Look up the cost of a specific operation from the engine's cost manifest.
   */
  private lookupOperationCost(
    engineName: EngineName,
    operation: string
  ): EngineOperationCost | undefined {
    const registry = getEngineRegistry();
    const engine = registry.get(engineName);
    const manifest: EngineCostManifest | undefined = engine?.costManifest;
    return manifest?.operations.find((op) => op.operation === operation);
  }

  /**
   * Get the Gate instance for direct access (e.g., pre-check in middleware).
   */
  getGate(): GovernorGate {
    return this.gate;
  }

  /**
   * Get the Dispatch instance for swap cache management.
   */
  getDispatch(): GovernorDispatch {
    return this.dispatch;
  }

  /**
   * Get the Meter instance for direct recording (e.g., background jobs).
   */
  getMeter(): GovernorMeter {
    return this.meter;
  }
}

// ─── Singleton ─────────────────────────────────────────────

let _governor: EngineGovernor | null = null;

/**
 * Get the singleton Governor instance.
 * Created on first access, reused thereafter.
 */
export function getGovernor(): EngineGovernor {
  if (!_governor) {
    _governor = new EngineGovernor();
  }
  return _governor;
}

/**
 * Reset the Governor singleton (for testing only).
 */
export function resetGovernor(): void {
  _governor = null;
}
