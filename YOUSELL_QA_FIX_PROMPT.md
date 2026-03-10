# YOUSELL.ONLINE — COMPREHENSIVE QA AUDIT & FIX PROMPT

## FOR USE WITH: Claude Code (Opus) — Paste this ENTIRE prompt at start of session

---

## YOUR ROLE

You are a **Senior Professional Software Tester & Full-Stack Engineer**. Your job is to:
1. Read EVERY source file in this codebase
2. Cross-reference against the original build spec (YOUSELL_OPUS_MASTER_PROMPT_v1)
3. Identify EVERY gap, bug, broken link, dead button, missing feature, and logic error
4. Fix ALL issues in priority order
5. Commit and push working code

You are NOT allowed to skip files, assume things work, or mark anything as "looks fine" without verifying.

---

## MANDATORY FIRST STEP — READ ALL PROJECT FILES

Before writing ANY code, you MUST read these files in full. Do not skim. Do not summarise early.

### Reference Documents (read these FIRST — they define what the system SHOULD be):
```
YOUSELL_OPUS_MASTER_PROMPT_v1 (1).md    — The complete system specification (22 sections)
YouSell_QA_Audit_Report.md              — Previous QA findings (done without network access)
YouSell_QA_Master_Prompt.md             — 215 test cases
```

### ALL Source Code (read EVERY file):
```
# Core config
package.json
next.config.mjs
tailwind.config.js
tsconfig.json
postcss.config.mjs
.env.local.example
netlify.toml
components.json

# Middleware & Auth
src/middleware.ts
src/lib/auth/get-user.ts
src/lib/auth/roles.ts
src/lib/supabase.ts
src/lib/supabase/server.ts
src/lib/supabase/client.ts
src/lib/supabase/admin.ts

# Scoring & Business Logic
src/lib/scoring/composite.ts
src/lib/types/product.ts
src/lib/types/database.ts
src/lib/email.ts

# Provider Layer (data sources)
src/lib/providers/tiktok.ts
src/lib/providers/amazon.ts
src/lib/providers/shopify.ts (and shopify/index.ts)
src/lib/providers/pinterest.ts
src/lib/providers/trends.ts
src/lib/providers/influencers.ts
src/lib/providers/suppliers.ts
src/lib/providers/cache.ts

# Admin Pages (every page.tsx)
src/app/admin/page.tsx              — Dashboard homepage
src/app/admin/layout.tsx            — Admin layout with sidebar
src/app/admin/login/page.tsx        — Login
src/app/admin/scan/page.tsx         — Scan control
src/app/admin/products/page.tsx     — Products list
src/app/admin/clients/page.tsx      — Client management
src/app/admin/allocate/page.tsx     — Product allocation
src/app/admin/influencers/page.tsx  — Influencer intelligence
src/app/admin/suppliers/page.tsx    — (if exists)
src/app/admin/competitors/page.tsx  — (if exists)
src/app/admin/blueprints/page.tsx   — Launch blueprints
src/app/admin/setup/page.tsx        — API health + automation
src/app/admin/settings/page.tsx     — Settings
src/app/admin/notifications/page.tsx — (if exists)
src/app/admin/analytics/page.tsx    — (if exists)
src/app/admin/affiliates/page.tsx   — (if exists)
src/app/admin/trends/page.tsx       — (if exists)
src/app/admin/tiktok/page.tsx       — (if exists)
src/app/admin/amazon/page.tsx       — (if exists)
src/app/admin/unauthorized/page.tsx

# Client Pages
src/app/login/page.tsx
src/app/dashboard/page.tsx
src/app/dashboard/products/page.tsx
src/app/dashboard/requests/page.tsx

# API Routes (every route.ts)
src/app/api/admin/dashboard/route.ts
src/app/api/admin/scan/route.ts
src/app/api/admin/products/route.ts
src/app/api/admin/clients/route.ts
src/app/api/admin/allocations/route.ts
src/app/api/admin/influencers/route.ts
src/app/api/admin/suppliers/route.ts
src/app/api/admin/competitors/route.ts
src/app/api/admin/blueprints/route.ts
src/app/api/admin/blueprints/[id]/pdf/route.ts
src/app/api/admin/automation/route.ts
src/app/api/admin/financial/route.ts
src/app/api/admin/scoring/route.ts
src/app/api/admin/trends/route.ts
src/app/api/admin/tiktok/route.ts
src/app/api/admin/amazon/route.ts
src/app/api/admin/pinterest/route.ts
src/app/api/admin/digital/route.ts
src/app/api/admin/notifications/route.ts
src/app/api/admin/import/route.ts
src/app/api/admin/affiliates/route.ts
src/app/api/auth/callback/route.ts
src/app/api/auth/signout/route.ts

# Components
src/components/admin-sidebar.tsx
src/components/product-card.tsx
src/components/score-badge.tsx
src/components/theme-toggle.tsx
src/components/theme-provider.tsx
src/components/user-context.tsx
src/components/ui/sidebar.tsx       — CHECK for Tailwind v4 syntax in v3 project
src/components/ui/*.tsx             — All shadcn components

# Backend (Railway)
backend/src/worker.ts
backend/src/lib/scoring.ts
backend/src/lib/email.ts
backend/package.json

# Database Migrations
supabase/migrations/*.sql
```

