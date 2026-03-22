/**
 * Engine 15: Governor — Unit Tests (Task 15.055-15.057)
 *
 * Tests for Gate, Dispatch, Meter pipeline components.
 * Tests against V9 tasks 15.009–15.013.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock server-only ─────────────────────────────────────────
vi.mock('server-only', () => ({}))

// ── Mock Supabase ────────────────────────────────────────────
const mockFrom = vi.fn()
const mockSupabase = {
  from: mockFrom,
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}))

// ── Mock engine registry ─────────────────────────────────────
const mockRegistry = {
  get: vi.fn(),
  getOrThrow: vi.fn(),
}

vi.mock('@/lib/engines/registry', () => ({
  getEngineRegistry: () => mockRegistry,
}))

// ── Mock event bus ───────────────────────────────────────────
vi.mock('@/lib/engines/event-bus', () => ({
  getEventBus: () => ({
    emit: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(),
  }),
}))

// ── Import after mocks ──────────────────────────────────────
import { GovernorGate } from '@/lib/engines/governor/gate'
import { GovernorDispatch } from '@/lib/engines/governor/dispatch'
import { GovernorMeter } from '@/lib/engines/governor/meter'

// ── Helper: mock Supabase chain ─────────────────────────────
function mockChain(data: unknown = null, error: unknown = null) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.update = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.gt = vi.fn().mockReturnValue(chain)
  chain.lte = vi.fn().mockReturnValue(chain)
  chain.gte = vi.fn().mockReturnValue(chain)
  chain.or = vi.fn().mockReturnValue(chain)
  chain.is = vi.fn().mockReturnValue(chain)
  chain.in = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockResolvedValue({ data, error })
  chain.maybeSingle = vi.fn().mockResolvedValue({ data, error })
  chain.order = vi.fn().mockReturnValue(chain)
  return chain
}

// ─────────────────────────────────────────────────────────────
// SECTION 1: GovernorGate Tests
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — GovernorGate', () => {
  let gate: GovernorGate

  beforeEach(() => {
    gate = new GovernorGate()
    vi.clearAllMocks()
  })

  it('denies when no active envelope exists', async () => {
    // Override check returns null, envelope returns null
    const overrideChain = mockChain(null)
    const envelopeChain = mockChain(null)
    const calls: string[] = []

    mockFrom.mockImplementation((table: string) => {
      calls.push(table)
      if (table === 'governor_overrides') return overrideChain
      if (table === 'engine_budget_envelopes') return envelopeChain
      return mockChain()
    })

    const result = await gate.check('client-1', 'discovery', 'scan_quick')

    expect(result.allowed).toBe(false)
    expect(result.code).toBe('NOT_IN_PLAN')
  })

  it('allows when envelope exists and engine is enabled with quota', async () => {
    const overrideChain = mockChain(null)
    const envelopeChain = mockChain({
      engine_allowances: {
        discovery: {
          engineName: 'discovery',
          enabled: true,
          maxOperations: 100,
          usedOperations: 10,
          maxCostUSD: 5.00,
          usedCostUSD: 1.00,
          utilizationPercent: 10,
        },
      },
      total_spent_usd: 2.00,
      global_cost_cap_usd: 15.00,
      alert_throttle_percent: 95,
    })
    const toggleChain = mockChain({ enabled: true })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'governor_overrides') return overrideChain
      if (table === 'engine_budget_envelopes') return envelopeChain
      if (table === 'engine_toggles') return toggleChain
      return mockChain()
    })

    // Mock healthy engine
    mockRegistry.get.mockReturnValue({
      healthCheck: vi.fn().mockResolvedValue(true),
    })

    const result = await gate.check('client-1', 'discovery', 'scan_quick')

    expect(result.allowed).toBe(true)
  })

  it('denies when engine not in plan', async () => {
    const overrideChain = mockChain(null)
    const envelopeChain = mockChain({
      plan_tier: 'starter',
      engine_allowances: {
        discovery: { engineName: 'discovery', enabled: true, maxOperations: 30, usedOperations: 0, maxCostUSD: 3, usedCostUSD: 0 },
      },
      total_spent_usd: 0,
      global_cost_cap_usd: 5.00,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'governor_overrides') return overrideChain
      if (table === 'engine_budget_envelopes') return envelopeChain
      return mockChain()
    })

    // content-engine not in starter plan envelope
    const result = await gate.check('client-1', 'content-engine', 'generate_caption')

    expect(result.allowed).toBe(false)
    expect(result.code).toBe('NOT_IN_PLAN')
  })

  it('denies when quota exceeded', async () => {
    const overrideChain = mockChain(null)
    const envelopeChain = mockChain({
      engine_allowances: {
        discovery: {
          engineName: 'discovery',
          enabled: true,
          maxOperations: 30,
          usedOperations: 30, // Exhausted
          maxCostUSD: 3.00,
          usedCostUSD: 1.00,
        },
      },
      total_spent_usd: 2.00,
      global_cost_cap_usd: 5.00,
    })
    const toggleChain = mockChain({ enabled: true })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'governor_overrides') return overrideChain
      if (table === 'engine_budget_envelopes') return envelopeChain
      if (table === 'engine_toggles') return toggleChain
      return mockChain()
    })

    const result = await gate.check('client-1', 'discovery', 'scan_quick')

    expect(result.allowed).toBe(false)
    expect(result.code).toBe('QUOTA_EXCEEDED')
  })

  it('allows when override is active', async () => {
    const overrideChain = mockChain({
      id: 'override-1',
      type: 'client_bypass',
      active: true,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'governor_overrides') return overrideChain
      return mockChain()
    })

    const result = await gate.check('client-1', 'discovery', 'scan_quick')

    expect(result.allowed).toBe(true)
  })

  it('denies when global cost cap exceeded', async () => {
    const overrideChain = mockChain(null)
    const envelopeChain = mockChain({
      engine_allowances: {
        discovery: {
          engineName: 'discovery',
          enabled: true,
          maxOperations: 100,
          usedOperations: 10,
          maxCostUSD: 5.00,
          usedCostUSD: 1.00,
        },
      },
      total_spent_usd: 5.00,  // At cap
      global_cost_cap_usd: 5.00,
    })
    const toggleChain = mockChain({ enabled: true })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'governor_overrides') return overrideChain
      if (table === 'engine_budget_envelopes') return envelopeChain
      if (table === 'engine_toggles') return toggleChain
      return mockChain()
    })

    const result = await gate.check('client-1', 'discovery', 'scan_quick')

    expect(result.allowed).toBe(false)
    expect(result.code).toBe('BUDGET_EXCEEDED')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: GovernorDispatch Tests
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — GovernorDispatch', () => {
  let dispatch: GovernorDispatch

  beforeEach(() => {
    dispatch = new GovernorDispatch()
    vi.clearAllMocks()
  })

  it('resolves engine without swap', async () => {
    // Mock empty swap table
    const swapChain = mockChain(null)
    swapChain.select = vi.fn().mockReturnValue(swapChain)
    swapChain.eq = vi.fn().mockReturnValue(swapChain)
    // Override the final result to be an array (data)
    const selectResult = { data: [], error: null }
    swapChain.eq = vi.fn().mockResolvedValue(selectResult)

    mockFrom.mockImplementation(() => swapChain)

    const resolved = await dispatch.resolveEngine('discovery')
    expect(resolved).toBe('discovery')
  })

  it('dispatches to engine and returns result with duration', async () => {
    // Mock empty swap table
    mockFrom.mockImplementation(() => {
      const chain = mockChain()
      chain.eq = vi.fn().mockResolvedValue({ data: [], error: null })
      return chain
    })

    // Mock engine in registry
    mockRegistry.getOrThrow.mockReturnValue({
      handleEvent: vi.fn().mockResolvedValue({ products: [] }),
    })

    const result = await dispatch.dispatch(
      'discovery', 'scan_quick', { platform: 'tiktok' },
      { clientId: 'c1', userId: 'u1', correlationId: 'corr-1' }
    )

    expect(result.success).toBe(true)
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('returns error result when engine throws', async () => {
    mockFrom.mockImplementation(() => {
      const chain = mockChain()
      chain.eq = vi.fn().mockResolvedValue({ data: [], error: null })
      return chain
    })

    mockRegistry.getOrThrow.mockReturnValue({
      handleEvent: vi.fn().mockRejectedValue(new Error('Engine failure')),
    })

    const result = await dispatch.dispatch(
      'discovery', 'scan_quick', {},
      { clientId: 'c1', userId: 'u1', correlationId: 'corr-1' }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('Engine failure')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: GovernorMeter Tests
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — GovernorMeter', () => {
  let meter: GovernorMeter

  beforeEach(() => {
    meter = new GovernorMeter()
    vi.clearAllMocks()
  })

  it('records usage to ledger', async () => {
    const insertChain = mockChain(null)
    const envelopeChain = mockChain({
      id: 'env-1',
      engine_allowances: {
        discovery: { usedOperations: 5, usedCostUSD: 0.5, maxOperations: 100 },
      },
      total_spent_usd: 1.00,
      global_cost_cap_usd: 15.00,
      alert_warn_percent: 80,
      alert_throttle_percent: 95,
    })
    const updateChain = mockChain(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'engine_usage_ledger') return insertChain
      if (table === 'engine_budget_envelopes') {
        // First call is select, second is update
        return { ...envelopeChain, ...updateChain }
      }
      return mockChain()
    })

    await meter.record({
      clientId: 'c1',
      engineName: 'discovery',
      operation: 'scan_quick',
      costUSD: 0.10,
      timestamp: new Date().toISOString(),
      durationMs: 250,
      success: true,
      correlationId: 'corr-1',
    })

    // Verify insert was called on ledger
    expect(mockFrom).toHaveBeenCalledWith('engine_usage_ledger')
    expect(insertChain.insert).toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: Cost Manifests Tests
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — Cost Manifests', () => {
  it('has manifests for core engines', async () => {
    const { ENGINE_COST_MANIFESTS, getOperationCost } = await import('@/lib/engines/governor/cost-manifests')

    expect(ENGINE_COST_MANIFESTS['discovery']).toBeDefined()
    expect(ENGINE_COST_MANIFESTS['scoring']).toBeDefined()
    expect(ENGINE_COST_MANIFESTS['content-engine']).toBeDefined()
    expect(ENGINE_COST_MANIFESTS['store-integration']).toBeDefined()
  })

  it('discovery scan_quick costs $0.10', async () => {
    const { getOperationCost } = await import('@/lib/engines/governor/cost-manifests')

    const cost = getOperationCost('discovery', 'scan_quick')
    expect(cost).toBeDefined()
    expect(cost!.baseCostUSD).toBe(0.10)
    expect(cost!.costTier).toBe('low')
  })

  it('content-engine generate_video costs $0.25', async () => {
    const { getOperationCost } = await import('@/lib/engines/governor/cost-manifests')

    const cost = getOperationCost('content-engine', 'generate_video')
    expect(cost).toBeDefined()
    expect(cost!.baseCostUSD).toBe(0.25)
    expect(cost!.costTier).toBe('high')
  })

  it('scoring score_single is free tier', async () => {
    const { getOperationCost } = await import('@/lib/engines/governor/cost-manifests')

    const cost = getOperationCost('scoring', 'score_single')
    expect(cost).toBeDefined()
    expect(cost!.baseCostUSD).toBe(0.001)
    expect(cost!.costTier).toBe('free')
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Plan Allowances Tests
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — Plan Allowances', () => {
  it('starter plan has 5 engines enabled', async () => {
    const { buildEngineAllowances } = await import('@/lib/engines/governor/plan-allowances')

    const allowances = buildEngineAllowances('starter')
    const enabled = Object.values(allowances).filter(a => a?.enabled)
    expect(enabled.length).toBe(5)
  })

  it('enterprise plan has all engines unlimited', async () => {
    const { buildEngineAllowances } = await import('@/lib/engines/governor/plan-allowances')

    const allowances = buildEngineAllowances('enterprise')
    const enabled = Object.values(allowances).filter(a => a?.enabled)
    expect(enabled.length).toBeGreaterThanOrEqual(20)

    // All should be unlimited
    for (const a of enabled) {
      expect(a!.maxOperations).toBe(-1)
      expect(a!.maxCostUSD).toBe(-1)
    }
  })

  it('growth plan includes content-engine', async () => {
    const { buildEngineAllowances } = await import('@/lib/engines/governor/plan-allowances')

    const allowances = buildEngineAllowances('growth')
    expect(allowances['content-engine']).toBeDefined()
    expect(allowances['content-engine']!.enabled).toBe(true)
  })

  it('starter plan does NOT include content-engine', async () => {
    const { buildEngineAllowances } = await import('@/lib/engines/governor/plan-allowances')

    const allowances = buildEngineAllowances('starter')
    expect(allowances['content-engine']).toBeUndefined()
  })

  it('global cost caps match architecture spec', async () => {
    const { getPlanGlobalCostCap } = await import('@/lib/engines/governor/plan-allowances')

    expect(getPlanGlobalCostCap('starter')).toBe(5.00)
    expect(getPlanGlobalCostCap('growth')).toBe(15.00)
    expect(getPlanGlobalCostCap('professional')).toBe(40.00)
    expect(getPlanGlobalCostCap('enterprise')).toBe(100.00)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Governor Types Tests
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — Governor Types & Constants', () => {
  it('GOVERNOR_EVENTS has all required event types', async () => {
    const { GOVERNOR_EVENTS } = await import('@/lib/engines/governor/types')

    expect(GOVERNOR_EVENTS.REQUEST_DENIED).toBe('governor.request_denied')
    expect(GOVERNOR_EVENTS.USAGE_RECORDED).toBe('governor.usage_recorded')
    expect(GOVERNOR_EVENTS.BUDGET_WARN).toBe('governor.budget_warn')
    expect(GOVERNOR_EVENTS.BUDGET_BLOCKED).toBe('governor.budget_blocked')
    expect(GOVERNOR_EVENTS.ENGINE_SWAPPED).toBe('governor.engine_swapped')
    expect(GOVERNOR_EVENTS.AI_SUGGESTION).toBe('governor.ai_suggestion')
    expect(GOVERNOR_EVENTS.OVERRIDE_ACTIVATED).toBe('governor.override_activated')
  })
})
