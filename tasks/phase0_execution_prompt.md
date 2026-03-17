# PHASE 0 — EXECUTION PROMPT (Bulletproof Edition)

## PURPOSE

This prompt governs the Phase 0 implementation of the YOUSELL platform upgrade.
Phase 0 = Build event bus + engine registry + refactor 3 existing engines.
This is the FOUNDATION — everything else depends on it.

---

## MEMORY SAFEGUARDS — NON-NEGOTIABLE

### Rule 1: Context Recovery Protocol
Before writing ANY code in ANY session, Claude MUST:

```
1. Read CLAUDE.md
2. Read tasks/phase0_execution_prompt.md (THIS FILE)
3. Read system/execution_trace.md (live progress log)
4. Read system/development_log.md (last 50 lines)
5. Read docs/YouSell_Platform_Technical_Specification_v8.md (Sections 1-8)
```

If ANY of these files are missing, STOP and alert the user.

### Rule 2: Execution Trace Log
Every micro-batch completion MUST be logged to `system/execution_trace.md`.
Format:

```
## [BATCH_ID] — [SHORT_DESCRIPTION]
- Status: COMPLETE | IN_PROGRESS | BLOCKED
- Files changed: [list]
- Committed: YES/NO (hash)
- Timestamp: [ISO date]
- Notes: [any context needed for recovery]
```

### Rule 3: Never Trust Chat Memory
Claude must NEVER rely on conversation history for:
- What was already built
- What batch comes next
- What the architecture looks like
- What files exist

ALWAYS read the trace log and repo files. Chat memory is disposable. Files are truth.

### Rule 4: Compression Recovery
If chat gets compressed or a new session starts:
1. Read this file FIRST
2. Read system/execution_trace.md to find last completed batch
3. Resume from the NEXT incomplete batch
4. Do NOT re-do completed work
5. Do NOT ask "where were we?" — the trace log tells you

### Rule 5: One Batch = One Commit
Each micro-batch gets its own commit with message format:
`phase0/[batch-id]: [description]`

---

## WHAT EXISTS TODAY (Snapshot)

```
src/
├── app/           → Next.js pages (admin, dashboard, login, signup, pricing, api routes)
├── components/    → UI components (admin-sidebar, product-card, score-badge, etc.)
├── hooks/         → React hooks
├── lib/
│   ├── engines/   → EXISTING engine files (need audit)
│   ├── providers/ → Provider abstractions
│   ├── scoring/   → Scoring logic
│   ├── supabase/  → Supabase client
│   └── types/     → TypeScript types
├── middleware.ts   → Auth/routing middleware
backend/
├── src/
│   ├── index.ts   → Express entry point
│   ├── worker.ts  → BullMQ worker entry
│   ├── jobs/      → Job handlers
│   └── lib/       → Backend utilities
supabase/
└── migrations/    → Database migrations
```

---

## PHASE 0 OBJECTIVE

Build the **engine-based architecture** defined in v8 spec:
1. **Event Bus** — Central pub/sub for inter-engine communication
2. **Engine Registry** — Register, discover, and manage all engines
3. **Refactor 3 existing engines** — Align TikTok Discovery, Product Extraction, and Scoring to the new pattern

---

## MICRO-BATCH BREAKDOWN

Each batch is deliberately small — 1 to 3 files max.
Each batch is independently committable and testable.
If Claude gets stuck on a batch, it stops and asks — never bulldozes forward.

---

### BATCH 0.1 — Audit existing engine files
**Goal:** Read every file in src/lib/engines/ and backend/src/jobs/ and document what exists.
**Output:** Update system/execution_trace.md with a complete inventory.
**Files changed:** system/execution_trace.md only
**Commit:** `phase0/0.1: audit existing engines and jobs`

---

