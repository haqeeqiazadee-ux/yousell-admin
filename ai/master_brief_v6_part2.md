# YOUSELL MASTER BUILD BRIEF v6.0 — Part 2 (Sections 11–20)

> **Version**: 6.0
> **Date**: 2026-03-11
> **Convention**: `✓ FIXED: [finding ID]` = issue from Phase 2/3 resolved. `★ NEW` = feature added in v6.0.

---

## Section 11 — Complete Database Schema

All tables include `tenant_id uuid NOT NULL` (except `tenants` itself). Supabase RLS enforces tenant isolation on every table.

`✓ FIXED: D-5 — raw_listings now included. S-4, S-6, S-9, S-15, S-16 tables added. MN-2, MN-4 tables added.`

### 11.1 — Tenant & User Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- TENANTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    plan text NOT NULL DEFAULT 'starter'
        CHECK (plan IN ('starter', 'pro', 'agency', 'enterprise', 'trial', 'locked', 'archived')),
    plan_status text NOT NULL DEFAULT 'active'
        CHECK (plan_status IN ('active', 'trial', 'past_due', 'grace_expired', 'restricted', 'locked', 'archived')),
    billing_cycle text DEFAULT 'monthly'
        CHECK (billing_cycle IN ('monthly', 'annual')),
    trial_ends_at timestamptz,
    plan_active_until timestamptz,
    stripe_customer_id text,
    stripe_subscription_id text,
    custom_domain text,
    brand_config jsonb DEFAULT '{}'::jsonb,
    -- { logo_url, primary_color, secondary_color, company_name, favicon_url }
    api_keys jsonb DEFAULT '{}'::jsonb,
    -- Enterprise only: per-tenant external API key overrides
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- USERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id uuid PRIMARY KEY,  -- = Supabase Auth user id
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'viewer'
        CHECK (role IN ('super_admin', 'agency_owner', 'analyst', 'viewer')),
    email text NOT NULL,
    display_name text,
    avatar_url text,
    last_active_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- ═══════════════════════════════════════════════════════════════
-- INVITATIONS (★ NEW: S-9)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invited_by uuid NOT NULL REFERENCES users(id),
    email text NOT NULL,
    role text NOT NULL DEFAULT 'analyst'
        CHECK (role IN ('agency_owner', 'analyst', 'viewer')),
    token text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    accepted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invitations_tenant ON invitations(tenant_id);
