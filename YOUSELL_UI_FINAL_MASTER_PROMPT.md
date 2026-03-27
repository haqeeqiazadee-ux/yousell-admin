# YOUSELL.ONLINE — UI/UX MASTER BUILD PROMPT
## FINAL VERSION — Claude Code Edition
### v3 · 2026-03-24 · Ultra-Comprehensive · All 3 Surfaces

---

## ⚡ MEMORY REFRESHER SYSTEM
*Read this block at the start of every Claude Code session before any work*

```
SESSION START PROTOCOL — MANDATORY:
1. Read this entire header section (takes 2 minutes, saves hours)
2. Run: find src -name "*.tsx" | head -30   (see what's built)
3. Run: cat system/UI_STATUS.json 2>/dev/null (check progress)
4. Print recovery summary before writing any code

RECOVERY SUMMARY FORMAT:
┌─────────────────────────────────────────────────┐
│ UI BUILD STATUS                                 │
│ Surface in progress: [Admin/Client/Marketing]   │
│ Last completed page: [exact page + path]        │
│ Next page to build:  [exact page + path]        │
│ Design tokens set:   [Yes/No]                   │
│ Component library:   [% complete]               │
│ Blockers:            [none or description]      │
└─────────────────────────────────────────────────┘
```

---

## 🎯 WHAT YOU ARE BUILDING — READ EVERY WORD

**Platform**: yousell.online — AI-native ecommerce product intelligence SaaS

**The Three Surfaces** (all must be built):
1. `yousell.online` — Marketing website (public, converts visitors to signups)
2. `yousell.online/dashboard` — **CLIENT DASHBOARD** (paying subscribers — THE BACKBONE)
3. `admin.yousell.online` — Admin dashboard (internal ops, your team only)

**The Core Product** (what clients pay for):
The **7-Row Universal Intelligence Chain** — shown for every product on every platform:
1. Product Identity → 2. Product Stats → 3. Related Influencers →
4. TikTok Shops → 5. Other Channels → 6. Viral Videos & Ads →
7. Opportunity Score & AI Action Plan

**The Engine Architecture** (25 engines + external API adapter, already built — UI exposes them):
- 10 Discovery engines: TikTok Discovery, Product Extraction, Product Clustering, Trend Detection, Creator Matching, Amazon Intelligence, Shopify Intelligence, Ad Intelligence, Opportunity Feed, Pre-Viral Detection
- 10 Scoring engines: Market Intelligence, Predictive Analytics, Competitive Intelligence, Supply Chain, Social Proof, Pricing Intelligence, Content Intelligence, Visual Intelligence, Risk Assessment, Automation
- 4 Advanced engines: Composite Score, Profitability Engine, Influencer Intelligence, Supplier Discovery
- 1 Governor engine: coordinates all 24, supports external engine API integration
- External Engine Adapter: any platform with an API can replace any internal engine via `/admin/governor/engines`

**14 Discovery Providers**: TikTok, Amazon, Shopify, Pinterest, Reddit, YouTube, eBay, Facebook, Instagram, Alibaba, Etsy, AliExpress, Gumroad, PartnerStack

**Competitors being beaten**: FastMoss (TikTok only), JungleScout (Amazon only), PPSPY (Shopify only), Minea (Ads only), Triple Whale (Shopify + analytics)
**The moat**: Pre-viral detection + cross-platform intelligence + 7-row chain + AI briefings — nobody else has all four

**Tech Stack (DO NOT CHANGE)**:
```
Frontend:     Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui
Components:   Radix UI + Aceternity UI + Lucide icons
Animation:    Motion (Framer Motion v11+)
Charts:       Recharts + Tremor
Tables:       TanStack Table v8
State:        Zustand + TanStack Query v5 + nuqs
Database:     Supabase (PostgreSQL + Auth + Edge Functions + pgvector)
Backend:      Railway (Node.js + Express + BullMQ + Redis)
Email:        Resend
Deploy:       Netlify (frontend) + Railway (backend)
AI:           Claude API (Anthropic) — Haiku for fast queries, Sonnet for deep analysis
```

**Design Language**: "Obsidian Intelligence"
- Dark by default (admin + client). Marketing site: light by default.
- Font stack: Cal Sans (headings/KPIs) + DM Sans (body) + JetBrains Mono (data)
- Primary: #3D5FA8 (brand-400). AI accent: #6366F1 (indigo). Success: #10B981.
- 8pt spacing grid. CSS variables for every token. Never hardcode colours.

**Priority Order for builds**: Client Dashboard > Admin Dashboard > Marketing Website
(Client dashboard is what generates revenue — build it first)

---

## 📋 DOCUMENT STRUCTURE

This prompt is organised into 3 parts across 32 sections:

PART 1 (Sections 1–15): Design system, global layout, admin dashboard core pages
PART 2 (Sections 16–26): State management, gestures, micro-interactions, missing admin pages, full marketing website
PART 3 (Sections 27–32): **CLIENT DASHBOARD** (complete spec), Marketing website completion, final execution order

Read all 3 parts before writing any code.

---

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

> ⚠️ **THIS SECTION IS SUPERSEDED. DO NOT BUILD FROM HERE.**
> 
> The complete, authoritative client dashboard specification is in **Section 28 (Parts 28.1–28.15)**.
> Section 28 covers all 15 pages with full wireframe-level detail, including the 7-row Universal
> Intelligence Chain, all platform tabs, Pre-Viral Detection, Opportunity Feed, Creator Discovery,
> Ad Intelligence, Watchlist, Launch Blueprints, Digital/AI/SaaS/Affiliate tabs, Alerts, Usage,
> and Settings.
> 
> **Jump to Section 27 for architecture and Section 28 for all page specs.**

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

> ⚠️ **SUPERSEDED — USE SECTION 31 ONLY**
> 
> This section contains an earlier, incomplete phase plan. The canonical, complete execution order
> covering all 3 surfaces (Admin, Client Dashboard, Marketing) is in **Section 31**.
> 
> **Section 31 is the ONLY execution order Claude Code should follow.**
> It places Client Dashboard (Phase 3) before Marketing (Phase 4), which is the correct priority.


## 13. QUALITY GATES

> ⚠️ **SUPERSEDED — USE SECTION 32 ONLY**
> 
> The canonical quality gates covering all 3 surfaces are in **Section 32**.
> Section 32 is the ONLY quality checklist Claude Code should use.


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

### 20.14 Chatbot AI Management (`/admin/chatbot`)

```
PAGE: CHATBOT AI MANAGEMENT

HEADER:
Chatbot AI                                [Add Intent] [Bot Config]

TABS: [Intents] [Conversations] [Config]

INTENTS TAB:
Table of chatbot intents with columns:
Intent Name | Category | Training Phrases | Response Template | Status | Actions
─────────────────────────────────────────────────────────────────────────────────
greeting    | General  | 5 phrases        | Welcome message   | Active | [Edit] [Delete]
order_status| Support  | 8 phrases        | Order lookup      | Active | [Edit] [Delete]

CONVERSATIONS TAB:
Recent chatbot conversations with user messages, bot responses, confidence scores.
Filter by: [Date range] [Resolved/Unresolved] [Confidence threshold]

CONFIG TAB:
Bot name, personality tone, fallback message, escalation threshold, active hours.

Tables: chatbot_config, chatbot_intents, chatbot_conversations
API: GET/POST/PATCH/DELETE /api/admin/chatbot
```

### 20.15 Fraud & Security Dashboard (`/admin/fraud`)

```
PAGE: FRAUD & SECURITY

HEADER:
Fraud & Security                          [Add Rule] [Export Flags]

KPI ROW (4-up):
[Flagged Today] [Rules Active] [Blocked This Week] [False Positive Rate]

FRAUD RULES TABLE:
Rule Name | Type | Threshold | Status | Triggers (30d) | Actions
────────────────────────────────────────────────────────────────────
High-value order    | Amount    | > $500    | Active | 12 | [Edit] [Toggle]
Velocity check      | Frequency | > 5/hour  | Active |  3 | [Edit] [Toggle]
Geo mismatch        | Location  | Any       | Active |  8 | [Edit] [Toggle]

FLAGGED TRANSACTIONS:
Order ID | Date | Amount | Risk Score | Flag Reason | Status | Actions
[Approve] [Block] [Investigate]

Tables: fraud_rules, fraud_flags
API: GET/POST/PATCH/DELETE /api/admin/fraud
```

### 20.16 Dynamic Pricing Intelligence (`/admin/pricing`)

```
PAGE: DYNAMIC PRICING

HEADER:
Dynamic Pricing                           [New Strategy] [Sync Competitors]

TABS: [Strategies] [Suggestions] [Competitor Prices]

STRATEGIES TAB:
Strategy Name | Type | Products | Min Margin | Max Discount | Status
──────────────────────────────────────────────────────────────────────
Competitive match  | Auto    | 45 | 15% | 20% | Active
Seasonal boost     | Manual  | 12 | 20% | 0%  | Paused
Clearance          | Auto    | 8  | 5%  | 40% | Active

SUGGESTIONS TAB:
AI-generated pricing suggestions with confidence scores.
Product | Current Price | Suggested Price | Reason | Confidence | [Accept] [Dismiss]

COMPETITOR PRICES TAB:
Competitor | Product | Their Price | Our Price | Difference | Last Checked
[Refresh prices]

Tables: pricing_strategies, pricing_suggestions, competitor_prices
API: GET/POST/PATCH/DELETE /api/admin/pricing
```

