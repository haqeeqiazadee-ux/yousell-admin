# V9 Gap Closure — Execution Plan

## Overview

**Total gaps to close:** 44 inter-engine pathways + 13 missing individual engine test files
**Approach:** Small batches (1-3 files per batch), independently committable, prioritized by risk

---

## PHASE 1: INDIVIDUAL ENGINE TEST FILES (13 batches)

These engines have NO dedicated test file. Each batch creates one test file following the established pattern from `engine2-competitor-intelligence.test.ts`.

### Batch 1.1 — Discovery Engine (P0 — Core pipeline start)
- **Create:** `tests/engine1-discovery.test.ts`
- **Tests:** scan initiation, product dedup, enrichment queue dispatch, scan_complete emission, product_discovered emission
- **Mock:** Supabase (products table), Apify API, BullMQ queues
- **Est. tests:** ~20

### Batch 1.2 — Scoring Engine (P0 — Core pipeline)
- **Create:** `tests/engine3-scoring.test.ts`
- **Tests:** composite formula (40/35/25 weights), 4-source data reads (trend_signals, tiktok_hashtag_signals, products, competitor_products), tier assignment (HOT/WARM/WATCH/COLD), product_scored emission, product_rejected emission
- **Mock:** Supabase (4 tables), EventBus
- **Est. tests:** ~22

### Batch 1.3 — Profitability Engine (P1 — Financial pipeline)
- **Create:** `tests/engine5-profitability.test.ts`
- **Tests:** margin calculation (selling price - COGS - fees), margin_alert threshold (< 20%), multi-supplier comparison, competitor pricing impact, profitability.calculated emission
- **Mock:** Supabase (product_suppliers, competitor_products, orders)
- **Est. tests:** ~18

### Batch 1.4 — Financial Modelling Engine (P1 — Financial pipeline)
- **Create:** `tests/engine6-financial-modelling.test.ts`
- **Tests:** ROI projection, break-even calculation, scenario analysis (POD/dropship/bulk), multi-source data assembly (profitability, suppliers, competitors, creators, commissions), financial.model_generated emission
- **Mock:** Supabase (financial_models, product_suppliers, competitor_products, creator_product_matches)
- **Est. tests:** ~18

### Batch 1.5 — Trend Detection (P1 — Intelligence)
- **Create:** `tests/engine-trend-detection.test.ts`
- **Tests:** keyword trajectory analysis, direction detection (rising/falling/stable/exploding), momentum calculation, multi-platform signal aggregation, trend_detected emission, direction_changed emission
- **Mock:** Supabase (trend_signals, tiktok_hashtag_signals)
- **Est. tests:** ~16

### Batch 1.6 — Clustering (P2 — Enrichment)
- **Create:** `tests/engine-clustering.test.ts`
- **Tests:** similarity scoring (tokenization, greedy clustering), cluster creation/merge/split, cluster_updated emission, clusters_rebuilt emission, product_clusters table writes
- **Mock:** Supabase (product_clusters, products)
- **Est. tests:** ~14

### Batch 1.7 — Creator Matching (P2 — Enrichment)
- **Create:** `tests/engine-creator-matching.test.ts`
- **Tests:** compatibility scoring, platform weighting (TikTok, Instagram, YouTube), engagement rate thresholds, creator_matched emission, matches_complete emission
- **Mock:** Supabase (creator_product_matches, tiktok_creators, tiktok_videos)
- **Est. tests:** ~14

### Batch 1.8 — Ad Intelligence (P2 — Enrichment)
- **Create:** `tests/engine-ad-intelligence.test.ts`
- **Tests:** Meta Ads Library search, TikTok Creative Center search, ad creative analysis, spend estimation, sponsored content detection, ads_discovered emission
- **Mock:** Supabase, Apify/Meta/TikTok API mocks
- **Est. tests:** ~14

### Batch 1.9 — Opportunity Feed (P2 — Aggregation)
- **Create:** `tests/engine-opportunity-feed.test.ts`
- **Tests:** 9-table aggregation (products, clusters, creators, allocations, blueprints, financials, trends, suppliers, competitors), sorting/filtering, empty state handling, read-only verification (no writes)
- **Mock:** Supabase (9 tables)
- **Est. tests:** ~12

### Batch 1.10 — Fulfillment Recommendation (P2 — Supply chain)
- **Create:** `tests/engine-fulfillment-recommendation.test.ts`
- **Tests:** model selection logic (POD vs dropship vs bulk), MOQ threshold, margin-based routing, fulfillment.recommended emission, fulfillment.overridden emission
- **Mock:** Supabase (product_suppliers, profitability data)
- **Est. tests:** ~12

### Batch 1.11 — POD Engine (P3 — Fulfillment)
- **Create:** `tests/engine-pod.test.ts`
- **Tests:** Printful/Printify/Gelato integration, product template creation, order routing, fulfillment sync
- **Mock:** Supabase, Printful/Printify API mocks
- **Est. tests:** ~10

