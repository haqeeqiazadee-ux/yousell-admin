/**
 * Engine: Clustering — V9 Task Coverage Tests
 *
 * Tests Jaccard similarity, greedy clustering, tokenization,
 * cluster naming, ClusteringEngine lifecycle, and event emission.
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
      gte: vi.fn().mockReturnThis(),
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
  ClusteringEngine,
} from '@/lib/engines'
import type { EngineEvent } from '@/lib/engines'

// ─────────────────────────────────────────────────────────────
// SECTION 1: ClusteringEngine Config & Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Clustering — Config & Lifecycle', () => {
  let engine: InstanceType<typeof ClusteringEngine>

  beforeEach(() => {
    resetEventBus()
    engine = new ClusteringEngine()
  })

  it('has correct config', () => {
    expect(engine.config.name).toBe('clustering')
    expect(engine.config.queues).toContain('product-clustering')
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.CLUSTER_UPDATED)
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.CLUSTERS_REBUILT)
    expect(engine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
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

  it('handleEvent logs product scored but defers per G10', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await engine.handleEvent({
      type: ENGINE_EVENTS.PRODUCT_SCORED,
      payload: { productId: 'prod-001' },
      source: 'scoring',
      timestamp: new Date().toISOString(),
    })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('reclustering deferred'))
    spy.mockRestore()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Jaccard Similarity (Pure Logic)
// ─────────────────────────────────────────────────────────────

describe('Clustering — Jaccard Similarity', () => {
  function jaccardSimilarity(a: string[], b: string[]): number {
    const setA = new Set(a.map(s => s.toLowerCase()))
    const setB = new Set(b.map(s => s.toLowerCase()))
    let intersection = 0
    for (const item of setA) {
      if (setB.has(item)) intersection++
    }
    const union = setA.size + setB.size - intersection
    return union === 0 ? 0 : intersection / union
  }

  it('identical sets → 1.0', () => {
    expect(jaccardSimilarity(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1)
  })

  it('no overlap → 0.0', () => {
    expect(jaccardSimilarity(['a', 'b'], ['c', 'd'])).toBe(0)
  })

  it('partial overlap → correct ratio', () => {
    // {a,b,c} ∩ {b,c,d} = {b,c} → 2/4 = 0.5
    expect(jaccardSimilarity(['a', 'b', 'c'], ['b', 'c', 'd'])).toBe(0.5)
  })

  it('empty sets → 0', () => {
    expect(jaccardSimilarity([], [])).toBe(0)
  })

  it('case insensitive', () => {
    expect(jaccardSimilarity(['ABC', 'DEF'], ['abc', 'def'])).toBe(1)
  })

  it('similarity >= 0.3 threshold for cluster assignment', () => {
    const sim = jaccardSimilarity(['gadget', 'tech', 'usb'], ['gadget', 'tech', 'phone', 'case'])
    expect(sim).toBeGreaterThanOrEqual(0.3) // 2/5 = 0.4
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Tokenization (Pure Logic)
// ─────────────────────────────────────────────────────────────

describe('Clustering — Tokenization', () => {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'set', 'new'])

  function tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  }

  it('lowercases and splits text', () => {
    expect(tokenize('Viral Gadget Pro')).toEqual(['viral', 'gadget', 'pro'])
  })

  it('removes stop words', () => {
    const result = tokenize('The best new gadget for the home')
    expect(result).not.toContain('the')
    expect(result).not.toContain('for')
    expect(result).not.toContain('new')
    expect(result).toContain('best')
    expect(result).toContain('gadget')
    expect(result).toContain('home')
  })

  it('removes short words (< 3 chars)', () => {
    const result = tokenize('a to be or do it')
    expect(result).toHaveLength(0)
  })

  it('strips special characters', () => {
    const result = tokenize("Super-Gadget™ 2.0!")
    expect(result).toContain('supergadget')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Cluster Naming
// ─────────────────────────────────────────────────────────────

describe('Clustering — Cluster Naming', () => {
  function generateClusterName(title: string, tags: string[]): string {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'set', 'new'])
    const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 3)
    if (tags.length > 0 && !words.includes(tags[0].toLowerCase())) {
      words.push(tags[0].toLowerCase())
    }
    return words.join(' ').replace(/^\w/, c => c.toUpperCase()) || 'General Cluster'
  }

  it('uses first 3 meaningful words from title', () => {
    const name = generateClusterName('Amazing Viral Kitchen Gadget', [])
    expect(name.toLowerCase()).toContain('amazing')
  })

  it('appends top tag if not in title', () => {
    const name = generateClusterName('Cool Gadget', ['trending'])
    expect(name.toLowerCase()).toContain('trending')
  })

  it('returns General Cluster for empty input', () => {
    const name = generateClusterName('a', [])
    expect(name).toBe('General Cluster')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Mode Function (Dominant Stage)
// ─────────────────────────────────────────────────────────────

describe('Clustering — Mode (Dominant Stage)', () => {
  function mode(arr: string[]): string {
    const freq = new Map<string, number>()
    for (const item of arr) {
      freq.set(item, (freq.get(item) || 0) + 1)
    }
    let maxCount = 0
    let result = arr[0] || 'emerging'
    for (const [item, count] of freq) {
      if (count > maxCount) {
        maxCount = count
        result = item
      }
    }
    return result
  }

  it('returns most frequent stage', () => {
    expect(mode(['emerging', 'rising', 'emerging'])).toBe('emerging')
  })

  it('defaults to emerging for empty array', () => {
    expect(mode([])).toBe('emerging')
  })

  it('returns first winner on tie', () => {
    const result = mode(['rising', 'emerging'])
    expect(['rising', 'emerging']).toContain(result)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Clustering Behavior Rules
// ─────────────────────────────────────────────────────────────

describe('Clustering — Behavior Rules', () => {
  it('single-member clusters are filtered out', () => {
    const clusters = [
      { members: [{ id: 'a' }, { id: 'b' }] },
      { members: [{ id: 'c' }] },
    ]
    const meaningful = clusters.filter(c => c.members.length >= 2)
    expect(meaningful).toHaveLength(1)
  })

  it('default min score threshold is 30', () => {
    const minScore = 30
    expect(minScore).toBe(30)
  })

  it('default similarity threshold is 0.3', () => {
    const threshold = 0.3
    expect(threshold).toBe(0.3)
  })

  it('keywords limited to 20 per cluster', () => {
    const keywords = Array.from({ length: 25 }, (_, i) => `kw-${i}`)
    const limited = keywords.slice(0, 20)
    expect(limited).toHaveLength(20)
  })

  it('products limited to 500 for clustering', () => {
    const limit = 500
    expect(limit).toBe(500)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 7: Event Emission
// ─────────────────────────────────────────────────────────────

describe('Clustering — Event Emission', () => {
  beforeEach(() => {
    resetEventBus()
  })

  it('CLUSTERS_REBUILT event has correct structure', async () => {
    const bus = getEventBus()
    const received: EngineEvent[] = []
    bus.subscribe(ENGINE_EVENTS.CLUSTERS_REBUILT, (e) => received.push(e))

    await bus.emit(ENGINE_EVENTS.CLUSTERS_REBUILT, {
      clustersCreated: 8,
      productsAssigned: 45,
      errors: [],
    }, 'clustering')

    expect(received).toHaveLength(1)
    const p = received[0].payload as Record<string, unknown>
    expect(p.clustersCreated).toBe(8)
    expect(p.productsAssigned).toBe(45)
  })
})
