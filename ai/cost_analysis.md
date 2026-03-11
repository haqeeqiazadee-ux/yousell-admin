# YOUSELL Platform — Full Cost Analysis (March 2026)

> **Scenario**: 1 solo user running TikTok + Amazon + Shopify stores
> **Two configurations**: (A) Current system without n8n, (B) With n8n + Purchasing Engine + Content Engine

---

## Configuration A — Current System (No n8n, No Purchasing/Content Engines)

### Infrastructure Costs

| Service | Plan | Monthly Cost | What It Covers |
|---------|------|-------------|----------------|
| **Supabase** | Pro | $25 | PostgreSQL, Auth, Realtime, 8GB storage, 100K MAUs, PITR |
| **Railway** (Express backend) | Hobby | ~$10 | Node.js API server, low traffic 1 user |
| **Railway** (Redis) | Hobby (shared) | ~$5 | BullMQ queues, budget tracking, freshness cache |
| **Railway** (BullMQ workers) | Hobby | ~$8 | Worker processes, intermittent compute |
| **Netlify** | Free | $0 | Next.js frontend, 100GB bandwidth, 300 build mins |
| **Domain + DNS** | — | ~$1 | Custom domain annual cost amortised |
| **Subtotal** | | **~$49/mo** | |

### External API Costs

| Service | Usage Estimate (1 user) | Monthly Cost | Notes |
|---------|------------------------|-------------|-------|
| **Apify** (TikTok scraping) | Starter plan + overages | ~$49 | tiktok_discovery (6h), hashtag, creator, video workers |
| **Apify** (Amazon scraping) | Included in Starter | ~$0 | amazon_bsr_scanner shares Starter allocation |
| **Apify** (Shopify scraping) | Included in Starter | ~$0 | shopify_discovery shares Starter allocation |
| **Apify overages** | Extra compute units | ~$15 | Burst scraping, on-demand triggers, supplementary workers |
| **Anthropic Claude API** | Haiku for batch, Sonnet for complex | ~$30 | Predictive engine (12 calls/day × 30), profitability scorer, briefings |
| **Resend** | Free tier | $0 | 3,000 emails/mo — plenty for 1 user alerts + outreach |
| **Stripe** | Transaction fees only | ~$0* | No subscription revenue yet (self-use) |
| **SerpAPI** (Google Trends) | Free tier (100 searches/mo) | $0 | google_trends_worker |
| **YouTube Data API** | Free quota | $0 | 10,000 units/day free |
| **Reddit API** | Free tier | $0 | reddit_trend_worker (P2 idle only) |
| **Pinterest API** | Free | $0 | pinterest_trend_worker (P2 idle only) |
| **Subtotal** | | **~$94/mo** | |

### Anthropic Claude API — Detailed Breakdown

| Use Case | Model | Calls/Day | Avg Tokens/Call | Monthly Cost |
|----------|-------|-----------|-----------------|-------------|
| Predictive engine (batch 50 products) | Haiku 4.5 | 12 | ~2K in / 1K out | ~$7 |
| Platform profitability scorer | Sonnet 4.5 | 5 | ~3K in / 2K out | ~$8 |
| Daily AI briefing | Sonnet 4.5 | 1 | ~5K in / 3K out | ~$4 |
| Creator outreach emails | Haiku 4.5 | 3 | ~1K in / 500 out | ~$2 |
| Ad-hoc AI rationale | Sonnet 4.5 | 2 | ~2K in / 1K out | ~$5 |
| **Subtotal** | | | | **~$26/mo** |

*Note: Using Batch API (50% discount) for predictive engine brings this to ~$20/mo.*

### Configuration A — Total

| Category | Monthly Cost |
|----------|-------------|
| Infrastructure | $49 |
| External APIs | $94 |
| **TOTAL** | **~$143/mo** |

**Annual cost: ~$1,716/year**

---

## Configuration B — With n8n + Purchasing Engine + Content Engine

### Everything from Configuration A, plus:

### n8n Automation Layer

| Item | Plan | Monthly Cost | What It Handles |
|------|------|-------------|-----------------|
| **n8n** (self-hosted on Railway) | Community (free software) | ~$8 | Outreach sequences, alert routing, dunning, webhook delivery |
| **n8n** alternative: Cloud Starter | Starter | €24 (~$26) | If you prefer managed — 2,500 executions/mo |

*Recommendation: Self-host on Railway for $8/mo. 1 user won't hit execution limits.*

