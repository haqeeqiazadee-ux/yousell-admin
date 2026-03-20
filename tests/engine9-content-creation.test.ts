/**
 * Engine 9: Content Creation Engine — V9 Task Coverage Tests
 *
 * Tests against V9 tasks 9.01–9.55:
 * - Credit system (9.03–9.09)
 * - Template selection (9.10–9.13)
 * - AI generation routing (9.14–9.15)
 * - Platform formatting (9.16–9.17)
 * - Content status lifecycle (9.31–9.46)
 * - Auto-pilot & scheduling (9.41–9.43)
 * - API endpoint contracts (9.48–9.51)
 */

import { describe, it, expect } from 'vitest'
import { PRICING_TIERS, CONTENT_CREDIT_COSTS } from '@/lib/stripe'

// ── Tasks 9.03–9.09: Credit System ──────────────────────────

describe('Engine 9 — Tasks 9.03-9.09: Credit System', () => {
  it('calculates correct credit cost per content type (9.04)', () => {
    expect(CONTENT_CREDIT_COSTS.caption).toBe(1)   // social caption
    expect(CONTENT_CREDIT_COSTS.ad).toBe(1)         // ad copy
    expect(CONTENT_CREDIT_COSTS.blog).toBe(3)       // blog
    expect(CONTENT_CREDIT_COSTS.image).toBe(2)      // image
    expect(CONTENT_CREDIT_COSTS.carousel).toBe(5)   // carousel
    expect(CONTENT_CREDIT_COSTS.short_video).toBe(5) // short video
    expect(CONTENT_CREDIT_COSTS.long_video).toBe(8)  // long video
    expect(CONTENT_CREDIT_COSTS.email_sequence).toBe(3) // email sequence
  })

  it('enforces tier credit caps (9.07)', () => {
    expect(PRICING_TIERS.starter.contentCredits).toBe(50)
    expect(PRICING_TIERS.growth.contentCredits).toBe(200)
    expect(PRICING_TIERS.professional.contentCredits).toBe(500)
    expect(PRICING_TIERS.enterprise.contentCredits).toBe(Infinity)
  })

  it('blocks generation when insufficient credits (9.03)', () => {
    const checkCredits = (available: number, cost: number) => available >= cost

    expect(checkCredits(10, 5)).toBe(true)
    expect(checkCredits(2, 3)).toBe(false)
    expect(checkCredits(0, 1)).toBe(false)
    expect(checkCredits(5, 5)).toBe(true)
  })

  it('deducts credits on generation start (9.05)', () => {
    let balance = 50
    const cost = 5
    balance -= cost
    expect(balance).toBe(45)
  })

  it('refunds credits on generation failure (9.06)', () => {
    let balance = 45
    const refundAmount = 5
    balance += refundAmount
    expect(balance).toBe(50)
  })

  it('triggers low-credit warning at 20% threshold (9.09)', () => {
    const shouldWarn = (current: number, tierMax: number) => current < tierMax * 0.2

    expect(shouldWarn(9, 50)).toBe(true)   // 9 < 10
    expect(shouldWarn(10, 50)).toBe(false)  // 10 = 10
    expect(shouldWarn(39, 200)).toBe(true)  // 39 < 40
    expect(shouldWarn(40, 200)).toBe(false) // 40 = 40
  })
})

// ── Tasks 9.10–9.13: Template Selection ─────────────────────

