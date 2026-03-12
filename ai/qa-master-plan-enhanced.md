# YOUSELL QA Master Plan — Enhanced & Corrected

**Date:** 2026-03-12
**Version:** 2.0 (Enhanced from original QA prompt)
**Status:** Ready for execution

---

## How This Plan Relates to the Original

This enhanced plan **preserves all 10 phases** from the original QA master prompt, then **adds 8 new phases** to cover every gap identified in the gap analysis. Inaccuracies in the original have been corrected inline.

---

## CORRECTED: Score Tier Thresholds

| Tier | Original (WRONG) | Corrected (From Code) |
|------|-------------------|-----------------------|
| HOT | >= 75 | **>= 80** |
| WARM | 50-74 | **>= 60** |
| WATCH | (missing) | **>= 40** |
| COLD | < 50 | **< 40** |

## CORRECTED: Systems Excluded (Not Yet Built)

The following are referenced in the original QA plan but **do not exist in code**. They are excluded from current QA and marked as future-phase:

- Shopify Store Provisioner (store creation)
- Blotato API / Content Pipeline
- HeyGen Avatar Generation
- ElevenLabs Voice Synthesis
- VEO3 Video Generation
- Payment Gateway / Client Billing
- CJ Dropshipping Order Placement (only sourcing exists)

---

## PHASE 1: Pre-Flight Discovery (Original)

*Unchanged from original QA plan. Valid as-is.*

**Required inputs before any testing begins:**
- Feature specification or bug report
- List of modified files
- Affected database schemas
- Integration dependencies
- User stories or acceptance criteria

---

## PHASE 2: Architecture Review (Original — Enhanced)

*Original checklist retained. Additional checks added.*

**Original Architecture Checklist:**

| Component | Check | Status |
|-----------|-------|--------|
| API Rate Limits | All external APIs rate-limited and queued? | ⬜ |
| Error Boundaries | Failures cascade or isolate? | ⬜ |
| Data Consistency | Transactions atomic where needed? | ⬜ |
| Caching Strategy | Cache invalidation handled? | ⬜ |
| Retry Logic | Transient failures retried with backoff? | ⬜ |
| Timeout Handling | Long operations have timeouts? | ⬜ |
| Secret Management | API keys and credentials secure? | ⬜ |
| Logging Coverage | Can trace request end-to-end? | ⬜ |

**NEW Architecture Checks:**

| Component | Check | Status |
|-----------|-------|--------|
| BullMQ Worker Concurrency | 2-job limit enforced? | ⬜ |
| Redis Connection Resilience | Queue survives Redis restart? | ⬜ |
| Provider Fallback Chains | Apify → RapidAPI → Official API works? | ⬜ |
| Supabase Realtime | Subscriptions clean up on unmount? | ⬜ |
| 24h Cache TTL | Stale data evicted correctly? | ⬜ |
| Middleware Auth | Next.js middleware blocks unauthenticated? | ⬜ |
| CORS Config | Frontend URL whitelisted correctly? | ⬜ |
| Helmet Headers | Security headers applied? | ⬜ |

---

## PHASE 3: Business Logic Validation (Original — Corrected)

**CORRECTED Business Rules Test Matrix:**

| Rule | Test Case | Expected | Actual | Pass/Fail |
|------|-----------|----------|--------|-----------|
| Scoring Formula | (Trend x 0.40) + (Viral x 0.35) + (Profit x 0.25) | 0-100 | | ⬜ |
| HOT Threshold | Score >= 80 | Label: HOT | | ⬜ |
| WARM Threshold | Score 60-79 | Label: WARM | | ⬜ |
| WATCH Threshold | Score 40-59 | Label: WATCH | | ⬜ |
| COLD Threshold | Score < 40 | Label: COLD | | ⬜ |
| Trend Stage: Exploding | viral_score >= 80 | Stage: exploding | | ⬜ |
| Trend Stage: Rising | viral_score 60-79 | Stage: rising | | ⬜ |
| Trend Stage: Emerging | viral_score 40-59 | Stage: emerging | | ⬜ |
| Trend Stage: Saturated | viral_score < 40 | Stage: saturated | | ⬜ |
| AI Insight: Sonnet | final_score >= 75 | Eligible for Sonnet | | ⬜ |
| AI Insight: Haiku | final_score 60-74 | Eligible for Haiku | | ⬜ |
| Email Alert | final_score >= 80 | Product alert sent | | ⬜ |
| Email Rate Limit | 4th alert in same day | Alert suppressed | | ⬜ |
| Cost Ceiling | Monthly total | <= $300 | | ⬜ |
| Scan Quick Cost | Quick scan | ~$0.10 | | ⬜ |
| Scan Full Cost | Full scan | ~$0.50 | | ⬜ |

