# YOUSELL Platform — Integration Wiring Map

> **Generated:** 2026-03-24 | **Verified:** 2026-03-24 (page-by-page authFetch audit)
> **Source:** Codebase audit of every `page.tsx`, `route.ts`, migration `.sql`, and `backend/src/*.ts`
> **Spec Reference:** YouSell_Platform_Technical_Specification_v9.md
> **Rule:** Only maps what actually exists in the codebase. Every API call verified from source.

---

## Section 1 — Supabase Table → Component Map

Maps every Supabase table to the UI components/pages that consume its data (via API routes — no pages query Supabase directly).

### Verified Components (from `src/components/`)

| Component | File | Purpose |
|---|---|---|
| `ScoreBadge` | `score-badge.tsx` | Score display (HOT/WARM/WATCH/COLD tier colors) |
| `TierBadge` | `score-badge.tsx` | Exported alongside ScoreBadge — tier label badge |
| `ProductCard` | `product-card.tsx` | Universal product card (imports TierBadge) |
| `PlatformProducts` | `platform-products.tsx` | Reusable platform product list — takes `apiPath` prop, also calls `/api/admin/dashboard` for provider status |
| `EnginePageLayout` | `engines/engine-page-layout.tsx` | Standard admin engine page wrapper (title, health dot, status badge) |
| `EngineStatusCard` | `engines/engine-status-card.tsx` | Engine status card for dashboard |
| `EngineGate` | `engine-gate.tsx` | Subscription gating wrapper for dashboard features (checks `useSubscription().engines.includes(engine)`) |
| `AdminSidebar` | `admin-sidebar.tsx` | Admin navigation sidebar |
| `SubscriptionProvider` | `subscription-context.tsx` | Client subscription context provider |
| `SubscriptionBanner` | `subscription-banner.tsx` | Upgrade prompt banner |
| `DashboardMobileNav` | `dashboard-mobile-nav.tsx` | Mobile navigation for client dashboard |
| `ConnectionHub` | `shop-connect/connection-hub.tsx` | Store connection management |
| `PushProductModal` | `shop-connect/push-product-modal.tsx` | Push single product to store |
| `BatchPushModal` | `shop-connect/batch-push-modal.tsx` | Batch push products to store |
| `SocialLoginButtons` | `auth/SocialLoginButtons.tsx` | OAuth login buttons |

### Table → Page Map

