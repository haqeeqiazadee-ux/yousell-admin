# YouSell Intelligence Platform — Claude Code Instructions

## SESSION START PROTOCOL (MANDATORY)

Before writing ANY code, read these files in order:
1. `/system/development_log.md` — Last completed task + next step
2. `/system/project_context.md` — What this project is
3. `/system/system_architecture.md` — Architecture diagram
4. `/system/database_schema.md` — Data model
5. `/system/worker_map.md` — Worker status
6. `/system/ai_logic.md` — Scoring algorithms
7. `/system/development_guardrails.md` — Safety rules

Resume from the last entry in development_log.md. NEVER restart from scratch.

## Project Stack

- **Frontend:** Next.js 14 + React 18 + Tailwind 3 (Netlify)
- **Backend:** Next.js API Routes / Node.js (Netlify)
- **Database:** Supabase (PostgreSQL)
- **Workers:** Railway (background services)
- **Queue:** Redis + BullMQ
- **Email:** Resend
- **AI:** Anthropic (Claude) — cost-controlled
- **Scraping:** Apify + ScrapeCreators + RapidAPI

## Core Rules

1. API routes NEVER perform scraping — only read database
2. All scraping runs in background workers via Redis queue
3. Update `/system/development_log.md` after every major task
4. Before creating files, check if similar functionality exists
5. NEVER commit .env files
6. Run `npm run build` before committing
7. Keep job scheduling configurable

## Development Phases

See `/docs/EXECUTION_ROADMAP.md` for full plan.

Current phase: Check `/system/development_log.md` for latest status.

## Key Directories

```
src/lib/scoring/     — Scoring algorithms (DO NOT REBUILD)
src/lib/providers/   — API provider configs
src/lib/queue/       — Job queue system
src/lib/workers/     — Background workers
src/app/admin/       — Dashboard pages
src/app/api/         — API routes
system/              — Session maintenance files
docs/                — Project documentation
```

## Execution Prompt

See `/docs/CLAUDE_CODE_PROMPT.md` for the full autonomous execution prompt.
