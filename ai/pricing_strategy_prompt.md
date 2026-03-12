# YOUSELL — Master Pricing & Packaging Strategy Prompt

**Document Type:** Prompt for Claude to execute pricing research and strategy
**Date:** 2026-03-12
**Status:** READY TO EXECUTE
**Prerequisite:** Read `/ai/platform_strategy.md` for baseline context

---

## CONTEXT FOR CLAUDE

You are working on YOUSELL, an AI-powered e-commerce automation and intelligence platform. You previously created a strategy document (`/ai/platform_strategy.md`) with a 4-tier SaaS pricing model. That document needs a **major revision** because it undervalued what YOUSELL actually does.

### What the Previous Strategy Got Wrong

The earlier strategy compared YOUSELL to **data/research tools** like Jungle Scout ($49/mo) and Helium 10 ($99/mo). Those tools only SHOW data. YOUSELL is fundamentally different — it **automates the entire e-commerce operation** across multiple platforms. The correct competitive frame is closer to:

- **AutoDS** ($26–$67/mo) — automated dropshipping across Shopify, eBay, TikTok Shop
- **Spark Shipping** ($249–$999/mo) — enterprise automation for multi-supplier operations
- **Yaballe** — all-in-one AI-powered ecommerce automation
- **Flxpoint** — enterprise multi-vendor automation

But even these competitors only automate ONE side of the business (fulfillment/listing). YOUSELL automates **discovery + intelligence + marketing + store integration + content creation + influencer outreach + affiliate revenue** — all in one platform, across 5 selling channels.

**No one else is doing this.** Price accordingly — not as a data tool, but as a fully automated money-making engine.

---

## YOUR TASK

Create an updated, comprehensive pricing and packaging strategy document that replaces the earlier `/ai/platform_strategy.md`. This document must cover everything below. **Do NOT execute any code — this is research and strategy only.**

---

## SECTION 1: DEEP MARKET ANALYSIS BY PLATFORM

For EACH of the 5 platforms YOUSELL supports, conduct individual market research:

### 1.1 TikTok Shop
- What does it cost a seller to set up and run a TikTok Shop in 2026?
- What do TikTok Shop management agencies charge?
- What automation tools exist and what do they cost?
- What are TikTok Shop's platform fees and commission rates?
- What is the average revenue potential for a TikTok Shop seller?
- What does influencer outreach cost on TikTok (manually vs. tools)?
- What does TikTok ad creation and management cost?

### 1.2 Amazon FBA / FBM
- What does it cost to launch and maintain an Amazon seller account?
- What do Amazon management agencies charge?
- What does Helium 10, Jungle Scout, etc. charge for Amazon research?
- Amazon SP-API capabilities for automated listing creation
- PPC management tool costs
- What is the average revenue potential per product on Amazon?

### 1.3 Shopify Store
- Cost to build and launch a Shopify store from scratch
- Theme costs, app costs, monthly Shopify fees
- What do Shopify development agencies charge?
- Shopify Admin API / GraphQL API for automated product import
- Free/affordable tools for bulk product upload (ProductUpload.ai, BulkFlow, etc.)
- Traffic generation costs (ads, SEO, content)

### 1.4 Digital Products
- What platforms exist for selling digital products (Gumroad, Teachable, Podia, etc.)?
- What do they charge?
- What does it cost to create digital products (courses, templates, ebooks)?
- AI-assisted content creation costs
- Revenue potential of digital products (margins are ~95%)

### 1.5 AI Affiliate Programs
- **THIS IS CRITICAL AND WAS MISSING FROM PREVIOUS RESEARCH**
- Map out ALL major AI tool affiliate programs and their commission rates:
  - Jasper: 25–30% for 12 months
  - Copy.ai: 45% first year
  - Writesonic: 30% lifetime recurring
  - Canva: up to 20%
  - GetResponse: 40–60% recurring
  - Sider AI: up to 49%
  - ChatGPT Plus: ~15% recurring (limited)
  - Midjourney: $50/referral (limited)
  - Grammarly, SurferSEO, Pictory, Synthesia, Descript, etc.
