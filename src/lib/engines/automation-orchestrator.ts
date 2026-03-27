/**
 * Automation Orchestrator Engine (V9 Engine 15)
 *
 * The brain of auto-pilot mode. Listens to engine events and executes
 * automated workflows based on per-client automation level settings.
 *
 * Level 1 (Manual): Log only — admin triggers everything
 * Level 2 (Assisted): Queue action for approval, notify admin
 * Level 3 (Auto-Pilot): Execute immediately within guardrails
 *
 * Respects hard guardrails (spend caps, volume limits, error thresholds)
 * and soft limits (categories, price ranges, quiet hours, minimum scores).
 *
 * @engine automation-orchestrator
 */

import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';
import {
  type AutomationFeature,
  type PerFeatureAutomation,
  type AutomationGuardrails,
  type AutomationSoftLimits,
  DEFAULT_AUTOMATION,
  DEFAULT_GUARDRAILS,
  DEFAULT_SOFT_LIMITS,
  checkAutomationPermission,
  isGuardrailExceeded,
} from '../automation/config';

/** Queued automation action awaiting approval (Level 2) */
export interface PendingAction {
  id?: string;
  client_id: string;
  feature: AutomationFeature;
  action_type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'executed';
  created_at: string;
  expires_at: string;
  executed_at?: string;
  result?: Record<string, unknown>;
}

/** Daily usage counters per client */
interface DailyUsage {
  dailySpend: number;
  contentToday: number;
  uploadsToday: number;
  outreachToday: number;
  consecutiveErrors: number;
}

/** Maps engine events to automation features and action handlers */
const EVENT_TO_FEATURE: Record<string, {
  feature: AutomationFeature;
  actionType: string;
  describe: (payload: Record<string, unknown>) => string;
}> = {
  [ENGINE_EVENTS.PRODUCT_DISCOVERED]: {
    feature: 'product_discovery',
    actionType: 'score_and_enrich',
    describe: (p) => `Score & enrich product ${p.productId || 'unknown'}`,
  },
  [ENGINE_EVENTS.PRODUCT_SCORED]: {
    feature: 'product_upload',
    actionType: 'auto_push_to_store',
    describe: (p) => `Push product ${p.productId} (score: ${p.finalScore}) to store`,
  },
  [ENGINE_EVENTS.CONTENT_GENERATED]: {
    feature: 'content_publishing',
    actionType: 'auto_publish_content',
    describe: (p) => `Publish content for product ${p.productId}`,
  },
  [ENGINE_EVENTS.BLUEPRINT_APPROVED]: {
    feature: 'product_upload',
    actionType: 'auto_deploy_blueprint',
    describe: (p) => `Deploy blueprint for product ${p.productId}`,
  },
  [ENGINE_EVENTS.CREATOR_MATCHED]: {
    feature: 'influencer_outreach',
    actionType: 'auto_outreach',
    describe: (p) => `Send outreach to creator ${p.creatorId || 'unknown'} for product ${p.productId}`,
  },
};

