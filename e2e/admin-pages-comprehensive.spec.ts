import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

test.use({ storageState: 'e2e/.auth/admin.json' });

// ─── HELPER ─────────────────────────────────────────────────────
async function assertPageLoads(page: import('@playwright/test').Page, path: string) {
  await navigateTo(page, `/admin/${path}`, 3000);
  const bodyText = await page.evaluate(() => document.body.innerText);
  expect(bodyText.toLowerCase()).not.toContain('application error');
  expect(bodyText.toLowerCase()).not.toContain('internal server error');
  expect(bodyText.toLowerCase()).not.toContain('this page could not be found');
}

// ─── PLATFORM PAGES ─────────────────────────────────────────────

test.describe('Platform Pages', () => {
  test('admin/ (dashboard home) loads', async ({ page }) => {
    await navigateTo(page, '/admin', 3000);
    const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
    expect(bodyText).not.toContain('application error');
  });

  test('admin/login loads', async ({ page }) => {
    await assertPageLoads(page, 'login');
  });

  test('admin/unauthorized loads', async ({ page }) => {
    await assertPageLoads(page, 'unauthorized');
  });

  test('admin/setup loads', async ({ page }) => {
    await assertPageLoads(page, 'setup');
  });

  test('admin/settings loads', async ({ page }) => {
    await assertPageLoads(page, 'settings');
  });

  test('admin/notifications loads', async ({ page }) => {
    await assertPageLoads(page, 'notifications');
  });

  test('admin/alerts loads', async ({ page }) => {
    await assertPageLoads(page, 'alerts');
  });

  test('admin/monitoring loads', async ({ page }) => {
    await assertPageLoads(page, 'monitoring');
  });

  test('admin/debug loads', async ({ page }) => {
    await assertPageLoads(page, 'debug');
  });

  test('admin/import loads', async ({ page }) => {
    await assertPageLoads(page, 'import');
  });

  test('admin/chatbot loads', async ({ page }) => {
    await assertPageLoads(page, 'chatbot');
  });
});

// ─── DISCOVERY & SOURCING PAGES ─────────────────────────────────

test.describe('Discovery & Sourcing Pages', () => {
  test('admin/products loads', async ({ page }) => {
    await assertPageLoads(page, 'products');
  });

  test('admin/scan loads', async ({ page }) => {
    await assertPageLoads(page, 'scan');
  });

  test('admin/suppliers loads', async ({ page }) => {
    await assertPageLoads(page, 'suppliers');
  });

  test('admin/competitors loads', async ({ page }) => {
    await assertPageLoads(page, 'competitors');
  });

  test('admin/trends loads', async ({ page }) => {
    await assertPageLoads(page, 'trends');
  });

  test('admin/opportunities loads', async ({ page }) => {
    await assertPageLoads(page, 'opportunities');
  });

  test('admin/amazon loads', async ({ page }) => {
    await assertPageLoads(page, 'amazon');
  });

  test('admin/digital loads', async ({ page }) => {
    await assertPageLoads(page, 'digital');
  });

  test('admin/pod loads', async ({ page }) => {
    await assertPageLoads(page, 'pod');
  });

  test('admin/blueprints loads', async ({ page }) => {
    await assertPageLoads(page, 'blueprints');
  });

  test('admin/clusters loads', async ({ page }) => {
    await assertPageLoads(page, 'clusters');
  });
});

// ─── INTELLIGENCE & AI PAGES ────────────────────────────────────

test.describe('Intelligence & AI Pages', () => {
  test('admin/analytics loads', async ({ page }) => {
    await assertPageLoads(page, 'analytics');
  });

  test('admin/pricing loads', async ({ page }) => {
    await assertPageLoads(page, 'pricing');
  });

  test('admin/scoring loads', async ({ page }) => {
    await assertPageLoads(page, 'scoring');
  });

  test('admin/forecasting loads', async ({ page }) => {
    await assertPageLoads(page, 'forecasting');
  });

  test('admin/automation loads', async ({ page }) => {
    await assertPageLoads(page, 'automation');
  });

  test('admin/fraud loads', async ({ page }) => {
    await assertPageLoads(page, 'fraud');
  });

  test('admin/content loads', async ({ page }) => {
    await assertPageLoads(page, 'content');
  });

  test('admin/smart-ux loads', async ({ page }) => {
    await assertPageLoads(page, 'smart-ux');
  });
});

// ─── MANAGEMENT PAGES ───────────────────────────────────────────

