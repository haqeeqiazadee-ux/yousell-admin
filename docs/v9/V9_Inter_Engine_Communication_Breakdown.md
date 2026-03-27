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

## SECTION 3: ENGINE-BY-ENGINE COMMUNICATION PATHWAYS (continued)

---

### ENGINE 11: FINANCIAL MODELLING ↔ Other Engines

**Role:** Builds ROI projections, break-even analysis, and marketing budget models using margin, supplier, and competitor data.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 11.001 | Profitability → Financial Modelling | `profitability.calculated` (EventBus subscription) | Profitability | Financial Modelling | `ProfitabilityPayload` | Build ROI model from margin data | Profitability calculated |
| 11.002 | Supplier Discovery → Financial Modelling | `supplier.found` (EventBus subscription) | Supplier Discovery | Financial Modelling | `SupplierFoundPayload` | Update COGS projections with actual supplier prices; compare multiple supplier scenarios | Supplier found |
| 11.003 | Competitor Intelligence → Financial Modelling | `competitor.detected` (EventBus subscription) | Competitor Intelligence | Financial Modelling | `CompetitorDetectedPayload` | Factor competitor pricing into revenue projections and market share estimates | Competitor detected |
| 11.004 | Creator Matching → Financial Modelling | Shared table: `creator_product_matches` | Creator Matching | Financial Modelling | Creator rates, estimated reach, engagement | Include influencer marketing costs and projected conversion rates in ROI model | Match data available |
| 11.005 | Ad Intelligence → Financial Modelling | Shared data: ad spend benchmarks | Ad Intelligence | Financial Modelling | CPA benchmarks, industry ad spend | Marketing budget section includes ad spend projections based on competitor benchmarks | Ad data available |
| 11.006 | Financial Modelling → Launch Blueprint | `financial.model_generated` (EventBus) | Financial Modelling | Launch Blueprint | `FinancialModelPayload` { productId, roi, breakEvenUnits, projectedRevenue, marketingBudget } | Launch Blueprint includes financial projections as the business case section | Financial model generated |
| 11.007 | Financial Modelling → Launch Blueprint | `financial.roi_projected` (EventBus) | Financial Modelling | Launch Blueprint | `{ productId, roi, breakEvenConversions, influencerCost }` | Launch Blueprint highlights ROI expectations and break-even timeline | ROI projection completed |
| 11.008 | Financial Modelling → Admin Command Center | Shared table: `financial_models` | Financial Modelling | Admin CC | ROI %, break-even units, projected revenue | Admin CC shows financial health indicators per product | Model data available |
| 11.009 | Financial Modelling → Opportunity Feed | Shared table: `financial_models` | Financial Modelling | Opportunity Feed | ROI projections, break-even data | Opportunity Feed includes financial viability score in product cards | Model data available |
| 11.010 | Financial Modelling → Client Allocation | Shared table: `financial_models` | Financial Modelling | Client Allocation | ROI projections per product | Client Allocation matches high-ROI products to premium clients | Model data available |

---

### ENGINE 12: LAUNCH BLUEPRINT ↔ Other Engines

**Role:** Generates comprehensive product launch plans combining all upstream intelligence into an actionable playbook.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 12.001 | Financial Modelling → Launch Blueprint | `financial.model_generated` (EventBus subscription) | Financial Modelling | Launch Blueprint | `FinancialModelPayload` | Trigger blueprint generation when financial model is ready | Financial model generated |
| 12.002 | Profitability → Launch Blueprint | `profitability.calculated` (EventBus subscription) | Profitability | Launch Blueprint | `ProfitabilityPayload` | Include margin analysis and pricing strategy in blueprint | Profitability calculated |
| 12.003 | Supplier Discovery → Launch Blueprint | `supplier.verified` (EventBus subscription) | Supplier Discovery | Launch Blueprint | `{ supplierId, productId, verified, score }` | Include verified supplier as recommended source with lead times and MOQs | Supplier verified |
| 12.004 | Launch Blueprint → Client Allocation | `blueprint.approved` (EventBus) | Launch Blueprint | Client Allocation | `{ blueprintId, productId, approvedBy, approvedAt }` | Client Allocation can now assign the product to clients since it has an approved launch plan | Admin approves blueprint |
| 12.005 | Launch Blueprint → Content Creation | `blueprint.approved` (EventBus) | Launch Blueprint | Content Creation | `{ blueprintId, productId, approvedBy, approvedAt }` | Content Creation begins generating product descriptions, ad copy, and social content | Blueprint approved |
| 12.006 | Launch Blueprint → Store Integration | `blueprint.approved` (EventBus) | Launch Blueprint | Store Integration | `{ blueprintId, productId, approvedBy, approvedAt }` | Store Integration prepares product listing data for push to Shopify/TikTok Shop | Blueprint approved |
| 12.007 | Launch Blueprint → Admin Command Center | `blueprint.generated` (EventBus) | Launch Blueprint | Admin CC | `BlueprintPayload` { productId, blueprint, sections } | Admin CC displays generated blueprint for review and approval | Blueprint generated |
| 12.008 | Launch Blueprint → Opportunity Feed | Shared table: `launch_blueprints` | Launch Blueprint | Opportunity Feed | Blueprint status, key metrics | Opportunity Feed shows blueprint readiness status per product | Data available |
| 12.009 | Clustering → Launch Blueprint | Shared table: `product_clusters` | Clustering | Launch Blueprint | Cluster position, related products | Blueprint considers cluster context — avoids launching 5 similar products simultaneously | Data available |
| 12.010 | Competitor Intelligence → Launch Blueprint | Shared table: `competitor_products` | Competitor Intelligence | Launch Blueprint | Competitive landscape, pricing range | Blueprint includes competitive positioning strategy | Data available |
| 12.011 | Creator Matching → Launch Blueprint | Shared table: `creator_product_matches` | Creator Matching | Launch Blueprint | Matched creators, rates, platforms | Blueprint includes influencer outreach plan with specific creator recommendations | Data available |

