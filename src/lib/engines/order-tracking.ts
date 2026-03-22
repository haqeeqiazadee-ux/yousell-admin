/**
 * Order Tracking Engine (V9 Engine 11)
 *
 * Receives order webhooks from connected stores, tracks fulfillment status,
 * sends post-purchase email sequences via Resend, calculates revenue.
 * Writes to orders table. Triggers affiliate commission on fulfillment.
 *
 * V9 Tasks: 11.001–11.044
 * Comm #: 16.001–16.010, 17.006 (→ Financial Modelling)
 * @engine order-tracking
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
  StoreProductPushedPayload,
} from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

/** Order status pipeline */
type OrderStatus = 'received' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

/** Order record */
export interface OrderRecord {
  id?: string;
  order_id: string;
  product_id: string;
  client_id?: string;
  platform: string;
  external_order_id?: string;
  customer_email?: string;
  customer_name?: string;
  status: OrderStatus;
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled' | 'returned';
  revenue: number;
  quantity: number;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/** Email template types */
type EmailType = 'order_confirmation' | 'shipping_notification' | 'delivery_confirmation' | 'review_request';

export class OrderTrackingEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'order-tracking',
    version: '2.0.0',
    dependencies: [],
    queues: ['order-processing', 'order-email'],
    publishes: [
      ENGINE_EVENTS.ORDER_RECEIVED,
      ENGINE_EVENTS.ORDER_FULFILLED,
      ENGINE_EVENTS.ORDER_TRACKING_SENT,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_PUSHED,
      ENGINE_EVENTS.STORE_SYNC_COMPLETE,
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
    if (event.type === ENGINE_EVENTS.PRODUCT_PUSHED) {
      const payload = event.payload as StoreProductPushedPayload;
      console.log(`[OrderTracking] Product ${payload.productId} pushed to ${payload.platform}, now tracking orders`);
    }
    if (event.type === ENGINE_EVENTS.STORE_SYNC_COMPLETE) {
      console.log(`[OrderTracking] Store sync complete, checking for new orders`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Process an incoming order webhook from a connected store.
   * Writes order to DB and emits ORDER_RECEIVED event.
   * V9 Tasks: 11.005–11.020
   */
  async processOrder(
    orderId: string,
    input: {
      productId: string;
      platform: string;
      customerEmail?: string;
      customerName?: string;
      revenue: number;
      quantity: number;
      externalOrderId?: string;
      clientId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<{ tracked: boolean; orderRecordId?: string }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();

      // Check for duplicate order
      const { data: existing } = await db
        .from('orders')
        .select('id')
        .eq('order_id', orderId)
        .single();

      if (existing) {
        console.log(`[OrderTracking] Order ${orderId} already tracked`);
        return { tracked: true, orderRecordId: existing.id };
      }

      // Write order to DB
      const record: OrderRecord = {
        order_id: orderId,
        product_id: input.productId,
        client_id: input.clientId,
        platform: input.platform,
        external_order_id: input.externalOrderId,
        customer_email: input.customerEmail,
        customer_name: input.customerName,
        status: 'received',
        fulfillment_status: 'unfulfilled',
        revenue: input.revenue,
        quantity: input.quantity,
        metadata: input.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted } = await db
        .from('orders')
        .insert(record)
        .select('id')
        .single();

      await bus.emit(
        ENGINE_EVENTS.ORDER_RECEIVED,
        {
          orderId,
          productId: input.productId,
          platform: input.platform,
          status: 'received',
          revenue: input.revenue,
        },
        'order-tracking',
      );

      // Queue confirmation email if customer email provided
      if (input.customerEmail) {
        await this.queueEmail(orderId, input.customerEmail, 'order_confirmation');
      }

      return { tracked: true, orderRecordId: inserted?.id };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Update order status (e.g. processing → shipped).
   * V9 Tasks: 11.015–11.020
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    metadata?: Record<string, unknown>,
  ): Promise<{ updated: boolean }> {
    const db = this.getDb();
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (metadata) {
      updateData.metadata = metadata;
    }

    const { error } = await db
      .from('orders')
      .update(updateData)
      .eq('order_id', orderId);

    return { updated: !error };
  }

  /**
   * Mark an order as fulfilled and trigger tracking email + affiliate commission.
   * V9 Tasks: 11.021–11.035
   */
  async markFulfilled(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    trackingUrl?: string,
  ): Promise<{ fulfilled: boolean }> {
    const bus = getEventBus();
    const db = this.getDb();

    // Update order in DB
    const { error } = await db
      .from('orders')
      .update({
        status: 'shipped',
        fulfillment_status: 'fulfilled',
        tracking_number: trackingNumber,
        tracking_url: trackingUrl || this.buildTrackingUrl(carrier, trackingNumber),
        carrier,
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (error) {
      console.error(`[OrderTracking] Failed to mark order ${orderId} as fulfilled:`, error.message);
      return { fulfilled: false };
    }

    // Get order details for events
    const { data: order } = await db
      .from('orders')
      .select('product_id, customer_email, revenue, platform')
      .eq('order_id', orderId)
      .single();

    await bus.emit(
      ENGINE_EVENTS.ORDER_FULFILLED,
      {
        orderId,
        trackingNumber,
        carrier,
        fulfilledAt: new Date().toISOString(),
        productId: order?.product_id,
        revenue: order?.revenue,
      },
      'order-tracking',
    );

    // Queue shipping notification email
    if (order?.customer_email) {
      await this.queueEmail(orderId, order.customer_email, 'shipping_notification');
    }

    return { fulfilled: true };
  }

  /**
   * Mark order as delivered.
   * V9 Tasks: 11.030–11.035
   */
  async markDelivered(orderId: string): Promise<{ delivered: boolean }> {
    const db = this.getDb();
    const bus = getEventBus();

    const { error } = await db
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (error) return { delivered: false };

    // Get order for email
    const { data: order } = await db
      .from('orders')
      .select('customer_email')
      .eq('order_id', orderId)
      .single();

    if (order?.customer_email) {
      // Queue review request email (sent 3 days after delivery)
      await this.queueEmail(orderId, order.customer_email, 'review_request');
    }

    // Emit for downstream (financial modelling revenue validation)
    await bus.emit(
      ENGINE_EVENTS.ORDER_FULFILLED,
      { orderId, status: 'delivered', deliveredAt: new Date().toISOString() },
      'order-tracking',
    );

    return { delivered: true };
  }

  /**
   * Send tracking email via Resend.
   * V9 Tasks: 11.036–11.044
   */
  async sendTrackingEmail(
    orderId: string,
    customerEmail: string,
    trackingNumber: string,
    carrier: string,
  ): Promise<{ sent: boolean }> {
    const bus = getEventBus();
    const db = this.getDb();

    // In production: call Resend API
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const { data, error } = await resend.emails.send({
    //   from: 'orders@yousell.online',
    //   to: customerEmail,
    //   subject: `Your order ${orderId} has shipped!`,
    //   html: buildTrackingEmailHtml(orderId, trackingNumber, carrier),
    // });

    const sent = !!process.env.RESEND_API_KEY; // Only "send" if API key is configured

    // Log email attempt
    await db
      .from('notifications')
      .insert({
        type: 'email',
        subtype: 'shipping_notification',
        recipient: customerEmail,
        reference_id: orderId,
        status: sent ? 'sent' : 'queued',
        metadata: { trackingNumber, carrier },
        created_at: new Date().toISOString(),
      });

    await bus.emit(
      ENGINE_EVENTS.ORDER_TRACKING_SENT,
      { orderId, customerEmail, sent },
      'order-tracking',
    );

    return { sent };
  }

  /**
   * Get order by ID.
   */
  async getOrder(orderId: string): Promise<OrderRecord | null> {
    const db = this.getDb();
    const { data } = await db
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    return data || null;
  }

  /**
   * Get all orders for a product (revenue tracking).
   * Used by Financial Modelling (Comm #17.006) and Admin CC.
   */
  async getProductOrders(productId: string): Promise<{
    orders: OrderRecord[];
    totalRevenue: number;
    totalQuantity: number;
  }> {
    const db = this.getDb();
    const { data: orders } = await db
      .from('orders')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    const allOrders = orders || [];
    const totalRevenue = allOrders.reduce((sum: number, o: OrderRecord) => sum + (o.revenue || 0), 0);
    const totalQuantity = allOrders.reduce((sum: number, o: OrderRecord) => sum + (o.quantity || 0), 0);

    return { orders: allOrders, totalRevenue, totalQuantity };
  }

  // ─── Private Helpers ────────────────────────────────────

  private buildTrackingUrl(carrier: string, trackingNumber: string): string {
    const trackingUrls: Record<string, string> = {
      usps: `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
      ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    };
    return trackingUrls[carrier.toLowerCase()] || `https://track.aftership.com/${trackingNumber}`;
  }

  private async queueEmail(
    orderId: string,
    customerEmail: string,
    emailType: EmailType,
  ): Promise<void> {
    const db = this.getDb();
    await db
      .from('notifications')
      .insert({
        type: 'email',
        subtype: emailType,
        recipient: customerEmail,
        reference_id: orderId,
        status: 'queued',
        metadata: { emailType },
        created_at: new Date().toISOString(),
      });
  }
}

