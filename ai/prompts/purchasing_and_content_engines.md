# YOUSELL — Master Implementation Prompt
## Purchasing Engine + Automated Content Creation & Publishing Engine

> **Usage**: Copy this entire prompt into a new Claude session when ready to implement these modules.
> **Prerequisites**: Phase 0 infrastructure must be complete (Supabase, Redis, BullMQ, Auth).
> **Reference**: Read `CLAUDE.md`, `ai/cost_analysis.md`, and `ai/YOUSELL_MASTER_BUILD_BRIEF_v6.md` first.

---

## Context

You are building two new engines for the YOUSELL platform — an AI-powered product discovery and intelligence system built with Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Express backend, BullMQ job queues, Redis, and Supabase PostgreSQL.

The platform already has:
- Product discovery workers scraping TikTok, Amazon, and Shopify
- A 3-pillar scoring engine (trend_score, viral_score, profit_score)
- Product detail pages with 7-row intelligence chains
- Smart scraping with P0/P1/P2 priority queues
- Budget enforcement, circuit breakers, and data validation (Zod)
- n8n self-hosted on Railway for workflow orchestration

You are now adding two critical missing engines:

---

## ENGINE 1 — Purchasing Intelligence Engine

### Purpose
Automatically discover wholesale and dropshipping suppliers for every scored product, calculate landed costs, and determine real-world profit viability across platforms.

### Requirements

#### 1.1 — Supplier Discovery Workers

Create the following BullMQ workers following the existing worker base class pattern (Section 12.2 of the master brief):

**`aliexpress_supplier_worker`** (P1 priority)
- Trigger: When a product scores final_score >= 60 (WARM or HOT)
- Source: Apify AliExpress Product Scraper (pay-per-result, $0.004/product)
- Extract: product title match, price tiers, supplier rating, shipping options, MOQ, supplier country
- Store results in a new `supplier_listings` table
- Match products using title similarity + image hash (where available)
- Handle: multiple suppliers per product (rank by price + rating + shipping speed)

**`alibaba_wholesale_worker`** (P2 priority)
- Trigger: Downstream from aliexpress_supplier_worker OR manual trigger
- Source: Apify Alibaba/1688 scraper
- Extract: MOQ, volume pricing tiers (1-99, 100-499, 500+), supplier verification status, trade assurance, factory vs trading company
- Focus on China hub — this is the primary wholesale source

**`amazon_wholesale_worker`** (P2 priority)
- Trigger: When product has Amazon cross-platform match
- Source: Amazon Product API (already available via amazon_bsr_scanner_worker)
- Extract: FBA fees, referral fees, prep fees, wholesale price from authorized distributors
- Calculate: FBA landed cost = product cost + shipping to FBA + FBA fees + referral fee

**`regional_supplier_worker`** (P2 priority, idle-only)
- Cover 4 purchasing hubs:
  - **China**: AliExpress, Alibaba/1688 (primary)
  - **EU**: European wholesale directories (BigBuy, Syncee)
  - **UK**: UK wholesale platforms (wholesale clearance, eBay wholesale)
  - **USA**: US wholesale (Faire, Tundra, wholesale central)
- For each hub: extract price, shipping cost to customer regions, customs/duty estimates
- Store with `hub_region` field in supplier_listings

**`dropship_platform_worker`** (P1 priority)
- Evaluate dropshipping viability on:
  - Amazon (FBA and FBM)
  - Amazon Prime (eligibility check)
  - AliExpress dropshipping (direct to customer)
  - CJ Dropshipping
  - Spocket (US/EU suppliers)
- For each: calculate shipping time, cost, return policy, platform fees
- Flag as `fulfillment_type: 'dropship' | 'wholesale' | 'private_label'`

**`digital_product_worker`** (P2 priority)
- For products identified as digital/AI products:
  - Check relevant platforms: Gumroad, Shopify digital, Etsy digital, Creative Market
  - Note creation tools needed (Canva, Midjourney, ChatGPT, etc.)
  - Estimate marketing cost per sale (based on niche CPM/CPC data)
  - Calculate margin: selling price - platform fee - marketing cost per sale
- Store in supplier_listings with `product_type: 'digital'`

#### 1.2 — Cost Calculation Engine

Create a `cost_calculator` service (not a worker — a utility used by workers):

