# YouSell Admin — E2E Testing Strategy

**Created:** 2026-03-14
**Status:** Ready for execution
**Platform:** admin.yousell.online (Intelligence Engine) + client dashboard

---

## 1. Testing Approach

### Philosophy
- **Manual-first, systematic**: Each test has clear steps, expected results, and pass/fail criteria
- **Priority-ordered**: Critical auth and data flows first, edge cases last
- **Cost-aware**: Tests involving external APIs (Apify, Claude, Resend) are flagged with cost estimates
- **Non-destructive**: Tests create test data, verify it, then clean up

### Test Environment
- **URL:** https://admin.yousell.online
- **Admin account:** admin@yousell.online (role: admin)
- **Second admin:** haqeeqiazadee@gmail.com (role: admin)
- **Client account:** Create a test client during testing
- **Browser:** Chrome latest (desktop), Safari (mobile spot-check)
- **Pre-condition:** All 41 debug tests passing (`/api/admin/debug`)

### Test ID Convention
`E2E-{LAYER}-{NUMBER}` where LAYER = AUTH, NAV, SCAN, PROD, CLIENT, ALLOC, INTEL, SETTINGS, DASHBOARD, REALTIME, CLIENT_PORTAL

---

## 2. Test Suites

---

### Suite A: Authentication & Authorization (CRITICAL)

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-AUTH-01 | Admin login | 1. Go to `/admin/login` 2. Enter admin@yousell.online + password 3. Submit | Redirects to `/admin`, dashboard loads, sidebar shows user email | P0 |
| E2E-AUTH-02 | Invalid credentials | 1. Go to `/admin/login` 2. Enter wrong password 3. Submit | Error message shown, stays on login page | P0 |
| E2E-AUTH-03 | Unauthenticated redirect | 1. Clear cookies 2. Navigate to `/admin/products` | Redirects to `/admin/login` | P0 |
| E2E-AUTH-04 | Client cannot access admin | 1. Login as client user 2. Navigate to `/admin` | Redirects to `/admin/unauthorized` | P0 |
| E2E-AUTH-05 | Admin logout | 1. Click profile menu 2. Click "Sign Out" | Redirects to `/admin/login`, cannot access protected pages | P0 |
| E2E-AUTH-06 | Session persistence | 1. Login 2. Close browser tab 3. Reopen `/admin` | Still authenticated, dashboard loads | P1 |
| E2E-AUTH-07 | Client login | 1. Go to `/login` 2. Enter client credentials 3. Submit | Redirects to `/dashboard` | P1 |
| E2E-AUTH-08 | Already-authenticated redirect | 1. While logged in as admin 2. Navigate to `/admin/login` | Redirects to `/admin` (not shown login again) | P2 |

---

### Suite B: Navigation & Layout

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-NAV-01 | Sidebar renders all sections | 1. Login as admin 2. Inspect sidebar | All 4 sections visible: Main, Channels, Business, Settings | P0 |
| E2E-NAV-02 | Dashboard page loads | Navigate to `/admin` | KPI cards render (Products, TikTok, Amazon, Trends, Competitors, Clients, Influencers, Suppliers), service status shows all green | P0 |
| E2E-NAV-03 | All admin pages load without error | Navigate to each of the 28 admin pages | No blank screens, no console errors, no 500 responses | P0 |
| E2E-NAV-04 | Active page highlighted | Click "Products" in sidebar | Products link highlighted, page loads | P1 |
| E2E-NAV-05 | Theme toggle | Click theme toggle in sidebar | Theme switches between light/dark, persists on refresh | P2 |
| E2E-NAV-06 | Mobile responsive | Resize to 375px width | Sidebar collapses to hamburger menu, content adapts | P2 |

