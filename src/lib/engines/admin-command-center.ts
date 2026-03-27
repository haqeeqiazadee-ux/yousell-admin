/**
 * Admin Command Center Engine (V9 Engine 12)
 *
 * One-click product deployment to YOUSELL's own stores.
 * Best-selling products dashboard, batch operations, deploy pipeline.
 * Reads from all upstream engines for dashboard aggregation.
 * Triggers store integration for actual push.
 *
 * V9 Tasks: 12.001–12.032
 * Comm #: 4.004, 6.008, 8.008, 9.008, 11.008, 17.001–17.010
 * @engine admin-command-center
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  ProductScoredPayload, OrderPayload,
} from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

/** Deployment record */
export interface DeploymentRecord {
  id?: string;
  product_id: string;
  deployment_id: string;
  target_store: string;
  deployed_by: string;
  status: 'pending' | 'deploying' | 'live' | 'failed' | 'paused';
  push_status?: string;
  external_product_id?: string;
  deployed_at: string;
  metadata?: Record<string, unknown>;
}

/** Dashboard aggregation result */
export interface DashboardData {
  totalProducts: number;
  hotProducts: number;
  warmProducts: number;
  deployedProducts: number;
  totalRevenue: number;
  totalOrders: number;
  topProducts: Array<{
    productId: string;
    title: string;
    score: number;
    tier: string;
    revenue: number;
    orders: number;
  }>;
}

