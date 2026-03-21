# YOUSELL Platform — V9 Inter-Engine Communication Test Strategy

## Exhaustive Test Plan for All Engine-to-Engine Communication Pathways

**Date:** 2026-03-21
**Source Document:** V9_Inter_Engine_Communication_Breakdown.md (148+ communication pathways)
**Current Coverage:** 0% on cross-engine communication (per test audit)
**Goal:** 100% coverage of all inter-engine event chains, data dependencies, queue dispatches, and workflow scenarios

---

## TESTING PHILOSOPHY

### Why This Matters
Individual engines are well-tested (~90% business logic coverage), but **no tests verify that engines actually communicate correctly**. The EventBus infrastructure is solid, but the wiring between real engines — the `handleEvent()` calls, payload transformations, and cascade effects — is completely untested.

### Testing Layers

| Layer | What It Tests | Mock Strategy | File Naming |
|-------|--------------|---------------|-------------|
| **L1: Pairwise Event Chain** | Engine A emits → Engine B receives and processes correctly | Mock Supabase + real EventBus + real engine instances | `inter-engine-L1-*.test.ts` |
| **L2: Multi-Engine Pipeline** | Event cascades through 3+ engines in sequence | Mock Supabase + real EventBus + real engines | `inter-engine-L2-*.test.ts` |
| **L3: Fan-Out Broadcast** | One event reaches all N subscribers simultaneously | Mock Supabase + real EventBus + real engines | `inter-engine-L3-*.test.ts` |
| **L4: Database Dependency** | Engine A writes table → Engine B reads correct data | Mock Supabase with shared mock data store | `inter-engine-L4-*.test.ts` |
| **L5: Queue Dispatch** | Engine A enqueues job → correct worker processes it | Mock BullMQ + real job processors | `inter-engine-L5-*.test.ts` |
| **L6: End-to-End Workflow** | Full scenario from trigger to terminal event | All layers combined | `inter-engine-L6-*.test.ts` |
| **L7: Error & Resilience** | Failures, timeouts, circular bounds, concurrent events | Real EventBus + fault injection | `inter-engine-L7-*.test.ts` |

### Mock Strategy

```
ALWAYS MOCK:
  - Supabase client (database reads/writes)
  - Apify API calls (external scraping)
  - Claude API calls (AI generation)
  - Resend API (email sending)
  - Stripe API (payments)
  - External marketplace APIs

NEVER MOCK:
  - EventBus (use real singleton — this IS what we're testing)
  - EngineRegistry (use real singleton)
  - Engine handleEvent() methods (use real implementations)
  - Event payload types (use real typed payloads)

SELECTIVELY MOCK:
  - BullMQ queues (mock for L1-L4, real for L5)
  - Database result sets (provide realistic mock data)
```

### Test ID Convention

Each test maps to a `Comm #` from V9_Inter_Engine_Communication_Breakdown.md:
- `TC-1.001` tests communication pathway `Comm # 1.001`
- `TC-WF1-S3` tests Workflow 1, Step 3
- `TC-EC-01` tests Edge Case 01

---

## TEST SUITE 1: PAIRWISE EVENT CHAINS — DISCOVERY CLUSTER (Engines 1-5)

**File:** `tests/inter-engine-L1-discovery-cluster.test.ts`
**Engines Under Test:** Discovery, TikTok Discovery, Scoring, Clustering, Trend Detection

---

### 1A: DISCOVERY → SCORING (Comm # 1.001, 3.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-1.001a | Discovery product_discovered reaches Scoring engine | Verify Scoring's handleEvent is called when Discovery emits product_discovered | Register both engines with real EventBus. Mock Supabase to return product data. | Emit `discovery.product_discovered` with valid ProductDiscoveredPayload | Scoring engine's handleEvent receives the event with correct payload (productId, source, keyword, rawData) | 1.001 |
| TC-1.001b | Scoring processes discovered product with correct composite formula | Verify Scoring calculates trend(40%) + viral(35%) + profit(25%) from discovered product | Mock trend_signals table (trend data), tiktok_hashtag_signals table (viral data), products table (price data) | Emit `discovery.product_discovered` → Scoring processes | Scoring emits `scoring.product_scored` with correct composite score and tier assignment | 1.001, 3.001 |
| TC-1.001c | Scoring ignores duplicate product_discovered events | Verify idempotency — same product discovered twice doesn't double-score | Register engines. Emit same product_discovered event twice. | Second emission | Scoring only processes once (checks existing score in DB) | 1.001 |
| TC-1.001d | Discovery product with missing fields still reaches Scoring | Verify partial payloads are handled gracefully | Emit product_discovered with minimal payload (productId only, no rawData) | Event emitted | Scoring receives event, handles missing fields without crash, logs warning | 1.001 |

---

### 1B: DISCOVERY → TREND DETECTION (Comm # 1.002, 5.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-1.002a | Discovery scan_complete reaches Trend Detection | Verify Trend Detection receives scan_complete events | Register both engines. | Emit `discovery.scan_complete` with ScanCompletePayload { keyword: "portable blender", productsFound: 15, source: "tiktok", scanId: "scan-001" } | Trend Detection's handleEvent called with correct payload | 1.002, 5.001 |
| TC-1.002b | Trend Detection processes keyword trajectory from scan data | Verify Trend Detection analyzes the keyword and writes to trend_signals | Mock trend_signals table (empty for new keyword). | Emit scan_complete → Trend Detection processes | Trend Detection writes trend score to mock DB; emits `trend.trend_detected` if score >= threshold | 1.002 |
| TC-1.002c | Trend Detection handles scan_complete for already-tracked keyword | Verify it updates existing trend data rather than creating duplicate | Mock trend_signals with existing entry for "portable blender" | Emit scan_complete for same keyword | Trend Detection updates existing record, recalculates direction (rising/falling/stable) | 1.002 |

---

### 1C: DISCOVERY → TIKTOK DISCOVERY (Comm # 1.003, 2.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-1.003a | Discovery scan_complete reaches TikTok Discovery | Verify TikTok Discovery subscribes to and receives scan_complete | Register both engines. | Emit `discovery.scan_complete` | TikTok Discovery's handleEvent called with ScanCompletePayload | 1.003, 2.001 |
| TC-1.003b | TikTok Discovery triggers TikTok-specific scan for keyword | Verify TikTok Discovery initiates hashtag/video scanning | Mock Apify API responses. | Emit scan_complete → TikTok Discovery processes | TikTok Discovery enqueues `tiktok-discovery` job with the keyword from scan_complete | 1.003 |
| TC-1.003c | TikTok Discovery publishes videos_found after processing | Verify downstream event is emitted | Mock Apify to return 10 videos. | Emit scan_complete → TikTok Discovery processes → emits result | `tiktok.videos_found` event emitted with { query, videosFound: 10, videosStored, hashtagsAnalyzed } | 2.002 |

---

### 1D: DISCOVERY → COMPETITOR INTELLIGENCE (Comm # 1.004, 8.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-1.004a | Discovery product_discovered reaches Competitor Intelligence | Verify Competitor Intelligence receives product_discovered events | Register both engines. | Emit `discovery.product_discovered` | Competitor Intelligence's handleEvent called with ProductDiscoveredPayload | 1.004, 8.001 |
| TC-1.004b | Competitor Intelligence scans rivals for discovered product | Verify competitor scan is initiated | Mock Apify Amazon/eBay/TikTok Shop scrapers. | Emit product_discovered → CI processes | Competitor Intelligence enqueues `competitor-scan` job; eventually emits `competitor.detected` | 1.004 |

---

### 1E: DISCOVERY → AD INTELLIGENCE (Comm # 1.006, 7.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-1.006a | Discovery product_discovered reaches Ad Intelligence | Verify Ad Intelligence receives product_discovered | Register both engines. | Emit `discovery.product_discovered` | Ad Intelligence's handleEvent called with correct payload | 1.006, 7.001 |
| TC-1.006b | Ad Intelligence checks for competitor ads on discovered product | Verify ad scan is initiated | Mock Meta Ads Library, TikTok Creative Center. | Emit product_discovered → AI processes | Ad Intelligence scans for ads; emits `ads.ads_discovered` with results | 1.006 |

---

### 1F: DISCOVERY → DISCOVERY (Internal Queue Chain) (Comm # 1.007)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-1.007a | product-scan enqueues enrich-product job | Verify internal queue chain works | Mock BullMQ queue. | Execute product-scan processor with a new product URL | `enrich-product` job enqueued with { productId, source, rawUrl } | 1.007 |
| TC-1.007b | enrich-product fetches full product details | Verify enrichment populates product record | Mock Apify product detail scraper. | Process enrich-product job | Product record updated in DB with full details (title, price, images, description) | 1.007 |

---

### 1G: DISCOVERY → TREND DETECTION (Queue: trend-scan) (Comm # 1.005, 5.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-1.005a | Discovery enqueues trend-scan job for Trend Detection | Verify queue-based cross-engine communication | Mock BullMQ. | Execute product-scan processor | `trend-scan` job enqueued with { keyword, source, scanId } | 1.005, 5.002 |
| TC-1.005b | Trend Detection's trend-scan worker processes the job | Verify Trend Detection worker handles Discovery's job | Mock Supabase trend_signals table. | Process trend-scan job with { keyword: "portable blender" } | Trend Detection writes trend analysis to DB | 1.005 |

---

### 1H: TIKTOK DISCOVERY → TREND DETECTION (Comm # 2.002, 2.003, 5.003, 5.004)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-2.002a | TikTok Discovery videos_found reaches Trend Detection | Verify Trend Detection receives TikTok video signals | Register both engines. | Emit `tiktok.videos_found` with { query: "portable blender", videosFound: 25, hashtagsAnalyzed: 5 } | Trend Detection's handleEvent called; incorporates video volume as trend signal | 2.002, 5.003 |
| TC-2.003a | TikTok Discovery hashtags_analyzed reaches Trend Detection | Verify hashtag acceleration data flows to Trend Detection | Register both engines. | Emit `tiktok.hashtags_analyzed` with { hashtagsAnalyzed: 8, query: "portable blender" } | Trend Detection's handleEvent called; uses hashtag acceleration in trend scoring | 2.003, 5.004 |
| TC-2.003b | Trend Detection combines TikTok signals with scan signals | Verify multi-source trend analysis | Register TikTok Discovery + Trend Detection. Emit scan_complete first, then videos_found. | Both events processed | Trend Detection's trend score incorporates both scan data AND TikTok data | 2.002, 2.003, 5.003, 5.004 |

---

### 1I: TIKTOK DISCOVERY → SCORING (Shared Table) (Comm # 2.004, 3.011)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-2.004a | TikTok Discovery writes tiktok_hashtag_signals → Scoring reads for viral_score | Verify database-level data dependency | Mock Supabase: TikTok Discovery writes hashtag signals. | TikTok Discovery processes → writes to tiktok_hashtag_signals table → Scoring calculates composite | Scoring's viral_score component (35% weight) uses TikTok hashtag acceleration data | 2.004, 3.011 |
| TC-2.004b | Scoring handles missing TikTok data gracefully | Verify Scoring works when no TikTok data exists | Mock tiktok_hashtag_signals as empty. | Scoring calculates composite score | viral_score defaults to 0 or uses fallback; composite score still valid | 2.004 |

---

### 1J: SCORING → CLUSTERING (Comm # 3.002, 4.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-3.002a | Scoring product_scored reaches Clustering | Verify Clustering receives scored products | Register both engines. | Emit `scoring.product_scored` with { productId, scores: { trend: 75, viral: 80, profit: 60, composite: 73 }, tier: "WARM" } | Clustering's handleEvent called with correct ProductScoredPayload | 3.002, 4.001 |
| TC-3.002b | Clustering groups product into correct cluster | Verify clustering logic processes scored product | Mock product_clusters table with existing clusters. | Emit product_scored → Clustering processes | Clustering assigns product to best-matching cluster or creates new one; emits `clustering.cluster_updated` | 3.002 |
| TC-3.002c | Clustering ignores COLD products (score < 40) | Verify low-score products are not clustered | Emit product_scored with composite: 30, tier: "COLD" | Clustering receives event | Clustering skips processing — COLD products not worth clustering | 3.002 |

---

### 1K: SCORING → TREND DETECTION (Shared Table) (Comm # 5.005, 3.012)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-5.005a | Trend Detection writes trend_signals → Scoring reads for trend_score | Verify Scoring's 40% trend component uses Trend Detection data | Mock Supabase: Trend Detection writes trend score 85 for "portable blender" | Scoring calculates composite for product with keyword "portable blender" | Scoring reads trend_signals, applies 40% weight → trend component = 34 | 5.005, 3.012 |
| TC-5.005b | Scoring handles stale trend data | Verify Scoring behavior when trend data is >24h old | Mock trend_signals with last_updated 48h ago | Scoring calculates composite | Scoring applies staleness penalty or uses cached value with warning | 5.005 |

---

### 1L: CLUSTERING → OPPORTUNITY FEED (Comm # 4.002, 4.003, 20.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-4.002a | Clustering clusters_rebuilt reaches Opportunity Feed | Verify Opportunity Feed refreshes on cluster rebuild | Register both engines. | Emit `clustering.clusters_rebuilt` with { clustersCreated: 5, productsAssigned: 23, errors: 0 } | Opportunity Feed's handleEvent called; refreshes cluster-based views | 4.002, 20.001 |
| TC-4.003a | Clustering cluster_updated reaches Opportunity Feed | Verify individual cluster updates flow | Emit `clustering.cluster_updated` with { clusterId, productCount: 7, avgScore: 72 } | Opportunity Feed receives | Opportunity Feed updates the specific cluster card | 4.003 |

---

### 1M: TREND DETECTION → OPPORTUNITY FEED (Comm # 5.006, 20.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-5.006a | Trend Detection trend_detected reaches Opportunity Feed | Verify trend signals appear in opportunity feed | Register both engines. | Emit `trend.trend_detected` with { keyword: "portable blender", score: 85, direction: "rising", platforms: ["tiktok", "instagram"] } | Opportunity Feed's handleEvent called; highlights products associated with the trend | 5.006, 20.003 |

---

### 1N: TREND DETECTION → ADMIN CC (Comm # 5.008)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-5.008a | Trend Detection direction_changed reaches Admin CC | Verify admin gets alerted on trend reversal | Register both engines. | Emit `trend.direction_changed` with { keyword: "fidget spinner", direction: "falling", previousDirection: "rising" } | Admin CC's handleEvent called; creates operator alert notification | 5.008 |
| TC-5.008b | Admin CC surfaces direction change in dashboard | Verify the alert is actionable | Mock notification system. | Emit direction_changed → Admin CC processes | Admin CC creates alert with: keyword, old direction, new direction, affected product count | 5.008 |

