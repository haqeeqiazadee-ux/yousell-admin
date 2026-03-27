# YOUSELL UI EXECUTION STRATEGY
## Based on YOUSELL_UI_FINAL_MASTER_PROMPT.md v3
### Created: 2026-03-27

---

## EXECUTION COMPLETE — 2026-03-27

| Surface | Before | After | Status |
|---------|--------|-------|--------|
| Admin Dashboard | 48 pages | 66 pages | COMPLETE |
| Client Dashboard | 11 pages | 29 pages | COMPLETE |
| Marketing Website | 8 pages | 19 pages | COMPLETE |
| API Routes | 104 | 120 | COMPLETE |
| Migrations | 34 | 34 | COMPLETE |
| shadcn Components | 14 | 21 | COMPLETE |
| Custom Components | 14 | 26 | COMPLETE |
| Design Tokens | 0 | 2 files | COMPLETE |
| Zustand Stores | 0 | 6 | COMPLETE |
| TanStack Hooks | 0 | 6 | COMPLETE |
| Utility Libraries | 0 | 5 | COMPLETE |
| **Total UI Pages** | **69** | **114** | **+45 pages** |

---

## PHASE 0 — FOUNDATION (Sessions 1-2)

### 0.1 Design Token System
- CREATE `src/lib/design-tokens.ts` — All CSS variable definitions
- CREATE `src/styles/tokens.css` — Obsidian Intelligence theme tokens
- Colors: Primary #3D5FA8, AI #6366F1, Success #10B981
- Typography: Cal Sans (headings), DM Sans (body), JetBrains Mono (data)
- 8pt spacing grid, border-radius scale, shadow scale
- Dark/light mode token sets

### 0.2 Missing shadcn Components
- Install: Select, Textarea, Progress, Popover, Command, Toast, Accordion, Checkbox, RadioGroup, ScrollArea
- Command Palette (CMD+K) component for admin + client dashboards

### 0.3 Shared Components
- CREATE `src/components/MetricCard.tsx` — KPI card with trend indicator
- CREATE `src/components/AIInsightCard.tsx` — AI badge + confidence indicator
- CREATE `src/components/ConfidenceIndicator.tsx` — Green/Amber/None based on %
- CREATE `src/components/StreamingText.tsx` — 30ms per character AI reveal
- UPDATE `src/components/engines/engine-page-layout.tsx` — Add token integration

---

## PHASE 1 — CLIENT DASHBOARD (Sessions 3-10) — HIGHEST PRIORITY

*"Client dashboard is what generates revenue — build it first"*

### 1.1 Core Discovery Pages
| Page | Path | Priority |
|------|------|----------|
| Trending Now (Home) | `/dashboard` | UPDATE existing |
| Pre-Viral Detection | `/dashboard/pre-viral` | CREATE — THE MOAT |
| Opportunity Feed | `/dashboard/opportunities` | CREATE |

### 1.2 Platform Intelligence Pages
| Page | Path | Sub-tabs | Priority |
|------|------|----------|----------|
| TikTok Intelligence | `/dashboard/tiktok` | Products, Trending Videos, TikTok Shops, Creators, Ads | CREATE |
| Amazon Intelligence | `/dashboard/amazon` | Products, BSR Movers, Sellers, Reviews | CREATE |
| Shopify Intelligence | `/dashboard/shopify` | Stores, Products, App Stack, Traffic | CREATE |
| Ad Intelligence | `/dashboard/ads` | — | CREATE |
| Creator Discovery | `/dashboard/creators` | — | CREATE |

### 1.3 My Tools Pages
| Page | Path | Priority |
|------|------|----------|
| My Watchlist | `/dashboard/watchlist` | CREATE |
| Saved Searches | `/dashboard/saved` | CREATE |
| Alerts Center | `/dashboard/alerts` | CREATE |
| Launch Blueprints | `/dashboard/blueprints` | CREATE — AI streaming |

### 1.4 Product Pages
| Page | Path | Priority |
|------|------|----------|
| Digital Products | `/dashboard/digital` | CREATE |
| AI/SaaS Affiliates | `/dashboard/ai-saas` | CREATE |
| Physical Affiliates | `/dashboard/affiliates` | CREATE |

### 1.5 Account Pages
| Page | Path | Priority |
|------|------|----------|
| Usage & Plan | `/dashboard/usage` | CREATE |
| Client Settings | `/dashboard/settings` | CREATE |
| Help & Onboarding | `/dashboard/help` | CREATE |

### 1.6 Product Detail — 7-Row Intelligence Chain
| Row | Content |
|-----|---------|
| 1 | Product Identity — image, title, category, platform, freshness |
| 2 | Product Stats — trends, sales estimates, velocity, forecasts |
| 3 | Related Influencers — creators, engagement, matching score |
| 4 | TikTok Shops — sellers, GMV estimates, growth rates |
| 5 | Other Channels — Amazon, Shopify, eBay, YouTube, Pinterest, Reddit |
| 6 | Viral Videos & Ads — content tracking, ad spend, competitor scaling |
| 7 | Opportunity Score & AI Action Plan — streaming reveal |

