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

**Next step:** Continue platform development per build phases.

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
