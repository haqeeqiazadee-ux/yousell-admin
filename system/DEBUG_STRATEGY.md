# YOUSELL Platform — Full Debug & Verification Strategy

**Created:** 2026-03-14
**Purpose:** Systematic end-to-end verification of every system component
**Status:** Ready for execution

---

## OVERVIEW

This document provides a step-by-step debug strategy to verify every layer of the YouSell platform — from database tables to API routes to frontend pages. Each test has a clear PASS/FAIL criteria.

The strategy is organized in dependency order: fix Layer 1 before moving to Layer 2, etc.

---

## LAYER 1: DATABASE (Supabase)

The foundation. Nothing works if the tables don't exist or RLS blocks access.

### Test 1.1 — Core Tables Exist

**How:** Run this SQL in Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables (minimum required):**
- `profiles`
- `admin_settings`
- `clients`
- `products`
- `scans`
- `product_allocations`
- `product_requests`
- `trend_keywords`
- `competitors`
- `influencers`
- `suppliers`
- `viral_signals`
- `launch_blueprints`
- `automation_jobs`
- `notifications`
- `imported_files`
- `tiktok_videos`
- `tiktok_hashtag_signals`
- `product_clusters`
- `product_cluster_members`
- `creator_product_matches`
- `ads`

**PASS:** All tables listed above exist
**FAIL:** Any missing → run the corresponding migration SQL

---

### Test 1.2 — V7 Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'subscriptions', 'platform_access', 'engine_toggles',
  'connected_channels', 'content_queue', 'orders',
  'usage_tracking', 'addons', 'client_addons'
);
```

**PASS:** All 9 tables exist
**FAIL:** Run `009_v7_new_tables.sql` in SQL Editor

---

### Test 1.3 — RPC Function Exists

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'check_user_role';
```

**PASS:** Returns 1 row
**FAIL:** Run `015_admin_check_rpc.sql` in SQL Editor

---

### Test 1.4 — Admin User Has Correct Role

```sql
SELECT id, email, user_role
FROM profiles
WHERE user_role IN ('admin', 'super_admin');
```

**PASS:** Your admin email appears with `admin` or `super_admin` role
**FAIL:** Update the profile:

```sql
UPDATE profiles
SET user_role = 'super_admin'
WHERE email = 'YOUR_ADMIN_EMAIL';
```

---

### Test 1.5 — Admin Settings Table Accepts Data

```sql
-- Insert a test setting
INSERT INTO admin_settings (key, value)
VALUES ('debug_test', '"hello"'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Read it back
SELECT * FROM admin_settings WHERE key = 'debug_test';

-- Clean up
DELETE FROM admin_settings WHERE key = 'debug_test';
```

**PASS:** Insert succeeds, read returns the row, delete cleans up
**FAIL:** Check RLS policies on admin_settings — admin must have INSERT/UPDATE/SELECT

---

### Test 1.6 — RLS Policies Allow Admin Access

```sql
-- Check policies on key tables
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('products', 'clients', 'scans', 'admin_settings', 'profiles')
ORDER BY tablename;
```

**PASS:** Each table has at least one policy allowing admin SELECT
**FAIL:** Review and fix RLS policies per migration 005

---

### Test 1.7 — Products Table Has Required Columns

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

**Expected columns (minimum):**
- `id`, `title`, `price`, `url`, `image_url`
- `source` or `platform`
- `score_overall` or `final_score`
- `score_trend`, `score_viral` or `viral_score`
- `score_profit` or `profit_score`
- `status`, `trend_stage`
- `created_at`, `updated_at`

**PASS:** All essential columns exist
**FAIL:** Compare with migration 003 + 005 and add missing columns

---

## LAYER 2: ENVIRONMENT VARIABLES

### Test 2.1 — Check Netlify Site-Level Env Vars

Go to: **Netlify → Site Settings → Environment Variables** (NOT team-level)

