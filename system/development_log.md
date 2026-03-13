# PRIMARY OBJECTIVE

Build a scalable commerce intelligence SaaS capable of detecting:

- viral products
- influencers promoting them
- ecommerce stores selling them
- advertising campaigns scaling them

across the following ecosystems:

TikTok  
Amazon  
Shopify  
Facebook / Instagram Ads  

------------------------------------------------------------

# SYSTEM ARCHITECTURE

The platform is composed of several intelligence engines.

These engines must be implemented in the following order.

1. TikTok Discovery Engine
2. Product Extraction Engine
3. Product Clustering Engine
4. Trend Detection Engine
5. Creator Matching Engine
6. Amazon Intelligence Engine
7. Shopify Intelligence Engine
8. Ad Intelligence Engine
9. Opportunity Feed Engine
10. System Health Monitor

------------------------------------------------------------

# CORE DEVELOPMENT RULES

Rule 1  
Always read the following files before starting any development work:

/docs/*  
/system/project_context.md  
/system/system_architecture.md  
/system/database_schema.md  
/system/worker_map.md  
/system/ai_logic.md  
/system/development_log.md  

Rule 2  
Never assume system architecture.

Architecture must always be reconstructed from the system files.

Rule 3  
Never overwrite files without auditing them first.

Rule 4  
All scraping must occur in background workers.

API endpoints must NEVER perform scraping directly.

------------------------------------------------------------

# DATA PIPELINE

All intelligence data flows through this pipeline:

Discovery Workers  
↓  
Scraping Workers  
↓  
Product Extraction  
↓  
Product Clustering  
↓  
Trend Detection  
↓  
Creator Matching  
↓  
Marketplace Matching  
↓  
Ad Intelligence  
↓  
Dashboard Insights  

------------------------------------------------------------

# WORKER SYSTEM

Workers operate asynchronously through Redis queues.

Workers include:

tiktok_discovery_worker  
hashtag_scanner_worker  
creator_monitor_worker  
video_scraper_worker  
product_extractor_worker  
product_clustering_worker  
trend_scoring_worker  
creator_matching_worker  

amazon_product_scanner_worker  
amazon_tiktok_match_worker  

shopify_store_discovery_worker  
shopify_growth_monitor_worker  
shopify_tiktok_match_worker  

tiktok_ads_discovery_worker  
facebook_ads_discovery_worker  
ad_scraper_worker  
ad_scaling_detection_worker  

system_health_monitor_worker  

------------------------------------------------------------

# DATABASE MODEL

Core entities:

products  
product_clusters  
videos  
creators  
shops  
ads  
trend_scores  
creator_product_match  
amazon_products  
shopify_products  

All workers must store results in the database.

The API layer must only read from the database.

------------------------------------------------------------

# DEVELOPMENT SEQUENCE

Development must follow these phases.

Phase 0 – Infrastructure  
environment configuration  
Redis queues  
Supabase connection  

Phase 1 – TikTok Intelligence  
discovery workers  
video scraping  
product extraction  

Phase 2 – Product Intelligence  
product clustering  
trend detection  

Phase 3 – Creator Intelligence  
creator matching  

Phase 4 – Marketplace Intelligence  
Amazon scanner  
Shopify store discovery  

Phase 5 – Ad Intelligence  
TikTok ads discovery  
Facebook ads library  

Phase 6 – API + Dashboard  

------------------------------------------------------------

# AUTONOMOUS RECOVERY PROTOCOL

If the development session is restarted:

1. Scan repository structure
2. Read `/docs`
3. Read `/system`
4. Read `/system/development_log.md`
5. Determine the last completed development step
6. Resume development from that step

Never restart development from the beginning.

------------------------------------------------------------

# REPOSITORY PROTECTION RULES

The following files must never be overwritten without explicit audit:

/docs/*  
/system/*  
/config/*  

The following files must never be committed:

.env  
.env.local  
.env.production  

------------------------------------------------------------

# CODE QUALITY RULES

Before writing code:

1. Inspect existing modules
2. Determine if similar functionality already exists
3. Reuse existing modules where possible

Avoid duplicate implementations.

------------------------------------------------------------

# LOGGING REQUIREMENT

All development actions must be recorded in:

/system/development_log.md

Each entry must include:

- timestamp
- completed task
- files created or modified
- next planned step

Example:

Step 7  
Completed: product clustering worker  
Files created: workers/product_clustering_worker.js  
Next step: trend scoring engine

------------------------------------------------------------

------------------------------------------------------------

# DEVELOPMENT LOG ENTRIES

------------------------------------------------------------

## 2026-03-13 — Provider Directory Consolidation

**Completed:** Standardized `src/lib/providers/` to folder-only structure.

**Problem:** Loose `.ts` files (amazon.ts, pinterest.ts, shopify.ts, tiktok.ts,
influencers.ts, suppliers.ts, trends.ts) coexisted with folder-based providers
(amazon/, pinterest/, etc.), causing duplication and module resolution ambiguity.

**Changes:**
- Merged unique logic from loose files into folder `index.ts` files:
  - `tiktok/index.ts` — added `searchTikTokTrends()` (TikTok Shop trend API)
  - `influencer/index.ts` — added `calculateConversionScore()`,
    `passesFakeFollowerFilter()` (build brief Section 8 scoring)
  - `trends/index.ts` — added batch processing (groups of 5), multi-provider
    support (pytrends/serpapi fallbacks), 24h cache integration
  - `supplier/index.ts` — added CJ Dropshipping provider fallback
- Deleted 7 loose provider files
- Rewrote barrel file (`providers/index.ts`) to export from folder modules only

**Files modified:**
- `src/lib/providers/tiktok/index.ts`
- `src/lib/providers/influencer/index.ts`
- `src/lib/providers/trends/index.ts`
- `src/lib/providers/supplier/index.ts`
- `src/lib/providers/index.ts`

**Files deleted:**
- `src/lib/providers/amazon.ts`
- `src/lib/providers/pinterest.ts`
- `src/lib/providers/shopify.ts`
- `src/lib/providers/tiktok.ts`
- `src/lib/providers/influencers.ts`
- `src/lib/providers/suppliers.ts`
- `src/lib/providers/trends.ts`

**Next step:** Add worker orchestration layer.

------------------------------------------------------------

## 2026-03-13 — Worker Orchestration Layer

**Completed:** Created `backend/src/jobs/` with separated, composable BullMQ jobs.

**Problem:** `backend/src/worker.ts` was a monolithic file handling all scan
logic in a single job processor. As the platform adds influencer discovery,
supplier matching, and enrichment, a single worker becomes unmaintainable.

**Architecture:**
```
backend/src/jobs/
├── types.ts                — Queue names, job data interfaces
├── product-scan.ts         — Platform scraping (TikTok, Amazon, Shopify, Pinterest)
├── enrich-product.ts       — Scoring, DB upsert, HOT product alerts
├── trend-scan.ts           — Trend keyword fetching + storage
├── influencer-discovery.ts — Apify-based influencer search + DB storage
├── supplier-discovery.ts   — Apify Alibaba scraper + DB storage
└── index.ts                — Registers all BullMQ workers
```

**Queues (5):**
- `product-scan` — scrapes platforms, chains → enrich-product + trend-scan
- `enrich-product` — scores products, upserts to DB, sends HOT alerts
- `trend-scan` — fetches trend keywords, stores in trend_keywords table
- `influencer-discovery` — discovers influencers for a niche
- `supplier-discovery` — discovers suppliers for a product

**Job chaining:** product-scan automatically enqueues enrich-product and
trend-scan as downstream jobs.

**Backwards compatibility:** Legacy "scan" queue jobs are forwarded to
the new product-scan queue via a shim worker.

**New API endpoints:**
- `POST /api/trends` — queue a trend scan
- `POST /api/influencers/discover` — queue influencer discovery
- `POST /api/suppliers/discover` — queue supplier discovery

**Files created:**
- `backend/src/jobs/types.ts`
- `backend/src/jobs/product-scan.ts`
- `backend/src/jobs/enrich-product.ts`
- `backend/src/jobs/trend-scan.ts`
- `backend/src/jobs/influencer-discovery.ts`
- `backend/src/jobs/supplier-discovery.ts`
- `backend/src/jobs/index.ts`

**Files modified:**
- `backend/src/worker.ts` — refactored to import jobs layer + legacy shim
- `backend/src/index.ts` — added 3 new API endpoints

**Next step:** Run v7 Master QA.

------------------------------------------------------------

## 2026-03-13 — v7 Master QA (Batches 01–03)

**QA Prompt:** `system/yousell_master_qa_prompt_v7.md`

### Batch 01 — Auth Middleware & Role Enforcement
**Verdict: PASS with 3 fixes applied**

- BUG-V7-001 (Medium): Settings route used inline role check instead of
  `requireAdmin()` — fixed for consistency
- BUG-V7-002 (Medium): Middleware only checked auth, not admin role —
  added profile role check for defense-in-depth
- BUG-V7-003 (Low): Auth callback had open redirect vulnerability via
  `next` param — added validation

### Batch 02 — Admin API Routes: Inline Scraping Check
**Verdict: PASS — 0 findings**

All 24 API routes verified clean. Scan route uses valid proxy pattern
to Express backend (which queues BullMQ jobs). No provider scraping
functions imported in any API route.

### Batch 03 — Database Schema vs v7 Required Tables
**Verdict: CONDITIONAL PASS — 3 findings**

- BUG-V7-004 (High): 8 v7-required tables missing — created migration
  009_v7_new_tables.sql (subscriptions, platform_access, engine_toggles,
  connected_channels, content_queue, orders, usage_tracking, addons +
  client_addons)
- BUG-V7-005 (Low): 3 legacy duplicate tables (scans/scan_history,
  allocations/product_allocations, blueprints/launch_blueprints) —
  noted for future cleanup
- BUG-V7-006 (High): Frontend read from `scan_history`, backend wrote
  to `scans` — aligned frontend to `scans`

**Files modified:**
- `src/app/api/admin/settings/route.ts`
- `src/middleware.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/admin/scan/route.ts`

**Files created:**
- `supabase/migrations/009_v7_new_tables.sql`

**Verified (no changes needed):**
- 22 admin API routes use requireAdmin()
- 2 dashboard routes scope to client data
- RLS enabled on 24 tables with correct policies
- No inline scraping in any API route
- Scoring engine matches v7 formula
- Product indexes on high-query columns

**Next step:** Continue QA Phases 3–8 (business logic, billing, integrations,
frontend, regression).

------------------------------------------------------------

## QA Batches 04-05: Scoring Engine + Financial Modeling (2026-03-13)

**BUG-V7-007 (High):** Composite scoring used legacy 2-pillar formula
(viral×0.6 + profit×0.4). Added trend heuristic and switched to
3-pillar `calculateFinalScore(trend, viral, profit)` with correct
v7 weights (0.40/0.35/0.25).

**BUG-V7-008 (High):** Financial route only had 5 of 8 auto-rejection
rules. Added: IP/trademark risk, retail price <$10, market
oversaturation (100+ competitors).

**Files modified:**
- `src/lib/scoring/composite.ts`
- `src/app/api/admin/financial/route.ts`

------------------------------------------------------------

## QA Batches 08-09: Frontend Admin + Client Dashboard (2026-03-13)

**BUG-V7-010:** `scan_history` table references in admin dashboard
and scan page — changed to `scans` to match backend writer.

**BUG-V7-011:** Client dashboard (`dashboard/page.tsx`) queried
Supabase directly from browser client, violating guardrail #9.
Replaced with `/api/dashboard/products` and `/api/dashboard/requests`
API route calls.

**BUG-V7-012:** Silent `.catch(() => {})` blocks across 6 frontend
pages swallowed errors with no user feedback. Added error state and
visible error banners to all affected pages:
- `admin/page.tsx`, `admin/products/page.tsx`, `admin/trends/page.tsx`
- `dashboard/page.tsx`, `dashboard/products/page.tsx`

**Files modified:**
- `src/app/admin/page.tsx`
- `src/app/admin/scan/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/trends/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/products/page.tsx`

------------------------------------------------------------

## QA Batch 10: Regression Sweep (2026-03-13)

All critical flows verified:
- Scoring formula: 3-pillar (0.40/0.35/0.25) used consistently across
  composite.ts, backend scoring.ts, and scoring API route
- Table names: All code references use `scans` (correct), `product_allocations`
  (correct). Legacy `scan_history` only in migration SQL (dead code).
- Auth: All 22 admin API routes use `requireAdmin()` — zero unprotected.
- Auto-rejection: All 8 rules present in financial route.
- Direct Supabase calls: Only admin dashboard (for Realtime subscriptions,
  acceptable) and login page (for auth, expected). All others use API routes.

**Result: PASS — no regressions found.**

------------------------------------------------------------

## Phase 1 Batch 01 — TikTok Discovery Worker (2026-03-13)

**Module:** TikTok Intelligence — Video Discovery

**Completed:** Created dedicated TikTok discovery pipeline that fetches
trending TikTok videos via Apify, extracts engagement signals (views,
likes, shares, comments), hashtags, creator metadata, and product link
presence, then upserts to `tiktok_videos` table.

**Architecture:**
- New queue: `tiktok-discovery` (concurrency 2)
- Worker fetches videos via Apify `clockworks~tiktok-scraper` (video section)
- Extracts: engagement signals, hashtags, creator info, product URLs
- Upserts to `tiktok_videos` with dedup on `video_id`
- Two new API endpoints:
  - `POST /api/tiktok/discover` — enqueue discovery job
  - `GET /api/tiktok/videos` — query stored videos (filter by query, product link)

**Files created:**
- `backend/src/jobs/tiktok-discovery.ts`
- `supabase/migrations/010_tiktok_videos.sql`

**Files modified:**
- `backend/src/jobs/types.ts` — added TIKTOK_DISCOVERY queue, TikTokDiscoveryJobData, TikTokVideo interfaces
- `backend/src/jobs/index.ts` — registered tiktokDiscoveryWorker
- `backend/src/index.ts` — added 2 TikTok API endpoints

**Next step:** Phase 1 Batch 02 — TikTok video product extraction worker
(parse product signals from discovered videos, generate product candidates)

------------------------------------------------------------

## Phase 1 Batch 02 — TikTok Product Extraction Worker (2026-03-13)

**Module:** TikTok Intelligence — Product Extraction from Videos

**Completed:** Created worker that reads discovered TikTok videos from
`tiktok_videos`, converts high-engagement videos into product candidates
(RawProduct format), and forwards them to `enrich-product` queue for
scoring and DB upsert. Chained automatically from tiktok-discovery.

**Architecture:**
- New queue: `tiktok-product-extract` (concurrency 2)
- Queries videos with `has_product_link=true` OR views >= minViews
- Converts engagement metrics to scoring inputs:
  - likes+shares+comments → sales_count proxy
  - engagement rate → rating proxy (0–5)
  - description/hashtags → product title
- Forwards RawProduct[] to existing enrich-product pipeline
- Discovery worker auto-chains to extraction after storing videos

**Job chain:** `tiktok-discovery → tiktok-product-extract → enrich-product`

**New endpoint:** `POST /api/tiktok/extract-products` (manual trigger)

**Files created:**
- `backend/src/jobs/tiktok-product-extract.ts`

**Files modified:**
- `backend/src/jobs/types.ts` — added TIKTOK_PRODUCT_EXTRACT queue + TikTokProductExtractJobData
- `backend/src/jobs/index.ts` — registered tiktokProductExtractWorker
- `backend/src/jobs/tiktok-discovery.ts` — chains extraction job after video storage
- `backend/src/index.ts` — added extract-products endpoint

**Next step:** Phase 1 Batch 03 — TikTok engagement signal analysis
(hashtag velocity tracking, creator adoption rate, view growth patterns)

------------------------------------------------------------

# FINAL GOAL

Deliver a fully operational commerce intelligence SaaS capable of discovering viral products, influencers, stores and advertising campaigns across multiple ecommerce ecosystems.

The system must operate continuously and autonomously.
Your /system folder should now contain
project_context.md
system_architecture.md
database_schema.md
worker_map.md
ai_logic.md
development_log.md
ai_operating_manual.md
