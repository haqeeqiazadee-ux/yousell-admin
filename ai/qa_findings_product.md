# QA Phase 3 — Missing SaaS Features & Competitive Moat Gaps

> **Reviewer**: SaaS Product Strategist
> **Source**: `ai/qa_brief_summary.md` + `ai/qa_findings_technical.md`
> **Date**: 2026-03-11

---

## Section 1: Missing SaaS Features

### S-1: No onboarding empty states or time-to-value path

**Category**: Onboarding
**What's Missing**: The brief defines a 5-step onboarding flow (sign up → plan selection → platform connection → first scrape → checklist). But it never defines: (a) what the dashboard looks like BEFORE the first scrape completes (could take minutes), (b) sample/demo data to show during the wait, (c) progressive disclosure — showing features as users are ready for them, (d) onboarding completion tracking (what % of users finish step 5?), (e) re-engagement if a user drops off mid-onboarding.
**User Impact**: New user signs up, sees an empty dashboard, waits 2+ minutes for first scrape, has no idea what to do. 60%+ will bounce.
**Priority**: P0 (launch blocker)
**Recommended Addition for v6.0**: Define: skeleton loading states during first scrape, optional demo data toggle ("See how YouSell works with sample data"), onboarding progress bar persistent in sidebar until complete, re-engagement email if onboarding not completed within 24h.

---

### S-2: No loading skeleton states defined

**Category**: User Experience
**What's Missing**: The brief defines "UPDATING" spinner states but no skeleton/shimmer loading states for initial page loads. Every modern SaaS shows content-shaped placeholders while data loads. Without them, pages flash empty → loaded, which feels broken.
**User Impact**: Every page load feels janky. Users think the app is broken during the 300ms–3s load window.
**Priority**: P1 (needed within 30 days)
**Recommended Addition for v6.0**: Define skeleton states for: product cards (image placeholder + text lines), stats bars (grey shimmer bars), creator lists (avatar circles + text), charts (grey rectangle). Use shadcn/ui Skeleton component.

---

### S-3: No accessibility (WCAG) requirements

**Category**: User Experience
**What's Missing**: Zero mention of accessibility. No ARIA labels, no keyboard navigation requirements, no screen reader support, no colour contrast requirements (the freshness badge colours may fail WCAG AA), no focus management.
**User Impact**: Excludes users with disabilities. May violate accessibility laws in EU/UK/US for commercial SaaS.
**Priority**: P1 (needed within 30 days)
**Recommended Addition for v6.0**: Define: WCAG 2.1 AA as minimum target, keyboard navigation for all interactive elements, ARIA labels on all badges/icons, colour contrast ratios for all freshness badges, focus trap management for modals, skip-to-content link.

---

### S-4: No email digest or notification preferences

**Category**: Notifications
**What's Missing**: The brief defines a Notification Centre (bell icon, in-app) and trend alert emails. But it never defines: (a) notification preferences (which alerts via email vs in-app only?), (b) email digest frequency (instant / daily / weekly summary), (c) unsubscribe management, (d) notification categories users can toggle on/off, (e) quiet hours / do-not-disturb.
**User Impact**: Users get spammed with every trend alert via email and can't control it. #1 reason users disable notifications entirely.
**Priority**: P1 (needed within 30 days)
**Recommended Addition for v6.0**: Define notification preferences page: per-category toggles (trend alerts, pre-trend alerts, system updates, outreach replies), per-channel delivery (in-app, email, webhook), digest frequency selector, global mute toggle. Store in a `notification_preferences` table.

---

### S-5: No bulk actions on product lists

**Category**: Data Management
**What's Missing**: Users can save individual products and set individual alerts. But with 500–25,000 products tracked, there are no bulk operations: (a) select all / select filtered, (b) bulk save to collection, (c) bulk set alerts, (d) bulk export, (e) bulk compare, (f) bulk archive/dismiss.
**User Impact**: Managing 5,000 products one-by-one is unusable. Power users will find the product unworkable.
**Priority**: P1 (needed within 30 days)
**Recommended Addition for v6.0**: Define bulk action toolbar: appears when 2+ products are checkbox-selected. Actions: Save to Collection, Set Alert, Export Selected, Compare (2-4 limit), Archive, Remove from Collection. Select All applies to current filter.

---

### S-6: No saved views or custom filters

