# AUDIT REPORT: Pricing Tiers, Product Allocation & Automation Levels

**Audit Date:** 2026-03-18
**Scope:** v8 Spec (Sections 3.2, 5.2, 6A) vs. Codebase Implementation
**Auditor:** Claude Code

---

## Section 1 — Pricing Tier Definition

### Check 1.1: Tier Names and Prices

- **Spec Requirement:** Four tiers — Starter ($29/$19), Growth ($59/$39), Professional ($99/$69), Enterprise ($149/$99)
- **Code Reality:** `src/lib/stripe.ts:19-56` defines exactly these four tiers with matching monthly and annual prices.
- **Status:** MATCH

### Check 1.2: Channel (Platform) Limits Per Tier

- **Spec Requirement:** Starter=1, Growth=2, Professional=3, Enterprise=All channels
- **Code Reality:** `src/lib/stripe.ts:25,34,43,52` — Starter=1, Growth=2, Professional=3, Enterprise=Infinity
- **Status:** MATCH

### Check 1.3: Products Per Platform Limits

- **Spec Requirement:** Spec does not explicitly list per-platform product counts in Section 3.2 pricing table, but the code defines Starter=3, Growth=10, Professional=25, Enterprise=50
- **Code Reality:** Consistently defined in three places: `stripe.ts`, `PACKAGE_TIERS` in `types/product.ts:103-108`, and `PLAN_LIMITS` in `admin/clients/route.ts:48-53`
- **Status:** MATCH

### Check 1.4: Content Credits Per Tier

- **Spec Requirement:** Starter=50, Growth=200, Professional=500, Enterprise=Unlimited (Section 3.2)
- **Code Reality:** `src/lib/stripe.ts:26,35,44,53` — Starter=50, Growth=200, Professional=500, Enterprise=Infinity. Credit costs per type also defined in `CONTENT_CREDIT_COSTS` (lines 59-68) matching spec exactly.
- **Status:** MATCH

### Check 1.5: Engine Access Per Tier

- **Spec Requirement:** Starter=Product Finder; Growth=+Shop Connect, Creative Studio; Professional=+Creator Connect, Supplier Finder, Smart Publisher; Enterprise=All engines + API access
- **Code Reality:** `src/lib/stripe.ts:27,36,45,54` uses internal engine names (`discovery`, `analytics`, `content`, etc.) not client-facing names. The engines listed are reasonable mappings but **Growth includes `analytics` and `store_integration`** while the spec says "Shop Connect + Creative Studio". Growth's `analytics` engine is not mentioned in the spec's Growth tier.
- **Status:** PARTIAL
- **File + Line:** `src/lib/stripe.ts:36` — Growth tier includes `analytics` engine not listed in spec

### Check 1.6: Free Tier

- **Spec Requirement:** Free tier exists: see all products + scores (read-only), 1 platform, no automation, limited to 5 products/week, email digest of HOT products (Section 3.2)
- **Code Reality:** No `free` plan defined in `PRICING_TIERS`. The `clients.plan` DB column CHECK constraint only allows `starter|growth|professional|enterprise`. No free tier in code anywhere.
- **Status:** NOT_IMPLEMENTED

### Check 1.7: Content Credits Passed Through Auth Context

- **Spec Requirement:** Each tier has a `contentCredits` allocation; the auth context should make this available to enforce limits.
- **Code Reality:** `src/lib/auth/client-api-auth.ts:64-69` builds subscription context with `engines`, `productsPerPlatform`, and `platforms` — but **omits `contentCredits`**. The field exists in `PRICING_TIERS` but is never passed to the client auth result.
- **Status:** PARTIAL
- **File + Line:** `src/lib/auth/client-api-auth.ts:64-69` — `contentCredits` not included in `ClientAuthResult.subscription`

### Check 1.8: `default_product_limit` Set on Plan Change

- **Spec Requirement:** When an admin changes a client's plan, the product limit should update to match the tier.
- **Code Reality:** `src/app/api/admin/clients/route.ts:74-80` (PUT handler) correctly validates the plan against `VALID_PLANS` and auto-sets `default_product_limit` from `PLAN_LIMITS`.
- **Status:** MATCH

### Check 1.9: `default_product_limit` Set on Client Creation

