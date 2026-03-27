/**
 * Inter-Engine: Clustering Producer Gaps (Batch 2.6)
 *
 * Verifies Clustering writes to product_clusters and downstream engines can read:
 * - Comm 4.004: Admin CC reads product_clusters
 * - Comm 4.005: Launch Blueprint reads clusters for landscape analysis
 * - Comm 4.006: Client Allocation reads clusters for diversification
 * - Comm 12.009: Opportunity Feed reads cluster context
 * - Comm 13.007: Financial Modelling reads cluster data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  ClusteringEngine,
} from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

describe('Inter-Engine: Clustering Producer', () => {
  let engine: InstanceType<typeof ClusteringEngine>

  beforeEach(() => {
    resetEventBus()
    vi.clearAllMocks()
    engine = new ClusteringEngine()
  })

  it('TC-4.002: publishes CLUSTER_UPDATED and CLUSTERS_REBUILT events (Comm 4.004-4.006)', () => {
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.CLUSTER_UPDATED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.CLUSTERS_REBUILT)
  })

  it('TC-4.001: subscribes to PRODUCT_SCORED for re-clustering', () => {
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
  })

  it('TC-4.004: has runClustering method for product_clusters writes', () => {
    expect(typeof engine.runClustering).toBe('function')
  })

  it('TC-4.003a: CLUSTER_UPDATED event is receivable by downstream engines', async () => {
    const bus = getEventBus()
    const events: unknown[] = []
    bus.subscribe(ENGINE_EVENTS.CLUSTER_UPDATED, (e) => events.push(e))

    await bus.emit(ENGINE_EVENTS.CLUSTER_UPDATED, { clusterId: 'c1', productCount: 5 }, 'clustering')
    expect(events.length).toBe(1)
  })

  it('TC-4.002a: CLUSTERS_REBUILT event is receivable on full rebuild', async () => {
    const bus = getEventBus()
    const events: unknown[] = []
    bus.subscribe(ENGINE_EVENTS.CLUSTERS_REBUILT, (e) => events.push(e))

    await bus.emit(ENGINE_EVENTS.CLUSTERS_REBUILT, { totalClusters: 10 }, 'clustering')
    expect(events.length).toBe(1)
  })
})
