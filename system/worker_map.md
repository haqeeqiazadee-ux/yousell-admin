# Worker Map

**Last Updated:** 2026-03-11

---

## Existing Infrastructure

**Location:** `/backend/` directory
**Server:** Express on port 4000 (`backend/src/index.ts`)
**Queue:** BullMQ with Redis (`scan` queue) via `backend/src/lib/queue.ts`
**Existing Worker:** `backend/src/worker.ts` — processes scan jobs for TikTok, Amazon, Shopify, Pinterest, Trends
**Existing Libs:** `backend/src/lib/providers.ts`, `backend/src/lib/scoring.ts`, `backend/src/lib/email.ts`, `backend/src/lib/supabase.ts`

**New workers MUST be added to `/backend/src/` — extend the existing BullMQ setup.**

## Worker Registry

| Worker | Engine | Status | Queue Name | Schedule |
|--------|--------|--------|------------|----------|
| scan_worker (EXISTING) | Multi-platform Scan | BUILT | scan | On demand |
| tiktok_discovery_worker | TikTok Discovery | NOT BUILT | tiktok:discovery | Every 10 min |
| hashtag_scanner_worker | TikTok Discovery | NOT BUILT | tiktok:hashtags | Every 30 min |
| video_scraper_worker | TikTok Discovery | NOT BUILT | tiktok:videos | Every 10 min |
| product_extractor_worker | Product Extraction | NOT BUILT | product:extract | On demand |
| product_clustering_worker | Product Clustering | NOT BUILT | product:cluster | Every 1 hr |
| trend_scoring_worker | Trend Detection | NOT BUILT | trend:score | Every 1 hr |
| creator_discovery_worker | Creator Matching | NOT BUILT | creator:discover | Every 30 min |
| creator_matching_worker | Creator Matching | NOT BUILT | creator:match | Every 1 hr |
| amazon_scanner_worker | Amazon Intelligence | NOT BUILT | amazon:scan | Every 24 hr |
| amazon_tiktok_match_worker | Amazon Intelligence | NOT BUILT | amazon:match | Every 6 hr |
| shopify_store_discovery_worker | Shopify Intelligence | NOT BUILT | shopify:discover | Every 6 hr |
| shopify_growth_monitor_worker | Shopify Intelligence | NOT BUILT | shopify:growth | Every 6 hr |
| facebook_ads_worker | Ad Intelligence | NOT BUILT | ads:facebook | Every 2 hr |
| tiktok_ads_worker | Ad Intelligence | NOT BUILT | ads:tiktok | Every 2 hr |
| ad_scaling_detector | Ad Intelligence | NOT BUILT | ads:scaling | Every 1 hr |
| opportunity_feed_worker | Opportunity Feed | NOT BUILT | insights:generate | Every 24 hr |
| system_health_monitor | System Health | NOT BUILT | system:health | Every 5 min |

## Worker Architecture

All workers:
1. Run on **Railway** as separate services
2. Connect to **Redis** for job queue (BullMQ)
3. Read/write to **Supabase** for data persistence
4. Call **external APIs** (Apify, ScrapeCreators, RapidAPI, etc.)
5. Must implement retry logic with exponential backoff
6. Must send heartbeat to `worker_health` table
7. Must log errors to `worker_health.error_message`

## Worker File Structure

```
src/lib/workers/
├── base-worker.ts         # Base class with retry/heartbeat/error handling
├── worker-registry.ts     # Registry of all workers
├── tiktok/
│   ├── discovery.ts
│   ├── video-scraper.ts
│   └── product-extractor.ts
├── product/
│   ├── clustering.ts
│   └── trend-scorer.ts
├── creator/
│   ├── discovery.ts
│   └── matching.ts
├── amazon/
│   ├── scanner.ts
│   └── tiktok-matcher.ts
├── shopify/
│   ├── store-discovery.ts
│   ├── growth-monitor.ts
│   └── tiktok-matcher.ts
├── ads/
│   ├── facebook-scanner.ts
│   ├── tiktok-scanner.ts
│   └── scaling-detector.ts
└── insights/
    └── opportunity-feed.ts
```
