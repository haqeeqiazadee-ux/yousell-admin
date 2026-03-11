# YOUSELL Intelligence Platform — Master Build Brief v6.0

**Version**: 6.0
**Date**: 2026-03-11
**Produced by**: Senior Architect QA Review (5-Phase Quality Assurance)
**Based on**: Master Build Brief v5.0
**Changes**: See Section 2 for complete changelog (39 issues fixed, 18 features added, 6 moats improved, 5 new moats)

---

## Table of Contents

### Part 1 — Strategy, Architecture & Design (Sections 1–10)

| Section | Title | Page Focus |
|---------|-------|-----------|
| 1 | Executive Summary & Platform Vision | What YouSell is, who it serves, differentiators, revenue model |
| 2 | Senior Architect Review (Changelog) | Complete v5→v6 changelog: all findings and fixes |
| 3 | Competitive Moat Analysis | 6 existing moats (improved) + 5 new moat features |
| 4 | Smart Scraping Engine | Demand-driven architecture, 3-queue system, 21 workers, budgets, error handling |
| 5 | Complete Tech Stack | Technology table, deployment architecture, monitoring, backup/DR, API keys |
| 6 | Multi-Tenancy, Auth & Compliance | Tenant model, RBAC, invitations, JWT, RLS, rate limiting, Stripe, GDPR |
| 7 | Universal Product Intelligence Chain | 7-row chain specification with fields, workers, triggers per row |
| 8 | Home Dashboard | Layout, refresh logic, materialised view, Realtime, states, search, bulk actions |
| 9 | Three Platform Sections | TikTok (6 pages), Amazon (3 pages), Shopify (3 pages) |
| 10 | Intelligence Engine Algorithms | 5 algorithms + 1 composite score with full formulas and data sources |

### Part 2 — Implementation & Operations (Sections 11–20)

| Section | Title | Page Focus |
|---------|-------|-----------|
| 11 | Complete Database Schema | 32 tables + 1 MV with full SQL DDL, indexes, constraints, RLS |
| 12 | Worker System | 21 workers with execution template, dependency chain, failure handling |
| 13 | API Routes | 91 endpoints across 17 categories |
| 14 | Subscription Plans & Billing | Feature matrix, Stripe integration, trial lifecycle, dunning flow |
| 15 | Missing SaaS Features (Resolution Index) | Where all 18 Phase 3 features are resolved + priority matrix |
| 16 | Error Handling, Monitoring & DR | Error matrix, circuit breakers, health checks, alerts, backup/DR |
| 17 | Development Phases (Revised) | 5 phases with tasks, dependencies, and findings addressed |
| 18 | Development Guardrails (Updated) | 22 guardrails (14 original + 8 new) |
| 19 | Session Continuity Protocol | STATUS.json v6.0, session start protocol, task completion ritual |
| 20 | Claude Code Master Execution Prompt v6.0 | Self-contained prompt for cold-start development |

### Appendix

| Section | Title |
|---------|-------|
| A | Final QA Summary |

---

---

## Section 1 — Executive Summary & Platform Vision

### 1.1 — What Is YouSell?

YouSell Intelligence Platform is a **multi-tenant, white-label SaaS** that provides ecommerce operators with a single intelligence layer across TikTok, Amazon, and Shopify. It replaces the need for 5+ separate tools (FastMoss, JungleScout, PPSPY, Minea, Helium 10) by combining cross-platform product discovery, AI-powered scoring, creator outreach automation, and agency-grade reporting into one platform.

The core differentiator is the **Pre-Trend Predictive Engine** — an AI system that detects product opportunities 3–7 days before the broader market catches on, giving users a first-mover advantage.

### 1.2 — Who It Serves

| User Type | Description | Primary Value |
|-----------|-------------|---------------|
| Solo ecommerce operators | Individual sellers on TikTok Shop, Amazon, or Shopify | Find trending products before competitors, get AI-recommended launch platform |
| Ecommerce agencies | Teams managing multiple client brands | Branded intelligence reports, client sub-accounts, team collaboration |
| Product research analysts | Full-time product hunters at ecommerce companies | Bulk product analysis, saved views, keyboard-driven workflows, export tools |
| Enterprise procurement teams | Large retailers scouting DTC trends | API access, custom integrations, white-label deployment, dedicated support |

### 1.3 — Key Differentiators

| # | Differentiator | Why It Matters | Competitor Gap |
|---|---------------|----------------|----------------|
| 1 | **Pre-Trend Predictive Engine** | Detects products 3–7 days before viral breakout. No competitor offers predictive detection. | FastMoss, JungleScout, PPSPY show current trends only — they are lagging indicators |
| 2 | **Cross-Platform Intelligence Graph** | Links TikTok video → creator → Amazon ASIN → Shopify store → Facebook ad in one unified graph | Every competitor is siloed to one platform |
| 3 | **Creator-Product Match Score** | AI-ranked creator recommendations per product with conversion probability | Competitors require manual influencer research |
| 4 | **Best Platform Recommender** | AI tells you: should you sell on TikTok Shop, Amazon, or Shopify? With margin and competition data | No competitor compares selling platforms for a given product |
| 5 | **Automated Creator Outreach** | One-click email sequence to top-matched creators. Turns intelligence into action | Competitors show data but don't help you act on it |
| 6 | **Agency Intelligence Reports** | AI-generated branded PDF reports with narrative analysis, not just data dumps | Competitors offer CSV exports at best |
| 7 | **Product Lifecycle Prediction** | Shows where a product sits in its lifecycle: Emerging → Growing → Peak → Declining → Saturated | No competitor tracks full lifecycle — they only show "trending now" |
| 8 | **Niche Intelligence Engine** | Aggregates product data to niche level — "fitness accessories are +340% on TikTok but saturated on Amazon" | Competitors operate at product level only |

`★ NEW: Differentiators #7 and #8 — added from Phase 3 moat opportunity findings MN-1 and MN-2`

### 1.4 — Revenue Model

**Subscription-based SaaS with 4 tiers:**

| Plan | Monthly | Annual (20% off) | Target User |
|------|---------|-------------------|-------------|
| Starter | $49/mo | $39/mo ($468/yr) | Solo operators, beginners |
| Pro | $149/mo | $119/mo ($1,428/yr) | Serious sellers, small teams |
| Agency | $349/mo | $279/mo ($3,348/yr) | Agencies, multi-client operations |
| Enterprise | Custom | Custom | Large retailers, white-label deployments |

`★ NEW: Annual billing option with 20% discount — added from Phase 3 finding S-14`

**Additional revenue streams:**
- Usage-based overage charges (API calls beyond plan limit)
- Enterprise white-label licensing fees
- Custom domain hosting fees

### 1.5 — Target Market

**Primary:** English-speaking ecommerce operators in US, UK, Canada, Australia, and EU markets who sell physical products via TikTok Shop, Amazon FBA, or Shopify dropshipping/DTC.

**Market size indicator:** The combined TAM of tools YouSell replaces (FastMoss, JungleScout, Helium 10, PPSPY, Minea) exceeds $500M ARR, with JungleScout alone valued at $1B+.

**Go-to-market:** Product-led growth with 14-day free trial (Pro plan, no card required), supplemented by content marketing (trend reports, case studies) and a referral programme.

`★ NEW: Referral programme mentioned — defined from Phase 3 finding S-15`

### 1.6 — Platform Vision Statement

> YouSell exists to give ecommerce operators an unfair advantage by showing them what will trend tomorrow, not what trended yesterday. Every feature, every algorithm, and every design decision serves one goal: **surface actionable product opportunities faster than any human or competing tool can.**

---

## Section 2 — Senior Architect Review: Issues Found & Fixes Applied

This section is the complete changelog between v5.0 and v6.0. Every issue discovered in the Phase 2 (technical) and Phase 3 (product) reviews is listed with its resolution.

### 2.1 — Discrepancies Fixed (from Phase 2)

| ID | Issue | Severity | Fix Applied in v6.0 | Fixed In Section |
|----|-------|----------|---------------------|------------------|
| D-1 | Google Trends and YouTube workers promised in platform scope but never defined in worker system | CRITICAL | Both workers now fully defined with trigger, priority, budget, and API. Worker count updated to 21. | Section 4, Section 9 |
| D-2 | Worker count mismatch — "18 workers" claimed but actual count is higher | MEDIUM | Canonical worker registry created. Workers separated into: scraping (14), intelligence (5), system (2) = 21 total. | Section 4 |
| D-3 | Moat feature phasing contradicts moat prioritisation advice (architect says Phase 1, table says Phase 2/3) | HIGH | Phasing revised: Pre-Trend Engine remains Phase 1. Cross-Platform Graph foundation moved to Phase 1 (basic matching). Creator Outreach remains Phase 3 (requires intelligence layer). Commentary updated to match. | Section 3 |
| D-4 | CLAUDE.md 3-pillar scoring model contradicts v5's 4-algorithm system | CRITICAL | v5's 4-algorithm system is canonical. CLAUDE.md's `final_score` model deprecated. A composite `overall_score` defined using v5 scores as inputs. CLAUDE.md update required post-v6. | Section 10 |
| D-5 | `raw_listings` table in CLAUDE.md but missing from v5 schema | HIGH | `raw_listings` added to schema with full field definitions, tenant_id, and RLS. | Section 6 |
| D-6 | `platform_configs` table referenced but never defined | MEDIUM | Clarified: per-tenant API keys stored in `tenants.api_keys` jsonb. Per-tenant branding in `tenants.brand_config` jsonb. No separate `platform_configs` table needed. | Section 6 |
| D-7 | Budget table lists only 6 workers but 12+ make external API calls | HIGH | Budget table expanded to cover ALL workers making external API calls (14 workers). Anthropic-calling workers included. | Section 4 |
| D-8 | Idle refresh rotation lists 5 platforms but more exist | MEDIUM | Rotation expanded to 7 platforms. Facebook/Instagram added. Google Trends and YouTube excluded with documented rationale (low-frequency data, refresh on demand only). | Section 4 |
| D-9 | Row 4 is "TikTok Shops" — breaks chain parity for Amazon/Shopify products | HIGH | Row 4 renamed to "Marketplace Presence" with platform-adaptive content. TikTok → TikTok Shop stats. Amazon → Amazon seller stats. Shopify → Shopify store stats. | Section 7 |
| D-10 | Predictive engine is "always P1" and "fires every 2h" — contradicts demand-driven model | MEDIUM | Predictive engine explicitly documented as a "Proactive Intelligence Worker" — a named exception to the demand-driven model with clear rationale. | Section 4 |
| D-11 | Saturation Score in UI and DB but no algorithm defined | HIGH | Saturation Score algorithm now fully defined with 4 weighted inputs. Integrated into Product Lifecycle Stage badge. | Section 10 |
| D-12 | Home dashboard refresh logic has inverted condition (< vs >) | CRITICAL | Condition fixed: `IF age >= 3h → stale + enqueue refresh. ELSE → return fresh data.` | Section 8 |
| D-13 | CLAUDE.md data sources disagree with v5 (4 vs 8 platforms) | MEDIUM | v6 canonical platform list: 8 platforms. CLAUDE.md update required post-v6. | Section 9 |
| D-14 | CLAUDE.md queue system (functional queues) disagrees with v5 (priority queues) | CRITICAL | v5 priority-based queues (P0/P1/P2) are canonical. CLAUDE.md's functional queue names retired. | Section 4 |
| D-15 | No `cross_platform_matcher` worker despite being Row 5 data source | HIGH | `cross_platform_match_worker` now fully defined. Covers all platform pairs (not just TikTok↔Amazon). | Section 4, Section 7 |

### 2.2 — Technical Gaps Fixed (from Phase 2)

| ID | Issue | Severity | Fix Applied in v6.0 | Fixed In Section |
|----|-------|----------|---------------------|------------------|
| T-1 | No Apify failure handling | CRITICAL | Error handling defined per failure mode: timeout → retry with backoff → dead-letter. Partial data → accept with quality flag. Apify down → circuit breaker + stale data badge. | Section 4 |
| T-2 | No RapidAPI failure handling | HIGH | RapidAPI error handling defined: 429 → backoff, quota exceeded → halt + alert, response validation before DB write. | Section 4 |
| T-3 | No Stripe webhook failure handling | CRITICAL | Complete Stripe webhook section added: endpoint, event types, idempotency, signature verification, dunning flow. | Section 6 |
| T-4 | No Redis failure handling — single point of failure | CRITICAL | Redis failure modes defined: freshness fail → treat as stale, budget fail → fail-safe (refuse call), BullMQ unavailable → return stale data + warning. | Section 4 |
| T-5 | No Supabase outage handling | HIGH | Degraded modes defined: DB unreachable → cached data if available, Auth unreachable → existing JWT valid, Realtime unreachable → fallback polling. | Section 4 |
| T-6 | Materialised view refresh could be slow with tenant isolation | CRITICAL | Strategy defined: single global view with tenant_id column + composite index. RLS applied at query time. Redis-cached per-tenant cards for <300ms reads. | Section 8 |
| T-7 | No race condition handling for concurrent scrape requests | HIGH | Job deduplication via BullMQ `jobId` parameter. Deterministic IDs prevent duplicates. Higher-priority jobs promote existing lower-priority jobs. | Section 4 |
| T-8 | No data validation between raw scrape and DB | HIGH | Validation layer defined: Zod schema validation, currency normalisation, HTML sanitisation, range checks, quarantine table for failed records. | Section 4 |
| T-9 | No monitoring or alerting system | HIGH | Health check endpoint `/api/health` defined. Alert rules for queue depth, failure rate, response time. System health dashboard page in admin UI. | Section 5 |
| T-10 | No backup or disaster recovery plan | HIGH | Backup strategy defined: Supabase automatic backups, Redis persistence, RTO 4h, RPO 1h, disaster recovery runbook reference. | Section 5 |
| T-11 | Tenant isolation via RLS only — no defence in depth | HIGH | Application-layer tenant_id enforcement added in Express middleware. Cross-tenant access attempts logged. Short JWT expiry (15 min) with refresh tokens. | Section 6 |
| T-12 | No rate limiting on API routes | CRITICAL | API rate limiting defined: per-user on scrape triggers, per-tenant for API access by plan, global on auth endpoints. Redis-backed counters. | Section 6 |
| T-13 | No data retention or cleanup policy | MEDIUM | Retention policies defined: scrape_log 90d, api_usage_log 90d, dead_letter_queue 30d, trend_scores 90d, notifications 30d. Nightly cleanup job. | Section 6 |
| T-14 | Supabase Realtime connection limits unaddressed | MEDIUM | Channel architecture defined: tenant-level channels, connection limit expectations per plan, fallback to 30s polling on disconnect. | Section 8 |
| T-15 | Anthropic API costs uncontrolled | HIGH | Per-feature Anthropic budget defined. Caching of AI rationales when inputs unchanged. Monthly spend cap with circuit breaker. | Section 10 |
| T-16 | No GDPR/privacy compliance | CRITICAL | Full compliance section added: consent flows, right-to-deletion cascade, SAR export, cookie consent, anti-spam for outreach, DPA template reference. | Section 6 |
| T-17 | No Supabase Realtime security (channel access control) | HIGH | Channel naming convention defined: `tenant:{tenant_id}:{resource}`. RLS enforcement on subscriptions. Minimal broadcast data (row ID only). | Section 8 |
| T-18 | Free trial → paid conversion has no defined flow | HIGH | Complete trial lifecycle defined: day 7 + day 12 emails, day 14 downgrade to locked state, day 21 final reminder, day 30 data archived. | Section 6 |
| T-19 | No definition of how materialised view is refreshed | MEDIUM | `dashboard_refresh_worker` defined. Uses `REFRESH MATERIALIZED VIEW CONCURRENTLY`. Timeout, failure logging, stale view fallback. | Section 8 |
| T-20 | eBay data in Row 5 but no eBay worker or API | MEDIUM | eBay marked as Phase 3 future addition. Removed from Row 5 default display. Shows "Coming soon" placeholder if no eBay data exists. | Section 7 |
| T-21 | No search indexing strategy for global search at scale | MEDIUM | Search strategy defined: `tsvector` columns, GIN indexes, tenant-scoped queries, fallback to Typesense if pg_trgm proves slow. | Section 8 |
| T-22 | No error/empty states defined for any UI page | HIGH | Empty, error, permission-denied, and plan-locked states defined for all major pages. | Section 8 |
| T-23 | Netlify serverless function limitations unaddressed | HIGH | Deployment architecture clarified: Next.js on Netlify for frontend/SSR only. All API routes on Railway Express backend. No Redis/BullMQ connections from Netlify. | Section 5 |
| T-24 | No versioning or migration strategy for DB schema | MEDIUM | Migration strategy defined: Supabase CLI migrations, stored in `supabase/migrations/`, staging project testing before production. | Section 6 |

### 2.3 — Missing SaaS Features Added (from Phase 3)

| ID | Feature | Priority | Fix Applied in v6.0 | Fixed In Section |
|----|---------|----------|---------------------|------------------|
| S-1 | Onboarding empty states / time-to-value path | P0 | Skeleton loading during first scrape, optional demo data toggle, onboarding progress bar, re-engagement email at 24h. | Section 8 |
| S-2 | Loading skeleton states | P1 | Skeleton states defined for product cards, stats bars, creator lists, charts. shadcn/ui Skeleton component. | Section 8 |
| S-3 | WCAG accessibility requirements | P1 | WCAG 2.1 AA target. Keyboard navigation, ARIA labels, colour contrast ratios, focus management, skip-to-content. | Section 8 |
| S-4 | Notification preferences | P1 | Notification preferences page: per-category toggles, per-channel delivery, digest frequency, global mute. `notification_preferences` table. | Section 6 |
| S-5 | Bulk actions on product lists | P1 | Bulk action toolbar: select 2+ → Save to Collection, Set Alert, Export, Compare, Archive, Remove. | Section 8 |
| S-6 | Saved views / custom filters | P2 | `saved_views` table. Save filter+sort+column config. Max 20 per user. Share with team. Set default. | Section 8 |
| S-7 | Help centre / in-app guidance / contextual tooltips | P0 | Contextual tooltips on all scores/badges. External help centre link. Status page in footer. Feedback widget. | Section 8 |
| S-8 | Data retention visibility for users | P1 | Retention policy visible in settings. Data export before cancellation. 30-day preservation after cancel. GDPR deletion on request. | Section 6 |
| S-9 | Team invitation / multi-user management | P0 | Invitation flow defined. Team management page. Seat limits per plan. `invitations` table. | Section 6 |
| S-10 | Activity log for team admins | P2 | Activity feed page for agency_owner/super_admin. Filter by user, action, date. Powered by `api_usage_log`. | Section 8 |
| S-11 | External client sharing / portal | P2 | Shareable read-only links (token-based, expiring). Client portal with agency branding. Client viewer accounts. | Section 6 |
| S-12 | Failed payment / dunning flow | P0 | Full dunning flow: retry → email → 3-day grace → 7-day restricted → 14-day locked → 30-day archived. | Section 6 |
| S-13 | Plan upgrade/downgrade proration | P1 | Upgrades: prorated charge immediately. Downgrades: end of billing cycle, excess data archived not deleted, impact summary warning. | Section 6 |
| S-14 | Annual plan option | P2 | 20% discount for annual commitment. Toggle on pricing page. Stripe annual invoicing. | Section 1 |
| S-15 | Referral programme | P3 | Referral link per user. 1 month free for referrer on referee's 30-day subscription. `referrals` table. | Section 6 |
| S-16 | Product archiving / dismissal | P1 | Dismiss/archive buttons on product cards. "Dismissed" and "Archived" filter tabs. `product_user_status` table. | Section 8 |
| S-17 | Changelog / "What's New" | P3 | "What's New" link in header. In-app changelog modal on first login after release. | Section 8 |
| S-18 | Keyboard shortcuts | P3 | Keyboard shortcut system. J/K navigation, S save, A alert, R refresh, / search, Esc close. Cmd+? help modal. | Section 8 |

### 2.4 — Moat Improvements Applied (from Phase 3)

| ID | Moat Feature | Issue | Fix Applied in v6.0 |
|----|-------------|-------|---------------------|
| M-1 | Pre-Trend Predictive Engine | Data pipeline feeding algorithm unclear. 50 Anthropic calls for 25K+ products? | Predictive worker data flow fully specified: reads from trend_scores + predictive_signals tables. Anthropic used for classification, not per-product analysis. Batch processing defined. |
| M-2 | Cross-Platform Intelligence Graph | No graph data structure, no matching algorithm, only TikTok↔Amazon covered | `product_platform_matches` table defined as graph edge table. Matching algorithm specified (title similarity + UPC/GTIN + manual confirm). `cross_platform_match_worker` added. |
| M-3 | Creator-Product Match Score | Semantic similarity implementation unclear. Cold-start problem. Demographics data source unknown. | Keyword matching as v1 (not embeddings). Cold-start fallback scores defined. Demographics sourced from Apify creator profile scrapes where available, null-safe fallback. |
| M-4 | Best Platform Recommender | Cost data source undefined. Google Trends worker missing. Competition data source unclear. | Supplier data from manual input + AliExpress Apify scrape (Phase 3). Google Trends worker now defined. Competition data mapped to platform-specific workers. |
| M-5 | Automated Creator Outreach | No email template, no sequence logic, no compliance, no analytics | Email template structure defined. 3-email sequence (day 0, 3, 7). Resend webhook for tracking. Anti-spam compliance. Outreach dashboard with response metrics. |
| M-6 | Agency Intelligence Reports | No report template, no AI narrative, no PDF library | Report template with 6 sections. AI-generated narrative via Anthropic (the moat). @react-pdf/renderer for PDF. Scheduling + history. |

### 2.5 — New Moat Features Added (from Phase 3)

| ID | New Feature | Description | Build Phase |
|----|------------|-------------|-------------|
| MN-1 | Product Lifecycle Prediction | Full lifecycle tracking: Emerging → Growing → Peak → Declining → Saturated. Solves undefined Saturation Score (D-11). | Phase 2 |
| MN-2 | Niche Intelligence Engine | Niche-level aggregation of product intelligence across platforms. `niches` table + Niche Intelligence page. | Phase 3 |
| MN-3 | Smart Alerts — AI Daily Briefing | AI-curated daily intelligence digest per tenant via Anthropic. Email + dashboard card. `daily_briefing_worker`. | Phase 3 |
| MN-4 | Collaborative Intelligence | Team annotations/notes on products and collections. @mentions. `annotations` table. Creates switching costs. | Phase 2 |
| MN-5 | Trend Replay | Historical proof-of-value: "YouSell detected this 5 days early." Sales tool + retention tool. | Phase 3 |

---
## Section 3 — Competitive Moat Analysis

### 3.1 — Competitor Landscape

| Competitor | What They Do | Weakness | YouSell Advantage |
|-----------|-------------|---------|-------------------|
| FastMoss | TikTok product analytics | TikTok only. No Amazon/Shopify. No pre-trend. No creator outreach. | Cross-platform + predictive engine + outreach automation |
| JungleScout | Amazon product research | Amazon only. No social signal layer. No trend prediction. | TikTok viral signal drives Amazon opportunity score |
| PPSPY | Shopify store spy tool | Shopify only. No creator intelligence. No scoring engine. | Creator-to-store linkage across all platforms |
| Minea | Ad creative spy tool | Ads only. No product or creator intelligence. No scoring. | Full funnel: product → creator → ad → store → platform recommendation |
| Helium 10 | Amazon SEO & analytics | Amazon SEO tool. No social or trend layer. No predictive. | Social-first product discovery feeding Amazon intelligence |
| **All competitors** | **Siloed to one platform** | **No cross-platform product graph. No lifecycle prediction.** | **Unified intelligence graph is the core moat** |

### 3.2 — Existing Moat Features (Improved in v6.0)

#### Moat 1: Pre-Trend Predictive Engine

**Build Phase**: Phase 1 (core moat — highest priority)
**Defensibility**: HIGH

Detects products 3–7 days before viral breakout by analysing early signals across platforms.

```
predictive_score = CLAMP(0, 100,
    (creator_burst_signal     × 0.35)  // 3+ new creators post same product in 48h
  + (engagement_velocity      × 0.25)  // hourly view rate doubling over baseline
  + (store_adoption_velocity  × 0.20)  // new stores listing same product within 72h
  + (ad_creative_replication  × 0.20)  // same creative format appearing on 3+ accounts
)
```

**v6.0 Data Pipeline (✓ FIXED: M-1)**:

| Input Variable | Source Table | Time Window | Worker That Populates |
|---------------|-------------|-------------|----------------------|
| creator_burst_signal | `creator_product_links` | 48h rolling window | `creator_monitor_worker` |
| engagement_velocity | `videos` (view_count time-series) | 24h vs 7d baseline | `video_scraper_worker` |
| store_adoption_velocity | `shops` + `product_platform_matches` | 72h rolling window | `shopify_store_discovery_worker` + `cross_platform_match_worker` |
| ad_creative_replication | `ads` (duplication_count) | 72h rolling window | `facebook_ads_worker` + `tiktok_ads_worker` |

**Anthropic API Usage**: The predictive worker uses Anthropic for **batch classification** (not per-product analysis). Every 2h, it:
1. Queries products with `predictive_score > 50` from the last computation
2. Sends a batch of up to 50 product summaries to Anthropic for pattern classification
3. Anthropic returns: confidence level, predicted trend timeline, recommended action
4. Results stored in `predictive_signals` table

This maps 50 Anthropic calls/day to ~600 product evaluations (batches of 12 per call).

`✓ FIXED: M-1 — predictive worker data flow was unclear, now fully specified with tables, time windows, and Anthropic batch strategy`

---

#### Moat 2: Cross-Platform Intelligence Graph

**Build Phase**: Phase 1 (foundation) → Phase 2 (full graph)
**Defensibility**: HIGH

Links TikTok video → creator → Amazon ASIN → Shopify store → Facebook ad in one unified graph.

**Graph Data Structure (✓ FIXED: M-2)**:

The graph is implemented as relational joins, not a graph database. The `product_platform_matches` table serves as the graph edge table:

```sql
product_platform_matches (
    id uuid PK,
    tenant_id uuid NOT NULL,
    product_id uuid FK → products(id),      -- the "canonical" product
    platform text NOT NULL,                   -- 'tiktok', 'amazon', 'shopify', 'facebook', 'ebay'
    external_id text NOT NULL,               -- platform-specific ID (ASIN, TikTok product ID, etc.)
    match_confidence decimal(5,2),           -- 0.00–100.00
    match_method text,                       -- 'title_similarity', 'upc_gtin', 'manual', 'image_match'
    matched_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, product_id, platform, external_id)
)
```

**Matching Algorithm**:

```
Step 1: UPC/GTIN lookup (highest confidence — 95%+)
    IF product has UPC/GTIN → search other platforms by barcode
Step 2: Title + category similarity (medium confidence — 70-90%)
    Normalise titles (lowercase, remove filler words)
    Trigram similarity score (pg_trgm) > 0.6 = potential match
Step 3: Manual confirmation (100% confidence)
    User confirms or rejects suggested matches in UI
```

**Worker**: `cross_platform_match_worker` — fires after any product scrape completes. Runs matching across all platform pairs.

`✓ FIXED: M-2 — graph was vague, now has concrete data structure, matching algorithm, and dedicated worker`

---

#### Moat 3: Creator-Product Match Score

**Build Phase**: Phase 2
**Defensibility**: MEDIUM