CREATE INDEX idx_invitations_token ON invitations(token);
```

### 11.2 — Core Intelligence Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title text NOT NULL,
    image_url text,
    category text,
    product_type text CHECK (product_type IN ('physical', 'digital', 'saas', 'ai')),
    platform text NOT NULL,  -- source platform: 'tiktok', 'amazon', 'shopify'
    external_id text,
    price decimal(12,2),
    cost decimal(12,2),
    currency text DEFAULT 'USD',
    description text,
    niche_tags text[],  -- for creator match + niche aggregation
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_tenant_platform ON products(tenant_id, platform);
CREATE INDEX idx_products_tenant_created ON products(tenant_id, created_at DESC);
-- Full-text search (✓ FIXED: T-21)
ALTER TABLE products ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(category, ''))
    ) STORED;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- ═══════════════════════════════════════════════════════════════
-- CREATORS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE creators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username text NOT NULL,
    platform text NOT NULL,  -- 'tiktok', 'youtube', 'instagram'
    external_id text,
    avatar_url text,
    follower_count integer DEFAULT 0,
    engagement_rate decimal(5,2),
    niche text,
    niche_tags text[],
    bio text,
    email text,  -- publicly listed, for outreach
    conversion_score decimal(5,2),
    outreach_status text DEFAULT 'none'
        CHECK (outreach_status IN ('none', 'identified', 'email_sent', 'replied', 'deal_closed', 'opted_out')),
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_creators_tenant ON creators(tenant_id);
ALTER TABLE creators ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(username, '') || ' ' || coalesce(niche, ''))
    ) STORED;
CREATE INDEX idx_creators_search ON creators USING GIN(search_vector);

-- ═══════════════════════════════════════════════════════════════
-- VIDEOS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    creator_id uuid REFERENCES creators(id) ON DELETE SET NULL,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL,
    platform text NOT NULL,
    external_id text,
    thumbnail_url text,
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    share_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    engagement_velocity decimal(10,2),  -- views per hour
    is_ad boolean DEFAULT false,
    product_links jsonb DEFAULT '[]'::jsonb,
    posted_at timestamptz,
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_videos_tenant ON videos(tenant_id);
CREATE INDEX idx_videos_product ON videos(tenant_id, product_id);
CREATE INDEX idx_videos_creator ON videos(tenant_id, creator_id);

-- ═══════════════════════════════════════════════════════════════
-- SHOPS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE shops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform text NOT NULL,  -- 'tiktok', 'shopify', 'amazon'
    external_id text,
    name text NOT NULL,
    url text,
    logo_url text,
    follower_count integer DEFAULT 0,
    estimated_revenue decimal(12,2),
    estimated_gmv decimal(12,2),
    growth_rate decimal(5,2),
    product_count integer DEFAULT 0,
    creator_count integer DEFAULT 0,
    ad_spend_signal decimal(12,2),
    tech_stack jsonb DEFAULT '[]'::jsonb,  -- Shopify apps detected
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_shops_tenant ON shops(tenant_id);
CREATE INDEX idx_shops_tenant_platform ON shops(tenant_id, platform);
ALTER TABLE shops ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(url, ''))
    ) STORED;
CREATE INDEX idx_shops_search ON shops USING GIN(search_vector);

-- ═══════════════════════════════════════════════════════════════
-- ADS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE ads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform text NOT NULL,  -- 'tiktok', 'facebook', 'instagram'
    external_id text,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL,
    advertiser_name text,
    creative_url text,
    thumbnail_url text,
    duplication_count integer DEFAULT 1,
    estimated_spend decimal(12,2),
    is_scaling boolean DEFAULT false,
    ad_run_duration_days integer,
    like_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    last_scraped_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, platform, external_id)
);
CREATE INDEX idx_ads_tenant ON ads(tenant_id);
CREATE INDEX idx_ads_product ON ads(tenant_id, product_id);
```

### 11.3 — Scoring & Intelligence Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- TREND_SCORES (time-series)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE trend_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform text NOT NULL,
    score decimal(5,2) NOT NULL,
    lifecycle_stage text
        CHECK (lifecycle_stage IN ('emerging', 'growing', 'peak', 'declining', 'saturated')),
    saturation_score decimal(5,2),
    view_velocity decimal(10,2),
    creator_adoption_rate decimal(5,2),
    store_adoption_rate decimal(5,2),
    engagement_ratio decimal(5,2),
    ad_duplication_rate decimal(5,2),
    price_at_score decimal(12,2),
    scored_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_trend_scores_product ON trend_scores(tenant_id, product_id, scored_at DESC);
CREATE INDEX idx_trend_scores_tenant_scored ON trend_scores(tenant_id, scored_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- PLATFORM_SCORES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE platform_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform text NOT NULL,
    score decimal(5,2) NOT NULL,
    margin_score decimal(5,2),
    competition_score decimal(5,2),
    demand_score decimal(5,2),
    ai_rationale text,
    ai_rationale_hash text,  -- hash of inputs; only regenerate when changed >5 points
    scored_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, product_id, platform)
);
CREATE INDEX idx_platform_scores_product ON platform_scores(tenant_id, product_id);

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT_PLATFORM_MATCHES (cross-platform graph edges)
-- ✓ FIXED: M-2 — graph data structure now defined
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE product_platform_matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform text NOT NULL,
    external_id text NOT NULL,
    match_confidence decimal(5,2),  -- 0.00–100.00
    match_method text
        CHECK (match_method IN ('title_similarity', 'upc_gtin', 'manual', 'image_match')),
    price_on_platform decimal(12,2),
    matched_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, product_id, platform, external_id)
);
CREATE INDEX idx_ppm_product ON product_platform_matches(tenant_id, product_id);
CREATE INDEX idx_ppm_platform ON product_platform_matches(tenant_id, platform);

