# Engine 2: Profitability Intelligence Engine — Design Notes

## Core Calculation Model

### Inputs (per product, per platform)
- `buy_price` — from Engine 1 (supplier lookup)
- `shipping_cost` — from Engine 1 (estimated per destination)
- `customs_estimate` — % of product value based on HS code category
- `platform_fees` — per selling platform
- `payment_processing` — per platform
- `competitor_price` — from discovery data (existing)
- `trend_score`, `viral_score`, `profit_score` — from existing scoring engine
- `category` — product category for benchmark data
- `weight_kg` — estimated from product data

### Platform Fee Structure
| Platform | Commission | Payment Processing | Fulfillment | Other |
|----------|-----------|-------------------|-------------|-------|
| TikTok Shop | 5% | 0% (included) | Seller handles | — |
| Amazon FBA | 15% referral | 0% (included) | FBA fees (weight-based) | Storage fees |
| Amazon FBM | 15% referral | 0% (included) | Seller handles | — |
| Shopify | 0% | 2.9% + $0.30 | Seller handles | $39/mo base |

### FBA Fee Estimation (simplified)
- Small standard (≤1 lb): ~$3.22
- Large standard (1-2 lb): ~$4.75
- Large standard (2-3 lb): ~$5.40
- Oversized: ~$9.73+

### Landed Cost Formula
```
landed_cost = buy_price + shipping_cost + (buy_price * customs_rate)
```

### Gross Margin Formula (per platform)
```
selling_price = competitor_price * price_strategy_multiplier
revenue = selling_price
platform_cost = revenue * platform_fee_rate
payment_cost = revenue * payment_processing_rate + fixed_fee
fulfillment_cost = fba_fee OR shipping_to_customer
total_cost = landed_cost + platform_cost + payment_cost + fulfillment_cost
gross_profit = revenue - total_cost
gross_margin = gross_profit / revenue * 100
```

### Viability Classification
| Verdict | Margin Threshold | Action |
|---------|-----------------|--------|
| STRONG | ≥ 50% | Full content suite, all platforms, influencer outreach |
| MODERATE | ≥ 30% | Reduced content, best 2 platforms |
| WEAK | ≥ 15% | Images only, organic promotion |
| NOT_VIABLE | < 15% | Auto-archive, no content, no spend |

### Marketing Budget Allocation
Based on expected margin and confidence level:
- STRONG: Up to 20% of expected gross profit as marketing budget
- MODERATE: Up to 10% of expected gross profit
- WEAK: $0 paid, organic only
- NOT_VIABLE: $0

### Price Strategy Logic
1. Start with competitor median price
2. If margin < 15% at competitor price → NOT_VIABLE (don't try to undercut)
3. If margin 15-30% → price at competitor median
4. If margin 30-50% → price 5-10% below competitor median (competitive edge)
5. If margin > 50% → price 10-15% below competitor median (aggressive capture)

### AI Reasoning Component (Claude Integration)
Use Claude Haiku for batch decisions, Sonnet for edge cases:

**Haiku batch job** (runs for every WARM/HOT product):
- Input: product data, cost data, competitor prices, category benchmarks
- Output: viability verdict, recommended price, marketing budget, platform recommendation
- Cost: ~$0.001-0.002 per product analysis

**Sonnet escalation** (runs for STRONG products or ambiguous cases):
- Deeper market analysis
- Content strategy recommendation
- Influencer budget optimization
- Cost: ~$0.01-0.02 per analysis

### Feedback Loop Design
1. **Sales data ingestion**: Track actual sales per product per platform
2. **Marketing ROI tracking**: Actual revenue vs marketing spend per product
3. **Margin accuracy**: Compare estimated vs actual margins
4. **Score recalibration**: Adjust scoring weights based on which scores best predict sales
5. **Content performance**: Which content types drive highest conversion per niche

### Database Tables Needed
- `product_costs` — supplier prices, landed costs per platform
- `profitability_analysis` — viability verdict, pricing, budgets per product
- `marketing_budgets` — allocated vs spent per product
- `sales_performance` — actual sales data for feedback loop
- `margin_accuracy_log` — estimated vs actual margin tracking

### Worker Design
- `profitability_analysis_worker` (P1) — triggered when supplier data arrives
- `price_optimization_worker` (P2) — re-runs on competitor price changes
- `budget_rebalance_worker` (P2) — weekly, reallocates budgets based on performance
- `feedback_learning_worker` (P2) — weekly, updates model weights from sales data
