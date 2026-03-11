# YOUSELL Development Roadmap — Micro-Task Sessions

> **Purpose**: Breaks the 5 development phases into the **smallest possible** coding sessions.
> Each session has **3–4 tasks max** — focused, achievable, no overwhelm.
> **Total**: 5 phases → 42 micro-sessions

---

## Phase 0 — Infrastructure & Auth (5 sessions)

### 0.1 — Database Tables (Core)
- [ ] Supabase schema migration: tenants, users, invitations tables (Section 11.1)
- [ ] Supabase schema migration: products, creators, videos tables (Section 11.2)
- [ ] Supabase schema migration: shops, ads tables (Section 11.2)
**Deliverable**: Core tables created.

### 0.2 — Database Tables (Scoring + Activity + System)
- [ ] Scoring tables: trend_scores, platform_scores, product_platform_matches, creator_product_links, predictive_signals, niches (Section 11.3)
- [ ] Activity tables: alert_configs, saved_collections, product_user_status, saved_views, annotations (Section 11.4)
- [ ] Notification + outreach tables: notifications, notification_preferences, outreach_sequences, outreach_optouts (Section 11.5)
- [ ] System tables: raw_listings, data_quarantine, scrape_log, scrape_schedule, api_usage_log, webhook_configs, referrals, processed_webhooks (Section 11.6–11.7)
**Deliverable**: All 32 tables created.

### 0.3 — Database Config (Indexes + RLS + MV)
- [ ] Apply all indexes from Section 11 (search vectors, composite indexes)
- [ ] Apply RLS policies: tenant isolation, admin-only, user-scoped (Section 11.9)
- [ ] Create materialised view `dashboard_cards_mv` with unique index (Section 11.8)
- [ ] Create `/system/` context files + STATUS.json (Section 19)
**Deliverable**: Database fully configured. Context files ready.

### 0.4 — Redis + BullMQ + Express Scaffold
- [ ] Set up Redis on Railway
- [ ] Configure BullMQ: P0_queue, P1_queue, P2_queue, dead_letter_queue (Section 4.6)
- [ ] Express backend scaffold: project structure, middleware chain, error handler
- [ ] Health check endpoint: `/api/health` checking DB, Redis, BullMQ (Section 16.3)
**Deliverable**: Backend running. Health endpoint live.

### 0.5 — Auth + Security Middleware
- [ ] Supabase Auth config: email/password, Google OAuth, magic links (Section 6.4)
- [ ] JWT middleware: verify token, extract tenant_id + user_id + role, 15-min expiry (Section 6.4)
- [ ] Tenant enforcement middleware + security event logging (Section 6.4)
- [ ] Auth routes: POST signup, login, magic-link, logout, refresh; GET me (Section 13.1)
**Deliverable**: Users can register and authenticate. JWT on all routes.

---

## Phase 0.5 — Core Utilities (3 sessions)

### 0.6 — Data Validation + Sanitisation
- [ ] Zod schemas for each data type: products, creators, videos, shops, ads (Section 4.10)
- [ ] Data sanitisation: HTML strip, currency normalise to USD, unicode normalise (Section 4.10)
- [ ] Range checks: prices 0–100K, scores 0–100, dates not future (Section 4.10)
- [ ] Quarantine table write utility for failed records (Section 4.10)
**Deliverable**: All data entering DB is validated and sanitised.

### 0.7 — Budget + Freshness + Rate Limiting
- [ ] Budget check utility: `checkBudget(workerName)` with Redis counters (Section 4.7)
- [ ] Freshness check utility: read Redis key, return age + badge (Section 4.5)
- [ ] API rate limiting middleware: Redis-backed, per Section 6.6 limits
**Deliverable**: Budget enforcement, freshness tracking, rate limiting all working.

### 0.8 — Circuit Breaker + Worker Base Class
- [ ] Circuit breaker class: 5 failures/5 min → open, 15 min cooldown (Section 16.2)
- [ ] Worker execution template: base class with 12-step pipeline (Section 12.2)
- [ ] Scrape log writing utility
- [ ] Downstream worker trigger utility (Section 12.4)
**Deliverable**: All shared utilities ready. Workers can be plugged in.

---

## Phase 1 — TikTok MVP (12 sessions)

### 1.1 — Smart Scraping Engine
- [ ] On-demand scraping flow: API checks freshness → enqueue if stale (Section 4.3)
- [ ] Job deduplication: deterministic BullMQ job IDs (Section 4.6)
- [ ] Job priority promotion: higher P0 promotes existing P2 (Section 4.6)
**Deliverable**: Smart scraping trigger system ready.

### 1.2 — Idle Refresh + Freshness Badges
- [ ] Idle 3-hour background refresh scheduler: 15-min check, rotate platforms (Section 4.4)
- [ ] Freshness badge component: LIVE/RECENT/STALE/OUTDATED/UPDATING with hex colours (Section 4.5)
- [ ] Freshness badge integration on API responses (include freshness data in every response)
**Deliverable**: Background refresh running. Badges rendering.