- **Spec Requirement:** New clients should have their product limit set based on their plan.
- **Code Reality:** `src/app/api/admin/clients/route.ts:34-38` (POST handler) inserts `{ name, email, plan, niche, notes }` but **does not set `default_product_limit`**. It relies on the DB default of `3`, which only works if the plan is `starter`. If an admin creates a client with `plan: 'growth'`, the limit will be `3` instead of `10`.
- **Status:** MISMATCH
- **File + Line:** `src/app/api/admin/clients/route.ts:36` — POST does not compute `default_product_limit` from `PLAN_LIMITS`

---

## Section 2 — Product Allocation & Visibility

### Check 2.1: `visible_to_client` Column

- **Spec Requirement:** Section 5.2 — `product_allocations.visible_to_client` controls product visibility per client
- **Code Reality:** `supabase/migrations/005_complete_schema.sql:287` — `visible_to_client BOOLEAN DEFAULT false` exists with correct default.
- **Status:** MATCH

### Check 2.2: RLS Policy — Clients See Only Visible Allocations

- **Spec Requirement:** Multi-tenant isolation — each client sees ONLY their allocated visible products via RLS
- **Code Reality:** `005_complete_schema.sql:300-308` — RLS policy filters on `visible_to_client = true AND client_id matches user email join`. Correctly enforced.
- **Status:** MATCH

### Check 2.3: Allocation Limit Enforcement

- **Spec Requirement:** Product allocations should not exceed the client's `default_product_limit`
- **Code Reality:** `src/app/api/admin/allocations/route.ts:28-45` — Counts active allocations, compares `currentCount + productIds.length > client.default_product_limit`, returns 400 if exceeded.
- **Status:** MATCH

### Check 2.4: Dashboard Products API Filters by Visibility

- **Spec Requirement:** Client dashboard must only return products where `visible_to_client = true`
- **Code Reality:** `src/app/api/dashboard/products/route.ts:50-51` — `.eq("client_id", client.clientId).eq("visible_to_client", true)` — correctly double-filtered (application-level + RLS).
- **Status:** MATCH

### Check 2.5: Allocation Source Types

- **Spec Requirement:** Allocations can come from default packages or fulfilled requests
- **Code Reality:** `005_complete_schema.sql:290` — `source TEXT DEFAULT 'default_package' CHECK (source IN ('default_package', 'request_fulfilled'))` — matches spec.
- **Status:** MATCH

### Check 2.6: Unique Constraint on Allocation

- **Spec Requirement:** A product should only be allocated once per client
- **Code Reality:** `005_complete_schema.sql:293` — `UNIQUE(client_id, product_id)` enforced at DB level.
- **Status:** MATCH

---

## Section 3 — Scoring Engine

### Check 3.1: Final Score Formula

- **Spec Requirement:** `final_score = (trend_score * 0.40) + (viral_score * 0.35) + (profit_score * 0.25)` (Section at line 2375)
- **Code Reality:** `src/lib/scoring/composite.ts:134-141` — `trend * 0.40 + viral * 0.35 + profit * 0.25`, clamped 0-100.
- **Status:** MATCH

### Check 3.2: Tier Classification Thresholds

- **Spec Requirement:** HOT >= 80, WARM 60-79, WATCH 40-59, COLD < 40 (spec line 2415-2418)
- **Code Reality:** `src/lib/scoring/composite.ts:145-150` — `>= 80 HOT, >= 60 WARM, >= 40 WATCH, else COLD`
- **Status:** MATCH

### Check 3.3: Auto-Rejection Rules

- **Spec Requirement:** Gross margin < 40%, shipping > 30% of retail, break-even > 2 months, fragile without certification, no US delivery < 15 days
- **Code Reality:** `src/lib/scoring/composite.ts:183-203` — All five spec rules implemented, plus three additional checks (IP risk, price < $10, competitor count > 100). Additional checks are reasonable extensions.
- **Status:** MATCH

### Check 3.4: AI Insight Tier

- **Spec Requirement:** Sonnet for premium/high-score products only, Haiku for bulk (CLAUDE.md G12)
- **Code Reality:** `src/lib/scoring/composite.ts:163-167` — `>= 75 sonnet (on-demand only), >= 60 haiku, else none`. Comment explicitly says "NEVER automatic" for Sonnet.
- **Status:** MATCH

