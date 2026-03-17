# YOUSELL Platform — Comprehensive Use Case Diagram

## Version 2.1 — 2026-03-17
## Based on: v8 Spec + Session 3 Business Requirements + POD Channel #8 + Admin Command Center + Affiliate Commission Engine + Engine Independence Architecture

---

## ACTORS

```
┌─────────────────────────────────────────────────────────────┐
│                        ACTORS                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 SUPER ADMIN     — Platform owner, full access            │
│  👤 ADMIN           — Operator, manages discovery + clients  │
│  👤 CLIENT          — Subscribed business user               │
│  👤 VIEWER          — Read-only client team member           │
│                                                              │
│  🤖 SYSTEM (Batch)  — Nightly/periodic background jobs       │
│  🤖 SYSTEM (Webhook)— Inbound events from platforms          │
│  🌐 EXTERNAL APIs   — Apify, Keepa, Stripe, Ayrshare, etc.  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## SYSTEM BOUNDARY: YOUSELL PLATFORM

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          YOUSELL PLATFORM                                    ║
║                                                                              ║
║  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐  ║
║  │   MAIN WEBSITE      │  │  ADMIN DASHBOARD     │  │  CLIENT DASHBOARD    │  ║
║  │   (yousell.online)  │  │(admin.yousell.online)│  │  (yousell.online/    │  ║
║  │                     │  │                      │  │      dashboard)      │  ║
║  │ • Landing page      │  │ • Intelligence HQ    │  │ • Product discovery  │  ║
║  │ • Pricing           │  │ • Product mgmt       │  │ • Content studio     │  ║
║  │ • Signup/Login      │  │ • Client mgmt        │  │ • Shop connect       │  ║
║  │ • Features          │  │ • Scan control        │  │ • Order tracking     │  ║
║  │                     │  │ • AI Affiliate (P3)*  │  │ • Integrations       │  ║
║  └─────────────────────┘  │ • Data imports        │  │ • Billing            │  ║
║                           │ • POD Intelligence    │  └──────────────────────┘  ║
║                           │ • Command Center**    │                            ║
║                           │ • Affiliate Engine*** │                            ║
║                           └─────────────────────┘                             ║
║                                                                               ║
║  * AI Affiliate module: ADMIN-ONLY, never visible to clients                  ║
║  ** Command Center: YOUSELL's own shops, one-click product publishing         ║
║  *** Affiliate Engine: Dual revenue tracking (internal content + client svc)  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## USE CASE 1: PRODUCT DISCOVERY & INTELLIGENCE

### 1A: Physical Product Discovery (Dropship + Wholesale)

```
┌────────────────────────────────────────────────────────────────────┐
│                 UC-1A: PHYSICAL PRODUCT DISCOVERY                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ADMIN ──→ [Trigger Product Scan]                                  │
│              │                                                     │
│              ├──→ Quick Scan (TikTok + Amazon)                     │
│              ├──→ Full Scan (All 8 channels)                      │
│              └──→ Client-Mode Scan (Top 50, 2 platforms)           │
│                                                                    │
│  SYSTEM ──→ [Batch Discovery] (nightly/weekly)                     │
│              │                                                     │
│              ├──→ Scrape TikTok Shop (Apify)                       │
│              ├──→ Scrape Amazon BSR (Apify + Keepa API)            │
│              ├──→ Scrape Shopify stores (Apify)                    │
│              ├──→ Scrape Pinterest trends (Apify)                  │
│              └──→ Import admin CSV (FastMoss/Kalodata exports)     │
│                                                                    │
│  OUTPUT: Each product gets tagged with:                            │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ • 3-pillar score (trend 40% + viral 35% + profit 25%)   │      │
│  │ • Score tier: HOT / WARM / WATCH / COLD                 │      │
│  │ • Trend stage: emerging / rising / exploding / saturated │      │
│  │ • Fulfillment recommendation: DROPSHIP / WHOLESALE /     │      │
│  │   AFFILIATE (auto-determined by product attributes)      │      │
│  │ • Best marketing platform recommendation                │      │
│  │ • Best sales channel recommendation                     │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                    │
│  FULFILLMENT DECISION LOGIC:                                       │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ IF physical + price < $30 + fast-ship supplier exists    │      │
│  │   → DROPSHIP (recommend US/EU fulfillment partner)      │      │
│  │                                                          │      │
│  │ IF physical + price $30-100 + high demand signal         │      │
│  │   → WHOLESALE (recommend Faire/Alibaba + FBA/3PL)       │      │
│  │                                                          │      │
│  │ IF physical + price > $100                               │      │
│  │   → WHOLESALE ONLY (brand building required)            │      │
│  │                                                          │      │
│  │ IF physical + supplier offers dropship API               │      │
│  │   → SHOW BOTH OPTIONS with margin comparison            │      │
│  │                                                          │      │
│  │ ALWAYS: Show margin comparison table for all viable      │      │
│  │ fulfillment models side-by-side                          │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

### 1B: Digital Product Discovery (Dropship/Affiliate Only)

