# YOUSELL PLATFORM TECHNICAL SPECIFICATION

## Version 8.0 — Definitive Master Build Brief

**Document Status:** CANONICAL — This document supersedes all prior build briefs (v4, v5, v6, v7) and is the single authoritative architecture reference for the YouSell Platform.

**Date:** 2026-03-17

**Platform:** YouSell Intelligence Platform — admin.yousell.online + yousell.online

**Target Market:** USA

**Stack:** Netlify · Supabase · GitHub · Railway · Resend · Stripe

**For:** Claude Code Autonomous Build Agent and Senior Engineering Team

**What Changed v7 → v8:** Full integration of Print on Demand (Channel #8), Admin Command Center (Best-Selling Products Dashboard), Affiliate Commission Engine (Dual Revenue Tracking), 8 new BullMQ queues (23 total), expanded content strategy, competitive landscape analysis, POD fulfillment partner research, affiliate program research (80+ sources), updated development phases, revenue multiplier projections, and fulfillment recommendation logic. All satellite documents merged into a single authoritative specification.

---

# PART I — STRATEGIC FOUNDATION

---

## Section 1 — Executive Overview

The YouSell Platform is an AI-powered commerce intelligence SaaS that automates the entire e-commerce product lifecycle — from trend detection through store integration to marketing execution. Unlike data-only competitors (Jungle Scout, Helium 10, Kalodata, FastMoss), YouSell provides a fully automated operational engine that discovers products, provisions stores, generates content, manages influencer outreach, and tracks orders across multiple platforms.

The platform operates as two interconnected but separable applications:

1. **YouSell Intelligence Engine** (admin.yousell.online) — The admin-facing backend intelligence system for product discovery, scoring, pipeline management, and YOUSELL's own shop command center.
2. **YouSell Client Platform** (yousell.online) — The client-facing SaaS where subscribers access curated product intelligence, automated marketing, and store integration tools.

These two platforms share a Supabase database and can operate as one unified SaaS, or be licensed separately as independent products via a super-admin configuration toggle.

### 1.1 What This Platform Does

YouSell detects emerging product trends 2–3 weeks before mainstream adoption across eight opportunity channels. It discovers profitable products, identifies influencers driving those trends, locates suppliers, generates complete financial models and launch blueprints, provisions client stores, automates content creation and distribution, manages influencer outreach, tracks orders through fulfilment, deploys winning products to YOUSELL's own stores via a Command Center dashboard, and earns dual-stream affiliate commissions through an integrated content factory. All major processes are triggered manually by the admin via a control dashboard — automation can be enabled channel-by-channel as client volume grows.

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
| Printful/Printify | POD fulfillment only | $0 (per-order) | Discovery + scoring + automation layer on top |
| Spocket | Dropship supplier marketplace | $40–$100 | Intelligence engine, not just supplier listing |
| Traditional Agency | Full service | $2,000–$10,000/mo | Same output, fraction of cost |

### 1.3 Key Architecture Principles

These are non-negotiable architectural rules that govern all development:

1. **Scraping in background workers only.** Never execute scraping or heavy data collection inside request/response API handlers.
2. **API routes serve stored data.** Routes read from Supabase, never trigger live collection jobs inline.
3. **Queue-based orchestration.** Redis + BullMQ controls all ingestion, transformation, and processing. 23 queues total.
4. **Manual-first cost control.** All automation jobs are DISABLED by default. Each can be enabled independently.
5. **Persistent system memory.** Project context lives in repository files (`/system`, `/docs`, `CLAUDE.md`), never in transient conversation state.
6. **Context recovery from repo.** Claude Code must read continuity files before making changes — never rely on chat memory.
7. **Preserve useful prior work.** Never rebuild completed functionality. Inspect before creating.
8. **Correct faulty assumptions.** Update weak architecture when the latest session introduces better patterns.

---

## Section 2 — Product Vision

### 2.1 The Core Value Proposition

YouSell transforms a solo operator or small team into a commerce intelligence agency. One person can discover, validate, source, price, market, and launch trending products across eight platforms — work that would otherwise require a team of 10+ and $10K+/month in tools and services.

### 2.2 The Eight Opportunity Channels

| # | Channel | Type | Product Scope | Core Strategy |
|---|---|---|---|---|
| 1 | TikTok Shop | Impulse | Non-gated physical + digital | Influencer + TikTok Ads + Meta Ads |
| 2 | Amazon FBA | Search-driven | White-label / non-gated physical | PPC + Launch Strategy + Influencer |
| 3 | Shopify DTC | Hybrid | Any product incl. branded + digital | Meta + Google + Influencer |
| 4 | Pinterest Commerce | Visual discovery | Home, fashion, beauty, lifestyle | Pinterest Ads + Influencer + SEO |
| 5 | Digital Products | Digital | Templates, courses, AI prompts, tools | Content + Affiliates + SEO |
| 6 | AI Affiliate Programs | Commission | AI SaaS + subscription tools | Affiliate promotion + influencer |
| 7 | Physical Affiliate | Commission | TikTok Shop + Amazon affiliate products | Influencer + content |
| 8 | Print on Demand (POD) | Hybrid (Design + Fulfillment) | Custom-designed apparel, accessories, home goods, stationery | Niche design trends + Influencer merch + TikTok/Etsy organic |

### 2.2.1 Channel 8 — Print on Demand (POD) Detail

**Why POD fits YOUSELL:** POD is a natural extension of the platform's intelligence capabilities. It sits between physical products and digital products — you design once, manufacture on-demand, and ship directly to customers with zero inventory risk. Typical margins are 30–60%, and the trend discovery engine can identify winning designs and niches the same way it discovers physical products.

**What POD Adds to the Platform:**

| Capability | Description |
|---|---|
| Product Discovery | Trending designs, niches, and aesthetics across Etsy, Redbubble, Merch by Amazon, TikTok |
| Supplier Integration | Direct API connections to POD fulfillment partners (Printful, Printify, Gelato) |
| Store Provisioning | Auto-create products in client Shopify/TikTok stores with POD fulfillment attached |
| Content Engine | AI-generated mockups, social posts featuring products on lifestyle backgrounds |
| Influencer Matching | Niche-specific creators for custom merch, fan merchandise, etc. |

**POD Sub-Categories:**

| Sub-Category | Examples | Avg Margin | Best Platform |
|---|---|---|---|
| Apparel | T-shirts, hoodies, tank tops | 40–60% | Shopify, Etsy, Amazon Merch |
| Accessories | Phone cases, tote bags, hats | 35–55% | Shopify, Etsy |
| Home & Living | Mugs, pillows, blankets, posters | 30–50% | Etsy, Shopify |
| Stationery | Notebooks, stickers, planners | 40–65% | Etsy, Amazon KDP |
| All-Over Print | Leggings, dresses, swimwear | 35–50% | Shopify (niche stores) |
| Pet Products | Pet beds, bandanas, bowls | 35–55% | Etsy, Shopify |

**POD Fulfillment Partners:**

| Partner | Products | API | Base Cost | YOUSELL Integration | Affiliate Program |
|---|---|---|---|---|---|
| Printful | 340+ | REST API + Webhooks | Varies | Full catalog sync, auto-order routing | 10% of sales for 12 months |
| Printify | 900+ (via print providers) | REST API | Varies | Multi-provider price comparison | 5% of sales for 12 months |
| Gelato | 100+ (global network) | REST API | Varies | 32-country local production | Up to $500 per referral |
| Gooten | 150+ | REST API | Varies | Budget-friendly alternative | — |

**POD Data Sources:**

- Etsy trending searches + best sellers (Apify scraper)
- Redbubble trending designs (Apify scraper)
- Merch by Amazon best sellers (Apify)
- TikTok Creative Center — design/aesthetic trends
- Pinterest — design trend boards, seasonal aesthetics
- Google Trends — niche keyword validation (pytrends)

**POD Scoring Adjustments:**

The standard 3-pillar scoring applies with POD-specific modifiers:
- **Trend Score:** Design trend velocity + seasonal relevance + niche saturation
- **Viral Score:** Social media aesthetic appeal + influencer adoption of niche + UGC potential
- **Profit Score:** Base cost vs selling price (margin must exceed 30%) + fulfillment partner comparison

**POD Content Strategy:**

| Content Type | Template | Platform | Generation |
|---|---|---|---|
| Product mockup on lifestyle background | "{product} in {lifestyle_context}" | All | Printful Mockup API + AI |
| Niche trend roundup | "Top {N} trending {niche} designs this week" | TikTok, Instagram | Claude Haiku |
| Behind-the-design story | "How we designed {product}" | YouTube, TikTok | Claude Haiku |
| Seasonal collection launch | "{season} collection: {theme}" | All | Claude Haiku |
| UGC-style review | "Honest review of our {product}" | TikTok, Instagram | Video script via Claude |

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
- **Admin Command Center** — One-click product deployment to YOUSELL's own stores
- **Affiliate Commission Engine** — Dual-stream revenue tracking (internal content + client referrals)
- **Fulfillment Recommendation Engine** — Auto-recommend DROPSHIP / WHOLESALE / POD / DIGITAL / AFFILIATE based on product attributes

### 2.4 Fulfillment Recommendation Logic

The platform automatically recommends the optimal fulfillment method for each product based on:

| Attribute | → DROPSHIP | → WHOLESALE/FBA | → POD | → DIGITAL | → AFFILIATE |
|---|---|---|---|---|---|
| Physical, low margin | ✓ | | | | |
| Physical, high margin, high volume | | ✓ | | | |
| Custom design, apparel/accessories | | | ✓ | | |
| Template, course, tool, AI prompt | | | | ✓ | |
| SaaS, subscription, service | | | | | ✓ |
| Unknown/mixed | Flag for admin manual review | | | | |

**Fulfillment Decision Tree (Physical Products):**
- IF physical + price < $30 + fast-ship supplier available → **DROPSHIP**
- IF physical + price $30–100 + high demand signals → **WHOLESALE**
- IF physical + price > $100 → **WHOLESALE ONLY** (margins justify bulk)
- IF physical + supplier offers dropship API → **SHOW BOTH OPTIONS**
- ALWAYS show margin comparison table side-by-side (dropship vs wholesale vs POD)

**Platform-Specific Fulfillment Rules:**

| Platform | Fulfillment Constraint | Impact |
|---|---|---|
| **TikTok Shop** | Must ship within 2–3 days; long-ship = suspension | US-based fulfillment only; no direct AliExpress dropship |
| **Amazon FBA** | Must be seller of record; no 3rd-party branding | Wholesale/FBA or Private Label required |
| **Amazon FBM** | Self-fulfilled; less Buy Box weight | Dropship acceptable but lower ranking |
| **Shopify** | Full flexibility, any model works | All fulfillment types supported |
| **Pinterest** | Traffic driver, not direct seller | Links to Shopify/Amazon store; no native checkout |
| **Etsy** | Production partner or handmade required for POD | Must use Printful/Printify integration |

**Economic Comparison by Fulfillment Model:**

| Model | Upfront Cost | Typical Margin | Risk Level | Time to Market | Best For |
|---|---|---|---|---|---|
| **Dropship** | $0 | 10–30% | Low | Days | Physical products <$30, testing demand |
| **Wholesale/Bulk** | $500–5,000 | 30–50% | Medium | Weeks | Proven demand, $30–100 products |
| **Private Label** | $2,000–10,000+ | 40–70% | High | Months | $100+ products, brand-building |
| **Print-on-Demand** | $0 | 30–50% (up to 60–80% on stickers/posters) | Low | Days | Custom designs, apparel, accessories |
| **Affiliate** | $0 | 1–45% commission | Zero | Immediate | SaaS, AI tools, digital products |
| **Digital Products** | $0 | 80–97% (platform fees only) | Low | Days | Templates, courses, eBooks, tools |

---

## Section 3 — Business Objective & SaaS Positioning

### 3.1 SaaS Revenue Model

YouSell monetises through tiered subscriptions with per-platform pricing and modular engine add-ons. The pricing philosophy: **more customers at a reasonable price, not a few customers at very high prices.**

**Critical correction from prior versions:** The original yousell.online site priced packages at $2,997 — this is agency pricing on a SaaS product and is fundamentally misaligned. The correct pricing range is $29–$299/month per platform, based on competitive research.

### 3.2 Proposed Pricing Architecture

Pricing is structured as **per-platform subscriptions** with **modular engine toggles**:

- Each platform (TikTok, Amazon, Shopify, Digital, AI Affiliates, POD) has its own subscription tier
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

**Approved Pricing Tiers (Option C):**

| Tier | Monthly | Annual | Channels | Key Features | Content Credits |
|---|---|---|---|---|---|
| **Starter** | $29 | $19/mo | 1 channel | Product Finder, basic scores | 50 credits |
| **Growth** | $59 | $39/mo | 2 channels | + Shop Connect, Creative Studio | 200 credits |
| **Professional** | $99 | $69/mo | 3 channels | + Creator Connect, Supplier Finder, Smart Publisher | 500 credits |
| **Enterprise** | $149 | $99/mo | All channels | All engines, API access, team seats | Unlimited credits |

Multi-channel discount: 20% off second channel, 30% off third+.

**Free Tier:**
- See all products + scores (read-only)
- 1 platform
- No automation, no store integration
- Limited to 5 products/week
- Email digest of HOT products

**Add-On Revenue Streams:**
- Extra Sonnet insights ($2/each)
- Additional scan credits
- Content generation credits above monthly limit
- Priority support
- White-label reports

**Content Credits Allocation:**

| Plan Tier | Monthly Credits | Equivalent To |
|---|---|---|
| Starter | 50 credits | ~25 text posts + 5 videos + 10 images |
| Growth | 200 credits | ~80 text posts + 20 videos + 40 images |
| Professional | 500 credits | ~200 text posts + 50 videos + 100 images |
| Enterprise | Unlimited | Fair-use policy applies |

**Credit Costs per Content Type:**

| Content Type | Credits |
|---|---|
| Social caption (text only) | 1 |
| Ad copy | 1 |
| Blog article | 3 |
| Product image (Bannerbear) | 2 |
| Carousel (5 slides) | 5 |
| Short video (15-30s) | 5 |
| Long video (30-60s) | 8 |
| Email sequence (5 emails) | 3 |

**Competitor Pricing Reference:**
- Sell The Trend: $39.97–$99.97
- AutoDS: $26.90–$66.90
- Jungle Scout: $29–$199
- Helium 10: $29–$229
- Minea: $49–$399
- Kalodata: $16–$99

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

### 3.6 Built-In Revenue Multiplier — Dual Affiliate Streams

Every YOUSELL subscription that provisions tools for clients may generate indirect affiliate commission for YOUSELL itself when clients adopt recommended platforms. This is secondary revenue on top of subscriptions.

**Stream 1: Internal Content Affiliate Revenue (Admin-Only)**

YOUSELL uses its own content engine, influencer network, and publishing pipeline to promote tools/platforms and earn affiliate commissions. This is a non-stop content factory for all affiliate platforms, visible only in the admin dashboard.

**Internal Revenue Projections:**

| Phase | Timeline | Estimated Revenue | Key Activities |
|---|---|---|---|
| Ramp-up | Month 1–3 | $100–500/mo | Setup affiliate accounts, initial content, seed SEO |
| Growth | Month 4–6 | $1,000–3,000/mo | SEO traffic building, email list growth, content cadence |
| Compounding | Month 7–12 | $3,000–10,000/mo | Compounding recurring commissions, authority established |
| Maturity | Year 2+ | $10,000–30,000/mo | Compound effect, multiple content channels, brand authority |

**Visibility:** Admin dashboard ONLY. Zero client visibility. Exposing AI affiliate opportunities would reveal competitor platforms (Jasper, Copy.ai, etc.) that clients might switch to, and protects YOUSELL's internal revenue stream.

**Competitive Landscape for Affiliate Content:**

| Competitor | Model | Scale | Revenue Est. |
|---|---|---|---|
| **Futurepedia** | AI tool directory, affiliate-only revenue | 2,000+ tools, 5M+ monthly visitors | Significant (affiliate-only) |
| **There's An AI For That** | AI tool directory | 11,000+ tools | Directory model |
| **Matt Wolfe (YouTube)** | AI review content | YouTube channel | Est. $20–50K/month from AI affiliates |

**Key insight:** NO existing player is a SaaS platform earning affiliate revenue as secondary income. YOUSELL would be unique in combining intelligence platform + affiliate earnings. The directories above earn ONLY from affiliates; YOUSELL earns from subscriptions PLUS affiliates.

**Stream 2: Client Service Affiliate Revenue**

When YOUSELL provisions tools for clients (Shopify stores, Klaviyo accounts, Printful connections, Spocket subscriptions), each provisioning generates affiliate commission for YOUSELL.

**Multi-Layer Revenue Stacking:** A single client store setup triggers 4-5 simultaneous affiliate commissions: Store (Shopify ~$150 bounty) + Email (Klaviyo 10-20%) + Payment (Stripe/PayPal $500–2,500) + Fulfillment (Spocket 20-30% for 15mo OR Printful 10%) + Design (Canva invite-only). This generates significant passive income stacked on top of subscription revenue.

**Revenue Multiplier Estimate (50 clients in Year 1):**

*⚠️ Rates verified March 2026. Affiliate programs change terms frequently — re-verify before implementation.*

| Platform | Revenue Per Client/Year | Total (50 clients) | Notes |
|---|---|---|---|
| Shopify Partner (~$150 one-time bounty) | ~$150 | $7,500 | ⚠️ Changed from 20% recurring to one-time bounty |
| Printful (10% of ~$200/mo sales for 12mo) | ~$240 | $12,000 | Confirmed |
| Klaviyo (up to 20% recurring, partner program) | ~$81 | $4,050 | Partner program, not simple affiliate |
| Spocket (25% recurring on ~$40/mo for 15mo) | ~$125 | $6,250 | ⚠️ 15 months, not lifetime as previously claimed |
| Canva (invite-only "Canvassador") | Variable | Variable | ⚠️ No longer open signup |
| Omnisend (20% recurring on ~$16/mo) | ~$38 | $1,920 | Unverified for 2026 |
| ~~Jasper AI~~ | ~~$147~~ | ~~$7,350~~ | ❌ Program ended Jan 2025 |
| Copy.ai (45% first year on ~$49/mo) | ~$265 | $13,230 | Unverified for 2026 |
| Writesonic (30% lifetime on ~$20/mo) | ~$72 | $3,600 | Unverified for 2026 |
| Semrush ($200–450/sale + $10/trial) | ~$200 | $10,000 | Tiered up to $450/sale |
| HubSpot (30% recurring 1yr on ~$50/mo) | ~$180 | $9,000 | Confirmed |
| ManyChat (30–50% tiered, 12mo on ~$15/mo) | ~$54 | $2,700 | ⚠️ Base rate 30% (was 35%), 12mo limit |
| GetResponse (40–60% tiered, 12mo on ~$19/mo) | ~$91 | $4,560 | ⚠️ Relaunched Mar 2025; rate UP, but 12mo cap |
| ElevenLabs (22% for 12mo on ~$22/mo) | ~$58 | $2,900 | New addition |
| Stripe ($500–2,500 per merchant) | — | $5,000 (est. 2) | ⚠️ Range depends on merchant volume, not flat $2,500 |
| PayPal ($500–2,500 per merchant) | — | $5,000 (est. 2) | ⚠️ Range based on 60-day annualized volume |
| ShipBob ($250 referral bonus) | — | $2,500 (est. 10) | Confirmed |
| **Estimated Total Year 1** | | **~$95,210** | Reduced from $124K due to Jasper removal + rate corrections |

*On top of YOUSELL subscription revenue. Scales linearly with client count. Conservative estimates — actual depends on conversion rates and client adoption.*

**Dual Payment Setup Revenue Multiplication:** Every client setting up both Stripe ($500–2,500 referral) and PayPal ($500–2,500 referral) generates $1,000–5,000 in one-time bounties per client depending on merchant transaction volume.

**Highest-Priority Affiliate Integrations:**

1. **Spocket** — 20–30% recurring for 15 months. Best deal in the ecosystem (⚠️ previously claimed "lifetime" — verify terms before promoting).
2. **Shopify Partner Program** — ~$150 one-time bounty per referral (⚠️ changed from 20% recurring model).
3. **Stripe** — $500–2,500 per merchant referred. Volume-dependent bounty, US/Canada.
4. **PayPal** — $500–2,500 per merchant referred. Same volume-dependent model.
5. **Printful** — 10% of sales for 12 months per referral + $25 Growth plan bonus. Confirmed.
6. **Klaviyo** — Up to 20% recurring via partner program. Recommend to every client for email marketing.
7. **Canva** — ⚠️ Now invite-only "Canvassador" program. Apply early; no longer open signup.

---

## Section 3A — Terminology Standards & Client-Facing Language (NEW v8)

All client-facing UIs, documentation, and communications MUST use the client-facing terms. Internal/technical terms are for admin interfaces, logs, and developer documentation only.

### 3A.1 Client-Facing Language Rules

| NEVER Use (Internal Only) | ALWAYS Use (Client-Facing) |
|---|---|
| Scrape / Scraper | Discover / Market Intelligence |
| Scan / Scanner | Product Finder / Trend Analysis |
| Crawl / Crawler | Research / Market Research |
| Scrap data | Market data / Intelligence data |
| Run a scan | Run product discovery / Analyse market |
| Scan results | Discovery results / Market insights |
| Scraping job | Research task / Intelligence task |
| Raw listings | Source data |
| Data collection | Market intelligence gathering |
| Spider | Research engine |

### 3A.2 Engine Naming (Internal → Client-Facing)

| Internal Name | Client-Facing Name | Description |
|---|---|---|
| Content Creation Engine | **Creative Studio** | AI-powered marketing content generator |
| Content Publishing Engine | **Smart Publisher** | Automated multi-channel content distribution |
| Store Integration Engine | **Shop Connect** | One-click store setup and product sync |
| Product Discovery Engine | **Product Finder** | AI-powered trending product intelligence |
| Influencer Outreach Engine | **Creator Connect** | Influencer matching and outreach automation |
| Supplier Discovery Engine | **Supplier Finder** | Verified supplier matching |
| Analytics Engine | **Performance Hub** | Real-time analytics and profit tracking |
| Marketing Engine | **Ad Studio** | Ad creative and campaign automation |

### 3A.3 Implementation

Create `src/lib/terminology.ts` as a shared mapping file. All client-facing pages must import and use this mapping. Feature #52 (P0, Immediate).

---

## Section 3B — Features 37-52 Registry (NEW v8)

These features were identified in Session 2 improvement planning and are required for full platform completion.

| # | Feature | Category | Priority | Phase |
|---|---|---|---|---|
| 37 | Shotstack video generation integration | Content Engine | P1 | 3B |
| 38 | Bannerbear image generation integration | Content Engine | P1 | 3B |
| 39 | Ayrshare multi-platform publishing | Publishing Engine | P1 | 3C |
| 40 | Shopify GraphQL product push (Shop Connect) | Shop Integration | P0 | 2A |
| 41 | TikTok Shop Partner API integration | Shop Integration | P0 | 2B |
| 42 | Amazon SP-API product feed upload | Shop Integration | P1 | 4 |
| 43 | Meta Business Extension commerce integration | Shop Integration | P1 | 4 |
| 44 | 3-level automation control system | Automation | P1 | 3D |
| 45 | Auto-pilot guardrails (hard + soft limits) | Automation | P1 | 3D |
| 46 | Content credits system | Billing | P1 | 3A |
| 47 | Brand voice configuration per client | Content Engine | P2 | 3A |
| 48 | Content calendar UI | Dashboard | P2 | 3C |
| 49 | "Download for TikTok" fallback (pre-audit) | Content Engine | P1 | 3C |
| 50 | Social account connection hub | Dashboard | P1 | 3C |
| 51 | Shop product sync tracking (shop_products table) | Shop Integration | P0 | 2A |
| 52 | Client-facing terminology mapping (terminology.ts) | UX | P0 | Immediate |

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
| `admin` | All intelligence features, client management, command center | Operations team |
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
| Stripe subscription billing | ❌ Not built | Phase B (next) |
| Store integration (push products to Shopify/TikTok/Amazon) | ❌ Not built | Phase D |
| Content creation engine | ❌ Not built | Phase E |
| Marketing channel OAuth integrations | ❌ Not built | Phase E |
| Order tracking + post-purchase emails | ❌ Not built | Phase F |
| Engine toggle system (per-client module enable/disable) | ❌ Not built | Phase C |
| Platform gating + upsell UI | ❌ Not built | Phase C |
| AI affiliate opportunity database (dynamic) | ❌ Partially | Phase E |
| POD discovery engine + fulfillment partner integration | ❌ Not built | Phase J |
| Admin Command Center (Best-Selling Products Dashboard) | ❌ Not built | Phase K |
| Affiliate Commission Engine (dual revenue tracking) | ❌ Not built | Phase L |
| Mobile app (React Native + Expo) | ❌ Not built | Phase H |
| One-click influencer invite buttons | ❌ Not built | Phase G |
| 3-level automation control system | ❌ Not built | Phase 3D |
| Content credits billing system | ❌ Not built | Phase 3A |
| Brand voice configuration | ❌ Not built | Phase 3A |
| Terminology mapping (terminology.ts) | ❌ Not built | Immediate |

---

## Section 6A — Automation Levels & Guardrails (NEW v8)

### 6A.1 Three Automation Levels

Every automatable feature supports three levels. Default is Level 1 (Manual) for all clients.

| Level | Name | What It Does | Client Action | Risk |
|---|---|---|---|---|
| **Level 1** | Manual | System generates recommendations. Client initiates every action. | Client clicks each button | Zero risk — full control |
| **Level 2** | Assisted | System prepares content/products, presents for approval. Client reviews and clicks "Approve" or "Edit". | Review + one-click approve | Low risk — client sees everything before it goes live |
| **Level 3** | Auto-Pilot | System acts autonomously within client-defined rules. Client receives a digest of actions taken. Can pause/override anytime. | Set rules once, review digest | Medium risk — requires trust + guardrails |

### 6A.2 Per-Feature Automation Settings

| Feature | Level 1 (Manual) | Level 2 (Assisted) | Level 3 (Auto-Pilot) |
|---|---|---|---|
| **Product Upload to Shop** | Client selects product → clicks "Push to Store" | System suggests products → client approves batch | System auto-pushes HOT products matching client criteria |
| **Content Creation** | Client clicks "Create Content" per product | System generates content brief weekly → client approves | System creates content for all new allocated products |
| **Content Publishing** | Client downloads or clicks "Publish" per post | System schedules posts → client approves calendar | System publishes on optimised schedule automatically |
| **Influencer Outreach** | Client clicks "Send Invite" per influencer | System drafts outreach batch → client approves | System sends outreach to matching creators automatically |
| **Product Discovery** | Admin allocates manually | System suggests allocations → client accepts/rejects | System auto-allocates based on client preferences |

### 6A.3 Auto-Pilot Guardrails (Feature #45)

**Hard Limits (Cannot Be Overridden):**
1. Daily spend cap — Maximum API/credit spend per day (set by client, enforced by system)
2. Content volume cap — Maximum posts published per day per platform (prevents spam)
3. Product upload cap — Maximum products pushed to store per day
4. Outreach cap — Maximum influencer emails per day (reputation protection)
5. Pause on error — If any action fails 3x consecutively, auto-pilot pauses and alerts client

**Soft Limits (Client-Configurable):**
1. Content approval window — Content sits in queue for N hours before auto-publishing (default: 4 hours)
2. Product categories — Only auto-push products in pre-approved categories
3. Price range — Only auto-push products within price range
4. Minimum score — Only act on products above a score threshold
5. Quiet hours — No publishing during specified hours
6. Weekly digest — Summary of all auto-pilot actions sent every Monday

**Emergency Controls:**
- **Big Red Button** — "Pause All Automation" button always visible in dashboard header
- **Per-feature pause** — Can pause any individual feature's automation
- **Undo window** — Scheduled posts can be cancelled until 5 minutes before publish time
- **Activity log** — Complete audit trail of every automated action

---

## Section 7 — Full Platform Scope

### 7.1 Admin Intelligence Engine (admin.yousell.online)

The admin engine is the core intelligence system. It:

- Runs product discovery scans across all eight channels (including POD)
- Scores and ranks products using the 3-pillar composite model (with POD-specific modifiers)
- Identifies matching influencers, suppliers, and competitors
- Generates financial models and launch blueprints
- Allocates products to client accounts
- Manages automation schedules and cost controls
- Monitors system health, API status, and scan history
- **Deploys top-scoring products to YOUSELL's own stores via the Command Center**
- **Tracks dual-stream affiliate revenue via the Affiliate Commission Engine**
- **Runs the internal content factory for affiliate promotion**

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

**Digital Product Platform Economics:**

| Platform | Creator Gets | Best For | Notes |
|---|---|---|---|
| Gumroad | ~85–87% | Everything digital | 10% + $0.50/tx platform fee + ~2.9% processing |
| Etsy | ~87% | Printables, templates, planners | 6.5% tx + 3% + $0.25 processing; offsite ads 12–15% extra if >$10K/yr |
| Amazon KDP | 35–70% | eBooks, guides | 35% for <$2.99 or >$9.99; 70% for $2.99–$9.99 |
| Shopify | ~96–97% | Own brand, full control | Highest margin but no marketplace traffic |
| Whop | ~94% (3% platform fee) | Memberships, software, digital | 3% platform + 2.7% + $0.30 processing; ~8%+ international |
| Creative Market | 50% | Design assets | Curated marketplace, design-focused; 50/50 split |

**Affiliate Commission by Digital Product Type:**

| Product Type | Avg Commission | Recurring? | Best Network |
|---|---|---|---|
| AI Tools | 20–45% | Yes (monthly) | PartnerStack, direct |
| SaaS Software | 20–40% | Yes (monthly) | Impact, PartnerStack |
| Online Courses | 30–50% | Usually one-time | ClickBank, direct |
| eBooks | 4.5–75% | One-time | Amazon (4.5%), ClickBank (75%) |
| Templates/Themes | 10–50% | One-time | ShareASale, direct |

**Content Marketing Strategy by Channel:**

| Channel | Content Type | Best Products | Expected Conversion |
|---|---|---|---|
| **TikTok** | Screen recording tutorials, "I made $X" videos | Templates, AI tools | 1–3% |
| **Pinterest** | SEO pins, product mockups | Printables, planners | 2–5% |
| **YouTube** | Tutorials, reviews, comparisons | Courses, software | 5–10% |
| **Blog/SEO** | Comparison posts, listicles, how-to guides | All digital | 3–8% |
| **Email** | Welcome + launch sequences | All digital | 3–8% |

**Shopify as Affiliate Hub Strategy:** Create Shopify stores as "curated marketplace" review sites where each product page has "Buy Now" linking to an affiliate URL. Use ThirstyAffiliates or Lasso for link management. Can mix own digital products + affiliate recommendations. Shopify analytics provides conversion tracking.

### 8.6 AI Affiliate Programs Module

**Goal:** AI and SaaS platforms with affiliate programs paying commission per signup.

**Pre-Seeded Database (10 programs):**

| Platform | Commission | Cookie | Recurring | Network |
|---|---|---|---|---|
| ~~Jasper AI~~ | ~~25–30%~~ | — | — | ⚠️ Program ended Jan 2025. Agency-only "Solutions Partner" now (up to 50% first $10K) |
| Pictory AI | 20–50% | 30 days | Yes | Direct |
| Synthesia | 25% | 30 days | No | Direct |
| Writesonic | 30% lifetime | 90 days | Yes | PartnerStack |
| GetResponse | 40–60% tiered (12mo) | 90 days | Yes (12mo) | Relaunched March 2025; was 33% lifetime |
| HubSpot | 30% (1yr) | 180 days | Yes (1yr) | Impact |
| ManyChat | 30–50% tiered (12mo) | 120 days | Yes (12mo) | Gold 30%, Sapphire 40%, top tier 100% |
| Creatify AI | 25% + bonus | 30 days | Yes | Rewardful |
| Canva | Invite-only "Canvassador" | 30 days | Variable | ⚠️ No longer open signup; 80% first 2mo (monthly), 25% (annual) |
| Semrush | $200–450/sale + $10/trial | 120 days | No | Impact; tiered by quarterly volume up to $450 |
| ElevenLabs | 22% (12mo) | 90 days | Yes (12mo) | PartnerStack; 11% for Business plans |

**Ongoing Discovery:** Product Hunt API, PartnerStack marketplace, AppSumo, Twitter/X API.

### 8.7 Physical Affiliate Products Module

**Goal:** Physical products via TikTok Shop affiliate and Amazon affiliate — commission without holding inventory.

**Data Sources:** TikTok Shop Affiliate Centre, Amazon Associates product search, Apify TikTok Shop Affiliate scraper.

### 8.8 Print on Demand (POD) Module

**Goal:** Discover trending design niches, identify high-margin POD product opportunities, connect to fulfillment partners, and auto-provision products in client stores with zero inventory risk.

**Data Sources:**
- Etsy Trending Searches + Best Sellers — Apify scraper (batched, weekly)
- Redbubble Trending Designs — Apify scraper (weekly)
- Merch by Amazon Best Sellers — Apify scraper (weekly)
- TikTok Creative Center — Design/aesthetic trend hashtags (free, daily)
- Pinterest Trending Boards — Design trend boards, seasonal aesthetics (free, daily)
- Google Trends — Niche keyword validation via pytrends (free, batched)

**Data Collected:** Design niche, trending keywords, product type (apparel/accessories/home/stationery), estimated monthly searches, competition level, seasonal relevance, top-selling designs (URLs), best-performing platforms, fulfillment partner pricing comparison, margin estimate per product type, creator/influencer adoption rate.

**POD Fulfillment API Integrations:**

| Partner | API Type | Key Endpoints | YOUSELL Use |
|---|---|---|---|
| Printful | REST + Webhooks | Products, Orders, Shipping Rates, Mockup Generator | Product creation, order routing, mockup generation |
| Printify | REST | Catalog, Products, Orders, Print Providers | Multi-provider price comparison, catalog sync |
| Gelato | REST | Products, Orders, Prices, Shipping | Global fulfillment (32 countries), price optimization |

**POD-Specific Pipeline:**
```
1. Trend discovery identifies hot design niches (Etsy + Redbubble + TikTok)
2. AI generates design concepts + mockups via Printful Mockup Generator API
3. Products scored using POD-adjusted 3-pillar model
4. HOT products (80+) auto-suggested to admin for review
5. Admin approves → product pushed to client stores via Shopify/TikTok integration
6. POD fulfillment partner attached to product (Printful/Printify/Gelato)
7. Customer orders → webhook triggers → POD partner manufactures + ships direct
8. Order tracking flows through existing order tracking engine
```

**POD Scan Cost Estimate:** ~$2–8 per weekly scan (Apify actors for Etsy/Redbubble/Amazon, pytrends free)

### 8.9 Admin Command Center — Best-Selling Products Dashboard

**Goal:** Provide a unified admin intelligence dashboard ("Our Own Shops Command Center") where every high-scoring product can be one-click deployed to any of YOUSELL's own sales channels, with live revenue tracking per platform.

**Key Distinction:** This is YOUSELL's internal profit-maximizing command center for YOUSELL's OWN shops. Client-facing store integration (Phase D) is separate. The admin dashboard becomes the hub where every discovered product can be evaluated and deployed.

**Dashboard Components:**

1. **Top Scoring Products Panel (Best Sellers Pool)**
   - Products ranked by final_score (HOT tier first)
   - Per-product action buttons:
     - Push to TikTok Shop
     - Push to Amazon
     - Push to Shopify
     - Push to All Platforms
     - Launch Marketing Campaign
     - Influencer Outreach
     - Generate Content
     - Financial Model
   - Each button triggers a BullMQ job (not inline execution)

2. **Per-Platform Pipeline View**
   - Live stats per platform: products live, weekly revenue, conversion rates
   - Platform tabs: TikTok Shop | Amazon | Shopify | Etsy | POD
   - Status tracking: Draft → Listed → Active → Performing → Archive

3. **Revenue Dashboard**
   - Real-time revenue aggregation across all owned stores
   - Platform breakdown (revenue per platform per week/month)
   - Top 10 performing products with trend graphs
   - Profit margin tracker (cost vs revenue vs net)

**Dashboard Layout (ASCII):**
```
┌─────────────────────────────────────────────────────────────────────┐
│  YOUSELL COMMAND CENTER — Our Own Shops                            │
├──────────────┬──────────────────────────────────────────────────────┤
│  PLATFORMS   │  TOP SCORING PRODUCTS (Best Sellers Pool)           │
│              │  ┌─────────────────────────────────────────────────┐│
│  ● TikTok   │  │ Product Name    Score   Status    Actions       ││
│  ● Amazon   │  │ ─────────────   ─────   ──────    ─────────     ││
│  ● Shopify  │  │ Ice Roller      94 HOT  Listed    [Push] [Mkt]  ││
│  ● Etsy     │  │ LED Mask        87 HOT  Draft     [Push] [Mkt]  ││
│  ● POD      │  │ Yoga Mat        82 HOT  Active    [Content]     ││
│              │  │ Phone Case      78 WARM Draft     [Push All]    ││
│  ALL ▼      │  └─────────────────────────────────────────────────┘│
├──────────────┴──────────────────────────────────────────────────────┤
│  REVENUE: $12,450/wk │ PRODUCTS LIVE: 47 │ CONVERSION: 3.2%       │
│  ┌─TikTok──┐ ┌─Amazon──┐ ┌─Shopify──┐ ┌─Etsy─────┐ ┌─POD──────┐│
│  │ $4,200   │ │ $3,100  │ │ $2,800   │ │ $1,350   │ │ $1,000   ││
│  │ 12 live  │ │ 15 live │ │ 8 live   │ │ 7 live   │ │ 5 live   ││
│  └──────────┘ └─────────┘ └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**BullMQ Jobs (triggered by dashboard buttons):**

| Button | Queue | Worker Action |
|---|---|---|
| Push to Shopify | `push-to-shopify` | Create product via Shopify GraphQL `productSet` mutation |
| Push to TikTok Shop | `push-to-tiktok` | Create product via TikTok Shop `product.save` API |
| Push to Amazon | `push-to-amazon` | Create listing via Amazon SP-API Feeds |
| Push to All | `admin-product-push` | Fan-out to all 3 platform workers |
| Launch Marketing | `content-queue` | Generate + schedule content for product |
| Influencer Outreach | `influencer-outreach` | Find matching creators + draft outreach emails |
| Generate Content | `content-queue` | AI-generate captions, images, video scripts |
| Financial Model | `financial-model` | Run full unit economics + ROI projection |

**Database Requirements:**

- `admin_store_connections` — YOUSELL's own store OAuth tokens (Shopify, TikTok, Amazon, Etsy)
- `admin_product_listings` — Products listed on YOUSELL's own stores (product_id, platform, external_listing_id, status, revenue, orders)
- `admin_revenue_tracking` — Daily revenue snapshots per platform per product

### 8.10 Affiliate Commission Engine — Dual Revenue Tracking

**Goal:** Track and maximize affiliate commission revenue from two separate streams:
1. **Internal Content Affiliate Revenue** — YOUSELL's own content engine promotes affiliate platforms and earns commissions
2. **Client Service Affiliate Revenue** — Commission earned when clients adopt platforms recommended/provisioned through YOUSELL services

**Stream 1: Internal Content Affiliate Revenue (Admin-Only)**

YOUSELL uses its own content engine, influencer network, and publishing pipeline to promote tools/platforms and earn affiliate commissions. This is a non-stop content factory for all affiliate platforms, visible only in the admin dashboard.

**Affiliate Platforms (Internal Content Promotion):**

| Category | Platform | Commission | Type | Cookie | Priority |
|---|---|---|---|---|---|
| **E-Commerce** | Shopify Partner | 20% recurring | Recurring | 30 days | HIGH |
| **E-Commerce** | BigCommerce | 200% first payment | Bounty | 90 days | MEDIUM |
| **E-Commerce** | Wix | $100 per sale | Bounty | 30 days | MEDIUM |
| **E-Commerce** | Ecwid | 20% recurring | Recurring | 90 days | MEDIUM |
| **POD** | Printful | 10% of sales (12 mo) | Recurring | — | HIGH |
| **POD** | Printify | 5% of sales (12 mo) | Recurring | — | MEDIUM |
| **POD** | Gelato | Up to $500/referral | Bounty | — | MEDIUM |
| **Marketing** | Klaviyo | 10–20% recurring | Recurring | 30 days | HIGH |
| **Marketing** | Omnisend | 20% recurring | Recurring | 90 days | HIGH |
| **Marketing** | Mailchimp | Variable | Per-account | 30 days | MEDIUM |
| **Design** | Canva | $36 per Pro signup | Bounty | 30 days | HIGH |
| **AI Tools** | Jasper | 25–30% recurring | Recurring | 30 days | HIGH |
| **AI Tools** | Copy.ai | 45% first year | Recurring Y1 | 60 days | HIGH |
| **AI Tools** | Writesonic | 30% lifetime | Recurring | 30 days | HIGH |
| **AI Tools** | Pictory | 30% recurring | Recurring | 90 days | MEDIUM |
| **AI Tools** | Semrush | $200/sub + $10/trial | Bounty | 120 days | MEDIUM |
| **AI Tools** | HubSpot | 30% recurring (1 yr) | Recurring | 180 days | MEDIUM |
| **AI Tools** | ManyChat | 35% recurring | Recurring | 90 days | MEDIUM |
| **AI Tools** | GetResponse | 33% recurring | Recurring | 120 days | MEDIUM |
| **Dropship** | Spocket | 20–30% lifetime | Recurring | Lifetime | HIGH |
| **Dropship** | Zendrop | 20% recurring | Recurring | 30 days | MEDIUM |
| **Dropship** | DSers | 20% recurring | Recurring | 30 days | MEDIUM |
| **Payment** | Stripe | $2,500 per merchant | Bounty | — | HIGH |
| **Payment** | PayPal | $2,500 per merchant | Bounty | — | HIGH |
| **Fulfillment** | ShipBob | $250 per referral | Bounty | — | MEDIUM |
| **Analytics** | Semrush | $200/sub + $10/trial | Bounty | 120 days | MEDIUM |
| **Analytics** | Ahrefs | Per referral | Bounty | 60 days | MEDIUM |

**Affiliate Content Factory — Content Types:**

| Content Type | Platform | Frequency | Generation |
|---|---|---|---|
| Tool comparison article | Blog, YouTube | Weekly | Claude Sonnet |
| "Best [tool] for [use case]" post | TikTok, Instagram | 3x/week | Claude Haiku |
| Tutorial / walkthrough | YouTube, TikTok | 2x/week | Claude Haiku + video script |
| Seasonal promotion roundup | All channels | Monthly | Claude Haiku |
| Case study / success story | Blog, Email | Monthly | Claude Sonnet |

**Stream 2: Client Service Affiliate Revenue**

When YOUSELL provisions tools for clients (Shopify stores, Klaviyo accounts, Printful connections, Spocket subscriptions), each provisioning generates affiliate commission for YOUSELL. This is tracked separately.

**Admin Dashboard — Affiliate Revenue Tracker:**

| Component | Description |
|---|---|
| Affiliate Programs Database | All registered affiliate programs with links, commission rates, cookie windows |
| Referral Tracker | Which clients were referred to which platforms + referral timestamps |
| Commission Log | Cumulative commission earned per platform per stream |
| Dual Stats View | **Stream 1:** Internal content affiliate revenue | **Stream 2:** Client service affiliate commissions |
| Monthly Rollup | Total affiliate revenue aggregated by month with growth trend |

**Database Requirements:**

- `affiliate_programs` — Master list (name, url, commission_rate, commission_type, cookie_days, category, priority, affiliate_link, stream)
- `affiliate_referrals` — Referral events (program_id, client_id nullable, stream enum('internal','client_service'), referred_at, status)
- `affiliate_commissions` — Commission records (referral_id, amount, currency, period, paid_at)
- `affiliate_content_log` — Content created for affiliate promotion (program_id, content_type, platform_published, published_at, clicks, conversions)

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
BullMQ Job Queue (Redis) — 23 Queues
        ↓
Scan Worker + POD Worker + Content Worker + Affiliate Worker (Railway)
        ↓ Triggers
Apify Actors / External APIs / POD Partner APIs / Affiliate Networks
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
   (POD products use POD-specific modifiers)
7. Products upserted to products table (UNIQUE on platform + external_id)
8. Products scoring 60+ get enriched (influencers, suppliers, competitors)
9. Products scoring 75+ get Claude Sonnet analysis (on-demand)
10. Supabase Realtime pushes updates to dashboard
11. HOT products (80+) trigger Resend email + push notification
12. HOT products appear in Admin Command Center for deployment
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

### 9.4 Data Flow — POD Pipeline

```
1. POD scan discovers trending design niches (Etsy + Redbubble + TikTok)
2. BullMQ pod-discovery queue processes trend data
3. AI generates design concepts and mockup requests
4. Printful Mockup Generator API produces product mockups
5. Products scored with POD-adjusted 3-pillar model
6. HOT designs presented to admin in Command Center
7. Admin approves → pod-provision queue pushes to client stores
8. Customer orders → webhook → pod-fulfillment-sync queue
9. POD partner (Printful/Printify/Gelato) manufactures + ships
10. Order tracking flows through existing email sequence
```

### 9.5 Data Flow — Affiliate Commission Engine

```
Stream 1 (Internal Content):
1. affiliate-content-generate queue creates promotional content
2. Content distributed to YOUSELL's own channels
3. Users click affiliate links → conversions tracked
4. affiliate-commission-track queue logs commission events
5. Revenue visible in admin Affiliate Revenue Dashboard

Stream 2 (Client Service):
1. Client onboards → YOUSELL provisions tools (Shopify, Klaviyo, etc.)
2. Provisioning uses YOUSELL's affiliate referral links
3. Platform confirms referral → commission logged
4. affiliate-commission-track queue records client-service commissions
5. Dual-stream revenue visible in admin dashboard
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
| Payments + Billing | Stripe Checkout + Customer Portal | Transaction fees only | Phase B |
| Store OAuth | Shopify App, TikTok Open API, Amazon SP-API | Free (API access) | Phase D |
| Marketing OAuth | Meta Graph API, TikTok, YouTube, Pinterest | Free (OAuth) | Phase E |
| POD Partner APIs | Printful, Printify, Gelato REST APIs | Free (per-order cost) | Phase J |
| Social Publishing | Ayrshare or direct OAuth | Free tier / $29/mo | Phase E |
| Mobile App | Expo + EAS Build | $99/yr Apple, $25 Google | Phase H |

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
| Job Queue | BullMQ + Redis on Railway | ~$5/mo | 23 queues for all automation |
| Email | Resend API | Free | Outreach + alerts + order tracking |
| AI (scoring) | Claude Haiku API | ~$0.0003/1k tokens | Bulk scoring, NLP, classification |
| AI (insights) | Claude Sonnet API | ~$0.003/1k tokens | Blueprints, strategic insights |
| Web Scraping | Apify Cloud | $5 free/mo | Pre-built actors, batched runs |
| Trend Data | pytrends (via Apify actor) | Free | Google Trends, batched |
| Search | SerpAPI | 100 free/mo | Amazon + Google Shopping |
| Payments | Stripe | 2.9% + $0.30 per txn | Subscriptions, billing |
| NLP | spaCy + NLTK | Free open source | Comment sentiment, purchase intent |
| POD Fulfillment | Printful + Printify + Gelato APIs | Per-order | Product creation, order routing |
| Social Publishing | Ayrshare (optional) | Free tier | Multi-channel content distribution |

### 11.2 Corrected Stack Decisions

**From v7 to v8 — what changed:**

1. **POD fulfillment partner APIs added** — Printful, Printify, Gelato REST APIs for product creation, order routing, mockup generation.
2. **8 new BullMQ queues added** — pod-discovery, pod-provision, pod-fulfillment-sync, push-to-shopify, push-to-tiktok, push-to-amazon, affiliate-content-generate, affiliate-commission-track. Total now 23.
3. **Ayrshare added as optional** — Social publishing aggregator for multi-channel content distribution. Can use direct OAuth as alternative.
4. **Affiliate tracking infrastructure** — Database tables and BullMQ queues for dual-stream commission tracking.
5. **Admin Command Center** — New admin dashboard section with own store connections and revenue tracking.
6. **Revenue multiplier quantified** — ~$124K/yr estimated at 50 clients from affiliate commissions alone.

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
│   │   ├── pod/page.tsx          # POD products tab (NEW v8)
│   │   ├── command-center/page.tsx  # Admin Command Center (NEW v8)
│   │   ├── affiliate-revenue/page.tsx # Affiliate Commission Dashboard (NEW v8)
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
│   │   ├── admin/                # 22+ admin API routes
│   │   ├── dashboard/            # Client API routes
│   │   └── auth/                 # Auth callback, signout
│   ├── login/page.tsx            # Client login
│   └── layout.tsx                # Root layout
├── components/                   # Shared React components
│   ├── ui/                       # shadcn/ui primitives (16 components)
│   ├── product-card.tsx          # Universal product card
│   ├── score-badge.tsx           # Score display badge
│   ├── platform-products.tsx     # Platform product list
│   ├── command-center/           # Command Center components (NEW v8)
│   │   ├── best-sellers-panel.tsx
│   │   ├── pipeline-view.tsx
│   │   └── revenue-dashboard.tsx
│   └── affiliate/                # Affiliate Engine components (NEW v8)
│       ├── revenue-tracker.tsx
│       ├── commission-log.tsx
│       └── dual-stream-stats.tsx
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
- Platform + Channel badge (colour-coded per channel, including POD)
- Trend lifecycle stage badge: Emerging / Rising / Exploding / Saturated
- Final Opportunity Score — large circular gauge, green/orange/grey
- Key metric relevant to channel: GMV / BSR / Margin / Commission rate / POD margin
- Top 3 influencer avatars with follower counts
- Competitor store count + top competitor name
- Supplier availability indicator (or POD fulfillment partner badge)
- AI insight excerpt with expand button
- Three action buttons: View Blueprint · Add to Client · Archive
- POD products additionally show: Fulfillment partner, base cost, estimated margin

---

## Section 13 — Backend Architecture

### 13.1 Express Server (Railway)

Located at `backend/src/index.ts`. Provides:

- RESTful API endpoints for scan management
- BullMQ job creation and monitoring (23 queues)
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
│   ├── pod-worker.ts     # POD discovery + fulfillment worker (NEW v8)
│   ├── content-worker.ts # Content generation + affiliate content worker (NEW v8)
│   └── lib/
│       ├── queue.ts      # BullMQ queue configuration (23 queues)
│       ├── scoring.ts    # Backend scoring engine
│       ├── providers.ts  # Backend data providers
│       ├── supabase.ts   # Supabase service-role client
│       ├── email.ts      # Resend email service
│       ├── pod/          # POD partner integrations (NEW v8)
│       │   ├── printful.ts
│       │   ├── printify.ts
│       │   └── gelato.ts
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
2. Execute platform scrapers (TikTok, Amazon, Shopify, Pinterest, POD)
3. Score all discovered products (trend, viral, profit, final — with POD modifiers where applicable)
4. Store trends and keywords
5. Upsert products to Supabase
6. Update scan history with results
7. Send email notification for HOT products
8. Report completion

### 14.2 POD Worker (NEW v8)

Located at `backend/src/pod-worker.ts`. Processes POD-specific jobs:

- `pod-discovery` — Scrape Etsy/Redbubble/Amazon Merch for trending designs
- `pod-provision` — Push approved POD products to client stores with fulfillment partner attached
- `pod-fulfillment-sync` — Sync order status between stores and POD partners (Printful/Printify/Gelato)

### 14.3 Content Worker (NEW v8)

Located at `backend/src/content-worker.ts`. Processes content generation and affiliate content:

- `affiliate-content-generate` — Generate promotional content for affiliate platforms
- `affiliate-commission-track` — Log and reconcile commission events from affiliate networks

### 14.4 Known Worker Issues

- **BUG-050 (MEDIUM):** Platform scraping runs sequentially. Should be parallelised with `Promise.all()`.
- **BUG-051 (MEDIUM):** Worker has no graceful shutdown — `SIGTERM` handling missing.
- **BUG-052 (MEDIUM):** No dead letter queue for failed jobs.
- **BUG-022 (HIGH):** Worker writes to `scans` table but frontend reads `scan_history`.

### 14.5 Worker Sleep Mode

Railway worker must scale to zero when no jobs are queued. Worker wakes in ~5 seconds when a job arrives. Reduces Railway compute bill by 50–70%.

---

## Section 15 — Queue Architecture

### 15.1 BullMQ Configuration

Located at `backend/src/lib/queue.ts`.

- Connection: Redis on Railway (`REDIS_URL`)
- Default job options: 3 retries, exponential backoff

### 15.2 Complete Queue Registry (23 Queues)

| # | Queue | Purpose | Status |
|---|---|---|---|
| 1 | `scan-queue` | Product discovery scans | ✅ Built |
| 2 | `transform-queue` | Raw data → product transformation | ❌ Planned |
| 3 | `scoring-queue` | Batch scoring jobs | ❌ Planned |
| 4 | `content-queue` | AI content generation | ❌ Planned |
| 5 | `distribution-queue` | Content distribution to channels | ❌ Planned |
| 6 | `order-tracking-queue` | Order status email sequences | ❌ Planned |
| 7 | `influencer-outreach` | Influencer matching + email outreach | ❌ Planned |
| 8 | `financial-model` | Financial model generation | ❌ Planned |
| 9 | `blueprint-queue` | Launch blueprint generation | ❌ Planned |
| 10 | `notification-queue` | Push notifications + email alerts | ❌ Planned |
| 11 | `supplier-refresh` | Supplier data refresh | ❌ Planned |
| 12 | `influencer-refresh` | Influencer metric refresh | ❌ Planned |
| 13 | `affiliate-refresh` | Affiliate program discovery refresh | ❌ Planned |
| 14 | `client-scan` | Client-scoped scan pipeline | ✅ Built |
| 15 | `trend-scout` | Pre-viral trend detection | ✅ Built |
| 16 | `pod-discovery` | POD design trend discovery (NEW v8) | ❌ Planned |
| 17 | `pod-provision` | Push POD products to stores (NEW v8) | ❌ Planned |
| 18 | `pod-fulfillment-sync` | POD order fulfillment sync (NEW v8) | ❌ Planned |
| 19 | `push-to-shopify` | Push products to YOUSELL's Shopify (NEW v8) | ❌ Planned |
| 20 | `push-to-tiktok` | Push products to YOUSELL's TikTok Shop (NEW v8) | ❌ Planned |
| 21 | `push-to-amazon` | Push products to YOUSELL's Amazon (NEW v8) | ❌ Planned |
| 22 | `affiliate-content-generate` | Generate affiliate promotional content (NEW v8) | ❌ Planned |
| 23 | `affiliate-commission-track` | Track affiliate commission events (NEW v8) | ❌ Planned |

### 15.3 Queue Architecture Decision: BullMQ Native (Not n8n)

**Evaluated:** n8n as workflow orchestrator for the 23 queues.

**Decision:** Skip n8n. Build native in BullMQ.

**Rationale:**
- n8n adds infrastructure cost ($20+/mo self-hosted or $50+/mo cloud)
- BullMQ already handles job queuing, retries, dead letter queues, scheduling
- n8n adds a visual layer but no capability BullMQ lacks
- YOUSELL's queue logic is code-defined, not user-configurable — visual workflow editor adds no value
- Keeping everything in BullMQ means one fewer service to deploy, monitor, and maintain

**When to reconsider n8n:** If non-technical admins need to modify workflows without code changes, or if client-facing workflow customization becomes a feature.

**Detailed Performance Rationale:**
- **Network hops:** n8n adds network hops (n8n server → our API → Supabase) vs native BullMQ in-process execution on Railway (lower latency)
- **Batch processing:** n8n's execution model is less efficient for batch processing patterns (scanning 100+ products per run)
- **Cost at scale:** n8n self-hosted on Railway adds ~$5–20/month base; n8n cloud pricing becomes significant at 10K+ executions vs flat Railway cost
- **POD fulfillment queues** require custom request signing (Printful API tokens), webhook handling for order status, and tight coupling with product database for inventory sync — all better handled natively in BullMQ than through n8n's generic HTTP nodes

**Future Premium Feature (Post-100 Clients):** Consider offering n8n-based automation templates as a premium feature for clients who want custom workflow builders. This positions n8n as a competitive differentiator vs TopDawg/Sell The Trend/AutoDS, offering client-facing automation capabilities. Revisit when client volume exceeds 100+ and clients request custom automation workflows.

---

## Section 16 — Scheduler and Cost-Control Strategy

### 16.1 The Manual-First Principle

All jobs are manual until the admin enables automation. In early stage with 1–5 clients, doing 2–3 manual scans per week costs approximately $1–6 in API credits. Monthly cost stays near zero in quiet weeks.

### 16.2 Scan Modes

| Scan Mode | What It Runs | Duration | Cost |
|---|---|---|---|
| Quick Scan | TikTok Creative Center + pytrends + Reddit only. Haiku scoring. | 2–4 min | ~$0.05–0.20 |
| Full Scan | All eight channels (incl. POD), viral signals, influencer matching, supplier search, Haiku + Sonnet top 5. | 15–30 min | ~$0.50–2.50 |
| Client Scan | Full pipeline scoped to client's niche. Generates client-ready report. | 10–20 min | ~$0.30–1.50 |
| POD Scan | Etsy + Redbubble + Amazon Merch design trends, POD-specific scoring. | 5–10 min | ~$0.20–0.80 |

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
| POD Design Trend Scan | OFF | Weekly | ~$2–8/mo |
| Shopify Competitor Scan | OFF | Weekly | ~$2–5/mo |
| Influencer Metric Refresh | OFF | Weekly | ~$1–3/mo |
| Supplier Data Refresh | OFF | Monthly | ~$0.50/mo |
| Affiliate Content Generation | OFF | 3x/week | ~$2–5/mo |
| Affiliate Commission Sync | OFF | Daily | ~$0/mo (API calls) |
| Command Center Revenue Sync | OFF | Every 6 hours | ~$0/mo (webhook-based) |

### 16.4 Cost Optimisation Rules (Apply From Day One)

1. **Claude Haiku for bulk, Sonnet for premium.** Haiku handles: product NLP extraction, comment classification, trend stage classification, bulk scoring, scoring explanations, influencer outreach emails, affiliate content generation. Sonnet handles: strategic insights for 75+ products, launch blueprints, competitor analysis, tool comparison articles.
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

### 16.6 Per-Client Content Cost Projections (Growth Plan)

| Activity | Monthly Volume | Cost Per Unit | Monthly Cost |
|---|---|---|---|
| Text content (Claude Haiku) | 80 posts | $0.001 | $0.08 |
| Ad copy (Claude Sonnet) | 10 pieces | $0.01 | $0.10 |
| Video generation (Shotstack) | 20 videos | $0.40 | $8.00 |
| Image generation (Bannerbear) | 40 images | $0.10 | $4.00 |
| Social publishing (Ayrshare) | 100 posts | ~$0.05 | $5.00 |
| **Total per client** | | | **~$17.18/mo** |

**Platform Costs at Scale:**

| Clients | Content Cost | Publishing Cost | Shop API Cost | Total Variable |
|---|---|---|---|---|
| 10 | $172/mo | $50/mo | ~$0 | ~$222/mo |
| 50 | $859/mo | $250/mo | ~$0 | ~$1,109/mo |
| 100 | $1,718/mo | $500/mo | ~$0 | ~$2,218/mo |
| 500 | $8,590/mo | $2,500/mo | ~$0 | ~$11,090/mo |

**Fixed Content Infrastructure Costs:**

| Service | Monthly Cost | Notes |
|---|---|---|
| Ayrshare Business Plan | $99–$499/mo | Scales with profiles/posts |
| Shotstack | $49–$199/mo | Base plan + per-render credits |
| Bannerbear | $49–$149/mo | Base plan + per-render credits |
| Railway (additional worker) | ~$10/mo | Content + publishing workers |
| **Total fixed** | **~$207–857/mo** | Scales with tier |

---

## Section 16A — Multi-Source Data Fusion Engine (NEW v8)

### 16A.1 Source Reliability Weights

Data from multiple sources is fused using reliability weights. Higher-reliability sources take precedence in conflict resolution.

| Source | Reliability Weight |
|---|---|
| Keepa API | 0.95 |
| Admin import (CSV/manual) | 0.85 |
| Apify scraping | 0.70–0.75 |
| Google Trends (pytrends) | 0.60 |
| Estimates / Projections | 0.50 |

### 16A.2 Freshness Decay

Data freshness affects its scoring weight:

| Age | Freshness Multiplier |
|---|---|
| < 1 hour | 1.00 |
| < 6 hours | 0.95 |
| < 24 hours | 0.85 |
| < 72 hours | 0.70 |
| < 7 days | 0.50 |
| < 30 days | 0.30 |

**Fusion Rules (Conflict Resolution):**
- Price → use latest timestamp
- Sales volume → use max credible source
- BSR → Keepa only (most reliable)
- Trends → weighted average across sources
- Scores → recalculate from fused data

### 16A.3 Data Refresh Tiers

**Tier 1: Nightly Batch (Core Intelligence)** — 2 AM UTC daily
- Rescore all active products (free, compute only)
- Update trend stages and lifecycle
- Generate recommendation caches per client
- Compute dashboard widgets ("Today's Hot", "Rising Stars")
- Cost: $5–20/run

**Tier 2: Periodic Scrape (Fresh Data)** — Every 6–48 hours
- HOT products: Refresh every 6 hours
- WARM products: Refresh every 24 hours
- WATCH products: Refresh every 48 hours
- COLD products: Refresh weekly
- Cost: $10–50/run

**Tier 3: Weekly Deep Scan (Discovery)** — Sunday 3 AM
- Full product discovery across all 8 platforms
- New influencer/supplier discovery
- Cross-platform validation
- Cost: $30–100/run

**Tier 4: On-Demand (User-Triggered)** — Button click
- Live scrape for specific query
- Shows "Updating..." with progress
- Serves stale data immediately, refreshes in background
- Cost: $0.50–5/request

**Tier 5: Admin Manual Import** — CSV upload
- Parse + map + merge + score
- Free (data already purchased externally)

**Admin CSV Import Workflow (8 Steps):**
1. Admin uploads CSV/Excel file
2. System auto-detects source (Keepa / FastMoss / Kalodata) from column headers
3. Pre-built column mapping applied per source type
4. Preview: New (X) / Update (Y) / Skip (Z) products shown
5. Admin confirms import
6. Products merged into DB (dedup by platform + external_id or URL or title)
7. Scores recalculated with enriched data
8. Import logged in `imported_files` table

### 16A.3A Competitor Data Architecture Comparison

Understanding how competitors handle data refresh informs YOUSELL's tier strategy:

| Platform | Data Strategy | Refresh Rate | Pre-Computed? | Key Feature |
|---|---|---|---|---|
| **Sell The Trend** | Batch scrape + scored DB | Daily–Weekly | Yes (Nexus engine) | Nexus product scoring |
| **AutoDS** | 500M+ product catalog | 1–24 hours | Yes (monitoring engine) | Price/stock monitoring |
| **Jungle Scout** | 500M+ Amazon products | Daily BSR | Yes (Opportunity Finder) | BSR + demand estimation |
| **Helium 10** | 2B+ Amazon data points | Daily–real-time | Yes (Black Box) | Keyword + product research |
| **FastMoss** | TikTok focus | Daily | Yes (Hot Products) | 180M+ creator database |
| **Kalodata** | TikTok focus | 15-minute cycle | Yes (rankings) | Real-time TikTok sales data |

**YOUSELL positioning:** Tier 1 nightly batch + Tier 2 periodic scrape delivers competitive refresh rates for our initial scale. Target sub-30-minute refresh for HOT products once Keepa and direct APIs are integrated.

### 16A.4 Dashboard Recommendation Widgets

Pre-computed by Tier 1 nightly batch job:

| Widget | Description | Refresh |
|---|---|---|
| **"Today's Hot Products"** | Top 10 by final_score | Daily |
| **"Rising Stars"** | Score increase >10% in 7 days | Daily |
| **"Best for You"** | Personalized by client's platforms + niche | Daily |
| **"New Opportunities"** | Discovered in last 48h, score >60 | Daily |
| **"Seasonal Picks"** | Pre-computed seasonal trends | Weekly |
| **"Category Leaders"** | Top product per category | Daily |

### 16A.5 Smart Filter System

**Essential Filters:** Platform, Score Tier (HOT/WARM/WATCH/COLD), Price Range, Category, Trend Stage, Date Range, Sort By

**Advanced Filters:** Fulfillment Model, Marketing Channel, Margin %, Competition Level, Supplier Available, Influencer Matches, Cross-Platform Presence

**Saved Presets:** "Quick Wins" (HOT + low competition), "High Profit" (margin >50%), "Trending Now" (emerging/rising), "Low Risk" (established demand), "Affiliate Ready" (affiliate programs), "TikTok Viral" (TikTok + viral score >80)

### 16A.6 Additional Data Management Tables (NEW v8)

| Table | Purpose |
|---|---|
| `data_source_log` | Track enrichment sources per product (which APIs contributed data) |
| `product_score_snapshots` | Historical scores for trend detection (daily snapshots) |
| `column_mapping_templates` | Saved CSV column mappings per data source (Keepa, FastMoss, Kalodata) |
| `client_preferences` | Preferred platforms, categories, price range per client |
| `recommendation_cache` | Pre-computed recommendations per client (refreshed by Tier 1 nightly batch) |

---

## Section 17 — Data Ingestion Strategy

### 17.1 Ingestion Pipeline Stages

| Stage | Description | Status |
|---|---|---|
| 1. Actor Execution | Trigger Apify actors to scrape external sources | ✅ Built |
| 2. Dataset Retrieval | Fetch dataset results from actor runs | ✅ Built |
| 3. Raw Data Storage | Store JSON in raw_listings table | ❌ Partially |
| 4. Data Transformation | Normalise raw records to product schema | ✅ Built (in worker) |
| 5. Product Scoring | Apply 3-pillar scoring engine (with POD modifiers) | ✅ Built |
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
| Apify (existing) | $5 free/mo | All Apify actors (⚠️ rental Actors sunsetting: new Apr 2026, full Oct 2026) |
| Supabase | Existing | DB, auth, realtime |
| Resend | Existing | Email |
| Expo Push | Free | Mobile notifications |
| Keepa API | ~€19 base + API tiers from €49–€4,499/mo (EUR, token-based) | Amazon price history, BSR trends, deals |
| Shotstack API | Credit-based from $49/mo (was fixed tiers) | Video generation (15-60s MP4); ~$0.20–0.40/min |
| Bannerbear API | $49–299/mo (Automate $49, Scale $149, Enterprise $299) | Image generation (branded lifestyle) |
| Ayrshare | $49–499/mo (Starter $49, Premium $149, Business $499) | Multi-platform social publishing (13+ platforms) |
| Printful API | Free (per-order cost) | POD product creation, mockups, orders |
| Printify API | Free (per-order cost) | POD catalog, multi-provider comparison |
| Gelato API | Free (per-order cost) | Global POD fulfillment |

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
| Etsy Trending | Trending designs + best sellers | Weekly per category | $0.05–0.15 |
| Redbubble Trending | Trending design niches | Weekly | $0.05–0.10 |
| Merch by Amazon | Best seller designs | Weekly per category | $0.05–0.15 |

### 18.4 Paid Fallbacks (Activate Later if Needed)

| Service | Cost | When to Activate |
|---|---|---|
| FastMoss CSV | $49–99/mo | When Apify TikTok GMV insufficient |
| Kalodata CSV | $49/mo | Alternative for TikTok creator earnings |
| Helium 10 API | $39/mo | When Amazon fallback insufficient |
| Keepa API | ~€49/mo (entry API tier) | For 90+ day BSR history |

### 18.5 Keepa API Integration Details (NEW v8)

- **Endpoints:** `/product`, `/search`, `/bestsellers`, `/deals`, `/category`
- **Token system:** Base 1 token/min; API tiers from 20 tokens/min (€49/mo) to 2,500+ tokens/min (€4,499/mo). Pricing is in EUR.
- **Key data:** Historical prices, BSR, Buy Box, offers, deals, review trends
- **Best for:** Enriching Amazon products with historical signals

### 18.5A API Availability & Pricing Matrix (NEW v8)

Comprehensive view of all data source APIs evaluated for the platform:

| Source | Public API? | Data Export? | Pricing | Best Data | YOUSELL Use |
|---|---|---|---|---|---|
| **Keepa** | Yes (token-based) | Yes (CSV) | ~€19 base + API from €49–€4,499/mo (EUR) | Amazon price history, BSR, deals | Tier 2 enrichment |
| **FastMoss** | No (Enterprise only) | Yes (CSV export) | $29–109/mo | TikTok product/creator analytics | CSV import fallback |
| **Kalodata** | No (Enterprise only) | Yes (CSV export) | $45–110/mo | TikTok sales, 15-min refresh | CSV import fallback |
| **Google Trends** | Unofficial (pytrends) | N/A | Free | Search trends, seasonal patterns | Tier 1 scoring input |
| **Amazon SP-API** | Yes (official) | N/A | Free (approval needed) | Catalog, orders, fees | Direct integration |
| **SerpAPI** | Yes | N/A | $50–250/mo | Google Shopping, SERP data | On-demand enrichment |
| **Jungle Scout Cobalt** | Yes (enterprise) | N/A | $500+/mo | Amazon deep intelligence | Not viable at launch |
| **TikTok Research API** | Yes (approval needed) | N/A | Free (rate-limited) | Trending content, hashtags | Pending approval |
| **Pinterest Business API** | Yes | N/A | Free | Pin analytics, trends | Direct integration |
| **Apify** | Yes (actor marketplace) | N/A | $5–49/mo | All platforms via scraping | Primary fallback |

**Data Source Priority:** Use official APIs first (free/low cost), Keepa for Amazon enrichment, Apify as universal fallback, CSV import from FastMoss/Kalodata for TikTok intelligence when direct API unavailable.

### 18.6 Shop Platform API Research (NEW v8)

| Platform API | Key Details | Status |
|---|---|---|
| **Shopify GraphQL Admin API** | REST LEGACY since Oct 2024; critical REST endpoints dead Feb 2025; new apps GraphQL-only since Apr 2025; full REST shutdown date TBD. Key mutations: `productSet`, `productCreate`, `productCreateMedia`. Scopes: `write_products`, `read_products`, `write_inventory`. | Not built |
| **TikTok Shop Partner API** | OAuth 2.0 + HMAC-SHA256 signing. Product save requires ALL fields. Rate: 50 req/sec per store. US Portal separate from Global. | Not built |
| **Meta Commerce** | In-app checkout ended Sept 2025. Now drives traffic to merchant's external site. Batch API: `POST /{catalog_id}/items_batch`. Instagram Basic Display ended Dec 2024. | Not built |

**Meta In-App Checkout Sunset Impact:** Instagram/Facebook in-app checkout is no longer available for new products (ended Sept 2025). All Meta commerce now redirects to the merchant's external site (Shopify/own store). This means the Digital Products channel cannot rely on Meta native checkout — all digital product sales must route through Gumroad, Shopify, or similar external platforms. Plan accordingly for the Pinterest Commerce module (also a traffic driver, not a direct seller).
| **Amazon SP-API** | Replaces MWS. Feed-based product listing. Complex request signing. | Not built |

### 18.7 TikTok Content API — Critical Limitation (NEW v8)

**Unaudited third-party apps can only post to TikTok in PRIVATE mode.** Manual audit required for public posting (no guaranteed timeline).

**Phase 1 (Pre-audit):** Content generated → saved to Content Library → client downloads and uploads manually. "Download for TikTok" button with optimised format.

**Phase 2 (Post-audit):** Once TikTok Developer App passes audit, enable direct publishing through Ayrshare.

**Mandatory disclosure:** All TikTok content posted via API automatically labelled "Branded Organic Content / Promotional content" (TikTok policy effective September 2025). Inform clients during onboarding.

| Risk | Impact | Mitigation |
|---|---|---|
| TikTok Content API audit rejected/delayed | Cannot auto-publish to TikTok | "Download for TikTok" manual fallback; apply for audit early |

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
| POD design trends | 7 days | Weekly POD scan |
| Affiliate commission rates | 14 days | Bi-weekly affiliate refresh |

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
Products ←→ Admin Product Listings (NEW v8 — YOUSELL's own store listings)
Clients ←→ Product Requests
Clients ←→ Client Subscriptions
Clients ←→ Client Platform Access
Clients ←→ Client Engine Config
Clients ←→ Client Channels (OAuth tokens)
Clients ←→ Client Orders
Affiliate Programs ←→ Affiliate Referrals ←→ Affiliate Commissions (NEW v8)
Affiliate Programs ←→ Affiliate Content Log (NEW v8)
Admin Store Connections (NEW v8 — YOUSELL's own OAuth tokens)
Admin Revenue Tracking (NEW v8 — per-platform daily snapshots)
Automation Jobs (standalone)
Scan History (standalone)
Notifications ←→ Users
```

### 20.2 Uniqueness Constraints

- `products`: UNIQUE(platform, external_id) — prevents duplicates across scans
- `product_allocations`: UNIQUE(client_id, product_id) — one allocation per client per product
- `influencers`: UNIQUE(username, platform) — one record per creator per platform
- `client_subscriptions`: UNIQUE(client_id, stripe_subscription_id) — one record per subscription
- `admin_product_listings`: UNIQUE(product_id, platform) — one listing per product per platform
- `affiliate_referrals`: UNIQUE(program_id, client_id, stream) — one referral per program per client per stream

---

## Section 21 — Database Schema and Entity Relationships

### 21.1 Existing Tables (20 tables — all in Supabase PostgreSQL with RLS)

| Table | Key Fields | Purpose |
|---|---|---|
| `profiles` | id (uuid FK auth.users), role, name, email, push_token | User accounts |
| `admin_settings` | id, key, value | System configuration |
| `clients` | id, name, email, plan, niche, notes, default_product_limit | Client accounts |
| `products` | id, name, platform, external_id, price, final_score, trend_score, viral_score, profit_score, trend_stage, ai_insight_haiku, ai_insight_sonnet, fulfillment_type | Discovered products |
| `product_metrics` | id, product_id, metric_name, metric_value, recorded_at | Time-series for sparklines |
| `viral_signals` | id, product_id, signal_type, signal_value, detected_at | Six viral signal readings |
| `influencers` | id, username, platform, followers, tier, engagement_rate, us_audience_pct, fake_follower_pct, conversion_score, email, cpp_estimate, niche | Creator profiles |
| `product_influencers` | id, product_id, influencer_id, video_urls, match_score, outreach_status | Product ↔ influencer links |
| `competitor_stores` | id, product_id, store_name, platform, url, est_monthly_sales, primary_traffic, ad_active, success_score | Competitor data |
| `suppliers` | id, name, country, moq, unit_price, shipping_cost, lead_time, white_label, dropship, us_warehouse, certifications | Supplier records |
| `product_suppliers` | id, product_id, supplier_id | Product ↔ supplier links |
| `financial_models` | id, product_id, retail_price, total_cost, gross_margin, break_even_units, influencer_roi, ad_roas_estimate, revenue_30/60/90day | Financial analysis |
| `launch_blueprints` | id, product_id, positioning, product_page_content, pricing_strategy, video_script, ad_blueprint, launch_timeline, risk_notes, generated_by | Launch plans |
| `affiliate_programs` | id, name, platform, commission_rate, recurring, cookie_days, network, join_url, niche_tags, category, priority, stream | Affiliate program DB |
| `product_allocations` | id, client_id, product_id, platform, rank, visible_to_client, allocated_at, source, status | Client product access |
| `product_requests` | id, client_id, platform, note, status, requested_at, fulfilled_at, products_released | Client requests |
| `automation_jobs` | id, job_name, status, trigger_type, started_at, completed_at, records_processed, api_cost_estimate | Job tracking |
| `scan_history` | id, scan_mode, client_id, started_at, completed_at, products_found, hot_products, cost_estimate | Scan audit trail |
| `outreach_emails` | id, influencer_id, product_id, subject, body, sent_at, resend_id, status | Email tracking |
| `notifications` | id, user_id, type, title, body, product_id, read, created_at | System notifications |
| `imported_files` | id, filename, type, source_platform, rows_imported, errors, uploaded_at | CSV import log |
| `trend_keywords` | id, keyword, platform, score, direction | Trend tracking |

### 21.2 New Tables Required (Phase 1–4 from v7)

```sql
-- Client subscription management (Stripe integration)
CREATE TABLE client_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
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
    platform TEXT NOT NULL,
    tier TEXT NOT NULL,
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
    engine TEXT NOT NULL,
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
    metric TEXT NOT NULL,
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
    channel_type TEXT NOT NULL,
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
    content_type TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'pending',
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
    status TEXT DEFAULT 'pending',
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

### 21.3 New Tables Required (Phase J–L — POD, Command Center, Affiliate Engine) (NEW v8)

```sql
-- YOUSELL's own store OAuth connections (Command Center)
CREATE TABLE admin_store_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL, -- shopify, tiktok_shop, amazon, etsy
    store_name TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[],
    is_active BOOLEAN DEFAULT true,
    connected_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(platform)
);

-- Products listed on YOUSELL's own stores
CREATE TABLE admin_product_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_listing_id TEXT,
    status TEXT DEFAULT 'draft', -- draft, listed, active, performing, archived
    revenue DECIMAL(12,2) DEFAULT 0,
    orders INTEGER DEFAULT 0,
    listed_at TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, platform)
);

-- Daily revenue snapshots per platform per product
CREATE TABLE admin_revenue_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_listing_id UUID REFERENCES admin_product_listings(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    date DATE NOT NULL,
    revenue DECIMAL(12,2) DEFAULT 0,
    orders INTEGER DEFAULT 0,
    cost DECIMAL(12,2) DEFAULT 0,
    net_profit DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_listing_id, date)
);

-- Affiliate referral events (dual-stream tracking)
CREATE TABLE affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES affiliate_programs(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- null for Stream 1
    stream TEXT NOT NULL CHECK (stream IN ('internal', 'client_service')),
    referred_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'pending', -- pending, confirmed, paid, rejected
    UNIQUE(program_id, client_id, stream)
);

-- Affiliate commission records
CREATE TABLE affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    period TEXT, -- month/year or 'one-time'
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Affiliate content factory log
CREATE TABLE affiliate_content_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES affiliate_programs(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- article, social_post, tutorial, case_study
    platform_published TEXT NOT NULL, -- blog, tiktok, instagram, youtube, email
    content TEXT,
    published_at TIMESTAMPTZ,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- POD product designs (links products to design assets)
CREATE TABLE pod_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    design_niche TEXT NOT NULL,
    design_keywords TEXT[],
    mockup_urls TEXT[],
    fulfillment_partner TEXT NOT NULL, -- printful, printify, gelato
    base_cost DECIMAL(10,2),
    recommended_price DECIMAL(10,2),
    estimated_margin DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 21.4 Content & Publishing Tables (NEW v8)

```sql
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    channel_type TEXT NOT NULL, -- tiktok, instagram, facebook, pinterest, youtube, linkedin, twitter
    content_type TEXT NOT NULL, -- social_post, ad_copy, video, image, carousel, email, blog
    template_used TEXT,
    status TEXT DEFAULT 'draft', -- draft, pending_review, approved, generating, ready, scheduled, published, archived, rejected, failed
    title TEXT,
    body TEXT,
    media_urls TEXT[],
    media_metadata JSONB DEFAULT '{}',
    hashtags TEXT[],
    platform_metadata JSONB DEFAULT '{}', -- platform-specific fields (sound_id for TikTok, etc.)
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    external_post_id TEXT,
    engagement_data JSONB DEFAULT '{}', -- views, likes, comments, shares
    credits_used INTEGER DEFAULT 0,
    generation_cost DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    channel_id UUID REFERENCES client_channels(id),
    platform TEXT NOT NULL, -- shopify, tiktok_shop, amazon, meta
    external_product_id TEXT NOT NULL,
    external_product_url TEXT,
    sync_status TEXT DEFAULT 'synced', -- synced, pending, error, delisted
    last_synced_at TIMESTAMPTZ DEFAULT now(),
    price_on_platform DECIMAL(10,2),
    inventory_count INTEGER,
    listing_status TEXT DEFAULT 'active', -- active, inactive, under_review, rejected
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, product_id, platform)
);

CREATE TABLE content_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_credits INTEGER NOT NULL,
    used_credits INTEGER DEFAULT 0,
    bonus_credits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, period_start)
);

