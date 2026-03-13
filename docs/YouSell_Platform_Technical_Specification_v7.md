# YOUSELL PLATFORM TECHNICAL SPECIFICATION

## Version 7.0 — Definitive Master Build Brief

**Document Status:** CANONICAL — This document supersedes all prior build briefs (v4, v5, v6) and is the single authoritative architecture reference for the YouSell Platform.

**Date:** 2026-03-13

**Platform:** YouSell Intelligence Platform — admin.yousell.online + yousell.online

**Target Market:** USA

**Stack:** Netlify · Supabase · GitHub · Railway · Resend · Stripe

**For:** Claude Code Autonomous Build Agent and Senior Engineering Team

---

# PART I — STRATEGIC FOUNDATION

---

## Section 1 — Executive Overview

The YouSell Platform is an AI-powered commerce intelligence SaaS that automates the entire e-commerce product lifecycle — from trend detection through store integration to marketing execution. Unlike data-only competitors (Jungle Scout, Helium 10, Kalodata, FastMoss), YouSell provides a fully automated operational engine that discovers products, provisions stores, generates content, manages influencer outreach, and tracks orders across multiple platforms.

The platform operates as two interconnected but separable applications:

1. **YouSell Intelligence Engine** (admin.yousell.online) — The admin-facing backend intelligence system for product discovery, scoring, and pipeline management.
2. **YouSell Client Platform** (yousell.online) — The client-facing SaaS where subscribers access curated product intelligence, automated marketing, and store integration tools.

These two platforms share a Supabase database and can operate as one unified SaaS, or be licensed separately as independent products via a super-admin configuration toggle.

### 1.1 What This Platform Does

YouSell detects emerging product trends 2–3 weeks before mainstream adoption across seven opportunity channels. It discovers profitable products, identifies influencers driving those trends, locates suppliers, generates complete financial models and launch blueprints, provisions client stores, automates content creation and distribution, manages influencer outreach, and tracks orders through fulfilment. All major processes are triggered manually by the admin via a control dashboard — automation can be enabled channel-by-channel as client volume grows.

### 1.2 Competitive Position

YouSell is not a data tool. It is a full commerce automation platform. The competitive comparison is:

| Competitor | What They Do | Monthly Price | What YouSell Adds |
|---|---|---|---|
| Jungle Scout | Amazon product data | $29–$249 | Multi-platform, AI scoring, automation |
| Helium 10 | Amazon keyword/product research | $29–$279 | Not Amazon-only, full lifecycle |
| Kalodata | TikTok Shop data | $16–$199 | Not TikTok-only, store integration |
| FastMoss | TikTok analytics | $49–$99 | Full pipeline, not data-only |
| Sell The Trend | Product research + store builder | $30–$100 | AI-powered, deeper intelligence |
| AutoDS | Dropshipping automation | $26–$67 | Broader scope, influencer engine |
| Traditional Agency | Full service | $2,000–$10,000/mo | Same output, fraction of cost |

### 1.3 Key Architecture Principles

These are non-negotiable architectural rules that govern all development:

1. **Scraping in background workers only.** Never execute scraping or heavy data collection inside request/response API handlers.
2. **API routes serve stored data.** Routes read from Supabase, never trigger live collection jobs inline.
3. **Queue-based orchestration.** Redis + BullMQ controls all ingestion, transformation, and processing.
4. **Manual-first cost control.** All automation jobs are DISABLED by default. Each can be enabled independently.
5. **Persistent system memory.** Project context lives in repository files (`/ai`, `/docs`, `CLAUDE.md`), never in transient conversation state.
6. **Context recovery from repo.** Claude Code must read continuity files before making changes — never rely on chat memory.
7. **Preserve useful prior work.** Never rebuild completed functionality. Inspect before creating.
8. **Correct faulty assumptions.** Update weak architecture when the latest session introduces better patterns.

---

## Section 2 — Product Vision

### 2.1 The Core Value Proposition

YouSell transforms a solo operator or small team into a commerce intelligence agency. One person can discover, validate, source, price, market, and launch trending products across five platforms — work that would otherwise require a team of 10+ and $10K+/month in tools and services.

### 2.2 The Seven Opportunity Channels

| # | Channel | Type | Product Scope | Core Strategy |
|---|---|---|---|---|
| 1 | TikTok Shop | Impulse | Non-gated physical + digital | Influencer + TikTok Ads + Meta Ads |
| 2 | Amazon FBA | Search-driven | White-label / non-gated physical | PPC + Launch Strategy + Influencer |
| 3 | Shopify DTC | Hybrid | Any product incl. branded + digital | Meta + Google + Influencer |
| 4 | Pinterest Commerce | Visual discovery | Home, fashion, beauty, lifestyle | Pinterest Ads + Influencer + SEO |
| 5 | Digital Products | Digital | Templates, courses, AI prompts, tools | Content + Affiliates + SEO |
| 6 | AI Affiliate Programs | Commission | AI SaaS + subscription tools | Affiliate promotion + influencer |
| 7 | Physical Affiliate | Commission | TikTok Shop + Amazon affiliate products | Influencer + content |

### 2.3 Additional Intelligence Layers

- **Trend Scout Agent** — Detects products before viral peak across all platforms
- **Competitor Store Intelligence** — Maps who is already monetising each trend
- **Influencer Intelligence Engine** — Profiles, scores, and drafts outreach for creators (with one-click invite buttons)
- **Supplier Discovery Engine** — Finds manufacturers in China, UK, EU, USA
- **Profitability & Logistics Engine** — Full unit economics before any recommendation
- **Financial Modelling Engine** — ROI projections for influencer and ad campaigns
- **Launch Blueprint Engine** — Complete one-click launch plan per product
- **Client Allocation System** — Assign winning products to client accounts
- **Content Creation Engine** — AI-generated marketing content for social channels
- **Store Integration Engine** — Push products to Shopify, TikTok Shop, Amazon stores
- **Order Tracking Engine** — Post-purchase email sequences via Resend

---

## Section 3 — Business Objective & SaaS Positioning

### 3.1 SaaS Revenue Model

YouSell monetises through tiered subscriptions with per-platform pricing and modular engine add-ons. The pricing philosophy: **more customers at a reasonable price, not a few customers at very high prices.**

**Critical correction from prior versions:** The original yousell.online site priced packages at $2,997 — this is agency pricing on a SaaS product and is fundamentally misaligned. The correct pricing range is $29–$299/month per platform, based on competitive research.

### 3.2 Proposed Pricing Architecture

Pricing is structured as **per-platform subscriptions** with **modular engine toggles**:

- Each platform (TikTok, Amazon, Shopify, Digital, AI Affiliates) has its own subscription tier
- Clients can subscribe to one or more platforms independently
- Within each platform, 8 modular engines can be enabled/disabled:
  1. Product Discovery Engine
  2. Store Integration Engine
  3. Marketing & Ads Engine
  4. Content Creation Engine
  5. Influencer Outreach Engine (with one-click invite)
  6. Supplier Intelligence Engine
  7. AI Affiliate Revenue Engine
  8. Analytics & Profit Tracking Engine

### 3.3 AI Affiliate Engine — Correct Business Model

**CRITICAL CLARIFICATION:** AI affiliate programs pay commissions on conversions (signups), NOT on marketing activity. Three monetization models were evaluated:

**Model A — Pure Subscription:** Client pays monthly, gets affiliate database + marketing engine. *Problem:* They sign up once, grab affiliate links, cancel. High churn risk.

**Model B — Free + Commission Cut:** Client pays nothing, YouSell takes a percentage of their affiliate commissions. *Problem:* This is technically impossible — affiliate programs pay the link owner directly. YouSell cannot intercept payments between the client and the affiliate program. Workarounds (sub-affiliate networks, YouSell-managed accounts, honor-system invoicing) all have significant tradeoffs and trust issues.

**Model C — Hybrid (CHOSEN):** Subscription covers the platform + ongoing automation. The key insight: finding affiliate programs is a one-time task, but creating fresh content, distributing it consistently, and optimizing for conversions is an ongoing need. That's what justifies the subscription and prevents churn.

**The correct revenue flow:**

1. Client pays YouSell subscription → gets access to curated, frequently updated affiliate program database
2. Client uses YouSell's automated marketing engine to promote those programs on their social channels
3. Someone signs up via client's affiliate link → commission goes to CLIENT (100% theirs)
4. YouSell earns from the subscription fee ONLY — for providing discovery + automation + content

YouSell's value is being the **discovery + automation layer**, not an affiliate middleman. The subscription is justified by ongoing content creation, automated distribution, performance tracking, and weekly new opportunity alerts.

### 3.4 The "Sign Up and Disappear" Problem & Anti-Churn Design

**The core challenge:** A client could subscribe, browse all available affiliate programs, sign up for them using their own links, then cancel. The affiliate database alone is a one-time grab — it has no ongoing retention value.

**Solution:** The subscription value is NOT the database. It is the **automation, content creation, and channel distribution** that runs continuously. The affiliate data without the automation engine is like having a recipe book but no kitchen.

These 6 anti-churn hooks make the subscription irreplaceable:

1. **Daily fresh content** — AI-generated posts stop the moment they cancel. Old content dies fast on social algorithms.
2. **Connected channel automation** — Auto-posting to TikTok, Instagram, YouTube, etc. stops on cancel = back to manual work.
3. **Weekly new opportunities** — New programs, rate changes, seasonal promos. Cancel = stuck with stale info.
4. **Performance optimization** — AI learns what converts for THIS client over time. Cancel = lose that intelligence.
5. **Trend-aware content** — References current viral moments. Can't be stockpiled.
6. **Seasonal campaigns** — Black Friday, New Year pushes. Miss these = miss biggest earning months.

**The message:** "You can find affiliate links yourself. But can you create 30 optimized posts/month, distribute across 5 channels on schedule, track conversions, and catch every new program before competitors? That's what the subscription pays for."

### 3.5 Data Visibility Philosophy

**Principle: The paywall is on automation and actions, NOT on seeing data.**

Even the cheapest subscription plan should show impressive data — product counts, scores, trend directions, aggregate stats. The paywall gates the ability to **ACT** on that data automatically: push to store, generate content, send outreach, track orders. Be generous with data visibility; be strict with automation access. This creates a natural upgrade path: "I can SEE 47 HOT products on Amazon, but I need to upgrade to auto-import them to my store."

### 3.6 Built-In Revenue Multiplier

Every YOUSELL subscription that provisions tools for clients may generate indirect affiliate commission for YOUSELL itself when clients adopt recommended platforms. This is secondary revenue on top of subscriptions. Factor into pricing but do not rely on it.

---

## Section 4 — Rebrand / White-Label / Dual-Platform Architecture

### 4.1 Dual-Platform Separability

The codebase must maintain a clean boundary enabling three deployment modes:

| Mode | Description |
|---|---|
| `linked` | Both platforms share DB, auth, and billing. Default mode. |
| `standalone_intel` | Intelligence engine operates independently (sell to agencies) |
| `standalone_dashboard` | Client dashboard operates independently (white-label) |

**Implementation:** Super-admin config toggle stored in `admin_settings` table. Controlled via `/admin/setup`.

### 4.2 Clean Code Boundary

- `/admin/*` — Intelligence engine routes and UI
- `/dashboard/*` — Client-facing routes and UI
- `/lib/shared/*` — Shared business logic, types, scoring algorithms
- `/lib/admin/*` — Admin-only utilities
- `/lib/dashboard/*` — Client-only utilities

---

## Section 5 — User Types and Tenant Model

### 5.1 User Roles

| Role | Access | Description |
|---|---|---|
| `super_admin` | Full system access, can configure deployment mode | Platform owner |
| `admin` | All intelligence features, client management | Operations team |
| `client` | Dashboard only, scoped to their allocated products | Paying subscriber |
| `viewer` | Read-only access (default if no role set) | Safe fallback |

### 5.2 Multi-Tenant Architecture

Each client sees ONLY their allocated data. Enforced via:

1. **Supabase Row-Level Security (RLS)** on every table
2. **`requireAdmin()`** middleware on all admin API routes
3. **`requireClient()`** middleware on all dashboard API routes (currently missing — MUST be implemented)
4. **`product_allocations.visible_to_client`** controls product visibility per client

### 5.3 Known Auth Bugs (From QA Audit)

These MUST be fixed before production:

- **BUG-001 (CRITICAL):** Admin layout renders for ANY authenticated user — no role check in layout component
- **BUG-016 (CRITICAL):** Express backend has zero RBAC — any authenticated user can trigger scans
- **BUG-035 (CRITICAL):** `clients` table RLS blocks all client queries, breaking the client dashboard

---

## Section 6 — Core Platform Capabilities

### 6.1 Intelligence Capabilities (Currently Built)

