# YOUSELL Platform — End-to-End Flow Trace Report

**Date:** 2026-03-18
**Phase:** 3 — Post-QA Flow Tracing
**Scope:** 5 critical user journeys traced through codebase without live execution

---

## Journey 1 — Admin Discovers and Deploys a Product

### Step-by-Step Trace

| # | Step | FILES | TABLES | QUEUES | STATUS |
|---|------|-------|--------|--------|--------|
| 1 | Admin triggers TikTok scan | `src/app/admin/scan/page.tsx`, `src/app/api/admin/scan/route.ts` | `scan_history` (INSERT/UPDATE) | None (sync discovery) | COMPLETE |
| 2 | Scan job enters BullMQ queue | `backend/src/index.ts`, `backend/src/jobs/types.ts` | — | 35 queues defined but scan route bypasses them | PARTIAL |
| 3 | Worker scores product via 3-pillar engine | `src/lib/engines/discovery.ts`, `src/lib/scoring/composite.ts`, `backend/src/lib/scoring.ts` | `products` (INSERT/UPDATE) | — | COMPLETE |
| 4 | Product written to Supabase | `src/lib/engines/discovery.ts` | `products` (UPSERT), `scan_history` (UPDATE) | — | COMPLETE |
| 5 | Product appears in admin dashboard | `src/app/admin/products/page.tsx`, `src/app/api/admin/products/route.ts` | `products` (SELECT) | — | COMPLETE |
| 6 | Admin allocates product to client | `src/app/admin/allocate/page.tsx`, `src/app/api/admin/allocations/route.ts` | `clients` (SELECT), `product_allocations` (SELECT count, INSERT) | — | COMPLETE |
| 7 | Allocation written to DB | `src/app/api/admin/allocations/route.ts` | `product_allocations` (INSERT) | — | COMPLETE |
| 8 | Client sees product (RLS) | `src/app/api/dashboard/products/route.ts` | `product_allocations` JOIN `products` (SELECT, client_id + visible_to_client filter) | — | COMPLETE |
| 9 | Admin pushes to Shopify | `backend/src/jobs/stub-workers.ts` | `connected_channels` (SELECT) | `push-to-shopify` (STUB) | BROKEN |
| 10 | Push tracked in shop_products | — | — | — | BROKEN |

### Gaps

1. **Scan route bypasses BullMQ** — uses inline sync discovery instead of enqueueing `PRODUCT_SCAN` job
2. **Push to Shopify is stub only** — `processPushToShopify` logs and returns without action
3. **No `shop_products` table** — no migration creates this table; no way to track pushed products
4. **No push endpoint** — no POST route exists for admin/client to trigger product push to store

### Journey Status: **PARTIAL** — Steps 1-8 fully operational, Steps 9-10 broken

---

## Journey 2 — Client Uses the Platform

### Step-by-Step Trace

| # | Step | FILES | TABLES | QUEUES | STATUS |
|---|------|-------|--------|--------|--------|
| 1 | Client logs in | `src/app/login/page.tsx`, `src/middleware.ts`, `src/lib/supabase/client.ts` | `profiles` (SELECT role), `clients` (SELECT by email) | — | COMPLETE |
| 2 | Sees allocated products | `src/app/api/dashboard/products/route.ts` | `product_allocations` JOIN `products` (SELECT, RLS scoped) | — | COMPLETE |
| 3 | Opens product detail | `src/app/dashboard/products/page.tsx` | `products` (SELECT) | — | PARTIAL |
| 4 | Requests content generation | `src/app/api/dashboard/content/generate/route.ts` | `products` (SELECT), `subscriptions` (SELECT plan check) | — | COMPLETE |
| 5 | Credit check fires | `src/app/api/dashboard/content/generate/route.ts` (lines 62-91) | `content_credits` (SELECT) | — | COMPLETE |
| 6 | Content generation job | `src/app/api/dashboard/content/generate/route.ts` | `content_queue` (INSERT pending) | `content-queue` (STUB, unused) | PARTIAL |
| 7 | AI generates content | `src/app/api/dashboard/content/generate/route.ts` (lines 151-165) | `content_queue` (UPDATE → generated) | — | COMPLETE |
| 8 | Credits deducted | `src/app/api/dashboard/content/generate/route.ts` (lines 184-228) | `content_credits` (UPDATE used_credits), `usage_tracking` (INSERT) | — | COMPLETE |
| 9 | Content shown in dashboard | `src/app/api/dashboard/content/route.ts`, `src/app/dashboard/content/page.tsx` | `content_queue` (SELECT) | — | COMPLETE |
| 10 | Client schedules post | — | — | `distribution-queue` (STUB) | BROKEN |
| 11 | Post published via Ayrshare | — | — | — | BROKEN |

### Gaps

1. **No product detail page** — `/dashboard/products/[id]` does not exist; grid view only
2. **Content generated inline** — Anthropic API called synchronously in route, not via BullMQ
3. **No scheduling endpoint** — no PUT/POST for scheduling content publication
4. **No Ayrshare integration** — zero references to Ayrshare in codebase; `distribution-queue` is stub
5. **No social channel OAuth** — `connected_channels` table exists but never populated for social platforms

