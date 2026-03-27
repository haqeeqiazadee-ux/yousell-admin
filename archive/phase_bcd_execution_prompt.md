# PHASES B-C-D — EXECUTION PROMPT (WARMODE v3 Edition)

## PURPOSE

This prompt governs the next 3 phases of YOUSELL platform development,
picking up IMMEDIATELY after Phase 0 (engine architecture foundation).

**Phase 0 is COMPLETE.** These phases BUILD ON IT — never restart.

| Phase | What | Why |
|-------|------|-----|
| **B. Backend Alignment** | Refactor remaining API routes to engine namespaces, add queue ownership annotations | Gets the backend matching v8 spec |
| **C. Frontend Design** | Design the UI against the new engine-based architecture | Now you're designing against the REAL contracts |
| **D. Frontend Build** | Implement the designs | Clean build on stable foundations |

---

## MEMORY SAFEGUARDS — NON-NEGOTIABLE

### Rule 1: Context Recovery Protocol
Before writing ANY code in ANY session, Claude MUST:

```
PARALLEL GROUP 1:
  → Read CLAUDE.md
  → Read tasks/phase_bcd_execution_prompt.md (THIS FILE)
  → Read system/execution_trace.md (live progress log)

PARALLEL GROUP 2:
  → Read system/development_log.md (last 100 lines)
  → Read tasks/todo.md (current tasks)
  → Read tasks/lessons.md (mistake patterns)

PARALLEL GROUP 3:
  → Read docs/YouSell_Platform_Technical_Specification_v8.md (first 200 lines)
  → Read system/ai_logic.md (operational logic)
```

If ANY of these files are missing, CREATE them with a header + note. Do NOT abort.

### Rule 2: Execution Trace Log
Every micro-batch completion MUST be logged to `system/execution_trace.md`.
Format:

