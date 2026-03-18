# YOUSELL PLATFORM — FULL BUSINESS LOGIC AUDIT REPORT
**Date:** 2026-03-18
**Auditor:** Claude QA Engineer
**Spec Reference:** YouSell_Platform_Technical_Specification_v8.md
**Codebase:** yousell-admin (commit 34a85a4)

---

## PART 1 — BUSINESS LOGIC VERIFICATION

### 1.1 Three-Pillar Scoring System

**Spec Requirement (Section 2.0):**
```
final_score = (trend_score × 0.40) + (viral_score × 0.35) + (profit_score × 0.25)
```
Output range: 0–100. Tier classification: HOT >= 80, WARM >= 60, WATCH >= 40, COLD < 40.

**Code Reality:**
- Frontend: `src/lib/scoring/composite.ts` (lines 134-141) — Formula matches exactly
- Backend: `backend/src/lib/scoring.ts` (lines 92-109) — Formula matches exactly
- Tier classification: `getTierFromScore()` matches spec in both files
- Trend sub-score inputs: tiktokGrowth, influencerActivity, amazonDemand, competition, profitMargin — MATCH
- Viral sub-score inputs: 6 pre-viral signals (microInfluencerConvergence, commentPurchaseIntent, hashtagAcceleration, creatorNicheExpansion, engagementVelocity, supplySideResponse) — MATCH
- Profit sub-score inputs: profitMargin, shippingFeasibility, marketingEfficiency, supplierReliability, operationalRisk — MATCH

**Status:** MATCH

---

### 1.2 POD-Specific Modifiers

**Spec Requirement (Section 2.2.1):**
POD products must have adjusted scoring:
- Trend: +design trend velocity, +seasonal relevance, −niche saturation
- Viral: +social aesthetic appeal, +influencer adoption, +UGC potential
- Profit: +must exceed 30% margin, +fulfillment partner price comparison, −high base cost penalty

**Code Reality:**
No POD-specific modifier functions exist anywhere in `src/lib/scoring/`, `backend/src/lib/scoring.ts`, or any other file. Zero implementation.

**Status:** NOT_IMPLEMENTED

---

### 1.3 Fulfillment Recommendation Logic

**Spec Requirement (Section 2.4):**
Decision tree based on product attributes and price thresholds:
- Physical + < $30 → DROPSHIP
- Physical + $30–100 + high demand → WHOLESALE
- Physical + > $100 → WHOLESALE ONLY
- Custom design/apparel → POD
- Template/course/tool → DIGITAL
- SaaS/subscription → AFFILIATE
- Unknown → Flag for admin review

Platform-specific constraints: TikTok Shop requires US-based fulfillment, Amazon FBA requires wholesale, etc.

**Code Reality:**
No fulfillment recommendation engine exists. No decision tree, no price thresholds, no platform constraint enforcement. The `products` table has a `fulfillment_type` column but it is never populated by automated logic.

**Status:** NOT_IMPLEMENTED

---

### 1.4 Pricing Tier Enforcement

**Spec Requirement (Section 3.2):**

| Tier | Price | Channels | Products/Platform | Content Credits |
|------|-------|----------|-------------------|-----------------|
| Starter | $29/mo | 1 | 3 | 50 |
| Growth | $59/mo | 2 | 10 | 200 |
| Professional | $99/mo | 3 | 25 | 500 |
| Enterprise | $149/mo | All | 50 | Unlimited |

Free tier: read-only, 1 platform, 5 products/week.

**Code Reality:**
- `src/lib/stripe.ts` (lines 19-48): Tier definitions exist BUT with WRONG PRICES:
  - Starter: $29 (spec: $29) ✓
  - Growth: $79 (spec: $59) ✗
  - Professional: $149 (spec: $99) ✗
  - Enterprise: $299 (spec: $149) ✗
- `src/app/pricing/page.tsx` (lines 5-71): Display prices ALSO WRONG:
  - Growth: $79 (spec: $59) ✗
  - Professional: $149 (spec: $99) ✗
  - Enterprise: $299 (spec: $149) ✗
- Channel limits in stripe.ts: Growth=3 (spec: 2) ✗, Professional=5 (spec: 3) ✗
- Content credits per tier: NOT DEFINED in code at all
- Free tier: NOT IMPLEMENTED (no read-only mode, no 5 products/week limit)
- Feature gating: `authenticateClient()` checks subscription existence but does NOT enforce per-tier engine access

**Status:** MISMATCH
**File + Line:** `src/lib/stripe.ts:19-48`, `src/app/pricing/page.tsx:5-71`

---

### 1.5 Content Credits System

**Spec Requirement:**
Credit costs: caption=1, ad=1, blog=3, image=2, carousel=5, short video=5, long video=8, email sequence=3.
Credits deducted on each content generation. Per-tier allocations: 50/200/500/Unlimited.

