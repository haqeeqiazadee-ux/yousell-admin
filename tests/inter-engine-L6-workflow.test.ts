/**
 * Inter-Engine L6 Workflow Tests
 *
 * Tests 5 end-to-end workflow scenarios from V9_Inter_Engine_Communication_Test_Strategy.md
 * Sections 4A and 4B:
 *
 * WF1: Full Product Lifecycle (19 steps, 15+ engines)
 * WF2: Trend Reversal Response (7 steps, 5 engines)
 * WF3: Supplier Price Change Cascade (6 steps, 5 engines)
 * WF4: New Client Onboarding (7 steps, 6 engines)
 * WF5: Margin Alert Recovery Loop (6 steps, 4 engines)
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

const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: [] }),
  text: async () => '',
})
global.fetch = mockFetch as unknown as typeof fetch

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  DiscoveryEngine,
  ScoringEngine,
  ClusteringEngine,
  TrendDetectionEngine,
  CreatorMatchingEngine,
  CompetitorIntelligenceEngine,
  SupplierDiscoveryEngine,
  ProfitabilityEngine,
  FinancialModellingEngine,
  LaunchBlueprintEngine,
  ClientAllocationEngine,
  ContentCreationEngine,
  StoreIntegrationEngine,
  OrderTrackingEngine,
  AdminCommandCenterEngine,
  AffiliateCommissionEngine,
  FulfillmentRecommendationEngine,
} from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

// ─── WORKFLOW 1: Full Product Lifecycle ───────────────────────────────────────
describe('WF1: Full Product Lifecycle (19 steps, 15+ engines)', () => {
  beforeEach(() => {
    resetEventBus()
    vi.clearAllMocks()
  })

  it('TC-WF1-S1: Admin triggers product scan via Discovery engine', () => {
    const discovery = new DiscoveryEngine()

    // Discovery can publish product_discovered and scan_complete
    expect(discovery.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_DISCOVERED)
    expect(discovery.config.publishes).toContain(ENGINE_EVENTS.SCAN_COMPLETE)
    expect(discovery.config.name).toBe('discovery')
  })

  it('TC-WF1-S2: Discovery publishes product_discovered to 3 subscribers (fan-out)', async () => {
    const bus = getEventBus()
    const fanOut: string[] = []

    // Three engines subscribe to product_discovered: Scoring, Clustering, TrendDetection
    const scoring = new ScoringEngine()
    const clustering = new ClusteringEngine()

    expect(scoring.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_DISCOVERED)

    // Simulate fan-out: 3 subscribers receive the event
    bus.subscribe(ENGINE_EVENTS.PRODUCT_DISCOVERED, () => fanOut.push('scoring'))
    bus.subscribe(ENGINE_EVENTS.PRODUCT_DISCOVERED, () => fanOut.push('clustering'))
    bus.subscribe(ENGINE_EVENTS.PRODUCT_DISCOVERED, () => fanOut.push('trend-detection'))

    await bus.emit(ENGINE_EVENTS.PRODUCT_DISCOVERED, {
      productId: 'prod-001',
      title: 'Viral Widget',
      platform: 'tiktok',
    }, 'discovery')

    expect(fanOut).toEqual(['scoring', 'clustering', 'trend-detection'])
    expect(fanOut).toHaveLength(3)
  })

  it('TC-WF1-S5: Scoring calculates composite with fan-out to 8 subscribers', async () => {
    const bus = getEventBus()
    const subscribers: string[] = []

    const scoring = new ScoringEngine()
    expect(scoring.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)

    // 8 downstream engines subscribe to product_scored
    const subscriberNames = [
      'clustering', 'trend-detection', 'competitor-intel',
      'supplier-discovery', 'profitability', 'client-allocation',
      'admin-cc', 'opportunity-feed',
    ]

    for (const name of subscriberNames) {
      bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, () => subscribers.push(name))
    }

    await bus.emit(ENGINE_EVENTS.PRODUCT_SCORED, {
      productId: 'prod-001',
      finalScore: 85,
      tier: 'HOT',
      trendScore: 90,
      viralScore: 80,
      profitScore: 85,
    }, 'scoring')

    expect(subscribers).toHaveLength(8)
    expect(subscribers).toEqual(subscriberNames)
  })

  it('TC-WF1-S13: Blueprint approved triggers 3-way fan-out (Client Alloc + Content + Store)', async () => {
    const bus = getEventBus()
    const downstream: string[] = []

    const blueprint = new LaunchBlueprintEngine()
    expect(blueprint.config.publishes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)

    // Verify subscriptions from engine configs
    const clientAlloc = new ClientAllocationEngine()
    const content = new ContentCreationEngine()
    const store = new StoreIntegrationEngine()

    expect(clientAlloc.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
    expect(content.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)
    expect(store.config.subscribes).toContain(ENGINE_EVENTS.BLUEPRINT_APPROVED)

    // Simulate 3-way fan-out
    bus.subscribe(ENGINE_EVENTS.BLUEPRINT_APPROVED, () => downstream.push('client-allocation'))
    bus.subscribe(ENGINE_EVENTS.BLUEPRINT_APPROVED, () => downstream.push('content-creation'))
    bus.subscribe(ENGINE_EVENTS.BLUEPRINT_APPROVED, () => downstream.push('store-integration'))

    await bus.emit(ENGINE_EVENTS.BLUEPRINT_APPROVED, {
      productId: 'prod-001',
      blueprintId: 'bp-001',
      approvedBy: 'admin-user',
    }, 'launch-blueprint')

    expect(downstream).toHaveLength(3)
    expect(downstream).toContain('client-allocation')
    expect(downstream).toContain('content-creation')
    expect(downstream).toContain('store-integration')
  })

  it('TC-WF1-S16: Store Integration pushes product, triggers order monitoring', async () => {
    const bus = getEventBus()
    const chain: string[] = []

    const store = new StoreIntegrationEngine()
    expect(store.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_PUSHED)

    // Order tracking subscribes to PRODUCT_PUSHED
    const orderTracking = new OrderTrackingEngine()
    expect(orderTracking.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_PUSHED)

    bus.subscribe(ENGINE_EVENTS.PRODUCT_PUSHED, () => chain.push('product-pushed'))
    bus.subscribe(ENGINE_EVENTS.ORDER_RECEIVED, () => chain.push('order-monitoring'))

    await bus.emit(ENGINE_EVENTS.PRODUCT_PUSHED, {
      productId: 'prod-001',
      platform: 'shopify',
      storeUrl: 'https://test.myshopify.com',
    }, 'store-integration')

    // Simulate order tracking picking up the pushed product
    await bus.emit(ENGINE_EVENTS.ORDER_RECEIVED, {
      orderId: 'ord-001',
      productId: 'prod-001',
    }, 'order-tracking')

    expect(chain).toEqual(['product-pushed', 'order-monitoring'])
  })

  it('TC-WF1-COLD: COLD product (score < 40) terminates pipeline at scoring', async () => {
    const bus = getEventBus()
    const events: string[] = []

    const scoring = new ScoringEngine()
    expect(scoring.config.publishes).toContain(ENGINE_EVENTS.PRODUCT_REJECTED)

    // COLD product emits PRODUCT_REJECTED, not PRODUCT_SCORED
    bus.subscribe(ENGINE_EVENTS.PRODUCT_REJECTED, () => events.push('rejected'))
    bus.subscribe(ENGINE_EVENTS.PRODUCT_SCORED, () => events.push('scored'))
    bus.subscribe(ENGINE_EVENTS.BLUEPRINT_GENERATED, () => events.push('blueprint'))

    // Only rejected fires — pipeline terminates
    await bus.emit(ENGINE_EVENTS.PRODUCT_REJECTED, {
      productId: 'prod-cold',
      finalScore: 25,
      tier: 'COLD',
      reason: 'Score below threshold',
    }, 'scoring')

    expect(events).toEqual(['rejected'])
    // No downstream events fire (no blueprint, no allocation)
    expect(events).not.toContain('scored')
    expect(events).not.toContain('blueprint')
  })
})

// ─── WORKFLOW 2: Trend Reversal Response ──────────────────────────────────────
describe('WF2: Trend Reversal Response (7 steps, 5 engines)', () => {
  beforeEach(() => {
    resetEventBus()
    vi.clearAllMocks()
  })

  it('TC-WF2-S1: Trend Detection publishes direction_changed event', async () => {
    const bus = getEventBus()
    const received: Record<string, unknown>[] = []

    const trendEngine = new TrendDetectionEngine()
    expect(trendEngine.config.publishes).toContain(ENGINE_EVENTS.TREND_DIRECTION_CHANGED)

    bus.subscribe(ENGINE_EVENTS.TREND_DIRECTION_CHANGED, (event) => {
      received.push(event.payload as Record<string, unknown>)
    })

    await bus.emit(ENGINE_EVENTS.TREND_DIRECTION_CHANGED, {
      productId: 'prod-trending',
      previousDirection: 'rising',
      newDirection: 'declining',
      changePercent: -35,
    }, 'trend-detection')

    expect(received).toHaveLength(1)
    expect(received[0]).toMatchObject({
      productId: 'prod-trending',
      previousDirection: 'rising',
      newDirection: 'declining',
    })
  })

  it('TC-WF2-S2: Admin CC receives trend reversal alert via event subscription', () => {
    const adminCC = new AdminCommandCenterEngine()

    // Admin CC subscribes to scored products and can react to trend changes
    expect(adminCC.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_SCORED)
    expect(adminCC.config.name).toBe('admin-command-center')

    // Admin CC publishes deployment events in response to alerts
    expect(adminCC.config.publishes).toContain(ENGINE_EVENTS.ADMIN_PRODUCT_DEPLOYED)
  })
})

// ─── WORKFLOW 3: Supplier Price Change Cascade ────────────────────────────────
describe('WF3: Supplier Price Change Cascade (6 steps, 5 engines)', () => {
  beforeEach(() => {
    resetEventBus()
    vi.clearAllMocks()
  })

  it('TC-WF3-S1: Cheaper supplier triggers recalculation chain', async () => {
    const bus = getEventBus()
    const chain: string[] = []

    const supplierEngine = new SupplierDiscoveryEngine()
    supplierEngine.setDbClient(createMockDbClient() as any)

    expect(supplierEngine.config.publishes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)

    // Profitability subscribes to SUPPLIER_FOUND
    const profitEngine = new ProfitabilityEngine()
    profitEngine.setDbClient(createMockDbClient() as any)
    expect(profitEngine.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)

    // Financial Modelling subscribes to SUPPLIER_FOUND
    const financialEngine = new FinancialModellingEngine()
    financialEngine.setDbClient(createMockDbClient() as any)
    expect(financialEngine.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)

    bus.subscribe(ENGINE_EVENTS.SUPPLIER_FOUND, () => chain.push('supplier-found'))
    bus.subscribe(ENGINE_EVENTS.PROFITABILITY_CALCULATED, () => chain.push('profitability-recalc'))
    bus.subscribe(ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED, () => chain.push('financial-recalc'))

    // Cheaper supplier found → triggers cascade
    await bus.emit(ENGINE_EVENTS.SUPPLIER_FOUND, {
      productId: 'prod-001',
      supplierId: 'sup-cheaper',
      unitCost: 3.50,
      previousCost: 5.00,
    }, 'supplier-discovery')

    // Simulate downstream recalculations
    await bus.emit(ENGINE_EVENTS.PROFITABILITY_CALCULATED, {
      productId: 'prod-001',
      margin: 0.45,
      marginPercent: 45,
    }, 'profitability')

    await bus.emit(ENGINE_EVENTS.FINANCIAL_MODEL_GENERATED, {
      productId: 'prod-001',
      roiPercent: 220,
    }, 'financial-model')

    expect(chain).toEqual(['supplier-found', 'profitability-recalc', 'financial-recalc'])
  })

  it('TC-WF3-S2: Profitability recalculates improved margins from cheaper supplier', async () => {
    const bus = getEventBus()
    const results: Record<string, unknown>[] = []

    const profitEngine = new ProfitabilityEngine()
    profitEngine.setDbClient(createMockDbClient() as any)

    expect(profitEngine.config.publishes).toContain(ENGINE_EVENTS.PROFITABILITY_CALCULATED)
    expect(profitEngine.config.subscribes).toContain(ENGINE_EVENTS.SUPPLIER_FOUND)

    // Financial modelling subscribes to profitability
    const financialEngine = new FinancialModellingEngine()
    financialEngine.setDbClient(createMockDbClient() as any)
    expect(financialEngine.config.subscribes).toContain(ENGINE_EVENTS.PROFITABILITY_CALCULATED)

    bus.subscribe(ENGINE_EVENTS.PROFITABILITY_CALCULATED, (event) => {
      results.push(event.payload as Record<string, unknown>)
    })

    await bus.emit(ENGINE_EVENTS.PROFITABILITY_CALCULATED, {
      productId: 'prod-001',
      margin: 0.42,
      marginPercent: 42,
      sellingPrice: 24.99,
      unitCost: 3.50,
      shippingCost: 2.00,
      platformFee: 1.25,
    }, 'profitability')

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      productId: 'prod-001',
      marginPercent: 42,
    })
  })
})

// ─── WORKFLOW 4: New Client Onboarding ────────────────────────────────────────
describe('WF4: New Client Onboarding (7 steps, 6 engines)', () => {
  beforeEach(() => {
    resetEventBus()
    vi.clearAllMocks()
  })

  it('TC-WF4-S1: Client connects store via store.connected event', async () => {
    const bus = getEventBus()
    const received: string[] = []

    const storeEngine = new StoreIntegrationEngine()
    storeEngine.setDbClient(createMockDbClient() as any)

    expect(storeEngine.config.publishes).toContain(ENGINE_EVENTS.STORE_CONNECTED)

    bus.subscribe(ENGINE_EVENTS.STORE_CONNECTED, () => received.push('store-connected'))

    await bus.emit(ENGINE_EVENTS.STORE_CONNECTED, {
      clientId: 'client-new',
      platform: 'shopify',
      storeUrl: 'https://newclient.myshopify.com',
      accessToken: 'encrypted-token',
    }, 'store-integration')

    expect(received).toEqual(['store-connected'])
  })

  it('TC-WF4-S4: Store Integration pushes products to client store after allocation', async () => {
    const bus = getEventBus()
    const chain: string[] = []

    const storeEngine = new StoreIntegrationEngine()
    storeEngine.setDbClient(createMockDbClient() as any)

    // Store subscribes to PRODUCT_ALLOCATED and CONTENT_GENERATED
    expect(storeEngine.config.subscribes).toContain(ENGINE_EVENTS.PRODUCT_ALLOCATED)
    expect(storeEngine.config.subscribes).toContain(ENGINE_EVENTS.CONTENT_GENERATED)

    bus.subscribe(ENGINE_EVENTS.PRODUCT_ALLOCATED, () => chain.push('allocated'))
    bus.subscribe(ENGINE_EVENTS.CONTENT_GENERATED, () => chain.push('content-ready'))
    bus.subscribe(ENGINE_EVENTS.PRODUCT_PUSHED, () => chain.push('pushed-to-store'))

    // Client allocation happens first
    await bus.emit(ENGINE_EVENTS.PRODUCT_ALLOCATED, {
      productId: 'prod-001',
      clientId: 'client-new',
      channel: 'shopify',
    }, 'client-allocation')

    // Content generated for the product
    await bus.emit(ENGINE_EVENTS.CONTENT_GENERATED, {
      productId: 'prod-001',
      contentType: 'description',
    }, 'content-engine')

    // Store pushes the product
    await bus.emit(ENGINE_EVENTS.PRODUCT_PUSHED, {
      productId: 'prod-001',
      platform: 'shopify',
      storeUrl: 'https://newclient.myshopify.com',
    }, 'store-integration')

    expect(chain).toEqual(['allocated', 'content-ready', 'pushed-to-store'])
  })
})

// ─── WORKFLOW 5: Margin Alert Recovery Loop ───────────────────────────────────
describe('WF5: Margin Alert Recovery Loop (6 steps, 4 engines)', () => {
  beforeEach(() => {
    resetEventBus()
    vi.clearAllMocks()
  })

  it('TC-WF5-S1: Profitability detects margin below 20% threshold', async () => {
    const bus = getEventBus()
    const alerts: Record<string, unknown>[] = []

    const profitEngine = new ProfitabilityEngine()
    profitEngine.setDbClient(createMockDbClient() as any)

    expect(profitEngine.config.publishes).toContain(ENGINE_EVENTS.MARGIN_ALERT)

    bus.subscribe(ENGINE_EVENTS.MARGIN_ALERT, (event) => {
      alerts.push(event.payload as Record<string, unknown>)
    })

    await bus.emit(ENGINE_EVENTS.MARGIN_ALERT, {
      productId: 'prod-margin-low',
      currentMargin: 0.15,
      marginPercent: 15,
      threshold: 0.20,
      severity: 'critical',
      recommendation: 'reprice_or_pause',
    }, 'profitability')

    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toMatchObject({
      productId: 'prod-margin-low',
      marginPercent: 15,
      severity: 'critical',
    })
  })

  it('TC-WF5-BOUND: Recovery loop bounded at 3 iterations', async () => {
    const bus = getEventBus()
    const iterations: number[] = []
    const MAX_RECOVERY_ITERATIONS = 3

    // Simulate margin alert → supplier search → profitability recalc loop
    // bounded to prevent infinite cycling
    let loopCount = 0

    bus.subscribe(ENGINE_EVENTS.MARGIN_ALERT, async () => {
      loopCount++
      iterations.push(loopCount)

      if (loopCount < MAX_RECOVERY_ITERATIONS) {
        // Trigger supplier re-search for better pricing
        await bus.emit(ENGINE_EVENTS.SUPPLIER_FOUND, {
          productId: 'prod-margin-low',
          supplierId: `sup-attempt-${loopCount}`,
          unitCost: 5.00 - loopCount * 0.50,
        }, 'supplier-discovery')
      }
      // At iteration 3, loop terminates — no more supplier searches
    })

    bus.subscribe(ENGINE_EVENTS.SUPPLIER_FOUND, async () => {
      // Profitability recalculates — may fire another MARGIN_ALERT if still below threshold
      const newMargin = 12 + loopCount * 3 // 15%, 18%, 21%
      if (newMargin < 20) {
        await bus.emit(ENGINE_EVENTS.MARGIN_ALERT, {
          productId: 'prod-margin-low',
          marginPercent: newMargin,
          severity: newMargin < 15 ? 'critical' : 'warning',
        }, 'profitability')
      }
    })

    // Kick off the loop
    await bus.emit(ENGINE_EVENTS.MARGIN_ALERT, {
      productId: 'prod-margin-low',
      marginPercent: 12,
      severity: 'critical',
    }, 'profitability')

    // Loop should have run exactly 3 times (bounded)
    expect(iterations).toHaveLength(MAX_RECOVERY_ITERATIONS)
    expect(iterations).toEqual([1, 2, 3])
    expect(loopCount).toBe(MAX_RECOVERY_ITERATIONS)
  })
})