```markdown
### [YYYY-MM-DD HH:MM] <STATUS> — <Short description>

- **Task:** <What was being done>
- **Batch:** <Batch ID, e.g., B.1, C.3, D.7>
- **Action:** <Specific action taken>
- **Files touched:** <list of files created/modified>
- **Result:** SUCCESS | PARTIAL | FAILED | BLOCKED
- **Next step:** <What should happen next>
- **Commit:** <git short SHA or "uncommitted">
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
- Phase B: `phaseB/[batch-id]: [description]`
- Phase C: `phaseC/[batch-id]: [description]`
- Phase D: `phaseD/[batch-id]: [description]`

### Rule 6: Max 3 Files Per Batch
Never touch more than 3 files in a single micro-batch.
If a task needs 4+ files, split it into sub-batches.

### Rule 7: Verify Before Marking Done
Every batch must pass before marking DONE:
- TypeScript compiles (`npx tsc --noEmit` or equivalent)
- No import errors in modified files
- Existing tests still pass (if applicable)

---

## WHAT EXISTS TODAY (Phase 0 Deliverables — DO NOT REBUILD)

### Engine Architecture (COMPLETE — 6 new files, 4 modified)

```
src/lib/engines/
├── types.ts           → Engine interface, EngineConfig, EngineEvent, 21 engine names
├── event-bus.ts       → Singleton EventBus with typed emit/subscribe, wildcards, 100-event history
├── registry.ts        → EngineRegistry with dependency validation, topological start/stop
├── index.ts           → Barrel export (EventBus, EngineRegistry, all types, ENGINE_EVENTS)
├── discovery.ts       → DiscoveryEngine class (wraps runLiveDiscoveryScan)
├── tiktok-discovery.ts→ TikTokDiscoveryEngine class (wraps discoverTikTokVideos)
├── scoring-engine.ts  → ScoringEngine class (wraps composite scoring)
├── clustering.ts      → Existing clustering logic (NOT yet refactored to engine pattern)
├── creator-matching.ts→ Existing creator matching logic (NOT yet refactored)
├── opportunity-feed.ts→ Existing opportunity feed logic (NOT yet refactored)
├── trend-detection.ts → Existing trend detection logic (NOT yet refactored)
└── ad-intelligence.ts → Existing ad intelligence logic (NOT yet refactored)
```

### Tests (COMPLETE — 19/19 passing)
```
tests/engine-system.test.ts → EventBus (7), EngineRegistry (9), Integration (3)
```

### Backend Jobs (EXISTING — 15 processors)
```
backend/src/jobs/
├── product-scan.ts, enrich-product.ts, trend-scan.ts
├── tiktok-discovery.ts, tiktok-product-extract.ts, tiktok-engagement-analysis.ts, tiktok-cross-match.ts
├── product-clustering.ts, trend-detection.ts, creator-matching.ts
├── amazon-intelligence.ts, shopify-intelligence.ts, ad-intelligence.ts
├── influencer-discovery.ts, supplier-discovery.ts
├── types.ts (queue name constants), index.ts (worker registration)
```

### API Routes (EXISTING — 60 total)
- 40 admin routes under `/api/admin/*`
- 3 auth routes under `/api/auth/*`
- 11 dashboard routes under `/api/dashboard/*`
- 4 webhook routes under `/api/webhooks/*`
- 2 system routes (engines health, setup)

### Frontend Pages (EXISTING — 41 total)
- 27 admin pages, 7 dashboard pages, 4 public pages, 3 layouts

### Components (EXISTING — 29 total)
- 6 custom feature components, 3 context providers, 15 shadcn/ui, 5 utility

### Database Tables (EXISTING — 50+ tables across 26 migration files)

---

## PHASE B: BACKEND ALIGNMENT
### Goal: Refactor remaining API routes to engine namespaces + add queue ownership

**Estimated batches: 15 micro-batches**
**Max duration: 2-3 sessions**

### Principle
The v8 spec says every engine is a bounded context with its own API namespace:
`/api/engine/{engine-name}/*`

Currently, routes are flat under `/api/admin/*` with resource-based naming.
Phase B ADDS engine-namespaced routes while KEEPING backward-compatible routes.

### B.1: Refactor remaining engines to engine pattern (5 batches)

| Batch | Task | Files (≤3) | Engine |
|-------|------|-----------|--------|
| B.1 | Wrap clustering.ts in Engine interface | `src/lib/engines/clustering.ts` | clustering |
| B.2 | Wrap trend-detection.ts in Engine interface | `src/lib/engines/trend-detection.ts` | trend-detection |
| B.3 | Wrap creator-matching.ts in Engine interface | `src/lib/engines/creator-matching.ts` | creator-matching |
| B.4 | Wrap ad-intelligence.ts in Engine interface | `src/lib/engines/ad-intelligence.ts` | ad-intelligence |
| B.5 | Wrap opportunity-feed.ts in Engine interface + update barrel export | `src/lib/engines/opportunity-feed.ts`, `src/lib/engines/index.ts` | opportunity-feed |

**Pattern for each:**
1. Read the existing file
2. Add `XxxEngine` class implementing `Engine` from `./types`
3. Add EventBus emit calls at key data points
4. Keep backward-compatible function exports
5. Update `index.ts` barrel to export new engine class

### B.2: Add queue ownership annotations (2 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| B.6 | Add engine ownership metadata to backend queue definitions | `backend/src/jobs/types.ts` |
| B.7 | Add engine owner comments to each job processor file header | `backend/src/jobs/product-scan.ts`, `backend/src/jobs/enrich-product.ts`, `backend/src/jobs/trend-scan.ts` |

**For B.6:** Add an `ENGINE_QUEUE_MAP` constant that maps each queue name to its owning engine:
```typescript
export const ENGINE_QUEUE_MAP: Record<string, string> = {
  'product-scan': 'discovery',
  'enrich-product': 'discovery',
  'trend-scan': 'trend-detection',
  'tiktok-discovery': 'tiktok-discovery',
  'tiktok-product-extract': 'tiktok-discovery',
  'tiktok-engagement-analysis': 'tiktok-discovery',
  'tiktok-cross-match': 'tiktok-discovery',
  'product-clustering': 'clustering',
  'trend-detection': 'trend-detection',
  'creator-matching': 'creator-matching',
  'amazon-intelligence': 'amazon-intelligence',
  'shopify-intelligence': 'shopify-intelligence',
  'ad-intelligence': 'ad-intelligence',
  'influencer-discovery': 'influencer-discovery',
  'supplier-discovery': 'supplier-discovery',
};
```

### B.3: Create engine-namespaced API routes (6 batches)

| Batch | Task | Files (≤3) | Mapped From |
|-------|------|-----------|-------------|
| B.8 | Create `/api/engine/discovery/scan/route.ts` — delegates to existing scan logic | route file | `/api/admin/scan` |
| B.9 | Create `/api/engine/discovery/products/route.ts` — delegates to existing products logic | route file | `/api/admin/products` |
| B.10 | Create `/api/engine/tiktok/discover/route.ts` + `/api/engine/tiktok/videos/route.ts` | 2 route files | `/api/admin/tiktok/*` |
| B.11 | Create `/api/engine/scoring/calculate/route.ts` + `/api/engine/intelligence/clusters/route.ts` | 2 route files | `/api/admin/scoring`, `/api/admin/clusters` |
| B.12 | Create `/api/engine/creators/matches/route.ts` + `/api/engine/creators/influencers/route.ts` | 2 route files | `/api/admin/creator-matches`, `/api/admin/influencers` |
| B.13 | Create `/api/engine/suppliers/route.ts` + `/api/engine/ads/route.ts` | 2 route files | `/api/admin/suppliers`, `/api/admin/ads` |

**Pattern for each route:**
```typescript
// /api/engine/{engine-name}/{action}/route.ts
// Thin proxy that delegates to existing logic
// Keeps old route working (backward compat)
// Adds engine-namespace for v8 compliance
import { existingHandler } from '@/app/api/admin/xxx/route';
export { existingHandler as GET, existingHandler as POST };
// OR: import the shared logic function and call it
```

### B.4: Integration verification (2 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| B.14 | Add tests for new engine wrappers (clustering, trend-detection, creator-matching, ad-intelligence, opportunity-feed) | `tests/engine-system.test.ts` |
| B.15 | Update development_log.md + todo.md + trace log — Phase B COMPLETE | `system/development_log.md`, `tasks/todo.md` |

**Phase B Exit Criteria:**
- [ ] All 8 engines wrapped in Engine interface (3 from Phase 0 + 5 new)
- [ ] Queue ownership map defined in `backend/src/jobs/types.ts`
- [ ] Engine-namespaced routes created (thin proxies to existing logic)
- [ ] All existing routes still work (zero breaking changes)
- [ ] Tests pass for all new engine wrappers
- [ ] TypeScript compiles cleanly

---

## PHASE C: FRONTEND DESIGN
### Goal: Design the UI against the new engine-based architecture

**Estimated batches: 10 micro-batches**
**Max duration: 2 sessions**

### Principle
Now that engines are bounded contexts with clear API contracts, the frontend
should be designed to consume engine APIs directly. Each admin page maps to
one or more engines. The design phase creates TYPE CONTRACTS and COMPONENT
INTERFACES — not full implementations.

### C.1: Define frontend engine client types (3 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| C.1 | Create engine API client type contracts — discovery, tiktok, scoring | `src/lib/api/engine-clients.ts` |
| C.2 | Add engine API client types — clustering, creators, intelligence | `src/lib/api/engine-clients.ts` (extend) |
| C.3 | Create shared API response types + error handling contract | `src/lib/api/types.ts` |

**Pattern:**
```typescript
// src/lib/api/engine-clients.ts
export interface DiscoveryEngineAPI {
  scan(params: ScanParams): Promise<ScanResult>;
  getProducts(filters: ProductFilters): Promise<PaginatedProducts>;
}
export interface ScoringEngineAPI {
  calculate(productId: string): Promise<ScoreResult>;
  getBatchScores(productIds: string[]): Promise<ScoreResult[]>;
}
// ... for each engine
```

### C.2: Design component interfaces (4 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| C.4 | Design EngineStatusCard component interface (shows engine health, last run, metrics) | `src/components/engines/types.ts` |
| C.5 | Design EngineDashboardPanel interface (per-engine mini dashboard widget) | `src/components/engines/types.ts` (extend) |
| C.6 | Design EngineControlPanel interface (start/stop/configure engine) | `src/components/engines/types.ts` (extend) |
| C.7 | Design shared data table component interface (reusable across engine pages) | `src/components/data-table/types.ts` |

### C.3: Design page layouts (3 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| C.8 | Design admin dashboard layout — engine status grid + KPIs + recent activity | `src/components/layouts/admin-dashboard-design.ts` |
| C.9 | Design engine detail page layout — header + metrics + data table + controls | `src/components/layouts/engine-detail-design.ts` |
| C.10 | Update sidebar navigation to reflect engine groupings + update todo/trace | `src/components/admin-sidebar.tsx` (design review only), `tasks/todo.md` |

**Phase C Exit Criteria:**
- [ ] Engine API client types defined for all 8 engines
- [ ] Shared API response/error types created
- [ ] Component interfaces for EngineStatusCard, EngineDashboardPanel, EngineControlPanel
- [ ] Data table component interface designed
- [ ] Page layout contracts for dashboard and engine detail pages
- [ ] TypeScript compiles cleanly
- [ ] All types are exported and importable

---

## PHASE D: FRONTEND BUILD
### Goal: Implement the designs from Phase C

**Estimated batches: 20 micro-batches**
**Max duration: 3-4 sessions**

### Principle
Build against the contracts from Phase C. Each component gets its own batch.
Test each component in isolation. Wire to real API endpoints from Phase B.

### D.1: Build shared infrastructure (4 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| D.1 | Build engine API client — fetch wrapper with auth, error handling, typed responses | `src/lib/api/engine-client.ts` |
| D.2 | Build useEngine hook — generic hook for engine data fetching + realtime updates | `src/hooks/use-engine.ts` |
| D.3 | Build DataTable component — sortable, filterable, paginated table | `src/components/data-table/data-table.tsx` |
| D.4 | Build DataTable column definitions helper + export | `src/components/data-table/columns.tsx`, `src/components/data-table/index.ts` |

### D.2: Build engine UI components (4 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| D.5 | Build EngineStatusCard component | `src/components/engines/engine-status-card.tsx` |
| D.6 | Build EngineDashboardPanel component | `src/components/engines/engine-dashboard-panel.tsx` |
| D.7 | Build EngineControlPanel component | `src/components/engines/engine-control-panel.tsx` |
| D.8 | Build engines barrel export + EnginePageLayout wrapper | `src/components/engines/index.ts`, `src/components/engines/engine-page-layout.tsx` |

### D.3: Rebuild admin dashboard page (3 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| D.9 | Refactor admin dashboard — replace inline logic with EngineStatusCard grid | `src/app/admin/page.tsx` |
| D.10 | Add KPI row + recent activity feed to admin dashboard | `src/app/admin/page.tsx` |
| D.11 | Add engine health summary + system status panel to admin dashboard | `src/app/admin/page.tsx` |

### D.4: Refactor engine detail pages (6 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| D.12 | Refactor scan control page to use EngineControlPanel + engine API client | `src/app/admin/scan/page.tsx` |
| D.13 | Refactor products page to use DataTable + engine API client | `src/app/admin/products/page.tsx` |
| D.14 | Refactor TikTok page to use EnginePageLayout + DataTable | `src/app/admin/tiktok/page.tsx` |
| D.15 | Refactor trends page to use EnginePageLayout + DataTable | `src/app/admin/trends/page.tsx` |
| D.16 | Refactor clusters page to use EnginePageLayout + DataTable | `src/app/admin/clusters/page.tsx` |
| D.17 | Refactor creator-matches page to use EnginePageLayout + DataTable | `src/app/admin/creator-matches/page.tsx` |

### D.5: Refactor remaining pages (3 batches)

| Batch | Task | Files (≤3) |
|-------|------|-----------|
| D.18 | Refactor influencers + suppliers pages | `src/app/admin/influencers/page.tsx`, `src/app/admin/suppliers/page.tsx` |
| D.19 | Refactor ads + competitors pages | `src/app/admin/ads/page.tsx`, `src/app/admin/competitors/page.tsx` |
| D.20 | Final verification — tsc compile, test run, update docs | `system/development_log.md`, `tasks/todo.md` |

**Phase D Exit Criteria:**
- [ ] Engine API client working with typed responses
- [ ] useEngine hook providing data fetching + realtime
- [ ] DataTable component reusable across all engine pages
- [ ] EngineStatusCard, EngineDashboardPanel, EngineControlPanel built
- [ ] Admin dashboard refactored with engine status grid
- [ ] All engine detail pages using EnginePageLayout + DataTable
- [ ] TypeScript compiles cleanly
- [ ] All existing tests pass
- [ ] Zero breaking changes to existing functionality

---

## EXECUTION ORDER — THE CRITICAL PATH

```
Phase B (15 batches) → Phase C (10 batches) → Phase D (20 batches)
Total: 45 micro-batches
Each batch: ≤3 files, 1 commit, 2-5 minutes

B.1-B.5:   Wrap remaining 5 engines        → Engine system complete
B.6-B.7:   Queue ownership annotations      → Backend fully mapped
B.8-B.13:  Engine-namespaced API routes      → API v8 compliant
B.14-B.15: Verify + document                → Phase B done

C.1-C.3:   Engine API client types           → Frontend contracts ready
C.4-C.7:   Component interfaces              → UI contracts ready
C.8-C.10:  Page layout designs               → Phase C done

D.1-D.4:   Shared infrastructure             → Foundation for all pages
D.5-D.8:   Engine UI components              → Reusable building blocks
D.9-D.11:  Admin dashboard rebuild           → Main page upgraded
D.12-D.17: Engine detail page refactors      → All pages upgraded
D.18-D.20: Remaining pages + final verify    → Phase D done
```

---

## DEPENDENCY GRAPH

```
Phase 0 (DONE)
    │
    ├── EventBus ─────────────────┐
    ├── EngineRegistry ───────────┤
    └── 3 Engine wrappers ────────┤
                                  │
Phase B ◄─────────────────────────┘
    │
    ├── B.1-B.5: 5 more engine wrappers
    ├── B.6-B.7: Queue ownership
    ├── B.8-B.13: Engine-namespaced routes
    └── B.14-B.15: Verification
                │
Phase C ◄───────┘
    │
    ├── C.1-C.3: API client types (depends on B routes)
    ├── C.4-C.7: Component interfaces
    └── C.8-C.10: Page layouts
                │
Phase D ◄───────┘
    │
    ├── D.1-D.4: Infrastructure (depends on C types)
    ├── D.5-D.8: Engine components (depends on D.1-D.4)
    ├── D.9-D.11: Dashboard (depends on D.5-D.8)
    ├── D.12-D.17: Detail pages (depends on D.5-D.8)
    └── D.18-D.20: Final pages + verify
```

---

## ANTI-PATTERNS — DO NOT DO THESE

| Anti-Pattern | Why It's Wrong | Do This Instead |
|-------------|---------------|-----------------|
| Rebuild existing pages from scratch | Violates G01 | Refactor incrementally — add engine components, remove inline logic |
| Create new Supabase clients | Violates G05 | Use existing `src/lib/supabase/*` singletons |
| Add features not in the batch plan | Scope creep kills momentum | Stick to ≤3 files per batch |
| Skip the trace log | Recovery becomes impossible | Log EVERY batch to `system/execution_trace.md` |
| Batch more than 3 files | Breaks the micro-batch contract | Split into sub-batches |
| Ask "should I continue?" | Wastes time | Just execute the next batch |
| Summarize what you're about to do | Wastes tokens | Just do it |
| Start Phase C before Phase B is done | Dependencies will break | Follow the critical path |
| Delete old API routes | Breaking change | Keep old routes, add new engine-namespaced ones |

---

## QUICK REFERENCE — FILE LOCATIONS

| Category | Path |
|----------|------|
| Engine types | `src/lib/engines/types.ts` |
| Event bus | `src/lib/engines/event-bus.ts` |
| Engine registry | `src/lib/engines/registry.ts` |
| Engine barrel | `src/lib/engines/index.ts` |
| Backend jobs | `backend/src/jobs/*.ts` |
| Queue types | `backend/src/jobs/types.ts` |
| Admin API routes | `src/app/api/admin/*/route.ts` |
| Dashboard API routes | `src/app/api/dashboard/*/route.ts` |
| Admin pages | `src/app/admin/*/page.tsx` |
| Dashboard pages | `src/app/dashboard/*/page.tsx` |
| Components | `src/components/*.tsx` |
| UI primitives | `src/components/ui/*.tsx` |
| Supabase client | `src/lib/supabase/client.ts` (browser), `server.ts`, `admin.ts` |
| Auth | `src/lib/auth/*.ts` |
| Scoring | `src/lib/scoring/composite.ts` |
| Tests | `tests/engine-system.test.ts` |
| Execution trace | `system/execution_trace.md` |
| Dev log | `system/development_log.md` |
| Todo | `tasks/todo.md` |
| Lessons | `tasks/lessons.md` |
| v8 Spec | `docs/YouSell_Platform_Technical_Specification_v8.md` |

---

## SESSION START CHECKLIST

```
[ ] Boot sequence complete (CLAUDE.md + trace + dev log + todo + lessons)
[ ] On correct git branch
[ ] Last trace entry identified
[ ] Next batch identified from this file
[ ] No uncommitted changes from previous session
[ ] Ready to execute — no preamble needed
```

---

END OF PROMPT — Phases B, C, D defined.
Total: 45 micro-batches across 3 phases.
Start at B.1. Execute until done. No questions. No waiting.