---

### 1O: SCORING FAN-OUT — 8 SIMULTANEOUS SUBSCRIBERS (Comm # 3.002-3.008)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-3.FAN-a | product_scored reaches ALL 8 subscribers simultaneously | Verify fan-out broadcast to: Clustering, Competitor Intel, Supplier Disc, Profitability, Client Alloc, Admin CC, Fulfillment Rec | Register all 9 engines (Scoring + 8 subscribers). | Emit `scoring.product_scored` | All 8 subscriber engines' handleEvent methods called with identical payload | 3.002-3.008 |
| TC-3.FAN-b | Fan-out order independence | Verify no subscriber depends on another's processing order | Register all 9 engines. Add spy on each handleEvent. | Emit product_scored | All 8 handlers called regardless of order; no handler blocks another | 3.002-3.008 |
| TC-3.FAN-c | Fan-out error isolation | Verify one subscriber's error doesn't prevent others from receiving | Register all 9 engines. Make Clustering's handleEvent throw an error. | Emit product_scored | 7 remaining subscribers still receive and process the event; Clustering error logged but isolated | 3.002-3.008 |
| TC-3.FAN-d | Fan-out with COLD product (score < 40) | Verify rejection event reaches all subscribers | Emit `scoring.product_rejected` with { productId, reasons: ["score_below_threshold"] } | All subscribers receive | Downstream engines skip processing for rejected product | 3.010 |

---

### 1P: SCORING INPUTS — DATA DEPENDENCY CHAIN (Comm # 3.011-3.014)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-3.011a | Scoring reads TikTok data for viral_score | Verify viral_score component uses tiktok_hashtag_signals | Mock tiktok_hashtag_signals with acceleration: 0.85, engagement: 0.72 | Score product | viral_score reflects TikTok signals (35% weight in composite) | 3.011 |
| TC-3.012a | Scoring reads trend data for trend_score | Verify trend_score component uses trend_signals | Mock trend_signals with score: 90, direction: "rising" | Score product | trend_score reflects trend data (40% weight in composite) | 3.012 |
| TC-3.013a | Scoring reads product price for profit_score | Verify profit_score uses Discovery's product data | Mock products table with price: $29.99, source: "aliexpress" | Score product | profit_score reflects margin potential based on price point | 3.013 |
| TC-3.014a | Scoring reads competitor data for profit_score adjustment | Verify competitor pricing affects profit_score | Mock competitor_products with avg competitor price: $24.99 | Score product | profit_score adjusted downward due to competitive pricing pressure | 3.014 |
| TC-3.ALL | Full composite score with all 4 data sources | Verify end-to-end scoring with all inputs | Mock all 4 tables with realistic data | Score product | Composite = trend(40%) + viral(35%) + profit(25%) with correct tier assignment | 3.011-3.014 |

---

### SECTION 1 SUMMARY

| Category | Test Count | Comm # Coverage |
|----------|-----------|-----------------|
| Discovery → Scoring | 4 tests | 1.001, 3.001 |
| Discovery → Trend Detection | 3 tests | 1.002, 5.001 |
| Discovery → TikTok Discovery | 3 tests | 1.003, 2.001 |
| Discovery → Competitor Intel | 2 tests | 1.004, 8.001 |
| Discovery → Ad Intelligence | 2 tests | 1.006, 7.001 |
| Discovery internal queue | 2 tests | 1.007 |
| Discovery → Trend (queue) | 2 tests | 1.005, 5.002 |
| TikTok → Trend Detection | 3 tests | 2.002, 2.003, 5.003, 5.004 |
| TikTok → Scoring (DB) | 2 tests | 2.004, 3.011 |
| Scoring → Clustering | 3 tests | 3.002, 4.001 |
| Trend → Scoring (DB) | 2 tests | 5.005, 3.012 |
| Clustering → Opp Feed | 2 tests | 4.002, 4.003, 20.001 |
| Trend → Opp Feed | 1 test | 5.006, 20.003 |
| Trend → Admin CC | 2 tests | 5.008 |
| Scoring Fan-Out (8 subs) | 4 tests | 3.002-3.008, 3.010 |
| Scoring Inputs (4 sources) | 5 tests | 3.011-3.014 |
| **TOTAL SECTION 1** | **42 tests** | **28 Comm # pathways** |

---

## TEST SUITE 2: PAIRWISE EVENT CHAINS — INTELLIGENCE & SUPPLY CLUSTER (Engines 6-10)

**File:** `tests/inter-engine-L1-intelligence-supply.test.ts`
**Engines Under Test:** Creator Matching, Ad Intelligence, Competitor Intelligence, Supplier Discovery, Profitability

---

### 2A: CREATOR MATCHING → OPPORTUNITY FEED (Comm # 6.002, 6.003, 20.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-6.002a | Creator Matching matches_complete reaches Opportunity Feed | Verify Opportunity Feed receives batch match results | Register both engines. | Emit `creator.matches_complete` with { productsMatched: 12, matchesCreated: 34 } | Opportunity Feed's handleEvent called; updates creator match counts in feed | 6.002, 20.002 |
| TC-6.003a | Creator Matching creator_matched reaches Opportunity Feed | Verify individual match updates flow in real-time | Register both engines. | Emit `creator.creator_matched` with { productId, creatorId, matchScore: 0.87, platform: "tiktok" } | Opportunity Feed updates specific product card with new creator match | 6.003 |

---

### 2B: CREATOR MATCHING → LAUNCH BLUEPRINT (Shared Table) (Comm # 6.004, 12.011)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-6.004a | Launch Blueprint reads creator matches for influencer plan | Verify Blueprint assembles creator data | Mock creator_product_matches with 3 matched creators for productId. | Launch Blueprint generates blueprint | Blueprint includes influencer outreach section with creator names, rates, platforms, match scores | 6.004, 12.011 |
| TC-6.004b | Launch Blueprint handles zero creator matches | Verify Blueprint generates without creator section when no matches exist | Mock empty creator_product_matches. | Generate blueprint | Blueprint created successfully with "No creators matched yet" placeholder in influencer section | 6.004 |

---

### 2C: CREATOR MATCHING → FINANCIAL MODELLING (Shared Table) (Comm # 6.006, 11.004)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-6.006a | Financial Modelling reads creator rates for influencer cost projection | Verify Financial Modelling includes influencer costs in ROI | Mock creator_product_matches with rates: $500, $200, $150. | Generate financial model | Financial model includes influencer marketing cost: $850 total; factors into break-even calculation | 6.006, 11.004 |
| TC-6.006b | Financial Modelling handles missing creator rate data | Verify graceful fallback when rates not available | Mock creator_product_matches with no rate data. | Generate financial model | Financial model uses industry average rates as fallback; flags as "estimated" | 6.006 |

---

### 2D: TIKTOK DISCOVERY → CREATOR MATCHING (Shared Tables) (Comm # 2.007, 6.007)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-2.007a | Creator Matching reads TikTok creator profiles from shared tables | Verify Creator Matching sources TikTok creators for matching pool | Mock tiktok_videos and tiktok_creators with 20 creator profiles. | Creator Matching runs for a product | Matching pool includes TikTok creators; match scores consider TikTok engagement rates | 2.007, 6.007 |
| TC-2.007b | Creator Matching handles empty TikTok creator data | Verify matching works with other platforms when TikTok data missing | Mock empty tiktok_creators table. | Creator Matching runs | Matching proceeds with non-TikTok creator sources; no crash | 2.007 |

---

### 2E: AD INTELLIGENCE → OPPORTUNITY FEED (Comm # 7.007, 20.004)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-7.007a | Ad Intelligence ads_discovered reaches Opportunity Feed | Verify ad signals appear in feed | Register both engines. | Emit `ads.ads_discovered` with { adsFound: 8, adsStored: 6 } | Opportunity Feed's handleEvent called; adds ad competition indicator to product cards | 7.007, 20.004 |

---

### 2F: AD INTELLIGENCE → PROFITABILITY (Shared Data) (Comm # 7.004, 10.011)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-7.004a | Profitability reads CPA estimates from Ad Intelligence data | Verify ad costs factor into margin calculation | Mock ad data with estimated CPA: $12.50 per acquisition. | Profitability calculates margins | Net margin reduced by estimated ad spend per unit; flags if ad cost exceeds margin | 7.004, 10.011 |
| TC-7.004b | Profitability handles missing ad data | Verify margin calculation works without ad intelligence | Mock empty ad data. | Profitability calculates | Margin calculated without ad cost deduction; result valid but flagged as "ad cost unknown" | 7.004 |

---

### 2G: AD INTELLIGENCE → COMPETITOR INTELLIGENCE (Shared Data) (Comm # 7.003, 8.009)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-7.003a | Competitor Intelligence enriches profiles with Ad Intelligence ad data | Verify competitor profiles include ad activity | Mock ad creative data for competitor store. | Competitor Intelligence generates competitor profile | Profile includes: ad spend estimate, targeting demographics, creative types used | 7.003, 8.009 |

---

### 2H: COMPETITOR INTELLIGENCE → PROFITABILITY (Comm # 8.003, 10.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-8.003a | Competitor detected event reaches Profitability | Verify Profitability receives competitor pricing data | Register both engines. | Emit `competitor.detected` with { productId, competitorStore: "amazon", price: 24.99, reviews: 150, sellerCount: 8 } | Profitability's handleEvent called; adjusts pricing strategy based on competitor price | 8.003, 10.003 |
| TC-8.003b | Profitability adjusts margins when competitor undercuts | Verify competitive pricing impact on profit_score | Mock current selling price: $29.99. Competitor price: $19.99. | Emit competitor.detected → Profitability recalculates | Margin recalculated with competitive pressure; may trigger margin_alert if below threshold | 8.003 |
| TC-8.003c | Multiple competitors detected — Profitability uses worst-case pricing | Verify Profitability considers all competitors | Emit 3 competitor.detected events with prices: $24.99, $19.99, $29.99 | Profitability processes all | Profitability uses lowest competitor price ($19.99) for conservative margin calculation | 8.003 |

---

### 2I: COMPETITOR INTELLIGENCE → FINANCIAL MODELLING (Comm # 8.004, 11.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-8.004a | Competitor detected event reaches Financial Modelling | Verify Financial Modelling factors competitor pricing into revenue projections | Register both engines. | Emit `competitor.detected` | Financial Modelling's handleEvent called; updates revenue projection with competitive pricing | 8.004, 11.003 |
| TC-8.004b | Financial Modelling adjusts market share estimate with competitor data | Verify ROI model accounts for competition | Mock 5 competitors with strong reviews. | Financial Modelling generates model | ROI projection includes market share reduction based on competitor strength | 8.004 |

---

### 2J: COMPETITOR INTELLIGENCE → SUPPLIER DISCOVERY (Comm # 8.006, 9.007)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-8.006a | Competitor batch_complete reaches Supplier Discovery | Verify Supplier Discovery cross-references competitor data to find shared suppliers | Register both engines. | Emit `competitor.batch_complete` with { productId, keyword: "portable blender", platforms: ["amazon", "ebay"], competitorsFound: 12 } | Supplier Discovery's handleEvent called; uses competitor product data to identify potential shared suppliers | 8.006, 9.007 |
| TC-8.006b | Supplier Discovery finds shared supplier from competitor data | Verify cross-referencing logic | Mock competitor products with identifiable supplier patterns (same factory, similar branding) | Supplier Discovery processes competitor data | Identifies potential shared supplier; flags for verification | 8.006 |

---

### 2K: SCORING → SUPPLIER DISCOVERY (Comm # 3.004, 9.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-3.004a | Scoring product_scored reaches Supplier Discovery | Verify Supplier Discovery receives scored products | Register both engines. | Emit `scoring.product_scored` with { productId, scores: { composite: 72 }, tier: "WARM" } | Supplier Discovery's handleEvent called | 3.004, 9.001 |
| TC-3.004b | Supplier Discovery only searches for WARM+ products (>= 60) | Verify cost-control filter | Emit product_scored with composite: 45, tier: "WATCH" | Supplier Discovery receives | Supplier Discovery skips processing — score below threshold (saves API costs) | 3.004 |
| TC-3.004c | Supplier Discovery initiates AliExpress/Alibaba search for WARM+ product | Verify supplier search triggered | Mock Apify AliExpress scraper. Emit product_scored with composite: 75. | Supplier Discovery processes | Enqueues `supplier-discovery` job; eventually emits `supplier.found` | 3.004 |

---

### 2L: SUPPLIER DISCOVERY → PROFITABILITY (Comm # 9.003, 10.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-9.003a | Supplier found event reaches Profitability | Verify Profitability recalculates with real supplier COGS | Register both engines. | Emit `supplier.found` with { supplierId, productId, price: 8.50, moq: 50, shippingCost: 2.30, platform: "aliexpress" } | Profitability's handleEvent called; recalculates margin with COGS = $8.50 + $2.30 shipping | 9.003, 10.002 |
| TC-9.003b | Profitability improves margin with cheaper supplier | Verify margin update when better supplier found | Initial margin calculation with COGS: $15. New supplier COGS: $8.50. | Emit supplier.found → Profitability recalculates | Margin improves; new profitability.calculated event emitted with updated margins | 9.003 |
| TC-9.003c | Multiple suppliers found — Profitability uses best price | Verify Profitability considers all suppliers | Emit 3 supplier.found events with prices: $8.50, $12.00, $6.75 | Profitability processes all | Uses best supplier ($6.75) for primary margin calculation; records alternatives | 9.003 |

---

### 2M: SUPPLIER DISCOVERY → FINANCIAL MODELLING (Comm # 9.004, 11.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-9.004a | Supplier found event reaches Financial Modelling | Verify Financial Modelling updates COGS projections | Register both engines. | Emit `supplier.found` with supplier pricing data | Financial Modelling's handleEvent called; updates COGS in ROI model | 9.004, 11.002 |
| TC-9.004b | Financial Modelling compares multiple supplier scenarios | Verify scenario analysis with different suppliers | Emit 2 supplier.found events with different pricing | Financial Modelling generates | Model includes best-case and worst-case COGS scenarios | 9.004 |

---

### 2N: SUPPLIER DISCOVERY → LAUNCH BLUEPRINT (Comm # 9.005, 12.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-9.005a | Supplier verified event reaches Launch Blueprint | Verify Launch Blueprint includes verified supplier | Register both engines. | Emit `supplier.verified` with { supplierId, productId, verified: true, score: 92 } | Launch Blueprint's handleEvent called; includes supplier in recommended source section | 9.005, 12.003 |
| TC-9.005b | Launch Blueprint excludes unverified suppliers | Verify only verified suppliers appear in blueprint | Emit supplier.found (not verified) — no supplier.verified event | Launch Blueprint generates | Blueprint does NOT include unverified supplier in recommendations | 9.005 |