- What is the realistic monthly earning potential from AI affiliates?
- What does it cost to automate affiliate content creation?
- How can YOUSELL automate the affiliate promotion process for clients?
- **Key insight:** Affiliate programs pay on SIGNUPS/CONVERSIONS, not on marketing activity. YOUSELL does NOT earn affiliate commissions from client activity. Instead, YOUSELL earns subscription revenue by providing: (a) a curated, frequently updated database of affiliate opportunities, (b) an automated marketing engine that creates and distributes promotional content across social media, and (c) performance tracking. The CLIENT earns affiliate commissions directly — 100% theirs. They pay us for the platform that finds opportunities and automates the marketing work. This is a pure SaaS model, not a revenue-share model.

---

## SECTION 2: COMPLETE YOUSELL FEATURE INVENTORY

Map every feature/automation YOUSELL offers (or will offer). Categorize them into **"Engines"** — modular capabilities that clients can enable/disable:

### Engine 1: Product Discovery Engine
- Multi-platform trending product identification
- AI-powered 3-pillar scoring (trend + viral + profit)
- Historical trend tracking
- Category analysis
- New product alerts

### Engine 2: Store Integration Engine
- **Shopify:** Automated store creation using free builder apps, theme deployment, bulk product import via Shopify Admin API (GraphQL), inventory sync
- **TikTok Shop:** Product listing via TikTok Seller API / Product Upload Accelerator, bulk upload, category mapping
- **Amazon:** Listing creation via SP-API (Listings Items API), ASIN matching, pricing sync
- **Digital:** Product page generation for digital goods, download delivery setup
- Note: Each platform integration has different technical feasibility and legal considerations. Research and document these.

### Engine 3: Marketing & Ads Engine
- AI-generated ad creatives (images + copy) for each platform
- TikTok ad campaign setup and optimization
- Amazon PPC campaign automation
- Facebook/Instagram ad generation for Shopify traffic
- Pinterest pin generation for organic traffic
- Ad spend tracking and ROI analysis

### Engine 4: Content Creation Engine
- AI-generated product descriptions optimized per platform
- Social media content calendar generation
- Video script generation for TikTok/Reels
- Blog/SEO content for Shopify stores
- Email marketing templates
- Affiliate review content for AI tools

### Engine 5: Influencer & Outreach Engine
- Influencer discovery across platforms
- Influencer scoring and ranking
- **One-click influencer invitation buttons** (send templated outreach via email/DM)
- Campaign brief generation
- Performance tracking per influencer
- Commission/payment management

### Engine 6: Supplier Intelligence Engine
- Supplier discovery and verification
- Price comparison across suppliers
- MOQ and shipping time analysis
- Supplier communication templates
- Cost-of-goods tracking

### Engine 7: AI Affiliate Discovery & Marketing Engine
- Curated, frequently updated database of high-commission AI affiliate programs
- Auto-generated affiliate promotional content (reviews, comparisons, tutorials, social posts)
- Client manages their OWN affiliate links — YOUSELL does not touch commissions
- Automated social media content distribution for affiliate promotions
- Performance tracking dashboard (clicks, signups, estimated commissions)
- New opportunity alerts when high-value affiliate programs launch or change terms
- **Business model:** Client earns 100% of their affiliate commissions. YOUSELL earns purely from the subscription fee for providing the discovery platform + automated marketing engine. No revenue share, no commission split.

### Engine 8: Analytics & Profit Engine
- Real-time sales tracking across all platforms
- Profit/loss per product, per platform
- Ad spend vs. revenue analysis
- Competitor price monitoring
- Financial projections and what-if modeling
- Custom report generation

---

## SECTION 3: PRICING MODEL DESIGN

### 3.1 Philosophy

Think from the perspective of an **ecommerce enthusiast** who is getting a fully automated, intelligent system that makes money 24/7 with minimal input. The value proposition is NOT "see data" — it's "make money while you sleep." Price for value delivered, not features listed.

Key principles:
- **Generous with data visibility** — show more, not less. Let them see the opportunity. The paywall should be on AUTOMATION and ACTIONS, not on viewing data.
- **Volume over margin** — more customers at reasonable prices beats fewer at high prices
- **Per-platform modularity** — let clients start with one platform and expand
- **Engine-based toggles** — clients can enable/disable engines they want
- **Affiliate engine as value-add** — clients earn passive income through our platform, justifying subscription pricing (YOUSELL does NOT take a cut of their commissions)
- **Predictable ROI messaging** — for each package, calculate and show the client what they can realistically earn