---

## WHAT TO TEST — COMPREHENSIVE CHECKLIST

### PHASE 1: BUILD & DEPLOY HEALTH
- [ ] `npm run build` passes with ZERO errors
- [ ] `npm run lint` passes (warnings OK, errors NOT OK)
- [ ] No `any` TypeScript types anywhere in source
- [ ] All imports resolve (no missing modules)
- [ ] `globals.css` uses `@tailwind base/components/utilities` NOT `@import "tailwindcss"` (v4 syntax breaks v3)
- [ ] `tailwindcss`, `postcss`, `autoprefixer` are in `dependencies` NOT `devDependencies`
- [ ] No Tailwind v4 syntax anywhere: `w-(--var)`, `h-svh`, `size-8!`, `in-data-[...]` — must be v3: `w-[var(--var)]`, `h-screen`, `!size-8`, `data-[...]`

### PHASE 2: AUTHENTICATION & AUTHORIZATION
- [ ] `/admin/login` page renders and allows Supabase email/password login
- [ ] After login, user is redirected to `/admin` (NOT `/admin/unauthorized`)
- [ ] Middleware checks authentication for ALL `/admin/*` routes (except login/unauthorized)
- [ ] `getUser()` uses `@supabase/ssr` `createServerClient` with proper cookie reading (NOT hardcoded cookie names like `sb-access-token`)
- [ ] All API routes under `/api/admin/*` call `requireAdmin()` or `getUser()` and return 401/403 properly
- [ ] Client routes `/dashboard/*` check authentication
- [ ] No env vars or service role keys exposed in client bundle (check all files for `NEXT_PUBLIC_` prefix misuse)
- [ ] Sign out works and redirects to login

### PHASE 3: ADMIN LAYOUT & NAVIGATION
- [ ] Admin sidebar renders with ALL required nav items (see spec Section 14)
- [ ] Sidebar does NOT overlap main content (Tailwind v3 compatible)
- [ ] All sidebar links navigate to correct pages
- [ ] No sidebar links lead to 404 or blank pages
- [ ] Active page is highlighted in sidebar
- [ ] User info (email, role) shows in sidebar footer
- [ ] Sign out button in sidebar works
- [ ] Mobile responsive — sidebar collapses on small screens

### PHASE 4: DASHBOARD HOMEPAGE (`/admin`)
Per spec Section 10, dashboard MUST have these 6 sections:
- [ ] **Pre-Viral / Hot Opportunities strip** — sorted by Early Viral Score desc, shows urgency for 85+
- [ ] **Live Trend Feed** — Supabase Realtime, no page refresh
- [ ] **KPI Cards** — Products Tracked, Active Trends, Competitors, TikTok count, Amazon count
- [ ] **Scan Control Panel** — Quick/Full/Client scan buttons with cost/duration estimates
- [ ] **Scan History Log** — date, mode, duration, products found, cost
- [ ] **System Status** — Supabase, Auth, AI (Claude), Resend, Apify, RapidAPI with connection indicators
- [ ] Dashboard fetches data from `/api/admin/dashboard` successfully
- [ ] All KPI cards show real counts from Supabase (not hardcoded 0)
- [ ] System Status shows correct config status using multi-name env var checks

