import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { navigateTo } from './helpers';

const ADMIN_EMAIL = 'admin@yousell.online';
const ADMIN_PASSWORD = 'Admin@2026!';
const authDir = path.join(__dirname, '.auth');
const adminFile = path.join(authDir, 'admin.json');

setup('authenticate as admin', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // The site redirects /login -> /admin/login
  await navigateTo(page, '/admin/login', 5000);

  // Wait for the email input to be visible (hydration)
  await page.waitForSelector('input[type="email"]', { timeout: 30000 });
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);

  const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")');
  await submitButton.first().click();

  await page.waitForTimeout(8000);

  const url = page.url();
  console.log(`Post-login URL: ${url}`);

  await page.context().storageState({ path: adminFile });
  console.log(`Auth state saved to ${adminFile}`);
});
