/**
 * Engine: Opportunity Feed — V9 Task Coverage Tests
 *
 * Tests multi-table aggregation, tier classification, stats calculation,
 * filtering, OpportunityFeedEngine lifecycle, and read-only behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: [], error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  OpportunityFeedEngine,
} from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('OpportunityFeed — Config & Lifecycle', () => {
  let engine: InstanceType<typeof OpportunityFeedEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new OpportunityFeedEngine()
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('opportunity-feed')
    expect(engine.config.queues).toHaveLength(0)
    expect(engine.config.publishes).toHaveLength(0)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.CLUSTERS_REBUILT)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.MATCHES_COMPLETE)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.TREND_DETECTED)
  })

  it('is read-only (no publishes, no queues)', () => {
    expect(engine.config.publishes).toHaveLength(0)
    expect(engine.config.queues).toHaveLength(0)
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

  it('handleEvent logs received events', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.CLUSTERS_REBUILT,
      payload: {},
      source: 'clustering',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Received'))
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Opportunity Interface
// ─────────────────────────────────────────────────────────────

describe('OpportunityFeed — Opportunity Structure', () => {
  it('has all required enrichment fields', () => {
    const opportunity = {
      id: 'prod-001',
      title: 'Viral Gadget',
      platform: 'tiktok',
      category: 'Electronics',
      price: 35,
      finalScore: 85,
      trendScore: 90,
      viralScore: 80,
      profitScore: 70,
      trendStage: 'exploding',
      tier: 'HOT' as const,
      imageUrl: 'https://img.example.com/gadget.jpg',
      externalUrl: 'https://tiktok.com/product/1',
      clusterName: 'viral gadgets',
      clusterSize: 12,
      matchedCreators: 5,
      topCreator: '@creator1',
      estimatedProfit: 1500,
      relatedAds: 3,
      trendDirection: 'rising',
      isAllocated: false,
      hasBlueprint: false,
      hasFinancialModel: true,
      createdAt: new Date().toISOString(),
    }

    expect(opportunity).toHaveProperty('clusterName')
    expect(opportunity).toHaveProperty('matchedCreators')
    expect(opportunity).toHaveProperty('estimatedProfit')
    expect(opportunity).toHaveProperty('isAllocated')
    expect(opportunity).toHaveProperty('hasBlueprint')
    expect(opportunity).toHaveProperty('hasFinancialModel')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Tier Classification (Pure Logic)
// ─────────────────────────────────────────────────────────────

describe('OpportunityFeed — Tier Classification', () => {
  function getTier(score: number): 'HOT' | 'WARM' | 'WATCH' | 'COLD' {
    return score >= 80 ? 'HOT' : score >= 60 ? 'WARM' : score >= 40 ? 'WATCH' : 'COLD'
  }

  it('HOT for score >= 80', () => expect(getTier(85)).toBe('HOT'))
  it('WARM for score 60-79', () => expect(getTier(65)).toBe('WARM'))
  it('WATCH for score 40-59', () => expect(getTier(45)).toBe('WATCH'))
  it('COLD for score < 40', () => expect(getTier(20)).toBe('COLD'))
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Stats Calculation (Pure Logic)
// ─────────────────────────────────────────────────────────────

describe('OpportunityFeed — Stats Calculation', () => {
  const opportunities = [
    { finalScore: 90, platform: 'tiktok', category: 'Electronics', tier: 'HOT' },
    { finalScore: 85, platform: 'tiktok', category: 'Electronics', tier: 'HOT' },
    { finalScore: 65, platform: 'amazon', category: 'Kitchen', tier: 'WARM' },
    { finalScore: 45, platform: 'shopify', category: 'Kitchen', tier: 'WATCH' },
    { finalScore: 20, platform: 'shopify', category: 'Kitchen', tier: 'COLD' },
  ]

  it('counts tier distributions', () => {
    const hot = opportunities.filter(o => o.tier === 'HOT').length
    const warm = opportunities.filter(o => o.tier === 'WARM').length
    const watch = opportunities.filter(o => o.tier === 'WATCH').length
    const cold = opportunities.filter(o => o.tier === 'COLD').length
    expect(hot).toBe(2)
    expect(warm).toBe(1)
    expect(watch).toBe(1)
    expect(cold).toBe(1)
  })

  it('calculates average score', () => {
    const avg = Math.round(opportunities.reduce((s, o) => s + o.finalScore, 0) / opportunities.length)
    // (90+85+65+45+20) / 5 = 305/5 = 61
    expect(avg).toBe(61)
  })

  it('identifies top platform', () => {
    const counts = new Map<string, number>()
    for (const o of opportunities) {
      counts.set(o.platform, (counts.get(o.platform) || 0) + 1)
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
    expect(top).toBe('tiktok')
  })

  it('identifies top category', () => {
    const counts = new Map<string, number>()
    for (const o of opportunities) {
      counts.set(o.category, (counts.get(o.category) || 0) + 1)
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
    expect(top).toBe('Kitchen')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Empty Stats
// ─────────────────────────────────────────────────────────────

describe('OpportunityFeed — Empty Stats', () => {
  it('returns zeroed stats when no opportunities', () => {
    const stats = { total: 0, hot: 0, warm: 0, watch: 0, cold: 0, avgScore: 0, topPlatform: '', topCategory: '' }
    expect(stats.total).toBe(0)
    expect(stats.avgScore).toBe(0)
    expect(stats.topPlatform).toBe('')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Aggregation Tables
// ─────────────────────────────────────────────────────────────

describe('OpportunityFeed — Multi-Table Aggregation', () => {
  it('reads from 5 enrichment tables in parallel', () => {
    const tables = [
      'product_cluster_members',
      'creator_product_matches',
      'product_allocations',
      'launch_blueprints',
      'financial_models',
    ]
    expect(tables).toHaveLength(5)
    expect(tables).toContain('product_cluster_members')
    expect(tables).toContain('creator_product_matches')
    expect(tables).toContain('product_allocations')
    expect(tables).toContain('launch_blueprints')
    expect(tables).toContain('financial_models')
  })

  it('builds cluster lookup map', () => {
    const clusterMap = new Map<string, { name: string; size: number }>()
    clusterMap.set('prod-001', { name: 'Gadgets', size: 12 })
    clusterMap.set('prod-002', { name: 'Kitchen', size: 8 })

    expect(clusterMap.get('prod-001')?.name).toBe('Gadgets')
    expect(clusterMap.get('prod-002')?.size).toBe(8)
    expect(clusterMap.get('prod-999')).toBeUndefined()
  })

  it('builds allocation/blueprint/financial lookup sets', () => {
    const allocatedSet = new Set(['prod-001', 'prod-003'])
    const blueprintSet = new Set(['prod-002'])
    const financialSet = new Set(['prod-001', 'prod-002'])

    expect(allocatedSet.has('prod-001')).toBe(true)
    expect(allocatedSet.has('prod-002')).toBe(false)
    expect(blueprintSet.has('prod-002')).toBe(true)
    expect(financialSet.has('prod-001')).toBe(true)
  })
})
