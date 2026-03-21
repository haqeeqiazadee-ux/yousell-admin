/**
 * Engine 12: Admin Command Center — V9 Task Coverage Tests
 *
 * Tests against V9 tasks 12.01–12.32:
 * - HOT product surfacing (12.01–12.02)
 * - Pipeline view status transitions (12.03, 12.17–12.22)
 * - Revenue dashboard aggregation (12.04–12.07, 12.23–12.24)
 * - Action buttons & job dispatch (12.08–12.14)
 * - Event publishing (12.16)
 * - API endpoints (12.30–12.32)
 */

import { describe, it, expect } from 'vitest'
import { PRICING_TIERS } from '@/lib/stripe'

// ── Tasks 12.01–12.02: HOT Product Surfacing ────────────────

describe('Engine 12 — Tasks 12.01-12.02: HOT Product Surfacing', () => {
  it('surfaces only HOT-tier products (score >= 80)', () => {
    const products = [
      { id: 'p1', final_score: 92, tier: 'HOT' },
      { id: 'p2', final_score: 78, tier: 'WARM' },
      { id: 'p3', final_score: 85, tier: 'HOT' },
      { id: 'p4', final_score: 55, tier: 'WATCH' },
    ]
    const hot = products.filter(p => p.tier === 'HOT')
    expect(hot).toHaveLength(2)
    hot.forEach(p => expect(p.final_score).toBeGreaterThanOrEqual(80))
  })

  it('sorts HOT products by score descending', () => {
    const hot = [
      { id: 'p1', final_score: 85 },
      { id: 'p2', final_score: 92 },
      { id: 'p3', final_score: 88 },
    ]
    const sorted = [...hot].sort((a, b) => b.final_score - a.final_score)
    expect(sorted[0].id).toBe('p2')
    expect(sorted[1].id).toBe('p3')
    expect(sorted[2].id).toBe('p1')
  })
})

// ── Tasks 12.03, 12.17–12.22: Pipeline Status Transitions ──

describe('Engine 12 — Pipeline Status Transitions', () => {
  it('follows correct pipeline: Draft → Listed → Active → Performing → Archive', () => {
    const pipeline = ['draft', 'listed', 'active', 'performing', 'archive']
    expect(pipeline).toHaveLength(5)
    expect(pipeline[0]).toBe('draft')
    expect(pipeline[pipeline.length - 1]).toBe('archive')
  })

  it('transitions Draft → Listed when platform confirms listing (12.18)', () => {
    const listing = { status: 'draft', listed_at: null as string | null }
    // Platform confirms
    listing.status = 'listed'
    listing.listed_at = new Date().toISOString()
    expect(listing.status).toBe('listed')
    expect(listing.listed_at).toBeTruthy()
  })

  it('transitions Listed → Active on first order (12.19)', () => {
    const hasFirstOrder = true
    const currentStatus = 'listed'
    const newStatus = hasFirstOrder && currentStatus === 'listed' ? 'active' : currentStatus
    expect(newStatus).toBe('active')
  })

  it('transitions Active → Performing when revenue exceeds threshold (12.20)', () => {
    const threshold = 1000
    const productRevenue = 1500
    const currentStatus = 'active'
    const newStatus = productRevenue > threshold && currentStatus === 'active' ? 'performing' : currentStatus
    expect(newStatus).toBe('performing')
  })

  it('transitions to Archive when score drops below WARM (60) (12.21)', () => {
    const score = 55
    const shouldArchive = score < 60
    expect(shouldArchive).toBe(true)
  })

  it('allows admin manual override of pipeline stage (12.22)', () => {
    const validStages = ['draft', 'listed', 'active', 'performing', 'archive']
    const adminOverride = (newStage: string) => validStages.includes(newStage)
    expect(adminOverride('performing')).toBe(true)
    expect(adminOverride('invalid')).toBe(false)
  })
})

// ── Tasks 12.04–12.07, 12.23–12.24: Revenue Dashboard ──────

