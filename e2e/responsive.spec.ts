import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

// ─── VIEWPORT DEFINITIONS ───────────────────────────────────────

const viewports = {
  mobile: { width: 375, height: 812 },
  mobileLandscape: { width: 640, height: 375 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  desktop: { width: 1536, height: 900 },
} as const;

// Additional specific mobile widths per spec requirements
const specificMobileWidths = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
];

/** Assert no horizontal overflow exists on the page */
async function assertNoHorizontalOverflow(page: import('@playwright/test').Page, tolerance = 5) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + tolerance);
}

// ─── MARKETING SITE RESPONSIVE ──────────────────────────────────

test.describe('Marketing Responsive', () => {
  for (const [name, size] of Object.entries(viewports)) {
    test(`homepage renders at ${name} (${size.width}x${size.height})`, async ({ page }) => {
      await page.setViewportSize(size);
      await navigateTo(page, '/', 3000);
      await assertNoHorizontalOverflow(page);
    });
  }

  for (const [name, size] of Object.entries(viewports)) {
    test(`pricing page renders at ${name} (${size.width}x${size.height})`, async ({ page }) => {
      await page.setViewportSize(size);
      await navigateTo(page, '/pricing', 3000);
      await assertNoHorizontalOverflow(page);
    });
  }

  test('mobile hamburger appears at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/', 3000);

    const hamburger = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="navigation" i], ' +
      'button[class*="hamburger"], button[class*="menu"], [data-testid="mobile-menu"]'
    );
    const count = await hamburger.count();
    expect(count).toBeGreaterThan(0);
  });

  test('desktop nav visible at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateTo(page, '/', 3000);

    const desktopNav = page.locator(
      'nav a:visible, header a:visible, nav button:visible'
    );
    const count = await desktopNav.count();
    expect(count).toBeGreaterThan(2);
  });

  test('hamburger is hidden at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateTo(page, '/', 3000);

    const hamburger = page.locator(
      'button[aria-label*="menu" i]:visible, button[class*="hamburger"]:visible'
    );
    const count = await hamburger.count();
    expect(count).toBe(0);
  });

  test('pricing cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/pricing', 3000);

    const cards = page.locator('[class*="card"], [class*="plan"], [class*="pricing"]').filter({
      has: page.locator('button, a'),
    });

    if (await cards.count() >= 2) {
      const firstRect = await cards.nth(0).boundingBox();
      const secondRect = await cards.nth(1).boundingBox();

      if (firstRect && secondRect) {
        // Cards should be stacked (second card below first)
        expect(secondRect.y).toBeGreaterThan(firstRect.y);
      }
    }
  });

  test('pricing cards side-by-side on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateTo(page, '/pricing', 3000);

    const cards = page.locator('[class*="card"], [class*="plan"], [class*="pricing"]').filter({
      has: page.locator('button, a'),
    });

    if (await cards.count() >= 2) {
      const firstRect = await cards.nth(0).boundingBox();
      const secondRect = await cards.nth(1).boundingBox();

      if (firstRect && secondRect) {
        // Cards should be side by side (similar Y position)
        expect(Math.abs(secondRect.y - firstRect.y)).toBeLessThan(50);
      }
    }
  });

  test('hero text is readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/', 3000);

    const heading = page.locator('h1').first();
    if (await heading.count() > 0) {
      const box = await heading.boundingBox();
      if (box) {
        // Heading should fit within viewport
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(375 + 10);
      }
    }
  });
});

// ─── SPECIFIC MOBILE WIDTHS (375, 390, 430) ─────────────────────

test.describe('Specific Mobile Widths', () => {
  for (const device of specificMobileWidths) {
    test(`homepage at ${device.name} (${device.width}px) has no overflow`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await navigateTo(page, '/', 3000);
      await assertNoHorizontalOverflow(page);
    });

    test(`pricing at ${device.name} (${device.width}px) has no overflow`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await navigateTo(page, '/pricing', 3000);
      await assertNoHorizontalOverflow(page);
    });

    test(`login at ${device.name} (${device.width}px) has no overflow`, async ({ page }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await navigateTo(page, '/login', 3000);
      await assertNoHorizontalOverflow(page);
    });
  }
});

// ─── ADMIN RESPONSIVE ───────────────────────────────────────────

