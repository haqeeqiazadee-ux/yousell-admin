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

## Section 13 — API Routes

`★ NEW: This entire section is new. The v5 brief had NO dedicated API routes section — identified as the #1 gap in Phase 2.`

All routes are on the **Railway Express backend** (not Netlify). All routes require JWT auth unless marked PUBLIC.

### 13.1 — Authentication Routes

| Method | Path | Purpose | Auth | Rate Limit |
|--------|------|---------|------|-----------|
| POST | `/api/auth/signup` | Create account + tenant | PUBLIC | 5/15min per IP |
| POST | `/api/auth/login` | Email/password login | PUBLIC | 5/15min per IP |
| POST | `/api/auth/magic-link` | Send magic link email | PUBLIC | 3/15min per IP |
| POST | `/api/auth/logout` | Invalidate JWT (blacklist) | JWT | — |
| POST | `/api/auth/refresh` | Refresh JWT using refresh token | Refresh token | 10/min |
| GET | `/api/auth/me` | Current user profile | JWT | — |

### 13.2 — Dashboard Routes

| Method | Path | Purpose | Auth | Plan Gate | Trigger |
|--------|------|---------|------|----------|---------|
| GET | `/api/dashboard/cards` | Home dashboard product cards (from MV) | JWT | All | Checks freshness, enqueues refresh if stale |
| POST | `/api/dashboard/refresh` | Force refresh dashboard MV | JWT | All | Enqueues P0 MV refresh |
| GET | `/api/dashboard/stats` | Live stats bar counters | JWT | All | Cached in Redis, updated on MV refresh |
| GET | `/api/dashboard/briefing` | Daily AI briefing (★ NEW: MN-3) | JWT | Pro+ | Reads latest briefing from cache/DB |

### 13.3 — Product Routes

| Method | Path | Purpose | Auth | Plan Gate | Trigger |
|--------|------|---------|------|----------|---------|
| GET | `/api/products` | List products (paginated, filtered, sorted) | JWT | All | No scrape — reads DB only |
| GET | `/api/products/:id` | Product detail (triggers chain freshness check) | JWT | All | Checks 7-row freshness, enqueues stale rows |
| GET | `/api/products/:id/chain/:row` | Specific chain row data | JWT | All | Checks freshness of specific row |
| POST | `/api/products/:id/refresh` | Force refresh all chain rows | JWT | All | Enqueues P0 job per stale row |
| GET | `/api/products/:id/trend-history` | 30/60/90 day trend score chart data | JWT | Pro+ | Reads trend_scores time-series |
| GET | `/api/products/:id/cross-platform` | Cross-platform matches (Row 5) | JWT | Pro+ | Reads product_platform_matches |
| POST | `/api/products/compare` | Compare 2-4 products side-by-side | JWT | Pro+ | Body: `{ product_ids: [...] }` |
| POST | `/api/products/bulk-action` | Bulk save/alert/archive/dismiss | JWT | All | Body: `{ product_ids, action, params }` |

### 13.4 — Platform-Specific Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/tiktok/products` | TikTok trending products | JWT | All |
| GET | `/api/tiktok/creators` | TikTok creator rankings | JWT | All |
| GET | `/api/tiktok/videos` | TikTok viral videos | JWT | All |
| GET | `/api/tiktok/shops` | TikTok shops by GMV | JWT | All |
| GET | `/api/tiktok/live` | TikTok live streams | JWT | All |
| GET | `/api/tiktok/ads` | TikTok ad creatives | JWT | All |
| GET | `/api/amazon/products` | Amazon rising products (BSR) | JWT | Pro+ |
| GET | `/api/amazon/rankings` | Amazon BSR movement charts | JWT | Pro+ |
| GET | `/api/amazon/cross-signal` | Amazon vs TikTok cross-signal | JWT | Pro+ |
| GET | `/api/shopify/stores` | Shopify store discovery | JWT | Agency+ |
| GET | `/api/shopify/stores/:id` | Shopify store deep dive | JWT | Agency+ |
| GET | `/api/shopify/niches` | Shopify niche scanner | JWT | Agency+ |

All platform routes: check freshness → return data + badge → enqueue P0 scrape if stale.

