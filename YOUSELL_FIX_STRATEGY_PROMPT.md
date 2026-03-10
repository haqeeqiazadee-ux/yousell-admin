# YouSell Admin — Fix Strategy Prompt

Use this prompt with Claude Code to systematically fix all 33 issues from the QA audit.

---

## PROMPT

You are tasked with fixing all issues identified in the YouSell Admin QA audit report (`YOUSELL_QA_FINAL_REPORT.md`). The codebase is a Next.js 14 + Supabase admin platform for product discovery and client management.

**Read `YOUSELL_QA_FINAL_REPORT.md` first**, then execute the following fix phases in order. Each phase groups issues that share code paths to minimize conflicts. After each phase, run `npm run build` to verify zero TypeScript errors. Commit after each phase.

---

### PHASE 1: Security Hardening (P0-4, P1-6, P1-9)

**Goal:** Eliminate the most dangerous vulnerabilities before touching any logic.

1. **P0-4 — Service role key guard:**
   - Install `server-only` package: `npm install server-only`
   - Add `import 'server-only'` as the FIRST line of:
     - `src/lib/supabase.ts`
     - `src/lib/supabase/admin.ts`
   - Verify no client component imports these files (search for imports)

2. **P1-6 — Admin API role checks:**
   - Open `src/lib/auth/roles.ts` — confirm `isAdmin()` and `requireAdmin()` exist
   - For each of these 20 routes, add `await requireAdmin()` at the top of every handler (GET, POST, PUT, PATCH, DELETE):
     ```
     src/app/api/admin/products/route.ts
     src/app/api/admin/clients/route.ts
     src/app/api/admin/allocations/route.ts
     src/app/api/admin/influencers/route.ts
     src/app/api/admin/suppliers/route.ts
     src/app/api/admin/competitors/route.ts
     src/app/api/admin/blueprints/route.ts
     src/app/api/admin/trends/route.ts
     src/app/api/admin/scoring/route.ts
     src/app/api/admin/automation/route.ts
     src/app/api/admin/financial/route.ts
     src/app/api/admin/notifications/route.ts
     src/app/api/admin/import/route.ts
     src/app/api/admin/tiktok/route.ts
     src/app/api/admin/amazon/route.ts
     src/app/api/admin/pinterest/route.ts
     src/app/api/admin/digital/route.ts
     src/app/api/admin/affiliates/route.ts
     ```
   - Pattern: wrap each handler to return 403 if not admin:
     ```ts
     import { requireAdmin } from '@/lib/auth/roles'

     export async function GET() {
       try { await requireAdmin() } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
       // ... existing logic
     }
     ```
   - Do NOT touch `/api/admin/scan` or `/api/admin/settings` (already have checks)

3. **P1-9 — Scrub real Supabase URL:**
   - In `.env.local.example`, replace `gqrwienipczrejscqdhk.supabase.co` with `your-project-id.supabase.co`

**Verify:** `npm run build` passes. Commit: `fix(security): add server-only guards, admin role checks on 20 API routes, scrub env example`

---

### PHASE 2: Scoring System Unification (P0-1, P0-6, P2-1, P2-5, P2-8)

**Goal:** Make all tier thresholds, naming, and scoring formulas consistent across frontend and backend.

1. **P0-1 — Unify tier thresholds and naming:**
   - **`src/lib/types/product.ts`:** Change `TierBadge` type from `'hot' | 'warm' | 'watch' | 'cold'` to `'HOT' | 'WARM' | 'WATCH' | 'COLD'`. Update `getTierBadge()` thresholds to 80/60/40 and return uppercase values.
   - **`src/lib/scoring/composite.ts`:** Update `getTierFromScore()`: `>=80 → 'HOT'`, `>=60 → 'WARM'`, `>=40 → 'WATCH'`, `<40 → 'COLD'`. Update `getStageFromViralScore()` to use same 80/60/40 thresholds.
   - **`src/components/score-badge.tsx`:** Update `getTier()` to use 80/60/40 thresholds. Rename tiers from `RISING/EMERGING/SATURATED` to `WARM/WATCH/COLD`. Update badge colors to match new naming.
   - **`src/components/product-card.tsx`:** Verify gauge color thresholds already use 80/60/40 (they do). Update any tier label references to match new naming.
   - **`src/components/platform-products.tsx`:** Change from `score_overall` to `final_score ?? score_overall` for backwards compatibility.
   - Search the entire codebase for any other references to the old tier names (`RISING`, `EMERGING`, `SATURATED`, `warm`, `watch`, `cold`) and update them.