### Batch 1.12 — Amazon Intelligence (P3 — Marketplace)
- **Create:** `tests/engine-amazon-intelligence.test.ts`
- **Tests:** ASIN extraction, BSR parsing, review analysis, pricing intelligence, amazon.products_found emission
- **Mock:** Supabase, Apify Amazon scraper
- **Est. tests:** ~10

### Batch 1.13 — Shopify Intelligence (P3 — Marketplace)
- **Create:** `tests/engine-shopify-intelligence.test.ts`
- **Tests:** store discovery, product catalog scraping, theme detection, traffic estimation, shopify.products_found emission
- **Mock:** Supabase, Apify Shopify scraper
- **Est. tests:** ~10

**Phase 1 Total: 13 batches, 13 new test files, ~190 tests**

---

## PHASE 2: INTER-ENGINE COMMUNICATION GAPS (10 batches)

These close the 44 missing Comm # pathways. Each batch is a focused test file for one gap category.

### Batch 2.1 — Scoring Producer Gaps (6 pathways)
- **Create:** `tests/inter-engine-scoring-producer.test.ts`
- **Pathways:** 3.003, 3.005, 3.009, 6.001, 8.002, 10.001
- **Tests:** Scoring → Competitor Intel (score >= 60 filter), Scoring → Profitability (initial margin trigger), Scoring → Opportunity Feed (DB score writes), Scoring → Creator Matching (indirect trigger)
- **Pattern:** Register real engines + real EventBus, mock Supabase
- **Est. tests:** 6

### Batch 2.2 — Content Creation Consumer Gaps (8 pathways)
- **Create:** `tests/inter-engine-content-consumers.test.ts`
- **Pathways:** 5.009, 6.005, 7.006, 8.010, 14.006, 14.007, 14.008, 14.009
- **Tests:** Content reads trend_signals for keywords, reads creator_product_matches for style, reads competitor ad data for differentiation, reads competitor_products for USP
- **Pattern:** Mock shared tables with realistic data, verify Content engine reads correctly
- **Est. tests:** 8

### Batch 2.3 — Admin CC Consumer Gaps (8 pathways)
- **Create:** `tests/inter-engine-admin-cc-consumers.test.ts`
- **Pathways:** 4.004, 6.008, 8.008, 9.008, 11.008, 17.009, 17.010, 18.005
- **Tests:** Admin CC reads product_clusters, creator_product_matches, competitor_products, suppliers, financial_models, commission data for dashboard aggregation
- **Pattern:** Mock DB tables, verify dashboard data assembly
- **Est. tests:** 8

### Batch 2.4 — Client Allocation Consumer Gaps (6 pathways)
- **Create:** `tests/inter-engine-client-allocation-consumers.test.ts`
- **Pathways:** 4.006, 10.008, 11.010, 13.007, 13.008, 13.009
- **Tests:** Allocation reads clusters for diversification, profitability for margin-tier matching, financial models for ROI-tier matching
- **Pattern:** Mock DB tables, verify allocation logic uses upstream data
- **Est. tests:** 6

### Batch 2.5 — Opportunity Feed Consumer Gaps (6 pathways)
- **Create:** `tests/inter-engine-opportunity-feed-consumers.test.ts`
- **Pathways:** 3.009, 9.009, 10.009, 11.009, 12.008, 13.006
- **Tests:** Feed reads product scores, supplier availability, margin indicators, financial projections, blueprint status, allocation status
- **Pattern:** Mock all 9 tables, verify unified aggregation
- **Est. tests:** 6

### Batch 2.6 — Clustering Producer Gaps (5 pathways)
- **Create:** `tests/inter-engine-clustering-producer.test.ts`
- **Pathways:** 4.004, 4.005, 4.006, 12.009, 13.007
- **Tests:** Clustering writes product_clusters → verify Admin CC, Launch Blueprint, Client Allocation can read
- **Pattern:** Mock Supabase writes, verify downstream reads
- **Est. tests:** 5

### Batch 2.7 — Ad Intelligence Producer Gaps (4 pathways)
- **Create:** `tests/inter-engine-ad-intelligence-producer.test.ts`
- **Pathways:** 7.002, 7.005, 7.008, 11.005
- **Tests:** Ad data → Scoring profit_score adjustment, Ad benchmarks → Financial Modelling budget projection, TikTok videos → Ad Intel sponsored detection
- **Pattern:** Mock shared tables, verify cross-engine data reads
- **Est. tests:** 4

### Batch 2.8 — Trend Detection Producer Gaps (2 pathways)
- **Create:** `tests/inter-engine-trend-detection-producer.test.ts`
- **Pathways:** 1.009, 5.007
- **Tests:** HOT trend (>= 80) signals Discovery for additional scanning, rate limiting (max 1 additional scan per keyword per 24h)
- **Pattern:** Real EventBus, verify indirect Discovery trigger with rate limit
- **Est. tests:** 3

