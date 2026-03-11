# YouSell Master Build Brief v5.0 — Structured Summary

> **Purpose**: This is the exhaustive reference for all subsequent QA phases.
> Every detail from the PDF is captured here so later phases never need to re-read the original.

---

## 1. Platform Vision & Goals

YouSell Intelligence Platform is a **multi-tenant, white-label SaaS** that gives ecommerce operators a single intelligence layer across TikTok, Amazon, and Shopify — with a **predictive engine that surfaces product opportunities 3–7 days before the market catches on**. It replaces the need for multiple tools (FastMoss, JungleScout, PPSPY, Minea, Helium 10) by offering cross-platform intelligence, AI-powered scoring, creator outreach automation, and agency-grade reporting. Primary users are ecommerce operators, agencies, and analysts. Revenue model is subscription-based with 4 tiers (Starter $49/mo → Enterprise custom).

---

## 2. Tech Stack (Complete)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) → Netlify | Dashboard UI, server components for fast initial load |
| Realtime UI Updates | Supabase Realtime (WebSockets) | Push fresh scraped data to page without reload |
| Backend API | Node.js (Express) → Railway | Read-only data API + job queue trigger endpoints |
| Background Workers | Node.js Worker Processes → Railway | 18 scraping + intelligence workers |
| Database | Supabase (PostgreSQL) | Primary data store, RLS for multi-tenancy |
| Materialised Views | Supabase (PostgreSQL) | `dashboard_cards_mv` — pre-computed home page data |
| Job Queue | Redis + BullMQ → Railway | Priority job queues: P0/P1/P2 priority lanes |
| Cache + Budget Tracking | Redis → Railway | Data freshness timestamps, API budget counters |
| Auth | Supabase Auth | Email, Google OAuth, magic links, JWT on all routes |
| Email | Resend | Trend alerts, creator outreach sequences, onboarding |
| Scraping — Primary | Apify Actors | TikTok, Shopify, Facebook Ads, headless browser |
| Scraping — Secondary | RapidAPI | TikTok data, creator profiles, Amazon data |
| Scraping — Self-built | Custom Node.js scrapers | Shopify /products.json, Amazon public pages (free tier) |
| AI Analysis | Anthropic API (claude-sonnet) | Platform recommendations, trend summaries, outreach copy |
| Billing | Stripe | Subscription plans, usage metering, invoicing |
| Version Control | GitHub | haqeeqiazadee-ux/yousell-admin |
| Monitoring | Uptime monitoring + Railway logs | Worker health, queue depth, error rates |

---

## 3. Architecture Flow

```
User Action (click section / click product / click Refresh)
    ↓
Frontend calls API: GET /api/{platform}/{resource}?trigger={view|click}
    ↓
API checks Redis freshness key: data_freshness:{platform}:{resource}
    ↓
IF data age < 3 hours → return cached DB data immediately
IF data age ≥ 3 hours → return stale data + staleness badge
                      → enqueue scrape job on appropriate priority queue
    ↓
BullMQ dispatches job to worker (P0/P1/P2 lane)
    ↓
Worker calls checkBudget() → if budget OK → calls external API (Apify/RapidAPI/Anthropic)
    ↓
Raw data → raw_listings table → Transformation → products/creators/videos/etc. tables
    ↓
Scoring Engine runs (trend_score, predictive_score, match_score, platform_score)
    ↓
Supabase Realtime pushes fresh data to frontend via WebSockets
    ↓
UI updates live: stale rows replaced, freshness badge updated
```

**Home Dashboard** loads from `dashboard_cards_mv` materialised view (pre-computed every 3h or on-demand). Target: <300ms cold load, <100ms cached.

---

## 4. Smart Scraping Rules

### 4.1 — Three Scraping Triggers

| Trigger | When It Fires | Priority | Cost Impact |
|---------|--------------|----------|-------------|
| 1. User Click (On-Demand) | User opens a section, clicks a product, or clicks Refresh button | Immediate — P0 | Minimal: only what user viewed |
| 2. Idle Background Refresh | No user has clicked anything in the last 3 hours | Low priority — P2 | Controlled: one platform per cycle |
| 3. Alert Threshold Breach | A product's trend score crosses a configured alert threshold | Immediate — P1 | Targeted: only the triggered product |

### 4.2 — On-Demand Scraping Flow

```
User opens section → Frontend calls GET /api/{platform}/products?trigger=view
→ API checks Redis: data_freshness:{platform}:products
→ IF age < 3h: return cached DB data
→ IF age ≥ 3h: enqueue SCRAPE job (P0), return stale data + badge
→ Worker runs in background
→ Supabase Realtime pushes fresh data to page when done
→ Page shows: 'Last updated: 2h 47m ago' or 'Updating now...' spinner
```

When user clicks a product card:
```
→ Frontend calls GET /api/products/:id?trigger=click
→ API checks freshness of ALL 7 chain rows for this product
→ Each stale row → enqueue targeted scrape job for that row only
→ Fresh rows → return from DB immediately
→ Page renders with mix of fresh + stale data
→ Stale rows show [Updating...] spinner
→ Supabase Realtime updates each row as workers complete
```

### 4.3 — Idle Background Refresh (3-Hour Cycle)

