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

> **IMPORTANT — YOUSELL Positioning:**
> YOUSELL is NOT a dropshipping-only platform. Our customers can dropship OR buy in bulk — we are model-agnostic.
> We discover winning products, score viability, match creators/suppliers, and automate marketing.
> Competitors below focus heavily on dropshipping. YOUSELL goes wider: e-commerce intelligence + content creation + marketing automation + AI-powered insights.
> This is our key differentiator — keep it central to all research and recommendations.

Research the following platforms thoroughly. **You MUST use WebSearch and WebFetch for every single platform** — do not rely on training data alone. Fetch their actual websites, pricing pages, feature pages, and any recent blog posts or changelogs.

#### Tier 1 — Primary Competitors (research DEEPLY — these are our closest rivals)

1. **TopDawg** (topdawg.com) — Dropshipping supplier marketplace + product sourcing + store integration
2. **Sell The Trend** (sellthetrend.com) — AI product discovery + NEXUS supplier matching + store push
3. **AutoDS** (autods.com) — Automated dropshipping platform + product finder + order fulfillment

For these 3, produce a DETAILED competitive analysis:
- Full feature breakdown (every feature they advertise)
- Pricing tiers with exact prices and what each tier includes
- Onboarding flow and UX patterns
- Supplier/marketplace integrations they support
- Automation capabilities (what can run hands-off?)
- Content/marketing tools they offer (if any)
- Customer reviews sentiment (search for "[platform] review 2025/2026")
- Their weaknesses and common complaints
- What they do better than YOUSELL right now
- What YOUSELL already does better than them
- Specific features we should adopt or improve upon

#### Tier 2 — Product Discovery & Research Competitors

4. **Ecomhunt** (ecomhunt.com) — curated winning products
5. **Niche Scraper** (nichescraper.com) — TikTok + AliExpress product finder
6. **Dropship.io** (dropship.io) — product database + competitor research
7. **Minea** (minea.com) — ad spy + product research across platforms

For each: core value prop, pricing, key features, what we can learn.

#### Tier 3 — Amazon & Marketplace Intelligence

8. **Jungle Scout** (junglescout.com) — Amazon product research + supplier database
9. **Helium 10** (helium10.com) — Amazon seller suite (keyword research, listing optimization)

For each: how they handle product scoring, trend detection, supplier matching — compare to our engines.

#### Tier 4 — Trend Detection & Audience Intelligence

10. **Exploding Topics** (explodingtopics.com) — trend detection before they peak
11. **SparkToro** (sparktoro.com) — audience intelligence + influencer discovery

For each: their trend/signal algorithms, data sources, how we can improve our Trend Detection Engine.

#### Tier 5 — Ad Intelligence & Content Creation

12. **Foreplay** (foreplay.co) — ad creative intelligence + swipe file
13. **Pipiads** (pipiads.com) — TikTok ad spy tool
14. **AdSpy** (adspy.com) — Facebook/Instagram ad intelligence

For each: ad data coverage, creative analysis features, how they compare to our Ad Intelligence Engine.

#### Tier 6 — Content & Marketing Automation (EXPLORE THIS NICHE FULLY)

15. **Jasper** (jasper.ai) — AI marketing content generation
16. **Copy.ai** (copy.ai) — AI copywriting for e-commerce
17. **Predis.ai** (predis.ai) — AI social media content creation
18. **Canva** (canva.com) — Visual content creation (relevant for our content engine)
19. **Buffer / Hootsuite** — Social media scheduling and analytics

For each: how they handle content generation, scheduling, multi-channel publishing — map features we need for our Content Creation Engine.

#### Tier 7 — E-commerce SaaS Platforms (business model inspiration)

20. **Shopify Apps Ecosystem** — Research top-rated Shopify apps in product research, marketing, and fulfillment categories
21. **BigCommerce** — Their app marketplace and built-in intelligence features

### Step 2b: Niche Deep-Dives

Beyond individual competitors, research these NICHES thoroughly to ensure we haven't missed key functionality areas:

**Niche 1 — E-commerce Product Research & Discovery**
- Search: "best product research tools for e-commerce 2025 2026"
- Search: "winning product finder tools comparison"
- Search: "TikTok product research tools"
- Identify any emerging tools we missed