---

## PHASE 4: Integration Testing (Original — Corrected)

**CORRECTED: Use actual providers from codebase, not aspirational ones.**

```yaml
TREND_ENGINE_TESTS:
  TikTok_Apify_Actor:
    - test_clockworks_tiktok_scraper_success
    - test_apify_rate_limit_handling
    - test_fallback_to_official_api
    - test_parse_tiktok_metadata (likes, shares, comments, views, hashtags)
    - test_empty_results_handling

  Amazon_RapidAPI:
    - test_realtime_amazon_search_results
    - test_fallback_to_apify_bestsellers_scraper
    - test_asin_extraction_accuracy
    - test_bsr_rank_parsing
    - test_price_extraction_accuracy

  Pinterest_Apify_Crawler:
    - test_alexey_pinterest_crawler_success
    - test_pin_saves_count_extraction
    - test_pinner_info_parsing

  Shopify_Apify_Scraper:
    - test_clearpath_shopify_scraper_success
    - test_variant_parsing
    - test_vendor_extraction

  Google_Trends_Apify:
    - test_emastra_google_trends_scraper
    - test_keyword_batch_processing (groups of 5)
    - test_trend_direction_classification

INFLUENCER_TESTS:
  Instagram_Apify_Scraper:
    - test_profile_scraper_success
    - test_follower_tier_classification (nano/micro/mid/macro)
    - test_cpp_estimation_by_tier
    - test_conversion_score_calculation
    - test_fallback_to_ainfluencer

SUPPLIER_TESTS:
  Alibaba_Apify_Scraper:
    - test_epctex_alibaba_scraper_success
    - test_moq_parsing
    - test_shipping_cost_extraction
    - test_fallback_to_cj_dropshipping_api

DIGITAL_TESTS:
  Gumroad_Apify_Scraper:
    - test_epctex_gumroad_scraper_success
    - test_digital_product_categorization

AFFILIATE_TESTS:
  Seeded_Programs:
    - test_10_ai_affiliate_programs_loaded
    - test_5_physical_affiliate_programs_loaded
    - test_commission_rate_accuracy
    - test_cookie_duration_values
```

---

## PHASE 5: Security & Compliance (Original — Enhanced)

**Original checklist retained. Additional checks added.**

| Vulnerability | Test | Status |
|---------------|------|--------|
| SQL Injection | Parameterized queries (Supabase client handles) | ⬜ |
| XSS | User input escaped — especially blueprint PDF | ⬜ |
| CSRF | State-changing requests protected | ⬜ |
| Auth Bypass | Protected routes require valid session | ⬜ |
| Sensitive Data Exposure | No secrets in logs or responses | ⬜ |
| Broken Access Control | Users can only access their own data | ⬜ |
| Security Misconfiguration | Helmet headers (HSTS, CSP) | ⬜ |
| Insecure Deserialization | No eval() or unsafe parsing | ⬜ |

**NEW Security Checks:**

| Vulnerability | Test | Status |
|---------------|------|--------|
| Sort Field Injection | Influencer sort whitelist enforced | ⬜ |
| Product Field Injection | Product create/update whitelist enforced | ⬜ |
| Role Escalation | Client cannot access /admin routes | ⬜ |
| Notification Ownership | Users can only read own notifications | ⬜ |
| Allocation Ownership | allocated_by tracks correct user | ⬜ |
| CSV Injection | Malicious CSV formulas neutralized | ⬜ |
| Env Var Exposure | Settings API doesn't leak API key values | ⬜ |
| Bearer Token Validation | Backend rejects expired/invalid JWT | ⬜ |
| Rate Limiting | 100 req/min general, 10 req/min scan | ⬜ |

