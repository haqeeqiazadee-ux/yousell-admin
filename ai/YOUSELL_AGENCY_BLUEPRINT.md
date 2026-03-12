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

---

# PART 4: INTELLIGENT PRODUCT RANKING SYSTEM

---

## 4A. The Problem

The system continuously discovers products across 7+ platforms (TikTok, Amazon, Shopify, Pinterest, Digital, AI Affiliate, Physical Affiliate). Each platform has different search criteria, different signals, and different product types (physical vs digital). Currently:

- Products are scored by the 3-pillar model (trend 40% + viral 35% + profit 25%)
- But **there is no intelligent ranking** that combines discovery scores WITH purchasing engine data
- Products sit in the database with a `final_score` but no dynamic ranking that reflects:
  - Confirmed vs unconfirmed pricing
  - Delivery speed advantages
  - Supplier reliability
  - Marketing plan approval status
  - Historical performance of similar products
  - Time decay (trending products lose value over time)
  - Platform-specific ranking criteria

## 4B. The Intelligent Ranking Architecture

### Core Principle: Products Are Ranked Differently At Each Stage

A product's "rank" isn't a single number — it's a **context-dependent position** that changes based on WHERE in the pipeline you're looking:

| Stage | Ranking Purpose | Key Factors |
|-------|----------------|-------------|
| Discovery Feed | "Which products should I review first?" | Discovery score, trend velocity, time-sensitivity |
| Sourcing Queue | "Which products should I price-confirm first?" | Preliminary margin, delivery speed, supplier confidence |
| Marketing Queue | "Which marketing plans should I approve first?" | Confirmed margin, content ROI estimate, trend momentum |
| Client Allocation | "Which products should clients see first?" | Final score, delivery speed, content readiness, client niche match |
| Performance Dashboard | "Which products are performing best?" | Revenue, engagement, ROI, conversion rate |

### The Unified Ranking Score (URS)

While context-specific rankings exist, we also compute a **Unified Ranking Score** that represents the overall "opportunity quality" of a product at any moment. This is what powers the admin dashboard default sort.

```
URS = (
  discovery_component    × 0.25   +   // How strong are the discovery signals?
  purchasing_component   × 0.30   +   // How good is the sourcing situation?
  marketing_component    × 0.20   +   // How ready is the marketing pipeline?
  momentum_component     × 0.15   +   // How fresh/urgent is this opportunity?
  performance_component  × 0.10       // How has it performed so far? (0 if new)
) × platform_multiplier × type_multiplier
```

### Component Breakdown

**1. Discovery Component (25% of URS)**
```
discovery_component = final_score  // Already calculated: trend×0.40 + viral×0.35 + profit×0.25
```
This is the existing 3-pillar score. Range: 0-100.

**2. Purchasing Component (30% of URS) — NEW**
```
purchasing_component = (
  margin_score        × 0.35 +   // Gross margin percentile
  delivery_score      × 0.30 +   // Delivery speed advantage
  supplier_score      × 0.20 +   // Supplier reliability + warehouse location
  confirmation_bonus  × 0.15     // Confirmed pricing vs approximate
)
```

Where:
- `margin_score`:
  - confirmed_margin >= 60%: 100
  - confirmed_margin >= 50%: 85
  - confirmed_margin >= 40%: 70
  - confirmed_margin >= 30%: 50
  - confirmed_margin >= 15%: 30
  - unconfirmed: use preliminary margin × 0.7 (30% confidence penalty)

- `delivery_score`:
  - 1-3 days (local/US warehouse): 100
  - 4-5 days (fast): 85
  - 6-10 days (medium): 60
  - 11-15 days (standard): 35
  - 16+ days (slow): 15
  - Unknown: 25

- `supplier_score`:
  - Local supplier (from local_suppliers table): 100
  - CJ US warehouse: 90
  - CJ China + AliExpress Choice: 60
  - AliExpress standard: 40
  - No supplier found: 10

- `confirmation_bonus`:
  - Price confirmed by admin: 100
  - Price approximate (auto-fetched): 40
  - No pricing data yet: 0

**3. Marketing Component (20% of URS) — NEW**
```
marketing_component = (
  content_readiness   × 0.40 +   // Has content been created?
  plan_status         × 0.30 +   // Marketing plan approved?
  estimated_roi       × 0.30     // AI-projected ROI
)
```

Where:
- `content_readiness`:
  - All content produced + published: 100
  - Content produced, awaiting publish: 80
  - Content in production: 60
  - Marketing plan approved, content not started: 40
  - Plan pending approval: 20
  - No plan yet: 0

- `plan_status`:
  - Approved: 100
  - Approved with modifications: 90
  - Pending approval: 40
  - No plan: 0
  - Rejected: 0

- `estimated_roi`:
  - ROI >= 10x: 100
  - ROI >= 5x: 80
  - ROI >= 3x: 60
  - ROI >= 1.5x: 40
  - ROI < 1.5x: 20
  - Unknown: 30

**4. Momentum Component (15% of URS) — NEW**
```
momentum_component = (
  freshness_score     × 0.40 +   // How recently discovered?
  trend_velocity      × 0.35 +   // Is the trend accelerating?
  urgency_factor      × 0.25     // Time-sensitive opportunity?
)
```

Where:
- `freshness_score` (time decay):
  - Discovered < 24 hours ago: 100
  - Discovered < 3 days ago: 85
  - Discovered < 7 days ago: 65
  - Discovered < 14 days ago: 40
  - Discovered < 30 days ago: 20
  - Discovered > 30 days ago: 5
  - EXCEPTION: Evergreen products (category flag) decay at 0.5x rate

- `trend_velocity`:
  - trend_stage = 'exploding': 100
  - trend_stage = 'rising': 75
  - trend_stage = 'emerging': 50
  - trend_stage = 'saturated': 10

- `urgency_factor`:
  - Platform = tiktok (fast-moving trends): 90
  - Platform = pinterest (seasonal): 70
  - Platform = amazon (stable but competitive): 50
  - Platform = shopify (moderate): 40
  - Platform = digital/ai_affiliate (evergreen): 30

**5. Performance Component (10% of URS)**
```
performance_component = (
  revenue_score       × 0.40 +   // Actual revenue generated
  engagement_score    × 0.30 +   // Social media engagement
  conversion_score    × 0.30     // Click-to-sale conversion
)
```

Only populated AFTER the product has been marketed. New products get 0 (the weight shifts to other components).

### Platform Multiplier

Different platforms have different baseline opportunity quality:

```
platform_multiplier = {
  tiktok:             1.15    // Highest viral potential, fast trend cycles
  amazon:             1.10    // Highest purchase intent, stable demand
  shopify:            1.00    // Baseline
  pinterest:          0.95    // Good for visual products, slower conversion
  digital:            1.05    // High margins, no shipping
  ai_affiliate:       1.00    // Recurring revenue potential
  physical_affiliate: 0.90    // Lower margins than direct
}
```

### Product Type Multiplier

Physical and digital products are fundamentally different opportunities:

```
type_multiplier = {
  physical_direct:    1.00    // Standard physical product (CJ/AliExpress)
  physical_local:     1.15    // Physical with local supplier (fast shipping bonus)
  digital_product:    1.10    // Digital product (no shipping, high margin)
  ai_tool:            1.05    // AI tool/SaaS affiliate
  affiliate:          0.85    // Affiliate (lower margin, less control)
}
```

## 4C. Platform-Specific Ranking Criteria

Each discovery platform has different signals that matter. The ranking system weighs these differently per platform:

### TikTok Products
```
tiktok_ranking_factors = {
  sales_velocity:       weight 0.25   // How fast sales are growing
  creator_count:        weight 0.20   // How many creators are promoting
  hashtag_acceleration: weight 0.20   // Trend keyword growth rate
  engagement_rate:      weight 0.15   // Likes/comments per view
  price_point_fit:      weight 0.10   // $15-50 sweet spot for impulse buy
  trend_freshness:      weight 0.10   // How new is this trend
}
```
**TikTok-specific auto-boost:** Products with creator_count > 50 AND trend_stage = 'rising' get +15 bonus to discovery_component. This catches products just before they explode.

### Amazon Products
```
amazon_ranking_factors = {
  bsr_rank:             weight 0.25   // Best Seller Rank (lower = better)
  bsr_velocity:         weight 0.20   // BSR improvement rate
  review_count:         weight 0.15   // Social proof depth
  rating:               weight 0.15   // Quality signal
  price_competition:    weight 0.15   // Gap between our price and competitors
  fba_eligible:         weight 0.10   // Can we use FBA?
}
```
**Amazon-specific auto-boost:** Products in top 100 BSR of subcategory AND margin > 40% get +10 bonus. Proven demand with room to profit.

### Shopify Products
```
shopify_ranking_factors = {
  store_traffic_rank:   weight 0.25   // Estimated store traffic
  product_review_count: weight 0.20   // Social proof
  price_point:          weight 0.20   // Higher AOV preferred ($25-100)
  brand_strength:       weight 0.15   // Store reputation signals
  product_uniqueness:   weight 0.20   // Less competition = more opportunity
}
```

### Pinterest Products
```
pinterest_ranking_factors = {
  pin_saves:            weight 0.30   // Strongest purchase intent signal on Pinterest
  pin_velocity:         weight 0.25   // How fast saves are growing
  visual_appeal:        weight 0.20   // (AI-assessed from image)
  seasonal_relevance:   weight 0.15   // Seasonal products spike on Pinterest
  category_fit:         weight 0.10   // Home, fashion, beauty perform best
}
```

### Digital Products
```
digital_ranking_factors = {
  sales_count:          weight 0.20   // Proof of demand
  creator_reputation:   weight 0.20   // Creator track record
  recurring_revenue:    weight 0.20   // Subscription > one-time
  market_gap:           weight 0.20   // Underserved niche?
  affiliate_commission: weight 0.20   // Commission rate
}
```
**Digital-specific bonus:** Recurring revenue products (SaaS, subscription) get +20 bonus because lifetime value is much higher.

### AI Affiliate Products
```
ai_affiliate_ranking_factors = {
  tool_growth_rate:     weight 0.25   // How fast is the tool growing?
  commission_rate:      weight 0.25   // Revenue per referral
  cookie_duration:      weight 0.15   // Longer attribution = more revenue
  market_awareness:     weight 0.15   // Is the market educated on this tool?
  content_angle_count:  weight 0.20   // How many ways can we promote it?
}
```

## 4D. Ranking Recalculation Triggers

The URS isn't static — it recalculates when any input changes:

| Event | What Changes | Recalculation |
|-------|-------------|---------------|
| New product discovered | discovery_component | Immediate |
| Product re-scored (scheduled) | discovery_component | Every 6 hours |
| Supplier found (W1) | purchasing_component | Immediate |
| Price confirmed (Phase 2) | purchasing_component (confirmation_bonus) | Immediate |
| Local supplier added | purchasing_component (supplier_score + delivery_score) | Immediate |
| Marketing plan generated | marketing_component (plan_status) | Immediate |
| Marketing plan approved | marketing_component (plan_status + content_readiness) | Immediate |
| Content produced | marketing_component (content_readiness) | Immediate |
| Content published | marketing_component (content_readiness) | Immediate |
| Performance data received | performance_component | Every 6 hours |
| 24 hours pass | momentum_component (freshness decay) | Daily cron |
| Trend stage changes | momentum_component (trend_velocity) | Immediate |

### Implementation: Database Trigger + Worker

```sql
-- Add URS fields to products table
ALTER TABLE products ADD COLUMN urs DECIMAL(6,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN urs_components JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN urs_calculated_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'physical_direct';
  -- 'physical_direct', 'physical_local', 'digital_product', 'ai_tool', 'affiliate'

CREATE INDEX idx_products_urs ON products(urs DESC);
CREATE INDEX idx_products_urs_platform ON products(platform, urs DESC);
CREATE INDEX idx_products_type ON products(product_type);
```

### New Worker: W36 (ranking_worker)

```
W36: ranking_recalculation_worker
Queue: system_jobs
Priority: P1 (high — affects all dashboard views)
Triggers:
  - Immediate: product_costs change, sourcing_queue change, marketing_plans change, content_queue change
  - Scheduled: Daily cron for freshness decay + every 6 hours for performance data
Process:
  → Read product + all related data (costs, profitability, marketing plans, content, performance)
  → Calculate each URS component
  → Apply platform_multiplier and type_multiplier
  → Store: urs, urs_components (JSONB breakdown), urs_calculated_at
  → Update product record
Downstream: Dashboard queries ORDER BY urs DESC
```

## 4E. Dashboard Ranking Views

The admin dashboard shows rankings in multiple contexts:

### 1. Global Ranking (Default Dashboard View)
```
SELECT p.*, pc.is_confirmed, pa.viability_verdict, mp.status as plan_status
FROM products p
LEFT JOIN product_costs pc ON pc.product_id = p.id AND pc.is_confirmed = true
LEFT JOIN profitability_analysis pa ON pa.product_id = p.id AND pa.is_confirmed = true
LEFT JOIN marketing_plans mp ON mp.product_id = p.id
WHERE p.status = 'active'
ORDER BY p.urs DESC
LIMIT 50;
```

Shows: Rank #, Product, Platform, URS Score, Tier Badge, Pipeline Stage, Key Action Needed

### 2. Platform-Specific Rankings
```
-- "Show me the top TikTok products right now"
WHERE p.platform = 'tiktok' ORDER BY p.urs DESC

-- "Show me the top digital products"
WHERE p.platform = 'digital' ORDER BY p.urs DESC
```

### 3. Pipeline Stage Rankings
```
-- "Which products need pricing confirmation most urgently?"
WHERE sq.queue_status = 'pending_review'
ORDER BY sq.priority_rank DESC  -- priority_rank = URS at time of queue entry

-- "Which marketing plans should I approve first?"
WHERE mp.status = 'pending_approval'
ORDER BY p.urs DESC
```

### 4. Opportunity Leaderboard (NEW Dashboard Widget)

```
┌──────────────────────────────────────────────────────────────┐
│ TOP OPPORTUNITIES RIGHT NOW                    Last updated: │
│                                                    2 min ago │
├──┬────────────────────┬──────┬──────┬────────┬──────────────┤
│# │ Product            │ URS  │ Tier │ Stage  │ Next Action  │
├──┼────────────────────┼──────┼──────┼────────┼──────────────┤
│1 │ LED Sunset Lamp    │ 92.4 │ HOT  │ Rising │ Approve Plan │
│2 │ AI Writing Tool    │ 89.1 │ HOT  │ Explod │ Confirm Price│
│3 │ Yoga Mat Premium   │ 84.7 │ HOT  │ Rising │ Review Mktg  │
│4 │ Phone Grip Stand   │ 78.3 │ WARM │ Emerging│ Find Supplier│
│5 │ Resin Art Kit      │ 75.6 │ WARM │ Rising │ Approve Plan │
│6 │ AI Photo Editor    │ 73.2 │ WARM │ Explod │ Published ✓  │
│7 │ Portable Blender   │ 71.8 │ WARM │ Emerging│ Confirm Price│
│8 │ Course Template    │ 68.4 │ WARM │ Stable │ Need Content │
│9 │ Magnetic Charger   │ 65.1 │ WARM │ Rising │ In Production│
│10│ Candle Making Kit  │ 61.3 │ WARM │ Emerging│ Find Supplier│
└──┴────────────────────┴──────┴──────┴────────┴──────────────┘
│ Filters: [All] [TikTok] [Amazon] [Digital] [Physical] [AI] │
│ Sort: [URS ▼] [Margin] [Freshness] [Delivery] [Score]      │
└──────────────────────────────────────────────────────────────┘
```

## 4F. Physical vs Digital Product Handling

The ranking system treats physical and digital products differently at every stage:

### Physical Products (TikTok, Amazon, Shopify, Pinterest, Physical Affiliate)

| Metric | Weight | Why |
|--------|--------|-----|
| Delivery speed | HIGH | Customers expect fast shipping, affects conversion |
| Supplier reliability | HIGH | Stockouts kill momentum |
| Gross margin | MEDIUM | Must cover shipping + platform fees + returns |
| Trend velocity | HIGH | Physical trends have shorter lifecycles |
| Inventory risk | MEDIUM | Unsold inventory = loss |

**Physical products auto-rejection rules:**
- No supplier found within 48 hours of discovery → demote by 20 URS points
- Delivery > 15 days AND trend_stage = 'exploding' → flag as "shipping too slow for trend"
- Margin < 30% after confirmed pricing → demote to MODERATE or WEAK

### Digital Products (Digital, AI Affiliate)

