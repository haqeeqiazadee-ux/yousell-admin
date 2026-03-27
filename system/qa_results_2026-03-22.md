# YOUSELL PLATFORM — QA RESULTS (2026-03-22)

> **Date**: 2026-03-22
> **Scope**: All work since last QA (2026-03-18) — V9 engines, Governor, OAuth, webhooks, compliance
> **Executed by**: Claude (automated) — 10 parallel QA agents
> **Branch**: claude/review-v9-engine-architecture-Adznr
> **Previous QA**: 2026-03-18 (218 tests, 175 passed)

---

## EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| **Total checks executed** | 87 |
| **PASS** | 73 |
| **WARN** | 6 |
| **FAIL** | 8 |
| **Automated tests** | 860 (855 pass, 5 fail) |
| **Governor tests** | 33/33 pass |

### Severity Breakdown

| Severity | Count | Issues |
|----------|-------|--------|
| CRITICAL | 1 | Governor admin APIs missing auth guard (6 routes) |
| HIGH | 2 | Printful/Printify webhooks fail-open when secret missing |
| MEDIUM | 3 | Sidebar missing Governor link, duplicate `periodEnd`, test import failures |
| LOW | 4 | Engine count docs stale (25 not 24), GOVERNOR_EVENTS 15 not 16, UI uses prompt(), 85 TS errors in test files |
| INFO | 2 | Dual crypto modules, e2e tests expected to fail (no browser) |

---

## BATCH 1: TypeScript Compilation + Governor Exports

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1.1 | `npx tsc --noEmit` — 0 errors | **FAIL** (LOW) | 85 errors: 81 in test files (EventHandler mock return types), 2 in governor (dispatch.ts type cast, gate.ts indexing), 2 in webhook routes |
| 1.2 | Governor barrel export completeness | **PASS** | All classes, functions, types, constants exported correctly |
| 1.3 | Engine interface `costManifest` + EngineName count | **WARN** (LOW) | `costManifest` present. EngineName has **25** entries (not 24 — includes `fulfillment-recommendation`). Docs say 24. |
| 1.4 | GOVERNOR_EVENTS count | **WARN** (LOW) | **15** constants, not 16. All present and correct, spec estimate was off by 1. |

---

## BATCH 2: Automated Tests

| # | Test | Expected | Actual | Result |
|---|------|----------|--------|--------|
| 2.1 | Governor unit tests | 20 | 20 | **PASS** |
| 2.2 | Governor integration tests | 13 | 13 | **PASS** |
| 2.3 | Full test suite | ~717 | **855 pass / 5 fail** | **WARN** |

### Failed Tests (5):

| Test File | Test Name | Root Cause |
|-----------|-----------|------------|
| engine10-store-integration | pushProduct() returns shopProductId | Backend URL/endpoint missing for shopify in test env |
| engine10-store-integration | pushProduct() emits PRODUCT_PUSHED event | Same — no backend URL |
| engine10-store-integration | syncInventory() returns productsUpdated count | `Cannot find module '../supabase'` — relative import fails in test |
| engine10-store-integration | syncInventory() emits STORE_SYNC_COMPLETE event | Same module resolution |
| engine10-store-integration | syncInventory() transitions status | Same module resolution |

**3 e2e test FILES also failed** (admin-dashboard, auth-flows, visual-regression) — expected, as they require a browser/Playwright environment.

**Root causes:**
1. `store-integration.ts:28` uses `require('../supabase')` which fails in vitest (no module alias resolution for CJS require)
2. `pushProduct()` tests expect a backend URL that isn't set in `.env.test`

---

## BATCH 3: Governor Gate Logic (9 Checks)

