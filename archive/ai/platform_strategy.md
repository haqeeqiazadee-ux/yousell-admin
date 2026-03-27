# YOUSELL Platform Strategy & Pricing Overhaul

**Document Type:** Research & Strategy (DO NOT EXECUTE — awaiting approval)
**Date:** 2026-03-12
**Status:** DRAFT — For Review

---

## TABLE OF CONTENTS

1. [Current State Analysis](#1-current-state-analysis)
2. [Market Research & Competitive Landscape](#2-market-research--competitive-landscape)
3. [Proposed Package Structure & Pricing](#3-proposed-package-structure--pricing)
4. [Frontend-to-Backend Linking Architecture](#4-frontend-to-backend-linking-architecture)
5. [Access Control & Upsell Engine](#5-access-control--upsell-engine)
6. [Dual-Platform SaaS Architecture](#6-dual-platform-saas-architecture)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Cost Analysis & Unit Economics](#8-cost-analysis--unit-economics)

---

## 1. CURRENT STATE ANALYSIS

### What Exists Today

**admin.yousell.online** (this codebase)
- Full admin dashboard with product discovery across 5 channels (TikTok, Amazon, Shopify, Pinterest, Digital)
- Client dashboard at `/dashboard` with plan-based product visibility
- 4 plan tiers: Starter (3 products), Growth (10), Professional (25), Enterprise (50)
- Product allocation system (admin manually allocates products to clients)
- AI scoring engine (trend 40% + viral 35% + profit 25%)
- BullMQ job queue for background scans
- Supabase auth with role-based access (admin/client)

**yousell.online** (separate marketing site on Netlify)
- Landing page selling managed services (NOT SaaS subscriptions)
- Current pricing is agency-style:
  - Amazon FBA: $997/mo recurring
  - TikTok Shop: $997 one-time setup
  - Shopify Store: $1,497 one-time setup
  - AI Bundle (all 3): $2,997 one-time
- Dark luxury design, countdown timer, testimonials

### The Core Problem

The current pricing model is **agency pricing** (high-ticket, low-volume), but the backend is built as a **SaaS product** (scalable, self-service). These are fundamentally misaligned:

| Aspect | Current (Agency) | Should Be (SaaS) |
|--------|------------------|-------------------|
| Price point | $997–$2,997 | $29–$299/mo |
| Customer volume | 5–20 clients | 200–2,000+ subscribers |
| Delivery | Manual/managed | Automated/self-service |
| Scalability | Linear (needs staff) | Exponential (software scales) |
| Revenue model | One-time + retainer | Recurring MRR |

**The backend already does the SaaS work.** The pricing and frontend just need to match reality.

---

## 2. MARKET RESEARCH & COMPETITIVE LANDSCAPE

### Direct Competitors (Product Research SaaS)

| Tool | Starting Price | Focus | Key Differentiator |
|------|---------------|-------|--------------------|
| Jungle Scout | $49/mo | Amazon FBA | Beginner-friendly, established brand |
| Helium 10 | $99/mo ($129 monthly) | Amazon + Walmart + TikTok | Most comprehensive feature set |
| Sell The Trend | $29.97/mo | Dropshipping/multi-platform | Affordable, NEXUS research engine |
| Viral Launch | $69/mo | Amazon FBA | Market intelligence scoring |
| ZIK Analytics | $29.99/mo | Amazon/eBay research | Budget-friendly product validation |
| WinningHunter | $49/mo | TikTok/Facebook ads spy | Ad-spend tracking, viral detection |
| Minea | $49/mo | TikTok/FB ad spy | Real-time campaign scanning |

### Adjacent Competitors (Managed E-commerce Services)

| Service Type | Typical Monthly | Model |
|-------------|----------------|-------|
| TikTok Shop agency management | $1,000–$5,000/mo | Managed service |
| Amazon FBA agency management | $1,000–$3,000/mo | Managed service + % of sales |
| Multi-channel agency | $2,000–$10,000/mo | Full-service retainer |

### Key Insights from Market Research

1. **The $29–$99/mo sweet spot** is where volume lives. Helium 10 lost customers when they raised prices above $99. Jungle Scout grew by staying at $49.
2. **Multi-platform is the differentiator.** Most tools focus on ONE platform. YOUSELL already covers 5 channels — this is the competitive moat.
3. **AI-powered scoring is premium.** No competitor offers a unified scoring engine across TikTok, Amazon, Shopify, Pinterest AND digital products. This alone justifies a premium over basic research tools.
4. **Hybrid pricing wins in 2026.** Base subscription + usage-based components (extra products, extra scans) captures more value without scaring away new customers.
5. **Social commerce is 20% of e-commerce now.** TikTok Shop tools are undersupplied relative to demand.

### YOUSELL's Unique Value Proposition

Unlike any single competitor, YOUSELL offers:
- **Multi-platform product discovery** (5 channels vs competitors' 1–2)
- **AI scoring engine** with trend + viral + profit analysis
- **Launch blueprints** (AI-generated go-to-market plans)
- **Influencer & supplier intelligence** built in
- **Real-time dashboard** with Supabase Realtime

This positions YOUSELL between a **product research tool** ($29–$99/mo) and a **managed service** ($1,000+/mo), at a price point of **$49–$299/mo** — delivering managed-service-level intelligence at self-service prices.

---

## 3. PROPOSED PACKAGE STRUCTURE & PRICING

### Philosophy: Volume Over Margin

Target: **500+ subscribers in Year 1** at an average revenue per user (ARPU) of ~$89/mo = **$44,500 MRR**

This beats the current model's theoretical max of ~20 clients x $997 = $19,940 MRR, while being far more scalable.

### Tier Structure

#### TIER 1: Explorer — $29/mo ($24/mo annual)
**Target:** Beginners, side-hustlers, people testing the waters
**Positioning:** "See what's trending before you invest"

| Feature | Limit |
|---------|-------|
| Platform access | 1 platform (choose: TikTok, Amazon, or Shopify) |
| Trending products visible | 10/month |
| Product score visibility | Final score only (no breakdown) |
| AI launch blueprints | 0 |
| Influencer data | Hidden (preview teaser shown) |
| Supplier data | Hidden (preview teaser shown) |
| Scan frequency | Daily (shared pool) |
| Data refresh | 24-hour delay |
| Support | Community/email |

#### TIER 2: Seller — $79/mo ($65/mo annual)
**Target:** Active sellers on 1–2 platforms, the core customer
**Positioning:** "Everything you need to find and launch winners"

| Feature | Limit |
|---------|-------|
| Platform access | 2 platforms (choose any 2) |
| Trending products visible | 50/month |
| Product score visibility | Full breakdown (trend + viral + profit) |
| AI launch blueprints | 3/month |
| Influencer data | Top 10 per product |
| Supplier data | Top 5 per product |
| Competitor analysis | Basic (store-level) |
| Scan frequency | Every 12 hours |
| Data refresh | 6-hour delay |
| Support | Email (24hr response) |

#### TIER 3: Pro Seller — $149/mo ($125/mo annual)
**Target:** Serious multi-platform sellers, small agencies
**Positioning:** "Multi-channel intelligence for serious sellers"

| Feature | Limit |
|---------|-------|
| Platform access | ALL platforms (TikTok, Amazon, Shopify, Pinterest, Digital) |
| Trending products visible | 150/month |
| Product score visibility | Full breakdown + historical trends |
| AI launch blueprints | 10/month |
| Influencer data | Full list with contact info |
| Supplier data | Full list with pricing |
| Competitor analysis | Deep (product-level tracking) |
| Affiliate program data | Full access |
| Scan frequency | Every 6 hours |
| Data refresh | Real-time |
| Support | Priority email (4hr response) |
| API access | Read-only |

#### TIER 4: Agency — $299/mo ($249/mo annual)
**Target:** Agencies managing multiple clients, power users
**Positioning:** "Run your agency on YOUSELL intelligence"

| Feature | Limit |
|---------|-------|
| Platform access | ALL platforms |
| Trending products visible | Unlimited |
| Product score visibility | Full + custom scoring weights |
| AI launch blueprints | Unlimited |
| Influencer data | Full + outreach templates |
| Supplier data | Full + bulk export |
| Competitor analysis | Deep + alerts |
| Affiliate program data | Full + commission tracking |
| Scan frequency | Every 3 hours + on-demand scans |
| Data refresh | Real-time |
| Sub-accounts | Up to 5 client seats |
| White-label reports | Yes |
| Support | Dedicated Slack channel |
| API access | Full read/write |

### Add-On Marketplace (Usage-Based Revenue)

| Add-On | Price | Description |
|--------|-------|-------------|
| Extra platform unlock | $19/mo each | Add a platform without upgrading tier |
| Extra products pack | $9/mo per 25 products | Increase monthly product limit |
| On-demand scan | $4.99 each | Trigger a scan outside your schedule |
| Extra blueprint | $2.99 each | Generate additional AI launch blueprints |
| Extra sub-account | $29/mo each | Additional client seats (Agency tier) |

### Annual Billing Incentive

All tiers offer ~17% discount on annual billing. This:
- Reduces churn (commitment)
- Improves cash flow (upfront payment)
- Increases LTV by 30–40%

### Comparison to Competitors

| | YOUSELL Explorer | Jungle Scout Starter | Helium 10 Platinum | Sell The Trend Essential |
|---|---|---|---|---|
| Price | **$29/mo** | $49/mo | $99/mo | $39.97/mo |
| Platforms | 1 | Amazon only | Amazon + Walmart | Multi (dropship) |
| AI scoring | Yes | No | No | Basic |
| Launch blueprints | No | No | No | No |

| | YOUSELL Pro Seller | Helium 10 Diamond | Full agency service |
|---|---|---|---|
| Price | **$149/mo** | $229/mo | $2,000–$5,000/mo |
| Platforms | ALL 5 | Amazon + Walmart + TikTok | Varies |
| AI scoring | Full breakdown | Basic | Manual analysis |
| Launch blueprints | 10/mo | 0 | Custom (slow) |
| Influencer data | Full | Limited | Manual outreach |

**YOUSELL undercuts Helium 10 on price while offering MORE platforms and AI intelligence.** The Agency tier delivers near-agency-level intelligence at 5–10% of agency cost.

---

## 4. FRONTEND-TO-BACKEND LINKING ARCHITECTURE

### How Package Signup Connects to Backend Services

#### Flow: Client Signs Up → Gets Access

```
yousell.online (Marketing Site)
    │
    ├── User clicks "Get Started" on a package
    │
    ▼
Stripe Checkout / Payment Link
    │
    ├── Stripe webhook fires on successful payment
    │
    ▼
Webhook Handler (Next.js API route on admin.yousell.online)
    │
    ├── 1. Creates Supabase auth user (role: client)
    ├── 2. Creates `clients` record with plan tier
    ├── 3. Creates `client_subscriptions` record (new table)
    ├── 4. Sets platform access flags based on plan
    ├── 5. Triggers initial product allocation job
    ├── 6. Sends welcome email via Resend
    │
    ▼
Client redirected to admin.yousell.online/dashboard
    │
    ├── Dashboard shows ONLY their unlocked platforms
    ├── Products auto-allocated based on plan limits
    ├── Locked platforms shown with upgrade CTAs
    │
    ▼
Ongoing: Automation scheduler refreshes products per plan schedule
```

#### New Database Tables Required

```sql
-- Subscription management
CREATE TABLE client_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT CHECK (plan IN ('explorer', 'seller', 'pro_seller', 'agency')),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
    status TEXT CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform access control per client
CREATE TABLE client_platform_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    platform TEXT CHECK (platform IN ('tiktok', 'amazon', 'shopify', 'pinterest', 'digital')),
    unlocked BOOLEAN DEFAULT false,
    source TEXT CHECK (source IN ('plan_included', 'addon_purchased', 'admin_granted')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, platform)
);

-- Usage tracking for limits
CREATE TABLE client_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    products_viewed INTEGER DEFAULT 0,
    blueprints_generated INTEGER DEFAULT 0,
    scans_triggered INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add-on purchases
CREATE TABLE client_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    addon_type TEXT,
    quantity INTEGER DEFAULT 1,
    stripe_item_id TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Plan-to-Feature Mapping (Config-Driven)

Instead of hardcoding limits, store them in a config table or JSON:

```typescript
// /src/lib/plan-config.ts
export const PLAN_LIMITS = {
  explorer: {
    platforms_included: 1,
    products_per_month: 10,
    blueprints_per_month: 0,
    score_detail: 'final_only',         // vs 'full_breakdown' vs 'full_with_history'
    influencer_access: 'hidden',         // vs 'top_10' vs 'full' vs 'full_with_outreach'
    supplier_access: 'hidden',           // vs 'top_5' vs 'full' vs 'full_with_export'
    competitor_access: 'none',           // vs 'basic' vs 'deep' vs 'deep_with_alerts'
    scan_interval_hours: 24,
    data_delay_hours: 24,
    sub_accounts: 0,
    api_access: false,
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
  },
  pro_seller: {
    platforms_included: 5,  // all
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
  },
  agency: {
    platforms_included: 5,  // all
    products_per_month: -1,  // unlimited
    blueprints_per_month: -1,  // unlimited
    score_detail: 'full_with_history',
    influencer_access: 'full_with_outreach',
    supplier_access: 'full_with_export',
    competitor_access: 'deep_with_alerts',
    scan_interval_hours: 3,
    data_delay_hours: 0,
    sub_accounts: 5,
    api_access: 'full',
  },
} as const;
```

#### Automatic Product Allocation Logic

When a client subscribes, the system should:

1. **Determine which platforms they have access to** (from plan + purchased add-ons)
2. **Run auto-allocation job** that selects top-scoring products from those platforms
3. **Respect monthly limits** — allocate up to `products_per_month` products
4. **Refresh on schedule** — new products allocated when scans complete, replacing lower-scoring ones
5. **Track usage** — increment `products_viewed` counter in `client_usage`

```
Scan completes → Check all active clients on that platform
    → For each client: are they under their monthly product limit?
        → Yes: allocate top N new products (score-ranked)
        → No: skip (they've hit their cap for this period)
```

---

## 5. ACCESS CONTROL & UPSELL ENGINE

### Platform Gating Strategy

The client dashboard should be restructured into a **platform-tabbed layout**:

```
┌─────────────────────────────────────────────────┐
│  YOUSELL Dashboard                              │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│ TikTok  │ Amazon  │ Shopify │Pinterest│ Digital │
│  [LIVE] │ [LOCKED]│ [LOCKED]│ [LOCKED]│ [LOCKED]│
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

#### For UNLOCKED Platforms

Show full dashboard with:
- Trending products (up to plan limit)
- Score breakdowns (per plan level)
- Influencer/supplier data (per plan level)
- Blueprint generation button (per plan limit)

#### For LOCKED Platforms — The Upsell Experience

This is critical for revenue growth. Locked platforms should NOT be blank walls. Instead, show **tantalizing previews**:

```
┌─────────────────────────────────────────────────┐
│  Amazon Products                    🔒 LOCKED   │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 23 HOT products found this week             │
│  📈 Average score: 84.2 / 100                   │
│  💰 Estimated profit range: $12–$47/unit        │
│                                                 │
│  Top trending categories:                       │
│  ██████████ Home & Kitchen (34%)                │
│  ████████   Health & Beauty (28%)               │
│  ██████     Electronics (19%)                   │
│  ████       Sports & Outdoors (12%)             │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  🔓 Unlock Amazon for $19/mo       │        │
│  │  or upgrade to Pro Seller ($149/mo) │        │
│  │  to get ALL platforms               │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  "I found 3 products on Amazon that now         │
│   generate $8,200/mo in revenue"                │
│   — Sarah K., Pro Seller subscriber             │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### What to Show on Locked Platforms (Aggregate Stats Only — No Product Details)

| Data Point | Show? | Purpose |
|-----------|-------|---------|
| Number of HOT products found | Yes | Creates FOMO |
| Average score of products | Yes | Shows quality |
| Estimated profit range | Yes | Shows money potential |
| Top trending categories | Yes | Shows relevance |
| Actual product names | NO | Paywall |
| Actual product scores | NO | Paywall |
| Supplier/influencer details | NO | Paywall |

This approach:
- Demonstrates the VALUE of the locked platform (they can see products exist)
- Creates urgency (HOT products they're missing)
- Makes upgrading feel like unlocking treasure, not buying blind
- Uses real data from actual scans (not fake marketing numbers)

#### Upsell Touchpoints

| Touchpoint | Trigger | CTA |
|-----------|---------|-----|
| Locked platform tab | Click on locked tab | "Unlock for $19/mo or upgrade" |
| Product limit reached | Hit monthly cap | "Need more? Add 25 products for $9/mo" |
| Blueprint limit reached | Hit blueprint cap | "Get more blueprints for $2.99 each" |
| Weekly email digest | Automated every Monday | "You missed 47 HOT products on Amazon this week" |
| Score teaser in feed | Locked platform product appears in feed | Blurred product card with "Unlock to see details" |

---

## 6. DUAL-PLATFORM SaaS ARCHITECTURE

### The Two Products

| | Product A: YOUSELL Intelligence | Product B: YOUSELL Dashboard |
|---|---|---|
| **Domain** | admin.yousell.online | app.yousell.online (or dashboard.yousell.online) |
| **Users** | Admin operators, super admins | End clients, subscribers |
| **Purpose** | Product discovery, scanning, scoring, data management | Consume curated products, view insights, manage subscription |
| **Revenue** | Internal tool (or licenseable to other agencies) | SaaS subscription revenue |
| **Tech** | Next.js admin app (current codebase) | Next.js client app (extracted from current `/dashboard`) |

### Architecture for Separability

The key principle: **Shared database, separate applications, controlled by a super-admin config flag.**

```
                    ┌──────────────────┐
                    │   Super Admin    │
                    │   Config Panel   │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    │  mode: 'linked'  │
                    │  or 'standalone' │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────┴─────────┐       ┌───────────┴──────────┐
    │  YOUSELL Intel     │       │  YOUSELL Dashboard   │
    │  (Admin App)       │       │  (Client App)        │
    │                    │       │                      │
    │  - Scan control    │       │  - View products     │
    │  - Score products  │       │  - Score breakdowns  │
    │  - Manage clients  │       │  - Blueprints        │
    │  - Allocate data   │       │  - Influencer data   │
    │  - Full backend    │       │  - Subscription mgmt │
    └─────────┬──────────┘       └───────────┬──────────┘
              │                              │
              └──────────────┬───────────────┘
                             │
                    ┌────────┴─────────┐
                    │  Shared Supabase │
                    │  Database        │
                    └──────────────────┘
```

### Super Admin Configuration Table

```sql
CREATE TABLE platform_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Example config entries:
INSERT INTO platform_config (key, value) VALUES
('deployment_mode', '"linked"'),              -- 'linked' | 'standalone_intel' | 'standalone_dashboard'
('intel_app_url', '"https://admin.yousell.online"'),
('dashboard_app_url', '"https://app.yousell.online"'),
('shared_auth', 'true'),                      -- shared Supabase auth or separate
('cross_platform_links', 'true'),             -- show links between apps
('branding', '{"name": "YOUSELL", "logo": "/logo.svg", "theme": "dark"}');
```

### How Separation Works in Code

**Shared packages** (extracted into a common library or monorepo package):
- `plan-config.ts` — Plan limits and feature flags
- `supabase.ts` — Database client singleton
- Database types/schemas
- Scoring engine logic
- Shared UI components (if any)

**Intel App (admin.yousell.online) — standalone features:**
- Scan control & job queue management
- Raw data ingestion pipeline
- Product scoring/transformation
- Client management (when linked)
- All `/admin/*` routes

**Dashboard App (app.yousell.online) — standalone features:**
- Client authentication & onboarding
- Subscription management (Stripe integration)
- Product browsing with plan-based filtering
- Blueprint viewing/generation
- Platform access gating & upsell UI
- All `/dashboard/*` routes

### Selling as Separate Products

**Scenario A: Linked (default for YOUSELL)**
Both apps share one Supabase instance. Admin discovers products → Dashboard shows them to clients. One business, two interfaces.

**Scenario B: Sell Intel App to other agencies**
Another e-commerce agency wants YOUSELL's product discovery engine for their own clients. They get:
- The admin/intel app with their own branding
- Their own Supabase instance
- No dashboard app (they use their own client-facing tools)
- License fee: monthly SaaS or one-time white-label

**Scenario C: Sell Dashboard App to data providers**
A company that already has product data (from their own scraping) wants a client-facing dashboard. They get:
- The dashboard app with subscription management
- Point it at their own data source
- License fee: monthly SaaS

### Implementation Approach

**Phase 1 (Now):** Keep everything in one codebase but refactor with clear boundaries:
- `/src/app/admin/*` — Intel features (no dashboard imports)
- `/src/app/dashboard/*` — Dashboard features (no admin imports)
- `/src/lib/shared/*` — Shared utilities used by both
- `/src/lib/admin/*` — Admin-only utilities
- `/src/lib/dashboard/*` — Dashboard-only utilities

**Phase 2 (Later, if needed):** Extract into a monorepo:
```
/packages/shared/        — Common types, configs, DB client
/apps/intel/             — Admin/intelligence app
/apps/dashboard/         — Client dashboard app
```

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1–2)
1. Restructure existing plan tiers (starter/growth/professional/enterprise → explorer/seller/pro_seller/agency)
2. Create new database tables (client_subscriptions, client_platform_access, client_usage, client_addons)
3. Build plan-config system with feature flags
4. Set up Stripe products/prices matching new tiers

### Phase 2: Subscription Flow (Week 3–4)
5. Integrate Stripe Checkout on yousell.online
6. Build webhook handler for subscription events (create, update, cancel, payment_failed)
7. Auto-provision client accounts on successful payment
8. Implement platform access control based on plan
9. Build subscription management page in dashboard (upgrade, downgrade, cancel)

### Phase 3: Dashboard Overhaul (Week 5–6)
10. Redesign client dashboard with platform-tabbed layout
11. Implement platform gating (unlocked vs locked views)
12. Build upsell previews for locked platforms (aggregate stats, FOMO-driven CTAs)
13. Add usage tracking and limit enforcement
14. Build add-on purchase flow

### Phase 4: Intelligence Features (Week 7–8)
15. Wire plan-based filtering for influencer data access
16. Wire plan-based filtering for supplier data access
17. Implement blueprint generation limits
18. Build competitor analysis access tiers
19. Add data delay enforcement per plan

### Phase 5: Separation & Polish (Week 9–10)
20. Refactor codebase into clean admin/dashboard/shared boundaries
21. Add super-admin config panel for deployment mode
22. Build automated email digest for upsell (locked platform teasers)
23. Implement API access for Pro Seller and Agency tiers
24. Load testing and optimization

### Phase 6: Marketing Site Update (Week 11–12)
25. Update yousell.online pricing page with new tiers
26. Add interactive plan comparison tool
27. Add-on marketplace page
28. Update all CTAs to point to Stripe Checkout
29. A/B testing on pricing presentation

---

## 8. COST ANALYSIS & UNIT ECONOMICS

### Per-Customer Operating Costs (Estimated)

| Cost Item | Per Customer/Month | Notes |
|-----------|-------------------|-------|
| Supabase (DB + Auth) | ~$0.15 | Pro plan shared across all users |
| Apify scan credits | ~$2–$8 | Depends on scan frequency per plan |
| Anthropic AI (blueprints) | ~$0.50–$3 | Per blueprint generation |
| Redis/BullMQ (Railway) | ~$0.10 | Shared infrastructure |
| Netlify hosting | ~$0.05 | Shared across all users |
| Resend email | ~$0.02 | Transactional emails |
| Stripe fees | 2.9% + $0.30 | Per transaction |
| **Total per Explorer** | **~$3–$5/mo** | |
| **Total per Seller** | **~$6–$12/mo** | |
| **Total per Pro Seller** | **~$10–$20/mo** | |
| **Total per Agency** | **~$15–$35/mo** | |

### Margin Analysis

| Tier | Price | Cost | Gross Margin | Margin % |
|------|-------|------|-------------|----------|
| Explorer $29/mo | $29 | ~$5 | ~$24 | ~83% |
| Seller $79/mo | $79 | ~$10 | ~$69 | ~87% |
| Pro Seller $149/mo | $149 | ~$18 | ~$131 | ~88% |
| Agency $299/mo | $299 | ~$30 | ~$269 | ~90% |

These are **healthy SaaS margins** (industry average is 70–80%). The per-unit cost stays low because Apify scans and AI calls are shared across all customers on the same platform — one scan serves everyone.

### Revenue Projections (Conservative)

| Month | Explorer | Seller | Pro Seller | Agency | MRR |
|-------|----------|--------|-----------|--------|-----|
| 3 | 50 | 20 | 5 | 2 | $4,758 |
| 6 | 120 | 60 | 15 | 5 | $11,690 |
| 12 | 300 | 150 | 40 | 15 | $28,930 |
| 18 | 500 | 250 | 80 | 30 | $52,820 |

These assume:
- 60% Explorer, 25% Seller, 10% Pro Seller, 5% Agency distribution
- 5% monthly churn (industry average for SMB SaaS)
- No add-on revenue included (pure upside)

### Break-Even Analysis

Fixed monthly costs (estimated):
- Supabase Pro: $25/mo
- Railway (backend): $20/mo
- Netlify Pro: $19/mo
- Apify base: $49/mo
- Domain/DNS: $5/mo
- **Total fixed: ~$118/mo**

**Break-even: 5 Explorer subscriptions or 2 Seller subscriptions.**

---

## SUMMARY OF RECOMMENDATIONS

1. **Kill the agency pricing model.** The backend is SaaS — price it as SaaS. $29–$299/mo in 4 tiers will generate more revenue at scale than $997–$2,997 one-time fees.

2. **Multi-platform is the moat.** No competitor covers 5 channels with AI scoring. Lean into this hard in marketing.

3. **Lock and tease, don't hide.** Locked platforms should show aggregate stats that make clients desperate to unlock. Every locked tab is a revenue opportunity.

4. **Stripe-first subscription management.** Let Stripe handle billing complexity. Webhook-driven provisioning keeps everything automated.

5. **Separate but connected.** Build with clean boundaries now so the admin and dashboard can be sold independently later. One codebase, two products.

6. **Volume over margin.** 500 customers at $79/mo beats 20 customers at $997/mo — and it's far more defensible.

---

*This document is a strategy proposal. No code changes have been made. Awaiting approval before execution.*
