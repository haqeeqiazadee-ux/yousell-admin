/**
 * Inter-Engine: Affiliate Commission Producer Gaps (Batch 2.10)
 *
 * Verifies Affiliate Commission produces data consumed by:
 * - Comm 18.004: Financial Modelling reads commission data for cost projections
 * - Comm 18.006: Profitability reads for net margin deduction
 * - Commission events: commission_recorded and payout_calculated
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
      upsert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
    })),
  }),
}))

import {
  getEventBus,
  resetEventBus,
  ENGINE_EVENTS,
  AffiliateCommissionEngine,
} from '@/lib/engines'
import { createMockDbClient } from './helpers/mock-db'

describe('Inter-Engine: Affiliate Commission Producer', () => {
  let engine: InstanceType<typeof AffiliateCommissionEngine>

  beforeEach(() => {
    resetEventBus()
    vi.clearAllMocks()
    engine = new AffiliateCommissionEngine()
    engine.setDbClient(createMockDbClient() as any)
  })

  // Comm 18.004: Financial Modelling reads commission data
  it('TC-18.004: publishes COMMISSION_RECORDED for Financial Modelling (Comm 18.004)', () => {
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.COMMISSION_RECORDED)
  })

  // Comm 18.006: Profitability reads for margin deduction
  it('TC-18.006: publishes PAYOUT_CALCULATED for Profitability (Comm 18.006)', () => {
    expect(engine.config.publishes).toContain(ENGINE_EVENTS.PAYOUT_CALCULATED)
  })

  // Commission event delivery
  it('TC-18.004a: commission_recorded event is receivable by downstream engines', async () => {
    const bus = getEventBus()
    const events: unknown[] = []
    bus.subscribe(ENGINE_EVENTS.COMMISSION_RECORDED, (e) => events.push(e))

    await bus.emit(ENGINE_EVENTS.COMMISSION_RECORDED, {
      orderId: 'ord-1',
      affiliateId: 'aff-1',
      amount: 15.00,
      type: 'platform',
    }, 'affiliate-engine' as any)

    expect(events.length).toBe(1)
    expect((events[0] as any).payload.amount).toBe(15.00)
  })
})
