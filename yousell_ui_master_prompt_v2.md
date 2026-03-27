# YOUSELL.ONLINE — UI/UX MASTER BUILD PROMPT
## For Claude Code — 2026 Edition
### Research-Backed | AI-Native | Production-Grade

---

## 0. MISSION BRIEF

You are an elite product design engineer with the combined expertise of a Head of Product, Principal UX Architect, and Senior Frontend Engineer. Your task is to build the complete UI/UX system for **yousell.online** — an AI-native ecommerce intelligence SaaS platform.

**The standard**: Every screen must pass the "Triple Whale bar" — and then surpass it. Triple Whale's Founders Dash is loved because it was built by ecommerce founders, making complex data genuinely readable. Yousell must achieve this AND layer on an AI intelligence experience that Triple Whale's Moby only partially delivers. Your output must be the most advanced ecommerce intelligence UI in market by Q4 2026.

**Context you must internalise before writing a single line of code:**
- **Project**: yousell.online — ecommerce product intelligence across TikTok, Amazon, Shopify
- **Stack**: Next.js (TypeScript), Supabase, shadcn/ui, Tailwind CSS v4, Netlify
- **Existing infrastructure**: 25 AI engines, 14 discovery providers, Redis EventBus, structured logging, circuit breakers, monitoring, alerting all production-complete
- **Starting point**: All infrastructure is done. This is UI/dashboard work only.
- **AI layer**: The platform has a Claude-powered RAG search, recommendation engine, dynamic pricing engine, demand forecasting, NLP chatbot, and competitor monitoring (per the Aalpha AI Intelligence research)
- **Users**: Two surfaces — `admin.yousell.online` (internal ops) and `yousell.online` (merchant-facing SaaS)
- **Competitors to beat**: Triple Whale, FastMoss, JungleScout, PPSPY, Minea

---

## 1. DESIGN PHILOSOPHY — "Obsidian Intelligence"

### 1.1 Core Philosophy
The design language is called **Obsidian Intelligence**. The governing principle: *data should feel like intelligence, not spreadsheets.* Every screen must move the user from confusion → clarity → action in the fewest steps possible.

Inspired by:
- **Linear** — whitespace as a functional tool, not decoration; progressive complexity
- **Vercel** — data precision, zero noise, developer confidence signals
- **Stripe** — typographic hierarchy doing heavy lifting, subtle depth over flat
- **Notion** — flexible canvas, user-owned workflows
- **Triple Whale** — founder-operator UX: everything a merchant needs visible, nothing they don't

**What we evolve beyond these references:**
- Linear: we need data density they don't
- Vercel: we need warmth and non-technical users
- Stripe: we need real-time AI inference displays
- Triple Whale: we need platform-agnostic data (not Shopify-only) and deeper AI explainability

### 1.2 The AI-Native UI Mandate (2026 Research-Backed)

Based on current research, the 10 AI-native UI patterns that must be implemented:

1. **Streaming text displays** — AI insights appear word-by-word, not as a block. Users perceive this as the system "thinking", increasing trust.
2. **Confidence indicators** — Every AI recommendation shows a confidence signal (subtle colour-coded border: green ≥85%, amber 60–84%, no indicator <60%). Never show percentage numbers — use colour only.
3. **Ambient intelligence** — The UI adapts based on usage patterns without asking. A sales user's dashboard auto-prioritises revenue widgets; a procurement user sees stock widgets first. Changes are visible, reversible, with a one-click "Reset to default" option.
4. **Generative UI components** — AI-generated content areas that render contextually (daily briefing, insight cards, anomaly alerts) rather than static widgets.
5. **Agent task visibility** — When AI agents are running background tasks (scraping, forecasting, embedding), show a non-intrusive live activity rail. Users should know the system is working.
6. **Narrative dashboards** — Instead of widgets only, dashboard surfaces synthesised natural-language insights: *"Jabra headset demand is trending +34% ahead of the usual Q4 spike. 3 competitors raised prices this week."* Data becomes a story, not a spreadsheet.
7. **Progressive disclosure** — New users see a clean minimal canvas. Power features surface contextually as the user demonstrates readiness. Never overwhelm on first login.
8. **Skeleton → shimmer → real data** — All async data loads via shimmer skeletons (not spinners). Loading states are informative, not void.
9. **Command bar (CMD+K)** — Global AI-aware command palette that accepts natural language: *"Show me Jabra products trending this week"* returns a filtered product view, not a search results page.
10. **Explainability chips** — AI recommendations always include a "Why?" microinteraction — a small expandable chip that surfaces the 2–3 data signals that drove the suggestion.

---

## 2. DESIGN SYSTEM FOUNDATION

### 2.1 Design Tokens (CSS Variables — globals.css)

```css
/* ─── PALETTE ─── */
:root {
  /* Brand */
  --color-brand-900: #0A0E1A;      /* Near-black background */
  --color-brand-800: #0F1629;      /* Card backgrounds dark */
  --color-brand-700: #141D36;      /* Elevated surfaces */
  --color-brand-600: #1E2D52;      /* Border / divider */
  --color-brand-500: #2E4580;      /* Mid accent */
  --color-brand-400: #3D5FA8;      /* Primary interactive */
  --color-brand-300: #5B7ECC;      /* Hover state */
  --color-brand-200: #A3B8E8;      /* Subtle text */
  --color-brand-100: #D4DFFB;      /* Very light */
  --color-brand-050: #EEF2FF;      /* Light mode bg */

  /* Semantic */
  --color-success: #10B981;        /* Emerald — positive trends */
  --color-success-dim: #065F46;    /* Success on dark bg */
  --color-warning: #F59E0B;        /* Amber — medium confidence */
  --color-warning-dim: #78350F;
  --color-danger:  #EF4444;        /* Red — alerts, errors */
  --color-danger-dim: #7F1D1D;
  --color-neutral: #6B7280;        /* Inactive states */

  /* AI-specific */
  --color-ai-glow: #6366F1;        /* Indigo — AI-generated content aura */
  --color-ai-pulse: #818CF8;       /* Animated AI activity */
  --color-ai-insight: #A78BFA;     /* Violet — insight highlights */

  /* Data viz palette (8-colour accessible) */
  --chart-1: #3B82F6;   /* Blue */
  --chart-2: #10B981;   /* Emerald */
  --chart-3: #F59E0B;   /* Amber */
  --chart-4: #8B5CF6;   /* Violet */
  --chart-5: #EC4899;   /* Pink */
  --chart-6: #14B8A6;   /* Teal */
  --chart-7: #F97316;   /* Orange */
  --chart-8: #6B7280;   /* Grey */

  /* Surfaces */
  --surface-base: var(--color-brand-900);
  --surface-card: var(--color-brand-800);
  --surface-elevated: var(--color-brand-700);
  --surface-border: var(--color-brand-600);
  --surface-glass: rgba(20, 29, 54, 0.7);  /* Glassmorphism surface */

  /* Typography */
  --font-display: 'Cal Sans', 'DM Sans', sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Sizing — 8pt grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3);
  --shadow-elevated: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
  --shadow-ai-glow: 0 0 0 1px rgba(99,102,241,0.3), 0 4px 24px rgba(99,102,241,0.15);
  --shadow-focus: 0 0 0 3px rgba(59,130,246,0.5);
}

.light {
  --surface-base: #F8FAFC;
  --surface-card: #FFFFFF;
  --surface-elevated: #F1F5F9;
  --surface-border: #E2E8F0;
  --surface-glass: rgba(255,255,255,0.7);
  --color-brand-900: #1E293B;
}
```

### 2.2 Typography System

```
Display: Cal Sans (headings, hero text, KPI numbers)
Body: DM Sans (all UI text, descriptions, labels)
Mono: JetBrains Mono (SKUs, IDs, code, data table values)

Scale:
--text-xs:   11px / 16px
--text-sm:   13px / 20px
--text-base: 15px / 24px
--text-lg:   17px / 26px
--text-xl:   20px / 30px
--text-2xl:  24px / 32px
--text-3xl:  30px / 38px
--text-4xl:  36px / 44px
--text-5xl:  48px / 56px  (hero/KPI)
--text-7xl:  72px / 80px  (marketing hero only)

Font weights: 400 (body), 500 (labels), 600 (subheadings), 700 (headings)
```

### 2.3 Motion System

```typescript
// Motion constants — use Motion library (formerly Framer Motion)
export const MOTION = {
  // Easing
  ease: {
    out:    [0.0, 0.0, 0.2, 1.0],   // Standard ease-out
    spring: { type: 'spring', damping: 25, stiffness: 300 },
    bounce: { type: 'spring', damping: 15, stiffness: 200 },
  },
  // Duration
  duration: {
    instant: 0.08,
    fast:    0.15,
    base:    0.25,
    slow:    0.4,
    reveal:  0.6,
  },
  // Stagger for list reveals
  stagger: { staggerChildren: 0.05, delayChildren: 0.1 },
};

// Standard entrance animation for all cards
export const cardEntrance = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: MOTION.ease.out },
};

// AI streaming text container
export const streamingText = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.05 }, // Per-character stagger applied in component
};
```

**Motion rules:**
- Page transitions: fade + slide (12px, 250ms ease-out)
- Data updates (charts, KPIs): smooth number roll animation using CountUp
- AI content generation: typewriter / streaming reveal, 30ms per character
- Hover states: 150ms, subtle scale (1.01), border highlight
- Loading: shimmer pulse, never spinning circles
- Background AI activity: pulsing dot in activity rail, never modal or blocking

### 2.4 Component Architecture

**Stack (exact):**
```
Next.js 16 (App Router, React 19, TypeScript 5)
Tailwind CSS v4
shadcn/ui (copy-paste model, full code ownership)
Radix UI primitives
Motion (Framer Motion v11+)
Recharts (charts) + Tremor (advanced dashboard charts)
TanStack Table v8 (data tables)
cmdk (command palette)
next-themes (dark/light mode)
Lucide React (icons)
Aceternity UI (bento grids, animated cards, shimmer effects)
```

---

## 3. GLOBAL LAYOUT SYSTEM

