# YOUSELL Platform — Full Cost Analysis v2 (March 2026)

> **Scenario**: 1 solo user running TikTok + Amazon + Shopify stores
> **Three configurations compared**:
> - (A) Current system — no n8n, no Purchasing/Content engines
> - (B) Full stack with n8n + Purchasing + Content + Profitability Intelligence (wide search — v1 estimate)
> - (C) **Optimised** — focused suppliers + n8n templates + Blotato + Profitability Intelligence Engine

---

## Configuration A — Current System (Baseline)

### Infrastructure Costs

| Service | Plan | Monthly Cost | What It Covers |
|---------|------|-------------|----------------|
| **Supabase** | Pro | $25 | PostgreSQL, Auth, Realtime, 8GB storage, PITR |
| **Railway** (Express backend) | Hobby | ~$10 | Node.js API server, low traffic 1 user |
| **Railway** (Redis) | Hobby (shared) | ~$5 | BullMQ queues, budget tracking, freshness cache |
| **Railway** (BullMQ workers) | Hobby | ~$8 | Worker processes, intermittent compute |
| **Netlify** | Free | $0 | Next.js frontend, 100GB bandwidth |
| **Domain + DNS** | — | ~$1 | Custom domain annual cost amortised |
| **Subtotal** | | **~$49/mo** | |

### External API Costs

| Service | Usage Estimate (1 user) | Monthly Cost | Notes |
|---------|------------------------|-------------|-------|
| **Apify** (all scraping) | Starter plan + overages | ~$64 | TikTok (6h), Amazon, Shopify + burst |
| **Anthropic Claude API** | Haiku + Sonnet mix | ~$26 | Predictive engine, profitability, briefings |
| **Resend** | Free tier | $0 | 3,000 emails/mo |
| **Stripe** | Transaction fees only | $0 | Self-use, no revenue yet |
| **SerpAPI / YouTube / Reddit / Pinterest** | Free tiers | $0 | Supplementary workers |
| **Subtotal** | | **~$90/mo** | |

### Configuration A — Total: **~$139/mo** (~$1,668/yr)

---

## Configuration B — Wide Search (v1 Estimate, Previous Analysis)

This was the original Config B with broad supplier search across 4 hubs, custom content pipeline, and self-hosted Postiz.

### Configuration B — Total: **~$415/mo** (~$4,980/yr)

*See v1 analysis for full breakdown. This is now superseded by Config C below.*

---

## Configuration C — Optimised Strategy (Recommended)

### Core Design Changes from Config B

| What Changed | Config B (Wide) | Config C (Focused) | Savings |
|-------------|----------------|-------------------|---------|
| Supplier search | 6 workers, 4 hubs, custom scraping | 2 platforms only (AliExpress + Alibaba/1688) + TopDawg API | Fewer Apify CUs + simpler code |
| Content publishing | Self-hosted Postiz + custom FFmpeg pipeline | Blotato ($29/mo) with native n8n node | Eliminates custom publishing code |
| n8n workflows | All custom-built from scratch | Start with free community templates (2,705 marketing templates) then customise | Faster setup, less dev time |
| Profitability Engine | Not included | **NEW**: Central brain that connects purchasing → marketing → pricing | Better decisions, higher ROI |
| Digital products | Custom digital_product_worker | Simple lookup table maintained by system | No extra worker needed |
| Content creation | HeyGen + Runway + Flux + ElevenLabs (4 services) | Blotato (bundles AI images/video/voice) + HeyGen for avatar only | Fewer subscriptions |

### Infrastructure Costs

| Service | Plan | Monthly Cost | What It Covers |
|---------|------|-------------|----------------|
| **Supabase** | Pro | $25 | Same as Config A |
| **Railway** (Express + Workers) | Hobby | ~$18 | Same as Config A |
| **Railway** (Redis) | Hobby | ~$5 | Same as Config A |
| **Railway** (n8n self-hosted) | Hobby | ~$8 | n8n Community Edition, unlimited executions |
| **Netlify** | Free | $0 | Same as Config A |
| **Domain** | — | ~$1 | Same as Config A |
| **Subtotal** | | **~$57/mo** | |

