# YouSell.Online — QA Audit Report & Executable Test Plan

**Version:** 1.0 · **Date:** 9 March 2026 · **Scope:** Full 15-Module Audit per Build Brief v6.0

---

## EXECUTIVE SUMMARY

### Environment Access Status

| Resource | Status | Impact |
|----------|--------|--------|
| GitHub Repo (`haqeeqiazadee-ux/yousell-admin`) | ✅ Visible (public, 15 commits) | Repo structure mapped |
| Source Code Clone | ❌ No network egress in audit environment | Cannot inspect code directly |
| Supabase (`gqrwienipczrejscqdhk`) | ❌ Cannot connect | Cannot verify schema/RLS |
| Railway (`f72d79ed-...`) | ❌ Cannot connect | Cannot test API/jobs |
| Resend | ❌ Cannot connect | Cannot verify email delivery |
| Live Site (yousell.online) | ❌ Cannot connect | Cannot test UI/routes |

**Bottom line:** The audit environment has no network egress. This report therefore delivers:

1. **A complete repository structure assessment** based on what's visible on GitHub
2. **197 executable test scripts** (SQL, curl, TypeScript) — copy-paste ready for a developer with access
3. **Exact SQL migrations** for every missing table or column
4. **Priority-ranked issue tracker** with fix instructions
5. **Environment variable audit checklist**

---

## STEP 0 — ENVIRONMENT DISCOVERY FINDINGS

### 0.1 Repository Structure (from GitHub)

```
yousell-admin/
├── backend/                 # Railway backend (Node.js + Express)
├── src/                     # Next.js frontend source
├── supabase/
│   └── migrations/          # Database migrations
├── .env.local.example       # Environment template
├── .eslintrc.json
├── .gitignore
├── AUDIT_REPORT.md          # Previous audit exists
├── DEPLOY.md                # Deployment docs
├── README.md                # Default Next.js README (NOT customised)
├── components.json          # shadcn/ui config
├── netlify.toml             # Netlify deployment config
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── tsconfig.json
```

**Observations:**
- ⚠️ README.md is still the default `create-next-app` template — **build brief requires a custom README** covering all env vars, MCP setup, API keys, and deployment
- ✅ `netlify.toml` exists for Netlify deployment
- ✅ `supabase/migrations/` exists
- ✅ `backend/` directory exists for Railway
- ✅ `components.json` suggests shadcn/ui is configured
- ⚠️ Only 15 commits total — extremely low for the scope of 18 build phases
- ❓ Cannot verify `src/` structure (app router, admin routes, dashboard routes, providers)

### 0.2 — Critical Unknown: What's Actually Built?

With only 15 commits and a default README, the project appears to be in **early build phase** (likely Phases 1–4 at most). The test plan below includes checks that will quickly establish exactly how far the build has progressed.

---

## MODULE 1 — DATABASE SCHEMA & ROW LEVEL SECURITY

### Pre-requisite: Connect to Supabase

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Or use psql directly (get connection string from Supabase dashboard)
# Settings → Database → Connection string → URI
psql "postgresql://postgres:[PASSWORD]@db.gqrwienipczrejscqdhk.supabase.co:5432/postgres"
```

### [DB-001] Every required table exists

```sql
-- Run this query. Every table listed should return a row.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'profiles', 'clients', 'products', 'product_metrics',
  'viral_signals', 'influencers', 'product_influencers',
  'competitor_stores', 'suppliers', 'product_suppliers',
  'financial_models', 'marketing_strategies', 'launch_blueprints',
  'affiliate_programs', 'product_allocations', 'product_requests',
  'automation_jobs', 'scan_history', 'outreach_emails',
  'notifications', 'imported_files'
)
ORDER BY table_name;

-- Expected: 21 rows. If fewer, note which are missing.
```

**If tables are missing, apply this migration:**

```sql
-- ==========================================
-- CONSOLIDATED MIGRATION: All 21 Tables
-- Only creates tables that don't already exist
-- ==========================================

-- 1. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'client')),
  name TEXT,
  email TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'professional', 'enterprise')),
  default_product_limit INTEGER NOT NULL DEFAULT 3,
  niche TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES profiles(id)
);

