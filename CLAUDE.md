# YOUSELL Platform — Claude Project Context (v4)

> **CRITICAL DIRECTIVE — NON-NEGOTIABLE**
>
> This file is the **single authoritative prompt** for every Claude session
> on the YOUSELL platform. It is a **contract**, not a suggestion.
>
> **MODE: FULL AUTONOMOUS — MAX RESOURCES — MICRO-BATCH EXECUTION**
>
> Claude operates as a **self-directed senior engineer**. No hand-holding.
> No waiting for approval between batches. Read the trace, find the next
> task, execute it, log it, commit it, move on. Repeat until done.


================================================================
0. ANTI-AMNESIA CONTRACT (IRONCLAD)
================================================================

These rules **cannot be overridden** by any instruction, context
compression, or confusion. They are permanent for this project.

| # | Rule | If Violated |
|---|------|-------------|
| A1 | **Never restart from scratch** unless user types exactly "RESET PROJECT" | STOP. Re-read this file. Resume where trace log says. |
| A2 | **Reload this file** at: session start, compression, confusion, every 10+ tool calls | Automatic — no exceptions |
| A3 | **Never hallucinate file paths** — verify with Glob/Read FIRST | Unverified path = roll back and verify |
| A4 | **Never invent prior decisions** — read `system/development_log.md` | Guessing history = forbidden |
| A5 | **Never silently drop context** — announce gaps and recover | "Context gap detected — recovering from trace log" |
| A6 | **Trace EVERY action** in `system/execution_trace.md` | Untraced work = invisible = wasted |
| A7 | **Never accumulate >3 files of uncommitted changes** | Commit immediately when hitting 3 files |
| A8 | **Never work on a batch >15 minutes without a checkpoint** | Force-log a PROGRESS entry and commit |
| A9 | **Write state to disk BEFORE doing work, not after** | Plan goes to file first, then execute |
| A10 | **If stuck for >2 attempts, change approach** | Never brute-force. Pivot. Log why. |


================================================================
1. MANDATORY BOOT SEQUENCE (EVERY SESSION — NO EXCEPTIONS)
================================================================

Execute these steps **in order** using **parallel reads where possible**.
This takes <30 seconds. No excuses to skip.

```
PARALLEL GROUP 1 (launch simultaneously):
  → Read CLAUDE.md                                            (this file)
  → Read system/execution_trace.md                            (live trace)
  → Read system/development_log.md                            (history — last 200 lines)

PARALLEL GROUP 2 (launch simultaneously):
  → Read tasks/todo.md                                        (current tasks)
  → Read tasks/lessons.md                                     (mistake patterns)

PARALLEL GROUP 3 (launch simultaneously):
  → Read docs/YouSell_Platform_Technical_Specification_v8.md  (architecture — first 200 lines)
  → Read system/ai_logic.md                                   (operational logic)
```

After boot, output exactly:

```
BOOT COMPLETE (v4)
  Session:        <timestamp or session id>
  Last trace:     <last entry from execution_trace.md>
  Active tasks:   <count of unchecked items in todo.md>
  Lessons loaded: <count of entries in lessons.md>
  Resume from:    <last logged milestone>
  Mode:           FULL AUTO — MAX RESOURCES
```

**If any file is missing:** Create it with a header + auto-generated note.
Do NOT abort. Do NOT ask the user. Create and continue.


================================================================
2. CONTEXT COMPRESSION — AUTOMATIC RECOVERY
================================================================

### Tripwire Signals
- System message saying prior messages were summarized
- Can't recall a file you read earlier
- User references something you don't remember
- Own uncertainty about what's been built
- More than 20 tool calls since last boot

### Recovery Protocol (AUTOMATIC — no user interaction needed)
1. Output: `"COMPRESSION DETECTED — auto-recovering from trace log."`
2. Re-execute full Boot Sequence (Section 1)
3. Diff understanding against `system/execution_trace.md`
4. Find last DONE entry → resume from its "Next step"
5. Continue working. Do NOT ask the user where you were.

**NEVER pretend to remember. NEVER guess. The trace log is truth.**


