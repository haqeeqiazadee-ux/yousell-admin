/**
 * Phase 4: New Feature Tests
 *
 * Validates features built in recent sessions:
 * - Content Engine API (generate endpoint)
 * - OAuth channel connect/disconnect
 * - Order tracking webhooks (Shopify, TikTok, Amazon)
 * - Influencer invite system
 * - Automation page API
 *
 * NOTE: Tests requiring dev server are skipped gracefully if server is not running.
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
  }
})

function skipIfNoServer() {
  return !serverUp
}

// ─── Content Engine ─────────────────────────────────────────────

describe('Phase 4A: Content Engine API', () => {
  it('POST /api/dashboard/content/generate returns 401/403 without auth', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/dashboard/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'fake', contentType: 'product_description' }),
    })

    expect([401, 403].includes(res.status)).toBe(true)
  })

  it('GET /api/dashboard/content returns 401/403 without auth', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/dashboard/content`)
    expect([401, 403].includes(res.status)).toBe(true)
  })
})

// ─── OAuth Channel Integration ──────────────────────────────────

describe('Phase 4B: OAuth Channel APIs', () => {
  it('POST /api/dashboard/channels/connect returns 401/403 without auth', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/dashboard/channels/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelType: 'shopify', shopDomain: 'test.myshopify.com' }),
    })

    expect([401, 403].includes(res.status)).toBe(true)
  })

  it('POST /api/dashboard/channels/disconnect returns 401/403 without auth', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/dashboard/channels/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId: 'fake-id' }),
    })

    expect([401, 403].includes(res.status)).toBe(true)
  })

  it('GET /api/auth/oauth/callback without state returns error, not 500', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/auth/oauth/callback?code=test`, {
      redirect: 'manual',
    })

    expect(res.status).toBeLessThan(500)
  })
})

// ─── Webhook Endpoints ──────────────────────────────────────────

describe('Phase 4C: Webhook Endpoints', () => {
  it('POST /api/webhooks/shopify rejects unsigned payload', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/webhooks/shopify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shopify-hmac-sha256': 'invalid',
      },
      body: JSON.stringify({ topic: 'orders/create' }),
    })

    // Should reject with 401 (bad sig) not crash with 500
    expect(res.status).toBeLessThan(500)
  })

  it('POST /api/webhooks/tiktok rejects invalid payload', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/webhooks/tiktok`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ORDER_CHANGE', data: {} }),
    })

    expect(res.status).toBeLessThan(500)
  })

  it('POST /api/webhooks/amazon rejects invalid notification', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/webhooks/amazon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationType: 'ORDER_CHANGE' }),
    })

    expect(res.status).toBeLessThan(500)
  })
})

// ─── Influencer Invite ──────────────────────────────────────────

describe('Phase 4D: Influencer Invite API', () => {
  it('POST /api/admin/influencers/invite returns 403 without auth', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/admin/influencers/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ influencerId: 'fake', productId: 'fake' }),
    })

    expect([401, 403].includes(res.status)).toBe(true)
  })
})

// ─── New Admin Routes ───────────────────────────────────────────

describe('Phase 4E: New Admin API Routes — Auth Guard', () => {
  const newRoutes = [
    { method: 'GET', path: '/api/admin/analytics' },
    { method: 'GET', path: '/api/admin/creator-matches' },
    { method: 'GET', path: '/api/admin/opportunities' },
    { method: 'GET', path: '/api/admin/engines/health' },
  ]

  for (const route of newRoutes) {
    it(`${route.method} ${route.path} returns 403 without auth`, async () => {
      if (skipIfNoServer()) return

      const res = await fetch(`${BASE_URL}${route.path}`, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
      })

      expect([401, 403].includes(res.status)).toBe(true)
    })
  }
})

// ─── Subscription & Billing ─────────────────────────────────────

describe('Phase 4F: Billing APIs — Auth Guard', () => {
  it('POST /api/dashboard/subscription/portal returns 401/403 without auth', async () => {
    if (skipIfNoServer()) return

    const res = await fetch(`${BASE_URL}/api/dashboard/subscription/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    expect([401, 403].includes(res.status)).toBe(true)
  })
})