| Metric | Weight | Why |
|--------|--------|-----|
| Delivery speed | N/A | Instant delivery |
| Recurring revenue | HIGH | LTV multiplier |
| Commission rate | HIGH | Determines profitability |
| Market education | MEDIUM | New categories need more content |
| Content angle diversity | HIGH | More angles = more content = more reach |

**Digital products advantages in ranking:**
- No delivery penalty (delivery_score always = 100)
- No supplier_score concern (supplier_score = 80 baseline for established platforms)
- confirmation_bonus defaults to 80 (pricing is usually transparent)
- This means digital products naturally score higher on purchasing_component
- Balanced by lower platform_multiplier for affiliates (0.85-1.00)

### Blended Rankings

When showing ALL products together, the type_multiplier ensures fair comparison:
- A physical product with $6 cost, 58% margin, 3-day delivery, confirmed pricing → URS ~82
- A digital product with 30% affiliate commission, recurring, growing → URS ~79
- An AI tool with 40% commission, cookie 90 days, exploding → URS ~85

The multipliers are calibrated so the **best opportunities surface regardless of type**, while accounting for the structural differences between physical shipping products and digital/affiliate products.

---

# PART 5: FINAL-STAGE INTEGRATION BLUEPRINT PROMPT

---

## 5A. The Integration Prompt

This prompt is designed to be given to Claude in a NEW session to produce the final implementation-ready blueprint that merges all new components (Engines 1-3, Ranking System, Two Human Checkpoints) with the existing tested codebase.

---

### PROMPT: YOUSELL Final-Stage Blueprint Integration

```
You are tasked with producing the FINAL IMPLEMENTATION BLUEPRINT for the YOUSELL platform.
This blueprint will be used by developers to integrate new components into the existing,
tested codebase WITHOUT breaking anything that currently works.

## YOUR TASK

Produce a single, comprehensive, implementation-ready document that:

1. Maps every new component to exact file locations in the existing codebase
2. Specifies the exact integration points (which existing files change, which new files are created)
3. Defines the execution order (what gets built first, what depends on what)
4. Identifies every potential conflict between new and existing code
5. Provides migration scripts for all database changes
6. Includes test specifications for every new component
7. Specifies rollback procedures for each integration step

## EXISTING CODEBASE (TESTED & WORKING)

Read and understand these files before making any decisions:

### Core Architecture
- /home/user/yousell-admin/CLAUDE.md (project context)
- /home/user/yousell-admin/ai/architecture.md (system architecture)
- /home/user/yousell-admin/ai/project_state.md (current development state)
- /home/user/yousell-admin/ai/task_board.md (task tracking)

### Scoring Engine (TESTED — DO NOT BREAK)
- /home/user/yousell-admin/src/lib/scoring/composite.ts
  → calculateCompositeScore(), calculateTrendScore(), calculateViralScore(),
    calculateProfitScore(), calculateFinalScore(), shouldRejectProduct()
  → INTEGRATION POINT: URS calculation wraps around these existing functions
  → RULE: These functions MUST NOT be modified. URS builds ON TOP of them.

- /home/user/yousell-admin/backend/src/lib/scoring.ts
  → Backend scoring implementation
  → INTEGRATION POINT: Worker pipeline applies scoring before URS

### Type System (TESTED — EXTEND ONLY)
- /home/user/yousell-admin/src/lib/types/product.ts
  → ProductPlatform, ProductChannel, TrendStage, TierBadge, Product interface
  → INTEGRATION POINT: Add new fields (urs, urs_components, product_type)
    to Product interface. DO NOT remove or rename existing fields.

### Provider Config (TESTED — EXTEND ONLY)
- /home/user/yousell-admin/src/lib/providers/config.ts
  → 18 provider definitions with phases 1-15
  → INTEGRATION POINT: Add new providers (CJDropshipping API, AliExpress
    Affiliate API) at appropriate phases. DO NOT modify existing providers.

### Platform Providers (TESTED — EXTEND ONLY)
- /home/user/yousell-admin/src/lib/providers/tiktok.ts
- /home/user/yousell-admin/src/lib/providers/amazon.ts
- /home/user/yousell-admin/src/lib/providers/shopify.ts
- /home/user/yousell-admin/src/lib/providers/pinterest.ts
- /home/user/yousell-admin/src/lib/providers/digital/index.ts
- /home/user/yousell-admin/src/lib/providers/affiliate/index.ts
  → RULE: Existing scraping logic must continue to work unchanged.
  → New supplier lookup logic is SEPARATE (new files, not modifications).

### API Routes (TESTED — EXTEND WITH NEW ROUTES)
- /home/user/yousell-admin/src/app/api/admin/products/route.ts
  → INTEGRATION POINT: Add URS sorting option, add pipeline stage filters
  → RULE: Existing sort/filter options must continue to work.

- /home/user/yousell-admin/src/app/api/admin/allocations/route.ts
  → INTEGRATION POINT: Client allocation should factor in URS ranking
  → RULE: Existing allocation logic must not break.

- /home/user/yousell-admin/src/app/api/dashboard/products/route.ts
  → INTEGRATION POINT: Client view should show ranked products
  → RULE: Existing client queries must not break.

### Database Migrations (EXISTING)
- /home/user/yousell-admin/supabase/migrations/005_complete_schema.sql
  → Current schema including: products, product_allocations, viral_signals,
    product_requests, automation_jobs
  → INTEGRATION POINT: New migration files for: product_costs, sourcing_queue,
    local_suppliers, profitability_analysis, marketing_plans, content_queue,
    published_content, content_performance + ALTER products ADD urs columns

### Backend Worker (TESTED — EXTEND)
- /home/user/yousell-admin/backend/src/worker.ts
  → Current scan job processing pipeline
  → INTEGRATION POINT: After scoring, trigger Engine 1 (supplier lookup)
  → RULE: Existing scan→score→upsert pipeline must not break.

### Admin Dashboard (TESTED — EXTEND)
- /home/user/yousell-admin/src/app/admin/clients/page.tsx
  → PACKAGE_TIERS defined here
  → INTEGRATION POINT: Sourcing Queue page, Marketing Approval page,
    Opportunity Leaderboard widget

## NEW COMPONENTS TO INTEGRATE

Read the complete specification from:
- /home/user/yousell-admin/ai/YOUSELL_AGENCY_BLUEPRINT.md

Specifically integrate:

### Engine 1: Three-Phase Smart Sourcing
- W1 (Supplier Lookup with delivery intelligence)
- W2 (Preliminary Cost Calculator)
- W3 (Preliminary Profitability Screen)
- W3B (Sourcing Queue Placement)
- W3C (Confirmed Cost Recalculation)
- W3D (Final Profitability Analysis)
- Sourcing Queue UI (admin dashboard page)
- Database: product_costs, sourcing_queue, local_suppliers tables

### Engine 2: Profitability Intelligence
- Dual-pass analysis (preliminary in Phase 1, final in Phase 3)
- Claude Haiku batch + Sonnet escalation
- Database: profitability_analysis table

### Engine 3: Content & Marketing with Approval Gate
- W4 (Marketing Plan Generator — Claude Sonnet)
- W4B (Marketing Approval Queue)
- W4C (Plan Execution Trigger)
- W5-W10 (Content production + publishing)
- Marketing Approval UI (admin dashboard page)
- Database: marketing_plans, content_queue, published_content tables

### Intelligent Product Ranking System
- Unified Ranking Score (URS) calculation with category-specific weights
- 5-component ranking model (discovery, purchasing/commission, marketing, momentum, performance)
- Platform-specific ranking criteria
- Physical vs digital product handling
- URS recalculation triggers
- Opportunity Leaderboard dashboard widget
- W36 (ranking_recalculation_worker)

### Product Classification & Gating (PART 6)
- Four product categories: digital/AI/SaaS, branded physical, white label physical, physical affiliate
- Brand gating intelligence (Amazon SP-API + TikTok manual + Shopify legal assessment)
- W1B (brand gating check worker)
- Brand authorization upload workflow
- Platform-specific go-to-market strategies per category
- Database: brand_gating, affiliate_programs, affiliate_links tables
- Products table: +product_category, +is_branded, +brand_name, +gating_decision, +selling_strategy

### Intelligence Memory & Learning System (PART 7)
- 5-layer architecture: outcome capture → pattern recognition → memory retrieval → score recalibration → confidence calibration
- Supabase pgvector for semantic lesson retrieval
- Memory-enhanced Claude prompts (inject relevant lessons into analysis)
- Self-improving scoring weights with admin approval gate
- Workers: W37 (outcome collector), W38 (pattern recognizer), W40 (score recalibrator)
- Database: prediction_log, memory_aggregates, memory_lessons (pgvector), score_recalibrations

## OUTPUT FORMAT

Produce your blueprint in these sections:

### SECTION 1: Dependency Graph
Show which components depend on which others. Identify the critical path.
Show which existing tested components are affected and HOW.

### SECTION 2: Database Migration Plan
- Exact SQL for each new table and ALTER statement
- Migration ordering (which tables must exist before others)
- Rollback SQL for each migration
- Data backfill strategy for existing products (URS initial calculation)

### SECTION 3: File-by-File Integration Map
For EVERY file that changes, specify:
- File path
- What changes (new exports, modified functions, new imports)
- What MUST NOT change (existing tested functionality)
- New files to create and their exact locations

### SECTION 4: Implementation Phases
Break the work into phases that can be deployed incrementally:
- Phase A: Database schema + types (no functional changes)
- Phase B: Engine 1 backend (supplier lookup + cost calc)
- Phase C: Sourcing Queue UI
- Phase D: Engine 2 backend (profitability analysis)
- Phase E: URS ranking system
- Phase F: Engine 3 backend (marketing plans)
- Phase G: Marketing Approval UI
- Phase H: Content production workers (n8n)
- Phase I: Publishing + performance tracking

Each phase must be deployable independently without breaking previous phases.

### SECTION 5: Test Specifications
For each new component:
- Unit tests (function-level)
- Integration tests (API route + database)
- E2E tests (full workflow)
- Regression tests (ensure existing functionality unaffected)

### SECTION 6: Conflict Risk Assessment
Identify every place where new code could break existing code:
- Shared database tables (products table gets new columns)
- Shared API routes (new query params on existing routes)
- Shared types (Product interface extensions)
- Shared worker pipeline (post-scoring trigger)
- Frontend shared state (dashboard layout changes)

For each conflict, specify:
- Risk level (LOW/MEDIUM/HIGH)
- Mitigation strategy
- Rollback procedure

### SECTION 7: n8n Workflow Configuration
- Which workflows run on n8n vs Express backend
- BullMQ bridge configuration
- Webhook endpoints needed
- Environment variables needed
- Worker concurrency settings

### SECTION 8: Deployment Checklist
Step-by-step deployment order with verification at each step.
Include smoke tests to run after each deployment step.
```

---

## 5B. QA Session Prompt

This prompt is for a SEPARATE Claude session focused exclusively on QA — verifying that new components don't break existing tested functionality.

---

### PROMPT: YOUSELL Integration QA Audit

```
You are a QA architect tasked with auditing the integration of new components into
the YOUSELL platform. Your job is to find every potential synchronization issue,
conflict, and regression risk BEFORE any code is written.

## CRITICAL CONTEXT

The YOUSELL platform has a TESTED, WORKING codebase. New components are being added:
- Engine 1: Three-Phase Smart Sourcing (supplier lookup, cost calc, sourcing queue)
- Engine 2: Profitability Intelligence (AI viability analysis)
- Engine 3: Content & Marketing with Approval Gate
- Intelligent Product Ranking System (Unified Ranking Score)

## YOUR QA AUDIT TASKS

### TASK 1: Existing Component Inventory
Read every file in the codebase and create a complete inventory of:
- Tested functions and their signatures
- Database queries and which tables/columns they reference
- API endpoints and their request/response contracts
- Frontend components and their prop interfaces
- Worker pipeline stages and their data flow

Files to audit:
- /home/user/yousell-admin/src/lib/scoring/composite.ts
- /home/user/yousell-admin/src/lib/types/product.ts
- /home/user/yousell-admin/src/lib/providers/*.ts
- /home/user/yousell-admin/src/app/api/**/*.ts
- /home/user/yousell-admin/src/app/admin/**/*.tsx
- /home/user/yousell-admin/backend/src/**/*.ts
- /home/user/yousell-admin/supabase/migrations/*.sql

### TASK 2: New Component Specification Review
Read the complete blueprint:
- /home/user/yousell-admin/ai/YOUSELL_AGENCY_BLUEPRINT.md

For each new component, identify:
- Which existing functions it calls
- Which existing database tables it reads/writes
- Which existing API routes it extends
- Which existing types it depends on

### TASK 3: Conflict Detection Matrix
Create a matrix mapping every NEW component to every EXISTING component it touches.
Rate each intersection as:
- GREEN: No interaction
- YELLOW: Read-only interaction (new reads existing data)
- ORANGE: Extend interaction (new adds columns/routes/types to existing)
- RED: Modify interaction (new changes existing behavior)

For every ORANGE and RED intersection, specify:
- What exactly changes
- What could break
- How to test it
- How to roll back

### TASK 4: Database Synchronization Audit
- Do new tables have proper foreign keys to existing tables?
- Do ALTER statements on existing tables affect existing queries?
- Do new indexes conflict with existing query performance?
- Are existing UNIQUE constraints preserved?
- Do new columns have safe defaults for existing rows?

### TASK 5: Worker Pipeline Synchronization
- Does the new post-scoring trigger (Engine 1) affect existing scan timing?
- Could new BullMQ queues (intelligence_jobs, content_jobs) starve existing queues?
- Are Redis connection limits adequate for new queue count?
- Does n8n webhook communication create timing dependencies?

### TASK 6: Frontend Synchronization
- Do new dashboard pages affect existing navigation/layout?
- Do Product interface additions break existing component renders?
- Do new API query params on existing routes affect current frontend calls?
- Are Supabase Realtime subscriptions compatible with new table changes?

### TASK 7: Regression Test Plan
Write a complete test plan covering:
- Every existing feature that could be affected
- Specific test cases with expected results
- Data setup requirements
- Environment requirements
- Pass/fail criteria

### TASK 8: Safe Integration Sequence
Based on all findings, produce a recommended integration sequence that:
- Minimizes risk at each step
- Allows rollback at each step
- Can be verified independently at each step
- Never leaves the system in a broken intermediate state

## OUTPUT FORMAT

Produce a structured report with:
1. Executive Summary (critical risks found)
2. Conflict Detection Matrix
3. Risk items ranked by severity
4. Recommended integration sequence
5. Complete regression test plan
6. Rollback procedures for each integration step
```

---

## 5C. When To Run Each Prompt

| Prompt | When | Purpose |
|--------|------|---------|
| **Integration Blueprint (5A)** | Before coding starts | Produces the implementation plan |
| **QA Audit (5B)** | After blueprint is approved, before coding starts | Validates the plan won't break anything |
| **QA Re-Audit** | After each implementation phase deploys | Verifies nothing broke |

### Recommended Workflow:

1. **Run Integration Blueprint prompt (5A)** → produces implementation plan
2. **Run QA Audit prompt (5B)** → identifies risks in the plan
3. Fix any issues found by QA
4. **Implement Phase A** (database + types)
5. **Run QA Re-Audit** on Phase A
6. **Implement Phase B** (Engine 1 backend)
7. **Run QA Re-Audit** on Phase B
8. Continue pattern for each phase...

This ensures no phase introduces regressions.

---

---

# PART 6: PRODUCT CLASSIFICATION & STRATEGY OVERHAUL

---

## 6A. The Four Product Categories

The platform previously treated all products similarly. This is wrong. There are FOUR fundamentally different product types, each requiring a different go-to-market strategy:

```
REVENUE POTENTIAL / OPERATIONAL SIMPLICITY

                    HIGH MARGIN, ZERO FRICTION
                            ↑
    ┌───────────────────────────────────────────┐
    │  CATEGORY 1: DIGITAL / AI / SaaS          │
    │  Commission: 20-50% RECURRING              │
    │  Delivery: Instant                         │
    │  Overhead: Zero                            │
    │  LTV: $720+ per referral (30% × $100 × 24mo)│
    │  Examples: Copy.ai, Notion, Webflow        │
    │  GO-TO-MARKET: Faceless content → affiliate │
    └───────────────────────────────────────────┘
                            │
    ┌───────────────────────────────────────────┐
    │  CATEGORY 2: BRANDED PHYSICAL (GATED)      │
    │  Margin: 40-60%                            │
    │  Delivery: Depends on supplier             │
    │  Overhead: Moderate (sourcing, auth docs)  │
    │  LTV: $50-200 per sale + repeat            │
    │  Strategy: Shopify landing pages +          │
    │            influencer traffic               │
    │  GO-TO-MARKET: Brand auth → Shopify → ads  │
    └───────────────────────────────────────────┘
                            │
    ┌───────────────────────────────────────────┐
    │  CATEGORY 3: WHITE LABEL PHYSICAL (UNGATED)│
    │  Margin: 30-50%                            │
    │  Delivery: 2-14 days depending on source   │
    │  Overhead: High (shipping, returns, trust) │
    │  LTV: $21 per sale average                 │
    │  Strategy: TikTok Shop / Amazon direct      │
    │  GO-TO-MARKET: Creator partnerships → volume│
    └───────────────────────────────────────────┘
                            │
    ┌───────────────────────────────────────────┐
    │  CATEGORY 4: PHYSICAL AFFILIATE            │
    │  Commission: 3-10% one-time                │
    │  Delivery: Handled by merchant             │
    │  Overhead: Minimal                         │
    │  LTV: Low ($2-15 per sale)                 │
    │  Strategy: Volume content → affiliate links │
    │  GO-TO-MARKET: SEO + social content        │
    └───────────────────────────────────────────┘
                            ↓
                    LOW MARGIN, HIGH FRICTION
```

### Revenue Comparison (Per Product, Per Month)

| Category | Revenue/Product/Month | Effort Required | Scalability |
|----------|----------------------|-----------------|-------------|
| **Digital/AI/SaaS** | $50-300 (recurring) | Low (content only) | Infinite |
| **Branded Physical** | $100-500 (per sale volume) | Medium (sourcing + Shopify) | Limited by inventory |
| **White Label Physical** | $50-200 (per sale volume) | High (full operations) | Limited by shipping/ops |
| **Physical Affiliate** | $5-30 (per referral) | Low (content only) | Infinite |

### Strategic Priority Shift

**BEFORE (old approach):**
Physical products first → digital as afterthought

**AFTER (new approach):**
1. **Digital/AI/SaaS: PRIMARY REVENUE ENGINE** — highest margin, zero friction, recurring
2. **Branded Physical via Shopify: HIGH-VALUE PHYSICAL** — when brand auth available
3. **White Label Physical: VOLUME PLAY** — TikTok Shop / Amazon for ungated products
4. **Physical Affiliate: PASSIVE INCOME** — low effort, supplementary revenue

### Updated Platform-Product Matrix

| Discovery Platform | Cat 1: Digital/AI | Cat 2: Branded | Cat 3: White Label | Cat 4: Phys Affiliate |
|---|---|---|---|---|
| **TikTok** | Promote AI tools via creators | Shopify landing page | TikTok Shop direct | Amazon affiliate links |
| **Amazon** | N/A | Amazon (if ungated) or Shopify | Amazon direct | Amazon Associates |
| **Shopify** | Discover trending digital stores | Shopify (our store) | Shopify (our store) | N/A |
| **Pinterest** | Promote templates/courses | Shopify landing page | Shopify/Amazon | Affiliate pins |
| **Product Hunt** | Discover new AI tools | N/A | N/A | N/A |
| **Digital platforms** | Discover courses/templates | N/A | N/A | N/A |

---

## 6B. Digital / AI / SaaS Priority Strategy

### Why This Is Now Priority #1

Research confirmed:
- **Single SaaS referral at 30% recurring on $100/mo = $720 LTV** over 24 months
- **vs $21 profit** from a single dropshipped physical product
- **34x more lifetime value per referral**, with zero shipping, zero returns, zero customer service
- Copy.ai (45%), Notion (50% first year), Webflow (50% first year), ClickFunnels (30-40% lifetime)
- Faceless creators earning **$80K+/month** with 15-20 AI-generated videos
- 80% of affiliate marketers now use AI tools for content creation

### Digital/AI Product Discovery Pipeline

```
SOURCES:
  → Product Hunt API (trending AI tools, phase 11)
  → Gumroad / Lemon Squeezy (trending digital products)
  → AI tool directories (There's An AI For That, FutureTools, etc.)
  → SaaS review platforms (G2, Capterra — trending tools)
  → TikTok trending AI content (which tools are creators promoting?)
  → Reddit r/SaaS, r/Entrepreneur, r/artificial (community signals)

SCORING (Digital-Specific):
  → Commission rate (higher = better)
  → Commission type (recurring >>> one-time)
  → Cookie duration (longer = better)
  → Tool growth rate (Product Hunt upvotes, G2 reviews growth)
  → Content angle count (how many ways can we promote it?)
  → Market awareness (established enough for people to search for it)
  → Existing affiliate competition (saturated or opportunity?)

CONTENT STRATEGY:
  → "[Tool] Review" — faceless video showing the tool in action
  → "[Tool A] vs [Tool B]" — comparison content (highest conversion rate)
  → "How I [achieved result] with [Tool]" — results-driven content
  → "Best AI tools for [use case]" — listicle format
  → Tutorial/walkthrough content — long-form value content

MONETIZATION:
  → Affiliate links in bio, description, pinned comment
  → Shopify landing page with affiliate redirect (for branded content)
  → Email list building → nurture → promote tools
  → YouTube SEO content (evergreen affiliate traffic)
```

### Affiliate Link Management

```
affiliate_programs table:
  id, program_name, platform (copy_ai, notion, etc.)
  commission_rate, commission_type (one_time, recurring, tiered)
  cookie_duration_days, payout_threshold, payout_frequency
  affiliate_link_template, tracking_api_url, api_key
  status (active, paused, pending_approval)
  total_referrals, total_revenue, avg_ltv
  created_at, updated_at

affiliate_links table:
  id, program_id, product_id
  affiliate_url, short_url, utm_params
  platform_posted (tiktok, youtube, instagram, etc.)
  clicks, conversions, revenue
  created_at
```

---

## 6C. Brand Gating Intelligence Layer

### The Problem

When the system discovers a trending branded product (e.g., a viral Nike shoe), it needs to IMMEDIATELY know:
1. Is this brand gated on Amazon? (likely yes for Nike)
2. Is this brand gated on TikTok Shop? (maybe not)
3. Can we sell it on Shopify? (yes, if legitimately sourced)
4. Do we have brand authorization? (check our docs)
5. What's the right go-to-market strategy given gating status?

### Platform-Specific Gating Detection

**Amazon: Programmatic (API Available)**
```
Amazon SP-API → Listings Restrictions API (v2021-08-01)
  GET /listings/2021-08-01/restrictions
  Params: asin, marketplaceIds, sellerId
  Response:
    → Empty restrictions = UNGATED ✓
    → APPROVAL_REQUIRED = GATED (can apply with docs)
    → NOT_ELIGIBLE = BLOCKED (cannot sell)
```

**TikTok Shop: Manual + Database (No API)**
```
No public API for gating checks.
Strategy:
  → Maintain curated list of known gated brands/categories
  → Admin manually checks Seller Center when a new brand is flagged
  → Store results in brand_gating table for future reference
  → Flag categories known to require pre-approval:
    Beauty, Electronics, Children's, Jewelry, Medical Devices
```

**Shopify: Always Ungated**
```
No platform gating on Shopify.
Legal risk assessment instead:
  → Is the brand known for aggressive IP enforcement? (flag)
  → Do we have legitimate sourcing? (check)
  → Are we using trademarks appropriately? (check)
```

### The Brand Gating Database

```sql
-- Brand gating status across platforms (one-off lookup, cached for reference)
CREATE TABLE brand_gating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  brand_normalized TEXT NOT NULL, -- lowercase, trimmed for matching

  -- Platform-specific gating status
  amazon_status TEXT DEFAULT 'unknown',
    -- 'ungated', 'gated_approval_required', 'gated_blocked', 'unknown'
  amazon_asin_checked TEXT,           -- ASIN used for the check
  amazon_checked_at TIMESTAMPTZ,
  amazon_ungating_docs_required TEXT, -- 'invoices', 'brand_letter', etc.

  tiktok_status TEXT DEFAULT 'unknown',
    -- 'ungated', 'authorization_required', 'category_restricted', 'unknown'
  tiktok_checked_at TIMESTAMPTZ,
  tiktok_auth_tier_needed TEXT,       -- 'trademark_owner', 'first_level', 'second_level'

  shopify_status TEXT DEFAULT 'ungated', -- always ungated at platform level
  shopify_legal_risk TEXT DEFAULT 'unknown',
    -- 'low' (generic/small brand), 'medium' (known brand, not aggressive),
    -- 'high' (known for IP enforcement: Nike, Apple, Disney)

  -- Brand authorization status
  has_brand_authorization BOOLEAN DEFAULT false,
  authorization_doc_url TEXT,          -- uploaded proof document
  authorization_platforms TEXT[],      -- which platforms the auth covers
  authorization_expires_at TIMESTAMPTZ,
  authorization_uploaded_by TEXT,
  authorization_verified BOOLEAN DEFAULT false,

  -- Metadata
  category TEXT,
  ip_enforcement_aggressiveness TEXT,  -- 'low', 'medium', 'high'
  notes TEXT,
  last_updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_normalized)
);

CREATE INDEX idx_brand_gating_name ON brand_gating(brand_normalized);
CREATE INDEX idx_brand_gating_amazon ON brand_gating(amazon_status);
CREATE INDEX idx_brand_gating_tiktok ON brand_gating(tiktok_status);
```

### Product Gating Check Workflow (W1B — NEW)

```
W1B: Brand Gating Check (runs in parallel with W1 Supplier Lookup)
Trigger: Product scored >= 60 AND product appears to be branded

→ Extract brand name from product title/metadata
→ Normalize brand name (lowercase, strip suffixes)
→ CHECK brand_gating table:
  → IF brand exists with recent check (< 30 days): use cached status
  → IF brand NOT in table OR stale:
    → IF product has Amazon ASIN:
      → Call Amazon Listings Restrictions API
      → Store result in brand_gating table
    → For TikTok: flag as 'unknown' (admin will manually check)
    → Shopify: always 'ungated', assess legal risk by brand recognition

→ DECISION TREE:
  ┌─────────────────────────────────────────────────────────────┐
  │ Is it a branded product?                                    │
  │   NO → Category 3 (White Label) → standard pipeline        │
  │   YES ↓                                                     │
  │                                                             │
  │ Check gating status per platform:                           │
  │                                                             │
  │ Amazon: UNGATED + TikTok: UNGATED                          │
  │   → Category 3 path (sell on both platforms directly)       │
  │                                                             │
  │ Amazon: GATED + TikTok: UNGATED                            │
  │   → Sell on TikTok Shop (no auth needed)                   │
  │   → Consider Shopify for broader reach                     │
  │   → Flag: "Gated on Amazon, TikTok opportunity"            │
  │                                                             │
  │ Amazon: UNGATED + TikTok: AUTH REQUIRED                    │
  │   → Sell on Amazon (no auth needed)                        │
  │   → Consider Shopify for TikTok influencer traffic         │
  │                                                             │
  │ Amazon: GATED + TikTok: AUTH REQUIRED                      │
  │   → Do we have brand authorization?                        │
  │     YES → Proceed on both platforms                        │
  │     NO  → Flag for admin: "HIGH POTENTIAL but GATED"       │
  │           → Admin must upload brand auth docs              │
  │           → Meanwhile: Shopify-only strategy (legal risk?) │
  │           → DO NOT proceed with marketing until auth       │
  │             confirmed or admin explicitly approves          │
  │                                                             │
  │ All platforms BLOCKED + No auth possible                   │
  │   → Archive product OR redirect to Shopify-only strategy   │
  └─────────────────────────────────────────────────────────────┘

→ Store gating_decision on product record
→ Route to appropriate sourcing/marketing strategy
```

### Brand Authorization Workflow

When a high-potential product is gated on all desired platforms:

```
1. System flags product in Sourcing Queue:
   "⚠️ HIGH POTENTIAL (score 87) but GATED on Amazon + TikTok.
    Brand: [Brand Name]
    Required: Brand authorization document
    Options: Upload auth docs OR approve Shopify-only strategy"

2. Admin actions:
   → [UPLOAD AUTHORIZATION] — Admin uploads brand auth letter/invoice
     → Document stored in Supabase Storage
     → Link saved to brand_gating.authorization_doc_url
     → authorization_platforms set (e.g., ['amazon', 'tiktok'])
     → System rechecks: can now sell on authorized platforms
     → Proceeds to normal pipeline

   → [SHOPIFY ONLY] — Accept selling only on Shopify
     → product.selling_strategy = 'shopify_only'
     → Legal risk assessment applied
     → Marketing plan targets Shopify landing page + influencer traffic
     → No platform marketplace listings

   → [SKIP] — Don't pursue this product
     → Product archived with reason: 'brand_gated_no_auth'

3. Admin uploads brand auth LATER:
   → System re-evaluates ALL archived/gated products for that brand
   → Automatically moves newly-eligible products back into pipeline
   → "You uploaded Nike authorization → 7 previously-gated Nike
      products can now be listed on Amazon"
```

---

## 6D. Platform-Specific Go-To-Market Strategies

### Category 1: Digital / AI / SaaS Products

```
DISCOVERY → SCORING → AFFILIATE SIGNUP → CONTENT CREATION → PUBLISH → TRACK

No sourcing queue needed (no physical product to source).
No shipping, no gating, no supplier lookup.

Pipeline shortcut:
  Discovery → Digital Scoring → Marketing Plan → Content → Publish

Sourcing Queue equivalent: "Affiliate Program Verification"
  → Is the affiliate program legitimate?
  → What's the commission structure?
  → Is there an API for tracking?
  → Admin confirms: "Yes, sign up for this affiliate program"

Content types (ordered by conversion rate):
  1. "[Tool A] vs [Tool B]" comparison (highest intent)
  2. Tutorial / walkthrough (high trust)
  3. "Best tools for [use case]" listicle (broad reach)
  4. Review / demo (standard)
  5. "How I [result] with [tool]" (aspiration)
```

### Category 2: Branded Physical (Gated)

```
DISCOVERY → GATING CHECK → AUTH STATUS → SOURCING → SHOPIFY STRATEGY → CONTENT → PUBLISH

Key difference: Shopify-first strategy
  → Create branded product landing page on Shopify
  → Drive influencer/ad traffic to Shopify page
  → Bypass platform gating entirely
  → Still check if ungated on any platform (bonus channel)

Sourcing approach:
  → Wholesale sourcing (legitimate brand distributors)
  → China sourcing (branded products at wholesale from authorized factories)
  → Admin may have personal supplier contacts for branded goods

Marketing approach:
  → Influencer partnerships with Shopify links
  → TikTok/Instagram ads → Shopify landing page
  → SEO content targeting "[Brand Product] buy" keywords
  → Cannot use brand trademarks in ads without authorization

Pricing strategy:
  → Price at or slightly below retail (brand recognition carries trust)
  → Don't undercut aggressively (MAP policies may apply)
  → Factor in marketing costs (influencer + ads) into margin calculation
```

### Category 3: White Label Physical (Ungated)

```
DISCOVERY → SUPPLIER LOOKUP → SOURCING QUEUE → CONFIRMED PRICING → MARKETING PLAN → CONTENT → PUBLISH

This is the CURRENT pipeline (no changes needed).
The three-phase purchasing engine applies here.

Key challenge: Trust
  → No brand recognition → higher marketing spend needed
  → Creator partnerships essential (78% of TikTok shoppers trust creator recommendations)
  → Building basic brand identity helps (even just a name + consistent packaging)

Best platforms:
  → TikTok Shop (creator-driven trust, impulse buying)
  → Amazon (if product fits a niche, can build organic rank)
  → Shopify (for premium positioning with good photography)

Marketing approach:
  → High volume of creator content (more creators = more trust signals)
  → UGC-style content (authentic feel)
  → Price aggressively to compensate for no brand recognition
  → "Ships from US in 2-3 days" as key differentiator
```

### Category 4: Physical Affiliate

```
DISCOVERY → AFFILIATE PROGRAM CHECK → CONTENT CREATION → PUBLISH → TRACK

Similar to Category 1 but lower commissions (3-10% one-time).
Amazon Associates, Walmart, Target, eBay partner programs.

Primarily supplementary income:
  → Create comparison/review content
  → Embed affiliate links
  → Volume play — many products, many pieces of content
  → Passive income that compounds
```

---

## 6E. Updated Database Fields