**Category**: Data Management
**What's Missing**: The dashboard has filter tabs (All, Trending, Pre-Trend, platform) and sort options. But users can't: (a) save custom filter combinations as named views, (b) set a default view, (c) share views with team members, (d) create custom columns/layouts. Every competing product (JungleScout, Helium 10) offers saved views.
**User Impact**: Users re-apply the same 5 filters every time they open the dashboard. Friction compounds daily.
**Priority**: P2 (growth feature)
**Recommended Addition for v6.0**: Define saved views: store filter + sort + column config in `saved_views` table (tenant_id, user_id, name, config jsonb). Max 20 views per user. Share with team via link. Set default view.

---

### S-7: No help centre, in-app guidance, or documentation

**Category**: Support
**What's Missing**: Zero support infrastructure defined. No: (a) help centre / knowledge base, (b) in-app tooltips or guided tours, (c) contextual help (? icons explaining scores, badges, features), (d) status page for system health, (e) bug reporting flow, (f) feature request mechanism, (g) live chat or support ticket system.
**User Impact**: Users see "Trend Score: 94" and have no idea what it means, how it's calculated, or what to do about it. Support requests overwhelm the team via ad-hoc channels.
**Priority**: P0 (launch blocker)
**Recommended Addition for v6.0**: Define: (a) contextual tooltips on all scores, badges, and features (e.g., hover on Trend Score → "Measures viral momentum. 0-100 scale. >75 = hot product"), (b) link to external help centre (Intercom, Zendesk, or Notion-based), (c) status page URL in footer (use Betteruptime or similar), (d) feedback widget in app (Canny or simple form).

---

### S-8: No data retention visibility for users

**Category**: Compliance / Data Management
**What's Missing**: Users don't know: (a) how long their data is kept, (b) whether historical trend data persists after downgrade, (c) what happens to their data if they cancel, (d) whether they can request full data deletion. This is both a compliance requirement (GDPR) and a trust requirement.
**User Impact**: Enterprise clients will ask "what's your data retention policy?" during procurement and get no answer. Deal blocker.
**Priority**: P1 (needed within 30 days)
**Recommended Addition for v6.0**: Define: data retention policy visible in settings (90-day trend history, 30-day logs), data export before cancellation prompt, 30-day data preservation after cancellation, full deletion on request (GDPR right to erasure), add to Terms of Service.

---

### S-9: No team invitation or multi-user management flow

**Category**: Team Features
**What's Missing**: The brief defines roles (super_admin, agency_owner, analyst, viewer) but never specifies: (a) how to invite team members (email invite flow), (b) invitation acceptance flow, (c) how to change a user's role, (d) how to remove a user, (e) maximum users per plan, (f) seat-based vs unlimited pricing.
**User Impact**: Agency plan is $349/mo but there's no way to add team members. Agency owner has to share login credentials. Unacceptable.
**Priority**: P0 (launch blocker)
**Recommended Addition for v6.0**: Define: invitation flow (owner enters email → system sends invite link → invitee signs up with role pre-assigned), team management page (list members, change roles, revoke access), seat limits per plan (Starter: 1, Pro: 3, Agency: 10, Enterprise: unlimited), add `invitations` table (tenant_id, email, role, token, expires_at, accepted_at).

---

### S-10: No activity log visible to team admins

**Category**: Team Features
**What's Missing**: The brief defines an audit log for Enterprise (Section 14.2) stored in `api_usage_log`. But there's no user-facing activity feed showing: who saved what product, who triggered what scrape, who sent what outreach email, who exported what report. This is table stakes for team collaboration.
**User Impact**: Agency owner can't see what their analysts are doing. No accountability, no collaboration visibility.
**Priority**: P2 (growth feature)
**Recommended Addition for v6.0**: Define: activity feed page (accessible to agency_owner and super_admin), shows: user avatar + action + target + timestamp. Filter by user, action type, date range. Powered by the existing `api_usage_log` table but with a user-friendly UI layer.

---

### S-11: No product or collection sharing with external clients