2. **P0-6 — Update backend worker scoring:**
   - **`backend/src/lib/scoring.ts`:** Replace the legacy `calculateCompositeScore` with the 3-pillar system:
     ```ts
     // Calculate individual scores
     const trendScore = calculateTrendScore(inputs)
     const viralScore = calculateViralScore(inputs)
     const profitScore = calculateProfitScore(inputs)
     // Final = Trend(0.40) + Viral(0.35) + Profit(0.25)
     const finalScore = Math.round(trendScore * 0.40 + viralScore * 0.35 + profitScore * 0.25)
     ```
   - **`backend/src/worker.ts`:** Update the upsert to populate ALL score columns:
     ```ts
     final_score: scores.finalScore,
     trend_score: scores.trendScore,
     viral_score: scores.viralScore,
     profit_score: scores.profitScore,
     overall_score: scores.finalScore, // backwards compat
     ```
   - Copy the `calculateTrendScore`, `calculateViralScore`, `calculateProfitScore`, `calculateFinalScore`, `shouldRejectProduct`, and `getTierFromScore` functions from `src/lib/scoring/composite.ts` into `backend/src/lib/scoring.ts`, replacing the legacy versions.
   - Update tier thresholds in backend scoring to match the unified 80/60/40.

3. **P2-8 — Note:** Full deduplication (shared package) is a NEXT SPRINT task. For now, ensure both copies are IDENTICAL after the above changes.

**Verify:** `npm run build` passes. `cd backend && npx tsc --noEmit` passes. Commit: `fix(scoring): unify tier thresholds to 80/60/40, update backend to 3-pillar scoring`

---

### PHASE 3: Navigation & Layout (P0-3, P1-2, P1-7, P2-6)

**Goal:** Make the admin panel actually navigable.

1. **P0-3 — Wire sidebar into layout:**
   - **`src/app/admin/layout.tsx`:** Import `AdminSidebar` and restructure to:
     ```tsx
     <div className="flex min-h-screen">
       <AdminSidebar />
       <main className="flex-1 overflow-auto">
         {children}
       </main>
     </div>
     ```
   - Remove any duplicate top-bar that layout currently renders (since sidebar has user info + sign-out).

2. **P1-2 — Fix middleware redirect:**
   - **`src/middleware.ts`:** Find the line that redirects authenticated non-admin users to `/admin/login` and change it to `/admin/unauthorized`.
   - The unauthorized page already exists at `src/app/admin/unauthorized/page.tsx` — no new page needed.

3. **P1-7 + P2-6 — Remove duplicate layout wrappers:**
   - **`src/app/admin/page.tsx`:** Remove the `min-h-screen bg-gray-50` outer wrapper and any top bar that duplicates layout chrome. The page should start directly with its content (KPI cards, alert strip, etc.).
   - **`src/app/admin/scan/page.tsx`:** Same — remove the duplicate `min-h-screen bg-gray-50` wrapper and header bar.
   - Verify both pages render correctly within the new sidebar layout.

**Verify:** `npm run build` passes. Commit: `fix(layout): wire admin sidebar, fix middleware redirect, remove duplicate layout wrappers`

---

### PHASE 4: Client Dashboard Fix (P0-5, P2-9)

**Goal:** Make the client-facing dashboard functional.

1. **P0-5 — Fix client ID mismatch:**
   - **`src/app/dashboard/page.tsx`:** Before querying `product_allocations`, look up the client record:
     ```ts
     const { data: client } = await supabase
       .from('clients')
       .select('id')
       .eq('email', user.email)
       .single()

     if (!client) {
       // Show "no client profile" state
       return
     }
     ```
     Then use `client.id` (not `user.id`) for all queries.
   - Apply the same fix to `product_requests` insert — use `client.id`.
   - Check `src/app/api/dashboard/products/route.ts` and `src/app/api/dashboard/requests/route.ts` for the same issue (they may already use email-based lookup — verify).

2. **P2-9 — Configure next/image external domains:**
   - **`next.config.mjs`:** Add image configuration:
     ```js
     const nextConfig = {
       images: {
         remotePatterns: [
           { protocol: 'https', hostname: '**.picsum.photos' },
           { protocol: 'https', hostname: '**.alicdn.com' },
           { protocol: 'https', hostname: '**.tiktokcdn.com' },
           { protocol: 'https', hostname: '**.shopify.com' },
           { protocol: 'https', hostname: '**.pinimg.com' },
           { protocol: 'https', hostname: '**.amazonaws.com' },
         ],
       },
     }
     ```

**Verify:** `npm run build` passes. Commit: `fix(dashboard): fix client ID lookup, configure next/image remote patterns`

---

### PHASE 5: ESLint & CI Fix (P0-2)

**Goal:** Restore linting capability.

