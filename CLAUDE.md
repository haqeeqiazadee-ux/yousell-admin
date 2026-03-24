# YOUSELL Platform — Claude Project Context (WARMODE v3)

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
  → Read system/development_log.md                            (history)

PARALLEL GROUP 2 (launch simultaneously):
  → Read tasks/todo.md                                        (current tasks)
  → Read tasks/lessons.md                                     (mistake patterns)

PARALLEL GROUP 3 (launch simultaneously):
  → Read docs/YouSell_Platform_Technical_Specification_v8.md  (architecture — first 200 lines minimum)
  → Read system/ai_logic.md                                   (operational logic)
```

After boot, output exactly:

```
WARMODE v3 BOOT COMPLETE
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
3. PROJECT PURPOSE
================================================================

YOUSELL is an AI-powered commerce intelligence SaaS platform.

It discovers trending products across marketplaces, scores viability,
matches influencers/suppliers, generates launch blueprints, provisions
stores, automates content/marketing, and tracks fulfilment.

Two applications:
- **YouSell Intelligence Engine** (admin.yousell.online) — admin product discovery & management
- **YouSell Client Platform** (yousell.online) — client-facing SaaS dashboard

Users: Super admins, admin operators, client businesses.


================================================================
4. REPOSITORY STRUCTURE
================================================================

```
yousell-admin/
├── CLAUDE.md                             — THIS FILE (WARMODE v3)
├── system/
│   ├── development_log.md                — Change history and session log
│   ├── execution_trace.md                — LIVE execution trace
│   ├── ai_logic.md                       — Platform operational logic
│   └── yousell_master_qa_prompt_v7.md    — QA execution prompt
├── docs/
│   ├── YouSell_Platform_Technical_Specification_v8.md — Master architecture (THE BIBLE)
│   ├── content_publishing_shop_integration_strategy.md
│   ├── USE_CASE_DIAGRAM.md
│   ├── MARKET_RESEARCH_LOG_SESSION3.md
│   └── v9/                               — V9 engine docs (task breakdown, checklists, test strategy)
├── tasks/
│   ├── todo.md                           — Task planning and progress
│   ├── lessons.md                        — Mistake patterns (review every session)
│   └── execution_plan.md                 — Step-by-step implementation plan
├── archive/                              — Deprecated files (reference only)
├── src/
│   ├── app/                              — Next.js App Router pages & API routes
│   ├── components/                       — UI components
│   ├── hooks/                            — React hooks
│   ├── lib/                              — Shared utilities and clients
│   └── middleware.ts                     — Auth/routing middleware
├── backend/                              — Express API and workers
└── supabase/                             — Database migrations
```


================================================================
5. CANONICAL ARCHITECTURE
================================================================

Single source of truth:

    docs/YouSell_Platform_Technical_Specification_v8.md

**v8 supersedes ALL prior documents.** If anything conflicts, v8 wins.

### V9 ENGINE TASK BREAKDOWN (MANDATORY REFERENCE)

**Before starting ANY engine-related task, READ:**

    docs/v9/V9_Engine_Task_Breakdown.md            — 668 atomic tasks across 14 engines
    docs/v9/V9_Gap_Closure_Execution_Plan.md       — 23 test batches (all complete)
    docs/v9/V9_Inter_Engine_Communication_Breakdown.md — 44 Comm pathways
    docs/v9/V9_Inter_Engine_Checklist.md             — Completion checklist (all gaps closed)
    docs/v9/V9_Inter_Engine_Communication_Test_Strategy.md — Test strategy

**V9 Engine Status (as of 2026-03-24):**
- 25 engines implemented (24 original + Governor)
- 14 discovery providers (all V9 platforms covered)
- 23/23 test batches complete (148+ tests across 33 files)
- Media generation: Bannerbear (images) + Shotstack (video)
- All P0/P1/P2 tasks complete — 0 remaining engine tasks
- Phase 8: Production hardening complete (Redis EventBus, structured logging, monitoring, alerting, circuit breakers, deep health checks)
- Phase 8B: All infrastructure wired — 8 circuit breakers active, 14 files with structured logging
- UI Polish Sprint (P0-P11): auth fixes, 10 new pages, theme consistency, pagination, governor overrides
- Migration 032 (system_alerts) applied to Supabase
- 32 migrations, 53 tables, 105 API routes, 44 admin pages, 11 dashboard pages