```sql
-- Add product classification fields to products table
ALTER TABLE products ADD COLUMN product_category TEXT DEFAULT 'white_label_physical';
  -- 'digital_ai_saas', 'branded_physical', 'white_label_physical', 'physical_affiliate'

ALTER TABLE products ADD COLUMN is_branded BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN brand_name TEXT;
ALTER TABLE products ADD COLUMN brand_gating_id UUID REFERENCES brand_gating(id);

ALTER TABLE products ADD COLUMN gating_decision JSONB DEFAULT '{}';
  -- {
  --   amazon: 'ungated' | 'gated' | 'blocked' | 'unknown',
  --   tiktok: 'ungated' | 'auth_required' | 'restricted' | 'unknown',
  --   shopify: 'ungated',
  --   recommended_strategy: 'all_platforms' | 'tiktok_only' | 'amazon_only' | 'shopify_only' | 'needs_auth',
  --   auth_required: boolean,
  --   auth_uploaded: boolean
  -- }

ALTER TABLE products ADD COLUMN selling_strategy TEXT DEFAULT 'auto';
  -- 'auto', 'all_platforms', 'tiktok_only', 'amazon_only', 'shopify_only',
  -- 'affiliate_only', 'pending_auth', 'archived_gated'

-- Index for fast category filtering
CREATE INDEX idx_products_category ON products(product_category);
CREATE INDEX idx_products_branded ON products(is_branded);
CREATE INDEX idx_products_strategy ON products(selling_strategy);
```

## 6F. Updated URS Weights By Product Category

The Unified Ranking Score weights change based on product category, because different things matter for different product types:

```
URS (Digital/AI/SaaS) =
  discovery_component    × 0.20 +   // Discovery signals still matter
  commission_component   × 0.35 +   // Commission rate + type + LTV estimate
  marketing_component    × 0.20 +   // Content readiness
  momentum_component     × 0.15 +   // Tool growth rate, market timing
  performance_component  × 0.10     // Actual affiliate revenue

URS (Branded Physical) =
  discovery_component    × 0.20 +   // Trend signals
  purchasing_component   × 0.25 +   // Sourcing + margin
  gating_component       × 0.20 +   // Auth status, platform availability
  marketing_component    × 0.20 +   // Content + Shopify readiness
  momentum_component     × 0.15     // Trend freshness

URS (White Label Physical) =
  discovery_component    × 0.25 +   // Discovery signals (unchanged)
  purchasing_component   × 0.30 +   // Margin + delivery (highest weight)
  marketing_component    × 0.20 +   // Content readiness
  momentum_component     × 0.15 +   // Freshness + trend velocity
  performance_component  × 0.10     // Actual sales data

URS (Physical Affiliate) =
  discovery_component    × 0.25 +   // Product demand signals
  commission_component   × 0.30 +   // Commission rate + program quality
  marketing_component    × 0.25 +   // Content readiness (content is everything)
  momentum_component     × 0.20     // Freshness + seasonal relevance
```

### New: Commission Component (for Digital/AI/SaaS + Physical Affiliate)

```
commission_component = (
  commission_rate_score   × 0.30 +   // Higher commission = better
  commission_type_score   × 0.30 +   // Recurring >>> one-time
  cookie_duration_score   × 0.15 +   // Longer cookie = more conversions
  program_reliability     × 0.15 +   // Payment history, program stability
  ltv_estimate            × 0.10     // Projected lifetime revenue per referral
)
```

Where:
- `commission_rate_score`: 50%+ = 100, 30-49% = 80, 20-29% = 60, 10-19% = 40, <10% = 20
- `commission_type_score`: lifetime_recurring = 100, first_year_recurring = 80, one_time = 40
- `cookie_duration_score`: 180+ days = 100, 90-179 = 80, 60-89 = 60, 30-59 = 40, <30 = 20

### New: Gating Component (for Branded Physical)

```
gating_component = (
  platform_availability   × 0.40 +   // How many platforms can we sell on?
  auth_status             × 0.35 +   // Do we have brand authorization?
  legal_risk              × 0.25     // IP enforcement aggressiveness
)
```

Where:
- `platform_availability`: ungated everywhere = 100, ungated on 2+ = 75, shopify_only = 40, blocked = 0
- `auth_status`: authorized = 100, pending_upload = 50, not_authorized = 20, not_needed = 100
- `legal_risk`: low risk = 100, medium = 60, high risk = 20

---

# PART 7: INTELLIGENCE MEMORY & LEARNING SYSTEM

---

## 7A. Architecture Overview

The platform builds institutional knowledge over time, like a human analyst who gets better at their job with experience. Five layers:

```
LAYER 1: OUTCOME CAPTURE
  Every prediction the system makes is logged.
  Every outcome is recorded when it arrives.
  "We predicted this product would be STRONG. What actually happened?"

LAYER 2: PATTERN RECOGNITION
  Weekly/monthly jobs compare predictions vs outcomes.
  Statistically significant patterns are extracted.
  "Beauty products on TikTok have 3.2x higher engagement than Amazon (n=142)"

LAYER 3: MEMORY RETRIEVAL (pgvector)
  When analyzing a new product, retrieve relevant lessons.
  Inject into Claude prompt as historical context.
  "Based on 142 similar products, here's what we've learned..."

LAYER 4: SCORE RECALIBRATION
  When enough data accumulates, propose weight adjustments.
  Admin approves before any changes take effect.
  "Our trend scores have been 12% optimistic for electronics. Propose adjustment."

LAYER 5: CONFIDENCE CALIBRATION
  Track prediction accuracy per category/platform bucket.
  Express appropriate confidence (or lack thereof) in predictions.
  "We're 78% confident in beauty product predictions but only 45% for electronics."
```

## 7B. What The System Remembers

### Tier 1: Outcome Memories (Highest Value)
- **Score-to-sales correlation:** "Products we scored 85+ actually converted at X rate"
- **Category-platform performance:** "Beauty on TikTok: avg engagement 4.2%, avg conversion 2.1%"
- **Pricing accuracy:** "Auto-fetched prices for electronics are typically 15% below actual"
- **Supplier reliability:** "CJ US warehouse delivered on time 94% of the time"
- **Gating accuracy:** "89% of products we flagged as potentially gated were indeed gated"

### Tier 2: Pattern Memories (High Value)
- **Seasonal patterns:** "Fitness products spike 3x in January, home decor 2x in October"
- **Content performance:** "Faceless comparison reels outperform single-product reviews by 2.1x in AI tools"
- **Marketing plan effectiveness:** "Plans with 3+ content pieces convert 40% better"
- **Affiliate program patterns:** "AI tools with free trials convert 3x better than direct-purchase tools"

### Tier 3: Decision Memories (Medium Value)
- **Admin override patterns:** "Admin rejects 80% of products under $12 — implicit preference"
- **Marketing plan modifications:** "Admin always removes Avatar IV hero reel for products under $20"
- **Sourcing preferences:** "Admin prefers local suppliers even at 15% higher cost"

### Tier 4: Meta-Memories (System Self-Awareness)
- **Prediction confidence calibration per bucket**
- **Data quality observations:** "Amazon price data from RapidAPI has 15% error rate"
- **System performance:** "Our marketing plans take 3.2 days average from approval to first publish"

## 7C. Database Schema

```sql
-- LAYER 1: Prediction logging
CREATE TABLE prediction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- What was predicted
  context_type TEXT NOT NULL,       -- 'product_score', 'viability', 'marketing_roi', 'price_estimate'
  context_id UUID NOT NULL,         -- product_id or marketing_plan_id
  prediction_type TEXT NOT NULL,    -- 'final_score', 'verdict', 'estimated_roi', 'delivery_days'
  predicted_value TEXT NOT NULL,    -- the prediction (stored as text for flexibility)
  predicted_numeric DECIMAL(10,2), -- numeric predictions for easy comparison
  confidence DECIMAL(3,2),          -- 0.00-1.00
  -- Context at prediction time
  product_category TEXT,
  product_platform TEXT,
  model_version TEXT,               -- scoring formula version / AI model used
  input_snapshot JSONB,             -- what data went into the prediction
  -- Outcome (filled later)
  actual_value TEXT,
  actual_numeric DECIMAL(10,2),
  outcome_delta DECIMAL(10,2),      -- predicted - actual
  outcome_recorded_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prediction_log_context ON prediction_log(context_type, context_id);
CREATE INDEX idx_prediction_log_category ON prediction_log(product_category, product_platform);
CREATE INDEX idx_prediction_log_outcome ON prediction_log(outcome_recorded_at) WHERE outcome_recorded_at IS NOT NULL;

-- LAYER 2: Aggregate pattern statistics
CREATE TABLE memory_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dimension (what are we aggregating by?)
  dimension TEXT NOT NULL,          -- 'category', 'platform', 'supplier', 'content_type', 'category_platform'
  dimension_value TEXT NOT NULL,    -- 'beauty', 'tiktok', 'cj_us_warehouse', 'faceless_reel', 'beauty_tiktok'
  -- Metric
  metric_name TEXT NOT NULL,        -- 'avg_engagement_rate', 'score_accuracy', 'delivery_ontime_pct'
  metric_value DECIMAL(10,4),
  metric_stddev DECIMAL(10,4),      -- standard deviation for confidence intervals
  sample_size INTEGER NOT NULL DEFAULT 0,
  -- Significance
  is_significant BOOLEAN DEFAULT false, -- true when sample_size >= 30
  confidence_interval_low DECIMAL(10,4),
  confidence_interval_high DECIMAL(10,4),
  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(dimension, dimension_value, metric_name)
);

CREATE INDEX idx_memory_agg_dimension ON memory_aggregates(dimension, dimension_value);
CREATE INDEX idx_memory_agg_significant ON memory_aggregates(is_significant) WHERE is_significant = true;

-- LAYER 3: Semantic lessons (with pgvector embeddings)
CREATE TABLE memory_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Lesson content
  content TEXT NOT NULL,            -- natural language lesson
  lesson_type TEXT NOT NULL,        -- 'category_insight', 'platform_pattern', 'pricing_accuracy',
                                    -- 'content_performance', 'seasonal', 'admin_preference', 'supplier'
  -- Context tags for filtered retrieval
  categories TEXT[],                -- ['beauty', 'electronics']
  platforms TEXT[],                 -- ['tiktok', 'amazon']
  product_types TEXT[],             -- ['digital_ai_saas', 'white_label_physical']
  -- Confidence
  confidence DECIMAL(3,2),          -- 0.00-1.00
  sample_size INTEGER DEFAULT 0,
  -- Embedding for semantic search
  embedding VECTOR(384),            -- using all-MiniLM-L6-v2 (384 dimensions, runs locally)
  -- Lifecycle
  times_retrieved INTEGER DEFAULT 0,   -- how often this lesson was used
  times_validated INTEGER DEFAULT 0,   -- how often outcome confirmed this lesson
  times_contradicted INTEGER DEFAULT 0, -- how often outcome contradicted this lesson
  last_validated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,   -- false if consistently contradicted
  superseded_by UUID REFERENCES memory_lessons(id), -- when a better lesson replaces this one
  -- Metadata
  source_prediction_ids UUID[],     -- which predictions generated this insight
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable pgvector extension (if not already)
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX idx_memory_lessons_embedding ON memory_lessons
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_memory_lessons_type ON memory_lessons(lesson_type);
CREATE INDEX idx_memory_lessons_categories ON memory_lessons USING GIN(categories);
CREATE INDEX idx_memory_lessons_platforms ON memory_lessons USING GIN(platforms);
CREATE INDEX idx_memory_lessons_active ON memory_lessons(is_active) WHERE is_active = true;

-- LAYER 4: Score recalibration proposals
CREATE TABLE score_recalibrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Current vs proposed weights
  current_weights JSONB NOT NULL,   -- {trend: 0.40, viral: 0.35, profit: 0.25}
  proposed_weights JSONB NOT NULL,  -- {trend: 0.38, viral: 0.32, profit: 0.30}
  -- Context
  scope TEXT NOT NULL,              -- 'global', 'beauty', 'tiktok', 'beauty_tiktok'
  sample_size INTEGER NOT NULL,
  regression_r_squared DECIMAL(5,4), -- how well the proposed weights fit outcomes
  improvement_pct DECIMAL(5,2),     -- % improvement over current weights
  -- Evidence
  evidence_summary TEXT,            -- natural language explanation
  evidence_data JSONB,              -- raw regression data
  -- Approval
  status TEXT DEFAULT 'proposed',   -- 'proposed', 'approved', 'rejected', 'applied'
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recalibrations_status ON score_recalibrations(status);
```

## 7D. Learning Loop Workflows

### W37: Outcome Collector (NEW)

```
Trigger: Cron (daily)
→ Find prediction_log records WHERE outcome_recorded_at IS NULL
→ For each:
  → Check if outcome data is now available:
    → Product scores: check admin decisions (accepted/rejected/modified)
    → Viability verdicts: check actual sales data (if enough time has passed)
    → Marketing ROI: check content performance data
    → Price estimates: check confirmed prices from sourcing queue
    → Delivery estimates: check actual delivery times from orders
  → If outcome found: update prediction_log with actual_value + delta
→ Summary: "Collected 47 new outcomes today"
```

### W38: Pattern Recognizer (NEW)

```
Trigger: Cron (weekly, Sunday midnight)
→ Query prediction_log for outcomes recorded in last 30 days
→ Group by (product_category, product_platform, prediction_type)
→ For each group with sample_size >= 30:
  → Calculate: mean accuracy, stddev, confidence interval
  → Update memory_aggregates
  → If new statistically significant pattern found:
    → Generate natural-language lesson via Claude Haiku:
      "Based on 47 beauty products on TikTok, our trend scores
       are 12% optimistic on average (95% CI: 8-16%)"
    → Generate embedding (local model or OpenAI)
    → Store in memory_lessons
→ Check existing lessons for contradictions:
  → If lesson contradicted by recent data (3+ contradictions):
    → Mark is_active = false
    → Generate updated lesson
```

### W39: Memory-Enhanced Analysis (Integration Point)

```
This is NOT a separate workflow — it's integrated into W3 and W3D
(profitability analysis) and W4 (marketing plan generation).

When Claude analyzes a product:

1. Determine context: product_category, platform, price_range

2. Retrieve relevant memories:
   → pgvector: SELECT content FROM memory_lessons
     WHERE is_active = true
     AND (categories && ARRAY[product_category] OR platforms && ARRAY[platform])
     ORDER BY embedding <=> query_embedding
     LIMIT 5

   → Structured: SELECT * FROM memory_aggregates
     WHERE dimension_value IN (category, platform, category_platform)
     AND is_significant = true

3. Format as historical context block:
   "SYSTEM MEMORY (based on platform experience):
    - Beauty products on TikTok average 4.2% engagement (n=142, high confidence)
    - Our trend scores for beauty are 12% optimistic — adjust expectations
    - Faceless comparison reels outperform single-product reviews by 2.1x
    - Seasonal factor: beauty peaks in Q4 (current month: March, neutral)"

4. Include in Claude prompt alongside product data

5. Log prediction in prediction_log (for future outcome tracking)
```

### W40: Score Recalibrator (NEW)

```
Trigger: Cron (monthly, 1st of month) OR when prediction_log reaches 100+ outcomes

→ Query prediction_log for all outcomes in scope
→ Group by scope (global, per-category, per-platform)
→ For each scope with sample_size >= 50:
  → Run linear regression: outcome = w1*trend + w2*viral + w3*profit
  → Compare learned weights vs current weights
  → If improvement > 5% (significant):
    → Create score_recalibrations record (status = 'proposed')
    → Notify admin:
      "Proposed scoring adjustment for beauty products:
       Current: trend 40%, viral 35%, profit 25%
       Proposed: trend 35%, viral 30%, profit 35%
       Based on 87 outcomes, this improves prediction accuracy by 12%.
       [APPROVE] [REJECT] [REVIEW DATA]"
→ If admin approves:
  → Update scoring formula for that scope
  → Store in memory_lessons: "Beauty scoring weights updated from
    (40/35/25) to (35/30/35) based on 87 outcomes"
```

## 7E. How Memory Improves Over Time

### Month 1: Cold Start
- System uses default weights and heuristics
- prediction_log fills with predictions but no outcomes yet
- memory_lessons is empty
- Claude prompts include no historical context

### Month 2-3: Early Learning
- First outcomes arrive (admin decisions, early sales data)
- memory_aggregates begins populating
- First statistically significant patterns emerge (sample_size >= 30)
- First memory_lessons generated
- Claude prompts start including 1-2 relevant lessons