| Capability | Status | Source Files |
|---|---|---|
| Product discovery (TikTok, Amazon, Pinterest, Shopify) | ✅ Built | `src/lib/providers/*` |
| Composite scoring (3-pillar: Trend + Viral + Profit) | ✅ Built | `src/lib/scoring/composite.ts` |
| Profitability scoring | ✅ Built | `src/lib/scoring/profitability.ts` |
| Admin dashboard (22 pages) | ✅ Built | `src/app/admin/*` |
| Client dashboard (4 pages) | ✅ Built | `src/app/dashboard/*` |
| BullMQ job queue + worker | ✅ Built | `backend/src/worker.ts` |
| Supabase auth + RLS | ✅ Built | `supabase/migrations/*` |
| Provider abstraction layer | ✅ Built | `src/lib/providers/config.ts` |
| CSV import pipeline | ✅ Built | `src/app/api/admin/import/route.ts` |
| Email outreach via Resend | ✅ Built | `src/lib/email.ts`, `backend/src/lib/email.ts` |
| Scan control panel | ✅ Built | `src/app/api/admin/scan/route.ts` |
| Client allocation system | ✅ Built | `src/app/api/admin/allocations/route.ts` |
| Financial modeling | ✅ Built | `src/app/api/admin/financial/route.ts` |
| Launch blueprints | ✅ Built | `src/app/api/admin/blueprints/route.ts` |
| Automation scheduler | ✅ Built | `src/app/api/admin/automation/route.ts` |

### 6.2 Capabilities Not Yet Built

| Capability | Status | Priority |
|---|---|---|
| Stripe subscription billing | ❌ Not built | Phase 1 (next) |
| Store integration (push products to Shopify/TikTok/Amazon) | ❌ Not built | Phase 2 |
| Content creation engine | ❌ Not built | Phase 3 |
| Marketing channel OAuth integrations | ❌ Not built | Phase 3 |
| Order tracking + post-purchase emails | ❌ Not built | Phase 4 |
| Engine toggle system (per-client module enable/disable) | ❌ Not built | Phase 2 |
| Platform gating + upsell UI | ❌ Not built | Phase 2 |
| AI affiliate opportunity database (dynamic) | ❌ Partially | Phase 3 |
| Mobile app (React Native + Expo) | ❌ Not built | Phase 5 |
| One-click influencer invite buttons | ❌ Not built | Phase 3 |

---

## Section 7 — Full Platform Scope

### 7.1 Admin Intelligence Engine (admin.yousell.online)

The admin engine is the core intelligence system. It:

- Runs product discovery scans across all seven channels
- Scores and ranks products using the 3-pillar composite model
- Identifies matching influencers, suppliers, and competitors
- Generates financial models and launch blueprints
- Allocates products to client accounts
- Manages automation schedules and cost controls
- Monitors system health, API status, and scan history

### 7.2 Client SaaS Platform (yousell.online)

The client platform is the revenue-generating frontend. It:

- Sells per-platform subscriptions via Stripe
- Shows clients their allocated products with scores and insights
- Enables/disables modular engines per subscription
- Integrates with client stores (Shopify, TikTok, Amazon) via OAuth
- Generates and distributes marketing content to client channels
- Manages influencer outreach with one-click invite
- Tracks orders and sends post-purchase email sequences
- Gates access to unsubscribed platforms with upsell UI showing aggregate stats

### 7.3 Connection Between Platforms

Currently NOT connected. The required integration:

1. Client purchases subscription on yousell.online → Stripe webhook fires
2. Railway backend processes webhook → creates client account in Supabase
3. Client redirected to admin.yousell.online/dashboard with active session
4. Platform access, engine toggles, and product limits configured automatically based on purchased plan
5. Upgrade/downgrade handled via Stripe Customer Portal → webhook updates access in real-time

---

## Section 8 — Functional Modules (Discovery)

### 8.1 TikTok Products Module

**Goal:** Identify viral impulse-buy products trending on TikTok Shop before saturation. Price range $10–$60, non-gated brands, visually demonstrable, problem-solving.

**Data Sources:**
- TikTok Creative Center (free, no auth) — trending hashtags, top ads, top products by category
- Apify TikTok Shop Trending Scraper — GMV, creator counts, engagement (batched)
- ScrapeCreators TikTok Shop API — 100 free requests — product search, sold count, seller info
- TikTok Research API (pending approval) — apply at developers.tiktok.com
- CSV/Excel import fallback — admin exports from FastMoss or Kalodata

**Data Collected:** Product name, category, image, estimated monthly sales, GMV, number of influencers promoting, engagement rate, trend growth rate, competitor stores, top influencer video URLs, estimated monthly revenue, profit margin estimate, marketing strategy recommendation.

### 8.2 Amazon Products Module

**Goal:** Profitable Amazon FBA opportunities with high BSR, manageable competition, viable private-label launch.

**Data Sources:**
- Amazon PA-API (pending approval) — product data, pricing, BSR
- Apify Amazon BSR Tracker — top 100 per category (batched)
- RapidAPI Real-Time Amazon Data — 500 free requests/month
- SerpAPI — 100 free/month (category searches, not individual ASINs)

**Data Collected:** ASIN, title, category, BSR and BSR trend, estimated monthly sales, review count, review velocity, price history, FBA fee estimate, net margin, search volume, competition score, revenue potential, PPC keyword list, private label launch brief.

### 8.3 Shopify Products Module

**Goal:** Products for DTC Shopify brands with strong ad creative potential, 30%+ margin, no brand restrictions.

**Data Sources:**
- Apify Shopify Store Scraper — fast-growing stores, top products (weekly batch)
- Meta Ads Library public API — ad creatives (free)
- TikTok Ads Library public search — trending product ads (free)
- pytrends — search demand validation (free, batched)
- Reddit API — product discussions, demand signals (free)

### 8.4 Pinterest Commerce Module

**Goal:** Trending products with strong visual appeal and buying intent. Pinterest users have 85% higher average order value.

**Key Insight:** Pinterest trends predict Google Trends by 2–6 weeks. Flag this pattern explicitly when detected.

**Data Sources:**
- Apify Pinterest Trending Scraper — trending pins, board saves, product categories
- Pinterest API for Advertisers — free business account — trend data, keyword performance
- pytrends + SerpAPI Google Shopping — validate demand

### 8.5 Digital Products Module

**Goal:** Digital products paying high affiliate commissions promotable via content or influencers.

**Data Sources:** Gumroad public top sellers (Apify), Etsy digital products (Apify), ClickBank marketplace, ShareASale directory, Udemy top courses, AppSumo public scrape.

### 8.6 AI Affiliate Programs Module

**Goal:** AI and SaaS platforms with affiliate programs paying commission per signup.

**Pre-Seeded Database (10 programs):**

| Platform | Commission | Cookie | Recurring | Network |
|---|---|---|---|---|
| Jasper AI | 25–30% | 30 days | Yes | PartnerStack |
| Pictory AI | 20–50% | 30 days | Yes | Direct |
| Synthesia | 25% | 30 days | No | Direct |
| Writesonic | 30% | 90 days | Yes | Direct |
| GetResponse | 40–60% | 120 days | Yes | Direct |
| HubSpot | 30% (1yr) | 90 days | Yes | Impact |
| ManyChat | 20% | 30 days | Yes | PartnerStack |
| Creatify AI | 25% + bonus | 30 days | Yes | Rewardful |
| Canva | Up to 36% | 30 days | No | Impact |
| Semrush | 200% first month | 120 days | No | Impact |

**Ongoing Discovery:** Product Hunt API, PartnerStack marketplace, AppSumo, Twitter/X API.

### 8.7 Physical Affiliate Products Module

**Goal:** Physical products via TikTok Shop affiliate and Amazon affiliate — commission without holding inventory.

**Data Sources:** TikTok Shop Affiliate Centre, Amazon Associates product search, Apify TikTok Shop Affiliate scraper.

---

## Section 9 — Updated System Architecture

### 9.1 High-Level Architecture

```
Client Browser (yousell.online)
        ↓
Stripe Checkout → Stripe Webhooks
        ↓
Admin Browser (admin.yousell.online)
        ↓
Next.js 14 (App Router) on Netlify
        ↓ API Routes
Express Backend on Railway
        ↓
BullMQ Job Queue (Redis)
        ↓
Scan Worker (Railway)
        ↓ Triggers
Apify Actors / External APIs
        ↓
Raw Data
        ↓ Transform
Supabase PostgreSQL
        ↓ Realtime
Dashboard Updates (Web + Mobile)
        ↓
Resend Email Notifications
```

### 9.2 Data Flow — Discovery Pipeline

```
1. Admin triggers scan (or schedule fires)
2. BullMQ job created → Worker picks up
3. Worker runs Apify actors / external APIs (batched)
4. Raw results stored in raw_listings table
5. Transformation layer normalises to products schema
6. Scoring engine calculates trend/viral/profit/final scores
7. Products upserted to products table (UNIQUE on platform + external_id)
8. Products scoring 60+ get enriched (influencers, suppliers, competitors)
9. Products scoring 75+ get Claude Sonnet analysis (on-demand)
10. Supabase Realtime pushes updates to dashboard
11. HOT products (80+) trigger Resend email + push notification
```

### 9.3 Data Flow — Client Platform

```
1. Client purchases plan on yousell.online → Stripe webhook
2. Railway processes webhook → creates client in Supabase
3. Client accesses dashboard → sees allocated products
4. Client enables engines → toggles stored in client_engine_config
5. Client connects store → OAuth flow → token stored encrypted
6. Content engine generates posts → queued for distribution
7. Marketing engine distributes to connected channels
8. Store integration pushes products to client's store
9. Order webhooks flow back → order tracking emails via Resend
```

---

## Section 10 — High-Level Infrastructure Design

### 10.1 Current Infrastructure

| Component | Service | Cost | Status |
|---|---|---|---|
| Web Frontend | Netlify (Next.js 14) | Free tier | ✅ Deployed |
| Backend API | Railway (Express) | ~$5/mo | ✅ Deployed |
| Job Queue | Railway Redis | ~$5/mo add-on | ✅ Configured |
| Database | Supabase PostgreSQL | Free tier | ✅ Active |
| Auth | Supabase Auth | Free tier | ✅ Active |
| Realtime | Supabase Realtime | Free tier | ✅ Active |
| File Storage | Supabase Storage | Free tier | ✅ Active |
| Email | Resend API | Free tier | ✅ Configured |
| Scraping | Apify Cloud | $5 free/mo | ✅ Configured |
| Payments | Stripe | 2.9% + $0.30 | ❌ Not connected |

### 10.2 Required Infrastructure Additions

| Component | Service | Cost | Phase |
|---|---|---|---|
| Payments + Billing | Stripe Checkout + Customer Portal | Transaction fees only | Phase 1 |
| Store OAuth | Shopify App, TikTok Open API, Amazon SP-API | Free (API access) | Phase 2 |
| Marketing OAuth | Meta Graph API, TikTok, YouTube, Pinterest | Free (OAuth) | Phase 3 |
| Mobile App | Expo + EAS Build | $99/yr Apple, $25 Google | Phase 5 |

---

## Section 11 — Existing Stack & Corrected Stack Decisions

### 11.1 Technology Stack

| Layer | Technology | Cost | Justification |
|---|---|---|---|
| Web Frontend | Next.js 14 (App Router) + TypeScript | Free | SSR, API routes, Netlify-native |
| Mobile App | React Native + Expo (iOS + Android) | Free | Single codebase, shared logic with web |
| UI — Web | Tailwind CSS + shadcn/ui + Tremor | Free | Dark dashboard, charts, responsive |
| UI — Mobile | NativeWind + React Native Paper | Free | Tailwind-style mobile UI |
| Charts | Recharts (web) + Victory Native (mobile) | Free | Sparklines, gauges, trend charts |
| Database | Supabase PostgreSQL | Free | RLS, realtime subscriptions |
| Auth | Supabase Auth | Free | Admin + client role enforcement |
| Push Notifications | Expo Push Notifications | Free | Mobile alerts |
| File Storage | Supabase Storage | Free | CSV imports, PDFs, product images |
| Backend API | Node.js + Express on Railway | Existing | Scraping, API orchestration, jobs |
| Job Queue | BullMQ + Redis on Railway | ~$5/mo | Manual-triggered and scheduled scans |
| Email | Resend API | Free | Outreach + alerts + order tracking |
| AI (scoring) | Claude Haiku API | ~$0.0003/1k tokens | Bulk scoring, NLP, classification |
| AI (insights) | Claude Sonnet API | ~$0.003/1k tokens | Blueprints, strategic insights |
| Web Scraping | Apify Cloud | $5 free/mo | Pre-built actors, batched runs |
| Trend Data | pytrends (via Apify actor) | Free | Google Trends, batched |
| Search | SerpAPI | 100 free/mo | Amazon + Google Shopping |
| Payments | Stripe | 2.9% + $0.30 per txn | Subscriptions, billing |
| NLP | spaCy + NLTK | Free open source | Comment sentiment, purchase intent |

### 11.2 Corrected Stack Decisions

**From v6 to v7 — what changed:**

1. **Stripe added** — v6 had no payment integration. Now essential for SaaS.
2. **Store integration APIs added** — Shopify GraphQL, TikTok Seller, Amazon SP-API for pushing products TO stores.
3. **OAuth channel integrations added** — For automated content distribution to client's social channels.
4. **Order tracking via existing Resend + Railway** — No new service needed.
5. **Pricing model corrected** — From $2,997 agency pricing to $29–$299/mo SaaS tiers.
6. **Dual-platform architecture defined** — admin.yousell.online and yousell.online as separable but linkable.
7. **Engine toggle system designed** — Clients can enable/disable individual modules.

---

## Section 12 — Frontend Architecture

### 12.1 Next.js 14 App Router Structure