AI-ranked creator recommendations per product with conversion probability.

```
match_score = CLAMP(0, 100,
    (niche_alignment         × 0.35)  // keyword overlap: creator bio tags vs product category tags
  + (historical_conversion   × 0.30)  // past sales generated for similar product categories
  + (engagement_rate         × 0.20)  // (likes + comments) / followers × 100
  + (demographics_fit        × 0.15)  // audience overlap with product target demographic
)
```

**v6.0 Improvements (✓ FIXED: M-3)**:

| Input | v5 Issue | v6 Fix |
|-------|----------|--------|
| niche_alignment | "Semantic similarity" undefined — implies expensive embeddings | v6 uses keyword tag matching (creator bio tags vs product category tags). Simple, fast, no Anthropic cost. Upgrade to embeddings in future. |
| historical_conversion | No data exists for new products/creators | Cold-start fallback: use category-average conversion rate. New creators default to 50th percentile. Score improves as data accumulates. |
| demographics_fit | Creator demographic data source unknown | Source from Apify creator profile scrapes (where publicly available). When unavailable, demographics_fit weight redistributed to other inputs (niche_alignment gets 0.45, engagement_rate gets 0.25). |

**Outreach threshold**: match_score > 70 → creator appears in outreach list

`✓ FIXED: M-3 — semantic similarity, cold-start, and demographics gaps all resolved`

---

#### Moat 4: Best Platform Recommender

**Build Phase**: Phase 3
**Defensibility**: MEDIUM

AI tells users: should you sell this product on TikTok Shop, Amazon, or Shopify?

```
platform_score[platform] = CLAMP(0, 100,
    (estimated_margin      × 0.40)  // gross margin estimate for this category on this platform
  + (demand_velocity       × 0.30)  // platform-specific search/browse volume
  + (competition_inverse   × 0.30)  // 100 - (active_sellers / market_threshold × 100)
)
```

**v6.0 Data Source Mapping (✓ FIXED: M-4)**:

| Input | Data Source | Worker |
|-------|-----------|--------|
| estimated_margin | Cost: manual input OR AliExpress Apify scrape (Phase 3). Selling price: per-platform from product scrapes. | `product_extractor_worker` + manual input UI |
| demand_velocity | TikTok: view velocity from `videos`. Amazon: BSR movement from `trend_scores`. Shopify: traffic estimate from `shops`. Google Trends: search volume from `google_trends_worker`. | Platform-specific workers + `google_trends_worker` |
| competition_inverse | TikTok: shop count selling same product. Amazon: active seller count from BSR data. Shopify: store count in same niche. | Platform-specific workers |

**Anthropic API usage**: 30 calls/day. Generates one-line rationale per product per platform recommendation. Cached — only regenerated when input scores change by >5 points.

`✓ FIXED: M-4 — data sources for all input variables now specified`

---

#### Moat 5: Automated Creator Outreach

**Build Phase**: Phase 3
**Defensibility**: MEDIUM

**v6.0 Full Specification (✓ FIXED: M-5)**:

**Email Template Structure**:
```
Subject: [AI-generated, personalised per creator+product]
Body:
  - Opening: personalised hook referencing creator's recent content
  - Value prop: why this product matches their audience
  - CTA: specific next step (reply, link to product page, schedule call)
  - Footer: unsubscribe link (mandatory — CAN-SPAM/GDPR)
```

**Anthropic Prompt** (generates subject + body):
```
Given this creator profile: {creator_bio, niche, follower_count, recent_videos}
And this product: {title, category, trend_score, platform_recommendation}
Generate a personalised outreach email that:
1. References their specific content style
2. Explains why this product fits their audience
3. Includes a clear call to action
4. Tone: professional but friendly, not salesy
Max length: 200 words.
```

**3-Email Sequence**:

| Email | Timing | Condition | Content |
|-------|--------|-----------|---------|
| 1 — Initial outreach | Day 0 (immediate) | match_score > 70 + user clicks "Reach Out" | AI-generated personalised pitch |
| 2 — Follow-up | Day 3 | No reply to email 1 | Shorter reminder with social proof |
| 3 — Final | Day 7 | No reply to email 2 | Brief "last chance" with direct CTA |
| STOP | — | Creator replies OR clicks unsubscribe OR user manually stops | Sequence halted immediately |

**Tracking** (via Resend webhooks):
- Resend webhook endpoint: `POST /api/webhooks/resend`
- Events tracked: `email.sent`, `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`
- Stored in `outreach_sequences` table (see Section 6)

