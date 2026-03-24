# YOUSELL Platform — Integration Wiring Map

> **Generated:** 2026-03-24
> **Source:** Codebase audit of `src/app/api/`, `src/app/`, `supabase/migrations/`, `backend/src/`, `src/lib/auth/`, `src/middleware.ts`
> **Spec Reference:** YouSell_Platform_Technical_Specification_v9.md
> **Rule:** Only maps what actually exists in the codebase. No invented wiring.

---

## Section 1 — Supabase Table → Component Map

Maps every Supabase table to the UI components/pages that consume its data.

| Supabase Table | UI Page(s) | Component(s) / Props | API Route(s) Used |
|---|---|---|---|
| `products` | `/admin` (dashboard), `/admin/products`, `/admin/tiktok`, `/admin/amazon`, `/admin/shopify`, `/admin/pinterest`, `/admin/digital`, `/admin/pod`, `/admin/scoring`, `/admin/opportunities`, `/dashboard/products`, `/dashboard/products/[id]` | ProductCard, ScoreBadge, PlatformProducts, KPI cards, trend stage badges | `GET /api/admin/products`, `GET /api/admin/tiktok`, `GET /api/admin/amazon`, `GET /api/admin/shopify`, `GET /api/admin/pinterest`, `GET /api/admin/digital`, `GET /api/admin/opportunities`, `GET /api/dashboard/products` |
| `scan_history` | `/admin` (dashboard), `/admin/scan`, `/admin/analytics` | ScanControlPanel, ScanHistory list, progress bar | `GET/POST/DELETE /api/admin/scan`, `GET /api/admin/dashboard`, `GET /api/admin/analytics` |
| `trend_keywords` | `/admin/trends` | TrendTable, direction badges, keyword list | `GET/POST/PUT /api/admin/trends` |
| `influencers` | `/admin/influencers`, `/admin/creator-matches` | InfluencerTable, InviteDialog, engagement sparklines | `GET/POST /api/admin/influencers`, `POST /api/admin/influencers/invite` |
| `product_influencers` | `/admin/influencers` | Match score display, outreach status | `GET /api/admin/influencers` |
| `competitor_stores` | `/admin/competitors` | CompetitorTable, success score, ad activity badges | `GET/POST /api/admin/competitors` |
| `suppliers` | `/admin/suppliers` | SupplierTable, MOQ/pricing/shipping display | `GET/POST /api/admin/suppliers` |
| `product_suppliers` | `/admin/suppliers` | Product-supplier link display | `GET /api/admin/suppliers` |
| `financial_models` | `/admin/blueprints`, `/admin/analytics/funnel` | FinancialModelCard, margin bars, break-even chart | `GET/POST /api/admin/financial` |
| `launch_blueprints` | `/admin/blueprints` | BlueprintCard, PDF export button | `GET/POST /api/admin/blueprints`, `GET /api/admin/blueprints/[id]/pdf` |
| `affiliate_programs` | `/admin/affiliates`, `/admin/affiliates/ai`, `/admin/affiliates/physical` | AffiliateTable, commission rate display | `GET /api/admin/affiliates` |
| `affiliate_commissions` | `/admin/affiliates/commissions` | CommissionLog, status badges, payment tracking | `GET/PATCH /api/admin/affiliates/commissions` |
| `affiliate_referrals` | `/dashboard/affiliate` | ReferralStats, referral code display, earnings | `GET /api/dashboard/affiliate/referral` |
| `product_allocations` | `/admin/allocate`, `/admin/analytics`, `/dashboard/products` | AllocationTable, client product cards | `GET/POST /api/admin/allocations`, `GET /api/dashboard/products` |
| `product_requests` | `/admin/allocate`, `/dashboard/requests` | RequestList, approve/reject buttons | `PATCH /api/admin/allocations/requests`, `GET/POST /api/dashboard/requests` |
| `clients` | `/admin/clients`, `/admin/allocate`, `/admin` (dashboard) | ClientTable, plan badges, subscription status | `GET/POST/PUT/DELETE /api/admin/clients`, `GET /api/admin/dashboard` |
| `subscriptions` | `/admin/clients`, `/admin/revenue`, `/dashboard/billing` | SubscriptionBadge, MRR chart, plan selector | `GET /api/admin/revenue`, `GET/POST /api/dashboard/subscription` |
| `automation_jobs` | `/admin/automation` | AutomationTable, status badges, kill switch | `GET/PATCH /api/admin/automation` |
| `automation_pending_actions` | `/admin/automation` | PendingActionsList, approve/reject buttons | `GET/POST /api/admin/automation/actions` |
| `client_automation_settings` | `/admin/automation` | AutomationSettings, level slider (1-3) | `GET/PUT /api/admin/automation/settings` |
| `notifications` | `/admin/notifications` | NotificationList, read/unread badges | `GET/PATCH /api/admin/notifications` |
| `admin_settings` | `/admin/settings` | SettingsForm, API key inputs, debug toggle | `GET/POST /api/admin/settings` |
| `imported_files` | `/admin/import` | ImportHistory, row count, error display | `POST /api/admin/import` |
| `content_queue` | `/admin/content`, `/dashboard/content` | ContentList, status workflow badges, schedule picker | `GET/PATCH /api/admin/content`, `GET /api/dashboard/content`, `POST /api/dashboard/content/generate` |
| `content_credits` | `/dashboard/content` | CreditMeter, usage bar | `POST /api/dashboard/content/generate` |
| `connected_channels` | `/dashboard/integrations` | ChannelList, connect/disconnect buttons | `GET /api/dashboard/channels`, `POST /api/dashboard/channels/connect`, `POST /api/dashboard/channels/disconnect` |
| `shop_products` | `/dashboard/products`, `/admin/products` | ShopProductSync, sync status badges | `POST /api/dashboard/shop/push`, `POST /api/dashboard/shop/push-batch`, `POST /api/admin/products/push` |
| `orders` | `/dashboard/orders` | OrderTable, tracking links, status timeline | `GET /api/dashboard/orders` |
| `tiktok_videos` | `/admin/tiktok` | TikTokVideoGrid, has_product filter | `GET /api/admin/tiktok/videos`, `POST /api/admin/tiktok/discover` |
| `tiktok_hashtag_signals` | `/admin/tiktok`, `/admin/trends` | HashtagSignalTable, velocity sparklines | `GET /api/admin/tiktok/signals` |
| `viral_signals` | `/admin/scoring` | ViralSignalRadar, 6-signal breakdown | `POST /api/admin/scoring` |
| `product_clusters` | `/admin/clusters` | ClusterVisualization, member count | `GET/POST /api/admin/clusters` |
| `product_cluster_members` | `/admin/clusters` | ClusterMemberList | `GET /api/admin/clusters` |
| `creator_product_matches` | `/admin/creator-matches` | MatchTable, compatibility score | `GET/POST /api/admin/creator-matches` |
| `ads` | `/admin/ads` | AdsTable, platform filter, scaling indicators | `GET/POST /api/admin/ads` |
| `outreach_emails` | `/admin/influencers` | OutreachStatus, sent/opened/replied badges | `POST /api/admin/influencers/invite` |
| `profiles` | `/admin/login`, `/admin` (layout) | Role display, user avatar | Supabase Auth (middleware) |
| `engine_budget_envelopes` | `/admin/governor`, `/admin/governor/budgets` | BudgetCards, quota bars, client list | `GET/POST /api/admin/governor/clients` |
| `engine_usage_ledger` | `/admin/governor`, `/admin/monitoring` | UsageChart, cost-per-engine breakdown | `GET /api/admin/governor/fleet`, `GET /api/admin/governor/analytics` |
| `engine_swaps` | `/admin/governor/swaps` | SwapTable, source→target display | `GET/POST /api/admin/governor/swaps` |
| `governor_ai_decisions` | `/admin/governor/decisions` | DecisionList, approve/dismiss/revert | `GET/POST /api/admin/governor/decisions` |
| `governor_overrides` | `/admin/governor` | OverrideList, bypass type badges | `GET/POST /api/admin/governor/overrides` |
| `engine_cost_manifests` | `/admin/governor` | CostManifestTable, per-engine operation costs | `GET /api/admin/governor/fleet` |
| `system_alerts` | `/admin` (dashboard), `/admin/monitoring` | AlertBanner, acknowledge/dismiss | `GET/POST /api/admin/alerts` |
| `engine_toggles` | `/dashboard/integrations` | EngineToggleList, on/off switches | `GET/POST /api/dashboard/engines` |
| `usage_tracking` | `/admin/revenue`, `/dashboard/analytics` | UsageChart, metric counters | `GET /api/admin/revenue`, `GET /api/dashboard/analytics` |