| Supabase Table | UI Page(s) That Display Its Data | Via API Route(s) |
|---|---|---|
| `products` | `/admin` (dashboard KPIs), `/admin/products`, `/admin/tiktok`, `/admin/amazon`, `/admin/shopify`, `/admin/pinterest`, `/admin/digital`, `/admin/pod`, `/admin/allocate`, `/admin/influencers`, `/dashboard/products`, `/dashboard/products/[id]`, `/dashboard/content`, `/dashboard` (home) | `/api/admin/dashboard`, `/api/admin/products`, `/api/admin/tiktok`, `/api/admin/amazon`, `/api/admin/pinterest`, `/api/admin/digital`, `/api/dashboard/products` |
| `scan_history` | `/admin` (dashboard), `/admin/scan` | `/api/admin/dashboard`, `/api/admin/scan` |
| `trend_keywords` | `/admin/trends` | `/api/admin/trends` |
| `influencers` | `/admin/influencers` | `/api/admin/influencers` |
| `competitors` | `/admin/competitors`, `/admin/shopify` | `/api/admin/competitors` |
| `suppliers` | `/admin/suppliers` | `/api/admin/suppliers` |
| `clients` | `/admin/clients`, `/admin/allocate`, `/admin/scan`, `/admin` (dashboard) | `/api/admin/clients`, `/api/admin/dashboard` |
| `product_allocations` | `/admin/allocate`, `/dashboard/products`, `/dashboard` (home) | `/api/admin/allocations`, `/api/dashboard/products` |
| `product_requests` | `/admin/allocate`, `/dashboard/requests`, `/dashboard` (home) | `/api/admin/allocations`, `/api/admin/allocations/requests`, `/api/dashboard/requests` |
| `product_clusters` | `/admin/clusters` | `/api/admin/clusters` |
| `product_cluster_members` | `/admin/clusters` | `/api/admin/clusters` |
| `creator_product_matches` | `/admin/creator-matches` | `/api/admin/creator-matches` |
| `ads` | `/admin/ads` | `/api/admin/ads` |
| `tiktok_videos` | `/admin/tiktok` | `/api/admin/tiktok/videos` |
| `tiktok_hashtag_signals` | `/admin/tiktok` | `/api/admin/tiktok/signals` |
| `viral_signals` | (no dedicated page — used by scoring API internally) | `/api/admin/scoring` |
| `financial_models` | (no dedicated page — used by financial API) | `/api/admin/financial` |
| `launch_blueprints` | `/admin/blueprints` | `/api/admin/blueprints`, `/api/admin/blueprints/[id]/pdf` |
| `affiliate_programs` | `/admin/affiliates/ai`, `/admin/affiliates/physical` | `/api/admin/affiliates?type=ai`, `/api/admin/affiliates?type=physical` |
| `affiliate_commissions` | `/admin/affiliates/commissions` | `/api/admin/affiliates/commissions` |
| `affiliate_referrals` | `/dashboard/affiliate` | `/api/dashboard/affiliate/referral` |
| `automation_jobs` | `/admin/automation`, `/admin/settings` | `/api/admin/automation` |
| `content_queue` | `/admin/content`, `/dashboard/content`, `/dashboard/products/[id]` | `/api/admin/content`, `/api/dashboard/content` |
| `content_credits` | `/dashboard/content` (checked by generate endpoint) | `/api/dashboard/content/generate` |
| `connected_channels` | `/dashboard/integrations` | `/api/dashboard/channels` |
| `shop_products` | (created via push endpoints) | `/api/dashboard/shop/push`, `/api/admin/products/push` |
| `orders` | `/dashboard/orders` | `/api/dashboard/orders` |
| `subscriptions` | `/dashboard/billing`, `/admin` (dashboard MRR) | `/api/dashboard/subscription`, `/api/admin/dashboard` |
| `outreach_emails` | `/admin/influencers` (invite flow) | `/api/admin/influencers/invite` |
| `notifications` | `/admin/notifications` | `/api/admin/notifications` |
| `admin_settings` | `/admin/settings`, `/admin/setup` | `/api/admin/settings` |
| `imported_files` | `/admin/import` | `/api/admin/import` |
| `profiles` | `dashboard/layout.tsx` (server-side auth) | Direct Supabase query in layout |
| `engine_budget_envelopes` | `/admin/governor`, `/admin/governor/budgets` | `/api/admin/governor/clients` |
| `engine_usage_ledger` | `/admin/governor`, `/admin/monitoring` | `/api/admin/governor/fleet`, `/api/admin/governor/analytics`, `/api/admin/monitoring` |
| `engine_swaps` | `/admin/governor/swaps`, `/admin/governor` | `/api/admin/governor/swaps`, `/api/admin/governor/fleet` |
| `external_engines` | `/admin/governor/engines`, `/admin/governor/swaps` | `/api/admin/governor/external-engines`, `/api/admin/governor/external-engines/test` |
| `governor_ai_decisions` | `/admin/governor/decisions`, `/admin/governor` | `/api/admin/governor/decisions` |
| `governor_overrides` | `/admin/governor` | `/api/admin/governor/overrides` |
| `engine_cost_manifests` | `/admin/governor` | `/api/admin/governor/fleet` |
| `system_alerts` | (no UI page calls this directly) | `/api/admin/alerts` (backend-only) |
| `engine_toggles` | `/dashboard/integrations` | `/api/dashboard/engines` |
| `usage_tracking` | (no UI page calls this directly) | `/api/admin/revenue` (backend-only) |
| `chatbot_config` | `/admin/chatbot` | `/api/admin/chatbot` |
| `chatbot_intents` | `/admin/chatbot` | `/api/admin/chatbot` |
| `chatbot_conversations` | `/admin/chatbot` | `/api/admin/chatbot` |
| `fraud_rules` | `/admin/fraud` | `/api/admin/fraud` |
| `fraud_flags` | `/admin/fraud` | `/api/admin/fraud` |
| `pricing_strategies` | `/admin/pricing` | `/api/admin/pricing` |
| `pricing_suggestions` | `/admin/pricing` | `/api/admin/pricing` |
| `competitor_prices` | `/admin/pricing` | `/api/admin/pricing` |
| `demand_forecasts` | `/admin/forecasting` | `/api/admin/forecasting` |
| `restock_alerts` | `/admin/forecasting` | `/api/admin/forecasting` |
| `smart_ux_features` | `/admin/smart-ux` | `/api/admin/smart-ux` |
| `ab_tests` | `/admin/smart-ux` | `/api/admin/smart-ux` |
| `personalization_rules` | `/admin/smart-ux` | `/api/admin/smart-ux` |