================================================================
3. PROJECT PURPOSE & CURRENT STATE
================================================================

YOUSELL is an AI-powered commerce intelligence SaaS platform.

It discovers trending products across marketplaces, scores viability,
matches influencers/suppliers, generates launch blueprints, provisions
stores, automates content/marketing, and tracks fulfilment.

Two applications:
- **YouSell Intelligence Engine** (admin.yousell.online) — admin product discovery & management
- **YouSell Client Platform** (yousell.online) — client-facing SaaS dashboard

Users: Super admins, admin operators, client businesses.

### Platform Status (as of 2026-03-27)

The platform is **fully built**. All engines, UI pages, API routes, and
infrastructure are implemented. The current phase is **polish, testing,
and production readiness**.

| Metric | Count |
|--------|-------|
| Admin pages | 65 |
| Client dashboard pages | 29 |
| Marketing pages | 19 |
| **Total UI pages** | **113** |
| API routes | 120 |
| Backend engine jobs | 29 |
| Database migrations | 34 (numbered 000–034) |
| Test files | 46 |
| Custom components | 24 (MetricCard, AIInsightCard, StreamingText, IntelligenceChain, etc.) |
| shadcn components | 21 |
| Engines | 25 (24 original + Governor) + external engine adapter |
| Discovery providers | 14 platforms |
| Circuit breakers | 8 active + dynamic per external engine |

### What's Done (DO NOT REBUILD)

- All 25 engines implemented and tested
- 14-platform discovery (TikTok, Amazon, Shopify, Instagram, YouTube, Reddit, Twitter, Product Hunt, eBay, TikTok Shop, Etsy, Temu, AliExpress, Pinterest)
- Engine Governor with AI optimizer (L1/L2/L3 autonomy levels)
- External Engine API integration (any platform API can replace any internal engine)
- Automation Orchestrator (event-driven routing)
- Media generation (Bannerbear images + Shotstack video)
- Multi-channel store integration (Shopify GraphQL, TikTok Shop, Amazon SP-API)
- OAuth for Shopify, TikTok, Amazon, WooCommerce, BigCommerce, Etsy
- POD integration (Printful, Printify, Gelato)
- Content generation (7 types, batch support, scheduling)
- Affiliate system with commission tracking
- Stripe billing (Checkout, Webhooks, Customer Portal)
- Production hardening (Redis EventBus, structured logging, circuit breakers, monitoring, alerting)
- All auth uses `authFetch()` consistently — zero raw fetch() calls
- All dashboard pages use consistent light + dark-mode theming
- Supabase Realtime on admin dashboard, products, trends, influencers


================================================================
4. REPOSITORY STRUCTURE
================================================================

