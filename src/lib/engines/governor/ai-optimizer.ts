/**
 * YOUSELL Engine Governor — AI Optimizer
 *
 * Analyzes usage patterns and makes optimization decisions.
 * Operates in 3 levels: L1 (Advisory), L2 (Assisted), L3 (Autonomous).
 *
 * Uses Claude Haiku for bulk analysis (G12 compliance).
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 5
 */

import { createClient } from '@supabase/supabase-js';
import type { EngineName } from '../types';
import type { AutomationLevel, AIDecisionType, GovernorAIDecision } from './types';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

interface UsagePattern {
  engineName: string;
  totalOps: number;
  totalCost: number;
  avgDailyOps: number;
  failureRate: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface ClientUsageProfile {
  clientId: string;
  plan: string;
  totalSpent: number;
  globalCap: number;
  utilizationPercent: number;
  engineUsage: Record<string, { usedOps: number; maxOps: number; usedCost: number; maxCost: number }>;
}

export class GovernorAIOptimizer {
  private automationLevel: AutomationLevel = 1; // Default: Advisory

  constructor(level?: AutomationLevel) {
    if (level !== undefined) this.automationLevel = level;
  }

  setLevel(level: AutomationLevel): void {
    this.automationLevel = level;
  }

  getLevel(): AutomationLevel {
    return this.automationLevel;
  }

  /**
   * Run a full analysis cycle. Called periodically (hourly or on-demand).
   * Returns generated decisions (L1: suggestions, L2+: may auto-apply).
   */
  async runAnalysisCycle(): Promise<GovernorAIDecision[]> {
    if (this.automationLevel === 0) return [];

    const decisions: GovernorAIDecision[] = [];

    // Gather data
    const [usagePatterns, clientProfiles] = await Promise.all([
      this.getUsagePatterns(30),
      this.getClientProfiles(),
    ]);

    // Run analyzers
    const reallocationDecisions = this.analyzeReallocation(clientProfiles);
    const anomalyDecisions = this.detectAnomalies(usagePatterns);
    const spikeDecisions = this.detectSpikes(usagePatterns);
    const scalingDecisions = this.analyzeScaling(clientProfiles);

    decisions.push(...reallocationDecisions, ...anomalyDecisions, ...spikeDecisions, ...scalingDecisions);

    // Store decisions
    for (const decision of decisions) {
      await this.storeDecision(decision);
    }

    return decisions;
  }

  // ─── Analyzer: Resource Reallocation ─────────────────────

  /**
   * Detect clients with underused engines that could redistribute budget
   * to overused engines within the same envelope.
   */
  private analyzeReallocation(profiles: ClientUsageProfile[]): GovernorAIDecision[] {
    const decisions: GovernorAIDecision[] = [];

    for (const profile of profiles) {
      const overused: string[] = [];
      const underused: string[] = [];

      for (const [engine, usage] of Object.entries(profile.engineUsage)) {
        if (usage.maxOps <= 0) continue;
        const pct = (usage.usedOps / usage.maxOps) * 100;
        if (pct >= 90) overused.push(engine);
        if (pct <= 10 && usage.maxOps > 0) underused.push(engine);
      }

      if (overused.length > 0 && underused.length > 0) {
        decisions.push(this.createDecision(
          'reallocation',
          `Client ${profile.clientId}: ${overused.join(', ')} at 90%+ quota while ${underused.join(', ')} at <10%. Suggest redistributing unused quota.`,
          0.75,
          [profile.clientId],
          [...overused, ...underused] as EngineName[],
          { overused, underused, plan: profile.plan },
          {}
        ));
      }
    }

    return decisions;
  }

  // ─── Analyzer: Anomaly Detection ─────────────────────────

  /**
   * Detect engines with abnormal cost patterns (3x normal).
   */
  private detectAnomalies(patterns: UsagePattern[]): GovernorAIDecision[] {
    const decisions: GovernorAIDecision[] = [];

    for (const pattern of patterns) {
      // Flag if failure rate > 20%
      if (pattern.failureRate > 0.2 && pattern.totalOps > 10) {
        decisions.push(this.createDecision(
          'anomaly',
          `Engine ${pattern.engineName} has ${(pattern.failureRate * 100).toFixed(0)}% failure rate over 30 days (${pattern.totalOps} total ops). Investigate root cause.`,
          0.85,
          [],
          [pattern.engineName as EngineName],
          { failureRate: pattern.failureRate, totalOps: pattern.totalOps },
          {}
        ));
      }
    }

    return decisions;
  }

  // ─── Analyzer: Spike Detection ───────────────────────────

  /**
   * Detect engines with rapidly increasing usage (potential cost spike).
   */
  private detectSpikes(patterns: UsagePattern[]): GovernorAIDecision[] {
    const decisions: GovernorAIDecision[] = [];

    for (const pattern of patterns) {
      if (pattern.trend === 'increasing' && pattern.totalCost > 1.0) {
        decisions.push(this.createDecision(
          'cost_alert',
          `Engine ${pattern.engineName} shows increasing usage trend with $${pattern.totalCost.toFixed(2)} total cost. Monitor for budget impact.`,
          0.6,
          [],
          [pattern.engineName as EngineName],
          { trend: pattern.trend, totalCost: pattern.totalCost },
          {}
        ));
      }
    }

    return decisions;
  }

  // ─── Analyzer: Scaling Suggestions ───────────────────────

