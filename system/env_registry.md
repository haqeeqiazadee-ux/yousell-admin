# YOUSELL Platform — Master Environment Registry

> **Single source of truth** for all API keys, secrets, and config vars.
> Every key listed here, with which services need it, current status, and actual values where known.
>
> **Last updated:** 2026-03-21
>
> **Rule:** When a key changes, update THIS file first, then push to all listed services.

---

## Service Deployment Map

| Service | URL / Dashboard | Purpose |
|---------|----------------|---------|
| **Netlify** | https://app.netlify.com | Frontend hosting (admin.yousell.online + yousell.online) |
| **Railway** | https://railway.app | Backend API + BullMQ workers |
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
| ✅ | Value known and saved locally |
| ⚠️ | Needs to be obtained / created |
| 🔄 | Exists but needs syncing across services |
| ❌ | Not yet set up |
| ➖ | Optional / not needed yet |

---

## 1. CRITICAL REQUIRED (App won't run without these)

| Variable | Value / Status | Netlify | Railway | Local |
|----------|---------------|---------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ `https://gqrwienipczrejscqdhk.supabase.co` | MUST SET | MUST SET | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ (JWT — anon role) | MUST SET | — | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ (JWT — service_role) | MUST SET | MUST SET | ✅ |
| `SUPABASE_URL` | ✅ Same as NEXT_PUBLIC_SUPABASE_URL | — | MUST SET | ✅ |
| `ANTHROPIC_API_KEY` | ⚠️ NEEDS VALUE | MUST SET | MUST SET | ❌ |
| `APIFY_API_TOKEN` | ✅ `apify_api_7hWK...bkbzg` | MUST SET | MUST SET | ✅ |
| `RESEND_API_KEY` | ⚠️ NEEDS VALUE | MUST SET | MUST SET | ❌ |
| `REDIS_URL` | ⚠️ Railway provides this | — | AUTO | ❌ |

---

## 2. PAYMENTS — SQUARE (replaces Stripe)

| Variable | Value / Status | Netlify | Railway | Local |
|----------|---------------|---------|---------|-------|
| `SQUARE_ACCESS_TOKEN` | ⚠️ Get from Square Developer Dashboard | MUST SET | MUST SET | ❌ |
| `SQUARE_ENVIRONMENT` | `sandbox` (switch to `production` at launch) | MUST SET | MUST SET | ✅ |
| `SQUARE_LOCATION_ID` | ⚠️ Get from Square Dashboard → Locations | MUST SET | MUST SET | ❌ |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | ⚠️ Get after creating webhook endpoint | MUST SET | — | ❌ |

> **ACTION:** Old Stripe vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) in `.env.example` need replacing with Square.

---

## 3. SITE URLs

| Variable | Value / Status | Netlify | Railway | Local |
|----------|---------------|---------|---------|-------|
| `NEXT_PUBLIC_SITE_URL` | Production: `https://yousell.online` | MUST SET | — | ✅ (localhost) |
| `NEXT_PUBLIC_ADMIN_URL` | Production: `https://admin.yousell.online` | MUST SET | — | ✅ (localhost) |
| `NEXT_PUBLIC_BACKEND_URL` | ⚠️ Railway deploy URL | MUST SET | — | ✅ (localhost:3001) |
| `FRONTEND_URL` | Production: `https://admin.yousell.online` | — | MUST SET | ✅ (localhost) |
| `NEXT_PUBLIC_APP_URL` | Same as SITE_URL (fallback to request origin) | OPTIONAL | — | ➖ |

---

## 4. EMAIL

| Variable | Value / Status | Netlify | Railway | Local |
|----------|---------------|---------|---------|-------|
| `RESEND_API_KEY` | ⚠️ NEEDS VALUE | MUST SET | MUST SET | ❌ |
| `FROM_EMAIL` | `noreply@yousell.online` | MUST SET | MUST SET | ➖ |
| `RESEND_FROM` | `YouSell <noreply@yousell.online>` | — | MUST SET | ➖ |
| `ADMIN_EMAIL` | `admin@yousell.online` | MUST SET | MUST SET | ➖ |

> **ACTION:** Verify Resend domain (yousell.online) is verified with DNS records in GoDaddy.

---

## 5. OAUTH — STORE INTEGRATIONS

### Shopify

| Variable | Value / Status | Netlify | Railway |
|----------|---------------|---------|---------|
| `SHOPIFY_CLIENT_ID` | ⚠️ Create Shopify Partner app | MUST SET | — |
| `SHOPIFY_CLIENT_SECRET` | ⚠️ From Shopify Partner app | MUST SET | — |
| `SHOPIFY_WEBHOOK_SECRET` | ⚠️ From Shopify webhook config | MUST SET | — |
| `SHOPIFY_SCRAPER_KEY` | ➖ Fallback if Apify unavailable | OPTIONAL | OPTIONAL |

### TikTok