**Blueprint Approval Flow (Critical Gate):**

| Comm # | Description |
|--------|-------------|
| 12.012 | Blueprint approval is a **manual gate** (G10). Admin reviews → approves → `blueprint.approved` event fires → triggers Content Creation, Store Integration, and Client Allocation simultaneously. This is the single most important inter-engine trigger in the system — it transitions a product from "research phase" to "launch phase". |

---

### ENGINE 13: CLIENT ALLOCATION ↔ Other Engines

**Role:** Matches scored, blueprinted products to client businesses based on their tier, niche, budget, and capacity.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 13.001 | Scoring → Client Allocation | `scoring.product_scored` (EventBus subscription) | Scoring | Client Allocation | `ProductScoredPayload` | Consider product tier when matching to clients | Product scored |
| 13.002 | Launch Blueprint → Client Allocation | `blueprint.approved` (EventBus subscription) | Launch Blueprint | Client Allocation | `{ blueprintId, productId, approvedBy }` | Product is now launch-ready — allocate to matching client | Blueprint approved |
| 13.003 | Client Allocation → Content Creation | `allocation.product_allocated` (EventBus) | Client Allocation | Content Creation | `AllocationPayload` { productId, clientId, tier, allocatedAt } | Content Creation generates client-branded content for the allocated product | Product allocated to client |
| 13.004 | Client Allocation → Store Integration | `allocation.product_allocated` (EventBus) | Client Allocation | Store Integration | `AllocationPayload` | Store Integration pushes product to the client's connected store | Product allocated |
| 13.005 | Client Allocation → Admin Command Center | `allocation.batch_complete` (EventBus) | Client Allocation | Admin CC | `{ productCount, allocated, skipped, tier }` | Admin CC updates allocation dashboard with batch results | Allocation batch completes |
| 13.006 | Client Allocation → Opportunity Feed | Shared table: `product_allocations` | Client Allocation | Opportunity Feed | Allocation status per product | Opportunity Feed shows which products are allocated vs available | Data available |
| 13.007 | Clustering → Client Allocation | Shared table: `product_clusters` | Clustering | Client Allocation | Cluster assignments | Avoid allocating multiple products from same cluster to same client (prevent cannibalization) | Data available |
| 13.008 | Profitability → Client Allocation | Shared table: profitability data | Profitability | Client Allocation | Margin % per product | Premium clients receive higher-margin products; starter clients get moderate-margin products | Data available |
| 13.009 | Financial Modelling → Client Allocation | Shared table: `financial_models` | Financial Modelling | Client Allocation | ROI projections | Allocate high-ROI products to clients with larger marketing budgets | Data available |

---

### ENGINE 14: CONTENT CREATION ↔ Other Engines

**Role:** Generates product descriptions, ad copy, social media content, and SEO metadata using AI (Claude Haiku/Sonnet).

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 14.001 | Launch Blueprint → Content Creation | `blueprint.approved` (EventBus subscription) | Launch Blueprint | Content Creation | `{ blueprintId, productId }` | Begin generating all content types for the approved product | Blueprint approved |
| 14.002 | Client Allocation → Content Creation | `allocation.product_allocated` (EventBus subscription) | Client Allocation | Content Creation | `AllocationPayload` | Generate client-branded version of content with client's brand voice and guidelines | Product allocated to client |
| 14.003 | Store Integration → Content Creation | `store.product_pushed` (EventBus subscription) | Store Integration | Content Creation | `StoreProductPushedPayload` | Generate platform-specific content optimizations after seeing how the listing performs | Product pushed to store |
| 14.004 | Content Creation → Store Integration | `content.generated` (EventBus) | Content Creation | Store Integration | `ContentGeneratedPayload` { productId, contentType, content, platform } | Store Integration uses generated content for product listings | Content generated |
| 14.005 | Content Creation → Admin Command Center | `content.batch_complete` (EventBus) | Content Creation | Admin CC | `{ requestCount, generated, failed, totalCredits }` | Admin CC shows content generation status and AI credit usage | Batch completes |
| 14.006 | Trend Detection → Content Creation | Shared table: `trend_signals` | Trend Detection | Content Creation | Trending keywords, momentum | Content Creation incorporates trending keywords for SEO optimization | Data available |
| 14.007 | Competitor Intelligence → Content Creation | Shared table: `competitor_products` | Competitor Intelligence | Content Creation | Competitor titles, descriptions | Content Creation creates differentiated copy that avoids competitor messaging | Data available |
| 14.008 | Ad Intelligence → Content Creation | Shared data: competitor ad creatives | Ad Intelligence | Content Creation | Ad hooks, visual styles | Content Creation references competitor ads to create differentiated marketing angles | Data available |
| 14.009 | Creator Matching → Content Creation | Shared table: `creator_product_matches` | Creator Matching | Content Creation | Creator style, audience demographics | Tailor content to match the influencer's audience tone and preferences | Data available |

**AI Model Selection (G12 Compliance):**

| Comm # | Description |
|--------|-------------|
| 14.010 | Content Creation uses **Claude Haiku** for bulk operations (product descriptions, basic ad copy) and **Claude Sonnet** for premium content (launch narratives, detailed blog posts). Model selection is determined by content type and client tier. |

---

### ENGINE 15: STORE INTEGRATION ↔ Other Engines