### PHASE 5: SCAN CONTROL (`/admin/scan`)
- [ ] Three scan modes displayed: Quick, Full, Client
- [ ] Each shows platforms, duration estimate, cost estimate
- [ ] Confirmation dialog appears before starting scan
- [ ] "Start Scan" button calls `/api/admin/scan` POST endpoint
- [ ] API route dispatches to Railway backend (`BACKEND_URL` or `NEXT_PUBLIC_BACKEND_URL`)
- [ ] If backend is unreachable, show clear error message (NOT redirect to login)
- [ ] Progress bar renders during scan
- [ ] Abort/Cancel button works
- [ ] Scan history shows below scan controls
- [ ] Client Scan mode shows client selector dropdown

### PHASE 6: PRODUCTS PAGE (`/admin/products`)
Per spec Section 4, need 7 product discovery tabs:
- [ ] TikTok Products tab/page exists
- [ ] Amazon Products tab/page exists
- [ ] Shopify Products tab/page exists
- [ ] Pinterest Commerce tab/page exists
- [ ] Digital Products tab/page exists
- [ ] AI Affiliates tab/page exists
- [ ] Physical Affiliates tab/page exists
- [ ] Products load from Supabase with pagination
- [ ] Universal Product Card component renders with: image, platform badge, trend stage, score gauge, metrics, action buttons
- [ ] Score badge is colour-coded: HOT (red, 80+), WARM (orange, 60-79), WATCH (yellow, 40-59), COLD (grey, <40)
- [ ] Edit and Delete modals work
- [ ] Empty state shows "No products found" message

### PHASE 7: SCORING ENGINE
Per spec Section 6:
- [ ] `composite.ts` implements: `Final Score = (Trend × 0.40) + (Viral × 0.35) + (Profit × 0.25)`
- [ ] Score tiers: HOT >= 80, WARM >= 60, WATCH >= 40, COLD < 40
- [ ] Early Viral Score uses 6 signals with weights summing to 1.0
- [ ] Profitability engine rejects: margin < 40%, shipping > 30% of price, break-even > 2 months
- [ ] AI insight tiers: Score 60+ → Haiku, Score 75+ → Sonnet ON-DEMAND ONLY (never automatic)
- [ ] Sonnet called automatically = P0 bug — verify this CANNOT happen

### PHASE 8: CLIENT SYSTEM
- [ ] `/admin/clients` page shows client list with CRUD
- [ ] Client creation includes: name, email, plan tier (starter/growth/professional/enterprise)
- [ ] Plan tiers control visibility: starter=3, growth=10, professional=25, enterprise=50 per platform
- [ ] `/admin/allocate` page shows pending product requests
- [ ] Quick-release buttons: Release next 5/10/25
- [ ] `/dashboard` (client-facing) shows ONLY that client's allocated products
- [ ] Clients CANNOT see `/admin` routes
- [ ] `/dashboard/requests` allows clients to request more products

### PHASE 9: INTELLIGENCE ENGINES
- [ ] `/admin/influencers` page renders with scored creators
- [ ] Conversion Score formula implemented per spec Section 8
- [ ] Fake follower filter: exclude if fake_follower_pct > 30%
- [ ] `/admin/suppliers` page renders
- [ ] `/admin/competitors` page renders
- [ ] `/admin/blueprints` page renders with PDF export
- [ ] `/admin/notifications` page renders

### PHASE 10: API ROUTES — VERIFY ALL WORK
For each route, verify:
- [ ] Authentication check (requireAdmin or getUser)
- [ ] Returns proper JSON response
- [ ] Handles errors gracefully (no 500 with stack trace)
- [ ] Does NOT reference hardcoded `sb-access-token` cookies
- [ ] Does NOT use deprecated or wrong env var names
- [ ] `BACKEND_URL` env var is used correctly (should be `NEXT_PUBLIC_BACKEND_URL` for client-side or server env var)