```
landed_cost = {
  product_cost: supplier_price × quantity,
  shipping_cost: weight × rate_per_kg × distance_factor,
  customs_duty: product_cost × hs_code_rate × country_rate,
  platform_fees: {
    tiktok_shop: selling_price × 0.05,       // 5% commission
    amazon_fba: referral_fee + fba_fee,       // varies by category
    amazon_fbm: referral_fee,                 // ~15%
    shopify: 0,                               // no commission (own store)
    shopify_payments: selling_price × 0.029 + 0.30  // payment processing
  },
  marketing_cost_estimate: selling_price × niche_avg_acos,
  total_landed_cost: sum_of_above
}

margin = {
  gross_margin: (selling_price - total_landed_cost) / selling_price × 100,
  net_margin_estimate: gross_margin - marketing_cost_percentage,
  viable: net_margin_estimate >= 30,
  recommendation: 'STRONG' | 'MODERATE' | 'WEAK' | 'NOT_VIABLE'
}
```

Margin recommendation thresholds:
- STRONG: net margin >= 50%
- MODERATE: net margin >= 30%
- WEAK: net margin >= 15%
- NOT_VIABLE: net margin < 15%

#### 1.3 — Database Schema

```sql
-- Supplier listings table
CREATE TABLE supplier_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  platform TEXT NOT NULL,                    -- 'aliexpress', 'alibaba', 'amazon_wholesale', etc.
  supplier_name TEXT,
  supplier_url TEXT,
  supplier_rating NUMERIC(3,1),
  supplier_country TEXT,                     -- ISO country code
  hub_region TEXT NOT NULL,                  -- 'china', 'eu', 'uk', 'usa'
  product_type TEXT DEFAULT 'physical',      -- 'physical', 'digital', 'ai_product'
  fulfillment_type TEXT DEFAULT 'wholesale', -- 'wholesale', 'dropship', 'private_label', 'digital'
  unit_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  moq INTEGER,
  volume_pricing JSONB,                      -- [{min_qty, max_qty, price_per_unit}]
  shipping_options JSONB,                    -- [{method, cost, days_min, days_max}]
  customs_duty_rate NUMERIC(5,2),
  landed_cost_estimate JSONB,                -- full cost breakdown
  margin_analysis JSONB,                     -- per-platform margin calculation
  margin_recommendation TEXT,                -- 'STRONG', 'MODERATE', 'WEAK', 'NOT_VIABLE'
  is_verified_supplier BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_supplier_product ON supplier_listings(product_id);
CREATE INDEX idx_supplier_tenant ON supplier_listings(tenant_id);
CREATE INDEX idx_supplier_recommendation ON supplier_listings(margin_recommendation);
CREATE INDEX idx_supplier_region ON supplier_listings(hub_region);

-- RLS
ALTER TABLE supplier_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON supplier_listings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

#### 1.4 — UI Components

**Product Detail — New Row 8: Purchasing Intelligence**
Add as Row 8 in the product detail 7-row chain (now 8 rows):
- Best supplier card: cheapest verified supplier with rating
- All suppliers list: sortable by price, shipping, rating
- Margin breakdown: visual bar showing cost components
- Platform comparison: side-by-side margin for TikTok vs Amazon vs Shopify
- Recommendation badge: STRONG/MODERATE/WEAK/NOT_VIABLE with colour coding
- "Find More Suppliers" button: triggers P0 supplier scan

**Dashboard Integration**
- Add margin_recommendation badge to product cards
- Filter products by viability: STRONG | MODERATE | WEAK | NOT_VIABLE
- Stats bar: "X products viable at 30%+ margin"

#### 1.5 — n8n Workflow

Create an n8n workflow: "Supplier Discovery Pipeline"
- Trigger: Supabase webhook when product.final_score is updated and >= 60
- Step 1: Check if supplier_listings exist and are < 24h old
- Step 2: If stale → enqueue aliexpress_supplier_worker (P1)
- Step 3: Wait for worker completion (Supabase Realtime or polling)
- Step 4: If margin_recommendation = 'STRONG' → send notification
- Step 5: If margin_recommendation = 'NOT_VIABLE' → auto-archive product

---

## ENGINE 2 — Automated Content Creation & Publishing Engine

### Purpose
Automatically generate high-quality social media content (faceless reels, AI avatar reels, product images, carousels) based on trending products and viral content patterns, then auto-publish across all platforms.

### Requirements

#### 2.1 — Content Analysis Workers

**`viral_content_analyzer_worker`** (P1 priority)
- Analyse existing viral videos and creator content from the database
- Use Anthropic Claude (Haiku) to extract:
  - Hook pattern (first 3 seconds)
  - Script structure (hook → problem → solution → CTA)
  - Visual style (transitions, effects, text overlays)
  - Audio style (trending sound, voiceover, ASMR)
  - Hashtag strategy
  - Posting time optimisation (based on engagement data)
- Store analysis in `content_templates` table
- Output: reusable content blueprints per niche/product type

**`trend_content_matcher_worker`** (P1 priority)
- When a product scores HOT (final_score >= 80):
  - Find top 5 viral videos in that niche from our video database
  - Extract the winning content pattern
  - Generate a content brief: "Make a video like [viral ref] but for [our product]"
  - Queue content generation

#### 2.2 — Content Generation Workers

**`faceless_reel_worker`** (P1 priority)
- Input: product data + content template + viral reference
- Pipeline:
  1. **Script**: Anthropic Haiku generates 15-30s script (hook + body + CTA)
  2. **Voiceover**: ElevenLabs API generates voiceover from script
  3. **Visuals**: Runway ML generates product B-roll / showcase clips (5-10s segments)
  4. **Images**: Flux API generates product lifestyle images for transitions
  5. **Assembly**: FFmpeg (server-side) combines: voiceover + visuals + text overlays + background music
  6. **Variations**: Generate 2-3 variations per product (different hooks)
- Output: MP4 files ready for posting
- Store in Supabase Storage or S3
- Estimated cost per reel: ~$0.50-1.00

**`avatar_reel_worker`** (P2 priority)
- Input: product data + content template + avatar configuration
- Pipeline:
  1. **Script**: Anthropic Haiku generates 30-60s conversational script
  2. **Avatar video**: HeyGen API generates avatar speaking the script
  3. **B-roll inserts**: Runway ML generates product footage to intercut
  4. **Assembly**: FFmpeg combines avatar + B-roll + text overlays
- Output: MP4 with AI presenter
- Store in Supabase Storage or S3
- Estimated cost per reel: ~$1.50-3.00
- Use this for: product reviews, "I found this trending product", comparison videos

**`product_image_worker`** (P1 priority)
- Input: product data + niche + platform specs
- Pipeline:
  1. **Prompt**: Anthropic Haiku generates Flux image prompt from product title + description
  2. **Generation**: Flux API generates product lifestyle images
  3. **Variations**: Generate for each platform's aspect ratio:
     - Instagram feed: 1080×1080 (square)
     - Instagram story: 1080×1920 (9:16)
     - Pinterest: 1000×1500 (2:3)
     - Facebook: 1200×630 (landscape)
  4. **Text overlay**: Add product name, price, CTA using Sharp/Canvas
  5. **Carousel**: Group 3-5 images into carousel sets
- Output: PNG/JPG files per platform
- Estimated cost per image set: ~$0.20-0.40

#### 2.3 — Content Publishing System

**`content_publisher_worker`** (P0 priority — content must go out on schedule)
- Integration: Use a social posting API (Post for Me, Postiz self-hosted, or Ayrshare)
- Platforms:
  - TikTok (reels + product showcase)
  - Instagram (reels, stories, carousels, feed posts)
  - Facebook (reels, posts)
  - YouTube Shorts
  - Pinterest (pins, idea pins)
  - Shopify store blog (SEO content)
- Features:
  - Optimal posting time per platform (from viral_content_analyzer data)
  - Staggered posting: don't post same content to all platforms simultaneously
  - Platform-specific formatting (aspect ratio, caption length, hashtag count)
  - Human review queue: content waits in "pending review" before auto-posting (configurable)
  - Auto-posting toggle: user can enable full automation or require approval

**`content_performance_tracker_worker`** (P2 priority)
- Poll social media APIs for engagement metrics on posted content
- Track: views, likes, comments, shares, saves, click-through rate
- Feed performance data back into viral_content_analyzer to improve templates
- Identify best-performing content patterns → weight them higher for future generation

#### 2.4 — Database Schema

```sql
-- Content templates (learned from viral analysis)
CREATE TABLE content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  niche TEXT,
  product_type TEXT,
  hook_pattern TEXT,                    -- "Question hook", "Before/After", "POV", etc.
  script_structure JSONB,              -- {hook, problem, solution, cta}
  visual_style JSONB,                  -- {transitions, effects, pacing}
  audio_style TEXT,                    -- 'voiceover', 'trending_sound', 'asmr'
  hashtag_strategy JSONB,             -- [hashtags by platform]
  optimal_posting_times JSONB,        -- {platform: {day_of_week, hour_utc}}
  performance_score NUMERIC(5,2),     -- weighted avg of content using this template
  source_video_ids UUID[],            -- reference viral videos this was derived from
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated content
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  template_id UUID REFERENCES content_templates(id),
  content_type TEXT NOT NULL,          -- 'faceless_reel', 'avatar_reel', 'product_image', 'carousel'
  platform TEXT NOT NULL,              -- 'tiktok', 'instagram', 'facebook', 'youtube', 'pinterest'
  status TEXT DEFAULT 'generating',    -- 'generating', 'pending_review', 'approved', 'published', 'failed'
  script TEXT,                         -- AI-generated script
  media_urls JSONB,                   -- [{type, url, platform_format}]
  caption TEXT,
  hashtags TEXT[],
  scheduled_at TIMESTAMPTZ,           -- when to publish
  published_at TIMESTAMPTZ,           -- when actually published
  external_post_id TEXT,              -- platform's post ID after publishing
  generation_cost NUMERIC(6,4),       -- cost to generate this content
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
  measured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_content_product ON generated_content(product_id);