---

### 2O: SUPPLIER DISCOVERY → FULFILLMENT RECOMMENDATION (Comm # 9.006, 19.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-9.006a | Supplier found event reaches Fulfillment Recommendation | Verify Fulfillment Rec evaluates supplier capabilities | Register both engines. | Emit `supplier.found` with { moq: 50, shippingCost: 2.30, platform: "aliexpress" } | Fulfillment Rec's handleEvent called; evaluates supplier for dropship viability | 9.006, 19.002 |
| TC-9.006b | Fulfillment Rec recommends POD when supplier MOQ too high | Verify MOQ threshold affects model selection | Emit supplier.found with moq: 500, price: $3.00 | Fulfillment Rec processes | Recommends POD (no inventory risk) instead of bulk (high MOQ commitment) | 9.006 |
| TC-9.006c | Fulfillment Rec recommends dropship when supplier offers fulfillment | Verify fulfillment service detection | Emit supplier.found with fulfillmentService: true, moq: 1 | Fulfillment Rec processes | Recommends dropship model with supplier-managed fulfillment | 9.006 |

---

### 2P: PROFITABILITY → FINANCIAL MODELLING (Comm # 10.004, 11.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-10.004a | Profitability calculated event reaches Financial Modelling | Verify Financial Modelling builds ROI from margin data | Register both engines. | Emit `profitability.calculated` with { productId, margin: 12.50, marginPercent: 42, cogs: 8.50, sellingPrice: 29.99, fees: 8.99 } | Financial Modelling's handleEvent called; builds ROI projection from margin data | 10.004, 11.001 |
| TC-10.004b | Financial Modelling calculates break-even from profitability data | Verify break-even calculation | Emit profitability.calculated with margin: $12.50 per unit, marketing budget: $500 | Financial Modelling processes | Break-even = $500 / $12.50 = 40 units; included in model | 10.004 |

---

### 2Q: PROFITABILITY → SUPPLIER DISCOVERY (Margin Alert Loop) (Comm # 10.006, 9.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-10.006a | Profitability margin_alert reaches Supplier Discovery | Verify margin alert triggers supplier search | Register both engines. | Emit `profitability.margin_alert` with { productId, margin: 3.50, marginPercent: 12, threshold: 20 } | Supplier Discovery's handleEvent called; initiates search for cheaper supplier | 10.006, 9.002 |
| TC-10.006b | Profitability margin_alert reaches Admin CC | Verify admin gets notified of low margins | Register Profitability + Admin CC. | Emit margin_alert | Admin CC's handleEvent called; creates low-margin alert for operator | 10.010 |
| TC-10.006c | Margin alert loop bounded at 3 iterations | Verify the feedback loop doesn't run infinitely | Setup: margin stays below 20% after each supplier search. | Supplier Discovery finds supplier → Profitability recalculates → still low → repeat | Loop terminates after 3 iterations; final margin_alert flags for manual review | 9.010 |

---

### 2R: PROFITABILITY → LAUNCH BLUEPRINT (Comm # 10.005, 12.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-10.005a | Profitability calculated event reaches Launch Blueprint | Verify Launch Blueprint includes margin analysis | Register both engines. | Emit `profitability.calculated` | Launch Blueprint's handleEvent called; includes margin analysis and pricing strategy section | 10.005, 12.002 |

---

### 2S: PROFITABILITY → FULFILLMENT RECOMMENDATION (Comm # 10.007, 19.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-10.007a | Profitability calculated event reaches Fulfillment Rec | Verify margin data influences fulfillment model | Register both engines. | Emit `profitability.calculated` with marginPercent: 15 | Fulfillment Rec's handleEvent called; low margin → recommends POD (lower margin OK, no risk) | 10.007, 19.003 |
| TC-10.007b | High margin triggers bulk fulfillment recommendation | Verify high margins enable riskier models | Emit profitability.calculated with marginPercent: 55 | Fulfillment Rec processes | Recommends bulk purchasing (high margin justifies inventory risk) | 10.007 |

---

### SECTION 2 SUMMARY

| Category | Test Count | Comm # Coverage |
|----------|-----------|-----------------|
| Creator Matching → Opportunity Feed | 2 tests | 6.002, 6.003, 20.002 |
| Creator Matching → Launch Blueprint (DB) | 2 tests | 6.004, 12.011 |
| Creator Matching → Financial Modelling (DB) | 2 tests | 6.006, 11.004 |
| TikTok Discovery → Creator Matching (DB) | 2 tests | 2.007, 6.007 |
| Ad Intelligence → Opportunity Feed | 1 test | 7.007, 20.004 |
| Ad Intelligence → Profitability (DB) | 2 tests | 7.004, 10.011 |
| Ad Intelligence → Competitor Intel (DB) | 1 test | 7.003, 8.009 |
| Competitor Intel → Profitability | 3 tests | 8.003, 10.003 |
| Competitor Intel → Financial Modelling | 2 tests | 8.004, 11.003 |
| Competitor Intel → Supplier Discovery | 2 tests | 8.006, 9.007 |
| Scoring → Supplier Discovery | 3 tests | 3.004, 9.001 |
| Supplier Discovery → Profitability | 3 tests | 9.003, 10.002 |
| Supplier Discovery → Financial Modelling | 2 tests | 9.004, 11.002 |
| Supplier Discovery → Launch Blueprint | 2 tests | 9.005, 12.003 |
| Supplier Discovery → Fulfillment Rec | 3 tests | 9.006, 19.002 |
| Profitability → Financial Modelling | 2 tests | 10.004, 11.001 |
| Profitability → Supplier Discovery (loop) | 3 tests | 10.006, 9.002, 9.010 |
| Profitability → Launch Blueprint | 1 test | 10.005, 12.002 |
| Profitability → Fulfillment Rec | 2 tests | 10.007, 19.003 |
| **TOTAL SECTION 2** | **40 tests** | **38 Comm # pathways** |

---

## TEST SUITE 3: PAIRWISE EVENT CHAINS — LAUNCH & FULFILLMENT CLUSTER (Engines 11-20)

**File:** `tests/inter-engine-L1-launch-fulfillment.test.ts`
**Engines Under Test:** Financial Modelling, Launch Blueprint, Client Allocation, Content Creation, Store Integration, Order Tracking, Admin Command Center, Affiliate Commission, Fulfillment Recommendation, Opportunity Feed

---

### 3A: FINANCIAL MODELLING → LAUNCH BLUEPRINT (Comm # 11.006, 11.007, 12.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-11.006a | Financial model_generated reaches Launch Blueprint | Verify Launch Blueprint triggers generation from financial model | Register both engines. | Emit `financial.model_generated` with { productId, roi: 3.2, breakEvenUnits: 40, projectedRevenue: 12000, marketingBudget: 1500 } | Launch Blueprint's handleEvent called; starts blueprint generation with financial data | 11.006, 12.001 |
| TC-11.007a | Financial roi_projected reaches Launch Blueprint | Verify ROI projection data flows to blueprint | Register both engines. | Emit `financial.roi_projected` with { productId, roi: 3.2, breakEvenConversions: 40, influencerCost: 850 } | Launch Blueprint includes ROI expectations and break-even timeline in business case section | 11.007 |
| TC-11.006b | Launch Blueprint waits for all upstream data before generating | Verify Blueprint doesn't generate prematurely | Register Financial Modelling + Launch Blueprint. Only send financial model (no supplier/profitability). | Emit financial.model_generated only | Launch Blueprint queues the financial data but waits for minimum required inputs before generating | 11.006 |

---

### 3B: LAUNCH BLUEPRINT → CLIENT ALLOCATION (Comm # 12.004, 13.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-12.004a | Blueprint approved event reaches Client Allocation | Verify Client Allocation activates on blueprint approval | Register both engines. | Emit `blueprint.approved` with { blueprintId, productId, approvedBy: "admin@yousell.online", approvedAt: "2026-03-21T10:00:00Z" } | Client Allocation's handleEvent called; begins matching product to eligible clients | 12.004, 13.002 |
| TC-12.004b | Client Allocation matches product to correct client tier | Verify tier-based allocation logic | Mock client pool: 3 Premium, 5 Standard, 10 Starter. Product tier: HOT (score 85). | Emit blueprint.approved → Client Allocation processes | HOT product allocated to Premium client first; emits `allocation.product_allocated` | 12.004 |
| TC-12.004c | Client Allocation skips when no eligible clients | Verify graceful handling of empty client pool | Mock empty client pool (all at capacity). | Emit blueprint.approved | Client Allocation logs "no eligible clients"; does NOT emit allocation event; flags for admin review | 12.004 |

---

### 3C: LAUNCH BLUEPRINT → CONTENT CREATION (Comm # 12.005, 14.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-12.005a | Blueprint approved event reaches Content Creation | Verify Content Creation begins generating on approval | Register both engines. | Emit `blueprint.approved` | Content Creation's handleEvent called; enqueues content generation jobs | 12.005, 14.001 |
| TC-12.005b | Content Creation generates all content types for approved product | Verify full content suite generated | Mock Claude API responses. | Emit blueprint.approved → Content Creation processes | Generates: product description, ad copy (3 variants), social media posts, SEO metadata; emits `content.generated` for each | 12.005 |

---

### 3D: LAUNCH BLUEPRINT → STORE INTEGRATION (Comm # 12.006, 15.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-12.006a | Blueprint approved event reaches Store Integration | Verify Store Integration prepares listing on approval | Register both engines. | Emit `blueprint.approved` | Store Integration's handleEvent called; prepares product listing data for target store | 12.006, 15.001 |
| TC-12.006b | Store Integration waits for content before pushing | Verify Store Integration doesn't push without content | Emit blueprint.approved but no content.generated yet. | Store Integration receives blueprint.approved | Store Integration queues the listing but waits for content.generated before pushing to store | 12.006 |

---

### 3E: BLUEPRINT APPROVED FAN-OUT — 3 SIMULTANEOUS SUBSCRIBERS (Comm # 12.004-12.006)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-12.FAN-a | blueprint.approved reaches all 3 subscribers simultaneously | Verify fan-out to Client Allocation, Content Creation, Store Integration | Register all 4 engines (Launch Blueprint + 3 subscribers). | Emit `blueprint.approved` | All 3 subscriber engines' handleEvent methods called with identical payload | 12.004-12.006 |
| TC-12.FAN-b | Blueprint fan-out error isolation | Verify one subscriber's failure doesn't block others | Make Content Creation's handleEvent throw. | Emit blueprint.approved | Client Allocation and Store Integration still receive and process; Content Creation error logged | 12.004-12.006 |

---

### 3F: CLIENT ALLOCATION → CONTENT CREATION (Comm # 13.003, 14.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-13.003a | Allocation product_allocated reaches Content Creation | Verify Content Creation generates client-branded content | Register both engines. | Emit `allocation.product_allocated` with { productId, clientId: "client-001", tier: "Premium", allocatedAt } | Content Creation's handleEvent called; generates client-specific branded content | 13.003, 14.002 |
| TC-13.003b | Content Creation uses client brand guidelines | Verify content customization per client | Mock client profile with brand voice: "professional", colors: "#2563EB". | Emit allocation.product_allocated → Content Creation processes | Generated content matches client's brand voice and style; not generic | 13.003 |

---

### 3G: CLIENT ALLOCATION → STORE INTEGRATION (Comm # 13.004, 15.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-13.004a | Allocation product_allocated reaches Store Integration | Verify Store Integration pushes to client's store | Register both engines. | Emit `allocation.product_allocated` with { productId, clientId: "client-001" } | Store Integration's handleEvent called; identifies client's connected store for push | 13.004, 15.002 |
| TC-13.004b | Store Integration handles client with no connected store | Verify graceful handling | Mock client with no store connection (storeId: null). | Emit allocation.product_allocated | Store Integration logs warning "client has no connected store"; does NOT attempt push; flags for admin | 13.004 |

---

### 3H: CONTENT CREATION → STORE INTEGRATION (Comm # 14.004, 15.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-14.004a | Content generated event reaches Store Integration | Verify Store Integration uses generated content for listing | Register both engines. | Emit `content.generated` with { productId, contentType: "product_description", content: "...", platform: "shopify" } | Store Integration's handleEvent called; uses content for product listing title, description, images | 14.004, 15.003 |
| TC-14.004b | Store Integration assembles multi-type content into listing | Verify Store Integration combines description + images + SEO | Emit 3 content.generated events: product_description, image_set, seo_metadata. | Store Integration processes all 3 | Creates complete Shopify product listing with all content types combined | 14.004 |

---

### 3I: STORE INTEGRATION → ORDER TRACKING (Comm # 15.004, 15.005, 16.001, 16.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-15.004a | Store product_pushed reaches Order Tracking | Verify Order Tracking begins monitoring pushed product | Register both engines. | Emit `store.product_pushed` with { productId, storeId: "shop-001", platform: "shopify", listingUrl: "https://..." } | Order Tracking's handleEvent called; registers product for order monitoring | 15.004, 16.001 |
| TC-15.005a | Store sync_complete reaches Order Tracking | Verify Order Tracking refreshes after sync | Register both engines. | Emit `store.sync_complete` with { clientId, storeId, productsUpdated: 5 } | Order Tracking's handleEvent called; refreshes order data for synced products | 15.005, 16.002 |

---

### 3J: STORE INTEGRATION → AFFILIATE COMMISSION (Comm # 15.006, 18.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-15.006a | Store product_pushed reaches Affiliate Commission | Verify Affiliate Commission sets up tracking | Register both engines. | Emit `store.product_pushed` with { productId, storeId, platform: "shopify" } | Affiliate Commission's handleEvent called; creates affiliate tracking links for the product | 15.006, 18.003 |
| TC-15.006b | Affiliate Commission generates correct tracking URLs | Verify tracking link format | Mock affiliate config with commission rate: 15%. | Emit store.product_pushed → Affiliate Commission processes | Tracking links generated with correct UTM parameters and commission rate assignment | 15.006 |

---

### 3K: STORE INTEGRATION → CONTENT CREATION (Bidirectional) (Comm # 15.007, 14.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-15.007a | Store product_pushed triggers Content Creation optimization | Verify Content Creation generates platform-specific optimizations | Register both engines. | Emit `store.product_pushed` with { platform: "tiktok_shop" } | Content Creation's handleEvent called; generates TikTok Shop-specific content optimizations | 15.007, 14.003 |
| TC-15.007b | Content ↔ Store bidirectional loop bounded at 2 iterations | Verify no infinite loop between Content and Store | Track event count between both engines. | Content generates → Store pushes → Content optimizes → Store updates → STOP | Loop completes after 2 iterations; no third cycle | 15.007 |