### Purchasing Engine — Focused Approach

Only 2 supplier platforms for dropshipping + 2 for wholesale. That's it.

| Service | Usage Estimate | Monthly Cost | Purpose |
|---------|---------------|-------------|---------|
| **Apify** (AliExpress scraper) | ~1,500 products/mo @ $0.004 | ~$6 | Dropship supplier discovery — millions of products, built-in suppliers |
| **Apify** (Alibaba/1688 scraper) | ~500 products/mo | ~$5 | Wholesale pricing, MOQ, volume tiers — China hub |
| **TopDawg** | Business plan | $35 | USA dropshipping — 500K+ products, real-time pricing API, auto-order routing |
| **Shipping/currency APIs** | Free tiers | $0 | Easyship (free), exchangerate-api (free) |
| **Apify plan upgrade** | Starter → Growth ($99) | +$35 | Covers all scraping: TikTok + Amazon + Shopify + supplier lookups |
| **Subtotal** | | **~$81/mo** | *(net new above Config A: ~$81 — Apify upgrade is $35 net)* |

**Why this is enough:**
- **AliExpress** = 100M+ products from millions of suppliers worldwide. One search covers China, EU, and often UK/US warehouses.
- **Alibaba/1688** = wholesale/bulk pricing from Chinese manufacturers. This is where you get real margins.
- **TopDawg** = #1 US dropshipping platform (USA Today 2026). 500K products, 3,000+ verified US suppliers, real-time API feed, auto-order routing. Covers the entire US dropship hub.
- Digital/AI products = simple platform lookup table (Gumroad, Etsy Digital, Creative Market). No scraping needed — just reference data maintained in the system.

### Content Creation + Publishing Engine

| Service | Usage Estimate | Monthly Cost | Purpose |
|---------|---------------|-------------|---------|
| **Blotato** | Starter plan | $29 | ALL-IN-ONE: AI images, AI video, AI voice, captions, scheduling, auto-posting to TikTok/IG/FB/YT/Pinterest. Up to 900 TikTok posts/mo. Native n8n node. |
| **HeyGen** | Creator plan | $29 | AI avatar reels only — for "talking head" product reviews |
| **Anthropic** (content scripts) | Additional Haiku calls | ~$5 | Script generation, hooks, viral pattern analysis, hashtags |
| **Subtotal** | | **~$63/mo** | |

**Why Blotato replaces 4 separate services:**

| Config B (4 services) | Config C (Blotato) |
|----------------------|-------------------|
| Runway ML — $12/mo (faceless video) | Blotato has built-in AI video generation |
| Flux API — $20/mo (product images) | Blotato has built-in AI image generation (unlimited with own Replicate key on Creator plan) |
| ElevenLabs — $5/mo (voiceover) | Blotato has built-in ElevenLabs voiceovers |
| Postiz (self-hosted) — $10/mo (posting) | Blotato has built-in posting to ALL platforms |
| **Total: $47/mo + dev time** | **$29/mo + zero custom code** |

**Content output with Blotato Starter ($29/mo):**
- 1,250 AI credits/month
- 20 social media accounts (enough for 3 stores × 5 platforms + extras)
- Up to 900 TikTok posts/month
- AI images, video, voice, captions — all included
- Native n8n node for automation
- REST API for custom integrations

**HeyGen ($29/mo) is kept separate** because Blotato doesn't generate AI avatar/"talking head" video. HeyGen is the best tool for that specific use case (AI model speaks about product, reviews, comparisons).

### Profitability Intelligence Engine (NEW — Config C Only)

This is the **central brain** that was missing. It sits between:
- Purchasing Engine (knows the buy price)
- Content/Marketing Engine (controls the spend)
- Pricing Engine (sets the sell price)

