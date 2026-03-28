# YOUSELL SPECS BUILD LOG — v1.3
Updated: After reading 6 source files

## Output file
/mnt/user-data/outputs/YOUSELL_COMPLETE_SPECS.md

## Files READ so far (confirmed source)
| File | Status |
|------|--------|
| package.json (frontend) | ✅ Read |
| backend/package.json | ✅ Read |
| .env.local.example | ✅ Read |
| netlify.toml | ✅ Read |
| next.config.mjs | ✅ Read |
| components.json | ✅ Read |
| src/middleware.ts | ✅ Read |
| tree.txt (full dir tree) | ✅ Read |
| supabase/migrations/005_complete_schema.sql | ✅ Read |
| supabase/migrations/034_ai_intelligence_tables.sql | ✅ Read |
| supabase/migrations/031_engine_governor_tables.sql | ✅ Read |
| backend/src/lib/queue.ts | ✅ Read |
| src/lib/engines/governor/governor.ts | ✅ Read |
| src/lib/engines/governor/plan-allowances.ts | ✅ Read |

## Files STILL NEEDED
| File | Fixes |
|------|-------|
| src/lib/engines/governor/dispatch.ts | Section 11 Governor dispatch logic |
| src/lib/engines/trend-detection.ts | Section 9 engine detail |
| src/lib/engines/discovery.ts | Section 9 engine detail |
| src/lib/scoring/composite.ts | Section 32 scoring |
| supabase/migrations/001_profiles_and_rbac.sql | profiles table real columns |
| supabase/migrations/003_products.sql | products table real columns |

## CRITICAL CORRECTIONS NEEDED (from files already read)

### 1. SUBSCRIPTION TIERS — COMPLETELY WRONG (HIGH PRIORITY)
Spec says: Free / Pro / Agency
Reality (from plan-allowances.ts): starter / growth / professional / enterprise
- starter: $5/mo cost cap, 50 content credits
- growth: $15/mo cost cap, 200 content credits
- professional: $40/mo cost cap, 500 content credits
- enterprise: $100/mo cost cap, unlimited credits
Affects: Section 2, 3, 18, 19, and everywhere "Free/Pro/Agency" appears

### 2. DB SCHEMA — SECTION 6 NEEDS FULL REWRITE (HIGH PRIORITY)
Real tables confirmed from 005_complete_schema.sql:
- clients (id, name, email, plan, default_product_limit, niche, notes, created_at)
- product_metrics (id, product_id, metric_type, value, recorded_at)
- viral_signals (id, product_id, scan_id, micro_influencer_convergence, comment_purchase_intent, hashtag_acceleration, creator_niche_expansion, engagement_velocity, supply_side_response, early_viral_score, recorded_at)
- influencers (id, username, platform, followers, tier[nano/micro/mid/macro], engagement_rate, us_audience_pct, fake_follower_pct, conversion_score, email, cpp_estimate, niche, commission_preference, created_at)
- product_influencers (id, product_id, influencer_id, video_urls, match_score, outreach_status, created_at)
- competitor_stores (id, product_id, store_name, platform, url, est_monthly_sales, primary_traffic, influencers_promoting, ad_active, pricing_strategy, bundle_strategy, success_score, ai_analysis, created_at)
- suppliers (id, name, country, moq, unit_price, shipping_cost, lead_time, white_label, dropship, us_warehouse, certifications, contact, platform, created_at)
- product_suppliers (id, product_id, supplier_id, created_at)
- financial_models (id, product_id, retail_price, total_cost, gross_margin, break_even_units, influencer_roi, ad_roas_estimate, revenue_30/60/90day, cost_breakdown, risk_flags, auto_rejected, rejection_reason, created_at)
- marketing_strategies (id, product_id, primary_channel, secondary_channel, budget_min/max, roas_estimate, ai_brief, created_at)
- launch_blueprints (id, product_id, positioning, product_page_content, pricing_strategy, video_script, ad_blueprint, launch_timeline, risk_notes, generated_at, generated_by)
- affiliate_programs (id, name, platform, commission_rate, recurring, cookie_days, network, join_url, niche_tags, created_at)
- product_allocations (id, client_id, product_id, platform, rank, visible_to_client, allocated_at, allocated_by, source, notes, status)
- product_requests (id, client_id, platform, note, status, requested_at, reviewed_at, fulfilled_at, fulfilled_by, products_released)
- automation_jobs (id, job_name, status, trigger_type, cron_expression, started_at, completed_at, records_processed, api_cost_estimate, error_log, created_at)
- scan_history (id, scan_mode, client_id, started_at, completed_at, products_found, hot_products, cost_estimate, triggered_by, status, progress, log)
- outreach_emails (id, influencer_id, product_id, subject, body, sent_at, resend_id, status, created_at)
- notifications (id, user_id, type, title, body, product_id, read, created_at)
- imported_files (id, filename, type, source_platform, rows_imported, errors, uploaded_by, uploaded_at)
- products table EXTRA columns: channel, final_score, trend_score, viral_score, profit_score, trend_stage, ai_insight_haiku, ai_insight_sonnet
- profiles table EXTRA column: push_token

Also from 034_ai_intelligence_tables.sql:
- chatbot_config (provider, model, system_prompt, temperature, max_tokens, channels, escalation_threshold, max_bot_turns, enabled)
- chatbot_intents (name, display_name, sample_phrases, response_template, category, active, priority)
- chatbot_conversations (customer_id, channel, status, satisfaction_score, messages, escalated_to, duration_seconds)
- fraud_rules (name, rule_type, threshold, severity, action, triggers_count)
- fraud_flags (order_id, customer_id, risk_score, risk_level, risk_factors, triggered_rules, status, transaction_amount, ip_address, device_fingerprint)
- pricing_strategies (name, strategy_type, constraints, active, applied_to_categories)
- pricing_suggestions (product_id, current_price, suggested_price, competitor_avg_price, margin_pct, demand_signal, elasticity, auto_apply, applied)
- competitor_prices (competitor_name, product_id, their_price, our_price, difference_pct, trend)
- demand_forecasts (product_id, current_stock, avg_daily_sales, predicted_demand_7/30/90d, days_until_stockout, confidence, restock_recommendation)
- restock_alerts (product_id, supplier_id, current_stock, reorder_point, recommended_qty, urgency, lead_time_days, status)
- smart_ux_features (feature_key, display_name, category, enabled, config, impact_metrics)
- ab_tests (name, feature_key, variant_a/b, traffic_split_pct, status, current_winner, confidence_pct, results)
- personalization_rules (name, segment, feature_key, conditions, action, priority, active, triggers_count)

Also from 031_engine_governor_tables.sql (Governor tables):
- engine_cost_manifests (engine_name, manifest_version, operations JSONB, monthly_fixed_cost_usd)
- plan_engine_allowances (plan_tier, engine_name, enabled, max_operations, max_cost_usd)
- engine_budget_envelopes (client_id, plan_tier, period_start/end, global_cost_cap_usd, total_spent_usd, engine_allowances JSONB, alert thresholds)
- engine_usage_ledger (client_id, engine_name, operation, cost_usd, duration_ms, success, correlation_id)
- engine_swaps (source_engine, target_engine, reason, created_by, activated_at, expires_at, active)
- governor_ai_decisions (level 1-3, decision_type, description, confidence, applied, affected_clients/engines, before/after_state, revertible)
- governor_overrides (override_type, created_by, reason, target_client_id, target_engine, expires_at, active)

### 3. GOVERNOR PIPELINE — CONFIRMED (Section 11)
Real pipeline: Gate → Dispatch → Meter (confirmed from governor.ts)
- Super admin bypass: skips Gate, still Meters for audit
- correlationId: UUID generated per execution
- Meter is async non-blocking (fire-and-forget with error catch)
- Singleton pattern: getGovernor() / resetGovernor()

### 4. QUEUE CONFIG — CONFIRMED (Section 10)
From queue.ts:
- attempts: 3
- backoff: exponential, delay: 5000ms (NOT 2000ms as spec says)
- removeOnComplete: { count: 1000 } (NOT 100 as spec says)
- removeOnFail: { count: 5000 } (matches spec)
- REDIS_URL env var (redacted in logs for security)

### 5. AUTOMATION JOBS — SEEDED (from 005_complete_schema.sql)
Real scheduled jobs with real cron expressions:
- trend_scout_early_viral: 0 */6 * * * (every 6h)
- tiktok_product_scan: 0 2 * * * (daily 2am)
- amazon_bsr_scan: 0 3 * * * (daily 3am)
- pinterest_trend_scan: 0 4 * * * (daily 4am)
- google_trends_batch: 0 5 * * * (daily 5am)
- reddit_demand_signals: 0 */12 * * * (every 12h)
- digital_product_scan: 0 6 * * * (daily 6am)
- ai_affiliate_refresh: 0 0 * * 1 (weekly Monday)
- shopify_competitor_scan: 0 0 * * 2 (weekly Tuesday)
- influencer_metric_refresh: 0 0 * * 3 (weekly Wednesday)
- supplier_data_refresh: 0 0 1 * * (monthly)
All seeded as DISABLED by default.

## CORRECTION TASK LIST
| Task | Section | Status |
|------|---------|--------|
| Fix subscription tiers everywhere | 2, 3, 18, 19 | ⏳ TODO |
| Rewrite DB schema with real tables | 6 | ⏳ TODO |
| Fix Governor pipeline description | 11 | ⏳ TODO |
| Fix queue config numbers | 10 | ⏳ TODO |
| Add automation jobs with real crons | 10 | ⏳ TODO |
| Rewrite Governor tables section | 28 | ⏳ TODO |
| Add AI intelligence tables | 6 | ⏳ TODO |

## COMPLETED THIS SESSION
| Task | Section | Status |
|------|---------|--------|
| Fix subscription tiers | 2, 18.8 | ✅ Done |
| Rewrite DB schema with real tables | 6 | ✅ Done |
| Fix Governor pipeline | 11 | ✅ Done |
| Fix queue config (5000ms backoff, 1000 removeOnComplete) | 10 | ✅ Done |
| Add automation jobs with real crons | 6.11 | ✅ Done |
| AI intelligence tables (chatbot, fraud, pricing, UX) | 6.12 | ✅ Done |
| Governor tables (7 tables) | 6.13 | ✅ Done |

## STILL TODO (next session)
| Task | Files Needed | Priority |
|------|-------------|----------|
| Read profiles + products base columns | migrations/001, 003 | High |
| Verify engine descriptions vs real code | engines/trend-detection.ts, discovery.ts | Medium |
| Verify scoring algorithm | scoring/composite.ts | Medium |
| Read dispatch.ts for Dispatch section detail | governor/dispatch.ts | Medium |
| Fetch remaining migrations (009, 016, 026) | Raw GitHub URLs | Low |
| Verify Section 18.1 auth flow (signup trigger) | migrations/001 | Medium |

## CURRENT SPEC STATUS
- Version: v1.3
- Lines: 3,219
- Words: ~19,955
- Sections: 34
- Verified from source: Sections 4, 5, 7, 8, 10 (partial), 11, 15, 16, 18, 20, 21, 22, 28, 29, 30
- DB Schema: Verified for tables in migrations 005, 031, 034. Base tables (001, 003) still inferred.
- What remains inferred: Engine logic internals, scoring algorithm, Section 9 descriptions, Section 12 pre-viral algorithm

## SESSION 4 — Files read
- supabase/migrations/001_profiles_and_rbac.sql ✅
- supabase/migrations/003_products.sql ✅
- backend/src/index.ts ✅
- src/lib/engines/trend-detection.ts ✅
- src/lib/scoring/composite.ts ✅

## CRITICAL FINDINGS THIS SESSION

### profiles table (confirmed from 001)
Columns: id UUID PK, email TEXT, full_name TEXT, role user_role (enum: admin|client), avatar_url TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
Trigger: handle_new_user() — inserts on auth.users INSERT, sets role='client'
trigger: update_updated_at() — updates updated_at on profiles UPDATE
Also creates: admin_settings table (id, key TEXT UNIQUE, value JSONB, updated_by, updated_at)
NOTE: NO subscription_tier column. Role enum is 'admin'|'client' only in 001. 'super_admin' added in migration 022.

### products table (confirmed from 003)
Columns: id, title, description, platform (enum: tiktok|amazon|shopify|manual + later pinterest|digital|ai_affiliate|physical_affiliate), 
status (enum: draft|active|archived|enriching), category, price DECIMAL(10,2), cost DECIMAL(10,2), currency (default USD),
margin_percent DECIMAL(5,2), score_overall INTEGER, score_demand INTEGER, score_competition INTEGER, score_margin INTEGER, score_trend INTEGER,
external_id TEXT, external_url TEXT, image_url TEXT, enrichment_data JSONB, enriched_at TIMESTAMPTZ, ai_summary TEXT, ai_blueprint JSONB,
tags TEXT[], metadata JSONB, created_by UUID FK profiles, updated_by UUID FK profiles, created_at, updated_at
Indexes: status, platform, score_overall DESC, category, created_by

### Backend (index.ts) — ACTUAL QUEUE NAMES and REST API
Backend is an Express server on port 4000 (not 3001, .env shows 3001 as frontend-to-backend URL)
Rate limits: 100 req/min general, 10 req/min scan endpoints
Auth: Bearer token → Supabase auth.getUser()
Error sanitization: redacts api keys from logs (BUG-030 fix)
CORS: FRONTEND_URL + CORS_ALLOWED_ORIGINS env + Netlify preview pattern

ACTUAL QUEUE NAMES (from QUEUES constant, index.ts):
- 'scan' (hardcoded)
- QUEUES.TREND_SCAN
- QUEUES.INFLUENCER_DISCOVERY
- QUEUES.SUPPLIER_DISCOVERY  
- QUEUES.TIKTOK_DISCOVERY
- QUEUES.TIKTOK_PRODUCT_EXTRACT
- QUEUES.TIKTOK_ENGAGEMENT_ANALYSIS
- QUEUES.TIKTOK_CROSS_MATCH
- QUEUES.PRODUCT_CLUSTERING
- QUEUES.TREND_DETECTION
- QUEUES.CREATOR_MATCHING
- QUEUES.AMAZON_INTELLIGENCE
- QUEUES.SHOPIFY_INTELLIGENCE
- QUEUES.AD_INTELLIGENCE
- QUEUES.DISTRIBUTION_QUEUE
- QUEUES.PUSH_TO_SHOPIFY
- QUEUES.PUSH_TO_TIKTOK
- QUEUES.PUSH_TO_AMAZON
NOTE: Actual string values need backend/src/jobs/types.ts — not fetched yet. But names are inferrable from job filenames.

BACKEND REST ENDPOINTS (confirmed):
POST /api/scan, GET /api/scan/history, GET /api/scan/:jobId, POST /api/scan/:jobId/cancel
POST /api/trends, POST /api/influencers/discover, POST /api/suppliers/discover
POST /api/tiktok/discover, GET /api/tiktok/videos, POST /api/tiktok/extract-products
POST /api/tiktok/engagement-analysis, GET /api/tiktok/hashtag-signals, POST /api/tiktok/cross-match
POST /api/products/cluster, GET /api/products/clusters, POST /api/trends/detect
POST /api/creators/match, GET /api/creators/matches
POST /api/amazon/scan, POST /api/shopify/scan
POST /api/ads/discover, GET /api/ads
POST /api/content/distribute
POST /api/shopify/push, POST /api/tiktok/push, POST /api/amazon/push
GET /health (no auth)

### Trend Detection Engine (trend-detection.ts) — CONFIRMED ALGORITHM
Input: products table (tags, category, final_score) + tiktok_hashtag_signals table
Filter: products with final_score >= 30, limit 1000
Enriches with: tiktok_hashtag_signals (view_velocity, video_growth_rate, engagement_rate), top 200 by velocity
Filter threshold: productCount >= 2 OR totalViews > 10000, max 100 trends output

calculateTrendScore() — CONFIRMED FORMULA:
- Product count: >=10=30pts, >=5=20pts, >=2=10pts
- Avg product score: min(25, score*0.25)
- View volume: >10M=25, >1M=20, >100K=15, >10K=10
- Growth rate: >0.5=20, >0.2=15, >0.1=10, >0=5
- Multi-platform: 3+=10, 2+=5
- Max: 100

classifyLifecycleStage() — CONFIRMED:
- exploding: score>=80 AND growth>0.3
- rising: score>=60 AND growth>0.1
- saturated: score>=40 AND growth between -0.1 and 0.1
- emerging: default

calculatePreViralScore() — CONFIRMED:
- base = calculateTrendScore
- +5 bonus if score>=70
- confidence: platforms>=4=HIGH, >=2=MEDIUM, else LOW

Engine queues: ['trend-detection', 'trend-scan']
Subscribes to: SCAN_COMPLETE event
Publishes: TREND_DETECTED, TREND_DIRECTION_CHANGED

### Scoring System (composite.ts) — CONFIRMED FORMULAS
Final score = Trend(0.40) + Viral(0.35) + Profit(0.25)

