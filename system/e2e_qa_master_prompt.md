# YOUSELL PLATFORM — E2E QA MASTER PROMPT (LIVE)

> **PURPOSE**: This prompt is a complete end-to-end quality assurance execution plan
> for the entire YouSell platform. It tests every page, every API route, every auth
> flow, every redirect, and every user journey — using REAL browsers, REAL logins,
> and REAL data.
>
> **SCOPE**: 48 pages · 74 API routes · 35 database tables · 3 user roles · 2 domains
>
> **MODE**: Execute sequentially. Log every result. Stop-on-critical.

---

## 0. PRE-FLIGHT CHECKS

Before touching a browser, verify infrastructure:

```
PARALLEL CHECK GROUP 1 — Infrastructure:
  □ Netlify deployment status (check deploy logs for build errors)
  □ Supabase project status (dashboard.supabase.com → project health)
  □ DNS resolution: dig yousell.online / dig admin.yousell.online
  □ SSL certificates valid on both domains

PARALLEL CHECK GROUP 2 — Environment:
  □ .env.local has all required vars (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, RESEND_API_KEY, ANTHROPIC_API_KEY)
  □ Supabase: all 27 migrations applied (check supabase/migrations vs live schema)
  □ RPC function exists: SELECT check_user_role('<any-user-uuid>') — should return a role string
  □ Profiles trigger exists: INSERT into auth.users should auto-create profiles row

PARALLEL CHECK GROUP 3 — Test Accounts:
  □ Super Admin account exists (role = 'super_admin' in profiles)
  □ Admin account exists (role = 'admin' in profiles)
  □ Client account exists (role = 'client' in profiles + matching clients row)
  □ Fresh email ready for new signup test (use a +alias like test+qa1@gmail.com)
  □ "No role" account exists for edge case testing (profiles.role = 'viewer' or NULL)
```

### Pre-Flight SQL Verification (run in Supabase SQL Editor):

```sql
-- Check all critical tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RPC function
SELECT check_user_role('<super-admin-uuid>');

-- Check profiles trigger
SELECT tgname, tgrelid::regclass, tgfoid::regproc
FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check RLS is enabled on critical tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'profiles', 'clients', 'products', 'product_allocations',
  'subscriptions', 'notifications', 'orders'
);

-- Count records in key tables
SELECT 'profiles' as tbl, count(*) FROM profiles
UNION ALL SELECT 'clients', count(*) FROM clients
UNION ALL SELECT 'products', count(*) FROM products
UNION ALL SELECT 'product_allocations', count(*) FROM product_allocations
UNION ALL SELECT 'subscriptions', count(*) FROM subscriptions;
```

**GATE**: If any pre-flight check fails, fix it before proceeding. Do NOT skip.

---

## 1. AUTHENTICATION FLOWS (CRITICAL PATH)

### 1.1 Client Signup — Fresh User

```
BROWSER: Incognito / Private window
URL: https://yousell.online/signup

TEST STEPS:
  1. □ Page loads without errors (no blank screen, no console errors)
  2. □ All form fields render: Full Name, Email, Password, Referral Code (optional)
  3. □ Submit with EMPTY fields → validation errors shown for each required field
  4. □ Submit with invalid email format → email validation error
  5. □ Submit with password < 8 chars → password length error
  6. □ Submit with VALID data (use fresh test email)
  7. □ Success screen appears: "Check your email" with the submitted email shown
  8. □ Confirmation email received (check inbox + spam)
  9. □ Email contains correct confirmation link pointing to yousell.online/api/auth/callback
  10. □ Click confirmation link → redirected to /dashboard (not /login, not /admin)
  11. □ New user's profile row created in Supabase (profiles table, role = 'viewer' or 'client')
  12. □ If role = 'viewer' (no client row), user should see homepage or error — NOT redirect loop

EDGE CASES:
  □ Signup with already-registered email → appropriate error message
  □ Signup with referral code → referral_code stored in user metadata
  □ Social signup (Google button) → OAuth flow → callback → correct redirect
  □ Social signup (Facebook button) → same flow
```

### 1.2 Client Login — Email/Password

