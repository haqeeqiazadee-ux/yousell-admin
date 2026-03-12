# YOUSELL QA Session Log

**Started:** 2026-03-12
**Plan Version:** 2.0 (Enhanced)

---

## Session 0 — 2026-03-12 (Setup)

**Sprint:** Pre-QA Setup
**Tasks Completed:**
- Gap analysis of original QA plan vs actual codebase
- Created enhanced QA master plan (18 phases, up from 10)
- Created micro-task execution plan (25 sprints, ~112 tasks)
- Created session log and bug tracker

**Key Findings:**
- 10 critical gaps found in original QA plan
- 8 moderate gaps found
- 3 inaccuracies corrected (score thresholds, non-existent systems, table names)
- WATCH tier (score 40-59) was completely missing from original plan
- Client dashboard had zero test coverage in original plan
- Several systems referenced in QA plan don't exist in code (Blotato, HeyGen, VEO3, etc.)

**Bugs Found:** 0 (pre-existing bugs #5 and #22 documented for verification in S01)

**Next:** Sprint S01 — Pre-Flight & Known Bugs

---

## Session 1 — 2026-03-12 (Sprint S01)

**Sprint:** S01 — Pre-Flight & Known Bugs
**Tasks Completed:** 1.1, 1.2, 1.3, 1.4 (all 4 tasks)

**Key Findings:**

### 1.1 — Database Table Inventory
- 19 unique tables referenced across frontend and backend
- Tables defined in TypeScript types: 13 (missing viral_signals, imported_files)
- `Database` type in database.ts only maps 2 of 13+ tables (profiles, admin_settings) — severely incomplete
- `competitors` table name in route vs `competitor_stores` in dashboard — naming mismatch

### 1.2 — Bug #22 Verification
- **PARTIALLY FIXED**: Frontend scan route corrected to `scan_history` (line 80)
- Backend still uses `scans` in 4 locations (index.ts:108, worker.ts:41,140,162)
- **Split-brain risk**: Frontend reads from `scan_history`, backend writes to `scans`
- If only one table exists in Supabase, either reads or writes will silently fail

### 1.3 — Bug #5 Verification
- **NOT A BUG**: Frontend correctly extracts jobId from its own query param and inserts into backend URL path `/api/scan/${jobId}/cancel`
- The code comment is misleading and should be updated/removed
- Downgraded from HIGH to LOW (misleading comment only)

### 1.4 — Environment Variables
- Backend requires 3 core env vars (SUPABASE_URL, SERVICE_ROLE_KEY, ANON_KEY)
- Frontend requires 4 core env vars (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, SERVICE_ROLE_KEY, BACKEND_URL)
- 20+ optional provider-specific env vars across frontend
- Duplicate email config between frontend and backend (both define RESEND_API_KEY, FROM_EMAIL, ADMIN_EMAIL independently)

**Bugs Found:** 4 new (BUG-023, BUG-024, BUG-025, BUG-026)
**Bugs Reclassified:** BUG-005 downgraded from HIGH to LOW

**Next:** Sprint S02 — Architecture: Backend Server

---

## Session 2 — 2026-03-12 (Sprint S02)

**Sprint:** S02 — Architecture: Backend Server
**Tasks Completed:** 2.1, 2.2, 2.3, 2.4, 2.5 (all 5 tasks)

**Key Findings:**

### 2.1 — Auth Middleware
- JWT validation correct: creates per-request Supabase client, calls getUser()
- Expired token handling: returns 401
- User attachment: works but uses `any` cast
- BUG-027: Auth uses anon key (RLS-bound) vs worker uses service role key — inconsistent
- BUG-028: userId from request body instead of authenticated user — allows spoofing

### 2.2 — Rate Limiting
- General 100/min globally applied — correct
- Scan 10/min on POST endpoints — correct
- GET endpoints have only general limiter — acceptable

### 2.3 — CORS
- Single-origin only — BUG-029: will block Netlify preview URLs

### 2.4 — Helmet
- Default config applied — all standard headers set — no issues

### 2.5 — Error Handling
- Consistent try/catch + console.error + 500 pattern across all routes
- Missing API keys handled gracefully (empty results + console.warn)
- Email failures don't crash worker
- BUG-030: Amazon API key exposed in URL, may leak in error logs
- BUG-031: fetchTrends has silent empty catch block

**Bugs Found:** 5 new (BUG-027 through BUG-031)

**Next:** Sprint S03 — Architecture: Frontend & Middleware

---

## Session 3 — 2026-03-12 (Sprint S03)

**Sprint:** S03 — Architecture: Frontend & Middleware
**Tasks Completed:** 3.1, 3.2, 3.3, 3.4 (all 4 tasks)

**Key Findings:**

### 3.1 — Next.js Middleware
- Correctly protects /admin/* and /dashboard/* with auth checks
- Properly excludes /admin/login and /admin/unauthorized
- API routes not covered by middleware (correct — use requireAdmin() internally)

### 3.2 — Admin Layout
- BUG-032: Layout does NOT check admin role — client users see full admin UI but APIs fail 403

### 3.3 — Client Dashboard Layout
- Correctly enforces client role
- BUG-033: Admin users get confusing "Access Denied" redirect instead of /admin

### 3.4 — Supabase Clients
- Three clients correctly differentiated (browser/server/admin)
- Admin client marked server-only with service role key
- BUG-034: 'viewer' role in auth code but not in database type

**Bugs Found:** 3 new (BUG-032, BUG-033, BUG-034)

**Next:** Sprint S04 — Scoring Engine: Formulas

---

## Session 4 — 2026-03-12 (Sprint S04)

**Sprint:** S04 — Scoring Engine: Formulas
**Tasks Completed:** 4.1, 4.2, 4.3, 4.4, 4.5, 4.6 (all 6 tasks)

**Key Findings:**

### 4.1-4.4 — Score Formula Verification
- Trend score weights: 0.35+0.25+0.20+0.10+0.10 = 1.00 (competition is -0.10 penalty)
- Viral score weights: 0.25+0.20+0.20+0.15+0.10+0.10 = 1.00
- Profit score weights: 0.40+0.20+0.20+0.10+0.10 = 1.00 (risk is -0.10 penalty)
- Final score: 0.40+0.35+0.25 = 1.00
- All scores correctly clamped to [0, 100]
- Edge cases (all-zero, all-100) produce expected results

### 4.5 — Backend vs Frontend Scoring
- BUG-035 (HIGH): Frontend has LEGACY `calculateCompositeScore()` using 60/40 (viral/profit) — not the 3-pillar model. Name collision with backend function.
- BUG-036 (MEDIUM): Backend heuristic vs frontend weighted scoring produce different results, both stored in same DB fields.
- Backend 3-pillar final_score formula matches spec (40/35/25)

### 4.6 — Profitability Scoring
- Frontend and backend profitability formulas are identical
- Max theoretical score is 90 (30+25+20+15), clamped to 100
- Margin estimates: >$30→40%, $15-30→30%, <$15→20% — reasonable

**Bugs Found:** 2 new (BUG-035 HIGH, BUG-036 MEDIUM)

**Next:** Sprint S05 — Scoring Engine: Classification

---

## Session 5 — 2026-03-12 (Sprint S05)

**Sprint:** S05 — Scoring Engine: Classification
**Tasks Completed:** 5.1, 5.2, 5.3, 5.4, 5.5 (all 5 tasks)

**Key Findings:**
- Tier boundaries (HOT/WARM/WATCH/COLD) identical between frontend and backend
- Trend stages (exploding/rising/emerging/saturated) consistent
- AI insight tiers correctly defined (Sonnet>=75, Haiku>=60, None<60)
- score_overall backward compat correctly set in all write paths
- Viral signals table correctly stores all 7 fields
- BUG-037 (LOW): Legacy overall_score uses wrong formula, risk if used for DB writes

**Bugs Found:** 1 new (BUG-037 LOW)

**Next:** Sprint S06 — Integration: TikTok + Amazon Providers

---

## Session 6 — 2026-03-12 (Sprint S06)

**Sprint:** S06 — Integration: TikTok + Amazon Providers
**Tasks Completed:** 6.1, 6.2, 6.3, 6.4 (all 4 tasks)

**Key Findings:**
- TikTok Apify actor (`clockworks~tiktok-scraper`) correctly configured with robust field parsing
- Amazon RapidAPI + Apify fallback chain working correctly
- BUG-038: All Apify calls include API token in URL query string (leak risk in logs)
- BUG-039: Frontend TikTok has no fallback when Apify unavailable
- BUG-040: Frontend (Apify) and backend (official APIs) use completely different data sources for same platforms
- All providers handle missing keys gracefully (empty results, no crashes)

**Bugs Found:** 3 new (BUG-038 MEDIUM, BUG-039 LOW, BUG-040 MEDIUM)

**Next:** Sprint S07 — Integration: Pinterest + Shopify + Trends

---

## Session 7 — 2026-03-12 (Sprint S07)

**Sprint:** S07 — Integration: Pinterest + Shopify + Trends
**Tasks Completed:** 7.1, 7.2, 7.3, 7.4 (all 4 tasks)

**Key Findings:**
- Pinterest, Shopify, Trends Apify actors all correctly configured
- Trends direction classification uses value thresholds (>70 rising, <30 declining)
- BUG-041: Trends config reports `isConfigured: true` but needs APIFY_API_TOKEN
- BUG-042: Old provider files (tiktok.ts) and new (tiktok/index.ts) coexist, index.ts re-exports old ones

**Bugs Found:** 2 new (BUG-041 LOW, BUG-042 MEDIUM)

**Next:** Sprint S08 — Integration: Influencer + Supplier + Digital

---

## Session 8 — 2026-03-12 (Sprint S08 + S09)

**Sprint:** S08 + S09 — Remaining Providers + Affiliates + Caching
**Tasks Completed:** 8.1-8.4, 9.1-9.3 (all 7 tasks)

**Key Findings:**
- Influencer provider: Instagram scraper, tier/CPP correct. BUG-043: same misleading isConfigured pattern
- Supplier provider: Alibaba scraper with MOQ/shipping/certification parsing — correct
- Digital provider: Gumroad scraper — correct
- Affiliate programs: 10 AI + 5 physical hardcoded with commission rates — correct
- Cache: 24h TTL via timestamp comparison, uses supabaseAdmin (service role) — correct
- Provider types: Clean and consistent
- Cache import of supabaseAdmin verified working correctly

**Bugs Found:** 1 new (BUG-043 LOW)

**Next:** Sprint S10 — Security: Auth & Access Control