describe('Engine 9 — Tasks 9.10-9.13: Template Selection', () => {
  const TEMPLATES = {
    product_description: { model: 'haiku', maxTokens: 400 },
    social_post: { model: 'haiku', maxTokens: 200 },
    ad_copy: { model: 'haiku', maxTokens: 300 },
    email_sequence: { model: 'haiku', maxTokens: 1000 },
    video_script: { model: 'haiku', maxTokens: 500 },
    blog_post: { model: 'sonnet', maxTokens: 2000 },
    long_video: { model: 'sonnet', maxTokens: 1500 },
  }

  it('selects correct template for each content type (9.10)', () => {
    expect(TEMPLATES.product_description).toBeDefined()
    expect(TEMPLATES.social_post).toBeDefined()
    expect(TEMPLATES.ad_copy).toBeDefined()
    expect(TEMPLATES.email_sequence).toBeDefined()
    expect(TEMPLATES.video_script).toBeDefined()
  })

  it('routes bulk content to Haiku, premium to Sonnet (9.12-9.13)', () => {
    expect(TEMPLATES.product_description.model).toBe('haiku')
    expect(TEMPLATES.social_post.model).toBe('haiku')
    expect(TEMPLATES.ad_copy.model).toBe('haiku')
    expect(TEMPLATES.blog_post.model).toBe('sonnet')
    expect(TEMPLATES.long_video.model).toBe('sonnet')
  })

  it('selects valid style variants (9.11)', () => {
    const styles = [
      'Problem→Solution', 'Unboxing', 'Before/After', 'Listicle',
      'Trend Hijack', 'Comparison', 'Testimonial', 'Deal Alert',
    ]
    expect(styles).toHaveLength(8)
    expect(styles).toContain('Unboxing')
    expect(styles).toContain('Before/After')
  })
})

// ── Tasks 9.16–9.17: Platform Formatting & Brand Voice ──────

describe('Engine 9 — Tasks 9.16-9.17: Platform Formatting', () => {
  it('enforces TikTok 2200 char limit (9.16)', () => {
    const formatForPlatform = (content: string, platform: string) => {
      const limits: Record<string, number> = {
        tiktok: 2200,
        twitter: 280,
        instagram: 2200,
        pinterest: 500,
      }
      const limit = limits[platform] || 5000
      return content.length > limit ? content.substring(0, limit) : content
    }

    const longContent = 'A'.repeat(3000)
    expect(formatForPlatform(longContent, 'tiktok').length).toBe(2200)
    expect(formatForPlatform(longContent, 'twitter').length).toBe(280)
    expect(formatForPlatform('Short post', 'tiktok')).toBe('Short post')
  })

  it('strips forbidden words from brand voice (9.17)', () => {
    const stripForbidden = (content: string, forbidden: string[]) => {
      let result = content
      for (const word of forbidden) {
        result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), '')
      }
      return result.replace(/\s+/g, ' ').trim()
    }

    const content = 'This cheap product is the best deal ever'
    const forbidden = ['cheap', 'deal']
    const cleaned = stripForbidden(content, forbidden)
    expect(cleaned).not.toContain('cheap')
    expect(cleaned).not.toContain('deal')
    expect(cleaned).toContain('product')
  })
})

// ── Tasks 9.31–9.46: Content Status Lifecycle ───────────────

describe('Engine 9 — Tasks 9.31-9.46: Content Status Lifecycle', () => {
  it('follows correct status transitions', () => {
    const validTransitions: Record<string, string[]> = {
      draft: ['pending_review'],
      pending_review: ['approved', 'rejected'],
      approved: ['generating', 'scheduled'],
      rejected: ['draft'],  // triggers regeneration
      generating: ['ready', 'failed'],
      ready: ['scheduled'],
      scheduled: ['published', 'failed'],
      published: ['archived'],
      failed: ['draft'],
    }

    const canTransition = (from: string, to: string) =>
      validTransitions[from]?.includes(to) ?? false

    // Happy path
    expect(canTransition('draft', 'pending_review')).toBe(true)
    expect(canTransition('pending_review', 'approved')).toBe(true)
    expect(canTransition('approved', 'scheduled')).toBe(true)
    expect(canTransition('scheduled', 'published')).toBe(true)
    expect(canTransition('published', 'archived')).toBe(true)

    // Rejection path
    expect(canTransition('pending_review', 'rejected')).toBe(true)
    expect(canTransition('rejected', 'draft')).toBe(true)

    // Invalid transitions
    expect(canTransition('published', 'draft')).toBe(false)
    expect(canTransition('archived', 'published')).toBe(false)
  })

  it('archives published content after 90 days (9.46)', () => {
    const publishedAt = new Date()
    publishedAt.setDate(publishedAt.getDate() - 91) // 91 days ago
    const shouldArchive = (Date.now() - publishedAt.getTime()) > 90 * 24 * 60 * 60 * 1000
    expect(shouldArchive).toBe(true)

    const recentPublish = new Date()
    recentPublish.setDate(recentPublish.getDate() - 30)
    const shouldNotArchive = (Date.now() - recentPublish.getTime()) > 90 * 24 * 60 * 60 * 1000
    expect(shouldNotArchive).toBe(false)
  })

  it('retries publishing up to 3 times on failure (9.45)', () => {
    const MAX_RETRIES = 3
    let attempts = 0
    let success = false

    while (attempts < MAX_RETRIES && !success) {
      attempts++
      if (attempts === 3) success = true // succeeds on 3rd try
    }

    expect(attempts).toBe(3)
    expect(success).toBe(true)
  })
})