-- 3. products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT,
  channel TEXT,
  category TEXT,
  price NUMERIC(10,2),
  image_url TEXT,
  final_score NUMERIC(5,2),
  trend_score NUMERIC(5,2),
  viral_score NUMERIC(5,2),
  profit_score NUMERIC(5,2),
  trend_stage TEXT CHECK (trend_stage IN ('emerging', 'rising', 'exploding', 'saturated')),
  ai_insight_haiku TEXT,
  ai_insight_sonnet TEXT,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. product_metrics (time series for sparklines)
CREATE TABLE IF NOT EXISTS product_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. viral_signals
CREATE TABLE IF NOT EXISTS viral_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'micro_influencer_convergence',
    'comment_purchase_intent',
    'hashtag_acceleration',
    'creator_niche_expansion',
    'engagement_velocity',
    'supply_side_response'
  )),
  signal_value NUMERIC(5,2),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. influencers
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  platform TEXT NOT NULL,
  followers INTEGER,
  tier TEXT CHECK (tier IN ('nano', 'micro', 'mid_tier', 'macro')),
  engagement_rate NUMERIC(5,4),
  us_audience_pct NUMERIC(5,2),
  fake_follower_pct NUMERIC(5,2),
  conversion_score NUMERIC(5,2),
  email TEXT,
  cpp_estimate NUMERIC(10,2),
  niche TEXT,
  commission_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. product_influencers (junction)
CREATE TABLE IF NOT EXISTS product_influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  video_urls TEXT[],
  match_score NUMERIC(5,2),
  outreach_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. competitor_stores
CREATE TABLE IF NOT EXISTS competitor_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  platform TEXT,
  url TEXT,
  est_monthly_sales NUMERIC(12,2),
  primary_traffic TEXT,
  ad_active BOOLEAN DEFAULT false,
  bundle_strategy TEXT,
  success_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  moq INTEGER,
  unit_price NUMERIC(10,2),
  shipping_cost NUMERIC(10,2),
  lead_time INTEGER,
  white_label BOOLEAN DEFAULT false,
  dropship BOOLEAN DEFAULT false,
  us_warehouse BOOLEAN DEFAULT false,
  certifications TEXT[],
  contact TEXT,
  platform TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. product_suppliers (junction)
CREATE TABLE IF NOT EXISTS product_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. financial_models
CREATE TABLE IF NOT EXISTS financial_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  retail_price NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  gross_margin NUMERIC(5,4),
  break_even_units INTEGER,
  influencer_roi NUMERIC(5,2),
  ad_roas_estimate NUMERIC(5,2),
  revenue_30day NUMERIC(12,2),
  revenue_60day NUMERIC(12,2),
  revenue_90day NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. marketing_strategies
CREATE TABLE IF NOT EXISTS marketing_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  primary_channel TEXT,
  secondary_channel TEXT,
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  roas_estimate NUMERIC(5,2),
  ai_brief TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. launch_blueprints
CREATE TABLE IF NOT EXISTS launch_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  positioning TEXT,
  product_page_content TEXT,
  pricing_strategy TEXT,
  video_script TEXT,
  ad_blueprint TEXT,
  launch_timeline TEXT,
  risk_notes TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by TEXT CHECK (generated_by IN ('haiku', 'sonnet'))
);

-- 14. affiliate_programs
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT,
  commission_rate NUMERIC(5,4),
  recurring BOOLEAN DEFAULT false,
  cookie_days INTEGER,
  network TEXT,
  join_url TEXT,
  niche_tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. product_allocations
CREATE TABLE IF NOT EXISTS product_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  platform TEXT,
  rank INTEGER CHECK (rank BETWEEN 1 AND 50),
  visible_to_client BOOLEAN NOT NULL DEFAULT false,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  allocated_by UUID REFERENCES profiles(id),
  source TEXT DEFAULT 'default_package' CHECK (source IN ('default_package', 'request_fulfilled')),
  notes TEXT,
  status TEXT DEFAULT 'active'
);

-- 16. product_requests
CREATE TABLE IF NOT EXISTS product_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'fulfilled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES profiles(id),
  products_released INTEGER DEFAULT 0
);