**Cost: $0 additional** — it runs on existing Anthropic API + Supabase. It's pure logic.

| What It Does | How |
|-------------|-----|
| Calculates true landed cost per product | Buy price + shipping + customs + platform fees |
| Estimates marketing cost per sale | Uses niche CPM/CPC data from ad workers + content performance data |
| Sets optimal selling price | Target margin % → reverse-calculate price → check market price → adjust |
| Decides which products to focus content on | Ranks by: (estimated margin × trend_score × viral_score) |
| Advises marketing budget per product | High margin + high trend = more budget. Low margin = skip. |
| Advises which platform to sell on | Compares margin after platform fees across TikTok Shop vs Amazon vs Shopify |
| Advises which social platform to promote on | Uses content_performance data to identify highest ROI platform per niche |
| Advises influencer spend | Creator match score × estimated reach × niche conversion rate → max CPA bid |
| Flags "don't bother" products | If best margin < 15% after all costs → auto-archive |

**This engine makes every other engine smarter:**
- Without it, the Content Engine generates content for ALL products blindly
- With it, the Content Engine only generates content for products that can actually make money
- Without it, you set prices by gut feeling
- With it, prices are optimised for target margins considering all costs

### n8n — Leveraging Free Community Templates

Instead of building all workflows from scratch, start with free templates from the [n8n community library](https://n8n.io/workflows/categories/marketing/) (2,705 marketing automation templates) and customise.

| Template to Start With | n8n Template # | What It Does | Customisation Needed |
|------------------------|---------------|-------------|---------------------|
| [Multi-Platform Content Creation with AI](https://n8n.io/workflows/3066) | #3066 | AI generates platform-specific content for 7+ platforms | Add product data as input, connect to Blotato |
| [Auto-Post AI Videos to Social Media](https://n8n.io/workflows/5035) | #5035 | Generates AI video + auto-posts via Blotato | Add HeyGen node for avatar reels |
| [Content Publishing Factory](https://n8n.io/workflows/3135) | #3135 | Automated publishing with system prompt composition | Wire to our product scoring data |
| [TikTok/YT/IG/FB Publishing via Blotato](https://n8n.io/workflows/7187) | #7187 | Centralised Google Sheet → Blotato → all platforms | Replace Google Sheet with Supabase trigger |
| [Upload to IG/TikTok/YT from Google Drive](https://n8n.io/workflows/2894) | #2894 | Monitor folder → auto-upload to platforms | Replace Drive with Supabase Storage |

**Custom workflows we still need to build:**

| Workflow | Starting Template | Custom Logic |
|----------|------------------|-------------|
| Supplier Discovery Pipeline | None (custom) | Product scored ≥60 → AliExpress + Alibaba + TopDawg → cost calc → margin |
| Profitability Engine | None (custom) | Landed cost + marketing estimate + price optimisation → budget allocation |
| Content Pipeline | #3066 + #5035 | Only generate for products where Profitability Engine says margin ≥30% |
| Outreach Drip | Many email templates available | 3-email sequence with Resend |
| Alert Routing | Many webhook templates available | Score threshold → email/Slack fan-out |
| Performance Feedback Loop | None (custom) | Track content performance → improve template selection |

**Development time saved by using templates: ~3-4 sessions** (compared to building all from scratch).

### Configuration C — Total

| Category | Monthly Cost |
|----------|-------------|
| Infrastructure (Supabase + Railway + Netlify) | $57 |
| Apify (Growth plan — all scraping) | $99 |
| Apify (AliExpress + Alibaba pay-per-result) | $11 |
| TopDawg (Business plan — US dropship) | $35 |
| Anthropic Claude API | $31 |
| HeyGen (AI avatar reels) | $29 |
| Blotato (content creation + publishing) | $29 |
| Resend | $0 |
| Free APIs (SerpAPI, YouTube, shipping, currency) | $0 |
| **TOTAL** | **~$291/mo** |

**Annual cost: ~$3,492/yr**

---

## Three-Way Comparison

| | Config A (Baseline) | Config B (Wide — v1) | Config C (Optimised) |
|---|---|---|---|
| **Monthly cost** | **~$139** | **~$415** | **~$291** |
| **Annual cost** | ~$1,668 | ~$4,980 | ~$3,492 |
| Purchasing intelligence | None | 6 workers, 4 hubs | 2 platforms + TopDawg API |
| Content creation | None | 4 separate services | Blotato (all-in-one) + HeyGen |
| Content publishing | None | Self-hosted Postiz | Blotato (built-in) |
| Profitability Engine | None | None | **Yes — central brain** |
| n8n | None | Custom workflows only | Free templates + custom |
| Social posting | None | Custom code | Blotato native n8n node |
| Supplier coverage | None | Wide (4 hubs, many workers) | Focused (AliExpress + Alibaba + TopDawg) |
| Digital products | None | Custom worker | Simple lookup table |
| Dev sessions needed | 43 | 43 + 9 = 52 | 43 + 7 = 50 (saved ~2 with templates) |
| Workers to build | 21 | 34 | 28 (fewer purchasing workers) |

### Cost Savings: Config C vs Config B

| Area | Config B | Config C | Saved |
|------|----------|----------|-------|
| Apify plan | $199 (Scale) | $99 (Growth) | $100 |
| Content creation (4 services) | $66 | $29 (Blotato) | $37 |
| Social posting | $10 (Postiz) | $0 (Blotato built-in) | $10 |
| HeyGen | $29 | $29 | $0 |
| Purchasing scraping | $18 | $11 | $7 |
| Regional supplier workers | Included | $35 (TopDawg replaces custom) | -$35 |
| n8n | $8 | $8 | $0 |
| **Net savings** | | | **~$124/mo** |

---

## Profitability Intelligence Engine — Deep Dive

This is the most important addition. It's the decision engine that prevents wasting money on unprofitable products.

### The Flow

```
Product Discovery (existing)
    ↓ product scored ≥ 60
Purchasing Engine (new)
    ↓ supplier found, landed cost calculated
Profitability Intelligence Engine (new — THE BRAIN)
    ↓ calculates: can we make money?
    ↓ decides: how much to spend on content?
    ↓ decides: which platform to sell on?
    ↓ decides: what price to set?
    ↓ decides: which social platform to promote on?
    ↓ decides: max budget per influencer?
Content/Marketing Engine (new)
    ↓ only creates content for profitable products
    ↓ allocates budget per Profitability Engine recommendation
Sales (your stores)
    ↓ performance data feeds back
Profitability Engine (learns and adjusts)
```

### What It Calculates

```
INPUTS:
  buy_price          ← from Purchasing Engine (best supplier)
  shipping_cost      ← from supplier + shipping API
  customs_estimate   ← HS code lookup
  platform_fees      ← known rates per platform
  niche_avg_cpc      ← from ad workers (Facebook/TikTok ads data)
  niche_avg_cpm      ← from ad workers
  niche_conv_rate    ← from content_performance data (or industry avg)
  content_cost       ← tracked per piece in generated_content table
  trend_score        ← from existing scoring engine
  viral_score        ← from existing scoring engine
  competitor_price   ← from product scraping (existing)

CALCULATIONS:
  landed_cost = buy_price + shipping + customs + platform_fee

  marketing_cost_per_sale = (niche_avg_cpc / niche_conv_rate)
                          + (content_cost / est_sales_per_content_piece)

  total_cost_per_sale = landed_cost + marketing_cost_per_sale

  min_selling_price = total_cost_per_sale / (1 - target_margin)

  optimal_selling_price = MAX(min_selling_price, competitor_price × 0.95)

  actual_margin = (optimal_selling_price - total_cost_per_sale) / optimal_selling_price

OUTPUTS:
  recommended_selling_price   → used in store listings
  estimated_margin            → displayed on product cards
  marketing_budget_per_product → allocated to content engine
  platform_recommendation     → "Sell on TikTok Shop (23% margin) not Amazon (8% margin)"
  content_priority            → HIGH / MEDIUM / LOW / SKIP
  influencer_max_cpa          → max spend per influencer conversion
  viability_verdict           → STRONG / MODERATE / WEAK / NOT_VIABLE
```

### How It Guides the Marketing/Content Engine

| Profitability Verdict | Content Action | Budget Action |
|----------------------|---------------|---------------|
| **STRONG** (margin ≥50%) | Generate 3 reel variations + 5 image sets + avatar reel | Allocate high budget, promote on all platforms |
| **MODERATE** (margin ≥30%) | Generate 1 reel + 3 image sets | Allocate medium budget, promote on best 2 platforms |
| **WEAK** (margin ≥15%) | Generate 1 image set only | Low budget, organic only (no paid promotion) |
| **NOT_VIABLE** (margin <15%) | **Skip content entirely** | $0 — auto-archive product |

This means the Content Engine **never wastes money** creating content for products that can't make money.

---

## n8n Template Savings Analysis

### Templates Available for Free (from n8n.io/workflows)

| Need | Free Templates Available | Dev Time Saved |
|------|------------------------|---------------|
| Multi-platform content posting | 490+ social media templates | ~1 session |
| AI content generation | Template #3066, #3135 | ~0.5 session |
| AI video + auto-post | Template #5035 | ~0.5 session |
| TikTok/IG/FB/YT publishing | Template #7187, #2894 | ~0.5 session |
| Email drip sequences | Dozens of email templates | ~0.5 session |
| Webhook handling | Many webhook templates | ~0.5 session |
| **Total dev time saved** | | **~3.5 sessions** |

### What Still Needs Custom Building

| Workflow | Why No Template Exists | Estimated Dev |
|----------|----------------------|---------------|
| Supplier Discovery Pipeline | Custom business logic | 1 session |
| Profitability Intelligence Engine | Unique to YOUSELL | 1.5 sessions |
| Content-Profitability Bridge | Connects our engines | 0.5 session |
| Performance Feedback Loop | Custom metrics → template scoring | 0.5 session |
| **Total custom dev** | | **3.5 sessions** |

**Net result**: 7 n8n sessions needed total (3.5 template-based + 3.5 custom) vs 9+ if everything was from scratch.

---

## Updated Content Volume (Blotato-Based)

| Content Type | Volume/Month | Platform | Tool | Est. Cost |
|-------------|-------------|----------|------|-----------|
| Faceless product reels (15-30s) | 60 (2/day) | TikTok, IG Reels, YT Shorts | Blotato AI video | Included in $29 |
| AI avatar reels (30-60s) | 20 (5/week) | TikTok, IG Reels | HeyGen Creator | $29/mo |
| Product images / carousels | 90 (3/day) | Instagram, Facebook, Pinterest | Blotato AI images | Included in $29 |
| Voiceover clips | 30 (1/day) | Layered on reels | Blotato (ElevenLabs built-in) | Included in $29 |
| AI-written captions + scripts | All posts | All platforms | Anthropic Haiku via n8n | ~$5/mo |
| **Total** | **~200 pieces/mo** | 5+ platforms | | **~$63/mo** |

---

## Break-Even Analysis (Config C)

| Metric | Value |
|--------|-------|
| Config C monthly cost | $291 |
| Average product profit (after all costs) | ~$12-18/product |
| Products needed to break even | **17-25 products/mo** |
| Content pieces generated | ~200/mo |
| Time saved on content creation | ~40-60 hours/mo |
| Time saved on supplier research | ~10-15 hours/mo |
| Time saved on pricing decisions | ~5-10 hours/mo |
| **Total time saved** | **~55-85 hours/mo** |

**If you sell 20+ products/month across 3 stores, the system pays for itself.**

The Profitability Engine ensures you're only spending marketing budget on products that can actually generate this return.

---

## Risk Assessment (Updated for Config C)

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AliExpress/Alibaba scraper breaks | Supplier data stops | TopDawg API as fallback (always available) |
| TopDawg API changes | US dropship data stops | AliExpress US warehouse suppliers as fallback |
| Blotato goes down | Content pipeline stops | Buffer: generate 1 week ahead. Fallback: manual posting |
| HeyGen API changes | Avatar reels stop | Blotato has basic video; avatar reels become faceless |
| Profitability estimates wrong | Bad pricing decisions | Flag ALL prices as "estimated". Manual override always available. Weekly accuracy review. |
| Content quality issues | Bad posts go live | Human review queue ON by default. Auto-post only after 2 weeks of approved content |
| n8n template breaks after update | Workflow fails | Pin n8n version. Test workflows before updating. |
| Cost overrun | Budget exceeded | Redis budget enforcement per service per day. Hard caps. Daily spend alert. |

---

## Final Recommendation

### Use Config C ($291/mo)

**Why not Config A ($139/mo)?**
- No purchasing intelligence = can't estimate margins = flying blind
- No content engine = manual content creation (40-60 hours/mo wasted)
- No profitability engine = no intelligent pricing, no marketing budget allocation

**Why not Config B ($415/mo)?**
- Overkill for 1 user — 4 purchasing hubs when 2 platforms cover 90% of suppliers
- 4 separate content services when Blotato bundles them all
- Custom publishing code when Blotato has an n8n node
- Missing the Profitability Engine (the most important piece)

**Why Config C ($291/mo)?**
- Focused: 2 supplier platforms + TopDawg covers dropship + wholesale
- Efficient: Blotato replaces 4 services at lower cost
- Smart: Profitability Engine prevents waste — only makes content for profitable products
- Fast: n8n free templates save ~3.5 dev sessions
- $124/mo cheaper than Config B with BETTER intelligence (Profitability Engine)

### Phased Rollout (Revised)

| Month | Add | Running Cost | Why This Order |
|-------|-----|-------------|---------------|
| 1-2 | Config A (core platform — TikTok MVP) | $139/mo | Validate product discovery works |
| 3 | + Purchasing Engine (AliExpress + Alibaba + TopDawg) | $220/mo | Start seeing margins on products |
| 3 | + Profitability Intelligence Engine (no extra cost) | $220/mo | The brain — guides all decisions |
| 4 | + n8n (self-hosted) + content templates | $228/mo | Automate supplier pipeline + alert routing |
| 5 | + Content Engine (Blotato + HeyGen) | $291/mo | Full automation — content for profitable products only |

---

*Prices based on March 2026 published rates. Actual costs may vary.*
*All costs exclude VAT/tax.*
*Supplier data and margin calculations are always estimates — never guaranteed figures.*

### Sources
- [TopDawg Membership Pricing](https://topdawg.com/dropshipping/companies-platform/membership-pricing)
- [TopDawg API Integration](https://topdawg.com/dropshipping/companies-platform/custom-integration-api-csv)
- [Blotato Pricing](https://www.blotato.com/pricing)
- [Blotato n8n Templates](https://help.blotato.com/api/templates)
- [n8n Marketing Automation Workflows](https://n8n.io/workflows/categories/marketing/)
- [n8n Multi-Platform Content Creation](https://n8n.io/workflows/3066)
- [n8n Auto-Post AI Videos](https://n8n.io/workflows/5035)
- [n8n Content Publishing Factory](https://n8n.io/workflows/3135)
- [n8n TikTok/YT/IG/FB Publishing via Blotato](https://n8n.io/workflows/7187)
- [Apify AliExpress Scraper](https://apify.com/sovereigntaylor/aliexpress-product-scraper)
- [Railway Pricing](https://railway.com/pricing)
- [HeyGen Pricing](https://www.heygen.com/pricing)
- [Self-Hosting n8n on Railway Guide](https://thinkpeak.ai/self-hosting-n8n-on-railway/)
