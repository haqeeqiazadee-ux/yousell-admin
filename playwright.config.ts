import { defineConfig, devices } from '@playwright/test';

// Parse proxy from environment for Playwright browser context
function getProxyConfig() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!proxyUrl) return undefined;
  try {
    const url = new URL(proxyUrl);
    return {
      server: `${url.protocol}//${url.hostname}:${url.port}`,
      username: url.username,
      password: url.password,
    };
  } catch {
    return undefined;
  }
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  timeout: 120000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'e2e-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://admin.yousell.online',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
    actionTimeout: 30000,
    navigationTimeout: 60000,
    ignoreHTTPSErrors: true,
    proxy: getProxyConfig(),
  },
  outputDir: 'e2e-results',
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
      testIgnore: /admin-dashboard/,
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 },
        userAgent: devices['iPad (gen 7)'].userAgent,
      },
      dependencies: ['setup'],
      testIgnore: /admin-dashboard/,
    },
  ],
});
