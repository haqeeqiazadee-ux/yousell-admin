# Phase 0 Execution Prompt — Event Bus + Engine Refactor

Paste this entire prompt to Claude to execute Phase A and Phase B autonomously.

---

## CONTEXT RECOVERY (Do this first — non-negotiable)

Read these files in parallel to recover full project context:

1. `CLAUDE.md` — project rules and guardrails
2. `docs/YouSell_Platform_Technical_Specification_v8.md` — canonical architecture (v8 is the source of truth)
3. `system/development_log.md` — what's been done
4. `system/ai_logic.md` — platform operational logic
5. `tasks/todo.md` — current task state
6. `tasks/lessons.md` — past mistakes to avoid
7. `tasks/execution_plan.md` — the full execution plan
8. `docs/USE_CASE_DIAGRAM.md` — use case diagrams and data flows

After reading, produce a 5-line summary of: current state, what Phase 0 requires, and confirm you're ready. Then immediately begin work.

---

## MISSION

Execute **Phase A** (Event Bus + Engine Registry + 3 Engine Migrations) and **Phase B** (Refactor remaining API routes to engine namespaces + queue ownership) to align the existing codebase with the v8 specification.

**You must not stop, ask questions, or wait for approval between tasks.** Work autonomously in small batches. If blocked, find an alternative path and keep moving. Use subagents aggressively for parallel work.

---

## EXECUTION RULES

### Parallelism & Speed
- Use subagents for ALL independent research and exploration tasks
- Launch multiple subagents simultaneously whenever possible
- Never do sequentially what can be done in parallel
- Keep the main context window clean — offload heavy reads to subagents

### Small Batch Pattern
- Each batch = 1 discrete, testable unit of work
- After each batch: commit with a clear message, update `system/development_log.md`
- Do NOT accumulate large uncommitted changes
- If a batch fails, fix it before moving on

### Memory Management
- If context feels compressed or you lose track, STOP and re-read `CLAUDE.md` + `system/development_log.md`
- Update `system/development_log.md` after EVERY batch (not just at the end)
- Update `tasks/todo.md` to reflect progress as you go
- Update `tasks/lessons.md` if you hit any gotchas

### Quality Gates
- Every new file must be TypeScript with proper types
- Every new module must import from existing `src/lib/supabase/*` clients (never create new ones)
- No `any` types unless absolutely unavoidable
- Respect Netlify deployment constraints (no long-running processes in API routes)
- Backend workers stay in `backend/`, frontend stays in `src/`

---

## PHASE A — Event Bus + Engine Registry + 3 Engine Migrations

### Batch A1: Audit Current State
- Use subagents in parallel to map:
  - All existing API routes under `src/app/api/admin/` — list every route, what it does, what tables it reads/writes
  - All existing backend jobs under `backend/jobs/` — list every job, what queue it uses, what tables it touches
  - All existing engine modules under `src/lib/engines/` — list every engine, its inputs/outputs
  - All existing provider modules under `src/lib/providers/` — list every provider, its external API calls
- Produce a dependency map: which engines call which providers, which share tables
- Save audit results to `tasks/phase0_audit.md`
- **Commit**: "audit: map current engine dependencies and API routes for v8 alignment"

### Batch A2: Event Bus Skeleton
- Create `src/lib/events/` directory with:
  - `event-bus.ts` — lightweight in-process event emitter (typed events, subscribe/publish/unsubscribe)
  - `event-types.ts` — define all cross-engine event types from v8 spec (e.g., `product.discovered`, `product.scored`, `trend.detected`, `cluster.formed`, `creator.matched`, `supplier.found`, `content.generated`, `order.placed`)
  - `index.ts` — barrel export
- Keep it simple: in-process pub/sub first. No external message broker. This is a decoupling layer, not a distributed system.
- Events must be typed with TypeScript generics so subscribers get proper payload types.
- **Commit**: "feat: add typed event bus skeleton for engine decoupling"

### Batch A3: Engine Registry
- Create `src/lib/engines/registry.ts`:
  - Engine interface: `{ name, version, status, healthCheck(), init(), shutdown() }`
  - Registry: register/unregister engines, get engine by name, list all, health check all
  - Each engine owns its queue namespace (e.g., `engine:product-discovery:*`)
