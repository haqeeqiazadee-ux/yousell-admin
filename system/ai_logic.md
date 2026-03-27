# YOUSELL PLATFORM — AI LOGIC REFERENCE

This file defines the core operational logic of the YouSell platform.
All system components must respect the rules documented here.

---

## DEDUPLICATION

When duplicates are detected:
- existing records are updated
- new records are not created

Deduplication prevents inflated opportunity signals.

---

## SIGNAL ANALYSIS

Signals are extracted from raw product data.
Examples include:
- sales indicators
- creator promotion signals
- ad activity signals
- marketplace demand signals
- engagement signals
- price competitiveness
- product uniqueness

Signals are used to evaluate product potential.

---

## PRODUCT SCORING

Each product receives a **score between 0 and 100**.
The score estimates product opportunity potential.

Signals contributing to the score include:
- demand velocity
- creator promotion frequency
- engagement signals
- market saturation
- supplier availability
- profit margin potential
- shipping feasibility
- competitive density

Scores are normalized to allow comparison across products.

---

## PRODUCT LIFECYCLE

Products move through lifecycle stages.

Stages include:

**WATCH**
Early signal detected.

**WARM**
Multiple signals emerging.

**HOT**
Strong growth indicators and high opportunity.

**SATURATED**
Market becoming crowded.

**ARCHIVE**
No longer actionable.

Lifecycle stage influences whether a product is surfaced to clients.

---

## ENRICHMENT

High scoring products trigger enrichment processes.

Enrichment collects additional intelligence including:
- supplier discovery
- influencer discovery
- margin calculations
- competitor analysis
- demand trajectory analysis

Enrichment is only performed on **selected high-potential products** to conserve resources.

---

## OPPORTUNITY CLASSIFICATION

After enrichment the system determines whether a product qualifies as a **client opportunity**.

Evaluation considers:
- margin viability
- shipping feasibility
- supplier availability
- demand sustainability
- competition intensity

Products that fail financial viability checks are rejected.

---

## ADMIN VALIDATION

Admin operators review high-potential products.

Admins may:
- approve opportunities
- reject opportunities
- adjust scoring
- attach additional intelligence
- assign suppliers
- assign influencers

Only approved products become client opportunities.

---

## CLIENT ALLOCATION

Approved opportunities are allocated to clients.

Allocation logic may consider:
- client niche
- subscription tier
- geographic constraints
- product category
- supplier compatibility

Clients only see opportunities allocated to them.

---

## AUTOMATION PRINCIPLES

The system follows a **manual-first automation model**.

This means:
- automation is optional
- admin validation occurs before automation
- high-risk operations require approval

Automation engines operate only after proper configuration.

---

## WORKER ARCHITECTURE

Heavy operations must run inside background workers.

Examples:
- scraping
- signal collection
- enrichment
- influencer discovery
- supplier discovery

API routes must **not run heavy scraping or data collection**.
API routes serve stored data or enqueue worker jobs.

---

## DATA INTEGRITY RULES

The system must enforce the following:

1. Product identity must be unique.
2. Duplicate ingestion must update existing records.
3. Client data must remain isolated.
4. Admin operations must never expose internal datasets to clients.
5. Queue jobs must be idempotent where possible.
6. Webhooks must handle duplicate events safely.

---

## SECURITY PRINCIPLES

The platform must ensure:
- tenant isolation
- protected secrets
- role-based access
- secure OAuth token storage
- protected API routes

Sensitive credentials must never be exposed to frontend code.

---

## BILLING AND ACCESS CONTROL

Client platform access is controlled through subscription state.

Subscription status determines:
- feature access
- automation availability
- opportunity limits
- integration availability

Billing state is synchronized through Stripe events.

---

## INTEGRATION LOGIC

Clients may connect external systems.

Examples include:
- ecommerce stores
- marketing platforms
- content channels

Connections are established through OAuth or API credentials.
Credentials must be stored securely.

---

## ORDER MANAGEMENT

The system may track orders generated from launched products.

Order tracking may include:
- order status
- fulfillment state
- shipment tracking
- delivery confirmation

Order events may trigger notifications or email sequences.

---

## CONTENT GENERATION

The system may generate marketing content for clients.

Content generation may include:
- product ads
- influencer scripts
- marketing copy
- promotional assets

Generated content may be distributed through connected channels.

---

## SYSTEM BOUNDARIES