---

## Section 2 — All API Routes → UI Pages

Maps every implemented API route to the UI page(s) that call it.

### 2A. Admin API Routes (`/api/admin/*`) — 54 routes

| # | API Route | Methods | UI Page(s) That Call It |
|---|---|---|---|
| 1 | `/api/admin/dashboard` | GET | `/admin` (home dashboard — KPI cards, service status) |
| 2 | `/api/admin/products` | GET, POST, PATCH, DELETE | `/admin/products` (product table with filters, CRUD) |
| 3 | `/api/admin/products/push` | GET, POST | `/admin/products` (push-to-store button) |
| 4 | `/api/admin/tiktok` | GET | `/admin/tiktok` (TikTok product list) |
| 5 | `/api/admin/tiktok/videos` | GET | `/admin/tiktok` (video grid, has_product filter) |
| 6 | `/api/admin/tiktok/discover` | POST | `/admin/tiktok` (discover button triggers TikTok scan) |
| 7 | `/api/admin/tiktok/signals` | GET | `/admin/tiktok` (hashtag velocity signals) |
| 8 | `/api/admin/amazon` | GET | `/admin/amazon` (Amazon product list by score) |
| 9 | `/api/admin/amazon/scan` | POST | `/admin/amazon` (Amazon scan trigger) |
| 10 | `/api/admin/shopify/scan` | POST | `/admin/shopify` (Shopify scan trigger) |
| 11 | `/api/admin/pinterest` | GET | `/admin/pinterest` (Pinterest product list) |
| 12 | `/api/admin/digital` | GET | `/admin/digital` (Digital product list) |
| 13 | `/api/admin/affiliates` | GET | `/admin/affiliates`, `/admin/affiliates/ai`, `/admin/affiliates/physical` |
| 14 | `/api/admin/affiliates/commissions` | GET, PATCH | `/admin/affiliates/commissions` (commission log, status update) |
| 15 | `/api/admin/competitors` | GET, POST | `/admin/competitors` (competitor table, add competitor) |
| 16 | `/api/admin/influencers` | GET, POST | `/admin/influencers` (influencer table, add influencer) |
| 17 | `/api/admin/influencers/invite` | POST | `/admin/influencers` (invite dialog → sends email via Resend) |
| 18 | `/api/admin/suppliers` | GET, POST | `/admin/suppliers` (supplier table, add supplier) |
| 19 | `/api/admin/clients` | GET, POST, PUT, DELETE | `/admin/clients` (client CRUD, plan management) |
| 20 | `/api/admin/allocations` | GET, POST | `/admin/allocate` (allocation table, assign products to clients) |
| 21 | `/api/admin/allocations/requests` | PATCH | `/admin/allocate` (approve/reject product requests) |
| 22 | `/api/admin/scan` | POST, GET, DELETE | `/admin/scan` (scan control panel — start/monitor/cancel) |
| 23 | `/api/admin/scan/health` | GET | `/admin/scan`, `/admin/setup` (scan system health check) |
| 24 | `/api/admin/scoring` | POST | `/admin/scoring` (score calculation trigger) |
| 25 | `/api/admin/financial` | GET, POST | `/admin/blueprints` (financial model generation) |
| 26 | `/api/admin/blueprints` | GET, POST | `/admin/blueprints` (blueprint list, create) |
| 27 | `/api/admin/blueprints/[id]/pdf` | GET | `/admin/blueprints` (PDF export button) |
| 28 | `/api/admin/trends` | GET, POST, PUT | `/admin/trends` (trend table, add keyword, run detection) |
| 29 | `/api/admin/automation` | GET, PATCH | `/admin/automation` (job list, toggle status) |
| 30 | `/api/admin/automation/actions` | GET, POST | `/admin/automation` (pending actions, approve/reject) |
| 31 | `/api/admin/automation/settings` | GET, PUT | `/admin/automation` (automation level config) |
| 32 | `/api/admin/notifications` | GET, PATCH | `/admin/notifications` (notification list, mark read) |
| 33 | `/api/admin/settings` | GET, POST | `/admin/settings` (API keys, provider config) |
| 34 | `/api/admin/import` | POST | `/admin/import` (CSV/Excel upload) |
| 35 | `/api/admin/content` | GET, PATCH | `/admin/content` (content list, approve/reject/schedule) |
| 36 | `/api/admin/clusters` | GET, POST | `/admin/clusters` (cluster visualization, run clustering) |
| 37 | `/api/admin/creator-matches` | GET, POST | `/admin/creator-matches` (match table, run matching) |
| 38 | `/api/admin/ads` | GET, POST | `/admin/ads` (ad table, discover ads via engine) |
| 39 | `/api/admin/opportunities` | GET | `/admin/products` (opportunity feed filter) |
| 40 | `/api/admin/analytics` | GET | `/admin/analytics` (dashboard overview: products, scans, MRR) |
| 41 | `/api/admin/analytics/funnel` | GET | `/admin/analytics` (funnel: discovered→allocated→content→deployed→orders) |
| 42 | `/api/admin/revenue` | GET | `/admin/analytics` (MRR, ARR, plan breakdown, churn) |
| 43 | `/api/admin/alerts` | GET, POST | `/admin` (dashboard alert banner), `/admin/monitoring` |
| 44 | `/api/admin/monitoring` | GET | `/admin/monitoring` (system health: errors, latency, costs) |
| 45 | `/api/admin/engines/health` | GET | `/admin/monitoring` (engine dependency health) |
| 46 | `/api/admin/debug` | GET | `/admin/setup` (full system diagnostics) |
| 47 | `/api/admin/e2e` | GET | `/admin/setup` (E2E system readiness check) |
| 48 | `/api/admin/setup/migrate` | POST | `/admin/setup` (create missing tables) |
| 49 | `/api/admin/governor/clients` | GET, POST | `/admin/governor/budgets` (client budget envelopes) |
| 50 | `/api/admin/governor/decisions` | GET, POST | `/admin/governor/decisions` (AI decisions, approve/dismiss) |
| 51 | `/api/admin/governor/fleet` | GET | `/admin/governor` (fleet overview: engines, costs, swaps) |
| 52 | `/api/admin/governor/analytics` | GET | `/admin/governor` (cost analytics: per-engine, top clients) |
| 53 | `/api/admin/governor/swaps` | GET, POST | `/admin/governor/swaps` (engine hot-swap management) |
| 54 | `/api/admin/governor/overrides` | GET, POST | `/admin/governor` (super-admin bypass management) |