**Niche 2 — AI Content Creation for E-commerce**
- Search: "AI content creation tools for e-commerce sellers"
- Search: "automated product description generators"
- Search: "AI social media content for online stores"
- Map the full landscape of what's available

**Niche 3 — Marketing Automation for Online Sellers**
- Search: "marketing automation for e-commerce small business"
- Search: "influencer marketing platforms for e-commerce"
- Search: "automated ad creation tools for online sellers"
- Identify automation gaps in YOUSELL

**Niche 4 — Supplier & Fulfillment Intelligence**
- Search: "supplier matching platforms for e-commerce"
- Search: "fulfillment automation tools comparison"
- Identify how competitors handle the supplier → fulfillment pipeline

### Step 2c: Research Log

**MANDATORY: Create the file `docs/RESEARCH_LOG.md`**

This file must contain a COMPLETE log of every research action taken during Phase 2. For each research item, record:

| Field | Detail |
|-------|--------|
| **Timestamp** | When the research was conducted |
| **Platform/Query** | What was searched or fetched |
| **URL(s) Accessed** | Every URL fetched via WebSearch or WebFetch |
| **Key Findings** | Bullet-point summary of what was discovered |
| **Relevance to YOUSELL** | How this finding maps to our platform |
| **Action Items** | Specific features or improvements suggested by this finding |

The research log serves as an audit trail proving that every niche was thoroughly explored. Target: 50+ research entries minimum across all niches and competitors.

At the end of the research log, include:

**Coverage Checklist:**
- [ ] All 21 competitor platforms researched
- [ ] E-commerce product research niche fully explored
- [ ] AI content creation niche fully explored
- [ ] Marketing automation niche fully explored
- [ ] Supplier & fulfillment niche fully explored
- [ ] Emerging/new tools identified
- [ ] Pricing models compared across all competitors
- [ ] UX patterns documented
- [ ] Customer complaint patterns identified
- [ ] Feature gap analysis complete

### Step 3: Produce Improvement Recommendations

Create the file: `docs/IMPROVEMENT_PLAN.md`

> Ground every recommendation in the research log. No hand-waving — cite which competitor or niche research led to each recommendation.

Structure:

#### Category A — Critical Gaps (must fix for launch)
Features that paying customers expect but are missing or broken. These are table-stakes features that TopDawg, Sell The Trend, and AutoDS all have and we need before charging money.

#### Category B — Competitive Differentiation (YOUSELL's unfair advantage)
Features that would set YOUSELL apart. Remember: we are NOT dropshipping-only. We serve bulk buyers too. Our AI-first intelligence + content creation + marketing automation combo is the differentiator. Double down on features that competitors can't easily copy.

#### Category C — Content Creation & Marketing Engine
Specific features for our content and marketing engines based on research of Jasper, Copy.ai, Predis.ai, Buffer, etc. This is a major revenue driver and differentiator — detail exactly what our Content Creation Engine and Marketing & Ads Engine should do.

#### Category D — Revenue Optimization
Pricing model improvements based on competitor pricing analysis. Include:
- How TopDawg, Sell The Trend, AutoDS price their tiers
- Where YOUSELL's pricing sits relative to market
- Upsell opportunities, usage-based features, add-on modules

#### Category E — Technical Debt
Code quality, performance, security, testing gaps that need addressing.

#### Category F — Growth Features
Features for scaling: onboarding flows, referral programs, API access, white-label, marketplace/app ecosystem.

#### Category G — Supplier & Fulfillment Pipeline
Based on research of TopDawg's supplier model and AutoDS's fulfillment automation, detail what YOUSELL needs for a complete supplier → order → fulfillment pipeline.

For each recommendation:
- Feature name and one-line description
- Which competitor(s) inspired it (with specific URL/feature reference from research log)
- Implementation complexity (S/M/L/XL)
- Revenue impact (HIGH/MEDIUM/LOW)
- Priority rank (P0 through P3)
- Affected files/modules
- Estimated new files/tables/APIs needed

---

## PHASE 2.5: n8n Automation Workflow Analysis

> This phase runs AFTER Phase 2 market research and BEFORE Phase 3 documentation updates.

### Data Source

The file `n8n_templates.zip` in the repo root contains `n8n_templates.xlsx` — a spreadsheet of **8,806 free n8n automation workflows** with columns:

| Column | Description |
|--------|-------------|
| # | Row number |
| ID | n8n workflow ID |
| Name | Workflow title |
| Categories | Comma-separated categories |
| Nodes Used | n8n nodes/integrations used |
| Creator | Author username |
| Total Views | Popularity metric |
| Created Date | When published |
| n8n URL | Direct link to workflow on n8n.io |

### Pre-Analysis: Category Landscape

The spreadsheet contains 37 unique categories. The most relevant to YOUSELL are:

| Category | Description |
|----------|-------------|
| Content Creation | Content generation workflows |
| AI Copywriting & Video Automation | AI-powered content pipelines |
| Social Media Automation & Email Marketing Campaigns | Publishing & email sequences |
| Marketing | Marketing automation |
| Lead Generation | Lead capture & qualification |
| Lead Nurturing/Interaction & AI Sales Agents | Sales automation |
| Sales Operations & CRM Workflows | CRM and sales ops |
| Product & Market Insights | Market research automation |
| Enrichment & Qualification | Data enrichment |
| Extraction, Analysis & Document Generation | Data extraction |
| AI RAG, MCP & Knowledge Retrieval | Knowledge systems |
| Multimodal AI & Content Generation | Multi-format content |

Relevant keyword hit counts across all 8,806 workflows:
- Shopify: 114 | TikTok: 74 | Amazon: 38 | E-commerce: 39
- Content: 2,518 | Marketing: 617 | Social Media: 640 | Email: 1,800
- SEO: 198 | Scraping: 72 | Stripe: 67 | CRM: 497
- Lead: 1,050 | Sales: 820 | Influencer: 22 | Affiliate: 9
- Product: 1,675 | Inventory: 38 | Order: 95 | Supplier: 10

### Step 1: Extract and Filter

Extract the zip file and read the spreadsheet. Filter workflows into YOUSELL-relevant buckets:

**Bucket A — Product Discovery & Intelligence** (priority: HIGH)
Filter by: categories containing "Product & Market Insights", "Extraction", or names/nodes containing shopify, amazon, tiktok, product research, scraping, competitor, trend, BSR, winning product

**Bucket B — Content Creation & Marketing** (priority: HIGH)
Filter by: categories containing "Content Creation", "AI Copywriting", "Social Media Automation", "Marketing", or names/nodes containing content, copywriting, social media, post, video, ad copy, email marketing, campaign

**Bucket C — Sales, CRM & Lead Generation** (priority: MEDIUM)
Filter by: categories containing "Lead Generation", "Lead Nurturing", "Sales Operations", or names/nodes containing lead, CRM, sales, customer, outreach, nurture

**Bucket D — Supplier & Fulfillment** (priority: MEDIUM)
Filter by: names/nodes containing supplier, fulfillment, inventory, order, shipping, tracking, warehouse

**Bucket E — AI & Automation Infrastructure** (priority: MEDIUM)
Filter by: categories containing "AI Agent", "AI RAG", or names/nodes containing AI agent, RAG, automation, webhook, Stripe, Supabase, BullMQ

**Bucket F — Influencer & Affiliate** (priority: HIGH)
Filter by: names/nodes containing influencer, affiliate, creator, partnership, commission, referral

### Step 2: Rank and Evaluate

For each bucket, identify the **top 10-15 most relevant workflows** based on:
1. Direct applicability to a YOUSELL engine or feature
2. Popularity (Total Views — higher = more proven)
3. Recency (Created Date — prefer 2025-2026)
4. Node compatibility (do they use services we already integrate with: Supabase, Stripe, Shopify, TikTok, Claude/OpenAI, Resend, Apify?)

For each selected workflow, produce a **Build vs Adopt decision** using this evaluation framework:

| Field | Detail |
|-------|--------|
| **Workflow ID & Name** | From spreadsheet |
| **n8n URL** | Direct link |
| **Views** | Popularity indicator |
| **Nodes Used** | Key integrations |
| **YOUSELL Engine Mapping** | Which engine/feature this enhances |
| **Integration Strategy** | How to adapt this workflow for YOUSELL (n8n embed, port logic to BullMQ, API integration, or inspiration-only) |
| **Implementation Effort** | S/M/L |
| **Value Add** | What capability this gives us that we don't have today |

