# YOUSELL QA Bug Tracker

**Started:** 2026-03-12

---

## Open Bugs

| ID | Severity | Component | Summary | Sprint | Status |
|----|----------|-----------|---------|--------|--------|
| BUG-035 | HIGH | Scoring Engine | Frontend `composite.ts` has legacy `calculateCompositeScore()` using 60/40 (viral/profit) weighting — NOT the 3-pillar model. Function name collides with backend's version. Risk of wrong function being used. | S04 | Open |
| BUG-022 | HIGH | Scan API / Backend | Table name split-brain: frontend reads `scan_history`, backend writes to `scans`. | S01 | Confirmed — Partially Fixed |
| BUG-036 | MEDIUM | Scoring Engine | Backend heuristic scoring and frontend weighted scoring produce fundamentally different results for same product. Both stored in same DB fields without distinction. | S04 | Open |
| BUG-032 | MEDIUM | Admin Layout | Admin layout does NOT check role. Client users see admin UI but APIs fail 403. | S03 | Open |
| BUG-028 | MEDIUM | Backend Auth | POST `/api/scan` reads userId from body instead of authenticated user — spoofing risk. | S02 | Open |
| BUG-029 | MEDIUM | Backend CORS | Single-origin CORS blocks Netlify preview URLs. | S02 | Open |
| BUG-030 | MEDIUM | Backend Providers | Amazon API key in URL query string may leak in logs. | S02 | Open |
| BUG-027 | MEDIUM | Backend Auth | Auth middleware uses anon key (RLS-bound) vs worker uses service role key. | S02 | Open |
| BUG-023 | MEDIUM | Dashboard / Competitors | Table name mismatch: `competitors` vs `competitor_stores`. | S01 | Open |
| BUG-038 | MEDIUM | All Providers | Apify API token included in URL query strings across all providers. Token may leak in error logs. | S06 | Open |
| BUG-040 | MEDIUM | Providers | Frontend (Apify) and backend (official APIs) use different data sources for same platforms, producing inconsistent product records in same table. | S06 | Open |
| BUG-042 | MEDIUM | Providers | Two sets of provider files coexist: old (tiktok.ts) and new (tiktok/index.ts). index.ts re-exports old files. Confusion about which to use. | S07 | Open |
| BUG-026 | MEDIUM | Email | Duplicate email config in frontend and backend. | S01 | Open |
| BUG-034 | LOW | Auth Types | Role type mismatch: 'viewer' in auth code but not in DB type. | S03 | Open |
| BUG-033 | LOW | Dashboard Layout | Admin users on /dashboard get "Access Denied" instead of redirect to /admin. | S03 | Open |
| BUG-024 | LOW | Types | `viral_signals` and `imported_files` tables missing type definitions. | S01 | Open |
| BUG-025 | LOW | Types | `Database` type only maps 2 of 13+ tables. | S01 | Open |
| BUG-005 | LOW | Scan API | Misleading code comment about jobId param. | S01 | Reclassified (LOW) |
| BUG-037 | LOW | Scoring Engine | Legacy `overall_score` in frontend composite uses different formula (60/40) vs `final_score` (40/35/25). Risk if ever used for DB writes. | S05 | Open |
| BUG-039 | LOW | TikTok Provider | Frontend TikTok provider has no fallback when Apify not configured, even if TIKTOK_API_KEY is set. Backend has official API fallback but frontend doesn't. | S06 | Open |
| BUG-043 | LOW | Influencer Provider | `getInfluencerConfig()` returns `isConfigured: true` for "ainfluencer" but `searchInfluencers()` requires APIFY_API_TOKEN. Same pattern as BUG-041. | S08 | Open |
| BUG-041 | LOW | Trends Provider | `getTrendsConfig()` returns `isConfigured: true` (pytrends comment) but `searchTrends()` requires APIFY_API_TOKEN. Misleading status. | S07 | Open |
| BUG-031 | LOW | Backend Providers | `fetchTrends` silent empty catch block. | S02 | Open |

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
| HIGH | 2 | 0 | 2 |
| MEDIUM | 11 | 0 | 11 |
| LOW | 10 | 0 | 10 |
| **Total** | **23** | **0** | **23** |
