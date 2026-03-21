# YOUSELL Platform — V9 Inter-Engine Communication Breakdown

## Exhaustive Task Inventory: Engine-to-Engine Communication

**Date:** 2026-03-21
**Source Documents:** YouSell_Platform_Technical_Specification_v9.md, V9_Engine_Task_Breakdown.md
**Cross-Referenced Against:** src/lib/engines/*.ts, backend/src/jobs/*.ts, src/lib/engines/types.ts
**Purpose:** Define ALL inter-engine communication pathways — every event, subscription, data dependency, and use case where Engine A requests/triggers/feeds Engine B and vice versa.

---

## COMMUNICATION MECHANISM OVERVIEW

| Mechanism | Description | Implementation |
|-----------|-------------|----------------|
| **EventBus Pub/Sub** | In-memory event bus with wildcard subscriptions, error isolation, 100-event history buffer | `src/lib/engines/event-bus.ts` |
| **BullMQ Job Enqueuing** | Queue-based async job dispatch; one engine enqueues a job into another engine's queue | `backend/src/jobs/*.ts` |
| **Shared Database Tables** | Multiple engines read/write the same Supabase tables (indirect communication) | Supabase PostgreSQL |
| **Registry Dependency Declaration** | Engines declare dependencies at registration time; Registry validates before start | `src/lib/engines/registry.ts` |

### Event Flow Rules
- All inter-engine communication is **event-driven** (no direct function calls between engines)
- Events carry **correlation IDs** for end-to-end tracing
- All automation is **disabled by default** (G10: manual-first cost control)
- Event handler failures are **isolated** — one engine's error never crashes another
- Events are **typed** with strict payload interfaces

---

## ENGINE REFERENCE INDEX

| # | Engine Name | Code ID | File |
|---|------------|---------|------|
| 1 | Discovery | `discovery` | `discovery.ts` |
| 2 | TikTok Discovery | `tiktok-discovery` | `tiktok-discovery.ts` |
| 3 | Scoring | `scoring` | `scoring-engine.ts` |
| 4 | Clustering | `clustering` | `clustering.ts` |
| 5 | Trend Detection | `trend-detection` | `trend-detection.ts` |
| 6 | Creator Matching | `creator-matching` | `creator-matching.ts` |
| 7 | Ad Intelligence | `ad-intelligence` | `ad-intelligence.ts` |
| 8 | Competitor Intelligence | `competitor-intelligence` | `competitor-intelligence.ts` |
| 9 | Supplier Discovery | `supplier-discovery` | `supplier-discovery.ts` |
| 10 | Profitability | `profitability` | `profitability-engine.ts` |
| 11 | Financial Modelling | `financial-modelling` | `financial-modelling.ts` |
| 12 | Launch Blueprint | `launch-blueprint` | `launch-blueprint.ts` |
| 13 | Client Allocation | `client-allocation` | `client-allocation.ts` |
| 14 | Content Creation | `content-creation` | `content-creation.ts` |
| 15 | Store Integration | `store-integration` | `store-integration.ts` |
| 16 | Order Tracking | `order-tracking` | `order-tracking.ts` |
| 17 | Admin Command Center | `admin-command-center` | `admin-command-center.ts` |
| 18 | Affiliate Commission | `affiliate-commission` | `affiliate-commission.ts` |
| 19 | Fulfillment Recommendation | `fulfillment-recommendation` | `fulfillment-recommendation.ts` |
| 20 | Opportunity Feed | `opportunity-feed` | `opportunity-feed.ts` |

---

## SECTION 1: ENGINE-BY-ENGINE COMMUNICATION PATHWAYS

---

### ENGINE 1: DISCOVERY → All Downstream Engines

**Role:** Entry point — discovers products via marketplace scraping. Feeds the entire pipeline.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 1.001 | Discovery → Scoring | `discovery.product_discovered` (EventBus) | Discovery | Scoring | `ProductDiscoveredPayload` { productId, source, keyword, rawData } | When Discovery finds a new product, Scoring must evaluate it for viability | New product inserted into `products` table |
| 1.002 | Discovery → Trend Detection | `discovery.scan_complete` (EventBus) | Discovery | Trend Detection | `ScanCompletePayload` { keyword, productsFound, source, scanId } | When a scan batch finishes, Trend Detection analyzes the keyword's trajectory | Product scan job completes successfully |
| 1.003 | Discovery → TikTok Discovery | `discovery.scan_complete` (EventBus) | Discovery | TikTok Discovery | `ScanCompletePayload` { keyword, productsFound, source, scanId } | When a scan completes, TikTok Discovery checks for related viral content | Product scan job completes successfully |
| 1.004 | Discovery → Competitor Intelligence | `discovery.product_discovered` (EventBus) | Discovery | Competitor Intelligence | `ProductDiscoveredPayload` { productId, source, keyword, rawData } | When a product is found, Competitor Intelligence scans rival listings | New product discovered on any marketplace |
| 1.005 | Discovery → Trend Detection | BullMQ job enqueue: `trend-scan` queue | Discovery | Trend Detection | `{ keyword, source, scanId }` | Discovery directly enqueues trend scan jobs for each keyword scanned | product-scan processor completes |
| 1.006 | Discovery → Ad Intelligence | `discovery.product_discovered` (EventBus) | Discovery | Ad Intelligence | `ProductDiscoveredPayload` { productId, source, keyword, rawData } | When a product is discovered, check if competitors are running ads for it | New product discovered |
| 1.007 | Discovery → Discovery (internal) | BullMQ job enqueue: `enrich-product` queue | Discovery | Discovery | `{ productId, source, rawUrl }` | After initial scan, enqueue enrichment job to fetch full product details | product-scan finds a new product URL |

**Reverse Communications (Other Engines → Discovery):**

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 1.008 | Admin Command Center → Discovery | Manual trigger via API | Admin CC | Discovery | `{ keywords[], sources[], scanConfig }` | Admin manually triggers a discovery scan for specific keywords | Admin clicks "Run Scan" in dashboard |
| 1.009 | Trend Detection → Discovery | Indirect: `trend.trend_detected` signals need for deeper scan | Trend Detection | Discovery | `TrendDetectedPayload` { keyword, score, direction, platforms }  | When a new trend is detected, Discovery should scan deeper for that keyword | Trend score crosses threshold |

**Database-Level Dependencies (Shared Tables):**

| Comm # | Table | Writer Engine | Reader Engine(s) | Data Flow |
|--------|-------|---------------|------------------|-----------|
| 1.010 | `products` | Discovery | Scoring, Clustering, Trend Detection, Competitor Intelligence, Profitability, Supplier Discovery, Launch Blueprint, Content Creation, Store Integration, Opportunity Feed, Admin CC, Fulfillment Recommendation | Discovery writes product records; all downstream engines read them |
| 1.011 | `product_scans` | Discovery | Trend Detection, Admin CC | Scan history and metadata |
| 1.012 | `trend_signals` | Discovery (seed) | Trend Detection (primary), TikTok Discovery | Keyword watchlist and trend scores |

---

### ENGINE 2: TIKTOK DISCOVERY ↔ Other Engines

**Role:** Analyzes TikTok viral signals — hashtags, videos, engagement, cross-platform matching.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 2.001 | Discovery → TikTok Discovery | `discovery.scan_complete` (EventBus subscription) | Discovery | TikTok Discovery | `ScanCompletePayload` { keyword, productsFound, source, scanId } | TikTok Discovery subscribes to scan completions to analyze viral content for the same keywords | Discovery finishes a scan batch |
| 2.002 | TikTok Discovery → Trend Detection | `tiktok.videos_found` (EventBus) | TikTok Discovery | Trend Detection | `{ query, videosFound, videosStored, hashtagsAnalyzed }` | Trend Detection uses TikTok video volume as a trend signal | TikTok discovery batch completes |
| 2.003 | TikTok Discovery → Trend Detection | `tiktok.hashtags_analyzed` (EventBus) | TikTok Discovery | Trend Detection | `{ hashtagsAnalyzed, query }` | Trend Detection incorporates hashtag acceleration into trend scoring | Hashtag analysis completes |
| 2.004 | TikTok Discovery → Scoring | Shared table: `tiktok_hashtag_signals` | TikTok Discovery | Scoring | Viral score components | Scoring engine reads TikTok viral signals as input to the viral_score component of composite scoring | TikTok data written to table |
| 2.005 | TikTok Discovery → Discovery | BullMQ: enqueues `tiktok-product-extract` → chains to `enrich-product` | TikTok Discovery | Discovery | `{ videoId, productUrl, keyword }` | Products found in TikTok videos are sent back to Discovery for enrichment | TikTok video contains a product link |
| 2.006 | TikTok Discovery → Ad Intelligence | Shared table: `tiktok_videos` | TikTok Discovery | Ad Intelligence | Video metadata with ad indicators | Ad Intelligence reads TikTok video data to detect paid promotions vs organic | TikTok videos stored |
| 2.007 | TikTok Discovery → Creator Matching | Shared table: `tiktok_videos`, `tiktok_creators` | TikTok Discovery | Creator Matching | Creator profiles, engagement rates | Creator Matching uses TikTok creator data to find influencer matches for products | TikTok creator data stored |

**Internal Queue Chain:**

| Comm # | Direction | Mechanism | Description |
|--------|-----------|-----------|-------------|
| 2.008 | TikTok Discovery internal | `tiktok-discovery` → `tiktok-product-extract` → `tiktok-engagement-analysis` → `tiktok-cross-match` | 4-stage internal pipeline: discover → extract products → analyze engagement → cross-match with marketplace listings |

---

### ENGINE 3: SCORING ↔ Other Engines

**Role:** Evaluates product viability using composite score (trend 40% + viral 35% + profit 25%). Central hub — many engines depend on scored outputs.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 3.001 | Discovery → Scoring | `discovery.product_discovered` (EventBus subscription) | Discovery | Scoring | `ProductDiscoveredPayload` | Scoring evaluates every newly discovered product | Product inserted |
| 3.002 | Scoring → Clustering | `scoring.product_scored` (EventBus) | Scoring | Clustering | `ProductScoredPayload` { productId, scores: { trend, viral, profit, composite }, tier } | Clustering groups products by similarity after scoring assigns tiers | Product scored and tier assigned |
| 3.003 | Scoring → Competitor Intelligence | `scoring.product_scored` (EventBus) | Scoring | Competitor Intelligence | `ProductScoredPayload` | Competitor Intel deep-scans only WARM+ products (score >= 60) to save API costs | Product scores >= 60 |
| 3.004 | Scoring → Supplier Discovery | `scoring.product_scored` (EventBus) | Scoring | Supplier Discovery | `ProductScoredPayload` | Supplier Discovery searches for sources only for viable products | Product scores >= 60 |
| 3.005 | Scoring → Profitability | `scoring.product_scored` (EventBus) | Scoring | Profitability | `ProductScoredPayload` | Profitability calculates margins using base scoring data | Product scored |
| 3.006 | Scoring → Client Allocation | `scoring.product_scored` (EventBus) | Scoring | Client Allocation | `ProductScoredPayload` | Client Allocation considers score tier when matching products to clients | Product scored |
| 3.007 | Scoring → Admin Command Center | `scoring.product_scored` (EventBus) | Scoring | Admin CC | `ProductScoredPayload` | Admin CC updates dashboard with latest product scores and tier badges | Product scored |
| 3.008 | Scoring → Fulfillment Recommendation | `scoring.product_scored` (EventBus) | Scoring | Fulfillment Rec | `ProductScoredPayload` | Fulfillment Rec uses score tier to weight fulfillment model selection (POD vs dropship vs bulk) | Product scored |
| 3.009 | Scoring → Opportunity Feed | Shared table: `products` (score columns) | Scoring | Opportunity Feed | Score values, tier | Opportunity Feed reads scored products for unified display | Scores written to products table |

**Rejection Flow:**

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 3.010 | Scoring → All Downstream | `scoring.product_rejected` (EventBus) | Scoring | All subscribers | `{ productId, reasons[] }` | Products scoring COLD (< 40) are rejected; downstream engines should skip them | Composite score < 40 |

**Data Dependencies (Inputs TO Scoring):**

| Comm # | Source Engine | Data | How Consumed |
|--------|-------------|------|--------------|
| 3.011 | TikTok Discovery | `tiktok_hashtag_signals` table | Read for viral_score component |
| 3.012 | Trend Detection | `trend_signals` table | Read for trend_score component |
| 3.013 | Discovery | `products` table (price, source) | Read for profit_score component |
| 3.014 | Competitor Intelligence | `competitor_products` table | Read for competitive pricing input to profit_score |

---

### ENGINE 4: CLUSTERING ↔ Other Engines

**Role:** Groups similar products into clusters for portfolio analysis and duplicate detection.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 4.001 | Scoring → Clustering | `scoring.product_scored` (EventBus subscription) | Scoring | Clustering | `ProductScoredPayload` | Clustering regroups products when new scores arrive | Product scored |
| 4.002 | Clustering → Opportunity Feed | `clustering.clusters_rebuilt` (EventBus) | Clustering | Opportunity Feed | `{ clustersCreated, productsAssigned, errors }` | Opportunity Feed refreshes cluster-based views | Clustering rebuild completes |
| 4.003 | Clustering → Opportunity Feed | `clustering.cluster_updated` (EventBus) | Clustering | Opportunity Feed | `ClusterUpdatedPayload` { clusterId, productCount, avgScore } | Opportunity Feed updates individual cluster cards | Single cluster changes |
| 4.004 | Clustering → Admin Command Center | Shared table: `product_clusters` | Clustering | Admin CC | Cluster groupings, counts | Admin CC displays cluster overview for batch operations | Clusters written to table |
| 4.005 | Clustering → Launch Blueprint | Shared table: `product_clusters` | Clustering | Launch Blueprint | Cluster metadata | Launch Blueprint considers cluster position when generating launch strategy | Clusters available in DB |
| 4.006 | Clustering → Client Allocation | Shared table: `product_clusters` | Clustering | Client Allocation | Cluster assignments | Client Allocation avoids assigning duplicate/clustered products to same client | Clusters available in DB |

---

### ENGINE 5: TREND DETECTION ↔ Other Engines

**Role:** Monitors keyword trajectories across platforms to detect emerging, peaking, and declining trends.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 5.001 | Discovery → Trend Detection | `discovery.scan_complete` (EventBus subscription) | Discovery | Trend Detection | `ScanCompletePayload` | Trend Detection processes keyword data from completed scans | Scan completes |
| 5.002 | Discovery → Trend Detection | BullMQ: `trend-scan` queue | Discovery | Trend Detection | `{ keyword, source, scanId }` | Discovery directly enqueues trend analysis jobs | product-scan processor |
| 5.003 | TikTok Discovery → Trend Detection | `tiktok.videos_found` (EventBus) | TikTok Discovery | Trend Detection | `{ query, videosFound }` | TikTok video volume is a trend signal input | TikTok batch completes |
| 5.004 | TikTok Discovery → Trend Detection | `tiktok.hashtags_analyzed` (EventBus) | TikTok Discovery | Trend Detection | `{ hashtagsAnalyzed, query }` | Hashtag acceleration feeds into trend direction calculation | Hashtag analysis done |
| 5.005 | Trend Detection → Scoring | Shared table: `trend_signals` | Trend Detection | Scoring | Trend scores, direction, momentum | Scoring reads trend data for the trend_score component (40% weight) | Trend data written |
| 5.006 | Trend Detection → Opportunity Feed | `trend.trend_detected` (EventBus) | Trend Detection | Opportunity Feed | `TrendDetectedPayload` { keyword, score, direction, platforms } | Opportunity Feed highlights newly detected trends | New trend crosses threshold |
| 5.007 | Trend Detection → Discovery | `trend.trend_detected` (indirect trigger) | Trend Detection | Discovery | `TrendDetectedPayload` | When a strong trend is detected, it signals Discovery to scan deeper for that keyword | Trend score >= 80 (HOT) |
| 5.008 | Trend Detection → Admin Command Center | `trend.direction_changed` (EventBus) | Trend Detection | Admin CC | `{ keyword, direction, previousDirection }` | Admin CC alerts operators when a trend reverses (rising→falling or vice versa) | Direction change detected |
| 5.009 | Trend Detection → Content Creation | Shared table: `trend_signals` | Trend Detection | Content Creation | Trending keywords, momentum data | Content Creation uses trending keywords for SEO-optimized product descriptions | Trend data available |

**Database-Level Dependencies:**

| Comm # | Table | Writer | Reader(s) | Data Flow |
|--------|-------|--------|-----------|-----------|
| 5.010 | `trend_signals` | Trend Detection | Scoring, Content Creation, Discovery, Admin CC | Keyword trend scores, direction, platforms |
| 5.011 | `tiktok_hashtag_signals` | TikTok Discovery | Trend Detection | Hashtag acceleration data read by Trend Detection |

---

## SECTION 2: ENGINE-BY-ENGINE COMMUNICATION PATHWAYS (continued)

---

### ENGINE 6: CREATOR MATCHING ↔ Other Engines

**Role:** Matches products with influencers/creators based on niche, audience size, engagement rate, and content style.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 6.001 | Scoring → Creator Matching | `scoring.product_scored` (indirect — Creator Matching can be triggered after scoring) | Scoring | Creator Matching | `ProductScoredPayload` | Match creators only for products scoring WARM+ (>= 60) to avoid wasting outreach on low-viability products | Product score >= 60 |
| 6.002 | Creator Matching → Opportunity Feed | `creator.matches_complete` (EventBus) | Creator Matching | Opportunity Feed | `{ productsMatched, matchesCreated }` | Opportunity Feed updates to show matched creators alongside product cards | Matching batch completes |
| 6.003 | Creator Matching → Opportunity Feed | `creator.creator_matched` (EventBus) | Creator Matching | Opportunity Feed | `CreatorMatchedPayload` { productId, creatorId, matchScore, platform } | Individual match updates for real-time feed | Single match found |
| 6.004 | Creator Matching → Launch Blueprint | Shared table: `creator_product_matches` | Creator Matching | Launch Blueprint | Match records with scores | Launch Blueprint includes matched creators in the influencer marketing section of the blueprint | Matches written to DB |
| 6.005 | Creator Matching → Content Creation | Shared table: `creator_product_matches` | Creator Matching | Content Creation | Creator profiles, content style preferences | Content Creation tailors product descriptions to match the creator's audience tone | Matches available |
| 6.006 | Creator Matching → Financial Modelling | Shared table: `creator_product_matches` | Creator Matching | Financial Modelling | Creator rates, estimated reach | Financial Modelling includes influencer cost projections in ROI calculations | Matches available |
| 6.007 | TikTok Discovery → Creator Matching | Shared tables: `tiktok_videos`, `tiktok_creators` | TikTok Discovery | Creator Matching | Creator follower counts, engagement rates, content categories | Creator Matching sources TikTok creator profiles for matching pool | TikTok data available |
| 6.008 | Creator Matching → Admin Command Center | Shared table: `creator_product_matches` | Creator Matching | Admin CC | Match summary data | Admin CC displays creator match counts and top matches per product | Matches written |

---

### ENGINE 7: AD INTELLIGENCE ↔ Other Engines

**Role:** Monitors competitor advertising activity across Meta, TikTok, and Google to detect paid promotion signals.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 7.001 | Discovery → Ad Intelligence | `discovery.product_discovered` (EventBus — potential subscription) | Discovery | Ad Intelligence | `ProductDiscoveredPayload` | When a new product is found, check if competitors are actively running ads for it | Product discovered |
| 7.002 | Ad Intelligence → Scoring | Shared table: ad spend signals | Ad Intelligence | Scoring | Ad density, spend estimates | Scoring uses ad competition data as a negative signal (high ad spend = harder market entry) or positive signal (proven demand) | Ad data written |
| 7.003 | Ad Intelligence → Competitor Intelligence | Shared data: ad creative analysis | Ad Intelligence | Competitor Intelligence | Ad creatives, targeting data, spend estimates | Competitor Intelligence combines ad data with listing data for full competitive picture | Ad data available |
| 7.004 | Ad Intelligence → Profitability | Shared table: estimated CPA data | Ad Intelligence | Profitability | Cost-per-acquisition estimates | Profitability factors in required ad spend when calculating net margins | Ad cost data available |
| 7.005 | Ad Intelligence → Financial Modelling | Shared data: ad spend benchmarks | Ad Intelligence | Financial Modelling | Industry ad spend benchmarks, estimated CAC | Financial Modelling uses ad cost benchmarks for marketing budget projections | Ad data available |
| 7.006 | Ad Intelligence → Content Creation | Shared data: competitor ad creatives | Ad Intelligence | Content Creation | Competitor ad copy, visual styles, hooks | Content Creation references competitor ads to create differentiated content | Ad creatives stored |
| 7.007 | Ad Intelligence → Opportunity Feed | `ads.ads_discovered` (EventBus) | Ad Intelligence | Opportunity Feed | `{ adsFound, adsStored }` | Opportunity Feed includes ad intelligence signals in product opportunity cards | Ad discovery batch completes |
| 7.008 | TikTok Discovery → Ad Intelligence | Shared table: `tiktok_videos` | TikTok Discovery | Ad Intelligence | Video metadata with paid promotion indicators | Ad Intelligence cross-references TikTok videos to identify sponsored content vs organic | TikTok data available |

---

### ENGINE 8: COMPETITOR INTELLIGENCE ↔ Other Engines

**Role:** Scans rival product listings, pricing, reviews, and seller activity to assess competitive landscape.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 8.001 | Discovery → Competitor Intelligence | `discovery.product_discovered` (EventBus subscription) | Discovery | Competitor Intelligence | `ProductDiscoveredPayload` | Scan for competing listings when a new product is found | Product discovered |
| 8.002 | Scoring → Competitor Intelligence | `scoring.product_scored` (EventBus subscription) | Scoring | Competitor Intelligence | `ProductScoredPayload` | Deep competitive scan only for WARM+ products (cost control) | Score >= 60 |
| 8.003 | Competitor Intelligence → Profitability | `competitor.detected` (EventBus) | Competitor Intelligence | Profitability | `CompetitorDetectedPayload` { productId, competitorStore, price, reviews, sellerCount } | Profitability adjusts margin calculations based on competitor pricing | Competitor listing found |
| 8.004 | Competitor Intelligence → Financial Modelling | `competitor.detected` (EventBus) | Competitor Intelligence | Financial Modelling | `CompetitorDetectedPayload` | Financial Modelling factors competitor pricing into revenue projections | Competitor found |
| 8.005 | Competitor Intelligence → Scoring | Shared table: `competitor_products` | Competitor Intelligence | Scoring | Competitor count, price range, review velocity | Scoring reads competitive data for profit_score adjustment | Competitor data written |
| 8.006 | Competitor Intelligence → Supplier Discovery | `competitor.batch_complete` (EventBus) | Competitor Intelligence | Supplier Discovery | `{ productId, keyword, platforms, competitorsFound }` | Supplier Discovery uses competitor data to identify shared suppliers (same factory, different brands) | Competitor batch done |
| 8.007 | Competitor Intelligence → Launch Blueprint | Shared table: `competitor_products` | Competitor Intelligence | Launch Blueprint | Competitive landscape summary | Launch Blueprint includes competitor analysis section with pricing strategy recommendations | Data available |
| 8.008 | Competitor Intelligence → Admin Command Center | Shared table: `competitor_products` | Competitor Intelligence | Admin CC | Competitor counts, price ranges | Admin CC shows competitive pressure indicators on product cards | Data available |
| 8.009 | Ad Intelligence → Competitor Intelligence | Shared data: competitor ad activity | Ad Intelligence | Competitor Intelligence | Ad spend, targeting, creatives | Competitor Intelligence enriches profiles with advertising activity data | Ad data available |
| 8.010 | Competitor Intelligence → Content Creation | Shared table: `competitor_products` | Competitor Intelligence | Content Creation | Competitor product titles, descriptions, USPs | Content Creation creates differentiated copy that avoids competitor messaging | Data available |

---

### ENGINE 9: SUPPLIER DISCOVERY ↔ Other Engines

**Role:** Finds and verifies suppliers (AliExpress, Alibaba, CJ Dropshipping, Printful) for viable products.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 9.001 | Scoring → Supplier Discovery | `scoring.product_scored` (EventBus subscription) | Scoring | Supplier Discovery | `ProductScoredPayload` | Search for suppliers only for WARM+ products | Score >= 60 |
| 9.002 | Profitability → Supplier Discovery | `profitability.calculated` (EventBus subscription) | Profitability | Supplier Discovery | `ProfitabilityPayload` { productId, margin, marginPercent, cogs } | Supplier Discovery uses profitability data to filter suppliers by price threshold | Profitability calculated |
| 9.003 | Supplier Discovery → Profitability | `supplier.found` (EventBus) | Supplier Discovery | Profitability | `SupplierFoundPayload` { supplierId, productId, price, moq, shippingCost, platform } | Profitability recalculates margins when a new supplier with different pricing is found | Supplier found |
| 9.004 | Supplier Discovery → Financial Modelling | `supplier.found` (EventBus) | Supplier Discovery | Financial Modelling | `SupplierFoundPayload` | Financial Modelling updates COGS projections with actual supplier pricing | Supplier found |
| 9.005 | Supplier Discovery → Launch Blueprint | `supplier.verified` (EventBus) | Supplier Discovery | Launch Blueprint | `{ supplierId, productId, verified, score }` | Launch Blueprint includes verified supplier as the recommended source in the launch plan | Supplier passes verification |
| 9.006 | Supplier Discovery → Fulfillment Recommendation | `supplier.found` (EventBus) | Supplier Discovery | Fulfillment Rec | `SupplierFoundPayload` | Fulfillment Rec evaluates supplier capabilities to recommend fulfillment model | Supplier found |
| 9.007 | Competitor Intelligence → Supplier Discovery | `competitor.batch_complete` (EventBus) | Competitor Intelligence | Supplier Discovery | `{ productId, keyword, platforms, competitorsFound }` | Supplier Discovery cross-references competitor data to find shared suppliers | Competitor batch done |
| 9.008 | Supplier Discovery → Admin Command Center | Shared table: `suppliers`, `product_suppliers` | Supplier Discovery | Admin CC | Supplier profiles, verification status | Admin CC shows supplier options per product with verification badges | Data written |
| 9.009 | Supplier Discovery → Opportunity Feed | Shared table: `product_suppliers` | Supplier Discovery | Opportunity Feed | Supplier count, best price, MOQ | Opportunity Feed shows supplier availability in product cards | Data available |

**Bidirectional Loop (Supplier ↔ Profitability):**

| Comm # | Direction | Description |
|--------|-----------|-------------|
| 9.010 | Supplier → Profitability → Supplier | Circular refinement: Supplier Discovery finds suppliers → Profitability calculates margins → if margin too low, Supplier Discovery searches for cheaper alternatives. This loop is bounded by max 3 iterations per product. |

---

### ENGINE 10: PROFITABILITY ↔ Other Engines

**Role:** Calculates unit economics — COGS, margins, break-even — using supplier pricing, competitor data, and fulfillment costs.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 10.001 | Scoring → Profitability | `scoring.product_scored` (EventBus subscription) | Scoring | Profitability | `ProductScoredPayload` | Initial profitability calculation triggered by scoring | Product scored |
| 10.002 | Supplier Discovery → Profitability | `supplier.found` (EventBus subscription) | Supplier Discovery | Profitability | `SupplierFoundPayload` | Recalculate margins with actual supplier COGS | Supplier found |
| 10.003 | Competitor Intelligence → Profitability | `competitor.detected` (EventBus subscription) | Competitor Intelligence | Profitability | `CompetitorDetectedPayload` | Adjust pricing strategy based on competitor price points | Competitor detected |
| 10.004 | Profitability → Financial Modelling | `profitability.calculated` (EventBus) | Profitability | Financial Modelling | `ProfitabilityPayload` { productId, margin, marginPercent, cogs, sellingPrice, fees } | Financial Modelling builds ROI projections from margin data | Profitability calculated |
| 10.005 | Profitability → Launch Blueprint | `profitability.calculated` (EventBus) | Profitability | Launch Blueprint | `ProfitabilityPayload` | Launch Blueprint includes margin analysis and pricing strategy | Profitability calculated |
| 10.006 | Profitability → Supplier Discovery | `profitability.margin_alert` (EventBus) | Profitability | Supplier Discovery | `{ productId, margin, marginPercent, threshold }` | When margins drop below threshold, trigger search for cheaper suppliers | Margin < 20% |
| 10.007 | Profitability → Fulfillment Recommendation | `profitability.calculated` (EventBus) | Profitability | Fulfillment Rec | `ProfitabilityPayload` | Fulfillment Rec uses margin data to recommend POD (lower margin, no inventory risk) vs dropship (higher margin, more risk) | Profitability calculated |
| 10.008 | Profitability → Client Allocation | Shared table: profitability data | Profitability | Client Allocation | Margin percentages per product | Client Allocation considers profitability when matching products to client tier (premium clients get higher-margin products) | Data available |
| 10.009 | Profitability → Opportunity Feed | Shared table: profitability data | Profitability | Opportunity Feed | Margin %, COGS, recommended price | Opportunity Feed shows profitability indicators on product cards | Data available |
| 10.010 | Profitability → Admin Command Center | `profitability.margin_alert` (EventBus) | Profitability | Admin CC | `{ productId, margin, threshold }` | Admin CC displays margin alerts for products falling below profitability threshold | Margin alert triggered |
| 10.011 | Ad Intelligence → Profitability | Shared data: CPA estimates | Ad Intelligence | Profitability | Cost-per-acquisition benchmarks | Profitability factors in advertising costs when calculating true net margin | Ad cost data available |

---

*Document continues in Section 3...*