export class AdminCommandCenterEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'admin-command-center',
    version: '2.0.0',
    dependencies: [],
    queues: ['admin-deploy', 'admin-batch'],
    publishes: [
      ENGINE_EVENTS.ADMIN_PRODUCT_DEPLOYED,
      ENGINE_EVENTS.ADMIN_BATCH_DEPLOY_COMPLETE,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
      ENGINE_EVENTS.BLUEPRINT_GENERATED,
      ENGINE_EVENTS.ORDER_RECEIVED,
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
        console.log(`[AdminCommandCenter] HOT product ${payload.productId} (score: ${payload.finalScore}), deployment eligible`);
      }
    }
    if (event.type === ENGINE_EVENTS.ORDER_RECEIVED) {
      const payload = event.payload as OrderPayload;
      console.log(`[AdminCommandCenter] Order received: ${payload.orderId}, revenue: $${payload.revenue}`);
    }
    if (event.type === ENGINE_EVENTS.BLUEPRINT_GENERATED) {
      console.log(`[AdminCommandCenter] Blueprint generated, deployment ready`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Deploy a product to YOUSELL's own store.
   * Creates deployment record and triggers store integration push.
   * V9 Tasks: 12.005–12.020
   */
  async deployProduct(
    productId: string,
    targetStore: string,
    adminId: string,
  ): Promise<{ deploymentId: string; status: string }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();
      const deploymentId = `deploy_${productId}_${Date.now()}`;

      // Get product data for deployment
      const { data: product } = await db
        .from('products')
        .select('title, description, price, image_url, category')
        .eq('id', productId)
        .single();

      if (!product) {
        return { deploymentId: '', status: 'failed' };
      }

      // Create deployment record
      const deployment: DeploymentRecord = {
        product_id: productId,
        deployment_id: deploymentId,
        target_store: targetStore,
        deployed_by: adminId,
        status: 'pending',
        deployed_at: new Date().toISOString(),
        metadata: {
          productTitle: product.title,
          price: product.price,
        },
      };

      await db
        .from('deployments')
        .insert(deployment);

      // Create shop_products entry for store integration tracking
      await db
        .from('shop_products')
        .upsert({
          product_id: productId,
          channel_type: targetStore,
          push_status: 'pending',
          title: product.title,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          deployed_by: adminId,
          deployment_id: deploymentId,
          created_at: new Date().toISOString(),
        }, { onConflict: 'product_id,channel_type' });

      await bus.emit(
        ENGINE_EVENTS.ADMIN_PRODUCT_DEPLOYED,
        { productId, targetStore, deploymentId, deployedBy: adminId },
        'admin-command-center',
      );

      return { deploymentId, status: 'pending' };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Batch-deploy multiple HOT products.
   * V9 Tasks: 12.021–12.030
   */
  async batchDeploy(
    productIds: string[],
    targetStore: string,
    adminId: string,
  ): Promise<{ deployed: number; failed: number; deployments: string[] }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      let deployed = 0;
      let failed = 0;
      const deployments: string[] = [];

      for (const productId of productIds) {
        const result = await this.deployProduct(productId, targetStore, adminId);
        if (result.status === 'failed') {
          failed++;
        } else {
          deployed++;
          deployments.push(result.deploymentId);
        }
      }

      await bus.emit(
        ENGINE_EVENTS.ADMIN_BATCH_DEPLOY_COMPLETE,
        { productCount: productIds.length, deployed, failed, targetStore, deployedBy: adminId },
        'admin-command-center',
      );

      return { deployed, failed, deployments };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Get admin dashboard aggregation data.
   * Reads from products, orders, shop_products, clusters.
   * Comm #: 4.004, 6.008, 8.008, 9.008, 11.008
   * V9 Tasks: 12.025–12.032
   */
  async getDashboardData(): Promise<DashboardData> {
    const db = this.getDb();

    // Get product counts by tier
    const { data: products } = await db
      .from('products')
      .select('id, title, final_score, tier');

    const allProducts = products || [];
    const hotProducts = allProducts.filter((p: { tier: string }) => p.tier === 'HOT');
    const warmProducts = allProducts.filter((p: { tier: string }) => p.tier === 'WARM');

    // Get deployed products count
    const { data: deployedProducts } = await db
      .from('shop_products')
      .select('id')
      .eq('push_status', 'live');

    // Get revenue data
    const { data: orders } = await db
      .from('orders')
      .select('product_id, revenue');

    const totalRevenue = (orders || []).reduce((sum: number, o: { revenue: number }) => sum + (o.revenue || 0), 0);

    // Build top products with revenue
    const revenueByProduct: Record<string, number> = {};
    const ordersByProduct: Record<string, number> = {};
    for (const order of (orders || [])) {
      revenueByProduct[order.product_id] = (revenueByProduct[order.product_id] || 0) + (order.revenue || 0);
      ordersByProduct[order.product_id] = (ordersByProduct[order.product_id] || 0) + 1;
    }

    const topProducts = hotProducts
      .map((p: { id: string; title: string; final_score: number; tier: string }) => ({
        productId: p.id,
        title: p.title || 'Untitled',
        score: p.final_score || 0,
        tier: p.tier,
        revenue: revenueByProduct[p.id] || 0,
        orders: ordersByProduct[p.id] || 0,
      }))
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 20);

    return {
      totalProducts: allProducts.length,
      hotProducts: hotProducts.length,
      warmProducts: warmProducts.length,
      deployedProducts: deployedProducts?.length || 0,
      totalRevenue,
      totalOrders: (orders || []).length,
      topProducts,
    };
  }

  /**
   * Approve a blueprint and trigger deployment.
   * Comm #18.004: Admin CC → Launch Blueprint manual approval.
   */
  async approveAndDeploy(
    blueprintId: string,
    productId: string,
    targetStore: string,
    adminId: string,
  ): Promise<{ blueprintApproved: boolean; deploymentId: string }> {
    const db = this.getDb();
    const bus = getEventBus();

    // Approve blueprint
    await db
      .from('blueprints')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('blueprint_id', blueprintId);

    await bus.emit(
      ENGINE_EVENTS.BLUEPRINT_APPROVED,
      { blueprintId, productId, approvedBy: adminId },
      'admin-command-center',
    );

    // Deploy product
    const deployment = await this.deployProduct(productId, targetStore, adminId);

    return { blueprintApproved: true, deploymentId: deployment.deploymentId };
  }
}

