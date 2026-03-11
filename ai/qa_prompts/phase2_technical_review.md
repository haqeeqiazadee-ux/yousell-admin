# Phase 2 — Critical Review: Discrepancies & Technical Gaps

## Context Recovery (do this first every time)

1. Read `CLAUDE.md`
2. Read `ai/qa_tracker.md` — confirm Phase 1 is COMPLETED and Phase 2 is NOT STARTED or IN PROGRESS
3. Read `ai/qa_brief_summary.md` — this is your working reference for the brief
4. If Phase 2 is already COMPLETED, skip to the next incomplete phase

---

## Your Role

You are the Senior Software Architect who has to maintain this system in production at 3am. Your job is to find everything that will break, contradict itself, or is missing.

---

## Task A — Find All Discrepancies

Go through the brief summary systematically and identify:

- Contradictions between sections (e.g., a feature described differently in two places)
- Features mentioned in one section but missing from another
- UI flows that reference data with no worker to populate it
- Database tables with missing fields needed by described features
- Workers with no defined trigger or queue lane
- API routes referenced in features but not defined in the API section
- Plan-gated features with no enforcement logic described

---

## Task B — Find All Technical Gaps

Think like the on-call engineer. For each system component, ask:

- **Failure modes**: What happens when Apify goes down? When RapidAPI rate-limits? When Stripe webhooks fail? When Redis crashes? When Supabase is unreachable?
- **Error handling**: Which flows have no described error handling?
- **Monitoring**: What has no health checks, alerting, or logging described?
- **Data integrity**: What happens when a tenant's data gets corrupted? What are the backup/restore procedures?
- **Race conditions**: What happens when two workers process the same product? When a user triggers a scrape while a background refresh is running?
- **Scaling**: What breaks at 100 users? At 1,000? At 10,000?
- **Security**: Missing auth checks, unprotected endpoints, data leakage between tenants
- **Disaster recovery**: Is there a plan? What's the RTO/RPO?

---

## Output Structure

Save your output to: `ai/qa_findings_technical.md`

### Section 1: Discrepancies Found

For each finding:
```
### D-[number]: [short title]

**Where**: [which sections contradict]
**Issue**: [clear description of the discrepancy]
**Severity**: CRITICAL / HIGH / MEDIUM / LOW
**Recommended Fix**: [what v6.0 should say instead]
```

### Section 2: Technical Gaps Found

For each finding:
```
### T-[number]: [short title]

**Component**: [which system component]
**Issue**: [what's missing or will break]
**Severity**: CRITICAL / HIGH / MEDIUM / LOW
**Recommended Fix**: [what v6.0 should include]
```

### Section 3: Summary Statistics

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Discrepancies | | | | | |
| Technical Gaps | | | | | |

---

## Formatting Rules

- Be specific — reference exact section names, table names, worker names, route paths
- Every finding must have a recommended fix (this feeds Phase 4/5)
- Sort findings by severity (CRITICAL first)
- Be direct and blunt — this is an architect review, not a compliment sandwich

---

## After Completion

1. Save output to `ai/qa_findings_technical.md`
2. Update `ai/qa_tracker.md`:
   - Set Phase 2 status to `COMPLETED`
   - Add a session log entry with today's date and notes (e.g., "Found X discrepancies, Y technical gaps")
3. Commit changes with message: `QA Phase 2: Technical review complete`
