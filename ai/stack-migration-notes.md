# Stack Migration Notes

Created: 2026-03-12
Status: PENDING REVIEW

---

## Current Stack & Suggested Alternatives

### 1) Netlify → Vercel (TOP PRIORITY)

- Vercel is native home for Next.js 14 App Router
- 6000 build min/mo vs Netlify's 300
- No adapter needed for SSR, ISR, middleware, server actions
- Alternative: Cloudflare Pages (unlimited builds/bandwidth, more setup)

### 2) GitHub → Keep

- No change needed, free for private repos

### 3) Supabase → Keep

- Postgres + Auth + Realtime in one service
- Pro plan $25/mo is fair
- If outgrown: Neon + Clerk + Ably (higher complexity)

### 4) Resend → Keep

- Already cheap (3K emails/mo free, $20/mo for 50K)
- Alternatives: Plunk (open source), AWS SES ($0.10/1K emails at scale)

### 5) Railway → Render + Upstash Redis

- Render: 750 hrs/mo free for Express API + BullMQ worker
- Upstash Redis: free tier 10K commands/day (replaces paid Redis add-on)
- Alternative: Fly.io for always-on workers

---

## Missing from Stack

| Gap               | Suggestion                                      |
|-------------------|------------------------------------------------|
| Monitoring/Errors | Sentry (free: 5K errors/mo) or BetterStack    |
| Uptime monitoring | BetterUptime or UptimeRobot (free)             |
| Analytics         | Plausible ($9/mo) or Umami (free, self-hosted) |
| Rate limiting     | Upstash Ratelimit (free tier)                  |
| Cron jobs         | Vercel Cron or Upstash QStash                  |

---

## TL;DR — Biggest Wins

1. Netlify → Vercel (better DX + more free builds)
2. Railway + Redis → Render + Upstash Redis (free tier covers backend)
3. Everything else → keep as-is