### BATCH 0.2 — Define engine interface types
**Goal:** Create the TypeScript interfaces that ALL engines must implement.
**Files to create:** `src/lib/engines/types.ts`
**Key types:**
- `EngineConfig` — name, version, dependencies, queues owned
- `EngineStatus` — running, paused, error, idle
- `EngineEvent` — event type, payload, source engine, timestamp
- `Engine` — interface with init(), start(), stop(), status(), handleEvent()
**Commit:** `phase0/0.2: define engine interface types`

---

### BATCH 0.3 — Build the Event Bus
**Goal:** Central pub/sub that engines use to communicate.
**Files to create:** `src/lib/engines/event-bus.ts`
**Requirements:**
- In-memory pub/sub (no external deps needed yet)
- Type-safe event emission and subscription
- Event history buffer (last 100 events) for debugging
- Singleton pattern (one bus per process)
**Commit:** `phase0/0.3: build event bus`

---

### BATCH 0.4 — Build the Engine Registry
**Goal:** Central registry where engines register themselves.
**Files to create:** `src/lib/engines/registry.ts`
**Requirements:**
- Register/unregister engines by name
- Get engine by name
- List all registered engines with status
- Dependency resolution (engine A depends on engine B)
- Uses Event Bus to broadcast engine lifecycle events
**Commit:** `phase0/0.4: build engine registry`

---

### BATCH 0.5 — Create engine barrel export
**Goal:** Clean public API for the engine system.
**Files to create:** `src/lib/engines/index.ts`
**Exports:** EventBus, EngineRegistry, all types
**Commit:** `phase0/0.5: create engine barrel export`

---

### BATCH 0.6 — Audit + plan TikTok Discovery Engine refactor
**Goal:** Read the existing TikTok discovery code, map it to the new engine interface.
**Output:** Document in system/execution_trace.md what needs to change.
**Files changed:** system/execution_trace.md only
**Commit:** `phase0/0.6: audit tiktok discovery engine for refactor`

---

### BATCH 0.7 — Refactor TikTok Discovery Engine to engine pattern
**Goal:** Wrap existing TikTok discovery logic in the Engine interface.
**Files to modify:** Existing TikTok engine file(s)
**Requirements:**
- Implements Engine interface
- Registers with EngineRegistry on init
- Emits events via EventBus (product_discovered, scan_complete, scan_error)
- Preserves ALL existing functionality
- Does NOT break existing API routes or workers
**Commit:** `phase0/0.7: refactor tiktok discovery engine`

---

### BATCH 0.8 — Audit + plan Product Extraction Engine refactor
**Goal:** Read existing product extraction code, map to engine interface.
**Output:** Document in system/execution_trace.md.
**Files changed:** system/execution_trace.md only
**Commit:** `phase0/0.8: audit product extraction engine for refactor`

---

### BATCH 0.9 — Refactor Product Extraction Engine to engine pattern
**Goal:** Wrap existing product extraction logic in Engine interface.
**Files to modify:** Existing product extraction file(s)
**Requirements:** Same as Batch 0.7 pattern.
**Commit:** `phase0/0.9: refactor product extraction engine`

---

### BATCH 0.10 — Audit + plan Scoring Engine refactor
**Goal:** Read existing scoring code, map to engine interface.
**Output:** Document in system/execution_trace.md.
**Files changed:** system/execution_trace.md only
**Commit:** `phase0/0.10: audit scoring engine for refactor`

---

### BATCH 0.11 — Refactor Scoring Engine to engine pattern
**Goal:** Wrap existing scoring logic in Engine interface.
**Files to modify:** Existing scoring file(s)
**Requirements:** Same as Batch 0.7 pattern.
**Commit:** `phase0/0.11: refactor scoring engine`

---

### BATCH 0.12 — Integration verification
**Goal:** Verify all 3 engines register, communicate via event bus, and existing functionality works.
**Actions:**
- TypeScript compile check (`npx tsc --noEmit`)
- Verify imports resolve correctly
- Manual trace: simulate engine lifecycle in a test script
**Files to create:** `src/lib/engines/__tests__/integration.test.ts` (if test framework exists)
**Commit:** `phase0/0.12: integration verification`

