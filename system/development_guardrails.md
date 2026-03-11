# Development Guardrails

**Last Updated:** 2026-03-11

---

## Three Rules That Prevent AI Architecture Drift

### Rule 1: Never Rebuild What Already Works

Before creating any new file, check if similar functionality already exists:
- Search `src/lib/` for existing modules
- Search `src/app/api/` for existing API routes
- Search `src/app/admin/` for existing pages
- Search `src/components/` for existing UI components

If it exists, **extend it** — do NOT create a duplicate.

### Rule 2: Never Assume Architecture

Architecture must be reconstructed from these files every session:
1. `/system/project_context.md` — what the project is
2. `/system/system_architecture.md` — how components connect
3. `/system/database_schema.md` — data model
4. `/system/worker_map.md` — background workers
5. `/system/ai_logic.md` — scoring algorithms
6. `/system/development_log.md` — what was done last

NEVER make architectural decisions without reading these files first.

### Rule 3: Never Overwrite Without Auditing

The following files must NEVER be overwritten without reading them first:
- Everything in `/system/*`
- Everything in `/docs/*`
- `CLAUDE.md`
- `package.json`
- `.env*` files (never commit these)
- `src/lib/scoring/composite.ts` (critical scoring logic)
- `src/lib/providers/config.ts` (provider configuration)
- `src/middleware.ts` (auth middleware)

---

## Additional Safety Rules

1. **All scraping in workers** — API routes must NEVER call external scraping APIs
2. **Update development_log.md** after every major task completion
3. **Update worker_map.md** when creating new workers
4. **Update database_schema.md** when creating new tables
5. **Test before committing** — run `npm run build` to verify no type errors
6. **Never commit .env files** — they contain API keys
7. **Keep provider config in sync** — when adding new APIs, update `src/lib/providers/config.ts`