```
BROWSER: Incognito
URL: https://yousell.online/login

TEST STEPS:
  1. □ Page loads: left panel (form) + right panel (feature list) on desktop
  2. □ Mobile responsive: right panel hidden, form fills screen
  3. □ Social login buttons render (Google, Facebook)
  4. □ "or sign in with email" divider visible
  5. □ Email + Password fields present with icons
  6. □ Show/hide password toggle works
  7. □ "Remember me" checkbox present and checked by default
  8. □ "Forgot password?" link → navigates to /forgot-password
  9. □ Submit with wrong password → error: "Invalid login credentials"
  10. □ Submit with non-existent email → error (should NOT reveal if email exists)
  11. □ Submit with CORRECT client credentials → redirect to /dashboard
  12. □ Page uses window.location.href (full navigation), NOT router.push
  13. □ "Don't have an account? Contact YouSell" link present
  14. □ Footer: copyright, privacy link, terms link

ROLE-BASED ROUTING:
  □ Client login with CLIENT role → /dashboard ✓
  □ Client login with ADMIN role → redirect to https://admin.yousell.online/admin
  □ Client login with SUPER_ADMIN role → redirect to https://admin.yousell.online/admin
  □ Client login with NO ROLE (viewer/null) → stays on /login with error message
  □ Already-logged-in client visiting /login → auto-redirect to /dashboard
  □ Already-logged-in client visiting /login?kicked=no_role → stays on login, shows error
```

### 1.3 Admin Login

```
BROWSER: Incognito
URL: https://admin.yousell.online/admin/login

TEST STEPS:
  1. □ Page loads: white card on dark background
  2. □ "YouSell Admin" title
  3. □ Email + Password fields
  4. □ Submit with wrong credentials → error shown
  5. □ Submit with CLIENT credentials → login succeeds but middleware redirects to /admin/unauthorized
  6. □ Submit with ADMIN credentials → redirect to /admin
  7. □ Submit with SUPER_ADMIN credentials → redirect to /admin
  8. □ Already-logged-in admin visiting /admin/login → auto-redirect to /admin

EDGE CASES:
  □ Visit admin.yousell.online/ (root) while logged out → redirect to /admin/login
  □ Visit admin.yousell.online/ (root) while logged in as admin → redirect to /admin
  □ Visit admin.yousell.online/dashboard → redirect to /admin (blocked route)
  □ Visit admin.yousell.online/login → redirect to /admin/login (blocked route)
```

### 1.4 OAuth Login (Google)

```
BROWSER: Incognito
URL: https://yousell.online/login → Click "Continue with Google"

TEST STEPS:
  1. □ Google OAuth consent screen appears
  2. □ Select Google account → authorize
  3. □ Redirected to /api/auth/callback with code param
  4. □ Callback exchanges code successfully
  5. □ Profile fetched/created in Supabase
  6. □ Correct redirect based on role:
       - Client role → /dashboard
       - Admin role → admin.yousell.online/admin (cross-domain)
       - No role → /login or homepage (no loop)
  7. □ User avatar/name populated from Google profile
  8. □ Repeat from admin.yousell.online/admin/login if admin OAuth is supported

FAILURE CASES:
  □ User cancels OAuth → redirected to /login?error=auth with error message shown
  □ OAuth provider error → redirected to /login?error=auth with error message shown
```

### 1.5 Password Reset

```
URL: https://yousell.online/forgot-password

TEST STEPS:
  1. □ Page loads with email input
  2. □ Submit with registered email → success message shown
  3. □ Reset email received with correct link
  4. □ Click link → lands on /reset-password
  5. □ Enter new password → success
  6. □ Login with new password → works
  7. □ Login with old password → fails

EDGE CASES:
  □ Submit with non-existent email → should NOT reveal email doesn't exist
  □ /forgot-password accessible without auth (in middleware matcher)
  □ /reset-password accessible without auth (in middleware matcher)
```

### 1.6 Sign Out

```
TEST STEPS:
  1. □ Client dashboard: find sign out button → click
  2. □ Redirected to /login (full page navigation, not router.push)
  3. □ Session cookies cleared (check DevTools → Application → Cookies)
  4. □ Visiting /dashboard after signout → redirect to /login (not cached page)
  5. □ Admin dashboard: find sign out button → click
  6. □ Redirected to /admin/login
  7. □ Visiting /admin after signout → redirect to /admin/login
  8. □ Unauthorized page (/admin/unauthorized): sign out button → /admin/login
```

