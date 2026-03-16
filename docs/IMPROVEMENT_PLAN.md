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
| **Channels** | All 7 |
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
| **Channels** | All 7 |
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

Features that set YOUSELL apart. Multi-channel (7 channels), model-agnostic, AI-first.

### B.1 — 7-Channel Intelligence Dashboard (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Unified view showing opportunities across all 7 channels simultaneously with cross-platform detection |
| **Inspired by** | NO competitor covers all 7 channels. Sell The Trend = 2, Jungle Scout = 1, Kalodata = 1 |
| **Channels** | All 7 |
| **Complexity** | M |
| **Revenue Impact** | HIGH — key differentiator |
| **Priority** | P1 |
| **Affected Files** | engines/opportunity-feed.ts, admin dashboard |

### B.2 — Cross-Platform Product Intelligence (P1)

| Field | Detail |
|-------|--------|
| **Feature** | When a product is detected on one platform, automatically check for presence on all others. Show multi-platform opportunity map. |
| **Inspired by** | RTM Gap #61. No competitor does this. Jungle Scout is Amazon-only, Kalodata is TikTok-only. |
| **Channels** | All 7 |
| **Complexity** | L |
| **Revenue Impact** | HIGH — unique feature |
| **Priority** | P1 |
| **Affected Files** | engines/clustering.ts, engines/discovery.ts |

### B.3 — AI-Powered Launch Blueprints (Already Built — Enhance) (P1)

| Field | Detail |
|-------|--------|
| **Feature** | Enhance existing blueprints with channel-specific launch strategies, competitor analysis, and financial projections |
| **Inspired by** | Copy.ai GTM Playbooks, Sell The Trend store builder. No competitor generates full launch plans. |
| **Channels** | All 7 |
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
| **Channels** | All 7 (each channel gets platform-specific content formats) |
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
| **Channels** | All 7 (distribution to TikTok, Instagram, Facebook, Pinterest, YouTube, Twitter, LinkedIn) |
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
| **Channels** | All 7 |
| **Complexity** | S |
| **Revenue Impact** | MEDIUM — premium feature |
| **Priority** | P2 |
| **Affected Files** | clients table (add brand_voice JSONB column) |

### C.4 — Content Calendar View (P2)

| Field | Detail |
|-------|--------|
| **Feature** | Visual calendar showing scheduled content across all channels |
| **Inspired by** | Predis.ai content calendar, Buffer scheduling view |
| **Channels** | All 7 |
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

## Implementation Priority Summary

### P0 — Must Ship (Blocks Revenue)
1. A.1 — Stripe Subscription Billing
2. A.2 — Platform Gating + Upsell UI
3. A.3 — Admin Layout Role Check
4. A.4 — Client Dashboard Middleware
5. D.1 — Competitive Pricing Structure
6. G.1 — Store Integration OAuth

### P1 — Ship Within 4 Weeks (Core Value)
7. B.1 — 7-Channel Intelligence Dashboard
8. B.2 — Cross-Platform Product Intelligence
9. B.5 — Complete Pre-Viral Detection (6 Signals)
10. C.1 — Content Generation Engine
11. C.2 — Content Distribution Pipeline
12. D.3 — Free Tier / Freemium
13. E.4 — Unit Test Coverage
14. E.5 — Trend Lifecycle Fix
15. E.6 — AI Affiliate Database Update
16. F.1 — Onboarding Flow
17. G.2 — Order Tracking + Email Sequences

### P2 — Ship Within 8 Weeks (Differentiation)
18. B.3 — Enhanced Launch Blueprints
19. B.4 — Pinterest → Google Trends Prediction
20. C.3 — Brand Voice Configuration
21. C.4 — Content Calendar View
22. D.2 — Add-On Revenue Streams
23. E.1 — CSRF Protection
24. E.2 — Input Validation
25. E.3 — Dead Letter Queue
26. F.2 — Weekly Email Digest
27. F.4 — Referral Program
28. G.3 — Price/Stock Monitoring
29. G.4 — Domestic Supplier Priority
30. H.1-H.7 Channel-specific improvements (P2 items)

### P3 — Ship Within 12 Weeks (Growth)
31. F.3 — API Access
32. H.1.4 — Live TikTok Analytics
33. H.3.4 — Shopify App
34. H.4.4 — Visual Product Matching
35. H.5.5 — Creative Market / Envato
36. Mobile App (Phase H from v7 spec)

---

## Competitive Position Summary

| Capability | YOUSELL | Sell The Trend | AutoDS | Jungle Scout | Kalodata | Minea |
|-----------|---------|----------------|--------|--------------|----------|-------|
| Channels covered | 7 | 2 | 3 | 1 | 1 | 5 (ads only) |
| AI scoring | ✅ 3-pillar | Basic | ❌ | ✅ Amazon-only | ❌ | ❌ |
| Pre-viral detection | ⚠️ 2/6 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Content creation | ⚠️ Planned | ❌ | Basic | ❌ | ❌ | ❌ |
| Auto-posting | ❌ Planned | ❌ | ❌ | ❌ | ❌ | ❌ |
| Store integration | ❌ Planned | ✅ Shopify | ✅ 5+ stores | ❌ | ❌ | ❌ |
| Influencer intelligence | ✅ | ❌ | ❌ | ❌ | ✅ TikTok | ❌ |
| Supplier matching | ✅ | ✅ NEXUS | ✅ 100+ | ✅ Amazon | ❌ | ❌ |
| Financial modeling | ✅ | ❌ | ❌ | ✅ Basic | ❌ | ❌ |
| Launch blueprints | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Price range | $29-$199 | $40-$100 | $27-$67 | $29-$199 | $16-$199 | $49-$399 |

**YOUSELL's moat:** No single competitor covers intelligence + content + automation across 7 channels. The combination is genuinely unique. The critical path is shipping Stripe + Store Integration + Content Engine to activate this advantage.