**Code Reality:**
- No `content_credits` table exists in migrations (only defined in v8 spec)
- No credit cost constants defined anywhere in the codebase
- No credit deduction logic in `src/app/api/dashboard/content/generate/route.ts`
- Content generation route tracks usage in `usage_tracking` table (count=1 per generation) but does NOT enforce credit limits
- No credit balance checking before content generation

**Status:** NOT_IMPLEMENTED

---

### 1.6 Product Allocation System

**Spec Requirement:**
Client scoping via `product_allocations.visible_to_client`. RLS enforced on every client-facing query.

**Code Reality:**
- Admin allocation API: `src/app/api/admin/allocations/route.ts` — creates allocations with `visible_to_client` field
- Client product API: `src/app/api/dashboard/products/route.ts` — filters by `client_id` AND `visible_to_client = true`
- RLS policy in `supabase/migrations/005_complete_schema.sql` — clients can view own allocations where `visible_to_client = true`
- Index added in migration 022 for `visible_to_client` filter

**Status:** MATCH

---

### 1.7 Automation Levels

**Spec Requirement (Section 6A):**
3 levels: Manual (Level 1), Assisted (Level 2), Auto-Pilot (Level 3).
5 per-feature settings: Product Upload, Content Creation, Content Publishing, Influencer Outreach, Product Discovery.
5 hard guardrails: daily spend cap, content volume cap, product upload cap, outreach cap, pause on error.

**Code Reality:**
- No `client_automation_config` table in any migration
- The word "automation" appears only in `automation_jobs` table (disabled by default) — this is for backend job scheduling, NOT per-feature client automation levels
- No per-feature automation settings anywhere in code
- No hard guardrails (spend cap, volume cap, etc.) implemented
- No "Big Red Button" pause mechanism
- Only reference to automation levels is in the pricing page display text ("Full Automation" highlight)

**Status:** NOT_IMPLEMENTED

---

## PART 2 — ARCHITECTURE FLOW VERIFICATION

### Flow A — Product Discovery

**Spec:** Scraper trigger → BullMQ queue → worker → Supabase storage → admin dashboard display

**Code Reality:**
1. Frontend triggers scan via `POST /api/admin/scan/route.ts` (calls `runLiveDiscoveryScan()`)
2. Discovery engine (`src/lib/engines/discovery.ts`) calls providers (Apify, RapidAPI)
3. Products scored via `src/lib/scoring/composite.ts`
4. Products stored in Supabase `products` table via admin client
5. Admin dashboard displays via `GET /api/admin/products/route.ts`

**NOTE:** The scan runs inline in the API route (not via BullMQ for frontend-triggered scans). Backend BullMQ queues (`product-scan`, `trend-scan`, etc.) exist but are triggered separately via the Express API.

**Status:** MATCH (functional, with architectural note about inline vs queue execution)

---

### Flow B — Client Allocation

**Spec:** Admin selects product → allocation created → client sees product → RLS enforced

**Code Reality:**
1. Admin creates allocation via `POST /api/admin/allocations/route.ts`
2. Inserts to `product_allocations` with `client_id` and `visible_to_client`
3. Client queries via `GET /api/dashboard/products/route.ts` — filtered by `client_id` + `visible_to_client = true`
4. RLS policy enforced at DB level (migration 005)

**Status:** MATCH

---

### Flow C — Content Generation

**Spec:** Product selected → content type chosen → credits deducted → content created → ready for publishing

**Code Reality:**
1. Client requests content via `POST /api/dashboard/content/generate/route.ts`
2. Plan tier checked (Growth or higher required)
3. Content generated via Claude Haiku API
4. Stored in `content_queue` table with status='generated'
5. **MISSING:** Credit deduction step — usage tracked but credits NOT deducted or enforced

**Status:** PARTIAL
**File + Line:** `src/app/api/dashboard/content/generate/route.ts:75-154`

---

### Flow D — Influencer Outreach

**Spec:** Influencer matched → outreach drafted → one-click send → email dispatched via Resend

**Code Reality:**
1. Admin triggers invite via `POST /api/admin/influencers/invite/route.ts`
2. Email personalized via Claude Haiku (with template fallback)
3. Draft inserted to `outreach_emails` table
4. Email sent via Resend API
5. Status updated to 'sent' with timestamp

**Status:** MATCH

---

### Flow E — Store Integration

**Spec:** Product approved → pushed to Shopify/TikTok store → sync tracked in `shop_products` table

**Code Reality:**
- Channel connection framework exists (`connected_channels` table, OAuth callback routes)
- `shop_products` table does NOT exist in any migration
- No BullMQ queues for store push (`push-to-shopify`, `push-to-tiktok`, `push-to-amazon` all missing)
- No product sync workers implemented
- Shopify webhook route exists but only for incoming events, not outbound product push