---

### 3L: STORE INTEGRATION → ADMIN CC (Comm # 15.008, 15.009, 17.013)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-15.008a | Store connected event reaches Admin CC | Verify Admin CC updates store dashboard | Register both engines. | Emit `store.connected` with { clientId, platform: "shopify", storeId: "shop-001" } | Admin CC's handleEvent called; updates store connection status in dashboard | 15.008, 17.013 |
| TC-15.009a | Store sync_complete reaches Admin CC | Verify Admin CC shows sync results | Register both engines. | Emit `store.sync_complete` with { clientId, storeId, productsUpdated: 8 } | Admin CC updates sync status dashboard with products synced count | 15.009, 17.013 |

---

### 3M: ORDER TRACKING → ADMIN CC (Comm # 16.003, 16.006, 16.007, 17.001-17.003)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-16.003a | Order received event reaches Admin CC | Verify Admin CC shows new order notification | Register both engines. | Emit `order.received` with { orderId, productId, storeId, customer: { name, email }, amount: 29.99 } | Admin CC's handleEvent called; creates new order notification; updates revenue dashboard | 16.003, 17.003 |
| TC-16.006a | Order fulfilled event reaches Admin CC | Verify Admin CC updates fulfillment status | Register both engines. | Emit `order.fulfilled` with { orderId, trackingNumber: "1Z999...", carrier: "UPS", fulfilledAt } | Admin CC updates order status from "pending" to "fulfilled" in dashboard | 16.006 |
| TC-16.007a | Order tracking_sent reaches Admin CC | Verify Admin CC logs notification status | Register both engines. | Emit `order.tracking_sent` with { orderId, customerEmail: "buyer@email.com", sent: true } | Admin CC logs tracking email sent status for the order | 16.007 |

---

### 3N: ORDER TRACKING → AFFILIATE COMMISSION (Comm # 16.004, 16.005, 18.001, 18.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-16.004a | Order received event reaches Affiliate Commission | Verify commission recorded as pending | Register both engines. | Emit `order.received` with { orderId, productId, amount: 29.99 } | Affiliate Commission's handleEvent called; records pending commission at configured rate | 16.004, 18.001 |
| TC-16.004b | Affiliate Commission calculates correct commission amount | Verify commission rate applied | Mock commission rate: 15% for this product. Order amount: $29.99. | Emit order.received → Affiliate Commission processes | Commission recorded: $4.50 (15% of $29.99); status: "pending" | 16.004 |
| TC-16.005a | Order fulfilled event confirms commission payable | Verify commission moves from pending to payable | Emit order.received first (creates pending commission), then emit order.fulfilled. | order.fulfilled processed | Commission status changes from "pending" to "payable"; affiliate.commission_recorded emitted | 16.005, 18.002 |
| TC-16.005b | Unfulfilled orders don't generate payable commissions | Verify commission stays pending without fulfillment | Emit order.received only (no order.fulfilled). | Commission stays pending | Commission remains in "pending" status; NOT included in payout calculations | 16.005 |

---

### 3O: ADMIN CC → DISCOVERY (Manual Trigger) (Comm # 1.008, 17.004)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-17.004a | Admin CC triggers product scan via API | Verify manual scan trigger works | Mock BullMQ product-scan queue. | Admin CC dispatches scan job with { keywords: ["portable blender"], sources: ["tiktok", "amazon"] } | `product-scan` job enqueued with correct parameters; Discovery processes it | 1.008, 17.004 |
| TC-17.004b | Admin CC scan trigger with multiple keywords | Verify batch keyword scan | Dispatch with 5 keywords. | Admin CC enqueues 5 jobs | 5 separate product-scan jobs enqueued; each processed independently | 17.004 |

---

### 3P: ADMIN CC → SCORING (Manual Trigger) (Comm # 17.005)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-17.005a | Admin CC triggers re-scoring via API | Verify manual re-scoring works | Mock scoring queue. | Admin CC dispatches re-score with { productIds: ["prod-001", "prod-002"] } | scoring-queue jobs enqueued for each product; Scoring recalculates and emits updated product_scored events | 17.005 |

---

### 3Q: ADMIN CC → STORE INTEGRATION (Deploy) (Comm # 17.007, 17.008)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-17.007a | Admin CC one-click deploy reaches Store Integration | Verify direct deployment works | Register both engines. | Emit `admin.product_deployed` with { productId, targetStore: "yousell-shopify", deploymentId, deployedBy: "admin" } | Store Integration's handleEvent called; pushes product to YOUSELL's own store | 17.007 |
| TC-17.008a | Admin CC batch deploy reaches Store Integration | Verify batch deployment works | Register both engines. | Emit `admin.batch_deploy_complete` with { productCount: 10, deployed: 8, failed: 2, targetStore, deployedBy } | Store Integration processes batch results; triggers sync for deployed products | 17.008 |

---

### 3R: FULFILLMENT RECOMMENDATION → LAUNCH BLUEPRINT (Comm # 19.004, 12.003 extended)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-19.004a | Fulfillment recommended event reaches Launch Blueprint | Verify Launch Blueprint includes fulfillment model | Register both engines. | Emit `fulfillment.recommended` with { productId, recommendedType: "dropship", confidence: 0.87, reasoning: "low MOQ, supplier offers fulfillment" } | Launch Blueprint includes fulfillment model recommendation in operations section | 19.004 |
| TC-19.004b | Launch Blueprint uses fulfillment model for cost calculations | Verify fulfillment type affects blueprint content | Emit fulfillment.recommended with type: "POD" (Printful). | Launch Blueprint generates | Blueprint operations section specifies Printful as fulfillment partner; no inventory required | 19.004 |

---

### 3S: FULFILLMENT RECOMMENDATION → STORE INTEGRATION (Comm # 19.005)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-19.005a | Fulfillment recommended event reaches Store Integration | Verify Store Integration configures fulfillment settings | Register both engines. | Emit `fulfillment.recommended` with { recommendedType: "POD" } | Store Integration configures Printful integration for the product listing | 19.005 |
| TC-19.005b | Store Integration configures dropship fulfillment correctly | Verify dropship configuration | Emit fulfillment.recommended with type: "dropship", supplier with direct ship capability. | Store Integration processes | Product listing configured with supplier's shipping settings; no Printful integration | 19.005 |

---

### 3T: FULFILLMENT RECOMMENDATION → ADMIN CC (Override) (Comm # 19.006)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-19.006a | Fulfillment overridden event reaches Admin CC | Verify admin override is logged | Register both engines. | Emit `fulfillment.overridden` with { productId, overriddenType: "bulk", reason: "admin prefers no inventory risk" } | Admin CC's handleEvent called; logs override with reason for audit trail | 19.006 |

---

### 3U: SCORING → CLIENT ALLOCATION (Comm # 3.006, 13.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-3.006a | Scoring product_scored reaches Client Allocation | Verify Client Allocation receives score tier info | Register both engines. | Emit `scoring.product_scored` with tier: "HOT" | Client Allocation's handleEvent called; considers score tier when allocating | 3.006, 13.001 |

---

### 3V: SCORING → ADMIN CC (Comm # 3.007, 17.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-3.007a | Scoring product_scored reaches Admin CC | Verify Admin CC updates score displays | Register both engines. | Emit `scoring.product_scored` with { productId, tier: "HOT", scores: { composite: 87 } } | Admin CC updates product card with score badge and tier indicator | 3.007, 17.001 |

---

### 3W: SCORING → FULFILLMENT RECOMMENDATION (Comm # 3.008, 19.001)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-3.008a | Scoring product_scored reaches Fulfillment Rec | Verify score tier influences fulfillment model | Register both engines. | Emit `scoring.product_scored` with tier: "HOT", composite: 92 | Fulfillment Rec's handleEvent called; HOT products may justify bulk purchasing (higher commitment, higher reward) | 3.008, 19.001 |
| TC-3.008b | WATCH products default to POD | Verify low-score products get low-risk fulfillment | Emit product_scored with tier: "WATCH", composite: 45 | Fulfillment Rec processes | Recommends POD (minimal investment for uncertain products) | 3.008 |

---

### 3X: LAUNCH BLUEPRINT → ADMIN CC (Comm # 12.007, 17.002)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-12.007a | Blueprint generated event reaches Admin CC | Verify Admin CC displays blueprint for review | Register both engines. | Emit `blueprint.generated` with { productId, blueprint: {...}, sections: ["pricing", "suppliers", "marketing", "operations"] } | Admin CC's handleEvent called; displays blueprint with "Approve" and "Reject" buttons | 12.007, 17.002 |

---

### 3Y: CLIENT ALLOCATION → ADMIN CC (Comm # 13.005, 17.012)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-13.005a | Allocation batch_complete reaches Admin CC | Verify Admin CC shows allocation results | Register both engines. | Emit `allocation.batch_complete` with { productCount: 20, allocated: 15, skipped: 5, tier: "HOT" } | Admin CC updates allocation dashboard with batch summary | 13.005, 17.012 |

---

### 3Z: CONTENT CREATION → ADMIN CC (Comm # 14.005, 17.011)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-14.005a | Content batch_complete reaches Admin CC | Verify Admin CC shows AI credit usage | Register both engines. | Emit `content.batch_complete` with { requestCount: 50, generated: 47, failed: 3, totalCredits: 0.85 } | Admin CC displays content generation stats and AI credit consumption | 14.005, 17.011 |

---

### 3AA: OPPORTUNITY FEED — PURE AGGREGATOR (Comm # 20.005-20.014)

| Test ID | Test Name | Description | Setup | Action | Expected Result | Comm # |
|---------|-----------|-------------|-------|--------|----------------|--------|
| TC-20.005a | Opportunity Feed reads products table correctly | Verify product data aggregation | Mock products table with 10 scored products. | Opportunity Feed queries | Returns all products with scores, tiers, sources | 20.005 |
| TC-20.006a | Opportunity Feed reads product_clusters table | Verify cluster grouping in feed | Mock product_clusters with 3 clusters. | Opportunity Feed queries | Products displayed with cluster groupings | 20.006 |
| TC-20.007a | Opportunity Feed reads creator_product_matches | Verify creator match display | Mock matches for 5 products. | Opportunity Feed queries | Products show matched creator count and top creator info | 20.007 |
| TC-20.008a | Opportunity Feed reads product_allocations | Verify allocation status display | Mock allocations for 3 products. | Opportunity Feed queries | Products show "Allocated to Client X" vs "Available" status | 20.008 |
| TC-20.009a | Opportunity Feed reads launch_blueprints | Verify blueprint status display | Mock blueprints: 2 approved, 3 pending, 1 rejected. | Opportunity Feed queries | Products show blueprint status badges | 20.009 |
| TC-20.010a | Opportunity Feed reads financial_models | Verify ROI display | Mock financial models with ROI projections. | Opportunity Feed queries | Products show ROI percentage and break-even estimate | 20.010 |
| TC-20.ALL | Opportunity Feed aggregates all 9 tables correctly | Verify full aggregation | Mock all 9 tables with interconnected data. | Opportunity Feed generates unified view | Unified feed with: products + scores + clusters + creators + allocations + blueprints + financials + trends + suppliers + competitors | 20.005-20.013 |

---

### SECTION 3 SUMMARY

| Category | Test Count | Comm # Coverage |
|----------|-----------|-----------------|
| Financial Modelling → Launch Blueprint | 3 tests | 11.006, 11.007, 12.001 |
| Launch Blueprint → Client Allocation | 3 tests | 12.004, 13.002 |
| Launch Blueprint → Content Creation | 2 tests | 12.005, 14.001 |
| Launch Blueprint → Store Integration | 2 tests | 12.006, 15.001 |
| Blueprint Approved Fan-Out | 2 tests | 12.004-12.006 |
| Client Allocation → Content Creation | 2 tests | 13.003, 14.002 |
| Client Allocation → Store Integration | 2 tests | 13.004, 15.002 |
| Content Creation → Store Integration | 2 tests | 14.004, 15.003 |
| Store Integration → Order Tracking | 2 tests | 15.004, 15.005 |
| Store Integration → Affiliate Commission | 2 tests | 15.006, 18.003 |
| Store ↔ Content (bidirectional) | 2 tests | 15.007, 14.003 |
| Store Integration → Admin CC | 2 tests | 15.008, 15.009 |
| Order Tracking → Admin CC | 3 tests | 16.003, 16.006, 16.007 |
| Order Tracking → Affiliate Commission | 4 tests | 16.004, 16.005, 18.001, 18.002 |
| Admin CC → Discovery (manual) | 2 tests | 1.008, 17.004 |
| Admin CC → Scoring (manual) | 1 test | 17.005 |
| Admin CC → Store Integration (deploy) | 2 tests | 17.007, 17.008 |
| Fulfillment Rec → Launch Blueprint | 2 tests | 19.004 |
| Fulfillment Rec → Store Integration | 2 tests | 19.005 |
| Fulfillment Rec → Admin CC | 1 test | 19.006 |
| Scoring → Client Allocation | 1 test | 3.006, 13.001 |
| Scoring → Admin CC | 1 test | 3.007, 17.001 |
| Scoring → Fulfillment Rec | 2 tests | 3.008, 19.001 |
| Launch Blueprint → Admin CC | 1 test | 12.007, 17.002 |
| Client Allocation → Admin CC | 1 test | 13.005, 17.012 |
| Content Creation → Admin CC | 1 test | 14.005, 17.011 |
| Opportunity Feed Aggregation | 7 tests | 20.005-20.013 |
| **TOTAL SECTION 3** | **57 tests** | **52 Comm # pathways** |

---

## TEST SUITE 4A: END-TO-END WORKFLOWS 1-2

**File:** `tests/inter-engine-L6-workflows.test.ts`
**Purpose:** Verify complete multi-engine event cascades that represent real business flows

---

### WORKFLOW 1: FULL PRODUCT LIFECYCLE (Discovery → Sale)

**The longest pipeline in the system: 19 steps, 15+ engines, 20+ events**

#### Phase A: Discovery & Intelligence (Steps 1-5)

