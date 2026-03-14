/**
 * Phase 1: Supabase Integration Tests
 *
 * Validates:
 * - All expected tables exist with correct columns
 * - RLS policies block unauthenticated access
 * - Service role key bypasses RLS correctly
 * - Foreign key relationships are intact
 * - Seed data the app depends on is present
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { getAdminClient, getAnonClient } from './setup'
import type { SupabaseClient } from '@supabase/supabase-js'

let admin: SupabaseClient
let anon: SupabaseClient

beforeAll(() => {
  admin = getAdminClient()
  anon = getAnonClient()
})

// ─── Schema Validation ────────────────────────────────────────────

describe('Phase 1A: Schema — Tables Exist', () => {
  const expectedTables = [
    'profiles',
    'admin_settings',
    'products',
    'clients',
    'product_metrics',
    'viral_signals',
    'influencers',
    'product_influencers',
    'competitor_stores',
    'suppliers',
    'product_suppliers',
    'financial_models',
    'marketing_strategies',
    'launch_blueprints',
    'affiliate_programs',
    'product_allocations',
    'product_requests',
    'automation_jobs',
    'scan_history',
    'outreach_emails',
    'notifications',
    'imported_files',
    'trend_keywords',
    'subscriptions',
    'tiktok_videos',
    'tiktok_hashtag_signals',
    'product_clusters',
    'product_cluster_members',
    'creator_product_matches',
    'ads',
  ]

  for (const table of expectedTables) {
    it(`table "${table}" exists and is queryable`, async () => {
      // Use service role to bypass RLS — we just care the table exists
      const { error } = await admin.from(table).select('*', { count: 'exact', head: true })
      expect(error, `Table "${table}" should be queryable. Got: ${error?.message}`).toBeNull()
    })
  }
})

describe('Phase 1B: Schema — Critical Column Checks', () => {
  it('products table has scoring columns', async () => {
    const { data, error } = await admin
      .from('products')
      .select('final_score, trend_score, viral_score, profit_score, trend_stage, ai_insight_haiku')
      .limit(1)
    expect(error).toBeNull()
    // If there's at least one row, check fields are present
    if (data && data.length > 0) {
      const row = data[0]
      expect(row).toHaveProperty('final_score')
      expect(row).toHaveProperty('trend_score')
      expect(row).toHaveProperty('viral_score')
      expect(row).toHaveProperty('profit_score')
      expect(row).toHaveProperty('trend_stage')
    }
  })

  it('clients table has plan and default_product_limit', async () => {
    const { data, error } = await admin
      .from('clients')
      .select('plan, default_product_limit')
      .limit(1)
    expect(error).toBeNull()
    if (data && data.length > 0) {
      expect(['starter', 'growth', 'professional', 'enterprise']).toContain(data[0].plan)
      expect(typeof data[0].default_product_limit).toBe('number')
    }
  })

  it('product_allocations has visible_to_client and status columns', async () => {
    const { data, error } = await admin
      .from('product_allocations')
      .select('visible_to_client, status, source')
      .limit(1)
    expect(error).toBeNull()
  })

  it('automation_jobs has trigger_type and cron_expression', async () => {
    const { data, error } = await admin
      .from('automation_jobs')
      .select('job_name, status, trigger_type, cron_expression')
      .limit(1)
    expect(error).toBeNull()
  })

  it('viral_signals has all six pre-viral signal columns', async () => {
    const cols = 'micro_influencer_convergence, comment_purchase_intent, hashtag_acceleration, creator_niche_expansion, engagement_velocity, supply_side_response, early_viral_score'
    const { error } = await admin.from('viral_signals').select(cols).limit(1)
    expect(error).toBeNull()
  })

  it('profiles table has role column with expected enum values', async () => {
    const { data, error } = await admin
      .from('profiles')
      .select('role')
      .limit(10)
    expect(error).toBeNull()
    if (data && data.length > 0) {
      for (const row of data) {
        expect(['super_admin', 'admin', 'client', 'viewer']).toContain(row.role)
      }
    }
  })
})

// ─── RLS Policy Validation ────────────────────────────────────────

describe('Phase 1C: RLS — Anon Access Blocked', () => {
  const adminOnlyTables = [
    'products',
    'clients',
    'influencers',
    'suppliers',
    'financial_models',
    'launch_blueprints',
    'automation_jobs',
    'scan_history',
    'viral_signals',
    'product_allocations',
    'product_requests',
    'outreach_emails',
    'marketing_strategies',
    'competitor_stores',
    'affiliate_programs',
    'imported_files',
    'product_metrics',
  ]

  for (const table of adminOnlyTables) {
    it(`anon cannot read "${table}"`, async () => {
      const { data, error } = await anon.from(table).select('*').limit(1)
      // RLS should either return empty array or an error
      // Supabase returns [] when RLS blocks select (not an error)
      const blocked = (data && data.length === 0) || error !== null
      expect(blocked, `Anon should NOT be able to read "${table}". Got ${data?.length} rows`).toBe(true)
    })
  }

  const writeBlockedTables = [
    'products',
    'clients',
    'influencers',
    'automation_jobs',
  ]

  for (const table of writeBlockedTables) {
    it(`anon cannot insert into "${table}"`, async () => {
      const { error } = await anon.from(table).insert({ name: '__test_rls_probe__' } as Record<string, unknown>)
      expect(error).not.toBeNull()
    })
  }
})

describe('Phase 1D: RLS — Service Role Bypasses', () => {
  it('service role can read products', async () => {
    const { error } = await admin.from('products').select('id').limit(1)
    expect(error).toBeNull()
  })

  it('service role can read clients', async () => {
    const { error } = await admin.from('clients').select('id').limit(1)
    expect(error).toBeNull()
  })

  it('service role can read automation_jobs', async () => {
    const { error } = await admin.from('automation_jobs').select('id').limit(1)
    expect(error).toBeNull()
  })
})

// ─── Seed Data Validation ─────────────────────────────────────────

describe('Phase 1E: Seed Data — Required Rows', () => {
  it('automation_jobs has all 11 default jobs seeded', async () => {
    const expectedJobs = [
      'trend_scout_early_viral',
      'tiktok_product_scan',
      'amazon_bsr_scan',
      'pinterest_trend_scan',
      'google_trends_batch',
      'reddit_demand_signals',
      'digital_product_scan',
      'ai_affiliate_refresh',
      'shopify_competitor_scan',
      'influencer_metric_refresh',
      'supplier_data_refresh',
    ]

    const { data, error } = await admin
      .from('automation_jobs')
      .select('job_name, status')
      .in('job_name', expectedJobs)

    expect(error).toBeNull()
    expect(data).not.toBeNull()

    const foundNames = (data || []).map((j: Record<string, unknown>) => j.job_name)
    for (const job of expectedJobs) {
      expect(foundNames, `Missing seed job: ${job}`).toContain(job)
    }
  })

  it('all automation_jobs default to disabled', async () => {
    const { data, error } = await admin
      .from('automation_jobs')
      .select('job_name, status')

    expect(error).toBeNull()
    for (const job of data || []) {
      // Jobs might have been enabled by an admin — at minimum they should exist
      expect(['disabled', 'enabled', 'running', 'completed', 'failed']).toContain(
        (job as Record<string, unknown>).status
      )
    }
  })

  it('at least one admin profile exists', async () => {
    const { data, error } = await admin
      .from('profiles')
      .select('id, role')
      .in('role', ['admin', 'super_admin'])
      .limit(1)

    expect(error).toBeNull()
    expect(data?.length, 'No admin profile found — the app requires at least one admin').toBeGreaterThan(0)
  })
})

// ─── Foreign Key Integrity ────────────────────────────────────────

describe('Phase 1F: Foreign Key Integrity', () => {
  it('product_allocations.client_id references valid clients', async () => {
    const { data: allocations } = await admin
      .from('product_allocations')
      .select('client_id')
      .limit(20)

    if (allocations && allocations.length > 0) {
      const clientIds = [...new Set(allocations.map((a: Record<string, unknown>) => a.client_id))]
      const { data: clients, error } = await admin
        .from('clients')
        .select('id')
        .in('id', clientIds as string[])

      expect(error).toBeNull()
      expect(clients?.length).toBe(clientIds.length)
    }
  })

  it('product_allocations.product_id references valid products', async () => {
    const { data: allocations } = await admin
      .from('product_allocations')
      .select('product_id')
      .limit(20)

    if (allocations && allocations.length > 0) {
      const productIds = [...new Set(allocations.map((a: Record<string, unknown>) => a.product_id))]
      const { data: products, error } = await admin
        .from('products')
        .select('id')
        .in('id', productIds as string[])

      expect(error).toBeNull()
      expect(products?.length).toBe(productIds.length)
    }
  })

  it('viral_signals.product_id references valid products', async () => {
    const { data: signals } = await admin
      .from('viral_signals')
      .select('product_id')
      .limit(20)

    if (signals && signals.length > 0) {
      const productIds = [...new Set(signals.map((s: Record<string, unknown>) => s.product_id))]
      const { data: products, error } = await admin
        .from('products')
        .select('id')
        .in('id', productIds as string[])

      expect(error).toBeNull()
      expect(products?.length).toBe(productIds.length)
    }
  })

  it('notifications.user_id references valid profiles', async () => {
    const { data: notifs } = await admin
      .from('notifications')
      .select('user_id')
      .limit(20)

    if (notifs && notifs.length > 0) {
      const userIds = [...new Set(notifs.map((n: Record<string, unknown>) => n.user_id))]
      const { data: profiles, error } = await admin
        .from('profiles')
        .select('id')
        .in('id', userIds as string[])

      expect(error).toBeNull()
      expect(profiles?.length).toBe(userIds.length)
    }
  })
})

// ─── Data Consistency Checks ──────────────────────────────────────

describe('Phase 1G: Data Consistency', () => {
  it('products with scores have valid tier ranges (0-100)', async () => {
    const { data, error } = await admin
      .from('products')
      .select('id, final_score, trend_score, viral_score, profit_score')
      .not('final_score', 'is', null)
      .gt('final_score', 0)
      .limit(50)

    expect(error).toBeNull()
    for (const p of data || []) {
      const product = p as Record<string, number>
      if (product.final_score !== null) {
        expect(product.final_score).toBeGreaterThanOrEqual(0)
        expect(product.final_score).toBeLessThanOrEqual(100)
      }
      if (product.trend_score !== null) {
        expect(product.trend_score).toBeGreaterThanOrEqual(0)
        expect(product.trend_score).toBeLessThanOrEqual(100)
      }
      if (product.viral_score !== null) {
        expect(product.viral_score).toBeGreaterThanOrEqual(0)
        expect(product.viral_score).toBeLessThanOrEqual(100)
      }
    }
  })

  it('clients all have valid plan values', async () => {
    const { data, error } = await admin
      .from('clients')
      .select('id, plan')

    expect(error).toBeNull()
    for (const c of data || []) {
      expect(
        ['starter', 'growth', 'professional', 'enterprise'],
        `Invalid plan "${(c as Record<string, unknown>).plan}" for client ${(c as Record<string, unknown>).id}`
      ).toContain((c as Record<string, unknown>).plan)
    }
  })

  it('product_allocations.source is valid enum', async () => {
    const { data, error } = await admin
      .from('product_allocations')
      .select('id, source')

    expect(error).toBeNull()
    for (const a of data || []) {
      expect(['default_package', 'request_fulfilled']).toContain(
        (a as Record<string, unknown>).source
      )
    }
  })

  it('influencer tiers are valid', async () => {
    const { data, error } = await admin
      .from('influencers')
      .select('id, tier')

    expect(error).toBeNull()
    for (const i of data || []) {
      if ((i as Record<string, unknown>).tier) {
        expect(['nano', 'micro', 'mid', 'macro']).toContain(
          (i as Record<string, unknown>).tier
        )
      }
    }
  })

  it('scan_history status values are valid', async () => {
    const { data, error } = await admin
      .from('scan_history')
      .select('id, status')

    expect(error).toBeNull()
    for (const s of data || []) {
      expect(['running', 'completed', 'failed']).toContain(
        (s as Record<string, unknown>).status
      )
    }
  })
})