-- ═══════════════════════════════════════════════════════════════
-- CREATOR_PRODUCT_LINKS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE creator_product_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    match_score decimal(5,2),
    estimated_sales decimal(12,2),
    link_type text DEFAULT 'organic'
        CHECK (link_type IN ('organic', 'affiliate', 'sponsored', 'ai_recommended')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, creator_id, product_id)
);
CREATE INDEX idx_cpl_product ON creator_product_links(tenant_id, product_id);
CREATE INDEX idx_cpl_creator ON creator_product_links(tenant_id, creator_id);

-- ═══════════════════════════════════════════════════════════════
-- AFFILIATE_PROGRAMS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE affiliate_programs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    program_name text NOT NULL,
    commission_rate decimal(5,2),
    payout_type text,  -- 'per_sale', 'per_click', 'flat_fee'
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_affiliate_product ON affiliate_programs(tenant_id, product_id);

-- ═══════════════════════════════════════════════════════════════
-- PREDICTIVE_SIGNALS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE predictive_signals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    signal_type text NOT NULL,
    -- 'creator_burst', 'engagement_velocity', 'store_adoption', 'ad_replication'
    signal_strength decimal(5,2) NOT NULL,
    ai_classification text,         -- Anthropic classification result
    ai_confidence decimal(5,2),     -- Anthropic confidence level
    predicted_trend_date date,      -- when AI predicts viral breakout
    detected_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_predictive_product ON predictive_signals(tenant_id, product_id, detected_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- NICHES (★ NEW: MN-2)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE niches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text,
    product_count integer DEFAULT 0,
    avg_trend_score decimal(5,2),
    avg_saturation_score decimal(5,2),
    platform_breakdown jsonb DEFAULT '{}'::jsonb,
    -- { "tiktok": 45, "amazon": 30, "shopify": 25 }
    growth_rate decimal(5,2),
    lifecycle_stage text
        CHECK (lifecycle_stage IN ('emerging', 'growing', 'peak', 'declining', 'saturated')),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(tenant_id, name)
);
CREATE INDEX idx_niches_tenant ON niches(tenant_id);
ALTER TABLE niches ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(category, ''))
    ) STORED;
CREATE INDEX idx_niches_search ON niches USING GIN(search_vector);
```

### 11.4 — User Activity Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- ALERT_CONFIGS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE alert_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type text NOT NULL,
    -- 'trend_score', 'predictive_score', 'price_drop', 'new_creator', 'niche_change'
    threshold_value decimal(5,2),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    niche_id uuid REFERENCES niches(id) ON DELETE CASCADE,
    delivery_method text DEFAULT 'both'
        CHECK (delivery_method IN ('in_app', 'email', 'both', 'webhook')),
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_tenant_user ON alert_configs(tenant_id, user_id);

-- ═══════════════════════════════════════════════════════════════
-- SAVED_COLLECTIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE saved_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL DEFAULT 'Unnamed Collection',
    item_type text NOT NULL CHECK (item_type IN ('product', 'creator', 'shop')),
    item_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, user_id, item_type, item_id)
);
CREATE INDEX idx_collections_tenant_user ON saved_collections(tenant_id, user_id);

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT_USER_STATUS (★ NEW: S-16)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE product_user_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'dismissed', 'archived')),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, user_id, product_id)
);
CREATE INDEX idx_pus_tenant_user ON product_user_status(tenant_id, user_id);

-- ═══════════════════════════════════════════════════════════════
-- SAVED_VIEWS (★ NEW: S-6)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE saved_views (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    config jsonb NOT NULL,
    -- { filters: {...}, sort: {...}, columns: [...] }
    is_default boolean DEFAULT false,
    is_shared boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_saved_views_tenant_user ON saved_views(tenant_id, user_id);

-- ═══════════════════════════════════════════════════════════════
-- ANNOTATIONS (★ NEW: MN-4)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE annotations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type text NOT NULL
        CHECK (target_type IN ('product', 'creator', 'collection')),
    target_id uuid NOT NULL,
    content text NOT NULL,
    is_pinned boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_annotations_target ON annotations(tenant_id, target_type, target_id);
```

