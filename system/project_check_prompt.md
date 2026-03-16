# YOUSELL Platform — Master Audit & Improvement Prompt (v2)

> Copy this entire prompt into a new Claude Code session to execute the full project check.
> This prompt covers ALL 50 sections of the YouSell Platform Technical Specification v7.

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
src/lib/engines/          — all engine files
src/lib/scoring/          — composite.ts, profitability.ts
src/lib/providers/        — all provider directories (TikTok, Amazon, Shopify, Pinterest, Digital, AI Affiliate, Physical Affiliate)
src/app/api/admin/        — all 22 admin API routes
src/app/api/dashboard/    — all client API routes
src/app/api/webhooks/     — webhook handlers (Stripe, Shopify, TikTok)
src/app/api/auth/         — auth callback, signout
src/app/admin/            — all 22 admin pages
src/app/dashboard/        — all client pages
src/components/           — UI components (product-card, score-badge, platform-products, ui/)
src/lib/supabase/         — Supabase client configs
src/lib/auth/             — auth utilities
src/lib/types/            — TypeScript type definitions
src/lib/email.ts          — Resend email service
src/middleware.ts          — auth middleware
backend/src/index.ts      — Express server + routes
backend/src/worker.ts     — BullMQ scan worker
backend/src/lib/          — queue.ts, scoring.ts, providers.ts, supabase.ts, email.ts, mock-data.ts
supabase/migrations/      — all migration SQL files
tests/                    — all test files
```

Do NOT summarize from memory. Read each file. You are building a complete mental model of what exists vs what the v7 spec requires.

---

## PLATFORM OVERVIEW (Sections 1–7 of v7 Spec)

YOUSELL is an AI-powered commerce intelligence SaaS that automates the entire e-commerce product lifecycle. It is NOT a dropshipping-only platform. It is model-agnostic — clients can dropship OR buy in bulk. The platform covers discovery + content + marketing automation + AI-powered insights across SEVEN opportunity channels.

### The Seven Opportunity Channels (Section 2.2)

Every audit must verify coverage across ALL seven channels:

| # | Channel | Type | Product Scope | Core Strategy |
|---|---------|------|---------------|---------------|
| 1 | TikTok Shop | Impulse | Non-gated physical + digital | Influencer + TikTok Ads + Meta Ads |
| 2 | Amazon FBA | Search-driven | White-label / non-gated physical | PPC + Launch Strategy + Influencer |
| 3 | Shopify DTC | Hybrid | Any product incl. branded + digital | Meta + Google + Influencer |
| 4 | Pinterest Commerce | Visual discovery | Home, fashion, beauty, lifestyle | Pinterest Ads + Influencer + SEO |
| 5 | Digital Products | Digital | Templates, courses, AI prompts, tools | Content + Affiliates + SEO |
| 6 | AI Affiliate Programs | Commission | AI SaaS + subscription tools | Affiliate promotion + influencer |
| 7 | Physical Affiliate | Commission | TikTok Shop + Amazon affiliate products | Influencer + content |

### Additional Intelligence Layers (Section 2.3)

Verify each of these intelligence layers exists and functions:

1. **Trend Scout Agent** — Detects products before viral peak across ALL platforms
2. **Competitor Store Intelligence** — Maps who is already monetising each trend
3. **Influencer Intelligence Engine** — Profiles, scores, and drafts outreach for creators (with one-click invite buttons)
4. **Supplier Discovery Engine** — Finds manufacturers in China, UK, EU, USA
5. **Profitability & Logistics Engine** — Full unit economics before any recommendation
6. **Financial Modelling Engine** — ROI projections for influencer and ad campaigns
7. **Launch Blueprint Engine** — Complete one-click launch plan per product
8. **Client Allocation System** — Assign winning products to client accounts
9. **Content Creation Engine** — AI-generated marketing content for social channels
10. **Store Integration Engine** — Push products to Shopify, TikTok Shop, Amazon stores
11. **Order Tracking Engine** — Post-purchase email sequences via Resend

### Dual-Platform Architecture (Section 4)

The platform operates as TWO interconnected but separable applications:

- **YouSell Intelligence Engine** (admin.yousell.online) — Admin product discovery, scoring, pipeline management
- **YouSell Client Platform** (yousell.online) — Client-facing SaaS with subscriptions, automation, store integration

Three deployment modes must be supported:
- `linked` — Both platforms share DB, auth, billing (default)
- `standalone_intel` — Intelligence engine operates independently (sell to agencies)
- `standalone_dashboard` — Client dashboard operates independently (white-label)

Controlled via super-admin config toggle in `admin_settings` table.

### User Roles (Section 5)

| Role | Access |
|------|--------|
| `super_admin` | Full system access, deployment mode config |
| `admin` | All intelligence features, client management |
| `client` | Dashboard only, scoped to allocated products |
| `viewer` | Read-only (safe fallback) |

### SaaS Revenue Model (Section 3)

- Per-platform subscriptions ($29–$299/month range)
- 8 modular engines toggleable per client per platform
- Data visibility is generous (paywall is on AUTOMATION, not on seeing data)
- AI Affiliate model: Hybrid subscription (Model C) — client keeps 100% of affiliate commissions, pays YouSell for platform + automation

### Anti-Churn Design (Section 3.4)

Six hooks that make subscription irreplaceable:
1. Daily fresh AI content stops on cancel
2. Connected channel auto-posting stops on cancel
3. Weekly new opportunity alerts stop
4. Performance optimization intelligence lost
5. Trend-aware content can't be stockpiled
6. Seasonal campaigns missed

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

### Section B — Data Source Module Audit (Sections 8.1–8.7)

Audit ALL SEVEN data source modules — not just TikTok:

**B.1 — TikTok Products Module (Section 8.1)**
- Data sources: TikTok Creative Center, Apify TikTok Shop Trending Scraper, ScrapeCreators TikTok Shop API, TikTok Research API (pending), CSV/Excel import
- Data collected: product name, category, image, GMV, creator counts, engagement, trend growth, competitor stores, influencer video URLs, revenue estimate, margin estimate, marketing strategy
- Verify: provider files, API routes, worker integration, mock data vs real

**B.2 — Amazon Products Module (Section 8.2)**
- Data sources: Amazon PA-API (pending), Apify Amazon BSR Tracker, RapidAPI Real-Time Amazon Data, SerpAPI
- Data collected: ASIN, title, category, BSR + trend, monthly sales estimate, reviews, price history, FBA fees, net margin, search volume, competition score, PPC keyword list, private label launch brief
- Verify: provider files, API routes, scoring integration

**B.3 — Shopify Products Module (Section 8.3)**
- Data sources: Apify Shopify Store Scraper, Meta Ads Library, TikTok Ads Library, pytrends, Reddit API
- Goal: DTC brands, 30%+ margin, no brand restrictions
- Verify: provider files, ad library integration

**B.4 — Pinterest Commerce Module (Section 8.4)**
- Data sources: Apify Pinterest Trending Scraper, Pinterest API for Advertisers, pytrends + SerpAPI
- Key insight: Pinterest trends predict Google Trends by 2–6 weeks — flag this pattern
- Verify: provider files, trend prediction logic

**B.5 — Digital Products Module (Section 8.5)**
- Data sources: Gumroad (Apify), Etsy digital products (Apify), ClickBank, ShareASale, Udemy, AppSumo
- Goal: high-commission digital products promotable via content/influencers
- Verify: provider files, affiliate commission tracking

**B.6 — AI Affiliate Programs Module (Section 8.6)**
- Pre-seeded: 10 AI programs (Jasper, Pictory, Synthesia, Writesonic, GetResponse, HubSpot, ManyChat, Creatify AI, Canva, Semrush)
- Ongoing discovery: Product Hunt API, PartnerStack marketplace, AppSumo, Twitter/X
- Verify: affiliate_programs table seeded, discovery automation, commission tracking

**B.7 — Physical Affiliate Products Module (Section 8.7)**
- Data sources: TikTok Shop Affiliate Centre, Amazon Associates, Apify TikTok Shop Affiliate scraper
- Goal: commission without inventory
- Verify: provider files, affiliate link handling

For each module, document: spec reference, what providers exist, what data they actually return, whether mock data is used, what's real vs stub, completeness vs v7 requirements.

### Section C — Supporting Systems Audit

Audit each supporting system against v7 spec requirements:

**C.1 — Supabase Auth + RLS (Sections 5, 48)**
- Check actual RLS policies vs spec requirements
- Verify 4 user roles enforced correctly
- Check known bugs: BUG-001 (admin layout no role check), BUG-035 (clients table RLS blocks queries)

**C.2 — BullMQ Job Queue (Sections 14–15)**
- Which jobs exist: scan-queue (built), transform-queue, scoring-queue, content-queue, distribution-queue, order-tracking-queue
- Which actually process, which are stubs
- Check known bugs: BUG-050 (sequential scraping), BUG-051 (no graceful shutdown), BUG-052 (no dead letter queue)

**C.3 — Stripe Subscription Billing (Section 3.2, 10.2)**
- Webhook handling completeness
- Tier enforcement per platform
- Customer Portal integration
- Tables: client_subscriptions, client_platform_access, client_addons, client_usage

**C.4 — CSV Import Pipeline (Section 6.1)**
- Functional or stub?
- Which platforms supported?

**C.5 — Email System (Sections 23.4, 27)**
- What emails actually send?
- Influencer outreach emails
- HOT product notifications
- Order tracking sequences (5-step)

**C.6 — Content Generation Queue (Section 39.2)**
- content-generate job implemented or placeholder?
- content-distribute job implemented?
- content_queue table exists?

**C.7 — Order Tracking System (Section 39.2)**
- Store webhooks (Shopify, TikTok) handling
- client_orders table
- Email sequences via Resend

**C.8 — System Health Monitor (Section 40)**
- Audit logging coverage
- Error logging (BUG-030: API keys in logs, BUG-031: silent failures)
- Health endpoint on Railway backend

**C.9 — Store Integration (Section 7.2, 10.2)**
- OAuth for Shopify, TikTok Shop, Amazon
- Product push to client stores
- client_channels table with encrypted tokens

**C.10 — Marketing Channel OAuth (Section 10.2)**
- Meta Graph API, TikTok, YouTube, Pinterest OAuth
- Content distribution to client channels

### Section D — Subscription Engine Gating (Section 36)

For each of the 8 modular engines per subscription tier:

1. Product Discovery
2. Store Integration
3. Marketing & Ads
4. Content Creation
5. Influencer Outreach (with one-click invite)
6. Supplier Intelligence
7. AI Affiliate Revenue
8. Analytics & Profit Tracking

Document: which tier unlocks it, what the engine-gate component actually checks, what happens when a user without access tries to use it. Verify the gating philosophy: "paywall on automation, NOT on seeing data."

### Section E — Scoring Engine Audit (Sections 22, 29)

Verify the three-pillar scoring model:

**Final Opportunity Score:**
```
final_score = (trend_score × 0.40) + (viral_score × 0.35) + (profit_score × 0.25)
```

**Trend Opportunity Score:**
```
trend_score = (TikTok Growth × 0.35) + (Influencer Activity × 0.25) + (Amazon Demand × 0.20) + (Competition × −0.10) + (Profit Margin × 0.10)
```

**Early Viral Score (Six Signals):**
```
viral_score = (Micro-Influencer Convergence × 0.25) + (Purchase Intent × 0.20) + (Hashtag Acceleration × 0.20) + (Niche Expansion × 0.15) + (Engagement Velocity × 0.10) + (Supply Response × 0.10)
```

**Profitability Score:**
```
profit_score = (Profit Margin × 0.40) + (Shipping Feasibility × 0.20) + (Marketing Efficiency × 0.20) + (Supplier Reliability × 0.10) − (Operational Risk × 0.10)
```

**Score Tiers:**
- HOT >= 80 (push notification + email + queue for allocation)
- WARM >= 60 (positive badge, include in client reports)
- WATCH >= 40 (archive, monitor 7 days)
- COLD < 40 (auto-archive, purge after 90 days)

**AI Insight Tiers:**
- 75+: Claude Sonnet (full strategic insight, on demand)
- 60+: Claude Haiku (3-sentence explanation)
- <60: No AI analysis

Check known scoring bugs: BUG-035 (legacy 60/40 weighting), BUG-036 (backend vs frontend score mismatch), BUG-037 (overall_score alias)

### Section F — Influencer Intelligence Audit (Section 23)

Verify:
- All influencer data fields (username, platform, followers, tier, engagement, US audience %, fake follower score, niche, email, video URLs, CPP estimate, conversion score)
- Conversion Score formula: Engagement Rate × 30% + Purchase Intent Comment Ratio × 25% + Product Demo Quality × 20% + Audience Trust × 15% + US Audience % × 10%
- Tier pricing: Nano ($20–100), Micro ($100–500), Mid ($500–5K), Macro ($5K+)
- One-click invite feature (Section 23.4) — generates outreach via Claude Haiku, sends via Resend
- Data sources: Ainfluencer, Modash, Influencers.club, HypeAuditor, TikTok Creator Marketplace, YouTube Data API, Pinterest Creator API, Apify scrapers
- outreach_emails table tracking

### Section G — Video Intelligence & Pre-Viral Detection (Section 24)

Verify the six pre-viral detection signals:
1. Micro-Influencer Convergence (15–20 micro creators, same product, 48hrs, >8% engagement) — 25%
2. Comment Purchase Intent ("where to buy", "link please") — 20%
3. Hashtag Acceleration (<50 to 500+ videos/day in 48hrs) — 20%
4. Creator Niche Expansion (1 niche to 3+ in 7 days) — 15%
5. Engagement Velocity (views/likes/comments per HOUR in first 3–6 hours) — 10%
6. Supply-Side Response (new Amazon/eBay/AliExpress listings appear) — 10%

Trend lifecycle: Emerging (70–100) → Rising (50–69) → Exploding (30–49) → Saturated (<30)

### Section H — Competitor Store Intelligence (Section 25)

Verify:
- Platforms monitored: TikTok Shop, Shopify, Amazon, eBay, Etsy, Temu, AliExpress
- Discovery methods: product listing detection, influencer store mapping, ad creative monitoring
- Competitor output fields: store name/URL, platform, monthly sales estimate, traffic source, influencers promoting, ad activity, pricing strategy, bundle/upsell, success score, recommended entry strategy
- Key insight: Ads running 30+ days = HIGH CONFIDENCE profitable

### Section I — Ad Intelligence (Section 26)

Verify ROI benchmarks per channel:
- TikTok Influencer: 5×–15× ROAS
- TikTok Paid Ads: 3×–8×
- Meta: 2×–5×
- Amazon PPC: 3×–7× (ACoS <25%)
- Google Shopping: 3×–8×
- Pinterest Ads: 2×–6×
- Affiliate: Unlimited (no ad spend)

Data sources: Meta Ads Library, TikTok Ads Library, Google Shopping via SerpAPI

### Section J — Product Clustering (Section 28)

Verify clustering by:
- Category similarity (same product across platforms)
- Keyword overlap
- Influencer overlap
- Trend correlation (Google Trends)
- Cross-platform intelligence: detect on one platform, check all others

### Section K — Creator-Product Matching (Section 30)

Verify matching algorithm:
1. Niche alignment
2. Audience demographics (US %, age range)
3. Engagement quality (>3%, fake followers >70%)
4. Historical product promotion
5. Price range fit

Influencer ROI model:
```
Estimated Profit = Video Views × Conversion Rate (0.3–1%) × Profit Per Unit
```

### Section L — Marketplace Matching (Section 31)

Verify optimal marketplace selection based on:
- Product type (physical vs digital)
- Price point (impulse <$60 → TikTok, premium → Shopify, search-intent → Amazon)
- Competition density per platform
- Margin requirements (Amazon 15% fee vs TikTok 5–8% vs Shopify 0%)
- Target audience platform preferences

### Section M — Opportunity Feed (Section 32)

Verify admin feed shows: new products, score changes, influencer matches, competitor detections, system events.
Verify client feed shows: allocated products, score updates, suggested actions, locked platform teasers with upsell CTA.

### Section N — Search & Filtering (Section 33)

Verify: full-text search, filter by platform/category/trend stage/score range, sort by all score types + date + price, pagination.
Check BUG-049 (missing index) and BUG-045 (unwhitelisted sort field).

### Section O — Analytics Dashboard KPIs (Section 34)

**Admin KPIs:** total products by platform, HOT/WARM/WATCH/COLD distribution, week-over-week comparison, top categories, scan history with cost, API cost this month, MRR.
**Client KPIs:** allocated products by platform, top scoring products, content generated, influencer outreach stats, revenue estimates, platform-specific metrics.
**Realtime:** Supabase Realtime on products table with 2-second debounce.

### Section P — Database Schema Audit (Section 21)

Verify ALL 20+ existing tables:
profiles, admin_settings, clients, products, product_metrics, viral_signals, influencers, product_influencers, competitor_stores, suppliers, product_suppliers, financial_models, launch_blueprints, affiliate_programs, product_allocations, product_requests, automation_jobs, scan_history, outreach_emails, notifications, imported_files, trend_keywords

Verify ALL new tables required (Section 21.2):
client_subscriptions, client_platform_access, client_engine_config, client_usage, client_addons, client_channels, content_queue, client_orders, platform_config

### Section Q — API Routes Audit (Section 38)

Verify all 22 existing admin API routes match spec.
Verify existing dashboard API routes.
Verify new routes required:
- POST /api/webhooks/stripe
- GET /api/dashboard/subscription
- POST /api/dashboard/subscription/portal
- GET/POST /api/dashboard/engines
- GET/POST/DELETE /api/dashboard/channels
- GET/POST /api/dashboard/content
- GET /api/dashboard/orders
- POST /api/webhooks/shopify
- POST /api/webhooks/tiktok
- GET/POST /api/admin/clients/:id/engines
- GET /api/admin/clients/:id/usage
- GET /api/admin/revenue

### Section R — Worker Architecture Audit (Sections 14, 39)

Verify existing jobs: quick-scan, full-scan, client-scan.
Verify new jobs required: content-generate, content-distribute, order-tracking, influencer-refresh, supplier-refresh, affiliate-refresh.
Verify 18-step manual scan pipeline sequence (Section 39.3).
Check known bugs: BUG-050, BUG-051, BUG-052, BUG-022.

### Section S — Backend Architecture Audit (Section 13)

Verify Express server: RESTful endpoints, BullMQ integration, CORS, Helmet, rate limiting (100/min general, 10/min scans), health endpoint.
Check known bugs: BUG-016 (no RBAC), BUG-028 (userId spoofing), BUG-029 (single-origin CORS), BUG-022 (split-brain table), BUG-030 (API keys in logs).

### Section T — Frontend Architecture Audit (Section 12)

Verify App Router structure: 22 admin pages, 4+ client pages.
Verify design: dark sidebar + light content, Supabase Realtime, responsive 320px–4K, dark/light mode, WCAG 2.1 AA, Lighthouse 80+.
Verify Universal Product Card (Section 12.3): image, platform badge, trend stage badge, score gauge, key metric, influencer avatars, competitor count, supplier indicator, AI insight, action buttons (View Blueprint · Add to Client · Archive).

### Section U — Data Ingestion & Provider Audit (Sections 17–19)

Verify 6-stage ingestion pipeline: actor execution → dataset retrieval → raw storage → transformation → scoring → upsert.
Verify provider fallback chain: Official API → Apify Actor → RapidAPI/SerpAPI → CSV Import → Empty array (graceful).
Verify data freshness policy per data type.
Verify all Apify actors in use (Section 18.3).
Check BUG-040 (frontend/backend different APIs same table) and BUG-042 (duplicate provider files).

### Section V — Cost Control & Scheduler Audit (Section 16)

Verify manual-first principle: ALL automation OFF by default.
Verify 3 scan modes: Quick ($0.05–0.20), Full ($0.50–2.00), Client ($0.30–1.50).
Verify 11 automation toggle jobs (all disabled by default).
Verify 6 cost optimization rules: Haiku for bulk/Sonnet for premium, batch everything, Supabase caching, only enrich top scorers, Railway sleep mode, free API priority.
Verify monthly cost estimates per stage.

### Section W — Security Audit (Section 48)

Verify security checklist:
- [x] API keys in env vars
- [x] Admin route server-side session check
- [x] RLS on every table
- [x] Rate limiting
- [x] Helmet headers
- [x] HTTPS enforced
- [ ] CSRF protection
- [ ] Input validation/whitelisting
- [ ] OAuth tokens stored encrypted
- [ ] Admin role check in layout
- [ ] requireClient() middleware

### Section X — Multi-Tenant Isolation (Section 49)

Verify 3-level isolation: RLS, API middleware, UI scoping.
Verify product allocation model: 50 products discovered → admin allocates → visible_to_client toggle.
Verify client dashboard complete separation from admin.

### Section Y — Deployment & Environment (Section 50)

Verify: Netlify (frontend), Railway (backend + worker + Redis), Supabase (DB + auth + realtime + storage).
Verify all environment variables documented and present.
Verify Netlify and Railway configuration files.

### Section Z — Development Phases (Section 45–46)

Track completed phases (17 phases completed from v6).
Track current phase (44 bugs: 3 CRITICAL, 9 HIGH).
Track new phases A through I with dependencies and estimates.
Total: 14–16 weeks from current state to production.

### Section AA — Automatic Rejection Criteria (Section 47.3)

Verify 5 rejection rules:
1. Gross margin below 40%
2. Shipping cost > 30% of retail
3. Break-even > 2 months
4. Fragile/hazardous/special certification
5. No USA supplier under 15 days

Check BUG-063: only 5 of 8 rules implemented.

### Section AB — Traceability Matrix Table

Create a comprehensive table:

| # | v7 Requirement | Spec Section | Status | Implementation Files | Test Coverage | Notes |
|---|---------------|-------------|--------|---------------------|--------------|-------|
| 1 | ... | ... | ✅ DONE / ⚠️ PARTIAL / ❌ MISSING | ... | Yes/No | ... |

Cover EVERY requirement from ALL 50 sections of the v7 spec. Target 150+ rows. Be exhaustive.

### Section AC — Test Coverage Map

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
- Are ALL SEVEN channels covered or did I miss any?
- Are all 11 intelligence layers accounted for?

### Step 2: Market Research

> **IMPORTANT — YOUSELL Positioning:**
> YOUSELL is NOT a dropshipping-only platform. Our customers can dropship OR buy in bulk — we are model-agnostic.
> We discover winning products across SEVEN channels (TikTok, Amazon, Shopify, Pinterest, Digital Products, AI Affiliate, Physical Affiliate).
> We score viability, match creators/suppliers, and automate marketing.
> Competitors below focus heavily on dropshipping or single-platform. YOUSELL goes wider: multi-platform e-commerce intelligence + content creation + marketing automation + AI-powered insights.
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

#### Tier 8 — TikTok-Specific Intelligence (compare to our TikTok module)

22. **Kalodata** (kalodata.com) — TikTok Shop analytics and product research
23. **FastMoss** (fastmoss.com) — TikTok Shop data and creator analytics

For each: how their TikTok data compares to what our TikTok module collects.

### Step 2b: Niche Deep-Dives

Beyond individual competitors, research these NICHES thoroughly:

**Niche 1 — E-commerce Product Research & Discovery (ALL platforms, not just TikTok)**
- Search: "best product research tools for e-commerce 2025 2026"
- Search: "winning product finder tools comparison"
- Search: "TikTok product research tools"
- Search: "Amazon product research tools comparison"
- Search: "Shopify winning products tools"
- Search: "Pinterest commerce product research"
- Search: "digital product research tools"
- Identify any emerging tools we missed

**Niche 2 — AI Content Creation for E-commerce**
- Search: "AI content creation tools for e-commerce sellers"
- Search: "automated product description generators"
- Search: "AI social media content for online stores"
- Search: "AI video script generators for product marketing"
- Map the full landscape

**Niche 3 — Marketing Automation for Online Sellers**
- Search: "marketing automation for e-commerce small business"
- Search: "influencer marketing platforms for e-commerce"
- Search: "automated ad creation tools for online sellers"
- Search: "affiliate marketing automation tools"
- Identify automation gaps in YOUSELL

**Niche 4 — Supplier & Fulfillment Intelligence**
- Search: "supplier matching platforms for e-commerce"
- Search: "fulfillment automation tools comparison"
- Search: "private label supplier finder tools"
- Identify how competitors handle the supplier → fulfillment pipeline

**Niche 5 — AI Affiliate & Digital Product Platforms**
- Search: "AI affiliate program directories"
- Search: "best AI SaaS affiliate programs 2025 2026"
- Search: "digital product marketplace platforms"
- Map the landscape for our AI Affiliate and Digital Products modules

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

The research log serves as an audit trail proving that every niche was thoroughly explored. Target: 60+ research entries minimum across all niches and competitors.

At the end of the research log, include:

**Coverage Checklist:**
- [ ] All 23 competitor platforms researched
- [ ] All 7 opportunity channels compared to competitors
- [ ] E-commerce product research niche fully explored (all platforms)
- [ ] AI content creation niche fully explored
- [ ] Marketing automation niche fully explored
- [ ] Supplier & fulfillment niche fully explored
- [ ] AI affiliate & digital products niche explored
- [ ] Emerging/new tools identified
- [ ] Pricing models compared across all competitors
- [ ] UX patterns documented
- [ ] Customer complaint patterns identified
- [ ] Feature gap analysis complete for ALL 7 channels

### Step 3: Produce Improvement Recommendations

Create the file: `docs/IMPROVEMENT_PLAN.md`

> Ground every recommendation in the research log. No hand-waving — cite which competitor or niche research led to each recommendation.

Structure:

#### Category A — Critical Gaps (must fix for launch)
Features that paying customers expect but are missing or broken. Table-stakes features across ALL channels.

#### Category B — Competitive Differentiation (YOUSELL's unfair advantage)
Features that set YOUSELL apart. Remember: multi-channel (7 channels), model-agnostic (dropship + bulk), AI-first intelligence + content creation + marketing automation. Double down on what competitors can't copy.

#### Category C — Content Creation & Marketing Engine
Specific features for content and marketing engines based on research of Jasper, Copy.ai, Predis.ai, Buffer, etc. Detail what Content Creation Engine and Marketing & Ads Engine should do for EACH of the 7 channels.

#### Category D — Revenue Optimization
Pricing model improvements. Include competitor pricing analysis, YOUSELL positioning, upsell opportunities, per-platform pricing, engine add-ons.

#### Category E — Technical Debt
Code quality, performance, security, testing gaps. Reference all known bugs from v7 spec.

#### Category F — Growth Features
Onboarding flows, referral programs, API access, white-label, marketplace/app ecosystem.

#### Category G — Supplier & Fulfillment Pipeline
Based on research, detail supplier → order → fulfillment pipeline for EACH relevant channel (TikTok Shop, Amazon FBA, Shopify DTC).

#### Category H — Channel-Specific Improvements
For EACH of the 7 channels, detail specific improvements needed:
1. TikTok Shop improvements
2. Amazon FBA improvements
3. Shopify DTC improvements
4. Pinterest Commerce improvements
5. Digital Products improvements
6. AI Affiliate Programs improvements
7. Physical Affiliate improvements

For each recommendation:
- Feature name and one-line description
- Which competitor(s) inspired it (with specific URL/feature reference from research log)
- Which of the 7 channels it applies to
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
- Pinterest: (check) | Digital Products: (check) | AI Tools: (check)

### Step 1: Extract and Filter

Extract the zip file and read the spreadsheet. Filter workflows into YOUSELL-relevant buckets:

**Bucket A — Product Discovery & Intelligence** (priority: HIGH)
Filter by: categories containing "Product & Market Insights", "Extraction", or names/nodes containing shopify, amazon, tiktok, pinterest, product research, scraping, competitor, trend, BSR, winning product, digital product, affiliate

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

**Bucket G — Platform-Specific** (priority: HIGH)
Filter by: names/nodes containing pinterest, amazon fba, shopify store, tiktok shop, gumroad, etsy, digital product

### Step 2: Rank and Evaluate

For each bucket, identify the **top 10-15 most relevant workflows** based on:
1. Direct applicability to a YOUSELL engine or feature
2. Applicability across the 7 opportunity channels
3. Popularity (Total Views)
4. Recency (prefer 2025-2026)
5. Node compatibility (Supabase, Stripe, Shopify, TikTok, Claude/OpenAI, Resend, Apify)

For each selected workflow, produce a **Build vs Adopt decision** using this evaluation framework:

| Field | Detail |
|-------|--------|
| **Workflow ID & Name** | From spreadsheet |
| **n8n URL** | Direct link |
| **Views** | Popularity indicator |
| **Nodes Used** | Key integrations |
| **YOUSELL Engine Mapping** | Which engine/feature AND which of the 7 channels this enhances |
| **Integration Strategy** | How to adapt for YOUSELL (n8n embed, port to BullMQ, API integration, inspiration-only) |
| **Implementation Effort** | S/M/L |
| **Value Add** | What capability this gives us that we don't have today |

#### Build vs Adopt Decision Matrix (apply to EVERY workflow)

For each workflow, answer these 5 questions and produce a clear **VERDICT: USE N8N** or **VERDICT: BUILD NATIVE** or **VERDICT: SKIP**:

| Decision Factor | Question to Answer |
|-----------------|-------------------|
| **Cost Efficiency** | Is using this n8n workflow cheaper than building natively? Calculate at 100, 1,000, and 10,000 executions/month. |
| **Speed to Market** | How fast can we integrate vs building ourselves? Estimate hours for both. |
| **Ease of Maintenance** | Which is easier long-term? n8n visual vs native TypeScript in our codebase. |
| **SaaS Performance Impact** | Latency, reliability, scalability, data residency considerations. |
| **Functionality Gap** | Does this provide functionality we genuinely cannot build efficiently ourselves? |

**Scoring:** Rate each factor 1-5 for the n8n approach (5 = n8n clearly better). Total >= 18: USE N8N. 12-17: hybrid. <= 11: BUILD NATIVE.

### Step 3: Integration Recommendations

Group by strategy:

**Strategy 1 — Direct n8n Integration** (scored >= 18)
**Strategy 2 — Port Logic to BullMQ** (scored <= 11 but logic valuable)
**Strategy 3 — Hybrid Approach** (scored 12-17)
**Strategy 4 — Inspiration Only** (skip workflow, keep idea)
**Strategy 5 — Client-Facing Automation Templates** (competitive differentiator)

### Step 3b: Architecture Decision Record

**Should YOUSELL adopt n8n as part of its infrastructure?**

Answer with cost comparison, performance analysis, maintenance burden, risk analysis.

### Step 4: Output File

**Create `docs/N8N_WORKFLOW_ANALYSIS.md`** containing:
- Full bucket analysis with filtered workflow counts per channel
- Top 10-15 workflows per bucket with Build vs Adopt decision matrix scores
- Clear VERDICT for every evaluated workflow
- Integration recommendations grouped by strategy
- Architecture Decision Record
- Priority implementation roadmap
- Cost projection table at 100/1K/10K executions
- Architecture diagram: how n8n fits alongside BullMQ + Express + Netlify

Target: 400+ lines.

---

## PHASE 3: Update Project Documentation

Based on Phases 1 and 2, update the following files:

### system/development_log.md
Add a new session entry documenting:
- The RTM audit findings
- Current completion percentage per engine AND per channel (all 7)
- Top 10 gaps by severity
- Recommended next implementation priorities

### system/ai_logic.md
Update if any engine logic descriptions are outdated or missing based on what the code actually does now. Ensure all 7 channels are described.

### system/yousell_master_qa_prompt_v7.md
Add new test cases for any untested requirements discovered in the RTM. Ensure test cases cover ALL 7 channels.

### system/e2e_testing_strategy.md
Update with new test scenarios for gaps identified in the RTM.

### tests/ (if applicable)
Outline test cases that should be added (don't implement yet — document the test plan).

---

## EXECUTION RULES

1. Use subagents for parallel file reading — don't read 50+ files sequentially in the main context.
2. Enter plan mode before starting each Phase.
3. Be brutally honest in the RTM. Mock data pretending to be real functionality = ❌ MISSING, not ✅ DONE.
4. If a provider falls back to mock data when no API key is configured, mark as ⚠️ PARTIAL with note.
5. Cite exact file paths and line numbers for every claim in the RTM.
6. Do not skip any engine, channel, or requirement — exhaustive coverage across ALL 7 channels is the goal.
7. Commit after each Phase completion with a descriptive message.
8. Update system/development_log.md after each Phase.
9. Total output target: RTM 600+ lines, Improvement Plan 400+ lines, Research Log 500+ lines, n8n Analysis 400+ lines.
10. Quality bar: A senior engineer unfamiliar with the project should understand exactly what works, what doesn't, and what's next — for EVERY channel and engine.
11. **Research thoroughness**: Use WebSearch and WebFetch for EVERY competitor platform. Do not skip any. Multiple search queries per niche.
12. **Research log is mandatory**: docs/RESEARCH_LOG.md must be created during Phase 2.
13. **YOUSELL positioning**: Always frame through the lens that YOUSELL is model-agnostic, multi-channel (7 channels), AI-first, and covers discovery + content + marketing.
14. **Niche coverage**: All 5 niches must be researched with 5+ entries each. The AI affiliate and digital products niches are just as important as TikTok and Amazon.
15. **Four deliverables minimum from Phase 2 + 2.5**: docs/RESEARCH_LOG.md, docs/IMPROVEMENT_PLAN.md, docs/N8N_WORKFLOW_ANALYSIS.md, and self-review annotations on docs/RTM_v7.md.
16. **n8n analysis must be data-driven**: Read the actual spreadsheet. Filter programmatically.
17. **Channel coverage**: EVERY audit section must explicitly address all 7 channels. If a channel is missing implementation, flag it as ❌ MISSING.

## OUTPUT FILES SUMMARY

At the end of all 3 phases, the following files must exist:

| File | Phase | Min Lines | Purpose |
|------|-------|-----------|---------|
| `docs/RTM_v7.md` | Phase 1 | 600+ | Requirements Traceability Matrix (all 7 channels, all engines) |
| `docs/RESEARCH_LOG.md` | Phase 2 | 500+ | Full audit trail of all market research |
| `docs/IMPROVEMENT_PLAN.md` | Phase 2 | 400+ | Categorized improvement recommendations (per-channel) |
| `docs/N8N_WORKFLOW_ANALYSIS.md` | Phase 2.5 | 400+ | n8n evaluation with Build vs Adopt verdicts |
| Updated `system/development_log.md` | Phase 3 | +50 lines | Session entry with audit findings |
| Updated `system/ai_logic.md` | Phase 3 | as needed | Engine logic corrections (all channels) |
| Updated `system/yousell_master_qa_prompt_v7.md` | Phase 3 | +20 tests | New test cases for gaps (all channels) |
| Updated `system/e2e_testing_strategy.md` | Phase 3 | as needed | New test scenarios |
