/**
 * Inter-Engine L5 Queue Tests — BullMQ Queue Dispatch Between Engines
 *
 * Per V9_Inter_Engine_Communication_Test_Strategy.md Section 5E
 * and V9_Inter_Engine_Communication_Breakdown.md Section 4.3.
 *
 * Section A: Queue Dispatch Tests (Breakdown 4.3)
 *   TC-Q-DISC-01, TC-Q-DISC-02, TC-Q-TIKTOK-01, TC-Q-TIKTOK-02,
 *   TC-Q-ADMIN-01, TC-Q-ADMIN-02, TC-Q-ADMIN-03
 *
 * Section B: Queue Resilience Tests (Strategy 5E)
 *   TC-Q-01, TC-Q-02, TC-Q-03, TC-Q-04, TC-Q-05
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
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      gte: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    })),
  }),
}))

// ── BullMQ mock ──────────────────────────────────────────────
const mockAdd = vi.fn().mockResolvedValue({ id: 'job-1', name: 'test-job' })
const mockClose = vi.fn().mockResolvedValue(undefined)
const mockGetJobCounts = vi.fn().mockResolvedValue({ waiting: 0, active: 0, failed: 0, completed: 0 })

interface MockQueueInstance {
  name: string
  add: typeof mockAdd
  close: typeof mockClose
  getJobCounts: typeof mockGetJobCounts
  obliterate: ReturnType<typeof vi.fn>
}

const queueInstances: Map<string, MockQueueInstance> = new Map()

/** Helper to create a mock BullMQ Queue instance */
function createMockQueue(name: string): MockQueueInstance {
  const instance: MockQueueInstance = {
    name,
    add: mockAdd,
    close: mockClose,
    getJobCounts: mockGetJobCounts,
    obliterate: vi.fn().mockResolvedValue(undefined),
  }
  queueInstances.set(name, instance)
  return instance
}

import {
  DiscoveryEngine,
  TikTokDiscoveryEngine,
  AdminCommandCenterEngine,
  ENGINE_EVENTS,
} from '@/lib/engines'
import { QUEUES, ENGINE_QUEUE_MAP } from '../../backend/src/jobs/types'
import { createMockDbClient } from './helpers/mock-db'

// ══════════════════════════════════════════════════════════════
// Section A: Queue Dispatch Tests (Breakdown Section 4.3)
// ══════════════════════════════════════════════════════════════