CREATE INDEX idx_content_status ON generated_content(status);
CREATE INDEX idx_content_scheduled ON generated_content(scheduled_at) WHERE status = 'approved';
CREATE INDEX idx_content_tenant ON generated_content(tenant_id);
CREATE INDEX idx_perf_content ON content_performance(content_id);
CREATE INDEX idx_templates_niche ON content_templates(niche, product_type);

-- RLS
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

#### 2.5 — UI Components

**Content Hub Page** (new top-level section in sidebar)
- **Content Calendar**: Monthly/weekly view showing scheduled + published content
- **Content Queue**: List of pending_review content with approve/reject/edit actions
- **Content Library**: All generated content, filterable by product/type/platform/status
- **Performance Dashboard**: Engagement metrics, best content, worst content, trending templates
- **Content Settings**:
  - Auto-post toggle (on/off per platform)
  - Human review requirement toggle
  - Posting frequency limits (max X posts/day/platform)
  - Avatar configuration (select avatar, voice, style)
  - Brand guidelines (colours, fonts, logo watermark)

**Product Detail — New Row 9: Content**
- Show generated content for this product
- "Generate Content" button: triggers faceless_reel + product_image workers
- Content performance stats for this product

#### 2.6 — n8n Workflows

**Workflow 1: "New HOT Product → Content Pipeline"**
- Trigger: product.final_score updated >= 80
- Step 1: viral_content_analyzer extracts best template for this niche
- Step 2: Queue faceless_reel_worker (2 variations)
- Step 3: Queue product_image_worker (all platforms)
- Step 4: If product has creator data → queue avatar_reel_worker
- Step 5: Wait for all generation to complete
- Step 6: If auto-post enabled → schedule publishing
- Step 7: If human review required → send notification to review queue

