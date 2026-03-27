import { Page } from '@playwright/test';

/**
 * Navigate to a page and wait for it to be interactive.
 * Uses 'commit' waitUntil because the deployed site's external resources
 * can cause 'load' and 'networkidle' to hang in headless mode.
 * Then waits for the body to have content to ensure JS has hydrated.
 */
export async function navigateTo(page: Page, path: string, waitMs = 3000) {
  await page.goto(path, { waitUntil: 'commit', timeout: 60000 });
  // Wait for body to exist and have content
  await page.waitForFunction(
    () => document.body && document.body.innerHTML.length > 100,
    { timeout: 30000 }
  ).catch(() => {});
  await page.waitForTimeout(waitMs);
}