**Status:** NOT_IMPLEMENTED

---

## PART 3 — CRITICAL BUG CHECK

### BUG-001: Admin Layout Renders for ANY Authenticated User

**Spec:** Layout component must check role before rendering admin UI.

**Code Reality:**
- `src/app/admin/layout.tsx` (line 23): Checks `user.role !== 'admin' && user.role !== 'super_admin'` — returns minimal layout without sidebar for non-admin users
- `src/middleware.ts` (lines 46-56): Calls `check_user_role()` RPC and redirects non-admin users to `/admin/unauthorized`
- Double defense: layout check + middleware check

**Status:** FIXED

---

### BUG-016: Express Backend Has Zero RBAC

**Spec:** Every backend route must enforce role-based access.

**Code Reality:**
- `backend/src/index.ts` (lines 71-134): Global auth middleware + `requireAdmin()` middleware
- All 22+ routes use `scanLimiter, requireAdmin` pattern
- Token validated via `supabase.auth.getUser(token)`
- Role checked via service-role query to `profiles` table

**Status:** FIXED

---

### BUG-035: Clients Table RLS Blocks All Client Queries

**Spec:** Clients must be able to read their own profile.

**Code Reality:**
- `supabase/migrations/022_super_admin_and_rls_fixes.sql` (lines 23-52): Added self-read and self-update policies
- Policy joins `profiles.email` to `clients.email` via `auth.uid()` to scope access

**Status:** FIXED

---

### NEW Issues Found

**BUG-N1: Scoring code duplicated between frontend and backend**
- Frontend: `src/lib/scoring/composite.ts`
- Backend: `backend/src/lib/scoring.ts`
- Risk: Scores could diverge if one is updated but not the other (spec BUG-036 calls this out)

**BUG-N2: Legacy `calculateCompositeScore()` in composite.ts uses different weighting path**
- Lines 10-67 in `src/lib/scoring/composite.ts` has a legacy function alongside the correct 3-pillar functions
- Spec BUG-035 (composite.ts): Legacy 60/40 weighting still present

**BUG-N3: `sortBy` query param not whitelisted (spec BUG-045)**
- Products API allows arbitrary column sorting via unvalidated `sortBy` parameter
- SQL injection risk via Supabase `.order()` method

---

## PART 4 — QUEUE COVERAGE CHECK

### Spec Defines 23 BullMQ Queues. Codebase Implements 15.

| # | Spec Queue Name | Code Queue Name | Status |
|---|---|---|---|
| 1 | `scan-queue` | `product-scan` | IMPLEMENTED (renamed) |
| 2 | `transform-queue` | — | NOT_IMPLEMENTED |
| 3 | `scoring-queue` | — | NOT_IMPLEMENTED |
| 4 | `content-queue` | — | NOT_IMPLEMENTED |
| 5 | `distribution-queue` | — | NOT_IMPLEMENTED |
| 6 | `order-tracking-queue` | — | NOT_IMPLEMENTED |
| 7 | `influencer-outreach` | `influencer-discovery` | PARTIAL (discovery only, no outreach) |
| 8 | `financial-model` | — | NOT_IMPLEMENTED |
| 9 | `blueprint-queue` | — | NOT_IMPLEMENTED |
| 10 | `notification-queue` | — | NOT_IMPLEMENTED |
| 11 | `supplier-refresh` | `supplier-discovery` | PARTIAL (discovery only, no refresh) |
| 12 | `influencer-refresh` | — | NOT_IMPLEMENTED |
| 13 | `affiliate-refresh` | — | NOT_IMPLEMENTED |
| 14 | `client-scan` | `enrich-product` | PARTIAL (enrich, not client-scoped scan) |
| 15 | `trend-scout` | `trend-scan` + `trend-detection` | IMPLEMENTED (split into 2) |
| 16 | `pod-discovery` | — | NOT_IMPLEMENTED |
| 17 | `pod-provision` | — | NOT_IMPLEMENTED |
| 18 | `pod-fulfillment-sync` | — | NOT_IMPLEMENTED |
| 19 | `push-to-shopify` | `shopify-intelligence` | PARTIAL (scrape, not push) |
| 20 | `push-to-tiktok` | `tiktok-discovery` + 3 sub-queues | PARTIAL (discovery, not push) |
| 21 | `push-to-amazon` | `amazon-intelligence` | PARTIAL (scrape, not push) |
| 22 | `affiliate-content-generate` | — | NOT_IMPLEMENTED |
| 23 | `affiliate-commission-track` | — | NOT_IMPLEMENTED |

**Additional queues in code but NOT in spec:**
- `tiktok-product-extract` — sub-queue of TikTok discovery
- `tiktok-engagement-analysis` — sub-queue of TikTok discovery
- `tiktok-cross-match` — sub-queue of TikTok discovery
- `product-clustering` — product similarity clustering
- `creator-matching` — creator-product matching
- `ad-intelligence` — ad campaign discovery