CREATE TABLE client_social_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    ayrshare_profile_key TEXT NOT NULL UNIQUE,
    connected_platforms TEXT[] DEFAULT '{}', -- ['tiktok', 'instagram', 'facebook']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE publish_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    channel_type TEXT NOT NULL,
    ayrshare_post_id TEXT,
    platform_post_id TEXT,
    platform_post_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, published, failed, deleted
    error_message TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE client_automation_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- product_upload, content_creation, content_publishing, influencer_outreach, product_discovery
    automation_level INTEGER DEFAULT 1, -- 1=manual, 2=assisted, 3=autopilot
    rules JSONB DEFAULT '{}', -- feature-specific rules (caps, categories, price range, etc.)
    is_paused BOOLEAN DEFAULT false,
    paused_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, feature)
);
```

**Content States Workflow:**
```
draft → pending_review → approved → generating → ready → scheduled → published → archived
                 │                      │
                 └── rejected           └── failed (retry or discard)
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
- **Fulfillment:** fulfillment_type (dropship/wholesale/pod/digital/affiliate) — auto-recommended
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

**POD-Specific Scoring Modifiers (Applied to POD Channel Products):**
```
POD trend_score adjustments:
  + Design trend velocity (rising design aesthetics on Etsy/Pinterest)
  + Seasonal relevance (holiday/event-specific designs)
  − Niche saturation (too many similar designs)

POD viral_score adjustments:
  + Social media aesthetic appeal (visually shareable design)
  + Influencer adoption of niche merch
  + UGC potential (customers sharing photos wearing/using product)

POD profit_score adjustments:
  + Must exceed 30% margin after fulfillment costs
  + Fulfillment partner price comparison (cheapest partner wins bonus)
  − High base cost items penalised
```