### 13.5 — Creator & Outreach Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/creators` | List creators (paginated, filtered) | JWT | All |
| GET | `/api/creators/:id` | Creator detail | JWT | All |
| GET | `/api/creators/:id/products` | Products linked to this creator | JWT | All |
| POST | `/api/creators/:id/outreach` | Generate + send outreach email | JWT | Pro+ (5/mo), Agency+ (50/mo) |
| GET | `/api/outreach/sequences` | Outreach sequence dashboard | JWT | Pro+ |
| GET | `/api/outreach/stats` | Outreach analytics (open/reply rates) | JWT | Pro+ |

### 13.6 — Collection & Saved View Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/collections` | List user's collections | JWT | All |
| POST | `/api/collections` | Create/save to collection | JWT | All |
| DELETE | `/api/collections/:id` | Remove from collection | JWT | All |
| GET | `/api/views` | List saved views | JWT | Pro+ |
| POST | `/api/views` | Save current view config | JWT | Pro+ |
| PUT | `/api/views/:id` | Update saved view | JWT | Pro+ |
| DELETE | `/api/views/:id` | Delete saved view | JWT | Pro+ |
| PUT | `/api/views/:id/default` | Set as default view | JWT | Pro+ |

### 13.7 — Alert & Notification Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/alerts` | List alert configurations | JWT | All |
| POST | `/api/alerts` | Create alert | JWT | All (limited by plan) |
| PUT | `/api/alerts/:id` | Update alert threshold | JWT | All |
| DELETE | `/api/alerts/:id` | Delete alert | JWT | All |
| GET | `/api/notifications` | List notifications (paginated) | JWT | All |
| PUT | `/api/notifications/:id/read` | Mark notification as read | JWT | All |
| PUT | `/api/notifications/read-all` | Mark all as read | JWT | All |
| GET | `/api/notifications/preferences` | Get notification preferences | JWT | All |
| PUT | `/api/notifications/preferences` | Update notification preferences | JWT | All |

### 13.8 — Search Route

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/search?q={query}&type={type}` | Global search (Cmd+K) across products, creators, shops, niches | JWT | All |

Query params: `q` (search term, min 2 chars), `type` (optional: 'products', 'creators', 'shops', 'niches'), `limit` (default 5 per type).

### 13.9 — Team & Invitation Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/team` | List team members | JWT | All |
| POST | `/api/team/invite` | Send invitation email | JWT (admin) | Pro+ (3 seats), Agency+ (10) |
| DELETE | `/api/team/:userId` | Remove team member | JWT (admin) | Pro+ |
| PUT | `/api/team/:userId/role` | Change member role | JWT (admin) | Pro+ |
| POST | `/api/invite/accept/:token` | Accept invitation | PUBLIC | — |
| GET | `/api/team/activity` | Activity feed (★ NEW: S-10) | JWT (admin) | Agency+ |

### 13.10 — Billing Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| POST | `/api/billing/checkout` | Create Stripe Checkout session | JWT (admin) | All |
| GET | `/api/billing/portal` | Get Stripe Customer Portal URL | JWT (admin) | All |
| GET | `/api/billing/usage` | Current usage vs plan limits | JWT | All |
| GET | `/api/billing/invoices` | Invoice history | JWT (admin) | All |

### 13.11 — Export & Report Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| POST | `/api/export/csv` | Export products/creators as CSV | JWT | All (limited) |
| POST | `/api/export/excel` | Export as Excel | JWT | Pro+ |
| POST | `/api/reports/generate` | Generate AI intelligence report PDF | JWT | Agency+ |
| GET | `/api/reports` | List generated reports | JWT | Agency+ |
| GET | `/api/reports/:id/download` | Download report PDF | JWT | Agency+ |
| POST | `/api/reports/schedule` | Schedule recurring reports | JWT | Agency+ |

### 13.12 — Sharing Routes (★ NEW: S-11)

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| POST | `/api/share/link` | Create shareable read-only link | JWT | Agency+ |
| GET | `/api/share/:token` | Access shared content (public) | Token | — |
| DELETE | `/api/share/:id` | Revoke share link | JWT | Agency+ |

