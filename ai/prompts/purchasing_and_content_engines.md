# YOUSELL — Master Implementation Prompt v2
## Purchasing Engine + Profitability Intelligence Engine + Content Creation & Publishing Engine

> **Usage**: Copy this entire prompt into a new Claude session when ready to implement these modules.
> **Prerequisites**: Phase 0 infrastructure must be complete (Supabase, Redis, BullMQ, Auth).
> **Reference**: Read `CLAUDE.md`, `ai/cost_analysis.md`, and `ai/YOUSELL_MASTER_BUILD_BRIEF_v6.md` first.
> **Version**: v2 — Focused supplier approach, Blotato integration, Profitability Intelligence Engine added.

---

## Context

You are building three new engines for the YOUSELL platform — an AI-powered product discovery and intelligence system built with Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Express backend, BullMQ job queues, Redis, and Supabase PostgreSQL.

The platform already has:
- Product discovery workers scraping TikTok, Amazon, and Shopify
- A 3-pillar scoring engine (trend_score, viral_score, profit_score)
- Product detail pages with 7-row intelligence chains
- Smart scraping with P0/P1/P2 priority queues
- Budget enforcement, circuit breakers, and data validation (Zod)
- n8n self-hosted on Railway for workflow orchestration

You are now adding three engines that form a connected intelligence loop:

```
Product Discovery (existing) → scores product
        ↓
ENGINE 1: Purchasing Engine → finds suppliers, calculates buy price
        ↓
ENGINE 2: Profitability Intelligence Engine → THE BRAIN
        ↓ decides: viable? what price? how much to spend on marketing? where to sell?
ENGINE 3: Content/Marketing Engine → creates content ONLY for profitable products
        ↓ posts to platforms, tracks performance
        ↓ feeds back to Engine 2 (learns what works)
```

---

## ENGINE 1 — Purchasing Engine (Focused Approach)

### Purpose
Find approximate buy prices from a small set of high-quality supplier platforms. This is NOT a comprehensive sourcing tool — it provides cost estimates for the Profitability Engine to make decisions.

### Design Philosophy
- Only 2 supplier platforms for dropshipping: **AliExpress** (global) + **TopDawg** (USA)
- Only 2 for wholesale: **Alibaba** + **1688** (China hub)
- Digital/AI products: **simple lookup table** — no scraping needed
- Estimates are flagged as approximate. Good enough for decision-making.

### 1.1 — Supplier Discovery Workers

**`aliexpress_supplier_worker`** (P1 priority)
- Trigger: When a product scores final_score >= 60 (WARM or HOT)
- Source: Apify AliExpress Product Scraper (pay-per-result, $0.004/product)
- Extract: product title match, price, supplier rating, shipping options (ePacket/standard/express), estimated delivery days, supplier country, warehouse location (CN/US/EU/UK)
- Store results in `supplier_listings` table
- Match products using title similarity (>70% match threshold)
- Return multiple suppliers per product — rank by: price ASC, rating DESC, shipping speed ASC
- AliExpress covers: China, EU warehouses, UK warehouses, US warehouses — all in one platform

**`alibaba_wholesale_worker`** (P2 priority)
- Trigger: Downstream from aliexpress_supplier_worker OR when product has high trend_score (>75)
- Source: Apify Alibaba/1688 scraper
- Extract: MOQ, volume pricing tiers (1-49, 50-199, 200-499, 500+), supplier verification status (Gold/Verified/Trade Assurance), factory vs trading company
- This gives the REAL wholesale margins — used when user wants to scale beyond dropshipping
- Focus: China manufacturers only

**`topdawg_supplier_worker`** (P1 priority)
- Trigger: Same as aliexpress_supplier_worker (product scored >= 60)
- Source: TopDawg REST API (Business plan, $35/mo — real-time pricing feed)
- Extract: product match, wholesale price, retail suggested price, supplier name, shipping options (domestic US only), stock availability, auto-order capability
- TopDawg has 500K+ products from 3,000+ verified US suppliers
- Advantage: instant order routing, branded packing slips, US-only fulfillment (fast shipping)
- Product matching: use TopDawg's search API with product title + category