### Purchasing Engine — New Costs

| Service | Usage Estimate | Monthly Cost | Purpose |
|---------|---------------|-------------|---------|
| **Apify** (AliExpress scraper) | ~2,500 products/mo @ $0.004/product | ~$10 | Supplier discovery, price monitoring |
| **Apify** (Amazon wholesale) | Included in upgraded plan | ~$0 | Amazon FBA wholesale price comparison |
| **Apify** (Alibaba/1688 scraper) | ~1,000 products/mo | ~$8 | Wholesale MOQ, volume pricing |
| **Apify plan upgrade** | Scale ($199) to cover all scraping | +$150 | Upgrading from Starter ($49) to Scale ($199) |
| **Shipping cost APIs** | Free tiers (easyship, shippo) | $0 | Shipping estimation from CN/EU/UK/US hubs |
| **Currency conversion API** | Free tier (exchangerate-api) | $0 | Multi-currency cost normalisation |
| **Subtotal** | | **~$168/mo** | *(net new: $168 — but $150 is Apify upgrade)* |

*Note: The Apify upgrade from Starter ($49) to Scale ($199) covers ALL scraping — TikTok, Amazon, Shopify, AND purchasing. So the net increase is $150 for the plan upgrade + $18 for additional purchasing-specific compute.*

### Content Creation Engine — New Costs

| Service | Usage Estimate | Monthly Cost | Purpose |
|---------|---------------|-------------|---------|
| **HeyGen** (AI avatar reels) | Creator plan | $29 | AI model reels — avatar speaks about product |
| **Runway ML** (faceless video) | Standard plan (625 credits) | $12 | B-roll, product showcase clips, transitions |
| **Flux/BFL API** (product images) | ~500 images/mo @ $0.04 | ~$20 | Product images, carousel graphics, thumbnails |
| **ElevenLabs** (voiceover) | Starter plan | $5 | Voiceover for faceless reels |
| **Anthropic** (content scripts) | Additional Haiku calls | ~$5 | Script generation, hooks, captions, hashtags |
| **Social posting API** | Post for Me or Postiz (self-hosted) | ~$10 | Auto-post to TikTok, Instagram, Facebook, YouTube |
| **Subtotal** | | **~$81/mo** | |

### Content Volume Estimate (1 user, 3 stores)

| Content Type | Volume/Month | Platform | Cost Driver |
|-------------|-------------|----------|-------------|
| Faceless product reels (15-30s) | 60 (2/day) | TikTok, IG Reels, YT Shorts | Runway ($12) |
| AI avatar reels (30-60s) | 20 (5/week) | TikTok, IG Reels | HeyGen ($29) |
| Product images / carousels | 90 (3/day) | Instagram, Facebook, Pinterest | Flux ($20) |
| Voiceover clips | 30 (1/day) | Layered on faceless reels | ElevenLabs ($5) |
| AI-written captions + scripts | All posts | All platforms | Anthropic ($5) |

### n8n Workflow Breakdown

| Workflow | Trigger | Actions | Execution Frequency |
|----------|---------|---------|-------------------|
| Outreach drip (3 emails) | New creator match | Wait → Send → Check open → Branch | ~50/mo |
| Alert routing | Score threshold | Check severity → Route to email/Slack | ~100/mo |
| Dunning sequence | Stripe webhook | State machine → Email → DB update | ~5/mo |
| Webhook delivery | Product event | HMAC sign → POST → Retry on fail | ~200/mo |
| Content pipeline | New trending product | Script → Image gen → Video gen → Schedule post | ~90/mo |
| Supplier check | New product scored >70 | Scrape AliExpress → Scrape Alibaba → Calculate margin | ~60/mo |
| **Total executions** | | | **~505/mo** |

*Well within n8n self-hosted (unlimited) or Cloud Starter (2,500/mo).*

### Configuration B — Total

| Category | Monthly Cost |
|----------|-------------|
| Infrastructure (same as A) | $49 |
| n8n (self-hosted on Railway) | $8 |
| External APIs — base (upgraded Apify Scale) | $229 |
| Anthropic (increased usage) | $35 |
| Purchasing engine (AliExpress + Alibaba compute) | $18 |
| Content creation (HeyGen + Runway + Flux + ElevenLabs) | $66 |
| Social posting API | $10 |
| Resend | $0 |
| **TOTAL** | **~$415/mo** |