### Journey Status: **PARTIAL** — Steps 1-2, 4-5, 7-9 operational; Steps 3, 6 partial; Steps 10-11 broken

---

## Journey 3 — Affiliate Commission Is Tracked

### Step-by-Step Trace

| # | Step | FILES | TABLES | QUEUES | STATUS |
|---|------|-------|--------|--------|--------|
| 1 | Client shares referral link | — | No `referral_code` column in `clients` | — | BROKEN |
| 2 | New user clicks referral link | `src/middleware.ts`, `src/app/signup/page.tsx` | — | — | BROKEN |
| 3 | New user subscribes via Stripe | `src/app/api/dashboard/subscription/route.ts` | `subscriptions` (UPSERT) | — | COMPLETE |
| 4 | Stripe webhook fires | `src/app/api/webhooks/stripe/route.ts` | `subscriptions` (UPDATE) | — | PARTIAL |
| 5 | Commission calculated | — | — | — | BROKEN |
| 6 | Commission record written | — | `affiliate_commissions` table NOT in migrations | `affiliate-commission-track` (STUB) | BROKEN |
| 7 | Client sees commission | — | — | — | BROKEN |
| 8 | Admin sees commission | — | — | — | BROKEN |

### Gaps

1. **No referral link generation** — no UI, no API, no `referral_code` column
2. **Middleware doesn't capture `ref` param** — signup flow ignores referral parameters
3. **Stripe checkout metadata missing `referrer_id`** — webhook can't trace referral source
4. **No `affiliate_commissions` table** — defined in v8 spec but not in any migration
5. **No `affiliate_referrals` table** — same as above
6. **No commission calculation logic** — no function computes commission by plan tier
7. **No client earnings dashboard** — no `/dashboard/affiliate/` page
8. **No admin commission view** — no `/admin/affiliates/revenue/` page

### Journey Status: **BROKEN** — Only Stripe subscription creation works (Step 3); all other steps missing

---

## Journey 4 — POD Product Launch

### Step-by-Step Trace

| # | Step | FILES | TABLES | QUEUES | STATUS |
|---|------|-------|--------|--------|--------|
| 1 | Admin triggers POD scan | `backend/src/jobs/stub-workers.ts`, `backend/src/jobs/types.ts` | `products` | `pod-discovery` (STUB) | BROKEN |
| 2 | POD products scored with modifiers | `src/lib/scoring/pod-modifiers.ts`, `src/lib/scoring/composite.ts` | `products` | `scoring-queue` (STUB) | PARTIAL |
| 3 | Fulfillment recommends POD | `src/lib/scoring/fulfillment.ts` | — | — | COMPLETE (unused) |
| 4 | Admin selects Printful | `backend/src/jobs/types.ts` (PodProvisionJobData) | `connected_channels` | `pod-provision` (STUB) | BROKEN |
| 5 | Product pushed to Shopify | `backend/src/jobs/stub-workers.ts` | `products`, `connected_channels` | `push-to-shopify` (STUB) | BROKEN |
| 6 | Printful integration syncs | `backend/src/jobs/stub-workers.ts` | — | `pod-fulfillment-sync` (STUB) | BROKEN |
| 7 | Client notified | `src/lib/email.ts`, `backend/src/jobs/stub-workers.ts` | No `notifications` table | `notification-queue` (STUB) | PARTIAL |

### Gaps

1. **No Etsy/Redbubble scrapers** — spec calls for Apify actors but none exist
2. **POD modifiers not wired** — `calculatePodModifiers()` coded but never called in scoring pipeline
3. **Fulfillment logic never triggered** — `recommendFulfillment()` exists but unused
4. **No Printful/Printify/Gelato API clients** — zero integration with fulfillment partners
5. **No admin POD UI** — no `/admin/pod` page for managing POD workflows
6. **No `notifications` table** — notification UI expects it but migration doesn't exist
7. **All 4 POD queues are stubs** — pod-discovery, pod-provision, pod-fulfillment-sync, notification-queue

### Journey Status: **BROKEN** — Scoring modifiers and fulfillment logic are ready but disconnected; all integrations are stubs

---

## Journey 5 — Influencer Outreach

### Step-by-Step Trace