---

## Section 2 — Every UI Page → Exact API Routes Called

**Verified by reading every `page.tsx` file.** Each API call extracted from actual `authFetch()` or `fetch()` calls in source.

### 2A. Admin Pages (42 pages)

| # | UI Page | Exact API Routes Called (from source code) | Components Used |
|---|---|---|---|
| 1 | `/admin` (dashboard) | `GET /api/admin/dashboard` | EngineStatusCard, ENGINE_PAGE_MAP, lucide icons |
| 2 | `/admin/products` | `GET /api/admin/products?${params}`, `POST /api/admin/products`, `PATCH /api/admin/products`, `DELETE /api/admin/products?id=${id}` | EnginePageLayout, ScoreBadge, Card, Table, Dialog, Input, Badge, Skeleton |
| 3 | `/admin/tiktok` | `POST /api/admin/tiktok/discover`, `GET /api/admin/tiktok?${params}`, `GET /api/admin/tiktok/videos?${params}`, `GET /api/admin/tiktok/signals` | EnginePageLayout, ScoreBadge, Card, Tabs, Table, Badge, Input, Skeleton |
| 4 | `/admin/amazon` | `GET /api/admin/amazon?${params}`, `POST /api/admin/amazon/scan` | ScoreBadge, Card, Table, Input, Badge, Skeleton |
| 5 | `/admin/shopify` | `POST /api/admin/shopify/scan`, `GET /api/admin/products?platform=shopify&${params}`, `GET /api/admin/competitors` | ScoreBadge, Card, Tabs, Table, Badge, Skeleton |
| 6 | `/admin/pinterest` | `GET /api/admin/pinterest?${params}` (via PlatformProducts), `GET /api/admin/dashboard` (provider status) | PlatformProducts |
| 7 | `/admin/digital` | `GET /api/admin/digital?${params}` (via PlatformProducts), `GET /api/admin/dashboard` (provider status) | PlatformProducts |
| 8 | `/admin/pod` | `GET /api/admin/products?channel=pod` (raw fetch), `POST /api/admin/scan` (raw fetch) | lucide icons only |
| 9 | `/admin/scan` | `GET /api/admin/clients`, `GET /api/admin/scan`, `POST /api/admin/scan`, `GET /api/admin/scan?jobId=${id}`, `DELETE /api/admin/scan?jobId=${id}` | EnginePageLayout |
| 10 | `/admin/trends` | `GET /api/admin/trends`, `POST /api/admin/trends` | EnginePageLayout, ScoreBadge, Card, Table, Dialog, Input, Label, Badge, Skeleton |
| 11 | `/admin/clients` | `GET /api/admin/clients`, `POST /api/admin/clients`, `PUT /api/admin/clients`, `DELETE /api/admin/clients?id=${id}` | Card, Table, Dialog, Input, Label, Badge, Skeleton |
| 12 | `/admin/allocate` | `GET /api/admin/allocations`, `GET /api/admin/products?limit=50&sort=final_score&order=desc`, `GET /api/admin/clients`, `POST /api/admin/allocations`, `PATCH /api/admin/allocations/requests` | Card, Badge, Skeleton |
| 13 | `/admin/influencers` | `GET /api/admin/influencers?${params}`, `POST /api/admin/influencers`, `GET /api/admin/products?sort=final_score&order=desc&limit=50`, `POST /api/admin/influencers/invite` | EnginePageLayout, Card, Table, Dialog, Input, Label, Badge, Skeleton |
| 14 | `/admin/suppliers` | `GET /api/admin/suppliers`, `POST /api/admin/suppliers` | EnginePageLayout, Card, Table, Dialog, Input, Label, Badge, Skeleton, Switch |
| 15 | `/admin/competitors` | `GET /api/admin/competitors`, `POST /api/admin/competitors` | EnginePageLayout, Card, Table, Dialog, Input, Label, Badge, Skeleton |
| 16 | `/admin/clusters` | `GET /api/admin/clusters`, `POST /api/admin/clusters` | EnginePageLayout, ScoreBadge, Card, Table, Badge, Skeleton |
| 17 | `/admin/creator-matches` | `GET /api/admin/creator-matches`, `POST /api/admin/creator-matches` | EnginePageLayout, ScoreBadge, Card, Table, Badge, Skeleton |
| 18 | `/admin/ads` | `GET /api/admin/ads?${params}`, `POST /api/admin/ads` | EnginePageLayout, Card, Table, Input, Badge, Skeleton |
| 19 | `/admin/blueprints` | `GET /api/admin/blueprints`, `window.open("/api/admin/blueprints/${id}/pdf")` | ScoreBadge, Card, Badge, Skeleton |
| 20 | `/admin/content` | `GET /api/admin/content?${params}`, `PATCH /api/admin/content` | Card, Table, Badge, Skeleton |
| 21 | `/admin/automation` | `GET /api/admin/automation`, `PATCH /api/admin/automation` (status toggle + killSwitch) | lucide icons, toast |
| 22 | `/admin/settings` | `GET /api/admin/settings`, `POST /api/admin/settings`, `GET /api/admin/automation`, `PATCH /api/admin/automation` (status toggle + killSwitch) | Card, Tabs, Badge, Skeleton, Switch, Button, Input |
| 23 | `/admin/import` | `POST /api/admin/import` (FormData) | Card, Button, Badge |
| 24 | `/admin/notifications` | `GET /api/admin/notifications`, `PATCH /api/admin/notifications` | Card, Badge, Skeleton |
| 25 | `/admin/analytics` | `GET /api/admin/analytics` | recharts (BarChart, PieChart, LineChart, RadarChart) |
| 26 | `/admin/governor` | `GET /api/admin/governor/fleet`, `GET /api/admin/governor/clients`, `GET /api/admin/governor/analytics?days=30`, `GET /api/admin/governor/decisions?pending=true` | lucide icons |
| 27 | `/admin/governor/budgets` | `GET /api/admin/governor/clients`, `POST /api/admin/governor/clients` (reset_period, adjust_budget) | lucide icons |
| 28 | `/admin/governor/decisions` | `GET /api/admin/governor/decisions`, `POST /api/admin/governor/decisions` (approve/dismiss/revert) | lucide icons |
| 29 | `/admin/governor/swaps` | `GET /api/admin/governor/swaps`, `POST /api/admin/governor/swaps` (create/revert), `GET /api/admin/governor/external-engines` | lucide icons |
| 29b | `/admin/governor/engines` | `GET /api/admin/governor/external-engines`, `POST /api/admin/governor/external-engines`, `DELETE /api/admin/governor/external-engines?id=`, `POST /api/admin/governor/external-engines/test`, `POST /api/admin/governor/swaps` (quick-swap) | lucide icons |
| 30 | `/admin/monitoring` | `GET /api/admin/monitoring` (raw fetch) | Card, Badge |
| 31 | `/admin/affiliates` | **NONE** (navigation-only page) | lucide icons |
| 32 | `/admin/affiliates/commissions` | `GET /api/admin/affiliates/commissions` (raw fetch), `PATCH /api/admin/affiliates/commissions` (raw fetch) | lucide icons |
| 33 | `/admin/affiliates/ai` | `GET /api/admin/affiliates?type=ai` (via PlatformProducts), `GET /api/admin/dashboard` | PlatformProducts |
| 34 | `/admin/affiliates/physical` | `GET /api/admin/affiliates?type=physical` (via PlatformProducts), `GET /api/admin/dashboard` | PlatformProducts |
| 35 | `/admin/setup` | `GET /api/admin/dashboard`, `GET /api/admin/settings` | lucide icons |
| 36 | `/admin/login` | **NONE** (Supabase Auth client-side) | — |
| 37 | `/admin/unauthorized` | **NONE** (static page) | — |
| 38 | `/admin/chatbot` | `GET /api/admin/chatbot`, `POST /api/admin/chatbot`, `PATCH /api/admin/chatbot`, `DELETE /api/admin/chatbot` | EnginePageLayout, Card, Table, Badge, Skeleton |
| 39 | `/admin/fraud` | `GET /api/admin/fraud`, `POST /api/admin/fraud`, `PATCH /api/admin/fraud`, `DELETE /api/admin/fraud` | EnginePageLayout, Card, Table, Badge, Skeleton |
| 40 | `/admin/pricing` | `GET /api/admin/pricing`, `POST /api/admin/pricing`, `PATCH /api/admin/pricing`, `DELETE /api/admin/pricing` | EnginePageLayout, Card, Table, Badge, Skeleton |
| 41 | `/admin/forecasting` | `GET /api/admin/forecasting`, `POST /api/admin/forecasting`, `PATCH /api/admin/forecasting` | EnginePageLayout, Card, Table, Badge, Skeleton |
| 42 | `/admin/smart-ux` | `GET /api/admin/smart-ux`, `POST /api/admin/smart-ux`, `PATCH /api/admin/smart-ux`, `DELETE /api/admin/smart-ux` | EnginePageLayout, Card, Table, Tabs, Badge, Skeleton |