### 1.3 — TikTok Workers (Discovery + Hashtag)
- [ ] `tiktok_discovery_worker`: Apify/RapidAPI → products + shops (Section 12)
- [ ] `hashtag_scanner_worker`: fires with discovery → tag enrichment (Section 12)
- [ ] Error handling: Apify timeout, 429, 5xx, empty dataset (Section 16.1)
**Deliverable**: TikTok product discovery flowing into DB.

### 1.4 — TikTok Workers (Creator + Video)
- [ ] `creator_monitor_worker`: Apify → creators + creator_product_links (Section 12)
- [ ] `video_scraper_worker`: Apify → videos table (Section 12)
- [ ] Raw data pipeline: API → Zod → sanitise → raw_listings → transform → target table
**Deliverable**: Creator and video data flowing into DB.

### 1.5 — Intelligence Workers
- [ ] `product_extractor_worker`: normalise raw_listings → products (Section 12)
- [ ] `trend_scoring_worker`: compute trend_score + saturation_score + lifecycle_stage (Section 10.2–10.4)
- [ ] Worker dependency chain: scrape complete → extract → score (Section 12.3)
**Deliverable**: Products scored with trend + saturation + lifecycle.

### 1.6 — Cross-Platform Match + Predictive Foundation
- [ ] `cross_platform_match_worker` foundation: title similarity matching (Section 3.2, Moat 2)
- [ ] `predictive_discovery_worker`: 2h scheduler, P1 priority (Section 3, Moat 1)
- [ ] Predictive score algorithm: 4 input variables + cold-start handling (Section 10.3)
**Deliverable**: Basic matching + predictive engine running.

### 1.7 — Anthropic Integration
- [ ] Anthropic API client with budget enforcement + monthly spend cap (Section 4.7, T-15)
- [ ] Predictive batch classification: up to 50 products per call (Section 3.2, Moat 1)
- [ ] Pre-trend alert: fire P1 notification when predictive_score > 65 AND product_age < 7d
**Deliverable**: AI-powered pre-trend detection live.

### 1.8 — Home Dashboard (Layout + Data)
- [ ] Dashboard layout: header, stats bar, filter tabs (Section 8.1)
- [ ] MV query with tenant filtering: GET /api/dashboard/cards (Section 8.3)
- [ ] `dashboard_refresh_worker`: REFRESH MATERIALIZED VIEW CONCURRENTLY (Section 8.3)
- [ ] Redis-cached per-tenant cards for <50ms reads
**Deliverable**: Dashboard showing real data from MV.

### 1.9 — Home Dashboard (UX)
- [ ] Product card component with condensed 7-row chain + action buttons (Section 8.1)
- [ ] Skeleton loading states: product cards, stats bar, creator lists (Section 8.5)
- [ ] Empty states: first scrape running, few products, new tenant (Section 8.5)
- [ ] Data freshness badges on every card (Section 4.5)
**Deliverable**: Dashboard feels polished with loading/empty states.

### 1.10 — TikTok Section Pages (Part 1)
- [ ] TikTok Products page: table + filters + sort + on-demand scrape (Section 9.2)
- [ ] TikTok Creators page: table + filters + match score display (Section 9.2)
- [ ] TikTok Videos page: grid layout + engagement stats (Section 9.2)
**Deliverable**: 3 of 6 TikTok pages live.

### 1.11 — TikTok Section Pages (Part 2) + Realtime
- [ ] TikTok Shops page + TikTok Live page + TikTok Ads page (Section 9.2)
- [ ] Supabase Realtime integration: channel per tenant, minimal broadcast (Section 8.4)
- [ ] Live data push: stale pages update automatically when scrape completes
**Deliverable**: All 6 TikTok pages live with Realtime updates.

### 1.12 — Product Detail + Core Features
- [ ] Product detail page: 7-row chain with per-row freshness + on-demand scrape (Section 7)
- [ ] Global search (Cmd+K): tsvector query, grouped results, 300ms debounce (Section 8.6)
- [ ] Notification centre: bell icon + unread count + in-app list (Section 8.7)
- [ ] Contextual tooltips on all scores/badges (Section 8.14)
**Deliverable**: Product detail and search working.

### 1.13 — Onboarding + Team
- [ ] Onboarding flow: 5-step wizard, platform preferences, first scrape trigger (Section 6.7)
- [ ] Onboarding checklist: persistent sidebar, 3 tasks, dismissible (Section 6.7)
- [ ] Product archiving / dismissal + filter tabs (Section 8.9)
- [ ] Basic team invitations: invite page + accept flow + seat limits (Section 6.3)
**Deliverable**: Complete TikTok MVP. Usable by beta users.

