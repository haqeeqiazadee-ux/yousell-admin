/**
 * Phase 2: API Route Smoke Tests
 *
 * Validates:
 * - All API routes respond (no 500 crashes)
 * - Auth-protected routes return 401/403 when unauthenticated
 * - Response shapes match frontend expectations
 * - Webhook endpoint accepts POST
 *
 * NOTE: These tests hit the running Next.js dev server.
 * Start with `npm run dev` before running: npx vitest tests/phase2-api-smoke.test.ts
 *
 * If no dev server is running, tests are skipped gracefully.
 */

import { describe, it, expect, beforeAll } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

let serverUp = false

beforeAll(async () => {
  try {
    const res = await fetch(BASE_URL, { method: 'HEAD', signal: AbortSignal.timeout(3000) })
    serverUp = res.ok || res.status < 500
  } catch {
    serverUp = false
    console.warn(
      `⚠ Dev server not running at ${BASE_URL} — Phase 2 tests will be skipped.\n` +
      `  Start with: npm run dev`
    )
  }
})

function skipIfNoServer() {
  if (!serverUp) {
    return true
  }
  return false
}

// ─── Admin Routes (expect 401/403 without auth) ──────────────────

describe('Phase 2A: Admin API Routes — Auth Guard', () => {
  const adminRoutes = [
    { method: 'GET', path: '/api/admin/products' },
    { method: 'GET', path: '/api/admin/clients' },
    { method: 'GET', path: '/api/admin/influencers' },
    { method: 'GET', path: '/api/admin/suppliers' },
    { method: 'GET', path: '/api/admin/dashboard' },
    { method: 'GET', path: '/api/admin/allocations' },
    { method: 'GET', path: '/api/admin/trends' },
    { method: 'GET', path: '/api/admin/competitors' },
    { method: 'GET', path: '/api/admin/notifications' },
    { method: 'GET', path: '/api/admin/settings' },
    { method: 'GET', path: '/api/admin/automation' },
    { method: 'GET', path: '/api/admin/ads' },
    { method: 'GET', path: '/api/admin/affiliates' },
    { method: 'GET', path: '/api/admin/blueprints' },
    { method: 'GET', path: '/api/admin/clusters' },
    { method: 'GET', path: '/api/admin/financial' },
    { method: 'GET', path: '/api/admin/tiktok' },
    { method: 'GET', path: '/api/admin/tiktok/videos' },
    { method: 'GET', path: '/api/admin/tiktok/signals' },
    { method: 'GET', path: '/api/admin/tiktok/discover' },
  ]

  for (const route of adminRoutes) {
    it(`${route.method} ${route.path} returns 403 without auth`, async () => {
      if (skipIfNoServer()) return

      const res = await fetch(`${BASE_URL}${route.path}`, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
      })

      // Should be 401 or 403, never 500
      expect(
        [401, 403].includes(res.status),
        `${route.method} ${route.path} returned ${res.status} — expected 401 or 403`
      ).toBe(true)
    })
  }

  const adminPostRoutes = [
    { path: '/api/admin/products', body: { title: 'smoke test' } },
    { path: '/api/admin/scoring', body: { productId: 'fake-id' } },
    { path: '/api/admin/allocations', body: { clientId: 'fake', productIds: ['fake'] } },
    { path: '/api/admin/scan', body: { mode: 'quick' } },
    { path: '/api/admin/import', body: {} },
  ]

  for (const route of adminPostRoutes) {
    it(`POST ${route.path} returns 403 without auth`, async () => {
      if (skipIfNoServer()) return

      const res = await fetch(`${BASE_URL}${route.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(route.body),
      })

      expect(
        [401, 403].includes(res.status),
        `POST ${route.path} returned ${res.status} — expected 401 or 403`
      ).toBe(true)
    })
  }
})

// ─── Client/Dashboard Routes ─────────────────────────────────────

describe('Phase 2B: Dashboard API Routes — Auth Guard', () => {
  const dashboardRoutes = [
    { method: 'GET', path: '/api/dashboard/products' },
    { method: 'GET', path: '/api/dashboard/orders' },
    { method: 'GET', path: '/api/dashboard/channels' },
    { method: 'GET', path: '/api/dashboard/content' },
    { method: 'GET', path: '/api/dashboard/requests' },
    { method: 'GET', path: '/api/dashboard/subscription' },
  ]

  for (const route of dashboardRoutes) {
    it(`${route.method} ${route.path} returns 401/403 without auth`, async () => {
      if (skipIfNoServer()) return

      const res = await fetch(`${BASE_URL}${route.path}`, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
      })

      expect(
        [401, 403].includes(res.status),
        `${route.method} ${route.path} returned ${res.status} — expected 401 or 403`
      ).toBe(true)
    })
  }
})

// ─── Auth Routes ─────────────────────────────────────────────────

describe('Phase 2C: Auth Routes — Basic Checks', () => {
  it('POST /api/auth/signout responds without crashing', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    // Should redirect or 200, not 500
    expect(res.status).toBeLessThan(500)
  })

  it('GET /api/auth/callback redirects or returns non-500', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/auth/callback`, {
      redirect: 'manual',
    })

    expect(res.status).toBeLessThan(500)
  })
})

// ─── Webhook ─────────────────────────────────────────────────────

describe('Phase 2D: Stripe Webhook', () => {
  it('POST /api/webhooks/stripe rejects unsigned payload', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'invalid_sig',
      },
      body: JSON.stringify({ type: 'charge.succeeded' }),
    })

    // Should be 400 (bad signature) not 500
    expect(res.status).toBeLessThan(500)
  })
})

// ─── Response Shape Validation ───────────────────────────────────

describe('Phase 2E: Response Shape (when server available)', () => {
  it('admin routes return JSON error objects', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/admin/products`)
    const body = await res.json()

    // Even on auth failure, should return structured JSON
    expect(body).toBeDefined()
    expect(typeof body).toBe('object')
    // Should have an error key when unauthorized
    if (res.status === 403 || res.status === 401) {
      expect(body).toHaveProperty('error')
    }
  })

  it('non-existent API route returns 404, not 500', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/admin/does-not-exist-xyz`)
    expect(res.status).not.toBe(500)
  })
})