**Note:** `/admin/scoring` page does **NOT** exist in the codebase.

### 2B. Client Dashboard Pages (9 pages)

| # | UI Page | Exact API Routes Called | Components Used | Engine Gate |
|---|---|---|---|---|
| 1 | `/dashboard` (home) | `GET /api/dashboard/products`, `GET /api/dashboard/requests`, `POST /api/dashboard/requests` | — (raw HTML) | None |
| 2 | `/dashboard/products` | `GET /api/dashboard/products` | ScoreBadge, Card, Badge, Button, Skeleton | None |
| 3 | `/dashboard/products/[id]` | `GET /api/dashboard/products?id=${id}` (raw fetch), `GET /api/dashboard/content?product_id=${id}` (raw fetch) | — (raw HTML) | None |
| 4 | `/dashboard/content` | `GET /api/dashboard/content`, `GET /api/dashboard/products`, `POST /api/dashboard/content/generate` | Card, Button, Badge, EngineGate | `engine="content"` |
| 5 | `/dashboard/orders` | `GET /api/dashboard/orders` | Card, Badge, Button, Input, Table, EngineGate | `engine="store_integration"` |
| 6 | `/dashboard/requests` | `GET /api/dashboard/requests`, `POST /api/dashboard/requests` | Card, Badge, Button, Input, Label, Skeleton, Table | None |
| 7 | `/dashboard/billing` | `GET /api/dashboard/subscription`, `POST /api/dashboard/subscription`, `POST /api/dashboard/subscription/portal` | Card, Button, Badge | None |
| 8 | `/dashboard/integrations` | `GET /api/dashboard/channels`, `POST /api/dashboard/channels/connect`, `POST /api/dashboard/channels/disconnect` | Card, Button, Badge, Input, EngineGate | `engine="store_integration"` |
| 9 | `/dashboard/affiliate` | `GET /api/dashboard/affiliate/referral` (raw fetch) | — (raw HTML) | None |