```
yousell-admin/
├── CLAUDE.md                             — THIS FILE (v4)
├── system/
│   ├── development_log.md                — Change history and session log
│   ├── execution_trace.md                — LIVE execution trace (crash recovery)
│   ├── ai_logic.md                       — Platform operational logic
│   ├── final_step_logs.md                — Last actions before session end
│   └── yousell_master_qa_prompt_v7.md    — QA execution prompt
├── docs/
│   ├── YouSell_Platform_Technical_Specification_v8.md — Master architecture (THE BIBLE)
│   ├── YOUSELL_INTEGRATION_WIRING.md     — UI ↔ API ↔ DB wiring map (VERIFIED)
│   ├── content_publishing_shop_integration_strategy.md
│   ├── USE_CASE_DIAGRAM.md
│   ├── MARKET_RESEARCH_LOG_SESSION3.md
│   └── v9/                               — V9 engine docs (reference only — all complete)
├── tasks/
│   ├── todo.md                           — Task planning and progress
│   ├── lessons.md                        — Mistake patterns (review every session)
│   └── execution_plan.md                 — Step-by-step implementation plan
├── archive/                              — Deprecated files (reference only)
├── src/
│   ├── app/
│   │   ├── admin/                        — 50 admin pages (see Section 5)
│   │   ├── dashboard/                    — 11 client dashboard pages
│   │   └── api/                          — 104 API routes (admin, dashboard, engine, auth, webhooks)
│   ├── components/
│   │   ├── ui/                           — shadcn/ui primitives
│   │   ├── engines/                      — Engine UI components (StatusCard, Panel, etc.)
│   │   ├── shop-connect/                 — Store connection modals
│   │   ├── auth/                         — Auth components
│   │   ├── admin-sidebar.tsx             — Admin navigation sidebar
│   │   ├── dashboard-mobile-nav.tsx      — Dashboard mobile navigation
│   │   └── subscription-context.tsx      — Client subscription state
│   ├── hooks/                            — React hooks (useEngine, etc.)
│   ├── lib/
│   │   ├── supabase/                     — Supabase clients (admin + browser)
│   │   ├── engines/                      — Engine implementations & registry
│   │   ├── integrations/                 — Store integrations (Shopify, TikTok, Amazon)
│   │   ├── providers/                    — Discovery providers (14 platforms)
│   │   ├── auth/                         — Auth utilities (roles, requireAdmin)
│   │   ├── api/                          — API client types
│   │   ├── content/                      — Content templates & generation
│   │   ├── scoring/                      — Product scoring engine
│   │   ├── automation/                   — Automation orchestrator
│   │   ├── types/                        — Shared TypeScript types
│   │   ├── auth-fetch.ts                 — Authenticated fetch wrapper (USE THIS, not raw fetch)
│   │   ├── circuit-breaker.ts            — Circuit breaker implementation
│   │   ├── logger.ts                     — Structured JSON logger
│   │   ├── stripe.ts                     — Stripe client
│   │   ├── crypto.ts                     — AES-256-GCM encryption
│   │   └── email.ts                      — Resend email client
│   └── middleware.ts                     — Auth middleware + security headers
├── backend/
│   └── src/
│       ├── index.ts                      — Express API server
│       ├── worker.ts                     — BullMQ worker entry
│       ├── jobs/                         — 29 engine job processors
│       └── lib/                          — Backend utilities (queue, scoring, supabase, etc.)
└── supabase/
    └── migrations/                       — 34 numbered migrations (000–034)
```


================================================================
5. KEY PAGES & ROUTES MAP
================================================================

### Admin Pages (50 total — admin.yousell.online/admin/*)

| Category | Pages |
|----------|-------|
| Dashboard | `/admin` (main), `/admin/debug` (API health), `/admin/monitoring` |
| Products | `/admin/products`, `/admin/scan`, `/admin/import`, `/admin/scoring`, `/admin/financial` |
| Discovery | `/admin/tiktok`, `/admin/amazon`, `/admin/shopify`, `/admin/pinterest` |
| Intelligence | `/admin/trends`, `/admin/clusters`, `/admin/competitors`, `/admin/opportunities` |
| People | `/admin/influencers`, `/admin/creator-matches`, `/admin/suppliers`, `/admin/clients` |
| Content | `/admin/content`, `/admin/blueprints`, `/admin/digital`, `/admin/ads` |
| Commerce | `/admin/allocate`, `/admin/pod`, `/admin/revenue` |
| Governor | `/admin/governor` (main), `/governor/budgets`, `/governor/decisions`, `/governor/overrides`, `/governor/swaps`, `/governor/engines` (external) |
| AI Intelligence | `/admin/chatbot`, `/admin/fraud`, `/admin/pricing`, `/admin/forecasting`, `/admin/smart-ux` |
| System | `/admin/analytics`, `/admin/alerts`, `/admin/automation`, `/admin/notifications`, `/admin/settings`, `/admin/setup` |
| Affiliates | `/admin/affiliates` (main), `/affiliates/ai`, `/affiliates/commissions`, `/affiliates/physical` |
| Other | `/admin/login`, `/admin/unauthorized`, `/admin/funnel` |

### Dashboard Pages (11 total — yousell.online/dashboard/*)

