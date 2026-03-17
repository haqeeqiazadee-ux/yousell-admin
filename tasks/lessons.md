# YOUSELL Platform — Lessons & Patterns

Last updated: 2026-03-17

------------------------------------------------------------

## Architecture Decisions

### AD-001: Engine Independence as Bounded Contexts
**Decision:** Each of the 21 engines must be architecturally independent — owning its own API namespace, data tables, BullMQ queues, and event contracts.

**Rationale:** Enables any engine to be extracted as a standalone SaaS offering without affecting the rest of the platform.

**Pattern:**
- API: `/api/engine/{engine-name}/*`
- Tables: Prefixed or grouped by engine ownership
- Queues: Named `{engine-name}-queue` or similar
- Events: Published via Redis Pub/Sub + Supabase Realtime
- No engine directly reads another engine's tables

**Extraction Process (5 steps):**
1. Copy engine code to standalone repo
2. Migrate owned tables to dedicated database
3. Replace event subscriptions with webhook endpoints
4. Replace event publishes with webhook callouts
5. Deploy independently

### AD-002: Event Bus Over Direct Calls
**Decision:** Inter-engine communication uses event bus (Redis Pub/Sub + Supabase Realtime), never direct function calls or shared database queries.

**Rationale:** Loose coupling. If Engine A publishes an event and Engine B subscribes, removing Engine B doesn't break Engine A.

### AD-003: Manual-First Automation
**Decision:** All automation jobs DISABLED by default. Three tiers: Manual → Assisted → Auto-Pilot.

**Rationale:** Cost control from day one. Prevents runaway API/scraping costs.

------------------------------------------------------------

## Development Patterns

### DP-001: Large Draw.io Files — Build in Batches
**Pattern:** When creating multi-page draw.io XML files, use placeholder strings and replace them one page at a time.

**Why:** Draw.io XML is verbose. Attempting to write entire files at once exceeds practical limits. Batch approach (one page per edit) is reliable.

### DP-002: Edit Tool — Ensure Unique Match Context
**Pattern:** Always include enough surrounding context in `old_string` to guarantee a unique match. Check for multiple occurrences of common phrases.

**Why:** The Edit tool fails if `old_string` matches multiple locations. Repeated phrases like "This entry" in log files are common.

------------------------------------------------------------

## Corrections Log

| Date | Issue | Root Cause | Fix | Prevention Rule |
|------|-------|-----------|-----|-----------------|
| 2026-03-17 | Edit tool match error on dev log | Common phrase repeated 5+ times | Added more surrounding context | Always verify uniqueness before editing |
| 2026-03-17 | Uncommitted changes flagged by hook | Partial edit without commit | Committed immediately | Commit after each meaningful batch of changes |