### 11.5 — Notification & Outreach Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type text NOT NULL,
    -- 'trend_alert', 'pre_trend_alert', 'outreach_reply', 'system', 'team_activity'
    title text NOT NULL,
    body text,
    link_url text,
    is_read boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(tenant_id, user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(tenant_id, user_id) WHERE is_read = false;

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATION_PREFERENCES (★ NEW: S-4)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trend_alerts text DEFAULT 'both'
        CHECK (trend_alerts IN ('in_app', 'email', 'both', 'off')),
    pre_trend_alerts text DEFAULT 'both'
        CHECK (pre_trend_alerts IN ('in_app', 'email', 'both', 'off')),
    outreach_replies text DEFAULT 'both'
        CHECK (outreach_replies IN ('in_app', 'email', 'both', 'off')),
    system_updates text DEFAULT 'in_app'
        CHECK (system_updates IN ('in_app', 'off')),
    team_activity text DEFAULT 'in_app'
        CHECK (team_activity IN ('in_app', 'email', 'both', 'off')),
    email_digest_frequency text DEFAULT 'instant'
        CHECK (email_digest_frequency IN ('instant', 'daily', 'weekly')),
    global_mute boolean DEFAULT false,
    UNIQUE(tenant_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════
-- OUTREACH_SEQUENCES (★ NEW: per M-5)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE outreach_sequences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sequence_step integer NOT NULL DEFAULT 1,  -- 1, 2, or 3
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'complained', 'stopped')),
    resend_message_id text,
    subject text,
    body text,
    sent_at timestamptz,
    opened_at timestamptz,
    clicked_at timestamptz,
    replied_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_outreach_tenant ON outreach_sequences(tenant_id);
CREATE INDEX idx_outreach_creator ON outreach_sequences(tenant_id, creator_id);

-- ═══════════════════════════════════════════════════════════════
-- OUTREACH_OPTOUTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE outreach_optouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    creator_email text NOT NULL,
    opted_out_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, creator_email)
);
```

### 11.6 — Billing & Referral Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- PROCESSED_WEBHOOKS (Stripe idempotency)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE processed_webhooks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id text NOT NULL UNIQUE,  -- Stripe event ID
    event_type text NOT NULL,
    processed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhooks_event ON processed_webhooks(event_id);

-- ═══════════════════════════════════════════════════════════════
-- REFERRALS (★ NEW: S-15)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    referrer_user_id uuid NOT NULL REFERENCES users(id),
    referee_email text NOT NULL,
    referee_tenant_id uuid REFERENCES tenants(id),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'signed_up', 'subscribed', 'reward_granted')),
    referral_code text NOT NULL UNIQUE,
    reward_granted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_referrals_tenant ON referrals(tenant_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
```

### 11.7 — System & Logging Tables