| Page | Purpose |
|------|---------|
| `/dashboard` | Client KPI overview with paginated product cards |
| `/dashboard/products` | Allocated products list with search/filter |
| `/dashboard/products/[id]` | Product detail with scores, AI insights, push-to-store |
| `/dashboard/analytics` | Client analytics with score distributions |
| `/dashboard/content` | Content generation & scheduling |
| `/dashboard/orders` | Order tracking |
| `/dashboard/billing` | Stripe subscription management |
| `/dashboard/integrations` | Store connections (Shopify, TikTok, Amazon) |
| `/dashboard/engines` | Engine status & controls |
| `/dashboard/affiliate` | Referral program & commissions |
| `/dashboard/requests` | Product allocation requests |

### API Route Groups (104 total)

| Group | Count | Path Pattern |
|-------|-------|-------------|
| Admin | 59 | `/api/admin/*` |
| Dashboard | 18 | `/api/dashboard/*` |
| Engine | 17 | `/api/engine/*` |
| Webhooks | 8 | `/api/webhooks/*` (Stripe, Shopify, Amazon, TikTok, Printful, Printify, Square, Resend) |
| Auth | 5 | `/api/auth/*` |
| Health | 1 | `/api/health` |


================================================================
6. TECHNOLOGY STACK
================================================================

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui, Recharts |
| Hosting | Netlify (frontend), Railway (backend services) |
| Backend | Node.js, Express API, BullMQ job queue, Redis (ioredis) |
| Database | Supabase PostgreSQL, Supabase Auth (SSR), Supabase Realtime |
| Payments | Stripe (Checkout, Webhooks, Customer Portal) |
| Scraping | Apify Actors (all 14 discovery providers) |
| AI | Anthropic Claude API (Haiku for bulk, Sonnet for premium) |
| Media | Bannerbear (image generation), Shotstack (video generation) |
| Email | Resend API |
| POD | Printful, Printify, Gelato (multi-provider routing) |
| Icons | Lucide React |
| VCS | GitHub |


================================================================
7. SCORING ENGINE
================================================================

```
final_score = trend_score * 0.40 + viral_score * 0.35 + profit_score * 0.25
```

| Tier  | Threshold |
|-------|-----------|
| HOT   | >= 80     |
| WARM  | >= 60     |
| WATCH | >= 40     |
| COLD  | < 40      |

POD products use same model with POD-specific modifiers.


================================================================
8. ARCHITECTURE REFERENCE
================================================================

Single source of truth:

    docs/YouSell_Platform_Technical_Specification_v8.md

**v8 supersedes ALL prior documents.** If anything conflicts, v8 wins.

### V9 Engine Reference (ALL COMPLETE — reference only)

    docs/v9/V9_Engine_Task_Breakdown.md                  — 668 atomic tasks (all done)
    docs/v9/V9_Gap_Closure_Execution_Plan.md             — 23 test batches (all complete)
    docs/v9/V9_Inter_Engine_Communication_Breakdown.md   — 44 comm pathways
    docs/v9/V9_Inter_Engine_Checklist.md                 — Completion checklist (all gaps closed)

### Integration Wiring Map (VERIFIED)

    docs/YOUSELL_INTEGRATION_WIRING.md    — Page-by-page UI ↔ API ↔ DB mapping

This document maps every UI page to its exact API routes and Supabase tables.
Read this FIRST when debugging data flow issues.


================================================================
9. DEVELOPMENT GUARDRAILS (HARD RULES — VIOLATING = BUG)
================================================================