**Category**: Team Features / Agency
**What's Missing**: The Agency plan offers "branded PDF reports" but no way to: (a) share a live product intelligence page with a client (read-only link), (b) create client-specific dashboards, (c) give clients limited portal access, (d) share collections as curated lists. Agencies need to show clients live data, not just static PDFs.
**User Impact**: Agency charges $349/mo but can only give clients PDF snapshots. Competitors offering live dashboards will win.
**Priority**: P2 (growth feature)
**Recommended Addition for v6.0**: Define: (a) shareable read-only links for product pages and collections (token-based, expiring), (b) client portal: lightweight view-only dashboard branded with agency logo, (c) client accounts: sub-users under agency tenant with viewer role and restricted product access.

---

### S-12: No failed payment / dunning flow

**Category**: Billing Edge Cases
**What's Missing**: The brief mentions Stripe integration but zero handling for: (a) declined card at checkout, (b) recurring payment failure (card expired), (c) dunning emails (remind user to update payment), (d) grace period before account lockout, (e) what features are restricted during payment failure, (f) how to re-activate after lockout.
**User Impact**: Customer's card expires. No dunning email sent. Account silently degrades. Customer churns without knowing why. Lost revenue.
**Priority**: P0 (launch blocker)
**Recommended Addition for v6.0**: Define dunning flow: payment fails → immediate retry → email "Update your payment method" → 3-day grace period (full access) → 7-day restricted mode (read-only, no scrapes) → 14-day → account locked (data preserved 30 days) → 30-day → data archived. Stripe Customer Portal link in every dunning email.

---

### S-13: No plan upgrade/downgrade proration logic

**Category**: Billing Edge Cases
**What's Missing**: No specification for: (a) mid-cycle upgrades (charged prorated difference immediately?), (b) mid-cycle downgrades (credit applied to next invoice?), (c) what happens to data when downgrading from Agency (25,000 products) to Pro (5,000 products) — are excess products archived or deleted? (d) feature revocation on downgrade (lose agency reports access immediately?).
**User Impact**: User downgrades from Agency to Pro. 20,000 products vanish. User panics. Support ticket filed. Churn.
**Priority**: P1 (needed within 30 days)
**Recommended Addition for v6.0**: Define: upgrades → prorated charge immediately, new limits effective immediately. Downgrades → take effect at end of billing cycle, excess products marked "archived" (not deleted), user warned before confirming downgrade with impact summary ("You will lose access to: Agency reports, 20,000 products will be archived").

---

### S-14: No annual plan option or discount

**Category**: Retention
**What's Missing**: All plans are monthly only. No annual billing option. SaaS standard is 15-20% discount for annual commitment. This is the easiest lever to reduce churn and improve cash flow.
**User Impact**: Every customer is month-to-month. Easy to cancel. No lock-in. Cash flow is unpredictable.
**Priority**: P2 (growth feature)
**Recommended Addition for v6.0**: Define: annual plans at 20% discount (Starter $39/mo billed annually = $468/yr, Pro $119/mo = $1,428/yr, Agency $279/mo = $3,348/yr). Toggle on pricing page. Stripe handles annual invoicing natively.

---

### S-15: No referral or affiliate programme

**Category**: Retention / Growth
**What's Missing**: No mechanism for users to refer others. In ecommerce tools, word-of-mouth is the #1 growth channel. No referral tracking, no rewards, no affiliate payouts.
**User Impact**: Organic growth capped. Users who love the product have no incentive or mechanism to share it.
**Priority**: P3 (nice to have)
**Recommended Addition for v6.0**: Define: referral link per user (shareable URL with tracking code), reward: 1 month free for referrer when referee subscribes for 30+ days. Track in `referrals` table (referrer_id, referee_id, status, reward_granted_at).

---

### S-16: No product archiving or dismissal

**Category**: Data Management
**What's Missing**: Users see 500–25,000 products. Many will be irrelevant. There's no way to: (a) dismiss/archive a product ("don't show me this again"), (b) hide low-scoring products, (c) create an "ignore list", (d) mark products as "already selling" or "not interested". Without this, the feed becomes noise.
**User Impact**: After the first week, 80% of products shown are irrelevant. User stops trusting the feed. Churn.
**Priority**: P1 (needed within 30 days)
**Recommended Addition for v6.0**: Define: dismiss button on product cards (moves to "Dismissed" filter), archive action (removes from default view, accessible via "Archived" tab), "Not Interested" feedback (optionally improves future recommendations). Store in `product_user_status` table (tenant_id, user_id, product_id, status enum('active','dismissed','archived'), dismissed_at).

---

### S-17: No changelog or "What's New" feature