### 3.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR (48px fixed)                                       │
│  [Logo] [AI Activity Rail]  [CMD+K] [Notifs] [Profile]     │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  SIDEBAR │  MAIN CANVAS                                     │
│  (240px  │  (fluid, max-w-screen-2xl, px-6)                │
│  collap  │                                                  │
│  -sible  │  ┌──────────────────────────────────────┐       │
│  to 56px)│  │ PAGE HEADER                          │       │
│          │  │ [Breadcrumb] [Page title] [Actions]  │       │
│  Nav     │  └──────────────────────────────────────┘       │
│  groups: │                                                  │
│  ·Dashb  │  ┌──────────────────────────────────────┐       │
│  ·Prod   │  │ CONTENT AREA                         │       │
│  ·Intel  │  │ (grid system, responsive)             │       │
│  ·Engine │  └──────────────────────────────────────┘       │
│  ·Admin  │                                                  │
│          │  AI ASSISTANT RAIL (right edge, 320px,          │
│  ─────── │  collapsible, triggered by AI icon)              │
│  [Asst]  │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 3.2 Sidebar Navigation (admin.yousell.online)

```
yousell admin                          [collapse ←]

▸ OVERVIEW
  ○ Dashboard                          /
  ○ Daily Briefing ✨ AI              /briefing

▸ PRODUCT INTELLIGENCE
  ○ TikTok Discovery                  /tiktok
  ○ Amazon Intelligence               /amazon
  ○ Shopify Insights                  /shopify
  ○ Trend Radar ✨ AI                /trends
  ○ Product Detail                    /products/[id]

▸ ENGINES (25 active)
  ○ Scan Control Panel                /scan
  ○ Engine Status                     /engines
  ○ Discovery Providers (14)          /providers
  ○ Job Queue                         /jobs

▸ PRICING & INVENTORY
  ○ Pricing Intelligence ✨ AI        /pricing
  ○ Competitor Monitor                /competitors
  ○ Demand Forecast ✨ AI            /forecast
  ○ Restock Alerts                    /restock

▸ CUSTOMER INTELLIGENCE
  ○ Customer Segments                 /customers
  ○ Churn Risk ✨ AI                 /churn
  ○ LTV Analytics                     /ltv

▸ AUTOMATION
  ○ Orchestrator                      /orchestrator
  ○ Scheduled Jobs                    /schedule
  ○ Webhooks                          /webhooks

▸ SYSTEM
  ○ Health Monitor                    /health
  ○ Logs                              /logs
  ○ AI Cost Dashboard ✨              /ai-costs
  ○ Settings                          /settings

─────────────────────────────────────
● 3 engines running     [View status]
```

**Rules:**
- `✨` marks AI-powered pages — rendered with subtle indigo left-border on active state
- Group headers are non-clickable labels, 10px uppercase, tracking-wider
- Active item: left border (2px solid var(--color-brand-400)), bg-brand-800
- Collapsed state (56px): shows icons only, tooltip on hover
- Mobile: becomes a Sheet (shadcn) drawer triggered by hamburger

### 3.3 Top Bar

```
[≡] yousell·admin    [● 3 engines running ···]    [⌘K Search...]    [🔔 2] [👤]
```

**AI Activity Rail** (centre-left): shows live system activity non-intrusively
- Green dot + text: "Scraping TikTok (847 products found)"
- Amber dot: "Pricing model updating..."
- Blue dot: "Embedding 234 new products..."
- Clicking it opens a slide-out Activity Log panel
- Disappears after 3s of inactivity

### 3.4 CMD+K Command Palette

Built with `cmdk`. Accepts:
- Navigation: "go to pricing"
- Natural language AI queries: "show trending products this week"
- Actions: "run TikTok scan", "export to Excel", "trigger demand forecast"
- Search: product SKUs, customer names, supplier names

Groups in results:
1. **Actions** (CMD+K commands)
2. **AI Queries** (natural language → filtered view)
3. **Pages** (navigation)
4. **Products** (live search)
5. **Recent** (last 5 visited)

---

## 4. DASHBOARD PAGES — DETAILED SPECIFICATIONS

### 4.1 Main Dashboard (`/`)

**Layout: F-pattern with North Star metric top-left**

```
┌─────────────────────────────────────────────────────────────────┐
│  DAILY BRIEFING — AI generated, streaming reveal               │
│  ✨ "3 TikTok products spiked overnight. Jabra headsets are    │
│  outpacing forecast by 34%. 2 competitors raised prices."      │
│  [Expand] [Dismiss]                    08:14 UTC — just now    │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Products │  │  Scans   │  │  Alerts  │  │ AI Calls │
│  8,847   │  │  14/14   │  │    3 🔴  │  │ 2,341/d  │
│ +234 new │  │ all live │  │  1 🟡    │  │ £0.82    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

┌──────────────────────────────────┐  ┌───────────────────────────┐
│  TREND VELOCITY                  │  │  TOP OPPORTUNITIES ✨ AI  │
│  [Line chart — 7d product        │  │  1. AIRTAG WALLET CASE    │
│  discovery rate across platforms]│  │     +847% 7d, TikTok      │
│  Sparklines per platform         │  │     Confidence ████░ 92%  │
│  [TikTok ▲] [Amazon →] [Shopify▼]│  │  2. USB-C 240W CABLE     │
└──────────────────────────────────┘  │     +312%, Amazon+TikTok  │
                                      │     Confidence ███░░ 78%  │
┌──────────────────────────────────┐  │  3. FOLDABLE STAND       │
│  ENGINE STATUS                   │  │     +189%, Shopify         │
│  All 25 engines ████████████ 100%│  │     Confidence ██░░░ 61%  │
│  Last scan: 4m ago  [Details →]  │  └───────────────────────────┘
└──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  PLATFORM BREAKDOWN                                              │
│  [Bar chart — products discovered per platform, 30d]            │
│  TikTok ████████████ 4,221   Amazon ██████ 2,891   Shopify ████ │
└──────────────────────────────────────────────────────────────────┘
```

**AI Briefing component specs:**
- Streams into view on page load (typewriter, 30ms/char)
- Background: subtle gradient from var(--color-ai-glow) at 8% opacity
- Left border: 2px solid var(--color-ai-insight)
- "Expand" reveals 5–7 bullet insights
- Auto-refreshes at 09:00 UTC via pg_cron (from AI layer)

**KPI Cards:**
- Number: Cal Sans, 36px, bold
- Delta: DM Sans, 13px, color coded (green/red)
- Sparkline: 40px tall, no axes, trend only
- Hover: elevate card with shadow-elevated, show tooltip with last 7 data points

### 4.2 Product Intelligence Pages

**TikTok Discovery (`/tiktok`), Amazon Intelligence (`/amazon`), Shopify Insights (`/shopify`) all share a common layout:**

```
PAGE HEADER:
[← Back] TikTok Discovery    [Last scan: 4m ago ●]    [Run Scan] [Export]

FILTER BAR (sticky below header):
[Category ▾] [Trend ▾] [Price Range ▾] [Date Range ▾] [🔍 Search...]
[Active filters: Category: Electronics ✕]

AI INSIGHT BANNER (contextual, dismissable):
✨ "Wireless charging products are trending +218% on TikTok this week,
   driven by iPhone 16 Pro compatibility content."
[See related products →]

SPLIT VIEW:
┌────────────────────────────────┐  ┌──────────────────────────────┐
│ PRODUCT LIST                   │  │ SELECTED PRODUCT DETAIL      │
│ [DataTable with TanStack]      │  │ (right panel, 400px)          │
│                                │  │                               │
│ Col: Trend Score | Product     │  │ [Product image]               │
│      Price | Volume | Platform │  │ Product Name                  │
│      Change 7d | AI Score      │  │ Category | Source             │
│                                │  │                               │
│ [Row click → right panel]      │  │ INTELLIGENCE CHAIN:           │
│ [Bulk select → actions bar]    │  │ ① Trend data (platform)       │
│                                │  │ ② Supplier intelligence ✨    │
│                                │  │ ③ Pricing analysis ✨         │
│                                │  │ ④ Competitor landscape        │
│                                │  │ ⑤ Demand forecast ✨          │
│                                │  │ ⑥ Action recommendations ✨   │
│                                │  │                               │
│                                │  │ [Add to watchlist]            │
│                                │  │ [Generate description ✨]     │
│                                │  │ [Find suppliers ✨]           │
└────────────────────────────────┘  └──────────────────────────────┘
```

**Product Detail Panel (Intelligence Chain):**
The right panel renders the "Universal Product Intelligence Chain" from the platform spec. Each section loads with a shimmer skeleton before data arrives. AI-generated sections (③, ④, ⑤, ⑥) show the streaming reveal animation and the `✨` AI badge. Confidence indicators appear as coloured left-border on each AI section.

### 4.3 Scan Control Panel (`/scan`)

```
PAGE: SCAN CONTROL

┌─────────────────────────────────────────────────────────────────┐
│  GLOBAL STATUS                                                  │
│  ● 14 providers active   ● 3 scans running   ● 0 errors        │
└─────────────────────────────────────────────────────────────────┘

PROVIDER GRID (14 cards, 4-col responsive grid):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐
│ TikTok Shop  │  │ Amazon US    │  │ Shopify      │  │ Etsy      │
│ ● Running    │  │ ○ Idle       │  │ ● Running    │  │ ⚠ Slow   │
│ 847 found    │  │ Last: 2h ago │  │ 234 found    │  │ Rate limit│
│ [Pause] [→]  │  │ [Run] [→]    │  │ [Pause] [→]  │  │ [→]      │
└──────────────┘  └──────────────┘  └──────────────┘  └───────────┘

LIVE ACTIVITY LOG (last 50 events, auto-scroll):
[timestamp] [provider] [event] [count]
14:32:01   TikTok Shop  Products indexed  +847
14:31:58   Shopify      Category scanned  +234
14:31:44   Amazon US    Rate limit hit     —     [retry in 23s]
```

**Engine cards:**
- Green pulse dot = running
- Grey circle = idle
- Amber triangle = warning (rate limit, slowness)
- Red X = error (circuit breaker tripped)
- Card click → drawer with detailed engine metrics, logs, config

### 4.4 AI Cost Dashboard (`/ai-costs`)

**Purpose**: Full transparency on AI API spending per feature, per model, per day.

```
┌──────────────────────────────────────────────────────────────────┐
│  THIS MONTH'S AI SPEND                                          │
│  £142.87 used   of  £300.00 budget    [47.6%] ████████░░░░░░░░ │
│  Projected month-end: £284.00 (under budget ✓)                  │
└──────────────────────────────────────────────────────────────────┘

BREAKDOWN BY FEATURE (stacked bar, 30d):
Feature          Model       Calls    Tokens    Cost
─────────────────────────────────────────────────────
Semantic Search  Haiku       45,234   2.1M      £8.40
Daily Briefing   Sonnet      30       180K      £5.40
Recommendations  Haiku       12,441   890K      £3.56
Chat Support     Haiku/Son   4,221    1.2M      £6.80
Pricing Engine   Sonnet      1,443    920K      £27.60
Content Gen      Sonnet      892      340K      £10.20
─────────────────────────────────────────────────────
TOTAL                                            £62.96

COST PER QUERY TREND (line chart, 30d)
QUALITY SCORES (1-5, by feature, from user ratings)
```

