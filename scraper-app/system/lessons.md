# Scraper App — Lessons Learned

> Persistent learning memory. Check before starting any new task.

---

### Lesson: Shared core is non-negotiable
- **Date:** 2026-03-22
- **Context:** Project initialization and architecture design
- **Discovery:** Windows EXE and browser extension MUST share one core engine, one task schema, one policy/routing layer, one result model, one session model, one connector contract, one storage contract, and one observability model.
- **Prevention Rule:** Before creating any runtime-specific code, verify it uses shared packages. Never duplicate core logic into a runtime shell.
- **Category:** Architecture

### Lesson: AI is for routing/repair, not default extraction
- **Date:** 2026-03-22
- **Context:** Designing extraction strategy
- **Discovery:** AI should be used for routing decisions, extraction repair, schema normalization, and dedup — NOT as the default extraction method for every page.
- **Prevention Rule:** Always attempt deterministic extraction first. Only invoke AI when deterministic methods fail or for normalization.
- **Category:** Architecture

### Lesson: Specs before code — always
- **Date:** 2026-03-22
- **Context:** Project workflow requirements
- **Discovery:** Final Specs and Tasks Breakdown must be complete before any implementation code.
- **Prevention Rule:** Never start coding before docs/final_specs.md and docs/tasks_breakdown.md are complete.
- **Category:** Process

### Lesson: Cloud-agnostic from day one
- **Date:** 2026-03-22
- **Context:** Storage and deployment design
- **Discovery:** All storage, queue, and infrastructure abstractions must be cloud-agnostic. Use adapter interfaces so the same code runs on local, self-hosted, and cloud.
- **Prevention Rule:** Never hardcode AWS/GCP/Azure-specific APIs. Always go through abstraction layers.
- **Category:** Architecture