---

## Phase 2 — Amazon + Shopify (8 sessions)

### 2.1 — Amazon Workers
- [ ] `amazon_bsr_scanner_worker`: Amazon PA API → products + trend_scores (Section 12)
- [ ] `amazon_tiktok_match_worker`: cross-match TikTok ↔ Amazon products (Section 12)
- [ ] Plan gating middleware: Amazon requires Pro+ (Section 14.1)
**Deliverable**: Amazon data flowing into DB.

### 2.2 — Amazon Pages
- [ ] Amazon Products page: BSR, price, reviews, est. sales + filters (Section 9.3)
- [ ] Amazon Rankings page: BSR movement charts (Section 9.3)
- [ ] Amazon vs TikTok Cross-Signal page (Section 9.3)
**Deliverable**: Amazon section fully operational.

### 2.3 — Shopify Workers
- [ ] `shopify_store_discovery_worker`: Apify → shops + products (Section 12)
- [ ] `shopify_growth_monitor_worker`: Apify → revenue, traffic updates (Section 12)
- [ ] Plan gating: Shopify requires Agency+ (Section 14.1)
**Deliverable**: Shopify data flowing into DB.

### 2.4 — Shopify Pages
- [ ] Shopify Stores page: discovery + filters (Section 9.4)
- [ ] Store Intelligence page: deep dive on store click (Section 9.4)
- [ ] Niche Scanner page: niche-level aggregation (Section 9.4)
**Deliverable**: Shopify section fully operational.

### 2.5 — Supplementary Workers
- [ ] `google_trends_worker`: SerpAPI → search volume (Section 12)
- [ ] `youtube_worker`: YouTube Data API → review videos (Section 12)
- [ ] `reddit_trend_worker` + `pinterest_trend_worker`: P2 idle only (Section 12)
**Deliverable**: All 14 scraping workers operational.

### 2.6 — Cross-Platform Intelligence
- [ ] Full matching engine: UPC/GTIN + title similarity + manual confirm UI (Section 3.2, Moat 2)
- [ ] Creator-Product Match Score algorithm (Section 10.5)
- [ ] Overall Score composite formula (Section 10.7)
**Deliverable**: Cross-platform graph + match scoring live.

### 2.7 — Lifecycle + Annotations
- [ ] Product Lifecycle badges: Emerging → Saturated (Section 3.3, MN-1)
- [ ] Collaborative annotations: notes on products/creators/collections (Section 3.3, MN-4)
- [ ] Comparison Mode: select 2-4 products, side-by-side (v5 feature)
- [ ] Trend history charts: 30/60/90 day (v5 feature)
**Deliverable**: Advanced intelligence features live.

### 2.8 — UI Polish
- [ ] Saved views + custom filters: save/load/share/default (Section 8.10)
- [ ] Bulk actions toolbar: save, alert, export, compare, archive, dismiss (Section 8.8)
- [ ] Notification preferences page (Section 8.7)
- [ ] Keyboard shortcuts: J/K, S, A, R, /, Esc, Cmd+? (Section 8.12)
**Deliverable**: Dashboard feels production-grade.

---

## Phase 3 — AI + Outreach + Billing (8 sessions)

### 3.1 — Platform Profitability Scorer
- [ ] `platform_profitability_scorer` worker: Anthropic API (Section 10.6)
- [ ] Best Platform Recommender UI: Row 7 with ranked platforms (Section 7)
- [ ] AI rationale caching: regenerate only when inputs change >5 points
**Deliverable**: "Where should I sell this?" answered by AI.

### 3.2 — Niche Intelligence + Daily Briefing
- [ ] Niche Intelligence Engine: niches table aggregation (Section 3.3, MN-2)
- [ ] Niche Intelligence page: leaderboard, lifecycle badges, cross-platform comparison
- [ ] Daily AI Briefing: `daily_briefing_worker` (1/tenant/day) + dashboard card (Section 3.3, MN-3)
**Deliverable**: Niche-level intelligence + daily AI digest.

### 3.3 — Ad Workers + Outreach Engine
- [ ] `facebook_ads_worker` + `tiktok_ads_worker` (Section 12)
- [ ] Creator Outreach: AI email generation via Anthropic prompt (Section 3.2, Moat 5)
- [ ] 3-email sequence logic: Day 0 pitch, Day 3 follow-up, Day 7 final (Section 3.2, Moat 5)
**Deliverable**: Outreach emails generated and sequenced.

### 3.4 — Outreach Delivery + Compliance
- [ ] Resend integration: send emails + webhook tracking (Section 3.2, Moat 5)
- [ ] Anti-spam: unsubscribe links, opt-out table, 50/tenant/day limit (Section 3.2, Moat 5)
- [ ] Outreach analytics dashboard: open rate, reply rate, conversion (Section 3.2, Moat 5)
**Deliverable**: Creator outreach fully operational with compliance.

