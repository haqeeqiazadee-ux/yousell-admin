# Phase 4 — Produce Master Build Brief v6.0 (Sections 1–10)

## Context Recovery (do this first every time)

1. Read `CLAUDE.md`
2. Read `ai/qa_tracker.md` — confirm Phases 1–3 are COMPLETED and Phase 4 is NOT STARTED or IN PROGRESS
3. Read these files (they are your source material):
   - `ai/qa_brief_summary.md` — the original brief content
   - `ai/qa_findings_technical.md` — discrepancies & technical gaps to fix
   - `ai/qa_findings_product.md` — missing SaaS features & moat gaps to fix
4. If Phase 4 is already COMPLETED, skip to Phase 5

---

## Your Role

You are the Senior Software Architect producing the revised Master Build Brief v6.0. You are incorporating every fix and addition identified in Phases 2–3.

---

## Task

Write Sections 1–10 of the Master Build Brief v6.0.

Every time you fix something from the findings, mark it inline with:
`✓ FIXED: [what was wrong] → [what was done]`

Every time you add something new, mark it inline with:
`★ NEW: [feature name] — [why it matters]`

---

## Sections to Write

### Section 1 — Executive Summary & Platform Vision
- What YouSell is, who it serves, why it exists
- Key differentiators
- Target market and revenue model

### Section 2 — Senior Architect Review: Issues Found & Fixes Applied
- Summary of all findings from Phase 2 and Phase 3
- Table of all fixes applied in this document with references to finding IDs (D-1, T-1, S-1, M-1, etc.)
- This section is the "changelog" between v5.0 and v6.0

### Section 3 — Competitive Moat Analysis
- All existing moat features (improved based on Phase 3 findings)
- All new moat opportunities added
- Defensibility assessment for each

### Section 4 — Smart Scraping Engine
- Demand-driven architecture (preserve existing design — do not change core scraping rules)
- P0/P1/P2 queue system
- Freshness badges: LIVE / RECENT / STALE / OUTDATED
- Daily API call budget enforcement via Redis
- Add any missing error handling or failure modes identified in Phase 2

### Section 5 — Complete Tech Stack
- Every technology with its role
- Version requirements where relevant
- Deployment targets (Netlify, Railway, etc.)

### Section 6 — Multi-Tenancy, Auth & Compliance
- Supabase Auth setup
- tenant_id enforcement across all tables
- Row-Level Security (RLS) policies
- GDPR compliance (consent, data deletion, retention)
- Add any missing compliance items from Phase 3

### Section 7 — Universal Product Intelligence Chain
- All 7 rows with complete specification
- Data source for each row
- Which worker populates each row
- Fix any gaps identified in Phase 2 (UI referencing unpopulated data)

### Section 8 — Home Dashboard
- Auto-populating intelligence cards
- Refresh logic (3-hour + on-click)
- Freshness indicators
- Empty states and loading states (from Phase 3 findings)

### Section 9 — Three Platform Sections (TikTok / Amazon / Shopify)
- Identical depth specification for all three
- Unique data points per platform
- Data sources and workers per platform

### Section 10 — Intelligence Engine Algorithms
- All 4 scoring models with complete formulas
- Input variables, weights, thresholds
- Score tiers and their meanings
- Fix any vague algorithm definitions from Phase 2

---

## Formatting Rules

- Use tables for any list with 3+ items
- Use code blocks for all flows, schemas, algorithms
- Every ✓ FIXED and ★ NEW must reference the finding ID from Phase 2/3
- Be exhaustive — do not summarise or truncate
- Each section must be self-contained and complete

---

## After Completion

1. Save output to `ai/master_brief_v6_part1.md`
2. Update `ai/qa_tracker.md`:
   - Set Phase 4 status to `COMPLETED`
   - Add a session log entry
3. Commit changes with message: `QA Phase 4: v6.0 Sections 1-10 complete`