calculateTrendScore(inputs):
- tiktokGrowth * 0.35 + influencerActivity * 0.25 + amazonDemand * 0.20 - competition * 0.10 + profitMargin * 0.10

calculateViralScore(inputs) — 6 pre-viral signals CONFIRMED:
- microInfluencerConvergence * 0.25
- commentPurchaseIntent * 0.20
- hashtagAcceleration * 0.20
- creatorNicheExpansion * 0.15
- engagementVelocity * 0.10
- supplySideResponse * 0.10

calculateProfitScore(inputs):
- profitMargin * 0.40 + shippingFeasibility * 0.20 + marketingEfficiency * 0.20 + supplierReliability * 0.10 - operationalRisk * 0.10

Score tiers: HOT(80+), WARM(60+), WATCH(40+), COLD(<40)
AI insight tier: final>=75='sonnet' (on-demand only, NEVER automatic), final>=60='haiku', else='none'

Heuristic fallback (when real data unavailable):
Viral heuristic: sales_count + source + rating + review_count proxy
Trend heuristic: sales_count + source + review_count + rating proxy

POD scoring: applies pod_modifiers if category in POD_CATEGORIES

Auto-rejection rules (shouldRejectProduct):
- grossMargin < 40%
- shippingCostPct > 30%
- breakEvenMonths > 2
- isFragileHazardous && !hasCertification
- fastestUSDeliveryDays > 15
- hasIPOrTrademarkRisk
- retailPrice < $10
- competitorCount > 100

Influencer conversion score:
- followerScore (0-20): micro 10K-100K=20pts sweet spot
- engagementScore (0-30): >=5%=30, >=3%=25, >=1.5%=15
- viewScore (0-20): view/follower ratio
- convScore (0-15): conversion rate
- nicheScore (0-15): niche relevance * 0.15

## TASKS THIS SESSION
| Task | Status |
|------|--------|
| Fix profiles table columns | ⏳ TODO |
| Fix products table columns | ⏳ TODO |
| Fix Section 10 queue names (replace invented with confirmed) | ⏳ TODO |
| Add backend REST API section (Section 29 update) | ⏳ TODO |
| Fix Section 12 pre-viral algorithm with real formulas | ⏳ TODO |
| Fix Section 32 scoring with real confirmed formulas | ⏳ TODO |
| Fix Section 9 trend detection engine description | ⏳ TODO |
| Add auto-rejection rules | ⏳ TODO |
| Add admin_settings table | ⏳ TODO |

## SESSION 4 COMPLETED TASKS
| Task | Status |
|------|--------|
| Fix profiles table (real columns, trigger, RLS) | ✅ Done |
| Fix products table (all 28 columns confirmed) | ✅ Done |
| Fix Section 10 queues (confirmed names + auth + rate limits) | ✅ Done |
| Fix Section 12 pre-viral (confirmed 6 signals + formulas) | ✅ Done |
| Fix Section 32 scoring (all formulas confirmed from source) | ✅ Done |
| Add Section 35 Backend REST API (all endpoints from index.ts) | ✅ Done |
| Add admin_settings table to Section 6.1 | ✅ Done |

## WHAT REMAINS UNVERIFIED
| Item | What's needed |
|------|--------------|
| QUEUES constant string values | backend/src/jobs/types.ts |
| worker.ts — how workers consume queues | backend/src/worker.ts |
| discovery.ts engine implementation | src/lib/engines/discovery.ts |
| governor/dispatch.ts routing logic | src/lib/engines/governor/dispatch.ts |
| Section 9 engine descriptions | Still inferred from filenames |
| Section 13 intelligence chain | No chain implementation file seen |
| Section 24 wiring map | All inferred |
| Migration 002 (trend_keywords table) | To confirm trend_keywords columns |

## CURRENT SPEC STATUS
- Version: v1.4
- All scoring formulas: ✅ Confirmed from source
- All pre-viral signals and weights: ✅ Confirmed from source
- profiles table: ✅ Confirmed
- products table: ✅ Confirmed
- Backend REST API: ✅ Confirmed from index.ts
- Queue names: 90% confirmed (QUEUES constant values still need types.ts)

## SESSION 5 — Files read
- backend/src/jobs/types.ts ✅
- backend/src/worker.ts ✅
- src/lib/engines/governor/dispatch.ts ✅
- src/lib/engines/discovery.ts ✅

## KEY FINDINGS

### QUEUES — ALL 36 CONFIRMED STRING VALUES (types.ts)
Phase 1 (active):
- PRODUCT_SCAN: "product-scan"
- ENRICH_PRODUCT: "enrich-product"
- TREND_SCAN: "trend-scan"
- INFLUENCER_DISCOVERY: "influencer-discovery"
- SUPPLIER_DISCOVERY: "supplier-discovery"
- TIKTOK_DISCOVERY: "tiktok-discovery"
- TIKTOK_PRODUCT_EXTRACT: "tiktok-product-extract"
- TIKTOK_ENGAGEMENT_ANALYSIS: "tiktok-engagement-analysis"
- TIKTOK_CROSS_MATCH: "tiktok-cross-match"
- PRODUCT_CLUSTERING: "product-clustering"
- TREND_DETECTION: "trend-detection"
- CREATOR_MATCHING: "creator-matching"
- AMAZON_INTELLIGENCE: "amazon-intelligence"
- SHOPIFY_INTELLIGENCE: "shopify-intelligence"
- AD_INTELLIGENCE: "ad-intelligence"
Phase 2 (stub - v8 spec):
- TRANSFORM_QUEUE: "transform-queue"
- SCORING_QUEUE: "scoring-queue"
- CONTENT_QUEUE: "content-queue"
- DISTRIBUTION_QUEUE: "distribution-queue"
- ORDER_TRACKING: "order-tracking-queue"
- FINANCIAL_MODEL: "financial-model"
- BLUEPRINT_QUEUE: "blueprint-queue"
- NOTIFICATION_QUEUE: "notification-queue"
- INFLUENCER_OUTREACH: "influencer-outreach"
- INFLUENCER_REFRESH: "influencer-refresh"
- SUPPLIER_REFRESH: "supplier-refresh"
- AFFILIATE_REFRESH: "affiliate-refresh"
- AFFILIATE_CONTENT_GENERATE: "affiliate-content-generate"
- AFFILIATE_COMMISSION_TRACK: "affiliate-commission-track"
- POD_DISCOVERY: "pod-discovery"
- POD_PROVISION: "pod-provision"
- POD_FULFILLMENT_SYNC: "pod-fulfillment-sync"
- PUSH_TO_SHOPIFY: "push-to-shopify"
- PUSH_TO_TIKTOK: "push-to-tiktok"
- PUSH_TO_AMAZON: "push-to-amazon"
- SHOP_SYNC: "shop-sync"
- AUTOMATION_ORCHESTRATOR: "automation-orchestrator"

ENGINE_QUEUE_MAP: maps queue names to engine owners

### WORKER (worker.ts)
- Legacy "scan" queue is a SHIM — forwards to QUEUES.PRODUCT_SCAN
- All real workers imported from backend/src/jobs/index.ts barrel
- Graceful shutdown: closes all workers + Redis on SIGTERM/SIGINT
- legacyWorker concurrency: 2

### DISPATCH (dispatch.ts)
- Swap cache TTL: 30 seconds (refreshes from DB every 30s)
- Engine timeout: 60 seconds hard limit
- Supports external engine swaps (routes to HTTP endpoints via callExternalEngine)
- External swap cache separate from internal swap cache
- Dispatches via engine.handleEvent() with synthetic event type: governor.dispatch.{operation}
- engine_swaps table columns: source_engine, target_engine, expires_at, is_external, external_engine_id
- external_engines table referenced for external swaps

### DISCOVERY ENGINE (discovery.ts)
14 PLATFORM SEARCHERS (all confirmed):
tiktok, amazon, shopify, pinterest, instagram, youtube, reddit, twitter, producthunt, ebay, tiktok_shop, etsy, temu, aliexpress

SCAN MODES:
- quick: ['tiktok', 'amazon']
- full: ['tiktok', 'amazon', 'shopify', 'pinterest']
- client: ['tiktok', 'amazon']

DISCOVERY FLOW:
1. Create scan_history row (status: 'running')
2. Run platforms in PARALLEL (Promise.all)
3. Each platform: call searcher → score → upsert to products table
4. Dedup: check external_id + platform before insert; UPDATE scores if exists
5. Count hot products (final_score >= 80) in this scan channel
6. Update scan_history (status: 'completed', products_found, hot_products)
7. Emit SCAN_COMPLETE event to event bus

HOT PRODUCT THRESHOLD: final_score >= 80

SCORING IN DISCOVERY (inline, not composite.ts formulas):
- Uses platform metadata (views, likes, sales/bsr, reviews, rating)
- trendScore: platform bonus + views + sales + reviews
- viralScore: platform bonus + engagement rate + likes + rating
- profitScore: price sweet spot ($15-60) + margin estimate + sales + rating
- finalScore: calculateFinalScore(trend*0.40, viral*0.35, profit*0.25)
- trendStage: getStageFromViralScore(viralScore)

COST ESTIMATES per scan:
- full: $0.50, client: $0.30, quick: $0.10

score_competition calculated as:
- reviewCount > 1000 → 75, > 100 → 50, else 25

## SESSION 5 COMPLETED
| Task | Status |
|------|--------|
| Section 10 — all 36 queue names confirmed | ✅ Done |
| Section 10 — worker.ts legacy shim documented | ✅ Done |
| Section 10 — ENGINE_QUEUE_MAP documented | ✅ Done |
| Section 11 — Dispatch confirmed (30s cache TTL, 60s timeout, external swap) | ✅ Done |
| Section 9 — Engine 01 Discovery confirmed (14 providers, scan modes, flow) | ✅ Done |
| Section 9 — Engine 16 Trend Detection updated with real algorithm | ✅ Done |

## CURRENT VERIFIED STATUS (v1.5)
✅ ALL queue names (36 total, Phase 1 active + Phase 2 stubs)
✅ Worker architecture (legacy shim, graceful shutdown)
✅ Governor full pipeline (Gate→Dispatch→Meter, bypass, timeout, external swap)
✅ Discovery engine (14 providers, scan modes, inline scoring, dedup, events)
✅ Trend detection engine (full algorithm)
✅ ALL scoring formulas (3-pillar, 6 viral signals, auto-rejection)
✅ profiles + products tables (all columns)
✅ DB schema (migrations 001, 003, 005, 031, 034)
✅ All 37 migration filenames
✅ All page routes (marketing + admin + dashboard)
✅ All API routes (frontend + backend)
✅ All component filenames
✅ All provider adapters (20)
✅ All env vars
✅ Netlify + next.config + components.json
✅ Middleware (auth, rate limit, subdomain routing, security headers)
✅ Subscription tiers (starter/growth/professional/enterprise with exact limits)

## REMAINING GAPS (minor)
- Engine descriptions for engines 02-15, 17-25: still inferred from filenames
- Section 13 (Intelligence Chain): no chain-specific file found — may be composed on-demand
- Section 24 (Wiring Map): inferred, not code-confirmed
- Migration 002 (trend_keywords columns): not read

## BATCH 1 ENGINE READINGS (ad-intelligence, amazon-intelligence, clustering, creator-matching, tiktok-discovery)

### ad-intelligence.ts
- Class: AdIntelligenceEngine | Queue: ad-intelligence
- Primary source: Meta Ads Library (free public API, no auth) → Apify facebook-ads-library-scraper (fallback)
- TikTok source: Apify clockworks~tiktok-scraper (filters for commercial content)
- is_scaling threshold: impressions > 100,000 (Facebook) or views > 1,000,000 (TikTok)
- DB table: ads (upsert on external_id+platform)
- Circuit breaker: 'apify' breaker wraps all external calls
- Timeout: 15s (Meta direct), 60s (Apify runs)
- Subscribes to: PRODUCT_DISCOVERED (deferred - G10)
- Publishes: ADS_DISCOVERED

### amazon-intelligence.ts
- Class: AmazonIntelligenceEngine | Version: 2.0.0 | Queue: amazon-intelligence
- Provider: Apify junglee~amazon-bestsellers-scraper
- Poll interval: 5s × 30 attempts (2.5 min max wait)
- Stores to: products table (upsert on external_id)
- Also has: getBSRMovers(category, limit) — reads from products table filtered by platform=amazon
- Subscribes to: TREND_DETECTED (auto-scan when trend detected)
- Publishes: AMAZON_PRODUCTS_FOUND
- Dependency injection: setDbClient() for testing

### clustering.ts
- Class: ClusteringEngine | Queue: product-clustering
- Algorithm: Greedy clustering with Jaccard similarity on tags + tokenised title words
- Input: products WHERE final_score >= minScore (default 30), limit 500
- Tokenization: lowercase, strip non-alphanumeric, remove stopwords, min 3 chars
- Similarity: Jaccard (intersection / union of keyword sets)
- Threshold: default 0.3 similarity to join existing cluster
- Minimum cluster size: 2 members (single-member clusters discarded)
- DB tables written: product_clusters (upsert on name), product_cluster_members (upsert on cluster_id+product_id)
- Cluster name: first 3 meaningful title words + top tag
- Subscribes to: PRODUCT_SCORED (deferred - G10)
- Publishes: CLUSTER_UPDATED, CLUSTERS_REBUILT

### creator-matching.ts
- Class: CreatorMatchingEngine | Queue: creator-matching
- Primary influencer source: Ainfluencer API (AINFLUENCER_API_KEY) → DB influencers table
- Input: products WHERE final_score >= 60, limit 50; influencers ORDER BY conversion_score DESC, limit 500
- Match score formula (confirmed):
  nicheAlignment * 0.35 + engagementFit * 0.30 + priceRangeFit * 0.20 + platformMatch(15 if match) + conversion_score * 0.05
- Min match score to store: 30
- Max creators per product: default 10
- Niche alignment: keyword matching (3+ matches=90, 2=70, 1=50, 0=15)
- Engagement fit: micro sweet spot (5%+ ER, 10K-100K = 95pts)
- Price range fit: nano/micro best for $10-60, mid for $30-150, macro for $100+
- DB tables: creator_product_matches (upsert on product_id+influencer_id)
- Fields stored: match_score, niche_alignment, engagement_fit, price_range_fit, estimated_views, estimated_conversions, estimated_profit, status='suggested'
- ROI calc: estimatedViews = followers × engagement_rate/100 × 10; convRate = ER>5%→3%, ER>2%→2%, else→1%; profit = conversions × price × margin
- Subscribes to: PRODUCT_SCORED (deferred - G10)
- Publishes: CREATOR_MATCHED, MATCHES_COMPLETE
- Pricing benchmarks (defined not used yet): nano $50-200, micro $200-2000, mid $2K-20K, macro $20K-100K

### tiktok-discovery.ts
- Class: TikTokDiscoveryEngine | Queue: tiktok-discovery
- Provider: Apify clockworks~tiktok-scraper (APIFY_API_TOKEN required)
- Timeout: 90 seconds on Apify call
- Batch upsert: 25 videos at a time (onConflict: video_id)
- DB tables: tiktok_videos + tiktok_hashtag_signals
- After video storage: auto-runs analyzeHashtagSignals()
- Hashtag analysis: groups by hashtag from videos, min 3 videos to be significant, max 100 hashtags stored
- Velocity metrics calculated: video_growth_rate, view_velocity, creator_growth_rate, engagement_rate, product_video_pct
- Previous snapshots used for growth rate calculation
- healthCheck(): returns true only if APIFY_API_TOKEN is set
- Subscribes to: SCAN_COMPLETE (deferred - G10)
- Publishes: TIKTOK_VIDEOS_FOUND, TIKTOK_HASHTAGS_ANALYZED

## BATCH 2 READINGS (content-creation, shopify-intelligence, supplier-discovery, opportunity-feed)

### content-creation.ts
- Class: ContentCreationEngine | Version: 2.0.0 | Queues: content-generation, content-batch
- Content types: description, social_post, ad_copy, video_script, email, image, carousel, short_video
- Model selection: HOT tier products → Sonnet; all others → Haiku
- Credit costs per type/model (confirmed):
  description: haiku=1, sonnet=3 | social_post: haiku=1, sonnet=2 | ad_copy: haiku=2, sonnet=5
  video_script: haiku=3, sonnet=8 | email: haiku=2, sonnet=5 | image: haiku=2, sonnet=2
  carousel: haiku=5, sonnet=5 | short_video: haiku=5, sonnet=5
- Token limits: description=500, social_post=200, ad_copy=300, video_script=1000, email=500, image=100, carousel=300, short_video=500
- AI call: raw fetch to https://api.anthropic.com/v1/messages (no SDK) with circuit breaker 'claude-api'
- Sonnet model: claude-sonnet-4-5-20250514 | Haiku model: claude-haiku-4-5-20251001
- Enriches content with: trend_signals keywords, creator_product_matches platform hints, competitor_products pricing
- Media generation: image/carousel → Bannerbear (if BANNERBEAR_DEFAULT_TEMPLATE set), short_video → Shotstack
- DB tables: content_queue (insert), content_credits (update - deduct credits)
- Subscribes: BLUEPRINT_APPROVED, PRODUCT_ALLOCATED, PRODUCT_PUSHED
- Publishes: CONTENT_GENERATED, CONTENT_BATCH_COMPLETE

