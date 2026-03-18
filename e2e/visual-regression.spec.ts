import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

// ─── PUBLIC PAGES ───────────────────────────────────────────

test.describe('Public Pages - Visual Regression', () => {
  const publicPages = [
    { name: 'login', path: '/login' },
    { name: 'signup', path: '/signup' },
    { name: 'pricing', path: '/pricing' },
    { name: 'forgot-password', path: '/forgot-password' },
    { name: 'privacy', path: '/privacy' },
    { name: 'terms', path: '/terms' },
  ];

  for (const { name, path } of publicPages) {
    test(`${name} page renders correctly`, async ({ page }) => {
      await navigateTo(page, path);
      await expect(page).toHaveScreenshot(`${name}-page.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      });
    });
  }
});

// ─── ADMIN PAGES (AUTHENTICATED) ───────────────────────────

test.describe('Admin Pages - Visual Regression', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  const adminPages = [
    'dashboard', 'admin/products', 'admin/trends', 'admin/analytics',
    'admin/clients', 'admin/settings', 'admin/tiktok', 'admin/shopify',
    'admin/blueprints', 'admin/clusters', 'admin/competitors',
    'admin/influencers', 'admin/suppliers', 'admin/automation',
    'admin/notifications', 'admin/pod', 'admin/ads', 'admin/scan',
  ];

  for (const pagePath of adminPages) {
    const name = pagePath.replace('/', '-');
    test(`${name} page renders correctly`, async ({ page }) => {
      await navigateTo(page, `/${pagePath}`, 4000);
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.1,
      });
    });
  }
});

// ─── CLIENT DASHBOARD PAGES ─────────────────────────────────

test.describe('Client Dashboard - Visual Regression', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  const dashboardPages = [
    'dashboard/products', 'dashboard/content', 'dashboard/orders',
    'dashboard/billing', 'dashboard/integrations', 'dashboard/requests',
  ];

  for (const pagePath of dashboardPages) {
    const name = pagePath.replace('/', '-');
    test(`${name} page renders correctly`, async ({ page }) => {
      await navigateTo(page, `/${pagePath}`, 4000);
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.1,
      });
    });
  }
});

// ─── RESPONSIVE LAYOUT CHECKS ────────────────────────────────

test.describe('Responsive - No Horizontal Overflow', () => {
  const pagesToCheck = ['/login', '/signup', '/pricing'];

  for (const path of pagesToCheck) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await navigateTo(page, path);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }
});

// ─── ACCESSIBILITY CHECKS ────────────────────────────────────

test.describe('Accessibility - Basic Checks', () => {
  const publicPages = ['/login', '/signup', '/pricing', '/privacy', '/terms'];

  for (const path of publicPages) {
    test(`${path} has no critical accessibility issues`, async ({ page }) => {
      await navigateTo(page, path);

      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      expect(imagesWithoutAlt).toBe(0);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });
  }
});