### 20.17 Demand Forecasting (`/admin/forecasting`)

```
PAGE: DEMAND FORECASTING

HEADER:
Demand Forecasting                        [Run Forecast] [Export]

KPI ROW (4-up):
[Products Forecasted] [Stockout Alerts] [Avg Accuracy (30d)] [Restock Pending]

FORECAST CHART:
[Line chart — 90-day forward projection per category]
[Actual (solid)] + [Forecast (dashed)] + [Confidence band (shaded)]
Toggles: [7d] [30d] [90d] | [Category filter]

RESTOCK ALERTS TABLE:
Product | Category | Current Stock | Days Left | Forecast Demand | Confidence | Action
─────────────────────────────────────────────────────────────────────────────────────────
SKU-001 | Electronics | 43 | 12 days  | +340 units | 78% | [Order]
SKU-002 | Storage     |  8 |  4 days  | +120 units | 91% | [Order]

Tables: demand_forecasts, restock_alerts
API: GET/POST/PATCH /api/admin/forecasting
```

### 20.18 Smart UX Management (`/admin/smart-ux`)

```
PAGE: SMART UX

HEADER:
Smart UX                                  [Add Feature] [New A/B Test]

TABS: [Feature Toggles] [A/B Tests] [Personalization Rules]

FEATURE TOGGLES TAB:
Feature Name | Description | Status | Rollout % | Updated | Actions
──────────────────────────────────────────────────────────────────────
AI recommendations  | Product recs on homepage    | Active   | 100% | 2d ago | [Toggle]
Smart search         | NLP-powered search bar      | Active   |  50% | 1w ago | [Toggle]
Dynamic hero         | Personalized hero banners   | Inactive |   0% | 3w ago | [Toggle]

A/B TESTS TAB:
Test Name | Variants | Traffic Split | Metric | Significance | Status
[Create test] [Pause] [Declare winner]

PERSONALIZATION RULES TAB:
Rule Name | Segment | Action | Priority | Status
"New user onboarding" | first_visit | Show tutorial | 1 | Active
"Returning buyer"     | repeat_purchase | Show recommendations | 2 | Active

Tables: smart_ux_features, ab_tests, personalization_rules
API: GET/POST/PATCH/DELETE /api/admin/smart-ux
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

## 25. UPDATED EXECUTION ORDER

> ⚠️ **SUPERSEDED — USE SECTION 31 ONLY**
> 
> Section 31 is the definitive execution order for all 3 surfaces.


## 26. UPDATED QUALITY GATES

> ⚠️ **SUPERSEDED — USE SECTION 32 ONLY**
> 
> Section 32 contains the final complete quality gates.


---

# PART 3 — CLIENT DASHBOARD (BACKBONE) + MARKETING WEBSITE COMPLETION
## The most important section. Read every word before writing a single line.

---

## 27. CLIENT DASHBOARD — ARCHITECTURE & PHILOSOPHY

### 27.1 What the Client Dashboard IS

The client dashboard at `yousell.online/dashboard` is the **core product** — what paying subscribers log into every day. It is NOT a simplified version of the admin dashboard. It is a completely separate surface with a completely different purpose.

```
SURFACE COMPARISON:

admin.yousell.online          yousell.online/dashboard
────────────────────          ────────────────────────
Internal ops tool             Customer-facing product
You + your team use it        Paying subscribers use it
Full system visibility        Curated intelligence only
Engine control + config       Product research + discovery
Raw data + logs               Polished insights + actions
Always dark mode              User-toggled dark/light
Power-user density            Progressive disclosure
```

**The client dashboard solves this specific job-to-be-done:**
> *"I'm an ecommerce operator. I have 30 minutes. Show me the best products to sell today, why they're winning, who's selling them, and tell me exactly what to do next."*

Every design decision must be evaluated against this JTBD.

### 27.2 The Universal 7-Row Intelligence Chain

This is the most important data structure in the entire platform. Every product on every platform tab renders the same 7-row intelligence chain. This is the product.

```
PRODUCT INTELLIGENCE CHAIN
═══════════════════════════════════════════════════════════════════

ROW 1 — PRODUCT IDENTITY
  [Product image 120px] | [Title] | [Category badge] | [Platform badge]
  [First detected: 4 days ago] | [Freshness: 🟢 Active] | [Product type: Physical]
  [Composite Score: 84/100 ████████░░] | [Engine confidence: High]

ROW 2 — PRODUCT STATS
  Tabs: [Overview] [Trend] [Sales] [Forecast]
  
  Overview:  Trend Score | Predictive Score | Est. Monthly Sales | Est. Revenue
             7d Change   | 30d Velocity     | Saturation Risk    | Margin Potential
  Trend:     [Line chart — trend velocity 90 days, with prediction band]
  Sales:     [Bar chart — estimated sales volume by platform]
  Forecast:  [Demand forecast 30/60/90 days with confidence bands] ✨ AI

ROW 3 — RELATED INFLUENCERS & CREATORS
  [Scrollable horizontal list]
  Each card: [Avatar] [Name] [Followers] [Platform] [Match Score] [Last posted about this]
  [Contact ✉] button → opens outreach email draft via Resend
  Filter: [All] [Mega >1M] [Macro 100K-1M] [Micro 10K-100K] [Nano <10K]

ROW 4 — TIKTOK SHOPS SELLING THIS
  Table: Shop Name | GMV Est. | Units/Month | Creator Count | Growth Rate | Actions
  [View shop] [Track] [Alert me if they stop]
  AI insight ✨: "This shop's GMV grew 340% in 30 days — early mover advantage still available"

ROW 5 — OTHER CHANNELS & PLATFORMS
  Amazon: [BSR rank] [Reviews] [Est. Sales] [Price range] [Seller count] [FBA/FBM]
  Shopify: [Stores count] [Top store] [Est. revenue] [Traffic estimate] [Apps used]
  eBay:    [Listings] [Sold last 30d] [Avg price]
  YouTube: [Videos] [Total views] [Top creator]
  Pinterest: [Pins] [Saves] [Traffic est.]
  Reddit:  [Mentions] [Sentiment] [Top subreddits]

ROW 6 — VIRAL VIDEOS & ADS
  Tabs: [TikTok Videos] [TikTok Ads] [Facebook/Meta Ads] [YouTube]
  
  Each item: [Thumbnail] [Views/Impressions] [Engagement Rate] [Posted date]
             [Est. ad spend (if ad)] [Running time] [Watch/View →]
  
  AI insight ✨: "3 new ads started running this week — competitor scaling detected"

ROW 7 — OPPORTUNITY SCORE & ACTION PLAN
  ┌────────────────────────────────────────────────────────────────┐
  │  OPPORTUNITY SCORE: 84/100  🔥 HIGH OPPORTUNITY               │
  │                                                                │
  │  Engine breakdown:                                            │
  │  Market Intelligence    ████████░░  78/100                    │
  │  Predictive Analytics   █████████░  86/100  ✨                │
  │  Competitive Intel      ███████░░░  71/100                    │
  │  Supply Chain           ████████░░  80/100                    │
  │  Social Proof           █████████░  89/100                    │
  │  Pricing Intelligence   ███████░░░  74/100                    │
  │  Risk Assessment        ████████░░  Low risk ✓               │
  │                                                                │
  │  ✨ AI RECOMMENDED ACTIONS (streaming reveal):                │
  │  1. Source from [Supplier X] — 12-day lead time, £8.40 COGS  │
  │  2. Target: TikTok Shop launch + Amazon FBA simultaneously    │
  │  3. Hook angle: "Wireless charging, iPhone 16 compatible"     │
  │  4. Budget: £500 test budget recommended (low saturation)     │
  │                                                                │
  │  [Generate Full Launch Blueprint ✨]  [Add to Watchlist]      │
  │  [Export to Excel]  [Share product]                           │
  └────────────────────────────────────────────────────────────────┘
```

### 27.3 Client Dashboard Navigation

```
LAYOUT: Full-width, no sidebar by default (maximises product viewing space)
        Sidebar toggleable via hamburger for navigation

TOP BAR (client version — simpler than admin):
[yousell logo]  [Platform tabs]  [🔍 Search]  [🔔 3]  [⭐ Watchlist]  [👤]

PLATFORM TABS (persistent, top of every page):
[🎵 TikTok] [📦 Amazon] [🛍 Shopify] [📌 Pinterest] [💬 Reddit]
[💻 Digital] [🤖 AI/SaaS] [🔗 Affiliates]

LEFT SIDEBAR (toggleable, 240px when open):
DISCOVERY
  ○ Trending Now          /dashboard
  ○ Pre-Viral ✨ AI      /dashboard/pre-viral
  ○ Opportunity Feed     /dashboard/opportunities

RESEARCH
  ○ TikTok Intelligence  /dashboard/tiktok
  ○ Amazon Intelligence  /dashboard/amazon
  ○ Shopify Intelligence /dashboard/shopify
  ○ Ad Intelligence      /dashboard/ads
  ○ Creator Discovery    /dashboard/creators

