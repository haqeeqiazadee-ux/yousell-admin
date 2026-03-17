# YOUSELL — Step-by-Step Execution Plan

## Version 1.0 — March 2026

**Purpose:** Automated execution plan for implementing the Content Creation, Publishing & Shop Integration strategy.
**Estimated Timeline:** 16 weeks (Phases 2A through 4)

---

## PRE-REQUISITES (Before Any Phase Begins)

### Week 0: Setup & Registration (Parallel Tasks)

| # | Task | Owner | Duration | Dependencies |
|---|------|-------|----------|-------------|
| 0.1 | Register Shopify Partner account + create app | Admin | 1 day | None |
| 0.2 | Register TikTok Shop Partner Center (US portal) | Admin | 2-3 days (approval) | None |
| 0.3 | Apply for TikTok Content Posting API audit (for public posting) | Admin | Unknown (no SLA) | None |
| 0.4 | Register Ayrshare Business plan | Admin | 1 day | None |
| 0.5 | Register Shotstack account + API key | Admin | 1 day | None |
| 0.6 | Register Bannerbear account + API key | Admin | 1 day | None |
| 0.7 | Create `src/lib/terminology.ts` constants file | Claude | 30 min | None |
| 0.8 | Run Supabase migration for new tables | Claude | 1 hour | None |
| 0.9 | Add environment variables to Railway + Netlify | Admin | 30 min | 0.1-0.6 |

**Critical Path:** TikTok Content Posting API audit (0.3) has no guaranteed timeline. Start ASAP.

---

## PHASE 2A: SHOPIFY SHOP CONNECT (Weeks 1-2)

### Week 1: Shopify OAuth + Product Push

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 2A.1 | Create Shopify OAuth callback route | `src/app/api/auth/shopify/callback/route.ts` | Yes |
| 2A.2 | Create Shopify OAuth initiation route | `src/app/api/dashboard/channels/shopify/connect/route.ts` | Yes |
| 2A.3 | Create Shopify GraphQL client library | `src/lib/integrations/shopify/client.ts` | Yes |
| 2A.4 | Implement `productSet` mutation wrapper | `src/lib/integrations/shopify/products.ts` | Yes |
| 2A.5 | Create product push API route | `src/app/api/dashboard/shop/push/route.ts` | Yes |
| 2A.6 | Create batch product push route | `src/app/api/dashboard/shop/push-batch/route.ts` | Yes |
| 2A.7 | Add AES-256-GCM token encryption utility | `src/lib/crypto.ts` | Yes |
| 2A.8 | Create Supabase migration: `shop_products` table | `supabase/migrations/xxx_shop_products.sql` | Yes |
| 2A.9 | Update `client_channels` table with new columns | `supabase/migrations/xxx_update_client_channels.sql` | Yes |

### Week 2: Shopify UI + Webhooks

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 2A.10 | Create "Connect Shopify Store" button component | `src/components/shop-connect/shopify-button.tsx` | Yes |
| 2A.11 | Create product push modal (single product) | `src/components/shop-connect/push-product-modal.tsx` | Yes |
| 2A.12 | Create batch push modal | `src/components/shop-connect/batch-push-modal.tsx` | Yes |
| 2A.13 | Create Shopify order webhook handler | `src/app/api/webhooks/shopify/orders/route.ts` | Yes |
| 2A.14 | Update dashboard integrations page | `src/app/dashboard/integrations/page.tsx` | Yes |
| 2A.15 | Create Connection Hub UI component | `src/components/connection-hub.tsx` | Yes |
| 2A.16 | Add shop-sync BullMQ queue + worker | `backend/src/jobs/shop-sync.ts` | Yes |
| 2A.17 | Write integration tests for Shopify flow | `tests/integration/shopify.test.ts` | Yes |
| 2A.18 | Deploy and test end-to-end | — | Manual verification |

**Validation Checkpoint:** Can a test client connect their Shopify store, push a product, and see an order come back?

---

## PHASE 2B: TIKTOK SHOP CONNECT (Weeks 3-4)

### Week 3: TikTok Shop OAuth + Signing

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 2B.1 | Create TikTok Shop HMAC-SHA256 signing utility | `src/lib/integrations/tiktok-shop/signing.ts` | Yes |
| 2B.2 | Create TikTok Shop OAuth flow routes | `src/app/api/auth/tiktok-shop/callback/route.ts` | Yes |
| 2B.3 | Create TikTok Shop API client | `src/lib/integrations/tiktok-shop/client.ts` | Yes |
| 2B.4 | Implement product save endpoint wrapper | `src/lib/integrations/tiktok-shop/products.ts` | Yes |
| 2B.5 | Implement category query (required before product save) | `src/lib/integrations/tiktok-shop/categories.ts` | Yes |
| 2B.6 | Create product push API route for TikTok | `src/app/api/dashboard/shop/tiktok/push/route.ts` | Yes |