**Role:** Manages product listing push/sync to Shopify, TikTok Shop, and Amazon. Handles OAuth connections and inventory sync.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 15.001 | Launch Blueprint → Store Integration | `blueprint.approved` (EventBus subscription) | Launch Blueprint | Store Integration | `{ blueprintId, productId }` | Prepare product listing for push to target store | Blueprint approved |
| 15.002 | Client Allocation → Store Integration | `allocation.product_allocated` (EventBus subscription) | Client Allocation | Store Integration | `AllocationPayload` | Push product to the specific client's connected store | Product allocated |
| 15.003 | Content Creation → Store Integration | `content.generated` (EventBus subscription) | Content Creation | Store Integration | `ContentGeneratedPayload` | Use generated content (title, description, images) for the store listing | Content generated |
| 15.004 | Store Integration → Order Tracking | `store.product_pushed` (EventBus) | Store Integration | Order Tracking | `StoreProductPushedPayload` { productId, storeId, platform, listingUrl } | Order Tracking begins monitoring for orders on the pushed product | Product pushed to store |
| 15.005 | Store Integration → Order Tracking | `store.sync_complete` (EventBus) | Store Integration | Order Tracking | `{ clientId, storeId, productsUpdated }` | Order Tracking refreshes order data after sync | Store sync completes |
| 15.006 | Store Integration → Affiliate Commission | `store.product_pushed` (EventBus) | Store Integration | Affiliate Commission | `StoreProductPushedPayload` | Affiliate Commission sets up tracking for the product's affiliate links | Product pushed |
| 15.007 | Store Integration → Content Creation | `store.product_pushed` (EventBus) | Store Integration | Content Creation | `StoreProductPushedPayload` | Content Creation generates platform-specific optimizations post-listing | Product live on store |
| 15.008 | Store Integration → Admin Command Center | `store.connected` (EventBus) | Store Integration | Admin CC | `{ clientId, platform, storeId }` | Admin CC updates store connection status dashboard | New store connected |
| 15.009 | Store Integration → Admin Command Center | `store.sync_complete` (EventBus) | Store Integration | Admin CC | `{ clientId, storeId, productsUpdated }` | Admin CC shows sync results and inventory status | Sync completes |

---

### ENGINE 16: ORDER TRACKING ↔ Other Engines

**Role:** Monitors orders from connected stores, tracks fulfillment status, sends customer notifications via Resend.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 16.001 | Store Integration → Order Tracking | `store.product_pushed` (EventBus subscription) | Store Integration | Order Tracking | `StoreProductPushedPayload` | Begin order monitoring for this product listing | Product pushed |
| 16.002 | Store Integration → Order Tracking | `store.sync_complete` (EventBus subscription) | Store Integration | Order Tracking | `{ clientId, storeId, productsUpdated }` | Refresh order data after store sync | Sync complete |
| 16.003 | Order Tracking → Admin Command Center | `order.received` (EventBus) | Order Tracking | Admin CC | `OrderPayload` { orderId, productId, storeId, customer, amount } | Admin CC displays new order notifications and updates revenue dashboard | New order received |
| 16.004 | Order Tracking → Affiliate Commission | `order.received` (EventBus) | Order Tracking | Affiliate Commission | `OrderPayload` | Affiliate Commission calculates commission for the order's product | Order received |
| 16.005 | Order Tracking → Affiliate Commission | `order.fulfilled` (EventBus) | Order Tracking | Affiliate Commission | `{ orderId, trackingNumber, carrier, fulfilledAt }` | Affiliate Commission confirms commission is payable (only pay on fulfilled orders) | Order fulfilled |
| 16.006 | Order Tracking → Admin Command Center | `order.fulfilled` (EventBus) | Order Tracking | Admin CC | `{ orderId, trackingNumber, carrier }` | Admin CC updates fulfillment status dashboard | Order fulfilled |
| 16.007 | Order Tracking → Admin Command Center | `order.tracking_sent` (EventBus) | Order Tracking | Admin CC | `{ orderId, customerEmail, sent }` | Admin CC logs customer notification status | Tracking email sent |
| 16.008 | Order Tracking → Financial Modelling | Shared table: order data | Order Tracking | Financial Modelling | Actual sales volume, revenue | Financial Modelling validates projections against actual order data (model accuracy feedback loop) | Order data available |
| 16.009 | Order Tracking → Profitability | Shared table: order data | Order Tracking | Profitability | Actual revenue per product | Profitability validates margin calculations against real revenue | Order data available |

---

### ENGINE 17: ADMIN COMMAND CENTER ↔ Other Engines