| Variable | Value / Status | Netlify | Railway |
|----------|---------------|---------|---------|
| `TIKTOK_CLIENT_KEY` | ⚠️ TikTok Developer Portal | MUST SET | — |
| `TIKTOK_CLIENT_SECRET` | ⚠️ TikTok Developer Portal | MUST SET | — |
| `TIKTOK_SHOP_APP_KEY` | ⚠️ TikTok Shop Partner Center | MUST SET | — |
| `TIKTOK_SHOP_APP_SECRET` | ⚠️ TikTok Shop Partner Center | MUST SET | — |
| `TIKTOK_WEBHOOK_SECRET` | ⚠️ TikTok webhook config | MUST SET | — |
| `TIKTOK_API_KEY` | ➖ Direct API fallback | OPTIONAL | OPTIONAL |
| `TIKTOK_RESEARCH_API_KEY` | ➖ Research API access | OPTIONAL | OPTIONAL |
| `TIKTOK_CREATIVE_CENTER_KEY` | ➖ Creative Center API | OPTIONAL | OPTIONAL |

### Amazon

| Variable | Value / Status | Netlify | Railway |
|----------|---------------|---------|---------|
| `AMAZON_SP_CLIENT_ID` | ⚠️ Amazon SP-API app | MUST SET | — |
| `AMAZON_SP_CLIENT_SECRET` | ⚠️ Amazon SP-API app | MUST SET | — |
| `AMAZON_PA_API_KEY` | ➖ Product Advertising API | OPTIONAL | OPTIONAL |
| `AMAZON_PA_API_SECRET` | ➖ Product Advertising API | OPTIONAL | OPTIONAL |
| `AMAZON_ASSOCIATE_TAG` | ➖ Affiliate tag | OPTIONAL | OPTIONAL |
| `AMAZON_WEBHOOK_SECRET` | ⚠️ Webhook verification | MUST SET | — |

---

## 6. SOCIAL AUTH (Google + Meta)

| Variable | Value / Status | Where to Set |
|----------|---------------|-------------|
| `GOOGLE_CLIENT_ID` | ⚠️ Google Console → Credentials | Supabase Auth → Providers → Google |
| `GOOGLE_CLIENT_SECRET` | ⚠️ Google Console → Credentials | Supabase Auth → Providers → Google |
| `META_APP_ID` | ⚠️ Meta Developer → App Dashboard | Supabase Auth → Providers → Facebook |
| `META_APP_SECRET` | ⚠️ Meta Developer → App Dashboard | Supabase Auth → Providers → Facebook |
| `META_ACCESS_TOKEN` | ⚠️ Meta Marketing API | Railway (backend ads job) |

> **NOTE:** Google/Meta OAuth is configured in **Supabase Dashboard** (Auth → Providers), NOT in env vars.
> The Supabase client handles the OAuth flow automatically.

---

## 7. SCRAPING PROVIDERS

| Variable | Value / Status | Netlify | Railway |
|----------|---------------|---------|---------|
| `APIFY_API_TOKEN` | ✅ Set | MUST SET | MUST SET |
| `RAPIDAPI_KEY` | ➖ Amazon fallback | OPTIONAL | OPTIONAL |
| `SERPAPI_KEY` | ➖ Google Trends fallback | OPTIONAL | OPTIONAL |
| `SCRAPE_CREATORS_API_KEY` | ➖ TikTok creator scraping | OPTIONAL | OPTIONAL |

### Provider Selection (controls which scraper backend to use)

| Variable | Default | Netlify | Railway |
|----------|---------|---------|---------|
| `TIKTOK_PROVIDER` | `apify` | MUST SET | MUST SET |
| `AMAZON_PROVIDER` | `apify_rapidapi` | MUST SET | MUST SET |
| `INFLUENCER_PROVIDER` | `ainfluencer` | MUST SET | MUST SET |
| `SUPPLIER_PROVIDER` | `apify` | MUST SET | MUST SET |
| `SHOPIFY_PROVIDER` | `apify` | MUST SET | MUST SET |
| `PINTEREST_PROVIDER` | `apify` | MUST SET | MUST SET |
| `TRENDS_PROVIDER` | `pytrends` | MUST SET | MUST SET |
| `GOOGLE_TRENDS_PROVIDER` | `pytrends` | MUST SET | MUST SET |

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

| Variable | Value / Status | Where |
|----------|---------------|-------|
| `PORT` | `3001` (backend) / `4000` (alt) | Railway |
| `BACKEND_API_KEY` | ⚠️ Shared secret frontend↔backend | Netlify + Railway |
| `CORS_ALLOWED_ORIGINS` | Production URLs | Railway |

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

## SYNC CHECKLIST — Copy to each platform