### 2B. Dashboard API Routes (`/api/dashboard/*`) — 18 routes

| # | API Route | Methods | UI Page(s) That Call It |
|---|---|---|---|
| 1 | `/api/dashboard/products` | GET | `/dashboard/products` (client's allocated products) |
| 2 | `/api/dashboard/requests` | GET, POST | `/dashboard/requests` (product requests, submit new) |
| 3 | `/api/dashboard/subscription` | GET, POST | `/dashboard/billing` (subscription details, create checkout) |
| 4 | `/api/dashboard/subscription/portal` | POST | `/dashboard/billing` (Stripe billing portal) |
| 5 | `/api/dashboard/engines` | GET, POST | `/dashboard/integrations` (engine toggles) |
| 6 | `/api/dashboard/channels` | GET | `/dashboard/integrations` (connected channels list) |
| 7 | `/api/dashboard/channels/connect` | POST | `/dashboard/integrations` (OAuth connect flow) |
| 8 | `/api/dashboard/channels/disconnect` | POST | `/dashboard/integrations` (disconnect channel) |
| 9 | `/api/dashboard/content` | GET | `/dashboard/content` (content items list) |
| 10 | `/api/dashboard/content/generate` | POST | `/dashboard/content` (generate content, checks credits) |
| 11 | `/api/dashboard/content/batch` | POST | `/dashboard/content` (batch generate, max 10) |
| 12 | `/api/dashboard/content/schedule` | POST | `/dashboard/content` (schedule for distribution) |
| 13 | `/api/dashboard/orders` | GET | `/dashboard/orders` (order list with tracking) |
| 14 | `/api/dashboard/analytics` | GET | `/dashboard` (home — allocations, content, orders, credits) |
| 15 | `/api/dashboard/affiliate/referral` | GET | `/dashboard/affiliate` (referral code, stats, earnings) |
| 16 | `/api/dashboard/shop/push` | POST | `/dashboard/products` (push single product to store) |
| 17 | `/api/dashboard/shop/push-batch` | POST | `/dashboard/products` (batch push, max 25) |

### 2C. Engine API Routes (`/api/engine/*`) — 18 routes

| # | API Route | Methods | Called By |
|---|---|---|---|
| 1 | `/api/engine/discovery/products` | GET | Backend workers, internal engine calls |
| 2 | `/api/engine/discovery/scan` | GET | Backend scan workers |
| 3 | `/api/engine/scoring/calculate` | POST | Backend scoring pipeline |
| 4 | `/api/engine/competitors` | GET | Backend competitor intelligence |
| 5 | `/api/engine/creators/matches` | GET | Backend creator matching |
| 6 | `/api/engine/creators/influencers` | GET | Backend influencer discovery |
| 7 | `/api/engine/content/generate` | POST | Backend content worker |
| 8 | `/api/engine/deploy` | POST | Backend store deployment |
| 9 | `/api/engine/allocations` | GET | Backend client allocation |
| 10 | `/api/engine/blueprints` | GET | Backend blueprint generation |
| 11 | `/api/engine/ads` | GET | Backend ad intelligence |
| 12 | `/api/engine/intelligence/clusters` | GET | Backend clustering engine |
| 13 | `/api/engine/profitability` | GET | Backend financial pipeline |
| 14 | `/api/engine/suppliers` | GET | Backend supplier discovery |
| 15 | `/api/engine/tiktok/videos` | GET | Backend TikTok pipeline |
| 16 | `/api/engine/tiktok/discover` | POST | Backend TikTok discovery |
| 17 | `/api/engine/schedule` | GET | Backend automation scheduler |
| 18 | `/api/engine/governor` | GET | Backend governor status check |
| 19 | `/api/engine/orders/webhook` | POST | External stores (Shopify/TikTok/Amazon webhooks) |

### 2D. Auth Routes (`/api/auth/*`) — 6 routes

| # | API Route | Methods | UI Page(s) / Flow |
|---|---|---|---|
| 1 | `/api/auth/callback` | GET | Post-login redirect (Supabase OAuth code exchange → route to `/admin` or `/dashboard`) |
| 2 | `/api/auth/signout` | POST | `/admin` layout logout button, `/dashboard` layout logout button |
| 3 | `/api/auth/oauth/callback` | GET | `/dashboard/integrations` (OAuth token exchange for Shopify/TikTok/Amazon) |
| 4 | `/api/auth/oauth/woocommerce` | GET, POST | `/dashboard/integrations` (WooCommerce REST API key connection) |
| 5 | `/api/auth/oauth/bigcommerce` | GET, POST | `/dashboard/integrations` (BigCommerce OAuth2 code exchange) |
| 6 | `/api/auth/oauth/etsy` | GET, POST | `/dashboard/integrations` (Etsy OAuth2 PKCE flow) |

### 2E. Webhook Routes (`/api/webhooks/*`) — 3 routes

| # | API Route | Methods | External Source | Tables Updated |
|---|---|---|---|---|
| 1 | `/api/webhooks/resend` | POST | Resend (email events) | `outreach_emails` (delivered, bounced, opened, clicked, spam) |
| 2 | `/api/webhooks/printful` | POST | Printful (POD fulfillment) | `orders` (package_shipped, order updates) |
| 3 | `/api/webhooks/amazon` | POST | Amazon SP-API | `orders`, `connected_channels` (ORDER_CHANGE notifications) |

### 2F. Health Route — 1 route

| # | API Route | Methods | Purpose |
|---|---|---|---|
| 1 | `/api/health` | GET | Liveness check; `?deep=true` checks Supabase, Redis, env vars, backend, circuit breakers |

---

## Section 3 — Edge Functions → UI Features

### Status: No Edge Functions Exist

**Audit result:** Zero Supabase Edge Functions are deployed or referenced in the codebase.

- No `supabase/functions/` directory exists
- No Deno references found in any source file
- No `edge-function` or `supabase.functions.invoke()` calls anywhere in `src/`
- All server-side work runs via:
  - **Next.js API routes** (`src/app/api/`) — 97+ routes on Netlify
  - **Express backend** (`backend/src/`) — workers on Railway
  - **BullMQ job processors** (`backend/src/jobs/`) — async pipelines on Railway

**v9 spec note:** Edge Functions are mentioned as a potential future optimization but none are currently implemented.

| Edge Function | UI Feature | Status |
|---|---|---|
| `daily-briefing` | AIInsightCard on dashboard | **NOT IMPLEMENTED** — briefing data comes from `/api/admin/dashboard` API route |
| `webhook-validator` | Webhook signature verification | **NOT IMPLEMENTED** — validation happens inline in each `/api/webhooks/*` route handler |
| `realtime-scorer` | Live score updates | **NOT IMPLEMENTED** — scoring runs in backend worker via BullMQ |

---

## Section 4 — Real-Time Subscriptions per Page

### Active Subscriptions (In Codebase)

Only **1 real-time subscription** exists in the entire codebase:

| Page | Channel Name | Tables Subscribed | Events | Debounce | File |
|---|---|---|---|---|---|
| `/admin` (dashboard home) | `dashboard-realtime` | `products`, `scan_history` | `postgres_changes` (INSERT, UPDATE, DELETE — all events via `*`) | 2 seconds | `src/app/admin/page.tsx:210` |

**How it works:**
1. Admin dashboard opens a Supabase Realtime channel named `dashboard-realtime`
2. Subscribes to ALL postgres changes on `products` and `scan_history` tables
3. On any change, a 2-second debounce timer fires
4. After debounce, `fetchData()` re-fetches all dashboard KPIs from `/api/admin/dashboard`
5. Channel is cleaned up on page unmount

### Pages Without Real-Time (Rely on Manual Refresh / SWR)

| Page | Data Source | Refresh Strategy |
|---|---|---|
| `/admin/products` | `GET /api/admin/products` | Manual refresh / page navigation |
| `/admin/tiktok` | `GET /api/admin/tiktok` | Manual refresh |
| `/admin/amazon` | `GET /api/admin/amazon` | Manual refresh |
| `/admin/scan` | `GET /api/admin/scan` | Polling during active scan |
| `/admin/trends` | `GET /api/admin/trends` | Manual refresh |
| `/admin/scoring` | `POST /api/admin/scoring` | On-demand after scoring run |
| `/admin/analytics` | `GET /api/admin/analytics` | Manual refresh |
| `/admin/monitoring` | `GET /api/admin/monitoring` | Manual refresh (24h window) |
| `/dashboard/products` | `GET /api/dashboard/products` | Manual refresh |
| `/dashboard/content` | `GET /api/dashboard/content` | Manual refresh |
| `/dashboard/orders` | `GET /api/dashboard/orders` | Manual refresh |
| All other pages | Various API routes | Manual refresh / page navigation |

### v9 Spec: Planned Real-Time Subscriptions (Not Yet Implemented)

| Planned Channel | Target Page | Tables | Purpose |
|---|---|---|---|
| `scan-progress` | `/admin/scan` | `scan_history` | Live scan step-by-step progress bar |
| `product-scores` | `/admin/scoring` | `products` | Live score updates during batch scoring |
| `client-products` | `/dashboard/products` | `product_allocations` | Notify client when new products allocated |
| `notifications` | `/admin/notifications`, `/dashboard` | `notifications` | Push new notifications without refresh |
| `content-status` | `/dashboard/content` | `content_queue` | Content generation progress updates |
| `order-updates` | `/dashboard/orders` | `orders` | Order status changes from webhooks |

---

## Section 5 — Auth & RLS Flow

### 5.1 Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                        │
│                                                              │
│  Browser → Supabase Auth (JWT) → Middleware → API Route      │
│                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  Login   │───→│ Supabase Auth│───→│ JWT Cookie Set    │  │
│  │  Page    │    │ (email/pass) │    │ (.yousell.online) │  │
│  └──────────┘    └──────────────┘    └───────────────────┘  │
│                                              │               │
│                                              ▼               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MIDDLEWARE (src/middleware.ts)            │   │
│  │                                                       │   │
│  │  1. Rate limit: 60 req/min per IP                    │   │
│  │  2. Supabase getUser() from JWT cookie               │   │
│  │  3. Subdomain routing:                               │   │
│  │     • admin.yousell.online → /admin/* only           │   │
│  │     • yousell.online → /dashboard/* only             │   │
│  │  4. Role check via RPC check_user_role():            │   │
│  │     • /admin/* → requires admin or super_admin       │   │
│  │     • /dashboard/* → requires client                 │   │
│  │  5. Security headers (HSTS, XSS, CSRF, etc.)        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Role-Based Access Control

| Role | Can Access | Middleware Check | API Auth Function |
|---|---|---|---|
| `super_admin` | All `/admin/*` pages, all admin API routes | `check_user_role()` RPC returns `super_admin` | `requireAdmin()` in `src/lib/auth/roles.ts` |
| `admin` | All `/admin/*` pages, all admin API routes | `check_user_role()` RPC returns `admin` | `requireAdmin()` in `src/lib/auth/roles.ts` |
| `client` | All `/dashboard/*` pages, dashboard API routes | `check_user_role()` RPC returns `client` | `requireClient()` in `src/lib/auth/require-client.ts` or `authenticateClient()` in `src/lib/auth/client-api-auth.ts` |
| No role / unauthenticated | Public pages only (`/`, `/login`, `/signup`, `/pricing`, `/terms`, `/privacy`) | Redirected to `/login` | N/A |

### 5.3 API Route Auth Patterns (3 Tiers)

**Tier 1 — Admin routes** (`/api/admin/*`):
```typescript
// src/lib/auth/roles.ts
export async function requireAdmin(): Promise<User> {
  const user = await getUser();  // Supabase server-side session
  if (!user) throw new Error('Unauthorized');
  if (user.role !== 'admin' && user.role !== 'super_admin') throw new Error('Forbidden');
  return user;
}
```

**Tier 2 — Client dashboard routes** (`/api/dashboard/*`):
```typescript
// src/lib/auth/client-api-auth.ts — Token-based (avoids Netlify cookie hang)
export async function authenticateClient(req: NextRequest): Promise<ClientAuthResult> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  // Verifies token → checks role=client → resolves clientId → loads subscription tier
  // Returns: { userId, email, clientId, subscription: { plan, engines[], productsPerPlatform } }
}

// Lightweight variant (no subscription lookup):
export async function authenticateClientLite(req: NextRequest)
// Returns: { userId, email, clientId }
```

**Tier 3 — Engine routes** (`/api/engine/*`):
- No explicit auth — called by backend workers via internal network
- Protected by network isolation (Railway → Netlify internal calls)

### 5.4 Client Subscription Gating

```
Client Login → JWT → requireClient() → Check subscription plan → Gate features

Plan Hierarchy:
  Starter     → 3 products/platform, 1 platform, basic engines
  Growth      → 10 products/platform, 3 platforms, content + store engines
  Professional → 25 products/platform, 5 platforms, all engines
  Enterprise  → 50 products/platform, all platforms, unlimited credits
```

Engine access is checked per-request:
```typescript
// src/lib/auth/client-api-auth.ts
export function requireEngine(auth: ClientAuthResult, engine: string): void {
  if (!auth.subscription) throw new Error("No active subscription");
  if (!auth.subscription.engines.includes(engine)) throw new Error(`Engine '${engine}' not in plan`);
}
```

### 5.5 RLS Policies (Database-Level Enforcement)

| Policy Scope | Tables | Rule |
|---|---|---|
| **Admin full access** | ALL tables | `profiles.role IN ('admin', 'super_admin')` → SELECT, INSERT, UPDATE, DELETE |
| **Client read own data** | `product_allocations`, `product_requests`, `content_queue`, `orders`, `connected_channels`, `content_credits`, `shop_products` | `client_id = auth.uid()` or linked via `clients.email = auth.email()` |
| **Client product visibility** | `product_allocations` | Only rows where `visible_to_client = true` |
| **Service role bypass** | ALL tables | Backend workers use `SUPABASE_SERVICE_ROLE_KEY` which bypasses all RLS |
| **Anonymous zero access** | ALL tables | No anonymous access to any table |
| **Command Center admin-only** | `admin_store_connections`, `admin_product_listings`, `admin_revenue_tracking` | Only `super_admin` and `admin` roles |
| **Affiliate admin-only** | `affiliate_referrals` (Stream 1), `affiliate_commissions` | Internal stream: admin-only; client stream: client can read own referrals |

### 5.6 Cookie & Session Architecture

| Component | Detail |
|---|---|
| **Cookie domain** | `.yousell.online` (shared across subdomains) |
| **Session provider** | Supabase Auth (JWT stored in httpOnly cookie) |
| **Token refresh** | Automatic via `@supabase/ssr` middleware |
| **Cross-domain** | `admin.yousell.online` ↔ `yousell.online` share auth cookies |
| **Localhost** | No domain restriction (works with default cookie behavior) |
| **Sign out** | `POST /api/auth/signout` clears session and redirects |