**Category**: Retention
**What's Missing**: No mechanism to communicate product updates to users. When new features launch, users won't know unless they're told.
**User Impact**: Team ships major feature. Users don't notice. Adoption is slow. Users still complain about the thing you just fixed.
**Priority**: P3 (nice to have)
**Recommended Addition for v6.0**: Define: "What's New" link in header dropdown. Could be as simple as a Notion page linked from the app, or an in-app changelog modal triggered on first login after a new release.

---

### S-18: No keyboard shortcuts beyond Cmd+K

**Category**: User Experience
**What's Missing**: Only Cmd+K (global search) is defined. Power users expect: (a) J/K for next/previous product, (b) S to save, (c) A to set alert, (d) R to refresh, (e) / to focus search, (f) Esc to close modals. This is table stakes for analyst tools.
**User Impact**: Analysts who process 100+ products/day are slowed by mouse-only navigation. Competitors with keyboard shortcuts win on workflow speed.
**Priority**: P3 (nice to have)
**Recommended Addition for v6.0**: Define: keyboard shortcut system with configurable bindings. Default bindings for top 10 actions. Help modal (Cmd+?) showing all shortcuts. Use react-hotkeys or similar library.

---

---

## Section 2: Competitive Moat Analysis

### Existing Moat Assessment

### M-1: Pre-Trend Predictive Engine