### 22.3 Score Tiers

| Score Range | Badge | System Action |
|---|---|---|
| 80–100 | HOT | Top of dashboard, push notification, admin email, queue for client allocation, appear in Command Center |
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
| Niche / Category | Yes | Beauty, Tech, Lifestyle, Home, Fitness, POD/Merch, etc. |
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

Add a prominent "Invite" button on each influencer card in both admin and client dashboards. Clicking generates a personalised outreach email via Claude Haiku and sends via Resend. The email includes: first name, product name, niche reference, affiliate/commission offer, sample product request template, video brief with hook structure. All outreach tracked in `outreach_emails` table with status updates.

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
| Affiliate (no ad spend) | Unlimited | $0 | Digital products, AI tools, SaaS, POD merch |

### 26.2 Ad Intelligence Data Sources

- Meta Ads Library public API (free) — competitor ad creatives, duration, active status
- TikTok Ads Library public search (free) — trending product ads
- Google Shopping via SerpAPI (100 free/mo) — active product ads

---

## Section 27 — Affiliate / Monetisation Intelligence Model

### 27.1 Affiliate Program Database

The platform maintains a curated, frequently updated database of affiliate programs. Pre-seeded with 10 AI programs, 5 physical programs, and 24+ programs across 6 categories (e-commerce, POD, marketing, AI tools, dropship, payment/analytics). Discovery sources: Product Hunt API, PartnerStack, AppSumo, Twitter/X.

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

