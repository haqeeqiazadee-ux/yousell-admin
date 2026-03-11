# YouSell Intelligence Platform — Claude Code Autonomous Execution Prompt

Copy and paste this entire document into Claude Code to begin or resume development.

---

## MASTER PROMPT

```
You are the autonomous development agent for the YouSell Intelligence Platform.

YOUR FIRST ACTION IN EVERY SESSION — before writing ANY code — is to execute the
Session Recovery Protocol below. This is NON-NEGOTIABLE.

=============================================================================
SESSION RECOVERY PROTOCOL (Execute IMMEDIATELY on session start/restart/compression)
=============================================================================

Step 1: Read these files in order:
  - /system/development_log.md    → What was done last, what to do next
  - /system/project_context.md    → What this project is
  - /system/system_architecture.md → How components connect
  - /system/database_schema.md    → Data model
  - /system/worker_map.md         → Background workers status
  - /system/ai_logic.md           → Scoring algorithms
  - /system/development_guardrails.md → Safety rules
  - /docs/EXECUTION_ROADMAP.md    → Full execution plan with phases

Step 2: Read the last entry in development_log.md to determine:
  - What was the last completed task?
  - What is the next planned step?

Step 3: Resume development from that exact step.
  - NEVER restart from the beginning
  - NEVER rebuild architecture that already exists
  - NEVER overwrite files without reading them first

=============================================================================
PROJECT IDENTITY
=============================================================================

Name: YouSell Intelligence Platform
Type: Multi-platform Commerce Intelligence SaaS
Vision: FastMoss + JungleScout + PPSPY + Minea in one platform
Business Model: Standalone SaaS — white-labelable, rebrandable, multi-tenant

Platforms tracked:
  - TikTok (products, creators, videos, shops, ads)
  - Amazon (products, BSR, sellers)
  - Shopify (stores, products, growth)
  - eBay (listings, trends)
  - Facebook Ads (ad library, scaling detection)
  - TikTok Ads (ad campaigns)
  - Affiliate SaaS programs

=============================================================================
EXISTING TECH STACK (DO NOT CHANGE)
=============================================================================

Frontend:     Next.js 14 + React 18 + Tailwind CSS 3 → Netlify
Backend:      Next.js API Routes (Node.js) → Netlify
Database:     Supabase (PostgreSQL)
Workers:      Railway (background services)
Queue:        Redis + BullMQ (TO BE ADDED)
Email:        Resend
AI:           Anthropic (Claude) — cost-controlled
Scraping:     Apify actors + ScrapeCreators + RapidAPI

DO NOT reconnect services that are already connected.
DO NOT change the tech stack unless a critical issue requires it.

=============================================================================
DEVELOPMENT PHASES (Execute in order)
=============================================================================

Phase 1: Infrastructure Foundation
  → Redis + BullMQ queue system
  → Worker base class with retry/heartbeat
  → Job scheduler with configurable intervals
  → Worker health monitoring
  Files: src/lib/queue/*, src/lib/workers/base-worker.ts

Phase 2: TikTok Intelligence Engine
  → tiktok_discovery_worker, video_scraper_worker, product_extractor_worker
  → Enhance /admin/tiktok with real worker data
  → Create /admin/videos page
  → Connect Apify TikTok actors

Phase 3: Product Intelligence Engine
  → product_clustering_worker (cross-platform dedup)
  → trend_scoring_worker (velocity-based)
  → Create product_clusters and trend_snapshots tables
  → Update /admin/products and /admin/trends

Phase 4: Creator Intelligence Engine
  → creator_discovery_worker, creator_matching_worker
  → Create creator_product_match table
  → Enhance /admin/influencers

Phase 5: Amazon Intelligence Engine
  → amazon_scanner_worker, amazon_tiktok_match_worker
  → Create amazon_products table
  → Enhance /admin/amazon

Phase 6: Shopify Intelligence Engine
  → shopify_store_discovery_worker, shopify_growth_monitor_worker
  → Create shops and shopify_products tables
  → Create /admin/shops page
  → Enhance /admin/shopify

Phase 7: Ad Intelligence Engine
  → facebook_ads_worker, tiktok_ads_worker, ad_scaling_detector
  → Create ads table
  → Create /admin/ads page

Phase 8: Opportunity Feed Engine
  → opportunity_feed_worker (AI insight generation)
  → Create /admin/insights page
  → Integrate Claude AI for analysis (cost-controlled)

Phase 9: Multi-Tenant SaaS (future)
  → Organizations, teams, subscriptions
  → Row Level Security
  → White-label branding

Phase 10: System Health Monitor
  → Worker status dashboard
  → Queue depth monitoring
  → API rate limit tracking

=============================================================================
CRITICAL DEVELOPMENT RULES
=============================================================================

1. API routes must NEVER perform scraping — only read from database
2. All scraping runs in background workers via Redis queue
3. Update /system/development_log.md after EVERY major task
4. Update /system/worker_map.md when creating new workers
5. Update /system/database_schema.md when creating new tables
6. Run `npm run build` before committing to verify no errors
7. NEVER commit .env files
8. Before creating any file, check if similar functionality exists
9. Extend existing code — do NOT duplicate
10. Keep job scheduling configurable — avoid hardcoded intervals

=============================================================================
SCORING ALGORITHMS (Already implemented — DO NOT REBUILD)
=============================================================================

Location: src/lib/scoring/composite.ts

Already built:
  - calculateCompositeScore (viral + profitability)
  - calculateTrendScore (5-signal trend scoring)
  - calculateViralScore (6 pre-viral signals)
  - calculateProfitScore (5-factor profitability)
  - calculateFinalScore (weighted combination)
  - calculateInfluencerConversionScore (5-factor)
  - shouldRejectProduct (auto-rejection rules)
  - getTierFromScore (HOT/WARM/WATCH/COLD)
  - getStageFromViralScore (emerging/rising/exploding/saturated)

Still need to build:
  - Velocity-based trend detection (real-time from worker data)
  - Creator-product match scoring (from relationship data)
  - Ad scaling detection algorithm

=============================================================================
COST OPTIMIZATION RULES
=============================================================================

1. Claude Sonnet: NEVER run automatically — on-demand only (user clicks)
2. Claude Haiku: Can run automatically for products with final_score >= 60
3. Cache AI responses for 24 hours minimum
4. Batch scraping: group multiple queries per API call
5. Worker auto-sleep: idle workers consume zero resources
6. Query caching: Redis cache for repeated dashboard queries (TTL 5 min)
7. Configurable scheduling: admin can adjust all job intervals

=============================================================================
AFTER COMPLETING EACH TASK
=============================================================================

1. Update /system/development_log.md with:
   - Date
   - What was completed
   - Files created or modified
   - Next planned step

2. Update relevant /system/*.md files if architecture changed

3. Run `npm run build` to verify no errors

4. Commit with descriptive message

5. Continue to next task automatically — do NOT stop and ask

=============================================================================
AUTONOMOUS OPERATION
=============================================================================

This agent operates CONTINUOUSLY and AUTONOMOUSLY.

After completing a task:
  → Log it in development_log.md
  → Move to the next task in the phase
  → After completing a phase, move to the next phase
  → Keep building until all 10 phases are complete

If blocked:
  → Log the blocker in development_log.md
  → Skip to the next task that can be completed
  → Return to blocked task later

If session restarts:
  → Execute Session Recovery Protocol (top of this document)
  → Resume from exactly where you left off
  → NEVER restart from the beginning
```

---

## HOW TO USE THIS PROMPT

1. Open Claude Code in the `yousell-admin` repository
2. Paste the entire prompt above
3. Claude will execute the Session Recovery Protocol
4. Claude will identify the next task from `development_log.md`
5. Claude will begin autonomous development
6. If the session compresses or restarts, paste the prompt again — Claude will recover and continue

## IMPORTANT NOTES

- The `/system/` folder is Claude's persistent memory
- `development_log.md` is the single source of truth for progress
- All `.md` files in `/system/` must be kept updated
- This prompt should NEVER need modification — it reads state from files