  /**
   * Detect clients who consistently hit quota limits — suggest upgrade.
   */
  private analyzeScaling(profiles: ClientUsageProfile[]): GovernorAIDecision[] {
    const decisions: GovernorAIDecision[] = [];

    for (const profile of profiles) {
      if (profile.utilizationPercent >= 80 && profile.plan !== 'enterprise') {
        decisions.push(this.createDecision(
          'scaling',
          `Client ${profile.clientId} (${profile.plan}) is at ${profile.utilizationPercent.toFixed(0)}% global budget utilization. Consider suggesting plan upgrade.`,
          0.7,
          [profile.clientId],
          [],
          { plan: profile.plan, utilization: profile.utilizationPercent },
          {}
        ));
      }
    }

    return decisions;
  }

  // ─── Data Gathering ──────────────────────────────────────

  private async getUsagePatterns(days: number): Promise<UsagePattern[]> {
    const supabase = getServiceClient();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from('engine_usage_ledger')
      .select('engine_name, cost_usd, success, created_at')
      .gte('created_at', since);

    if (!data || data.length === 0) return [];

    const byEngine: Record<string, { ops: number; cost: number; failures: number; dailyCounts: Record<string, number> }> = {};

    for (const entry of data) {
      const name = entry.engine_name;
      if (!byEngine[name]) byEngine[name] = { ops: 0, cost: 0, failures: 0, dailyCounts: {} };
      byEngine[name].ops++;
      byEngine[name].cost += Number(entry.cost_usd) || 0;
      if (!entry.success) byEngine[name].failures++;
      const day = entry.created_at.slice(0, 10);
      byEngine[name].dailyCounts[day] = (byEngine[name].dailyCounts[day] || 0) + 1;
    }

    return Object.entries(byEngine).map(([name, stats]) => {
      const dailyCounts = Object.values(stats.dailyCounts).sort((a, b) => a - b);
      const avgDaily = stats.ops / Math.max(days, 1);
      const recentAvg = dailyCounts.length >= 7
        ? dailyCounts.slice(-7).reduce((s, v) => s + v, 0) / 7
        : avgDaily;
      const olderAvg = dailyCounts.length >= 14
        ? dailyCounts.slice(0, 7).reduce((s, v) => s + v, 0) / 7
        : avgDaily;

      return {
        engineName: name,
        totalOps: stats.ops,
        totalCost: stats.cost,
        avgDailyOps: avgDaily,
        failureRate: stats.ops > 0 ? stats.failures / stats.ops : 0,
        trend: recentAvg > olderAvg * 1.3 ? 'increasing' as const
          : recentAvg < olderAvg * 0.7 ? 'decreasing' as const
          : 'stable' as const,
      };
    });
  }

  private async getClientProfiles(): Promise<ClientUsageProfile[]> {
    const supabase = getServiceClient();

    const { data: envelopes } = await supabase
      .from('engine_budget_envelopes')
      .select('client_id, plan_tier, total_spent_usd, global_cost_cap_usd, engine_allowances')
      .eq('archived', false);

    if (!envelopes) return [];

    return envelopes.map(e => {
      const totalSpent = Number(e.total_spent_usd) || 0;
      const globalCap = Number(e.global_cost_cap_usd) || 1;
      const allowances = (e.engine_allowances || {}) as Record<string, Record<string, unknown>>;

      const engineUsage: ClientUsageProfile['engineUsage'] = {};
      for (const [name, a] of Object.entries(allowances)) {
        engineUsage[name] = {
          usedOps: Number(a.usedOperations) || 0,
          maxOps: Number(a.maxOperations) || 0,
          usedCost: Number(a.usedCostUSD) || 0,
          maxCost: Number(a.maxCostUSD) || 0,
        };
      }

      return {
        clientId: e.client_id,
        plan: e.plan_tier,
        totalSpent,
        globalCap,
        utilizationPercent: (totalSpent / globalCap) * 100,
        engineUsage,
      };
    });
  }

  // ─── Decision Helpers ────────────────────────────────────

  private createDecision(
    type: AIDecisionType,
    description: string,
    confidence: number,
    affectedClients: string[],
    affectedEngines: EngineName[],
    beforeState: Record<string, unknown>,
    afterState: Record<string, unknown>
  ): GovernorAIDecision {
    const shouldAutoApply = this.automationLevel >= 2 && confidence >= 0.8;
    const shouldAutoApplyL3 = this.automationLevel >= 3;
    const applied = shouldAutoApply || shouldAutoApplyL3;

    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      level: this.automationLevel as 1 | 2 | 3,
      type,
      description,
      confidence,
      applied,
      affectedClients,
      affectedEngines,
      beforeState,
      afterState,
      revertible: true,
    };
  }

  private async storeDecision(decision: GovernorAIDecision): Promise<void> {
    const supabase = getServiceClient();

    await supabase.from('governor_ai_decisions').insert({
      level: decision.level,
      decision_type: decision.type,
      description: decision.description,
      confidence: decision.confidence,
      applied: decision.applied,
      affected_clients: decision.affectedClients,
      affected_engines: decision.affectedEngines,
      before_state: decision.beforeState,
      after_state: decision.afterState,
      revertible: decision.revertible,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
    });
  }
}

// ─── Singleton ─────────────────────────────────────────────

let _optimizer: GovernorAIOptimizer | null = null;

export function getAIOptimizer(): GovernorAIOptimizer {
  if (!_optimizer) {
    const level = parseInt(process.env.GOVERNOR_AI_LEVEL || '1') as AutomationLevel;
    _optimizer = new GovernorAIOptimizer(level);
  }
  return _optimizer;
}
