# YouSell Admin — Execute All Fixes

**Copy everything below this line and paste it as a prompt to Claude Code.**

---

You are fixing all 33 issues identified in the YouSell Admin QA audit. This is a Next.js 14 + Supabase admin platform. The full audit report is in `YOUSELL_QA_FINAL_REPORT.md` and the fix strategy is in `YOUSELL_FIX_STRATEGY_PROMPT.md`. Read both files before starting.

Execute all 8 phases below in order. After each phase, run `npm run build` to confirm zero TypeScript errors, then commit and push. Do NOT skip phases or reorder them — later phases depend on earlier ones.

---

## PHASE 1 — Security Hardening

Fix P0-4, P1-6, P1-9. This is the highest-risk work so do it first.

**Step 1a: Prevent service role key leaking to browser (P0-4)**
- Run `npm install server-only`
- Add `import 'server-only'` as the VERY FIRST import line in both `src/lib/supabase.ts` and `src/lib/supabase/admin.ts`
- Grep the codebase to verify no `'use client'` file imports from either of these paths. If any client component imports them (directly or transitively via `src/lib/providers/cache.ts`), refactor the import chain so client components never pull in the service role client.

**Step 1b: Add admin role check to 20 unprotected API routes (P1-6)**
- Read `src/lib/auth/roles.ts` to understand the `requireAdmin()` function signature and what it throws on failure.
- For EACH of these 18 route files (some have multiple handlers — protect every exported function: GET, POST, PUT, PATCH, DELETE):
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
- Also check for nested route files like `src/app/api/admin/blueprints/[id]/pdf/route.ts` and protect those too.
- Do NOT touch `src/app/api/admin/scan/route.ts` or `src/app/api/admin/settings/route.ts` — they already have role checks.
- Pattern to add at the top of each handler:
  ```ts
  try { await requireAdmin() } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  ```
- Add the import `import { requireAdmin } from '@/lib/auth/roles'` if not already present.
- Read each file first so you know the exact structure and don't break existing logic.

**Step 1c: Scrub leaked Supabase URL from env example (P1-9)**
- In `.env.local.example`, find every occurrence of `gqrwienipczrejscqdhk.supabase.co` and replace with `your-project-id.supabase.co`.

**Verify:** Run `npm run build`. Fix any errors. Then commit:
```
fix(security): add server-only guards, admin role checks on all API routes, scrub env example
```

---

## PHASE 2 — Scoring System Unification

Fix P0-1, P0-6, P2-8. The scoring system has 3 conflicting threshold systems and 2 naming schemes. Unify everything.

**The spec-correct values are:**
- HOT >= 80, WARM >= 60, WATCH >= 40, COLD < 40
- Names: `HOT`, `WARM`, `WATCH`, `COLD` (all uppercase)
- Final Score = Trend(0.40) + Viral(0.35) + Profit(0.25)

**Step 2a: Unify frontend tier thresholds and naming (P0-1)**

Read each file, then fix:

1. `src/lib/types/product.ts`:
   - Change `TierBadge` type to `'HOT' | 'WARM' | 'WATCH' | 'COLD'`
   - Update `getTierBadge()` to use thresholds 80/60/40 and return uppercase values
   - Search for all callers of `getTierBadge()` and update any code that compares against lowercase values

2. `src/lib/scoring/composite.ts`:
   - Update `getTierFromScore()` to: `>=80 HOT, >=60 WARM, >=40 WATCH, <40 COLD`
   - Update `getStageFromViralScore()` to use same 80/60/40 thresholds with consistent stage names
   - Update `getAiInsightTier()` if it references old tier names

3. `src/components/score-badge.tsx`:
   - Update the internal `getTier()` function to use 80/60/40 thresholds
   - Change tier names from `RISING`→`WARM`, `EMERGING`→`WATCH`, `SATURATED`→`COLD`
   - Update the color mappings to use the new names (keep the same colors, just change the keys)

4. `src/components/product-card.tsx`:
   - Verify gauge thresholds already use 80/60/40 (they should). If any tier label text references old names, update it.

5. `src/components/platform-products.tsx`:
   - Change `score_overall` to `final_score ?? score_overall` in the ScoreBadge prop for backwards compatibility

6. **Ripple effect search:** Grep the ENTIRE codebase for `RISING`, `EMERGING`, `SATURATED`, `'warm'`, `'watch'`, `'cold'` (as string literals in scoring/tier contexts) and update any remaining references.