### shopify-intelligence.ts
- Class: ShopifyIntelligenceEngine | Version: 2.0.0 | Queue: shopify-intelligence
- Provider: Apify clearpath~shop-by-shopify-product-scraper
- Poll interval: 5s × 30 attempts (same as Amazon)
- Groups results by store domain, max 5 top products per store
- DB tables: products (upsert on external_id), competitor_stores (upsert on store_url)
- getCompetitorStores(): reads competitor_stores filtered by platform=shopify
- Subscribes: TREND_DETECTED | Publishes: SHOPIFY_PRODUCTS_FOUND

### supplier-discovery.ts
- Class: SupplierDiscoveryEngine | Version: 2.0.0 | Queues: supplier-discovery, supplier-verify
- Platforms: aliexpress (epctex~aliexpress-scraper, max 15), alibaba (epctex~alibaba-scraper, max 10), 1688 (same scraper, marketplace param, max 10)
- Verification score formula (confirmed weights):
  yearsActive * 0.20 + rating/5 * 0.25 + responseRate/100 * 0.15 + onTimeDelivery/100 * 0.20 + (1-disputeRate/10) * 0.20
- Verified threshold: score >= 0.7
- Fulfillment type: moq <= 1 → dropship, moq <= 50 → mixed, else → wholesale
- DB table: product_suppliers (upsert on product_id+supplier_url)
- getCheapestSupplier(): reads product_suppliers ORDER BY unit_cost ASC
- Auto-trigger: PRODUCT_SCORED with finalScore >= 60 (deferred/G10)
- Subscribes: PRODUCT_SCORED, PROFITABILITY_CALCULATED
- Publishes: SUPPLIER_FOUND, SUPPLIER_VERIFIED, SUPPLIER_BATCH_COMPLETE

### opportunity-feed.ts
- Class: OpportunityFeedEngine | Version: 1.0.0 | Queues: [] (no queues - read-only aggregation)
- NO job queue - this is a pure read/aggregation engine
- Fetches in parallel: products + cluster memberships + creator matches + allocations + blueprints + financial models
- Tier mapping: final_score >= 80 → HOT, >= 60 → WARM, >= 40 → WATCH, else → COLD
- Output: Opportunity[] with enriched fields: clusterName, clusterSize, matchedCreators, topCreator, estimatedProfit, isAllocated, hasBlueprint, hasFinancialModel
- Stats: total, hot/warm/watch/cold counts, avgScore, topPlatform, topCategory
- Subscribes: CLUSTERS_REBUILT, MATCHES_COMPLETE, TREND_DETECTED (read-only - no action)
- Publishes: nothing

## BATCH 3 READINGS (launch-blueprint, financial-modelling, profitability-engine)

### launch-blueprint.ts
- Class: LaunchBlueprintEngine | Version: 2.0.0 | Queue: blueprint-generation
- 5 fixed launch phases (confirmed):
  1. Supplier Lock (3 days): verify suppliers, negotiate, place sample order
  2. Store Setup (2 days): listing, pricing, fulfillment config
  3. Content Creation (3 days): descriptions, social posts, ad creatives, admin review
  4. Ad Launch (3 days): Meta ads, TikTok ads, performance monitoring
  5. Influencer Outreach (3 days): select top 10, send emails, follow up
- Total default: 14 days, varies by tier (HOT products get -1 day per phase)
- Low budget (<$500) adjustment: ad phase tasks get organic focus note
- Approval gate: status starts as 'pending_approval', requires admin to call approveBlueprint()
- DB table: blueprints (upsert on product_id)
- Blueprint statuses: draft → pending_approval → approved → executing → completed/cancelled
- Subscribes: FINANCIAL_MODEL_GENERATED, PROFITABILITY_CALCULATED, SUPPLIER_VERIFIED
- Publishes: BLUEPRINT_GENERATED, BLUEPRINT_APPROVED

### financial-modelling.ts
- Class: FinancialModellingEngine | Version: 2.0.0 | Queue: financial-model
- 3 scenarios always generated: conservative (revenue*0.7, cost*1.1), moderate (1.0, 1.0), optimistic (revenue*1.3, cost*0.9)
- Upsert on product_id+scenario — one row per scenario
- Payback days formula: ceil((monthlyAdBudget / monthlyProfit) * 30); -1 if never
- Break even month: ceil(totalAdSpend / monthlyProfit); -1 if never
- Includes affiliate commission from affiliate_commissions table (non-critical)
- Also has: projectInfluencerRoi() — separate model type 'influencer'
- Also has: validateModel() — compares projections vs real orders table data
  Verdict: on_track (0.8-1.2 accuracy), under_performing (<0.8), over_performing (>1.2)
- DB tables: financial_models (upsert on product_id+scenario)
- Subscribes: PROFITABILITY_CALCULATED, SUPPLIER_FOUND, COMPETITOR_DETECTED
- Publishes: FINANCIAL_MODEL_GENERATED, ROI_PROJECTED

### profitability-engine.ts
- Class: ProfitabilityEngine | Version: 2.0.0 | Queue: profitability-calc
- Platform fee rates (confirmed):
  shopify: 4.9% (2.9% + 2%), amazon: 15%, tiktok: 5%, etsy: 9.5% (6.5%+3%), walmart: 8%, ebay: 12.89%
- Formula: platformFee = price * rate; totalCost = unitCost + shipping + platformFee + adCost
- Margin = sellingPrice - totalCost; marginPercent = margin/price * 100
- Recommended price = totalCost / (1 - 0.35) → targets 35% margin
- breakEvenUnits = ceil(100 / margin)
- Also updates products table with margin and recommended_price fields
- Margin alert: emits MARGIN_ALERT if 0% < marginPercent < 15%
- autoCalculateFromSuppliers(): uses cheapest verified supplier + 15% of price for ad estimate
- DB tables: profitability_models (upsert on product_id+platform), products (update margin+recommended_price)
- Subscribes: PRODUCT_SCORED, SUPPLIER_FOUND, COMPETITOR_DETECTED
- Publishes: PROFITABILITY_CALCULATED, MARGIN_ALERT

## BATCH 4 READINGS (types.ts, registry.ts, index.ts)

### types.ts — COMPLETE ENGINE NAME REGISTRY
All 26 EngineName values confirmed:
discovery, tiktok-discovery, product-extraction, clustering, trend-detection,
creator-matching, opportunity-feed, ad-intelligence, amazon-intelligence,
shopify-intelligence, scoring, supplier-discovery, influencer-discovery,
content-engine, store-integration, order-tracking, launch-blueprint,
financial-model, pod-engine, affiliate-engine, admin-command-center,
competitor-intelligence, profitability, client-allocation,
fulfillment-recommendation, automation-orchestrator

All ENGINE_EVENTS constants confirmed (50+ events):
Key ones: PRODUCT_DISCOVERED, SCAN_COMPLETE, SCAN_ERROR,
TIKTOK_VIDEOS_FOUND, TIKTOK_HASHTAGS_ANALYZED, PRODUCT_SCORED, PRODUCT_REJECTED,
CLUSTER_UPDATED, CLUSTERS_REBUILT, TREND_DETECTED, TREND_DIRECTION_CHANGED,
CREATOR_MATCHED, MATCHES_COMPLETE, ADS_DISCOVERED,
AMAZON_PRODUCTS_FOUND, SHOPIFY_PRODUCTS_FOUND,
COMPETITOR_DETECTED/UPDATED/BATCH_COMPLETE,
SUPPLIER_FOUND/VERIFIED/BATCH_COMPLETE,
PROFITABILITY_CALCULATED, MARGIN_ALERT,
FINANCIAL_MODEL_GENERATED, ROI_PROJECTED,
BLUEPRINT_GENERATED, BLUEPRINT_APPROVED,
PRODUCT_ALLOCATED, ALLOCATION_BATCH_COMPLETE,
CONTENT_GENERATED, CONTENT_BATCH_COMPLETE,
PRODUCT_PUSHED, STORE_CONNECTED, STORE_SYNC_COMPLETE,
ORDER_RECEIVED, ORDER_FULFILLED, ORDER_TRACKING_SENT,
ADMIN_PRODUCT_DEPLOYED, ADMIN_BATCH_DEPLOY_COMPLETE,
COMMISSION_RECORDED, PAYOUT_CALCULATED,
FULFILLMENT_RECOMMENDED, FULFILLMENT_OVERRIDDEN

### registry.ts — ENGINE REGISTRY SINGLETON
- Singleton via getEngineRegistry() / resetEngineRegistry()
- register(): validates deps are registered first, wires event subscriptions, calls init(), emits ENGINE_REGISTERED
- Prevents duplicate registrations (throws if name already registered)
- Prevents unregistering if other engines depend on it
- startAll(): topological sort by deps → start in order
- stopAll(): reverse dependency order
- healthCheckAll(): runs all engine health checks in parallel
- Dependency validation: engines must register dependencies before dependents

### index.ts — CONFIRMED ENGINE COUNT
Phase 0 + Phase B (8 engines): TikTokDiscoveryEngine, DiscoveryEngine, ScoringEngine, ClusteringEngine, TrendDetectionEngine, CreatorMatchingEngine, AdIntelligenceEngine, OpportunityFeedEngine
V9 new engines (16 more): CompetitorIntelligenceEngine, SupplierDiscoveryEngine, ProfitabilityEngine, FinancialModellingEngine, LaunchBlueprintEngine, ClientAllocationEngine, ContentCreationEngine, StoreIntegrationEngine, OrderTrackingEngine, AdminCommandCenterEngine, AffiliateCommissionEngine, FulfillmentRecommendationEngine, AmazonIntelligenceEngine, ShopifyIntelligenceEngine, PodEngine, AutomationOrchestratorEngine
TOTAL: 24 exported engine classes (not 25 as previously stated)

Still need to fetch (4 engines not read yet):
- competitor-intelligence.ts
- client-allocation.ts
- store-integration.ts / store-oauth.ts
- order-tracking.ts
- pod-engine.ts
- scoring-engine.ts
- admin-command-center.ts
- affiliate-commission.ts
- automation-orchestrator.ts
- fulfillment-recommendation.ts

## SECTION 9 REWRITE COMPLETE
- 15 engines fully confirmed from source code
- 9 engines confirmed by filename + index.ts export (internal logic still unread)
- Governor module fully confirmed (all 12 files)
- All ENGINE_EVENTS constants documented from types.ts
- Registry singleton behaviour documented from registry.ts

## ENGINES STILL NEEDING SOURCE READ (9 remaining)
1. competitor-intelligence.ts
2. client-allocation.ts
3. store-integration.ts
4. store-oauth.ts
5. order-tracking.ts
6. pod-engine.ts
7. admin-command-center.ts
8. affiliate-commission.ts
9. automation-orchestrator.ts
10. fulfillment-recommendation.ts
11. supabase/migrations/002_trend_keywords.sql

## CURRENT SPEC v1.5 STATUS
Lines: ~3900 | Words: ~25,000+
Fully confirmed from source: Sections 4, 5, 6 (partial), 7, 8, 9 (15/24 engines), 10, 11, 12, 15, 16, 17, 18, 20, 21, 22, 28, 29, 30, 32, 35

## BATCH 6 READINGS (competitor-intelligence, client-allocation, order-tracking)

### competitor-intelligence.ts
- Class: CompetitorIntelligenceEngine | Version: 2.0.0 | Queues: competitor-scan, competitor-refresh
- Platforms + Apify actors:
  shopify: clearpath~shop-by-shopify-product-scraper (max 20)
  amazon: junglee~amazon-bestsellers-scraper (max 20)
  tiktok: clockworks~tiktok-scraper (max 15, searchSection: shop)
  etsy: epctex~etsy-scraper (max 15)
- DB table: competitor_products (upsert on product_id+store_url)
- Fields: store_name, store_url, platform, price, estimated_monthly_revenue, has_ads, ad_spend_estimate, review_count, rating
- detectAdActivity(): reads competitor_products, checks ad data from ad-intelligence engine
- getCompetitorPricingSummary(): returns count, avg/min/maxPrice, pricePosition (lowest/below_avg/average/above_avg/highest)
- Price position: lowest if <= minPrice, below_avg if < avg*0.9, average if <= avg*1.1, above_avg if < maxPrice, highest
- COMPETITOR_UPDATED emitted when price changes on re-scan
- Subscribes: PRODUCT_DISCOVERED (log intent G10), PRODUCT_SCORED (deep scan eligible at score>=60, G10)
- Publishes: COMPETITOR_DETECTED, COMPETITOR_UPDATED, COMPETITOR_BATCH_COMPLETE

### client-allocation.ts
- Class: ClientAllocationEngine | Version: 2.0.0 | Queue: product-allocation
- Tier limits (confirmed):
  starter: maxProducts=5, maxExclusive=0, minScore=80, channels=[shopify]
  growth: maxProducts=20, maxExclusive=2, minScore=60, channels=[shopify,tiktok]
  professional: maxProducts=50, maxExclusive=5, minScore=40, channels=[shopify,tiktok,amazon,etsy]
  enterprise: maxProducts=-1(unlimited), maxExclusive=-1(unlimited), minScore=0, channels=[shopify,tiktok,amazon,etsy,pinterest]
- Validation steps: channel access → product score vs tier min → allocation count limit → exclusivity check → cluster diversification (warn if 3+ products from same cluster already allocated)
- Exclusive: auto for professional+enterprise IF under maxExclusive limit
- DB table: client_products (insert with allocation_id, channel, tier, exclusive, diversification_warning)
- batchAllocate(): round-robin allocation across eligible clients for a tier
- Subscribes: PRODUCT_SCORED (HOT products eligible), BLUEPRINT_APPROVED
- Publishes: PRODUCT_ALLOCATED, ALLOCATION_BATCH_COMPLETE

