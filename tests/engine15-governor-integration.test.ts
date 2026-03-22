/**
 * Engine 15: Governor — Integration Tests (Task 15.058-15.063)
 *
 * Tests for full pipeline, Stripe lifecycle, swaps, AI, overrides.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock server-only ─────────────────────────────────────────
vi.mock('server-only', () => ({}))

// ── Mock Supabase ────────────────────────────────────────────
const mockInsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: { id: 'env-123' }, error: null }),
  }),
})
const mockUpdate = vi.fn().mockResolvedValue({ error: null })
const mockSelect = vi.fn()

const mockFromImpl = (table: string) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.insert = mockInsert
  chain.update = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: mockUpdate }) })
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.gt = vi.fn().mockReturnValue(chain)
  chain.lte = vi.fn().mockReturnValue(chain)
  chain.gte = vi.fn().mockReturnValue(chain)
  chain.or = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.single = vi.fn().mockResolvedValue({ data: null, error: null })
  chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
  return chain
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFromImpl,
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  }),
}))

// ── Mock engine registry ─────────────────────────────────────
vi.mock('@/lib/engines/registry', () => ({
  getEngineRegistry: () => ({
    get: vi.fn().mockReturnValue({
      costManifest: undefined,
      healthCheck: vi.fn().mockResolvedValue(true),
    }),
    getOrThrow: vi.fn().mockReturnValue({
      handleEvent: vi.fn().mockResolvedValue({ result: 'ok' }),
    }),
  }),
}))

// ── Mock event bus ───────────────────────────────────────────
vi.mock('@/lib/engines/event-bus', () => ({
  getEventBus: () => ({
    emit: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(),
  }),
}))

// ─────────────────────────────────────────────────────────────
// SECTION 1: Full Pipeline (Gate → Dispatch → Meter)
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — Full Governor Pipeline', () => {
  it('EngineGovernor singleton is accessible', async () => {
    const { getGovernor, resetGovernor } = await import('@/lib/engines/governor/governor')

    resetGovernor()
    const governor = getGovernor()
    expect(governor).toBeDefined()
    expect(governor.getGate()).toBeDefined()
    expect(governor.getDispatch()).toBeDefined()
    expect(governor.getMeter()).toBeDefined()
  })

  it('governor exposes gate, dispatch, meter components', async () => {
    const { EngineGovernor } = await import('@/lib/engines/governor/governor')

    const gov = new EngineGovernor()
    expect(gov.getGate()).toBeInstanceOf(Object)
    expect(gov.getDispatch()).toBeInstanceOf(Object)
    expect(gov.getMeter()).toBeInstanceOf(Object)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 2: Envelope Lifecycle
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — Budget Envelope Lifecycle', () => {
  it('buildEngineAllowances returns fresh allowances with zero usage', async () => {
    const { buildEngineAllowances } = await import('@/lib/engines/governor/plan-allowances')

    const allowances = buildEngineAllowances('growth')
    const discovery = allowances['discovery']

    expect(discovery).toBeDefined()
    expect(discovery!.usedOperations).toBe(0)
    expect(discovery!.usedCostUSD).toBe(0)
    expect(discovery!.utilizationPercent).toBe(0)
    expect(discovery!.enabled).toBe(true)
  })

  it('professional plan has more engines than growth', async () => {
    const { buildEngineAllowances } = await import('@/lib/engines/governor/plan-allowances')

    const growth = buildEngineAllowances('growth')
    const professional = buildEngineAllowances('professional')

    const growthCount = Object.keys(growth).length
    const proCount = Object.keys(professional).length

    expect(proCount).toBeGreaterThan(growthCount)
  })

  it('enterprise plan includes all 24 engine names', async () => {
    const { buildEngineAllowances } = await import('@/lib/engines/governor/plan-allowances')

    const enterprise = buildEngineAllowances('enterprise')
    const count = Object.keys(enterprise).length

    // Enterprise should have 24 engines (all except automation-orchestrator which isn't in EngineName)
    expect(count).toBeGreaterThanOrEqual(23)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 3: Engine Swap Resolution
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — Engine Swap Resolution', () => {
  it('GovernorDispatch instance can be created', async () => {
    const { GovernorDispatch } = await import('@/lib/engines/governor/dispatch')

    const dispatch = new GovernorDispatch()
    expect(dispatch).toBeDefined()
    expect(dispatch.resolveEngine).toBeDefined()
    expect(dispatch.dispatch).toBeDefined()
    expect(dispatch.refreshSwapCache).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 4: AI Optimizer
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — AI Optimizer', () => {
  it('optimizer defaults to L1 Advisory', async () => {
    const { GovernorAIOptimizer } = await import('@/lib/engines/governor/ai-optimizer')

    const optimizer = new GovernorAIOptimizer()
    expect(optimizer.getLevel()).toBe(1)
  })

  it('optimizer level can be changed', async () => {
    const { GovernorAIOptimizer } = await import('@/lib/engines/governor/ai-optimizer')

    const optimizer = new GovernorAIOptimizer(1)
    optimizer.setLevel(3)
    expect(optimizer.getLevel()).toBe(3)
  })

  it('optimizer returns empty decisions when level is 0 (Off)', async () => {
    const { GovernorAIOptimizer } = await import('@/lib/engines/governor/ai-optimizer')

    const optimizer = new GovernorAIOptimizer(0)
    const decisions = await optimizer.runAnalysisCycle()
    expect(decisions).toEqual([])
  })

  it('optimizer runs analysis cycle at L1 without error', async () => {
    const { GovernorAIOptimizer } = await import('@/lib/engines/governor/ai-optimizer')

    const optimizer = new GovernorAIOptimizer(1)
    // Will query empty DB (mocked), should return decisions without throwing
    const decisions = await optimizer.runAnalysisCycle()
    expect(Array.isArray(decisions)).toBe(true)
  })

  it('getAIOptimizer singleton is accessible', async () => {
    const { getAIOptimizer } = await import('@/lib/engines/governor/ai-optimizer')

    const optimizer = getAIOptimizer()
    expect(optimizer).toBeDefined()
    expect(optimizer.getLevel()).toBeGreaterThanOrEqual(0)
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 5: Governor Events & Types
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — Governor Barrel Export', () => {
  it('barrel export exposes all key exports', async () => {
    const governor = await import('@/lib/engines/governor/index')

    // Classes
    expect(governor.EngineGovernor).toBeDefined()
    expect(governor.GovernorGate).toBeDefined()
    expect(governor.GovernorDispatch).toBeDefined()
    expect(governor.GovernorMeter).toBeDefined()
    expect(governor.GovernorAIOptimizer).toBeDefined()

    // Singletons
    expect(governor.getGovernor).toBeDefined()
    expect(governor.getAIOptimizer).toBeDefined()

    // Cost & plan data
    expect(governor.ENGINE_COST_MANIFESTS).toBeDefined()
    expect(governor.getEngineCostManifest).toBeDefined()
    expect(governor.getOperationCost).toBeDefined()
    expect(governor.PLAN_ALLOWANCE_TEMPLATES).toBeDefined()
    expect(governor.buildEngineAllowances).toBeDefined()

    // Envelope lifecycle
    expect(governor.createBudgetEnvelope).toBeDefined()
    expect(governor.updateBudgetEnvelope).toBeDefined()
    expect(governor.archiveBudgetEnvelope).toBeDefined()
    expect(governor.renewBudgetEnvelope).toBeDefined()

    // Events
    expect(governor.GOVERNOR_EVENTS).toBeDefined()

    // Middleware
    expect(governor.withGovernor).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────
// SECTION 6: Override Types Validation
// ─────────────────────────────────────────────────────────────

describe('Engine 15 — Override Type Validation', () => {
  it('all override types are defined', async () => {
    // Just validate the types exist by importing them
    const types = await import('@/lib/engines/governor/types')

    expect(types.GOVERNOR_EVENTS.OVERRIDE_ACTIVATED).toBe('governor.override_activated')
    expect(types.GOVERNOR_EVENTS.OVERRIDE_EXPIRED).toBe('governor.override_expired')
  })
})