MY TOOLS
  ★ Watchlist            /dashboard/watchlist
  ○ Saved Searches       /dashboard/saved
  ○ My Alerts            /dashboard/alerts
  ○ Launch Blueprints    /dashboard/blueprints

ACCOUNT
  ○ Usage & Plan         /dashboard/usage
  ○ Settings             /dashboard/settings
  ○ Help & Onboarding    /dashboard/help
```

---

## 28. CLIENT DASHBOARD — PAGE-BY-PAGE SPECS

### 28.1 Trending Now — Main Home (`/dashboard`)

This is the page users land on every session. It must answer: *"What's hot right now?"* in under 5 seconds.

```
TRENDING NOW — LAYOUT

TOP STRIP (sticky, collapses on scroll):
[🎵 TikTok] [📦 Amazon] [🛍 Shopify] [All Platforms]  — active tab controls the feed below
[Filter: Today | 7 Days | 30 Days]  [Sort: Trend Score | Newest | Revenue Est.]
[Category ▾]  [Product Type ▾]  [Min Score ▾]

AI BRIEFING CARD (top, dismissable):
┌─────────────────────────────────────────────────────────────────────────┐
│ ✨ TODAY'S INTELLIGENCE BRIEF  —  Tuesday 24 March, 09:14 UTC           │
│ "Wireless charging accessories spiked 218% overnight on TikTok,         │
│  driven by iPhone 16 compatibility content from 3 mega-creators.        │
│  2 new Shopify stores launched yesterday targeting this product.         │
│  Amazon BSR improved 840 positions in 48h. Window is open."             │
│ [3 more insights ↓]          [Expand full brief]          [Dismiss]     │
└─────────────────────────────────────────────────────────────────────────┘

PRODUCT GRID (main content):
Layout: 3-col on xl, 2-col on lg, 1-col on md/sm
Each card is a COLLAPSED version of the 7-row intelligence chain.

PRODUCT CARD (collapsed — 240px tall):
┌────────────────────────────────────────────┐
│ [Product image 80px] [🔥 Hot badge]        │
│ Product title (2 lines max)                │
│ TikTok Shop · Physical · Electronics       │
│                                            │
│ ████████░░ Opportunity Score: 84           │
│                                            │
│ Est. £2,400/mo  |  +312% 7d  |  Low risk   │
│                                            │
│ 3 influencers  ·  12 TikTok shops          │
│ [🎵 4 videos]  [📢 2 ads running]          │
│                                            │
│ [View Intelligence →]  [★ Watch]           │
└────────────────────────────────────────────┘

CLICK CARD → expands inline to full 7-row intelligence chain
(not a new page — same page, card expands to full width with animation)

INFINITE SCROLL:
- Load 12 products on page load
- Load 12 more as user scrolls to bottom
- Skeleton cards appear during load
- "Showing 24 of 847 products" counter at bottom
```

### 28.2 Product Detail — Full Intelligence View

When a user clicks "View Intelligence →" on a product card, the page navigates to `/dashboard/product/[id]`.

This is the most important page in the entire product. It renders the complete 7-row chain with full data.

```
PRODUCT DETAIL PAGE — LAYOUT

BREADCRUMB: Trending Now > TikTok > [Product Name]

STICKY HEADER (60px, appears on scroll):
[← Back]  [Product name, truncated]  [Score: 84 🔥]  [★ Watch]  [Share]  [Export]

PAGE HEADER:
LEFT (60%):
  [Product images — carousel 3 images if available]
  Product title (Cal Sans, 28px)
  [TikTok badge] [Physical badge] [Category badge]
  First detected: 4 days ago · Last updated: 23 minutes ago
  [★ Add to Watchlist]  [Share]  [Export report]

RIGHT (40%):
  COMPOSITE SCORE GAUGE:
  [Large radial gauge, 0-100, coloured arc: red→amber→green]
  [84] score in centre, "High Opportunity" label
  
  TOP 3 SIGNALS:
  ✦ Social Proof: 89/100 — 847 viral videos in 7 days
  ✦ Predictive: 86/100 — Pre-viral window detected
  ✦ Market Intel: 78/100 — Low saturation, growing demand

INTELLIGENCE CHAIN (full 7 rows, each collapsible):
[Row 1: Product Identity — expanded by default]
[Row 2: Product Stats — expanded by default, chart tab active]
[Row 3: Influencers — expanded, horizontal scroll]
[Row 4: TikTok Shops — collapsed by default, expandable]
[Row 5: Other Channels — collapsed, expandable]
[Row 6: Viral Videos & Ads — collapsed, expandable]
[Row 7: Opportunity Score & Actions — expanded, AI streaming]

BOTTOM CTA BAR (sticky, bottom of viewport):
[Generate Launch Blueprint ✨ (Pro)]  [Add to Watchlist]  [Export to Excel]
```

### 28.3 TikTok Intelligence (`/dashboard/tiktok`)

The TikTok section is modelled after FastMoss but goes significantly deeper with the 7-row chain.

```
TIKTOK INTELLIGENCE — FULL PAGE

HEADER:
TikTok Intelligence              [Last scan: 6 minutes ago ●]
[Run manual scan (Pro)]          [Export current view]

STATS BAR (4 KPIs):
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Products     │ │ Viral Videos │ │ Creators     │ │ TikTok Shops │
│ 4,221        │ │ 18,447       │ │ 2,891        │ │ 1,244        │
│ +847 today   │ │ +2,341 today │ │ +89 today    │ │ +23 today    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

SUB-NAVIGATION TABS:
[Products] [Trending Videos] [TikTok Shops] [Creators] [Ads]

─── PRODUCTS TAB (default) ───

FILTER BAR (sticky):
[Category ▾] [Score ▾] [Trend Period ▾] [Product Type ▾]
[Price Range ▾] [Saturation ▾] [Date Found ▾]
[🔍 Search products...]

AI INSIGHT BANNER ✨ (contextual, dismissable):
"Electronics dominated this week's TikTok trends — 3,241 new products
 detected, led by charging accessories (+847%) and audio peripherals (+312%)."

PRODUCTS TABLE (TanStack, all cols sortable):
─────────────────────────────────────────────────────────────────────────────────
[✓] │Score│Img│Product Title            │Category│Est Sales│7d Chg │Videos│Actions
─────────────────────────────────────────────────────────────────────────────────
[ ] │ 84 │ ○ │AirTag Wallet Case       │Access. │ 2,400   │+312% ↑│ 847  │[View][★]
[ ] │ 78 │ ○ │USB-C 240W Cable 3-Pack  │Tech    │ 1,800   │+189% ↑│ 441  │[View][★]
[ ] │ 71 │ ○ │Magnetic Phone Stand     │Desk    │   920   │+ 87% ↑│ 234  │[View][★]

BULK ACTIONS (appears on row selection):
[X] products selected:  [Compare]  [Add to Watchlist]  [Export]  [Generate Blueprints]

CLICK ROW → navigates to /dashboard/product/[id] (full intelligence chain)

─── TRENDING VIDEOS TAB ───

VIDEO FEED (3-col grid):
Each tile:
┌──────────────────────────┐
│  [Video thumbnail]        │
│  [▶ 2.4M views]           │
│  Product: AirTag Case     │
│  @creator_handle          │
│  Posted: 2 days ago       │
│  [🔗 TikTok] [📦 Product] │
└──────────────────────────┘

─── TIKTOK SHOPS TAB ───

SHOPS TABLE:
Shop Name | Products | Est GMV/mo | Top Product | Growth 30d | Creator Partners | Actions
──────────────────────────────────────────────────────────────────────────────────────────
Gadget Hub UK | 234  | £48,000   | AirTag Case | +340% 🔥  | 12 creators       | [View][Track]

─── CREATORS TAB ───

CREATOR TABLE:
Avatar | Handle | Followers | Platform | Niche | Match Score | Products Promoting | Actions
─────────────────────────────────────────────────────────────────────────────────────────────
[img] │ @techtok │ 1.2M │ TikTok │ Tech gadgets │ 94% │ 23 products │ [View] [✉ Outreach]

Match Score: how closely a creator's content aligns with the current product filter

─── ADS TAB ───

AD LIBRARY (3-col grid):
Each tile:
[Thumbnail] · [Platform: TikTok]
"Running for: 14 days"
"Est. daily spend: £800-1,200"
Product: AirTag Case
[View ad] [Track spend]

AI INSIGHT ✨: "3 competitors started scaling paid ads on AirTag accessories
 in the last 48 hours. Combined estimated spend: £3,400/day."
```

### 28.4 Amazon Intelligence (`/dashboard/amazon`)

```
AMAZON INTELLIGENCE — FULL PAGE

HEADER: Amazon Intelligence       [Last sync: 2h ago]

STATS BAR:
Products Tracked | New Products Today | BSR Movers | Price Changes

SUB-TABS: [Products] [BSR Movers] [Sellers] [Reviews Intelligence]

─── PRODUCTS TAB ───
Same filter bar pattern as TikTok tab.

AMAZON-SPECIFIC COLUMNS:
ASIN | Product | BSR | Category | Est Sales/mo | Reviews | Price | FBA/FBM | TikTok Link | Score

TikTok Link: if this Amazon product was also detected on TikTok, show 🎵 icon
Clicking 🎵 → shows the cross-platform connection (viral products matched to Amazon)

