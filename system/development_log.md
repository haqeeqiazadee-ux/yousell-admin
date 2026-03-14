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

## Phase 1 Batch 03 — TikTok Engagement Signal Analysis (2026-03-13)

**Module:** TikTok Intelligence — Hashtag Velocity & Engagement Tracking

**Completed:** Created engagement analysis worker that aggregates per-hashtag
metrics from discovered videos, computes velocity signals (video growth rate,
view velocity per hour, creator adoption rate, engagement rate, product video
percentage), and stores time-series snapshots in `tiktok_hashtag_signals`.

**v7 spec coverage:** "hashtag growth velocity, video creation rate, comment
sentiment, creator count" (Section 29.2)

**Architecture:**
- New queue: `tiktok-engagement-analysis` (concurrency 1)
- Aggregates hashtag metrics from tiktok_videos (in-memory, up to 2000 videos)
- Computes velocity by comparing with previous snapshot (time-series)
- Key metrics: video_growth_rate, view_velocity, creator_growth_rate,
  engagement_rate, product_video_pct
- Two new API endpoints:
  - `POST /api/tiktok/engagement-analysis` — trigger analysis job
  - `GET /api/tiktok/hashtag-signals` — query stored signals (sort by velocity)

**Files created:**
- `backend/src/jobs/tiktok-engagement-analysis.ts`
- `supabase/migrations/011_tiktok_hashtag_signals.sql`

**Files modified:**
- `backend/src/jobs/types.ts` — added TIKTOK_ENGAGEMENT_ANALYSIS queue + job data
- `backend/src/jobs/index.ts` — registered tiktokEngagementWorker
- `backend/src/index.ts` — added 2 engagement analysis endpoints

**Phase 1 status:** 3 of 5 batches complete
- [x] Batch 01 — TikTok discovery worker
- [x] Batch 02 — Product extraction from videos
- [x] Batch 03 — Engagement signal analysis
- [ ] Batch 04 — Product candidate generation (cross-platform matching)
- [ ] Batch 05 — Phase 1 integration + admin UI

**Next step:** Phase 1 Batch 04 — Product candidate generation
(cross-reference TikTok products with Amazon/Shopify for demand validation)

------------------------------------------------------------

## Phase 1 Batch 04 — Cross-Platform Product Matching (2026-03-13)

**Module:** TikTok Intelligence — Cross-Platform Demand Validation

**Completed:** Created cross-platform matching worker that takes TikTok-sourced
products, searches for matching products on Amazon/Shopify using keyword overlap,
and enriches the product record with cross-platform demand data.

**v7 spec coverage:** Section 28.2 — "When a product is detected on one
platform, automatically check for presence on others."

**Architecture:**
- New queue: `tiktok-cross-match` (concurrency 1)
- Extracts search terms from TikTok product titles (stop-word removal)
- Searches Amazon/Shopify via existing `scrapePlatform()` provider
- Word-overlap matching (min 2 words) to find best match
- Updates product `enrichment_data` with cross-platform matches
- Auto-chained from tiktok-product-extract worker

**Full pipeline chain:**
`tiktok-discovery → tiktok-product-extract → enrich-product`
                                            `→ tiktok-cross-match`

**New endpoint:** `POST /api/tiktok/cross-match` (manual trigger)

**Files created:**
- `backend/src/jobs/tiktok-cross-match.ts`

**Files modified:**
- `backend/src/jobs/types.ts` — added TIKTOK_CROSS_MATCH queue + job data
- `backend/src/jobs/tiktok-product-extract.ts` — chains cross-match after enrichment
- `backend/src/jobs/index.ts` — registered tiktokCrossMatchWorker
- `backend/src/index.ts` — added cross-match endpoint

**Phase 1 status:** 4 of 5 batches complete
- [x] Batch 01 — TikTok discovery worker
- [x] Batch 02 — Product extraction from videos
- [x] Batch 03 — Engagement signal analysis
- [x] Batch 04 — Cross-platform demand validation
- [ ] Batch 05 — Phase 1 integration + admin UI

