/**
 * YOUSELL Engine Registry — Central Engine Management
 *
 * Singleton registry where all engines register themselves.
 * Provides discovery, lifecycle management, and dependency resolution.
 *
 * @see src/lib/engines/types.ts for Engine interface
 * @see src/lib/engines/event-bus.ts for event communication
 */

import { getEventBus } from './event-bus';
import {
  type Engine,
  type EngineName,
  type EngineStatus,
  ENGINE_EVENTS,
} from './types';

interface RegisteredEngine {
  engine: Engine;
  registeredAt: string;
}

class EngineRegistry {
  private engines: Map<EngineName, RegisteredEngine> = new Map();

  /**
   * Register an engine. Calls engine.init() and wires up event subscriptions.
   * Throws if an engine with the same name is already registered.
   */
  async register(engine: Engine): Promise<void> {
    const { name } = engine.config;

    if (this.engines.has(name)) {
      throw new Error(`Engine "${name}" is already registered`);
    }

    // Validate dependencies are registered
    const missing = engine.config.dependencies.filter((dep) => !this.engines.has(dep));
    if (missing.length > 0) {
      throw new Error(
        `Engine "${name}" depends on unregistered engines: ${missing.join(', ')}`,
      );
    }

    // Wire up event subscriptions
    const bus = getEventBus();
    for (const eventType of engine.config.subscribes) {
      bus.subscribe(eventType, (event) => engine.handleEvent(event), name);
    }

    // Initialize the engine
    await engine.init();

    this.engines.set(name, {
      engine,
      registeredAt: new Date().toISOString(),
    });

    // Broadcast lifecycle event
    await bus.emit(
      ENGINE_EVENTS.ENGINE_REGISTERED,
      { engineName: name, previousStatus: 'stopped', newStatus: engine.status() },
      name,
    );

    console.log(`[Registry] Engine "${name}" registered (v${engine.config.version})`);
  }

  /**
   * Unregister an engine. Calls engine.stop() first.
   */
  async unregister(name: EngineName): Promise<void> {
    const entry = this.engines.get(name);
    if (!entry) {
      throw new Error(`Engine "${name}" is not registered`);
    }

    // Check no other engine depends on this one
    const dependents = this.getDependents(name);
    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister "${name}" — depended on by: ${dependents.join(', ')}`,
      );
    }

    await entry.engine.stop();
    this.engines.delete(name);

    console.log(`[Registry] Engine "${name}" unregistered`);
  }

  /**
   * Get an engine by name. Returns undefined if not found.
   */
  get(name: EngineName): Engine | undefined {
    return this.engines.get(name)?.engine;
  }

  /**
   * Get an engine by name, throwing if not found.
   */
  getOrThrow(name: EngineName): Engine {
    const engine = this.get(name);
    if (!engine) {
      throw new Error(`Engine "${name}" is not registered`);
    }
    return engine;
  }

  /**
   * List all registered engines with their status.
   */
  list(): Array<{
    name: EngineName;
    version: string;
    status: EngineStatus;
    registeredAt: string;
    dependencies: EngineName[];
    queues: string[];
  }> {
    return Array.from(this.engines.entries()).map(([name, entry]) => ({
      name,
      version: entry.engine.config.version,
      status: entry.engine.status(),
      registeredAt: entry.registeredAt,
      dependencies: entry.engine.config.dependencies,
      queues: entry.engine.config.queues,
    }));
  }

  /**
   * Start all registered engines in dependency order.
   */
  async startAll(): Promise<void> {
    const order = this.resolveDependencyOrder();
    for (const name of order) {
      const entry = this.engines.get(name);
      if (entry && entry.engine.status() !== 'running') {
        await entry.engine.start();
        console.log(`[Registry] Engine "${name}" started`);
      }
    }
  }

  /**
   * Stop all registered engines in reverse dependency order.
   */
  async stopAll(): Promise<void> {
    const order = this.resolveDependencyOrder().reverse();
    for (const name of order) {
      const entry = this.engines.get(name);
      if (entry && entry.engine.status() === 'running') {
        await entry.engine.stop();
        console.log(`[Registry] Engine "${name}" stopped`);
      }
    }
  }

  /**
   * Run health checks on all engines.
   */
  async healthCheckAll(): Promise<Map<EngineName, boolean>> {
    const results = new Map<EngineName, boolean>();
    for (const [name, entry] of this.engines) {
      try {
        results.set(name, await entry.engine.healthCheck());
      } catch {
        results.set(name, false);
      }
    }
    return results;
  }

  /**
   * Get engines that depend on the given engine.
   */
  getDependents(name: EngineName): EngineName[] {
    const dependents: EngineName[] = [];
    for (const [engineName, entry] of this.engines) {
      if (entry.engine.config.dependencies.includes(name)) {
        dependents.push(engineName);
      }
    }
    return dependents;
  }

  /**
   * Get count of registered engines.
   */
  get size(): number {
    return this.engines.size;
  }

  /**
   * Clear all engines. Used in tests and shutdown.
   */
  async clear(): Promise<void> {
    await this.stopAll();
    this.engines.clear();
  }

  // ─── Private ────────────────────────────────────────────

  /**
   * Topological sort of engines by dependencies.
   * Engines with no deps come first.
   */
  private resolveDependencyOrder(): EngineName[] {
    const visited = new Set<EngineName>();
    const order: EngineName[] = [];

    const visit = (name: EngineName) => {
      if (visited.has(name)) return;
      visited.add(name);

      const entry = this.engines.get(name);
      if (!entry) return;

      for (const dep of entry.engine.config.dependencies) {
        visit(dep);
      }
      order.push(name);
    };

    for (const name of this.engines.keys()) {
      visit(name);
    }

    return order;
  }
}

// ─── Singleton ────────────────────────────────────────────

let instance: EngineRegistry | null = null;

export function getEngineRegistry(): EngineRegistry {
  if (!instance) {
    instance = new EngineRegistry();
  }
  return instance;
}

/**
 * Reset the singleton. Only for testing.
 */
export async function resetEngineRegistry(): Promise<void> {
  if (instance) {
    await instance.clear();
  }
  instance = null;
}

export { EngineRegistry };