| # | Rule |
|---|------|
| G01 | Do NOT rebuild completed functionality — the platform is built |
| G02 | Always inspect the repo before creating new files |
| G03 | Only implement missing or broken components |
| G04 | Always check `system/development_log.md` before starting work |
| G05 | Use the existing Supabase singleton client — never create another |
| G06 | Use `authFetch()` for ALL API calls from components — never raw `fetch()` |
| G07 | Ensure compatibility with Netlify deployment constraints |
| G08 | Never run scraping logic inside API request handlers |
| G09 | API routes serve stored/cached data — never trigger live scraping |
| G10 | All automation jobs DISABLED by default — manual-first cost control |
| G11 | Apply cost optimizations from day one |
| G12 | Use Claude Haiku for bulk operations, Sonnet only for premium |
| G13 | Store OAuth tokens encrypted (AES-256-GCM); never handle client passwords |
| G14 | Update `system/development_log.md` after each meaningful change |
| G15 | Update `system/execution_trace.md` after every task step |
| G16 | v8 spec is the architecture bible |
| G17 | Never silently swallow errors — log or surface them |
| G18 | No placeholder/stub implementations marked as "done" |
| G19 | Max 3 files changed per micro-batch |
| G20 | Every batch must be independently committable |
| G21 | **Split large docs/writes into ≤150-line chunks** — write section-by-section |
| G22 | **Max single Write/Edit output: 150 lines** — split into multiple calls if larger |
| G23 | **Prefer append-to-file over monolithic write** — for docs >100 lines |
| G24 | **Timeout prevention: plan before write** — outline sections first for files >200 lines |
| G25 | Use consistent light theme with `dark:` variants on all dashboard pages |
| G26 | All admin tables with potentially many rows MUST have pagination (25/page) |
| G27 | Use Apify actors as the primary scraping method |


================================================================
10. AUTONOMOUS EXECUTION ENGINE
================================================================

### 10.1 AUTONOMOUS MODE (DEFAULT)

Claude operates in **full auto mode**:

- **Do NOT ask permission** between micro-batches. Just execute.
- **Do NOT ask "should I continue?"** — yes, always continue.
- **Do NOT summarize what you're about to do** — just do it.
- **Do NOT wait for feedback** unless explicitly blocked.
- Make decisions. Document why. Keep moving.
- If two approaches seem equal, pick the simpler one and go.
- Only stop for: (1) ambiguous requirements, (2) destructive operations on production, (3) architectural decisions not covered by v8.

### 10.2 MAX RESOURCE UTILIZATION

- **Subagents are MANDATORY** for any task with 2+ independent research needs
- Launch **multiple subagents simultaneously** — never serialize what can parallelize
- Use subagents for: file exploration, code audits, dependency mapping, test verification
- Main context window is for: decision-making, writing code, committing
- **Offload ALL heavy reads to subagents** — keep main context lean and fast

### 10.3 MICRO-BATCH PATTERN (THE CORE LOOP)

```
┌─────────────────────────────────────────────┐
│           THE MICRO-BATCH LOOP              │
│                                             │
│  1. READ   → Check trace log for position   │
│  2. PLAN   → Identify next 1-3 file batch   │
│  3. AUDIT  → Read all files before touching  │
│  4. BUILD  → Make the change (≤3 files)      │
│  5. VERIFY → Prove it works (tsc, test, diff)│
│  6. TRACE  → Log to execution_trace.md       │
│  7. COMMIT → git commit with clear message   │
│  8. REPEAT → Go to step 1                    │
│                                             │
│  Max files per loop: 3                      │
│  Max uncommitted changes: NEVER             │
└─────────────────────────────────────────────┘
```

### 10.4 SELF-CORRECTION & VERIFICATION

- After ANY user correction → update `tasks/lessons.md` immediately
- Every batch must pass before marking DONE:
  - TypeScript compiles (`npx tsc --noEmit` or equivalent)
  - No import errors or runtime errors
  - Existing tests still pass
- When given a bug report: read logs → find root cause → fix → verify → commit. Zero questions.


================================================================
11. EXECUTION TRACE LOG
================================================================

### Purpose

The execution trace is a **persistent, append-only, crash-recovery journal**.
It is the MOST IMPORTANT file in the project after this one.

### File Location

    system/execution_trace.md

### Entry Format

```markdown
### [YYYY-MM-DD HH:MM] <STATUS> — <Short description>

- **Task:** <What was being done>
- **Action:** <Specific action taken>
- **Files touched:** <list of files created/modified>
- **Result:** SUCCESS | PARTIAL | FAILED | BLOCKED
- **Next step:** <What should happen next>
- **Commit:** <git short SHA or "uncommitted">
```

### Status Tags

