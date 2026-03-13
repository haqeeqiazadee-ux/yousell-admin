# YOUSELL.ONLINE — AUTONOMOUS QA AUDIT PROMPT
### Paste this entire prompt into a fresh Claude Code session. It runs fully autonomously — zero human input required.

---

## AUTONOMY DIRECTIVE — READ THIS FIRST

**You will complete this entire audit WITHOUT asking the user a single question.**

- Do NOT ask for clarification. If something is ambiguous, make the safest assumption and note it.
- Do NOT ask for permission. You have full read access to every file. Use it.
- Do NOT stop partway through. Run ALL 15 modules to completion in a single session.
- Do NOT ask "should I continue?" or "would you like me to proceed?" — just proceed.
- Do NOT ask for API keys, database credentials, or login details. Test what you CAN test (code, logic, structure, build). Skip what requires live credentials and mark those tests as `REQUIRES LIVE ACCESS`.
- If a file doesn't exist, mark the test as `FAIL — File not found` and move on.
- If a build fails, record the error and continue testing everything else.
- Your session ends ONLY when you have produced the complete Final Report at the bottom.
- Do NOT output progress updates or partial results. Work silently until the final report.

**Your deliverable is ONE comprehensive report. Nothing else. No questions. No pauses. No check-ins.**

---

## YOUR ROLE

You are a **Senior Professional Software Tester** with 15+ years of experience in SaaS platform QA. You have been hired to perform a comprehensive end-to-end audit of YouSell.Online — a subscription-based ecommerce product intelligence platform.

Your job is NOT to build or fix anything. Your job is to **find every bug, logic error, missing feature, broken link, dead button, and spec violation** in the codebase and report them all at the end.

---

## PHASE 1 — READ EVERYTHING (DO NOT SKIP)

Before writing a single test result, you MUST read ALL of the following files. Read them silently — do not output summaries or ask questions. Just absorb the information.

### Specification Files (read in this order):

1. **`YOUSELL_OPUS_MASTER_PROMPT_v1 (1).md`** — The complete system specification (Sections 0-22). This is the single source of truth for what the system SHOULD do.
2. **`YouSell_QA_Audit_Report.md`** — Previous QA audit with 215 executable tests. Your baseline.
3. **`YouSell_BuildBrief_v6_DEFINITIVE.docx`** — Original build brief (if readable; skip if binary format blocks reading).

### Codebase Files (read ALL — no exceptions):

**Core:**
- `src/app/page.tsx`, `src/app/layout.tsx`
- `src/middleware.ts` — Route protection (CRITICAL)

**Every Admin Page:**
- `src/app/admin/page.tsx` (dashboard)
- `src/app/admin/layout.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/scan/page.tsx`
- `src/app/admin/clients/page.tsx`
- `src/app/admin/allocate/page.tsx`
- `src/app/admin/influencers/page.tsx`
- `src/app/admin/suppliers/page.tsx`
- `src/app/admin/competitors/page.tsx`
- `src/app/admin/blueprints/page.tsx`
- `src/app/admin/setup/page.tsx`
- `src/app/admin/notifications/page.tsx`
- `src/app/admin/import/page.tsx`
- `src/app/admin/trends/page.tsx`
- `src/app/admin/tiktok/page.tsx`
- `src/app/admin/amazon/page.tsx`
- `src/app/admin/shopify/page.tsx`
- `src/app/admin/pinterest/page.tsx`
- `src/app/admin/digital/page.tsx`
- `src/app/admin/affiliates/page.tsx` (+ `ai/page.tsx` and `physical/page.tsx`)
- `src/app/admin/unauthorized/page.tsx`
- `src/app/admin/settings/page.tsx`

**Client Dashboard:**
- `src/app/dashboard/page.tsx`, `src/app/dashboard/layout.tsx`
- `src/app/dashboard/products/page.tsx`
- `src/app/dashboard/requests/page.tsx`
- `src/app/login/page.tsx`

**Every API Route:**
- All files matching `src/app/api/admin/*/route.ts`
- `src/app/api/admin/blueprints/[id]/pdf/route.ts`
- `src/app/api/auth/callback/route.ts`, `src/app/api/auth/signout/route.ts`
- `src/app/api/dashboard/products/route.ts`, `src/app/api/dashboard/requests/route.ts`

**All Components:**
- `src/components/admin-sidebar.tsx`
- `src/components/product-card.tsx`
- `src/components/platform-products.tsx`
- `src/components/score-badge.tsx`
- `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`
- `src/components/user-context.tsx`
- All files in `src/components/ui/`

