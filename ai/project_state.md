# YouSell Admin — Project State

Last updated: 2026-03-10

## Overall Status: ~78% Spec Compliance

Based on comprehensive audit of 95+ files against the master spec.

## Completed Components

- [x] Next.js 14 project with TypeScript strict mode
- [x] Supabase auth integration (server/client/admin clients, middleware)
- [x] Admin dashboard with KPI cards, pre-viral alerts, scan control, realtime feed
- [x] 21 admin pages covering all major sections
- [x] Client dashboard pages (products, requests)
- [x] 26 Next.js API routes
- [x] Admin sidebar component (18 nav items, 4 groups)
- [x] Composite scoring engine (3-pillar: trend/viral/profit)
- [x] Auto-rejection rules (5 spec rules + 3 bonus)
- [x] Provider abstraction layer with cache
- [x] Database schema (20+ tables with RLS)
- [x] Express backend with auth, rate limiting, BullMQ
- [x] Email service (Resend) with batching
- [x] Dark mode support
- [x] Product card component (score gauge, tier badge, actions)
- [x] Client management CRUD with plan tiers
- [x] Product allocation with visibility toggle
- [x] Blueprint page with PDF export
- [x] Settings page (Providers/Automation/System tabs)
- [x] Supabase realtime subscriptions
- [x] Netlify deployment config

## Partially Implemented

- [ ] Admin sidebar — component exists, wired into layout but QA flagged issues
- [ ] Scoring tier thresholds — 3 conflicting systems (should be 80/60/40 everywhere)
- [ ] Backend worker — uses legacy 2-factor scoring, not 3-pillar
- [ ] API route authorization — only 2/22 admin routes check admin role
- [ ] Platform providers — call placeholder URLs, not real APIs
- [ ] Client dashboard — wrong ID in queries (auth.uid vs client.id)
- [ ] Scan page — client mode exists but no client selector
- [ ] Middleware — redirects non-admin to /login instead of /unauthorized
- [ ] CSV import — naive comma parsing breaks on quoted fields

## Missing Components

- [ ] **Apify SDK integration** — token defined but never used
- [ ] **Backend sync pipeline** (apify-client, transform-listing, sync-listings, scheduler)
- [ ] **Real data ingestion pipeline** (Apify → normalize → Supabase)
- [ ] Analytics dashboard (stub page only)
- [ ] Reports/export page
- [ ] Test suite (zero test files)
- [ ] Scheduler for periodic sync jobs
- [ ] Real influencer/supplier API integrations
- [ ] Excel (.xlsx) import support

## Critical Bugs (P0)

1. Scoring tier thresholds inconsistent across 4 files
2. Service role key exposure risk in `src/lib/supabase.ts` (has server-only guard now)
3. Client dashboard queries use wrong ID
4. Backend worker uses legacy scoring
5. 20/22 admin API routes missing role check

## Recent Changes (from git log)

- Admin sidebar wired into layout
- Auth SSR cookie reading fixed
- Product edit/delete added
- Scan client selector added
- Migration numbering fixed, GBP→USD default
- ESLint downgraded to v8 for compatibility
- Client dashboard ID lookup fixed via email join
- next/image remote patterns configured