**Digital product handling** — NOT a worker, just a reference table:
```sql
-- Simple lookup table for digital product platforms
CREATE TABLE digital_platform_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL,          -- 'Gumroad', 'Etsy Digital', 'Creative Market', 'Shopify Digital'
  category TEXT,                         -- 'templates', 'ai_tools', 'digital_art', 'courses', 'software'
  platform_fee_percent NUMERIC(5,2),    -- Gumroad: 10%, Etsy: 6.5%, etc.
  payment_processing_percent NUMERIC(5,2),
  avg_marketing_cost_percent NUMERIC(5,2), -- niche avg from industry data
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data — maintained by system, updated periodically
INSERT INTO digital_platform_reference (platform_name, category, platform_fee_percent, payment_processing_percent, avg_marketing_cost_percent) VALUES
('Gumroad', 'all', 10.0, 0, 15.0),
('Etsy Digital', 'templates', 6.5, 3.0, 20.0),
('Creative Market', 'design', 30.0, 0, 10.0),
('Shopify Digital', 'all', 0, 2.9, 25.0),
('Udemy', 'courses', 37.0, 0, 5.0),
('AppSumo', 'software', 70.0, 0, 0);
```

### 1.2 — Cost Calculator Utility

A shared utility (not a worker) used by both the Purchasing Engine and Profitability Engine:

```typescript
interface LandedCostInput {
  buy_price: number;           // from supplier
  quantity: number;            // 1 for dropship, bulk for wholesale
  shipping_cost: number;       // from supplier shipping options
  weight_kg?: number;          // for customs estimate
  hs_code?: string;            // harmonised system code for duty
  destination_country: string; // 'US', 'GB', 'EU'
  selling_platform: 'tiktok_shop' | 'amazon_fba' | 'amazon_fbm' | 'shopify';
  selling_price: number;       // current or proposed
  product_type: 'physical' | 'digital';
}

interface LandedCostResult {
  product_cost: number;
  shipping_cost: number;
  customs_duty_estimate: number;     // estimated, flagged as approximate
  platform_fees: number;             // varies by platform
  payment_processing: number;        // Stripe/PayPal/platform
  total_landed_cost: number;
  gross_margin_percent: number;
  gross_profit: number;
  is_estimate: true;                 // ALWAYS true — never claim accuracy
}
```

Platform fee reference (hardcoded, updated manually):
- TikTok Shop: 5% commission + 2.9% payment
- Amazon FBA: ~15% referral + FBA fees (size/weight based)
- Amazon FBM: ~15% referral
- Shopify: 0% commission + 2.9% + $0.30 payment processing

### 1.3 — Database Schema