**Role:** Central admin dashboard — monitors all engines, triggers manual operations, one-click deployment.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 17.001 | Scoring → Admin CC | `scoring.product_scored` (EventBus subscription) | Scoring | Admin CC | `ProductScoredPayload` | Update product score badges and tier distribution charts | Product scored |
| 17.002 | Launch Blueprint → Admin CC | `blueprint.generated` (EventBus subscription) | Launch Blueprint | Admin CC | `BlueprintPayload` | Display generated blueprint for admin review and approval | Blueprint generated |
| 17.003 | Order Tracking → Admin CC | `order.received` (EventBus subscription) | Order Tracking | Admin CC | `OrderPayload` | Real-time order notifications and revenue dashboard updates | Order received |
| 17.004 | Admin CC → Discovery | Manual trigger via API | Admin CC | Discovery | `{ keywords[], sources[], config }` | Admin initiates product scan for specific keywords | Admin clicks "Run Scan" |
| 17.005 | Admin CC → Scoring | Manual trigger via API | Admin CC | Scoring | `{ productIds[] }` | Admin triggers re-scoring for specific products | Admin clicks "Re-Score" |
| 17.006 | Admin CC → Launch Blueprint | Manual approval → `blueprint.approved` | Admin CC | Launch Blueprint | `{ blueprintId, approvedBy }` | Admin approves blueprint, triggering downstream launch flow | Admin clicks "Approve" |
| 17.007 | Admin CC → Store Integration | `admin.product_deployed` (EventBus) | Admin CC | Store Integration | `{ productId, targetStore, deploymentId, deployedBy }` | One-click deploy: admin pushes product directly to YOUSELL's own stores | Admin clicks "Deploy" |
| 17.008 | Admin CC → Store Integration | `admin.batch_deploy_complete` (EventBus) | Admin CC | Store Integration | `{ productCount, deployed, failed, targetStore, deployedBy }` | Batch deployment results trigger store sync | Batch deploy completes |
| 17.009 | Trend Detection → Admin CC | `trend.direction_changed` (EventBus) | Trend Detection | Admin CC | `{ keyword, direction }` | Alert admin when a trend reverses direction | Direction change |
| 17.010 | Profitability → Admin CC | `profitability.margin_alert` (EventBus) | Profitability | Admin CC | `{ productId, margin, threshold }` | Alert admin when product margins fall below threshold | Margin < 20% |
| 17.011 | Content Creation → Admin CC | `content.batch_complete` (EventBus) | Content Creation | Admin CC | `{ requestCount, generated, failed, totalCredits }` | Show AI credit usage and content generation status | Content batch done |
| 17.012 | Client Allocation → Admin CC | `allocation.batch_complete` (EventBus) | Client Allocation | Admin CC | `{ productCount, allocated, skipped }` | Show allocation results | Allocation batch done |
| 17.013 | Store Integration → Admin CC | `store.connected` / `store.sync_complete` (EventBus) | Store Integration | Admin CC | Store connection/sync status | Show store health and sync status | Store events fire |

**Admin CC as System Orchestrator:**

| Comm # | Description |
|--------|-------------|
| 17.014 | Admin Command Center is the **only engine that can manually trigger other engines**. It serves as the human-in-the-loop control plane. All other inter-engine communication is event-driven and automatic (when enabled). Admin CC enforces G10 (manual-first) by requiring explicit admin action to start automation flows. |

---

### ENGINE 18: AFFILIATE COMMISSION ↔ Other Engines

