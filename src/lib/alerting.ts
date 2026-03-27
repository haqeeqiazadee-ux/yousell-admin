/**
 * YOUSELL Alerting System
 *
 * Evaluates system metrics against configurable thresholds
 * and creates alerts stored in Supabase. Alerts are surfaced
 * via the monitoring dashboard and can trigger notifications.
 */

import { createAdminClient } from '@/lib/supabase/admin';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertCategory = 'error_spike' | 'budget_exhaustion' | 'engine_down' | 'latency_high' | 'queue_backup';

export interface Alert {
  id?: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  engine_name?: string;
  client_id?: string;
  metadata?: Record<string, unknown>;
  acknowledged: boolean;
  created_at?: string;
}

interface ThresholdConfig {
  errorRateWarning: number;    // % — triggers warning
  errorRateCritical: number;   // % — triggers critical
  latencyWarningMs: number;    // ms — triggers warning
  latencyCriticalMs: number;   // ms — triggers critical
  budgetWarnPct: number;       // % of cap — triggers warning
  budgetCriticalPct: number;   // % of cap — triggers critical
}

const DEFAULT_THRESHOLDS: ThresholdConfig = {
  errorRateWarning: 10,
  errorRateCritical: 50,
  latencyWarningMs: 5000,
  latencyCriticalMs: 15000,
  budgetWarnPct: 80,
  budgetCriticalPct: 95,
};

/**
 * Evaluate engine metrics and create alerts for any threshold breaches.
 * Called periodically by the monitoring system.
 */
export async function evaluateAlerts(thresholds = DEFAULT_THRESHOLDS): Promise<Alert[]> {
  const supabase = createAdminClient();
  const alerts: Alert[] = [];
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // 1. Check engine error rates
  const { data: usage } = await supabase
    .from('engine_usage_ledger')
    .select('engine_name, success, latency_ms')
    .gte('created_at', oneDayAgo);

  const engineStats: Record<string, { ops: number; errors: number; totalLatency: number }> = {};
  for (const entry of (usage || [])) {
    const name = entry.engine_name;
    if (!engineStats[name]) engineStats[name] = { ops: 0, errors: 0, totalLatency: 0 };
    engineStats[name].ops++;
    if (!entry.success) engineStats[name].errors++;
    engineStats[name].totalLatency += (entry.latency_ms || 0);
  }

  for (const [engine, stats] of Object.entries(engineStats)) {
    const errorRate = (stats.errors / Math.max(stats.ops, 1)) * 100;
    const avgLatency = stats.totalLatency / Math.max(stats.ops, 1);

    // Error rate alerts
    if (errorRate >= thresholds.errorRateCritical) {
      alerts.push({
        category: 'engine_down',
        severity: 'critical',
        title: `Engine ${engine} is down`,
        message: `Error rate ${Math.round(errorRate)}% exceeds critical threshold (${thresholds.errorRateCritical}%). ${stats.errors}/${stats.ops} operations failed in 24h.`,
        engine_name: engine,
        acknowledged: false,
        metadata: { errorRate, ops: stats.ops, errors: stats.errors },
      });
    } else if (errorRate >= thresholds.errorRateWarning) {
      alerts.push({
        category: 'error_spike',
        severity: 'warning',
        title: `High error rate on ${engine}`,
        message: `Error rate ${Math.round(errorRate)}% exceeds warning threshold (${thresholds.errorRateWarning}%).`,
        engine_name: engine,
        acknowledged: false,
        metadata: { errorRate, ops: stats.ops, errors: stats.errors },
      });
    }

    // Latency alerts
    if (avgLatency >= thresholds.latencyCriticalMs) {
      alerts.push({
        category: 'latency_high',
        severity: 'critical',
        title: `Critical latency on ${engine}`,
        message: `Average latency ${Math.round(avgLatency)}ms exceeds critical threshold (${thresholds.latencyCriticalMs}ms).`,
        engine_name: engine,
        acknowledged: false,
        metadata: { avgLatencyMs: Math.round(avgLatency) },
      });
    } else if (avgLatency >= thresholds.latencyWarningMs) {
      alerts.push({
        category: 'latency_high',
        severity: 'warning',
        title: `High latency on ${engine}`,
        message: `Average latency ${Math.round(avgLatency)}ms exceeds warning threshold (${thresholds.latencyWarningMs}ms).`,
        engine_name: engine,
        acknowledged: false,
        metadata: { avgLatencyMs: Math.round(avgLatency) },
      });
    }
  }

  // 2. Check budget envelopes
  const { data: envelopes } = await supabase
    .from('engine_budget_envelopes')
    .select('client_id, global_cost_cap_usd, total_spent_usd')
    .eq('archived', false);

  for (const env of (envelopes || [])) {
    const pct = (env.total_spent_usd / Math.max(env.global_cost_cap_usd, 0.01)) * 100;
    if (pct >= thresholds.budgetCriticalPct) {
      alerts.push({
        category: 'budget_exhaustion',
        severity: 'critical',
        title: `Budget nearly exhausted`,
        message: `Client ${env.client_id.slice(0, 8)}... has used ${Math.round(pct)}% of their $${env.global_cost_cap_usd} budget.`,
        client_id: env.client_id,
        acknowledged: false,
        metadata: { spentPct: Math.round(pct), spentUsd: env.total_spent_usd, capUsd: env.global_cost_cap_usd },
      });
    } else if (pct >= thresholds.budgetWarnPct) {
      alerts.push({
        category: 'budget_exhaustion',
        severity: 'warning',
        title: `Budget warning`,
        message: `Client ${env.client_id.slice(0, 8)}... has used ${Math.round(pct)}% of their $${env.global_cost_cap_usd} budget.`,
        client_id: env.client_id,
        acknowledged: false,
        metadata: { spentPct: Math.round(pct), spentUsd: env.total_spent_usd, capUsd: env.global_cost_cap_usd },
      });
    }
  }

  // 3. Store new alerts (deduplicate by category + engine/client within 1 hour)
  if (alerts.length > 0) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('system_alerts')
      .select('category, engine_name, client_id')
      .gte('created_at', oneHourAgo);

    const existingKeys = new Set(
      (existing || []).map(e => `${e.category}:${e.engine_name || ''}:${e.client_id || ''}`)
    );

    const newAlerts = alerts.filter(a => {
      const key = `${a.category}:${a.engine_name || ''}:${a.client_id || ''}`;
      return !existingKeys.has(key);
    });

    if (newAlerts.length > 0) {
      await supabase.from('system_alerts').insert(newAlerts);
    }
  }

  return alerts;
}
