# YOUSELL QA Plan — Gap Analysis

**Date:** 2026-03-12
**Source:** `yousell-qa-master-prompt-12 march 10 am.md`
**Reviewed Against:** Actual codebase architecture

---

## CRITICAL GAPS (Must Fix Before QA Execution)

### GAP-01: Score Tier Thresholds Are WRONG

The QA plan states:
- HOT >= 75, WARM 50-74, COLD < 50

**Actual codebase** (`src/lib/scoring/composite.ts`, `backend/src/lib/scoring.ts`):
- HOT >= 80
- WARM >= 60
- WATCH >= 40 (completely missing from QA plan)
- COLD < 40

**Impact:** Every scoring test case would use wrong thresholds. WATCH tier is untested.

---

### GAP-02: Client Dashboard Entirely Missing

The QA plan has ZERO coverage of the client-facing dashboard:
- `/dashboard` — Client KPI cards, allocated products, request form
- `/dashboard/products` — Client's allocated product view
- `/dashboard/requests` — Product request history
- Client role-based access control
- Product visibility toggle (`visible_to_client`)
- Realtime Supabase subscriptions for client data

**Impact:** Half the user-facing application is untested.

---

### GAP-03: Product Allocation System Missing

No test coverage for:
- Allocating products to clients
- Plan-tier product limits (starter:3, growth:10, professional:25, enterprise:50)
- Allocation limit enforcement (400 error when exceeding)
- Allocation visibility toggling
- Quick-select allocation (top 5/10/25)
- `product_allocations` table integrity

**Impact:** Core business feature (client product delivery) untested.

---

### GAP-04: BullMQ Job Queue System Missing

No test coverage for:
- Worker concurrency (2 simultaneous jobs)
- Job progress polling (GET `/api/scan/:jobId`)
- Job cancellation flow
- Redis connection resilience
- Queue state management (waiting, delayed, active, completed, failed)
- Job retry behavior on failure

**Impact:** Background processing reliability untested.

---

### GAP-05: CSV Import Pipeline Missing

No test coverage for:
- CSV file upload and parsing (RFC 4180)
- Column mapping (fuzzy: title/name/product, price/cost, etc.)
- Excel file rejection
- Minimum header validation
- Partial import handling (status: success/partial/failed)
- `imported_files` audit logging

**Impact:** Bulk data ingestion untested.

---

### GAP-06: Financial Model & Auto-Rejection Rules Missing

No test coverage for the 8 auto-rejection rules:
1. Gross margin < 40%
2. Shipping > 30% of retail price
3. Break-even > 2 months
4. Fragile/hazardous without certification
5. No USA delivery < 15 days
6. IP/trademark risk detected
7. Retail price < $10
8. Market oversaturated (100+ competitors)

Also missing: financial model calculations (totalCost, grossMargin, breakEvenUnits)

**Impact:** Product quality gates untested.

---

### GAP-07: Blueprint Generation & PDF Export Missing

No test coverage for:
- Launch blueprint creation (positioning, pricing, video script, ad blueprint, timeline)
- Blueprint PDF rendering (`/api/admin/blueprints/[id]/pdf`)
- HTML escaping in PDF output (XSS prevention)
- AI-generated content (`generated_by: 'sonnet'`)

**Impact:** Key intelligence deliverable untested.

---

### GAP-08: Notification System Missing

No test coverage for:
- Notification creation and retrieval
- Read/unread state management
- Notification ownership validation (user_id check)
- Notification types

**Impact:** User communication channel untested.

---

### GAP-09: Automation Scheduler Missing

No test coverage for:
- Master kill switch functionality
- Individual job enable/disable
- `automation_jobs` table state management
- Job status tracking (disabled/enabled/running/completed/failed)

**Impact:** Automated scan scheduling untested.

---

### GAP-10: Email Rate Limiting Logic Missing

QA plan mentions email but misses:
- 3 emails/day rate limit enforcement
- Daily rate limit reset
- Hot product alert threshold (final_score >= 80)
- Scan completion alert content validation

**Impact:** Notification overload risk untested.

---

## MODERATE GAPS

### GAP-11: Provider Fallback Chain

No test for Apify -> RapidAPI -> Official API fallback patterns across providers.

### GAP-12: 24-Hour Caching Layer

No test for TTL-based cache in Supabase, cache hits vs misses, stale data.

### GAP-13: Influencer Conversion Score

100-point scoring algorithm with 5 components not validated:
- Follower tier (0-20), Engagement (0-30), View ratio (0-20), Conversion (0-15), Niche (0-15)

### GAP-14: Trend Keywords System

Keyword batch processing (groups of 5), trend direction classification, category management.

### GAP-15: Scan Mode Platform Weights

Quick mode (TikTok:40, Amazon:40, Trends:20) vs Full mode (all platforms 20% each) vs Client mode.

### GAP-16: Setup Wizard / Configuration

6-step verification flow (Supabase, Auth, AI, Email, Apify, API keys).

### GAP-17: OAuth Callback Flow

Auth callback route, code exchange, session establishment, error redirect.

### GAP-18: Supabase Realtime Subscriptions

Dashboard live updates, debounced re-renders (2s delay), subscription cleanup.

---

## INACCURACIES IN EXISTING QA PLAN

### INA-01: Systems Referenced But Not Built

The QA plan tests systems that **do not exist in the codebase**:
- Shopify Store Provisioner (no store creation code exists)
- Blotato API integration (not implemented)
- HeyGen Avatar Generation (not implemented)
- ElevenLabs Voice Synthesis (not implemented)
- VEO3 Video Generation (not implemented)
- Payment Gateway / Client Billing (not implemented)
- CJ Dropshipping Order Placement (only product sourcing exists)

**Recommendation:** Mark these as "Future Phase" and exclude from current QA execution.

### INA-02: Wrong Database Table Name

QA plan doesn't reference the known bug: `scans` table referenced in code but migration creates `scan_history`. This is Bug #22 in the codebase.

### INA-03: Known Bug #5 Not Covered

Scan cancellation sends `jobId` as query param but backend expects it in body.

---

## SUMMARY

| Category | Items Found |
|----------|-------------|
| Critical Gaps | 10 |
| Moderate Gaps | 8 |
| Inaccuracies | 3 |
| **Total Issues** | **21** |