### 13.13 — Annotation Routes (★ NEW: MN-4)

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/annotations?target_type={type}&target_id={id}` | List annotations on target | JWT | Pro+ |
| POST | `/api/annotations` | Create annotation | JWT | Pro+ |
| PUT | `/api/annotations/:id` | Edit annotation | JWT (owner) | Pro+ |
| DELETE | `/api/annotations/:id` | Delete annotation | JWT (owner) | Pro+ |
| PUT | `/api/annotations/:id/pin` | Toggle pin | JWT (admin) | Pro+ |

### 13.14 — Webhook Configuration Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/webhooks` | List configured webhooks | JWT (admin) | Agency+ |
| POST | `/api/webhooks` | Create webhook endpoint | JWT (admin) | Agency+ |
| PUT | `/api/webhooks/:id` | Update webhook | JWT (admin) | Agency+ |
| DELETE | `/api/webhooks/:id` | Delete webhook | JWT (admin) | Agency+ |
| POST | `/api/webhooks/:id/test` | Send test event | JWT (admin) | Agency+ |

### 13.15 — Admin / System Routes

| Method | Path | Purpose | Auth | Plan Gate |
|--------|------|---------|------|----------|
| GET | `/api/admin/settings` | Tenant settings (branding, API keys) | JWT (admin) | All |
| PUT | `/api/admin/settings` | Update tenant settings | JWT (admin) | All |
| GET | `/api/admin/system-health` | System health dashboard data | JWT (super_admin) | — |
| GET | `/api/admin/scrape-log` | Scrape execution history | JWT (admin) | All |
| GET | `/api/admin/quarantine` | Data quarantine records | JWT (admin) | All |

### 13.16 — Incoming Webhook Endpoints (external services)

| Method | Path | Purpose | Auth | Source |
|--------|------|---------|------|--------|
| POST | `/api/webhooks/stripe` | Stripe subscription events | Stripe signature | Stripe |
| POST | `/api/webhooks/resend` | Resend email tracking events | Resend signature | Resend |

### 13.17 — Public Health Check

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/health` | Service health check (DB, Redis, BullMQ) | PUBLIC |

### 13.18 — Route Count Summary

| Category | Routes |
|----------|--------|
| Authentication | 6 |
| Dashboard | 4 |
| Products | 8 |
| Platform-specific | 12 |
| Creators & Outreach | 6 |
| Collections & Views | 8 |
| Alerts & Notifications | 9 |
| Search | 1 |
| Team & Invitations | 6 |
| Billing | 4 |
| Export & Reports | 6 |
| Sharing | 3 |
| Annotations | 5 |
| Webhooks (config) | 5 |
| Admin/System | 5 |
| Incoming Webhooks | 2 |
| Health | 1 |
| **TOTAL** | **91 routes** |

---

## Section 14 — Subscription Plans & Billing

### 14.1 — Plan Feature Matrix

| Feature | Starter ($49/mo) | Pro ($149/mo) | Agency ($349/mo) | Enterprise (Custom) |
|---------|:----------------:|:------------:|:---------------:|:------------------:|
| **Platform Access** | | | | |
| TikTok Intelligence | Yes | Yes | Yes | Yes |
| Amazon Intelligence | — | Yes | Yes | Yes |
| Shopify Intelligence | — | — | Yes | Yes |
| Facebook/Instagram Ads | — | — | Yes | Yes |
| Reddit/Pinterest/Google/YouTube | — | — | Yes | Yes |
| **Limits** | | | | |
| Products tracked | 500 | 5,000 | 25,000 | Unlimited |
| Creators tracked | 200 | 2,000 | 10,000 | Unlimited |
| Trend alerts | 3 | 25 | Unlimited | Unlimited |
| Saved collections | 10 items | 100 items | Unlimited | Unlimited |
| Saved views | 3 | 10 | 20 | Unlimited |
| Team seats | 1 | 3 | 10 | Unlimited |
| **Intelligence Features** | | | | |
| Trend Score | Yes | Yes | Yes | Yes |
| Predictive engine | — | Yes | Yes | Yes |
| Creator-Product Match | — | Yes | Yes | Yes |
| Best Platform Recommender | — | — | Yes | Yes |
| Product Lifecycle badges | — | Yes | Yes | Yes |
| Niche Intelligence | — | — | Yes | Yes |
| Cross-platform graph | — | Yes (basic) | Yes (full) | Yes (full) |
| **Outreach & Reports** | | | | |
| Creator outreach emails | — | 5/month | 50/month | Unlimited |
| AI Intelligence Reports | — | — | Yes (branded) | Yes (white-label) |
| Daily AI Briefing | — | Yes | Yes | Yes |
| **Data & Export** | | | | |
| CSV export | Yes | Yes | Yes | Yes |
| Excel export | — | Yes | Yes | Yes |
| PDF export | — | — | Yes | Yes |
| API access | — | — | 1,000 calls/mo | Unlimited |
| **Collaboration** | | | | |
| Team annotations | — | Yes | Yes | Yes |
| Activity log | — | — | Yes | Yes |
| Client sharing links | — | — | Yes | Yes |
| Client portal | — | — | — | Yes |
| **Customisation** | | | | |
| Custom branding | — | — | Logo + colours | Full white-label |
| Custom domain | — | — | — | Yes |
| Webhook integrations | — | — | Yes | Yes |
| Dedicated support | — | — | Priority email | Dedicated CSM |

### 14.2 — Pricing Structure

| Plan | Monthly | Annual (20% off) | Annual Total |
|------|---------|-------------------|-------------|
| Starter | $49/mo | $39/mo | $468/yr |
| Pro | $149/mo | $119/mo | $1,428/yr |
| Agency | $349/mo | $279/mo | $3,348/yr |
| Enterprise | Custom | Custom | Custom |

`★ NEW: Annual billing (S-14)`

### 14.3 — Stripe Integration Architecture

**Stripe Products & Prices**:
- 1 Stripe Product per plan (Starter, Pro, Agency)
- 2 Stripe Prices per product (monthly, annual)
- Enterprise: custom invoicing via Stripe Invoicing

**Checkout Flow**:
```
User clicks "Subscribe" → POST /api/billing/checkout
→ Create Stripe Checkout Session with:
    - price_id (based on selected plan + billing cycle)
    - customer_email (from auth)
    - success_url: /dashboard?checkout=success
    - cancel_url: /pricing?checkout=cancel
    - allow_promotion_codes: true