### 1.7 Middleware Redirect Matrix (EXHAUSTIVE)

Test EVERY combination. Use browser or curl with/without auth cookies.

```
LEGEND: ✓ = expected behavior, test it matches

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

CRITICAL: NO redirect should loop. If browser shows ERR_TOO_MANY_REDIRECTS → BUG.
Test each cell. Mark pass/fail.
```

---

## 2. PUBLIC PAGES

### 2.1 Homepage

```
URL: https://yousell.online/

TEST STEPS:
  1. □ Page loads (check for white flash, layout shift, missing fonts)
  2. □ Custom fonts load (Outfit, DM Sans)
  3. □ Hero section visible with CTA
  4. □ Feature sections render
  5. □ Navigation links work (Login, Signup, Pricing)
  6. □ Mobile responsive: hamburger menu or stacked layout
  7. □ Footer renders with links
  8. □ No console errors
  9. □ Performance: page loads in < 3 seconds on 4G
  10. □ SEO: <title> and <meta description> present
```

### 2.2 Static Pages

```
□ /privacy — renders privacy policy content, no auth required
□ /terms — renders terms of service content, no auth required
□ /pricing — renders pricing tiers, no auth required
  → Verify 4 tiers shown: Starter ($29), Growth ($59), Professional ($99), Enterprise ($149)
  → Each tier lists features, product limits, platform limits
  → CTA buttons present (link to signup or checkout)
```

---

## 3. CLIENT DASHBOARD (role = client)

> Login as a client user. All tests below assume authenticated client session.

### 3.1 Main Dashboard (/dashboard)

```
TEST STEPS:
  1. □ Page loads without errors
  2. □ KPI cards render (products allocated, orders, content credits, etc.)
  3. □ API call: GET /api/dashboard/products → returns allocated products
  4. □ API call: GET /api/dashboard/requests → returns product requests
  5. □ Allocated products section shows products (or empty state)
  6. □ Request form present and functional
  7. □ Sidebar navigation renders with all links
  8. □ Mobile: hamburger nav works
  9. □ User avatar/name shown in header or sidebar
  10. □ Theme toggle (if present) switches dark/light
```

### 3.2 Products (/dashboard/products)

```
TEST STEPS:
  1. □ Page loads with product list (or empty state)
  2. □ Products shown are ONLY those allocated to this client (RLS check)
  3. □ Product cards show: title, image, price, score badge, platform
  4. □ Score badge colors correct: HOT(red/>=80), WARM(orange/>=60), WATCH(yellow/>=40), COLD(gray/<40)
  5. □ Click product → navigates to /dashboard/products/[id]
  6. □ Pagination works if >10 products
  7. □ Empty state: "No products allocated yet" message
```

### 3.3 Product Detail (/dashboard/products/[id])

```
TEST STEPS:
  1. □ Page loads with product details
  2. □ Product image renders (check remote image loading from CDN domains)
  3. □ All metadata visible: title, price, source, scores, AI insights
  4. □ Score breakdown: trend, viral, profit scores shown
  5. □ AI insight text (Haiku/Sonnet) displayed
  6. □ Back button returns to product list
  7. □ Cannot access another client's product (RLS enforcement)
```

### 3.4 Orders (/dashboard/orders)

```
TEST STEPS:
  1. □ Page loads
  2. □ Order list renders (or empty state)
  3. □ Order details: order ID, product, customer, amount, status
  4. □ Only shows orders belonging to this client
```

### 3.5 Billing (/dashboard/billing)

```
TEST STEPS:
  1. □ Page loads
  2. □ Current plan displayed (Starter/Growth/Professional/Enterprise)
  3. □ Subscription status shown (active/cancelled/past_due)
  4. □ "Manage Subscription" → opens Stripe Customer Portal (or correct action)
  5. □ Upgrade/downgrade CTAs present
  6. □ Content credits shown: used/total for current period
  7. □ Billing history or next payment date shown
```

### 3.6 Integrations (/dashboard/integrations)

```
TEST STEPS:
  1. □ Page loads
  2. □ Channel list: Amazon, TikTok Shop, Shopify
  3. □ Each channel shows: connected/disconnected status
  4. □ "Connect" button initiates OAuth flow for the platform
  5. □ "Disconnect" button removes connection
  6. □ Connected channels show account details
```