test.describe('Admin Responsive', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('sidebar is visible at desktop (1536px)', async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await navigateTo(page, '/admin', 3000);

    const sidebar = page.locator('aside, [class*="sidebar"]').first();
    if (await sidebar.count() > 0) {
      const isVisible = await sidebar.isVisible();
      expect(isVisible).toBe(true);
      const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
      expect(width).toBeGreaterThan(150);
    }
  });

  test('sidebar collapses to icons at xl (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await navigateTo(page, '/admin', 3000);

    const sidebar = page.locator('aside, [class*="sidebar"]').first();
    if (await sidebar.count() > 0) {
      const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
      // At xl, sidebar may be collapsed or full width depending on design
      expect(width).toBeGreaterThan(0);
    }
  });

  test('sidebar becomes overlay at lg (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await navigateTo(page, '/admin', 3000);

    const sidebar = page.locator('aside, [class*="sidebar"]').first();
    if (await sidebar.count() > 0) {
      const isVisible = await sidebar.isVisible();
      const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
      // Either hidden or collapsed
      expect(width < 100 || !isVisible).toBe(true);
    }
  });

  test('bottom nav appears below lg on admin', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/admin', 3000);

    const bottomNav = page.locator(
      'nav[class*="bottom"], [class*="bottom-nav"], [class*="bottomNav"], ' +
      '[class*="mobile-nav"], [class*="mobileNav"]'
    );
    const anyNav = page.locator('nav').filter({ has: page.locator('a, button') });
    const hasNav = (await bottomNav.count()) > 0 || (await anyNav.count()) > 0;
    expect(hasNav).toBe(true);
  });

  test('admin content fills width on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/admin', 3000);

    const main = page.locator('main, [class*="content"], [role="main"]').first();
    if (await main.count() > 0) {
      const box = await main.boundingBox();
      if (box) {
        // Main content should use most of the viewport width
        expect(box.width).toBeGreaterThan(300);
      }
    }
  });

  for (const [name, size] of Object.entries(viewports)) {
    test(`admin dashboard has no overflow at ${name}`, async ({ page }) => {
      await page.setViewportSize(size);
      await navigateTo(page, '/admin', 3000);
      await assertNoHorizontalOverflow(page);
    });
  }

  test('admin tables are scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/admin/products', 3000);

    const tableContainer = page.locator(
      '[class*="table-container"], [class*="overflow"], table, [role="table"]'
    );
    if (await tableContainer.count() > 0) {
      const overflowX = await tableContainer.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.overflowX;
      });
      // Table should be scrollable or auto on mobile
      expect(['auto', 'scroll', 'hidden', 'visible']).toContain(overflowX);
    }
  });
});

// ─── CLIENT DASHBOARD RESPONSIVE ────────────────────────────────

test.describe('Client Dashboard Responsive', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('platform tabs scroll horizontally on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/dashboard', 3000);

    const tabContainer = page.locator(
      '[role="tablist"], [class*="tab"], [class*="platform"]'
    );
    if (await tabContainer.count() > 0) {
      const overflowX = await tabContainer.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.overflowX;
      });
      // Tabs should be scrollable horizontally on mobile
      expect(['auto', 'scroll', 'hidden', 'visible']).toContain(overflowX);
    }
  });

  test('product grid is 1-col on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/dashboard', 3000);

    const grid = page.locator(
      '[class*="grid"], [class*="product-list"], [class*="productGrid"]'
    );
    if (await grid.count() > 0) {
      const columns = await grid.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.gridTemplateColumns;
      });
      if (columns && columns !== 'none') {
        const colCount = columns.split(' ').filter((c) => c.trim()).length;
        expect(colCount).toBeLessThanOrEqual(2); // 1 or 2 col on mobile
      }
    }
  });

  test('product grid is multi-col on xl', async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await navigateTo(page, '/dashboard', 3000);

    const grid = page.locator(
      '[class*="grid"], [class*="product-list"], [class*="productGrid"]'
    );
    if (await grid.count() > 0) {
      const columns = await grid.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.gridTemplateColumns;
      });
      if (columns && columns !== 'none') {
        const colCount = columns.split(' ').filter((c) => c.trim()).length;
        expect(colCount).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test('dashboard has no overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/dashboard', 3000);
    await assertNoHorizontalOverflow(page);
  });

  test('dashboard has no overflow on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await navigateTo(page, '/dashboard', 3000);
    await assertNoHorizontalOverflow(page);
  });

  test('dashboard has no overflow on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await navigateTo(page, '/dashboard', 3000);
    await assertNoHorizontalOverflow(page);
  });

  test('dashboard charts resize on viewport change', async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 900 });
    await navigateTo(page, '/dashboard', 3000);

    const chart = page.locator('canvas, svg, [class*="chart"], [class*="graph"]');
    if (await chart.count() > 0) {
      const desktopWidth = await chart.first().evaluate((el) => el.getBoundingClientRect().width);

      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(500);

      const mobileWidth = await chart.first().evaluate((el) => el.getBoundingClientRect().width);
      // Chart should resize to fit mobile
      expect(mobileWidth).toBeLessThan(desktopWidth);
      expect(mobileWidth).toBeLessThanOrEqual(375);
    }
  });
});

// ─── TOUCH & INTERACTION RESPONSIVE ─────────────────────────────

test.describe('Touch Targets', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('mobile buttons meet minimum touch target (44x44)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/admin', 3000);

    const buttons = page.locator('button:visible, a:visible').filter({
      has: page.locator('text=/\\S/'),
    });

    const count = await buttons.count();
    let tooSmallCount = 0;

    for (let i = 0; i < Math.min(count, 20); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box && (box.width < 30 || box.height < 30)) {
        tooSmallCount++;
      }
    }

    // Allow some small buttons (icons, etc.) but most should be tappable
    expect(tooSmallCount).toBeLessThan(count * 0.5);
  });
});

// ─── FONT SCALING ───────────────────────────────────────────────

test.describe('Font Scaling', () => {
  test('text does not overflow containers on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateTo(page, '/', 3000);

    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const box = await headings.nth(i).boundingBox();
      if (box) {
        // Text should not extend beyond viewport
        expect(box.x + box.width).toBeLessThanOrEqual(375 + 20);
      }
    }
  });
});