### Week 4: TikTok Shop UI + Order Webhooks

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 2B.7 | Create "Connect TikTok Shop" button | `src/components/shop-connect/tiktok-shop-button.tsx` | Yes |
| 2B.8 | Create TikTok category mapping UI | `src/components/shop-connect/tiktok-category-select.tsx` | Yes |
| 2B.9 | Create TikTok order webhook handler | `src/app/api/webhooks/tiktok-shop/orders/route.ts` | Yes |
| 2B.10 | Create product review status tracker | `src/lib/integrations/tiktok-shop/review-status.ts` | Yes |
| 2B.11 | Update Connection Hub for TikTok Shop | `src/components/connection-hub.tsx` | Yes |
| 2B.12 | Write integration tests | `tests/integration/tiktok-shop.test.ts` | Yes |
| 2B.13 | Deploy and test end-to-end | — | Manual verification |

**Validation Checkpoint:** Can a test client connect TikTok Shop, push a product, see it go to review, and receive order webhooks?

---

## PHASE 3A: CREATIVE STUDIO — TEXT CONTENT (Weeks 5-6)

### Week 5: Content Generation Backend

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 3A.1 | Create Supabase migration: `content_items`, `content_credits` tables | `supabase/migrations/xxx_content_tables.sql` | Yes |
| 3A.2 | Create content planner service (Claude Haiku) | `src/lib/content/planner.ts` | Yes |
| 3A.3 | Create social caption generator | `src/lib/content/generators/social-caption.ts` | Yes |
| 3A.4 | Create ad copy generator | `src/lib/content/generators/ad-copy.ts` | Yes |
| 3A.5 | Create video script generator | `src/lib/content/generators/video-script.ts` | Yes |
| 3A.6 | Create email sequence generator | `src/lib/content/generators/email-sequence.ts` | Yes |
| 3A.7 | Create blog/SEO content generator | `src/lib/content/generators/blog-seo.ts` | Yes |
| 3A.8 | Create platform formatting rules | `src/lib/content/platform-rules.ts` | Yes |
| 3A.9 | Create content templates (8 core) | `src/lib/content/templates.ts` | Yes |
| 3A.10 | Create content-generate BullMQ job | `backend/src/jobs/content-generate.ts` | Yes |
| 3A.11 | Create content credits service | `src/lib/content/credits.ts` | Yes |

### Week 6: Content Generation UI

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 3A.12 | Create brand voice configuration UI | `src/components/content/brand-voice-setup.tsx` | Yes |
| 3A.13 | Create content brief preview/edit UI | `src/components/content/content-brief.tsx` | Yes |
| 3A.14 | Create content library page | `src/app/dashboard/content/library/page.tsx` | Yes |
| 3A.15 | Create "Create Content" button on product cards | `src/components/product-card.tsx` (modify) | Yes |
| 3A.16 | Create content credits display widget | `src/components/content/credits-widget.tsx` | Yes |
| 3A.17 | Create content API routes (CRUD + generate) | `src/app/api/dashboard/content/route.ts` | Yes |
| 3A.18 | Write unit tests for all generators | `tests/unit/content/*.test.ts` | Yes |
| 3A.19 | Deploy and test end-to-end | — | Manual verification |

**Validation Checkpoint:** Can a client select a product, see a content brief, approve it, and see generated text content in their library?

---

## PHASE 3B: CREATIVE STUDIO — RICH MEDIA (Weeks 7-8)

### Week 7: Video + Image Generation

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 3B.1 | Create Shotstack API client | `src/lib/integrations/shotstack/client.ts` | Yes |
| 3B.2 | Create video generation service | `src/lib/content/generators/video.ts` | Yes |
| 3B.3 | Create Shotstack video templates (8 core) | `src/lib/integrations/shotstack/templates.ts` | Yes |
| 3B.4 | Create Bannerbear API client | `src/lib/integrations/bannerbear/client.ts` | Yes |
| 3B.5 | Create image generation service | `src/lib/content/generators/image.ts` | Yes |
| 3B.6 | Create carousel generation service | `src/lib/content/generators/carousel.ts` | Yes |
| 3B.7 | Create Shotstack webhook handler | `src/app/api/webhooks/shotstack/route.ts` | Yes |
| 3B.8 | Create Bannerbear webhook handler | `src/app/api/webhooks/bannerbear/route.ts` | Yes |