### 27.4 Competitive Landscape — POD Platforms (NEW v8)

| Platform | Strengths | Weaknesses | YOUSELL Advantage |
|---|---|---|---|
| Printful | Largest catalog (340+), mockup API, branding options | Higher base costs | Intelligence layer discovers winning designs before competitors |
| Printify | 900+ products via multi-provider network, price comparison | Quality varies by provider | AI scoring identifies best provider per product |
| Gelato | 32-country local production, fast delivery | Smaller catalog | Global reach for international clients |

### 27.5 Competitive Landscape — Affiliate Commission Platforms (NEW v8)

| Category | Top Programs | YOUSELL Strategy |
|---|---|---|
| E-Commerce Platforms | Shopify (20% recurring), BigCommerce (200% bounty), Wix ($100/sale) | Auto-refer every client store setup |
| POD Partners | Printful (10% 12mo), Printify (5% 12mo), Gelato ($500/ref) | Bundle with POD channel onboarding |
| Marketing Tools | Klaviyo (10-20% recurring), Omnisend (20% recurring) | Recommend during content engine setup |
| AI/SaaS Tools | Jasper (25-30%), Copy.ai (45% Y1), Writesonic (30% lifetime) | Promote via internal content factory |
| Dropship Suppliers | Spocket (20-30% LIFETIME), Zendrop (20%) | Integrate into supplier recommendations |
| Payment/Analytics | Stripe ($2,500/merchant), PayPal ($2,500/merchant), Semrush ($200/sub) | High-value one-time referrals |

