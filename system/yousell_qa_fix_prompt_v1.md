# YOUSELL Platform — QA Fix Execution Prompt v1

## PURPOSE

This prompt addresses all 31 gaps identified across 5 user journeys
(system_health_summary.md + flow_trace_report.md) without touching
anything that currently works.

**System readiness before this prompt: 0/5 journeys fully operational**
**Target after this prompt: 5/5 journeys operational (with mock/sandbox externals)**

---

## GOLDEN RULES — READ BEFORE EVERY STEP

```
1. NEVER modify files that are working — only add new files or edit stubs
2. NEVER change scoring logic (composite.ts, pod-modifiers.ts, fulfillment.ts)
3. NEVER change the engine architecture (event-bus, registry, types)
4. NEVER change existing API routes that return data correctly
5. NEVER change database RLS policies that are already enforced
6. NEVER change Stripe webhook handling that already works
7. Every new file must compile: run `npx tsc --noEmit` after each batch
8. Every new migration must be additive (CREATE TABLE, ALTER TABLE ADD COLUMN)
9. All external API calls must be behind feature flags (disabled by default)
10. Stub processors are the ONLY files you replace — everything else is additive
```

---

## PRE-FLIGHT CHECK (Run before starting)

```bash
# Verify current state is clean
npx tsc --noEmit          # Must show 0 errors
npm run build             # Must succeed
git status                # Must be clean (no uncommitted changes)
```

If any of these fail, FIX THEM FIRST before proceeding. Do not start
fix execution on a broken baseline.

---

## PHASE 1 — DATABASE FOUNDATION (4 missing tables)

**Why first:** Every journey gap depends on tables that don't exist yet.
Nothing breaks because these are purely additive CREATE TABLE statements.

### Step 1.1 — Create migration: `shop_products` table

**Fixes:** Journey 1, Step 10 (no way to track pushed products)

```sql
-- File: supabase/migrations/025_shop_products.sql

CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('shopify', 'tiktok', 'amazon')),
  external_product_id TEXT,          -- ID in the external platform
  external_url TEXT,                 -- Link to product on external platform
  push_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (push_status IN ('pending', 'pushing', 'live', 'failed', 'delisted')),
  pushed_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shop_products_client ON shop_products(client_id);
CREATE INDEX idx_shop_products_product ON shop_products(product_id);
CREATE INDEX idx_shop_products_channel ON shop_products(channel);

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all shop products"
  ON shop_products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Clients see own shop products"
  ON shop_products FOR SELECT
  USING (client_id = auth.uid());
```

**Verify:** Migration file exists, SQL is valid, no existing tables touched.

### Step 1.2 — Create migration: `affiliate_commissions` + `affiliate_referrals` tables

**Fixes:** Journey 3, Steps 1-8 (entire affiliate journey missing)

```sql
-- File: supabase/migrations/026_affiliate_system.sql

-- Referral tracking
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_client_id UUID NOT NULL REFERENCES clients(id),
  referred_user_id UUID,             -- NULL until they sign up
  referred_email TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'signed_up', 'subscribed', 'expired')),
  signed_up_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON affiliate_referrals(referrer_client_id);
CREATE INDEX idx_referrals_code ON affiliate_referrals(referral_code);

-- Commission records
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES affiliate_referrals(id),
  referrer_client_id UUID NOT NULL REFERENCES clients(id),
  subscription_id UUID REFERENCES subscriptions(id),
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.20,  -- 20% default
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_referrer ON affiliate_commissions(referrer_client_id);
CREATE INDEX idx_commissions_status ON affiliate_commissions(status);

-- Add referral_code column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all referrals"
  ON affiliate_referrals FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Clients see own referrals"
  ON affiliate_referrals FOR SELECT
  USING (referrer_client_id = auth.uid());

CREATE POLICY "Admins manage all commissions"
  ON affiliate_commissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Clients see own commissions"
  ON affiliate_commissions FOR SELECT
  USING (referrer_client_id = auth.uid());
```

**Verify:** Both tables created, RLS enforced, clients.referral_code added.

