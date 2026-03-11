# YouSell Intelligence Platform — Execution Roadmap

**Version:** 2.0 — Continuation & Completion Brief
**Date:** 2026-03-11
**Repository:** github.com/haqeeqiazadee-ux/yousell-admin
**Status:** Existing project — upgrading, NOT rebuilding from scratch

---

## 1. PROJECT UNDERSTANDING

YouSell Intelligence Platform is a **multi-platform commerce intelligence SaaS** that combines the capabilities of:

| Tool | Coverage | YouSell Equivalent |
|------|----------|-------------------|
| FastMoss | TikTok intelligence | TikTok Discovery Engine |
| JungleScout | Amazon intelligence | Amazon Intelligence Engine |
| PPSPY | Shopify store intelligence | Shopify Intelligence Engine |
| Minea | Ad intelligence | Ad Intelligence Engine |

Into **one unified analytics dashboard** at `admin.yousell.online`.

**Business Model:** Standalone SaaS — white-labelable, rebrandable, multi-tenant.

---

## 2. CURRENT STATE AUDIT

### 2.1 What Already Exists (DO NOT REBUILD)

**Tech Stack (keep as-is):**
- Frontend: Next.js 14 + React 18 + Tailwind CSS 3 → deployed on Netlify
- Backend: Next.js API routes (Node.js)
- Database: Supabase (PostgreSQL)
- Workers: Railway (background services)
- Email: Resend
- Version Control: GitHub

**Pages Already Built:**
- `/admin` — Dashboard with stats, scan history, pre-viral products
- `/admin/products` — Product listing with edit/delete/pagination
- `/admin/tiktok` — TikTok product page
- `/admin/amazon` — Amazon product page (stub)
- `/admin/shopify` — Shopify product page (stub)
- `/admin/influencers` — Influencer listing with pagination
- `/admin/trends` — Trends page
- `/admin/competitors` — Competitor analysis page
- `/admin/affiliates` — Affiliate programs (AI + Physical)
- `/admin/suppliers` — Supplier discovery
- `/admin/blueprints` — Product blueprints
- `/admin/analytics` — Analytics (stub)
- `/admin/scan` — Scan interface
- `/admin/settings` — Settings page
- `/admin/notifications` — Notifications
- `/admin/pinterest` — Pinterest products
- `/admin/allocate` — Product allocation
- `/admin/digital` — Digital products (stub)
- `/admin/import` — Import interface

**API Routes Already Built:**
- `/api/admin/products`, `/api/admin/tiktok`, `/api/admin/amazon`
- `/api/admin/shopify`, `/api/admin/influencers`, `/api/admin/trends`
- `/api/admin/competitors`, `/api/admin/affiliates`, `/api/admin/suppliers`
- `/api/admin/blueprints`, `/api/admin/scan`, `/api/admin/scoring`
- `/api/admin/settings`, `/api/admin/notifications`, `/api/admin/pinterest`
- `/api/admin/allocations`, `/api/admin/automation`, `/api/admin/financial`
- `/api/admin/dashboard`, `/api/admin/digital`, `/api/admin/import`
- `/api/admin/clients`
- `/api/auth/*`, `/api/dashboard/*`

**Scoring System Already Built:**
- `src/lib/scoring/composite.ts` — Viral score, trend score, profit score, final opportunity score
- `src/lib/scoring/profitability.ts` — Profitability calculator
- Influencer conversion score algorithm
- Auto-rejection rules for products
- Tier classification (HOT/WARM/WATCH/COLD)

**Provider Integrations Configured:**
- Supabase, Anthropic (Claude AI), Resend, Apify
- TikTok Research API (pending), ScrapeCreators
- Amazon PA API (pending), RapidAPI (fallback)
- Reddit, YouTube, Product Hunt, Pinterest
- SerpAPI, Ainfluencer, Modash, HypeAuditor
- Alibaba, CJ Dropshipping, Faire

**Components Built:**
- AdminSidebar, ProductCard, ScoreBadge, PlatformProducts
- Full UI component library (button, card, table, dialog, tabs, etc.)
- Theme provider with dark mode toggle
- User context and auth middleware

### 2.2 What is MISSING (Must Be Built)

