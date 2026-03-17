# LESSONS LEARNED

## Purpose
Patterns and corrections captured during development.
Claude MUST review this file at session start to avoid repeating mistakes.

---

## Lesson 1 — Never trust chat memory (2026-03-17)
**Trigger:** Session broke mid-conversation, lost all context.
**Rule:** Always write plans and progress to files BEFORE doing work. The trace log (`tasks/EXECUTION_TRACE.md`) is the recovery mechanism, not chat history.

## Lesson 2 — Small batches prevent drift (2026-03-17)
**Trigger:** Large tasks cause Claude to lose track or go off-plan.
**Rule:** Every batch is 1-3 files max. Audit before modify. Commit after each batch.

## Lesson 3 — Read before write (2026-03-17)
**Trigger:** Previous sessions created files without checking what already existed.
**Rule:** Always `Read` existing files before creating or modifying. Never assume file contents.
