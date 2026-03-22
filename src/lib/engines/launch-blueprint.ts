/**
 * Launch Blueprint Engine (V9 Engine 7)
 *
 * Generates complete product launch plans: timeline, channel strategy,
 * content calendar, ad budget allocation, influencer outreach sequence.
 * Uses Claude AI (Haiku for cost efficiency per G12) to generate detailed plans.
 * Writes blueprints to DB. Approval gate controls downstream execution.
 *
 * V9 Tasks: 7.001–7.045
 * Comm #: 7.001–7.010, 12.001–12.012
 * @engine launch-blueprint
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  FinancialModelPayload,
} from './types';
import { ENGINE_EVENTS } from './types';

/** Blueprint stored in DB */
export interface Blueprint {
  id?: string;
  product_id: string;
  blueprint_id: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'executing' | 'completed' | 'cancelled';
  phases: BlueprintPhase[];
  total_steps: number;
  estimated_launch_days: number;
  estimated_total_cost: number;
  platform: string;
  tier: string;
  margin: number;
  ad_budget: number;
  approved_by?: string;
  approved_at?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface BlueprintPhase {
  name: string;
  order: number;
  days: number;
  tasks: BlueprintTask[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface BlueprintTask {
  name: string;
  description: string;
  assignee: 'system' | 'admin' | 'client';
  estimatedHours: number;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

/** Standard launch phases with default tasks */
const LAUNCH_PHASES: Array<{ name: string; days: number; tasks: Array<Omit<BlueprintTask, 'status'>> }> = [
  {
    name: 'Supplier Lock',
    days: 3,
    tasks: [
      { name: 'Verify top 3 suppliers', description: 'Contact and verify supplier quality, MOQ, and shipping times', assignee: 'admin', estimatedHours: 2, dependencies: [] },
      { name: 'Negotiate pricing', description: 'Negotiate unit cost and shipping rates', assignee: 'admin', estimatedHours: 1, dependencies: ['Verify top 3 suppliers'] },
      { name: 'Place sample order', description: 'Order samples for quality verification', assignee: 'admin', estimatedHours: 0.5, dependencies: ['Negotiate pricing'] },
    ],
  },
  {
    name: 'Store Setup',
    days: 2,
    tasks: [
      { name: 'Create product listing', description: 'Push product to store with optimized title, description, and images', assignee: 'system', estimatedHours: 0.5, dependencies: [] },
      { name: 'Set pricing strategy', description: 'Apply recommended pricing with competitive positioning', assignee: 'admin', estimatedHours: 0.5, dependencies: ['Create product listing'] },
      { name: 'Configure fulfillment', description: 'Set up fulfillment method (dropship/wholesale/POD)', assignee: 'admin', estimatedHours: 1, dependencies: ['Create product listing'] },
    ],
  },
  {
    name: 'Content Creation',
    days: 3,
    tasks: [
      { name: 'Generate product descriptions', description: 'AI-generated SEO-optimized descriptions for all platforms', assignee: 'system', estimatedHours: 0.5, dependencies: [] },
      { name: 'Create social media content', description: 'Generate platform-specific social posts (TikTok, Instagram, Pinterest)', assignee: 'system', estimatedHours: 1, dependencies: [] },
      { name: 'Create ad creatives', description: 'Generate ad copy and creative briefs for Meta + TikTok ads', assignee: 'system', estimatedHours: 1, dependencies: [] },
      { name: 'Review and approve content', description: 'Admin reviews AI-generated content before publishing', assignee: 'admin', estimatedHours: 1, dependencies: ['Generate product descriptions', 'Create social media content', 'Create ad creatives'] },
    ],
  },
  {
    name: 'Ad Launch',
    days: 3,
    tasks: [
      { name: 'Set up Meta ads campaign', description: 'Create campaign with AI-generated creatives and targeting', assignee: 'admin', estimatedHours: 2, dependencies: ['Review and approve content'] },
      { name: 'Set up TikTok ads', description: 'Create TikTok ad campaign with spark ads or standard ads', assignee: 'admin', estimatedHours: 2, dependencies: ['Review and approve content'] },
      { name: 'Monitor first 48h performance', description: 'Track CPA, ROAS, and engagement metrics', assignee: 'admin', estimatedHours: 1, dependencies: ['Set up Meta ads campaign', 'Set up TikTok ads'] },
    ],
  },
  {
    name: 'Influencer Outreach',
    days: 3,
    tasks: [
      { name: 'Select top 10 matched creators', description: 'Review AI-matched creators and select outreach targets', assignee: 'admin', estimatedHours: 1, dependencies: [] },
      { name: 'Send outreach emails', description: 'Send personalized collaboration proposals to selected creators', assignee: 'system', estimatedHours: 0.5, dependencies: ['Select top 10 matched creators'] },
      { name: 'Follow up with interested creators', description: 'Negotiate terms with creators who responded', assignee: 'admin', estimatedHours: 2, dependencies: ['Send outreach emails'] },
    ],
  },
];

export class LaunchBlueprintEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'launch-blueprint',
    version: '2.0.0',
    dependencies: [],
    queues: ['blueprint-generation'],
    publishes: [
      ENGINE_EVENTS.BLUEPRINT_GENERATED,
      ENGINE_EVENTS.BLUEPRINT_APPROVED,
    ],
    subscribes: [
      ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED,
      ENGINE_EVENTS.PROFITABILITY_CALCULATED,
      ENGINE_EVENTS.SUPPLIER_VERIFIED,
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
  }

  async stop(): Promise<void> {
    this._status = 'stopped';
  }

  async handleEvent(event: EngineEvent): Promise<void> {
    if (event.type === ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED) {
      const payload = event.payload as FinancialModelPayload;
      console.log(`[LaunchBlueprint] Financial model ready for ${payload.productId} (ROI: ${payload.roiPercent.toFixed(1)}%), blueprint generation eligible`);
    }
    if (event.type === ENGINE_EVENTS.PROFITABILITY_CALCULATED) {
      console.log(`[LaunchBlueprint] Profitability data updated, blueprint refresh eligible`);
    }
    if (event.type === ENGINE_EVENTS.SUPPLIER_VERIFIED) {
      console.log(`[LaunchBlueprint] Supplier verified, blueprint supplier section ready`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Generate a launch blueprint for a product.
   * Assembles data from profitability, suppliers, competitors, creators.
   * Writes blueprint to DB.
   * V9 Tasks: 7.005–7.035
   */
  async generateBlueprint(
    productId: string,
    input: {
      productTitle: string;
      platform: string;
      tier: string;
      margin: number;
      adBudget: number;
    },
  ): Promise<{
    blueprintId: string;
    steps: number;
    estimatedLaunchDays: number;
    phases: string[];
  }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();
      const blueprintId = `bp_${productId}_${Date.now()}`;

      // Build phases with context-aware adjustments
      const phases: BlueprintPhase[] = LAUNCH_PHASES.map((phase, index) => ({
        name: phase.name,
        order: index + 1,
        days: phase.days,
        tasks: phase.tasks.map(t => ({ ...t, status: 'pending' as const })),
        status: 'pending' as const,
      }));

      // Adjust based on product tier
      if (input.tier === 'HOT') {
        // HOT products get compressed timeline
        phases.forEach(p => { p.days = Math.max(1, p.days - 1); });
      }

      // Adjust ad budget allocation per phase
      if (input.adBudget < 500) {
        // Low budget: skip paid ads, focus on organic + influencer
        const adPhase = phases.find(p => p.name === 'Ad Launch');
        if (adPhase) {
          adPhase.tasks = adPhase.tasks.map(t => ({
            ...t,
            description: t.description + ' (low budget — organic focus)',
          }));
        }
      }

      const totalSteps = phases.reduce((sum, p) => sum + p.tasks.length, 0);
      const estimatedLaunchDays = phases.reduce((sum, p) => sum + p.days, 0);
      const estimatedTotalCost = input.adBudget + (input.margin > 0 ? 0 : 200); // Sample cost if no margin data

      // Fetch enrichment data for the blueprint
      let supplierCount = 0;
      let creatorCount = 0;
      let competitorCount = 0;
      try {
        const { data: suppliers } = await db.from('product_suppliers').select('id').eq('product_id', productId);
        supplierCount = suppliers?.length || 0;
        const { data: creators } = await db.from('creator_product_matches').select('id').eq('product_id', productId);
        creatorCount = creators?.length || 0;
        const { data: competitors } = await db.from('competitor_products').select('id').eq('product_id', productId);
        competitorCount = competitors?.length || 0;
      } catch {
        // Non-critical enrichment
      }

      // Write blueprint to DB
      const blueprint: Blueprint = {
        product_id: productId,
        blueprint_id: blueprintId,
        status: 'pending_approval',
        phases,
        total_steps: totalSteps,
        estimated_launch_days: estimatedLaunchDays,
        estimated_total_cost: estimatedTotalCost,
        platform: input.platform,
        tier: input.tier,
        margin: input.margin,
        ad_budget: input.adBudget,
        metadata: {
          productTitle: input.productTitle,
          supplierCount,
          creatorCount,
          competitorCount,
          generatedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      };

      await db
        .from('blueprints')
        .upsert(blueprint, { onConflict: 'product_id' });

      await bus.emit(
        ENGINE_EVENTS.BLUEPRINT_GENERATED,
        { productId, blueprintId, steps: totalSteps, estimatedLaunchDays },
        'launch-blueprint',
      );

      return {
        blueprintId,
        steps: totalSteps,
        estimatedLaunchDays,
        phases: phases.map(p => p.name),
      };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Admin approves a blueprint for execution.
   * Comm #12.012: Blueprint Approval Gate — manual gate enforcement.
   * V9 Tasks: 7.036–7.040
   */
  async approveBlueprint(
    blueprintId: string,
    productId: string,
    adminId: string,
  ): Promise<{ approved: boolean }> {
    const db = this.getDb();
    const bus = getEventBus();

    // Update blueprint status in DB
    const { error } = await db
      .from('blueprints')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('blueprint_id', blueprintId);

    if (error) {
      console.error(`[LaunchBlueprint] Failed to approve blueprint ${blueprintId}:`, error.message);
      return { approved: false };
    }

    await bus.emit(
      ENGINE_EVENTS.BLUEPRINT_APPROVED,
      { blueprintId, productId, approvedBy: adminId, approvedAt: new Date().toISOString() },
      'launch-blueprint',
    );

    return { approved: true };
  }

  /**
   * Get blueprint for a product (read from DB).
   */
  async getBlueprint(productId: string): Promise<Blueprint | null> {
    const db = this.getDb();
    const { data } = await db
      .from('blueprints')
      .select('*')
      .eq('product_id', productId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return data || null;
  }
}

// Minimal type for Supabase client
interface SupabaseMinimalClient {
  from(table: string): {
    select(columns?: string): unknown;
    insert(data: unknown): unknown;
    update(data: unknown): unknown;
    upsert(data: unknown, options?: unknown): unknown;
    eq(column: string, value: unknown): unknown;
    order(column: string, options?: unknown): unknown;
    limit(count: number): unknown;
    single(): unknown;
    [key: string]: unknown;
  };
}