---

### BATCH 0.13 — Update architecture docs
**Goal:** Update development_log.md and any relevant docs.
**Files to update:**
- `system/development_log.md` — add Phase 0 completion entry
- `system/execution_trace.md` — mark Phase 0 COMPLETE
**Commit:** `phase0/0.13: update docs — phase 0 complete`

---

## EXECUTION RULES

1. **One batch at a time.** Never skip ahead.
2. **Audit before modify.** Every refactor batch has an audit batch before it.
3. **Read before write.** Always read existing files before modifying them.
4. **Log everything.** Every batch completion goes to system/execution_trace.md.
5. **Commit often.** One commit per batch. Small, reversible.
6. **Stop on confusion.** If anything is unclear, ask the user. Never guess.
7. **No side quests.** Don't refactor unrelated code. Don't add features not in the batch.
8. **Preserve behavior.** Refactoring must NOT change external behavior.
9. **Test after each batch.** At minimum, run `npx tsc --noEmit` to verify types.
10. **Update trace BEFORE committing.** The trace log is part of the commit.

### Parallelism & Speed
- Use subagents for ALL independent research and exploration tasks
- Launch multiple subagents simultaneously whenever possible
- Never do sequentially what can be done in parallel
- Keep the main context window clean — offload heavy reads to subagents

### Quality Gates
- Every new file must be TypeScript with proper types
- Every new module must import from existing `src/lib/supabase/*` clients (never create new ones)
- No `any` types unless absolutely unavoidable
- Respect Netlify deployment constraints (no long-running processes in API routes)
- Backend workers stay in `backend/`, frontend stays in `src/`

---

## WHAT COMES AFTER PHASE 0

Once Phase 0 is complete:
- **Phase B (Backend Alignment):** Refactor remaining API routes to engine namespaces, add queue ownership annotations
- **Phase C (Frontend Design):** Design UI against the new engine-based architecture
- **Phase D (Frontend Build):** Implement the designs

These are NOT started until Phase 0 is verified complete in system/execution_trace.md.

---

## ANTI-DRIFT CHECKLIST

Before starting ANY batch, Claude must verify:

- [ ] I read system/execution_trace.md and know the last completed batch
- [ ] I am working on the NEXT batch in sequence
- [ ] I am on the correct git branch
- [ ] I have read all files I'm about to modify
- [ ] I understand what this batch does and what it does NOT do
- [ ] I will update system/execution_trace.md when done
- [ ] I will commit with the correct message format

---

## REFERENCE DOCUMENTS

| Document | Purpose | Read When |
|----------|---------|-----------|
| `CLAUDE.md` | Project rules | Every session start |
| `tasks/phase0_execution_prompt.md` | This file — execution plan | Every session start |
| `system/execution_trace.md` | Live progress log | Every session start + after each batch |
| `system/development_log.md` | Historical changes | Session start |
| `docs/YouSell_Platform_Technical_Specification_v8.md` | Master architecture | When implementing engine interfaces |
| `system/ai_logic.md` | Business logic rules | When touching scoring or pipeline logic |

---

## SUCCESS CRITERIA

Phase 0 is complete when:
- [ ] Event bus exists with typed events
- [ ] Engine registry exists and can list/health-check engines
- [ ] 3 engines (Product Discovery, Scoring, Clustering) are migrated to engine pattern
- [ ] Engines communicate via events, not direct imports
- [ ] All API routes map to engine namespaces per v8 spec
- [ ] Backend queue jobs have ownership annotations
- [ ] Old routes still work (backward compat wrappers)
- [ ] Integration tests pass
- [ ] `system/development_log.md` is updated
- [ ] `tasks/todo.md` reflects completion
- [ ] All changes committed and pushed

---

*This prompt is the contract between the user and Claude for Phase 0 execution.
Any deviation from this prompt requires explicit user approval.*
