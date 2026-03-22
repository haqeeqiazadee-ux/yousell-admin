# YOUSELL Platform — Master Environment Registry

> **Single source of truth** for all API keys, secrets, and config vars.
> Every key listed here, with which services need it, current status, and actual values where known.
>
> **Last updated:** 2026-03-22
>
> **Rule:** When a key changes, update THIS file first, then push to all listed services.

---

## Service Deployment Map

| Service | URL / Dashboard | Purpose |
|---------|----------------|---------|
| **Netlify** | https://app.netlify.com | Frontend hosting (admin.yousell.online + yousell.online) |
| **Railway** | https://railway.app | Backend API + Email Service + Redis |
| **Supabase** | https://supabase.com/dashboard | PostgreSQL, Auth, Realtime, Storage |
| **Redis** | Via Railway add-on | BullMQ job queue + caching |
| **Apify** | https://console.apify.com | Scraping actors (paid plan) |
| **Square** | https://developer.squareup.com | Payments (replaces Stripe) |
| **Resend** | https://resend.com | Transactional email |
| **Anthropic** | https://console.anthropic.com | Claude AI (Haiku bulk, Sonnet premium) |
| **Google Console** | https://console.cloud.google.com | OAuth + Google Trends API |
| **Meta Platform** | https://developers.facebook.com | Facebook/Instagram OAuth + Ads API |
| **TikTok Developer** | https://developers.tiktok.com | TikTok Shop + Research API |
| **GitHub** | https://github.com | VCS + CI/CD secrets |
| **GoDaddy** | https://dcc.godaddy.com | Domain DNS (no API keys — DNS records only) |

---

## KEY STATUS LEGEND

| Symbol | Meaning |
|--------|---------|
| ✅ | Value known, set, and synced across all required services |
| ⚠️ | Needs to be obtained / created |
| ❌ | Not yet set up |
| ➖ | Optional / not needed yet |

---

## 1. CRITICAL REQUIRED (App won't run without these)

| Variable | Status | Value | Netlify | Railway | Local |
|----------|--------|-------|---------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://gqrwienipczrejscqdhk.supabase.co` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | JWT — anon role | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | JWT — service_role | ✅ | ✅ | ✅ |
| `SUPABASE_URL` | ✅ | `https://gqrwienipczrejscqdhk.supabase.co` | ✅ | ✅ | ✅ |
| `ANTHROPIC_API_KEY` | ✅ | `sk-ant-api03-dRJL...RC27JQAA` | ✅ | ✅ | ✅ |
| `APIFY_API_TOKEN` | ✅ | `apify_api_8vso...LDcEu` | ✅ | ✅ | ✅ |
| `RESEND_API_KEY` | ✅ | `re_i9WTCRkp_Nre75uDEfwyLukGHTvWxA99a` | ✅ | ✅ | ✅ |
| `REDIS_URL` | ✅ | Internal: `redis://default:iPFk...@redis.railway.internal:6379` / Public: `redis://default:iPFk...@centerbeam.proxy.rlwy.net:21015` | ✅ (public) | ✅ (internal) | ✅ (public) |
| `RAPIDAPI_KEY` | ✅ | `0e1280d8b3...2967` | ✅ | ✅ | ✅ |
| `ENCRYPTION_KEY` | ✅ | 64-char hex (32 bytes AES-256-GCM) — for Shopify token encryption | ✅ | ✅ | ✅ |

---

## 2. PAYMENTS — SQUARE (replaces Stripe)

| Variable | Value / Status | Netlify | Railway | Local |
|----------|---------------|---------|---------|-------|
| `SQUARE_ACCESS_TOKEN` | ⚠️ Get from Square Developer Dashboard | ❌ | ❌ | ❌ |
| `SQUARE_ENVIRONMENT` | `sandbox` (switch to `production` at launch) | ❌ | ❌ | ✅ |
| `SQUARE_LOCATION_ID` | ⚠️ Get from Square Dashboard → Locations | ❌ | ❌ | ❌ |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | ⚠️ Get after creating webhook endpoint | ❌ | — | ❌ |

