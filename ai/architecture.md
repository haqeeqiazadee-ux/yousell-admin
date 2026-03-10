# YouSell Admin — Architecture Reference

Last updated: 2026-03-10

## System Overview

YouSell Admin is a product discovery and management platform for e-commerce operators. It scrapes trending products from social media and marketplace platforms, scores them using a composite algorithm, and presents curated product recommendations to clients through an admin dashboard.

## Tech Stack

| Layer | Technology | Deployment |
|-------|-----------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, shadcn/ui | Netlify |
| Backend | Express.js, BullMQ (Redis job queue), Node.js 20 | Railway (Docker) |
| Database | Supabase (PostgreSQL + Auth + Realtime + RLS) | Supabase Cloud |
| Email | Resend | SaaS |
| Scraping | Apify (intended), provider abstraction layer | Apify Cloud |
| AI | Claude API (Anthropic) for product insights | API |

## Architecture Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Netlify    │     │    Railway       │     │   Supabase   │
│  (Frontend)  │────▶│   (Backend)      │────▶│  (Database)  │
│  Next.js 14  │     │  Express+BullMQ  │     │  PostgreSQL  │
└──────┬───────┘     └───────┬──────────┘     └──────────────┘
       │                     │                        ▲
       │  API Routes         │  Job Queue             │
       │  (/api/admin/*)     │                        │
       ▼                     ▼                        │
┌──────────────┐     ┌──────────────┐                 │
│  Provider    │     │   Apify      │─────────────────┘
│  Abstraction │     │   Actors     │  (intended data flow)
└──────────────┘     └──────────────┘
```

## Key Directory Structure

```
yousell-admin/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # 21 admin pages
│   │   ├── dashboard/          # Client-facing dashboard
│   │   ├── api/                # 26 API routes
│   │   └── login/              # Auth pages
│   ├── components/             # React components + shadcn/ui
│   ├── lib/
│   │   ├── auth/               # Auth helpers (get-user, roles)
│   │   ├── providers/          # Platform provider abstraction (7 providers)
│   │   ├── scoring/            # Composite scoring engine
│   │   ├── supabase/           # Supabase client factories
│   │   └── types/              # TypeScript type definitions
│   └── middleware.ts           # Supabase auth + role-based routing
├── backend/
│   └── src/
│       ├── index.ts            # Express server (auth, rate limiting, scan API)
│       ├── worker.ts           # BullMQ scan worker
│       └── lib/                # Backend services (email, queue, supabase, scoring)
├── supabase/
│   └── migrations/             # 10+ SQL migration files (20+ tables)
└── ai/                         # Project memory for AI sessions
```

## Scoring System (3-Pillar Composite)

The spec defines a 3-pillar scoring system:

- **Trend Score** = tiktokGrowth×0.35 + influencerActivity×0.25 + amazonDemand×0.20 + competition×(-0.10) + profitMargin×0.10
- **Early Viral Score** = microInfluencerConvergence×0.25 + commentPurchaseIntent×0.20 + hashtagAcceleration×0.20 + creatorNicheExpansion×0.15 + engagementVelocity×0.10 + supplySideResponse×0.10
- **Profit Score** = profitMargin×0.40 + shippingFeasibility×0.20 + marketingEfficiency×0.20 + supplierReliability×0.10 - operationalRisk×0.10
- **Final Score** = Trend×0.40 + Viral×0.35 + Profit×0.25

Tier classification: HOT >= 80, WARM >= 60, WATCH >= 40, COLD < 40

## Database Tables (Supabase)

Core tables from migrations:
- `profiles` — Auth user profiles with roles (admin/super_admin/client)
- `products` — Central product table with scoring columns
- `product_metrics` — Time-series product metrics
- `viral_signals` — 6 pre-viral signal columns per product
- `influencers` — Influencer profiles with tier classification
- `product_influencers` — Product-influencer match with outreach status
- `competitor_stores` — Competitor analysis data
- `suppliers` — Supplier profiles (Alibaba, CJ, etc.)
- `product_suppliers` — Product-supplier relationships
- `financial_models` — Financial analysis per product
- `marketing_strategies` — AI-generated marketing strategies
- `launch_blueprints` — AI-generated launch blueprints
- `affiliate_programs` — Affiliate program tracking
- `clients` — Client accounts with plan tiers
- `product_allocations` — Products allocated to clients (with visibility)
- `product_requests` — Client product requests
- `automation_jobs` — 11 scheduled jobs (all disabled by default)
- `scan_history` — Scan execution log
- `outreach_emails` — Influencer outreach tracking
- `notifications` — User notification system
- `imported_files` — Bulk import tracking
- `trend_keywords` — Trend keyword tracking

## Authentication Flow

1. User visits `/admin` → middleware checks Supabase session
2. No session → redirect to `/admin/login`
3. Session exists → check `profiles.role` for admin/super_admin
4. Non-admin → should redirect to `/admin/unauthorized` (currently redirects to login)
5. Admin → render admin layout with sidebar

## Provider Abstraction

Each platform has a provider module in `src/lib/providers/`:
- Provider selection via env vars (e.g., `TIKTOK_PROVIDER=apify`)
- Cache-before-API pattern with 24h TTL
- Fallback to mock/empty data when API keys missing

## Environment Variables

See `.env.local.example` for all frontend vars and `backend/.env.example` for backend vars.
Critical vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APIFY_API_TOKEN`, `RESEND_API_KEY`