**Next step:** Phase 1 Batch 05 — Admin UI integration for TikTok Intelligence
(TikTok videos page, hashtag signals dashboard, discovery trigger UI)

------------------------------------------------------------

## Phase 1 Batch 05 — Admin UI: TikTok Intelligence Dashboard (2026-03-13)

**Module:** TikTok Intelligence — Admin Frontend

**Completed:** Enhanced the admin TikTok page from a simple product listing
into a full TikTok Intelligence dashboard with three tabs.

**UI tabs:**
1. **Products** — TikTok-sourced products with scores (existing, preserved)
2. **Videos** — Discovered TikTok videos with engagement metrics (views, likes,
   shares, comments), creator info, hashtags, and product link indicators.
   Filterable by description search and product-link-only toggle.
3. **Hashtag Signals** — Velocity tracking dashboard showing per-hashtag
   metrics: total videos, views, creator count, view velocity (/hr),
   video growth rate, creator growth rate, engagement rate, product %

**Discovery trigger:** Top-right input + button to queue a TikTok discovery
job directly from the admin UI.

**API routes created:**
- `GET /api/admin/tiktok/videos` — paginated video list with filters
- `GET /api/admin/tiktok/signals` — hashtag signal snapshots
- `POST /api/admin/tiktok/discover` — proxy to backend discovery queue

**Files created:**
- `src/app/api/admin/tiktok/videos/route.ts`
- `src/app/api/admin/tiktok/signals/route.ts`
- `src/app/api/admin/tiktok/discover/route.ts`

**Files modified:**
- `src/app/admin/tiktok/page.tsx` — complete rewrite with tabs + discovery trigger

**PHASE 1 — TIKTOK INTELLIGENCE: COMPLETE**

All 5 batches delivered:
- [x] Batch 01 — TikTok discovery worker (video scraping via Apify)
- [x] Batch 02 — Product extraction from videos
- [x] Batch 03 — Engagement signal analysis (hashtag velocity)
- [x] Batch 04 — Cross-platform demand validation
- [x] Batch 05 — Admin UI dashboard

**Full TikTok pipeline:**
```
User triggers discovery (admin UI or API)
  → tiktok-discovery worker (Apify → tiktok_videos)
    → tiktok-product-extract (videos → product candidates)
      → enrich-product (scoring + DB upsert)
      → tiktok-cross-match (Amazon/Shopify demand validation)
  → tiktok-engagement-analysis (hashtag velocity snapshots)
```

**Next phase:** Phase 2 — Product Intelligence
(product clustering, trend detection engine)

------------------------------------------------------------

## Phases 2-5 — Backend Intelligence Workers (2026-03-13)

### Phase 2 — Product Intelligence

**Completed:** Product clustering and trend detection workers.

**Product Clustering (`product-clustering.ts`):**
- Groups products by keyword overlap in titles (stop-word removal)
- Builds clusters when similarity >= configurable threshold
- Stores in `product_clusters` + `product_cluster_members` tables
- Tracks avg_score and trend_stage per cluster

**Trend Detection (`trend-detection.ts`):**
- Analyzes clusters and products for pre-viral detection (score >= 70)
- Updates trend_stage (emerging → growing → peak → declining)
- Sends email alerts (Resend) for products scoring 85+
- Stores trend snapshots in `trend_keywords` table

**Migration:** `012_product_clusters.sql` — product_clusters + product_cluster_members

### Phase 3 — Creator Intelligence

**Completed:** Creator-product matching engine.

**Creator Matching (`creator-matching.ts`):**
- For products scoring 60+, matches against influencers
- 3-factor scoring: niche alignment (40%), engagement fit (35%), price range fit (25%)
- ROI projection: estimated views, conversions, profit
- Stores in `creator_product_matches` table