### 3.7 Content (/dashboard/content)

```
TEST STEPS:
  1. □ Page loads
  2. □ Content generation form present
  3. □ Select product → select content type → generate
  4. □ API call: POST /api/dashboard/content/generate
  5. □ Content credits deducted correctly
  6. □ Generated content displayed
  7. □ Schedule content: POST /api/dashboard/content/schedule
  8. □ Content queue shows scheduled items
```

### 3.8 Requests (/dashboard/requests)

```
TEST STEPS:
  1. □ Page loads
  2. □ Request history shown (or empty state)
  3. □ Submit new request: select platform, add note, submit
  4. □ API call: POST /api/dashboard/requests
  5. □ New request appears in list with status "pending"
  6. □ Status badges: pending/reviewed/fulfilled
```

### 3.9 Affiliate (/dashboard/affiliate)

```
TEST STEPS:
  1. □ Page loads
  2. □ Referral code displayed (unique to this client)
  3. □ Referral link shown (copyable)
  4. □ Referral stats: total referrals, signed up, subscribed
  5. □ Commission history shown
  6. □ Commission amounts and statuses correct
```

---

## 4. ADMIN DASHBOARD (role = admin or super_admin)

> Login as admin user on admin.yousell.online. All tests below assume authenticated admin session.

### 4.1 Main Dashboard (/admin)

```
TEST STEPS:
  1. □ Page loads without errors
  2. □ KPI cards render: total products, hot products, active clients, revenue
  3. □ Engine status grid shows all 8 engines with status indicators
  4. □ Scan history section shows recent scans
  5. □ Pre-viral products section (products approaching HOT threshold)
  6. □ Revenue metrics section
  7. □ System status indicators
  8. □ Sidebar navigation with ALL admin pages listed
  9. □ Feature categories navigation
  10. □ API calls: GET /api/admin/dashboard, /api/admin/products, etc.
```

### 4.2 Discovery Engine — Scan (/admin/scan)

```
TEST STEPS:
  1. □ Page loads with EnginePageLayout wrapper
  2. □ Scan modes available: Quick, Full, Client
  3. □ Platform toggles: TikTok, Amazon, Shopify, Pinterest, Digital, AI Affiliates, Physical
  4. □ "Start Scan" button present
  5. □ Trigger Quick Scan → API: POST /api/admin/scan
  6. □ Scan progress indicator appears
  7. □ Scan completes → products found count shown
  8. □ Scan history updated with new entry
  9. □ Health check: GET /api/admin/scan/health → returns status

NOTE: Live scanning requires APIFY_API_TOKEN. If not configured:
  □ Scan should fail gracefully with a meaningful error
  □ No unhandled exceptions or blank screens
```

### 4.3 Discovery Engine — Products (/admin/products)

```
TEST STEPS:
  1. □ Page loads with product data table
  2. □ Columns: product title, platform, score, trend stage, price, actions
  3. □ Sorting works on each column
  4. □ Filtering by platform, score tier, trend stage
  5. □ Search by product title
  6. □ Pagination works
  7. □ Click product → expand/edit details
  8. □ Edit product fields → save → data persists
  9. □ Score badges render correctly (HOT/WARM/WATCH/COLD)
  10. □ AI insights visible for products that have been scored
  11. □ "Push to Store" action works → POST /api/admin/products/push
```

### 4.4 TikTok Discovery (/admin/tiktok)

```
TEST STEPS:
  1. □ Page loads
  2. □ Video feed section renders
  3. □ Hashtag analysis section renders
  4. □ "Discover" trigger → POST /api/admin/tiktok/discover
  5. □ Video list: GET /api/admin/tiktok/videos
  6. □ Hashtag signals: GET /api/admin/tiktok/signals
  7. □ Graceful handling if TIKTOK_PROVIDER=mock or API keys missing
```

### 4.5 Trend Detection (/admin/trends)

```
TEST STEPS:
  1. □ Page loads
  2. □ Keyword trends table renders
  3. □ Rising/declining indicators
  4. □ API: GET /api/admin/trends
  5. □ Trend velocity values make sense
  6. □ Time-series or sparkline visualization (if implemented)
```

### 4.6 Clustering (/admin/clusters)