Amazon-specific detail panel additions (in Row 5 of the Intelligence Chain):
- BSR history chart (30d)
- Price history chart (30d)
- Seller count history
- Review velocity (new reviews per week)
- FBA vs FBM breakdown
- Amazon PPC ad presence (detected or not)

─── BSR MOVERS TAB ───
Products that jumped significantly in BSR in the last 24/48/72h.
"These products are accelerating on Amazon right now."

Table: Product | Category | BSR Yesterday | BSR Today | Change | Est. Trigger | Score

BSR Change heatmap:
Green = improving BSR (lower number = better)
Red = declining

─── SELLERS TAB ───
Who is winning on Amazon for trended products?
Seller name | Products | Total Est Revenue | FBA% | Avg Review | Cross-platform presence
```

### 28.5 Shopify Intelligence (`/dashboard/shopify`)

```
SHOPIFY INTELLIGENCE — FULL PAGE

HEADER: Shopify Intelligence       [Last scan: 1h ago]

STATS BAR:
Stores Tracked | New Stores Today | Revenue Movers | Apps Intelligence

SUB-TABS: [Stores] [Products] [App Stack Analysis] [Traffic Intelligence]

─── STORES TAB ───
Find Shopify stores winning on products we've detected.

STORE TABLE:
Store Name | Domain | Est Revenue/mo | Top Products | Traffic Est | Apps Used | Launch Date | Score

STORE DETAIL (click row → right panel):
- Store overview: theme, design quality, product count
- Traffic sources (organic / paid / social breakdown)
- App stack (identified Shopify apps — Klaviyo, ReConvert, etc.)
- Top products with stats
- Ad spend signals
- AI analysis ✨: "This store launched 3 weeks ago, hit £45K revenue in month 1.
  They're running Advantage+ on Meta and TikTok Shop simultaneously.
  Product sourcing: likely from [Alibaba seller identified]."

─── APP STACK ANALYSIS TAB ───
What apps do winning Shopify stores use?
App | Category | Stores Using | Win Rate | Notes
────────────────────────────────────────────────────
Klaviyo | Email | 847 stores | 78% | Most used by 6-figure stores
ReConvert | Upsell | 312 stores | 82% | High correlation with revenue
Judge.me | Reviews | 1,241 stores | 71% | —
```

### 28.6 Pre-Viral Detection (`/dashboard/pre-viral`) — THE MOAT

This is the most differentiating feature of the platform. No competitor has it.

```
PRE-VIRAL DETECTION — FULL PAGE

HEADER:
Pre-Viral Detection ✨ AI          [Model: Predictive v1.3 · Accuracy: 84%]
[How this works →]

EXPLANATION BANNER (first-time only, dismissable):
"This engine analyzes early signals from Reddit, Pinterest, niche forums,
 and micro-creator content to identify products 2-4 weeks before they go viral.
 Products here have NOT gone mainstream yet. Act early."

SIGNAL STRENGTH METER:
[Weak signals] ○───────────────────● [Strong signals]
Filter: Show products with signal strength above [50%]

PRE-VIRAL PRODUCT TABLE:
Score │ Product │ Category │ Signal Sources │ Predicted Viral Date │ Confidence │ Status
──────────────────────────────────────────────────────────────────────────────────────────────
  91  │ Heated Eye Mask │ Wellness │ Reddit(3), Pinterest(847 saves), Niche blogs(12) │ ~Apr 7 │ 89% │ 🟡 Building
  84  │ Mini Projector  │ Tech     │ Reddit(7), YouTube comments(2.1K), eBay watchlist │ ~Apr 14 │ 76% │ 🟡 Building
  78  │ Posture Corrector│ Health   │ Pinterest(2.3K), Reddit(5), TikTok drafts(4)     │ ~Apr 21 │ 68% │ 🟢 Early

SIGNAL BREAKDOWN (per product, expandable):
Source          │ Signal Type          │ Strength │ Detected
Reddit          │ Posts with traction  │ ████░░   │ 3 days ago
Pinterest       │ Save velocity spike  │ ███████░ │ 5 days ago
Niche forums    │ Discussion threads   │ ████░░   │ 2 days ago
Micro-creators  │ Draft content detec. │ ████░░   │ 1 day ago

AI PREDICTION ✨ (streaming):
"Based on the pattern matching against 12,000 historical pre-viral products,
 this product has an 89% probability of reaching viral status within 18 days.
 The Pinterest save velocity matches the exact pattern seen with wireless earbuds
 3 weeks before they exploded on TikTok in Q4 2025."

[Set Viral Alert — notify me when this starts trending]
[Generate Pre-Launch Blueprint ✨]
```

### 28.7 Opportunity Feed (`/dashboard/opportunities`)

The Opportunity Feed is the engine's curated output — the top 20 opportunities right now, personalised to the user's category preferences and subscription tier.

```
OPPORTUNITY FEED — FULL PAGE

HEADER:
Your Opportunity Feed             Updated: 14 minutes ago  [Refresh ✨]
Personalised based on your category preferences and usage history.

PREFERENCE CONTROLS:
[Categories you follow: Electronics ✕  Wellness ✕  Tech ✕  [+ Add]]
[Min Opportunity Score: 70+]
[Product Types: Physical ✓  Digital ✓  SaaS/Affiliate ✓]

FEED (20 opportunities, sorted by AI score × urgency):

OPPORTUNITY CARD (large format):
┌─────────────────────────────────────────────────────────────────────┐
│ 🔥 HIGH OPPORTUNITY  ·  Score: 91/100  ·  Detected: 6 hours ago    │
│                                                                     │
│ [Product image]  AirTag Wallet Case — iPhone 16 Compatible          │
│                  Physical · Accessories · £8.50 COGS est.           │
│                                                                     │
│ WHY NOW? ✨ AI (streaming reveal):                                  │
│ "847 viral TikTok videos posted in 7 days. 3 mega-creators just    │
│  posted — triggering Amazon BSR improvement of 2,840 positions.    │
│  Only 12 Shopify stores selling it. Saturation window: ~3 weeks."  │
│                                                                     │
│ KEY SIGNALS:                                                        │
│ ████████░░  Social Proof: 89    ■ Low Saturation: ✓                │
│ █████████░  Predictive: 86      ■ Supply Available: ✓               │
│ ████████░░  Market Intel: 78    ■ Ad Spend Growing: ✓               │
│                                                                     │
│ QUICK STATS:  Est. £2,400/mo  ·  +312% 7d  ·  847 videos           │
│              12 TikTok Shops  ·  Low competition                   │
│                                                                     │
│ [View Full Intelligence →]  [Generate Blueprint ✨]  [★ Watch]     │
└─────────────────────────────────────────────────────────────────────┘

LOAD MORE: Shows 20 → 40 → 60 opportunities on demand
```

### 28.8 Creator Discovery (`/dashboard/creators`)

```
CREATOR DISCOVERY — FULL PAGE

HEADER: Creator Discovery          [2,891 creators tracked]

FILTER BAR:
[Platform: All/TikTok/Instagram/YouTube] [Size ▾] [Niche ▾] [Engagement ▾]
[Products mentioned ▾] [Location ▾] [Search creator handle...]

CREATOR TABLE:
Avatar │ Handle │ Followers │ Platform │ Eng Rate │ Niche │ Products Tracked │ Last Post │ Actions
──────────────────────────────────────────────────────────────────────────────────────────────────────
[img] │ @gadgetguru_uk │ 847K │ TikTok │ 8.4% │ Tech gadgets │ 23 products │ Today │ [View][✉]

CREATOR PROFILE (click → right panel):
- Profile header: avatar, name, handle, bio, platform links
- Audience breakdown: age, gender, location (if available)
- Engagement metrics: avg views, likes, comments, shares
- Product promotion history: all products they've posted about + performance
- Posting frequency: posts/week chart
- AI Match Score ✨: how aligned they are with current opportunity feed

OUTREACH MODULE:
[✉ Generate Outreach Email ✨]
→ Claude generates a personalised cold outreach email based on:
  - Creator's niche and recent posts
  - Your product you want them to promote
  - Platform-appropriate tone (TikTok vs YouTube vs Instagram)
  - Includes: hook, value proposition, CTA, compensation suggestion
→ Opens pre-filled email composer powered by Resend integration
```

### 28.9 Ad Intelligence (`/dashboard/ads`)

```
AD INTELLIGENCE — FULL PAGE

HEADER: Ad Intelligence            [Meta + TikTok + YouTube monitored]

STATS BAR:
Active Ads Tracked │ New Ads Today │ Spend Estimate Today │ Scaling Signals

PLATFORM TABS: [TikTok Ads] [Meta/Facebook Ads] [YouTube Ads] [All]

AD FEED (3-col grid, filterable):
Each ad tile:
┌──────────────────────────────┐
│  [Ad thumbnail/screenshot]   │
│  Platform: TikTok            │
│  Running: 14 days            │
│  Est. Daily Spend: £800-1.2K │
│  Product: AirTag Case        │
│  Format: Video · 15s         │
│  CTA: "Shop Now"             │
│  [View Ad] [Track] [★]       │
└──────────────────────────────┘

SPEND TIMELINE (top of page):
[Line chart — estimated total daily ad spend across all tracked products, 30d]
"When spend rises, product is scaling. When it drops, test may have failed."