```
src/
├── app/
│   ├── admin/                    # Admin intelligence dashboard
│   │   ├── layout.tsx            # Admin shell with sidebar
│   │   ├── page.tsx              # Admin home / dashboard
│   │   ├── login/page.tsx        # Admin login
│   │   ├── unauthorized/page.tsx # Access denied page
│   │   ├── products/page.tsx     # All products view
│   │   ├── tiktok/page.tsx       # TikTok products tab
│   │   ├── amazon/page.tsx       # Amazon products tab
│   │   ├── pinterest/page.tsx    # Pinterest products tab
│   │   ├── shopify/page.tsx      # Shopify products tab
│   │   ├── digital/page.tsx      # Digital products tab
│   │   ├── affiliates/page.tsx   # Affiliate products tab
│   │   ├── influencers/page.tsx  # Influencer management
│   │   ├── suppliers/page.tsx    # Supplier management
│   │   ├── competitors/page.tsx  # Competitor intelligence
│   │   ├── trends/page.tsx       # Trend analysis
│   │   ├── scan/page.tsx         # Scan control panel
│   │   ├── scoring/page.tsx      # Scoring dashboard
│   │   ├── clients/page.tsx      # Client management
│   │   ├── allocations/page.tsx  # Product allocation
│   │   ├── financial/page.tsx    # Financial modeling
│   │   ├── blueprints/page.tsx   # Launch blueprints
│   │   ├── automation/page.tsx   # Automation scheduler
│   │   ├── notifications/page.tsx # Notification centre
│   │   ├── import/page.tsx       # CSV/Excel import
│   │   └── settings/page.tsx     # API keys, toggles, config
│   ├── dashboard/                # Client-facing dashboard
│   │   ├── layout.tsx            # Client shell (role-enforced)
│   │   ├── page.tsx              # Client home
│   │   ├── products/page.tsx     # Client's allocated products
│   │   └── requests/page.tsx     # Request more products
│   ├── api/                      # Next.js API routes
│   │   ├── admin/                # 22 admin API routes
│   │   ├── dashboard/            # Client API routes
│   │   └── auth/                 # Auth callback, signout
│   ├── login/page.tsx            # Client login
│   └── layout.tsx                # Root layout
├── components/                   # Shared React components
│   ├── ui/                       # shadcn/ui primitives (16 components)
│   ├── product-card.tsx          # Universal product card
│   ├── score-badge.tsx           # Score display badge
│   └── platform-products.tsx     # Platform product list
├── lib/                          # Shared utilities
│   ├── providers/                # Data provider integrations
│   ├── supabase/                 # Supabase client configs
│   ├── auth/                     # Auth utilities
│   ├── scoring/                  # Scoring engine
│   ├── types/                    # TypeScript type definitions
│   ├── email.ts                  # Resend email service
│   └── utils.ts                  # General utilities
├── hooks/                        # Custom React hooks
└── middleware.ts                 # Auth middleware
```

### 12.2 Design Principles

- Dark sidebar + light content area — premium B2B SaaS aesthetic
- Supabase Realtime subscriptions — live data without page refresh
- Fully responsive: 320px mobile to 4K desktop
- Dark and light mode with system preference detection and manual toggle
- WCAG 2.1 AA accessibility compliance
- Lighthouse score 80+ on all admin pages

### 12.3 Universal Product Card (All Tabs)

- Product image or category placeholder
- Platform + Channel badge (colour-coded per channel)
- Trend lifecycle stage badge: Emerging / Rising / Exploding / Saturated
- Final Opportunity Score — large circular gauge, green/orange/grey
- Key metric relevant to channel: GMV / BSR / Margin / Commission rate
- Top 3 influencer avatars with follower counts
- Competitor store count + top competitor name
- Supplier availability indicator
- AI insight excerpt with expand button
- Three action buttons: View Blueprint · Add to Client · Archive

---

## Section 13 — Backend Architecture

### 13.1 Express Server (Railway)

Located at `backend/src/index.ts`. Provides:

- RESTful API endpoints for scan management
- BullMQ job creation and monitoring
- CORS configuration for frontend origin
- Helmet security headers
- Rate limiting (100 req/min general, 10 req/min for scan operations)
- Health endpoint for monitoring

### 13.2 Known Backend Issues (From QA Audit)

- **BUG-016 (CRITICAL):** No RBAC — any authenticated user can trigger scans. Must add `requireAdmin()` middleware.
- **BUG-028 (HIGH):** `userId` read from request body, not from auth token. Allows spoofing.
- **BUG-029 (MEDIUM):** Single-origin CORS. Must support multiple origins (Netlify preview URLs).
- **BUG-022 (HIGH):** Backend writes to `scans` table, frontend reads from `scan_history`. Split-brain.
- **BUG-030 (MEDIUM):** API keys appear in error logs when included in URL query strings.

### 13.3 Backend File Structure

```
backend/
├── src/
│   ├── index.ts          # Express server + routes
│   ├── worker.ts         # BullMQ scan worker
│   └── lib/
│       ├── queue.ts      # BullMQ queue configuration
│       ├── scoring.ts    # Backend scoring engine
│       ├── providers.ts  # Backend data providers
│       ├── supabase.ts   # Supabase service-role client
│       ├── email.ts      # Resend email service
│       └── mock-data.ts  # Mock data for testing
├── package.json
├── Dockerfile
├── railway.toml
└── tsconfig.json
```

---

## Section 14 — Worker Architecture

### 14.1 BullMQ Scan Worker

Located at `backend/src/worker.ts`. Processes scan jobs with the following pipeline:

1. Receive job from queue (scan type: quick/full/client)
2. Execute platform scrapers (TikTok, Amazon, Shopify, Pinterest)
3. Score all discovered products (trend, viral, profit, final)
4. Store trends and keywords
5. Upsert products to Supabase
6. Update scan history with results
7. Send email notification for HOT products
8. Report completion

### 14.2 Known Worker Issues

- **BUG-050 (MEDIUM):** Platform scraping runs sequentially. Should be parallelised with `Promise.all()`.
- **BUG-051 (MEDIUM):** Worker has no graceful shutdown — `SIGTERM` handling missing.
- **BUG-052 (MEDIUM):** No dead letter queue for failed jobs.
- **BUG-022 (HIGH):** Worker writes to `scans` table but frontend reads `scan_history`.

### 14.3 Worker Sleep Mode

Railway worker must scale to zero when no jobs are queued. Worker wakes in ~5 seconds when a job arrives. Reduces Railway compute bill by 50–70%.

---

## Section 15 — Queue Architecture

### 15.1 BullMQ Configuration

Located at `backend/src/lib/queue.ts`.

- Queue name: `scan-queue`
- Connection: Redis on Railway (`REDIS_URL`)
- Default job options: 3 retries, exponential backoff

### 15.2 Queue Types (Target Architecture)

| Queue | Purpose | Priority |
|---|---|---|
| `scan-queue` | Product discovery scans | ✅ Built |
| `transform-queue` | Raw data → product transformation | ❌ Planned |
| `scoring-queue` | Batch scoring jobs | ❌ Planned |
| `content-queue` | AI content generation | ❌ Planned |
| `distribution-queue` | Content distribution to channels | ❌ Planned |
| `order-tracking-queue` | Order status email sequences | ❌ Planned |

---

## Section 16 — Scheduler and Cost-Control Strategy

### 16.1 The Manual-First Principle

All jobs are manual until the admin enables automation. In early stage with 1–5 clients, doing 2–3 manual scans per week costs approximately $1–6 in API credits. Monthly cost stays near zero in quiet weeks.

### 16.2 Scan Modes

| Scan Mode | What It Runs | Duration | Cost |
|---|---|---|---|
| Quick Scan | TikTok Creative Center + pytrends + Reddit only. Haiku scoring. | 2–4 min | ~$0.05–0.20 |
| Full Scan | All seven channels, viral signals, influencer matching, supplier search, Haiku + Sonnet top 5. | 15–30 min | ~$0.50–2.00 |
| Client Scan | Full pipeline scoped to client's niche. Generates client-ready report. | 10–20 min | ~$0.30–1.50 |

### 16.3 Automation Toggle Schedule (All DISABLED by Default)

| Job | Default State | Frequency When Enabled | Est. Monthly Cost |
|---|---|---|---|
| Trend Scout + Viral Signals | OFF | Every 6 hours | ~$5–10/mo |
| TikTok Product Scan | OFF | Daily | ~$3–8/mo |
| Amazon BSR Scan | OFF | Daily | ~$2–5/mo |
| Pinterest Trend Scan | OFF | Daily | ~$1–3/mo |
| Google Trends Batch | OFF | Daily (free — pytrends) | ~$0/mo |
| Reddit Demand Signals | OFF | Every 12 hours (free) | ~$0/mo |
| Digital Product Scan | OFF | Daily | ~$1–3/mo |
| AI Affiliate Refresh | OFF | Weekly | ~$0.50/mo |
| Shopify Competitor Scan | OFF | Weekly | ~$2–5/mo |
| Influencer Metric Refresh | OFF | Weekly | ~$1–3/mo |
| Supplier Data Refresh | OFF | Monthly | ~$0.50/mo |

### 16.4 Cost Optimisation Rules (Apply From Day One)

1. **Claude Haiku for bulk, Sonnet for premium.** Haiku handles: product NLP extraction, comment classification, trend stage classification, bulk scoring, scoring explanations, influencer outreach emails. Sonnet handles: strategic insights for 75+ products, launch blueprints, competitor analysis.
2. **Batch everything.** Never run Apify actors per individual product. Never make individual SerpAPI calls per product. Always group pytrends in batches of 5.
3. **Aggressive Supabase caching.** Before any external API call, check if fresh data exists (within 24 hours). This reduces external calls by 40–60% over time.
4. **Only enrich top scorers.** Shallow scan all products (cheap/free APIs). Full enrichment only for products scoring 60+. Blueprints only for 75+ on manual request.
5. **Railway worker sleep mode.** Scale to zero when idle.
6. **Free API priority.** Always exhaust free tiers first: pytrends → Reddit → TikTok Creative Center → PA-API → YouTube → Product Hunt → Meta Ads Library.

### 16.5 Realistic Monthly Cost Estimates

| Stage | Monthly Cost | Driver |
|---|---|---|
| Build phase (mock data) | $0–5 | Claude Code tokens only |
| Early stage (1–5 clients) | $15–35 | Apify + Claude API per scan |
| Growth (5–20 clients) | $35–80 | Daily auto scans, 2–3 channels |
| Scale (20+ clients) | $80–200 | All channels automated daily |

---

## Section 17 — Data Ingestion Strategy

### 17.1 Ingestion Pipeline Stages

| Stage | Description | Status |
|---|---|---|
| 1. Actor Execution | Trigger Apify actors to scrape external sources | ✅ Built |
| 2. Dataset Retrieval | Fetch dataset results from actor runs | ✅ Built |
| 3. Raw Data Storage | Store JSON in raw_listings table | ❌ Partially |
| 4. Data Transformation | Normalise raw records to product schema | ✅ Built (in worker) |
| 5. Product Scoring | Apply 3-pillar scoring engine | ✅ Built |
| 6. Database Upsert | Insert/update products (UNIQUE on platform + external_id) | ✅ Built |

### 17.2 Provider Abstraction Pattern

Every data source is wrapped in a provider abstraction layer. Each provider has an environment variable that switches between fallback and preferred API. Switching requires only an env var change — zero code refactoring.

**Pattern (example for TikTok):**
```typescript
const provider = process.env.TIKTOK_PROVIDER ?? 'apify'
if (provider === 'tiktok_api' && process.env.TIKTOK_API_KEY) {
  return fetchFromTikTokResearchAPI()
}
return fetchFromApifyAndScrapeCreators() // always available fallback
```

### 17.3 Known Ingestion Issues

- **BUG-040 (MEDIUM):** Frontend and backend use completely different APIs for the same platforms but store results in the same table. Frontend uses Apify actors; backend uses official/paid APIs. Data schemas differ.
- **BUG-042 (MEDIUM):** Two sets of provider files exist (old flat files + new subdirectory files). The index.ts re-exports from old files while new subdirectory versions are imported directly elsewhere.

---

## Section 18 — External API Integration Strategy

### 18.1 APIs Pending Approval (Fallbacks in Use)

| API | Status | Fallback | Switch Trigger |
|---|---|---|---|
| TikTok Research API | Pending | Apify + ScrapeCreators + Creative Center | Add TIKTOK_API_KEY |
| Amazon PA-API | Pending | Apify + RapidAPI (500 free/mo) | Add AMAZON_PA_API_KEY |

### 18.2 APIs Available Immediately

| Service | Cost | Used For |
|---|---|---|
| Reddit API | Free 100 req/min | Community demand signals |
| YouTube Data API v3 | Free 10k/day | Influencer discovery |
| Product Hunt API | Free | AI tool launches |
| Pinterest Business API | Free | Pinterest trends |
| ScrapeCreators TikTok | 100 free/mo | TikTok Shop search |
| RapidAPI Amazon | 500 free/mo | Amazon product data |
| TikTok Creative Center | Free, no auth | Trending hashtags, top ads |
| Meta Ads Library API | Free, no auth | Competitor ad monitoring |
| pytrends (via Apify) | Free | Google Trends |
| Apify (existing) | $5 free/mo | All Apify actors |
| Supabase | Existing | DB, auth, realtime |
| Resend | Existing | Email |
| Expo Push | Free | Mobile notifications |