---

## Section 4 — Automation Jobs & Controls

### Check 4.1: All Jobs Disabled by Default

- **Spec Requirement:** "All automation jobs are DISABLED by default. Each can be enabled independently." (Section 1.3, rule 4)
- **Code Reality:** `005_complete_schema.sql:352-364` — All 11 jobs seeded with `status: 'disabled'`. `ON CONFLICT DO NOTHING` prevents re-enabling on migration re-run.
- **Status:** MATCH

### Check 4.2: Job Status Transitions

- **Spec Requirement:** Jobs can be: disabled, enabled, running, completed, failed
- **Code Reality:** `005_complete_schema.sql:336` — CHECK constraint `('disabled', 'enabled', 'running', 'completed', 'failed')` — matches spec.
- **Status:** MATCH

### Check 4.3: Master Kill Switch Placement

- **Spec Requirement:** Section 6A.3 — "Big Red Button" — Pause All Automation visible in dashboard header
- **Code Reality:** `src/app/api/admin/automation/route.ts:30-43` — `killSwitch: true` disables all jobs. UI exists in admin automation page. However, it's only on the automation page, **not in the dashboard header** as the spec requires.
- **Status:** PARTIAL
- **File + Line:** `src/app/admin/automation/page.tsx` — Kill switch is on automation page, not in dashboard header as spec requires

### Check 4.4: 3-Level Automation Control System (Manual/Assisted/Auto-Pilot)

- **Spec Requirement:** Section 6A.1-6A.2 — Every automatable feature supports three levels. Default is Level 1 (Manual). 5 features with per-feature level configuration (Product Upload, Content Creation, Content Publishing, Influencer Outreach, Product Discovery).
- **Code Reality:** No `automation_levels` table, no per-feature level configuration, no client-side automation settings. The `automation_jobs` table only has binary enabled/disabled toggle, not 3-level control.
- **Status:** NOT_IMPLEMENTED

### Check 4.5: Auto-Pilot Hard Limits

- **Spec Requirement:** Section 6A.3 — Daily spend cap, content volume cap, product upload cap, outreach cap, pause-on-error (3x consecutive fails)
- **Code Reality:** No hard limit tables, no daily cap tracking, no consecutive failure counter.
- **Status:** NOT_IMPLEMENTED

### Check 4.6: Auto-Pilot Soft Limits

- **Spec Requirement:** Section 6A.3 — Content approval window, product categories, price range, minimum score, quiet hours, weekly digest
- **Code Reality:** No soft limit configuration exists anywhere in the codebase.
- **Status:** NOT_IMPLEMENTED

### Check 4.7: Per-Feature Per-Client Pause

- **Spec Requirement:** Section 6A.3 — Can pause any individual feature's automation independently
- **Code Reality:** Individual job toggling exists (`PATCH /api/admin/automation` with `job_name + status`), but this operates at the job level, not at the per-feature per-client level the spec describes.
- **Status:** PARTIAL
- **File + Line:** `src/app/api/admin/automation/route.ts:47-61` — Job-level toggle exists but not per-feature per-client

### Check 4.8: Action-Level Audit Trail

- **Spec Requirement:** Section 6A.3 — "Complete audit trail of every automated action"
- **Code Reality:** The `automation_jobs` table tracks `records_processed`, `error_log`, `started_at`, `completed_at` per job, but there is no per-action audit trail table recording individual automated actions.
- **Status:** PARTIAL
- **File + Line:** `supabase/migrations/005_complete_schema.sql:339-344` — Job-level stats only, no action-level audit log

---

## Section 5 — Auth & Subscription Context

### Check 5.1: Client Auth Resolves Subscription

- **Spec Requirement:** Client API routes must verify client role and resolve subscription context including plan details
- **Code Reality:** `src/lib/auth/client-api-auth.ts:24-79` — Verifies token, checks `role = 'client'`, resolves client ID, fetches subscription, builds context with plan/status/engines/productsPerPlatform/platforms.
- **Status:** MATCH

### Check 5.2: Subscription Status Gate