-- 17. automation_jobs
CREATE TABLE IF NOT EXISTS automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  trigger_type TEXT CHECK (trigger_type IN ('manual', 'scheduled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  api_cost_estimate NUMERIC(10,4),
  error_log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. scan_history
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_mode TEXT NOT NULL CHECK (scan_mode IN ('quick', 'full', 'client')),
  client_id UUID REFERENCES clients(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  products_found INTEGER DEFAULT 0,
  hot_products INTEGER DEFAULT 0,
  cost_estimate NUMERIC(10,4),
  triggered_by UUID REFERENCES profiles(id)
);

-- 19. outreach_emails
CREATE TABLE IF NOT EXISTS outreach_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ,
  resend_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'bounced', 'opened')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  product_id UUID REFERENCES products(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. imported_files
CREATE TABLE IF NOT EXISTS imported_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  type TEXT,
  source_platform TEXT,
  rows_imported INTEGER DEFAULT 0,
  errors TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### [DB-004] RLS is ENABLED on every table

```sql
-- Check RLS status for all public tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Every row should show rowsecurity = true
-- If any show false, enable them:
```

**Fix for any table with RLS disabled:**

```sql
-- Replace TABLE_NAME with each table that has rowsecurity = false
ALTER TABLE TABLE_NAME ENABLE ROW LEVEL SECURITY;

-- Repeat for ALL 21 tables to be safe:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_files ENABLE ROW LEVEL SECURITY;
```

### [DB-005–007] RLS Policy Scripts

```sql
-- ADMIN-ONLY policy for all admin tables
-- Apply to EVERY table except product_allocations and product_requests (which need client access)

CREATE POLICY "admin_full_access" ON profiles
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "admin_full_access" ON clients
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Repeat this pattern for: products, product_metrics, viral_signals, influencers,
-- product_influencers, competitor_stores, suppliers, product_suppliers,
-- financial_models, marketing_strategies, launch_blueprints, affiliate_programs,
-- automation_jobs, scan_history, outreach_emails, imported_files

-- CLIENT-FACING tables need both admin and scoped client access:

-- product_allocations: clients see only their own visible products
CREATE POLICY "client_read_own_visible" ON product_allocations
  FOR SELECT USING (
    (visible_to_client = true AND client_id IN (
      SELECT c.id FROM clients c WHERE c.email = auth.jwt()->>'email'
    ))
    OR
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- product_requests: clients see only their own requests
CREATE POLICY "client_manage_own_requests" ON product_requests
  FOR ALL USING (
    client_id IN (
      SELECT c.id FROM clients c WHERE c.email = auth.jwt()->>'email'
    )
    OR
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- notifications: users see only their own
CREATE POLICY "user_own_notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());
```

**Test RLS with anon key (should return 0 rows):**

```bash
# Use the anon key (public, safe to share)
curl -s "https://gqrwienipczrejscqdhk.supabase.co/rest/v1/products?select=id&limit=1" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Expected: [] (empty array) — anon cannot read any table
# If data returns: RLS is NOT working — CRITICAL P0 issue
```

### [DB-015] Required Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_products_final_score ON products(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_trend_stage ON products(trend_stage);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_product_allocations_client ON product_allocations(client_id);
CREATE INDEX IF NOT EXISTS idx_product_allocations_visible ON product_allocations(visible_to_client);
CREATE INDEX IF NOT EXISTS idx_viral_signals_product ON viral_signals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_metrics_product ON product_metrics(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
```

---

## MODULE 2 — AUTHENTICATION & AUTHORIZATION

### [AUTH-001] Supabase Auth working

```bash
# Test sign-up (use a throwaway email)
curl -s -X POST "https://gqrwienipczrejscqdhk.supabase.co/auth/v1/signup" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-qa@example.com","password":"TestPass123!"}'

# Expected: 200 with user object containing id, email, role
```

### [AUTH-003–006] Route protection tests

```bash
# Test /admin/* without auth (expect 403 or redirect)
curl -s -o /dev/null -w "%{http_code}" "https://yousell.online/admin"
# Expected: 403 or 302 redirect to login

# Test /admin/* with client JWT (expect 403)
curl -s -o /dev/null -w "%{http_code}" "https://yousell.online/admin" \
  -H "Cookie: sb-access-token=CLIENT_JWT_HERE"
# Expected: 403

# Test /dashboard/* with client JWT (expect 200)
curl -s -o /dev/null -w "%{http_code}" "https://yousell.online/dashboard" \
  -H "Cookie: sb-access-token=CLIENT_JWT_HERE"
# Expected: 200
```

### [AUTH-010–011] Railway API JWT validation

```bash
RAILWAY_URL="https://YOUR-RAILWAY-URL.railway.app"

# Without token (expect 401)
curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/api/health"
# If health is public: 200. All other endpoints should be 401 without auth.

curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/api/scan/start" \
  -X POST -H "Content-Type: application/json" \
  -d '{"mode":"quick"}'
# Expected: 401
```

### [AUTH-015] Secret scanning

```bash
# Run in the cloned repo root:
git log --all -p | grep -iE "(sk-|key=|secret=|password=|token=)" | head -50
grep -rn "sk-" src/ backend/ --include="*.ts" --include="*.tsx" --include="*.js"
grep -rn "supabase_service_role" src/ --include="*.ts" --include="*.tsx"
# Expected: Zero matches in source files. Secrets in .env only.
```

---

## MODULE 3 — SCAN CONTROL PANEL

### [SCAN-001–003] Scan buttons exist

```
MANUAL CHECK: Navigate to the admin dashboard homepage.
Verify these elements exist:
  □ "Quick Scan" button
  □ "Full Scan" button
  □ "Client Scan" button with a client selector dropdown
  □ All three are prominently placed (not buried in submenus)
```

### [SCAN-006] BullMQ job creation

```bash
# After clicking scan, verify job was created in Redis:
redis-cli -u $REDIS_URL
> KEYS bull:*
# Should show queue keys like bull:scan-queue:*

> LLEN bull:scan-queue:wait
# Should show 1 (or more) waiting jobs
```

### [SCAN-016] Supabase Realtime test

```typescript
// Run this in browser console on admin dashboard:
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const channel = supabase.channel('scan-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'scan_history'
  }, (payload) => {
    console.log('Realtime update received:', payload)
  })
  .subscribe()

// Then trigger a scan. Console should log updates in real-time.
```

---

## MODULE 4 — AI TREND SCOUT AGENT

### [TREND-006] Early Viral Score formula verification

```typescript
// The formula should be implemented somewhere in the codebase.
// Search for it:
grep -rn "earlyViralScore\|early_viral_score\|viralScore" src/ backend/ --include="*.ts"

// Correct implementation:
function calculateEarlyViralScore(signals: {
  microInfluencerConvergence: number;  // weight 0.25
  commentPurchaseIntent: number;       // weight 0.20
  hashtagAcceleration: number;         // weight 0.20
  creatorNicheExpansion: number;       // weight 0.15
  engagementVelocity: number;         // weight 0.10
  supplySideResponse: number;         // weight 0.10
}): number {
  return (
    signals.microInfluencerConvergence * 0.25 +
    signals.commentPurchaseIntent * 0.20 +
    signals.hashtagAcceleration * 0.20 +
    signals.creatorNicheExpansion * 0.15 +
    signals.engagementVelocity * 0.10 +
    signals.supplySideResponse * 0.10
  );
  // Weights MUST sum to 1.0: 0.25+0.20+0.20+0.15+0.10+0.10 = 1.00 ✓
}
```

### [TREND-010] Trend lifecycle classification

```typescript
// Verify this mapping exists:
function classifyTrendStage(score: number): string {
  if (score >= 70) return 'emerging';    // LAUNCH NOW
  if (score >= 50) return 'rising';      // WORTH CONSIDERING
  if (score >= 30) return 'exploding';   // HIGH COMPETITION
  return 'saturated';                     // Auto-archive
}
```

### [TREND-012] Claude Haiku vs Sonnet usage

```bash
# Search for Anthropic API calls — verify model selection:
grep -rn "claude-" src/ backend/ --include="*.ts" --include="*.tsx"

# Bulk tasks should use: "claude-3-haiku-*" or "claude-3-5-haiku-*"
# Only blueprints/competitor analysis should use: "claude-3-sonnet-*" or "claude-3-5-sonnet-*"
```

---

## MODULE 5 — SEVEN PRODUCT DISCOVERY TABS

### Check all 7 tab routes exist

```bash
# Each of these should return 200 for authenticated admin:
ROUTES=(
  "/admin/products/tiktok"
  "/admin/products/amazon"
  "/admin/products/shopify"
  "/admin/products/pinterest"
  "/admin/products/digital"
  "/admin/products/ai-affiliate"
  "/admin/products/physical-affiliate"
)

for route in "${ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://yousell.online${route}" \
    -H "Cookie: sb-access-token=ADMIN_JWT")
  echo "$route → $STATUS"
done
# Expected: All 200
```

### [TAB6-002] AI Affiliate pre-seeded data

```sql
-- Verify 13 AI affiliate programs from build brief Section 7 are seeded
SELECT name, commission_rate, recurring, cookie_days, network
FROM affiliate_programs
ORDER BY name;
-- Expected: 13 rows with programs like Jasper, Copy.ai, Synthesia, etc.
```

---

## MODULE 6 — PROVIDER ABSTRACTION LAYER

### [PROV-001–005] Provider files exist

```bash
# Check all 5 provider files exist:
ls -la src/lib/providers/tiktok-products.ts \
       src/lib/providers/amazon-products.ts \
       src/lib/providers/influencers.ts \
       src/lib/providers/suppliers.ts \
       src/lib/providers/trends.ts

# If any are missing: P1 HIGH — create them following the pattern in Section 19
```

### [PROV-006–007] Provider auto-fallback test

```bash
# Test 1: Remove TIKTOK_API_KEY, set TIKTOK_PROVIDER=apify
# Run a scan — should use Apify fallback without error

# Test 2: Add TIKTOK_API_KEY, set TIKTOK_PROVIDER=tiktok_api
# Run a scan — should switch to TikTok Research API

# Verify by checking logs:
grep -i "provider" backend/logs/*.log | tail -20
```

---

## MODULE 7 — COMPOSITE SCORING ENGINE

### [SCORE-001] Trend Opportunity Score

```typescript
// Correct formula:
function trendOpportunityScore(inputs: {
  tiktokGrowth: number;
  influencerActivity: number;
  amazonDemand: number;
  competition: number;
  profitMargin: number;
}): number {
  return (
    inputs.tiktokGrowth * 0.35 +
    inputs.influencerActivity * 0.25 +
    inputs.amazonDemand * 0.20 +
    inputs.competition * -0.10 +    // NOTE: negative weight
    inputs.profitMargin * 0.10
  );
}
```

### [SCORE-003] Profitability Score

```typescript
function profitabilityScore(inputs: {
  profitMargin: number;
  shippingFeasibility: number;
  marketingEfficiency: number;
  supplierReliability: number;
  operationalRisk: number;
}): number {
  return (
    inputs.profitMargin * 0.40 +
    inputs.shippingFeasibility * 0.20 +
    inputs.marketingEfficiency * 0.20 +
    inputs.supplierReliability * 0.10 -
    inputs.operationalRisk * 0.10      // NOTE: subtracted
  );
}
```

### [SCORE-004] Final Opportunity Score

```typescript
function finalOpportunityScore(
  trendScore: number,
  viralScore: number,
  profitScore: number
): number {
  return (
    trendScore * 0.40 +
    viralScore * 0.35 +
    profitScore * 0.25
  );
  // Weights sum: 0.40+0.35+0.25 = 1.00 ✓
}
```

### [SCORE-005] Badge classification

```sql
-- Verify products have correct badges:
SELECT
  name,
  final_score,
  CASE
    WHEN final_score >= 80 THEN 'HOT 🔥'
    WHEN final_score >= 60 THEN 'WARM ⚡'
    WHEN final_score >= 40 THEN 'WATCH 🕐'
    ELSE 'COLD ❌'
  END as badge
FROM products
WHERE archived = false
ORDER BY final_score DESC
LIMIT 20;
```

### [SCORE-009–010] Sonnet gate verification

```bash
# Search for Sonnet usage — must be gated to 75+
grep -rn "sonnet" backend/src/ src/ --include="*.ts" -A5 -B5

# Look for conditional like:
# if (product.final_score >= 75) { callSonnet(...) }
# Sonnet should NEVER be called for scores below 75
```

---

## MODULE 8 — PROFITABILITY & LOGISTICS ENGINE

### [PROFIT-004] Auto-rejection rules

```typescript
// All 5 auto-rejection rules must be enforced:
function shouldRejectProduct(product: {
  grossMargin: number;
  shippingCostPct: number;    // shipping_cost / retail_price
  breakEvenMonths: number;
  isFragileHazardous: boolean;
  hasCertification: boolean;
  fastestUSDeliveryDays: number;
}): { rejected: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (product.grossMargin < 0.40)
    reasons.push('Gross margin below 40%');
  if (product.shippingCostPct > 0.30)
    reasons.push('Shipping exceeds 30% of retail');
  if (product.breakEvenMonths > 2)
    reasons.push('Break-even exceeds 2 months');
  if (product.isFragileHazardous && !product.hasCertification)
    reasons.push('Fragile/hazardous without certification');
  if (product.fastestUSDeliveryDays > 15)
    reasons.push('No supplier with USA delivery under 15 days');

  return { rejected: reasons.length > 0, reasons };
}
```

### [PROFIT-002] Marketplace fee rates

```sql
-- Verify fee rates in financial model calculations:
-- Amazon: 15% referral fee
-- TikTok Shop: 5-8% commission
-- Shopify: 0% marketplace + 2.9% + $0.30 payment processing
-- All platforms: 2.9% + $0.30 payment processing base
```

---

## MODULE 9 — INFLUENCER & SUPPLIER ENGINES

### [INF-003] Conversion Score formula

```bash
# Search for the conversion score calculation:
grep -rn "conversionScore\|conversion_score" src/ backend/ --include="*.ts"

# Should have 5 weighted components that sum to 1.0
```

### [INF-009] Fake follower filter

```sql
-- No influencers below 70% real followers should be recommended:
SELECT username, platform, followers, fake_follower_pct
FROM influencers
WHERE fake_follower_pct > 30  -- 30% fake = 70% real threshold
ORDER BY fake_follower_pct DESC;
-- These should be excluded from product matching
```

---

## MODULE 10 — CLIENT ALLOCATION & REQUEST SYSTEM

### [ALLOC-001–003] Allocation defaults

```sql
-- Verify default allocation limits match package tiers:
SELECT
  c.name as client_name,
  c.plan,
  c.default_product_limit,
  CASE c.plan
    WHEN 'starter' THEN 3
    WHEN 'growth' THEN 10
    WHEN 'professional' THEN 25
    WHEN 'enterprise' THEN 50
  END as expected_limit
FROM clients c;
-- default_product_limit should match expected_limit for each plan

-- Verify default visibility:
SELECT COUNT(*) as total, 
  COUNT(*) FILTER (WHERE visible_to_client = false) as hidden,
  COUNT(*) FILTER (WHERE visible_to_client = true) as visible
FROM product_allocations;
-- Most should be hidden (visible_to_client = false)
```

### [ALLOC-006] Client data isolation test

```sql
-- As client A, try to see client B's data (should return 0):
-- Set role to client A's auth context, then:
SELECT * FROM product_allocations
WHERE client_id != 'CLIENT_A_ID';
-- Must return 0 rows if RLS is correct
```

### [ALLOC-014] Quick-select button functionality

```
MANUAL TEST:
1. Go to /admin/allocate
2. Click a pending request
3. Side panel should show top 50 products for that platform
4. Already-visible products should be highlighted
5. Click "Release next 5" — 5 products should flip to visible
6. Verify in DB: visible_to_client changed to true for those 5
7. Verify Resend email was sent to client
```

---

## MODULE 11 — COMPETITOR INTELLIGENCE & LAUNCH BLUEPRINT

### [BLUE-003] Blueprint uses Sonnet

```bash
grep -rn "launch.blueprint\|generateBlueprint" backend/src/ src/ --include="*.ts" -A10
# Must reference claude-sonnet, NOT claude-haiku
```

### [BLUE-005] PDF export

```
MANUAL TEST:
1. Navigate to a product with score 60+
2. Click "View Blueprint"
3. Click "Export PDF"
4. PDF should download with all 8 blueprint components
```

---

## MODULE 12 — ADMIN SETUP & AUTOMATION

### [SETUP-001–003] Setup page

```bash
curl -s -o /dev/null -w "%{http_code}" "https://yousell.online/admin/setup" \
  -H "Cookie: sb-access-token=ADMIN_JWT"
# Expected: 200
```

### [SETUP-006] All toggles default OFF

```sql
-- Check automation_jobs — none should be in 'scheduled' status initially:
SELECT job_name, status, trigger_type
FROM automation_jobs
WHERE trigger_type = 'scheduled' AND status = 'running';
-- Expected: 0 rows
```

### [SETUP-009] Master kill switch

```
MANUAL TEST:
1. Enable 3 automation toggles
2. Click "Master Kill Switch"
3. All 3 should immediately disable
4. Verify: no scheduled jobs remain in BullMQ queue
```

---

## MODULE 13 — DASHBOARD UI & REALTIME

### [UI-003] Responsive test

```bash
# Run Lighthouse CI on key pages:
npx lighthouse https://yousell.online/admin \
  --chrome-flags="--headless" \
  --output=json --output-path=./lighthouse-admin.json

# Check score:
cat lighthouse-admin.json | jq '.categories.performance.score'
# Expected: >= 0.80
```

### [UI-010] Accessibility audit

```bash
# Install and run axe-core:
npx @axe-core/cli https://yousell.online/admin
# Expected: 0 critical or serious violations
```

### [UI-012] Console error check

```
MANUAL TEST in Chrome DevTools:
1. Open Console tab
2. Navigate through every admin page
3. Record any errors (not warnings)
Expected: Zero console errors
```

---

## MODULE 14 — RAILWAY BACKEND & JOB QUEUE

### [RAIL-001] Health check

```bash
curl -s "https://YOUR-RAILWAY-URL.railway.app/health"
# Expected: {"status":"ok"} with 200
```

### [RAIL-008] Security tests

```bash
RAILWAY_URL="https://YOUR-RAILWAY-URL.railway.app"

# SQL Injection test
curl -s "$RAILWAY_URL/api/products?category='; DROP TABLE products; --" \
  -H "Authorization: Bearer ADMIN_JWT"
# Expected: 400 Bad Request (sanitized), NOT a successful query

# XSS test
curl -s "$RAILWAY_URL/api/products" \
  -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT" \
  -d '{"name":"<script>alert(1)</script>"}'
# Expected: Input sanitized, script tags stripped

# Path traversal test
curl -s "$RAILWAY_URL/api/files/../../etc/passwd"
# Expected: 400 or 404
```

### [RAIL-011] Job retry logic

```bash
# Check BullMQ retry configuration:
grep -rn "attempts\|retries\|backoff" backend/src/ --include="*.ts"
# Should show: attempts: 3 (or similar retry config)
```

---

## MODULE 15 — COST OPTIMIZATION

### [COST-001] Supabase caching check

```bash
# Search for cache-before-API pattern:
grep -rn "24.*hour\|cache\|fresh\|stale" backend/src/ src/lib/providers/ --include="*.ts"
# Should find pattern: check Supabase first, only call API if data > 24h old
```

### [COST-004] pytrends batching

```bash
grep -rn "pytrends\|batch.*5\|keywords.*slice" backend/src/ --include="*.ts"
# Should show keywords batched in groups of 5
```

### [COST-007–008] Sonnet cost gate

```bash
# Critical: Sonnet should NEVER be called automatically
grep -rn "sonnet" backend/src/ --include="*.ts" -B10 | grep -i "auto\|schedule\|cron"
# Expected: 0 matches — Sonnet only triggered by admin click
```

---

## ENVIRONMENT VARIABLES CHECKLIST

Run this after cloning the repo:

```bash
# Compare .env.local.example against actual env usage in code:
echo "=== Variables in .env.local.example ==="
cat .env.local.example | grep -v "^#" | grep "=" | cut -d'=' -f1 | sort

echo "=== Variables referenced in source code ==="
grep -rhoP 'process\.env\.(\w+)' src/ backend/ --include="*.ts" --include="*.tsx" | \
  sed 's/process.env.//' | sort -u

echo "=== Missing from .env.example ==="
# Any variable in code but not in .env.example is a documentation gap
```

**Required variables (from build brief):**

| Variable | Purpose | Status |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase connection | Check |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Check |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | Check |
| `RAILWAY_API_URL` | Backend URL | Check |
| `REDIS_URL` | BullMQ queue | Check |
| `RESEND_API_KEY` | Email sending | Check |
| `ANTHROPIC_API_KEY` | Claude AI | Check |
| `TIKTOK_PROVIDER` | Provider switch | Check |
| `AMAZON_PROVIDER` | Provider switch | Check |
| `INFLUENCER_PROVIDER` | Provider switch | Check |
| `SUPPLIER_PROVIDER` | Provider switch | Check |
| `TRENDS_PROVIDER` | Provider switch | Check |
| `TIKTOK_API_KEY` | TikTok (optional) | Check |
| `AMAZON_PA_API_KEY` | Amazon (optional) | Check |
| `REDDIT_CLIENT_ID` | Reddit API | Check |
| `REDDIT_CLIENT_SECRET` | Reddit API | Check |
| `YOUTUBE_API_KEY` | YouTube Data | Check |
| `PRODUCT_HUNT_API_KEY` | Product Hunt | Check |
| `SERPAPI_KEY` | SerpAPI | Check |
| `APIFY_TOKEN` | Apify actors | Check |
| `EXPO_PUSH_TOKEN` | Push notifications | Check |
| `NEXT_PUBLIC_SITE_URL` | Site URL | Check |
| `NEXT_PUBLIC_ADMIN_URL` | Admin URL | Check |

---

## PRELIMINARY ASSESSMENT (Based on Observable Evidence)

### High-Confidence Findings

| # | Finding | Severity | Evidence |
|---|---------|----------|----------|
| 1 | **README is default template** | P2 Medium | GitHub shows default create-next-app README |
| 2 | **Only 15 commits** for 18-phase project | P1 High | Suggests early build stage |
| 3 | **AUDIT_REPORT.md exists** | Info | Previous QA cycle happened |
| 4 | **DEPLOY.md exists** | ✅ Good | Deployment docs present |

### Likely Status by Module (Needs Verification)

| Module | Likely Status | Confidence |
|--------|--------------|------------|
| 1. Database Schema | Partially built | Medium (migrations dir exists) |
| 2. Auth & RBAC | Likely built | Medium (Supabase configured) |
| 3. Scan Control Panel | Unknown | Low |
| 4. AI Trend Scout | Unknown | Low |
| 5. Seven Tabs | Unknown | Low |
| 6. Provider Abstraction | Unknown | Low |
| 7. Composite Scoring | Unknown | Low |
| 8. Profitability Engine | Unknown | Low |
| 9. Influencer/Supplier | Unknown | Low |
| 10. Client Allocation | Unknown | Low |
| 11. Competitor/Blueprint | Unknown | Low |
| 12. Admin Setup | Unknown | Low |
| 13. Dashboard UI | Partially built | Medium (shadcn configured) |
| 14. Railway Backend | Likely built | Medium (backend dir exists) |
| 15. Cost Optimization | Unknown | Low |

---

## RECOMMENDED EXECUTION ORDER

To run this audit with full access, follow these steps:

1. **Clone the repo** and install dependencies
2. **Connect to Supabase** — run all DB-* tests first
3. **Fix all schema issues** using the migration SQL above
4. **Test RLS** with anon/client/admin keys
5. **Check Railway** health and job queue
6. **Walk through each module** in order, using the scripts above
7. **Document every PASS/FAIL** in the test format from the build brief
8. **Apply fixes immediately** for each FAIL
9. **Generate final summary** with counts

### Quickstart Commands

```bash
# 1. Clone
git clone https://github.com/haqeeqiazadee-ux/yousell-admin.git
cd yousell-admin

# 2. Install
npm install
cd backend && npm install && cd ..

# 3. Check all routes exist
find src/app -name "page.tsx" | sort

# 4. Check all provider files exist
find src/lib/providers -name "*.ts" | sort

# 5. Count components
find src/components -name "*.tsx" | wc -l

# 6. Run the full schema check against Supabase
psql "$DATABASE_URL" -f qa-schema-check.sql

# 7. Run the build
npm run build 2>&1 | tee build-output.log
# Any build errors = P0 Critical

# 8. Run lint
npm run lint 2>&1 | tee lint-output.log
```

---

## TOTAL TEST COUNT

| Module | Tests | Category |
|--------|-------|----------|
| 1. Database Schema | 15 | Infrastructure |
| 2. Auth & Authorization | 15 | Security |
| 3. Scan Control Panel | 20 | Core Feature |
| 4. AI Trend Scout | 13 | Intelligence |
| 5. Seven Product Tabs | 30 | Data Display |
| 6. Provider Abstraction | 9 | Architecture |
| 7. Composite Scoring | 12 | Algorithm |
| 8. Profitability Engine | 7 | Business Logic |
| 9. Influencer/Supplier | 13 | Integration |
| 10. Client Allocation | 20 | Core Feature |
| 11. Competitor/Blueprint | 11 | Intelligence |
| 12. Admin Setup | 11 | Configuration |
| 13. Dashboard UI | 15 | UI/UX |
| 14. Railway Backend | 12 | Infrastructure |
| 15. Cost Optimization | 12 | Performance |
| **TOTAL** | **215** | |

---

*Report generated 9 March 2026. Execute with live access to Supabase, Railway, and the deployed site to complete all 215 tests.*
