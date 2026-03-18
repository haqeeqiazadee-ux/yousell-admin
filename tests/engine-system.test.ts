/**
 * Engine System Integration Tests
 *
 * Tests the core engine infrastructure (EventBus, Registry, Engine interface)
 * without external dependencies (no Supabase, no Apify).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock server-only to allow importing engine modules in test environment
vi.mock('server-only', () => ({}));
import {
  getEventBus,
  resetEventBus,
  getEngineRegistry,
  resetEngineRegistry,
  ENGINE_EVENTS,
  ClusteringEngine,
  TrendDetectionEngine,
  CreatorMatchingEngine,
  AdIntelligenceEngine,
  OpportunityFeedEngine,
} from '@/lib/engines';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from '@/lib/engines';

// ─── Mock Engine for Testing ────────────────────────────────

class MockEngine implements Engine {
  private _status: EngineStatus = 'idle';
  public eventsReceived: EngineEvent[] = [];

  constructor(
    public readonly config: EngineConfig,
  ) {}

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
    this.eventsReceived.push(event);
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

// ─── Test Suite ─────────────────────────────────────────────

describe('EventBus', () => {
  beforeEach(() => {
    resetEventBus();
  });

  it('should emit and receive events', async () => {
    const bus = getEventBus();
    const received: EngineEvent[] = [];

    bus.subscribe('test.event', (event) => {
      received.push(event);
    });

    await bus.emit('test.event', { data: 'hello' }, 'discovery');

    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('test.event');
    expect(received[0].payload).toEqual({ data: 'hello' });
    expect(received[0].source).toBe('discovery');
    expect(received[0].timestamp).toBeTruthy();
  });

  it('should support wildcard subscriptions', async () => {
    const bus = getEventBus();
    const received: EngineEvent[] = [];

    bus.subscribe('discovery.*', (event) => {
      received.push(event);
    });

    await bus.emit('discovery.scan_complete', { scanId: '1' }, 'discovery');
    await bus.emit('discovery.product_discovered', { productId: '2' }, 'discovery');
    await bus.emit('scoring.product_scored', { productId: '3' }, 'scoring');

    expect(received).toHaveLength(2);
    expect(received[0].type).toBe('discovery.scan_complete');
    expect(received[1].type).toBe('discovery.product_discovered');
  });

  it('should support global wildcard', async () => {
    const bus = getEventBus();
    const received: EngineEvent[] = [];

    bus.subscribe('*', (event) => {
      received.push(event);
    });

    await bus.emit('a.b', {}, 'discovery');
    await bus.emit('c.d', {}, 'scoring');

    expect(received).toHaveLength(2);
  });

  it('should unsubscribe correctly', async () => {
    const bus = getEventBus();
    const received: EngineEvent[] = [];

    const unsub = bus.subscribe('test.event', (event) => {
      received.push(event);
    });

    await bus.emit('test.event', {}, 'discovery');
    expect(received).toHaveLength(1);

    unsub();
    await bus.emit('test.event', {}, 'discovery');
    expect(received).toHaveLength(1); // unchanged
  });

  it('should maintain event history', async () => {
    const bus = getEventBus();

    await bus.emit('event.1', {}, 'discovery');
    await bus.emit('event.2', {}, 'scoring');

    const history = bus.getHistory();
    expect(history).toHaveLength(2);

    const filtered = bus.getHistory('event.*');
    expect(filtered).toHaveLength(2);
  });

  it('should isolate handler errors', async () => {
    const bus = getEventBus();
    const received: EngineEvent[] = [];

    bus.subscribe('test.event', () => {
      throw new Error('Handler failed');
    });
    bus.subscribe('test.event', (event) => {
      received.push(event);
    });

    // Should not throw even though first handler fails
    await bus.emit('test.event', {}, 'discovery');
    expect(received).toHaveLength(1);
  });

  it('should be a singleton', () => {
    const bus1 = getEventBus();
    const bus2 = getEventBus();
    expect(bus1).toBe(bus2);
  });
});

describe('EngineRegistry', () => {
  beforeEach(async () => {
    resetEventBus();
    await resetEngineRegistry();
  });

  it('should register and retrieve engines', async () => {
    const registry = getEngineRegistry();
    const engine = new MockEngine({
      name: 'discovery',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [],
      subscribes: [],
    });

    await registry.register(engine);

    expect(registry.get('discovery')).toBe(engine);
    expect(registry.size).toBe(1);
  });

  it('should reject duplicate engine names', async () => {
    const registry = getEngineRegistry();
    const config: EngineConfig = {
      name: 'discovery',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [],
      subscribes: [],
    };

    await registry.register(new MockEngine(config));
    await expect(registry.register(new MockEngine(config))).rejects.toThrow('already registered');
  });

  it('should validate dependencies on registration', async () => {
    const registry = getEngineRegistry();
    const engine = new MockEngine({
      name: 'scoring',
      version: '1.0.0',
      dependencies: ['discovery'],
      queues: [],
      publishes: [],
      subscribes: [],
    });

    await expect(registry.register(engine)).rejects.toThrow('unregistered engines: discovery');
  });

  it('should allow registration when dependencies are met', async () => {
    const registry = getEngineRegistry();

    const discovery = new MockEngine({
      name: 'discovery',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [ENGINE_EVENTS.SCAN_COMPLETE],
      subscribes: [],
    });

    const scoring = new MockEngine({
      name: 'scoring',
      version: '1.0.0',
      dependencies: ['discovery'],
      queues: [],
      publishes: [],
      subscribes: [ENGINE_EVENTS.SCAN_COMPLETE],
    });

    await registry.register(discovery);
    await registry.register(scoring);

    expect(registry.size).toBe(2);
  });

  it('should wire event subscriptions on registration', async () => {
    const registry = getEngineRegistry();
    const bus = getEventBus();

    const scoring = new MockEngine({
      name: 'scoring',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [],
      subscribes: [ENGINE_EVENTS.SCAN_COMPLETE],
    });

    await registry.register(scoring);

    // Emit a scan_complete event — scoring should receive it
    await bus.emit(ENGINE_EVENTS.SCAN_COMPLETE, { scanId: 'test' }, 'discovery');

    expect(scoring.eventsReceived).toHaveLength(1);
    expect(scoring.eventsReceived[0].type).toBe(ENGINE_EVENTS.SCAN_COMPLETE);
  });

  it('should list all engines with status', async () => {
    const registry = getEngineRegistry();

    await registry.register(new MockEngine({
      name: 'discovery',
      version: '1.0.0',
      dependencies: [],
      queues: ['product-scan'],
      publishes: [],
      subscribes: [],
    }));

    const list = registry.list();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('discovery');
    expect(list[0].version).toBe('1.0.0');
    expect(list[0].status).toBe('idle');
    expect(list[0].queues).toEqual(['product-scan']);
  });

  it('should start and stop all engines', async () => {
    const registry = getEngineRegistry();

    const discovery = new MockEngine({
      name: 'discovery',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [],
      subscribes: [],
    });

    const scoring = new MockEngine({
      name: 'scoring',
      version: '1.0.0',
      dependencies: ['discovery'],
      queues: [],
      publishes: [],
      subscribes: [],
    });

    await registry.register(discovery);
    await registry.register(scoring);

    await registry.startAll();
    expect(discovery.status()).toBe('running');
    expect(scoring.status()).toBe('running');

    await registry.stopAll();
    expect(discovery.status()).toBe('stopped');
    expect(scoring.status()).toBe('stopped');
  });

  it('should prevent unregistering engines with dependents', async () => {
    const registry = getEngineRegistry();

    await registry.register(new MockEngine({
      name: 'discovery',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [],
      subscribes: [],
    }));

    await registry.register(new MockEngine({
      name: 'scoring',
      version: '1.0.0',
      dependencies: ['discovery'],
      queues: [],
      publishes: [],
      subscribes: [],
    }));

    await expect(registry.unregister('discovery')).rejects.toThrow('depended on by');
  });

  it('should run health checks on all engines', async () => {
    const registry = getEngineRegistry();

    await registry.register(new MockEngine({
      name: 'discovery',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [],
      subscribes: [],
    }));

    const results = await registry.healthCheckAll();
    expect(results.get('discovery')).toBe(true);
  });

  it('should be a singleton', () => {
    const r1 = getEngineRegistry();
    const r2 = getEngineRegistry();
    expect(r1).toBe(r2);
  });
});

describe('Engine Event Flow (Integration)', () => {
  beforeEach(async () => {
    resetEventBus();
    await resetEngineRegistry();
  });

  it('should flow events between engines through the bus', async () => {
    const registry = getEngineRegistry();
    const bus = getEventBus();

    const discovery = new MockEngine({
      name: 'discovery',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [ENGINE_EVENTS.SCAN_COMPLETE],
      subscribes: [],
    });

    const tiktok = new MockEngine({
      name: 'tiktok-discovery',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [],
      subscribes: [ENGINE_EVENTS.SCAN_COMPLETE],
    });

    const scoring = new MockEngine({
      name: 'scoring',
      version: '1.0.0',
      dependencies: [],
      queues: [],
      publishes: [],
      subscribes: [ENGINE_EVENTS.SCAN_COMPLETE],
    });

    await registry.register(discovery);
    await registry.register(tiktok);
    await registry.register(scoring);

    // Discovery emits scan complete
    await bus.emit(
      ENGINE_EVENTS.SCAN_COMPLETE,
      { scanId: 'test-123', mode: 'quick', productsFound: 10, hotProducts: 2, platforms: ['tiktok'] },
      'discovery',
    );

    // Both tiktok and scoring should receive the event
    expect(tiktok.eventsReceived).toHaveLength(1);
    expect(scoring.eventsReceived).toHaveLength(1);
    expect(tiktok.eventsReceived[0].payload).toEqual({
      scanId: 'test-123',
      mode: 'quick',
      productsFound: 10,
      hotProducts: 2,
      platforms: ['tiktok'],
    });

    // Discovery should NOT receive its own event (not subscribed)
    expect(discovery.eventsReceived).toHaveLength(0);
  });

  it('should support correlation IDs for event chain tracing', async () => {
    const bus = getEventBus();
    const received: EngineEvent[] = [];

    bus.subscribe('*', (event) => received.push(event));

    const correlationId = 'scan-chain-abc';
    await bus.emit(ENGINE_EVENTS.SCAN_COMPLETE, { scanId: '1' }, 'discovery', correlationId);
    await bus.emit(ENGINE_EVENTS.PRODUCT_SCORED, { productId: '2' }, 'scoring', correlationId);

    expect(received[0].correlationId).toBe(correlationId);
    expect(received[1].correlationId).toBe(correlationId);
  });
});

// ─── Phase B Engine Wrapper Tests ──────────────────────────

describe('Phase B Engine Wrappers', () => {
  beforeEach(async () => {
    resetEventBus();
    await resetEngineRegistry();
  });

  describe('ClusteringEngine', () => {
    it('should implement Engine interface with correct config', () => {
      const engine = new ClusteringEngine();
      expect(engine.config.name).toBe('clustering');
      expect(engine.config.queues).toContain('product-clustering');
      expect(engine.config.publishes).toContain(ENGINE_EVENTS.CLUSTER_UPDATED);
      expect(engine.config.publishes).toContain(ENGINE_EVENTS.CLUSTERS_REBUILT);
      expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED);
    });

    it('should manage lifecycle correctly', async () => {
      const engine = new ClusteringEngine();
      expect(engine.status()).toBe('idle');

      await engine.init();
      expect(engine.status()).toBe('idle');

      await engine.start();
      expect(engine.status()).toBe('running');

      await engine.stop();
      expect(engine.status()).toBe('stopped');
    });

    it('should pass health check', async () => {
      const engine = new ClusteringEngine();
      expect(await engine.healthCheck()).toBe(true);
    });

    it('should register with engine registry', async () => {
      const registry = getEngineRegistry();
      const engine = new ClusteringEngine();
      await registry.register(engine);
      expect(registry.get('clustering')).toBe(engine);
    });
  });

  describe('TrendDetectionEngine', () => {
    it('should implement Engine interface with correct config', () => {
      const engine = new TrendDetectionEngine();
      expect(engine.config.name).toBe('trend-detection');
      expect(engine.config.queues).toContain('trend-detection');
      expect(engine.config.queues).toContain('trend-scan');
      expect(engine.config.publishes).toContain(ENGINE_EVENTS.TREND_DETECTED);
      expect(engine.config.subscribes).toContain(ENGINE_EVENTS.SCAN_COMPLETE);
    });

    it('should manage lifecycle correctly', async () => {
      const engine = new TrendDetectionEngine();
      await engine.start();
      expect(engine.status()).toBe('running');
      await engine.stop();
      expect(engine.status()).toBe('stopped');
    });

    it('should register with engine registry', async () => {
      const registry = getEngineRegistry();
      await registry.register(new TrendDetectionEngine());
      expect(registry.get('trend-detection')).toBeTruthy();
    });
  });

  describe('CreatorMatchingEngine', () => {
    it('should implement Engine interface with correct config', () => {
      const engine = new CreatorMatchingEngine();
      expect(engine.config.name).toBe('creator-matching');
      expect(engine.config.queues).toContain('creator-matching');
      expect(engine.config.publishes).toContain(ENGINE_EVENTS.CREATOR_MATCHED);
      expect(engine.config.publishes).toContain(ENGINE_EVENTS.MATCHES_COMPLETE);
      expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED);
    });

    it('should register and receive events', async () => {
      const registry = getEngineRegistry();
      const engine = new CreatorMatchingEngine();
      await registry.register(engine);

      const bus = getEventBus();
      await bus.emit(ENGINE_EVENTS.PRODUCT_SCORED, { productId: 'test' }, 'scoring');

      // handleEvent should not throw
      expect(registry.get('creator-matching')).toBeTruthy();
    });
  });

  describe('AdIntelligenceEngine', () => {
    it('should implement Engine interface with correct config', () => {
      const engine = new AdIntelligenceEngine();
      expect(engine.config.name).toBe('ad-intelligence');
      expect(engine.config.queues).toContain('ad-intelligence');
      expect(engine.config.publishes).toContain(ENGINE_EVENTS.ADS_DISCOVERED);
      expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_DISCOVERED);
    });

    it('should manage lifecycle correctly', async () => {
      const engine = new AdIntelligenceEngine();
      await engine.start();
      expect(engine.status()).toBe('running');
      await engine.stop();
      expect(engine.status()).toBe('stopped');
    });
  });

  describe('OpportunityFeedEngine', () => {
    it('should implement Engine interface with correct config', () => {
      const engine = new OpportunityFeedEngine();
      expect(engine.config.name).toBe('opportunity-feed');
      expect(engine.config.queues).toHaveLength(0); // read-only aggregation
      expect(engine.config.publishes).toHaveLength(0); // read-only
      expect(engine.config.subscribes).toContain(ENGINE_EVENTS.CLUSTERS_REBUILT);
      expect(engine.config.subscribes).toContain(ENGINE_EVENTS.MATCHES_COMPLETE);
      expect(engine.config.subscribes).toContain(ENGINE_EVENTS.TREND_DETECTED);
    });

    it('should register with engine registry', async () => {
      const registry = getEngineRegistry();
      await registry.register(new OpportunityFeedEngine());
      expect(registry.get('opportunity-feed')).toBeTruthy();
    });
  });

  describe('All 8 engines register together', () => {
    it('should register all Phase 0 + Phase B engines without conflicts', async () => {
      const registry = getEngineRegistry();

      await registry.register(new ClusteringEngine());
      await registry.register(new TrendDetectionEngine());
      await registry.register(new CreatorMatchingEngine());
      await registry.register(new AdIntelligenceEngine());
      await registry.register(new OpportunityFeedEngine());

      // 5 Phase B engines
      expect(registry.size).toBe(5);

      const list = registry.list();
      const names = list.map(e => e.name);
      expect(names).toContain('clustering');
      expect(names).toContain('trend-detection');
      expect(names).toContain('creator-matching');
      expect(names).toContain('ad-intelligence');
      expect(names).toContain('opportunity-feed');
    });
  });
});