================================================================
6. TECHNOLOGY STACK
================================================================

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui |
| Hosting | Netlify (frontend), Railway (backend services) |
| Backend | Node.js, Express API, BullMQ job queue, Redis |
| Database | Supabase PostgreSQL, Supabase Auth, Supabase Realtime |
| Payments | Stripe (Checkout, Webhooks, Customer Portal) |
| Scraping | Apify Actors |
| AI | Anthropic Claude API (Haiku for bulk, Sonnet for premium) |
| Email | Resend API |
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
8. DEVELOPMENT GUARDRAILS (HARD RULES — VIOLATING = BUG)
================================================================

| # | Rule |
|---|------|
| G01 | Do NOT rebuild completed functionality |
| G02 | Always inspect the repo before creating new files |
| G03 | Only implement missing or broken components |
| G04 | Always check `system/development_log.md` before starting work |
| G05 | Use the existing Supabase singleton client — never create another |
| G06 | Use Apify actors as the primary scraping method |
| G07 | Ensure compatibility with Netlify deployment constraints |
| G08 | Never run scraping logic inside API request handlers |
| G09 | API routes serve stored/cached data — never trigger live scraping |
| G10 | All automation jobs DISABLED by default — manual-first cost control |
| G11 | Apply cost optimizations from day one |
| G12 | Use Claude Haiku for bulk operations, Sonnet only for premium |
| G13 | Store OAuth tokens encrypted; never handle client passwords |
| G14 | Update `system/development_log.md` after each meaningful change |
| G15 | Update `system/execution_trace.md` after every task step |
| G16 | v8 spec is the architecture bible |
| G17 | Never silently swallow errors — log or surface them |
| G18 | No placeholder/stub implementations marked as "done" |
| G19 | Max 3 files changed per micro-batch |
| G20 | Every batch must be independently committable |
| G21 | **Split large docs/writes into ≤150-line chunks** — never write a full doc in one tool call. Write section-by-section to avoid timeouts. |
| G22 | **Max single Write/Edit output: 150 lines** — if content exceeds this, split into multiple sequential writes (append pattern). |
| G23 | **Prefer append-to-file over monolithic write** — for docs >100 lines, create file with header first, then append sections one at a time. |
| G24 | **Timeout prevention: plan before write** — for any file >200 lines, outline all sections first, then write each section as a separate tool call. |


================================================================
9. FULL AUTONOMOUS EXECUTION ENGINE
================================================================

### 9.1 AUTONOMOUS MODE (DEFAULT — NO APPROVAL NEEDED BETWEEN BATCHES)

Claude operates in **full auto mode**:

- **Do NOT ask permission** between micro-batches. Just execute.
- **Do NOT ask "should I continue?"** — yes, always continue.
- **Do NOT summarize what you're about to do** — just do it.
- **Do NOT wait for feedback** unless explicitly blocked.
- Make decisions. Document why. Keep moving.
- If two approaches seem equal, pick the simpler one and go.
- Only stop for: (1) ambiguous requirements, (2) destructive operations on production, (3) architectural decisions not covered by v8.

### 9.2 MAX RESOURCE UTILIZATION

- **Subagents are MANDATORY** for any task with 2+ independent research needs
- Launch **multiple subagents simultaneously** — never serialize what can parallelize
- Use subagents for: file exploration, code audits, dependency mapping, test verification
- Main context window is for: decision-making, writing code, committing
- **Offload ALL heavy reads to subagents** — keep main context lean and fast
- When given a large task, decompose into parallel subtasks and fan out immediately
- One subagent = one focused job. Never overload a single subagent.