```
Scheduler runs every 15 minutes, checks if refresh is due:
IF last_user_activity > 3 hours ago:
    SELECT platform FROM scrape_schedule ORDER BY last_scraped_at ASC LIMIT 1
    → Enqueue ONE platform refresh job at LOW priority (P2)
    → Log to scrape_log: { platform, trigger: 'idle_3h', cost_estimate }
```

- Rotation order: TikTok → Amazon → Shopify → Reddit → Pinterest → repeat
- Each idle refresh scrapes only **top-50 products** per platform (not full catalogue)
- Max data staleness: 3h × 5 platforms = 15h without a refresh (in practice, user clicks refresh much sooner)

### 4.4 — Data Freshness System

| Age | Badge | Colour | User Action Available |
|-----|-------|--------|----------------------|
| < 3 hours | LIVE | Green | None needed |
| 3–6 hours | RECENT | Blue | Optional: click Refresh |
| 6–24 hours | STALE | Amber/Yellow | Refresh recommended |
| > 24 hours | OUTDATED | Red | Refresh required badge shown |
| Refreshing now | UPDATING | Pulsing blue | Spinner shown, data loads live via Realtime |

### 4.5 — Cost Budget System

Every worker has a configurable daily API call budget enforced via Redis:

```typescript
async function checkBudget(workerName: string): Promise<boolean> {
    const key = `budget:${workerName}:${today()}`
    const used = await redis.get(key) || 0
    const limit = WORKER_BUDGETS[workerName]
    if (used >= limit) {
        await sendAlert(`Worker ${workerName} hit daily budget limit`)
        return false // worker pauses, logs to dead_letter_queue
    }
    await redis.incr(key)
    await redis.expire(key, 86400) // reset daily
    return true
}
```

**Worker Daily Budgets** (configurable in Job Scheduler UI):

| Worker | Daily Budget | API |
|--------|-------------|-----|
| tiktok_discovery_worker | 500 calls/day (~$2.50 Apify est.) | Apify / RapidAPI |
| video_scraper_worker | 300 calls/day | Apify |
| creator_monitor_worker | 200 calls/day | Apify |
| amazon_bsr_scanner_worker | 150 calls/day | Amazon PA API |
| shopify_store_discovery | 100 calls/day | Apify |
| facebook_ads_worker | 200 calls/day | Apify |

### 4.6 — Three-Queue Architecture

| Queue | Priority | Concurrency | Max Wait Target |
|-------|----------|-------------|-----------------|
| P0_queue | priority: 10 | 5 workers simultaneously | < 30 seconds |
| P1_queue | priority: 5 | 3 workers simultaneously | < 2 minutes |
| P2_queue | priority: 1 | 1 worker at a time | Can take hours |
| dead_letter_queue | — | — | Failed jobs after 3 retries. Logged + admin alerted. Never silently dropped. |

---

## 5. Universal Product Intelligence Chain (7 Rows)

Every product on every platform shows this identical 7-row chain. Chain parity across TikTok, Amazon, and Shopify is a **non-negotiable requirement**.

### Row 1 — Product Identity
- Image, Title, Category, Product type (physical/digital/SaaS/AI)
- Source platform badge, Trend badge (🔥 Trending / 🔮 Pre-Trend)
- First detected date, Price range, Data freshness badge

### Row 2 — Product Stats
- Trend Score (0-100), Predictive Score, Saturation Score
- Est. monthly sales (units), Est. monthly revenue ($)
- Price history chart, Review count & velocity, Search volume trend
- 7d / 30d / 90d momentum graphs, Platform breakdown bar

### Row 3 — Related Influencers (ranked by Creator-Product Match Score)
- Avatar, Username, Platform, Followers, Engagement rate
- Niche alignment %, Est. sales generated, Videos made, Match Score
- Outreach button (generates email copy via Anthropic, sends via Resend)

### Row 4 — TikTok Shops (selling this product, with full marketing stats)
- Shop name, Logo, TikTok followers, Est. GMV/month
- Units sold, Active creator count, Ads running, Growth rate %
- Commission rate (if TikTok affiliate programme available)

### Row 5 — Other Sales Channels (every platform selling this product)
- Amazon → ASIN, BSR rank, Price, Reviews, Est. monthly sales
- Shopify → Store URL, Traffic estimate, Revenue, Ad signal
- eBay → Price, Units sold, Seller rating, Listing age
- YouTube → Channel, Views, Affiliate link detected, Sub count
- Pinterest → Board saves, Traffic signal, Pin velocity

### Row 6 — Viral Videos & Ads
- Thumbnail, Platform, Creator, Views, Likes, Shares, Comments
- Engagement velocity, Organic vs Ad classification
- For ads: Est. spend, Duplication count, Ad run duration

### Row 7 — Best Platform Recommendation (AI-powered, Anthropic API)
- ★ Recommended platform with score (e.g., TikTok Shop Score: 94/100)
- Ranked list: all platforms with scores
- Per platform: margin estimate, competition level, demand score
- AI rationale: one-line explanation from Anthropic
- Supplier match: AliExpress/CJ suggestion with MOQ, price, lead time
- Data freshness badge + Manual Refresh button