```
TEST STEPS:
  1. □ Page loads
  2. □ Product clusters listed with member counts
  3. □ API: GET /api/admin/clusters
  4. □ Click cluster → see member products with similarity scores
  5. □ Create cluster: POST /api/admin/clusters
```

### 4.7 Creator Matching (/admin/creator-matches)

```
TEST STEPS:
  1. □ Page loads
  2. □ Product-influencer match list renders
  3. □ Match scores visible
  4. □ API: GET /api/admin/creator-matches
  5. □ Outreach status shown for each match
```

### 4.8 Influencers (/admin/influencers)

```
TEST STEPS:
  1. □ Page loads
  2. □ Influencer database table renders
  3. □ Columns: username, platform, followers, tier, engagement rate
  4. □ Filter by platform, tier
  5. □ API: GET /api/admin/influencers
  6. □ Invite action: POST /api/admin/influencers/invite
```

### 4.9 Suppliers (/admin/suppliers)

```
TEST STEPS:
  1. □ Page loads
  2. □ Supplier list renders
  3. □ Columns: name, country, MOQ, unit price, lead time
  4. □ Filter by dropship, white label, US warehouse
  5. □ API: GET /api/admin/suppliers
```

### 4.10 Ad Intelligence (/admin/ads)

```
TEST STEPS:
  1. □ Page loads
  2. □ Ad data renders (or empty state)
  3. □ API: GET /api/admin/ads
  4. □ Ad creative previews visible
  5. □ Metrics: impressions, clicks, spend
```

### 4.11 Competitors (/admin/competitors)

```
TEST STEPS:
  1. □ Page loads
  2. □ Competitor store list renders
  3. □ API: GET /api/admin/competitors
  4. □ Store analysis details visible
```

### 4.12 Client Management (/admin/clients)

```
TEST STEPS:
  1. □ Page loads
  2. □ Client list with: name, email, plan, status
  3. □ API: GET /api/admin/clients
  4. □ Click client → view details
  5. □ Edit client plan/notes
  6. □ View client's allocated products
  7. □ View client's subscription status
```

### 4.13 Product Allocation (/admin/allocate)

```
TEST STEPS:
  1. □ Page loads
  2. □ Product selection interface
  3. □ Client selection interface
  4. □ Allocate product to client → success
  5. □ Verify product appears in client's /dashboard/products
  6. □ API: GET /api/admin/allocations
  7. □ Allocation requests from clients: GET /api/admin/allocations/requests
```

### 4.14 Analytics (/admin/analytics)

```
TEST STEPS:
  1. □ Page loads
  2. □ Charts/graphs render (or placeholder)
  3. □ API: GET /api/admin/analytics
  4. □ Revenue data: GET /api/admin/revenue
  5. □ Financial summary: GET /api/admin/financial
```

### 4.15 Remaining Admin Pages

```
□ /admin/setup — API key configuration form loads, keys can be saved
□ /admin/settings — Settings page loads, preferences editable
□ /admin/notifications — Notification list loads, mark-as-read works
□ /admin/import — Bulk import interface loads, file upload works
□ /admin/blueprints — Blueprint list loads, create new blueprint works
□ /admin/amazon — Amazon FBA page loads
□ /admin/shopify — Shopify page loads
□ /admin/pinterest — Pinterest page loads
□ /admin/digital — Digital products page loads
□ /admin/pod — Print-on-Demand page loads
□ /admin/affiliates — Affiliate overview loads
□ /admin/affiliates/ai — AI affiliate management loads
□ /admin/affiliates/physical — Physical affiliate management loads
□ /admin/affiliates/commissions — Commission tracking loads
□ /admin/automation — Automation rules page loads
□ /admin/unauthorized — Unauthorized page renders with sign-out button
```

---

## 5. API ROUTE HEALTH CHECK

### Method: Use browser DevTools Network tab, or curl/Postman with auth cookies.

### 5.1 Auth Routes

```
□ GET  /api/auth/callback?code=test     → handles missing/invalid code gracefully
□ GET  /api/auth/oauth/callback          → handles OAuth provider redirect
□ POST /api/auth/signout                 → clears session, returns 200
```

### 5.2 Admin API Routes (require admin auth)