### 2C. API Routes NOT Called by Any UI Page (Backend/Internal Only)

These routes exist in `src/app/api/` but are **never called** from any `page.tsx`:

| API Route | Purpose | Called By |
|---|---|---|
| `/api/admin/revenue` | MRR, ARR, churn analytics | Not called from UI |
| `/api/admin/analytics/funnel` | Funnel metrics (discovered→deployed) | Not called from UI |
| `/api/admin/opportunities` | Opportunity feed builder | Not called from UI |
| `/api/admin/alerts` | System alerts management | Not called from UI |
| `/api/admin/debug` | Full system diagnostics | Not called from UI |
| `/api/admin/e2e` | E2E readiness check | Not called from UI |
| `/api/admin/scan/health` | Scan subsystem health | Not called from UI (referenced in error message only) |
| `/api/admin/engines/health` | Engine dependency health | Not called from UI |
| `/api/admin/setup/migrate` | Create missing tables | Not called from UI |
| `/api/admin/financial` | Financial model CRUD | Not called from UI (no `/admin/financial` page exists) |
| `/api/admin/governor/overrides` | Super-admin bypass management | Not called from UI |
| `/api/admin/products/push` | Push product to store | Not called from admin UI (called from dashboard components) |
| All `/api/engine/*` routes (18) | Backend engine proxies | Called by Railway backend workers only |
| All `/api/webhooks/*` routes (3) | External webhook handlers | Called by Resend, Printful, Amazon |
| `/api/health` | Liveness check | External monitoring only |
| `/api/dashboard/content/batch` | Batch content generation | Not verified — may be called from component |
| `/api/dashboard/content/schedule` | Schedule content | Not verified — may be called from component |
| `/api/dashboard/shop/push` | Push product to store | Called from PushProductModal component |
| `/api/dashboard/shop/push-batch` | Batch push products | Called from BatchPushModal component |
| `/api/dashboard/engines` | Engine toggles | Not verified — may be called from integrations page |
| `/api/dashboard/analytics` | Client analytics | Not called from any dashboard page |

