# Phase 5 — Produce Master Build Brief v6.0 (Sections 11–20) & Merge Final Document

## Context Recovery (do this first every time)

1. Read `CLAUDE.md`
2. Read `ai/qa_tracker.md` — confirm Phases 1–4 are COMPLETED and Phase 5 is NOT STARTED or IN PROGRESS
3. Read these files:
   - `ai/qa_brief_summary.md` — original brief content
   - `ai/qa_findings_technical.md` — fixes to incorporate
   - `ai/qa_findings_product.md` — fixes to incorporate
   - `ai/master_brief_v6_part1.md` — Sections 1–10 (already written)
4. If Phase 5 is already COMPLETED, inform the user that the QA is finished

---

## Your Role

You are the Senior Software Architect completing the Master Build Brief v6.0.

---

## Task A — Write Sections 11–20

Continue using the same fix/addition markers:
`✓ FIXED: [what was wrong] → [what was done]`
`★ NEW: [feature name] — [why it matters]`

### Section 11 — Complete Database Schema
- Every table with all fields, types, constraints
- tenant_id on every table
- RLS policies
- Indexes for performance
- Fix any missing fields identified in Phase 2

### Section 12 — Worker System
- Every worker (all 18+) with:
  - Name, trigger condition, queue lane (P0/P1/P2)
  - Input, output, error handling
  - Budget enforcement rules
  - What happens on failure
- Fix any workers with missing triggers from Phase 2

### Section 13 — API Routes
- Complete endpoint list with: method, path, purpose, auth required, plan gate
- Fix any referenced-but-undefined routes from Phase 2

### Section 14 — Subscription Plans & Billing
- Plan tiers with feature gates
- Stripe integration: webhooks, metering, portal
- Edge cases: failed payments, dunning, downgrades, proration, refunds
- Free trial flow
- Add billing edge cases from Phase 3

### Section 15 — Missing SaaS Features (now added)
- Onboarding flow
- Export functionality (CSV/PDF)
- Mobile responsiveness
- Notification system
- Team/multi-user support
- All other features identified in Phase 3 with implementation specs

### Section 16 — Error Handling, Monitoring & Disaster Recovery
- Error handling for every external dependency (Apify, RapidAPI, Stripe, Supabase, Redis)
- Health check endpoints
- Alerting rules
- Logging strategy
- Backup & restore procedures
- RTO/RPO targets
- All technical gaps from Phase 2

### Section 17 — Development Phases (revised)
- Correct task ordering based on dependency analysis
- Each phase with: tasks, dependencies, estimated complexity
- Mark which phases address which findings

### Section 18 — Development Guardrails (updated)
- All original guardrails
- New guardrails based on findings (e.g., "always handle external API failures")

### Section 19 — Session Continuity Protocol & STATUS.json Format
- How Claude should track progress across sessions
- STATUS.json schema
- Recovery protocol if context is lost

### Section 20 — Claude Code Master Execution Prompt v6.0
- **This must be completely self-contained**
- When pasted cold into Claude Code with no other context, it must work
- Include: role, tech stack, architecture, current phase, guardrails, file references
- Reference the v6.0 document for detailed specs

---

## Task B — Merge Final Document

After writing Sections 11–20, create the final merged document:

1. Read `ai/master_brief_v6_part1.md` (Sections 1–10)
2. Combine with Sections 11–20
3. Add a document header:
   ```
   # YOUSELL Intelligence Platform — Master Build Brief v6.0

   **Version**: 6.0
   **Date**: [today's date]
   **Produced by**: Senior Architect QA Review
   **Based on**: Master Build Brief v5.0
   **Changes**: See Section 2 for complete changelog
   ```
4. Add a table of contents
5. Save as `ai/YOUSELL_MASTER_BUILD_BRIEF_v6.md`

---

## Task C — Final QA Summary

Create a brief summary at the end of the merged document:

```
## Final QA Summary

### Fixes Applied
- X discrepancies fixed
- Y technical gaps addressed
- Z missing SaaS features added
- W moat improvements made

### Confidence Assessment
[Your honest assessment of the v6.0 brief's completeness and readiness]

### Remaining Risks
[Anything you're still not satisfied with]
```

---

## Formatting Rules

- Use tables for any list with 3+ items
- Use code blocks for all flows, schemas, algorithms, prompts
- Every ✓ FIXED and ★ NEW must reference finding IDs
- The final document must be complete and self-contained
- Do not summarise or truncate any section

---

## After Completion

1. Save Sections 11–20 work to `ai/master_brief_v6_part2.md`
2. Save merged final document to `ai/YOUSELL_MASTER_BUILD_BRIEF_v6.md`
3. Update `ai/qa_tracker.md`:
   - Set Phase 5 status to `COMPLETED`
   - Add session log entry
   - Add a "QA COMPLETE" note at the top
4. Commit changes with message: `QA Phase 5: v6.0 complete — Master Build Brief v6.0 ready`
5. Push the branch