```
DASHBOARD:
□ GET  /api/admin/dashboard              → 200 + KPI data (or empty)
□ GET  /api/admin/products               → 200 + product array
□ GET  /api/admin/products?page=1&limit=10 → pagination works

ENGINES:
□ GET  /api/admin/tiktok                 → 200 + tiktok data
□ GET  /api/admin/tiktok/videos          → 200 + video array
□ GET  /api/admin/tiktok/signals         → 200 + hashtag signals
□ GET  /api/admin/trends                 → 200 + trend data
□ GET  /api/admin/clusters               → 200 + cluster data
□ GET  /api/admin/creator-matches        → 200 + match data
□ GET  /api/admin/influencers            → 200 + influencer data
□ GET  /api/admin/suppliers              → 200 + supplier data
□ GET  /api/admin/ads                    → 200 + ad data
□ GET  /api/admin/competitors            → 200 + competitor data
□ GET  /api/admin/opportunities          → 200 + aggregated feed

MANAGEMENT:
□ GET  /api/admin/clients                → 200 + client list
□ GET  /api/admin/allocations            → 200 + allocation list
□ GET  /api/admin/allocations/requests   → 200 + request list
□ GET  /api/admin/notifications          → 200 + notification list
□ GET  /api/admin/settings               → 200 + settings object
□ GET  /api/admin/blueprints             → 200 + blueprint list

ANALYTICS:
□ GET  /api/admin/analytics              → 200 + analytics data
□ GET  /api/admin/revenue                → 200 + revenue metrics
□ GET  /api/admin/financial              → 200 + financial summary
□ GET  /api/admin/scoring                → 200 + scoring details

HEALTH:
□ GET  /api/admin/scan/health            → 200 + engine health
□ GET  /api/admin/engines/health         → 200 + all engines status

UNAUTHORIZED ACCESS:
□ ALL admin routes with NO auth → 401
□ ALL admin routes with CLIENT auth → 403 or redirect
```

### 5.3 Dashboard API Routes (require client auth)

```
□ GET  /api/dashboard/products           → 200 + allocated products
□ GET  /api/dashboard/requests           → 200 + request list
□ POST /api/dashboard/requests           → 201 + new request created
□ GET  /api/dashboard/orders             → 200 + order list
□ GET  /api/dashboard/content            → 200 + content list
□ GET  /api/dashboard/channels           → 200 + channel list
□ GET  /api/dashboard/subscription       → 200 + subscription details
□ GET  /api/dashboard/engines            → 200 + engine status
□ GET  /api/dashboard/affiliate/referral → 200 + referral stats

UNAUTHORIZED ACCESS:
□ ALL dashboard routes with NO auth → 401
□ ALL dashboard routes with ADMIN auth → 403 or appropriate handling
```

### 5.4 Webhook Routes (require signature verification)

```
□ POST /api/webhooks/stripe  without signature → 400/401
□ POST /api/webhooks/shopify without signature → 400/401
□ POST /api/webhooks/tiktok  without signature → 400/401
□ POST /api/webhooks/amazon  without signature → 400/401
□ POST /api/webhooks/resend  without signature → 400/401
```

---

## 6. CROSS-CUTTING CONCERNS

### 6.1 RLS (Row-Level Security) Verification

```
CRITICAL TESTS:
  □ Client A cannot see Client B's products (product_allocations filtered)
  □ Client A cannot see Client B's orders
  □ Client A cannot see Client B's subscription
  □ Client A cannot read admin_settings
  □ Client A cannot read outreach_emails
  □ Client A cannot read automation_jobs
  □ Admin can see ALL client data
  □ Super admin can see ALL data

METHOD: Login as Client A, try to access Client B's product ID via direct API call:
  GET /api/dashboard/products?id=<client-b-product-id>
  → Should return empty or 403
```

### 6.2 Security Headers

```
CHECK on every page:
  □ X-Frame-Options: DENY
  □ X-Content-Type-Options: nosniff
  □ Referrer-Policy: strict-origin-when-cross-origin
  □ Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 6.3 Error Handling

```
□ Visit /nonexistent-page → 404 page (not crash)
□ Visit /dashboard/products/nonexistent-id → graceful error
□ API route with invalid params → structured error response (not stack trace)
□ Supabase connection failure → user-facing error, not blank screen
□ Stripe webhook with malformed payload → 400, no crash
```

### 6.4 Performance

```
□ Homepage: LCP < 2.5s, CLS < 0.1
□ Dashboard: initial load < 3s
□ Admin products table: loads 100+ products without freezing
□ No unnecessary re-renders (React DevTools Profiler)
□ Images use Next.js <Image> where possible (check LCP warnings in build)
□ API responses: < 500ms for reads, < 2s for writes
```

### 6.5 Mobile Responsiveness

```
Test at these breakpoints (Chrome DevTools device toolbar):
  □ 375px (iPhone SE)
  □ 390px (iPhone 14)
  □ 768px (iPad)
  □ 1024px (iPad Pro)
  □ 1440px (Desktop)