→ Redirect user to Stripe Checkout
→ On success: Stripe sends checkout.session.completed webhook
→ Backend: update tenants.plan, tenants.stripe_customer_id, tenants.stripe_subscription_id
→ Redirect user to dashboard with success toast
```

**Customer Portal**:
```
User clicks "Manage Billing" → GET /api/billing/portal
→ Create Stripe Billing Portal Session
→ Features enabled:
    - Update payment method
    - View invoices
    - Cancel subscription
    - Switch plan (upgrade/downgrade)
→ Redirect user to Stripe portal
```

**Usage Metering** (via Stripe Meters):

| Meter | What It Tracks | Enforcement Point |
|-------|---------------|-------------------|
| products_tracked | COUNT(products WHERE tenant_id = :id) | Before product upsert |
| creators_tracked | COUNT(creators WHERE tenant_id = :id) | Before creator upsert |
| alerts_active | COUNT(alert_configs WHERE tenant_id = :id AND is_active = true) | Before alert creation |
| outreach_sent | COUNT(outreach_sequences WHERE tenant_id = :id AND MONTH(sent_at) = current) | Before outreach send |
| api_calls | COUNT(api_usage_log WHERE tenant_id = :id AND MONTH(created_at) = current) | API rate limiter middleware |

**Enforcement**: Application middleware checks usage against plan limits BEFORE executing the operation. Returns 403 with upgrade prompt if limit reached.

### 14.4 — Webhook Event Handling

`✓ FIXED: T-3 — complete Stripe webhook handling defined`

**Endpoint**: `POST /api/webhooks/stripe`

```typescript
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    // 1. Verify webhook signature
    const event = stripe.webhooks.constructEvent(
        req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET
    )

    // 2. Idempotency check
    const existing = await supabase.from('processed_webhooks')
        .select('id').eq('event_id', event.id).single()
    if (existing.data) return res.json({ received: true, duplicate: true })

    // 3. Process event
    switch (event.type) {
        case 'checkout.session.completed': await handleCheckoutComplete(event); break
        case 'invoice.payment_succeeded': await handlePaymentSuccess(event); break
        case 'invoice.payment_failed': await handlePaymentFailed(event); break
        case 'customer.subscription.updated': await handleSubscriptionUpdate(event); break
        case 'customer.subscription.deleted': await handleSubscriptionDeleted(event); break
    }

    // 4. Record as processed
    await supabase.from('processed_webhooks').insert({
        event_id: event.id, event_type: event.type
    })

    res.json({ received: true })
})
```

### 14.5 — Free Trial Lifecycle

`✓ FIXED: T-18`

| Day | Event | Tenant State | Action |
|-----|-------|-------------|--------|
| 0 | Signup | `plan: 'trial'`, `plan_status: 'trial'`, `trial_ends_at: +14d` | Full Pro access. No card required. Welcome email. |
| 7 | Midpoint | No change | Email: "Your trial is halfway. Here's what you've discovered: [stats]." |
| 12 | Urgent | No change | Email: "2 days left. Upgrade to keep your data." |
| 14 | Expires | `plan: 'locked'`, `plan_status: 'locked'` | Read-only access. No scrapes, exports, outreach. Banner: "Trial ended. Choose a plan." |
| 21 | Reminder | No change | Email: "Your data will be archived in 9 days. Upgrade now." |
| 30 | Archive | `plan_status: 'archived'` | Data moved to cold storage. Account shell preserved. Can reactivate. |

### 14.6 — Dunning Flow (Failed Payments)

`★ NEW: S-12 — P0 launch blocker`

| Day | Trigger | Tenant State | User Experience |
|-----|---------|-------------|-----------------|
| 0 | `invoice.payment_failed` | `plan_status: 'past_due'` | Stripe auto-retries. Email: "Payment failed. Update card." + portal link. |
| 3 | Grace expired | `plan_status: 'grace_expired'` | Full access continues. Email: "Update payment within 4 days." |
| 7 | Restricted | `plan_status: 'restricted'` | Read-only. No scrapes/exports/outreach. Banner in app. |
| 14 | Locked | `plan_status: 'locked'` | Login → payment update page. Email: "Account locked. Data preserved 16 more days." |
| 30 | Archived | `plan_status: 'archived'` | Data archived. Re-activate with new payment. |

### 14.7 — Upgrade/Downgrade Logic

`★ NEW: S-13`

**Upgrade** (e.g., Starter → Pro):
1. Stripe prorates charge immediately
2. New plan limits effective immediately
3. New features available immediately
4. Confirmation email with new plan summary

**Downgrade** (e.g., Agency → Pro):
1. Takes effect at end of current billing cycle
2. Before confirmation, show impact summary:
   - "Your Agency plan ends on [date]. After that:"
   - "Shopify Intelligence will be locked"
   - "20,000 of your 25,000 products will be archived (newest kept)"
   - "Agency reports will be locked"
   - "Team seats reduced from 10 to 3 (remove members first)"
3. Excess data archived (not deleted) — accessible if user re-upgrades
4. Excess team members: admin must remove to reach new limit before downgrade takes effect

---

## Section 15 — Missing SaaS Features (Now Added)

This section provides a consolidated index of all 18 missing SaaS features from Phase 3, showing where each is fully specified in v6.0.

### 15.1 — Feature Resolution Index

| ID | Feature | Priority | Primary Section | Supporting Sections | Status |
|----|---------|----------|----------------|--------------------|---------|
| S-1 | Onboarding empty states / time-to-value | P0 | Section 6.7 (Onboarding Flow) | Section 8.5 (Loading & Empty States) | RESOLVED |
| S-2 | Loading skeleton states | P1 | Section 8.5 (Loading & Empty States) | — | RESOLVED |
| S-3 | WCAG accessibility | P1 | Section 8.11 (Accessibility) | Section 4.5 (badge hex values) | RESOLVED |
| S-4 | Notification preferences | P1 | Section 8.7 (Notification Centre) | Section 11.5 (notification_preferences table) | RESOLVED |
| S-5 | Bulk actions on product lists | P1 | Section 8.8 (Bulk Actions) | Section 13.3 (POST /api/products/bulk-action) | RESOLVED |
| S-6 | Saved views / custom filters | P2 | Section 8.10 (Saved Views) | Section 11.4 (saved_views table), Section 13.6 | RESOLVED |
| S-7 | Help centre / contextual tooltips | P0 | Section 8.14 (Help & Tooltips) | — | RESOLVED |
| S-8 | Data retention visibility | P1 | Section 6.11 (GDPR: Data Retention) | — | RESOLVED |
| S-9 | Team invitation / multi-user | P0 | Section 6.3 (Team Invitation Flow) | Section 11.1 (invitations table), Section 13.9 | RESOLVED |
| S-10 | Activity log for team admins | P2 | Section 8.15 (Activity Log) | Section 13.9 (GET /api/team/activity) | RESOLVED |
| S-11 | External client sharing / portal | P2 | Section 6.12 (Client Sharing) | Section 13.12 (sharing routes) | RESOLVED |
| S-12 | Failed payment / dunning flow | P0 | Section 14.6 (Dunning Flow) | Section 6.8 (Stripe Webhooks) | RESOLVED |
| S-13 | Plan upgrade/downgrade proration | P1 | Section 14.7 (Upgrade/Downgrade Logic) | — | RESOLVED |
| S-14 | Annual plan option | P2 | Section 1.4 (Revenue Model) | Section 14.2 (Pricing Structure) | RESOLVED |
| S-15 | Referral programme | P3 | Section 6.8 (mentioned) | Section 11.6 (referrals table) | RESOLVED |
| S-16 | Product archiving / dismissal | P1 | Section 8.9 (Archiving & Dismissal) | Section 11.4 (product_user_status table) | RESOLVED |
| S-17 | Changelog / "What's New" | P3 | Section 8.13 (What's New) | — | RESOLVED |
| S-18 | Keyboard shortcuts | P3 | Section 8.12 (Keyboard Shortcuts) | — | RESOLVED |

### 15.2 — Additional SaaS Features (from v5, now enhanced)

| Feature | v5 Definition | v6 Enhancement |
|---------|--------------|----------------|
| Global Search (Cmd+K) | "Supabase full-text search (pg_trgm)" | tsvector columns, GIN indexes, debounce, grouped results, Typesense fallback (Section 8.6) |
| Audit Log | "Enterprise/Agency — api_usage_log table" | Expanded to team activity feed with filters (Section 8.15) |
| Notification Centre | "Bell icon, in-app" | Per-category preferences, digest frequency, global mute, webhook delivery (Section 8.7) |
| Data Export | "CSV, Excel, PDF" | Per-plan export limits, bulk export, agency branded PDF reports (Sections 13.11, Section 3 Moat 6) |
| Comparison Mode | "Select 2-4 products, compare side-by-side" | POST /api/products/compare route defined (Section 13.3) |
| Trend History Charts | "90-day trend score history chart" | GET /api/products/:id/trend-history route, trend_scores time-series (Section 13.3) |
| Competitor Niche Map | "Bubble chart: demand × competition × creator adoption" | Extended by Niche Intelligence Engine (★ NEW: MN-2, Section 3.3) |
| Creator Outreach CRM | "Identified → Email Sent → Replied → Deal Closed" | Full 3-email sequence, Resend webhooks, anti-spam, analytics dashboard (Section 3, Moat 5) |
| Webhook Integration | "User-configured webhook → external automations" | webhook_configs table, HMAC signatures, test endpoint (Sections 11.7, 13.14) |
| Mobile Responsive | "Fully usable on tablet and mobile" | Tailwind responsive utilities, mobile-first Opportunity Feed, touch targets (unchanged from v5) |

### 15.3 — Implementation Priority Matrix

**Phase 1 Build** (P0 features — launch blockers):

| Feature | Effort | Dependency |
|---------|--------|-----------|
| S-1: Onboarding empty states | Small | Requires skeleton components |
| S-7: Contextual tooltips | Small | No dependencies |
| S-9: Team invitations | Medium | Requires auth + invitations table |
| S-12: Dunning flow | Medium | Requires Stripe webhooks |

**Phase 2 Build** (P1 features — within 30 days of launch):

| Feature | Effort | Dependency |
|---------|--------|-----------|
| S-2: Skeleton loading | Small | No dependencies |
| S-3: WCAG accessibility | Medium | Applies to all UI components |
| S-4: Notification preferences | Small | Requires notification_preferences table |
| S-5: Bulk actions | Medium | Requires product list component |
| S-8: Data retention visibility | Small | Settings page |
| S-13: Proration logic | Medium | Requires Stripe integration |
| S-16: Product archiving | Small | Requires product_user_status table |

**Phase 3+ Build** (P2/P3 features):

| Feature | Effort | Notes |
|---------|--------|-------|
| S-6: Saved views | Medium | After core product list is stable |
| S-10: Activity log | Small | Uses existing api_usage_log |
| S-11: Client sharing | Medium | Agency-only feature |
| S-14: Annual plans | Small | Stripe configuration only |
| S-15: Referral programme | Medium | Tracking + reward logic |
| S-17: Changelog | Small | External content + modal |
| S-18: Keyboard shortcuts | Small | react-hotkeys or similar |

---

## Section 16 — Error Handling, Monitoring & Disaster Recovery

This section consolidates all error handling, monitoring, and disaster recovery specifications. Much of this content is defined in detail in earlier sections — this section serves as the **complete error handling reference**.

### 16.1 — External Dependency Error Matrix

`✓ FIXED: T-1, T-2, T-3, T-4, T-5 — error handling was entirely absent in v5`

| Dependency | Failure Mode | Detection | Immediate Response | Recovery |
|-----------|-------------|-----------|-------------------|----------|
| **Apify** | Actor timeout | Status: TIMED_OUT | Log, retry with 2× timeout | 3 retries → dead_letter |
| **Apify** | Service down (5xx) | HTTP 5xx / connection refused | Circuit breaker (5 failures/5 min) | Stale data + badge. Retry 15 min. |
| **Apify** | Partial data | Item count < expected | Accept with `quality: 'partial'` | Process available, schedule P2 retry |
| **Apify** | Empty dataset | 0 items | Do NOT overwrite existing | Retry once P1, then dead_letter |
| **Apify** | Rate limited (429) | HTTP 429 | Exponential backoff 2s/4s/8s/16s | Budget decrement |
| **Apify** | Actor deprecated | Deprecation header | Alert admin immediately | Manual: swap actor ID |
| **RapidAPI** | Rate limited (429) | HTTP 429 | Backoff + budget decrement | Wait for window reset |
| **RapidAPI** | Quota exceeded | 429 + quota header | Halt worker for day | Alert admin |
| **RapidAPI** | Schema change | Zod validation fail | Quarantine raw data | Alert admin |
| **RapidAPI** | Service outage (5xx) | HTTP 5xx | Circuit breaker | Stale data + badge |
| **Stripe** | Webhook delivery fail | No event received | — | Stripe auto-retries for 72h |
| **Stripe** | Duplicate webhook | Same event.id | Idempotency check (processed_webhooks table) | Skip duplicate |
| **Stripe** | Invalid signature | Signature mismatch | Reject + log security event | — |
| **Anthropic** | Rate limited (429) | HTTP 429 | Backoff | Retry after window |
| **Anthropic** | Quota exceeded | HTTP 429 + quota | Circuit breaker for non-P0 calls | Alert admin, use cached responses |
| **Anthropic** | Malformed response | Parse error | Fall back to cached AI rationale | Retry once |
| **Resend** | Delivery fail | Webhook: email.bounced | Update outreach_sequences status | Log, don't retry (bad email) |
| **Resend** | Service down | HTTP 5xx | Queue email for retry | Retry with backoff, max 3 |
| **Redis** | Freshness check fail | Connection error | Treat data as stale → return DB data | Reconnect with backoff |
| **Redis** | Budget check fail | Connection error | **REFUSE API call** (fail-safe, never fail-open) | Reconnect with backoff |
| **Redis** | BullMQ unavailable | Connection error | Return stale DB data + warning message | Reconnect with backoff |
| **Supabase DB** | Unreachable | Connection error | Cached data if available; clear error message | Reconnect with backoff |
| **Supabase Auth** | Unreachable | Connection error | Existing JWTs valid until expiry; maintenance banner | Reconnect |
| **Supabase Realtime** | Disconnected | WebSocket close | Fallback polling every 30s; "Live updates paused" indicator | Auto-reconnect with backoff |

### 16.2 — Circuit Breaker Pattern

Used for all external APIs (Apify, RapidAPI, Anthropic, Resend).

```typescript
class CircuitBreaker {
    private failures = 0
    private lastFailure = 0
    private state: 'closed' | 'open' | 'half-open' = 'closed'