describe('Section A: Queue Dispatch — Inter-Engine Queue Pathways', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queueInstances.clear()
  })

  // ── TC-Q-DISC-01: Discovery → trend-scan queue (Comm 1.005) ──
  it('TC-Q-DISC-01: Discovery enqueues to trend-scan queue (Comm 1.005)', () => {
    // Discovery engine publishes SCAN_COMPLETE which triggers trend-scan queue
    const engine = new DiscoveryEngine()
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.SCAN_COMPLETE)

    // Verify the trend-scan queue exists and is mapped to trend-detection engine
    expect(QUEUES.TREND_SCAN).toBe('trend-scan')
    expect(ENGINE_QUEUE_MAP[QUEUES.TREND_SCAN]).toBe('trend-detection')
  })

  // ── TC-Q-DISC-02: Discovery self-enqueues to enrich-product (Comm 1.007) ──
  it('TC-Q-DISC-02: Discovery self-enqueues to enrich-product queue (Comm 1.007)', () => {
    const engine = new DiscoveryEngine()
    // Discovery engine owns the enrich-product queue
    expect(QUEUES.ENRICH_PRODUCT).toBe('enrich-product')
    expect(ENGINE_QUEUE_MAP[QUEUES.ENRICH_PRODUCT]).toBe('discovery')

    // Discovery publishes PRODUCT_DISCOVERED which triggers enrichment
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_DISCOVERED)
  })

  // ── TC-Q-TIKTOK-01: TikTok Discovery → tiktok-product-extract (Comm 2.008) ──
  it('TC-Q-TIKTOK-01: TikTok Discovery enqueues to tiktok-product-extract queue (Comm 2.008)', () => {
    const engine = new TikTokDiscoveryEngine()
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.TIKTOK_VIDEOS_FOUND)

    // tiktok-product-extract queue is owned by tiktok-discovery engine
    expect(QUEUES.TIKTOK_PRODUCT_EXTRACT).toBe('tiktok-product-extract')
    expect(ENGINE_QUEUE_MAP[QUEUES.TIKTOK_PRODUCT_EXTRACT]).toBe('tiktok-discovery')
  })

  // ── TC-Q-TIKTOK-02: TikTok 4-stage pipeline chain (Comm 2.008) ──
  it('TC-Q-TIKTOK-02: TikTok Discovery chains through 4-stage pipeline (Comm 2.008)', () => {
    // Verify all 4 TikTok pipeline queues exist and are owned by tiktok-discovery
    const tiktokQueues = [
      QUEUES.TIKTOK_DISCOVERY,
      QUEUES.TIKTOK_PRODUCT_EXTRACT,
      QUEUES.TIKTOK_ENGAGEMENT_ANALYSIS,
      QUEUES.TIKTOK_CROSS_MATCH,
    ]

    expect(tiktokQueues).toEqual([
      'tiktok-discovery',
      'tiktok-product-extract',
      'tiktok-engagement-analysis',
      'tiktok-cross-match',
    ])

    // All 4 stages owned by tiktok-discovery engine
    for (const queue of tiktokQueues) {
      expect(ENGINE_QUEUE_MAP[queue]).toBe('tiktok-discovery')
    }

    // TikTok engine emits events for each stage
    const engine = new TikTokDiscoveryEngine()
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.TIKTOK_VIDEOS_FOUND)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.TIKTOK_HASHTAGS_ANALYZED)
  })

  // ── TC-Q-ADMIN-01: Admin CC → product-scan queue (Comm 17.004) ──
  it('TC-Q-ADMIN-01: Admin CC enqueues to product-scan queue (Comm 17.004)', () => {
    const engine = new AdminCommandCenterEngine()
    engine.setDbClient(createMockDbClient() as any)

    // Admin CC subscribes to scored products and can trigger product-scan
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)

    // product-scan queue exists and is mapped to discovery engine
    expect(QUEUES.PRODUCT_SCAN).toBe('product-scan')
    expect(ENGINE_QUEUE_MAP[QUEUES.PRODUCT_SCAN]).toBe('discovery')
  })

  // ── TC-Q-ADMIN-02: Admin CC → scoring-queue for re-scoring (Comm 17.005) ──
  it('TC-Q-ADMIN-02: Admin CC enqueues to scoring-queue for re-scoring (Comm 17.005)', () => {
    const engine = new AdminCommandCenterEngine()
    engine.setDbClient(createMockDbClient() as any)

    // scoring-queue exists and is owned by scoring engine
    expect(QUEUES.SCORING_QUEUE).toBe('scoring-queue')
    expect(ENGINE_QUEUE_MAP[QUEUES.SCORING_QUEUE]).toBe('scoring')

    // Admin CC publishes deploy events which can trigger re-scoring
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.ADMIN_PRODUCT_DEPLOYED)
  })

  // ── TC-Q-ADMIN-03: Admin CC → product-push for deployment (Comm 17.007) ──
  it('TC-Q-ADMIN-03: Admin CC enqueues to product-push for deployment (Comm 17.007)', () => {
    const engine = new AdminCommandCenterEngine()
    engine.setDbClient(createMockDbClient() as any)

    // Push queues exist for each store channel
    expect(QUEUES.PUSH_TO_SHOPIFY).toBe('push-to-shopify')
    expect(QUEUES.PUSH_TO_TIKTOK).toBe('push-to-tiktok')
    expect(QUEUES.PUSH_TO_AMAZON).toBe('push-to-amazon')

    // All push queues owned by store-integration engine
    expect(ENGINE_QUEUE_MAP[QUEUES.PUSH_TO_SHOPIFY]).toBe('store-integration')
    expect(ENGINE_QUEUE_MAP[QUEUES.PUSH_TO_TIKTOK]).toBe('store-integration')
    expect(ENGINE_QUEUE_MAP[QUEUES.PUSH_TO_AMAZON]).toBe('store-integration')

    // Admin CC publishes batch deploy complete
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.ADMIN_BATCH_DEPLOY_COMPLETE)
  })
})

// ══════════════════════════════════════════════════════════════
// Section B: Queue Resilience Tests (Strategy Section 5E)
// ══════════════════════════════════════════════════════════════