**Full page checklist for E2E-NAV-03:**
```
/admin                    — Dashboard
/admin/scan               — Scan Control
/admin/products           — Products
/admin/clients            — Clients
/admin/tiktok             — TikTok
/admin/amazon             — Amazon
/admin/shopify            — Shopify
/admin/pinterest          — Pinterest
/admin/digital            — Digital
/admin/affiliates         — Affiliates Hub
/admin/affiliates/ai      — AI Affiliates
/admin/affiliates/physical — Physical Affiliates
/admin/trends             — Trends
/admin/clusters           — Clusters
/admin/competitors        — Competitors
/admin/influencers        — Influencers
/admin/creator-matches    — Creator Matches
/admin/analytics          — Analytics
/admin/blueprints         — Blueprints
/admin/allocate           — Allocate
/admin/suppliers          — Suppliers
/admin/ads                — Ads
/admin/notifications      — Notifications
/admin/settings           — Settings
/admin/setup              — Setup
/admin/import             — Import
```

---

### Suite C: Product CRUD Operations (CRITICAL)

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-PROD-01 | Create product | 1. Go to `/admin/products` 2. Click "Add Product" 3. Fill: title="Test Widget", category="Electronics", price=29.99, cost=12.00 4. Submit | Product appears in table, success toast | P0 |
| E2E-PROD-02 | Read products list | 1. Go to `/admin/products` | Table loads with product from PROD-01, shows title, category, price, platform badge | P0 |
| E2E-PROD-03 | Edit product | 1. Click edit on "Test Widget" 2. Change title to "Updated Widget" 3. Save | Title updates in table, success toast | P0 |
| E2E-PROD-04 | Delete product | 1. Click delete on "Updated Widget" 2. Confirm in dialog | Product removed from table, success toast | P0 |
| E2E-PROD-05 | Search/filter products | 1. Add 3 products with different categories 2. Type search term 3. Verify filter | Only matching products shown | P1 |
| E2E-PROD-06 | Pagination | 1. Create >10 products (or lower page size) 2. Click next page | Second page loads with remaining products | P1 |
| E2E-PROD-07 | Product card rendering | 1. View a product with score, platform | Score gauge renders with correct color tier, platform badge shows | P1 |
| E2E-PROD-08 | Empty state | 1. Delete all products 2. View products page | "No products" message or empty state UI | P2 |

---

### Suite D: Client Management (CRITICAL)

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-CLIENT-01 | Create client | 1. Go to `/admin/clients` 2. Click "Add Client" 3. Fill: name="Test Corp", email="test@example.com", plan="starter", niche="fashion" 4. Submit | Client appears in table | P0 |
| E2E-CLIENT-02 | Read clients list | 1. Go to `/admin/clients` | Table shows Test Corp with plan badge | P0 |
| E2E-CLIENT-03 | Update client plan | 1. Click plan dropdown on Test Corp 2. Change to "growth" 3. Confirm | Plan badge updates | P0 |
| E2E-CLIENT-04 | Delete client | 1. Click delete on Test Corp 2. Confirm | Client removed from table | P0 |
| E2E-CLIENT-05 | Duplicate email prevention | 1. Create client with email="test@example.com" 2. Try creating another with same email | Error message, second client not created | P1 |

---

### Suite E: Scan Pipeline (CRITICAL — costs money)

| ID | Test | Steps | Expected Result | Cost Est. | Priority |
|----|------|-------|-----------------|-----------|----------|
| E2E-SCAN-01 | Quick Scan initiation | 1. Go to `/admin/scan` 2. Select "Quick Scan" 3. Click Start 4. Confirm in dialog | Confirmation dialog shows cost/duration estimate, scan starts after confirm | $0.05–0.20 | P0 |
| E2E-SCAN-02 | Scan progress tracking | 1. Start a Quick Scan 2. Watch progress bar | Progress bar advances, step labels update (Trend Scout → Extraction → Scoring → Complete) | — | P0 |
| E2E-SCAN-03 | Scan completion | 1. Wait for scan to complete | Summary shows: products found, duration, cost. Products appear in `/admin/products` | — | P0 |
| E2E-SCAN-04 | Scan cancellation | 1. Start a scan 2. Click Cancel during execution | Scan stops, "Cancelled" status in history | $0 | P1 |
| E2E-SCAN-05 | Scan history | 1. After completing scans 2. View scan history section | All scan runs listed with date, mode, status, product count | — | P1 |
| E2E-SCAN-06 | Full Scan | 1. Select "Full Scan" 2. Execute | All 7 channels processed, more products discovered | $0.50–2.00 | P1 |
| E2E-SCAN-07 | Client Scan | 1. Select "Client Scan" 2. Choose a client 3. Execute | Scan scoped to client's niche, results allocated to client | $0.30–1.50 | P1 |
| E2E-SCAN-08 | Backend unavailable | 1. Set invalid BACKEND_URL in settings 2. Try scan | Clear error message about backend connection, not a crash | — | P2 |

