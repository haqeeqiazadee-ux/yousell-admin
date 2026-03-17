# YOUSELL — Content Creation, Publishing & Shop Integration Strategy

## Version 1.0 — March 2026

**Status:** APPROVED STRATEGY — Supplements the v7 Technical Specification

---

# TABLE OF CONTENTS

1. [Terminology Standards](#1-terminology-standards)
2. [Architecture Overview](#2-architecture-overview)
3. [Shop Integration Engine](#3-shop-integration-engine)
4. [Content Creation Engine](#4-content-creation-engine)
5. [Content Publishing Engine](#5-content-publishing-engine)
6. [Social Media Platform Linking](#6-social-media-platform-linking)
7. [The Automation–Control Spectrum](#7-the-automationcontrol-spectrum)
8. [Product Upload Workflow](#8-product-upload-workflow)
9. [Content Lifecycle Workflow](#9-content-lifecycle-workflow)
10. [Database Schema Additions](#10-database-schema-additions)
11. [Implementation Phases](#11-implementation-phases)
12. [Cost Projections](#12-cost-projections)
13. [POD (Print on Demand) Integration](#13-pod-print-on-demand-integration)
14. [Affiliate Commission Engine Integration](#14-affiliate-commission-engine-integration)

---

# 1. TERMINOLOGY STANDARDS

## 1.1 Customer-Facing Language Rules

All client-facing UI, emails, notifications, and marketing materials must use professional, market-oriented language. The following substitutions are MANDATORY:

| NEVER Use (Internal Only) | ALWAYS Use (Client-Facing) |
|---|---|
| Scrape / Scraper | Discover / Market Intelligence |
| Scan / Scanner | Product Finder / Trend Analysis |
| Crawl / Crawler | Research / Market Research |
| Scrap data | Market data / Intelligence data |
| Run a scan | Run product discovery / Analyse market |
| Scan results | Discovery results / Market insights |
| Scraping job | Research task / Intelligence task |
| Raw listings | Source data |
| Data collection | Market intelligence gathering |
| Spider | Research engine |

## 1.2 Engine Naming (Client-Facing)

| Internal Name | Client-Facing Name | Description |
|---|---|---|
| Content Creation Engine | Creative Studio | AI-powered marketing content generator |
| Content Publishing Engine | Smart Publisher | Automated multi-channel content distribution |
| Store Integration Engine | Shop Connect | One-click store setup and product sync |
| Product Discovery Engine | Product Finder | AI-powered trending product intelligence |
| Influencer Outreach Engine | Creator Connect | Influencer matching and outreach automation |
| Supplier Discovery Engine | Supplier Finder | Verified supplier matching |
| Analytics Engine | Performance Hub | Real-time analytics and profit tracking |
| Marketing Engine | Ad Studio | Ad creative and campaign automation |

## 1.3 Implementation Rule

Create a shared constants file at `src/lib/terminology.ts` that maps internal terms to client-facing terms. All dashboard UI components must import from this file. Admin-facing pages may use internal terms. Client-facing pages must always use the mapped terms.

---

# 2. ARCHITECTURE OVERVIEW

## 2.1 Three Interconnected Engines

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT DASHBOARD                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐             │
│  │  Shop     │  │  Creative    │  │  Smart        │             │
│  │  Connect  │  │  Studio      │  │  Publisher    │             │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘             │
│       │               │                   │                      │
└───────┼───────────────┼───────────────────┼──────────────────────┘
        │               │                   │
        ▼               ▼                   ▼
┌───────────────┐ ┌──────────────┐ ┌────────────────────┐
│ SHOP CONNECT  │ │ CREATIVE     │ │ SMART PUBLISHER    │
│ (Native OAuth)│ │ STUDIO       │ │ (Ayrshare API)     │
│               │ │              │ │                    │
│ • Shopify API │ │ • Claude AI  │ │ • 13+ platforms    │
│ • TikTok Shop │ │   (text)     │ │ • Single API call  │
│   Partner API │ │ • Shotstack  │ │ • Per-client       │
│ • Amazon      │ │   (video)    │ │   profiles         │
│   SP-API      │ │ • Bannerbear │ │ • Schedule +       │
│ • Meta        │ │   (images)   │ │   publish          │
│   Commerce    │ │              │ │                    │
└───────┬───────┘ └──────┬───────┘ └────────┬───────────┘
        │               │                   │
        ▼               ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              BullMQ Job Queue (Redis)                 │
│  content-queue │ publish-queue │ shop-sync-queue     │
└─────────────────────────────────────────────────────┘
        │               │                   │
        ▼               ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                     │
│  content_items │ publish_log │ shop_products         │
└─────────────────────────────────────────────────────┘
```

## 2.2 Design Principles

1. **Shop integrations use native OAuth.** Shop APIs (Shopify, TikTok Shop, Amazon SP-API) and POD fulfillment partners (Printful, Printify, Gelato) require deep integration for product management, inventory sync, order tracking, and fulfillment routing. These cannot be abstracted through a third party.

2. **Content publishing uses Ayrshare.** Social media publishing across 13+ platforms through a single API eliminates the need to build and maintain separate OAuth flows, API contracts, rate limit handling, and platform approval processes for each social network. Massive engineering scope reduction.

3. **Content creation is a multi-tool pipeline.** Different content types need different tools — Claude AI for text, Shotstack for video, Bannerbear for images. All orchestrated through our BullMQ worker.

4. **Review & Approve by default.** Nothing publishes or uploads automatically until the client explicitly enables auto-mode for that specific action. Start with human-in-the-loop; graduate to automation.

---

# 3. SHOP INTEGRATION ENGINE (Shop Connect)

## 3.1 Supported Platforms (Phase Order)

| Platform | API | OAuth Flow | Priority |
|---|---|---|---|
| Shopify | GraphQL Admin API (2026-01) | Standard OAuth 2.0 | Phase 2A |
| TikTok Shop | TikTok Shop Partner API v2 | OAuth 2.0 + Request Signing | Phase 2B |
| Amazon | SP-API (Selling Partner API) | Login with Amazon (LWA) | Phase 3 |
| Meta/Instagram | Graph API v25.0 + Product Catalog | Meta Business Extension (MBE) | Phase 3 |
| Printful (POD) | REST API + Webhooks | OAuth 2.0 | Phase 3 |
| Printify (POD) | REST API v1 | API Key | Phase 3 |
| Gelato (POD) | REST API v3 | API Key | Phase 3 |

## 3.2 Shopify Integration (Phase 2A — First)

**Why first:** Simplest OAuth, best documented, largest merchant base, GraphQL API is modern and well-maintained.

**OAuth Flow:**
1. Client clicks "Connect Shopify Store" → redirect to `https://{shop}.myshopify.com/admin/oauth/authorize`
2. Scopes requested: `write_products`, `read_products`, `write_inventory`, `read_inventory`, `read_orders`
3. Merchant approves → callback with code
4. Exchange code for **permanent offline access token**
5. Encrypt token → store in `client_channels` table
6. Verify connection by fetching shop info → display store name in dashboard

**Product Upload via GraphQL:**
```
productSet mutation → creates or updates in a single call
productCreateMedia → attaches images/videos
productVariantsBulkCreate → creates variants (sizes, colours)
```

**Sync Strategy:**
- **Push:** YouSell pushes products to Shopify on client approval
- **Pull (optional):** Webhook subscription for order updates → `client_orders` table
- **Inventory:** Real-time inventory sync via Shopify webhooks

## 3.3 TikTok Shop Integration (Phase 2B)

**Critical Requirements:**
- Must register in TikTok Shop Partner Center (US portal specifically)
- All API calls require request signing (HMAC-SHA256)
- Rate limit: 50 req/sec per store

**OAuth Flow:**
1. Client clicks "Connect TikTok Shop" → redirect to TikTok auth endpoint
2. Scopes: product management, order management, inventory
3. Merchant approves → exchange code for access + refresh tokens
4. All subsequent API calls include signature header

**Product Upload:**
```
POST /localservice/saas/product/save/ → Full product creation (no partial updates)
POST /localservice/saas/product_opt_category/query/ → Get valid categories first
```

**Key Limitation:** Product review by TikTok is required before listing goes live. After initial review, price/inventory changes are instant.

## 3.4 Amazon SP-API Integration (Phase 3)

**OAuth Flow:** Login with Amazon (LWA) — standard OAuth 2.0 with role-based permissions.

**Product Upload:** Uses Feeds API — submit XML/JSON product feed → Amazon processes asynchronously → poll for completion status.

**Key Consideration:** Amazon product listing requires UPC/EAN barcodes, brand registry for certain categories, and content compliance checks. More complex than Shopify.

## 3.5 Meta Commerce Integration (Phase 3)

**Architecture Change (September 2025):** In-app checkout has ended. All Facebook/Instagram Shopping now drives traffic to the merchant's external website. This means Meta integration is primarily about **product catalog visibility**, not direct sales processing.

**Integration Path:** Meta Business Extension (MBE) — popup OAuth flow that sets up Conversions API, Meta Pixel, and Product Catalog in one step.

**Product Upload:** Batch API `POST /{catalog_id}/items_batch` or scheduled data feed upload.

---

# 4. CONTENT CREATION ENGINE (Creative Studio)

## 4.1 Content Types and Tools

| Content Type | AI Tool | Input | Output | Est. Cost |
|---|---|---|---|---|
| Social captions | Claude Haiku | Product data + platform rules | Platform-optimised text | ~$0.001/post |
| Ad copy | Claude Sonnet | Product data + audience targeting | Headlines, descriptions, CTAs | ~$0.01/post |
| Video scripts | Claude Sonnet | Product data + hook structure | 15-60sec script with shot list | ~$0.01/script |
| Short-form video | Shotstack API | Product images + script + music | 15-60sec MP4 | ~$0.40/video |
| Product images | Bannerbear API | Product photo + template | Branded lifestyle images | ~$0.10/image |
| Email sequences | Claude Haiku | Product data + sequence type | 3-5 email drip campaign | ~$0.005/sequence |
| Blog/SEO content | Claude Sonnet | Product data + keywords | 500-1500 word article | ~$0.02/article |
| Carousel posts | Bannerbear API | Product photos + copy | Multi-slide image set | ~$0.30/carousel |

## 4.2 Content Generation Pipeline

```
1. CLIENT selects product(s) → clicks "Create Content"
   OR system auto-triggers for allocated HOT products (if auto-mode ON)

2. CONTENT PLANNER (Claude Haiku) analyses:
   - Product data (name, description, price, images, scores)
   - Target platform(s) (TikTok, Instagram, Facebook, Pinterest, YouTube)
   - Client's brand voice (stored in client_settings)
   - Past performance data (what content types convert for this client)
   - Current trends (trending sounds, hashtags, hooks)

3. CONTENT PLANNER outputs a CONTENT BRIEF:
   {
     "product_id": "...",
     "content_plan": [
       { "type": "tiktok_video", "hook": "...", "script": "...", "duration": 30 },
       { "type": "instagram_carousel", "slides": 5, "captions": [...] },
       { "type": "facebook_post", "copy": "...", "cta": "..." },
       { "type": "pinterest_pin", "title": "...", "description": "..." }
     ]
   }

4. CLIENT REVIEWS the content brief:
   ┌─────────────────────────────────────────────┐
   │  📋 Content Brief for "LED Sunset Lamp"     │
   │                                               │
   │  ☐ TikTok Video (30s) — "3 reasons..."      │
   │    [Preview Script] [Edit] [Skip]             │
   │                                               │
   │  ☐ Instagram Carousel (5 slides)             │
   │    [Preview Slides] [Edit] [Skip]             │
   │                                               │
   │  ☐ Facebook Post                              │
   │    [Preview Copy] [Edit] [Skip]               │
   │                                               │
   │  ☐ Pinterest Pin                              │
   │    [Preview] [Edit] [Skip]                    │
   │                                               │
   │  [✓ Approve & Generate]  [Edit All]  [Cancel] │
   └─────────────────────────────────────────────┘

5. GENERATION WORKERS execute approved items:
   - Text content: Claude Haiku/Sonnet → ready immediately
   - Video content: Shotstack API → webhook on completion (~30-120 sec)
   - Image content: Bannerbear API → webhook on completion (~10-30 sec)

6. GENERATED CONTENT lands in client's CONTENT LIBRARY:
   - Preview all generated assets
   - Edit text directly in browser
   - Re-generate any asset (costs new credit)
   - Approve for publishing → moves to Smart Publisher queue
```

## 4.3 Brand Voice Configuration

On first use, the client configures their brand voice through a guided setup:

```
┌─────────────────────────────────────────────────────┐
│  🎨 Set Up Your Brand Voice                         │
│                                                       │
│  Brand Name: [_______________]                       │
│                                                       │
│  Tone: ○ Professional  ○ Casual  ○ Playful          │
│        ○ Bold/Edgy  ○ Luxury  ○ Educational         │
│                                                       │
│  Target Audience: [_______________]                   │
│  (e.g., "Women 25-40 interested in home decor")     │
│                                                       │
│  Emoji Style: ○ None  ○ Minimal  ○ Moderate  ○ Heavy │
│                                                       │
│  Key Phrases to Include: [_______________]           │
│  (comma-separated brand phrases/taglines)            │
│                                                       │
│  Phrases to Avoid: [_______________]                 │
│  (competitor names, inappropriate terms, etc.)       │
│                                                       │
│  Sample Post (optional): [paste example content]     │
│                                                       │
│  [Save Brand Voice]                                  │
└─────────────────────────────────────────────────────┘
```

Stored in `client_settings` JSONB column. Used as system prompt context for all Claude content generation calls.

## 4.4 Content Templates

Pre-built templates for common content patterns:

| Template | Platform | Structure | Best For |
|---|---|---|---|
| Problem → Solution | TikTok, Instagram Reels | Hook → Pain point → Product reveal → CTA | Impulse products |
| Unboxing Reveal | TikTok, YouTube Shorts | Package arrival → Unboxing → First impression → Link | Physical products |
| Before/After | Instagram, Pinterest | Side-by-side comparison → Transformation | Beauty, home, fitness |
| Listicle | Pinterest, Blog | "5 reasons you need..." → Numbered points | SEO, evergreen |
| Trend Hijack | TikTok | Current trend audio → Product tie-in | Viral moments |
| Comparison | YouTube, Blog | "Product X vs Y" → Feature breakdown | High-consideration |
| Testimonial Style | Facebook, Instagram | Customer quote → Product shot → CTA | Social proof |
| Deal Alert | All platforms | Urgency → Discount → Countdown → Link | Promotions |

## 4.5 Platform-Specific Formatting

The content engine auto-formats output per platform requirements:

| Platform | Max Length | Hashtags | Media | Special Rules |
|---|---|---|---|---|
| TikTok | 2200 chars | 3-5 trending | Video required (9:16) | Sound/music selection, disclosure label |
| Instagram Feed | 2200 chars | 20-30 | Image/carousel (1:1, 4:5) | First line is the hook |
| Instagram Reels | 2200 chars | 3-5 | Video (9:16) | Similar to TikTok |
| Facebook | 63,206 chars | 1-3 | Image/video/link | Longer form OK, link in post |
| Pinterest | 500 chars (desc) | 2-5 keyword tags | Image (2:3) | SEO-heavy titles |
| YouTube Shorts | 100 chars (title) | 3-5 | Video (9:16, <60s) | Strong title + first frame |
| LinkedIn | 3000 chars | 3-5 | Image/video/document | Professional tone |
| X/Twitter | 280 chars | 1-3 | Image/video | Concise, conversational |

---

# 5. CONTENT PUBLISHING ENGINE (Smart Publisher)

## 5.1 Architecture Decision: Ayrshare

**Decision:** Use Ayrshare as the social media publishing layer.

**Rationale:**
- Supports 13+ platforms through a single API (TikTok, Instagram, Facebook, YouTube, Pinterest, LinkedIn, X/Twitter, Reddit, Threads, Google Business Profile, Telegram, Snapchat, Bluesky)
- Channel #8 — POD (Print on Demand): Printful, Printify, Gelato integrated as fulfillment channels for product creation, order routing, and mockup generation
- Handles all platform-specific OAuth complexity — no per-platform developer app registration
- SaaS/Business plan supports per-client profiles (perfect for multi-tenant)
- Node.js SDK available
- Eliminates 6-12 months of per-platform OAuth and publishing integration work

**Trade-offs accepted:**
- Third-party dependency for publishing (mitigated by keeping native OAuth for shop integrations)
- Per-post/per-profile pricing adds variable cost
- If Ayrshare goes down, publishing pauses (content creation and shop integration unaffected)

**Fallback plan:** If Ayrshare becomes unreliable or too expensive at scale, we have the `client_channels` OAuth infrastructure from Shop Connect that can be extended to add native publishing for the top 3-4 platforms.

## 5.2 Ayrshare Integration Architecture

```
┌──────────────────────────────────────────────────┐
│  YouSell Backend (Railway)                        │
│                                                    │
│  ┌─────────────────┐    ┌──────────────────────┐ │
│  │ Content Worker   │    │ Publishing Worker    │ │
│  │ (BullMQ)        │───▶│ (BullMQ)            │ │
│  │                  │    │                      │ │
│  │ Claude/Shotstack │    │ Ayrshare SDK        │ │
│  │ → content_items  │    │ → publish_log       │ │
│  └─────────────────┘    └──────────────────────┘ │
│                                │                   │
│                                ▼                   │
│                     Ayrshare API                   │
│                     (per-client profiles)          │
│                                │                   │
│                    ┌───────────┼──────────┐       │
│                    ▼           ▼          ▼       │
│                 TikTok    Instagram   Facebook    │
│                 Pinterest YouTube     LinkedIn    │
│                 X/Twitter Threads     etc.        │
└──────────────────────────────────────────────────┘
```

**Per-Client Setup:**
1. Client clicks "Connect Social Accounts" in their dashboard
2. YouSell creates an Ayrshare profile for this client
3. Client authenticates each social platform through Ayrshare's embedded OAuth flow
4. Profile ID stored in `client_channels` alongside channel metadata
5. All publishing for this client goes through their Ayrshare profile

## 5.3 Publishing Modes

| Mode | Behaviour | Who Controls | Default |
|---|---|---|---|
| **Manual** | Content generated → sits in library → client clicks "Publish" per item | Client | YES (default) |
| **Scheduled** | Content generated → client sets date/time per item or batch → auto-publishes at scheduled time | Client | Available |
| **Smart Schedule** | System picks optimal posting times based on audience analytics → client approves the schedule | System suggests, client approves | Available |
| **Auto-Pilot** | Content auto-generated weekly → auto-scheduled → auto-published. Client receives a weekly digest of what was published. | System (client can pause/override) | OFF — requires explicit opt-in |

## 5.4 Content Calendar UI

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Content Calendar — March 2026                            │
│                                                               │
│  ◀ Week    Mon 17    Tue 18    Wed 19    Thu 20    Fri 21 ▶  │
│  ─────────────────────────────────────────────────────────── │
│  TikTok   │ 🟢 10am │         │ 🟡 2pm │         │ 🟢 11am│ │
│           │ Sunset   │         │ Gadget  │         │ Beauty │ │
│  ─────────────────────────────────────────────────────────── │
│  Insta    │ 🟢 12pm │ 🔵 3pm │         │ 🟢 9am │         │ │
│           │ Carousel │ Reel    │         │ Post   │         │ │
│  ─────────────────────────────────────────────────────────── │
│  Facebook │         │ 🟢 1pm │         │         │ 🟡 4pm │ │
│           │         │ Link    │         │         │ Video  │ │
│  ─────────────────────────────────────────────────────────── │
│                                                               │
│  🟢 Approved  🟡 Pending Review  🔵 Scheduled  ⚪ Draft      │
│                                                               │
│  [+ Create Content]  [Auto-Schedule Week]  [View Analytics]  │
└─────────────────────────────────────────────────────────────┘
```

## 5.5 TikTok Content Publishing — Special Handling

**Critical limitation:** Unaudited third-party apps can only post to TikTok in **private mode**. To publish publicly, our app must pass TikTok's manual audit. This must be initiated early — there is no guaranteed timeline.

**Strategy:**
1. **Phase 1 (Pre-audit):** TikTok content is generated and saved to the client's Content Library. Client manually downloads and uploads to TikTok. Clear UX: "Download for TikTok" button with optimised format.
2. **Phase 2 (Post-audit):** Once our TikTok Developer App passes audit, enable direct publishing through Ayrshare (which handles the TikTok Content Posting API).
3. **Mandatory disclosure:** All TikTok content posted via API is automatically labelled "Branded Organic Content / Promotional content" (TikTok policy effective September 2025). Inform clients of this during onboarding.

---

# 6. SOCIAL MEDIA PLATFORM LINKING

## 6.1 Two Distinct Connection Types

Clients connect platforms for two separate purposes. The UI must make this distinction clear:

| Connection Type | Purpose | OAuth Provider | Example Platforms |
|---|---|---|---|
| **Shop Connect** (sell products) | Upload products to storefront, sync inventory, track orders | Native OAuth (YouSell → Platform) | Shopify, TikTok Shop, Amazon, Meta Commerce |
| **Social Connect** (publish content) | Post content, schedule, track engagement | Ayrshare (managed OAuth) | TikTok, Instagram, Facebook, YouTube, Pinterest, X, LinkedIn |
| **POD Connect** (print on demand fulfillment) | Product creation, order routing, mockup generation, multi-provider fulfillment | Native API (YouSell → POD Partner) | Printful, Printify, Gelato |

## 6.2 Connection Hub UI

```
┌─────────────────────────────────────────────────────────────┐
│  🔗 Connected Platforms                                      │
│                                                               │
│  ── YOUR SHOPS (Sell Products) ─────────────────────────     │
│                                                               │
│  [Shopify Logo]  My Awesome Store          🟢 Connected      │
│                  mystore.myshopify.com      [Manage] [Disconnect]│
│                  12 products synced | Last sync: 2h ago      │
│                                                               │
│  [TikTok Shop]   + Connect TikTok Shop     ⚪ Not Connected  │
│  [Amazon Logo]   + Connect Amazon Store     ⚪ Not Connected  │
│  [Meta Logo]     + Connect Meta Shop        ⚪ Not Connected  │
│                                                               │
│  ── YOUR SOCIAL ACCOUNTS (Publish Content) ──────────────    │
│                                                               │
│  [TikTok Logo]   @mybrand                  🟢 Connected      │
│                   1.2M followers            [Manage] [Disconnect]│
│                                                               │
│  [Instagram]      @mybrand_official         🟢 Connected      │
│                   45K followers             [Manage] [Disconnect]│
│                                                               │
│  [Facebook]       + Connect Facebook Page   ⚪ Not Connected  │
│  [YouTube]        + Connect YouTube Channel ⚪ Not Connected  │
│  [Pinterest]      + Connect Pinterest       ⚪ Not Connected  │
│  [LinkedIn]       + Connect LinkedIn Page   ⚪ Not Connected  │
│                                                               │
│  [+ Connect More Platforms]                                   │
└─────────────────────────────────────────────────────────────┘
```

## 6.3 OAuth Security Requirements

1. **All tokens encrypted at rest** using AES-256-GCM with a per-client encryption key
2. **Refresh token rotation** — automatically refresh before expiry, store new tokens
3. **Scope minimisation** — request only the scopes needed for our features
4. **Token revocation** — when client disconnects, immediately revoke tokens on the platform side
5. **Connection health monitoring** — background job checks token validity daily, alerts client if re-auth needed
6. **No token exposure** — tokens never sent to the frontend; all API calls go through our backend

## 6.4 Onboarding Flow

```
Step 1: Choose Your Platforms
┌───────────────────────────────────┐
│  Which platforms do you sell on?   │
│                                    │
│  ☑ Shopify     ☐ Amazon           │
│  ☑ TikTok Shop ☐ Meta/Instagram   │
│                                    │
│  [Continue →]                      │
└───────────────────────────────────┘

Step 2: Connect Your Shops
┌───────────────────────────────────┐
│  Let's connect your stores        │
│                                    │
│  [Connect Shopify Store →]        │
│  (Opens Shopify OAuth popup)      │
│  ✅ Connected: mystore.shopify... │
│                                    │
│  [Connect TikTok Shop →]         │
│  (Opens TikTok OAuth popup)      │
│  ⏳ Connecting...                 │
│                                    │
│  [Continue →]  [Skip for now]     │
└───────────────────────────────────┘

Step 3: Connect Your Social Accounts
┌───────────────────────────────────┐
│  Where should we publish content?  │
│                                    │
│  [Connect TikTok →]   ✅ Done     │
│  [Connect Instagram →] ✅ Done    │
│  [Connect Facebook →]             │
│  [Connect Pinterest →]            │
│                                    │
│  [Continue →]  [Skip for now]     │
└───────────────────────────────────┘

Step 4: Set Up Your Brand Voice
(Brand voice configuration form — see Section 4.3)

Step 5: Ready!
┌───────────────────────────────────┐
│  🎉 You're all set!               │
│                                    │
│  ✅ 2 shops connected             │
│  ✅ 2 social accounts connected   │
│  ✅ Brand voice configured        │
│                                    │
│  [Go to Dashboard →]              │
└───────────────────────────────────┘
```

---

# 7. THE AUTOMATION–CONTROL SPECTRUM

## 7.1 Philosophy: "Suggest Everything, Do Nothing Without Permission"

The core principle is that YouSell is an **intelligent assistant, not an autonomous agent**. The system should:
- **Suggest** the best actions based on data
- **Prepare** everything needed to execute
- **Wait** for client approval before taking action
- **Learn** from client decisions to improve suggestions

As the client builds trust, they can gradually grant more autonomy. But the default is always human-in-the-loop.

## 7.2 Three Automation Levels

| Level | Name | What It Does | Client Action | Risk |
|---|---|---|---|---|
| **Level 1** | Manual | System generates recommendations. Client initiates every action. | Client clicks each button | Zero risk — full control |
| **Level 2** | Assisted | System prepares content/products, presents for approval. Client reviews and clicks "Approve" or "Edit". | Review + one-click approve | Low risk — client sees everything before it goes live |
| **Level 3** | Auto-Pilot | System acts autonomously within client-defined rules. Client receives a digest of actions taken. Can pause/override anytime. | Set rules once, review digest | Medium risk — requires trust + guardrails |

## 7.3 Per-Feature Automation Settings

Each feature has its own automation level, independently configurable:

| Feature | Level 1 (Manual) | Level 2 (Assisted) | Level 3 (Auto-Pilot) |
|---|---|---|---|
| **Product Upload to Shop** | Client selects product → clicks "Push to Store" | System suggests products → client approves batch | System auto-pushes HOT products matching client criteria |
| **Content Creation** | Client clicks "Create Content" per product | System generates content brief weekly → client approves | System creates content for all new allocated products |
| **Content Publishing** | Client downloads or clicks "Publish" per post | System schedules posts → client approves calendar | System publishes on optimised schedule automatically |
| **Influencer Outreach** | Client clicks "Send Invite" per influencer | System drafts outreach batch → client approves | System sends outreach to matching creators automatically |
| **Product Discovery** | Admin allocates manually | System suggests allocations → client accepts/rejects | System auto-allocates based on client preferences |

## 7.4 Auto-Pilot Guardrails

When a client enables Level 3 (Auto-Pilot) for any feature, these safeguards activate:

### Hard Limits (Cannot Be Overridden)
1. **Daily spend cap** — Maximum API/credit spend per day (set by client, enforced by system)
2. **Content volume cap** — Maximum posts published per day per platform (prevents spam)
3. **Product upload cap** — Maximum products pushed to store per day
4. **Outreach cap** — Maximum influencer emails per day (reputation protection)
5. **Pause on error** — If any action fails 3x consecutively, auto-pilot pauses and alerts client

### Soft Limits (Client-Configurable)
1. **Content approval window** — Content sits in queue for N hours before auto-publishing (default: 4 hours). Client can cancel during this window.
2. **Product categories** — Only auto-push products in pre-approved categories
3. **Price range** — Only auto-push products within price range
4. **Minimum score** — Only act on products above a score threshold
5. **Quiet hours** — No publishing during specified hours
6. **Weekly digest** — Summary of all auto-pilot actions sent every Monday

### Emergency Controls
- **Big Red Button** — "Pause All Automation" button always visible in dashboard header
- **Per-feature pause** — Can pause any individual feature's automation
- **Undo window** — Scheduled posts can be cancelled until 5 minutes before publish time
- **Activity log** — Complete audit trail of every automated action

## 7.5 Automation Level UI

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Automation Settings                                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Product Upload to Shop                              │    │
│  │  ○ Manual  ● Assisted  ○ Auto-Pilot                 │    │
│  │                                                       │    │
│  │  Current: System suggests products for your store.   │    │
│  │  You review and approve before upload.                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Content Creation                                     │    │
│  │  ● Manual  ○ Assisted  ○ Auto-Pilot                  │    │
│  │                                                       │    │
│  │  Current: You choose when to create content.         │    │
│  │  Click "Create Content" on any product to start.      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Content Publishing                                   │    │
│  │  ○ Manual  ○ Assisted  ● Auto-Pilot                  │    │
│  │                                                       │    │
│  │  ⚠️ Auto-Pilot Active                                │    │
│  │  Posts: max 3/day per platform                        │
│  │  Approval window: 4 hours                             │
│  │  Quiet hours: 11pm–7am EST                           │
│  │  [Configure Rules →]                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [🛑 Pause All Automation]                                   │
└─────────────────────────────────────────────────────────────┘
```

## 7.6 Why This Balance Works

**For the client:**
- No risk of embarrassing auto-posts or wrong products in their store
- Gradual trust-building — they see the quality before granting autonomy
- Always in control — one click to pause everything
- The system gets smarter over time (learns what they approve/reject)

**For YouSell:**
- Reduces support tickets from "your system posted something wrong"
- Higher retention — clients who engage with approvals understand the value
- Liability protection — client approved every action
- Auto-pilot is a premium feature that justifies higher tier pricing

**For the anti-churn strategy:**
- Manual mode = client does a lot of work = feels the value of the tool
- Assisted mode = client does less work but still engaged = habit formation
- Auto-pilot mode = client is fully dependent = highest retention

---

# 8. PRODUCT UPLOAD WORKFLOW

## 8.1 Single Product Upload

```
CLIENT views allocated product in dashboard
    │
    ▼
Clicks "Push to Store" button
    │
    ▼
┌─────────────────────────────────────────┐
│  Push "LED Sunset Lamp" to Store         │
│                                           │
│  Select destination:                      │
│  ☑ Shopify (My Awesome Store)            │
│  ☑ TikTok Shop (@mybrand)               │
│  ☐ Amazon (not connected)                │
│                                           │
│  Product Details:                         │
│  Title: [LED Sunset Lamp — Viral TikTok] │
│  Description: [AI-generated, editable]   │
│  Price: [$29.99] (suggested: $24.99-34.99│
│  Category: [Home & Living > Lighting]    │
│  Images: [4 selected] [+ Add more]      │
│  Variants: [+ Add Size/Color variants]   │
│                                           │
│  ☑ Auto-sync inventory                   │
│  ☑ Notify me when first order arrives    │
│                                           │
│  [Preview on Shopify]  [Push to Store →] │
└─────────────────────────────────────────┘
```

## 8.2 Batch Product Upload

```
CLIENT selects multiple products (checkboxes)
    │
    ▼
Clicks "Push Selected to Store" (batch action)
    │
    ▼
┌─────────────────────────────────────────────┐
│  Push 5 Products to Store                    │
│                                               │
│  Destination: Shopify (My Awesome Store)     │
│                                               │
│  ☑ LED Sunset Lamp         $29.99  Ready ✅  │
│  ☑ Mini Projector          $49.99  Ready ✅  │
│  ☑ Portable Blender        $34.99  Ready ✅  │
│  ☑ Cloud Light             $19.99  Edit ⚠️   │
│     (Missing: category)                       │
│  ☑ Desk Organizer          $24.99  Ready ✅  │
│                                               │
│  Apply to all:                                │
│  ☑ AI-optimise titles for platform           │
│  ☑ AI-generate descriptions                  │
│  ☑ Auto-sync inventory                       │
│                                               │
│  [Push 4 Ready Products →]  [Fix Issues]     │
└─────────────────────────────────────────────┘
```

## 8.3 Product Sync Architecture

```
YouSell Product (Supabase)
    │
    ├── Push to Shopify ──────► Shopify Product (GraphQL productSet)
    │   └── Webhook: orders/create ◄── Shopify (order placed)
    │
    ├── Push to TikTok Shop ──► TikTok Product (POST /product/save/)
    │   └── Webhook: product_review ◄── TikTok (review status)
    │   └── Webhook: order_created ◄── TikTok (order placed)
    │
    └── Push to Amazon ────────► Amazon Listing (Feeds API)
        └── Pull: order report ◄── Amazon (order status poll)

All order events → client_orders table → Resend email sequences
```

## 8.4 Shop Sync Table

New table `shop_products` tracks the relationship between YouSell products and their listings on each platform:

```
YouSell Product ID ←→ Shopify Product ID
                  ←→ TikTok Shop Product ID
                  ←→ Amazon ASIN
                  ←→ Meta Catalog Item ID
```

This enables:
- Two-way inventory sync
- Order attribution (which YouSell product generated this order)
- Cross-platform price consistency
- Unified analytics across all stores

---

# 9. CONTENT LIFECYCLE WORKFLOW

## 9.1 End-to-End Flow

```
PRODUCT ALLOCATED TO CLIENT
    │
    ▼
CONTENT TRIGGER
(Manual click / Assisted suggestion / Auto-pilot schedule)
    │
    ▼
CONTENT PLANNER (Claude Haiku)
→ Analyses product + brand voice + platform requirements
→ Outputs content brief with recommended content types
    │
    ▼
CLIENT REVIEW (if Manual or Assisted mode)
→ Approve / Edit / Skip each content piece
    │
    ▼
CONTENT GENERATION (BullMQ content-queue)
→ Text: Claude Haiku/Sonnet → immediate
→ Video: Shotstack API → ~30-120 sec → webhook
→ Images: Bannerbear API → ~10-30 sec → webhook
    │
    ▼
CONTENT LIBRARY
→ All generated assets stored
→ Client can preview, edit text, re-generate
→ Assets stored in Supabase Storage (images/videos)
→ Metadata in content_items table
    │
    ▼
PUBLISH TRIGGER
(Manual click / Scheduled time / Auto-pilot)
    │
    ▼
PUBLISHING WORKER (BullMQ publish-queue)
→ Ayrshare API call per platform
→ Platform-specific formatting applied
→ Media uploaded to Ayrshare → platform
    │
    ▼
PUBLISHED
→ publish_log updated with platform post IDs
→ Engagement tracking begins (Ayrshare analytics)
    │
    ▼
PERFORMANCE TRACKING
→ Daily engagement pull via Ayrshare analytics API
→ Content performance feeds back into Content Planner
→ "This client's TikTok audience responds best to Problem→Solution hooks"
    │
    ▼
CONTINUOUS IMPROVEMENT
→ Next content brief is smarter based on performance data
→ Recommend content types / hooks / posting times that work
```

## 9.2 Content States

```
draft → pending_review → approved → generating → ready → scheduled → published → archived
                 │                      │
                 └── rejected           └── failed (retry or discard)
```

## 9.3 Content Credits

Content generation costs real money (Claude API, Shotstack, Bannerbear). Per-plan allocation:

| Plan Tier | Monthly Content Credits | Equivalent To |
|---|---|---|
| Starter | 50 credits | ~25 text posts + 5 videos + 10 images |
| Growth | 200 credits | ~80 text posts + 20 videos + 40 images |
| Professional | 500 credits | ~200 text posts + 50 videos + 100 images |
| Enterprise | Unlimited | Fair-use policy applies |

Credit costs per content type:
| Content Type | Credits |
|---|---|
| Social caption (text only) | 1 |
| Ad copy | 1 |
| Blog article | 3 |
| Product image (Bannerbear) | 2 |
| Carousel (5 slides) | 5 |
| Short video (15-30s) | 5 |
| Long video (30-60s) | 8 |
| Email sequence (5 emails) | 3 |

---

# 10. DATABASE SCHEMA ADDITIONS

## 10.1 New Tables

```sql
-- Client brand voice and settings
-- (extends existing clients table with JSONB column)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
-- settings includes: brand_voice, automation_levels, notification_preferences

-- Content items (generated content library)
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    channel_type TEXT NOT NULL, -- tiktok, instagram, facebook, pinterest, youtube, linkedin, twitter
    content_type TEXT NOT NULL, -- social_post, ad_copy, video, image, carousel, email, blog
    template_used TEXT, -- template identifier
    status TEXT DEFAULT 'draft', -- draft, pending_review, approved, generating, ready, scheduled, published, archived, rejected, failed
    title TEXT,
    body TEXT, -- main text content
    media_urls TEXT[], -- Supabase Storage URLs for images/videos
    media_metadata JSONB DEFAULT '{}', -- dimensions, duration, format, etc.
    hashtags TEXT[],
    platform_metadata JSONB DEFAULT '{}', -- platform-specific fields (sound_id for TikTok, etc.)
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    external_post_id TEXT, -- platform's post ID after publishing
    engagement_data JSONB DEFAULT '{}', -- views, likes, comments, shares (updated periodically)
    credits_used INTEGER DEFAULT 0,
    generation_cost DECIMAL(10,4) DEFAULT 0, -- actual API cost
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Publishing log
CREATE TABLE publish_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    channel_type TEXT NOT NULL,
    ayrshare_post_id TEXT, -- Ayrshare's post reference ID
    platform_post_id TEXT, -- The actual platform post ID
    platform_post_url TEXT, -- Direct URL to the post
    status TEXT DEFAULT 'pending', -- pending, published, failed, deleted
    error_message TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Shop product sync tracking
CREATE TABLE shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    channel_id UUID REFERENCES client_channels(id),
    platform TEXT NOT NULL, -- shopify, tiktok_shop, amazon, meta
    external_product_id TEXT NOT NULL, -- Shopify product ID, TikTok product ID, ASIN, etc.
    external_product_url TEXT,
    sync_status TEXT DEFAULT 'synced', -- synced, pending, error, delisted
    last_synced_at TIMESTAMPTZ DEFAULT now(),
    price_on_platform DECIMAL(10,2),
    inventory_count INTEGER,
    listing_status TEXT DEFAULT 'active', -- active, inactive, under_review, rejected
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, product_id, platform)
);

-- Automation settings per client per feature
CREATE TABLE client_automation_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- product_upload, content_creation, content_publishing, influencer_outreach, product_discovery
    automation_level INTEGER DEFAULT 1, -- 1=manual, 2=assisted, 3=autopilot
    rules JSONB DEFAULT '{}', -- feature-specific rules (caps, categories, price range, etc.)
    is_paused BOOLEAN DEFAULT false,
    paused_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, feature)
);

-- Content credits tracking
CREATE TABLE content_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_credits INTEGER NOT NULL,
    used_credits INTEGER DEFAULT 0,
    bonus_credits INTEGER DEFAULT 0, -- promotional or rollover credits
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_id, period_start)
);

-- Ayrshare profile mapping
CREATE TABLE client_social_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    ayrshare_profile_key TEXT NOT NULL UNIQUE,
    connected_platforms TEXT[] DEFAULT '{}', -- ['tiktok', 'instagram', 'facebook']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## 10.2 Updated client_channels Table

The existing `client_channels` schema from v7 spec is extended:

```sql
-- Add columns to existing client_channels table
ALTER TABLE client_channels ADD COLUMN IF NOT EXISTS connection_type TEXT DEFAULT 'shop'; -- 'shop' or 'social'
ALTER TABLE client_channels ADD COLUMN IF NOT EXISTS platform_account_name TEXT;
ALTER TABLE client_channels ADD COLUMN IF NOT EXISTS platform_account_id TEXT;
ALTER TABLE client_channels ADD COLUMN IF NOT EXISTS follower_count INTEGER;
ALTER TABLE client_channels ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ;
ALTER TABLE client_channels ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'healthy'; -- healthy, expiring, expired, revoked
```

---

# 11. IMPLEMENTATION PHASES

## Phase 2A: Shopify Shop Connect (Week 1-2)
- Shopify OAuth flow (app registration, auth callback, token storage)
- Product push (GraphQL `productSet` mutation)
- Batch product upload
- Order webhook receiver
- `shop_products` sync table
- Basic shop management UI in client dashboard

## Phase 2B: TikTok Shop Connect (Week 3-4)
- TikTok Shop Partner Center registration
- OAuth flow with request signing
- Product upload (`/product/save/`)
- Category mapping system
- Product review status tracking
- Order webhook receiver

## Phase 3A: Creative Studio — Text Content (Week 5-6)
- Brand voice configuration UI
- Content brief generation (Claude Haiku)
- Social caption generation
- Ad copy generation
- Content library UI (list, preview, edit, re-generate)
- Content credits system
- `content_items` table + API routes

## Phase 3B: Creative Studio — Rich Media (Week 7-8)
- Shotstack integration (video generation)
- Bannerbear integration (image generation)
- Template library (8 core templates)
- Media storage in Supabase Storage
- Content preview with platform-specific formatting

## Phase 3C: Smart Publisher (Week 9-10)
- Ayrshare account setup + SDK integration
- Per-client Ayrshare profile management
- Social account connection flow (embedded OAuth)
- Manual publishing (one-click from content library)
- Scheduled publishing
- Content calendar UI
- `publish_log` table + API routes

## Phase 3D: Automation & Intelligence (Week 11-12)
- Automation level configuration UI
- Auto-pilot guardrails (all hard limits)
- Smart scheduling (optimal time suggestions)
- Performance tracking (engagement data pull)
- Content performance feedback loop
- Weekly digest emails
- Emergency pause controls

## Phase 4: Amazon + Meta Integration (Week 13-16)
- Amazon SP-API OAuth + product feed upload
- Meta Business Extension flow + product catalog sync
- Cross-platform analytics dashboard

---

# 12. COST PROJECTIONS

## 12.1 Per-Client Content Costs

| Activity | Monthly Volume (Growth plan) | Cost Per Unit | Monthly Cost |
|---|---|---|---|
| Text content (Claude Haiku) | 80 posts | $0.001 | $0.08 |
| Ad copy (Claude Sonnet) | 10 pieces | $0.01 | $0.10 |
| Video generation (Shotstack) | 20 videos | $0.40 | $8.00 |
| Image generation (Bannerbear) | 40 images | $0.10 | $4.00 |
| Social publishing (Ayrshare) | 100 posts | ~$0.05 | $5.00 |
| **Total per client** | | | **~$17.18/mo** |

## 12.2 Platform Costs at Scale

| Clients | Content Cost | Publishing Cost | Shop API Cost | Total Variable |
|---|---|---|---|---|
| 10 | $172/mo | $50/mo | ~$0 | ~$222/mo |
| 50 | $859/mo | $250/mo | ~$0 | ~$1,109/mo |
| 100 | $1,718/mo | $500/mo | ~$0 | ~$2,218/mo |
| 500 | $8,590/mo | $2,500/mo | ~$0 | ~$11,090/mo |

At $29-$149/client/month subscription pricing, this gives healthy margins even at scale.

## 12.3 Fixed Costs

| Service | Monthly Cost | Notes |
|---|---|---|
| Ayrshare Business Plan | $99-$499/mo | Scales with profiles/posts |
| Shotstack | $49-$199/mo | Base plan + per-render credits |
| Bannerbear | $49-$149/mo | Base plan + per-render credits |
| Railway (additional worker) | ~$10/mo | Content + publishing workers |
| **Total fixed** | **~$207-857/mo** | Scales with tier |

---

# 13. POD (Print on Demand) Integration

## 13.1 POD Fulfillment Partner Connections
- Printful: REST API + Webhooks for product creation, order routing, mockup generation
- Printify: REST API for multi-provider price comparison, catalog sync
- Gelato: REST API for global fulfillment (32 countries)

## 13.2 POD Product Lifecycle
1. Trend discovery identifies hot design niches
2. AI generates design concepts + mockups via Printful Mockup Generator API
3. Product created in client's Shopify/TikTok store with POD fulfillment attached
4. Customer orders → webhook → POD partner manufactures + ships direct
5. Order tracking flows through existing order tracking engine

## 13.3 POD Content Strategy
- AI-generated lifestyle mockups using product images
- Platform-specific content: TikTok (design process videos), Pinterest (aesthetic boards), Instagram (lifestyle shots)
- Seasonal design trend content calendars

---

# 14. Affiliate Commission Engine Integration

## 14.1 Internal Content Affiliate Revenue
- Content engine produces promotional content for affiliate partner platforms
- Admin dashboard tracks content performance → clicks → conversions → commissions
- Non-stop content factory for all registered affiliate programs

## 14.2 Client Service Affiliate Revenue
- When clients adopt platforms provisioned through YOUSELL (Shopify, Klaviyo, Printful, Spocket, etc.), YOUSELL earns referral commissions
- Tracked separately from internal content revenue
- Admin dashboard shows per-client referral status and cumulative commission

## 14.3 Affiliate Revenue Dashboard
- Dual stats: Internal content revenue | Client service commissions
- Per-platform breakdown with monthly rollup
- Top-performing affiliate programs ranked by ROI

---

# APPENDIX A: API REFERENCE QUICK LINKS

| Platform | API Documentation | Key Requirement |
|---|---|---|
| Shopify GraphQL | developers.shopify.com | App registration |
| TikTok Shop Partner | partner.tiktokshop.com | Partner Center registration (US portal) |
| TikTok Content Posting | developers.tiktok.com | Developer app + manual audit for public posts |
| Amazon SP-API | developer-docs.amazon.com | Selling Partner registration |
| Meta Graph API | developers.facebook.com | Meta Business Extension |
| Ayrshare | docs.ayrshare.com | Business plan for multi-profile |
| Shotstack | shotstack.io/docs | API key |
| Bannerbear | developers.bannerbear.com | API key |
| Printful | developers.printful.com | OAuth 2.0 or API key |
| Printify | developers.printify.com | API key |
| Gelato | developers.gelato.com | API key |

---

# APPENDIX B: RISK REGISTER

| Risk | Impact | Mitigation |
|---|---|---|
| TikTok Content API audit rejected/delayed | Cannot auto-publish to TikTok | "Download for TikTok" manual fallback; apply for audit early |
| Ayrshare pricing increases | Variable cost spike | Native OAuth fallback architecture exists; can build direct publishing for top 3 platforms |
| Shopify API rate limits at scale | Product push delays | Batch operations, exponential backoff, queue management |
| Client posts inappropriate content via auto-pilot | Brand damage to client + YouSell reputation | Content moderation check (Claude Haiku) before all auto-published content |
| Token expiry/revocation undetected | Silent feature failure | Daily health check job, immediate client notification, re-auth flow |
| Content generation quality inconsistent | Client dissatisfaction | Brand voice calibration, template-based generation, quality scoring before delivery |

---

*This document supplements the YouSell Platform Technical Specification v7. In case of conflict, v7 governs unless this document explicitly updates a v7 section.*
