# Phase 3 — Critical Review: Missing SaaS Features & Competitive Moat Gaps

## Context Recovery (do this first every time)

1. Read `CLAUDE.md`
2. Read `ai/qa_tracker.md` — confirm Phases 1–2 are COMPLETED and Phase 3 is NOT STARTED or IN PROGRESS
3. Read `ai/qa_brief_summary.md` — your working reference
4. Read `ai/qa_findings_technical.md` — so you don't duplicate findings
5. If Phase 3 is already COMPLETED, skip to the next incomplete phase

---

## Your Role

You are a SaaS product strategist who has scaled B2B platforms to $1M+ ARR. You know exactly what paying customers expect on day one, and what makes them stay vs churn.

---

## Task A — Find All Missing SaaS-Critical Features

Think like someone who just paid $99/mo for this tool. What's missing?

Go through each category systematically:

| Category | Questions to Ask |
|----------|-----------------|
| **Onboarding** | Is there a first-run wizard? Empty state guidance? Sample data? Time-to-value path? |
| **User Experience** | Loading states? Error states? Empty states? Mobile responsive? Accessibility (WCAG)? |
| **Notifications** | In-app alerts? Email digests? Webhook notifications? Customizable preferences? |
| **Data Management** | Export (CSV/PDF)? Bulk actions? Search & filter? Saved views? Data retention policy? |
| **Support** | Help center? In-app chat? Status page? Bug reporting? Feature request flow? |
| **Compliance** | GDPR consent? Data deletion requests? Privacy policy? Cookie management? Audit logs? |
| **Analytics (for operator)** | Usage dashboards? Revenue metrics? Churn indicators? Feature adoption tracking? |
| **Team Features** | Multi-user per tenant? Role-based access? Activity logs? Team invitations? |
| **API** | Public API for customers? API keys? Rate limiting? Versioning? Documentation? |
| **Billing Edge Cases** | Failed payments? Dunning flow? Plan downgrades? Proration? Refunds? Free trial end? |
| **White-Label** | Custom domains? Brand theming? Reseller flows? White-label billing? |
| **Retention** | Referral programme? Usage reports? Win-back emails? Annual plan incentives? |

---

## Task B — Find All Competitive Moat Gaps

Current moat features described in the brief:
- Predictive pre-trend engine
- Cross-platform intelligence graph
- Creator-product match score
- Best platform scorer
- Creator outreach
- Agency reports

For each, assess:
1. Is it well-defined enough to actually build?
2. Is it truly defensible or easily replicated?
3. What data insights are uniquely possible with cross-platform correlation that no single-platform tool offers?

Then identify **new moat opportunities** the brief hasn't considered:
- Unique data combinations only YouSell can produce
- Network effects that grow with more users
- Switching costs that keep users locked in
- Data advantages that compound over time

---

## Output Structure

Save your output to: `ai/qa_findings_product.md`

### Section 1: Missing SaaS Features

For each finding:
```
### S-[number]: [feature name]

**Category**: [from the table above]
**What's Missing**: [clear description]
**User Impact**: What happens without this on day one
**Priority**: P0 (launch blocker) / P1 (needed within 30 days) / P2 (growth feature) / P3 (nice to have)
**Recommended Addition for v6.0**: [what to add to the brief]
```

### Section 2: Competitive Moat Analysis

#### Existing Moat Assessment
For each existing moat feature:
```
### M-[number]: [feature name]

**Current Definition Quality**: Well-defined / Needs work / Vague
**Defensibility**: High / Medium / Low
**Issue**: [what's weak about it]
**Recommended Improvement**: [how to strengthen it in v6.0]
```

#### New Moat Opportunities
```
### MN-[number]: [opportunity name]

**Description**: [what it is]
**Why It's Defensible**: [why competitors can't easily copy it]
**Data Required**: [what data feeds it]
**Recommended Addition for v6.0**: [how to add it to the brief]
```

### Section 3: Summary Statistics

| Category | P0 | P1 | P2 | P3 | Total |
|----------|----|----|----|----|-------|
| Missing SaaS Features | | | | | |
| Moat Improvements | | | | | |
| New Moat Opportunities | | | | | |

---

## After Completion

1. Save output to `ai/qa_findings_product.md`
2. Update `ai/qa_tracker.md`:
   - Set Phase 3 status to `COMPLETED`
   - Add a session log entry
3. Commit changes with message: `QA Phase 3: Product review complete`