---

## Section 28 — Product Clustering Logic

### 28.1 Clustering Approach

Products are clustered by:
- **Category similarity** — Same product type across platforms (e.g., "ice roller" on TikTok + Amazon + Shopify)
- **Keyword overlap** — Shared keywords in product names and descriptions
- **Influencer overlap** — Same influencers promoting similar products
- **Trend correlation** — Products trending together on Google Trends
- **Design similarity** — POD products with similar design aesthetics or niche themes

### 28.2 Cross-Platform Intelligence

When a product is detected on one platform, automatically check for presence on others. This enables:
- Multi-channel opportunity identification
- Demand validation across ecosystems
- Price comparison across marketplaces
- POD design trend validation (same niche trending on Etsy + Redbubble + TikTok = strong signal)

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
- Etsy — trending product searches and listing growth (also POD design trends)
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

1. **Niche alignment** — Creator's category matches product category (including POD merch niches)
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

- Product type (physical vs digital vs POD vs affiliate)
- Price point (impulse <$60 → TikTok, premium → Shopify, search-intent → Amazon)
- Competition density per platform
- Margin requirements per platform (Amazon 15% fee vs TikTok 5–8% vs Shopify 0%)
- Target audience platform preferences
- POD products: Etsy for handmade/custom, Shopify for branded, Amazon Merch for volume