**Role:** Tracks affiliate revenue splits — dual-stream (YOUSELL's own content revenue + client referral commissions).

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 18.001 | Order Tracking → Affiliate Commission | `order.received` (EventBus subscription) | Order Tracking | Affiliate Commission | `OrderPayload` | Record pending commission for the order's affiliate link | Order received |
| 18.002 | Order Tracking → Affiliate Commission | `order.fulfilled` (EventBus subscription) | Order Tracking | Affiliate Commission | `{ orderId, trackingNumber, fulfilledAt }` | Move commission from "pending" to "payable" — only pay on fulfilled orders | Order fulfilled |
| 18.003 | Store Integration → Affiliate Commission | `store.product_pushed` (EventBus subscription) | Store Integration | Affiliate Commission | `StoreProductPushedPayload` | Set up affiliate tracking links for the newly listed product | Product pushed |
| 18.004 | Affiliate Commission → Financial Modelling | Shared table: commission data | Affiliate Commission | Financial Modelling | Commission rates, payout history | Financial Modelling includes affiliate costs in ROI projections | Data available |
| 18.005 | Affiliate Commission → Admin Command Center | Shared table: commission/payout data | Affiliate Commission | Admin CC | Commission totals, payout schedule | Admin CC shows affiliate revenue dashboard and pending payouts | Data available |
| 18.006 | Affiliate Commission → Profitability | Shared table: commission data | Affiliate Commission | Profitability | Commission rates per product | Profitability deducts affiliate commissions from net margin calculations | Data available |

---

### ENGINE 19: FULFILLMENT RECOMMENDATION ↔ Other Engines

**Role:** Recommends optimal fulfillment model (POD, dropshipping, bulk wholesale, hybrid) based on product characteristics, margins, and supplier capabilities.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 19.001 | Scoring → Fulfillment Rec | `scoring.product_scored` (EventBus subscription) | Scoring | Fulfillment Rec | `ProductScoredPayload` | Score tier influences fulfillment model — HOT products may justify bulk purchasing | Product scored |
| 19.002 | Supplier Discovery → Fulfillment Rec | `supplier.found` (EventBus subscription) | Supplier Discovery | Fulfillment Rec | `SupplierFoundPayload` | Supplier capabilities (MOQ, fulfillment services, shipping times) influence model selection | Supplier found |
| 19.003 | Profitability → Fulfillment Rec | `profitability.calculated` (EventBus subscription) | Profitability | Fulfillment Rec | `ProfitabilityPayload` | Margin data determines if POD (lower margin, no risk) or bulk (higher margin, inventory risk) is viable | Profitability calculated |
| 19.004 | Fulfillment Rec → Launch Blueprint | `fulfillment.recommended` (EventBus) | Fulfillment Rec | Launch Blueprint | `FulfillmentPayload` { productId, recommendedType, confidence, reasoning } | Launch Blueprint includes fulfillment model recommendation in the operations section | Recommendation made |
| 19.005 | Fulfillment Rec → Store Integration | `fulfillment.recommended` (EventBus) | Fulfillment Rec | Store Integration | `FulfillmentPayload` | Store Integration configures fulfillment settings (e.g., Printful for POD, supplier direct for dropship) | Recommendation made |
| 19.006 | Fulfillment Rec → Admin Command Center | `fulfillment.overridden` (EventBus) | Fulfillment Rec | Admin CC | `{ productId, overriddenType, reason }` | Admin CC logs when an admin manually overrides the AI's fulfillment recommendation | Admin overrides |
| 19.007 | Fulfillment Rec → Profitability | `fulfillment.recommended` (indirect) | Fulfillment Rec | Profitability | Fulfillment costs by model type | Profitability recalculates margins based on the recommended fulfillment model's cost structure | Recommendation made |
| 19.008 | Fulfillment Rec → Financial Modelling | Shared data: fulfillment cost models | Fulfillment Rec | Financial Modelling | Cost per unit by fulfillment model | Financial Modelling includes fulfillment cost scenarios in ROI projections | Data available |

---

### ENGINE 20: OPPORTUNITY FEED ↔ Other Engines

**Role:** Read-only aggregator — combines data from all engines into a unified opportunity dashboard. Does NOT produce events.

| Comm # | Direction | Event / Mechanism | Source Engine | Target Engine | Payload | Use Case | Trigger Condition |
|--------|-----------|-------------------|--------------|---------------|---------|----------|-------------------|
| 20.001 | Clustering → Opportunity Feed | `clustering.clusters_rebuilt` (EventBus subscription) | Clustering | Opportunity Feed | `{ clustersCreated, productsAssigned }` | Refresh cluster-based groupings in the feed | Clusters rebuilt |
| 20.002 | Creator Matching → Opportunity Feed | `creator.matches_complete` (EventBus subscription) | Creator Matching | Opportunity Feed | `{ productsMatched, matchesCreated }` | Show matched creator count per product | Matching completes |
| 20.003 | Trend Detection → Opportunity Feed | `trend.trend_detected` (EventBus subscription) | Trend Detection | Opportunity Feed | `TrendDetectedPayload` | Highlight products associated with newly detected trends | Trend detected |
| 20.004 | Ad Intelligence → Opportunity Feed | `ads.ads_discovered` (EventBus) | Ad Intelligence | Opportunity Feed | `{ adsFound, adsStored }` | Show ad competition indicators on product cards | Ads discovered |

**Database Aggregation Sources:**

| Comm # | Table | Source Engine | Data Consumed |
|--------|-------|---------------|---------------|
| 20.005 | `products` | Discovery, Scoring | Product details, scores, tiers |
| 20.006 | `product_clusters` | Clustering | Cluster groupings |
| 20.007 | `creator_product_matches` | Creator Matching | Influencer matches per product |
| 20.008 | `product_allocations` | Client Allocation | Allocation status |
| 20.009 | `launch_blueprints` | Launch Blueprint | Blueprint status and key metrics |
| 20.010 | `financial_models` | Financial Modelling | ROI projections, break-even data |
| 20.011 | `trend_signals` | Trend Detection | Trend scores and direction |
| 20.012 | `competitor_products` | Competitor Intelligence | Competitive pressure indicators |
| 20.013 | `product_suppliers` | Supplier Discovery | Supplier availability and pricing |

**Opportunity Feed Is Unique:**

| Comm # | Description |
|--------|-------------|
| 20.014 | Opportunity Feed is the **only engine that never publishes events**. It is a pure consumer — a read-only aggregation layer that joins 9+ tables to produce a unified view. It subscribes to 4 event types for real-time updates but primarily operates via database reads on API request. |

---

## SECTION 4: FULL CROSS-ENGINE COMMUNICATION MATRIX

This matrix shows **every direct communication** between engine pairs. Each cell indicates the mechanism and direction.

**Legend:**
- `→E` = EventBus event (source publishes, target subscribes)
- `→Q` = BullMQ queue enqueue (source enqueues job in target's queue)
- `→D` = Database dependency (source writes table, target reads it)
- `→M` = Manual trigger via API (admin-initiated)
- `—` = No direct communication
- Cells show `A→B` direction; reverse direction shown separately

---

### 4.1 EVENT-BASED COMMUNICATION MATRIX (EventBus Only)

| Source ↓ / Target → | Discovery | TikTok Disc | Scoring | Clustering | Trend Det | Creator Match | Ad Intel | Competitor Intel | Supplier Disc | Profitability | Financial Mod | Launch BP | Client Alloc | Content Create | Store Integ | Order Track | Admin CC | Affiliate Comm | Fulfillment Rec | Opportunity Feed |
|---------------------|-----------|-------------|---------|------------|-----------|---------------|----------|-----------------|---------------|---------------|---------------|-----------|--------------|----------------|-------------|-------------|----------|----------------|-----------------|------------------|
| **Discovery** | — | `scan_complete` | `product_discovered` | — | `scan_complete` | — | `product_discovered` | `product_discovered` | — | — | — | — | — | — | — | — | — | — | — | — |
| **TikTok Disc** | — | — | — | — | `videos_found`, `hashtags_analyzed` | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| **Scoring** | — | — | — | `product_scored` | — | — | — | `product_scored` | `product_scored` | `product_scored` | — | — | `product_scored` | — | — | — | `product_scored` | — | `product_scored` | — |
| **Clustering** | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | `cluster_updated`, `clusters_rebuilt` |
| **Trend Det** | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | `direction_changed` | — | — | `trend_detected` |
| **Creator Match** | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | `creator_matched`, `matches_complete` |
| **Ad Intel** | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | `ads_discovered` |
| **Competitor Intel** | — | — | — | — | — | — | — | — | `batch_complete` | `detected` | `detected` | — | — | — | — | — | — | — | — | — |
| **Supplier Disc** | — | — | — | — | — | — | — | — | — | `found` | `found` | `verified` | — | — | — | — | — | — | `found` | — |
| **Profitability** | — | — | — | — | — | — | — | — | `margin_alert` | — | `calculated` | `calculated` | — | — | — | — | `margin_alert` | — | `calculated` | — |
| **Financial Mod** | — | — | — | — | — | — | — | — | — | — | — | `model_generated`, `roi_projected` | — | — | — | — | — | — | — | — |
| **Launch BP** | — | — | — | — | — | — | — | — | — | — | — | — | `approved` | `approved` | `approved` | — | `generated` | — | — | — |
| **Client Alloc** | — | — | — | — | — | — | — | — | — | — | — | — | — | `product_allocated` | `product_allocated` | — | `batch_complete` | — | — | — |
| **Content Create** | — | — | — | — | — | — | — | — | — | — | — | — | — | — | `generated` | — | `batch_complete` | — | — | — |
| **Store Integ** | — | — | — | — | — | — | — | — | — | — | — | — | — | `product_pushed` | — | `product_pushed`, `sync_complete` | `connected`, `sync_complete` | `product_pushed` | — | — |
| **Order Track** | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | `received`, `fulfilled`, `tracking_sent` | `received`, `fulfilled` | — | — |
| **Admin CC** | `→M` | — | `→M` | — | — | — | — | — | — | — | — | `→M approve` | — | — | `deployed`, `batch_deploy` | — | — | — | — | — |
| **Affiliate Comm** | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| **Fulfillment Rec** | — | — | — | — | — | — | — | — | — | — | — | `recommended` | — | — | `recommended` | — | `overridden` | — | — | — |
| **Opportunity Feed** | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |

---

### 4.2 DATABASE-LEVEL DEPENDENCY MATRIX

| Shared Table | Writer Engine(s) | Reader Engine(s) | Critical Data |
|-------------|-----------------|-----------------|---------------|
| `products` | Discovery | Scoring, Clustering, Trend Detection, Competitor Intel, Profitability, Supplier Discovery, Launch BP, Content Creation, Store Integration, Opportunity Feed, Admin CC, Fulfillment Rec | Product records, metadata, URLs |
| `trend_signals` | Discovery (seed), Trend Detection (primary) | Scoring, Content Creation, Opportunity Feed, Admin CC | Keyword scores, direction, platforms |
| `tiktok_hashtag_signals` | TikTok Discovery | Trend Detection, Scoring | Hashtag acceleration data |
| `tiktok_videos` | TikTok Discovery | Ad Intelligence, Creator Matching | Video metadata, creator data |
| `competitor_products` | Competitor Intelligence | Scoring, Profitability, Launch BP, Content Creation, Admin CC, Opportunity Feed | Competitor listings, prices, reviews |
| `product_clusters` | Clustering | Launch BP, Client Allocation, Opportunity Feed, Admin CC | Cluster groupings |
| `creator_product_matches` | Creator Matching | Launch BP, Content Creation, Financial Modelling, Opportunity Feed, Admin CC | Match records, scores |
| `product_suppliers` | Supplier Discovery | Profitability, Financial Modelling, Fulfillment Rec, Launch BP, Opportunity Feed, Admin CC | Supplier pricing, MOQ, verification |
| `product_allocations` | Client Allocation | Opportunity Feed, Admin CC | Product-to-client assignments |
| `launch_blueprints` | Launch Blueprint | Opportunity Feed, Admin CC | Blueprint content, status |
| `financial_models` | Financial Modelling | Client Allocation, Opportunity Feed, Admin CC | ROI, break-even projections |
| `orders` | Order Tracking | Financial Modelling, Profitability, Admin CC, Affiliate Commission | Order data, fulfillment status |
| `commissions` | Affiliate Commission | Financial Modelling, Profitability, Admin CC | Commission rates, payouts |

---

### 4.3 QUEUE-BASED CROSS-ENGINE COMMUNICATION

| Source Engine | Enqueues To Queue | Queue Owner Engine | Job Data | Use Case |
|-------------- |-------------------|-------------------|----------|----------|
| Discovery | `trend-scan` | Trend Detection | `{ keyword, source, scanId }` | Trigger trend analysis for scanned keyword |
| Discovery | `enrich-product` | Discovery (self) | `{ productId, source, rawUrl }` | Internal enrichment chain |
| TikTok Discovery | `tiktok-product-extract` | TikTok Discovery (self) | `{ videoId, productUrl }` | Internal extraction chain |
| TikTok Discovery → Discovery | `enrich-product` (via chain) | Discovery | `{ productId, source }` | Products found in TikTok videos sent to Discovery for enrichment |
| Admin CC | `product-scan` | Discovery | `{ keywords[], sources[] }` | Manual scan trigger |
| Admin CC | `scoring-queue` | Scoring | `{ productIds[] }` | Manual re-scoring trigger |
| Admin CC | `product-push` | Store Integration | `{ productId, targetStore }` | One-click deployment |

---

## SECTION 5: END-TO-END WORKFLOW SCENARIOS

These scenarios trace a product's journey through the entire engine pipeline, showing every inter-engine handoff.

---

### SCENARIO 1: Full Product Lifecycle (Discovery → Sale)

**Trigger:** Admin clicks "Run Scan" for keyword "portable blender"

```
Step  Engine                  Event/Action                           Next Engine(s)
───── ─────────────────────── ────────────────────────────────────── ──────────────────────────────
1     Admin CC                → Manual trigger: enqueue product-scan → Discovery
2     Discovery               → Scans marketplaces via Apify
                               → Publishes: discovery.product_discovered → Scoring, Competitor Intel, Ad Intel
                               → Publishes: discovery.scan_complete      → Trend Detection, TikTok Discovery
                               → Enqueues: trend-scan job               → Trend Detection
                               → Enqueues: enrich-product job           → Discovery (self)
3     Trend Detection         → Analyzes keyword trajectory
                               → Publishes: trend.trend_detected         → Opportunity Feed
                               → Writes: trend_signals table             → Scoring (data dep)
4     TikTok Discovery        → Scans TikTok for keyword
                               → Publishes: tiktok.videos_found          → Trend Detection
                               → Publishes: tiktok.hashtags_analyzed     → Trend Detection
                               → Writes: tiktok_hashtag_signals          → Scoring (data dep)
5     Scoring                 → Calculates composite score (trend 40% + viral 35% + profit 25%)
                               → Publishes: scoring.product_scored       → Clustering, Competitor Intel, Supplier Disc,
                                                                            Profitability, Client Alloc, Admin CC, Fulfillment Rec
6     Competitor Intelligence → Scans rival listings (only if score >= 60)
                               → Publishes: competitor.detected           → Profitability, Financial Modelling
                               → Publishes: competitor.batch_complete     → Supplier Discovery
7     Supplier Discovery      → Searches AliExpress, Alibaba, CJ
                               → Publishes: supplier.found               → Profitability, Financial Modelling, Fulfillment Rec
                               → Publishes: supplier.verified             → Launch Blueprint
8     Profitability           → Calculates margins with supplier COGS + competitor pricing
                               → Publishes: profitability.calculated      → Financial Modelling, Launch Blueprint, Fulfillment Rec
                               → Publishes: profitability.margin_alert    → Supplier Discovery (if margin < 20%), Admin CC
9     Fulfillment Rec         → Recommends: POD vs dropship vs bulk
                               → Publishes: fulfillment.recommended       → Launch Blueprint, Store Integration
10    Financial Modelling     → Builds ROI model
                               → Publishes: financial.model_generated     → Launch Blueprint
11    Creator Matching        → Matches product to influencers (can run in parallel with steps 6-10)
                               → Publishes: creator.matches_complete      → Opportunity Feed
12    Launch Blueprint        → Generates comprehensive launch plan
                               → Publishes: blueprint.generated           → Admin CC
13    Admin CC                → Admin reviews and approves blueprint
                               → Triggers: blueprint.approved             → Client Allocation, Content Creation, Store Integration
14    Client Allocation       → Assigns product to matching client
                               → Publishes: allocation.product_allocated  → Content Creation, Store Integration
15    Content Creation        → Generates product descriptions, ad copy (Claude Haiku/Sonnet)
                               → Publishes: content.generated             → Store Integration
16    Store Integration       → Pushes product to client's Shopify/TikTok Shop
                               → Publishes: store.product_pushed          → Order Tracking, Affiliate Commission, Content Creation
17    Order Tracking          → Monitors for incoming orders
                               → Publishes: order.received               → Admin CC, Affiliate Commission
18    Affiliate Commission    → Records commission on fulfilled orders
                               → Publishes: affiliate.commission_recorded → (terminal)
19    Order Tracking          → Order fulfilled, tracking sent
                               → Publishes: order.fulfilled              → Admin CC, Affiliate Commission
                               → Publishes: order.tracking_sent          → Admin CC
```

**Total inter-engine handoffs in this scenario: 35+**

---

### SCENARIO 2: Trend Reversal Response

**Trigger:** Trend Detection detects a HOT keyword switching to FALLING

```
Step  Engine              Event                              Response
───── ─────────────────── ────────────────────────────────── ────────────────────────────────────
1     Trend Detection     → trend.direction_changed           → Admin CC receives alert
2     Admin CC            → Displays trend reversal warning   → Admin reviews affected products
3     Admin CC            → Manual trigger: re-score products → Scoring
4     Scoring             → Recalculates with updated trend   → scoring.product_scored
                            (trend_score drops → composite drops)
5     Profitability       → Recalculates margins              → profitability.margin_alert (if margin now < 20%)
6     Admin CC            → Receives margin alert             → Admin decides: continue or halt
7     Admin CC            → If halt: pause store listings     → Store Integration (manual pause)
```

---

### SCENARIO 3: Supplier Price Change Cascade

**Trigger:** Supplier Discovery finds a cheaper supplier for an existing product

```
Step  Engine              Event                              Response
───── ─────────────────── ────────────────────────────────── ────────────────────────────────────
1     Supplier Discovery  → supplier.found (new supplier)     → Profitability, Financial Modelling, Fulfillment Rec
2     Profitability       → Recalculates margins (improved)   → profitability.calculated
3     Financial Modelling → Updates ROI projections (improved) → financial.model_generated
4     Fulfillment Rec     → Re-evaluates model (bulk now      → fulfillment.recommended
                            viable with lower MOQ)
5     Launch Blueprint    → Regenerates with updated data     → blueprint.generated → Admin CC
6     Admin CC            → Shows updated financials          → Admin may re-approve blueprint
```

---

### SCENARIO 4: New Client Onboarding Product Push

**Trigger:** Client connects their Shopify store, Client Allocation has queued products

```
Step  Engine              Event                              Response
───── ─────────────────── ────────────────────────────────── ────────────────────────────────────
1     Store Integration   → store.connected                   → Admin CC (dashboard update)
2     Client Allocation   → Identifies products matching      → allocation.product_allocated
                            client tier/niche
3     Content Creation    → Generates client-branded content  → content.generated
4     Store Integration   → Pushes product to client store    → store.product_pushed
5     Order Tracking      → Begins monitoring                → (waiting for orders)
6     Affiliate Commission→ Sets up tracking links            → (waiting for orders)
7     Store Integration   → store.sync_complete              → Admin CC, Order Tracking
```

---

### SCENARIO 5: Margin Alert Recovery Loop

**Trigger:** Profitability detects margin dropped below 20% threshold

```
Step  Engine              Event                              Response
───── ─────────────────── ────────────────────────────────── ────────────────────────────────────
1     Profitability       → profitability.margin_alert        → Supplier Discovery, Admin CC
2     Supplier Discovery  → Searches for cheaper alternative  → supplier.found (if found)
3     Profitability       → Recalculates with new supplier    → profitability.calculated
4     If margin still low → Loop back to step 1 (max 3 iterations per G10)
5     If margin recovered → Financial Modelling updates ROI   → financial.model_generated
6     If no recovery      → Admin CC alerts operator          → Manual decision required
```

---

## SECTION 6: ARCHITECTURAL OBSERVATIONS & EDGE CASES

### 6.1 Critical Communication Patterns

| Pattern | Description | Engines Involved |
|---------|-------------|-----------------|
| **Fan-Out** | One event triggers multiple downstream engines simultaneously | Scoring → 8 subscribers; blueprint.approved → 3 subscribers |
| **Pipeline** | Sequential chain where output of one is input to next | Discovery → Scoring → Profitability → Financial Modelling → Launch Blueprint |
| **Feedback Loop** | Circular with bounded iterations | Supplier ↔ Profitability (max 3 iterations) |
| **Aggregation** | Multiple sources feed into one consumer | All engines → Opportunity Feed (9+ tables) |
| **Manual Gate** | Human approval required before downstream flow | Admin CC → blueprint.approved (the launch gate) |
| **Broadcast** | One event consumed by many engines but none respond back | scoring.product_scored (8 subscribers, no direct response events to Scoring) |

### 6.2 Engines with NO Outbound Events

| Engine | Reason |
|--------|--------|
| Opportunity Feed | Pure aggregator — read-only consumer |
| Affiliate Commission | Terminal engine — records commissions but triggers nothing downstream |

### 6.3 Engines with NO Inbound Event Subscriptions

| Engine | How They Receive Work |
|--------|----------------------|
| Discovery | Manual trigger via Admin CC API only (G10) |
| Creator Matching | Manual trigger or scheduled (no event subscriptions) |
| Ad Intelligence | Manual trigger or scheduled (no event subscriptions) |

### 6.4 The "Blueprint Approval" Critical Gate

The `blueprint.approved` event is the **most impactful single event** in the system:
- It transitions a product from "research phase" to "launch phase"
- Simultaneously triggers: Client Allocation, Content Creation, Store Integration
- Requires manual admin approval (G10 compliance)
- Everything upstream (8+ engines) feeds INTO the blueprint
- Everything downstream (5+ engines) flows FROM the blueprint approval

### 6.5 Potential Circular Dependencies (All Bounded)

| Loop | Engines | Bound | Resolution |
|------|---------|-------|------------|
| Supplier ↔ Profitability | Supplier Discovery, Profitability | Max 3 iterations | If margin still low after 3 suppliers, flag for manual review |
| Content ↔ Store | Content Creation, Store Integration | Max 2 iterations | Initial content → push → platform-specific optimization → update listing |
| Fulfillment ↔ Profitability | Fulfillment Rec, Profitability | Max 2 iterations | Model recommendation changes costs → margin recalc → possible model change |

### 6.6 Communication Statistics

| Metric | Count |
|--------|-------|
| Total unique inter-engine communication pathways | **148** |
| EventBus event types | **46** (including system events) |
| Event-based connections | **52** |
| Database-level dependencies | **65+** |
| Queue-based cross-engine connections | **7** |
| Manual trigger connections | **6** |
| Engines that publish events | **18** (all except Opportunity Feed and Affiliate Commission*) |
| Engines that subscribe to events | **17** (all except Discovery, Creator Matching, Ad Intelligence) |
| Maximum fan-out from single event | **8** (scoring.product_scored) |
| Longest pipeline chain | **10 steps** (Discovery → ... → Order Tracking) |

*Affiliate Commission publishes events but has no downstream subscribers.

---

## DOCUMENT STATISTICS

| Metric | Value |
|--------|-------|
| Engines covered | 20 |
| Communication entries (Comm #) | 148+ |
| End-to-end scenarios | 5 |
| Architectural patterns identified | 6 |
| Edge cases documented | 6 |
| Tables referenced | 13 shared tables |

---

---

## EXTERNAL ENGINE COMMUNICATION (Added 2026-03-27)

External engines participate in the Governor pipeline via HTTP API calls.
They do NOT directly connect to the EventBus — all communication is
mediated through the Governor dispatch layer.

### Communication Pathways

| # | Source | Target | Channel | Trigger |
|---|--------|--------|---------|---------|
| EXT-001 | Governor Dispatch | External Engine API | HTTP POST | Engine swap active for source engine |
| EXT-002 | External Engine API | Governor Dispatch | HTTP Response | Returns `{ success, data, error }` |
| EXT-003 | Admin UI | External Engine API | HTTP GET (via test endpoint) | Health check / connectivity test |
| EXT-004 | Governor Dispatch | `external_engines` table | SQL SELECT | Cache refresh every 30s |
| EXT-005 | Governor Meter | `engine_usage_ledger` | SQL INSERT | External operation metered same as internal |

### Key Characteristics

- External engines are **fire-and-forget** from the EventBus perspective
- The Governor treats external engine results identically to internal results
- Circuit breaker isolates external failures (3 failures → circuit open)
- Cost tracking works the same — external ops recorded in usage ledger
- No EventBus subscriptions — external engines cannot subscribe to events

---

**END OF DOCUMENT — V9 Inter-Engine Communication Breakdown**