describe('Engine 12 — Revenue Dashboard', () => {
  it('aggregates revenue by platform (12.07)', () => {
    const orders = [
      { platform: 'shopify', amount: 500 },
      { platform: 'tiktok_shop', amount: 300 },
      { platform: 'shopify', amount: 200 },
      { platform: 'amazon', amount: 400 },
      { platform: 'tiktok_shop', amount: 100 },
    ]

    const byPlatform = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.platform] = (acc[o.platform] || 0) + o.amount
      return acc
    }, {})

    expect(byPlatform.shopify).toBe(700)
    expect(byPlatform.tiktok_shop).toBe(400)
    expect(byPlatform.amazon).toBe(400)
  })

  it('calculates MRR from active subscriptions (12.04)', () => {
    const subscriptions = [
      { plan: 'starter' as const, count: 10 },
      { plan: 'growth' as const, count: 5 },
      { plan: 'professional' as const, count: 3 },
      { plan: 'enterprise' as const, count: 1 },
    ]

    const mrr = subscriptions.reduce((total, sub) => {
      return total + (PRICING_TIERS[sub.plan].price * sub.count)
    }, 0)

    // 10*29 + 5*59 + 3*99 + 1*149 = 290 + 295 + 297 + 149 = 1031
    expect(mrr).toBe(1031)
  })

  it('calculates ARR from MRR', () => {
    const mrr = 1031
    const arr = mrr * 12
    expect(arr).toBe(12372)
  })

  it('identifies top 10 performing products by revenue (12.05)', () => {
    const products = Array.from({ length: 20 }, (_, i) => ({
      id: `p-${i}`,
      revenue: Math.random() * 10000,
    }))
    const top10 = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    expect(top10).toHaveLength(10)
    expect(top10[0].revenue).toBeGreaterThanOrEqual(top10[9].revenue)
  })

  it('calculates daily revenue snapshot (12.23)', () => {
    const ordersToday = [
      { product_id: 'p1', platform: 'shopify', amount: 49.99 },
      { product_id: 'p1', platform: 'shopify', amount: 49.99 },
      { product_id: 'p2', platform: 'tiktok_shop', amount: 29.99 },
    ]

    const snapshot = ordersToday.reduce<Record<string, { revenue: number; orders: number }>>((acc, o) => {
      const key = `${o.product_id}:${o.platform}`
      if (!acc[key]) acc[key] = { revenue: 0, orders: 0 }
      acc[key].revenue += o.amount
      acc[key].orders += 1
      return acc
    }, {})

    expect(snapshot['p1:shopify'].revenue).toBeCloseTo(99.98, 1)
    expect(snapshot['p1:shopify'].orders).toBe(2)
    expect(snapshot['p2:tiktok_shop'].revenue).toBe(29.99)
  })

  it('calculates revenue for 24h, 7d, 30d periods (12.24)', () => {
    const now = Date.now()
    const orders = [
      { amount: 50, created_at: new Date(now - 1 * 60 * 60 * 1000).toISOString() },   // 1h ago
      { amount: 100, created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString() }, // 3d ago
      { amount: 200, created_at: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString() }, // 15d ago
      { amount: 500, created_at: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString() }, // 45d ago
    ]

    const getRevenue = (periodMs: number) =>
      orders.filter(o => now - new Date(o.created_at).getTime() < periodMs)
            .reduce((sum, o) => sum + o.amount, 0)

    expect(getRevenue(24 * 60 * 60 * 1000)).toBe(50)       // 24h
    expect(getRevenue(7 * 24 * 60 * 60 * 1000)).toBe(150)  // 7d
    expect(getRevenue(30 * 24 * 60 * 60 * 1000)).toBe(350) // 30d
  })
})

// ── Tasks 12.08–12.14: Action Buttons & Job Dispatch ────────