**Annual cost: ~$4,980/year**

---

## Side-by-Side Comparison

| | Config A (Current) | Config B (Full Stack) | Delta |
|---|---|---|---|
| **Monthly cost** | ~$143 | ~$415 | +$272/mo |
| **Annual cost** | ~$1,716 | ~$4,980 | +$3,264/yr |
| Infrastructure | $49 | $57 | +$8 |
| Scraping (Apify) | $64 | $217 | +$153 |
| AI APIs (Anthropic) | $26 | $35 | +$9 |
| Content creation | $0 | $66 | +$66 |
| Social posting | $0 | $10 | +$10 |
| n8n | $0 | $8 | +$8 |
| Other APIs | $4 | $22 | +$18 |

---

## What You Get for the Extra $272/mo

### Purchasing Engine Value
- Auto-discovers cheapest suppliers across AliExpress, Alibaba/1688, Amazon wholesale
- Calculates landed cost: product + shipping + customs + platform fees
- Margin estimation per product per platform (TikTok Shop vs Amazon FBA vs Shopify)
- Automatically flags products where margin < 30% as "not viable"
- Covers 4 purchasing hubs: China, EU, UK, USA
- Dropshipping vs wholesale comparison per product

### Content Engine Value
- ~60 faceless reels/month auto-generated from trending product data
- ~20 AI avatar reels/month for higher engagement
- ~90 product images/month for carousels and stories
- Auto-posted to all platforms (TikTok, IG, Facebook, YouTube, Pinterest)
- Scripts + captions + hashtags generated by AI from viral trend analysis
- Copies viral content patterns automatically

### n8n Automation Value
- Replaces ~2 coding sessions worth of custom orchestration
- Visual workflow editor for non-technical adjustments
- Outreach drip campaigns without custom BullMQ delayed jobs
- Alert routing to multiple channels without code
- Content pipeline orchestration (script → image → video → post)

---

## Cost Optimisation Opportunities

| Strategy | Potential Savings | Notes |
|----------|------------------|-------|
| Anthropic Batch API (50% off) | -$13/mo | Use for predictive engine + content scripts |
| Anthropic prompt caching | -$5/mo | Cache repeated product analysis contexts |
| Runway annual plan | -$4/mo | $96/yr vs $144/yr |
| HeyGen annual plan | -$5/mo | $24/mo vs $29/mo |
| Self-host Postiz (open-source) | -$10/mo | Free social posting, self-hosted on Railway |
| Apify startup discount (30% off Scale) | -$60/mo | If eligible (<20 employees) |
| **Total potential savings** | **-$97/mo** | Reduces Config B to ~$318/mo |

---

## Break-Even Analysis

| Metric | Value |
|--------|-------|
| Config B monthly cost | $415 |
| Config B optimised | ~$318 |
| Products needed to break even (at $15 avg profit/product) | 22-28 products/mo |
| Content posts generated | ~170/mo |
| Time saved on content creation | ~40-60 hours/mo |
| Time saved on supplier research | ~15-20 hours/mo |

**If you sell 25+ products/month across your 3 stores, the system pays for itself.**

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Apify actor breaks (site changes) | Scraping stops | Circuit breakers + fallback actors + alert |
| HeyGen/Runway API changes | Content pipeline breaks | n8n makes swapping providers easy (change 1 node) |
| Content quality issues | Bad posts go live | Human review queue before auto-posting |
| Supplier data accuracy | Bad margin estimates | Flag as "estimated" + manual verification workflow |
| API cost overrun | Budget exceeded | Redis budget enforcement + daily spend alerts |

---

## Recommendation

**Start with Configuration A ($143/mo)** to validate the core product discovery + scoring engine.

**Add Purchasing Engine first** (+$168/mo) — this directly impacts profitability decisions and has immediate ROI.

**Add Content Engine last** (+$81/mo) — once you have products worth promoting, automate the content.

**Add n8n** (+$8/mo) — when you're ready for outreach sequences and content pipeline orchestration.

### Phased Rollout

| Month | Add | Running Cost |
|-------|-----|-------------|
| Month 1-2 | Config A (core platform) | $143/mo |
| Month 3 | + Purchasing Engine | $311/mo |
| Month 4 | + n8n automation | $319/mo |
| Month 5 | + Content Engine | $415/mo |

---

*Prices based on March 2026 published rates. Actual costs may vary based on usage patterns.*
*All costs exclude VAT/tax.*