1. **Background Worker Architecture** — No Redis/BullMQ queue system
2. **Dedicated Scraping Workers** — Scraping is likely coupled to API routes
3. **Market Intelligence Engine** — No velocity-based trend detection
4. **Creator Matching Engine** — No creator-product matching system
5. **Ad Intelligence Module** — No Facebook/TikTok ad library scanning
6. **Cross-Platform Product Clustering** — No deduplication across platforms
7. **Real-time Trend Alerts** — No notification system for emerging trends
8. **Multi-Tenant SaaS Layer** — No organizations, teams, subscriptions
9. **Job Scheduler Configuration** — No configurable scheduling UI
10. **System Health Monitor** — No worker status dashboard
11. **Videos Page** — No dedicated video analytics module
12. **Shops Page** — No dedicated shop tracking module
13. **Live Streams Page** — No live stream intelligence
14. **AI Insights Dashboard** — No automated insight generation

### 2.3 Architectural Issues to Fix

| Issue | Current | Required |
|-------|---------|----------|
| Scraping location | Inside API routes | Background workers via queue |
| Job scheduling | None | Redis + BullMQ with configurable intervals |
| Worker isolation | None | Separate Railway services per worker type |
| Caching | None | Redis cache for repeated queries |
| Rate limiting | None | Per-provider rate limit management |
| Error handling | Basic | Retry logic with exponential backoff |
| Data pipeline | Direct | Discovery → Scrape → Extract → Cluster → Score → Serve |

---

## 3. EXECUTION PHASES

### Phase 1: Infrastructure Foundation (Priority: CRITICAL)
**Goal:** Set up the queue system and worker architecture

Tasks:
1. Install Redis + BullMQ dependencies
2. Create `src/lib/queue/` — queue connection, job definitions
3. Create `src/lib/workers/` — worker base class with retry/error handling
4. Set up Redis connection (Railway add-on or Upstash)
5. Create job scheduler with configurable intervals
6. Create `/admin/settings/scheduler` — UI to configure job timing
7. Add worker health monitoring endpoint

**Files to create:**
```
src/lib/queue/connection.ts
src/lib/queue/jobs.ts
src/lib/queue/scheduler.ts
src/lib/workers/base-worker.ts
src/lib/workers/worker-registry.ts
```

### Phase 2: TikTok Intelligence Engine (Priority: HIGH)
**Goal:** Complete TikTok product/creator/video discovery pipeline

Tasks:
1. Build `tiktok_discovery_worker` — scans trending hashtags/products
2. Build `video_scraper_worker` — extracts video metadata and engagement
3. Build `product_extractor_worker` — identifies products from videos
4. Enhance `/admin/tiktok` page with real data from workers
5. Create `/admin/videos` page — video analytics module
6. Connect to Apify TikTok actors + ScrapeCreators API
7. Store all results in Supabase tables

**Workers to create:**
```
src/lib/workers/tiktok/discovery.ts
src/lib/workers/tiktok/video-scraper.ts
src/lib/workers/tiktok/product-extractor.ts
```

### Phase 3: Product Intelligence Engine (Priority: HIGH)
**Goal:** Cross-platform product clustering and trend detection

Tasks:
1. Build `product_clustering_worker` — deduplicates products across platforms
2. Build `trend_scoring_worker` — calculates velocity-based trend scores
3. Enhance existing scoring algorithms with velocity signals:
   - View velocity (views per hour growth rate)
   - Creator adoption rate (new creators per day)
   - Store adoption rate (new stores selling per day)
   - Ad duplication rate (new ads per day)
   - Engagement ratio changes
4. Create `product_clusters` table in Supabase
5. Update `/admin/products` to show clustered cross-platform data
6. Create `/admin/trends` with real velocity data

**Workers to create:**
```
src/lib/workers/product/clustering.ts
src/lib/workers/product/trend-scorer.ts
```

### Phase 4: Creator Intelligence Engine (Priority: MEDIUM)
**Goal:** Creator discovery, scoring, and product matching

Tasks:
1. Build `creator_discovery_worker` — finds creators promoting tracked products
2. Build `creator_matching_worker` — calculates creator-product fit scores
3. Enhance `/admin/influencers` with creator conversion data
4. Add creator-product relationship mapping
5. Integrate Ainfluencer, Modash, HypeAuditor APIs
6. Create `creator_product_match` table

**Workers to create:**
```
src/lib/workers/creator/discovery.ts
src/lib/workers/creator/matching.ts
```

### Phase 5: Amazon Intelligence Engine (Priority: MEDIUM)
**Goal:** Amazon product tracking and TikTok-Amazon correlation

