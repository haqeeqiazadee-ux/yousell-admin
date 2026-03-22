# YOUSELL Platform — Lessons & Patterns

Last updated: 2026-03-21

------------------------------------------------------------

## Core Lessons

### Lesson 1 — Never trust chat memory (2026-03-17)
**Trigger:** Session broke mid-conversation, lost all context.
**Rule:** Always write plans and progress to files BEFORE doing work. The trace log (`system/execution_trace.md`) is the recovery mechanism, not chat history.

### Lesson 2 — Small batches prevent drift (2026-03-17)
**Trigger:** Large tasks cause Claude to lose track or go off-plan.
**Rule:** Every batch is 1-3 files max. Audit before modify. Commit after each batch.

### Lesson 3 — Read before write (2026-03-17)
**Trigger:** Previous sessions created files without checking what already existed.
**Rule:** Always `Read` existing files before creating or modifying. Never assume file contents.

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
| 2026-03-19 | Google OAuth login broken — dashboard showed "Failed to load data" | Two bugs: (1) `handle_new_user` trigger didn't create `clients` records, (2) callback route cookies not forwarded to redirect response | Created migration 029 for trigger fix + RLS; fixed callback to forward cookies on redirect; added refreshSession fallback in authFetch | Always ensure DB triggers create ALL required records for a new user (not just profiles). Always verify cookies are set on the actual response object returned to the browser, not just on the cookieStore. |
| 2026-03-21 | Migration 028 `ALTER TYPE ADD VALUE` failed in transaction | `ALTER TYPE ... ADD VALUE` cannot run inside a transaction block in PostgreSQL | Run it as a standalone `execute_sql` call before the main `apply_migration` | Always split `ALTER TYPE ADD VALUE` into a separate non-transactional statement when using Supabase MCP migrations. |
| 2026-03-21 | Migration 029 failed due to existing constraint | `clients_email_unique` constraint was already applied manually | Wrapped remaining statements in idempotent DO blocks, skipped the constraint | Always use `IF NOT EXISTS` or `DO $$ BEGIN ... EXCEPTION WHEN ... END $$` for DDL that may have been applied manually. |

### Lesson 4 — Domain/DNS changes are external to code (2026-03-21)
**Trigger:** Routing review showed everything is code-correct but requires Netlify dashboard + Supabase dashboard configuration.
**Rule:** Always verify external configurations (DNS, OAuth providers, env vars) separately from code reviews. Code can be perfect but the system broken due to missing external config. Keep a checklist of external dependencies.

### Lesson 5 — Single deployment serving multiple domains (2026-03-21)
**Trigger:** yousell.online and admin.yousell.online both served from single Netlify deployment.
**Rule:** When a single deployment serves multiple domains, middleware is the routing layer. Always test both hostname paths. Auth cookies must use parent domain (`.yousell.online`) for cross-subdomain SSO. Safari ITP may block this — monitor.

### Lesson 6 — Split large writes into ≤150-line chunks to avoid timeouts (2026-03-22)
**Trigger:** Writing large architecture documents (900+ lines) in a single tool call risks timeout and context loss.
**Rule:** Never write a full document in one tool call. Create the file with a header first, then append sections one at a time (≤150 lines per Edit/Write call). For docs >200 lines, outline all sections first, then write each as a separate tool call. This is now codified as CLAUDE.md guardrails G21-G24.
