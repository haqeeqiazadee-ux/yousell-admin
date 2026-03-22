/**
 * YOUSELL Engine Event Bus — Central Pub/Sub
 *
 * Singleton event bus for inter-engine communication.
 * Uses Redis pub/sub when REDIS_URL is configured, falls back to in-memory.
 *
 * Features:
 * - Type-safe event emission and subscription
 * - Event history buffer (last 100 events) for debugging
 * - Wildcard subscriptions (e.g. 'discovery.*')
 * - Error isolation — one handler failure doesn't break others
 * - Cross-process delivery via Redis pub/sub (when available)
 *
 * @see src/lib/engines/types.ts for event type definitions
 */

import {
  type EngineEvent,
  type EngineEventType,
  type EngineName,
  type EventHandler,
} from './types';

const EVENT_HISTORY_SIZE = 100;

interface Subscription {
  pattern: string;
  handler: EventHandler;
  source?: EngineName;
}

/**
 * Common interface for both in-memory and Redis EventBus implementations.
 */
export interface IEventBus {
  subscribe(pattern: string, handler: EventHandler, source?: EngineName): () => void;
  emit<T = unknown>(type: string | EngineEventType, payload: T, source: EngineName, correlationId?: string): Promise<void>;
  getHistory(pattern?: string): EngineEvent[];
  clearSubscriptions(): void;
  clearHistory(): void;
  readonly subscriberCount: number;
}

class EventBus implements IEventBus {
  private subscriptions: Subscription[] = [];
  private history: EngineEvent[] = [];

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

    this.history.push(event as EngineEvent);
    if (this.history.length > EVENT_HISTORY_SIZE) {
      this.history.shift();
    }

    const matching = this.subscriptions.filter((sub) => this.matches(sub.pattern, type));

    await Promise.allSettled(
      matching.map(async (sub) => {
        try {
          await sub.handler(event as EngineEvent);
        } catch (err) {
          console.error(
            `[EventBus] Handler error for event "${type}" from "${source}":`,
            err instanceof Error ? err.message : err,
          );
        }
      }),
    );
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

// ─── Singleton ────────────────────────────────────────────

let instance: IEventBus | null = null;
let redisInitPromise: Promise<void> | null = null;

/**
 * Get the singleton EventBus instance.
 * Automatically uses Redis pub/sub when REDIS_URL is set.
 * Falls back to in-memory for local dev or when Redis is unavailable.
 */
export function getEventBus(): IEventBus {
  if (instance) return instance;

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    // Dynamic import to avoid bundling ioredis in client builds
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { RedisEventBus } = require('./redis-event-bus');
    const redisBus = new RedisEventBus(redisUrl);
    instance = redisBus as IEventBus;
    // Connect async — bus works locally until connected
    redisInitPromise = redisBus.connect().catch((err: Error) => {
      console.error('[EventBus] Redis connection failed, using local delivery only:', err.message);
    });
  } else {
    instance = new EventBus();
  }
  return instance!;
}

/**
 * Wait for Redis connection to complete (if applicable).
 * Call this during app startup to ensure Redis is ready.
 */
export async function waitForEventBus(): Promise<void> {
  getEventBus(); // Ensure instance is created
  if (redisInitPromise) await redisInitPromise;
}

/**
 * Reset the singleton. Only for testing.
 */
export function resetEventBus(): void {
  if (instance) {
    instance.clearSubscriptions();
    instance.clearHistory();
  }
  instance = null;
  redisInitPromise = null;
}

export { EventBus };
export type { Subscription };
