# YOUSELL QA Tracker

> **Purpose**: This file tracks progress across the 5-phase Quality Assurance review.
> Claude must reload this file at the start of every session to know where to resume.

---

## Phase Status

| Phase | Description | Status | Output File |
|-------|-------------|--------|-------------|
| 1 | Read brief + structured summary | COMPLETED | `ai/qa_brief_summary.md` |
| 2 | Critical review: discrepancies & technical gaps | COMPLETED | `ai/qa_findings_technical.md` |
| 3 | Critical review: SaaS features & moat gaps | COMPLETED | `ai/qa_findings_product.md` |
| 4 | Produce v6.0 Sections 1–10 | COMPLETED | `ai/master_brief_v6_part1.md` |
| 5 | Produce v6.0 Sections 11–20 + merge final | NOT STARTED | `ai/YOUSELL_MASTER_BUILD_BRIEF_v6.md` |

---

## Session Log

| Date | Phase | Notes |
|------|-------|-------|
| 2026-03-11 | Phase 1 | Brief summary complete. 14 sections produced. 5 ⚠️ VAGUE items flagged: missing Google Trends/YouTube workers, missing notifications/outreach/webhook DB tables, no dedicated API routes section. |
| 2026-03-11 | Phase 2 | Technical review complete. Found 15 discrepancies (4 CRITICAL) and 24 technical gaps (4 CRITICAL). 39 total findings. Top issues: no API routes section, CLAUDE.md out of sync with v5, zero error handling for external APIs, security gaps. |
| 2026-03-11 | Phase 3 | Product review complete. Found 18 missing SaaS features (4 P0 launch blockers), reviewed all 6 moat features, identified 5 new moat opportunities. Top gaps: no team invitations, no dunning flow, no onboarding empty states, no contextual help. |
| 2026-03-11 | Phase 4 | v6.0 Sections 1–10 complete. All 15 discrepancies fixed, all 24 technical gaps addressed, all 18 missing features added, all 6 moats improved, all 5 new moats defined. 10 sections written with inline fix markers. |

---

## How to Resume

If context is lost or a new session starts:

1. Read `CLAUDE.md`
2. Read `ai/qa_tracker.md` (this file)
3. Read the output file of the last COMPLETED phase
4. Continue with the next NOT STARTED phase using the corresponding prompt in `ai/qa_prompts/`