- **Spec Requirement:** Only active subscriptions should grant access to tier features
- **Code Reality:** `src/lib/auth/client-api-auth.ts:62` — `if (sub && sub.status === "active")` — correctly gates on active status. Inactive subscriptions return `null`.
- **Status:** MATCH

### Check 5.3: Engine Gating Enforcement

- **Spec Requirement:** Each tier unlocks specific engines; features should be gated by engine access
- **Code Reality:** `src/lib/auth/client-api-auth.ts:67` — `engines: tier?.engines || []` is resolved and returned, but **no API route actually checks `subscription.engines`** before allowing access to engine-specific endpoints.
- **Status:** PARTIAL
- **File + Line:** `src/lib/auth/client-api-auth.ts:67` — Engines resolved but never enforced in API routes

### Check 5.4: Multi-Channel Discount

- **Spec Requirement:** "Multi-channel discount: 20% off second channel, 30% off third+" (Section 3.2, line 245)
- **Code Reality:** No discount logic exists in `stripe.ts`, subscription routes, or checkout session creation.
- **Status:** NOT_IMPLEMENTED

### Check 5.5: Stripe Subscription Lifecycle

- **Spec Requirement:** Stripe-based subscription management (Section 6.2 — Phase B)
- **Code Reality:** `src/app/api/dashboard/subscription/route.ts:26-83` — Stripe Checkout session creation exists. However, the spec itself marks this as "Not built" in Section 6.2. The POST endpoint creates checkout sessions but webhook handling for subscription lifecycle is minimal.
- **Status:** PARTIAL
- **File + Line:** `src/app/api/dashboard/subscription/route.ts:26-83` — Checkout exists but full lifecycle (upgrade, downgrade, cancellation sync) not implemented

---

## SUMMARY TABLE

| # | Check | Status | Severity |
|---|-------|--------|----------|
| 1.1 | Tier names and prices | MATCH | — |
| 1.2 | Channel limits per tier | MATCH | — |
| 1.3 | Products per platform limits | MATCH | — |
| 1.4 | Content credits per tier | MATCH | — |
| 1.5 | Engine access per tier | PARTIAL | MEDIUM |
| 1.6 | Free tier | NOT_IMPLEMENTED | MEDIUM |
| 1.7 | Content credits in auth context | PARTIAL | MEDIUM |
| 1.8 | `default_product_limit` on plan change | MATCH | — |
| 1.9 | `default_product_limit` on client creation | MISMATCH | HIGH |
| 2.1 | `visible_to_client` column | MATCH | — |
| 2.2 | RLS for client visibility | MATCH | — |
| 2.3 | Allocation limit enforcement | MATCH | — |
| 2.4 | Dashboard products visibility filter | MATCH | — |
| 2.5 | Allocation source types | MATCH | — |
| 2.6 | Unique allocation constraint | MATCH | — |
| 3.1 | Final score formula | MATCH | — |
| 3.2 | Tier classification thresholds | MATCH | — |
| 3.3 | Auto-rejection rules | MATCH | — |
| 3.4 | AI insight tier | MATCH | — |
| 4.1 | All jobs disabled by default | MATCH | — |
| 4.2 | Job status transitions | MATCH | — |
| 4.3 | Master kill switch placement | PARTIAL | LOW |
| 4.4 | 3-level automation control | NOT_IMPLEMENTED | HIGH |
| 4.5 | Auto-pilot hard limits | NOT_IMPLEMENTED | MEDIUM |
| 4.6 | Auto-pilot soft limits | NOT_IMPLEMENTED | LOW |
| 4.7 | Per-feature per-client pause | PARTIAL | MEDIUM |
| 4.8 | Action-level audit trail | PARTIAL | MEDIUM |
| 5.1 | Client auth resolves subscription | MATCH | — |
| 5.2 | Subscription status gate | MATCH | — |
| 5.3 | Engine gating enforcement | PARTIAL | HIGH |
| 5.4 | Multi-channel discount | NOT_IMPLEMENTED | LOW |
| 5.5 | Stripe subscription lifecycle | PARTIAL | MEDIUM |

**Totals:** 16 MATCH, 8 PARTIAL, 1 MISMATCH, 5 NOT_IMPLEMENTED