Tasks:
1. Build `amazon_scanner_worker` — scans bestseller/movers/new releases
2. Build `amazon_tiktok_match_worker` — correlates TikTok products with Amazon
3. Enhance `/admin/amazon` with real product data
4. Connect Amazon PA API or RapidAPI fallback
5. Create `amazon_products` table with BSR tracking

**Workers to create:**
```
src/lib/workers/amazon/scanner.ts
src/lib/workers/amazon/tiktok-matcher.ts
```

### Phase 6: Shopify Intelligence Engine (Priority: MEDIUM)
**Goal:** Shopify store discovery and growth monitoring

Tasks:
1. Build `shopify_store_discovery_worker` — discovers new stores via Apify
2. Build `shopify_growth_monitor_worker` — tracks store revenue changes
3. Build `shopify_tiktok_match_worker` — correlates Shopify products with TikTok
4. Enhance `/admin/shopify` with real store data
5. Create `shopify_stores` and `shopify_products` tables
6. Create `/admin/shops` — dedicated shop tracking module

**Workers to create:**
```
src/lib/workers/shopify/store-discovery.ts
src/lib/workers/shopify/growth-monitor.ts
src/lib/workers/shopify/tiktok-matcher.ts
```

### Phase 7: Ad Intelligence Engine (Priority: MEDIUM)
**Goal:** Facebook + TikTok ad library scanning

Tasks:
1. Build `facebook_ads_worker` — scans Facebook Ad Library
2. Build `tiktok_ads_worker` — discovers TikTok ad campaigns
3. Build `ad_scaling_detector` — identifies rapidly scaling ads
4. Create `/admin/ads` page — ad analytics module (replace stub if exists)
5. Create `ads` table with spend estimates, creative data
6. Link ads to products, creators, shops

**Workers to create:**
```
src/lib/workers/ads/facebook-scanner.ts
src/lib/workers/ads/tiktok-scanner.ts
src/lib/workers/ads/scaling-detector.ts
```

### Phase 8: Opportunity Feed Engine (Priority: HIGH)
**Goal:** AI-generated insights and automated alerts

Tasks:
1. Build `opportunity_feed_worker` — generates daily AI insights
2. Create `/admin/insights` page (or enhance `/admin/analytics`)
3. Auto-generate insights like:
   - "Top 20 rising products today"
   - "Creators driving highest sales this week"
   - "Products spreading fastest across platforms"
   - "Emerging niches detected"
4. Integrate Claude AI (Anthropic) for insight generation
5. Create real-time trend alert notifications via Resend email

### Phase 9: Multi-Tenant SaaS Layer (Priority: LOW — Future)
**Goal:** Enable multi-user SaaS deployment

Tasks:
1. Create `organizations` and `teams` tables
2. Add `organization_id` to all data tables
3. Implement Row Level Security (RLS) in Supabase
4. Create subscription tier management (Starter/Pro/Agency/Enterprise)
5. Add usage tracking and limits per tier
6. Implement white-label branding configuration
7. Add Stripe integration for subscription billing

### Phase 10: System Health & Monitoring (Priority: MEDIUM)
**Goal:** Operational visibility

Tasks:
1. Build system health dashboard showing:
   - Worker status (running/stopped/error)
   - Queue depths
   - Last scan timestamps
   - API rate limit usage
   - Error rates
2. Add worker auto-restart on failure
3. Create operational alerts for system issues
4. Add cost tracking for API usage

---

## 4. DATABASE SCHEMA ADDITIONS

### New Tables Required