```
┌────────────────────────────────────────────────────────────────────┐
│                UC-1B: DIGITAL PRODUCT DISCOVERY                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ADMIN ──→ [Scan Digital Products]                                 │
│              │                                                     │
│              ├──→ Scan Etsy (printables, templates, planners)      │
│              ├──→ Scan Gumroad (eBooks, courses, AI prompts)       │
│              ├──→ Scan Amazon KDP (trending eBooks)                │
│              ├──→ Scan Creative Market (design assets)             │
│              └──→ Scan ClickBank (digital offers with affiliate)   │
│                                                                    │
│  OUTPUT: Each digital product gets:                                │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ • 3-pillar score (adapted for digital: no shipping)     │      │
│  │ • Category: printable / ebook / template / course /      │      │
│  │   AI prompt / software / design asset                   │      │
│  │ • Fulfillment: DIGITAL DELIVERY (always)                │      │
│  │ • Revenue model recommendation:                         │      │
│  │   - CREATE OWN VERSION + sell direct (highest margin)   │      │
│  │   - AFFILIATE LINK to existing product (zero effort)    │      │
│  │   - LICENSE & RESELL (if available)                     │      │
│  │ • Marketing channel recommendation:                     │      │
│  │   Printables → Pinterest + Etsy SEO                     │      │
│  │   eBooks → Amazon KDP + blog SEO                        │      │
│  │   Templates → TikTok tutorials + Etsy                   │      │
│  │   Courses → YouTube + email funnel                      │      │
│  │   AI Prompts → TikTok + Gumroad                         │      │
│  │ • Affiliate program details (if exists):                │      │
│  │   Commission %, cookie duration, signup URL             │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                    │
│  CLIENT SELLING OPTIONS:                                           │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Option A: Link to TikTok/Amazon via influencer campaign │      │
│  │   → Use product publisher's affiliate link              │      │
│  │   → Earn commission per sale                            │      │
│  │   → YOUSELL generates marketing content                 │      │
│  │                                                          │      │
│  │ Option B: Create Shopify page/website                   │      │
│  │   → Product review page with affiliate CTA              │      │
│  │   → OR: Host own digital product with checkout          │      │
│  │   → Use YOUSELL content engine for marketing            │      │
│  │                                                          │      │
│  │ Option C: Direct platform sale                          │      │
│  │   → List on Etsy / Gumroad / Amazon KDP directly       │      │
│  │   → YOUSELL provides SEO + content + trend data         │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

### 1C: AI Affiliate Discovery (ADMIN-ONLY — Internal Revenue)

```
┌────────────────────────────────────────────────────────────────────┐
│         UC-1C: AI AFFILIATE INTELLIGENCE (ADMIN-ONLY)              │
│         ⚠️  NOT VISIBLE TO CLIENTS — INTERNAL REVENUE ONLY        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SUPER ADMIN ──→ [Manage AI Affiliate Programs]                    │
│                    │                                               │
│                    ├──→ Add/update AI platform entries              │
│                    │    (40+ programs: Copy.ai 45%, Jasper 30%,    │
│                    │     Writesonic 30%, ManyChat 35%, etc.)       │
│                    │                                               │
│                    ├──→ Score programs by revenue potential         │
│                    │    RevScore = Commission% × AvgPrice ×        │
│                    │    Cookie × ConversionRate                    │
│                    │                                               │
│                    └──→ Set campaign strategy per program          │
│                         (blog review, YouTube tutorial, TikTok     │
│                          demo, email spotlight, influencer push)   │
│                                                                    │
│  SYSTEM ──→ [Auto-Generate AI Affiliate Content]                   │
│              │                                                     │
│              ├──→ Generate blog reviews (SEO-optimized)            │
│              ├──→ Generate YouTube scripts (tutorials)             │
│              ├──→ Generate TikTok scripts (quick demos)            │
│              ├──→ Generate email newsletter content                │
│              └──→ Generate comparison articles                     │
│                                                                    │
│  SYSTEM ──→ [Publish to YOUSELL's Own Channels]                    │
│              │                                                     │
│              ├──→ Post to YOUSELL blog/review site                 │
│              ├──→ Post to YOUSELL social accounts (Ayrshare)       │
│              ├──→ Send to YOUSELL email newsletter (Resend)        │
│              └──→ Engage micro-influencers for amplification       │
│                                                                    │
│  ADMIN DASHBOARD ──→ [Track AI Affiliate Revenue]                  │
│              │                                                     │
│              ├──→ Revenue per program                              │
│              ├──→ Revenue per content type                         │
│              ├──→ Revenue per channel                              │
│              ├──→ Influencer ROI per campaign                      │
│              ├──→ Monthly/annual total affiliate income            │
│              └──→ Top performing programs                          │
│                                                                    │
│  RATIONALE FOR KEEPING INTERNAL:                                   │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ 1. Competitor protection: Exposing AI tools reveals      │      │
│  │    direct competitors (content gen platforms)            │      │
│  │ 2. Revenue protection: Clients would bypass YOUSELL     │      │
│  │    and promote AI tools directly                        │      │
│  │ 3. Strategic advantage: YOUSELL builds authority as     │      │
│  │    AI review platform, earning passive income           │      │
│  │ 4. Future option: Can expose as premium Enterprise      │      │
│  │    feature later when strategy is more mature           │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 2: DATA INTELLIGENCE & POOLING

### 2A: Pre-Computed Intelligence (Fallback Strategy)

```
┌────────────────────────────────────────────────────────────────────┐
│              UC-2A: PRE-COMPUTED INTELLIGENCE ENGINE                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SYSTEM (Nightly) ──→ [Batch Intelligence Processing]              │
│    2:00 AM UTC daily                                               │
│    │                                                               │
│    ├──→ Rescore ALL active products (3-pillar recalc)              │
│    ├──→ Update trend stages (emerging→rising→exploding→saturated)  │
│    ├──→ Store score snapshots (for trend detection)                │
│    ├──→ Generate recommendation caches per client                  │
│    ├──→ Compute dashboard widgets:                                 │
│    │      • "Today's Hot Products" (top 10 by final_score)        │
│    │      • "Rising Stars" (score increase >10% in 7d)            │
│    │      • "New Opportunities" (last 48h, score >60)             │
│    │      • "Seasonal Picks" (upcoming trends)                    │
│    │      • "Category Leaders" (top per category)                 │
│    ├──→ Compute "Best for You" per client (platform + niche match)│
│    └──→ Send daily digest email (hot products + opportunities)    │
│                                                                    │
│  SYSTEM (Tiered Refresh) ──→ [Priority-Based Data Refresh]         │
│    │                                                               │
│    ├──→ HOT products (80+):  Refresh every 6 hours                │
│    ├──→ WARM products (60-79): Refresh every 24 hours             │
│    ├──→ WATCH products (40-59): Refresh every 48 hours            │
│    └──→ COLD products (<40): Refresh weekly                       │
│                                                                    │
│  SYSTEM (Weekly) ──→ [Deep Discovery Scan]                         │
│    Sunday 3:00 AM UTC                                              │
│    │                                                               │
│    ├──→ Full platform scan (all 8 channels)                       │
│    ├──→ New influencer discovery                                  │
│    ├──→ Supplier database refresh                                 │
│    ├──→ Cross-platform validation                                 │
│    └──→ Trend keyword refresh                                     │
│                                                                    │
│  CLIENT ──→ [Request Live Scan] (only when explicitly requested)   │
│    │                                                               │
│    ├──→ Shows cached/pre-computed data IMMEDIATELY                │
│    ├──→ If user clicks "Scan Now" → queue live scrape             │
│    ├──→ Show "Updating..." with progress bar                      │
│    └──→ Notify when fresh data is ready                           │
│                                                                    │
│  KEY PRINCIPLE:                                                    │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ PRE-COMPUTE EVERYTHING. LIVE-SCRAPE NOTHING.             │      │
│  │ Unless the client explicitly clicks "Scan Now".          │      │
│  │ Client should NEVER wait for scraping on page load.      │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

### 2B: Multi-Source Data Import & Fusion

```
┌────────────────────────────────────────────────────────────────────┐
│              UC-2B: MULTI-SOURCE DATA FUSION                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ADMIN ──→ [Import External Data]                                  │
│    │                                                               │
│    ├──→ Upload Keepa CSV export (Amazon price/BSR history)        │
│    ├──→ Upload FastMoss CSV export (TikTok product analytics)     │
│    ├──→ Upload Kalodata CSV export (TikTok sales/creator data)    │
│    ├──→ Upload manual spreadsheet (any curated data)              │
│    └──→ Connect Google Sheet (live sync, auto-refresh)            │
│                                                                    │
│  IMPORT FLOW:                                                      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ 1. Admin uploads CSV/Excel                               │      │
│  │ 2. System auto-detects source (Keepa/FastMoss/Kalodata)  │      │
│  │ 3. Pre-built column mapping applied                      │      │
│  │ 4. Preview: New (X) / Update (Y) / Skip (Z)             │      │
│  │ 5. Admin confirms import                                 │      │
│  │ 6. Products merged into DB (dedup by ID/URL/title)       │      │
│  │ 7. Scores recalculated with enriched data                │      │
│  │ 8. Import logged in import_history table                 │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                    │
│  SYSTEM ──→ [Keepa API Integration] (automated)                    │
│    │                                                               │
│    ├──→ Enrich Amazon products with price history                 │
│    ├──→ Fetch BSR trends for tracked ASINs                        │
│    ├──→ Monitor deal alerts (lightning deals, price drops)         │
│    └──→ Nightly batch: Top 100 Amazon products enriched           │
│                                                                    │
│  DATA FUSION ENGINE:                                               │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ SOURCES (weighted by reliability):                        │      │
│  │                                                           │      │
│  │  Keepa API ─────────── (0.95) ─┐                         │      │
│  │  Amazon SP-API ──────── (0.95) ─┤                         │      │
│  │  TikTok Shop API ───── (0.90) ─┤                         │      │
│  │  Admin CSV (Kalodata) ─ (0.85) ─┤    ┌──────────────┐    │      │
│  │  Admin CSV (FastMoss) ─ (0.85) ─┼──→ │ FUSION ENGINE │    │      │
│  │  Admin manual entry ─── (0.80) ─┤    │ Normalize     │    │      │
│  │  Apify scraping ─────── (0.70) ─┤    │ Deduplicate   │    │      │
│  │  Google Trends ──────── (0.60) ─┤    │ Weight        │    │      │
│  │  Estimates ──────────── (0.50) ─┘    │ Score         │    │      │
│  │                                       └──────┬───────┘    │      │
│  │                                              │            │      │
│  │                                    ┌─────────▼─────────┐  │      │
│  │                                    │ products table     │  │      │
│  │                                    │ (enriched, scored) │  │      │
│  │                                    └───────────────────┘  │      │
│  │                                                           │      │
│  │ FRESHNESS DECAY:                                          │      │
│  │  <1hr: 1.0 | <6hr: 0.95 | <24hr: 0.85 | <7d: 0.50      │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 3: SCORING & INTELLIGENCE ENGINE

```
┌────────────────────────────────────────────────────────────────────┐
│             UC-3: PRODUCT SCORING & RECOMMENDATIONS                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SYSTEM ──→ [3-Pillar Scoring]                                     │
│    │                                                               │
│    ├──→ Trend Score (40%):                                        │
│    │     TikTok Growth (0.35) + Influencer Activity (0.25) +      │
│    │     Amazon Demand (0.20) + Competition (-0.10) + Margin(0.10)│
│    │                                                               │
│    ├──→ Viral Score (35%):                                        │
│    │     Micro-Influencer Convergence (0.25) +                    │
│    │     Purchase Intent (0.20) + Hashtag Accel (0.20) +          │
│    │     Niche Expansion (0.15) + Engagement Vel (0.10) +         │
│    │     Supply Response (0.10)                                   │
│    │                                                               │
│    └──→ Profit Score (25%):                                       │
│          Margin (0.40) + Shipping (0.20) + Marketing Eff (0.20) + │
│          Supplier Reliability (0.10) - Operational Risk (0.10)    │
│                                                                    │
│  SYSTEM ──→ [Fulfillment Intelligence] (NEW — Point 1 & 2)        │
│    │                                                               │
│    ├──→ Auto-classify product type:                               │
│    │     physical_dropship | physical_wholesale | digital |        │
│    │     affiliate_physical | affiliate_digital | affiliate_ai    │
│    │                                                               │
│    ├──→ For PHYSICAL products, recommend:                         │
│    │     ┌─────────────────────────────────────────────┐          │
│    │     │ DROPSHIP option:                            │          │
│    │     │  • Supplier link, est. margin, ship time    │          │
│    │     │  • Best platform: TikTok/Amazon/Shopify     │          │
│    │     │  • Content type: UGC, unboxing, review      │          │
│    │     ├─────────────────────────────────────────────┤          │
│    │     │ WHOLESALE option (if applicable):           │          │
│    │     │  • MOQ, unit price, FBA fees, est. margin   │          │
│    │     │  • Best platform: Amazon FBA / Shopify DTC  │          │
│    │     │  • Content type: brand story, lifestyle     │          │
│    │     ├─────────────────────────────────────────────┤          │
│    │     │ MARGIN COMPARISON TABLE (side-by-side)      │          │
│    │     └─────────────────────────────────────────────┘          │
│    │                                                               │
│    ├──→ For DIGITAL products, recommend:                          │
│    │     ┌─────────────────────────────────────────────┐          │
│    │     │ CREATE & SELL option (highest margin):      │          │
│    │     │  • Platform: Etsy/Gumroad/Shopify/KDP       │          │
│    │     │  • Est. margin: 70-95%                      │          │
│    │     │  • Content: Tutorial, mockup, demo          │          │
│    │     ├─────────────────────────────────────────────┤          │
│    │     │ AFFILIATE option (zero effort):             │          │
│    │     │  • Commission: 4.5-75%                      │          │
│    │     │  • Link: Affiliate signup URL               │          │
│    │     │  • Content: Review, comparison, listicle    │          │
│    │     ├─────────────────────────────────────────────┤          │
│    │     │ SHOPIFY HUB option:                         │          │
│    │     │  • Create review page with affiliate CTAs   │          │
│    │     │  • Mix own products + affiliate recs        │          │
│    │     └─────────────────────────────────────────────┘          │
│    │                                                               │
│    └──→ Auto-rejection rules (8 total):                           │
│          Margin <40% | Ship >30% | Break-even >2mo |              │
│          Fragile no cert | Delivery >15d | IP risk |              │
│          Price <$10 | 100+ competitors                            │
│                                                                    │
│  SYSTEM ──→ [Smart Recommendations per Client]                     │
│    │                                                               │
│    ├──→ Match products to client's connected platforms             │
│    ├──→ Match products to client's niche/category preference      │
│    ├──→ Match products to client's subscription tier               │
│    └──→ Rank by: score × platform match × niche fit               │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 4: CONTENT CREATION & MARKETING

```
┌────────────────────────────────────────────────────────────────────┐
│             UC-4: CONTENT CREATION & MARKETING ENGINE               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CLIENT ──→ [Generate Marketing Content]                           │
│    │                                                               │
│    ├──→ Select product from dashboard                             │
│    ├──→ Choose content type:                                      │
│    │     • Social post (TikTok, Instagram, Pinterest, Twitter)    │
│    │     • Ad copy (TikTok Ads, Meta Ads, Google Ads)             │
│    │     • Video script (short-form TikTok, long-form YouTube)    │
│    │     • Email sequence (welcome, launch, abandoned cart)        │
│    │     • Blog/SEO post (review, comparison, tutorial)           │
│    │     • Product description (per-platform optimized)           │
│    │     • Influencer brief (outreach + talking points)           │
│    │     • Launch announcement (multi-channel)                    │
│    ├──→ Content generated using brand voice config                │
│    ├──→ Client reviews/edits in content library                   │
│    └──→ Approves for publishing                                   │
│                                                                    │
│  PLATFORM-SPECIFIC CONTENT OUTPUT:                                 │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ TikTok:  Video script + trending hashtags + hook line    │      │
│  │ Amazon:  A+ listing copy + backend keywords + bullet pts │      │
│  │ Shopify: Product page copy + meta desc + SEO tags        │      │
│  │ Pinterest: Pin description + board suggestions + SEO     │      │
│  │ Digital: Course/template description + benefit bullets   │      │
│  │ Affiliate: Review post + comparison table + CTA         │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                    │
│  CLIENT ──→ [Publish Content]                                      │
│    │                                                               │
│    ├──→ Direct publish via Ayrshare (13+ platforms)               │
│    ├──→ Schedule for optimal posting time                         │
│    ├──→ Download for manual upload (TikTok fallback)              │
│    └──→ Track engagement metrics                                  │
│                                                                    │
│  CONTENT ↔ FULFILLMENT MODEL ALIGNMENT:                            │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Dropship product → UGC-style content, unboxing scripts  │      │
│  │ Wholesale product → Brand story, lifestyle content       │      │
│  │ Digital product → Tutorial, demo, screen recording       │      │
│  │ Affiliate product → Review, comparison, "best of" list  │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 5: SHOP CONNECT & SELLING

```
┌────────────────────────────────────────────────────────────────────┐
│              UC-5: SHOP CONNECT & ORDER TRACKING                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CLIENT ──→ [Connect Sales Channels]                               │
│    │                                                               │
│    ├──→ Connect Shopify store (OAuth)                             │
│    ├──→ Connect TikTok Shop (OAuth + HMAC signing)                │
│    ├──→ Connect Amazon seller account (LWA OAuth)                 │
│    └──→ Connect social platforms for publishing (Ayrshare)        │
│                                                                    │
│  CLIENT ──→ [Push Product to Store]                                │
│    │                                                               │
│    ├──→ Select product from allocated list                        │
│    ├──→ Choose target store (Shopify / TikTok / Amazon)           │
│    ├──→ Review auto-filled product metadata                       │
│    │     (title, description, price, images — from content engine)│
│    ├──→ Select fulfillment model:                                 │
│    │     • Dropship (link to supplier)                            │
│    │     • Wholesale (FBA / self-fulfill)                         │
│    │     • Affiliate (redirect to publisher link)                 │
│    │     • Digital (auto-deliver file/link)                       │
│    └──→ Click "Push to Store" → product live on platform          │
│                                                                    │
│  SYSTEM ──→ [Track Orders]                                         │
│    │                                                               │
│    ├──→ Shopify order webhooks → orders table                     │
│    ├──→ TikTok Shop order webhooks → orders table                 │
│    ├──→ Amazon order reports (polling) → orders table             │
│    └──→ Track: placed → processing → shipped → delivered          │
│                                                                    │
│  SYSTEM ──→ [Order Email Sequences] (5-step via Resend)            │
│    │                                                               │
│    ├──→ Order confirmation                                        │
│    ├──→ Shipping notification                                     │
│    ├──→ Delivery confirmation                                     │
│    ├──→ Review request                                            │
│    └──→ Cross-sell recommendation                                 │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 6: INFLUENCER & SUPPLIER INTELLIGENCE

```
┌────────────────────────────────────────────────────────────────────┐
│           UC-6: INFLUENCER & SUPPLIER MATCHING                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SYSTEM ──→ [Discover Influencers]                                 │
│    │                                                               │
│    ├──→ Scan TikTok creators (Apify + ScrapeCreators)             │
│    ├──→ Scan Instagram profiles (Apify)                           │
│    ├──→ Score by: niche alignment (35%) + engagement (30%) +      │
│    │     price range fit (20%) + platform match (15%)             │
│    └──→ ROI projection per product-influencer pair                │
│                                                                    │
│  ADMIN ──→ [Match Influencers to Products]                         │
│    │                                                               │
│    ├──→ View auto-generated matches (score ≥ 40)                  │
│    ├──→ Approve/reject matches                                    │
│    ├──→ Send outreach email (Resend templates)                    │
│    └──→ Allocate to client for campaign execution                 │
│                                                                    │
│  SYSTEM ──→ [Discover Suppliers]                                   │
│    │                                                               │
│    ├──→ Scan Alibaba (Apify)                                      │
│    ├──→ Scan Faire, Spocket (domestic US/EU)                      │
│    ├──→ Track: MOQ, unit price, shipping cost, lead time          │
│    ├──→ Flag dropship-capable suppliers                           │
│    └──→ Flag wholesale-only suppliers with MOQ thresholds         │
│                                                                    │
│  SUPPLIER ↔ FULFILLMENT MODEL:                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Supplier offers dropship → Product tagged "dropship OK"  │      │
│  │ Supplier MOQ < 100 → Product tagged "wholesale easy"     │      │
│  │ Supplier MOQ > 500 → Product tagged "wholesale bulk"     │      │
│  │ Supplier has US warehouse → Priority recommendation      │      │
│  │ Supplier lead time > 15d → Auto-rejection flag           │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 7: CLIENT DASHBOARD EXPERIENCE

```
┌────────────────────────────────────────────────────────────────────┐
│              UC-7: CLIENT DASHBOARD & SELF-SERVICE                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CLIENT ──→ [View Dashboard]                                       │
│    │                                                               │
│    ├──→ "Today's Hot Products" widget (pre-computed)              │
│    ├──→ "Rising Stars" widget (score trends)                      │
│    ├──→ "Best for You" widget (personalized)                      │
│    ├──→ "New Opportunities" widget (last 48h)                     │
│    ├──→ "Seasonal Picks" widget (upcoming trends)                 │
│    └──→ Quick stats: allocated products, orders, revenue          │
│                                                                    │
│  CLIENT ──→ [Browse & Filter Products]                             │
│    │                                                               │
│    ├──→ ESSENTIAL FILTERS:                                        │
│    │     Platform | Score Tier | Price Range | Category |          │
│    │     Trend Stage | Date Range | Sort By                       │
│    │                                                               │
│    ├──→ ADVANCED FILTERS:                                         │
│    │     Fulfillment Model (Dropship/Wholesale/Affiliate/Digital) │
│    │     Marketing Channel | Profit Margin | Competition Level |  │
│    │     Supplier Available | Influencer Matches | Cross-Platform │
│    │                                                               │
│    ├──→ SMART PRESETS:                                            │
│    │     "Quick Wins" | "High Profit" | "Trending Now" |          │
│    │     "Low Risk" | "Affiliate Ready" | "TikTok Viral"          │
│    │                                                               │
│    └──→ Each product card shows:                                  │
│          Score gauge + tier badge + trend arrow                   │
│          Fulfillment options (dropship/wholesale/affiliate)       │
│          Recommended marketing channel                            │
│          Recommended sales platform                               │
│          "Create Content" + "Push to Store" + "View Details"      │
│                                                                    │
│  CLIENT ──→ [Request Specific Product]                             │
│    │                                                               │
│    ├──→ Describe product need (free text)                         │
│    ├──→ Select desired category, platform, price range            │
│    ├──→ Request queued → admin notified                           │
│    └──→ SYSTEM triggers live scan IF pre-computed data            │
│          doesn't match request                                    │
│                                                                    │
│  CLIENT ──→ [Manage Subscription]                                  │
│    │                                                               │
│    ├──→ View current plan (Starter/Growth/Professional/Enterprise)│
│    ├──→ Upgrade/downgrade via Stripe portal                       │
│    ├──→ View usage (products, content credits, platforms)         │
│    └──→ Add-on purchases (extra credits, platforms)               │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 8: ADMIN OPERATIONS

```
┌────────────────────────────────────────────────────────────────────┐
│              UC-8: ADMIN OPERATIONS & MANAGEMENT                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ADMIN ──→ [Manage Product Intelligence]                           │
│    │                                                               │
│    ├──→ Trigger scans (quick/full/client-mode)                    │
│    ├──→ Import external data (Keepa/FastMoss/Kalodata CSV)        │
│    ├──→ Review/approve/reject products                            │
│    ├──→ Adjust scores manually                                    │
│    ├──→ Set fulfillment recommendations                           │
│    └──→ Tag products with marketing recommendations               │
│                                                                    │
│  ADMIN ──→ [Manage Clients]                                        │
│    │                                                               │
│    ├──→ View all clients + subscription status                    │
│    ├──→ Allocate products to clients                              │
│    ├──→ Fulfill product requests                                  │
│    ├──→ Manage client permissions/tiers                           │
│    └──→ View client activity/revenue                              │
│                                                                    │
│  ADMIN ──→ [Manage AI Affiliate Revenue] (INTERNAL ONLY)           │
│    │                                                               │
│    ├──→ View affiliate program database (40+ programs)            │
│    ├──→ Launch content campaigns per program                      │
│    ├──→ Track revenue per program/channel/influencer              │
│    ├──→ Manage influencer partnerships for AI content             │
│    └──→ View total internal affiliate revenue                     │
│                                                                    │
│  ADMIN ──→ [Configure Platform]                                    │
│    │                                                               │
│    ├──→ Set API keys (Apify, Anthropic, Stripe, etc.)             │
│    ├──→ Configure automation schedules (all disabled by default)  │
│    ├──→ Manage platform pricing (per-channel config)              │
│    ├──→ Set data refresh intervals                                │
│    └──→ Monitor system health (jobs, queues, errors)              │
│                                                                    │
│  ADMIN ──→ [Import Data from External Sources]                     │
│    │                                                               │
│    ├──→ Upload CSV/Excel with column mapping UI                   │
│    ├──→ Connect Google Sheet for live sync                        │
│    ├──→ Configure Keepa API for automatic enrichment              │
│    └──→ View import history and data source audit trail           │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 9: BILLING & SUBSCRIPTION

```
┌────────────────────────────────────────────────────────────────────┐
│              UC-9: BILLING & SUBSCRIPTION MANAGEMENT               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CLIENT ──→ [Subscribe to Platform]                                │
│    │                                                               │
│    ├──→ Choose plan:                                              │
│    │     Starter ($29)  | Growth ($59)  |                         │
│    │     Professional ($99) | Enterprise ($149)                   │
│    ├──→ Choose channel(s): TikTok | Amazon | Shopify | etc.      │
│    ├──→ Multi-channel discount: 20% off 2nd, 30% off 3rd+        │
│    ├──→ Checkout via Stripe                                       │
│    └──→ Subscription activates platform access                    │
│                                                                    │
│  SYSTEM ──→ [Enforce Subscription Gating]                          │
│    │                                                               │
│    ├──→ EngineGate component checks subscription                  │
│    ├──→ Feature access controlled by plan:                        │
│    │     Starter: Product Finder + basic scores                   │
│    │     Growth: + Shop Connect + Creative Studio                 │
│    │     Professional: + Creator Connect + Smart Publisher         │
│    │     Enterprise: All engines + API + team seats               │
│    ├──→ Content credits enforced per tier                         │
│    └──→ Product limits per platform enforced                      │
│                                                                    │
│  STRIPE ──→ [Webhook Events]                                       │
│    │                                                               │
│    ├──→ subscription.created → activate access                    │
│    ├──→ subscription.updated → adjust tier/limits                 │
│    ├──→ invoice.paid → extend period                              │
│    └──→ subscription.deleted → revoke access                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## COMPLETE DATA FLOW DIAGRAM

```
╔═══════════════════════════════════════════════════════════════════╗
║                    YOUSELL DATA FLOW                              ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  EXTERNAL DATA SOURCES                                            ║
║  ┌────────┐ ┌────────┐ ┌─────────┐ ┌───────┐ ┌──────────────┐   ║
║  │ Apify  │ │ Keepa  │ │ Google  │ │ Admin │ │ Platform     │   ║
║  │Scraping│ │  API   │ │ Trends  │ │  CSV  │ │ APIs (TikTok │   ║
║  │        │ │        │ │(pytrends│ │Upload │ │ Amazon, etc) │   ║
║  └───┬────┘ └───┬────┘ └────┬────┘ └───┬───┘ └──────┬───────┘   ║
║      │          │           │          │            │            ║
║      └──────────┴───────────┴──────────┴────────────┘            ║
║                          │                                        ║
║                    ┌─────▼─────┐                                  ║
║                    │  FUSION   │  Normalize + Deduplicate +       ║
║                    │  ENGINE   │  Weight by reliability +         ║
║                    │           │  Score (3-pillar)                ║
║                    └─────┬─────┘                                  ║
║                          │                                        ║
║              ┌───────────▼───────────┐                            ║
║              │    products table      │                            ║
║              │  (enriched + scored)   │                            ║
║              └───────────┬───────────┘                            ║
║                          │                                        ║
║         ┌────────────────┼────────────────┐                       ║
║         │                │                │                       ║
║   ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐                 ║
║   │FULFILLMENT│   │ CONTENT   │   │ INFLUENCER│                  ║
║   │INTELLIGENCE│  │  ENGINE   │   │ MATCHING  │                  ║
║   │           │   │           │   │           │                  ║
║   │Dropship?  │   │Generate   │   │Score fits │   │POD mockups│   ║
║   │Wholesale? │   │marketing  │   │ROI project│   │Printful/  │   ║
║   │Affiliate? │   │content    │   │Outreach   │   │Printify/  │   ║
║   │Digital?   │   │per product│   │           │   │Gelato API │   ║
║   │POD?       │   │           │   │           │   │           │   ║
║   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘ ║
║         │                │                │                │      ║
║         └────────────────┼────────────────┼────────────────┘      ║
║                          │                                        ║
║         ┌────────────────┼────────────────┐                       ║
║         │                │                │                       ║
║  ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────────────┐        ║
║  │   ADMIN     │  │  CLIENT     │  │  ADMIN COMMAND      │        ║
║  │  DASHBOARD  │  │ DASHBOARD   │  │  CENTER (OWN SHOPS) │        ║
║  │             │  │             │  │                     │        ║
║  │ Review +    │  │ Pre-computed│  │ ➤ Push to TikTok   │        ║
║  │ Approve +   │  │ widgets     │  │ ➤ Push to Amazon   │        ║
║  │ Allocate +  │  │ Smart       │  │ ➤ Push to Shopify  │        ║
║  │ AI Affiliate│  │ filters     │  │ ➤ Push to All      │        ║
║  │ Mgmt        │  │ Product     │  │ Revenue dashboard  │        ║
║  │             │  │ cards       │  │ Pipeline view      │        ║
║  └──────┬──────┘  └─────────────┘  └──────────┬────────┘        ║
║         │                                      │                  ║
║         │         INTERNAL (ADMIN-ONLY):       │                  ║
║  ┌──────┴──────────────────────────────────────┴──────┐           ║
║  │  AFFILIATE COMMISSION ENGINE (DUAL REVENUE)        │           ║
║  │                                                     │           ║
║  │  Stream 1: Internal Content Factory                 │           ║
║  │  • 60+ affiliate programs across 8 categories       │           ║
║  │  • Auto-generate + publish promotional content      │           ║
║  │  • Track clicks → conversions → commissions         │           ║
║  │                                                     │           ║
║  │  Stream 2: Client Service Referrals                 │           ║
║  │  • Auto-track when clients adopt platforms          │           ║
║  │  • Shopify 20% + Klaviyo 15% + Printful 10%        │           ║
║  │  • + Spocket 25% lifetime = revenue stacking        │           ║
║  │                                                     │           ║
║  │  Dual Stats Dashboard: Internal | Client Service    │           ║
║  │  Est. Year 1 (50 clients): ~$28,530 extra revenue   │           ║
║  └─────────────────────────────────────────────────────┘           ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## USE CASE 10: PRINT ON DEMAND (POD) DISCOVERY & FULFILLMENT

```
┌────────────────────────────────────────────────────────────────────┐
│              UC-10: PRINT ON DEMAND (POD) — CHANNEL #8             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ADMIN ──→ [Trigger POD Trend Discovery]                           │
│              │                                                     │
│              ├──→ Scan Etsy trending designs (Apify)               │
│              ├──→ Scan Redbubble trending niches (Apify)           │
│              ├──→ Scan Merch by Amazon best sellers (Apify)        │
│              ├──→ Scan TikTok design trends (#printondemand)       │
│              ├──→ Scan Pinterest aesthetic trend boards             │
│              └──→ Validate via Google Trends (pytrends)            │
│                                                                    │
│  SYSTEM ──→ [Score POD Opportunities]                              │
│              │                                                     │
│              ├──→ 3-pillar scoring with POD adjustments:           │
│              │    • Trend: design trend velocity + seasonal         │
│              │    • Viral: aesthetic appeal + UGC potential         │
│              │    • Profit: margin must exceed 30% minimum         │
│              ├──→ Compare fulfillment partner pricing:             │
│              │    Printful vs Printify vs Gelato vs Gooten         │
│              └──→ Tag sub-category: apparel / accessories /        │
│                   home / stationery / all-over-print / pet         │
│                                                                    │
│  ADMIN ──→ [Generate POD Products]                                 │
│              │                                                     │
│              ├──→ AI generates design concepts for niche           │
│              ├──→ Printful Mockup Generator API creates mockups    │
│              ├──→ Admin reviews and approves designs               │
│              └──→ Products pushed to client stores:                │
│                   • Shopify (with Printful fulfillment attached)   │
│                   • TikTok Shop (with POD metadata)                │
│                   • Etsy (with POD fulfillment)                    │
│                                                                    │
│  SYSTEM (Webhook) ──→ [POD Order Fulfillment]                      │
│              │                                                     │
│              ├──→ Customer places order on store                   │
│              ├──→ Webhook triggers POD partner (Printful/etc.)     │
│              ├──→ POD partner manufactures product                 │
│              ├──→ POD partner ships direct to customer             │
│              └──→ Order tracking flows to tracking engine          │
│                                                                    │
│  POD SUB-CATEGORIES:                                               │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Apparel:    T-shirts, hoodies, tank tops (40-60% margin) │      │
│  │ Accessories: Phone cases, tote bags, hats (35-55%)       │      │
│  │ Home:       Mugs, pillows, blankets, posters (30-50%)    │      │
│  │ Stationery: Notebooks, stickers, planners (40-65%)       │      │
│  │ All-Over:   Leggings, dresses, swimwear (35-50%)         │      │
│  │ Pet:        Pet beds, bandanas, bowls (35-55%)            │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                    │
│  FULFILLMENT PARTNERS:                                             │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Printful:  340+ products, REST API + Webhooks, Mockups   │      │
│  │ Printify:  900+ products, multi-provider price compare   │      │
│  │ Gelato:    100+ products, 32-country local production    │      │
│  │ Gooten:    150+ products, budget-friendly alternative    │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 11: ADMIN COMMAND CENTER — BEST-SELLING PRODUCTS DASHBOARD

```
┌────────────────────────────────────────────────────────────────────┐
│       UC-11: ADMIN COMMAND CENTER (OWN SHOPS)                      │
│       YOUSELL's Internal Profit-Maximizing Dashboard               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ADMIN ──→ [Connect YOUSELL's Own Stores]                          │
│              │                                                     │
│              ├──→ Connect own Shopify store (OAuth)                │
│              ├──→ Connect own TikTok Shop (OAuth)                  │
│              ├──→ Connect own Amazon Seller account (OAuth)        │
│              └──→ Connect own Etsy shop (OAuth)                    │
│                                                                    │
│  ADMIN ──→ [Best Sellers Pool]                                     │
│              │                                                     │
│              ├──→ View all products ranked by final_score          │
│              │    (HOT tier first, with score badges)              │
│              │                                                     │
│              └──→ Per-product action buttons:                      │
│                   ┌──────────────────────────────────────┐         │
│                   │ [➤ Push to TikTok Shop]               │         │
│                   │ [➤ Push to Amazon]                     │         │
│                   │ [➤ Push to Shopify]                    │         │
│                   │ [➤ Push to All Platforms]              │         │
│                   │ [🚀 Launch Marketing Campaign]         │         │
│                   │ [📧 Influencer Outreach]               │         │
│                   │ [📝 Generate Content]                  │         │
│                   │ [📊 Financial Model]                   │         │
│                   └──────────────────────────────────────┘         │
│                                                                    │
│  EACH BUTTON TRIGGERS BullMQ JOB:                                  │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Push to Shopify   → productSet mutation via GraphQL      │      │
│  │ Push to TikTok    → product.save via TikTok Shop API     │      │
│  │ Push to Amazon    → Create listing via SP-API Feeds      │      │
│  │ Push to All       → Fan-out to all 3+ platform workers   │      │
│  │ Launch Marketing  → Generate + schedule content           │      │
│  │ Influencer        → Find creators + draft outreach       │      │
│  │ Generate Content  → AI-generate captions/images/scripts  │      │
│  │ Financial Model   → Full unit economics + ROI projection │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                    │
│  ADMIN ──→ [Per-Platform Pipeline View]                            │
│              │                                                     │
│              ├──→ TikTok Shop: products live, weekly revenue       │
│              ├──→ Amazon: products live, weekly revenue             │
│              ├──→ Shopify: products live, weekly revenue            │
│              ├──→ Etsy: products live, weekly revenue               │
│              └──→ POD: products live, weekly revenue                │
│                                                                    │
│              Product Status Pipeline:                               │
│              Draft → Listed → Active → Performing → Archive        │
│                                                                    │
│  ADMIN ──→ [Revenue Dashboard]                                     │
│              │                                                     │
│              ├──→ Real-time revenue aggregation (all stores)       │
│              ├──→ Platform breakdown (revenue per week/month)      │
│              ├──→ Top 10 performing products with trend graphs     │
│              └──→ Profit margin tracker (cost vs revenue vs net)   │
│                                                                    │
│  KEY DISTINCTION:                                                  │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ This is YOUSELL's OWN SHOPS command center.              │      │
│  │ NOT the client-facing store integration (Phase D).       │      │
│  │ Every discovered product can be one-click deployed       │      │
│  │ to any of YOUSELL's own sales channels.                  │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

---

## USE CASE 12: AFFILIATE COMMISSION ENGINE — DUAL REVENUE TRACKING

```
┌────────────────────────────────────────────────────────────────────┐
│       UC-12: AFFILIATE COMMISSION ENGINE                           │
│       Dual-Stream Revenue: Internal Content + Client Service       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  STREAM 1: INTERNAL CONTENT AFFILIATE REVENUE (ADMIN-ONLY)        │
│  ─────────────────────────────────────────────────                 │
│                                                                    │
│  ADMIN ──→ [Manage Affiliate Programs]                             │
│              │                                                     │
│              ├──→ Add/update affiliate program entries (60+)       │
│              │    Categories: E-Commerce, POD, Marketing,          │
│              │    Design, AI Tools, Dropship, Payment, Analytics   │
│              ├──→ Set priority level per program                   │
│              ├──→ Configure affiliate links + tracking             │
│              └──→ Set content strategy per program                 │
│                                                                    │
│  SYSTEM ──→ [Auto-Generate Affiliate Content]                      │
│              │                                                     │
│              ├──→ Blog reviews (SEO-optimized)                     │
│              ├──→ YouTube scripts (tutorials + demos)              │
│              ├──→ TikTok scripts (quick comparisons)               │
│              ├──→ Email newsletter spotlights                      │
│              ├──→ Social media posts (all platforms)               │
│              └──→ Comparison articles / listicles                  │
│                                                                    │
│  SYSTEM ──→ [Publish to YOUSELL's Own Channels]                    │
│              │                                                     │
│              ├──→ Post to YOUSELL blog/review site                 │
│              ├──→ Post to YOUSELL social accounts (Ayrshare)       │
│              ├──→ Send to YOUSELL email newsletter (Resend)        │
│              └──→ Engage micro-influencers for amplification       │
│                                                                    │
│  ─────────────────────────────────────────────────                 │
│  STREAM 2: CLIENT SERVICE AFFILIATE REVENUE                       │
│  ─────────────────────────────────────────────────                 │
│                                                                    │
│  SYSTEM (Auto-Track) ──→ [Detect Client Platform Adoption]         │
│              │                                                     │
│              ├──→ Client creates Shopify store → Shopify Partner   │
│              │    commission triggered (20% recurring)             │
│              ├──→ Client connects Klaviyo → email tool referral    │
│              │    commission triggered (10-20% recurring)          │
│              ├──→ Client connects Printful → POD referral          │
│              │    commission triggered (10% for 12 months)         │
│              ├──→ Client connects Spocket → dropship referral      │
│              │    commission triggered (20-30% lifetime!)          │
│              └──→ Client signs up Canva → design tool referral     │
│                   commission triggered ($36 bounty)                │
│                                                                    │
│  ─────────────────────────────────────────────────                 │
│  ADMIN DASHBOARD: AFFILIATE REVENUE TRACKER                       │
│  ─────────────────────────────────────────────────                 │
│                                                                    │
│  ADMIN ──→ [View Dual-Stream Revenue Dashboard]                    │
│              │                                                     │
│              ├──→ Stream 1 Stats:                                  │
│              │    • Revenue per affiliate program                  │
│              │    • Revenue per content type                       │
│              │    • Revenue per publishing channel                 │
│              │    • Top performing programs                        │
│              │                                                     │
│              ├──→ Stream 2 Stats:                                  │
│              │    • Referral commissions per client                │
│              │    • Which platforms each client adopted            │
│              │    • Cumulative commission per platform             │
│              │    • Monthly recurring vs one-time bounties         │
│              │                                                     │
│              └──→ Combined View:                                   │
│                   • Total affiliate revenue (both streams)         │
│                   • Monthly rollup with growth trend               │
│                   • Revenue forecast based on client pipeline      │
│                                                                    │
│  REVENUE STACKING MODEL:                                           │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Single client generates 4+ affiliate streams:            │      │
│  │                                                           │      │
│  │ Shopify (20% recurring)                                   │      │
│  │   + Klaviyo/Omnisend (20% recurring)                      │      │
│  │   + Stripe (bonus)                                        │      │
│  │   + Spocket/Printful (20-30% recurring)                   │      │
│  │   = Compounding passive income ON TOP of subscriptions    │      │
│  │                                                           │      │
│  │ Estimated Year 1 (50 clients): ~$28,530                   │      │
│  │ Scales linearly with client count                         │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                    │
│  HIGHEST-PRIORITY AFFILIATES:                                      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ 1. Shopify Partner — 20% recurring (in stack)            │      │
│  │ 2. Printful — 10% of sales for 12mo (with POD Ch#8)     │      │
│  │ 3. Klaviyo — 10-20% recurring (email marketing)          │      │
│  │ 4. Spocket — 20-30% LIFETIME recurring (standout!)       │      │
│  │ 5. Canva — $36 per Pro signup (design tools)             │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

---

## CROSS-REFERENCE: ALL REQUIREMENTS → USE CASES

| Requirement | Use Case(s) | Key Decision |
|-------------|------------|--------------|
| **Point 1**: Dropship vs Wholesale for physical products | UC-1A, UC-3, UC-5 | Auto-recommend fulfillment model based on product attributes; show margin comparison |
| **Point 2**: Digital products (printables, eBooks) as dropship/affiliate | UC-1B, UC-3, UC-4 | Three options: Create own + sell direct, Affiliate link, Shopify hub |
| **Point 3**: AI platform commissions as internal-only revenue | UC-1C, UC-8, UC-12 | Admin-only module; uses own content/influencer/publishing engines; zero client visibility |
| **Point 4**: Data pooling + pre-computed intelligence + fallback | UC-2A, UC-7 | Pre-compute everything nightly; tiered refresh by score; live-scrape only on explicit request |
| **Point 5**: Keepa/FastMoss/Kalodata + manual spreadsheets | UC-2B, UC-8 | Keepa API + CSV import (FastMoss/Kalodata) + Google Sheets + multi-source fusion engine |
| **Point 6**: Print on Demand (POD) as Channel #8 | UC-10, UC-1A, UC-3 | Zero inventory, 30-60% margins, Printful/Printify/Gelato fulfillment, design-once-sell-everywhere |
| **Point 7**: Admin Command Center (own shops dashboard) | UC-11 | One-click product publishing to YOUSELL's own stores, live revenue tracking, profit maximization |
| **Point 8**: Affiliate Commission Engine (dual revenue) | UC-12 | Stream 1: internal content factory → commissions. Stream 2: client platform adoption → referral commissions |

---

## NEW DATABASE TABLES REQUIRED

### Original Tables (Session 3)

| Table | Purpose | Visibility |
|-------|---------|-----------|
| `admin_affiliate_revenue` | Track AI affiliate commission income | Admin only |
| `admin_affiliate_campaigns` | Manage AI affiliate content campaigns | Admin only |
| `import_history` | Log all admin data uploads | Admin only |
| `data_source_log` | Track which data source enriched each product | Admin only |
| `product_score_snapshots` | Historical scores for trend detection | System |
| `column_mapping_templates` | Saved CSV column mappings per source | Admin only |
| `client_preferences` | Client's preferred platforms/categories/price | Client |
| `recommendation_cache` | Pre-computed product recommendations | System |

### POD Tables (Channel #8)

| Table | Purpose | Visibility |
|-------|---------|-----------|
| `pod_products` | POD-specific product data (design niche, mockup URLs, fulfillment partner) | Admin + Client |
| `pod_orders` | POD order tracking (partner order ID, manufacturing status, shipping) | Admin + Client |
| `pod_providers` | Registered POD fulfillment partners (Printful, Printify, Gelato, Gooten) | Admin only |

### Admin Command Center Tables

| Table | Purpose | Visibility |
|-------|---------|-----------|
| `admin_store_connections` | YOUSELL's own store OAuth tokens (Shopify, TikTok, Amazon, Etsy) | Admin only |
| `admin_product_listings` | Products listed on YOUSELL's own stores (status, revenue, orders) | Admin only |
| `admin_revenue_tracking` | Daily revenue snapshots per platform per product | Admin only |

### Affiliate Commission Engine Tables

| Table | Purpose | Visibility |
|-------|---------|-----------|
| `affiliate_programs` | Master list of all affiliate programs (60+) with links, rates, categories | Admin only |
| `affiliate_referrals` | Referral events (program, client, stream, status) | Admin only |
| `affiliate_commissions` | Commission records (amount, period, paid status) | Admin only |
| `affiliate_content_log` | Content created for affiliate promotion (type, platform, clicks, conversions) | Admin only |

---

## NEW COLUMNS ON EXISTING TABLES

| Table | Column | Purpose |
|-------|--------|---------|
| `products` | `fulfillment_type` | `dropship` / `wholesale` / `affiliate` / `digital` |
| `products` | `fulfillment_options` (JSONB) | All viable fulfillment models with margin estimates |
| `products` | `marketing_recommendation` | Best marketing channel for this product |
| `products` | `sales_platform_recommendation` | Best sales platform for this product |
| `products` | `data_sources` (JSONB) | Track which sources enriched this product |
| `products` | `last_enriched_at` | Timestamp of most recent data enrichment |
| `ai_affiliate_programs` | `revenue_score` | Computed from commission × price × conversion |
| `ai_affiliate_programs` | `campaign_status` | planned / active / paused / completed |
| `products` | `pod_provider` | POD fulfillment partner (printful / printify / gelato / gooten) |
| `products` | `pod_base_cost` | POD manufacturing base cost per unit |
| `products` | `pod_mockup_urls` (JSONB) | AI-generated mockup image URLs |
| `products` | `design_niche` | POD design niche/aesthetic category |

---

---

## INTER-ENGINE EVENT FLOWS (NEW — Engine Independence Architecture)

**Reference:** Technical Specification v8, Section 9A

Each of the 21 platform engines operates as an independent bounded context. The diagram below shows how use cases map to engines and how engines communicate via the event bus.

### Engine-to-Use-Case Mapping

```
┌────────────────────────────────────────────────────────────────────┐
│                    ENGINE → USE CASE MAPPING                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DISCOVERY LAYER                                                    │
│  ├─ Product Discovery Engine ──→ UC-1 (Product Discovery)          │
│  └─ Trend Scout Engine ────────→ UC-1 (Trend Detection signals)    │
│                                                                     │
│  SCORING LAYER                                                      │
│  ├─ Data Fusion Engine ────────→ UC-1 (Multi-source merging)       │
│  ├─ Composite Scoring Engine ──→ UC-2 (Product Scoring)            │
│  ├─ POD Scoring Engine ────────→ UC-8 (POD Scoring)                │
│  └─ Profitability Engine ──────→ UC-2 (Margin calculation)         │
│                                                                     │
│  ENRICHMENT LAYER                                                   │
│  ├─ Financial Modelling Engine ─→ UC-2 (Financial models)          │
│  ├─ Influencer Intelligence ───→ UC-6 (Influencer Matching)        │
│  ├─ Supplier Discovery Engine ──→ UC-3 (Supplier Matching)         │
│  ├─ Competitor Intelligence ───→ UC-7 (Store Intelligence)         │
│  ├─ Ad Intelligence Engine ────→ UC-7 (Ad campaign data)           │
│  └─ Launch Blueprint Engine ───→ UC-2 (Launch strategy)            │
│                                                                     │
│  CLIENT-FACING LAYER                                                │
│  ├─ Client Allocation Engine ──→ UC-4 (Product Allocation)         │
│  ├─ Creative Studio Engine ────→ UC-5 (Content Creation)           │
│  ├─ Smart Publisher Engine ────→ UC-5 (Content Publishing)         │
│  ├─ Shop Connect Engine ───────→ UC-9 (Store Integration)          │
│  └─ Order Tracking Engine ─────→ UC-10 (Order Management)          │
│                                                                     │
│  OPERATIONS LAYER                                                   │
│  ├─ Command Center Engine ─────→ UC-11 (Best-Seller Deployment)    │
│  ├─ Affiliate Commission ──────→ UC-12 (Affiliate Revenue)         │
│  ├─ POD Intelligence Engine ───→ UC-8 (POD Pipeline)               │
│  └─ Automation Orchestrator ───→ All UCs (Automation control)      │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Inter-Engine Event Flow Diagram

```
                         ┌─────────────────────────────────────┐
                         │          EVENT BUS                    │
                         │  Redis Pub/Sub + Supabase Realtime   │
                         └──────────────┬──────────────────────┘
                                        │
    ┌───────────────────────────────────┼───────────────────────────┐
    │                                   │                           │
    ▼                                   ▼                           ▼
┌──────────┐   product.discovered   ┌──────────┐               ┌──────────┐
│ Product  │ ─────────────────────→ │  Trend   │               │  Data    │
│Discovery │                        │  Scout   │               │  Fusion  │
└──────────┘                        └──────────┘               └────┬─────┘
                                                                    │
                                                          product.fused
                                                                    │
                                                                    ▼
                                                            ┌──────────────┐
                                                            │  Composite   │
                                                            │  Scoring     │
                                                            └──────┬───────┘
                                                                   │
                                                          product.scored
                                            ┌──────────┬──────────┼──────────┐
                                            ▼          ▼          ▼          ▼
                                     ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐
                                     │Influencer│ │Supplier│ │ Client │ │Command │
                                     │  Intel   │ │  Disc  │ │ Alloc  │ │Center  │
                                     └──────────┘ └────────┘ └───┬────┘ └────────┘
                                                                  │
                                                      product.allocated
                                                      ┌───────────┼──────────┐
                                                      ▼                      ▼
                                              ┌──────────────┐      ┌──────────────┐
                                              │  Creative    │      │  Shop        │
                                              │  Studio      │      │  Connect     │
                                              └──────┬───────┘      └──────┬───────┘
                                                     │                     │
                                          content.generated      product.pushed
                                                     │                     │
                                                     ▼                     ▼
                                              ┌──────────────┐      ┌──────────────┐
                                              │  Smart       │      │  Order       │
                                              │  Publisher   │      │  Tracking    │
                                              └──────┬───────┘      └──────┬───────┘
                                                     │                     │
                                          content.published       order.fulfilled
                                                     │                     │
                                                     └──────────┬──────────┘
                                                                ▼
                                                         ┌──────────────┐
                                                         │  Affiliate   │
                                                         │  Commission  │
                                                         └──────────────┘
```

### Data Isolation Guarantee

Each engine owns its tables and communicates only through events. No engine directly reads another engine's tables. This enables any engine to be extracted as a standalone SaaS product following the 5-step process in v8 Spec Section 9A.7.

**Visual diagrams:** See `docs/YOUSELL_Use_Case_Diagram.drawio` (pages 7-8) and `docs/YOUSELL_Flowcharts.drawio` (pages 9-10) for detailed draw.io versions of these flows.

---

*This use case diagram (v2.1) covers ALL user inputs and outputs across the 3 system interfaces (main website, admin dashboard, client dashboard) incorporating 8 business requirements + engine independence architecture. Total: 12 use cases, 21 independent engines, 14 new database tables, 10 new columns on existing tables.*