```sql
-- ═══════════════════════════════════════════════════════════════
-- RAW_LISTINGS (✓ FIXED: D-5)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE raw_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform text NOT NULL,
    actor_run_id text,
    worker_name text NOT NULL,
    raw_json jsonb NOT NULL,
    quality text DEFAULT 'full'
        CHECK (quality IN ('full', 'partial')),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_raw_listings_tenant ON raw_listings(tenant_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- DATA_QUARANTINE (✓ FIXED: T-8)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE data_quarantine (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_worker text NOT NULL,
    raw_data jsonb NOT NULL,
    failure_reason text NOT NULL,
    failure_step text NOT NULL
        CHECK (failure_step IN ('schema', 'sanitise', 'range', 'transform')),
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz
);
CREATE INDEX idx_quarantine_tenant ON data_quarantine(tenant_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- SCRAPE_LOG
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE scrape_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    worker_name text NOT NULL,
    trigger_type text NOT NULL,
    -- 'user_click', 'idle_3h', 'alert_breach', 'scheduled', 'system'
    platform text,
    cost_estimate decimal(8,4),
    duration_ms integer,
    status text NOT NULL DEFAULT 'started'
        CHECK (status IN ('started', 'success', 'partial', 'failed', 'dead_lettered')),
    error_message text,
    records_processed integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_scrape_log_tenant ON scrape_log(tenant_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- SCRAPE_SCHEDULE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE scrape_schedule (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    platform text NOT NULL,
    last_scraped_at timestamptz,
    next_scheduled_at timestamptz,
    priority integer DEFAULT 1,
    UNIQUE(tenant_id, platform)
);

-- ═══════════════════════════════════════════════════════════════
-- API_USAGE_LOG (doubles as audit log)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE api_usage_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id),
    endpoint text NOT NULL,
    method text NOT NULL,
    action text,  -- 'saved_product', 'triggered_scrape', 'sent_outreach', 'exported_report'
    target_type text,
    target_id uuid,
    response_time_ms integer,
    status_code integer,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_usage_tenant ON api_usage_log(tenant_id, created_at DESC);
CREATE INDEX idx_api_usage_user ON api_usage_log(tenant_id, user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- WEBHOOK_CONFIGS (user-configured webhook endpoints)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE webhook_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url text NOT NULL,
    event_types text[] NOT NULL,
    -- ['trend_alert', 'pre_trend_alert', 'new_product', 'outreach_reply']
    secret text NOT NULL,  -- for HMAC signature verification
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhook_configs_tenant ON webhook_configs(tenant_id);
```

### 11.8 — Materialised View

```sql
-- ═══════════════════════════════════════════════════════════════
-- DASHBOARD_CARDS_MV (✓ FIXED: T-6)
-- ═══════════════════════════════════════════════════════════════
CREATE MATERIALIZED VIEW dashboard_cards_mv AS
SELECT
    p.tenant_id,
    p.id AS product_id,
    p.title,
    p.image_url,
    p.category,
    p.product_type,
    p.price,
    p.platform,
    p.niche_tags,
    p.created_at AS first_detected_at,
    p.last_scraped_at,
    ts.score AS trend_score,
    ts.saturation_score,
    ts.lifecycle_stage,
    ts.scored_at AS trend_scored_at,
    pred.predictive_score,
    ps_best.platform AS recommended_platform,
    ps_best.score AS platform_score,
    ps_best.ai_rationale AS platform_rationale,
    (SELECT COUNT(*) FROM creator_product_links cpl
     WHERE cpl.product_id = p.id AND cpl.tenant_id = p.tenant_id) AS creator_count,
    (SELECT COUNT(*) FROM videos v
     WHERE v.product_id = p.id AND v.tenant_id = p.tenant_id) AS video_count,
    (SELECT COUNT(*) FROM product_platform_matches ppm
     WHERE ppm.product_id = p.id AND ppm.tenant_id = p.tenant_id) AS cross_platform_count
FROM products p
LEFT JOIN LATERAL (
    SELECT score, saturation_score, lifecycle_stage, scored_at
    FROM trend_scores
    WHERE product_id = p.id AND tenant_id = p.tenant_id
    ORDER BY scored_at DESC LIMIT 1
) ts ON true
LEFT JOIN LATERAL (
    SELECT MAX(signal_strength) AS predictive_score
    FROM predictive_signals
    WHERE product_id = p.id AND tenant_id = p.tenant_id
      AND detected_at > now() - interval '7 days'
) pred ON true
LEFT JOIN LATERAL (
    SELECT platform, score, ai_rationale
    FROM platform_scores
    WHERE product_id = p.id AND tenant_id = p.tenant_id
    ORDER BY score DESC LIMIT 1
) ps_best ON true;

-- Required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_tenant_product ON dashboard_cards_mv(tenant_id, product_id);
CREATE INDEX idx_mv_tenant_trend ON dashboard_cards_mv(tenant_id, trend_score DESC NULLS LAST);
CREATE INDEX idx_mv_tenant_predictive ON dashboard_cards_mv(tenant_id, predictive_score DESC NULLS LAST);
CREATE INDEX idx_mv_tenant_created ON dashboard_cards_mv(tenant_id, first_detected_at DESC);
```

