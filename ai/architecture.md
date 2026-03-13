# YOUSELL Architecture Reference

**Last Updated:** 2026-03-13

---

## System Overview

```
Admin Dashboard (Next.js 14 App Router)
        ↓
Next.js API Routes (22 admin + 2 client + 2 auth)
        ↓
Express Backend (auth middleware, rate limiting, CORS, Helmet)
        ↓
BullMQ Job Queue (Redis, concurrency: 2)
        ↓
Scan Worker (sequential platform processing)
        ↓
Apify Actors (TikTok, Amazon, Pinterest, Shopify, Trends)
        ↓
Supabase PostgreSQL (products, scan_history, raw_listings, etc.)
        ↓
Realtime Dashboard Updates (debounced 2s refetch)
```

---

## Frontend Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/          # 22 routes (requireAdmin protected)
│   │   ├── auth/           # callback, signout
│   │   └── dashboard/      # products, requests (client-facing)
│   ├── admin/              # Admin pages
│   └── dashboard/          # Client dashboard pages
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

## Auth Flow

1. Supabase Auth (OAuth callback at `/api/auth/callback`)
2. Middleware protects `/admin/*` and `/dashboard/*`
3. API routes use `requireAdmin()` (21/22 routes) or `getUser()`
4. Roles: `admin`, `client`, `viewer` (default)
5. Backend: JWT validation per-request with anon key

---

## Scoring Engine

```
Final Score = Trend(0.40) + Viral(0.35) + Profit(0.25)

Tiers:
  HOT   ≥ 80
  WARM  ≥ 60
  WATCH ≥ 40
  COLD  < 40
```

---

## Key Tables

| Table | Purpose |
|-------|---------|
| products | Core product data + scores |
| scan_history | Scan job tracking |
| raw_listings | Raw scraped data |
| profiles | User profiles + roles |
| admin_settings | Platform configuration |
| product_allocations | Client ↔ product assignments |
| launch_blueprints | AI-generated launch plans |
| financial_models | Revenue/cost projections |
| viral_signals | Social signal data |
| automation_jobs | Scheduled scan config |
| notifications | User notifications |
| competitors | Competitor store data |
| influencers | Influencer records |
| suppliers | Supplier records |

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

---

## Deployment

- Frontend: Netlify (considering Vercel migration)
- Backend: Railway (considering Render migration)
- Database: Supabase
- Queue: Redis (considering Upstash)