| # | Scenario | Result | Evidence |
|---|----------|--------|----------|
| 3.1 | No envelope → DENIED (NOT_IN_PLAN) | **PASS** | Lines 40-42: null envelope → deny |
| 3.2 | Starter + content-engine → DENIED | **PASS** | Lines 46-52: allowance check |
| 3.3 | 30/30 ops → QUOTA_EXCEEDED | **PASS** | Lines 62-68: >= comparison |
| 3.4 | $5/$5 → BUDGET_EXCEEDED | **PASS** | Lines 71-77: >= comparison |
| 3.5 | Active override → bypass all | **PASS** | Lines 33-37: first check, immediate allow |
| 3.6 | Engine disabled → ENGINE_DISABLED | **PASS** | Lines 56-59: toggle check |
| 3.7 | Engine unhealthy → ENGINE_UNHEALTHY | **PASS** | Lines 90-102: health + catch = fail-closed |
| 3.8 | 96% ops, non-essential → THROTTLED | **PASS** | Lines 104-120: >95% threshold |
| 3.9 | 96% ops, essential (track) → ALLOWED | **PASS** | Line 196: essentialOps Set bypass |

**9/9 PASS** — Gate logic is correct with fail-closed semantics.

---

## BATCH 4: Cost Manifests + Plan Allowances

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 4.1 | discovery scan_quick = $0.10, low | **PASS** | Line 51: exact match |
| 4.2 | content-engine generate_video = $0.25, high | **PASS** | Line 356: exact match |
| 4.3 | scoring score_single = $0.001, free | **PASS** | Line 257: exact match |
| 4.4 | Engine manifest count = 23 | **WARN** (LOW) | Actual: **25**. All EngineName values covered. File header says 24 — stale doc. |
| 4.5 | Starter: 5 engines, $5 cap | **PASS** | Exact match |
| 4.6 | Growth: 8 engines, $15 cap | **PASS** | Exact match |
| 4.7 | Professional: 15 engines, $40 cap | **PASS** | Exact match |
| 4.8 | Enterprise: 24 engines, $100 cap, unlimited | **PASS** | 24 engines (admin-command-center excluded), all -1 (unlimited) |
| 4.9 | Cross-reference engine names | **PASS** | All manifest keys are valid EngineName members |

---

## BATCH 5: Migration 031 Review

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 5.1 | engine_cost_manifests + UNIQUE | **PASS** | UNIQUE(engine_name, manifest_version) at line 16 |
| 5.2 | plan_engine_allowances + UNIQUE | **PASS** | UNIQUE(plan_tier, engine_name) at line 30 |
| 5.3 | engine_budget_envelopes + FK + archived | **PASS** | FK to clients(id) line 37, archived line 47 |
| 5.4 | engine_usage_ledger + 2 indexes | **PASS** | Both IF NOT EXISTS at lines 66-69 |
| 5.5 | engine_swaps exists | **PASS** | Line 72 |
| 5.6 | governor_ai_decisions exists | **PASS** | Line 85, CHECK(level 1-3) |
| 5.7 | governor_overrides exists | **PASS** | Line 104 |
| 5.8 | engine_toggles ALTER (4 cols, idempotent) | **PASS** | DO $$ block with information_schema check |
| 5.9 | RLS policies correct | **PASS** | Clients own data, admins all, super_admin for overrides |
| 5.10 | All IF NOT EXISTS | **PASS** | All 7 tables + 2 indexes idempotent |

**10/10 PASS** — Migration is correct and fully idempotent.

---

## BATCH 6: Webhook Security Audit

| # | Webhook | HMAC | timingSafeEqual | 401 on bad sig | Result |
|---|---------|------|-----------------|----------------|--------|
| 6.1 | Square | SHA256 | Yes (line 46) | Yes (line 84) | **PASS** |
| 6.2 | Printful | SHA256 | Yes (line 27) | Yes (line 39) | **WARN** (HIGH) — fail-open when env var missing |
| 6.3 | Printify | SHA256 | Yes (line 25) | Yes (line 37) | **WARN** (HIGH) — fail-open when env var missing |
| 6.4 | Stripe | constructEvent | Internal | 400 | **PASS** |
| 6.5 | Amazon | SHA256 | Yes (line 15) | Yes (line 29) | **PASS** — fail-closed |
| 6.6 | TikTok | SHA256 | Yes (line 15) | Yes (line 29) | **PASS** — fail-closed |
| 6.7 | Shopify | SHA256 | Yes (line 10) | Yes (line 21) | **PASS** — fail-closed |
| 6.8 | Stripe envelope lifecycle | Non-blocking | — | — | **PASS** — all .catch() |

