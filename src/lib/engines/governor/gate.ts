/**
 * YOUSELL Engine Governor — Gate Stage
 *
 * Pre-dispatch check that validates whether a client can access
 * a specific engine operation. Fail-closed: if unable to verify, deny.
 *
 * Gate checks execute in order — first failure = immediate deny.
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 4.2
 */

import { supabaseAdmin } from '@/lib/supabase';
import { getEngineRegistry } from '../registry';
import type { EngineName } from '../types';
import type {
  GateResult,
  GateDenialCode,
  ClientBudgetEnvelope,
  EngineAllowance,
  GovernorOverride,
} from './types';

export class GovernorGate {
  /**
   * Check if a client is allowed to execute an engine operation.
   * Returns { allowed: true } or { allowed: false, reason, code, suggestion }.
   */
  async check(
    clientId: string,
    engineName: EngineName,
    operation: string
  ): Promise<GateResult> {
    // 1. Check active overrides (client bypass or engine bypass)
    const override = await this.getActiveOverride(clientId, engineName);
    if (override) {
      return { allowed: true };
    }

    // 2. Load client's budget envelope
    const envelope = await this.getActiveEnvelope(clientId);
    if (!envelope) {
      return this.deny('NOT_IN_PLAN', 'No active subscription found', 'Subscribe to a plan to use this feature');
    }

    // 3. Is the engine in the client's plan?
    const allowance = envelope.engine_allowances?.[engineName] as EngineAllowance | undefined;
    if (!allowance || !allowance.enabled) {
      return this.deny(
        'NOT_IN_PLAN',
        `Engine "${engineName}" is not included in your ${envelope.plan_tier} plan`,
        `Upgrade your plan to access ${engineName}`
      );
    }

    // 4. Is the engine globally enabled (engine_toggles)?
    const engineEnabled = await this.isEngineEnabled(clientId, engineName);
    if (!engineEnabled) {
      return this.deny('ENGINE_DISABLED', `Engine "${engineName}" is currently disabled`);
    }

    // 5. Has the client exceeded operation quota?
    if (allowance.maxOperations !== -1 && allowance.usedOperations >= allowance.maxOperations) {
      return this.deny(
        'QUOTA_EXCEEDED',
        `Operation quota exceeded for ${engineName} (${allowance.usedOperations}/${allowance.maxOperations})`,
        'Upgrade your plan for higher limits'
      );
    }

    // 6. Has the client exceeded cost budget?
    if (allowance.maxCostUSD !== -1 && allowance.usedCostUSD >= allowance.maxCostUSD) {
      return this.deny(
        'BUDGET_EXCEEDED',
        `Cost budget exceeded for ${engineName} ($${Number(allowance.usedCostUSD).toFixed(2)}/$${Number(allowance.maxCostUSD).toFixed(2)})`,
        'Upgrade your plan for higher budget'
      );
    }

    // 7. Has the client exceeded global cost cap?
    const totalSpent = Number(envelope.total_spent_usd) || 0;
    const globalCap = Number(envelope.global_cost_cap_usd) || 0;
    if (totalSpent >= globalCap) {
      return this.deny(
        'BUDGET_EXCEEDED',
        `Global cost cap reached ($${totalSpent.toFixed(2)}/$${globalCap.toFixed(2)})`,
        'Contact support to increase your cost cap'
      );
    }

    // 8. Is the engine healthy?
    const registry = getEngineRegistry();
    const engine = registry.get(engineName);
    if (engine) {
      try {
        const healthy = await engine.healthCheck();
        if (!healthy) {
          return this.deny('ENGINE_UNHEALTHY', `Engine "${engineName}" is not healthy`);
        }
      } catch {
        return this.deny('ENGINE_UNHEALTHY', `Engine "${engineName}" health check failed`);
      }
    }

    // 9. Is the client in throttle zone (95%+)?
    const utilizationPercent = allowance.maxOperations === -1
      ? 0
      : (allowance.usedOperations / allowance.maxOperations) * 100;
    const throttleThreshold = Number(envelope.alert_throttle_percent) || 95;

    if (utilizationPercent >= throttleThreshold) {
      // In throttle zone — only allow essential operations
      const isEssential = this.isEssentialOperation(operation);
      if (!isEssential) {
        return this.deny(
          'THROTTLED',
          `Engine "${engineName}" is throttled — only essential operations allowed (${utilizationPercent.toFixed(0)}% used)`,
          'Upgrade your plan or wait for the next billing period'
        );
      }
    }

    return { allowed: true };
  }

  // ─── Private Helpers ───────────────────────────────────────

  private deny(code: GateDenialCode, reason: string, suggestion?: string): GateResult {
    return { allowed: false, code, reason, suggestion };
  }

  /**
   * Check if there's an active override for this client or engine.
   */
  private async getActiveOverride(
    clientId: string,
    engineName: EngineName
  ): Promise<GovernorOverride | null> {
    const { data } = await supabaseAdmin
      .from('governor_overrides')
      .select('*')
      .eq('active', true)
      .gt('expires_at', new Date().toISOString())
      .or(`override_type.eq.full_bypass,and(override_type.eq.client_bypass,target_client_id.eq.${clientId}),and(override_type.eq.engine_bypass,target_engine.eq.${engineName})`)
      .limit(1)
      .maybeSingle();

    return data as GovernorOverride | null;
  }

  /**
   * Get the client's active (non-archived) budget envelope.
   */
  private async getActiveEnvelope(clientId: string): Promise<Record<string, unknown> | null> {
    const now = new Date().toISOString();
    const { data } = await supabaseAdmin
      .from('engine_budget_envelopes')
      .select('*')
      .eq('client_id', clientId)
      .eq('archived', false)
      .lte('period_start', now)
      .gte('period_end', now)
      .limit(1)
      .maybeSingle();

    return data;
  }

  /**
   * Check if an engine is globally enabled for this client via engine_toggles.
   */
  private async isEngineEnabled(clientId: string, engineName: EngineName): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from('engine_toggles')
      .select('enabled')
      .eq('client_id', clientId)
      .eq('engine_name', engineName)
      .maybeSingle();

    // If no toggle row exists, default to enabled (plan allowance is the gate)
    if (!data) return true;
    return data.enabled;
  }

  /**
   * Essential operations are those that continue during throttle.
   * Non-essential operations like 'scan', 'generate' are blocked.
   */
  private isEssentialOperation(operation: string): boolean {
    const essentialOps = new Set([
      'status',
      'health',
      'healthCheck',
      'list',
      'get',
      'read',
      'track',          // order tracking
      'sync_inventory', // keep inventory in sync even during throttle
    ]);
    return essentialOps.has(operation);
  }
}