SCALING SIGNALS TABLE:
Product │ Platform │ Ads Running │ Est Total Spend │ Spend Change 7d │ Status
─────────────────────────────────────────────────────────────────────────────────
AirTag Case │ TikTok │ 8 ads │ £12,400/mo │ +340% ↑ │ 🔥 Scaling Fast
USB-C Cable │ Meta   │ 3 ads │  £3,200/mo │ + 89% ↑ │ 📈 Growing
Posture Belt │ TikTok │ 1 ad │    £400/mo │   Flat  │ 🧪 Testing

AI INSIGHT ✨: "5 advertisers increased TikTok ad spend on charging accessories
 by a combined £28,000 this week. This is a strong commercial validation signal."
```

### 28.10 Watchlist (`/dashboard/watchlist`)

```
WATCHLIST — FULL PAGE

HEADER: My Watchlist               [47 products saved]

FILTER: [All] [High Score] [Price Changed] [New Activity] [Alerts Set]

WATCHLIST TABLE:
Product │ Platform │ Score │ Score Change │ Last Activity │ Alert Status │ Actions
──────────────────────────────────────────────────────────────────────────────────────
AirTag Case │ TikTok │ 84 ↑ +3 │ 2h ago │ 🔔 Alert: price drop │ [View][Edit Alert][✕]

ALERT CONFIGURATION (per product):
When saving to watchlist, configure:
- Alert me when: score changes by ±10 | new viral video detected | ad spend spikes |
                 competitor launches | price changes by ±X% | goes pre-viral
- Alert method: in-app | email | both

BULK MANAGEMENT:
[Export watchlist to Excel] [Share watchlist] [Clear old products]
```

### 28.11 Launch Blueprints (`/dashboard/blueprints`)

The Launch Blueprint is a premium Pro-tier feature powered by Claude Sonnet.

```
LAUNCH BLUEPRINTS — FULL PAGE

HEADER: My Launch Blueprints       [3 blueprints generated this month]
[Generate New Blueprint ✨ Pro]

BLUEPRINT CARD (for a saved blueprint):
┌─────────────────────────────────────────────────────────────────┐
│  AirTag Wallet Case — Launch Blueprint                          │
│  Generated: 22 Mar 2026                                         │
│                                                                 │
│  ● Product sourcing: 3 Alibaba suppliers with lead times       │
│  ● Platform strategy: TikTok Shop + Amazon FBA dual-launch     │
│  ● Creator outreach: 12 micro-creators identified + templates  │
│  ● Ad strategy: TikTok Spark Ads + Meta Advantage+ budget plan │
│  ● Pricing model: £14.99 → £19.99 pricing ladder              │
│  ● Financial model: break-even at 340 units (Day 23 projected) │
│  ● Risk assessment: Low saturation, 3-week window remaining    │
│                                                                 │
│  [View Full Blueprint] [Download PDF] [Share] [Regenerate ✨]  │
└─────────────────────────────────────────────────────────────────┘

GENERATE BLUEPRINT MODAL:
Step 1: Select product (from watchlist or search)
Step 2: Configure:
  - Target platform(s): [TikTok Shop ✓] [Amazon FBA ✓] [Own Shopify ✓]
  - Budget range: [£500-1,000 ▾]
  - Timeline: [Launch in 2 weeks ▾]
  - Experience level: [Intermediate ▾]
Step 3: Generate (Claude Sonnet streaming, takes 15-30s)
Step 4: Review, edit sections, save or export

BLUEPRINT SECTIONS (generated by Claude):
1. Executive Summary
2. Product Validation (why this product, why now)
3. Sourcing Plan (3 suppliers with pros/cons + contact template)
4. Platform Strategy (which platforms, in what order, why)
5. Creator Outreach Plan (10 creators, pitch angles, budget)
6. Content Strategy (hooks, formats, posting frequency)
7. Paid Ads Plan (platforms, budget, targeting, creative brief)
8. Pricing & Margin Model (COGS, selling price, contribution margin)
9. Financial Projections (30/60/90 day revenue estimates)
10. Risk Assessment & Mitigation (what could go wrong + how to handle)
11. 30-Day Launch Timeline (week-by-week action plan)
```

### 28.12 Digital Products, AI/SaaS & Affiliates (`/dashboard/digital`, `/dashboard/ai-saas`, `/dashboard/affiliates`)

```
These three tabs follow the same template as TikTok/Amazon/Shopify but for non-physical products.

DIGITAL PRODUCTS TAB:
Product types detected: Online courses, eBooks, templates, software, Notion templates, Canva packs
Sources scanned: Gumroad, Etsy (digital), Creative Market, Udemy, Teachable

Data shown:
- Product | Price | Est Sales/mo | Platform | Creator | Reviews | Growth 7d | Score

AI/SAAS AFFILIATES TAB:
Sources: PartnerStack, ShareASale, ClickBank, Impact.com
Shows AI tools, SaaS platforms offering affiliate commissions

Data shown:
- Tool Name | Category | Commission % | Cookie Duration | Est Monthly Payout | EPC | Score
- "EPC" = Earnings Per Click — the most important affiliate metric

PHYSICAL AFFILIATES TAB:
Amazon Associates, Impact, AWIN, Rakuten
Physical products with affiliate programs

All three tabs support the same filter bar and sorting system as the platform tabs.
Each product links to a full detail view with appropriate intelligence chain variant.
```

### 28.13 Alerts Center (`/dashboard/alerts`)

```
ALERTS CENTER — FULL PAGE

HEADER: My Alerts                  [3 new · 47 total]

TABS: [All] [New (3)] [Price] [Score] [Viral] [Competitor]

ALERT TIMELINE:
─────────────────────────────────────────────────────────────────────
🔥 NEW · 2h ago
AirTag Wallet Case — Opportunity score jumped from 71 → 84
Trigger: 847 new TikTok videos detected in 24h
[View product →] [Dismiss]

📉 NEW · 4h ago
USB-C Cable 3-Pack — Competitor launched Amazon listing at £9.99
Your tracked price was £14.99. Margin impact: -£1.20/unit
[View competitor →] [Adjust pricing strategy ✨] [Dismiss]

📌 READ · Yesterday
Heated Eye Mask — Pre-viral signal strengthened to 89%
Predicted viral date: April 7 ± 3 days
[View pre-viral analysis →]
─────────────────────────────────────────────────────────────────────

ALERT PREFERENCES:
[Manage all alert rules →] → opens alert config modal
Global: Email alerts [On ✓]  | Digest: [Daily at 09:00 ✓]
```

### 28.14 Usage & Plan (`/dashboard/usage`)

```
USAGE & PLAN — FULL PAGE

CURRENT PLAN:
★ PRO PLAN                          £149/month
Renews 1 May 2026 · Annual billing (saving £357/yr)
[Manage billing] [Cancel]

USAGE THIS PERIOD:
Products viewed:     2,341  / 10,000   [23%]  ██░░░░░░░░
AI queries:            891  /  2,000   [45%]  ████░░░░░░
Blueprints generated:    3  /      5   [60%]  ██████░░░░
Watchlist slots:        47  /    100   [47%]  ████░░░░░░
Creator searches:       89  /    500   [18%]  █░░░░░░░░░

PLAN COMPARISON (inline, if approaching limits):
"You've used 60% of your Blueprint allowance.
 Upgrade to Agency for unlimited blueprints."  [Compare plans →]

FEATURE UNLOCK STATUS:
Feature                    │ Your Plan │ Status
───────────────────────────────────────────────
Trending Products          │ Pro       │ ✓ Unlocked
Pre-Viral Detection        │ Pro       │ ✓ Unlocked
Launch Blueprints (5/mo)   │ Pro       │ ✓ Unlocked
AI Chat Assistant          │ Pro       │ ✓ Unlocked
API Access                 │ Agency    │ 🔒 Upgrade
White Label                │ Agency    │ 🔒 Upgrade
Custom Alerts (unlimited)  │ Agency    │ 🔒 Upgrade
```

### 28.15 Client Settings (`/dashboard/settings`)

```
SETTINGS — TABBED PAGE

TABS: [Profile] [Notifications] [Connected Platforms] [AI Preferences] [API]

PROFILE TAB:
Name, email, timezone, language preference, profile picture

NOTIFICATIONS TAB:
Email frequency: [Instant] [Daily digest at 09:00] [Weekly summary] [Off]
Alert types to receive: [Score changes ✓] [Viral detections ✓] [Price changes ✓]
                        [Pre-viral signals ✓] [Competitor moves ✓] [Briefing ✓]

CONNECTED PLATFORMS TAB:
Connect your own platforms to cross-reference:
[Shopify store URL] [Amazon Seller Central] [TikTok Creator account]
→ Cross-referencing enables "How does this product perform in MY store?" insights

AI PREFERENCES TAB:
My product categories (chips): [Electronics ✓] [Wellness ✓] [Fashion]
My target markets: [UK ✓] [USA ✓] [Europe]
Exclude from feed: [Adult products ✓] [High-risk categories]
AI tone: [Professional ▾] (controls briefing and blueprint language style)