**Step 2b: Update backend to 3-pillar scoring (P0-6)**

7. Read `backend/src/lib/scoring.ts` completely. Then replace its contents with the scoring functions from `src/lib/scoring/composite.ts`, adapted for the backend:
   - Copy over: `calculateTrendScore`, `calculateViralScore`, `calculateProfitScore`, `calculateFinalScore`, `shouldRejectProduct`, `getTierFromScore` (with the corrected 80/60/40 thresholds)
   - Keep `calculateProfitability` from `src/lib/scoring/profitability.ts` (the backend still needs the simple profitability heuristic as input to the composite score)
   - Remove the legacy `calculateCompositeScore` that used 60/40 viral/profit split
   - Make sure all functions use the same signatures the worker expects, or update the worker's calls accordingly

8. Read `backend/src/worker.ts` completely. Update the product scoring and upsert:
   - Where it currently calls `calculateCompositeScore()`, replace with the 3-pillar pipeline:
     ```
     const trendScore = calculateTrendScore(...)
     const viralScore = calculateViralScore(...)
     const profitScore = calculateProfitScore(...)
     const finalScore = calculateFinalScore(trendScore, viralScore, profitScore)
     ```
   - In the Supabase upsert, add these columns:
     ```
     final_score: finalScore,
     trend_score: trendScore,
     viral_score: viralScore,
     profit_score: profitScore,
     score_overall: finalScore,  // backwards compat with legacy column
     ```
   - Update the tier assignment to use the new `getTierFromScore(finalScore)`

**Verify:** Run `npm run build`. Also run `cd backend && npx tsc --noEmit` to check backend types. Fix errors. Then commit:
```
fix(scoring): unify all tier thresholds to spec 80/60/40, update backend to 3-pillar scoring
```

---

## PHASE 3 — Navigation & Layout

Fix P0-3, P1-2, P1-7, P2-6. The admin panel is currently unnavigable.

**Step 3a: Wire sidebar into admin layout (P0-3)**
- Read `src/app/admin/layout.tsx` and `src/components/admin-sidebar.tsx`
- Restructure `layout.tsx` to:
  - Import `AdminSidebar`
  - Use a flex layout: sidebar on left, main content on right
  - Remove any top bar that duplicates what the sidebar already provides (user info, sign-out)
  - Keep the `UserProvider` and `ThemeProvider` wrappers
  - The sidebar should be full-height, the main content area should be `flex-1 overflow-auto`

**Step 3b: Fix middleware redirect for non-admin users (P1-2)**
- Read `src/middleware.ts`
- Find where authenticated non-admin users are redirected to `/admin/login`
- Change that specific redirect to `/admin/unauthorized`
- Keep the unauthenticated → `/admin/login` redirect as-is
- The page `src/app/admin/unauthorized/page.tsx` already exists, no need to create it

**Step 3c: Remove duplicate layout wrappers from pages (P1-7, P2-6)**
- Read `src/app/admin/page.tsx` (the dashboard). Find and remove:
  - The outer `min-h-screen bg-gray-50` wrapper div
  - Any header/top bar that shows user email, role badge, or sign-out (the sidebar handles this now)
  - Keep ALL the actual dashboard content (KPI cards, alert strip, scan controls, etc.)
- Read `src/app/admin/scan/page.tsx`. Do the same:
  - Remove the outer `min-h-screen bg-gray-50` wrapper
  - Remove any duplicate header bar
  - Keep all scan functionality intact

**Verify:** Run `npm run build`. Fix errors. Commit:
```
fix(layout): wire admin sidebar into layout, fix middleware redirect, remove duplicate chrome
```

---

## PHASE 4 — Client Dashboard Fix

Fix P0-5, P2-9. The client dashboard is completely broken.

**Step 4a: Fix client ID mismatch (P0-5)**
- Read `src/app/dashboard/page.tsx` completely
- The bug: it uses `user.id` (Supabase auth UUID) as `client_id`, but `product_allocations.client_id` is a foreign key to `clients.id` (a different UUID)
- Fix: Before any `product_allocations` or `product_requests` queries, look up the client record:
  ```ts
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('email', user.email)
    .single()
  ```