### 2D. Auth Routes (`/api/auth/*`)

| # | API Route | Methods | UI Flow |
|---|---|---|---|
| 1 | `/api/auth/callback` | GET | Post-login redirect (code exchange → route to `/admin` or `/dashboard`) |
| 2 | `/api/auth/signout` | POST | Layout logout buttons |
| 3 | `/api/auth/oauth/callback` | GET | Store OAuth token exchange (Shopify/TikTok/Amazon) |
| 4 | `/api/auth/oauth/woocommerce` | GET, POST | WooCommerce REST API key connection |
| 5 | `/api/auth/oauth/bigcommerce` | GET, POST | BigCommerce OAuth2 code exchange |
| 6 | `/api/auth/oauth/etsy` | GET, POST | Etsy OAuth2 PKCE flow |

---

## Section 3 — Edge Functions → UI Features

### Status: No Edge Functions Exist

- No `supabase/functions/` directory exists
- No Deno references in any source file
- No `supabase.functions.invoke()` calls anywhere
- All server-side work runs via Next.js API routes (Netlify) + Express backend (Railway)

---

## Section 4 — Real-Time Subscriptions per Page

### Active Subscriptions (Verified from Source)

**Only 1 real-time subscription exists** in the entire codebase:

| Page | Channel Name | Tables | Events | Debounce | File:Line |
|---|---|---|---|---|---|
| `/admin` (dashboard) | `dashboard-realtime` | `products`, `scan_history` | `postgres_changes` (`*` = all events) | 2 seconds | `src/app/admin/page.tsx:210` |

**How it works:**
1. Opens Supabase Realtime channel `dashboard-realtime`
2. Subscribes to ALL postgres changes on `products` and `scan_history`
3. On any change, 2-second debounce fires
4. After debounce, re-fetches all dashboard KPIs from `GET /api/admin/dashboard`
5. Channel cleaned up on page unmount

### All Other Pages: No Real-Time

Every other page uses manual refresh or page navigation to update data. No polling, no SWR, no additional realtime channels.

### Realtime Publication Note

No explicit `ALTER PUBLICATION supabase_realtime ADD TABLE ...` found in any of the 37 migration files. Realtime works because Supabase enables it on all tables by default in newer projects.