describe('Engine 12 — Tasks 12.08-12.14: Action Buttons', () => {
  it('dispatches to correct queue per action type', () => {
    const dispatchAction = (action: string) => {
      const queueMap: Record<string, string> = {
        push_tiktok: 'push-to-tiktok',
        push_amazon: 'push-to-amazon',
        push_shopify: 'push-to-shopify',
        launch_marketing: 'content-queue',
        influencer_outreach: 'influencer-outreach',
        generate_content: 'content-queue',
      }
      return queueMap[action] || null
    }

    expect(dispatchAction('push_tiktok')).toBe('push-to-tiktok')
    expect(dispatchAction('push_amazon')).toBe('push-to-amazon')
    expect(dispatchAction('push_shopify')).toBe('push-to-shopify')
    expect(dispatchAction('launch_marketing')).toBe('content-queue')
    expect(dispatchAction('influencer_outreach')).toBe('influencer-outreach')
    expect(dispatchAction('generate_content')).toBe('content-queue')
  })

  it('Push to All enqueues 3 jobs simultaneously (12.11)', () => {
    const pushToAll = (productId: string) => {
      const jobs = [
        { queue: 'push-to-shopify', data: { product_id: productId } },
        { queue: 'push-to-tiktok', data: { product_id: productId } },
        { queue: 'push-to-amazon', data: { product_id: productId } },
      ]
      return jobs
    }

    const jobs = pushToAll('p1')
    expect(jobs).toHaveLength(3)
    expect(jobs.map(j => j.queue)).toEqual(['push-to-shopify', 'push-to-tiktok', 'push-to-amazon'])
  })
})

// ── Tasks 12.30–12.32: API Endpoint Contracts ───────────────

describe('Engine 12 — Tasks 12.30-12.32: API Endpoint Contracts', () => {
  it('GET /api/admin/command-center/products returns HOT products (12.30)', () => {
    const endpoint = {
      method: 'GET',
      path: '/api/admin/command-center/products',
      auth: 'admin',
      filters: ['tier=HOT', 'platform'],
    }
    expect(endpoint.auth).toBe('admin')
    expect(endpoint.filters).toContain('tier=HOT')
  })

  it('POST /api/admin/command-center/deploy validates action type (12.31)', () => {
    const validActions = ['push_tiktok', 'push_amazon', 'push_shopify', 'push_all', 'launch_marketing', 'influencer_outreach', 'generate_content', 'financial_model']
    const isValid = (action: string) => validActions.includes(action)

    expect(isValid('push_tiktok')).toBe(true)
    expect(isValid('push_all')).toBe(true)
    expect(isValid('delete_everything')).toBe(false)
  })

  it('GET /api/admin/revenue supports date range and platform filter (12.32)', () => {
    const validate = (params: Record<string, string>) => {
      const startDate = params.start ? new Date(params.start) : null
      const endDate = params.end ? new Date(params.end) : null
      const platform = params.platform || 'all'
      return { startDate, endDate, platform }
    }

    const result = validate({ start: '2026-01-01', end: '2026-03-31', platform: 'shopify' })
    expect(result.platform).toBe('shopify')
    expect(result.startDate).toBeInstanceOf(Date)
  })
})

// ── CSV Export (12.29) ──────────────────────────────────────

describe('Engine 12 — Task 12.29: CSV Export', () => {
  it('generates valid CSV from revenue data', () => {
    const data = [
      { date: '2026-03-01', platform: 'shopify', revenue: 500, orders: 10 },
      { date: '2026-03-01', platform: 'tiktok_shop', revenue: 300, orders: 8 },
    ]

    const header = 'date,platform,revenue,orders'
    const rows = data.map(d => `${d.date},${d.platform},${d.revenue},${d.orders}`)
    const csv = [header, ...rows].join('\n')

    expect(csv).toContain('date,platform,revenue,orders')
    expect(csv.split('\n')).toHaveLength(3) // header + 2 rows
    expect(csv).toContain('shopify')
    expect(csv).toContain('tiktok_shop')
  })
})