### 3.5 — Stripe Setup + Checkout
- [ ] Stripe Products + Prices: 4 plans × 2 billing cycles (Section 14.3)
- [ ] Checkout flow: Stripe Checkout Session → redirect (Section 14.3)
- [ ] Customer Portal: plan changes, payment method, invoices (Section 14.3)
**Deliverable**: Users can subscribe and manage billing.

### 3.6 — Stripe Webhooks + Usage Metering
- [ ] Webhook handler: signature verification + idempotency (Section 14.4)
- [ ] Handle: checkout.completed, payment succeeded/failed, subscription updated/deleted
- [ ] Usage metering middleware: enforce plan limits before operations (Section 14.3)
**Deliverable**: Billing backend fully wired.

### 3.7 — Trial + Dunning + Plans
- [ ] Free trial lifecycle: 14 days Pro, email reminders at day 7/12/14/21 (Section 14.5)
- [ ] Dunning flow: past_due → grace → restricted → locked → archived (Section 14.6)
- [ ] Upgrade/downgrade logic with impact summary warning (Section 14.7)
- [ ] Plan-locked UI states: lock icon + upgrade CTA (Section 8.5)
**Deliverable**: Complete billing lifecycle. Revenue-ready.

### 3.8 — Alerts + Export + Housekeeping
- [ ] Trend alerts: CRUD + email/in-app delivery via Resend (Section 8.7, 13.7)
- [ ] Data export: CSV + Excel download (Section 13.11)
- [ ] Webhook integration: CRUD + HMAC delivery (Section 13.14)
- [ ] Nightly cleanup job: delete old logs, trend_scores, notifications (Section 16.7)
**Deliverable**: Alerts, exports, and housekeeping operational.

---

## Phase 4 — Agency/Enterprise + Launch (6 sessions)

### 4.1 — Agency Reports (Generation)
- [ ] Report template: 6-section structure (Section 3.2, Moat 6)
- [ ] AI narrative generation: Anthropic prompt per section (Section 3.2, Moat 6)
- [ ] PDF generation with @react-pdf/renderer (Section 3.2, Moat 6)
**Deliverable**: Reports can be generated on demand.

### 4.2 — Agency Reports (Branding + Scheduling)
- [ ] Agency branding: logo + colours in PDF from brand_config (Section 3.2, Moat 6)
- [ ] Report scheduling: weekly/monthly auto-generation + email delivery
- [ ] Report history page + download route (Section 13.11)
**Deliverable**: Agency report feature complete.

### 4.3 — Client Sharing + White-Label
- [ ] Shareable read-only links: token-based, configurable expiry (Section 6.12)
- [ ] Client portal: sub-accounts with viewer role (Section 6.12)
- [ ] White-label: logo, colours, custom domain from brand_config (Section 6.1)
**Deliverable**: Agency/Enterprise sharing and branding complete.

### 4.4 — Public API + Admin Tools
- [ ] Public API: key management, per-plan rate limiting, docs (Section 13.14, 6.6)
- [ ] Monitoring dashboard: queue depth, worker status, budget bars (Section 5.3)
- [ ] Activity log for team admins + system health page (Section 8.15, 5.3)
**Deliverable**: Enterprise API live. Admin visibility.

### 4.5 — Engagement Features
- [ ] Trend Replay: "What YouSell Caught" — historical proof-of-value (Section 3.3, MN-5)
- [ ] Referral programme: codes, tracking, 1-month reward (Section 6.8)
- [ ] Changelog / "What's New" modal (Section 8.13)
- [ ] WCAG accessibility final pass (Section 8.11)
**Deliverable**: Retention features complete.

### 4.6 — Launch Readiness
- [ ] Security audit: RLS, JWT, rate limits, XSS review
- [ ] Performance testing: MV <300ms, API p95 <3s, search <500ms
- [ ] Mobile responsive optimisation pass
- [ ] Stripe live mode + custom domain + monitoring alerts configured
**Deliverable**: Production-ready. Go live.

---

## Summary

| Phase | Sessions | Focus |
|-------|----------|-------|
| 0 — Infrastructure | 5 | DB, Redis, Auth, Security |
| 0.5 — Utilities | 3 | Validation, Budget, Worker base |
| 1 — TikTok MVP | 13 | Scraping, Workers, Dashboard, Pages |
| 2 — Amazon + Shopify | 8 | Platform workers, Pages, Intelligence |
| 3 — AI + Billing | 8 | Anthropic, Outreach, Stripe, Alerts |
| 4 — Launch | 6 | Reports, Sharing, API, Polish |
| **TOTAL** | **43 micro-sessions** | **3–4 tasks each** |

Each session: **3–4 tasks max**. No overwhelm. Clear deliverable.