**UPDATE** `/dashboard/products/[id]` to implement full 7-row chain

### 1.7 Client Dashboard Layout
- CREATE `src/app/dashboard/layout.tsx` — Client sidebar, topbar, CMD+K
- Dark by default ("Obsidian Intelligence")
- Mobile-responsive sidebar (drawer on <768px)

### 1.8 API Routes for Client Dashboard
- CREATE `/api/dashboard/pre-viral/route.ts`
- CREATE `/api/dashboard/opportunities/route.ts`
- CREATE `/api/dashboard/tiktok/route.ts`
- CREATE `/api/dashboard/amazon/route.ts`
- CREATE `/api/dashboard/shopify/route.ts`
- CREATE `/api/dashboard/ads/route.ts`
- CREATE `/api/dashboard/creators/route.ts`
- CREATE `/api/dashboard/watchlist/route.ts`
- CREATE `/api/dashboard/saved/route.ts`
- CREATE `/api/dashboard/alerts/route.ts`
- CREATE `/api/dashboard/blueprints/route.ts`
- CREATE `/api/dashboard/usage/route.ts`
- CREATE `/api/dashboard/settings/route.ts`

---

## PHASE 2 — ADMIN DASHBOARD POLISH (Sessions 11-13)

Admin has 48 pages (exceeds spec), but needs quality alignment:

### 2.1 Missing Admin Pages from Spec
| Page | Path | Status |
|------|------|--------|
| User Management | `/admin/settings/users` | CHECK if nested |
| Billing & Subscriptions | `/admin/settings/billing` | CHECK if nested |
| A/B Test Manager | `/admin/settings/experiments` | CREATE if missing |
| RFM Segmentation | `/admin/customers/segments` | CREATE if missing |
| Churn Risk Dashboard | `/admin/customers/churn` | CREATE if missing |
| Price Elasticity | `/admin/pricing/elasticity` | CREATE if missing |
| Cohort Personalisation | `/admin/customers/cohorts` | CREATE if missing |
| AI Feedback & Model Health | `/admin/engines/feedback` | CREATE if missing |
| Health Monitor | `/admin/health` | CHECK vs /admin/monitoring |
| Logs | `/admin/logs` | CREATE if missing |
| AI Cost Dashboard | `/admin/ai-costs` | CREATE if missing |
| Webhooks | `/admin/webhooks` | CREATE if missing |
| Scheduled Jobs | `/admin/schedule` | CREATE if missing |

### 2.2 Admin Quality Pass
- Apply design tokens to all 48 pages
- Add CMD+K command palette
- Ensure all pages have: loading skeletons, empty states, error states
- Dark mode consistency audit
- Pagination (25/page) on all tables

---

## PHASE 3 — MARKETING WEBSITE (Sessions 14-20)

### 3.1 Homepage — 13 Sections
| # | Section | Content |
|---|---------|---------|
| 1 | Hero | 100vh, aurora gradient, risk reversal CTA |
| 2 | Social Proof Bar | Auto-scrolling logos |
| 3 | Problem Statement | Pain ✕ → Solution ✓ |
| 4 | Intelligence Chain | 7-row animated walkthrough |
| 5 | Feature Bento Grid | 6 tiles (Aceternity UI) |
| 6 | Pre-Viral Moat | Timeline visualization |
| 7 | Platform Coverage | 14 platform icons |
| 8 | How It Works | 3-step: Connect → Discover → Act |
| 9 | Testimonials | 3 cards with specific outcomes |
| 10 | Competitor Comparison | vs FastMoss, JungleScout, Triple Whale, Minea |
| 11 | Pricing Section | Abbreviated, link to /pricing |
| 12 | Final CTA | Full-width high contrast |
| 13 | Footer | 4-column + bottom bar |

### 3.2 Marketing Pages to Build
| Page | Path | Priority |
|------|------|----------|
| Homepage (13 sections) | `/` | UPDATE existing |
| Pricing (3 tiers + ROI calc) | `/pricing` | UPDATE existing |
| Features Overview | `/features` | CREATE |
| Feature: Trend Radar | `/features/trend-radar` | CREATE |
| Feature: AI Agents | `/features/ai-agents` | CREATE |
| Feature: Pricing Intel | `/features/pricing-intelligence` | CREATE |
| Feature: Forecasting | `/features/demand-forecasting` | CREATE |
| Feature: AI Briefings | `/features/ai-briefings` | CREATE |
| Integrations (50+) | `/integrations` | CREATE |
| About | `/about` | CREATE |
| Blog | `/blog` | CREATE |
| SEO: Dropshippers | `/for-dropshippers` | CREATE |
| SEO: Resellers | `/for-resellers` | CREATE |
| SEO: Agencies | `/for-agencies` | CREATE |
| vs FastMoss | `/comparison/vs-fastmoss` | CREATE |
| vs JungleScout | `/comparison/vs-junglescout` | CREATE |
| vs Triple Whale | `/comparison/vs-triple-whale` | CREATE |
| Interactive Demo | `/demo` | CREATE |

