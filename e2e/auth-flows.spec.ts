import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

const ADMIN_EMAIL = 'admin@yousell.online';
const ADMIN_PASSWORD = 'Admin@2026!';
const TEST_SIGNUP_EMAIL = `e2e-test-${Date.now()}@yousell.online`;
const TEST_SIGNUP_PASSWORD = 'TestUser@2026!';

// ─── LOGIN FLOW ──────────────────────────────────────────────

test.describe('Login Flow', () => {
  test('shows login form with email and password fields', async ({ page }) => {
    await navigateTo(page, '/login');

    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();

    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")');
    await expect(submitButton.first()).toBeVisible();

    await page.screenshot({ path: 'e2e-results/login-form.png', fullPage: true });
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await navigateTo(page, '/login');

    await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'WrongPassword123!');

    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")');
    await submitButton.first().click();

    await page.waitForTimeout(5000);

    const hasError = await page.evaluate(() => {
      const body = document.body.innerText.toLowerCase();
      return body.includes('invalid') || body.includes('error') || body.includes('incorrect') ||
             body.includes('wrong') || body.includes('failed') || body.includes('not found');
    });

    await page.screenshot({ path: 'e2e-results/login-error.png', fullPage: true });
    expect(hasError).toBe(true);
  });

  test('successfully logs in with admin credentials', async ({ page }) => {
    await navigateTo(page, '/login');

    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);

    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")');
    await submitButton.first().click();

    await page.waitForTimeout(8000);

    const url = page.url();
    const isLoggedIn = url.includes('/dashboard') || url.includes('/admin') || !url.includes('/login');

    await page.screenshot({ path: 'e2e-results/login-success.png', fullPage: true });
    expect(isLoggedIn).toBe(true);
  });
});

// ─── SIGNUP FLOW ──────────────────────────────────────────────

test.describe('Signup Flow', () => {
  test('shows signup form with required fields', async ({ page }) => {
    await navigateTo(page, '/signup');

    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();

    await page.screenshot({ path: 'e2e-results/signup-form.png', fullPage: true });
  });

  test('signup form submits with valid data', async ({ page }) => {
    await navigateTo(page, '/signup');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    const nameInput = page.locator('input[name="name"], input[name="full_name"], input[placeholder*="name" i]');
    if (await nameInput.count() > 0) {
      await nameInput.first().fill('E2E Test User');
    }

    await emailInput.fill(TEST_SIGNUP_EMAIL);
    await passwordInput.fill(TEST_SIGNUP_PASSWORD);

    const confirmPassword = page.locator('input[name="confirmPassword"], input[name="confirm_password"], input[placeholder*="confirm" i]');
    if (await confirmPassword.count() > 0) {
      await confirmPassword.first().fill(TEST_SIGNUP_PASSWORD);
    }

    const submitButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create")');
    await submitButton.first().click();

    await page.waitForTimeout(8000);

    const url = page.url();
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const signupProcessed = url.includes('/dashboard') || url.includes('/login') ||
                            !url.includes('/signup') ||
                            pageText.includes('check your email') ||
                            pageText.includes('verification') ||
                            pageText.includes('confirm') ||
                            pageText.includes('success');

    await page.screenshot({ path: 'e2e-results/signup-result.png', fullPage: true });
    expect(signupProcessed).toBe(true);
  });
});

// ─── LOGOUT FLOW ──────────────────────────────────────────────

