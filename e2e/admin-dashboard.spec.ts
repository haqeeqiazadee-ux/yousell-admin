import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

test.describe('Admin Dashboard - Functional Tests', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('dashboard loads without errors', async ({ page }) => {
    await navigateTo(page, '/dashboard', 5000);

    const pageText = await page.evaluate(() => document.body.innerText);
    const hasError = pageText.toLowerCase().includes('application error') ||
                     pageText.toLowerCase().includes('internal server error');

    await page.screenshot({ path: 'e2e-results/admin-dashboard-loaded.png', fullPage: true });
    expect(hasError).toBe(false);
  });

  test('products page displays content', async ({ page }) => {
    await navigateTo(page, '/admin/products', 5000);

    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasContent = pageText.includes('product') || pageText.includes('no ') ||
                       pageText.includes('empty') || pageText.includes('add') ||
                       pageText.includes('discover') || pageText.includes('scan');

    await page.screenshot({ path: 'e2e-results/admin-products-loaded.png', fullPage: true });
    expect(hasContent).toBe(true);
  });

  test('settings page loads correctly', async ({ page }) => {
    await navigateTo(page, '/admin/settings', 5000);

    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasSettingsContent = pageText.includes('setting') || pageText.includes('config') ||
                               pageText.includes('profile') || pageText.includes('account') ||
                               pageText.includes('preference');

    await page.screenshot({ path: 'e2e-results/admin-settings-loaded.png', fullPage: true });
    expect(hasSettingsContent).toBe(true);
  });

  test('navigation sidebar is present', async ({ page }) => {
    await navigateTo(page, '/dashboard', 5000);

    const nav = page.locator('nav, aside, [role="navigation"], .sidebar, [class*="sidebar"], [class*="nav"]');
    const hasNav = await nav.count() > 0;

    await page.screenshot({ path: 'e2e-results/admin-navigation.png', fullPage: true });
    expect(hasNav).toBe(true);
  });

  test('client management page loads', async ({ page }) => {
    await navigateTo(page, '/admin/clients', 5000);

    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasError = pageText.includes('application error') || pageText.includes('internal server error');

    await page.screenshot({ path: 'e2e-results/admin-clients-loaded.png', fullPage: true });
    expect(hasError).toBe(false);
  });

  test('analytics page loads without errors', async ({ page }) => {
    await navigateTo(page, '/admin/analytics', 5000);

    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasError = pageText.includes('application error') || pageText.includes('internal server error');

    await page.screenshot({ path: 'e2e-results/admin-analytics-loaded.png', fullPage: true });
    expect(hasError).toBe(false);
  });
});

// ─── PAGE LOAD PERFORMANCE ──────────────────────────────────

test.describe('Page Load Performance', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  const criticalPages = [
    { name: 'login', path: '/login' },
    { name: 'dashboard', path: '/dashboard' },
    { name: 'products', path: '/admin/products' },
    { name: 'analytics', path: '/admin/analytics' },
  ];

  for (const { name, path } of criticalPages) {
    test(`${name} page loads within 15 seconds`, async ({ page }) => {
      const start = Date.now();
      await page.goto(path, { waitUntil: 'commit', timeout: 60000 });
      const loadTime = Date.now() - start;

      console.log(`${name} page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(15000);
    });
  }
});
