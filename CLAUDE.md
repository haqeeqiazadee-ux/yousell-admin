# CLAUDE.md — YouSell Admin

Always read this file and the `/ai` directory before performing development tasks.

## Project Overview

YouSell Admin is a product discovery and management platform for e-commerce. It scrapes trending products from social media/marketplace platforms, scores them using a composite algorithm, and presents curated recommendations to clients.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind CSS 3, shadcn/ui
- **Backend**: Express.js + BullMQ (Redis job queue), Node.js 20
- **Database**: Supabase (PostgreSQL + Auth + Realtime + RLS)
- **Deployment**: Netlify (frontend), Railway (backend), Supabase Cloud (DB)
- **Email**: Resend
- **Scraping**: Apify actors (intended), provider abstraction layer
- **AI**: Claude API (Anthropic) — Haiku for score >= 60, Sonnet on-demand only for >= 75

## System Architecture

```
Netlify (Next.js 14)  →  Railway (Express + BullMQ)  →  Supabase (PostgreSQL)
     ↕ API Routes           ↕ Job Queue                    ↕ Auth + RLS
  /api/admin/*            scan worker                    20+ tables
  /api/dashboard/*        Apify integration (TODO)       Realtime subscriptions
```

## Key Directories

| Path | Purpose |
|------|---------|
| `src/app/admin/` | 21 admin pages |
| `src/app/api/admin/` | 22 admin API routes |
| `src/app/dashboard/` | Client-facing dashboard |
| `src/lib/providers/` | Platform provider abstraction (7 providers) |
| `src/lib/scoring/` | Composite scoring engine (trend/viral/profit) |
| `src/lib/supabase/` | Supabase client factories (server, client, admin) |
| `src/lib/auth/` | Auth helpers (get-user, roles, requireAdmin) |
| `src/components/` | Shared components + shadcn/ui |
| `backend/src/` | Express server, BullMQ worker, services |
| `supabase/migrations/` | Database schema migrations |
| `ai/` | Project memory files for AI development sessions |

## Supabase Schema (Source of Truth)

Primary schema: `supabase/migrations/005_complete_schema.sql`
Consolidated: `supabase/migrations/CONSOLIDATED_MIGRATION.sql`

Core tables: `profiles`, `products`, `product_metrics`, `viral_signals`, `influencers`, `product_influencers`, `competitor_stores`, `suppliers`, `product_suppliers`, `financial_models`, `marketing_strategies`, `launch_blueprints`, `affiliate_programs`, `clients`, `product_allocations`, `product_requests`, `automation_jobs`, `scan_history`, `outreach_emails`, `notifications`, `imported_files`, `trend_keywords`

## Scoring System

3-pillar composite scoring per build brief:
- **Final Score** = Trend×0.40 + Viral×0.35 + Profit×0.25
- **Tier**: HOT >= 80, WARM >= 60, WATCH >= 40, COLD < 40
- **Trend stages**: emerging (40-59), rising (60-79), exploding (80+), saturated (<40)
- **AI insights**: Haiku for final_score >= 60, Sonnet on-demand for >= 75 (NEVER automatic)
- **Auto-rejection**: margin < 40%, shipping > 30%, break-even > 2mo, fragile w/o cert, no US delivery < 15 days

Implementation: `src/lib/scoring/composite.ts`

## Environment Variables

### Frontend (.env.local)
Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
Backend URL: `NEXT_PUBLIC_BACKEND_URL`
Provider selection: `TIKTOK_PROVIDER`, `AMAZON_PROVIDER`, etc.
API keys: `APIFY_API_TOKEN`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`
See `.env.local.example` for full list.

### Backend (.env)
Required: `PORT`, `REDIS_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `API_SECRET`
Optional: `ANTHROPIC_API_KEY`, `APIFY_API_TOKEN`
See `backend/.env.example` for full list.

## Key Backend Scripts

| File | Responsibility |
|------|---------------|
| `backend/src/index.ts` | Express server with auth middleware, rate limiting, scan API endpoints |
| `backend/src/worker.ts` | BullMQ worker — processes scan jobs (needs update to 3-pillar scoring) |
| `backend/src/lib/supabase.ts` | Supabase admin client (service role) |
| `backend/src/lib/queue.ts` | BullMQ Redis connection |
| `backend/src/lib/email.ts` | Resend email service (scan alerts, product alerts) |
| `backend/src/lib/providers.ts` | Platform scraping (currently placeholder URLs) |
| `backend/src/lib/scoring.ts` | Legacy scoring (frontend composite.ts is authoritative) |

## Development Rules

1. All admin API routes must call `requireAdmin()` before processing
2. Use `import 'server-only'` in any file accessing `SUPABASE_SERVICE_ROLE_KEY`
3. Never call Claude Sonnet automatically — on-demand only
4. All automation jobs default to disabled; respect master kill switch
5. Use Supabase upsert with conflict keys to prevent duplicate products
6. After completing tasks, update `/ai/project_state.md` and `/ai/task_board.md`

## Current Development Priorities

See `/ai/task_board.md` for the full task board.

Top priorities:
1. Build Apify integration and data sync pipeline
2. Add admin role checks to all API routes
3. Update backend worker to 3-pillar scoring
4. Replace provider placeholder URLs with real Apify actors
5. Fix remaining QA issues from `YOUSELL_QA_FINAL_REPORT.md`