### Chain Data Sources & Refresh Triggers

| Row | Data Source | Trigger to Refresh | Max Stale Age |
|-----|-----------|-------------------|---------------|
| 1 — Identity | product_extractor_worker | On product click | 24 hours |
| 2 — Stats | trend_scoring_worker + BSR scanner | On product click | 3 hours |
| 3 — Influencers | creator_monitor + match engine | On row expand | 6 hours |
| 4 — TikTok Shops | tiktok_discovery_worker | On row expand | 3 hours |
| 5 — Other Channels | cross-platform matcher | On row expand | 6 hours |
| 6 — Videos & Ads | video_scraper + ad worker | On row expand | 3 hours |
| 7 — Best Platform | platform_profitability_scorer | On product click | 12 hours |

---

## 6. Home Dashboard Spec

### 6.1 — Dashboard Card Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER: [YouSell logo] [Search bar] [Alerts 🔔 3] [Profile]           │
├─────────────────────────────────────────────────────────────────────────┤
│ LIVE STATS BAR (from pre-computed counters, updated every 3h)          │
│ Products: 48,291 · Creators: 12,440 · Alerts Today: 7                 │
│ TikTok Trending: 124 · Amazon Rising: 38 · Shopify Scaling: 19        │
│ Last updated: 47 min ago [🔄 Refresh Now]                              │
├─────────────────────────────────────────────────────────────────────────┤
│ FILTER TABS: [All] [🔥 Trending] [🔮 Pre-Trend] [TikTok] [Amazon] [Shopify] │
│ Sort by: [Trend Score ▼] [Predictive Score] [Revenue] [Newest]        │
├─────────────────────────────────────────────────────────────────────────┤
│ PRODUCT INTELLIGENCE CARDS (20 cards, lazy-loaded, infinite scroll)    │
│ Each card shows all 7 chain rows in condensed form                     │
│ Action buttons: [View Full Detail] [💾 Save] [📩 Find Creators] [🔔 Alert] │
├─────────────────────────────────────────────────────────────────────────┤
│ SECONDARY INTELLIGENCE ROWS:                                           │
│ 🔮 Pre-Trend Picks (predictive_score > 65, product_age < 7d)          │
│ 📈 Fastest Growing Creators this week                                  │
│ 🏪 Stores Scaling Right Now                                           │
│ 📊 Ad Creatives Gaining Traction                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 — Home Page Refresh Logic

| Trigger | Action | Priority |
|---------|--------|----------|
| User opens dashboard | IF `dashboard_cards_mv.last_refreshed` < 3h ago → return stale data + badge, enqueue refresh at P2. ELSE → return fresh materialised view (<300ms) | P2 |
| User clicks [Refresh Now] | Enqueue REFRESH_DASHBOARD_HOME at P0. Show [Updating...] state. Supabase Realtime pushes update when complete. | P0 |
| User clicks any product card | Enqueue REFRESH_PRODUCT_CHAIN(product_id) at P0. Navigate to product detail. Stale rows show [Updating...], fresh rows show immediately. | P0 |
| Idle 3-hour background refresh | No user activity for >3h → Enqueue REFRESH_DASHBOARD_HOME at P2 + ONE platform refresh (rotating) at P2. | P2 |

---

## 7. Platform Sections

### 🎵 TikTok Intelligence
FastMoss-level depth — Products · Creators · Videos · Live · Shops · Ads

| Page | Scrapes On... | Data Shown |
|------|--------------|-----------|
| TikTok Products | Section open / Refresh click | Top products by GMV. Filter by niche, country, trend score. |
| TikTok Creators | Section open / Refresh click | Creator rankings. Engagement rate, niche, GMV generated. |
| TikTok Videos | Section open / Refresh click | Viral videos by view velocity. Product links extracted. |
| TikTok Shops | Section open / Refresh click | Shops by GMV. Active creators, product count, growth %. |
| TikTok Live | Section open / Refresh click | Live streams: cumulative viewers, units sold, creator linked. |
| TikTok Ads | Section open / Refresh click | Ad creative library. Duplication count, spend estimate. |

### 📦 Amazon Intelligence
Keepa + JungleScout depth — BSR · Price History · Reviews · TikTok Correlation

| Page | Scrapes On... | Data Shown |
|------|--------------|-----------|
| Amazon Products | Section open / Refresh click | Rising products by BSR movement, review velocity, TikTok cross-signal. |
| Amazon Rankings | Section open / Refresh click | BSR movement chart per category. Fastest climbing products. |
| Amazon vs TikTok | Section open / Refresh click | TikTok viral products matched to Amazon ASINs. Side-by-side stats. |

### 🛍️ Shopify Intelligence
PPSPY depth — Store Discovery · Revenue Signals · Growth Tracking

| Page | Scrapes On... | Data Shown |
|------|--------------|-----------|
| Shopify Stores | Section open / Refresh click | Stores by revenue estimate and growth rate. Niche filter. |
| Store Intelligence | Store card click | Deep dive: top products, ad spend, traffic, creator partnerships. |
| Niche Scanner | Section open / Refresh click | Niches with most new Shopify store launches this week. |

### Platform Scope — Worker Counts

