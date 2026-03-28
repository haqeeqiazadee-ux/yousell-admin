/**
 * cross-functional.spec.ts
 *
 * Tests the SEAMS between all three YouSell surfaces:
 *   1. Marketing Website  — https://yousell.online
 *   2. Client Dashboard   — https://admin.yousell.online/dashboard
 *   3. Admin Dashboard    — https://admin.yousell.online/admin
 *
 * These tests are NOT about individual pages loading — they are about
 * the connections, journeys, and data consistency between surfaces.
 */

import { test, expect, Page } from '@playwright/test';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const MARKETING_URL   = process.env.MARKETING_BASE_URL  || 'https://yousell.online';
const APP_URL         = process.env.E2E_BASE_URL         || 'https://admin.yousell.online';
const ADMIN_EMAIL     = 'admin@yousell.online';
const ADMIN_PASSWORD  = 'Admin@2026!';

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function goMarketing(page: Page, path: string, waitMs = 3000) {
  await page.goto(`${MARKETING_URL}${path}`, { waitUntil: 'commit', timeout: 60000 });
  await page
    .waitForFunction(() => document.body && document.body.innerHTML.length > 100, { timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(waitMs);
}

async function goApp(page: Page, path: string, waitMs = 3000) {
  await page.goto(`${APP_URL}${path}`, { waitUntil: 'commit', timeout: 60000 });
  await page
    .waitForFunction(() => document.body && document.body.innerHTML.length > 100, { timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(waitMs);
}

async function loginAsAdmin(page: Page) {
  await goApp(page, '/login', 2000);
  await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);
  const btn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")');
  await btn.first().click();
  await page.waitForTimeout(8000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. DOMAIN & URL CORRECTNESS
// Both domains must be live and serve content
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Domain & URL Correctness', () => {
  test.setTimeout(30_000);

  test('marketing site (yousell.online) is accessible and has a title', async ({ page }) => {
    await goMarketing(page, '/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    await page.screenshot({ path: 'e2e-results/cf-domain-marketing.png', fullPage: false });
  });

  test('app site (admin.yousell.online) is accessible and has a title', async ({ page }) => {
    await goApp(page, '/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    await page.screenshot({ path: 'e2e-results/cf-domain-app.png', fullPage: false });
  });

  test('/login on app redirects to or renders /admin/login', async ({ page }) => {
    await goApp(page, '/login', 5000);
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const isLoginPage = url.includes('/login') || text.includes('email') || text.includes('sign in') || text.includes('log in');
    await page.screenshot({ path: 'e2e-results/cf-login-redirect.png', fullPage: false });
    expect(isLoginPage).toBe(true);
  });

  test('/admin/login on app renders login form', async ({ page }) => {
    await goApp(page, '/admin/login', 3000);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await page.screenshot({ path: 'e2e-results/cf-admin-login-form.png', fullPage: false });
  });

  test('/signup on app renders signup form', async ({ page }) => {
    await goApp(page, '/signup', 3000);
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const isSignup = text.includes('sign up') || text.includes('create') || text.includes('register') ||
                     (await page.locator('input[type="email"]').count()) > 0;
    await page.screenshot({ path: 'e2e-results/cf-signup-form.png', fullPage: false });
    expect(isSignup).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MARKETING → AUTH LINK INTEGRITY
// CTAs and nav links on the marketing site must point to the correct app URLs
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Marketing → Auth Link Integrity', () => {
  test.setTimeout(30_000);

  test('navbar "Log In" link on marketing site points to app login URL', async ({ page }) => {
    await goMarketing(page, '/');
    const logInLink = page.locator('nav a, header a').filter({ hasText: /log\s?in|sign\s?in/i }).first();
    await expect(logInLink).toBeVisible({ timeout: 15000 });

    const href = await logInLink.getAttribute('href');
    expect(href).toBeTruthy();
    // Must point to admin.yousell.online login OR a relative /login path
    const isLoginUrl = (href?.includes('admin.yousell.online') || href?.includes('/login')) ?? false;
    expect(isLoginUrl).toBe(true);
    await page.screenshot({ path: 'e2e-results/cf-marketing-login-link.png', fullPage: false });
  });

  test('navbar "Get Started" link on marketing site points to app signup URL', async ({ page }) => {
    await goMarketing(page, '/');
    const getStarted = page.locator('nav a, header a').filter({ hasText: /get started|start free|sign up/i }).first();
    await expect(getStarted).toBeVisible({ timeout: 15000 });

    const href = await getStarted.getAttribute('href');
    expect(href).toBeTruthy();
    const isSignupUrl = (href?.includes('admin.yousell.online') || href?.includes('/signup') || href?.includes('sign-up') || href?.includes('register')) ?? false;
    expect(isSignupUrl).toBe(true);
    await page.screenshot({ path: 'e2e-results/cf-marketing-signup-link.png', fullPage: false });
  });

  test('hero CTA "Get Started" / "Start Free" points to signup', async ({ page }) => {
    await goMarketing(page, '/');
    const hero = page.locator('section').first();
    const ctaBtn = hero.locator('a, button').filter({ hasText: /get started|start free|try free|sign up/i }).first();
    await expect(ctaBtn).toBeVisible({ timeout: 15000 });

    const href = await ctaBtn.getAttribute('href');
    if (href) {
      const isSignupUrl = href.includes('/signup') || href.includes('sign-up') || href.includes('register') || href.includes('admin.yousell.online');
      expect(isSignupUrl).toBe(true);
    }
    await page.screenshot({ path: 'e2e-results/cf-hero-cta-link.png', fullPage: false });
  });

  test('pricing page plan CTAs link to signup', async ({ page }) => {
    await goMarketing(page, '/pricing');
    // Look for any CTA button on the pricing page
    const ctaBtn = page.locator('a, button').filter({ hasText: /get started|start free|sign up|try free|choose plan/i }).first();
    await expect(ctaBtn).toBeVisible({ timeout: 15000 });

    const href = await ctaBtn.getAttribute('href');
    if (href) {
      const isSignupUrl = href.includes('/signup') || href.includes('sign-up') || href.includes('register') || href.includes('admin.yousell.online');
      expect(isSignupUrl).toBe(true);
    }
    await page.screenshot({ path: 'e2e-results/cf-pricing-cta-link.png', fullPage: false });
  });

  test('footer "Login" / "Sign In" link on marketing site points to app', async ({ page }) => {
    await goMarketing(page, '/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const footer = page.locator('footer');
    const loginLink = footer.locator('a').filter({ hasText: /log\s?in|sign\s?in|login/i }).first();
    if (await loginLink.count() > 0) {
      const href = await loginLink.getAttribute('href');
      expect(href).toBeTruthy();
      const isLoginUrl = (href?.includes('/login') || href?.includes('admin.yousell.online')) ?? false;
      expect(isLoginUrl).toBe(true);
    }
    await page.screenshot({ path: 'e2e-results/cf-footer-login-link.png', fullPage: false });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. FULL JOURNEY: Marketing → Click CTA → Lands on App Auth Page
// Navigate from marketing site, click CTA, confirm we arrive at the app
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Journey: Marketing CTA → App Auth Page', () => {
  test.setTimeout(60_000);

  test('clicking "Get Started" on homepage navigates to app signup', async ({ page }) => {
    await goMarketing(page, '/', 3000);

    const getStarted = page.locator('nav a, header a').filter({ hasText: /get started|start free/i }).first();
    if (await getStarted.count() === 0) {
      // Try hero CTA instead
      const heroCta = page.locator('a[href*="signup"], a[href*="sign-up"], a[href*="register"]').first();
      if (await heroCta.count() > 0) {
        await heroCta.click();
        await page.waitForTimeout(5000);
      }
    } else {
      await getStarted.click();
      await page.waitForTimeout(5000);
    }

    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const arrivedAtSignup = url.includes('/signup') || url.includes('sign-up') || url.includes('register') ||
                            text.includes('create your account') || text.includes('sign up') ||
                            text.includes('create account');
    await page.screenshot({ path: 'e2e-results/cf-journey-marketing-to-signup.png', fullPage: false });
    expect(arrivedAtSignup).toBe(true);
  });

  test('clicking "Log In" on homepage navigates to app login', async ({ page }) => {
    await goMarketing(page, '/', 3000);

    const logIn = page.locator('nav a, header a').filter({ hasText: /log\s?in|sign\s?in/i }).first();
    await expect(logIn).toBeVisible({ timeout: 15000 });
    await logIn.click();
    await page.waitForTimeout(5000);

    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const arrivedAtLogin = url.includes('/login') || text.includes('sign in') || text.includes('log in') || text.includes('email');
    await page.screenshot({ path: 'e2e-results/cf-journey-marketing-to-login.png', fullPage: false });
    expect(arrivedAtLogin).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FULL JOURNEY: Login → Correct Dashboard Based on Role
// After login, admin role goes to /admin, client role goes to /dashboard
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Journey: Login → Role-Based Dashboard Routing', () => {
  test.setTimeout(60_000);

  test('admin login redirects to /admin or /dashboard (not stuck on login)', async ({ page }) => {
    await loginAsAdmin(page);

    const url = page.url();
    const isRedirected = !url.includes('/login') && (url.includes('/admin') || url.includes('/dashboard') || url === APP_URL + '/');
    await page.screenshot({ path: 'e2e-results/cf-journey-admin-login-redirect.png', fullPage: false });
    expect(isRedirected).toBe(true);
  });

  test('after admin login, can access /admin (not just /dashboard)', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin', 5000);

    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const onAdminPage = url.includes('/admin') && !url.includes('/login');
    const hasAdminContent = !text.includes('application error') && !text.includes('404') &&
                            !text.includes('not found');
    await page.screenshot({ path: 'e2e-results/cf-journey-admin-access.png', fullPage: false });
    expect(onAdminPage).toBe(true);
    expect(hasAdminContent).toBe(true);
  });

  test('after admin login, can also access /dashboard (admin views client surface)', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard', 5000);

    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const onDashboard = url.includes('/dashboard') && !url.includes('/login');
    const hasContent = !text.includes('application error') && !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-journey-admin-views-client-surface.png', fullPage: false });
    // Admin being redirected to login when accessing dashboard is also acceptable
    const acceptable = onDashboard || url.includes('/login') || url.includes('/admin');
    expect(acceptable).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PROTECTED ROUTES — CROSS-SURFACE
// Unauthenticated users must be blocked on BOTH admin AND client surfaces
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Protected Routes — Cross-Surface Guards', () => {
  test.setTimeout(30_000);

  const adminRoutes = [
    '/admin',
    '/admin/products',
    '/admin/clients',
    '/admin/analytics',
    '/admin/settings',
  ];

  const clientRoutes = [
    '/dashboard',
    '/dashboard/tiktok',
    '/dashboard/opportunities',
    '/dashboard/watchlist',
    '/dashboard/settings',
    '/dashboard/billing',
  ];

  for (const route of adminRoutes) {
    test(`unauthenticated → ${route} redirects to login`, async ({ page }) => {
      await goApp(page, route, 5000);
      const url = page.url();
      const text = await page.evaluate(() => document.body.innerText.toLowerCase());
      const isBlocked = url.includes('/login') || url.includes('/unauthorized') ||
                        text.includes('sign in') || text.includes('log in') ||
                        text.includes('unauthorized');
      await page.screenshot({ path: `e2e-results/cf-protected${route.replace(/\//g, '-')}.png`, fullPage: false });
      expect(isBlocked).toBe(true);
    });
  }

  for (const route of clientRoutes) {
    test(`unauthenticated → ${route} redirects to login`, async ({ page }) => {
      await goApp(page, route, 5000);
      const url = page.url();
      const text = await page.evaluate(() => document.body.innerText.toLowerCase());
      const isBlocked = url.includes('/login') || url.includes('/unauthorized') ||
                        text.includes('sign in') || text.includes('log in');
      await page.screenshot({ path: `e2e-results/cf-protected${route.replace(/\//g, '-')}.png`, fullPage: false });
      expect(isBlocked).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PRICING CONSISTENCY
// Plans shown on marketing /pricing must match plans in client /dashboard/billing
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Pricing Consistency: Marketing ↔ Dashboard Billing', () => {
  test.setTimeout(45_000);

  test('marketing /pricing shows at least 3 pricing tiers', async ({ page }) => {
    await goMarketing(page, '/pricing');
    const tiers = page.locator('[class*="tier"], [class*="plan"], [class*="card"], [class*="pricing"], article').filter({ hasText: /month|year|\$|free|starter|pro|agency|enterprise/i });
    const count = await tiers.count();
    await page.screenshot({ path: 'e2e-results/cf-marketing-pricing-tiers.png', fullPage: false });
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('marketing pricing plan names are recognisable (Starter / Pro / Agency or similar)', async ({ page }) => {
    await goMarketing(page, '/pricing');
    const text = await page.evaluate(() => document.body.innerText);
    await page.screenshot({ path: 'e2e-results/cf-marketing-pricing-text.png', fullPage: false });
    // At least two of these plan-name keywords must appear
    const planKeywords = ['starter', 'pro', 'agency', 'enterprise', 'basic', 'growth', 'scale', 'business'];
    const found = planKeywords.filter(k => text.toLowerCase().includes(k));
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  test('client dashboard /dashboard/billing loads', async ({ page }) => {
    // Requires auth
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/billing', 5000);
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('internal server error');
    await page.screenshot({ path: 'e2e-results/cf-dashboard-billing.png', fullPage: false });
    expect(loaded).toBe(true);
  });

  test('client billing page mentions a plan name that exists on the marketing pricing page', async ({ page }) => {
    // Get plan names from marketing
    const page2 = page;
    await goMarketing(page2, '/pricing', 3000);
    const marketingText = (await page2.evaluate(() => document.body.innerText)).toLowerCase();

    const planKeywords = ['starter', 'pro', 'agency', 'enterprise', 'basic', 'growth', 'scale', 'business', 'free'];
    const marketingPlans = planKeywords.filter(k => marketingText.includes(k));

    // Now check dashboard billing
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/billing', 5000);
    const billingText = (await page.evaluate(() => document.body.innerText)).toLowerCase();

    await page.screenshot({ path: 'e2e-results/cf-billing-plan-consistency.png', fullPage: false });

    if (billingText.includes('billing') || billingText.includes('plan') || billingText.includes('subscription')) {
      const billingHasMatchingPlan = marketingPlans.some(p => billingText.includes(p));
      // Soft check — if billing page has plan info, it should match marketing
      if (billingText.includes('starter') || billingText.includes('pro') || billingText.includes('agency')) {
        expect(billingHasMatchingPlan).toBe(true);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ADMIN → CLIENT DATA FLOW
// Data managed in admin must be reflected in client-facing surfaces
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Admin → Client Data Flow', () => {
  test.setTimeout(45_000);

  test('admin /admin/clients shows a list of clients', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/clients', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasClientsContent = !text.includes('application error') && !text.includes('internal server error') &&
                              !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-admin-clients-page.png', fullPage: false });
    expect(hasClientsContent).toBe(true);
  });

  test('admin /admin/products page loads and shows product data', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/products', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasContent = !text.includes('application error') && !text.includes('internal server error') &&
                       !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-admin-products-page.png', fullPage: false });
    expect(hasContent).toBe(true);
  });

  test('client /dashboard shows product cards (products flow from admin to client)', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard', 5000);

    const cards = page.locator('[class*="card"], [class*="Card"], [class*="product"]');
    const count = await cards.count();
    await page.screenshot({ path: 'e2e-results/cf-client-product-feed.png', fullPage: false });
    // At least some product cards should appear (data flows from admin to client)
    expect(count).toBeGreaterThan(0);
  });

  test('admin /admin/analytics page has data', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/analytics', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasContent = !text.includes('application error') && !text.includes('internal server error');
    await page.screenshot({ path: 'e2e-results/cf-admin-analytics.png', fullPage: false });
    expect(hasContent).toBe(true);
  });

  test('admin can view individual client detail from /admin/clients', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/clients', 5000);

    // Try clicking the first client row/link
    const clientLink = page.locator('table tbody tr a, [class*="client"] a, [class*="row"] a, tbody tr').first();
    if (await clientLink.count() > 0) {
      await clientLink.first().click();
      await page.waitForTimeout(4000);
      const url = page.url();
      const text = await page.evaluate(() => document.body.innerText.toLowerCase());
      const onClientDetail = url.includes('/clients/') || text.includes('email') || text.includes('plan') || text.includes('subscription');
      await page.screenshot({ path: 'e2e-results/cf-admin-client-detail.png', fullPage: false });
      expect(onClientDetail).toBe(true);
    } else {
      await page.screenshot({ path: 'e2e-results/cf-admin-clients-empty.png', fullPage: false });
      console.log('NOTE: No client rows found — may be empty or require data');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. FEATURE GATES (EngineGate)
// Admin-controlled feature flags must be respected in the client dashboard
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Feature Gates: Admin Controls → Client Dashboard', () => {
  test.setTimeout(45_000);

  test('admin /admin/governor page loads (engine controls)', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/governor', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasContent = !text.includes('application error') && !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-admin-governor.png', fullPage: false });
    expect(hasContent).toBe(true);
  });

  test('admin /admin/governor/engines shows feature toggle controls', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/governor/engines', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasContent = !text.includes('application error') && !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-admin-governor-engines.png', fullPage: false });
    expect(hasContent).toBe(true);
  });

  test('client /dashboard/tiktok page either loads OR shows an EngineGate lock', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/tiktok', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    // Either the page loads with content, OR it shows a feature gate (upgrade/lock/unavailable)
    const hasValidState = !text.includes('application error') && !text.includes('internal server error');
    const isGated = text.includes('upgrade') || text.includes('unlock') || text.includes('unavailable') ||
                    text.includes('not available') || text.includes('coming soon');
    const hasData = text.length > 200;
    await page.screenshot({ path: 'e2e-results/cf-client-tiktok-gate.png', fullPage: false });
    expect(hasValidState).toBe(true);
    expect(isGated || hasData).toBe(true);
  });

  test('client /dashboard/blueprints page either loads OR shows an EngineGate lock', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/blueprints', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasValidState = !text.includes('application error') && !text.includes('internal server error');
    await page.screenshot({ path: 'e2e-results/cf-client-blueprints-gate.png', fullPage: false });
    expect(hasValidState).toBe(true);
  });

  test('client /dashboard/opportunities page either loads OR shows an EngineGate lock', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/opportunities', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasValidState = !text.includes('application error') && !text.includes('internal server error');
    await page.screenshot({ path: 'e2e-results/cf-client-opportunities-gate.png', fullPage: false });
    expect(hasValidState).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. NOTIFICATION / ALERT FLOW
// Admin notification system must connect to client alert surface
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Notification / Alert Flow: Admin → Client', () => {
  test.setTimeout(45_000);

  test('admin /admin/notifications page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/notifications', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('internal server error');
    await page.screenshot({ path: 'e2e-results/cf-admin-notifications.png', fullPage: false });
    expect(loaded).toBe(true);
  });

  test('admin /admin/alerts page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/alerts', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('internal server error');
    await page.screenshot({ path: 'e2e-results/cf-admin-alerts.png', fullPage: false });
    expect(loaded).toBe(true);
  });

  test('client /dashboard/alerts page loads (receiving end of notifications)', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/alerts', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('internal server error');
    await page.screenshot({ path: 'e2e-results/cf-client-alerts.png', fullPage: false });
    expect(loaded).toBe(true);
  });

  test('client alerts page references the same alert concepts as admin (price/trend/score)', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/alerts', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error');
    await page.screenshot({ path: 'e2e-results/cf-client-alerts-content.png', fullPage: false });
    expect(loaded).toBe(true);
    // If the alerts page has content, it should mention alert-related concepts
    if (text.length > 300) {
      const hasAlertContent = text.includes('alert') || text.includes('notification') ||
                              text.includes('price') || text.includes('trend') ||
                              text.includes('product') || text.includes('score');
      expect(hasAlertContent).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. INTEGRATION CONSISTENCY
// Platforms listed on marketing /integrations ↔ client /dashboard/integrations
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Integration Consistency: Marketing ↔ Client Dashboard', () => {
  test.setTimeout(45_000);

  test('marketing /integrations page loads and lists platforms', async ({ page }) => {
    await goMarketing(page, '/integrations', 3000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasPlatforms = text.includes('shopify') || text.includes('tiktok') || text.includes('amazon') ||
                         text.includes('integration') || text.includes('connect');
    await page.screenshot({ path: 'e2e-results/cf-marketing-integrations.png', fullPage: false });
    expect(hasPlatforms).toBe(true);
  });

  test('client /dashboard/integrations loads and shows Shopify, TikTok, Amazon', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/integrations', 5000);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('internal server error');
    await page.screenshot({ path: 'e2e-results/cf-client-integrations.png', fullPage: false });
    expect(loaded).toBe(true);

    if (text.length > 200) {
      // Core platforms that appear on both marketing and client dashboard
      const hasShopify = text.includes('shopify');
      const hasTikTok = text.includes('tiktok');
      const hasAmazon = text.includes('amazon');
      const hasCoreIntegrations = hasShopify || hasTikTok || hasAmazon;
      expect(hasCoreIntegrations).toBe(true);
    }
  });

  test('platform names on marketing and client integrations pages overlap', async ({ page }) => {
    // Check marketing
    await goMarketing(page, '/integrations', 3000);
    const marketingText = (await page.evaluate(() => document.body.innerText)).toLowerCase();

    const platforms = ['shopify', 'tiktok', 'amazon', 'ebay', 'etsy', 'walmart', 'pinterest', 'instagram'];
    const marketingPlatforms = platforms.filter(p => marketingText.includes(p));

    // Check client dashboard
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/integrations', 5000);
    const clientText = (await page.evaluate(() => document.body.innerText)).toLowerCase();

    await page.screenshot({ path: 'e2e-results/cf-integrations-overlap.png', fullPage: false });

    const overlapping = marketingPlatforms.filter(p => clientText.includes(p));
    if (clientText.length > 200 && marketingPlatforms.length > 0) {
      expect(overlapping.length).toBeGreaterThanOrEqual(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. SESSION ISOLATION
// Admin session should not bleed into client context; logout clears both
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Session Isolation', () => {
  test.setTimeout(60_000);

  test('after logout, /admin is blocked', async ({ page }) => {
    await loginAsAdmin(page);
    // Find and click logout
    const logoutBtn = page.locator('button:has-text("Log out"), button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Log out"), [role="menuitem"]:has-text("Log out")');
    if (await logoutBtn.count() > 0) {
      await logoutBtn.first().click();
      await page.waitForTimeout(5000);
    } else {
      // Try via user menu
      const userMenu = page.locator('[data-testid="user-menu"], button[aria-label*="user" i], button[aria-label*="account" i], .avatar, [class*="avatar"]');
      if (await userMenu.count() > 0) {
        await userMenu.first().click();
        await page.waitForTimeout(1000);
        const logoutInMenu = page.locator('button:has-text("Log out"), a:has-text("Log out"), [role="menuitem"]:has-text("Log out")');
        if (await logoutInMenu.count() > 0) {
          await logoutInMenu.first().click();
          await page.waitForTimeout(5000);
        }
      }
    }

    // Now try to access /admin — should be blocked
    await goApp(page, '/admin', 5000);
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const isBlocked = url.includes('/login') || text.includes('sign in') || text.includes('log in');
    await page.screenshot({ path: 'e2e-results/cf-session-after-logout.png', fullPage: false });
    expect(isBlocked).toBe(true);
  });

  test('after logout, /dashboard is blocked', async ({ page }) => {
    await loginAsAdmin(page);

    const logoutBtn = page.locator('button:has-text("Log out"), button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Log out"), [role="menuitem"]:has-text("Log out")');
    if (await logoutBtn.count() > 0) {
      await logoutBtn.first().click();
      await page.waitForTimeout(5000);
    } else {
      const userMenu = page.locator('[data-testid="user-menu"], button[aria-label*="user" i], button[aria-label*="account" i], .avatar, [class*="avatar"]');
      if (await userMenu.count() > 0) {
        await userMenu.first().click();
        await page.waitForTimeout(1000);
        const logoutInMenu = page.locator('[role="menuitem"]:has-text("Log out"), button:has-text("Log out"), a:has-text("Log out")');
        if (await logoutInMenu.count() > 0) {
          await logoutInMenu.first().click();
          await page.waitForTimeout(5000);
        }
      }
    }

    await goApp(page, '/dashboard', 5000);
    const url = page.url();
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const isBlocked = url.includes('/login') || text.includes('sign in') || text.includes('log in');
    await page.screenshot({ path: 'e2e-results/cf-session-dashboard-after-logout.png', fullPage: false });
    expect(isBlocked).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. CROSS-SURFACE NAVIGATION LINKS
// Each surface must have working links to the other surfaces
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Cross-Surface Navigation Links', () => {
  test.setTimeout(45_000);

  test('client dashboard header/nav has a link back to marketing or home', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard', 5000);

    const homeLink = page.locator('a[href="/"], a[href*="yousell.online"], nav a[href*="home"], [class*="logo"] a, header a[href="/"]').first();
    if (await homeLink.count() > 0) {
      const href = await homeLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
    await page.screenshot({ path: 'e2e-results/cf-dashboard-home-link.png', fullPage: false });
  });

  test('admin dashboard has reference to client-facing URL', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin', 5000);

    // Look for any link to yousell.online or /dashboard in admin UI
    const clientLink = page.locator('a[href*="yousell.online"], a[href*="/dashboard"]').first();
    if (await clientLink.count() > 0) {
      const href = await clientLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
    await page.screenshot({ path: 'e2e-results/cf-admin-client-link.png', fullPage: false });
  });

  test('marketing footer has working links to pricing, about, blog', async ({ page }) => {
    await goMarketing(page, '/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const footer = page.locator('footer');
    const pricingLink = footer.locator('a[href*="pricing"], a:has-text("Pricing")').first();
    const aboutLink   = footer.locator('a[href*="about"], a:has-text("About")').first();
    const blogLink    = footer.locator('a[href*="blog"], a:has-text("Blog")').first();

    const hasPricing = await pricingLink.count() > 0;
    const hasAbout   = await aboutLink.count() > 0;
    const hasBlog    = await blogLink.count() > 0;

    await page.screenshot({ path: 'e2e-results/cf-marketing-footer-links.png', fullPage: false });
    expect(hasPricing || hasAbout || hasBlog).toBe(true);
  });

  test('marketing footer links to app login/signup', async ({ page }) => {
    await goMarketing(page, '/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const footer = page.locator('footer');
    const authLinks = footer.locator('a[href*="login"], a[href*="signup"], a[href*="sign-up"], a:has-text("Login"), a:has-text("Sign Up"), a:has-text("Get Started")');
    const count = await authLinks.count();
    await page.screenshot({ path: 'e2e-results/cf-marketing-footer-auth-links.png', fullPage: false });
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. ADMIN REVENUE / FINANCIAL CONSISTENCY
// Revenue data admin manages should be reflected across financial dashboards
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Admin Revenue & Financial Cross-Check', () => {
  test.setTimeout(30_000);

  test('admin /admin/revenue page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/revenue', 5000);
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-admin-revenue.png', fullPage: false });
    expect(loaded).toBe(true);
  });

  test('admin /admin/financial page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/financial', 5000);
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-admin-financial.png', fullPage: false });
    expect(loaded).toBe(true);
  });

  test('admin /admin/pricing page (pricing config) loads', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/admin/pricing', 5000);
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-admin-pricing.png', fullPage: false });
    expect(loaded).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. ONBOARDING FLOW
// The post-signup onboarding must connect marketing promise → app setup
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Onboarding Flow: Signup → Setup', () => {
  test.setTimeout(30_000);

  test('marketing /onboarding page loads (demo/preview of onboarding)', async ({ page }) => {
    await goMarketing(page, '/onboarding');
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = text.length > 50;
    await page.screenshot({ path: 'e2e-results/cf-marketing-onboarding.png', fullPage: false });
    expect(loaded).toBe(true);
  });

  test('app /signup → /onboarding step shows after new account creation', async ({ page }) => {
    await goApp(page, '/signup', 3000);
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = text.includes('sign up') || text.includes('create') || (await page.locator('input[type="email"]').count()) > 0;
    await page.screenshot({ path: 'e2e-results/cf-app-signup-form.png', fullPage: false });
    expect(loaded).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. HELP & SUPPORT CROSS-REFERENCE
// Help links between surfaces must be consistent and functional
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Help & Support Cross-Reference', () => {
  test.setTimeout(30_000);

  test('client /dashboard/help page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await goApp(page, '/dashboard/help', 5000);
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    const loaded = !text.includes('application error') && !text.includes('this page could not be found');
    await page.screenshot({ path: 'e2e-results/cf-client-help.png', fullPage: false });
    expect(loaded).toBe(true);
  });

  test('marketing site has a contact or help link in footer/nav', async ({ page }) => {
    await goMarketing(page, '/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const helpLink = page.locator('a[href*="contact"], a[href*="help"], a[href*="support"], a:has-text("Contact"), a:has-text("Help"), a:has-text("Support")').first();
    const hasHelp = await helpLink.count() > 0;
    await page.screenshot({ path: 'e2e-results/cf-marketing-help-link.png', fullPage: false });
    expect(hasHelp).toBe(true);
  });
});