### Month 6: Intermediate Intelligence
- 500+ outcomes recorded
- Strong patterns per category/platform
- Score recalibration proposals begin
- Admin decision patterns learned
- Claude prompts include 5+ highly relevant lessons
- System expresses calibrated confidence in predictions

### Month 12+: Mature Intelligence
- Thousands of outcomes
- Per-category scoring weights optimized
- Seasonal patterns well-established
- Content strategy recommendations data-driven
- Supplier reliability scored from actual experience
- System identifies its own blind spots
- New product types trigger "low confidence" warnings
- The system genuinely knows more about your product niche than any individual could remember

### The Memory Flywheel

```
More products analyzed
        ↓
More predictions logged
        ↓
More outcomes collected
        ↓
Better pattern recognition
        ↓
More accurate lessons
        ↓
Better Claude analysis
        ↓
Better decisions
        ↓
More outcomes to learn from
        ↓ (cycle repeats, getting smarter each rotation)
```

---

# PART 8: UPDATED SYSTEM TOTALS

---

## Worker Summary

| Area | Workers | New This Session |
|------|---------|-----------------|
| Phase 1: Auto-Discovery | W22, W23, W24, W24B | W1B (gating check) |
| Phase 2: Human Checkpoint | Dashboard UI | — |
| Phase 3: Confirmed Pricing | W24C, W24D | — |
| Engine 3A: Marketing Plans | W25, W25B, W25C | — |
| Engine 3B: Content Production | W26-W31 | — |
| Feedback & Monitoring | W32-W35 | — |
| Ranking | W36 | — |
| Learning/Memory | W37, W38, W39 (integrated), W40 | W37, W38, W40 |
| Brand Gating | W1B | W1B |

**Total new workers: 23** (was 19, added W1B, W37, W38, W40)
**Total workers (existing 21 + new 23): 44**

## Database Table Summary

| Table | Purpose | New This Session |
|-------|---------|-----------------|
| products | Core product data (extended) | +6 columns |
| product_costs | Supplier options + pricing | — |
| sourcing_queue | Human review checkpoint | — |
| local_suppliers | Reusable supplier database | — |
| profitability_analysis | AI viability verdicts | — |
| marketing_plans | AI-generated marketing plans | — |
| content_queue | Content production pipeline | — |
| published_content | Published content tracking | — |
| content_performance | Engagement metrics | — |
| **brand_gating** | **Platform gating status per brand** | **NEW** |
| **affiliate_programs** | **AI/SaaS affiliate program details** | **NEW** |
| **affiliate_links** | **Tracking links per product/platform** | **NEW** |
| **prediction_log** | **Every prediction for outcome tracking** | **NEW** |
| **memory_aggregates** | **Statistical patterns** | **NEW** |
| **memory_lessons** | **Semantic lessons with pgvector** | **NEW** |
| **score_recalibrations** | **Proposed weight adjustments** | **NEW** |

**Total new tables: 16** (was 9, added 7)

---

# PART 9: CHANNEL INTELLIGENCE ENGINE

---

## 9.1 — Purpose

The Channel Intelligence Engine is the brain behind marketing spend allocation. For every product entering the marketing pipeline, it analyzes product category, margin, audience profile, historical performance, and available budget to recommend the optimal mix of paid and free marketing channels.

**Core principle**: Every dollar spent must be traceable to revenue. The system continuously learns which channels perform best for which product types and adjusts recommendations accordingly.

---

## 9.2 — Complete Channel Catalog

### 9.2.1 — Paid Advertising Channels

| Channel | Min Budget | Avg CPC/CPM | Best For | API | n8n Integration |
|---------|-----------|-------------|----------|-----|-----------------|
| **TikTok Spark Ads** | $500/campaign | CPC $0.20-1.00, CPM $6-10 | White label physical, viral products | TikTok Marketing API (free) | HTTP Request node |
| **Meta Ads** (FB + IG) | $1/day | CPC $0.50-2.00, CPM $8-14 | All categories, broadest reach | Meta Marketing API (free) | Native n8n node |
| **Google Ads** (Shopping + PMax) | $1/day | Shopping CPC $0.66, Search $1-5 | Amazon FBA, branded physical, high-intent | Google Ads API (free) | Native n8n node |
| **Pinterest Ads** | $1/day | CPC $0.10-1.50 (30-40% cheaper than Meta) | Visual products, home/fashion/food | Pinterest API (free) | HTTP Request node |
| **YouTube Ads** (via Google) | $10/day | CPV $0.01-0.03 | Video-friendly products, demos | Google Ads API (same) | Native n8n node |
| **Reddit Ads** | $5/day | CPC $0.10-0.80 (cheapest) | Niche communities, digital/SaaS | Reddit Ads API (free) | HTTP Request node |
| **LinkedIn Ads** | $10/day | CPC $5.58+ | B2B SaaS, enterprise tools | LinkedIn Marketing API (free) | HTTP Request node |
| **Snapchat Ads** | $5/day | CPM $2.95 (cheapest video) | Gen Z products, impulse buys | Snapchat Marketing API (free) | HTTP Request node |

**Key insight from research**: TikTok Spark Ads deliver **64% higher CTR** and **37% lower CPA** than regular TikTok ads by boosting organic creator content. This makes them the primary paid channel for physical products with creator content.

### 9.2.2 — Free/Organic Channels

| Channel | Effort Level | Time to Results | Best For | Automation | n8n Integration |
|---------|-------------|----------------|----------|-----------|-----------------|
| **Pinterest Organic** | Low | 2-4 weeks | Visual products, evergreen | Full auto | Native n8n node |
| **YouTube Shorts** | Medium | 1-2 weeks | Product demos, unboxing | Full auto | Native n8n node (upload-post) |
| **TikTok Organic** | Medium | 1-7 days | Viral physical, trending | Full auto | upload-post community node |
| **Instagram Reels** | Medium | 1-2 weeks | Lifestyle, fashion, beauty | Full auto | upload-post community node |
| **Email Marketing** | Low | Immediate | All (highest ROI: $36-42 per $1) | Full auto | Native Resend + Mailchimp nodes |
| **Blog/SEO** | High | 3-6 months | Digital products, affiliate | Semi-auto | Native WordPress node |
| **Reddit Organic** | Medium | 1-4 weeks | Niche physical, SaaS launches | Manual only (ban risk) | Monitor only |
| **Quora** | Medium | 2-8 weeks | Digital/SaaS (high SEO/GEO value) | Manual only (no API) | Monitor only |
| **Telegram Communities** | Low | Immediate | Deal-oriented, digital | Full auto | Native n8n node |
| **Product Hunt** | High | 1 day spike | SaaS/digital launches | Semi-auto | HTTP Request node |
| **Discord Communities** | Medium | Ongoing | Gaming, tech, niche | Semi-auto | Native n8n node |
| **Indie Hackers / HN** | High | 1 day spike | B2B SaaS, dev tools | Manual only | None |
| **X (Twitter)** | Medium | 1-7 days | Tech, trending topics | Full auto | upload-post community node |
| **Facebook Groups** | Medium | 1-2 weeks | Niche communities | Semi-auto | upload-post community node |
| **LinkedIn Organic** | Medium | 1-2 weeks | B2B, professional tools | Full auto | upload-post community node |
| **Threads** | Low | 1-7 days | Lifestyle, casual | Full auto | upload-post community node |
| **Bluesky** | Low | 1-7 days | Tech-savvy audience | Full auto | upload-post community node |

---

## 9.3 — Channel-Product Fit Matrix

The engine uses a pre-computed affinity matrix to shortlist channels per product category before running the full scoring algorithm.

### 9.3.1 — Paid Channel Affinity

| Product Category | Primary Paid | Secondary Paid | Avoid |
|-----------------|-------------|---------------|-------|
| **Digital/AI/SaaS** | Meta Ads, Google Ads | Reddit Ads, LinkedIn Ads | Snapchat |
| **Branded Physical** | Google Shopping, Meta Ads | Pinterest Ads, YouTube Ads | Reddit, LinkedIn |
| **White Label Physical** | TikTok Spark Ads, Meta Ads | Pinterest Ads, Snapchat Ads | LinkedIn |
| **Physical Affiliate** | TikTok Spark Ads, Pinterest Ads | Meta Ads | LinkedIn, Google Shopping |

### 9.3.2 — Free Channel Affinity

| Product Category | Primary Free | Secondary Free | Avoid |
|-----------------|-------------|---------------|-------|
| **Digital/AI/SaaS** | Email, Blog/SEO, Product Hunt | Reddit, Quora, LinkedIn Organic | — |
| **Branded Physical** | Pinterest Organic, YouTube Shorts | Instagram Reels, Email | Reddit (ban risk) |
| **White Label Physical** | TikTok Organic, Pinterest Organic | YouTube Shorts, Instagram Reels | Product Hunt |
| **Physical Affiliate** | TikTok Organic, Pinterest Organic | Email, Telegram | LinkedIn, Product Hunt |

---

## 9.4 — Intelligent Channel Selection Algorithm

### 9.4.1 — Channel Score Formula

For each candidate channel `c` and product `p`:

```
channel_score(c, p) =
    category_fit(c, p)        × 0.25    // From affinity matrix
  + margin_compatibility(c, p) × 0.20    // Can margin support CPA?
  + audience_match(c, p)       × 0.20    // Target demo alignment
  + historical_roas(c, p)      × 0.20    // Past performance (from memory)
  + budget_efficiency(c, p)    × 0.15    // Cost relative to budget
```

Each component is normalized to 0–100.

### 9.4.2 — Component Calculations

**category_fit**: Lookup from affinity matrix (§9.3).
- Primary channel = 100
- Secondary channel = 60
- Neutral = 30
- Avoid = 0

**margin_compatibility**: Can the product's margin absorb the channel's typical CPA?
```
margin_compat = min(100, (expected_profit_per_sale / channel_avg_cpa) × 50)
```
If expected profit < channel avg CPA → score = 0 (auto-exclude).

**audience_match**: Product target demographics vs channel user demographics.
- Age bracket overlap: 0-40 points
- Gender skew alignment: 0-20 points
- Interest category match: 0-20 points
- Geographic match: 0-20 points

**historical_roas**: Retrieved from `channel_performance` table + memory lessons.
- New channel (no data): default 50
- Channels with data: `min(100, actual_roas × 25)` where ROAS 4.0+ = 100

**budget_efficiency**: How much reach per dollar relative to alternatives.
```
budget_eff = min(100, (channel_avg_reach_per_dollar / max_reach_per_dollar_across_channels) × 100)
```

### 9.4.3 — Channel Selection Logic

```
1. Compute channel_score for ALL channels (paid + free)
2. Filter out channels where margin_compatibility = 0
3. Sort by channel_score DESC
4. Select top channels subject to constraints:
   a. Total paid budget ≤ product marketing budget
   b. Maximum 3 paid channels simultaneously
   c. Maximum 5 free channels simultaneously
   d. At least 1 free channel always included
5. Allocate budget proportionally to channel_score among selected paid channels
6. If product is new (no historical data) → use "exploration" mix:
   - 70% to highest-scoring channel
   - 20% to second-highest
   - 10% to experimental channel (for learning)
7. If product has history → use "exploitation" mix:
   - Allocate proportionally to historical ROAS
   - Reserve 10% for testing new channels (multi-armed bandit)
```

### 9.4.4 — Budget Allocation Within Channels

For each selected paid channel, the allocated budget is further split:

```
channel_budget_split:
  testing_phase (first 3 days):   30% of channel budget
  scaling_phase (days 4-14):      50% of channel budget
  optimization_phase (day 15+):   20% of channel budget (reallocated from underperformers)
```

Auto-kill rules:
- If ROAS < 1.0 after $50 spent → pause channel, reallocate budget
- If CPA > 2× target after 100 impressions → reduce budget 50%
- If CTR < 0.5% after 1000 impressions → pause creative, test new variant

---

## 9.5 — Ad Account Linking Architecture

### 9.5.1 — OAuth Integration Flow

```
Admin Dashboard → "Connect Ad Account" button
        ↓
Platform OAuth consent screen
        ↓
Redirect back with auth code
        ↓
/api/auth/callback/[platform]
        ↓
Exchange code for access + refresh tokens
        ↓
Store encrypted in ad_accounts table
        ↓
Verify connection with test API call
        ↓
Display "Connected ✓" in dashboard
```

### 9.5.2 — Supported Platforms & OAuth Details

| Platform | OAuth Version | Scopes Required | Token Lifetime | Refresh |
|----------|--------------|-----------------|----------------|---------|
| **Meta** | OAuth 2.0 | ads_management, ads_read, pages_read | 60 days | System user token (no expiry) |
| **TikTok** | OAuth 2.0 | advertiser_management, campaign_creation | 24 hours | Refresh token (365 days) |
| **Google** | OAuth 2.0 | adwords, content | 1 hour | Refresh token (no expiry) |
| **Pinterest** | OAuth 2.0 | ads:read, ads:write, pins:read | 30 days | Refresh token (365 days) |

### 9.5.3 — Token Management

```
Worker: W41_token_refresh

Schedule: Every 6 hours

Logic:
  1. Query ad_accounts WHERE token_expires_at < NOW() + interval '12 hours'
  2. For each expiring token:
     a. Call platform refresh endpoint
     b. Update encrypted tokens in DB
     c. Log refresh in ad_account_events
  3. If refresh fails:
     a. Mark account status = 'token_expired'
     b. Send admin alert via Resend
     c. Show "Reconnect Required" in dashboard
```

### 9.5.4 — Database Schema — Ad Accounts

```sql
CREATE TABLE ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform TEXT NOT NULL CHECK (platform IN (
    'meta', 'tiktok', 'google', 'pinterest',
    'reddit', 'linkedin', 'snapchat'
  )),
  platform_account_id TEXT NOT NULL,
  account_name TEXT,
  -- Encrypted tokens (use Supabase Vault or pgcrypto)
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'token_expired', 'suspended', 'disconnected'
  )),
  -- Metadata
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'America/New_York',
  daily_budget_limit DECIMAL(10,2),
  monthly_budget_limit DECIMAL(10,2),
  -- Tracking
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, platform_account_id)
);

-- Row-level security: users can only see their own accounts
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own ad accounts" ON ad_accounts
  FOR ALL USING (auth.uid() = user_id);
```

---

## 9.6 — Campaign Management Workers

### 9.6.1 — W42: Campaign Creator

```
Worker: W42_campaign_creator
Trigger: marketing_plan approved AND has paid channel recommendations
Queue: campaign_jobs

Input:
  - marketing_plan_id
  - approved_channels[] (with budget allocations)
  - product data
  - creative assets (from content_queue)

Logic:
  FOR each approved paid channel:
    1. Retrieve ad_account for platform
    2. Validate account status = 'active' and budget available
    3. Create campaign via platform API:

       Meta:
         - Campaign: Conversions objective
         - Ad Set: Auto-targeting (Advantage+) or custom audience
         - Ad: Image/video from content_queue + AI-generated copy

       TikTok:
         - Campaign: Product Sales / Website Conversions
         - Ad Group: Spark Ads (boost creator content) or standard
         - Ad: Video creative + landing page

       Google:
         - Campaign: Performance Max or Shopping
         - Asset Group: Product images + descriptions
         - Auto-generated ads from product feed

       Pinterest:
         - Campaign: Conversions / Catalog Sales
         - Ad Group: Interest + keyword targeting
         - Pin: Product image + description

    4. Store campaign details in ad_campaigns table
    5. Set initial budget = testing_phase allocation (30%)
    6. Enable conversion tracking pixel/API

Output:
  - Campaign IDs per platform
  - Status: 'live' or 'pending_review' (platform approval)
```

### 9.6.2 — W43: Campaign Optimizer

```
Worker: W43_campaign_optimizer
Schedule: Every 4 hours (for active campaigns)
Queue: optimization_jobs

Logic:
  1. Fetch all active campaigns from ad_campaigns
  2. For each campaign, pull metrics from platform API:
     - Spend, impressions, clicks, CTR, CPC, conversions, ROAS
  3. Store metrics in channel_performance table
  4. Apply optimization rules:

     TESTING PHASE (days 1-3):
       - Monitor only, do not change
       - Flag if CTR < 0.3% (likely creative issue)

     SCALING PHASE (days 4-14):
       - If ROAS > 2.0 → increase budget 20%
       - If ROAS 1.0-2.0 → hold steady
       - If ROAS < 1.0 → reduce budget 50%
       - If ROAS < 0.5 after $50 → pause campaign

     OPTIMIZATION PHASE (day 15+):
       - Reallocate budget from worst to best performing
       - Test new creatives on underperforming campaigns
       - If ROAS < 1.0 sustained 7 days → kill campaign

  5. Budget reallocation across channels:
     - Kill worst performer → redistribute to best performer
     - Always keep minimum 2 channels active for comparison

  6. Record decisions in campaign_decisions log
  7. Feed results to learning system (W37 outcome capture)
```

