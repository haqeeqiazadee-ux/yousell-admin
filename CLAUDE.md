# YOUSELL Platform — Claude Project Context (Hardened v2)

> **CRITICAL DIRECTIVE — READ THIS FIRST**
>
> This file is the **single authoritative prompt** for every Claude session
> on the YOUSELL platform. It contains memory safeguards that **must not
> be skipped, summarized, or paraphrased**. Execute every numbered step
> exactly as written.


================================================================
0. ANTI-AMNESIA CONTRACT
================================================================

Claude agrees to the following **non-negotiable** memory contract:

| # | Rule | Enforcement |
|---|------|-------------|
| A1 | **Never restart from scratch** unless the user types the exact phrase "RESET PROJECT" | If tempted to rebuild, STOP and re-read this file |
| A2 | **Reload this file** at: session start, context compression, any sign of confusion | First action — before greeting the user |
| A3 | **Never hallucinate file paths or code** — verify existence with Glob/Read first | Any unverified path = immediate self-correction |
| A4 | **Never invent prior decisions** — if unsure, read `system/development_log.md` | Guessing history = forbidden |
| A5 | **Never silently drop context** — if you notice a gap, announce it and recover | "I notice my context may be incomplete — running recovery protocol" |
| A6 | **Trace every task** in `system/execution_trace.md` (see Section 12) | Untraced work = invisible work = wasted work |


================================================================
1. MANDATORY BOOT SEQUENCE
================================================================

**Every session** — including mid-session recovery — Claude must execute
these steps **in order, without skipping any**:

```
STEP 1 → Read  CLAUDE.md                                           (this file)
STEP 2 → Read  system/execution_trace.md                           (live trace)
STEP 3 → Read  system/development_log.md                           (history)
STEP 4 → Read  tasks/todo.md                                       (current tasks)
STEP 5 → Read  tasks/lessons.md                                    (mistake patterns)
STEP 6 → Read  docs/YouSell_Platform_Technical_Specification_v8.md (architecture)
STEP 7 → Read  system/ai_logic.md                                  (operational logic)
```

After completing the boot sequence, Claude must output:

```
BOOT COMPLETE
  Session:       <timestamp or session id>
  Last trace:    <last entry from execution_trace.md>
  Active tasks:  <count of unchecked items in todo.md>
  Lessons loaded: <count of entries in lessons.md>
  Ready to continue from: <last logged milestone>
```

**If any file is missing:** create it with a header and a note that it was
auto-generated, then continue. Do NOT abort.


================================================================
2. CONTEXT COMPRESSION TRIPWIRE
================================================================

Claude must watch for these **compression signals**:

- A system message indicating prior messages were summarized
- Inability to recall a file you read earlier in the session
- A user reference to something you have no memory of
- Your own uncertainty about what has been built

**On any signal, immediately:**

1. Announce: "Context compression detected — running recovery protocol."
2. Re-execute the full Boot Sequence (Section 1).
3. Diff your understanding against `system/execution_trace.md`.
4. Resume from the last verified trace entry.

**Never pretend to remember.** If you are unsure, say so and recover.


================================================================
3. PROJECT PURPOSE
================================================================

YOUSELL is an AI-powered commerce intelligence SaaS platform
with eight opportunity channels.

The system discovers trending e-commerce products across multiple
marketplaces, scores product viability, matches influencers and
suppliers, generates launch blueprints, provisions client stores,
automates content creation and marketing, and tracks orders through
fulfilment.

Two interconnected applications:
- **YouSell Intelligence Engine** (admin.yousell.online) — admin product discovery
- **YouSell Client Platform** (yousell.online) — client-facing SaaS dashboard

Primary Users:
- Super admins managing the platform
- Admin operators managing product discovery scans
- Client businesses receiving curated product opportunities


================================================================
4. REPOSITORY STRUCTURE
================================================================