### 18.3 Apify Actors in Use

| Actor | Scrapes | Batch Strategy | Cost Per Run |
|---|---|---|---|
| TikTok Shop Trending | Viral products, GMV, creator counts | Per category per scan | $0.10–0.50 |
| Amazon BSR + Product | BSR, price, reviews, sales | Top 100 per category | $0.10–0.30 |
| Pinterest Trending Pins | Trending pins, board saves | Per category cluster | $0.05–0.15 |
| Shopify Store | Fast-growing stores, top products | Weekly, 20 stores | $0.05–0.15 |
| Alibaba Supplier | Suppliers, MOQ, pricing | Per product keyword group | $0.05–0.15 |
| Instagram Profile | Follower count, engagement | Batch 50 profiles | $0.05–0.20 |
| Gumroad Top Sellers | Bestselling digital products | Weekly per category | $0.05–0.10 |
| Google Trends | Trending keywords | Per batch of keywords | $0.05–0.10 |

### 18.4 Paid Fallbacks (Activate Later if Needed)

| Service | Cost | When to Activate |
|---|---|---|
| FastMoss CSV | $49–99/mo | When Apify TikTok GMV insufficient |
| Kalodata CSV | $49/mo | Alternative for TikTok creator earnings |
| Helium 10 API | $39/mo | When Amazon fallback insufficient |
| Keepa API | $19/mo | For 90+ day BSR history |

---

# PART II — INTELLIGENCE MODELS & DATA ARCHITECTURE

---

## Section 19 — Scraping Strategy and Compliance-Aware Design

### 19.1 Scraping Principles

1. **Never scrape inside API request handlers.** All scraping runs in BullMQ workers on Railway.
2. **Batch all actor runs.** One Apify run per category/keyword group, never per individual product.
3. **Respect rate limits.** Every provider implements configurable rate limiting via `ProviderConfig.rateLimit`.
4. **Use official APIs when available.** Scraping is the fallback, not the primary method.
5. **Cache aggressively.** Check Supabase for data fresher than 24 hours before making external calls.
6. **Comply with ToS.** Never scrape platforms that explicitly prohibit it. Use official APIs and public data sources.

### 19.2 Provider Fallback Chain

```
Official API (if key present and approved)
    ↓ (if unavailable)
Apify Actor (if APIFY_API_TOKEN present)
    ↓ (if unavailable)
RapidAPI / SerpAPI (if key present)
    ↓ (if unavailable)
CSV/Excel Import (manual admin upload)
    ↓ (if no data at all)
Return empty array (graceful degradation, no crash)
```

### 19.3 Data Freshness Policy

| Data Type | Max Cache Age | Refresh Trigger |
|---|---|---|
| Product listings | 24 hours | Next scan or manual refresh |
| BSR / Sales estimates | 12 hours | Scan or schedule |
| Influencer metrics | 7 days | Weekly refresh job |
| Supplier data | 30 days | Monthly refresh job |
| Trend keywords | 6 hours | Trend scout job |
| Google Trends | 24 hours | pytrends batch |
| Competitor stores | 7 days | Weekly scan |

---

## Section 20 — Canonical Data Model

### 20.1 Core Entities

```
Products ←→ Influencers (via product_influencers)
Products ←→ Suppliers (via product_suppliers)
Products ←→ Competitor Stores
Products ←→ Financial Models (1:1)
Products ←→ Launch Blueprints (1:1)
Products ←→ Viral Signals (1:many per scan)
Products ←→ Product Allocations ←→ Clients
Clients ←→ Product Requests
Clients ←→ Client Subscriptions (NEW)
Clients ←→ Client Platform Access (NEW)
Clients ←→ Client Engine Config (NEW)
Clients ←→ Client Channels (NEW, OAuth tokens)
Clients ←→ Client Orders (NEW)
Automation Jobs (standalone)
Scan History (standalone)
Notifications ←→ Users
```

### 20.2 Uniqueness Constraints

- `products`: UNIQUE(platform, external_id) — prevents duplicates across scans
- `product_allocations`: UNIQUE(client_id, product_id) — one allocation per client per product
- `influencers`: UNIQUE(username, platform) — one record per creator per platform
- `client_subscriptions`: UNIQUE(client_id, stripe_subscription_id) — one record per subscription

---

## Section 21 — Database Schema and Entity Relationships

### 21.1 Existing Tables (20 tables — all in Supabase PostgreSQL with RLS)

| Table | Key Fields | Purpose |
|---|---|---|
| `profiles` | id (uuid FK auth.users), role, name, email, push_token | User accounts |
| `admin_settings` | id, key, value | System configuration |
| `clients` | id, name, email, plan, niche, notes, default_product_limit | Client accounts |
| `products` | id, name, platform, external_id, price, final_score, trend_score, viral_score, profit_score, trend_stage, ai_insight_haiku, ai_insight_sonnet | Discovered products |
| `product_metrics` | id, product_id, metric_name, metric_value, recorded_at | Time-series for sparklines |
| `viral_signals` | id, product_id, signal_type, signal_value, detected_at | Six viral signal readings |
| `influencers` | id, username, platform, followers, tier, engagement_rate, us_audience_pct, fake_follower_pct, conversion_score, email, cpp_estimate, niche | Creator profiles |
| `product_influencers` | id, product_id, influencer_id, video_urls, match_score, outreach_status | Product ↔ influencer links |
| `competitor_stores` | id, product_id, store_name, platform, url, est_monthly_sales, primary_traffic, ad_active, success_score | Competitor data |
| `suppliers` | id, name, country, moq, unit_price, shipping_cost, lead_time, white_label, dropship, us_warehouse, certifications | Supplier records |
| `product_suppliers` | id, product_id, supplier_id | Product ↔ supplier links |
| `financial_models` | id, product_id, retail_price, total_cost, gross_margin, break_even_units, influencer_roi, ad_roas_estimate, revenue_30/60/90day | Financial analysis |
| `launch_blueprints` | id, product_id, positioning, product_page_content, pricing_strategy, video_script, ad_blueprint, launch_timeline, risk_notes, generated_by | Launch plans |
| `affiliate_programs` | id, name, platform, commission_rate, recurring, cookie_days, network, join_url, niche_tags | Affiliate program DB |
| `product_allocations` | id, client_id, product_id, platform, rank, visible_to_client, allocated_at, source, status | Client product access |
| `product_requests` | id, client_id, platform, note, status, requested_at, fulfilled_at, products_released | Client requests |
| `automation_jobs` | id, job_name, status, trigger_type, started_at, completed_at, records_processed, api_cost_estimate | Job tracking |
| `scan_history` | id, scan_mode, client_id, started_at, completed_at, products_found, hot_products, cost_estimate | Scan audit trail |
| `outreach_emails` | id, influencer_id, product_id, subject, body, sent_at, resend_id, status | Email tracking |
| `notifications` | id, user_id, type, title, body, product_id, read, created_at | System notifications |
| `imported_files` | id, filename, type, source_platform, rows_imported, errors, uploaded_at | CSV import log |
| `trend_keywords` | id, keyword, platform, score, direction | Trend tracking |

### 21.2 New Tables Required (Phase 1–4)

```sql
-- Client subscription management (Stripe integration)
CREATE TABLE client_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, past_due, cancelled, trialing
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Per-platform access control
CREATE TABLE client_platform_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- tiktok, amazon, shopify, digital, ai_affiliate
    tier TEXT NOT NULL, -- explorer, seller, professional, enterprise
    product_limit INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, platform)
);

-- Engine toggle configuration per client
CREATE TABLE client_engine_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    engine TEXT NOT NULL, -- discovery, store_integration, marketing, content, influencer, supplier, affiliate, analytics
    enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, platform, engine)
);

-- Client usage tracking
CREATE TABLE client_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    metric TEXT NOT NULL, -- products_viewed, content_generated, influencer_invites, etc.
    count INTEGER DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    UNIQUE(client_id, platform, metric, period_start)
);

-- Client add-on purchases
CREATE TABLE client_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    addon_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    stripe_item_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- OAuth channel connections
CREATE TABLE client_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    channel_type TEXT NOT NULL, -- shopify, tiktok_shop, amazon, instagram, facebook, youtube, twitter, pinterest, linkedin
    channel_name TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[],
    is_active BOOLEAN DEFAULT true,
    connected_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, channel_type)
);

-- Content generation queue
CREATE TABLE content_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    channel_id UUID REFERENCES client_channels(id),
    content_type TEXT NOT NULL, -- social_post, ad_copy, email, video_script
    content TEXT,
    status TEXT DEFAULT 'pending', -- pending, generated, scheduled, published, failed
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Client order tracking
CREATE TABLE client_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES client_channels(id),
    external_order_id TEXT NOT NULL,
    product_name TEXT,
    customer_email TEXT,
    status TEXT DEFAULT 'pending', -- pending, confirmed, shipped, delivered
    tracking_number TEXT,
    tracking_url TEXT,
    order_total DECIMAL(10,2),
    ordered_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform configuration
CREATE TABLE platform_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    base_price DECIMAL(10,2),
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Section 22 — Product Intelligence Model

### 22.1 Product Fields

Every product record includes:

- **Identity:** name, platform, external_id, category, image_url
- **Pricing:** price, cost (if known), estimated margin
- **Scoring:** trend_score, viral_score, profit_score, final_score (all 0–100)
- **Classification:** trend_stage (emerging/rising/exploding/saturated), tier (HOT/WARM/WATCH/COLD)
- **Intelligence:** ai_insight_haiku (short), ai_insight_sonnet (detailed, on-demand)
- **Metadata:** created_at, updated_at, scan_id, source_actor

### 22.2 Scoring Formulas

**Final Opportunity Score:**
```
final_score = (trend_score × 0.40) + (viral_score × 0.35) + (profit_score × 0.25)
```

**Trend Opportunity Score:**
```
trend_score = (TikTok Growth × 0.35) + (Influencer Activity × 0.25) + (Amazon Demand × 0.20) + (Competition × −0.10) + (Profit Margin × 0.10)
```

**Early Viral Score:**
```
viral_score = (Micro-Influencer Convergence × 0.25) + (Purchase Intent × 0.20) + (Hashtag Acceleration × 0.20) + (Niche Expansion × 0.15) + (Engagement Velocity × 0.10) + (Supply Response × 0.10)
```

**Profitability Score:**
```
profit_score = (Profit Margin × 0.40) + (Shipping Feasibility × 0.20) + (Marketing Efficiency × 0.20) + (Supplier Reliability × 0.10) − (Operational Risk × 0.10)
```

### 22.3 Score Tiers

| Score Range | Badge | System Action |
|---|---|---|
| 80–100 | HOT | Top of dashboard, push notification, admin email, queue for client allocation |
| 60–79 | WARM | Show with positive badge, include in client reports |
| 40–59 | WATCH | Archive — monitor for score change over 7 days |
| Below 40 | COLD | Auto-archive — stored 90 days then purged |

### 22.4 AI Insight Tiers

| Score | AI Model | Output |
|---|---|---|
| 75+ | Claude Sonnet | Full strategic insight, marketing angle, 5-point launch checklist (ON DEMAND only) |
| 60+ | Claude Haiku | 3-sentence scoring explanation |
| Below 60 | None | No AI analysis |

### 22.5 Known Scoring Bugs

- **BUG-035 (HIGH):** Frontend `composite.ts` has a legacy `calculateCompositeScore()` using 60/40 weighting alongside the correct 3-pillar functions. Must be removed.
- **BUG-036 (MEDIUM):** Backend heuristic scoring and frontend weighted scoring produce different results for the same product. Both stored in same DB fields without distinction.
- **BUG-037 (LOW):** Legacy `overall_score` alias could contain different value than `final_score` if wrong function is called.

---

## Section 23 — Creator / Influencer Intelligence Model

### 23.1 Data Fields Per Influencer

| Field | Required | Notes |
|---|---|---|
| Username + Platform | Yes | TikTok / Instagram / YouTube / Pinterest |
| Follower Count + Tier | Yes | Nano / Micro / Mid / Macro |
| Average Views Per Post | Yes | Last 30 posts |
| Engagement Rate | Yes | (Likes + Comments) / Followers |
| US Audience % | Yes | Target: 50%+ US |
| Fake Follower Score | Yes | Reject if <70% real followers |
| Niche / Category | Yes | Beauty, Tech, Lifestyle, Home, Fitness, etc. |
| Contact Email | High | Public bio or scraped |
| Video URLs for Product | Yes | Every video posted about target product |
| Estimated Cost Per Post | Yes | Tier benchmark rates |
| Conversion Score | Yes | Formula below |
| Commission Preference | High | % preferred vs flat fee |

### 23.2 Conversion Score Formula

```
Conversion Score (0–100) =
  (Engagement Rate × 30%) +
  (Purchase Intent Comment Ratio × 25%) +
  (Product Demo Quality × 20%) +
  (Audience Trust Signals × 15%) +
  (US Audience % × 10%)