### 9.6.3 — W44: Conversion Tracker

```
Worker: W44_conversion_tracker
Trigger: Purchase/signup event on storefront
Queue: conversion_jobs

Logic:
  1. Receive conversion event (webhook from Shopify/Stripe/platform)
  2. Match to originating campaign via:
     - UTM parameters
     - Click ID (fbclid, ttclid, gclid, epik)
     - Server-side event matching
  3. Send conversion data BACK to ad platforms:

     Meta: Conversions API (CAPI) — server-side event
     TikTok: Events API — server-side event
     Google: Offline Conversion Upload
     Pinterest: Conversions API (CAPI)

  4. Update channel_performance with confirmed conversion
  5. Calculate true ROAS per channel
  6. Store in prediction_log for learning system

Why server-side tracking:
  - Cookie deprecation makes pixel-only tracking unreliable
  - Server-side events have 20-30% higher match rates
  - Required for accurate campaign optimization
  - All 4 major platforms support + recommend it
```

---

## 9.7 — Social Media Posting Automation

### 9.7.1 — Posting Architecture

```
Content Production (W26-W31)
        ↓
content_queue (status: 'ready')
        ↓
Marketing Plan Approval (human checkpoint)
        ↓
Posting Orchestrator (W45)
        ↓
┌──────────────────────────────────────────┐
│          Distribution Layer              │
│                                          │
│  Blotato (primary):                      │
│    Instagram, Facebook, X, LinkedIn,     │
│    Pinterest, TikTok, YouTube,           │
│    Threads, Bluesky                      │
│    → 9 platforms via single n8n node     │
│                                          │
│  Direct API (supplementary):             │
│    Telegram → native n8n node            │
│    Discord → native n8n node             │
│    Reddit → monitoring only (ban risk)   │
│    Email → Resend native n8n node        │
│    Blog/WordPress → native n8n node      │
│                                          │
│  upload-post (fallback/parallel):        │
│    TikTok, IG, YouTube, LinkedIn,        │
│    X, FB, Pinterest, Threads,            │
│    Reddit, Bluesky                       │
│    → community n8n node                  │
└──────────────────────────────────────────┘
        ↓
published_content table
        ↓
Performance tracking (W43)
```

### 9.7.2 — W45: Posting Orchestrator

```
Worker: W45_posting_orchestrator
Trigger: Marketing plan approved AND content ready
Queue: posting_jobs

Input:
  - marketing_plan_id
  - content_items[] (video, image, copy per platform)
  - channel_recommendations (free channels from selection engine)
  - posting_schedule (optimal times from plan)

Logic:
  1. For each recommended free channel:
     a. Retrieve platform credentials/connection
     b. Adapt content format:
        - Pinterest: vertical image + description + link
        - TikTok: vertical video + caption + hashtags
        - YouTube Shorts: vertical video + title + description
        - Instagram: image/reel + caption + hashtags
        - X: short text + image/video + link
        - LinkedIn: professional copy + image
        - Email: HTML template via Resend
        - Blog: SEO-optimized article via WordPress
        - Telegram: message + media to channel
     c. Schedule post at optimal time per platform:
        - TikTok: Tue-Thu 7-9pm EST
        - Instagram: Mon-Fri 11am-1pm EST
        - Pinterest: Sat 8-11pm EST
        - LinkedIn: Tue-Thu 8-10am EST
        - Email: Tue/Thu 10am recipient timezone
     d. Post via Blotato (primary) or direct API

  2. Record all posts in published_content
  3. Set up engagement monitoring schedule
```

---

## 9.8 — Database Schema — Channel Intelligence

### 9.8.1 — Channel Performance Table

```sql
CREATE TABLE channel_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  channel TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('paid', 'free')),
  -- Campaign reference (null for organic)
  campaign_id UUID REFERENCES ad_campaigns(id),
  -- Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  -- Computed
  ctr DECIMAL(6,4) GENERATED ALWAYS AS (
    CASE WHEN impressions > 0 THEN clicks::DECIMAL / impressions ELSE 0 END
  ) STORED,
  cpc DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE WHEN clicks > 0 THEN spend / clicks ELSE 0 END
  ) STORED,
  roas DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE WHEN spend > 0 THEN revenue / spend ELSE 0 END
  ) STORED,
  cpa DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE WHEN conversions > 0 THEN spend / conversions ELSE 0 END
  ) STORED,
  -- Context
  product_category TEXT,
  date_range_start DATE,
  date_range_end DATE,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_channel_perf_product ON channel_performance(product_id);
CREATE INDEX idx_channel_perf_channel ON channel_performance(channel, channel_type);
CREATE INDEX idx_channel_perf_category ON channel_performance(product_category, channel);
```

### 9.8.2 — Ad Campaigns Table

```sql
CREATE TABLE ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketing_plan_id UUID NOT NULL REFERENCES marketing_plans(id),
  product_id UUID NOT NULL REFERENCES products(id),
  ad_account_id UUID NOT NULL REFERENCES ad_accounts(id),
  -- Platform details
  platform TEXT NOT NULL,
  platform_campaign_id TEXT,
  platform_adset_id TEXT,
  platform_ad_id TEXT,
  -- Config
  campaign_type TEXT, -- 'spark_ads', 'shopping', 'pmax', 'promoted_pin', etc.
  objective TEXT,     -- 'conversions', 'traffic', 'awareness'
  -- Budget
  daily_budget DECIMAL(10,2),
  total_budget DECIMAL(10,2),
  spent_to_date DECIMAL(10,2) DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'active', 'paused',
    'budget_exhausted', 'killed', 'completed'
  )),
  phase TEXT DEFAULT 'testing' CHECK (phase IN (
    'testing', 'scaling', 'optimization', 'completed'
  )),
  -- Targeting
  targeting JSONB DEFAULT '{}',
  -- Creative references
  creative_ids UUID[],
  -- Performance (latest sync)
  last_metrics JSONB DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  -- Lifecycle
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  killed_at TIMESTAMPTZ,
  kill_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_plan ON ad_campaigns(marketing_plan_id);
CREATE INDEX idx_campaigns_product ON ad_campaigns(product_id);
CREATE INDEX idx_campaigns_status ON ad_campaigns(status) WHERE status = 'active';
```

### 9.8.3 — Campaign Decisions Log

```sql
CREATE TABLE campaign_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id),
  decision_type TEXT NOT NULL CHECK (decision_type IN (
    'budget_increase', 'budget_decrease', 'pause',
    'resume', 'kill', 'creative_swap', 'audience_change',
    'channel_reallocation'
  )),
  reason TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  automated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decisions_campaign ON campaign_decisions(campaign_id);
```

### 9.8.4 — Channel Recommendations Table

```sql
CREATE TABLE channel_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketing_plan_id UUID NOT NULL REFERENCES marketing_plans(id),
  product_id UUID NOT NULL REFERENCES products(id),
  -- Recommendation
  channel TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('paid', 'free')),
  score DECIMAL(5,2) NOT NULL,
  rank INTEGER NOT NULL,
  -- Budget (paid only)
  recommended_budget DECIMAL(10,2),
  budget_split JSONB, -- {testing: 30, scaling: 50, optimization: 20}
  -- Reasoning
  reasoning JSONB NOT NULL, -- {category_fit: 85, margin_compat: 70, ...}
  -- Status
  status TEXT DEFAULT 'recommended' CHECK (status IN (
    'recommended', 'approved', 'rejected', 'active', 'completed'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_plan ON channel_recommendations(marketing_plan_id);
```

---

## 9.9 — Updated W25: Marketing Plan Generator (Extended)

The existing W25 Marketing Plan Generator now includes channel intelligence:

```
Worker: W25_marketing_plan_generator (UPDATED)

Existing responsibilities:
  - Generate content strategy
  - Suggest influencer outreach
  - Create budget allocation
  - Build posting schedule

NEW additions:
  1. Channel Selection:
     - Run channel selection algorithm (§9.4)
     - Include top 3 paid + top 5 free channels in plan
     - Show channel_score breakdown for transparency

  2. Paid Budget Allocation:
     - Split marketing budget across recommended paid channels
     - Show expected ROAS per channel (from historical data or defaults)
     - Include testing → scaling → optimization timeline

  3. Free Channel Strategy:
     - Content format requirements per free channel
     - Posting frequency recommendation
     - Expected timeline to results

  4. Channel Justification:
     - Why each channel was selected (human-readable)
     - Why rejected channels were excluded
     - Risk factors per channel

  5. Conversion Tracking Setup:
     - Required pixels/APIs per selected channel
     - UTM parameter templates
     - Attribution window recommendations

Updated marketing_plans.plan JSONB structure:
{
  "content_strategy": { ... },        // existing
  "influencer_strategy": { ... },     // existing
  "budget_allocation": {              // EXTENDED
    "total_budget": 500,
    "paid_channels": {
      "tiktok_spark": { "budget": 250, "expected_roas": 3.2, "score": 87 },
      "meta_ads": { "budget": 150, "expected_roas": 2.8, "score": 72 },
      "pinterest_ads": { "budget": 100, "expected_roas": 2.5, "score": 65 }
    },
    "free_channels": [
      { "channel": "pinterest_organic", "priority": 1, "score": 91 },
      { "channel": "tiktok_organic", "priority": 2, "score": 85 },
      { "channel": "email", "priority": 3, "score": 78 }
    ]
  },
  "channel_reasoning": { ... },       // NEW
  "conversion_tracking": { ... },     // NEW
  "posting_schedule": { ... }         // existing (now per-channel)
}
```

---

## 9.10 — Channel Intelligence Learning Loop

The channel engine feeds into the existing learning system (PART 7):

```
Campaign Results (W43)
        ↓
Outcome Capture (W37)
  - Record: product_category + channel + spend + ROAS + conversions
        ↓
Pattern Recognition (W38)
  - Detect: "White label kitchen products get 3.5x ROAS on TikTok Spark"
  - Detect: "SaaS products with >$50 price get best Reddit Ads ROI"
  - Detect: "Pinterest organic converts better than paid for home decor"
        ↓
Memory Storage (memory_lessons)
  - lesson: "tiktok_spark_white_label_kitchen_high_roas"
  - confidence: 0.82
  - sample_size: 47
        ↓
Score Recalibration (W39)
  - Adjust channel_score weights based on patterns
  - Increase TikTok Spark weight for white label kitchen
  - Decrease Reddit Ads weight for low-price physical
        ↓
Next Channel Selection
  - historical_roas component now informed by lessons
  - Exploration budget shifts toward proven winners
```

### 9.10.1 — Channel-Specific Lessons Table Extension

The existing `memory_lessons` table already has `categories` and `platforms` arrays. For channel intelligence, lessons also use:

```sql
-- No new table needed — extend lesson_type enum
-- lesson_type values for channel intelligence:
--   'channel_roas_pattern'
--   'channel_audience_insight'
--   'channel_creative_insight'
--   'channel_timing_insight'
--   'channel_budget_threshold'
```

Example lessons the system would learn:
- "TikTok Spark Ads for white label beauty products average 3.8x ROAS with UGC video creatives"
- "Pinterest organic pins for home decor generate consistent traffic for 6+ months (evergreen)"
- "Reddit Ads for SaaS products perform best with educational angle, avoid hard sell"
- "Meta Ads CPA increases 40% during Q4 holiday season — shift budget to TikTok"
- "Email sequences convert 5x better than single blast for digital products above $50"

---

## 9.11 — Platform-Specific Implementation Notes

### TikTok Spark Ads (Priority Channel)
- Requires creator authorization code (expires 30 days)
- Best practice: build creator relationship pipeline
- W42 should auto-request Spark authorization from creators who post about the product
- Budget minimum: $500/campaign, $50/ad group/day

### Meta Ads (Broadest Reach)
- Use Advantage+ Shopping Campaigns for e-commerce
- Conversions API (CAPI) is MANDATORY alongside pixel
- Native n8n node simplifies campaign creation
- Best for retargeting after organic awareness

### Google Ads (High Intent)
- Performance Max campaigns auto-optimize across Search, Display, YouTube, Gmail
- Product feed required for Shopping campaigns (sync from Shopify/product data)
- Conversion tracking via Google Tag + server-side upload

### Pinterest Ads (Underpriced)
- 30-40% cheaper CPCs than Meta (current market inefficiency)
- Promoted Pins become organic pins after campaign ends (lasting value)
- Best for visual, aspirational products (home, fashion, food, DIY)

### Reddit Ads (Cheapest CPC)
- MAX campaigns (auto-optimized) achieve 2.3-4.7x ROAS
- Community-specific targeting is powerful
- Authentic tone mandatory — Reddit users reject obvious ads
- Best for niche products with dedicated subreddit audiences

---

## 9.12 — Updated Worker Registry

### New Workers (This Section)

| Worker | Purpose | Trigger | Queue |
|--------|---------|---------|-------|
| **W41** | Token refresh for ad accounts | Every 6 hours | token_jobs |
| **W42** | Campaign creator (multi-platform) | Plan approved | campaign_jobs |
| **W43** | Campaign optimizer | Every 4 hours | optimization_jobs |
| **W44** | Conversion tracker | Purchase webhook | conversion_jobs |
| **W45** | Posting orchestrator (free channels) | Plan approved + content ready | posting_jobs |

### Updated Workers

| Worker | Change |
|--------|--------|
| **W25** | Extended to include channel selection + paid/free recommendations |

---

## 9.13 — Cost Impact

All ad platform APIs are **FREE** to access. Costs are only the ad spend itself, which is controlled by the human-approved marketing plan budget.

| New Service | Monthly Cost | Notes |
|-------------|-------------|-------|
| Ad platform APIs | $0 | All free (Meta, TikTok, Google, Pinterest, Reddit, LinkedIn) |
| upload-post n8n node | $0 | Open source community node |
| Blotato (already budgeted) | $29 | Already in Engine 3 budget |
| n8n-nodes-bullmq | $0 | Already in stack |

**No additional fixed costs.** Variable costs = actual ad spend (controlled by per-product marketing budget approval).

---

# PART 8: UPDATED SYSTEM TOTALS (REVISED)

---

## Worker Summary

| Area | Workers | New This Session |
|------|---------|-----------------|
| Phase 1: Auto-Discovery | W22, W23, W24, W24B | W1B (gating check) |
| Phase 2: Human Checkpoint | Dashboard UI | — |
| Phase 3: Confirmed Pricing | W24C, W24D | — |
| Engine 3A: Marketing Plans | W25 (extended), W25B, W25C | W25 extended |
| Engine 3B: Content Production | W26-W31 | — |
| Feedback & Monitoring | W32-W35 | — |
| Ranking | W36 | — |
| Learning/Memory | W37, W38, W39, W40 | W37, W38, W40 |
| Brand Gating | W1B | W1B |
| **Channel Intelligence** | **W41, W42, W43, W44, W45** | **W41-W45 (all new)** |

**Total new workers: 28** (was 23, added W41-W45)
**Total workers (existing 21 + new 28): 49**

## Database Table Summary

| Table | Purpose | New This Session |
|-------|---------|-----------------|
| products | Core product data (extended) | +6 columns |
| product_costs | Supplier options + pricing | — |
| sourcing_queue | Human review checkpoint | — |
| local_suppliers | Reusable supplier database | — |
| profitability_analysis | AI viability verdicts | — |
| marketing_plans | AI-generated marketing plans (extended) | plan JSONB extended |
| content_queue | Content production pipeline | — |
| published_content | Published content tracking | — |
| content_performance | Engagement metrics | — |
| brand_gating | Platform gating status per brand | — |
| affiliate_programs | AI/SaaS affiliate program details | — |
| affiliate_links | Tracking links per product/platform | — |
| prediction_log | Every prediction for outcome tracking | — |
| memory_aggregates | Statistical patterns | — |
| memory_lessons | Semantic lessons with pgvector | — |
| score_recalibrations | Proposed weight adjustments | — |
| **ad_accounts** | **OAuth tokens for ad platforms** | **NEW** |
| **ad_campaigns** | **Campaign lifecycle management** | **NEW** |
| **campaign_decisions** | **Automated optimization log** | **NEW** |
| **channel_performance** | **Per-channel metrics & ROAS** | **NEW** |
| **channel_recommendations** | **AI channel picks per product** | **NEW** |

**Total new tables: 21** (was 16, added 5)

---

