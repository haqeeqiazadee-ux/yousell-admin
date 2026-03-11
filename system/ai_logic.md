# AI Logic & Scoring Algorithms

**Last Updated:** 2026-03-11

---

## Existing Algorithms (in src/lib/scoring/composite.ts)

### 1. Composite Score
```
viral_score (0-100) based on:
  - sales_count tiers (+10 to +40)
  - platform bonus (tiktok +20, pinterest +10)
  - rating tiers (+10 to +20)
  - review_count tiers (+10 to +20)

overall_score = viral_score * 0.6 + profitability_score * 0.4
```

### 2. Trend Opportunity Score
```
trend_score =
  tiktokGrowth * 0.35 +
  influencerActivity * 0.25 +
  amazonDemand * 0.20 +
  competition * -0.10 +
  profitMargin * 0.10
```

### 3. Early Viral Score (6 pre-viral signals)
```
viral_score =
  microInfluencerConvergence * 0.25 +
  commentPurchaseIntent * 0.20 +
  hashtagAcceleration * 0.20 +
  creatorNicheExpansion * 0.15 +
  engagementVelocity * 0.10 +
  supplySideResponse * 0.10
```

### 4. Profitability Score
```
profit_score =
  profitMargin * 0.40 +
  shippingFeasibility * 0.20 +
  marketingEfficiency * 0.20 +
  supplierReliability * 0.10 -
  operationalRisk * 0.10
```

### 5. Final Opportunity Score
```
final_score = trend * 0.40 + viral * 0.35 + profit * 0.25
```

### 6. Influencer Conversion Score
```
Based on: follower tier (0-20), engagement rate (0-30),
view-to-follower ratio (0-20), conversion rate (0-15),
niche relevance (0-15)
```

### 7. Tier Classification
```
HOT:    score >= 80
WARM:   score >= 60
WATCH:  score >= 40
COLD:   score < 40
```

### 8. Auto-Rejection Rules
Products rejected if:
- Gross margin < 40%
- Shipping > 30% of retail
- Break-even > 2 months
- Fragile/hazardous without certification
- No supplier with USA delivery < 15 days
- IP/trademark risk detected
- Retail price < $10
- 100+ direct competitors

---

## Algorithms TO BE BUILT

### 9. Velocity-Based Trend Detection (Phase 3)
```
velocity_trend_score =
  view_velocity * 0.35 +
  creator_adoption_rate * 0.25 +
  store_adoption_rate * 0.20 +
  engagement_ratio * 0.20

Where:
  view_velocity = (views_today - views_yesterday) / views_yesterday
  creator_adoption_rate = new_creators_promoting / total_creators
  store_adoption_rate = new_stores_selling / total_stores
  engagement_ratio = (likes + comments + shares) / views
```

### 10. Creator-Product Match Score (Phase 4)
```
match_score =
  niche_alignment * 0.30 +
  historical_conversion * 0.25 +
  engagement_rate * 0.20 +
  audience_overlap * 0.15 +
  content_quality * 0.10
```

### 11. Ad Scaling Detection (Phase 7)
```
is_scaling = TRUE when:
  - Ad spend increasing >20% day-over-day for 3+ days
  - Multiple advertisers running similar creative
  - Landing page products match tracked products
```

### 12. AI Insight Generation (Phase 8)
```
Tier system:
  final_score >= 75 → Claude Sonnet analysis (on-demand only)
  final_score >= 60 → Claude Haiku analysis (automated)
  final_score < 60  → No AI analysis

Insight types:
  - Rising product alerts
  - Creator recommendations
  - Cross-platform correlation reports
  - Market saturation warnings
  - Niche emergence detection
```

---

## AI Analysis Rules (Cost Control)

1. NEVER run Claude Sonnet automatically — only on-demand when user clicks
2. Claude Haiku can run automatically for high-scoring products
3. Cache AI responses for 24 hours minimum
4. Batch AI requests — analyze 10 products per call, not individually
5. AI analysis runs in opportunity_feed_worker, never in API routes