### 11.9 — RLS Policies

```sql
-- Standard tenant isolation policy (apply to ALL data tables)
-- Template: replace {table_name} for each table

CREATE POLICY "Tenant isolation" ON {table_name}
    FOR ALL
    USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

-- Admin-only tables (scrape_log, scrape_schedule, api_usage_log, data_quarantine, webhook_configs)

CREATE POLICY "Admin only" ON {table_name}
    FOR ALL
    USING (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND (auth.jwt()->>'role') IN ('super_admin', 'agency_owner')
    );

-- User-scoped tables (notification_preferences, saved_views, product_user_status)

CREATE POLICY "User scoped" ON {table_name}
    FOR ALL
    USING (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND user_id = (auth.jwt()->>'sub')::uuid
    )
    WITH CHECK (
        tenant_id = (auth.jwt()->>'tenant_id')::uuid
        AND user_id = (auth.jwt()->>'sub')::uuid
    );
```

### 11.10 — Table Count Summary

| Category | Tables | Names |
|----------|--------|-------|
| Tenant & User | 2 | tenants, users |
| Team | 1 | invitations |
| Core Intelligence | 6 | products, creators, videos, shops, ads, raw_listings |
| Scoring | 5 | trend_scores, platform_scores, product_platform_matches, creator_product_links, predictive_signals |
| Reference | 2 | affiliate_programs, niches |
| User Activity | 4 | alert_configs, saved_collections, product_user_status, saved_views |
| Annotations | 1 | annotations |
| Notifications | 2 | notifications, notification_preferences |
| Outreach | 2 | outreach_sequences, outreach_optouts |
| Billing | 2 | processed_webhooks, referrals |
| System | 4 | data_quarantine, scrape_log, scrape_schedule, api_usage_log |
| Config | 1 | webhook_configs |
| **TOTAL** | **32** | + 1 materialised view |

---

## Section 12 — Worker System

`✓ FIXED: D-1 — Google Trends + YouTube workers now defined. D-2 — canonical count is 21. D-15 — cross_platform_match_worker now defined.`

### 12.1 — Worker Registry (21 Workers)

#### Scraping Workers (14) — Make External API Calls

