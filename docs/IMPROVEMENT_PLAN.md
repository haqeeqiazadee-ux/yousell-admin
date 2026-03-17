# YOUSELL Platform — Improvement Plan

**Generated:** 2026-03-16
**Source:** RTM v7 audit + competitive research across 23 platforms + 7 niche deep-dives
**Methodology:** Every recommendation cites the competitor/research that inspired it

---

## Category A — Critical Gaps (Must Fix for Launch)

These are table-stakes features that competitors have and YOUSELL needs before charging money.

### A.1 — Stripe Subscription Billing (P0)

| Field | Detail |
|-------|--------|
| **Feature** | Full Stripe integration: Checkout, webhooks, subscription management, Customer Portal |
| **Inspired by** | ALL competitors charge via subscriptions. AutoDS ($26.90-$66.90), Sell The Trend ($39.97-$99.97), Jungle Scout ($29-$199) |
| **Channels** | All 8 |
| **Complexity** | L |
| **Revenue Impact** | CRITICAL — blocks ALL revenue |
| **Priority** | P0 |
| **Affected Files** | api/webhooks/stripe, api/dashboard/subscription, lib/stripe |
| **New Tables** | client_subscriptions, client_platform_access, client_usage, client_addons |

### A.2 — Platform Gating + Upsell UI (P0)

| Field | Detail |
|-------|--------|
| **Feature** | Per-platform access control with locked platform teasers showing aggregate stats, blurred cards, and upgrade CTAs |
| **Inspired by** | Sell The Trend (1-store vs 3-store gating), Helium 10 (feature gating per tier), Minea ($49/platform) |
| **Channels** | All 8 |
| **Complexity** | L |
| **Revenue Impact** | HIGH — drives upgrades |
| **Priority** | P0 |
| **Affected Files** | api/dashboard/engines, components/engine-gate, dashboard pages |
| **New Tables** | client_engine_config, platform_config |

### A.3 — Admin Layout Role Check (P0)

| Field | Detail |
|-------|--------|
| **Feature** | Fix BUG-001: admin layout renders for ANY authenticated user |
| **Inspired by** | Security baseline — all competitors gate admin access |
| **Channels** | N/A (security) |
| **Complexity** | S |
| **Revenue Impact** | N/A (security) |
| **Priority** | P0 |
| **Affected Files** | src/app/admin/layout.tsx |

### A.4 — Client Dashboard requireClient() Middleware (P0)

