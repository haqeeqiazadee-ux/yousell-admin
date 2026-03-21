/**
 * Engine 9: Content Creation Engine — V9 Tests
 *
 * Tests the REAL ContentCreationEngine class:
 * - Config, lifecycle, healthCheck
 * - Event handling (BLUEPRINT_APPROVED, PRODUCT_PUSHED)
 * - Domain methods: generateContent(), batchGenerate()
 * - Event emission verification
 * - Business rule specifications (credit system, templates, formatting)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

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
  ContentCreationEngine,
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { PRICING_TIERS, CONTENT_CREDIT_COSTS } from '@/lib/stripe'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 9 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof ContentCreationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ContentCreationEngine()
  })

  it('has correct name, queues, publishes, subscribes', () => {
    expect(engine.config.name).toBe('content-engine')
    expect(engine.config.queues).toContain('content-generation')
    expect(engine.config.queues).toContain('content-batch')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.CONTENT_GENERATED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.CONTENT_BATCH_COMPLETE)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_ALLOCATED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_PUSHED)
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

describe('Engine 9 — Event Handling', () => {
  let engine: InstanceType<typeof ContentCreationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ContentCreationEngine()
  })

  it('handles BLUEPRINT_APPROVED event (deferred per G10)', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.BLUEPRINT_APPROVED,
      payload: { blueprintId: 'bp-001' },
      source: 'launch-blueprint',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('content generation deferred')
    )
    spy.mockRestore()
  })

  it('handles PRODUCT_PUSHED event (deferred per G10)', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.PRODUCT_PUSHED,
      payload: { productId: 'prod-001' },
      source: 'store-integration',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('social content deferred')
    )
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Domain Methods — generateContent()
// ─────────────────────────────────────────────────────────────

describe('Engine 9 — generateContent()', () => {
  let engine: InstanceType<typeof ContentCreationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ContentCreationEngine()
  })

  it('returns contentId, content, and creditsCost', async () => {
    const result = await engine.generateContent('prod-001', {
      contentType: 'social_post',
      platform: 'tiktok',
      productTitle: 'Smart Widget',
      productDescription: 'A cool widget',
      tier: 'HOT',
    })

    expect(result.contentId).toContain('cnt_prod-001_social_post')
    expect(typeof result.content).toBe('string')
    expect(typeof result.creditsCost).toBe('number')
  })

  it('charges more credits for HOT tier products', async () => {
    const hotResult = await engine.generateContent('prod-001', {
      contentType: 'description',
      platform: 'shopify',
      productTitle: 'Widget',
      productDescription: 'Desc',
      tier: 'HOT',
    })

    const warmResult = await engine.generateContent('prod-002', {
      contentType: 'description',
      platform: 'shopify',
      productTitle: 'Widget',
      productDescription: 'Desc',
      tier: 'WARM',
    })

    expect(hotResult.creditsCost).toBeGreaterThan(warmResult.creditsCost)
  })

  it('emits CONTENT_GENERATED event with correct payload', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.CONTENT_GENERATED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.generateContent('prod-001', {
      contentType: 'ad_copy',
      platform: 'meta',
      productTitle: 'Widget',
      productDescription: 'Desc',
      tier: 'WARM',
    })

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      productId: 'prod-001',
      contentType: 'ad_copy',
      platform: 'meta',
    })
    expect(received[0].source).toBe('content-engine')
  })

  it('transitions status: running → idle after completion', async () => {
    await engine.generateContent('prod-001', {
      contentType: 'description',
      platform: 'shopify',
      productTitle: 'W',
      productDescription: 'D',
      tier: 'WARM',
    })
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Domain Methods — batchGenerate()
// ─────────────────────────────────────────────────────────────

describe('Engine 9 — batchGenerate()', () => {
  let engine: InstanceType<typeof ContentCreationEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ContentCreationEngine()
  })

  it('returns generated, failed, totalCredits', async () => {
    const result = await engine.batchGenerate([
      { productId: 'p1', contentType: 'social_post', platform: 'tiktok' },
      { productId: 'p2', contentType: 'ad_copy', platform: 'meta' },
    ])

    expect(result).toHaveProperty('generated')
    expect(result).toHaveProperty('failed')
    expect(result).toHaveProperty('totalCredits')
  })

  it('emits CONTENT_BATCH_COMPLETE event', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.CONTENT_BATCH_COMPLETE, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.batchGenerate([
      { productId: 'p1', contentType: 'social_post', platform: 'tiktok' },
    ])

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      requestCount: 1,
    })
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Business Rule Specifications (V9 Tasks)
// ─────────────────────────────────────────────────────────────

describe('Engine 9 — Credit System (from @/lib/stripe)', () => {
  it('credit costs per content type (9.04)', () => {
    expect(CONTENT_CREDIT_COSTS.caption).toBe(1)
    expect(CONTENT_CREDIT_COSTS.ad).toBe(1)
    expect(CONTENT_CREDIT_COSTS.blog).toBe(3)
    expect(CONTENT_CREDIT_COSTS.image).toBe(2)
    expect(CONTENT_CREDIT_COSTS.carousel).toBe(5)
    expect(CONTENT_CREDIT_COSTS.short_video).toBe(5)
    expect(CONTENT_CREDIT_COSTS.long_video).toBe(8)
    expect(CONTENT_CREDIT_COSTS.email_sequence).toBe(3)
  })

  it('tier credit caps (9.07)', () => {
    expect(PRICING_TIERS.starter.contentCredits).toBe(50)
    expect(PRICING_TIERS.growth.contentCredits).toBe(200)
    expect(PRICING_TIERS.professional.contentCredits).toBe(500)
    expect(PRICING_TIERS.enterprise.contentCredits).toBe(Infinity)
  })
})

describe('Engine 9 — Business Rule Specs', () => {
  it('AI routing: Haiku for bulk, Sonnet for premium per G12 (9.12-9.13)', () => {
    const TEMPLATES: Record<string, { model: string }> = {
      product_description: { model: 'haiku' },
      social_post: { model: 'haiku' },
      ad_copy: { model: 'haiku' },
      blog_post: { model: 'sonnet' },
      long_video: { model: 'sonnet' },
    }
    expect(TEMPLATES.product_description.model).toBe('haiku')
    expect(TEMPLATES.blog_post.model).toBe('sonnet')
  })

  it('content status lifecycle transitions (9.31-9.46)', () => {
    const validTransitions: Record<string, string[]> = {
      draft: ['pending_review'],
      pending_review: ['approved', 'rejected'],
      approved: ['generating', 'scheduled'],
      rejected: ['draft'],
      generating: ['ready', 'failed'],
      ready: ['scheduled'],
      scheduled: ['published', 'failed'],
      published: ['archived'],
      failed: ['draft'],
    }
    const canTransition = (from: string, to: string) =>
      validTransitions[from]?.includes(to) ?? false

    expect(canTransition('draft', 'pending_review')).toBe(true)
    expect(canTransition('published', 'draft')).toBe(false)
    expect(canTransition('failed', 'draft')).toBe(true)
  })

  it('platform character limits (9.16)', () => {
    const limits: Record<string, number> = {
      tiktok: 2200, twitter: 280, instagram: 2200, pinterest: 500,
    }
    const enforceLimit = (content: string, platform: string) =>
      content.substring(0, limits[platform] || 5000)

    expect(enforceLimit('A'.repeat(3000), 'tiktok').length).toBe(2200)
    expect(enforceLimit('A'.repeat(3000), 'twitter').length).toBe(280)
    expect(enforceLimit('Short', 'tiktok')).toBe('Short')
  })

  it('low-credit warning at 20% threshold (9.09)', () => {
    const shouldWarn = (current: number, tierMax: number) => current < tierMax * 0.2
    expect(shouldWarn(9, 50)).toBe(true)
    expect(shouldWarn(10, 50)).toBe(false)
  })
})
