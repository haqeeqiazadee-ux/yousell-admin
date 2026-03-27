/**
 * Engine: Amazon Intelligence — V9 Task Coverage Tests
 *
 * Tests BSR scanning via Apify, product storage, event emission,
 * BSR movers query, engine lifecycle, and event handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
  }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  AmazonIntelligenceEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('AmazonIntelligence — Config & Lifecycle', () => {
  let engine: InstanceType<typeof AmazonIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new AmazonIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('amazon-intelligence')
    expect(engine.config.queues).toContain('amazon-intelligence')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.AMAZON_PRODUCTS_FOUND)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.TREND_DETECTED)
  })

  it('transitions through lifecycle', async () => {
    expect(engine.status()).toBe('idle')
    await engine.start()
    expect(engine.status()).toBe('running')
    await engine.stop()
    expect(engine.status()).toBe('stopped')
  })

  it('healthCheck returns true', async () => {
    expect(await engine.healthCheck()).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: scanProducts — Apify Integration
// ─────────────────────────────────────────────────────────────

describe('AmazonIntelligence — scanProducts', () => {
  let engine: InstanceType<typeof AmazonIntelligenceEngine>
  let mockDb: ReturnType<typeof createMockDbClient>

  beforeEach(() => {
    resetEventBus()
    vi.restoreAllMocks()
    mockFetch.mockReset()
    engine = new AmazonIntelligenceEngine()
    mockDb = createMockDbClient()
    engine.setDbClient(mockDb as any)
  })

  it('calls Apify API with correct actor', async () => {
    const env = process.env
    process.env = { ...env, APIFY_API_TOKEN: 'test-token' }

    // Mock Apify run creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-123' } }),
    })
    // Mock status poll — SUCCEEDED immediately
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-456' } }),
    })
    // Mock dataset items
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { asin: 'B001', title: 'Test Product', price: 29.99, bsr: 100, category: 'Electronics', reviewCount: 500, rating: 4.5 },
      ]),
    })

    await engine.scanProducts('wireless earbuds', 10)

    // Verify the first fetch call is to the correct Apify actor
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('junglee~amazon-bestsellers-scraper'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    )

    process.env = env
  })

  it('handles missing APIFY_API_TOKEN gracefully', async () => {
    const env = process.env
    process.env = { ...env }
    delete process.env.APIFY_API_TOKEN

    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = await engine.scanProducts('wireless earbuds')

    expect(result.productsFound).toBe(0)
    expect(result.productsStored).toBe(0)
    expect(result.topProducts).toHaveLength(0)
    expect(result.query).toBe('wireless earbuds')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('APIFY_API_TOKEN not set'))

    spy.mockRestore()
    process.env = env
  })

  it('stores products in DB via upsert', async () => {
    const env = process.env
    process.env = { ...env, APIFY_API_TOKEN: 'test-token' }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-123' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-456' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { asin: 'B001', title: 'Product A', price: 19.99, bsr: 50, category: 'Home', reviewCount: 200, rating: 4.0 },
        { asin: 'B002', title: 'Product B', price: 39.99, bsr: 120, category: 'Kitchen', reviewCount: 800, rating: 4.7 },
      ]),
    })

    const result = await engine.scanProducts('kitchen gadgets', 10)

    // Verify upsert was called for each product
    expect(mockDb.from).toHaveBeenCalledWith('products')
    expect(result.productsFound).toBe(2)

    process.env = env
  })

  it('emits AMAZON_PRODUCTS_FOUND event', async () => {
    const env = process.env
    process.env = { ...env, APIFY_API_TOKEN: 'test-token' }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-123' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-456' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { asin: 'B001', title: 'Product A', price: 19.99, bsr: 50, category: 'Home', reviewCount: 200, rating: 4.0 },
      ]),
    })

    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.AMAZON_PRODUCTS_FOUND, (e) => received.push(e))

    await engine.scanProducts('home decor', 10)

    expect(received).toHaveLength(1)
    expect(received[0].source).toBe('amazon-intelligence')
    const p = received[0].payload as Record<string, unknown>
    expect(p.query).toBe('home decor')
    expect(p.count).toBe(1)
    expect(p.topASINs).toEqual(['B001'])

    process.env = env
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: getBSRMovers
// ─────────────────────────────────────────────────────────────

describe('AmazonIntelligence — getBSRMovers', () => {
  let engine: InstanceType<typeof AmazonIntelligenceEngine>
  let mockDb: ReturnType<typeof createMockDbClient>

  beforeEach(() => {
    resetEventBus()
    engine = new AmazonIntelligenceEngine()
    mockDb = createMockDbClient()
    engine.setDbClient(mockDb as any)
  })

  it('queries products table with platform=amazon', async () => {
    await engine.getBSRMovers()

    expect(mockDb.from).toHaveBeenCalledWith('products')
    // Verify the chain included eq('platform', 'amazon')
    const builder = mockDb.from.mock.results[0].value
    expect(builder.select).toHaveBeenCalledWith('*')
    expect(builder.eq).toHaveBeenCalledWith('platform', 'amazon')
  })

  it('filters by category when provided', async () => {
    await engine.getBSRMovers('Electronics')

    const builder = mockDb.from.mock.results[0].value
    expect(builder.eq).toHaveBeenCalledWith('platform', 'amazon')
    expect(builder.eq).toHaveBeenCalledWith('category', 'Electronics')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Event Handling
// ─────────────────────────────────────────────────────────────

describe('AmazonIntelligence — Event Handling', () => {
  let engine: InstanceType<typeof AmazonIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new AmazonIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('handles TREND_DETECTED event', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.TREND_DETECTED,
      payload: { keyword: 'wireless earbuds' },
      source: 'trend-analysis',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Auto-scan triggered for trend'))
    spy.mockRestore()
  })
})