**Migration:** `013_creator_product_match.sql`

### Phase 4 — Marketplace Intelligence

**Completed:** Amazon and Shopify intelligence workers.

**Amazon Intelligence (`amazon-intelligence.ts`):**
- Scrapes Amazon BSR via Apify `junglee~amazon-bestsellers-scraper`
- Maps to RawProduct, forwards to enrich-product pipeline

**Shopify Intelligence (`shopify-intelligence.ts`):**
- Scrapes Shopify stores via Apify `clearpath~shop-by-shopify-product-scraper`
- Extracts competitor store data (hostname, product count)
- Stores competitors, forwards products to enrich pipeline

### Phase 5 — Ad Intelligence

**Completed:** Ad discovery across TikTok and Facebook.

**Ad Intelligence (`ad-intelligence.ts`):**
- TikTok: Apify scraper filtering for sponsored content indicators
- Facebook: Meta Ad Library API integration
- Estimates ad spend from impressions
- Marks scaling ads (100K+ impressions TikTok, 7+ days Facebook)
- Stores in `ads` table

**Migration:** `014_ads_table.sql` — ads table + competitor enhancements

**All workers registered in `backend/src/jobs/index.ts`.**
**15 total API endpoints in `backend/src/index.ts`.**

**Files created (Phases 2-5):**
- `backend/src/jobs/product-clustering.ts`
- `backend/src/jobs/trend-detection.ts`
- `backend/src/jobs/creator-matching.ts`
- `backend/src/jobs/amazon-intelligence.ts`
- `backend/src/jobs/shopify-intelligence.ts`
- `backend/src/jobs/ad-intelligence.ts`
- `supabase/migrations/012_product_clusters.sql`
- `supabase/migrations/013_creator_product_match.sql`
- `supabase/migrations/014_ads_table.sql`

**Files modified:**
- `backend/src/jobs/types.ts` — 6 new queues + interfaces
- `backend/src/jobs/index.ts` — 6 new worker registrations
- `backend/src/index.ts` — 10 new API endpoints

**Next phase:** Phase 6 — Admin Dashboard Polish (UI pages for all intelligence modules)

------------------------------------------------------------

## Phase 6 — Admin Dashboard Polish (2026-03-13)

**Completed:** Full admin UI pages for all intelligence modules with
scan triggers, data tables, filters, and sidebar navigation updates.

### New Admin Pages Created:

1. **Product Clusters** (`/admin/clusters`) — Displays product clusters
   grouped by keyword similarity. Shows keywords, product count, avg score,
   trend stage. Run Clustering button triggers backend job.

2. **Creator Matches** (`/admin/creator-matches`) — Creator-product match
   dashboard with ROI projections. Shows product, creator, match score,
   niche alignment, engagement fit, estimated views/profit, status.
   Run Matching button triggers backend job.

3. **Ad Intelligence** (`/admin/ads`) — Ad discovery dashboard for TikTok
   and Facebook ads. Platform filter, scaling-only toggle, discover button.
   Shows impressions, estimated spend, scaling status, advertiser info.

### Enhanced Admin Pages:

4. **Amazon Intelligence** (`/admin/amazon`) — Upgraded from simple
   PlatformProducts wrapper to full page with BSR scan trigger input,
   product table with sales/review columns, and error handling.

5. **Shopify Intelligence** (`/admin/shopify`) — Upgraded from simple
   PlatformProducts wrapper to tabbed view (Products + Competitor Stores).
   Scan Stores trigger, competitor store table with niche/product count.

### New API Routes:

- `GET/POST /api/admin/clusters` — Read clusters, trigger clustering job
- `GET/POST /api/admin/creator-matches` — Read matches, trigger matching
- `GET/POST /api/admin/ads` — Read ads, trigger ad discovery
- `POST /api/admin/amazon/scan` — Trigger Amazon BSR scan
- `POST /api/admin/shopify/scan` — Trigger Shopify store scan