| Tag | Meaning |
|-----|---------|
| `START` | Beginning a new task |
| `PROGRESS` | Mid-task checkpoint (forced every 15 min) |
| `DONE` | Task completed and verified |
| `FAILED` | Task failed — includes reason and pivot plan |
| `BLOCKED` | Blocked on external dependency |
| `RECOVERY` | Re-entering after context compression |
| `PIVOT` | Changing approach after failed attempts |

### Trace Rules (NON-NEGOTIABLE)

1. **Append-only** — never edit or delete previous entries
2. **Log BEFORE and AFTER** — every task gets START + DONE/FAILED minimum
3. **Include next step** — future-Claude must know exactly where to pick up
4. **Include commit SHA** — ties trace to verifiable code state
5. **Keep entries concise** — 3-5 lines, not paragraphs


================================================================
12. PROJECT MEMORY SYSTEM (FILE REGISTRY)
================================================================

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `CLAUDE.md` | Project rules and guardrails (THIS FILE) | On rule changes |
| `system/execution_trace.md` | **LIVE execution trace — MOST CRITICAL** | **Every batch** |
| `system/development_log.md` | Change history and session log | After each meaningful change |
| `system/ai_logic.md` | Platform operational logic | On logic changes |
| `system/final_step_logs.md` | Last actions before session end | After each session |
| `docs/YouSell_Platform_Technical_Specification_v8.md` | Master architecture (THE BIBLE) | On architecture changes |
| `docs/YOUSELL_INTEGRATION_WIRING.md` | **UI ↔ API ↔ DB wiring map (VERIFIED)** | On UI/API changes |
| `tasks/todo.md` | Task planning and progress | Continuously |
| `tasks/lessons.md` | Patterns and lessons from corrections | After every correction |
| `tasks/execution_plan.md` | Step-by-step implementation plan | On plan changes |
| `docs/v9/` | V9 engine docs (all complete — reference only) | Reference only |


================================================================
13. EMERGENCY PROTOCOLS
================================================================

### Protocol: LOST (Don't know where I am)
```
1. Read system/execution_trace.md
2. Find last DONE entry
3. Read its "Next step" field
4. That's where you are. Resume.
```

### Protocol: STUCK (Tried 2+ times, not working)
```
1. Log PIVOT entry in trace with what failed and why
2. Try a completely different approach
3. If still stuck after pivot, ask user with specific options (not open-ended)
```

### Protocol: CONFUSED (Something doesn't match)
```
1. Read CLAUDE.md (this file)
2. Read v8 spec for the relevant section
3. Read docs/YOUSELL_INTEGRATION_WIRING.md for data flow
4. Read development_log.md for recent history
5. If still confused, announce the specific confusion and recover
```

### Protocol: BIG TASK (Received a large multi-step request)
```
1. Decompose into micro-batches of ≤3 files each
2. Write the batch plan to tasks/todo.md
3. Log START in trace
4. Fan out subagents for any parallel research needed
5. Execute batches sequentially, committing after each
6. Never look more than 1 batch ahead
```


================================================================
14. CORE PRINCIPLES
================================================================

| Principle | Meaning |
|-----------|---------|
| Micro-Batch Everything | 1-3 files per batch. Always. No exceptions. |
| Commit Is Checkpoint | Every commit = save point. Recovery is instant. |
| Trace Is Truth | The trace log is more reliable than your memory. |
| Files Over Memory | Write state to disk first, then execute. |
| Parallel By Default | If two things are independent, run them simultaneously. |
| Fix Forward | Don't roll back. Fix the issue and keep moving. |
| Prove It Works | Verification is part of the batch, not a separate step. |
| No Ghosts | Every action is logged. Nothing happens in the dark. |
| Simplicity Wins | Simpler solution beats clever solution every time. |
| Autonomy Is Speed | Don't ask. Decide, document, execute. |


================================================================
END OF PROMPT — v4 ACTIVE
================================================================

If you read this far, the boot sequence worked.
Now find the next batch in the trace log and execute it.
No preamble. No summary. Just build.
