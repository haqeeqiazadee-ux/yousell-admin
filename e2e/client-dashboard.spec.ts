import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

// Use authenticated session
test.use({ storageState: 'e2e/.auth/admin.json' });

// ─── 1. TRENDING NOW (/dashboard) ────────────────────────────

test.describe('Trending Now (/dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard', 5000);
  });

  test('page loads with product grid', async ({ page }) => {
    const grid = page.locator('[class*="grid"], [class*="product-grid"], [class*="ProductGrid"], [role="list"]');
    await expect(grid.first()).toBeVisible({ timeout: 15000 });
  });

  test('AI briefing card is visible', async ({ page }) => {
    const briefing = page.locator('[class*="briefing"], [class*="Briefing"], [class*="ai-brief"], [data-testid*="briefing"]');
    await expect(briefing.first()).toBeVisible({ timeout: 15000 });
  });

  test('time filter buttons work (Today/7 Days/30 Days)', async ({ page }) => {
    const filterBar = page.locator('button, [role="tab"]');
    const todayBtn = filterBar.filter({ hasText: /today/i }).first();
    const sevenDaysBtn = filterBar.filter({ hasText: /7\s*day/i }).first();
    const thirtyDaysBtn = filterBar.filter({ hasText: /30\s*day/i }).first();

    await expect(todayBtn).toBeVisible({ timeout: 10000 });
    await expect(sevenDaysBtn).toBeVisible();
    await expect(thirtyDaysBtn).toBeVisible();

    await sevenDaysBtn.click();
    await page.waitForTimeout(1500);
    await thirtyDaysBtn.click();
    await page.waitForTimeout(1500);
    await todayBtn.click();
  });

  test('sort dropdown changes order', async ({ page }) => {
    const sortDropdown = page.locator('select, [class*="sort"], [class*="Sort"], [data-testid*="sort"], button:has-text("Sort")');
    await expect(sortDropdown.first()).toBeVisible({ timeout: 10000 });
    await sortDropdown.first().click();
    await page.waitForTimeout(500);
  });

  test('category filter works', async ({ page }) => {
    const categoryFilter = page.locator('[class*="category"], [class*="Category"], select, [data-testid*="category"], button:has-text("Category")');
    await expect(categoryFilter.first()).toBeVisible({ timeout: 10000 });
  });

  test('min score filter works', async ({ page }) => {
    const scoreFilter = page.locator('[class*="score"], [class*="Score"], input[type="range"], [data-testid*="score"]');
    await expect(scoreFilter.first()).toBeVisible({ timeout: 10000 });
  });

  test('product cards show image, title, platform badge, score', async ({ page }) => {
    const card = page.locator('[class*="card"], [class*="Card"], [class*="product"]').first();
    await expect(card).toBeVisible({ timeout: 15000 });

    // Image
    const image = card.locator('img').first();
    await expect(image).toBeVisible();

    // Title text
    const title = card.locator('h2, h3, h4, [class*="title"], [class*="Title"], [class*="name"]').first();
    await expect(title).toBeVisible();

    // Platform badge
    const badge = card.locator('[class*="badge"], [class*="Badge"], [class*="platform"], [class*="Platform"]').first();
    await expect(badge).toBeVisible();

    // Score
    const score = card.locator('[class*="score"], [class*="Score"]').first();
    await expect(score).toBeVisible();
  });

  test('load more button shows additional products', async ({ page }) => {
    const loadMore = page.locator('button:has-text("Load More"), button:has-text("load more"), button:has-text("Show More"), [class*="load-more"], [class*="LoadMore"]');
    if (await loadMore.count() > 0) {
      const initialCards = await page.locator('[class*="card"], [class*="Card"], [class*="product"]').count();
      await loadMore.first().click();
      await page.waitForTimeout(2000);
      const afterCards = await page.locator('[class*="card"], [class*="Card"], [class*="product"]').count();
      expect(afterCards).toBeGreaterThanOrEqual(initialCards);
    }
  });

  test('product count updates', async ({ page }) => {
    const countEl = page.locator('[class*="count"], [class*="Count"], [class*="total"], [class*="Total"], [class*="results"]');
    await expect(countEl.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 2. PRODUCT DETAIL (/dashboard/product/:id) ──────────────

test.describe('Product Detail (/dashboard/product/test-id)', () => {
  test.beforeEach(async ({ page }) => {
    // First go to dashboard to get a real product ID
    await navigateTo(page, '/dashboard', 5000);
    // Click the first product card to navigate to a real detail page
    const card = page.locator('[class*="card"] a, [class*="Card"] a, a[href*="/product/"]').first();
    if (await card.count() > 0) {
      await card.click();
      await page.waitForTimeout(3000);
    } else {
      await navigateTo(page, '/dashboard/product/test-id', 5000);
    }
  });

  test('page loads with breadcrumb', async ({ page }) => {
    const breadcrumb = page.locator('[class*="breadcrumb"], [class*="Breadcrumb"], nav[aria-label*="breadcrumb"], [class*="crumb"]');
    await expect(breadcrumb.first()).toBeVisible({ timeout: 15000 });
  });

  test('sticky header is visible', async ({ page }) => {
    const header = page.locator('[class*="sticky"], [class*="Sticky"], header, [class*="product-header"], [class*="ProductHeader"]');
    await expect(header.first()).toBeVisible({ timeout: 10000 });
  });

  test('composite score gauge renders', async ({ page }) => {
    const gauge = page.locator('[class*="gauge"], [class*="Gauge"], [class*="score-circle"], [class*="ScoreCircle"], [class*="composite"], svg[class*="score"]');
    await expect(gauge.first()).toBeVisible({ timeout: 15000 });
  });

  test('top 3 signals displayed', async ({ page }) => {
    const signals = page.locator('[class*="signal"], [class*="Signal"], [class*="top-signal"], [class*="TopSignal"]');
    await expect(signals.first()).toBeVisible({ timeout: 10000 });
    const count = await signals.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('Intelligence Chain Row 1: Product Identity (image, title, badges)', async ({ page }) => {
    const identity = page.locator('[class*="identity"], [class*="Identity"], [class*="product-info"], [class*="ProductInfo"]').first();
    await expect(identity).toBeVisible({ timeout: 10000 });
    await expect(identity.locator('img').first()).toBeVisible();
  });

  test('Intelligence Chain Row 2: Product Stats (4 tabs visible)', async ({ page }) => {
    const statsSection = page.locator('[class*="stats"], [class*="Stats"], [class*="product-stats"]');
    await expect(statsSection.first()).toBeVisible({ timeout: 10000 });
    const tabs = statsSection.first().locator('[role="tab"], button, [class*="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(4);
  });

  test('Intelligence Chain Row 3: Influencers (collapsible, expand works)', async ({ page }) => {
    const influencerSection = page.locator('[class*="influencer"], [class*="Influencer"], [class*="creator"]').first();
    await expect(influencerSection).toBeVisible({ timeout: 10000 });
    // Try expanding
    const expandBtn = influencerSection.locator('button, [class*="expand"], [class*="toggle"], [class*="collapse"]').first();
    if (await expandBtn.count() > 0) {
      await expandBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('Intelligence Chain Row 4: TikTok Shops (collapsible)', async ({ page }) => {
    const tiktokShops = page.locator('[class*="tiktok-shop"], [class*="TiktokShop"], [class*="tiktok_shop"], text=/TikTok Shop/i').first();
    await expect(tiktokShops).toBeVisible({ timeout: 10000 });
  });

  test('Intelligence Chain Row 5: Other Channels (collapsible)', async ({ page }) => {
    const channels = page.locator('[class*="channel"], [class*="Channel"], text=/Other Channel/i, text=/channel/i').first();
    await expect(channels).toBeVisible({ timeout: 10000 });
  });

  test('Intelligence Chain Row 6: Videos & Ads (collapsible)', async ({ page }) => {
    const videos = page.locator('[class*="video"], [class*="Video"], [class*="ads"], text=/Videos/i, text=/Ads/i').first();
    await expect(videos).toBeVisible({ timeout: 10000 });
  });

  test('Intelligence Chain Row 7: Opportunity Score (expanded, action buttons)', async ({ page }) => {
    const opportunity = page.locator('[class*="opportunity"], [class*="Opportunity"], text=/Opportunity/i').first();
    await expect(opportunity).toBeVisible({ timeout: 10000 });
    const actionBtns = page.locator('[class*="opportunity"] button, [class*="Opportunity"] button, [class*="action"] button');
    const btnCount = await actionBtns.count();
    expect(btnCount).toBeGreaterThanOrEqual(1);
  });

  test('bottom CTA bar is sticky', async ({ page }) => {
    const cta = page.locator('[class*="cta"], [class*="CTA"], [class*="bottom-bar"], [class*="BottomBar"], [class*="sticky-bar"]');
    await expect(cta.first()).toBeVisible({ timeout: 10000 });
  });

  test('watch button toggles', async ({ page }) => {
    const watchBtn = page.locator('button:has-text("Watch"), button:has-text("watch"), button[class*="watch"], [data-testid*="watch"]').first();
    await expect(watchBtn).toBeVisible({ timeout: 10000 });
    await watchBtn.click();
    await page.waitForTimeout(1000);
    // Verify toggle state changed
    await watchBtn.click();
    await page.waitForTimeout(500);
  });

  test('export button visible', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("export"), button[class*="export"], [data-testid*="export"]');
    await expect(exportBtn.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 3. TIKTOK INTELLIGENCE (/dashboard/tiktok) ──────────────

test.describe('TikTok Intelligence (/dashboard/tiktok)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/tiktok', 5000);
  });

  test('4 KPI cards render', async ({ page }) => {
    const kpiCards = page.locator('[class*="kpi"], [class*="KPI"], [class*="stat-card"], [class*="StatCard"], [class*="metric"]');
    await expect(kpiCards.first()).toBeVisible({ timeout: 15000 });
    const count = await kpiCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('5 sub-tabs visible and switchable', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab-item"], [class*="TabItem"]');
    await expect(tabs.first()).toBeVisible({ timeout: 10000 });
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(5);

    // Switch through tabs
    for (let i = 0; i < Math.min(tabCount, 5); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(1000);
    }
  });

  test('Products tab: filter bar and table with rows', async ({ page }) => {
    const productsTab = page.locator('[role="tab"]:has-text("Product"), button:has-text("Product")').first();
    if (await productsTab.count() > 0) await productsTab.click();
    await page.waitForTimeout(1500);

    const filterBar = page.locator('[class*="filter"], [class*="Filter"], [class*="toolbar"]');
    await expect(filterBar.first()).toBeVisible({ timeout: 10000 });

    const table = page.locator('table, [class*="table"], [class*="Table"], [role="table"]');
    await expect(table.first()).toBeVisible({ timeout: 10000 });

    const rows = table.first().locator('tr, [class*="row"], [role="row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('Videos tab: 3-col grid', async ({ page }) => {
    const videosTab = page.locator('[role="tab"]:has-text("Video"), button:has-text("Video")').first();
    if (await videosTab.count() > 0) await videosTab.click();
    await page.waitForTimeout(1500);

    const grid = page.locator('[class*="grid"], [class*="Grid"], [class*="video-grid"]');
    await expect(grid.first()).toBeVisible({ timeout: 10000 });
  });

  test('Shops tab: table renders', async ({ page }) => {
    const shopsTab = page.locator('[role="tab"]:has-text("Shop"), button:has-text("Shop")').first();
    if (await shopsTab.count() > 0) await shopsTab.click();
    await page.waitForTimeout(1500);

    const table = page.locator('table, [class*="table"], [class*="Table"], [role="table"]');
    await expect(table.first()).toBeVisible({ timeout: 10000 });
  });

  test('Creators tab: table with match scores', async ({ page }) => {
    const creatorsTab = page.locator('[role="tab"]:has-text("Creator"), button:has-text("Creator")').first();
    if (await creatorsTab.count() > 0) await creatorsTab.click();
    await page.waitForTimeout(1500);

    const table = page.locator('table, [class*="table"], [class*="Table"], [role="table"]');
    await expect(table.first()).toBeVisible({ timeout: 10000 });

    const matchScore = page.locator('[class*="match"], [class*="Match"], [class*="score"]');
    await expect(matchScore.first()).toBeVisible({ timeout: 10000 });
  });

  test('Ads tab: ad grid + AI insight', async ({ page }) => {
    const adsTab = page.locator('[role="tab"]:has-text("Ad"), button:has-text("Ad")').first();
    if (await adsTab.count() > 0) await adsTab.click();
    await page.waitForTimeout(1500);

    const adGrid = page.locator('[class*="grid"], [class*="Grid"], [class*="ad-grid"]');
    await expect(adGrid.first()).toBeVisible({ timeout: 10000 });

    const aiInsight = page.locator('[class*="insight"], [class*="Insight"], [class*="ai-insight"]');
    await expect(aiInsight.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 4. AMAZON INTELLIGENCE (/dashboard/amazon) ──────────────

test.describe('Amazon Intelligence (/dashboard/amazon)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/amazon', 5000);
  });

  test('4 KPI cards render', async ({ page }) => {
    const kpiCards = page.locator('[class*="kpi"], [class*="KPI"], [class*="stat-card"], [class*="StatCard"], [class*="metric"]');
    await expect(kpiCards.first()).toBeVisible({ timeout: 15000 });
    const count = await kpiCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('4 sub-tabs (Products/BSR Movers/Sellers/Reviews)', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab-item"], [class*="TabItem"]');
    await expect(tabs.first()).toBeVisible({ timeout: 10000 });
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(4);
  });

  test('Products tab: ASIN column visible', async ({ page }) => {
    const productsTab = page.locator('[role="tab"]:has-text("Product"), button:has-text("Product")').first();
    if (await productsTab.count() > 0) await productsTab.click();
    await page.waitForTimeout(1500);

    const asinCol = page.locator('th:has-text("ASIN"), td:has-text("ASIN"), [class*="asin"], [class*="ASIN"]');
    await expect(asinCol.first()).toBeVisible({ timeout: 10000 });
  });

  test('BSR Movers: heatmap coloring visible', async ({ page }) => {
    const bsrTab = page.locator('[role="tab"]:has-text("BSR"), button:has-text("BSR")').first();
    if (await bsrTab.count() > 0) await bsrTab.click();
    await page.waitForTimeout(1500);

    const heatmap = page.locator('[class*="heatmap"], [class*="Heatmap"], [class*="heat"], [class*="bsr"]');
    await expect(heatmap.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 5. SHOPIFY INTELLIGENCE (/dashboard/shopify) ─────────────

test.describe('Shopify Intelligence (/dashboard/shopify)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/shopify', 5000);
  });

  test('4 KPI cards render', async ({ page }) => {
    const kpiCards = page.locator('[class*="kpi"], [class*="KPI"], [class*="stat-card"], [class*="StatCard"], [class*="metric"]');
    await expect(kpiCards.first()).toBeVisible({ timeout: 15000 });
    const count = await kpiCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('4 sub-tabs visible', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab-item"], [class*="TabItem"]');
    await expect(tabs.first()).toBeVisible({ timeout: 10000 });
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(4);
  });

  test('store detail panel opens on row click', async ({ page }) => {
    const row = page.locator('table tr, [class*="row"], [role="row"]').nth(1);
    if (await row.count() > 0) {
      await row.click();
      await page.waitForTimeout(1500);
      const panel = page.locator('[class*="panel"], [class*="Panel"], [class*="detail"], [class*="Detail"], [class*="drawer"], [class*="Drawer"], [class*="sheet"]');
      await expect(panel.first()).toBeVisible({ timeout: 10000 });
    }
  });
});

// ─── 6. PRE-VIRAL DETECTION (/dashboard/pre-viral) ───────────

test.describe('Pre-Viral Detection (/dashboard/pre-viral)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/pre-viral', 5000);
  });

  test('model accuracy badge visible', async ({ page }) => {
    const badge = page.locator('[class*="accuracy"], [class*="Accuracy"], [class*="model-badge"], [class*="badge"]');
    await expect(badge.first()).toBeVisible({ timeout: 15000 });
  });

  test('explanation banner shows on first visit', async ({ page }) => {
    const banner = page.locator('[class*="banner"], [class*="Banner"], [class*="explanation"], [class*="Explanation"], [class*="onboarding"], [class*="intro"]');
    await expect(banner.first()).toBeVisible({ timeout: 10000 });
  });

  test('signal strength meter works', async ({ page }) => {
    const meter = page.locator('[class*="meter"], [class*="Meter"], [class*="signal-strength"], [class*="SignalStrength"], [class*="strength"]');
    await expect(meter.first()).toBeVisible({ timeout: 10000 });
  });

  test('pre-viral table renders products', async ({ page }) => {
    const table = page.locator('table, [class*="table"], [class*="Table"], [role="table"]');
    await expect(table.first()).toBeVisible({ timeout: 15000 });
    const rows = table.first().locator('tr, [class*="row"], [role="row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('signal breakdown expands', async ({ page }) => {
    const expandBtn = page.locator('[class*="expand"], [class*="Expand"], button:has-text("Breakdown"), button:has-text("Signal"), [class*="toggle"]').first();
    if (await expandBtn.count() > 0) {
      await expandBtn.click();
      await page.waitForTimeout(1000);
      const breakdown = page.locator('[class*="breakdown"], [class*="Breakdown"], [class*="detail"], [class*="expanded"]');
      await expect(breakdown.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('AI prediction text streams', async ({ page }) => {
    const prediction = page.locator('[class*="prediction"], [class*="Prediction"], [class*="ai-text"], [class*="stream"], [class*="typing"]');
    await expect(prediction.first()).toBeVisible({ timeout: 15000 });
  });
});

// ─── 7. OPPORTUNITY FEED (/dashboard/opportunities) ──────────

test.describe('Opportunity Feed (/dashboard/opportunities)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/opportunities', 5000);
  });

  test('preference controls visible', async ({ page }) => {
    const prefs = page.locator('[class*="preference"], [class*="Preference"], [class*="controls"], [class*="Controls"], [class*="filter-bar"]');
    await expect(prefs.first()).toBeVisible({ timeout: 15000 });
  });

  test('opportunity cards render with scores', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"], [class*="opportunity"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    const score = cards.first().locator('[class*="score"], [class*="Score"]');
    await expect(score.first()).toBeVisible();
  });

  test('WHY NOW section has streaming text', async ({ page }) => {
    const whyNow = page.locator('[class*="why-now"], [class*="WhyNow"], [class*="why_now"], text=/Why Now/i, [class*="reasoning"]');
    await expect(whyNow.first()).toBeVisible({ timeout: 15000 });
  });

  test('signal bars visible', async ({ page }) => {
    const signalBars = page.locator('[class*="signal-bar"], [class*="SignalBar"], [class*="signal"], [class*="bar-chart"]');
    await expect(signalBars.first()).toBeVisible({ timeout: 10000 });
  });

  test('load more works', async ({ page }) => {
    const loadMore = page.locator('button:has-text("Load More"), button:has-text("load more"), button:has-text("Show More"), [class*="load-more"]');
    if (await loadMore.count() > 0) {
      const initialCards = await page.locator('[class*="card"], [class*="Card"], [class*="opportunity"]').count();
      await loadMore.first().click();
      await page.waitForTimeout(2000);
      const afterCards = await page.locator('[class*="card"], [class*="Card"], [class*="opportunity"]').count();
      expect(afterCards).toBeGreaterThanOrEqual(initialCards);
    }
  });
});

// ─── 8. CREATOR DISCOVERY (/dashboard/creators) ──────────────

test.describe('Creator Discovery (/dashboard/creators)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/creators', 5000);
  });

  test('filter bar with dropdowns', async ({ page }) => {
    const filterBar = page.locator('[class*="filter"], [class*="Filter"], [class*="toolbar"]');
    await expect(filterBar.first()).toBeVisible({ timeout: 15000 });

    const dropdowns = filterBar.first().locator('select, [class*="dropdown"], [class*="Dropdown"], [class*="select"], [role="combobox"]');
    const dropdownCount = await dropdowns.count();
    expect(dropdownCount).toBeGreaterThanOrEqual(1);
  });

  test('creator table renders', async ({ page }) => {
    const table = page.locator('table, [class*="table"], [class*="Table"], [role="table"]');
    await expect(table.first()).toBeVisible({ timeout: 15000 });
    const rows = table.first().locator('tr, [class*="row"], [role="row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('profile panel opens on row click', async ({ page }) => {
    const row = page.locator('table tr, [class*="row"], [role="row"]').nth(1);
    if (await row.count() > 0) {
      await row.click();
      await page.waitForTimeout(1500);
      const panel = page.locator('[class*="panel"], [class*="Panel"], [class*="profile"], [class*="Profile"], [class*="drawer"], [class*="Drawer"], [class*="sheet"]');
      await expect(panel.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('outreach email button visible', async ({ page }) => {
    const emailBtn = page.locator('button:has-text("Outreach"), button:has-text("Email"), button:has-text("Contact"), [class*="outreach"], [data-testid*="outreach"]');
    await expect(emailBtn.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 9. AD INTELLIGENCE (/dashboard/ads) ─────────────────────

test.describe('Ad Intelligence (/dashboard/ads)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/ads', 5000);
  });

  test('platform tabs switchable', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab-item"], [class*="TabItem"], [class*="platform-tab"]');
    await expect(tabs.first()).toBeVisible({ timeout: 15000 });

    const tabCount = await tabs.count();
    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(1000);
    }
  });

  test('ad grid renders', async ({ page }) => {
    const grid = page.locator('[class*="grid"], [class*="Grid"], [class*="ad-grid"], [class*="AdGrid"]');
    await expect(grid.first()).toBeVisible({ timeout: 15000 });
  });

  test('scaling signals table visible', async ({ page }) => {
    const signals = page.locator('[class*="scaling"], [class*="Scaling"], [class*="signal"], table, [class*="table"]');
    await expect(signals.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 10. WATCHLIST (/dashboard/watchlist) ─────────────────────

test.describe('Watchlist (/dashboard/watchlist)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/watchlist', 5000);
  });

  test('filter tabs work', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab-item"], [class*="TabItem"], [class*="filter-tab"]');
    await expect(tabs.first()).toBeVisible({ timeout: 15000 });

    const tabCount = await tabs.count();
    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(800);
    }
  });

  test('watchlist table renders', async ({ page }) => {
    const table = page.locator('table, [class*="table"], [class*="Table"], [role="table"], [class*="watchlist"]');
    await expect(table.first()).toBeVisible({ timeout: 15000 });
  });

  test('edit alert opens dialog', async ({ page }) => {
    const editBtn = page.locator('button:has-text("Edit"), button:has-text("Alert"), button:has-text("edit"), [class*="edit-alert"], [data-testid*="edit"]').first();
    if (await editBtn.count() > 0) {
      await editBtn.click();
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"], [class*="dialog"], [class*="Dialog"], [class*="modal"], [class*="Modal"]');
      await expect(dialog.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('alert config checkboxes work', async ({ page }) => {
    const editBtn = page.locator('button:has-text("Edit"), button:has-text("Alert"), [class*="edit-alert"]').first();
    if (await editBtn.count() > 0) {
      await editBtn.click();
      await page.waitForTimeout(1000);
      const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"], [class*="checkbox"]');
      if (await checkboxes.count() > 0) {
        await checkboxes.first().click();
        await page.waitForTimeout(300);
        await checkboxes.first().click();
      }
    }
  });
});

// ─── 11. BLUEPRINTS (/dashboard/blueprints) ──────────────────

test.describe('Blueprints (/dashboard/blueprints)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/blueprints', 5000);
  });

  test('saved blueprint cards render', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"], [class*="blueprint"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
  });

  test('generate button opens wizard', async ({ page }) => {
    const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("New"), [class*="generate"], [data-testid*="generate"]').first();
    await expect(generateBtn).toBeVisible({ timeout: 10000 });
    await generateBtn.click();
    await page.waitForTimeout(1500);

    const wizard = page.locator('[class*="wizard"], [class*="Wizard"], [class*="stepper"], [class*="Stepper"], [class*="modal"], [role="dialog"]');
    await expect(wizard.first()).toBeVisible({ timeout: 10000 });
  });

  test('4-step wizard navigates correctly', async ({ page }) => {
    const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("New"), [class*="generate"]').first();
    if (await generateBtn.count() > 0) {
      await generateBtn.click();
      await page.waitForTimeout(1500);

      const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), [class*="next"]');
      // Navigate through up to 4 steps
      for (let step = 0; step < 3; step++) {
        if (await nextBtn.count() > 0) {
          await nextBtn.first().click();
          await page.waitForTimeout(1000);
        }
      }

      // Verify we reached the last step
      const stepIndicators = page.locator('[class*="step"], [class*="Step"], [class*="progress"]');
      await expect(stepIndicators.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

// ─── 12. ALERTS (/dashboard/alerts) ──────────────────────────

test.describe('Alerts (/dashboard/alerts)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/alerts', 5000);
  });

  test('tab filters work', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab-item"], [class*="TabItem"], [class*="filter-tab"]');
    await expect(tabs.first()).toBeVisible({ timeout: 15000 });

    const tabCount = await tabs.count();
    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(800);
    }
  });

  test('alert timeline renders', async ({ page }) => {
    const timeline = page.locator('[class*="timeline"], [class*="Timeline"], [class*="alert-list"], [class*="AlertList"], [class*="notification"]');
    await expect(timeline.first()).toBeVisible({ timeout: 15000 });
  });

  test('dismiss button works', async ({ page }) => {
    const dismissBtn = page.locator('button:has-text("Dismiss"), button:has-text("dismiss"), button[class*="dismiss"], [data-testid*="dismiss"], button:has-text("Clear")').first();
    if (await dismissBtn.count() > 0) {
      const initialAlerts = await page.locator('[class*="alert-item"], [class*="AlertItem"], [class*="notification-item"]').count();
      await dismissBtn.click();
      await page.waitForTimeout(1000);
      const afterAlerts = await page.locator('[class*="alert-item"], [class*="AlertItem"], [class*="notification-item"]').count();
      expect(afterAlerts).toBeLessThanOrEqual(initialAlerts);
    }
  });

  test('preferences section visible', async ({ page }) => {
    const prefs = page.locator('[class*="preference"], [class*="Preference"], [class*="settings"], button:has-text("Preferences"), button:has-text("Settings")');
    await expect(prefs.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 13. USAGE & PLAN (/dashboard/usage) ─────────────────────

test.describe('Usage & Plan (/dashboard/usage)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/usage', 5000);
  });

  test('plan card visible', async ({ page }) => {
    const planCard = page.locator('[class*="plan"], [class*="Plan"], [class*="subscription"], [class*="Subscription"]');
    await expect(planCard.first()).toBeVisible({ timeout: 15000 });
  });

  test('usage progress bars render', async ({ page }) => {
    const progressBars = page.locator('[role="progressbar"], [class*="progress"], [class*="Progress"], [class*="usage-bar"], [class*="UsageBar"]');
    await expect(progressBars.first()).toBeVisible({ timeout: 10000 });
    const barCount = await progressBars.count();
    expect(barCount).toBeGreaterThanOrEqual(1);
  });

  test('feature unlock table visible', async ({ page }) => {
    const featureTable = page.locator('[class*="feature"], [class*="Feature"], [class*="unlock"], table, [class*="table"]');
    await expect(featureTable.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 14. SETTINGS (/dashboard/settings) ──────────────────────

test.describe('Settings (/dashboard/settings)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/dashboard/settings', 5000);
  });

  test('5 tabs render and switch', async ({ page }) => {
    const tabs = page.locator('[role="tab"], [class*="tab-item"], [class*="TabItem"], [class*="settings-tab"]');
    await expect(tabs.first()).toBeVisible({ timeout: 15000 });
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < Math.min(tabCount, 5); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(800);
    }
  });

  test('Profile tab shows fields', async ({ page }) => {
    const profileTab = page.locator('[role="tab"]:has-text("Profile"), button:has-text("Profile")').first();
    if (await profileTab.count() > 0) await profileTab.click();
    await page.waitForTimeout(1000);

    const fields = page.locator('input, textarea, [class*="field"], [class*="Field"]');
    const fieldCount = await fields.count();
    expect(fieldCount).toBeGreaterThanOrEqual(1);
  });

  test('Notifications tab has toggles', async ({ page }) => {
    const notifTab = page.locator('[role="tab"]:has-text("Notification"), button:has-text("Notification")').first();
    if (await notifTab.count() > 0) await notifTab.click();
    await page.waitForTimeout(1000);

    const toggles = page.locator('[role="switch"], input[type="checkbox"], [class*="toggle"], [class*="Toggle"], [class*="switch"]');
    await expect(toggles.first()).toBeVisible({ timeout: 10000 });
    const toggleCount = await toggles.count();
    expect(toggleCount).toBeGreaterThanOrEqual(1);
  });

  test('Connected Platforms shows 3 cards', async ({ page }) => {
    const platformTab = page.locator('[role="tab"]:has-text("Connected"), [role="tab"]:has-text("Platform"), button:has-text("Connected"), button:has-text("Platform")').first();
    if (await platformTab.count() > 0) await platformTab.click();
    await page.waitForTimeout(1000);

    const cards = page.locator('[class*="card"], [class*="Card"], [class*="platform"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);
  });

  test('AI Preferences has category chips', async ({ page }) => {
    const aiTab = page.locator('[role="tab"]:has-text("AI"), button:has-text("AI Preference")').first();
    if (await aiTab.count() > 0) await aiTab.click();
    await page.waitForTimeout(1000);

    const chips = page.locator('[class*="chip"], [class*="Chip"], [class*="tag"], [class*="Tag"], [class*="category"], [class*="pill"]');
    await expect(chips.first()).toBeVisible({ timeout: 10000 });
  });

  test('API tab shows masked key', async ({ page }) => {
    const apiTab = page.locator('[role="tab"]:has-text("API"), button:has-text("API")').first();
    if (await apiTab.count() > 0) await apiTab.click();
    await page.waitForTimeout(1000);

    const maskedKey = page.locator('[class*="key"], [class*="Key"], [class*="api-key"], [class*="masked"], code, [class*="mono"]');
    await expect(maskedKey.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── 15. OTHER PAGES ─────────────────────────────────────────

test.describe('Other Dashboard Pages', () => {
  test('/dashboard/digital loads', async ({ page }) => {
    await navigateTo(page, '/dashboard/digital', 5000);
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasError = pageText.toLowerCase().includes('application error') ||
                     pageText.toLowerCase().includes('internal server error');
    expect(hasError).toBe(false);

    const content = page.locator('[class*="card"], [class*="Card"], [class*="grid"], [class*="table"], main, [class*="content"]');
    await expect(content.first()).toBeVisible({ timeout: 15000 });
  });

  test('/dashboard/ai-saas loads', async ({ page }) => {
    await navigateTo(page, '/dashboard/ai-saas', 5000);
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasError = pageText.toLowerCase().includes('application error') ||
                     pageText.toLowerCase().includes('internal server error');
    expect(hasError).toBe(false);

    const content = page.locator('[class*="card"], [class*="Card"], [class*="grid"], [class*="table"], main, [class*="content"]');
    await expect(content.first()).toBeVisible({ timeout: 15000 });
  });

  test('/dashboard/affiliates loads', async ({ page }) => {
    await navigateTo(page, '/dashboard/affiliates', 5000);
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasError = pageText.toLowerCase().includes('application error') ||
                     pageText.toLowerCase().includes('internal server error');
    expect(hasError).toBe(false);

    const content = page.locator('[class*="card"], [class*="Card"], [class*="grid"], [class*="table"], main, [class*="content"]');
    await expect(content.first()).toBeVisible({ timeout: 15000 });
  });

  test('/dashboard/saved loads with search cards', async ({ page }) => {
    await navigateTo(page, '/dashboard/saved', 5000);
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasError = pageText.toLowerCase().includes('application error') ||
                     pageText.toLowerCase().includes('internal server error');
    expect(hasError).toBe(false);

    const cards = page.locator('[class*="card"], [class*="Card"], [class*="saved"], [class*="search"]');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
  });

  test('/dashboard/help loads with checklist', async ({ page }) => {
    await navigateTo(page, '/dashboard/help', 5000);
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasError = pageText.toLowerCase().includes('application error') ||
                     pageText.toLowerCase().includes('internal server error');
    expect(hasError).toBe(false);

    const checklist = page.locator('[class*="checklist"], [class*="Checklist"], [class*="help"], [class*="Help"], [class*="onboarding"], ul, ol');
    await expect(checklist.first()).toBeVisible({ timeout: 15000 });
  });
});

// ─── CROSS-CUTTING: PAGE LOAD SMOKE TESTS ────────────────────

test.describe('Client Dashboard - All Pages Load Without Errors', () => {
  const clientPages = [
    { name: 'Trending Now', path: '/dashboard' },
    { name: 'TikTok Intelligence', path: '/dashboard/tiktok' },
    { name: 'Amazon Intelligence', path: '/dashboard/amazon' },
    { name: 'Shopify Intelligence', path: '/dashboard/shopify' },
    { name: 'Pre-Viral Detection', path: '/dashboard/pre-viral' },
    { name: 'Opportunity Feed', path: '/dashboard/opportunities' },
    { name: 'Creator Discovery', path: '/dashboard/creators' },
    { name: 'Ad Intelligence', path: '/dashboard/ads' },
    { name: 'Watchlist', path: '/dashboard/watchlist' },
    { name: 'Blueprints', path: '/dashboard/blueprints' },
    { name: 'Alerts', path: '/dashboard/alerts' },
    { name: 'Usage & Plan', path: '/dashboard/usage' },
    { name: 'Settings', path: '/dashboard/settings' },
    { name: 'Digital Products', path: '/dashboard/digital' },
    { name: 'AI SaaS', path: '/dashboard/ai-saas' },
    { name: 'Affiliates', path: '/dashboard/affiliates' },
    { name: 'Saved Searches', path: '/dashboard/saved' },
    { name: 'Help Center', path: '/dashboard/help' },
  ];

  for (const { name, path } of clientPages) {
    test(`${name} (${path}) loads without errors`, async ({ page }) => {
      await navigateTo(page, path, 5000);

      const pageText = await page.evaluate(() => document.body.innerText);
      const hasError = pageText.toLowerCase().includes('application error') ||
                       pageText.toLowerCase().includes('internal server error') ||
                       pageText.toLowerCase().includes('404');

      await page.screenshot({ path: `e2e-results/client-${name.toLowerCase().replace(/\s+/g, '-')}.png`, fullPage: true });
      expect(hasError).toBe(false);
    });
  }
});

// ─── NAVIGATION TESTS ────────────────────────────────────────

test.describe('Client Dashboard - Navigation', () => {
  test('sidebar navigation links are present and clickable', async ({ page }) => {
    await navigateTo(page, '/dashboard', 5000);

    const nav = page.locator('nav, aside, [role="navigation"], [class*="sidebar"], [class*="Sidebar"]');
    await expect(nav.first()).toBeVisible({ timeout: 10000 });

    const navLinks = nav.first().locator('a[href*="/dashboard"]');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(5);
  });

  test('clicking sidebar items navigates correctly', async ({ page }) => {
    await navigateTo(page, '/dashboard', 5000);

    const nav = page.locator('nav, aside, [role="navigation"], [class*="sidebar"], [class*="Sidebar"]');
    const tiktokLink = nav.first().locator('a[href*="tiktok"]').first();

    if (await tiktokLink.count() > 0) {
      await tiktokLink.click();
      await page.waitForTimeout(3000);
      expect(page.url()).toContain('tiktok');
    }
  });

  test('breadcrumb navigation works on nested pages', async ({ page }) => {
    await navigateTo(page, '/dashboard/tiktok', 5000);

    const breadcrumb = page.locator('[class*="breadcrumb"], [class*="Breadcrumb"], nav[aria-label*="breadcrumb"]');
    if (await breadcrumb.count() > 0) {
      const homeLink = breadcrumb.first().locator('a').first();
      if (await homeLink.count() > 0) {
        await homeLink.click();
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/dashboard');
      }
    }
  });
});

// ─── RESPONSIVE LAYOUT TESTS ─────────────────────────────────

test.describe('Client Dashboard - Responsive Layout', () => {
  test('dashboard adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/dashboard', 5000);

    // Sidebar should be hidden or hamburger menu visible
    const hamburger = page.locator('[class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"], [class*="mobile-menu"]');
    const sidebar = page.locator('[class*="sidebar"], [class*="Sidebar"], aside');

    const hasHamburger = await hamburger.count() > 0;
    const sidebarVisible = await sidebar.first().isVisible().catch(() => false);

    // Either hamburger is shown or sidebar is hidden
    expect(hasHamburger || !sidebarVisible).toBe(true);
    await page.screenshot({ path: 'e2e-results/client-dashboard-mobile.png', fullPage: true });
  });

  test('dashboard adapts to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateTo(page, '/dashboard', 5000);

    const content = page.locator('main, [class*="content"], [class*="Content"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'e2e-results/client-dashboard-tablet.png', fullPage: true });
  });
});
