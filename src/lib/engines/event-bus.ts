/**
 * YOUSELL Engine Event Bus — Central Pub/Sub
 *
 * Singleton event bus for inter-engine communication.
 * In-memory implementation — can be upgraded to Redis Pub/Sub later.
 *
 * Features:
 * - Type-safe event emission and subscription
 * - Event history buffer (last 100 events) for debugging
 * - Wildcard subscriptions (e.g. 'discovery.*')
 * - Error isolation — one handler failure doesn't break others
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

class EventBus {
  private subscriptions: Subscription[] = [];
  private history: EngineEvent[] = [];

  /**
   * Subscribe to events matching a pattern.
   * Supports exact match ('discovery.scan_complete') or
   * wildcard ('discovery.*', '*').
   *
   * Returns an unsubscribe function.
   */
  subscribe(pattern: string, handler: EventHandler, source?: EngineName): () => void {
    const sub: Subscription = { pattern, handler, source };
    this.subscriptions.push(sub);
    return () => {
      const idx = this.subscriptions.indexOf(sub);
      if (idx !== -1) this.subscriptions.splice(idx, 1);
    };
  }

  /**
   * Emit an event to all matching subscribers.
   * Errors in individual handlers are caught and logged — never propagated.
   */
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

    // Buffer for debugging
    this.history.push(event as EngineEvent);
    if (this.history.length > EVENT_HISTORY_SIZE) {
      this.history.shift();
    }

    // Find matching subscriptions
    const matching = this.subscriptions.filter((sub) => this.matches(sub.pattern, type));

    // Execute handlers — isolated error handling
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

  /**
   * Get recent event history for debugging.
   * Optionally filter by event type pattern.
   */
  getHistory(pattern?: string): EngineEvent[] {
    if (!pattern) return [...this.history];
    return this.history.filter((e) => this.matches(pattern, e.type));
  }

  /**
   * Clear all subscriptions. Used in tests and shutdown.
   */
  clearSubscriptions(): void {
    this.subscriptions = [];
  }

  /**
   * Clear event history. Used in tests.
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Get current subscription count. Used for diagnostics.
   */
  get subscriberCount(): number {
    return this.subscriptions.length;
  }

  // ─── Private ────────────────────────────────────────────

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

let instance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!instance) {
    instance = new EventBus();
  }
  return instance;
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
}

export { EventBus };