| # | Worker | Trigger | Queue | Daily Budget | External API | Input | Output Table |
|---|--------|---------|-------|-------------|-------------|-------|-------------|
| 1 | `tiktok_discovery_worker` | User opens TikTok section / idle 3h | P0 or P2 | 500 | Apify / RapidAPI | TikTok region, niche filters | products, shops |
| 2 | `hashtag_scanner_worker` | Fires with discovery worker | P0 or P2 | 200 | TikTok unofficial API | Trending hashtag list | products (tags enrichment) |
| 3 | `creator_monitor_worker` | User expands Influencers row / Row 3 | P0 or P2 | 200 | Apify | Product ID or niche | creators, creator_product_links |
| 4 | `video_scraper_worker` | User opens Videos page / product click | P0 | 300 | Apify | Product ID, creator IDs | videos |
| 5 | `tiktok_live_worker` | User opens TikTok Live page | P0 | 100 | RapidAPI | TikTok region | videos (is_live = true) |
| 6 | `tiktok_ads_worker` | User opens TikTok Ads page / idle 3h | P0 or P2 | 150 | TikTok Ads API | Product keywords, category | ads |
| 7 | `amazon_bsr_scanner_worker` | User opens Amazon section / idle 3h | P0 or P2 | 150 | Amazon PA API | Category, ASIN list | products, trend_scores |
| 8 | `shopify_store_discovery_worker` | User opens Shopify section / idle 3h | P0 or P2 | 100 | Apify | Niche, keyword | shops, products |
| 9 | `shopify_growth_monitor_worker` | Fires with store discovery | P0 or P2 | 80 | Apify | Shop IDs from discovery | shops (revenue, traffic updates) |
| 10 | `facebook_ads_worker` | User opens Ads Intelligence / idle 3h | P0 or P2 | 200 | Apify | Product keywords, category | ads |
| 11 | `reddit_trend_worker` | Idle refresh rotation only | P2 | 100 | Reddit API (free) | Subreddit list, keywords | products (trend signals) |
| 12 | `pinterest_trend_worker` | Idle refresh rotation only | P2 | 100 | Pinterest API (free) | Trend categories | products (trend signals) |
| 13 | `google_trends_worker` | User views demand data / idle refresh | P0 or P2 | 50 | SerpAPI | Product keywords | trend_scores (search volume) |
| 14 | `youtube_worker` | User views YouTube data on product | P0 | 100 | YouTube Data API (free quota) | Product keywords, ASIN | videos (platform = 'youtube') |

#### Intelligence Workers (5) — Internal Processing + AI API

| # | Worker | Trigger | Queue | External API | Input | Output |
|---|--------|---------|-------|-------------|-------|--------|
| 15 | `product_extractor_worker` | After any scrape completes | P0 or P1 | None (internal) | raw_listings records | products (normalised), niche_tags |
| 16 | `amazon_tiktok_match_worker` | After product_extractor completes | P1 | None (internal) | products with platform = 'tiktok' or 'amazon' | product_platform_matches |
| 17 | `cross_platform_match_worker` | After any product scrape completes | P1 | None (internal) | All products across platforms | product_platform_matches |
| 18 | `trend_scoring_worker` | After any data scrape completes | P1 | None (internal) | products, videos, shops, ads, creator_product_links | trend_scores, niches (aggregation) |
| 19 | `predictive_discovery_worker` | Every 2h via scheduler (Proactive) | P1 | Anthropic API (50 calls/day) | trend_scores, predictive_signals, creator_product_links | predictive_signals |

#### System Workers (2)

| # | Worker | Trigger | Queue | External API | Purpose |
|---|--------|---------|-------|-------------|---------|
| 20 | `platform_profitability_scorer` | User views Best Platform row (Row 7) | P0 | Anthropic API (30 calls/day) | Generates platform_scores + AI rationale |
| 21 | `system_health_monitor_worker` | Always-on (lightweight loop) | Always | None | Checks queue depth, worker status, Redis health. Fires alerts. |

### 12.2 — Worker Execution Template

Every worker follows this execution template:

```typescript
async function executeWorker(jobData: WorkerJobData): Promise<void> {
    const { tenantId, platform, resource, trigger, priority } = jobData
    const workerName = 'worker_name_here'

    // Step 1: Log start
    const logId = await logToScrapeLog({
        tenant_id: tenantId, worker_name: workerName,
        trigger_type: trigger, platform, status: 'started'
    })

    try {
        // Step 2: Budget check (external workers only)
        if (EXTERNAL_WORKERS.includes(workerName)) {
            const budgetOk = await checkBudget(workerName)
            if (!budgetOk) {
                await updateScrapeLog(logId, { status: 'dead_lettered', error_message: 'Budget exhausted' })
                throw new BudgetExhaustedError(workerName)
            }
        }

        // Step 3: Fetch data from external API
        const rawData = await fetchFromApi(jobData)

        // Step 4: Validate (Zod schema)
        const validated = WorkerSchema.parse(rawData)

        // Step 5: Sanitise
        const sanitised = sanitiseData(validated)

        // Step 6: Store raw data
        await supabase.from('raw_listings').insert({
            tenant_id: tenantId, platform, worker_name: workerName,
            raw_json: rawData, quality: rawData.length < EXPECTED_MIN ? 'partial' : 'full'
        })

        // Step 7: Transform + upsert
        const records = transformToSchema(sanitised)
        await upsertRecords(records, tenantId)

        // Step 8: Update freshness
        await redis.set(`data_freshness:${platform}:${resource}:${tenantId}`, Date.now(), 'EX', 86400)

        // Step 9: Trigger downstream workers
        await enqueueDownstream(workerName, tenantId, records)

        // Step 10: Broadcast update via Supabase Realtime
        await supabase.channel(`tenant:${tenantId}:dashboard`).send({
            type: 'broadcast', event: 'data_updated',
            payload: { table: resource, count: records.length }
        })

        // Step 11: Log success
        await updateScrapeLog(logId, {
            status: 'success', duration_ms: Date.now() - startTime,
            records_processed: records.length
        })

    } catch (error) {
        // Step 12: Error handling (see Section 16 for full error matrix)
        await handleWorkerError(error, logId, jobData)
    }
}
```