### Step 1.3 — Create migration: `notifications` table

**Fixes:** Journey 4, Step 7 (notification queue has no table to write to)

```sql
-- File: supabase/migrations/027_notifications.sql

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info'
    CHECK (type IN ('info', 'success', 'warning', 'error', 'action_required')),
  category TEXT NOT NULL DEFAULT 'system'
    CHECK (category IN ('system', 'product', 'content', 'order', 'affiliate', 'outreach')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,                    -- Optional deep link
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users mark own notifications read"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);
```

**Verify:** Table created, RLS scoped to user_id.

### GATE 1 — Database checkpoint

```
Before proceeding, verify:
[ ] 3 new migration files created (025, 026, 027)
[ ] No existing migration files modified
[ ] SQL syntax is valid (no typos in CHECK constraints)
[ ] All foreign keys reference existing tables
[ ] npx tsc --noEmit still passes (migrations don't affect TS)
[ ] Commit: "feat(db): add shop_products, affiliate, and notifications tables"
```

**STOP — ASK USER: "Phase 1 complete — 4 missing tables added. Ready for Phase 2 (Journey 1 — Shopify push)?"**

---

## PHASE 2 — JOURNEY 1 FIX: Admin Deploy (Shopify Push)

**Current status:** Steps 1-8 work. Steps 9-10 broken.
**Goal:** Complete the product push flow without touching Steps 1-8.

### Step 2.1 — Create Shopify push API route

**Fixes:** "No push endpoint" gap

Create: `src/app/api/admin/products/push/route.ts`

This endpoint should:
1. Accept POST with `{ product_id, client_id, channel: 'shopify' }`
2. Validate that the product exists and is allocated to the client
3. Check that the client has a connected Shopify channel (query `connected_channels`)
4. Insert a record into `shop_products` with status `pending`
5. If BullMQ is available, enqueue a `push-to-shopify` job
6. If not, return the pending record (manual push for now)
7. Return the `shop_products` record

**Safety:** This is a NEW file. Nothing existing is modified.

### Step 2.2 — Implement `push-to-shopify` queue processor

**Fixes:** "Stub worker" gap

Replace the stub in `backend/src/jobs/stub-workers.ts` for `processPushToShopify`
with a real processor in a NEW file: `backend/src/jobs/push-to-shopify.ts`

The processor should:
1. Read the job data (product_id, client_id, channel_config)
2. Fetch the product from Supabase
3. Fetch the client's Shopify credentials from `connected_channels`
4. **FEATURE FLAG CHECK:** Read `platform_config` for `shopify_push_enabled`
   - If disabled: update `shop_products` status to `pending` with note "Push disabled — awaiting API credentials"
   - If enabled: call Shopify Admin API to create product
5. On success: update `shop_products` with external_product_id, external_url, status `live`
6. On failure: update `shop_products` status to `failed` with sync_error

**Safety:** Stub is replaced with real logic. Feature flag means it won't
call Shopify until credentials are configured. Register in `backend/src/jobs/index.ts`.

### Step 2.3 — Add push status to admin products page

**Fixes:** "Push tracked in shop_products" gap

Modify `src/app/admin/products/page.tsx` to:
1. After loading products, also fetch `shop_products` for those product IDs
2. Show a "Push Status" column or badge (pending/live/failed/not pushed)
3. Add a "Push to Store" button that calls the new API route from Step 2.1

**Safety:** Additive UI change only — existing product display logic untouched.

### GATE 2 — Journey 1 checkpoint

```
Before proceeding, verify:
[ ] New API route compiles and handles POST correctly
[ ] Push processor replaces stub and is registered
[ ] Admin products page shows push status
[ ] npx tsc --noEmit passes
[ ] Existing product display, scoring, allocation still work
[ ] Commit: "feat(j1): shopify push endpoint, processor, and admin UI"
```

**STOP — ASK USER: "Journey 1 gaps fixed (Shopify push flow). Ready for Phase 3 (Journey 2 — Content scheduling)?"**

---