    private readonly THRESHOLD = 5        // failures to trip
    private readonly WINDOW = 5 * 60_000  // 5 minutes
    private readonly COOLDOWN = 15 * 60_000  // 15 minutes before half-open

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailure > this.COOLDOWN) {
                this.state = 'half-open'  // allow one test request
            } else {
                throw new CircuitOpenError()
            }
        }

        try {
            const result = await fn()
            this.reset()
            return result
        } catch (error) {
            this.recordFailure()
            throw error
        }
    }

    private recordFailure() {
        this.failures++
        this.lastFailure = Date.now()
        if (this.failures >= this.THRESHOLD) {
            this.state = 'open'
            // Alert admin
        }
    }

    private reset() {
        this.failures = 0
        this.state = 'closed'
    }
}
```

### 16.3 — Health Check System

`✓ FIXED: T-9`

**Endpoint**: `GET /api/health` (public)

```typescript
app.get('/api/health', async (req, res) => {
    const checks = await Promise.allSettled([
        checkDatabase(),
        checkRedis(),
        checkBullMQ()
    ])

    const services = {
        database: formatCheck(checks[0]),
        redis: formatCheck(checks[1]),
        bullmq: formatCheck(checks[2])
    }

    const allHealthy = Object.values(services).every(s => s.status === 'up')

    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services
    })
})
```

### 16.4 — Alert Rules

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| P0 queue depth | > 50 jobs | > 100 jobs | Email admin |
| P1 queue depth | > 100 jobs | > 200 jobs | Email admin |
| Worker failure rate | > 5% in 15 min | > 10% in 15 min | Email + pause worker |
| API p95 response time | > 3 seconds | > 5 seconds | Email admin |
| Worker budget usage | 80% of daily limit | 100% of daily limit | Email / halt worker |
| Redis memory | > 75% capacity | > 90% capacity | Email admin |
| Dead letter queue | > 10 jobs/hour | > 50 jobs/hour | Email admin |
| Anthropic monthly spend | 80% of cap ($400) | 90% of cap ($450) | Email / circuit breaker |
| Circuit breaker trips | Any breaker opens | 3+ breakers open | Email admin |
| Data quarantine volume | > 50 records/day | > 200 records/day | Email admin |

**Alert destinations**: Configurable admin email list. Enterprise: custom Slack webhook.

### 16.5 — Logging Strategy

| Log Type | Destination | Retention | Purpose |
|----------|------------|-----------|---------|
| Worker execution | `scrape_log` table | 90 days | Track every worker run: trigger, duration, status, cost |
| API requests | `api_usage_log` table | 90 days | Track every API call: endpoint, user, response time |
| Data validation failures | `data_quarantine` table | Until resolved | Track rejected data for review |
| Security events | `api_usage_log` (action = 'security_event') | 90 days | Cross-tenant access attempts, auth failures |
| Application errors | Railway logs | 30 days (Railway default) | Unhandled exceptions, stack traces |
| BullMQ job history | Redis (BullMQ built-in) | 1000 completed / 5000 failed | Job execution history |

### 16.6 — Backup & Disaster Recovery

`✓ FIXED: T-10`

| Component | Strategy | Frequency | Retention |
|-----------|---------|-----------|-----------|
| PostgreSQL | Supabase automatic backups + PITR | Continuous (WAL) | 7 days |
| Redis | Railway RDB snapshots | Hourly | 24 hours |
| App code | GitHub repository | Every commit | Indefinite |
| Environment vars | Railway encrypted env | On change | Current only |

**Recovery Targets**:
- **RTO**: 4 hours (full service restoration)
- **RPO**: 1 hour (maximum data loss)

**Recovery Procedures**:

| Scenario | Procedure | Estimated Time |
|----------|----------|---------------|
| DB corruption | Supabase PITR to last clean state | 1–2 hours |
| Redis data loss | Ephemeral cache — rebuild from DB. Budgets reset. Queues re-enqueue from scrape_schedule. | 15 minutes |
| Railway outage | Deploy to backup Railway project (pre-configured) | 30 minutes |
| Supabase outage | No failover. Display maintenance page. Monitor status. | Dependent on Supabase |
| Accidental table drop | Supabase PITR | 1 hour |

### 16.7 — Data Retention & Cleanup

`✓ FIXED: T-13`

**Nightly cleanup job** (runs at 03:00 UTC):

```typescript
async function nightlyCleanup(tenantId: string) {
    const deletions = {
        scrape_log: await deleteOlderThan('scrape_log', tenantId, 90),
        api_usage_log: await deleteOlderThan('api_usage_log', tenantId, 90),
        notifications: await deleteOlderThan('notifications', tenantId, 30),
        trend_scores: await deleteOlderThan('trend_scores', tenantId, 90),
        predictive_signals: await deleteOlderThan('predictive_signals', tenantId, 90),
        data_quarantine: await deleteResolvedOlderThan('data_quarantine', tenantId, 30),
        processed_webhooks: await deleteOlderThan('processed_webhooks', null, 30)
    }

    await logToScrapeLog({
        worker_name: 'nightly_cleanup',
        trigger_type: 'system',
        status: 'success',
        records_processed: Object.values(deletions).reduce((a, b) => a + b, 0)
    })
}
```

---