**Workflow 2: "Content Performance Feedback Loop"**
- Trigger: Cron, every 6 hours
- Step 1: Check engagement on all published content (last 48h)
- Step 2: Identify top performers (engagement_rate > 5%)
- Step 3: Update content_templates.performance_score
- Step 4: For top performers → generate similar content for other products in same niche
- Step 5: For low performers → flag template for review

**Workflow 3: "Daily Content Schedule"**
- Trigger: Cron, 6:00 AM user's timezone
- Step 1: Check content queue (approved, not yet scheduled)
- Step 2: Apply optimal posting times per platform
- Step 3: Stagger posts throughout the day (min 2h between posts per platform)
- Step 4: Schedule via social posting API
- Step 5: Send daily content summary notification

---

## Integration with Existing Architecture

### Worker Registry Update
Add these workers to Section 12.1 and `/system/worker_map.md`:

| # | Worker Name | Queue | Trigger | Priority |
|---|------------|-------|---------|----------|
| 22 | aliexpress_supplier_worker | P1_queue | product scored >= 60 | P1 |
| 23 | alibaba_wholesale_worker | P2_queue | downstream from #22 | P2 |
| 24 | amazon_wholesale_worker | P2_queue | product has Amazon match | P2 |
| 25 | regional_supplier_worker | P2_queue | idle scheduler | P2 |
| 26 | dropship_platform_worker | P1_queue | downstream from #22 | P1 |
| 27 | digital_product_worker | P2_queue | product_type = digital | P2 |
| 28 | viral_content_analyzer_worker | P1_queue | new viral video in DB | P1 |
| 29 | trend_content_matcher_worker | P1_queue | product scored >= 80 | P1 |
| 30 | faceless_reel_worker | P1_queue | content brief created | P1 |
| 31 | avatar_reel_worker | P2_queue | content brief + avatar config | P2 |
| 32 | product_image_worker | P1_queue | content brief created | P1 |
| 33 | content_publisher_worker | P0_queue | content approved + scheduled | P0 |
| 34 | content_performance_tracker_worker | P2_queue | cron every 6h | P2 |

