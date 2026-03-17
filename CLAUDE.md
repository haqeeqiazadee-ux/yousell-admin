# YOUSELL Platform – Claude Project Context

This file is the authoritative project context for the YOUSELL platform.

Claude must reload this file whenever:
- a new development session starts
- chat history becomes compressed
- context appears incomplete

Claude must never restart the project from scratch unless explicitly instructed.


------------------------------------------------
REPOSITORY STRUCTURE
------------------------------------------------

    yousell-admin
    │
    ├─ CLAUDE.md                          — This file (project rules)
    ├─ system/
    │   ├─ development_log.md             — Change history and session log
    │   ├─ ai_logic.md                    — Platform operational logic
    │   └─ yousell_master_qa_prompt_v7.md — QA execution prompt
    │
    ├─ docs/
    │   ├─ YouSell_Platform_Technical_Specification_v7.md — Master architecture
    │   ├─ content_publishing_shop_integration_strategy.md — Content & shop integration
    │   ├─ USE_CASE_DIAGRAM.md                            — Use case diagrams & data flows
    │   └─ MARKET_RESEARCH_LOG_SESSION3.md                — Market research (80+ sources)
    │
    ├─ tasks/
    │   ├─ todo.md                        — Task planning and progress tracking
    │   ├─ lessons.md                     — Patterns and lessons from corrections
    │   └─ execution_plan.md              — Step-by-step implementation plan
    │
    ├─ archive/                           — Old/deprecated files (reference only)
    │
    ├─ src/
    │   ├─ app/                           — Next.js App Router pages and API routes
    │   ├─ components/                    — UI components
    │   ├─ hooks/                         — React hooks
    │   ├─ lib/                           — Shared utilities and clients
    │   └─ middleware.ts                  — Auth/routing middleware
    │
    ├─ backend/                           — Express API and workers
    └─ supabase/                          — Database migrations


------------------------------------------------
CANONICAL ARCHITECTURE DOCUMENT
------------------------------------------------

The single source of truth for the platform architecture is:

    docs/YouSell_Platform_Technical_Specification_v8.md

This document supersedes all prior build briefs.
If any file conflicts with the v8 specification, v8 takes precedence.


------------------------------------------------
SESSION CONTEXT RECOVERY
------------------------------------------------

If chat history becomes compressed or context appears incomplete,
Claude must immediately run the following protocol.

1. Read these files in order:

   CLAUDE.md
   docs/YouSell_Platform_Technical_Specification_v8.md
   system/development_log.md
   system/ai_logic.md

2. Summarize:

   current architecture
   completed tasks
   remaining tasks

3. Continue development from the development log.

Claude must never restart the project from scratch.


------------------------------------------------
PROJECT PURPOSE
------------------------------------------------

YOUSELL is an AI-powered commerce intelligence SaaS platform
with eight opportunity channels.

The system discovers trending e-commerce products across multiple marketplaces,
scores product viability, matches influencers and suppliers, generates launch
blueprints, provisions client stores, automates content creation and marketing,
and tracks orders through fulfilment.

The platform operates as two interconnected but separable applications:
- YouSell Intelligence Engine (admin.yousell.online) — admin product discovery
- YouSell Client Platform (yousell.online) — client-facing SaaS dashboard

Primary Users:
- Super admins managing the platform
- Admin operators managing product discovery scans
- Client businesses receiving curated product opportunities and automation


------------------------------------------------
TECHNOLOGY STACK
------------------------------------------------

Frontend: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Netlify
Backend: Node.js, Express API, BullMQ job queue, Redis (Railway)
Database: Supabase PostgreSQL, Supabase Auth, Supabase Realtime
Payments: Stripe (Checkout, Webhooks, Customer Portal)
Scraping: Apify Actors
AI: Anthropic Claude API (Haiku for bulk, Sonnet for premium)
Email: Resend API
Version Control: GitHub


------------------------------------------------
SCORING ENGINE
------------------------------------------------

Products are evaluated using a three-pillar scoring model.

Final Score Formula:
final_score = trend_score × 0.40 + viral_score × 0.35 + profit_score × 0.25

Score Tiers:
HOT   >= 80
WARM  >= 60
WATCH >= 40
COLD  < 40

POD (Print-on-Demand) products use the same three-pillar scoring model
with POD-specific modifiers applied during evaluation.


------------------------------------------------
DEVELOPMENT GUARDRAILS
------------------------------------------------

Claude must follow these rules:

1. Do NOT rebuild completed functionality.
2. Always inspect the repository before creating new files.
3. Only implement missing or broken components.
4. Always check the development log before starting work.
5. Use the existing Supabase singleton client.
6. Use Apify actors as the primary scraping method.
7. Ensure compatibility with Netlify deployment constraints.
8. Never run scraping logic inside API request handlers.
9. API routes must serve stored/cached data, not trigger live scraping.
10. All automation jobs DISABLED by default — manual-first cost control.
11. Apply cost optimisations from day one.
12. Use Claude Haiku for bulk operations, Sonnet only for premium insights.
13. Store OAuth tokens encrypted; never handle client passwords.
14. Update system/development_log.md after each meaningful implementation.
15. Treat docs/YouSell_Platform_Technical_Specification_v8.md as the primary
    architecture reference unless a newer canonical file explicitly replaces it.


------------------------------------------------
WORKFLOW ORCHESTRATION
------------------------------------------------

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update tasks/lessons.md with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how


------------------------------------------------
TASK MANAGEMENT
------------------------------------------------

1. Plan First: Write plan to tasks/todo.md with checkable items
2. Verify Plan: Check in before starting implementation
3. Track Progress: Mark items complete as you go
4. Explain Changes: High-level summary at each step
5. Document Results: Add review section to tasks/todo.md
6. Capture Lessons: Update tasks/lessons.md after corrections


------------------------------------------------
CORE PRINCIPLES
------------------------------------------------

- Simplicity First: Make every change as simple as possible. Impact minimal code.
- No Laziness: Find root causes. No temporary fixes. Senior developer standards.
- Minimal Impact: Only touch what's necessary. No side effects with new bugs.


------------------------------------------------
PROJECT MEMORY SYSTEM
------------------------------------------------

| File | Purpose |
|------|---------|
| CLAUDE.md | Project rules and guardrails (this file) |
| docs/YouSell_Platform_Technical_Specification_v8.md | Master architecture |
| system/development_log.md | Change history and session log |
| system/ai_logic.md | Platform operational logic reference |
| system/yousell_master_qa_prompt_v7.md | QA execution prompt |
| tasks/todo.md | Task planning and progress tracking |
| tasks/lessons.md | Patterns and lessons from corrections |
| tasks/execution_plan.md | Step-by-step implementation execution plan |
| docs/content_publishing_shop_integration_strategy.md | Content creation & shop integration strategy |
| docs/USE_CASE_DIAGRAM.md | Platform use case diagrams and data flows |
| docs/MARKET_RESEARCH_LOG_SESSION3.md | Market research findings (80+ sources) |
| archive/ | Old/deprecated files (reference only) |


------------------------------------------------
TASK EXECUTION PRINCIPLES
------------------------------------------------

Claude must complete tasks sequentially.

After completing each task:
1. update system/development_log.md
2. commit changes

If architecture changes:
update docs/YouSell_Platform_Technical_Specification_v8.md
