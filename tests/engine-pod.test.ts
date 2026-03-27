/**
 * Engine: POD (Print on Demand) — V9 Task Coverage Tests
 *
 * Tests POD product discovery, provider catalog integration,
 * product creation, fulfillment sync, engine lifecycle,
 * and event handling.
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
      order: vi.fn().mockReturnThis(),
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
  PodEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

// -----------------------------------------------------------------
// SECTION 1: Config & Lifecycle
// -----------------------------------------------------------------

describe('PodEngine — Config & Lifecycle', () => {
  let engine: InstanceType<typeof PodEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new PodEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('pod-engine')
    expect(engine.config.queues).toContain('pod-discovery')
    expect(engine.config.queues).toContain('pod-provision')
    expect(engine.config.queues).toContain('pod-fulfillment-sync')
    expect(engine.config.publishes).toContain('pod.product_discovered')
    expect(engine.config.publishes).toContain('pod.order_created')
    expect(engine.config.publishes).toContain('pod.fulfillment_synced')
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.FULFILLMENT_RECOMMENDED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.ORDER_RECEIVED)
  })

  it('transitions through lifecycle', async () => {
    expect(engine.status()).toBe('idle')
    await engine.start()
    expect(engine.status()).toBe('running')
    await engine.stop()
    expect(engine.status()).toBe('stopped')
  })
})

// -----------------------------------------------------------------
// SECTION 2: discoverProducts()
// -----------------------------------------------------------------

describe('PodEngine — discoverProducts()', () => {
  let engine: InstanceType<typeof PodEngine>

  beforeEach(() => {
    resetEventBus()
    mockFetch.mockReset()
    engine = new PodEngine()
    engine.setDbClient(createMockDbClient() as any)
    delete process.env.APIFY_API_TOKEN
    delete process.env.POD_DISCOVERY_ENABLED
  })

  it('returns products array from cached DB when discovery disabled', async () => {
    const products = await engine.discoverProducts('t-shirt')
    expect(Array.isArray(products)).toBe(true)
  })

  it('stores products in DB via upsert', async () => {
    process.env.APIFY_API_TOKEN = 'test-token'
    process.env.POD_DISCOVERY_ENABLED = 'true'

    // Mock the Apify run creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-123' } }),
    })
    // Mock polling — immediately SUCCEEDED
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-456' } }),
    })
    // Mock dataset items
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { title: 'Custom Tee', category: 'apparel', price: '25.00', salesCount: 100, rating: '4.5' },
      ]),
    })

    const db = createMockDbClient()
    engine.setDbClient(db as any)

    const products = await engine.discoverProducts('t-shirt', ['etsy'])

    expect(products).toHaveLength(1)
    expect(products[0].title).toBe('Custom Tee')
    expect(db.from).toHaveBeenCalledWith('products')
  })

  it('emits pod.product_discovered event', async () => {
    process.env.APIFY_API_TOKEN = 'test-token'
    process.env.POD_DISCOVERY_ENABLED = 'true'

    // Mock Apify calls: run, poll, dataset
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'run-1' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds-1' } }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { title: 'Mug', category: 'drinkware', price: '15', salesCount: 50 },
      ]),
    })

    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe('pod.product_discovered' as any, (e) => received.push(e))

    await engine.discoverProducts('mug', ['etsy'])

    expect(received).toHaveLength(1)
    expect(received[0].source).toBe('pod-engine')
    const p = received[0].payload as Record<string, unknown>
    expect(p.count).toBe(1)
    expect(p.niche).toBe('mug')
  })
})

// -----------------------------------------------------------------
// SECTION 3: getProviderCatalog()
// -----------------------------------------------------------------

describe('PodEngine — getProviderCatalog()', () => {
  let engine: InstanceType<typeof PodEngine>

  beforeEach(() => {
    resetEventBus()
    mockFetch.mockReset()
    engine = new PodEngine()
    engine.setDbClient(createMockDbClient() as any)
    delete process.env.PRINTFUL_API_KEY
  })

  it('returns catalog items from provider', async () => {
    process.env.PRINTFUL_API_KEY = 'pk_test_123'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: [
          { id: 71, title: 'Unisex Staple T-Shirt', variant_count: 45 },
          { id: 206, title: 'Premium Hoodie', variant_count: 30 },
        ],
      }),
    })

    const catalog = await engine.getProviderCatalog('printful')

    expect(catalog).toHaveLength(2)
    expect(catalog[0].id).toBe('71')
    expect(catalog[0].title).toBe('Unisex Staple T-Shirt')
    expect(catalog[0].variants).toBe(45)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.printful.com/products',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer pk_test_123' }),
      }),
    )
  })

  it('handles missing API key gracefully', async () => {
    delete process.env.PRINTFUL_API_KEY

    const catalog = await engine.getProviderCatalog('printful')

    expect(catalog).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

// -----------------------------------------------------------------
// SECTION 4: createProviderProduct()
// -----------------------------------------------------------------

describe('PodEngine — createProviderProduct()', () => {
  let engine: InstanceType<typeof PodEngine>

  beforeEach(() => {
    resetEventBus()
    mockFetch.mockReset()
    engine = new PodEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('calls Printful API to create product', async () => {
    process.env.PRINTFUL_API_KEY = 'pk_test_123'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: { id: 98765 } }),
    })

    const result = await engine.createProviderProduct('printful', {
      title: 'Cool T-Shirt',
      blueprintId: '71',
      designUrl: 'https://example.com/design.png',
      variants: ['4012', '4013'],
    })

    expect(result.id).toBe('98765')
    expect(result.status).toBe('created')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.printful.com/store/products',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer pk_test_123',
        }),
      }),
    )
  })
})

// -----------------------------------------------------------------
// SECTION 5: syncFulfillment()
// -----------------------------------------------------------------

describe('PodEngine — syncFulfillment()', () => {
  let engine: InstanceType<typeof PodEngine>

  beforeEach(() => {
    resetEventBus()
    mockFetch.mockReset()
    engine = new PodEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('returns tracking status from provider', async () => {
    process.env.PRINTFUL_API_KEY = 'pk_test_123'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: { status: 'shipped', tracking_url: 'https://track.example.com/abc' },
      }),
    })

    const result = await engine.syncFulfillment('printful', 'order-555')

    expect(result.status).toBe('shipped')
    expect(result.trackingUrl).toBe('https://track.example.com/abc')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.printful.com/orders/order-555',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer pk_test_123' }),
      }),
    )
  })
})

// -----------------------------------------------------------------
// SECTION 6: handleEvent()
// -----------------------------------------------------------------

describe('PodEngine — Event Handling', () => {
  let engine: InstanceType<typeof PodEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new PodEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('handles FULFILLMENT_RECOMMENDED with POD model', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await engine.handleEvent({
      type: ENGINE_EVENTS.FULFILLMENT_RECOMMENDED,
      payload: { model: 'POD', productId: 'prod-pod-001' },
      source: 'fulfillment-recommendation',
      timestamp: new Date().toISOString(),
    })

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('POD fulfillment recommended for product prod-pod-001'),
    )
    spy.mockRestore()
  })
})