---

## Section 5 — Auth & RLS Flow

### 5.1 Authentication Architecture

```
Browser → Supabase Auth (JWT) → Middleware → API Route

MIDDLEWARE (src/middleware.ts):
  1. Rate limit: 60 req/min per IP (API routes)
  2. Supabase getUser() from JWT cookie
  3. Subdomain routing:
     • admin.yousell.online → /admin/* only
     • yousell.online → /dashboard/* only
  4. Role check via RPC check_user_role():
     • /admin/* → requires admin or super_admin
     • /dashboard/* → requires client
  5. Security headers (HSTS, X-Frame-Options, XSS-Protection, etc.)
  6. Cookie domain: .yousell.online (shared across subdomains)
```

### 5.2 Role-Based Access Control

| Role | Can Access | Middleware Check | API Auth Function |
|---|---|---|---|
| `super_admin` | All `/admin/*` pages + admin API routes | `check_user_role()` RPC | `requireAdmin()` (`src/lib/auth/roles.ts`) |
| `admin` | All `/admin/*` pages + admin API routes | `check_user_role()` RPC | `requireAdmin()` (`src/lib/auth/roles.ts`) |
| `client` | All `/dashboard/*` pages + dashboard API routes | `check_user_role()` RPC | `authenticateClient()` or `authenticateClientLite()` (`src/lib/auth/client-api-auth.ts`) |
| No role | Public pages only (`/`, `/login`, `/signup`, `/pricing`, `/terms`, `/privacy`) | Redirected to `/login` | N/A |

### 5.3 API Auth Patterns (3 Tiers)

**Tier 1 — Admin** (`/api/admin/*`): Server-side Supabase session → `requireAdmin()` checks role = admin|super_admin

**Tier 2 — Client** (`/api/dashboard/*`): Bearer token from `Authorization` header → `authenticateClient()` resolves clientId + subscription tier. Lightweight variant: `authenticateClientLite()` (no subscription lookup).

**Tier 3 — Engine** (`/api/engine/*`): No explicit auth — called by backend workers via internal network.

### 5.4 Engine Gating (Client Dashboard)

Three dashboard pages gate features behind subscription engines:
```
/dashboard/content      → EngineGate engine="content"
/dashboard/orders       → EngineGate engine="store_integration"
/dashboard/integrations → EngineGate engine="store_integration"
```

Engine access checked per-request: `requireEngine(auth, engineName)` throws if engine not in plan.

### 5.5 RLS Policies (from 37 migration files)

| Policy Scope | Tables | Rule |
|---|---|---|
| **Admin full access** | ALL tables | `role IN ('admin', 'super_admin')` → full CRUD |
| **Client read own** | `product_allocations`, `product_requests`, `content_queue`, `orders`, `connected_channels`, `content_credits`, `shop_products`, `subscriptions`, `affiliate_referrals`, `affiliate_commissions`, `notifications` | `client_id` match or `email` match |
| **Client product visibility** | `product_allocations` | Only `visible_to_client = true` rows |
| **Service role bypass** | ALL tables | Backend workers use `SUPABASE_SERVICE_ROLE_KEY` |
| **Anonymous** | ALL tables | Zero access |
| **System alerts** | `system_alerts` | Service role only (no authenticated access) |
| **Governor overrides** | `governor_overrides` | `super_admin` only |
| **Public config** | `platform_config`, `engine_cost_manifests`, `plan_engine_allowances` | All authenticated can read |

### 5.6 Auth Inconsistencies Found During Verification

| Page | Issue |
|---|---|
| `/admin/pod` | Uses raw `fetch()` instead of `authFetch()` |
| `/admin/monitoring` | Uses raw `fetch()` instead of `authFetch()` |
| `/admin/affiliates/commissions` | Uses raw `fetch()` instead of `authFetch()` |
| `/dashboard/products/[id]` | Uses raw `fetch()` instead of `authFetch()` |
| `/dashboard/affiliate` | Uses raw `fetch()` instead of `authFetch()` |
