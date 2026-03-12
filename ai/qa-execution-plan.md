# YOUSELL QA Execution Plan — Micro-Task Breakdown

**Date:** 2026-03-12
**Purpose:** Break the enhanced QA master plan into the smallest possible executable tasks that Claude can process session-by-session without context overload.

---

## How to Use This Plan

### Session Management Rules

1. **One sprint per session.** Each session picks up ONE sprint (3-6 micro-tasks).
2. **Start every session** by reading these files:
   - `ai/qa-execution-plan.md` (this file — find current sprint)
   - `ai/qa-session-log.md` (session history — understand what's done)
   - `ai/qa-bug-tracker.md` (open bugs — avoid duplicating work)
3. **End every session** by updating:
   - This file: Mark completed tasks with ✅ and date
   - `ai/qa-session-log.md`: Add session entry with findings
   - `ai/qa-bug-tracker.md`: Add any new bugs found
4. **Never skip a sprint.** Execute in order. Dependencies matter.
5. **If blocked:** Document the blocker and move to the next task in the sprint.

### Context Recovery Protocol

If chat history compresses mid-session:
```
Read these files to recover:
1. ai/qa-execution-plan.md    — Current sprint and task
2. ai/qa-session-log.md       — What was found so far
3. ai/qa-bug-tracker.md       — Open bugs
4. ai/qa-master-plan-enhanced.md — Full test criteria
5. CLAUDE.md                   — Project context
```

---

## Sprint Overview

| Sprint | Phase(s) | Focus | Tasks | Est. |
|--------|----------|-------|-------|------|
| S01 | 1, 18 | Pre-flight + Known Bugs | 4 | Small |
| S02 | 2a | Architecture: Backend Server | 5 | Medium |
| S03 | 2b | Architecture: Frontend + Middleware | 4 | Medium |
| S04 | 3a | Business Logic: Scoring Engine | 6 | Medium |
| S05 | 3b | Business Logic: Tier & Stage Classification | 5 | Small |
| S06 | 4a | Integration: TikTok + Amazon Providers | 4 | Medium |
| S07 | 4b | Integration: Pinterest + Shopify + Trends | 4 | Medium |
| S08 | 4c | Integration: Influencer + Supplier + Digital | 4 | Medium |
| S09 | 4d | Integration: Affiliate Programs + Caching | 3 | Small |
| S10 | 5a | Security: Auth & Access Control | 5 | Medium |
| S11 | 5b | Security: Input Validation & Injection | 5 | Medium |
| S12 | 6 | Performance: Response Times & Load | 4 | Medium |
| S13 | 7a | UI/UX: Admin Core Pages | 5 | Medium |
| S14 | 7b | UI/UX: Admin Intelligence + Management | 5 | Medium |
| S15 | 7c | UI/UX: Client Dashboard | 4 | Medium |
| S16 | 8 | Error Handling & Chaos Testing | 5 | Medium |
| S17 | 9 | Data Integrity Validation | 5 | Medium |
| S18 | 11 | Client Allocation System | 5 | Medium |
| S19 | 12 | BullMQ Job Queue | 4 | Medium |
| S20 | 13 | CSV Import Pipeline | 4 | Small |
| S21 | 14 | Financial Model & Auto-Rejection | 5 | Medium |
| S22 | 15 | Blueprint & PDF Generation | 4 | Small |
| S23 | 16 | Notifications + Automation | 4 | Small |
| S24 | 17 | Influencer Scoring Validation | 4 | Small |
| S25 | 10 | Final Sign-off & Summary Report | 3 | Small |

**Total: 25 sprints, ~112 micro-tasks**

---

## SPRINT S01 — Pre-Flight & Known Bugs

**Goal:** Establish baseline. Verify known bugs. Map all modified files.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 1.1 | Inventory all database tables referenced in code vs actually used in API routes. Document mismatches. | `src/lib/types/database.ts`, all `route.ts` files | ✅ 2026-03-12 |
| 1.2 | Verify Bug #22: Check if scan API route uses 'scans' or 'scan_history' table name. Document finding. | `src/app/api/admin/scan/route.ts` | ✅ 2026-03-12 |
| 1.3 | Verify Bug #5: Check scan cancel endpoint — does it read jobId from query param or request body? Document mismatch with backend. | `src/app/api/admin/scan/route.ts`, `backend/src/index.ts` | ✅ 2026-03-12 |
| 1.4 | List all environment variables required across frontend and backend. Check for undocumented dependencies. | `backend/src/index.ts`, `src/lib/providers/config.ts`, all route files using `process.env` | ✅ 2026-03-12 |

---

## SPRINT S02 — Architecture: Backend Server

**Goal:** Validate backend Express server, middleware, and request handling.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 2.1 | Review auth middleware: Does it correctly validate JWT? Does it handle expired tokens? Does it attach user to request? | `backend/src/index.ts` (auth middleware section) | ✅ 2026-03-12 |
| 2.2 | Review rate limiting config: General (100/min) and scan (10/min). Are they applied to correct routes? | `backend/src/index.ts` (rate limiter setup) | ✅ 2026-03-12 |
| 2.3 | Review CORS configuration: Is FRONTEND_URL used correctly? Default fallback? | `backend/src/index.ts` (CORS section) | ✅ 2026-03-12 |
| 2.4 | Review Helmet security headers: Which headers are set? Are defaults sufficient? | `backend/src/index.ts` (Helmet config) | ✅ 2026-03-12 |
| 2.5 | Review error handling: Do all routes return proper status codes? Are errors logged with context? | `backend/src/index.ts` (all route handlers) | ✅ 2026-03-12 |

---

## SPRINT S03 — Architecture: Frontend & Middleware

**Goal:** Validate Next.js middleware, layout auth, and Supabase client setup.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 3.1 | Review Next.js middleware: Does it protect /admin/* and /dashboard/* correctly? What about /api/* routes? | `src/middleware.ts` | ✅ 2026-03-12 |
| 3.2 | Review admin layout auth: Does it check role from profiles table? Does it redirect non-admins? | `src/app/admin/layout.tsx` | ✅ 2026-03-12 |
| 3.3 | Review client dashboard layout auth: Does it enforce client role? What happens if admin accesses /dashboard? | `src/app/dashboard/layout.tsx` | ✅ 2026-03-12 |
| 3.4 | Review Supabase client setup: Are admin/server/client clients correctly configured? Any token refresh issues? | `src/lib/supabase/admin.ts`, `server.ts`, `client.ts` | ✅ 2026-03-12 |

---

## SPRINT S04 — Scoring Engine: Formulas

**Goal:** Validate all scoring calculations produce correct results.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 4.1 | Trace trend_score calculation: Verify components (TikTok Growth 35%, Influencer 25%, Amazon 20%, Competition -10%, Margin 10%). Do weights sum to 100%? | `src/lib/scoring/composite.ts` | ✅ 2026-03-12 |
| 4.2 | Trace viral_score calculation: Verify 6 components (micro-influencer 25%, purchase intent 20%, hashtag 20%, niche expansion 15%, engagement 10%, supply 10%). Do weights sum to 100%? | `src/lib/scoring/composite.ts` | ✅ 2026-03-12 |
| 4.3 | Trace profit_score calculation: Verify components (margin 40%, shipping 20%, marketing 20%, supplier 10%, risk -10%). Do weights sum to 100%? | `src/lib/scoring/composite.ts` | ✅ 2026-03-12 |
| 4.4 | Validate final_score formula: trend(0.40) + viral(0.35) + profit(0.25) = 1.00. Test with edge values (all 0, all 100, mixed). | `src/lib/scoring/composite.ts` | ✅ 2026-03-12 |
| 4.5 | Validate backend scoring matches frontend scoring: Compare `backend/src/lib/scoring.ts` with `src/lib/scoring/composite.ts`. Are they consistent? | Both scoring files | ✅ 2026-03-12 |
| 4.6 | Review profitability scoring: Price sweet spots, sales velocity tiers, margin estimates. Are the formulas sound? | `src/lib/scoring/profitability.ts` | ✅ 2026-03-12 |

---

## SPRINT S05 — Scoring Engine: Classification

**Goal:** Validate tier, stage, and AI insight classification boundaries.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 5.1 | Verify tier boundaries: HOT>=80, WARM>=60, WATCH>=40, COLD<40. Test boundary values (79, 80, 59, 60, 39, 40). | Scoring files | ✅ 2026-03-12 |
| 5.2 | Verify trend stage from viral_score: exploding>=80, rising>=60, emerging>=40, saturated<40. | Scoring files | ✅ 2026-03-12 |
| 5.3 | Verify AI insight tier: Sonnet>=75, Haiku>=60, None<60. | Scoring files | ✅ 2026-03-12 |
| 5.4 | Verify score_overall backward compatibility field is set correctly alongside final_score. | `src/app/api/admin/scoring/route.ts` | ✅ 2026-03-12 |
| 5.5 | Verify viral_signals table storage: Are all 7 signal fields stored correctly when viralInputs provided? | `src/app/api/admin/scoring/route.ts` | ✅ 2026-03-12 |

---

## SPRINT S06 — Integration: TikTok + Amazon

**Goal:** Validate TikTok and Amazon provider implementations.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 6.1 | Review TikTok provider: Apify actor ID correct? Response parsing handles all fields? Fallback to official API works? | `src/lib/providers/tiktok/index.ts` | ✅ 2026-03-12 |
| 6.2 | Review Amazon provider: RapidAPI integration correct? ASIN extraction? Fallback to Apify bestsellers? | `src/lib/providers/amazon/index.ts` | ✅ 2026-03-12 |
| 6.3 | Review provider error handling: What happens when API key is missing? When Apify returns empty dataset? When rate limited? | Both provider files | ✅ 2026-03-12 |
| 6.4 | Review backend scraping functions: `scrapePlatform()` and `fetchTrends()` — are URLs correct? Auth headers set? Response validated? | `backend/src/lib/providers.ts` | ✅ 2026-03-12 |

---

## SPRINT S07 — Integration: Pinterest + Shopify + Trends

**Goal:** Validate Pinterest, Shopify, and Trends provider implementations.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 7.1 | Review Pinterest provider: Apify crawler actor correct? Pin data parsing? Saves count extraction? | `src/lib/providers/pinterest/index.ts` | ⬜ |
| 7.2 | Review Shopify provider: Apify scraper correct? Variant handling? Vendor extraction? | `src/lib/providers/shopify/index.ts` | ⬜ |
| 7.3 | Review Trends provider: Google Trends Apify scraper? Keyword batching (groups of 5)? Direction classification? | `src/lib/providers/trends/index.ts` | ⬜ |
| 7.4 | Review provider config: All 19 providers listed? Phase assignments correct? isConfigured checks work? | `src/lib/providers/config.ts` | ⬜ |

---

## SPRINT S08 — Integration: Influencer + Supplier + Digital

**Goal:** Validate influencer, supplier, and digital product providers.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 8.1 | Review Influencer provider: Instagram scraper? Tier classification? CPP estimation? Fallback chain? | `src/lib/providers/influencer/index.ts` | ⬜ |
| 8.2 | Review Supplier provider: Alibaba scraper? MOQ/shipping parsing? CJ Dropshipping fallback? | `src/lib/providers/supplier/index.ts` | ⬜ |
| 8.3 | Review Digital provider: Gumroad scraper? Category mapping? Price extraction? | `src/lib/providers/digital/index.ts` | ⬜ |
| 8.4 | Review provider index: Does the main provider index correctly route to sub-providers? Error isolation? | `src/lib/providers/index.ts` | ⬜ |

---

## SPRINT S09 — Integration: Affiliates + Caching

**Goal:** Validate affiliate program data and caching layer.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 9.1 | Review Affiliate provider: Are 10 AI + 5 physical programs correct? Commission rates accurate? Cookie durations? | `src/lib/providers/affiliate/index.ts` | ⬜ |
| 9.2 | Review caching layer: 24h TTL implementation? Cache key strategy? Stale data handling? | `src/lib/providers/cache.ts` | ⬜ |
| 9.3 | Review provider types: Are TypeScript types consistent across all providers? Any missing fields? | `src/lib/providers/types.ts` | ⬜ |

---

## SPRINT S10 — Security: Auth & Access Control

**Goal:** Validate authentication, authorization, and role enforcement.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 10.1 | Review getUser(): Does it correctly fetch profile role? Handle missing profile? Handle Supabase errors? | `src/lib/auth/get-user.ts` | ⬜ |
| 10.2 | Review requireAdmin(): Does it throw on non-admin? Does it return user on success? Error messages appropriate? | `src/lib/auth/roles.ts` | ⬜ |
| 10.3 | Review OAuth callback: Code exchange flow correct? Error redirect to login? Session establishment? | `src/app/api/auth/callback/route.ts` | ⬜ |
| 10.4 | Review signout: Session cleared? Redirect to login? | `src/app/api/auth/signout/route.ts` | ⬜ |
| 10.5 | Check all admin routes: Does every admin API route call requireAdmin() as first operation? List any that don't. | All `src/app/api/admin/*/route.ts` | ⬜ |

---

## SPRINT S11 — Security: Input Validation & Injection

**Goal:** Validate input sanitization and injection prevention.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 11.1 | Review product field whitelist: Does POST/PATCH only accept allowed fields? Can an attacker inject additional fields? | `src/app/api/admin/products/route.ts` | ⬜ |
| 11.2 | Review influencer sort whitelist: Are only approved sort fields accepted? What happens with invalid sort? | `src/app/api/admin/influencers/route.ts` | ⬜ |
| 11.3 | Review CSV import: Can malicious CSV formulas (=CMD) be injected? Are values sanitized before DB insert? | `src/app/api/admin/import/route.ts` | ⬜ |
| 11.4 | Review blueprint PDF: Is HTML escaping applied to all dynamic content? Test with `<script>` in product title. | `src/app/api/admin/blueprints/[id]/pdf/route.ts` | ⬜ |
| 11.5 | Review settings API: Does it expose actual API key values or just configured/unconfigured status? | `src/app/api/admin/settings/route.ts` | ⬜ |

---

## SPRINT S12 — Performance Review

**Goal:** Identify performance bottlenecks in code patterns (not load testing).

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 12.1 | Review dashboard API: Does it make too many sequential DB queries? Can any be parallelized? | `src/app/api/admin/dashboard/route.ts` | ⬜ |
| 12.2 | Review product listing: Is pagination efficient? Are indexes likely on sort columns? | `src/app/api/admin/products/route.ts` | ⬜ |
| 12.3 | Review scan worker: Is the multi-platform fetch parallelized or sequential? | `backend/src/worker.ts` | ⬜ |
| 12.4 | Review Supabase realtime: Are subscriptions cleaned up on component unmount? Debounce working? | `src/app/admin/page.tsx`, `src/app/dashboard/page.tsx` | ⬜ |

---

## SPRINT S13 — UI/UX: Admin Core Pages

**Goal:** Review admin dashboard, scan, products, trends pages for correctness.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 13.1 | Review admin dashboard: KPI cards accurate? Scan control works? System status correct? | `src/app/admin/page.tsx` | ⬜ |
| 13.2 | Review scan page: Three modes render? Job polling works? History displays? Cost estimates shown? | `src/app/admin/scan/page.tsx` | ⬜ |
| 13.3 | Review products page: CRUD operations? Search? Pagination? Edit/delete dialogs? | `src/app/admin/products/page.tsx` | ⬜ |
| 13.4 | Review trends page: Keyword display? Direction indicators? Add keyword form? | `src/app/admin/trends/page.tsx` | ⬜ |
| 13.5 | Review admin sidebar: All nav groups present? User info displayed? Theme toggle works? | `src/components/admin-sidebar.tsx` | ⬜ |

---

## SPRINT S14 — UI/UX: Admin Intelligence + Management

**Goal:** Review intelligence pages and management features.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 14.1 | Review platform pages: Do all 5 use PlatformProducts correctly? Search works? | TikTok, Amazon, Shopify, Pinterest, Digital pages | ⬜ |
| 14.2 | Review intelligence pages: Competitors, Influencers, Suppliers render and fetch data? | Competitor, Influencer, Supplier pages | ⬜ |
| 14.3 | Review blueprints page: List, create, PDF export all functional? | `src/app/admin/blueprints/page.tsx` | ⬜ |
| 14.4 | Review client management: Add/edit/delete clients? Plan selection? Product limits? | `src/app/admin/clients/page.tsx` | ⬜ |
| 14.5 | Review settings: All 3 tabs render? Provider status shown? Automation controls work? | `src/app/admin/settings/page.tsx` | ⬜ |

---

## SPRINT S15 — UI/UX: Client Dashboard

**Goal:** Review client-facing dashboard for correctness and security.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 15.1 | Review client dashboard layout: Role check? Navigation links? Sign out? | `src/app/dashboard/layout.tsx` | ⬜ |
| 15.2 | Review client dashboard page: KPI cards? Allocated products? Request form? | `src/app/dashboard/page.tsx` | ⬜ |
| 15.3 | Review client products page: Shows only allocated products? Filtering works? | `src/app/dashboard/products/page.tsx` | ⬜ |
| 15.4 | Review client requests page: Status tracking? History display? | `src/app/dashboard/requests/page.tsx` | ⬜ |

---

## SPRINT S16 — Error Handling & Chaos

**Goal:** Trace failure paths through the system.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 16.1 | Trace: What happens when Supabase is unreachable? Do API routes handle it? Does the dashboard show an error? | Multiple route files, dashboard page | ⬜ |
| 16.2 | Trace: What happens when a scan job fails mid-execution? Is scan status updated to 'failed'? Is error stored? | `backend/src/worker.ts` | ⬜ |
| 16.3 | Trace: What happens when Redis is down? Does the scan queue endpoint fail gracefully? | `backend/src/lib/queue.ts`, `backend/src/index.ts` | ⬜ |
| 16.4 | Trace: What happens when all provider API keys are missing? Does the scan still complete with empty results? | `backend/src/lib/providers.ts` | ⬜ |
| 16.5 | Trace: What happens when email sending fails? Does it crash the scan or log and continue? | `backend/src/lib/email.ts`, `backend/src/worker.ts` | ⬜ |

---

## SPRINT S17 — Data Integrity

**Goal:** Validate database constraints and data consistency.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 17.1 | Verify UNIQUE(source, external_id) constraint: Does the upsert handle duplicates? What happens on conflict? | `backend/src/worker.ts` (upsert section) | ⬜ |
| 17.2 | Check for orphan risks: Can deleting a product leave orphaned allocations, blueprints, or financial models? | Product delete route, allocation routes | ⬜ |
| 17.3 | Verify score range: Can any scoring formula produce values outside 0-100? Test edge cases. | Scoring files | ⬜ |
| 17.4 | Verify audit trails: Do all write operations set created_by or updated_by? List any that don't. | All POST/PATCH routes | ⬜ |
| 17.5 | Verify plan tier limits: Does the allocation endpoint correctly count active allocations before allowing new ones? | `src/app/api/admin/allocations/route.ts` | ⬜ |

---

## SPRINT S18 — Client Allocation System

**Goal:** Deep-test the product allocation flow end-to-end.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 18.1 | Review allocation POST: Client validation? Limit check? Insert fields correct? | `src/app/api/admin/allocations/route.ts` | ⬜ |
| 18.2 | Review allocation GET: Pending requests shape? Recent allocations query? Client filter? | `src/app/api/admin/allocations/route.ts` | ⬜ |
| 18.3 | Review client-side product fetch: visible_to_client filter? Product join fields? | `src/app/api/dashboard/products/route.ts` | ⬜ |
| 18.4 | Review product request flow: Client creates request → Admin sees pending → Admin fulfills | Request routes, allocation routes | ⬜ |
| 18.5 | Review allocate page: Quick-select UI? Visibility toggle? Plan limit display? | `src/app/admin/allocate/page.tsx` | ⬜ |

---

## SPRINT S19 — BullMQ Job Queue

**Goal:** Validate job queue implementation and worker reliability.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 19.1 | Review queue setup: Redis connection config? Error handling? Connection events? | `backend/src/lib/queue.ts` | ⬜ |
| 19.2 | Review worker config: Concurrency=2? Job processing events? Failure handling? | `backend/src/worker.ts` (worker setup) | ⬜ |
| 19.3 | Review job status polling: Does GET /api/scan/:jobId return all states correctly? Progress calculation? | `backend/src/index.ts` (scan status route) | ⬜ |
| 19.4 | Review job cancellation: Does cancel update job state? Does worker stop processing? | `backend/src/index.ts` (cancel route), worker | ⬜ |

---

## SPRINT S20 — CSV Import

**Goal:** Validate CSV parsing, column mapping, and error handling.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 20.1 | Review CSV parser: RFC 4180 compliance? Quoted fields? Commas inside quotes? | `src/app/api/admin/import/route.ts` | ⬜ |
| 20.2 | Review column mapping: All fuzzy names handled? Missing required columns detected? | `src/app/api/admin/import/route.ts` | ⬜ |
| 20.3 | Review file type validation: Excel rejected? Empty file handled? | `src/app/api/admin/import/route.ts` | ⬜ |
| 20.4 | Review import UI: File picker? Progress? Success/error display? | `src/app/admin/import/page.tsx` | ⬜ |

---

## SPRINT S21 — Financial Model & Auto-Rejection

**Goal:** Validate financial calculations and rejection rules.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 21.1 | Review financial model POST: totalCost, grossMargin, breakEvenUnits calculations correct? | `src/app/api/admin/financial/route.ts` | ⬜ |
| 21.2 | Review rejection rule 1-3: Margin <40%, Shipping >30%, Break-even >2mo. Boundary values? | `src/app/api/admin/financial/route.ts` | ⬜ |
| 21.3 | Review rejection rule 4-6: Fragile/hazmat, no US delivery <15d, IP risk. Input validation? | `src/app/api/admin/financial/route.ts` | ⬜ |
| 21.4 | Review rejection rule 7-8: Price <$10, 100+ competitors. Edge cases? | `src/app/api/admin/financial/route.ts` | ⬜ |
| 21.5 | Review backend rejection rules: Do they match frontend rules? Are there discrepancies? | `backend/src/lib/scoring.ts` (rejection section) | ⬜ |

---

## SPRINT S22 — Blueprint & PDF

**Goal:** Validate blueprint creation and PDF export security.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 22.1 | Review blueprint POST: All 7 content fields accepted? generated_by set? product_id validated? | `src/app/api/admin/blueprints/route.ts` | ⬜ |
| 22.2 | Review blueprint GET: Product join works? List query correct? | `src/app/api/admin/blueprints/route.ts` | ⬜ |
| 22.3 | Review PDF endpoint: HTML escaping covers all dynamic fields? Content-Type correct? Print CSS present? | `src/app/api/admin/blueprints/[id]/pdf/route.ts` | ⬜ |
| 22.4 | Review blueprint UI: Create form? PDF download/view? Blueprint list display? | `src/app/admin/blueprints/page.tsx` | ⬜ |

---

## SPRINT S23 — Notifications + Automation

**Goal:** Validate notification system and automation controls.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 23.1 | Review notification GET: Only user's notifications? Ordered by date? | `src/app/api/admin/notifications/route.ts` | ⬜ |
| 23.2 | Review notification PATCH: Ownership check (user_id match)? Read state update? | `src/app/api/admin/notifications/route.ts` | ⬜ |
| 23.3 | Review automation GET/PATCH: List jobs? Toggle individual? Master kill switch? | `src/app/api/admin/automation/route.ts` | ⬜ |
| 23.4 | Review notification/automation UI: Display, interaction, state management correct? | Notification + Settings pages | ⬜ |

---

## SPRINT S24 — Influencer Scoring

**Goal:** Validate influencer conversion score algorithm.

| # | Task | Files to Read | Status |
|---|------|---------------|--------|
| 24.1 | Review conversion score formula: 5 components sum to 100? Weights correct? | `src/lib/scoring/composite.ts` or relevant file | ⬜ |
| 24.2 | Review tier classification: nano <10K, micro 10-100K, mid 100K-1M, macro 1M+. Boundary values? | Influencer provider | ⬜ |
| 24.3 | Review CPP estimation: Ranges per tier correct? (Nano $20-100, Micro $100-500, etc.) | Influencer provider | ⬜ |
| 24.4 | Review influencer API: Sort whitelist? Pagination? Filter by platform? | `src/app/api/admin/influencers/route.ts` | ⬜ |

---

## SPRINT S25 — Final Sign-off

**Goal:** Compile all findings into final report. Determine go/no-go.

| # | Task | Description | Status |
|---|------|-------------|--------|
| 25.1 | Compile bug summary: Total bugs found by severity (CRITICAL/HIGH/MEDIUM/LOW). | Read `ai/qa-bug-tracker.md` | ⬜ |
| 25.2 | Generate coverage report: How many test cases passed/failed/blocked across all sprints? | Read this file + session log | ⬜ |
| 25.3 | Write final verdict: APPROVED / BLOCKED with blockers list and accepted risks. | Write to `ai/qa-final-report.md` | ⬜ |

---

## Session Tracking Files

### ai/qa-session-log.md (Create at start of Sprint S01)

```markdown
# QA Session Log

## Session [N] — [Date]
**Sprint:** S[XX]
**Tasks Completed:** [list]
**Bugs Found:** [count + IDs]
**Blockers:** [any]
**Notes:** [observations]
**Next:** S[XX+1]
```

### ai/qa-bug-tracker.md (Create at start of Sprint S01)

```markdown
# QA Bug Tracker

| ID | Severity | Component | Summary | Sprint | Status |
|----|----------|-----------|---------|--------|--------|
| BUG-001 | ... | ... | ... | S01 | Open |
```

---

## Quick Reference: Sprint Prompt Templates

To start any sprint, use this prompt with Claude:

```
Read these files first:
1. ai/qa-execution-plan.md
2. ai/qa-session-log.md
3. ai/qa-bug-tracker.md

Execute Sprint S[XX]. For each task:
- Read the specified files
- Analyze against the test criteria in ai/qa-master-plan-enhanced.md
- Document findings
- Log any bugs found

When done, update:
- This file (mark tasks ✅)
- ai/qa-session-log.md (add session entry)
- ai/qa-bug-tracker.md (add any new bugs)
```
