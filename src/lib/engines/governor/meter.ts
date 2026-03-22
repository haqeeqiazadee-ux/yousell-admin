/**
 * YOUSELL Engine Governor — Meter Stage
 *
 * Post-dispatch async usage recording. Non-blocking — never delays
 * the response to the client. Records to usage ledger and updates
 * budget envelope counters.
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 4.4
 */

import { supabaseAdmin } from '@/lib/supabase';
import { getEventBus } from '../event-bus';
import type { UsageLedgerEntry } from './types';
import { GOVERNOR_EVENTS } from './types';

export class GovernorMeter {
  /**
   * Record usage after engine execution. Non-blocking.
   * Fires as async — never delays the response to client.
   */
  async record(entry: UsageLedgerEntry): Promise<void> {
    // 1. Write to engine_usage_ledger table
    const { error: ledgerError } = await supabaseAdmin
      .from('engine_usage_ledger')
      .insert({
        client_id: entry.clientId,
        engine_name: entry.engineName,
        operation: entry.operation,
        cost_usd: entry.costUSD,
        duration_ms: entry.durationMs,
        success: entry.success,
        correlation_id: entry.correlationId,
      });

    if (ledgerError) {
      console.error('[Governor Meter] Failed to write usage ledger:', ledgerError.message);
      return;
    }

    // 2. Update client's budget envelope (increment counters)
    await this.incrementEnvelope(entry);

    // 3. Emit usage recorded event (for dashboards)
    const bus = getEventBus();
    await bus.emit(
      GOVERNOR_EVENTS.USAGE_RECORDED,
      {
        clientId: entry.clientId,
        engineName: entry.engineName,
        operation: entry.operation,
        costUSD: entry.costUSD,
      },
      'engine-governor' as import('../types').EngineName
    );
  }

  // ─── Private Helpers ───────────────────────────────────────

  /**
   * Increment the budget envelope counters for the engine.
   * Also checks if any alert thresholds are crossed.
   */
  private async incrementEnvelope(entry: UsageLedgerEntry): Promise<void> {
    const now = new Date().toISOString();

    // Fetch current envelope
    const { data: envelope } = await supabaseAdmin
      .from('engine_budget_envelopes')
      .select('id, engine_allowances, total_spent_usd, global_cost_cap_usd, alert_warn_percent, alert_throttle_percent')
      .eq('client_id', entry.clientId)
      .eq('archived', false)
      .lte('period_start', now)
      .gte('period_end', now)
      .limit(1)
      .maybeSingle();

    if (!envelope) {
      console.warn('[Governor Meter] No active envelope for client', entry.clientId);
      return;
    }

    // Update engine-specific allowance counters
    const allowances = (envelope.engine_allowances || {}) as Record<string, {
      usedOperations: number;
      usedCostUSD: number;
      maxOperations: number;
      maxCostUSD: number;
      utilizationPercent: number;
    }>;

    const engineAllowance = allowances[entry.engineName];
    if (engineAllowance) {
      engineAllowance.usedOperations = (engineAllowance.usedOperations || 0) + 1;
      engineAllowance.usedCostUSD = (engineAllowance.usedCostUSD || 0) + entry.costUSD;
      // Recalculate utilization
      if (engineAllowance.maxOperations > 0) {
        engineAllowance.utilizationPercent =
          (engineAllowance.usedOperations / engineAllowance.maxOperations) * 100;
      }
    }

    const newTotalSpent = Number(envelope.total_spent_usd || 0) + entry.costUSD;

    // Write updated envelope
    await supabaseAdmin
      .from('engine_budget_envelopes')
      .update({
        engine_allowances: allowances,
        total_spent_usd: newTotalSpent,
        updated_at: now,
      })
      .eq('id', envelope.id);

    // 4. Check if any alert thresholds crossed
    await this.checkAlertThresholds(entry, envelope, newTotalSpent, engineAllowance);
  }

  /**
   * Check if usage has crossed any alert thresholds and emit events.
   */
  private async checkAlertThresholds(
    entry: UsageLedgerEntry,
    envelope: Record<string, unknown>,
    newTotalSpent: number,
    engineAllowance?: { usedOperations: number; maxOperations: number; utilizationPercent: number }
  ): Promise<void> {
    const bus = getEventBus();
    const source = 'engine-governor' as import('../types').EngineName;
    const warnAt = Number(envelope.alert_warn_percent) || 80;
    const throttleAt = Number(envelope.alert_throttle_percent) || 95;
    const globalCap = Number(envelope.global_cost_cap_usd) || 0;

    // Engine-level threshold checks
    if (engineAllowance && engineAllowance.maxOperations > 0) {
      const pct = engineAllowance.utilizationPercent;

      if (pct >= throttleAt) {
        await bus.emit(GOVERNOR_EVENTS.BUDGET_THROTTLE, {
          clientId: entry.clientId,
          engineName: entry.engineName,
          utilizationPercent: pct,
        }, source);
      } else if (pct >= warnAt) {
        await bus.emit(GOVERNOR_EVENTS.BUDGET_WARN, {
          clientId: entry.clientId,
          engineName: entry.engineName,
          utilizationPercent: pct,
        }, source);
      }
    }

    // Global cost cap check
    if (globalCap > 0) {
      const globalPct = (newTotalSpent / globalCap) * 100;
      if (globalPct >= 100) {
        await bus.emit(GOVERNOR_EVENTS.BUDGET_BLOCKED, {
          clientId: entry.clientId,
          totalSpentUSD: newTotalSpent,
          globalCapUSD: globalCap,
        }, source);
      } else if (globalPct >= warnAt) {
        await bus.emit(GOVERNOR_EVENTS.BUDGET_WARN, {
          clientId: entry.clientId,
          totalSpentUSD: newTotalSpent,
          globalCapUSD: globalCap,
          isGlobal: true,
        }, source);
      }
    }
  }
}
