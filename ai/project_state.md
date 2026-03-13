# YOUSELL Project State

**Last Updated:** 2026-03-13
**Branch:** claude/review-qa-plan-GvHHq
**Canonical Spec:** `docs/YouSell_Platform_Technical_Specification_v7.md`

---

## Current Status: QA COMPLETE — BUG FIXING PHASE (Phase A)

Full QA review completed (112 tasks across 25 sprints). Per v7 spec: 41 bugs identified — 3 CRITICAL, 9 HIGH, 21 MEDIUM, 8 LOW. Zero bugs resolved so far.

---

## Completed Development (17 Phases)

- [x] Next.js 14 scaffold with TypeScript + Tailwind
- [x] Supabase auth + admin RBAC (with bugs)
- [x] Express backend + BullMQ worker
- [x] 20 database tables with RLS
- [x] Admin API key management + CSV import
- [x] Manual scan control panel
- [x] Trend Scout Agent with 6 viral signals
- [x] All 8 Apify providers (TikTok, Amazon, Shopify, Pinterest, Digital, Affiliate, Influencer, Supplier)
- [x] Competitor intelligence + Claude Sonnet insights
- [x] 3-pillar composite scoring engine (Trend 40% / Viral 35% / Profit 25%)
- [x] Profitability engine with margin calculations
- [x] Influencer matching + supplier discovery
- [x] Financial modeling + launch blueprints with PDF export
- [x] Web dashboard with Supabase Realtime
- [x] Full QA audit (S01–S25, 112 micro-tasks)
- [x] Stack migration cost analysis (`ai/stack-migration-notes.md`)

---

## Outstanding Bugs (v7 Classification)

### CRITICAL (3) — Must fix immediately

1. **Admin layout renders for ANY authenticated user** — no role check (BUG-032)
2. **Express backend has zero RBAC** — any user can trigger scans
3. **`clients` table RLS blocks all client queries**

### HIGH (9) — Must fix before launch

1. **BUG-022**: Table split-brain — frontend reads `scan_history`, backend writes `scans`
2. **BUG-035**: Legacy `calculateCompositeScore()` (60/40) conflicts with 3-pillar model (40/35/25)
3. **BUG-036**: Backend heuristic vs frontend weighted scoring produce different results
4. **BUG-045/046**: Missing input validation on POST routes (products sort, influencer POST)
5. **BUG-028**: `userId` read from request body instead of auth token (spoofing risk)
6. **BUG-029**: Single-origin CORS breaks Netlify preview URLs
7. **BUG-030**: API keys appear in error logs
8. **requireClient()** middleware missing on dashboard routes
9. **BUG-050**: Platform scraping runs sequentially (should parallelize)

### MEDIUM (21) — See `ai/qa-final-report.md`

### LOW (8) — Fix as time permits

---

## Remaining Development Phases (v7 Roadmap)

| Phase | Description | Duration |
|-------|-------------|----------|
| **A** | Fix 3 CRITICAL + 9 HIGH bugs | 1–2 days |
| **B** | Stripe integration + subscription management | 3–5 days |
| **C** | Platform gating + per-client engine toggles + upsell UI | 3–5 days |
| **D** | OAuth store integrations (Shopify/TikTok/Amazon) + product push | 5–7 days |
| **E** | AI content generation + multi-channel distribution | 5–7 days |
| **F** | Order tracking + Resend email sequences (5-step post-purchase) | 3–5 days |
| **G** | Influencer outreach v2 (one-click Haiku-powered invites) | 2–3 days |
| **H** | React Native mobile app (iOS + Android) | 10–14 days |
| **I** | Full QA + app store submission | 5–7 days |

**Total estimated: 14–16 weeks to production**

---

## Revenue Model (v7 — Corrected)

- **Pricing:** $29–$299/mo per-platform tiers (NOT the old $2,997 agency pricing)
- **Paywall philosophy:** Data is visible to all; subscription gates automation and actions
- **Affiliate model (Hybrid):** Clients use their own affiliate links (100% commission to client). YouSell earns subscription fee only.
- **Target:** 500 subscribers × $49/mo = $24,500 MRR vs $200/mo cost = 99.2% gross margin

---

## Continuity Files (Precedence Order per v7)

1. `docs/YouSell_Platform_Technical_Specification_v7.md` (canonical)
2. `CLAUDE.md` (project rules + guardrails)
3. `ai/project_state.md` (this file)
4. `ai/task_board.md` (active tasks)
5. `development_log.md` (change history)