CHECK ON EACH:
  □ No horizontal overflow
  □ Text readable without zooming
  □ Buttons/links tappable (min 44x44px touch target)
  □ Sidebar collapses to hamburger on mobile
  □ Data tables scroll horizontally on small screens
  □ Forms fill available width
```

---

## 7. FULL USER JOURNEYS (END-TO-END FLOWS)

### Journey 1: New Client Onboarding

```
1. Visit yousell.online → see Homepage
2. Click "Sign Up" → fill form → submit
3. Receive confirmation email → click link
4. Land on /dashboard (empty state)
5. See subscription prompt → navigate to /dashboard/billing
6. Select plan → Stripe Checkout → payment
7. Return to dashboard → plan active
8. Admin allocates products → products appear in /dashboard/products
9. Client views product details
10. Client generates content for a product
11. Client connects Shopify store
12. Client views orders (after admin pushes product to store)
```

### Journey 2: Admin Product Discovery

```
1. Login at admin.yousell.online
2. Navigate to /admin/scan
3. Run Quick Scan across TikTok + Amazon
4. Scan completes → navigate to /admin/products
5. Review discovered products, sort by score
6. View HOT product details, AI insights
7. Navigate to /admin/clusters → see product grouped
8. Navigate to /admin/creator-matches → see matched influencers
9. Navigate to /admin/suppliers → find supplier for product
10. Create launch blueprint → /admin/blueprints
11. Allocate product to a client → /admin/allocate
12. Verify product visible in client's dashboard
```

### Journey 3: Admin Client Management

```
1. Navigate to /admin/clients
2. View client list
3. Click client → see details, subscription, allocated products
4. Navigate to /admin/allocate → allocate new products
5. Navigate to /admin/allocations/requests → review client requests
6. Fulfill a request → products released
7. Check /admin/notifications for system alerts
```

---

## 8. RESULTS LOG TEMPLATE

For each test, log:

```markdown
| # | Test | Status | Notes |
|---|------|--------|-------|
| 1.1.1 | Signup page loads | ✅ PASS / ❌ FAIL / ⚠️ PARTIAL | Details... |
```

### Severity Classification:

| Level | Definition | Action |
|-------|-----------|--------|
| 🔴 CRITICAL | Blocks user flow entirely (crash, redirect loop, blank screen) | Fix immediately |
| 🟠 HIGH | Feature broken but workaround exists | Fix before launch |
| 🟡 MEDIUM | UI/UX issue, non-blocking | Fix in next sprint |
| 🟢 LOW | Cosmetic, minor text, spacing | Backlog |

---

## 9. KNOWN ISSUES TO VERIFY FIXED

These bugs were identified and fixed. Verify they don't regress:

```
□ Admin user on yousell.online NO LONGER hits redirect loop (/dashboard ↔ /admin)
□ Users with no role NO LONGER hit redirect loop (/dashboard ↔ /login)
□ RPC check_user_role failure NO LONGER locks all users out
□ OAuth failure shows error message on login page (not silent redirect)
□ Unauthorized page sign-out uses window.location.href (full cookie clear)
□ Signup includes emailRedirectTo (confirmation lands on correct domain)
□ /forgot-password and /reset-password are in middleware matcher
□ useSearchParams wrapped in Suspense (Netlify build succeeds)
```

---

## 10. POST-QA ACTIONS

After completing all tests:

```
1. Compile results into system/qa_results_<date>.md
2. Categorize bugs by severity (CRITICAL → LOW)
3. Create tasks/todo.md entries for each bug
4. Fix CRITICAL and HIGH bugs immediately
5. Commit + deploy + re-test fixed items
6. Update system/development_log.md with QA session summary
```

---

**END OF QA PROMPT — 48 pages · 74 API routes · 180+ individual test cases**
