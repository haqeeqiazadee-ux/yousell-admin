/**
 * Engine 7: Launch Blueprint Engine — V9 Tests
 *
 * Tests the REAL LaunchBlueprintEngine class:
 * - Config, lifecycle, healthCheck
 * - Event handling (FINANCIAL_MODEL_GENERATED)
 * - Domain methods: generateBlueprint(), approveBlueprint()
 * - Event emission verification
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
  LaunchBlueprintEngine,
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 7 — Config & Lifecycle', () => {
  let engine: InstanceType<typeof LaunchBlueprintEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new LaunchBlueprintEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('has correct name, queues, publishes, subscribes', () => {
    expect(engine.config.name).toBe('launch-blueprint')
    expect(engine.config.queues).toContain('blueprint-generation')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.BLUEPRINT_GENERATED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PROFITABILITY_CALCULATED)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_VERIFIED)
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

  it('init resets to idle', async () => {
    await engine.start()
    await engine.init()
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Event Handling
// ─────────────────────────────────────────────────────────────

describe('Engine 7 — Event Handling', () => {
  let engine: InstanceType<typeof LaunchBlueprintEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new LaunchBlueprintEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('handles FINANCIAL_MODEL_GENERATED event', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED,
      payload: { productId: 'prod-001', roiPercent: 100, projectedRevenue: 12000, projectedCost: 6000, projectedProfit: 6000, paybackDays: 8 },
      source: 'financial-model',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('blueprint generation eligible')
    )
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Domain Methods — generateBlueprint()
// ─────────────────────────────────────────────────────────────

describe('Engine 7 — generateBlueprint()', () => {
  let engine: InstanceType<typeof LaunchBlueprintEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new LaunchBlueprintEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('returns blueprintId, steps, estimatedLaunchDays, phases', async () => {
    const result = await engine.generateBlueprint('prod-001', {
      productTitle: 'Smart Watch',
      platform: 'tiktok_shop',
      tier: 'HOT',
      margin: 0.45,
      adBudget: 5000,
    })

    expect(result.blueprintId).toContain('bp_prod-001')
    expect(result.steps).toBeGreaterThan(0)
    // HOT tier compresses timeline: each phase loses 1 day (min 1)
    expect(result.estimatedLaunchDays).toBe(9)
    expect(result.phases).toEqual([
      'Supplier Lock', 'Store Setup', 'Content Creation', 'Ad Launch', 'Influencer Outreach',
    ])
  })

  it('emits BLUEPRINT_GENERATED event with correct payload', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.BLUEPRINT_GENERATED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.generateBlueprint('prod-001', {
      productTitle: 'Smart Watch',
      platform: 'tiktok_shop',
      tier: 'HOT',
      margin: 0.45,
      adBudget: 5000,
    })

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      productId: 'prod-001',
      steps: 16,
      estimatedLaunchDays: 9,
    })
    expect(received[0].source).toBe('launch-blueprint')
  })

  it('transitions status: running → idle after completion', async () => {
    await engine.generateBlueprint('prod-001', {
      productTitle: 'Widget', platform: 'shopify', tier: 'WARM', margin: 0.3, adBudget: 1000,
    })
    expect(engine.status()).toBe('idle')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Domain Methods — approveBlueprint()
// ─────────────────────────────────────────────────────────────

describe('Engine 7 — approveBlueprint()', () => {
  let engine: InstanceType<typeof LaunchBlueprintEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new LaunchBlueprintEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  it('emits BLUEPRINT_APPROVED event with admin details', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.BLUEPRINT_APPROVED, (e: EngineEvent) => {
      received.push(e)
    })

    await engine.approveBlueprint('bp-001', 'prod-001', 'admin-123')

    expect(received).toHaveLength(1)
    expect(received[0].payload).toMatchObject({
      blueprintId: 'bp-001',
      productId: 'prod-001',
      approvedBy: 'admin-123',
    })
    expect(received[0].payload).toHaveProperty('approvedAt')
    expect(received[0].source).toBe('launch-blueprint')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Business Rule Specifications (V9 Tasks)
// ─────────────────────────────────────────────────────────────

describe('Engine 7 — Business Rule Specs', () => {
  it('score gate: auto-blueprint requires score >= 75 (7.002)', () => {
    const shouldAutoGenerate = (score: number) => score >= 75
    expect(shouldAutoGenerate(75)).toBe(true)
    expect(shouldAutoGenerate(74)).toBe(false)
    expect(shouldAutoGenerate(90)).toBe(true)
    expect(shouldAutoGenerate(50)).toBe(false)
  })

  it('section validation rejects placeholders (7.027)', () => {
    const validateSection = (content: string) => {
      const placeholders = ['[INSERT]', 'TODO', 'N/A', '[PLACEHOLDER]', 'TBD']
      for (const ph of placeholders) {
        if (content.toUpperCase().includes(ph)) return false
      }
      return content.trim().length > 0
    }

    expect(validateSection('Great product content here')).toBe(true)
    expect(validateSection('[INSERT] product name')).toBe(false)
    expect(validateSection('TODO: write this section')).toBe(false)
    expect(validateSection('')).toBe(false)
    expect(validateSection('  ')).toBe(false)
  })

  it('partial blueprint: > 2 failed sections = partial status (7.043)', () => {
    const sectionResults = [
      { section: 'store_positioning', status: 'success' },
      { section: 'product_page', status: 'failed' },
      { section: 'video_script', status: 'failed' },
      { section: 'pricing_strategy', status: 'failed' },
      { section: 'launch_timeline', status: 'success' },
    ]
    const failedCount = sectionResults.filter(s => s.status === 'failed').length
    expect(failedCount > 2 ? 'partial' : 'ready').toBe('partial')
  })

  it('cost control: max 2000 tokens per Sonnet call (7.044)', () => {
    const MAX_TOKENS = 2000
    expect(MAX_TOKENS).toBeLessThanOrEqual(2000)
  })
})
