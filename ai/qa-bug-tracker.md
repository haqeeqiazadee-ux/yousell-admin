# YOUSELL QA Bug Tracker

**Started:** 2026-03-12

---

## Open Bugs

| ID | Severity | Component | Summary | Sprint | Status |
|----|----------|-----------|---------|--------|--------|
| BUG-022 | HIGH | Scan API / Backend | Table name split-brain: frontend reads `scan_history`, backend writes to `scans`. 4 backend references still use `scans` (index.ts:108, worker.ts:41,140,162). | S01 | Confirmed — Partially Fixed |
| BUG-032 | MEDIUM | Admin Layout | Admin layout does NOT check role. Client-role users see full admin UI shell (sidebar, layout) but API calls fail with 403. Confusing UX. | S03 | Open |
| BUG-028 | MEDIUM | Backend Auth | Auth middleware attaches user to request but no route uses it. POST `/api/scan` reads `userId` from request body instead of authenticated user — allows userId spoofing. | S02 | Open |
| BUG-029 | MEDIUM | Backend CORS | CORS only allows single origin (FRONTEND_URL). Netlify preview URLs or multi-domain deployments will be blocked. | S02 | Open |
| BUG-030 | MEDIUM | Backend Providers | Amazon scrape includes API key in URL query string. Key may appear in error logs/stack traces. Should redact in error logging. | S02 | Open |
| BUG-027 | MEDIUM | Backend Auth | Auth middleware creates Supabase client with anon key (subject to RLS). Worker uses service role key. Inconsistent permission levels may cause issues if RLS enabled. | S02 | Open |
| BUG-023 | MEDIUM | Dashboard / Competitors | Table name mismatch: competitors route queries `competitors` table but dashboard safeCount queries `competitor_stores`. | S01 | Open |
| BUG-026 | MEDIUM | Email | Duplicate email config: both `src/lib/email.ts` and `backend/src/lib/email.ts` independently define RESEND_API_KEY, FROM_EMAIL, ADMIN_EMAIL. Could cause duplicate sends or config drift. | S01 | Open |
| BUG-034 | LOW | Auth Types | Role type mismatch: `get-user.ts` has `'admin' | 'client' | 'viewer'` but `database.ts` UserRole has only `'admin' | 'client'`. Viewer role undefined in DB. | S03 | Open |
| BUG-033 | LOW | Dashboard Layout | Admin users accessing `/dashboard` get redirected to `/admin/unauthorized` ("Access Denied") — confusing. Should redirect to `/admin` instead. | S03 | Open |
| BUG-024 | LOW | Types | `viral_signals` and `imported_files` tables have no TypeScript type definitions in `database.ts`. | S01 | Open |
| BUG-025 | LOW | Types | `Database` type in `database.ts` only maps `profiles` and `admin_settings`. All other tables unmapped. | S01 | Open |
| BUG-005 | LOW | Scan API | Misleading code comment about jobId param — code works correctly. | S01 | Reclassified (LOW) |
| BUG-031 | LOW | Backend Providers | `fetchTrends` fails silently with empty catch block — no error logging. | S02 | Open |

---

## Resolved Bugs

| ID | Severity | Component | Summary | Sprint | Resolution |
|----|----------|-----------|---------|--------|------------|
| (none yet) | | | | | |

---

## Bug Statistics

| Severity | Open | Resolved | Total |
|----------|------|----------|-------|
| CRITICAL | 0 | 0 | 0 |
| HIGH | 1 | 0 | 1 |
| MEDIUM | 7 | 0 | 7 |
| LOW | 6 | 0 | 6 |
| **Total** | **14** | **0** | **14** |