| Field | Detail |
|-------|--------|
| **Feature** | Enforce client-scoped access on all dashboard API routes |
| **Inspired by** | Security baseline |
| **Channels** | N/A (security) |
| **Complexity** | S |
| **Revenue Impact** | N/A (security) |
| **Priority** | P0 |
| **Affected Files** | api/dashboard/* routes |

---

## Category B — Competitive Differentiation (YOUSELL's Unfair Advantage)

Features that set YOUSELL apart. Multi-channel (8 channels), model-agnostic, AI-first.

### B.1 — 8-Channel Intelligence Dashboard (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Unified view showing opportunities across all 8 channels simultaneously with cross-platform detection |
| **Inspired by** | NO competitor covers all 8 channels. Sell The Trend = 2, Jungle Scout = 1, Kalodata = 1 |
| **Channels** | All 8 |
| **Complexity** | M |
| **Revenue Impact** | HIGH — key differentiator |
| **Priority** | P1 |
| **Affected Files** | engines/opportunity-feed.ts, admin dashboard |

### B.2 — Cross-Platform Product Intelligence (P1)

| Field | Detail |
|-------|--------|
| **Feature** | When a product is detected on one platform, automatically check for presence on all others. Show multi-platform opportunity map. |
| **Inspired by** | RTM Gap #61. No competitor does this. Jungle Scout is Amazon-only, Kalodata is TikTok-only. |
| **Channels** | All 8 |
| **Complexity** | L |
| **Revenue Impact** | HIGH — unique feature |
| **Priority** | P1 |
| **Affected Files** | engines/clustering.ts, engines/discovery.ts |

### B.3 — AI-Powered Launch Blueprints (Already Built — Enhance) (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Enhance existing blueprints with channel-specific launch strategies, competitor analysis, and financial projections |
| **Inspired by** | Copy.ai GTM Playbooks, Sell The Trend store builder. No competitor generates full launch plans. |
| **Channels** | All 8 |
| **Complexity** | M |
| **Revenue Impact** | HIGH — premium feature |
| **Priority** | P1 |
| **Affected Files** | api/admin/blueprints |

### B.4 — Pinterest → Google Trends Prediction (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Detect Pinterest trends 2-6 weeks before they appear on Google Trends. Flag as early signal. |
| **Inspired by** | v7 Spec Section 8.4 key insight. Exploding Topics trend detection approach. |
| **Channels** | Pinterest Commerce |
| **Complexity** | M |
| **Revenue Impact** | MEDIUM — unique intelligence |
| **Priority** | P2 |
| **Affected Files** | engines/trend-detection.ts, providers/pinterest |

### B.5 — Complete Pre-Viral Detection (6 Signals) (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Implement all 6 pre-viral signals. Currently only 2 of 6 are functional. |
| **Inspired by** | Exploding Topics detects trends before peak. YOUSELL should detect PRODUCTS before peak. RTM Gap #23. |
| **Channels** | TikTok Shop primarily, all channels for signals 4-6 |
| **Complexity** | L |
| **Revenue Impact** | HIGH — core value prop |
| **Priority** | P1 |
| **Affected Files** | engines/tiktok-discovery.ts, engines/trend-detection.ts |
| **Missing signals** | Comment Purchase Intent NLP, Creator Niche Expansion, Supply-Side Response, proper thresholds for Micro-Influencer Convergence |

---

## Category C — Content Creation & Marketing Engine

Based on research of Jasper, Copy.ai, Predis.ai, Buffer, Canva.

### C.1 — Content Generation Engine (P1)

| Field | Detail |
|-------|--------|
| **Feature** | AI content generation with 10+ templates: social post, ad copy, email, video script, product description, blog post, influencer brief, launch announcement, seasonal promo, comparison post |
| **Inspired by** | Jasper (50+ templates), Copy.ai (workflows), Predis.ai (visual + text) |
| **Channels** | All 8 (each channel gets platform-specific content formats) |
| **Complexity** | L |
| **Revenue Impact** | HIGH — anti-churn feature |
| **Priority** | P1 |
| **Affected Files** | New: backend/src/jobs/content-generate.ts, content templates |
| **Per-Channel Outputs** | TikTok: video scripts + hashtag strategy. Amazon: listing copy + A+ content. Shopify: product page + meta description. Pinterest: pin description + board SEO. Digital: course/template description + affiliate copy. AI Affiliate: review posts + comparison content. Physical Affiliate: unboxing scripts + review content. |

### C.2 — Content Distribution Pipeline (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Auto-post generated content to connected social channels. Schedule, publish, track engagement. |
| **Inspired by** | Predis.ai (auto-posting), Buffer/Hootsuite (scheduling), Sell The Trend (no content tools = opportunity) |
| **Channels** | All 8 (distribution to TikTok, Instagram, Facebook, Pinterest, YouTube, Twitter, LinkedIn) |
| **Complexity** | XL |
| **Revenue Impact** | HIGH — anti-churn, automation paywall |
| **Priority** | P1 |
| **Affected Files** | New: backend/src/jobs/content-distribute.ts, api/dashboard/channels |
| **New Tables** | content_queue (exists in schema), client_channels |

### C.3 — Brand Voice Configuration (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Per-client brand voice settings (tone, style, audience persona) applied to all generated content |
| **Inspired by** | Jasper Brand Voice, Copy.ai Infobase |
| **Channels** | All 8 |
| **Complexity** | S |
| **Revenue Impact** | MEDIUM — premium feature |
| **Priority** | P2 |
| **Affected Files** | clients table (add brand_voice JSONB column) |

### C.4 — Content Calendar View (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Visual calendar showing scheduled content across all channels |
| **Inspired by** | Predis.ai content calendar, Buffer scheduling view |
| **Channels** | All 8 |
| **Complexity** | M |
| **Revenue Impact** | MEDIUM — UX improvement |
| **Priority** | P2 |
| **Affected Files** | New: dashboard/content/calendar page |

---

## Category D — Revenue Optimization

### D.1 — Competitive Pricing Structure (P0)

| Field | Detail |
|-------|--------|
| **Feature** | Per-platform pricing tiers aligned with market |
| **Competitor Pricing** | Sell The Trend: $39.97-$99.97. AutoDS: $26.90-$66.90. Jungle Scout: $29-$199. Helium 10: $29-$229. Minea: $49-$399. Kalodata: $16-$99. |
| **Recommended YOUSELL Pricing** | Explorer: $29/mo/platform (data + basic scoring). Seller: $59/mo/platform (+ store integration + content). Professional: $99/mo/platform (+ influencer + supplier + full automation). Enterprise: $199/mo (all platforms, all engines, API access, team seats). Multi-platform discount: 20% off second platform, 30% off third+. |
| **Revenue Impact** | HIGH |
| **Priority** | P0 |

### D.2 — Add-On Revenue Streams (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Per-use charges for expensive operations |
| **Inspired by** | Helium 10 (keyword tracker credits), Jasper (word limits), AutoDS (product import limits) |
| **Add-Ons** | Extra Sonnet insights ($2/each), Additional scan credits, Content generation credits above monthly limit, Priority support, White-label reports |
| **Revenue Impact** | MEDIUM |
| **Priority** | P2 |

### D.3 — Free Tier / Freemium (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Free tier showing impressive data but locking automation |
| **Inspired by** | Ecomhunt (free delayed access), Helium 10 (free limited tools), Canva (generous free tier) |
| **Offering** | See all products + scores (read-only), 1 platform, no automation, no store integration, limited to 5 products/week, email digest of HOT products |
| **Revenue Impact** | HIGH — top-of-funnel growth |
| **Priority** | P1 |

---

## Category E — Technical Debt

### E.1 — CSRF Protection (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Add CSRF tokens to all POST endpoints |
| **Source** | RTM Section W, v7 Section 48.3 |
| **Complexity** | M |
| **Priority** | P1 |

### E.2 — Input Validation Whitelisting (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Whitelist allowed fields on all POST/PUT operations |
| **Source** | RTM Section Q, v7 Section 37.1 |
| **Complexity** | M |
| **Priority** | P1 |

### E.3 — Dead Letter Queue (P2)

| Field | Detail |
|-------|--------|
| **Feature** | BullMQ dead letter queue for permanently failed jobs |
| **Source** | RTM Section C.2, BUG-052 |
| **Complexity** | S |
| **Priority** | P2 |

### E.4 — Unit Test Coverage (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Jest tests for all engines, providers, API routes |
| **Source** | RTM Section AC — only scoring has tests, 6 engines untested |
| **Complexity** | L |
| **Priority** | P1 |
| **Target** | 70%+ code coverage on scoring, engines, providers |

### E.5 — Trend Lifecycle Threshold Alignment (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Fix semantic inversion: implementation maps lifecycle stages differently than v7 spec |
| **Source** | RTM Section G |
| **Complexity** | S |
| **Priority** | P1 |

### E.6 — AI Affiliate Database Update (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Update seeded AI affiliate programs to match v7 spec list and add newly discovered programs |
| **Source** | RTM Section B.6, Research Entry #29 |
| **Programs to Add** | Copy.ai (45% first year!), Pictory, Synthesia, Writesonic, GetResponse, HubSpot, ManyChat, Creatify AI, Semrush, Descript, Runway ML, HeyGen |
| **Complexity** | S |
| **Priority** | P1 |

---

## Category F — Growth Features

### F.1 — Onboarding Flow (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Guided setup: choose platforms → connect store → first scan → see results |
| **Inspired by** | AutoDS (step-by-step onboarding), Sell The Trend (quick start wizard) |
| **Complexity** | M |
| **Revenue Impact** | HIGH — reduces churn in first 7 days |
| **Priority** | P1 |

### F.2 — Weekly Email Digest (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Weekly email to clients showing HOT products found, content published, revenue estimates |
| **Inspired by** | v7 Spec Section 36.1, Exploding Topics weekly email |
| **Complexity** | M |
| **Revenue Impact** | MEDIUM — engagement + upsell |
| **Priority** | P2 |

### F.3 — API Access (P3)

| Field | Detail |
|-------|--------|
| **Feature** | REST API for Enterprise clients to access product data programmatically |
| **Inspired by** | Helium 10 API, Exploding Topics Enterprise, Minea Business ($399/mo with API) |
| **Complexity** | M |
| **Revenue Impact** | MEDIUM — enterprise tier |
| **Priority** | P3 |

### F.4 — Referral Program (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Refer-a-friend program with subscription credit |
| **Inspired by** | Standard SaaS growth lever |
| **Complexity** | M |
| **Revenue Impact** | MEDIUM — organic growth |
| **Priority** | P2 |

---

## Category G — Supplier & Fulfillment Pipeline

### G.1 — Store Integration OAuth (P0)

| Field | Detail |
|-------|--------|
| **Feature** | OAuth connections for Shopify, TikTok Shop, Amazon Seller Central. Push products to client stores. |
| **Inspired by** | AutoDS (auto-import products), Sell The Trend (1-click to store), Spocket (Shopify integration) |
| **Channels** | TikTok Shop, Amazon FBA, Shopify DTC |
| **Complexity** | XL |
| **Revenue Impact** | HIGH — key differentiator |
| **Priority** | P0 |
| **New Tables** | client_channels |
| **New API Routes** | /api/dashboard/channels/connect, /api/dashboard/channels, /api/webhooks/shopify, /api/webhooks/tiktok |

### G.2 — Order Tracking + Email Sequences (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Receive order webhooks from connected stores, send 5-step email sequence via Resend |
| **Inspired by** | AutoDS (automated order tracking), AfterShip (order tracking emails) |
| **Channels** | TikTok Shop, Amazon FBA, Shopify DTC |
| **Complexity** | L |
| **Revenue Impact** | MEDIUM — lifecycle completion |
| **Priority** | P1 |
| **New Tables** | client_orders |
| **Email Sequence** | 1. Order confirmed 2. Shipped + tracking 3. Out for delivery 4. Delivered + review request 5. Reorder/upsell |

### G.3 — Price/Stock Monitoring (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Monitor price and stock levels for products in client stores, auto-adjust pricing |
| **Inspired by** | AutoDS (price/stock monitoring is their #1 feature) |
| **Channels** | TikTok Shop, Amazon FBA, Shopify DTC |
| **Complexity** | L |
| **Revenue Impact** | MEDIUM |
| **Priority** | P2 |

### G.4 — Domestic Supplier Priority (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Add US/EU supplier sources: Faire.com, Spocket, CJ US warehouses |
| **Inspired by** | TopDawg (US-only suppliers), Spocket (US/EU), Research Entry #28 |
| **Channels** | Shopify DTC, Amazon FBA |
| **Complexity** | M |
| **Revenue Impact** | MEDIUM |
| **Priority** | P2 |

---

## Category H — Channel-Specific Improvements

### H.1 — TikTok Shop Improvements

| # | Feature | Inspired By | Complexity | Priority |
|---|---------|-------------|------------|----------|
| 1 | ScrapeCreators API integration (100 free req) | v7 Spec Section 8.1 | S | P1 |
| 2 | TikTok Creative Center direct scraping | Kalodata deep TikTok data | M | P2 |
| 3 | Creator earnings data per product | FastMoss creator analytics | M | P2 |
| 4 | Live analytics (real-time TikTok monitoring) | Kalodata live feature | L | P3 |
| 5 | Comment Purchase Intent NLP (Claude Haiku) | v7 Spec Section 24.2 | M | P1 |

### H.2 — Amazon FBA Improvements

| # | Feature | Inspired By | Complexity | Priority |
|---|---------|-------------|------------|----------|
| 1 | Amazon keyword research (search volume + PPC) | Jungle Scout Keyword Scout, Helium 10 Cerebro | L | P2 |
| 2 | BSR time-series tracking with sparklines | Jungle Scout Product Tracker | M | P2 |
| 3 | FBA fee calculator in financial model | Helium 10 Profitability Calculator | S | P1 |
| 4 | Private label launch brief in blueprints | Jungle Scout listing builder | M | P2 |
| 5 | Review velocity tracking | Jungle Scout review automation | S | P2 |

### H.3 — Shopify DTC Improvements

| # | Feature | Inspired By | Complexity | Priority |
|---|---------|-------------|------------|----------|
| 1 | Competitor store revenue estimation | Niche Scraper store analysis, Dropship.io sales tracker | M | P1 |
| 2 | Top-selling products per competitor store | Sell The Trend Shop Intelligence | M | P2 |
| 3 | Meta + Google ad creative analysis per product | Minea multi-platform ad spy | M | P2 |
| 4 | Shopify App integration (embedded analytics) | Shopify App ecosystem research | L | P3 |

### H.4 — Pinterest Commerce Improvements

| # | Feature | Inspired By | Complexity | Priority |
|---|---------|-------------|------------|----------|
| 1 | Pinterest → Google Trends prediction | v7 Spec Section 8.4 key insight | M | P2 |
| 2 | Pin saves velocity tracking | Pinterest API for Advertisers | M | P2 |
| 3 | Pinterest ad intelligence | Minea (covers Pinterest ads) | M | P2 |
| 4 | Visual product matching via AI | Pinterest visual search concept | L | P3 |

### H.5 — Digital Products Improvements

| # | Feature | Inspired By | Complexity | Priority |
|---|---------|-------------|------------|----------|
| 1 | Etsy digital products scraper | v7 Spec Section 8.5 | M | P1 |
| 2 | ClickBank marketplace integration | v7 Spec Section 8.5 | M | P2 |
| 3 | Udemy course tracking | v7 Spec Section 8.5 | M | P2 |
| 4 | AI prompts as product category | Research Entry #30 | S | P2 |
| 5 | Creative Market / Envato integration | Research Entry #30 | M | P3 |

### H.6 — AI Affiliate Programs Improvements

| # | Feature | Inspired By | Complexity | Priority |
|---|---------|-------------|------------|----------|
| 1 | Dynamic discovery via PartnerStack API | v7 Spec Section 8.6 | M | P1 |
| 2 | Product Hunt API for new AI tool launches | v7 Spec Section 8.6 | M | P2 |
| 3 | Commission rate history tracking | Research Entry #29 | S | P1 |
| 4 | Affiliate link detection in ads | AdSpy affiliate detection feature | M | P2 |
| 5 | Automated promotional content per program | Content Engine integration | M | P2 |

### H.7 — Physical Affiliate Improvements

| # | Feature | Inspired By | Complexity | Priority |
|---|---------|-------------|------------|----------|
| 1 | TikTok Shop Affiliate Centre scraping | v7 Spec Section 8.7 | M | P1 |
| 2 | Amazon Associates product search integration | v7 Spec Section 8.7 | M | P2 |
| 3 | Commission tracking per affiliate product | AutoDS order tracking model | M | P2 |
| 4 | Influencer × affiliate matching | Creator Matching Engine extension | M | P2 |

---

## New Category I — Print-on-Demand (POD) Channel #8

### I.1 — POD Product Discovery (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Trending designs, niches, aesthetics discovery across Etsy, Redbubble, Merch by Amazon, TikTok for POD products |
| **Inspired by** | Printful marketplace trends, Etsy trending, Merch by Amazon niche research |
| **Channels** | POD (Channel #8) |
| **Complexity** | L |
| **Revenue Impact** | HIGH — new product category |
| **Priority** | P1 |
| **Sub-Categories** | Apparel (T-shirts, hoodies, streetwear), Home & Living (mugs, pillows, wall art), Accessories (phone cases, tote bags, hats), Stationery (journals, notebooks, stickers), Wall Art & Posters (canvas prints, framed prints) |

### I.2 — POD Supplier Integration (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Direct API connections to POD fulfillment partners: Printful, Printify, Gelato |
| **Inspired by** | Printful API, Printify API, Gelato API |
| **Channels** | POD (Channel #8) |
| **Complexity** | L |
| **Revenue Impact** | HIGH — enables zero-inventory selling |
| **Priority** | P1 |
| **New Tables** | pod_suppliers, pod_products, pod_designs |

### I.3 — POD Store Provisioning (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Auto-create products in client Shopify/TikTok stores with POD fulfillment attached |
| **Inspired by** | Printful Shopify integration, Printify store sync |
| **Channels** | POD (Channel #8) |
| **Complexity** | M |
| **Revenue Impact** | HIGH — one-click store setup |
| **Priority** | P1 |

### I.4 — POD Content Engine (P2)
| Field | Detail |
|-------|--------|
| **Feature** | AI-generated mockups, social posts featuring products on lifestyle backgrounds |
| **Inspired by** | Printful mockup generator, Placeit by Envato |
| **Channels** | POD (Channel #8) |
| **Complexity** | M |
| **Revenue Impact** | MEDIUM — content differentiation |
| **Priority** | P2 |

### I.5 — POD Influencer Matching (P2)
| Field | Detail |
|-------|--------|
| **Feature** | Niche-specific creators for custom merch, fan merchandise, lifestyle products |
| **Inspired by** | Creator merch platforms (Spring, Teespring), custom merch trends on TikTok |
| **Channels** | POD (Channel #8) |
| **Complexity** | M |
| **Revenue Impact** | MEDIUM — creator economy integration |
| **Priority** | P2 |

---

## New Category J — Admin Intelligence Dashboard (Command Center)

### J.1 — Best-Selling Products Dashboard (P0)
| Field | Detail |
|-------|--------|
| **Feature** | Admin command center showing top-scoring products with one-click platform publishing buttons |
| **Inspired by** | BigCommerce Channel Manager, AutoDS product import. This is YOUR intelligence platform for YOUR shops. |
| **Channels** | All 8 |
| **Complexity** | L |
| **Revenue Impact** | CRITICAL — profit-maximizing command center |
| **Priority** | P0 |
| **UI Elements** | Per-product action buttons: Push to TikTok Shop, Push to Amazon, Push to Shopify, Push to All. Per-product automation: Launch Marketing, Influencer Outreach, Generate Content, Financial Model |

### J.2 — Per-Platform Pipeline View (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Pipeline view showing live products per platform with weekly revenue: TikTok (12 live, $4.2K/wk), Amazon (8 live, $6.1K/wk), Shopify (15 live, $3.8K/wk) |
| **Inspired by** | Shopify admin, BigCommerce multi-channel dashboard |
| **Channels** | All 8 |
| **Complexity** | M |
| **Revenue Impact** | HIGH — operational visibility |
| **Priority** | P1 |

### J.3 — One-Click Product Push (P0)
| Field | Detail |
|-------|--------|
| **Feature** | OAuth-authenticated product listing creation via platform API. Push to [Platform] triggers BullMQ job for product creation. Push to All triggers parallel listing across all connected stores. |
| **Inspired by** | AutoDS 1-click import, Sell The Trend store push |
| **Channels** | Shopify, TikTok Shop, Amazon |
| **Complexity** | L |
| **Revenue Impact** | CRITICAL — core automation |
| **Priority** | P0 |
| **BullMQ Actions** | push-to-shopify, push-to-tiktok, push-to-amazon, push-to-all |

### J.4 — One-Click Marketing Launch (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Per-product buttons: Launch Marketing (generates ad copy + campaign blueprint), Influencer Outreach (matches top creators, generates personalized emails via Resend), Generate Content (AI creates social posts, product descriptions, video scripts), Financial Model (full unit economics + ROI projection) |
| **Inspired by** | No competitor has this — unique to YOUSELL |
| **Channels** | All 8 |
| **Complexity** | L |
| **Revenue Impact** | HIGH — end-to-end automation |
| **Priority** | P1 |

---

## New Category K — Affiliate Commission Engine

### K.1 — Affiliate Revenue Tracker (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Track all affiliate referrals showing which clients were referred to which platforms and cumulative commission earned. Two stat sets: (1) Affiliate revenue from own content generation system, (2) Affiliate commission from every platform used in client service |
| **Inspired by** | PartnerStack dashboard, Impact.com reporting |
| **Channels** | All 8 |
| **Complexity** | L |
| **Revenue Impact** | HIGH — passive income tracking |
| **Priority** | P1 |
| **New Tables** | affiliate_referrals, affiliate_commissions, affiliate_content_links |

### K.2 — E-Commerce Platform Affiliates (P0)
| Field | Detail |
|-------|--------|
| **Feature** | Shopify Partner Program (20% recurring lifetime), Wix ($100/sale), Squarespace ($100-200/sale), Ecwid (20% lifetime recurring) |
| **Inspired by** | Shopify Partner Program, every client store = recurring income |
| **Channels** | Shopify DTC, all store platforms |
| **Complexity** | S |
| **Revenue Impact** | CRITICAL — compounding passive income |
| **Priority** | P0 |

### K.3 — POD Platform Affiliates (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Printful (10% for 12 months + $25 per Growth subscription), Printify (5% for 12 months), Gelato (up to $500/referral), Gooten (custom terms) |
| **Inspired by** | Printful affiliate program, Printify partner program |
| **Channels** | POD (Channel #8) |
| **Complexity** | S |
| **Revenue Impact** | HIGH — scales with POD clients |
| **Priority** | P1 |

### K.4 — Marketing Tool Affiliates (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Klaviyo (10-20% recurring, 90d cookie), Omnisend (20% recurring 24 months), Canva (36% recurring 12 months), Mailchimp (varies) |
| **Inspired by** | Klaviyo partner program, Canva affiliate program |
| **Channels** | All 8 |
| **Complexity** | S |
| **Revenue Impact** | HIGH — recommend to every client |
| **Priority** | P1 |

### K.5 — Payment & Infrastructure Affiliates (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Stripe ($2,500/merchant one-time), PayPal ($2,500/merchant one-time) — already in stack, free money per store provisioned |
| **Inspired by** | Stripe Partner Ecosystem, PayPal referral program |
| **Channels** | All 8 |
| **Complexity** | S |
| **Revenue Impact** | HIGH — $2,500 per client |
| **Priority** | P1 |

### K.6 — Dropshipping & Fulfillment Affiliates (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Spocket (20-30% LIFETIME recurring — best deal found), Zendrop (20-30% recurring), DSers ($1.50/conversion), ShipBob (10% for 6 months + $200 bonus) |
| **Inspired by** | Spocket lifetime recurring program |
| **Channels** | All 8 |
| **Complexity** | S |
| **Revenue Impact** | HIGH — Spocket lifetime recurring is the standout |
| **Priority** | P1 |

### K.7 — Analytics Tool Affiliates (P2)
| Field | Detail |
|-------|--------|
| **Feature** | Jungle Scout (up to $150/sale), Helium 10 (25% recurring or $250 one-time), SEMrush ($10/trial) |
| **Inspired by** | Jungle Scout affiliate program |
| **Channels** | All 8 |
| **Complexity** | S |
| **Revenue Impact** | MEDIUM |
| **Priority** | P2 |

### K.8 — Affiliate Content Factory (P1)
| Field | Detail |
|-------|--------|
| **Feature** | Non-stop AI content generation for all affiliate platforms — reviews, comparisons, tutorials, sign-up guides. Limited to admin dashboard only. Content published via admin's own channels to drive affiliate sign-ups. |
| **Inspired by** | AI content marketing automation, passive income content strategies |
| **Channels** | All 8 |
| **Complexity** | M |
| **Revenue Impact** | HIGH — automated passive income generation |
| **Priority** | P1 |

### Revenue Multiplier Estimate (50 clients Year 1)
| Revenue Stream | Calculation | Annual Income |
|---------------|-------------|---------------|
| Shopify Partner (20% recurring) | 50 clients × $39/mo avg × 20% | $4,680/yr |
| Printful referrals (10% × 12mo) | 20 POD clients × $500 avg monthly orders × 10% | $12,000/yr |
| Klaviyo partner | 30 clients × $30/mo avg × 15% | $1,620/yr |
| Canva referrals | 40 clients × $13/mo × 36% | $2,246/yr |
| Jungle Scout referrals | 15 referrals × $150 | $2,250/yr |
| Spocket LIFETIME recurring | 10 clients × $49/mo × 25% | $1,470/yr |
| Stripe merchant referrals | 20 merchants × $2,500 | $50,000/yr |
| PayPal merchant referrals | 20 merchants × $2,500 | $50,000/yr |
| **Total passive affiliate income** | | **~$124,266/yr** |

---

## Implementation Priority Summary

### P0 — Must Ship (Blocks Revenue)
1. A.1 — Stripe Subscription Billing
2. A.2 — Platform Gating + Upsell UI
3. A.3 — Admin Layout Role Check
4. A.4 — Client Dashboard Middleware
5. D.1 — Competitive Pricing Structure
6. G.1 — Store Integration OAuth
7. J.1 — Best-Selling Products Dashboard (Command Center)
8. J.3 — One-Click Product Push
9. K.2 — E-Commerce Platform Affiliates

### P1 — Ship Within 4 Weeks (Core Value)
10. B.1 — 8-Channel Intelligence Dashboard
11. B.2 — Cross-Platform Product Intelligence
12. B.5 — Complete Pre-Viral Detection (6 Signals)
13. C.1 — Content Generation Engine
14. C.2 — Content Distribution Pipeline
15. D.3 — Free Tier / Freemium
16. E.4 — Unit Test Coverage
17. E.5 — Trend Lifecycle Fix
18. E.6 — AI Affiliate Database Update
19. F.1 — Onboarding Flow
20. G.2 — Order Tracking + Email Sequences
21. I.1 — POD Product Discovery
22. I.2 — POD Supplier Integration
23. I.3 — POD Store Provisioning
24. J.2 — Per-Platform Pipeline View
25. J.4 — One-Click Marketing Launch
26. K.1 — Affiliate Revenue Tracker
27. K.3-K.6 — All affiliate platform integrations
28. K.8 — Affiliate Content Factory

### P2 — Ship Within 8 Weeks (Differentiation)
29. B.3 — Enhanced Launch Blueprints
30. B.4 — Pinterest → Google Trends Prediction
31. C.3 — Brand Voice Configuration
32. C.4 — Content Calendar View
33. D.2 — Add-On Revenue Streams
34. E.1 — CSRF Protection
35. E.2 — Input Validation
36. E.3 — Dead Letter Queue
37. F.2 — Weekly Email Digest
38. F.4 — Referral Program
39. G.3 — Price/Stock Monitoring
40. G.4 — Domestic Supplier Priority
41. H.1-H.7 Channel-specific improvements (P2 items)
42. I.4 — POD Content Engine
43. I.5 — POD Influencer Matching
44. K.7 — Analytics Tool Affiliates

### P3 — Ship Within 12 Weeks (Growth)
45. F.3 — API Access
46. H.1.4 — Live TikTok Analytics
47. H.3.4 — Shopify App
48. H.4.4 — Visual Product Matching
49. H.5.5 — Creative Market / Envato
50. Mobile App (Phase H from v7 spec)

---

## Competitive Position Summary

| Capability | YOUSELL | Sell The Trend | AutoDS | Jungle Scout | Kalodata | Minea |
|-----------|---------|----------------|--------|--------------|----------|-------|
| Channels covered | 8 | 2 | 3 | 1 | 1 | 5 (ads only) |
| AI scoring | ✅ 3-pillar | Basic | ❌ | ✅ Amazon-only | ❌ | ❌ |
| Pre-viral detection | ⚠️ 2/6 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Content creation | ✅ Strategy complete | ❌ | Basic | ❌ | ❌ | ❌ |
| Auto-posting | ✅ Strategy complete (Ayrshare) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Store integration | ✅ Strategy complete | ✅ Shopify | ✅ 5+ stores | ❌ | ❌ | ❌ |
| Influencer intelligence | ✅ | ❌ | ❌ | ❌ | ✅ TikTok | ❌ |
| Supplier matching | ✅ | ✅ NEXUS | ✅ 100+ | ✅ Amazon | ❌ | ❌ |
| Financial modeling | ✅ | ❌ | ❌ | ✅ Basic | ❌ | ❌ |
| Launch blueprints | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POD | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Admin Command Center | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Affiliate Commission Engine | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Price range | $29-$149 | $30-$300 | $20-$120 | $29-$149 | $46-$110 | $49-$399 |

**YOUSELL's moat:** No single competitor covers intelligence + content + automation across 8 channels. The combination is genuinely unique. The critical path is shipping Stripe + Store Integration + Content Engine to activate this advantage.

---

## Session 2 Updates — March 2026

### Pricing Model Decision: Option C (Hybrid) — APPROVED

**Decision:** Channel-gated tiering with channel selection (inspired by Minea model, validated by AutoDS per-marketplace approach).

| Tier | Monthly | Annual | Channels | Key Features |
|------|---------|--------|----------|-------------|
| Starter | $29 | $19/mo | 1 channel | Product Finder, basic scores, 50 content credits |
| Growth | $59 | $39/mo | 2 channels | + Shop Connect, Creative Studio, 200 credits |
| Professional | $99 | $69/mo | 3 channels | + Creator Connect, Supplier Finder, Smart Publisher, 500 credits |
| Enterprise | $149 | $99/mo | All channels | All engines, API access, team seats, unlimited credits |

Multi-channel discount: 20% off second channel, 30% off third+.

### New Features from Content/Publishing/Shop Strategy

| # | Feature | Category | Priority | Phase |
|---|---------|----------|----------|-------|
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

### Updated Priority Summary

#### P0 — Must Ship (Updated)
1. A.1 — Stripe Subscription Billing
2. A.2 — Platform Gating + Upsell UI
3. A.3 — Admin Layout Role Check
4. A.4 — Client Dashboard Middleware
5. D.1 — Competitive Pricing Structure (Option C confirmed)
6. G.1 — Store Integration OAuth (Shopify first — Phase 2A)
7. **NEW** #40 — Shopify GraphQL product push
8. **NEW** #41 — TikTok Shop Partner API
9. **NEW** #51 — Shop product sync tracking
10. **NEW** #52 — Client-facing terminology mapping

#### P1 — Ship Within 4 Weeks (Updated)
11-17. (Previous P1 items remain)
18. **NEW** #37 — Shotstack video generation
19. **NEW** #38 — Bannerbear image generation
20. **NEW** #39 — Ayrshare publishing
21. **NEW** #42 — Amazon SP-API
22. **NEW** #43 — Meta Business Extension
23. **NEW** #44 — Automation control system
24. **NEW** #45 — Auto-pilot guardrails
25. **NEW** #46 — Content credits
26. **NEW** #49 — TikTok download fallback
27. **NEW** #50 — Social connection hub

#### P2 — Ship Within 8 Weeks (Updated)
28-36. (Previous P2 items remain)
37. **NEW** #47 — Brand voice configuration
38. **NEW** #48 — Content calendar UI

### Updated Feature Count: 72 prioritized features (was 52)