### 3.3 Marketing Layout
- CREATE `src/app/(marketing)/layout.tsx` — Navbar, footer
- Light by default (opposite of admin/client)
- Transparent→solid navbar on scroll

---

## PHASE 4 — ONBOARDING FLOW (Session 21)

- CREATE `/onboarding` — 6-step signup flow
- Step 1: Platform selection
- Step 2: Business type
- Step 3: Goals
- Step 4: Connect first platform
- Step 5: First scan
- Step 6: Dashboard tour
- First-login overlay tour
- Role-based personalisation

---

## PHASE 5 — MOBILE & POLISH (Sessions 22-25)

### 5.1 Responsive Audit
- xs (<480px): Mobile nav
- sm (480-640px): Mobile nav
- md (640-768px): Sidebar drawer
- lg (768-1024px): Sidebar overlay / platform tabs
- xl (1024-1280px): Icon sidebar
- 2xl (>1280px): Full layout

### 5.2 Performance
- LCP < 1.5s
- CLS < 0.05
- INP < 100ms
- React Server Components by default
- Code-split charts with dynamic import
- Virtual rows for 10K+ lists

### 5.3 Accessibility (WCAG 2.1 AA)
- Keyboard navigation on all interactive elements
- Focus ring: 3px, rgba(59,130,246,0.5)
- aria-live="polite" on AI content
- aria-labels on all icons
- High contrast variant

### 5.4 Animation
- Page transitions: 250ms ease-out
- Hover states: 150ms
- AI streaming: 30ms per character
- Skeleton loading: 1.5s shimmer

---

## SESSION EXECUTION PLAN

| Session | Phase | Deliverable | Pages |
|---------|-------|-------------|-------|
| 1 | 0.1 | Design tokens | 0 |
| 2 | 0.2-0.3 | Components + CMD+K | 0 |
| 3 | 1.1 | Pre-Viral + Opportunity Feed | 2 |
| 4 | 1.2a | TikTok + Amazon Intelligence | 2 |
| 5 | 1.2b | Shopify + Ads + Creators | 3 |
| 6 | 1.3 | Watchlist + Saved + Alerts + Blueprints | 4 |
| 7 | 1.4 | Digital + AI/SaaS + Affiliates | 3 |
| 8 | 1.5 | Usage + Settings + Help | 3 |
| 9 | 1.6 | Product Detail 7-row chain | 1 (major) |
| 10 | 1.7-1.8 | Client layout + API routes | 0 (infra) |
| 11 | 2.1 | Missing admin pages (batch 1) | 4-6 |
| 12 | 2.1 | Missing admin pages (batch 2) | 4-6 |
| 13 | 2.2 | Admin quality pass | 0 (polish) |
| 14 | 3.1 | Homepage 13 sections | 1 (major) |
| 15 | 3.2a | Pricing + Features overview | 2 |
| 16 | 3.2b | 5 feature detail pages | 5 |
| 17 | 3.2c | Integrations + About + Blog | 3 |
| 18 | 3.2d | 3 SEO landing pages | 3 |
| 19 | 3.2e | 3 comparison pages | 3 |
| 20 | 3.2f | Interactive Demo | 1 |
| 21 | 4 | Onboarding flow | 1 (6 steps) |
| 22 | 5.1 | Responsive audit + fixes | 0 |
| 23 | 5.2 | Performance optimization | 0 |
| 24 | 5.3 | Accessibility audit | 0 |
| 25 | 5.4 | Animation + final polish | 0 |

**Total: ~25 sessions to complete all 3 surfaces**

---

## QUALITY GATES (per Section 32)

### Before marking Client Dashboard complete:
- [ ] 7-row chain renders for all product types
- [ ] Platform tabs switch without full page reload
- [ ] Product cards expand inline (not navigate)
- [ ] Pre-viral shows confidence + predicted dates
- [ ] AI streaming text reveals correctly in Row 7
- [ ] Creator outreach email generation works
- [ ] Launch Blueprint streaming works (15-30s)
- [ ] Watchlist alerts configurable
- [ ] All sub-tabs functional
- [ ] RLS enforced (clients see only allocated products)
- [ ] Usage meters accurate

### Before marking Marketing Website complete:
- [ ] Navbar transparent→solid transition smooth
- [ ] All 13 homepage sections in correct order
- [ ] Interactive demo works without signup
- [ ] Competitor comparison table accurate
- [ ] ROI calculator functional
- [ ] 5 feature pages use consistent template
- [ ] Footer links resolve (no 404s)
- [ ] 50+ integrations shown
- [ ] SEO landing pages have unique H1s
- [ ] Mobile tested at 375px, 390px, 430px

### Before marking Admin Dashboard complete:
- [ ] Health monitor shows all 25 engines + 14 providers
- [ ] Client allocation workflow complete
- [ ] All 25 engine status cards correct
- [ ] Engine controls functional
- [ ] External engine adapter UI working

### Cross-Surface:
- [ ] No hardcoded colours — all CSS variables
- [ ] All AI features have confidence indicator
- [ ] All streaming content has aria-live="polite"
- [ ] CMD+K works on admin + client
- [ ] Supabase RLS prevents unauthorized access
- [ ] Dark/light mode works everywhere