| Platform | Data Collected | Workers |
|----------|---------------|---------|
| TikTok | Products, creators, videos, shops, live streams, ads, hashtags | 7 workers |
| Amazon | BSR rankings, price history, reviews, competitor ASINs, sales estimates | 3 workers |
| Shopify | Store discovery, revenue signals, top products, ad spend, niche detection | 2 workers |
| Facebook/Instagram | Ad creative library, spend estimates, ad duplication patterns | 1 worker |
| Reddit | Trend signals, product mentions, buying intent threads | 1 worker |
| Pinterest | Trend boards, product saves, traffic signals | 1 worker |
| Google Trends | Search volume trends, keyword velocity, rising queries | 1 worker (SerpAPI) |
| YouTube | Product review videos, affiliate links, channel recommendations | 1 worker |

⚠️ VAGUE: Google Trends worker and YouTube worker are mentioned in the platform scope table but **no dedicated worker is defined in Section 11 (Worker System)**. The worker system lists only 18 workers, and these two are not among them.

---

## 8. Scoring Models (4 Intelligence Engine Algorithms)

### 8.1 — Trend Score

```
trend_score = CLAMP(0, 100,
    (view_velocity         × 0.30)  // views-per-hour growth rate vs 7d baseline
  + (creator_adoption_rate × 0.25)  // new unique creators posting/week
  + (store_adoption_rate   × 0.20)  // new shops listing same product/week
  + (engagement_ratio      × 0.15)  // (likes + comments + shares) / views
  + (ad_duplication_rate   × 0.10)  // same ad creative appearing on N+ accounts
)

Alert threshold: score > 75 → fire P1 job to refresh product chain
```

### 8.2 — Predictive Discovery Score (Pre-Trend, 3–7 day lead time)

```
predictive_score = CLAMP(0, 100,
    (creator_burst_signal     × 0.35)  // 3+ new creators post same product in 48h
  + (engagement_velocity      × 0.25)  // hourly view rate doubling over baseline
  + (store_adoption_velocity  × 0.20)  // new stores listing same product within 72h
  + (ad_creative_replication  × 0.20)  // same creative format appearing on 3+ accounts
)

Pre-trend alert fires when: predictive_score > 65 AND product_age_days < 7
Home card badge: 🔮 ABOUT TO TREND
Priority: ALWAYS run predictive worker at P1 — this is the core moat feature
```

### 8.3 — Creator-Product Match Score

```
match_score = CLAMP(0, 100,
    (niche_alignment         × 0.35)  // semantic similarity: creator bio vs product category
  + (historical_conversion   × 0.30)  // past sales generated for similar product categories
  + (engagement_rate         × 0.20)  // (likes + comments) / followers × 100
  + (demographics_fit        × 0.15)  // audience age/gender/location vs product target
)

Outreach list threshold: match_score > 70
Outreach email generated by Anthropic API using product + creator context
```

### 8.4 — Platform Profitability Score

```
platform_score[platform] = CLAMP(0, 100,
    (estimated_margin      × 0.40)  // typical gross margin for this category on platform
  + (demand_velocity       × 0.30)  // platform-specific search/browse volume for product
  + (competition_inverse   × 0.30)  // 100 - (active_sellers / market_threshold × 100)
)

Computed for: TikTok Shop · Amazon · Shopify · Instagram · eBay
Top-ranked platform = ★ recommendation shown on every product card
Anthropic API generates one-line rationale from scores + market context
```

---

## 9. Database Schema

### Core Intelligence Tables

| Table | Key Fields | RLS |
|-------|-----------|-----|
| tenants | id, name, plan, brand_config, api_keys, custom_domain | Super admin only |
| users | id, tenant_id, role, email | Own row + admin |
| products | id, tenant_id, title, product_type, tiktok_id, amazon_asin, shopify_id, trend_score, predictive_score, saturation_score, last_scraped_at | By tenant_id |
| creators | id, tenant_id, username, platform, follower_count, engagement_rate, niche, conversion_score, outreach_status | By tenant_id |
| videos | id, tenant_id, creator_id, product_id, view_count, engagement_velocity, is_ad, product_links | By tenant_id |
| shops | id, tenant_id, platform, estimated_revenue, growth_rate, ad_spend_signal, creator_count | By tenant_id |
| ads | id, tenant_id, platform, creative_url, duplication_count, estimated_spend, is_scaling | By tenant_id |
| trend_scores | id, tenant_id, product_id, platform, score, view_velocity, creator_adoption_rate, scored_at | By tenant_id |
| platform_scores | id, tenant_id, product_id, platform, score, margin_score, competition_score, demand_score, ai_rationale | By tenant_id |
| product_platform_matches | id, tenant_id, product_id, platform, external_id, match_confidence | By tenant_id |
| creator_product_links | id, tenant_id, creator_id, product_id, estimated_sales, link_type | By tenant_id |
| affiliate_programs | id, tenant_id, product_id, program_name, commission_rate, payout_type | By tenant_id |
| predictive_signals | id, tenant_id, product_id, signal_type, signal_strength, detected_at | By tenant_id |
| alert_configs | id, tenant_id, user_id, alert_type, threshold_value, delivery_method | By tenant_id |
| saved_collections | id, tenant_id, user_id, item_type, item_id, created_at | By tenant_id + user |
| scrape_log | id, tenant_id, worker_name, trigger_type, platform, cost_estimate, duration_ms, status, created_at | Admin only |
| scrape_schedule | id, tenant_id, platform, last_scraped_at, next_scheduled_at, priority | Admin only |
| api_usage_log | id, tenant_id, endpoint, method, user_id, response_time_ms, created_at | Admin only |
| dashboard_cards_mv | MATERIALISED VIEW — pre-joined product intelligence cards | By tenant_id |