**Required (Phase 1 — app won't work without these):**
| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |

**Required (Phase 5 — core features):**
| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `RESEND_API_KEY` | resend.com → API Keys |
| `APIFY_API_TOKEN` | console.apify.com → Settings → Integrations |

**Optional but recommended:**
| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_BACKEND_URL` or `BACKEND_URL` | Your Railway/hosting URL for the Express backend |
| `RAPIDAPI_KEY` | rapidapi.com → Dashboard |

**PASS:** All 6 required variables are set at site level in Netlify
**FAIL:** Add them in Netlify → Site Settings → Environment Variables → Add a variable

---

### Test 2.2 — Verify Env Vars Are Available at Runtime

Visit: `https://admin.yousell.online/api/admin/settings?debug=true`

**Expected response:**
```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": true,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": true,
    "SUPABASE_SERVICE_ROLE_KEY": true,
    "ANTHROPIC_API_KEY": true,
    "RESEND_API_KEY": true,
    "APIFY_API_TOKEN": true
  },
  "dbConnection": true
}
```

**PASS:** All required keys show `true`
**FAIL:** If keys show `false`, they were NOT available at build time. Two options:
1. Redeploy after setting env vars in Netlify (Next.js bakes env vars at build time)
2. Save keys via POST /api/admin/settings (stored in DB, available at runtime)

**CRITICAL NOTE:** Next.js resolves `process.env.X` at BUILD time, not runtime. If you set an env var in Netlify after the last deploy, you MUST trigger a new deploy for it to take effect.

---

### Test 2.3 — DB-Saved API Keys

```sql
SELECT key, value FROM admin_settings WHERE key = 'api_keys';
```

**PASS:** Returns a row with JSON containing your API keys
**FAIL (and that's OK):** DB-saved keys are optional fallback. If env vars work, this isn't needed.

---

## LAYER 3: AUTHENTICATION

### Test 3.1 — Login Flow

1. Go to `https://admin.yousell.online/admin/login`
2. Enter your admin email + password
3. Submit

**PASS:** Redirects to `/admin` dashboard
**FAIL scenarios:**
- "Invalid credentials" → Check Supabase Auth → Users → verify email exists and is confirmed
- Redirects to `/admin/unauthorized` → Your profile doesn't have admin role (see Test 1.4)
- Blank page / error → Check browser console for errors; likely missing Supabase env vars

---

### Test 3.2 — Session Persistence

1. Login successfully
2. Close the tab
3. Open `https://admin.yousell.online/admin` in a new tab

**PASS:** Still logged in, dashboard loads
**FAIL:** Cookie issue — check Supabase Auth → Settings → ensure cookie domain matches

---

### Test 3.3 — Middleware Protection

1. Open an incognito window (no session)
2. Try to visit `https://admin.yousell.online/admin`

**PASS:** Redirected to `/admin/login`
**FAIL:** Middleware not working — check middleware.ts deployment

---

### Test 3.4 — API Route Protection

1. Open an incognito window
2. Visit `https://admin.yousell.online/api/admin/dashboard`

**PASS:** Returns 401 or 403 JSON error
**FAIL:** Auth middleware not applied to API routes

---

## LAYER 4: DASHBOARD API

### Test 4.1 — Dashboard Endpoint (authenticated)

While logged in, open browser console and run:

```javascript
fetch('/api/admin/dashboard')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e));
```

**PASS:** Returns JSON with structure:
```json
{
  "products": 0,
  "tiktok": 0,
  "amazon": 0,
  "trends": 0,
  "competitors": 0,
  "clients": 0,
  "influencers": 0,
  "suppliers": 0,
  "services": {
    "supabase": true,
    "auth": true,
    "ai": true,
    "email": true,
    "apify": true,
    "rapidapi": false
  }
}
```

**FAIL scenarios:**
- 401/403 → Auth issue (see Layer 3)
- 500 error → Check the error message; likely a missing table or RLS blocking
- `services.ai: false` → ANTHROPIC_API_KEY not found (see Test 2.2)
- `services.email: false` → RESEND_API_KEY not found
- `services.apify: false` → APIFY_API_TOKEN not found
- All counts are 0 → That's normal if no data has been scanned yet

---

### Test 4.2 — Settings Endpoint

```javascript
fetch('/api/admin/settings')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
  .catch(e => console.error(e));
```

**PASS:** Returns `{ providers: [...] }` array with 26 providers, each showing `configured: true/false`
**FAIL:** 500 error → likely admin_settings table missing or RLS issue

---

### Test 4.3 — Save API Key via Settings

```javascript
fetch('/api/admin/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKeys: { ANTHROPIC_API_KEY: 'sk-ant-test-key' }
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

**PASS:** Returns `{ success: true, saved: 1 }`
**FAIL:** Check admin_settings table permissions

**IMPORTANT:** After testing, remove the test key:
```javascript
fetch('/api/admin/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKeys: { ANTHROPIC_API_KEY: '' }
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## LAYER 5: BACKEND (Express API + BullMQ)

### Test 5.1 — Backend is Running

```bash
curl https://YOUR_BACKEND_URL/health
```

**PASS:** Returns `{ status: "ok" }` or similar health response
**FAIL:** Backend not deployed or URL wrong. Check:
- Is the Express backend deployed (Railway, Render, etc.)?
- Is `BACKEND_URL` or `NEXT_PUBLIC_BACKEND_URL` set correctly?
- Is the backend's `PORT` environment variable set?

---

### Test 5.2 — Backend Can Connect to Supabase

Check backend logs for connection errors.

**Required backend env vars:**
- `SUPABASE_URL` (same as `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL` (for BullMQ)

**PASS:** No Supabase connection errors in backend logs
**FAIL:** Set the missing env vars in the backend's hosting platform

---

### Test 5.3 — Backend Can Connect to Redis

Check backend logs for Redis connection errors.

**PASS:** BullMQ workers start without errors
**FAIL:**
- Redis not provisioned → Set up Redis on Railway/Upstash
- Wrong URL → Check `REDIS_URL` format: `redis://default:password@host:port`

---

### Test 5.4 — Scan Endpoint Reachable from Frontend

While logged in to admin dashboard, run:

```javascript
fetch('/api/admin/scan?check=status')
  .then(r => r.json())
  .then(d => console.log(d));
```

**PASS:** Returns `{ configured: true }` or `{ configured: false }` (not an error)
**FAIL:** API route itself is broken — check route.ts

---

### Test 5.5 — Queue a Test Scan

```javascript
fetch('/api/admin/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'quick', query: 'test' })
})
.then(r => r.json())
.then(d => console.log(d));
```

**PASS:** Returns `{ jobId: "...", status: "queued" }`
**FAIL scenarios:**
- `configured: false` → BACKEND_URL not set
- Network error → Backend not reachable from Netlify functions
- 503 → Backend is down
- 500 → Backend threw an error (check backend logs)

---

## LAYER 6: SCRAPING & DATA COLLECTION

### Test 6.1 — Apify API Key Valid

```bash
curl -H "Authorization: Bearer YOUR_APIFY_TOKEN" \
  https://api.apify.com/v2/acts?limit=1
```

**PASS:** Returns JSON with your Apify actors
**FAIL:** Invalid token or expired — regenerate at console.apify.com

---

### Test 6.2 — Anthropic API Key Valid

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":10,"messages":[{"role":"user","content":"ping"}]}'
```

**PASS:** Returns a JSON response with Claude's reply
**FAIL:** Invalid key, expired, or insufficient credits

---

### Test 6.3 — Resend API Key Valid

```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"onboarding@resend.dev","to":"your@email.com","subject":"Test","text":"Test"}'
```

**PASS:** Returns `{ id: "..." }`
**FAIL:** Invalid key or domain not verified

---

## LAYER 7: FRONTEND PAGES

### Test 7.1 — Admin Dashboard Loads

1. Login and navigate to `/admin`
2. Open browser DevTools → Network tab

**PASS criteria:**
- Page renders without blank screen
- `/api/admin/dashboard` returns 200
- KPI cards show numbers (even if 0)
- System Status cards show "Connected" or "Check Config" (not errors)
- No red errors in Console tab

**Common failures:**
- Blank white page → JavaScript error; check Console tab
- "Hydration mismatch" → Server/client rendering inconsistency; check for `window` usage
- Infinite loading → API call hanging; check Network tab for stuck requests

---

### Test 7.2 — Setup Page Loads

Navigate to `/admin/setup`

**PASS criteria:**
- Progress bar shows X/6 complete
- Each service shows checkmark or X with status
- "Re-check Configuration" button works
- Configuration matches what the dashboard API returns

---

### Test 7.3 — Settings Page Loads

Navigate to `/admin/settings`

**PASS criteria:**
- Provider list renders with all 26 providers
- Each shows "Configured" or "Not Configured"
- Can expand a provider and enter an API key
- Save button works (check Network tab for POST response)

---

### Test 7.4 — Products Page

Navigate to `/admin/products`

**PASS criteria (empty state):**
- Page loads without error
- Shows "No products found" or empty table
- Filter/search controls render

**PASS criteria (with data):**
- Products listed with title, price, score, platform
- Sort and filter work
- Pagination works if >20 products

---

### Test 7.5 — Scan Page

Navigate to scan functionality (button on dashboard or `/admin/scan`)

**PASS criteria:**
- Scan buttons render (Quick, Full, Client)
- Clicking shows loading state
- If backend is configured: job queues successfully
- If backend NOT configured: shows helpful error message

---

### Test 7.6 — Client Management

Navigate to `/admin/clients`

**PASS criteria:**
- Page loads
- "Add Client" form works
- Client list renders (even if empty)
- Plan tier selection works (starter/growth/professional/enterprise)

---

## LAYER 8: REALTIME

### Test 8.1 — Supabase Realtime Subscription

1. Open admin dashboard
2. Open a second browser tab with Supabase SQL Editor
3. Run:
```sql
INSERT INTO products (title, price, source, status)
VALUES ('Debug Test Product', 19.99, 'manual', 'active');
```
4. Switch back to dashboard tab

**PASS:** Dashboard updates automatically within 2-3 seconds (product count increases)
**FAIL:** Realtime not working — check:
- Supabase → Database → Replication → ensure `products` table has Realtime enabled
- Also enable for `scans` table
- Check browser console for WebSocket errors

---

## LAYER 9: END-TO-END FLOWS

### Test 9.1 — Full Product Import Flow

1. Login to admin
2. Navigate to import page
3. Upload a CSV with columns: title, price, url, image_url, category
4. Verify products appear in products page

**Test CSV content:**
```csv
title,price,url,image_url,category
Debug Product 1,29.99,https://example.com/1,https://example.com/img1.jpg,electronics
Debug Product 2,49.99,https://example.com/2,https://example.com/img2.jpg,fashion
Debug Product 3,14.99,https://example.com/3,https://example.com/img3.jpg,beauty
```

---

### Test 9.2 — Full Scan Flow (requires backend)

1. Ensure backend is running (Test 5.1)
2. Ensure Apify token is valid (Test 6.1)
3. Click "Quick Scan" on dashboard
4. Monitor scan status updates
5. Verify new products appear after scan completes

---

### Test 9.3 — Product Scoring Flow

1. Have at least 1 product in the database
2. Trigger scoring via API:
```javascript
fetch('/api/admin/scoring', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'PRODUCT_UUID_HERE',
    trendInputs: { searchVolume: 50000, growthRate: 25, seasonality: 'evergreen' },
    viralInputs: { tiktokViews: 100000, engagementRate: 8.5, creatorCount: 15 },
    profitInputs: { costPrice: 8, retailPrice: 29.99, shippingCost: 3 }
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

**PASS:** Returns score breakdown with final_score, tier, and trend_stage
**FAIL:** Check if scoring library exists and ANTHROPIC_API_KEY works

---

### Test 9.4 — Client Allocation Flow

1. Create a client (Test 7.6)
2. Have products available
3. Navigate to allocations
4. Allocate a product to the client
5. Verify allocation appears

---

## EXECUTION ORDER

Run these tests in this exact order. Stop and fix at the first failure.

```
LAYER 1: Database           → Fix any missing tables/RLS first
LAYER 2: Environment Vars   → Ensure keys are set and available
LAYER 3: Authentication     → Verify login works
LAYER 4: Dashboard API      → Verify API responses
LAYER 5: Backend            → Verify Express + Redis + BullMQ
LAYER 6: External APIs      → Verify API keys work
LAYER 7: Frontend Pages     → Verify all pages render
LAYER 8: Realtime           → Verify live updates work
LAYER 9: End-to-End         → Full flow verification
```

---

## QUICK DIAGNOSIS CHEAT SHEET

| Symptom | Likely Cause | Test |
|---------|-------------|------|
| Dashboard shows all services as "Check Config" | Env vars not baked into build | Test 2.2 |
| Setup page shows 3/6 (AI, Email, Scraping fail) | API keys missing or not in build | Test 2.1, 2.2 |
| Login works but dashboard is blank | JavaScript error | Test 7.1 (check Console) |
| API returns 401 | Session expired or cookie issue | Test 3.1 |
| API returns 500 | Missing table or RLS blocking | Test 1.1 |
| Scans fail | Backend not running or URL wrong | Test 5.1 |
| Products don't appear after scan | Backend can't write to Supabase | Test 5.2 |
| Realtime not updating | Replication not enabled on table | Test 8.1 |
| "Cannot read properties of undefined" | API returning unexpected shape | Test 4.1 |

---

## AFTER ALL TESTS PASS

Once every layer is verified:

1. Remove any debug test data from the database
2. Run a real Quick Scan to populate initial products
3. Score the imported products
4. Create a test client and allocate products
5. Verify the full pipeline end-to-end

The platform is ready for production use.