### 3.2 Pricing Structure Requirements

Design a pricing model that includes ALL of the following:

#### A. Platform-Specific Base Packages
Create separate pricing parameters for each platform:
- **TikTok Package** — base price + per-engine pricing
- **Amazon Package** — base price + per-engine pricing
- **Shopify Package** — base price + per-engine pricing
- **Digital Products Package** — base price + per-engine pricing
- **AI Affiliates Package** — base price + per-engine pricing

Each platform package should have its own set of limits and parameters determined by market analysis — NOT copied from the previous strategy. Research what makes sense for each platform individually.

#### B. Engine Add-Ons (Enable/Disable Per Platform)
For each platform, the client should be able to toggle individual engines:

| Engine | Included in Base? | Add-On Price |
|--------|------------------|-------------|
| Product Discovery | Always included | — |
| Store Integration | Varies by tier | $X/mo |
| Marketing & Ads | Varies by tier | $X/mo |
| Content Creation | Varies by tier | $X/mo |
| Influencer Outreach | Add-on | $X/mo |
| Supplier Intelligence | Add-on | $X/mo |
| AI Affiliate Revenue | Add-on | $X/mo |
| Analytics & Profit | Always included | — |

Determine which engines are included at each tier and which are add-ons. Use market research to set appropriate prices.

#### C. Bundle Discounts
- 2-platform bundle: X% off
- 3-platform bundle: X% off
- All-platform bundle: X% off (the "Empire" package)
- Calculate bundle prices that make the all-platform option irresistible

#### D. Tier Levels Within Each Platform
Create 2–3 tiers per platform that differ in:
- Number of products tracked/managed
- Scan/refresh frequency
- Level of automation (manual vs. semi-auto vs. full-auto)
- Number of AI-generated content pieces
- Number of influencer outreach credits
- Amount of data shown (be generous — show lots of data even at lower tiers)

#### E. ROI Projections Per Package
For EACH package, calculate and present:
- Estimated monthly revenue the client can generate
- Estimated profit after platform fees, ad spend, COGS
- Payback period (how many months until the subscription pays for itself)
- Use realistic, conservative numbers — but make the case compelling

### 3.3 Cost-to-Serve Analysis

For each engine and platform combination, estimate:
- Apify scan credits consumed
- Anthropic Claude API calls (blueprint generation, content creation, ad copy)
- Third-party API costs (Shopify API, TikTok API, Amazon SP-API)
- Email sending costs (Resend)
- Infrastructure costs (Supabase, Railway, Redis, Netlify)
- Human support time (if any)
- Note: YOUSELL does NOT earn affiliate commissions from client activity — revenue is purely subscription-based

### 3.4 Competitor Pricing Comparison Table

Create a detailed comparison showing YOUSELL vs. every relevant competitor, organized by what you GET:

| What You Get | YOUSELL | AutoDS | Helium 10 | Jungle Scout | Sell The Trend | Agency |
|---|---|---|---|---|---|---|
| Multi-platform discovery | ✅ 5 platforms | ❌ | ❌ Amazon only | ❌ Amazon only | ✅ Limited | ✅ Manual |
| AI scoring engine | ✅ | ❌ | ❌ | ❌ | Basic | ❌ Manual |
| Store integration | ✅ Auto | ✅ Auto | ❌ | ❌ | ❌ | ✅ Manual |
| Ad automation | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ Manual |
| Content creation | ✅ AI | ❌ | ❌ | ❌ | ❌ | ✅ Manual |
| Influencer outreach | ✅ 1-click | ❌ | ❌ | ❌ | ❌ | ✅ Manual |
| AI affiliate revenue | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Price | $XX–$XXX | $27–$67 | $99–$229 | $49–$199 | $30–$100 | $2K–$10K |

Show that YOUSELL delivers agency-level automation at a fraction of agency cost, with MORE platforms and MORE automation than any single SaaS tool.

---

## SECTION 4: BACKEND MODIFICATIONS FOR ENGINE TOGGLES

Design the database and API changes needed to support per-client engine configuration:

### 4.1 New Database Schema

