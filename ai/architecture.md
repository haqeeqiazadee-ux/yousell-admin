# YOUSELL Architecture Reference

**Last Updated:** 2026-03-13
**Source of Truth:** `docs/YouSell_Platform_Technical_Specification_v7.md`

---

## Dual-Platform Architecture

| Platform | Domain | Purpose |
|----------|--------|---------|
| Intelligence Engine | admin.yousell.online | Product discovery, scoring, pipeline management |
| Client SaaS Platform | yousell.online | Subscriber access to curated intelligence + automation |

### Deployment Modes (via `admin_settings` toggle)

| Mode | Description |
|------|-------------|
| `linked` | Both platforms share DB, auth, billing (default) |
| `standalone_intel` | Intelligence engine operates independently (sell to agencies) |
| `standalone_dashboard` | Client dashboard operates independently (white-label) |

Code boundary: `/admin/*` vs `/dashboard/*` with shared logic in `/lib/shared/*`

---

## System Overview

```
Admin Intelligence Engine (Next.js 14 App Router)
        ↓
Next.js API Routes (22 admin + 2 client + 2 auth)
        ↓
Express Backend (auth middleware, rate limiting, CORS, Helmet)
        ↓
BullMQ Job Queue (Redis, concurrency: 2)
        ↓
Scan Worker (sequential platform processing — BUG-050)
        ↓
Apify Actors (8 providers across 7 channels)
        ↓
Supabase PostgreSQL (20 tables + RLS)
        ↓
Realtime Dashboard Updates (debounced 2s refetch)
```

---

## Seven Opportunity Channels

| Channel | Type | Strategy |
|---------|------|----------|
| TikTok Shop | Impulse | Influencer + TikTok Ads + Meta Ads |
| Amazon FBA | Search-driven | PPC + Launch Strategy + Influencer |
| Shopify DTC | Hybrid | Meta + Google + Influencer |
| Pinterest Commerce | Visual discovery | Pinterest Ads + Influencer + SEO |
| Digital Products | Digital | Content + Affiliates + SEO |
| AI Affiliate Programs | Commission | Affiliate promotion + influencer |
| Physical Affiliate | Commission | TikTok Shop + Amazon affiliate products |

---

## Eight Toggleable Engines (per platform)

1. Product Discovery
2. Store Integration
3. Marketing & Ads
4. Content Creation
5. Influencer Outreach (one-click invite)
6. Supplier Intelligence
7. AI Affiliate Revenue
8. Analytics & Profit Tracking

---