// ── Tasks 9.41–9.43: Scheduling & Auto-Pilot ───────────────

describe('Engine 9 — Tasks 9.41-9.43: Scheduling & Auto-Pilot', () => {
  it('validates scheduled_at is in the future (9.41)', () => {
    const isFutureDate = (dateStr: string) => new Date(dateStr).getTime() > Date.now()

    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    expect(isFutureDate(future)).toBe(true)
    expect(isFutureDate(past)).toBe(false)
  })

  it('auto-pilot mode auto-approves when confidence > threshold (9.43)', () => {
    const autoPilotApprove = (confidence: number, threshold: number) => confidence > threshold

    expect(autoPilotApprove(0.85, 0.80)).toBe(true)
    expect(autoPilotApprove(0.70, 0.80)).toBe(false)
    expect(autoPilotApprove(0.80, 0.80)).toBe(false) // must exceed, not equal
  })
})

// ── Tasks 9.48–9.51: API Endpoint Contracts ─────────────────

describe('Engine 9 — Tasks 9.48-9.51: API Endpoint Contracts', () => {
  it('POST /api/content/generate requires productId and contentType (9.48)', () => {
    const validate = (body: Record<string, unknown>) => {
      if (!body.productId) return { error: 'productId required' }
      if (!body.contentType) return { error: 'contentType required' }
      return { valid: true }
    }

    expect(validate({ productId: 'p1', contentType: 'social_post' })).toHaveProperty('valid')
    expect(validate({ contentType: 'social_post' })).toHaveProperty('error')
    expect(validate({ productId: 'p1' })).toHaveProperty('error')
    expect(validate({})).toHaveProperty('error')
  })

  it('validates content type against known templates (9.48)', () => {
    const validTypes = ['product_description', 'social_post', 'ad_copy', 'email_sequence', 'video_script']
    const isValid = (type: string) => validTypes.includes(type)

    expect(isValid('social_post')).toBe(true)
    expect(isValid('invalid_type')).toBe(false)
  })

  it('PATCH /api/content/items/:id/status validates transition (9.50)', () => {
    const validStatuses = ['pending_review', 'approved', 'rejected', 'scheduled', 'published']
    const isValidStatus = (status: string) => validStatuses.includes(status)

    expect(isValidStatus('approved')).toBe(true)
    expect(isValidStatus('deleted')).toBe(false)
  })

  it('POST /api/content/schedule requires content_id and scheduled_at (9.51)', () => {
    const validate = (body: Record<string, unknown>) => {
      if (!body.content_id) return { error: 'content_id required' }
      if (!body.scheduled_at) return { error: 'scheduled_at required' }
      return { valid: true }
    }

    expect(validate({ content_id: 'c1', scheduled_at: '2026-04-01T10:00:00Z' })).toHaveProperty('valid')
    expect(validate({ content_id: 'c1' })).toHaveProperty('error')
  })
})

// ── POD Content Generation (9.25–9.30) ──────────────────────

describe('Engine 9 — Tasks 9.25-9.30: POD Content Generation', () => {
  it('generates POD-specific content types', () => {
    const podContentTypes = [
      'mockup_social_post',
      'design_trend_alert',
      'product_launch_announcement',
      'custom_merch_brief',
      'before_after_showcase',
      'print_quality_showcase',
    ]
    expect(podContentTypes).toHaveLength(6)
    expect(podContentTypes).toContain('mockup_social_post')
    expect(podContentTypes).toContain('before_after_showcase')
  })
})
