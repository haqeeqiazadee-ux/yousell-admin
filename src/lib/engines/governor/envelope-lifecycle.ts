/**
 * YOUSELL Engine Governor — Budget Envelope Lifecycle
 *
 * Shared logic for creating, updating, archiving, and resetting
 * Client Budget Envelopes. Called by payment webhooks (Stripe, Square).
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 3.3
 */

import { createClient } from '@supabase/supabase-js';
import type { PlanId } from './types';
import { buildEngineAllowances, getPlanGlobalCostCap, getPlanContentCredits } from './plan-allowances';

/** Service-role client for server-side envelope operations */
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

/**
 * Create a new budget envelope for a client when they subscribe.
 * Archives any existing envelope for the same client.
 */
export async function createBudgetEnvelope(
  clientId: string,
  plan: PlanId,
  periodStart: Date,
  periodEnd: Date
): Promise<{ success: boolean; envelopeId?: string; error?: string }> {
  const supabase = getServiceClient();

  try {
    // Archive any existing active envelopes
    await supabase
      .from('engine_budget_envelopes')
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('archived', false);

    // Build fresh allowances from plan template
    const engineAllowances = buildEngineAllowances(plan);
    const globalCostCap = getPlanGlobalCostCap(plan);
    const contentCredits = getPlanContentCredits(plan);

    const { data, error } = await supabase
      .from('engine_budget_envelopes')
      .insert({
        client_id: clientId,
        plan_tier: plan,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        global_cost_cap_usd: globalCostCap,
        total_spent_usd: 0,
        engine_allowances: engineAllowances,
        alert_warn_percent: 80,
        alert_throttle_percent: 95,
        alert_block_percent: 100,
        archived: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Governor Envelope] Failed to create envelope:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Governor Envelope] Created envelope for client ${clientId}, plan: ${plan}, credits: ${contentCredits}`);
    return { success: true, envelopeId: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Governor Envelope] Error creating envelope:', message);
    return { success: false, error: message };
  }
}

/**
 * Update envelope when a client upgrades or downgrades mid-period.
 * Preserves existing usage, expands/contracts engine access.
 */
export async function updateBudgetEnvelope(
  clientId: string,
  newPlan: PlanId
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();

  try {
    const now = new Date().toISOString();

    // Get current active envelope
    const { data: envelope } = await supabase
      .from('engine_budget_envelopes')
      .select('id, engine_allowances, total_spent_usd')
      .eq('client_id', clientId)
      .eq('archived', false)
      .limit(1)
      .maybeSingle();

    if (!envelope) {
      console.warn('[Governor Envelope] No active envelope for client', clientId);
      return { success: false, error: 'No active envelope found' };
    }

    // Build new allowances, preserving usage from current period
    const newAllowances = buildEngineAllowances(newPlan);
    const oldAllowances = (envelope.engine_allowances || {}) as Record<string, {
      usedOperations?: number;
      usedCostUSD?: number;
    }>;

    // Carry over existing usage into new allowances
    for (const [engineName, newAllowance] of Object.entries(newAllowances)) {
      const old = oldAllowances[engineName];
      if (old && newAllowance) {
        newAllowance.usedOperations = old.usedOperations || 0;
        newAllowance.usedCostUSD = old.usedCostUSD || 0;
        if (newAllowance.maxOperations > 0) {
          newAllowance.utilizationPercent =
            (newAllowance.usedOperations / newAllowance.maxOperations) * 100;
        }
      }
    }

    const newGlobalCap = getPlanGlobalCostCap(newPlan);

    const { error } = await supabase
      .from('engine_budget_envelopes')
      .update({
        plan_tier: newPlan,
        global_cost_cap_usd: newGlobalCap,
        engine_allowances: newAllowances,
        updated_at: now,
      })
      .eq('id', envelope.id);

    if (error) {
      console.error('[Governor Envelope] Failed to update envelope:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Governor Envelope] Updated envelope for client ${clientId} to plan: ${newPlan}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Governor Envelope] Error updating envelope:', message);
    return { success: false, error: message };
  }
}

/**
 * Archive envelope when a subscription is cancelled.
 */
export async function archiveBudgetEnvelope(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from('engine_budget_envelopes')
    .update({ archived: true, updated_at: new Date().toISOString() })
    .eq('client_id', clientId)
    .eq('archived', false);

  if (error) {
    console.error('[Governor Envelope] Failed to archive envelope:', error.message);
    return { success: false, error: error.message };
  }

  console.log(`[Governor Envelope] Archived envelope for client ${clientId}`);
  return { success: true };
}

/**
 * Reset envelope for a new billing period (renewal).
 * Archives old envelope and creates fresh one.
 */
export async function renewBudgetEnvelope(
  clientId: string,
  plan: PlanId,
  periodStart: Date,
  periodEnd: Date
): Promise<{ success: boolean; envelopeId?: string; error?: string }> {
  // createBudgetEnvelope already archives existing envelopes
  return createBudgetEnvelope(clientId, plan, periodStart, periodEnd);
}