```

### 23.3 Influencer Tier Pricing

| Tier | Followers | Est. Cost/Post | Best For |
|---|---|---|---|
| Nano | 1K–10K | $20–$100 | Hyper-niche, authentic, lowest cost |
| Micro | 10K–100K | $100–$500 | High engagement, niche targeting |
| Mid-Tier | 100K–1M | $500–$5,000 | Balanced reach + engagement |
| Macro | 1M+ | $5,000+ | Mass market, brand awareness |

### 23.4 One-Click Influencer Invite

**NEW in v7:** Add a prominent "Invite" button on each influencer card in both admin and client dashboards. Clicking generates a personalised outreach email via Claude Haiku and sends via Resend. The email includes: first name, product name, niche reference, affiliate/commission offer, sample product request template, video brief with hook structure. All outreach tracked in `outreach_emails` table with status updates.

### 23.5 Data Sources (Free First)

| Source | Cost | Quality | Platforms |
|---|---|---|---|
| Ainfluencer | 100% Free | Good | Instagram, TikTok, YouTube |
| Modash free tier | Free (20 results) | High | Instagram, TikTok, YouTube |
| Influencers.club | Free signup | High (340M profiles) | All platforms |
| HypeAuditor free tier | Free limited | High + fake detection | Instagram, TikTok |
| TikTok Creator Marketplace | Free official API | High | TikTok only |
| YouTube Data API v3 | Free 10k/day | Accurate | YouTube only |
| Pinterest Creator API | Free business | Good | Pinterest only |
| Apify scraper (fallback) | Apify credits | Medium | Instagram, TikTok |

---

## Section 24 — Video Intelligence Model

### 24.1 Video Data Points

For each product-related video detected:

- Video URL, platform, creator, post date
- View count, like count, comment count, share count
- Engagement rate per hour in first 6 hours (velocity metric)
- Purchase intent comments (detected via Claude Haiku NLP)
- Product tags / hashtags used
- Trend lifecycle signals

### 24.2 The Six Pre-Viral Detection Signals

| Signal | Detection Rule | Weight | Method |
|---|---|---|---|
| 1. Micro-Influencer Convergence | 15–20 micro creators (5K–150K) posting same product within 48hrs, avg engagement >8% | 25% | Apify TikTok + cluster algo |
| 2. Comment Purchase Intent | High ratio of buy-intent comments: "where to buy", "link please", "I need this" | 20% | Claude Haiku NLP |
| 3. Hashtag Acceleration | Hashtag grows from <50 to 500+ videos/day within 48hrs — exponential | 20% | Hourly hashtag delta |
| 4. Creator Niche Expansion | Product crosses from 1 niche to 3+ niches within 7 days | 15% | Creator category tracking |
| 5. Engagement Velocity | Views/likes/comments per HOUR in first 3–6 hours | 10% | Time-series sampling |
| 6. Supply-Side Response | New Amazon/eBay/AliExpress listings appear within days of social signal | 10% | Daily new listing delta |

### 24.3 Trend Lifecycle Classification

| Stage | Score Range | Indicators | Action |
|---|---|---|---|
| Emerging | 70–100 | Small creators, rapid hashtag growth, low saturation | LAUNCH NOW alert |
| Rising | 50–69 | Multiple influencers, growing demand, some competitors | WORTH CONSIDERING |
| Exploding | 30–49 | Large creators, ads everywhere, many stores | HIGH COMPETITION — late entry risky |
| Saturated | <30 | Hundreds of stores, declining engagement, price wars | Auto-archive |

---

## Section 25 — Shop / Seller Intelligence Model

### 25.1 Competitor Store Intelligence

For every product scoring 60+, automatically identify competitor stores:

**Platforms Monitored:** TikTok Shop, Shopify stores, Amazon, eBay, Etsy, Temu, AliExpress

**Discovery Methods:**
1. **Product Listing Detection** — Search each platform, extract: store name, price, listing date, estimated sales
2. **Influencer Store Mapping** — Extract product links from top videos, identify destination store
3. **Ad Creative Monitoring** — Meta Ads Library, TikTok Ads Library, Google Shopping

**Key Insight:** Ads running 30+ days almost always indicate a profitable campaign — flag as HIGH CONFIDENCE signals.

### 25.2 Competitor Output Fields

| Field | Description |
|---|---|
| Store Name + URL | Competitor identity |
| Platform | TikTok Shop / Shopify / Amazon / eBay / Etsy / Temu |
| Estimated Monthly Sales | Revenue estimate using proxy signals |
| Primary Traffic Source | TikTok influencers / Paid ads / Organic / Pinterest |
| Influencers Promoting | Count and top profiles |
| Ad Activity | Active campaigns, duration, creative style |
| Pricing Strategy | Lowest / average / highest in market |
| Bundle / Upsell Strategy | Detected patterns |
| Store Success Score | 0–100 composite |
| Recommended Entry Strategy | AI-generated differentiation strategy |

---

## Section 26 — Ad Intelligence Model

### 26.1 Ad Campaign ROI Benchmarks

| Channel | Target ROAS | Typical CPA | Best For |
|---|---|---|---|
| TikTok Influencer (organic) | 5×–15× | $2–$10 | Impulse $10–$60 products |
| TikTok Paid Ads | 3×–8× | $8–$25 | Products with proven traction |
| Meta (Facebook/Instagram) | 2×–5× | $10–$40 | Broad audience physical products |
| Amazon PPC | 3×–7× (ACoS <25%) | $5–$20 | Search-intent products |
| Google Shopping | 3×–8× | $10–$30 | Higher-ticket, specific search |
| Pinterest Ads | 2×–6× | $5–$20 | Visual lifestyle, home, beauty |
| Affiliate (no ad spend) | Unlimited | $0 | Digital products, AI tools, SaaS |

### 26.2 Ad Intelligence Data Sources

- Meta Ads Library public API (free) — competitor ad creatives, duration, active status
- TikTok Ads Library public search (free) — trending product ads
- Google Shopping via SerpAPI (100 free/mo) — active product ads

---

## Section 27 — Affiliate / Monetisation Intelligence Model

### 27.1 Affiliate Program Database

The platform maintains a curated, frequently updated database of affiliate programs. Pre-seeded with 10 AI programs and 5 physical programs. Discovery sources: Product Hunt API, PartnerStack, AppSumo, Twitter/X.

### 27.2 Client Affiliate Workflow

```
Client subscribes to AI Affiliate module
    → Sees curated affiliate opportunity database
    → Clicks "Start Promoting" on chosen program
    → Signs up for program using THEIR OWN affiliate link
    → YouSell Content Engine generates promotional content
    → Content distributed to client's connected channels
    → Conversions (signups) earn commission for CLIENT (100%)
    → Client pays YouSell subscription for the platform and automation
```

### 27.3 Anti-Churn Design

Content and automation are the value — not the data. The moment a client cancels:
- AI content generation stops
- Auto-posting to channels stops
- New opportunity alerts stop
- Performance optimization intelligence is lost
- Seasonal campaign automation stops

---

## Section 28 — Product Clustering Logic

### 28.1 Clustering Approach

Products are clustered by:
- **Category similarity** — Same product type across platforms (e.g., "ice roller" on TikTok + Amazon + Shopify)
- **Keyword overlap** — Shared keywords in product names and descriptions
- **Influencer overlap** — Same influencers promoting similar products
- **Trend correlation** — Products trending together on Google Trends

### 28.2 Cross-Platform Intelligence

When a product is detected on one platform, automatically check for presence on others. This enables:
- Multi-channel opportunity identification
- Demand validation across ecosystems
- Price comparison across marketplaces

---

## Section 29 — Trend Detection and Scoring Logic

### 29.1 The AI Trend Scout Agent

The most differentiating module. While competitors show what is currently selling, this agent detects what is about to explode — 2 to 3 weeks before mainstream adoption.

**Core Question:** "What products are starting to explode in attention and have not yet reached mainstream adoption?"

### 29.2 Platforms Monitored

**Social Discovery Layer (earliest signal):**
- TikTok — hashtag growth velocity, video creation rate, comment sentiment, creator count
- Instagram Reels — trending product hashtags and creator adoption (Apify)
- YouTube Shorts — rising product demonstration videos (YouTube API)
- Pinterest — trending product pins, board saves velocity (Apify)

**Ecommerce Demand Confirmation Layer:**
- Amazon — BSR movements, new listing growth, review velocity
- eBay — new listing growth, price increases due to demand
- TikTok Shop — GMV data, new product additions
- Etsy — trending product searches and listing growth
- Temu — new category trending products (supply signal only)
- AliExpress — new listing growth indicating manufacturing response

**Trend Intelligence Layer:**
- Google Trends — pytrends, batched 5 keywords per request
- Reddit API — r/shutupandtakemymoney, r/ecommerce, r/TikTokShop
- Twitter/X API (free basic) — product announcements
- Product Hunt — AI tool launches, digital product debuts

### 29.3 Pre-Viral Score Threshold

Products above 70/100 are classified as PRE-VIRAL OPPORTUNITIES. Products above 85 trigger immediate push notification + email to admin.

---

## Section 30 — Creator-Product Matching Engine

### 30.1 Matching Algorithm

For each product scoring 60+, find matching creators based on:

1. **Niche alignment** — Creator's category matches product category
2. **Audience demographics** — US audience percentage, age range overlap
3. **Engagement quality** — Engagement rate > 3%, fake follower score > 70%
4. **Historical product promotion** — Has promoted similar products before
5. **Price range fit** — Creator's typical product price range matches

### 30.2 Influencer ROI Model

```
Estimated Profit per Post =
  (Video Views × Estimated Conversion Rate 0.3–1%) × Product Profit per Unit

Example: 500K views × 5% engagement × 0.5% conversion = 1,250 sales × $12 profit = $15,000
```

---

## Section 31 — Marketplace Matching Logic

For each product, identify the optimal marketplace(s) for launch based on:

- Product type (physical vs digital)
- Price point (impulse <$60 → TikTok, premium → Shopify, search-intent → Amazon)
- Competition density per platform
- Margin requirements per platform (Amazon 15% fee vs TikTok 5–8% vs Shopify 0%)
- Target audience platform preferences

---

## Section 32 — Opportunity Feed Logic

### 32.1 Admin Opportunity Feed

Real-time scrolling feed on admin dashboard showing:
- Newly detected products with trend stage
- Score changes (product went from WARM to HOT)
- New influencer matches for 60+ products
- New competitor store detections
- System events (scan started/completed, errors)

### 32.2 Client Opportunity Feed

Scoped to client's subscribed platforms and allocated products:
- New products released to their account
- Score updates on their products
- Suggested actions (add to store, create content, reach out to influencer)
- Locked platform teasers ("47 HOT products on Amazon this week — upgrade to unlock")

---

## Section 33 — Search and Filtering Architecture

### 33.1 Product Search

All product pages must support:
- Full-text search across product names and descriptions
- Filter by platform, category, trend stage, score range
- Sort by: final_score, trend_score, viral_score, profit_score, created_at, price
- Pagination with configurable page size

### 33.2 Known Search Issues

- **BUG-049 (MEDIUM):** Products table lacks an index on `name` or `platform` — search may be slow at scale.
- **BUG-045 (MEDIUM):** Product sort field not whitelisted — `sortBy` query param passed directly to Supabase `.order()`, allowing arbitrary column sorting.

---

## Section 34 — Analytics and Dashboard Requirements

### 34.1 Admin Dashboard KPIs

- Total products discovered (by platform)
- HOT / WARM / WATCH / COLD distribution
- Products discovered this week vs last week
- Top trending categories
- Scan history with cost tracking
- API cost this month
- Client count and subscription MRR

### 34.2 Client Dashboard KPIs

- Products allocated to client (by platform)
- Top scoring products with trend direction
- Content generated this month
- Influencer outreach stats (sent / opened / replied)
- Revenue estimates for top products
- Platform-specific metrics (BSR for Amazon, GMV for TikTok)

### 34.3 Realtime Updates

Admin dashboard has Supabase Realtime subscriptions on `products` table with 2-second debounce. Changes trigger automatic UI refresh without page reload.

---

## Section 35 — Admin Dashboard Information Architecture

### 35.1 Navigation Structure

**Admin Sidebar:**
1. Dashboard (home)
2. Products (with sub-tabs: All, TikTok, Amazon, Shopify, Pinterest, Digital, Affiliates)
3. Trends
4. Scan Control
5. Scoring
6. Influencers
7. Suppliers
8. Competitors
9. Financial Models
10. Launch Blueprints
11. Clients
12. Allocations
13. Automation
14. Import
15. Notifications
16. Settings

### 35.2 Scan Control Panel

Prominent on the dashboard homepage. Contains:
- Large labelled buttons for Quick / Full / Client scan
- Confirmation dialog with estimated cost and duration
- Real-time progress bar and step-by-step status log
- Abort button for graceful cancellation
- Last scan timestamp
- Scan history log

---

## Section 36 — Platform Gating and Upsell Architecture (NEW)

### 36.1 Gating Philosophy

**Never show blank walls. Show clients what they're MISSING.** (See Section 3.5 — Data Visibility Philosophy)

**Core rule:** The paywall is on automation and actions, NOT on seeing data. Even locked platforms should display impressive aggregate intelligence to create natural upgrade urgency.

For platforms a client hasn't subscribed to, show:
- Aggregate stats: "47 HOT products on Amazon this week"
- Average scores, profit ranges, top category names
- Blurred product cards (visible but unreadable)
- Weekly email digest: "You missed 47 HOT products on Amazon this week"
- Prominent "Unlock Amazon — $49/mo" CTA button

### 36.2 Engine Toggle System

Each modular engine can be enabled/disabled per client per platform:

| Engine | What It Unlocks |
|---|---|
| Product Discovery | View scored products on this platform |
| Store Integration | Push products to client's store (Shopify/TikTok/Amazon) |
| Marketing & Ads | AI ad copy generation, campaign blueprints |
| Content Creation | AI social media post generation and scheduling |
| Influencer Outreach | Creator matching, one-click invite, outreach tracking |
| Supplier Intelligence | Supplier matching, MOQ, pricing, shipping estimates |
| AI Affiliate Revenue | Affiliate opportunity database, content automation |
| Analytics & Profit | Financial models, ROI tracking, profit projections |

### 36.3 Client Engine Configuration API

```
GET  /api/dashboard/engines          → List enabled engines for current client
POST /api/dashboard/engines/:id/toggle → Enable/disable engine (if plan allows)
GET  /api/admin/clients/:id/engines  → Admin view of client's engine config
POST /api/admin/clients/:id/engines  → Admin override engine settings
```

---

# PART III — API, OPERATIONS & EXECUTION

---

## Section 37 — API Design Principles

### 37.1 Core Principles

1. **RESTful routing** — Resource-based URLs, standard HTTP methods
2. **Authentication required** — Every admin route calls `requireAdmin()`, every dashboard route calls `requireClient()`
3. **Input validation** — Whitelist allowed fields on all POST/PUT operations. Never spread raw `req.body` into database inserts
4. **Consistent error responses** — JSON `{ error: string }` with appropriate HTTP status codes
5. **Pagination** — All list endpoints support `page`, `limit`, `sortBy`, `sortOrder` query params
6. **Rate limiting** — 100 req/min general, 10 req/min for expensive operations (scans)
7. **No scraping in handlers** — API routes serve cached/stored data only

### 37.2 API Route Authentication

```typescript
// Admin route pattern
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;
  // ... handler logic using authResult.user
}