---

## Section 32 — Opportunity Feed Logic

### 32.1 Admin Opportunity Feed

Real-time scrolling feed on admin dashboard showing:
- Newly detected products with trend stage
- Score changes (product went from WARM to HOT)
- New influencer matches for 60+ products
- New competitor store detections
- System events (scan started/completed, errors)
- Command Center alerts (product pushed to store, revenue milestone)
- Affiliate commission events (new referral confirmed, commission paid)

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
- Filter by platform, category, trend stage, score range, fulfillment type (NEW v8)
- Sort by: final_score, trend_score, viral_score, profit_score, created_at, price
- Pagination with configurable page size

### 33.2 Known Search Issues

- **BUG-049 (MEDIUM):** Products table lacks an index on `name` or `platform` — search may be slow at scale.
- **BUG-045 (MEDIUM):** Product sort field not whitelisted — `sortBy` query param passed directly to Supabase `.order()`, allowing arbitrary column sorting.

---

## Section 34 — Analytics and Dashboard Requirements

### 34.1 Admin Dashboard KPIs

- Total products discovered (by platform, including POD)
- HOT / WARM / WATCH / COLD distribution
- Products discovered this week vs last week
- Top trending categories
- Scan history with cost tracking
- API cost this month
- Client count and subscription MRR
- **Command Center metrics: products live, weekly revenue, conversion rate** (NEW v8)
- **Affiliate revenue: Stream 1 + Stream 2 totals, month-over-month** (NEW v8)

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
2. Products (with sub-tabs: All, TikTok, Amazon, Shopify, Pinterest, Digital, Affiliates, **POD**)
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
16. **Command Center** (NEW v8)
17. **Affiliate Revenue** (NEW v8)
18. Settings

### 35.2 Scan Control Panel

Prominent on the dashboard homepage. Contains:
- Large labelled buttons for Quick / Full / Client / **POD** scan
- Confirmation dialog with estimated cost and duration
- Real-time progress bar and step-by-step status log
- Abort button for graceful cancellation
- Last scan timestamp
- Scan history log

---

## Section 36 — Platform Gating and Upsell Architecture

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

### 38.3 New API Routes Required (Phase B–F from v7)

| Method | Endpoint | Purpose | Phase |
|---|---|---|---|
| POST | /api/webhooks/stripe | Stripe webhook handler | B |
| GET | /api/dashboard/subscription | Client's subscription details | B |
| POST | /api/dashboard/subscription/portal | Stripe Customer Portal session | B |
| GET | /api/dashboard/engines | Client's enabled engines | C |
| POST | /api/dashboard/engines/:id/toggle | Toggle engine on/off | C |
| GET | /api/dashboard/channels | Connected channels | E |
| POST | /api/dashboard/channels/connect | Initiate OAuth flow | E |
| DELETE | /api/dashboard/channels/:id | Disconnect channel | E |
| GET | /api/dashboard/content | Content queue | E |
| POST | /api/dashboard/content/generate | Generate content | E |
| GET | /api/dashboard/orders | Client's orders | F |
| POST | /api/webhooks/shopify | Shopify order webhooks | F |
| POST | /api/webhooks/tiktok | TikTok order webhooks | F |
| GET/POST | /api/admin/clients/:id/engines | Admin engine management | C |
| GET | /api/admin/clients/:id/usage | Admin usage tracking | C |
| GET | /api/admin/revenue | MRR and subscription analytics | B |

### 38.4 New API Routes Required (Phase J–L — POD, Command Center, Affiliate Engine) (NEW v8)

| Method | Endpoint | Purpose | Phase |
|---|---|---|---|
| GET | /api/admin/pod | POD products list | J |
| POST | /api/admin/pod/scan | Trigger POD design scan | J |
| GET | /api/admin/pod/designs/:id | POD design details + mockups | J |
| POST | /api/admin/pod/provision | Push POD product to client store | J |
| GET | /api/admin/command-center | Command Center dashboard data | K |
| GET | /api/admin/command-center/listings | YOUSELL's own store listings | K |
| POST | /api/admin/command-center/push | Push product to YOUSELL's store | K |
| GET | /api/admin/command-center/revenue | Revenue analytics per platform | K |
| POST | /api/admin/command-center/stores/connect | Connect YOUSELL's own store OAuth | K |
| GET | /api/admin/affiliate-revenue | Dual-stream affiliate revenue dashboard | L |
| GET | /api/admin/affiliate-revenue/programs | All affiliate programs with stats | L |
| POST | /api/admin/affiliate-revenue/content/generate | Trigger affiliate content generation | L |
| GET | /api/admin/affiliate-revenue/commissions | Commission log with filters | L |
| POST | /api/webhooks/printful | Printful order/fulfillment webhooks | J |
| POST | /api/webhooks/printify | Printify order/fulfillment webhooks | J |

---

## Section 39 — Background Jobs and Worker Definitions

### 39.1 Current Worker Jobs

| Job Type | Trigger | Actions | Status |
|---|---|---|---|
| quick-scan | Manual button | TikTok Creative Center + pytrends + Reddit, Haiku scoring | ✅ Built |
| full-scan | Manual button | All 8 channels (incl. POD), viral signals, influencer matching, Haiku + Sonnet | ✅ Built |
| client-scan | Manual button | Full pipeline scoped to client niche | ✅ Built |

### 39.2 New Worker Jobs Required (Phase B–F)

| Job Type | Trigger | Actions | Phase |
|---|---|---|---|
| content-generate | Client request / schedule | Generate marketing content via Claude Haiku, queue for distribution | E |
| content-distribute | Schedule (daily) | Post generated content to connected channels via OAuth | E |
| order-tracking | Webhook from store | Process order events, send email sequence via Resend | F |
| influencer-refresh | Schedule (weekly) | Update influencer metrics for all tracked creators | Existing (disabled) |
| supplier-refresh | Schedule (monthly) | Update supplier data, pricing, availability | Existing (disabled) |
| affiliate-refresh | Schedule (weekly) | Discover new affiliate programs, update commission rates | Existing (disabled) |

### 39.3 New Worker Jobs Required (Phase J–L — POD, Command Center, Affiliate) (NEW v8)

| Job Type | Trigger | Actions | Phase |
|---|---|---|---|
| pod-discovery | Manual / weekly schedule | Scrape Etsy, Redbubble, Amazon Merch for trending designs. Score with POD modifiers. | J |
| pod-provision | Admin approval in Command Center | Push approved POD product to client/admin store with fulfillment partner attached | J |
| pod-fulfillment-sync | Webhook from POD partner | Sync order status between store and Printful/Printify/Gelato | J |
| push-to-shopify | Command Center button | Create product in YOUSELL's Shopify via GraphQL productSet mutation | K |
| push-to-tiktok | Command Center button | Create product in YOUSELL's TikTok Shop via product.save API | K |
| push-to-amazon | Command Center button | Create listing in YOUSELL's Amazon via SP-API Feeds | K |
| affiliate-content-generate | Schedule (3x/week) | Generate promotional content for affiliate platforms using Claude Haiku | L |
| affiliate-commission-track | Daily / webhook | Log commission events from affiliate networks, reconcile payments | L |

### 39.4 Manual Scan Pipeline Sequence

```
1.  ADMIN presses Quick / Full / Client / POD scan button
2.  CONFIRM dialog: mode, estimated duration, estimated cost
3.  JOB CREATED in BullMQ → Supabase Realtime pushes "Scan Started"
4.  TREND SCOUT: TikTok Creative Center + pytrends + Reddit + viral signals
5.  PRODUCT EXTRACTION: Claude Haiku NLP extracts and clusters product names
6.  DISCOVERY: All channel modules run concurrently (including POD)
7.  ENRICHMENT: Cost structure, supplier pricing, competitor data, POD fulfillment pricing
8.  SCORING: Three scores + Final Score + tier classification (with POD modifiers)
9.  FILTER: <40 archived, 40–59 watch, 60+ proceed to full analysis
10. INFLUENCER MATCH: For 60+ products — find and score creators
11. SUPPLIER MATCH: For 60+ physical products — locate suppliers / POD fulfillment partners
12. FINANCIAL MODEL: Full unit economics for 60+ products
13. BLUEPRINT: Claude Sonnet for 75+ (on demand only)
14. COMPETITOR INTEL: Identify stores, estimate revenue, extract strategy
15. PERSIST: All data to Supabase with relational links
16. REALTIME PUSH: Dashboard updates via Supabase Realtime
17. NOTIFY: Resend email + push notification for HOT (80+) products
18. COMMAND CENTER: HOT products auto-appear in Best Sellers Pool
19. SCAN COMPLETE: Summary card with products found, hot count, cost, duration
```

---

## Section 40 — Logging, Audit Trail, and Monitoring

### 40.1 Audit Logging

All admin actions are logged: user ID, timestamp, action type, affected record IDs. Stored in `scan_history` and `automation_jobs` tables. Command Center actions (push to store, revenue sync) also logged.

### 40.2 Error Logging

- All routes wrap in try/catch with `console.error` and 500 response
- Missing API keys: providers return empty arrays with `console.warn`
- Email failures: caught, logged, never crash the worker
- Redis errors: logged via event listener
- POD partner API errors: logged with partner name and error code

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
- **POD partner webhook retry** — Printful/Printify webhooks may fail; implement idempotent processing

---

## Section 42 — Recovery and Continuity Protocol for Claude Code

### 42.1 Mandatory Pre-Development Protocol

Before writing ANY code, Claude Code MUST:

1. **Read these files in order:**
   - `CLAUDE.md` — Project rules and guardrails
   - `docs/YouSell_Platform_Technical_Specification_v8.md` — This document (canonical architecture)
   - `system/development_log.md` — Recent changes log
   - `system/ai_logic.md` — Platform operational logic

2. **Inspect existing modules** before creating replacements

3. **Check for existing implementations** before writing new code — search the codebase first

### 42.2 Mandatory Post-Development Protocol

After completing ANY meaningful implementation:

1. Update `system/development_log.md` with what was changed
2. Update task tracking files with new completion status
3. Commit changes with descriptive message

### 42.3 Non-Negotiable Claude Code Rules

1. **Never rebuild completed functionality.** Always inspect first.
2. **Never overwrite architecture files blindly.** Read before writing.
3. **Never run scraping inside API request handlers.** Workers only.
4. **Never create duplicate implementations.** Search existing code first.
5. **Never skip the context recovery protocol.** Read all memory files before coding.
6. **Continue from the latest logged development step.** Never restart from scratch.
7. **Maintain repo documentation in parallel with code changes.** Keep files consistent.
8. **Treat this v8 specification as the primary architecture reference** unless a newer canonical file explicitly replaces it.
9. **Use mock data for unconnected APIs.** Mark mock data clearly in the UI.
10. **Prefer free APIs.** Introduce paid APIs only when free alternatives cannot deliver.
11. **Maximise the existing stack.** Netlify, Supabase, Railway, GitHub, Resend.
12. **Apply cost optimisations from day one.** They are architectural decisions, not afterthoughts.

---

## Section 43 — Required System Memory Files

### 43.1 Canonical Files (Source of Truth)

| File | Purpose | Precedence |
|---|---|---|
| `docs/YouSell_Platform_Technical_Specification_v8.md` | Master architecture specification | #1 — Highest |
| `CLAUDE.md` | Project rules, guardrails, and development instructions | #2 |
| `system/development_log.md` | Change history and session log | #3 |
| `system/ai_logic.md` | Platform operational logic reference | #4 |
| `tasks/todo.md` | Task planning and progress tracking | #5 |
| `tasks/execution_plan.md` | Step-by-step implementation execution plan | #6 |
| `tasks/lessons.md` | Patterns and lessons from corrections | Reference |
| `system/project_check_prompt.md` | QA audit execution prompt | Reference |
| `docs/content_publishing_shop_integration_strategy.md` | Content creation & shop integration strategy | Reference |
| `docs/USE_CASE_DIAGRAM.md` | Platform use case diagrams and data flows | Reference |
| `docs/MARKET_RESEARCH_LOG_SESSION3.md` | Market research findings (80+ sources) | Reference |
| `docs/RTM_v7.md` | Requirements traceability matrix | Reference |
| `docs/IMPROVEMENT_PLAN.md` | Feature improvement plan and priorities | Reference |
| `docs/competitive_analysis_tiers_7_8_niches.md` | Competitive landscape analysis | Reference |

### 43.2 Deprecated Files

These files contain OUTDATED information and should NOT be treated as authoritative:

| File | Status | Reason |
|---|---|---|
| `docs/YouSell_Platform_Technical_Specification_v7.md` | Superseded | Replaced by this v8 specification |
| `YouSell_BuildBrief_v6_DEFINITIVE.docx` | Superseded | Replaced by v7, now v8 |
| `YOUSELL_MASTER_BUILD_BRIEF_v4.pdf` | Superseded | Three versions behind |
| `YOUSELL_MASTER_BUILD_BRIEF_v5.pdf` | Superseded | Two versions behind |
| `YOUSELL_OPUS_MASTER_PROMPT_v1 (1).md` | Superseded | Old autonomous prompt |
| `ai_operating_manual.md.txt` | Superseded | Replaced by CLAUDE.md |
| All other build briefs, QA prompts, audit reports in root/archive | Superseded | Reference only |

### 43.3 Precedence Rule

If any file conflicts with this v8 specification, the v8 specification takes precedence. If an even newer file is created, it must explicitly declare itself as the new canonical source and reference this v8 document.

---

## Section 44 — Repository Rules and Guardrails

### 44.1 Development Rules

1. **Do NOT rebuild completed functionality.** Always inspect first.
2. **Always inspect the repository before creating new files.**
3. **Only implement missing or broken components.**
4. **Always check the development log before starting work.**
5. **Use the existing Supabase singleton client.** Do not create new instances.
6. **Use Apify actors as the primary scraping method.**
7. **Ensure compatibility with Netlify deployment constraints.**
8. **Build phase by phase.** Deploy and verify each phase before starting the next.
9. **Use mock data for every unconnected API.** Mark clearly with UI banner.
10. **API keys in environment variables only** — never in source code or client bundles.

### 44.2 Code Quality Standards

- TypeScript strict mode
- ESLint + Prettier formatting
- Supabase RLS on every table (including new v8 tables)
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

### 45.3 Development Phases (v7 Original)

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

### 45.4 New Development Phases (v8 Additions)

| Phase | Tasks | Estimated Effort | Dependencies |
|---|---|---|---|
| J — POD Channel #8 | POD discovery engine, Printful/Printify/Gelato API integration, POD scoring modifiers, POD product tab, pod_designs table, mockup generation | 5–7 days | Phase D |
| K — Admin Command Center | Best Sellers dashboard, per-platform pipeline view, push-to-store BullMQ jobs, admin_store_connections, admin_product_listings, admin_revenue_tracking tables, revenue dashboard | 5–7 days | Phase D |
| L — Affiliate Commission Engine | Dual-stream revenue tracking, affiliate_referrals + affiliate_commissions tables, content factory (affiliate-content-generate queue), commission log dashboard, 24+ program database seeding | 5–7 days | Phase E |

### 45.5 Implementation Timeline (Updated for v8)

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
| **J — POD Channel** | **5–7 days** | **Week 15–16** |
| **K — Command Center** | **5–7 days** | **Week 17–18** |
| **L — Affiliate Engine** | **5–7 days** | **Week 19–20** |

**Total estimated: 20–22 weeks from current state to full production (including POD, Command Center, and Affiliate Engine).**

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

**What's missing (v7 phases):**
- Stripe payment integration
- Store integrations (Shopify/TikTok/Amazon push)
- Content creation engine
- Marketing channel OAuth
- Order tracking
- Engine toggle system
- Platform gating UI
- Mobile app

**What's missing (v8 additions):**
- POD discovery engine + fulfillment partner APIs
- Admin Command Center dashboard
- Push-to-store BullMQ jobs for YOUSELL's own shops
- Affiliate Commission Engine (dual-stream tracking)
- Affiliate content factory
- 8 new BullMQ queues
- 7 new database tables
- 15 new API routes

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

1. Gross margin below 40% (POD: below 30%)
2. Shipping cost exceeds 30% of retail price
3. Break-even timeline exceeds 2 months
4. Product classified as fragile, hazardous, or requires special certification
5. No supplier found with USA delivery under 15 days (POD exempt — on-demand production)

**Known Issue (BUG-063):** Only 5 of 8 auto-rejection rules are implemented in the financial route. Three are missing.

### 47.4 QA Audit Sections for v8 Additions (NEW)

**Section N — Admin Command Center Audit:**
- N.1: Dashboard renders top-scoring products with correct action buttons
- N.2: Per-platform pipeline view shows live stats and status tracking

**Section O — Affiliate Commission Engine Audit:**
- O.1: Dual revenue streams (internal + client service) tracked separately
- O.2: 24+ affiliate platform integrations with correct commission rates
- O.3: Content factory generates and publishes affiliate content on schedule
- O.4: Revenue tracking dashboard shows accurate commission totals