```sql
CREATE TABLE supplier_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  source_platform TEXT NOT NULL,        -- 'aliexpress', 'alibaba', '1688', 'topdawg'
  supplier_name TEXT,
  supplier_url TEXT,
  supplier_rating NUMERIC(3,1),
  supplier_country TEXT,                -- ISO code
  warehouse_location TEXT,              -- 'CN', 'US', 'EU', 'UK' (AliExpress multi-warehouse)
  fulfillment_type TEXT DEFAULT 'dropship', -- 'dropship', 'wholesale'
  product_type TEXT DEFAULT 'physical',    -- 'physical', 'digital'
  unit_price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  moq INTEGER DEFAULT 1,
  volume_pricing JSONB,                 -- [{min_qty, max_qty, price_per_unit}] — Alibaba only
  shipping_options JSONB,               -- [{method, cost, days_min, days_max, tracked}]
  landed_cost_breakdown JSONB,          -- full cost calc result per selling platform
  is_verified_supplier BOOLEAN DEFAULT false,
  match_confidence NUMERIC(3,2),        -- 0.00-1.00, title similarity score
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_supplier_product ON supplier_listings(product_id);
CREATE INDEX idx_supplier_tenant ON supplier_listings(tenant_id);
CREATE INDEX idx_supplier_platform ON supplier_listings(source_platform);
CREATE INDEX idx_supplier_price ON supplier_listings(unit_price);

ALTER TABLE supplier_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON supplier_listings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### 1.4 — UI Components

**Product Detail — New Row 8: Purchasing Intelligence**
- Best supplier card (cheapest verified, with rating + shipping estimate)
- All suppliers list: sortable by price, shipping speed, rating
- Landed cost breakdown bar chart (visual: buy + ship + customs + fees = total)
- Per-platform margin comparison (TikTok vs Amazon vs Shopify — side by side)
- "Refresh Suppliers" button → triggers P0 supplier scan
- All prices labelled "Estimated" with tooltip explaining approximation

**Dashboard Integration**
- Small margin badge on product cards: shows best estimated margin %
- Colour coding: green (≥30%), yellow (15-30%), red (<15%)

---

## ENGINE 2 — Profitability Intelligence Engine (THE BRAIN)

### Purpose
The central decision engine that connects purchasing data, marketing costs, and pricing to make intelligent decisions about which products to promote, how much to spend, where to sell, and what price to set.

**This engine has NO additional API cost** — it runs on existing Anthropic API + Supabase + Redis. It's pure business logic + AI reasoning.

### Why This Engine Is Critical
Without it:
- Content Engine generates content for ALL products blindly (wastes money)
- No intelligent pricing (gut feeling only)
- No marketing budget allocation (spend equally on everything)
- No platform recommendation (guess which store to list on)

With it:
- Content only created for products that can actually make money
- Prices optimised for target margins
- Marketing budget concentrated on highest-ROI products
- Platform recommendation based on actual fee comparison

### 2.1 — Profitability Calculator

```typescript
interface ProfitabilityInput {
  // From Purchasing Engine
  best_supplier_price: number;
  best_shipping_cost: number;
  customs_estimate: number;

  // From platform data
  platform_fees: Record<string, number>;  // per selling platform

  // From ad/content performance data
  niche_avg_cpc: number;                  // cost per click (from ad workers)
  niche_avg_cpm: number;                  // cost per 1000 impressions
  niche_conversion_rate: number;          // % of clicks → sales (industry avg or actual)
  content_cost_per_piece: number;         // avg from generated_content table
  est_sales_per_content_piece: number;    // from content_performance data

  // From existing scoring
  trend_score: number;
  viral_score: number;
  competitor_prices: number[];            // from product scraping

  // User config
  target_margin_percent: number;          // default: 30%
}

interface ProfitabilityResult {
  // Cost breakdown
  landed_cost: number;
  marketing_cost_per_sale: number;
  total_cost_per_sale: number;

  // Pricing
  min_viable_price: number;              // price needed for target margin
  recommended_price: number;             // optimised against competitors
  competitor_avg_price: number;

  // Per-platform analysis
  platform_analysis: {
    platform: string;
    margin_percent: number;
    recommended: boolean;
    reason: string;
  }[];

  // Marketing decisions
  content_priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'SKIP';
  marketing_budget_allocation: number;    // $ to spend on this product
  best_social_platform: string;           // where to promote based on niche performance
  max_influencer_cpa: number;             // max spend per influencer-driven sale

  // Overall verdict
  viability: 'STRONG' | 'MODERATE' | 'WEAK' | 'NOT_VIABLE';
  ai_reasoning: string;                   // Anthropic-generated explanation
  is_estimate: true;                      // ALWAYS true
}
```

### 2.2 — Decision Matrix

| Viability Verdict | Margin Range | Content Action | Marketing Budget | Pricing Action |
|------------------|-------------|---------------|-----------------|----------------|
| **STRONG** | ≥ 50% | 3 reel variations + 5 image sets + avatar reel | HIGH — promote on all platforms | Price at competitor avg or slightly below |
| **MODERATE** | ≥ 30% | 1 reel + 3 image sets | MEDIUM — best 2 platforms only | Price at min viable or competitor avg |
| **WEAK** | ≥ 15% | 1 image set only, organic | LOW — organic only, no paid | Price at min viable, tight margins |
| **NOT_VIABLE** | < 15% | **SKIP — no content generated** | $0 | Auto-archive product |

### 2.3 — AI Reasoning (Anthropic Integration)

For each product scored MODERATE or above, generate a brief AI explanation:

```
Prompt to Claude Haiku:
"Given this product data: [product title, trend_score, viral_score, buy_price, landed_cost,
competitor_prices, niche CPC, conversion_rate, platform_fees]

