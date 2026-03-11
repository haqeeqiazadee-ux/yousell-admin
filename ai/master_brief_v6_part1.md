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
<!-- Section 3: Competitive Moat — PENDING -->
<!-- Section 4: Smart Scraping — PENDING -->
<!-- Section 5: Tech Stack — PENDING -->
<!-- Section 6: Auth & Compliance — PENDING -->
<!-- Section 7: Intelligence Chain — PENDING -->
<!-- Section 8: Home Dashboard — PENDING -->
<!-- Section 9: Platform Sections — PENDING -->
<!-- Section 10: Algorithms — PENDING -->
