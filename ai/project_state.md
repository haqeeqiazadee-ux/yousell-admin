# YOUSELL Project State

**Last Updated:** 2026-03-13
**Branch:** claude/review-qa-plan-GvHHq

---

## Current Status: QA COMPLETE — CONDITIONAL APPROVAL

Full QA review completed (112 tasks across 25 sprints). 44 bugs identified, 0 critical, 2 HIGH.

---

## Completed Work

### QA Review (S01–S25) — DONE
- Pre-flight & known bug verification
- Architecture review (backend + frontend)
- Scoring engine formulas & classification
- Integration testing (TikTok, Amazon, Pinterest, Shopify, Trends, Influencer, Supplier, Digital)
- Security audit (auth, access control, input validation)
- Performance review
- UI/UX review (admin core, intelligence, client dashboard)
- Error handling & chaos testing
- Data integrity review
- Feature-level testing (allocation, BullMQ, CSV, financial, blueprints, notifications, influencer scoring)
- Final report generated: `ai/qa-final-report.md`

### Stack Migration Notes — DONE
- Cost optimization analysis saved: `ai/stack-migration-notes.md`
- Key recommendations: Netlify → Vercel, Railway → Render + Upstash

---

## Outstanding Issues

### HIGH (Must fix before launch)
1. **BUG-035**: Dual scoring system — legacy `calculateCompositeScore()` (60/40) coexists with correct 3-pillar `calculateFinalScore()` (40/35/25)
2. **BUG-022**: Table name split-brain — frontend reads `scan_history`, backend writes `scans`

### MEDIUM (20 bugs) — See `ai/qa-final-report.md` for full list

### LOW (22 bugs) — Fix as time permits

---

## Architecture Notes
- Next.js 14 App Router + Express backend + BullMQ + Redis + Supabase
- 22 admin API routes, 2 client dashboard routes, 2 auth routes
- 3-pillar scoring engine (Trend 40% / Viral 35% / Profit 25%)
- Apify actors for scraping (TikTok, Amazon, Pinterest, Shopify, Trends)
- See `ai/architecture.md` for full reference