### 4.5 Health Monitor (`/health`)

Inspired by Vercel's deployment status page. Shows:
- Deep health endpoints for all services (Supabase, Railway, Redis, Netlify)
- Circuit breaker status per engine
- Alert history (last 7 days)
- Uptime percentages with sparklines
- One-click incident creation

---

## 5. MERCHANT-FACING SAAS (yousell.online)

### 5.1 Marketing Website

**Design approach**: High-conversion SaaS homepage, borrowing Triple Whale's founder-first tone but with a more visually ambitious treatment. Think "Linear meets Amplitude, built for ecommerce operators".

**Hero Section:**
```
HERO:
[Gradient mesh background — deep navy → indigo, with subtle animated particles]

BADGE: "✨ Now with AI Trend Agents — 14 platform intelligence providers"

H1: "The Intelligence Layer
     for Modern Ecommerce"
     [Cal Sans, 72px, white, tight leading]

P: "Discover winning products before your competitors.
    Across TikTok, Amazon, and Shopify. Powered by 25 AI engines."
   [DM Sans, 20px, brand-200]

[Get Started Free]  [See Live Demo →]
[No credit card · 5 min setup · Cancel anytime]

BELOW FOLD HINT:
[Product screenshot / animated dashboard mockup, floating, subtle depth]
[Trusted by 60,000+ ecommerce operators] ← social proof bar
```

**Social Proof Bar:**
Animated scroll of brand logos. Not generic — use real ecommerce tool logos that yousell integrates with (Shopify, TikTok, Amazon, Alibaba).

**Feature Bento Grid (Section 2):**
Using Aceternity UI bento grid. 6 cells of varying sizes:

```
┌─────────────────────┬──────────┬──────────┐
│                     │  REAL-   │  25 AI   │
│  TREND RADAR        │  TIME    │  ENGINES │
│  Live product       │  ALERTS  │          │
│  discovery viz      │          │  Always  │
│  [animated]         │  Price   │  working │
│                     │  drops,  │  for you │
│                     │  spikes  │          │
├──────────┬──────────┴──────────┤          │
│ COMPETITOR│  AI BRIEFINGS      │          │
│ MONITOR   │  Daily intelligence│          │
│ Track     │  in plain English  │          │
│ pricing   │  ✨                │          │
└──────────┴────────────────────┴──────────┘
```

**Pricing Page (surpassing Triple Whale):**

Triple Whale's pricing weakness: GMV-based pricing is opaque and intimidating. Yousell fixes this with transparent, value-anchored tiers.

```
PRICING HEADER:
"Simple pricing. Powerful intelligence."
[Toggle: Monthly / Annual (save 20%)]

TIER COMPARISON (3 cards, "Pro" highlighted with glow border):

┌─────────────┐  ┌─────────────────────────┐  ┌─────────────┐
│  STARTER    │  │  PRO              ★ Best│  │  AGENCY     │
│  £49/mo     │  │  £149/mo               │  │  £499/mo    │
│             │  │                        │  │             │
│ 3 platforms │  │  All 14 platforms      │  │  Unlimited  │
│ 5K products │  │  50K products          │  │  products   │
│ Basic scan  │  │  Daily AI briefings    │  │  White label│
│ 7d history  │  │  Trend forecasting     │  │  API access │
│             │  │  Pricing intelligence  │  │  Dedicated  │
│             │  │  Demand forecasting    │  │  support    │
│             │  │  AI chat assistant     │  │             │
│ [Start free]│  │  [Start 14-day trial] │  │  [Contact]  │
└─────────────┘  └─────────────────────────┘  └─────────────┘

BELOW: Feature comparison table (expandable sections per category)
BELOW: FAQ (10 most common objections answered)
BELOW: "Trusted by 60,000+ ecommerce operators" + social proof
```