**Note:** Suite E triggers real API calls. Run only when ready to incur costs. Quick Scan (E2E-SCAN-01 through 05) should be tested first as cheapest option.

---

### Suite F: Product Allocation

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-ALLOC-01 | Allocate product to client | 1. Go to `/admin/allocate` 2. Select client from dropdown 3. Check products to allocate 4. Toggle visibility ON 5. Confirm | Products allocated, success confirmation | P0 |
| E2E-ALLOC-02 | Client sees allocated products | 1. Login as client 2. Go to `/dashboard/products` | Only allocated + visible products appear | P0 |
| E2E-ALLOC-03 | Toggle visibility off | 1. Admin: toggle visibility OFF for an allocated product | Product disappears from client's dashboard | P1 |
| E2E-ALLOC-04 | Multiple client allocation | 1. Allocate different products to 2 different clients 2. Login as each client | Each client sees only their allocated products | P1 |

---

### Suite G: Intelligence Pages (Read-only verification)

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-INTEL-01 | Trends page | Navigate to `/admin/trends` | Page loads, shows trend keywords table (may be empty), no errors | P1 |
| E2E-INTEL-02 | Competitors page | Navigate to `/admin/competitors` | Page loads, competitor stores table renders | P1 |
| E2E-INTEL-03 | Influencers page | Navigate to `/admin/influencers` | Page loads, influencer table renders | P1 |
| E2E-INTEL-04 | Clusters page | Navigate to `/admin/clusters` | Page loads, product cluster visualization renders | P1 |
| E2E-INTEL-05 | Analytics page | Navigate to `/admin/analytics` | Page loads, analytics charts/tables render | P1 |
| E2E-INTEL-06 | Creator matches page | Navigate to `/admin/creator-matches` | Page loads, creator match cards render | P1 |
| E2E-INTEL-07 | Blueprints page | Navigate to `/admin/blueprints` | Page loads, blueprint list renders | P1 |
| E2E-INTEL-08 | Blueprint PDF download | 1. Have a blueprint 2. Click "Download PDF" | PDF generates and downloads | P2 |

---

### Suite H: Channel Discovery Pages

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-CHAN-01 | TikTok page | Navigate to `/admin/tiktok` | Page loads, TikTok products/videos table renders | P1 |
| E2E-CHAN-02 | Amazon page | Navigate to `/admin/amazon` | Page loads, Amazon product table renders | P1 |
| E2E-CHAN-03 | Shopify page | Navigate to `/admin/shopify` | Page loads, Shopify store discovery renders | P1 |
| E2E-CHAN-04 | Pinterest page | Navigate to `/admin/pinterest` | Page loads, Pinterest pin/product renders | P1 |
| E2E-CHAN-05 | Digital page | Navigate to `/admin/digital` | Page loads, digital product listings render | P1 |
| E2E-CHAN-06 | Affiliates hub | Navigate to `/admin/affiliates` | Page loads, affiliate program table renders | P1 |
| E2E-CHAN-07 | AI Affiliates | Navigate to `/admin/affiliates/ai` | Page loads, AI affiliate opportunities render | P2 |
| E2E-CHAN-08 | Physical Affiliates | Navigate to `/admin/affiliates/physical` | Page loads, physical affiliate programs render | P2 |

---

