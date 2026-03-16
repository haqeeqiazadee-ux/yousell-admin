# YOUSELL Platform — Master Audit & Improvement Prompt

> Copy this entire prompt into a new Claude Code session to execute the full project check.

---

## CONTEXT LOADING (Do this FIRST — do not skip)

Before doing anything else, read these files in exact order and retain their full context:

```
CLAUDE.md
docs/YouSell_Platform_Technical_Specification_v7.md
system/development_log.md
system/ai_logic.md
system/yousell_master_qa_prompt_v7.md
system/e2e_testing_strategy.md
system/DEBUG_STRATEGY.md
system/fix_log.md
```

Then scan the full codebase structure:

```
src/lib/engines/          — all 7 engine files
src/lib/scoring/          — composite.ts, profitability.ts
src/lib/providers/        — all provider directories
src/app/api/admin/        — all admin API routes
src/app/api/dashboard/    — all client API routes
src/app/admin/            — all admin pages
src/app/dashboard/        — all client pages
backend/src/jobs/         — all worker job files
supabase/migrations/      — all migration SQL files
tests/                    — all test files
```

Do NOT summarize from memory. Read each file. You are building a complete mental model of what exists vs what the v7 spec requires.

---

## PHASE 1: Requirements Traceability Matrix (RTM)

Create the file: `docs/RTM_v7.md`

Structure it as follows:

### Section A — Engine-by-Engine Logic Audit

For EACH of the following engines from the v7 spec, produce a detailed subsection:

1. **Discovery Engine** (src/lib/engines/discovery.ts)
2. **TikTok Discovery Engine** (src/lib/engines/tiktok-discovery.ts)
3. **Product Clustering Engine** (src/lib/engines/clustering.ts)
4. **Trend Detection Engine** (src/lib/engines/trend-detection.ts)
5. **Creator Matching Engine** (src/lib/engines/creator-matching.ts)
6. **Ad Intelligence Engine** (src/lib/engines/ad-intelligence.ts)
7. **Opportunity Feed Engine** (src/lib/engines/opportunity-feed.ts)

For each engine, document:

| Field | Detail |
|-------|--------|
| **v7 Spec Reference** | Exact section number and page from v7 spec |
| **Source Files** | All files that implement this engine (lib, API route, page, worker job, migration) |
| **Input Data** | What data sources feed this engine (Apify actors, database tables, other engines) |
| **Processing Logic** | Step-by-step description of what the code ACTUALLY does (not what spec says — what code does) |
| **Scoring/Algorithm** | Any formulas, thresholds, weights used |
| **Output** | What the engine produces (database writes, API responses, UI renders) |
| **Database Tables** | Which tables this engine reads from and writes to |
| **API Routes** | Which routes expose this engine's functionality |
| **UI Pages** | Which admin/client pages display this engine's output |
| **Worker Jobs** | Which BullMQ jobs support this engine |
| **v7 Compliance** | What the spec requires vs what is actually implemented — be brutally honest |
| **Gaps** | Missing features, incomplete logic, stub implementations, hardcoded mock data |
| **Severity** | CRITICAL / HIGH / MEDIUM / LOW for each gap |

### Section B — Data Source Module Audit

Repeat the same audit for all 7 data source modules:
- TikTok Products, Amazon Products, Shopify Products, Pinterest Commerce, Digital Products, AI Affiliate Programs, Physical Affiliate Products

For each, document: spec reference, what providers exist, what data they actually return, whether mock data is used, what's real vs stub.

### Section C — Supporting Systems Audit

Audit each supporting system:
- Supabase Auth + RLS (check actual RLS policies vs spec requirements)
- BullMQ Job Queue (which jobs exist, which actually process, which are stubs)
- Stripe Subscription Billing (webhook handling completeness, tier enforcement)
- CSV Import Pipeline (functional or stub?)
- Email System (what emails actually send?)
- Content Generation Queue (implemented or placeholder?)
- Order Tracking System (real webhook handlers or stubs?)
- System Health Monitor (what diagnostics actually work?)

### Section D — Subscription Engine Gating

For each of the 8 modular engines per subscription tier:
- Product Discovery, Store Integration, Marketing & Ads, Content Creation, Influencer Outreach, Supplier Intelligence, AI Affiliate Revenue, Analytics & Profit Tracking

Document: which tier unlocks it, what the engine-gate component actually checks, what happens when a user without access tries to use it.

### Section E — Traceability Matrix Table