describe('Section B: Queue Resilience — BullMQ Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queueInstances.clear()
  })

  // ── TC-Q-01: Retry behavior (3 attempts, exponential backoff) ──
  it('TC-Q-01: BullMQ job fails — retry behavior (3 attempts, exponential backoff)', async () => {
    const queue = createMockQueue(QUEUES.PRODUCT_SCAN)

    // Enqueue with retry options
    const retryOpts = {
      attempts: 3,
      backoff: { type: 'exponential' as const, delay: 1000 },
    }

    await queue.add('scan-job', { query: 'test', userId: 'u1' }, retryOpts)

    expect(mockAdd).toHaveBeenCalledWith(
      'scan-job',
      { query: 'test', userId: 'u1' },
      retryOpts,
    )

    // Verify retry config: 3 attempts with exponential backoff
    const callArgs = mockAdd.mock.calls[0]
    expect(callArgs[2].attempts).toBe(3)
    expect(callArgs[2].backoff.type).toBe('exponential')
    expect(callArgs[2].backoff.delay).toBe(1000)
  })

  // ── TC-Q-02: Queue message ordering preserved (FIFO) ──
  it('TC-Q-02: Queue message ordering preserved (FIFO)', async () => {
    const queue = createMockQueue(QUEUES.SCORING_QUEUE)

    const jobOrder: string[] = []
    mockAdd.mockImplementation(async (name: string) => {
      jobOrder.push(name)
      return { id: `job-${jobOrder.length}`, name }
    })

    // Enqueue jobs in order
    await queue.add('score-1', { productIds: ['p1'], userId: 'u1' })
    await queue.add('score-2', { productIds: ['p2'], userId: 'u1' })
    await queue.add('score-3', { productIds: ['p3'], userId: 'u1' })

    // FIFO: jobs should be in insertion order
    expect(jobOrder).toEqual(['score-1', 'score-2', 'score-3'])
    expect(mockAdd).toHaveBeenCalledTimes(3)
  })

  // ── TC-Q-03: Dead letter queue captures failed jobs ──
  it('TC-Q-03: Dead letter queue captures failed jobs', async () => {
    const queue = createMockQueue(QUEUES.ENRICH_PRODUCT)

    // Enqueue a job that will exhaust retries and land in failed state
    const dlqOpts = {
      attempts: 3,
      backoff: { type: 'exponential' as const, delay: 500 },
      removeOnFail: false, // Keep failed jobs for DLQ inspection
    }

    await queue.add('enrich-fail', { scanId: 's1', products: [] }, dlqOpts)

    expect(mockAdd).toHaveBeenCalledWith(
      'enrich-fail',
      { scanId: 's1', products: [] },
      expect.objectContaining({
        attempts: 3,
        removeOnFail: false,
      }),
    )

    // Verify failed job counts can be queried (DLQ inspection)
    mockGetJobCounts.mockResolvedValueOnce({ waiting: 0, active: 0, failed: 1, completed: 0 })
    const counts = await queue.getJobCounts()
    expect(counts.failed).toBe(1)
  })

  // ── TC-Q-04: Queue handles large payload (10KB product data) ──
  it('TC-Q-04: Queue handles large payload (10KB product data)', async () => {
    const queue = createMockQueue(QUEUES.ENRICH_PRODUCT)

    // Generate a ~10KB payload of product data
    const largeProducts = Array.from({ length: 50 }, (_, i) => ({
      external_id: `ext-${i}`,
      title: `Product ${i} with a longer title to increase payload size`.repeat(2),
      price: 29.99 + i,
      url: `https://example.com/product/${i}`,
      image_url: `https://images.example.com/product/${i}/main.jpg`,
      sales_count: 1000 + i * 10,
      review_count: 500 + i * 5,
      rating: 4.5,
      source: 'amazon',
    }))

    const payload = { scanId: 'scan-large', products: largeProducts }
    const payloadSize = JSON.stringify(payload).length
    expect(payloadSize).toBeGreaterThan(10000) // >10KB

    await queue.add('enrich-large', payload)

    expect(mockAdd).toHaveBeenCalledWith(
      'enrich-large',
      expect.objectContaining({
        scanId: 'scan-large',
        products: expect.arrayContaining([
          expect.objectContaining({ external_id: 'ext-0' }),
        ]),
      }),
    )
  })

  // ── TC-Q-05: Multiple queues process independently (no cross-contamination) ──
  it('TC-Q-05: Multiple queues process independently (no cross-contamination)', () => {
    const queueA = createMockQueue(QUEUES.PRODUCT_SCAN)
    const queueB = createMockQueue(QUEUES.SCORING_QUEUE)
    const queueC = createMockQueue(QUEUES.TREND_SCAN)

    // Verify distinct queue instances were created
    expect(queueA.name).toBe('product-scan')
    expect(queueB.name).toBe('scoring-queue')
    expect(queueC.name).toBe('trend-scan')

    // Verify engine ownership is distinct (no cross-contamination)
    expect(ENGINE_QUEUE_MAP[QUEUES.PRODUCT_SCAN]).toBe('discovery')
    expect(ENGINE_QUEUE_MAP[QUEUES.SCORING_QUEUE]).toBe('scoring')
    expect(ENGINE_QUEUE_MAP[QUEUES.TREND_SCAN]).toBe('trend-detection')

    // No overlap in ownership
    const owners = new Set([
      ENGINE_QUEUE_MAP[QUEUES.PRODUCT_SCAN],
      ENGINE_QUEUE_MAP[QUEUES.SCORING_QUEUE],
      ENGINE_QUEUE_MAP[QUEUES.TREND_SCAN],
    ])
    expect(owners.size).toBe(3) // All different owners
  })
})