1. **P0-2 — Fix ESLint:**
   - Check the current ESLint version: `npx eslint --version`
   - **Option A (Recommended — Downgrade):** If the codebase uses `.eslintrc*` config:
     ```bash
     npm install eslint@^9.0.0 --save-dev
     ```
   - **Option B (Migrate):** If you prefer v10, convert `.eslintrc*` to `eslint.config.mjs` flat config format. This requires more changes.
   - After fix, run `npm run lint` and fix any lint errors that surface.

**Verify:** `npm run lint` passes (or only has warnings, not config errors). Commit: `fix(toolchain): fix ESLint config compatibility`

---

### PHASE 6: Database & Migration Cleanup (P1-10, P2-10)

**Goal:** Fix migration ordering issues and currency default.

1. **P1-10 — Fix duplicate migration numbering:**
   - Rename migration files to have unique, sequential numbers:
     - `001_initial_schema.sql` → keep as `001`
     - `001_profiles_and_rbac.sql` → rename to `001b_profiles_and_rbac.sql`
     - `002_seed_admin.sql` → keep as `002`
     - `002_trend_keywords.sql` → rename to `002b_trend_keywords.sql`
   - Create a placeholder `006_placeholder.sql` with a comment explaining it was missing, OR renumber 007/008 down.
   - **Note:** Since `CONSOLIDATED_MIGRATION.sql` exists and is the recommended path, this is mostly for documentation hygiene.

2. **P2-10 — Fix default currency:**
   - In `supabase/migrations/003_products.sql`, change `DEFAULT 'GBP'` to `DEFAULT 'USD'`.
   - In `CONSOLIDATED_MIGRATION.sql`, make the same change.
   - In `src/lib/types/product.ts`, if there's a default currency constant, update it to `'USD'`.

**Verify:** Migrations have no duplicate filenames. Commit: `fix(db): fix migration numbering, change default currency to USD`

---

### PHASE 7: Remaining P1 Polish (P1-3, P1-4, P1-5)

**Goal:** Address high-priority functional gaps.

1. **P1-5 — Add client selector to scan page:**
   - **`src/app/admin/scan/page.tsx`:** When "Client" scan mode is selected, show a dropdown of clients fetched from `/api/admin/clients`. Pass the selected `clientId` in the scan request body.

2. **P1-4 — Influencer page enhancements:**
   - Add conversion score display using `calculateInfluencerConversionScore()` from `composite.ts`
   - Add a visual indicator for fake follower risk (flag icon when `engagement_rate / followers` ratio is suspicious)
   - Add sort controls for engagement rate and follower count

3. **P1-3 — Analytics stub page:**
   - Create a minimal `src/app/admin/analytics/page.tsx` with a "Coming Soon" placeholder that fits the admin layout. This acknowledges the gap without over-engineering.

**Verify:** `npm run build` passes. Commit: `feat(admin): add client selector to scan, enhance influencer page, add analytics stub`

---

### PHASE 8: P2 Fixes (P2-2, P2-3, P2-4, P2-7)

**Goal:** Improve UX on existing pages.

1. **P2-2 — Product edit/delete:**
   - Add edit and delete buttons to the product table rows in `src/app/admin/products/page.tsx`
   - Edit opens a modal pre-filled with product data, saves via PATCH to `/api/admin/products`
   - Delete shows confirmation dialog, then DELETEs via `/api/admin/products?id=...`

2. **P2-3 — Pagination:**
   - Add pagination controls (Previous/Next + page indicator) to:
     - `src/app/admin/products/page.tsx`
     - `src/app/admin/influencers/page.tsx`
   - Use `limit` and `offset` query params (APIs already support `limit`)

3. **P2-4 — Note:** Excel import is BACKLOG. Skip for now.

4. **P2-7 — Note:** The `DialogTrigger` render prop is non-standard but functional. Skip unless it causes actual runtime errors.

**Verify:** `npm run build` passes. Commit: `feat(admin): add product CRUD, pagination on products and influencers`

---

## EXECUTION RULES

1. **Read before edit.** Always read a file before modifying it.
2. **Build after each phase.** Run `npm run build` and fix any TypeScript errors before committing.
3. **One commit per phase.** Use descriptive commit messages as specified above.
4. **Don't over-engineer.** Fix exactly what's described. No bonus refactoring.
5. **Preserve existing patterns.** Match the coding style of surrounding code (Tailwind classes, shadcn/ui components, Supabase query patterns).
6. **Search for ripple effects.** After changing a type or function signature, grep for all callers and update them.
7. **Skip P3 issues.** They are informational. Don't fix them unless they block a higher-priority fix.

## EXPECTED OUTCOME

After all 8 phases:
- 0 P0 issues remaining
- 0 P1 issues remaining (except P1-3 analytics which gets a stub)
- P2 issues reduced from 10 to ~4 (deferred: Excel import, code dedup, currency migration on live DB)
- `npm run build` passes
- `npm run lint` passes
- Spec compliance rises from ~78% to ~92%