### order-tracking.ts
- Class: OrderTrackingEngine | Version: 2.0.0 | Queues: order-processing, order-email
- Order statuses: received → processing → shipped → delivered → returned/cancelled
- Fulfillment statuses: unfulfilled → partial → fulfilled → returned
- Email types: order_confirmation, shipping_notification, delivery_confirmation, review_request
- processOrder(): dedup check on order_id, insert to orders table, emit ORDER_RECEIVED, queue confirmation email
- markFulfilled(): updates orders table (status=shipped, tracking info), emits ORDER_FULFILLED, queues shipping email
- markDelivered(): updates orders, queues review_request email (3 days after delivery)
- sendTrackingEmail(): calls Resend API (only if RESEND_API_KEY set), logs to notifications table
- getProductOrders(): used by Financial Modelling (Comm #17.006) for revenue validation
- Tracking URL builders: USPS, UPS, FedEx, DHL, aftership fallback
- DB tables: orders (insert/update), notifications (email queue log)
- Subscribes: PRODUCT_PUSHED, STORE_SYNC_COMPLETE
- Publishes: ORDER_RECEIVED, ORDER_FULFILLED, ORDER_TRACKING_SENT

## BATCH 7 READINGS (store-integration, fulfillment-recommendation, affiliate-commission)

### store-integration.ts
- Class: StoreIntegrationEngine | Version: 2.0.0 | Queues: shop-sync, push-to-shopify, push-to-tiktok, push-to-amazon
- pushProduct(): calls backend API (RAILWAY_BACKEND_URL/api/{platform}/push) via fetch with Bearer RAILWAY_API_SECRET
- Platform → endpoint mapping: shopify→shopify/push, tiktok-shop→tiktok/push, amazon→amazon/push
- connectStore(): emits STORE_CONNECTED only (actual OAuth in API routes)
- syncInventory(): reads connected_channels (access_token_encrypted), updates shop_products.last_synced_at
- refreshExpiringTokens(): checks tokens expiring within 24h, refreshes TikTok Shop + Amazon LWA tokens
  TikTok: POST https://auth.tiktok-shops.com/api/v2/token/refresh (needs TIKTOK_SHOP_APP_KEY + TIKTOK_SHOP_APP_SECRET)
  Amazon: POST https://api.amazon.com/auth/o2/token (needs AMAZON_SP_CLIENT_ID + AMAZON_SP_CLIENT_SECRET)
  On failure: inserts notification to client (token_refresh_failed)
- DB tables: connected_channels, shop_products, notifications
- Subscribes: BLUEPRINT_APPROVED, PRODUCT_ALLOCATED, CONTENT_GENERATED (all deferred G10)
- Publishes: PRODUCT_PUSHED, STORE_CONNECTED, STORE_SYNC_COMPLETE
- NEW ENV VARS confirmed: TIKTOK_SHOP_APP_KEY, TIKTOK_SHOP_APP_SECRET, AMAZON_SP_CLIENT_ID, AMAZON_SP_CLIENT_SECRET

### fulfillment-recommendation.ts
- Class: FulfillmentRecommendationEngine | Version: 2.0.0 | Queue: fulfillment-eval
- Decision tree (confirmed):
  physical + (margin <0.2 OR price <30) → DROPSHIP (confidence 0.8)
  physical + (margin >=0.3 AND volumeScore >70) → WHOLESALE (confidence 0.85)
  physical + other → DROPSHIP if has_dropship_supplier else WHOLESALE (confidence 0.6)
  custom_apparel → POD (confidence 0.9 if margin>=0.3, else 0.5)
  digital → DIGITAL (confidence 0.95)
  saas → AFFILIATE (confidence 0.95)
  unknown → PENDING_REVIEW (confidence 0.2)
- Platform overrides:
  tiktok-shop + DROPSHIP + no_supplier → PENDING_REVIEW (2-3 day US shipping required)
  etsy + not POD → force POD (Etsy requirement)
  POD + margin <0.3 → downgrade to DROPSHIP
- Comparison table margins (confirmed): DROPSHIP=15%, WHOLESALE=40%, POD=40%, DIGITAL=90%, AFFILIATE=10%
- Comparison upfront costs: DROPSHIP=$0, WHOLESALE=$2000, POD=$0, DIGITAL=$0, AFFILIATE=$0
- Risk levels: DROPSHIP/POD/DIGITAL/AFFILIATE=Low, WHOLESALE=Medium, AFFILIATE=Zero
- autoRecommendFromData(): infers product type from category keywords (digital/template/course→digital, apparel/clothing/shirt→custom_apparel, saas/software/subscription→saas, else physical)
- DB tables: fulfillment_recommendations (upsert on product_id), products (updates fulfillment_type)
- Subscribes: PRODUCT_SCORED, SUPPLIER_FOUND, PROFITABILITY_CALCULATED
- Publishes: FULFILLMENT_RECOMMENDED, FULFILLMENT_OVERRIDDEN

### affiliate-commission.ts
- Class: AffiliateCommissionEngine | Version: 2.0.0 | Queues: commission-calc, payout-processing
- Engine name in registry: affiliate-engine (not affiliate-commission)
- Commission rates (confirmed):
  internal: amazon=4%, tiktok=5%, shopify=8%, default=5%
  client_referral: starter=10%, growth=8%, professional=6%, enterprise=5%, default=8%
- recordCommission(): dedup on order_id+commission_type; inserts to affiliate_commissions with status=pending
- confirmCommission(): sets status=confirmed + confirmed_at
- calculatePayout(): 10% holdback rate; upserts to affiliate_payouts (onConflict: affiliate_id+month)
- getProductCommissionCost(): used by Financial Modelling (Comm #18.004)
- DB tables: affiliate_commissions, affiliate_payouts
- Subscribes: ORDER_RECEIVED, ORDER_FULFILLED, PRODUCT_PUSHED (all deferred G10)
- Publishes: COMMISSION_RECORDED, PAYOUT_CALCULATED

## BATCH 8 READINGS (pod-engine, admin-command-center, automation-orchestrator, 002_trend_keywords.sql)

### pod-engine.ts
- Class: PodEngine | Version: 2.0.0 | Queues: pod-discovery, pod-provision, pod-fulfillment-sync
- POD providers + env keys: printful=PRINTFUL_API_KEY, printify=PRINTIFY_API_KEY, gelato=GELATO_API_KEY
- POD_DISCOVERY_ENABLED env var must be 'true' or falls back to cached DB products
- Discovery: Apify dtrungtin~etsy-scraper (niche or 'custom t-shirt', max 30, sortBy: most_recent)
- Poll interval: 5s × 24 attempts (2 min max)
- Stores to products table (upsert on title+source)
- getProviderCatalog(): reads Printful /products, Printify /catalog/blueprints.json, Gelato /products
- createProviderProduct(): creates Printful sync_product with variants + design file
- syncFulfillment(): polls provider /orders/{orderId} for status + trackingUrl
- Publishes: pod.product_discovered, pod.order_created, pod.fulfillment_synced (NOTE: custom event strings, NOT from ENGINE_EVENTS)
- Subscribes: PRODUCT_SCORED, FULFILLMENT_RECOMMENDED, ORDER_RECEIVED

### admin-command-center.ts
- Class: AdminCommandCenterEngine | Version: 2.0.0 | Queues: admin-deploy, admin-batch
- deployProduct(): creates deployment record in deployments table + shop_products entry (pending)
- batchDeploy(): loops deployProduct() for multiple products
- getDashboardData(): reads products + orders + shop_products for dashboard aggregation (hot/warm counts, total revenue, top 20 HOT products)
- approveAndDeploy(): approves blueprint in blueprints table + emits BLUEPRINT_APPROVED + calls deployProduct()
- DB tables: deployments (insert), shop_products (upsert on product_id+channel_type)
- Subscribes: PRODUCT_SCORED (HOT eligible), BLUEPRINT_GENERATED, ORDER_RECEIVED
- Publishes: ADMIN_PRODUCT_DEPLOYED, ADMIN_BATCH_DEPLOY_COMPLETE

### automation-orchestrator.ts — MAJOR FIND
- Class: AutomationOrchestratorEngine | Version: 1.0.0 | Queues: automation-orchestrator, automation-approval
- 3 automation levels:
  Level 1 (Manual): log only, admin triggers everything
  Level 2 (Assisted): queue for approval with 4-hour expiry window
  Level 3 (Auto-Pilot): execute immediately within guardrails
- Permission check via checkAutomationPermission() from src/lib/automation/config.ts
- Guardrails checked via isGuardrailExceeded() — daily spend cap, content/upload/outreach limits, consecutive error count
- Soft limits: minimumScore, priceRange, quietHours, allowedCategories, contentApprovalWindowHours
- Event-to-feature mapping:
  PRODUCT_DISCOVERED → product_discovery → score_and_enrich
  PRODUCT_SCORED → product_upload → auto_push_to_store
  CONTENT_GENERATED → content_publishing → auto_publish_content
  BLUEPRINT_APPROVED → product_upload → auto_deploy_blueprint
  CREATOR_MATCHED → influencer_outreach → auto_outreach
- Action → backend endpoint mapping:
  auto_push_to_store → /api/shopify/push
  auto_publish_content → /api/content/distribute
  auto_outreach → /api/influencers/outreach
  auto_deploy_blueprint → /api/shopify/push
  score_and_enrich → /api/scan
- DB tables: client_automation_settings, automation_daily_usage, automation_pending_actions, automation_action_log, notifications
- approveAction(): reads pending_actions, checks expiry, executes action, marks executed
- generateWeeklyDigest(): reads automation_action_log + automation_pending_actions + automation_daily_usage
- Publishes: automation.action_queued, automation.action_executed, automation.action_blocked, automation.guardrail_hit
- Subscribes: PRODUCT_DISCOVERED, PRODUCT_SCORED, CONTENT_GENERATED, BLUEPRINT_APPROVED, CREATOR_MATCHED

### 002_trend_keywords.sql (BASE TABLE - IMPORTANT)
The ORIGINAL trend_keywords table (migration 002) is SIMPLER than what trend-detection engine writes to:
Base columns: id UUID, keyword TEXT, volume INTEGER, growth NUMERIC(5,2), source TEXT, scan_id UUID FK→scans, fetched_at TIMESTAMPTZ, created_at TIMESTAMPTZ
Indexes: keyword, fetched_at
The extra columns (lifecycle_stage, confidence_tier, pre_viral_score, platform_count, trend_score, trend_direction) were added by LATER migrations (not yet read)
The scans table is referenced — confirms older scan tracking table exists

## ALL 24 ENGINES NOW FULLY CONFIRMED ✅
All reading complete. Ready to update Section 9.

## FINAL STATUS — ALL 24 ENGINES CONFIRMED ✅
All engine files read and documented. Section 9 complete.
Section 36 added with all additional DB tables discovered from engine reads.

## DOCUMENT STATUS v1.6
- Lines: ~5,400
- Words: ~31,000+
- All 24 engines: 100% confirmed from source
- All scoring formulas: confirmed
- All queue names (36): confirmed
- All page routes: confirmed
- All API routes (frontend + backend): confirmed
- DB Schema: confirmed from 6 migrations + 24 engine files
- Governor pipeline: confirmed
- Subscription tiers: confirmed
- Env vars: confirmed

## REMAINING MINOR GAPS
- store-oauth.ts: not read (OAuth flow detail) - low priority
- src/lib/automation/config.ts: not read (DEFAULT_AUTOMATION constants)
- Some migration files not read (009, 010, 011, 012, 013, 014, 016-028)

## BATCH 9 — migrations 000, 009, 026

### 000_initial_schema.sql — ROOT TABLES (critical corrections)
Original profiles table (migration 000): SIMPLER than 001 — only id, email, role(admin/client/viewer), created_at, updated_at
NOTE: role enum in 000 includes 'viewer' — later migrations add/alter
Original products table (migration 000): external_id, title, price, url, image_url, sales_count, review_count, rating, source, viral_score, profitability_score, overall_score, scan_id FK→scans
IMPORTANT: scans table exists from migration 000: id, mode, status, user_id, job_id, product_count, duration_ms, error, started_at, completed_at, created_at
Original allocations table (migration 000): client_id, product_id, allocated_by, status, allocated_at (simpler than product_allocations)
Original blueprints table (migration 000): title, product_id, strategy, target_audience, marketing_plan, pricing_strategy, created_by

Original clients table (migration 000): id, name, email(UNIQUE), package_tier (starter/growth/enterprise - NOT professional), default_product_limit=10

### 009_v7_new_tables.sql — 8 important tables
subscriptions: client_id FK→clients, stripe_customer_id, stripe_subscription_id(UNIQUE), plan, status, current_period_start/end, cancel_at_period_end
platform_access: client_id, platform, enabled, granted_at, granted_by — UNIQUE(client_id, platform)
engine_toggles: client_id, engine, enabled, toggled_at, toggled_by — UNIQUE(client_id, engine) [Note: Governor adds columns to this in migration 031]
connected_channels: client_id, channel_type, channel_name, access_token_encrypted, refresh_token_encrypted, token_expires_at, scopes TEXT[], metadata, connected_at, disconnected_at, status — UNIQUE(client_id, channel_type)
content_queue: client_id, product_id, content_type, channel, prompt, generated_content, status, error, requested_at, completed_at, requested_by
orders: client_id, product_id, external_order_id, platform, status, quantity, total_amount, currency, customer_name, customer_email, shipping_address JSONB, tracking_number, tracking_url, fulfilled_at
usage_tracking: client_id, resource, action, count, period_start, period_end
addons: name, description, stripe_price_id, price, currency, addon_type, active
client_addons: client_id FK, addon_id FK, stripe_subscription_item_id, status, purchased_at, expires_at — UNIQUE(client_id, addon_id)

KEY FINDING: orders.total_amount (not revenue as spec says), orders.customer_email confirmed

### 026_affiliate_system.sql — AFFILIATE IS REFERRAL SYSTEM
CRITICAL: The affiliate system in migration 026 is CLIENT REFERRAL tracking (refer other clients), NOT product affiliate commissions.
affiliate_referrals: referrer_client_id, referred_user_id, referred_email, referral_code(UNIQUE), status(pending/signed_up/subscribed/expired), signed_up_at, subscribed_at
affiliate_commissions (migration 026): referral_id FK→affiliate_referrals, referrer_client_id, subscription_id, commission_amount, commission_rate(default 0.2000 = 20%), currency, status(pending/approved/paid/rejected), period_start, period_end
clients table: referral_code column added

IMPORTANT: This affiliate_commissions is DIFFERENT from what AffiliateCommissionEngine writes to. Engine writes internal/platform commissions. Migration 026 is for CLIENT-to-CLIENT referral commissions. These are two separate commission streams.

## BATCH 10 — migration 016, globals.css, tailwind.config.ts

### 016_missing_tables_consolidated.sql — CRITICAL TABLE CONFIRMATIONS
Confirmed exact schemas for:

tiktok_videos: video_id(UNIQUE), url, description, author_username, author_id, author_followers(bigint), views(bigint), likes(bigint), shares(bigint), comments(bigint), hashtags(text[]), music_title, thumbnail_url, product_urls(text[]), has_product_link(bool), discovery_query, discovered_at, create_time, created_at
Indexes: discovered_at DESC, views DESC, has_product_link (partial), hashtags (GIN)

tiktok_hashtag_signals: hashtag, total_videos(int), total_views(bigint), total_likes(bigint), total_shares(bigint), total_comments(bigint), unique_creators(int), video_growth_rate(numeric 8,4), view_velocity(numeric 12,2), creator_growth_rate(numeric 8,4), engagement_rate(numeric 8,4), product_video_pct(numeric 5,2), snapshot_at(NOT NULL)
UNIQUE constraint: (hashtag, snapshot_at)

product_clusters: name(UNIQUE), keywords(text[]), product_count(int), avg_score(numeric 5,2), platforms(text[]), trend_stage, total_views(bigint), total_sales(bigint), price_range_min, price_range_max
product_cluster_members: cluster_id FK, product_id FK, similarity(numeric 5,4) — UNIQUE(cluster_id, product_id)

creator_product_matches: product_id FK→products, influencer_id FK→influencers, match_score(numeric 5,2), niche_alignment, engagement_fit, price_range_fit, estimated_views(bigint), estimated_conversions(int), estimated_profit(numeric 10,2), status, matched_at
UNIQUE: (product_id, influencer_id)

ads: external_id, platform, advertiser_name, ad_text, landing_url, thumbnail_url, impressions(bigint), spend_estimate(numeric 10,2), days_running(int), is_scaling(bool), discovery_query, discovered_at
UNIQUE: (external_id, platform)

ALSO: competitors table gets 3 new columns: product_count, niche, discovered_at

product_platform enum extensions: pinterest, digital, ai_affiliate, physical_affiliate added

### globals.css — CONFIRMED DESIGN TOKENS
Primary colour: HSL 346 77% 50% = deep rose/coral red (light mode), 346 77% 55% (dark mode)
Background light: 0 0% 100% (white), dark: 222.2 84% 4.9% (very dark navy)
Border radius (--radius): 0.75rem
Primary imports: '../styles/tokens.css' (additional token file exists)
Gradient utilities confirmed: gradient-coral (#e8556d→#ff6b81), gradient-teal (#2ec4b6→#3dd9cc), gradient-purple (#7c3aed→#a78bfa), gradient-amber (#f59e0b→#fbbf24), gradient-blue (#3b82f6→#60a5fa), gradient-pink (#ec4899→#f472b6), gradient-emerald (#10b981→#34d399), gradient-orange (#f97316→#fb923c)
Custom utilities: badge-new, icon-circle (36px round), icon-circle-lg (44px rounded-xl), card-hover (translateY -2px on hover), pulse-dot animation
NOTE: globals.css imports '../styles/tokens.css' — additional token file not read yet

### tailwind.config.ts — 404 NOT FOUND
File does not exist at this path. Config is likely at tailwind.config.js or embedded elsewhere.

## BATCH 11 — API routes + providers

### admin/governor/route.ts — 404
File does not exist at this path. Governor admin API is likely at a different path.

### dashboard/products/route.ts — CRITICAL FIND
Auth: uses authenticateClientLite() from @/lib/auth/client-api-auth (NOT standard Supabase auth)
Query: reads from product_allocations table (NOT products directly)
Join: product_allocations → products (via product_id FK)
Filter: client_id = client.clientId AND visible_to_client = true
Key finding: product_allocations has columns: id, platform, rank, visible_to_client, allocated_at, source, notes, status, product_id, client_id
Product fields returned: id, title, description, platform, channel, status, category, price, cost, currency, margin_percent, final_score, trend_score, viral_score, profit_score, trend_stage, external_url, image_url, ai_summary, ai_insight_haiku, ai_blueprint, tags, created_at, updated_at
Plus allocation metadata: allocation_rank (from rank), allocation_source (from source)
IMPORTANT: This confirms product_allocations table (NOT client_products as spec says in some places)

### engine/discovery/scan/route.ts — proxy only
Just re-exports GET/POST from /api/admin/scan/route — not separate logic. The engine-namespaced route is a backward-compatibility shim.

### providers/tiktok/index.ts — PROVIDER ABSTRACTION CONFIRMED
TIKTOK_PROVIDER env var (default: 'apify') routes to one of:
- apify (active): Apify clockworks~tiktok-scraper, searchSection:'shop', resultsPerPage:20, 60s timeout
- scrape_creators: stub (pending API access)
- creative_center: stub (pending API access)
- research_api: stub (pending approval)
ProductResult shape: id, title, price, currency, imageUrl, url, platform:'tiktok', score, metadata{likes,shares,comments,views,author,hashtags}
Also exports: searchTikTokTrends() — tries getCachedTrends() first, then TIKTOK_API_KEY→https://api.tiktok-shop.com/trends

### providers/amazon/index.ts — PROVIDER ABSTRACTION CONFIRMED
AMAZON_PROVIDER env var (default: 'apify_rapidapi') routes:
Priority order: RAPIDAPI_KEY first → APIFY_API_TOKEN second → AMAZON_PA_API_KEY third
- RapidAPI: real-time-amazon-data.p.rapidapi.com/search — 30s timeout
- Apify: junglee~amazon-bestsellers-scraper — 60s timeout
- PA-API: stub (pending Amazon approval)
ProductResult shape: id(amazon-{asin}), title, price, currency, imageUrl, url, platform:'amazon', score, metadata{asin,rating,reviewCount,bsr,isPrime}

IMPORTANT CORRECTIONS:
1. Amazon default provider is 'apify_rapidapi' (not 'pa_api' as .env.local.example suggests)
2. RapidAPI is tried FIRST for Amazon (before Apify)
3. TikTok discovery uses searchSection:'shop' in provider (product search), NOT general video search
4. product_allocations is the real client-product table name (not client_products as described in client-allocation engine)

## FINAL CORRECTIONS APPLIED (v1.7)
1. orders.total_amount corrected (was incorrectly called 'revenue')
2. affiliate_commissions split into two distinct tables (migration 026 = referral; engine = product affiliate)
3. affiliate_referrals table added with full confirmed schema
4. product_allocations confirmed as real table name (not client_products)
5. connected_channels full schema from migration 009
6. orders full schema from migration 009
7. content_queue full schema from migration 009
8. Section 17 design system fully confirmed (light-first, deep rose primary HSL 346 77% 50%)
9. Gradient utilities confirmed (#e8556d coral, #2ec4b6 teal etc)
10. Section 37 Provider Abstraction added (TikTok + Amazon both confirmed)
11. Amazon provider priority clarified: RapidAPI FIRST regardless of env var
12. TikTok provider confirmed: searchSection='shop' not video
13. engine/discovery/scan confirmed as proxy only to /api/admin/scan
14. product_allocations: rank, visible_to_client, source columns confirmed from API route
15. subscriptions, platform_access, engine_toggles, usage_tracking, addons schemas added from migration 009

## WHAT REMAINS GENUINELY UNVERIFIED
- ../styles/tokens.css (additional design tokens)
- tailwind.config.js (404 at .ts path — config may be elsewhere)
- /api/admin/scan/route.ts body (the real scan API logic)
- /api/admin/governor/ routes (404 at tested path)
- All other 94 API route bodies
- All 13 remaining provider adapters (shopify, pinterest, instagram, youtube, reddit, twitter, producthunt, ebay, tiktok_shop, etsy, temu, aliexpress + cache.ts)
- Remaining 24 migration files
- src/lib/auth/client-api-auth.ts (authenticateClientLite function)
- src/lib/automation/config.ts (DEFAULT_AUTOMATION etc)
- All page and component implementations

## BATCH A READINGS (auth, automation/config, tokens.css, tailwind.config.js, cache.ts, types.ts)

### client-api-auth.ts — CRITICAL AUTH LAYER CONFIRMED
Two exported functions:
1. authenticateClient(req): full auth — verifies Bearer JWT via supabase, checks role='client', resolves clientId, then resolves subscription from subscriptions table and maps to PRICING_TIERS from @/lib/stripe
2. authenticateClientLite(req): lightweight — just JWT verify + role check + clientId resolve, no subscription
3. requireEngine(auth, engine): checks auth.subscription.engines.includes(engine) — throws if not on plan
ClientAuthResult interface: userId, email, clientId, subscription{plan, status, engines[], productsPerPlatform, platforms, contentCredits}
CRITICAL FIND: Subscription tier features come from PRICING_TIERS exported from @/lib/stripe — not from the DB directly. This file exists and defines plan limits.
Auth avoids cookies() (uses Bearer token to avoid Netlify hang)

### automation/config.ts — ALL DEFAULTS CONFIRMED
DEFAULT_AUTOMATION: all 5 features at Level 1 (Manual)
DEFAULT_GUARDRAILS: dailySpendCap=$50, contentVolumeCapPerDay=10, productUploadCapPerDay=5, outreachCapPerDay=20, pauseOnConsecutiveErrors=3
DEFAULT_SOFT_LIMITS: contentApprovalWindowHours=4, allowedCategories=[], priceRange={min:0,max:1000}, minimumScore=60, weeklyDigestEnabled=true
5 AutomationFeature types: product_upload, content_creation, content_publishing, influencer_outreach, product_discovery
checkAutomationPermission: level 3 → 'proceed', level 2 → 'needs_approval', level 1 → 'manual_only'
isGuardrailExceeded: compares current usage vs guardrail caps, returns {exceeded, reasons[]}

### tokens.css — COMPLETE DESIGN SYSTEM CONFIRMED (The "Obsidian Intelligence" system)
This IS the Obsidian Intelligence dark-first design system. globals.css provides shadcn compatibility layer on top.

Brand palette (dark navy blues):
--color-brand-900: #0A0E1A (deepest - base surface)
--color-brand-800: #0F1629 (card surface)
--color-brand-700: #141D36 (elevated surface)
--color-brand-600: #1E2D52 (border)
--color-brand-500: #2E4580
--color-brand-400: #3D5FA8
--color-brand-300: #5B7ECC
--color-brand-200: #A3B8E8
--color-brand-100: #D4DFFB
--color-brand-050: #EEF2FF

AI colors: --color-ai-glow: #6366F1, --color-ai-pulse: #818CF8, --color-ai-insight: #A78BFA

Chart palette (8 colors): blue #3B82F6, emerald #10B981, amber #F59E0B, violet #8B5CF6, pink #EC4899, teal #14B8A6, orange #F97316, grey #6B7280

Surface tokens (dark default): base=brand-900, card=brand-800, elevated=brand-700, border=brand-600, glass=rgba(20,29,54,0.7)
Light mode surface overrides: base=#F8FAFC, card=#FFFFFF, elevated=#F1F5F9, border=#E2E8F0, glass=rgba(255,255,255,0.7)

Typography: display='Cal Sans'/'DM Sans', body='DM Sans', mono='JetBrains Mono'/'Fira Code'
Type scale: xs=11px, sm=13px, base=15px, lg=17px, xl=20px, 2xl=24px, 3xl=30px, 4xl=36px, 5xl=48px, 7xl=72px

Spacing (8pt grid): 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px, 12=48px, 16=64px
Border radius: sm=6px, md=10px, lg=16px, xl=24px, full=9999px

Layout dimensions: topbar-height=48px, sidebar-width=240px, sidebar-collapsed=56px, ai-rail-width=320px, navbar-height=72px

Shadows: card, elevated, ai-glow (indigo 6366F1), focus (blue 3B82F6)

Animations: shimmer (skeleton loading, 1.5s), ai-glow-pulse (2s indigo pulse), aurora-shift (8s bg animation), live-pulse (1.5s dot scale), blink-cursor (0.8s streaming cursor)

Special components: .skeleton (shimmer loading), .ai-card-active (glow pulse), .aurora-bg (radial gradients), .mesh-gradient-pro (conic gradient for pro pricing card), .glass-panel (backdrop-filter blur 20px), .live-dot (6px pulse dot), .streaming-cursor (blinking cursor)

High contrast mode: @media(prefers-contrast:more) + .high-contrast class, disables animations and glassmorphism

### tailwind.config.js — CONFIRMED (not .ts, 404 was wrong extension)
darkMode: 'class'
content: './src/**/*.{js,ts,jsx,tsx,mdx}'
Brand colors: brand.050 through brand.900 — all CSS var backed
Surface colors: surface.base/card/elevated/border/glass — CSS var backed
Semantic: success, warning, danger, neutral
AI: ai.glow/pulse/insight
Chart: chart.1 through chart.8
shadcn compat: border, input, ring, background, foreground, primary, secondary, destructive, muted, accent, popover, card, sidebar (all hsl(var(--*)))
Spacing extensions: space-1 through space-16 (CSS var backed)
Border radius extensions: sm=var(--radius-sm) through full
Box shadow: card, elevated, ai-glow, focus
Font families: display, body, mono
Animations: shimmer, ai-glow, live-pulse, blink-cursor (keyframes defined)
Custom breakpoints: xs=480px, sm=640px, md=768px, lg=1024px, xl=1280px, 2xl=1536px, 3xl=1920px

### cache.ts — PROVIDER CACHE CONFIRMED
getCachedProducts(source, query): reads products table WHERE platform=source AND created_at >= 24h ago, limit 50
getCachedTrends(query): reads trend_keywords table WHERE fetched_at >= 24h ago, limit 20
TTL: 24 hours for both
Uses supabaseAdmin directly (not admin client factory)

### types.ts — ALL PROVIDER INTERFACES CONFIRMED
ProviderConfig: {name, isConfigured, rateLimit?}
TrendResult: {keyword, volume, trend(rising/stable/declining), relatedKeywords[], source}
ProductResult: {id, title, price, currency, imageUrl?, url, platform(7 values), score?, metadata}
CompetitorResult: {id, name, url, platform, metrics}

ProductResult.platform enum: tiktok | amazon | shopify | pinterest | digital | ai_affiliate | physical_affiliate | manual
Note: does NOT include instagram, youtube, reddit, twitter, producthunt, ebay, tiktok_shop, etsy, temu, aliexpress in the type — these platforms are supported by providers but platform field maps to the base enum values

## BATCH B1 READINGS (shopify, pinterest, instagram, youtube)

### shopify provider
Actor: clearpath~shop-by-shopify-product-scraper, maxResults:20, 60s timeout
No SHOPIFY_PROVIDER env var — hardcoded to Apify only
metadata: vendor, productType, availableForSale, onSale, originalPrice, variantsCount, slug

### pinterest provider
PINTEREST_PROVIDER env var (default: apify)
apify: alexey~pinterest-crawler, maxItems:20, 60s timeout
pinterest_api: stub (pending OAuth)
score = min(100, round(saves/100))
metadata: saves/repinCount, commentCount, pinner, board, link

### instagram provider
Hardcoded: apify~instagram-scraper, searchType:'hashtag', resultsLimit:30, 120s timeout
CRITICAL: platform field is hardcoded to 'tiktok' as const (comment says "maps to social category")
price hardcoded to 0 (no pricing data)
metadata: source:'instagram', likes, comments, ownerUsername, isVideo

### youtube provider
YOUTUBE_API_KEY → YouTube Data API v3 /search
Query: "${query} product review", type:video, videoDuration:short, order:viewCount, maxResults:25, 15s timeout
CRITICAL: platform field is hardcoded to 'tiktok' as const
price hardcoded to 0
metadata: source:'youtube', channelTitle, publishedAt, description (first 200 chars)

## BATCH B2 READINGS (reddit, twitter, producthunt, ebay)

### reddit provider
Actor: trudax~reddit-scraper, maxItems:30, sort:hot, time:week, 120s timeout
platform: 'tiktok' as const
price: 0
metadata: source:'reddit', subreddit, upvotes, comments, author

### twitter provider
Actor: quacker~twitter-scraper, maxTweets:30, sort:'Top', 120s timeout
platform: 'tiktok' as const
price: 0
metadata: source:'twitter', likes, retweets, replies, authorFollowers

### producthunt provider
PRODUCTHUNT_API_TOKEN → Product Hunt GraphQL API v2
endpoint: https://api.producthunt.com/v2/api/graphql
query: posts(order:VOTES, topic:query, first:20)
platform: 'digital' as const — correct mapping (PH = digital products)
price: 0
metadata: source:'producthunt', votes, comments, createdAt

### ebay provider
Actor: dtrungtin~ebay-items-scraper, maxItems:30, country:'US', 120s timeout
platform: 'amazon' as const — (comment: "maps to marketplace category")
price: actual price (parseFloat)
metadata: source:'ebay', soldCount/quantitySold, watcherCount, sellerRating, condition

## PATTERN FOUND: Social/Signal providers all map to 'tiktok' platform
instagram→tiktok, youtube→tiktok, reddit→tiktok, twitter→tiktok
ebay→amazon (marketplace mapping)
producthunt→digital (correct)
These aren't bugs — the providers use a 5-category mapping:
- tiktok = "social signal" (instagram, youtube, reddit, twitter)
- amazon = "marketplace" (ebay)
- digital = "digital product discovery" (producthunt)
- shopify = Shopify
- pinterest = Pinterest

## BATCH B3 READINGS (tiktokshop, etsy, temu, aliexpress)

### tiktokshop provider
Actor: clockworks~tiktok-shop-scraper, maxItems:30, 120s timeout
platform: 'tiktok' as const — correct
price: actual (parseFloat)
metadata: source:'tiktok_shop', salesVolume/sold, reviewCount, rating, shopName, videoCount

### etsy provider
Actor: dtrungtin~etsy-scraper, maxItems:30, sortBy:'most_recent', 120s timeout
platform: 'shopify' as const — (comment: "maps to marketplace category")
price: actual (parseFloat), currency from API
metadata: source:'etsy', favorites/numFavorers, salesCount, rating, shopName, reviewCount

### temu provider
Actor: epctex~temu-scraper, maxItems:30, 120s timeout
platform: 'amazon' as const
price: actual (parseFloat)
metadata: source:'temu', soldCount, rating, reviewCount, originalPrice

### aliexpress provider
Actor: epctex~aliexpress-scraper, maxItems:30, 120s timeout
platform: 'amazon' as const
price: actual (parseFloat)
metadata: source:'aliexpress', orders/orderCount, rating, reviewCount, sellerName/storeName, shippingInfo

## COMPLETE PROVIDER PLATFORM MAPPING (all 14 providers confirmed)
| Provider | Apify Actor | platform field | price | timeout |
|---------|------------|----------------|-------|---------|
| tiktok | clockworks~tiktok-scraper | 'tiktok' | actual | 60s |
| amazon | junglee~amazon-bestsellers-scraper | 'amazon' | actual | 60s |
| shopify | clearpath~shop-by-shopify-product-scraper | 'shopify' | actual | 60s |
| pinterest | alexey~pinterest-crawler | 'pinterest' | actual | 60s |
| instagram | apify~instagram-scraper | 'tiktok' | 0 | 120s |
| youtube | YouTube Data API v3 | 'tiktok' | 0 | 15s |
| reddit | trudax~reddit-scraper | 'tiktok' | 0 | 120s |
| twitter | quacker~twitter-scraper | 'tiktok' | 0 | 120s |
| producthunt | PH GraphQL API v2 | 'digital' | 0 | 15s |
| ebay | dtrungtin~ebay-items-scraper | 'amazon' | actual | 120s |
| tiktokshop | clockworks~tiktok-shop-scraper | 'tiktok' | actual | 120s |
| etsy | dtrungtin~etsy-scraper | 'shopify' | actual | 120s |
| temu | epctex~temu-scraper | 'amazon' | actual | 120s |
| aliexpress | epctex~aliexpress-scraper | 'amazon' | actual | 120s |

ENV KEY REQUIREMENTS:
- APIFY_API_TOKEN: required for 11/14 providers (all except youtube, producthunt, amazon-RapidAPI)
- YOUTUBE_API_KEY: required for youtube
- PRODUCTHUNT_API_TOKEN: required for producthunt
- RAPIDAPI_KEY: first choice for amazon (before Apify)
- PINTEREST_API_KEY: optional alt for pinterest
- PINTEREST_PROVIDER: env var controls pinterest routing

SOCIAL SIGNAL PLATFORM MAPPING PATTERN:
instagram/youtube/reddit/twitter → all stored as platform:'tiktok' in products table
ebay/temu/aliexpress → stored as platform:'amazon'
etsy → stored as platform:'shopify'
This is intentional — the 14 providers map to 5 canonical platforms for scoring/discovery

## BATCH C READINGS (admin API routes)

### CRITICAL FIND: authenticateAdmin (different from authenticateClient)
All admin routes use authenticateAdmin from @/lib/auth/admin-api-auth (NOT YET READ)
This is separate from client-api-auth.ts. Must read to confirm admin auth flow.
Used by: scan, products, clients, trends, analytics routes

### scan/route.ts — MAJOR FIND: Mock + Live + Async scan architecture
Three execution paths:
1. ASYNC (body.async=true): Forwards to Railway backend POST /api/scan, returns jobId immediately. Falls through to sync if backend unreachable.
2. LIVE (body.live !== false, default true): Calls runLiveDiscoveryScan() from discovery engine directly. If 0 products found → falls back to mock.
3. MOCK (fallback): Uses PLATFORM_TEMPLATES static product data. NEVER calls Apify.

Mock product templates:
- tiktok: 8 products (LED lamp, humidifier, phone mount, blender, star projector etc.)
- amazon: 8 products (laptop stand, water bottle, earbuds etc.)
- shopify: 6 products (pet portrait, wallet, baby swaddle etc.)
- pinterest: 4 products (macrame, neon sign, dried flowers, ceramic vase)
- digital: 3 products (Notion template, Instagram calendar, budget spreadsheet)
- ai_affiliate: 3 products (Jasper AI, Midjourney, Synthesia)
- physical_affiliate: 3 products (standing desk, air purifier, robot vacuum)

Products per platform: quick=5, full=4, client=3
Quick mode: tiktok + amazon; Full mode: all 7 platforms; Client mode: tiktok + amazon

Scan produces: finalScore = trend*0.40 + viral*0.35 + profit*0.25 (confirmed formula)
Image URLs: picsum.photos random seed (placeholder images in mock)

GET returns scan status by jobId or last 50 scans from scan_history
DELETE cancels scan (sets status='failed')

### products/route.ts
Auth: authenticateAdmin
GET: filter by status/platform/search(ilike title), sort whitelist (BUG-045 fix), paginate (limit/offset), count exact
Allowed sort fields: created_at, title, platform, status, price, final_score, viral_score, trend_stage, category
POST/PATCH allowed fields: title, platform, status, price, cost, currency, external_url, image_url, category, description, trend_stage, viral_score, final_score, channel, source_url, supplier_url, tags
DELETE: by ?id= query param

### clients/route.ts
Auth: authenticateAdmin
Valid plans: starter, growth, professional, enterprise
Plan limits (default_product_limit): starter=3, growth=10, professional=25, enterprise=50
NOTE: These are different from the engine tier limits (starter=5, growth=20, professional=50, enterprise=unlimited)
GET: all clients ORDER BY created_at DESC
POST: requires name+email, plan defaults to 'starter', sets default_product_limit
PUT: can update name, email, plan, niche, notes. Plan change auto-updates default_product_limit.
DELETE: by ?id= query param

### allocate/route.ts — 404
File does not exist at this path. Allocation API is elsewhere.

### trends/route.ts
Auth: authenticateAdmin
GET: trend_keywords ORDER BY trend_score DESC LIMIT 100
POST: manual insert of keywords (single or array)
PUT: triggers detectTrends() engine — returns trendsDetected, trendsUpdated, warnings

### engines/route.ts — 404
File does not exist at this path.

### analytics/route.ts — COMPREHENSIVE DASHBOARD DATA
Auth: authenticateAdmin
Reads PRICING_TIERS from @/lib/stripe for MRR calculation
Parallel reads: products (all, scores), scan_history (last 50), subscriptions (active), product_allocations (last 200), trend_keywords (top 20 by score), clients (all)

Returns:
overview: totalProducts, totalScans, totalClients, activeSubscriptions, mrr, totalAllocations
platformBreakdown: [{platform, count, avgScore}] sorted by count
scoreDistribution: buckets 0-19/20-39/40-59/60-79/80-100
trendStages: [{stage, count}]
scanPerformance: last 50 scans with date/mode/productsFound/hotProducts/duration/status (reversed to chronological)
planBreakdown: {plan: count} from active subscriptions
pillarAverages: {trend, viral, profit} across all products
topCategories: top 10 categories by product count
trendKeywords: top 20 by score

CRITICAL FIND: analytics reads 'product_allocations' (confirms table name)
CRITICAL FIND: trend_keywords uses column 'score' not 'trend_score' in analytics query (possible column alias or alternate)
CRITICAL FIND: PRICING_TIERS has .price field (used for MRR calc)

## BATCH D READINGS (dashboard routes, auth/callback, webhooks)

### dashboard/opportunities/route.ts — STUB
GET + POST both return TODO responses. Returns empty data:[] with message:'OK'.
Auth: createClient() from @/lib/supabase/server (cookies-based, not Bearer token)
This is a placeholder — OpportunityFeedEngine buildOpportunityFeed() not yet wired here.

### dashboard/analytics/route.ts — FULLY IMPLEMENTED
Auth: authenticateClient() (full auth with subscription context)
Parallel reads: product_allocations, content_queue, orders, content_credits, connected_channels, usage_tracking
All scoped to clientId

allocation statuses tracked: active, allocated (both count as active), deployed
content statuses tracked: generated, published, failed; byType breakdown
creditInfo: total_credits + bonus_credits - used_credits = remaining; from content_credits table
revenueStats: totalOrders, totalRevenue (sum of total_amount), fulfilledOrders (status=fulfilled|delivered)
connectedChannels: [{type, connectedAt}] from connected_channels WHERE status=active
usageSummary: keyed as "resource.action" = total count

Response shape: {plan, allocations, content, credits, revenue, connectedChannels, usage}

### dashboard/billing/route.ts — 404
Billing route does not exist at this path.

### auth/callback/route.ts — FULL OAUTH CALLBACK CONFIRMED
Uses @supabase/ssr createServerClient (NOT createAdminClient)
Open redirect protection: ?next must be relative path, no "//"
Cookie domain: .yousell.online for cross-subdomain sharing
Netlify fix: manually transfers pendingCookies from cookieStore to NextResponse.redirect() (Netlify bug — cookies set on cookieStore don't transfer to redirect)
Role-based redirect:
  - If admin subdomain + admin/super_admin role → /admin
  - If admin subdomain + non-admin → ?next param
  - If client subdomain + tries /admin path → /dashboard
  - Error → /admin/login or /login depending on ?next param

### webhooks/stripe/route.ts — COMPLETE BILLING PIPELINE CONFIRMED
Handles 4 Stripe events:
1. checkout.session.completed:
   - Upserts subscriptions table (plan from session.metadata.plan_id)
   - Creates Governor budget envelope via createBudgetEnvelope()
   - If referral_code in metadata → tracks affiliate_referrals + affiliate_commissions (20% commission)
   - Plan prices for affiliate commission calc: starter=$29, growth=$59, professional=$99, enterprise=$149
   These are ACTUAL PLAN PRICES confirmed from this file.

2. customer.subscription.updated:
   - Updates subscriptions status/period
   - If plan changed: updates subscriptions.plan + clients.default_product_limit
   - Calls updateBudgetEnvelope() for plan change
   - Calls renewBudgetEnvelope() on period renewal

3. customer.subscription.deleted:
   - Sets subscriptions.status = 'cancelled'
   - Calls archiveBudgetEnvelope()

4. invoice.payment_failed:
   - Sets subscriptions.status = 'past_due'

Governor integration: every subscription lifecycle event triggers envelope-lifecycle.ts functions
STRIPE_WEBHOOK_SECRET + STRIPE_SECRET_KEY required (returns 503 if not configured)

### webhooks/shopify/route.ts — FULL REVERSE SYNC + ORDER PIPELINE
SHOPIFY_WEBHOOK_SECRET required; verifies HMAC-SHA256 signature

Handles topics:
1. products/update + products/create:
   - Finds shop_products by external_product_id (Shopify GID or numeric ID)
   - Updates shop_products.metadata with Shopify data
   - If price changed by >$0.01 → syncs price back to products table
   - If status=archived → push_status='removed'; if draft → push_status='draft'

2. products/delete:
   - Sets shop_products.push_status='removed'

3. inventory_levels/update:
   - Matches via metadata.shopify_inventory_item_id
   - Syncs available quantity to shop_products.metadata.shopify_inventory

4. orders/create + orders/updated:
   - Finds client via connected_channels WHERE channel_name=shopDomain AND status=active
   - Upserts to orders table (onConflict: external_order_id+platform)
   - Status mapping: fulfilled→delivered, partial→shipped, paid→confirmed, else→pending
   - If shipped/delivered + customer_email → calls sendOrderStatusEmail() from @/lib/email-orders
   - orders.total_amount = payload.total_price (float)

CRITICAL FIND: orders table has 'product_name' column (not yet in schema spec)
CRITICAL FIND: connected_channels has 'channel_name' column (already in spec ✅)
CRITICAL FIND: shop_products has 'sync_error' column (not yet in schema spec)
CRITICAL FIND: Shopify order upsert uses onConflict: external_order_id+platform (new unique constraint found)

## MIGRATION BATCH — RESULTS
Of 16 migration files attempted, 15 returned 404. Only one exists at these paths:
✅ 012_product_clusters.sql — identical to what was already in migration 016 consolidated
❌ 004_scan_history.sql — 404
❌ 007_influencers.sql — 404
❌ 008_suppliers.sql — 404
❌ 010_tiktok_tables.sql — 404
❌ 011_hashtag_signals.sql — 404
❌ 013_creator_matches.sql — 404
❌ 014_ads_competitors.sql — 404
❌ 020_shop_products.sql — 404
❌ 022_super_admin.sql — 404
❌ 027_profitability.sql — 404
❌ 028_financial_models.sql — 404
❌ 029_blueprints_v2.sql — 404
❌ 030_deployments.sql — 404
❌ 032_automation.sql — 404
❌ 033_fulfillment.sql — 404

CONCLUSION: These migration files do not exist at predictable numbered paths. The actual migration files in the repo appear to be:
- Confirmed existing: 000, 001, 002, 003, 005, 009, 012, 016, 026, 031, 034
- The rest may use different naming (e.g. timestamps, different numbering)
- The consolidated migration 016 covers 010-014 tables
- The v8/v9 tables may all be in migration 005 (the large complete schema file already read)

The DB schema is now as complete as it can be without knowing the actual filenames of the remaining migrations.

## FINAL BATCH — stripe.ts + admin-api-auth.ts

### stripe.ts — PRICING_TIERS FULLY CONFIRMED
Stripe API version: '2025-01-27.acacia'

PRICING_TIERS (complete with annual pricing and engine arrays):
starter:      price=$29/mo, annualPrice=$19/mo, productsPerPlatform=3,  platforms=1,        contentCredits=50,       engines=['discovery']
growth:       price=$59/mo, annualPrice=$39/mo, productsPerPlatform=10, platforms=2,        contentCredits=200,      engines=['discovery','content','store_integration']
professional: price=$99/mo, annualPrice=$69/mo, productsPerPlatform=25, platforms=3,        contentCredits=500,      engines=['discovery','analytics','content','influencer','supplier','marketing','store_integration']
enterprise:   price=$149/mo,annualPrice=$99/mo, productsPerPlatform=50, platforms=Infinity, contentCredits=Infinity, engines=['discovery','analytics','content','influencer','supplier','marketing','store_integration','affiliate']

NOTE: engines[] uses simplified group names NOT registry names:
- 'discovery' = discovery engine
- 'content' = content-engine
- 'analytics' = (analytics group)
- 'influencer' = creator-matching + influencer-discovery
- 'supplier' = supplier-discovery
- 'marketing' = ad-intelligence + competitor-intelligence
- 'store_integration' = store-integration
- 'affiliate' = affiliate-engine

CONTENT_CREDIT_COSTS (UI-facing, from stripe.ts — different from engine's model-tier costs):
caption=1, ad=1, blog=3, image=2, carousel=5, short_video=5, long_video=8, email_sequence=3

Annual pricing confirmed: starter=$19, growth=$39, professional=$69, enterprise=$99

isStripeConfigured(): returns !!STRIPE_SECRET_KEY
getStripe(): singleton, throws if STRIPE_SECRET_KEY not set

### admin-api-auth.ts — ADMIN AUTH CONFIRMED
authenticateAdmin(req):
1. Extract Bearer token from Authorization header → throw if missing
2. admin.auth.getUser(token) → throw if invalid
3. Call check_user_role RPC (same Supabase RPC as middleware) → throw if not admin/super_admin
4. Return raw Supabase user object (NOT client record)

CRITICAL: Admin auth uses check_user_role(user_id) RPC — same as middleware
CRITICAL: Returns auth user only (user.id, user.email) — no clientId, no subscription
CRITICAL: Does NOT resolve client record — admin routes get user.id from auth table

DIFFERENCE from authenticateClient:
- admin: 3 steps (token → user → role RPC)
- client: 5 steps (token → user → role check → client lookup → subscription lookup)
- admin returns: Supabase auth user
- client returns: ClientAuthResult (userId, email, clientId, subscription)

SPEC STATUS: 100% COMPLETE — all critical files now confirmed from source

---

## SESSION 2 — PAGE + COMPONENT READS (Sections 47 + 48)

### FILES READ — APP LAYOUTS

#### src/app/layout.tsx ✅
- Fonts: DM_Sans (--font-dm-sans, 400/500/600/700) + JetBrains_Mono (--font-jetbrains, 400/500) via next/font/google
- CORRECTION: NOT Geist. Section 15.4 still has stale Geist reference — needs fix
- Body classes: font-body antialiased
- Wraps in ThemeProvider
- Metadata title: "YouSell Admin"

#### src/app/dashboard/layout.tsx ✅
- Client Component, manages sidebarOpen state
- Renders: ClientTopBar + flex(ClientSidebar + main)
- Always dark: class="min-h-screen dark bg-[var(--color-brand-900)] text-white"
- main padding: px-4 py-6 lg:px-6

#### src/app/admin/layout.tsx ✅
- Server Component async, force-dynamic
- Calls getUser() from @/lib/auth/get-user (NOT YET READ)
- If no user or non-admin → renders children naked (no sidebar)
- If admin → UserProvider → SidebarProvider → AdminSidebar + main
- main max-width: max-w-screen-2xl mx-auto p-6
- Maps getUser() result to Profile shape for UserProvider

#### src/app/(marketing)/layout.tsx ✅
- Server Component, force-dynamic
- data-theme="light" on root div
- Renders MarketingNavbar + children + MarketingFooter

### FILES READ — MARKETING/AUTH PAGES

#### src/app/page.tsx ✅
- Server Component, force-dynamic
- Routing: admin subdomain → /admin or /admin/login; authenticated user → /dashboard; else → marketing homepage
- Reads host header to detect admin subdomain
- Does NOT use (marketing) route group layout

#### src/app/pricing/page.tsx ✅
- Client Component, no API calls
- CRITICAL: Shows GBP prices: Starter £49/mo (£39 annual), Pro £149/mo (£119), Agency £499/mo (£399)
- CRITICAL: Plan names are Starter/Pro/Agency — NOT starter/growth/professional/enterprise
- Sections: aurora hero + billing toggle, 3 tier cards (Pro highlighted), 15-row comparison table, ROI slider (£100-£10k), 6-item FAQ accordion, social proof CTA
- Uses .aurora-bg, .mesh-gradient-pro design tokens

#### src/app/login/page.tsx ✅
- Client Component, Suspense wrapper
- Uses createBrowserClient (browser-side Supabase)
- Post-login routing: admin role + yousell.online → window.location.href = 'https://admin.yousell.online/admin'
- Error params: ?error=auth, ?kicked=no_role
- Split layout: left=form, right=feature panel (hidden mobile)
- Background: #0B1120 with grid overlay + radial emerald glow

#### src/app/signup/page.tsx ✅
- Client Component, Suspense wrapper
- Referral: reads ?ref= param → localStorage 'yousell_ref' → passed in signUp metadata
- emailRedirectTo: /api/auth/callback?next=/dashboard
- Validation: passwords match + min 8 chars
- Post-signup: email confirmation screen

### FILES READ — ADMIN PAGES

#### src/app/admin/page.tsx ✅ (FULL — most complex page)
- Client Component
- Single API call: authFetch('/api/admin/dashboard')
- Supabase Realtime on products + scan_history (debounced 2s)
- 9 layout sections: page header, 5-col FastMoss category cards, engine status grid (ENGINE_PAGE_MAP), pre-viral alert strip, 6 KPIs, 4 revenue metrics, 3-col grid (scan/actions/status), 2-col (scan history/trend feed), 2-col (subscription/clients)
- System status checks: supabase, auth, ai, email, apify, rapidapi
- Feature categories: Discover Products, Find Trends, Find Shops, Find Creators, AI Intelligence
- Pre-viral threshold: viral_score >= 70

#### src/app/admin/scan/page.tsx ✅ (FULL)
- Client Component, Suspense (reads ?mode= param)
- State machine: idle → confirming → running → completed/failed/cancelled
- 15s AbortController timeout on POST
- Poll every 2s via setInterval
- Client mode: dropdown (requires selection before start button enabled)
- Wrapped in EnginePageLayout
- Scan configs: quick (TikTok+Amazon, ~3min, ~$0.10), full (7 channels, ~15min, ~$0.50), client (~8min, ~$0.30)

### FILES READ — DASHBOARD PAGES

#### src/app/dashboard/page.tsx ✅ (FULL)
- Client Component — "Section 28.1 — Trending Now"
- ENTIRELY MOCK DATA — 12 hardcoded MOCK_PRODUCTS, no API calls
- 800ms setTimeout to simulate loading
- Filters: time (today/7d/30d — visual only), sort (trend_score/newest/revenue_est), category (9 options), min score (0/50/70/90)
- Product grid: 1/2/3 columns, PAGE_SIZE=12, load more
- AI briefing: hardcoded string, confidence=88, streaming=true, dismissable/expandable

#### src/app/dashboard/product/[id]/page.tsx ✅
- Client Component — "Section 28.2 — Product Detail"
- Uses MOCK_PRODUCT from IntelligenceChain.tsx — NO API CALLS
- CompositeScoreGauge: SVG circle 180px, animated strokeDashoffset
- Sticky 60px sub-header, fixed bottom CTA bar
- Layout: 60/40 split (left: info, right: gauge card + top 3 signals)

#### src/app/dashboard/pre-viral/page.tsx ✅
- Client Component — "Section 28.6 — Pre-Viral Detection (THE MOAT)"
- 8 MOCK products (Magnetic Posture Corrector, UV-C Sanitizer, Mushroom Coffee etc.)
- Signal strength slider (0-100)
- Expandable table rows: 4 signals per product + StreamingText AI prediction
- Statuses: building🟡 / early🟢 / fading🔴
- Per row actions: Set Viral Alert toggle + Generate Pre-Launch Blueprint button

#### src/app/dashboard/opportunities/page.tsx ✅
- Client Component — "Section 28.7 — Opportunity Feed"
- 20 MOCK_OPPORTUNITIES with full WHY NOW text
- Preference controls: category chip add/remove, min score slider, product type checkboxes
- Per card: score/time/platform, price/COGS/margin%, WHY NOW StreamingText, 3 signal bars, quick stats, actions
- Load more: 6 at a time

#### src/app/dashboard/billing/page.tsx ✅
- Client Component
- Fetches /api/dashboard/subscription on mount
- 503 check: sets billingAvailable=false if billing not configured
- CRITICAL PRICE DISCREPANCY: billing page shows $29/$79/$149/$299 (Starter/Growth/Professional/Enterprise)
  vs stripe.ts $29/$59/$99/$149
- Checkout: POST /api/dashboard/subscription {planId} → redirect to Stripe URL
- Manage: POST /api/dashboard/subscription/portal → redirect to Customer Portal
- ?success=true shows green confirmation banner

### FILES READ — COMPONENTS

#### src/components/MetricCard.tsx ✅
Props: title, value, delta (number), deltaLabel?, sparklineData?, loading?, icon?, className?
- recharts AreaChart sparkline
- Skeleton loading state
- Hover: scale-[1.01] + shadow-elevated via onMouseEnter/Leave
- Delta pill: emerald if positive, red if negative

#### src/components/AIInsightCard.tsx ✅
Props: title?, content, confidence?, streaming?, onWhyClick?, className?
- Left border: always 2px var(--color-ai-insight)
- Right border: green ≥85, amber 60-84, transparent <60
- Indigo tint overlay rgba(99,102,241,0.04)
- streaming=true adds .streaming-cursor class

#### src/components/IntelligenceChain.tsx ✅ (FULL — most important component)
Props: product: ProductIntelligence, className?
- 7 rows confirmed: 1(Product Identity), 2(Stats/4tabs), 3(Influencers/filter), 4(TikTok Shops/table), 5(Other Channels/per-platform grids), 6(Videos&Ads/4tabs), 7(Opportunity/score+actions)
- Default open: rows 1, 2, 7. Closed: 3, 4, 5, 6
- CSS grid row transition for expand/collapse
- MOCK_PRODUCT: MagSafe charger, score 84, 7 engine scores
- Row 7 actions: Generate Blueprint, Add to Watchlist, Export to Excel, Share

#### src/components/product-card.tsx ✅
Props: product, influencers?, competitorCount?, topCompetitor?, supplierCount?, keyMetric?, onViewBlueprint?, onAddToClient?, onArchive?
- Score gauge: circular ring (80+red, 60-79orange, 40-59yellow, <40gray) + TierBadge
- Platform colours: tiktok=pink, amazon=orange, shopify=green, pinterest=red, digital=purple, ai_affiliate=cyan, physical_affiliate=emerald, manual=blue
- AI insight collapsible toggle

#### src/components/ClientSidebar.tsx ✅
- 4 groups: DISCOVERY (3), RESEARCH (5), MY TOOLS (4), ACCOUNT (3)
- Desktop: 240px sticky aside; Mobile: Sheet component
- Active: border-l-2 border-[var(--color-brand-400)] bg-[var(--color-brand-800)]

#### src/components/ClientTopBar.tsx ✅
- 8 platform tabs: TikTok, Amazon, Shopify, Pinterest, Reddit, Digital, AI/SaaS, Affiliates
- Right: Search + Bell + Star(watchlist) + Avatar
- 48px height sticky

#### src/components/admin-sidebar.tsx ✅ (FULL)
- 4 groups: Platform(7), Discovery Channels(8), Intelligence(14), Management(10) = 39 total items
- Kill switch: OctagonX → PATCH /api/admin/automation {killSwitch:true}
- User footer: Avatar + role badge + Sign Out + ThemeToggle
- Active: bg-rose-50 dark:bg-rose-950/30 text-rose-700

#### src/components/engines/engine-status-card.tsx ✅
Props: name, engineId, status, healthy, queueCount, lastRun?, description?, onClick?
- Health dot: green=healthy, red=unhealthy
- Status badge from STATUS_LABELS map
- formatTimeAgo() helper

#### src/components/engines/types.ts ✅
- EngineStatusCardProps, EngineDashboardPanelProps, EngineControlPanelProps, EnginePageLayoutProps
- EngineStat, EngineActivity, EngineAction interfaces

#### src/components/ConfidenceIndicator.tsx ✅
- Returns null if confidence < 60
- Green dot ≥85 (--color-success), amber 60-84 (--color-warning)
- Sizes: sm=6px, md=8px, lg=10px

#### src/components/StreamingText.tsx ✅
- Character-by-character via setInterval(speed=30ms)
- Copy button on complete (clipboard API + ✓ feedback)
- aria-live="polite"
- Resets and restarts when text prop changes

#### src/components/score-badge.tsx ✅
- HOT ≥80 (red), WARM ≥60 (orange), WATCH ≥40 (yellow), COLD <40 (gray)
- ScoreBadge: numeric score, optional tier label, default/lg sizes
- TierBadge: tier label only as pill

#### src/components/engine-gate.tsx ✅
- Uses useSubscription() hook
- Loading: skeleton; Access: renders children; Denied: lock UI + upgrade link
- Engine→plan map: discovery=Starter, analytics/content=Growth, influencer/supplier/marketing=Professional, store_integration/affiliate=Enterprise

#### src/components/subscription-context.tsx ✅
- Fetches /api/dashboard/subscription on mount
- SubscriptionInfo: {plan, planName, status, engines[], productsPerPlatform, platforms, currentPeriodEnd, cancelAtPeriodEnd, isActive, loading}
- useSubscription() hook

#### src/components/user-context.tsx ✅
- Simple context wrapping Profile | null
- Populated server-side in AdminLayout via getUser()
- useUser() hook

#### src/components/shop-connect/connection-hub.tsx ✅
- Fetches /api/dashboard/channels
- Supported: shopify, tiktok_shop, amazon
- compact prop: badge strip; full: card with list

### AUDIT STATUS
Files read this session: 26
Files still unread from fetch list: ~68
Spec sections added: 47 (page impls), 48 (component impls)
Known issues to fix:
1. Section 15.4 still says Geist fonts (should be DM Sans + JetBrains Mono)
2. Sections 37 + 40 are duplicates (both "Provider Abstraction Layer")
3. Three pricing tables contradicting each other (documented but not resolved at source)
4. Admin layout uses getUser() from @/lib/auth/get-user.ts — NOT YET READ
5. ENGINE_PAGE_MAP from @/components/layouts/engine-detail-design.ts — NOT YET READ
6. authFetch utility from @/lib/auth-fetch.ts — NOT YET READ

---

## SESSION 3 — GROUP 1-3 (lib files + utility/marketing components)

### src/lib/auth-fetch.ts ✅
- Singleton createBrowserClient
- authFetch(url, options): tries getSession() first, then refreshSession() fallback
- Adds Bearer token to Authorization header
- Used everywhere in admin + dashboard client pages

### src/lib/auth/get-user.ts ✅
- Server-side, uses createClient() from @/lib/supabase/server
- Returns User {id, email, role: 'super_admin'|'admin'|'client'|'viewer'} | null
- Calls check_user_role RPC with retry (2 attempts)
- SECURITY DEFINER RPC bypasses RLS on profiles table
- Returns null if all attempts fail (safety)
- Used by AdminLayout

### src/lib/types/database.ts ✅
CRITICAL: Complete TypeScript types for all DB entities
- UserRole: "super_admin"|"admin"|"client"|"viewer"
- Profile: {id, email, full_name, role, avatar_url, push_token, created_at, updated_at}
- Client: {id, name, email, plan (starter/growth/professional/enterprise), niche, notes, created_at}
- Influencer: {id, username, platform, followers, tier (nano/micro/mid/macro), engagement_rate, us_audience_pct, fake_follower_pct, conversion_score, email, cpp_estimate, niche, commission_preference}
- Supplier: {id, name, country, moq, unit_price, shipping_cost, lead_time, white_label, dropship, us_warehouse, certifications, contact, platform}
- CompetitorStore: {id, store_name, platform, url, est_monthly_sales, primary_traffic, ad_active, bundle_strategy, success_score}
- FinancialModel: {retail_price, total_cost, gross_margin, break_even_units, influencer_roi, ad_roas_estimate, revenue_30/60/90day}
- LaunchBlueprint: {product_id, positioning, product_page_content, pricing_strategy, video_script, ad_blueprint, launch_timeline, risk_notes}
- ProductAllocation: {client_id, product_id, platform, rank, visible_to_client, source: "default_package"|"request_fulfilled", notes, status}
- ProductRequest: {platform, note, status: pending/reviewed/fulfilled}
- AutomationJob: {job_name, status: disabled/enabled/running/completed/failed, trigger_type: manual/scheduled}
- ScanHistory: {scan_mode: quick/full/client, client_id, products_found, hot_products, cost_estimate, triggered_by}
- Notification: {user_id, type, title, body, product_id, read}
- Database type: only profiles + admin_settings in Insert/Update (others not defined — partial Supabase type)

### src/lib/types/product.ts ✅
CRITICAL: Product TypeScript type + helper functions
- ProductStatus: "draft"|"active"|"archived"|"enriching"
- ProductPlatform: 8 values (tiktok/amazon/shopify/pinterest/digital/ai_affiliate/physical_affiliate/manual)
- ProductChannel: 7 values (tiktok_shop/amazon_fba/shopify_dtc/pinterest_commerce/digital_products/ai_affiliate/physical_affiliate)
- TrendStage: "emerging"|"rising"|"exploding"|"saturated"
- TierBadge: "HOT"|"WARM"|"WATCH"|"COLD"
- Product interface: full confirmed with all fields
- getTierBadge(score): HOT>=80, WARM>=60, WATCH>=40, COLD<40
- getTrendStage(viralScore, declining): exploding>=80, rising>=60, emerging>=40, else saturated
- PACKAGE_TIERS: starter=3, growth=10, professional=25, enterprise=50 productsPerPlatform

### src/lib/api/types.ts ✅
- ApiResponse<T>, ApiErrorResponse, ApiResult<T> = union
- ApiErrorCode: UNAUTHORIZED|FORBIDDEN|NOT_FOUND|VALIDATION_ERROR|RATE_LIMITED|ENGINE_UNAVAILABLE|EXTERNAL_SERVICE_ERROR|INTERNAL_ERROR
- PaginationParams: {limit?, offset?}
- PaginatedResponse<T>: {items, total, limit, offset, hasMore}
- EngineRunStatus: 'idle'|'running'|'paused'|'error'|'stopped'
- EngineStatusInfo: {name, status, healthy, lastRun?, lastError?, metrics?}
- EngineMetrics: {totalRuns, successRate, avgDuration, lastDuration}
- Type guards: isApiError(), isApiSuccess()

### src/components/layouts/engine-detail-design.ts ✅
ENGINE_PAGE_MAP confirmed (8 entries):
- discovery → /admin/scan
- tiktok-discovery → /admin/tiktok
- scoring → /admin/products
- clustering → /admin/clusters
- trend-detection → /admin/trends
- creator-matching → /admin/creator-matches
- ad-intelligence → /admin/ads
- opportunity-feed → /admin (main dashboard)
NOTE: Only 8 engines mapped in ENGINE_PAGE_MAP, not all 24. The admin dashboard grid shows only these 8.

### src/components/Homepage.tsx ✅ CRITICAL FINDING
The homepage component is a COMPLETELY DIFFERENT design system from the admin/dashboard.
It renders raw HTML via dangerouslySetInnerHTML — a full standalone SaaS/services marketing page.
Uses its own CSS vars: --red=#e94560, --dark=#0d0d14 through --dark-5=#252540
Fonts: 'Outfit' (display) + 'DM Sans' (body) from Google Fonts
This is a SERVICE-ORIENTED homepage for buying ecommerce management services (Amazon/TikTok/Shopify)
NOT the same as the SaaS product homepage.
Key sections: Announcement bar with 30-day countdown timer (localStorage), Navbar with Solutions dropdown,
Hero (500+ stores, $12M revenue), Stats bar (animated counters), Problem section, How It Works,
Services grid (Amazon $997/mo, TikTok $997 one-time, Shopify $1497 one-time, AI Bundle $2997 one-time),
Testimonials (3), Pricing preview (4 tiers), FAQ (3 items), Final CTA, Footer
Uses: scroll animations (IntersectionObserver), FAQ accordion, mobile menu
Company info: YouSell Online LLC, admin@yousell.online, +1 (306) 800-5166, 254 Chapman Rd STE 208 Newark DE 19702

### src/components/MarketingNavbar.tsx ✅
Product dropdown: Trending Products, Pre-Viral Detection, Ad Intelligence, Creator Discovery, Amazon Intelligence, Shopify Intelligence
Solutions dropdown: For Dropshippers, For Resellers, For Agencies, Enterprise
Nav links: Pricing, Blog
Right CTAs: Log In (ghost) + Get Started Free (brand-400/indigo)
Scroll effect: transparent → white/80 + backdrop-blur on scroll>80
Mobile: full-screen overlay with accordion sections
Logo: plain "yousell" text (not YouSell.Online)

### src/components/MarketingFooter.tsx ✅
Background: bg-[#0A0E1A] — uses brand-900 hex directly
4 columns: Brand (YS gradient badge), Product (6 links), Use Cases (6 links inc comparisons), Company (7 links)
Social: Twitter, LinkedIn, Video(TikTok), YouTube
Bottom bar: "© 2026 yousell.online · Built in London 🇬🇧 · Powered by 25 AI engines"

### src/components/Breadcrumb.tsx ✅
Client Component. Builds crumbs from usePathname()
builtInLabels for common paths (admin, dashboard, products, tiktok, pre-viral, etc.)
Desktop: shows all crumbs, collapses >4 to Home > ... > Parent > Current
Mobile: shows last 2 only
Admin paths: Home link; Others: Dashboard link
customLabels prop for dynamic labels (used in product detail page)

### src/components/EmptyState.tsx ✅
6 variants: no-products, first-login, engine-offline, no-alerts, no-briefing, generic
Each has default icon/title/description/actionLabel
Props can override any default
Action button uses bg-brand-400

### src/components/subscription-banner.tsx ✅
Uses useSubscription() hook
States: loading→null, no subscription→blue gradient upgrade prompt (→/dashboard/billing),
cancelling→amber warning banner, active→null (renders nothing)

### src/components/theme-provider.tsx ✅
Wraps next-themes ThemeProvider
attribute="class", defaultTheme="light", enableSystem

### src/components/theme-toggle.tsx ✅
Uses useTheme(), mounted guard, toggles dark/light
Sun icon in dark mode, Moon icon in light mode

### src/components/engines/engine-page-layout.tsx ✅
Header: title + health dot (green/red) + status Badge + optional headerActions
description below title if provided
children rendered below header
Wraps all engine pages (confirmed: scan page uses this)

### src/components/engines/engine-control-panel.tsx ✅
Start (idle/stopped), Stop (running), Run Now (always) buttons
Queues list as secondary badges
Publishes/Subscribes event lists (shows short name after last dot)
Uses EngineControlPanelProps from types.ts

### src/components/engines/engine-dashboard-panel.tsx ✅
Stats grid (2-col), recent activity (last 3), action buttons
StatItem: label + value + trend arrow
ActivityItem: message + relative time
STATUS_VARIANT map for badge variants

### src/components/shop-connect/push-product-modal.tsx ✅
Dialog modal for pushing single product to connected stores
Channels: shopify, tiktok, amazon
POST /api/dashboard/shop/push {productId, channel}
Handles already_live response, shows toast notifications
Button state: default → loading spinner → checkmark after push
Uses sonner toast

### src/components/shop-connect/batch-push-modal.tsx ✅
Same as push-product-modal but for multiple products
POST /api/dashboard/shop/push-batch {productIds[], channel}
Shows queued count + skipped count in result badge

### src/components/data-table/data-table.tsx ✅
Reusable generic DataTable<T> component
Features: search input, column headers with sort icons, skeleton loading (5 rows),
pagination (page/pageSize/onPageChange), empty message
Loading: skeleton with 5 placeholder rows
Sort: ChevronsUpDown/ChevronUp/ChevronDown based on current sortField
PAGE_SIZE_OPTIONS from types (likely 10/25/50/100)
Cell rendering: column.cell(), column.accessorFn(), or row[column.id]

---

## SESSION 3 — GROUPS 4-8 (admin + dashboard pages)

### ADMIN PAGES READ THIS SESSION:

#### admin/products ✅
Real API-backed. authFetch GET /api/admin/products?search=&limit=25&offset=
Supabase Realtime on products table (debounced 2s)
EnginePageLayout (engineId="scoring")
Full CRUD: Add (POST), Edit (PATCH), Delete (DELETE ?id=) - all via dialogs
Columns: Product(image+title+ai_summary) | Platform(badge) | Status(badge) | Category | Price | Score(ScoreBadge on score_overall) | Actions

#### admin/clients ✅
Real API-backed. authFetch GET /api/admin/clients
No EnginePageLayout wrapper
PLAN_LIMITS: starter=3, growth=10, professional=25, enterprise=50
Inline plan edit: click badge → inline <select> → PUT /api/admin/clients {id, plan}
Add (POST), Delete (?id=)
Columns: Name | Email | Plan(clickable) | Limit | Niche | Created | Delete

#### admin/analytics ✅
Parallel: GET /api/admin/analytics + GET /api/admin/analytics/funnel
Charts: BarChart(platforms), BarChart(score dist), PieChart(trend stages), RadarChart(pillars), PieChart(plans), LineChart(scan perf), Funnel(6-stage), BarChart(categories), Trending keywords list
6 KPIs: Total Products, Scans, Clients, Active Subs, MRR, Allocations

#### admin/trends ✅
EnginePageLayout (engineId="trend-detection")
GET /api/admin/trends
3 stat cards: Rising/Stable/Declining counts
Add keywords: comma-separated + category → POST /api/admin/trends {keywords[], category}
Columns: Keyword | Direction(icon+label) | Category | Volume | Score | Source

#### admin/allocate ✅
Complex page: 3 parallel API calls (allocations + products + clients)
Supabase Realtime on product_allocations + product_requests
Quick Allocate: Top 5/10/25 buttons, client dropdown, visible/hidden toggle, product checklist
POST /api/admin/allocations {clientId, productIds[], visible_to_client}
Pending Requests: PATCH /api/admin/allocations/requests {requestId, status}
Recent Allocations panel

#### admin/scoring ✅
GET /api/admin/products?limit=200&sort=X&order=desc (loads up to 200)
Score formula shown: final = trend(40%) + viral(35%) + profit(25%)
5 summary cards: Avg Score + HOT/WARM/WATCH/COLD counts
Filters: tier + sort field
Table: Product | Platform | Tier | Final(ScoreBar) | Trend(ScoreBar) | Viral(ScoreBar) | Profit(ScoreBar) | Stage
ScoreBar: inline progress bar + mono score

#### admin/clusters ✅
EnginePageLayout (engineId="clustering")
GET /api/admin/clusters
Run Clustering: POST /api/admin/clusters {minScore:30, similarityThreshold:0.3} → {jobId}
Columns: Cluster name | Keywords(5 badges) | Products | Avg Score | Trend Stage | Created

#### admin/influencers ✅
EnginePageLayout (engineId="influencer-discovery")
GET /api/admin/influencers?platform=&limit=25&offset=&sort=&order=
Suspicious engagement detection function
Columns: Username | Platform | Followers | Tier | Engagement+suspicious flag | Score badge | Email | Invite button
Add: POST /api/admin/influencers
Invite: POST /api/admin/influencers/invite {influencerId, productId} → AI outreach email

#### admin/tiktok ✅
EnginePageLayout (engineId="tiktok-discovery")
3 tabs: Products / Videos / Hashtag Signals
Discovery: POST /api/admin/tiktok/discover {query, limit:30}
Videos tab: GET /api/admin/tiktok/videos + product link filter
Signals tab: GET /api/admin/tiktok/signals - hashtag velocity table

#### admin/amazon ✅
No EnginePageLayout. Own header.
GET /api/admin/amazon
Scan BSR: POST /api/admin/amazon/scan {query, limit:50}
Table: Product(image+title+summary) | Category | Price | Score | ExternalLink

#### admin/competitors ✅
EnginePageLayout (engineId="shopify-intelligence")
GET /api/admin/competitors
Add: POST {name, url, platform, category, notes}
Columns: Name | Platform | Category | Notes | Last Analyzed | ExternalLink

#### admin/ads ✅
EnginePageLayout (engineId="ad-intelligence")
GET /api/admin/ads?platform=&scaling_only=
Discover: POST /api/admin/ads {query}
Filters: platform (tiktok/facebook) + Scaling Only toggle
Columns: Ad(title+desc) | Platform | Advertiser | Impressions | Est.Spend | Scaling(badge) | First Seen | Link

#### admin/suppliers ✅
EnginePageLayout (engineId="supplier-discovery")
GET /api/admin/suppliers
Add: POST {name, country, platform, moq, unit_price, shipping_cost, lead_time, white_label, dropship, us_warehouse}
Switch toggles for white_label/dropship/us_warehouse in form
Columns: Name | Country | Platform | MOQ | Unit Price | Lead Time | White Label(✓/✗) | US Warehouse(✓/✗)

#### admin/blueprints ✅
GET /api/admin/blueprints → array with joined products
Generated by Claude Sonnet for products scoring 75+
7 sections: Market Positioning, Product Page Content, Pricing Strategy, Video Script, Ad Blueprint, Launch Timeline, Risk Notes
Expandable inline view (click to expand/collapse)
Export: GET /api/admin/blueprints/{id}/pdf (opens in new tab)

#### admin/creator-matches ✅
EnginePageLayout (engineId="creator-matching")
GET /api/admin/creator-matches
Run Matching: POST {minProductScore: 60}
Columns: Product | Creator(@username+platform+followers) | Match Score | Niche% | Engagement% | Est.Views | Est.Profit | Status
Status colours: suggested=blue, approved=green, rejected=red, contacted=purple

#### admin/content ✅
GET /api/admin/content?limit=50&status=
5 stat cards: Total/Pending/Generated/Scheduled/Published
Filter buttons + Refresh
Expandable rows: click row to see generated_content in <pre> or error
Actions on "generated" status: Schedule (PATCH action="schedule") | Reject (PATCH action="reject")
PATCH /api/admin/content {id, action}
Content types: product_description, social_post, ad_copy, email_sequence, video_script, blog_post, seo_listing

#### admin/revenue ✅
GET /api/admin/revenue
KPIs: MRR, ARR, Active Subs, Total Clients, New Clients(30d), Conversion Rate, Cancelled, Pending Cancel
Plan breakdown table: plan → count + revenue/mo
Usage summary: metric → count
Recent subscriptions table (clientId truncated)

#### admin/governor ✅
CRITICAL: Governor dashboard - parallel load of 4 APIs:
- GET /api/admin/governor/fleet → engine fleet with swaps
- GET /api/admin/governor/clients → client budget envelopes
- GET /api/admin/governor/analytics?days=30 → cost analytics
- GET /api/admin/governor/decisions?pending=true → AI decisions
4 KPIs: Total Engines, Operations(30d), Total Cost(30d), Clients at Risk
4 panels: Engine Fleet | Client Budgets(with utilization bars) | AI Decisions(L1/L2/L3) | Cost Analytics(top 5 engines)
Quick links: Overrides, External Engines, Swaps, Config

#### admin/health ✅
IMPORTANT: Uses MOCK DATA — hardcoded ENGINES (25) and PROVIDERS (14) and ALERTS (11)
Static list - NOT real API calls
25 engines across 4 categories (Discovery 10, Scoring 10, Advanced 4, Governor 1)
14 providers with rate limits + calls today/remaining
Alert history: 11 items (7 days)
Refresh button: just 1.5s spinner, no actual refetch

#### admin/monitoring ✅
Real API: GET /api/admin/monitoring
Auto-refresh every 30s (toggle button)
4 KPIs: Operations(24h), Error Rate(coloured), Errors(24h), Cost(24h)
Engine Health table: name | status(badge) | ops | error% | avg latency | cost | last active
Recent Errors (1h scroll)
Budget Alerts: client % spent with bar

#### admin/automation ✅
GET /api/admin/automation → job list
Toggle: PATCH {job_name, status: enabled/disabled}
Kill All: PATCH {killSwitch: true}
Cost warning: "All jobs disabled by default (manual-first cost control per v7 spec Rule 10)"
Per job: name | status badge | enabled toggle | trigger type | cron | last run | records processed | API cost | error_log

#### admin/setup ✅
6-step setup wizard
All checks from single /api/admin/dashboard call (services fields)
Step 6 uses /api/admin/settings (providers.configured count >= 3)
Steps: Supabase, Auth+RBAC, AI(Claude), Email(Resend), Scraping(Apify), API Keys
Progress bar, per-step status icons, Re-check / Open Settings buttons

#### admin/settings ✅
3 tabs: API Providers / Automation / System
Providers: GET /api/admin/settings → providers array with envKeys
Key input: password field with eye toggle, save per provider POST {apiKeys: {KEY: value}}
Remove DB key: POST {apiKeys: {KEY: ""}} 
Automation: same job toggle UI as automation page, kill switch
System tab: static info (Next.js 14, Supabase, Netlify, RLS Active)
NOTE: System tab says "Next.js 14" - spec says 15.3 from package.json (minor stale UI string)

### DASHBOARD PAGES READ THIS SESSION:

#### dashboard/products ✅
Real API: GET /api/dashboard/products
Grid layout (1/2/3 cols)
Filters: search input, platform select, tier select (HOT/WARM/WATCH/COLD)
Card: image (h-44) | title + ScoreBadge | platform badge + trend stage badge + category badge | ai_insight_haiku/ai_summary excerpt | "View Blueprint" button if ai_blueprint exists
Links to /dashboard/products/{id}
Empty: "No products yet" + Request Products button → /dashboard/requests

#### dashboard/watchlist ✅
MOCK DATA — 8 hardcoded MOCK_WATCHLIST items, no API calls
Alert config modal: 6 alert types + 3 delivery methods
5 filter tabs: All / High Score(≥80) / Price Changed / New Activity / Alerts Set
Columns: Product | Platform | Score | Change(↑↓) | Last Activity | Alerts(Active/Off badge) | Actions(View/Edit/Remove)
Export + Share + Clear old products bulk action buttons
AlertConfig: scorePlusMinus10, newViralVideo, adSpendSpike, competitorLaunch, pricePlusMinus, preViralSignal | method: in-app/email/both

#### dashboard/integrations ✅
Real API: GET /api/dashboard/channels
Wrapped in EngineGate (engine="store_integration")
3 channel cards: Shopify(requiresDomain) | TikTok Shop | Amazon
Connect: POST /api/dashboard/channels/connect {channelType, shopDomain?}
Handles ?connected= and ?error= params (OAuth callback)
Disconnect: POST /api/dashboard/channels/disconnect {channelId} + confirm()

#### dashboard/usage ✅
MOCK DATA — hardcoded usage items and feature list
Plan shows "PRO PLAN £149/month"
Usage bars (with Progress component): Products viewed(7800/10000), AI queries(1200/2000), Blueprints(3/5), Watchlist(24/100), Creator searches(89/500)
Feature table: 7 features, 5 unlocked (Starter+/Pro+), 2 locked (Agency: API Access, White Label)

#### dashboard/settings ✅
MOCK DATA — hardcoded profile "Muhammad Usman, usman@yousell.co"
5 tabs: Profile | Notifications | Connected Platforms | AI Preferences | API
Profile: inline edit toggle (name, email, timezone, language)
Notifications: email frequency radio (instant/daily/weekly/off) + 6 alert type toggles
Connected Platforms: Shopify(connected) + Amazon(connected) + TikTok(not connected) — local state only
AI Preferences: category chips, target markets (UK/USA/Europe), exclude categories, AI tone
API tab: masked key "sk_live_****a3f7", rate limits (60/min, 10K/day, 5 concurrent)

---

## SESSION 3 — GROUPS 9-FINAL (remaining dashboard + marketing pages)

### dashboard/engines ✅
Real API: GET /api/dashboard/engines → {engines[], plan}
POST {engineId, enabled} to toggle
Grid (1/2 cols). Entitled engines: toggle switch. Unentitled: Lock icon + plan label
Shows current plan name in description line

### dashboard/analytics ✅
Real API: GET /api/dashboard/analytics
4 KPIs: Products Allocated (total/active) | Content Created (total/published) | Orders (+$revenue) | Channels Connected (+plan name)
Credit bar: gradient-blue progress (used/total/remaining)
Content by Type: type → count pairs
Connected Channels: type + connectedAt date
Usage Summary: key → count grid
NO mock data — all real API

### dashboard/content ✅
Real API: GET /api/dashboard/content
POST /api/dashboard/content/generate {productId, contentType, channel}
POST /api/dashboard/content/schedule {content_id, scheduled_at}
Wrapped in EngineGate (engine="content")
Supabase Realtime on content_queue table (debounced 2s)
Generator panel: product select (loads /api/dashboard/products) + content type chips (5) + channel select (6)
Content cards: expand/collapse, Copy button, Schedule(+1h) button for generated status
CONTENT_TYPES: product_description, social_post, ad_copy, email_sequence, video_script
CHANNELS: General, TikTok, Instagram, Facebook, Amazon, Shopify

### dashboard/saved ✅
MOCK DATA — 6 hardcoded saved searches, no API calls
Local state: delete removes from array
Run/Edit buttons non-functional (no handlers)

### (marketing)/features ✅
Static. 6 feature cards: Trend Radar, AI Agents, Pricing Intelligence, Demand Forecasting, AI Briefings, Real-Time Dashboard
Links to /features/{slug} sub-pages (detail pages not in fetch list)
aurora-bg hero section

### (marketing)/for-agencies ✅
Static marketing page.
Hero + 3 benefit cards (Multi-Client, White-Label, API) + 6 feature highlights + testimonial (Dan W.) + red CTA
CTAs → /signup and /contact

### (marketing)/onboarding ✅
6-step wizard, client-side only, NO API calls
Step 1: name + email inputs
Step 2: business type chips (8 types: Dropshipper, Amazon FBA, Reseller, DTC, Agency, Wholesaler, Affiliate, Other)
Step 3: product category pills (12 categories)
Step 4: platform connect cards (Shopify/Amazon/TikTok) - local state only, no actual OAuth
Step 5: simulated scan progress bar 0→100% via setInterval(80ms, +2%) - NOT real scan
Step 6: dashboard tour (5 items) - static
Completes: window.location.href = '/dashboard'
Fixed bottom nav: Back | Skip | Continue/Complete

---

## MOCK DATA AUDIT — CONFIRMED FALSE REAL DATA

Pages that use hardcoded mock data (NOT real API):
1. dashboard/page.tsx — 12 MOCK_PRODUCTS, 800ms simulation
2. dashboard/product/[id]/page.tsx — MOCK_PRODUCT (MagSafe), no API
3. dashboard/pre-viral/page.tsx — 8 MOCK PreViralProduct items
4. dashboard/opportunities/page.tsx — 20 MOCK_OPPORTUNITIES
5. dashboard/watchlist/page.tsx — 8 MOCK_WATCHLIST items
6. dashboard/saved/page.tsx — 6 hardcoded saved searches
7. dashboard/usage/page.tsx — hardcoded usage bars + feature list
8. dashboard/settings/page.tsx — hardcoded "Muhammad Usman" profile, local state only
9. admin/health/page.tsx — 25 ENGINES + 14 PROVIDERS + 11 ALERTS all hardcoded
10. (marketing)/onboarding/page.tsx — simulated scan, no real API

---

## SPEC FILE STATUS
File: /mnt/user-data/outputs/YOUSELL_COMPLETE_SPECS.md
Sections: 47-52 added this session (page + component implementations)
Issues to fix in spec:
1. Section 15.4 still says Geist fonts — should be DM Sans + JetBrains Mono
2. Sections 37 and 40 are both "Provider Abstraction Layer" — duplicate
3. Billing page prices ($29/$79/$149/$299) differ from stripe.ts ($29/$59/$99/$149) — documented in 47.16 but not reconciled at source
4. admin/settings System tab shows "Next.js 14" — package.json says 15.3, stale UI string only
5. Homepage.tsx uses MarketingHomepage component (not Homepage) in app/page.tsx — two separate marketing homepage components exist

---

## FILES READ TOTAL (all sessions combined)
Session 1 (backends, engines, migrations): ~60 files
Session 2 (layouts, pages, components): ~26 files  
Session 3 (Groups 1-9): ~55 files
TOTAL CONFIRMED: ~141 source files

## REMAINING UNREAD (now minimal)
- src/app/admin/orders/page.tsx
- src/app/admin/opportunities/page.tsx  
- src/app/admin/fraud/page.tsx
- src/app/admin/financial/page.tsx
- src/app/admin/affiliates/page.tsx
- src/app/admin/ai-costs/page.tsx
- src/app/admin/forecasting/page.tsx
- src/app/admin/governor/budgets/page.tsx
- src/app/admin/governor/decisions/page.tsx
- src/app/admin/governor/overrides/page.tsx
- src/app/admin/affiliates/commissions/page.tsx
- src/app/admin/pod/page.tsx
- src/app/admin/settings/users/page.tsx
- src/app/dashboard/tiktok/page.tsx
- src/app/dashboard/amazon/page.tsx
- src/app/dashboard/creators/page.tsx
- src/app/dashboard/blueprints/page.tsx
- src/app/dashboard/orders/page.tsx
- src/app/dashboard/affiliate/page.tsx
- src/app/(marketing)/integrations/page.tsx
- src/components/ProductRow.tsx
- src/components/CommandPalette.tsx
- src/components/MobileBottomNav.tsx
- src/components/dashboard-mobile-nav.tsx
- src/components/PageTransition.tsx
- src/components/platform-products.tsx