> **ACTION:** Old Stripe vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) in `.env.example` need replacing with Square. Dead Stripe code exists in `src/lib/stripe.ts` and `src/app/api/webhooks/stripe/route.ts` — should be deleted.

---

## 3. SITE URLs

| Variable | Value | Netlify | Railway | Local |
|----------|-------|---------|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://yousell.online` | ✅ | — | ✅ |
| `NEXT_PUBLIC_ADMIN_URL` | `https://admin.yousell.online` | ✅ | — | ✅ |
| `NEXT_PUBLIC_BACKEND_URL` | `https://yousell-backend-production.up.railway.app` | ✅ | — | ✅ |
| `BACKEND_URL` | `https://yousell-backend-production.up.railway.app` | ✅ | ✅ | ✅ |
| `FRONTEND_URL` | `https://yousell.online` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_APP_URL` | Same as SITE_URL (fallback to request origin) | ➖ | — | ➖ |

---

## 4. EMAIL

| Variable | Value | Netlify | Railway | Local |
|----------|-------|---------|---------|-------|
| `RESEND_API_KEY` | `re_i9WTCRkp_...A99a` | ✅ | ✅ | ✅ |
| `FROM_EMAIL` | `YouSell <noreply@yousell.online>` | ✅ | ✅ | ✅ |
| `RESEND_FROM` | `YouSell <noreply@yousell.online>` | — | ✅ | ✅ |
| `ADMIN_EMAIL` | `admin@yousell.online` | ✅ | ✅ | ✅ |

> **ACTION:** Verify Resend domain (yousell.online) is verified with DNS records in GoDaddy.

---

## 5. OAUTH — STORE INTEGRATIONS

### Shopify

| Variable | Value / Status | Netlify | Railway |
|----------|---------------|---------|---------|
| `SHOPIFY_CLIENT_ID` | ⚠️ Create Shopify Partner app | ❌ | — |
| `SHOPIFY_CLIENT_SECRET` | ⚠️ From Shopify Partner app | ❌ | — |
| `SHOPIFY_WEBHOOK_SECRET` | ⚠️ From Shopify webhook config | ❌ | — |
| `SHOPIFY_SCRAPER_KEY` | ➖ Fallback if Apify unavailable | ➖ | ➖ |

### TikTok

| Variable | Value / Status | Netlify | Railway |
|----------|---------------|---------|---------|
| `TIKTOK_CLIENT_KEY` | ⚠️ TikTok Developer Portal | ❌ | — |
| `TIKTOK_CLIENT_SECRET` | ⚠️ TikTok Developer Portal | ❌ | — |
| `TIKTOK_SHOP_APP_KEY` | ⚠️ TikTok Shop Partner Center | ❌ | — |
| `TIKTOK_SHOP_APP_SECRET` | ⚠️ TikTok Shop Partner Center | ❌ | — |
| `TIKTOK_WEBHOOK_SECRET` | ✅ Set | ✅ | ✅ |
| `TIKTOK_API_KEY` | ➖ Direct API fallback | ➖ | ➖ |

### Amazon

| Variable | Value / Status | Netlify | Railway |
|----------|---------------|---------|---------|
| `AMAZON_SP_CLIENT_ID` | ⚠️ Amazon SP-API app | ❌ | — |
| `AMAZON_SP_CLIENT_SECRET` | ⚠️ Amazon SP-API app | ❌ | — |
| `AMAZON_PA_API_KEY` | ➖ Product Advertising API | ➖ | ➖ |
| `AMAZON_PA_API_SECRET` | ➖ Product Advertising API | ➖ | ➖ |
| `AMAZON_ASSOCIATE_TAG` | ➖ Affiliate tag | ➖ | ➖ |
| `AMAZON_WEBHOOK_SECRET` | ✅ Set | ✅ | ✅ |

---

## 6. SOCIAL AUTH (Google + Meta)

| Variable | Value / Status | Where to Set |
|----------|---------------|-------------|
| `GOOGLE_CLIENT_ID` | ⚠️ Google Console → Credentials | Supabase Auth → Providers → Google |
| `GOOGLE_CLIENT_SECRET` | ⚠️ Google Console → Credentials | Supabase Auth → Providers → Google |
| `META_APP_ID` | ⚠️ Meta Developer → App Dashboard | Supabase Auth → Providers → Facebook |
| `META_APP_SECRET` | ⚠️ Meta Developer → App Dashboard | Supabase Auth → Providers → Facebook |
| `META_ACCESS_TOKEN` | ✅ Set | ✅ Netlify + Railway |

> **NOTE:** Google/Meta OAuth is configured in **Supabase Dashboard** (Auth → Providers), NOT in env vars.

---

## 7. SCRAPING PROVIDERS

| Variable | Value / Status | Netlify | Railway |
|----------|---------------|---------|---------|
| `APIFY_API_TOKEN` | ✅ Set | ✅ | ✅ |
| `RAPIDAPI_KEY` | ✅ Set | ✅ | ✅ |
| `SERPAPI_KEY` | ➖ Google Trends fallback | ➖ | ➖ |
| `SCRAPE_CREATORS_API_KEY` | ➖ TikTok creator scraping | ➖ | ➖ |

### Provider Selection (controls which scraper backend to use)

| Variable | Default | Netlify | Railway |
|----------|---------|---------|---------|
| `TIKTOK_PROVIDER` | `apify` | ✅ | ✅ |
| `AMAZON_PROVIDER` | `apify_rapidapi` | ✅ | ✅ |
| `INFLUENCER_PROVIDER` | `ainfluencer` | ✅ | ✅ |
| `SUPPLIER_PROVIDER` | `apify` | ✅ | ✅ |
| `SHOPIFY_PROVIDER` | `apify` | ✅ | ✅ |
| `PINTEREST_PROVIDER` | `apify` | ✅ | ✅ |
| `TRENDS_PROVIDER` | `pytrends` | ✅ | ✅ |
| `GOOGLE_TRENDS_PROVIDER` | `pytrends` | ➖ | ➖ |

---

## 8. INFLUENCER / SUPPLIER APIS

| Variable | Value / Status | Where |
|----------|---------------|-------|
| `AINFLUENCER_API_KEY` | ⚠️ aInfluencer platform | Netlify + Railway |
| `HYPEAUDITOR_API_KEY` | ➖ Optional influencer analytics | Netlify + Railway |
| `MODASH_API_KEY` | ➖ Optional influencer discovery | Netlify + Railway |
| `ALIBABA_APP_KEY` | ➖ Direct Alibaba API | Railway |
| `FAIRE_API_KEY` | ➖ Faire wholesale platform | Railway |
| `CJ_DROPSHIPPING_API_KEY` | ➖ CJ Dropshipping API | Railway |

---

## 9. CONTENT & DISTRIBUTION

| Variable | Value / Status | Where |
|----------|---------------|-------|
| `AYRSHARE_API_KEY` | ➖ Social media distribution | Railway |
| `AYRSHARE_ENABLED` | `false` (feature flag) | Railway |
| `SHOPIFY_CONTENT_PUSH_ENABLED` | `false` (feature flag) | Railway |
| `SHOPIFY_PUSH_ENABLED` | `false` (feature flag) | Railway |
| `YOUTUBE_API_KEY` | ➖ YouTube content discovery | Netlify + Railway |

---

## 10. POD (Print-on-Demand)

| Variable | Value / Status | Where |
|----------|---------------|-------|
| `POD_DISCOVERY_ENABLED` | `false` | Railway |
| `POD_PROVISION_ENABLED` | `false` | Railway |
| `POD_SYNC_ENABLED` | `false` | Railway |
| `GELATO_API_KEY` | ➖ Gelato POD provider | Railway |
| `PRINTFUL_API_KEY` | ➖ Printful POD provider | Railway |
| `PRINTIFY_API_KEY` | ➖ Printify POD provider | Railway |

---

## 11. DIGITAL PRODUCTS (Affiliate)

| Variable | Value / Status | Where |
|----------|---------------|-------|
| `CLICKBANK_API_KEY` | ➖ ClickBank affiliate | Netlify |
| `SHAREASALE_API_KEY` | ➖ ShareASale affiliate | Netlify |
| `APPSUMO_API_KEY` | ➖ AppSumo deals | Netlify |
| `UDEMY_AFFILIATE_API_KEY` | ➖ Udemy affiliate | Netlify |
| `PRODUCT_HUNT_API_KEY` | ➖ Product Hunt discovery | Netlify |

---

## 12. BACKEND INTERNAL

| Variable | Value | Netlify | Railway |
|----------|-------|---------|---------|
| `PORT` | `4000` (backend) | — | ✅ |
| `BACKEND_API_KEY` | ✅ Same as `API_SECRET` | ✅ | ✅ |
| `API_SECRET` | ✅ Strong secret set | ✅ | ✅ |
| `RAILWAY_API_SECRET` | ✅ `cc225516-...` | ✅ | — |
| `CORS_ALLOWED_ORIGINS` | `https://admin.yousell.online,https://yousell.online` | ✅ | ✅ |
| `RAILWAY_API_URL` | `yousell-admin-production.up.railway.app` | ✅ | — |

