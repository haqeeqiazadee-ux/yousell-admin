/**
 * YOUSELL Engine Governor — BullMQ Job Wrapper
 *
 * Wraps job processor functions with Governor gate checks and usage metering.
 * Applied at worker registration time in jobs/index.ts.
 *
 * For jobs without a client context (admin-triggered, cron), the gate
 * is bypassed and only metering is applied.
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 4
 */

import { Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';

// Import types only — Governor modules are in the frontend src/
// BullMQ workers use a simplified gate check directly against the DB
type EngineName = string;
type PlanId = 'starter' | 'growth' | 'professional' | 'enterprise';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

interface GovernorJobOptions {
  /** Engine this job belongs to */
  engineName: EngineName;
  /** Operation name for cost lookup */
  operation: string;
  /** If true, skip gate check (for admin/cron jobs) */
  skipGate?: boolean;
}

/**
 * Wrap a BullMQ processor with Governor gate + meter.
 *
 * Usage in jobs/index.ts:
 * ```ts
 * new Worker('content-queue', withGovernorJob(processContentGeneration, {
 *   engineName: 'content-engine',
 *   operation: 'generate_caption',
 * }), opts);
 * ```
 */
export function withGovernorJob<T = unknown, R = unknown>(
  processor: (job: Job<T>) => Promise<R>,
  options: GovernorJobOptions
): (job: Job<T>) => Promise<R> {
  return async (job: Job<T>) => {
    const startTime = Date.now();
    const jobData = job.data as Record<string, unknown>;
    const clientId = (jobData.client_id || jobData.clientId) as string | undefined;

    // Gate check (only for client-scoped jobs)
    if (clientId && !options.skipGate) {
      const allowed = await checkJobGate(clientId, options.engineName);
      if (!allowed) {
        console.warn(
          `[Governor Job] Blocked ${options.engineName}.${options.operation} for client ${clientId} — quota/budget exceeded`
        );
        throw new Error(`Governor: access denied for ${options.engineName} — quota or budget exceeded`);
      }
    }

    // Execute the actual processor
    let result: R;
    let success = true;
    try {
      result = await processor(job);
    } catch (error) {
      success = false;
      throw error;
    } finally {
      // Meter usage (async, non-blocking)
      if (clientId) {
        const durationMs = Date.now() - startTime;
        recordJobUsage(clientId, options.engineName, options.operation, durationMs, success)
          .catch(err => console.error('[Governor Job] Metering error:', err));
      }
    }

    return result!;
  };
}

/**
 * Simplified gate check for BullMQ jobs.
 * Checks budget envelope directly without full Governor pipeline.
 */
async function checkJobGate(clientId: string, engineName: string): Promise<boolean> {
  try {
    const supabase = getServiceClient();
    const now = new Date().toISOString();

    const { data: envelope } = await supabase
      .from('engine_budget_envelopes')
      .select('engine_allowances, total_spent_usd, global_cost_cap_usd')
      .eq('client_id', clientId)
      .eq('archived', false)
      .lte('period_start', now)
      .gte('period_end', now)
      .limit(1)
      .maybeSingle();

    if (!envelope) return true; // No envelope = no restriction (pre-Governor clients)

    // Check global cost cap
    const totalSpent = Number(envelope.total_spent_usd) || 0;
    const globalCap = Number(envelope.global_cost_cap_usd) || 0;
    if (globalCap > 0 && totalSpent >= globalCap) return false;

    // Check engine-specific allowance
    const allowances = (envelope.engine_allowances || {}) as Record<string, {
      enabled?: boolean;
      maxOperations?: number;
      usedOperations?: number;
    }>;
    const engineAllowance = allowances[engineName];
    if (!engineAllowance) return true; // No allowance entry = not gated
    if (engineAllowance.enabled === false) return false;
    if (
      engineAllowance.maxOperations !== undefined &&
      engineAllowance.maxOperations !== -1 &&
      (engineAllowance.usedOperations || 0) >= engineAllowance.maxOperations
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Governor Job] Gate check error:', error);
    return true; // Fail-open for background jobs to avoid blocking the queue
  }
}

/**
 * Record job usage to the ledger.
 */
async function recordJobUsage(
  clientId: string,
  engineName: string,
  operation: string,
  durationMs: number,
  success: boolean
): Promise<void> {
  try {
    const supabase = getServiceClient();

    await supabase
      .from('engine_usage_ledger')
      .insert({
        client_id: clientId,
        engine_name: engineName,
        operation,
        cost_usd: 0, // Job-level cost lookup deferred to Phase 4 AI
        duration_ms: durationMs,
        success,
        correlation_id: `job_${Date.now()}`,
      });
  } catch (error) {
    console.error('[Governor Job] Usage recording error:', error);
  }
}