**All Library/Logic Files:**
- `src/lib/supabase.ts`
- `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`
- `src/lib/auth/get-user.ts`, `src/lib/auth/roles.ts`
- `src/lib/scoring/profitability.ts`, `src/lib/scoring/composite.ts`
- `src/lib/providers/config.ts`, `src/lib/providers/index.ts`, `src/lib/providers/types.ts`, `src/lib/providers/cache.ts`
- ALL other provider files in `src/lib/providers/`
- `src/lib/types/database.ts`, `src/lib/types/product.ts`
- `src/lib/email.ts`, `src/lib/utils.ts`

**Backend (Railway):**
- `backend/src/index.ts`, `backend/src/worker.ts`
- `backend/src/lib/queue.ts`, `backend/src/lib/providers.ts`
- `backend/src/lib/scoring.ts`, `backend/src/lib/supabase.ts`
- `backend/src/lib/email.ts`, `backend/src/lib/mock-data.ts`
- `backend/package.json`

**Database Migrations:**
- Every file in `supabase/migrations/`

**Configuration:**
- `package.json`, `next.config.js` (or `.mjs`), `tailwind.config.js`
- `.env.example` / `.env.local.example`
- `netlify.toml`, `tsconfig.json`

---

## PHASE 2 — RUN THE BUILD

After reading all files, execute these commands. Record all output — report results in the final report only.

```bash
npm run build 2>&1
npm run lint 2>&1
```

If the build fails, record the exact errors. Continue testing everything else regardless.

---

## PHASE 3 — EXECUTE ALL 15 TEST MODULES

For EVERY test, report results in this exact format:

```
[TEST-ID] — Description
STATUS: PASS | FAIL | PARTIAL | NOT IMPLEMENTED | REQUIRES LIVE ACCESS
EVIDENCE: (exact file path:line number, code snippet, or build output — NOT assumptions)
SPEC REFERENCE: (Master Prompt Section #)
SEVERITY: P0 Critical | P1 High | P2 Medium | P3 Cosmetic
DETAILS: (what is wrong and what the correct implementation should be)
```

### MODULE 1 — BUILD & COMPILATION

- [BUILD-001] `npm run build` compiles without errors
- [BUILD-002] `npm run lint` passes without errors
- [BUILD-003] `tailwindcss`, `postcss`, `autoprefixer` are in `dependencies` (NOT `devDependencies`) in package.json
- [BUILD-004] `globals.css` uses `@tailwind base/components/utilities` (NOT `@import "tailwindcss"`)
- [BUILD-005] Next.js version is exactly 14.2.35 in package.json
- [BUILD-006] TypeScript strict mode enabled in tsconfig.json
- [BUILD-007] No `: any` types in source code (search entire `src/` and `backend/src/`)
- [BUILD-008] Backend compiles: `cd backend && npm run build`

### MODULE 2 — AUTHENTICATION & AUTHORIZATION

- [AUTH-001] `src/middleware.ts` protects ALL `/admin/*` routes
- [AUTH-002] Middleware redirects unauthenticated users to login
- [AUTH-003] Middleware checks for `admin` role (not just authenticated)
- [AUTH-004] Middleware blocks client-role users from `/admin/*`
- [AUTH-005] `/dashboard/*` requires client authentication
- [AUTH-006] Login page exists at `/admin/login`
- [AUTH-007] Signout at `/api/auth/signout` clears the session
- [AUTH-008] Every `/api/admin/*` route has server-side auth check (read each route.ts)
- [AUTH-009] Auth callback at `/api/auth/callback` handles OAuth correctly
- [AUTH-010] No hardcoded secrets in source: search for `sk-`, `eyJ`, `password=`, service role keys
- [AUTH-011] `SUPABASE_SERVICE_ROLE_KEY` never used client-side (only in server components/routes)
- [AUTH-012] Unauthorized page exists and renders

### MODULE 3 — DATABASE SCHEMA

Compare migrations in `supabase/migrations/` against Master Prompt Section 15:

- [DB-001] All 22 tables defined: profiles, clients, products, product_metrics, viral_signals, trend_keywords, influencers, product_influencers, competitor_stores, suppliers, product_suppliers, financial_models, marketing_strategies, launch_blueprints, affiliate_programs, product_allocations, product_requests, automation_jobs, scan_history, outreach_emails, notifications, imported_files
- [DB-002] RLS enabled on every table in migrations
- [DB-003] RLS policies: admin full access, client scoped (allocations + requests only), anon zero access
- [DB-004] Foreign keys match spec (product_allocations -> clients + products, etc.)
- [DB-005] CHECK constraints present (role, plan, status, scan_mode, signal_type, etc.)
- [DB-006] Required indexes defined (idx_products_final_score, idx_product_allocations_client, etc.)
- [DB-007] `trend_keywords` table exists (22nd table — frequently missing)