---

## 13. SOCIAL PLATFORMS (Reddit, Pinterest)

| Variable | Value / Status | Where |
|----------|---------------|-------|
| `REDDIT_CLIENT_ID` | ➖ Reddit API app | Netlify + Railway |
| `REDDIT_CLIENT_SECRET` | ➖ Reddit API app | Netlify + Railway |
| `PINTEREST_API_KEY` | ➖ Pinterest API | Netlify + Railway |

---

## APIFY ACTORS (Paid Account)

| Actor | ID | Purpose |
|-------|----|---------|
| Alibaba Listings Scraper | `8EM2KQP90np87iSY5` | Supplier discovery |
| Alibaba Products Scraper | `FJT0ySe7zTfidYPMD` | Product/supplier data |
| Shopify Product Search | `nICdYs6CuDgCI6CuV` | Competitor store scraping |

> **NOTE:** More actors needed for TikTok, Amazon, Pinterest scraping. Check Apify Store.

---

## SYNC STATUS — 2026-03-21

All critical vars are now synced across Netlify (both projects), Railway (backend + email + redis), and local .env.local.

### What's still needed (priority order):

1. **Square credentials** — Get from Square Developer Dashboard (sandbox first)
2. **Google OAuth** — Google Console → Supabase Auth Providers
3. **Meta OAuth** — Meta Developer → Supabase Auth Providers
4. **Delete dead Stripe code** — `src/lib/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`
5. **Shopify Partner app** — ⚠️ Phase 2A complete, create app in Shopify Partners to get `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET`
6. **TikTok Developer app** — When Phase 2B starts
7. **Verify Resend domain DNS** — GoDaddy SPF/DKIM/DMARC records

---

## DEPRECATED (DO NOT USE)

| Variable | Replaced By | Reason |
|----------|------------|--------|
| `STRIPE_SECRET_KEY` | `SQUARE_ACCESS_TOKEN` | Switched to Square |
| `STRIPE_WEBHOOK_SECRET` | `SQUARE_WEBHOOK_SIGNATURE_KEY` | Switched to Square |
| `APIFY_API_KEY` | `APIFY_API_TOKEN` | Renamed for consistency |
| `FIRECRAWL_API_KEY` | — | Gap analyzer only, not production |
