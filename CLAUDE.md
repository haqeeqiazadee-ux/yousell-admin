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
    │   └─ YouSell_Platform_Technical_Specification_v7.md — Master architecture
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

    docs/YouSell_Platform_Technical_Specification_v7.md

This document supersedes all prior build briefs.
If any file conflicts with the v7 specification, v7 takes precedence.


------------------------------------------------
SESSION CONTEXT RECOVERY
------------------------------------------------

If chat history becomes compressed or context appears incomplete,
Claude must immediately run the following protocol.

1. Read these files in order:

   CLAUDE.md
   docs/YouSell_Platform_Technical_Specification_v7.md
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

YOUSELL is an AI-powered commerce intelligence SaaS platform.

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
15. Treat docs/YouSell_Platform_Technical_Specification_v7.md as the primary
    architecture reference unless a newer canonical file explicitly replaces it.


------------------------------------------------
PROJECT MEMORY SYSTEM
------------------------------------------------

| File | Purpose |
|------|---------|
| CLAUDE.md | Project rules and guardrails (this file) |
| docs/YouSell_Platform_Technical_Specification_v7.md | Master architecture |
| system/development_log.md | Change history and session log |
| system/ai_logic.md | Platform operational logic reference |
| system/yousell_master_qa_prompt_v7.md | QA execution prompt |
| archive/ | Old/deprecated files (reference only) |


------------------------------------------------
TASK EXECUTION PRINCIPLES
------------------------------------------------

Claude must complete tasks sequentially.

After completing each task:
1. update system/development_log.md
2. commit changes

If architecture changes:
update docs/YouSell_Platform_Technical_Specification_v7.md
