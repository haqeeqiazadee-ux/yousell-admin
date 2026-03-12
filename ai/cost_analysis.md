# YOUSELL Platform — Cost Analysis
## Updated 2026-03-11 (Revised with HeyGen hybrid approach)

---

## Monthly Cost Breakdown

### Existing Platform Baseline

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Supabase | Pro | $25 |
| Railway | Starter + usage | ~$25 |
| Netlify | Starter | $0 |
| Apify | Free tier ($5 credits) | $0 |
| Anthropic Claude API | Pay-as-you-go | ~$30 |
| Resend | Free tier | $0 |
| GitHub | Free | $0 |
| Stripe | Transaction-based | ~$0 |
| **Baseline Total** | | **~$80** |

### Engine 1: Purchasing ($0/month)

| Service | Cost | Notes |
|---------|------|-------|
| CJDropshipping API | $0 | Free REST API, 1K req/day |
| AliExpress Affiliate API | $0 | Free official API, ~5K req/day |
| Apify (fallback) | $0 | Free tier shared with existing allocation |

### Engine 2: Profitability (~$8/month)

| Service | Cost | Notes |
|---------|------|-------|
| Claude API (incremental) | ~$8 | Haiku batch + Sonnet escalation |

### Engine 3: Content & Marketing (~$73/month)

| Service | Cost | Notes |
|---------|------|-------|
| Blotato Starter | $29 | Faceless video creation + 9-platform publishing |
| HeyGen Creator | $29 | AI avatar presenter reels (Avatar III unlimited + Avatar IV hero) |
| Google AI (VEO3) | ~$8 | Product B-roll short clips (8s, VEO3 Fast) |
| Google AI (Nano Banana) | ~$2 | Hero product images (free tier covers bulk) |
| ElevenLabs Starter | $5 | AI voiceover for hero content, 30 min/month |
| OpenAI TTS | ~$0.20 | Day-to-day voiceover, native n8n node |

### Grand Total: ~$161/month

### Budget Comparison

| Configuration | Monthly Cost | Engines Included |
|--------------|-------------|-----------------|
| Previous Config A | $139 | Base only |
| Previous Config B | $415 | All (over budget) |
| Previous Config C | $291 | All (near ceiling) |
| **Current Blueprint** | **$161** | **All 3 engines** |
| Budget ceiling | $300 | — |
| **Budget remaining** | **$139** | Buffer for scaling |

### Per-Service Daily Budget Limits

| Service | Monthly Budget | Daily Limit | Auto-Pause At |
|---------|---------------|------------|--------------|
| HeyGen | $29 (fixed) | Credit-based | 90% Avatar IV credits used |
| VEO3 API | $10 | $0.35/day | $8 total |
| Nano Banana Pro | $3 | $0.10/day | $2.50 total |
| Claude API | $12 | $0.40/day | $10 total |
| Blotato | $29 (fixed) | Credit-based | 90% credits |
| ElevenLabs | $5 (fixed) | Credit-based | 85% credits |