**Total workers: 21 (existing) + 13 (new) = 34 workers**

### Scoring Engine Update
Update the profit_score calculation to incorporate supplier data:

```
profit_score = weighted_average(
  margin_from_best_supplier × 0.50,
  number_of_suppliers × 0.15,
  shipping_speed_score × 0.15,
  supplier_reliability × 0.20
)
```

### Budget Enforcement
Add budget tracking for new APIs:
- HeyGen credits: daily limit
- Runway credits: daily limit
- Flux API: daily image count limit
- ElevenLabs: monthly character limit
- Social posting API: per-platform daily limit

All must pass through `checkBudget()` before execution.

### Development Guardrails
Add guardrails 23-25:
- **23**: Content must pass through human review queue by default. Auto-post only when explicitly enabled by user.
- **24**: Supplier data is always flagged as "estimated". Never present margins as guaranteed.
- **25**: Content generation costs must be tracked per-content-piece in `generated_content.generation_cost`.

---

## Development Sessions (Micro-Tasks)

### Purchasing Engine (4 sessions)

**P.1 — Schema + Cost Calculator**
- [ ] Create supplier_listings table + indexes + RLS
- [ ] Build cost_calculator utility (landed cost + margin analysis)
- [ ] Currency conversion integration (free API)

**P.2 — China Hub Workers**
- [ ] aliexpress_supplier_worker (Apify, pay-per-result)
- [ ] alibaba_wholesale_worker (Apify)
- [ ] Worker chaining: product scored → aliexpress → alibaba

**P.3 — Multi-Hub + Dropship Workers**
- [ ] amazon_wholesale_worker
- [ ] regional_supplier_worker (EU/UK/USA directories)
- [ ] dropship_platform_worker (Amazon FBA/FBM, CJ, Spocket)
- [ ] digital_product_worker

**P.4 — Purchasing UI + n8n Workflow**
- [ ] Product detail Row 8: Purchasing Intelligence card
- [ ] Dashboard margin badges + viability filter
- [ ] n8n "Supplier Discovery Pipeline" workflow

### Content Engine (5 sessions)

**C.1 — Schema + Content Analysis**
- [ ] Create content_templates + generated_content + content_performance tables
- [ ] viral_content_analyzer_worker (Anthropic analysis)
- [ ] trend_content_matcher_worker

**C.2 — Faceless Content Generation**
- [ ] faceless_reel_worker pipeline (script → voiceover → visuals → assembly)
- [ ] ElevenLabs integration
- [ ] Runway ML integration
- [ ] FFmpeg assembly logic

**C.3 — Avatar + Image Content**
- [ ] avatar_reel_worker (HeyGen integration)
- [ ] product_image_worker (Flux API + text overlay)
- [ ] Multi-platform format generation

**C.4 — Publishing + Performance**
- [ ] content_publisher_worker (social posting API integration)
- [ ] content_performance_tracker_worker
- [ ] Human review queue logic
- [ ] Auto-post scheduling with staggering

**C.5 — Content UI + n8n Workflows**
- [ ] Content Hub page: calendar, queue, library, performance
- [ ] Product detail Row 9: Content card
- [ ] n8n workflows: HOT product pipeline, feedback loop, daily schedule
- [ ] Content settings page

---

## Success Criteria

### Purchasing Engine
- [ ] Every product with final_score >= 60 has at least 1 supplier within 24h
- [ ] Margin calculations are within 15% of actual (validated manually on 10 products)
- [ ] 4 purchasing hubs represented in supplier_listings
- [ ] Margin recommendation badges visible on dashboard cards
- [ ] Cost calculator handles physical, digital, and dropship product types

### Content Engine
- [ ] System generates 2+ faceless reels per HOT product within 1 hour
- [ ] System generates product images for all 4 platform formats
- [ ] Content quality passes human review > 70% of the time
- [ ] Auto-posting works on at least TikTok + Instagram
- [ ] Performance tracking feeds back into template scoring
- [ ] Content generation cost tracked and within budget ($81/mo for 1 user)

---

*This prompt should be executed AFTER Phase 1 (TikTok MVP) is complete.*
*The Purchasing Engine maps to Phase 2 timeline. The Content Engine maps to Phase 3 timeline.*
*Update `/ai/task_board.md`, `/ai/project_state.md`, and `/system/worker_map.md` after implementation.*