The system must maintain strict boundaries between:

**Admin intelligence system**
and
**Client SaaS interface.**

Clients must not access internal discovery systems.

---

## PRINT ON DEMAND (POD) LOGIC

POD products are Channel #8 in the platform's eight opportunity channels.

POD products use the same 3-pillar scoring model (trend × 0.40 + viral × 0.35 + profit × 0.25) with POD-specific modifiers:
- design trend velocity (trending aesthetics score higher)
- seasonal relevance (holiday/event designs get temporal bonus)
- niche saturation (oversaturated design categories are penalized)
- fulfillment cost impact (POD base costs affect profit score)
- minimum 30% margin requirement (POD products below 30% margin are auto-rejected)

POD fulfillment is zero-inventory: the POD partner (Printful, Printify, Gelato) manufactures and ships on order receipt.

POD sub-categories: Apparel, Home & Living, Accessories, Stationery, Wall Art & Posters.

---

## ADMIN COMMAND CENTER LOGIC

The Admin Command Center is the profit-maximizing dashboard for YOUSELL's OWN shops.

Key principles:
- Top-scoring products are surfaced with one-click deployment buttons
- Each action (Push to Platform, Launch Marketing, Generate Content) triggers a BullMQ job
- No action runs inline — all are queued for background execution
- Per-platform pipeline view shows live products and weekly revenue
- This is the ADMIN's platform for YOUSELL's own stores, not client-facing

Action buttons:
- Push to [Platform] → OAuth-authenticated product listing creation
- Push to All → parallel listing across all connected stores
- Launch Marketing → ad copy + campaign blueprint generation
- Influencer Outreach → match top creators + generate outreach emails
- Generate Content → AI creates social posts, descriptions, video scripts
- Financial Model → unit economics + ROI projection

---

## AFFILIATE COMMISSION ENGINE LOGIC

The Affiliate Commission Engine tracks two separate revenue streams:

**Stream 1 — Internal Content Revenue:**
- YOUSELL's own content engine generates affiliate marketing content
- Reviews, comparisons, tutorials, sign-up guides for affiliate platforms
- Content published via YOUSELL's own social/blog channels
- Revenue tracked per content piece and per platform
- Admin dashboard only — zero client visibility

**Stream 2 — Client Service Revenue:**
- Commissions earned when clients adopt platforms provisioned through YOUSELL
- Auto-tracked when clients are onboarded to partner platforms
- Revenue tracked per client and per platform

Priority affiliate programs:
- Shopify Partner (20% recurring lifetime)
- Spocket (20-30% LIFETIME recurring — highest value)
- Printful (10% for 12 months)
- Klaviyo (10-20% recurring)
- Canva (36% for 12 months)
- Stripe ($2,500 per merchant)
- PayPal ($2,500 per merchant)

A single client can generate affiliate commissions from 4+ platforms simultaneously.
This is compounding passive income ON TOP of YOUSELL subscription revenue.

---

## FULFILLMENT RECOMMENDATION LOGIC

The system auto-recommends fulfillment model per product:

- Physical product < $30 + fast-ship supplier → DROPSHIP
- Physical product $30-100 + high demand → WHOLESALE (Faire/Alibaba + FBA)
- Physical product > $100 → WHOLESALE/PRIVATE LABEL only
- Design/aesthetic product → POD (Printful/Printify/Gelato)
- Digital product → DIGITAL DELIVERY (Gumroad/Etsy/Shopify)
- AI/Software tool → AFFILIATE (link + promote via content)

---

## EIGHT OPPORTUNITY CHANNELS

The platform operates across eight channels:

1. TikTok Shop
2. Amazon FBA
3. Shopify DTC
4. Pinterest Commerce
5. Digital Products
6. AI Affiliate Programs
7. Physical Affiliate Products
8. Print on Demand (POD)

All scoring, discovery, and enrichment logic applies across all eight channels.

---

## INTER-ENGINE OPERATIONAL CONTRACTS (NEW — Engine Independence)

**Reference:** Technical Specification v8, Section 9A

### Communication Rule

Engines never directly call each other's functions or read each other's database tables. All cross-engine data flow uses the event bus (Redis Pub/Sub + Supabase Realtime).

### Scoring Pipeline Contract

The scoring pipeline spans 4 engines, each with a strict handoff:

```
Product Discovery ──product.discovered──→ Data Fusion
Data Fusion ────────product.fused──────→ Composite Scoring
Composite Scoring ──product.scored─────→ Profitability Engine
```