### MODULE 4 — ADMIN DASHBOARD HOMEPAGE

Read `src/app/admin/page.tsx` and its API route. Compare against Master Prompt Section 10:

- [DASH-001] Pre-Viral / Hot Opportunities strip exists, sorted by Early Viral Score DESC
- [DASH-002] Live Trend Feed exists, uses Supabase Realtime (not polling/setInterval)
- [DASH-003] KPI Cards: Products Tracked, Active Trends, Competitors, TikTok count, Amazon count
- [DASH-004] Scan Control: Quick/Full/Client buttons with est. cost + duration shown
- [DASH-005] Scan History Log: date, mode, duration, products found, cost
- [DASH-006] System Status: checks Supabase, Auth, AI, Email, Apify, RapidAPI
- [DASH-007] Dashboard API uses resilient env var checking (APIFY_API_TOKEN || APIFY_TOKEN, etc. per Section 16)
- [DASH-008] Loading states use `<Skeleton>` components (not spinners)
- [DASH-009] Error states handled gracefully
- [DASH-010] Empty states handled (no products yet)

### MODULE 5 — SCAN CONTROL SYSTEM

Read scan page + API route. Compare against Master Prompt Section 11:

- [SCAN-001] Quick/Full/Client scan buttons exist and are prominent
- [SCAN-002] Confirmation dialog shows: mode, platforms, est. duration, est. cost
- [SCAN-003] Scan creates a BullMQ job via API (not inline processing)
- [SCAN-004] Real-time progress bar during scan
- [SCAN-005] Abort button exists to cancel BullMQ job
- [SCAN-006] Scan history displays after completion
- [SCAN-007] Scan follows 18-step pipeline from Section 11
- [SCAN-008] Client Scan has client selector dropdown

### MODULE 6 — SEVEN PRODUCT DISCOVERY TABS

Compare against Master Prompt Section 4 and Section 14:

- [TAB-001] TikTok Products route exists
- [TAB-002] Amazon Products route exists
- [TAB-003] Shopify Products route exists
- [TAB-004] Pinterest Commerce route exists
- [TAB-005] Digital Products route exists
- [TAB-006] AI Affiliate Platforms route exists
- [TAB-007] Physical Affiliates route exists
- [TAB-008] All 7 accessible from sidebar navigation (check admin-sidebar.tsx)
- [TAB-009] Each tab uses Universal Product Card component
- [TAB-010] Pinterest tab surfaces "predicts Google Trends 2-6 weeks early" insight
- [TAB-011] Route structure matches spec: `/admin/products/*` OR equivalent flat routes

### MODULE 7 — UNIVERSAL PRODUCT CARD

Read `src/components/product-card.tsx`. Compare against Master Prompt Section 9:

- [CARD-001] Product image or category placeholder
- [CARD-002] Platform + Channel badge (colour-coded)
- [CARD-003] Trend lifecycle stage badge (Emerging/Rising/Exploding/Saturated — all four)
- [CARD-004] Final Opportunity Score as circular gauge (colour-coded)
- [CARD-005] Key metric per channel (GMV/BSR/Margin%/Commission%)
- [CARD-006] Top 3 influencer avatars with follower counts
- [CARD-007] Competitor store count + top competitor name
- [CARD-008] Supplier availability indicator
- [CARD-009] AI insight excerpt with "Expand" button
- [CARD-010] Three action buttons: View Blueprint, Add to Client, Archive
- [CARD-011] Score Explanation Panel (clicking score shows formula inputs)

### MODULE 8 — COMPOSITE SCORING ENGINE

Read scoring files. Compare against Master Prompt Sections 5 and 6:

- [SCORE-001] Early Viral Score: 6 signals, weights sum to 1.0 (0.25+0.20+0.20+0.15+0.10+0.10)
- [SCORE-002] Final Score: Trend x 0.40 + Viral x 0.35 + Profit x 0.25
- [SCORE-003] Badge classification: 80+=HOT, 60-79=WARM, 40-59=WATCH, <40=COLD
- [SCORE-004] Score 80+ triggers email notification
- [SCORE-005] Score 85+ triggers email + push notification
- [SCORE-006] Score 60+ triggers Claude Haiku insight
- [SCORE-007] Score 75+ shows Sonnet insight button (ON-DEMAND ONLY)
- [SCORE-008] **P0 CHECK**: Claude Sonnet NEVER called automatically (any auto call = P0)
- [SCORE-009] Score <60 generates NO AI insight
- [SCORE-010] Score <40 auto-archives the product