```sql
-- Engine configuration per client per platform
CREATE TABLE client_engine_config (
    id UUID PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    platform TEXT,  -- 'tiktok', 'amazon', 'shopify', 'digital', 'ai_affiliates'
    engine TEXT,    -- 'discovery', 'store_integration', 'marketing_ads', etc.
    enabled BOOLEAN DEFAULT false,
    tier TEXT,      -- 'basic', 'standard', 'premium'
    limits JSONB,   -- engine-specific limits
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Client Dashboard Modifications

- Show all engines for all platforms in a grid layout
- Enabled engines: full functionality
- Disabled engines: show preview data + "Enable for $X/mo" CTA
- Per-engine usage meters (products used/total, content generated/total, etc.)
- One-click enable/disable with immediate Stripe billing adjustment

### 4.3 Admin Dashboard Modifications

- Super admin can override any client's engine access
- Bulk enable/disable engines for plan tiers
- View engine usage analytics across all clients
- Cost-per-engine reporting

---

## SECTION 5: STORE INTEGRATION FEASIBILITY

Research and document the technical and legal feasibility of importing product data into client stores:

### 5.1 Shopify Integration
- **Technically feasible:** YES — via Shopify Admin API (GraphQL), bulk operations support up to 5 concurrent bulk mutations per shop (as of API version 2026-01)
- **Tools available:** ProductUpload.ai (free plan), BulkFlow, AutoDS importer
- **Approach:** Client installs a Shopify app (or gives API access), YOUSELL pushes product data including titles, descriptions, images, pricing, variants
- **Legal considerations:** Research if there are any restrictions on automated store population
- **Free store builder option:** Document how to use free Shopify store builder tools to create a fully themed store + populate it with YOUSELL-discovered products

### 5.2 TikTok Shop Integration
- **Technically feasible:** YES — via TikTok Shop API and Product Upload Accelerator
- **Approach:** Client connects their TikTok Seller Center, YOUSELL pushes products via API
- **Limitations:** Must use TikTok's official templates, category mapping required
- **Legal:** Must comply with TikTok Shop seller policies

### 5.3 Amazon Integration
- **Technically feasible:** YES (with caveats) — via Amazon SP-API (Listings Items API)
- **Approach:** Client grants SP-API access, YOUSELL creates listings programmatically
- **Limitations:** Requires Professional seller account ($39.99/mo), ASIN matching needed, category approval may be required, listing restrictions vary
- **Legal:** Must comply with Amazon's terms of service, cannot create listings for restricted categories without approval

### 5.4 Digital Products
- **Approach:** Generate landing pages / product pages hosted on YOUSELL or integrated with client's existing site
- **Delivery:** Automated download links, email delivery via Resend

---

## SECTION 6: AFFILIATE ENGINE — BUSINESS MODEL (CORRECTED)

### 6.1 How the AI Affiliate Engine Works

**IMPORTANT: YOUSELL does NOT earn affiliate commissions from client activity.** Affiliate programs pay the person whose link generates the signup — that's the CLIENT, not YOUSELL. The business model is purely SaaS:

```
Client pays YOUSELL subscription ($X/mo)
    → Gets access to curated, frequently updated affiliate program database
    → Uses YOUSELL's AI marketing engine to auto-generate promotional content
    → YOUSELL's automation distributes content across client's social media channels
    → Someone clicks client's affiliate link → signs up for AI tool
    → AI tool pays affiliate commission directly to the CLIENT (100% theirs)
    → YOUSELL earns NOTHING from that commission
    → YOUSELL earns from the subscription fee for providing the platform
