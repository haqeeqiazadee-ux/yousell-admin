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

*Document continues in Test Suite 2...*
