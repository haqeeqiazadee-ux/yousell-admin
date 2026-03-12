# YOUSELL Strategic Architecture Research — Session Memory
## Session ID: research-strategy-planning-vJmkP
## Date: 2026-03-11

---

## PURPOSE
Research and design the definitive blueprint for 3 missing engines:
1. **Purchasing Engine** — supplier discovery + cost estimation
2. **Profitability Intelligence Engine** — the decision brain
3. **Content & Marketing Engine** — content creation + publishing + tracking

## CONSTRAINTS
- Budget: ~$300/mo total (~$139 baseline, ~$160 for new engines)
- Solo operator: 1 person running TikTok Shop, Amazon, Shopify
- Tech stack locked: Next.js, Express, BullMQ, Supabase, n8n, Apify, Claude API
- n8n self-hosted on Railway (unlimited executions)

## RESEARCH STATUS — ALL COMPLETE

### Phase 1: File Reading — COMPLETE
- CLAUDE.md: Read successfully
- Other files: Not yet created in repo (context in user prompt)

### Phase 2: Tool Research — COMPLETE
- [x] Supplier APIs — CJDropshipping (FREE API, winner), AliExpress (Apify), TopDawg (rejected)
- [x] Faceless video — Blotato ($29, winner), Runway (rejected), Creatify (too expensive)
- [x] AI avatars — NanoBanana+VEO3 ($12-15/mo, winner), HeyGen (rejected for budget)
- [x] Social publishing — Blotato (included), Postiz (backup)
- [x] Voiceover — ElevenLabs ($5, winner)
- [x] n8n templates — #5035, #7187, #8226, #8270, #11204 all verified

### Phase 3: Blueprint — COMPLETE
- Full document at: ai/YOUSELL_AGENCY_BLUEPRINT.md

### Phase 4: Final Document — COMPLETE

## KEY DECISIONS

1. **CJDropshipping over TopDawg** — Free API with documented REST endpoints vs $35/mo gated API
2. **NanoBanana+VEO3 over HeyGen** — $12/mo for 20+ videos vs $29/mo for ~10 videos; n8n templates exist
3. **Blotato as content hub** — $29/mo bundles video creation + 9-platform publishing + n8n native node
4. **Nano Banana 2 free tier** — 500 images/day free via Google AI Studio eliminates paid image gen
5. **ElevenLabs $5/mo** — Best voice quality, 30 min/mo, commercial rights, n8n native node
6. **Total engine cost: ~$56/mo** — vs budget of $160/mo, leaving $104 buffer

## RECOMMENDED STACK TOTAL: ~$161/month (all 3 engines included)

## CRITICAL REVISION (post-agent-research):
- VEO3 cannot produce talking-head lip-synced presenter content — it generates cinematic video only
- VEO3 costs $4.50-9/video for 30-60s content — too expensive as primary avatar tool
- HeyGen Creator ($29/mo) added as primary avatar presenter tool:
  - Avatar III: UNLIMITED videos (good quality, sufficient for social)
  - Avatar IV: ~10-20 premium reels from 200 credits
  - Has dedicated n8n community node + templates
- VEO3 repositioned as supplementary B-roll (short 8s product showcase clips)
- Total revised from $136 to $161 — still $139 under budget ceiling

### Phase 5: Channel Intelligence Research — COMPLETE
- [x] Paid ad platforms — TikTok Spark (64% higher CTR), Meta, Google, Pinterest, Reddit, LinkedIn, Snapchat
- [x] Free/organic channels — Pinterest organic, YouTube Shorts, Email ($36-42 ROI per $1), Blog/SEO, Reddit, Quora, Telegram, Product Hunt
- [x] Ad automation — All 4 major platforms support full API campaign creation; server-side conversion tracking mandatory
- [x] Social posting — Blotato (9 platforms) + upload-post n8n node (10 platforms) + native nodes (Telegram, Discord, WordPress, email)

### Phase 6: Channel Intelligence Blueprint — COMPLETE
- PART 9 written: Channel Intelligence Engine
- 8 paid channels, 17 free channels cataloged
- Channel-product fit matrix for all 4 product categories
- 5-component channel scoring algorithm
- Ad account OAuth linking architecture (Meta, TikTok, Google, Pinterest)
- 5 new workers (W41-W45): token refresh, campaign creator, optimizer, conversion tracker, posting orchestrator
- 5 new database tables: ad_accounts, ad_campaigns, campaign_decisions, channel_performance, channel_recommendations
- W25 marketing plan generator extended with channel intelligence
- Learning loop integrated with existing memory system (PART 7)

## KEY DECISIONS (continued)

7. **TikTok Spark Ads as priority paid channel** — 64% higher CTR, 37% lower CPA by boosting organic creator content
8. **Pinterest Ads underpriced** — 30-40% cheaper CPCs than Meta, promoted pins become organic after campaign
9. **Server-side conversion tracking mandatory** — Cookie deprecation makes pixel-only unreliable; 20-30% higher match rates
10. **Multi-armed bandit for channel exploration** — 10% budget reserved for testing new channels even with historical data
11. **All ad platform APIs are FREE** — No additional fixed costs; variable cost = actual ad spend (human-approved)

## UPDATED SYSTEM TOTALS
- **Total workers: 49** (21 existing + 28 new)
- **Total new database tables: 21** (16 previous + 5 channel intelligence)
- **Blueprint sections: PART 1-9** complete

## FILES CREATED
- ai/research/session_memory.md (this file)
- ai/research/engine2_profitability_design.md
- ai/YOUSELL_AGENCY_BLUEPRINT.md (main deliverable — now includes PART 9)