### Sidebar Navigation:

Added 3 new items to Intelligence section:
- Product Clusters (Layers icon)
- Creator Matches (Target icon)
- Ad Intelligence (Megaphone icon)

**Files created:**
- `src/app/admin/clusters/page.tsx`
- `src/app/admin/creator-matches/page.tsx`
- `src/app/admin/ads/page.tsx`
- `src/app/api/admin/clusters/route.ts`
- `src/app/api/admin/creator-matches/route.ts`
- `src/app/api/admin/ads/route.ts`
- `src/app/api/admin/amazon/scan/route.ts`
- `src/app/api/admin/shopify/scan/route.ts`

**Files modified:**
- `src/app/admin/amazon/page.tsx` — full rewrite with scan trigger
- `src/app/admin/shopify/page.tsx` — full rewrite with tabs + scan trigger
- `src/components/admin-sidebar.tsx` — 3 new nav items

**ALL 6 PHASES COMPLETE.**

------------------------------------------------------------

## Fix: Admin Sidebar Not Rendering (2026-03-13)

**Problem:** After RBAC fix (commit 75b26f4), the admin dashboard rendered
without the left sidebar navigation. The old flat dashboard layout appeared
instead of the newer sidebar layout.

**Root Cause:** `src/app/admin/layout.tsx` gated sidebar rendering entirely
on `getUser()` returning a valid user. When `getUser()` returned null (due
to RPC timing, SSR context, or caching), the layout fell back to
`<>{children}</>` — rendering the page without any sidebar wrapper.
The `.catch(() => null)` silently swallowed all errors.

**Fixes applied:**
1. **Force dynamic rendering** — added `export const dynamic = 'force-dynamic'`
   to admin layout, preventing static caching of admin pages
2. **Session-cookie fallback** — if `getUser()` fails but Supabase session
   cookies exist (meaning middleware already validated auth), still render
   the sidebar with a minimal fallback profile
3. **Error logging** — added `console.error` calls in `getUser()` for
   auth failures, RPC failures, and unexpected errors (no longer silent)

**Files modified:**
- `src/app/admin/layout.tsx` — dynamic export, cookie fallback, error logging
- `src/lib/auth/get-user.ts` — diagnostic error logging

**Next step:** Monitor Netlify function logs for `[getUser]` errors to
determine the exact failure mode and apply a permanent fix if needed.

------------------------------------------------------------

## Session – 2026-03-14 – Fix post-login sidebar not rendering

### Problem
After login, the dashboard rendered without the sidebar (layout fell through to
`<>{children}</>` because `getUser()` returned null). A manual page refresh
would load the sidebar correctly.

### Root Cause
`router.push('/admin')` performs a **client-side navigation**. The Next.js
server-side `AdminLayout` re-runs `getUser()` but the Supabase auth cookies
haven't been fully set by the browser yet, so the server sees no session.

### Fix
Replaced `router.push('/admin')` with `window.location.href = '/admin'` in
`src/app/admin/login/page.tsx`. This forces a full HTTP request, guaranteeing
the auth cookies are sent with the initial server render.

Removed unused `useRouter` import.