**Anti-Spam Compliance**:
- Only contact creators with publicly listed email addresses
- Mandatory unsubscribe link in every email
- Respect opt-outs immediately (store in `outreach_optouts` table)
- Rate limit: max 50 outreach emails per tenant per day
- CAN-SPAM: physical address in footer (tenant's registered address)

**Outreach Dashboard**:

| Metric | Calculation |
|--------|------------|
| Emails sent | COUNT where status = 'sent' |
| Open rate | opened / sent × 100 |
| Reply rate | replied / sent × 100 |
| Conversion rate | deal_closed / sent × 100 |
| Avg response time | AVG(replied_at - sent_at) |

`✓ FIXED: M-5 — email template, sequence logic, compliance, tracking, and analytics all defined`

---

#### Moat 6: Agency Intelligence Reports

**Build Phase**: Phase 4
**Defensibility**: MEDIUM (elevated by AI-generated narrative)

**v6.0 Full Specification (✓ FIXED: M-6)**:

**Report Template** (6 sections):

| Section | Content | Data Source | AI-Generated? |
|---------|---------|-------------|---------------|
| Executive Summary | Market overview, key trends, top opportunities | Aggregated from all sections | YES — Anthropic generates narrative |
| Top Products | Top 10 products by trend_score with key metrics | `products` + `trend_scores` | Partial — AI writes commentary per product |
| Trend Analysis | 30/60/90-day trend charts, emerging niches | `trend_scores` time-series | YES — AI interprets trends |
| Creator Recommendations | Top 5 matched creators per product with outreach status | `creators` + `creator_product_links` | NO — data tables only |
| Platform Comparison | Platform scores + AI rationale per recommended product | `platform_scores` | YES — uses cached AI rationale |
| Competitive Landscape | Niche saturation, competitor store counts, opportunity gaps | `niches` + `shops` | YES — AI identifies gaps |

**PDF Generation**: `@react-pdf/renderer` (React-native PDF rendering, works in Node.js)

**Branding**:
- Agency plan: logo swap + brand colours + custom report title
- Enterprise plan: full white-label (custom domain in footer, no YouSell branding)

**Scheduling**:
- On-demand: one-click generation from any product collection
- Scheduled: weekly or monthly auto-generation + email delivery to configured recipients
- History: all generated reports stored with version timestamp, accessible from Reports page

`✓ FIXED: M-6 — report template, AI narrative, PDF library, branding, scheduling all defined`

---

### 3.3 — New Moat Features (Added in v6.0)

#### ★ NEW: MN-1 — Product Lifecycle Prediction

**Build Phase**: Phase 2
**Defensibility**: HIGH (requires 90+ days of historical data — new entrants can't replicate)

Extends the predictive engine to forecast the full product lifecycle, not just "about to trend."

**Lifecycle Stages**:

| Stage | Badge | Criteria | User Action |
|-------|-------|----------|-------------|
| Emerging | Emerging | predictive_score > 65, product_age < 7d, trend_score < 40 | Get in early — first-mover opportunity |
| Growing | Growing | trend_score 40–70, 30d slope positive, creator adoption accelerating | Scale now — demand is rising |
| Peak | Peak | trend_score > 75, 7d slope flattening or negative, saturation_score > 50 | Caution — market may be peaking |
| Declining | Declining | trend_score dropping >10 points over 14d, creator adoption slowing | Exit or discount — demand falling |
| Saturated | Saturated | saturation_score > 80, competition_inverse < 20, price compression detected | Avoid — market is oversupplied |

**Computation**: Runs as part of the `trend_scoring_worker` (no additional worker needed). Uses 30-day trend_score slope + saturation_score + creator adoption rate.

This directly resolves finding D-11 (Saturation Score undefined) by integrating saturation into a broader lifecycle model.

`★ NEW: MN-1 — solves D-11 and creates defensible data moat`

---

#### ★ NEW: MN-2 — Niche Intelligence Engine

**Build Phase**: Phase 3
**Defensibility**: HIGH (requires cross-platform niche data)

Aggregates product-level intelligence to the niche level.

**`niches` Table**:
```sql
niches (
    id uuid PK,
    tenant_id uuid NOT NULL,
    name text NOT NULL,           -- e.g., "Fitness Accessories"
    category text,                -- parent category
    product_count integer,
    avg_trend_score decimal(5,2),
    avg_saturation_score decimal(5,2),
    platform_breakdown jsonb,     -- {"tiktok": 45, "amazon": 30, "shopify": 25}
    growth_rate decimal(5,2),     -- % change over 30 days
    lifecycle_stage text,         -- 'emerging', 'growing', 'peak', 'declining', 'saturated'
    updated_at timestamptz,
    UNIQUE(tenant_id, name)
)
```

**Niche Intelligence Page**:
- Niche leaderboard (ranked by growth_rate)
- Niche lifecycle stage badges
- Cross-platform niche comparison ("fitness is +340% on TikTok but saturated on Amazon")
- Niche saturation map (bubble chart — extends existing competitor niche map)

**Computation**: Aggregated from `products` table grouped by category/niche tags. Refreshed with trend_scoring_worker.

`★ NEW: MN-2 — niche-level intelligence no competitor offers`

---

#### ★ NEW: MN-3 — Smart Alerts (AI Daily Briefing)

**Build Phase**: Phase 3
**Defensibility**: HIGH (requires cross-platform data + AI synthesis)

Instead of raw threshold alerts, generate a daily AI-curated intelligence briefing per tenant.

**`daily_briefing_worker`**:
- Runs once per day per active tenant (08:00 UTC)
- Reads: new pre-trend alerts, top movers, creator matches, niche changes from last 24h
- Sends to Anthropic: structured data summary → AI generates narrative briefing
- Output: structured JSON with sections (new_opportunities, top_movers, recommended_actions, creator_matches)
- Delivered via: email (Resend) + first card on dashboard

**Anthropic budget**: 1 call per tenant per day. At 100 tenants = 100 calls/day.

`★ NEW: MN-3 — turns raw data into actionable daily intelligence`

---

#### ★ NEW: MN-4 — Collaborative Intelligence (Team Annotations)

**Build Phase**: Phase 2
**Defensibility**: HIGH (creates switching costs)

Team annotations on products, creators, and collections.

**`annotations` Table**:
```sql
annotations (
    id uuid PK,
    tenant_id uuid NOT NULL,
    user_id uuid FK → users(id),
    target_type text NOT NULL,    -- 'product', 'creator', 'collection'
    target_id uuid NOT NULL,
    content text NOT NULL,
    is_pinned boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
)
```

**Features**:
- Notes/comments section on product detail and collection pages
- @mention team members (triggers in-app notification)
- Pin important notes to top
- Filter annotations by user, date, target

`★ NEW: MN-4 — low engineering effort, massive switching costs`

---

#### ★ NEW: MN-5 — Trend Replay

**Build Phase**: Phase 3
**Defensibility**: HIGH (requires historical data that accumulates over time)

Shows users historical trends they would have caught with YouSell.

**Dashboard Section**: "What YouSell Caught" — 3–5 recent success stories:
- Product name + image
- "Detected as pre-trend on [date]" vs "Went viral on [date]" → "[X] days early"
- Estimated market opportunity ($)
- Prediction accuracy badge

**Data Source**: Historical `predictive_signals` + `trend_scores`. Compare predicted vs actual outcomes.

**Use Cases**:
- Onboarding: "Here's what YouSell caught last week"
- Marketing: public-facing success stories
- Retention: proof of value for existing users

`★ NEW: MN-5 — historical proof of value, gets better over time`

---
## Section 4 — Smart Scraping Engine

### 4.1 — Core Principle: Demand-Driven Architecture

YouSell NEVER scrapes on fixed schedules (with one documented exception — the Predictive Engine). All scraping is triggered by user actions or system events.

**Why**: Always-on scraping costs $800–$2,000/month before a single user signs up. Demand-driven scraping reduces costs by ~85% and ensures budget is spent on data users actually view.

### 4.2 — Three Scraping Triggers

| Trigger | When It Fires | Priority | Cost Impact |
|---------|--------------|----------|-------------|
| 1. User Click (On-Demand) | User opens a section, clicks a product, or clicks Refresh button | Immediate — P0 | Minimal: only what user viewed |
| 2. Alert Threshold Breach | A product's trend_score or predictive_score crosses a configured alert threshold | Immediate — P1 | Targeted: only the triggered product |
| 3. Idle Background Refresh | No user has clicked anything in the last 3 hours | Low priority — P2 | Controlled: one platform per cycle |

**Exception — Proactive Intelligence Workers** (`✓ FIXED: D-10`):

The `predictive_discovery_worker` runs on a 2-hour schedule because pre-trend detection requires proactive analysis — you can't wait for a user to click on a product that hasn't trended yet. This is the **only** scheduled worker that makes external API calls. It is classified as a "Proactive Intelligence Worker" — a named exception to the demand-driven model.

The `daily_briefing_worker` (★ NEW: MN-3) runs once daily per tenant. It reads internal data only (no external API calls) and sends one Anthropic call per tenant.

### 4.3 — On-Demand Scraping Flow

```
User opens section → Frontend calls GET /api/{platform}/products?trigger=view
→ API checks Redis: data_freshness:{platform}:products:{tenant_id}
→ IF age < 3h: return cached DB data (LIVE badge)
→ IF age ≥ 3h: enqueue SCRAPE job (P0), return stale data + freshness badge
→ Worker runs in background
→ Worker calls checkBudget() → if budget OK → calls external API
→ Raw data → validation layer → raw_listings → transformation → products table
→ Scoring engine runs
→ Supabase Realtime pushes fresh data to page when done
→ Page updates: stale rows replaced, freshness badge updated to LIVE
```

When user clicks a product card:
```
→ Frontend calls GET /api/products/:id?trigger=click
→ API checks freshness of ALL 7 intelligence chain rows for this product
→ Each stale row → enqueue targeted scrape job for that row only
→ Fresh rows → return from DB immediately
→ Page renders with mix of fresh + stale data
→ Stale rows show [Updating...] spinner
→ Supabase Realtime updates each row as workers complete
```

### 4.4 — Idle Background Refresh (3-Hour Cycle)

```
Scheduler runs every 15 minutes, checks if refresh is due:
IF last_user_activity > 3 hours ago:
    SELECT platform FROM scrape_schedule
    WHERE tenant_id = :tenant_id
    ORDER BY last_scraped_at ASC LIMIT 1
    → Enqueue ONE platform refresh job at LOW priority (P2)
    → Log to scrape_log: { platform, trigger: 'idle_3h', cost_estimate }
```

**Rotation order** (`✓ FIXED: D-8`): TikTok → Amazon → Shopify → Facebook/Instagram → Reddit → Pinterest → Google Trends → repeat

- Each idle refresh scrapes only **top-50 products** per platform (not full catalogue)
- Google Trends and YouTube are **excluded** from idle rotation (low-frequency data; refreshed on user demand only)
- Max data staleness: 3h × 7 platforms = ~21h without user interaction (in practice, user clicks refresh much sooner)

### 4.5 — Data Freshness System

| Age | Badge | Colour | Hex | User Action |
|-----|-------|--------|-----|-------------|
| < 3 hours | LIVE | Green | #22C55E | None needed |
| 3–6 hours | RECENT | Blue | #3B82F6 | Optional: click Refresh |
| 6–24 hours | STALE | Amber | #F59E0B | Refresh recommended |
| > 24 hours | OUTDATED | Red | #EF4444 | Refresh required badge shown |
| Refreshing now | UPDATING | Pulsing blue | #3B82F6 pulse | Spinner shown, data loads live via Realtime |

`★ NEW: Hex colour values added for developer implementation. All colours pass WCAG AA contrast on white background (✓ FIXED: S-3 partial).`

### 4.6 — Three-Queue Architecture

`✓ FIXED: D-14 — priority-based queues are canonical. CLAUDE.md's functional queue names (scan_jobs, transform_jobs, scoring_jobs) are retired.`

| Queue | BullMQ Priority | Concurrency | Max Wait Target | Use Case |
|-------|----------------|-------------|-----------------|----------|
| P0_queue | priority: 10 | 5 workers simultaneously | < 30 seconds | User-triggered scrapes (section open, product click, refresh) |
| P1_queue | priority: 5 | 3 workers simultaneously | < 2 minutes | Alert threshold breaches, predictive engine |
| P2_queue | priority: 1 | 1 worker at a time | Can take hours | Idle background refresh, low-priority enrichment |
| dead_letter_queue | — | — | — | Failed jobs after 3 retries. Logged + admin alerted. Never silently dropped. |

**Job Deduplication** (`✓ FIXED: T-7`):

```typescript
// Deterministic job IDs prevent duplicate scrapes
const jobId = `scrape:${platform}:${resource}:${tenantId}`

await queue.add('scrape', jobData, {
    jobId,           // BullMQ skips if job with same ID is queued/active
    priority,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
})

// If a higher-priority job arrives for same resource,
// promote the existing job:
const existingJob = await queue.getJob(jobId)
if (existingJob && existingJob.opts.priority < newPriority) {
    await existingJob.promote()
}
```

### 4.7 — Cost Budget System

Every worker making external API calls MUST call `checkBudget()` before each request.

```typescript
async function checkBudget(workerName: string): Promise<boolean> {
    const key = `budget:${workerName}:${today()}`
    const used = await redis.get(key) || 0
    const limit = WORKER_BUDGETS[workerName]
    if (used >= limit) {
        await sendAlert(`Worker ${workerName} hit daily budget limit`)
        return false // worker pauses, job → dead_letter_queue
    }
    await redis.incr(key)
    await redis.expire(key, 86400) // reset daily
    return true
}
```

**Complete Worker Budget Table** (`✓ FIXED: D-7 — expanded from 6 to all external-calling workers`):

| # | Worker | Daily Budget | API | Est. Daily Cost |
|---|--------|-------------|-----|-----------------|
| 1 | tiktok_discovery_worker | 500 calls | Apify / RapidAPI | ~$2.50 |
| 2 | hashtag_scanner_worker | 200 calls | TikTok unofficial API | ~$1.00 |
| 3 | creator_monitor_worker | 200 calls | Apify | ~$1.00 |
| 4 | video_scraper_worker | 300 calls | Apify | ~$1.50 |
| 5 | tiktok_live_worker | 100 calls | RapidAPI | ~$0.50 |
| 6 | tiktok_ads_worker | 150 calls | TikTok Ads API | ~$0.75 |
| 7 | amazon_bsr_scanner_worker | 150 calls | Amazon PA API | ~$0.75 |
| 8 | shopify_store_discovery_worker | 100 calls | Apify | ~$0.50 |
| 9 | shopify_growth_monitor_worker | 80 calls | Apify | ~$0.40 |
| 10 | facebook_ads_worker | 200 calls | Apify | ~$1.00 |
| 11 | reddit_trend_worker | 100 calls | Reddit API | Free (API) |
| 12 | pinterest_trend_worker | 100 calls | Pinterest API | Free (API) |
| 13 | google_trends_worker | 50 calls | SerpAPI | ~$0.50 |
| 14 | youtube_worker | 100 calls | YouTube Data API | Free (quota) |
| 15 | predictive_discovery_worker | 50 calls | Anthropic API | ~$1.50 |
| 16 | platform_profitability_scorer | 30 calls | Anthropic API | ~$0.90 |
| 17 | daily_briefing_worker | 100 calls (1/tenant) | Anthropic API | ~$3.00 |
| | **TOTAL** | | | **~$15.80/day** |

`★ NEW: Workers #13, #14, #17 added. All workers now have budgets. (✓ FIXED: D-1, D-7)`

**Monthly Anthropic Spend Cap** (`✓ FIXED: T-15`):
- Global cap: $500/month (configurable)
- Per-feature caps: outreach email generation = plan limit (5/mo Pro, 50/mo Agency), AI summaries = 100/day, AI rationales cached (regenerate only when inputs change by >5 points)
- Circuit breaker: at 90% of monthly cap, all non-P0 Anthropic calls paused. Admin alerted.

### 4.8 — Canonical Worker Registry

`✓ FIXED: D-2 — definitive worker count with clear categorisation`

**Total workers: 21** (14 scraping + 5 intelligence + 2 system)

| # | Worker | Category | Trigger | Priority | External API |
|---|--------|----------|---------|----------|-------------|
| 1 | tiktok_discovery_worker | Scraping | User opens TikTok section / idle 3h | P0 or P2 | Apify / RapidAPI |
| 2 | hashtag_scanner_worker | Scraping | Fires with discovery worker | P0 or P2 | TikTok unofficial API |
| 3 | creator_monitor_worker | Scraping | User expands Influencers row | P0 or P2 | Apify |
| 4 | video_scraper_worker | Scraping | User opens Videos page / product click | P0 | Apify |
| 5 | tiktok_live_worker | Scraping | User opens Live page | P0 | RapidAPI |
| 6 | tiktok_ads_worker | Scraping | User opens Ads page | P0 or P2 | TikTok Ads API |
| 7 | amazon_bsr_scanner_worker | Scraping | User opens Amazon section / idle 3h | P0 or P2 | Amazon PA API |
| 8 | shopify_store_discovery_worker | Scraping | User opens Shopify section / idle 3h | P0 or P2 | Apify |
| 9 | shopify_growth_monitor_worker | Scraping | Fires with store discovery | P0 or P2 | Apify |
| 10 | facebook_ads_worker | Scraping | User opens Ads Intelligence page / idle 3h | P0 or P2 | Apify |
| 11 | reddit_trend_worker | Scraping | Idle refresh rotation only | P2 | Reddit API |
| 12 | pinterest_trend_worker | Scraping | Idle refresh rotation only | P2 | Pinterest API |
| 13 | google_trends_worker | Scraping | User views demand data / idle refresh | P0 or P2 | SerpAPI |
| 14 | youtube_worker | Scraping | User views YouTube data on product | P0 | YouTube Data API |
| 15 | product_extractor_worker | Intelligence | Fires after any scrape completes | P0 or P1 | Internal only |
| 16 | amazon_tiktok_match_worker | Intelligence | Fires after product_extractor completes | P1 | Internal only |
| 17 | cross_platform_match_worker | Intelligence | Fires after any product scrape completes | P1 | Internal only |
| 18 | trend_scoring_worker | Intelligence | Fires after any data scrape completes | P1 | Internal only |
| 19 | predictive_discovery_worker | Intelligence (Proactive) | Every 2h via scheduler | P1 | Anthropic API |
| 20 | platform_profitability_scorer | Intelligence | User views Best Platform row | P0 | Anthropic API |
| 21 | system_health_monitor_worker | System | Always-on (lightweight) | Always | Internal only |

`★ NEW: Workers #13 (google_trends), #14 (youtube), #17 (cross_platform_match) added (✓ FIXED: D-1, D-15)`

### 4.9 — External API Error Handling

`✓ FIXED: T-1, T-2 — error handling was entirely absent for external APIs`

#### Apify Error Handling

| Failure Mode | Detection | Response | Recovery |
|-------------|-----------|----------|----------|
| Actor run timeout | Apify status: TIMED_OUT | Log to scrape_log, retry with 2× timeout | 3 retries → dead_letter_queue |
| Apify service down | HTTP 5xx or connection refused | Circuit breaker opens (5 failures in 5 min) | Surface stale data + "Service temporarily unavailable" badge. Retry after 15 min. |
| Partial data returned | Dataset item count < expected minimum | Accept with `quality: 'partial'` flag in raw_listings | Process available data, log warning, schedule retry at P2 |
| Empty dataset | Dataset item count = 0 | Log as anomaly, do NOT overwrite existing data | Retry once at P1, then dead_letter_queue |
| Rate limited | HTTP 429 | Exponential backoff: 2s, 4s, 8s, 16s | Decrement budget counter (rate limit still costs a call) |
| Actor deprecated | Apify returns deprecation warning | Alert admin immediately | Manual intervention required — swap actor ID |

#### RapidAPI Error Handling

| Failure Mode | Detection | Response | Recovery |
|-------------|-----------|----------|----------|
| Rate limited (429) | HTTP 429 | Backoff + budget decrement | Wait for rate limit window reset |
| Quota exceeded | HTTP 429 + quota header | Halt worker for rest of day | Alert admin, resume next day |
| Response format change | Zod validation failure | Quarantine raw data, don't write to products | Alert admin — API schema may have changed |
| Service outage | HTTP 5xx | Circuit breaker (same as Apify) | Stale data + badge |

#### Redis Failure Handling (`✓ FIXED: T-4`)

| Component | Failure Mode | Response |
|-----------|-------------|----------|
| Freshness check | Redis unreachable | Treat data as stale → return DB data with STALE badge |
| Budget check | Redis unreachable | **Fail-safe: REFUSE the API call** (never fail-open on budget) |
| BullMQ job enqueue | Redis unreachable | Return stale data from DB + "Background refresh unavailable" message. Retry connection with backoff. |

#### Supabase Failure Handling (`✓ FIXED: T-5`)

| Component | Failure Mode | Response |
|-----------|-------------|----------|
| Database | Unreachable | Show cached data if any available in Redis/local cache. Disable write operations. Surface clear error. |
| Auth | Unreachable | Existing JWT tokens remain valid until expiry. Show maintenance banner. |
| Realtime | Disconnected | Fall back to polling every 30 seconds. Show "Live updates unavailable" indicator. |

### 4.10 — Data Validation Layer

`✓ FIXED: T-8 — no validation existed between raw scrape and DB`

```
Raw API Response
    ↓
Step 1: Schema Validation (Zod)
    → Validate required fields present
    → Validate field types (string, number, date)
    → Reject records with missing required fields → quarantine table
    ↓
Step 2: Data Sanitisation
    → HTML strip all text fields (prevent XSS)
    → Normalise currencies to USD (if price field present)
    → Trim whitespace, normalise unicode
    ↓
Step 3: Range Checks
    → Prices: > 0 and < 100,000
    → Scores: 0–100
    → Counts: >= 0
    → Dates: not in future, not before 2020
    → Out-of-range → quarantine with reason
    ↓
Step 4: Write to raw_listings (preserves original)
    ↓
Step 5: Transform to product/creator/video schema
    ↓
Step 6: Upsert to target table
```

**Quarantine table**:
```sql
data_quarantine (
    id uuid PK,
    tenant_id uuid NOT NULL,
    source_worker text NOT NULL,
    raw_data jsonb NOT NULL,
    failure_reason text NOT NULL,
    failure_step text NOT NULL,  -- 'schema', 'sanitise', 'range', 'transform'
    created_at timestamptz DEFAULT now(),
    resolved_at timestamptz      -- null until manually reviewed
)
```

---
## Section 5 — Complete Tech Stack

### 5.1 — Technology Table

| Layer | Technology | Version / Tier | Purpose | Deployment |
|-------|-----------|---------------|---------|------------|
| **Frontend** | Next.js 14 (App Router) | 14.x | Dashboard UI, server components for fast initial load, SSR/SSG | Netlify |
| **UI Components** | shadcn/ui + Tailwind CSS | Latest | Component library + utility-first CSS | Bundled with frontend |
| **Realtime UI** | Supabase Realtime | Via supabase-js | WebSocket push of fresh scraped data to page without reload | Supabase managed |
| **Backend API** | Node.js + Express | Node 20 LTS, Express 4.x | Read-only data API + job queue trigger endpoints | Railway |
| **Background Workers** | Node.js Worker Processes | Node 20 LTS | 21 scraping + intelligence workers (see Section 4.8) | Railway |
| **Database** | Supabase PostgreSQL | Supabase Pro plan | Primary data store, RLS for multi-tenancy, full-text search | Supabase managed |
| **Materialised Views** | PostgreSQL | — | `dashboard_cards_mv` — pre-computed home page data | Supabase managed |
| **Job Queue** | Redis + BullMQ | Redis 7.x, BullMQ 5.x | Priority job queues: P0/P1/P2 lanes + dead_letter_queue | Railway (managed Redis) |
| **Cache + Budget** | Redis | Redis 7.x | Data freshness timestamps, API budget counters, rate limit counters | Railway (same Redis instance) |
| **Auth** | Supabase Auth | Via supabase-js | Email/password, Google OAuth, magic links, JWT on all routes | Supabase managed |
| **Email** | Resend | API | Trend alerts, creator outreach sequences, onboarding, dunning emails | Resend managed |
| **Scraping — Primary** | Apify Actors | Pay-per-use | TikTok, Shopify, Facebook Ads, headless browser scraping | Apify managed |
| **Scraping — Secondary** | RapidAPI | Pay-per-use | TikTok data, creator profiles, Amazon data | RapidAPI managed |
| **Scraping — Self-built** | Custom Node.js scrapers | — | Shopify /products.json, Amazon public pages (free tier) | Railway |
| **Scraping — Search** | SerpAPI | Pay-per-use | Google Trends search volume and keyword velocity | SerpAPI managed |
| **AI Analysis** | Anthropic API (Claude Sonnet) | claude-sonnet-4-6 | Platform recommendations, trend summaries, outreach copy, daily briefings, report narratives | Anthropic managed |
| **PDF Generation** | @react-pdf/renderer | Latest | Agency intelligence report PDF generation | Railway |
| **Billing** | Stripe | API | Subscription plans, usage metering, invoicing, customer portal, webhooks | Stripe managed |
| **Monitoring** | Custom + Railway logs | — | `/api/health` endpoint, worker health, queue depth, error rate alerts | Railway |
| **Status Page** | BetterUptime (or similar) | Free/Pro | Public status page for users (linked from footer) | External |
| **Version Control** | GitHub | — | haqeeqiazadee-ux/yousell-admin | GitHub |
| **Schema Validation** | Zod | Latest | Raw data validation before DB write (see Section 4.10) | Bundled with backend |

### 5.2 — Deployment Architecture

`✓ FIXED: T-23 — Netlify serverless limitations now addressed`

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│         NETLIFY              │     │          RAILWAY              │
│                              │     │                               │
│  Next.js 14 App              │     │  Express API Server           │
│  - Server Components (SSR)   │────▶│  - All /api/* routes          │
│  - Static pages (SSG)        │     │  - Redis/BullMQ connections   │
│  - Client components         │     │  - Stripe webhook handler     │
│  - NO direct Redis/BullMQ    │     │  - Resend webhook handler     │
│  - NO direct DB writes       │     │                               │
│                              │     │  Worker Processes (×3)        │
└─────────────────────────────┘     │  - 21 workers across 3 procs  │
                                     │  - P0 proc (5 concurrency)    │
         │                           │  - P1 proc (3 concurrency)    │
         │                           │  - P2 proc (1 concurrency)    │
         ▼                           │                               │
┌─────────────────────────────┐     │  Scheduler Process            │
│        SUPABASE              │     │  - 15-min idle check          │
│                              │     │  - 2h predictive trigger      │
│  PostgreSQL Database         │◀────│  - Daily briefing trigger     │
│  - All data tables           │     │                               │
│  - RLS policies              │     └──────────────────────────────┘
│  - Materialised views        │
│  Auth Service                │
│  - JWT issuance              │
│  - OAuth providers           │
│  Realtime                    │
│  - WebSocket channels        │
└─────────────────────────────┘
```

**Key architectural decision**: Next.js on Netlify handles **frontend rendering only**. ALL API routes, Redis connections, BullMQ job management, and webhook handlers run on Railway's Express server. This avoids Netlify's 10-second serverless timeout and cold start issues.

### 5.3 — Monitoring & Health (`✓ FIXED: T-9`)

**Health Check Endpoint**: `GET /api/health`

```json
{
    "status": "healthy",
    "timestamp": "2026-03-11T10:00:00Z",
    "services": {
        "database": { "status": "up", "latency_ms": 12 },
        "redis": { "status": "up", "latency_ms": 3 },
        "bullmq": { "status": "up", "queue_depth": { "P0": 2, "P1": 5, "P2": 12 } },
        "supabase_realtime": { "status": "up" }
    }
}
```

**Alert Rules**:

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|------------------|-------------------|--------|
| P0 queue depth | > 50 jobs | > 100 jobs | Email admin |
| Worker failure rate | > 5% in 15 min | > 10% in 15 min | Email admin + pause affected worker |
| API response time | > 3 seconds (p95) | > 5 seconds (p95) | Email admin |
| Budget usage | 80% of daily limit | 100% of daily limit | Email admin / halt worker |
| Redis memory | > 75% capacity | > 90% capacity | Email admin |
| Dead letter queue | > 10 jobs in 1 hour | > 50 jobs in 1 hour | Email admin |

**Alert Destination**: Configurable per tenant (for enterprise: custom Slack webhook). Default: admin email list.

**System Health Dashboard** (admin UI page):
- Real-time queue depth chart (P0/P1/P2)
- Worker status grid (running/idle/error per worker)
- API response time graph (1h/24h/7d)
- Budget consumption bars per worker
- Recent errors list with stack traces

### 5.4 — Backup & Disaster Recovery (`✓ FIXED: T-10`)

| Component | Backup Strategy | Frequency | Retention |
|-----------|----------------|-----------|-----------|
| Supabase PostgreSQL | Supabase automatic backups + point-in-time recovery | Continuous (WAL) | 7 days (Pro plan) |
| Redis | Railway managed Redis with RDB snapshots | Hourly | 24 hours |
| Application code | GitHub repository | Every commit | Indefinite |
| Environment variables | Railway encrypted env vars | On change | Current only |

**Recovery Targets**:
- **RTO** (Recovery Time Objective): 4 hours — full service restoration
- **RPO** (Recovery Point Objective): 1 hour — maximum acceptable data loss

**Disaster Recovery Runbook** (reference — stored in `/docs/disaster-recovery.md`):
1. Database corruption → restore from Supabase point-in-time recovery
2. Redis data loss → Redis is ephemeral cache + queue; rebuild from DB state. Budget counters reset (safe — worst case is re-spending today's budget). Queue jobs re-enqueue automatically.
3. Railway outage → deploy to backup Railway project (pre-configured, env vars cloned)
4. Supabase outage → no failover (single provider). Display maintenance page. Monitor Supabase status page.

### 5.5 — API Keys Required

| Key | Status | Used By |
|-----|--------|---------|
| ANTHROPIC_API_KEY | Available | predictive_discovery_worker, platform_profitability_scorer, daily_briefing_worker, outreach email gen, report narratives |
| APIFY_API_TOKEN | Available | tiktok_discovery, creator_monitor, video_scraper, shopify_store_discovery, shopify_growth_monitor, facebook_ads |
| RAPIDAPI_KEY | Available | tiktok_live_worker, amazon_bsr_scanner (secondary) |
| SUPABASE_URL | Available | All services |
| SUPABASE_SERVICE_ROLE_KEY | Available | Backend API + workers (bypasses RLS for admin operations) |
| SUPABASE_ANON_KEY | Available | Frontend (public, RLS-enforced) |
| REDIS_URL | Available | BullMQ, cache, budget, rate limiting |
| RESEND_API_KEY | Available | Trend alerts, outreach emails, onboarding, dunning |
| AMAZON_PA_API_KEY | Available | amazon_bsr_scanner_worker |
| STRIPE_SECRET_KEY | Available | Billing API, subscription management |
| STRIPE_WEBHOOK_SECRET | Available | Stripe webhook signature verification |
| SERPAPI_KEY | Needed | google_trends_worker |
| REDDIT_CLIENT_ID + SECRET | Needed | reddit_trend_worker |
| YOUTUBE_API_KEY | Needed | youtube_worker |

`✓ FIXED: D-1 — SERPAPI_KEY and YOUTUBE_API_KEY now have defined workers that use them`

---
## Section 6 — Multi-Tenancy, Auth & Compliance

### 6.1 — Tenant Model

```sql
tenants (
    id uuid PK DEFAULT gen_random_uuid(),
    name text NOT NULL,
    plan text NOT NULL DEFAULT 'starter',  -- 'starter', 'pro', 'agency', 'enterprise', 'trial', 'locked'
    billing_cycle text DEFAULT 'monthly',  -- 'monthly', 'annual'
    trial_ends_at timestamptz,             -- null if not on trial
    stripe_customer_id text,
    stripe_subscription_id text,
    custom_domain text,
    brand_config jsonb DEFAULT '{}',       -- { logo_url, primary_color, company_name }
    api_keys jsonb DEFAULT '{}',           -- per-tenant external API key overrides (enterprise)
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
)
```

`✓ FIXED: D-6 — clarified that per-tenant API keys live in tenants.api_keys jsonb. No separate platform_configs table.`

### 6.2 — User Model & Roles

```sql
users (
    id uuid PK,                            -- = Supabase Auth user id
    tenant_id uuid NOT NULL FK → tenants(id),
    role text NOT NULL DEFAULT 'viewer',   -- 'super_admin', 'agency_owner', 'analyst', 'viewer'
    email text NOT NULL,
    display_name text,
    avatar_url text,
    last_active_at timestamptz,
    created_at timestamptz DEFAULT now()
)
```

**Role-Based Access Control**:

| Role | Intelligence Features | Data Management | Team Management | Billing | System Config |
|------|----------------------|-----------------|-----------------|---------|---------------|
| super_admin | All | All (export, save, alert, archive) | All (invite, change roles, remove) | All (plan changes, invoices) | All (white-label, API keys) |
| agency_owner | All | All | All except billing | View invoices only | Brand config only |
| analyst | All | All (export, save, alert, archive) | View team only | None | None |
| viewer | View dashboards and reports only | Read-only | View team only | None | None |

### 6.3 — Team Invitation Flow

`★ NEW: S-9 — team invitation and multi-user management (P0 launch blocker)`

```sql
invitations (
    id uuid PK DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL FK → tenants(id),
    invited_by uuid NOT NULL FK → users(id),
    email text NOT NULL,
    role text NOT NULL DEFAULT 'analyst',
    token text NOT NULL UNIQUE,            -- secure random token for invite link
    expires_at timestamptz NOT NULL,       -- 7 days from creation
    accepted_at timestamptz,               -- null until accepted
    created_at timestamptz DEFAULT now()
)
```

**Flow**:
1. Owner/admin enters email + role on Team Management page
2. System creates invitation record + sends email via Resend with invite link
3. Invite link: `{app_url}/invite/{token}`
4. Invitee clicks link → if no account, signs up via Supabase Auth → auto-assigned to tenant with pre-set role
5. If invitee already has an account on different tenant → error ("This email is already associated with another organisation")
6. Invitation expires after 7 days. Owner can resend.

**Seat Limits Per Plan**:

| Plan | Max Users |
|------|-----------|
| Starter | 1 |
| Pro | 3 |
| Agency | 10 |
| Enterprise | Unlimited (configurable) |

### 6.4 — Authentication

**Supabase Auth configuration**:
- Email/password sign-up
- Google OAuth
- Magic links (passwordless)
- JWT on all API routes

**JWT Configuration** (`✓ FIXED: T-11 — defence in depth`):
- JWT expiry: 15 minutes (short-lived)
- Refresh token: 7 days
- JWT claims include: `user_id`, `tenant_id`, `role`
- JWT blacklist on logout (stored in Redis, checked on each request)

**Application-Layer Tenant Enforcement** (`✓ FIXED: T-11`):

```typescript
// Express middleware — belt-and-suspenders with RLS
function enforceTenantIsolation(req, res, next) {
    const jwtTenantId = req.user.tenant_id
    const requestedTenantId = req.params.tenantId || req.query.tenantId

    if (requestedTenantId && requestedTenantId !== jwtTenantId) {
        // Log cross-tenant access attempt
        await logSecurityEvent({
            type: 'cross_tenant_access_attempt',
            user_id: req.user.id,
            jwt_tenant: jwtTenantId,
            requested_tenant: requestedTenantId,
            ip: req.ip,
            path: req.path
        })
        return res.status(403).json({ error: 'Access denied' })
    }
    next()
}
```

### 6.5 — Row-Level Security (RLS)

ALL data tables include `tenant_id uuid NOT NULL`. Supabase RLS enforces isolation at the database level.

**Standard RLS policy** (applied to every data table):

```sql
CREATE POLICY "Tenant isolation" ON {table_name}
    FOR ALL
    USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);
```

**Admin-only tables** (scrape_log, scrape_schedule, api_usage_log, data_quarantine):

```sql
CREATE POLICY "Admin only" ON {table_name}
    FOR ALL
    USING (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND (auth.jwt()->>'role') IN ('super_admin', 'agency_owner')
    );
```

**Tenant A can NEVER see tenant B's data — enforced at both DB level (RLS) and application level (middleware).**

### 6.6 — API Rate Limiting

`✓ FIXED: T-12 — no rate limiting existed on API routes`

Implemented via Redis counters in Express middleware.

| Endpoint Category | Rate Limit | Window | Scope |
|------------------|-----------|--------|-------|
| Auth (login, signup, magic link) | 5 requests | 15 minutes | Per IP |
| Scrape triggers (section open, refresh) | 10 requests | 1 minute | Per user |
| Product detail (click) | 30 requests | 1 minute | Per user |
| Data export | 5 requests | 1 hour | Per user |
| Public API (Agency/Enterprise) | Plan limit / 30 | Per day (divided into 30-day month) | Per tenant |
| Outreach email send | 10 requests | 1 hour | Per user |

**Response on rate limit**: HTTP 429 with `Retry-After` header.

### 6.7 — Onboarding Flow

**5-Step Onboarding**:

| Step | Action | Implementation |
|------|--------|----------------|
| 1 | Sign up | Supabase Auth creates user. System creates tenant record with `plan: 'trial'`, `trial_ends_at: now() + 14 days`. |
| 2 | Plan preview | Show plan comparison. Trial starts on Pro plan. "You'll choose a plan before your trial ends." |
| 3 | Platform connection | Wizard: select TikTok region, Amazon marketplace, Shopify niche filters. Stored in `tenants.brand_config.platform_preferences`. |
| 4 | First scrape triggered | Enqueue P0 scrape for selected platforms. Dashboard shows skeleton loading states (see Section 8). |
| 5 | Onboarding checklist | Persistent sidebar checklist: "Set your first alert" (done?), "Save a product" (done?), "Find a creator" (done?). Dismissed when all 3 complete. |

**Onboarding Empty States** (`★ NEW: S-1 — P0 launch blocker`):

| State | What User Sees |
|-------|---------------|
| First scrape running (0–3 min) | Skeleton loading cards with shimmer animation + "Setting up your intelligence feed... this takes about 2 minutes" message |
| First scrape complete, few products | Real product cards + "Your feed is building. More products will appear as we scan more sources." banner |
| Demo data toggle | Optional: "See how YouSell works with sample data" button. Shows pre-loaded demo products. Toggle off returns to real data. |

**Re-engagement** (`★ NEW: S-1`):
- If onboarding checklist not completed within 24h → Resend email: "You're 2 steps away from your first product insight"
- If user hasn't logged in within 48h of signup → Resend email: "Your trend feed is ready — here's what's trending this week"

### 6.8 — Billing Architecture (Stripe)

**Plan Selection**:
- Stripe Checkout for initial plan selection and trial-to-paid conversion
- Stripe Customer Portal for self-service plan changes and invoice history

**Usage Metering** (via Stripe Meters):
- Products tracked (count against plan limit)
- API calls (Agency/Enterprise)
- Outreach emails sent (Pro: 5/mo, Agency: 50/mo)
- Alerts fired (Starter: 3, Pro: 25)

**Overage Protection**: Usage limits enforced in application middleware BEFORE they cost money. Approaching-limit warning at 80%.

**Free Trial** (`✓ FIXED: T-18 — trial lifecycle fully defined`):

| Day | Event | Action |
|-----|-------|--------|
| 0 | Sign up | Create tenant with `plan: 'trial'`, `trial_ends_at: now() + 14d`. Full Pro plan access. No card required. |
| 7 | Reminder | Resend email: "Your trial is halfway through. Here's what you've discovered so far: [stats]." |
| 12 | Urgent reminder | Resend email: "2 days left on your trial. Upgrade to keep your data and intelligence feed." |
| 14 | Trial expires | Downgrade to `plan: 'locked'`. Can view dashboard (read-only). Cannot trigger scrapes, export, or send outreach. Banner: "Your trial has ended. Choose a plan to continue." |
| 21 | Final reminder | Resend email: "Your data will be archived in 9 days. Upgrade to keep it." |
| 30 | Data archived | Data moved to cold storage. Account still exists. Can re-activate by selecting plan. |

**Dunning Flow** (`★ NEW: S-12 — P0 launch blocker`):

**Stripe Webhook Handling** (`✓ FIXED: T-3`):

Endpoint: `POST /api/webhooks/stripe`

```typescript
// Verify webhook signature
const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
)

// Idempotency: store event.id in processed_webhooks table
// Skip if already processed
```

**Events handled**:

| Stripe Event | Action |
|-------------|--------|
| `checkout.session.completed` | Activate subscription. Update tenant plan. Send welcome email. |
| `invoice.payment_succeeded` | Update `tenant.plan_active_until`. Log payment. |
| `invoice.payment_failed` | Start dunning flow (see below). |
| `customer.subscription.updated` | Update tenant plan + limits. Handle upgrade/downgrade (see S-13). |
| `customer.subscription.deleted` | Set tenant `plan: 'locked'`. Start 30-day data preservation. |

**Dunning Timeline**:

| Day | Event | Tenant State | User Experience |
|-----|-------|-------------|-----------------|
| 0 | Payment fails | `plan_status: 'past_due'` | Stripe auto-retries. Email: "We couldn't charge your card. Please update your payment method." + Stripe Customer Portal link. |
| 3 | Grace period ends | `plan_status: 'grace_expired'` | Full access continues. Email: "Action required — update payment within 4 days to avoid service interruption." |
| 7 | Restricted mode | `plan_status: 'restricted'` | Read-only access. No scrapes, no exports, no outreach. Banner: "Your account is restricted due to payment failure. Update payment to restore access." |
| 14 | Account locked | `plan_status: 'locked'` | Cannot access dashboard. Login redirects to payment update page. Email: "Your account is locked. Data preserved for 16 more days." |
| 30 | Data archived | `plan_status: 'archived'` | Data moved to cold storage. Account shell preserved. Can re-activate with new payment. |

**Upgrade/Downgrade Proration** (`★ NEW: S-13`):

| Action | Billing | Data | Feature Access |
|--------|---------|------|----------------|
| Upgrade (e.g., Starter → Pro) | Prorated charge immediately via Stripe | New limits effective immediately. Historical data preserved. | New features available immediately. |
| Downgrade (e.g., Agency → Pro) | Takes effect at end of current billing cycle | Excess products marked `status: 'archived'` (not deleted). User warned before confirming: "You will lose access to: Agency reports. 20,000 of your 25,000 products will be archived." | Features restricted at cycle end. |

**Annual Plans** (`★ NEW: S-14`):

| Plan | Monthly | Annual (20% off) |
|------|---------|-------------------|
| Starter | $49/mo | $39/mo ($468/yr) |
| Pro | $149/mo | $119/mo ($1,428/yr) |
| Agency | $349/mo | $279/mo ($3,348/yr) |
| Enterprise | Custom | Custom |

Toggle on pricing page. Stripe handles annual invoicing natively.

### 6.9 — Database Schema (Complete)

`✓ FIXED: D-5 — raw_listings added. S-4, S-9, S-15, S-16 tables added.`

#### Core Intelligence Tables

| Table | Purpose | RLS Policy |
|-------|---------|-----------|
| tenants | Organisation accounts, plan config, branding | Super admin only |
| users | User accounts linked to tenants | Own row + admin |
| products | Core product intelligence data | By tenant_id |
| creators | Creator profiles across platforms | By tenant_id |
| videos | Video content linked to products/creators | By tenant_id |
| shops | Store profiles (TikTok Shop, Shopify stores, Amazon sellers) | By tenant_id |
| ads | Ad creative data across platforms | By tenant_id |
| trend_scores | Time-series trend score history per product | By tenant_id |
| platform_scores | AI-generated platform profitability scores | By tenant_id |
| product_platform_matches | Cross-platform product graph (edge table) | By tenant_id |
| creator_product_links | Creator-product relationships with match scores | By tenant_id |
| affiliate_programs | Affiliate programme data per product | By tenant_id |
| predictive_signals | Pre-trend detection signals | By tenant_id |
| niches | Niche-level aggregated intelligence (★ NEW: MN-2) | By tenant_id |
| raw_listings | Raw scrape data before transformation (✓ FIXED: D-5) | By tenant_id |

#### User Activity Tables

| Table | Purpose | RLS Policy |
|-------|---------|-----------|
| alert_configs | User-configured trend alert thresholds | By tenant_id + user |
| saved_collections | Saved product/creator bookmarks | By tenant_id + user |
| product_user_status | Dismiss/archive status per user per product (★ NEW: S-16) | By tenant_id + user |
| saved_views | Custom filter/sort/column configurations (★ NEW: S-6) | By tenant_id + user |
| annotations | Team notes on products/creators/collections (★ NEW: MN-4) | By tenant_id |
| notification_preferences | Per-user notification channel/frequency config (★ NEW: S-4) | By tenant_id + user |
| notifications | In-app notification records | By tenant_id + user |

#### Outreach & Communication Tables

| Table | Purpose | RLS Policy |
|-------|---------|-----------|
| outreach_sequences | Creator outreach email tracking (★ NEW: per M-5) | By tenant_id |
| outreach_optouts | Creator email opt-out records | By tenant_id |

#### Billing & Team Tables

| Table | Purpose | RLS Policy |
|-------|---------|-----------|
| invitations | Team member invitation tokens (★ NEW: S-9) | By tenant_id (admin only) |
| referrals | Referral tracking (★ NEW: S-15) | By tenant_id |
| processed_webhooks | Stripe webhook idempotency tracking | System only |

#### System Tables

| Table | Purpose | RLS Policy |
|-------|---------|-----------|
| scrape_log | Worker execution history | Admin only |
| scrape_schedule | Platform refresh schedule | Admin only |
| api_usage_log | API usage + audit log | Admin only |
| data_quarantine | Failed validation records (★ NEW: per T-8) | Admin only |
| dashboard_cards_mv | MATERIALISED VIEW — pre-joined product intelligence | By tenant_id |

#### Webhook Config Tables

| Table | Purpose | RLS Policy |
|-------|---------|-----------|
| webhook_configs | User-configured webhook endpoints for alerts (★ NEW: per brief 14.9) | By tenant_id (admin only) |

### 6.10 — Database Migration Strategy

`✓ FIXED: T-24 — no migration strategy existed`

- **Tool**: Supabase CLI (`supabase migration new`, `supabase db push`)
- **Storage**: All migrations in `supabase/migrations/` directory, committed to Git
- **Testing**: All migrations tested against a staging Supabase project before production
- **Reversibility**: Every migration has a corresponding down migration where possible
- **Zero-downtime**: Use `ALTER TABLE ... ADD COLUMN` (non-blocking) instead of table recreations

### 6.11 — GDPR & Privacy Compliance

`✓ FIXED: T-16 — no GDPR compliance existed`

#### Consent & Data Collection

| Data Type | Legal Basis | User Consent Required? |
|-----------|------------|----------------------|
| User account data (email, name) | Contract (service delivery) | Terms acceptance at signup |
| Scraped product data (public) | Legitimate interest | No (publicly available data) |
| Creator data (public profiles) | Legitimate interest | No (publicly available data) |
| Creator outreach (email) | Legitimate interest + consent | CAN-SPAM: unsubscribe link. GDPR: publicly listed email only. |
| Analytics / usage tracking | Legitimate interest | Cookie consent banner |

#### Right to Deletion (GDPR Article 17)

**Cascade delete across ALL tables** when a tenant requests deletion:

```sql
-- Order matters for FK constraints
DELETE FROM notifications WHERE tenant_id = :id;
DELETE FROM notification_preferences WHERE tenant_id = :id;
DELETE FROM outreach_optouts WHERE tenant_id = :id;
DELETE FROM outreach_sequences WHERE tenant_id = :id;
DELETE FROM annotations WHERE tenant_id = :id;
DELETE FROM product_user_status WHERE tenant_id = :id;
DELETE FROM saved_views WHERE tenant_id = :id;
DELETE FROM saved_collections WHERE tenant_id = :id;
DELETE FROM alert_configs WHERE tenant_id = :id;
DELETE FROM webhook_configs WHERE tenant_id = :id;
DELETE FROM predictive_signals WHERE tenant_id = :id;
DELETE FROM affiliate_programs WHERE tenant_id = :id;
DELETE FROM creator_product_links WHERE tenant_id = :id;
DELETE FROM product_platform_matches WHERE tenant_id = :id;
DELETE FROM platform_scores WHERE tenant_id = :id;
DELETE FROM trend_scores WHERE tenant_id = :id;
DELETE FROM ads WHERE tenant_id = :id;
DELETE FROM shops WHERE tenant_id = :id;
DELETE FROM videos WHERE tenant_id = :id;
DELETE FROM creators WHERE tenant_id = :id;
DELETE FROM products WHERE tenant_id = :id;
DELETE FROM niches WHERE tenant_id = :id;
DELETE FROM raw_listings WHERE tenant_id = :id;
DELETE FROM data_quarantine WHERE tenant_id = :id;
DELETE FROM scrape_log WHERE tenant_id = :id;
DELETE FROM scrape_schedule WHERE tenant_id = :id;
DELETE FROM api_usage_log WHERE tenant_id = :id;
DELETE FROM invitations WHERE tenant_id = :id;
DELETE FROM referrals WHERE tenant_id = :id;
DELETE FROM users WHERE tenant_id = :id;
DELETE FROM tenants WHERE id = :id;
```

**Processing time**: 30 days from request (GDPR allows this). Confirmation email sent on completion.

#### Subject Access Request (SAR)

User can request full data export from Settings page. Export includes: all products, creators, collections, alerts, outreach history, usage logs. Delivered as ZIP of CSV files via email.

#### Data Retention Policy (`★ NEW: S-8`)

| Data Type | Retention | Visible to User |
|-----------|-----------|----------------|
| Product intelligence data | While subscription active | Yes (Settings page) |
| Trend score history | 90 days rolling | Yes (Settings page) |
| Scrape logs | 90 days | Admin only |
| API usage logs | 90 days | Admin only |
| Notifications | 30 days | Yes |
| Dead letter queue | 30 days | Admin only |
| Data after cancellation | 30 days preserved, then archived | Yes (cancellation flow warning) |

**Nightly cleanup job**: Runs at 03:00 UTC. Deletes records past retention period. Logs rows deleted to scrape_log.

### 6.12 — Client Sharing (Agency Feature)

`★ NEW: S-11 — external client sharing`

**Shareable Links** (Agency + Enterprise plans):
- Token-based read-only links for product pages and collections
- Expiry: configurable (7d, 30d, 90d, or no expiry)
- URL format: `{app_url}/share/{token}`
- No login required for viewer. Data scoped to shared items only.

**Client Portal** (Enterprise plan):
- Lightweight view-only dashboard branded with agency logo
- Client accounts: sub-users under agency tenant with `viewer` role
- Restricted to shared collections only (not full product feed)

---
## Section 7 — Universal Product Intelligence Chain

### 7.1 — Chain Parity Requirement

Every product on every platform shows this identical 7-row intelligence chain. Chain parity across TikTok, Amazon, and Shopify is a **non-negotiable requirement**. Each row adapts its data sources per platform but maintains the same structure and depth.

### 7.2 — The 7 Rows

#### Row 1 — Product Identity

| Field | Description | Source |
|-------|------------|--------|
| Image | Primary product image | Platform scrape |
| Title | Product title (normalised) | Platform scrape |
| Category | Product category / niche | Platform scrape + AI classification |
| Product type | physical / digital / SaaS / AI | AI classification |
| Source platform badge | TikTok / Amazon / Shopify | Platform of first discovery |
| Trend badge | Trending / Pre-Trend / — | trend_score > 75 or predictive_score > 65 |
| Lifecycle badge | Emerging / Growing / Peak / Declining / Saturated (★ NEW: MN-1) | lifecycle_stage computed field |
| First detected date | When YouSell first found this product | products.created_at |
| Price range | Min–max price across platforms | product_platform_matches prices |
| Data freshness badge | LIVE / RECENT / STALE / OUTDATED / UPDATING | Redis freshness key |

**Worker**: `product_extractor_worker` — fires after any scrape completes
**Trigger to refresh**: On product click
**Max stale age**: 24 hours

---

#### Row 2 — Product Stats

| Field | Description | Source |
|-------|------------|--------|
| Trend Score (0–100) | Viral momentum score | trend_scoring_worker |
| Predictive Score (0–100) | Pre-trend detection confidence | predictive_discovery_worker |
| Saturation Score (0–100) | Market saturation level (✓ FIXED: D-11) | trend_scoring_worker (lifecycle computation) |
| Lifecycle Stage | Emerging → Growing → Peak → Declining → Saturated (★ NEW: MN-1) | Derived from trend slope + saturation |
| Est. monthly sales (units) | Estimated units sold per month | Platform-specific estimation |
| Est. monthly revenue ($) | sales × avg price | Computed |
| Price history chart | 30/60/90 day price trend | trend_scores time-series |
| Review count & velocity | Total reviews + reviews/week | Platform scrape (Amazon, Shopify) |
| Search volume trend | Google Trends interest over time | google_trends_worker (✓ FIXED: D-1) |
| 7d / 30d / 90d momentum graphs | Trend score over time periods | trend_scores time-series |
| Platform breakdown bar | % presence across platforms | product_platform_matches |

**Worker**: `trend_scoring_worker` + `amazon_bsr_scanner_worker` + `google_trends_worker`
**Trigger to refresh**: On product click
**Max stale age**: 3 hours

---

#### Row 3 — Related Influencers (ranked by Creator-Product Match Score)

| Field | Description | Source |
|-------|------------|--------|
| Avatar | Creator profile image | creator_monitor_worker |
| Username | Creator handle | creator_monitor_worker |
| Platform | TikTok / YouTube / Instagram | creator_monitor_worker |
| Followers | Total follower count | creator_monitor_worker |
| Engagement rate | (likes + comments) / followers × 100 | Computed |
| Niche alignment % | Keyword overlap score | match_score computation |
| Est. sales generated | Historical sales for similar products | creator_product_links |
| Videos made | Count of videos featuring this product | videos table |
| Match Score (0–100) | Creator-Product Match Score | Section 10 algorithm |
| Outreach button | Generates email copy (Anthropic) → sends via Resend | Outreach system (Section 3, Moat 5) |

**Worker**: `creator_monitor_worker` + match engine
**Trigger to refresh**: On row expand
**Max stale age**: 6 hours

---

#### Row 4 — Marketplace Presence

`✓ FIXED: D-9 — renamed from "TikTok Shops" to "Marketplace Presence" for chain parity`

This row adapts per source platform:

**When product source = TikTok**:

| Field | Description |
|-------|------------|
| Shop name | TikTok Shop name |
| Logo | Shop logo |
| TikTok followers | Shop follower count |
| Est. GMV/month | Gross merchandise value estimate |
| Units sold | Total units sold |
| Active creator count | Creators promoting for this shop |
| Ads running | Number of active ads |
| Growth rate % | Month-over-month growth |
| Commission rate | TikTok affiliate programme rate (if available) |

**When product source = Amazon**:

| Field | Description |
|-------|------------|
| Seller name | Amazon seller / brand name |
| BSR rank | Best Sellers Rank in category |
| Price | Current Amazon price |
| Reviews | Total review count |
| Review velocity | New reviews per week |
| Est. monthly sales | Estimated units/month |
| FBA/FBM | Fulfilment method |
| Category rank change | BSR movement over 30d |

**When product source = Shopify**:

| Field | Description |
|-------|------------|
| Store name | Shopify store name |
| Store URL | Full URL |
| Traffic estimate | Monthly visitor estimate |
| Est. revenue | Monthly revenue estimate |
| Product count | Total products in store |
| Ad spend signal | Detected ad activity |
| Tech stack | Detected Shopify apps |
| Growth rate % | Month-over-month traffic growth |

**Worker**: `tiktok_discovery_worker` / `amazon_bsr_scanner_worker` / `shopify_store_discovery_worker` (platform-dependent)
**Trigger to refresh**: On row expand
**Max stale age**: 3 hours

---

#### Row 5 — Other Sales Channels (cross-platform presence)

Shows the same product on OTHER platforms (not the source platform).

| Platform | Fields | Worker |
|----------|--------|--------|
| Amazon | ASIN, BSR rank, Price, Reviews, Est. monthly sales | amazon_tiktok_match_worker + cross_platform_match_worker |
| Shopify | Store URL, Traffic estimate, Revenue, Ad signal | shopify_store_discovery_worker + cross_platform_match_worker |
| TikTok | TikTok Shop, GMV, Creator count, Growth | tiktok_discovery_worker + cross_platform_match_worker |
| YouTube | Channel, Views, Affiliate link detected, Sub count | youtube_worker (✓ FIXED: D-1) |
| Pinterest | Board saves, Traffic signal, Pin velocity | pinterest_trend_worker |
| eBay | Placeholder: "Coming soon" (✓ FIXED: T-20) | No worker yet — Phase 3 future addition |

**Data source**: `product_platform_matches` table (cross-platform graph edges) + platform-specific tables

**Worker**: `cross_platform_match_worker` (✓ FIXED: D-15 — this worker now exists)
**Trigger to refresh**: On row expand
**Max stale age**: 6 hours

---

#### Row 6 — Viral Videos & Ads

| Field | Description | Source |
|-------|------------|--------|
| Thumbnail | Video thumbnail image | video_scraper_worker |
| Platform | TikTok / YouTube / Instagram | video_scraper_worker |
| Creator | Creator username (linked to Row 3) | video_scraper_worker |
| Views | Total view count | video_scraper_worker |
| Likes | Like count | video_scraper_worker |
| Shares | Share count | video_scraper_worker |
| Comments | Comment count | video_scraper_worker |
| Engagement velocity | Views per hour (current) | Computed from time-series |
| Organic vs Ad classification | Is this organic content or a paid ad? | AI classification or `is_ad` flag |
| Est. ad spend | Estimated spend (ads only) | facebook_ads_worker / tiktok_ads_worker |
| Duplication count | Same creative on N accounts (ads only) | facebook_ads_worker / tiktok_ads_worker |
| Ad run duration | How long this ad has been running | facebook_ads_worker / tiktok_ads_worker |

**Worker**: `video_scraper_worker` + `facebook_ads_worker` + `tiktok_ads_worker`
**Trigger to refresh**: On row expand
**Max stale age**: 3 hours

---

#### Row 7 — Best Platform Recommendation (AI-powered)

| Field | Description | Source |
|-------|------------|--------|
| Recommended platform | Top-ranked platform with score (e.g., "TikTok Shop: 94/100") | platform_profitability_scorer |
| Ranked list | All platforms with scores | platform_scores table |
| Per-platform breakdown | Margin estimate, competition level, demand score | platform_scores table |
| AI rationale | One-line explanation from Anthropic | Anthropic API (cached) |
| Supplier match | AliExpress/CJ suggestion with MOQ, price, lead time | Manual input + future supplier scrape (Phase 3) |
| Data freshness badge | LIVE / RECENT / STALE / OUTDATED | Redis freshness key |
| Manual refresh button | Click to re-run platform profitability scorer | Enqueues P0 job |

**Worker**: `platform_profitability_scorer` (Anthropic API)
**Trigger to refresh**: On product click
**Max stale age**: 12 hours

### 7.3 — Chain Data Sources Summary

| Row | Data Source | Trigger | Max Stale | Priority |
|-----|-----------|---------|-----------|----------|
| 1 — Identity | product_extractor_worker | Product click | 24h | P0 |
| 2 — Stats | trend_scoring_worker + BSR + google_trends | Product click | 3h | P0 |
| 3 — Influencers | creator_monitor + match engine | Row expand | 6h | P0 |
| 4 — Marketplace | Platform-specific workers | Row expand | 3h | P0 |
| 5 — Other Channels | cross_platform_match_worker | Row expand | 6h | P0 |
| 6 — Videos & Ads | video_scraper + ad workers | Row expand | 3h | P0 |
| 7 — Best Platform | platform_profitability_scorer | Product click | 12h | P0 |

---
## Section 8 — Home Dashboard

### 8.1 — Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                        │
│ [YouSell logo] [Search bar (Cmd+K)] [What's New ★] [Alerts bell 3] [Profile] │
├──────────────────────────────────────────────────────────────────────────────┤
│ ONBOARDING BAR (if checklist incomplete — dismissible)                        │
│ ✓ Set your first alert  ○ Save a product  ○ Find a creator  [2/3 complete]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ LIVE STATS BAR (from dashboard_cards_mv, updated every 3h)                   │
│ Products: 48,291 · Creators: 12,440 · Alerts Today: 7                       │
│ TikTok Trending: 124 · Amazon Rising: 38 · Shopify Scaling: 19              │
│ Last updated: 47 min ago [Refresh Now]  Data: LIVE                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ DAILY BRIEFING CARD (★ NEW: MN-3 — collapsed by default)                    │
│ "3 products in fitness are showing pre-trend signals. Creator adoption..."   │
│ [Read Full Briefing →]                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ TREND REPLAY (★ NEW: MN-5 — 3 success stories, horizontal scroll)          │
│ [Product A: detected 5d early] [Product B: detected 3d early] [...]         │
├──────────────────────────────────────────────────────────────────────────────┤
│ FILTER TABS + BULK ACTIONS                                                   │
│ [All] [Trending] [Pre-Trend] [TikTok] [Amazon] [Shopify] [Saved Views ▼]   │
│ Sort: [Trend Score ▼] [Predictive] [Revenue] [Newest] [Lifecycle Stage]     │
│ [Select all checkbox]  When selected: [Save] [Alert] [Export] [Compare]     │
├──────────────────────────────────────────────────────────────────────────────┤
│ PRODUCT INTELLIGENCE CARDS (20 cards, lazy-loaded, infinite scroll)          │
│ Each card: checkbox + condensed 7-row chain + action buttons                 │
│ [□] [Image] Title · Platform · TrendScore · Lifecycle · Price               │
│      Creators: 12 · Shops: 4 · Videos: 89 · Freshness: LIVE                │
│      [View Detail] [Save] [Find Creators] [Set Alert] [Dismiss ✕]          │
├──────────────────────────────────────────────────────────────────────────────┤
│ SECONDARY INTELLIGENCE ROWS (horizontal scrolling cards):                    │
│ Pre-Trend Picks (predictive_score > 65, product_age < 7d)                   │
│ Fastest Growing Creators this week                                           │
│ Stores Scaling Right Now                                                     │
│ Ad Creatives Gaining Traction                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ CONTEXTUAL HELP (★ NEW: S-7 — hover tooltips on all scores/badges)          │
│ [?] on Trend Score → "Measures viral momentum. 0-100. >75 = hot product"    │
│ [?] on Lifecycle → "Shows where this product is in its market lifecycle"     │
│ [?] on Predictive → "AI confidence that this product will trend in 3-7 days"│
├──────────────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                                       │
│ [Help Centre] [Status Page] [Feedback] [Terms] [Privacy]                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 — Dashboard Refresh Logic

`✓ FIXED: D-12 — inverted condition corrected`

| Trigger | Condition | Action | Priority |
|---------|-----------|--------|----------|
| User opens dashboard | IF `dashboard_cards_mv.last_refreshed` age **>= 3 hours** | Return stale data + STALE badge, enqueue REFRESH_DASHBOARD_HOME at P2 | P2 |
| User opens dashboard | IF `dashboard_cards_mv.last_refreshed` age **< 3 hours** | Return fresh materialised view (<300ms). Badge: LIVE | — |
| User clicks [Refresh Now] | Always | Enqueue REFRESH_DASHBOARD_HOME at P0. Show UPDATING state. Supabase Realtime pushes update. | P0 |
| User clicks product card | Always | Enqueue REFRESH_PRODUCT_CHAIN(product_id) at P0. Navigate to detail. Stale rows show UPDATING. | P0 |
| Idle 3-hour background | No user activity > 3h | Enqueue REFRESH_DASHBOARD_HOME at P2 + ONE platform refresh (rotating) at P2 | P2 |

### 8.3 — Materialised View Strategy

`✓ FIXED: T-6 — materialised view tenant isolation strategy defined`

**Architecture**: Single global materialised view with `tenant_id` column + composite index.

```sql
CREATE MATERIALIZED VIEW dashboard_cards_mv AS
SELECT
    p.tenant_id,
    p.id AS product_id,
    p.title,
    p.image_url,
    p.category,
    p.product_type,
    p.price,
    p.platform,
    ts.score AS trend_score,
    ts.lifecycle_stage,
    ps_best.platform AS recommended_platform,
    ps_best.score AS platform_score,
    (SELECT COUNT(*) FROM creator_product_links cpl WHERE cpl.product_id = p.id) AS creator_count,
    (SELECT COUNT(*) FROM shops s WHERE s.tenant_id = p.tenant_id) AS shop_count,
    (SELECT COUNT(*) FROM videos v WHERE v.product_id = p.id) AS video_count,
    p.last_scraped_at,
    p.created_at
FROM products p
LEFT JOIN LATERAL (
    SELECT score, lifecycle_stage FROM trend_scores
    WHERE product_id = p.id ORDER BY scored_at DESC LIMIT 1
) ts ON true
LEFT JOIN LATERAL (
    SELECT platform, score FROM platform_scores
    WHERE product_id = p.id ORDER BY score DESC LIMIT 1
) ps_best ON true;

CREATE UNIQUE INDEX ON dashboard_cards_mv (tenant_id, product_id);
CREATE INDEX ON dashboard_cards_mv (tenant_id, trend_score DESC);
```

**Refresh** (`✓ FIXED: T-19`):
- `dashboard_refresh_worker` runs `REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_cards_mv`
- `CONCURRENTLY` requires the unique index (defined above) and allows reads during refresh
- Refresh timeout: 30 seconds. If exceeded → log warning, keep serving stale view.
- Triggered by: P2 idle refresh, P0 manual refresh, or after any P0/P1 scrape completes

**Performance**:
- Query with `WHERE tenant_id = :id ORDER BY trend_score DESC LIMIT 20`: target <300ms cold, <100ms cached
- Redis cache: per-tenant dashboard cards cached in Redis for <50ms reads. Invalidated on MV refresh.

### 8.4 — Supabase Realtime Architecture

`✓ FIXED: T-14, T-17 — channel architecture and security defined`

**Channel Naming Convention**:
```
tenant:{tenant_id}:dashboard     -- dashboard card updates
tenant:{tenant_id}:product:{id}  -- specific product chain updates
tenant:{tenant_id}:alerts        -- new alert notifications
```

**Security**: RLS policies enforce that users can only subscribe to their own tenant's channels. Supabase Realtime respects RLS by default.

**Broadcast Data**: Minimal — only the updated row ID + table name. Client re-fetches from DB. This prevents leaking data in Realtime messages.

**Connection Limits**:

| Plan | Expected Users | Max Concurrent Connections | Strategy |
|------|---------------|---------------------------|----------|
| Starter | 1 | 2 (1 user × 2 tabs) | Direct connection |
| Pro | 3 | 6 | Direct connection |
| Agency | 10 | 20 | Direct connection |
| Enterprise | 50+ | 100+ | Connection pooling recommended |

**Fallback** (`✓ FIXED: T-14`): If Realtime disconnects → automatic fallback to polling every 30 seconds. Show "Live updates paused" indicator. Auto-reconnect with exponential backoff.

### 8.5 — Loading & Empty States

#### Skeleton Loading States (`★ NEW: S-2`)

| Component | Skeleton |
|-----------|----------|
| Product card | Grey rectangle (image) + 3 shimmer lines (text) + 2 shimmer badges |
| Stats bar | 6 grey shimmer rectangles in a row |
| Creator list | Circle (avatar) + 2 shimmer lines × 5 rows |
| Charts | Grey rectangle with subtle shimmer |
| Trend Replay | 3 grey card outlines with shimmer |

Use shadcn/ui `<Skeleton />` component with pulse animation.

#### Empty States (`✓ FIXED: T-22`)

| Page | Empty State | CTA |
|------|------------|-----|
| Home (new tenant, first scrape running) | Skeleton cards + "Setting up your intelligence feed... ~2 min" | Demo data toggle |
| Home (new tenant, first scrape done, few products) | Real cards + "Your feed is building. More products appear as we scan." | "Add more platforms" link |
| Product detail (chain row has no data) | "No data yet for this section" | [Refresh] button |
| Platform section (plan-locked) | Lock icon + "Upgrade to Pro to access Amazon intelligence" | [View Plans] button |
| Saved Collections (empty) | "No saved products yet" | "Save your first product from the dashboard" |
| Alerts (none configured) | "Set up your first trend alert" | [Create Alert] button |

#### Error States (`✓ FIXED: T-22`)

| Scenario | Error UI | Recovery |
|----------|---------|----------|
| API failure | "Something went wrong. Please try again." | [Retry] button |
| Worker failure | "Data refresh failed. Showing last known data." + STALE badge | Auto-retry in background |
| Permission denied (viewer trying to export) | "You don't have permission to export. Contact your admin." | — |
| Rate limited | "You're making too many requests. Please wait [X] seconds." | Auto-countdown |

### 8.6 — Global Search

`✓ FIXED: T-21 — search indexing strategy defined`

**Trigger**: Cmd+K (keyboard shortcut) or click search bar in header.

**Search targets**: Products (title, category), Creators (username, niche), Shops (name, URL), Niches (name).

**Implementation**:
- `tsvector` columns on searchable fields (auto-updated via trigger)
- GIN indexes on tsvector columns
- All search queries include `WHERE tenant_id = :id` to leverage composite index
- Debounce: 300ms after last keystroke before querying
- Results grouped by type: Products | Creators | Shops | Niches
- Max 5 results per type in dropdown, "View all" link for full results page

**Fallback**: If pg_trgm/tsvector proves slow at scale (>100K products), migrate to Typesense (self-hosted search engine, integrates with Supabase via webhooks).

### 8.7 — Notification Centre

**Bell Icon** in header — shows unread count badge.

**Notification Types**:

| Type | Trigger | Delivery |
|------|---------|----------|
| Trend alert | Product crosses alert threshold | In-app + email (per S-4 preferences) |
| Pre-trend alert | predictive_score > 65 on product age < 7d | In-app + email |
| Outreach reply | Creator replies to outreach email | In-app + email |
| System update | Worker failure, budget alert, plan expiry | In-app |
| Team activity | @mention in annotation, invitation accepted | In-app |

**Notification Preferences** (`★ NEW: S-4`):

| Setting | Options | Default |
|---------|---------|---------|
| Trend alerts | In-app only / In-app + Email / Off | In-app + Email |
| Pre-trend alerts | In-app only / In-app + Email / Off | In-app + Email |
| Outreach replies | In-app only / In-app + Email / Off | In-app + Email |
| System updates | In-app only / Off | In-app only |
| Team activity | In-app only / In-app + Email / Off | In-app only |
| Email digest frequency | Instant / Daily summary / Weekly summary | Instant |
| Global mute | On / Off | Off |

Stored in `notification_preferences` table (see Section 6.9).

### 8.8 — Bulk Actions

`★ NEW: S-5 — bulk actions on product lists`

**Activation**: Appears when 2+ product checkboxes are selected.

**Toolbar Actions**:

| Action | Behaviour | Limit |
|--------|----------|-------|
| Save to Collection | Add selected to existing or new collection | No limit |
| Set Alert | Configure alert threshold for all selected | No limit |
| Export Selected | Download CSV/Excel of selected products | Plan export limit |
| Compare | Open side-by-side comparison view | 2–4 products max |
| Archive | Move to "Archived" (hidden from default view) | No limit |
| Dismiss | Move to "Dismissed" (hidden, user-specific) | No limit |

**Select All**: Applies to current filter results (not entire database).

### 8.9 — Product Archiving & Dismissal

`★ NEW: S-16`

| Action | Scope | Effect | Reversible? |
|--------|-------|--------|-------------|
| Dismiss | Per-user | Hidden from default view for this user only. Accessible via "Dismissed" filter tab. | Yes — "Restore" button |
| Archive | Per-tenant | Hidden from default view for all users. Accessible via "Archived" filter tab. | Yes — "Unarchive" button |

Stored in `product_user_status` table:
```sql
product_user_status (
    id uuid PK,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL FK → products(id),
    status text NOT NULL DEFAULT 'active', -- 'active', 'dismissed', 'archived'
    updated_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, user_id, product_id)
)
```

### 8.10 — Saved Views

`★ NEW: S-6`

Users can save current filter + sort + column configuration as a named view.

```sql
saved_views (
    id uuid PK,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    config jsonb NOT NULL,  -- { filters: {...}, sort: {...}, columns: [...] }
    is_default boolean DEFAULT false,
    is_shared boolean DEFAULT false,  -- visible to all team members
    created_at timestamptz DEFAULT now()
)
```

- Max 20 views per user
- One default view per user (loads automatically)
- Shared views visible to all team members (read-only — owner can edit)

### 8.11 — Accessibility

`★ NEW: S-3 — WCAG 2.1 AA compliance target`

| Requirement | Implementation |
|------------|----------------|
| Keyboard navigation | All interactive elements focusable via Tab. Enter/Space to activate. |
| ARIA labels | All badges (trend, lifecycle, freshness) have `aria-label` describing their meaning |
| Colour contrast | All freshness badge colours verified against white background: Green #22C55E (4.5:1 ✓), Blue #3B82F6 (4.5:1 ✓), Amber #F59E0B (3.1:1 — use dark text), Red #EF4444 (4.5:1 ✓) |
| Focus management | Focus trapped in modals. Focus returns to trigger on modal close. |
| Skip-to-content | Hidden "Skip to main content" link as first focusable element |
| Screen reader | All charts have text alternatives. All images have alt text. |

### 8.12 — Keyboard Shortcuts

`★ NEW: S-18`

| Shortcut | Action |
|----------|--------|
| Cmd+K (Ctrl+K) | Open global search |
| J / K | Next / previous product in list |
| S | Save selected product to collection |
| A | Set alert on selected product |
| R | Refresh current view |
| / | Focus search bar |
| Esc | Close modal / deselect |
| Cmd+? (Ctrl+?) | Open keyboard shortcuts help modal |

### 8.13 — What's New / Changelog

`★ NEW: S-17`

- "What's New" link in header (shows dot indicator when new entries exist)
- In-app modal triggered on first login after a new release
- Content managed externally (Notion page or simple JSON file in repo)
- Shows last 5 updates with title + date + short description

### 8.14 — Help & Contextual Tooltips

`★ NEW: S-7 — P0 launch blocker`

**Contextual Tooltips** (hover/focus on [?] icon):

| Element | Tooltip Text |
|---------|-------------|
| Trend Score | "Measures viral momentum across platforms. Scale: 0–100. Above 75 = hot product. Updated every 3 hours." |
| Predictive Score | "AI confidence that this product will trend in the next 3–7 days. Above 65 = pre-trend opportunity." |
| Saturation Score | "Market saturation level. Above 80 = oversaturated. Consider exiting or avoiding." |
| Lifecycle badge | "Shows where this product is in its market lifecycle: Emerging → Growing → Peak → Declining → Saturated." |
| Freshness badge | "How recently this data was scraped. LIVE = within 3 hours. OUTDATED = over 24 hours." |
| Match Score | "How well a creator matches this product. Based on niche alignment, engagement, and past performance." |

**External Links** (in footer):
- Help Centre: link to external knowledge base (Notion or Intercom)
- Status Page: link to BetterUptime status page
- Feedback: link to feedback form (Canny or simple form)

### 8.15 — Activity Log

`★ NEW: S-10 — team activity feed`

Accessible to `agency_owner` and `super_admin` roles.

| Column | Description |
|--------|------------|
| User avatar + name | Who performed the action |
| Action | "saved product", "triggered scrape", "sent outreach", "exported report", "created alert" |
| Target | Product/creator/collection name (linked) |
| Timestamp | Relative ("2 min ago") and absolute on hover |

**Filters**: By user, action type, date range.
**Source**: `api_usage_log` table with user-friendly UI layer.

---
## Section 9 — Three Platform Sections (TikTok / Amazon / Shopify)

### 9.1 — Platform Access by Plan

| Platform | Starter ($49) | Pro ($149) | Agency ($349) | Enterprise |
|----------|:------------:|:----------:|:------------:|:----------:|
| TikTok | Yes | Yes | Yes | Yes |
| Amazon | — | Yes | Yes | Yes |
| Shopify | — | — | Yes | Yes |
| Facebook/Instagram Ads | — | — | Yes | Yes |
| Reddit / Pinterest / Google Trends / YouTube | — | — | Yes | Yes |

Plan-locked sections show: lock icon + "Upgrade to [plan] to access [platform] intelligence" + [View Plans] button.

### 9.2 — TikTok Intelligence (FastMoss-equivalent depth)

**6 sub-pages**, all following demand-driven scraping rules.

#### TikTok Products

| Field | Description | Worker |
|-------|------------|--------|
| Product title + image | Top products by GMV | tiktok_discovery_worker |
| Estimated GMV | Gross merchandise value | tiktok_discovery_worker |
| Units sold | Total units sold estimate | tiktok_discovery_worker |
| Trend Score | 0–100 viral momentum | trend_scoring_worker |
| Lifecycle Stage | Emerging → Peak → Saturated | trend_scoring_worker |
| Creator count | Unique creators promoting | tiktok_discovery_worker |
| Category / Niche | Product classification | product_extractor_worker |
| Country filter | Filter by TikTok region | tiktok_discovery_worker |

**Scrapes on**: Section open (P0 if stale) / Refresh click (P0)
**Filters**: Niche, country, trend score range, lifecycle stage, date range
**Sort**: Trend Score, GMV, Units Sold, Newest, Creator Count

#### TikTok Creators

| Field | Description | Worker |
|-------|------------|--------|
| Username + avatar | Creator profile | creator_monitor_worker |
| Follower count | Total followers | creator_monitor_worker |
| Engagement rate | (likes+comments)/followers × 100 | Computed |
| Niche | Creator's primary niche | creator_monitor_worker |
| Est. GMV generated | Total GMV from promoted products | creator_monitor_worker |
| Top products | Products this creator promotes | creator_product_links |
| Match Score | Creator-Product Match (for selected product) | Section 10 algorithm |

**Scrapes on**: Section open / Refresh click
**Filters**: Niche, follower range, engagement rate range, GMV range
**Sort**: Followers, Engagement Rate, GMV, Match Score

#### TikTok Videos

| Field | Description | Worker |
|-------|------------|--------|
| Thumbnail | Video preview image | video_scraper_worker |
| Creator | Username (linked to creator page) | video_scraper_worker |
| Views | Total view count | video_scraper_worker |
| Engagement | Likes + shares + comments | video_scraper_worker |
| View velocity | Views per hour (current rate) | Computed |
| Product links | Products detected in video | video_scraper_worker |
| Organic/Ad | Classification | AI or is_ad flag |

**Scrapes on**: Section open / Refresh click
**Filters**: View count range, engagement range, organic/ad, date range
**Sort**: Views, View Velocity, Engagement, Newest

#### TikTok Shops

| Field | Description | Worker |
|-------|------------|--------|
| Shop name + logo | TikTok Shop profile | tiktok_discovery_worker |
| TikTok followers | Shop follower count | tiktok_discovery_worker |
| Est. GMV/month | Monthly gross merchandise value | tiktok_discovery_worker |
| Units sold | Total units | tiktok_discovery_worker |
| Active creator count | Creators promoting for this shop | tiktok_discovery_worker |
| Product count | Products listed | tiktok_discovery_worker |
| Growth rate % | Month-over-month | Computed from time-series |

**Scrapes on**: Section open / Refresh click
**Sort**: GMV, Growth Rate, Creator Count, Followers

#### TikTok Live

| Field | Description | Worker |
|-------|------------|--------|
| Stream title | Live stream title | tiktok_live_worker |
| Creator | Streamer username | tiktok_live_worker |
| Cumulative viewers | Total unique viewers | tiktok_live_worker |
| Units sold (live) | Products sold during stream | tiktok_live_worker |
| Products featured | Products shown/linked | tiktok_live_worker |
| Duration | Stream length | tiktok_live_worker |

**Scrapes on**: Section open / Refresh click
**Sort**: Viewers, Units Sold, Duration

#### TikTok Ads

| Field | Description | Worker |
|-------|------------|--------|
| Ad creative | Thumbnail/preview | tiktok_ads_worker |
| Advertiser | Brand/seller name | tiktok_ads_worker |
| Est. spend | Estimated ad budget | tiktok_ads_worker |
| Duplication count | Same creative on N accounts | tiktok_ads_worker |
| Ad run duration | How long active | tiktok_ads_worker |
| Product linked | Associated product | tiktok_ads_worker |
| Engagement | Likes + comments on ad | tiktok_ads_worker |

**Scrapes on**: Section open / Refresh click
**Sort**: Spend, Duplication Count, Duration, Engagement

---

### 9.3 — Amazon Intelligence (JungleScout/Keepa-equivalent depth)

**3 sub-pages.**

#### Amazon Products

| Field | Description | Worker |
|-------|------------|--------|
| Product title + image | Amazon product listing | amazon_bsr_scanner_worker |
| ASIN | Amazon Standard ID | amazon_bsr_scanner_worker |
| BSR Rank | Best Sellers Rank in category | amazon_bsr_scanner_worker |
| BSR movement | Rank change over 7d/30d | Computed from time-series |
| Price | Current price | amazon_bsr_scanner_worker |
| Review count | Total reviews | amazon_bsr_scanner_worker |
| Review velocity | New reviews per week | Computed |
| Est. monthly sales | Estimated units/month | amazon_bsr_scanner_worker |
| Est. monthly revenue | sales × price | Computed |
| Trend Score | 0–100 viral momentum | trend_scoring_worker |
| TikTok cross-signal | Is this product trending on TikTok? | cross_platform_match_worker |
| Lifecycle Stage | Emerging → Saturated | trend_scoring_worker |

**Scrapes on**: Section open (P0 if stale) / Refresh click (P0)
**Filters**: Category, BSR range, price range, review count, trend score, lifecycle stage
**Sort**: BSR Rank, BSR Movement, Revenue, Trend Score, Review Velocity

#### Amazon Rankings

| Field | Description | Worker |
|-------|------------|--------|
| Category | Amazon product category | amazon_bsr_scanner_worker |
| BSR movement chart | Fastest climbing products per category | amazon_bsr_scanner_worker |
| Top movers | Products with biggest BSR improvement in 7d | Computed |
| New entrants | Products appearing in BSR top 100 for first time | Computed |

**Scrapes on**: Section open / Refresh click
**Sort**: BSR Movement (biggest jump), Category

#### Amazon vs TikTok Cross-Signal

| Field | Description | Worker |
|-------|------------|--------|
| TikTok product | Product trending on TikTok | cross_platform_match_worker |
| Amazon ASIN match | Matched Amazon listing | cross_platform_match_worker |
| Match confidence | How confident the match is | cross_platform_match_worker |
| TikTok stats | Views, creators, trend score | tiktok_discovery_worker |
| Amazon stats | BSR, price, reviews, sales | amazon_bsr_scanner_worker |
| Opportunity signal | TikTok viral but Amazon BSR not yet climbing = opportunity | Computed |

**Scrapes on**: Section open / Refresh click

---

### 9.4 — Shopify Intelligence (PPSPY-equivalent depth)

**3 sub-pages.**

#### Shopify Stores

| Field | Description | Worker |
|-------|------------|--------|
| Store name + URL | Shopify store identity | shopify_store_discovery_worker |
| Niche | Store's primary category | shopify_store_discovery_worker |
| Est. monthly revenue | Revenue estimate | shopify_growth_monitor_worker |
| Traffic estimate | Monthly visitors | shopify_growth_monitor_worker |
| Product count | Total products | shopify_store_discovery_worker |
| Ad spend signal | Detected advertising activity | shopify_growth_monitor_worker |
| Growth rate % | Month-over-month revenue growth | Computed |
| Creator partnerships | Detected creator relationships | cross_platform_match_worker |
| Tech stack | Detected Shopify apps/themes | shopify_store_discovery_worker |

**Scrapes on**: Section open (P0 if stale) / Refresh click (P0)
**Filters**: Niche, revenue range, traffic range, growth rate, ad spend
**Sort**: Revenue, Growth Rate, Traffic, Product Count

#### Store Intelligence (Deep Dive)

Triggered when user clicks a store card.

| Field | Description | Worker |
|-------|------------|--------|
| Top products | Best-selling products in store | shopify_store_discovery_worker |
| Ad analysis | Active ad campaigns detected | facebook_ads_worker |
| Traffic sources | Organic vs paid vs social estimate | shopify_growth_monitor_worker |
| Creator partnerships | Linked creator profiles | cross_platform_match_worker |
| Revenue timeline | 30/60/90 day revenue chart | shopify_growth_monitor_worker |
| Competitor stores | Similar stores in same niche | Computed (niche match) |

#### Niche Scanner

| Field | Description | Worker |
|-------|------------|--------|
| Niche name | Product category / niche | Aggregated from products |
| New store count | Shopify stores launched this week in niche | shopify_store_discovery_worker |
| Avg revenue | Average revenue of stores in niche | Computed |
| Growth trend | Niche growth over 30d | Computed |
| Saturation signal | How crowded is this niche | saturation_score aggregated |
| Top stores | Highest revenue stores in niche | Computed |

**Scrapes on**: Section open / Refresh click
**Sort**: New Store Count, Growth Trend, Avg Revenue

---

### 9.5 — Additional Platform Data Sources

These platforms provide supplementary intelligence and feed into the cross-platform graph. They do not have dedicated dashboard sections but their data appears in product detail (Row 5, Row 6) and niche intelligence.

| Platform | Workers | Data Type | Refresh |
|----------|---------|-----------|---------|
| Facebook/Instagram | facebook_ads_worker | Ad creatives, spend estimates, duplication patterns | On demand + idle rotation |
| Reddit | reddit_trend_worker | Trend signals, product mentions, buying intent threads | Idle rotation only (P2) |
| Pinterest | pinterest_trend_worker | Trend boards, product saves, traffic signals | Idle rotation only (P2) |
| Google Trends | google_trends_worker (✓ FIXED: D-1) | Search volume trends, keyword velocity, rising queries | On demand + idle rotation |
| YouTube | youtube_worker (✓ FIXED: D-1) | Product review videos, affiliate links, channel data | On demand only |

---
## Section 10 — Intelligence Engine Algorithms

### 10.1 — Overview

YouSell uses 5 scoring algorithms (4 from v5 + 1 new) plus 1 composite score.

| # | Algorithm | Purpose | Computed By | Frequency |
|---|----------|---------|-------------|-----------|
| 1 | Trend Score | Measures current viral momentum | trend_scoring_worker | After every data scrape |
| 2 | Predictive Discovery Score | Detects pre-trend products 3–7 days early | predictive_discovery_worker | Every 2 hours |
| 3 | Saturation Score (★ NEW) | Measures market saturation level | trend_scoring_worker | After every data scrape |
| 4 | Creator-Product Match Score | Ranks creator fit for a product | On-demand (Row 3 expand) | On row expand |
| 5 | Platform Profitability Score | Recommends best selling platform | platform_profitability_scorer | On product click |
| 6 | Overall Score (composite) | Single ranking score for product cards | Computed in materialised view | On MV refresh |

`✓ FIXED: D-4 — CLAUDE.md's 3-pillar model deprecated. v5's 4-algorithm system is canonical. Saturation Score added (D-11). Overall Score replaces CLAUDE.md's final_score.`

---

### 10.2 — Algorithm 1: Trend Score

**Purpose**: Measures how much viral momentum a product currently has across platforms.

```
trend_score = CLAMP(0, 100,
    (view_velocity         × 0.30)
  + (creator_adoption_rate × 0.25)
  + (store_adoption_rate   × 0.20)
  + (engagement_ratio      × 0.15)
  + (ad_duplication_rate   × 0.10)
)
```

**Input Variables**:

| Variable | Definition | Source Table | Computation |
|----------|-----------|-------------|-------------|
| view_velocity | Views-per-hour growth rate vs 7-day baseline | `videos` | `(current_hourly_views / avg_hourly_views_7d) × normalisation_factor`. Normalised to 0–100 scale. |
| creator_adoption_rate | New unique creators posting about product per week | `creator_product_links` | `COUNT(DISTINCT creator_id WHERE created_at > now() - 7d)`. Normalised: 0 = 0, 10+ = 100. |
| store_adoption_rate | New shops listing same product per week | `shops` + `product_platform_matches` | `COUNT(new_shops_7d)`. Normalised: 0 = 0, 5+ = 100. |
| engagement_ratio | Engagement quality relative to views | `videos` | `(SUM(likes + comments + shares) / SUM(views)) × 100`. Normalised: 0% = 0, 10%+ = 100. |
| ad_duplication_rate | Same ad creative appearing across multiple accounts | `ads` | `MAX(duplication_count)`. Normalised: 1 = 0, 5+ = 100. |

**Score Tiers**:

| Tier | Range | Badge | Meaning |
|------|-------|-------|---------|
| HOT | >= 75 | Trending | Product has strong viral momentum. High priority opportunity. |
| WARM | 50–74 | Gaining traction | Moderate momentum. Worth monitoring. |
| COOL | 25–49 | Low activity | Limited viral signals. Early stage or niche. |
| COLD | 0–24 | Minimal | No significant viral activity detected. |

**Alert trigger**: trend_score > 75 → fire P1 job to refresh full product chain.

---

### 10.3 — Algorithm 2: Predictive Discovery Score (Pre-Trend)

**Purpose**: Detects products likely to trend in 3–7 days by identifying early signals before mainstream adoption.

```
predictive_score = CLAMP(0, 100,
    (creator_burst_signal     × 0.35)
  + (engagement_velocity      × 0.25)
  + (store_adoption_velocity  × 0.20)
  + (ad_creative_replication  × 0.20)
)
```

**Input Variables**:

| Variable | Definition | Source Table | Computation |
|----------|-----------|-------------|-------------|
| creator_burst_signal | Rapid creator adoption of an unknown product | `creator_product_links` | 3+ new creators post same product in 48h window. Binary → weighted: 3 creators = 60, 5 = 80, 10+ = 100. |
| engagement_velocity | View rate acceleration beyond normal growth | `videos` (time-series) | Hourly view rate vs 7-day hourly average. Doubling = 80, tripling = 100. Requires baseline data (min 7 days of history). |
| store_adoption_velocity | Rapid store listings of a product | `shops` + `product_platform_matches` | New stores listing product within 72h. 2 stores = 50, 5+ = 100. |
| ad_creative_replication | Same ad format appearing across multiple accounts | `ads` | 3+ accounts running same creative format in 72h. 3 = 60, 5 = 80, 10+ = 100. |

**Cold-Start Handling**: Products with < 7 days of history have no baseline for `engagement_velocity`. In this case, velocity weight is redistributed: `creator_burst_signal × 0.45, store_adoption_velocity × 0.30, ad_creative_replication × 0.25`.

**Pre-trend alert fires when**: `predictive_score > 65 AND product_age_days < 7`

**Badge**: "Pre-Trend" (shown on product cards)

**Priority**: ALWAYS run predictive worker at P1. This is the core moat feature. Never downgrade to P2.

**Anthropic API Integration** (see Section 3 for detail):
- Batch classification of top-scoring products
- 50 calls/day budget → ~600 product evaluations via batching
- Anthropic classifies: confidence level, predicted trend timeline, recommended action
- Results stored in `predictive_signals` table

---

### 10.4 — Algorithm 3: Saturation Score (★ NEW)

`✓ FIXED: D-11 — Saturation Score was in UI and DB but had no algorithm defined`

**Purpose**: Measures how saturated the market is for a given product. High saturation = high competition = lower opportunity.

```
saturation_score = CLAMP(0, 100,
    (seller_density         × 0.30)
  + (new_entrant_rate       × 0.25)
  + (price_compression      × 0.25)
  + (ad_density             × 0.20)
)
```

**Input Variables**:

| Variable | Definition | Source Table | Computation |
|----------|-----------|-------------|-------------|
| seller_density | Number of active sellers relative to market threshold | `shops` + `product_platform_matches` | `(active_seller_count / category_threshold) × 100`. Category thresholds: TikTok Shop = 50, Amazon = 200, Shopify = 100. |
| new_entrant_rate | Rate of new sellers entering in last 30 days | `shops` (time-series) | `COUNT(new_sellers_30d) / active_seller_count × 100`. Normalised: 0% = 0, 20%+ = 100. |
| price_compression | Price decrease trend indicating race-to-bottom | `trend_scores` (price time-series) | `MAX(0, (avg_price_30d_ago - avg_price_now) / avg_price_30d_ago × 100)`. Normalised: 0% = 0, 30%+ = 100. |
| ad_density | Ad creative volume relative to organic content | `ads` + `videos` | `COUNT(ads_30d) / COUNT(total_content_30d) × 100`. Normalised: 0% = 0, 50%+ = 100. |

**Score Tiers**:

| Tier | Range | Meaning |
|------|-------|---------|
| Low saturation | 0–30 | Market is wide open. First-mover opportunity. |
| Moderate | 31–60 | Growing competition. Still viable with differentiation. |
| High | 61–80 | Crowded market. Margins under pressure. |
| Oversaturated | 81–100 | Market is flooded. Avoid unless you have a strong moat. |

**Integration with Lifecycle** (★ NEW: MN-1): Saturation score is a key input to the Product Lifecycle Stage badge:
- Emerging: saturation_score < 30 + product_age < 14d
- Peak: trend_score > 75 + saturation_score 50–80
- Saturated: saturation_score > 80

---

### 10.5 — Algorithm 4: Creator-Product Match Score

**Purpose**: Ranks how well a creator fits a specific product for outreach/partnership.

```
match_score = CLAMP(0, 100,
    (niche_alignment         × 0.35)
  + (historical_conversion   × 0.30)
  + (engagement_rate         × 0.20)
  + (demographics_fit        × 0.15)
)
```

**Input Variables** (`✓ FIXED: M-3 — cold-start and data source gaps resolved`):

| Variable | Definition | Source | Cold-Start Fallback |
|----------|-----------|--------|-------------------|
| niche_alignment | Keyword tag overlap between creator bio and product category | `creators.niche_tags` vs `products.category_tags` (keyword matching, not embeddings) | If creator has no tags → score 50 (neutral) |
| historical_conversion | Past sales generated for similar product categories | `creator_product_links.estimated_sales` | If no history → use category-average conversion rate. New creators default to 50th percentile. |
| engagement_rate | (likes + comments) / followers × 100 | `creators.engagement_rate` | If unknown → score 50 |
| demographics_fit | Audience overlap with product target demographic | Apify creator profile scrapes (when publicly available) | If unavailable → weight redistributed: niche_alignment gets 0.45, engagement_rate gets 0.25. demographics_fit = 0 with 0 weight. |

**Outreach threshold**: match_score > 70 → creator appears in outreach recommendation list

---

### 10.6 — Algorithm 5: Platform Profitability Score

**Purpose**: Recommends which platform a product should be sold on, based on margin, demand, and competition.

```
platform_score[platform] = CLAMP(0, 100,
    (estimated_margin      × 0.40)
  + (demand_velocity       × 0.30)
  + (competition_inverse   × 0.30)
)
```

Computed for: TikTok Shop, Amazon, Shopify, Instagram, eBay (when data available).

**Input Variables** (`✓ FIXED: M-4 — all data sources now mapped`):

| Variable | Definition | Data Source Per Platform |
|----------|-----------|------------------------|
| estimated_margin | Gross margin estimate | **Cost**: manual input OR AliExpress Apify scrape (Phase 3). **Selling price**: from platform scrape. Margin = (price - cost) / price × 100. If cost unknown → use category average margin. |
| demand_velocity | Platform-specific demand signal | **TikTok**: view velocity from `videos`. **Amazon**: BSR movement (lower rank = higher demand). **Shopify**: traffic estimate from `shops`. **Google Trends**: search volume from `google_trends_worker`. |
| competition_inverse | Inverse of competition level | **TikTok**: 100 - (shop_count / threshold × 100). **Amazon**: 100 - (active_sellers / threshold × 100). From BSR data. **Shopify**: 100 - (stores_in_niche / threshold × 100). |

**Anthropic API usage**: 30 calls/day. Generates one-line rationale per product per platform recommendation.

**Caching** (`✓ FIXED: T-15`): AI rationale cached per product. Only regenerated when any input score changes by > 5 points. Eliminates redundant Anthropic calls.

**Output**: Top-ranked platform = recommended platform shown on every product card with badge.

---

### 10.7 — Composite: Overall Score

`✓ FIXED: D-4 — replaces CLAUDE.md's deprecated final_score formula`

**Purpose**: Single ranking score used for sorting product cards on the dashboard and in materialised view.

```
overall_score = CLAMP(0, 100,
    (trend_score       × 0.35)
  + (predictive_score  × 0.25)
  + (platform_score    × 0.20)   // best platform score
  + (100 - saturation_score) × 0.20  // inverse: low saturation = higher overall
)
```

**Note**: This replaces CLAUDE.md's `final_score = trend_score × 0.40 + viral_score × 0.35 + profit_score × 0.25`. The old formula used undefined variables (`viral_score`, `profit_score`). The new formula uses the actual algorithm outputs defined above.

**CLAUDE.md Update Required**: After v6 is adopted, CLAUDE.md's scoring section must be updated to reference this formula.

**Score Tiers** (for dashboard badges):

| Tier | Range | Badge |
|------|-------|-------|
| HOT | >= 80 | Hot Opportunity |
| WARM | 60–79 | Worth Watching |
| COOL | 40–59 | Low Priority |
| COLD | < 40 | Not Recommended |

---

### 10.8 — Anthropic API Budget Summary

`✓ FIXED: T-15 — per-feature Anthropic budget defined`

| Feature | Worker/Trigger | Calls/Day | Est. Cost/Day |
|---------|---------------|-----------|---------------|
| Predictive classification | predictive_discovery_worker (every 2h) | 50 | ~$1.50 |
| Platform recommendation rationale | platform_profitability_scorer (on product click) | 30 | ~$0.90 |
| Daily intelligence briefing | daily_briefing_worker (1/tenant/day) | 100 (at 100 tenants) | ~$3.00 |
| Outreach email generation | On user click "Reach Out" | Plan-limited (5 Pro, 50 Agency) | ~$0.50 |
| Agency report narrative | On report generation | ~10/day (estimate) | ~$0.30 |
| **TOTAL** | | **~200/day** | **~$6.20/day (~$186/mo)** |

**Monthly cap**: $500 (configurable). Circuit breaker at 90%.

**Caching rules**:
- Platform rationale: cached until input scores change by > 5 points
- Daily briefing: no caching (unique per day per tenant)
- Outreach emails: no caching (unique per creator + product)
- Report narratives: cached per report section until underlying data changes

---

<!-- END OF PART 1 (Sections 1–10) -->
<!-- Part 2 (Sections 11–20) continues in Phase 5 -->


## Section 11 — Complete Database Schema

All tables include `tenant_id uuid NOT NULL` (except `tenants` itself). Supabase RLS enforces tenant isolation on every table.

`✓ FIXED: D-5 — raw_listings now included. S-4, S-6, S-9, S-15, S-16 tables added. MN-2, MN-4 tables added.`

### 11.1 — Tenant & User Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- TENANTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    plan text NOT NULL DEFAULT 'starter'
        CHECK (plan IN ('starter', 'pro', 'agency', 'enterprise', 'trial', 'locked', 'archived')),
    plan_status text NOT NULL DEFAULT 'active'
        CHECK (plan_status IN ('active', 'trial', 'past_due', 'grace_expired', 'restricted', 'locked', 'archived')),
    billing_cycle text DEFAULT 'monthly'
        CHECK (billing_cycle IN ('monthly', 'annual')),
    trial_ends_at timestamptz,
    plan_active_until timestamptz,
    stripe_customer_id text,
    stripe_subscription_id text,
    custom_domain text,
    brand_config jsonb DEFAULT '{}'::jsonb,
    -- { logo_url, primary_color, secondary_color, company_name, favicon_url }
    api_keys jsonb DEFAULT '{}'::jsonb,
    -- Enterprise only: per-tenant external API key overrides
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- USERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id uuid PRIMARY KEY,  -- = Supabase Auth user id
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'viewer'
        CHECK (role IN ('super_admin', 'agency_owner', 'analyst', 'viewer')),
    email text NOT NULL,
    display_name text,
    avatar_url text,
    last_active_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- ═══════════════════════════════════════════════════════════════
-- INVITATIONS (★ NEW: S-9)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invited_by uuid NOT NULL REFERENCES users(id),
    email text NOT NULL,
    role text NOT NULL DEFAULT 'analyst'
        CHECK (role IN ('agency_owner', 'analyst', 'viewer')),
    token text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    accepted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invitations_tenant ON invitations(tenant_id);
CREATE INDEX idx_invitations_token ON invitations(token);
```

### 11.2 — Core Intelligence Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title text NOT NULL,
    image_url text,
    category text,
    product_type text CHECK (product_type IN ('physical', 'digital', 'saas', 'ai')),
    platform text NOT NULL,  -- source platform: 'tiktok', 'amazon', 'shopify'
    external_id text,
    price decimal(12,2),
    cost decimal(12,2),
    currency text DEFAULT 'USD',
    description text,
    niche_tags text[],  -- for creator match + niche aggregation
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_tenant_platform ON products(tenant_id, platform);
CREATE INDEX idx_products_tenant_created ON products(tenant_id, created_at DESC);
-- Full-text search (✓ FIXED: T-21)
ALTER TABLE products ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(category, ''))
    ) STORED;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- ═══════════════════════════════════════════════════════════════
-- CREATORS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE creators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username text NOT NULL,
    platform text NOT NULL,  -- 'tiktok', 'youtube', 'instagram'
    external_id text,
    avatar_url text,
    follower_count integer DEFAULT 0,
    engagement_rate decimal(5,2),
    niche text,
    niche_tags text[],
    bio text,
    email text,  -- publicly listed, for outreach
    conversion_score decimal(5,2),
    outreach_status text DEFAULT 'none'
        CHECK (outreach_status IN ('none', 'identified', 'email_sent', 'replied', 'deal_closed', 'opted_out')),
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_creators_tenant ON creators(tenant_id);
ALTER TABLE creators ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(username, '') || ' ' || coalesce(niche, ''))
    ) STORED;
CREATE INDEX idx_creators_search ON creators USING GIN(search_vector);

-- ═══════════════════════════════════════════════════════════════
-- VIDEOS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    creator_id uuid REFERENCES creators(id) ON DELETE SET NULL,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL,
    platform text NOT NULL,
    external_id text,
    thumbnail_url text,
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    share_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    engagement_velocity decimal(10,2),  -- views per hour
    is_ad boolean DEFAULT false,
    product_links jsonb DEFAULT '[]'::jsonb,
    posted_at timestamptz,
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_videos_tenant ON videos(tenant_id);
CREATE INDEX idx_videos_product ON videos(tenant_id, product_id);
CREATE INDEX idx_videos_creator ON videos(tenant_id, creator_id);

-- ═══════════════════════════════════════════════════════════════
-- SHOPS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE shops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform text NOT NULL,  -- 'tiktok', 'shopify', 'amazon'
    external_id text,
    name text NOT NULL,
    url text,
    logo_url text,
    follower_count integer DEFAULT 0,
    estimated_revenue decimal(12,2),
    estimated_gmv decimal(12,2),
    growth_rate decimal(5,2),
    product_count integer DEFAULT 0,
    creator_count integer DEFAULT 0,
    ad_spend_signal decimal(12,2),
    tech_stack jsonb DEFAULT '[]'::jsonb,  -- Shopify apps detected
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_shops_tenant ON shops(tenant_id);
CREATE INDEX idx_shops_tenant_platform ON shops(tenant_id, platform);
ALTER TABLE shops ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(url, ''))
    ) STORED;
CREATE INDEX idx_shops_search ON shops USING GIN(search_vector);

-- ═══════════════════════════════════════════════════════════════
-- ADS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE ads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform text NOT NULL,  -- 'tiktok', 'facebook', 'instagram'
    external_id text,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL,
    advertiser_name text,
    creative_url text,
    thumbnail_url text,
    duplication_count integer DEFAULT 1,
    estimated_spend decimal(12,2),
    is_scaling boolean DEFAULT false,
    ad_run_duration_days integer,
    like_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_ads_tenant ON ads(tenant_id);
CREATE INDEX idx_ads_product ON ads(tenant_id, product_id);
```

### 11.3 — Scoring & Intelligence Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- TREND_SCORES (time-series)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE trend_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform text NOT NULL,
    score decimal(5,2) NOT NULL,
    lifecycle_stage text
        CHECK (lifecycle_stage IN ('emerging', 'growing', 'peak', 'declining', 'saturated')),
    saturation_score decimal(5,2),
    view_velocity decimal(10,2),
    creator_adoption_rate decimal(5,2),
    store_adoption_rate decimal(5,2),
    engagement_ratio decimal(5,2),
    ad_duplication_rate decimal(5,2),
    price_at_score decimal(12,2),
    scored_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_trend_scores_product ON trend_scores(tenant_id, product_id, scored_at DESC);
CREATE INDEX idx_trend_scores_tenant_scored ON trend_scores(tenant_id, scored_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- PLATFORM_SCORES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE platform_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform text NOT NULL,
    score decimal(5,2) NOT NULL,
    margin_score decimal(5,2),
    competition_score decimal(5,2),
    demand_score decimal(5,2),
    ai_rationale text,
    ai_rationale_hash text,  -- hash of inputs; only regenerate when changed >5 points
    scored_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, product_id, platform)
);
CREATE INDEX idx_platform_scores_product ON platform_scores(tenant_id, product_id);

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT_PLATFORM_MATCHES (cross-platform graph edges)
-- ✓ FIXED: M-2 — graph data structure now defined
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE product_platform_matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform text NOT NULL,
    external_id text NOT NULL,
    match_confidence decimal(5,2),  -- 0.00–100.00
    match_method text
        CHECK (match_method IN ('title_similarity', 'upc_gtin', 'manual', 'image_match')),
    price_on_platform decimal(12,2),
    matched_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, product_id, platform, external_id)
);
CREATE INDEX idx_ppm_product ON product_platform_matches(tenant_id, product_id);
CREATE INDEX idx_ppm_platform ON product_platform_matches(tenant_id, platform);

-- ═══════════════════════════════════════════════════════════════
-- CREATOR_PRODUCT_LINKS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE creator_product_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    match_score decimal(5,2),
    estimated_sales decimal(12,2),
    link_type text DEFAULT 'organic'
        CHECK (link_type IN ('organic', 'affiliate', 'sponsored', 'ai_recommended')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, creator_id, product_id)
);
CREATE INDEX idx_cpl_product ON creator_product_links(tenant_id, product_id);
CREATE INDEX idx_cpl_creator ON creator_product_links(tenant_id, creator_id);

-- ═══════════════════════════════════════════════════════════════
-- AFFILIATE_PROGRAMS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE affiliate_programs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    program_name text NOT NULL,
    commission_rate decimal(5,2),
    payout_type text,  -- 'per_sale', 'per_click', 'flat_fee'
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_affiliate_product ON affiliate_programs(tenant_id, product_id);

-- ═══════════════════════════════════════════════════════════════
-- PREDICTIVE_SIGNALS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE predictive_signals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    signal_type text NOT NULL,
    -- 'creator_burst', 'engagement_velocity', 'store_adoption', 'ad_replication'
    signal_strength decimal(5,2) NOT NULL,
    ai_classification text,         -- Anthropic classification result
    ai_confidence decimal(5,2),     -- Anthropic confidence level
    predicted_trend_date date,      -- when AI predicts viral breakout
    detected_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_predictive_product ON predictive_signals(tenant_id, product_id, detected_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- NICHES (★ NEW: MN-2)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE niches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text,
    product_count integer DEFAULT 0,
    avg_trend_score decimal(5,2),
    avg_saturation_score decimal(5,2),
    platform_breakdown jsonb DEFAULT '{}'::jsonb,
    -- { "tiktok": 45, "amazon": 30, "shopify": 25 }
    growth_rate decimal(5,2),
    lifecycle_stage text
        CHECK (lifecycle_stage IN ('emerging', 'growing', 'peak', 'declining', 'saturated')),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, name)
);
CREATE INDEX idx_niches_tenant ON niches(tenant_id);
ALTER TABLE niches ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(category, ''))
    ) STORED;
CREATE INDEX idx_niches_search ON niches USING GIN(search_vector);
```

### 11.4 — User Activity Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- ALERT_CONFIGS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE alert_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type text NOT NULL,
    -- 'trend_score', 'predictive_score', 'price_drop', 'new_creator', 'niche_change'
    threshold_value decimal(5,2),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    niche_id uuid REFERENCES niches(id) ON DELETE CASCADE,
    delivery_method text DEFAULT 'both'
        CHECK (delivery_method IN ('in_app', 'email', 'both', 'webhook')),
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_tenant_user ON alert_configs(tenant_id, user_id);

-- ═══════════════════════════════════════════════════════════════
-- SAVED_COLLECTIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE saved_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL DEFAULT 'Unnamed Collection',
    item_type text NOT NULL CHECK (item_type IN ('product', 'creator', 'shop')),
    item_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, user_id, item_type, item_id)
);
CREATE INDEX idx_collections_tenant_user ON saved_collections(tenant_id, user_id);

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT_USER_STATUS (★ NEW: S-16)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE product_user_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'dismissed', 'archived')),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, user_id, product_id)
);
CREATE INDEX idx_pus_tenant_user ON product_user_status(tenant_id, user_id);

-- ═══════════════════════════════════════════════════════════════
-- SAVED_VIEWS (★ NEW: S-6)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE saved_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    config jsonb NOT NULL,
    -- { filters: {...}, sort: {...}, columns: [...] }
    is_default boolean DEFAULT false,
    is_shared boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_saved_views_tenant_user ON saved_views(tenant_id, user_id);

-- ═══════════════════════════════════════════════════════════════
-- ANNOTATIONS (★ NEW: MN-4)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE annotations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type text NOT NULL
        CHECK (target_type IN ('product', 'creator', 'collection')),
    target_id uuid NOT NULL,
    content text NOT NULL,
    is_pinned boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_annotations_target ON annotations(tenant_id, target_type, target_id);
```

### 11.5 — Notification & Outreach Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL,
    -- 'trend_alert', 'pre_trend_alert', 'outreach_reply', 'system', 'team_activity'
    title text NOT NULL,
    body text,
    link_url text,
    is_read boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(tenant_id, user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(tenant_id, user_id) WHERE is_read = false;

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATION_PREFERENCES (★ NEW: S-4)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trend_alerts text DEFAULT 'both'
        CHECK (trend_alerts IN ('in_app', 'email', 'both', 'off')),
    pre_trend_alerts text DEFAULT 'both'
        CHECK (pre_trend_alerts IN ('in_app', 'email', 'both', 'off')),
    outreach_replies text DEFAULT 'both'
        CHECK (outreach_replies IN ('in_app', 'email', 'both', 'off')),
    system_updates text DEFAULT 'in_app'
        CHECK (system_updates IN ('in_app', 'off')),
    team_activity text DEFAULT 'in_app'
        CHECK (team_activity IN ('in_app', 'email', 'both', 'off')),
    email_digest_frequency text DEFAULT 'instant'
        CHECK (email_digest_frequency IN ('instant', 'daily', 'weekly')),
    global_mute boolean DEFAULT false,
    UNIQUE(tenant_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════
-- OUTREACH_SEQUENCES (★ NEW: per M-5)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE outreach_sequences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sequence_step integer NOT NULL DEFAULT 1,  -- 1, 2, or 3
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'complained', 'stopped')),
    resend_message_id text,
    subject text,
    body text,
    sent_at timestamptz,
    opened_at timestamptz,
    clicked_at timestamptz,
    replied_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_outreach_tenant ON outreach_sequences(tenant_id);
CREATE INDEX idx_outreach_creator ON outreach_sequences(tenant_id, creator_id);

-- ═══════════════════════════════════════════════════════════════
-- OUTREACH_OPTOUTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE outreach_optouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    creator_email text NOT NULL,
    opted_out_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, creator_email)
);
```

### 11.6 — Billing & Referral Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- PROCESSED_WEBHOOKS (Stripe idempotency)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE processed_webhooks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id text NOT NULL UNIQUE,  -- Stripe event ID
    event_type text NOT NULL,
    processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhooks_event ON processed_webhooks(event_id);

-- ═══════════════════════════════════════════════════════════════
-- REFERRALS (★ NEW: S-15)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    referrer_user_id uuid NOT NULL REFERENCES users(id),
    referee_email text NOT NULL,
    referee_tenant_id uuid REFERENCES tenants(id),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'signed_up', 'subscribed', 'reward_granted')),
    referral_code text NOT NULL UNIQUE,
    reward_granted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_referrals_tenant ON referrals(tenant_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
```

### 11.7 — System & Logging Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- RAW_LISTINGS (✓ FIXED: D-5)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE raw_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform text NOT NULL,
    actor_run_id text,
    worker_name text NOT NULL,
    raw_json jsonb NOT NULL,
    quality text DEFAULT 'full'
        CHECK (quality IN ('full', 'partial')),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_raw_listings_tenant ON raw_listings(tenant_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- DATA_QUARANTINE (✓ FIXED: T-8)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE data_quarantine (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_worker text NOT NULL,
    raw_data jsonb NOT NULL,
    failure_reason text NOT NULL,
    failure_step text NOT NULL
        CHECK (failure_step IN ('schema', 'sanitise', 'range', 'transform')),
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz
);
CREATE INDEX idx_quarantine_tenant ON data_quarantine(tenant_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- SCRAPE_LOG
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE scrape_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    worker_name text NOT NULL,
    trigger_type text NOT NULL,
    -- 'user_click', 'idle_3h', 'alert_breach', 'scheduled', 'system'
    platform text,
    cost_estimate decimal(8,4),
    duration_ms integer,
    status text NOT NULL DEFAULT 'started'
        CHECK (status IN ('started', 'success', 'partial', 'failed', 'dead_lettered')),
    error_message text,
    records_processed integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_scrape_log_tenant ON scrape_log(tenant_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- SCRAPE_SCHEDULE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE scrape_schedule (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform text NOT NULL,
    last_scraped_at timestamptz,
    next_scheduled_at timestamptz,
    priority integer DEFAULT 1,
    UNIQUE(tenant_id, platform)
);

-- ═══════════════════════════════════════════════════════════════
-- API_USAGE_LOG (doubles as audit log)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE api_usage_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id),
    endpoint text NOT NULL,
    method text NOT NULL,
    action text,  -- 'saved_product', 'triggered_scrape', 'sent_outreach', 'exported_report'
    target_type text,
    target_id uuid,
    response_time_ms integer,
    status_code integer,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_usage_tenant ON api_usage_log(tenant_id, created_at DESC);
CREATE INDEX idx_api_usage_user ON api_usage_log(tenant_id, user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- WEBHOOK_CONFIGS (user-configured webhook endpoints)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE webhook_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url text NOT NULL,
    event_types text[] NOT NULL,
    -- ['trend_alert', 'pre_trend_alert', 'new_product', 'outreach_reply']
    secret text NOT NULL,  -- for HMAC signature verification
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhook_configs_tenant ON webhook_configs(tenant_id);
```

### 11.8 — Materialised View

```sql
-- ═══════════════════════════════════════════════════════════════
-- DASHBOARD_CARDS_MV (✓ FIXED: T-6)
-- ═══════════════════════════════════════════════════════════════
CREATE MATERIALIZED VIEW dashboard_cards_mv AS
SELECT
    p.tenant_id,
    p.id AS product_id,
    p.title,
    p.image_url,
    p.category,
    p.product_type,
    p.price,
    p.platform,
    p.niche_tags,
    p.created_at AS first_detected_at,
    p.last_scraped_at,
    ts.score AS trend_score,
    ts.saturation_score,
    ts.lifecycle_stage,
    ts.scored_at AS trend_scored_at,
    pred.predictive_score,
    ps_best.platform AS recommended_platform,
    ps_best.score AS platform_score,
    ps_best.ai_rationale AS platform_rationale,
    (SELECT COUNT(*) FROM creator_product_links cpl
     WHERE cpl.product_id = p.id AND cpl.tenant_id = p.tenant_id) AS creator_count,
    (SELECT COUNT(*) FROM videos v
     WHERE v.product_id = p.id AND v.tenant_id = p.tenant_id) AS video_count,
    (SELECT COUNT(*) FROM product_platform_matches ppm
     WHERE ppm.product_id = p.id AND ppm.tenant_id = p.tenant_id) AS cross_platform_count
FROM products p
LEFT JOIN LATERAL (
    SELECT score, saturation_score, lifecycle_stage, scored_at
    FROM trend_scores
    WHERE product_id = p.id AND tenant_id = p.tenant_id
    ORDER BY scored_at DESC LIMIT 1
) ts ON true
LEFT JOIN LATERAL (
    SELECT MAX(signal_strength) AS predictive_score
    FROM predictive_signals
    WHERE product_id = p.id AND tenant_id = p.tenant_id
      AND detected_at > now() - interval '7 days'
) pred ON true
LEFT JOIN LATERAL (
    SELECT platform, score, ai_rationale
    FROM platform_scores
    WHERE product_id = p.id AND tenant_id = p.tenant_id
    ORDER BY score DESC LIMIT 1
) ps_best ON true;

-- Required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_tenant_product ON dashboard_cards_mv(tenant_id, product_id);
CREATE INDEX idx_mv_tenant_trend ON dashboard_cards_mv(tenant_id, trend_score DESC NULLS LAST);
CREATE INDEX idx_mv_tenant_predictive ON dashboard_cards_mv(tenant_id, predictive_score DESC NULLS LAST);
CREATE INDEX idx_mv_tenant_created ON dashboard_cards_mv(tenant_id, first_detected_at DESC);
```

### 11.9 — RLS Policies

```sql
-- Standard tenant isolation policy (apply to ALL data tables)
-- Template: replace {table_name} for each table

CREATE POLICY "Tenant isolation" ON {table_name}
    FOR ALL
    USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

-- Admin-only tables (scrape_log, scrape_schedule, api_usage_log, data_quarantine, webhook_configs)

CREATE POLICY "Admin only" ON {table_name}
    FOR ALL
    USING (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND (auth.jwt()->>'role') IN ('super_admin', 'agency_owner')
    );

-- User-scoped tables (notification_preferences, saved_views, product_user_status)

CREATE POLICY "User scoped" ON {table_name}
    FOR ALL
    USING (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND user_id = (auth.jwt()->>'sub')::uuid
    )
    WITH CHECK (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND user_id = (auth.jwt()->>'sub')::uuid
    );
```

### 11.10 — Table Count Summary

| Category | Tables | Names |
|----------|--------|-------|
| Tenant & User | 2 | tenants, users |
| Team | 1 | invitations |
| Core Intelligence | 6 | products, creators, videos, shops, ads, raw_listings |
| Scoring | 5 | trend_scores, platform_scores, product_platform_matches, creator_product_links, predictive_signals |
| Reference | 2 | affiliate_programs, niches |
| User Activity | 4 | alert_configs, saved_collections, product_user_status, saved_views |
| Annotations | 1 | annotations |
| Notifications | 2 | notifications, notification_preferences |
| Outreach | 2 | outreach_sequences, outreach_optouts |
| Billing | 2 | processed_webhooks, referrals |
| System | 4 | data_quarantine, scrape_log, scrape_schedule, api_usage_log |
| Config | 1 | webhook_configs |
| **TOTAL** | **32** | + 1 materialised view |

---

## Section 12 — Worker System

`✓ FIXED: D-1 — Google Trends + YouTube workers now defined. D-2 — canonical count is 21. D-15 — cross_platform_match_worker now defined.`

### 12.1 — Worker Registry (21 Workers)

#### Scraping Workers (14) — Make External API Calls

| # | Worker | Trigger | Queue | Daily Budget | External API | Input | Output Table |
|---|--------|---------|-------|-------------|-------------|-------|-------------|
| 1 | `tiktok_discovery_worker` | User opens TikTok section / idle 3h | P0 or P2 | 500 | Apify / RapidAPI | TikTok region, niche filters | products, shops |
| 2 | `hashtag_scanner_worker` | Fires with discovery worker | P0 or P2 | 200 | TikTok unofficial API | Trending hashtag list | products (tags enrichment) |
| 3 | `creator_monitor_worker` | User expands Influencers row / Row 3 | P0 or P2 | 200 | Apify | Product ID or niche | creators, creator_product_links |
| 4 | `video_scraper_worker` | User opens Videos page / product click | P0 | 300 | Apify | Product ID, creator IDs | videos |
| 5 | `tiktok_live_worker` | User opens TikTok Live page | P0 | 100 | RapidAPI | TikTok region | videos (is_live = true) |
| 6 | `tiktok_ads_worker` | User opens TikTok Ads page / idle 3h | P0 or P2 | 150 | TikTok Ads API | Product keywords, category | ads |
| 7 | `amazon_bsr_scanner_worker` | User opens Amazon section / idle 3h | P0 or P2 | 150 | Amazon PA API | Category, ASIN list | products, trend_scores |
| 8 | `shopify_store_discovery_worker` | User opens Shopify section / idle 3h | P0 or P2 | 100 | Apify | Niche, keyword | shops, products |
| 9 | `shopify_growth_monitor_worker` | Fires with store discovery | P0 or P2 | 80 | Apify | Shop IDs from discovery | shops (revenue, traffic updates) |
| 10 | `facebook_ads_worker` | User opens Ads Intelligence / idle 3h | P0 or P2 | 200 | Apify | Product keywords, category | ads |
| 11 | `reddit_trend_worker` | Idle refresh rotation only | P2 | 100 | Reddit API (free) | Subreddit list, keywords | products (trend signals) |
| 12 | `pinterest_trend_worker` | Idle refresh rotation only | P2 | 100 | Pinterest API (free) | Trend categories | products (trend signals) |
| 13 | `google_trends_worker` | User views demand data / idle refresh | P0 or P2 | 50 | SerpAPI | Product keywords | trend_scores (search volume) |
| 14 | `youtube_worker` | User views YouTube data on product | P0 | 100 | YouTube Data API (free quota) | Product keywords, ASIN | videos (platform = 'youtube') |

#### Intelligence Workers (5) — Internal Processing + AI API

| # | Worker | Trigger | Queue | External API | Input | Output |
|---|--------|---------|-------|-------------|-------|--------|
| 15 | `product_extractor_worker` | After any scrape completes | P0 or P1 | None (internal) | raw_listings records | products (normalised), niche_tags |
| 16 | `amazon_tiktok_match_worker` | After product_extractor completes | P1 | None (internal) | products with platform = 'tiktok' or 'amazon' | product_platform_matches |
| 17 | `cross_platform_match_worker` | After any product scrape completes | P1 | None (internal) | All products across platforms | product_platform_matches |
| 18 | `trend_scoring_worker` | After any data scrape completes | P1 | None (internal) | products, videos, shops, ads, creator_product_links | trend_scores, niches (aggregation) |
| 19 | `predictive_discovery_worker` | Every 2h via scheduler (Proactive) | P1 | Anthropic API (50 calls/day) | trend_scores, predictive_signals, creator_product_links | predictive_signals |

#### System Workers (2)

| # | Worker | Trigger | Queue | External API | Purpose |
|---|--------|---------|-------|-------------|---------|
| 20 | `platform_profitability_scorer` | User views Best Platform row (Row 7) | P0 | Anthropic API (30 calls/day) | Generates platform_scores + AI rationale |
| 21 | `system_health_monitor_worker` | Always-on (lightweight loop) | Always | None | Checks queue depth, worker status, Redis health. Fires alerts. |

### 12.2 — Worker Execution Template

Every worker follows this execution template:

```typescript
async function executeWorker(jobData: WorkerJobData): Promise<void> {
    const { tenantId, platform, resource, trigger, priority } = jobData
    const workerName = 'worker_name_here'

    // Step 1: Log start
    const logId = await logToScrapeLog({
        tenant_id: tenantId, worker_name: workerName,
        trigger_type: trigger, platform, status: 'started'
    })

    try {
        // Step 2: Budget check (external workers only)
        if (EXTERNAL_WORKERS.includes(workerName)) {
            const budgetOk = await checkBudget(workerName)
            if (!budgetOk) {
                await updateScrapeLog(logId, { status: 'dead_lettered', error_message: 'Budget exhausted' })
                throw new BudgetExhaustedError(workerName)
            }
        }

        // Step 3: Fetch data from external API
        const rawData = await fetchFromApi(jobData)

        // Step 4: Validate (Zod schema)
        const validated = WorkerSchema.parse(rawData)

        // Step 5: Sanitise
        const sanitised = sanitiseData(validated)

        // Step 6: Store raw data
        await supabase.from('raw_listings').insert({
            tenant_id: tenantId, platform, worker_name: workerName,
            raw_json: rawData, quality: rawData.length < EXPECTED_MIN ? 'partial' : 'full'
        })

        // Step 7: Transform + upsert
        const records = transformToSchema(sanitised)
        await upsertRecords(records, tenantId)

        // Step 8: Update freshness
        await redis.set(`data_freshness:${platform}:${resource}:${tenantId}`, Date.now(), 'EX', 86400)

        // Step 9: Trigger downstream workers
        await enqueueDownstream(workerName, tenantId, records)

        // Step 10: Broadcast update via Supabase Realtime
        await supabase.channel(`tenant:${tenantId}:dashboard`).send({
            type: 'broadcast', event: 'data_updated',
            payload: { table: resource, count: records.length }
        })

        // Step 11: Log success
        await updateScrapeLog(logId, {
            status: 'success', duration_ms: Date.now() - startTime,
            records_processed: records.length
        })

    } catch (error) {
        // Step 12: Error handling (see Section 16 for full error matrix)
        await handleWorkerError(error, logId, jobData)
    }
}
```

### 12.3 — Worker Dependency Chain

```
User action triggers scrape
    ↓
[tiktok_discovery / amazon_bsr / shopify_store / etc.] (scraping worker)
    ↓
product_extractor_worker (normalise raw → products table)
    ↓ (parallel)
├── amazon_tiktok_match_worker (TikTok ↔ Amazon matching)
├── cross_platform_match_worker (all-platform matching)
├── trend_scoring_worker (compute scores + lifecycle + niche aggregation)
│       ↓
│   [IF predictive_score > 65 AND product_age < 7d]
│       → Fire P1 alert job
│       → Notify subscribed users
│
└── [IF user is viewing product detail]
    └── platform_profitability_scorer (Row 7, Anthropic API)
```

### 12.4 — Downstream Worker Triggers

| After Worker Completes | Trigger These Workers |
|----------------------|---------------------|
| Any scraping worker (#1–14) | product_extractor_worker (#15) |
| product_extractor_worker (#15) | amazon_tiktok_match_worker (#16), cross_platform_match_worker (#17), trend_scoring_worker (#18) |
| trend_scoring_worker (#18) | [Check alert thresholds → fire notifications if breached] |
| platform_profitability_scorer (#20) | [None — terminal worker] |
| predictive_discovery_worker (#19) | [Check pre-trend thresholds → fire P1 alerts] |

### 12.5 — Worker Failure Handling

| Failure Type | Detection | Response | Max Retries | Dead Letter? |
|-------------|-----------|----------|-------------|-------------|
| External API timeout | Request timeout > 30s | Retry with 2× timeout | 3 | Yes |
| External API 429 | HTTP 429 response | Exponential backoff: 2s, 4s, 8s, 16s | 4 | Yes (if all retries fail) |
| External API 5xx | HTTP 500-599 | Circuit breaker (5 failures in 5 min) | 3 | Yes |
| Empty dataset | 0 records returned | Do NOT overwrite existing data. Log anomaly. | 1 retry | Yes |
| Partial dataset | < expected_min records | Accept with quality='partial' flag | 0 (accept as-is) | No |
| Zod validation failure | Schema parse throws | Quarantine to data_quarantine table | 0 | No (quarantined) |
| Budget exhausted | checkBudget() returns false | Halt worker, log, alert admin | 0 | Yes |
| Anthropic API error | HTTP error or malformed response | Retry with backoff, fall back to cached response | 2 | Yes |
| Supabase write failure | DB error | Retry once, then dead-letter | 1 | Yes |

**BullMQ retry configuration** (per worker):

```typescript
{
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000  // 2s, 4s, 8s
    },
    removeOnComplete: { count: 1000 },  // keep last 1000 completed
    removeOnFail: { count: 5000 }       // keep last 5000 failed (for debugging)
}
```

---

## Section 13 — API Routes

`★ NEW: This entire section is new. The v5 brief had NO dedicated API routes section — identified as the #1 gap in Phase 2.`

All routes are on the **Railway Express backend** (not Netlify). All routes require JWT auth unless marked PUBLIC.

### 13.1 — Authentication Routes

| Method | Path | Purpose | Auth | Rate Limit |
|--------|------|---------|------|-----------|
| POST | `/api/auth/signup` | Create account + tenant | PUBLIC | 5/15min per IP |
| POST | `/api/auth/login` | Email/password login | PUBLIC | 5/15min per IP |
| POST | `/api/auth/magic-link` | Send magic link email | PUBLIC | 3/15min per IP |
| POST | `/api/auth/logout` | Invalidate JWT (blacklist) | JWT | — |
| POST | `/api/auth/refresh` | Refresh JWT using refresh token | Refresh token | 10/min |
| GET | `/api/auth/me` | Current user profile | JWT | — |

### 13.2 — Dashboard Routes

| Method | Path | Purpose | Auth | Plan Gate | Trigger |
|--------|------|---------|------|----------|---------|
| GET | `/api/dashboard/cards` | Home dashboard product cards (from MV) | JWT | All | Checks freshness, enqueues refresh if stale |
| POST | `/api/dashboard/refresh` | Force refresh dashboard MV | JWT | All | Enqueues P0 MV refresh |
| GET | `/api/dashboard/stats` | Live stats bar counters | JWT | All | Cached in Redis, updated on MV refresh |
| GET | `/api/dashboard/briefing` | Daily AI briefing (★ NEW: MN-3) | JWT | Pro+ | Reads latest briefing from cache/DB |

### 13.3 — Product Routes

| Method | Path | Purpose | Auth | Plan Gate | Trigger |
|--------|------|---------|------|----------|---------|
| GET | `/api/products` | List products (paginated, filtered, sorted) | JWT | All | No scrape — reads DB only |
| GET | `/api/products/:id` | Product detail (triggers chain freshness check) | JWT | All | Checks 7-row freshness, enqueues stale rows |
| GET | `/api/products/:id/chain/:row` | Specific chain row data | JWT | All | Checks freshness of specific row |
| POST | `/api/products/:id/refresh` | Force refresh all chain rows | JWT | All | Enqueues P0 job per stale row |
| GET | `/api/products/:id/trend-history` | 30/60/90 day trend score chart data | JWT | Pro+ | Reads trend_scores time-series |
| GET | `/api/products/:id/cross-platform` | Cross-platform matches (Row 5) | JWT | Pro+ | Reads product_platform_matches |
| POST | `/api/products/compare` | Compare 2-4 products side-by-side | JWT | Pro+ | Body: `{ product_ids: [...] }` |
| POST | `/api/products/bulk-action` | Bulk save/alert/archive/dismiss | JWT | All | Body: `{ product_ids, action, params }` |

### 13.4 — Platform-Specific Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/tiktok/products` | TikTok trending products | JWT | All |
| GET | `/api/tiktok/creators` | TikTok creator rankings | JWT | All |
| GET | `/api/tiktok/videos` | TikTok viral videos | JWT | All |
| GET | `/api/tiktok/shops` | TikTok shops by GMV | JWT | All |
| GET | `/api/tiktok/live` | TikTok live streams | JWT | All |
| GET | `/api/tiktok/ads` | TikTok ad creatives | JWT | All |
| GET | `/api/amazon/products` | Amazon rising products (BSR) | JWT | Pro+ |
| GET | `/api/amazon/rankings` | Amazon BSR movement charts | JWT | Pro+ |
| GET | `/api/amazon/cross-signal` | Amazon vs TikTok cross-signal | JWT | Pro+ |
| GET | `/api/shopify/stores` | Shopify store discovery | JWT | Agency+ |
| GET | `/api/shopify/stores/:id` | Shopify store deep dive | JWT | Agency+ |
| GET | `/api/shopify/niches` | Shopify niche scanner | JWT | Agency+ |

All platform routes: check freshness → return data + badge → enqueue P0 scrape if stale.

### 13.5 — Creator & Outreach Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/creators` | List creators (paginated, filtered) | JWT | All |
| GET | `/api/creators/:id` | Creator detail | JWT | All |
| GET | `/api/creators/:id/products` | Products linked to this creator | JWT | All |
| POST | `/api/creators/:id/outreach` | Generate + send outreach email | JWT | Pro+ (5/mo), Agency+ (50/mo) |
| GET | `/api/outreach/sequences` | Outreach sequence dashboard | JWT | Pro+ |
| GET | `/api/outreach/stats` | Outreach analytics (open/reply rates) | JWT | Pro+ |

### 13.6 — Collection & Saved View Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/collections` | List user's collections | JWT | All |
| POST | `/api/collections` | Create/save to collection | JWT | All |
| DELETE | `/api/collections/:id` | Remove from collection | JWT | All |
| GET | `/api/views` | List saved views | JWT | Pro+ |
| POST | `/api/views` | Save current view config | JWT | Pro+ |
| PUT | `/api/views/:id` | Update saved view | JWT | Pro+ |
| DELETE | `/api/views/:id` | Delete saved view | JWT | Pro+ |
| PUT | `/api/views/:id/default` | Set as default view | JWT | Pro+ |

### 13.7 — Alert & Notification Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/alerts` | List alert configurations | JWT | All |
| POST | `/api/alerts` | Create alert | JWT | All (limited by plan) |
| PUT | `/api/alerts/:id` | Update alert threshold | JWT | All |
| DELETE | `/api/alerts/:id` | Delete alert | JWT | All |
| GET | `/api/notifications` | List notifications (paginated) | JWT | All |
| PUT | `/api/notifications/:id/read` | Mark notification as read | JWT | All |
| PUT | `/api/notifications/read-all` | Mark all as read | JWT | All |
| GET | `/api/notifications/preferences` | Get notification preferences | JWT | All |
| PUT | `/api/notifications/preferences` | Update notification preferences | JWT | All |

### 13.8 — Search Route

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/search?q={query}&type={type}` | Global search (Cmd+K) across products, creators, shops, niches | JWT | All |

Query params: `q` (search term, min 2 chars), `type` (optional: 'products', 'creators', 'shops', 'niches'), `limit` (default 5 per type).

### 13.9 — Team & Invitation Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/team` | List team members | JWT | All |
| POST | `/api/team/invite` | Send invitation email | JWT (admin) | Pro+ (3 seats), Agency+ (10) |
| DELETE | `/api/team/:userId` | Remove team member | JWT (admin) | Pro+ |
| PUT | `/api/team/:userId/role` | Change member role | JWT (admin) | Pro+ |
| POST | `/api/invite/accept/:token` | Accept invitation | PUBLIC | — |
| GET | `/api/team/activity` | Activity feed (★ NEW: S-10) | JWT (admin) | Agency+ |

### 13.10 — Billing Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| POST | `/api/billing/checkout` | Create Stripe Checkout session | JWT (admin) | All |
| GET | `/api/billing/portal` | Get Stripe Customer Portal URL | JWT (admin) | All |
| GET | `/api/billing/usage` | Current usage vs plan limits | JWT | All |
| GET | `/api/billing/invoices` | Invoice history | JWT (admin) | All |

### 13.11 — Export & Report Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| POST | `/api/export/csv` | Export products/creators as CSV | JWT | All (limited) |
| POST | `/api/export/excel` | Export as Excel | JWT | Pro+ |
| POST | `/api/reports/generate` | Generate AI intelligence report PDF | JWT | Agency+ |
| GET | `/api/reports` | List generated reports | JWT | Agency+ |
| GET | `/api/reports/:id/download` | Download report PDF | JWT | Agency+ |
| POST | `/api/reports/schedule` | Schedule recurring reports | JWT | Agency+ |

### 13.12 — Sharing Routes (★ NEW: S-11)

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| POST | `/api/share/link` | Create shareable read-only link | JWT | Agency+ |
| GET | `/api/share/:token` | Access shared content (public) | Token | — |
| DELETE | `/api/share/:id` | Revoke share link | JWT | Agency+ |

### 13.13 — Annotation Routes (★ NEW: MN-4)

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/annotations?target_type={type}&target_id={id}` | List annotations on target | JWT | Pro+ |
| POST | `/api/annotations` | Create annotation | JWT | Pro+ |
| PUT | `/api/annotations/:id` | Edit annotation | JWT (owner) | Pro+ |
| DELETE | `/api/annotations/:id` | Delete annotation | JWT (owner) | Pro+ |
| PUT | `/api/annotations/:id/pin` | Toggle pin | JWT (admin) | Pro+ |

### 13.14 — Webhook Configuration Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/webhooks` | List configured webhooks | JWT (admin) | Agency+ |
| POST | `/api/webhooks` | Create webhook endpoint | JWT (admin) | Agency+ |
| PUT | `/api/webhooks/:id` | Update webhook | JWT (admin) | Agency+ |
| DELETE | `/api/webhooks/:id` | Delete webhook | JWT (admin) | Agency+ |
| POST | `/api/webhooks/:id/test` | Send test event | JWT (admin) | Agency+ |

### 13.15 — Admin / System Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/admin/settings` | Tenant settings (branding, API keys) | JWT (admin) | All |
| PUT | `/api/admin/settings` | Update tenant settings | JWT (admin) | All |
| GET | `/api/admin/system-health` | System health dashboard data | JWT (super_admin) | — |
| GET | `/api/admin/scrape-log` | Scrape execution history | JWT (admin) | All |
| GET | `/api/admin/quarantine` | Data quarantine records | JWT (admin) | All |

### 13.16 — Incoming Webhook Endpoints (external services)

| Method | Path | Purpose | Auth | Source |
|--------|------|---------|------|--------|
| POST | `/api/webhooks/stripe` | Stripe subscription events | Stripe signature | Stripe |
| POST | `/api/webhooks/resend` | Resend email tracking events | Resend signature | Resend |

### 13.17 — Public Health Check

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/health` | Service health check (DB, Redis, BullMQ) | PUBLIC |

### 13.18 — Route Count Summary

| Category | Routes |
|----------|--------|
| Authentication | 6 |
| Dashboard | 4 |
| Products | 8 |
| Platform-specific | 12 |
| Creators & Outreach | 6 |
| Collections & Views | 8 |
| Alerts & Notifications | 9 |
| Search | 1 |
| Team & Invitations | 6 |
| Billing | 4 |
| Export & Reports | 6 |
| Sharing | 3 |
| Annotations | 5 |
| Webhooks (config) | 5 |
| Admin/System | 5 |
| Incoming Webhooks | 2 |
| Health | 1 |
| **TOTAL** | **91 routes** |

---

## Section 14 — Subscription Plans & Billing

### 14.1 — Plan Feature Matrix

| Feature | Starter ($49/mo) | Pro ($149/mo) | Agency ($349/mo) | Enterprise (Custom) |
|---------|:----------------:|:------------:|:---------------:|:------------------:|
| **Platform Access** | | | | |
| TikTok Intelligence | Yes | Yes | Yes | Yes |
| Amazon Intelligence | — | Yes | Yes | Yes |
| Shopify Intelligence | — | — | Yes | Yes |
| Facebook/Instagram Ads | — | — | Yes | Yes |
| Reddit/Pinterest/Google/YouTube | — | — | Yes | Yes |
| **Limits** | | | | |
| Products tracked | 500 | 5,000 | 25,000 | Unlimited |
| Creators tracked | 200 | 2,000 | 10,000 | Unlimited |
| Trend alerts | 3 | 25 | Unlimited | Unlimited |
| Saved collections | 10 items | 100 items | Unlimited | Unlimited |
| Saved views | 3 | 10 | 20 | Unlimited |
| Team seats | 1 | 3 | 10 | Unlimited |
| **Intelligence Features** | | | | |
| Trend Score | Yes | Yes | Yes | Yes |
| Predictive engine | — | Yes | Yes | Yes |
| Creator-Product Match | — | Yes | Yes | Yes |
| Best Platform Recommender | — | — | Yes | Yes |
| Product Lifecycle badges | — | Yes | Yes | Yes |
| Niche Intelligence | — | — | Yes | Yes |
| Cross-platform graph | — | Yes (basic) | Yes (full) | Yes (full) |
| **Outreach & Reports** | | | | |
| Creator outreach emails | — | 5/month | 50/month | Unlimited |
| AI Intelligence Reports | — | — | Yes (branded) | Yes (white-label) |
| Daily AI Briefing | — | Yes | Yes | Yes |
| **Data & Export** | | | | |
| CSV export | Yes | Yes | Yes | Yes |
| Excel export | — | Yes | Yes | Yes |
| PDF export | — | — | Yes | Yes |
| API access | — | — | 1,000 calls/mo | Unlimited |
| **Collaboration** | | | | |
| Team annotations | — | Yes | Yes | Yes |
| Activity log | — | — | Yes | Yes |
| Client sharing links | — | — | Yes | Yes |
| Client portal | — | — | — | Yes |
| **Customisation** | | | | |
| Custom branding | — | — | Logo + colours | Full white-label |
| Custom domain | — | — | — | Yes |
| Webhook integrations | — | — | Yes | Yes |
| Dedicated support | — | — | Priority email | Dedicated CSM |

### 14.2 — Pricing Structure

| Plan | Monthly | Annual (20% off) | Annual Total |
|------|---------|-------------------|-------------|
| Starter | $49/mo | $39/mo | $468/yr |
| Pro | $149/mo | $119/mo | $1,428/yr |
| Agency | $349/mo | $279/mo | $3,348/yr |
| Enterprise | Custom | Custom | Custom |

`★ NEW: Annual billing (S-14)`

### 14.3 — Stripe Integration Architecture

**Stripe Products & Prices**:
- 1 Stripe Product per plan (Starter, Pro, Agency)
- 2 Stripe Prices per product (monthly, annual)
- Enterprise: custom invoicing via Stripe Invoicing

**Checkout Flow**:
```
User clicks "Subscribe" → POST /api/billing/checkout
→ Create Stripe Checkout Session with:
    - price_id (based on selected plan + billing cycle)
    - customer_email (from auth)
    - success_url: /dashboard?checkout=success
    - cancel_url: /pricing?checkout=cancel
    - allow_promotion_codes: true
→ Redirect user to Stripe Checkout
→ On success: Stripe sends checkout.session.completed webhook
→ Backend: update tenants.plan, tenants.stripe_customer_id, tenants.stripe_subscription_id
→ Redirect user to dashboard with success toast
```

**Customer Portal**:
```
User clicks "Manage Billing" → GET /api/billing/portal
→ Create Stripe Billing Portal Session
→ Features enabled:
    - Update payment method
    - View invoices
    - Cancel subscription
    - Switch plan (upgrade/downgrade)
→ Redirect user to Stripe portal
```

**Usage Metering** (via Stripe Meters):

| Meter | What It Tracks | Enforcement Point |
|-------|---------------|-------------------|
| products_tracked | COUNT(products WHERE tenant_id = :id) | Before product upsert |
| creators_tracked | COUNT(creators WHERE tenant_id = :id) | Before creator upsert |
| alerts_active | COUNT(alert_configs WHERE tenant_id = :id AND is_active = true) | Before alert creation |
| outreach_sent | COUNT(outreach_sequences WHERE tenant_id = :id AND MONTH(sent_at) = current) | Before outreach send |
| api_calls | COUNT(api_usage_log WHERE tenant_id = :id AND MONTH(created_at) = current) | API rate limiter middleware |

**Enforcement**: Application middleware checks usage against plan limits BEFORE executing the operation. Returns 403 with upgrade prompt if limit reached.

### 14.4 — Webhook Event Handling

`✓ FIXED: T-3 — complete Stripe webhook handling defined`

**Endpoint**: `POST /api/webhooks/stripe`

```typescript
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    // 1. Verify webhook signature
    const event = stripe.webhooks.constructEvent(
        req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET
    )

    // 2. Idempotency check
    const existing = await supabase.from('processed_webhooks')
        .select('id').eq('event_id', event.id).single()
    if (existing.data) return res.json({ received: true, duplicate: true })

    // 3. Process event
    switch (event.type) {
        case 'checkout.session.completed': await handleCheckoutComplete(event); break
        case 'invoice.payment_succeeded': await handlePaymentSuccess(event); break
        case 'invoice.payment_failed': await handlePaymentFailed(event); break
        case 'customer.subscription.updated': await handleSubscriptionUpdate(event); break
        case 'customer.subscription.deleted': await handleSubscriptionDeleted(event); break
    }

    // 4. Record as processed
    await supabase.from('processed_webhooks').insert({
        event_id: event.id, event_type: event.type
    })

    res.json({ received: true })
})
```

### 14.5 — Free Trial Lifecycle

`✓ FIXED: T-18`

| Day | Event | Tenant State | Action |
|-----|-------|-------------|--------|
| 0 | Signup | `plan: 'trial'`, `plan_status: 'trial'`, `trial_ends_at: +14d` | Full Pro access. No card required. Welcome email. |
| 7 | Midpoint | No change | Email: "Your trial is halfway. Here's what you've discovered: [stats]." |
| 12 | Urgent | No change | Email: "2 days left. Upgrade to keep your data." |
| 14 | Expires | `plan: 'locked'`, `plan_status: 'locked'` | Read-only access. No scrapes, exports, outreach. Banner: "Trial ended. Choose a plan." |
| 21 | Reminder | No change | Email: "Your data will be archived in 9 days. Upgrade now." |
| 30 | Archive | `plan_status: 'archived'` | Data moved to cold storage. Account shell preserved. Can reactivate. |

### 14.6 — Dunning Flow (Failed Payments)

`★ NEW: S-12 — P0 launch blocker`

| Day | Trigger | Tenant State | User Experience |
|-----|---------|-------------|-----------------|
| 0 | `invoice.payment_failed` | `plan_status: 'past_due'` | Stripe auto-retries. Email: "Payment failed. Update card." + portal link. |
| 3 | Grace expired | `plan_status: 'grace_expired'` | Full access continues. Email: "Update payment within 4 days." |
| 7 | Restricted | `plan_status: 'restricted'` | Read-only. No scrapes/exports/outreach. Banner in app. |
| 14 | Locked | `plan_status: 'locked'` | Login → payment update page. Email: "Account locked. Data preserved 16 more days." |
| 30 | Archived | `plan_status: 'archived'` | Data archived. Re-activate with new payment. |

### 14.7 — Upgrade/Downgrade Logic

`★ NEW: S-13`

**Upgrade** (e.g., Starter → Pro):
1. Stripe prorates charge immediately
2. New plan limits effective immediately
3. New features available immediately
4. Confirmation email with new plan summary

**Downgrade** (e.g., Agency → Pro):
1. Takes effect at end of current billing cycle
2. Before confirmation, show impact summary:
   - "Your Agency plan ends on [date]. After that:"
   - "Shopify Intelligence will be locked"
   - "20,000 of your 25,000 products will be archived (newest kept)"
   - "Agency reports will be locked"
   - "Team seats reduced from 10 to 3 (remove members first)"
3. Excess data archived (not deleted) — accessible if user re-upgrades
4. Excess team members: admin must remove to reach new limit before downgrade takes effect

---

## Section 15 — Missing SaaS Features (Now Added)

This section provides a consolidated index of all 18 missing SaaS features from Phase 3, showing where each is fully specified in v6.0.

### 15.1 — Feature Resolution Index

| ID | Feature | Priority | Primary Section | Supporting Sections | Status |
|----|---------|----------|----------------|--------------------|---------|
| S-1 | Onboarding empty states / time-to-value | P0 | Section 6.7 (Onboarding Flow) | Section 8.5 (Loading & Empty States) | RESOLVED |
| S-2 | Loading skeleton states | P1 | Section 8.5 (Loading & Empty States) | — | RESOLVED |
| S-3 | WCAG accessibility | P1 | Section 8.11 (Accessibility) | Section 4.5 (badge hex values) | RESOLVED |
| S-4 | Notification preferences | P1 | Section 8.7 (Notification Centre) | Section 11.5 (notification_preferences table) | RESOLVED |
| S-5 | Bulk actions on product lists | P1 | Section 8.8 (Bulk Actions) | Section 13.3 (POST /api/products/bulk-action) | RESOLVED |
| S-6 | Saved views / custom filters | P2 | Section 8.10 (Saved Views) | Section 11.4 (saved_views table), Section 13.6 | RESOLVED |
| S-7 | Help centre / contextual tooltips | P0 | Section 8.14 (Help & Tooltips) | — | RESOLVED |
| S-8 | Data retention visibility | P1 | Section 6.11 (GDPR: Data Retention) | — | RESOLVED |
| S-9 | Team invitation / multi-user | P0 | Section 6.3 (Team Invitation Flow) | Section 11.1 (invitations table), Section 13.9 | RESOLVED |
| S-10 | Activity log for team admins | P2 | Section 8.15 (Activity Log) | Section 13.9 (GET /api/team/activity) | RESOLVED |
| S-11 | External client sharing / portal | P2 | Section 6.12 (Client Sharing) | Section 13.12 (sharing routes) | RESOLVED |
| S-12 | Failed payment / dunning flow | P0 | Section 14.6 (Dunning Flow) | Section 6.8 (Stripe Webhooks) | RESOLVED |
| S-13 | Plan upgrade/downgrade proration | P1 | Section 14.7 (Upgrade/Downgrade Logic) | — | RESOLVED |
| S-14 | Annual plan option | P2 | Section 1.4 (Revenue Model) | Section 14.2 (Pricing Structure) | RESOLVED |
| S-15 | Referral programme | P3 | Section 6.8 (mentioned) | Section 11.6 (referrals table) | RESOLVED |
| S-16 | Product archiving / dismissal | P1 | Section 8.9 (Archiving & Dismissal) | Section 11.4 (product_user_status table) | RESOLVED |
| S-17 | Changelog / "What's New" | P3 | Section 8.13 (What's New) | — | RESOLVED |
| S-18 | Keyboard shortcuts | P3 | Section 8.12 (Keyboard Shortcuts) | — | RESOLVED |

### 15.2 — Additional SaaS Features (from v5, now enhanced)

| Feature | v5 Definition | v6 Enhancement |
|---------|--------------|----------------|
| Global Search (Cmd+K) | "Supabase full-text search (pg_trgm)" | tsvector columns, GIN indexes, debounce, grouped results, Typesense fallback (Section 8.6) |
| Audit Log | "Enterprise/Agency — api_usage_log table" | Expanded to team activity feed with filters (Section 8.15) |
| Notification Centre | "Bell icon, in-app" | Per-category preferences, digest frequency, global mute, webhook delivery (Section 8.7) |
| Data Export | "CSV, Excel, PDF" | Per-plan export limits, bulk export, agency branded PDF reports (Sections 13.11, Section 3 Moat 6) |
| Comparison Mode | "Select 2-4 products, compare side-by-side" | POST /api/products/compare route defined (Section 13.3) |
| Trend History Charts | "90-day trend score history chart" | GET /api/products/:id/trend-history route, trend_scores time-series (Section 13.3) |
| Competitor Niche Map | "Bubble chart: demand × competition × creator adoption" | Extended by Niche Intelligence Engine (★ NEW: MN-2, Section 3.3) |
| Creator Outreach CRM | "Identified → Email Sent → Replied → Deal Closed" | Full 3-email sequence, Resend webhooks, anti-spam, analytics dashboard (Section 3, Moat 5) |
| Webhook Integration | "User-configured webhook → external automations" | webhook_configs table, HMAC signatures, test endpoint (Sections 11.7, 13.14) |
| Mobile Responsive | "Fully usable on tablet and mobile" | Tailwind responsive utilities, mobile-first Opportunity Feed, touch targets (unchanged from v5) |

### 15.3 — Implementation Priority Matrix

**Phase 1 Build** (P0 features — launch blockers):

| Feature | Effort | Dependency |
|---------|--------|-----------|
| S-1: Onboarding empty states | Small | Requires skeleton components |
| S-7: Contextual tooltips | Small | No dependencies |
| S-9: Team invitations | Medium | Requires auth + invitations table |
| S-12: Dunning flow | Medium | Requires Stripe webhooks |

**Phase 2 Build** (P1 features — within 30 days of launch):

| Feature | Effort | Dependency |
|---------|--------|-----------|
| S-2: Skeleton loading | Small | No dependencies |
| S-3: WCAG accessibility | Medium | Applies to all UI components |
| S-4: Notification preferences | Small | Requires notification_preferences table |
| S-5: Bulk actions | Medium | Requires product list component |
| S-8: Data retention visibility | Small | Settings page |
| S-13: Proration logic | Medium | Requires Stripe integration |
| S-16: Product archiving | Small | Requires product_user_status table |

**Phase 3+ Build** (P2/P3 features):

| Feature | Effort | Notes |
|---------|--------|-------|
| S-6: Saved views | Medium | After core product list is stable |
| S-10: Activity log | Small | Uses existing api_usage_log |
| S-11: Client sharing | Medium | Agency-only feature |
| S-14: Annual plans | Small | Stripe configuration only |
| S-15: Referral programme | Medium | Tracking + reward logic |
| S-17: Changelog | Small | External content + modal |
| S-18: Keyboard shortcuts | Small | react-hotkeys or similar |

---

## Section 16 — Error Handling, Monitoring & Disaster Recovery

This section consolidates all error handling, monitoring, and disaster recovery specifications. Much of this content is defined in detail in earlier sections — this section serves as the **complete error handling reference**.

### 16.1 — External Dependency Error Matrix

`✓ FIXED: T-1, T-2, T-3, T-4, T-5 — error handling was entirely absent in v5`

| Dependency | Failure Mode | Detection | Immediate Response | Recovery |
|-----------|-------------|-----------|-------------------|----------|
| **Apify** | Actor timeout | Status: TIMED_OUT | Log, retry with 2× timeout | 3 retries → dead_letter |
| **Apify** | Service down (5xx) | HTTP 5xx / connection refused | Circuit breaker (5 failures/5 min) | Stale data + badge. Retry 15 min. |
| **Apify** | Partial data | Item count < expected | Accept with `quality: 'partial'` | Process available, schedule P2 retry |
| **Apify** | Empty dataset | 0 items | Do NOT overwrite existing | Retry once P1, then dead_letter |
| **Apify** | Rate limited (429) | HTTP 429 | Exponential backoff 2s/4s/8s/16s | Budget decrement |
| **Apify** | Actor deprecated | Deprecation header | Alert admin immediately | Manual: swap actor ID |
| **RapidAPI** | Rate limited (429) | HTTP 429 | Backoff + budget decrement | Wait for window reset |
| **RapidAPI** | Quota exceeded | 429 + quota header | Halt worker for day | Alert admin |
| **RapidAPI** | Schema change | Zod validation fail | Quarantine raw data | Alert admin |
| **RapidAPI** | Service outage (5xx) | HTTP 5xx | Circuit breaker | Stale data + badge |
| **Stripe** | Webhook delivery fail | No event received | — | Stripe auto-retries for 72h |
| **Stripe** | Duplicate webhook | Same event.id | Idempotency check (processed_webhooks table) | Skip duplicate |
| **Stripe** | Invalid signature | Signature mismatch | Reject + log security event | — |
| **Anthropic** | Rate limited (429) | HTTP 429 | Backoff | Retry after window |
| **Anthropic** | Quota exceeded | HTTP 429 + quota | Circuit breaker for non-P0 calls | Alert admin, use cached responses |
| **Anthropic** | Malformed response | Parse error | Fall back to cached AI rationale | Retry once |
| **Resend** | Delivery fail | Webhook: email.bounced | Update outreach_sequences status | Log, don't retry (bad email) |
| **Resend** | Service down | HTTP 5xx | Queue email for retry | Retry with backoff, max 3 |
| **Redis** | Freshness check fail | Connection error | Treat data as stale → return DB data | Reconnect with backoff |
| **Redis** | Budget check fail | Connection error | **REFUSE API call** (fail-safe, never fail-open) | Reconnect with backoff |
| **Redis** | BullMQ unavailable | Connection error | Return stale DB data + warning message | Reconnect with backoff |
| **Supabase DB** | Unreachable | Connection error | Cached data if available; clear error message | Reconnect with backoff |
| **Supabase Auth** | Unreachable | Connection error | Existing JWTs valid until expiry; maintenance banner | Reconnect |
| **Supabase Realtime** | Disconnected | WebSocket close | Fallback polling every 30s; "Live updates paused" indicator | Auto-reconnect with backoff |

### 16.2 — Circuit Breaker Pattern

Used for all external APIs (Apify, RapidAPI, Anthropic, Resend).

```typescript
class CircuitBreaker {
    private failures = 0
    private lastFailure = 0
    private state: 'closed' | 'open' | 'half-open' = 'closed'

    private readonly THRESHOLD = 5        // failures to trip
    private readonly WINDOW = 5 * 60_000  // 5 minutes
    private readonly COOLDOWN = 15 * 60_000  // 15 minutes before half-open

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailure > this.COOLDOWN) {
                this.state = 'half-open'  // allow one test request
            } else {
                throw new CircuitOpenError()
            }
        }

        try {
            const result = await fn()
            this.reset()
            return result
        } catch (error) {
            this.recordFailure()
            throw error
        }
    }

    private recordFailure() {
        this.failures++
        this.lastFailure = Date.now()
        if (this.failures >= this.THRESHOLD) {
            this.state = 'open'
            // Alert admin
        }
    }

    private reset() {
        this.failures = 0
        this.state = 'closed'
    }
}
```

### 16.3 — Health Check System

`✓ FIXED: T-9`

**Endpoint**: `GET /api/health` (public)

```typescript
app.get('/api/health', async (req, res) => {
    const checks = await Promise.allSettled([
        checkDatabase(),
        checkRedis(),
        checkBullMQ()
    ])

    const services = {
        database: formatCheck(checks[0]),
        redis: formatCheck(checks[1]),
        bullmq: formatCheck(checks[2])
    }

    const allHealthy = Object.values(services).every(s => s.status === 'up')

    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services
    })
})
```

### 16.4 — Alert Rules

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| P0 queue depth | > 50 jobs | > 100 jobs | Email admin |
| P1 queue depth | > 100 jobs | > 200 jobs | Email admin |
| Worker failure rate | > 5% in 15 min | > 10% in 15 min | Email + pause worker |
| API p95 response time | > 3 seconds | > 5 seconds | Email admin |
| Worker budget usage | 80% of daily limit | 100% of daily limit | Email / halt worker |
| Redis memory | > 75% capacity | > 90% capacity | Email admin |
| Dead letter queue | > 10 jobs/hour | > 50 jobs/hour | Email admin |
| Anthropic monthly spend | 80% of cap ($400) | 90% of cap ($450) | Email / circuit breaker |
| Circuit breaker trips | Any breaker opens | 3+ breakers open | Email admin |
| Data quarantine volume | > 50 records/day | > 200 records/day | Email admin |

**Alert destinations**: Configurable admin email list. Enterprise: custom Slack webhook.

### 16.5 — Logging Strategy

| Log Type | Destination | Retention | Purpose |
|----------|------------|-----------|---------|
| Worker execution | `scrape_log` table | 90 days | Track every worker run: trigger, duration, status, cost |
| API requests | `api_usage_log` table | 90 days | Track every API call: endpoint, user, response time |
| Data validation failures | `data_quarantine` table | Until resolved | Track rejected data for review |
| Security events | `api_usage_log` (action = 'security_event') | 90 days | Cross-tenant access attempts, auth failures |
| Application errors | Railway logs | 30 days (Railway default) | Unhandled exceptions, stack traces |
| BullMQ job history | Redis (BullMQ built-in) | 1000 completed / 5000 failed | Job execution history |

### 16.6 — Backup & Disaster Recovery

`✓ FIXED: T-10`

| Component | Strategy | Frequency | Retention |
|-----------|---------|-----------|-----------|
| PostgreSQL | Supabase automatic backups + PITR | Continuous (WAL) | 7 days |
| Redis | Railway RDB snapshots | Hourly | 24 hours |
| App code | GitHub repository | Every commit | Indefinite |
| Environment vars | Railway encrypted env | On change | Current only |

**Recovery Targets**:
- **RTO**: 4 hours (full service restoration)
- **RPO**: 1 hour (maximum data loss)

**Recovery Procedures**:

| Scenario | Procedure | Estimated Time |
|----------|----------|---------------|
| DB corruption | Supabase PITR to last clean state | 1–2 hours |
| Redis data loss | Ephemeral cache — rebuild from DB. Budgets reset. Queues re-enqueue from scrape_schedule. | 15 minutes |
| Railway outage | Deploy to backup Railway project (pre-configured) | 30 minutes |
| Supabase outage | No failover. Display maintenance page. Monitor status. | Dependent on Supabase |
| Accidental table drop | Supabase PITR | 1 hour |

### 16.7 — Data Retention & Cleanup

`✓ FIXED: T-13`

**Nightly cleanup job** (runs at 03:00 UTC):

```typescript
async function nightlyCleanup(tenantId: string) {
    const deletions = {
        scrape_log: await deleteOlderThan('scrape_log', tenantId, 90),
        api_usage_log: await deleteOlderThan('api_usage_log', tenantId, 90),
        notifications: await deleteOlderThan('notifications', tenantId, 30),
        trend_scores: await deleteOlderThan('trend_scores', tenantId, 90),
        predictive_signals: await deleteOlderThan('predictive_signals', tenantId, 90),
        data_quarantine: await deleteResolvedOlderThan('data_quarantine', tenantId, 30),
        processed_webhooks: await deleteOlderThan('processed_webhooks', null, 30)
    }

    await logToScrapeLog({
        worker_name: 'nightly_cleanup',
        trigger_type: 'system',
        status: 'success',
        records_processed: Object.values(deletions).reduce((a, b) => a + b, 0)
    })
}
```

---

## Section 17 — Development Phases (Revised)

`✓ FIXED: D-3 — phase ordering revised to respect moat priorities and dependencies`

### Phase 0 — Infrastructure & Auth (Days 1–5)

**Goal**: All infrastructure running, auth working, first API route returning data.

| Task | Dependency | Complexity | Addresses |
|------|-----------|-----------|-----------|
| Set up Railway: Redis + BullMQ P0/P1/P2 queues | None | Medium | Core infrastructure |
| Run Supabase schema migrations (all 32 tables + MV) | None | Medium | Section 11 |
| Apply RLS policies to all tables | Schema migrations | Small | Section 11.9, T-11 |
| Set up Supabase Auth: email, Google OAuth, magic links | Supabase | Small | Section 6.4 |
| Express backend with JWT middleware + tenant enforcement | Auth | Medium | Section 6.4, T-11 |
| Redis freshness tracking + budget enforcement middleware | Redis | Medium | Section 4.5, 4.7 |
| API rate limiting middleware | Redis | Small | T-12 |
| Health check endpoint (`/api/health`) | All services | Small | T-9 |
| Data validation layer (Zod schemas per worker) | None | Medium | T-8 |
| Create `/system/` context files + STATUS.json | None | Small | Section 19 |

### Phase 1 — TikTok MVP + Predictive Engine + Core UX (Days 6–25)

**Goal**: Working FastMoss-equivalent with pre-trend detection. Usable by first beta users.

| Task | Dependency | Complexity | Addresses |
|------|-----------|-----------|-----------|
| Smart scraping trigger system | Phase 0 | High | Section 4 |
| Workers: tiktok_discovery, hashtag_scanner, creator_monitor, video_scraper | Smart scraping | High | Section 12 |
| Workers: product_extractor, trend_scoring | Scraping workers | Medium | Section 12 |
| Worker: predictive_discovery (P1, every 2h) | trend_scoring | High | Section 3 (Moat 1), D-10 |
| Home dashboard: MV + product cards + stats bar | product_extractor | High | Section 8 |
| Data freshness badges on all cards/pages | Freshness middleware | Small | Section 4.5 |
| Idle 3-hour background refresh scheduler | Redis | Medium | Section 4.4 |
| TikTok section: Products, Creators, Videos, Live, Shops, Ads | Scraping workers | High | Section 9.2 |
| Product Detail: all 7 chain rows with on-demand scraping | All workers | High | Section 7 |
| Global search (Cmd+K) with tsvector | Products table | Medium | Section 8.6, T-21 |
| Notification centre (in-app) | Notifications table | Medium | Section 8.7 |
| Skeleton loading states | None | Small | S-2 |
| Onboarding flow + empty states | Auth + first scrape | Medium | S-1, S-7 |
| Contextual tooltips on scores/badges | None | Small | S-7 |
| Product archiving / dismissal | product_user_status table | Small | S-16 |
| Basic team invitations | Auth + invitations table | Medium | S-9 |
| Cross-platform match worker (foundation) | Products table | Medium | D-15, Moat 2 foundation |
| Supabase Realtime integration | Supabase | Medium | T-14, T-17 |
| Error handling for all external APIs | Workers | Medium | T-1, T-2 |

### Phase 2 — Amazon + Shopify + Advanced Intelligence (Days 26–45)

**Goal**: All 3 platforms fully operational with cross-platform intelligence.

| Task | Dependency | Complexity | Addresses |
|------|-----------|-----------|-----------|
| Workers: amazon_bsr_scanner, amazon_tiktok_match | Phase 1 workers | Medium | Section 12 |
| Workers: shopify_store_discovery, shopify_growth_monitor | Phase 1 workers | Medium | Section 12 |
| Workers: reddit_trend, pinterest_trend (P2 idle only) | Idle scheduler | Small | Section 12 |
| Workers: google_trends, youtube | Phase 0 infra | Medium | D-1 |
| Amazon section: Products, Rankings, Cross-Signal | Amazon workers | High | Section 9.3 |
| Shopify section: Stores, Store Intelligence, Niche Scanner | Shopify workers | High | Section 9.4 |
| Full cross-platform matching engine | All platform workers | High | M-2, D-15 |
| Creator-Product Match Score algorithm | Creator data | Medium | M-3 |
| Product Lifecycle badges (Emerging → Saturated) | Trend scoring + saturation | Medium | MN-1, D-11 |
| Collaborative annotations (team notes) | annotations table | Medium | MN-4 |
| Comparison Mode (2-4 products) | Product detail | Medium | v5 feature |
| Trend history charts (90-day) | trend_scores time-series | Medium | v5 feature |
| Competitor niche map (bubble chart) | Niche aggregation | Medium | v5 feature |
| Saved views + custom filters | saved_views table | Medium | S-6 |
| Bulk actions toolbar | Product list | Medium | S-5 |
| WCAG accessibility pass | All UI | Medium | S-3 |
| Notification preferences | notification_preferences table | Small | S-4 |
| Keyboard shortcuts | UI framework | Small | S-18 |

### Phase 3 — Intelligence Layer + Outreach + Monetisation (Days 46–65)

**Goal**: AI-powered features, creator outreach, and billing live. Revenue-generating.

| Task | Dependency | Complexity | Addresses |
|------|-----------|-----------|-----------|
| Worker: platform_profitability_scorer (Anthropic) | All platform data | High | M-4, Section 12 |
| Workers: facebook_ads, tiktok_ads | Apify | Medium | Section 12 |
| Best Platform Recommender (Row 7) | Platform profitability scorer | Medium | M-4 |
| Creator Outreach Engine (3-email sequence) | Creator data + Resend | High | M-5 |
| Outreach anti-spam compliance | Outreach engine | Small | T-16 |
| Outreach analytics dashboard | outreach_sequences | Medium | M-5 |
| Trend Alerts: email + in-app | Alert configs + Resend | Medium | v5 feature |
| Affiliate Programs discovery | affiliate_programs table | Small | v5 feature |
| Stripe billing: checkout, portal, metering | Stripe | High | Section 14, T-3 |
| Free trial lifecycle (14 day) | Stripe + tenant model | Medium | T-18 |
| Dunning flow (failed payments) | Stripe webhooks | Medium | S-12 |
| Plan upgrade/downgrade proration | Stripe | Medium | S-13 |
| Annual plan option | Stripe | Small | S-14 |
| Data export: CSV, Excel | Products data | Medium | v5 feature |
| Webhook & Zapier integration | webhook_configs table | Medium | v5 feature |
| Niche Intelligence Engine | Niche aggregation data | Medium | MN-2 |
| Daily AI Briefing | All data + Anthropic | Medium | MN-3 |
| Activity log for team admins | api_usage_log | Small | S-10 |
| Data retention visibility (settings page) | Retention policies | Small | S-8 |

### Phase 4 — Agency/Enterprise + Launch Readiness (Days 66–85)

**Goal**: Agency and enterprise features. Production-ready.

| Task | Dependency | Complexity | Addresses |
|------|-----------|-----------|-----------|
| Agency Intelligence Reports (AI-generated PDF) | Anthropic + @react-pdf/renderer | High | M-6 |
| Report scheduling (weekly/monthly) | Reports + Resend | Medium | M-6 |
| Client sharing links (token-based) | Sharing routes | Medium | S-11 |
| Client portal (enterprise) | Sharing + viewer accounts | Medium | S-11 |
| White-label: logo, colours, custom domain | brand_config | Medium | v5 feature |
| Public API: key management, rate limiting, docs | API routes + rate limiting | High | v5 feature |
| Job Scheduler UI: per-worker control, budget sliders | Admin dashboard | Medium | v5 feature |
| Trend Replay section | Historical predictive data | Medium | MN-5 |
| Referral programme | referrals table | Medium | S-15 |
| Changelog / "What's New" | External content | Small | S-17 |
| Mobile responsive optimisation | All UI | Medium | v5 feature |
| Monitoring dashboard (system health) | Health endpoint + logs | Medium | T-9 |
| Disaster recovery runbook | Documentation | Small | T-10 |
| Security audit | All code | Medium | T-11, T-16 |
| Performance testing & optimisation | All systems | Medium | T-6 |
| Launch: custom domain, Stripe live mode, monitoring | All | Medium | — |

### Phase Summary

| Phase | Days | Key Deliverable | Critical Findings Addressed |
|-------|------|----------------|---------------------------|
| 0 | 1–5 | Infrastructure + auth running | T-8, T-9, T-11, T-12 |
| 1 | 6–25 | TikTok MVP + pre-trend + core UX | D-10, D-12, D-15, T-1, T-2, T-14, T-17, S-1, S-2, S-7, S-9, S-16 |
| 2 | 26–45 | All platforms + cross-platform intelligence | D-1, D-11, M-2, M-3, MN-1, MN-4, S-3, S-5, S-6 |
| 3 | 46–65 | AI features + outreach + billing | M-4, M-5, T-3, T-18, S-12, S-13, MN-2, MN-3 |
| 4 | 66–85 | Agency/enterprise + launch | M-6, MN-5, T-10, S-11, S-15 |

---

## Section 18 — Development Guardrails (Updated)

Original 14 guardrails from v5, plus 8 new guardrails from Phase 2/3 findings.

### Original Guardrails (1–14)

| # | Rule | Requirement |
|---|------|------------|
| 1 | No scraping in API routes | API endpoints NEVER scrape. Worker → DB → API reads DB. Always. |
| 2 | No always-on scraping | Workers fire on P0/P1/P2 queue jobs only. Exception: predictive_discovery_worker (documented proactive worker — Section 4.2). |
| 3 | Budget check before every external call | Every worker must call `checkBudget()` before any Apify/RapidAPI/Anthropic/SerpAPI request. No exceptions. |
| 4 | Freshness badge on every data view | Every page and every product card must show 'Last updated: X ago'. No exceptions. Include hex colours from Section 4.5. |
| 5 | Audit before modify | Read every file completely before modifying it. Never overwrite blindly. |
| 6 | No duplicate workers | Check `/system/worker_map.md` before creating any worker. Canonical registry: Section 12.1 (21 workers). |
| 7 | `tenant_id` on all tables | Every data table must include `tenant_id`. Supabase RLS must enforce isolation. Application middleware must also enforce (belt-and-suspenders — Section 6.4). |
| 8 | Update STATUS.json after every task | STATUS.json is the session recovery anchor. See Section 19 for format. |
| 9 | Commit after every task | `git add -A && git commit -m 'feat(phaseX): [task]'` after every completed task. |
| 10 | No .env commits | `.env` and `.env.local` stay in `.gitignore`. Never commit secrets. |
| 11 | Chain parity | TikTok, Amazon, and Shopify product pages must always have identical 7-row chain depth. Row 4 adapts per platform (Section 7). |
| 12 | Predictive engine is always P1 | `predictive_discovery_worker` is the moat. Never downgrade to P2 or skip. |
| 13 | Dead-letter queue required | Failed jobs after 3 retries go to `dead_letter_queue` and trigger admin alert. Never silently drop. |
| 14 | Existing stack only | Do not introduce new infrastructure without explicit instruction from project owner. |

### New Guardrails (15–22) — Added in v6.0

| # | Rule | Requirement | Source Finding |
|---|------|------------|----------------|
| 15 | Handle ALL external API failures | Every worker calling an external API must implement: timeout handling, retry with backoff, circuit breaker, dead-letter on exhaustion. See Section 16.1 for the complete error matrix. Never allow a worker to crash silently. | T-1, T-2 |
| 16 | Validate before write | ALL data entering the database must pass through the Zod validation layer (Section 4.10). Raw data → schema validation → sanitisation → range check → write. Failed validation → quarantine table. | T-8 |
| 17 | Budget fail-safe on Redis failure | If Redis is unreachable and budget cannot be checked, REFUSE the external API call. Never fail-open on budget. Freshness check can fail-open (treat as stale). | T-4 |
| 18 | Rate limit all API routes | All Express routes must pass through rate limiting middleware. Limits defined in Section 6.6. Auth routes: 5/15min per IP. Scrape triggers: 10/min per user. | T-12 |
| 19 | Defence in depth for tenant isolation | RLS is necessary but not sufficient. Application middleware must also check tenant_id on every request. Cross-tenant access attempts must be logged as security events. | T-11 |
| 20 | Anthropic API spend control | All Anthropic calls must check monthly spend cap before executing. Cache AI rationales — regenerate only when inputs change by >5 points. Monthly cap: $500 with circuit breaker at 90%. | T-15 |
| 21 | GDPR-compliant data handling | Creator outreach: publicly listed emails only + unsubscribe link. User deletion: cascade across all 32 tables. Data retention: enforce nightly cleanup per Section 16.7. | T-16 |
| 22 | Canonical worker count is 21 | The worker registry in Section 12.1 is the source of truth. 14 scraping + 5 intelligence + 2 system = 21 total. Do not create new workers without updating Section 12.1 and `/system/worker_map.md`. | D-2 |

---

## Section 19 — Session Continuity Protocol & STATUS.json

### 19.1 — Context Files (read on every session start)

| Order | File | Purpose | Critical? |
|-------|------|---------|-----------|
| 1 | `system/STATUS.json` | Machine-readable state — read FIRST | YES |
| 2 | `system/development_log.md` (tail -50) | Human-readable progress log | YES |
| 3 | `system/system_architecture.md` | Full architecture reference | YES |
| 4 | `system/database_schema.md` | DB structure including tenant_id and RLS | YES |
| 5 | `system/worker_map.md` | All 21 workers: existing vs planned vs triggered-how | YES |
| 6 | `system/ai_logic.md` | Scoring algorithms and Anthropic API usage | YES |
| 7 | `system/scrape_schedule.md` | Current scraping trigger config and budget status | YES |
| 8 | `ai/YOUSELL_MASTER_BUILD_BRIEF_v6.md` | Complete build spec reference | Reference |

### 19.2 — STATUS.json Schema (v6.0)

```json
{
    "last_updated": "2026-03-11T10:00:00Z",
    "schema_version": "6.0",
    "current_phase": 0,
    "current_phase_name": "Infrastructure & Auth",
    "last_completed_task": "description of last completed task",
    "next_task": "description of next task to do",
    "phase_progress": {
        "0": "IN_PROGRESS",
        "1": "NOT_STARTED",
        "2": "NOT_STARTED",
        "3": "NOT_STARTED",
        "4": "NOT_STARTED"
    },
    "workers_implemented": [],
    "tables_migrated": [],
    "routes_implemented": [],
    "blockers": [],
    "infrastructure": {
        "redis_connected": false,
        "bullmq_configured": false,
        "supabase_schema_migrated": false,
        "auth_configured": false,
        "stripe_configured": false,
        "resend_configured": false
    },
    "smart_scraping_implemented": false,
    "auth_implemented": false,
    "billing_implemented": false,
    "notes": "Phase 0 starting. Read YOUSELL_MASTER_BUILD_BRIEF_v6.md for full specs."
}
```

### 19.3 — Session Start Protocol

Every new Claude Code session must execute:

```bash
# 1. Read state
cat system/STATUS.json

# 2. Read recent progress
tail -50 system/development_log.md

# 3. Read architecture
cat system/system_architecture.md

# 4. Read schema
cat system/database_schema.md

# 5. Read worker map
cat system/worker_map.md

# 6. Read AI logic
cat system/ai_logic.md

# 7. Read scrape schedule
cat system/scrape_schedule.md
```

Then print a recovery summary:

```
=== YOUSELL SESSION RECOVERY ===
Phase: [current_phase] — [current_phase_name]
Last completed: [last_completed_task]
Next task: [next_task]
Workers: [X/21] implemented
Tables: [X/32] migrated
Routes: [X/91] implemented
Blockers: [list or "none"]
================================
```

### 19.4 — Task Completion Ritual

After completing any task:

```bash
# 1. Update STATUS.json
# - Set last_completed_task
# - Set next_task
# - Update arrays (workers_implemented, tables_migrated, etc.)
# - Update phase_progress if phase changed

# 2. Append to development log
echo "[$(date)] feat(phase${PHASE}): ${TASK_DESCRIPTION}" >> system/development_log.md

# 3. Commit
git add -A && git commit -m "feat(phase${PHASE}): ${TASK_DESCRIPTION}"
```

---

## Section 20 — Claude Code Master Execution Prompt v6.0

This prompt is **completely self-contained**. When pasted cold into Claude Code with no other context, it provides enough information to start or resume development.

---

```
You are building the YOUSELL Intelligence Platform — a multi-tenant SaaS that provides cross-platform ecommerce product intelligence across TikTok, Amazon, and Shopify.

## What You're Building

A platform that replaces 5+ tools (FastMoss, JungleScout, PPSPY, Minea, Helium 10) with:
- Cross-platform product discovery + AI-powered scoring
- Pre-trend predictive engine (detects products 3-7 days before viral breakout)
- Creator-product matching + automated outreach
- Agency intelligence reports
- Product lifecycle prediction

## Tech Stack

- Frontend: Next.js 14 (App Router) + Tailwind + shadcn/ui → Netlify (frontend only)
- Backend: Node.js + Express → Railway (ALL API routes, workers, Redis)
- Database: Supabase PostgreSQL (32 tables + 1 MV, RLS on all)
- Queue: Redis + BullMQ (P0/P1/P2 priority lanes)
- Auth: Supabase Auth (JWT, 15-min expiry)
- Scraping: Apify Actors + RapidAPI + SerpAPI + YouTube API
- AI: Anthropic API (claude-sonnet-4-6)
- Email: Resend
- Billing: Stripe
- Workers: 21 total (14 scraping + 5 intelligence + 2 system)

## Architecture

Smart Scraping = DEMAND-DRIVEN (never always-on):
1. User clicks → P0 scrape if data stale (>3h)
2. Alert breach → P1 targeted scrape
3. Idle 3h → P2 one-platform refresh (rotation)
Exception: predictive_discovery_worker runs every 2h (proactive, documented exception)

Data flow: User Action → API → Redis freshness check → BullMQ job → Worker → checkBudget() → External API → Zod validation → raw_listings → Transform → products table → Scoring → Supabase Realtime → UI update

Every product shows 7-row intelligence chain (identical across all platforms):
Row 1: Identity | Row 2: Stats | Row 3: Influencers | Row 4: Marketplace Presence | Row 5: Other Channels | Row 6: Videos & Ads | Row 7: Best Platform Recommendation

## Session Start Protocol

Run these 7 commands first:
1. cat system/STATUS.json
2. tail -50 system/development_log.md
3. cat system/system_architecture.md
4. cat system/database_schema.md
5. cat system/worker_map.md
6. cat system/ai_logic.md
7. cat system/scrape_schedule.md

Print recovery summary, then continue with next_task from STATUS.json.

## Immutable Rules

1. API routes NEVER scrape. Workers scrape → DB → API reads DB.
2. No always-on scraping. Workers fire via BullMQ only. Exception: predictive engine.
3. checkBudget() before EVERY external API call. No exceptions.
4. Freshness badge on EVERY data view. No exceptions.
5. tenant_id on ALL tables. RLS + middleware enforcement.
6. Validate ALL data (Zod) before DB write. Failed → quarantine table.
7. Handle ALL external API failures: timeout → retry → circuit breaker → dead_letter.
8. Redis budget check fail → REFUSE call (never fail-open).
9. Rate limit ALL API routes.
10. Predictive engine is ALWAYS P1. Never downgrade.
11. Dead-letter failed jobs. Never silently drop.
12. Chain parity: all platforms show identical 7-row depth.
13. Update STATUS.json after every task. Commit after every task.
14. 21 workers canonical. Check worker_map.md before creating new ones.
15. No .env commits. No new infrastructure without explicit permission.

## Current Development Phases

Phase 0 (Days 1-5): Infrastructure + Auth
Phase 1 (Days 6-25): TikTok MVP + Predictive Engine + Core UX
Phase 2 (Days 26-45): Amazon + Shopify + Cross-Platform Graph
Phase 3 (Days 46-65): AI Features + Outreach + Billing
Phase 4 (Days 66-85): Agency/Enterprise + Launch

## Full Spec Reference

For detailed specs (DB schema, worker details, API routes, algorithms, error handling):
→ Read: ai/YOUSELL_MASTER_BUILD_BRIEF_v6.md

## API Keys Available

ANTHROPIC_API_KEY, APIFY_API_TOKEN, RAPIDAPI_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, REDIS_URL, RESEND_API_KEY, AMAZON_PA_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

Still needed: SERPAPI_KEY, REDDIT_CLIENT_ID/SECRET, YOUTUBE_API_KEY

## Execution Loop

1. Run session start protocol (7 reads)
2. Print recovery summary
3. Execute next_task from STATUS.json
4. After task: update STATUS.json + development_log.md + git commit
5. Repeat step 3
```

---

## Appendix A — Final QA Summary

### Fixes Applied

| Category | Count | Details |
|----------|-------|---------|
| Discrepancies fixed | 15 | D-1 through D-15. 4 CRITICAL (ghost workers, scoring model conflict, inverted refresh logic, queue architecture mismatch). All resolved. |
| Technical gaps addressed | 24 | T-1 through T-24. 4 CRITICAL (no API error handling, no Stripe webhooks, Redis SPOF, no rate limiting). All resolved. |
| Missing SaaS features added | 18 | S-1 through S-18. 4 P0 launch blockers (onboarding, help, team invitations, dunning). All resolved. |
| Moat improvements made | 6 | M-1 through M-6. All 6 existing moats improved with concrete specs. |
| New moat features added | 5 | MN-1 through MN-5. Product Lifecycle, Niche Intelligence, AI Daily Briefing, Collaborative Intelligence, Trend Replay. |

**Total findings resolved: 68**

### What v6.0 Adds Over v5.0

| Metric | v5.0 | v6.0 |
|--------|------|------|
| Workers defined | 18 (2 missing) | 21 (all specified with I/O) |
| Database tables | ~19 (incomplete) | 32 + 1 MV (full SQL DDL) |
| API routes defined | 0 (none existed) | 91 endpoints |
| Scoring algorithms | 4 (saturation undefined) | 5 + 1 composite (all with formulas) |
| Error handling | None | Complete matrix for 6 external dependencies |
| Guardrails | 14 | 22 |
| SaaS features | Partial | 18 additional features with implementation specs |
| Moat features | 6 (vague) | 6 improved + 5 new = 11 total |

### Confidence Assessment

**Overall readiness: HIGH**

This v6.0 brief is the most complete specification document the YouSell project has had. Every system component is defined with enough detail for a developer to implement without guessing:

- Every table has full SQL DDL with indexes and constraints
- Every worker has trigger, queue, budget, I/O tables, and failure handling
- Every API route has method, path, auth, plan gate, and trigger behaviour
- Every algorithm has a formula with defined inputs, sources, and fallbacks
- Every external dependency has an error handling matrix

### Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Apify actor deprecation | Medium | Monitor Apify notifications. Maintain list of backup actors per worker. Test actors monthly. |
| Anthropic API cost at scale | Medium | Per-feature budgets defined. Caching strategy in place. Monthly cap with circuit breaker. Monitor closely during first 3 months. |
| Supabase as single provider | Medium | No practical failover for DB/Auth/Realtime. Accept vendor risk. Maintain automated backups. Consider multi-cloud at Enterprise scale. |
| Cross-platform matching accuracy | Medium | v1 uses title similarity + UPC. Accuracy may be low. Plan for manual confirmation UI and iterative improvement of matching algorithm. |
| Search performance at scale | Low | tsvector + GIN indexes should handle 100K products. Typesense fallback planned if needed. Monitor p95 search latency. |
| GDPR compliance completeness | Low | Core data handling defined. Legal review of Terms/Privacy Policy still required before launch. DPA template needed for Enterprise. |

### CLAUDE.md Update Required

After v6.0 is adopted as the canonical specification, `CLAUDE.md` must be updated to:
1. Replace the 3-pillar scoring model with the v6.0 5-algorithm system (Section 10)
2. Replace functional queue names (scan_jobs, transform_jobs) with priority queues (P0/P1/P2)
3. Update data sources from 4 platforms to 8 platforms
4. Add `raw_listings` to the database schema section
5. Update worker count from "18" references to 21

---

**END OF DOCUMENT**

*YOUSELL Intelligence Platform — Master Build Brief v6.0*
*Produced by Senior Architect QA Review — 2026-03-11*