API TAB (Pro+):
Your API key: [••••••••••••] [Copy] [Regenerate]
Documentation link → /docs/api
Rate limits: 1,000 calls/day (Pro), unlimited (Agency)
```

---

## 29. MARKETING WEBSITE — COMPLETE SPEC (All Gaps Closed)

### 29.1 Complete Page Structure

```
yousell.online/          Homepage
yousell.online/pricing   Pricing page
yousell.online/features  Features overview
yousell.online/features/trend-radar
yousell.online/features/ai-agents
yousell.online/features/pricing-intelligence
yousell.online/features/demand-forecasting
yousell.online/features/ai-briefings
yousell.online/integrations
yousell.online/about
yousell.online/blog
yousell.online/for-dropshippers
yousell.online/for-resellers
yousell.online/for-agencies
yousell.online/comparison/vs-fastmoss
yousell.online/comparison/vs-junglescout
yousell.online/comparison/vs-triple-whale
yousell.online/onboarding   (post-signup flow)
yousell.online/demo         (interactive demo, no signup required)
```

### 29.2 Navbar (Complete Spec)

```
NAVBAR — DESKTOP (72px height):

BEHAVIOUR:
- Transparent on hero section
- Transitions to solid background (brand-900 dark / white light) on scroll past 80px
- Backdrop blur when scrolled: backdrop-filter: blur(20px)
- Sticky (position: sticky, top: 0, z-50)

LAYOUT:
[yousell logo]  [Nav links]  [Right CTAs]

NAV LINKS (centre):
Products ▾ | Solutions ▾ | Pricing | Blog

Products dropdown:
  Trending Products | Pre-Viral Detection | Ad Intelligence
  Creator Discovery | Amazon Intelligence | Shopify Intelligence

Solutions dropdown:
  For Dropshippers | For Resellers | For Agencies | Enterprise

RIGHT CTAs:
[Log In]  [Get Started Free →] (primary CTA button, always visible)

MOBILE NAVBAR (hamburger):
[yousell logo]  [☰]
Clicking ☰ → full-screen overlay slide-in
All nav links listed vertically
[Get Started Free] at bottom (full-width button)
```

### 29.3 Homepage — Complete Section Flow

```
SECTION ORDER:

1. HERO (100vh)
   Background: animated aurora gradient mesh (CSS from Section 22.1 of Part 2)
   Badge: "✨ 25 AI Engines · 14 Platform Providers · Real-time Intelligence"
   H1: "Discover Winning Products
        Before Your Competitors Do"
   P: "yousell monitors TikTok, Amazon, Shopify and 11 more platforms 24/7.
       AI-powered intelligence tells you exactly what to sell, when, and why."
   CTAs: [Start Free Trial →] [Watch 2-min demo]
   Risk removal: "No credit card · 5 min setup · Cancel anytime"
   Below fold: animated product dashboard mockup (floating, subtle parallax)

2. SOCIAL PROOF BAR (auto-scrolling)
   "Trusted by 60,000+ ecommerce operators"
   Platform logos: Shopify, TikTok, Amazon, Alibaba, Ingram Micro
   Stat pills: [847K products tracked] [£55B revenue analysed] [60K+ operators]

3. PROBLEM STATEMENT (2-col, alternating)
   Left: "You're spending hours manually researching products..."
         List of pain points with ✕ marks
   Right: "yousell does it in seconds, 24/7..."
          List of solutions with ✓ marks
   CTA: [See how it works →]

4. THE INTELLIGENCE CHAIN (animated walkthrough)
   Show the 7-row product intelligence chain expanding step by step.
   User scrolls and each row animates in.
   Title: "Everything you need to know about a product. In one place."
   Interactive: user can click through a demo product.

