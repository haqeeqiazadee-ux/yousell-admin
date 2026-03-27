/**
 * Engine: Shopify Intelligence — V9 Task Coverage Tests
 *
 * Tests store scanning via Apify, product grouping by domain,
 * competitor store persistence, event emission, config,
 * lifecycle, and graceful error handling.
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
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      limit: vi.fn().mockReturnThis(),
    })),
  }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  ShopifyIntelligenceEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('ShopifyIntelligence — Config & Lifecycle', () => {
  let engine: InstanceType<typeof ShopifyIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ShopifyIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('shopify-intelligence')
    expect(engine.config.queues).toContain('shopify-intelligence')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.SHOPIFY_PRODUCTS_FOUND)
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
// SECTION 2: scanStores — Apify Integration
// ─────────────────────────────────────────────────────────────

describe('ShopifyIntelligence — scanStores', () => {
  let engine: InstanceType<typeof ShopifyIntelligenceEngine>
  const originalEnv = process.env

  beforeEach(() => {
    resetEventBus()
    vi.restoreAllMocks()
    mockFetch.mockReset()
    engine = new ShopifyIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
    process.env = { ...originalEnv, APIFY_API_TOKEN: 'test-token-123' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('calls Apify API with correct actor', async () => {
    // Mock the Apify run creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-001' } }),
    })
    // Mock the status poll — immediate success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-001' } }),
    })
    // Mock the dataset items fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([]),
    })

    await engine.scanStores('pet-toys', 5)

    const firstCallUrl = mockFetch.mock.calls[0][0] as string
    expect(firstCallUrl).toContain('clearpath~shop-by-shopify-product-scraper')
    expect(firstCallUrl).toContain('api.apify.com/v2/acts/')

    const firstCallOpts = mockFetch.mock.calls[0][1] as RequestInit
    expect(firstCallOpts.method).toBe('POST')
    expect(firstCallOpts.headers).toHaveProperty('Authorization', 'Bearer test-token-123')
    expect(JSON.parse(firstCallOpts.body as string)).toMatchObject({
      searchQuery: 'pet-toys',
    })
  })

  it('handles missing APIFY_API_TOKEN gracefully', async () => {
    delete process.env.APIFY_API_TOKEN

    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const result = await engine.scanStores('test-niche')

    expect(result.storesFound).toBe(0)
    expect(result.productsStored).toBe(0)
    expect(result.stores).toEqual([])
    expect(result.niche).toBe('test-niche')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('APIFY_API_TOKEN not set'))
    spy.mockRestore()
  })

  it('groups products by store domain', async () => {
    const mockItems = [
      { shopDomain: 'store-a.myshopify.com', shopName: 'Store A', title: 'Widget 1', price: '19.99', handle: 'widget-1' },
      { shopDomain: 'store-a.myshopify.com', shopName: 'Store A', title: 'Widget 2', price: '29.99', handle: 'widget-2' },
      { shopDomain: 'store-b.myshopify.com', shopName: 'Store B', title: 'Gadget 1', price: '39.99', handle: 'gadget-1' },
    ]

    // Run creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-002' } }),
    })
    // Status poll
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-002' } }),
    })
    // Dataset items
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    })

    const result = await engine.scanStores('widgets', 20)

    expect(result.storesFound).toBe(2)
    const storeA = result.stores.find(s => s.domain === 'store-a.myshopify.com')
    const storeB = result.stores.find(s => s.domain === 'store-b.myshopify.com')
    expect(storeA).toBeDefined()
    expect(storeA!.product_count).toBe(2)
    expect(storeA!.top_products).toHaveLength(2)
    expect(storeB).toBeDefined()
    expect(storeB!.product_count).toBe(1)
  })

  it('stores competitor stores in DB', async () => {
    const mockItems = [
      { shopDomain: 'cool-store.myshopify.com', shopName: 'Cool Store', title: 'Item 1', price: '10', handle: 'item-1' },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-003' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-003' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    })

    const mockDb = createMockDbClient()
    engine.setDbClient(mockDb as any)

    await engine.scanStores('niche', 20)

    // Verify competitor_stores upsert was called
    const competitorCalls = (mockDb.from as ReturnType<typeof vi.fn>).mock.calls
      .filter((call: unknown[]) => call[0] === 'competitor_stores')
    expect(competitorCalls.length).toBeGreaterThan(0)
  })

  it('emits SHOPIFY_PRODUCTS_FOUND event', async () => {
    const mockItems = [
      { shopDomain: 'store.myshopify.com', shopName: 'Test Store', title: 'Product', price: '25', handle: 'prod' },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-004' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-004' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    })

    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.SHOPIFY_PRODUCTS_FOUND, (e) => received.push(e))

    await engine.scanStores('trending', 20)

    expect(received).toHaveLength(1)
    expect(received[0].source).toBe('shopify-intelligence')
    const p = received[0].payload as Record<string, unknown>
    expect(p.niche).toBe('trending')
    expect(p.storesFound).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: getCompetitorStores
// ─────────────────────────────────────────────────────────────

describe('ShopifyIntelligence — getCompetitorStores', () => {
  let engine: InstanceType<typeof ShopifyIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ShopifyIntelligenceEngine()
  })

  it('queries competitor_stores table', async () => {
    const mockDb = createMockDbClient()
    engine.setDbClient(mockDb as any)

    await engine.getCompetitorStores(10)

    expect(mockDb.from).toHaveBeenCalledWith('competitor_stores')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Event Handling
// ─────────────────────────────────────────────────────────────

describe('ShopifyIntelligence — Event Handling', () => {
  let engine: InstanceType<typeof ShopifyIntelligenceEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ShopifyIntelligenceEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('handles TREND_DETECTED event', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.TREND_DETECTED,
      payload: { keyword: 'eco-bottles' },
      source: 'trend-detector',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Auto-scan triggered for trend: eco-bottles'))
    spy.mockRestore()
  })
})