## PHASE 3 — JOURNEY 2 FIX: Client Platform (Content Scheduling + Distribution)

**Current status:** Steps 1-2, 4-5, 7-9 work. Steps 3, 6, 10-11 broken/partial.
**Goal:** Add product detail page, content scheduling, and distribution stub.

### Step 3.1 — Create product detail page

**Fixes:** "No product detail page" gap

Create: `src/app/dashboard/products/[id]/page.tsx`

This page should:
1. Fetch product by ID from `/api/dashboard/products` (add ID filter support)
2. Show full product details (title, description, scores, images, source URL)
3. Show allocated content from `content_queue` for this product
4. Show push status from `shop_products` if any
5. Link to "Generate Content" action

**Safety:** New file. The existing products list page is not modified.
Add a GET parameter handler to the existing dashboard products API route
to support `?id=<product_id>` filtering.

### Step 3.2 — Create content scheduling endpoint

**Fixes:** "No scheduling endpoint" gap

Create: `src/app/api/dashboard/content/schedule/route.ts`

This endpoint should:
1. Accept POST with `{ content_id, scheduled_at, channels: ['shopify', 'tiktok'] }`
2. Validate the content exists in `content_queue` and belongs to the client
3. Update `content_queue` record with `scheduled_at` and `target_channels`
4. If BullMQ available, enqueue a delayed `distribution-queue` job
5. Return the updated content record

**Safety:** New file. Existing content generation logic untouched.

### Step 3.3 — Implement `content-queue` processor (replace stub)

**Fixes:** "Content generated inline" gap (partial — makes async path available)

Create: `backend/src/jobs/content-generation.ts`

The processor should:
1. Read job data (product_id, client_id, content_type)
2. Fetch product details from Supabase
3. Call Anthropic Claude Haiku API to generate content (same logic as the
   existing inline generation in `/api/dashboard/content/generate/route.ts`)
4. Insert result into `content_queue` with status `generated`
5. Deduct credits from `content_credits`

**Safety:** This provides an async alternative path. The existing sync
generation route continues to work. Register in `backend/src/jobs/index.ts`.

### Step 3.4 — Implement `distribution-queue` processor (replace stub)

**Fixes:** "No Ayrshare integration" gap (with feature flag)

Create: `backend/src/jobs/distribution.ts`

The processor should:
1. Read job data (content_id, target_channels, scheduled_at)
2. Fetch the content from `content_queue`
3. **FEATURE FLAG CHECK:** Read `platform_config` for each channel:
   - `ayrshare_enabled` — if true, call Ayrshare API to publish
   - `shopify_content_push_enabled` — if true, push to Shopify blog/page
4. If no channels enabled: update content status to `scheduled` (waiting for config)
5. If channels enabled: attempt publish, update status to `published` or `failed`

**Safety:** Feature flags prevent any external calls until configured.
Register in `backend/src/jobs/index.ts`.

### GATE 3 — Journey 2 checkpoint

```
Before proceeding, verify:
[ ] Product detail page renders correctly
[ ] Content scheduling endpoint works
[ ] Content queue processor replaces stub
[ ] Distribution processor replaces stub (feature-flagged)
[ ] npx tsc --noEmit passes
[ ] Existing content generation still works (sync route untouched)
[ ] Commit: "feat(j2): product detail, content scheduling, distribution processor"
```

**STOP — ASK USER: "Journey 2 gaps fixed. Ready for Phase 4 (Journey 3 — Affiliate system)?"**

---

## PHASE 4 — JOURNEY 3 FIX: Affiliate Commission System

**Current status:** Only Stripe subscription works (Step 3). Everything else missing.
**Goal:** Build the complete referral → commission pipeline.

### Step 4.1 — Create referral link generation

**Fixes:** "No referral link generation" gap

**4.1a** — API route: `src/app/api/dashboard/affiliate/referral/route.ts`
- GET: Return client's referral code (generate one if not exists)
- The referral code should be a short unique string (e.g., nanoid 8 chars)
- Update `clients.referral_code` on first generation

