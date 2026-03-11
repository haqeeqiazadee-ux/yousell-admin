# Database Schema

**Last Updated:** 2026-03-11
**Database:** Supabase (PostgreSQL)

---

## Existing Tables (Already in Supabase)

- `products` — Main product catalog
- `creators` — Influencer/creator profiles
- `scans` — Scan history records
- `notifications` — User notifications
- `profiles` — User profiles (auth)

## Tables To Be Created

### product_clusters
Cross-platform product deduplication.
```
id UUID PK
canonical_name TEXT
category TEXT
platforms TEXT[]
product_ids UUID[]
trend_score NUMERIC
first_seen_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

### videos
Video analytics from TikTok, YouTube, etc.
```
id UUID PK
platform TEXT
external_id TEXT
creator_id UUID FK → creators
title TEXT
views BIGINT
likes BIGINT
comments BIGINT
shares BIGINT
engagement_velocity NUMERIC
product_ids UUID[]
is_ad BOOLEAN
published_at TIMESTAMPTZ
scraped_at TIMESTAMPTZ
```

### shops
Ecommerce store tracking.
```
id UUID PK
platform TEXT
external_id TEXT
name TEXT
url TEXT
revenue_estimate NUMERIC
product_count INT
growth_rate NUMERIC
top_product_ids UUID[]
creator_collaborations UUID[]
first_seen_at TIMESTAMPTZ
last_scanned_at TIMESTAMPTZ
```

### ads
Ad campaign tracking.
```
id UUID PK
platform TEXT
external_id TEXT
advertiser_name TEXT
creative_url TEXT
landing_page TEXT
product_id UUID
spend_estimate NUMERIC
impressions_estimate BIGINT
is_scaling BOOLEAN
first_seen_at TIMESTAMPTZ
last_seen_at TIMESTAMPTZ
```

### creator_product_match
Creator-product fit scoring.
```
id UUID PK
creator_id UUID
product_id UUID
match_score NUMERIC
videos_count INT
estimated_sales NUMERIC
created_at TIMESTAMPTZ
```

### trend_snapshots
Daily velocity snapshots for trend detection.
```
id UUID PK
product_id UUID
snapshot_date DATE
view_velocity NUMERIC
creator_count INT
store_count INT
ad_count INT
engagement_rate NUMERIC
trend_score NUMERIC
```

### job_schedules
Configurable job timing.
```
id UUID PK
job_type TEXT UNIQUE
interval_minutes INT
is_enabled BOOLEAN
last_run_at TIMESTAMPTZ
next_run_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### worker_health
Worker monitoring.
```
id UUID PK
worker_name TEXT UNIQUE
status TEXT (running/stopped/error)
last_heartbeat TIMESTAMPTZ
jobs_completed INT
jobs_failed INT
error_message TEXT
```

## Entity Relationship Graph

```
Creator
  ↓ (creates)
Video
  ↓ (features)
Product
  ↓ (sold in)           ↓ (clustered with)
Shop                 ProductCluster
  ↓ (on)                ↓ (tracked by)
Platform             TrendSnapshot
  ↓ (advertised via)
Ad
```
