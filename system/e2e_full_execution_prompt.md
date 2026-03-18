# YOUSELL PLATFORM — COMPLETE E2E QA EXECUTION PROMPT

> **VERSION**: v1.0 — 2026-03-18
> **SCOPE**: 48 pages · 74 API routes · 35 database tables · 3 user roles · 2 domains · 180+ test cases
> **MODE**: FULL AUTONOMOUS — Execute sequentially. Log EVERY result. Stop-on-critical.
> **TOOLS**: Playwright (headless Chromium) + curl + Supabase REST API + direct SQL

---

## CRITICAL EXECUTION RULES

| # | Rule | Consequence |
|---|------|-------------|
| R1 | **Do NOT stop** until ALL sections are complete | Every section must have logged results |
| R2 | **Log every test result** to `system/qa_results_<date>.md` as you go | No silent passes or failures |
| R3 | **Take a screenshot** for every Playwright browser test (pass or fail) | Screenshots go to `e2e-results/` |
| R4 | **If a test fails**, log the failure with severity, take screenshot, and CONTINUE (don't stop) | Only stop if infrastructure is down |
| R5 | **Fix CRITICAL bugs inline** — if a test reveals a crash/loop, fix it, re-test, then continue | Don't defer critical fixes |
| R6 | **Commit after each section** (not after each test, but after each major section) | Checkpoint frequently |
| R7 | **Use parallel execution** where tests are independent | Maximize throughput |
| R8 | **Verify before marking pass** — a page "loading" is not a pass if it shows an error | Read page content, not just HTTP status |
| R9 | **All Playwright tests use `waitUntil: 'commit'`** — the deployed site hangs on `load`/`networkidle` | See helpers.ts for the `navigateTo` function |
| R10 | **Proxy is required** for Playwright — the environment routes through an authenticated proxy | Config is in playwright.config.ts `getProxyConfig()` |

---

## ENVIRONMENT & ACCESS

### Deployed URLs
- **Admin domain**: `https://admin.yousell.online` (Netlify)
- **Client domain**: `https://yousell.online` (Netlify — same deployment, subdomain routing)
- **Backend API**: `https://yousell-backend-production.up.railway.app` (Railway)

### Supabase
- **URL**: `https://gqrwienipczrejscqdhk.supabase.co`
- **Anon Key**: Available in `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service Role Key**: Available in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
- **REST API**: `https://gqrwienipczrejscqdhk.supabase.co/rest/v1/`
- **Auth Admin API**: `https://gqrwienipczrejscqdhk.supabase.co/auth/v1/admin/`
- **SQL Execution**: Use the REST API with service role key for read queries, or the Supabase Management API

### Test Accounts
| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin / Super Admin | `admin@yousell.online` | `Admin@2026!` | Use for all admin-side tests |
| Client | Create during signup test | `TestUser@2026!` | Signup test creates this |
| No Role (viewer) | Create or find in DB | — | For edge case redirect tests |
| Fresh signup | `e2e-test-<timestamp>@yousell.online` | `TestUser@2026!` | Use unique email each run |

### Playwright Infrastructure (ALREADY SET UP)
- **Config**: `playwright.config.ts` — Chromium, proxy-aware, 3 viewports (desktop/mobile/tablet)
- **Helper**: `e2e/helpers.ts` — `navigateTo()` function handles `waitUntil: 'commit'` + body hydration wait
- **Auth setup**: `e2e/auth.setup.ts` — Logs in as admin, saves session to `e2e/.auth/admin.json`
- **Storage state**: Authenticated tests use `storageState: 'e2e/.auth/admin.json'`
- **Existing tests**: `e2e/auth-flows.spec.ts`, `e2e/visual-regression.spec.ts`, `e2e/admin-dashboard.spec.ts`
- **Run commands**: `npm run e2e`, `npm run e2e:auth`, `npm run e2e:visual`, `npm run e2e:admin`
- **Screenshots**: Saved to `e2e-results/` (gitignored)
- **Snapshots**: Saved to `e2e/visual-regression.spec.ts-snapshots/` (gitignored)
- **IMPORTANT**: Playwright uses `ignoreHTTPSErrors: true` due to proxy SSL interception

### Proxy Configuration (REQUIRED for all browser tests)
The execution environment routes through an authenticated HTTP proxy. This is already configured in `playwright.config.ts` via `getProxyConfig()` which reads `HTTPS_PROXY` / `HTTP_PROXY` env vars and extracts username/password. `curl` uses the proxy automatically. Playwright needs it explicitly configured per the config.

### Key Environment Variables Present
| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Set |
| `ANTHROPIC_API_KEY` | Set |
| `RESEND_API_KEY` | Set |
| `APIFY_API_TOKEN` | Set |
| `RAPIDAPI_KEY` | Set |
| `REDIS_URL` | Set |
| `STRIPE_SECRET_KEY` | **EMPTY** — Stripe tests should use mock/skip |
| `STRIPE_WEBHOOK_SECRET` | **EMPTY** — Webhook signature tests will 400 |

---

## EXECUTION PLAN — 12 SECTIONS

### OUTPUT FORMAT

For every test, log results to `system/qa_results_<date>.md` in this format:

```markdown
| # | Test | Status | Severity | Notes |
|---|------|--------|----------|-------|
| 0.1.1 | Netlify deployment healthy | PASS / FAIL / PARTIAL / SKIP | 🔴🟠🟡🟢 | Details |
```

Severity levels:
- 🔴 **CRITICAL**: Blocks user flow entirely (crash, redirect loop, blank screen) — Fix immediately
- 🟠 **HIGH**: Feature broken but workaround exists — Fix before launch
- 🟡 **MEDIUM**: UI/UX issue, non-blocking — Fix in next sprint
- 🟢 **LOW**: Cosmetic, minor text, spacing — Backlog

---

## SECTION 0: PRE-FLIGHT CHECKS

### 0.1 Infrastructure Verification

Execute these checks using `curl` and Supabase REST API:

```
TESTS:
  0.1.1  □ curl -sI https://admin.yousell.online → HTTP 200 or 307 (not 5xx, not timeout)
  0.1.2  □ curl -sI https://yousell.online → HTTP 200 or 307
  0.1.3  □ curl -sI https://yousell-backend-production.up.railway.app → responds (any status)
  0.1.4  □ DNS resolves: dig admin.yousell.online → has A/CNAME record
  0.1.5  □ DNS resolves: dig yousell.online → has A/CNAME record
  0.1.6  □ SSL valid: curl --cert-status https://admin.yousell.online (no cert errors)
  0.1.7  □ Supabase reachable: curl https://gqrwienipczrejscqdhk.supabase.co/rest/v1/ with anon key → 200
```

### 0.2 Environment Variables

```
TESTS:
  0.2.1  □ .env.local exists and is not empty
  0.2.2  □ NEXT_PUBLIC_SUPABASE_URL is set and matches gqrwienipczrejscqdhk
  0.2.3  □ NEXT_PUBLIC_SUPABASE_ANON_KEY is set (length > 100)
  0.2.4  □ SUPABASE_SERVICE_ROLE_KEY is set (length > 100)
  0.2.5  □ ANTHROPIC_API_KEY starts with sk-ant-
  0.2.6  □ RESEND_API_KEY starts with re_
  0.2.7  □ APIFY_API_TOKEN starts with apify_api_
  0.2.8  □ STRIPE_SECRET_KEY status (empty = expected, log as SKIP not FAIL)
  0.2.9  □ REDIS_URL is set and contains redis://
```

### 0.3 Database Schema Verification

Execute via Supabase REST API (service role key) or curl:

```
TESTS:
  0.3.1  □ Query information_schema.tables → list all public tables, verify count ≥ 20
  0.3.2  □ Critical tables exist: profiles, clients, products, product_allocations,
           subscriptions, notifications, orders, scan_history, trend_keywords,
           tiktok_videos, influencers, suppliers, competitor_stores, ad_creatives,
           product_clusters, creator_matches, outreach_emails, automation_jobs,
           content_queue, admin_settings, blueprints
  0.3.3  □ RPC function check_user_role exists — call with service role key
  0.3.4  □ Profiles trigger on_auth_user_created exists — query pg_trigger
  0.3.5  □ RLS enabled on: profiles, clients, products, product_allocations,
           subscriptions, notifications, orders — query pg_tables.rowsecurity
  0.3.6  □ Count records: profiles, clients, products (log counts, 0 is OK for some)
```

### 0.4 Test Account Verification

```
TESTS:
  0.4.1  □ Admin account (admin@yousell.online) exists in auth.users
  0.4.2  □ Admin profile has role = 'admin' or 'super_admin' in profiles table
  0.4.3  □ Check if a client test account exists (role = 'client' in profiles)
  0.4.4  □ If no client account exists, create one via Supabase Auth API
  0.4.5  □ Check if a viewer/no-role account exists for edge case testing
```

**GATE**: If Supabase is unreachable or admin account doesn't exist → STOP. Fix before continuing.

---

## SECTION 1: AUTHENTICATION FLOWS (CRITICAL PATH)

### Method: Playwright headless browser + screenshots

### 1.1 Admin Login (admin.yousell.online)

Use Playwright with `navigateTo(page, '/admin/login')`:

```
TESTS:
  1.1.1  □ /admin/login loads: white card on dark background [SCREENSHOT]
  1.1.2  □ "YouSell Admin" title visible in h1
  1.1.3  □ Email input field present (type="email")
  1.1.4  □ Password input field present (type="password")
  1.1.5  □ Submit button present ("Sign In")
  1.1.6  □ Submit with wrong credentials → error message shown [SCREENSHOT]
  1.1.7  □ Submit with admin@yousell.online / Admin@2026! → redirect to /admin [SCREENSHOT]
  1.1.8  □ Post-login: /admin page loads without errors [SCREENSHOT]
  1.1.9  □ Already-logged-in admin visiting /admin/login → auto-redirect to /admin
```

### 1.2 Client Signup (yousell.online)

Use Playwright with `navigateTo(page, '/signup')` (NOTE: baseURL is admin.yousell.online — use full URL or adjust):

```
TESTS:
  1.2.1  □ /signup page loads without errors [SCREENSHOT]
  1.2.2  □ Email input field present
  1.2.3  □ Password input field present
  1.2.4  □ Name field present (if applicable)
  1.2.5  □ Submit button present
  1.2.6  □ Submit with valid fresh email (e2e-test-<timestamp>@yousell.online) [SCREENSHOT]
  1.2.7  □ Success indication: redirect, confirmation message, or email prompt [SCREENSHOT]
  1.2.8  □ Signup with already-registered email → error message
```

### 1.3 Client Login (yousell.online)

```
TESTS:
  1.3.1  □ /login page loads [SCREENSHOT]
  1.3.2  □ Social login buttons present (Google, Facebook) — or note if missing
  1.3.3  □ Email/password fields present
  1.3.4  □ "Forgot password?" link → navigates to /forgot-password
  1.3.5  □ Submit with wrong password → error message [SCREENSHOT]
  1.3.6  □ Submit with correct client credentials → redirect to /dashboard [SCREENSHOT]
  1.3.7  □ "Don't have an account?" link present
```

### 1.4 Google OAuth Flow

```
TESTS:
  1.4.1  □ Google OAuth button exists on /login (or note if MISSING — this is HIGH severity)
  1.4.2  □ Google OAuth button exists on /signup
  1.4.3  □ Click Google button → initiates redirect to accounts.google.com or supabase.co/auth
  1.4.4  □ If no Google button found, check /admin/login for Google OAuth as well
  1.4.5  □ Document: is Google OAuth implemented? On which pages?
```

### 1.5 Password Reset

```
TESTS:
  1.5.1  □ /forgot-password loads [SCREENSHOT]
  1.5.2  □ Email input present
  1.5.3  □ Submit with admin email → success message shown [SCREENSHOT]
  1.5.4  □ /reset-password loads (may show "need token" message) [SCREENSHOT]
  1.5.5  □ Both pages accessible without auth (in middleware matcher)
```

### 1.6 Sign Out

```
TESTS:
  1.6.1  □ Login as admin → find sign out button/link [SCREENSHOT]
  1.6.2  □ Click sign out → redirected to /admin/login [SCREENSHOT]
  1.6.3  □ After signout, visiting /admin → redirected to /admin/login
  1.6.4  □ /admin/unauthorized page has sign out button [SCREENSHOT]
```

### 1.7 Protected Route Guards (Unauthenticated)

Use fresh browser context (no auth):

```
TESTS:
  1.7.1  □ Visit /dashboard without auth → redirect to /login
  1.7.2  □ Visit /admin/products without auth → redirect to /admin/login
  1.7.3  □ Visit /admin/settings without auth → redirect to /admin/login
  1.7.4  □ Visit /admin/clients without auth → redirect to /admin/login
  1.7.5  □ Visit /dashboard/billing without auth → redirect to /login
  1.7.6  □ Visit /dashboard/products without auth → redirect to /login
```

---

## SECTION 2: MIDDLEWARE REDIRECT MATRIX

### Method: curl with/without auth cookies, and Playwright for browser-based checks

Test EVERY combination in this matrix. Use `curl -sI -L` to follow redirects and check final URL.
For authenticated tests, use Playwright with stored auth state.

```
| URL                              | Not Logged In           | Client Role              | Admin Role                        | No Role (viewer)         |
|----------------------------------|-------------------------|--------------------------|-----------------------------------|--------------------------|
| yousell.online/                  | Homepage renders        | → /dashboard             | → admin.yousell.online/admin      | Homepage renders         |
| yousell.online/login             | Login page renders      | → /dashboard             | → /dashboard → admin redirect     | Login page (if ?kicked)  |
| yousell.online/signup            | Signup page renders     | → /dashboard             | → /dashboard → admin redirect     | Signup page (if ?kicked) |
| yousell.online/dashboard         | → /login                | Dashboard renders         | → admin.yousell.online/admin      | → /login?kicked=no_role  |
| yousell.online/dashboard/billing | → /login                | Billing page renders      | → admin.yousell.online/admin      | → /login?kicked=no_role  |
| yousell.online/admin             | → /login                | → admin.yousell.online   | → admin.yousell.online/admin      | → /login                 |
| yousell.online/forgot-password   | Page renders            | Page renders              | Page renders                      | Page renders             |
| yousell.online/reset-password    | Page renders            | Page renders              | Page renders                      | Page renders             |
| admin.yousell.online/            | → /admin/login          | → /admin → unauthorized  | → /admin                          | → /admin/login           |
| admin.yousell.online/admin       | → /admin/login          | → /admin/unauthorized    | Admin dashboard renders           | → /admin/unauthorized    |
| admin.yousell.online/admin/login | Login page renders      | → /admin                 | → /admin                          | Login page renders       |
| admin.yousell.online/dashboard   | → /admin/login          | → /admin/login           | → /admin                          | → /admin/login           |
| admin.yousell.online/login       | → /admin/login          | → /admin/login           | → /admin                          | → /admin/login           |
```

**That's 13 URLs × 4 roles = 52 test cells.**

For unauthenticated: use `curl -sI -L <url>` and check redirect chain.
For authenticated roles: use Playwright with the appropriate stored session, or use Supabase Auth API to get session tokens for curl.

```
CRITICAL CHECK: NO redirect should loop. If any URL produces ERR_TOO_MANY_REDIRECTS → 🔴 CRITICAL BUG.
```

---

## SECTION 3: PUBLIC PAGES

### Method: Playwright (desktop + mobile + tablet viewports) + screenshots

### 3.1 Homepage (yousell.online/)

```
TESTS:
  3.1.1  □ Page loads without blank screen [SCREENSHOT: desktop, mobile, tablet]
  3.1.2  □ No JavaScript console errors
  3.1.3  □ <title> tag exists and is not empty
  3.1.4  □ <meta name="description"> exists
  3.1.5  □ Hero section visible with CTA
  3.1.6  □ Navigation links present (Login, Signup, Pricing)
  3.1.7  □ Footer renders with links
  3.1.8  □ No horizontal overflow at any viewport
  3.1.9  □ Mobile: hamburger menu or stacked layout
```

### 3.2 Pricing (/pricing)

```
TESTS:
  3.2.1  □ Page loads [SCREENSHOT]
  3.2.2  □ Pricing tiers visible (check for Starter $29, Growth $59, Professional $99, Enterprise $149)
  3.2.3  □ Each tier lists features
  3.2.4  □ CTA buttons present
  3.2.5  □ No horizontal overflow
```

### 3.3 Privacy (/privacy)

```
TESTS:
  3.3.1  □ Page loads with content [SCREENSHOT]
  3.3.2  □ Privacy policy text visible (not empty page)
  3.3.3  □ Accessible without auth
```

### 3.4 Terms (/terms)

```
TESTS:
  3.4.1  □ Page loads with content [SCREENSHOT]
  3.4.2  □ Terms of service text visible (not empty page)
  3.4.3  □ Accessible without auth
```

---

## SECTION 4: CLIENT DASHBOARD (9 pages)

### Method: Playwright with client auth session + screenshots

**Pre-requisite**: Login as a client user (or use admin if client account doesn't exist — note this in results).

### 4.1 Main Dashboard (/dashboard)

```
TESTS:
  4.1.1  □ Page loads without errors [SCREENSHOT]
  4.1.2  □ No "Application Error" or "Internal Server Error" text
  4.1.3  □ Sidebar/navigation present
  4.1.4  □ KPI cards or dashboard widgets render (or empty state)
  4.1.5  □ Mobile: sidebar collapses [SCREENSHOT: mobile]
```

### 4.2 Products (/dashboard/products)

```
TESTS:
  4.2.1  □ Page loads [SCREENSHOT]
  4.2.2  □ Product list or empty state visible
  4.2.3  □ If products exist: title, score badge visible
```

### 4.3 Orders (/dashboard/orders)

```
TESTS:
  4.3.1  □ Page loads [SCREENSHOT]
  4.3.2  □ Order list or empty state
```

### 4.4 Billing (/dashboard/billing)

```
TESTS:
  4.4.1  □ Page loads [SCREENSHOT]
  4.4.2  □ Subscription info or "no plan" state visible
  4.4.3  □ Note: Stripe is not configured — expect mock/placeholder
```

### 4.5 Integrations (/dashboard/integrations)

```
TESTS:
  4.5.1  □ Page loads [SCREENSHOT]
  4.5.2  □ Channel list or integration options visible
```

### 4.6 Content (/dashboard/content)

```
TESTS:
  4.6.1  □ Page loads [SCREENSHOT]
  4.6.2  □ Content section visible (generation form or content list)
```

### 4.7 Requests (/dashboard/requests)

```
TESTS:
  4.7.1  □ Page loads [SCREENSHOT]
  4.7.2  □ Request list or submission form visible
```

### 4.8 Affiliate (/dashboard/affiliate)

```
TESTS:
  4.8.1  □ Page loads [SCREENSHOT]
  4.8.2  □ Referral info or empty state visible
```

---

## SECTION 5: ADMIN DASHBOARD (28 pages)

### Method: Playwright with admin auth session (`storageState: 'e2e/.auth/admin.json'`) + screenshots

For EVERY page: verify it loads without crash, take screenshot, check for error text.

### 5.1 Main Dashboard (/admin)

```
TESTS:
  5.1.1  □ Page loads [SCREENSHOT]
  5.1.2  □ No "Application Error" text
  5.1.3  □ KPI cards or engine status grid visible
  5.1.4  □ Sidebar navigation with all admin page links
```

### 5.2 Scan (/admin/scan)

```
TESTS:
  5.2.1  □ Page loads [SCREENSHOT]
  5.2.2  □ Scan modes or platform toggles visible
  5.2.3  □ "Start Scan" button present
```

### 5.3 Products (/admin/products)

```
TESTS:
  5.3.1  □ Page loads [SCREENSHOT]
  5.3.2  □ Product table or list visible (or empty state)
  5.3.3  □ Score badges render if products exist
```

### 5.4 TikTok (/admin/tiktok)

```
TESTS:
  5.4.1  □ Page loads [SCREENSHOT]
  5.4.2  □ Video or hashtag section visible (or empty state)
```

### 5.5 Trends (/admin/trends)

```
TESTS:
  5.5.1  □ Page loads [SCREENSHOT]
  5.5.2  □ Trends data or empty state visible
```

### 5.6 Clusters (/admin/clusters)

```
TESTS:
  5.6.1  □ Page loads [SCREENSHOT]
  5.6.2  □ Cluster list or empty state
```

### 5.7 Creator Matches (/admin/creator-matches)

```
TESTS:
  5.7.1  □ Page loads [SCREENSHOT]
  5.7.2  □ Match list or empty state
```

### 5.8 Influencers (/admin/influencers)

```
TESTS:
  5.8.1  □ Page loads [SCREENSHOT]
  5.8.2  □ Influencer table or empty state
```

### 5.9 Suppliers (/admin/suppliers)

```
TESTS:
  5.9.1  □ Page loads [SCREENSHOT]
  5.9.2  □ Supplier list or empty state
```

### 5.10 Ads (/admin/ads)

```
TESTS:
  5.10.1 □ Page loads [SCREENSHOT]
  5.10.2 □ Ad data or empty state
```

### 5.11 Competitors (/admin/competitors)

```
TESTS:
  5.11.1 □ Page loads [SCREENSHOT]
  5.11.2 □ Competitor list or empty state
```

### 5.12 Clients (/admin/clients)

```
TESTS:
  5.12.1 □ Page loads [SCREENSHOT]
  5.12.2 □ Client list visible (should have at least admin account)
```

### 5.13 Allocate (/admin/allocate)

```
TESTS:
  5.13.1 □ Page loads [SCREENSHOT]
  5.13.2 □ Allocation interface visible
```

### 5.14 Analytics (/admin/analytics)

```
TESTS:
  5.14.1 □ Page loads [SCREENSHOT]
  5.14.2 □ Charts/data or empty state
```

### 5.15 Remaining Admin Pages (batch test — each must load without crash)

```
TESTS:
  5.15.1  □ /admin/setup loads [SCREENSHOT]
  5.15.2  □ /admin/settings loads [SCREENSHOT]
  5.15.3  □ /admin/notifications loads [SCREENSHOT]
  5.15.4  □ /admin/import loads [SCREENSHOT]
  5.15.5  □ /admin/blueprints loads [SCREENSHOT]
  5.15.6  □ /admin/amazon loads [SCREENSHOT]
  5.15.7  □ /admin/shopify loads [SCREENSHOT]
  5.15.8  □ /admin/pinterest loads [SCREENSHOT]
  5.15.9  □ /admin/digital loads [SCREENSHOT]
  5.15.10 □ /admin/pod loads [SCREENSHOT]
  5.15.11 □ /admin/affiliates loads [SCREENSHOT]
  5.15.12 □ /admin/automation loads [SCREENSHOT]
  5.15.13 □ /admin/unauthorized loads with sign-out button [SCREENSHOT]
```

---

## SECTION 6: API ROUTE HEALTH CHECK (74 routes)

### Method: curl with auth headers (use Supabase access token from login)

**Getting auth tokens:**
1. Login via Supabase Auth REST API: `POST /auth/v1/token?grant_type=password` with admin credentials → get `access_token`
2. Use token as: `curl -H "Authorization: Bearer <token>" -H "apikey: <anon_key>" <url>`
3. For unauthenticated tests: omit the Authorization header

### 6.1 Auth Routes

```
TESTS:
  6.1.1  □ GET  /api/auth/callback?code=test → not 500 (graceful handling)
  6.1.2  □ POST /api/auth/signout → 200 or redirect
```

### 6.2 Admin API Routes (with admin auth token)

```
DASHBOARD:
  6.2.1  □ GET  /api/admin/dashboard → 200 + JSON
  6.2.2  □ GET  /api/admin/products → 200 + JSON array
  6.2.3  □ GET  /api/admin/products?page=1&limit=10 → 200 + paginated

ENGINES:
  6.2.4  □ GET  /api/admin/tiktok → 200
  6.2.5  □ GET  /api/admin/tiktok/videos → 200
  6.2.6  □ GET  /api/admin/tiktok/signals → 200
  6.2.7  □ GET  /api/admin/trends → 200
  6.2.8  □ GET  /api/admin/clusters → 200
  6.2.9  □ GET  /api/admin/creator-matches → 200
  6.2.10 □ GET  /api/admin/influencers → 200
  6.2.11 □ GET  /api/admin/suppliers → 200
  6.2.12 □ GET  /api/admin/ads → 200
  6.2.13 □ GET  /api/admin/competitors → 200
  6.2.14 □ GET  /api/admin/opportunities → 200

MANAGEMENT:
  6.2.15 □ GET  /api/admin/clients → 200
  6.2.16 □ GET  /api/admin/allocations → 200
  6.2.17 □ GET  /api/admin/allocations/requests → 200
  6.2.18 □ GET  /api/admin/notifications → 200
  6.2.19 □ GET  /api/admin/settings → 200
  6.2.20 □ GET  /api/admin/blueprints → 200

ANALYTICS:
  6.2.21 □ GET  /api/admin/analytics → 200
  6.2.22 □ GET  /api/admin/revenue → 200
  6.2.23 □ GET  /api/admin/financial → 200
  6.2.24 □ GET  /api/admin/scoring → 200

HEALTH:
  6.2.25 □ GET  /api/admin/scan/health → 200
  6.2.26 □ GET  /api/admin/engines/health → 200
```

### 6.3 Dashboard API Routes (with client auth token — or admin token if no client account)

```
  6.3.1  □ GET  /api/dashboard/products → 200
  6.3.2  □ GET  /api/dashboard/requests → 200
  6.3.3  □ GET  /api/dashboard/orders → 200
  6.3.4  □ GET  /api/dashboard/content → 200
  6.3.5  □ GET  /api/dashboard/channels → 200
  6.3.6  □ GET  /api/dashboard/subscription → 200
  6.3.7  □ GET  /api/dashboard/engines → 200
  6.3.8  □ GET  /api/dashboard/affiliate/referral → 200
```

### 6.4 Unauthorized Access Tests

```
WITHOUT ANY AUTH (no Bearer token):
  6.4.1  □ GET /api/admin/dashboard → 401 or redirect
  6.4.2  □ GET /api/admin/products → 401 or redirect
  6.4.3  □ GET /api/admin/clients → 401 or redirect
  6.4.4  □ GET /api/dashboard/products → 401 or redirect
  6.4.5  □ GET /api/dashboard/orders → 401 or redirect
```

### 6.5 Webhook Routes (no valid signature)

```
  6.5.1  □ POST /api/webhooks/stripe (empty body) → 400 or 401 (not 500)
  6.5.2  □ POST /api/webhooks/shopify (empty body) → 400 or 401 (not 500)
  6.5.3  □ POST /api/webhooks/tiktok (empty body) → 400 or 401 (not 500)
  6.5.4  □ POST /api/webhooks/amazon (empty body) → 400 or 401 (not 500)
  6.5.5  □ POST /api/webhooks/resend (empty body) → 400 or 401 (not 500)

NOTE: If any webhook route doesn't exist, log as SKIP with note "route not implemented"
```

---

## SECTION 7: RLS SECURITY VERIFICATION

### Method: Supabase REST API with different user tokens

```
TESTS:
  7.1.1  □ Using client token: SELECT from products → returns only allocated products (or empty)
  7.1.2  □ Using client token: SELECT from admin_settings → returns empty (RLS blocks)
  7.1.3  □ Using client token: SELECT from automation_jobs → returns empty (RLS blocks)
  7.1.4  □ Using admin token: SELECT from products → returns all products
  7.1.5  □ Using admin token: SELECT from clients → returns all clients
  7.1.6  □ Using anon key (no auth): SELECT from profiles → returns empty (RLS blocks)
  7.1.7  □ RLS enabled check: query pg_tables for rowsecurity = true on critical tables
```

---

## SECTION 8: SECURITY HEADERS

### Method: curl -sI on deployed pages

```
TESTS:
  8.1.1  □ Check https://admin.yousell.online for X-Frame-Options header
  8.1.2  □ Check for X-Content-Type-Options: nosniff
  8.1.3  □ Check for Referrer-Policy header
  8.1.4  □ Check for Strict-Transport-Security (HSTS)
  8.1.5  □ Check for Content-Security-Policy or Permissions-Policy
  8.1.6  □ Repeat on https://yousell.online

NOTE: Headers may be set by Netlify config. Check netlify.toml [[headers]] section.
If missing, log as 🟡 MEDIUM — these should be added to netlify.toml.
```

---

## SECTION 9: ERROR HANDLING

### Method: Playwright + curl

```
TESTS:
  9.1.1  □ Visit /nonexistent-page → 404 page renders (not crash) [SCREENSHOT]
  9.1.2  □ Visit /dashboard/products/nonexistent-id → graceful error (not crash) [SCREENSHOT]
  9.1.3  □ curl invalid API params → structured JSON error (not HTML stack trace)
  9.1.4  □ No unhandled promise rejections in browser console during page loads
```

---

## SECTION 10: PERFORMANCE

### Method: Playwright page load timing + curl for API response times

```
TESTS:
  10.1.1 □ /admin/login loads in < 5s (measure from goto to first input visible)
  10.1.2 □ /admin (dashboard) loads in < 5s
  10.1.3 □ /admin/products loads in < 5s
  10.1.4 □ /admin/analytics loads in < 5s
  10.1.5 □ API: GET /api/admin/products responds in < 2s
  10.1.6 □ API: GET /api/admin/dashboard responds in < 2s
  10.1.7 □ API: GET /api/dashboard/products responds in < 2s
```

---

## SECTION 11: MOBILE RESPONSIVENESS

### Method: Playwright with 5 viewport sizes + screenshots

Test these breakpoints on key pages (/login, /signup, /pricing, /dashboard, /admin):

```
VIEWPORTS:
  - 375px  (iPhone SE)
  - 390px  (iPhone 14)
  - 768px  (iPad)
  - 1024px (iPad Pro)
  - 1440px (Desktop)

TESTS PER PAGE PER VIEWPORT:
  11.x.1 □ No horizontal overflow (scrollWidth <= clientWidth)
  11.x.2 □ Text readable (no clipping, no overlap)
  11.x.3 □ Forms fill available width
  11.x.4 □ [SCREENSHOT at each viewport]
```

---

## SECTION 12: FULL USER JOURNEYS

### Method: Playwright end-to-end browser flows

### Journey 1: Admin Product Discovery Flow

```
STEPS (execute in one Playwright session):
  12.1.1 □ Navigate to /admin/login → login as admin [SCREENSHOT]
  12.1.2 □ Navigate to /admin → dashboard loads [SCREENSHOT]
  12.1.3 □ Navigate to /admin/scan → scan page loads [SCREENSHOT]
  12.1.4 □ Navigate to /admin/products → product list loads [SCREENSHOT]
  12.1.5 □ Navigate to /admin/trends → trends page loads [SCREENSHOT]
  12.1.6 □ Navigate to /admin/clusters → clusters page loads [SCREENSHOT]
  12.1.7 □ Navigate to /admin/creator-matches → matches page loads [SCREENSHOT]
  12.1.8 □ Navigate to /admin/suppliers → suppliers page loads [SCREENSHOT]
  12.1.9 □ Navigate to /admin/blueprints → blueprints page loads [SCREENSHOT]
  12.1.10 □ Navigate to /admin/allocate → allocation page loads [SCREENSHOT]
  12.1.11 □ Navigate to /admin/clients → client list loads [SCREENSHOT]
  12.1.12 □ Full flow completes without any crashes or redirect loops
```

### Journey 2: Admin Client Management Flow

```
STEPS:
  12.2.1 □ Navigate to /admin/clients → client list [SCREENSHOT]
  12.2.2 □ Navigate to /admin/allocate → allocation interface [SCREENSHOT]
  12.2.3 □ Navigate to /admin/notifications → notification list [SCREENSHOT]
  12.2.4 □ Full flow completes without errors
```

### Journey 3: Client Dashboard Flow (if client account exists)

```
STEPS:
  12.3.1 □ Login as client → /dashboard loads [SCREENSHOT]
  12.3.2 □ Navigate to /dashboard/products [SCREENSHOT]
  12.3.3 □ Navigate to /dashboard/orders [SCREENSHOT]
  12.3.4 □ Navigate to /dashboard/billing [SCREENSHOT]
  12.3.5 □ Navigate to /dashboard/integrations [SCREENSHOT]
  12.3.6 □ Navigate to /dashboard/content [SCREENSHOT]
  12.3.7 □ Navigate to /dashboard/requests [SCREENSHOT]
  12.3.8 □ Navigate to /dashboard/affiliate [SCREENSHOT]
  12.3.9 □ Full flow completes without errors
```

---

## SECTION 13: REGRESSION CHECKS

### Verify these previously-fixed bugs have NOT regressed:

```
TESTS:
  13.1.1 □ Admin user on yousell.online does NOT hit redirect loop (/dashboard ↔ /admin)
  13.1.2 □ Users with no role do NOT hit redirect loop (/dashboard ↔ /login)
  13.1.3 □ RPC check_user_role failure does NOT lock all users out (middleware has fallback)
  13.1.4 □ /forgot-password is accessible without auth
  13.1.5 □ /reset-password is accessible without auth
  13.1.6 □ /admin/unauthorized renders with sign-out button (not blank)
  13.1.7 □ Middleware matcher includes: /, /admin/:path*, /dashboard/:path*, /login, /signup, /forgot-password, /reset-password
```

---

## SECTION 14: VISUAL REGRESSION (Playwright Snapshots)

### Method: Run existing Playwright visual tests across all 3 viewports

```
EXECUTION:
  14.1 □ Run: npx playwright test e2e/visual-regression.spec.ts --project=desktop-chrome --update-snapshots
  14.2 □ Run: npx playwright test e2e/visual-regression.spec.ts --project=mobile-chrome --update-snapshots
  14.3 □ Run: npx playwright test e2e/visual-regression.spec.ts --project=tablet --update-snapshots
  14.4 □ Log pass/fail count for each viewport
  14.5 □ Any test that times out → retry once, then log as network issue

PAGES COVERED (30+ pages across 3 viewports = 90+ screenshots):
  - Public: login, signup, pricing, forgot-password, privacy, terms
  - Admin: dashboard, products, trends, analytics, clients, settings, tiktok, shopify,
           blueprints, clusters, competitors, influencers, suppliers, automation,
           notifications, pod, ads, scan
  - Client: dashboard/products, dashboard/content, dashboard/orders, dashboard/billing,
            dashboard/integrations, dashboard/requests
```

---

## POST-QA ACTIONS

After ALL sections are complete:

```
1. Compile final results into system/qa_results_<date>.md
2. Add summary at top:
   - Total tests: X
   - Passed: X
   - Failed: X
   - Skipped: X
   - Critical bugs: X
   - High bugs: X
3. Categorize ALL failures by severity
4. Create tasks/todo.md entries for each bug found
5. Fix ALL 🔴 CRITICAL bugs immediately (inline during QA)
6. Fix ALL 🟠 HIGH bugs immediately if time permits
7. Re-test fixed items
8. Commit qa_results + any fixes
9. Push to branch
10. Update system/development_log.md with QA session summary
```

---

## TOTAL TEST COUNT

| Section | Tests |
|---------|-------|
| 0. Pre-flight | ~25 |
| 1. Auth flows | ~30 |
| 2. Middleware matrix | 52 |
| 3. Public pages | ~15 |
| 4. Client dashboard | ~16 |
| 5. Admin dashboard | ~40 |
| 6. API health check | ~40 |
| 7. RLS security | 7 |
| 8. Security headers | 12 |
| 9. Error handling | 4 |
| 10. Performance | 7 |
| 11. Mobile responsiveness | ~25 |
| 12. User journeys | ~25 |
| 13. Regression checks | 7 |
| 14. Visual regression | ~90 |
| **TOTAL** | **~395 tests** |

---

**END OF PROMPT — Execute ALL sections. Do NOT stop. Log EVERY result.**
