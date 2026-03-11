# System Architecture

**Last Updated:** 2026-03-11

---

## Architecture Diagram

```
User Browser
     ↓
Admin Dashboard (Next.js 14 on Netlify)
     ↓
┌──────────────────────────────────────────────┐
│  Next.js API Routes        Express Backend   │
│  (Netlify serverless)      (Railway :4000)   │
│  - Dashboard endpoints     - POST /api/scan  │
│  - CRUD operations         - GET /api/scan/* │
│  - Auth routes             - Job queue mgmt  │
└──────────┬──────────────────────┬────────────┘
           ↓                      ↓
    Supabase (PostgreSQL)    Redis Queue (BullMQ)
           ↑                      ↓
           └──── BullMQ Worker (Railway) ──→ External APIs
                                               ├── Apify (TikTok, Amazon, Shopify, Pinterest)
                                               ├── ScrapeCreators (TikTok Shop)
                                               ├── RapidAPI (Amazon fallback)
                                               ├── Facebook Ad Library
                                               ├── Ainfluencer / Modash / HypeAuditor
                                               └── Alibaba / CJ Dropshipping / Faire
```

## EXISTING BACKEND (DO NOT REBUILD)

The project has a **dedicated Express backend** at `/backend/` with:
- **Express server** (`backend/src/index.ts`) — auth middleware, rate limiting, CORS, helmet
- **BullMQ scan queue** (`scan` queue name) with Redis connection
- **Scan worker** (`backend/src/worker.ts`) — processes scan jobs, scrapes platforms, scores products, sends alerts
- **Provider system** (`backend/src/lib/providers`) — scrapePlatform(), fetchTrends()
- **Scoring** (`backend/src/lib/scoring`) — composite score calculation
- **Email** (`backend/src/lib/email`) — scan alerts, product alerts via Resend
- **Supabase client** (`backend/src/lib/supabase`)
- Deployed on **Railway** (port 4000)

**New workers MUST be added to `/backend/`, NOT the Next.js app.**

## 10 Intelligence Engines

| # | Engine | Status | Priority |
|---|--------|--------|----------|
| 1 | TikTok Discovery Engine | Partial (scan worker scrapes TikTok, page exists) | HIGH |
| 2 | Product Extraction Engine | Partial (scoring exists, scan worker extracts) | HIGH |
| 3 | Product Clustering Engine | Not started | HIGH |
| 4 | Trend Detection Engine | Partial (algorithms + trend fetcher exist) | HIGH |
| 5 | Creator Matching Engine | Partial (scoring exists, no dedicated worker) | MEDIUM |
| 6 | Amazon Intelligence Engine | Partial (scan worker scrapes Amazon, stub page) | MEDIUM |
| 7 | Shopify Intelligence Engine | Partial (scan worker scrapes Shopify, stub page) | MEDIUM |
| 8 | Ad Intelligence Engine | Not started | MEDIUM |
| 9 | Opportunity Feed Engine | Not started | HIGH |
| 10 | System Health Monitor | Not started | MEDIUM |

## Data Pipeline

```
Discovery Workers (scheduled via BullMQ)
       ↓
Scraping Workers (Railway — calls Apify/APIs)
       ↓
Product Extraction (parse scraped data)
       ↓
Product Clustering (deduplicate across platforms)
       ↓
Trend Scoring (velocity-based signals)
       ↓
Creator Matching (creator-product fit)
       ↓
Marketplace Matching (TikTok ↔ Amazon ↔ Shopify)
       ↓
Ad Intelligence (detect scaling campaigns)
       ↓
Opportunity Feed (AI-generated insights)
       ↓
Dashboard (API serves stored data ONLY)
```

## Critical Rules

1. **API routes NEVER perform scraping** — they only read from database
2. **All scraping runs in background workers** via Redis queue
3. **Workers run on Railway** independently of the main app
4. **Job scheduling is configurable** through admin UI
5. **All data flows through the pipeline** — no shortcuts