Provide a 2-3 sentence recommendation:
1. Should we sell this product? Why?
2. Best platform to sell on and why?
3. How much should we spend on marketing?

Be specific with numbers. Flag any risks."
```

Cache the response — only regenerate when inputs change by >10%.

### 2.4 — Feedback Loop

The Profitability Engine gets smarter over time:

1. **Content performance data** feeds back actual conversion rates (replaces industry averages)
2. **Actual sales data** (if connected to stores) replaces estimated margins with real ones
3. **Marketing spend data** refines cost-per-sale estimates
4. **Niche-level learning**: if product A in niche X performed well, similar products get higher priority

### 2.5 — Database Schema

```sql
-- Profitability analysis per product
CREATE TABLE profitability_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  best_supplier_id UUID REFERENCES supplier_listings(id),

  -- Cost breakdown
  landed_cost NUMERIC(10,2),
  marketing_cost_per_sale NUMERIC(10,2),
  total_cost_per_sale NUMERIC(10,2),

  -- Pricing
  min_viable_price NUMERIC(10,2),
  recommended_price NUMERIC(10,2),
  competitor_avg_price NUMERIC(10,2),

  -- Per-platform margins
  platform_margins JSONB,               -- [{platform, margin_pct, fees, recommended, reason}]

  -- Marketing decisions
  content_priority TEXT,                 -- 'HIGH', 'MEDIUM', 'LOW', 'SKIP'
  marketing_budget NUMERIC(10,2),
  best_social_platform TEXT,
  max_influencer_cpa NUMERIC(10,2),

  -- Verdict
  viability TEXT NOT NULL,               -- 'STRONG', 'MODERATE', 'WEAK', 'NOT_VIABLE'
  ai_reasoning TEXT,                     -- cached Anthropic response
  ai_reasoning_hash TEXT,                -- hash of inputs, regenerate when changed >10%

  -- Meta
  is_estimate BOOLEAN DEFAULT true,      -- ALWAYS true
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profitability_product ON profitability_analysis(product_id);
CREATE INDEX idx_profitability_tenant ON profitability_analysis(tenant_id);
CREATE INDEX idx_profitability_viability ON profitability_analysis(viability);
CREATE INDEX idx_profitability_priority ON profitability_analysis(content_priority);

ALTER TABLE profitability_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON profitability_analysis
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### 2.6 — UI Components

**Product Detail — Row 8 enhanced: Profitability Intelligence**
- Viability badge (STRONG/MODERATE/WEAK/NOT_VIABLE) with colour
- Recommended selling price with "Estimated" label
- Per-platform margin comparison chart
- AI reasoning card (2-3 sentence explanation)
- Marketing budget recommendation
- "Where to sell" recommendation with reasoning

**Dashboard Integration**
- Viability filter: show only STRONG / MODERATE / etc.
- Stats bar: "X products viable (≥30% margin)"
- Sorting by estimated margin

**Marketing Dashboard (new sub-page)**
- Budget allocation overview: pie chart of spend per product
- Platform performance: which social platform converts best per niche
- Content ROI: cost per content piece vs revenue attributed

---

## ENGINE 3 — Content Creation & Publishing Engine

### Purpose
Automatically generate and publish social media content, BUT only for products that the Profitability Engine has approved. Content type and budget are determined by the Profitability Engine's verdict.

### 3.1 — Content Analysis Workers

**`viral_content_analyzer_worker`** (P1 priority)
- Analyse existing viral videos and creator content from our database
- Use Anthropic Haiku to extract:
  - Hook pattern (first 3 seconds strategy)
  - Script structure (hook → problem → solution → CTA)
  - Visual style (transitions, effects, pacing)
  - Hashtag strategy per platform
  - Best posting times (from engagement data)