### Week 8: Media UI + Storage

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 3B.9 | Create media preview components | `src/components/content/media-preview.tsx` | Yes |
| 3B.10 | Set up Supabase Storage bucket for content media | `supabase/migrations/xxx_content_storage.sql` | Yes |
| 3B.11 | Create media upload + storage service | `src/lib/content/media-storage.ts` | Yes |
| 3B.12 | Update content library with media grid view | `src/app/dashboard/content/library/page.tsx` | Yes |
| 3B.13 | Create "Download for TikTok" button | `src/components/content/download-tiktok.tsx` | Yes |
| 3B.14 | Write tests for video/image generation | `tests/unit/content/media.test.ts` | Yes |
| 3B.15 | Deploy and test end-to-end | — | Manual verification |

**Validation Checkpoint:** Can a client generate a video from a product, see it in their library, and download it for TikTok?

---

## PHASE 3C: SMART PUBLISHER (Weeks 9-10)

### Week 9: Ayrshare Integration

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 3C.1 | Create Supabase migration: `publish_log`, `client_social_profiles` | `supabase/migrations/xxx_publishing_tables.sql` | Yes |
| 3C.2 | Create Ayrshare SDK wrapper | `src/lib/integrations/ayrshare/client.ts` | Yes |
| 3C.3 | Create per-client Ayrshare profile manager | `src/lib/integrations/ayrshare/profiles.ts` | Yes |
| 3C.4 | Create social account connection flow | `src/app/api/dashboard/social/connect/route.ts` | Yes |
| 3C.5 | Create publish API route | `src/app/api/dashboard/content/publish/route.ts` | Yes |
| 3C.6 | Create schedule API route | `src/app/api/dashboard/content/schedule/route.ts` | Yes |
| 3C.7 | Create publish-queue BullMQ job | `backend/src/jobs/content-publish.ts` | Yes |
| 3C.8 | Create engagement tracking job (daily pull) | `backend/src/jobs/engagement-tracking.ts` | Yes |

### Week 10: Publishing UI

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 3C.9 | Create content calendar component | `src/components/content/calendar.tsx` | Yes |
| 3C.10 | Create publish button on content items | `src/components/content/publish-button.tsx` | Yes |
| 3C.11 | Create social connection hub (Social Connect section) | `src/components/social-connect/hub.tsx` | Yes |
| 3C.12 | Create publishing status tracker | `src/components/content/publish-status.tsx` | Yes |
| 3C.13 | Update onboarding flow with social connect step | `src/app/dashboard/onboarding/page.tsx` | Yes |
| 3C.14 | Write tests for publishing flow | `tests/integration/publishing.test.ts` | Yes |
| 3C.15 | Deploy and test end-to-end | — | Manual verification |

**Validation Checkpoint:** Can a client connect their Instagram, publish content from the library, and see it appear on their Instagram feed?

---

## PHASE 3D: AUTOMATION & INTELLIGENCE (Weeks 11-12)

### Week 11: Automation Control Backend

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 3D.1 | Create Supabase migration: `client_automation_config` | `supabase/migrations/xxx_automation_config.sql` | Yes |
| 3D.2 | Create automation level service | `src/lib/automation/levels.ts` | Yes |
| 3D.3 | Create hard limit enforcer (caps, pause-on-error) | `src/lib/automation/guardrails.ts` | Yes |
| 3D.4 | Create soft limit manager (approval window, quiet hours) | `src/lib/automation/soft-limits.ts` | Yes |
| 3D.5 | Create smart scheduling service (optimal posting times) | `src/lib/automation/smart-schedule.ts` | Yes |
| 3D.6 | Create auto-pilot orchestrator | `backend/src/jobs/autopilot.ts` | Yes |
| 3D.7 | Create weekly digest email generator | `src/lib/automation/weekly-digest.ts` | Yes |
| 3D.8 | Create activity audit log service | `src/lib/automation/audit-log.ts` | Yes |

### Week 12: Automation UI

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 3D.9 | Create automation settings page | `src/app/dashboard/settings/automation/page.tsx` | Yes |
| 3D.10 | Create per-feature automation level toggle | `src/components/automation/level-selector.tsx` | Yes |
| 3D.11 | Create "Pause All Automation" emergency button | `src/components/automation/pause-all.tsx` | Yes |
| 3D.12 | Create auto-pilot rules configuration | `src/components/automation/rules-config.tsx` | Yes |
| 3D.13 | Create activity log viewer | `src/components/automation/activity-log.tsx` | Yes |
| 3D.14 | Create content performance feedback integration | `src/lib/content/performance-feedback.ts` | Yes |
| 3D.15 | Write tests for automation guardrails | `tests/unit/automation/*.test.ts` | Yes |
| 3D.16 | Deploy and test end-to-end | — | Manual verification |