**Current Definition Quality**: Needs work
**Defensibility**: High
**Issue**: The algorithm is defined (predictive_score formula) but the data pipeline feeding it is unclear. The formula uses `creator_burst_signal` (3+ creators in 48h), `engagement_velocity` (hourly doubling), `store_adoption_velocity` (new stores in 72h), and `ad_creative_replication` (3+ accounts). These require: (a) continuous monitoring of creator posting behaviour (how, if workers are demand-driven?), (b) historical baseline data to detect "doubling" (where's the baseline stored?), (c) store listing monitoring across platforms (which worker?). The predictive worker runs every 2h, but only has 50 Anthropic calls/day — what exactly does it compute with those calls?
**Recommended Improvement**: Define precisely: what data the predictive worker reads (which tables, what time windows), what computation Anthropic performs (is it pattern matching? classification? summarisation?), how baselines are established for new products, and how the 50-call budget maps to product coverage (50 calls for 25,000+ products?).

---

### M-2: Cross-Platform Intelligence Graph

**Current Definition Quality**: Vague
**Defensibility**: High (if implemented)
**Issue**: The brief describes "Links TikTok video → creator → Amazon ASIN → Shopify store → Facebook ad in one graph." But: (a) no graph data structure is defined (is this a literal graph DB? joins across tables? a computed view?), (b) no UI for visualising the graph, (c) the `amazon_tiktok_match_worker` only covers TikTok↔Amazon — Shopify, Facebook, and other matches have no defined worker, (d) no matching algorithm is defined (how do you know a TikTok product is the same as an Amazon ASIN? title similarity? image matching? UPC lookup?).
**Recommended Improvement**: Define: (a) the `product_platform_matches` table as the graph edge table (already exists but usage not specified), (b) matching algorithm (title + image similarity via embedding, UPC/GTIN lookup, manual confirmation), (c) a `cross_platform_match_worker` that runs matching across all platform pairs, (d) a graph visualisation component in the UI showing the product's cross-platform presence.

---

### M-3: Creator-Product Match Score

**Current Definition Quality**: Well-defined
**Defensibility**: Medium
**Issue**: The algorithm is clearly defined with 4 weighted inputs. However: (a) `niche_alignment` requires "semantic similarity: creator bio vs product category" — this implies embedding computation, which is expensive and the implementation isn't specified, (b) `historical_conversion` requires "past sales generated for similar product categories" — this data doesn't exist for new products or new creators, (c) `demographics_fit` requires "audience age/gender/location" — where does creator demographic data come from? None of the worker APIs clearly provide this.
**Recommended Improvement**: Define: (a) how semantic similarity is computed (Anthropic embeddings? a simpler keyword matching approach?), (b) cold-start strategy for new products/creators with no historical data, (c) which APIs provide creator demographics (TikTok doesn't expose this publicly), (d) fallback scores when data is unavailable.

---

### M-4: Best Platform Recommender

**Current Definition Quality**: Well-defined
**Defensibility**: Medium
**Issue**: The formula is clear and the Anthropic API usage is specified. However: (a) `estimated_margin` requires knowing cost + selling price per platform — where does cost data come from? The brief mentions AliExpress/CJ suppliers in Row 7 but no supplier data worker exists, (b) `demand_velocity` requires platform-specific search volume — Google Trends worker isn't defined, (c) `competition_inverse` requires active seller counts per platform — where does this data come from?
**Recommended Improvement**: Define data sources for each input variable. Add a `supplier_data_worker` or clarify that supplier data comes from manual input. Clarify that competition data comes from the platform-specific workers (BSR rankings = Amazon competition, shop count = Shopify competition).

---

### M-5: Automated Creator Outreach

**Current Definition Quality**: Needs work
**Defensibility**: Medium
**Issue**: Described as "one-click email sequence via Resend" with CRM tracking. But: (a) no email template structure defined, (b) no Anthropic prompt for generating outreach copy, (c) "email sequence" implies multiple emails but no sequence logic defined (follow-up timing, stop conditions), (d) reply tracking "via email open/click webhooks" — Resend supports this but the webhook handling isn't defined, (e) CAN-SPAM/GDPR compliance for cold outreach not addressed, (f) no outreach analytics (response rate, conversion rate).
**Recommended Improvement**: Define: (a) outreach email template structure (subject, body, CTA), (b) Anthropic prompt template for personalisation, (c) sequence: email 1 (day 0), follow-up (day 3), final (day 7), stop on reply, (d) Resend webhook endpoint for tracking opens/clicks/replies, (e) anti-spam: require creator email to be publicly available, include unsubscribe link, respect opt-outs, (f) outreach dashboard with response rate metrics.

---

### M-6: Agency Intelligence Reports

**Current Definition Quality**: Vague
**Defensibility**: Low
**Issue**: Described as "branded PDF intelligence reports generated in one click." But: (a) no report template or structure defined, (b) no specification of what data goes into a report, (c) no PDF generation library specified, (d) "branded" means what exactly — just logo swap? Custom colours? Custom sections? (e) how are reports scheduled vs on-demand? (f) no report history or versioning. Generating a branded PDF is not defensible — any competitor can do this in a weekend.
**Recommended Improvement**: Define: (a) report template with sections (executive summary, top products, trend analysis, creator recommendations, platform comparison, competitive landscape), (b) AI-generated narrative sections via Anthropic (THIS is the moat — not the PDF, but the AI-written analysis), (c) use @react-pdf/renderer or Puppeteer for PDF generation, (d) report scheduling (weekly/monthly auto-send to client), (e) report history page with version comparison.

---

### New Moat Opportunities

### MN-1: Product Lifecycle Prediction (beyond pre-trend)

**Description**: Extend the predictive engine to forecast not just "about to trend" but the full lifecycle: pre-trend → growth → peak → plateau → decline. Show users WHERE a product is in its lifecycle so they know when to enter and when to exit.
**Why It's Defensible**: Requires 90+ days of historical trend data per product across platforms. New entrants won't have this data for months/years. The model improves with more data over time.
**Data Required**: trend_scores time-series (already planned), cross-platform sales velocity over time, ad spend trends, creator adoption curve.
**Recommended Addition for v6.0**: Add a "Product Lifecycle Stage" badge to every product: 🌱 Emerging → 📈 Growing → 🔥 Peak → 📉 Declining → 💀 Saturated. Computed from 30-day trend slope + saturation metrics. This directly solves the undefined Saturation Score (Phase 2 finding D-11).

---

### MN-2: Niche Intelligence Engine (beyond product-level)

**Description**: Aggregate product-level intelligence up to the niche level. Instead of just "this product is trending," tell users "the fitness accessories niche is growing 340% on TikTok but saturated on Amazon." This is a higher-value insight that no competitor offers.
**Why It's Defensible**: Requires cross-platform data at the niche level, which only YouSell has (combining TikTok, Amazon, and Shopify niche data). Competitors with single-platform data can't do this.
**Data Required**: Product categorisation/tagging by niche, aggregation of trend scores by niche, cross-platform niche comparison.
**Recommended Addition for v6.0**: Add a `niches` table (id, tenant_id, name, category, product_count, avg_trend_score, platform_breakdown, growth_rate). Build a Niche Intelligence page: niche leaderboard, niche lifecycle stage, niche-level platform recommendation, niche saturation map (extends the competitor niche map already planned).

---

### MN-3: "Smart Alerts" — AI-curated daily briefing

**Description**: Instead of raw threshold alerts ("Product X scored 76"), generate a daily AI-curated intelligence briefing: "3 products in the fitness niche are showing pre-trend signals. Creator adoption is accelerating. Here's your recommended action: track these products and contact these 5 creators." This turns data into decisions.
**Why It's Defensible**: Requires cross-platform data synthesis + AI narrative generation. The quality improves as the system collects more data per tenant. Competitors sending raw alerts can't match personalised, actionable briefings.
**Data Required**: All existing product/creator/trend data + tenant's saved collections and alert configs (for personalisation).
**Recommended Addition for v6.0**: Define a `daily_briefing_worker` that runs once per day per active tenant. Uses Anthropic API to synthesise the day's intelligence into a structured briefing. Delivered via email (Resend) and shown as the first card on the dashboard. Briefing covers: new pre-trend alerts, top movers, recommended actions, creator matches.

---

### MN-4: Collaborative Intelligence — team annotations and notes

**Description**: Allow team members to annotate products, creators, and collections with notes, tags, and status updates ("@john checked suppliers, MOQ too high", "This product failed our quality test"). Turn the product card into a collaborative workspace.
**Why It's Defensible**: Creates switching costs. The more notes and context a team adds, the harder it is to migrate to a competitor. The data is unique to each tenant and has no equivalent elsewhere.
**Data Required**: New `annotations` table (tenant_id, user_id, target_type, target_id, content, created_at). Simple to implement, high retention impact.
**Recommended Addition for v6.0**: Add a notes/comments section to product detail pages and collection pages. @mention team members. Pin important notes. This is low engineering effort but creates massive switching costs.

---

### MN-5: Trend Replay — "what would you have caught?"

**Description**: Show users historical trends they WOULD have caught if they'd been using YouSell. "This product went viral 14 days ago. YouSell's pre-trend engine detected it 5 days before. Users who acted made an estimated $X." This is both a sales tool and a retention tool.
**Why It's Defensible**: Requires historical data that only gets better over time. New competitors can't show past predictions they never made.
**Data Required**: Historical trend_scores, predictive_signals, product outcomes (did it actually go viral?). Already being collected.
**Recommended Addition for v6.0**: Add a "Trend Replay" section to the dashboard showing 3-5 recent success stories. Used in onboarding ("Here's what YouSell caught last week"), in marketing, and as a retention tool for existing users. Track prediction accuracy rate.

---

---

## Section 3: Summary Statistics

| Category | P0 | P1 | P2 | P3 | Total |
|----------|----|----|----|----|-------|
| Missing SaaS Features | 4 (S-1, S-7, S-9, S-12) | 6 (S-2, S-3, S-4, S-5, S-8, S-13, S-16) | 3 (S-6, S-10, S-11, S-14) | 3 (S-15, S-17, S-18) | 18 |
| Moat Improvements | — | — | — | — | 6 (all existing moats reviewed) |
| New Moat Opportunities | — | — | — | — | 5 |

### Priority Breakdown

**P0 — Launch Blockers (4 features):**
1. S-1: Onboarding empty states / time-to-value path
2. S-7: Help centre / in-app guidance / contextual tooltips
3. S-9: Team invitation and multi-user management
4. S-12: Failed payment dunning flow

**P1 — Needed within 30 days (6 features):**
1. S-2: Loading skeleton states
2. S-3: WCAG accessibility
3. S-4: Notification preferences
4. S-5: Bulk actions on product lists
5. S-8: Data retention visibility
6. S-13: Plan upgrade/downgrade proration
7. S-16: Product archiving/dismissal

**P2 — Growth features (3):**
1. S-6: Saved views / custom filters
2. S-10: Team activity log
3. S-11: External client sharing / portal
4. S-14: Annual plan discount

**P3 — Nice to have (3):**
1. S-15: Referral programme
2. S-17: Changelog / "What's New"
3. S-18: Keyboard shortcuts

**New Moat Opportunities (5):**
1. MN-1: Product Lifecycle Prediction
2. MN-2: Niche Intelligence Engine
3. MN-3: Smart Alerts — AI daily briefing
4. MN-4: Collaborative Intelligence — team annotations
5. MN-5: Trend Replay — historical proof of value
