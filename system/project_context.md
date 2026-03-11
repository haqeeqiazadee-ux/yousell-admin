# YouSell Intelligence Platform — Project Context

**Last Updated:** 2026-03-11
**Repository:** github.com/haqeeqiazadee-ux/yousell-admin

---

## What This Project Is

YouSell is a **multi-platform commerce intelligence SaaS** that detects:
- Viral products across TikTok, Amazon, Shopify, eBay
- Influencers/creators promoting them
- Ecommerce stores selling them
- Ad campaigns scaling them
- Affiliate program opportunities

Think: **FastMoss + JungleScout + PPSPY + Minea** in one platform.

## Business Model

Standalone SaaS — designed to be white-labeled, rebranded, and sold as a subscription service.

## Tech Stack

| Layer | Technology | Deployed On |
|-------|-----------|-------------|
| Frontend | Next.js 14 + React 18 + Tailwind 3 | Netlify |
| Backend | Next.js API Routes (Node.js) | Netlify |
| Database | PostgreSQL | Supabase |
| Workers | Background services | Railway |
| Queue | Redis + BullMQ | Railway/Upstash |
| Email | Transactional emails | Resend |
| AI | Product analysis | Anthropic (Claude) |
| Scraping | Data acquisition | Apify |

## Key Directories

```
src/
├── app/
│   ├── admin/          # All admin dashboard pages
│   ├── api/            # All API routes
│   └── ...
├── components/         # UI components
├── lib/
│   ├── auth/           # Authentication
│   ├── providers/      # API provider configs
│   ├── scoring/        # Scoring algorithms
│   ├── supabase/       # Database client
│   ├── queue/          # Job queue (TO BE BUILT)
│   └── workers/        # Background workers (TO BE BUILT)
├── hooks/              # React hooks
└── middleware.ts       # Auth middleware
system/                 # Session maintenance files (THIS FOLDER)
docs/                   # Project documentation
```

## Current Development Phase

**Phase 1: Infrastructure** — Setting up Redis/BullMQ queue system and worker architecture.

See `/system/development_log.md` for detailed progress tracking.
