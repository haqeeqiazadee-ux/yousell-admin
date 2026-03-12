# YOUSELL PLATFORM — Definitive Agency Blueprint
## Fully Automated E-Commerce Sales & Marketing Agency
### Strategic Architecture Decision Document v1.0

**Date:** 2026-03-11
**Author:** AI Systems Architect
**Scope:** Engine 1 (Purchasing) + Engine 2 (Profitability) + Engine 3 (Content & Marketing)
**Budget Ceiling:** ~$300/month total (~$160 available for new engines)

---

# PART 1: TOOL SELECTION ANALYSIS

---

## ENGINE 1 — PURCHASING ENGINE

### Tool Evaluation

| Platform | Monthly Cost | API? | Per-Query Cost | Product Count | n8n Integration | Verdict |
|----------|-------------|------|---------------|---------------|----------------|---------|
| **CJDropshipping** | **$0** | **Yes (REST, documented)** | **Free (1K req/day)** | Millions | HTTP Request | **PRIMARY** |
| **AliExpress (Official Affiliate API)** | **$0** | **Yes (REST, free)** | **Free (rate-limited ~5K/day)** | **100M+** | HTTP Request | **CO-PRIMARY** |
| AliExpress (Apify fallback) | $0 (free tier) + ~$0.004/result | Via Apify | ~$4/1000 products | 100M+ | Via Apify node | FALLBACK |
| TopDawg | $35/mo (Premier for API) | Yes (gated) | Included | 500K+ US | HTTP Request | REJECTED |
| Alibaba (Apify) | Apify compute costs | Via Apify | ~$3-5/1000 | Millions (wholesale) | Via Apify node | OPTIONAL (P2) |
| Spocket | $39/mo+ | Limited | N/A | 100K+ | None | REJECTED |
| Zendrop | $49/mo+ | Limited | N/A | Unknown | None | REJECTED |

### My Recommendation: CJDropshipping + AliExpress Official API (Dual Primary) + Apify Fallback

**Why CJDropshipping as co-primary:**
1. **FREE API** with full product search, pricing, and supplier data — no monthly fee
2. **Well-documented REST API** at developers.cjdropshipping.com with Elasticsearch-powered product search (v2)
3. Supports keyword search with filters (price range, category, country)
4. Returns: product price, shipping costs by destination, supplier info, images, variants
5. Global warehouses (CN, US, Thailand, Germany, Indonesia) — reduces shipping time estimates
6. No MOQ — perfect for dropshipping validation
7. Rate limit: 1,000 requests/day (sufficient for ~30-50 product lookups/day)

**Why AliExpress Official Affiliate API as co-primary:**
1. **FREE API** — still available at portals.aliexpress.com, no subscription fee
2. Largest product catalog (100M+ products)
3. Returns: product ID, title, images, variants, prices, discounts, ratings, reviews, shipping info, store info, sales volume
4. Rate limit: ~5,000 requests/day — generous for automated lookups
5. Endpoints: `aliexpress.affiliate.productdetail.get`, product search, hot products
6. Provides pricing comparison data to cross-validate CJ prices

**Apify as fallback (when official APIs fail or for edge cases):**
1. AliExpress Product Scraper (sovereigntaylor): $0.004/result
2. Covers scenarios where official API rate limits are hit
3. Free tier ($5/mo credits) covers ~1,000 product lookups/month

**What I explicitly rejected and why:**
- **TopDawg ($35-140/mo):** API gated behind Scale/Premier membership ($35-140/mo). While it returns a useful `cost` (wholesale price) field, CJDropshipping + AliExpress provide the same data for free.
- **Spocket ($39/mo):** No proper API, expensive, smaller catalog. Not worth the cost for approximate price lookups.
- **Zendrop ($49/mo):** Same issues as Spocket. Premium pricing without premium API access.
- **Alibaba/1688:** Good for wholesale/MOQ research but not needed for initial cost estimation. Added as optional P2 expansion. Most products found on AliExpress also exist on Alibaba.

**Engine 1 Monthly Cost: $0** (CJDropshipping API is free, AliExpress covered by Apify free tier)

---

## ENGINE 2 — PROFITABILITY INTELLIGENCE ENGINE

### No External Tools Needed

This engine is pure logic + existing Claude API. No new paid services required.

**Components:**
- Cost calculation: JavaScript/TypeScript logic in Express workers
- AI decision-making: Anthropic Claude API (already in stack)
  - Haiku for batch viability assessment (~$0.001/product)
  - Sonnet for STRONG product deep analysis (~$0.01/product)
- Database: Supabase PostgreSQL (already in stack)

**Estimated additional Claude API cost:** ~$5-10/mo for 2000-5000 product analyses/month

**Engine 2 Monthly Cost: ~$5-10** (incremental Claude API usage)

---

## ENGINE 3 — CONTENT CREATION & MARKETING ENGINE

This is the critical decision. Here is my definitive analysis.

### 3A. FACELESS VIDEO CREATION

| Tool | Monthly Cost | Videos/Mo (est.) | API? | n8n? | Quality | E-commerce Fit | Verdict |
|------|-------------|-----------------|------|------|---------|---------------|---------|
| **Blotato** | **$29** | **~40-60 (1250 credits)** | **Yes (REST)** | **Yes (native node)** | **Good** | **Excellent** | **PRIMARY** |
| Runway ML | $12 | ~12 (625 credits, 50cr/10s) | Yes | No native | Excellent | Poor (generic) | REJECTED |
| Flux/BFL API | ~$2-4/mo for 90 images | Pay-per-image | Yes | No native | Excellent images | Images only | SUPPLEMENTARY |
| InVideo AI | $28 | ~50 | Limited | No | Good | Good | REJECTED |
| Creatify | $39 (100 credits) | ~5-20 | Yes | No native | Excellent for ads | Excellent | TOO EXPENSIVE |
| Pippit | ~$20 | Unknown | Unknown | No | Good | Good (TikTok) | INSUFFICIENT DATA |
| VEO3 via API | ~$0.40/sec | Pay-per-use | Yes (Gemini API) | Yes (HTTP) | Excellent | Good | **CORE VIDEO GEN** |
| Kling AI | ~$5-10/mo | Varies | Yes (via fal.ai) | No native | Very Good | Good | ALTERNATIVE |

### 3B. AI AVATAR/PRESENTER CONTENT