```

### 6.2 What YOUSELL Provides (What the Client Pays For)

1. **Discovery:** Continuously updated database of AI affiliate programs with commission rates, cookie durations, conversion rates, program terms, and application links
2. **Opportunity scoring:** AI-ranked affiliate programs by earning potential, competition level, and trend momentum
3. **Content automation:** Auto-generated affiliate promotional content — reviews, comparison articles, social media posts, video scripts, email templates — all optimized for conversions
4. **Distribution automation:** Automated posting to client's connected social media channels on an optimized schedule
5. **Tracking dashboard:** Monitor clicks, estimated signups, and estimated commissions across all affiliate programs
6. **New opportunity alerts:** Notifications when high-value programs launch, change terms, or run promotions

### 6.3 Why This Is Valuable to Clients

- Finding and evaluating affiliate programs manually takes hours — YOUSELL does it automatically
- Creating promotional content for each program is tedious — YOUSELL's AI generates it
- Posting consistently across social channels is a full-time job — YOUSELL automates it
- The client focuses on nothing; the system runs 24/7 generating passive affiliate income
- Many AI affiliate programs pay 25–50% recurring commissions — a client promoting 5–10 tools can realistically earn $500–$2,000+/mo in passive income

### 6.4 YOUSELL's Own Affiliate Revenue (Separate from Client Activity)

YOUSELL itself can earn affiliate commissions by recommending tools that clients need for their e-commerce operations (Shopify, hosting, email tools, etc.). This is separate from the client's affiliate engine and should be documented as a secondary revenue stream — but it is NOT the primary business model and should NOT be factored into subscription pricing.

---

## SECTION 7: THE "MONEY MACHINE" NARRATIVE

### 7.1 Client Perspective

Write a clear narrative that answers: "What does a YOUSELL subscriber get?"

**Answer:** A fully automated e-commerce operation that:
1. FINDS winning products across 5 platforms using AI (not just shows you a list — actually tells you WHICH products will make money and WHY)
2. CREATES your store and listings automatically (Shopify store built, TikTok Shop populated, Amazon listings created)
3. GENERATES all your marketing content (ad creatives, product descriptions, social posts, email campaigns)
4. FINDS AND CONTACTS influencers for you (one-click outreach, not just a list of names)
5. RUNS your ads with AI optimization (not just suggests — actually creates and manages campaigns)
6. EARNS you passive affiliate income (discovers high-commission AI programs, auto-generates promotional content, distributes it — you earn commissions directly, 100% yours)
7. TRACKS everything (profit per product, ROI per platform, what's working, what's not)
8. TELLS you what to do next (AI-generated launch blueprints and recommendations)

**No other platform does all 8.** Most do 1–2. Agencies do most of them manually for $2,000–$10,000/mo. YOUSELL automates all 8 for a fraction of the cost.

### 7.2 Pricing Psychology

- Position the price against the REVENUE it generates, not against competitor tool costs
- If the Seller package costs $99/mo and the average client generates $2,000+/mo in revenue, that's a 20x ROI
- Use messaging like: "Your subscription pays for itself within the first week"
- Show concrete examples: "One trending TikTok product can generate $5,000–$50,000 in a single month"

---

## SECTION 8: DUAL-PLATFORM ARCHITECTURE (RETAIN FROM PREVIOUS STRATEGY)

Keep the dual-platform separability design from `/ai/platform_strategy.md`:
- admin.yousell.online = Intelligence/Admin platform (sellable to agencies)
- app.yousell.online = Client dashboard platform (the SaaS product)
- Super admin toggle to link/unlink them
- Clean code boundaries for independent deployment

---

## OUTPUT FORMAT

Produce a single, comprehensive markdown document saved to `/ai/platform_strategy_v2.md` that contains:

1. Executive summary (1 page)
2. Market analysis by platform (with actual numbers and sources)
3. Complete engine inventory with feasibility notes
4. Final pricing model with all tiers, platforms, engines, and bundles
5. ROI projections per package
6. Cost-to-serve analysis
7. Competitor comparison matrix
8. Database schema changes needed
9. Dashboard modification specifications
10. Store integration feasibility report
11. Affiliate revenue model
12. Implementation roadmap (phased)
13. Risk analysis and mitigation

**Remember:** Be GENEROUS with data shown to clients. The paywall is on AUTOMATION and ACTIONS, not on visibility. A client on the cheapest plan should still see impressive amounts of data — they just can't automate actions on it without upgrading.

**Remember:** YOUSELL earns purely from subscription fees — NOT from client affiliate commissions. The affiliate engine is a value-add that justifies higher subscription pricing because it helps clients earn passive income. The client keeps 100% of their affiliate earnings.

**Remember:** Think like an ecommerce entrepreneur who wants a fully automated system making money 24/7 with minimal input. Price for the VALUE of that outcome, not for the cost of the features.

---

*This prompt is ready to be executed by Claude in a future session to produce the complete strategy document.*
