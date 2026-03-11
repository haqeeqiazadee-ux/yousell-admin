# YOUSELL QA Tracker

> **Purpose**: This file tracks progress across the 5-phase Quality Assurance review.
> Claude must reload this file at the start of every session to know where to resume.

---

## Phase Status

| Phase | Description | Status | Output File |
|-------|-------------|--------|-------------|
| 1 | Read brief + structured summary | NOT STARTED | `ai/qa_brief_summary.md` |
| 2 | Critical review: discrepancies & technical gaps | NOT STARTED | `ai/qa_findings_technical.md` |
| 3 | Critical review: SaaS features & moat gaps | NOT STARTED | `ai/qa_findings_product.md` |
| 4 | Produce v6.0 Sections 1–10 | NOT STARTED | `ai/master_brief_v6_part1.md` |
| 5 | Produce v6.0 Sections 11–20 + merge final | NOT STARTED | `ai/YOUSELL_MASTER_BUILD_BRIEF_v6.md` |

---

## Session Log

| Date | Phase | Notes |
|------|-------|-------|
| — | — | No sessions yet |

---

## How to Resume

If context is lost or a new session starts:

1. Read `CLAUDE.md`
2. Read `ai/qa_tracker.md` (this file)
3. Read the output file of the last COMPLETED phase
4. Continue with the next NOT STARTED phase using the corresponding prompt in `ai/qa_prompts/`