| Tool | Monthly Cost | Videos/Mo | API? | n8n? | Lip-sync Quality | Verdict |
|------|-------------|----------|------|------|-----------------|---------|
| **HeyGen** | **$29** | **Unlimited (AvatarIII) / ~10-20 (AvatarIV)** | **Yes** | **Yes (community node + templates)** | **Best in class** | **PRIMARY** |
| NanoBanana + VEO3 | ~$5-15/mo | 10-30 short clips (8s) | Yes | Yes (#8270/#11204) | No lip-sync (cinematic only) | SUPPLEMENTARY (B-roll) |
| Creatify | $39-49/mo (100 credits) | ~5-25 | Yes (Pro only) | No native | Very good UGC-style | REJECTED (expensive, no n8n) |
| Synthesia | $18-89/mo | 3-30 min/mo | Yes | Yes (dedicated) | Good (corporate feel) | REJECTED (not UGC/TikTok style) |
| D-ID | $6-48/mo | 10+ min | Yes | No | Good | REJECTED (uncanny with poor sources) |

### The Critical Comparison: HeyGen vs NanoBanana+VEO3 (REVISED)

**IMPORTANT CORRECTION:** My initial analysis underestimated VEO3 costs for full-length presenter content. VEO3 generates **cinematic video** (product showcase, B-roll), NOT talking-head presenters with lip sync. For 30-60 second presenter reels, VEO3 Fast costs $4.50-9/video — making 20 videos = $90-180/month. This blows the budget and still doesn't produce lip-synced talking heads.

**HeyGen ($29/mo Creator) — REVISED ASSESSMENT:**
- **Avatar III: UNLIMITED videos** on all paid plans — decent quality, good enough for social media
- Avatar IV: 200 credits/month = ~10 minutes = 10-20 reels at 30-60 seconds each
- Best lip-sync quality in the market (Avatar IV), G2 rating 4.8/5
- **Dedicated n8n community node** + 6+ workflow templates (including product review automation)
- 175+ languages, natural micro-expressions, eye contact, gesture alignment
- API available as separate pay-as-you-go wallet ($5+ top-ups)
- Per-video cost (Avatar IV): ~$2-4 per 30-60 second reel

**NanoBanana + VEO3 — REVISED ASSESSMENT:**
- **NOT a talking-head/presenter tool** — generates cinematic product showcase video
- Excellent for product B-roll, lifestyle scenes, UGC-style product clips
- VEO3 Fast at $0.15/sec: 8-second clips = $1.20 each (good for short B-roll)
- Cost for full 30-60 second videos: $4.50-9/video (too expensive at 20/month volume)
- n8n templates (#8270, #11204) work well for short-clip production
- Best used as supplementary B-roll alongside HeyGen presenter content

**My revised verdict: HeyGen for talking-head content + NanoBanana+VEO3 for product B-roll.**

The winning strategy is a **hybrid approach**:
1. **HeyGen Avatar III (unlimited)** for the bulk of presenter content (~15-20 reels/month) — $29/mo flat
2. **HeyGen Avatar IV** for hero/flagship product reviews (5-10 reels from 200 credits) — included in $29
3. **NanoBanana + VEO3 (short clips)** for supplementary product B-roll and cinematic showcase clips — ~$5-10/mo
4. Total avatar/video budget: **~$34-39/month** (vs $135-180 for VEO3-only or $87+ for HeyGen Business)

**Why this hybrid wins:**
1. HeyGen Avatar III unlimited = no per-video cost anxiety for presenter content
2. Avatar IV for 5-10 premium reels gives best-in-class quality where it matters most
3. VEO3 short clips (8s, $1.20 each) add visual variety without breaking budget
4. HeyGen has a **dedicated n8n node** — better automation than HTTP-only
5. The n8n HeyGen templates already demonstrate the exact product-review-to-social-post pattern
6. HeyGen handles voiceover internally — potentially reduces ElevenLabs dependency

**What I explicitly rejected:**
- **Creatify ($39-49/mo):** URL-to-video is impressive but credits expire every 2 months, credit costs are unpredictable (2-20/video), no n8n integration, and API requires Pro plan ($49/mo minimum)
- **Synthesia ($18-89/mo):** Corporate/professional feel doesn't suit TikTok/Instagram UGC aesthetic. Express-2 avatars are good but not optimized for short-form social content
- **D-ID ($6-48/mo):** Quality depends heavily on source photo. Less expressive than HeyGen. Pricing transparency complaints

### 3C. PRODUCT IMAGES

| Tool | Monthly Cost | Images/Mo | Quality | Verdict |
|------|-------------|----------|---------|---------|
| **Nano Banana 2 (free tier)** | **$0** | **500/day = 15,000/mo** | **Excellent** | **PRIMARY** |
| Nano Banana Pro (API) | ~$2-4/mo for 90 images | Pay-per-image | Studio quality | For hero images |
| Flux/BFL API | ~$2-3/mo | Pay-per-image ($0.014-0.04) | Excellent | ALTERNATIVE |
| Imagen 4 (Google) | ~$1-2/mo | Pay-per-image ($0.02-0.06) | Very good | ALTERNATIVE |

**My verdict: Nano Banana 2 via Google AI Studio free tier.** 500 images/day is absurdly generous. Even at the API rate of $0.067/image, 90 images/month costs ~$6. But the free tier makes this effectively $0 for our volume.

For hero/flagship product images where quality matters most, Nano Banana Pro at $0.134/image — budget ~$2/mo for 15 hero images.

**Engine 3 Images Monthly Cost: ~$2** (hero images via Nano Banana Pro API, rest free)

### 3D. VOICEOVER

| Tool | Monthly Cost | Minutes/Mo | Quality | API? | n8n? | Verdict |
|------|-------------|-----------|---------|------|------|---------|
| **ElevenLabs** | **$5** | **~30 min** | **Best** | **Yes** | **Yes (native node)** | **PRIMARY** |
| OpenAI TTS | Pay-per-use | Unlimited | Good | Yes | Yes (native) | FALLBACK |
| Google Cloud TTS | Free tier | Limited | Good | Yes | Yes | BACKUP |
| Edge TTS (Microsoft) | Free | Unlimited | Decent | No official | No | NOT RECOMMENDED |
| Play.ht | $31/mo | Varies | Good | Yes | No | REJECTED (expensive) |

**My verdict: ElevenLabs Starter ($5/mo).** No contest:
1. 30,000 credits = ~30 minutes of audio/month — covers ~30 product voiceovers (1 min each)
2. Best voice quality in the market, indistinguishable from human
3. Voice cloning included — create a consistent brand voice
4. Commercial rights included
5. Native n8n node exists
6. Built into Blotato as well (dual integration path)

**Cost optimization:** Use **OpenAI TTS** (~$0.20/mo) for day-to-day product voiceovers via native n8n node (13 voices, very good quality, $15/1M characters). Reserve **ElevenLabs** for hero/showcase content where maximum naturalness matters. This brings effective voiceover cost to ~$5.20/month.

**Fallback:** Google Cloud TTS WaveNet (free tier: 1M characters/month — massive headroom)

**Engine 3 Voiceover Monthly Cost: $5**

### 3E. SOCIAL MEDIA PUBLISHING

| Tool | Monthly Cost | Platforms | API? | n8n? | Accounts | Verdict |
|------|-------------|----------|------|------|----------|---------|
| **Blotato** | **Included ($29)** | **9 platforms** | **Yes** | **Yes (native)** | **20** | **PRIMARY** |
| Postiz (self-hosted) | $0 | 17+ platforms | Yes | Via HTTP | Unlimited | SECONDARY |
| Ayrshare | $39/mo | Major platforms | Yes | Yes | 1-5 | REJECTED |
| Buffer | $6/mo per channel | Major platforms | Yes | Yes | Per channel | REJECTED |

**My verdict: Blotato handles publishing (included in the $29 content plan).**

Blotato's $29/mo Starter plan includes:
- Publishing to TikTok, Instagram, YouTube, Facebook, LinkedIn, Threads, X, Pinterest, Bluesky
- 20 social accounts (more than enough for 3 stores)
- Scheduling with optimal time slots
- Native n8n node for full automation

**Postiz as backup:** Self-hostable on Railway (one-click deploy template exists), 17+ platforms, full API + webhooks. Keep as fallback if Blotato has posting issues or if you outgrow 20 accounts. Cost: ~$10-20/mo self-hosted (Railway compute + Redis + PostgreSQL), not free. Only worth deploying if Blotato becomes a bottleneck.

**Engine 3 Publishing Monthly Cost: $0** (included in Blotato $29)

---

## COMPLETE TOOL STACK RECOMMENDATION

| Service | Purpose | Monthly Cost |
|---------|---------|-------------|
| **Existing platform** | Frontend, Backend, DB, Auth, etc. | $80 |
| **CJDropshipping API** | Primary supplier lookups | $0 |
| **AliExpress Affiliate API** | Co-primary supplier lookups | $0 |
| **Apify (free tier)** | Supplier lookup fallback | $0 |
| **Claude API (incremental)** | Profitability AI analysis | ~$8 |
| **Blotato Starter** | Faceless video + publishing | $29 |
| **HeyGen Creator** | AI avatar presenter reels | $29 |
| **VEO3 API (Google)** | Product B-roll short clips | ~$8 |
| **Nano Banana 2/Pro** | Product images (mostly free tier) | ~$2 |
| **ElevenLabs Starter** | AI voiceover (hero content) | $5 |
| **OpenAI TTS** | AI voiceover (day-to-day) | ~$0.20 |
| | | |
| **TOTAL** | | **~$161/month** |

**vs. Budget ceiling of $300/month — $139 under budget.**

This leaves a $139/month buffer for:
- Scaling HeyGen to Pro tier ($99) for more Avatar IV content
- Scaling VEO3 usage for longer product videos
- Adding Creatify ($39) for URL-to-video ad testing
- Scaling Apify for more supplier lookups
- Unexpected API costs

---

# PART 2: COMPLETE AGENCY BLUEPRINT

---

## 2A. Intelligence Flow

```
EXISTING PIPELINE
Product Discovery (14 scraping workers)
        ↓
Scoring Engine (trend 40% + viral 35% + profit 25%)
        ↓ triggers when final_score >= 60 (WARM/HOT)

ENGINE 1: PURCHASING ENGINE (Three-Phase Smart Sourcing)
        ↓
PHASE 1 — AUTO-DISCOVERY (fully automated)
        ↓
CJDropshipping API → search by title/keywords
   → Flag US warehouse products (2-5 day shipping) separately
        ↓
AliExpress Affiliate API → price validation/comparison
   → Flag "Choice" products (7-15 day shipping) separately
        ↓
Cost Calculator → preliminary landed cost per platform
   → Delivery-weighted scoring (penalizes slow shipping)
        ↓
Claude Haiku → preliminary viability screening
        ↓
Stores PRELIMINARY results in `product_costs` table (is_confirmed = false)
        ↓
PHASE 2 — SOURCING QUEUE (human-in-the-loop checkpoint)
        ↓
Products land in admin dashboard "Sourcing Queue"
   → Shows: auto-fetched prices, estimated margins, delivery times, supplier options
   → Admin can: Confirm / Override price / Add local supplier / Reject / Snooze
   → Admin inputs: actual_buy_price, actual_shipping_cost, actual_delivery_days, supplier_name
        ↓
On CONFIRM: system recalculates with confirmed prices (is_confirmed = true)
On REJECT: product archived, no marketing spend
On SNOOZE: stays in queue for later review
        ↓
PHASE 3 — CONFIRMED PRICING (recalculation with real numbers)
        ↓
Cost Calculator (re-run) → final landed cost per platform using confirmed prices
        ↓
Claude AI → final viability verdict using confirmed data
        ↓
Updates `profitability_analysis` with is_confirmed = true
        ↓
ONLY NOW triggers Engine 3 (content/marketing)
        ↓
No marketing dollars spent on unconfirmed pricing

ENGINE 2: PROFITABILITY INTELLIGENCE ENGINE (THE BRAIN)
        ↓
Reads: CONFIRMED product_costs + competitor_prices + platform_fees
   → Only processes products where is_confirmed = true
        ↓
Calculates: final gross margin per platform (using confirmed prices)
        ↓
Claude Haiku batch → final viability verdict (STRONG/MODERATE/WEAK/NOT_VIABLE)
        ↓
Claude Sonnet (STRONG only) → deep analysis + content strategy
        ↓
Outputs: pricing, marketing budget, platform selection, content priority
        ↓
Stores results in `profitability_analysis` table (is_confirmed = true)
        ↓
Gates Engine 3 (NOT_VIABLE = no content created)
        ↓
NOTE: Engine 2 runs TWICE — once in Phase 1 (preliminary) and once
      in Phase 3 (confirmed). The preliminary run informs the human
      reviewer. The confirmed run triggers marketing.

ENGINE 3: CONTENT & MARKETING ENGINE (Two-Stage with Human Gate)
        ↓
STAGE A — MARKETING PLAN GENERATION (automated)
        ↓
Claude Sonnet: Generate complete marketing plan
  → Content pieces (scripts, image prompts, voiceover text)
  → Budget allocation (per content type + paid promotion)
  → Platform strategy (where + when to post)
  → Messaging strategy (angles, audience, urgency hooks)
  → Timeline (production schedule)
  → Estimated ROI
        ↓
MARKETING APPROVAL QUEUE (human checkpoint)
  → Admin reviews complete plan in dashboard
  → Actions: Approve / Modify / Reject / Hold
  → Can edit scripts, remove pieces, adjust budgets
  → ONLY after approval does production begin
        ↓
STAGE B — CONTENT PRODUCTION (fires after approval)
        ↓
Faceless Reels: Blotato API → AI video from product data
Avatar Reels: HeyGen API → lip-synced presenter videos
Product B-Roll: NanoBanana + VEO3 → cinematic short clips
Product Images: Nano Banana 2 (free tier) / Pro (hero images)
Voiceover: OpenAI TTS (day-to-day) + ElevenLabs (hero)
        ↓
Content Assembly → combine video + voiceover + B-roll
        ↓
Human Review Queue (default) / Auto-post (trusted toggle)
        ↓
Blotato Publishing → TikTok, IG, FB, YT Shorts, Pinterest
        ↓
Performance Tracking → views, likes, shares, CTR, engagement
        ↓
FEEDBACK LOOP
        ↓
Performance data feeds back to Engine 2
        ↓
Engine 2 recalibrates: budget allocation, content type selection,
platform weighting, scoring model adjustment
```

### Decision Points: Autonomous vs Human Input

| Decision | Autonomous? | Human Override? | Phase |
|----------|------------|----------------|-------|
| Supplier lookup trigger | Yes (score >= 60) | Manual trigger for any product | Phase 1 |
| Auto price discovery | Yes (API-based) | — | Phase 1 |
| Preliminary cost calculation | Yes (formula-based) | — | Phase 1 |
| Preliminary viability screen | Yes (Claude AI) | — | Phase 1 |
| **Price confirmation** | **NO — requires human** | **Confirm / Override / Add local supplier** | **Phase 2** |
| **Supplier selection** | **NO — requires human** | **Choose supplier, input actual price + delivery time** | **Phase 2** |
| Final viability classification | Yes (Claude AI, confirmed data) | Override verdict | Phase 3 |
| Final pricing recommendation | Yes (algorithm, confirmed data) | Set price manually | Phase 3 |
| Content creation trigger | Yes (gated by CONFIRMED verdict) | Force content for any product | Phase 3 |
| **Marketing plan generation** | **Yes (Claude Sonnet AI)** | **—** | **Engine 3 Plan** |
| **Marketing plan approval** | **NO — requires human** | **Approve / Modify / Reject / Hold** | **Engine 3 Gate** |
| **Budget allocation** | **Yes (AI-recommended)** | **Modify in plan before approving** | **Engine 3 Gate** |
| Script finalization | Yes (from approved plan) | Edit individual scripts in plan | Engine 3 |
| Content production | Yes (after plan approved) | — | Engine 3 |
| Publishing | **No (human review default)** | Toggle to auto-post per account | Engine 3 |
| Performance tracking | Yes (automated ingestion) | Manual data correction | Feedback |

**The critical insight:** The system has TWO human checkpoints:
1. **Sourcing Queue (Phase 2):** Confirm pricing before any analysis money is spent
2. **Marketing Approval Queue (Engine 3):** Approve the complete marketing plan before any content/marketing money is spent

Between these checkpoints, the AI does maximum automated work — price discovery, cost calculation, viability analysis, marketing plan generation, budget allocation, script writing — so the admin's decisions are fast, informed, and based on complete data rather than guesswork.

### What The System Learns Over Time

1. **Margin accuracy:** Compares estimated vs actual margins, adjusts cost estimation multipliers
2. **Score-to-sales correlation:** Which scoring combinations actually predict sales
3. **Content type performance:** Which reel format/template drives highest conversion per niche
4. **Platform performance:** Which selling platform performs best per product category
5. **Posting time optimization:** When posts get most engagement per platform
6. **Template selection:** Which Blotato templates produce highest-converting content
7. **Voiceover style:** Which ElevenLabs voice/style gets best engagement

---

## 2B. n8n Workflow Architecture

### Workflow Registry

| # | Workflow Name | Phase | Trigger | Custom? | Services Used |
|---|-------------|-------|---------|---------|--------------|
| | **PHASE 1: Auto-Discovery** | | | | |
| W1 | Supplier Lookup (Multi-Source) | P1 | BullMQ webhook (score >= 60) | Yes | CJDropshipping, AliExpress, Apify |
| W2 | Cost Calculator (Preliminary) | P1 | W1 completion | Yes | Internal calculation |
| W3 | Profitability Screen (Preliminary) | P1 | W2 completion | Yes | Claude API (Haiku) |
| W3B | Sourcing Queue Placement | P1→P2 | W3 completion (ALL products) | Yes | Supabase, notifications |
| | **PHASE 2: Human Checkpoint** | | | | |
| — | Sourcing Queue (Dashboard UI) | P2 | Admin opens dashboard | Yes | Supabase Realtime |
| | **PHASE 3: Confirmed Pricing** | | | | |
| W3C | Confirmed Cost Recalculation | P3 | Admin confirms in Sourcing Queue | Yes | Internal calculation |
| W3D | Final Profitability Analysis | P3 | W3C completion | Yes | Claude API (Haiku/Sonnet) |
| | **ENGINE 3A: Marketing Plan** | | | | |
| W4 | Marketing Plan Generator | E3-Plan | W3D completion (confirmed, not NOT_VIABLE) | Yes | Claude API (Sonnet) |
| W4B | Marketing Approval Queue | E3-Gate | W4 completion | Yes | Supabase Realtime, notifications |
| — | (Dashboard UI: Approve/Modify/Reject) | E3-Gate | Admin action | Yes | Supabase |
| W4C | Plan Execution Trigger | E3-Gate | Admin approves plan | Yes | Supabase |
| | **ENGINE 3B: Content Production** | | | | |
| W5 | Faceless Video Pipeline | E3-Prod | W4C (approved faceless pieces) | Partial | Blotato API |
| W6 | Avatar Presenter Pipeline | E3-Prod | W4C (approved avatar pieces) | Partial | HeyGen API (n8n node) |
| W6B | Product B-Roll Pipeline | E3-Prod | W4C (approved B-roll pieces) | Partial | Nano Banana, VEO3 |
| W7 | Product Image Generator | E3-Prod | W4C (approved image sets) | Partial | Nano Banana 2/Pro |
| W8 | Voiceover Generator | E3-Prod | W4C (approved voiceover scripts) | Yes | ElevenLabs, OpenAI TTS |
| W9 | Content Assembly | E3-Prod | W5/W6/W6B/W7/W8 completion | Yes | FFmpeg, Blotato |
| W10 | Publishing Pipeline | E3-Pub | W9 completion OR manual trigger | Partial | Blotato (native node) |
| | **FEEDBACK & MONITORING** | | | | |
| W11 | Performance Tracker | — | Cron (every 6 hours) | Yes | Platform APIs, Supabase |
| W12 | Feedback Processor | — | Cron (weekly) | Yes | Claude API, Supabase |
| W13 | Budget Monitor | — | Cron (daily) | Yes | Supabase, alerts |

### Workflow Details

---

### PHASE 1 WORKFLOWS: Auto-Discovery (Fully Automated)

**W1: Supplier Lookup (Multi-Source + Delivery Intelligence)**
```
Trigger: Webhook from Express backend (product scored >= 60)
→ Extract product title, category, price range from product record

→ PARALLEL supplier search:
  → CJDropshipping API: Search by keyword
    → Extract: buy_price, shipping_cost, variants, supplier_rating
    → KEY: Check warehouse_country field
      → If "US" (CA/NJ/TX/IN): flag as LOCAL_SUPPLIER, delivery = 2-5 days
      → If "CN": flag as OVERSEAS_SUPPLIER, delivery = 10-20 days
    → Return multiple matches ranked by price + warehouse location

  → AliExpress Affiliate API: Search by keyword
    → Extract: price, ratings, sales_volume, shipping_info
    → KEY: Check for "Choice" badge → delivery = 7-15 days
    → Standard AliExpress → delivery = 15-30 days

→ IF both found: cross-reference and rank by DELIVERY-WEIGHTED SCORE
→ IF only one found: use available source
→ IF neither found: fallback to Apify AliExpress scraper

→ Delivery-Weighted Ranking Formula:
  effective_cost = buy_price + shipping_cost + (delivery_days × $0.50 penalty)

  Example:
  Option A: $4 buy + $2 ship + (14 days × $0.50) = $13.00 effective
  Option B: $6 buy + $3 ship + (3 days × $0.50)  = $10.50 effective ← WINS

  The $0.50/day penalty is configurable per product category.
  Fast-fashion/trending items: $1.00/day (time-sensitivity premium)
  Evergreen products: $0.25/day (less urgency)

→ Store ALL supplier options in product_costs table (is_confirmed = false)
  → Multiple rows per product — one per supplier option found
  → Include: supplier_source, warehouse_location, estimated_delivery_days
→ Flag best auto-selected option as is_auto_recommended = true
→ Trigger W2 via webhook
```

**W2: Cost Calculator (Preliminary)**
```
Trigger: Webhook from W1
→ Read product_costs records (all supplier options for this product)
→ For the auto-recommended option AND top 3 alternatives:
  → For each selling platform (TikTok Shop, Amazon FBA, Amazon FBM, Shopify):
    → Calculate: landed_cost = buy_price + shipping + (buy_price × customs_rate)
    → Calculate: platform_fee = selling_price × fee_rate
    → Calculate: payment_fee = selling_price × processing_rate + fixed_fee
    → Calculate: fulfillment_cost (FBA fee table OR shipping estimate)
    → Calculate: gross_margin = (selling_price - total_cost) / selling_price × 100
    → Calculate: delivery_adjusted_margin = gross_margin × delivery_factor
      → delivery_factor = 1.0 if delivery <= 5 days
      → delivery_factor = 0.85 if delivery 6-10 days
      → delivery_factor = 0.70 if delivery 11-15 days
      → delivery_factor = 0.50 if delivery > 15 days
→ Store per-platform cost breakdowns in product_costs table
→ Trigger W3 via webhook
```

**W3: Profitability Analysis (Preliminary — Phase 1)**
```
Trigger: Webhook from W2
→ Read product data + cost data (auto-recommended option) + competitor prices
→ IF highest delivery_adjusted_margin < 15%:
    → preliminary_verdict = NOT_VIABLE
    → Still add to Sourcing Queue (admin might know a better supplier)
    → Flag as "auto-screened: margins too low at discovered prices"
→ ELSE: Call Claude Haiku API with structured prompt
  → Input: product data, costs, competitor prices, category benchmarks, delivery times
  → Output: preliminary_verdict, recommended_price, estimated_marketing_budget,
            best_platform, content_priority, reasoning
  → NOTE: This is a PRELIMINARY verdict — subject to change after price confirmation
→ Store in profitability_analysis table (is_confirmed = false)
→ Add product to SOURCING QUEUE (W3B) for human review
→ DO NOT trigger Engine 3 yet
```

**W3B: Sourcing Queue Placement (NEW)**
```
Trigger: W3 completion (ALL products, including NOT_VIABLE)
→ Create sourcing_queue record:
  → product_id
  → auto_recommended_supplier (best option from W1)
  → all_supplier_options (array of all found options)
  → preliminary_verdict (from W3)
  → preliminary_best_margin (from W2)
  → preliminary_best_platform (from W3)
  → estimated_delivery_days (from W1)
  → queue_status = 'pending_review'
  → queued_at = now()
→ Send notification to admin:
  → Supabase Realtime → dashboard notification badge
  → Optional: email/Slack webhook for high-value products (final_score >= 80)
```

---

### PHASE 2: Sourcing Queue (Human-in-the-Loop)

**This is a dashboard UI, not an n8n workflow.**

The admin sees the Sourcing Queue in the YOUSELL dashboard and can:

```
FOR EACH product in sourcing_queue WHERE queue_status = 'pending_review':

DISPLAY:
  → Product: title, image, platform, final_score (from discovery)
  → Auto-Found Suppliers:
    → [1] CJ US Warehouse: $6.50 buy + $3.00 ship = $9.50 landed | 3 days | Margin: 62%
    → [2] CJ China:        $4.00 buy + $2.00 ship = $6.00 landed | 14 days | Margin: 71%
    → [3] AliExpress:       $3.80 buy + $1.50 ship = $5.30 landed | 18 days | Margin: 74%
    → [4] AliExpress Choice: $4.20 buy + $0 ship   = $4.20 landed | 10 days | Margin: 78%
  → Delivery-Adjusted Rankings (penalty applied):
    → [1] CJ US Warehouse: $11.00 effective → Adj. Margin: 62% ← RECOMMENDED
    → [4] AliExpress Choice: $9.20 effective → Adj. Margin: 66%
    → [2] CJ China:         $13.00 effective → Adj. Margin: 60%
    → [3] AliExpress:        $14.30 effective → Adj. Margin: 52%
  → AI Preliminary Verdict: STRONG (based on CJ US warehouse pricing)
  → AI Notes: "High demand + good margins + fast shipping available"

ADMIN ACTIONS:
  → [CONFIRM] — Accept auto-recommended supplier and price
      → Sets is_confirmed = true on selected product_cost record
      → Triggers Phase 3 (W3C)

  → [OVERRIDE PRICE] — Input manual price from a known supplier
      → Admin enters: supplier_name, buy_price, shipping_cost, delivery_days
      → Creates new product_cost record with source = 'manual_input'
      → Triggers Phase 3 (W3C) with manual data

  → [ADD LOCAL SUPPLIER] — Input a local/known supplier
      → Admin enters: supplier_name, contact_info, buy_price, shipping_cost,
                      delivery_days, moq, notes
      → Stores in local_suppliers table (builds a supplier database over time)
      → Creates new product_cost record with source = 'local_supplier'
      → Triggers Phase 3 (W3C) with local supplier data

  → [REJECT] — Not worth pursuing
      → queue_status = 'rejected'
      → product status = 'archived'
      → No marketing spend triggered

  → [SNOOZE] — Check again later
      → queue_status = 'snoozed'
      → snooze_until = admin-selected date
      → Re-appears in queue after snooze period

  → [BULK CONFIRM] — Confirm multiple products at once
      → For batch operations when auto-recommendations look good
      → Checkbox selection → Confirm All Selected
```

---

### PHASE 3 WORKFLOWS: Confirmed Pricing (Recalculation)

**W3C: Confirmed Cost Recalculation (NEW)**
```
Trigger: Admin confirms/overrides in Sourcing Queue (Supabase webhook or API call)
→ Read confirmed product_cost record (is_confirmed = true)
→ IF admin overrode price: recalculate all platform margins with new data
→ IF admin added local supplier: recalculate with local supplier data
→ IF admin confirmed auto-recommendation: use existing calculations
→ Update product_costs with confirmed values
→ Trigger W3D
```

**W3D: Final Profitability Analysis (Phase 3)**
```
Trigger: W3C completion
→ Read CONFIRMED cost data + competitor prices
→ IF highest margin < 15%: final_verdict = NOT_VIABLE
  → Notify admin: "Confirmed prices result in sub-15% margins"
  → Admin can: adjust price upward OR archive
→ ELSE: Call Claude Haiku with confirmed data
  → Input: confirmed costs, delivery time, competitor prices
  → Output: final_verdict, recommended_price, marketing_budget,
            best_platform, content_priority
→ IF final_verdict == STRONG: Escalate to Claude Sonnet
→ Store in profitability_analysis table (is_confirmed = true)
→ IF final_verdict != NOT_VIABLE: NOW trigger W4 (Engine 3 — Content)
→ THIS IS THE GATE: No marketing content created until human has confirmed pricing
```

---

### Legacy W3 Reference (REPLACED)

The old W3 was a single-pass fully-automated profitability analysis.
It has been replaced by the three-phase model above:
- W3 (Phase 1): Preliminary AI screening
- W3B: Sourcing Queue placement
- W3C (Phase 3): Confirmed cost recalculation
- W3D (Phase 3): Final profitability analysis → gates Engine 3

---

### ENGINE 3: Marketing Plan Generation + Human Approval

**W4: Marketing Plan Generator (REDESIGNED — formerly "Content Script Generator")**
```
Trigger: Webhook from W3D (confirmed verdict != NOT_VIABLE)
→ Read: confirmed profitability_analysis + product data + supplier data
→ Read: historical performance data (if any — from W12 feedback loop)
→ Read: current budget utilization (from W34 budget monitor)

→ Claude Sonnet: Generate COMPLETE marketing plan
  → Input:
    - Product: title, category, price, images, unique selling points
    - Confirmed margins per platform
    - Delivery time (affects urgency messaging)
    - Historical performance of similar products (if available)
    - Remaining monthly content budget
    - Current platform engagement rates

  → Output: marketing_plan (JSONB) containing:

    1. CONTENT STRATEGY
       → content_pieces: array of planned content items
         → For STRONG: 3 faceless scripts + 2 avatar scripts + image set + voiceover scripts
         → For MODERATE: 1 faceless script + 1 avatar script + image set
         → For WEAK: image set only
       → Each piece includes: type, script/prompt, target_platform, estimated_cost, rationale

    2. BUDGET ALLOCATION
       → total_marketing_budget: $ amount (from profitability analysis)
       → content_production_budget: breakdown per content type
         → faceless_video: $X (Blotato credits)
         → avatar_reel: $X (HeyGen credits — $0 for Avatar III, ~$2-4 for Avatar IV)
         → product_broll: $X (VEO3 Fast)
         → product_images: $X (~$0 for free tier, $0.13/hero)
         → voiceover: $X (OpenAI TTS ~$0.01 or ElevenLabs ~$0.10)
       → paid_promotion_budget: $ amount (if applicable)
       → influencer_budget: $ amount (if applicable, for STRONG only)
       → estimated_total_spend: sum of all above
       → estimated_ROI: projected based on similar product performance

    3. PLATFORM STRATEGY
       → primary_platform: best selling platform (from profitability)
       → content_platforms: where to post (TikTok, IG, YT Shorts, Pinterest, etc.)
       → posting_schedule: specific dates/times for each piece
       → platform_rationale: why these platforms for this product

    4. MESSAGING STRATEGY
       → key_angles: 2-3 marketing angles to test
       → target_audience: demographic + psychographic
       → urgency_hooks: based on delivery speed + trend velocity
         → Fast shipping (2-5 days): emphasize "Ships from US, arrives in days"
         → Trending product: emphasize "Selling fast, limited availability"
       → competitor_differentiation: how to position vs similar products

    5. TIMELINE
       → Day 1-2: Image generation + script finalization
       → Day 3-4: Video production (faceless + avatar)
       → Day 5: Content review (human or auto-approved)
       → Day 6-7: Staggered publishing across platforms
       → Day 8-14: Performance monitoring + optional boost

→ Store marketing_plan in marketing_plans table (status = 'pending_approval')
→ Add to Marketing Approval Queue (W4B)
→ DO NOT trigger content production yet
```

**W4B: Marketing Approval Queue (Human Checkpoint — NEW)**
```
Trigger: W4 completion
→ Create marketing_approval_queue record
→ Send notification to admin:
  → Supabase Realtime → dashboard notification
  → Optional: email summary of pending plans

THE ADMIN SEES IN THE DASHBOARD:

┌─────────────────────────────────────────────────────────────┐
│ MARKETING PLAN: [Product Title]                             │
│ Status: AWAITING APPROVAL                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ PRODUCT SUMMARY                                             │
│ Price: $24.99 | Cost: $6.50 (confirmed) | Margin: 58%      │
│ Supplier: CJ US Warehouse (3-day delivery)                  │
│ Verdict: STRONG | Best Platform: TikTok Shop                │
│                                                             │
│ CONTENT PLAN                                          Cost  │
│ ─────────────────────────────────────────────────────────── │
│ ☐ 3x Faceless Reels (30-45s each)                    $1.50 │
│   └─ Scripts: [expandable preview of each script]           │
│ ☐ 2x Avatar Presenter Reels (45-60s each)            $0.00 │
│   └─ Using: Avatar III (unlimited) | Scripts: [preview]     │
│ ☐ 1x Avatar IV Hero Reel (60s, premium quality)      $4.00 │
│   └─ Script: [expandable preview]                           │
│ ☐ Product B-Roll (2x 8s clips)                       $2.40 │
│ ☐ Product Image Set (6 images, free tier)             $0.00 │
│ ☐ 1x Hero Image (Nano Banana Pro)                    $0.13 │
│ ☐ Voiceover Clips (OpenAI TTS for 3, ElevenLabs 1)  $0.13 │
│                                                             │
│ BUDGET BREAKDOWN                                            │
│ ─────────────────────────────────────────────────────────── │
│ Content Production:     $8.16                               │
│ Paid Promotion:         $0.00 (organic first)               │
│ Influencer Outreach:    $15.00 (max CPA)                    │
│ ───────────────────────────────                             │
│ Total Estimated Spend:  $23.16                              │
│ Expected Revenue (30d): $125-250 (based on similar products)│
│ Projected ROI:          5.4x - 10.8x                        │
│                                                             │
│ PLATFORM STRATEGY                                           │
│ ─────────────────────────────────────────────────────────── │
│ Primary: TikTok (3 reels) → Instagram (2 reels) → Pinterest│
│ Schedule: Mon/Wed/Fri at 6pm EST (peak engagement)          │
│ Angles: "US shipping in 3 days" + "Trending on TikTok"     │
│                                                             │
│ AI REASONING                                                │
│ ─────────────────────────────────────────────────────────── │
│ "This product has strong trend signals (score 85) and       │
│  excellent margins at confirmed pricing. The fast US        │
│  shipping is a major competitive advantage — recommend      │
│  leading with delivery speed in all content. Avatar III     │
│  reels are free so we can produce volume. One Avatar IV     │
│  hero reel for the highest-quality piece."                  │
│                                                             │
│ ACTIONS                                                     │
│ ─────────────────────────────────────────────────────────── │
│ [✅ APPROVE PLAN]  — Start content production as planned    │
│ [✏️ MODIFY PLAN]   — Edit budget, remove content pieces,   │
│                      change platforms, adjust scripts        │
│ [❌ REJECT PLAN]   — Cancel marketing for this product      │
│ [⏸️ HOLD]          — Pause for later review                 │
│                                                             │
│ Quick toggles (within MODIFY):                              │
│ ☐ Remove Avatar IV hero reel (saves $4.00)                  │
│ ☐ Add paid TikTok boost ($10-50 budget)                     │
│ ☐ Change posting schedule                                   │
│ ☐ Edit individual scripts before production                 │
│ ☐ Change target platforms                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

ADMIN ACTIONS:
  → [APPROVE] — Sets plan status to 'approved'
    → Triggers W5/W6/W6B/W7/W8 content production workers
    → Content is produced according to the approved plan

  → [MODIFY] — Admin edits the plan
    → Can remove content pieces (unchecking items)
    → Can adjust budgets up/down
    → Can edit scripts directly
    → Can change platform selection
    → Modified plan saved → status = 'approved_modified'
    → Triggers content production with modifications

  → [REJECT] — No marketing for this product
    → status = 'rejected'
    → Product stays in database but no content produced
    → Admin can add notes (e.g., "seasonal — revisit in Q4")

  → [HOLD] — Pause for later
    → status = 'on_hold'
    → Stays in queue, can be revisited
    → Optional: set reminder date

  → [BULK APPROVE] — For batch operations
    → Select multiple plans → Approve All
    → Useful when plans look good and admin trusts AI recommendations
```

**W4C: Plan Execution Trigger (NEW)**
```
Trigger: Admin approves or modifies marketing plan
→ Read approved marketing_plan from marketing_plans table
→ Create content_queue records for each approved content piece
  → Each record references the marketing_plan_id
  → Each record includes: script, budget cap, target platform, priority
→ Trigger content production workers in parallel:
  → W5 (faceless videos) — for approved faceless content pieces
  → W6 (avatar reels) — for approved avatar content pieces
  → W6B (product B-roll) — for approved B-roll pieces
  → W7 (product images) — for approved image sets
  → W8 (voiceover) — for approved voiceover scripts
→ Track overall plan execution progress in marketing_plans table
```

---

### ENGINE 3: Content Production (fires only after W4B approval)

**W5: Faceless Video Pipeline (based on template #5035)**
```
Trigger: W4C (approved faceless content pieces)
→ Read approved script from content_queue
→ Blotato API: Create Visual (video template)
  → Input: script, product images, brand colors
  → Template: faceless product showcase
→ Poll for completion
→ Download rendered video
→ Update content_queue status → 'produced'
→ Queue for content assembly (W9)
```

**W6: Avatar Presenter Pipeline (HeyGen)**
```
Trigger: W4C (approved avatar content pieces, priority HIGH only)
→ Read avatar script from content_queue
→ Determine avatar tier:
  → STRONG + hero product: Avatar IV (premium, 20 credits/min)
  → STRONG + standard: Avatar III (unlimited, good quality)
→ HeyGen API (via n8n community node):
  → Create video from script + selected avatar
  → Format: 9:16 vertical, 30-60 seconds
  → Avatar speaks the script with lip sync + gestures
  → Built-in voiceover (HeyGen handles TTS internally)
→ Poll for completion → download rendered video
→ Queue for publishing (W10) or human review
```

**W6B: Product B-Roll Pipeline (NanoBanana + VEO3, based on template #8270)**
```
Trigger: W4C (approved B-roll pieces, priority HIGH, supplementary)
→ Nano Banana 2: Generate product lifestyle image (free tier)
→ VEO3 Fast API: Generate 8-second cinematic clip from image
  → Format: 9:16 vertical
  → Motion: product showcase, slow pan, lifestyle context
→ Download clip → store as supplementary B-roll asset
→ Can be combined with HeyGen presenter clips in content assembly
```

**W7: Product Image Generator (based on template #8226)**
```
Trigger: W4C (approved image sets, all content priorities)
→ Read image prompts from content_queue
→ FOR each image prompt:
  → Nano Banana 2 (free tier via Google AI Studio):
    → Generate product lifestyle image
    → Generate product on white background
    → Generate product in-use context image
  → IF hero image needed: Nano Banana Pro ($0.134 for 2K quality)
→ Store images in Supabase Storage
→ Queue for publishing (W10)
```

**W10: Publishing Pipeline (based on template #7187)**
```
Trigger: W9 completion OR manual approval from review queue
→ Read content from content_queue (status: approved)
→ Blotato node: Create Post
  → Platforms: TikTok, Instagram, YouTube Shorts, Facebook, Pinterest
  → Schedule: optimal posting times (Blotato auto-scheduling)
  → Stagger: 2-hour gaps between platforms
  → Captions: AI-generated (from W4), platform-optimized
  → Hashtags: AI-generated, trending + niche-specific
→ Record post IDs in published_content table
→ Schedule performance check (W11)
```

**W11: Performance Tracker**
```
Trigger: Cron every 6 hours
→ FOR each published_content record (last 30 days):
  → Blotato API: Get post analytics (if available)
  → Platform APIs (supplementary): views, likes, shares, comments
  → Calculate: engagement_rate, estimated_reach, CTR
→ Update content_performance table
→ IF any content has engagement_rate > 5%: Flag as "viral candidate"
→ IF any content has engagement_rate < 0.5% after 48h: Flag as "underperforming"
```

**W12: Feedback Processor**
```
Trigger: Cron weekly (Sunday midnight)
→ Aggregate performance data per product, per content type, per platform
→ Claude Haiku: Analyze patterns
  → Which niches perform best on which platform?
  → Which content templates drive highest engagement?
  → Which voiceover styles get most views?
→ Update scoring_adjustments table (feeds back to scoring engine)
→ Update template_performance table (feeds back to W4/W5/W6)
→ Generate weekly performance report → email via Resend
```

**W13: Budget Monitor**
```
Trigger: Cron daily (6 AM)
→ Check API spend across all services:
  → Google AI API usage (VEO3 + Nano Banana)
  → ElevenLabs credit usage
  → Blotato credit usage
  → Apify credit usage
  → Claude API usage
→ IF any service > 80% of monthly budget: Alert via email
→ IF any service > 95%: Pause non-critical workflows
→ Log daily spend in budget_tracking table
```

---

## 2C. Worker Registry

### New Workers (Beyond Existing 21)

| # | Worker Name | Queue | Phase | Trigger | Downstream | Purpose |
|---|-----------|-------|-------|---------|------------|---------|
| | **PHASE 1: Auto-Discovery** | | | | | |
| W22 | supplier_lookup_worker | intelligence_jobs | P1 | product scored >= 60 | W23 | CJ + AliExpress + delivery intelligence |
| W23 | cost_calculator_worker | intelligence_jobs | P1 | W22 completion | W24 | Preliminary cost + delivery-weighted scoring |
| W24 | profitability_screen_worker | intelligence_jobs | P1 | W23 completion | W24B | Preliminary AI viability screen |
| W24B | sourcing_queue_worker | intelligence_jobs | P1→P2 | W24 completion | — | Places product in Sourcing Queue for review |
| | **PHASE 2: Human Checkpoint** | | | | | |
| — | (Dashboard UI — no worker) | — | P2 | Admin action | W24C | Admin confirms/overrides/adds local supplier |
| | **PHASE 3: Confirmed Pricing** | | | | | |
| W24C | confirmed_cost_worker | intelligence_jobs | P3 | Admin confirms in queue | W24D | Recalculates with confirmed prices |
| W24D | final_profitability_worker | intelligence_jobs | P3 | W24C completion | W25 | Final AI verdict (gates Engine 3) |
| | **ENGINE 3A: Marketing Plan** | | | | | |
| W25 | marketing_plan_worker | content_jobs | E3-Plan | W24D (confirmed, not NOT_VIABLE) | W25B | Claude Sonnet marketing plan gen |
| W25B | marketing_queue_worker | content_jobs | E3-Gate | W25 completion | — | Places plan in approval queue |
| — | (Dashboard UI) | — | E3-Gate | Admin action | W25C | Admin approves/modifies/rejects |
| W25C | plan_execution_worker | content_jobs | E3-Gate | Admin approves plan | W26-W29 | Creates content_queue from plan |
| | **ENGINE 3B: Content Production** | | | | | |
| W26 | faceless_video_worker | content_jobs | E3-Prod | W25C (approved faceless) | W30 | Blotato video creation |
| W27 | avatar_presenter_worker | content_jobs | E3-Prod | W25C (approved avatar) | W30 | HeyGen avatar presenter reels |
| W27B | product_broll_worker | content_jobs | E3-Prod | W25C (approved B-roll) | W30 | NanoBanana + VEO3 B-roll clips |
| W28 | product_image_worker | content_jobs | E3-Prod | W25C (approved images) | W30 | Nano Banana image gen |
| W29 | voiceover_worker | content_jobs | E3-Prod | W25C (approved voiceover) | W30 | ElevenLabs + OpenAI TTS |
| W30 | content_assembly_worker | content_jobs | E3-Prod | W26-W29 completion | W31 | Combine assets |
| W31 | publishing_worker | publishing_jobs | E3-Pub | W30 OR manual approval | W32 | Blotato multi-platform post |
| | **FEEDBACK & MONITORING** | | | | | |
| W32 | performance_tracking_worker | analytics_jobs | — | Cron (6h) | W33 | Collect engagement data |
| W33 | feedback_processor_worker | analytics_jobs | — | Cron (weekly) | scoring engine | Learn from performance |
| W34 | budget_monitor_worker | system_jobs | — | Cron (daily) | alerts | Enforce spending limits |
| W35 | price_optimization_worker | intelligence_jobs | — | competitor price change | W24C | Re-evaluate pricing |

**Total new workers: 19** (added W24B, W24C, W24D for sourcing + W25B, W25C for marketing approval)
**Total workers (existing 21 + new 19): 40**

### New BullMQ Queues

| Queue | Priority Workers | Purpose |
|-------|-----------------|---------|
| intelligence_jobs | W22, W23, W24, W35 | Supplier + profitability pipeline |
| content_jobs | W25, W26, W27, W28, W29, W30 | Content creation pipeline |
| publishing_jobs | W31 | Social media publishing |
| analytics_jobs | W32, W33 | Performance tracking + learning |

---

## 2D. Database Schema

### New Tables

```sql
-- ENGINE 1: Purchasing (Three-Phase Smart Sourcing)

-- Stores ALL supplier options per product (multiple rows per product)
CREATE TABLE product_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Supplier identification
  supplier_platform TEXT NOT NULL, -- 'cjdropshipping', 'aliexpress', 'manual_input', 'local_supplier'
  supplier_product_id TEXT,
  supplier_url TEXT,
  supplier_name TEXT,            -- human-readable name (esp. for manual/local)
  supplier_source TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'manual_input', 'local_supplier'

  -- Pricing (auto-fetched or manually entered)
  buy_price DECIMAL(10,2),
  shipping_cost_us DECIMAL(10,2),
  shipping_cost_uk DECIMAL(10,2),
  shipping_cost_eu DECIMAL(10,2),
  moq INTEGER DEFAULT 1,
  supplier_rating DECIMAL(3,2),
  variants JSONB, -- [{color, size, price, stock}]

  -- Delivery intelligence
  warehouse_location TEXT,       -- 'US-CA', 'US-NJ', 'US-TX', 'US-IN', 'CN', 'LOCAL', etc.
  estimated_delivery_days INTEGER,
  delivery_category TEXT,        -- 'local' (1-5d), 'fast' (6-10d), 'standard' (11-15d), 'slow' (16+d)
  delivery_penalty_per_day DECIMAL(5,2) DEFAULT 0.50, -- configurable per product category
  effective_cost DECIMAL(10,2),  -- buy + ship + (delivery_days × penalty)

  -- Confirmation status (THREE-PHASE MODEL)
  is_confirmed BOOLEAN DEFAULT false,     -- Phase 2: admin confirmed this price
  is_auto_recommended BOOLEAN DEFAULT false, -- Phase 1: system's best pick
  is_approximate BOOLEAN DEFAULT true,    -- false after manual input
  confidence_level TEXT DEFAULT 'low',    -- low, medium, high
  confirmed_by TEXT,                       -- admin user who confirmed
  confirmed_at TIMESTAMPTZ,

  -- Per-platform cost breakdown (calculated in W2/W3C)
  tiktok_landed_cost DECIMAL(10,2),
  tiktok_gross_margin DECIMAL(5,2),
  tiktok_delivery_adjusted_margin DECIMAL(5,2),
  amazon_fba_landed_cost DECIMAL(10,2),
  amazon_fba_gross_margin DECIMAL(5,2),
  amazon_fba_delivery_adjusted_margin DECIMAL(5,2),
  amazon_fbm_landed_cost DECIMAL(10,2),
  amazon_fbm_gross_margin DECIMAL(5,2),
  amazon_fbm_delivery_adjusted_margin DECIMAL(5,2),
  shopify_landed_cost DECIMAL(10,2),
  shopify_gross_margin DECIMAL(5,2),
  shopify_delivery_adjusted_margin DECIMAL(5,2),

  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_costs_product ON product_costs(product_id);
CREATE INDEX idx_product_costs_platform ON product_costs(supplier_platform);
CREATE INDEX idx_product_costs_confirmed ON product_costs(is_confirmed);
CREATE INDEX idx_product_costs_warehouse ON product_costs(warehouse_location);

-- Sourcing Queue: human review checkpoint between Phase 1 and Phase 3
CREATE TABLE sourcing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Auto-discovery results summary
  auto_recommended_cost_id UUID REFERENCES product_costs(id),
  supplier_options_count INTEGER DEFAULT 0,
  best_auto_margin DECIMAL(5,2),
  best_auto_delivery_days INTEGER,
  best_auto_platform TEXT,

  -- Preliminary AI verdict (from Phase 1)
  preliminary_verdict TEXT, -- STRONG, MODERATE, WEAK, NOT_VIABLE
  preliminary_notes TEXT,   -- AI reasoning summary

  -- Queue management
  queue_status TEXT DEFAULT 'pending_review',
  -- 'pending_review', 'confirmed', 'overridden', 'local_supplier_added', 'rejected', 'snoozed'
  snooze_until TIMESTAMPTZ,
  priority_rank INTEGER,     -- auto-calculated: higher score = review first

  -- Admin actions
  confirmed_cost_id UUID REFERENCES product_costs(id), -- which option was confirmed
  admin_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,

  queued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sourcing_queue_status ON sourcing_queue(queue_status);
CREATE INDEX idx_sourcing_queue_product ON sourcing_queue(product_id);
CREATE INDEX idx_sourcing_queue_priority ON sourcing_queue(priority_rank DESC);

-- Local Suppliers: builds a reusable supplier database over time
CREATE TABLE local_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  contact_info JSONB,          -- {email, phone, website, whatsapp}
  location TEXT,               -- city/state/country
  categories TEXT[],           -- ['electronics', 'fashion', 'beauty']
  avg_delivery_days INTEGER,
  reliability_rating DECIMAL(3,2), -- 0-5, updated over time
  total_orders INTEGER DEFAULT 0,
  successful_orders INTEGER DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_local_suppliers_active ON local_suppliers(is_active);
CREATE INDEX idx_local_suppliers_categories ON local_suppliers USING GIN(categories);

-- ENGINE 2: Profitability
CREATE TABLE profitability_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  product_cost_id UUID REFERENCES product_costs(id),

  -- Phase tracking
  is_confirmed BOOLEAN DEFAULT false,  -- false = Phase 1 preliminary, true = Phase 3 final
  analysis_phase TEXT DEFAULT 'preliminary', -- 'preliminary', 'confirmed'

  -- Viability
  viability_verdict TEXT NOT NULL, -- STRONG, MODERATE, WEAK, NOT_VIABLE
  best_margin DECIMAL(5,2),
  best_delivery_adjusted_margin DECIMAL(5,2),
  best_platform TEXT, -- tiktok_shop, amazon_fba, amazon_fbm, shopify
  -- Pricing
  recommended_price DECIMAL(10,2),
  competitor_median_price DECIMAL(10,2),
  price_strategy TEXT, -- undercut, match, premium
  -- Delivery context
  selected_supplier_delivery_days INTEGER,
  delivery_category TEXT, -- local, fast, standard, slow
  -- Marketing
  marketing_budget DECIMAL(10,2) DEFAULT 0,
  content_priority TEXT, -- HIGH, MEDIUM, LOW, SKIP
  influencer_max_cpa DECIMAL(10,2),
  -- AI Analysis
  ai_model_used TEXT, -- haiku, sonnet
  ai_reasoning TEXT,
  ai_content_strategy JSONB,
  -- Promotion
  social_platforms TEXT[], -- ['tiktok', 'instagram', 'pinterest']
  -- Metadata
  analysis_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profitability_product ON profitability_analysis(product_id);
CREATE INDEX idx_profitability_verdict ON profitability_analysis(viability_verdict);
CREATE INDEX idx_profitability_priority ON profitability_analysis(content_priority);
CREATE INDEX idx_profitability_confirmed ON profitability_analysis(is_confirmed);

-- ENGINE 3: Marketing Plans (AI-generated, human-approved)
CREATE TABLE marketing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  profitability_id UUID REFERENCES profitability_analysis(id),

  -- Plan status (human approval gate)
  status TEXT DEFAULT 'pending_approval',
  -- 'pending_approval', 'approved', 'approved_modified', 'rejected', 'on_hold'

  -- AI-generated marketing plan (complete strategy)
  plan JSONB NOT NULL,
  -- Structure:
  -- {
  --   content_strategy: {
  --     pieces: [{type, script, prompt, target_platform, estimated_cost, rationale}]
  --   },
  --   budget_allocation: {
  --     content_production: {faceless, avatar, broll, images, voiceover},
  --     paid_promotion: number,
  --     influencer: number,
  --     total_estimated: number,
  --     projected_roi: {low: number, high: number}
  --   },
  --   platform_strategy: {
  --     primary_selling: text,
  --     content_platforms: text[],
  --     posting_schedule: [{platform, datetime, content_piece_index}],
  --     rationale: text
  --   },
  --   messaging_strategy: {
  --     key_angles: text[],
  --     target_audience: text,
  --     urgency_hooks: text[],
  --     competitor_differentiation: text
  --   },
  --   timeline: {
  --     production_start: date,
  --     production_end: date,
  --     publishing_start: date,
  --     monitoring_end: date
  --   }
  -- }

  -- Admin modifications (if approved_modified)
  admin_modifications JSONB,     -- diff of what admin changed
  admin_notes TEXT,

  -- AI reasoning
  ai_model_used TEXT,            -- 'sonnet'
  ai_reasoning TEXT,

  -- Tracking
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  total_actual_spend DECIMAL(10,2) DEFAULT 0, -- updated as content is produced
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_plans_product ON marketing_plans(product_id);
CREATE INDEX idx_marketing_plans_status ON marketing_plans(status);

-- ENGINE 3: Content Queue (items from approved marketing plans)
CREATE TABLE content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  profitability_id UUID REFERENCES profitability_analysis(id),
  marketing_plan_id UUID REFERENCES marketing_plans(id), -- links back to approved plan
  content_type TEXT NOT NULL, -- faceless_reel, avatar_reel, avatar_reel_premium, product_broll, product_image, voiceover
  content_priority TEXT NOT NULL, -- HIGH, MEDIUM, LOW
  -- Script/Prompt
  script TEXT,
  image_prompt TEXT,
  voiceover_text TEXT,
  -- Production
  status TEXT DEFAULT 'pending', -- pending, producing, produced, review, approved, published, failed
  produced_asset_url TEXT,
  produced_asset_type TEXT, -- video/mp4, image/png, audio/mp3
  -- Metadata
  template_used TEXT,
  generation_cost DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_queue_product ON content_queue(product_id);
CREATE INDEX idx_content_queue_status ON content_queue(status);
CREATE INDEX idx_content_queue_type ON content_queue(content_type);

CREATE TABLE published_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_queue(id),
  product_id UUID NOT NULL REFERENCES products(id),
  platform TEXT NOT NULL, -- tiktok, instagram, youtube, facebook, pinterest
  post_id TEXT, -- platform-specific post ID
  post_url TEXT,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  caption TEXT,
  hashtags TEXT[],
  status TEXT DEFAULT 'scheduled', -- scheduled, published, failed, removed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_published_product ON published_content(product_id);
CREATE INDEX idx_published_platform ON published_content(platform);

CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_content_id UUID NOT NULL REFERENCES published_content(id),
  product_id UUID NOT NULL REFERENCES products(id),
  platform TEXT NOT NULL,
  -- Metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4), -- (likes+shares+comments+saves) / views
  estimated_reach INTEGER DEFAULT 0,
  -- Calculated
  ctr DECIMAL(5,4), -- clicks / views
  cost_per_view DECIMAL(10,6),
  cost_per_engagement DECIMAL(10,6),
  -- Tracking
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  is_viral BOOLEAN DEFAULT false, -- engagement_rate > 5%
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_product ON content_performance(product_id);
CREATE INDEX idx_performance_platform ON content_performance(platform);
CREATE INDEX idx_performance_viral ON content_performance(is_viral) WHERE is_viral = true;

-- FEEDBACK & LEARNING
CREATE TABLE scoring_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  platform TEXT NOT NULL,
  adjustment_type TEXT, -- trend_weight, viral_weight, profit_weight
  adjustment_value DECIMAL(5,4),
  based_on_sample_size INTEGER,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  service TEXT NOT NULL, -- blotato, veo3, nanobananana, elevenlabs, apify, claude_api
  credits_used DECIMAL(10,4),
  cost_usd DECIMAL(10,4),
  monthly_budget DECIMAL(10,2),
  budget_remaining DECIMAL(10,2),
  alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_date ON budget_tracking(date);
CREATE INDEX idx_budget_service ON budget_tracking(service);

CREATE TABLE template_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  uses_count INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5,4),
  avg_views INTEGER DEFAULT 0,
  best_performing_niche TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- All new tables follow the same RLS pattern as existing tables
-- Service role for backend workers, authenticated for admin dashboard

ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profitability_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_performance ENABLE ROW LEVEL SECURITY;

-- Admin read access for all tables
CREATE POLICY "Admins can read all data"
  ON product_costs FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Repeat for each table...
-- Service role has full access (used by backend workers)
```

### Schema Relationships

```
products (existing)
  ├── product_costs (1:many, per supplier)
  │     └── profitability_analysis (1:1 per cost record)
  │           └── content_queue (1:many, per content type)
  │                 └── published_content (1:many, per platform)
  │                       └── content_performance (1:many, over time)
  │
  └── scoring_adjustments (referenced by scoring engine)

budget_tracking (standalone, per service per day)
template_performance (standalone, aggregated metrics)
```

**New tables: 8**
**Total tables (existing 32 + new 8): 40**

---

## 2E. UI Components

### New Pages

| Page | Route | Purpose |
|------|-------|---------|
| Purchasing Dashboard | /purchasing | Supplier lookup results, cost breakdowns |
| Profitability Center | /profitability | Viability verdicts, pricing recommendations |
| Content Studio | /content | Content queue, review, approve/reject |
| Publishing Calendar | /content/calendar | Scheduled posts across platforms |
| Performance Analytics | /analytics/content | Engagement metrics, ROI tracking |
| Budget Control | /settings/budget | Spending limits, alerts, daily tracking |

### Product Detail Page Additions

The existing product detail page (7-row chain) gets 3 new sections:

**Row 8: Supplier & Cost Data**
- Supplier source (CJ/AliExpress)
- Buy price, shipping cost, landed cost
- Per-platform margin breakdown (visual bars)
- Confidence level indicator
- "Re-check price" button

**Row 9: Profitability Verdict**
- Large viability badge (STRONG/MODERATE/WEAK/NOT_VIABLE)
- Recommended selling price
- Best platform recommendation
- Marketing budget allocation
- AI reasoning (expandable)

**Row 10: Content & Performance**
- Generated content gallery (videos, images)
- Publishing status per platform
- Engagement metrics (mini-charts)
- Content performance comparison
- "Create more content" button

### Content Studio Interface

```
/content page layout:

┌─────────────────────────────────────────────────────┐
│  Content Studio                          [Filters▼]  │
├─────────┬───────────────────────────────────────────┤
│ Queue   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ Review  │  │Video│ │Video│ │Image│ │Image│  ...    │
│ Approved│  │ ▶   │ │ ▶   │ │     │ │     │        │
│ Published│ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘       │
│ Failed  │     │Product A│  Product B│  Product C    │
│         │  [Approve] [Reject] [Edit] [Regenerate]   │
├─────────┴───────────────────────────────────────────┤
│ Publishing Calendar (week view)                      │
│ Mon    Tue    Wed    Thu    Fri    Sat    Sun        │
│ TikTok IG     FB     TikTok IG     YT     Pinterest│
│ 9am    11am   2pm    9am    11am   10am   3pm      │
└─────────────────────────────────────────────────────┘
```

---

# PART 3: REVISED COST ANALYSIS

---

## Line-Item Monthly Cost

| # | Service | Plan | Monthly Cost | Purpose |
|---|---------|------|-------------|---------|
| | **EXISTING BASELINE** | | | |
| 1 | Supabase | Pro | $25 | Database + Auth + Realtime |
| 2 | Railway | Starter | $5 + usage (~$20) | Backend + Redis + n8n |
| 3 | Netlify | Starter | $0 | Frontend hosting |
| 4 | Apify | Free tier | $0 ($5 free credits) | Web scraping |
| 5 | Anthropic Claude API | Pay-as-you-go | ~$30 | AI analysis (existing) |
| 6 | Resend | Free tier | $0 | Email (100/day free) |
| 7 | Redis (Railway) | Included | $0 | Job queue backing |
| 8 | GitHub | Free | $0 | Version control |
| 9 | Stripe | 2.9% + $0.30/tx | ~$0 (until revenue) | Payments |
| | **Baseline subtotal** | | **~$80** | |
| | | | | |
| | **ENGINE 1: PURCHASING** | | | |
| 10 | CJDropshipping API | Free | $0 | Primary supplier data |
| 11 | Apify (AliExpress) | Free tier (shared) | $0 | Secondary supplier data |
| | **Engine 1 subtotal** | | **$0** | |
| | | | | |
| | **ENGINE 2: PROFITABILITY** | | | |
| 12 | Claude API (incremental) | Pay-as-you-go | ~$8 | Viability analysis |
| | **Engine 2 subtotal** | | **~$8** | |
| | | | | |
| | **ENGINE 3: CONTENT & MARKETING** | | | |
| 13 | Blotato | Starter | $29 | Faceless video + publishing |
| 14 | HeyGen | Creator | $29 | AI avatar presenter reels |
| 15 | Google AI (VEO3) | Pay-as-you-go | ~$8 | Product B-roll short clips |
| 16 | Google AI (Nano Banana) | Free tier + Pro API | ~$2 | Product images |
| 17 | ElevenLabs | Starter | $5 | AI voiceover (hero content) |
| 18 | OpenAI TTS | Pay-as-you-go | ~$0.20 | AI voiceover (day-to-day) |
| | **Engine 3 subtotal** | | **~$73** | |
| | | | | |
| | **GRAND TOTAL** | | **~$161/month** | |

### Comparison With Previous Estimates

| Configuration | Monthly Cost | Notes |
|--------------|-------------|-------|
| Previous Config A (base only) | $139 | No content engines |
| Previous Config B (full featured) | $415 | Over budget |
| Previous Config C (optimized) | $291 | Near budget ceiling |
| **This Blueprint** | **~$161** | **All 3 engines included** |

**This blueprint delivers ALL 3 engines for $139 under budget.** The key savings:
1. CJDropshipping + AliExpress Official APIs replace TopDawg ($35/mo saved)
2. HeyGen Avatar III (unlimited) provides bulk presenter content without per-video anxiety
3. NanoBanana+VEO3 provides supplementary B-roll, not primary presenter content
4. Nano Banana free tier replaces paid image generation (~$10-20/mo saved)
5. Blotato bundles faceless video creation + 9-platform publishing (vs separate tools ~$50-70/mo saved)
6. Dual voiceover strategy (OpenAI TTS day-to-day + ElevenLabs hero) optimizes quality vs cost

### Break-Even Analysis

**Fixed costs:** ~$161/month
**Variable costs per product (full content suite):**
- Supplier lookup: $0
- AI analysis: ~$0.01
- Faceless video (Blotato): ~$0.50/video (est. 25 credits)
- Avatar reel (HeyGen Avatar III): $0 (unlimited on Creator plan)
- Avatar reel (HeyGen Avatar IV, hero only): ~$2-4/video
- Product B-roll (VEO3 Fast, 8s clip): ~$1.20/clip
- Product images (free tier): $0
- Voiceover (OpenAI TTS): ~$0.01/clip
- Voiceover (ElevenLabs, hero): ~$0.10/clip
- Total per STRONG product: ~$4-6 for full content suite
- Total per MODERATE product: ~$1-2 for reduced content
- Total per WEAK product: ~$0.01 for images only

**At 30 STRONG products/month:** $161 fixed + $150 variable = ~$311/month (near ceiling)
**At 20 STRONG products/month:** $161 fixed + $100 variable = ~$261/month (comfortable)

**Revenue needed to break even at $236/month:**
- If average product profit is $10/sale: need 24 sales/month
- If average product profit is $20/sale: need 12 sales/month
- If average product profit is $5/sale: need 48 sales/month

### Cost Optimization Opportunities

1. **Nano Banana free tier:** 500 images/day free — this alone covers ALL image needs
2. **VEO3 Fast mode:** $0.10/sec vs $0.40/sec — 4x cheaper for shorter clips
3. **Claude Haiku batch API:** 50% cheaper than real-time
4. **Blotato credit management:** Roll-over credits, batch production during low-usage months
5. **Scale with revenue:** Start with minimal content (WEAK products = images only), increase content investment as sales prove ROI

---

# PART 4: IMPLEMENTATION ROADMAP

---

## Session Breakdown

### Phase 1: Foundation (Sessions 1-3)

**Session 1: Database + Purchasing Engine Core** (3-4 tasks)
1. Create all 8 new database tables with indexes and RLS
2. Implement CJDropshipping API client (product search, price lookup)
3. Build supplier_lookup_worker (W22)
4. Test: product → supplier lookup → cost data stored

**Session 2: Cost Calculator + Profitability Core** (3-4 tasks)
1. Implement cost calculation logic (per-platform formulas)
2. Build cost_calculator_worker (W23)
3. Build profitability_analysis_worker (W24) with Claude Haiku integration
4. Test: cost data → profitability verdict → stored

**Session 3: Pipeline Integration** (3 tasks)
1. Wire scoring engine output → Engine 1 trigger (score >= 60)
2. Wire Engine 1 → Engine 2 → verdict output
3. Add AliExpress fallback to supplier_lookup_worker
4. Test end-to-end: product scored → supplier found → viability assessed

### Phase 2: Content Engine (Sessions 4-7)

**Session 4: n8n Setup + Blotato Integration** (3-4 tasks)
1. Configure n8n on Railway (if not already)
2. Install Blotato n8n community node
3. Set up Blotato API credentials
4. Create W1-W3 as n8n workflows (supplier → cost → profitability)

**Session 5: Content Script + Image Generation** (3-4 tasks)
1. Build content_script_worker (W25) with Claude Haiku
2. Implement Nano Banana 2 image generation via Google AI API
3. Build product_image_worker (W28) as n8n workflow (template #8226 base)
4. Test: product → script → images generated

**Session 6: Video Generation Pipeline** (3-4 tasks)
1. Implement Blotato faceless video workflow (template #5035 base)
2. Implement NanoBanana + VEO3 avatar pipeline (template #8270 base)
3. Build ElevenLabs voiceover workflow
4. Test: script → video + audio → assembled content

**Session 7: Publishing Pipeline** (3-4 tasks)
1. Build publishing workflow (template #7187 base)
2. Implement human review queue (content_queue status management)
3. Set up staggered posting schedule
4. Test: approved content → published to test accounts

### Phase 3: Intelligence & UI (Sessions 8-11)

**Session 8: Performance Tracking** (3-4 tasks)
1. Build performance_tracking_worker (W32)
2. Implement engagement data collection
3. Set up performance aggregation
4. Test: published content → metrics tracked

**Session 9: Feedback Loop + Budget Monitor** (3 tasks)
1. Build feedback_processor_worker (W33) with Claude analysis
2. Build budget_monitor_worker (W34)
3. Test: weekly feedback → scoring adjustments

**Session 10: Admin UI — Purchasing + Profitability Pages** (3-4 tasks)
1. Build /purchasing dashboard page
2. Build /profitability center page
3. Add Row 8-9 to product detail page
4. Add /settings/budget page

**Session 11: Admin UI — Content Studio** (3-4 tasks)
1. Build /content page with review queue
2. Build /content/calendar with publishing schedule
3. Build /analytics/content performance dashboard
4. Add Row 10 to product detail page

### Phase 4: Optimization (Sessions 12-13)

**Session 12: Pipeline Refinement** (3-4 tasks)
1. Implement price_optimization_worker (W35)
2. Add Claude Sonnet escalation for STRONG products
3. Optimize n8n workflow error handling and retries
4. Implement dead letter queues for content pipeline

**Session 13: Testing + Launch** (3-4 tasks)
1. End-to-end integration testing
2. Budget alert testing
3. Content quality review
4. Production deployment

### Dependencies

```
Session 1 ──→ Session 2 ──→ Session 3
                                ↓
Session 4 (n8n setup, can partially parallel with 1-3)
    ↓
Session 5 ──→ Session 6 ──→ Session 7
                                ↓
Session 8 ──→ Session 9
    ↓
Session 10 ──→ Session 11 (can parallel with 8-9)
    ↓
Session 12 ──→ Session 13
```

**Sessions leveraging n8n templates (saving dev time):**
- Session 5: Template #8226 (NanoBanana e-commerce images)
- Session 6: Templates #5035 (VEO3+Blotato) and #8270 (NanoBanana+VEO3+Blotato)
- Session 7: Template #7187 (multi-platform publishing)

**Total sessions: 13**
**Estimated tasks: ~44**

---

# PART 5: RISK ASSESSMENT

---

## Service Failure Scenarios

| Service | Probability | Impact | Fallback | Recovery Time |
|---------|------------|--------|----------|---------------|
| CJDropshipping API | Low | Medium | AliExpress via Apify | Automatic (built-in) |
| Apify | Low | Low | Direct HTTP scraping | 1-2 hours |
| Claude API | Very Low | High | OpenAI GPT-4o-mini as fallback | < 1 hour config change |
| Blotato | Medium | High | Postiz (self-hosted) for publishing; Runway for video | 4-8 hours |
| Google AI (VEO3) | Low | Medium | Kling AI or Runway for video gen | 2-4 hours |
| Google AI (Nano Banana) | Low | Medium | Flux/BFL API for images | 1-2 hours |
| ElevenLabs | Low | Low | OpenAI TTS or Google Cloud TTS | < 1 hour |
| Supabase | Very Low | Critical | No practical fallback | Wait for restoration |
| Railway (n8n) | Low | High | Redeploy n8n to different Railway project | 1-2 hours |

## Quality Control for AI-Generated Content

### Content Quality Gates

1. **Script review:** Claude generates scripts, but a quality score is attached (Claude self-evaluates 1-10). Scripts < 7 go to manual review.
2. **Image review:** Generated images are stored with metadata. Admin can bulk-approve or flag for regeneration.
3. **Video review:** All videos go to human review queue by default. Auto-post only enabled per-account after 10 successful manual approvals.
4. **Brand consistency:** Character seed for Nano Banana ensures consistent avatar appearance. Voice clone on ElevenLabs ensures consistent brand voice.
5. **Platform compliance:** Automated checks for video duration, aspect ratio, file size per platform before publishing.

### Content Quality Improvement Loop

```
Generate content → Human reviews → Approve/Reject
                                       ↓
                              If rejected: reason logged
                                       ↓
                              Feedback to Claude prompt engineering
                                       ↓
                              Template/prompt updated
                                       ↓
                              Next generation is better
```

## Budget Overrun Prevention

### Per-Service Daily Limits

| Service | Monthly Budget | Daily Limit | Auto-Pause Threshold |
|---------|---------------|------------|---------------------|
| Blotato | $29 (fixed) | N/A (credit-based) | 90% credits used |
| VEO3 API | $15 | $0.50/day | $12 total spend |
| Nano Banana Pro | $3 | $0.10/day | $2.50 total |
| ElevenLabs | $5 (fixed) | N/A (credit-based) | 85% credits used |
| Claude API | $12 | $0.40/day | $10 total spend |
| Apify | $0 (free tier) | $5 free credits | $4 total spend |

### Circuit Breakers

1. **Budget monitor workflow (W13)** runs daily at 6 AM
2. If any service > 80% monthly budget: email alert to admin
3. If any service > 95% monthly budget: pause all non-critical workflows for that service
4. If total monthly spend > $160 (engine budget): pause ALL content creation workflows
5. Manual override available in /settings/budget to resume

### Unexpected Cost Scenarios

| Scenario | Risk | Mitigation |
|----------|------|-----------|
| VEO3 price increase | Medium | Switch to Kling AI or VEO3 Fast mode |
| Viral product spike (too many products to process) | Medium | Content priority gating (only STRONG/MODERATE get content) |
| Google removes free tier | Low | Budget $5-10/mo for Nano Banana 2 API |
| Blotato credit exhaustion | Medium | Purchase additional credits or defer to next month |
| Apify exceeds free tier | Low | Budget $10/mo for Starter plan if needed |

---

# APPENDIX A: API Reference Quick Guide

## CJDropshipping API
- **Base URL:** `https://developers.cjdropshipping.com/api2.0/v1/`
- **Auth:** CJ-Access-Token header
- **Key endpoints:**
  - `POST /product/list` — search products by keyword
  - `GET /product/query?pid=` — get product details
  - `GET /product/getCategory` — browse categories
- **Rate limits:** Documented per-endpoint

## Blotato API
- **Base URL:** Via Blotato REST API (docs at help.blotato.com/api)
- **Auth:** API key (paid subscribers only)
- **Key actions:** Create Visual, Get Visual, Upload Media, Create Post
- **n8n:** Official community node `@blotato/n8n-nodes-blotato`

## Google AI (VEO3 + Nano Banana)
- **Base URL:** `https://generativelanguage.googleapis.com/`
- **Auth:** Google AI API key
- **VEO3:** `POST /v1/models/veo-3.1-generate-preview:generateVideos`
- **Nano Banana 2:** Via Gemini 3.1 Flash Image model
- **Nano Banana Pro:** Via Gemini 3 Pro Image model
- **Free tier:** 500 images/day, limited video generation

## ElevenLabs API
- **Base URL:** `https://api.elevenlabs.io/v1/`
- **Auth:** xi-api-key header
- **Key endpoint:** `POST /text-to-speech/{voice_id}`
- **n8n:** Native ElevenLabs node

---

# APPENDIX B: n8n Template Reference

| Template # | Name | Use In Blueprint | Modification Needed |
|-----------|------|-----------------|-------------------|
| #5035 | VEO3 + Blotato auto-post | W5 (faceless video) | Add product data input, script integration |
| #7187 | Multi-platform via Blotato | W10 (publishing) | Add stagger logic, review queue check |
| #8226 | NanoBanana e-commerce images | W7 (product images) | Connect to product data, multi-image generation |
| #8270 | NanoBanana + VEO3 + Blotato | W6 (avatar video) | Replace Telegram trigger with webhook, add voiceover |
| #11204 | NanoBanana 2 PRO + VEO3.1 | W6 alternative (newer) | Same as #8270 but uses latest models |
| #3066 | Multi-platform AI content | Reference only | Too generic, build custom instead |
| #3135 | Content publishing factory | Reference only | Blotato-based approach is simpler |

---

# APPENDIX C: Decision Matrix — What Makes This Blueprint Different

| Factor | Previous Approach | This Blueprint |
|--------|------------------|---------------|
| Supplier API | TopDawg ($35/mo) | CJDropshipping + AliExpress Official (both free) |
| Avatar presenter | HeyGen ($87+/mo for volume) OR VEO3-only ($135+/mo) | HeyGen Creator ($29) — Avatar III unlimited + Avatar IV for hero |
| Product B-roll | Not planned | NanoBanana + VEO3 short clips (~$8/mo) |
| Product images | Paid image gen (~$10/mo) | Nano Banana 2 free tier ($0) |
| Publishing | Separate tool ($30-40/mo) | Included in Blotato ($0 extra) |
| Faceless video | Multiple tools ($70+/mo) | Blotato ($29) — all-in-one |
| Voiceover | ElevenLabs only ($5/mo) | OpenAI TTS ($0.20) + ElevenLabs ($5) — tiered quality |
| Total for engines | $160-276/mo | ~$81/mo |
| Content volume | Limited by budget | Unlimited presenter reels (Avatar III) + targeted premium |

---

# APPENDIX D: n8n Integration Capabilities (Verified)

### Node Availability Summary

| Service | Node Type | Status | Key Detail |
|---------|-----------|--------|-----------|
| **Blotato** | Community (official by Blotato Inc) | 6 actions, 9 platforms | Self-hosted only. npm: `@blotato/n8n-nodes-blotato` |
| **ElevenLabs** | Native (verified partner) | TTS, STS, voice clone | Official launch partner. npm: `@elevenlabs/n8n-nodes-elevenlabs` |
| **Supabase** | Native (built-in core) | Full CRUD + Vector Store | 5 operations: Create, Get One, Get Many, Update, Delete |
| **BullMQ** | Community (third-party) | Trigger, Add Job, Respond, Wait | npm: `n8n-nodes-bullmq`. Enables Express→n8n bridge |
| **OpenAI** | Native (built-in core) | Full support | Used in templates for script generation |
| **Google Drive** | Native (built-in core) | Full support | Used in image templates |
| **HeyGen** | Community (third-party) | HTTP Request preferred | No native node |
| **Runway ML** | HTTP Request only | No node available | Not recommended |
| **fal.ai** | HTTP Request | Used for NanoBanana + VEO3 | Standard integration path in templates |

### Critical n8n Configuration

- **Community Edition:** ALL nodes available (built-in + AI/LangChain + community). No restrictions.
- **Concurrency:** Set `N8N_CONCURRENCY_PRODUCTION_LIMIT` env var (recommended: 10-20)
- **Queue mode:** Use `--concurrency` flag per worker for horizontal scaling
- **Railway setup:** One-click deploy available. Production stack template includes: main + worker + webhook processor + PostgreSQL + Redis

### BullMQ Bridge (Express Backend ↔ n8n)

The `n8n-nodes-bullmq` community node enables direct communication between the existing Express/BullMQ backend and n8n workflows:
- **Express → n8n:** BullMQ Trigger node listens for jobs from Express workers
- **n8n → Express:** BullMQ Add Job node queues work back to Express workers
- This eliminates the need for webhook-based communication between the two systems

### NanoBanana via fal.ai (Important Clarification)

The n8n templates (#8270, #11204) use **fal.ai** as the API gateway for NanoBanana and VEO3:
- fal.ai wraps Google's Gemini image models as "NanoBanana" branded APIs
- Pricing through fal.ai: Nano Banana $0.039/image, Nano Banana 2 $0.08/image, Nano Banana Pro $0.15/image
- Alternative: Use Google AI Studio API directly for potentially lower cost (free tier: 500 images/day)
- VEO3 via fal.ai may have different pricing than Google's direct API ($0.10-0.40/sec)
- **Recommendation:** Start with fal.ai (templates work out-of-box), migrate to Google direct API for cost savings once pipeline is stable

---

**END OF BLUEPRINT**

*This document should be treated as the authoritative architecture reference for Engines 1-3 of the YOUSELL platform. All implementation sessions should reference this document.*