### PHASE 11: ENVIRONMENT VARIABLES
Per spec Section 16, verify .env.local.example has ALL required vars:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_BACKEND_URL
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
APIFY_API_TOKEN
RAPIDAPI_KEY
```
- [ ] No env vars use wrong names (APIFY_TOKEN vs APIFY_API_TOKEN, etc.)
- [ ] Dashboard service check uses multi-name resilient checking
- [ ] BACKEND_URL points to Railway backend (not localhost in production)

### PHASE 12: DATABASE SCHEMA
Per spec Section 15, verify all 22 tables exist:
```
profiles, clients, products, product_metrics, viral_signals,
trend_keywords, influencers, product_influencers, competitor_stores,
suppliers, product_suppliers, financial_models, marketing_strategies,
launch_blueprints, affiliate_programs, product_allocations,
product_requests, automation_jobs, scan_history, outreach_emails,
notifications, imported_files
```
- [ ] Migration files create all tables
- [ ] RLS enabled on every table
- [ ] Admin JWT has full access
- [ ] Client JWT only sees their own data
- [ ] Anon key has no access

### PHASE 13: MISSING PAGES/ROUTES
Check each required route from spec Section 14 exists:
- [ ] `/admin/products/tiktok` or equivalent tab
- [ ] `/admin/products/amazon` or equivalent tab
- [ ] `/admin/products/shopify` or equivalent tab
- [ ] `/admin/products/pinterest` or equivalent tab
- [ ] `/admin/products/digital` or equivalent tab
- [ ] `/admin/products/ai-affiliates` or equivalent tab
- [ ] `/admin/products/physical-affiliates` or equivalent tab
- [ ] `/admin/trends` — Trend Scout page
- [ ] `/admin/setup` — API health + automation toggles + kill switch
- [ ] `/admin/import` — CSV/Excel import
- [ ] All channel-specific pages: `/admin/tiktok`, `/admin/amazon`, `/admin/shopify`, `/admin/pinterest`, `/admin/digital`

### PHASE 14: UI QUALITY
- [ ] No overlapping elements (sidebar overlapping content)
- [ ] Loading states use `<Skeleton>` not spinners or blank
- [ ] Error states are handled (not just console.log)
- [ ] Empty states show helpful messages
- [ ] All buttons have click handlers (no dead buttons)
- [ ] All links go somewhere real (no dead links)
- [ ] Forms validate input before submit
- [ ] Mobile responsive — test at 375px width

---

## FIX PRIORITY ORDER

1. **P0 CRITICAL** — Fix first, deploy immediately:
   - Build errors
   - Auth bypass / redirect loops
   - Broken cookie reading (getUser fails)
   - Sidebar overlap / layout broken
   - Any env var exposed in client bundle

2. **P1 HIGH** — Fix next:
   - Dead buttons / broken navigation
   - API routes returning wrong errors
   - Missing required pages (stub them if needed)
   - Scan flow not working end-to-end

3. **P2 MEDIUM** — Fix after P1:
   - Missing dashboard sections
   - Scoring formula incorrect
   - Client allocation not working
   - Missing intelligence pages

4. **P3 LOW** — Fix last:
   - UI polish
   - Missing empty/loading states
   - Documentation

---

## OUTPUT FORMAT

After completing the audit, produce:

### 1. Status Matrix
For each of the 18 build phases:
| Phase | Status | Issues Found | Fixed? |
|-------|--------|-------------|--------|

### 2. Route Map
| Route | Exists? | Renders? | Data Loads? | All Buttons Work? |
|-------|---------|----------|-------------|-------------------|

### 3. API Route Status
| Route | Auth? | Returns Data? | Errors Handled? |
|-------|-------|---------------|-----------------|

### 4. All Fixes Applied
| File | Line | What Changed | Why |
|------|------|-------------|-----|

---

## CRITICAL RULES

1. **DO NOT touch working backend logic** — Express routes, BullMQ jobs, worker.ts. Only fix if confirmed broken.
2. **Tailwind CSS v3 ONLY** — No v4 syntax. Check sidebar.tsx especially.
3. **Never call Claude Sonnet automatically** — Always on-demand by admin click.
4. **All env vars use EXACT names from spec Section 16.**
5. **Test with `npm run build`** after every batch of changes.
6. **Commit after each completed fix** with descriptive message.
7. **Push to the feature branch, then merge to main for Netlify deploy.**

---

## BEGIN

Start by reading ALL files listed above. Build your status matrix. Then fix everything in priority order. Go.