export class AutomationOrchestratorEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'automation-orchestrator',
    version: '1.0.0',
    dependencies: [],
    queues: ['automation-orchestrator', 'automation-approval'],
    publishes: [
      'automation.action_queued',
      'automation.action_executed',
      'automation.action_blocked',
      'automation.guardrail_hit',
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_DISCOVERED,
      ENGINE_EVENTS.PRODUCT_SCORED,
      ENGINE_EVENTS.CONTENT_GENERATED,
      ENGINE_EVENTS.BLUEPRINT_APPROVED,
      ENGINE_EVENTS.CREATOR_MATCHED,
    ],
  };

  setDbClient(client: SupabaseMinimalClient): void {
    this._dbClient = client;
  }

  private getDb(): SupabaseMinimalClient {
    if (this._dbClient) return this._dbClient;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabaseAdmin } = require('../supabase');
    return supabaseAdmin;
  }

  status(): EngineStatus {
    return this._status;
  }

  async init(): Promise<void> {
    this._status = 'idle';
  }

  async start(): Promise<void> {
    this._status = 'running';

    // Subscribe to all automatable events
    const bus = getEventBus();
    for (const eventType of this.config.subscribes) {
      bus.subscribe(eventType, (event) => {
        this.handleEvent(event);
      });
    }

    console.log('[AutomationOrchestrator] Started — listening to', this.config.subscribes.length, 'event types');
  }

  async stop(): Promise<void> {
    this._status = 'stopped';
  }

  async handleEvent(event: EngineEvent): Promise<void> {
    const mapping = EVENT_TO_FEATURE[event.type];
    if (!mapping) return;

    const payload = event.payload as Record<string, unknown>;
    const clientId = (payload.clientId as string) || '';

    // If no client context, this is an admin-level event — skip automation
    if (!clientId) {
      console.log(`[AutomationOrchestrator] Event ${event.type} has no clientId — skipping automation`);
      return;
    }

    try {
      // Load client's automation settings
      const settings = await this.getClientSettings(clientId);
      const permission = checkAutomationPermission(mapping.feature, settings.automation);

      if (permission === 'manual_only') {
        console.log(`[AutomationOrchestrator] ${mapping.actionType} for client ${clientId}: MANUAL — skipped`);
        return;
      }

      // Check guardrails
      const usage = await this.getDailyUsage(clientId);
      const guardrailCheck = isGuardrailExceeded(settings.guardrails, usage);

      if (guardrailCheck.exceeded) {
        console.warn(`[AutomationOrchestrator] Guardrail hit for client ${clientId}:`, guardrailCheck.reasons);
        const bus = getEventBus();
        await bus.emit(
          'automation.guardrail_hit',
          { clientId, feature: mapping.feature, reasons: guardrailCheck.reasons },
          'automation-orchestrator',
        );
        await this.createNotification(clientId, 'guardrail_hit',
          `Automation paused: ${guardrailCheck.reasons.join(', ')}`);
        return;
      }

      // Check soft limits
      const softCheck = this.checkSoftLimits(settings.softLimits, payload);
      if (!softCheck.allowed) {
        console.log(`[AutomationOrchestrator] Soft limit blocked: ${softCheck.reason}`);
        return;
      }

      if (permission === 'needs_approval') {
        // Level 2: Queue for approval
        await this.queueForApproval(clientId, mapping.feature, mapping.actionType, payload);
        console.log(`[AutomationOrchestrator] ${mapping.actionType} queued for approval (Level 2)`);
      } else if (permission === 'proceed') {
        // Level 3: Execute immediately
        await this.executeAction(clientId, mapping.feature, mapping.actionType, payload);
        console.log(`[AutomationOrchestrator] ${mapping.actionType} auto-executed (Level 3)`);
      }
    } catch (err) {
      console.error(`[AutomationOrchestrator] Error handling ${event.type}:`, err);
      await this.incrementErrorCount(clientId);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  // ─── Client Settings ───────────────────────────────────────

  /**
   * Load automation settings for a client from DB.
   * Falls back to defaults if not configured.
   */
  async getClientSettings(clientId: string): Promise<{
    automation: PerFeatureAutomation;
    guardrails: AutomationGuardrails;
    softLimits: AutomationSoftLimits;
  }> {
    const db = this.getDb();

    const { data } = await db
      .from('client_automation_settings')
      .select('automation_levels, guardrails, soft_limits')
      .eq('client_id', clientId)
      .single();

    if (!data) {
      return {
        automation: { ...DEFAULT_AUTOMATION },
        guardrails: { ...DEFAULT_GUARDRAILS },
        softLimits: { ...DEFAULT_SOFT_LIMITS },
      };
    }

    return {
      automation: { ...DEFAULT_AUTOMATION, ...(data.automation_levels as Partial<PerFeatureAutomation>) },
      guardrails: { ...DEFAULT_GUARDRAILS, ...(data.guardrails as Partial<AutomationGuardrails>) },
      softLimits: { ...DEFAULT_SOFT_LIMITS, ...(data.soft_limits as Partial<AutomationSoftLimits>) },
    };
  }

  /**
   * Update automation settings for a client.
   */
  async updateClientSettings(
    clientId: string,
    updates: {
      automation?: Partial<PerFeatureAutomation>;
      guardrails?: Partial<AutomationGuardrails>;
      softLimits?: Partial<AutomationSoftLimits>;
    },
  ): Promise<void> {
    const db = this.getDb();
    const current = await this.getClientSettings(clientId);

    await db
      .from('client_automation_settings')
      .upsert({
        client_id: clientId,
        automation_levels: { ...current.automation, ...updates.automation },
        guardrails: { ...current.guardrails, ...updates.guardrails },
        soft_limits: { ...current.softLimits, ...updates.softLimits },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'client_id' });
  }

  // ─── Daily Usage Tracking ──────────────────────────────────

  private async getDailyUsage(clientId: string): Promise<DailyUsage> {
    const db = this.getDb();
    const today = new Date().toISOString().slice(0, 10);

    const { data } = await db
      .from('automation_daily_usage')
      .select('*')
      .eq('client_id', clientId)
      .eq('date', today)
      .single();

    if (!data) {
      return { dailySpend: 0, contentToday: 0, uploadsToday: 0, outreachToday: 0, consecutiveErrors: 0 };
    }

    return {
      dailySpend: data.daily_spend || 0,
      contentToday: data.content_count || 0,
      uploadsToday: data.upload_count || 0,
      outreachToday: data.outreach_count || 0,
      consecutiveErrors: data.consecutive_errors || 0,
    };
  }

  private async incrementUsage(clientId: string, field: 'content_count' | 'upload_count' | 'outreach_count' | 'daily_spend', amount: number = 1): Promise<void> {
    const db = this.getDb();
    const today = new Date().toISOString().slice(0, 10);

    // Upsert with increment
    const { data: existing } = await db
      .from('automation_daily_usage')
      .select('id, ' + field)
      .eq('client_id', clientId)
      .eq('date', today)
      .single();

    if (existing) {
      await db
        .from('automation_daily_usage')
        .update({ [field]: (existing[field] || 0) + amount })
        .eq('id', existing.id);
    } else {
      await db
        .from('automation_daily_usage')
        .insert({
          client_id: clientId,
          date: today,
          [field]: amount,
        });
    }
  }

  private async incrementErrorCount(clientId: string): Promise<void> {
    const db = this.getDb();
    const today = new Date().toISOString().slice(0, 10);

    const { data: existing } = await db
      .from('automation_daily_usage')
      .select('id, consecutive_errors')
      .eq('client_id', clientId)
      .eq('date', today)
      .single();

    if (existing) {
      await db
        .from('automation_daily_usage')
        .update({ consecutive_errors: (existing.consecutive_errors || 0) + 1 })
        .eq('id', existing.id);
    } else {
      await db
        .from('automation_daily_usage')
        .insert({ client_id: clientId, date: today, consecutive_errors: 1 });
    }
  }

  // ─── Soft Limits ───────────────────────────────────────────

  private checkSoftLimits(
    limits: AutomationSoftLimits,
    payload: Record<string, unknown>,
  ): { allowed: boolean; reason?: string } {
    // Check minimum score
    const score = payload.finalScore as number | undefined;
    if (score != null && score < limits.minimumScore) {
      return { allowed: false, reason: `Score ${score} below minimum ${limits.minimumScore}` };
    }

    // Check price range
    const price = payload.price as number | undefined;
    if (price != null && (price < limits.priceRange.min || price > limits.priceRange.max)) {
      return { allowed: false, reason: `Price $${price} outside range $${limits.priceRange.min}-$${limits.priceRange.max}` };
    }

    // Check quiet hours
    if (limits.quietHoursStart && limits.quietHoursEnd) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentTime >= limits.quietHoursStart && currentTime <= limits.quietHoursEnd) {
        return { allowed: false, reason: `Quiet hours (${limits.quietHoursStart}-${limits.quietHoursEnd})` };
      }
    }

    // Check allowed categories
    const category = payload.category as string | undefined;
    if (limits.allowedCategories.length > 0 && category && !limits.allowedCategories.includes(category)) {
      return { allowed: false, reason: `Category "${category}" not in allowed list` };
    }

    return { allowed: true };
  }

  // ─── Action Execution ──────────────────────────────────────

  /**
   * Queue an action for admin/client approval (Level 2).
   * Creates a pending_actions record with a 4-hour expiry window.
   */
  private async queueForApproval(
    clientId: string,
    feature: AutomationFeature,
    actionType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const db = this.getDb();
    const bus = getEventBus();

    const settings = await this.getClientSettings(clientId);
    const expiresAt = new Date(
      Date.now() + settings.softLimits.contentApprovalWindowHours * 60 * 60 * 1000,
    ).toISOString();

    await db
      .from('automation_pending_actions')
      .insert({
        client_id: clientId,
        feature,
        action_type: actionType,
        payload,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      });

    await bus.emit(
      'automation.action_queued',
      { clientId, feature, actionType, expiresAt },
      'automation-orchestrator',
    );

    // Create notification for admin
    await this.createNotification(clientId, 'approval_needed',
      `Action "${actionType}" queued for approval. Expires at ${expiresAt}.`);
  }

  /**
   * Execute an automated action immediately (Level 3).
   * Routes to the appropriate backend queue based on action type.
   */
  private async executeAction(
    clientId: string,
    feature: AutomationFeature,
    actionType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const bus = getEventBus();
    const backendUrl = process.env.RAILWAY_BACKEND_URL || process.env.BACKEND_URL || '';
    const backendSecret = process.env.RAILWAY_API_SECRET || '';

    let endpoint = '';
    let usageField: 'content_count' | 'upload_count' | 'outreach_count' | 'daily_spend' = 'daily_spend';

    switch (actionType) {
      case 'auto_push_to_store':
        endpoint = '/api/shopify/push';
        usageField = 'upload_count';
        break;
      case 'auto_publish_content':
        endpoint = '/api/content/distribute';
        usageField = 'content_count';
        break;
      case 'auto_outreach':
        endpoint = '/api/influencers/outreach';
        usageField = 'outreach_count';
        break;
      case 'auto_deploy_blueprint':
        endpoint = '/api/shopify/push';
        usageField = 'upload_count';
        break;
      case 'score_and_enrich':
        endpoint = '/api/scan';
        usageField = 'daily_spend';
        break;
      default:
        console.warn(`[AutomationOrchestrator] Unknown action type: ${actionType}`);
        return;
    }

    if (backendUrl && endpoint) {
      try {
        const response = await fetch(`${backendUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(backendSecret ? { Authorization: `Bearer ${backendSecret}` } : {}),
          },
          body: JSON.stringify({
            ...payload,
            client_id: clientId,
            automated: true,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        // Increment usage counter
        await this.incrementUsage(clientId, usageField);

        // Log the automated action
        await this.logAction(clientId, feature, actionType, 'executed', payload);

        await bus.emit(
          'automation.action_executed',
          { clientId, feature, actionType, automated: true },
          'automation-orchestrator',
        );
      } catch (err) {
        console.error(`[AutomationOrchestrator] Auto-execute failed:`, err);
        await this.incrementErrorCount(clientId);
        await this.logAction(clientId, feature, actionType, 'failed', payload,
          err instanceof Error ? err.message : 'Unknown error');
      }
    }
  }

  /**
   * Approve a pending action (called by admin).
   * Executes the action and updates the record.
   */
  async approveAction(actionId: string): Promise<{ executed: boolean; error?: string }> {
    const db = this.getDb();

    const { data: action } = await db
      .from('automation_pending_actions')
      .select('*')
      .eq('id', actionId)
      .eq('status', 'pending')
      .single();

    if (!action) {
      return { executed: false, error: 'Action not found or already processed' };
    }

    // Check if expired
    if (new Date(action.expires_at) < new Date()) {
      await db
        .from('automation_pending_actions')
        .update({ status: 'expired' })
        .eq('id', actionId);
      return { executed: false, error: 'Action expired' };
    }

    // Execute the action
    await this.executeAction(
      action.client_id,
      action.feature,
      action.action_type,
      action.payload,
    );

    await db
      .from('automation_pending_actions')
      .update({ status: 'executed', executed_at: new Date().toISOString() })
      .eq('id', actionId);

    return { executed: true };
  }

  /**
   * Reject a pending action.
   */
  async rejectAction(actionId: string): Promise<void> {
    const db = this.getDb();
    await db
      .from('automation_pending_actions')
      .update({ status: 'rejected' })
      .eq('id', actionId);
  }

  /**
   * Get pending actions for a client (for the approval queue UI).
   */
  async getPendingActions(clientId: string): Promise<PendingAction[]> {
    const db = this.getDb();
    const { data } = await db
      .from('automation_pending_actions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    return data || [];
  }

  // ─── Logging & Notifications ───────────────────────────────

  private async logAction(
    clientId: string,
    feature: AutomationFeature,
    actionType: string,
    status: 'executed' | 'failed' | 'blocked',
    payload: Record<string, unknown>,
    error?: string,
  ): Promise<void> {
    const db = this.getDb();
    await db
      .from('automation_action_log')
      .insert({
        client_id: clientId,
        feature,
        action_type: actionType,
        status,
        payload,
        error_message: error || null,
        created_at: new Date().toISOString(),
      });
  }

  private async createNotification(
    clientId: string,
    subtype: string,
    message: string,
  ): Promise<void> {
    const db = this.getDb();
    await db
      .from('notifications')
      .insert({
        type: 'automation',
        subtype,
        recipient: clientId,
        message,
        status: 'unread',
        created_at: new Date().toISOString(),
      });
  }

  /**
   * Generate weekly digest of all automated actions for a client.
   * Called by a cron job every Monday.
   */
  async generateWeeklyDigest(clientId: string): Promise<{
    actionsExecuted: number;
    actionsFailed: number;
    actionsApproved: number;
    actionsRejected: number;
    totalSpend: number;
    summary: string;
  }> {
    const db = this.getDb();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: actions } = await db
      .from('automation_action_log')
      .select('status, feature, action_type')
      .eq('client_id', clientId)
      .gte('created_at', weekAgo);

    const allActions = actions || [];
    const executed = allActions.filter((a: { status: string }) => a.status === 'executed').length;
    const failed = allActions.filter((a: { status: string }) => a.status === 'failed').length;

    const { data: pending } = await db
      .from('automation_pending_actions')
      .select('status')
      .eq('client_id', clientId)
      .gte('created_at', weekAgo);

    const allPending = pending || [];
    const approved = allPending.filter((a: { status: string }) => a.status === 'executed').length;
    const rejected = allPending.filter((a: { status: string }) => a.status === 'rejected').length;

    // Calculate spend from daily usage
    const { data: usage } = await db
      .from('automation_daily_usage')
      .select('daily_spend')
      .eq('client_id', clientId)
      .gte('date', weekAgo.slice(0, 10));

    const totalSpend = (usage || []).reduce(
      (sum: number, u: { daily_spend: number }) => sum + (u.daily_spend || 0), 0,
    );

    const summary = [
      `Weekly Automation Digest:`,
      `- ${executed} actions auto-executed`,
      `- ${approved} actions approved by admin`,
      `- ${rejected} actions rejected`,
      `- ${failed} actions failed`,
      `- $${totalSpend.toFixed(2)} total API spend`,
    ].join('\n');

    return { actionsExecuted: executed, actionsFailed: failed, actionsApproved: approved, actionsRejected: rejected, totalSpend, summary };
  }
}