### Key Relationships
- `users.id` = Supabase Auth user id
- `users.tenant_id` REFERENCES `tenants(id)`
- ALL data tables include `tenant_id uuid NOT NULL`
- Supabase RLS on every table: `WHERE tenant_id = auth.jwt()->>'tenant_id'`
- Tenant A can NEVER see tenant B's data — enforced at DB level

⚠️ VAGUE: No explicit `notifications` table defined despite Section 14.3 describing an in-app Notification Centre that persists notifications in DB.

⚠️ VAGUE: No explicit `outreach_sequences` or `creator_outreach` table defined despite Section 14.8 describing a Creator Outreach CRM with status tracking (Identified → Email Sent → Replied → Deal Closed).

⚠️ VAGUE: No explicit `webhook_configs` table defined despite Section 14.9 describing webhook/Zapier integration where users can configure webhooks.

---

## 10. Worker System (18 Workers)

| # | Worker | Trigger | Priority Lane | Daily Budget | API |
|---|--------|---------|--------------|-------------|-----|
| 1 | tiktok_discovery_worker | User opens TikTok section / idle 3h | P0 or P2 | 500 calls | Apify / RapidAPI |
| 2 | hashtag_scanner_worker | Fires with discovery worker | P0 or P2 | 200 calls | TikTok unofficial API |
| 3 | creator_monitor_worker | User expands Influencers row | P0 or P2 | 200 calls | Apify |
| 4 | video_scraper_worker | User opens Videos page / product click | P0 | 300 calls | Apify |
| 5 | product_extractor_worker | Fires after any scrape completes | P0 or P1 | Unlimited (internal) | Internal |
| 6 | tiktok_live_worker | User opens Live page | P0 | 100 calls | RapidAPI |
| 7 | tiktok_ads_worker | User opens Ads page | P0 or P2 | 150 calls | TikTok Ads API |
| 8 | amazon_bsr_scanner_worker | User opens Amazon section / idle 3h | P0 or P2 | 150 calls | Amazon PA API |
| 9 | amazon_tiktok_match_worker | Fires after product_extractor completes | P1 | Unlimited (internal) | Internal |
| 10 | shopify_store_discovery_worker | User opens Shopify section / idle 3h | P0 or P2 | 100 calls | Apify |
| 11 | shopify_growth_monitor_worker | Fires with store discovery | P0 or P2 | 80 calls | Apify |
| 12 | reddit_trend_worker | Fires during idle refresh rotation | P2 | 100 calls | Reddit API |
| 13 | pinterest_trend_worker | Fires during idle refresh rotation | P2 | 100 calls | Pinterest API |
| 14 | facebook_ads_worker | User opens Ads Intelligence page | P0 or P2 | 200 calls | Apify |
| 15 | trend_scoring_worker | Fires after any data scrape completes | P1 | Unlimited (internal) | Internal |
| 16 | predictive_discovery_worker | Fires every 2h via scheduler (alert-critical) | P1 | 50 Anthropic calls | Internal + Anthropic |
| 17 | platform_profitability_scorer | User views Best Platform row | P0 | 30 Anthropic calls | Anthropic API |
| 18 | system_health_monitor_worker | Always-on (lightweight — no external API) | Always | No external calls | Internal only |

⚠️ VAGUE: Google Trends worker (mentioned in Section 2 platform scope as "1 worker (SerpAPI)") is **not listed** in the worker system. The brief mentions `SERPAPI_KEY` as "still needed" in the execution prompt.

⚠️ VAGUE: YouTube worker (mentioned in Section 2 platform scope as "1 worker") is **not listed** in the worker system. The brief mentions `YOUTUBE_API_KEY` as "still needed".

---

## 11. API Routes

⚠️ VAGUE: The brief does **NOT** contain a dedicated API routes section. API endpoints are only referenced indirectly throughout other sections:

### Endpoints Referenced (inferred from context)

| Method | Path (inferred) | Purpose | Source Section |
|--------|----------------|---------|----------------|
| GET | /api/tiktok/products?trigger=view | Fetch TikTok products, trigger on-demand scrape if stale | Section 4.2 |
| GET | /api/products/:id?trigger=click | Fetch single product, check freshness of all 7 chain rows | Section 4.2 |
| — | (various platform endpoints implied) | Each platform section implies GET endpoints | Sections 8, 9 |
| — | (job queue trigger endpoints) | Backend described as "Read-only data API + job queue trigger endpoints" | Section 5 |

⚠️ VAGUE: No complete API route list exists. No explicit mention of POST/PUT/DELETE endpoints for: saving collections, configuring alerts, managing outreach, webhook configuration, export triggers, billing/subscription management, user management, or any admin operations.