5. FEATURE BENTO GRID (Section 5.1 of Part 1 — already spec'd)
   6 tiles showing key capabilities.

6. PRE-VIRAL MOAT (full-width section)
   "Find products 2-4 weeks before they go viral. Before your competitors even know they exist."
   Visual: timeline showing a product's journey from pre-viral signal → TikTok explosion
   Animated: dots appearing on the timeline
   CTA: [See current pre-viral products →]

7. PLATFORM COVERAGE (icon grid)
   "Monitoring 14 platforms so you don't have to"
   Icons: TikTok, Amazon, Shopify, Pinterest, Reddit, YouTube, eBay, Facebook, 
          Instagram, Alibaba, Etsy, AliExpress, Gumroad, PartnerStack
   Each with a brief "what we track from this platform" line

8. HOW IT WORKS (3-step)
   ① Connect (or don't — works without your store)
   ② Discover (AI scans 14 platforms every 4 hours)
   ③ Act (intelligence tells you exactly what to do next)

9. TESTIMONIALS (3 large cards)
   Specific outcomes, not vague praise.
   "[Name], [Store type], [City]"
   "Found 3 winning products in week 1. Two are now 30% of my revenue."

10. COMPETITOR COMPARISON TABLE
    "See how yousell compares"
    Feature | yousell | FastMoss | JungleScout | Triple Whale | Minea
    TikTok coverage     | ✓ | ✓ | ✗ | partial | ✓
    Amazon coverage     | ✓ | ✗ | ✓ | partial | ✗
    Shopify coverage    | ✓ | ✗ | ✗ | ✓ | partial
    Pre-viral detection | ✓ | ✗ | ✗ | ✗ | ✗
    AI briefings        | ✓ | ✗ | ✗ | partial | ✗
    Launch blueprints   | ✓ | ✗ | ✗ | ✗ | ✗
    Price               | from £49 | $67 | $49 | $129+ | $49

11. PRICING SECTION (abbreviated — link to full pricing page)
    3-tier preview with "See full pricing →" CTA

12. FINAL CTA (full-width, high contrast)
    "Start discovering winning products today."
    "Join 60,000+ operators who use yousell to find their next bestseller."
    [Start Free Trial →]  [Book a demo]
    "14-day free trial · No credit card · Cancel anytime"

13. FOOTER
```

### 29.4 Footer (Complete Spec)

```
FOOTER (4-col, dark background):

Col 1: Brand
  yousell logo
  "The intelligence layer for modern ecommerce"
  Social links: Twitter/X, LinkedIn, TikTok, YouTube

Col 2: Product
  Trending Products
  Pre-Viral Detection
  Ad Intelligence
  Creator Discovery
  Pricing
  Changelog

Col 3: Use Cases
  For Dropshippers
  For Resellers
  For Agencies
  Enterprise
  Compare vs FastMoss
  Compare vs JungleScout

Col 4: Company
  About
  Blog
  Careers
  Contact
  Privacy Policy
  Terms of Service
  Cookie Policy

BOTTOM BAR:
© 2026 yousell.online · All rights reserved
Built in London 🇬🇧 · Powered by 25 AI engines
```

### 29.5 About Page (`/about`)

```
ABOUT PAGE:

HERO:
"We built the tool we wished existed when we were dropshipping."

STORY (prose, 3 paragraphs):
Founder story — the frustration of manually researching products,
the insight that AI could monitor everything 24/7,
the decision to build yousell.

TEAM SECTION (if applicable — 3-4 cards with names, roles, photos)

MISSION STATEMENT:
"To give every ecommerce operator — regardless of size or budget —
 access to the same intelligence that billion-dollar brands use to dominate markets."

NUMBERS:
60,000+ operators | 14 platforms | 25 AI engines | £55B revenue tracked

PRESS MENTIONS (if any) / Media kit link

CTA: [Join yousell →]
```

### 29.6 SEO Landing Pages

```
These pages are pure SEO. Each targets a specific buyer persona.

/for-dropshippers:
  H1: "The Best Dropshipping Product Research Tool in 2026"
  Content: How yousell helps dropshippers specifically
  — Product discovery, supplier matching, TikTok trend detection
  CTA: [Find dropshipping winners free →]

/for-resellers:
  H1: "Product Intelligence for UK Resellers and Distributors"
  Content: How yousell helps bulk buyers and resellers
  — Demand forecasting, competitor pricing, B2B supplier intelligence
  CTA: [Start your free trial →]

/for-agencies:
  H1: "Product Research Platform for Ecommerce Agencies"
  Content: How agencies use yousell for clients
  — Multi-client management, white label, API access
  CTA: [Book an agency demo →]

/comparison/vs-fastmoss:
  H1: "yousell vs FastMoss — Which is Better in 2026?"
  Feature comparison table (honest, nuanced)
  FastMoss strength: TikTok depth
  yousell advantage: Multi-platform + AI briefings + pre-viral
  CTA: [Try yousell free →]
```

### 29.7 Interactive Demo Page (`/demo`)

```
DEMO PAGE (no signup required):

Header: "See yousell in action — no signup needed"

INTERACTIVE DEMO WIDGET:
- Pre-loaded with 5 real-looking sample products
- User can click through the full 7-row intelligence chain on sample products
- AI briefing card visible with sample content
- Platform tabs switchable
- "This is sample data. Sign up to see real-time intelligence." watermark
- [Start Free Trial →] button always visible

PURPOSE: Let users experience the product before committing to signup.
Conversion path: Demo → Signup (remove friction from first impression).
```

---

## 30. ADMIN DASHBOARD — REMAINING GAPS

### 30.1 Client Allocation System (`/admin/clients`)

This is admin-only. The admin allocates discovered products to client accounts.

```
CLIENT ALLOCATION — ADMIN PAGE

HEADER: Client Allocation          [24 clients · 847 allocations this week]

CLIENT TABLE:
Client Name │ Plan │ Assigned Products │ Active Since │ Last Login │ Usage │ Actions
─────────────────────────────────────────────────────────────────────────────────────
Acme Resellers │ Pro │ 47 products │ Jan 2026 │ Today │ 78% │ [Manage][Allocate]

ALLOCATION WORKFLOW:
1. Select client
2. Select products from the master discovery database
   (Client never sees all products — only what's allocated to them)
3. Set allocation rules:
   - Specific products: handpick 10 products
   - Category rules: "Always include top 5 Electronics"
   - Score threshold: "Automatically allocate any product scoring >80"
4. Set visibility start/end date (for time-limited opportunities)
5. Save → client sees products in their dashboard immediately

BULK ALLOCATION:
[Run auto-allocation for all Pro clients] — applies score threshold rules
[Export allocation report] — shows what each client was allocated and when
```

### 30.2 System Health Monitor — Enhanced

From the v9 spec (25 engines + 14 providers), the health monitor must cover all of them:

```
HEALTH MONITOR — ADMIN PAGE

ENGINE HEALTH (25 engines):
Category        │ Engine Name                │ Status │ Last Run │ Score │ Next Run
────────────────────────────────────────────────────────────────────────────────────────────
Discovery       │ TikTok Discovery           │ ● OK  │ 6m ago   │ 847   │ in 54m
Discovery       │ Product Extraction         │ ● OK  │ 6m ago   │ 2,341 │ in 54m
Discovery       │ Product Clustering         │ ● OK  │ 12m ago  │ 312   │ in 48m
Discovery       │ Trend Detection            │ ● OK  │ 6m ago   │ 94.2  │ in 54m
Discovery       │ Creator Matching           │ ● OK  │ 30m ago  │ 89    │ in 30m
Discovery       │ Amazon Intelligence        │ ⚠ Slow│ 2h ago   │ 1,241 │ in 4h
Discovery       │ Shopify Intelligence       │ ● OK  │ 1h ago   │ 891   │ in 1h
Discovery       │ Ad Intelligence            │ ● OK  │ 30m ago  │ 441   │ in 30m
Discovery       │ Opportunity Feed           │ ● OK  │ 8m ago   │ 20    │ in 52m
Discovery       │ Pre-Viral Detection        │ ● OK  │ 4h ago   │ 34    │ in 2h
Scoring         │ Market Intelligence        │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Predictive Analytics       │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Competitive Intelligence   │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Supply Chain               │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Social Proof               │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Pricing Intelligence       │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Content Intelligence       │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Visual Intelligence        │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Risk Assessment            │ ● OK  │ 30m ago  │ —     │ in 5.5h
Scoring         │ Automation                 │ ● OK  │ 30m ago  │ —     │ in 5.5h
Advanced        │ Composite Score Calculator │ ● OK  │ 35m ago  │ —     │ in 5.5h
Advanced        │ Profitability Engine       │ ● OK  │ 35m ago  │ —     │ in 5.5h
Advanced        │ Influencer Intelligence    │ ● OK  │ 1h ago   │ 89    │ in 1h
Advanced        │ Supplier Discovery         │ ● OK  │ 1h ago   │ 312   │ in 1h
Governor        │ Governor Engine            │ ● OK  │ 1m ago   │ —     │ always

PROVIDER HEALTH (14 providers):
TikTok | Amazon | Shopify | Pinterest | Reddit | YouTube | eBay | 
Facebook | Instagram | Alibaba | Etsy | AliExpress | Gumroad | PartnerStack
Each: Status | Rate limit | Calls today | Calls remaining | Last success
```

---

---

## 33. MISSING UI SPECS — AALPHA INTELLIGENCE INTEGRATION ADDENDUM

*These sections fill the remaining gaps identified in the quality audit.*

---

### 33.1 AI Model Routing UI (Aalpha TIP-014 — Model Router Pattern)

The AI Cost Dashboard (`/ai-costs`) must include a **Model Routing Visualiser** section:

```
MODEL ROUTING BREAKDOWN (live, last 24h):

Query Type         │ Model Used   │ Volume  │ Cost     │ Avg Latency
───────────────────────────────────────────────────────────────────────
FAQs & simple chat │ Claude Haiku │ 45,234  │ £8.40    │ 180ms
Pricing analysis   │ Claude Sonnet│  1,443  │ £27.60   │ 1,240ms
Briefings & synth  │ Claude Sonnet│     30  │ £5.40    │ 2,100ms
Recommendations    │ Claude Haiku │ 12,441  │ £3.56    │ 210ms
Content generation │ Claude Sonnet│    892  │ £10.20   │ 1,800ms
─────────────────────────────────────────────────────────────────────
                                             £55.16 total

MODEL SPLIT DONUT CHART:
Haiku: 74% of calls, 22% of cost
Sonnet: 26% of calls, 78% of cost

ROUTING RULES (editable by admin):
Query length < 50 tokens → Haiku
Contains "analyse", "forecast", "why" → Sonnet
Explicit blueprint request → Sonnet
All other → Haiku (default)

[Edit routing rules ✨] [View full audit log]
```

**Design notes:**
- Shows exactly where money is going and why
- Editable routing rules give admin control over cost vs quality tradeoff
- Donut chart uses chart-1 (Haiku) + chart-4 (Sonnet) colours from design tokens

---

### 33.2 RAG Search & Architecture Surface in UI

The following UI elements expose the RAG layer to users without them needing to understand it:

**In Client Dashboard — Search bar behaviour:**
```
When user types in the CMD+K search bar:
- Queries < 3 words: keyword filter (fast, free)
- Natural language queries: "wireless headsets under £100 for calls"
  → Route to RAG endpoint → pgvector cosine similarity search
  → Returns semantically matched products, not just keyword matches
  → Show subtle "✨ AI-matched" badge on results that came from semantic search
  → "Showing AI-matched results" label distinguishes from keyword results
```

**In Admin AI Cost Dashboard:**
```
RAG PIPELINE METRICS:
Embeddings stored:     847,221 product vectors
Last re-indexed:       Today 07:00 UTC
Embedding model:       text-embedding-3-small
Vector DB:             Supabase pgvector (hnsw index)
Avg query latency:     42ms
Cache hit rate:        78%
```

---

### 33.3 AI Observability Tools Surface (Aalpha TOOL-024 — Langfuse)

Add a **Request Trace Explorer** tab inside the AI Cost Dashboard (`/ai-costs`):

```
TABS within AI Cost Dashboard:
[Overview] [Cost Breakdown] [Model Routing] [Request Traces] [Quality Scores]

REQUEST TRACES TAB (powered by Langfuse or custom logging):
─────────────────────────────────────────────────────────────────────
Timestamp    │ Feature           │ Model  │ Tokens │ Latency │ Score
─────────────────────────────────────────────────────────────────────
14:32:01     │ Daily Briefing    │ Sonnet │ 1,847  │ 2.1s    │ 4/5 ★
14:31:58     │ Semantic Search   │ Haiku  │   234  │ 0.18s   │ —
14:31:44     │ Price Suggestion  │ Sonnet │ 3,441  │ 3.4s    │ 3/5 ★

QUALITY SCORES TAB:
- Collected via optional thumbs up/down on AI outputs in client dashboard
- Aggregated per feature per week
- Trendline: quality score vs time (should improve as model routes better)
- Admin can flag low-scoring sessions for manual review

INTEGRATION NOTE:
Use Langfuse SDK (npm: langfuse) for trace collection.
Or use custom ai_request_logs Supabase table (already defined in TIP-036).
Both options produce identical UI output.
```

---

### 33.4 Fraud Detection with Stripe Radar (Aalpha TOOL-022)

The Fraud Detection Dashboard (`/settings/fraud`) must reference Stripe Radar explicitly:

```
FRAUD LAYER ARCHITECTURE (shown as info card in admin):
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Stripe Radar (payment-level)                      │
│  ● Blocks fraudulent payment attempts automatically         │
│  ● No config needed — active by default on all Stripe txns  │
│  ● View Stripe Radar logs: [Open Stripe Dashboard →]        │
│                                                             │
│  Layer 2: Order anomaly detection (yousell ML)              │
│  ● Detects suspicious order patterns at the application     │
│    layer (before payment) using statistical anomaly models  │
│  ● Configurable rules — see table below                     │
│                                                             │
│  Layer 3: Bot protection (Cloudflare Turnstile)             │
│  ● Protects search and scan endpoints from automated abuse  │
│  ● Status: ● Active                                         │
└─────────────────────────────────────────────────────────────┘
```

---

### 33.5 Orchestration Tools in Architecture Notes

Add to the admin **System Architecture** info page (`/admin/setup/architecture`):

```
AI ORCHESTRATION STACK (read-only reference):
Tool          │ Role                              │ Where used
──────────────────────────────────────────────────────────────────
LangChain     │ LLM chaining and prompt templates │ Blueprint gen
LangGraph     │ Multi-agent orchestration         │ 25-engine coord
CrewAI        │ Role-based agent workflows        │ Discovery pipeline
Claude Haiku  │ Fast/cheap inference              │ 74% of AI calls
Claude Sonnet │ Deep reasoning                    │ 26% of AI calls
pgvector      │ Vector similarity search          │ Product search
Supabase Realtime │ Live engine status updates   │ Health monitor
BullMQ + Redis │ Job queue                        │ All workers
```

This page is informational — no interactive controls. It helps the admin team understand what's running.

---

### 33.6 V9 Platform Sections — Explicit 3-Section Architecture Note

At the top of Section 4 (Admin Dashboard Pages), add this architecture note:

```
ADMIN DASHBOARD — 3-PLATFORM ARCHITECTURE

The admin dashboard mirrors the platform's 3 core intelligence sections.
Each section has its own dedicated engine group, data tables, and admin controls:

┌────────────────────────────────────────────────────────────────────┐
│  SECTION A: TIKTOK INTELLIGENCE                                    │
│  Engines: TikTok Discovery, Product Extraction, Product Clustering,│
│           Trend Detection, Creator Matching                        │
│  Admin pages: /scan (TikTok config), /tiktok (product table),     │
│               /engines/tiktok (engine controls)                    │
│  Data: products, viral_videos, creator_profiles, tiktok_shops      │
├────────────────────────────────────────────────────────────────────┤
│  SECTION B: AMAZON INTELLIGENCE                                    │
│  Engines: Amazon Intelligence, Pricing Intelligence,               │
│           Supply Chain, Market Intelligence                        │
│  Admin pages: /amazon (product table), /pricing, /suppliers        │
│  Data: amazon_listings, price_history, competitor_tracking         │
├────────────────────────────────────────────────────────────────────┤
│  SECTION C: SHOPIFY INTELLIGENCE                                   │
│  Engines: Shopify Intelligence, Competitive Intelligence,          │
│           Profitability Engine, Influencer Intelligence            │
│  Admin pages: /shopify (store table), /customers, /blueprints      │
│  Data: shopify_stores, store_intelligence, launch_blueprints       │
└────────────────────────────────────────────────────────────────────┘

Cross-platform engines (operate across all 3 sections):
Governor · Composite Score · Social Proof · Content Intelligence ·
Visual Intelligence · Risk Assessment · Automation · Pre-Viral Detection ·
Ad Intelligence · Opportunity Feed
```

---

### 33.7 CANONICAL SECTION GUIDE

*This box must be the first thing Claude Code sees on every new session.*

```
CANONICAL REFERENCES (follow these sections only, ignore duplicates):

Execution Order:     Section 31 ONLY
Quality Gates:       Section 32 ONLY
Client Dashboard:    Sections 27–28 (NOT Section 5.2)
Admin Dashboard:     Sections 4, 20, 30 combined
Marketing Website:   Sections 5.1, 21, 29 combined
Design System:       Sections 2, 23 (tokens), Section 22 (visual effects)
Component Library:   Section 6 + Section 33 (this section)
Build Priority:      Client Dashboard (Phase 3) > Admin (Phase 2) > Marketing (Phase 4)
```

## 31. COMPLETE EXECUTION ORDER — FINAL (All 3 Surfaces)

This replaces the execution order from Section 12 (Part 1) and Section 25 (Part 2).

```
PHASE 0 — Foundation (no UI)
[ ] Install exact stack (Section 2.4)
[ ] globals.css with all design tokens
[ ] next-themes dark/light
[ ] Tailwind v4 config
[ ] Fonts: Cal Sans, DM Sans, JetBrains Mono
[ ] Root layout, admin layout, dashboard layout, marketing layout

PHASE 1 — Shared Design System
[ ] Design tokens (all CSS variables)
[ ] MetricCard component
[ ] AIInsightCard + StreamingText
[ ] Button states (all 5 variants)
[ ] DataTable (TanStack)
[ ] Chart components (Recharts + Tremor)
[ ] Empty states (6 variants)
[ ] Skeleton system
[ ] Toast system (Sonner)
[ ] CMD+K command palette
[ ] Breadcrumb component
[ ] Top bar (shared base)
[ ] Sidebar (admin variant)

PHASE 2 — Admin Dashboard
[ ] Admin layout + sidebar with all 35 nav items
[ ] Main dashboard (/)
[ ] TikTok/Amazon/Shopify intelligence pages
[ ] Scan Control Panel
[ ] Pricing Intelligence
[ ] Demand Forecast
[ ] AI Cost Dashboard
[ ] Health Monitor (all 25 engines + 14 providers)
[ ] User Management
[ ] Billing & Subscriptions
[ ] Fraud Detection
[ ] A/B Test Manager
[ ] RFM Segmentation
[ ] Churn Risk
[ ] Supplier Performance
[ ] Price Elasticity Config
[ ] Client Allocation System
[ ] Feedback Loop & Model Health
[ ] Revenue & Attribution
[ ] Order Insights
[ ] System Logs

PHASE 3 — Client Dashboard (HIGHEST PRIORITY)
[ ] Client layout (top bar + platform tabs + collapsible sidebar)
[ ] Trending Now home (/dashboard) — product grid, AI briefing, filters
[ ] Product Detail page (/dashboard/product/[id]) — full 7-row chain
[ ] Universal Intelligence Chain component (reusable, all 7 rows)
[ ] TikTok Intelligence (/dashboard/tiktok) — all 5 sub-tabs
[ ] Amazon Intelligence (/dashboard/amazon)
[ ] Shopify Intelligence (/dashboard/shopify)
[ ] Pre-Viral Detection (/dashboard/pre-viral)
[ ] Opportunity Feed (/dashboard/opportunities)
[ ] Creator Discovery (/dashboard/creators)
[ ] Ad Intelligence (/dashboard/ads)
[ ] Watchlist (/dashboard/watchlist)
[ ] Launch Blueprints (/dashboard/blueprints)
[ ] Digital Products tab
[ ] AI/SaaS Affiliates tab
[ ] Physical Affiliates tab
[ ] Alerts Center (/dashboard/alerts)
[ ] Usage & Plan (/dashboard/usage)
[ ] Client Settings (/dashboard/settings)

PHASE 4 — Marketing Website
[ ] Navbar (transparent → solid, mobile hamburger)
[ ] Homepage (all 13 sections in order)
[ ] Footer (4-col + bottom bar)
[ ] Pricing page (3 tiers, feature table, ROI calculator, FAQ)
[ ] Feature pages (5 pages using template)
[ ] Integrations page (50+ integrations, connection status)
[ ] About page
[ ] Comparison pages (vs FastMoss, vs JungleScout, vs Triple Whale)
[ ] SEO landing pages (dropshippers, resellers, agencies)
[ ] Interactive demo page (/demo)

PHASE 5 — Onboarding Flow
[ ] 6-step onboarding (/onboarding)
[ ] First-login tour beacons
[ ] Role-based dashboard personalisation
[ ] Empty states for new accounts

PHASE 6 — Mobile & Polish
[ ] Gesture system (@use-gesture/react)
[ ] Mobile bottom navigation (client dashboard)
[ ] All responsive breakpoints audit
[ ] Framer Motion page transitions
[ ] All hover/focus/active states audit
[ ] Accessibility audit (WCAG 2.1)
[ ] Performance audit (Core Web Vitals)
[ ] High contrast mode
```

---

## 32. COMPLETE QUALITY GATES (Final — All 3 Surfaces)

```
CLIENT DASHBOARD SPECIFIC:
☐ 7-row Universal Intelligence Chain renders correctly for all product types
☐ Platform tabs switch without full page reload
☐ Product cards expand inline (not navigate to new page) on Trending Now
☐ Product detail page renders all 7 rows with correct data per row
☐ Pre-viral section shows confidence scores and predicted dates
☐ AI streaming text reveals correctly in Row 7 (Opportunity Score)
☐ Creator outreach email generation works via Claude API
☐ Launch Blueprint generation streams correctly (15-30s expected)
☐ Watchlist alerts configurable per-product with correct triggers
☐ All sub-tabs in TikTok/Amazon/Shopify sections functional
☐ Client sees ONLY allocated products (RLS enforced)
☐ Usage meters accurate and update in real-time

MARKETING WEBSITE SPECIFIC:
☐ Navbar transparent on hero → solid on scroll (smooth transition)
☐ All 13 homepage sections present in correct order
☐ Interactive demo works without signup
☐ Competitor comparison table accurate and honest
☐ ROI calculator is functional and interactive
☐ All 5 feature pages use consistent template
☐ Footer links all resolve (no 404s)
☐ Integrations page shows 50+ integrations with correct categories
☐ SEO landing pages have unique H1s and relevant content
☐ Mobile homepage tested at 375px, 390px, 430px widths

ADMIN DASHBOARD SPECIFIC:
☐ Health monitor shows all 25 engines + 14 providers
☐ Client allocation workflow complete (select client → allocate → save)
☐ All 25 engine status cards render with correct status indicators
☐ Engine controls (pause/resume/configure) functional

CROSS-SURFACE:
☐ Design tokens consistent across all 3 surfaces
☐ dark/light mode works on all 3 surfaces
☐ No hardcoded colours anywhere
☐ All AI features have ✨ badge + confidence indicator
☐ All streaming AI content has aria-live="polite"
☐ CMD+K works on admin and client dashboard
☐ Supabase RLS prevents client from seeing admin routes
☐ Admin cannot accidentally be exposed to client users
```
