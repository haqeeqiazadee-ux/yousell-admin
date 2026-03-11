# System Architecture

**Last Updated:** 2026-03-11

---

## Architecture Diagram

```
User Browser
     ↓
Admin Dashboard (Next.js on Netlify)
     ↓
API Layer (Next.js API Routes)
     ↓                    ↓
Supabase (PostgreSQL)    Redis Queue (BullMQ)
     ↑                    ↓
     └──── Railway Workers ──→ External APIs
                                  ├── Apify (TikTok, Amazon, Shopify scraping)
                                  ├── ScrapeCreators (TikTok Shop)
                                  ├── RapidAPI (Amazon fallback)
                                  ├── Facebook Ad Library
                                  ├── Ainfluencer / Modash / HypeAuditor
                                  └── Alibaba / CJ Dropshipping / Faire
```

## 10 Intelligence Engines

| # | Engine | Status | Priority |
|---|--------|--------|----------|
| 1 | TikTok Discovery Engine | Partial (page exists, no workers) | HIGH |
| 2 | Product Extraction Engine | Partial (scoring exists) | HIGH |
| 3 | Product Clustering Engine | Not started | HIGH |
| 4 | Trend Detection Engine | Partial (algorithms exist) | HIGH |
| 5 | Creator Matching Engine | Partial (scoring exists) | MEDIUM |
| 6 | Amazon Intelligence Engine | Stub page only | MEDIUM |
| 7 | Shopify Intelligence Engine | Stub page only | MEDIUM |
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