| Test ID | Test Name | Description | Setup | Trigger | Expected Cascade | Steps |
|---------|-----------|-------------|-------|---------|-----------------|-------|
| TC-WF1-S1 | Admin triggers product scan | Verify manual scan dispatches Discovery job | Mock BullMQ, Supabase. | Admin CC dispatches `product-scan` job with { keywords: ["portable blender"], sources: ["tiktok"] } | Discovery receives job; begins scanning | Step 1 |
| TC-WF1-S2a | Discovery publishes product_discovered to 3 subscribers | Verify fan-out after product found | Discovery finds product. | Discovery emits `discovery.product_discovered` | Scoring, Competitor Intel, and Ad Intel all receive the event simultaneously | Step 2 |
| TC-WF1-S2b | Discovery publishes scan_complete to 2 subscribers | Verify scan batch completion fan-out | Discovery completes scan batch. | Discovery emits `discovery.scan_complete` | Trend Detection AND TikTok Discovery both receive the event | Step 2b |
| TC-WF1-S2c | Discovery enqueues trend-scan job | Verify queue-based handoff to Trend Detection | Discovery's product-scan processor completes. | `trend-scan` job enqueued | BullMQ queue receives { keyword: "portable blender", source: "tiktok", scanId } | Step 2c |
| TC-WF1-S2d | Discovery self-enqueues enrich-product | Verify internal enrichment pipeline | Discovery finds new product URL. | `enrich-product` job enqueued | Discovery enrichment worker receives { productId, source, rawUrl } | Step 2d |
| TC-WF1-S3 | Trend Detection analyzes keyword and writes trend_signals | Verify trend analysis from scan data | Trend Detection receives scan_complete. Mock trend_signals table. | Trend Detection processes scan data | Writes trend score to DB; emits `trend.trend_detected` with { keyword, score, direction: "rising" } | Step 3 |
| TC-WF1-S4 | TikTok Discovery scans and publishes to Trend Detection | Verify TikTok video/hashtag analysis | TikTok Discovery receives scan_complete. Mock Apify. | TikTok Discovery processes | Emits `tiktok.videos_found` AND `tiktok.hashtags_analyzed` → both reach Trend Detection | Step 4 |
| TC-WF1-S5 | Scoring calculates composite from 4 data sources | Verify full scoring pipeline | Mock: trend_signals (85), tiktok_hashtag_signals (accel: 0.8), products ($29.99), competitor_products (avg: $24.99). | Scoring receives product_discovered + reads 4 tables | Emits `scoring.product_scored` with composite ~77, tier: "WARM" | Step 5 |

#### Phase B: Analysis & Supply Chain (Steps 6-10)

| Test ID | Test Name | Description | Setup | Trigger | Expected Cascade | Steps |
|---------|-----------|-------------|-------|---------|-----------------|-------|
| TC-WF1-S6 | Scoring fan-out triggers Competitor Intelligence (score >= 60) | Verify threshold gate | Score: 77 (WARM). | `scoring.product_scored` emitted | Competitor Intel receives; scans; emits `competitor.detected` → Profitability, Financial Modelling | Step 6 |
| TC-WF1-S6b | Competitor batch_complete triggers Supplier Discovery | Verify cross-reference flow | Competitor Intel finishes scanning. | Emits `competitor.batch_complete` | Supplier Discovery receives; cross-references competitor data | Step 6b |
| TC-WF1-S7 | Scoring fan-out triggers Supplier Discovery (score >= 60) | Verify supplier search initiated | Score: 77. | `scoring.product_scored` emitted | Supplier Discovery searches AliExpress; emits `supplier.found` → Profitability, Financial Modelling, Fulfillment Rec | Step 7 |
| TC-WF1-S7b | Verified supplier reaches Launch Blueprint | Verify verification gate | Supplier passes checks. | `supplier.verified` emitted | Launch Blueprint receives verified supplier data | Step 7b |
| TC-WF1-S8 | Profitability calculates margins from supplier + competitor | Verify multi-source margin calculation | COGS: $8.50. Competitor avg: $24.99. Selling: $29.99. | Profitability receives supplier.found + competitor.detected | Emits `profitability.calculated` { margin: 12.50, marginPercent: 42% } | Step 8 |
| TC-WF1-S8b | Low margin triggers margin_alert cascade | Verify margin < 20% path | COGS: $22. Selling: $29.99. Margin: 8%. | Profitability calculates | Emits `profitability.margin_alert` → Supplier Discovery + Admin CC | Step 8b |
| TC-WF1-S9 | Fulfillment Rec recommends model | Verify fulfillment selection | MOQ: 1, margin: 42%. | Receives supplier.found + profitability.calculated | Emits `fulfillment.recommended` { type: "dropship" } → Launch Blueprint, Store Integration | Step 9 |
| TC-WF1-S10 | Financial Modelling builds ROI | Verify comprehensive model | All financial data available. | Receives profitability + supplier + competitor data | Emits `financial.model_generated` { roi: 3.2, breakEvenUnits: 40 } → Launch Blueprint | Step 10 |

#### Phase C: Launch Preparation (Steps 11-15)

| Test ID | Test Name | Description | Setup | Trigger | Expected Cascade | Steps |
|---------|-----------|-------------|-------|---------|-----------------|-------|
| TC-WF1-S11 | Creator Matching runs in parallel with analysis | Verify parallel execution | Score: 77. Mock creator DB. | Receives product_scored (parallel with 6-10) | Emits `creator.matches_complete` { matchesCreated: 5 } → Opportunity Feed | Step 11 |
| TC-WF1-S12 | Launch Blueprint generates comprehensive plan | Verify all data assembled | All upstream data ready. | Blueprint has all required inputs | Emits `blueprint.generated` → Admin CC | Step 12 |
| TC-WF1-S13 | Admin approval triggers 3-way fan-out | Verify CRITICAL manual gate | Admin approves. | `blueprint.approved` emitted | Client Allocation + Content Creation + Store Integration all receive | Step 13 |
| TC-WF1-S14 | Client Allocation assigns product to client | Verify tier-based allocation | Premium clients available. | Receives blueprint.approved | Emits `allocation.product_allocated` { clientId, tier: "Premium" } | Step 14 |
| TC-WF1-S15 | Content Creation generates client-branded content | Verify AI generation | Mock Claude Haiku. | Receives allocation.product_allocated | Emits `content.generated` for description + ad copy + SEO | Step 15 |

#### Phase D: Deployment & Sales (Steps 16-19)

| Test ID | Test Name | Description | Setup | Trigger | Expected Cascade | Steps |
|---------|-----------|-------------|-------|---------|-----------------|-------|
| TC-WF1-S16 | Store Integration pushes to Shopify | Verify store push with content | Content + allocation ready. Mock Shopify API. | Receives content.generated | Emits `store.product_pushed` → Order Tracking, Affiliate Commission, Content Creation | Step 16 |
| TC-WF1-S17 | Order Tracking detects new order | Verify order capture | Mock Shopify webhook. | Order received | Emits `order.received` { amount: 29.99 } → Admin CC, Affiliate Commission | Step 17 |
| TC-WF1-S18 | Affiliate Commission records pending commission | Verify tracking | Rate: 15%. Amount: $29.99. | Receives order.received | Records $4.50 commission, status: "pending" | Step 18 |
| TC-WF1-S19 | Order fulfillment completes lifecycle | Verify end-to-end | Fulfilled with tracking. | `order.fulfilled` + `order.tracking_sent` emitted | Admin CC updated; commission → "payable"; tracking email sent | Step 19 |

#### Workflow 1 — Full Chain Validation

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| TC-WF1-FULL | Complete 19-step lifecycle end-to-end | Wire all 15+ engines. Trigger step 1. Verify 2-12 auto-complete. Manually trigger step 13. Verify 14-19 auto-complete. Confirm: order.fulfilled received, commission recorded, tracking sent. |
| TC-WF1-TRACE | Correlation IDs trace through entire lifecycle | Verify single correlationId propagates from Discovery → Order Tracking across all 19 steps. |
| TC-WF1-COLD | COLD product terminates at step 5 | Emit scoring.product_rejected. Verify NO engines from steps 6-19 activate. |

---

### WORKFLOW 2: TREND REVERSAL RESPONSE

**Reactive workflow: 7 steps, 5 engines, operator decision required**

| Test ID | Test Name | Description | Setup | Trigger | Expected Cascade | Steps |
|---------|-----------|-------------|-------|---------|-----------------|-------|
| TC-WF2-S1 | Trend Detection detects direction reversal | Verify trend monitoring | Mock: "fidget spinner" was "rising" → now "falling". | Trend Detection analyzes updated data | Emits `trend.direction_changed` { keyword, direction: "falling", previousDirection: "rising" } → Admin CC | Step 1 |
| TC-WF2-S2 | Admin CC surfaces alert to operator | Verify notification | Receives direction_changed. | Admin CC processes | Creates urgent alert: "Trend Reversal: fidget spinner FALLING"; shows affected product count | Step 2 |
| TC-WF2-S3 | Admin triggers manual re-score | Verify re-scoring | Operator clicks "Re-Score". | Admin CC dispatches scoring-queue jobs | Scoring re-calculates with updated trend_signals | Step 3 |
| TC-WF2-S4 | Scoring recalculates with new trend data | Verify score update | trend_signals now: direction "falling", score: 25 (was 85). | Scoring recalculates | Composite drops significantly; tier may change HOT → WATCH | Step 4 |
| TC-WF2-S5 | Profitability recalculates on lower projections | Verify downstream cascade | Lower score → reduced volume. | Profitability receives updated product_scored | Recalculates margins; may emit margin_alert | Step 5 |
| TC-WF2-S6 | Admin CC receives margin_alert | Verify double-alert | Profitability emits margin_alert. | Admin CC receives | Displays: "Low margin: fidget spinner (was 42%, now 15%)" | Step 6 |
| TC-WF2-S7 | Admin pauses store listings | Verify halt action | Operator decides to halt. | Admin CC → Store Integration pause | Active listings deactivated; no new orders | Step 7 |
| TC-WF2-FULL | Complete trend reversal workflow | Wire 5 engines. Simulate reversal. Verify all 7 steps with correct data flow and operator alerts. |

---

### SECTION 4A SUMMARY

| Workflow | Steps | Tests | Engines Involved |
|----------|-------|-------|-----------------|
| WF1: Full Product Lifecycle | 19 | 27 tests (24 steps + 3 validation) | 15+ engines |
| WF2: Trend Reversal Response | 7 | 9 tests (8 steps + 1 validation) | 5 engines |
| **TOTAL SECTION 4A** | **26** | **36 tests** | |

---

## TEST SUITE 4B: END-TO-END WORKFLOWS 3-5

---

### WORKFLOW 3: SUPPLIER PRICE CHANGE CASCADE

**6 steps, 5 engines — Tests how a single supplier change propagates through the financial pipeline**

| Test ID | Test Name | Description | Setup | Trigger | Expected Cascade | Steps |
|---------|-----------|-------------|-------|---------|-----------------|-------|
| TC-WF3-S1 | Cheaper supplier found triggers recalculation chain | Verify supplier change propagates | Product already scored + profitability calculated (margin: 25%, COGS: $15). | Supplier Discovery emits `supplier.found` { price: 6.75, moq: 10 } | Profitability, Financial Modelling, Fulfillment Rec all receive | Step 1 |
| TC-WF3-S2 | Profitability recalculates improved margins | Verify margin improvement | Old COGS: $15 → New COGS: $6.75. Selling: $29.99. | Profitability receives supplier.found | Emits `profitability.calculated` { marginPercent: 64% (was 25%) } → Financial Modelling, Launch Blueprint, Fulfillment Rec | Step 2 |
| TC-WF3-S3 | Financial Modelling updates ROI projection | Verify ROI improvement | New margin: 64%. | Financial Modelling receives profitability.calculated | Emits `financial.model_generated` with improved ROI (was 2.1 → now 4.8) → Launch Blueprint | Step 3 |
| TC-WF3-S4 | Fulfillment Rec re-evaluates with better margins | Verify model change when economics shift | Old: POD (low margin). New: margin 64%. | Fulfillment Rec receives supplier.found + profitability.calculated | May switch from POD → bulk (high margin justifies inventory). Emits `fulfillment.recommended` { type: "bulk" } | Step 4 |
| TC-WF3-S5 | Launch Blueprint regenerates with updated financials | Verify blueprint refresh | All upstream data updated. | Launch Blueprint receives updated profitability + financial model + fulfillment rec | Regenerates blueprint with improved numbers; emits `blueprint.generated` → Admin CC | Step 5 |
| TC-WF3-S6 | Admin CC shows improved financials for re-approval | Verify operator notification | Blueprint regenerated. | Admin CC receives blueprint.generated | Displays "Updated Blueprint: margin improved 25% → 64%, ROI 2.1 → 4.8" with re-approve option | Step 6 |
| TC-WF3-FULL | Complete supplier cascade end-to-end | Wire 5 engines. Emit supplier.found with cheaper price. Verify: margin improves, ROI updates, fulfillment model may change, blueprint regenerated, admin notified. |

---

### WORKFLOW 4: NEW CLIENT ONBOARDING PRODUCT PUSH

**7 steps, 6 engines — Tests client store connection through first product deployment**

| Test ID | Test Name | Description | Setup | Trigger | Expected Cascade | Steps |
|---------|-----------|-------------|-------|---------|-----------------|-------|
| TC-WF4-S1 | Client connects store via OAuth | Verify store connection event | Mock Shopify OAuth flow. | Store Integration emits `store.connected` { clientId: "client-001", platform: "shopify", storeId: "shop-001" } | Admin CC receives store connection notification | Step 1 |
| TC-WF4-S2 | Client Allocation matches products to new client | Verify allocation for new client | Mock product pool: 10 HOT products available. Client tier: Premium, niche: "beauty". | Client Allocation runs allocation for new client | Emits `allocation.product_allocated` for 3 matching products → Content Creation, Store Integration | Step 2 |
| TC-WF4-S3 | Content Creation generates client-branded content | Verify client-specific content | Mock client brand profile + Claude API. | Content Creation receives allocation events | Generates branded product descriptions, ad copy; emits `content.generated` for each → Store Integration | Step 3 |
| TC-WF4-S4 | Store Integration pushes products to client's store | Verify Shopify product creation | Mock Shopify Admin API. | Store Integration receives content.generated + allocation data | Creates 3 products in client's Shopify store; emits `store.product_pushed` × 3 → Order Tracking, Affiliate Commission, Content Creation | Step 4 |
| TC-WF4-S5 | Order Tracking begins monitoring | Verify monitoring setup | 3 products pushed. | Order Tracking receives 3 × store.product_pushed | Registers all 3 products for order monitoring; webhook registered with Shopify | Step 5 |
| TC-WF4-S6 | Affiliate Commission sets up tracking | Verify affiliate link generation | 3 products pushed. | Affiliate Commission receives 3 × store.product_pushed | Creates affiliate tracking links for all 3 products | Step 6 |
| TC-WF4-S7 | Store sync completes successfully | Verify sync confirmation | All products pushed successfully. | Store Integration emits `store.sync_complete` { productsUpdated: 3 } | Admin CC + Order Tracking receive sync confirmation | Step 7 |
| TC-WF4-FULL | Complete client onboarding end-to-end | Wire 6 engines. Simulate OAuth → allocation → content → push → monitoring → tracking. Verify all products reach client store with content, monitoring active, affiliate links created. |

