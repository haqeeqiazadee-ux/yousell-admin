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

## RECOMMENDED STACK TOTAL: ~$136/month (all 3 engines included)

## FILES CREATED
- ai/research/session_memory.md (this file)
- ai/research/engine2_profitability_design.md
- ai/YOUSELL_AGENCY_BLUEPRINT.md (main deliverable)