---

## PHASE 6: Performance Testing (Original — Corrected)

**CORRECTED: Remove non-existent systems, add actual ones.**

| Operation | Target | P50 | P95 | P99 | Status |
|-----------|--------|-----|-----|-----|--------|
| Product Score Calculation | < 500ms | | | | ⬜ |
| Dashboard Initial Load | < 2s | | | | ⬜ |
| Product Search API | < 1s | | | | ⬜ |
| Quick Scan (end-to-end) | < 3min | | | | ⬜ |
| Full Scan (end-to-end) | < 15min | | | | ⬜ |
| CSV Import (100 rows) | < 10s | | | | ⬜ |
| Blueprint PDF Generation | < 5s | | | | ⬜ |
| Allocation Query (per client) | < 500ms | | | | ⬜ |
| Trend Keywords Query (100) | < 1s | | | | ⬜ |
| Supabase Realtime Latency | < 2s | | | | ⬜ |

---

## PHASE 7: UI/UX Testing (Original — Enhanced)

**CORRECTED: Add client dashboard, all admin pages.**

| Feature | Chrome | Firefox | Safari | Mobile | Status |
|---------|--------|---------|--------|--------|--------|
| Admin Login Flow | | | | | ⬜ |
| Admin Dashboard | | | | | ⬜ |
| Scan Control Panel | | | | | ⬜ |
| Products CRUD | | | | | ⬜ |
| Platform Pages (x5) | | | | | ⬜ |
| Trends Management | | | | | ⬜ |
| Competitor Tracking | | | | | ⬜ |
| Influencer Database | | | | | ⬜ |
| Supplier Database | | | | | ⬜ |
| Blueprints + PDF | | | | | ⬜ |
| Client Management | | | | | ⬜ |
| Product Allocation | | | | | ⬜ |
| CSV Import | | | | | ⬜ |
| Settings (3 tabs) | | | | | ⬜ |
| Setup Wizard | | | | | ⬜ |
| Notifications | | | | | ⬜ |
| **Client Dashboard** | | | | | ⬜ |
| **Client Products** | | | | | ⬜ |
| **Client Requests** | | | | | ⬜ |
| Dark Mode Toggle | | | | | ⬜ |
| Sidebar Navigation | | | | | ⬜ |

---

## PHASE 8: Error Handling & Recovery (Original — Corrected)

**CORRECTED: Replace non-existent systems with actual ones.**

| Failure Injection | Expected Behavior | Actual | Pass/Fail |
|-------------------|-------------------|--------|-----------|
| Kill database connection | Retry 3x, then show error | | ⬜ |
| Block TikTok Apify actor | Continue with other platforms, flag degraded | | ⬜ |
| Redis connection lost | Queue operations fail gracefully, log error | | ⬜ |
| Scan worker crashes mid-job | Scan status updated to 'failed', error logged | | ⬜ |
| Supabase realtime disconnects | Dashboard shows stale-data indicator | | ⬜ |
| CSV with 10K rows | Import handles without timeout/OOM | | ⬜ |
| Concurrent scan submissions | Rate limiter returns 429 after 10/min | | ⬜ |
| Invalid JWT on backend | 401 returned, no data leaked | | ⬜ |
| Missing API key for provider | Empty results, warning logged, no crash | | ⬜ |

---

## PHASE 9: Data Integrity (Original — Enhanced)

**NEW Data Integrity Checks:**

| Check | Query/Validation | Status |
|-------|------------------|--------|
| Product uniqueness | UNIQUE(source, external_id) enforced | ⬜ |
| No orphaned allocations | All product_allocations.product_id exist in products | ⬜ |
| No orphaned requests | All product_requests.client_id exist in clients | ⬜ |
| Allocation limits | No client exceeds plan tier limit | ⬜ |
| Score range | All final_score values 0-100 | ⬜ |
| Tier consistency | Score tier matches final_score value | ⬜ |
| Scan history | All completed scans have product_count > 0 | ⬜ |
| Trend keywords | No duplicate keyword+source combinations | ⬜ |
| Financial models | All have valid product_id references | ⬜ |
| Notification ownership | All notifications have valid user_id | ⬜ |
| Audit trail | All products have created_by set | ⬜ |