# PART 10: MANUAL INPUT, BREAK-EVEN ANALYSIS, MULTI-REGION & SCRAPING STRATEGY

---

## 10.1 — Manual Product Input & Import

### 10.1.1 — The Need

The automated discovery pipeline finds products via scrapers. But many high-value opportunities come from human knowledge:
- Admin spots a product at a trade show or from a supplier catalog
- A supplier sends a product list via email/spreadsheet
- Admin finds a product on a platform the scrapers don't cover yet
- Historical products need to be imported from another system

The platform needs first-class manual product entry alongside automated discovery.

### 10.1.2 — Single Product Entry

```
Route: /admin/products/new

Form Fields:
  ── REQUIRED ──
  Title: [text]
  Category: [dropdown: digital_ai_saas | branded_physical | white_label_physical | physical_affiliate]
  Platform: [dropdown: tiktok | amazon | shopify | pinterest | digital | ai_affiliate | physical_affiliate | manual]

  ── PRICING (optional — can be added later in Sourcing Queue) ──
  Selling Price: [number] + [currency: USD | GBP]
  Buy Price: [number] (if known)
  Shipping Cost: [number] (if known)
  Supplier: [searchable dropdown from local_suppliers + "Add New"]

  ── DETAILS ──
  Description: [textarea]
  External URL: [url] (product listing link)
  Image URL: [url] or [file upload → Supabase Storage]
  Tags: [tag input]
  Brand Name: [text] (triggers brand gating check if filled)

  ── OPTIONAL SIGNALS ──
  Estimated Sales/Month: [number]
  Rating: [number 1-5]
  Review Count: [number]
  Trend Stage: [dropdown: emerging | rising | exploding | saturated]

On Submit:
  1. Create product record with platform = source platform OR 'manual'
  2. If buy_price provided → create product_costs record (supplier_source = 'manual_input')
  3. If brand_name provided → trigger W1B (brand gating check)
  4. Run scoring engine on available signals
  5. If enough data: auto-place in Sourcing Queue
  6. If minimal data: status = 'draft', admin enriches later
```

### 10.1.3 — Bulk CSV/Spreadsheet Import

```
Route: /admin/products/import

Supported Formats: CSV, XLSX, JSON

Step 1: Upload File
  → Admin uploads spreadsheet
  → System parses and previews first 10 rows

Step 2: Column Mapping
  → Auto-detect columns where possible
  → Admin maps columns to fields:
    Column A "Product Name" → title
    Column B "Price" → price
    Column C "Supplier Cost" → buy_price (→ product_costs)
    Column D "Source URL" → external_url
    Column E "Category" → product_category
    ...
  → Show unmatched columns (can be stored in metadata JSONB)

Step 3: Validation Preview
  → For each row, show:
    ✓ Valid | ⚠ Warning (missing optional fields) | ✗ Error (missing required fields)
  → Duplicate detection: match on (title + platform) or external_url
    → "Product X already exists — Skip / Update / Create Duplicate"

Step 4: Import Configuration
  → [x] Run scoring engine on imported products
  → [x] Auto-place in Sourcing Queue if pricing provided
  → [x] Trigger brand gating check for branded products
  → [ ] Auto-match to existing suppliers (see §10.1.5)
  → Region: [USA | UK]

Step 5: Execute Import
  → Batch insert via Supabase bulk upsert
  → Progress bar: "Importing 247 products... 89/247"
  → Summary: "Imported 240, Skipped 5 duplicates, 2 errors"
```

### 10.1.4 — Manual Supplier Database

The existing `local_suppliers` table stores supplier contacts. Extend it to be a full supplier management system:

```sql
-- Extend local_suppliers for richer data
ALTER TABLE local_suppliers ADD COLUMN website TEXT;
ALTER TABLE local_suppliers ADD COLUMN region TEXT DEFAULT 'usa';  -- 'usa', 'uk', 'global'
ALTER TABLE local_suppliers ADD COLUMN specialties TEXT[];  -- ['electronics', 'beauty', 'kitchen']
ALTER TABLE local_suppliers ADD COLUMN min_order_value DECIMAL(10,2);
ALTER TABLE local_suppliers ADD COLUMN payment_terms TEXT;  -- 'net30', 'prepaid', 'cod'
ALTER TABLE local_suppliers ADD COLUMN lead_time_days INTEGER;
ALTER TABLE local_suppliers ADD COLUMN catalog_url TEXT;
ALTER TABLE local_suppliers ADD COLUMN catalog_import_at TIMESTAMPTZ;  -- last catalog sync
```

**Manual Supplier Entry:**
```
Route: /admin/suppliers/new

Fields:
  Supplier Name, Contact (email/phone/whatsapp), Location, Website
  Categories/Specialties, Avg Delivery Days, MOQ, Payment Terms
  Region: [USA | UK | Global]
  Notes

On Submit → local_suppliers record created
```

**Supplier Catalog Import:**
```
Route: /admin/suppliers/[id]/import-catalog

Admin uploads supplier's product catalog (CSV/XLSX).
System maps columns and imports products linked to that supplier.
Each product gets a product_costs record with:
  supplier_source = 'local_supplier'
  supplier_name = supplier.name
  is_confirmed = true (admin provided the price)
  confidence_level = 'high'
```

### 10.1.5 — Automatic Supplier-Product Matching

When new products enter the system (from any source), the platform can auto-match them to known suppliers:

```
Worker: W46_supplier_matcher
Queue: intelligence_jobs
Trigger:
  - New product imported (manual or automated)
  - New supplier catalog imported
  - Admin clicks "Find Suppliers" on a product
  - Scheduled: weekly for unmatched products

Logic:
  1. For each unmatched product:
     a. Search local_suppliers by category overlap
     b. For matching suppliers with catalog data:
        → Fuzzy title match against supplier catalog products
        → Match by category + price range proximity
     c. For matching suppliers without catalog:
        → Flag as "potential match — admin verify"

  2. Search external supplier APIs:
     a. CJDropshipping API → search by product title
     b. AliExpress API → search by product title
     c. Compare found prices with local supplier prices

  3. Create product_costs records for each match:
     → Local supplier matches: is_confirmed = true (trusted source)
     → API matches: is_confirmed = false (needs admin review)
     → Rank all options by effective_cost (delivery-weighted)

  4. Auto-link: If local supplier price beats API price by >10%:
     → Auto-recommend local supplier
     → Flag in Sourcing Queue: "Local supplier [X] offers better price"

Output:
  → product_costs records created per match
  → Sourcing Queue updated with supplier options
  → Admin notified of auto-matches
```

### 10.1.6 — Import Sources Summary

| Source | Method | Enters Pipeline At | Auto-Score? | Auto-Source? |
|--------|--------|-------------------|-------------|-------------|
| Scrapers (existing) | Automated | Discovery → full pipeline | Yes | Yes |
| Single product form | Manual | Draft or Sourcing Queue | If signals provided | Yes (W22 + W46) |
| CSV/XLSX import | Bulk manual | Draft or Sourcing Queue | If signals provided | Yes (W46) |
| Supplier catalog import | Bulk manual | Sourcing Queue (pre-priced) | Yes | Pre-matched |
| API webhook | Automated | Discovery → full pipeline | Yes | Yes |

---

## 10.2 — Break-Even Analysis Engine

### 10.2.1 — The Need

Before spending money on marketing, the admin needs to know: "How many units do I need to sell to break even?" — and this answer is different for EVERY combination of:
- Selling platform (TikTok Shop vs Amazon FBA vs Shopify)
- Marketing channel (organic vs TikTok Spark vs Meta Ads vs influencer)
- Supplier (CJ US warehouse vs AliExpress vs local supplier)
- Region (USA vs UK — different fees, shipping, taxes)

### 10.2.2 — Break-Even Formula

```
For a given product + platform + channel + supplier + region:

REVENUE PER UNIT
  revenue = selling_price

COST PER UNIT
  cogs = buy_price + shipping_cost
  platform_fee = selling_price × platform_fee_rate
  payment_processing = (selling_price × processing_rate) + fixed_fee
  fulfillment = fulfillment_cost_per_unit  (FBA fee, or shipping to customer)
  returns = selling_price × estimated_return_rate × return_cost_multiplier
  vat_tax = selling_price × tax_rate  (UK: 20% VAT, USA: varies)

  total_cost_per_unit = cogs + platform_fee + payment_processing + fulfillment + returns + vat_tax

PROFIT PER UNIT
  profit_per_unit = revenue - total_cost_per_unit

FIXED COSTS (one-time per product launch)
  content_production_cost = cost of all content pieces (from marketing plan)
  ad_testing_budget = initial testing spend across selected channels
  influencer_cost = total influencer CPA budget
  listing_setup = photography, copywriting, A+ content (Amazon)

  total_fixed_costs = content_production + ad_testing + influencer_cost + listing_setup

BREAK-EVEN
  break_even_units = CEIL(total_fixed_costs / profit_per_unit)
  break_even_revenue = break_even_units × selling_price
  break_even_days = break_even_units / estimated_daily_sales

ONGOING MARKETING COST (post break-even)
  If using paid ads:
    cpa = channel_avg_cpa  (cost per acquisition from channel_performance data)
    marketing_cost_per_unit = cpa
    adjusted_profit = profit_per_unit - marketing_cost_per_unit
    adjusted_break_even = CEIL(total_fixed_costs / adjusted_profit)

  If using organic only:
    marketing_cost_per_unit = 0
    break_even = total_fixed_costs / profit_per_unit
```

### 10.2.3 — Platform Fee Reference

```
PLATFORM FEES (USA):
  TikTok Shop:     commission 2-8% (category dependent) + payment 2.9%
  Amazon FBA:       referral 8-15% + FBA fee ($3-6/unit) + storage
  Amazon FBM:       referral 8-15% + shipping to customer
  Shopify:          0% marketplace fee + Shopify Payments 2.9% + $0.30
  Pinterest:        N/A (drives to Shopify/Amazon)

PLATFORM FEES (UK):
  TikTok Shop UK:  commission 2-8% + payment ~2.5%
  Amazon FBA UK:   referral 7-15% + FBA fee (£2-5/unit) + storage
  Amazon FBM UK:   referral 7-15% + shipping
  Shopify UK:      0% + Shopify Payments 2.2% + £0.20
  VAT:             20% on all UK sales (must be registered)

PAYMENT PROCESSING:
  Stripe:          USA: 2.9% + $0.30  |  UK: 1.5% + £0.20 (EU cards), 2.5% + £0.20 (non-EU)
  PayPal:          USA: 2.99% + $0.49  |  UK: 2.9% + £0.30
```

### 10.2.4 — Break-Even Scenarios Matrix

For each product, the system generates a matrix of scenarios:

```
Product: LED Sunset Lamp
Selling Price: $24.99 (USA) / £19.99 (UK)
Buy Price: $6.50 (CJ US) / $4.00 (CJ China) / £5.00 (UK local)

┌─────────────────────────────────────────────────────────────────────────────┐
│ BREAK-EVEN SCENARIOS                                                        │
├───────────┬──────────┬────────────────┬──────────┬──────────┬──────────────┤
│ Platform  │ Supplier │ Marketing      │ Profit/  │ Fixed    │ Break-Even   │
│           │          │                │ Unit     │ Costs    │ Units / Days │
├───────────┼──────────┼────────────────┼──────────┼──────────┼──────────────┤
│ TikTok US │ CJ US    │ Organic only   │ $12.41   │ $5.50    │ 1 / <1 day  │
│ TikTok US │ CJ US    │ Spark Ads      │ $9.41    │ $55.50   │ 6 / 3 days  │
│ TikTok US │ CJ US    │ Influencer     │ $7.41    │ $20.50   │ 3 / 2 days  │
│ TikTok US │ CJ China │ Organic only   │ $14.91   │ $5.50    │ 1 / <1 day  │
│ Amazon US │ CJ US    │ PPC            │ $6.23    │ $75.50   │ 13 / 7 days │
│ Amazon US │ CJ China │ PPC            │ $8.73    │ $75.50   │ 9 / 5 days  │
│ Shopify US│ CJ US    │ Meta Ads       │ $10.91   │ $105.50  │ 10 / 5 days │
│ Shopify US│ CJ US    │ Organic+Email  │ $12.41   │ $5.50    │ 1 / <1 day  │
│ TikTok UK │ UK Local │ Organic only   │ £8.21    │ £4.50    │ 1 / <1 day  │
│ TikTok UK │ UK Local │ Spark Ads      │ £5.21    │ £44.50   │ 9 / 5 days  │
│ Amazon UK │ UK Local │ PPC            │ £3.43    │ £64.50   │ 19 / 10 days│
│ Shopify UK│ UK Local │ Meta Ads       │ £6.21    │ £84.50   │ 14 / 7 days │
├───────────┴──────────┴────────────────┴──────────┴──────────┴──────────────┤
│ 🏆 BEST SCENARIO: TikTok US + CJ China + Organic = 1 unit break-even     │
│ ⚡ BEST PAID: TikTok US + CJ US + Influencer = 3 units / 2 days          │
│ ⚠️ WORST: Amazon UK + UK Local + PPC = 19 units / 10 days                │
│                                                                             │
│ RECOMMENDATION: Start with TikTok organic, add Spark Ads after 5 sales    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2.5 — Database Schema

```sql
CREATE TABLE break_even_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  product_cost_id UUID REFERENCES product_costs(id),
  region TEXT NOT NULL CHECK (region IN ('usa', 'uk')),
  -- Scenario parameters
  selling_platform TEXT NOT NULL,   -- 'tiktok_shop', 'amazon_fba', 'amazon_fbm', 'shopify'
  supplier_name TEXT,
  marketing_channel TEXT NOT NULL,  -- 'organic', 'tiktok_spark', 'meta_ads', 'google_ads', 'influencer', 'combined'
  -- Revenue
  selling_price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  -- Per-unit costs
  cogs DECIMAL(10,2),              -- buy_price + shipping
  platform_fee DECIMAL(10,2),
  payment_processing DECIMAL(10,2),
  fulfillment_cost DECIMAL(10,2),
  return_cost DECIMAL(10,2),
  tax_vat DECIMAL(10,2),
  total_cost_per_unit DECIMAL(10,2),
  profit_per_unit DECIMAL(10,2),
  -- Fixed costs
  content_production DECIMAL(10,2),
  ad_testing_budget DECIMAL(10,2),
  influencer_budget DECIMAL(10,2),
  listing_setup DECIMAL(10,2),
  total_fixed_costs DECIMAL(10,2),
  -- Break-even results
  break_even_units INTEGER,
  break_even_revenue DECIMAL(10,2),
  break_even_days INTEGER,
  -- With ongoing marketing
  marketing_cpa DECIMAL(10,2),
  adjusted_profit_per_unit DECIMAL(10,2),
  adjusted_break_even_units INTEGER,
  -- Meta
  is_recommended BOOLEAN DEFAULT false,
  recommendation_reason TEXT,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_breakeven_product ON break_even_scenarios(product_id);
CREATE INDEX idx_breakeven_region ON break_even_scenarios(region);
CREATE INDEX idx_breakeven_recommended ON break_even_scenarios(is_recommended) WHERE is_recommended = true;
```

### 10.2.6 — Worker

```
Worker: W47_breakeven_calculator
Queue: intelligence_jobs
Trigger:
  - W24C completion (confirmed pricing)
  - W24D completion (profitability verdict includes platform recommendation)
  - W25 completion (marketing plan includes channel + budget data)
  - Admin requests recalculation
  - Supplier price changes

Logic:
  1. Read: product, confirmed product_costs, profitability_analysis, marketing_plan (if exists)
  2. For EACH combination of (region × platform × supplier × channel):
     → Calculate full break-even using formula (§10.2.2)
     → Use actual channel CPA from channel_performance if available
     → Use default platform fee rates per region
  3. Rank all scenarios by break_even_units ASC
  4. Mark top scenario as is_recommended = true
  5. Store all scenarios in break_even_scenarios table
  6. Include best scenario summary in marketing_plan.plan JSONB
  7. Surface in Sourcing Queue + Marketing Approval dashboards