### 9.3 MICRO-BATCH PATTERN (THE CORE LOOP)

**This is the heartbeat of every session. Never deviate.**

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
│  Total time per loop: 2-5 minutes           │
│  Max files per loop: 3                      │
│  Max uncommitted changes: NEVER             │
└─────────────────────────────────────────────┘
```

**Why micro-batches?**
- Context compression can't destroy committed work
- Every commit is a save point — recovery is instant
- Small diffs are easy to review and revert
- Claude never "loses track" because each batch is tiny
- Progress is always visible in the trace log

### 9.4 SELF-CORRECTION LOOP

- After ANY user correction → update `tasks/lessons.md` immediately
- Write a prevention rule, not just a description
- Review lessons at session start (part of boot sequence)
- If the same mistake happens twice → escalate to a guardrail in this file

### 9.5 VERIFICATION GATES

Every batch must pass before marking DONE:
- TypeScript compiles (`npx tsc --noEmit` or equivalent)
- No import errors
- No runtime errors in modified code paths
- Existing tests still pass (if test framework exists)
- Self-review: "Would a staff engineer approve this?"

### 9.6 AUTONOMOUS BUG FIXING

When given a bug report:
1. Read the error/logs
2. Find root cause (use subagents for exploration)
3. Fix it
4. Verify the fix
5. Commit and move on

Zero questions asked. Zero context switching for the user.


================================================================
10. LIVE EXECUTION TRACE LOG
================================================================

### Purpose

The execution trace is a **persistent, append-only, crash-recovery journal**.
It is the MOST IMPORTANT file in the project after this one.

It serves as:
- **Crash recovery** — after compression, Claude reconstructs from here
- **Audit trail** — user sees what was done, when, and why
- **Deduplication guard** — check before working to avoid repeating steps
- **Progress dashboard** — real-time view of what's done vs pending

### File Location

    system/execution_trace.md

### Entry Format

```markdown
### [YYYY-MM-DD HH:MM] <STATUS> — <Short description>

