# V9 Engine Governor Architecture

> **Version:** 1.0
> **Date:** 2026-03-22
> **Status:** Design — Pre-Implementation
> **Supersedes:** None (new subsystem)
> **Parent Spec:** YouSell_Platform_Technical_Specification_v8.md

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Engine Cost Manifest](#2-engine-cost-manifest)
3. [Client Budget Envelope](#3-client-budget-envelope)
4. [Governor Core — Gate / Dispatch / Meter](#4-governor-core--gate--dispatch--meter)
5. [AI Automation Mode](#5-ai-automation-mode)
6. [Admin Controls & Engine Swapping](#6-admin-controls--engine-swapping)
7. [Super Admin Override](#7-super-admin-override)
8. [Database Schema](#8-database-schema)
9. [Integration Map & Task Breakdown](#9-integration-map--task-breakdown)

---

## 1. Purpose & Overview

### Problem

The 24 YOUSELL engines currently operate independently with no centralized cost
awareness, usage metering, or subscription-aware gating. Each API route calls
its engine directly. The only metering that exists is content credits.

This means:
- No way to limit a Starter client from accessing Professional-tier engines
- No tracking of real infrastructure costs per engine invocation
- No budget controls — a single client could exhaust expensive API quotas
- No ability to swap one engine implementation for another
- No AI-driven optimization of resource distribution

### Solution: The Engine Governor

The **Engine Governor** is a singleton orchestrator that sits between all
client/admin requests and the 24 engines. Every engine invocation passes
through the Governor. No exceptions.

```
Client Request → Auth → GOVERNOR → Engine → Response
                          │
                   ┌──────┼──────────────────┐
                   │      │                  │
              ┌────▼───┐ ┌▼────────┐ ┌──────▼────┐
              │  GATE  │ │  METER  │ │ DISPATCH  │
              │        │ │         │ │           │
              │ • Tier │ │ • Track │ │ • Route   │
              │ • Quota│ │ • Cost  │ │ • Swap    │
              │ • Budget│ │ • Alert │ │ • Balance │
              └────────┘ └─────────┘ └───────────┘
```

### Governor Responsibilities

| Responsibility | Description |
|---|---|
| **Feature Gating** | Block engine access if not included in client's subscription tier |
| **Quota Enforcement** | Enforce per-engine operation limits per billing period |
| **Budget Control** | Track real USD cost per invocation, enforce cost caps |
| **Usage Metering** | Real-time per-client, per-engine usage tracking |
| **Engine Swapping** | Admin can hot-swap engine implementations (e.g., replace Apify with custom scraper) |
| **AI Optimization** | Governor uses AI to redistribute resources based on usage patterns |
| **Health Routing** | Route away from unhealthy engines to fallbacks |
| **Super Admin Override** | Bypass all gates for emergency/debug operations |

### Design Principles

1. **Every engine call goes through the Governor** — no direct access
2. **Engines declare their own costs** — Governor doesn't guess
3. **Fail-closed** — if Governor can't verify access, deny the request
4. **Metering is non-blocking** — usage recording happens async after dispatch
5. **AI automation is advisory first, autonomous second** — Governor suggests, then acts
6. **Admin always has a kill switch** — manual override beats automation

---

## 2. Engine Cost Manifest

Every engine **must declare a cost manifest** — a structured breakdown of what
each operation costs in real infrastructure terms. The Governor reads these
manifests to calculate budgets, enforce caps, and optimize distribution.

### 2.1 Cost Manifest Interface

```typescript
interface EngineOperationCost {
  /** Operation identifier, e.g. 'scan', 'generate', 'sync' */
  operation: string;
  /** Human-readable label for admin dashboard */
  label: string;
  /** Base cost in USD per single invocation */
  baseCostUSD: number;
  /** Breakdown of external API costs included in baseCost */
  externalCosts: {
    provider: string;       // e.g. 'Apify', 'Claude API', 'Bannerbear'
    costPerCall: number;    // USD
    callsPerOperation: number; // How many API calls per 1 engine operation
  }[];
  /** Internal compute cost estimate (Railway CPU/memory) */
  computeCostUSD: number;
  /** Cost tier classification for quick filtering */
  costTier: 'free' | 'low' | 'medium' | 'high' | 'premium';
  /** Whether this operation is cacheable (avoids re-invoking) */
  cacheable: boolean;
  /** Cache TTL in seconds if cacheable */
  cacheTTL?: number;
}

interface EngineCostManifest {
  /** Engine name (must match EngineName type) */
  engineName: EngineName;
  /** Manifest version (for migration tracking) */
  manifestVersion: string;
  /** All operations this engine exposes */
  operations: EngineOperationCost[];
  /** Monthly fixed cost (infrastructure baseline even if 0 operations) */
  monthlyFixedCostUSD: number;
  /** Last updated timestamp */
  updatedAt: string;
}
```

### 2.2 Cost Manifest Examples (Real Costs)

| Engine | Operation | Base Cost | External Breakdown | Tier |
|---|---|---|---|---|
| discovery | scan (quick) | $0.10 | Apify: $0.08 (1 call), Claude Haiku: $0.02 (1 call) | low |
| discovery | scan (full) | $0.50 | Apify: $0.40 (5 calls), Claude Haiku: $0.10 (5 calls) | medium |
| content-engine | generate (caption) | $0.01 | Claude Haiku: $0.01 | low |
| content-engine | generate (video) | $0.25 | Shotstack: $0.20, Claude Sonnet: $0.05 | high |
| content-engine | generate (image) | $0.08 | Bannerbear: $0.06, Claude Haiku: $0.02 | medium |
| competitor-intelligence | analyze | $0.15 | Apify: $0.10, Claude Haiku: $0.05 | medium |
| supplier-discovery | search | $0.12 | Apify: $0.08, Claude Haiku: $0.04 | medium |
| scoring | score (single) | $0.001 | Internal compute only | free |
| scoring | score (batch 100) | $0.05 | Claude Haiku: $0.05 (1 batch call) | low |
| store-integration | push_product | $0.01 | Shopify API: $0.00 (free), compute: $0.01 | low |
| store-integration | sync_inventory | $0.02 | Platform API: $0.00, compute: $0.02 | low |
| order-tracking | track | $0.005 | Platform API: $0.00, compute: $0.005 | free |
| financial-model | project | $0.03 | Claude Haiku: $0.03 | low |
| launch-blueprint | generate | $0.08 | Claude Sonnet: $0.08 | medium |
| ad-intelligence | discover | $0.20 | Apify: $0.15, Claude Haiku: $0.05 | medium |
| creator-matching | match | $0.02 | Claude Haiku: $0.02 | low |
| affiliate-engine | track_commission | $0.001 | Internal compute only | free |
| pod-engine | design_generate | $0.15 | Bannerbear: $0.10, Claude Haiku: $0.05 | medium |
| automation-orchestrator | orchestrate | $0.00 | Internal routing only | free |

### 2.3 Cost Manifest Rules

1. **Every engine MUST declare a manifest** — no manifest = Governor blocks all calls
2. **Costs must reflect real prices** — admin reviews quarterly against actual invoices
3. **Manifests are versioned** — changes create new version, old preserved for audit
4. **Admin can override costs** — if actual costs diverge, admin adjusts via dashboard
5. **Free-tier operations** (internal compute only) still declare $0.00 — nothing is implicit

---

## 3. Client Budget Envelope

Each client gets a **Budget Envelope** — a billing-period container that tracks
what they're allowed to use and what they've consumed across all engines.

### 3.1 Budget Envelope Interface

```typescript
interface EngineAllowance {
  engineName: EngineName;
  /** Is this engine enabled for the client's tier? */
  enabled: boolean;
  /** Max operations per billing period (-1 = unlimited) */
  maxOperations: number;
  /** Operations consumed this period */
  usedOperations: number;
  /** Max USD spend for this engine per period (-1 = unlimited) */
  maxCostUSD: number;
  /** USD consumed this period */
  usedCostUSD: number;
  /** Percentage of allowance used (auto-calculated) */
  utilizationPercent: number;
}

interface ClientBudgetEnvelope {
  clientId: string;
  plan: PlanId;
  billingPeriod: { start: string; end: string };
  /** Per-engine allowances */
  engines: Record<EngineName, EngineAllowance>;
  /** Global cost cap across all engines (USD per period) */
  globalCostCapUSD: number;
  /** Total USD spent across all engines this period */
  totalSpentUSD: number;
  /** Content credits (legacy — subsumed into engine allowances) */
  contentCredits: { total: number; used: number };
  /** Alert thresholds */
  alerts: {
    warnAtPercent: number;      // Default 80%
    throttleAtPercent: number;  // Default 95%
    blockAtPercent: number;     // Default 100%
  };
}
```

### 3.2 Tier-to-Envelope Mapping

| Tier | Global Cap (USD/mo) | Engines Enabled | Content Credits | Scan Ops | AI Ops |
|---|---|---|---|---|---|
| Starter ($29) | $5.00 | discovery | 50 | 30/mo | 50/mo |
| Growth ($59) | $15.00 | discovery, content, store_integration | 200 | 100/mo | 200/mo |
| Professional ($99) | $40.00 | 7 engines (see stripe.ts) | 500 | 300/mo | 500/mo |
| Enterprise ($149) | $100.00 | All engines | Unlimited | Unlimited | Unlimited |

**Note:** These caps represent the infrastructure cost YOUSELL absorbs per
client. They are NOT visible to clients — clients see feature limits only.

### 3.3 Envelope Lifecycle

```
1. Client subscribes (Stripe webhook)
   → Governor creates Budget Envelope from tier template
   → Stored in DB (engine_budget_envelopes table)

2. Client uses an engine
   → Governor checks envelope BEFORE dispatch
   → Within limits → dispatch + record usage async
   → At warn threshold → dispatch + trigger alert
   → At throttle threshold → essential-only operations
   → At block threshold → deny with "limit reached"

3. Billing period resets (Stripe renewal webhook)
   → Archive current envelope → create fresh one

4. Client upgrades/downgrades (Stripe update webhook)
   → Recalculate envelope mid-period (pro-rate)
   → Expand/contract engine access immediately
```

### 3.4 Alert Escalation

| Threshold | Action | Notification |
|---|---|---|
| 80% engine quota | Continue + warn | Client dashboard banner + email |
| 95% engine quota | Throttle (essential only) | Client + admin notification |
| 100% engine quota | Block engine | "Limit reached" + upgrade CTA |
| 80% global cost cap | Continue + warn admin | Admin dashboard alert |
| 100% global cost cap | Block ALL non-free engines | Admin emergency alert |

---

## 4. Governor Core — Gate / Dispatch / Meter

The Governor has three sequential stages for every engine invocation:

### 4.1 Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    GOVERNOR PIPELINE                         │
│                                                              │
│  REQUEST ──►  GATE  ──►  DISPATCH  ──►  METER  ──► RESPONSE │
│               │            │              │                  │
│          Can they?    Route it.     Record it.               │
│               │            │              │                  │
│          ┌────▼────┐  ┌───▼────┐   ┌────▼─────┐            │
│          │ DENY +  │  │ Engine │   │ Usage    │            │
│          │ reason  │  │ result │   │ ledger   │            │
│          └─────────┘  └────────┘   └──────────┘            │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Gate Stage (Pre-Dispatch)

```typescript
interface GateResult {
  allowed: boolean;
  reason?: string;           // Why denied (human-readable)
  code?: 'NOT_IN_PLAN' | 'QUOTA_EXCEEDED' | 'BUDGET_EXCEEDED'
       | 'ENGINE_DISABLED' | 'ENGINE_UNHEALTHY' | 'THROTTLED';
  suggestion?: string;       // e.g., "Upgrade to Professional for this feature"
}

class GovernorGate {
  async check(
    clientId: string,
    engineName: EngineName,
    operation: string
  ): Promise<GateResult> {
    // 1. Is the engine in the client's plan?
    // 2. Is the engine enabled (engine_toggles)?
    // 3. Has the client exceeded operation quota?
    // 4. Has the client exceeded cost budget?
    // 5. Is the engine healthy?
    // 6. Is the client in throttle zone (95%+)?
    //    → If yes, only allow 'essential' operations
  }
}
```

**Gate checks execute in order — first failure = immediate deny.**

### 4.3 Dispatch Stage

```typescript
class GovernorDispatch {
  /**
   * Route the operation to the correct engine implementation.
   * Supports engine swapping — admin can remap engineName → different impl.
   */
  async dispatch(
    engineName: EngineName,
    operation: string,
    params: Record<string, unknown>,
    context: { clientId: string; userId: string; correlationId: string }
  ): Promise<EngineOperationResult> {
    // 1. Resolve actual engine (check swap table)
    const resolvedEngine = this.resolveEngine(engineName);
    // 2. Get engine from registry
    const engine = getEngineRegistry().getOrThrow(resolvedEngine);
    // 3. Execute with timeout + error isolation
    // 4. Return result with cost metadata attached
  }

  /**
   * Check if this engine has been swapped by admin.
   * Returns the replacement engine name, or original if no swap.
   */
  private resolveEngine(engineName: EngineName): EngineName {
    return this.swapTable.get(engineName) ?? engineName;
  }
}
```

### 4.4 Meter Stage (Post-Dispatch, Async)

```typescript
class GovernorMeter {
  /**
   * Record usage after engine execution. Non-blocking.
   * Fires as async — never delays the response to client.
   */
  async record(entry: UsageLedgerEntry): Promise<void> {
    // 1. Write to engine_usage_ledger table
    // 2. Update client's budget envelope (increment counters)
    // 3. Check if any alert thresholds crossed
    // 4. If threshold crossed → emit governor.alert event
    // 5. Emit governor.usage_recorded event (for dashboards)
  }
}

interface UsageLedgerEntry {
  clientId: string;
  engineName: EngineName;
  operation: string;
  costUSD: number;
  timestamp: string;
  durationMs: number;
  success: boolean;
  correlationId: string;
}
```

### 4.5 Governor Singleton

```typescript
class EngineGovernor {
  private gate: GovernorGate;
  private dispatch: GovernorDispatch;
  private meter: GovernorMeter;

  /**
   * The single entry point for ALL engine operations.
   */
  async execute(
    clientId: string,
    engineName: EngineName,
    operation: string,
    params: Record<string, unknown>,
    context: { userId: string; isSuperAdmin: boolean }
  ): Promise<GovernorResponse> {
    // Super admin bypass
    if (context.isSuperAdmin) {
      return this.executeWithBypass(engineName, operation, params, context);
    }

    // 1. GATE
    const gateResult = await this.gate.check(clientId, engineName, operation);
    if (!gateResult.allowed) {
      return { success: false, denied: true, ...gateResult };
    }

    // 2. DISPATCH
    const correlationId = generateCorrelationId();
    const result = await this.dispatch.dispatch(
      engineName, operation, params,
      { clientId, userId: context.userId, correlationId }
    );

    // 3. METER (async — don't await)
    const cost = this.lookupOperationCost(engineName, operation);
    this.meter.record({
      clientId, engineName, operation,
      costUSD: cost.baseCostUSD,
      timestamp: new Date().toISOString(),
      durationMs: result.durationMs,
      success: result.success,
      correlationId,
    }).catch(err => console.error('[Governor] Metering error:', err));

    return { success: true, data: result.data, correlationId };
  }
}
```

---

## 5. AI Automation Mode

The Governor doesn't just gate and meter — it **actively optimizes** engine
resource distribution using AI. This is the "brain" of the Head Engine.

### 5.1 Automation Levels

| Level | Name | Behavior | Default |
|---|---|---|---|
| 0 | **Off** | Governor gates + meters only. No AI decisions. | — |
| 1 | **Advisory** | AI analyzes patterns, suggests optimizations to admin. Admin approves. | **Default** |
| 2 | **Assisted** | AI auto-applies low-risk optimizations. Admin reviews digest. | Opt-in |
| 3 | **Autonomous** | AI manages all resource distribution. Admin gets reports. | Enterprise only |

### 5.2 What the AI Governs

**Resource Redistribution:**
- Client A uses 10% of their discovery quota but 95% of content
- AI suggests (L1) or auto-reallocates (L3) unused discovery budget to content
- Never exceeds the global cost cap — just redistributes within it

**Cost Anomaly Detection:**
- Engine X suddenly costs 3x normal → AI flags (L1) or throttles (L2+)
- Client spikes 5x normal usage in 1 hour → AI alerts + temp throttle
- External API price change detected → AI recalculates all manifests

**Engine Health Routing:**
- If `discovery` engine fails health check → AI routes to fallback
- If Apify is down → AI switches discovery to cached-only mode
- If response times spike → AI reduces batch sizes automatically

**Proactive Scaling Suggestions:**
- "Client X has hit 80% quota 3 months in a row → suggest upgrade"
- "Engine Y is consistently underused across all clients → reduce allocation"
- "Friday usage is 3x Monday → pre-warm engines on Fridays"

### 5.3 AI Decision Pipeline

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  OBSERVE    │────►│   ANALYZE    │────►│   DECIDE    │
│             │     │              │     │             │
│ • Usage     │     │ • Patterns   │     │ • Action    │
│ • Costs     │     │ • Anomalies  │     │ • Priority  │
│ • Health    │     │ • Forecasts  │     │ • Risk      │
│ • Errors    │     │ • Comparisons│     │ • Confidence│
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                    ┌───────────────────────────┼──────────┐
                    │                           │          │
               Level 1                    Level 2     Level 3
          ┌─────────▼──────┐         ┌────▼────┐  ┌──▼───┐
          │ Suggest to     │         │ Auto +  │  │ Auto │
          │ admin dashboard│         │ digest  │  │      │
          └────────────────┘         └─────────┘  └──────┘
```

### 5.4 AI Decision Log (Audit Trail)

Every AI decision is logged to `governor_ai_decisions` table:

```typescript
interface GovernorAIDecision {
  id: string;
  timestamp: string;
  level: 1 | 2 | 3;
  type: 'reallocation' | 'anomaly' | 'health_route' | 'scaling' | 'cost_alert';
  description: string;
  confidence: number;          // 0-1
  applied: boolean;            // Was it auto-applied?
  approvedBy?: string;         // Admin who approved (L1)
  affectedClients: string[];
  affectedEngines: EngineName[];
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  revertible: boolean;
}
```

### 5.5 AI Safety Rails

1. **AI never exceeds global cost cap** — redistribution only, never expansion
2. **AI never disables an engine** — only throttles or reroutes
3. **AI never modifies subscription tiers** — that's Stripe/admin territory
4. **All L2/L3 actions are revertible** — admin can undo any AI decision
5. **AI runs on Claude Haiku** (G12 compliance) — bulk analysis, not premium
6. **AI decisions expire after 24h** — must be re-evaluated, not permanent

---

## 6. Admin Controls & Engine Swapping

### 6.1 Admin Dashboard — Governor Control Panel

The admin dashboard gets a new **Governor** section with these panels:

**Panel A: Engine Fleet Overview**
- All 24 engines in a grid/list view
- Per-engine: status (running/paused/error), health, current load
- Per-engine: total operations this period, total cost, utilization %
- Color-coded: green (healthy + <80%), amber (>80%), red (error or >95%)
- Click any engine → drill into per-client usage breakdown

**Panel B: Client Budget Dashboard**
- All active clients with their budget envelopes
- Per-client: plan tier, global spend, per-engine utilization bars
- Filter by tier, sort by usage, flag clients near limits
- Inline actions: adjust quota, add bonus credits, force-reset period

**Panel C: AI Decisions Feed**
- Real-time feed of Governor AI suggestions/actions
- L1 suggestions have "Approve" / "Dismiss" buttons
- L2/L3 actions have "Revert" button
- Filter by type (reallocation, anomaly, health, scaling)

**Panel D: Cost Analytics**
- Total platform cost (all engines) vs revenue
- Per-engine cost trends (daily/weekly/monthly charts)
- Top 10 costliest clients
- Cost forecast for current billing period
- External API cost breakdown (Apify, Claude, Bannerbear, Shotstack)

### 6.2 Engine Swapping (Hot-Swap)

Admins can replace one engine implementation with another without downtime.

**Use Cases:**
- Replace Apify-based discovery with custom scraper
- Replace Bannerbear with a cheaper image generator
- Replace Claude Sonnet with Claude Haiku for cost reduction
- A/B test two engine implementations
- Roll back to previous engine version

**Swap Table:**

```typescript
interface EngineSwapEntry {
  /** The engine name clients/APIs reference */
  sourceEngine: EngineName;
  /** The actual engine implementation to use */
  targetEngine: EngineName;
  /** Why this swap was made */
  reason: string;
  /** Who made the swap */
  createdBy: string;
  /** When it was activated */
  activatedAt: string;
  /** Optional: auto-revert after this time */
  expiresAt?: string;
  /** Is this swap currently active? */
  active: boolean;
}
```

**Swap Rules:**
1. Target engine must implement the same operation interface as source
2. Swap is atomic — no in-flight requests are affected (queue drains first)
3. Swap table is checked on every dispatch (cached in memory, DB is source of truth)
4. Only admin/super_admin can create swaps
5. Swaps are logged to `governor_ai_decisions` for audit trail

**Admin UI for Swapping:**

```
┌─────────────────────────────────────────────┐
│ Engine Swap Manager                         │
│                                             │
│ Source Engine:  [discovery          ▼]      │
│ Replace With:  [tiktok-discovery   ▼]      │
│ Reason:        [Testing TikTok-first flow]  │
│ Auto-Revert:   [24 hours ▼]  or  □ Never   │
│                                             │
│ [Preview Impact]  [Activate Swap]           │
│                                             │
│ Active Swaps:                               │
│ ┌───────────┬────────────────┬───────────┐  │
│ │ discovery │→ tiktok-disc.. │ 2h ago    │  │
│ │           │ [Revert] [Ext] │           │  │
│ └───────────┴────────────────┴───────────┘  │
└─────────────────────────────────────────────┘
```

### 6.3 Per-Client Engine Configuration

Admins can configure engine access per individual client:

| Control | Description | Existing? |
|---|---|---|
| Enable/disable engine | Toggle engine for specific client | Yes (`engine_toggles`) |
| Custom quota override | Give client more/fewer ops than tier default | **New** |
| Custom cost cap | Override tier cost cap for specific client | **New** |
| Priority level | High-priority clients get preferential queuing | **New** |
| Automation level override | Set client to L0/L1/L2/L3 regardless of tier | **New** |

### 6.4 Bulk Operations

- **Pause engine globally** — disable an engine across all clients (maintenance)
- **Reset all quotas** — force-reset all client envelopes (billing fix)
- **Apply tier change** — bulk-adjust envelopes when pricing changes
- **Export usage data** — CSV download of all usage for accounting

---

## 7. Super Admin Override

Super admins have **full bypass authority** over the Governor. This is the
emergency hatch — used for debugging, support escalations, and testing.

### 7.1 Override Modes

| Mode | Scope | Duration | Audit |
|---|---|---|---|
| **Single-request bypass** | One engine call | Immediate | Logged |
| **Client bypass** | All gates disabled for one client | Time-limited (max 24h) | Logged + alert |
| **Engine bypass** | All gates disabled for one engine | Time-limited (max 24h) | Logged + alert |
| **Full bypass** | Governor gates completely disabled | Time-limited (max 1h) | Logged + alert + requires reason |

### 7.2 Override Interface

```typescript
interface GovernorOverride {
  id: string;
  type: 'single_request' | 'client_bypass' | 'engine_bypass' | 'full_bypass';
  createdBy: string;          // super_admin user ID
  reason: string;             // Mandatory — why?
  targetClientId?: string;    // For client_bypass
  targetEngine?: EngineName;  // For engine_bypass
  expiresAt: string;          // Mandatory — no permanent overrides
  active: boolean;
  createdAt: string;
}
```

### 7.3 Override Logging

**Every override is:**
- Written to `governor_overrides` table
- Emitted as `governor.override_activated` event on EventBus
- Visible in admin dashboard "Overrides" tab
- Included in daily governance audit report
- Cannot be deleted — only deactivated

### 7.4 Super Admin Governor Controls

Beyond overrides, super admins have exclusive access to:

| Control | Description |
|---|---|
| **Set AI automation level** | Switch Governor between L0/L1/L2/L3 globally |
| **Edit cost manifests** | Override engine-declared costs with actual observed costs |
| **Modify tier templates** | Change what each subscription tier gets (ops, cost caps) |
| **Force engine restart** | Stop + start any engine via Governor |
| **View full cost ledger** | Real-time view of all costs, all clients, all engines |
| **Trigger AI analysis** | Force Governor AI to run analysis cycle on demand |
| **Approve/reject AI decisions** | L1 decision approval queue |
| **Configure alert thresholds** | Change 80/95/100% defaults globally or per-client |

---

## 8. Database Schema

### 8.1 New Tables

```sql
-- Engine cost declarations (seeded from code, admin-editable)
CREATE TABLE engine_cost_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_name TEXT NOT NULL,
  manifest_version TEXT NOT NULL DEFAULT '1.0',
  operations JSONB NOT NULL,        -- Array of EngineOperationCost
  monthly_fixed_cost_usd NUMERIC(10,4) DEFAULT 0,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(engine_name, manifest_version)
);

-- Per-plan engine allowance templates
CREATE TABLE plan_engine_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier TEXT NOT NULL,           -- starter, growth, professional, enterprise
  engine_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  max_operations INTEGER DEFAULT 0,  -- -1 = unlimited
  max_cost_usd NUMERIC(10,4) DEFAULT 0, -- -1 = unlimited
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_tier, engine_name)
);

-- Per-client budget envelopes (one per billing period)
CREATE TABLE engine_budget_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  plan_tier TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  global_cost_cap_usd NUMERIC(10,4) NOT NULL,
  total_spent_usd NUMERIC(10,4) DEFAULT 0,
  engine_allowances JSONB NOT NULL,  -- Record<EngineName, EngineAllowance>
  alert_warn_percent INTEGER DEFAULT 80,
  alert_throttle_percent INTEGER DEFAULT 95,
  alert_block_percent INTEGER DEFAULT 100,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Real-time usage ledger (append-only)
CREATE TABLE engine_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  engine_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  correlation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_usage_ledger_client_period
  ON engine_usage_ledger(client_id, created_at);
CREATE INDEX idx_usage_ledger_engine
  ON engine_usage_ledger(engine_name, created_at);

-- Engine swap table
CREATE TABLE engine_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_engine TEXT NOT NULL,
  target_engine TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_by TEXT NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Governor AI decision log
CREATE TABLE governor_ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  decision_type TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence NUMERIC(3,2),
  applied BOOLEAN DEFAULT false,
  approved_by TEXT,
  affected_clients JSONB DEFAULT '[]',
  affected_engines JSONB DEFAULT '[]',
  before_state JSONB,
  after_state JSONB,
  revertible BOOLEAN DEFAULT true,
  reverted BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Super admin overrides
CREATE TABLE governor_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  override_type TEXT NOT NULL,
  created_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  target_client_id UUID,
  target_engine TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.2 Modified Existing Tables

```sql
-- Add to existing engine_toggles table
ALTER TABLE engine_toggles
  ADD COLUMN custom_max_operations INTEGER,
  ADD COLUMN custom_max_cost_usd NUMERIC(10,4),
  ADD COLUMN priority_level INTEGER DEFAULT 0,
  ADD COLUMN automation_level_override INTEGER;
```

---

## 9. Integration Map & Task Breakdown

### 9.1 Integration Points (Where Governor Connects)

| Integration | Direction | Description |
|---|---|---|
| **API Routes** → Governor | Inbound | All `/api/engine/*` and `/api/dashboard/*` routes call `governor.execute()` |
| Governor → **EngineRegistry** | Outbound | Governor uses registry to get engine instances |
| Governor → **EventBus** | Outbound | Governor emits usage, alert, and decision events |
| **Stripe Webhooks** → Governor | Inbound | Subscription changes trigger envelope creation/update |
| Governor → **Supabase** | Outbound | Reads/writes envelopes, ledger, swaps, decisions |
| Governor → **Admin Dashboard** | Outbound | REST API for dashboard panels (usage, costs, controls) |
| Governor → **Client Dashboard** | Outbound | Usage summary, quota warnings, upgrade CTAs |
| **BullMQ Workers** → Governor | Inbound | Background jobs call Governor instead of engines directly |
| Governor → **Claude AI** | Outbound | AI analysis runs (Haiku) for L1/L2/L3 decisions |

### 9.2 Files to Create

| File | Purpose |
|---|---|
| `src/lib/engines/governor/types.ts` | Governor interfaces (CostManifest, BudgetEnvelope, etc.) |
| `src/lib/engines/governor/gate.ts` | GovernorGate class |
| `src/lib/engines/governor/dispatch.ts` | GovernorDispatch class |
| `src/lib/engines/governor/meter.ts` | GovernorMeter class |
| `src/lib/engines/governor/governor.ts` | EngineGovernor singleton (orchestrates gate/dispatch/meter) |
| `src/lib/engines/governor/ai-optimizer.ts` | AI decision pipeline (L1/L2/L3) |
| `src/lib/engines/governor/index.ts` | Barrel export |
| `src/app/api/admin/governor/route.ts` | Admin API — fleet overview, controls |
| `src/app/api/admin/governor/swaps/route.ts` | Admin API — engine swap CRUD |
| `src/app/api/admin/governor/overrides/route.ts` | Admin API — super admin overrides |
| `src/app/api/admin/governor/decisions/route.ts` | Admin API — AI decision feed |
| `src/app/api/dashboard/usage/route.ts` | Client API — usage summary |
| `supabase/migrations/0XX_engine_governor.sql` | All new tables from Section 8 |

### 9.3 Files to Modify

| File | Change |
|---|---|
| `src/lib/engines/types.ts` | Add `costManifest` to Engine interface |
| `src/lib/engines/registry.ts` | Wire Governor as middleware around dispatch |
| `src/lib/stripe.ts` | Add tier→envelope template mapping |
| `src/app/api/webhooks/stripe/route.ts` | Trigger envelope creation/update on subscription events |
| `src/middleware.ts` | Replace basic rate limiter with Governor-aware gating |
| All 24 engine files | Add `costManifest` property to each engine |
| `src/app/api/engine/*/route.ts` | Route through Governor instead of direct engine calls |

### 9.4 Implementation Task Breakdown (Atomic)

**Phase 1: Foundation (12 tasks)**

| # | Task | Files | Size |
|---|---|---|---|
| G-001 | Define Governor type interfaces | `governor/types.ts` | S |
| G-002 | Add `costManifest` to Engine interface | `engines/types.ts` | S |
| G-003 | Create DB migration for all Governor tables | `migrations/0XX_...sql` | M |
| G-004 | Build GovernorGate class | `governor/gate.ts` | M |
| G-005 | Build GovernorDispatch class | `governor/dispatch.ts` | M |
| G-006 | Build GovernorMeter class | `governor/meter.ts` | M |
| G-007 | Build EngineGovernor singleton | `governor/governor.ts` | M |
| G-008 | Build barrel export | `governor/index.ts` | S |
| G-009 | Add cost manifests to engines 1-8 | 8 engine files | M |
| G-010 | Add cost manifests to engines 9-16 | 8 engine files | M |
| G-011 | Add cost manifests to engines 17-24 | 8 engine files | M |
| G-012 | Seed plan_engine_allowances from PRICING_TIERS | Migration + stripe.ts | S |

**Phase 2: Wiring (8 tasks)**

| # | Task | Files | Size |
|---|---|---|---|
| G-013 | Wire Stripe webhooks → envelope creation | `webhooks/stripe/route.ts` | M |
| G-014 | Replace direct engine calls with Governor in API routes (batch 1) | 4 route files | M |
| G-015 | Replace direct engine calls with Governor in API routes (batch 2) | 4 route files | M |
| G-016 | Replace direct engine calls with Governor in API routes (batch 3) | 4 route files | M |
| G-017 | Wire BullMQ workers through Governor | 3 worker files | M |
| G-018 | Update middleware rate limiter to use Governor | `middleware.ts` | S |
| G-019 | Add Governor health to system health endpoint | `api/health/route.ts` | S |
| G-020 | Wire EventBus → Governor event emissions | `governor/governor.ts` | S |

**Phase 3: Admin Dashboard (8 tasks)**

| # | Task | Files | Size |
|---|---|---|---|
| G-021 | Build Governor fleet overview API | `api/admin/governor/route.ts` | M |
| G-022 | Build engine swap CRUD API | `api/admin/governor/swaps/route.ts` | M |
| G-023 | Build super admin override API | `api/admin/governor/overrides/route.ts` | M |
| G-024 | Build AI decisions feed API | `api/admin/governor/decisions/route.ts` | M |
| G-025 | Build client usage summary API | `api/dashboard/usage/route.ts` | S |
| G-026 | Build Governor dashboard page (fleet overview) | `app/admin/governor/page.tsx` | L |
| G-027 | Build engine swap UI component | `components/governor/EngineSwapManager.tsx` | M |
| G-028 | Build client budget overview UI | `components/governor/ClientBudgetPanel.tsx` | M |

**Phase 4: AI Automation (5 tasks)**

| # | Task | Files | Size |
|---|---|---|---|
| G-029 | Build AI optimizer core | `governor/ai-optimizer.ts` | L |
| G-030 | Implement L1 advisory mode (suggest to admin) | `ai-optimizer.ts` | M |
| G-031 | Implement L2 assisted mode (auto + digest) | `ai-optimizer.ts` | M |
| G-032 | Implement L3 autonomous mode | `ai-optimizer.ts` | M |
| G-033 | Build AI decision approval UI | `components/governor/AIDecisionFeed.tsx` | M |

**Phase 5: Testing (4 tasks)**

| # | Task | Files | Size |
|---|---|---|---|
| G-034 | Unit tests: Gate, Dispatch, Meter | `__tests__/governor/` | M |
| G-035 | Integration tests: full Governor pipeline | `__tests__/governor/` | M |
| G-036 | Integration tests: Stripe → Envelope lifecycle | `__tests__/governor/` | M |
| G-037 | Integration tests: AI optimizer decisions | `__tests__/governor/` | M |

**Total: 37 atomic tasks across 5 phases**

---

## End of Document

> This architecture document is the single source of truth for the Engine
> Governor subsystem. Implementation follows the V9 micro-batch pattern:
> ≤3 files per batch, commit after each, trace every action.
>
> Next step: Begin Phase 1, Task G-001 — Define Governor type interfaces.