- If no client found, render a helpful empty state ("Your client profile hasn't been set up yet. Contact your admin.")
- Replace ALL occurrences of `user.id` used as `client_id` with `client.id`
- Also check `src/app/api/dashboard/products/route.ts` and `src/app/api/dashboard/requests/route.ts` for the same bug — they may already do email-based lookup (verify by reading them)

**Step 4b: Configure next/image for external domains (P2-9)**
- Read `next.config.mjs`
- Add remote patterns for all image domains used in the app:
  ```js
  const nextConfig = {
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'picsum.photos' },
        { protocol: 'https', hostname: '*.alicdn.com' },
        { protocol: 'https', hostname: '*.tiktokcdn.com' },
        { protocol: 'https', hostname: '*.shopify.com' },
        { protocol: 'https', hostname: '*.pinimg.com' },
        { protocol: 'https', hostname: '*.amazonaws.com' },
      ],
    },
  }
  ```

**Verify:** Run `npm run build`. Fix errors. Commit:
```
fix(dashboard): fix client ID lookup via email join, configure next/image remote patterns
```

---

## PHASE 5 — ESLint Fix

Fix P0-2. Linting is completely broken.

- Run `npx eslint --version` to confirm current version
- Check if the project uses `.eslintrc.json`, `.eslintrc.js`, or `.eslintrc` config format by looking for those files
- **If legacy `.eslintrc*` config exists (most likely):** Downgrade ESLint to a compatible version:
  ```bash
  npm install eslint@^9.0.0 eslint-config-next@^14.0.0 --save-dev
  ```
  The `eslint-config-next` version should match the Next.js major version.
- **Alternative if downgrade causes issues:** Migrate to flat config by creating `eslint.config.mjs` and removing the old `.eslintrc*` file. Use the Next.js flat config pattern.
- After fixing, run `npm run lint`
- If lint surfaces code errors (unused imports, etc.), fix them one at a time
- Do NOT add new lint rules or change existing config beyond what's needed to make it run

**Verify:** `npm run lint` runs without config errors (warnings are OK). `npm run build` still passes. Commit:
```
fix(toolchain): fix ESLint configuration for compatibility
```

---

## PHASE 6 — Database Migration Cleanup

Fix P1-10, P2-10. Migration files have duplicate numbering and wrong currency default.

**Step 6a: Fix duplicate migration numbering (P1-10)**
- List all files in `supabase/migrations/`
- Rename to eliminate duplicates:
  - If two files start with `001_`, rename the second to `001b_` (keep content unchanged)
  - If two files start with `002_`, rename the second to `002b_` (keep content unchanged)
  - For the gap at 006: renumber `007_remaining_fixes.sql` → `006_remaining_fixes.sql` and `008_client_rls_fix.sql` → `007_client_rls_fix.sql`
- Update any comments inside the files that reference their own migration number

**Step 6b: Fix default currency GBP → USD (P2-10)**
- In `supabase/migrations/003_products.sql`, change `DEFAULT 'GBP'` to `DEFAULT 'USD'`
- In `supabase/migrations/CONSOLIDATED_MIGRATION.sql`, find and replace the same `DEFAULT 'GBP'` → `DEFAULT 'USD'`
- In `supabase/migrations/RUN_ALL_IN_SQL_EDITOR.sql`, do the same if present
- Check `src/lib/types/product.ts` for any hardcoded `'GBP'` default and change to `'USD'`

**Verify:** No duplicate filenames in `supabase/migrations/`. `npm run build` still passes. Commit:
```
fix(db): deduplicate migration numbering, change default currency to USD
```

---

## PHASE 7 — P1 Feature Polish

Fix P1-2 (already done in Phase 3), P1-5, P1-4, P1-3.

**Step 7a: Add client selector to scan page (P1-5)**
- Read `src/app/admin/scan/page.tsx`
- When the user selects "Client" scan mode, render a dropdown/select that:
  - Fetches the client list from `/api/admin/clients` on mount
  - Shows client name and plan tier
  - Stores the selected `clientId` in component state
  - Passes `clientId` in the scan request body when starting the scan
- If no client is selected, disable the "Start Scan" button with a message like "Select a client first"
- Use the existing UI component patterns (shadcn/ui Select or the existing select styles in the codebase)