**Pricing page innovations over Triple Whale:**
1. No GMV-based confusion — flat tiers with clear limits
2. Interactive ROI calculator: "If you find 1 winning product per month worth £500 margin, this pays for itself in 3 days."
3. Feature tier highlights on hover — hovering a feature shows which plans include it
4. Free forever Founders tier (like Triple Whale's Founders Dash) — creates acquisition flywheel

### 5.2 Merchant Dashboard (logged-in, yousell.online/app)

Simplified version of the admin dashboard. Key difference: merchant-facing, not operator-facing.

```
MERCHANT DASHBOARD NAVIGATION:
○ Overview
○ Trending Products
○ Watchlist (saved products)
○ Alerts
○ AI Assistant ✨
○ Settings / Billing
```

**Merchant-specific AI Assistant panel:**
A persistent right-rail AI chat that knows the merchant's watchlist and subscription tier. Built with the Claude RAG chatbot from the AI layer. Merchants can ask:
- "What's trending in electronics this week?"
- "Find me products under £20 that went viral in the last 3 days"
- "Compare these 3 products for margin potential"
- "Alert me when anything in my watchlist changes price by more than 10%"

---

## 6. COMPONENT LIBRARY — IMPLEMENTATION SPECS

### 6.1 AI Insight Card

```tsx
// AIInsightCard.tsx
// Used wherever AI-generated content appears

interface AIInsightCardProps {
  content: string;
  confidence?: 'high' | 'medium' | 'low'; // maps to green/amber/none
  source?: string;
  isStreaming?: boolean;
  onExplain?: () => void;
}

// Design:
// - Left border: 2px solid (var(--color-ai-insight))
// - Background: var(--color-brand-800) with 4% indigo tint
// - AI badge: ✨ icon + "AI" text, 11px, indigo
// - Confidence: coloured right-border only (NOT text percentage)
// - "Why?" expand chip at bottom right
// - Streaming: typewriter reveal via Motion staggerChildren
```

### 6.2 Metric Card (KPI)

```tsx
// MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: { value: number; label: string }; // e.g. { value: 23.4, label: "vs last week" }
  sparklineData?: number[];
  status?: 'normal' | 'warning' | 'critical';
  isLoading?: boolean;
}

// Design:
// - Shimmer skeleton when isLoading
// - Value: Cal Sans, 36px
// - Delta: colour-coded pill (green up arrow / red down arrow)
// - Sparkline: 40px, no axes, 100% width
// - Hover: shadow-elevated + scale(1.01)
```

### 6.3 Product Row (TanStack Table)

```
Columns:
[checkbox] [trend score — donut sparkline] [image 40px] [title] 
[platform badge] [price] [7d change — coloured %] [AI score badge] [actions ···]

AI Score badge: 
- 90-100: emerald pill "🔥 Hot"
- 70-89:  blue pill "📈 Rising"  
- 50-69:  amber pill "→ Stable"
- <50:    grey pill "↓ Cooling"

Confidence indicator:
- Left border colour on each row based on AI score confidence
```

### 6.4 Engine Status Card

```
┌─────────────────────────┐
│ [platform icon]  TikTok │  ← Cal Sans 15px
│ ● Running               │  ← coloured status dot
│ 847 products found      │  ← DM Mono 13px
│ ████████░░ 80% complete │  ← progress bar
│ Rate limit: OK          │  ← status text
│ [Pause] [Config]        │  ← action buttons
└─────────────────────────┘
```

### 6.5 Streaming Text Component

```tsx
// StreamingText.tsx — renders AI-generated content word by word
// Uses requestAnimationFrame or setInterval at 30ms/character
// Shows a blinking cursor while streaming
// Confidence border fades in after streaming completes
// "Copy" button appears after streaming completes
```

### 6.6 Global Command Palette (CMD+K)

```
[⌘K] Search or ask anything...

─ AI QUERIES ─────────────────────────────────
✨ "Show trending products this week"
✨ "Find competitors with lower prices"
✨ "What's the demand forecast for JBL?"

─ RECENT ─────────────────────────────────────
↩ TikTok Discovery
↩ SKU JABRA-EVOLVE2-85

─ ACTIONS ────────────────────────────────────
▶ Run TikTok scan
▶ Export current view to Excel
▶ Generate daily briefing now
▶ Check all engine health

─ NAVIGATION ─────────────────────────────────
→ Pricing Intelligence
→ Demand Forecast
→ AI Cost Dashboard
```

---

## 7. ALL UI STATES — COMPLETE SPECIFICATION

For every interactive component, implement ALL states:

```
State         Visual Treatment
──────────────────────────────────────────────────────────────────
Default       Standard styles as defined
Hover         150ms transition, scale(1.01) on cards, border highlight
Active/Focus  3px focus ring (var(--shadow-focus)), no outline:none
Disabled      opacity-40, cursor-not-allowed, pointer-events-none
Loading       Shimmer skeleton animation (not spinner)
              shimmer: background gradient moving left→right
              Pulse: opacity 0.6→1 cycle, 1.5s
Error         Red border, error icon, helpful error message below
Empty         Illustrated empty state with action CTA
              "No products found. Try adjusting your filters." + button
Success       Green check animation (150ms), message auto-dismisses 3s
AI Running    Pulsing indigo border, streaming cursor blink
AI Complete   Confidence border fades in, "Why?" chip appears
```

**Empty States — specific designs:**
- No products found: simple search icon, message, "Adjust filters" button
- First login (no data yet): onboarding checklist, "Run your first scan" CTA
- Engine offline: red icon, "Engine offline — [Restart]" button
- No alerts: green checkmark, "All clear — nothing needs attention"
- No AI briefing: "Briefing generates at 09:00 UTC. Next in 4h 23m."

---

## 8. ACCESSIBILITY REQUIREMENTS

All components MUST meet WCAG 2.1 AA (target AAA where possible):

```
Colour contrast:
- Body text on backgrounds: minimum 4.5:1
- Large text (>18px bold): minimum 3:1
- UI components (borders, icons): minimum 3:1
- Do NOT rely on colour alone for status (use icons + colour)

Keyboard navigation:
- Every interactive element reachable via Tab
- Logical tab order following visual reading order
- CMD+K command palette keyboard-only operable
- Data tables: arrow key navigation between cells
- Sidebar: keyboard-collapsible
- Modals: focus trap while open, return focus on close

ARIA:
- All icon buttons: aria-label
- Dynamic content: aria-live="polite" for AI streaming updates
- Loading states: aria-busy="true"
- Charts: aria-label with data summary, role="img"
- Status indicators: aria-describedby pointing to status text

Focus states:
- Visible focus ring on ALL interactive elements
- Never suppress :focus-visible
- Focus ring: 3px, var(--shadow-focus)
```

---

## 9. RESPONSIVE STRATEGY

```
Breakpoints (Tailwind v4):
xs:  < 480px   (mobile portrait)
sm:  480–640px (mobile landscape)
md:  640–768px (tablet portrait)
lg:  768–1024px (tablet landscape / small laptop)
xl:  1024–1280px (laptop)
2xl: 1280–1536px (desktop)
3xl: > 1536px  (wide desktop)

Admin dashboard:
- 2xl+: Full layout (sidebar + content + AI rail)
- xl:   Collapsed sidebar (icon-only), no AI rail
- lg:   Sidebar as overlay Sheet
- < lg: Mobile — bottom nav bar (5 items), content full-width

Mobile admin (tablet/phone):
- Priority: engine status, alerts, top opportunities
- Deprioritise: logs, detailed config, AI cost dashboard
- Bottom navigation: Dashboard | Products | Scan | Alerts | More

Marketing site:
- Mobile-first: hero stacks vertically, pricing cards stack, bento tiles collapse to single column
- Feature tables: horizontal scroll on mobile
```

---

## 10. PERFORMANCE REQUIREMENTS

```
Core Web Vitals targets:
- LCP: < 1.5s (Largest Contentful Paint)
- CLS: < 0.05 (Cumulative Layout Shift)
- INP: < 100ms (Interaction to Next Paint)

Techniques to achieve this:
- React Server Components by default for all static/fetched content
- Client components only for: charts, sidebar toggle, theme switch, CMD+K
- Streaming server rendering for AI insight sections (Suspense boundaries)
- Recharts/Tremor loaded with dynamic import (code-split)
- All product images: next/image with blur placeholder
- TanStack Table: virtual rows for 10,000+ product lists
- Skeleton loading prevents CLS (reserve exact height before data loads)
- No layout shift on AI content streaming (pre-reserve container height)
- Tailwind v4: zero-runtime CSS, purged automatically
```

---

## 11. DARK/LIGHT MODE STRATEGY

```
Default: Dark mode (Obsidian Intelligence theme)
Toggle: Top-right corner, persisted in localStorage via next-themes

Dark mode rationale:
- Intelligence platforms used in high-focus, data-dense contexts
- Reduces eye strain for power users monitoring dashboards
- AI insight glow effects are more impactful on dark backgrounds
- Aligns with Linear, Vercel, Terminal aesthetic

Light mode:
- Fully supported — every colour token has a light variant
- Marketing homepage: defaults to light (higher conversion for first-time visitors)
- Merchant dashboard: user-toggled preference

Implementation:
- CSS variables switch via .dark class on <html>
- No hardcoded colour values anywhere — all var(--) tokens
- Tailwind dark: prefix only for exceptions, not standard patterns
```

---

## 12. EXECUTION ORDER FOR CLAUDE CODE

Execute in this exact sequence. Do NOT skip phases.

### PHASE 0 — Foundation (Complete first, no UI yet)
1. Install and configure all dependencies (see Section 2.4 exact stack)
2. Set up globals.css with all design tokens from Section 2.1
3. Configure next-themes for dark/light mode
4. Set up Tailwind v4 config with custom tokens
5. Install fonts (Cal Sans via @fontsource, DM Sans, JetBrains Mono)
6. Create base layout files: root layout, admin layout, app layout

### PHASE 1 — Core Layout System
7. Build Top Bar component (with AI Activity Rail placeholder)
8. Build Sidebar component (collapsible, all nav items, active states)
9. Build CMD+K command palette (cmdk, all groups, keyboard nav)
10. Wire layout together with responsive breakpoints

### PHASE 2 — Design System Components
11. MetricCard (all states, sparklines, shimmer loading)
12. AIInsightCard (streaming, confidence, "Why?" chip)
13. StreamingText component
14. DataTable base (TanStack, sorting, filtering, pagination, bulk select)
15. Product Row specialisation
16. Engine Status Card
17. Chart components (line, bar, donut) using Recharts + Tremor tokens
18. Empty state components (all 6 variants)
19. All form components with full state coverage

### PHASE 3 — Admin Dashboard Pages
20. Main Dashboard (`/`) — briefing, KPIs, trend velocity, opportunities
21. TikTok Discovery (`/tiktok`) — filter bar, split view, detail panel
22. Amazon Intelligence (`/amazon`)
23. Shopify Insights (`/shopify`)
24. Scan Control Panel (`/scan`) — engine grid, live log
25. Pricing Intelligence (`/pricing`)
26. Demand Forecast (`/forecast`)
27. AI Cost Dashboard (`/ai-costs`)
28. Health Monitor (`/health`)
29. System Logs (`/logs`)

### PHASE 4 — Marketing Website
30. Homepage (hero, social proof, bento feature grid, CTA sections)
31. Pricing page (3 tiers, feature table, ROI calculator, FAQ)
32. Integration page
33. Demo/onboarding flow

### PHASE 5 — Merchant Dashboard
34. Merchant overview
35. Trending products view
36. Watchlist
37. AI Assistant panel (chat UI)
38. Settings / Billing

### PHASE 6 — Polish & Optimisation
39. Framer Motion page transitions
40. All hover/active/focus states audit
41. Accessibility audit (keyboard, ARIA, contrast)
42. Performance optimisation (code splitting, SSR, virtual lists)
43. Mobile responsiveness final pass

---

## 13. QUALITY GATES

Before considering any phase complete, verify:

```
Design Quality:
☐ No hardcoded colour values (all CSS variables)
☐ Every text element uses the typography scale
☐ 8pt grid adhered to throughout (no arbitrary pixel values)
☐ Dark mode works correctly for every component
☐ Hover/active/focus states present on every interactive element
☐ AI components have streaming animation + confidence indicators
☐ Empty states designed for every list/table component

Technical Quality:
☐ Zero TypeScript errors (strict mode)
☐ All async data has skeleton loading state
☐ No layout shift on content load (CLS < 0.05)
☐ TanStack Table virtualises rows for 10,000+ items
☐ CMD+K works keyboard-only
☐ All images use next/image

Accessibility:
☐ All interactive elements have aria-labels
☐ Keyboard navigation complete
☐ Colour contrast ≥ 4.5:1 for body text
☐ Focus rings visible on all focusable elements
☐ AI streaming content has aria-live="polite"
```

---

## 14. REFERENCE BENCHMARKS

Study these before building (do NOT copy):
- **Linear.app** — sidebar navigation, progressive disclosure, minimal chrome
- **Vercel dashboard** — data precision, deployment status patterns
- **Triple Whale** — ecommerce KPI layout, founder-operator UX
- **Stripe Dashboard** — typography hierarchy, trust signals
- **Notion** — flexible canvas, block-based content
- **Raycast** — command palette inspiration, keyboard-first UX
- **Resend** — developer-facing SaaS with premium design sensibility

**What to extract from Triple Whale specifically:**
- Founders Dash layout: the 4-KPI top row, then charts below — proven ecommerce pattern
- "From insight to action" CTA pattern on every data view
- Mobile app UX: simplified metrics, notification-driven
- Free-to-paid conversion funnel: free Founders tier → upsell on AI features

**Where to go beyond Triple Whale:**
- Platform breadth: 14 providers vs their Shopify-only
- AI explainability: confidence indicators + "Why?" chips they don't have
- Narrative insights: natural language briefings vs their chart-only approach
- Non-Shopify support: yousell works for any ecommerce seller

---

## 15. FINAL MANDATE

This is a billion-dollar SaaS UI. Every pixel must earn its place.

The user (ecommerce operator) is a smart, time-poor business person who has tried a dozen analytics tools and found them all either too complex or too shallow. Yousell must:

1. **Win in the first 30 seconds** — the dashboard must immediately communicate value before the user reads a single word
2. **Respect intelligence** — don't over-explain; show the data, let the design guide the eye
3. **Make AI feel earned, not gimmicky** — AI features are quieter and more confident than their competitors'. No blinking "AI POWERED" badges. Just intelligence, surfaced at the right moment.
4. **Build for operators, not analysts** — every insight must end in an action. No dead-end charts.
5. **Earn trust through precision** — numbers are exact, not rounded. Timestamps are specific. Sources are cited. The AI always shows why.

The result should make a user who opens the dashboard for the first time think: *"This is exactly what I've been looking for. This was built by someone who actually does what I do."*

That is the standard. Build to it.

---

# PART 2 — GAP CLOSURE
## Complete coverage of all remaining specs from the original prompt and Aalpha AI Intelligence research

---

## 16. STATE MANAGEMENT & SYSTEM ARCHITECTURE

### 16.1 State Management Approach (exact)

```
Global state:     Zustand (lightweight, no boilerplate, works with RSC)
Server state:     TanStack Query v5 (caching, background refetch, optimistic updates)
Form state:       React Hook Form + Zod (validation schemas)
URL state:        nuqs (type-safe search params — for filter bars, table state)
Theme:            next-themes
AI streaming:     Native React useState + ReadableStream

Rationale:
- Zustand replaces Redux for 90% of use cases with 1/10th the boilerplate
- TanStack Query handles all Supabase fetches with automatic background refresh
  (critical for engine status, live scan counts, alert polling)
- nuqs keeps filter/table state in the URL — users can share filtered views
- No Context API for shared data (performance — re-render scope issues at scale)
```

### 16.2 Data Fetching Patterns

```typescript
// Pattern 1: Server Component (default — use for all static/initial data)
// app/dashboard/page.tsx
async function DashboardPage() {
  const metrics = await getMetrics(); // Direct Supabase call, no client round-trip
  return <Dashboard initialData={metrics} />;
}

// Pattern 2: TanStack Query (for data that refreshes — engine status, scans)
const { data, isLoading } = useQuery({
  queryKey: ['engines'],
  queryFn: fetchEngineStatus,
  refetchInterval: 5000, // 5s live polling for engine status page
  staleTime: 2000,
});

// Pattern 3: Supabase Realtime subscription (for AI activity rail)
useEffect(() => {
  const channel = supabase
    .channel('ai_activity')
    .on('postgres_changes', { event: 'INSERT', table: 'ai_request_logs' }, 
        (payload) => updateActivityRail(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}, []);

// Pattern 4: Server-Sent Events (for AI streaming text)
// Supabase Edge Function streams Claude API response
// Client reads via ReadableStream, updates useState character by character
```

---

## 17. GESTURE & MOBILE INTERACTION SYSTEM

### 17.1 Mobile Gesture Specs

```
Swipe right on sidebar:     Open sidebar drawer (Sheet)
Swipe left on sidebar:      Close sidebar drawer
Pull to refresh:            Refresh current page data (react-native-style)
                            Implemented: touch start → track delta → release trigger
Long press on product row:  Enter multi-select mode (bulk actions)
Swipe left on table row:    Reveal quick-action buttons (archive, watchlist, alert)
Pinch on charts:            Zoom time range (touch-action: pan-y on chart container)
Double tap on KPI card:     Expand to full detail view

Implementation:
- Use @use-gesture/react for all gesture recognition
- Minimum swipe distance: 50px before triggering
- All gestures have haptic feedback triggers (navigator.vibrate where supported)
- Visual cue during gesture: card follows finger with Motion spring physics
```

### 17.2 Mobile-Specific Interactions

```
Bottom navigation bar (< lg breakpoint):
┌──────────────────────────────────────────────────────┐
│  🏠 Home    📦 Products    🔍 Scan    🔔 Alerts    ⋯ More  │
└──────────────────────────────────────────────────────┘
- Active: brand-400 icon + label below, subtle scale up
- Notification badge: red dot top-right of icon, max "9+"
- "More" → Sheet drawer with remaining nav items

Pull-to-refresh implementation:
- Threshold: 70px pull distance
- Visual: circular progress indicator follows pull distance
- Release: spinner while fetching, snap back on complete
- Resistance: 0.4 multiplier beyond threshold (feels physical)

Swipe-to-action on list rows:
- Left swipe reveals: [🔔 Alert] [★ Watch] [🗑 Dismiss]
- Action buttons slide in from right edge
- Full swipe (>80% of row width) = immediate primary action
- Partial swipe (<80%) = reveal buttons then snap back on release
```

---

## 18. MICRO-INTERACTION LIBRARY

### 18.1 Button States

```tsx
// All button variants must implement this exact state set:

// Primary button
<Button>
  Default:  bg-brand-400, text-white, shadow-sm
  Hover:    bg-brand-300 (150ms ease-out), scale(1.01), shadow-md
  Active:   bg-brand-500 (80ms), scale(0.99) — "pressed" feel
  Focus:    ring-2 ring-brand-400 ring-offset-2
  Disabled: opacity-40, cursor-not-allowed, no hover effects
  Loading:  Spinner replaces label (keep button same width — prevent layout shift)
            Use a fixed-width container: <span className="w-16 inline-flex justify-center">

// Destructive button (delete, archive)
  Default:  border border-red-800, text-red-400, bg-transparent
  Hover:    bg-red-950, text-red-300
  Active:   bg-red-900
  — Always requires confirmation dialog before destructive action executes

// Ghost / icon button
  Default:  transparent bg, icon-only or icon+label
  Hover:    bg-surface-elevated (bg-brand-700 dark / bg-slate-100 light)
  Active:   bg-surface-border
```

### 18.2 Toggle & Switch Micro-interactions

```
Toggle switch:
- Thumb: spring animation (damping 20, stiffness 300)
- Track: background transitions 200ms (green ↔ grey)
- ON state: thumb slides right + track fills with success colour
- Sound cue: optional (respect prefers-reduced-motion)

Checkbox:
- Check appears via path draw animation (SVG strokeDashoffset, 150ms)
- Box border: transitions brand-400 on check
- Indeterminate: horizontal line, amber colour

Radio:
- Inner dot scales from 0 to 1 (spring, 150ms)

Accordion / Collapsible:
- Height: animates via Motion layout (not max-height hack — avoids jank)
- Chevron: rotates 180° on open, spring physics
- Content fades in (opacity 0→1, 200ms) as height expands
```

### 18.3 Toast / Notification Feedback Patterns

```tsx
// Using shadcn Sonner (replaces shadcn Toast — better API)
// Positioned: top-right on desktop, bottom-center on mobile

// Types and visual treatment:
toast.success("Scan complete — 847 products indexed")
  → Green left border, checkmark icon, auto-dismiss 4s

toast.error("Engine offline: TikTok Discovery")
  → Red left border, X icon, [Retry] action button, persists until dismissed

toast.warning("API budget at 80% — £240 of £300 used")
  → Amber left border, warning icon, [View costs →] link

toast.info("Daily briefing ready")
  → Blue left border, ✨ icon, [Read now →] link

toast.loading("Running TikTok scan...")
  → Spinner, no auto-dismiss, replaced by success/error toast on completion

toast.promise(scanPromise, {
  loading: "Running scan...",
  success: (data) => `Found ${data.count} products`,
  error: "Scan failed — check engine logs",
})

// Toast rules:
// Max 3 toasts visible at once (stack, oldest dismisses first)
// Click anywhere on toast = dismiss
// Toasts slide in from top-right (desktop) / bottom (mobile)
// All share Motion entrance animation: y: -16 → 0, opacity 0 → 1, 250ms
```

---

## 19. BREADCRUMB & NAVIGATION SYSTEM

### 19.1 Breadcrumb Design

```
Placement: Below top bar, above page header — NOT inside the header

Visual treatment:
Home > Product Intelligence > TikTok Discovery > Product Detail

Rules:
- Max 4 levels shown; deeper paths collapse middle segments: Home > ... > Product Detail
- Current page (last item): text-foreground, no link
- Parent items: text-muted-foreground, underline on hover
- Separator: / character, text-border, padding 0 4px
- On mobile: show only parent + current (2 items max)
- Clickable items highlight on hover (150ms, text-foreground)

Implementation:
// Use Next.js usePathname() to auto-generate breadcrumbs
// Map path segments to human-readable labels via a routeLabels config object
// Dynamic segments (e.g. /products/[id]) resolve to product name via TanStack Query
```

### 19.2 Multi-Account / Multi-Store Context Switcher

```
Location: Top bar, left of AI Activity Rail
Trigger: Click → dropdown popover

Design:
[▾ YouSell Admin]  ← current context, 13px DM Sans

Popover content:
┌────────────────────────────────────┐
│  Switch workspace                  │
│                                    │
│  ● YouSell Admin       (current)   │
│  ○ Client: Acme Corp               │
│  ○ Client: TechDistro UK           │
│  ─────────────────────             │
│  + Add new workspace               │
└────────────────────────────────────┘

Rules:
- Current workspace: filled dot, bold label
- Each workspace: avatar (initials) + name + plan badge
- Switching workspace: full page reload (to reset all cached state)
- "Add new workspace" → modal with workspace name + plan selection
- Keyboard: arrow keys to navigate, Enter to select
- Plan badge: "Pro" (blue), "Agency" (purple), "Trial" (amber)
```

### 19.3 Smart Defaults & Predictive UI Behaviour

```
Implemented patterns:

1. Role-based default views
   On first login, user selects role (Sales / Procurement / Ops / Analytics)
   Dashboard widget order adapts to role:
   - Sales:        Opportunities → Revenue → Customer segments → Trends
   - Procurement:  Stock alerts → Demand forecast → Supplier scores → Pricing
   - Ops:          Engine health → Job queue → Error logs → Cost dashboard
   - Analytics:    Trend data → Platform breakdown → AI costs → A/B tests

2. Filter memory
   All filter bar states persist per-page in nuqs (URL) and localStorage
   Returning to /tiktok restores last used filters
   "Clear all filters" resets to page default, not blank

3. Predictive search
   CMD+K learns from usage: most-visited pages appear first
   Product search: shows recently viewed products before typing
   Time-of-day defaults: mornings show briefing + opportunities,
   afternoons show scan status + job queue

4. Progressive disclosure trigger logic
   New user (< 7 days, < 10 sessions):
   - Show onboarding tooltips on first visit to each page
   - Simple views: 3-column grid max, hidden advanced filters
   Power user (> 30 sessions, uses CMD+K, uses bulk actions):
   - Full density mode available
   - Advanced filter bar visible by default
   - Keyboard shortcut hints shown in tooltips
```

---

## 20. MISSING ADMIN DASHBOARD PAGES — FULL SPECS

### 20.1 User Management (`/settings/users`)

```
PAGE: USER MANAGEMENT

HEADER:
Team Members (12)                         [Invite member]

FILTER BAR:
[All roles ▾] [All status ▾] [Search members...]

TABLE:
┌──────────────────────────────────────────────────────────────────────┐
│ [✓] │ Avatar│ Name          │ Email           │ Role     │ Last seen │ Actions │
├─────┴───────┴───────────────┴─────────────────┴──────────┴───────────┴─────────┤
│ [ ] │  SA   │ Sahil A.      │ sahil@yousell   │ Admin    │ now       │  [···] │
│ [ ] │  JD   │ Jane Doe      │ jane@yousell    │ Analyst  │ 2h ago    │  [···] │
│ [ ] │  MK   │ Mark K.       │ mark@yousell    │ Viewer   │ 3d ago    │  [···] │
└─────────────────────────────────────────────────────────────────────────────────┘

Bulk actions bar (appears when rows selected):
[Change role ▾] [Remove from team] [Resend invite] — X members selected

Role badges:
Admin:    blue pill
Analyst:  purple pill
Viewer:   grey pill
Pending:  amber pill (invite sent, not accepted)

[···] row menu: Edit role | Reset password | Remove member | View activity

INVITE MODAL:
Email address _______________
Role [Analyst ▾]
[Send invite]
— Sends via Resend transactional email integration
```

### 20.2 Billing & Subscriptions (`/settings/billing`)

```
PAGE: BILLING & SUBSCRIPTIONS

CURRENT PLAN:
┌─────────────────────────────────────────────────────────┐
│  ★ PRO PLAN                              £149/month     │
│  Renews 1 May 2026 · Annual billing (saving £357/yr)    │
│  [Change plan] [Cancel subscription]                    │
└─────────────────────────────────────────────────────────┘

USAGE THIS PERIOD:
Products indexed:     38,241 / 50,000   [76%]  ████████░░
API calls:            2,341  / 10,000   [23%]  ██░░░░░░░░
AI queries:           891    / 2,000    [45%]  ████░░░░░░
Team members:         4      / 10       [40%]  ████░░░░░░

PAYMENT METHOD:
Visa ending 4242    Expires 09/27    [Update card]

INVOICE HISTORY:
Date          Amount    Status      PDF
─────────────────────────────────────────
1 Apr 2026    £149.00   Paid ✓      [↓]
1 Mar 2026    £149.00   Paid ✓      [↓]
1 Feb 2026    £149.00   Paid ✓      [↓]
[Load more...]

UPGRADE PROMPT (shown when usage > 80%):
⚠ "You've used 76% of your product index limit.
   Upgrade to Agency for unlimited indexing."  [Upgrade →]
```

### 20.3 Revenue & Attribution Tracking (Merchant Dashboard, `/app/revenue`)

```
PAGE: REVENUE & ATTRIBUTION

This page is for merchant-facing yousell.online subscribers.
Shows which discovered products converted to purchases.

HEADER KPIs (4-up):
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Revenue│ │ Attributed   │ │ AOV          │ │ Top Channel  │
│ £48,231      │ │ £31,842      │ │ £127.40      │ │ TikTok 64%   │
│ +12% vs LM   │ │ 66% of total │ │ +8% vs LM    │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

ATTRIBUTION CHART:
[Stacked area chart — 30d revenue by discovery source]
[TikTok] [Amazon] [Shopify] [Direct/Unknown]
— Click a segment to filter the product table below

PRODUCT PERFORMANCE TABLE:
Product | Discovered via | Date found | Orders | Revenue | ROAS | Trend
─────────────────────────────────────────────────────────────────────────
AirTag wallet case | TikTok | 14 Mar | 234 | £8,442 | 4.2x | ▲▲▲
USB-C 240W cable   | Amazon | 10 Mar |  89 | £1,602 | 2.1x | ▲▲
Foldable stand     | Shopify| 12 Mar |  45 | £1,215 | 1.8x | ▲

COHORT CHART:
[Retention cohort heatmap — week of first purchase vs % active each subsequent week]
Rows: acquisition cohort (week)
Cols: weeks since acquisition (0-12)
Cell colour: 0% = brand-700 (dark) → 100% = success green
```

### 20.4 Order Insights (`/app/orders`)

```
PAGE: ORDER INSIGHTS

FILTER BAR (sticky):
[Date range ▾] [Platform ▾] [Status ▾] [Search by SKU or order ID...]

SUMMARY ROW:
Total orders: 1,247  |  Pending: 23  |  Fulfilled: 1,198  |  Returned: 26

AI INSIGHT BANNER ✨:
"Return rate spiked to 8% on USB-C cables this week — 2x your usual rate.
 Common reason in reviews: 'not 240W compatible with all devices.'
 Suggest adding compatibility note to product listing."
[Update description ✨] [Dismiss]

ORDER TABLE (TanStack, sortable):
ID     | Date      | Customer    | Items | Total   | Status       | Source   |Actions
───────────────────────────────────────────────────────────────────────────────────────
#1247  | Today     | Acme Corp   | 3 SKU | £847.00 | ● Fulfilled  | Direct   | [→]
#1246  | Today     | TechDistro  | 1 SKU | £210.00 | ○ Pending    | Shopify  | [→]
#1245  | Yesterday | ABC Ltd     | 7 SKU | £2,140  | ✓ Fulfilled  | Amazon   | [→]

Status badges:
● Fulfilled:  green dot + text
○ Pending:    grey dot + text
⚠ At risk:   amber dot + text (delay detected)
✕ Returned:  red dot + text

Click row → Order detail drawer (right side):
- Line items with images
- Fulfillment timeline (placed → confirmed → shipped → delivered)
- AI anomaly flag (if any)
- Customer RFM segment
- [Generate return label] [Contact customer]
```

### 20.5 Fraud Detection Dashboard (`/settings/fraud`)

```
PAGE: FRAUD & ANOMALY DETECTION

STATUS BANNER:
● 0 orders flagged today   |   Last checked: 2 minutes ago

ANOMALY DETECTION RULES (configurable):
┌─────────────────────────────────────────────────────────────────────┐
│  Rule                          Threshold    Status    Last triggered│
├─────────────────────────────────────────────────────────────────────┤
│  Order value > 3σ from mean    Auto         ● Active  2d ago        │
│  New customer, high value      > £2,000     ● Active  5d ago        │
│  Multiple orders, same IP      > 5/hour     ● Active  Never         │
│  Shipping address mismatch     Any          ● Active  1h ago        │
│  Custom rule...                             ○ Off     —             │
└─────────────────────────────────────────────────────────────────────┘
[Add rule]

FLAGGED ORDERS (last 30 days):
Order   | Date    | Value    | Flag reason                    | Status
────────────────────────────────────────────────────────────────────────
#1198   | 18 Mar  | £4,200   | Value 4.8σ above customer mean | ✓ Cleared
#1156   | 12 Mar  | £8,900   | New customer, enterprise value | ✓ Cleared
#1102   | 5 Mar   | £1,200   | Address mismatch flagged       | ✕ Blocked

BOTPROTECTION STATUS:
Cloudflare Turnstile:  ● Active
Request fingerprint:   ● Active (tracked 2.3M sessions)
Anomaly model:         ● Running (Railway worker, updated daily)
```

### 20.6 A/B Test Manager (`/settings/experiments`)

```
PAGE: A/B TEST MANAGER

ACTIVE EXPERIMENTS (3):
┌───────────────────────────────────────────────────────────────────────┐
│  Recommendation algorithm variant                                     │
│  Variant A: CF-only (control)  |  Variant B: Hybrid CF+CBF            │
│  Traffic split: 50/50           Started: 14 Mar 2026                  │
│                                                                        │
│  Results so far (13 days):                                            │
│  Variant A:  CTR 3.2%  |  Add-to-watchlist 8.4%  |  n=4,211          │
│  Variant B:  CTR 4.1% ↑│  Add-to-watchlist 11.2%↑|  n=4,089          │
│                                                                        │
│  Statistical significance: 87% (target: 95%)                          │
│  [████████░░] Estimated days to significance: ~4 days                 │
│                                                                        │
│  [Pause] [Declare winner: Variant B] [View full results →]            │
└───────────────────────────────────────────────────────────────────────┘

CREATE EXPERIMENT MODAL:
Name: _______________
Feature: [Recommendations ▾]
Variant A (control): _______________
Variant B: _______________
Traffic split: [50 / 50 ▾]
Success metric: [CTR ▾]
Min sample size: auto-calculated from current traffic
[Launch experiment]
```

### 20.7 RFM Segmentation Dashboard (`/customers/segments`)

```
PAGE: CUSTOMER SEGMENTS

SEGMENT OVERVIEW (6 tiles, colour-coded):
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🏆 Champions │  │ 💚 Loyal     │  │ 🌱 Promising │
│  142 customers│  │ 318 customers│  │ 89 customers │
│  Avg LTV £8k │  │  Avg LTV £3k │  │  New + growing│
│  [View →]    │  │  [View →]    │  │  [View →]    │
└──────────────┘  └──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ⚠ At Risk   │  │ 💤 Hibernate │  │ 💀 Lost      │
│  67 customers│  │ 201 customers│  │ 155 customers│
│  Declining   │  │  >90d no buy │  │ >180d no buy │
│  [View →]    │  │  [View →]    │  │  [View →]    │
└──────────────┘  └──────────────┘  └──────────────┘

RFM SCATTER PLOT:
[3D-style 2D scatter: x=Frequency, y=Recency, bubble size=Monetary]
Coloured by segment (matches tile colours above)
Click a bubble → customer detail drawer

SEGMENT DETAIL (clicking "Champions" tile):
- List of 142 customers with RFM scores
- Avg order value, avg order frequency, days since last order
- AI recommended action ✨: "Send exclusive early-access email to new arrivals"
- [Export list] [Create email campaign]
```

### 20.8 Demand Forecast Page (`/forecast`)

```
PAGE: DEMAND FORECAST

HEADER:
AI Demand Forecast                     [Run forecast now]  [Export to Excel]
Last updated: Today 07:00 UTC · Model: Prophet v1.3

AI ACCURACY BADGE ✨:
Model accuracy (last 30 days): 84% (within ±15% of actual)
[████████░░] Confidence: High

FORECAST CHART (main):
[Line chart — 90-day forward projection per SKU category]
[Actual (solid line)] + [Forecast (dashed line)] + [Confidence band (shaded)]
[Horizontal "restock threshold" line per category]
Toggles: [7d] [30d] [90d]  |  [Category ▾]

RESTOCK RECOMMENDATIONS TABLE:
SKU           | Category    | Current | Days left | Forecast | Confidence | Action
──────────────────────────────────────────────────────────────────────────────────────
JABRA-EVO-85  | Headsets    | 43 units| 12 days   | +340 units| ████░  78% | [Order]
WD-SN770-1TB  | Storage     | 8 units | 4 days 🔴 | +120 units| █████  91% | [Order]
UBNT-USWITC   | Networking  | 102 u.  | 34 days   | +80 units | ███░░  61% | [Monitor]

Confidence colour coding:
≥ 85%: green progress bar
60-84%: amber progress bar
< 60%: grey progress bar (forecast shown but de-emphasised)

[Order] button:
→ Opens draft purchase order drawer
→ Pre-fills: supplier (from supplier performance model), qty (forecast demand)
→ Editable before submit
```

### 20.9 Supplier Performance Dashboard (`/suppliers`)

```
PAGE: SUPPLIER PERFORMANCE

SUPPLIER SCORECARD TABLE:
Supplier       | Category    | OTD%  | Lead time | Price var | Score | Tier
────────────────────────────────────────────────────────────────────────────────
Ingram Micro   | All         | 97%   | 2.1 days  | ±3%       | 94   | ⭐ Gold
Tech Data UK   | Networking  | 91%   | 3.4 days  | ±8%       | 78   | Silver
B-Stock        | ITAD        | 84%   | 5.2 days  | ±22%      | 61   | Bronze

Score breakdown:
OTD% (On-Time Delivery):          40% weight
Avg lead time:                     20% weight
Price variance (consistency):      20% weight
Stock availability rate:           20% weight

AI Recommendation ✨:
"B-Stock lead time has increased 2.1 days vs last quarter.
 Consider Ingram Micro as primary ITAD supplier for Q2."
[Act on this ✨]

SUPPLIER DETAIL (click row → right drawer):
- 12-month performance history charts
- Price history per category
- Contact info + account manager
- Recent orders with status
- AI risk score + explanation chip
```

### 20.10 Feedback Loop & Model Retraining (`/engines/feedback`)

```
PAGE: AI FEEDBACK & MODEL HEALTH

MODEL PERFORMANCE OVERVIEW:
Model               | Accuracy | Last trained | Feedback signals | Status
──────────────────────────────────────────────────────────────────────────
Recommendation CF   | 73%      | 2 days ago   | 1,247 clicks      | ● Good
Demand Forecast     | 84%      | 1 day ago    | 892 actuals       | ● Good
Churn Predictor     | 71%      | 5 days ago   | 34 verifications  | ⚠ Low data
Price Elasticity    | 68%      | 7 days ago   | 120 outcomes      | ⚠ Retrain

FEEDBACK COLLECTION (per recommendation):
When a user clicks "Why?" on any AI recommendation, they see:
[👍 Useful]  [👎 Not relevant]  [✏ Correct the insight]
→ Logged to feedback_events table
→ Weekly automated retraining via Railway worker when signals ≥ 100

RETRAINING SCHEDULE:
[Toggle] Auto-retrain when accuracy drops below [75%] threshold
Last retrain: Recommendation CF — 2 days ago — accuracy improved +4%

MANUAL CONTROLS:
[Retrain Recommendation Model]  [Retrain Demand Forecast]
[Clear feedback cache]          [View training logs]
```

### 20.11 Churn Risk Dashboard (`/customers/churn`)

```
PAGE: CHURN RISK ANALYSIS

SUMMARY:
At-risk customers this month: 67  |  Projected lost ARR: £42,000

CHURN RISK TABLE:
Customer     | Segment    | Risk score | Signals                    | Action
─────────────────────────────────────────────────────────────────────────────────
Acme Corp    | Champion   | 78% 🔴    | No order 45d, 3 support Qs | [Reach out]
TechDistro   | Loyal      | 61% 🟡    | Order freq -40% this Q     | [Monitor]
ABC Ltd      | At-risk    | 54% 🟡    | Avg order value declining  | [Monitor]

Risk score colour:
> 70%: red (immediate action)
50-70%: amber (watch)
< 50%: grey (healthy)

AI RECOMMENDED ACTIONS ✨:
For Acme Corp (78% risk):
"Last contact was 45 days ago. Their usual reorder cycle is 30 days.
 Suggest: personal outreach from account manager + exclusive pricing on Jabra products."
[Draft email ✨]  [Log call]  [Assign to team member]

INTERVENTION HISTORY:
Timeline of all actions taken on at-risk customers with outcome tracking.
```

### 20.12 Price Elasticity Config (`/pricing/elasticity`)

```
PAGE: PRICE ELASTICITY MODEL

CATEGORY COEFFICIENTS:
Category        | Elasticity | Interpretation         | Last updated
────────────────────────────────────────────────────────────────────────
USB Cables      | -2.4       | Highly elastic          | 2 days ago
Enterprise NIC  | -0.6       | Inelastic               | 2 days ago
Jabra Headsets  | -1.2       | Moderately elastic      | 2 days ago
WD SSDs         | -1.8       | Elastic                 | 3 days ago

Visual interpretation of elasticity coefficient:
[Spectrum bar: -3 (very elastic) ←——●——→ 0 (inelastic)]
Each category shown as a dot on the spectrum

PRICING BOUNDS TABLE (per category):
Category        | Min price (floor) | Max price (ceiling) | Current price | Status
─────────────────────────────────────────────────────────────────────────────────────
USB-C 240W     | £8.00             | £24.00              | £14.99        | ✓ In range
Jabra 85UC     | £210.00           | £290.00             | £245.00       | ✓ In range

SIMULATION TOOL:
"What happens if I raise [Jabra 85UC] price by [10%]?"
→ AI calculates: Expected demand change: -12%, Revenue impact: +£890/month
[Simulate ✨]
```

### 20.13 Cohort-Based Personalisation Admin (`/customers/cohorts`)

```
PAGE: CUSTOMER COHORTS

6 AI-defined cohorts (K-means clustering, refreshed weekly):

┌──────────────────────────────────────────────────────────────────┐
│  Cohort: "SMB Network Buyers"                          142 users │
│  Primary purchases: Networking (68%), Switches, APs             │
│  Avg order: £840  |  Freq: 2.3x/month  |  LTV: £18,400          │
│  AI recommendation model: Networking-specialist variant          │
│  Email template: "New networking arrivals"                       │
│  [Edit cohort] [View members] [Test recommendations]             │
└──────────────────────────────────────────────────────────────────┘

COHORT PERFORMANCE:
[Stacked bar — recommendation CTR per cohort, 30d]
MSP Partners      ████████████ 14.2% CTR
SMB Network       ██████████   11.4% CTR
ITAD Resellers    ████████     9.1% CTR
Enterprise IT     ██████       7.3% CTR

COHORT ASSIGNMENT RULES:
Auto-assigned: ML clustering model (weekly)
Manual override: Drag-drop customer to different cohort
Recalculate now: [Rerun clustering ✨]
```

---

## 21. MARKETING WEBSITE — COMPLETE PAGES

### 21.1 Feature Pages

Each feature page follows this template structure:

```
FEATURE PAGE TEMPLATE (/features/[slug]):

HERO:
[Icon — large, brand-400]
H1: Feature name (Cal Sans, 48px)
P: One-line value prop (what it does + why it matters)
[Start free trial]  [See it in action →]

HOW IT WORKS (3-step horizontal):
[① icon]         [② icon]         [③ icon]
Step 1 title     Step 2 title     Step 3 title
Description      Description      Description

PRODUCT SCREENSHOT / MOCKUP:
[Annotated dashboard screenshot with callout labels]
Visual proof the feature exists and works

METRICS / SOCIAL PROOF:
"Teams using [feature] save X hours per week"
[Company logos using this feature]

RELATED FEATURES:
3 cards linking to adjacent feature pages

CTA:
"Start using [feature name] today"
[14-day free trial] [Talk to sales]
```

**Specific feature pages to build:**
- `/features/trend-radar` — product discovery intelligence
- `/features/ai-agents` — the 25 AI engines
- `/features/pricing-intelligence` — competitor monitoring + dynamic pricing
- `/features/demand-forecasting` — inventory prediction
- `/features/ai-briefings` — daily natural language reports

### 21.2 Integrations Page (`/integrations`)

```
PAGE: INTEGRATIONS

HERO:
"Connect everything. See everything."
[Count badge: 50+ integrations]

CATEGORY FILTER TABS:
[All] [Ecommerce] [Analytics] [Marketing] [Inventory] [Finance] [AI/Data]

INTEGRATION GRID (4 columns):
Each card:
┌──────────────────────────┐
│  [Platform logo 40px]    │
│  Platform Name           │
│  "Category"              │
│  ● Connected / [Connect] │
└──────────────────────────┘

Connection status (for logged-in users):
● Green dot = connected
○ Grey = not connected
[Connect] button → OAuth flow or API key modal

FEATURED INTEGRATIONS (top row, larger cards):
Shopify | TikTok Shop | Amazon | Alibaba | Ingram Micro

INTEGRATION DETAIL MODAL (click any card):
- What data is synced
- How often it updates
- What yousell features it unlocks
- Setup steps (numbered, <5 steps)
- [Connect now] button

CTA BANNER:
"Don't see your platform? Request an integration →"
→ Opens Typeform / simple request form
```

### 21.3 Demo / Onboarding Flow

```
ONBOARDING FLOW (yousell.online/onboarding):

STEP 1: Welcome (single screen)
"Let's set up your intelligence layer"
[Progress: ●○○○○]
Name + email (pre-filled from signup)
[Next →]

STEP 2: Your business
"Tell us about your operation"
[  ] I sell on Shopify
[  ] I sell on Amazon
[  ] I sell on TikTok Shop
[  ] I'm a reseller / distributor
[  ] I'm an agency (managing multiple brands)
[Next →]

STEP 3: Product categories
"What do you mainly sell?"
[Chip multi-select, 12 options: Electronics, Networking, Peripherals, etc.]
Skip → / Next →

STEP 4: Connect first platform
"Connect your first platform to start seeing data"
[Shopify] [Amazon] [TikTok Shop] [Skip for now]
— Each button → OAuth flow in same tab, returns to step 5

STEP 5: Run first scan
"Your intelligence engines are ready"
[Run your first product scan]
→ Triggers scan, shows live progress (same Engine Status card design)
[Skip → Go to dashboard]

STEP 6: Dashboard tour (optional)
Beacon-style tooltips on key dashboard elements:
① "Your daily AI briefing appears here every morning"
② "These are your discovered products — click any to see the intelligence chain"
③ "CMD+K lets you search anything in plain English"
[Start tour] / [Skip tour → Go to dashboard]

Design rules for onboarding:
- Clean white background (light mode, even if user prefers dark)
- Progress bar at top (step X of 5)
- Back button always available
- No friction — every step skippable
- Each step fits viewport without scrolling
- Mobile-first: works perfectly on phone
```

### 21.4 Conversion Psychology — Detailed Spec

```
HOMEPAGE CONVERSION ELEMENTS (in order of appearance):

1. SOCIAL PROOF — Above the fold
"Trusted by 60,000+ ecommerce operators"
Logo bar: Shopify, Amazon, TikTok, Alibaba, Ingram Micro
[Auto-scrolling, infinite marquee, subtle opacity]

2. ANCHORING — Hero headline
Before: "Track ecommerce trends"  ← what competitors say
After:  "The Intelligence Layer for Modern Ecommerce"  ← elevated framing

3. SPECIFICITY — Builds trust
"25 AI engines. 14 platform providers. Updated every 4 hours."
Not "powerful AI" — specific numbers signal real engineering.

4. RISK REVERSAL — CTA area
"14-day free trial · No credit card · Cancel anytime"
All three objections killed in one line, below every CTA button.

5. LOSS AVERSION — Feature callout
"Your competitors are using tools like this.
 FastMoss charges $299/month for half the intelligence."
→ Reframe: not buying a tool, avoiding falling behind.

6. VELOCITY — Live counter (optional)
"847 new trending products discovered in the last hour"
[Live updating counter] — shows the system is real and working right now.

7. TESTIMONIALS — After pricing section
Not generic quotes. Specific outcomes:
"I found 3 winning products in my first week. Two are now 30% of my revenue."
— [Name, store type, city]
Format: Large blockquote, avatar, specific result, not a vague "great tool!"

8. PRICING PAGE — Anchoring
Show Agency tier first (most expensive) then Pro then Starter.
Reading left→right, Pro feels like value after seeing Agency.
Pro card visually elevated (glow border, "Most Popular" badge).

9. PRICING — ROI CALCULATOR (interactive)
"How much is one winning product worth to you per month?"
[Slider: £100 → £10,000]
Output: "At £[X]/month margin, yousell Pro pays for itself in [Y] days."
[Lock in your price before it increases →]

10. FAQ — OBJECTION HANDLING
Write answers that directly counter the 10 most common reasons not to buy:
Q: "Is this just a Shopify tool?"
A: "No. We track 14 platforms including TikTok Shop, Amazon, and Alibaba."
Q: "How is this different from FastMoss or JungleScout?"
A: "FastMoss covers TikTok only. JungleScout covers Amazon only. Yousell covers both plus 12 more — and adds AI briefings none of them offer."
```

---

## 22. VISUAL INNOVATION — EXPANDED SPEC

### 22.1 Animated Gradient Components

```css
/* Aurora background — used in marketing hero and AI insight areas */
.aurora-bg {
  background: radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 60% 80%, rgba(139,92,246,0.10) 0%, transparent 60%),
              var(--color-brand-900);
  animation: aurora-shift 8s ease-in-out infinite alternate;
}

@keyframes aurora-shift {
  0%   { background-position: 0% 0%, 100% 0%, 50% 100%; }
  100% { background-position: 10% 10%, 90% 10%, 55% 90%; }
}

/* Mesh gradient — for pricing page "Pro" card highlight */
.mesh-gradient-pro {
  background: conic-gradient(
    from 180deg at 50% 50%,
    rgba(99,102,241,0.4) 0deg,
    rgba(59,130,246,0.3) 72deg,
    rgba(139,92,246,0.4) 144deg,
    rgba(99,102,241,0.3) 216deg,
    rgba(59,130,246,0.4) 288deg,
    rgba(99,102,241,0.4) 360deg
  );
  filter: blur(80px);
  opacity: 0.3;
}

/* AI glow pulse — animates on AI-generated content cards */
@keyframes ai-glow-pulse {
  0%, 100% { box-shadow: 0 0 0 1px rgba(99,102,241,0.3), 0 4px 24px rgba(99,102,241,0.1); }
  50%      { box-shadow: 0 0 0 1px rgba(99,102,241,0.5), 0 4px 32px rgba(99,102,241,0.2); }
}
.ai-card-active { animation: ai-glow-pulse 2s ease-in-out infinite; }
```

### 22.2 Glassmorphism — Usage Rules

```
Rule: Glassmorphism is used in EXACTLY these 4 contexts:
1. AI Assistant panel (right rail) — the chat overlay should feel like frosted glass
2. Floating command palette (CMD+K) background
3. Notification toasts (subtle, not heavy)
4. Marketing hero — feature tiles overlaid on animated background

It is NEVER used for:
- Data tables (kills readability)
- Form inputs
- Navigation sidebar
- KPI cards (too much visual noise)

Implementation spec:
backdrop-filter: blur(20px) saturate(180%);
background: rgba(14, 22, 41, 0.75);    /* dark mode */
background: rgba(255, 255, 255, 0.75); /* light mode */
border: 1px solid rgba(255,255,255,0.08);  /* dark */
border: 1px solid rgba(0,0,0,0.08);        /* light */
```

### 22.3 Data-Driven UI Visuals

```
Sparklines embedded in table cells:
- Every metric column in product tables includes a 30px inline sparkline
- Rendered via Recharts ResponsiveContainer height=30, no axes, no labels
- Green line: trending up | Red line: trending down | Grey: flat
- Tooltip on hover shows exact 7-day values

Live data indicators:
- Any real-time value (live scan count, AI activity) shows a subtle pulse dot
- Dot: 6px circle, background brand-400, box-shadow 0 0 0 brand-400 at 40%
- Pulse: scale(1) → scale(1.8) → scale(1), opacity 1 → 0, 1.5s infinite

Trend sparkline in KPI cards:
- 40px tall area chart below the main number
- No axes, no labels — pure trend signal
- Fills 100% card width
- Area fill: gradient from chart-1 at 40% opacity → transparent
```

---

## 23. DESIGN TOKENS PER STATE

Complete CSS variable definitions for every interactive state:

```css
/* State tokens — used in component implementations */
:root {
  /* Hover states */
  --state-hover-bg:       rgba(255,255,255,0.04);
  --state-hover-border:   rgba(255,255,255,0.12);
  --state-hover-scale:    1.01;

  /* Active/pressed states */
  --state-active-bg:      rgba(255,255,255,0.08);
  --state-active-scale:   0.99;

  /* Focus states */
  --state-focus-ring:     0 0 0 3px rgba(59,130,246,0.5);
  --state-focus-ring-offset: 2px;

  /* Disabled states */
  --state-disabled-opacity: 0.4;
  --state-disabled-cursor:  not-allowed;

  /* Loading states */
  --state-loading-shimmer-from: rgba(255,255,255,0);
  --state-loading-shimmer-via:  rgba(255,255,255,0.05);
  --state-loading-shimmer-to:   rgba(255,255,255,0);

  /* Error states */
  --state-error-bg:       rgba(239,68,68,0.08);
  --state-error-border:   rgba(239,68,68,0.5);
  --state-error-text:     #FCA5A5;

  /* Success states */
  --state-success-bg:     rgba(16,185,129,0.08);
  --state-success-border: rgba(16,185,129,0.5);
  --state-success-text:   #6EE7B7;

  /* Warning states */
  --state-warning-bg:     rgba(245,158,11,0.08);
  --state-warning-border: rgba(245,158,11,0.5);
  --state-warning-text:   #FCD34D;

  /* AI states */
  --state-ai-active-bg:     rgba(99,102,241,0.08);
  --state-ai-active-border: rgba(99,102,241,0.4);
  --state-ai-streaming-cursor: rgba(165,180,252,0.8);
}

/* Shimmer animation (applies to all skeleton loaders) */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--state-loading-shimmer-from) 0%,
    var(--state-loading-shimmer-via)  50%,
    var(--state-loading-shimmer-to)   100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

---

## 24. HIGH CONTRAST ACCESSIBILITY VARIANT

```css
/* Triggered by: prefers-contrast: more OR manual toggle in Settings */
@media (prefers-contrast: more) {
  :root {
    --surface-border:     #6B7280;    /* Much stronger borders */
    --color-brand-400:    #818CF8;    /* Higher contrast interactive */
    --color-success:      #34D399;
    --color-warning:      #FCD34D;
    --color-danger:       #F87171;
    --state-focus-ring:   0 0 0 3px #FFFFFF;  /* White focus ring */
  }
  /* Force visible focus on everything */
  *:focus-visible {
    outline: 3px solid #FFFFFF !important;
    outline-offset: 3px !important;
  }
  /* Remove all glass/blur effects */
  .glass-panel {
    backdrop-filter: none !important;
    background: var(--surface-card) !important;
    border: 2px solid var(--surface-border) !important;
  }
  /* Remove gradient backgrounds */
  .aurora-bg, .mesh-gradient-pro {
    background: var(--surface-base) !important;
    animation: none !important;
  }
}

/* Settings toggle implementation */
// In /settings/accessibility: "High contrast mode" toggle
// Stores in localStorage as 'yousell-contrast-mode'
// Adds/removes class 'high-contrast' on <html>
// Same CSS rules apply to .high-contrast as @media (prefers-contrast: more)
```

---

## 25. UPDATED EXECUTION ORDER — COMPLETE

Add these items to Phase 3 and Phase 4 from the original execution order:

### Phase 3 additions (Admin pages not previously spec'd):
```
29b. User Management (/settings/users)
29c. Billing & Subscriptions (/settings/billing)
29d. Fraud Detection Dashboard (/settings/fraud)
29e. A/B Test Manager (/settings/experiments)
29f. RFM Segmentation Dashboard (/customers/segments)
29g. Cohort-Based Personalisation (/customers/cohorts)
29h. Churn Risk Dashboard (/customers/churn)
29i. Supplier Performance (/suppliers)
29j. Price Elasticity Config (/pricing/elasticity)
29k. Feedback Loop & Model Health (/engines/feedback)
29l. Revenue & Attribution (/app/revenue)
29m. Order Insights (/app/orders)
```

### Phase 4 additions (Marketing pages not previously spec'd):
```
31b. Feature page: Trend Radar (/features/trend-radar)
31c. Feature page: AI Agents (/features/ai-agents)
31d. Feature page: Pricing Intelligence (/features/pricing-intelligence)
31e. Feature page: Demand Forecasting (/features/demand-forecasting)
31f. Feature page: AI Briefings (/features/ai-briefings)
32b. Integrations catalogue page (/integrations)
33b. Full onboarding flow (6 steps, /onboarding)
```

### Phase 3 interaction gaps (not previously spec'd):
```
— State management setup (Zustand stores, TanStack Query client)
— Gesture system setup (@use-gesture/react)
— Toast/notification system (Sonner)
— Breadcrumb component (auto-generated from pathname)
— Context switcher (multi-workspace support)
— High contrast accessibility variant (CSS + toggle)
— Shimmer skeleton system (global skeleton component)
— Onboarding tooltip/beacon system
```

---

## 26. UPDATED QUALITY GATES — ADDITIONS

Add to the quality gates checklist in Section 13:

```
Completeness:
☐ All 13 admin pages fully spec'd and built (not just nav items)
☐ All 5 feature pages built with consistent template
☐ Integrations page with connection status for all 30 tools
☐ Full 6-step onboarding flow
☐ Onboarding tooltips implemented on first login

Interaction completeness:
☐ Gesture support: swipe sidebar, pull-to-refresh, long-press bulk select
☐ Toast notifications: all 5 variants (success/error/warning/info/loading)
☐ Breadcrumbs: auto-generated, dynamic segments resolved
☐ Context switcher: multi-workspace with keyboard navigation
☐ Feedback loop: thumbs up/down on every AI recommendation

Data completeness:
☐ RFM scores computed and segment badges visible in customer table
☐ Demand forecast confidence bars shown
☐ Price elasticity bounds visible in pricing engine
☐ Supplier scores computed and rendered
☐ Model accuracy shown in feedback dashboard

Conversion (marketing site):
☐ ROI calculator functional and interactive
☐ Social proof elements on every CTA section
☐ All 10 FAQ objections answered
☐ Integrations page shows connection status for logged-in users
☐ Onboarding flow skip-able at every step
```