```sql
-- Product clusters (cross-platform dedup)
CREATE TABLE product_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  category TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  platforms TEXT[] DEFAULT '{}',
  product_ids UUID[] DEFAULT '{}',
  trend_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  external_id TEXT,
  creator_id UUID REFERENCES creators(id),
  title TEXT,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  engagement_velocity NUMERIC DEFAULT 0,
  product_ids UUID[] DEFAULT '{}',
  is_ad BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shops
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  url TEXT,
  revenue_estimate NUMERIC DEFAULT 0,
  product_count INT DEFAULT 0,
  growth_rate NUMERIC DEFAULT 0,
  top_product_ids UUID[] DEFAULT '{}',
  creator_collaborations UUID[] DEFAULT '{}',
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  external_id TEXT,
  advertiser_name TEXT,
  creative_url TEXT,
  landing_page TEXT,
  product_id UUID,
  spend_estimate NUMERIC DEFAULT 0,
  impressions_estimate BIGINT DEFAULT 0,
  is_scaling BOOLEAN DEFAULT FALSE,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator-Product matching
CREATE TABLE creator_product_match (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  product_id UUID NOT NULL,
  match_score NUMERIC DEFAULT 0,
  videos_count INT DEFAULT 0,
  estimated_sales NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trend velocity snapshots
CREATE TABLE trend_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  view_velocity NUMERIC DEFAULT 0,
  creator_count INT DEFAULT 0,
  store_count INT DEFAULT 0,
  ad_count INT DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  trend_score NUMERIC DEFAULT 0
);

-- Job scheduler configuration
CREATE TABLE job_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT UNIQUE NOT NULL,
  interval_minutes INT NOT NULL DEFAULT 60,
  is_enabled BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker health
CREATE TABLE worker_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_name TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'stopped',
  last_heartbeat TIMESTAMPTZ,
  jobs_completed INT DEFAULT 0,
  jobs_failed INT DEFAULT 0,
  error_message TEXT
);
```

---

## 5. DATA PIPELINE ARCHITECTURE

```
Discovery Workers (scheduled)
       ↓
  Redis Queue (BullMQ)
       ↓
  Scraping Workers (Railway)
       ↓
  Product Extraction
       ↓
  Product Clustering (cross-platform dedup)
       ↓
  Trend Scoring (velocity signals)
       ↓
  Creator Matching
       ↓
  Marketplace Matching (Amazon ↔ TikTok ↔ Shopify)
       ↓
  Ad Intelligence
       ↓
  Opportunity Feed (AI insights)
       ↓
  Dashboard (API serves stored data ONLY)
```

**Critical Rule:** API routes must NEVER perform scraping. They only read from the database.

---

## 6. JOB SCHEDULING (CONFIGURABLE)

| Job | Default Interval | Min | Max |
|-----|-----------------|-----|-----|
| TikTok trending scan | 10 min | 5 min | 60 min |
| Creator discovery | 30 min | 15 min | 120 min |
| Product trend scoring | 60 min | 30 min | 360 min |
| Shopify store scan | 6 hours | 1 hour | 24 hours |
| Amazon BSR scan | 24 hours | 6 hours | 72 hours |
| Ad library scan | 2 hours | 30 min | 12 hours |
| AI insight generation | 24 hours | 6 hours | 72 hours |

Admin can modify these intervals through `/admin/settings/scheduler`.

---

## 7. COST OPTIMIZATION STRATEGIES

1. **Configurable scheduling** — reduce scan frequency during off-hours
2. **Batch scraping** — group multiple queries into single API calls
3. **Worker auto-sleep** — idle workers consume zero resources
4. **Query caching** — Redis cache for repeated dashboard queries (TTL: 5 min)
5. **Tiered AI analysis** — Only use Claude Sonnet for high-score products (>=75)
6. **Smart deduplication** — don't re-scrape products already in database

---

## 8. PRIORITY EXECUTION ORDER

```
Week 1-2:  Phase 1 (Infrastructure — Redis/BullMQ/Workers)
Week 3-4:  Phase 2 (TikTok Intelligence)
Week 5-6:  Phase 3 (Product Clustering + Trend Detection)
Week 7-8:  Phase 4 (Creator Intelligence)
Week 9-10: Phase 5 (Amazon Intelligence)
Week 11-12: Phase 6 (Shopify Intelligence)
Week 13-14: Phase 7 (Ad Intelligence)
Week 15-16: Phase 8 (AI Insights + Opportunity Feed)
Week 17-18: Phase 10 (System Health Monitor)
Week 19+:  Phase 9 (Multi-Tenant SaaS — when ready to launch)
```

---

## 9. SUCCESS CRITERIA

The platform is complete when:

- [ ] All 10 intelligence engines are operational
- [ ] Background workers run independently on Railway
- [ ] Job scheduling is configurable through admin UI
- [ ] Cross-platform product clustering works (TikTok → Amazon → Shopify)
- [ ] Trend velocity scoring produces actionable insights
- [ ] Creator-product matching generates recommendations
- [ ] Ad intelligence detects scaling campaigns
- [ ] AI generates daily insights automatically
- [ ] Dashboard mirrors FastMoss quality with multi-platform expansion
- [ ] System can be white-labeled and deployed as standalone SaaS