| # | Step | FILES | TABLES | QUEUES | STATUS |
|---|------|-------|--------|--------|--------|
| 1 | Product identified as HOT | `src/app/admin/products/page.tsx` | `products` (SELECT, sorted by final_score) | — | COMPLETE |
| 2 | Admin opens influencer matching | `src/app/admin/creator-matches/page.tsx`, `src/app/api/admin/creator-matches/route.ts` | `creator_product_matches` (SELECT) | — | COMPLETE |
| 3 | Engine scores matched creators | `backend/src/jobs/creator-matching.ts`, `src/lib/engines/creator-matching.ts`, `src/lib/scoring/composite.ts` | `influencers` (SELECT), `products` (SELECT), `creator_product_matches` (INSERT) | `creator-matching` | PARTIAL |
| 4 | Admin reviews shortlist | `src/app/admin/creator-matches/page.tsx`, `src/app/admin/influencers/page.tsx` | `creator_product_matches` (SELECT), `influencers` (SELECT) | — | COMPLETE |
| 5 | AI generates outreach draft | `src/app/api/admin/influencers/invite/route.ts` (lines 76-139) | — (stateless AI call) | — | PARTIAL |
| 6 | Admin clicks send | `src/app/admin/influencers/page.tsx` (invite dialog) | — | — | COMPLETE |
| 7 | Email via Resend | `src/app/api/admin/influencers/invite/route.ts` (lines 158-187) | — | — | COMPLETE |
| 8 | Outreach record written | `src/app/api/admin/influencers/invite/route.ts` (lines 141-199) | `outreach_emails` (INSERT, then UPDATE status/sent_at/resend_id) | `influencer-outreach` (STUB) | PARTIAL |
| 9 | Status in pipeline view | `src/app/admin/influencers/page.tsx`, `src/app/admin/creator-matches/page.tsx` | `outreach_emails` (not queried back to UI) | — | BROKEN |

### Gaps

1. **Duplicate scoring logic** — creator matching exists in both backend job and frontend engine with different weights
2. **No draft review UI** — AI generates email and it's sent immediately, no preview/edit
3. **Plain text emails only** — no HTML templates for influencer outreach
4. **No Resend webhook integration** — delivery/bounce/open/click events not tracked
5. **`influencer-outreach` queue is stub** — async outreach not functional
6. **No feedback loop** — `outreach_emails.status` never reflected back in creator-matches or influencer pipeline view
7. **`creator_product_matches.status` never updated** — stays "suggested" forever after outreach sent

### Journey Status: **PARTIAL** — Steps 1-2, 4, 6-7 work; scoring duplicated; no pipeline status tracking

---

## Appendix: All Supabase Tables Referenced

| Table | J1 | J2 | J3 | J4 | J5 | Operations |
|-------|----|----|----|----|----|----|
| `products` | R/W | R | — | R/W | R | SELECT, INSERT, UPDATE, UPSERT |
| `profiles` | — | R | — | — | — | SELECT (role check) |
| `clients` | R | R | — | — | — | SELECT |
| `scan_history` | W | — | — | — | — | INSERT, UPDATE |
| `product_allocations` | R/W | R | — | — | — | SELECT, INSERT |
| `subscriptions` | — | R | R/W | — | — | SELECT, UPSERT, UPDATE |
| `content_queue` | — | R/W | — | — | — | SELECT, INSERT, UPDATE |
| `content_credits` | — | R/W | — | — | — | SELECT, UPDATE, INSERT |
| `usage_tracking` | — | W | — | — | — | INSERT |
| `connected_channels` | R | — | — | R | — | SELECT |
| `influencers` | — | — | — | — | R | SELECT |
| `creator_product_matches` | — | — | — | — | R/W | SELECT, INSERT |
| `outreach_emails` | — | — | — | — | W | INSERT, UPDATE |
| `affiliate_programs` | — | — | — | — | — | (seeded data, no ops) |
| `affiliate_commissions` | — | — | MISSING | — | — | TABLE NOT IN MIGRATIONS |
| `affiliate_referrals` | — | — | MISSING | — | — | TABLE NOT IN MIGRATIONS |
| `notifications` | — | — | — | MISSING | — | TABLE NOT IN MIGRATIONS |
| `shop_products` | MISSING | — | — | — | — | TABLE NOT IN MIGRATIONS |
| `orders` | — | — | — | R | — | SELECT (via Shopify webhook) |

## Appendix: All BullMQ Queues Referenced

| Queue | Used In | Processor | Status |
|-------|---------|-----------|--------|
| `product-scan` | J1 (bypassed) | `processProductScan` | IMPLEMENTED (but scan route uses sync) |
| `enrich-product` | — | `processEnrichProduct` | IMPLEMENTED |
| `tiktok-discovery` | — | `processTikTokDiscovery` | IMPLEMENTED |
| `creator-matching` | J5 | `processCreatorMatching` | IMPLEMENTED |
| `content-queue` | J2 (bypassed) | `processContentQueue` | STUB |
| `distribution-queue` | J2 | `processDistribution` | STUB |
| `scoring-queue` | J4 | `processScoring` | STUB |
| `pod-discovery` | J4 | `processPodDiscovery` | STUB |
| `pod-provision` | J4 | `processPodProvision` | STUB |
| `pod-fulfillment-sync` | J4 | `processPodFulfillmentSync` | STUB |
| `push-to-shopify` | J1, J4 | `processPushToShopify` | STUB |
| `notification-queue` | J4 | `processNotification` | STUB |
| `influencer-outreach` | J5 | `processInfluencerOutreach` | STUB |
| `affiliate-commission-track` | J3 | `processAffiliateCommissionTrack` | STUB |