---

### WORKFLOW 5: MARGIN ALERT RECOVERY LOOP

**6 steps, 4 engines — Tests the bounded feedback loop (max 3 iterations)**

| Test ID | Test Name | Description | Setup | Trigger | Expected Cascade | Steps |
|---------|-----------|-------------|-------|---------|-----------------|-------|
| TC-WF5-S1 | Profitability detects margin below 20% | Verify margin alert triggers | Product margin: 12%. Threshold: 20%. | Profitability emits `profitability.margin_alert` { marginPercent: 12, threshold: 20 } | Supplier Discovery + Admin CC receive | Step 1 |
| TC-WF5-S2a | Supplier Discovery searches for cheaper alternative — FOUND | Verify successful recovery path | Mock AliExpress with cheaper supplier ($5 vs current $12). | Supplier Discovery receives margin_alert | Emits `supplier.found` { price: 5.00 } → Profitability, Financial Modelling, Fulfillment Rec | Step 2 |
| TC-WF5-S2b | Supplier Discovery searches — NOT FOUND | Verify failure path | Mock AliExpress with no cheaper options. | Supplier Discovery receives margin_alert | No supplier.found emitted; logs "no cheaper supplier available" | Step 2 |
| TC-WF5-S3 | Profitability recalculates with new supplier | Verify margin recovery | New COGS: $5 (was $12). Selling: $29.99. | Profitability receives supplier.found | Recalculates: new margin 58%. If >= 20%, recovery successful. Emits profitability.calculated. | Step 3 |
| TC-WF5-S4a | Loop iteration 2 — still below threshold | Verify loop continues | After first cheaper supplier, margin still 18% (below 20%). | Second margin_alert emitted | Supplier Discovery searches again (iteration 2) | Step 4 |
| TC-WF5-S4b | Loop terminates at max 3 iterations | Verify bounded loop | Margin stays below 20% after 3 supplier searches. | Third iteration completes | Loop stops. Final margin_alert includes flag: "manual_review_required: true". No fourth iteration. | Step 4 |
| TC-WF5-S5 | Recovered margin updates Financial Modelling | Verify post-recovery cascade | Margin recovered to 35% on iteration 2. | profitability.calculated emitted | Financial Modelling updates ROI → Launch Blueprint regenerated | Step 5 |
| TC-WF5-S6 | Unrecoverable margin alerts admin for manual decision | Verify manual escalation | 3 iterations, margin still 15%. | Final margin_alert with manual_review flag | Admin CC creates high-priority alert: "Margin unrecoverable for [product]. Action required." | Step 6 |
| TC-WF5-FULL | Complete margin recovery loop end-to-end | Wire Profitability, Supplier Discovery, Financial Modelling, Admin CC. Test all 3 scenarios: (1) recovery on iteration 1, (2) recovery on iteration 2, (3) no recovery after 3 iterations. |
| TC-WF5-BOUND | Loop counter persists correctly across iterations | Verify iteration tracking across the feedback loop. Counter must: start at 0, increment on each margin_alert → supplier search cycle, halt at exactly 3. |

---

### SECTION 4B SUMMARY

| Workflow | Steps | Tests | Engines Involved |
|----------|-------|-------|-----------------|
| WF3: Supplier Price Change Cascade | 6 | 8 tests (7 steps + 1 validation) | 5 engines |
| WF4: Client Onboarding Product Push | 7 | 9 tests (8 steps + 1 validation) | 6 engines |
| WF5: Margin Alert Recovery Loop | 6 | 11 tests (9 scenarios + 2 validation) | 4 engines |
| **TOTAL SECTION 4B** | **19** | **28 tests** | |

---

## TEST SUITE 5: ERROR RESILIENCE, CONCURRENCY & EDGE CASES

**File:** `tests/inter-engine-L7-resilience.test.ts`
**Purpose:** Verify the system handles failures, concurrent events, and boundary conditions correctly

---

### 5A: ERROR ISOLATION TESTS

| Test ID | Test Name | Description | Setup | Action | Expected Result |
|---------|-----------|-------------|-------|--------|----------------|
| TC-ERR-01 | Subscriber crash doesn't block other subscribers | One of 8 Scoring subscribers throws | Register all 8 subscribers. Make Clustering throw `new Error("DB connection lost")`. | Emit `scoring.product_scored` | 7 other subscribers receive and process; Clustering error logged with event details |
| TC-ERR-02 | EventBus continues after handler throws synchronously | Handler throws immediately | Register handler that throws. | Emit event | EventBus catches, logs, continues to next handler |
| TC-ERR-03 | EventBus continues after handler throws asynchronously | Handler rejects promise | Register async handler that rejects. | Emit event | EventBus awaits, catches rejection, logs, continues |
| TC-ERR-04 | Failed handler receives next event normally | Handler fails once, then recovers | Register handler that throws on first call, succeeds on second. | Emit event twice | First: fails + logged. Second: succeeds. Handler not permanently disabled. |
| TC-ERR-05 | Missing payload fields don't crash receiver | Event with partial data | Emit `scoring.product_scored` with { productId } only (no scores, no tier). | Receivers process | Each subscriber handles gracefully — logs warning for missing fields, doesn't throw |
| TC-ERR-06 | Null/undefined event payload handled | Malformed event | Emit event with payload: null. | EventBus delivers | Subscribers check for null; log error; don't crash |
| TC-ERR-07 | Unknown event type silently ignored | Unrecognized event | Emit `nonexistent.fake_event`. | EventBus processes | No subscribers called; no error logged; event added to history |
| TC-ERR-08 | Database write failure in handler doesn't poison event bus | Supabase insert fails mid-handler | Mock Supabase to reject insert. Scoring tries to write score. | Emit product_discovered → Scoring tries to score → DB fails | Scoring logs error; other subscribers of product_discovered unaffected |

---

### 5B: CONCURRENCY & RACE CONDITION TESTS

| Test ID | Test Name | Description | Setup | Action | Expected Result |
|---------|-----------|-------------|-------|--------|----------------|
| TC-CONC-01 | 100 simultaneous product_scored events | Verify all reach all subscribers | Register 8 subscribers. | Emit 100 `scoring.product_scored` events in rapid succession | Each subscriber receives exactly 100 events; no dropped events |
| TC-CONC-02 | Duplicate event detection | Same event emitted twice with same correlationId | Register subscriber with dedup logic. | Emit identical event twice (same correlationId) | Subscriber processes only the first; second detected as duplicate |
| TC-CONC-03 | Interleaved events from different engines | Discovery and TikTok Discovery emit simultaneously | Both engines emit to Trend Detection at same time. | Emit `discovery.scan_complete` AND `tiktok.videos_found` concurrently | Trend Detection receives both; processes each independently; no data corruption |
| TC-CONC-04 | Slow subscriber doesn't delay fast subscribers | One handler takes 5 seconds | Register fast handler (1ms) and slow handler (5000ms). | Emit event | Fast handler completes immediately; slow handler completes later; no blocking |
| TC-CONC-05 | Event ordering within same engine's emissions | Discovery emits product_discovered then scan_complete | Register subscribers for both events. | Discovery emits both in sequence | Subscribers receive events in emission order (product_discovered before scan_complete) |
| TC-CONC-06 | Multiple engines writing same table concurrently | Scoring and Competitor Intel both write to products | Mock Supabase with race condition detection. | Both engines process same product simultaneously | No data corruption; last-write-wins or optimistic locking prevents inconsistency |

---

### 5C: CIRCULAR DEPENDENCY & FEEDBACK LOOP TESTS

| Test ID | Test Name | Description | Setup | Action | Expected Result |
|---------|-----------|-------------|-------|--------|----------------|
| TC-CIRC-01 | Supplier ↔ Profitability loop bounded at 3 iterations | Verify the primary feedback loop bound | Wire Supplier Discovery + Profitability. Set margin perpetually below 20%. | Start with `profitability.margin_alert` | Loop executes exactly 3 times: margin_alert → supplier.found → profitability.calculated → margin_alert → ... → STOP after 3rd cycle |
| TC-CIRC-02 | Supplier ↔ Profitability loop exits early on recovery | Verify early exit when margin recovers | Wire both engines. First iteration: margin 15%. Second: margin 25% (recovered). | Start with margin_alert | Loop executes 2 times: first supplier doesn't help enough, second supplier fixes margin. No third iteration. |
| TC-CIRC-03 | Content ↔ Store loop bounded at 2 iterations | Verify content optimization loop | Wire Content Creation + Store Integration. | content.generated → store.product_pushed → content optimizes → store updates → STOP | Exactly 2 cycles. Third content.generated does NOT trigger another store push. |
| TC-CIRC-04 | Fulfillment ↔ Profitability loop bounded at 2 iterations | Verify fulfillment model change loop | Wire Fulfillment Rec + Profitability. Fulfillment changes model (POD → dropship) → margin changes → possible model re-evaluation. | Start with fulfillment.recommended | Max 2 iterations. Model stabilizes or stops at bound. |
| TC-CIRC-05 | Loop counter resets between different products | Verify loop bound is per-product, not global | Process product A (3 iterations, exhausted). Then process product B. | Start product B loop | Product B gets fresh 3-iteration budget; not affected by product A's exhaustion |
| TC-CIRC-06 | Trend Detection → Discovery indirect loop doesn't cascade infinitely | Verify trend hotness doesn't create infinite scan loop | Trend score >= 80 signals Discovery to scan more. New products → new trends → more scanning. | trend.trend_detected with score: 90 | Discovery may scan once based on trend signal; does NOT create unbounded scan loop. Rate limiting or cooldown enforced. |

---

### 5D: EDGE CASE TESTS

| Test ID | Test Name | Description | Setup | Action | Expected Result |
|---------|-----------|-------------|-------|--------|----------------|
| TC-EC-01 | Product rejected at scoring — all downstream silent | Verify COLD product stops pipeline | Score: 25, tier: "COLD" | Emit `scoring.product_rejected` | NO events from: Competitor Intel, Supplier Discovery, Profitability, Financial Modelling, Launch Blueprint, Client Allocation, Content Creation, Store Integration |
| TC-EC-02 | Margin threshold breach mid-lifecycle | Product was profitable, now isn't | Product live in store. Supplier raises price. | New supplier.found with higher price → Profitability recalculates | margin_alert emitted → Admin CC shows "Existing product margin at risk" |
| TC-EC-03 | Trend reversal for product already deployed | HOT product on store, trend now FALLING | Product live. Trend Detection detects reversal. | trend.direction_changed emitted | Admin CC alert: "Deployed product affected by trend reversal". Operator can pause listing. |
| TC-EC-04 | Supplier verification fails — Blueprint generates without supplier | Supplier found but not verified | supplier.found emitted (score: 35, unverified). NO supplier.verified. | Launch Blueprint generates | Blueprint created with "Supplier pending verification" warning; not blocked |
| TC-EC-05 | Blueprint approval denied — no downstream activation | Admin rejects blueprint | Admin clicks "Reject" instead of "Approve". | NO blueprint.approved event emitted | Client Allocation, Content Creation, Store Integration do NOT activate. Product stays in research phase. |
| TC-EC-06 | Store connection drops during product push | Shopify API returns 503 mid-push | Mock Shopify to fail after 2 of 5 products. | Store Integration pushing batch | 2 products succeed (store.product_pushed emitted). 3 fail. Admin CC notified of partial failure. Retry queued. |
| TC-EC-07 | Order webhook arrives for unknown product | Shopify sends order for product not in system | Mock webhook with unknown productId. | Order Tracking receives webhook | Logs "unknown product" warning; does NOT crash; does NOT emit order.received |
| TC-EC-08 | Commission without fulfilled order — stays pending indefinitely | Order received but never fulfilled | Emit order.received only. Wait. | No order.fulfilled ever comes | Commission stays "pending" permanently. Included in aging report. Never moves to "payable". |
| TC-EC-09 | Duplicate order webhook — idempotent handling | Shopify sends same order webhook twice | Emit order.received with same orderId twice. | Second processing | First: commission recorded. Second: detected as duplicate; no double commission. |
| TC-EC-10 | All engines healthy but no data — empty system behavior | Brand new system, no products | All engines registered. No products in DB. | Query Opportunity Feed | Returns empty feed with "No products discovered yet" message. No errors. |
| TC-EC-11 | Scoring with all zero inputs | No trend data, no TikTok data, no competitor data | All mock tables empty. | Score a product | Composite: 0 or minimum baseline. Tier: "COLD". No crash. |
| TC-EC-12 | Blueprint generation with partial upstream data | Only profitability available, no suppliers or financial model | Mock only profitability data. | Launch Blueprint triggers | Blueprint generated with available sections only. Missing sections marked "Data pending". Not blocked. |

---

### 5E: QUEUE RESILIENCE TESTS

| Test ID | Test Name | Description | Setup | Action | Expected Result |
|---------|-----------|-------------|-------|--------|----------------|
| TC-Q-01 | BullMQ job fails — retry behavior | Job processor throws | Mock BullMQ with retry config (3 attempts, exponential backoff). | product-scan job fails | Job retried 3 times with backoff. After 3 failures → moved to dead letter queue. |
| TC-Q-02 | Queue message ordering preserved | 5 jobs enqueued in sequence | Enqueue: scan-1, scan-2, scan-3, scan-4, scan-5. | Process all | Processed in FIFO order: scan-1 first, scan-5 last |
| TC-Q-03 | Dead letter queue captures failed jobs | Job fails all retries | Mock job that always throws. | Process with 3 retry limit | Job moved to DLQ with: original payload, error message, retry count, timestamps |
| TC-Q-04 | Queue handles large payload | Job with 10KB of product data | Enqueue job with large rawData payload. | Process | Job processed successfully; no payload truncation |
| TC-Q-05 | Multiple queues process independently | product-scan and trend-scan running simultaneously | Enqueue jobs to both queues. Make trend-scan fail. | Both process | product-scan succeeds. trend-scan fails independently. No cross-contamination. |

---

### SECTION 5 SUMMARY