```

### 10.2.7 — Dashboard Integration

**Sourcing Queue**: Show best break-even scenario next to each product:
"Break-even: 3 units / 2 days (TikTok + CJ US + Influencer)"

**Marketing Approval**: Show full scenarios matrix. Admin can see which channel/platform combo is most efficient before approving spend.

**Product Detail Page (Row 9 extension)**: Add "Break-Even Analysis" expandable section showing full matrix.

---

## 10.3 — Multi-Region Architecture (USA + UK)

### 10.3.1 — Design Principle: Region Column, Not Separate Databases

Running two separate databases would double infrastructure costs and create synchronization nightmares. Instead, add a `region` column to ALL region-sensitive tables and filter in queries.

**Benefits:**
- Single Supabase instance ($25/mo, not $50)
- Single codebase, single deployment
- Shared learning system (lessons from one region inform the other)
- Products discovered in one region can be evaluated for the other
- Admin sees both regions or filters to one

### 10.3.2 — Region-Sensitive Tables

Every table that contains region-specific data gets a `region` column:

```sql
-- Add region to all relevant tables
ALTER TABLE products ADD COLUMN region TEXT NOT NULL DEFAULT 'usa' CHECK (region IN ('usa', 'uk'));
ALTER TABLE product_costs ADD COLUMN region TEXT NOT NULL DEFAULT 'usa' CHECK (region IN ('usa', 'uk'));
ALTER TABLE sourcing_queue ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE local_suppliers ADD COLUMN region TEXT DEFAULT 'usa';  -- already added in §10.1.4
ALTER TABLE profitability_analysis ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE marketing_plans ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE content_queue ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE published_content ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE content_performance ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE ad_accounts ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE ad_campaigns ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE channel_performance ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE channel_recommendations ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE break_even_scenarios ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';  -- already has it
ALTER TABLE affiliate_programs ADD COLUMN region TEXT DEFAULT 'global';
ALTER TABLE affiliate_links ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';
ALTER TABLE budget_tracking ADD COLUMN region TEXT NOT NULL DEFAULT 'usa';

-- Indexes for region filtering
CREATE INDEX idx_products_region ON products(region);
CREATE INDEX idx_product_costs_region ON product_costs(region);
CREATE INDEX idx_sourcing_queue_region ON sourcing_queue(region);
CREATE INDEX idx_marketing_plans_region ON marketing_plans(region);
CREATE INDEX idx_ad_campaigns_region ON ad_campaigns(region);
```

### 10.3.3 — Region-INDEPENDENT Tables (Shared)

These tables are global — the data is useful across regions:

| Table | Why Shared |
|-------|-----------|
| `brand_gating` | Brand gating status is global (Nike is Nike everywhere) |
| `memory_lessons` | Lessons learned in one region may apply to the other |
| `memory_aggregates` | But with region dimension for region-specific patterns |
| `prediction_log` | Global prediction tracking (has product_platform dimension) |
| `score_recalibrations` | Weight adjustments can be global or per-region |
| `template_performance` | Content templates work across regions |
| `scoring_adjustments` | May be global or region-specific |

### 10.3.4 — Dashboard: Region Switcher

```
┌─────────────────────────────────────────────────────────┐
│  YOUSELL Admin Dashboard                                │
│  ┌──────┐ ┌──────┐ ┌──────┐                           │
│  │ 🇺🇸 USA │ │ 🇬🇧 UK  │ │ ALL  │  ← Region selector   │
│  └──┬───┘ └──────┘ └──────┘                           │
│     ▼                                                   │
│  Everything below filters to selected region:           │
│  - Product list                                         │
│  - Sourcing Queue                                       │
│  - Marketing Plans                                      │
│  - Content Studio                                       │
│  - Analytics                                            │
│  - Ad Accounts                                          │
│  - Budget Tracking                                      │
│                                                         │
│  "ALL" shows combined view with region column visible   │
└─────────────────────────────────────────────────────────┘
```

Implementation: A React context `RegionContext` stores selected region. All Supabase queries filter by region. All API routes accept `?region=usa|uk|all` parameter.

```typescript
// src/lib/region/context.ts
export type Region = 'usa' | 'uk' | 'all';

// Every API call includes region filter
const { data } = await supabase
  .from('products')
  .select('*')
  .eq(region !== 'all' ? 'region' : undefined, region)  // filter if not 'all'
  .order('urs', { ascending: false });
```

### 10.3.5 — Region-Specific Configuration

```typescript
export const REGION_CONFIG = {
  usa: {
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    vatRate: 0,  // varies by state, not included in base calc
    defaultShippingDays: { local: 3, standard: 7, international: 14 },
    platforms: {
      tiktok_shop: { feeRate: 0.05, paymentRate: 0.029 },
      amazon_fba: { referralRate: 0.15, avgFbaFee: 4.50 },
      amazon_fbm: { referralRate: 0.15 },
      shopify: { feeRate: 0, paymentRate: 0.029, fixedFee: 0.30 },
    },
    suppliers: {
      cj_us_warehouse: { avgDelivery: 3, available: true },
      cj_china: { avgDelivery: 14, available: true },
      aliexpress_choice: { avgDelivery: 10, available: true },
      aliexpress_standard: { avgDelivery: 20, available: true },
    },
    adPlatforms: ['meta', 'tiktok', 'google', 'pinterest', 'reddit'],
  },
  uk: {
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    vatRate: 0.20,  // 20% VAT on all sales
    defaultShippingDays: { local: 2, standard: 5, international: 14 },
    platforms: {
      tiktok_shop: { feeRate: 0.05, paymentRate: 0.025 },
      amazon_fba: { referralRate: 0.15, avgFbaFee: 3.50 },  // in GBP
      amazon_fbm: { referralRate: 0.15 },
      shopify: { feeRate: 0, paymentRate: 0.022, fixedFee: 0.20 },
    },
    suppliers: {
      cj_uk_warehouse: { avgDelivery: 3, available: false },  // check availability
      cj_china: { avgDelivery: 14, available: true },
      aliexpress_choice: { avgDelivery: 12, available: true },
      local_uk: { avgDelivery: 2, available: true },
    },
    adPlatforms: ['meta', 'tiktok', 'google', 'pinterest'],
  },
} as const;
```

### 10.3.6 — Cross-Region Product Evaluation

A product discovered for USA can be evaluated for UK viability and vice versa:

```
Worker: W48_cross_region_evaluator
Queue: intelligence_jobs
Trigger: Product confirmed in one region with verdict STRONG

Logic:
  1. Product confirmed STRONG in USA → check UK viability:
     a. Can the supplier ship to UK? (check CJ warehouses)
     b. Are there UK-specific suppliers available? (search local_suppliers where region='uk')
     c. Calculate UK margins (different fees, VAT, shipping)
     d. Check UK platform availability (TikTok Shop UK, Amazon UK)
  2. If viable in other region:
     → Create product record for other region (region = 'uk')
     → Link to same product via cross_region_product_id
     → Add to other region's Sourcing Queue
     → Admin can confirm independently per region
  3. Products can be linked but have separate:
     → Pricing (different buy/sell prices)
     → Suppliers
     → Marketing plans
     → Content (different currency in videos, different language nuances)
     → Ad accounts
```

```sql
-- Cross-region linking
ALTER TABLE products ADD COLUMN cross_region_product_id UUID REFERENCES products(id);
  -- Points to the same product in the other region
  -- NULL if no cross-region equivalent exists

CREATE INDEX idx_products_cross_region ON products(cross_region_product_id)
  WHERE cross_region_product_id IS NOT NULL;
```

### 10.3.7 — Region Impact on Existing Pipeline

| Pipeline Stage | Region Impact |
|---------------|---------------|
| Discovery | Run separate scans: TikTok US vs TikTok UK, Amazon.com vs Amazon.co.uk |
| Supplier Lookup | Different suppliers per region, different shipping costs |
| Cost Calculator | Different platform fees, VAT (UK), fulfillment costs |
| Sourcing Queue | Filtered by region, different supplier options |
| Profitability | Different margins per region due to fees/taxes |
| Break-Even | Region-specific scenarios (§10.2) |
| Marketing Plan | Different ad accounts, different audience targeting |
| Content | Same product images, but text may reference currency/shipping differently |
| Publishing | Different social accounts per region (optional) |
| Ad Campaigns | Separate ad accounts per region, different budgets |
| Channel Performance | Tracked per region (same channel may perform differently) |
| Learning | Region dimension added to memory_aggregates |

---

## 10.4 — APIs vs Custom Scraping: Strategic Analysis

### 10.4.1 — Current API Costs (at operating scale)

| Service | Free Tier | At 500 products/day | At 2000 products/day |
|---------|-----------|--------------------|--------------------|
| **CJDropshipping API** | 1K req/day free | $0 | $0 (within limits) |
| **AliExpress Affiliate API** | ~5K req/day free | $0 | $0 (within limits) |
| **Apify (TikTok/Amazon/Pinterest)** | $5/mo free tier | ~$25-40/mo | ~$80-120/mo |
| **RapidAPI (Amazon)** | 500/mo free | ~$10-20/mo | ~$50-80/mo |
| **ScrapeCreators (TikTok)** | 100/mo free | ~$15/mo | ~$40/mo |
| **TOTAL** | **~$5/mo** | **~$50-75/mo** | **~$170-240/mo** |

### 10.4.2 — Custom Scraping Costs

| Cost Category | Monthly Estimate | Notes |
|--------------|-----------------|-------|
| **Residential Proxies** | $75-200/mo | Bright Data $10/GB, need ~5-15GB for 2K products/day |
| **Server Infrastructure** | $30-50/mo | Railway/VPS for headless Chrome instances |
| **CAPTCHA Solving** | $20-50/mo | 2Captcha at $3/1K solves, Amazon heavy on CAPTCHAs |
| **Maintenance Time** | 8-20 hours/mo | Sites change HTML structure 2-4x/year per platform |
| **Initial Development** | 100-200 hours | One-time: build scrapers for 5+ platforms |
| **TOTAL (monthly)** | **$125-300/mo** | Plus 8-20 hours maintenance |
| **TOTAL (with dev time at $50/hr)** | **$525-1,300/mo** | Including maintenance labor |

### 10.4.3 — Comparison Matrix

| Factor | APIs (Current) | Custom Scraping |
|--------|---------------|----------------|
| **Monthly cost (scale)** | $50-240 | $125-300 (infra only) |
| **Maintenance time** | ~0 hours | 8-20 hours/month |
| **Reliability** | 95-99% (provider handles issues) | 70-85% (sites block, HTML changes) |
| **Setup time** | Hours (API keys) | Weeks to months |
| **Legal risk** | Low (using official APIs + ToS-compliant actors) | Medium-High (ToS violations, CFAA risk) |
| **Data freshness** | Real-time (API calls) | Depends on crawl schedule |
| **Flexibility** | Limited to API fields | Full page data access |
| **Scale ceiling** | Rate-limited but generous | Limited by proxy pool + server capacity |
| **Solo operator friendly** | Yes | No (requires constant monitoring) |

### 10.4.4 — Recommendation: Hybrid API-First Strategy

**DO NOT build custom scrapers.** For a solo operator with $300/mo budget:

1. **Use official APIs wherever possible** (CJDropshipping, AliExpress — both free)
2. **Use Apify for everything else** — they handle proxy rotation, CAPTCHA solving, HTML changes
3. **Scale Apify budget as revenue grows** — start at $5 free tier, move to $49 Starter when needed
4. **Only consider custom scraping when:**
   - Revenue exceeds $5K/month (can absorb the maintenance time)
   - A specific data source has no API or Apify actor
   - You need data at a frequency/volume that exceeds API limits

**Cost at realistic operating scale (500 products/day, both regions):**

| Approach | Monthly Cost | Maintenance | Risk |
|----------|-------------|-------------|------|
| API-first (recommended) | ~$75-100 | ~0 hours | Low |
| Hybrid (API + some custom) | ~$100-150 | ~5 hours | Medium |
| Full custom scraping | ~$200-400 | ~15 hours | High |

**The $75-100/mo API cost is well within the $139 budget buffer** and requires zero maintenance time — letting you focus on growing the business instead of fixing scrapers.

### 10.4.5 — Apify Scaling Plan

| Revenue Stage | Monthly Scan Volume | Apify Plan | Cost |
|--------------|--------------------|-----------|----- |
| Pre-revenue | 100-500/day | Free ($5 credits) | $0 |
| $500/mo revenue | 500-1000/day | Starter ($49) | $49 |
| $2K/mo revenue | 1000-3000/day | Scale ($249) | $249 |
| $5K+ revenue | 3000+/day | Consider custom scrapers for high-volume sources | Varies |

---

## 10.5 — Updated System Totals

### New Workers (This Section)

| Worker | Purpose |
|--------|---------|
| **W46** | Supplier-product auto-matcher |
| **W47** | Break-even calculator (multi-scenario) |
| **W48** | Cross-region product evaluator |

### New Tables (This Section)

| Table | Purpose |
|-------|---------|
| **break_even_scenarios** | Per-product break-even across all scenario combos |

### Modified Tables (This Section)

| Table | Changes |
|-------|---------|
| `products` | +region, +cross_region_product_id |
| `product_costs` | +region |
| `local_suppliers` | +website, +region, +specialties, +min_order_value, +payment_terms, +lead_time_days, +catalog_url, +catalog_import_at |
| `sourcing_queue` | +region |
| `profitability_analysis` | +region |
| `marketing_plans` | +region |
| `content_queue` | +region |
| `published_content` | +region |
| `content_performance` | +region |
| `ad_accounts` | +region |
| `ad_campaigns` | +region |
| `channel_performance` | +region |
| `channel_recommendations` | +region |
| `affiliate_programs` | +region |
| `affiliate_links` | +region |
| `budget_tracking` | +region |

### New Dashboard Pages

| Page | Route | Purpose |
|------|-------|---------|
| Add Product | `/admin/products/new` | Single manual product entry |
| Import Products | `/admin/products/import` | CSV/XLSX bulk import |
| Supplier Management | `/admin/suppliers` (extended) | Full CRUD + catalog import |
| Break-Even Analysis | (Product detail extension) | Scenario matrix per product |

### Updated Totals

**Workers: 52** (was 49, added W46, W47, W48)
**New tables: 27** (was 26, added break_even_scenarios)
**Region columns added to: 16 tables**
**New product columns: +region, +cross_region_product_id (total 12 new columns on products)**

---

# PART 8: UPDATED SYSTEM TOTALS (REVISED)

---

## Worker Summary

| Area | Workers | New This Session |
|------|---------|-----------------|
| Phase 1: Auto-Discovery | W22, W23, W24, W24B | W1B (gating check) |
| Phase 2: Human Checkpoint | Dashboard UI | — |
| Phase 3: Confirmed Pricing | W24C, W24D | — |
| Engine 3A: Marketing Plans | W25 (extended), W25B, W25C | W25 extended |
| Engine 3B: Content Production | W26-W31 | — |
| Feedback & Monitoring | W32-W35 | — |
| Ranking | W36 | — |
| Learning/Memory | W37, W38, W39, W40 | W37, W38, W40 |
| Brand Gating | W1B | W1B |
| Channel Intelligence | W41, W42, W43, W44, W45 | W41-W45 |
| **Manual Input & Matching** | **W46** | **W46** |
| **Break-Even Analysis** | **W47** | **W47** |
| **Cross-Region** | **W48** | **W48** |

**Total new workers: 31** (was 28, added W46, W47, W48)
**Total workers (existing 21 + new 31): 52**

## Database Table Summary

| Table | Purpose | New This Session |
|-------|---------|-----------------|
| products | Core product data (extended) | +region, +cross_region_product_id |
| product_costs | Supplier options + pricing | +region |
| sourcing_queue | Human review checkpoint | +region |
| local_suppliers | Reusable supplier database | +website, +region, +specialties, etc. |
| profitability_analysis | AI viability verdicts | +region |
| marketing_plans | AI-generated marketing plans (extended) | +region |
| content_queue | Content production pipeline | +region |
| published_content | Published content tracking | +region |
| content_performance | Engagement metrics | +region |
| brand_gating | Platform gating status per brand | — |
| affiliate_programs | AI/SaaS affiliate program details | +region |
| affiliate_links | Tracking links per product/platform | +region |
| prediction_log | Every prediction for outcome tracking | — |
| memory_aggregates | Statistical patterns | — |
| memory_lessons | Semantic lessons with pgvector | — |
| score_recalibrations | Proposed weight adjustments | — |
| ad_accounts | OAuth tokens for ad platforms | +region |
| ad_campaigns | Campaign lifecycle management | +region |
| campaign_decisions | Automated optimization log | — |
| channel_performance | Per-channel metrics & ROAS | +region |
| channel_recommendations | AI channel picks per product | +region |
| **break_even_scenarios** | **Per-scenario break-even calculations** | **NEW** |

**Total new tables: 27** (was 21, added 1)
**Region column added to: 16 tables**

---

**END OF BLUEPRINT**

*This document should be treated as the authoritative architecture reference for the YOUSELL platform. All implementation sessions should reference this document.*