---

## 12. Subscription Plans & Billing

### Plan Tiers

| Feature | Starter ($49/mo) | Pro ($149/mo) | Agency ($349/mo) | Enterprise (Custom) |
|---------|-----------------|---------------|-------------------|---------------------|
| Platform access | TikTok only | TikTok + Amazon | All platforms | All platforms |
| Products tracked | 500 | 5,000 | 25,000 | Unlimited |
| Creators tracked | 200 | 2,000 | 10,000 | Unlimited |
| Trend alerts | 3 alerts | 25 alerts | Unlimited | Unlimited |
| Saved collections | 10 items | 100 items | Unlimited | Unlimited |
| Predictive engine | ❌ | ✓ | ✓ | ✓ |
| Creator outreach | ❌ | 5/mo | 50/mo | Unlimited |
| Agency reports | ❌ | ❌ | ✓ (branded) | ✓ (white-label) |
| API access | ❌ | ❌ | 1,000 calls/mo | Unlimited |
| Custom branding | ❌ | ❌ | ❌ | ✓ |
| Dedicated support | ❌ | ❌ | Priority | Dedicated CSM |
| Data export | CSV | CSV + Excel | All formats | All formats |

### Billing Architecture
- Stripe Checkout for plan selection during onboarding
- Stripe Customer Portal for self-service plan changes and invoices
- Usage metering via Stripe Meters — track API calls, products tracked, alerts fired
- Overage protection — usage limits enforced in middleware before they cost money
- Free trial: 14 days on Pro plan, no card required

---

## 13. Development Phases

### Phase 0 — Infrastructure & Auth (Days 1–3)
- Verify Redis + BullMQ on Railway. Create P0/P1/P2 queue lanes.
- Run all Supabase schema migrations including tenant_id on all tables + RLS policies
- Set up Supabase Auth: email, Google OAuth, magic links
- Create /system/ context files and STATUS.json
- Implement budget enforcement Redis middleware (Section 4.5)
- Implement data freshness tracking (scrape_schedule table + Redis cache keys)

### Phase 1 — TikTok MVP + Predictive Engine + Smart Scraping (Days 4–18)
Goal: Working FastMoss-equivalent + pre-trend detection + demand-driven scraping.
- Smart scraping trigger system: user click → P0 queue → worker → Supabase Realtime → UI update
- Workers: tiktok_discovery, hashtag_scanner, creator_monitor, video_scraper, product_extractor, trend_scoring, predictive_discovery (P1 — always runs every 2h — this is the moat)
- Home dashboard: materialised view + auto-populating product cards with 7-row chain
- Data freshness badges on every card and page
- Idle 3-hour background refresh scheduler
- TikTok section: Products, Creators, Videos, Live, Shops, Ads pages
- Product Detail: all 7 chain rows, on-demand scraping per row
- Global search (Cmd+K)
- Notification centre

### Phase 2 — Amazon + Shopify + Cross-Platform Graph (Days 19–35)
- Workers: amazon_bsr_scanner, amazon_tiktok_match, shopify_store_discovery, shopify_growth_monitor, reddit_trend, pinterest_trend (P2 idle only)
- Cross-platform product matching engine (TikTok ↔ Amazon ASIN ↔ Shopify)
- Amazon and Shopify sections with identical 7-row product detail chain
- Other Channels row fully populated on all product detail pages
- Comparison Mode (side-by-side 2-4 products)
- Trend history charts (90-day score timeline)
- Competitor niche map (bubble chart)

### Phase 3 — Intelligence Layer + Moat Features (Days 36–55)
- Workers: platform_profitability_scorer (Anthropic API), facebook_ads, tiktok_ads
- Opportunity Feed page — live merged intelligence feed
- Trend Alerts system: email via Resend + in-app notification
- Affiliate Programs discovery and display
- Creator Outreach Engine: match → generate email copy (Anthropic) → send (Resend) → CRM tracking
- AI Insight Engine: natural language market summaries (Anthropic API)
- Data export: CSV, Excel, PDF intelligence reports
- Webhook + Zapier integration for alerts

### Phase 4 — SaaS Layer + Launch Readiness (Days 56–75)
- Stripe billing: plan selection, customer portal, usage metering, overage guards
- 14-day free trial flow
- Onboarding wizard: platform selection, first scrape, onboarding checklist
- Agency Mode: branded PDF reports, client sub-accounts, white-label config
- Job Scheduler UI: per-worker schedule control, daily budget sliders, cost estimate
- Public API: API key management, rate limiting by plan, developer docs
- Audit log viewer (Enterprise)
- Mobile-responsive optimisation
- White-label configuration: logo, colours, custom domain, brand name
- Launch: custom domain, Stripe live mode, monitoring setup

---

## 14. Additional Content

### 14.1 — Senior Architect Critical Review (Section 1)
7 issues identified and corrected from v3/v4:

| # | Issue | Fix Applied in v5 |
|---|-------|-------------------|
| 1 | Always-On Scraping Is Financially Unsustainable ($800–$2,000/mo before users) | Replaced with Demand-Driven Smart Scraping Engine. Estimated 85% cost reduction. |
| 2 | No Multi-Tenancy Architecture (single-tenant admin tool) | All tables include tenant_id. Supabase RLS enforces isolation. platform_configs for per-tenant API keys/branding. |
| 3 | No Authentication or User Management | Supabase Auth with email/password, Google OAuth, magic links. Roles: super_admin / agency_owner / analyst / viewer. JWT on all routes. |
| 4 | No Data Freshness Signal to Users | Every page/card shows 'Last updated: X minutes ago'. Yellow warning >6h. Red badge >24h with manual refresh button. |
| 5 | Home Page Would Be Impossibly Slow (140+ DB joins) | Materialised view: dashboard_cards_mv pre-computed every 3h or on-demand. Target: <300ms cold, <100ms cached. |
| 6 | No Rate Limit or Cost Guard | Each worker has: daily API call budget (Redis), circuit breaker, cost estimate in Job Scheduler UI, Slack/email alert at 80% budget. |
| 7 | No Competitive Moat Defined | 6 defensible moat features defined. Pre-trend engine, cross-platform graph, and creator outreach are Phase 1 priorities. |

### 14.2 — Competitive Moat (6 Defensible Features)

| # | Moat Feature | Why Defensible | Build Phase |
|---|-------------|---------------|-------------|
| 1 | Pre-Trend Predictive Engine | Detects products 3–7 days before viral. No competitor does this. First-mover advantage. | Phase 1 |
| 2 | Cross-Platform Intelligence Graph | Links TikTok video → creator → Amazon ASIN → Shopify store → Facebook ad in one graph. Unique data asset. | Phase 2 |
| 3 | Creator-Product Match Score | AI-ranked creator recommendations per product with conversion probability. Replaces manual influencer research. | Phase 2 |
| 4 | Best Platform Recommender | AI tells you: should you sell on TikTok Shop, Amazon, or Shopify? With margin and competition data. No competitor offers this. | Phase 3 |
| 5 | Automated Creator Outreach | One-click email sequence to top-matched creators via Resend. Turns intelligence into action. | Phase 3 |
| 6 | Agency Intelligence Reports | Branded PDF intelligence reports generated in one click. Agencies will pay $300+/month for this alone. | Phase 4 |

### 14.3 — Competitor Analysis

| Competitor | Weakness | YouSell Advantage |
|-----------|---------|-------------------|
| FastMoss | TikTok only. No Amazon/Shopify. No pre-trend. | Cross-platform + predictive engine |
| JungleScout | Amazon only. No social signal layer. | TikTok viral signal drives Amazon opportunity score |
| PPSPY | Shopify only. No creator intelligence. | Creator-to-store linkage across all platforms |
| Minea | Ads only. No product or creator intelligence. | Full funnel: product → creator → ad → store |
| Helium 10 | Amazon SEO tool. No social or trend layer. | Social-first product discovery feeding Amazon |
| All competitors | Siloed. No cross-platform product graph. | Unified intelligence graph is the core moat |

### 14.4 — Multi-Tenancy & Auth (Section 6)

**Tenant Model:**
```sql
tenants: id uuid PK, name text NOT NULL, plan enum('starter','pro','agency','enterprise'),
         custom_domain text, brand_config jsonb, api_keys jsonb, created_at timestamptz

users: id uuid PK (= Supabase Auth user id), tenant_id uuid FK → tenants(id),
       role enum('super_admin','agency_owner','analyst','viewer'), email text
```

**Role-Based Access Control:**

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| super_admin | Everything including billing, white-label config, all user management | — |
| agency_owner | All intelligence features, client report generation, team management | Change billing plan, access system config |
| analyst | View all intelligence, save collections, set alerts, export data | Manage users, access billing |
| viewer | View dashboards and reports only (read-only) | Export, save, set alerts, manage anything |

**Onboarding Flow (5 steps):**
1. Sign up → Supabase Auth creates user + tenant record
2. Plan selection → Stripe Checkout
3. Platform connection wizard — connect TikTok region, Amazon marketplace, Shopify niche filters
4. First scrape triggered → home dashboard populates with initial data
5. Onboarding checklist: 'Set your first alert', 'Save a product', 'Find a creator'

### 14.5 — Missing SaaS Features Added in v5 (Section 14)

| # | Feature | Description |
|---|---------|-------------|
| 14.1 | Global Search | Supabase full-text search (pg_trgm). Search bar in header. Cmd+K shortcut. |
| 14.2 | Audit Log | Enterprise/Agency. Every significant user action logged in api_usage_log. |
| 14.3 | Notification Centre | Bell icon in header. All fired alerts, system messages, onboarding prompts. Persisted in DB. Mark as read. Clear all. |
| 14.4 | Data Export | Every table view → CSV, Excel, or PDF. Product intelligence chains → formatted PDF. Agency plan → branded PDF with client logo. |
| 14.5 | Comparison Mode | Select 2-4 products, compare side-by-side across all 7 chain rows. Checkboxes on product list. |
| 14.6 | Trend History Charts | Every product shows 90-day trend score history chart. Stored in trend_scores time-series table. |
| 14.7 | Competitor Niche Map | Visual bubble chart: X = demand, Y = competition, bubble size = creator adoption. Find underserved niches. |
| 14.8 | Creator Outreach CRM | Track outreach status: Identified → Email Sent → Replied → Deal Closed. Resend for emails. Reply tracking via webhooks. |
| 14.9 | Webhook & Zapier Integration | Trend alert fires → user-configured webhook → external automations. Pre-built Zapier templates. |
| 14.10 | Mobile-Responsive Dashboard | Fully usable on tablet and mobile. Home, Product Detail, Alerts must be mobile-optimised. Mobile-first for Opportunity Feed. |