### 12.3 — Worker Dependency Chain

```
User action triggers scrape
    ↓
[tiktok_discovery / amazon_bsr / shopify_store / etc.] (scraping worker)
    ↓
product_extractor_worker (normalise raw → products table)
    ↓ (parallel)
├── amazon_tiktok_match_worker (TikTok ↔ Amazon matching)
├── cross_platform_match_worker (all-platform matching)
├── trend_scoring_worker (compute scores + lifecycle + niche aggregation)
│       ↓
│   [IF predictive_score > 65 AND product_age < 7d]
│       → Fire P1 alert job
│       → Notify subscribed users
│
└── [IF user is viewing product detail]
    └── platform_profitability_scorer (Row 7, Anthropic API)
```

### 12.4 — Downstream Worker Triggers

| After Worker Completes | Trigger These Workers |
|----------------------|---------------------|
| Any scraping worker (#1–14) | product_extractor_worker (#15) |
| product_extractor_worker (#15) | amazon_tiktok_match_worker (#16), cross_platform_match_worker (#17), trend_scoring_worker (#18) |
| trend_scoring_worker (#18) | [Check alert thresholds → fire notifications if breached] |
| platform_profitability_scorer (#20) | [None — terminal worker] |
| predictive_discovery_worker (#19) | [Check pre-trend thresholds → fire P1 alerts] |

### 12.5 — Worker Failure Handling

| Failure Type | Detection | Response | Max Retries | Dead Letter? |
|-------------|-----------|----------|-------------|-------------|
| External API timeout | Request timeout > 30s | Retry with 2× timeout | 3 | Yes |
| External API 429 | HTTP 429 response | Exponential backoff: 2s, 4s, 8s, 16s | 4 | Yes (if all retries fail) |
| External API 5xx | HTTP 500-599 | Circuit breaker (5 failures in 5 min) | 3 | Yes |
| Empty dataset | 0 records returned | Do NOT overwrite existing data. Log anomaly. | 1 retry | Yes |
| Partial dataset | < expected_min records | Accept with quality='partial' flag | 0 (accept as-is) | No |
| Zod validation failure | Schema parse throws | Quarantine to data_quarantine table | 0 | No (quarantined) |
| Budget exhausted | checkBudget() returns false | Halt worker, log, alert admin | 0 | Yes |
| Anthropic API error | HTTP error or malformed response | Retry with backoff, fall back to cached response | 2 | Yes |
| Supabase write failure | DB error | Retry once, then dead-letter | 1 | Yes |

**BullMQ retry configuration** (per worker):

```typescript
{
    attempts: 3,
    backoff: {
        type: 'exponential',
        delay: 2000  // 2s, 4s, 8s
    },
    removeOnComplete: { count: 1000 },  // keep last 1000 completed
    removeOnFail: { count: 5000 }       // keep last 5000 failed (for debugging)
}
```

---