| Category | Test Count |
|----------|-----------|
| Error Isolation | 8 tests |
| Concurrency & Race Conditions | 6 tests |
| Circular Dependencies & Feedback Loops | 6 tests |
| Edge Cases | 12 tests |
| Queue Resilience | 5 tests |
| **TOTAL SECTION 5** | **37 tests** |

---

## FINAL SUMMARY: COMPLETE TEST COVERAGE MATRIX

---

### TOTAL TEST COUNT BY SUITE

| Suite | File | Tests | Coverage |
|-------|------|-------|----------|
| Suite 1: Discovery Cluster (Engines 1-5) | `inter-engine-L1-discovery-cluster.test.ts` | 42 | 28 Comm # pathways |
| Suite 2: Intelligence & Supply (Engines 6-10) | `inter-engine-L1-intelligence-supply.test.ts` | 40 | 38 Comm # pathways |
| Suite 3: Launch & Fulfillment (Engines 11-20) | `inter-engine-L1-launch-fulfillment.test.ts` | 57 | 52 Comm # pathways |
| Suite 4A: Workflows 1-2 | `inter-engine-L6-workflows.test.ts` | 36 | WF1 (19 steps) + WF2 (7 steps) |
| Suite 4B: Workflows 3-5 | `inter-engine-L6-workflows.test.ts` | 28 | WF3 (6 steps) + WF4 (7 steps) + WF5 (6 steps) |
| Suite 5: Resilience & Edge Cases | `inter-engine-L7-resilience.test.ts` | 37 | Error, concurrency, loops, queues |
| **GRAND TOTAL** | **6 test files** | **240 tests** | **148+ Comm # pathways** |

---

### COVERAGE BY ENGINE (Producer → Consumer)

| Engine | As Producer (Events Out) | As Consumer (Events In) | Shared Table Writes | Shared Table Reads | Test Count |
|--------|-------------------------|------------------------|--------------------|--------------------|------------|
| Discovery | 4 event types, 7 queue jobs | 1 (Admin CC trigger) | products, product_scans, trend_signals (seed) | — | 18 |
| TikTok Discovery | 2 event types | 1 (scan_complete) | tiktok_hashtag_signals, tiktok_videos, tiktok_creators | — | 8 |
| Scoring | 2 event types (8 fan-out) | 1 (product_discovered) | products (score cols) | trend_signals, tiktok_hashtag_signals, products, competitor_products | 15 |
| Clustering | 2 event types | 1 (product_scored) | product_clusters | — | 5 |
| Trend Detection | 2 event types | 4 (scan_complete, videos_found, hashtags_analyzed, trend-scan) | trend_signals | tiktok_hashtag_signals | 10 |
| Creator Matching | 2 event types | 1 (product_scored indirect) | creator_product_matches | tiktok_videos, tiktok_creators | 6 |
| Ad Intelligence | 1 event type | 1 (product_discovered) | — | tiktok_videos | 5 |
| Competitor Intelligence | 2 event types | 2 (product_discovered, product_scored) | competitor_products | — | 9 |
| Supplier Discovery | 2 event types | 3 (product_scored, margin_alert, batch_complete) | product_suppliers | competitor_products | 12 |
| Profitability | 2 event types | 3 (product_scored, supplier.found, competitor.detected) | — | product_suppliers, competitor_products | 12 |
| Financial Modelling | 2 event types | 4 (profitability, supplier, competitor, creator) | financial_models | creator_product_matches | 8 |
| Launch Blueprint | 2 event types | 6 (financial, profitability, supplier, fulfillment, clustering, competitor) | launch_blueprints | product_clusters, creator_product_matches, competitor_products | 10 |
| Client Allocation | 2 event types | 3 (product_scored, blueprint.approved, clustering) | product_allocations | product_clusters, financial_models | 7 |
| Content Creation | 2 event types | 4 (blueprint.approved, allocation, store.pushed, trend) | — | trend_signals, creator_product_matches, competitor_products | 7 |
| Store Integration | 4 event types | 5 (blueprint.approved, allocation, content, admin deploy, fulfillment) | — | — | 12 |
| Order Tracking | 3 event types | 2 (store.pushed, store.sync_complete) | orders | — | 8 |
| Admin Command Center | 2 event types + manual triggers | 10+ event subscriptions | — | All tables (read-only) | 14 |
| Affiliate Commission | 0 event types (terminal) | 3 (order.received, order.fulfilled, store.pushed) | commissions | — | 6 |
| Fulfillment Rec | 2 event types | 3 (product_scored, supplier.found, profitability.calculated) | — | product_suppliers | 8 |
| Opportunity Feed | 0 event types (pure reader) | 4 event subscriptions | — | 9 tables (read-only aggregator) | 10 |

---

### COVERAGE BY COMMUNICATION MECHANISM

| Mechanism | Pathways | Tests | Coverage |
|-----------|----------|-------|----------|
| EventBus Events | 46 event types, 52 connections | 139 | 100% of event connections |
| Database Shared Tables | 13 tables, 65+ dependencies | 40 | All critical data flows |
| BullMQ Queues | 7 cross-engine queues | 12 | All queue dispatches |
| Manual API Triggers | 6 admin triggers | 8 | All manual actions |
| Webhook Pipelines | Shopify order webhooks | 5 | Order capture + processing |
| **TOTAL** | **148+** | **240** | **Full coverage** |

---

### COVERAGE BY ARCHITECTURAL PATTERN

| Pattern | Description | Tests | Key Test IDs |
|---------|-------------|-------|-------------|
| Fan-Out | One event → N subscribers | 8 | TC-3.FAN-*, TC-12.FAN-* |
| Pipeline | Sequential A → B → C → D | 27 | TC-WF1-S1 through TC-WF1-S19 |
| Feedback Loop | Bounded circular: A ↔ B | 6 | TC-CIRC-01 through TC-CIRC-06 |
| Aggregation | Many → One (Opportunity Feed) | 7 | TC-20.005a through TC-20.ALL |
| Manual Gate | Admin approval checkpoint | 4 | TC-WF1-S13, TC-EC-05 |
| Broadcast | One event, multiple independent consumers | 4 | TC-3.FAN-a, scoring fan-out tests |

---

### EXECUTION PLAN — IMPLEMENTATION ORDER

Tests should be implemented in this order based on dependency and risk:

#### Phase 1: Foundation (MUST DO FIRST)
| Priority | Test File | Tests | Rationale |
|----------|-----------|-------|-----------|
| P0 | `inter-engine-L7-resilience.test.ts` — Error Isolation (5A) | 8 | If errors aren't isolated, nothing else matters |
| P0 | Suite 1 Section 1O: Scoring Fan-Out | 4 | Most critical architectural pattern (8 subscribers) |

#### Phase 2: Core Pairwise Chains
| Priority | Test File | Tests | Rationale |
|----------|-----------|-------|-----------|
| P1 | Suite 1: Discovery → Scoring → Clustering chain | 12 | Primary data pipeline |
| P1 | Suite 1: TikTok → Trend → Scoring data deps | 8 | Scoring accuracy depends on these |
| P1 | Suite 2: Scoring → Supplier/Competitor → Profitability | 12 | Financial pipeline accuracy |

#### Phase 3: Financial & Launch Pipeline
| Priority | Test File | Tests | Rationale |
|----------|-----------|-------|-----------|
| P2 | Suite 2: Profitability → Financial Modelling → Launch Blueprint | 8 | Blueprint generation accuracy |
| P2 | Suite 3: Blueprint Approval Fan-Out | 6 | Critical gate for launch phase |
| P2 | Suite 3: Client Allocation → Content → Store chain | 10 | Product deployment pipeline |

#### Phase 4: Order & Commission Pipeline
| Priority | Test File | Tests | Rationale |
|----------|-----------|-------|-----------|
| P3 | Suite 3: Store → Order Tracking → Affiliate Commission | 10 | Revenue tracking accuracy |
| P3 | Suite 3: Admin CC event subscriptions | 8 | Operator visibility |

#### Phase 5: End-to-End Workflows
| Priority | Test File | Tests | Rationale |
|----------|-----------|-------|-----------|
| P4 | Suite 4A: Workflow 1 (Full Lifecycle) | 27 | The ultimate integration test |
| P4 | Suite 4A: Workflow 2 (Trend Reversal) | 9 | Most common reactive scenario |
| P4 | Suite 4B: Workflows 3-5 | 28 | Remaining business scenarios |

#### Phase 6: Resilience & Edge Cases
| Priority | Test File | Tests | Rationale |
|----------|-----------|-------|-----------|
| P5 | Suite 5: Concurrency tests | 6 | Production readiness |
| P5 | Suite 5: Circular loop bounds | 6 | Prevent infinite loops |
| P5 | Suite 5: Edge cases + queue resilience | 17 | Corner case coverage |
| P5 | Suite 3: Opportunity Feed aggregation | 7 | Read-only aggregator validation |

---

### TEST INFRASTRUCTURE REQUIREMENTS

```
Required Test Setup:
├── Mock Factory
│   ├── createMockSupabase()          — Shared mock DB with realistic data
│   ├── createMockBullMQ()            — Mock queue with job tracking
│   ├── createMockApify()             — Mock scraper responses
│   ├── createMockClaude()            — Mock AI API responses
│   └── createMockShopifyAPI()        — Mock store API responses
├── Test Utilities
│   ├── waitForEvent(eventName, timeout)  — Async event waiter
│   ├── captureEvents(engineName)         — Spy on all events for an engine
│   ├── createTestProduct(overrides)      — Factory for test product data
│   ├── createTestScores(overrides)       — Factory for score payloads
│   └── assertEventChain(events[])        — Verify ordered event sequence
├── Shared Test Data
│   ├── fixtures/products.json            — Realistic product records
│   ├── fixtures/suppliers.json           — Supplier test data
│   ├── fixtures/competitors.json         — Competitor test data
│   └── fixtures/creators.json            — Creator match test data
└── Test Configuration
    ├── vitest.config.integration.ts      — Separate config for integration tests
    ├── setup/eventbus-reset.ts           — Reset EventBus between tests
    └── setup/registry-reset.ts           — Reset EngineRegistry between tests
```

---

### SUCCESS CRITERIA

All 240 tests must pass for the V9 engine system to be considered production-ready:

| Criterion | Threshold | Measurement |
|-----------|-----------|-------------|
| All pairwise chains verified | 139/139 pass | Suite 1-3 |
| All workflows complete end-to-end | 64/64 pass | Suite 4A-4B |
| Error isolation proven | 8/8 pass | Suite 5A |
| No infinite loops | 6/6 pass | Suite 5C |
| All edge cases handled | 12/12 pass | Suite 5D |
| Queue resilience confirmed | 5/5 pass | Suite 5E |
| Zero dropped events under load | TC-CONC-01 pass | Suite 5B |
| Correlation IDs trace end-to-end | TC-WF1-TRACE pass | Suite 4A |

---

### DOCUMENT CROSS-REFERENCE

| Document | Relationship |
|----------|-------------|
| `V9_Inter_Engine_Communication_Breakdown.md` | Source of all 148+ Comm # entries tested here |
| `V9_Review_Engine_Architecture.md` | Engine architecture this strategy validates |
| `docs/YouSell_Platform_Technical_Specification_v8.md` | Master architecture specification |
| `tests/engine-system.test.ts` | Existing infrastructure tests (EventBus, Registry) |
| `tests/engine*-*.test.ts` | Existing individual engine logic tests |

---

## ADDENDUM A: GAP CLOSURE — 44 PREVIOUSLY UNTESTED PATHWAYS

**Date:** 2026-03-21
**Audit Result:** Original strategy covered 133/177 pathways (75.1%). This addendum closes the remaining 44 gaps to achieve 100% coverage.

---

### A1: SCORING PRODUCER GAPS (6 missing pathways)

**File:** `tests/inter-engine-L1-scoring-producer-gaps.test.ts`

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-3.003a | 3.003 | Scoring → Competitor Intelligence | product_scored (score >= 60) triggers competitor scan | Competitor Intelligence receives event; initiates competitor monitoring for WARM+ products |
| TC-3.005a | 3.005 | Scoring → Profitability | product_scored triggers initial profitability calculation | Profitability receives event; begins margin estimation with available data |
| TC-3.009a | 3.009 | Scoring → Opportunity Feed (DB) | Score columns written to products table → Feed reads | Opportunity Feed reads updated scores; displays correct tier badges |
| TC-6.001a | 6.001 | Scoring → Creator Matching (indirect) | product_scored (score >= 60) triggers creator search | Creator Matching receives; begins influencer matching for WARM+ products |
| TC-8.002a | 8.002 | Scoring → Competitor Intelligence (duplicate of 3.003) | Confirmed: same pathway as 3.003 | Tests score >= 60 threshold filter specifically |
| TC-10.001a | 10.001 | Scoring → Profitability (duplicate of 3.005) | Confirmed: same pathway as 3.005 | Tests Profitability's initial margin estimation from score data |

---

### A2: CONTENT CREATION CONSUMER GAPS (8 missing pathways)

**File:** `tests/inter-engine-L1-content-creation-consumers.test.ts`

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-5.009a | 5.009 | Trend Detection → Content Creation (DB) | Content Creation reads trend_signals for trending keywords | Content uses trending keywords in SEO metadata and product descriptions |
| TC-6.005a | 6.005 | Creator Matching → Content Creation (DB) | Content Creation reads creator_product_matches for creator style | Content adapts tone/style to match recommended creator's audience |
| TC-7.006a | 7.006 | Ad Intelligence → Content Creation (DB) | Content Creation reads competitor ad creatives for inspiration | Content differentiates from competitor ad copy; avoids similar hooks |
| TC-8.010a | 8.010 | Competitor Intelligence → Content Creation (DB) | Content reads competitor_products for differentiation | Content highlights unique selling points vs competitor weaknesses |
| TC-14.006a | 14.006 | Trend Detection → Content Creation (DB) | Same as 5.009 — confirmed duplicate pathway | Content includes trending hashtags in social media posts |
| TC-14.007a | 14.007 | Competitor Intelligence → Content Creation (DB) | Same as 8.010 — confirmed duplicate pathway | Content uses competitor pricing gaps in ad copy ("Save 20% vs brand X") |
| TC-14.008a | 14.008 | Ad Intelligence → Content Creation (DB) | Same as 7.006 — confirmed duplicate pathway | Content avoids ad fatigue by varying from competitor creative styles |
| TC-14.009a | 14.009 | Creator Matching → Content Creation (DB) | Same as 6.005 — confirmed duplicate pathway | Content matches creator's typical content format (review, unboxing, tutorial) |

---

### A3: ADMIN CC CONSUMER GAPS (8 missing pathways)