## Frontend Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/          # 22 routes (requireAdmin protected)
│   │   ├── auth/           # callback, signout
│   │   └── dashboard/      # products, requests (client-facing)
│   ├── admin/              # Admin pages (admin.yousell.online)
│   └── dashboard/          # Client dashboard pages (yousell.online)
├── lib/
│   ├── auth/               # get-user.ts, roles.ts
│   ├── providers/          # TikTok, Amazon, Pinterest, Shopify, etc.
│   ├── scoring/            # composite.ts, profitability.ts
│   ├── supabase/           # client.ts, server.ts, admin.ts
│   └── types/              # database.ts, product.ts
├── middleware.ts            # Protects /admin/*, /dashboard/*
└── hooks/                  # use-mobile.ts
```

---

## Backend Structure

```
backend/
├── index.ts                # Express server, routes, middleware
└── worker.ts               # BullMQ scan worker
```

---

## User Roles & Auth

| Role | Access |
|------|--------|
| `super_admin` | Full system, deployment mode toggle |
| `admin` | All intelligence features, client management |
| `client` | Dashboard only, scoped allocated products |
| `viewer` | Read-only (safe fallback default) |

**Auth flow:**
1. Supabase Auth (OAuth callback at `/api/auth/callback`)
2. Middleware protects `/admin/*` and `/dashboard/*`
3. API routes use `requireAdmin()` (21/22 routes) or `getUser()`
4. Backend: JWT validation per-request with anon key
5. RLS enforced on every table + `requireAdmin()` + `requireClient()` middleware

---

## Scoring Engine

```
Final Opportunity Score (0–100):
  = (Trend Score × 0.40) + (Viral Score × 0.35) + (Profit Score × 0.25)

Trend Opportunity Score:
  = (TikTok Growth × 0.35) + (Influencer Activity × 0.25) + (Amazon Demand × 0.20)
    + (Competition × −0.10) + (Profit Margin × 0.10)

Early Viral Score:
  = (Micro-Influencer Convergence × 0.25) + (Purchase Intent × 0.20)
    + (Hashtag Acceleration × 0.20) + (Niche Expansion × 0.15)
    + (Engagement Velocity × 0.10) + (Supply Response × 0.10)

Profitability Score:
  = (Profit Margin × 0.40) + (Shipping Feasibility × 0.20)
    + (Marketing Efficiency × 0.20) + (Supplier Reliability × 0.10)
    − (Operational Risk × 0.10)

Tiers:
  HOT   80–100  → push notification, admin email, client allocation queue
  WARM  60–79   → positive badge, client reports
  WATCH 40–59   → archived, monitored 7 days
  COLD  <40     → auto-archive after 90 days
```

### Six Pre-Viral Detection Signals

| Signal | Weight |
|--------|--------|
| Micro-Influencer Convergence (15–20 creators, 5K–150K followers, 48hrs) | 25% |
| Comment Purchase Intent (NLP via Claude Haiku) | 20% |
| Hashtag Acceleration (<50 → 500+ videos/day in 48hrs) | 20% |
| Creator Niche Expansion (1 → 3+ niches in 7 days) | 15% |
| Engagement Velocity (views/likes/comments per hour, first 3–6hrs) | 10% |
| Supply-Side Response (new marketplace listings after social signal) | 10% |

---

## Database Schema

### Existing Tables (20)

| Table | Purpose |
|-------|---------|
| profiles | User profiles + roles |
| admin_settings | Platform configuration + deployment mode |
| clients | Client businesses |
| products | Core product data + scores |
| product_metrics | Product performance metrics |
| viral_signals | Social signal data (7 fields) |
| influencers | Influencer records |
| product_influencers | Product ↔ influencer mapping |
| competitor_stores | Competitor intelligence |
| suppliers | Supplier records |
| product_suppliers | Product ↔ supplier mapping |
| financial_models | Revenue/cost projections |
| launch_blueprints | AI-generated launch plans |
| affiliate_programs | Affiliate program data |
| product_allocations | Client ↔ product assignments |
| product_requests | Client product requests |
| automation_jobs | Scheduled scan config |
| scan_history | Scan job tracking |
| outreach_emails | Influencer outreach tracking |
| notifications | User notifications |
| imported_files | CSV import tracking |
| trend_keywords | Trend keyword data |

**Uniqueness constraints:**
- `products`: UNIQUE(platform, external_id)
- `product_allocations`: UNIQUE(client_id, product_id)
- `influencers`: UNIQUE(username, platform)

### New Tables Required (Phase B–F)

`client_subscriptions`, `client_platform_access`, `client_engine_config`, `client_usage`, `client_addons`, `client_channels`, `content_queue`, `client_orders`, `platform_config`

---

## Providers

| Provider | Source | Method |
|----------|--------|--------|
| TikTok | Apify `clockworks~tiktok-scraper` | Actor run |
| Amazon | RapidAPI + Apify fallback | API + Actor |
| Pinterest | Apify actor | Actor run |
| Shopify | Apify actor | Actor run |
| Trends | Apify actor | Actor run |
| Influencer | Apify Instagram scraper | Actor run |
| Supplier | Apify Alibaba scraper | Actor run |
| Digital | Apify Gumroad scraper | Actor run |

**Fallback chain:** Apify → SerpAPI → RapidAPI → free tier APIs
**Free APIs prioritized:** pytrends → Reddit → TikTok Creative → official APIs

---

## Store Integration APIs (Phase D)

| Platform | API | Auth | Product Push | Orders |
|----------|-----|------|-------------|--------|
| Shopify | Admin GraphQL API | OAuth 2.0 (App) | Products API | Webhooks |
| TikTok Shop | Seller API v2 | OAuth 2.0 | Product Upload | Orders API |
| Amazon | SP-API | OAuth 2.0 | Listings API | Orders + Shipping |

---

## Data Freshness Policy

| Data Type | Max Cache Age |
|-----------|--------------|
| Product listings | 24 hours |
| BSR / Sales estimates | 12 hours |
| Trend keywords | 6 hours |
| Google Trends | 24 hours |
| Influencer metrics | 7 days |
| Competitor stores | 7 days |
| Supplier data | 30 days |

---

## Deployment

- Frontend: Netlify → admin.yousell.online + yousell.online
- Backend: Railway (Express + BullMQ worker + Redis)
- Database: Supabase PostgreSQL
- Payments: Stripe (Phase B)
- Email: Resend API

---

## Architectural Principles (Non-Negotiable)

1. Scraping in background workers only — never inside API handlers
2. API routes serve stored data — never trigger live collection inline
3. Queue-based orchestration via Redis + BullMQ
4. Manual-first cost control — all automation jobs DISABLED by default
5. Persistent system memory — project context in repo files, not chat
6. Context recovery from repo — read continuity files before coding
7. Provider abstraction layer — instant API switching without refactoring
8. Aggressive Supabase caching — check 24hr data before external calls
9. Free APIs prioritized over paid
10. Bulk enrichment only for 60+ products; blueprints only for 75+ on-demand

---

## Performance & Scaling Plan

| Client Count | Action |
|-------------|--------|
| 10 | Enable Redis caching for dashboard queries |
| 50 | Add DB indexes on products(platform, final_score, name) |
| 100 | Parallelize worker scraping with Promise.all() |
| 500 | Dedicated Redis instance |
| 1000+ | Railway autoscaling + Supabase Pro |

---

## Monthly Cost Estimates

| Stage | Clients | Cost | Primary Driver |
|-------|---------|------|----------------|
| Build phase | 0 | $0–5 | Claude tokens only |
| Early | 1–5 | $15–35 | Apify + Claude per manual scan |
| Growth | 5–20 | $35–80 | Daily auto scans, 2–3 channels |
| Scale | 20+ | $80–200 | All channels daily |