### Note on "Not Configured" API statuses
The System Status panel shows "Not Configured" for AI Engine, Resend Email,
Apify Scrapers, and RapidAPI. This is correct behaviour — the env vars
(`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `APIFY_API_TOKEN`, `RAPIDAPI_KEY`)
need to be set in the deployment environment (Netlify). This is not a code bug.

------------------------------------------------------------

------------------------------------------------------------

## SESSION: 2026-03-14 — Full System Audit & Bug Fixes

### Issues Found & Fixed

1. **SECURITY FIX: Secrets leaked to client bundle**
   - `next.config.mjs` used `env:{}` which exposes ALL listed env vars (including
     `SUPABASE_SERVICE_ROLE_KEY`) into the client-side JavaScript bundle
   - Removed entire `env:{}` block — Netlify Functions already have `process.env`
     access at runtime without build-time inlining

2. **BUG FIX: Middleware rejects super_admin role**
   - `middleware.ts` only checked `role !== 'admin'`, blocking `super_admin` users
   - Fixed to accept both `admin` and `super_admin` roles

3. **BUG FIX: BUG-001 — Admin layout renders for any authenticated user**
   - `admin/layout.tsx` showed sidebar to any logged-in user (including clients)
   - Added defense-in-depth role check: only renders admin sidebar for
     `admin` / `super_admin` roles

4. **BUG FIX: Client login uses router.push instead of window.location.href**
   - `/login/page.tsx` used `router.push('/dashboard')` which doesn't refresh
     server-side layout, causing stale auth cookies
   - Changed to `window.location.href = '/dashboard'` (same fix as admin login)

5. **FIX: netlify.toml missing Node version and security headers**
   - Added `NODE_VERSION = "18"` to build environment
   - Added security headers: X-Frame-Options, X-Content-Type-Options,
     Referrer-Policy, Permissions-Policy

6. **SECURITY FIX: check_user_role RPC granted to anon**
   - The `anon` role could call `check_user_role()` to enumerate user roles
   - Changed to REVOKE from anon, only `authenticated` can call it

7. **TYPE FIX: UserRole type missing super_admin and viewer**
   - `database.ts` had `"admin" | "client"` only
   - Fixed to `"super_admin" | "admin" | "client" | "viewer"`

8. **FIX: requireAdmin() rejects super_admin**
   - `roles.ts` only accepted `role === 'admin'`
   - Fixed to accept both `admin` and `super_admin`

### Files Modified
- `next.config.mjs` — Removed secret-leaking env config
- `src/middleware.ts` — Accept super_admin role
- `src/app/admin/layout.tsx` — Defense-in-depth role check
- `src/app/login/page.tsx` — Use window.location.href
- `src/lib/auth/get-user.ts` — Add super_admin to User type
- `src/lib/auth/roles.ts` — Accept super_admin in requireAdmin()
- `src/lib/types/database.ts` — Add super_admin/viewer to UserRole
- `netlify.toml` — Node version + security headers
- `supabase/migrations/015_admin_check_rpc.sql` — Revoke anon access

### Build Status
- Build: PASS (70 pages, no errors)

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

------------------------------------------------------------

# 2026-03-14 — E2E Testing Strategy & Automated Test Runner

## What was done
1. Created comprehensive E2E testing strategy (`system/e2e_testing_strategy.md`)
   - 68 tests across 13 suites, 6 execution phases
   - Covers auth, CRUD, allocation, scan pipeline, intelligence pages, API validation
   - Cost estimates for scan tests, priority ordering (P0/P1/P2)

2. Built automated E2E test runner (`/api/admin/e2e`)
   - Server-side API route that executes all 6 phases
   - Phase 1: Auth & navigation (login, guards, 10 API route accessibility checks)
   - Phase 2: Product + Client full CRUD cycles (create → read → update → delete with cleanup)
   - Phase 3: Allocation business flows (allocate → visibility toggle → client isolation)
   - Phase 4: Scan pipeline (backend connectivity, scan history, cost-guarded skip)
   - Phase 5: Intelligence tables (10 tables) + scoring formula validation
   - Phase 6: API input validation, settings CRUD cycle, pagination, external API keys
   - Usage: `GET /api/admin/e2e?phase=all` (or `phase=1` through `6`)
   - All test data is created and cleaned up within each phase

3. Fixed debug test 1.4 enum issue (user_role enum only has 'admin'|'client')

## Files changed
- `system/e2e_testing_strategy.md` (new)
- `src/app/api/admin/e2e/route.ts` (new)
- `src/app/api/admin/debug/route.ts` (fixed test 1.4)