// Client dashboard route pattern
export async function GET(req: NextRequest) {
  const authResult = await requireClient();
  if (authResult.error) return authResult.error;
  // ... handler logic scoped to authResult.client
}
```

---

## Section 38 — Suggested Endpoint Map

### 38.1 Existing Admin API Routes (22 routes)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/admin/products | List products (filterable, paginated) |
| GET | /api/admin/tiktok | TikTok products |
| GET | /api/admin/amazon | Amazon products |
| GET | /api/admin/pinterest | Pinterest products |
| GET | /api/admin/shopify | Shopify products |
| GET | /api/admin/digital | Digital products |
| GET | /api/admin/affiliates | Affiliate products |
| GET/POST | /api/admin/influencers | List/create influencers |
| GET/POST | /api/admin/suppliers | List/create suppliers |
| GET/POST | /api/admin/competitors | List/create competitors |
| GET/POST | /api/admin/clients | List/create clients |
| GET/POST | /api/admin/allocations | List/create allocations |
| GET | /api/admin/dashboard | Dashboard KPIs |
| GET/POST | /api/admin/scan | Scan management |
| DELETE | /api/admin/scan | Cancel scan |
| POST | /api/admin/scoring | Score products |
| GET/POST | /api/admin/financial | Financial models |
| GET/POST | /api/admin/blueprints | Launch blueprints |
| GET | /api/admin/blueprints/[id]/pdf | PDF export |
| GET/POST | /api/admin/automation | Automation jobs |
| GET/POST/PATCH | /api/admin/notifications | Notifications |
| GET/POST | /api/admin/settings | System settings |
| POST | /api/admin/import | CSV/Excel import |
| GET | /api/admin/trends | Trend data |

### 38.2 Existing Dashboard API Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/dashboard/products | Client's allocated products |
| GET/POST | /api/dashboard/requests | Product requests |

### 38.3 New API Routes Required (Phase 1–4)

| Method | Endpoint | Purpose | Phase |
|---|---|---|---|
| POST | /api/webhooks/stripe | Stripe webhook handler | 1 |
| GET | /api/dashboard/subscription | Client's subscription details | 1 |
| POST | /api/dashboard/subscription/portal | Stripe Customer Portal session | 1 |
| GET | /api/dashboard/engines | Client's enabled engines | 2 |
| POST | /api/dashboard/engines/:id/toggle | Toggle engine on/off | 2 |
| GET | /api/dashboard/channels | Connected channels | 3 |
| POST | /api/dashboard/channels/connect | Initiate OAuth flow | 3 |
| DELETE | /api/dashboard/channels/:id | Disconnect channel | 3 |
| GET | /api/dashboard/content | Content queue | 3 |
| POST | /api/dashboard/content/generate | Generate content | 3 |
| GET | /api/dashboard/orders | Client's orders | 4 |
| POST | /api/webhooks/shopify | Shopify order webhooks | 4 |
| POST | /api/webhooks/tiktok | TikTok order webhooks | 4 |
| GET/POST | /api/admin/clients/:id/engines | Admin engine management | 2 |
| GET | /api/admin/clients/:id/usage | Admin usage tracking | 2 |
| GET | /api/admin/revenue | MRR and subscription analytics | 1 |

---

## Section 39 — Background Jobs and Worker Definitions

### 39.1 Current Worker Jobs

| Job Type | Trigger | Actions | Status |
|---|---|---|---|
| quick-scan | Manual button | TikTok Creative Center + pytrends + Reddit, Haiku scoring | ✅ Built |
| full-scan | Manual button | All 7 channels, viral signals, influencer matching, Haiku + Sonnet | ✅ Built |
| client-scan | Manual button | Full pipeline scoped to client niche | ✅ Built |

### 39.2 New Worker Jobs Required

| Job Type | Trigger | Actions | Phase |
|---|---|---|---|
| content-generate | Client request / schedule | Generate marketing content via Claude Haiku, queue for distribution | 3 |
| content-distribute | Schedule (daily) | Post generated content to connected channels via OAuth | 3 |
| order-tracking | Webhook from store | Process order events, send email sequence via Resend | 4 |
| influencer-refresh | Schedule (weekly) | Update influencer metrics for all tracked creators | Existing (disabled) |
| supplier-refresh | Schedule (monthly) | Update supplier data, pricing, availability | Existing (disabled) |
| affiliate-refresh | Schedule (weekly) | Discover new affiliate programs, update commission rates | Existing (disabled) |

### 39.3 Manual Scan Pipeline Sequence

```
1.  ADMIN presses Quick / Full / Client scan button
2.  CONFIRM dialog: mode, estimated duration, estimated cost
3.  JOB CREATED in BullMQ → Supabase Realtime pushes "Scan Started"
4.  TREND SCOUT: TikTok Creative Center + pytrends + Reddit + viral signals
5.  PRODUCT EXTRACTION: Claude Haiku NLP extracts and clusters product names
6.  DISCOVERY: All channel modules run concurrently
7.  ENRICHMENT: Cost structure, supplier pricing, competitor data
8.  SCORING: Three scores + Final Score + tier classification
9.  FILTER: <40 archived, 40–59 watch, 60+ proceed to full analysis
10. INFLUENCER MATCH: For 60+ products — find and score creators
11. SUPPLIER MATCH: For 60+ physical products — locate suppliers
12. FINANCIAL MODEL: Full unit economics for 60+ products
13. BLUEPRINT: Claude Sonnet for 75+ (on demand only)
14. COMPETITOR INTEL: Identify stores, estimate revenue, extract strategy
15. PERSIST: All data to Supabase with relational links
16. REALTIME PUSH: Dashboard updates via Supabase Realtime
17. NOTIFY: Resend email + push notification for HOT (80+) products
18. SCAN COMPLETE: Summary card with products found, hot count, cost, duration
```

---

## Section 40 — Logging, Audit Trail, and Monitoring

### 40.1 Audit Logging

All admin actions are logged: user ID, timestamp, action type, affected record IDs. Stored in `scan_history` and `automation_jobs` tables.

### 40.2 Error Logging

- All routes wrap in try/catch with `console.error` and 500 response
- Missing API keys: providers return empty arrays with `console.warn`
- Email failures: caught, logged, never crash the worker
- Redis errors: logged via event listener

### 40.3 Known Logging Issues

- **BUG-030 (MEDIUM):** API keys appear in error logs when included in URL query strings. Must redact in error logging.
- **BUG-031 (LOW):** `fetchTrends` fails silently with empty catch — no logging. Other functions log errors.

---

## Section 41 — Error Handling and Retry Design

### 41.1 BullMQ Retry Policy

Default: 3 retries with exponential backoff. Configurable per job type.

### 41.2 Provider Error Handling

Every provider follows this pattern:
1. Check if API key exists → if not, return empty array (graceful degradation)
2. Make API call with timeout (30s for REST, 60s for Apify actors)
3. On HTTP error → log error, return empty array
4. On network timeout → caught by catch block, return empty array
5. On success → parse response, return normalised data

### 41.3 Required Improvements

- **Dead letter queue** for permanently failed jobs
- **Graceful shutdown** on SIGTERM for worker
- **Circuit breaker** for external APIs that are consistently failing
- **API key redaction** in all error log output

---

## Section 42 — Recovery and Continuity Protocol for Claude Code

### 42.1 Mandatory Pre-Development Protocol

Before writing ANY code, Claude Code MUST:

1. **Read these files in order:**
   - `CLAUDE.md` — Project rules and guardrails
   - `docs/YouSell_Platform_Technical_Specification_v7.md` — This document (canonical architecture)
   - `ai/project_state.md` — Current development progress
   - `ai/task_board.md` — Active task tracking
   - `development_log.md` — Recent changes log

2. **Inspect existing modules** before creating replacements

3. **Check for existing implementations** before writing new code — search the codebase first

### 42.2 Mandatory Post-Development Protocol

After completing ANY meaningful implementation:

1. Update `development_log.md` with what was changed
2. Update `ai/project_state.md` with new completion status
3. Update `ai/task_board.md` if tasks were completed
4. Commit changes with descriptive message

### 42.3 Non-Negotiable Claude Code Rules

1. **Never rebuild completed functionality.** Always inspect first.
2. **Never overwrite architecture files blindly.** Read before writing.
3. **Never run scraping inside API request handlers.** Workers only.
4. **Never create duplicate implementations.** Search existing code first.
5. **Never skip the context recovery protocol.** Read all memory files before coding.
6. **Continue from the latest logged development step.** Never restart from scratch.
7. **Maintain repo documentation in parallel with code changes.** Keep files consistent.
8. **Treat this specification as the primary architecture reference** unless a newer canonical file explicitly replaces it.
9. **Use mock data for unconnected APIs.** Mark mock data clearly in the UI.
10. **Prefer free APIs.** Introduce paid APIs only when free alternatives cannot deliver.
11. **Maximise the existing stack.** Netlify, Supabase, Railway, GitHub, Resend.
12. **Apply cost optimisations from day one.** They are architectural decisions, not afterthoughts.

---

## Section 43 — Required System Memory Files

### 43.1 Canonical Files (Source of Truth)

| File | Purpose | Precedence |
|---|---|---|
| `docs/YouSell_Platform_Technical_Specification_v7.md` | Master architecture specification | #1 — Highest |
| `CLAUDE.md` | Project rules, guardrails, and development instructions | #2 |
| `ai/project_state.md` | Current development progress | #3 |
| `ai/task_board.md` | Active tasks and priorities | #4 |
| `development_log.md` | Change history and session log | #5 |
| `ai/qa-bug-tracker.md` | Known bugs with severity and status | Reference |
| `ai/YOUSELL_DEVELOPER_HANDOFF.md` | Developer handoff document | Reference |
| `ai/platform_strategy.md` | Business strategy and pricing research | Reference |
| `ai/pricing_strategy_prompt.md` | Pricing strategy execution prompt | Reference |

### 43.2 Deprecated Files

These files contain OUTDATED information and should NOT be treated as authoritative:

| File | Status | Reason |
|---|---|---|
| `YouSell_BuildBrief_v6_DEFINITIVE.docx` | Superseded | Replaced by this v7 specification |
| `YOUSELL_MASTER_BUILD_BRIEF_v4.pdf` | Superseded | Two versions behind |
| `YOUSELL_MASTER_BUILD_BRIEF_v5.pdf` | Superseded | One version behind |
| `YOUSELL_OPUS_MASTER_PROMPT_v1 (1).md` | Superseded | Old autonomous prompt |
| `ai_operating_manual.md.txt` | Superseded | Replaced by CLAUDE.md |
| `CLAUDE AUTONOMOUS DEVELOPMENT SYSTEM PROMPT.pdf` | Superseded | Old system prompt |
| `AUDIT_REPORT.md` | Superseded | Replaced by ai/qa-bug-tracker.md |
| `QA_AUDIT_REPORT.md` | Superseded | Replaced by ai/qa-bug-tracker.md |
| `YOUSELL_FIX_STRATEGY_PROMPT.md` | Completed | Fixes applied via PR #6 |
| `YOUSELL_QA_FIX_PROMPT.md` | Completed | QA prompts executed |
| `YOUSELL_QA_TESTING_PROMPT.md` | Completed | QA testing executed |
| `EXECUTE_ALL_FIXES.md` | Completed | Fixes applied |
| `quality check.txt` | Superseded | Informal notes |
| `YouSell_QA_Audit_Report.md` | Superseded | Replaced by ai/qa-bug-tracker.md |
| `YouSell_QA_Master_Prompt.md` | Completed | QA prompt executed |

### 43.3 Precedence Rule

If any deprecated file conflicts with this v7 specification, the v7 specification takes precedence. If an even newer file is created, it must explicitly declare itself as the new canonical source and reference this v7 document.

---

## Section 44 — Repository Rules and Guardrails

### 44.1 Development Rules

1. **Do NOT rebuild completed functionality.** Always inspect first.
2. **Always inspect the repository before creating new files.**
3. **Only implement missing or broken components.**
4. **Always check the task board before starting work.**
5. **Use the existing Supabase singleton client.** Do not create new instances.
6. **Use Apify actors as the primary scraping method.**
7. **Ensure compatibility with Netlify deployment constraints.**
8. **Build phase by phase.** Deploy and verify each phase before starting the next.
9. **Use mock data for every unconnected API.** Mark clearly with UI banner.
10. **API keys in environment variables only** — never in source code or client bundles.

### 44.2 Code Quality Standards

- TypeScript strict mode
- ESLint + Prettier formatting
- Supabase RLS on every table
- All admin routes require `requireAdmin()` authentication
- All dashboard routes require `requireClient()` authentication
- Rate limiting on all endpoints
- Sanitise all inputs (prevent SQL injection, XSS, path traversal)
- HTTPS enforced (Netlify and Railway auto-SSL)
- CSRF protection on all POST endpoints
- Helmet security headers on backend

### 44.3 Git Practices

- Feature branches for all changes
- Descriptive commit messages
- PR-based merges to main
- Auto-deploy on push to main (Netlify + Railway)

---

## Section 45 — Development Phases and Sequence

### 45.1 Completed Phases (From v6 Build Brief)

| Phase | Tasks | Status |
|---|---|---|
| 1 — Scaffold | Next.js 14 + TypeScript + Tailwind + shadcn/ui + Supabase + Netlify | ✅ Complete |
| 2 — Auth + Admin Nav | Supabase RBAC, admin role, admin layout with sidebar | ✅ Complete |
| 3 — Railway Backend | Express + BullMQ + Redis, worker sleep mode | ✅ Complete |
| 4 — Database | All Supabase tables, RLS, migrations | ✅ Complete |
| 5 — Setup + CSV Import | API key management, automation toggles, CSV import | ✅ Complete |
| 6 — Scan Control | Manual scan panel, BullMQ integration, progress tracking | ✅ Complete |
| 7 — Trend Scout | AI Trend Scout with viral signals, Haiku NLP | ✅ Complete |
| 8 — TikTok Module | Apify + ScrapeCreators + CSV import | ✅ Complete |
| 9 — Amazon Module | PA-API + Apify + RapidAPI + SerpAPI | ✅ Complete |
| 10 — Shopify + Pinterest | Store scraper + Ads Library + Pinterest API | ✅ Complete |
| 11 — Digital + Affiliates | All 7 tabs functional | ✅ Complete |
| 12 — Competitor Intel | Store mapping, ad monitoring, Claude Sonnet insight | ✅ Complete |
| 13 — Scoring Engine | Composite scoring, tier classification, AI insights | ✅ Complete |
| 14 — Profitability | Cost calculator, margin checker, auto-rejection | ✅ Complete |
| 15 — Influencer + Supplier | Influencer scoring, supplier matching | ✅ Complete |
| 16 — Financial + Blueprint | Financial models, launch blueprints, PDF export | ✅ Complete |
| 17 — Dashboard | Web UI with Supabase Realtime | ✅ Complete |

### 45.2 Current Phase — Bug Fixes

44 bugs identified in QA audit. 3 CRITICAL, 9 HIGH, 21 MEDIUM, 8 LOW. Must fix CRITICAL and HIGH before proceeding to new phases.

### 45.3 New Development Phases (v7)

| Phase | Tasks | Estimated Effort | Dependencies |
|---|---|---|---|
| A — Critical Bug Fixes | Fix 3 CRITICAL + 9 HIGH bugs from QA audit | 1–2 days | None |
| B — Stripe Integration | Stripe Checkout, webhooks, subscription management, Customer Portal | 3–5 days | Phase A |
| C — Platform Gating | Per-platform access control, engine toggles, upsell UI | 3–5 days | Phase B |
| D — Store Integration | OAuth for Shopify, TikTok Shop, Amazon. Product push to stores. | 5–7 days | Phase C |
| E — Content Engine | AI content generation, scheduling, distribution to connected channels | 5–7 days | Phase D |
| F — Order Tracking | Store webhooks, order tracking emails via Resend (5-step sequence) | 3–5 days | Phase D |
| G — Influencer Outreach v2 | One-click invite, automated follow-ups, outreach tracking | 2–3 days | Phase A |
| H — Mobile App | React Native + Expo, all screens, push notifications, biometric auth | 10–14 days | Phase C |
| I — QA + App Store | Full integration testing, Lighthouse audit, EAS Build, app store submission | 5–7 days | Phase H |

---

## Section 46 — Completion Roadmap From Current State

### 46.1 Current State Assessment

**What works:**
- 22 admin dashboard pages fully functional
- 4 client dashboard pages functional
- Backend API with 22 routes
- BullMQ worker with scan pipeline
- 8 Apify provider integrations
- 3-pillar scoring engine
- Provider abstraction layer
- CSV import pipeline
- Supabase auth + RLS (with known bugs)
- Email via Resend

**What's broken (from QA audit):**
- Admin layout has no role check (any authenticated user sees admin UI)
- Backend has no RBAC (any user can trigger scans)
- Clients table RLS blocks client queries
- Legacy scoring function conflicts with current model
- Backend writes to wrong table name (`scans` vs `scan_history`)
- Input validation missing on multiple POST routes

**What's missing:**
- Stripe payment integration
- Store integrations (Shopify/TikTok/Amazon push)
- Content creation engine
- Marketing channel OAuth
- Order tracking
- Engine toggle system
- Platform gating UI
- Mobile app

### 46.2 Estimated Timeline

| Phase | Duration | Cumulative |
|---|---|---|
| A — Bug Fixes | 1–2 days | Week 1 |
| B — Stripe | 3–5 days | Week 2 |
| C — Platform Gating | 3–5 days | Week 3 |
| D — Store Integration | 5–7 days | Week 4–5 |
| E — Content Engine | 5–7 days | Week 6–7 |
| F — Order Tracking | 3–5 days | Week 8 |
| G — Influencer v2 | 2–3 days | Week 8–9 |
| H — Mobile App | 10–14 days | Week 10–12 |
| I — QA + App Store | 5–7 days | Week 13–14 |

**Total estimated: 14–16 weeks from current state to full production.**

---

## Section 47 — QA and Testing Strategy

### 47.1 QA Audit Results (Completed)

Full codebase audit completed across 10 sprints, covering:
- Auth and RLS security
- All 22 admin API routes
- Dashboard and auth routes
- Backend Express + BullMQ worker
- All 8 provider integrations
- Scoring engine (3-pillar + profitability)
- 22 admin pages + 4 dashboard pages
- Database schema (constraints, indexes, RLS)
- Config, env vars, deployment

**Result: 41 bugs found. 3 CRITICAL, 9 HIGH, 21 MEDIUM, 8 LOW.**

### 47.2 Testing Requirements

| Layer | Testing Method | Status |
|---|---|---|
| Unit tests | Jest for scoring functions, provider parsers | ❌ Not implemented |
| Integration tests | API route testing with test Supabase instance | ❌ Not implemented |
| E2E tests | Playwright for critical user flows | ❌ Not implemented |
| Security testing | OWASP Top 10 review (manual, completed via QA audit) | ✅ Complete |
| Performance testing | Lighthouse audit (target 80+) | ❌ Pending |
| Cross-browser testing | Chrome, Firefox, Safari, Edge (latest 2 versions) | ❌ Pending |
| Mobile testing | iOS 15+, Android 10+ | ❌ Pending (no app yet) |

### 47.3 Automatic Rejection Criteria

Products failing ANY of these are automatically rejected and archived:

1. Gross margin below 40%
2. Shipping cost exceeds 30% of retail price
3. Break-even timeline exceeds 2 months
4. Product classified as fragile, hazardous, or requires special certification
5. No supplier found with USA delivery under 15 days

**Known Issue (BUG-063):** Only 5 of 8 auto-rejection rules are implemented in the financial route. Three are missing.

---

## Section 48 — Security and Access Control

### 48.1 Authentication Architecture

| Component | Implementation | Status |
|---|---|---|
| Auth provider | Supabase Auth | ✅ Active |
| Admin auth | JWT via Supabase session | ✅ Active |
| Client auth | JWT via Supabase session | ✅ Active |
| Mobile auth | Supabase Auth + Expo SecureStore | ❌ Planned |
| Biometric auth | Face ID / Touch ID via Expo | ❌ Planned |

### 48.2 RLS Policies

Every table has RLS enabled. Key policies:
- Admin users can read/write all tables
- Client users can only read their own allocated products
- Anonymous users have zero access
- Service role client (backend) bypasses RLS for worker operations

### 48.3 Security Checklist

- [x] API keys in environment variables (never in source code)
- [x] `/admin/*` routes: server-side session check
- [x] RLS on every table
- [x] Rate limiting on all endpoints
- [x] Helmet security headers
- [x] HTTPS enforced (Netlify + Railway auto-SSL)
- [ ] CSRF protection on POST endpoints
- [ ] Input validation/whitelisting on all POST routes
- [ ] OAuth tokens stored encrypted
- [ ] Admin role check in admin layout component
- [ ] `requireClient()` middleware for dashboard routes

---

## Section 49 — Multi-Tenant SaaS Controls

### 49.1 Tenant Isolation

Each client is a tenant. Isolation enforced at three levels:

1. **RLS** — Database-level row filtering based on user role and client_id
2. **API middleware** — `requireAdmin()` and `requireClient()` check role before processing
3. **UI scoping** — Dashboard shows only `visible_to_client = true` products

### 49.2 Product Allocation Model

- System discovers and scores top 50 products per platform per scan
- All 50 stored with `visible_to_client = false` by default
- Admin allocates products by flipping `visible_to_client = true`
- Client package controls default visibility limit (3/10/25/50)
- Releasing more products is a single DB update — zero API cost

### 49.3 Client Dashboard Separation

`/dashboard/*` is completely separate from `/admin/*`. Clients must never see:
- Admin routes or admin navigation
- Other clients' data
- The full 50-product internal pool
- System configuration or settings

---

## Section 50 — Deployment and Environment Strategy

### 50.1 Deployment Architecture

| Component | Service | Deploy Trigger |
|---|---|---|
| Frontend | Netlify | Git push to main |
| Backend API | Railway | Git push to main |
| Worker | Railway (same service) | Git push to main |
| Database | Supabase | Migrations via SQL Editor |
| Redis | Railway add-on | Always-on |

### 50.2 Environment Variables

**Frontend (Netlify):**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-side only)
- `NEXT_PUBLIC_BACKEND_URL` — Railway backend URL
- `RESEND_API_KEY` — Resend email service
- `STRIPE_SECRET_KEY` — Stripe API key (NEW)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (NEW)
- All provider-specific keys (APIFY_API_TOKEN, RAPIDAPI_KEY, etc.)

**Backend (Railway):**
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key
- `SUPABASE_ANON_KEY` — Anon key for per-request auth clients
- `REDIS_URL` — Redis connection string
- `FRONTEND_URL` — For CORS origin
- `PORT` — Server port (default 4000)
- `RESEND_API_KEY` — Email service
- Platform-specific API keys (TIKTOK_API_KEY, AMAZON_API_KEY, etc.)

### 50.3 Netlify Configuration

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

### 50.4 Railway Configuration

```toml
[build]
  builder = "dockerfile"

[deploy]
  healthcheckPath = "/health"
  healthcheckTimeout = 300
```

---

## Section 51 — Cost Optimisation Strategy

### 51.1 Monthly Cost Model

| Stage | Clients | Monthly Cost | Primary Drivers |
|---|---|---|---|
| Build phase | 0 | $0–5 | Claude Code tokens |
| Early stage | 1–5 | $15–35 | Apify + Claude API per manual scan |
| Growth | 5–20 | $35–80 | Daily auto scans, 2–3 channels |
| Scale | 20+ | $80–200 | All channels automated daily |

### 51.2 Revenue vs Cost at Scale

At 500 subscribers × average $49/mo = **$24,500 MRR** vs $200/mo operational cost = **99.2% gross margin**.

### 51.3 One-Time Build Costs

| Item | Cost | Notes |
|---|---|---|
| Claude Code API credits | $40–100 | Full build, all phases |
| Apple Developer Account | $99/yr | iOS App Store |
| Google Play Account | $25 one-time | Android Play Store |
| **Total** | **~$165–225** | Covers full build + both app stores |

---

## Section 52 — Performance and Scaling Strategy

### 52.1 Current Performance Observations

- Supabase Realtime subscriptions work with 2-second debounce on admin dashboard
- Provider timeouts: 30s for REST APIs, 60s for Apify actors
- Platform scraping runs sequentially in worker (should be parallelised)
- No database indexes on frequently-searched columns (name, platform)

### 52.2 Scaling Plan

| Milestone | Action |
|---|---|
| 10 clients | Enable Redis caching for dashboard queries |
| 50 clients | Add database indexes on products(platform, final_score, name) |
| 100 clients | Parallelise worker scraping with Promise.all() |
| 500 clients | Consider dedicated Redis instance |
| 1000+ clients | Evaluate Railway autoscaling, Supabase Pro plan |

---

## Section 53 — Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Apify rate limits / pricing changes | Scraping disrupted | Provider abstraction allows instant switch to alternatives |
| TikTok API approval delayed | No official TikTok data | Apify + ScrapeCreators + Creative Center covers 90% |
| Claude API costs spike | Higher operating cost | Haiku for bulk, Sonnet only on-demand for top products |
| Client churn (affiliate module) | Revenue loss | Anti-churn hooks: content + automation are the value, not data |
| Store API changes (Shopify/Amazon/TikTok) | Integration breaks | OAuth with scoped permissions, graceful degradation |
| Platform ToS violation | Legal risk | Use official APIs first, Apify as fallback, never scrape login-protected content |
| Supabase free tier limits | Database throttled | Monitor usage, upgrade to Pro when approaching limits |
| Session memory loss (Claude) | Development inconsistency | Persistent repo files, mandatory context recovery protocol |

---

## Section 54 — Final Execution Instructions for Claude Code

### 54.1 Before Starting Any New Session

```
1. Read CLAUDE.md
2. Read docs/YouSell_Platform_Technical_Specification_v7.md (this document)
3. Read ai/project_state.md
4. Read ai/task_board.md
5. Read development_log.md
6. Summarize: current architecture, completed tasks, remaining tasks
7. Continue from the latest logged development step
```

### 54.2 Development Priority Order

```
1. Fix 3 CRITICAL bugs (admin layout role check, backend RBAC, clients RLS)
2. Fix 9 HIGH bugs (scan table split-brain, legacy scoring, auth gaps)
3. Implement Stripe integration (Phase B)
4. Implement platform gating + engine toggles (Phase C)
5. Implement store integrations (Phase D)
6. Implement content engine (Phase E)
7. Implement order tracking (Phase F)
8. Implement influencer outreach v2 (Phase G)
9. Build mobile app (Phase H)
10. Full QA + app store submission (Phase I)
```

### 54.3 After Every Implementation Session

```
1. Update development_log.md with changes made
2. Update ai/project_state.md with new completion status
3. Update ai/task_board.md if tasks were completed
4. Commit all changes with descriptive message
5. Push to feature branch
```

### 54.4 Integration Security Rules (NEW)

- **Client store integrations** — OAuth 2.0 only. NEVER handle client login passwords.
- **Token storage** — All OAuth tokens encrypted at rest in `client_channels` table.
- **Token scoping** — Request minimum required scopes. Document what each scope enables.
- **Token revocation** — Client can disconnect from either YouSell or the platform itself.
- **Webhook validation** — Verify signatures on all incoming webhooks (Stripe, Shopify, TikTok).

### 54.5 Store Integration Feasibility

| Platform | API | Auth | Product Push | Order Tracking |
|---|---|---|---|---|
| Shopify | Admin GraphQL API | OAuth 2.0 (Shopify App) | ✅ Products API | ✅ Webhooks (orders/fulfilled) |
| TikTok Shop | Seller API v2 | OAuth 2.0 (Open API) | ✅ Product Upload | ✅ Order API |
| Amazon | SP-API | OAuth 2.0 (App registration) | ✅ Listings Items API | ✅ Orders + Shipping API |

### 54.6 Post-Purchase Email Sequence (Via Resend)

| Step | Trigger | Content |
|---|---|---|
| 1. Order Confirmation | Order placed | Thank you, order details, estimated delivery |
| 2. Shipping Confirmation | Shipment created | Tracking number, clickable tracking link |
| 3. Delivery Update | In-transit milestone | Estimated delivery date update |
| 4. Delivery Confirmation | 24hrs after delivery | Confirmation, support contact |
| 5. Review Request | 3–5 days after delivery | Link to platform review page |

### 54.7 Client Marketing Channel Integrations (OAuth 2.0)

| Channel | API | Auth | Key Capabilities |
|---|---|---|---|
| TikTok | TikTok for Developers | OAuth 2.0 | Video upload, audience analytics |
| Instagram/Facebook | Meta Graph API | OAuth 2.0 (Facebook Login) | Post creation, stories, insights |
| YouTube | YouTube Data API v3 | OAuth 2.0 (Google) | Video upload, analytics |
| Twitter/X | X API v2 | OAuth 2.0 | Tweet posting, analytics |
| Pinterest | Pinterest API v5 | OAuth 2.0 | Pin creation, board management |
| LinkedIn | LinkedIn API | OAuth 2.0 | Post creation, page management |
| Email Newsletter | Resend / Mailchimp | API Key | Email campaigns, sequences |

---

# APPENDICES

---

## Appendix A — Profitability & Logistics Engine

### Automatic Rejection Criteria

Products failing ANY criteria are automatically rejected:

1. Gross margin below 40%
2. Shipping cost exceeds 30% of retail price
3. Break-even timeline exceeds 2 months at realistic sales velocity
4. Product classified as fragile, hazardous, or requires special certification
5. No supplier found with USA delivery under 15 days
6. Cost of goods exceeds 40% of retail price
7. Estimated return rate exceeds 15%
8. Legal/IP risk detected (counterfeit, trademark)

### Risk Flags

- Fragile / high return rate → warning badge on product card
- Regulatory restrictions (cosmetics, supplements, electronics) → flag and guidance
- Counterfeit / IP risk → Claude Haiku checks against known brand patterns

---

## Appendix B — Launch Blueprint Engine

For products scoring 60+, one click generates a complete launch plan (Claude Sonnet, on-demand only):

| Component | Content Generated |
|---|---|
| Store Positioning | Niche, brand tone, target audience, differentiation, upsell/bundle |
| Product Page | SEO title, 5 bullet points, emotional description, trust signals |
| Video Script | 15–30s TikTok/Reel hook script with visual cues |
| Pricing Strategy | Recommended retail price, bundle options, launch discount |
| Influencer List | Top 10 ranked creators with cost, expected sales, format |
| Ad Campaign | TikTok, Meta, Google, Pinterest concepts with budget + targeting |
| Launch Timeline | Day-by-day plan: content → influencer seeding → ads → review |
| Risk Notes | Top 3 risks specific to this product and mitigation |

---

## Appendix C — Supplier Discovery Engine

### Sources

| Region | Source | Access | Cost |
|---|---|---|---|
| China (factory) | Alibaba.com | Open API + Apify | Free |
| China (cheapest) | 1688.com | Apify scraper | Apify credits |
| China (alt) | Made-in-China.com | Apify scraper | Apify credits |
| China/Global (dropship) | CJ Dropshipping | Free API | Free |
| Global (dropship) | Syncee API | Free for registered | Free |
| Global (dropship) | AutoDS | Free trial API | Free trial |
| UK + EU | Faire API | Free for registered | Free |
| UK + EU | Ankorstore | Apify or direct | Apify credits |
| USA + Global | SerpAPI Google Shopping | 100 free/mo | Free tier |

### Required Fields Per Supplier

| Field | Required |
|---|---|
| Supplier name + URL | Yes |
| Country / Region | Yes |
| MOQ (minimum order quantity) | Yes |
| Unit price at MOQ (USD) | Yes |
| Shipping cost to USA per unit | Yes |
| Delivery time to USA (days) | Yes |
| White label / private label available | Yes |
| Dropship available (no MOQ) | High |
| US warehouse stock available | High |
| Certifications (CE, FCC, FDA) | Required for regulated categories |
| Sample availability + cost | High |

---

## Appendix D — Mobile App Specification

### React Native + Expo

Single codebase deploys to both iOS and Android. Expo managed workflow eliminates native toolchain complexity.

### Mobile App Features

| Feature | Description |
|---|---|
| Dashboard Overview | KPIs, pre-viral strip, Run Scan FAB |
| Pre-Viral Alerts | Push notification on threshold exceeded |
| Product Cards | All 7 tabs, swipeable cards, score gauges |
| Trend Feed | Live scrolling feed with pull-to-refresh |
| Influencer Profiles | Full profile with video preview |
| Launch Blueprint | Readable plan with share sheet export |
| Run Scan | Same manual control as web |
| Client Allocation | Assign products from mobile |
| Notifications Centre | Alert history with deep links |
| Offline Mode | Last fetched data readable offline |
| Biometric Auth | Face ID / Touch ID / Fingerprint |

### Shared Architecture

Mobile app shares with web: Supabase client, TypeScript types, scoring algorithms, API service functions, environment variables.

### Build and Deployment

- Development: Expo Go on physical device
- Staging: EAS Build free tier (.ipa and .apk)
- Production iOS: EAS Submit → Apple App Store ($99/yr)
- Production Android: EAS Submit → Google Play ($25 one-time)
- OTA updates: Expo Updates for JS bundle changes
- CI/CD: EAS Build in GitHub Actions

### Push Notifications

Expo Push Notifications (completely free). When Trend Scout detects product with Early Viral Score > 80, Railway API calls Expo Push API. Admin configures threshold in `/admin/setup`.

---

## Appendix E — Client Product Allocation System

### The 50-Product Pool

- Every scan targets 50 products per platform (internal target)
- Products ranked 1–50 by Final Opportunity Score
- If fewer than 50 score above 60, show all qualifying
- Pool refreshes on each scan — re-rank, preserve existing allocations
- Stale products (visible 30+ days without action) flagged for admin

### Package Tiers

| Package | Default Products/Platform | Admin Can Release |
|---|---|---|
| Starter | 3 | Up to 50 on request |
| Growth | 10 | Up to 50 on request |
| Professional | 25 | Up to 50 on request |
| Enterprise | 50 | All visible by default |

### Client Request Flow

```
1. Client clicks "Request More Products" → modal with platform and note
2. Request created with status: pending
3. Admin notified via Resend + mobile push
4. Admin opens /admin/allocate → sees pending requests
5. Admin selects products to release from top 50 pool
6. visible_to_client flipped to true → request status: fulfilled
7. Client notified via Resend + push: "New recommendations ready"
8. Client sees newly released products marked as "Additional Recommendations"
```

---

## Appendix F — Financial Modelling Engine

### Per-Product Financial Outputs

- Full cost structure (manufacturing, packaging, shipping, fulfilment, fees, marketing)
- Gross and net margin estimates
- Break-even units and timeline
- Influencer marketing budget and ROI
- Paid advertising budget range and ROAS
- 30/60/90-day revenue projection (conservative, base, optimistic)

### Influencer ROI Model

```
Cost per post ÷ Estimated sales × Product profit = ROI multiple
Display: "Estimated 24× ROI — $500 post cost generates ~$12,000 profit at 0.5% conversion"
```

---

## Appendix G — Future Expansion Roadmap

Architect the codebase so these can be added without refactoring. Do NOT build now:

| Module | Description | Build Trigger |
|---|---|---|
| Automated Influencer Outreach | Auto-send when influencer matches criteria | Outreach volume exceeds manual capacity |
| Client Reporting Portal | Weekly PDF opportunity reports per client | 5+ clients onboarded |
| Campaign Performance Tracker | Track actual sales per influencer/ad | Clients running campaigns |
| A/B Creative Testing | 3 ad copy variants, track performance | Clients have ad budget |
| AI Product Builder | Auto-generate digital product concepts | Digital channel gains traction |
| Revenue Prediction Engine | 90-day prediction with confidence intervals | 6+ months scan data |
| White-Label Client Reports | Brand with client logo for agency resale | Reselling to agencies |
| eBay Discovery Tab | Full eBay product discovery (8th channel) | eBay signals prove consistent |
| Auto Request Fulfilment | Claude Haiku auto-selects products for requests | Request volume exceeds manual review |

---

## Appendix H — Document History and Version Control

| Version | Date | Changes |
|---|---|---|
| v4 | 2026-03 (early) | Initial comprehensive build brief |
| v5 | 2026-03 (mid) | Expanded architecture, added mobile app |
| v6 | 2026-03-12 | Definitive final with 24 sections, 37 tables |
| **v7** | **2026-03-13** | **Full reconciliation with current session: added Stripe integration, store integrations, content engine, order tracking, engine toggles, platform gating, corrected pricing model, affiliate business model correction, QA audit integration (41 bugs), dual-platform separability, OAuth channel integrations, developer handoff documentation** |

---

## Appendix I — Source of Truth Index

**Current canonical documents (in precedence order):**

1. `docs/YouSell_Platform_Technical_Specification_v7.md` — THIS DOCUMENT — Master architecture
2. `CLAUDE.md` — Development rules and guardrails
3. `ai/project_state.md` — Current development progress
4. `ai/task_board.md` — Active tasks
5. `development_log.md` — Change history
6. `ai/qa-bug-tracker.md` — Known bugs (41 total)
7. `ai/YOUSELL_DEVELOPER_HANDOFF.md` — Developer handoff reference
8. `ai/platform_strategy.md` — Business strategy
9. `ai/pricing_strategy_prompt.md` — Pricing strategy prompt

**All other build briefs, QA prompts, audit reports, and operating manuals in the root directory are SUPERSEDED by these canonical files.**

---

**END OF YOUSELL PLATFORM TECHNICAL SPECIFICATION v7.0**

*This document is the single authoritative architecture reference for the YouSell Platform. All development, continuity recovery, and architectural decisions should reference this document first.*
