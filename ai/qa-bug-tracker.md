# YOUSELL QA Bug Tracker

**Started:** 2026-03-12

---

## Open Bugs

| ID | Severity | Component | Summary | Sprint | Status |
|----|----------|-----------|---------|--------|--------|
| BUG-022 | HIGH | Scan API / Backend | Table name split-brain: frontend reads `scan_history`, backend writes to `scans`. 4 backend references still use `scans` (index.ts:108, worker.ts:41,140,162). | S01 | Confirmed — Partially Fixed |
| BUG-023 | MEDIUM | Dashboard / Competitors | Table name mismatch: competitors route queries `competitors` table but dashboard safeCount queries `competitor_stores`. | S01 | Open |
| BUG-024 | LOW | Types | `viral_signals` and `imported_files` tables referenced in API routes but have no TypeScript type definitions in `database.ts`. | S01 | Open |
| BUG-025 | LOW | Types | `Database` type in `database.ts` only maps `profiles` and `admin_settings`. All other 11+ table types defined but not mapped in the Database interface. | S01 | Open |
| BUG-026 | MEDIUM | Email | Duplicate email config: both `src/lib/email.ts` and `backend/src/lib/email.ts` independently define RESEND_API_KEY, FROM_EMAIL, ADMIN_EMAIL. Could cause duplicate sends or config drift. | S01 | Open |
| BUG-005 | LOW | Scan API | Misleading code comment says "client sends jobId as query param, not in body" — but the code actually works correctly. Comment should be updated or removed. | S01 | Reclassified (was HIGH, now LOW — not a functional bug) |

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
| MEDIUM | 2 | 0 | 2 |
| LOW | 3 | 0 | 3 |
| **Total** | **6** | **0** | **6** |