**Step 7b: Enhance influencer page (P1-4)**
- Read `src/app/admin/influencers/page.tsx` and `src/lib/scoring/composite.ts` (the `calculateInfluencerConversionScore` function)
- Add a "Score" column to the influencer table that calls `calculateInfluencerConversionScore()` with available influencer data and displays the result as a colored badge
- Add a sort dropdown or clickable column headers for: engagement rate, followers, conversion score
- Add a small warning icon/flag next to influencers where `engagement_rate` is suspiciously high relative to followers (suggesting fake followers) — the `passesFakeFollowerFilter()` function in `src/lib/providers/influencers.ts` has the logic, surface it visually

**Step 7c: Add analytics stub page (P1-3)**
- Create `src/app/admin/analytics/page.tsx` — a simple server component with:
  - A heading "Analytics"
  - A "Coming Soon" card with a brief description of planned features
  - Match the styling of other admin pages (use the same background, padding, card patterns)
- Do NOT over-engineer. This is a placeholder.

**Verify:** `npm run build` passes. Commit:
```
feat(admin): add scan client selector, enhance influencer page, add analytics stub
```

---

## PHASE 8 — P2 UX Improvements

Fix P2-2, P2-3. Product CRUD and pagination.

**Step 8a: Add product edit and delete (P2-2)**
- Read `src/app/admin/products/page.tsx` and `src/app/api/admin/products/route.ts`
- Add to each product row: an Edit button (pencil icon) and a Delete button (trash icon)
- **Edit:** Opens a modal/dialog pre-filled with the product's current data (name, price, category, url). On save, sends a PATCH request to `/api/admin/products` with the product `id` and updated fields. If the API doesn't have a PATCH handler, add one.
- **Delete:** Shows a confirmation dialog ("Are you sure you want to delete {product name}?"). On confirm, sends a DELETE request to `/api/admin/products?id={id}`. If the API doesn't have a DELETE handler, add one.
- Use the existing dialog/modal components in the codebase (check `src/components/ui/` for Dialog)

**Step 8b: Add pagination to product and influencer tables (P2-3)**
- Read the current fetch logic in `src/app/admin/products/page.tsx` and `src/app/admin/influencers/page.tsx`
- Add pagination state: `page` (starting at 1) and `pageSize` (default 25)
- Pass `limit` and `offset` query params to the API: `?limit=${pageSize}&offset=${(page-1)*pageSize}`
- Add Previous/Next buttons below the table
- Show "Page X of Y" indicator (use total count from API response if available, otherwise just "Page X" with Previous/Next disabled at boundaries)
- Disable Previous on page 1. Disable Next when fewer results than pageSize are returned.

**Verify:** `npm run build` passes. Commit:
```
feat(admin): add product edit/delete, pagination on products and influencers
```

---

## FINAL PUSH

After all 8 phases are committed, run these final checks:
1. `npm run build` — must pass with zero errors
2. `npm run lint` — must run without config errors
3. `cd backend && npx tsc --noEmit` — must pass
4. `git log --oneline -10` — verify 8 clean commits

Then push the branch:
```bash
git push -u origin <your-branch-name>
```

## RULES

1. **Read before edit.** Always read a file before modifying it. Never guess at file contents.
2. **Build after each phase.** Do not proceed to the next phase until `npm run build` passes.
3. **One commit per phase.** Use the exact commit messages specified above.
4. **Don't over-engineer.** Fix exactly what's described. No bonus refactoring, no new abstractions, no added comments on unchanged code.
5. **Preserve existing patterns.** Match the coding style of surrounding code — same Tailwind classes, same Supabase query patterns, same component patterns.
6. **Search for ripple effects.** After changing a type or function signature, grep for ALL callers and update them. TypeScript build errors will catch most, but string comparisons won't.
7. **Skip P3 issues.** They are informational only. Don't fix them unless they block a higher-priority fix.
8. **If a phase's change breaks build:** Fix the error immediately before committing. Do not leave broken state.
9. **If you're unsure about something:** Read more code for context rather than guessing. Check how similar patterns are implemented elsewhere in the codebase.

## EXPECTED OUTCOME

- All 6 P0 issues: **FIXED**
- All 10 P1 issues: **FIXED** (P1-1 accepted as architectural choice, P1-3 gets stub, P1-8 acknowledged as provider limitation)
- P2 issues: **6 of 10 FIXED** (P2-4 Excel import, P2-7 DialogTrigger, P2-1 influencer formula, P2-5 profitability heuristic deferred)
- `npm run build`: PASS
- `npm run lint`: PASS
- Spec compliance: ~78% → ~92%
