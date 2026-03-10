# YouSell Admin — Redesign & Bug Fix Plan

## Current State (Problems)

1. **User has "viewer" role** — `admin@yousell.online` shows as "viewer" in sidebar footer. All API routes that call `requireAdmin()` return 403. Settings page, dashboard API, etc. are all blocked.

2. **Login page shows sidebar** — Already fixed (redirect if authenticated).

3. **Dashboard is static/broken** — System Status hardcodes "Not Configured" because the `/api/admin/dashboard` returns 403 (viewer role). Even if it worked, the dashboard shows scan controls that don't function without API keys.

4. **No onboarding flow** — First-time admin lands on a dashboard full of zeros and "Not Configured" badges. No guidance on what to do first.

5. **Settings page requires admin role** — The settings API checks `role === 'admin'`, but the user is "viewer". Chicken-and-egg problem.

6. **19 API providers listed but 0 configured** — The `.env.local.example` lists 30+ env vars. Most aren't set on Netlify.

---

## Redesign Plan

### Phase 1: Fix Auth (Critical)

- **Fix the profile role** — The `handle_new_user()` trigger sets role to `'client'` by default. The user's profile needs to be updated to `'admin'`. Provide SQL + instructions.
- **Make the setup page accessible to viewers** — So even a viewer can see configuration status (read-only).

### Phase 2: Redesign Dashboard (Smart & Contextual)

Replace the current dashboard with a **state-aware dashboard** that adapts based on system state:

**State A: Unconfigured (no API keys, no products)**
```
┌─────────────────────────────────────────────────────┐
│  Welcome to YouSell Admin                            │
│  Your e-commerce intelligence platform               │
│                                                      │
│  ┌─ Getting Started ──────────────────────────────┐  │
│  │  1. ✅ Supabase Connected                      │  │
│  │  2. ✅ Authentication Working                   │  │
│  │  3. ❌ Set up API keys (Apify, Claude, etc.)   │  │
│  │  4. ❌ Run your first scan                     │  │
│  │  5. ❌ Discover your first products            │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Quick Setup ─────┐  ┌─ Platform Overview ────┐  │
│  │ Configure APIs →  │  │ 7 channels available   │  │
│  │ Run First Scan →  │  │ 27 database tables     │  │
│  │ Add Clients →     │  │ 19 API providers       │  │
│  └───────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**State B: Configured (has API keys, has products)**
```
┌─────────────────────────────────────────────────────┐
│  Dashboard                                           │
│  ┌─ KPI Strip ────────────────────────────────────┐  │
│  │ Products │ Trends │ TikTok │ Amazon │ Hot │ ... │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Recent Products ─────┐ ┌─ Scan History ──────┐  │
│  │ (actual product list) │ │ (real scan data)    │  │
│  └───────────────────────┘ └─────────────────────┘  │
│                                                      │
│  ┌─ Active Channels ─────────────────────────────┐  │
│  │ TikTok ✅  Amazon ✅  Shopify ❌  Pinterest ❌ │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Phase 3: Fix Core Bugs

1. **Dashboard API** — Don't require admin role for basic read (authenticated is enough), OR fix the role first
2. **Settings API** — Same issue: `role !== 'admin'` returns 403
3. **Scan API** — Currently broken because no Apify token
4. **Remove "System Status" from dashboard** — Move to Settings page where it belongs
5. **Fix the env var check logic** — `CLAUDE_API_KEY` is checked but `.env.example` says `ANTHROPIC_API_KEY`

### Phase 4: Clean Up Navigation

The sidebar has 21 navigation items across 4 groups. Many pages are stubs or broken without API configuration. Keep the navigation but make empty pages show a helpful "Configure X to enable this" state instead of crashing or showing empty tables.

---

## Implementation Order

1. Fix profile role (SQL instruction for user)
2. Redesign dashboard with state-aware layout
3. Fix dashboard API route (loosen role check)
4. Fix settings API route (loosen for read-only)
5. Add empty states to channel pages
6. Commit and push