### Suite I: Settings & Configuration

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-SET-01 | View API keys | Go to `/admin/settings` | All 5 providers shown with status indicators (green connected / red missing) | P0 |
| E2E-SET-02 | Toggle key visibility | Click "Show" on an API key | Key value revealed, click "Hide" to mask again | P1 |
| E2E-SET-03 | Update API key | 1. Edit an API key value 2. Save | Key saved, status indicator refreshes | P1 |
| E2E-SET-04 | Setup page | Navigate to `/admin/setup` | Setup wizard loads, shows configuration status | P1 |
| E2E-SET-05 | Import page | Navigate to `/admin/import` | Import UI loads, file upload area visible | P2 |
| E2E-SET-06 | Notifications page | Navigate to `/admin/notifications` | Notification list renders (may be empty) | P2 |

---

### Suite J: Client Dashboard (Client Portal)

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-DASH-01 | Client dashboard loads | 1. Login as client 2. Navigate to `/dashboard` | KPI cards render, allocated products summary visible | P0 |
| E2E-DASH-02 | Client products page | Navigate to `/dashboard/products` | Allocated products with platform/stage badges shown | P0 |
| E2E-DASH-03 | Client requests page | Navigate to `/dashboard/requests` | Request form and history visible | P1 |
| E2E-DASH-04 | Submit product request | 1. Go to `/dashboard/requests` 2. Fill request form 3. Submit | Request saved, appears in request history | P1 |
| E2E-DASH-05 | Client cannot access admin | 1. While logged in as client 2. Navigate to `/admin` | Redirected to `/admin/unauthorized` or `/login` | P0 |

---

### Suite K: Realtime & Notifications

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-RT-01 | Dashboard realtime update | 1. Open admin dashboard in browser 2. In Supabase SQL Editor, INSERT a product 3. Watch dashboard | Product count updates within 3 seconds without page refresh | P1 |
| E2E-RT-02 | Scan progress realtime | 1. Start a scan 2. Watch progress in another browser tab | Progress updates appear in real-time | P1 |
| E2E-RT-03 | Notification delivery | 1. Trigger a HOT product alert 2. Check notifications page | Notification appears in `/admin/notifications` | P2 |

---

### Suite L: API Route Validation

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-API-01 | Unauthenticated API access | `curl /api/admin/products` (no cookie) | 401 Unauthorized | P0 |
| E2E-API-02 | Products API GET | Authenticated GET `/api/admin/products` | 200 with JSON array of products | P0 |
| E2E-API-03 | Products API POST | POST `/api/admin/products` with valid body | 201 with created product | P0 |
| E2E-API-04 | Products API DELETE | DELETE `/api/admin/products?id=...` | 200, product removed | P0 |
| E2E-API-05 | Dashboard API | GET `/api/admin/dashboard` | 200 with counts and service statuses | P1 |
| E2E-API-06 | Scan API POST | POST `/api/admin/scan` with mode | 200 with jobId or error about backend | P1 |
| E2E-API-07 | Client dashboard API | Authenticated GET `/api/dashboard/products` as client | 200 with allocated products only | P1 |
| E2E-API-08 | Cross-role API access | Authenticated as client, GET `/api/admin/products` | 403 Forbidden | P1 |
| E2E-API-09 | Invalid input handling | POST `/api/admin/products` with empty body | 400 with validation error, not 500 | P2 |

---

### Suite M: Scoring Engine Validation

| ID | Test | Steps | Expected Result | Priority |
|----|------|-------|-----------------|----------|
| E2E-SCORE-01 | Score calculation | 1. Create product with known metrics 2. Call scoring API | Score follows formula: `trend×0.40 + viral×0.35 + profit×0.25` | P1 |
| E2E-SCORE-02 | Score tier assignment | Verify products with score ≥80 = HOT, ≥60 = WARM, ≥40 = WATCH, <40 = COLD | Correct tier badge on product cards | P1 |
| E2E-SCORE-03 | Score color coding | View product cards with different scores | Red ≥80, Orange ≥60, Yellow ≥40, Gray <40 | P2 |

---

## 3. Execution Order

### Phase 1: Foundation (Do first — blocks everything)
```
E2E-AUTH-01 through AUTH-05    — Login/logout/protection
E2E-NAV-01 through NAV-03     — Pages load without errors
E2E-API-01                     — API protection works
```

