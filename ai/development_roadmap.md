# YOUSELL Platform — Development Roadmap
## Engines 1-3 Implementation
## Updated 2026-03-11

---

## Phase 1: Foundation (Sessions 1-3)

### Session 1: Database + Purchasing Engine Core
- [ ] Create 8 new database tables (product_costs, profitability_analysis, content_queue, published_content, content_performance, scoring_adjustments, budget_tracking, template_performance)
- [ ] Implement CJDropshipping API client
- [ ] Build supplier_lookup_worker (W22)
- [ ] Test: product → supplier lookup → cost data stored

### Session 2: Cost Calculator + Profitability Core
- [ ] Implement per-platform cost calculation logic
- [ ] Build cost_calculator_worker (W23)
- [ ] Build profitability_analysis_worker (W24) with Claude Haiku
- [ ] Test: cost data → viability verdict

### Session 3: Pipeline Integration
- [ ] Wire scoring engine → Engine 1 trigger (score >= 60)
- [ ] Wire Engine 1 → Engine 2 → verdict output
- [ ] Add AliExpress fallback to supplier worker
- [ ] End-to-end test

## Phase 2: Content Engine (Sessions 4-7)

### Session 4: n8n Setup + Blotato Integration
- [ ] Configure n8n on Railway
- [ ] Install Blotato n8n community node
- [ ] Set up API credentials
- [ ] Create n8n workflows for W1-W3

### Session 5: Content Script + Image Generation
- [ ] Build content_script_worker (W25)
- [ ] Implement Nano Banana 2 image generation
- [ ] Build product_image_worker (W28) — template #8226
- [ ] Test: product → script → images

### Session 6: Video Generation Pipeline
- [ ] Implement Blotato faceless video — template #5035
- [ ] Implement NanoBanana+VEO3 avatar pipeline — template #8270
- [ ] Build ElevenLabs voiceover workflow
- [ ] Test: script → video + audio

### Session 7: Publishing Pipeline
- [ ] Build publishing workflow — template #7187
- [ ] Implement human review queue
- [ ] Set up staggered posting
- [ ] Test: content → published

## Phase 3: Intelligence & UI (Sessions 8-11)

### Session 8: Performance Tracking
- [ ] Build performance_tracking_worker (W32)
- [ ] Implement engagement data collection
- [ ] Set up aggregation

### Session 9: Feedback Loop + Budget Monitor
- [ ] Build feedback_processor_worker (W33)
- [ ] Build budget_monitor_worker (W34)
- [ ] Test weekly feedback cycle

### Session 10: Admin UI — Purchasing + Profitability
- [ ] /purchasing dashboard
- [ ] /profitability center
- [ ] Product detail rows 8-9
- [ ] /settings/budget page

### Session 11: Admin UI — Content Studio
- [ ] /content review queue
- [ ] /content/calendar
- [ ] /analytics/content dashboard
- [ ] Product detail row 10

## Phase 4: Optimization (Sessions 12-13)

### Session 12: Pipeline Refinement
- [ ] Price optimization worker (W35)
- [ ] Claude Sonnet escalation for STRONG products
- [ ] Error handling and retries
- [ ] Dead letter queues

### Session 13: Testing + Launch
- [ ] End-to-end integration testing
- [ ] Budget alert testing
- [ ] Content quality review
- [ ] Production deployment

---

## Dependencies
```
S1 → S2 → S3 → S4 → S5 → S6 → S7
                            ↓
                      S8 → S9
                      S10 → S11 (parallel with S8-S9)
                            ↓
                      S12 → S13
```

## n8n Templates Used
- #5035: VEO3+Blotato (Session 6)
- #7187: Multi-platform publishing (Session 7)
- #8226: NanoBanana images (Session 5)
- #8270/#11204: NanoBanana+VEO3+Blotato (Session 6)

**Total Sessions: 13 | Total Tasks: ~44**
