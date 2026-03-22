/**
 * YOUSELL Engine Event Bus — Redis Pub/Sub Implementation
 *
 * Drop-in replacement for the in-memory EventBus.
 * Uses Redis pub/sub for cross-process event delivery.
 * Falls back to in-memory if REDIS_URL is not configured.
 *
 * Same API as event-bus.ts — getEventBus() returns either
 * RedisEventBus or in-memory EventBus transparently.
 */

import Redis from 'ioredis';
import {
  type EngineEvent,
  type EngineEventType,
  type EngineName,
  type EventHandler,
} from './types';

const EVENT_HISTORY_SIZE = 100;
const REDIS_CHANNEL_PREFIX = 'yousell:events:';

interface Subscription {
  pattern: string;
  handler: EventHandler;
  source?: EngineName;
}

export class RedisEventBus {
  private subscriptions: Subscription[] = [];
  private history: EngineEvent[] = [];
  private pub: Redis;
  private sub: Redis;
  private connected = false;

  constructor(redisUrl: string) {
    this.pub = new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true });
    this.sub = new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true });
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    await Promise.all([this.pub.connect(), this.sub.connect()]);

    // Subscribe to the wildcard channel
    await this.sub.psubscribe(`${REDIS_CHANNEL_PREFIX}*`);

    this.sub.on('pmessage', (_pattern: string, _channel: string, message: string) => {
      try {
        const event: EngineEvent = JSON.parse(message);
        this.handleIncoming(event);
      } catch (err) {
        console.error('[RedisEventBus] Failed to parse message:', err);
      }
    });

    this.pub.on('error', (err) => console.error('[RedisEventBus] Pub error:', err));
    this.sub.on('error', (err) => console.error('[RedisEventBus] Sub error:', err));

    this.connected = true;
    console.log('[RedisEventBus] Connected to Redis pub/sub');
  }

  subscribe(pattern: string, handler: EventHandler, source?: EngineName): () => void {
    const sub: Subscription = { pattern, handler, source };
    this.subscriptions.push(sub);
    return () => {
      const idx = this.subscriptions.indexOf(sub);
      if (idx !== -1) this.subscriptions.splice(idx, 1);
    };
  }

  async emit<T = unknown>(
    type: string | EngineEventType,
    payload: T,
    source: EngineName,
    correlationId?: string,
  ): Promise<void> {
    const event: EngineEvent<T> = {
      type,
      payload,
      source,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    // Buffer locally for debugging
    this.history.push(event as EngineEvent);
    if (this.history.length > EVENT_HISTORY_SIZE) {
      this.history.shift();
    }

    if (this.connected) {
      // Publish to Redis — all subscribers across processes receive it
      const channel = `${REDIS_CHANNEL_PREFIX}${type}`;
      await this.pub.publish(channel, JSON.stringify(event));
    } else {
      // Fallback: deliver locally only (same as in-memory bus)
      await this.deliverLocally(event as EngineEvent);
    }
  }

  getHistory(pattern?: string): EngineEvent[] {
    if (!pattern) return [...this.history];
    return this.history.filter((e) => this.matches(pattern, e.type));
  }

  clearSubscriptions(): void {
    this.subscriptions = [];
  }

  clearHistory(): void {
    this.history = [];
  }

  get subscriberCount(): number {
    return this.subscriptions.length;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    await this.sub.punsubscribe(`${REDIS_CHANNEL_PREFIX}*`);
    this.sub.disconnect();
    this.pub.disconnect();
    this.connected = false;
  }

  // ─── Private ────────────────────────────────────────────

  private handleIncoming(event: EngineEvent): void {
    // Buffer for debugging
    if (!this.history.find(e => e.timestamp === event.timestamp && e.type === event.type && e.source === event.source)) {
      this.history.push(event);
      if (this.history.length > EVENT_HISTORY_SIZE) {
        this.history.shift();
      }
    }

    this.deliverLocally(event);
  }

  private async deliverLocally(event: EngineEvent): Promise<void> {
    const matching = this.subscriptions.filter((sub) => this.matches(sub.pattern, event.type));
    await Promise.allSettled(
      matching.map(async (sub) => {
        try {
          await sub.handler(event);
        } catch (err) {
          console.error(
            `[RedisEventBus] Handler error for event "${event.type}" from "${event.source}":`,
            err instanceof Error ? err.message : err,
          );
        }
      }),
    );
  }

  private matches(pattern: string, eventType: string): boolean {
    if (pattern === '*') return true;
    if (pattern === eventType) return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix + '.');
    }
    return false;
  }
}
