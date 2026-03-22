/**
 * Client Allocation System (V9 Engine 8)
 *
 * Assigns winning products to client accounts based on subscription tier,
 * channel access, exclusivity rules, and allocation limits.
 * Reads cluster data for diversification. Writes to client_products table.
 *
 * V9 Tasks: 8.001–8.038
 * Comm #: 3.006, 4.006, 8.001–8.010, 13.007–13.009
 * @engine client-allocation
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  ProductScoredPayload,
} from './types';
import { ENGINE_EVENTS } from './types';

/** Subscription tier limits */
const TIER_LIMITS: Record<string, {
  maxProducts: number;
  maxExclusive: number;
  minScore: number;
  channels: string[];
}> = {
  starter: { maxProducts: 5, maxExclusive: 0, minScore: 80, channels: ['shopify'] },
  growth: { maxProducts: 20, maxExclusive: 2, minScore: 60, channels: ['shopify', 'tiktok'] },
  professional: { maxProducts: 50, maxExclusive: 5, minScore: 40, channels: ['shopify', 'tiktok', 'amazon', 'etsy'] },
  enterprise: { maxProducts: -1, maxExclusive: -1, minScore: 0, channels: ['shopify', 'tiktok', 'amazon', 'etsy', 'pinterest'] },
};

/** Allocation record */
export interface AllocationRecord {
  id?: string;
  product_id: string;
  client_id: string;
  channel: string;
  tier: string;
  exclusive: boolean;
  allocated_at: string;
  expires_at?: string;
  status: 'active' | 'expired' | 'revoked';
}