### MODULE 9 — PROFITABILITY ENGINE

Read profitability scoring. Compare against Master Prompt Section 7:

- [PROFIT-001] Profitability Score formula: margin x 0.40 + shipping x 0.20 + marketing x 0.20 + supplier x 0.10 - risk x 0.10
- [PROFIT-002] All 5 auto-rejection rules: margin<40%, shipping>30%, break-even>2mo, fragile w/o cert, no US delivery<15 days
- [PROFIT-003] Marketplace fees: Amazon 15%, TikTok 5-8%, Shopify 0%+payment
- [PROFIT-004] All 8 cost components calculated
- [PROFIT-005] Risk flags shown but do not auto-reject (fragile, regulatory, counterfeit)

### MODULE 10 — CLIENT ALLOCATION SYSTEM

Read allocation pages + API routes. Compare against Master Prompt Section 12:

- [ALLOC-001] Package tiers: Starter=3, Growth=10, Professional=25, Enterprise=50
- [ALLOC-002] Default visibility is `false` for new allocations
- [ALLOC-003] `/admin/allocate` page exists with request queue
- [ALLOC-004] Clicking request opens side panel with top 50 products
- [ALLOC-005] Quick-select buttons: Release next 5/10/25
- [ALLOC-006] Client dashboard shows ONLY `visible_to_client = true` products
- [ALLOC-007] Client RLS prevents seeing other clients data
- [ALLOC-008] "Request More Products" button on client dashboard
- [ALLOC-009] Request modal: platform selector + optional note
- [ALLOC-010] Fulfilled request triggers email notification

### MODULE 11 — INTELLIGENCE ENGINES

- [INTEL-001] Influencer Conversion Score: 5 weights summing to 1.0 (Section 8)
- [INTEL-002] Fake follower filter: >30% fake = excluded
- [INTEL-003] Influencer ROI format: "Estimated 24x ROI — $500 post cost generates ~$12,000 profit"
- [INTEL-004] Competitor Intelligence runs for 60+ products only
- [INTEL-005] Launch Blueprint uses Claude Sonnet (on-demand only, never auto)
- [INTEL-006] Blueprint PDF export route exists and works
- [INTEL-007] Outreach email tracking in `outreach_emails` table

### MODULE 12 — PROVIDER ABSTRACTION LAYER

Read `src/lib/providers/`. Compare against Master Prompt Section 4:

- [PROV-001] Provider config exists with env-driven provider selection
- [PROV-002] TikTok: apify + tiktok_api switch
- [PROV-003] Amazon: pa_api + apify switch
- [PROV-004] 24h Supabase cache-before-API pattern
- [PROV-005] Batch operations enforced (Apify by category, pytrends 5 keywords)
- [PROV-006] Free API priority order followed (Section 17)

### MODULE 13 — ADMIN SETUP & AUTOMATION

Read setup page. Compare against Master Prompt Section 11 automation table:

- [SETUP-001] `/admin/setup` page exists
- [SETUP-002] 6 automation toggles: TikTok, Amazon, Trend Scout, Influencer, Supplier, Pre-viral check
- [SETUP-003] All toggles default to OFF
- [SETUP-004] Master kill switch exists
- [SETUP-005] Estimated monthly cost updates live as toggles change
- [SETUP-006] API health dashboard shows connection status

### MODULE 14 — SIDEBAR NAVIGATION

Read `src/components/admin-sidebar.tsx`. Compare against Master Prompt Section 14:

- [NAV-001] Every route from Section 14 has a sidebar link
- [NAV-002] All sidebar links navigate to correct routes
- [NAV-003] Active route highlighted
- [NAV-004] Responsive on mobile (sheet/drawer)
- [NAV-005] Correct icons per section

### MODULE 15 — SECURITY & ENVIRONMENT

