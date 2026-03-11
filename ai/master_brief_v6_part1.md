# YOUSELL MASTER BUILD BRIEF v6.0 — Part 1 (Sections 1–10)

> **Version**: 6.0
> **Date**: 2026-03-11
> **Source**: v5.0 brief + Phase 2 findings (39 issues) + Phase 3 findings (18 missing features, 6 moat reviews, 5 new moat opportunities)
> **Convention**: `✓ FIXED: [finding ID]` = issue from Phase 2/3 resolved. `★ NEW` = feature added in v6.0.

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
<!-- Section 10: Algorithms — PENDING -->
