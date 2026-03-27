/**
 * YOUSELL Circuit Breaker
 *
 * Prevents cascading failures when external APIs (Apify, Claude,
 * Bannerbear, Shotstack, platform APIs) are unavailable.
 *
 * States:
 *   CLOSED  → Normal operation, requests pass through
 *   OPEN    → Too many failures, requests rejected immediately
 *   HALF    → Testing recovery, limited requests allowed
 *
 * Usage:
 *   const breaker = getCircuitBreaker('apify');
 *   const result = await breaker.execute(() => fetch(apifyUrl));
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  /** Name for logging */
  name: string;
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms to wait before trying half-open */
  resetTimeoutMs: number;
  /** Number of successes in half-open before closing */
  halfOpenSuccessThreshold: number;
}

const DEFAULT_CONFIG: Omit<CircuitBreakerConfig, 'name'> = {
  failureThreshold: 5,
  resetTimeoutMs: 30_000, // 30 seconds
  halfOpenSuccessThreshold: 2,
};

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  get currentState(): CircuitState {
    if (this.state === 'OPEN') {
      // Check if enough time has passed to try half-open
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      }
    }
    return this.state;
  }

  get stats() {
    return {
      name: this.config.name,
      state: this.currentState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
    };
  }

  /**
   * Execute an async operation through the circuit breaker.
   * Throws CircuitOpenError if circuit is open.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.currentState;

    if (state === 'OPEN') {
      throw new CircuitOpenError(this.config.name, this.config.resetTimeoutMs - (Date.now() - this.lastFailureTime));
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Execute with a fallback value when circuit is open.
   * Returns fallback instead of throwing.
   */
  async executeWithFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await this.execute(fn);
    } catch (error) {
      if (error instanceof CircuitOpenError) {
        console.warn(`[CircuitBreaker] ${this.config.name} is OPEN — using fallback`);
        return fallback;
      }
      throw error;
    }
  }

  /** Force reset to closed state (admin override) */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenSuccessThreshold) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        console.info(`[CircuitBreaker] ${this.config.name} recovered — circuit CLOSED`);
      }
    } else {
      // In closed state, reset failure count on success
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Failed during recovery — reopen
      this.state = 'OPEN';
      console.warn(`[CircuitBreaker] ${this.config.name} failed during recovery — circuit OPEN`);
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`[CircuitBreaker] ${this.config.name} hit failure threshold (${this.failureCount}) — circuit OPEN`);
    }
  }
}

export class CircuitOpenError extends Error {
  public readonly retryAfterMs: number;
  constructor(serviceName: string, retryAfterMs: number) {
    super(`Circuit breaker OPEN for ${serviceName} — retry after ${Math.ceil(retryAfterMs / 1000)}s`);
    this.name = 'CircuitOpenError';
    this.retryAfterMs = retryAfterMs;
  }
}

// ─── Circuit Breaker Registry ─────────────────────────────

const breakers = new Map<string, CircuitBreaker>();

/**
 * Get or create a named circuit breaker.
 * Each external service gets its own breaker.
 */
export function getCircuitBreaker(
  name: string,
  overrides?: Partial<Omit<CircuitBreakerConfig, 'name'>>
): CircuitBreaker {
  if (!breakers.has(name)) {
    breakers.set(name, new CircuitBreaker({ name, ...DEFAULT_CONFIG, ...overrides }));
  }
  return breakers.get(name)!;
}

/**
 * Get status of all circuit breakers.
 */
export function getAllCircuitBreakerStats() {
  return Array.from(breakers.values()).map(b => b.stats);
}

/**
 * Reset all circuit breakers (admin emergency action).
 */
export function resetAllCircuitBreakers(): void {
  for (const breaker of breakers.values()) {
    breaker.reset();
  }
}

// Pre-register breakers for known external services
const EXTERNAL_SERVICES: Array<{ name: string; config?: Partial<Omit<CircuitBreakerConfig, 'name'>> }> = [
  { name: 'apify', config: { failureThreshold: 3, resetTimeoutMs: 60_000 } },
  { name: 'claude-api', config: { failureThreshold: 5, resetTimeoutMs: 30_000 } },
  { name: 'bannerbear', config: { failureThreshold: 3, resetTimeoutMs: 45_000 } },
  { name: 'shotstack', config: { failureThreshold: 3, resetTimeoutMs: 45_000 } },
  { name: 'shopify-api', config: { failureThreshold: 5, resetTimeoutMs: 30_000 } },
  { name: 'tiktok-api', config: { failureThreshold: 5, resetTimeoutMs: 30_000 } },
  { name: 'amazon-api', config: { failureThreshold: 5, resetTimeoutMs: 30_000 } },
  { name: 'stripe', config: { failureThreshold: 5, resetTimeoutMs: 15_000 } },
  { name: 'supabase', config: { failureThreshold: 10, resetTimeoutMs: 10_000 } },
  { name: 'resend', config: { failureThreshold: 3, resetTimeoutMs: 30_000 } },
];

for (const svc of EXTERNAL_SERVICES) {
  getCircuitBreaker(svc.name, svc.config);
}