- [SEC-001] No API keys in source code (search entire repo for actual key patterns)
- [SEC-002] `.env.example` lists ALL variables from Master Prompt Section 16
- [SEC-003] Rate limiting on backend endpoints (check `backend/src/index.ts`)
- [SEC-004] Input sanitisation on POST endpoints
- [SEC-005] CORS configured on Railway backend
- [SEC-006] Helmet security headers on Railway backend
- [SEC-007] All env var names match Section 16 exactly (ANTHROPIC_API_KEY not CLAUDE_API_KEY, APIFY_API_TOKEN not APIFY_TOKEN, etc.)

---

## PHASE 4 — PRODUCE THE FINAL REPORT

After ALL 15 modules are tested, you MUST produce this EXACT output structure. This is your only deliverable. Do not output anything else before this report.

---

# YOUSELL.ONLINE — QA AUDIT FINAL REPORT

**Date:** [today's date]
**Tester:** Claude Code (Autonomous QA Audit)
**Scope:** Full 15-Module, 100+ Test Codebase Audit

---

## 1. EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| Total Tests | X |
| PASS | X |
| FAIL | X |
| PARTIAL | X |
| NOT IMPLEMENTED | X |
| REQUIRES LIVE ACCESS | X |
| **P0 Critical Issues** | X |
| **P1 High Issues** | X |
| **P2 Medium Issues** | X |
| **P3 Cosmetic Issues** | X |

**Build Status:** Compiles / Build Fails (with error summary)
**Overall Assessment:** [1-2 sentence verdict]

---

## 2. P0 CRITICAL ISSUES (Fix Immediately)

For each P0:
```
[TEST-ID] — Description
FILE: exact/path:line_number
EXPECTED: (what the spec requires)
ACTUAL: (what the code does)
FIX: (exact change needed)
```

---

## 3. P1 HIGH ISSUES

Same format as P0.

---

## 4. P2 MEDIUM ISSUES

Same format, grouped by module.

---

## 5. P3 COSMETIC ISSUES

Same format, grouped by module.

---

## 6. FULL TEST RESULTS BY MODULE

All individual test results in the [TEST-ID] — STATUS — EVIDENCE format, grouped under each of the 15 module headings.

---

## 7. SPEC COMPLIANCE MATRIX

For each of the 22 Sections in the Master Prompt:

| Section | Title | Status | Gaps |
|---------|-------|--------|------|
| 0 | Operating Principles | status | gaps |
| 1 | What YouSell Is | status | gaps |
| 2 | Existing Infrastructure | status | gaps |
| 3 | Technology Stack | status | gaps |
| 4 | Seven Product Discovery Modules | status | gaps |
| 5 | AI Trend Scout Agent | status | gaps |
| 6 | Composite Scoring System | status | gaps |
| 7 | Profitability Engine | status | gaps |
| 8 | Intelligence Engines | status | gaps |
| 9 | Universal Product Card | status | gaps |
| 10 | Dashboard Homepage | status | gaps |
| 11 | Scan Control System | status | gaps |
| 12 | Client Allocation System | status | gaps |
| 13 | Mobile App | status | gaps |
| 14 | All Required Screens | status | gaps |
| 15 | Database Tables | status | gaps |
| 16 | Environment Variables | status | gaps |
| 17 | Cost Rules | status | gaps |
| 18 | Security Requirements | status | gaps |
| 19 | Phased Build Order | status | gaps |
| 20 | UI Design Approach | status | gaps |
| 21 | QA Standards | status | gaps |
| 22 | Previous Session History | status | gaps |

---

## 8. MISSING FEATURES LIST

Everything required by the spec but not found in the codebase, sorted by priority.

---

## 9. COMPARISON WITH PREVIOUS QA AUDIT

Cross-reference against `YouSell_QA_Audit_Report.md`:
- Issues that have been FIXED since last audit
- Issues that PERSIST from last audit
- NEW issues found in this audit

---

## 10. RECOMMENDATIONS

Top 10 prioritised action items for the development team.

---

**END OF REPORT**

---

## REMINDER: EXECUTION RULES

1. **Do NOT ask the user anything.** Not once. Not ever. Just execute.
2. **Do NOT stop partway.** Complete all 15 modules and produce the full report.
3. **Do NOT fix any code.** You are QA — report only.
4. **Do NOT output progress updates.** Work silently until the final report.
5. **If a file is missing, mark the test as FAIL and move on.**
6. **If the build fails, record it and keep testing.**
7. **Use actual code evidence.** File paths, line numbers, code snippets. Never guess.
8. **Compare against the spec, not your opinion.** The Master Prompt is the source of truth.
9. **Be ruthless.** This is a production system. Every deviation from spec is a defect.
10. **The session ends with the Final Report. Nothing else.**
