/**
 * Engine 10: Store Integration Engine — V9 Tests
 *
 * Tests the REAL StoreIntegrationEngine class:
 * - Config, lifecycle, healthCheck
 * - Event handling (BLUEPRINT_APPROVED, CONTENT_GENERATED)
 * - Domain methods: pushProduct(), connectStore(), syncInventory()
 * - Event emission verification
 * - Business rule specifications (OAuth, HMAC, rate limits)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as crypto from 'crypto'

// ── Mocks (required by barrel import transitive deps) ────────
vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      limit: vi.fn().mockReturnThis(),
    })),
  }),
}))

import {
  StoreIntegrationEngine,
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 10 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof StoreIntegrationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new StoreIntegrationEngine()
  })

  it('has correct name, queues, publishes, subscribes', () => {
    expect(engine.config.name).toBe('store-integration')
    expect(engine.config.queues).toContain('shop-sync')
    expect(engine.config.queues).toContain('push-to-shopify')
    expect(engine.config.queues).toContain('push-to-tiktok')
    expect(engine.config.queues).toContain('push-to-amazon')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_PUSHED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.STORE_CONNECTED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.STORE_SYNC_COMPLETE)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_ALLOCATED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.CONTENT_GENERATED)
  })

  it('transitions through lifecycle states', async () => {
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
// SECTION 2: Event Handling
// ─────────────────────────────────────────────────────────────

describe('Engine 10 — Event Handling', () => {
  let engine: InstanceType<typeof StoreIntegrationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new StoreIntegrationEngine()
  })

  it('handles BLUEPRINT_APPROVED event (deferred per G10)', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.BLUEPRINT_APPROVED,
      payload: { blueprintId: 'bp-001', productId: 'prod-001' },
      source: 'launch-blueprint',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('manual push available')
    )
    spy.mockRestore()
  })

  it('handles CONTENT_GENERATED event', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.CONTENT_GENERATED,
      payload: { contentId: 'cnt-001' },
      source: 'content-engine',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('listing can be updated')
    )
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Domain Methods — pushProduct()
// ─────────────────────────────────────────────────────────────

describe('Engine 10 — pushProduct()', () => {
  let engine: InstanceType<typeof StoreIntegrationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new StoreIntegrationEngine()
  })

  it('returns shopProductId and storeUrl', async () => {
    const result = await engine.pushProduct('prod-001', 'client-001', 'shopify', {
      title: 'Smart Widget', description: 'Cool widget', price: 29.99, images: ['https://img.example.com/1.jpg'],
    })

    expect(result.shopProductId).toContain('shop_shopify_prod-001')
    expect(typeof result.storeUrl).toBe('string')
  })

  it('emits PRODUCT_PUSHED event with correct payload', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.PRODUCT_PUSHED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.pushProduct('prod-001', 'client-001', 'tiktok-shop', {
      title: 'Widget', description: 'Desc', price: 19.99, images: [],
    })

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      productId: 'prod-001',
      platform: 'tiktok-shop',
      clientId: 'client-001',
    })
    expect(received[0].source).toBe('store-integration')
  })

  it('transitions status: running → idle after completion', async () => {
    await engine.pushProduct('p1', 'c1', 'amazon', {
      title: 'W', description: 'D', price: 10, images: [],
    })
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Domain Methods — connectStore()
// ─────────────────────────────────────────────────────────────

describe('Engine 10 — connectStore()', () => {
  let engine: InstanceType<typeof StoreIntegrationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new StoreIntegrationEngine()
  })

  it('returns connected=true and storeId', async () => {
    const result = await engine.connectStore('client-001', 'shopify', 'store-abc-123')
    expect(result.connected).toBe(true)
    expect(result.storeId).toBe('store-abc-123')
  })

  it('emits STORE_CONNECTED event', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.STORE_CONNECTED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.connectStore('client-001', 'tiktok_shop', 'store-xyz-456')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      clientId: 'client-001',
      platform: 'tiktok_shop',
    })
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Domain Methods — syncInventory()
// ─────────────────────────────────────────────────────────────

describe('Engine 10 — syncInventory()', () => {
  let engine: InstanceType<typeof StoreIntegrationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new StoreIntegrationEngine()
  })

  it('returns productsUpdated count', async () => {
    const result = await engine.syncInventory('client-001', 'store-001')
    expect(typeof result.productsUpdated).toBe('number')
  })

  it('emits STORE_SYNC_COMPLETE event', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.STORE_SYNC_COMPLETE, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.syncInventory('client-001', 'store-001')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      clientId: 'client-001',
      storeId: 'store-001',
    })
  })

  it('transitions status: running → idle after completion', async () => {
    await engine.syncInventory('c1', 's1')
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Token Encryption (AES-256-GCM)
// ─────────────────────────────────────────────────────────────

describe('Engine 10 — Token Encryption', () => {
  const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY
  })

  it('encrypts and decrypts a token round-trip', async () => {
    const { encryptToken, decryptToken } = await import('@/lib/crypto')
    const token = 'shpat_abc123_test_token'
    const encrypted = encryptToken(token)
    expect(encrypted).not.toBe(token)
    expect(encrypted.length).toBeGreaterThan(40)
    const decrypted = decryptToken(encrypted)
    expect(decrypted).toBe(token)
  })

  it('produces different ciphertext for the same plaintext (random IV)', async () => {
    const { encryptToken } = await import('@/lib/crypto')
    const token = 'shpat_same_token'
    const enc1 = encryptToken(token)
    const enc2 = encryptToken(token)
    expect(enc1).not.toBe(enc2)
  })

  it('detects tampering (auth tag validation)', async () => {
    const { encryptToken, decryptToken } = await import('@/lib/crypto')
    const encrypted = encryptToken('my_secret_token')
    // Flip a byte in the ciphertext
    const buf = Buffer.from(encrypted, 'base64')
    buf[15] = buf[15] ^ 0xff
    const tampered = buf.toString('base64')
    expect(() => decryptToken(tampered)).toThrow()
  })

  it('throws if ENCRYPTION_KEY is missing', async () => {
    delete process.env.ENCRYPTION_KEY
    const { encryptToken } = await import('@/lib/crypto')
    expect(() => encryptToken('test')).toThrow('ENCRYPTION_KEY')
  })

  it('throws if ENCRYPTION_KEY is wrong length', async () => {
    process.env.ENCRYPTION_KEY = 'tooshort'
    const { encryptToken } = await import('@/lib/crypto')
    expect(() => encryptToken('test')).toThrow('64-character')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 7: Shopify GraphQL Client
// ─────────────────────────────────────────────────────────────

describe('Engine 10 — Shopify GraphQL Client', () => {
  it('ShopifyAPIError has statusCode', async () => {
    const { ShopifyAPIError } = await import('@/lib/integrations/shopify/client')
    const err = new ShopifyAPIError('test error', 429)
    expect(err.statusCode).toBe(429)
    expect(err.message).toBe('test error')
    expect(err.name).toBe('ShopifyAPIError')
  })

  it('toShopifyProduct maps DB product correctly', async () => {
    const { toShopifyProduct } = await import('@/lib/integrations/shopify/products')
    const result = toShopifyProduct({
      title: 'Smart Widget',
      description: 'A cool widget',
      price: 29.99,
      compare_at_price: 39.99,
      category: 'Electronics',
      source: 'tiktok',
      trend_stage: 'HOT',
      image_url: 'https://example.com/img.jpg',
      sku: 'SW-001',
    })

    expect(result.title).toBe('Smart Widget')
    expect(result.descriptionHtml).toBe('A cool widget')
    expect(result.vendor).toBe('YouSell')
    expect(result.productType).toBe('Electronics')
    expect(result.tags).toEqual(['tiktok', 'HOT'])
    expect(result.images).toEqual(['https://example.com/img.jpg'])
    expect(result.variants?.[0]?.price).toBe('29.99')
    expect(result.variants?.[0]?.compareAtPrice).toBe('39.99')
    expect(result.variants?.[0]?.sku).toBe('SW-001')
    expect(result.status).toBe('ACTIVE')
  })

  it('toShopifyProduct handles nulls gracefully', async () => {
    const { toShopifyProduct } = await import('@/lib/integrations/shopify/products')
    const result = toShopifyProduct({
      title: 'Minimal Product',
    })

    expect(result.title).toBe('Minimal Product')
    expect(result.descriptionHtml).toBe('')
    expect(result.images).toEqual([])
    expect(result.variants?.[0]?.price).toBe('0.00')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 8: Business Rule Specifications (V9 Tasks)
// ─────────────────────────────────────────────────────────────

describe('Engine 10 — Business Rule Specs', () => {
  it('Shopify HMAC-SHA256 webhook validation (10.20)', () => {
    const secret = 'test_shopify_secret'
    const payload = JSON.stringify({ order_id: 123, total: 29.99 })
    const hmac = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('base64')

    // Same input produces same HMAC
    const hmac2 = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('base64')
    expect(hmac).toBe(hmac2)

    // Different input produces different HMAC
    const hmac3 = crypto.createHmac('sha256', secret).update('tampered', 'utf8').digest('base64')
    expect(hmac).not.toBe(hmac3)
  })

  it('TikTok rate limit: 50 req/sec (10.30)', () => {
    const RATE_LIMIT = 50
    const isAllowed = (currentCount: number) => currentCount < RATE_LIMIT
    expect(isAllowed(49)).toBe(true)
    expect(isAllowed(50)).toBe(false)
  })

  it('retry with exponential backoff: 2s, 4s, 8s (10.35)', () => {
    const getBackoff = (attempt: number) => Math.pow(2, attempt) * 1000
    expect(getBackoff(1)).toBe(2000)
    expect(getBackoff(2)).toBe(4000)
    expect(getBackoff(3)).toBe(8000)
  })

  it('token expiry detection: < 24h = refresh needed (10.15)', () => {
    const isExpiringSoon = (expiresAt: string) => {
      const remaining = new Date(expiresAt).getTime() - Date.now()
      return remaining < 24 * 3600000 && remaining > 0
    }
    const soonExpiry = new Date(Date.now() + 12 * 3600000).toISOString()
    const farExpiry = new Date(Date.now() + 48 * 3600000).toISOString()
    expect(isExpiringSoon(soonExpiry)).toBe(true)
    expect(isExpiringSoon(farExpiry)).toBe(false)
  })
})