- Create `src/lib/engines/types.ts` — shared engine types
- Update `src/lib/engines/index.ts` barrel export
- **Commit**: "feat: add engine registry with health checks and queue ownership"

### Batch A4: Migrate Engine 1 — Product Discovery
- Refactor the existing TikTok discovery + product scan logic into a self-contained engine:
  - `src/lib/engines/product-discovery/index.ts` — engine entry point, registers with registry
  - `src/lib/engines/product-discovery/handlers.ts` — business logic (moved from current locations)
  - `src/lib/engines/product-discovery/events.ts` — events this engine publishes/subscribes to
  - `src/lib/engines/product-discovery/types.ts` — engine-specific types
- Wire it to publish `product.discovered` events via the event bus
- Update existing API routes to delegate to this engine (don't break existing routes yet — wrap them)
- **Commit**: "refactor: migrate product discovery to engine pattern with event publishing"

### Batch A5: Migrate Engine 2 — Scoring Engine
- Refactor `backend/lib/scoring.ts` + related logic into:
  - `src/lib/engines/scoring/index.ts`
  - `src/lib/engines/scoring/three-pillar.ts` — the scoring formula
  - `src/lib/engines/scoring/events.ts` — subscribes to `product.discovered`, publishes `product.scored`
  - `src/lib/engines/scoring/types.ts`
- The scoring engine should react to product discovery events automatically
- **Commit**: "refactor: migrate scoring engine with event-driven product evaluation"

### Batch A6: Migrate Engine 3 — Product Clustering
- Refactor `src/lib/engines/clustering.ts` into:
  - `src/lib/engines/clustering/index.ts`
  - `src/lib/engines/clustering/handlers.ts`
  - `src/lib/engines/clustering/events.ts` — subscribes to `product.scored`, publishes `cluster.formed`
  - `src/lib/engines/clustering/types.ts`
- **Commit**: "refactor: migrate clustering engine with event-driven cluster formation"

### Batch A7: Integration Test
- Create `tests/phase0-engine-integration.test.ts`:
  - Test event bus pub/sub works
  - Test engine registry lists all 3 engines
  - Test event chain: discover → score → cluster
- Run the tests and fix any failures
- **Commit**: "test: add Phase 0 engine integration tests"

---

## PHASE B — API Route Namespace Alignment + Queue Ownership

### Batch B1: Plan Route Migration
- Compare current API routes against v8 spec's engine namespace pattern
- Create a migration map: `current route → new route → engine owner`
- Document in `tasks/phase0_route_migration.md`
- Identify which routes can be aliased (backward compat) vs which need full moves
- **Commit**: "docs: plan API route migration to engine namespaces"

### Batch B2-B6: Migrate Routes (one engine namespace per batch)
For each engine namespace in the v8 spec:
- Create the new namespaced API route if it doesn't exist
- Delegate to the appropriate engine module
- Keep old routes working as thin redirects/wrappers (don't break anything)
- Add queue ownership annotations to backend jobs (which engine owns which queue)
- **Commit each batch separately** with message: "refactor: migrate [engine-name] API routes to v8 namespace"

### Batch B7: Cleanup & Documentation
- Update `docs/YouSell_Platform_Technical_Specification_v8.md` if any implementation deviates from spec (document WHY)
- Update `system/development_log.md` with full Phase 0 summary
- Update `tasks/todo.md` — mark Phase 0 complete
- Update `tasks/execution_plan.md` — mark Phase A and B complete
- Final commit: "docs: complete Phase 0 documentation updates"

---

## COMMIT & PUSH RULES

- Branch: work on the current development branch
- Commit after EVERY batch (A1, A2, A3... B1, B2...)
- Push after completing Phase A and again after completing Phase B
- Commit messages must be conventional: `type: description` (feat, refactor, test, docs, fix, audit)

---

## IF YOU GET STUCK

1. Re-read `CLAUDE.md` and `system/development_log.md`
2. Check `tasks/lessons.md` for known patterns
3. If a batch is too large, split it into sub-batches
4. If an external dependency is missing, mock it and move on
5. If a test fails, fix it inline — don't skip it
6. NEVER ask the user what to do — make a decision, document why, and keep moving

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

**BEGIN IMMEDIATELY. No preamble. Read context files, summarize in 5 lines, then start Batch A1.**