---

## PHASE 10: Final Sign-off (Original — Enhanced)

*Original sign-off retained. Additional criteria added.*

**Technical Sign-off (SARAH):**
- [ ] All critical tests passing
- [ ] No high/critical severity bugs open
- [ ] Performance within thresholds
- [ ] Security scan clean
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] **NEW: Known bugs #5 and #22 resolved or documented**
- [ ] **NEW: All 21 gap items addressed**

**Business Sign-off (DAVID):**
- [ ] Core user journeys work end-to-end
- [ ] Revenue-impacting features validated
- [ ] Client-facing quality acceptable
- [ ] Costs remain within $300/mo ceiling
- [ ] **NEW: Client dashboard works for all plan tiers**
- [ ] **NEW: Product allocation limits enforced correctly**

---

## NEW PHASE 11: Client Dashboard & Allocation Testing

| Test Case | Expected | Status |
|-----------|----------|--------|
| Client login sees /dashboard (not /admin) | Client dashboard renders | ⬜ |
| Client cannot access /admin/* routes | Redirected to /admin/unauthorized | ⬜ |
| Allocated products visible to client | Products with visible_to_client=true shown | ⬜ |
| Hidden products not visible | Products with visible_to_client=false hidden | ⬜ |
| Product request submission | Creates pending request in product_requests | ⬜ |
| Request status tracking | Pending → Reviewed → Fulfilled states work | ⬜ |
| KPI cards accurate | Counts match database | ⬜ |
| Starter plan: max 3 products | 4th allocation blocked with error | ⬜ |
| Growth plan: max 10 products | 11th allocation blocked | ⬜ |
| Professional plan: max 25 | 26th allocation blocked | ⬜ |
| Enterprise plan: max 50 | 51st allocation blocked | ⬜ |
| Quick-select top 5/10/25 | Correct number of highest-scored products selected | ⬜ |

---

## NEW PHASE 12: BullMQ Job Queue Testing

| Test Case | Expected | Status |
|-----------|----------|--------|
| Scan job queued successfully | Job ID returned, status = 'waiting' | ⬜ |
| Job progress updates | Progress 0-100% reported correctly | ⬜ |
| Job completion | Status = 'completed', scan record updated | ⬜ |
| Job failure | Status = 'failed', error in scan record | ⬜ |
| Job cancellation | Status = 'cancelled', job removed from queue | ⬜ |
| Worker concurrency | Max 2 simultaneous jobs enforced | ⬜ |
| Redis disconnect recovery | Worker reconnects and resumes | ⬜ |
| BACKEND_URL missing | 503 returned with clear error | ⬜ |

---

## NEW PHASE 13: CSV Import Testing

| Test Case | Expected | Status |
|-----------|----------|--------|
| Valid CSV with all columns | All products imported as 'draft' | ⬜ |
| CSV with minimal columns (title only) | Products created with title | ⬜ |
| CSV with fuzzy column names | 'name' mapped to title, 'cost' to price | ⬜ |
| Excel file upload | Rejected with error message | ⬜ |
| CSV with no title/name column | Rejected with validation error | ⬜ |
| CSV with quoted fields containing commas | Parsed correctly per RFC 4180 | ⬜ |
| Empty CSV | Error returned, no records created | ⬜ |
| Partial success (some rows invalid) | status: 'partial', errors listed | ⬜ |
| Import audit log | Entry in imported_files table | ⬜ |
| created_by tracking | User ID recorded on imported products | ⬜ |

---

## NEW PHASE 14: Financial Model & Auto-Rejection Testing

| Test Case | Expected | Status |
|-----------|----------|--------|
| Margin >= 40% | Not auto-rejected | ⬜ |
| Margin < 40% | Auto-rejected with reason | ⬜ |
| Shipping <= 30% of retail | Not auto-rejected | ⬜ |
| Shipping > 30% of retail | Auto-rejected with reason | ⬜ |
| Break-even <= 2 months | Not auto-rejected | ⬜ |
| Break-even > 2 months | Auto-rejected with reason | ⬜ |
| Fragile without certification | Auto-rejected with reason | ⬜ |
| No USA delivery < 15 days | Auto-rejected with reason | ⬜ |
| IP/trademark risk | Auto-rejected with reason | ⬜ |
| Retail price < $10 | Auto-rejected with reason | ⬜ |
| 100+ competitors | Auto-rejected with reason | ⬜ |
| Multiple rejection reasons | All reasons listed | ⬜ |
| Valid product, no flags | autoRejected = false | ⬜ |
| Financial model stored | Record in financial_models table | ⬜ |

---

## NEW PHASE 15: Blueprint & PDF Testing

| Test Case | Expected | Status |
|-----------|----------|--------|
| Create blueprint for product | Record in launch_blueprints | ⬜ |
| Blueprint fields populated | All 7 content fields stored | ⬜ |
| generated_by set to 'sonnet' | Correct attribution | ⬜ |
| PDF endpoint returns HTML | Content-Type: text/html | ⬜ |
| PDF includes product metadata | Platform, score, date shown | ⬜ |
| XSS in product title | HTML escaped in PDF output | ⬜ |
| Print-friendly CSS | @page styles present | ⬜ |
| Non-existent blueprint ID | 404 or empty response | ⬜ |

---

## NEW PHASE 16: Notification & Automation Testing

**Notifications:**

| Test Case | Expected | Status |
|-----------|----------|--------|
| Fetch user notifications | Only user's own notifications returned | ⬜ |
| Mark notification as read | read = true updated | ⬜ |
| Mark another user's notification | Rejected (ownership check) | ⬜ |
| Notifications ordered by date | Most recent first | ⬜ |

**Automation:**

| Test Case | Expected | Status |
|-----------|----------|--------|
| List automation jobs | All jobs from automation_jobs table | ⬜ |
| Enable single job | Job status = 'enabled' | ⬜ |
| Disable single job | Job status = 'disabled' | ⬜ |
| Master kill switch ON | All jobs set to 'disabled' | ⬜ |
| All jobs disabled by default | Initial state = disabled | ⬜ |

---

## NEW PHASE 17: Influencer Conversion Score Validation

| Test Case | Expected | Status |
|-----------|----------|--------|
| Follower 10K-100K (optimal) | Follower score = 20 | ⬜ |
| Engagement >= 5% | Engagement score = 30 | ⬜ |
| View ratio >= 0.5 | View score = 20 | ⬜ |
| Conversion >= 3% | Conversion score = 15 | ⬜ |
| Full niche relevance | Niche score = 15 | ⬜ |
| Perfect influencer | Total score = 100 | ⬜ |
| Sort whitelist enforced | Invalid sort field rejected | ⬜ |
| Tier classification correct | nano/micro/mid/macro boundaries | ⬜ |
| CPP estimates by tier | Nano $20-100, Micro $100-500, etc. | ⬜ |

---

## NEW PHASE 18: Known Bugs Verification

| Bug | Description | Status |
|-----|-------------|--------|
| BUG-005 | Scan cancel: client sends jobId as query param, backend expects body | ⬜ |
| BUG-022 | Table name mismatch: code says 'scans', migration creates 'scan_history' | ⬜ |

---

## Defect Classification (Unchanged from Original)

| Severity | Definition | SLA |
|----------|------------|-----|
| CRITICAL | System down, data loss, security breach | Immediate |
| HIGH | Major feature broken, no workaround | 24h |
| MEDIUM | Feature impaired, workaround exists | Sprint |
| LOW | Minor/cosmetic | Backlog |

---

## Bug Report Template (Unchanged from Original)

```markdown
## Bug Report

**ID:** BUG-YOUSELL-XXX
**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Component:** [Component name]
**Reported By:** [Team Member]
**Date:** YYYY-MM-DD

### Summary
### Steps to Reproduce
### Expected Behavior
### Actual Behavior
### Environment
### Logs/Screenshots
### Root Cause Analysis
### Suggested Fix
```
