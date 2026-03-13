# YOUSELL Task Board

**Last Updated:** 2026-03-13
**Source of Truth:** `docs/YouSell_Platform_Technical_Specification_v7.md`

---

## Completed

- [x] Next.js 14 scaffold + Supabase auth + Express backend + BullMQ
- [x] 20 database tables with RLS
- [x] All 8 Apify providers across 7 channels
- [x] 3-pillar scoring engine + profitability engine
- [x] Influencer matching + supplier discovery + competitor intelligence
- [x] Financial modeling + launch blueprints + PDF export
- [x] Web dashboard with Realtime + CSV import
- [x] Full QA audit (S01–S25, 112 tasks, 41 bugs found)
- [x] Stack migration cost analysis

---

## Phase A — Fix CRITICAL + HIGH Bugs (1–2 days)

### CRITICAL (must fix immediately)

- [ ] Add admin role check to admin layout component (BUG-032)
- [ ] Add RBAC to Express backend — any user can currently trigger scans
- [ ] Fix `clients` table RLS — currently blocks all client queries

### HIGH (must fix before launch)

- [ ] Align table name: change backend `worker.ts` from `scans` to `scan_history` (BUG-022)
- [ ] Remove/deprecate legacy `calculateCompositeScore()` in `src/lib/scoring/composite.ts` (BUG-035)
- [ ] Align backend heuristic scoring with frontend weighted scoring (BUG-036)
- [ ] Read `userId` from auth token, not request body — spoofing risk (BUG-028)
- [ ] Add sort field whitelist to products GET API (BUG-045)
- [ ] Add field whitelist to influencers POST API (BUG-046)
- [ ] Fix single-origin CORS to allow Netlify preview URLs (BUG-029)
- [ ] Prevent API keys from appearing in error logs (BUG-030)
- [ ] Add `requireClient()` middleware to dashboard routes
- [ ] Parallelize platform scraping in worker with `Promise.all()` (BUG-050)

---

## Phase B — Stripe Integration (3–5 days)

- [ ] Set up Stripe account + API keys
- [ ] Create `client_subscriptions` table
- [ ] Implement subscription checkout flow ($29–$299/mo per-platform tiers)
- [ ] Stripe webhook handling (payment success/failure/cancel)
- [ ] Subscription management UI (upgrade/downgrade/cancel)

---

## Phase C — Platform Gating + Engine Toggles (3–5 days)

- [ ] Create `client_platform_access`, `client_engine_config`, `client_usage` tables
- [ ] Implement per-client engine toggles (8 engines per platform)
- [ ] Build upsell UI for additional platforms/engines
- [ ] Paywall enforcement: data visible, automation gated

---

## Phase D — Store Integrations (5–7 days)

- [ ] Shopify OAuth + Admin GraphQL API integration
- [ ] TikTok Shop OAuth + Seller API v2 integration
- [ ] Amazon SP-API OAuth + Listings API integration
- [ ] Product push to connected stores
- [ ] Order webhook receivers

---

## Phase E — AI Content Engine (5–7 days)

- [ ] Create `content_queue` table
- [ ] AI content generation (Claude-powered)
- [ ] Multi-channel content distribution
- [ ] Content scheduling + automation

---

## Phase F — Order Tracking + Email Sequences (3–5 days)

- [ ] Create `client_orders` table
- [ ] Order tracking integration
- [ ] 5-step post-purchase Resend email sequence:
  1. Order Confirmation
  2. Shipping Confirmation (tracking number)
  3. Delivery Update (ETA)
  4. Delivery Confirmation (24hrs after)
  5. Review Request (3–5 days after)

---

## Phase G — Influencer Outreach v2 (2–3 days)

- [ ] One-click "Invite" button on influencer profiles
- [ ] Haiku-powered personalized outreach email generation
- [ ] Track outreach in `outreach_emails` table

---

## Phase H — Mobile App (10–14 days)

- [ ] React Native scaffold (iOS + Android)
- [ ] Core dashboard views
- [ ] Push notifications for HOT products
- [ ] App store submission prep

---

## Phase I — Final QA + Launch (5–7 days)

- [ ] Full regression test across all phases
- [ ] App store submission (if Phase H complete)
- [ ] Production deployment

---

## MEDIUM Bugs (fix alongside phases)

- [ ] BUG-060: Add cascading deletes for product deletion
- [ ] BUG-059: Use upsert for CSV import to prevent duplicates
- [ ] BUG-062: Worker continues processing after cancel signal
- [ ] BUG-063: Financial route missing 3 of 8 rejection rules
- [ ] BUG-053: No error feedback on failed CRUD operations
- [ ] BUG-057: "View Blueprint" button non-functional on client products page
- [ ] BUG-040: Frontend/backend use different data sources for same platforms

---

## LOW Bugs (fix as time permits)

- [ ] BUG-061: Add audit trails to blueprints, financial models, etc.
- [ ] BUG-047: Sanitize CSV formula injection
- [ ] BUG-064: Whitelist automation status values
- [ ] BUG-048: Add key whitelist for settings POST
- [ ] BUG-044: Replace inline auth in settings route with `requireAdmin()`
- [ ] BUG-037: Legacy overall_score uses wrong formula
- [ ] BUG-041: Trends config reports isConfigured:true but needs APIFY_API_TOKEN
- [ ] BUG-043: Misleading isConfigured pattern in influencer provider

---

## Pending Decisions

- [ ] Stack migration: Netlify → Vercel (see `ai/stack-migration-notes.md`)
- [ ] Stack migration: Railway → Render + Upstash Redis
- [ ] Deployment mode strategy: linked vs standalone_intel vs standalone_dashboard
