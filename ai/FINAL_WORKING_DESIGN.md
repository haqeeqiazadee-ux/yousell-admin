# YOUSELL PLATFORM — FINAL WORKING DESIGN
## Implementation-Ready Architecture Reference
### Version 1.0 — 2026-03-12

---

> **This document is the single source of truth for building YOUSELL.**
> It consolidates Parts 1-9 of the Agency Blueprint into an actionable build reference.
> For detailed rationale and research, see `ai/YOUSELL_AGENCY_BLUEPRINT.md`.

---

# TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Product Categories & Strategy](#2-product-categories--strategy)
3. [End-to-End Data Flow](#3-end-to-end-data-flow)
4. [Database Schema](#4-database-schema)
5. [Worker Registry](#5-worker-registry)
6. [Scoring & Ranking](#6-scoring--ranking)
7. [Channel Intelligence](#7-channel-intelligence)
8. [Learning System](#8-learning-system)
9. [API Routes](#9-api-routes)
10. [Dashboard Pages](#10-dashboard-pages)
11. [External Services](#11-external-services)
12. [Implementation Phases](#12-implementation-phases)
13. [Cost Summary](#13-cost-summary)

---

# 1. SYSTEM OVERVIEW

## 1.1 — What YOUSELL Does

```
DISCOVER trending products → SCORE opportunity quality →
SOURCE suppliers → CONFIRM pricing (human) →
ANALYZE profitability → GENERATE marketing plan →
APPROVE plan (human) → CREATE content →
SELECT channels → PUBLISH → TRACK → LEARN → REPEAT
```

## 1.2 — Architecture Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui | Netlify |
| Backend | Express, BullMQ, Redis | Railway |
| Automation | n8n (self-hosted) | Railway |
| Database | Supabase PostgreSQL + pgvector | Supabase Cloud |
| Auth | Supabase Auth | Supabase Cloud |
| Realtime | Supabase Realtime | Supabase Cloud |
| AI | Anthropic Claude API (Haiku + Sonnet) | Pay-as-you-go |
| Scraping | Apify Actors | Free tier |
| Email | Resend | Free tier |

## 1.3 — Three Engines

| Engine | Purpose | Human Checkpoint | Monthly Cost |
|--------|---------|-----------------|-------------|
| **Engine 1: Purchasing** | Supplier discovery + cost estimation | Sourcing Queue (confirm pricing) | $0 |
| **Engine 2: Profitability** | AI viability analysis (Haiku + Sonnet) | — (auto-gated by verdict) | ~$8 |
| **Engine 3: Content & Marketing** | Content creation + channel selection + publishing | Marketing Approval Queue | ~$73 |

## 1.4 — Two Human Checkpoints

```
Checkpoint 1: SOURCING QUEUE
  When: After auto-price discovery, before marketing spend
  Admin: Confirm price / Override / Add local supplier / Reject / Snooze

Checkpoint 2: MARKETING APPROVAL QUEUE
  When: After AI generates complete marketing plan, before content production
  Admin: Approve / Modify / Reject / Hold
```

Between these checkpoints, the AI does maximum automated work so admin decisions are fast and informed.

---

# 2. PRODUCT CATEGORIES & STRATEGY

## 2.1 — Four Product Categories

| # | Category | Margin | Delivery | LTV/Sale | Priority |
|---|----------|--------|----------|----------|----------|
| 1 | **Digital/AI/SaaS** | 20-50% recurring | Instant | $720+ | HIGHEST |
| 2 | **Branded Physical** | 40-60% | Varies | $50-200 | HIGH |
| 3 | **White Label Physical** | 30-50% | 2-14 days | $21 avg | MEDIUM |
| 4 | **Physical Affiliate** | 3-10% one-time | Handled by merchant | $2-15 | LOW |

## 2.2 — Go-To-Market Per Category

**Digital/AI/SaaS:**
Discovery → Digital Scoring → Affiliate Signup → Content → Publish → Track
(No sourcing queue — no physical product. Affiliate verification replaces it.)

**Branded Physical:**
Discovery → Gating Check → Auth Status → Sourcing → Shopify-First Strategy → Content → Publish
(Shopify landing page + influencer/ad traffic bypasses platform gating.)

**White Label Physical:**
Discovery → Supplier Lookup → Sourcing Queue → Confirmed Pricing → Marketing Plan → Content → Publish
(Standard three-phase pipeline. TikTok Shop / Amazon direct.)

**Physical Affiliate:**
Discovery → Affiliate Program Check → Content → Publish → Track
(Low effort, supplementary income. Volume play.)

## 2.3 — Brand Gating Decision Tree

```
Is it branded?
  NO → Category 3 (White Label) → standard pipeline
  YES ↓

Amazon UNGATED + TikTok UNGATED → sell on both directly
Amazon GATED + TikTok UNGATED → TikTok Shop + Shopify
Amazon UNGATED + TikTok AUTH REQUIRED → Amazon + Shopify
Amazon GATED + TikTok AUTH REQUIRED →
  Have brand auth? YES → proceed on both
                   NO → Shopify-only (or archive)
All BLOCKED → Archive or Shopify-only (legal risk check)
```

---

# 3. END-TO-END DATA FLOW

## 3.1 — Complete Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    EXISTING PIPELINE                        │
│  14 Scraping Workers → Product Discovery → Scoring Engine   │
│  (trend×0.40 + viral×0.35 + profit×0.25 = final_score)     │
└────────────────────────┬────────────────────────────────────┘
                         │ triggers when final_score >= 60
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ENGINE 1: PURCHASING (Phase 1)                  │
│                                                             │
│  W22: Supplier Lookup ─────────── W1B: Brand Gating Check  │
│    CJDropshipping API (parallel)    Amazon SP-API           │
│    AliExpress API                   brand_gating table      │
│    Apify (fallback)                                         │
│         │                                │                  │
│         ▼                                ▼                  │
│  W23: Cost Calculator (delivery-weighted)                   │
│    effective_cost = buy + ship + (days × $0.50 penalty)     │
│    Per-platform margins: TikTok, Amazon FBA/FBM, Shopify    │
│         │                                                   │
│         ▼                                                   │
│  W24: Preliminary AI Screen (Claude Haiku)                  │
│    → preliminary_verdict: STRONG/MODERATE/WEAK/NOT_VIABLE   │
│         │                                                   │
│         ▼                                                   │
│  W24B: → Sourcing Queue Placement + admin notification      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          HUMAN CHECKPOINT 1: SOURCING QUEUE (Phase 2)       │
│                                                             │
│  Admin sees: auto-found suppliers, margins, delivery times  │
│  Actions: CONFIRM | OVERRIDE PRICE | ADD LOCAL SUPPLIER |   │
│           REJECT | SNOOZE | BULK CONFIRM                    │
└────────────────────────┬────────────────────────────────────┘
                         │ on CONFIRM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ENGINE 2: PROFITABILITY (Phase 3)               │
│                                                             │
│  W24C: Recalculate with confirmed prices                    │
│         │                                                   │
│         ▼                                                   │
│  W24D: Final AI Analysis (Haiku → Sonnet for STRONG)        │
│    → final_verdict: STRONG/MODERATE/WEAK/NOT_VIABLE         │
│    → NOT_VIABLE = pipeline stops, no marketing              │
│         │                                                   │
│         ▼                                                   │
│  W36: URS Ranking Recalculation                             │
└────────────────────────┬────────────────────────────────────┘
                         │ if verdict != NOT_VIABLE
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ENGINE 3A: MARKETING PLAN                       │
│                                                             │
│  W25: Marketing Plan Generator (Claude Sonnet)              │
│    → Content strategy + budget allocation + platform plan   │
│    → Channel selection (paid + free recommendations)        │
│    → Messaging strategy + timeline + estimated ROI          │
│         │                                                   │
│         ▼                                                   │
│  W25B: → Marketing Approval Queue + admin notification      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        HUMAN CHECKPOINT 2: MARKETING APPROVAL               │
│                                                             │
│  Admin sees: complete plan with content pieces, budget,     │
│              channel recommendations, scripts, ROI estimate │
│  Actions: APPROVE | MODIFY | REJECT | HOLD | BULK APPROVE  │
└────────────────────────┬────────────────────────────────────┘
                         │ on APPROVE
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ENGINE 3B: CONTENT PRODUCTION                   │
│                                                             │
│  W25C: Plan Execution Trigger → creates content_queue items │
│         │                                                   │
│    ┌────┼────┬────┬────┬────┐                              │
│    ▼    ▼    ▼    ▼    ▼    │                              │
│  W26  W27  W27B W28  W29    │  (parallel production)       │
│  Face Avatar BRoll Img  VO  │                              │
│    │    │    │    │    │    │                              │
│    └────┴────┴────┴────┘    │                              │
│              ▼              │                              │
│         W30: Content Assembly                               │
│              │                                              │
│              ▼                                              │
│  W31: Publishing (Blotato → 9 platforms)                    │
│  W45: Posting Orchestrator (free channels)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PAID CAMPAIGN MANAGEMENT                        │
│                                                             │
│  W42: Campaign Creator (Meta, TikTok, Google, Pinterest)    │
│         │                                                   │
│         ▼                                                   │
│  W43: Campaign Optimizer (every 4 hours)                    │
│    → ROAS tracking, budget reallocation, auto-kill rules    │
│         │                                                   │
│         ▼                                                   │
│  W44: Conversion Tracker (server-side events)               │
│    → Meta CAPI, TikTok Events API, Google, Pinterest CAPI  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FEEDBACK & LEARNING                            │
│                                                             │
│  W32: Performance Tracker (every 6 hours)                   │
│  W33: Feedback Processor (weekly)                           │
│  W34: Budget Monitor (daily)                                │
│  W35: Price Optimization (on competitor changes)            │
│  W37: Outcome Collector (daily)                             │
│  W38: Pattern Recognizer (weekly)                           │
│  W40: Score Recalibrator (monthly)                          │
│  W41: Token Refresh for ad accounts (every 6 hours)         │
│         │                                                   │
│         ▼                                                   │
│  Results feed back to Engine 2 + Engine 3 for next cycle    │
└─────────────────────────────────────────────────────────────┘
```

---

# 4. DATABASE SCHEMA

## 4.1 — Existing Tables (DO NOT MODIFY structure)

- `products` — Core product data (EXTEND with new columns only)
- `product_allocations` — Client product assignments
- `viral_signals` — TikTok/social signal data
- `product_requests` — Client product requests
- `automation_jobs` — Scheduled automation

## 4.2 — Products Table Extensions

```sql
-- Product classification
ALTER TABLE products ADD COLUMN product_category TEXT DEFAULT 'white_label_physical';
  -- 'digital_ai_saas', 'branded_physical', 'white_label_physical', 'physical_affiliate'
ALTER TABLE products ADD COLUMN is_branded BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN brand_name TEXT;
ALTER TABLE products ADD COLUMN brand_gating_id UUID;  -- FK added after brand_gating created
ALTER TABLE products ADD COLUMN gating_decision JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN selling_strategy TEXT DEFAULT 'auto';
  -- 'auto', 'all_platforms', 'tiktok_only', 'amazon_only', 'shopify_only',
  -- 'affiliate_only', 'pending_auth', 'archived_gated'

-- Ranking
ALTER TABLE products ADD COLUMN urs DECIMAL(6,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN urs_components JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN urs_calculated_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN product_type TEXT DEFAULT 'physical_direct';
  -- 'physical_direct', 'physical_local', 'digital_product', 'ai_tool', 'affiliate'

-- Indexes
CREATE INDEX idx_products_urs ON products(urs DESC);
CREATE INDEX idx_products_urs_platform ON products(platform, urs DESC);
CREATE INDEX idx_products_category ON products(product_category);
CREATE INDEX idx_products_branded ON products(is_branded);
CREATE INDEX idx_products_strategy ON products(selling_strategy);
CREATE INDEX idx_products_type ON products(product_type);
```

## 4.3 — New Tables (26 total)

### Engine 1: Purchasing

```sql
-- All supplier options per product (multiple rows per product)
CREATE TABLE product_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  supplier_platform TEXT NOT NULL,  -- 'cjdropshipping', 'aliexpress', 'manual_input', 'local_supplier'
  supplier_product_id TEXT,
  supplier_url TEXT,
  supplier_name TEXT,
  supplier_source TEXT NOT NULL DEFAULT 'auto',  -- 'auto', 'manual_input', 'local_supplier'
  -- Pricing
  buy_price DECIMAL(10,2),
  shipping_cost_us DECIMAL(10,2),
  shipping_cost_uk DECIMAL(10,2),
  shipping_cost_eu DECIMAL(10,2),
  moq INTEGER DEFAULT 1,
  supplier_rating DECIMAL(3,2),
  variants JSONB,
  -- Delivery intelligence
  warehouse_location TEXT,
  estimated_delivery_days INTEGER,
  delivery_category TEXT,  -- 'local' (1-5d), 'fast' (6-10d), 'standard' (11-15d), 'slow' (16+d)
  delivery_penalty_per_day DECIMAL(5,2) DEFAULT 0.50,
  effective_cost DECIMAL(10,2),  -- buy + ship + (days × penalty)
  -- Confirmation status
  is_confirmed BOOLEAN DEFAULT false,
  is_auto_recommended BOOLEAN DEFAULT false,
  is_approximate BOOLEAN DEFAULT true,
  confidence_level TEXT DEFAULT 'low',
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  -- Per-platform margins
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
  -- Timestamps
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_costs_product ON product_costs(product_id);
CREATE INDEX idx_product_costs_confirmed ON product_costs(is_confirmed);
CREATE INDEX idx_product_costs_warehouse ON product_costs(warehouse_location);

-- Sourcing Queue: human review checkpoint
CREATE TABLE sourcing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  auto_recommended_cost_id UUID REFERENCES product_costs(id),
  supplier_options_count INTEGER DEFAULT 0,
  best_auto_margin DECIMAL(5,2),
  best_auto_delivery_days INTEGER,
  best_auto_platform TEXT,
  preliminary_verdict TEXT,
  preliminary_notes TEXT,
  queue_status TEXT DEFAULT 'pending_review',
    -- 'pending_review', 'confirmed', 'overridden', 'local_supplier_added', 'rejected', 'snoozed'
  snooze_until TIMESTAMPTZ,
  priority_rank INTEGER,
  confirmed_cost_id UUID REFERENCES product_costs(id),
  admin_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sourcing_queue_status ON sourcing_queue(queue_status);
CREATE INDEX idx_sourcing_queue_priority ON sourcing_queue(priority_rank DESC);

-- Local Suppliers: reusable supplier database
CREATE TABLE local_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  contact_info JSONB,
  location TEXT,
  categories TEXT[],
  avg_delivery_days INTEGER,
  reliability_rating DECIMAL(3,2),
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
```

### Engine 2: Profitability

```sql
CREATE TABLE profitability_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  product_cost_id UUID REFERENCES product_costs(id),
  is_confirmed BOOLEAN DEFAULT false,
  analysis_phase TEXT DEFAULT 'preliminary',  -- 'preliminary', 'confirmed'
  viability_verdict TEXT NOT NULL,  -- STRONG, MODERATE, WEAK, NOT_VIABLE
  best_margin DECIMAL(5,2),
  best_delivery_adjusted_margin DECIMAL(5,2),
  best_platform TEXT,
  recommended_price DECIMAL(10,2),
  competitor_median_price DECIMAL(10,2),
  price_strategy TEXT,
  selected_supplier_delivery_days INTEGER,
  delivery_category TEXT,
  marketing_budget DECIMAL(10,2) DEFAULT 0,
  content_priority TEXT,  -- HIGH, MEDIUM, LOW, SKIP
  influencer_max_cpa DECIMAL(10,2),
  ai_model_used TEXT,
  ai_reasoning TEXT,
  ai_content_strategy JSONB,
  social_platforms TEXT[],
  analysis_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profitability_product ON profitability_analysis(product_id);
CREATE INDEX idx_profitability_verdict ON profitability_analysis(viability_verdict);
CREATE INDEX idx_profitability_confirmed ON profitability_analysis(is_confirmed);
```

### Engine 3: Marketing & Content

```sql
-- Marketing Plans (AI-generated, human-approved)
CREATE TABLE marketing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  profitability_id UUID REFERENCES profitability_analysis(id),
  status TEXT DEFAULT 'pending_approval',
    -- 'pending_approval', 'approved', 'approved_modified', 'rejected', 'on_hold'
  plan JSONB NOT NULL,
    -- {
    --   content_strategy: { pieces: [...] },
    --   budget_allocation: {
    --     total_budget, content_production: {...},
    --     paid_channels: { tiktok_spark: {budget, expected_roas, score}, ... },
    --     free_channels: [ {channel, priority, score}, ... ]
    --   },
    --   platform_strategy: { primary_selling, content_platforms, posting_schedule, rationale },
    --   messaging_strategy: { key_angles, target_audience, urgency_hooks },
    --   channel_reasoning: { ... },
    --   conversion_tracking: { ... },
    --   timeline: { production_start, production_end, publishing_start, monitoring_end }
    -- }
  admin_modifications JSONB,
  admin_notes TEXT,
  ai_model_used TEXT,
  ai_reasoning TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  total_actual_spend DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_plans_product ON marketing_plans(product_id);
CREATE INDEX idx_marketing_plans_status ON marketing_plans(status);

-- Content Queue
CREATE TABLE content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  profitability_id UUID REFERENCES profitability_analysis(id),
  marketing_plan_id UUID REFERENCES marketing_plans(id),
  content_type TEXT NOT NULL,
    -- 'faceless_reel', 'avatar_reel', 'avatar_reel_premium', 'product_broll',
    -- 'product_image', 'voiceover'
  content_priority TEXT NOT NULL,  -- HIGH, MEDIUM, LOW
  script TEXT,
  image_prompt TEXT,
  voiceover_text TEXT,
  status TEXT DEFAULT 'pending',
    -- 'pending', 'producing', 'produced', 'review', 'approved', 'published', 'failed'
  produced_asset_url TEXT,
  produced_asset_type TEXT,
  template_used TEXT,
  generation_cost DECIMAL(10,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_queue_status ON content_queue(status);

-- Published Content
CREATE TABLE published_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_queue(id),
  product_id UUID NOT NULL REFERENCES products(id),
  platform TEXT NOT NULL,
  post_id TEXT,
  post_url TEXT,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  caption TEXT,
  hashtags TEXT[],
  status TEXT DEFAULT 'scheduled',  -- 'scheduled', 'published', 'failed', 'removed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_published_product ON published_content(product_id);
CREATE INDEX idx_published_platform ON published_content(platform);

-- Content Performance
CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_content_id UUID NOT NULL REFERENCES published_content(id),
  product_id UUID NOT NULL REFERENCES products(id),
  platform TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4),
  estimated_reach INTEGER DEFAULT 0,
  ctr DECIMAL(5,4),
  cost_per_view DECIMAL(10,6),
  cost_per_engagement DECIMAL(10,6),
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  is_viral BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_product ON content_performance(product_id);
CREATE INDEX idx_performance_viral ON content_performance(is_viral) WHERE is_viral = true;
```

### Brand Gating

```sql
CREATE TABLE brand_gating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  brand_normalized TEXT NOT NULL,
  amazon_status TEXT DEFAULT 'unknown',
  amazon_asin_checked TEXT,
  amazon_checked_at TIMESTAMPTZ,
  amazon_ungating_docs_required TEXT,
  tiktok_status TEXT DEFAULT 'unknown',
  tiktok_checked_at TIMESTAMPTZ,
  tiktok_auth_tier_needed TEXT,
  shopify_status TEXT DEFAULT 'ungated',
  shopify_legal_risk TEXT DEFAULT 'unknown',
  has_brand_authorization BOOLEAN DEFAULT false,
  authorization_doc_url TEXT,
  authorization_platforms TEXT[],
  authorization_expires_at TIMESTAMPTZ,
  authorization_uploaded_by TEXT,
  authorization_verified BOOLEAN DEFAULT false,
  category TEXT,
  ip_enforcement_aggressiveness TEXT,
  notes TEXT,
  last_updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_normalized)
);

CREATE INDEX idx_brand_gating_name ON brand_gating(brand_normalized);
```

### Affiliate Management

```sql
CREATE TABLE affiliate_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  commission_rate DECIMAL(5,2),
  commission_type TEXT,  -- 'one_time', 'recurring', 'tiered'
  cookie_duration_days INTEGER,
  payout_threshold DECIMAL(10,2),
  payout_frequency TEXT,
  affiliate_link_template TEXT,
  tracking_api_url TEXT,
  api_key_encrypted TEXT,
  status TEXT DEFAULT 'active',
  total_referrals INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  avg_ltv DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES affiliate_programs(id),
  product_id UUID NOT NULL REFERENCES products(id),
  affiliate_url TEXT NOT NULL,
  short_url TEXT,
  utm_params JSONB,
  platform_posted TEXT,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Channel Intelligence

```sql
-- Ad account OAuth tokens
CREATE TABLE ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform TEXT NOT NULL CHECK (platform IN (
    'meta', 'tiktok', 'google', 'pinterest', 'reddit', 'linkedin', 'snapchat'
  )),
  platform_account_id TEXT NOT NULL,
  account_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'token_expired', 'suspended', 'disconnected'
  )),
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'America/New_York',
  daily_budget_limit DECIMAL(10,2),
  monthly_budget_limit DECIMAL(10,2),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, platform_account_id)
);

ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own ad accounts" ON ad_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Campaign lifecycle
CREATE TABLE ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketing_plan_id UUID NOT NULL REFERENCES marketing_plans(id),
  product_id UUID NOT NULL REFERENCES products(id),
  ad_account_id UUID NOT NULL REFERENCES ad_accounts(id),
  platform TEXT NOT NULL,
  platform_campaign_id TEXT,
  platform_adset_id TEXT,
  platform_ad_id TEXT,
  campaign_type TEXT,
  objective TEXT,
  daily_budget DECIMAL(10,2),
  total_budget DECIMAL(10,2),
  spent_to_date DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'active', 'paused',
    'budget_exhausted', 'killed', 'completed'
  )),
  phase TEXT DEFAULT 'testing' CHECK (phase IN (
    'testing', 'scaling', 'optimization', 'completed'
  )),
  targeting JSONB DEFAULT '{}',
  creative_ids UUID[],
  last_metrics JSONB DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  killed_at TIMESTAMPTZ,
  kill_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON ad_campaigns(status) WHERE status = 'active';

-- Campaign optimization decisions log
CREATE TABLE campaign_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id),
  decision_type TEXT NOT NULL CHECK (decision_type IN (
    'budget_increase', 'budget_decrease', 'pause', 'resume',
    'kill', 'creative_swap', 'audience_change', 'channel_reallocation'
  )),
  reason TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  automated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-channel metrics
CREATE TABLE channel_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  channel TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('paid', 'free')),
  campaign_id UUID REFERENCES ad_campaigns(id),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
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
  product_category TEXT,
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_channel_perf_channel ON channel_performance(channel, channel_type);
CREATE INDEX idx_channel_perf_category ON channel_performance(product_category, channel);

-- AI channel recommendations per product
CREATE TABLE channel_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketing_plan_id UUID NOT NULL REFERENCES marketing_plans(id),
  product_id UUID NOT NULL REFERENCES products(id),
  channel TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('paid', 'free')),
  score DECIMAL(5,2) NOT NULL,
  rank INTEGER NOT NULL,
  recommended_budget DECIMAL(10,2),
  budget_split JSONB,
  reasoning JSONB NOT NULL,
  status TEXT DEFAULT 'recommended' CHECK (status IN (
    'recommended', 'approved', 'rejected', 'active', 'completed'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Learning System

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Prediction logging
CREATE TABLE prediction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type TEXT NOT NULL,
  context_id UUID NOT NULL,
  prediction_type TEXT NOT NULL,
  predicted_value TEXT NOT NULL,
  predicted_numeric DECIMAL(10,2),
  confidence DECIMAL(3,2),
  product_category TEXT,
  product_platform TEXT,
  model_version TEXT,
  input_snapshot JSONB,
  actual_value TEXT,
  actual_numeric DECIMAL(10,2),
  outcome_delta DECIMAL(10,2),
  outcome_recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prediction_log_context ON prediction_log(context_type, context_id);
CREATE INDEX idx_prediction_log_category ON prediction_log(product_category, product_platform);

-- Statistical pattern aggregates
CREATE TABLE memory_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension TEXT NOT NULL,
  dimension_value TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,4),
  metric_stddev DECIMAL(10,4),
  sample_size INTEGER NOT NULL DEFAULT 0,
  is_significant BOOLEAN DEFAULT false,
  confidence_interval_low DECIMAL(10,4),
  confidence_interval_high DECIMAL(10,4),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dimension, dimension_value, metric_name)
);

CREATE INDEX idx_memory_agg_significant ON memory_aggregates(is_significant) WHERE is_significant = true;

-- Semantic lessons with pgvector embeddings
CREATE TABLE memory_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  lesson_type TEXT NOT NULL,
  categories TEXT[],
  platforms TEXT[],
  product_types TEXT[],
  confidence DECIMAL(3,2),
  sample_size INTEGER DEFAULT 0,
  embedding VECTOR(384),
  times_retrieved INTEGER DEFAULT 0,
  times_validated INTEGER DEFAULT 0,
  times_contradicted INTEGER DEFAULT 0,
  last_validated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  superseded_by UUID REFERENCES memory_lessons(id),
  source_prediction_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memory_lessons_embedding ON memory_lessons
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_memory_lessons_categories ON memory_lessons USING GIN(categories);
CREATE INDEX idx_memory_lessons_platforms ON memory_lessons USING GIN(platforms);
CREATE INDEX idx_memory_lessons_active ON memory_lessons(is_active) WHERE is_active = true;

-- Score recalibration proposals
CREATE TABLE score_recalibrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_weights JSONB NOT NULL,
  proposed_weights JSONB NOT NULL,
  scope TEXT NOT NULL,
  sample_size INTEGER NOT NULL,
  regression_r_squared DECIMAL(5,4),
  improvement_pct DECIMAL(5,2),
  evidence_summary TEXT,
  evidence_data JSONB,
  status TEXT DEFAULT 'proposed',  -- 'proposed', 'approved', 'rejected', 'applied'
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Monitoring

```sql
CREATE TABLE scoring_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  platform TEXT NOT NULL,
  adjustment_type TEXT,
  adjustment_value DECIMAL(5,4),
  based_on_sample_size INTEGER,
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  service TEXT NOT NULL,
  credits_used DECIMAL(10,4),
  cost_usd DECIMAL(10,4),
  monthly_budget DECIMAL(10,2),
  budget_remaining DECIMAL(10,2),
  alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_date ON budget_tracking(date);

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

## 4.4 — Schema Summary

| Area | Tables | New Columns on products |
|------|--------|------------------------|
| Engine 1: Purchasing | product_costs, sourcing_queue, local_suppliers | — |
| Engine 2: Profitability | profitability_analysis | — |
| Engine 3: Content | marketing_plans, content_queue, published_content, content_performance | — |
| Brand Gating | brand_gating | +product_category, +is_branded, +brand_name, +brand_gating_id, +gating_decision, +selling_strategy |
| Affiliate | affiliate_programs, affiliate_links | — |
| Channel Intelligence | ad_accounts, ad_campaigns, campaign_decisions, channel_performance, channel_recommendations | — |
| Learning System | prediction_log, memory_aggregates, memory_lessons, score_recalibrations | — |
| Monitoring | scoring_adjustments, budget_tracking, template_performance | — |
| Ranking | — | +urs, +urs_components, +urs_calculated_at, +product_type |

**Total new tables: 26**
**Total new columns on products: 10**

---

# 5. WORKER REGISTRY

## 5.1 — Complete Worker Map (49 total)

### Existing Workers (21) — DO NOT MODIFY

Workers W1-W21 handle product discovery and scraping across TikTok, Amazon, Shopify, Pinterest, Digital, and Affiliate platforms. These are tested and working.

### New Workers (28)

| # | Worker | Queue | Trigger | Purpose |
|---|--------|-------|---------|---------|
| **Phase 1: Auto-Discovery** | | | | |
| W22 | supplier_lookup | intelligence_jobs | product scored >= 60 | CJ + AliExpress + Apify supplier search |
| W23 | cost_calculator | intelligence_jobs | W22 done | Preliminary cost + delivery-weighted scoring |
| W24 | profitability_screen | intelligence_jobs | W23 done | Preliminary AI screen (Haiku) |
| W24B | sourcing_queue | intelligence_jobs | W24 done | Place in admin review queue |
| W1B | brand_gating_check | intelligence_jobs | product scored >= 60 (parallel with W22) | Check Amazon SP-API + gating DB |
| **Phase 3: Confirmed Pricing** | | | | |
| W24C | confirmed_cost | intelligence_jobs | Admin confirms in queue | Recalculate with confirmed prices |
| W24D | final_profitability | intelligence_jobs | W24C done | Final AI verdict (Haiku → Sonnet for STRONG) |
| **Engine 3A: Marketing Plan** | | | | |
| W25 | marketing_plan | content_jobs | W24D (confirmed, not NOT_VIABLE) | Generate plan + channel recommendations (Sonnet) |
| W25B | marketing_queue | content_jobs | W25 done | Place in admin approval queue |
| W25C | plan_execution | content_jobs | Admin approves plan | Create content_queue items from approved plan |
| **Engine 3B: Content Production** | | | | |
| W26 | faceless_video | content_jobs | W25C (approved faceless items) | Blotato video creation |
| W27 | avatar_presenter | content_jobs | W25C (approved avatar items) | HeyGen Avatar III/IV reels |
| W27B | product_broll | content_jobs | W25C (approved B-roll) | NanoBanana + VEO3 short clips |
| W28 | product_image | content_jobs | W25C (approved images) | Nano Banana 2 (free) / Pro (hero) |
| W29 | voiceover | content_jobs | W25C (approved voiceover) | ElevenLabs (hero) + OpenAI TTS (day-to-day) |
| W30 | content_assembly | content_jobs | W26-W29 done | Combine video + audio + B-roll |
| W31 | publishing | publishing_jobs | W30 done or manual | Blotato → 9 platforms |
| **Channel Intelligence** | | | | |
| W41 | token_refresh | token_jobs | Every 6 hours | Refresh ad platform OAuth tokens |
| W42 | campaign_creator | campaign_jobs | Plan approved + has paid channels | Create campaigns on Meta/TikTok/Google/Pinterest |
| W43 | campaign_optimizer | optimization_jobs | Every 4 hours | ROAS tracking, budget reallocation, auto-kill |
| W44 | conversion_tracker | conversion_jobs | Purchase webhook | Server-side events to ad platforms |
| W45 | posting_orchestrator | posting_jobs | Plan approved + content ready | Free channel distribution |
| **Feedback & Monitoring** | | | | |
| W32 | performance_tracker | analytics_jobs | Every 6 hours | Collect engagement data |
| W33 | feedback_processor | analytics_jobs | Weekly (Sunday) | Analyze patterns (Haiku) |
| W34 | budget_monitor | system_jobs | Daily (6 AM) | Enforce spending limits |
| W35 | price_optimizer | intelligence_jobs | Competitor price change | Re-evaluate pricing |
| **Learning System** | | | | |
| W36 | ranking_recalculator | system_jobs | Data change + daily cron | URS recalculation |
| W37 | outcome_collector | learning_jobs | Daily | Match predictions to outcomes |
| W38 | pattern_recognizer | learning_jobs | Weekly (Sunday) | Extract statistical patterns |
| W40 | score_recalibrator | learning_jobs | Monthly + 100+ outcomes | Propose weight adjustments |

Note: W39 is not a separate worker — memory retrieval is integrated into W24/W24D/W25 Claude prompts.

## 5.2 — BullMQ Queue Configuration

| Queue | Workers | Priority |
|-------|---------|----------|
| intelligence_jobs | W22, W23, W24, W24B, W24C, W24D, W1B, W35 | High |
| content_jobs | W25, W25B, W25C, W26, W27, W27B, W28, W29, W30 | Medium |
| publishing_jobs | W31 | Medium |
| campaign_jobs | W42 | Medium |
| optimization_jobs | W43 | Medium |
| conversion_jobs | W44 | High |
| posting_jobs | W45 | Medium |
| analytics_jobs | W32, W33 | Low |
| system_jobs | W34, W36 | Low |
| token_jobs | W41 | High |
| learning_jobs | W37, W38, W40 | Low |

---

# 6. SCORING & RANKING

## 6.1 — Existing Scoring (DO NOT MODIFY)

```
final_score = trend_score × 0.40 + viral_score × 0.35 + profit_score × 0.25
```

Tier badges: HOT >= 80, WARM >= 60, WATCH >= 40, COLD < 40

Functions in `src/lib/scoring/composite.ts` — tested, do not touch.

## 6.2 — Unified Ranking Score (URS) — NEW, builds on top

### Default Weights (White Label Physical)

```
URS = (
  discovery_component    × 0.25 +
  purchasing_component   × 0.30 +
  marketing_component    × 0.20 +
  momentum_component     × 0.15 +
  performance_component  × 0.10
) × platform_multiplier × type_multiplier
```

### Category-Specific Weight Overrides

| Component | Digital/AI/SaaS | Branded Physical | White Label | Phys Affiliate |
|-----------|----------------|-----------------|-------------|---------------|
| discovery | 0.20 | 0.20 | 0.25 | 0.25 |
| purchasing/commission | 0.35 | 0.25 | 0.30 | 0.30 |
| gating | — | 0.20 | — | — |
| marketing | 0.20 | 0.20 | 0.20 | 0.25 |
| momentum | 0.15 | 0.15 | 0.15 | 0.20 |
| performance | 0.10 | — | 0.10 | — |

### Platform Multipliers

```
tiktok: 1.15, amazon: 1.10, digital: 1.05, shopify: 1.00,
ai_affiliate: 1.00, pinterest: 0.95, physical_affiliate: 0.90
```

### Type Multipliers

```
physical_local: 1.15, digital_product: 1.10, ai_tool: 1.05,
physical_direct: 1.00, affiliate: 0.85
```

## 6.3 — Auto-Rejection Rules

Product is rejected if ANY of these are true:
- Gross margin < 40%
- Shipping > 30% of retail
- Break-even > 2 months
- Fragile/hazardous without certification
- No US delivery under 15 days
- IP/trademark risk detected
- Retail price < $10
- 100+ direct competitors

## 6.4 — Delivery-Weighted Cost Formula

```
effective_cost = buy_price + shipping_cost + (delivery_days × penalty_per_day)

Default penalty: $0.50/day
Fast-fashion: $1.00/day (time-sensitivity premium)
Evergreen: $0.25/day (less urgency)

Delivery factor for margin adjustment:
  ≤ 5 days:  1.00
  6-10 days: 0.85
  11-15 days: 0.70
  > 15 days: 0.50
```

---

# 7. CHANNEL INTELLIGENCE

## 7.1 — Channel Score Formula

```
channel_score(channel, product) =
    category_fit        × 0.25    // From affinity matrix
  + margin_compatibility × 0.20    // Can margin support CPA?
  + audience_match       × 0.20    // Demographics alignment
  + historical_roas      × 0.20    // Past performance (from memory)
  + budget_efficiency    × 0.15    // Reach per dollar
```

## 7.2 — Channel-Product Affinity

### Paid

| Category | Primary | Secondary | Avoid |
|----------|---------|-----------|-------|
| Digital/AI/SaaS | Meta, Google | Reddit, LinkedIn | Snapchat |
| Branded Physical | Google Shopping, Meta | Pinterest, YouTube | Reddit, LinkedIn |
| White Label | TikTok Spark, Meta | Pinterest, Snapchat | LinkedIn |
| Phys Affiliate | TikTok Spark, Pinterest | Meta | LinkedIn, Google |

### Free

| Category | Primary | Secondary |
|----------|---------|-----------|
| Digital/AI/SaaS | Email, Blog/SEO, Product Hunt | Reddit, Quora, LinkedIn Organic |
| Branded Physical | Pinterest Organic, YouTube Shorts | Instagram Reels, Email |
| White Label | TikTok Organic, Pinterest Organic | YouTube Shorts, Instagram Reels |
| Phys Affiliate | TikTok Organic, Pinterest Organic | Email, Telegram |

## 7.3 — Selection Constraints

- Max 3 paid channels simultaneously
- Max 5 free channels simultaneously
- At least 1 free channel always included
- Total paid budget <= product marketing budget
- Margin must support channel CPA (auto-exclude if not)

## 7.4 — Campaign Auto-Kill Rules

- ROAS < 1.0 after $50 spent → pause, reallocate
- CPA > 2× target after 100 impressions → reduce 50%
- CTR < 0.5% after 1000 impressions → pause creative

## 7.5 — Budget Allocation

```
New product (no history): 70% best channel / 20% second / 10% experimental
Existing product (has history): proportional to ROAS + 10% exploration

Per-channel split:
  Testing (days 1-3): 30%
  Scaling (days 4-14): 50%
  Optimization (day 15+): 20%
```

## 7.6 — Ad Account OAuth

| Platform | Token Lifetime | Refresh |
|----------|---------------|---------|
| Meta | 60 days | System user token (no expiry) |
| TikTok | 24 hours | Refresh token (365 days) |
| Google | 1 hour | Refresh token (no expiry) |
| Pinterest | 30 days | Refresh token (365 days) |

## 7.7 — Server-Side Conversion Tracking

All four major platforms require server-side events for accurate attribution:
- **Meta**: Conversions API (CAPI)
- **TikTok**: Events API
- **Google**: Offline Conversion Upload
- **Pinterest**: Conversions API (CAPI)

---

# 8. LEARNING SYSTEM

## 8.1 — Five Layers

```
Layer 1: OUTCOME CAPTURE (W37 daily)
  → Log every prediction, record outcomes when available

Layer 2: PATTERN RECOGNITION (W38 weekly)
  → Compare predictions vs outcomes, extract patterns
  → Require sample_size >= 30 for significance

Layer 3: MEMORY RETRIEVAL (integrated into W24/W25)
  → pgvector semantic search for relevant lessons
  → Inject into Claude prompts as historical context

Layer 4: SCORE RECALIBRATION (W40 monthly)
  → Linear regression on outcomes to find optimal weights
  → Admin approval required before any weight changes

Layer 5: CONFIDENCE CALIBRATION
  → Track accuracy per category/platform bucket
  → Express calibrated confidence in predictions
```

## 8.2 — Memory-Enhanced Claude Prompts

When Claude analyzes a product, inject relevant memories:

```
SYSTEM MEMORY (based on platform experience):
- Beauty products on TikTok average 4.2% engagement (n=142, high confidence)
- Our trend scores for beauty are 12% optimistic — adjust expectations
- Faceless comparison reels outperform single-product reviews by 2.1x
- Seasonal factor: beauty peaks in Q4 (current month: March, neutral)
```

## 8.3 — Maturity Timeline

| Month | State | Memory Size |
|-------|-------|-------------|
| 1 | Cold start — default weights, no lessons | 0 lessons |
| 2-3 | Early learning — first patterns emerge | ~10 lessons |
| 6 | Intermediate — calibrated predictions | ~50 lessons |
| 12+ | Mature — per-category optimized weights | ~200+ lessons |

---

# 9. API ROUTES

## 9.1 — New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/sourcing-queue` | GET | List sourcing queue items |
| `/api/admin/sourcing-queue/[id]/confirm` | POST | Confirm supplier pricing |
| `/api/admin/sourcing-queue/[id]/override` | POST | Override with manual price |
| `/api/admin/sourcing-queue/[id]/reject` | POST | Reject product |
| `/api/admin/sourcing-queue/[id]/snooze` | POST | Snooze for later |
| `/api/admin/sourcing-queue/bulk-confirm` | POST | Bulk confirm selected |
| `/api/admin/marketing-plans` | GET | List marketing plans |
| `/api/admin/marketing-plans/[id]/approve` | POST | Approve plan |
| `/api/admin/marketing-plans/[id]/modify` | POST | Modify and approve |
| `/api/admin/marketing-plans/[id]/reject` | POST | Reject plan |
| `/api/admin/content` | GET | Content queue items |
| `/api/admin/content/[id]/approve` | POST | Approve content for publishing |
| `/api/admin/analytics/channels` | GET | Channel performance data |
| `/api/admin/analytics/content` | GET | Content performance data |
| `/api/admin/ad-accounts` | GET/POST | List/connect ad accounts |
| `/api/admin/ad-accounts/[id]` | DELETE | Disconnect ad account |
| `/api/auth/callback/[platform]` | GET | OAuth callback for ad platforms |
| `/api/admin/brand-gating` | GET | List brand gating data |
| `/api/admin/brand-gating/[id]/upload-auth` | POST | Upload brand authorization |
| `/api/admin/local-suppliers` | GET/POST | Manage local suppliers |
| `/api/admin/budget` | GET | Budget tracking data |
| `/api/admin/recalibrations` | GET | Score recalibration proposals |
| `/api/admin/recalibrations/[id]/approve` | POST | Approve weight change |
| `/api/admin/rankings` | GET | URS-sorted product rankings |
| `/api/webhooks/conversion` | POST | Conversion webhook from storefronts |

## 9.2 — Extended Existing Routes

| Route | Extension |
|-------|-----------|
| `/api/admin/products` | Add `sort=urs` param, add `category` filter |
| `/api/admin/products/[id]` | Include cost, profitability, marketing, content data |
| `/api/dashboard/products` | Add URS ranking, pipeline stage |

---

# 10. DASHBOARD PAGES

## 10.1 — New Pages

| Page | Route | Key Components |
|------|-------|---------------|
| **Sourcing Queue** | `/admin/sourcing` | Product list + supplier options + confirm/override/reject actions |
| **Marketing Plans** | `/admin/marketing` | Plan detail view + approve/modify/reject + channel recommendations |
| **Content Studio** | `/admin/content` | Content queue + preview + approve/reject + regenerate |
| **Publishing Calendar** | `/admin/content/calendar` | Week view, per-platform schedule |
| **Channel Analytics** | `/admin/analytics/channels` | ROAS per channel, spend tracking, campaign status |
| **Content Analytics** | `/admin/analytics/content` | Engagement metrics, viral flags, ROI per content piece |
| **Ad Accounts** | `/admin/settings/ad-accounts` | Connect/disconnect OAuth accounts, status display |
| **Budget Control** | `/admin/settings/budget` | Per-service spend tracking, daily limits, alerts |
| **Brand Gating** | `/admin/brands` | Brand gating status, upload authorization docs |
| **Local Suppliers** | `/admin/suppliers` | Supplier database management |
| **Learning Dashboard** | `/admin/intelligence` | Memory lessons, recalibration proposals, confidence display |

## 10.2 — Opportunity Leaderboard Widget (Dashboard Home)

```
┌──────────────────────────────────────────────────────────────┐
│ TOP OPPORTUNITIES                              Last: 2m ago  │
├──┬────────────────────┬──────┬──────┬────────┬──────────────┤
│# │ Product            │ URS  │ Tier │ Stage  │ Next Action  │
├──┼────────────────────┼──────┼──────┼────────┼──────────────┤
│1 │ LED Sunset Lamp    │ 92.4 │ HOT  │ Rising │ Approve Plan │
│2 │ AI Writing Tool    │ 89.1 │ HOT  │ Explod │ Confirm Price│
│3 │ Yoga Mat Premium   │ 84.7 │ HOT  │ Rising │ Review Mktg  │
│... │ ...              │ ...  │ ...  │ ...    │ ...          │
└──┴────────────────────┴──────┴──────┴────────┴──────────────┘
│ Filters: [All] [TikTok] [Amazon] [Digital] [Physical] [AI] │
│ Sort: [URS ▼] [Margin] [Freshness] [Delivery] [Score]      │
└──────────────────────────────────────────────────────────────┘
```

## 10.3 — Product Detail Page Extensions

| Row | Section | Data |
|-----|---------|------|
| Row 8 | Supplier & Cost | Supplier source, buy price, shipping, landed cost, per-platform margins |
| Row 9 | Profitability | Viability badge, recommended price, best platform, marketing budget, AI reasoning |
| Row 10 | Content & Perf | Generated content gallery, publishing status, engagement mini-charts |

---

# 11. EXTERNAL SERVICES

## 11.1 — Service Integration Map

| Service | Purpose | API Type | n8n Node | Auth |
|---------|---------|----------|----------|------|
| **CJDropshipping** | Supplier lookup | REST | HTTP Request | CJ-Access-Token |
| **AliExpress** | Supplier lookup | REST | HTTP Request | API key |
| **Apify** | Scraping fallback | REST | Native node | API token |
| **Claude API** | AI analysis | REST | HTTP Request | API key |
| **Blotato** | Faceless video + publishing | REST | Community node | API key |
| **HeyGen** | Avatar presenter | REST | Community node | API key |
| **VEO3 (Google AI)** | Product B-roll | REST | HTTP Request | API key |
| **Nano Banana (Google AI)** | Product images | REST | HTTP Request | API key |
| **ElevenLabs** | Voiceover (hero) | REST | Native node | API key |
| **OpenAI TTS** | Voiceover (daily) | REST | Native node | API key |
| **Resend** | Email alerts | REST | Native node | API key |
| **Meta Marketing** | Ad campaigns | REST/GraphQL | Native node | OAuth 2.0 |
| **TikTok Marketing** | Ad campaigns + Spark | REST | HTTP Request | OAuth 2.0 |
| **Google Ads** | Shopping + PMax | REST | Native node | OAuth 2.0 |
| **Pinterest Ads** | Promoted pins | REST | HTTP Request | OAuth 2.0 |
| **Reddit Ads** | Community ads | REST | HTTP Request | OAuth 2.0 |
| **Amazon SP-API** | Brand gating check | REST | HTTP Request | OAuth 2.0 |

## 11.2 — n8n Node Summary

| Type | Nodes |
|------|-------|
| **Native (built-in)** | Supabase, OpenAI, ElevenLabs, Google Drive, Resend, Meta, Google Ads |
| **Community** | Blotato, BullMQ, upload-post (10 platforms) |
| **HTTP Request** | CJDropshipping, AliExpress, HeyGen, VEO3, NanoBanana, TikTok, Pinterest, Reddit, LinkedIn, Snapchat, Amazon SP-API |

## 11.3 — BullMQ Bridge (Express ↔ n8n)

```
Express Backend → BullMQ Add Job → n8n BullMQ Trigger
n8n workflow → BullMQ Add Job node → Express Worker pickup
```

Community node: `n8n-nodes-bullmq`

---

# 12. IMPLEMENTATION PHASES

## Phase A: Database Schema + Types (No functional changes)

**Tasks:**
1. Run all CREATE TABLE migrations
2. Run all ALTER TABLE on products
3. Extend Product TypeScript interface (add new fields, don't remove any)
4. Add new provider configs for CJDropshipping + AliExpress
5. Create URS TypeScript types and calculation module

**Test:** App builds, existing features work, new columns have safe defaults.

## Phase B: Engine 1 — Supplier Lookup

**Tasks:**
1. CJDropshipping API client
2. AliExpress API client
3. W22 supplier_lookup_worker
4. W23 cost_calculator_worker
5. W1B brand_gating_check_worker

**Test:** Product scored >= 60 → supplier data in product_costs table.

## Phase C: Sourcing Queue UI

**Tasks:**
1. `/admin/sourcing` page
2. Confirm/Override/Reject/Snooze API routes
3. Local supplier management
4. Admin notification on new queue items

**Test:** Admin can review and confirm pricing in dashboard.

## Phase D: Engine 2 — Profitability Analysis

**Tasks:**
1. W24 preliminary_screen_worker (Haiku)
2. W24B sourcing_queue_placement
3. W24C confirmed_cost_worker
4. W24D final_profitability_worker (Haiku + Sonnet escalation)

**Test:** Confirmed pricing → viability verdict → gates Engine 3.

## Phase E: URS Ranking System

**Tasks:**
1. W36 ranking_recalculation_worker
2. URS calculation with category-specific weights
3. Platform/type multipliers
4. Opportunity Leaderboard widget
5. URS sort option on product list

**Test:** Products ranked by URS, re-rank on data changes.

## Phase F: Engine 3A — Marketing Plans

**Tasks:**
1. W25 marketing_plan_worker (Sonnet) + channel selection
2. W25B marketing_queue_worker
3. `/admin/marketing` approval page
4. W25C plan_execution_trigger

**Test:** Confirmed product → marketing plan generated → admin approves.

## Phase G: n8n Setup + Content Production

**Tasks:**
1. n8n on Railway with community nodes
2. BullMQ bridge configuration
3. W26 faceless_video (Blotato)
4. W27 avatar_presenter (HeyGen)
5. W27B product_broll (NanoBanana + VEO3)
6. W28 product_image (Nano Banana)
7. W29 voiceover (ElevenLabs + OpenAI TTS)
8. W30 content_assembly

**Test:** Approved plan → content produced → assets stored.

## Phase H: Publishing + Social Posting

**Tasks:**
1. W31 publishing_worker (Blotato)
2. W45 posting_orchestrator (free channels)
3. `/admin/content` studio + calendar
4. Content review queue

**Test:** Content → published across platforms → post IDs stored.

## Phase I: Channel Intelligence + Campaigns

**Tasks:**
1. Ad account OAuth linking (Meta, TikTok, Google, Pinterest)
2. W41 token_refresh_worker
3. W42 campaign_creator_worker
4. W43 campaign_optimizer_worker
5. W44 conversion_tracker_worker
6. `/admin/settings/ad-accounts` page
7. `/admin/analytics/channels` page

**Test:** Ad account connected → campaign created → metrics tracked.

## Phase J: Performance Tracking + Learning

**Tasks:**
1. W32 performance_tracker
2. W33 feedback_processor
3. W34 budget_monitor
4. W37 outcome_collector
5. W38 pattern_recognizer
6. W40 score_recalibrator
7. `/admin/intelligence` dashboard
8. `/admin/settings/budget` page

**Test:** Published content → metrics tracked → patterns learned → recalibration proposed.

## Phase K: Polish + Testing

**Tasks:**
1. End-to-end integration testing
2. Budget alert testing
3. Content quality review
4. Error handling + dead letter queues
5. Production deployment

**Deployment Dependencies:**
```
A ──→ B ──→ C
       │         ↘
       └──→ D ──→ E ──→ F ──→ G ──→ H ──→ I ──→ J ──→ K
```

Each phase is independently deployable without breaking previous phases.

---

# 13. COST SUMMARY

## 13.1 — Monthly Costs

| Service | Plan | Monthly |
|---------|------|---------|
| **Existing Baseline** | | |
| Supabase | Pro | $25 |
| Railway | Starter + usage | ~$25 |
| Netlify | Starter | $0 |
| Apify | Free tier | $0 |
| Claude API | Pay-as-you-go | ~$30 |
| Resend | Free tier | $0 |
| **Baseline** | | **~$80** |
| **Engine 1** | | |
| CJDropshipping API | Free | $0 |
| AliExpress API | Free | $0 |
| **Engine 1** | | **$0** |
| **Engine 2** | | |
| Claude API (incremental) | Pay-as-you-go | ~$8 |
| **Engine 2** | | **~$8** |
| **Engine 3** | | |
| Blotato | Starter | $29 |
| HeyGen | Creator | $29 |
| VEO3 (Google AI) | Pay-as-you-go | ~$8 |
| Nano Banana | Mostly free tier | ~$2 |
| ElevenLabs | Starter | $5 |
| OpenAI TTS | Pay-as-you-go | ~$0.20 |
| **Engine 3** | | **~$73** |
| **Ad Platform APIs** | All free | **$0** |
| | | |
| **GRAND TOTAL** | | **~$161/month** |
| **Budget ceiling** | | **$300/month** |
| **Buffer remaining** | | **$139/month** |

## 13.2 — Per-Product Variable Cost

| Verdict | Content Suite | Cost |
|---------|--------------|------|
| STRONG | 3 faceless + 2 avatar III + 1 avatar IV + B-roll + images + voiceover | ~$4-6 |
| MODERATE | 1 faceless + 1 avatar III + images | ~$1-2 |
| WEAK | Images only | ~$0.01 |

## 13.3 — Budget Safety Limits

| Service | Monthly | Daily Limit | Auto-Pause At |
|---------|---------|-------------|---------------|
| HeyGen | $29 (fixed) | Credit-based | 90% credits |
| VEO3 | $10 | $0.35/day | $8 total |
| Nano Banana Pro | $3 | $0.10/day | $2.50 total |
| Claude API | $12 | $0.40/day | $10 total |
| Blotato | $29 (fixed) | Credit-based | 90% credits |
| ElevenLabs | $5 (fixed) | Credit-based | 85% credits |

---

# 14. MANUAL INPUT & IMPORT

## 14.1 — Single Product Entry

Route: `/admin/products/new`

Required: title, category, platform. Optional: pricing (triggers Sourcing Queue), brand name (triggers gating check), external URL, image, tags, signals (sales, rating, trend stage).

If buy_price provided → creates `product_costs` record (source = 'manual_input', is_confirmed = true).

## 14.2 — Bulk CSV/XLSX Import

Route: `/admin/products/import`

5-step flow: Upload → Column Mapping → Validation Preview → Config (region, auto-score, auto-match) → Execute.

Duplicate detection on (title + platform) or external_url. Summary report on completion.

## 14.3 — Supplier Catalog Import

Route: `/admin/suppliers/[id]/import-catalog`

Upload supplier's product catalog. Products created with pre-matched supplier and confirmed pricing.

## 14.4 — Auto Supplier-Product Matching (W46)

```
Trigger: New product imported, new supplier catalog, or weekly for unmatched products
Logic:
  1. Fuzzy title match against local supplier catalogs
  2. Search CJDropshipping + AliExpress APIs by title
  3. Compare all options, rank by effective_cost
  4. If local beats API by >10% → auto-recommend local
  5. Create product_costs records, update Sourcing Queue
```

---

# 15. BREAK-EVEN ANALYSIS

## 15.1 — Formula

```
profit_per_unit = selling_price - (cogs + platform_fee + payment + fulfillment + returns + vat)
break_even_units = CEIL(total_fixed_costs / profit_per_unit)
break_even_days = break_even_units / estimated_daily_sales

With ongoing paid marketing:
  adjusted_profit = profit_per_unit - channel_cpa
  adjusted_break_even = CEIL(total_fixed_costs / adjusted_profit)
```

## 15.2 — Scenarios Matrix

For each product, calculate ALL combinations of:
- Region: USA / UK
- Platform: TikTok Shop / Amazon FBA / Amazon FBM / Shopify
- Supplier: each available supplier option
- Channel: Organic / TikTok Spark / Meta Ads / Google Ads / Influencer / Combined

Mark best scenario as recommended. Surface in Sourcing Queue + Marketing Approval + Product Detail.

## 15.3 — Worker (W47)

Triggers on: confirmed pricing (W24C), profitability verdict (W24D), marketing plan (W25), price changes.

## 15.4 — Platform Fee Reference

| Platform | USA Fee | UK Fee |
|----------|---------|--------|
| TikTok Shop | 2-8% + 2.9% payment | 2-8% + 2.5% payment |
| Amazon FBA | 8-15% referral + $3-6 FBA | 7-15% referral + £2-5 FBA |
| Amazon FBM | 8-15% referral + shipping | 7-15% referral + shipping |
| Shopify | 0% + 2.9% + $0.30 | 0% + 2.2% + £0.20 |
| UK VAT | — | 20% on all sales |

---

# 16. MULTI-REGION (USA + UK)

## 16.1 — Architecture: Region Column (NOT separate databases)

Single Supabase instance. `region` column (`'usa'` | `'uk'`) added to **16 tables**. All queries filter by region. Shared learning system.

## 16.2 — Dashboard Region Switcher

Three modes: USA / UK / ALL. React context `RegionContext` flows through all components. Every API route accepts `?region=usa|uk|all`.

## 16.3 — Region-Specific Configuration

```typescript
REGION_CONFIG = {
  usa: { currency: 'USD', vatRate: 0, ... },
  uk:  { currency: 'GBP', vatRate: 0.20, ... }
}
```

Covers: currency, VAT, platform fees, payment processing, supplier availability, ad platforms.

## 16.4 — Cross-Region Evaluation (W48)

Product confirmed STRONG in one region → auto-evaluate for the other:
- Check supplier availability for other region
- Calculate margins with region-specific fees/taxes
- If viable → create linked product (via `cross_region_product_id`)
- Add to other region's Sourcing Queue

## 16.5 — Region Impact Summary

| Stage | Impact |
|-------|--------|
| Discovery | Separate scans (Amazon.com vs Amazon.co.uk, etc.) |
| Suppliers | Different warehouse locations, shipping costs |
| Costs | Different platform fees, VAT (UK 20%), fulfillment |
| Break-Even | Region-specific scenarios |
| Marketing | Separate ad accounts, targeting, budgets |
| Content | Same images, currency/shipping text differs |
| Learning | Region dimension in memory_aggregates |

---

# 17. SCRAPING STRATEGY

## 17.1 — Recommendation: API-FIRST

**Do NOT build custom scrapers.** Use official APIs + Apify actors.

| Approach | Monthly Cost | Maintenance | Risk |
|----------|-------------|-------------|------|
| **API-first (recommended)** | **~$75-100** | **~0 hours** | **Low** |
| Hybrid (API + custom) | ~$100-150 | ~5 hours | Medium |
| Full custom | ~$200-400 | ~15 hours | High |

## 17.2 — Why Not Custom

- Residential proxies: $75-200/mo
- CAPTCHA solving: $20-50/mo
- Server infrastructure: $30-50/mo
- Maintenance: 8-20 hours/month (sites change HTML frequently)
- Legal risk: ToS violations, CFAA

## 17.3 — Scaling Plan

| Revenue | Volume | Apify Plan | Cost |
|---------|--------|-----------|------|
| Pre-revenue | 100-500/day | Free ($5) | $0 |
| $500/mo | 500-1K/day | Starter ($49) | $49 |
| $2K/mo | 1K-3K/day | Scale ($249) | $249 |
| $5K+ | 3K+/day | Consider custom for high-volume sources | Varies |

---

# UPDATED TOTALS

| Metric | Previous | Now |
|--------|----------|-----|
| Workers | 49 | **52** (+W46, W47, W48) |
| New tables | 26 | **27** (+break_even_scenarios) |
| New columns on products | 10 | **12** (+region, +cross_region_product_id) |
| Region columns added | 0 | **16 tables** |
| Implementation phases | A-K (11) | **A-L (12)** (+Phase L: Multi-Region) |

---

# APPENDIX: QA INTEGRATION PROMPTS

Two pre-built prompts for QA sessions are available in the main blueprint:

- **Section 5A**: Integration Blueprint Prompt — produces file-by-file implementation plan
- **Section 5B**: QA Audit Prompt — finds conflicts and regression risks

Run 5A before coding starts. Run 5B after each implementation phase.

---

**END OF FINAL WORKING DESIGN**

*This document + `YOUSELL_AGENCY_BLUEPRINT.md` together form the complete architecture reference.*
*Blueprint = detailed rationale + research. This doc = actionable build spec.*