export class ClientAllocationEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'client-allocation',
    version: '2.0.0',
    dependencies: [],
    queues: ['product-allocation'],
    publishes: [
      ENGINE_EVENTS.PRODUCT_ALLOCATED,
      ENGINE_EVENTS.ALLOCATION_BATCH_COMPLETE,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
      ENGINE_EVENTS.BLUEPRINT_APPROVED,
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
    if (event.type === ENGINE_EVENTS.PRODUCT_SCORED) {
      const payload = event.payload as ProductScoredPayload;
      if (payload.tier === 'HOT') {
        console.log(`[ClientAllocation] HOT product ${payload.productId} scored, allocation eligible for premium clients`);
      }
    }
    if (event.type === ENGINE_EVENTS.BLUEPRINT_APPROVED) {
      console.log(`[ClientAllocation] Blueprint approved, product ready for client allocation`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Allocate a product to a specific client.
   * Validates tier limits, exclusivity, channel access, and cluster diversification.
   * V9 Tasks: 8.005–8.025
   */
  async allocateProduct(
    productId: string,
    clientId: string,
    channel: string,
    tier: string,
  ): Promise<{ allocationId: string; exclusive: boolean; error?: string }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();
      const tierConfig = TIER_LIMITS[tier] || TIER_LIMITS.starter;

      // V9 Task 8.006: Check channel access
      if (!tierConfig.channels.includes(channel)) {
        return { allocationId: '', exclusive: false, error: `Channel "${channel}" not available on ${tier} tier` };
      }

      // V9 Task 8.007: Check product score meets tier minimum
      const { data: product } = await db
        .from('products')
        .select('final_score, title')
        .eq('id', productId)
        .single();

      if (product && product.final_score < tierConfig.minScore) {
        return { allocationId: '', exclusive: false, error: `Product score ${product.final_score} below tier minimum ${tierConfig.minScore}` };
      }

      // V9 Task 8.008: Check allocation limit
      const { data: existingAllocations } = await db
        .from('client_products')
        .select('id')
        .eq('client_id', clientId)
        .eq('status', 'active');

      const currentCount = existingAllocations?.length || 0;
      if (tierConfig.maxProducts > 0 && currentCount >= tierConfig.maxProducts) {
        return { allocationId: '', exclusive: false, error: `Client has reached allocation limit (${tierConfig.maxProducts}) for ${tier} tier` };
      }

      // V9 Task 8.009: Check exclusivity — product not already exclusively allocated
      const { data: exclusiveAlloc } = await db
        .from('client_products')
        .select('client_id')
        .eq('product_id', productId)
        .eq('exclusive', true)
        .eq('status', 'active')
        .single();

      if (exclusiveAlloc && exclusiveAlloc.client_id !== clientId) {
        return { allocationId: '', exclusive: false, error: 'Product is exclusively allocated to another client' };
      }

      // V9 Task 8.010: Check cluster diversification (Comm #4.006)
      // Avoid allocating products from the same cluster to the same client
      let shouldDiversify = false;
      try {
        const { data: productCluster } = await db
          .from('product_cluster_members')
          .select('cluster_id')
          .eq('product_id', productId)
          .single();

        if (productCluster) {
          const { data: clientClusterProducts } = await db
            .from('client_products')
            .select('product_id')
            .eq('client_id', clientId)
            .eq('status', 'active');

          if (clientClusterProducts && clientClusterProducts.length > 0) {
            const clientProductIds = clientClusterProducts.map((p: { product_id: string }) => p.product_id);
            const { data: sameCluster } = await db
              .from('product_cluster_members')
              .select('product_id')
              .eq('cluster_id', productCluster.cluster_id)
              .in('product_id', clientProductIds);

            if (sameCluster && sameCluster.length >= 3) {
              shouldDiversify = true;
            }
          }
        }
      } catch {
        // Non-critical — proceed without diversification check
      }

      // Determine exclusivity
      const exclusive = tier === 'enterprise' || tier === 'professional';
      const { data: exclusiveCount } = await db
        .from('client_products')
        .select('id')
        .eq('client_id', clientId)
        .eq('exclusive', true)
        .eq('status', 'active');

      const currentExclusive = exclusiveCount?.length || 0;
      const canExclusive = tierConfig.maxExclusive < 0 || currentExclusive < tierConfig.maxExclusive;
      const isExclusive = exclusive && canExclusive;

      // Insert allocation
      const allocationId = `alloc_${productId}_${clientId}_${Date.now()}`;
      await db
        .from('client_products')
        .insert({
          product_id: productId,
          client_id: clientId,
          channel,
          tier,
          exclusive: isExclusive,
          allocation_id: allocationId,
          status: 'active',
          allocated_at: new Date().toISOString(),
          diversification_warning: shouldDiversify,
        });

      await bus.emit(
        ENGINE_EVENTS.PRODUCT_ALLOCATED,
        {
          productId,
          clientId,
          tier,
          channel,
          allocationId,
          exclusive: isExclusive,
          diversificationWarning: shouldDiversify,
        },
        'client-allocation',
      );

      return { allocationId, exclusive: isExclusive };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Batch-allocate HOT products to eligible clients.
   * V9 Tasks: 8.026–8.035
   */
  async batchAllocate(
    productIds: string[],
    tier: string,
  ): Promise<{ allocated: number; skipped: number; errors: string[] }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();
      let allocated = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Get eligible clients for this tier
      const { data: clients } = await db
        .from('clients')
        .select('id, subscription_tier')
        .eq('subscription_tier', tier)
        .eq('status', 'active');

      if (!clients || clients.length === 0) {
        return { allocated: 0, skipped: productIds.length, errors: [`No active clients on ${tier} tier`] };
      }

      // Round-robin allocation across eligible clients
      let clientIndex = 0;
      for (const productId of productIds) {
        const client = clients[clientIndex % clients.length];
        const channel = TIER_LIMITS[tier]?.channels[0] || 'shopify';

        const result = await this.allocateProduct(productId, client.id, channel, tier);
        if (result.error) {
          skipped++;
          errors.push(`${productId}: ${result.error}`);
        } else {
          allocated++;
        }
        clientIndex++;
      }

      await bus.emit(
        ENGINE_EVENTS.ALLOCATION_BATCH_COMPLETE,
        { productCount: productIds.length, allocated, skipped, tier },
        'client-allocation',
      );

      return { allocated, skipped, errors };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Get client's allocated products.
   */
  async getClientProducts(
    clientId: string,
  ): Promise<AllocationRecord[]> {
    const db = this.getDb();
    const { data } = await db
      .from('client_products')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('allocated_at', { ascending: false });

    return data || [];
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
    in(column: string, values: unknown[]): unknown;
    order(column: string, options?: unknown): unknown;
    limit(count: number): unknown;
    single(): unknown;
    [key: string]: unknown;
  };
}