**Validation Checkpoint:** Can a client set automation levels, see the auto-pilot work within guardrails, pause everything, and receive a weekly digest?

---

## PHASE 4: AMAZON + META INTEGRATION (Weeks 13-16)

### Weeks 13-14: Amazon SP-API

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 4.1 | Create Amazon LWA OAuth flow | `src/app/api/auth/amazon/callback/route.ts` | Yes |
| 4.2 | Create Amazon SP-API client | `src/lib/integrations/amazon/client.ts` | Yes |
| 4.3 | Create Amazon Feeds API product upload | `src/lib/integrations/amazon/products.ts` | Yes |
| 4.4 | Create Amazon order report poller | `backend/src/jobs/amazon-orders.ts` | Yes |
| 4.5 | Create Amazon connection UI | `src/components/shop-connect/amazon-button.tsx` | Yes |

### Weeks 15-16: Meta Commerce

| # | Task | Files to Create/Modify | Automated? |
|---|------|----------------------|-----------|
| 4.6 | Create Meta Business Extension OAuth flow | `src/app/api/auth/meta/callback/route.ts` | Yes |
| 4.7 | Create Meta Product Catalog client | `src/lib/integrations/meta/client.ts` | Yes |
| 4.8 | Create batch product catalog upload | `src/lib/integrations/meta/products.ts` | Yes |
| 4.9 | Create Meta connection UI | `src/components/shop-connect/meta-button.tsx` | Yes |
| 4.10 | Cross-platform analytics dashboard | `src/app/dashboard/analytics/page.tsx` | Yes |
| 4.11 | Final integration testing across all platforms | `tests/e2e/full-pipeline.test.ts` | Yes |
| 4.12 | Production deployment + monitoring setup | — | Manual |

**Final Validation:** Full pipeline test — discover product, create content, publish to social, push to store, receive order, track through delivery.

---

## AUTOMATION INSTRUCTIONS FOR CLAUDE

When executing this plan, follow these rules:

1. **Sequential phase execution** — Complete each phase before starting the next
2. **Parallel task execution within phases** — Tasks without dependencies can run simultaneously
3. **Validation checkpoints are mandatory** — Do not proceed to next phase until checkpoint passes
4. **Test before commit** — Run relevant tests before committing each phase
5. **Update development_log.md** after each phase completion
6. **One commit per phase** — Clean, descriptive commit message per phase

### Per-Task Execution Pattern

```
For each task:
1. Read existing files that will be modified
2. Implement the change
3. Run TypeScript compilation check
4. Run relevant tests
5. Mark task complete in todo list
```

### Environment Variables Required

```env
# Phase 2A
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=

# Phase 2B
TIKTOK_SHOP_APP_KEY=
TIKTOK_SHOP_APP_SECRET=
TIKTOK_SHOP_SERVICE_ID=

# Phase 3A-3B
ANTHROPIC_API_KEY=          # Already exists
SHOTSTACK_API_KEY=
BANNERBEAR_API_KEY=

# Phase 3C
AYRSHARE_API_KEY=

# Phase 4
AMAZON_SP_CLIENT_ID=
AMAZON_SP_CLIENT_SECRET=
AMAZON_REFRESH_TOKEN=
META_APP_ID=
META_APP_SECRET=

# Security
ENCRYPTION_KEY=              # AES-256-GCM key for token encryption
```

---

## RISK MITIGATION

| Risk | Phase | Mitigation | Owner |
|------|-------|-----------|-------|
| TikTok Content API audit delay | 3C | "Download for TikTok" fallback built in Phase 3B | Claude |
| Ayrshare pricing increases | 3C | Native OAuth fallback architecture in client_channels | Claude |
| Shopify API rate limits | 2A | Batch operations + exponential backoff + queue management | Claude |
| Shotstack render failures | 3B | Retry logic + manual fallback notification | Claude |
| Token expiry undetected | All | Daily health check job from Phase 2A onwards | Claude |
| Content quality issues | 3A | Brand voice calibration + template-based generation | Claude |
| Auto-pilot incidents | 3D | Hard limits + approval window + pause-on-error | Claude |

---

*This plan supplements docs/content_publishing_shop_integration_strategy.md. Execute phases sequentially, tasks within phases in parallel where possible.*