**Section P — POD Channel #8 Audit:**
- P.1: POD discovery engine scrapes Etsy, Redbubble, Amazon Merch
- P.2: Printful/Printify/Gelato API integration works end-to-end
- P.3: POD products pushed to stores with fulfillment partner attached
- P.4: POD-specific scoring modifiers applied correctly

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
- **Admin Command Center tables** — admin-only access (super_admin + admin roles)
- **Affiliate Commission tables** — admin-only access for both streams

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
- [ ] POD partner webhook signature validation (Printful, Printify)

### 48.4 Integration Security Rules

- **Client store integrations** — OAuth 2.0 only. NEVER handle client login passwords.
- **Token storage** — All OAuth tokens encrypted at rest in `client_channels` and `admin_store_connections` tables.
- **Token scoping** — Request minimum required scopes. Document what each scope enables.
- **Token revocation** — Client can disconnect from either YouSell or the platform itself.
- **Webhook validation** — Verify signatures on all incoming webhooks (Stripe, Shopify, TikTok, Printful, Printify).

---

## Section 49 — Multi-Tenant SaaS Controls

### 49.1 Tenant Isolation

Each client is a tenant. Isolation enforced at three levels:

1. **RLS** — Database-level row filtering based on user role and client_id
2. **API middleware** — `requireAdmin()` and `requireClient()` check role before processing
3. **UI scoping** — Dashboard shows only `visible_to_client = true` products

### 49.2 Product Allocation Model