- **Task:** <What was being done>
- **Batch:** <Batch ID if applicable, e.g., 0.3>
- **Action:** <Specific action taken>
- **Files touched:** <list of files created/modified>
- **Result:** SUCCESS | PARTIAL | FAILED | BLOCKED
- **Next step:** <What should happen next>
- **Commit:** <git short SHA or "uncommitted">
```

### Status Tags

| Tag | Meaning |
|-----|---------|
| `START` | Beginning a new task/batch |
| `PROGRESS` | Mid-task checkpoint (forced every 15 min) |
| `DONE` | Task completed and verified |
| `FAILED` | Task failed — includes reason and pivot plan |
| `BLOCKED` | Blocked on external dependency |
| `RECOVERY` | Re-entering after context compression |
| `CORRECTION` | Fixing a mistake from a previous step |
| `PIVOT` | Changing approach after failed attempts |

### Trace Rules (NON-NEGOTIABLE)

1. **Append-only** — never edit or delete previous entries
2. **Log BEFORE and AFTER** — every task gets START + DONE/FAILED minimum
3. **Log on recovery** — first action after compression = RECOVERY entry
4. **Include next step** — future-Claude must know exactly where to pick up
5. **Include commit SHA** — ties trace to verifiable code state
6. **Force checkpoint every 15 minutes** — even mid-batch
7. **Keep entries concise** — 3-5 lines, not paragraphs


================================================================
11. TASK MANAGEMENT PROTOCOL
================================================================

### The Flow (Sequential — No Skipping)

```
1. CHECK  → Read execution_trace.md — am I resuming?
2. PLAN   → Write plan to tasks/todo.md (checkable items)
3. TRACE  → Log START in execution_trace.md
4. BUILD  → Execute the micro-batch (≤3 files)
5. VERIFY → Prove it works
6. TRACE  → Log DONE/FAILED in execution_trace.md
7. LOG    → Update system/development_log.md
8. COMMIT → git add specific files + git commit
9. LOOP   → Back to step 1 for next batch
```

### Autonomous Decision Rules

| Situation | Action |
|-----------|--------|
| Task is clear | Execute immediately. No preamble. |
| Task is ambiguous | Check v8 spec first. If still unclear, ask user. |
| Two valid approaches | Pick simpler one. Document why in trace. |
| Something breaks | Fix it in the current batch. Don't defer. |
| Batch is too large | Split it. Log the split in trace. |
| Blocked by external dep | Mock it. Move on. Log BLOCKED entry. |
| User gives feedback | Update lessons.md. Apply immediately. |
| Context feels compressed | Trigger recovery protocol. No questions. |


================================================================
12. MEMORY SAFEGUARD CHECKLIST
================================================================

Claude must verify these **before every code change**:

```
[ ] I have run the boot sequence this session
[ ] I checked execution_trace.md for last known state
[ ] I checked development_log.md for relevant history
[ ] I am NOT rebuilding something that already exists
[ ] I verified all file paths with Glob/Read (no guessing)
[ ] This batch touches ≤3 files
[ ] I will log this action in execution_trace.md when done
[ ] I will commit immediately after this batch
```

**If ANY box fails → pause, fix it, then proceed.**


================================================================
13. CORE PRINCIPLES
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
14. PROJECT MEMORY SYSTEM (FILE REGISTRY)
================================================================

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `CLAUDE.md` | Project rules and guardrails (THIS FILE) | On rule changes |
| `system/execution_trace.md` | **LIVE execution trace — MOST CRITICAL** | **Every batch** |
| `system/development_log.md` | Change history and session log | After each meaningful change |
| `system/ai_logic.md` | Platform operational logic | On logic changes |
| `docs/YouSell_Platform_Technical_Specification_v8.md` | Master architecture (THE BIBLE) | On architecture changes |
| `tasks/todo.md` | Task planning and progress | Continuously |
| `tasks/lessons.md` | Patterns and lessons from corrections | After every correction |
| `tasks/execution_plan.md` | Step-by-step implementation plan | On plan changes |
| `system/final_step_logs.md` | Last actions before session end — quick recovery | After each session |
| `docs/v9/V9_Engine_Task_Breakdown.md` | 668 atomic tasks across 14 engines | Reference only |
| `docs/v9/V9_Inter_Engine_Checklist.md` | Inter-engine completion checklist | Reference only |
| `docs/content_publishing_shop_integration_strategy.md` | Content & shop integration | On strategy changes |
| `docs/USE_CASE_DIAGRAM.md` | Use case diagrams and data flows | On flow changes |
| `docs/MARKET_RESEARCH_LOG_SESSION3.md` | Market research (80+ sources) | On new research |
| `docs/YOUSELL_INTEGRATION_WIRING.md` | **UI ↔ API ↔ DB wiring map (VERIFIED)** | On UI/API changes |


================================================================
15. EMERGENCY PROTOCOLS
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
3. Read development_log.md for recent history
4. If still confused, announce the specific confusion and recover
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
16. SPEED MULTIPLIERS
================================================================

These patterns make Claude faster. Use them aggressively.

| Pattern | How |
|---------|-----|
| Parallel boot | Read 2-3 files simultaneously during boot |
| Subagent fan-out | Launch 3-4 subagents for independent research |
| Speculative reads | Read files you'll probably need before you need them |
| Batch pre-planning | While committing batch N, mentally prep batch N+1 |
| Skip preamble | Don't explain what you're about to do. Just do it. |
| Inline verification | Verify as you build, not as a separate pass |
| Commit immediately | Don't accumulate. Commit the moment a batch is done. |
| Background subagents | Launch research agents in background while you code |


================================================================
END OF PROMPT — WARMODE v3 ACTIVE
================================================================

If you read this far, the boot sequence worked.
Now find the next batch in the trace log and execute it.
No preamble. No summary. Just build.