```
yousell-admin/
├── CLAUDE.md                             — THIS FILE (hardened prompt v2)
├── system/
│   ├── development_log.md                — Change history and session log
│   ├── execution_trace.md                — LIVE execution trace (NEW)
│   ├── ai_logic.md                       — Platform operational logic
│   └── yousell_master_qa_prompt_v7.md    — QA execution prompt
├── docs/
│   ├── YouSell_Platform_Technical_Specification_v8.md — Master architecture
│   ├── content_publishing_shop_integration_strategy.md
│   ├── USE_CASE_DIAGRAM.md
│   └── MARKET_RESEARCH_LOG_SESSION3.md
├── tasks/
│   ├── todo.md                           — Task planning and progress
│   ├── lessons.md                        — Patterns and lessons
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

This document **supersedes** all prior build briefs.
If any file conflicts with v8, **v8 wins**.


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

Three-pillar scoring model:

```
final_score = trend_score * 0.40 + viral_score * 0.35 + profit_score * 0.25
```

| Tier  | Threshold |
|-------|-----------|
| HOT   | >= 80     |
| WARM  | >= 60     |
| WATCH | >= 40     |
| COLD  | < 40      |

POD products use the same model with POD-specific modifiers.


================================================================
8. DEVELOPMENT GUARDRAILS (HARD RULES)
================================================================

These are **non-negotiable**. Violating any rule is a bug.

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
| G16 | `docs/YouSell_Platform_Technical_Specification_v8.md` is the architecture bible |
| G17 | Never silently swallow errors — log or surface them |
| G18 | No placeholder/stub implementations marked as "done" |


================================================================
9. WORKFLOW ORCHESTRATION
================================================================

### 9.1 Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, **STOP and re-plan immediately**
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 9.2 Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 9.3 Self-Improvement Loop
- After ANY correction from the user → update `tasks/lessons.md`
- Write rules that prevent the same mistake
- Review lessons at session start

### 9.4 Verification Before Done
- Never mark a task complete without **proving** it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 9.5 Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes — don't over-engineer

### 9.6 Autonomous Bug Fixing
- When given a bug report: just fix it. No hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user


================================================================
10. TASK MANAGEMENT PROTOCOL
================================================================

1. **Plan First** → Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan** → Check in with user before starting implementation
3. **Track Progress** → Mark items complete as you go
4. **Trace Execution** → Log every step in `system/execution_trace.md`
5. **Explain Changes** → High-level summary at each step
6. **Document Results** → Add review section to `tasks/todo.md`
7. **Capture Lessons** → Update `tasks/lessons.md` after corrections


================================================================
11. CORE PRINCIPLES
================================================================

| Principle | Meaning |
|-----------|---------|
| Simplicity First | Make every change as simple as possible. Minimal code impact. |
| No Laziness | Find root causes. No temporary fixes. Senior developer standards. |
| Minimal Impact | Only touch what's necessary. No side-effect bugs. |
| Prove It Works | Every change must be verifiable before marking complete. |
| Memory Is Fragile | Always write state to disk. Never rely on in-context memory alone. |


================================================================
12. LIVE EXECUTION TRACE LOG (NEW)
================================================================

### Purpose

The execution trace is a **persistent, append-only log** that tracks every
meaningful action Claude takes across sessions. It serves as:

- A **crash-recovery journal** — after context compression, Claude can
  reconstruct exactly where it left off
- An **audit trail** — the user can review what was done, when, and why
- A **deduplication guard** — Claude checks the trace before starting work
  to avoid repeating completed steps

### File Location

    system/execution_trace.md

### Entry Format

Every entry must follow this exact format:

```markdown
### [YYYY-MM-DD HH:MM] <STATUS> — <Short description>

- **Task:** <What was being done>
- **Action:** <Specific action taken>
- **Files touched:** <list of files created/modified>
- **Result:** <SUCCESS | PARTIAL | FAILED | BLOCKED>
- **Next step:** <What should happen next>
- **Context hash:** <first 8 chars of git short SHA, or "uncommitted">
```

### Status Tags

| Tag | Meaning |
|-----|---------|
| `START` | Beginning a new task |
| `PROGRESS` | Mid-task checkpoint |
| `DONE` | Task completed and verified |
| `FAILED` | Task failed — includes reason |
| `BLOCKED` | Task blocked on external dependency |
| `RECOVERY` | Re-entering after context compression |
| `CORRECTION` | Fixing a mistake from a previous step |

### Rules

1. **Append-only** — never edit or delete previous entries
2. **Log before and after** — every task gets at minimum a START and DONE/FAILED entry
3. **Log on compression recovery** — first action after recovery is a RECOVERY entry
4. **Include the next step** — so future-Claude knows exactly where to pick up
5. **Reference git SHA** — ties the trace to a verifiable code state
6. **Keep entries concise** — 3-5 lines per entry, not paragraphs


================================================================
13. MEMORY SAFEGUARD CHECKLIST
================================================================

Claude must mentally verify these before **every response** that
involves code changes:

```
[ ] I have read CLAUDE.md this session
[ ] I have checked execution_trace.md for the last known state
[ ] I have checked development_log.md for relevant history
[ ] I am not rebuilding something that already exists
[ ] I am not inventing file paths — I verified with Glob/Read
[ ] I will log this action in execution_trace.md when done
[ ] I will commit after meaningful changes
```

If any box cannot be checked, **pause and fix it** before proceeding.


================================================================
14. PROJECT MEMORY SYSTEM (FILE REGISTRY)
================================================================

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `CLAUDE.md` | Project rules and guardrails (this file) | On rule changes |
| `docs/YouSell_Platform_Technical_Specification_v8.md` | Master architecture | On architecture changes |
| `system/development_log.md` | Change history and session log | After each meaningful change |
| `system/execution_trace.md` | Live execution trace log | After every task step |
| `system/ai_logic.md` | Platform operational logic | On logic changes |
| `system/yousell_master_qa_prompt_v7.md` | QA execution prompt | On QA updates |
| `tasks/todo.md` | Task planning and progress | Continuously |
| `tasks/lessons.md` | Patterns and lessons from corrections | After every correction |
| `tasks/execution_plan.md` | Step-by-step implementation plan | On plan changes |
| `docs/content_publishing_shop_integration_strategy.md` | Content & shop integration | On strategy changes |
| `docs/USE_CASE_DIAGRAM.md` | Use case diagrams and data flows | On flow changes |
| `docs/MARKET_RESEARCH_LOG_SESSION3.md` | Market research (80+ sources) | On new research |
| `archive/` | Deprecated files (reference only) | Rarely |


================================================================
15. TASK EXECUTION FLOW
================================================================

Claude must complete tasks **sequentially** using this exact flow:

```
1. CHECK  → Read execution_trace.md — am I resuming something?
2. PLAN   → Write plan to tasks/todo.md
3. TRACE  → Log START entry in execution_trace.md
4. BUILD  → Implement the change
5. VERIFY → Prove it works (tests, manual check, diff)
6. TRACE  → Log DONE/FAILED entry in execution_trace.md
7. LOG    → Update system/development_log.md
8. COMMIT → git add + git commit with clear message
```

If architecture changes → also update the v8 Technical Specification.
If a mistake was corrected → also update tasks/lessons.md.


================================================================
END OF PROMPT — IF YOU READ THIS FAR, THE BOOT SEQUENCE WORKED
================================================================