**Rules:**
- Product Discovery emits `product.discovered` with raw product data. It does NOT score.
- Data Fusion merges multi-source data into a unified product record. It does NOT score.
- Composite Scoring applies the 3-pillar formula (trend × 0.40 + viral × 0.35 + profit × 0.25). It does NOT enrich.
- Profitability Engine computes margins, logistics costs, and ROI. It does NOT modify scores.

### Enrichment Trigger Contract

Enrichment engines activate based on score thresholds from `product.scored` events:

| Threshold | Triggered Engines |
|-----------|------------------|
| score >= 60 | Influencer Intelligence, Supplier Discovery, Competitor Intelligence |
| score >= 75 | Ad Intelligence (premium — uses Claude Sonnet) |
| score >= 80 (HOT) | Client Allocation, Command Center |

**Rule:** Enrichment engines subscribe to `product.scored` and filter locally. The Composite Scoring engine does NOT selectively publish to different engines.

### Content Pipeline Contract

```
Client Allocation ──product.allocated──→ Creative Studio
Creative Studio ────content.generated──→ Smart Publisher
Smart Publisher ────content.published──→ Affiliate Commission
```

**Rules:**
- Creative Studio generates content only for allocated products. It never generates content speculatively.
- Smart Publisher distributes only `content.generated` events with `status: approved` (or auto-approved if automation level permits).
- Affiliate Commission passively tracks published content for affiliate link performance. It never modifies content.

### POD Pipeline Contract

```
Trend Scout ──trend.detected (POD)──→ POD Intelligence
POD Intelligence ──pod.design_ready──→ POD Scoring
POD Scoring ──pod.scored──→ Command Center (if HOT)
```

**Rule:** POD Intelligence owns the full design-to-mockup lifecycle. It publishes `pod.design_ready` only when mockups are complete.

### Failure Isolation Contract

- If any engine fails, other engines continue operating on their existing data.
- Failed events are retried 3 times with exponential backoff, then moved to a dead-letter queue.
- No engine blocks waiting for another engine's response (fire-and-forget pattern).
- The Automation Orchestrator monitors all engine health and can pause/resume individual engines.

---

---

## EXTERNAL ENGINE INTEGRATION LOGIC (Added 2026-03-27)

Any platform that provides an API can integrate into the YOUSELL system
and replace any existing internal engine. This is managed through the
Governor's external engine adapter system.

### Registration Flow
1. Admin registers external engine via `/admin/governor/engines` (endpoint, auth, cost, health check)
2. Auth token is encrypted (AES-256-GCM) before storage in `external_engines` table
3. Admin tests connectivity via the Test button (pings health endpoint)
4. Admin creates a swap: source engine → external engine (via `/admin/governor/swaps`)

### Runtime Routing
1. Governor dispatch cache refreshes every 30 seconds
2. When a request arrives for a swapped engine, dispatch checks `externalSwapCache`
3. If external swap found → `callExternalEngine()` sends HTTP POST to registered API
4. Response is normalized to `EngineOperationResult` (same as internal engines)
5. Usage is metered identically — cost recorded in `engine_usage_ledger`

### External Engine API Contract
External engines receive:
```json
{ "operation": "...", "params": { ... }, "correlationId": "uuid", "timestamp": "ISO-8601", "source": "yousell-governor" }
```
External engines must return:
```json
{ "success": true|false, "data": { ... }, "error": "..." }
```

### Fault Isolation
- Each external engine gets its own circuit breaker (3 failures → open, 60s reset)
- Timeout is configurable per engine (default 30s)
- External engine failures do NOT affect other engines
- Admin can revert any external swap instantly via the Revert button

### Security
- Auth tokens never returned to the frontend (masked as `••••••••`)
- AES-256-GCM encryption at rest using `ENCRYPTION_KEY` env var
- Admin-only access (RLS policies enforce role checks)
- Soft-delete only — deactivation cascades to active swaps

---

## FINAL PRINCIPLE

The goal of the YouSell platform is to convert **complex market signals into actionable ecommerce opportunities**.

All system components must support this objective while preserving:
- data integrity
- client isolation
- operational reliability
- intelligent automation
- **engine independence** (any engine extractable as standalone SaaS)
- **engine extensibility** (any engine replaceable by external API)

Any system modification must respect the logic defined in this file.
