# YOUSELL Platform — Developer Handoff Document

**Version:** 1.0
**Date:** 2026-03-12
**Status:** FINAL — Ready for Development
**Repository:** github.com/haqeeqiazadee-ux/yousell-admin

---

## TABLE OF CONTENTS

- [Part 1: What's Already Built](#part-1-whats-already-built)
- [Part 2: System Architecture (Current)](#part-2-system-architecture-current)
- [Part 3: What Needs to Be Built (Next Phases)](#part-3-what-needs-to-be-built-next-phases)
- [Part 4: Complete System Architecture (Target State)](#part-4-complete-system-architecture-target-state)
- [Part 5: Database Schema Changes](#part-5-database-schema-changes)
- [Part 6: API Specifications](#part-6-api-specifications)
- [Part 7: Third-Party Integrations](#part-7-third-party-integrations)
- [Part 8: Implementation Phases](#part-8-implementation-phases)
- [Appendix A: File Reference](#appendix-a-file-reference)
- [Appendix B: Environment Variables](#appendix-b-environment-variables)

---

# PART 1: WHAT'S ALREADY BUILT

## 1.1 Platform Overview

YOUSELL is an AI-powered e-commerce automation platform that discovers trending products across 5 selling channels, scores them using AI, and provides intelligence for product launches. It is NOT just a data tool — it automates discovery, intelligence, marketing, store integration, content creation, influencer outreach, and affiliate revenue across TikTok, Amazon, Shopify, Digital Products, and AI Affiliate programs.

## 1.2 Technology Stack (Current)

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui | Netlify |
| Backend | Node.js, Express 4.18, BullMQ 5.1, IORedis | Railway |
| Database | Supabase PostgreSQL + Auth + Realtime | Supabase Cloud |
| Scraping | Apify Actors (8 actors) | Apify Cloud |
| AI | Anthropic Claude API (Sonnet) | Anthropic API |
| Email | Resend API | Resend Cloud |
| Domains | admin.yousell.online (this app), yousell.online (marketing site — separate) | Netlify |

## 1.3 Features — FULLY BUILT (Production Ready)

### Multi-Platform Product Discovery
- **TikTok:** Via Apify `clockworks~tiktok-scraper` — products, likes, shares, comments, views, hashtags
- **Amazon:** Via Apify `junglee~amazon-bestsellers-scraper` + RapidAPI — ASIN, rating, BSR, Prime status
- **Shopify:** Via Apify `clearpath~shop-by-shopify-product-scraper` — vendor, variants, availability
- **Pinterest:** Via Apify `alexey~pinterest-crawler` — pins, boards, engagement
- **Digital:** Via Apify `epctex~gumroad-scraper` — templates, courses, AI tools, sales count
- **Source:** `/src/lib/providers/` (one provider per platform)

### AI Scoring Engine
- 3-pillar model: `final_score = trend_score × 0.40 + viral_score × 0.35 + profit_score × 0.25`
- Score tiers: HOT (≥80), WARM (≥60), COLD (<60)
- Trend stages: emerging, rising, exploding, saturated
- 6-metric viral signal detection (micro_influencer_convergence, comment_purchase_intent, hashtag_acceleration, creator_niche_expansion, engagement_velocity, supply_side_response)
- **Source:** `/src/lib/scoring/composite.ts`, `/src/lib/scoring/profitability.ts`

### Launch Blueprint Generation
- Claude Sonnet-powered AI generates: positioning, product_page_content, pricing_strategy, video_script, ad_blueprint, launch_timeline, risk_notes
- Triggered for products scoring 75+
- PDF export capability
- **Source:** `/src/app/api/admin/blueprints/route.ts`

### Financial Modeling
- Retail price & cost calculations, gross margin (40% minimum), break-even analysis (units & months)
- Revenue projections (30/60/90 day), cost breakdown, risk flags
- Auto-rejection rules: margin < 40%, shipping > 30% of retail, break-even > 2 months, fragile/hazmat without cert, no US delivery within 15 days
- Influencer ROI and ad ROAS estimates
- **Source:** `/src/app/api/admin/financial/route.ts`

### Influencer Discovery
- Via Apify `apify~instagram-profile-scraper`
- Tier classification: nano (1K–10K), micro (10K–100K), mid (100K–1M), macro (1M+)
- Engagement rate, cost-per-post estimation, fake follower detection
- Outreach email infrastructure (database schema + Resend integration ready)
- **Source:** `/src/lib/providers/influencer/index.ts`

### Supplier Discovery
- Via Apify `epctex~alibaba-scraper`
- Data: companyName, country, MOQ, unitPrice, shippingCost, leadTime, whiteLabel, dropship, usWarehouse, certifications
- Product-supplier linking via junction table
- **Source:** `/src/lib/providers/supplier/index.ts`

### Affiliate Program Database
- 10 AI affiliate programs pre-configured: Jasper (30%), Copy.ai (45%), Midjourney (50%), Canva (25%), Notion (50%), Teachable (30%), ConvertKit (30%), Shopify (20%), Hostinger (60%), NordVPN (40%)
- 5 physical affiliate programs: Amazon Associates (4%), TikTok Shop (15%), Walmart (4%), Target (5%), eBay (3%)
- **Source:** `/src/lib/providers/affiliate/index.ts`

### Client Management & Product Allocation
- Clients table with plan tiers (currently: starter/growth/professional/enterprise)
- Product allocation system (admin allocates products to clients)
- Client dashboard at `/dashboard` showing only allocated products
- Product request system (clients request, admin fulfills)
- Role-based access: admin (full), client (allocated products only)
- **Source:** `/src/app/admin/clients/page.tsx`, `/src/app/admin/allocate/page.tsx`

### Background Job System
- BullMQ on Railway with Redis
- 11 pre-configured automation jobs (all currently disabled):
  - `trend_scout_early_viral` (every 6 hours)
  - `tiktok_product_scan` (daily 2 AM)
  - `amazon_bsr_scan` (daily 3 AM)
  - `pinterest_trend_scan` (daily 4 AM)
  - `google_trends_batch` (daily 5 AM)
  - `reddit_demand_signals` (every 12 hours)
  - `digital_product_scan` (daily 6 AM)
  - `ai_affiliate_refresh` (weekly Monday)
  - `shopify_competitor_scan` (weekly Tuesday)
  - `influencer_metric_refresh` (weekly Wednesday)
  - `supplier_data_refresh` (monthly 1st)
- **Source:** `/backend/src/worker.ts`, `/backend/src/lib/queue.ts`

### Email System
- Resend API integration for: scan completion alerts, viral product alerts (max 3/day), product notifications
- **Source:** `/src/lib/email.ts`, `/backend/src/lib/email.ts`

### Competitor Analysis
- Store-level tracking: est_monthly_sales, primary_traffic, influencers_promoting, ad_active, bundle_strategy, success_score, ai_analysis
- **Source:** `/src/app/admin/competitors/page.tsx`

### Admin Dashboard (22 Pages)
Main: Dashboard, Scan Control, Products, Trends
Channel: TikTok, Amazon, Shopify, Pinterest, Digital, Affiliates (AI + Physical)
Intelligence: Competitors, Influencers, Suppliers, Blueprints
Management: Clients, Allocate, Notifications, Import, Settings, Analytics

## 1.4 Features — PARTIALLY BUILT (Schema/Framework Exists, Logic Not Complete)

| Feature | What Exists | What's Missing |
|---------|------------|----------------|
| Influencer outreach | `outreach_emails` table, Resend integration, `product_influencers` with outreach_status | Automated outreach workflow, email templates, one-click send buttons, follow-up sequences |
| Ad blueprint | AI generates strategy text in blueprints | Actual ad creative generation, campaign creation, ad platform API integration |
| Content creation | Video scripts + product copy in blueprints | Standalone content engine, social media post generation, blog content |
| Marketing automation | Email alerts working, automation jobs table ready | Campaign management, multi-channel distribution, scheduling |

## 1.5 Features — NOT BUILT YET (Designed But No Code)

- Stripe subscription management
- Platform access gating (locked/unlocked)
- Engine-based toggles (enable/disable per client)
- Store integration (push products TO Shopify/TikTok/Amazon)
- Order tracking & post-purchase emails
- Marketing channel OAuth integrations (TikTok, Instagram, YouTube, etc.)
- Content distribution automation
- AI Affiliate marketing automation
- Dual-platform separation (admin vs client app)
- Usage tracking and limit enforcement
- Client self-service subscription management

---

# PART 2: SYSTEM ARCHITECTURE (CURRENT)

## 2.1 Current Data Flow

```
Admin triggers scan (or automation job fires)
        ↓
Next.js API Route → Express Backend (Railway)
        ↓
BullMQ Job Queue
        ↓
Worker runs Apify Actor
        ↓
Actor scrapes platform → returns dataset
        ↓
Worker fetches dataset → stores raw JSON in raw_listings
        ↓
Transformation layer normalizes data → inserts into products
        ↓
Scoring engine calculates trend + viral + profit scores
        ↓
Supabase database updated
        ↓
Supabase Realtime pushes updates to dashboard
        ↓
Admin views products, allocates to clients
        ↓
Client sees allocated products on /dashboard
```

## 2.2 Current Database Schema (20 Tables)

```
profiles            — Auth users (admin/client roles)
products            — Discovered products with scores
raw_listings        — Raw scrape data before transformation
product_metrics     — Time-series product metrics
viral_signals       — 6-pillar viral scoring data
influencers         — Influencer profiles
product_influencers — Product↔Influencer links + outreach status
competitor_stores   — Competitor analysis
suppliers           — Supplier profiles
product_suppliers   — Product↔Supplier links
financial_models    — Profitability analysis per product
marketing_strategies — Channel + budget recommendations
launch_blueprints   — AI-generated launch plans
affiliate_programs  — AI + physical affiliate programs
clients             — Client companies with plan tiers
product_allocations — Products allocated to clients
product_requests    — Client requests for products
automation_jobs     — Scheduled scan jobs
scan_history        — Scan execution history
outreach_emails     — Influencer outreach tracking
notifications       — User notifications
imported_files      — CSV/file import tracking
```

All tables have Row Level Security (RLS) enabled. Admin role has full access; client role can only view own allocations.

## 2.3 Current API Routes (26 Endpoints)

**Admin Routes** (`/api/admin/*`):
scan, products, tiktok, amazon, shopify, pinterest, digital, affiliates, influencers, suppliers, competitors, financial, blueprints (+ PDF export), clients, allocations, automation, notifications, settings, import, trends, scoring, dashboard

**Auth Routes** (`/api/auth/*`):
callback (OAuth), signout

**Client Dashboard Routes** (`/api/dashboard/*`):
products, requests

**Backend Express API** (Railway, port 4000):
POST /api/scan, GET /api/scan/history, GET /api/scan/:jobId, POST /api/scan/:jobId/cancel, GET /health

---

# PART 3: WHAT NEEDS TO BE BUILT (NEXT PHASES)

## 3.1 The 8 Engines (Modular System)

YOUSELL is structured as 8 independent engines that clients can enable/disable per platform:

### Engine 1: Product Discovery (BUILT)
Status: Production ready. All 5 platform scrapers working.

### Engine 2: Store Integration (TO BUILD)
Push discovered products INTO client stores:
- **Shopify:** OAuth App → Shopify Admin API (GraphQL) → bulk product import, inventory sync
- **TikTok Shop:** OAuth → TikTok Shop Open API → product listing, category mapping
- **Amazon:** OAuth → SP-API (Listings Items API) → listing creation, ASIN matching
- **Digital:** Product page generation, download delivery via Resend
- **Order Tracking:** Pull order/shipment data from connected stores via webhooks/APIs → automated email sequence via Resend (order confirmation → shipping → delivery → review request). Uses existing Railway BullMQ workers.

### Engine 3: Marketing & Ads (TO BUILD)
- AI-generated ad creatives (images + copy) per platform
- TikTok ad campaign setup via TikTok Marketing API
- Amazon PPC automation via SP-API Advertising
- Facebook/Instagram ad generation via Meta Marketing API
- Pinterest pin generation via Pinterest API
- Ad spend tracking and ROI analysis

### Engine 4: Content Creation (TO BUILD)
- AI-generated product descriptions optimized per platform (Claude API)
- Social media content calendar generation
- Video script generation for TikTok/Reels
- Blog/SEO content for Shopify stores
- Email marketing templates and automated sequences (Resend + Railway)
- Affiliate review content for AI tools
- Post-purchase email flows (Resend, orchestrated by Railway BullMQ workers)

### Engine 5: Influencer & Outreach (PARTIALLY BUILT → TO COMPLETE)
What exists: Discovery, scoring, database schema, Resend integration
What to build:
- **One-click influencer invitation buttons** — send templated outreach emails via Resend
- Automated follow-up sequences for non-responders (Resend + Railway scheduler)
- Campaign brief generation
- Performance tracking per influencer
- Commission/payment management

### Engine 6: Supplier Intelligence (BUILT)
Status: Production ready. Alibaba scraping, product-supplier linking, MOQ/pricing data.

### Engine 7: AI Affiliate Discovery & Marketing (PARTIALLY BUILT → TO COMPLETE)
What exists: Affiliate program database (15 programs), dashboard pages
What to build:
- Auto-generated affiliate promotional content (reviews, comparisons, social posts)
- Client manages their OWN affiliate links — YOUSELL does not touch commissions
- Automated social media content distribution
- Performance tracking dashboard (clicks, signups, estimated commissions)
- New opportunity alerts
- **Business model:** Client earns 100% of affiliate commissions. YOUSELL earns from subscription only.

### Engine 8: Analytics & Profit (PARTIALLY BUILT → TO COMPLETE)
What exists: Financial modeling, scoring dashboard
What to build:
- Real-time sales tracking across all connected platforms
- Profit/loss per product, per platform
- Ad spend vs. revenue analysis
- Custom report generation

## 3.2 Subscription & Billing System (TO BUILD)

### Stripe Integration

```
yousell.online (Marketing Site)
    │
    ├── User clicks "Get Started" on a package
    │
    ▼
Stripe Checkout Session (created by YOUSELL API)
    │
    ├── User completes payment on Stripe's hosted page
    │
    ▼
Stripe Webhook → POST /api/webhooks/stripe (on admin.yousell.online)
    │
    ├── Event: checkout.session.completed
    │   ├── Create Supabase auth user (role: client)
    │   ├── Create clients record with plan tier
    │   ├── Create client_subscriptions record
    │   ├── Set platform access flags based on plan
    │   ├── Create default engine configs
    │   ├── Trigger initial product allocation job (BullMQ)
    │   └── Send welcome email (Resend)
    │
    ├── Event: customer.subscription.updated
    │   ├── Update plan tier if changed
    │   ├── Adjust platform access and engine configs
    │   └── Update client_subscriptions
    │
    ├── Event: customer.subscription.deleted
    │   ├── Set status to 'cancelled'
    │   ├── Disable all engines
    │   ├── Revoke platform access (keep data for 30 days)
    │   └── Send cancellation email
    │
    ├── Event: invoice.payment_failed
    │   ├── Set status to 'past_due'
    │   ├── Send payment failure email
    │   └── Grace period: 7 days before suspension
    │
    ▼
Client redirected to admin.yousell.online/dashboard
```

### Plan Configuration (Config-Driven)

```typescript
// /src/lib/plan-config.ts
export const PLAN_LIMITS = {
  explorer: {
    platforms_included: 1,
    products_per_month: 10,
    blueprints_per_month: 0,
    score_detail: 'final_only',
    influencer_access: 'hidden',
    supplier_access: 'hidden',
    competitor_access: 'none',
    scan_interval_hours: 24,
    data_delay_hours: 24,
    sub_accounts: 0,
    api_access: false,
    engines: {
      discovery: 'included',
      store_integration: 'addon',
      marketing_ads: 'addon',
      content_creation: 'addon',
      influencer_outreach: 'addon',
      supplier_intelligence: 'hidden',
      ai_affiliate: 'addon',
      analytics: 'included',
    }
  },
  seller: {
    platforms_included: 2,
    products_per_month: 50,
    blueprints_per_month: 3,
    score_detail: 'full_breakdown',
    influencer_access: 'top_10',
    supplier_access: 'top_5',
    competitor_access: 'basic',
    scan_interval_hours: 12,
    data_delay_hours: 6,
    sub_accounts: 0,
    api_access: false,
    engines: {
      discovery: 'included',
      store_integration: 'included',
      marketing_ads: 'addon',
      content_creation: 'included',
      influencer_outreach: 'addon',
      supplier_intelligence: 'included',
      ai_affiliate: 'addon',
      analytics: 'included',
    }
  },
  pro_seller: {
    platforms_included: 5,
    products_per_month: 150,
    blueprints_per_month: 10,
    score_detail: 'full_with_history',
    influencer_access: 'full',
    supplier_access: 'full',
    competitor_access: 'deep',
    scan_interval_hours: 6,
    data_delay_hours: 0,
    sub_accounts: 0,
    api_access: 'read_only',
    engines: {
      discovery: 'included',
      store_integration: 'included',
      marketing_ads: 'included',
      content_creation: 'included',
      influencer_outreach: 'included',
      supplier_intelligence: 'included',
      ai_affiliate: 'included',
      analytics: 'included',
    }
  },
  agency: {
    platforms_included: 5,
    products_per_month: -1,  // unlimited
    blueprints_per_month: -1,
    score_detail: 'full_with_history',
    influencer_access: 'full_with_outreach',
    supplier_access: 'full_with_export',
    competitor_access: 'deep_with_alerts',
    scan_interval_hours: 3,
    data_delay_hours: 0,
    sub_accounts: 5,
    api_access: 'full',
    engines: {
      discovery: 'included',
      store_integration: 'included',
      marketing_ads: 'included',
      content_creation: 'included',
      influencer_outreach: 'included',
      supplier_intelligence: 'included',
      ai_affiliate: 'included',
      analytics: 'included',
    }
  },
} as const;
```

**Note:** These plan tiers and prices are PRELIMINARY. A separate market research task (documented in `/ai/pricing_strategy_prompt.md`) must be completed before finalizing prices. The pricing prompt instructs research into per-platform pricing, engine-based add-on pricing, bundle discounts, and ROI projections.

## 3.3 Platform Access Gating & Upsell Engine (TO BUILD)

### Client Dashboard Redesign

The client dashboard must be restructured from a flat product list into a **platform-tabbed layout**:

```
┌─────────────────────────────────────────────────────┐
│  YOUSELL Dashboard                                  │
├──────────┬──────────┬──────────┬──────────┬──────────┤
│ TikTok   │ Amazon   │ Shopify  │ Pinterest│ Digital  │
│  [LIVE]  │ [LOCKED] │ [LOCKED] │ [LOCKED] │ [LOCKED] │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Unlocked Platform View
Full dashboard: trending products (up to plan limit), score breakdowns, influencer/supplier data, blueprint generation, store integration controls, content engine status.

### Locked Platform View — Upsell Experience
Locked platforms must NOT be blank. Show aggregate stats from real scans to create FOMO:

```
┌───────────────────────────────────────────────────┐
│  Amazon Products                       LOCKED     │
├───────────────────────────────────────────────────┤
│                                                   │
│  23 HOT products found this week                  │
│  Average score: 84.2 / 100                        │
│  Estimated profit range: $12–$47/unit             │
│                                                   │
│  Top trending categories:                         │
│  ========== Home & Kitchen (34%)                  │
│  ========   Health & Beauty (28%)                 │
│  ======     Electronics (19%)                     │
│                                                   │
│  ┌───────────────────────────────────────┐        │
│  │  Unlock Amazon for $19/mo            │        │
│  │  or upgrade to Pro Seller ($149/mo)  │        │
│  │  to get ALL platforms                │        │
│  └───────────────────────────────────────┘        │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Data policy:** Show aggregate stats (count, average score, profit range, category distribution). NEVER show individual product names, scores, or supplier/influencer details on locked platforms. Those are behind the paywall.

**Upsell touchpoints:**
- Click locked tab → unlock CTA
- Hit monthly product limit → "Need more? Add 25 for $9/mo"
- Hit blueprint limit → "Get more for $2.99 each"
- Weekly email digest → "You missed 47 HOT products on Amazon this week"

### Engine Toggle UI

Within each platform tab, show engine status:

```
┌───────────────────────────────────────────────────┐
│  TikTok Engines                                   │
├───────────────────────────────────────────────────┤
│  [ON]  Product Discovery    — 23 products found   │
│  [ON]  Store Integration    — Connected            │
│  [OFF] Marketing & Ads      — Enable for $X/mo    │
│  [ON]  Content Creation     — 12 posts scheduled   │
│  [OFF] Influencer Outreach  — Enable for $X/mo    │
│  [ON]  Analytics            — View dashboard       │
└───────────────────────────────────────────────────┘
```

## 3.4 Client Channel Integrations (TO BUILD)

### Core Principle: NO PASSWORDS, EVER

All integrations use OAuth 2.0 or API keys. Client never enters store/social login credentials on YOUSELL.

### Store Integrations (Product Export)

| Platform | Method | Scopes | Notes |
|----------|--------|--------|-------|
| Shopify | OAuth 2.0 — Shopify App | `write_products`, `read_products`, `read_orders`, `read_fulfillments` | Client installs from Shopify admin. Revocable. Bulk ops support 5 concurrent mutations (API 2026-01). |
| TikTok Shop | OAuth 2.0 — TikTok Shop Open API | Product management, order read | Client authorizes in TikTok Seller Center. |
| Amazon | OAuth 2.0 — SP-API | Listings, catalog, pricing, orders | Client authorizes as Selling Partner app. Requires Professional account ($39.99/mo). |

### Marketing Channel Integrations (Content Distribution)

| Channel | Method | What YOUSELL Can Do |
|---------|--------|-------------------|
| TikTok | TikTok Content Posting API (OAuth 2.0) | Post videos, schedule content |
| Instagram/Facebook | Meta Graph API (OAuth 2.0) | Post images, reels, stories, schedule |
| YouTube | YouTube Data API v3 (OAuth 2.0) | Upload videos, manage playlists |
| Twitter/X | X API v2 (OAuth 2.0) | Post tweets, schedule threads |
| Pinterest | Pinterest API (OAuth 2.0) | Create pins, manage boards |
| LinkedIn | LinkedIn Marketing API (OAuth 2.0) | Post articles, share content |
| Blog/Website | WordPress REST API or Webhook | Push blog posts |
| Email Newsletter | Mailchimp / ConvertKit / Resend API | Send promotional emails |

### Order Tracking Emails (Uses Existing Resend + Railway)

| Platform | Data Source | Method |
|----------|-----------|--------|
| Shopify | Webhooks: `orders/create`, `orders/fulfilled`, `fulfillments/create` | Real-time push |
| TikTok Shop | TikTok Shop API — Order Management | Poll or webhook |
| Amazon | SP-API — Orders API + Shipping API | Poll (Amazon handles most customer comms itself) |

**Automated email sequence (Resend + Railway BullMQ):**
1. Order placed → Instant order confirmation
2. Order shipped → Instant shipping confirmation with tracking number + link
3. In transit → Optional delivery update
4. Delivered → 24hr post-delivery confirmation
5. Post-delivery → 3–5 days later review request with platform-specific review link

Templates are white-labeled with client's store name/branding. Sent from client's verified Resend domain.

### Security

- OAuth tokens stored encrypted in database
- Scoped permissions — minimum access only
- Revocable from YOUSELL dashboard or from the platform directly
- Dashboard shows connected channels with permissions transparency

### Connected Channels Dashboard

```
┌────────────────────────────────────────────────────┐
│  Connected Channels                                │
├────────────────────────────────────────────────────┤
│                                                    │
│  STORES                                            │
│  [x] Shopify — mystore.myshopify.com  [Disconnect] │
│  [ ] TikTok Shop                      [Connect]    │
│  [ ] Amazon Seller                    [Connect]    │
│                                                    │
│  MARKETING CHANNELS                                │
│  [x] TikTok — @myhandle (42K)         [Disconnect] │
│  [x] Instagram — @mybrand (18K)       [Disconnect] │
│  [ ] YouTube                          [Connect]    │
│  [ ] Twitter/X                        [Connect]    │
│  [ ] Pinterest                        [Connect]    │
│  [ ] LinkedIn                         [Connect]    │
│                                                    │
│  EMAIL                                             │
│  [ ] Mailchimp / ConvertKit / Resend  [Connect]    │
│                                                    │
│  Content Engine: ACTIVE                            │
│  Next post: Today 6:00 PM → TikTok                │
│  This week: 12 sent, 8 scheduled                  │
│                                                    │
└────────────────────────────────────────────────────┘
```

## 3.5 Affiliate Engine — Business Model (TO BUILD)

### The Problem
Affiliate programs pay on signups/conversions, NOT marketing activity. YOUSELL does NOT earn commissions from client activity. The client keeps 100%.

### The Model
Client pays a subscription for the platform that:
1. Discovers and curates high-commission affiliate programs (continuously updated)
2. AI-generates promotional content (reviews, comparisons, social posts, video scripts)
3. Auto-distributes content across client's connected marketing channels
4. Tracks performance (clicks, estimated signups, estimated commissions)
5. Alerts on new opportunities, rate changes, seasonal promos

### Retention Design (Anti-Churn)
The database is one-time value. The automation is ongoing value:
- **Daily fresh content** — stops immediately on cancel
- **Connected channel automation** — stops on cancel = manual posting
- **Weekly new opportunities** — stops on cancel = stale info
- **Performance optimization** — AI learns what converts, lost on cancel
- **Trend-aware content** — references current viral moments, can't be stockpiled
- **Seasonal campaigns** — Black Friday, New Year pushes

## 3.6 Dual-Platform Architecture (TO BUILD — Phase 2+)

### Target State
Two separable applications sharing one database:

```
┌─────────────────────┐     ┌──────────────────────┐
│  YOUSELL Intel      │     │  YOUSELL Dashboard   │
│  admin.yousell.online│     │  app.yousell.online  │
│                     │     │                      │
│  - Scan control     │     │  - View products     │
│  - Score products   │     │  - Score breakdowns  │
│  - Manage clients   │     │  - Blueprints        │
│  - Allocate data    │     │  - Subscription mgmt │
│  - Full backend     │     │  - Channel mgmt      │
│                     │     │  - Engine toggles    │
└─────────┬───────────┘     └───────────┬──────────┘
          │                             │
          └──────────────┬──────────────┘
                         │
                ┌────────┴─────────┐
                │  Shared Supabase │
                │  + Redis + BullMQ│
                └──────────────────┘
```

### Implementation Approach

**Phase 1 (Now):** Single codebase with clean boundaries:
```
/src/app/admin/*         — Intel features (no dashboard imports)
/src/app/dashboard/*     — Dashboard features (no admin imports)
/src/lib/shared/*        — Shared utilities (plan-config, supabase, types)
/src/lib/admin/*         — Admin-only utilities
/src/lib/dashboard/*     — Dashboard-only utilities
```

**Phase 2 (Later):** Extract to monorepo if needed:
```
/packages/shared/        — Common types, configs, DB client
/apps/intel/             — Admin/intelligence app
/apps/dashboard/         — Client dashboard app
```

### Super Admin Toggle
A `platform_config` table with a `deployment_mode` key (`linked` | `standalone_intel` | `standalone_dashboard`) controls whether the apps work together or independently. This enables selling each half as a separate SaaS product.

---

# PART 4: COMPLETE SYSTEM ARCHITECTURE (TARGET STATE)

```
                    ┌──────────────────────────────┐
                    │     yousell.online            │
                    │     (Marketing Site)          │
                    │     Stripe Checkout           │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │     Stripe Webhooks           │
                    │     /api/webhooks/stripe       │
                    └──────────────┬───────────────┘
                                   │
          ┌────────────────────────┴────────────────────────┐
          │                                                │
┌─────────┴─────────────┐                ┌─────────────────┴────────────┐
│  ADMIN APP             │                │  CLIENT DASHBOARD             │
│  admin.yousell.online  │                │  app.yousell.online           │
│                        │                │                               │
│  Scan Control          │                │  Platform Tabs (gated)        │
│  Product Management    │                │  Engine Toggles               │
│  Client Management     │                │  Connected Channels           │
│  Automation Jobs       │                │  Subscription Management      │
│  Analytics             │                │  Content Calendar             │
│  Super Admin Config    │                │  Order Tracking               │
│                        │                │  Affiliate Dashboard          │
└─────────┬──────────────┘                └───────────────┬────────────────┘
          │                                               │
          └────────────────────┬──────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │       SHARED BACKEND         │
                │                              │
                │  Supabase PostgreSQL          │
                │  Supabase Auth + RLS          │
                │  Supabase Realtime            │
                │                              │
                │  Express API (Railway)        │
                │  BullMQ Job Queue (Redis)     │
                │                              │
                │  Resend (Email)               │
                │  Anthropic Claude (AI)        │
                │  Apify (Scraping)             │
                └──────────────┬──────────────┘
                               │
          ┌────────────────────┴────────────────────┐
          │                                        │
┌─────────┴──────────┐              ┌──────────────┴────────────┐
│  STORE APIs         │              │  MARKETING CHANNEL APIs    │
│                     │              │                            │
│  Shopify GraphQL    │              │  TikTok Content API        │
│  TikTok Shop API    │              │  Meta Graph API            │
│  Amazon SP-API      │              │  YouTube Data API          │
│                     │              │  X API v2                  │
│  Webhooks IN:       │              │  Pinterest API             │
│  - orders/create    │              │  LinkedIn Marketing API    │
│  - orders/fulfilled │              │  WordPress REST API        │
│  - fulfillments     │              │  Mailchimp/ConvertKit API  │
└─────────────────────┘              └─────────────────────────────┘
```

---

# PART 5: DATABASE SCHEMA CHANGES

## 5.1 New Tables Required

```sql
-- ============================================================
-- SUBSCRIPTION MANAGEMENT
-- ============================================================
CREATE TABLE client_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT NOT NULL CHECK (plan IN ('explorer', 'seller', 'pro_seller', 'agency')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing', 'suspended')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE client_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PLATFORM ACCESS CONTROL
-- ============================================================
CREATE TABLE client_platform_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'amazon', 'shopify', 'pinterest', 'digital', 'ai_affiliates')),
    unlocked BOOLEAN DEFAULT false,
    source TEXT NOT NULL CHECK (source IN ('plan_included', 'addon_purchased', 'admin_granted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(client_id, platform)
);
ALTER TABLE client_platform_access ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ENGINE CONFIGURATION PER CLIENT PER PLATFORM
-- ============================================================
CREATE TABLE client_engine_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'amazon', 'shopify', 'pinterest', 'digital', 'ai_affiliates')),
    engine TEXT NOT NULL CHECK (engine IN ('discovery', 'store_integration', 'marketing_ads', 'content_creation', 'influencer_outreach', 'supplier_intelligence', 'ai_affiliate', 'analytics')),
    enabled BOOLEAN DEFAULT false,
    tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'premium')),
    limits JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(client_id, platform, engine)
);
ALTER TABLE client_engine_config ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USAGE TRACKING
-- ============================================================
CREATE TABLE client_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    products_viewed INTEGER DEFAULT 0,
    blueprints_generated INTEGER DEFAULT 0,
    scans_triggered INTEGER DEFAULT 0,
    content_pieces_generated INTEGER DEFAULT 0,
    influencer_outreach_sent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(client_id, period_start)
);
ALTER TABLE client_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ADD-ON PURCHASES
-- ============================================================
CREATE TABLE client_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    addon_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    stripe_item_id TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE client_addons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CONNECTED CHANNELS (OAUTH TOKENS)
-- ============================================================
CREATE TABLE client_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'shopify_store', 'tiktok_shop', 'amazon_seller',
        'tiktok_social', 'instagram', 'facebook', 'youtube',
        'twitter', 'pinterest_social', 'linkedin',
        'wordpress', 'mailchimp', 'convertkit', 'resend_custom'
    )),
    channel_name TEXT,           -- display name (e.g., "@myhandle", "mystore.myshopify.com")
    access_token_encrypted TEXT, -- encrypted OAuth token
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[],               -- granted permissions
    metadata JSONB DEFAULT '{}', -- platform-specific data (follower count, etc.)
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    disconnected_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
    UNIQUE(client_id, channel_type)
);
ALTER TABLE client_channels ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CONTENT QUEUE (FOR SCHEDULED POSTS)
-- ============================================================
CREATE TABLE content_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES client_channels(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('social_post', 'blog_post', 'email', 'ad_creative', 'affiliate_promo', 'video_script')),
    platform TEXT NOT NULL,
    title TEXT,
    body TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',    -- platform-specific fields
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_content_queue_schedule ON content_queue(scheduled_at, status);

-- ============================================================
-- ORDER TRACKING
-- ============================================================
CREATE TABLE client_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES client_channels(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    external_order_id TEXT NOT NULL,
    customer_email TEXT,
    customer_name TEXT,
    order_total DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    tracking_number TEXT,
    tracking_url TEXT,
    carrier TEXT,
    order_status TEXT DEFAULT 'placed' CHECK (order_status IN ('placed', 'shipped', 'in_transit', 'delivered', 'cancelled', 'returned')),
    emails_sent JSONB DEFAULT '[]',  -- track which emails were sent
    placed_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(client_id, platform, external_order_id)
);
ALTER TABLE client_orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_client_orders_status ON client_orders(client_id, order_status);

-- ============================================================
-- PLATFORM CONFIG (SUPER ADMIN)
-- ============================================================
CREATE TABLE platform_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO platform_config (key, value) VALUES
    ('deployment_mode', '"linked"'),
    ('intel_app_url', '"https://admin.yousell.online"'),
    ('dashboard_app_url', '"https://app.yousell.online"'),
    ('shared_auth', 'true'),
    ('cross_platform_links', 'true')
ON CONFLICT (key) DO NOTHING;
```

## 5.2 Modifications to Existing Tables

```sql
-- Update clients table: change plan tiers
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_plan_check;
ALTER TABLE clients ADD CONSTRAINT clients_plan_check
    CHECK (plan IN ('explorer', 'seller', 'pro_seller', 'agency'));

-- Add selected platforms to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS selected_platforms TEXT[] DEFAULT '{}';
```

---

# PART 6: API SPECIFICATIONS

## 6.1 New API Routes Required

### Stripe Webhooks
```
POST /api/webhooks/stripe
    — Handles all Stripe events (checkout, subscription, invoice)
    — Verifies webhook signature
    — Provisions/updates/cancels accounts
```

### Subscription Management
```
GET  /api/dashboard/subscription        — Get current plan, usage, limits
POST /api/dashboard/subscription/upgrade — Initiate plan upgrade (returns Stripe Checkout URL)
POST /api/dashboard/subscription/cancel  — Cancel subscription
POST /api/dashboard/subscription/addon   — Add/remove add-on
```

### Channel Management
```
GET  /api/dashboard/channels             — List connected channels
POST /api/dashboard/channels/connect     — Initiate OAuth flow for a channel
POST /api/dashboard/channels/callback    — OAuth callback handler
POST /api/dashboard/channels/disconnect  — Revoke channel access
```

### Engine Management
```
GET  /api/dashboard/engines              — Get engine configs for all platforms
POST /api/dashboard/engines/toggle       — Enable/disable an engine
```

### Content Engine
```
GET  /api/dashboard/content              — Get content queue/calendar
POST /api/dashboard/content/generate     — Generate content for a product/platform
POST /api/dashboard/content/schedule     — Schedule content for posting
```

### Order Tracking
```
POST /api/webhooks/shopify               — Shopify order/fulfillment webhooks
POST /api/webhooks/tiktok-shop           — TikTok Shop order webhooks
GET  /api/dashboard/orders               — Get order history + tracking status
```

### Platform Aggregate Stats (for locked platform previews)
```
GET  /api/dashboard/platform-stats/:platform — Aggregate stats (product count, avg score, etc.)
```

### Admin Overrides
```
POST /api/admin/engine-override          — Override client engine access
GET  /api/admin/engine-analytics         — View engine usage across all clients
POST /api/admin/platform-config          — Update super admin config
```

---

# PART 7: THIRD-PARTY INTEGRATIONS

## 7.1 Integration Priority & Feasibility

| Integration | Priority | Feasibility | Notes |
|------------|----------|-------------|-------|
| Stripe (billing) | P0 — CRITICAL | High | Well-documented API, straightforward webhooks |
| Shopify App (store integration) | P0 — CRITICAL | High | GraphQL Admin API, bulk ops, app review required |
| Resend (order tracking emails) | P0 — CRITICAL | Already built | Extend existing email.ts |
| TikTok Shop API (store integration) | P1 — HIGH | Medium | API access requires application, category mapping complex |
| Amazon SP-API (store integration) | P1 — HIGH | Medium | OAuth flow, Professional account required, category restrictions |
| Meta Graph API (Instagram/FB) | P1 — HIGH | Medium | App review required (~2–4 weeks), rate limits |
| TikTok Content API (posting) | P1 — HIGH | Medium | API access application needed |
| YouTube Data API (posting) | P2 — MEDIUM | High | Google Cloud project, OAuth, quotas |
| X API v2 (posting) | P2 — MEDIUM | Medium | Paid API tiers, rate limits |
| Pinterest API (posting) | P2 — MEDIUM | High | Developer account required |
| LinkedIn Marketing API (posting) | P3 — LOW | Medium | Business verification required |
| WordPress REST API (blog) | P3 — LOW | High | Application password or API key |
| Mailchimp/ConvertKit API (email) | P3 — LOW | High | API key based, straightforward |

## 7.2 Apify Actors (Already Integrated)

| Actor | Purpose | Platform |
|-------|---------|----------|
| `clockworks~tiktok-scraper` | Product discovery | TikTok |
| `junglee~amazon-bestsellers-scraper` | Product discovery | Amazon |
| `clearpath~shop-by-shopify-product-scraper` | Product discovery | Shopify |
| `alexey~pinterest-crawler` | Product discovery | Pinterest |
| `epctex~gumroad-scraper` | Product discovery | Digital |
| `epctex~alibaba-scraper` | Supplier discovery | Alibaba |
| `apify~instagram-profile-scraper` | Influencer discovery | Instagram |
| `emastra~google-trends-scraper` | Trend analysis | Google |

---

# PART 8: IMPLEMENTATION PHASES

## Phase 1: Foundation & Subscription (Weeks 1–3)

| # | Task | Dependencies | Effort |
|---|------|-------------|--------|
| 1.1 | Migrate plan tiers in DB (starter→explorer, growth→seller, professional→pro_seller, enterprise→agency) | None | Small |
| 1.2 | Create new DB tables (client_subscriptions, client_platform_access, client_engine_config, client_usage, client_addons, platform_config) | 1.1 | Medium |
| 1.3 | Build `/src/lib/plan-config.ts` with full plan limits and engine configs | 1.1 | Small |
| 1.4 | Create Stripe products/prices matching new tiers in Stripe Dashboard | 1.1 | Small |
| 1.5 | Build POST `/api/webhooks/stripe` — handle checkout.session.completed, subscription.updated, subscription.deleted, invoice.payment_failed | 1.2, 1.4 | Large |
| 1.6 | Build account provisioning logic — create user, set access, allocate products, send welcome email | 1.2, 1.5 | Large |
| 1.7 | Build GET `/api/dashboard/subscription` — return plan, usage, limits | 1.2, 1.3 | Medium |
| 1.8 | Build subscription management UI in dashboard (view plan, upgrade, cancel) | 1.7 | Medium |

## Phase 2: Platform Gating & Engine Toggles (Weeks 4–5)

| # | Task | Dependencies | Effort |
|---|------|-------------|--------|
| 2.1 | Redesign client dashboard with platform-tabbed layout | Phase 1 | Large |
| 2.2 | Implement locked platform view with aggregate stats + upsell CTAs | 2.1 | Medium |
| 2.3 | Build engine toggle UI per platform | 2.1 | Medium |
| 2.4 | Build GET/POST `/api/dashboard/engines` — config retrieval and toggle | Phase 1 | Medium |
| 2.5 | Implement usage tracking middleware (increment counters on API calls) | Phase 1 | Medium |
| 2.6 | Build limit enforcement (product cap, blueprint cap, data delay) | 2.5 | Medium |
| 2.7 | Build add-on purchase flow (extra platform, extra products, etc.) | Phase 1 | Medium |

## Phase 3: Channel Integrations & Store Export (Weeks 6–8)

| # | Task | Dependencies | Effort |
|---|------|-------------|--------|
| 3.1 | Create client_channels table + encrypted token storage | Phase 1 | Medium |
| 3.2 | Build "Connected Channels" dashboard section | 3.1 | Medium |
| 3.3 | Implement Shopify OAuth App (register, auth flow, token management) | 3.1 | Large |
| 3.4 | Build Shopify product export (GraphQL bulk mutations) | 3.3 | Large |
| 3.5 | Implement TikTok Shop OAuth + product push | 3.1 | Large |
| 3.6 | Implement Amazon SP-API OAuth + listing creation | 3.1 | Large |
| 3.7 | Build order tracking webhook handlers (Shopify, TikTok, Amazon) | 3.3–3.6 | Large |
| 3.8 | Build post-purchase email sequence (Resend + Railway BullMQ) | 3.7 | Medium |

## Phase 4: Content & Marketing Engine (Weeks 9–11)

| # | Task | Dependencies | Effort |
|---|------|-------------|--------|
| 4.1 | Build content generation API (Claude AI → product descriptions, social posts, ad copy) | Phase 1 | Large |
| 4.2 | Build content_queue table + scheduling system | 4.1 | Medium |
| 4.3 | Implement social media posting (TikTok Content API, Meta Graph API) | Phase 3 | Large |
| 4.4 | Build content calendar UI in dashboard | 4.2 | Medium |
| 4.5 | Build influencer one-click outreach (send via Resend, track in outreach_emails) | Existing schema | Medium |
| 4.6 | Build influencer follow-up sequences (Railway scheduler + Resend) | 4.5 | Medium |
| 4.7 | Build affiliate content automation (AI-generated reviews, social posts for affiliate promos) | 4.1 | Medium |

## Phase 5: Analytics, Polish & Separation (Weeks 12–14)

| # | Task | Dependencies | Effort |
|---|------|-------------|--------|
| 5.1 | Build cross-platform analytics dashboard (sales, profit, ROI per platform) | Phase 3 | Large |
| 5.2 | Build weekly email digest — upsell engine (locked platform teasers) | Phase 2 | Medium |
| 5.3 | Refactor codebase into admin/dashboard/shared boundaries | All | Large |
| 5.4 | Build super admin config panel (deployment_mode, branding, feature flags) | 5.3 | Medium |
| 5.5 | Implement API access for Pro Seller/Agency tiers (read/write endpoints) | Phase 1 | Medium |
| 5.6 | Load testing and optimization | All | Medium |

## Phase 6: Marketing Site & Launch (Weeks 15–16)

| # | Task | Dependencies | Effort |
|---|------|-------------|--------|
| 6.1 | Update yousell.online pricing page with new tiers + engine breakdown | Phase 1 | Medium |
| 6.2 | Add interactive plan comparison tool | 6.1 | Medium |
| 6.3 | Connect all CTAs to Stripe Checkout sessions | Phase 1 | Small |
| 6.4 | Build landing pages per platform (TikTok page, Amazon page, etc.) | 6.1 | Medium |
| 6.5 | A/B testing on pricing presentation | 6.1 | Small |

---

# APPENDIX A: FILE REFERENCE

## Frontend Structure (`/src`)

### App Pages
```
/src/app/admin/               — 22 admin pages (scan, products, tiktok, amazon, shopify,
                                 pinterest, digital, affiliates, influencers, suppliers,
                                 competitors, blueprints, clients, allocate, analytics,
                                 notifications, import, settings, setup, trends, login)
/src/app/dashboard/            — 3 client pages (dashboard, products, requests)
/src/app/login/                — Client login
/src/app/api/admin/            — 20 admin API routes
/src/app/api/dashboard/        — 2 client API routes
/src/app/api/auth/             — 2 auth routes (callback, signout)
```

### Libraries
```
/src/lib/supabase.ts           — Supabase singleton client
/src/lib/supabase/admin.ts     — Admin Supabase client (service role)
/src/lib/supabase/client.ts    — Browser Supabase client
/src/lib/supabase/server.ts    — Server-side Supabase client (SSR)
/src/lib/email.ts              — Resend email integration
/src/lib/auth/get-user.ts      — Auth user retrieval
/src/lib/auth/roles.ts         — Role checking utilities
/src/lib/scoring/composite.ts  — Composite scoring engine
/src/lib/scoring/profitability.ts — Profit score calculator
/src/lib/providers/config.ts   — All API keys and provider config
/src/lib/providers/tiktok/     — TikTok scraping provider
/src/lib/providers/amazon/     — Amazon scraping provider
/src/lib/providers/shopify/    — Shopify scraping provider
/src/lib/providers/pinterest/  — Pinterest scraping provider
/src/lib/providers/digital/    — Digital products provider
/src/lib/providers/affiliate/  — Affiliate programs provider
/src/lib/providers/influencer/ — Influencer discovery provider
/src/lib/providers/supplier/   — Supplier discovery provider
/src/lib/providers/trends/     — Google Trends provider
/src/lib/types/database.ts     — Database type definitions
/src/lib/types/product.ts      — Product type definitions
```

## Backend Structure (`/backend/src`)
```
/backend/src/index.ts          — Express server (port 4000)
/backend/src/worker.ts         — BullMQ job worker
/backend/src/lib/queue.ts      — BullMQ queue configuration
/backend/src/lib/supabase.ts   — Backend Supabase client
/backend/src/lib/email.ts      — Backend Resend integration
/backend/src/lib/scoring.ts    — Backend scoring logic
/backend/src/lib/providers.ts  — Backend provider utilities
/backend/src/lib/mock-data.ts  — Development mock data
```

## Configuration Files
```
/netlify.toml                  — Netlify deployment config
/package.json                  — Frontend dependencies
/backend/package.json          — Backend dependencies
/backend/railway.toml          — Railway deployment config
/supabase/migrations/005_complete_schema.sql — Full database schema
/.env.local.example            — Environment variable template
/CLAUDE.md                     — Project context for AI development
```

---

# APPENDIX B: ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Backend (Railway)
NEXT_PUBLIC_BACKEND_URL=
RAILWAY_API_SECRET=
REDIS_URL=
PORT=4000
FRONTEND_URL=https://admin.yousell.online

# Stripe (NEW — to be configured)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI
ANTHROPIC_API_KEY=

# Email
RESEND_API_KEY=

# Scraping
APIFY_API_TOKEN=

# Platform Provider Keys
TIKTOK_API_KEY=
AMAZON_PA_API_KEY=
PINTEREST_API_KEY=
PRODUCT_HUNT_API_KEY=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
YOUTUBE_API_KEY=
SERPAPI_KEY=

# Provider Selection
TIKTOK_PROVIDER=apify
AMAZON_PROVIDER=pa_api
INFLUENCER_PROVIDER=ainfluencer
SUPPLIER_PROVIDER=apify
TRENDS_PROVIDER=pytrends
SHOPIFY_PROVIDER=apify
PINTEREST_PROVIDER=apify

# OAuth Client IDs/Secrets (NEW — to be configured per integration)
SHOPIFY_APP_CLIENT_ID=
SHOPIFY_APP_CLIENT_SECRET=
TIKTOK_SHOP_APP_KEY=
TIKTOK_SHOP_APP_SECRET=
AMAZON_SP_API_CLIENT_ID=
AMAZON_SP_API_CLIENT_SECRET=
META_APP_ID=
META_APP_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
PINTEREST_APP_ID=
PINTEREST_APP_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# URLs
NEXT_PUBLIC_SITE_URL=https://admin.yousell.online
NEXT_PUBLIC_ADMIN_URL=https://admin.yousell.online
```

---

# APPENDIX C: KEY DECISIONS & BUSINESS RULES

## C.1 Pricing Model
Final pricing is NOT determined yet. The document `/ai/pricing_strategy_prompt.md` contains a comprehensive prompt that must be executed to produce the final pricing strategy. It covers per-platform market research, engine-based pricing, bundle discounts, and ROI projections.

**Preliminary tiers (subject to change):**
- Explorer: ~$29/mo (1 platform, basic engines)
- Seller: ~$79/mo (2 platforms, core engines)
- Pro Seller: ~$149/mo (all platforms, all engines)
- Agency: ~$299/mo (unlimited, sub-accounts, API access)

## C.2 Affiliate Engine Revenue Model
- YOUSELL earns from SUBSCRIPTION FEES ONLY
- Client keeps 100% of their affiliate commissions
- YOUSELL does NOT take any cut of client affiliate earnings
- Value is in the automation: discovery, content creation, distribution
- Retention is driven by daily fresh content + connected channel automation

## C.3 Data Visibility Philosophy
- Be GENEROUS with data shown to clients
- Even cheapest plan sees impressive data
- Paywall is on AUTOMATION and ACTIONS, not on viewing data
- Locked platforms show aggregate stats (FOMO-driven), not blank walls

## C.4 Security Requirements
- No client passwords stored, ever — OAuth 2.0 for all integrations
- OAuth tokens encrypted at rest in database
- Scoped permissions only (minimum access)
- Client can revoke any integration from YOUSELL dashboard or from the platform itself
- All webhook endpoints verify signatures (Stripe, Shopify, etc.)

## C.5 Infrastructure Constraints
- Frontend deploys to Netlify (SSR via @netlify/plugin-nextjs)
- Backend deploys to Railway (Express + BullMQ)
- No long-running processes on Netlify — background jobs go through Railway/BullMQ
- Supabase handles auth, database, and realtime — use existing singleton clients

---

**END OF DOCUMENT**

*This document was generated on 2026-03-12 as a comprehensive developer handoff. For the latest pricing strategy research prompt, see `/ai/pricing_strategy_prompt.md`. For the initial strategy draft, see `/ai/platform_strategy.md`.*
