# QA Phase 2 — Discrepancies & Technical Gaps

> **Reviewer**: Senior Software Architect
> **Source**: `ai/qa_brief_summary.md` (Phase 1 output)
> **Date**: 2026-03-11

---

## Section 1: Discrepancies Found

### D-1: Ghost Workers — Google Trends and YouTube workers promised but never defined

**Where**: Section 2 (Platform Scope table) vs Section 11 (Worker System)
**Issue**: The Platform Scope table explicitly lists "Google Trends — 1 worker (SerpAPI)" and "YouTube — 1 worker" as data sources. But the Worker System (Section 11) defines exactly 18 workers, and neither a `google_trends_worker` nor a `youtube_worker` appears. The execution prompt also lists `SERPAPI_KEY` and `YOUTUBE_API_KEY` as "still needed" — confirming the intent exists but the implementation spec doesn't.
**Severity**: CRITICAL
**Recommended Fix**: Either (a) define both workers fully in Section 11 with trigger, priority, budget, and API, or (b) remove them from the platform scope table and API key list. They cannot be half-specified — a developer will either build them blind or skip them entirely.

---

### D-2: Worker count mismatch — "18 workers" claimed but 20 implied

**Where**: Section 5 (Tech Stack: "18 scraping + intelligence workers") vs Section 2 (Platform Scope: 7+3+2+1+1+1+1+1 = 17 platform workers) vs Section 11 (18 defined workers)
**Issue**: The tech stack says 18 workers. Section 11 defines exactly 18. But the platform scope table implies 17 platform-level workers PLUS the 2 ghost workers (Google Trends + YouTube) = 19. Additionally, some Section 11 workers (product_extractor, trend_scoring, predictive_discovery, platform_profitability_scorer, system_health_monitor) are internal/intelligence workers not tied to a single platform, so the platform-scope count and the worker-system count measure different things. This makes it unclear whether "18" is correct.
**Severity**: MEDIUM
**Recommended Fix**: Add a definitive worker registry table that reconciles all counts. Clearly separate "scraping workers" (external API calls) from "intelligence workers" (internal processing) from "system workers" (health monitoring). State the final canonical count.

---

### D-3: Moat feature phasing contradicts moat prioritisation advice