### Phase 2: Core CRUD (Do second — validates data layer)
```
E2E-PROD-01 through PROD-04   — Product create/read/update/delete
E2E-CLIENT-01 through CLIENT-04 — Client create/read/update/delete
E2E-SET-01                     — Settings page loads
E2E-API-02 through API-04     — API CRUD works
```

### Phase 3: Business Flows (Do third — validates workflows)
```
E2E-ALLOC-01 through ALLOC-02 — Product allocation works
E2E-DASH-01 through DASH-02   — Client sees allocated products
E2E-DASH-05                    — Client isolation verified
E2E-API-07, API-08            — Cross-role API isolation
```

### Phase 4: Scan Pipeline (Do fourth — costs money)
```
E2E-SCAN-01 through SCAN-05   — Quick Scan end-to-end
E2E-SCAN-06, SCAN-07          — Full/Client Scan (optional, higher cost)
```

### Phase 5: Intelligence & Channels (Read-only verification)
```
E2E-INTEL-01 through INTEL-07 — All intelligence pages render
E2E-CHAN-01 through CHAN-08    — All channel pages render
E2E-SCORE-01 through SCORE-03 — Scoring engine validation
```

### Phase 6: Advanced Features (Final polish)
```
E2E-RT-01 through RT-03       — Realtime updates
E2E-AUTH-06 through AUTH-08   — Session edge cases
E2E-PROD-05 through PROD-08  — Search, pagination, edge cases
E2E-SET-02 through SET-06    — Settings management
E2E-API-09                    — Input validation
E2E-NAV-04 through NAV-06    — UX polish
```

---

## 4. Test Data Requirements

### Before Testing
| Data | Action | Purpose |
|------|--------|---------|
| Admin account | Already exists (admin@yousell.online) | Admin flow testing |
| Client account | Create via `/admin/clients` OR Supabase Auth | Client portal testing |
| Test products | Create 5+ via `/admin/products` | CRUD + allocation testing |

### Test Data Cleanup
After testing, delete:
- Test products created during E2E-PROD tests
- Test client "Test Corp" from E2E-CLIENT tests
- Test allocations from E2E-ALLOC tests
- Any scan results from E2E-SCAN tests (optional — useful data)

---

## 5. Pass/Fail Criteria

### Release Blocker (must pass)
- All P0 tests pass (22 tests)
- No 500 errors on any page
- No data leaking between admin and client roles

### Recommended (should pass)
- All P1 tests pass (32 tests)
- Scan pipeline completes successfully at least once

### Nice-to-Have
- All P2 tests pass (14 tests)
- Mobile responsive layout works

---

## 6. Known Limitations & Exclusions

| Item | Reason |
|------|--------|
| Stripe billing | Not yet implemented |
| Store OAuth integration | Not yet implemented |
| Content creation engine | Not yet implemented |
| Order tracking | Not yet implemented |
| Mobile app | Not yet implemented |
| Redis connection test | Cannot test from frontend (check backend logs) |
| Supabase Realtime | Manual verification only (no automated test possible from API) |
| Load/stress testing | Out of scope for functional E2E |

---

## 7. Bug Reporting Template

When a test fails, log it as:

```
Test ID:     E2E-PROD-03
Status:      FAIL
Steps:       Clicked edit → changed title → clicked Save
Expected:    Title updates in table
Actual:      Save button unresponsive, console shows "TypeError: undefined"
Screenshot:  [attach]
Browser:     Chrome 122
Severity:    HIGH (blocks CRUD workflow)
```

---

## 8. Estimated Execution Time

| Phase | Tests | Time Est. | Cost Est. |
|-------|-------|-----------|-----------|
| Phase 1: Foundation | 8 | 15 min | $0 |
| Phase 2: Core CRUD | 11 | 20 min | $0 |
| Phase 3: Business Flows | 5 | 15 min | $0 |
| Phase 4: Scan Pipeline | 5–7 | 30 min | $0.05–2.00 |
| Phase 5: Intelligence | 14 | 15 min | $0 |
| Phase 6: Advanced | 14 | 20 min | $0 |
| **Total** | **57–59** | **~2 hours** | **$0.05–2.00** |