#### Build vs Adopt Decision Matrix (apply to EVERY workflow)

For each workflow, answer these 5 questions and produce a clear **VERDICT: USE N8N** or **VERDICT: BUILD NATIVE** or **VERDICT: SKIP**:

| Decision Factor | Question to Answer |
|-----------------|-------------------|
| **Cost Efficiency** | Is using this n8n workflow cheaper than building the same logic natively? Consider: n8n hosting costs (self-hosted vs cloud), API call costs for nodes used, maintenance overhead vs our existing BullMQ infrastructure. Calculate approximate monthly cost for both approaches at 100, 1,000, and 10,000 executions/month. |
| **Speed to Market** | How fast can we integrate this workflow vs building it ourselves? If the n8n workflow gets us 80% of the feature in 1 day vs 2 weeks native — that matters. Estimate: hours to integrate n8n workflow vs hours to build natively in our TypeScript stack. |
| **Ease of Maintenance** | Which is easier to maintain long-term? n8n workflows are visual and non-dev-friendly but add infrastructure complexity (another service to run). Native BullMQ jobs live in our codebase, version-controlled, tested. Consider: who maintains it, debugging difficulty, upgrade path. |
| **SaaS Performance Impact** | Does this workflow improve the end-user experience? Consider: latency (n8n adds network hops vs native in-process), reliability (external dependency vs self-contained), scalability (n8n queue limits vs our Redis/BullMQ setup), data residency (does data leave our infrastructure?). |
| **Functionality Gap** | Does this workflow provide functionality we genuinely cannot build efficiently ourselves? Some n8n workflows leverage 3rd-party connectors (e.g., native Shopify, TikTok, Meta Ads nodes) that would take significant effort to replicate. Others are trivial logic we already have. |

**Scoring:** Rate each factor 1-5 for the n8n approach (5 = n8n is clearly better, 1 = native is clearly better). If total score >= 18: USE N8N. If 12-17: consider hybrid. If <= 11: BUILD NATIVE.

**Important context for cost analysis:**
- Our current stack: Next.js (Netlify), Express + BullMQ (Railway), Redis (Railway), Supabase (PostgreSQL)
- n8n self-hosted on Railway would add ~$5-20/month base cost
- n8n cloud pricing scales with executions
- Every external service adds operational complexity and a potential failure point
- Native implementations benefit from our existing monitoring, logging, error handling, and test suite
- BUT: n8n's pre-built connectors for Shopify, TikTok, Meta, Google Sheets, Slack, etc. can save weeks of integration work

### Step 3: Integration Recommendations

Based on the Build vs Adopt verdicts, produce a prioritized list grouped by strategy:

**Strategy 1 — Direct n8n Integration (VERDICT: USE N8N workflows)**
Workflows where the n8n approach scored >= 18. These are worth running via n8n as a sidecar. For each:
- Justify WHY n8n is better than native (cost, speed, connector advantage)
- Specify deployment approach (self-hosted on Railway vs n8n cloud)
- Detail how it connects to our Supabase database and existing APIs
- Estimate monthly cost at scale (1,000+ executions)

**Strategy 2 — Port Logic to BullMQ (VERDICT: BUILD NATIVE workflows)**
Workflows that scored <= 11 but whose LOGIC is valuable. We don't use n8n for these — we extract the automation pattern and build it into our existing backend/src/jobs/ system. For each:
- Explain the translation from n8n nodes to our TypeScript job handlers
- Why native is better (performance, cost, control)

**Strategy 3 — Hybrid Approach (scored 12-17)**
Workflows where the decision is nuanced. Perhaps use n8n for rapid prototyping, then port to native once validated. Or use n8n for the parts with complex 3rd-party connectors and native for the core logic.

**Strategy 4 — Inspiration Only (VERDICT: SKIP the workflow, keep the idea)**
Workflows that reveal automation patterns we should build natively from scratch. The n8n workflow itself isn't worth integrating, but the concept fills a gap.

**Strategy 5 — Client-Facing Automation Templates**
Workflows we could offer to YOUSELL clients as pre-built automations (competitive differentiator vs TopDawg/Sell The Trend/AutoDS). Think: "one-click marketing automation" or "auto-post winning products to social media." These could be a premium feature — clients get access to a library of proven automation workflows.