**Issue**: Printful and Printify use `if (webhookSecret && ...)` — accepts ALL requests when env var is not configured. Should fail-closed like Amazon/TikTok.

---

## BATCH 7: OAuth Token Security Audit

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 7.1 | WooCommerce validates via WP REST API | **PASS** | Calls /wp-json/wc/v3/system_status |
| 7.2 | BigCommerce standard OAuth2 | **PASS** | Token exchange with client_secret |
| 7.3 | Etsy PKCE S256 | **PASS** | randomBytes(32), SHA256, code_verifier |
| 7.4 | store-oauth.ts AES-256-GCM | **PASS** | Algorithm correct, random 16-byte IV |
| 7.5 | crypto.ts AES-256-GCM | **PASS** | Algorithm correct, random 12-byte IV |
| 7.6 | All routes call encryptToken() | **PASS** | All 3 routes encrypt before DB store |
| 7.7 | No plaintext tokens in responses | **PASS** | Only success/platform/storeUrl returned |

**7/7 PASS** — All OAuth flows are secure. Advisory: two independent crypto modules (crypto.ts: 12B IV, store-oauth.ts: 16B IV) — both valid but could consolidate.

---

## BATCH 8: Governor Admin API Endpoints

| # | Endpoint | Auth | Logic | DB | Response | Result |
|---|----------|------|-------|-----|----------|--------|
| 8.1 | fleet GET | **FAIL** | PASS | PASS | PASS | **FAIL** |
| 8.2 | clients GET/POST | **FAIL** | PASS | PASS | PASS | **FAIL** |
| 8.3 | swaps GET/POST | **FAIL** | PASS | PASS | PASS | **FAIL** |
| 8.4 | overrides GET/POST | **FAIL** | PASS | PASS | PASS | **FAIL** |
| 8.5 | decisions GET/POST | **FAIL** | PASS | PASS | PASS | **FAIL** |
| 8.6 | analytics GET | **FAIL** | PASS | PASS | PASS | **FAIL** |
| 8.7 | health GET | PASS (public) | PASS | PASS | PASS | **PASS** |

**CRITICAL**: All 6 admin Governor API routes are **missing `requireAdmin()` auth checks**. They use `createAdminClient()` (service-role Supabase) which bypasses RLS entirely. The middleware only protects `/admin/:path*` page routes, NOT `/api/admin/*` API routes. Any unauthenticated caller can access these endpoints.

---

## BATCH 9: Governor Admin UI Pages

| # | Page | Result | Notes |
|---|------|--------|-------|
| 9.1 | /admin/governor (dashboard) | **PASS** (WARN) | 4 KPIs + 4 panels, fetches 4 APIs in parallel. No user-visible error state. |
| 9.2 | /admin/governor/swaps | **PASS** (WARN) | Create/revert works. Silent error swallowing. |
| 9.3 | /admin/governor/budgets | **PASS** (WARN) | Expandable per-engine bars. Uses browser `prompt()`/`confirm()` for actions. |
| 9.4 | /admin/governor/decisions | **PASS** | Filterable feed, approve/dismiss/revert buttons, L1/L2/L3 badges. |

---

## BATCH 10: Smart Schedule

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 10.1 | Default patterns for 5 platforms | **PASS** | tiktok, instagram, facebook, twitter, pinterest |
| 10.2 | Returns 5 best slots | **PASS** | `.slice(0, 5)` at line 167 |
| 10.3 | Confidence 0.5 with no history | **PASS** | Line 119: `confidence: 0.5` |
| 10.4 | API accepts client_id + optional platform | **PASS** | Lines 14-15, single or all platforms |

**4/4 PASS**

---