Create a comprehensive table:

| # | v7 Requirement | Spec Section | Status | Implementation Files | Test Coverage | Notes |
|---|---------------|-------------|--------|---------------------|--------------|-------|
| 1 | ... | ... | ✅ DONE / ⚠️ PARTIAL / ❌ MISSING | ... | Yes/No | ... |

Cover EVERY requirement from the v7 spec. Target 100+ rows. Be exhaustive.

### Section F — Test Coverage Map

For each test file in tests/:
- Map which requirements each test validates
- Identify requirements with ZERO test coverage
- Flag critical paths that need tests

---

## PHASE 2: Self-Review & Market Research

After creating the RTM, review it yourself. Then conduct market research.

### Step 1: Self-Review Checklist

Go through the RTM and answer:
- Are there any engines where the code does something different from what I documented?
- Did I miss any files that contribute to an engine?
- Are my gap severities accurate? Would a paying customer hit these gaps?
- Is there dead code or unused infrastructure I should flag?

### Step 2: Market Research

Research these platforms (referenced in v7 spec and competitors in this vertical):

**Direct Competitors:**
- Sell The Trend (sellthetrend.com) — product discovery + store integration
- Ecomhunt (ecomhunt.com) — curated winning products
- Niche Scraper (nichescraper.com) — TikTok + AliExpress product finder
- Dropship.io (dropship.io) — product database + competitor research
- Minea (minea.com) — ad spy + product research

**Adjacent Platforms:**
- Jungle Scout (junglescout.com) — Amazon product research
- Helium 10 (helium10.com) — Amazon seller suite
- Exploding Topics (explodingtopics.com) — trend detection
- SparkToro (sparktoro.com) — audience intelligence
- Foreplay (foreplay.co) — ad creative intelligence

For each, research:
- Core value proposition and pricing
- Key differentiating features
- What they do that YOUSELL doesn't
- What YOUSELL does that they don't
- UX patterns worth adopting

### Step 3: Produce Improvement Recommendations

Create the file: `docs/IMPROVEMENT_PLAN.md`

Structure:

#### Category A — Critical Gaps (must fix for launch)
Features that paying customers expect but are missing or broken.

#### Category B — Competitive Differentiation
Features that would set YOUSELL apart from competitors listed above.

#### Category C — Revenue Optimization
Pricing model improvements, upsell opportunities, usage-based features.

#### Category D — Technical Debt
Code quality, performance, security, testing gaps that need addressing.

#### Category E — Growth Features
Features for scaling: onboarding flows, referral programs, API access, white-label.

For each recommendation:
- Feature name and one-line description
- Which competitor inspired it (if applicable)
- Implementation complexity (S/M/L/XL)
- Revenue impact (HIGH/MEDIUM/LOW)
- Priority rank (P0 through P3)
- Affected files/modules

---

## PHASE 3: Update Project Documentation

Based on Phases 1 and 2, update the following files:

### system/development_log.md
Add a new session entry documenting:
- The RTM audit findings
- Current completion percentage per engine
- Top 10 gaps by severity
- Recommended next implementation priorities

### system/ai_logic.md
Update if any engine logic descriptions are outdated or missing based on what the code actually does now.

### system/yousell_master_qa_prompt_v7.md
Add new test cases for any untested requirements discovered in the RTM.

### system/e2e_testing_strategy.md
Update with new test scenarios for gaps identified in the RTM.

### tests/ (if applicable)
If Phase 4 new-feature tests or Phase 5 security tests are empty placeholders, outline the test cases that should be added (don't implement yet — just document the test plan).

---

## EXECUTION RULES

1. Use subagents for parallel file reading — don't read 50+ files sequentially in the main context.
2. Enter plan mode before starting each Phase.
3. Be brutally honest in the RTM. Mock data pretending to be real functionality = ❌ MISSING, not ✅ DONE.
4. If a provider falls back to mock data when no API key is configured, mark it as ⚠️ PARTIAL with a note explaining the fallback behavior.
5. Cite exact file paths and line numbers for every claim in the RTM.
6. Do not skip any engine or requirement — exhaustive coverage is the goal.
7. Commit after each Phase completion with a descriptive message.
8. Update system/development_log.md after each Phase.
9. Total output target: RTM should be 500+ lines, Improvement Plan should be 200+ lines.
10. Quality bar: A senior engineer unfamiliar with the project should be able to read the RTM and understand exactly what works, what doesn't, and what's next.