test.describe('Management Pages', () => {
  test('admin/clients loads', async ({ page }) => {
    await assertPageLoads(page, 'clients');
  });

  test('admin/ads loads', async ({ page }) => {
    await assertPageLoads(page, 'ads');
  });

  test('admin/affiliates loads', async ({ page }) => {
    await assertPageLoads(page, 'affiliates');
  });

  test('admin/affiliates/ai loads', async ({ page }) => {
    await assertPageLoads(page, 'affiliates/ai');
  });

  test('admin/affiliates/commissions loads', async ({ page }) => {
    await assertPageLoads(page, 'affiliates/commissions');
  });

  test('admin/affiliates/physical loads', async ({ page }) => {
    await assertPageLoads(page, 'affiliates/physical');
  });

  test('admin/influencers loads', async ({ page }) => {
    await assertPageLoads(page, 'influencers');
  });

  test('admin/creator-matches loads', async ({ page }) => {
    await assertPageLoads(page, 'creator-matches');
  });

  test('admin/financial loads', async ({ page }) => {
    await assertPageLoads(page, 'financial');
  });

  test('admin/revenue loads', async ({ page }) => {
    await assertPageLoads(page, 'revenue');
  });

  test('admin/allocate loads', async ({ page }) => {
    await assertPageLoads(page, 'allocate');
  });

  test('admin/shopify loads', async ({ page }) => {
    await assertPageLoads(page, 'shopify');
  });

  test('admin/pinterest loads', async ({ page }) => {
    await assertPageLoads(page, 'pinterest');
  });

  test('admin/tiktok loads', async ({ page }) => {
    await assertPageLoads(page, 'tiktok');
  });
});

// ─── GOVERNOR PAGES ─────────────────────────────────────────────

test.describe('Governor Pages', () => {
  test('admin/governor loads', async ({ page }) => {
    await assertPageLoads(page, 'governor');
  });

  test('admin/governor/budgets loads', async ({ page }) => {
    await assertPageLoads(page, 'governor/budgets');
  });

  test('admin/governor/decisions loads', async ({ page }) => {
    await assertPageLoads(page, 'governor/decisions');
  });

  test('admin/governor/engines loads', async ({ page }) => {
    await assertPageLoads(page, 'governor/engines');
  });

  test('admin/governor/overrides loads', async ({ page }) => {
    await assertPageLoads(page, 'governor/overrides');
  });

  test('admin/governor/swaps loads', async ({ page }) => {
    await assertPageLoads(page, 'governor/swaps');
  });
});

// ─── SETTINGS SUB-PAGES ─────────────────────────────────────────

test.describe('Settings Pages', () => {
  test('admin/settings/users loads', async ({ page }) => {
    await assertPageLoads(page, 'settings/users');
  });

  test('admin/settings/billing loads', async ({ page }) => {
    await assertPageLoads(page, 'settings/billing');
  });

  test('admin/settings/experiments loads', async ({ page }) => {
    await assertPageLoads(page, 'settings/experiments');
  });

  test('admin/settings/fraud loads', async ({ page }) => {
    await assertPageLoads(page, 'settings/fraud');
  });
});

// ─── CUSTOMER PAGES ─────────────────────────────────────────────

test.describe('Customer Pages', () => {
  test('admin/orders loads', async ({ page }) => {
    await assertPageLoads(page, 'orders');
  });

  test('admin/customers/segments loads', async ({ page }) => {
    await assertPageLoads(page, 'customers/segments');
  });

  test('admin/customers/churn loads', async ({ page }) => {
    await assertPageLoads(page, 'customers/churn');
  });

  test('admin/customers/cohorts loads', async ({ page }) => {
    await assertPageLoads(page, 'customers/cohorts');
  });
});

// ─── NEW / INFRASTRUCTURE PAGES ─────────────────────────────────

test.describe('New Pages', () => {
  test('admin/engines/feedback loads', async ({ page }) => {
    await assertPageLoads(page, 'engines/feedback');
  });

  test('admin/pricing/elasticity loads', async ({ page }) => {
    await assertPageLoads(page, 'pricing/elasticity');
  });

  test('admin/ai-costs loads', async ({ page }) => {
    await assertPageLoads(page, 'ai-costs');
  });

  test('admin/health loads', async ({ page }) => {
    await assertPageLoads(page, 'health');
  });

  test('admin/logs loads', async ({ page }) => {
    await assertPageLoads(page, 'logs');
  });

  test('admin/webhooks loads', async ({ page }) => {
    await assertPageLoads(page, 'webhooks');
  });

  test('admin/schedule loads', async ({ page }) => {
    await assertPageLoads(page, 'schedule');
  });

  test('admin/setup/architecture loads', async ({ page }) => {
    await assertPageLoads(page, 'setup/architecture');
  });
});