## BATCH 11: Regression Check

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 11.1 | Admin dashboard intact | **PASS** | Engine grid + KPIs unchanged |
| 11.2 | Content generate route | **PASS** | Governor additive, core logic preserved |
| 11.3 | Deploy route | **PASS** | Governor additive, core logic preserved |
| 11.4 | Stripe webhook | **FAIL** (MEDIUM) | Duplicate `const periodEnd` at lines 154 & 197 (same scope) |
| 11.5 | Sidebar nav links | **FAIL** (MEDIUM) | No `/admin/governor` link in sidebar — pages unreachable from nav |

---

## BATCH 12: AI Optimizer

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 12.1 | L0 (Off) → empty decisions | **PASS** | Line 61: immediate `return []` |
| 12.2 | L1 (Advisory) → applied=false | **PASS** | Lines 294-296: shouldAutoApply false at L1 |
| 12.3 | L2 (Assisted) → auto-apply >=0.8 | **PASS** | Line 294: confidence threshold |
| 12.4 | L3 (Autonomous) → auto-apply all | **PASS** | Line 295: shouldAutoApplyL3 |
| 12.5 | 24h decision expiry | **PASS** | Line 328: Date.now() + 24h |
| 12.6 | Reallocation detection | **PASS** | >=90% overused, <=10% underused |
| 12.7 | Anomaly detection >20% failure | **PASS** | Line 133: failureRate > 0.2 |
| 12.8 | Scaling suggestion >80% util | **PASS** | Line 183: utilizationPercent >= 80 |

**8/8 PASS**

---

## ACTION ITEMS (Prioritized)

### CRITICAL (Must fix before deploy)

| # | Issue | Fix | Files |
|---|-------|-----|-------|
| C1 | 6 Governor admin APIs missing auth | Add `requireAdmin()` to all 6 route handlers | `src/app/api/admin/governor/*/route.ts` |

### HIGH (Should fix before deploy)

| # | Issue | Fix | Files |
|---|-------|-----|-------|
| H1 | Printful webhook fail-open | Change to fail-closed: return 503 when secret not configured | `src/app/api/webhooks/printful/route.ts` |
| H2 | Printify webhook fail-open | Same as H1 | `src/app/api/webhooks/printify/route.ts` |

### MEDIUM (Fix soon)

| # | Issue | Fix | Files |
|---|-------|-----|-------|
| M1 | Sidebar missing Governor nav link | Add Governor item to managementNav | `src/components/admin-sidebar.tsx` |
| M2 | Duplicate `const periodEnd` in Stripe webhook | Rename second declaration or reuse first | `src/app/api/webhooks/stripe/route.ts` |
| M3 | store-integration syncInventory module resolution | Use dynamic import or fix path alias in test config | `src/lib/engines/store-integration.ts` |

### LOW (Nice to have)

| # | Issue | Fix | Files |
|---|-------|-----|-------|
| L1 | 81 test file TS errors (EventHandler return) | Update test mocks to return `void` | `tests/*.test.ts` |
| L2 | Engine count doc stale (25 not 24) | Update cost-manifests.ts header comment | `src/lib/engines/governor/cost-manifests.ts` |
| L3 | Governor UI pages no error banners | Add user-visible error state | `src/app/admin/governor/*.tsx` |
| L4 | Dual crypto modules (12B vs 16B IV) | Consider consolidating | Advisory only |

---

## GO/NO-GO ASSESSMENT

| Criteria | Status | Notes |
|----------|--------|-------|
| Governor tests pass | **GO** | 33/33 |
| Zero CRITICAL bugs | **NO-GO** | 1 CRITICAL: missing auth on 6 API routes |
| Zero HIGH security bugs | **NO-GO** | 2 HIGH: Printful/Printify fail-open |
| TypeScript compiles | **WARN** | 85 errors (mostly test mocks) |
| All webhooks HMAC verified | **WARN** | 7/7 have HMAC, but 2 fail-open |
| All OAuth tokens encrypted | **GO** | 100% |
| RLS on all new tables | **GO** | 100% |
| Admin pages render | **GO** | 4/4 (with minor UX warns) |
| Regression check | **WARN** | 1 bug in Stripe webhook |

### VERDICT: **NO-GO** — Fix C1, H1, H2 before deploy (estimated: ~15 minutes)
