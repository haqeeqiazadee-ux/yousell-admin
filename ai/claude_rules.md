# Claude Rules — YouSell Admin

## Development Principles

1. **Assume most of the system already exists.** Do not rebuild what's working.
2. **Extend existing files** rather than creating new ones where possible.
3. **Inspect before implementing.** Read existing code before modifying.
4. **Maintain spec compliance.** The master spec is `YOUSELL_OPUS_MASTER_PROMPT_v1 (1).md`.
5. **Keep scoring consistent.** Tier thresholds: HOT >= 80, WARM >= 60, WATCH >= 40, COLD < 40.

## Code Standards

- TypeScript strict mode (frontend). Backend should also use strict typing.
- Use `server-only` import guard for any file accessing `SUPABASE_SERVICE_ROLE_KEY`.
- All admin API routes must call `requireAdmin()` before processing.
- Use Supabase upsert with conflict keys to prevent duplicates.
- Provider functions should check for API keys and return empty arrays gracefully.
- Never call Claude Sonnet automatically. Sonnet insights are on-demand only (final_score >= 75).
- Haiku insights for products with final_score >= 60.

## Architecture Rules

- Frontend providers are in `src/lib/providers/`. Use the cache-before-API pattern.
- Backend scripts go in `backend/src/`. Use the Supabase service role key.
- Database changes go in `supabase/migrations/` with sequential numbering.
- All automation jobs default to disabled. Master kill switch must be respected.
- Client product visibility is controlled by `product_allocations.visible_to_client`.

## Supabase Schema Source of Truth

The consolidated schema is in `supabase/migrations/005_complete_schema.sql`.
For the full migration history, see `supabase/migrations/CONSOLIDATED_MIGRATION.sql`.

## File Update Protocol

After completing each task:
1. Update `/ai/project_state.md` with new status
2. Update `/ai/task_board.md` — mark completed, add new tasks
3. Update `CLAUDE.md` if architecture changes
4. Commit with descriptive message