- Store in `content_templates` table
- Output: reusable content blueprints per niche

**`trend_content_matcher_worker`** (P1 priority)
- When a product has content_priority = 'HIGH' or 'MEDIUM':
  - Find top 5 viral videos in that niche from our database
  - Extract winning content pattern
  - Create content brief: what to make, which template, which product
  - Queue content generation based on Profitability Engine verdict

### 3.2 — Content Generation (via Blotato + HeyGen)

**`content_generation_worker`** (P1 priority)
- Uses **Blotato API** ($29/mo) for:
  - AI-generated product images (all platform formats)
  - AI-generated faceless video reels (15-30s)
  - AI voiceover (ElevenLabs built into Blotato)
  - AI-written captions in 58 languages
  - Platform-specific formatting
- Uses **HeyGen API** ($29/mo) for:
  - AI avatar "talking head" reels (30-60s)
  - Product reviews, comparisons, "I found this trending product" style
- Uses **Anthropic Haiku** for:
  - Script generation (hooks, body, CTA)
  - Hashtag research per platform
  - Caption variations

**Content volume based on Profitability verdict:**

| Verdict | Faceless Reels | Avatar Reels | Image Sets | Total Content |
|---------|---------------|-------------|-----------|---------------|
| STRONG | 3 variations | 1 | 5 sets (all platforms) | 9 pieces |
| MODERATE | 1 | 0 | 3 sets (best 2 platforms) | 4 pieces |
| WEAK | 0 | 0 | 1 set (organic only) | 1 piece |
| NOT_VIABLE | 0 | 0 | 0 | **SKIP** |

### 3.3 — Content Publishing (via Blotato)

**`content_publisher_worker`** (P0 priority — content must go out on schedule)
- Uses **Blotato's native n8n node** for posting to:
  - TikTok (reels, product showcase)
  - Instagram (reels, stories, carousels, feed)
  - Facebook (reels, posts)
  - YouTube Shorts
  - Pinterest (pins, idea pins)
- Features:
  - Optimal posting time per platform (from content analysis data)
  - Staggered posting (min 2h between posts per platform)
  - Platform-specific formatting handled by Blotato
  - **Human review queue by default** — content waits in "pending_review"
  - Auto-posting toggle (user enables after trust is established)
  - Up to 900 TikTok posts/month on Blotato Starter

**`content_performance_tracker_worker`** (P2 priority)
- Polls social APIs for engagement metrics (views, likes, shares, saves, CTR)
- Feeds performance back to:
  - `content_templates` → updates performance_score (better templates ranked higher)
  - `profitability_analysis` → updates actual conversion rates (replaces estimates)
  - Profitability Engine → learns which platforms convert best per niche

### 3.4 — Database Schema