### Netlify (Site → Environment Variables)
```
NEXT_PUBLIC_SUPABASE_URL=https://gqrwienipczrejscqdhk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon JWT>
SUPABASE_SERVICE_ROLE_KEY=<service role JWT>
NEXT_PUBLIC_SITE_URL=https://yousell.online
NEXT_PUBLIC_ADMIN_URL=https://admin.yousell.online
NEXT_PUBLIC_BACKEND_URL=<railway deploy URL>
ANTHROPIC_API_KEY=<from Anthropic console>
APIFY_API_TOKEN=apify_api_7hWK...bkbzg
RESEND_API_KEY=<from Resend dashboard>
FROM_EMAIL=noreply@yousell.online
ADMIN_EMAIL=admin@yousell.online
SQUARE_ACCESS_TOKEN=<from Square developer>
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=<from Square dashboard>
SQUARE_WEBHOOK_SIGNATURE_KEY=<from Square webhook>
SHOPIFY_CLIENT_ID=<from Shopify Partner>
SHOPIFY_CLIENT_SECRET=<from Shopify Partner>
TIKTOK_CLIENT_KEY=<from TikTok Developer>
TIKTOK_CLIENT_SECRET=<from TikTok Developer>
AMAZON_SP_CLIENT_ID=<from Amazon SP-API>
AMAZON_SP_CLIENT_SECRET=<from Amazon SP-API>
BACKEND_API_KEY=<generate shared secret>
TIKTOK_PROVIDER=apify
AMAZON_PROVIDER=apify_rapidapi
INFLUENCER_PROVIDER=ainfluencer
SUPPLIER_PROVIDER=apify
SHOPIFY_PROVIDER=apify
PINTEREST_PROVIDER=apify
TRENDS_PROVIDER=pytrends
GOOGLE_TRENDS_PROVIDER=pytrends
```

### Railway (Project → Variables)
```
PORT=3001
REDIS_URL=<railway auto-provides>
SUPABASE_URL=https://gqrwienipczrejscqdhk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role JWT>
ANTHROPIC_API_KEY=<same as Netlify>
APIFY_API_TOKEN=apify_api_7hWK...bkbzg
RESEND_API_KEY=<same as Netlify>
RESEND_FROM=YouSell <noreply@yousell.online>
ADMIN_EMAIL=admin@yousell.online
FRONTEND_URL=https://admin.yousell.online
BACKEND_API_KEY=<same shared secret as Netlify>
CORS_ALLOWED_ORIGINS=https://admin.yousell.online,https://yousell.online
SQUARE_ACCESS_TOKEN=<same as Netlify>
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=<same as Netlify>
META_ACCESS_TOKEN=<from Meta Marketing API>
TIKTOK_PROVIDER=apify
AMAZON_PROVIDER=apify_rapidapi
SUPPLIER_PROVIDER=apify
```

### Supabase (Dashboard → Auth → Providers)
```
Google OAuth:
  - Client ID: <from Google Console>
  - Client Secret: <from Google Console>
  - Redirect URL: https://gqrwienipczrejscqdhk.supabase.co/auth/v1/callback

Facebook OAuth:
  - App ID: <from Meta Developer>
  - App Secret: <from Meta Developer>
  - Redirect URL: https://gqrwienipczrejscqdhk.supabase.co/auth/v1/callback
```

### GoDaddy DNS Records (for Resend email + Netlify)
```
Required for Resend (email delivery):
  - SPF TXT record
  - DKIM CNAME records (3x)
  - DMARC TXT record

Required for Netlify:
  - A record → Netlify load balancer IP
  - CNAME: admin → Netlify site
  - CNAME: www → Netlify site
```

---

## IMMEDIATE ACTION ITEMS (Priority Order)

1. **Get Anthropic API key** → Set in Netlify + Railway + .env.local
2. **Get Resend API key** → Set in Netlify + Railway + .env.local → Verify domain DNS in GoDaddy
3. **Get Square sandbox credentials** → Set in Netlify + Railway + .env.local
4. **Configure Google OAuth** → Google Console → Supabase Auth Providers
5. **Configure Meta OAuth** → Meta Developer → Supabase Auth Providers
6. **Generate BACKEND_API_KEY** → Shared secret for frontend↔backend auth
7. **Deploy Railway** → Get REDIS_URL + deploy URL → Set NEXT_PUBLIC_BACKEND_URL in Netlify
8. **Set Netlify env vars** → Copy from sync checklist above
9. **Set Railway env vars** → Copy from sync checklist above
10. **Verify GoDaddy DNS** → Resend domain verification + Netlify DNS

---

## DEPRECATED (DO NOT USE)

| Variable | Replaced By | Reason |
|----------|------------|--------|
| `STRIPE_SECRET_KEY` | `SQUARE_ACCESS_TOKEN` | Switched to Square |
| `STRIPE_WEBHOOK_SECRET` | `SQUARE_WEBHOOK_SIGNATURE_KEY` | Switched to Square |
| `APIFY_API_KEY` | `APIFY_API_TOKEN` | Renamed for consistency |
| `FIRECRAWL_API_KEY` | — | Gap analyzer only, not production |