**Where**: Section 1 (Issue #7 fix: "Pre-trend engine, cross-platform correlation graph, and creator outreach automation are the moat. These must be Phase 1 priorities") vs Section 3 (Moat table: Cross-Platform Graph = Phase 2, Creator Outreach = Phase 3)
**Issue**: The architect review in Section 1 explicitly says moat features "must be Phase 1 priorities, not Phase 3." But the moat table in Section 3 schedules Cross-Platform Intelligence Graph for Phase 2 and Creator Outreach for Phase 3. Only the Pre-Trend Engine is actually Phase 1. The document contradicts its own most emphatic recommendation.
**Severity**: HIGH
**Recommended Fix**: Either (a) move cross-platform graph and creator outreach to Phase 1 as the architect demanded, or (b) revise the Section 1 commentary to accurately reflect the phasing. The current state undermines the architect review's credibility.

---

### D-4: CLAUDE.md scoring model contradicts v5 scoring model

**Where**: CLAUDE.md (Scoring Engine section) vs Brief Section 12 (Intelligence Engine Algorithms)
**Issue**: CLAUDE.md defines a 3-pillar scoring model: `final_score = trend_score × 0.40 + viral_score × 0.35 + profit_score × 0.25` with tiers HOT ≥ 80, WARM ≥ 60, COLD < 60. The v5 brief defines 4 separate scoring algorithms (Trend, Predictive, Creator-Match, Platform Profitability) with completely different formulas, variables, and thresholds. There is no `viral_score` or `profit_score` in v5. There is no `final_score` composite in v5. The two systems are architecturally incompatible.
**Severity**: CRITICAL
**Recommended Fix**: v6.0 must declare one canonical scoring system. The v5 4-algorithm approach is far more detailed and useful. CLAUDE.md's 3-pillar model should be deprecated and replaced. If a composite `final_score` is still desired, define it explicitly using the v5 scores as inputs.

---

### D-5: `raw_listings` table in CLAUDE.md missing from v5 schema

**Where**: CLAUDE.md (Database Source of Truth: `raw_listings` table) vs Brief Section 10 (Database Schema)
**Issue**: CLAUDE.md defines a `raw_listings` table with fields `id, platform, actor_run_id, raw_json, created_at`. This table does not appear in the v5 database schema (Section 10) at all. The v5 architecture flow mentions `raw_listings` conceptually in the architecture flow but never defines it as a table.
**Severity**: HIGH
**Recommended Fix**: Add `raw_listings` to the v6 schema with full field definitions, tenant_id, and RLS policy. The data ingestion pipeline depends on it (Stage 3: Raw Data Storage).

---

### D-6: `platform_configs` table referenced in Issue #2 fix but never defined

**Where**: Section 1 (Issue #2 fix: "platform_configs table allows per-tenant API keys and branding") vs Section 10 (Database Schema)
**Issue**: The architect review says there's a `platform_configs` table for per-tenant API keys and branding. This table doesn't exist in the schema. The `tenants` table has `api_keys jsonb` and `brand_config jsonb` which partially covers this, but there's no dedicated `platform_configs` table.
**Severity**: MEDIUM
**Recommended Fix**: Clarify whether per-tenant API keys live in `tenants.api_keys` (as the schema implies) or in a separate `platform_configs` table (as the architect review states). Pick one and document it consistently.

---

### D-7: Budget table in Section 4.5 only lists 6 workers but 12+ workers make external calls

**Where**: Section 4.5 (Cost Budget System: 6 workers listed) vs Section 11 (Worker System: 12+ workers with external APIs)
**Issue**: The budget table explicitly lists daily budgets for only 6 workers: tiktok_discovery, video_scraper, creator_monitor, amazon_bsr_scanner, shopify_store_discovery, facebook_ads. But Section 11 shows at least 12 workers making external API calls (add: hashtag_scanner, tiktok_live, tiktok_ads, shopify_growth_monitor, reddit_trend, pinterest_trend). Additionally, predictive_discovery (50 Anthropic calls) and platform_profitability_scorer (30 Anthropic calls) have budgets in Section 11 but not in Section 4.5.
**Severity**: HIGH
**Recommended Fix**: Section 4.5's budget table must include ALL workers that make external API calls. Currently half the workers could run without budget enforcement.

---

### D-8: Idle refresh rotation lists 5 platforms but Section 11 has workers for more

**Where**: Section 4.3 (Rotation: TikTok → Amazon → Shopify → Reddit → Pinterest) vs Section 11 (also: Facebook Ads, YouTube, Google Trends)
**Issue**: The idle refresh rotation explicitly lists 5 platforms and calculates max staleness as "3h × 5 platforms = max 15h". But the platform scope includes Facebook/Instagram, YouTube, and Google Trends. These are excluded from idle refresh, meaning their data can go stale indefinitely unless a user clicks into them.
**Severity**: MEDIUM
**Recommended Fix**: Either expand the rotation to include all platforms, or explicitly document that Facebook/Instagram, YouTube, and Google Trends data only refreshes on user demand and explain why.

---

### D-9: Row 4 is "TikTok Shops" — what shows for Amazon-sourced or Shopify-sourced products?

**Where**: Section 7 (7-row chain: Row 4 = "TikTok Shops") vs Section 7 intro ("Chain parity across TikTok, Amazon, and Shopify is a non-negotiable requirement")
**Issue**: Row 4 is hardcoded as "TikTok Shops (selling this product, with full marketing stats)". But the brief demands chain parity — Amazon-sourced products and Shopify-sourced products must show the same 7 rows. What does Row 4 show for a product discovered on Amazon that has no TikTok shop presence? Empty state? Different data? The row is TikTok-specific by definition, which breaks the parity promise.
**Severity**: HIGH
**Recommended Fix**: Rename Row 4 to "Marketplace Shops" or "Sales Channels (Primary)" and define what it shows per source platform. For Amazon products: show Amazon seller stats. For Shopify products: show Shopify store stats. TikTok Shops becomes a sub-case.

---

### D-10: Predictive engine is both "always P1" and "fires every 2h" — contradicts demand-driven model

**Where**: Section 4 (Smart Scraping: "Workers NEVER run on fixed schedules") vs Section 11 (predictive_discovery_worker: "Fires every 2h via scheduler") vs Guardrail #2 ("No cron loops calling external APIs")
**Issue**: The entire smart scraping architecture is built on the premise that workers never run on schedules — only on user demand (P0), alert breaches (P1), or idle refresh (P2). But the predictive_discovery_worker explicitly runs on a 2-hour schedule, violating the core architectural principle. The guardrails even say "No cron loops calling external APIs" and the predictive worker calls the Anthropic API. The brief acknowledges this exception in the execution prompt ("except predictive engine") but it's a fundamental contradiction that needs to be clearly architected, not hand-waved.
**Severity**: MEDIUM
**Recommended Fix**: Explicitly carve out the predictive engine as a documented exception to the demand-driven model. Explain WHY it needs a schedule (pre-trend detection requires proactive analysis, not reactive). Define it as a "Proactive Intelligence Worker" category distinct from demand-driven workers.

---

### D-11: Saturation Score referenced in UI but never defined as an algorithm

**Where**: Section 7 Row 2 ("Saturation Score") + Section 10 products table ("saturation_score") vs Section 12 (only 4 algorithms defined, none compute saturation)
**Issue**: The product card (Row 2) displays a "Saturation Score" and the products table has a `saturation_score` field. But Section 12 defines only 4 algorithms: Trend Score, Predictive Score, Creator-Product Match Score, and Platform Profitability Score. No algorithm computes `saturation_score`. It appears in the UI and DB but has no defined calculation.
**Severity**: HIGH
**Recommended Fix**: Define a Saturation Score algorithm in Section 12. Suggested inputs: number of active sellers, rate of new entrants, price compression rate, ad density. Without this, the field will always be null or require a developer to invent the formula.

---

### D-12: Home dashboard refresh logic contradicts itself on stale threshold

**Where**: Section 8.2 (Trigger 1: "IF dashboard_cards_mv.last_refreshed < 3 hours ago: Return stale data")
**Issue**: The logic says "IF last_refreshed < 3 hours ago → return stale data + badge, enqueue P2 refresh." This is backwards. If last_refreshed was less than 3 hours ago, the data is FRESH, not stale. The condition should be `> 3 hours ago` (or equivalently, `age ≥ 3h`). The ELSE clause says "Return fresh materialised view" which would mean data older than 3h is "fresh" — the opposite of the freshness system defined in Section 4.4.
**Severity**: CRITICAL
**Recommended Fix**: Fix the condition: `IF dashboard_cards_mv.last_refreshed > 3 hours ago → return stale data + badge, enqueue P2 refresh. ELSE → return fresh materialised view (<300ms).`

---

### D-13: CLAUDE.md data sources disagree with v5 data sources

**Where**: CLAUDE.md (Discovery Pipeline: "TikTok, Pinterest, Amazon Movers, Shopify stores") vs Brief Section 2 (8 platforms including Reddit, Facebook/Instagram, Google Trends, YouTube)
**Issue**: CLAUDE.md lists only 4 data sources. The v5 brief lists 8 platforms. CLAUDE.md is missing Reddit, Facebook/Instagram, Google Trends, and YouTube entirely.
**Severity**: MEDIUM
**Recommended Fix**: CLAUDE.md should be updated to reflect the v5 platform scope, or v6.0 should clearly state which platforms are in-scope for each phase.

---

### D-14: CLAUDE.md queue system disagrees with v5 queue system

**Where**: CLAUDE.md (Queue Types: scan_jobs, transform_jobs, scoring_jobs) vs Brief Section 5 (Three-Queue Architecture: P0_queue, P1_queue, P2_queue, dead_letter_queue)
**Issue**: CLAUDE.md defines functional queues (scan, transform, scoring). The v5 brief defines priority-based queues (P0/P1/P2). These are architecturally different approaches. A developer following CLAUDE.md would build the wrong queue system.
**Severity**: CRITICAL
**Recommended Fix**: CLAUDE.md must be updated to match v5's priority-based queue architecture. The functional queue names from CLAUDE.md should be retired entirely.

---

### D-15: No `cross_platform_matcher` worker defined despite being referenced as Row 5 data source

**Where**: Section 7 Chain Data Sources (Row 5 — Other Channels: "cross-platform matcher") vs Section 11 (Worker System)
**Issue**: Row 5's data source is listed as "cross-platform matcher" but no worker with this name exists in the 18-worker system. The `amazon_tiktok_match_worker` (#9) partially covers TikTok↔Amazon matching, but there's no general cross-platform matcher that covers Shopify, eBay, YouTube, and Pinterest as Row 5 requires.
**Severity**: HIGH
**Recommended Fix**: Define a `cross_platform_match_worker` in the worker system, or clarify that Row 5 data is aggregated from multiple existing workers and specify exactly which ones.

---

---

## Section 2: Technical Gaps Found

### T-1: No Apify failure handling defined

**Component**: Scraping infrastructure (Apify Actors)
**Issue**: Apify is the primary scraping provider. The brief defines budget enforcement and dead-letter queues, but never specifies what happens when: (a) Apify is down entirely, (b) an actor run times out, (c) Apify returns partial data, (d) Apify rate-limits the account, (e) an actor's dataset is empty. These are daily occurrences in production scraping systems.
**Severity**: CRITICAL
**Recommended Fix**: Define explicit error handling per failure mode: timeout → retry with backoff → dead-letter after 3 attempts. Partial data → accept with quality flag. Apify down → circuit breaker, surface stale data with "Service temporarily unavailable" badge. Rate limit → exponential backoff with configurable limits.

---

### T-2: No RapidAPI failure handling defined

**Component**: Scraping infrastructure (RapidAPI)
**Issue**: RapidAPI is the secondary scraping provider. Multiple workers depend on it (tiktok_live, amazon_bsr_scanner via "Amazon data"). No error handling specified for: rate limiting (429), quota exceeded, API deprecation, response format changes, or service outages.
**Severity**: HIGH
**Recommended Fix**: Define RapidAPI-specific error handling. Include: 429 → backoff + budget decrement, quota exceeded → halt worker + alert, response validation → schema check before DB write.

---

### T-3: No Stripe webhook failure handling

**Component**: Billing (Stripe)
**Issue**: Stripe webhooks are fire-and-forget from Stripe's perspective. The brief mentions Stripe integration but never defines: (a) webhook endpoint, (b) webhook signature verification, (c) idempotency handling for duplicate webhooks, (d) what happens when a webhook delivery fails, (e) reconciliation process for missed webhooks, (f) handling of subscription lifecycle events (trial end, payment failure, plan change, cancellation).
**Severity**: CRITICAL
**Recommended Fix**: Add a complete Stripe webhook handling section: endpoint definition, event types to handle (checkout.session.completed, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted), idempotency keys, failed payment dunning flow, and a daily reconciliation job.

---

### T-4: No Redis failure handling — single point of failure

**Component**: Cache + Budget Tracking + Job Queue (Redis)
**Issue**: Redis serves three critical functions: data freshness cache, budget enforcement, and BullMQ job queue. If Redis goes down: (a) freshness checks fail — does the system scrape everything or nothing? (b) budget enforcement fails — do workers run without limits or halt? (c) BullMQ jobs can't be enqueued — does the UI hang, show errors, or degrade gracefully? No fallback behaviour is defined for any of these.
**Severity**: CRITICAL
**Recommended Fix**: Define Redis failure modes: (a) freshness check fails → treat as stale, return DB data with warning badge, (b) budget check fails → fail-safe by refusing the API call (never fail-open on budget), (c) BullMQ unavailable → return stale data from DB, show "background refresh unavailable" message, retry connection with backoff. Consider Redis Sentinel or Railway's managed Redis HA for production.

---

### T-5: No Supabase outage handling

**Component**: Database (Supabase PostgreSQL)
**Issue**: Supabase is the primary data store, auth provider, and realtime engine. If Supabase is unreachable: the entire application is dead. No fallback, caching strategy, or degraded mode is defined.
**Severity**: HIGH
**Recommended Fix**: Define degraded modes: (a) DB unreachable → show cached data if available, disable write operations, surface clear error to user, (b) Auth unreachable → existing JWT tokens still valid until expiry, show maintenance banner, (c) Realtime unreachable → fall back to polling or show "live updates unavailable" badge.

---

### T-6: Materialised view refresh could be extremely slow with tenant isolation

**Component**: Database (dashboard_cards_mv)
**Issue**: The brief says dashboard_cards_mv is "pre-computed every 3h or on-demand" and must load in <300ms. But this is a materialised view that joins products, creators, videos, shops, ads, trend_scores, and platform_scores — with RLS filtering by tenant_id. PostgreSQL materialised views don't support RLS directly. How is tenant isolation enforced? Does each tenant get their own materialised view? Is it one global view filtered at query time? For 100+ tenants with 25,000+ products each, refreshing this view could take minutes, not milliseconds.
**Severity**: CRITICAL
**Recommended Fix**: Define the materialised view strategy: (a) per-tenant materialised views (complex to manage, scales poorly), (b) single global view with tenant_id column + index (simpler, RLS applied at query time), or (c) Redis-cached precomputed cards per tenant (fastest reads, most complex invalidation). The <300ms target needs a concrete implementation path.

---

### T-7: No race condition handling for concurrent scrape requests

**Component**: Smart Scraping Engine
**Issue**: Multiple users in the same tenant could click the same section simultaneously, or a user could click while an idle refresh is already running. The brief never addresses: (a) deduplication of scrape jobs (two P0 jobs for the same product), (b) what happens when a P0 user-triggered job conflicts with a P2 idle refresh for the same data, (c) how BullMQ prevents duplicate jobs.
**Severity**: HIGH
**Recommended Fix**: Define job deduplication strategy: use BullMQ's `jobId` parameter to create deterministic job IDs (e.g., `scrape:tiktok:products:{tenant_id}`). If a job with the same ID is already queued or active, skip the duplicate. Higher-priority jobs should be able to promote existing lower-priority jobs.

---

### T-8: No data validation between raw scrape data and DB schema

**Component**: Data ingestion pipeline (Transformation Layer)
**Issue**: The brief describes raw data flowing from Apify → raw_listings → transformation → products table. But no data validation is specified: (a) What if Apify returns unexpected fields or missing required fields? (b) What if prices are in different currencies? (c) What if product titles contain malicious content (XSS)? (d) What if numerical values are out of expected ranges? (e) What schema validation runs before DB insert?
**Severity**: HIGH
**Recommended Fix**: Define a data validation layer between raw ingestion and transformation: schema validation (Zod/Joi), currency normalisation, HTML sanitisation, range checks, and a quarantine table for records that fail validation.

---

### T-9: No monitoring or alerting system defined beyond vague references

**Component**: Monitoring
**Issue**: The tech stack mentions "Uptime monitoring + Railway logs" and workers have budget alerts, but there's no concrete monitoring strategy: (a) no health check endpoints defined, (b) no alerting rules for queue depth, worker failures, or response times, (c) no dashboard for system health, (d) no on-call rotation or escalation policy, (e) "Slack/email alert when 80% of daily budget used" — what Slack channel? What email? Who gets paged?
**Severity**: HIGH
**Recommended Fix**: Define: (a) `/api/health` endpoint checking DB, Redis, and queue connectivity, (b) alert rules: queue depth > 100 → warn, worker failure rate > 10% → critical, API response time > 5s → warn, (c) alert destinations (email list, Slack webhook URL — configurable per tenant for enterprise), (d) a system health dashboard page in the admin UI.

---

### T-10: No backup or disaster recovery plan

**Component**: All infrastructure
**Issue**: No backup strategy, disaster recovery plan, RTO (Recovery Time Objective), or RPO (Recovery Point Objective) is defined. If the Supabase database is corrupted, what happens? If Railway goes down, what's the failover? If someone accidentally drops a table, how long to recover?
**Severity**: HIGH
**Recommended Fix**: Define: (a) Supabase automatic backups (they exist, but retention and point-in-time recovery should be documented), (b) Redis persistence strategy (RDB snapshots? AOF? Is Railway Redis ephemeral?), (c) RTO target (e.g., 4 hours), (d) RPO target (e.g., 1 hour — max data loss acceptable), (e) disaster recovery runbook.

---

### T-11: Tenant data isolation via RLS depends on JWT claims — no defence in depth

**Component**: Security (Multi-tenancy)
**Issue**: The entire multi-tenancy model relies on Supabase RLS policies checking `auth.jwt()->>'tenant_id'`. If a JWT is forged, stolen, or the claim is missing, a user could potentially access another tenant's data. There is no defence in depth: no application-layer tenant_id check, no audit logging of cross-tenant access attempts, no row-level encryption.
**Severity**: HIGH
**Recommended Fix**: Add application-layer tenant_id enforcement in the Express middleware (belt-and-suspenders with RLS). Log any request where the JWT tenant_id doesn't match the requested resource. Consider: (a) short JWT expiry (15 min) with refresh tokens, (b) JWT blacklist on logout, (c) audit log entry for every data access with tenant_id.

---

### T-12: No rate limiting on API routes

**Component**: Backend API (Express)
**Issue**: The brief defines worker-level budget enforcement but has no rate limiting on the Express API endpoints themselves. Without API rate limiting: (a) a malicious user could trigger thousands of P0 scrape jobs by rapidly clicking, (b) the public API (Agency/Enterprise plan) has "1,000 calls/mo" and "Unlimited" but no enforcement mechanism described, (c) no protection against DDoS or credential stuffing on auth endpoints.
**Severity**: CRITICAL
**Recommended Fix**: Define API rate limiting: (a) per-user rate limits on scrape-triggering endpoints (e.g., max 10 P0 triggers per minute per user), (b) per-tenant rate limits for API access based on plan, (c) global rate limiting on auth endpoints (e.g., max 5 login attempts per 15 minutes per IP), (d) use Redis for rate limit counters (already in the stack).

---

### T-13: No data retention or cleanup policy

**Component**: Database
**Issue**: The platform generates data continuously: scrape logs, trend scores (time-series), API usage logs, notification history, dead-letter queue entries. No retention policy is defined. Without one: (a) the database grows unboundedly, (b) historical trend_scores for 25,000+ products across 90 days = millions of rows per tenant, (c) scrape_log and api_usage_log will grow indefinitely, (d) storage costs will escalate.
**Severity**: MEDIUM
**Recommended Fix**: Define retention policies: scrape_log → 90 days, api_usage_log → 90 days, dead_letter_queue → 30 days, trend_scores → 90 days (matches the chart), notifications → 30 days. Implement a nightly cleanup job or PostgreSQL table partitioning for time-series tables.

---

### T-14: Supabase Realtime at scale — connection limits unaddressed

**Component**: Realtime UI Updates (Supabase Realtime)
**Issue**: Supabase Realtime uses WebSocket connections. Each open browser tab = 1 persistent connection. At 100 concurrent users with 2 tabs each = 200 connections. Supabase free tier limits connections; paid tiers have limits too. The brief never addresses: (a) connection pooling, (b) what happens when limits are hit, (c) fallback when Realtime is unavailable, (d) channel design (per-tenant? per-user? per-product?).
**Severity**: MEDIUM
**Recommended Fix**: Define Realtime channel architecture: subscribe to tenant-level channels (not per-product), use Supabase's built-in row-level filtering. Document connection limit expectations per plan tier. Define fallback: if Realtime disconnects → automatic polling every 30 seconds.

---

### T-15: Anthropic API costs uncontrolled for AI-heavy features

**Component**: AI Analysis (Anthropic API)
**Issue**: Two workers use Anthropic API: predictive_discovery (50 calls/day) and platform_profitability_scorer (30 calls/day). But the brief also describes AI-generated features that have no budget: (a) creator outreach email copy generation (per-outreach, could be 50/mo per Pro user), (b) AI Insight Engine natural language summaries (undefined frequency), (c) AI rationale on every platform score (one per product per platform). At $0.003-0.015 per 1K tokens, 100 tenants generating outreach emails and summaries could cost $500+/month.
**Severity**: HIGH
**Recommended Fix**: Define Anthropic API budget per feature, not just per worker. Add: (a) outreach email generation budget per tenant per month (tied to plan limits), (b) AI summary generation budget, (c) caching of AI rationales (don't regenerate if inputs haven't changed), (d) total monthly Anthropic spend cap with circuit breaker.

---

### T-16: No GDPR/privacy compliance implementation details

**Component**: Compliance
**Issue**: The brief mentions GDPR nowhere. For a SaaS handling user data, creator data (including personal information like usernames, emails for outreach), and business intelligence: (a) no privacy policy or terms of service integration, (b) no data processing agreement (DPA) for enterprise clients, (c) no "right to be forgotten" implementation (how to delete a tenant's data across 19+ tables), (d) no cookie consent, (e) no data export for GDPR SAR (Subject Access Request), (f) creator outreach involves sending unsolicited emails — no anti-spam compliance (CAN-SPAM, GDPR).
**Severity**: CRITICAL
**Recommended Fix**: Add a compliance section covering: GDPR consent flows, right-to-deletion cascade (delete all tenant data across all tables), SAR export, cookie consent, anti-spam compliance for creator outreach (opt-out, unsubscribe links), DPA template for enterprise.

---

### T-17: No Supabase Realtime security — who can subscribe to what?

**Component**: Security (Supabase Realtime)
**Issue**: Supabase Realtime channels are protected by RLS policies, but the brief never specifies: (a) which Realtime channels exist, (b) how channel names are structured (per-tenant? per-user?), (c) whether a user from tenant A could subscribe to tenant B's channel if they guess the name, (d) what data is broadcast on Realtime (full row? delta? just a "refresh" signal?).
**Severity**: HIGH
**Recommended Fix**: Define Realtime channel architecture: (a) channel naming convention: `tenant:{tenant_id}:products`, (b) RLS enforcement on Realtime subscriptions (Supabase supports this), (c) broadcast minimal data (just the updated row ID + table name, let the client re-fetch).

---

### T-18: Free trial → paid conversion has no defined flow

**Component**: Billing (Stripe)
**Issue**: The brief says "Free trial: 14 days on Pro plan, no card required." But doesn't define: (a) what happens on day 15 (immediate lockout? grace period? downgrade to Starter?), (b) how the system notifies users before trial expiry (day 7? day 12? day 14?), (c) whether data is preserved after trial expiry, (d) what features are restricted during lockout, (e) how to handle users who sign up, never use the product, and trial expires.
**Severity**: HIGH
**Recommended Fix**: Define the complete trial lifecycle: day 7 email reminder, day 12 email reminder, day 14 trial expires → downgrade to a "locked" state (can view dashboard but not trigger scrapes or exports), day 21 → final reminder, day 30 → data archived (not deleted). Re-activate by selecting a paid plan.

---

### T-19: No definition of how Supabase materialised view is refreshed

**Component**: Database (dashboard_cards_mv)
**Issue**: The brief says `dashboard_cards_mv` is "pre-computed every 3h or on-demand." But PostgreSQL materialised views require an explicit `REFRESH MATERIALIZED VIEW` command. The brief never specifies: (a) what triggers the refresh (a worker? a cron? an API call?), (b) whether it uses `CONCURRENTLY` (allows reads during refresh — required for production), (c) how long the refresh takes, (d) what happens if a refresh fails midway.
**Severity**: MEDIUM
**Recommended Fix**: Define a `dashboard_refresh_worker` or add refresh logic to an existing worker. Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` (requires a unique index). Set a timeout. Log refresh duration to scrape_log. If refresh fails → keep serving stale view, alert admin.

---

### T-20: eBay data in Row 5 but no eBay worker or API

**Component**: Data pipeline / Worker system
**Issue**: Row 5 (Other Sales Channels) shows "eBay → Price, Units sold, Seller rating, Listing age" as a data source. But there is no eBay worker defined, no eBay API key listed, and eBay is not mentioned in the platform scope table. The data has no source.
**Severity**: MEDIUM
**Recommended Fix**: Either (a) add an eBay worker to the worker system with API source, or (b) remove eBay from Row 5 and mark it as a future addition, or (c) define eBay data as scraped via Apify and add it to an existing worker's scope.

---

### T-21: No search indexing strategy for global search at scale

**Component**: Global Search (Section 14.1)
**Issue**: Global search is defined as "Supabase full-text search (pg_trgm)" across products, creators, shops, and niches. pg_trgm is a trigram index — good for fuzzy matching but slow on large tables without proper indexing. With 25,000+ products, 10,000+ creators, and multiple tenants, search performance will degrade unless: (a) GIN/GiST indexes are defined, (b) search vectors are pre-computed, (c) tenant-scoped search is efficient.
**Severity**: MEDIUM
**Recommended Fix**: Define: (a) which columns get trigram indexes, (b) use `tsvector` columns for full-text search, (c) ensure all search queries include `WHERE tenant_id = ?` to leverage the index, (d) consider Supabase's built-in search or an external search service (Typesense/Meilisearch) if pg_trgm proves too slow.

---

### T-22: No error states or empty states defined for any UI page

**Component**: Frontend (all pages)
**Issue**: The brief defines detailed layouts for the happy path (data present, loading, refreshing) but never defines: (a) empty states (new tenant, no products yet), (b) error states (API failure, worker failure), (c) permission-denied states (viewer trying to export), (d) plan-locked states (Starter user trying to access Amazon section). These are among the most common states a real user encounters.
**Severity**: HIGH
**Recommended Fix**: Define empty/error/locked states for each major page: Home (empty → onboarding wizard), Product Detail (empty chain rows → "No data yet, click Refresh"), Platform sections (plan-locked → upgrade CTA), Error states (API failure → "Something went wrong, try again" with retry button).

---

### T-23: Netlify serverless function limitations not addressed

**Component**: Deployment (Netlify)
**Issue**: Next.js on Netlify runs as serverless functions with: (a) 10-second default timeout (26s max on paid plans), (b) cold start latency, (c) no persistent connections (affects Redis/BullMQ client initialisation), (d) 6MB response size limit. The architecture flow shows API routes checking Redis freshness and enqueuing BullMQ jobs — these operations require Redis/BullMQ client connections that may time out or fail on cold starts.
**Severity**: HIGH
**Recommended Fix**: Clarify the deployment architecture: (a) are Next.js API routes on Netlify or does the Express backend on Railway handle all API calls? (b) if Netlify, define connection pooling strategy for Redis/Supabase, (c) define cold start mitigation (keep-alive pings?), (d) consider moving all API routes to the Railway Express backend and using Netlify only for static/SSR frontend.

---

### T-24: No versioning or migration strategy for the database schema

**Component**: Database
**Issue**: 19 tables + 1 materialised view with no migration strategy defined. As the product evolves: (a) how are schema changes applied? (b) are migrations reversible? (c) what tool manages migrations (Supabase CLI? Prisma? raw SQL?)? (d) how are migrations tested before production? (e) what happens to existing data during schema changes?
**Severity**: MEDIUM
**Recommended Fix**: Define migration strategy: use Supabase CLI migrations (`supabase migration new`, `supabase db push`). Store all migrations in `supabase/migrations/`. Test migrations against a staging Supabase project before production.

---

---

## Section 3: Summary Statistics

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Discrepancies | 4 (D-1, D-4, D-12, D-14) | 5 (D-3, D-5, D-7, D-9, D-11, D-15) | 4 (D-2, D-6, D-8, D-10, D-13) | 0 | 15 |
| Technical Gaps | 4 (T-1, T-3, T-4, T-12, T-16) | 10 (T-2, T-5, T-7, T-8, T-9, T-11, T-15, T-17, T-18, T-22, T-23) | 5 (T-6, T-10, T-13, T-14, T-19, T-20, T-21, T-24) | 0 | 24 |
| **TOTAL** | **8** | **15** | **9** | **0** | **39** |

---

## Key Takeaways

1. **The brief has no API routes section.** This is the single biggest gap for a developer trying to build the system. Every endpoint must be defined in v6.0.

2. **CLAUDE.md and v5 are out of sync** on scoring models, queue architecture, data sources, and database schema. CLAUDE.md will actively mislead any developer who reads it.

3. **Error handling is almost entirely absent.** For a system with 5+ external API dependencies (Apify, RapidAPI, Stripe, Anthropic, Resend), zero failure handling is defined. This will be the #1 source of production incidents.

4. **Security is surface-level.** RLS is good but insufficient alone. No rate limiting, no defence-in-depth on tenant isolation, no GDPR compliance, no anti-spam for outreach.

5. **The "18 workers" number is wrong** — at least 2 workers are promised but undefined (Google Trends, YouTube), 1 is referenced but doesn't exist (cross-platform matcher), and the budget table only covers half of them.