**File:** `tests/inter-engine-L1-admin-cc-consumers.test.ts`

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-4.004a | 4.004 | Clustering → Admin CC (DB) | Admin CC reads product_clusters for cluster overview | Dashboard shows cluster groupings with avg scores and product counts |
| TC-6.008a | 6.008 | Creator Matching → Admin CC (DB) | Admin CC reads creator_product_matches for match summary | Dashboard shows matched creator count per product; top matches listed |
| TC-8.008a | 8.008 | Competitor Intelligence → Admin CC (DB) | Admin CC reads competitor_products for pressure indicators | Dashboard shows competitor count, avg competitor price, threat level |
| TC-9.008a | 9.008 | Supplier Discovery → Admin CC (DB) | Admin CC reads suppliers/product_suppliers for supplier options | Dashboard shows available suppliers, best price, verification status |
| TC-11.008a | 11.008 | Financial Modelling → Admin CC (DB) | Admin CC reads financial_models for financial health | Dashboard shows ROI, break-even, projected revenue per product |
| TC-17.009a | 17.009 | Trend Detection → Admin CC | direction_changed event reaches Admin CC (NOTE: partially covered in TC-5.008a/b but missing explicit Comm # mapping) | Admin CC creates trend reversal alert with affected product list |
| TC-17.010a | 17.010 | Profitability → Admin CC | margin_alert event reaches Admin CC (NOTE: partially covered in TC-10.006b but missing explicit Comm # mapping) | Admin CC creates low-margin alert with product details and threshold |
| TC-18.005a | 18.005 | Affiliate Commission → Admin CC (DB) | Admin CC reads commission data for dashboard | Dashboard shows total commissions, pending payouts, top affiliates |

---

### A4: CLIENT ALLOCATION CONSUMER GAPS (6 missing pathways)

**File:** `tests/inter-engine-L1-client-allocation-consumers.test.ts`

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-4.006a | 4.006 | Clustering → Client Allocation (DB) | Client Allocation reads product_clusters for cluster avoidance | Allocation avoids assigning same-cluster products to same client (prevents cannibalization) |
| TC-10.008a | 10.008 | Profitability → Client Allocation (DB) | Client Allocation reads profitability data for margin-based allocation | Premium clients get higher-margin products; Starter clients get lower-margin |
| TC-11.010a | 11.010 | Financial Modelling → Client Allocation (DB) | Client Allocation reads financial_models for ROI-based allocation | Products with higher projected ROI allocated to Premium tier clients first |
| TC-13.007a | 13.007 | Clustering → Client Allocation (DB) | Same pathway as 4.006 — cluster data for allocation decisions | Allocation uses cluster proximity to diversify client portfolio |
| TC-13.008a | 13.008 | Profitability → Client Allocation (DB) | Same pathway as 10.008 — margin data for tier matching | Tests specific tier-to-margin mapping: Premium >= 40%, Growth >= 25%, Starter >= 15% |
| TC-13.009a | 13.009 | Financial Modelling → Client Allocation (DB) | Same pathway as 11.010 — ROI data for tier matching | Tests ROI threshold per tier: Premium >= 3x, Growth >= 2x, Starter >= 1.5x |

---

### A5: OPPORTUNITY FEED CONSUMER GAPS (6 missing pathways)

**File:** `tests/inter-engine-L1-opportunity-feed-consumers.test.ts`

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-3.009b | 3.009 | Scoring → Opportunity Feed (DB) | Feed reads products table score columns | Feed displays correct composite score, tier badge, and component breakdown |
| TC-9.009a | 9.009 | Supplier Discovery → Opportunity Feed (DB) | Feed reads product_suppliers for availability status | Feed shows "Supplier Found" / "No Supplier" indicator per product |
| TC-10.009a | 10.009 | Profitability → Opportunity Feed (DB) | Feed reads profitability data for margin indicators | Feed shows margin percentage badge (green >= 40%, yellow >= 20%, red < 20%) |
| TC-11.009a | 11.009 | Financial Modelling → Opportunity Feed (DB) | Feed reads financial_models for financial viability | Feed shows ROI projection and break-even estimate |
| TC-12.008a | 12.008 | Launch Blueprint → Opportunity Feed (DB) | Feed reads launch_blueprints for status | Feed shows blueprint status (Generated, Approved, Rejected, Pending) |
| TC-13.006a | 13.006 | Client Allocation → Opportunity Feed (DB) | Feed reads product_allocations for allocation status | Feed shows "Allocated to Client X" or "Available" |

---

### A6: CLUSTERING PRODUCER GAPS (5 missing pathways)

**File:** `tests/inter-engine-L1-clustering-producer-gaps.test.ts`

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-4.004b | 4.004 | Clustering → Admin CC (DB write) | Clustering writes product_clusters that Admin CC reads | product_clusters table contains correct cluster assignments with avgScore |
| TC-4.005a | 4.005 | Clustering → Launch Blueprint (DB) | Launch Blueprint reads product_clusters for cluster position | Blueprint includes cluster context: "Product is in cluster of N similar items, avg score X" |
| TC-4.006b | 4.006 | Clustering → Client Allocation (DB write) | Clustering writes cluster data that Client Allocation reads | Allocation can query which products are in same cluster for diversification |
| TC-12.009a | 12.009 | Clustering → Launch Blueprint (DB) | Same table as 4.005 — blueprint reads cluster metadata | Blueprint includes competitive cluster position and market saturation info |
| TC-13.007b | 13.007 | Clustering → Client Allocation (DB) | Same table as 4.006 — allocation reads cluster membership | Allocation avoids placing 2+ products from same cluster with one client |

---

### A7: AD INTELLIGENCE PRODUCER GAPS (5 missing pathways)

**File:** `tests/inter-engine-L1-ad-intelligence-producer-gaps.test.ts`

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-7.002a | 7.002 | Ad Intelligence → Scoring (DB) | Ad spend signals factor into profit_score | Scoring reads ad competition data; high ad spend → lower profit_score (harder to compete) |
| TC-7.005a | 7.005 | Ad Intelligence → Financial Modelling (DB) | Financial Modelling reads ad benchmarks for budget projections | Financial model includes projected ad spend based on competitor benchmarks |
| TC-7.008a | 7.008 | TikTok Discovery → Ad Intelligence (DB) | Ad Intelligence reads tiktok_videos for sponsored content | Ad Intelligence detects sponsored indicators in TikTok videos for market analysis |
| TC-11.005a | 11.005 | Ad Intelligence → Financial Modelling (DB) | Same pathway as 7.005 — ad spend benchmarks in financial model | Financial model's marketing budget projection uses ad intelligence benchmarks |

Note: TC-7.006a and TC-14.008a already covered in Section A2 (Content Creation consumer gaps).

---

### A8: TREND DETECTION PRODUCER GAPS (5 missing pathways)

**File:** `tests/inter-engine-L1-trend-detection-producer-gaps.test.ts`

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-1.009a | 1.009 | Trend Detection → Discovery (indirect) | HOT trend (score >= 80) signals Discovery to scan for more products | Discovery receives trend signal; may enqueue additional product-scan jobs for the hot keyword |
| TC-5.007a | 5.007 | Trend Detection → Discovery (indirect) | Same as 1.009 — trend >= 80 triggers additional scanning | Discovery rate-limits: max 1 additional scan per keyword per 24h (prevents infinite loop) |
| TC-5.009b | 5.009 | Trend Detection → Content Creation (DB) | Already covered in A2 TC-5.009a | Duplicate — same pathway |
| TC-14.006b | 14.006 | Trend Detection → Content Creation (DB) | Already covered in A2 TC-14.006a | Duplicate — same pathway |
| TC-17.009b | 17.009 | Trend Detection → Admin CC | Already covered in A3 TC-17.009a | Duplicate — same pathway |

---

### A9: REMAINING GAPS (11 pathways)

| Test ID | Comm # | Direction | Description | Expected Result |
|---------|--------|-----------|-------------|----------------|
| TC-2.005a | 2.005 | TikTok Discovery → Discovery | TikTok video contains product → enqueues enrich-product for Discovery | Discovery's enrich-product worker processes the TikTok-sourced product URL |
| TC-2.006a | 2.006 | TikTok Discovery → Ad Intelligence (DB) | Ad Intelligence reads tiktok_videos for sponsored detection | Same as TC-7.008a — covered in A7 |
| TC-8.005a | 8.005 | Competitor Intelligence → Scoring (DB) | Competitor pricing data adjusts profit_score | Scoring reads competitor_products; high competition → lower profit_score |
| TC-8.007a | 8.007 | Competitor Intelligence → Launch Blueprint (DB) | Blueprint reads competitor_products for competitive landscape | Blueprint includes section: "Competitive Analysis: N competitors, avg price X, threat level Y" |
| TC-12.010a | 12.010 | Competitor Intelligence → Launch Blueprint (DB) | Same table as 8.007 — confirmed duplicate | Blueprint uses competitor data for positioning strategy |
| TC-12.012a | 12.012 | Blueprint Approval Gate (CRITICAL) | Manual admin approval is required before launch phase | No blueprint.approved event emitted without explicit admin action; G10 enforcement verified |
| TC-16.008a | 16.008 | Order Tracking → Financial Modelling (DB) | Financial Modelling reads orders table for sales validation | Financial model validates projections against actual sales data |
| TC-16.009a | 16.009 | Order Tracking → Profitability (DB) | Profitability reads orders table for revenue validation | Profitability compares projected margins vs actual order revenue |
| TC-17.006a | 17.006 | Admin CC → Launch Blueprint (manual) | Admin approves blueprint → triggers approval event | Admin CC emits blueprint.approved after manual review; this IS the manual gate |
| TC-18.004a | 18.004 | Affiliate Commission → Financial Modelling (DB) | Financial Modelling reads commission data for cost projections | Financial model deducts commission costs from net revenue projection |
| TC-18.006a | 18.006 | Affiliate Commission → Profitability (DB) | Profitability reads commission data for net margin | Net margin reduced by affiliate commission percentage |
| TC-19.007a | 19.007 | Fulfillment Recommendation → Profitability (indirect) | Fulfillment model costs feed back to margin calculation | POD costs vs dropship costs vs bulk costs affect margin differently |
| TC-19.008a | 19.008 | Fulfillment Recommendation → Financial Modelling (DB) | Financial model includes fulfillment cost scenarios | ROI model shows 3 scenarios: POD margin, dropship margin, bulk margin |

---

### A10: MISSING INDIVIDUAL ENGINE TEST FILES

These engines have NO dedicated test file and need one:

| Engine | Priority | Rationale | Suggested File |
|--------|----------|-----------|---------------|
| **Discovery (Engine 1)** | P0 | Core engine — scan logic, dedup, enrichment untested in isolation | `engine1-discovery.test.ts` |
| **Scoring (Engine 3)** | P0 | Core engine — composite formula, tier assignment, 4-source aggregation | `engine3-scoring.test.ts` |
| **Profitability (Engine 5)** | P1 | Financial pipeline — margin calc, COGS aggregation, fee estimation | `engine5-profitability.test.ts` |
| **Financial Modelling (Engine 6)** | P1 | Financial pipeline — ROI projection, break-even, scenario analysis | `engine6-financial-modelling.test.ts` |
| **Trend Detection** | P1 | Core intelligence — direction detection, momentum calculation | `engine-trend-detection.test.ts` |
| **Clustering** | P2 | Grouping logic — similarity scoring, cluster management | `engine-clustering.test.ts` |
| **Creator Matching** | P2 | Matching logic — compatibility scoring, platform weighting | `engine-creator-matching.test.ts` |
| **Ad Intelligence** | P2 | Ad detection — creative analysis, spend estimation | `engine-ad-intelligence.test.ts` |
| **Opportunity Feed** | P2 | Aggregation — 9-table join, sorting, filtering | `engine-opportunity-feed.test.ts` |
| **Fulfillment Recommendation** | P2 | Model selection — POD vs dropship vs bulk decision logic | `engine-fulfillment-recommendation.test.ts` |
| **POD Engine** | P3 | Print-on-demand — Printful/Printify integration | `engine-pod.test.ts` |
| **Amazon Intelligence** | P3 | Backend-only — product intelligence | `engine-amazon-intelligence.test.ts` |
| **Shopify Intelligence** | P3 | Backend-only — store intelligence | `engine-shopify-intelligence.test.ts` |

---

### ADDENDUM SUMMARY

| Section | New Tests | Comm # Pathways Closed |
|---------|----------|----------------------|
| A1: Scoring Producer Gaps | 6 | 3.003, 3.005, 3.009, 6.001, 8.002, 10.001 |
| A2: Content Creation Consumer Gaps | 8 | 5.009, 6.005, 7.006, 8.010, 14.006, 14.007, 14.008, 14.009 |
| A3: Admin CC Consumer Gaps | 8 | 4.004, 6.008, 8.008, 9.008, 11.008, 17.009, 17.010, 18.005 |
| A4: Client Allocation Consumer Gaps | 6 | 4.006, 10.008, 11.010, 13.007, 13.008, 13.009 |
| A5: Opportunity Feed Consumer Gaps | 6 | 3.009, 9.009, 10.009, 11.009, 12.008, 13.006 |
| A6: Clustering Producer Gaps | 5 | 4.004, 4.005, 4.006, 12.009, 13.007 |
| A7: Ad Intelligence Producer Gaps | 4 | 7.002, 7.005, 7.008, 11.005 |
| A8: Trend Detection Producer Gaps | 2 (+ 3 dupes) | 1.009, 5.007 |
| A9: Remaining Gaps | 13 | 2.005, 8.005, 8.007, 12.010, 12.012, 16.008, 16.009, 17.006, 18.004, 18.006, 19.007, 19.008 |
| A10: Missing Individual Tests | 13 engine files | Full individual coverage |
| **ADDENDUM TOTAL** | **58 new inter-engine tests + 13 engine test files** | **44 Comm # gaps closed** |

---

### REVISED GRAND TOTAL

| Metric | Original | After Addendum | Coverage |
|--------|----------|---------------|----------|
| Inter-Engine Tests | 240 | **298** | +24% |
| Comm # Pathways Covered | 133/177 | **177/177** | **100%** |
| Individual Engine Test Files | 10 | **23** (10 existing + 13 new) | **100%** |
| End-to-End Workflows | 5 | 5 | 100% |
| Error/Resilience Tests | 37 | 37 | Full |

---

**END OF V9 INTER-ENGINE COMMUNICATION TEST STRATEGY (REVISED)**

**Total: 298 inter-engine tests + 13 individual engine test files, covering ALL 177 communication pathways, 5 end-to-end workflows, 53 event types, 13 shared tables, 32 queue connections, and 6 architectural patterns across 20 implemented engines.**