```sql
-- Content templates (learned from viral analysis)
CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  niche TEXT,
  product_type TEXT,
  hook_pattern TEXT,                    -- 'question', 'before_after', 'pov', 'unboxing'
  script_structure JSONB,              -- {hook, problem, solution, cta}
  visual_style JSONB,                  -- {transitions, effects, pacing}
  hashtag_strategy JSONB,              -- {platform: [hashtags]}
  optimal_posting_times JSONB,         -- {platform: {best_days, best_hours_utc}}
  performance_score NUMERIC(5,2) DEFAULT 50, -- weighted avg, starts at 50
  times_used INTEGER DEFAULT 0,
  source_video_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated content
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  profitability_id UUID REFERENCES profitability_analysis(id),
  template_id UUID REFERENCES content_templates(id),
  content_type TEXT NOT NULL,           -- 'faceless_reel', 'avatar_reel', 'product_image', 'carousel'
  target_platform TEXT NOT NULL,        -- 'tiktok', 'instagram', 'facebook', 'youtube', 'pinterest'
  status TEXT DEFAULT 'generating',     -- 'generating', 'pending_review', 'approved', 'scheduled', 'published', 'failed'
  script TEXT,
  media_urls JSONB,                     -- [{type, url, format, dimensions}]
  caption TEXT,
  hashtags TEXT[],
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_post_id TEXT,                -- platform's post ID
  generation_cost NUMERIC(6,4),         -- tracked per piece
  generation_tool TEXT,                 -- 'blotato', 'heygen', 'anthropic'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Content performance tracking
CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  content_id UUID NOT NULL REFERENCES generated_content(id),
  platform TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  click_through_rate NUMERIC(5,2),
  engagement_rate NUMERIC(5,2),
  estimated_revenue NUMERIC(10,2),      -- if attributable
  measured_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_content_product ON generated_content(product_id);
CREATE INDEX idx_content_status ON generated_content(status);
CREATE INDEX idx_content_scheduled ON generated_content(scheduled_at) WHERE status IN ('approved', 'scheduled');
CREATE INDEX idx_content_tenant ON generated_content(tenant_id);
CREATE INDEX idx_content_priority ON generated_content(tenant_id, status);
CREATE INDEX idx_perf_content ON content_performance(content_id);
CREATE INDEX idx_templates_niche ON content_templates(niche, performance_score DESC);

-- RLS on all tables
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON content_templates
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON generated_content
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation ON content_performance
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### 3.5 — UI Components

**Content Hub** (new top-level sidebar section)
- **Content Calendar**: monthly/weekly view — scheduled + published content
- **Review Queue**: pending_review content — approve/reject/edit before posting
- **Content Library**: all generated content, filter by product/type/platform/status
- **Performance Dashboard**: engagement metrics, best/worst content, ROI per content piece

**Content Settings Page**
- Auto-post toggle (OFF by default — require manual approval first)
- Posting frequency limits per platform per day
- HeyGen avatar configuration (select avatar, voice, style)
- Brand guidelines (logo watermark, brand colours, fonts)
- Blotato API connection status

**Product Detail — New Row 9: Content**
- Content generated for this product (with status badges)
- Performance metrics per content piece
- "Generate Content" button (respects Profitability Engine verdict)
- Content cost tracking for this product

---

## n8n Workflow Specifications

### Workflows Using Free Community Templates

| Our Workflow | Based on n8n Template | Template # | Customisation |
|-------------|----------------------|-----------|---------------|
| Content Publishing Pipeline | "Automate Multi-Platform Social Media Content Creation with AI" | [#3066](https://n8n.io/workflows/3066) | Replace generic AI with our product data + Profitability verdict |
| Video Auto-Post | "Generate & auto-post AI videos to social media with Veo3 and Blotato" | [#5035](https://n8n.io/workflows/5035) | Swap Veo3 for HeyGen (avatar) + Blotato (faceless) |
| Daily Publishing Schedule | "Automate content publishing to TikTok, YouTube, Instagram, Facebook via Blotato" | [#7187](https://n8n.io/workflows/7187) | Replace Google Sheet trigger with Supabase `generated_content` table trigger |
| Content Factory | "Automated social media content publishing factory" | [#3135](https://n8n.io/workflows/3135) | Wire to our content_templates + profitability data |

### Custom Workflows (Must Build)

**Workflow 1: "Supplier Discovery Pipeline"**
- Trigger: Supabase webhook — product.final_score updated >= 60
- Step 1: Check if supplier_listings exist and < 24h old → skip if fresh
- Step 2: Run aliexpress_supplier_worker + topdawg_supplier_worker in parallel
- Step 3: If trend_score > 75 → also run alibaba_wholesale_worker
- Step 4: Cost calculator runs on all results
- Step 5: Trigger Profitability Engine

**Workflow 2: "Profitability Engine"**
- Trigger: supplier_listings updated for a product
- Step 1: Gather: best supplier price + shipping + competitor prices + niche CPC/CPM
- Step 2: Calculate landed cost per selling platform
- Step 3: Calculate marketing cost per sale
- Step 4: Determine viability verdict
- Step 5: If MODERATE+ → generate AI reasoning via Anthropic
- Step 6: Write profitability_analysis record
- Step 7: If STRONG/MODERATE → trigger Content Pipeline
- Step 8: If NOT_VIABLE → auto-archive product + notify user

**Workflow 3: "Content Pipeline" (extends template #3066)**
- Trigger: profitability_analysis.content_priority = 'HIGH' or 'MEDIUM'
- Step 1: Match best content_template for this product's niche
- Step 2: Generate script via Anthropic Haiku
- Step 3: Based on content_priority:
  - HIGH: queue Blotato (3 faceless reels + 5 image sets) + HeyGen (1 avatar reel)
  - MEDIUM: queue Blotato (1 reel + 3 image sets)
  - LOW: queue Blotato (1 image set only)
- Step 4: All generated content → status = 'pending_review'
- Step 5: If auto-post enabled → schedule via Blotato at optimal times
- Step 6: If manual review → send notification to Review Queue

**Workflow 4: "Performance Feedback Loop"**
- Trigger: Cron, every 6 hours
- Step 1: Check engagement on published content (last 48h)
- Step 2: Update content_performance table
- Step 3: Update content_templates.performance_score (top performers → higher score)
- Step 4: Update profitability_analysis with actual conversion data
- Step 5: For top-performing content → generate similar for other products in same niche
- Step 6: For poor performers → reduce template score, notify user

**Workflow 5: "Daily Content Schedule"**
- Trigger: Cron, 6:00 AM user timezone (extends template #7187)
- Step 1: Pull approved content not yet scheduled
- Step 2: Apply optimal posting times per platform (from content_templates)
- Step 3: Stagger: min 2h gap per platform, spread across day
- Step 4: Schedule via Blotato n8n node
- Step 5: Send daily content summary notification

---

## Worker Registry Update

Add to Section 12.1 and `/system/worker_map.md`:

| # | Worker Name | Queue | Trigger | Priority |
|---|------------|-------|---------|----------|
| 22 | aliexpress_supplier_worker | P1_queue | product scored >= 60 | P1 |
| 23 | alibaba_wholesale_worker | P2_queue | downstream from #22 OR trend_score > 75 | P2 |
| 24 | topdawg_supplier_worker | P1_queue | product scored >= 60 | P1 |
| 25 | viral_content_analyzer_worker | P1_queue | new viral video in DB | P1 |
| 26 | trend_content_matcher_worker | P1_queue | product content_priority = HIGH/MEDIUM | P1 |
| 27 | content_generation_worker | P1_queue | content brief created | P1 |
| 28 | content_publisher_worker | P0_queue | content approved + scheduled | P0 |
| 29 | content_performance_tracker_worker | P2_queue | cron every 6h | P2 |

**Total workers: 21 (existing) + 8 (new) = 29 workers**

*(Reduced from 34 in v1 by: dropping 4 regional supplier workers, dropping digital_product_worker, consolidating content generation into 1 worker using Blotato API)*

---

## Guardrails (New: #23-27)

| # | Rule | Requirement |
|---|------|------------|
| 23 | Content requires review by default | Auto-post OFF until user explicitly enables it. All content starts as 'pending_review'. |
| 24 | All prices are estimates | Every price, margin, and cost shown to user MUST be labelled "Estimated". Never claim accuracy. |
| 25 | Track content generation cost | Every piece of content must log its generation_cost in the generated_content table. |
| 26 | Profitability Engine gates content | Content Engine MUST check profitability_analysis.content_priority before generating. SKIP = no content. |
| 27 | Budget caps per content service | Daily budget limits for Blotato credits, HeyGen credits, and Anthropic content calls. Enforced via Redis. |

---

## Development Sessions (Micro-Tasks)

### Purchasing Engine (3 sessions)

**P.1 — Schema + Cost Calculator**
- [ ] Create supplier_listings table + digital_platform_reference table + indexes + RLS
- [ ] Build cost_calculator utility (landed cost per platform)
- [ ] Seed digital_platform_reference with initial data
- [ ] Currency conversion integration (free exchangerate-api)

**P.2 — Supplier Workers**
- [ ] aliexpress_supplier_worker (Apify pay-per-result)
- [ ] topdawg_supplier_worker (TopDawg REST API)
- [ ] alibaba_wholesale_worker (Apify)
- [ ] n8n workflow: "Supplier Discovery Pipeline"

**P.3 — Purchasing UI**
- [ ] Product detail Row 8: Purchasing Intelligence card
- [ ] Supplier list + cost breakdown visualisation
- [ ] Dashboard margin badges + viability filter

### Profitability Intelligence Engine (2 sessions)

**PI.1 — Core Engine**
- [ ] Create profitability_analysis table + indexes + RLS
- [ ] Build profitability calculator (inputs → verdict + decisions)
- [ ] Anthropic integration for AI reasoning
- [ ] n8n workflow: "Profitability Engine"

**PI.2 — UI + Feedback Loop**
- [ ] Product detail Row 8 enhanced: viability badge + AI reasoning + pricing
- [ ] Marketing dashboard sub-page (budget allocation, platform performance)
- [ ] Dashboard viability filters + stats
- [ ] n8n workflow: "Performance Feedback Loop" (connects to content performance later)

### Content Engine (4 sessions)

**C.1 — Schema + Content Analysis**
- [ ] Create content_templates + generated_content + content_performance tables
- [ ] viral_content_analyzer_worker
- [ ] trend_content_matcher_worker

**C.2 — Content Generation**
- [ ] content_generation_worker (Blotato API + HeyGen API integration)
- [ ] Anthropic script generation (hooks, captions, hashtags)
- [ ] Content volume logic based on Profitability verdict
- [ ] n8n workflow: "Content Pipeline" (based on template #3066)

**C.3 — Publishing + Performance**
- [ ] content_publisher_worker (Blotato n8n node)
- [ ] content_performance_tracker_worker
- [ ] Human review queue logic
- [ ] n8n workflows: "Daily Content Schedule" (#7187) + auto-post scheduling

**C.4 — Content UI**
- [ ] Content Hub page: calendar, review queue, library, performance dashboard
- [ ] Product detail Row 9: Content card
- [ ] Content settings page (auto-post toggle, avatar config, brand guidelines)

---

## Success Criteria

### Purchasing Engine
- [ ] Every product with final_score >= 60 has at least 1 supplier from AliExpress or TopDawg within 1 hour
- [ ] Cost calculator produces landed cost per selling platform
- [ ] Supplier data refreshes when > 24h old

### Profitability Intelligence Engine
- [ ] Every product with suppliers gets a viability verdict
- [ ] NOT_VIABLE products are auto-archived (configurable)
- [ ] AI reasoning generated for MODERATE+ products
- [ ] Content Engine respects content_priority — SKIP means no content
- [ ] Recommended selling price calculated for each viable product
- [ ] Marketing budget allocated proportional to viability

### Content Engine
- [ ] Content generated only for products with content_priority != 'SKIP'
- [ ] STRONG products get 9 content pieces, MODERATE gets 4, WEAK gets 1
- [ ] All content starts in 'pending_review' unless auto-post enabled
- [ ] Publishing works on at least TikTok + Instagram via Blotato
- [ ] Performance data feeds back to template scoring + profitability analysis
- [ ] Content generation cost tracked per piece, stays within monthly budget

---

## Cost Summary (Config C)

| Service | Monthly Cost |
|---------|-------------|
| Supabase Pro | $25 |
| Railway (Express + Workers + Redis + n8n) | $41 |
| Apify Growth (all scraping + suppliers) | $110 |
| TopDawg Business (US dropship API) | $35 |
| Anthropic Claude API (all AI features) | $31 |
| HeyGen Creator (avatar reels) | $29 |
| Blotato Starter (content + publishing) | $29 |
| Resend, SerpAPI, YouTube, shipping APIs | $0 |
| **TOTAL** | **~$291/mo** |

*$124/mo cheaper than Config B ($415) with better intelligence.*

---

*Execute this prompt AFTER Phase 1 (TikTok MVP) is complete.*
*Purchasing Engine maps to Phase 2 timeline.*
*Profitability Engine maps to Phase 2-3 boundary.*
*Content Engine maps to Phase 3 timeline.*
*Update `/ai/task_board.md`, `/ai/project_state.md`, and `/system/worker_map.md` after implementation.*