### Batch 2.9 — Remaining Cross-Engine Gaps (13 pathways)
- **Create:** `tests/inter-engine-remaining-gaps.test.ts`
- **Pathways:** 2.005, 8.005, 8.007, 12.010, 12.012, 16.008, 16.009, 17.006, 18.004, 18.006, 19.007, 19.008
- **Tests:**
  - TikTok Discovery → Discovery (enrich-product chain)
  - Competitor Intel → Scoring (profit_score adjustment via DB)
  - Competitor Intel → Launch Blueprint (competitive landscape via DB)
  - **Blueprint Approval Gate (Comm #12.012)** — manual gate enforcement
  - Order Tracking → Financial Modelling + Profitability (sales validation via DB)
  - Admin CC → Launch Blueprint (manual approval trigger)
  - Affiliate Commission → Financial Modelling + Profitability (commission cost deduction via DB)
  - Fulfillment Rec → Profitability + Financial Modelling (fulfillment cost feedback)
- **Pattern:** Mixed — some EventBus, some DB dependency
- **Est. tests:** 13

### Batch 2.10 — Affiliate Commission Producer Gaps (3 pathways)
- **Create:** `tests/inter-engine-affiliate-producer.test.ts`
- **Pathways:** 18.004, 18.006 (DB reads by Financial/Profitability), plus commission_recorded/payout_calculated event verification
- **Tests:** Financial Modelling reads commission data for cost projections, Profitability reads for net margin deduction, verify commission events emitted
- **Pattern:** Mock commission tables, verify downstream reads
- **Est. tests:** 3

**Phase 2 Total: 10 batches, 10 new test files, ~62 tests**

---

## EXECUTION ORDER

| Order | Batch | File | Tests | Dependency |
|-------|-------|------|-------|------------|
| 1 | 1.1 | engine1-discovery.test.ts | ~20 | None — core engine |
| 2 | 1.2 | engine3-scoring.test.ts | ~22 | None — core engine |
| 3 | 1.3 | engine5-profitability.test.ts | ~18 | None — core engine |
| 4 | 1.4 | engine6-financial-modelling.test.ts | ~18 | None — core engine |
| 5 | 1.5 | engine-trend-detection.test.ts | ~16 | None |
| 6 | 1.6 | engine-clustering.test.ts | ~14 | None |
| 7 | 1.7 | engine-creator-matching.test.ts | ~14 | None |
| 8 | 1.8 | engine-ad-intelligence.test.ts | ~14 | None |
| 9 | 1.9 | engine-opportunity-feed.test.ts | ~12 | None |
| 10 | 1.10 | engine-fulfillment-recommendation.test.ts | ~12 | None |
| 11 | 1.11 | engine-pod.test.ts | ~10 | None |
| 12 | 1.12 | engine-amazon-intelligence.test.ts | ~10 | None |
| 13 | 1.13 | engine-shopify-intelligence.test.ts | ~10 | None |
| 14 | 2.1 | inter-engine-scoring-producer.test.ts | 6 | After 1.2 |
| 15 | 2.2 | inter-engine-content-consumers.test.ts | 8 | None |
| 16 | 2.3 | inter-engine-admin-cc-consumers.test.ts | 8 | None |
| 17 | 2.4 | inter-engine-client-allocation-consumers.test.ts | 6 | None |
| 18 | 2.5 | inter-engine-opportunity-feed-consumers.test.ts | 6 | After 1.9 |
| 19 | 2.6 | inter-engine-clustering-producer.test.ts | 5 | After 1.6 |
| 20 | 2.7 | inter-engine-ad-intelligence-producer.test.ts | 4 | After 1.8 |
| 21 | 2.8 | inter-engine-trend-detection-producer.test.ts | 3 | After 1.5 |
| 22 | 2.9 | inter-engine-remaining-gaps.test.ts | 13 | After Phase 1 |
| 23 | 2.10 | inter-engine-affiliate-producer.test.ts | 3 | None |

---

## RULES PER BATCH

1. **Read the engine implementation file** before writing any test
2. **Follow existing patterns** exactly (vi.mock server-only, Supabase mock chain, beforeEach reset)
3. **Max 3 files touched** per commit (1 test file + at most 2 supporting changes)
4. **Run `npx vitest run <file>` after each batch** to verify tests pass
5. **Commit immediately** after each batch passes
6. **Map each test to a Comm # or V9 task** in comments
7. **No stubs** — every test must assert real behavior

---

## TOTALS

| Phase | Batches | New Files | New Tests |
|-------|---------|-----------|-----------|
| Phase 1: Individual Engine Tests | 13 | 13 | ~190 |
| Phase 2: Inter-Engine Gaps | 10 | 10 | ~62 |
| **GRAND TOTAL** | **23** | **23 files** | **~252 tests** |

Combined with existing 800+ tests, this brings total to **~1,050+ tests** with 100% pathway coverage.
