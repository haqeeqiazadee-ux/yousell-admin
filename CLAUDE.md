# YOUSELL Intelligence Platform — Claude Code Instructions

## SESSION START PROTOCOL (MANDATORY)

Before writing ANY code, read these files in order:
1. `/system/development_log.md` — Last completed task + next step
2. `/system/project_context.md` — What this project is
3. `/system/system_architecture.md` — Architecture diagram
4. `/system/database_schema.md` — Data model
5. `/system/worker_map.md` — Worker status
6. `/system/ai_logic.md` — Scoring algorithms
7. `/system/development_guardrails.md` — Safety rules

Resume from the last entry in development_log.md. NEVER restart from scratch.

If chat history becomes compressed or context appears incomplete,
Claude must immediately re-read the files above and continue from development_log.md.


------------------------------------------------
PROJECT PURPOSE
------------------------------------------------

YOUSELL is an AI-powered product discovery and intelligence platform.

The system identifies trending e-commerce products across multiple marketplaces,
analyzes product viability, and generates actionable insights for product launches.

Primary Users:
- Admin operators managing product discovery scans
- Client businesses receiving curated product opportunities

Core Capabilities:
- Automated product discovery across TikTok, Amazon, Shopify, Pinterest
- AI-assisted product scoring (3-pillar model)
- Influencer and supplier analysis
- Product launch blueprint generation
- Client product allocation

Business Model: Standalone SaaS — white-labelable, rebrandable, multi-tenant


------------------------------------------------
TECHNOLOGY STACK
------------------------------------------------

Frontend:
- Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- Deployed on Netlify

Backend API (Dashboard):
- Next.js API Routes (Netlify serverless)
- Handles CRUD operations, auth, dashboard data

Backend Services (Workers):
- Express server at `/backend/` (Railway, port 4000)
- BullMQ job queue + Redis
- Scan worker processes TikTok, Amazon, Shopify, Pinterest, Trends

Database:
- Supabase PostgreSQL + Auth + Realtime

Scraping:
- Apify Actors (primary)
- ScrapeCreators, RapidAPI (fallbacks)

AI: Anthropic Claude API (cost-controlled)
Email: Resend API


------------------------------------------------
SYSTEM ARCHITECTURE
------------------------------------------------

```
Admin Dashboard (Next.js on Netlify)
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
           └──── BullMQ Worker ──→ Apify Actors → Dataset → Products
```


------------------------------------------------
EXISTING BACKEND (DO NOT REBUILD)
------------------------------------------------

The `/backend/` directory already has:
- `backend/src/index.ts` — Express server with auth, rate limiting, CORS
- `backend/src/worker.ts` — BullMQ scan worker (scrapes all platforms)
- `backend/src/lib/queue.ts` — Redis/BullMQ connection
- `backend/src/lib/supabase.ts` — Supabase client
- `backend/src/lib/providers.ts` — Platform scraping providers
- `backend/src/lib/scoring.ts` — Composite score calculation
- `backend/src/lib/email.ts` — Scan/product alerts via Resend

**All new workers MUST be added to `/backend/src/`. Do NOT rebuild the queue.**


------------------------------------------------
DATA INGESTION PIPELINE
------------------------------------------------

Stage 1 — Actor Execution: Trigger Apify actors to scrape external sources
Stage 2 — Dataset Retrieval: Fetch dataset results from actor run
Stage 3 — Raw Data Storage: Store in raw_listings table
Stage 4 — Data Transformation: Normalize into structured product entries
Stage 5 — Product Scoring: Apply 3-pillar scoring engine
Stage 6 — Database Upsert: Insert/update products table


------------------------------------------------
SCORING ENGINE
------------------------------------------------

Final Score Formula:
final_score = trend_score × 0.40 + viral_score × 0.35 + profit_score × 0.25

Score Tiers:
- HOT  ≥ 80
- WARM ≥ 60
- COLD < 60


------------------------------------------------
DATABASE SOURCE OF TRUTH
------------------------------------------------

Primary Table: `products`
Key Fields: id, title, platform, external_id, price, cost, trend_score, viral_score, profit_score, final_score, created_at
Uniqueness: UNIQUE(platform, external_id)

Raw Ingestion Table: `raw_listings`
Fields: id, platform, actor_run_id, raw_json, created_at


------------------------------------------------
CORE RULES
------------------------------------------------

1. API routes NEVER perform scraping — only read from database
2. All scraping runs in background workers via Redis queue
3. Update `/system/development_log.md` after every major task
4. Before creating files, check if similar functionality exists
5. NEVER commit .env files
6. Run `npm run build` before committing
7. Keep job scheduling configurable
8. Use the existing Supabase singleton client
9. Use Apify actors as the primary scraping method
10. Ensure compatibility with Netlify deployment constraints


------------------------------------------------
KEY DIRECTORIES
------------------------------------------------

```
src/app/admin/       — Dashboard pages (25 pages)
src/app/api/         — Next.js API routes (27+ endpoints)
src/lib/scoring/     — Scoring algorithms (DO NOT REBUILD)
src/lib/providers/   — API provider configs
src/components/      — Reusable React components
backend/src/         — Express server + BullMQ workers
backend/src/lib/     — Queue, supabase, providers, scoring, email
system/              — Session maintenance files (Claude memory)
docs/                — Project documentation
supabase/migrations/ — Database migrations
```


------------------------------------------------
DEVELOPMENT PHASES
------------------------------------------------

See `/docs/EXECUTION_ROADMAP.md` for full 10-phase plan.
See `/docs/CLAUDE_CODE_PROMPT.md` for autonomous execution prompt.

Current phase: Check `/system/development_log.md` for latest status.


------------------------------------------------
TASK EXECUTION PRINCIPLES
------------------------------------------------

Claude must complete tasks sequentially.

After completing each task:
1. Update `/system/development_log.md`
2. Commit changes
3. Continue to the next task from the roadmap

Claude must never restart the project from scratch.