### Step 3b: Architecture Decision Record

Produce a clear architectural recommendation:

**Should YOUSELL adopt n8n as part of its infrastructure?**

Answer with:
1. **Yes — as a core component**: n8n runs alongside BullMQ, handling specific workflow categories. Define which categories.
2. **Yes — as a client-facing feature**: Embed n8n for client self-service automations (like Zapier integrations).
3. **Partial — for prototyping only**: Use n8n to validate automation ideas quickly, then port proven ones to native.
4. **No — native only**: The overhead isn't worth it. Build everything in BullMQ.

Support your recommendation with:
- Total cost comparison (n8n infrastructure vs native development time)
- Performance impact analysis
- Maintenance burden assessment
- How many of the evaluated workflows actually scored >= 18 (USE N8N)
- Risk analysis (what happens if n8n goes down, pricing changes, etc.)

### Step 4: Output File

**Create `docs/N8N_WORKFLOW_ANALYSIS.md`** containing:
- Full bucket analysis with filtered workflow counts
- Top 10-15 workflows per bucket with Build vs Adopt decision matrix scores
- Clear VERDICT for every evaluated workflow (USE N8N / BUILD NATIVE / SKIP)
- Integration recommendations grouped by strategy
- Architecture Decision Record: should YOUSELL adopt n8n? (with cost/performance/risk analysis)
- Priority implementation roadmap (which workflows to integrate first, in what order)
- Cost projection table: n8n infrastructure costs vs native development costs at 100/1K/10K executions
- Architecture diagram notes: how n8n would fit alongside our existing BullMQ + Express + Netlify stack

Target: 400+ lines.

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
9. Total output target: RTM should be 500+ lines, Improvement Plan should be 300+ lines, Research Log should be 400+ lines, n8n Analysis should be 400+ lines.
10. Quality bar: A senior engineer unfamiliar with the project should be able to read the RTM and understand exactly what works, what doesn't, and what's next.
11. **Research thoroughness**: Use WebSearch and WebFetch for EVERY competitor platform. Do not skip any. Use multiple search queries per niche. The research log must prove exhaustive coverage.
12. **Research log is mandatory**: docs/RESEARCH_LOG.md must be created during Phase 2. Every search query, every URL fetched, every finding must be logged. This is non-negotiable.
13. **YOUSELL positioning**: Always frame analysis through the lens that YOUSELL is model-agnostic (dropship OR bulk buy), AI-first, and covers discovery + content + marketing — not just product finding.
14. **Niche coverage**: E-commerce intelligence, AI content creation, marketing automation, and supplier/fulfillment niches must ALL be researched. If any niche has fewer than 5 research entries in the log, keep researching.
15. **Four deliverables minimum from Phase 2 + 2.5**: docs/RESEARCH_LOG.md, docs/IMPROVEMENT_PLAN.md, docs/N8N_WORKFLOW_ANALYSIS.md, and the self-review annotations added back to docs/RTM_v7.md.
16. **n8n analysis must be data-driven**: Read the actual spreadsheet. Don't guess workflow names — filter programmatically, then evaluate the top results. Use Bash with Python/openpyxl to parse the xlsx file.

## OUTPUT FILES SUMMARY

At the end of all 3 phases, the following files must exist:

| File | Phase | Min Lines | Purpose |
|------|-------|-----------|---------|
| `docs/RTM_v7.md` | Phase 1 | 500+ | Requirements Traceability Matrix |
| `docs/RESEARCH_LOG.md` | Phase 2 | 400+ | Full audit trail of all market research |
| `docs/IMPROVEMENT_PLAN.md` | Phase 2 | 300+ | Categorized improvement recommendations |
| `docs/N8N_WORKFLOW_ANALYSIS.md` | Phase 2.5 | 400+ | n8n workflow evaluation with Build vs Adopt verdicts and architecture decision |
| Updated `system/development_log.md` | Phase 3 | +50 lines | Session entry with audit findings |
| Updated `system/ai_logic.md` | Phase 3 | as needed | Engine logic corrections |
| Updated `system/yousell_master_qa_prompt_v7.md` | Phase 3 | +20 tests | New test cases for gaps |
| Updated `system/e2e_testing_strategy.md` | Phase 3 | as needed | New test scenarios |