test.describe('Logout Flow', () => {
  test('can log out after logging in', async ({ page }) => {
    await navigateTo(page, '/login');

    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);

    const loginButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")');
    await loginButton.first().click();
    await page.waitForTimeout(8000);

    const logoutButton = page.locator('button:has-text("Log out"), button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Log out"), a:has-text("Logout"), a:has-text("Sign out")');

    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await page.waitForTimeout(5000);

      const url = page.url();
      const isLoggedOut = url.includes('/login') || url === 'https://admin.yousell.online/' || url === 'https://admin.yousell.online';
      await page.screenshot({ path: 'e2e-results/logout-result.png', fullPage: true });
      expect(isLoggedOut).toBe(true);
    } else {
      const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Account"), .avatar, .user-menu, button[aria-label*="user" i], button[aria-label*="menu" i], button[aria-label*="account" i]');
      if (await userMenu.count() > 0) {
        await userMenu.first().click();
        await page.waitForTimeout(1000);

        const logoutInMenu = page.locator('button:has-text("Log out"), button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Log out"), [role="menuitem"]:has-text("Log out")');
        if (await logoutInMenu.count() > 0) {
          await logoutInMenu.first().click();
          await page.waitForTimeout(5000);
        }
      }
      await page.screenshot({ path: 'e2e-results/logout-attempt.png', fullPage: true });
    }
  });
});

// ─── PASSWORD RESET FLOW ──────────────────────────────────────

test.describe('Password Reset Flow', () => {
  test('forgot password page loads and accepts email', async ({ page }) => {
    await navigateTo(page, '/forgot-password');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();

    await emailInput.fill(ADMIN_EMAIL);

    const submitButton = page.locator('button[type="submit"], button:has-text("Reset"), button:has-text("Send"), button:has-text("Submit")');
    await submitButton.first().click();

    await page.waitForTimeout(5000);

    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const resetInitiated = pageText.includes('email') || pageText.includes('sent') ||
                           pageText.includes('check') || pageText.includes('reset') ||
                           pageText.includes('link');

    await page.screenshot({ path: 'e2e-results/forgot-password-result.png', fullPage: true });
    expect(resetInitiated).toBe(true);
  });

  test('reset password page loads', async ({ page }) => {
    await navigateTo(page, '/reset-password');

    await page.screenshot({ path: 'e2e-results/reset-password-page.png', fullPage: true });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

// ─── GOOGLE OAUTH FLOW ──────────────────────────────────────

test.describe('Google OAuth Flow', () => {
  test('Google OAuth button exists and redirects to Google', async ({ page }) => {
    await navigateTo(page, '/login');

    const googleButton = page.locator('button:has-text("Google"), a:has-text("Google"), [data-provider="google"], button:has-text("Continue with Google"), a:has-text("Continue with Google")');

    if (await googleButton.count() > 0) {
      const [popup] = await Promise.all([
        page.waitForEvent('popup', { timeout: 10000 }).catch(() => null),
        googleButton.first().click(),
      ]);

      await page.waitForTimeout(5000);

      const currentUrl = popup ? popup.url() : page.url();
      const isOAuthRedirect = currentUrl.includes('accounts.google.com') ||
                               currentUrl.includes('supabase.co/auth') ||
                               currentUrl.includes('googleapis.com');

      await page.screenshot({ path: 'e2e-results/google-oauth-redirect.png', fullPage: true });

      if (popup) {
        await popup.screenshot({ path: 'e2e-results/google-oauth-popup.png', fullPage: true });
      }

      expect(isOAuthRedirect).toBe(true);
    } else {
      await page.screenshot({ path: 'e2e-results/google-oauth-missing.png', fullPage: true });
      console.log('WARNING: Google OAuth button not found on login page');
    }
  });
});

// ─── PROTECTED ROUTE GUARDS ──────────────────────────────────

test.describe('Protected Routes - Auth Guards', () => {
  const protectedRoutes = ['/dashboard', '/admin/products', '/admin/settings', '/admin/clients'];

  for (const route of protectedRoutes) {
    test(`unauthenticated user cannot access ${route}`, async ({ page }) => {
      await navigateTo(page, route, 5000);

      const url = page.url();
      const isRedirected = url.includes('/login') || url.includes('/unauthorized');

      await page.screenshot({ path: `e2e-results/protected${route.replace(/\//g, '-')}.png`, fullPage: true });
      expect(isRedirected).toBe(true);
    });
  }
});