**Gap Count: 15 of 23 spec queues implemented (some under different names/scope)**

**True functional coverage: ~8 of 23 fully match spec intent. Remainder are partial or misaligned.**

---

## PART 5 — DATA SOURCE MODULE STATUS

| Source | Spec Requirement | Implementing File | Status |
|---|---|---|---|
| **TikTok — Apify** | Primary scraper | `src/lib/providers/tiktok/index.ts` | IMPLEMENTED |
| **TikTok — ScrapeCreators** | Secondary scraper | — | NOT_IMPLEMENTED |
| **TikTok — Creative Center** | Trend data | — | NOT_IMPLEMENTED |
| **TikTok — Research API** | Official API | — (pending approval) | NOT_IMPLEMENTED |
| **Amazon — RapidAPI** | Primary scraper | `src/lib/providers/amazon/index.ts` | IMPLEMENTED |
| **Amazon — Apify BSR** | BSR scraper | `src/lib/providers/amazon/index.ts` | IMPLEMENTED |
| **Amazon — PA-API** | Official API | — (pending approval) | NOT_IMPLEMENTED |
| **Shopify — Apify Scraper** | Store scraper | `src/lib/providers/shopify/index.ts` | IMPLEMENTED |
| **Pinterest — Apify** | Pin scraper | `src/lib/providers/pinterest/index.ts` | IMPLEMENTED |
| **Pinterest — Pinterest API** | Official API | — (fallback stub) | PARTIAL |
| **Digital — Gumroad** | Product scraper | `src/lib/providers/digital/index.ts` | IMPLEMENTED |
| **Digital — ClickBank** | Affiliate marketplace | — | NOT_IMPLEMENTED |
| **Digital — ShareASale** | Affiliate network | — | NOT_IMPLEMENTED |
| **Digital — Udemy** | Course marketplace | — | NOT_IMPLEMENTED |
| **Digital — AppSumo** | SaaS deals | — | NOT_IMPLEMENTED |
| **AI Affiliate — Dynamic** | Live discovery | — | NOT_IMPLEMENTED |
| **AI Affiliate — Hardcoded** | Seeded list | `src/lib/providers/affiliate/index.ts` | IMPLEMENTED (10 programs) |
| **Physical Affiliate — Dynamic** | Live discovery | — | NOT_IMPLEMENTED |
| **Physical Affiliate — Hardcoded** | Seeded list | `src/lib/providers/affiliate/index.ts` | IMPLEMENTED (5 programs) |

**Coverage: 8 of 19 data sources fully implemented. 1 partial. 10 missing.**

---

## SUMMARY TABLE

| # | Check | Status | Severity |
|---|---|---|---|
| 1.1 | 3-Pillar Scoring System | MATCH | — |
| 1.2 | POD-Specific Modifiers | NOT_IMPLEMENTED | HIGH |
| 1.3 | Fulfillment Recommendation Logic | NOT_IMPLEMENTED | HIGH |
| 1.4 | Pricing Tier Enforcement | MISMATCH | HIGH |
| 1.5 | Content Credits System | NOT_IMPLEMENTED | HIGH |
| 1.6 | Product Allocation System | MATCH | — |
| 1.7 | Automation Levels | NOT_IMPLEMENTED | HIGH |
| A | Flow: Product Discovery | MATCH | — |
| B | Flow: Client Allocation | MATCH | — |
| C | Flow: Content Generation | PARTIAL | MEDIUM |
| D | Flow: Influencer Outreach | MATCH | — |
| E | Flow: Store Integration | NOT_IMPLEMENTED | HIGH |
| BUG-001 | Admin layout RBAC | FIXED | — |
| BUG-016 | Express backend RBAC | FIXED | — |
| BUG-035 | Clients table RLS | FIXED | — |
| BUG-N1 | Scoring code duplication | MISMATCH | MEDIUM |
| BUG-N2 | Legacy scoring function | MISMATCH | MEDIUM |
| BUG-N3 | sortBy not whitelisted | MISMATCH | MEDIUM |
| QUEUES | BullMQ Queue Coverage | PARTIAL (15/23) | HIGH |
| DATA | Data Source Coverage | PARTIAL (8/19) | MEDIUM |

### Severity Distribution
- **HIGH:** 7 items (POD modifiers, fulfillment logic, pricing mismatch, content credits, automation levels, store integration, queue gaps)
- **MEDIUM:** 5 items (content generation credits, scoring duplication, legacy scoring, sortBy injection, data source gaps)
- **LOW:** 0 items
- **FIXED/MATCH:** 8 items

---

*END OF AUDIT REPORT — No fixes applied. Awaiting instructions.*