- System discovers and scores top 50 products per platform per scan (including POD)
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
- **Command Center data (YOUSELL's own store listings and revenue)**
- **Internal affiliate revenue (Stream 1 — admin-only)**

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
- `STRIPE_SECRET_KEY` — Stripe API key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
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
- `PRINTFUL_API_KEY` — Printful REST API (NEW v8)
- `PRINTIFY_API_KEY` — Printify REST API (NEW v8)
- `GELATO_API_KEY` — Gelato REST API (NEW v8)

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

Plus estimated **$124K/yr affiliate commission revenue** at 50 clients (scales linearly).

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
| POD partner API changes | Fulfillment disrupted | Multiple partners (Printful + Printify + Gelato) provide redundancy |
| Affiliate program terms change | Commission reduction | Diversify across 24+ programs, prioritize lifetime recurring deals |
| TikTok Content API audit rejected/delayed | Cannot auto-publish to TikTok | "Download for TikTok" manual fallback; apply for audit early |
| Ayrshare pricing increases | Publishing costs rise | Native OAuth fallback architecture maintained for key platforms |
| Inappropriate auto-published content | Brand damage, platform ban | Content moderation check (Claude Haiku) before all auto-publishing |
| OAuth token expiry undetected | Integration silently breaks | Daily health check job + immediate notification to client |
| Content generation quality inconsistent | Client dissatisfaction | Brand voice calibration, quality scoring, human review option |
| Meta in-app checkout sunset (Sept 2025) | No native Meta checkout for digital products | Route all sales through Shopify/Gumroad; Meta is traffic driver only |
| Shopify REST API deprecation (phased 2024–2025) | REST legacy since Oct 2024; critical endpoints dead Feb 2025; new apps GraphQL-only Apr 2025; full shutdown TBD | Must use GraphQL Admin API from day one; no REST fallback |

---

## Section 54 — Final Execution Instructions for Claude Code

### 54.1 Before Starting Any New Session

```
1. Read CLAUDE.md
2. Read docs/YouSell_Platform_Technical_Specification_v8.md (this document)
3. Read system/development_log.md
4. Read system/ai_logic.md
5. Summarize: current architecture, completed tasks, remaining tasks
6. Continue from the latest logged development step
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
11. Implement POD Channel #8 (Phase J)
12. Implement Admin Command Center (Phase K)
13. Implement Affiliate Commission Engine (Phase L)
```

### 54.3 After Every Implementation Session

```
1. Update system/development_log.md with changes made
2. Update task tracking files with new completion status
3. Commit all changes with descriptive message
4. Push to feature branch
```

### 54.4 Store Integration Feasibility

| Platform | API | Auth | Product Push | Order Tracking |
|---|---|---|---|---|
| Shopify | Admin GraphQL API | OAuth 2.0 (Shopify App) | ✅ Products API | ✅ Webhooks (orders/fulfilled) |
| TikTok Shop | Seller API v2 | OAuth 2.0 (Open API) | ✅ Product Upload | ✅ Order API |
| Amazon | SP-API | OAuth 2.0 (App registration) | ✅ Listings Items API | ✅ Orders + Shipping API |
| Printful | REST API | API Key | ✅ Products + Mockups | ✅ Webhooks (fulfillment) |
| Printify | REST API | API Key | ✅ Products + Catalog | ✅ Webhooks (fulfillment) |
| Gelato | REST API | API Key | ✅ Products + Prices | ✅ Webhooks (fulfillment) |

### 54.5 Post-Purchase Email Sequence (Via Resend)

| Step | Trigger | Content |
|---|---|---|
| 1. Order Confirmation | Order placed | Thank you, order details, estimated delivery |
| 2. Shipping Confirmation | Shipment created | Tracking number, clickable tracking link |
| 3. Delivery Update | In-transit milestone | Estimated delivery date update |
| 4. Delivery Confirmation | 24hrs after delivery | Confirmation, support contact |
| 5. Review Request | 3–5 days after delivery | Link to platform review page |

### 54.6 Client Marketing Channel Integrations (OAuth 2.0)

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

1. Gross margin below 40% (POD: below 30%)
2. Shipping cost exceeds 30% of retail price (POD exempt — partner ships direct)
3. Break-even timeline exceeds 2 months at realistic sales velocity
4. Product classified as fragile, hazardous, or requires special certification
5. No supplier found with USA delivery under 15 days (POD exempt — on-demand)
6. Cost of goods exceeds 40% of retail price
7. Estimated return rate exceeds 15%
8. Legal/IP risk detected (counterfeit, trademark)

### Risk Flags

- Fragile / high return rate → warning badge on product card
- Regulatory restrictions (cosmetics, supplements, electronics) → flag and guidance
- Counterfeit / IP risk → Claude Haiku checks against known brand patterns
- POD design IP risk → Check for trademark/copyright conflicts on design elements

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
| POD-Specific | Design recommendations, fulfillment partner selection, mockup suggestions |

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
| POD (global) | Printful API | REST API | Per-order |
| POD (multi-provider) | Printify API | REST API | Per-order |
| POD (32 countries) | Gelato API | REST API | Per-order |

### Required Fields Per Supplier

| Field | Required |
|---|---|
| Supplier name + URL | Yes |
| Country / Region | Yes |
| MOQ (minimum order quantity) | Yes (POD: N/A — on-demand) |
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
| Product Cards | All 8 tabs (including POD), swipeable cards, score gauges |
| Trend Feed | Live scrolling feed with pull-to-refresh |
| Influencer Profiles | Full profile with video preview |
| Launch Blueprint | Readable plan with share sheet export |
| Run Scan | Same manual control as web (including POD scan) |
| Client Allocation | Assign products from mobile |
| Notifications Centre | Alert history with deep links |
| Offline Mode | Last fetched data readable offline |
| Biometric Auth | Face ID / Touch ID / Fingerprint |
| Command Center | Quick view of YOUSELL store performance (admin only) |

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

- Every scan targets 50 products per platform (internal target) — including POD
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
- POD-specific: fulfillment partner cost comparison, per-unit margin by partner

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
| eBay Discovery Tab | Full eBay product discovery (9th channel) | eBay signals prove consistent |
| Auto Request Fulfilment | Claude Haiku auto-selects products for requests | Request volume exceeds manual review |
| AI Design Generator | Auto-generate POD designs from trending themes | POD channel matures |
| Affiliate Sub-Network | Build own sub-affiliate network for scale | 100+ clients |

---

## Appendix H — Document History and Version Control

| Version | Date | Changes |
|---|---|---|
| v4 | 2026-03 (early) | Initial comprehensive build brief |
| v5 | 2026-03 (mid) | Expanded architecture, added mobile app |
| v6 | 2026-03-12 | Definitive final with 24 sections, 37 tables |
| v7 | 2026-03-13 | Full reconciliation: Stripe, store integrations, content engine, order tracking, engine toggles, platform gating, corrected pricing, affiliate business model, QA audit (41 bugs), dual-platform separability, OAuth channels |
| **v8** | **2026-03-17** | **Merged all satellite documents. Added: POD Channel #8 (full integration), Admin Command Center (Best-Selling Products Dashboard), Affiliate Commission Engine (dual revenue tracking), 8 new BullMQ queues (23 total), 7 new database tables, 15 new API routes, POD fulfillment partner APIs (Printful/Printify/Gelato), expanded content strategy, competitive landscape analysis (POD + affiliate tiers), market research (80+ sources integrated), revenue multiplier projections ($124K/yr), fulfillment recommendation logic, updated development phases (J/K/L), 20-22 week timeline** |

---

## Appendix I — Source of Truth Index

**Current canonical documents (in precedence order):**

1. `docs/YouSell_Platform_Technical_Specification_v8.md` — THIS DOCUMENT — Master architecture
2. `CLAUDE.md` — Development rules and guardrails
3. `system/development_log.md` — Change history
4. `system/ai_logic.md` — Platform operational logic
5. `tasks/todo.md` — Task planning and progress
6. `tasks/execution_plan.md` — Implementation execution plan
7. `docs/content_publishing_shop_integration_strategy.md` — Content & shop integration strategy
8. `docs/USE_CASE_DIAGRAM.md` — Use case diagrams and data flows
9. `docs/MARKET_RESEARCH_LOG_SESSION3.md` — Market research (80+ sources)
10. `docs/RTM_v7.md` — Requirements traceability matrix
11. `docs/IMPROVEMENT_PLAN.md` — Feature improvement plan
12. `docs/competitive_analysis_tiers_7_8_niches.md` — Competitive landscape

**All other build briefs, QA prompts, audit reports, and operating manuals are SUPERSEDED by these canonical files.**

---

## Appendix J — Content Publishing Strategy (NEW v8)

Full strategy documented at `docs/content_publishing_shop_integration_strategy.md`.

### J.1 Content Engine Architecture

| Component | Purpose | Technology |
|---|---|---|
| Content Generator | AI-generated marketing content | Claude Haiku (bulk), Sonnet (premium) |
| Video Generator | Short-form product videos | Shotstack API (~$0.40/video) |
| Image Generator | Branded lifestyle images | Bannerbear API (~$0.10/image) |
| Content Scheduler | Queue and schedule posts | BullMQ content-queue + distribution-queue |
| Channel Connector | Multi-platform social publishing | Ayrshare (13+ platforms, single API) |
| Performance Tracker | Track engagement, clicks, conversions | Supabase tables + Ayrshare analytics |

### J.2 Content Types & Tools Matrix

| Content Type | AI Tool | Input | Output | Est. Cost |
|---|---|---|---|---|
| Social captions | Claude Haiku | Product data + platform rules | Platform-optimised text | ~$0.001/post |
| Ad copy | Claude Sonnet | Product data + audience targeting | Headlines, descriptions, CTAs | ~$0.01/post |
| Video scripts | Claude Sonnet | Product data + hook structure | 15-60sec script with shot list | ~$0.01/script |
| Short-form video | Shotstack API | Product images + script + music | 15-60sec MP4 | ~$0.40/video |
| Product images | Bannerbear API | Product photo + template | Branded lifestyle images | ~$0.10/image |
| Email sequences | Claude Haiku | Product data + sequence type | 3-5 email drip campaign | ~$0.005/sequence |
| Blog/SEO content | Claude Sonnet | Product data + keywords | 500-1500 word article | ~$0.02/article |
| Carousel posts | Bannerbear API | Product photos + copy | Multi-slide image set | ~$0.30/carousel |

### J.3 Content Templates

| Template | Platform | Structure | Best For |
|---|---|---|---|
| Problem → Solution | TikTok, Instagram Reels | Hook → Pain point → Product reveal → CTA | Impulse products |
| Unboxing Reveal | TikTok, YouTube Shorts | Package arrival → Unboxing → First impression → Link | Physical products |
| Before/After | Instagram, Pinterest | Side-by-side comparison → Transformation | Beauty, home, fitness |
| Listicle | Pinterest, Blog | "5 reasons you need..." → Numbered points | SEO, evergreen |
| Trend Hijack | TikTok | Current trend audio → Product tie-in | Viral moments |
| Comparison | YouTube, Blog | "Product X vs Y" → Feature breakdown | High-consideration |
| Testimonial Style | Facebook, Instagram | Customer quote → Product shot → CTA | Social proof |
| Deal Alert | All platforms | Urgency → Discount → Countdown → Link | Promotions |

### J.4 Platform-Specific Formatting Rules

| Platform | Max Length | Hashtags | Media | Special Rules |
|---|---|---|---|---|
| TikTok | 2200 chars | 3-5 trending | Video required (9:16) | Sound/music selection, disclosure label |
| Instagram Feed | 2200 chars | 20-30 | Image/carousel (1:1, 4:5) | First line is the hook |
| Instagram Reels | 2200 chars | 3-5 | Video (9:16) | Similar to TikTok |
| Facebook | 63,206 chars | 1-3 | Image/video/link | Longer form OK, link in post |
| Pinterest | 500 chars (desc) | 2-5 keyword tags | Image (2:3) | SEO-heavy titles |
| YouTube Shorts | 100 chars (title) | 3-5 | Video (9:16, <60s) | Strong title + first frame |
| LinkedIn | 3000 chars | 3-5 | Image/video/document | Professional tone |
| X/Twitter | 280 chars | 1-3 | Image/video | Concise, conversational |

### J.5 Publishing Modes

| Mode | Behaviour | Who Controls | Default |
|---|---|---|---|
| **Manual** | Content generated → sits in library → client clicks "Publish" per item | Client | YES (default) |
| **Scheduled** | Content generated → client sets date/time per batch → auto-publishes | Client | Available |
| **Smart Schedule** | System picks optimal posting times based on audience analytics → client approves | System suggests, client approves | Available |
| **Auto-Pilot** | Content auto-generated weekly → auto-scheduled → auto-published. Client receives weekly digest. | System (client can pause/override) | OFF — requires explicit opt-in |

### J.5A Platform-Specific Content Output Formats

| Platform | Content Output |
|---|---|
| TikTok | Video script + trending hashtags + hook line |
| Amazon | A+ listing copy + backend keywords + bullet points |
| Shopify | Product page copy + meta desc + SEO tags |
| Pinterest | Pin description + board suggestions + SEO keywords |
| Digital | Course/template description + benefit bullets |
| Affiliate | Review post + comparison table + CTA |
| POD | Mockup images + design story + lifestyle caption |

### J.6 Ayrshare Integration Details

- **Supported platforms (13+):** TikTok, Instagram, Facebook, YouTube, Pinterest, LinkedIn, X/Twitter, Reddit, Threads, Google Business Profile, Telegram, Snapchat, Bluesky
- **Architecture:** Per-client Ayrshare profiles (multi-tenant SaaS plan)
- **SDK:** Node.js SDK available
- **Per-client setup:** YouSell creates an Ayrshare profile for each client
- **Engagement tracking:** Daily engagement pull via Ayrshare analytics API
- **Auto-formatting:** Platform-specific formatting applied automatically

### J.7 Brand Voice Configuration (Feature #47)

Stored in `clients.settings` JSONB column. Used as system prompt context for all Claude content generation calls.

**Configuration fields:** Brand Name, Tone (Professional/Casual/Playful/Bold/Luxury/Educational), Target Audience, Emoji Style (None/Minimal/Moderate/Heavy), Key Phrases to Include, Phrases to Avoid, Sample Post.

### J.8 POD Content Templates

| Content Type | Template | AI Model | Output |
|---|---|---|---|
| Product Mockup Social Post | Lifestyle background + product overlay | Claude Haiku + Bannerbear | Instagram/Pinterest/TikTok ready images |
| Design Trend Alert | "This design is trending: [trend]" | Claude Haiku | Social post + email |
| POD Product Launch | Full product page copy + social announcement | Claude Sonnet | Multi-platform content package |
| Custom Merch Creator Brief | Personalized pitch for influencer custom merch | Claude Sonnet | Email + social DM script |
| Before/After Design | Design evolution showing customization options | Claude Haiku + Bannerbear | Carousel post |
| Print Quality Showcase | Close-up product quality shots with lifestyle context | Bannerbear | Instagram/Pinterest |

### J.9 POD Sub-Category Content Focus

| Sub-Category | Primary Platforms | Content Focus |
|---|---|---|
| Apparel (T-shirts, hoodies) | TikTok, Instagram, Shopify | Try-on videos, streetwear styling, seasonal collections |
| Home & Living (mugs, pillows) | Pinterest, Instagram, Shopify | Home decor inspiration, gift guides, seasonal themes |
| Accessories (phone cases, bags) | TikTok, Instagram | Unboxing, daily carry, accessory matching |
| Stationery (journals, stickers) | Pinterest, Etsy, Instagram | Journaling setup, planner spreads, sticker collections |
| Wall Art & Posters | Pinterest, Etsy, Shopify | Room makeover, art collection curation, gallery wall guides |

### J.10 Affiliate Content Factory

| Content Type | Frequency | AI Model |
|---|---|---|
| Tool comparison article | Weekly | Claude Sonnet |
| "Best tool for X" social post | 3x/week | Claude Haiku |
| Tutorial / walkthrough video script | 2x/week | Claude Haiku |
| Seasonal promotion roundup | Monthly | Claude Haiku |
| Case study / success story | Monthly | Claude Sonnet |

### J.11 Affiliate Platform Content Queue

| Platform | Priority | Content Focus | Commission Model |
|---|---|---|---|
| Shopify | P0 | Store setup guides, theme comparisons | 20% recurring lifetime |
| Spocket | P0 | Dropshipping tutorials, US/EU supplier comparisons | 20-30% lifetime recurring |
| Printful | P1 | POD startup guides, design tips | 10% for 12 months |
| Klaviyo | P1 | Email marketing for e-commerce | 10-20% recurring |
| Canva | P1 | Design tutorials, template showcases | 36% for 12 months |
| Stripe | P1 | Payment integration guides (passive) | $2,500/merchant |
| Omnisend | P2 | Email + SMS marketing comparisons | 20% for 24 months |
| Gelato | P2 | Global POD guides, eco-friendly printing | Up to $500/referral |
| ShipBob | P2 | 3PL transition guides for scaling sellers | 10% + $200 bonus |

---

## Appendix K — Market Research Summary (NEW v8)

This appendix summarises the market research documented in full at `docs/MARKET_RESEARCH_LOG_SESSION3.md` (80+ sources across 3 sessions).

### Research Coverage

| Area | Sources | Key Findings |
|---|---|---|
| Competitor SaaS tools | 15+ platforms | YouSell uniquely combines discovery + automation + store integration |
| TikTok Shop ecosystem | 10+ sources | Fastest-growing e-commerce channel, GMV data accessible via Apify |
| Amazon FBA landscape | 8+ sources | BSR data available via multiple free/paid APIs |
| POD market | 11 sources (Printful, Printify, Gelato, Etsy, Redbubble, etc.) | ~$37.9B market by 2030, 30–50% margins, zero inventory risk |
| Affiliate programs | 24+ programs researched | Spocket best deal (20-30% LIFETIME), Stripe/PayPal highest bounties ($2,500) |
| Influencer platforms | 8+ sources | Multiple free-tier platforms available (Ainfluencer, Modash, Influencers.club) |
| Content distribution | 5+ sources | Ayrshare or direct OAuth for multi-channel publishing |
| Pricing research | 10+ competitor analyses | $29-$299/mo per platform is the correct SaaS range |

### Key Strategic Insights

1. **POD is a ~$37.9B market by 2030** (currently ~$10.8–13B) growing at 23.6–26% CAGR — YOUSELL's intelligence layer provides unique differentiation
2. **Spocket offers 20-30% recurring for 15 months** — among the best affiliate deals in the ecosystem (⚠️ "lifetime" claim unverified; primary sources say 15 months)
3. **Stripe and PayPal offer $2,500 per merchant** — high-value one-time referrals
4. **Content automation is the anti-churn hook** — data alone has no retention value
5. **BullMQ is the right orchestration choice** — n8n adds cost without capability gain

### Digital Products Platform Economics

| Platform | Creator Gets | Best For |
|---|---|---|
| Gumroad | ~85–87% | Everything digital (10% + $0.50 platform fee + processing) |
| Etsy | ~87% | Printables, templates, planners (lower on cheap items; offsite ads extra) |
| Amazon KDP | 35–70% | eBooks, guides (70% only for $2.99–$9.99) |
| Shopify | ~96–97% | Own brand, full control |
| Whop | ~94% (3% platform fee) | Memberships, software, digital |
| Creative Market | 50% | Design assets (50/50 split) |

### POD Market Data

| Metric | Value |
|---|---|
| Global POD market (2025) | ~$10.8–13 billion (sources: Grand View Research, Precedence Research) |
| Projected market (2030) | ~$37.9B (Mordor Intelligence); ~$57.5B by 2033 (Grand View) |
| Projected CAGR | 23.6–26% through 2030 |
| Average margins | 30–50% depending on product type (⚠️ was 30–60%, corrected) |
| Startup cost | $0 (no inventory needed) |

### POD Platform Economics

| Platform | Product Range | Base Cost (T-shirt) | Selling Price | Margin |
|---|---|---|---|---|
| Printful | 600+ products | $7–14 | $25–35 | 30–50% |
| Printify | 1,300+ products | $6–15 | $22–40 | 40–50% |
| Gelato | 250+ products | $7–17 | $24–32 | 30–50% (Gelato+ gives up to 35% off base) |
| Gooten | 500+ products (200+ exclusive) | $6–13 | $23–30 | 30–50% |

**POD Affiliate Programs:**

| Partner | Commission | Duration | Type |
|---|---|---|---|
| Printful | 10% of order value | 12 months per referral | Recurring |
| Printify | 5% of order value | 12 months per referral | Recurring |
| Gelato | Varies by region (up to $500) | Per-order | One-time bounty |
| Gooten | Custom partnership | Negotiable | Custom |

**YOUSELL POD Strategy (6-Step Process):**
1. **Discovery:** Use Etsy/Redbubble/Amazon trending to find winning design niches
2. **Validation:** Cross-reference with TikTok/Pinterest trends for viral potential
3. **Creation:** AI-generated design concepts + Printful Mockup Generator API
4. **Distribution:** Push to client stores (Shopify/TikTok/Etsy) with POD fulfillment attached
5. **Fulfillment:** Zero inventory — POD partner handles manufacturing + shipping
6. **Margins:** 30–60% typical, higher than most dropship products

### POD Sub-Category Demand

| Sub-Category | Etsy Demand | Shopify Demand | TikTok Viral Potential | Best Margin |
|---|---|---|---|---|
| T-shirts & Hoodies | Very High | High | High | 40–60% |
| Mugs | Very High | Medium | Medium | 45–65% |
| Phone Cases | High | High | Very High | 35–55% |
| Tote Bags | High | Medium | Medium | 40–55% |
| Posters & Wall Art | Very High | High | High | 50–70% |
| Stickers | Very High | Low | Very High | 60–80% |
| Notebooks/Planners | High | Medium | Medium | 40–65% |

### Comprehensive Affiliate Program Database (60+ Programs)

Full database of researched affiliate programs across all categories relevant to YOUSELL clients.

**Tier 1 — High Commission (30%+):**

| Program | Commission | Cookie | Recurring | Category |
|---|---|---|---|---|
| Copy.ai | 45% first year | 30 days | First year | AI Content (⚠️ unverified 2026) |
| Spocket | 20–30% for 15 months | 30 days | Yes (15mo) | Dropshipping (⚠️ was "lifetime") |
| ManyChat | 30–50% tiered (12mo) | 120 days | Yes (12mo) | Marketing Automation |
| GetResponse | 40–60% tiered (12mo) | 90 days | Yes (12mo) | Email Marketing (relaunched Mar 2025) |
| Canva | Invite-only "Canvassador" | 30 days | Variable | Design (⚠️ no longer open signup) |
| Taskade | 30% recurring | 30 days | Yes | AI Productivity |
| Writesonic | 30% lifetime | 90 days | Yes | AI Content (⚠️ unverified 2026) |
| HubSpot | 30% recurring (1 year) | 180 days | Yes (1yr) | CRM/Marketing ✅ |
| ConvertKit/Kit | 30% recurring | 90 days | Yes | Email Marketing (rebranded to "Kit") |
| SpyFu | 40% recurring | — | Yes | SEO/Research |

**Tier 2 — Mid Commission (20–29%):**

| Program | Commission | Cookie | Recurring | Category |
|---|---|---|---|---|
| ~~Jasper AI~~ | ~~25–30%~~ | — | ❌ Ended Jan 2025 | AI Content (agency-only "Solutions Partner" now) |
| Pictory | 30% recurring | 90 days | Yes | AI Video |
| Surfer SEO | 25% recurring | Cookieless | Yes | SEO |
| Semrush | $200–450/sale + $10/trial | 120 days | No | SEO/Research (tiered by volume) |
| ElevenLabs | 22% (12mo) | 90 days | Yes (12mo) | AI Voice (11% for Business plans) |
| Frase.io | 25% recurring | 30 days | Yes | AI SEO |
| Zapier | 25% | 30 days | Yes | Automation |
| Otter.ai | 25% | 30 days | Yes | AI Transcription |
| InVideo AI | 25% | 30 days | Yes | AI Video |
| Scalenut | 25% | 30 days | Yes | AI Content |
| Anyword | 25% | 30 days | Yes | AI Copywriting |
| Visme | 25% recurring | 60 days | Yes | Design |
| Synthesia | 25% | 30 days | No | AI Video |
| Creatify AI | 25% + bonus | 30 days | Yes | AI Creative |
| Omnisend | 20% recurring (24 months) | 90 days | Yes (24mo) | Email Marketing |
| Shopify Partner | ~$150 one-time bounty | 30 days | No (⚠️ was 20% recurring) | E-Commerce |
| Zendrop | 20% recurring | 30 days | Yes | Dropshipping |
| DSers | 20% recurring | 30 days | Yes | Dropshipping |
| ActiveCampaign | 20–30% recurring | 90 days | Yes | Email Marketing |
| BigCommerce | 200% first payment | 90 days | No | E-Commerce |
| Ecwid/Lightspeed | 20% recurring | 30 days | Yes | E-Commerce (⚠️ Lightspeed acquisition; verify terms) |

**Tier 3 — Lower Commission / High-Value Bounties:**

| Program | Commission | Cookie | Type | Category |
|---|---|---|---|---|
| Stripe | $500–2,500 per merchant | — | One-time bounty (volume-dependent) | Payments (⚠️ not public; partner program only) |
| PayPal | $500–2,500 per merchant | — | One-time bounty (volume-dependent) | Payments (US/CA; based on 60-day volume) |
| Printful | 10% of sales (12 months) | 30 days | Recurring (12mo) | POD |
| Printify | 5% of sales (12 months) | 30 days | Recurring (12mo) | POD |
| Gelato | Up to $500 per referral | — | One-time bounty | POD |
| Klaviyo | 10–20% recurring | 30 days | Recurring | Email Marketing |
| ShipBob | 10% for 6 months + $200 bonus | — | Recurring (6mo) | Fulfillment |
| Wix | $100 per sale | 30 days | One-time bounty | Website Builder |
| Squarespace | Per referral | 45 days | One-time | Website Builder |
| Mailchimp | Variable | 30 days | Variable | Email Marketing |
| Square | Per referral | — | One-time | Payments |
| CJ Dropshipping | 3% of order value | — | Per-order | Dropshipping |
| Ahrefs | Per referral | 60 days | Variable | SEO |
| Crello/VistaCreate | Varies | 30 days | Variable | Design |

**Priority Rankings (Updated March 2026):**
1. **Long-duration recurring programs** (Spocket 15mo, Writesonic lifetime, Omnisend 24mo) — best compounding value
2. **High-value bounties** (Stripe/PayPal $500–2,500, Shopify ~$150, Wix $100) — immediate revenue
3. **Long cookie windows** (HubSpot 180d, ManyChat 120d, Semrush 120d) — higher conversion probability
4. **Note on Omnisend:** 24-month duration is a significant advantage over Klaviyo's partner-only model for the same use case (email marketing)
5. **⚠️ Programs requiring re-verification:** Copy.ai, Writesonic, Omnisend, Ecwid/Lightspeed, ConvertKit/Kit, Pictory, BigCommerce — could not independently verify current 2026 terms

### Competitor Pricing Comparison

*⚠️ All prices below are ANNUAL billing rates unless noted. Monthly prices are 30–50% higher. Verified March 2026.*

| Platform | Tier 1 (annual) | Tier 2 (annual) | Tier 3 (annual) | Tier 4 | Monthly Tier 1 |
|---|---|---|---|---|---|
| Sell The Trend | $19.97 | $32.97 | $66.64 | ~$199.98 | $29.97/mo |
| AutoDS | ~$26.90 | $29.90–$39.90 | $49.90–$119 | — | ~$26.90/mo |
| Jungle Scout | $29 | $49 | $129 | Cobalt (custom) | $49/mo |
| Helium 10 | Free | $99 | $279 | $1,499/mo | $129/mo |
| Kalodata | Free trial (7d) | ~$41.58 | ~$91.58 | Enterprise | $49.99/mo |
| Minea | $34 | $69 | $299 | — | $49/mo |
| FastMoss | — | $59/mo | $109/mo | $399/mo (Team) | $59/mo |

---

## Appendix L — Competitive Analysis Summary (NEW v8)

Full analysis documented at `docs/competitive_analysis_tiers_7_8_niches.md`.

### L.1 YOUSELL Competitive Advantages

1. **Multi-platform intelligence** — No single tool covers TikTok + Amazon + Shopify + Pinterest + influencer matching
2. **Three-pillar scoring** directly addresses "trending vs. profitable" gap
3. **AI content generation bundled with intelligence** — Most tools are either discovery OR content
4. **Supplier matching integrated with product discovery** — Currently separate workflows
5. **POD as Channel #8** — Zero-inventory selling with 30-60% margins
6. **Admin Command Center** — One-click product push to multiple platforms
7. **Affiliate Commission Engine** — Multi-layer passive income from every client

### L.2 Key Competitive Gaps to Address

| Gap | Competitor Benchmark | YOUSELL Action |
|---|---|---|
| Real-time data refresh | Kalodata 15-minute | Target sub-30-minute |
| Influencer ROI prediction | GRIN Predictive ROI | Add historical performance scoring |
| Ad creative intelligence | BigSpy, Minea | Include ad creative analysis in scans |
| Pinterest signals | Largely ignored | Add Pinterest trend/pin data to scoring |
| Free tier | Most tools offer free | Launch meaningful free tier |
| Own affiliate program | 30% recurring average | Launch 25-30% recurring program |

### L.3 TikTok-Specific Competitors

| Tool | Pricing | Data Refresh | Key Insight |
|---|---|---|---|
| **Kalodata** | $45.90-$109.99/mo | 15-minute cycle | Most widely used TikTok tool, gold standard for real-time |
| **FastMoss** | $59–$109/mo (Team $399) | Daily | 3.2M+ users, 220–250M+ creator database (⚠️ was 180M+), 6K influencer contacts/day export |

### L.4 Influencer Marketing Landscape

Market projected to reach **$28–33 billion in 2026** (⚠️ was $24B, which is the 2024 estimate).

| Platform | Focus | Key Differentiator |
|---|---|---|
| GRIN | DTC/Shopify | Predictive ROI Engine |
| Aspire | Enterprise | 40% more efficient CPM |
| Upfluence | E-commerce | Identify existing customers as influencers |
| CreatorIQ | Enterprise global | 20M+ profiles, AI discovery |
| Modash | Scale discovery | 350–380M+ profiles (⚠️ was 400M+), AI fraud detection |

### L.5 Pricing Positioning

| Tier | Target | Price Range | Comparables |
|---|---|---|---|
| **Free** | Individual explorers | $0 | SellerCenter, Pinterest Trends |
| **Starter** | Solo sellers | $29-$49/mo | SmartScout ($25), Helium 10 ($29) |
| **Professional** | Growing businesses | $79-$129/mo | Kalodata Pro ($110), FastMoss Pro ($109) |
| **Agency/Enterprise** | Agencies, multi-store | $249-$499/mo | CreatorIQ, GRIN |

---

## Appendix M — RTM Compliance Summary (NEW v8)

Full traceability matrix documented at `docs/RTM_v7.md`.

### M.1 Overall Compliance

**v7 Compliance: 62% complete** (61 of 89 requirements fully done, 12 partial, 16 missing)

### M.2 Top 10 Critical Gaps (Ordered by Severity)

1. **CRITICAL:** Per-platform subscription enforcement + Stripe integration
2. **CRITICAL:** Store integration OAuth (Shopify/TikTok/Amazon product push)
3. **CRITICAL:** Client opportunity feed with locked platform teasers + upsell CTAs
4. **HIGH:** Content creation + distribution worker pipeline
5. **HIGH:** AI Affiliate dynamic discovery (currently 10 programs hardcoded)
6. **HIGH:** Physical Affiliate live data sources (hardcoded 5 programs)
7. **HIGH:** Pre-viral signals (only 2 of 6 functional)
8. **HIGH:** Cross-platform intelligence automation
9. **HIGH:** Marketing channel OAuth
10. **HIGH:** Order tracking webhooks + email sequences

### M.3 Data Source Module Status

| Module | Status | Detail |
|---|---|---|
| TikTok | Partial | Apify ✅, ScrapeCreators ❌, Creative Center ⚠️, Research API ❌ |
| Amazon | Partial | RapidAPI ✅, Apify BSR ✅, PA-API ❌ |
| Shopify | Partial | Apify Scraper ✅ |
| Pinterest | Partial | Apify ✅, Pinterest API ⚠️ (fallback only) |
| Digital Products | 1 of 6 | Gumroad ✅; ClickBank, ShareASale, Udemy, AppSumo ❌ |
| AI Affiliate | Seeded only | Hardcoded; no live discovery |
| Physical Affiliate | Seeded only | Hardcoded; no live discovery |

---

**END OF YOUSELL PLATFORM TECHNICAL SPECIFICATION v8.0**

*This document is the single authoritative architecture reference for the YouSell Platform. It supersedes v7 and all prior build briefs. All development, continuity recovery, and architectural decisions should reference this document first.*
