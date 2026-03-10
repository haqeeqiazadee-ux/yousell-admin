# YouSell Admin — Task Board

Last updated: 2026-03-10

## Priority Legend
- P0 = Critical (blocks core functionality)
- P1 = High (major spec deviation)
- P2 = Medium (functional gap)
- P3 = Low (minor/cosmetic)

---

## IMMEDIATE (P0 — Blocking)

### TASK-001: Unify scoring tier thresholds
- **Status**: TODO
- **Priority**: P0
- **Files**: `src/lib/scoring/composite.ts`, `src/components/score-badge.tsx`, `src/lib/types/product.ts`, `src/components/product-card.tsx`
- **Action**: Ensure all files use HOT >= 80, WARM >= 60, WATCH >= 40, COLD < 40
- **Note**: score-badge.tsx and composite.ts:getTierFromScore already use 80/60/40. product.ts:getTierBadge also uses 80/60/40. Need to verify product-card.tsx.

### TASK-002: Update backend worker to 3-pillar scoring
- **Status**: TODO
- **Priority**: P0
- **Files**: `backend/src/worker.ts`
- **Action**: Replace legacy `calculateCompositeScore()` with `calculateFinalScore(trend, viral, profit)`. Populate `final_score`, `trend_score`, `profit_score` columns.

### TASK-003: Add admin role check to all admin API routes
- **Status**: TODO
- **Priority**: P0
- **Files**: 20 route files in `src/app/api/admin/`
- **Action**: Add `requireAdmin()` check to all route handlers.

### TASK-004: Fix client dashboard ID mismatch
- **Status**: POSSIBLY FIXED
- **Priority**: P0
- **Files**: `src/app/dashboard/page.tsx`
- **Action**: Look up client by email first, then use `client.id` for allocation queries.
- **Note**: Commit `50400a8` mentions "fix client ID lookup via email join" — verify.

### TASK-005: Build Apify integration and sync pipeline
- **Status**: TODO
- **Priority**: P0
- **Files**: NEW — `backend/src/lib/apify-client.ts`, `backend/src/lib/sync-listings.ts`, `backend/src/lib/transform-listing.ts`
- **Action**: Create actual Apify SDK client, data normalization layer, and sync script.

---

## HIGH PRIORITY (P1)

### TASK-006: Fix middleware non-admin redirect
- **Status**: TODO
- **Priority**: P1
- **File**: `src/middleware.ts`
- **Action**: Redirect non-admin authenticated users to `/admin/unauthorized` instead of `/admin/login`.

### TASK-007: Replace provider placeholder URLs with Apify actors
- **Status**: TODO
- **Priority**: P1
- **Files**: `src/lib/providers/tiktok.ts`, `amazon.ts`, `shopify.ts`, `pinterest.ts`
- **Action**: Replace hardcoded API URLs with Apify actor calls using `APIFY_API_TOKEN`.

### TASK-008: Remove duplicate layout wrappers
- **Status**: TODO
- **Priority**: P1
- **Files**: `src/app/admin/page.tsx`, `src/app/admin/scan/page.tsx`
- **Action**: Remove `min-h-screen bg-gray-50` and header bar that duplicate layout.tsx chrome.

### TASK-009: Fix .env.local.example real Supabase URL
- **Status**: TODO
- **Priority**: P1
- **File**: `.env.local.example`
- **Action**: Replace real Supabase project URL with placeholder.

---

## MEDIUM PRIORITY (P2)

### TASK-010: Add pagination to list views
- **Status**: TODO
- **Priority**: P2
- **Files**: `src/app/admin/products/page.tsx`, `src/app/admin/influencers/page.tsx`

### TASK-011: Add analytics dashboard page
- **Status**: TODO
- **Priority**: P2
- **File**: `src/app/admin/analytics/page.tsx`

### TASK-012: Add scheduler for periodic sync jobs
- **Status**: TODO
- **Priority**: P2
- **File**: NEW — `backend/src/scheduler.ts`

### TASK-013: Fix CSV import quoted field parsing
- **Status**: TODO
- **Priority**: P2
- **File**: `src/app/api/admin/import/route.ts`

### TASK-014: Change default currency from GBP to USD
- **Status**: POSSIBLY FIXED
- **Priority**: P2
- **Note**: Commit `ee5e299` mentions "change GBP default to USD" — verify.

---

## COMPLETED TASKS

- [x] Wire admin sidebar into layout (commit `1d39f36`)
- [x] Fix auth SSR cookie reading (commit `60229d1`)
- [x] Add product edit/delete (commit `5a135e5`)
- [x] Add scan client selector (commit `9c1fc70`)
- [x] Fix migration numbering (commit `ee5e299`)
- [x] Downgrade ESLint to v8 (commit `c89c517`)
- [x] Fix client dashboard ID via email join (commit `50400a8`)
- [x] Configure next/image remote patterns (commit `50400a8`)
- [x] Fix middleware redirect, remove duplicate chrome (commit `1d39f36`)
- [x] Resolve 29 QA bugs (commit `55ba7d0`)