**4.1b** — Client dashboard page: `src/app/dashboard/affiliate/page.tsx`
- Show referral link: `https://yousell.online/signup?ref=<code>`
- Show referral stats (count of sign-ups, conversions, earnings)
- Show commission history table from `affiliate_commissions`

**Safety:** All new files. No existing routes modified.

### Step 4.2 — Capture referral on signup

**Fixes:** "Middleware doesn't capture ref param" + "Signup flow ignores referral" gaps

**4.2a** — Modify `src/app/signup/page.tsx`:
- Read `ref` query parameter from URL
- Store it in a hidden field or localStorage
- Pass it to the signup API call as metadata

**4.2b** — Modify signup flow to save referral:
- After successful signup, if `ref` param exists:
  - Look up `affiliate_referrals` by referral_code
  - If not found, create a new `affiliate_referrals` record
  - Update the record with `referred_user_id` and `status: 'signed_up'`

**Safety:** Minimal modification to signup page — only adding ref capture.
Existing signup logic (Supabase Auth) is untouched.

### Step 4.3 — Wire Stripe webhook for commission tracking

**Fixes:** "Stripe checkout metadata missing referrer_id" + "No commission calculation" gaps

**4.3a** — Modify `src/app/api/dashboard/subscription/route.ts`:
- When creating a Stripe checkout session, include `referrer_code` in metadata
  (read from the client's session or localStorage)

**4.3b** — Modify `src/app/api/webhooks/stripe/route.ts`:
- In the `checkout.session.completed` handler, after updating subscription:
  - Check if `metadata.referrer_code` exists
  - If yes, look up the referral record
  - Update referral status to `subscribed`
  - Calculate commission: `subscription_amount * 0.20` (20% recurring)
  - Insert into `affiliate_commissions`

**Safety:** Small additions to existing webhook handler. The existing
subscription update logic is not modified — commission calculation is
appended after it.

### Step 4.4 — Implement `affiliate-commission-track` processor

**Fixes:** "affiliate-commission-track is stub" gap

Create: `backend/src/jobs/affiliate-commission.ts`

The processor should:
1. Run on a schedule (daily or on Stripe webhook trigger)
2. Query `affiliate_referrals` with status `subscribed`
3. For each active referral, check if a commission for the current period exists
4. If not, calculate and insert commission record
5. Update totals

Register in `backend/src/jobs/index.ts`.

### Step 4.5 — Admin affiliate dashboard

**Fixes:** "No admin commission view" gap

Create: `src/app/admin/affiliates/commissions/page.tsx`
- Show all commissions across all clients
- Filter by status (pending, approved, paid)
- Show total payable amount
- Action buttons: approve, reject, mark paid

**Safety:** New page. Existing admin affiliates page untouched.

### GATE 4 — Journey 3 checkpoint

```
Before proceeding, verify:
[ ] Referral code generation works
[ ] Signup captures ref parameter
[ ] Stripe webhook creates commission records
[ ] Affiliate processor replaces stub
[ ] Client affiliate dashboard shows earnings
[ ] Admin sees all commissions
[ ] npx tsc --noEmit passes
[ ] Existing Stripe flow (checkout, portal, webhooks) still works
[ ] Commit: "feat(j3): complete affiliate referral and commission system"
```

**STOP — ASK USER: "Journey 3 fixed (affiliate system). Ready for Phase 5 (Journey 4 — POD)?"**

---

## PHASE 5 — JOURNEY 4 FIX: POD Product Launch

**Current status:** Scoring modifiers exist but disconnected. All integrations stubbed.
**Goal:** Wire POD modifiers into pipeline, build provisioning flow with feature flags.

### Step 5.1 — Wire POD modifiers into scoring pipeline

**Fixes:** "POD modifiers not wired" + "Fulfillment logic never triggered" gaps

Modify `src/lib/scoring/composite.ts` (CAREFULLY — this is working code):
- After calculating `final_score`, check if product type suggests POD
- If yes, call `calculatePodModifiers()` and apply adjustments
- Call `recommendFulfillment()` to set `fulfillment_method` on the product

**Safety:** This is a MODIFICATION of working code. Be extremely careful:
- Add the POD modifier call AFTER the existing score calculation
- Do NOT change the base scoring formula
- Add a guard: only apply if `product.category` matches POD categories
- Write a unit test that verifies base scoring still produces same results

### Step 5.2 — Implement POD discovery processor

**Fixes:** "No Etsy/Redbubble scrapers" gap (with feature flag)

Create: `backend/src/jobs/pod-discovery.ts`

The processor should:
1. Accept job data with target platforms (etsy, redbubble)
2. **FEATURE FLAG CHECK:** `pod_discovery_enabled` in `platform_config`
3. If enabled: use Apify actors to scrape trending POD products
4. If disabled: return mock/sample POD data for testing
5. Score discovered products using POD modifiers
6. Insert into `products` table with `source: 'pod'`

Register in `backend/src/jobs/index.ts`.

### Step 5.3 — Implement POD provisioning processor

**Fixes:** "No Printful/Printify/Gelato API clients" gap (with feature flag)

Create: `backend/src/jobs/pod-provision.ts`

The processor should:
1. Accept job data (product_id, pod_provider, design_config)
2. **FEATURE FLAG CHECK:** `pod_provision_enabled` in `platform_config`
3. If enabled: call POD provider API to create product
4. If disabled: update status to `awaiting_config` with helpful message
5. On success: create `shop_products` record with channel `shopify` + POD metadata

Register in `backend/src/jobs/index.ts`.

### Step 5.4 — Implement POD fulfillment sync processor

**Fixes:** "pod-fulfillment-sync is stub" gap

Create: `backend/src/jobs/pod-fulfillment-sync.ts`

The processor should:
1. Query `shop_products` where metadata contains POD provider info
2. **FEATURE FLAG CHECK:** `pod_sync_enabled`
3. If enabled: poll POD provider for order status updates
4. If disabled: log and skip
5. Update order tracking records

Register in `backend/src/jobs/index.ts`.

### Step 5.5 — Implement notification processor

**Fixes:** "notification-queue is stub" + "No notifications table" gap (table added in Phase 1)

Create: `backend/src/jobs/notification.ts`

The processor should:
1. Accept job data (user_id, title, message, type, category, action_url)
2. Insert into `notifications` table
3. Optionally send email via Resend for `action_required` type

Register in `backend/src/jobs/index.ts`.

### Step 5.6 — Admin POD management page

**Fixes:** "No admin POD UI" gap

Create: `src/app/admin/pod/page.tsx`
- Show POD products (filtered from products where fulfillment_method = 'pod')
- Show provisioning status per product
- Action buttons: discover, provision, sync
- Show connected POD providers from `connected_channels`

**Safety:** All new files.

### GATE 5 — Journey 4 checkpoint

```
Before proceeding, verify:
[ ] POD modifiers are wired into scoring (with guard clause)
[ ] Base scoring produces identical results for non-POD products
[ ] POD discovery processor replaces stub (feature-flagged)
[ ] POD provision processor replaces stub (feature-flagged)
[ ] POD fulfillment sync processor replaces stub (feature-flagged)
[ ] Notification processor replaces stub
[ ] Admin POD page renders
[ ] npx tsc --noEmit passes
[ ] Commit: "feat(j4): POD pipeline — discovery, provision, sync, notifications"
```

**STOP — ASK USER: "Journey 4 fixed (POD pipeline). Ready for Phase 6 (Journey 5 — Influencer pipeline)?"**

---

## PHASE 6 — JOURNEY 5 FIX: Influencer Outreach Pipeline

**Current status:** Discovery + matching + email sending work. Pipeline tracking broken.
**Goal:** Fix the feedback loop and status tracking without touching email sending.

### Step 6.1 — Fix duplicate scoring logic

**Fixes:** "Duplicate scoring logic" gap

Audit both:
- `backend/src/jobs/creator-matching.ts` (backend weights)
- `src/lib/engines/creator-matching.ts` (frontend weights)

Choose ONE as the source of truth (recommend backend job as canonical).
Make the frontend engine delegate to the same scoring function or import
shared weights from a common file.

Create: `src/lib/scoring/creator-weights.ts`
- Export the canonical weight configuration
- Both backend job and frontend engine import from here

**Safety:** Only changing WHERE weights are defined, not WHAT they are.
Verify that match scores are identical before and after.

### Step 6.2 — Add outreach status feedback loop

**Fixes:** "outreach_emails.status never reflected back" + "creator_product_matches.status never updated" gaps

**6.2a** — Modify `src/app/api/admin/influencers/invite/route.ts`:
- After successfully sending email and updating `outreach_emails`:
- Also UPDATE `creator_product_matches` SET `status = 'contacted'`
  WHERE product_id and influencer_id match

**6.2b** — Modify `src/app/admin/creator-matches/page.tsx`:
- Fetch `outreach_emails` status for each match
- Show status badge: suggested → contacted → responded → accepted/declined
- Add filter by status

**6.2c** — Modify `src/app/admin/influencers/page.tsx`:
- Show outreach history per influencer
- Display email status (sent, delivered, opened, bounced)

**Safety:** Small additions to existing pages. Email sending logic untouched.

### Step 6.3 — Add draft review before sending

**Fixes:** "No draft review UI" gap

Modify `src/app/admin/influencers/page.tsx` invite dialog:
- After AI generates the draft, show it in an editable textarea
- Add "Edit" and "Send" buttons (currently it sends immediately)
- Only send when user clicks "Send" after reviewing

**Safety:** UI-only change to the invite dialog. API route unchanged.

### Step 6.4 — Implement `influencer-outreach` processor

**Fixes:** "influencer-outreach queue is stub" gap

Create: `backend/src/jobs/influencer-outreach.ts`

The processor should:
1. Accept job data (influencer_id, product_id, email_draft, client_id)
2. Send email via Resend (same pattern as existing invite route)
3. Insert/update `outreach_emails` record
4. Update `creator_product_matches` status
5. Enqueue a notification for the admin

Register in `backend/src/jobs/index.ts`.

### Step 6.5 — Add Resend webhook for delivery tracking (optional but recommended)

**Fixes:** "No Resend webhook integration" gap

Create: `src/app/api/webhooks/resend/route.ts`
- Handle delivery, bounce, open, click events
- Update `outreach_emails` status field accordingly
- This is optional — skip if Resend webhook setup is not available

**Safety:** New file. No existing routes modified.

### GATE 6 — Journey 5 checkpoint

```
Before proceeding, verify:
[ ] Creator scoring uses single source of truth
[ ] Match scores are identical to before
[ ] Outreach status updates creator_product_matches
[ ] Creator matches page shows status badges
[ ] Draft review dialog works
[ ] Influencer outreach processor replaces stub
[ ] npx tsc --noEmit passes
[ ] Existing email sending still works
[ ] Commit: "feat(j5): influencer pipeline — status tracking, draft review, async outreach"
```

**STOP — ASK USER: "Journey 5 fixed. Ready for Phase 7 (cross-journey improvements)?"**

---

## PHASE 7 — CROSS-JOURNEY IMPROVEMENTS

These are improvements that benefit multiple journeys.

### Step 7.1 — Wire BullMQ into scan route (Journey 1, Step 2)

**Fixes:** "Scan route bypasses BullMQ" gap

Modify `src/app/api/admin/scan/route.ts`:
- Add an option: `{ async: true }` in the request body
- If async=true: enqueue `product-scan` job and return job ID
- If async=false (default): keep existing sync behavior

**Safety:** Default behavior unchanged. Async is opt-in.

### Step 7.2 — Add Stripe upgrade/downgrade sync

**Fixes:** "No upgrade/downgrade auto-sync of product limits" gap

Modify `src/app/api/webhooks/stripe/route.ts`:
- In `customer.subscription.updated` handler:
- Read the new plan from the subscription
- Update `subscriptions` table with new plan details
- Recalculate product allocation limits based on new plan
- Update `content_credits` allocation for the new billing period

**Safety:** Addition to existing webhook handler. Existing handlers untouched.

### Step 7.3 — Social channel OAuth foundation

**Fixes:** "connected_channels table never populated for social platforms" gap

Create: `src/app/api/dashboard/channels/connect/route.ts`
- Accept POST with `{ channel: 'shopify' | 'tiktok' | 'ayrshare', auth_code }`
- Exchange auth code for access token (channel-specific)
- Store encrypted token in `connected_channels`
- This is the foundation — actual OAuth flows are channel-specific and
  should be implemented per-channel as needed

**Safety:** New file. Existing connected_channels data untouched.

### GATE 7 — Final checkpoint

```
Before proceeding, verify:
[ ] Async scan option works (sync still default)
[ ] Stripe upgrade sync works
[ ] Channel connect endpoint exists
[ ] npx tsc --noEmit passes
[ ] npm run build succeeds
[ ] All existing functionality still works
[ ] Commit: "feat(cross): async scan, stripe sync, channel connect foundation"
```

---

## PHASE 8 — FINAL VERIFICATION

Run the complete verification suite:

```bash
# 1. TypeScript compilation
npx tsc --noEmit

# 2. Build
npm run build

# 3. Run existing tests
npm test

# 4. Verify no regressions in existing API routes
# (manual check or automated if test framework exists)
```

### Journey Readiness Re-Assessment

After all phases, re-trace each journey:

| Journey | Before | After | Notes |
|---------|--------|-------|-------|
| J1 — Admin Deploy | PARTIAL (4 gaps) | OPERATIONAL | Shopify push feature-flagged |
| J2 — Client Use | PARTIAL (5 gaps) | OPERATIONAL | Distribution feature-flagged |
| J3 — Affiliate | BROKEN (8 gaps) | OPERATIONAL | Full pipeline, 20% commission |
| J4 — POD Launch | BROKEN (7 gaps) | OPERATIONAL | All processors feature-flagged |
| J5 — Influencer | PARTIAL (7 gaps) | OPERATIONAL | Status tracking + draft review |

**Target: 5/5 journeys operational**

External integrations (Shopify write, Ayrshare, Printful, etc.) are behind
feature flags and will activate when API credentials are configured.
The journeys are "operational" meaning the full code path exists and handles
both the enabled and disabled states gracefully.

---

## SUMMARY — WHAT THIS PROMPT PRODUCES

| Phase | Files Created | Files Modified | Stubs Replaced |
|-------|-------------|----------------|----------------|
| 1 — Database | 3 migrations | 0 | 0 |
| 2 — J1 Shopify | 2 new files | 1 (admin products page) | 1 (push-to-shopify) |
| 3 — J2 Content | 3 new files | 1 (dashboard products API) | 2 (content-queue, distribution) |
| 4 — J3 Affiliate | 4 new files | 2 (signup, stripe webhook) | 1 (affiliate-commission) |
| 5 — J4 POD | 5 new files | 1 (composite.ts — carefully) | 4 (pod-*, notification) |
| 6 — J5 Influencer | 2 new files | 3 (invite route, 2 pages) | 1 (influencer-outreach) |
| 7 — Cross-journey | 1 new file | 2 (scan route, stripe webhook) | 0 |
| **Total** | **20 new files** | **10 modifications** | **9 stubs replaced** |

**Key safety measures:**
- All external API calls behind feature flags (disabled by default)
- All database changes are additive (no drops, no column removals)
- All existing working paths preserved (sync routes still work)
- Each phase independently committable and verifiable
- Approval gate after every phase

---

## HOW TO USE THIS PROMPT

1. **Copy Phase 1** into Claude Code and let it execute. Approve at the gate.
2. **Copy Phase 2** into Claude Code. Execute. Approve at the gate.
3. Continue sequentially through Phase 8.
4. After Phase 8, re-run the Phase 3 QA flow trace to verify 5/5 journeys.

**Do NOT run all phases at once.** The gates exist so you can verify
each journey works before moving to the next.

**If anything breaks:** Stop at the gate. The previous commit is your
safe rollback point. Fix the issue before proceeding.
