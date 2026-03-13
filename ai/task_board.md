# YOUSELL Task Board

**Last Updated:** 2026-03-13

---

## Completed

- [x] QA gap analysis of original plan vs codebase
- [x] Enhanced QA master plan (18 phases, 25 sprints, 112 tasks)
- [x] Full QA execution (S01–S25)
- [x] QA final report with 44 bugs documented
- [x] Stack migration cost analysis

---

## Priority 1 — Must Fix Before Launch

- [ ] **BUG-035**: Remove/deprecate legacy `calculateCompositeScore()` in `src/lib/scoring/composite.ts`
- [ ] **BUG-022**: Align table name — change backend `worker.ts` from `scans` to `scan_history` (4 locations)

---

## Priority 2 — Before Customer Data

- [ ] **BUG-060**: Add cascading deletes for product deletion (allocations, blueprints, financial_models, viral_signals)
- [ ] **BUG-032**: Add admin role check to admin layout component
- [ ] **BUG-045**: Add sort field whitelist to products GET API
- [ ] **BUG-046**: Add field whitelist to influencers POST API
- [ ] **BUG-063**: Add missing 3 rejection rules to financial route (IP risk, price <$10, >100 competitors)
- [ ] **BUG-059**: Use upsert instead of insert for CSV import to prevent duplicates

---

## Priority 3 — Performance

- [ ] **BUG-050**: Parallelize platform scraping in worker with `Promise.all()`

---

## Priority 4 — Nice to Have

- [ ] **BUG-053**: Add error toasts for failed CRUD operations on products page
- [ ] **BUG-057**: Fix non-functional "View Blueprint" button on client products page
- [ ] **BUG-061**: Add audit trails (`created_by`) to blueprints, financial models, notifications, etc.
- [ ] **BUG-047**: Sanitize CSV formula injection (`=CMD()` etc.)
- [ ] **BUG-064**: Whitelist automation status values to 'enabled'/'disabled'
- [ ] **BUG-048**: Add key whitelist for settings POST
- [ ] **BUG-044**: Replace inline auth in settings route with `requireAdmin()`

---

## Pending Decisions

- [ ] Stack migration: Netlify → Vercel (see `ai/stack-migration-notes.md`)
- [ ] Stack migration: Railway → Render + Upstash Redis