### 14.6 — Development Guardrails (Section 16)

| # | Rule | Requirement |
|---|------|------------|
| 1 | No scraping in API routes | API endpoints NEVER scrape. Worker → DB → API reads DB. Always. |
| 2 | No always-on scraping | Workers fire on P0/P1/P2 queue jobs only. No cron loops calling external APIs. |
| 3 | Budget check before every external call | Every worker must call checkBudget() before any Apify/RapidAPI/Anthropic request. |
| 4 | Freshness badge on every data view | Every page and every product card must show 'Last updated: X ago'. No exceptions. |
| 5 | Audit before modify | Read every file completely before modifying it. Never overwrite blindly. |
| 6 | No duplicate workers | Check /system/worker_map.md before creating any worker. |
| 7 | tenant_id on all tables | Every data table must include tenant_id. Supabase RLS must enforce isolation. |
| 8 | Update STATUS.json after every task | STATUS.json is the session recovery anchor. |
| 9 | Commit after every task | `git add -A && git commit -m 'feat(phaseX): [task]'` after every task. |
| 10 | No .env commits | .env and .env.local stay in .gitignore. Never commit secrets. |
| 11 | Chain parity | TikTok, Amazon, and Shopify product pages must always have identical 7-row chain depth. |
| 12 | Predictive engine is always P1 | predictive_discovery_worker is the moat. Never downgrade to P2 or skip. |
| 13 | Dead-letter queue required | Failed jobs after 3 retries go to dead_letter_queue and trigger admin alert. Never silently drop. |
| 14 | Existing stack only | Do not introduce new infrastructure without explicit instruction from project owner. |

### 14.7 — Session Continuity Protocol (Section 17)

Files to read on every session start (in order):

| Order | File | Purpose |
|-------|------|---------|
| 1 | system/STATUS.json | Machine-readable state — read FIRST |
| 2 | system/development_log.md (tail -50) | Human-readable progress |
| 3 | system/system_architecture.md | Full architecture reference |
| 4 | system/database_schema.md | DB structure including tenant_id and RLS |
| 5 | system/worker_map.md | All 18 workers: existing vs planned vs triggered-how |
| 6 | system/ai_logic.md | Scoring algorithms and Anthropic API usage |
| 7 | system/scrape_schedule.md | Current scraping trigger config and budget status |

### 14.8 — STATUS.json Format (v5)

```json
{
    "last_updated": "2026-03-11T10:00:00Z",
    "schema_version": "5.0",
    "current_phase": 1,
    "current_phase_name": "TikTok MVP + Smart Scraping",
    "last_completed_task": "P0/P1/P2 queue system implemented",
    "next_task": "tiktok_discovery_worker (demand-driven)",
    "phase_progress": {
        "0": "COMPLETE", "1": "IN_PROGRESS",
        "2": "NOT_STARTED", "3": "NOT_STARTED", "4": "NOT_STARTED"
    },
    "blockers": [],
    "smart_scraping_implemented": false,
    "auth_implemented": false,
    "billing_implemented": false,
    "notes": "Phase 0 complete. Redis on Railway confirmed. RLS policies applied."
}
```

### 14.9 — API Keys Available

| Key | Status |
|-----|--------|
| ANTHROPIC_API_KEY | ✓ Available |
| APIFY_API_TOKEN | ✓ Available |
| RAPIDAPI_KEY | ✓ Available |
| SUPABASE_URL | ✓ Available |
| SUPABASE_SERVICE_ROLE_KEY | ✓ Available |
| REDIS_URL | ✓ Available |
| RESEND_API_KEY | ✓ Available |
| AMAZON_PA_API_KEY | ✓ Available |
| TIKTOK_PROVIDER | ✓ Available |
| SHOPIFY_PROVIDER | ✓ Available |
| PINTEREST_PROVIDER | ✓ Available |
| INFLUENCER_PROVIDER | ✓ Available |
| TRENDS_PROVIDER | ✓ Available |
| SERPAPI_KEY | ❌ Still needed |
| REDDIT_CLIENT_ID/SECRET | ❌ Still needed |
| YOUTUBE_API_KEY | ❌ Still needed |

### 14.10 — Claude Code Master Execution Prompt v5.0 (Section 18)

The brief includes a full copy-paste-ready autonomous agent prompt covering:
- Session start protocol (7 commands to run)
- Recovery summary block template
- What is being built (condensed)
- Smart scraping engine rules (condensed)
- Tech stack (condensed)
- 13 immutable rules
- Task completion ritual
- Phase targets (condensed)
- API keys available
- 5-step execution loop (run protocol → print recovery → execute task → completion ritual → repeat)
