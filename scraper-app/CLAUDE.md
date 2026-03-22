# SCRAPER APP — Claude Project Context

> **CRITICAL DIRECTIVE — NON-NEGOTIABLE**
>
> This file is the **single authoritative prompt** for every Claude session
> on the Scraper App project. It is a **contract**, not a suggestion.

================================================================
## 0. PROJECT OVERVIEW
================================================================

**Scraper App** is a production-grade, cloud-agnostic AI scraping platform supporting:
1. Public cloud deployment (SaaS)
2. Self-hosted deployment
3. Downloadable Windows EXE
4. Browser extension
5. Standalone API engine for integration into other apps

**Critical Architecture Rule:**
The Windows EXE and browser extension are NOT separate products.
They are alternate runtime front ends for the SAME routing and extraction platform.
They must share: one core engine, one task schema, one policy/routing layer,
one result model, one session model, one connector contract, one storage contract,
one observability model.

================================================================
## 1. REPOSITORY STRUCTURE
================================================================

```
scraper-app/
├── CLAUDE.md                    — THIS FILE (project prompt)
├── system/
│   ├── execution_trace.md       — Live execution trace (crash recovery)
│   ├── development_log.md       — Engineering change log
│   ├── todo.md                  — Current task queue
│   ├── lessons.md               — Persistent learning memory
│   └── final_step_logs.md       — Detailed task execution ledger
├── docs/
│   ├── scraper_document_v1.md   — Execution roadmap (Scraper Document v1)
│   ├── final_specs.md           — Implementation-ready specification
│   └── tasks_breakdown.md       — Atomic task breakdown with dependencies
├── apps/                        — Runtime shells (web dashboard, Tauri EXE, extension)
├── packages/                    — Shared packages (core engine, contracts, schemas)
├── services/                    — Backend services (control plane, workers, session mgr)
├── infrastructure/              — Docker, deployment configs, IaC
├── tests/                       — Test suites
└── scripts/                     — Build, deploy, and utility scripts
```

================================================================
## 2. TECHNOLOGY STACK
================================================================

| Layer | Technology |
|-------|-----------|
| Backend/Services | Python 3.12+, FastAPI, Uvicorn |
| Database | PostgreSQL 16 |
| Queue/Cache | Redis / Valkey |
| Object Storage | S3-compatible (MinIO for self-hosted, S3/GCS for cloud) |
| Browser Automation | Playwright (Python) |
| HTTP Scraping | httpx + browser-like TLS (curl_cffi) |
| AI Layer | Anthropic Claude API (Haiku for bulk, Sonnet for premium) |
| Desktop Shell | Tauri (Rust + web frontend) |
| Browser Extension | Chrome-compatible (Manifest V3) |
| Frontend | React/TypeScript (shared between web dashboard and Tauri) |
| Testing | pytest, Playwright Test |
| Deployment | Docker, Docker Compose, cloud-agnostic |
| Observability | Structured logging, OpenTelemetry, Prometheus metrics |

================================================================
## 3. MANDATORY WORKFLOW
================================================================

**Phase 0** → Repository and memory initialization
**Phase 1** → Final Specs creation (docs/final_specs.md)
**Phase 2** → Tasks Breakdown creation (docs/tasks_breakdown.md)
**Phase 3** → Architecture and scaffolding validation
**Phase 4** → Incremental implementation
**Phase 5** → Testing and hardening
**Phase 6** → Packaging and deployment
**Phase 7** → Final audit and completion report

**NO CODE before Phase 1 and Phase 2 are complete.**

================================================================
## 4. BOOT SEQUENCE (EVERY SESSION)
================================================================

```
PARALLEL GROUP 1:
  → Read CLAUDE.md
  → Read system/execution_trace.md
  → Read system/development_log.md

PARALLEL GROUP 2:
  → Read system/todo.md
  → Read system/lessons.md

PARALLEL GROUP 3:
  → Read docs/scraper_document_v1.md (first 200 lines)
  → Read docs/final_specs.md (if exists)
```

================================================================
## 5. DEVELOPMENT GUARDRAILS
================================================================

| # | Rule |
|---|------|
| G01 | Never diverge EXE/extension into separate scraping systems |
| G02 | All shared logic lives in packages/ — never duplicate into runtime shells |
| G03 | AI is for routing/repair/normalization — NOT default extraction |
| G04 | Deterministic extraction first, AI as fallback |
| G05 | Cloud-agnostic abstractions — no hardcoded vendor APIs |
| G06 | specs before code — always |
| G07 | Atomic tasks — never implement large ambiguous chunks |
| G08 | Heavy scraping logic must stay portable (in packages/) |
| G09 | Contracts remain unified across all deployment modes |
| G10 | Production-grade structure over speed hacks |
| G11 | Update all system files after every task |
| G12 | Max 3 files per micro-batch |
| G13 | Commit after every batch |

================================================================
## 6. MEMORY FILES
================================================================

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `system/execution_trace.md` | Live execution trace | Every batch |
| `system/development_log.md` | Engineering change log | After each meaningful change |
| `system/todo.md` | Task queue | Continuously |
| `system/lessons.md` | Mistake patterns and learnings | After every correction |
| `system/final_step_logs.md` | Detailed task execution ledger | After every task |
| `docs/final_specs.md` | Implementation-ready specification | On architecture changes |
| `docs/tasks_breakdown.md` | Atomic task breakdown | On plan changes |
| `docs/scraper_document_v1.md` | Execution roadmap | Reference |

================================================================
END OF PROMPT
================================================================
