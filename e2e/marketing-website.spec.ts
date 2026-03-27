import { test, expect, Page } from '@playwright/test';

// ─── CONFIG ────────────────────────────────────────────────────
const BASE_URL = process.env.MARKETING_BASE_URL || 'https://yousell.online';

/** Navigate to a marketing page and wait for hydration. */
async function goTo(page: Page, path: string, waitMs = 3000) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'commit', timeout: 60000 });
  await page
    .waitForFunction(() => document.body && document.body.innerHTML.length > 100, { timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(waitMs);
}

/** Assert no uncaught JS errors on the page. */
async function assertNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  // Give a moment for any deferred errors
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
}

// ─── 1. HOMEPAGE (13 SECTIONS) ────────────────────────────────

test.describe('Homepage', () => {
  test.setTimeout(30_000);

  test('loads successfully', async ({ page }) => {
    await goTo(page, '/');
    await expect(page).toHaveTitle(/YouSell/i);
  });

  test('hero section renders with CTAs', async ({ page }) => {
    await goTo(page, '/');
    const hero = page.locator('section').filter({ hasText: /sell smarter|start free|get started|grow your/i }).first();
    await expect(hero).toBeVisible();

    const ctaButtons = hero.locator('a, button').filter({ hasText: /get started|start free|try free|sign up/i });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('social proof bar is visible', async ({ page }) => {
    await goTo(page, '/');
    const socialProof = page.locator('[data-testid="social-proof"], section:has-text("trusted by"), section:has-text("sellers"), section:has-text("brands")').first();
    await expect(socialProof).toBeVisible();
  });

  test('problem statement section renders', async ({ page }) => {
    await goTo(page, '/');
    const problemSection = page.locator('section').filter({ hasText: /problem|challenge|struggle|without yousell|old way/i }).first();
    await expect(problemSection).toBeVisible();
  });

  test('intelligence chain section shows 7 steps', async ({ page }) => {
    await goTo(page, '/');
    const section = page.locator('[data-testid="intelligence-chain"], section:has-text("intelligence chain"), section:has-text("how it works")').first();
    await expect(section).toBeVisible();

    const steps = section.locator('[data-testid^="step-"], [class*="step"], [class*="card"], li, article');
    const count = await steps.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test('feature bento grid shows 6 cards', async ({ page }) => {
    await goTo(page, '/');
    const bentoSection = page.locator('[data-testid="bento-grid"], section:has-text("features"), section:has-text("everything you need")').first();
    await expect(bentoSection).toBeVisible();

    const cards = bentoSection.locator('[class*="card"], [class*="bento"], article, [data-testid^="feature-"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('pre-viral moat section renders', async ({ page }) => {
    await goTo(page, '/');
    const moatSection = page.locator('section').filter({ hasText: /pre-viral|moat|unfair advantage|competitive edge/i }).first();
    await expect(moatSection).toBeVisible();
  });

  test('platform coverage shows 14 platforms', async ({ page }) => {
    await goTo(page, '/');
    const platformSection = page.locator('[data-testid="platform-coverage"], section:has-text("platform"), section:has-text("marketplace")').first();
    await expect(platformSection).toBeVisible();

    const platformItems = platformSection.locator('img, [class*="platform"], [class*="logo"], [data-testid^="platform-"]');
    const count = await platformItems.count();
    expect(count).toBeGreaterThanOrEqual(14);
  });

  test('how it works shows 3 steps', async ({ page }) => {
    await goTo(page, '/');
    const howItWorks = page.locator('section').filter({ hasText: /how it works|simple steps|easy steps/i }).first();
    await expect(howItWorks).toBeVisible();

    const steps = howItWorks.locator('[class*="step"], [class*="card"], article, [data-testid^="step-"]');
    const count = await steps.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('testimonials show 3 cards', async ({ page }) => {
    await goTo(page, '/');
    const testimonials = page.locator('[data-testid="testimonials"], section:has-text("testimonial"), section:has-text("what our"), section:has-text("love")').first();
    await expect(testimonials).toBeVisible();

    const cards = testimonials.locator('[class*="testimonial"], [class*="card"], blockquote, article');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('competitor comparison table renders with 5 columns', async ({ page }) => {
    await goTo(page, '/');
    const comparison = page.locator('section').filter({ hasText: /comparison|compare|vs|competitor/i }).first();
    await expect(comparison).toBeVisible();

    const table = comparison.locator('table, [role="table"], [class*="comparison"]').first();
    await expect(table).toBeVisible();

    const headerCells = table.locator('th, [role="columnheader"], thead td').first();
    await expect(headerCells).toBeVisible();
    const totalHeaders = await table.locator('th, [role="columnheader"], thead td').count();
    expect(totalHeaders).toBeGreaterThanOrEqual(5);
  });

  test('pricing preview shows 3 tiers', async ({ page }) => {
    await goTo(page, '/');
    const pricing = page.locator('[data-testid="pricing-preview"], section:has-text("pricing"), section:has-text("plan")').first();
    await expect(pricing).toBeVisible();

    const tiers = pricing.locator('[class*="tier"], [class*="card"], [class*="plan"], article, [data-testid^="tier-"]');
    const count = await tiers.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('final CTA section renders', async ({ page }) => {
    await goTo(page, '/');
    // Scroll to bottom to ensure final CTA is in view
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const finalCta = page.locator('section').filter({ hasText: /get started|start free|ready to|join|sign up today/i }).last();
    await expect(finalCta).toBeVisible();

    const ctaButton = finalCta.locator('a, button').filter({ hasText: /get started|start free|sign up|try/i });
    await expect(ctaButton.first()).toBeVisible();
  });

  test('footer renders with 4 columns', async ({ page }) => {
    await goTo(page, '/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const columns = footer.locator('[class*="col"], [class*="column"], > div > div, nav, ul').filter({ has: page.locator('a') });
    const count = await columns.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});

// ─── 2. NAVIGATION ────────────────────────────────────────────

test.describe('Navigation', () => {
  test.setTimeout(30_000);

  test('navbar is transparent on hero', async ({ page }) => {
    await goTo(page, '/');
    const navbar = page.locator('nav, header, [data-testid="navbar"]').first();
    await expect(navbar).toBeVisible();

    const bgColor = await navbar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    // Transparent or rgba with alpha < 1
    const isTransparent =
      bgColor === 'transparent' ||
      bgColor === 'rgba(0, 0, 0, 0)' ||
      /rgba\(.+,\s*0(\.\d+)?\)/.test(bgColor);
    expect(isTransparent).toBe(true);
  });

  test('navbar becomes solid on scroll', async ({ page }) => {
    await goTo(page, '/');
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);

    const navbar = page.locator('nav, header, [data-testid="navbar"]').first();
    const bgColor = await navbar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundColor;
    });
    const isSolid =
      bgColor !== 'transparent' &&
      bgColor !== 'rgba(0, 0, 0, 0)' &&
      !/rgba\(.+,\s*0\)/.test(bgColor);
    expect(isSolid).toBe(true);
  });

  test('Products dropdown opens on hover', async ({ page }) => {
    await goTo(page, '/');
    const productsLink = page.locator('nav a, nav button, header a, header button').filter({ hasText: /products/i }).first();
    await expect(productsLink).toBeVisible();
    await productsLink.hover();
    await page.waitForTimeout(500);

    const dropdown = page.locator('[class*="dropdown"], [class*="menu"], [role="menu"], [class*="popover"]').filter({ hasText: /trend|agent|pricing|forecast|briefing/i }).first();
    await expect(dropdown).toBeVisible();
  });

  test('Solutions dropdown opens on hover', async ({ page }) => {
    await goTo(page, '/');
    const solutionsLink = page.locator('nav a, nav button, header a, header button').filter({ hasText: /solutions/i }).first();
    await expect(solutionsLink).toBeVisible();
    await solutionsLink.hover();
    await page.waitForTimeout(500);

    const dropdown = page.locator('[class*="dropdown"], [class*="menu"], [role="menu"], [class*="popover"]').filter({ hasText: /dropship|resell|agenc/i }).first();
    await expect(dropdown).toBeVisible();
  });

  test('Get Started button links to signup', async ({ page }) => {
    await goTo(page, '/');
    const getStarted = page.locator('nav a, header a').filter({ hasText: /get started/i }).first();
    await expect(getStarted).toBeVisible();

    const href = await getStarted.getAttribute('href');
    expect(href).toMatch(/sign-?up|register|get-?started/i);
  });

  test('Log In button links to login', async ({ page }) => {
    await goTo(page, '/');
    const logIn = page.locator('nav a, header a').filter({ hasText: /log\s?in|sign\s?in/i }).first();
    await expect(logIn).toBeVisible();

    const href = await logIn.getAttribute('href');
    expect(href).toMatch(/log-?in|sign-?in|login/i);
  });

  test('mobile hamburger menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goTo(page, '/');

    const hamburger = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="navigation" i], [data-testid="mobile-menu"], button:has(svg), button[class*="hamburger"], button[class*="menu"]'
    ).first();
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    await page.waitForTimeout(500);

    const mobileNav = page.locator('[class*="mobile"], [class*="drawer"], [role="dialog"], [class*="sidebar"]').filter({ has: page.locator('a') }).first();
    await expect(mobileNav).toBeVisible();
  });
});

// ─── 3. PRICING PAGE ──────────────────────────────────────────

test.describe('Pricing', () => {
  test.setTimeout(30_000);

  test('loads with 3 tier cards', async ({ page }) => {
    await goTo(page, '/pricing');
    await expect(page).toHaveTitle(/pricing|plan/i);

    const tierCards = page.locator('[class*="card"], [class*="tier"], [class*="plan"], [data-testid^="pricing-"], article').filter({ hasText: /\$|\/mo|month/i });
    const count = await tierCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('monthly/annual toggle works', async ({ page }) => {
    await goTo(page, '/pricing');
    const toggle = page.locator('button, [role="switch"], [class*="toggle"], label').filter({ hasText: /annual|yearly|monthly/i }).first();
    await expect(toggle).toBeVisible();

    // Capture initial price text
    const priceLocator = page.locator('[class*="price"], [data-testid*="price"]').first();
    const initialPrice = await priceLocator.textContent();

    await toggle.click();
    await page.waitForTimeout(500);

    const updatedPrice = await priceLocator.textContent();
    expect(updatedPrice).not.toBe(initialPrice);
  });

  test('Pro card is highlighted', async ({ page }) => {
    await goTo(page, '/pricing');
    const proCard = page.locator('[class*="card"], [class*="tier"], article').filter({ hasText: /pro/i }).first();
    await expect(proCard).toBeVisible();

    const isHighlighted = await proCard.evaluate((el) => {
      const classes = el.className.toLowerCase();
      const style = window.getComputedStyle(el);
      return (
        classes.includes('popular') ||
        classes.includes('highlight') ||
        classes.includes('featured') ||
        classes.includes('recommended') ||
        style.border.includes('rgb') ||
        style.boxShadow !== 'none' ||
        el.querySelector('[class*="badge"], [class*="popular"], [class*="recommended"]') !== null
      );
    });
    expect(isHighlighted).toBe(true);
  });

  test('feature comparison table renders', async ({ page }) => {
    await goTo(page, '/pricing');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    const comparisonTable = page.locator('table, [role="table"], [class*="comparison"]').first();
    await expect(comparisonTable).toBeVisible();

    const rows = comparisonTable.locator('tr, [role="row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(5);
  });

  test('ROI calculator slider works', async ({ page }) => {
    await goTo(page, '/pricing');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
    await page.waitForTimeout(500);

    const slider = page.locator('input[type="range"], [role="slider"], [class*="slider"]').first();
    await expect(slider).toBeVisible();

    // Read initial output
    const outputLocator = page.locator('[class*="roi"], [class*="result"], [class*="savings"], [data-testid*="roi"]').first();
    const initialValue = await outputLocator.textContent();

    // Move slider
    await slider.fill('80');
    await page.waitForTimeout(300);

    const updatedValue = await outputLocator.textContent();
    expect(updatedValue).not.toBe(initialValue);
  });

  test('FAQ accordion expands on click', async ({ page }) => {
    await goTo(page, '/pricing');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const faqSection = page.locator('section').filter({ hasText: /faq|frequently asked|questions/i }).first();
    await expect(faqSection).toBeVisible();

    const firstQuestion = faqSection.locator('button, summary, [role="button"], [class*="accordion"]').first();
    await expect(firstQuestion).toBeVisible();
    await firstQuestion.click();
    await page.waitForTimeout(300);

    const answer = faqSection.locator('[class*="answer"], [class*="content"], [class*="panel"], dd, p').filter({ hasNotText: /faq|frequently/i }).first();
    await expect(answer).toBeVisible();
  });
});

// ─── 4. FEATURE PAGES (6) ─────────────────────────────────────

test.describe('Feature Pages', () => {
  test.setTimeout(30_000);

  const featurePages = [
    { path: '/features', name: 'Features Overview' },
    { path: '/features/trend-radar', name: 'Trend Radar' },
    { path: '/features/ai-agents', name: 'AI Agents' },
    { path: '/features/pricing-intelligence', name: 'Pricing Intelligence' },
    { path: '/features/demand-forecasting', name: 'Demand Forecasting' },
    { path: '/features/ai-briefings', name: 'AI Briefings' },
  ];

  for (const { path, name } of featurePages) {
    test(`${path} loads successfully`, async ({ page }) => {
      await goTo(page, path);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      await page.screenshot({ path: `e2e-results/feature-${name.replace(/\s/g, '-').toLowerCase()}.png`, fullPage: true });
    });

    test(`${path} has hero with CTA`, async ({ page }) => {
      await goTo(page, path);
      const hero = page.locator('section, [class*="hero"]').first();
      await expect(hero).toBeVisible();

      const cta = page.locator('a, button').filter({ hasText: /get started|try free|start free|sign up|learn more|see demo/i }).first();
      await expect(cta).toBeVisible();
    });

    test(`${path} has how-it-works section`, async ({ page }) => {
      await goTo(page, path);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);

      const section = page.locator('section').filter({ hasText: /how it works|how .+ works|steps|get started in/i }).first();
      await expect(section).toBeVisible();
    });
  }
});

// ─── 5. INTEGRATIONS ──────────────────────────────────────────

test.describe('Integrations', () => {
  test.setTimeout(30_000);

  test('loads with integration cards', async ({ page }) => {
    await goTo(page, '/integrations');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const cards = page.locator('[class*="card"], article, [data-testid^="integration-"]').filter({
      has: page.locator('img, svg'),
    });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('category filter tabs work', async ({ page }) => {
    await goTo(page, '/integrations');

    const tabs = page.locator('[role="tablist"] [role="tab"], button[class*="tab"], button[class*="filter"], [class*="category"] button');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    // Click second tab
    await tabs.nth(1).click();
    await page.waitForTimeout(500);

    // Verify the tab appears selected
    const secondTab = tabs.nth(1);
    const isActive = await secondTab.evaluate((el) => {
      return (
        el.classList.toString().toLowerCase().includes('active') ||
        el.classList.toString().toLowerCase().includes('selected') ||
        el.getAttribute('aria-selected') === 'true' ||
        el.getAttribute('data-state') === 'active'
      );
    });
    expect(isActive).toBe(true);
  });

  test('featured integrations row visible', async ({ page }) => {
    await goTo(page, '/integrations');
    const featured = page.locator('[class*="featured"], [data-testid="featured-integrations"], section').filter({ hasText: /featured|popular|top/i }).first();
    await expect(featured).toBeVisible();
  });
});

// ─── 6. ABOUT ─────────────────────────────────────────────────

test.describe('About', () => {
  test.setTimeout(30_000);

  test('loads with team section', async ({ page }) => {
    await goTo(page, '/about');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    const teamSection = page.locator('section').filter({ hasText: /team|people|who we are|founders/i }).first();
    await expect(teamSection).toBeVisible();
  });

  test('shows company stats', async ({ page }) => {
    await goTo(page, '/about');
    const stats = page.locator('[class*="stat"], [class*="metric"], [class*="counter"]').or(
      page.locator('section').filter({ hasText: /\d+[+%kKmM]/ }).first()
    );
    await expect(stats.first()).toBeVisible();
  });
});

// ─── 7. BLOG ──────────────────────────────────────────────────

test.describe('Blog', () => {
  test.setTimeout(30_000);

  test('loads with featured post', async ({ page }) => {
    await goTo(page, '/blog');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    const featuredPost = page.locator('[class*="featured"], [class*="hero"], article').first();
    await expect(featuredPost).toBeVisible();
  });

  test('shows blog post cards', async ({ page }) => {
    await goTo(page, '/blog');
    const postCards = page.locator('article, [class*="post-card"], [class*="blog-card"], [data-testid^="blog-post"]');
    const count = await postCards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('category filter works', async ({ page }) => {
    await goTo(page, '/blog');

    const filterButtons = page.locator('[role="tablist"] [role="tab"], button[class*="category"], button[class*="filter"], a[class*="category"]');
    const filterCount = await filterButtons.count();
    expect(filterCount).toBeGreaterThanOrEqual(2);

    await filterButtons.nth(1).click();
    await page.waitForTimeout(500);

    // Verify content updates (cards should still be present)
    const postCards = page.locator('article, [class*="post-card"], [class*="blog-card"]');
    const count = await postCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ─── 8. SEO LANDING PAGES ─────────────────────────────────────

test.describe('SEO Landing Pages', () => {
  test.setTimeout(30_000);

  const seoPages = [
    { path: '/for-dropshippers', audience: 'dropship' },
    { path: '/for-resellers', audience: 'resell' },
    { path: '/for-agencies', audience: 'agenc' },
  ];

  for (const { path, audience } of seoPages) {
    test(`${path} loads with unique H1`, async ({ page }) => {
      await goTo(page, path);
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      const h1Text = await h1.textContent();
      expect(h1Text!.toLowerCase()).toContain(audience);
    });

    test(`${path} has hero CTA`, async ({ page }) => {
      await goTo(page, path);
      const cta = page.locator('a, button').filter({ hasText: /get started|start free|sign up|try free/i }).first();
      await expect(cta).toBeVisible();
    });

    test(`${path} has social proof or testimonials`, async ({ page }) => {
      await goTo(page, path);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);

      const proof = page.locator('section').filter({ hasText: /trusted|testimonial|review|customer|seller/i }).first();
      await expect(proof).toBeVisible();
    });
  }
});

// ─── 9. COMPARISON PAGES ──────────────────────────────────────

test.describe('Comparison Pages', () => {
  test.setTimeout(30_000);

  const comparisonPages = [
    { path: '/comparison/vs-fastmoss', competitor: 'FastMoss' },
    { path: '/comparison/vs-junglescout', competitor: 'Jungle Scout' },
    { path: '/comparison/vs-triple-whale', competitor: 'Triple Whale' },
  ];

  for (const { path, competitor } of comparisonPages) {
    test(`${path} loads with comparison table`, async ({ page }) => {
      await goTo(page, path);
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();

      const headingText = await heading.textContent();
      expect(headingText!.toLowerCase()).toMatch(/vs|compare|alternative/i);

      const table = page.locator('table, [role="table"], [class*="comparison"]').first();
      await expect(table).toBeVisible();
    });

    test(`${path} highlights YouSell advantages`, async ({ page }) => {
      await goTo(page, path);
      // Look for checkmarks or positive indicators in YouSell column
      const advantages = page.locator('[class*="check"], [class*="yes"], svg[class*="check"], [data-testid*="advantage"]').or(
        page.locator('td, [role="cell"]').filter({ hasText: /✓|✔|yes|included/i })
      );
      const count = await advantages.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test(`${path} has CTA`, async ({ page }) => {
      await goTo(page, path);
      const cta = page.locator('a, button').filter({ hasText: /get started|try yousell|switch|start free|sign up/i }).first();
      await expect(cta).toBeVisible();
    });
  }
});

// ─── 10. DEMO ─────────────────────────────────────────────────

test.describe('Demo', () => {
  test.setTimeout(30_000);

  test('loads without requiring signup', async ({ page }) => {
    await goTo(page, '/demo');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Should NOT redirect to login/signup
    const url = page.url();
    expect(url).not.toMatch(/login|sign-?up|register/i);
  });

  test('shows sample product cards', async ({ page }) => {
    await goTo(page, '/demo');
    const productCards = page.locator('[class*="product"], [class*="card"], article, [data-testid^="product-"]').filter({
      has: page.locator('img'),
    });
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('platform tabs are switchable', async ({ page }) => {
    await goTo(page, '/demo');
    const tabs = page.locator('[role="tablist"] [role="tab"], button[class*="tab"], button[class*="platform"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    // Click second tab
    const secondTab = tabs.nth(1);
    await secondTab.click();
    await page.waitForTimeout(500);

    const isActive = await secondTab.evaluate((el) => {
      return (
        el.classList.toString().toLowerCase().includes('active') ||
        el.classList.toString().toLowerCase().includes('selected') ||
        el.getAttribute('aria-selected') === 'true' ||
        el.getAttribute('data-state') === 'active'
      );
    });
    expect(isActive).toBe(true);
  });

  test('watermark is visible', async ({ page }) => {
    await goTo(page, '/demo');
    const watermark = page.locator('[class*="watermark"], [class*="demo-badge"], [data-testid="watermark"]').or(
      page.locator('div, span').filter({ hasText: /demo|sample|preview/i }).first()
    );
    await expect(watermark.first()).toBeVisible();
  });

  test('CTA button is always visible', async ({ page }) => {
    await goTo(page, '/demo');

    // Check CTA at top
    const cta = page.locator('a, button').filter({ hasText: /get started|sign up|start free|try free|upgrade/i }).first();
    await expect(cta).toBeVisible();

    // Scroll down and check CTA is still visible (sticky or repeated)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    const ctaAfterScroll = page.locator('a, button').filter({ hasText: /get started|sign up|start free|try free|upgrade/i }).first();
    await expect(ctaAfterScroll).toBeVisible();
  });
});

// ─── 11. ONBOARDING ───────────────────────────────────────────

test.describe('Onboarding', () => {
  test.setTimeout(30_000);

  test('loads step 1', async ({ page }) => {
    await goTo(page, '/onboarding');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Should show step 1 indicator
    const stepIndicator = page.locator('[class*="step"], [class*="progress"], [data-step], [aria-label*="step"]').or(
      page.locator('span, div').filter({ hasText: /step 1|1 of|1\//i }).first()
    );
    await expect(stepIndicator.first()).toBeVisible();
  });

  test('progress bar is visible', async ({ page }) => {
    await goTo(page, '/onboarding');
    const progressBar = page.locator(
      '[role="progressbar"], progress, [class*="progress"], [class*="stepper"], [data-testid="progress"]'
    ).first();
    await expect(progressBar).toBeVisible();
  });

  test('next button advances steps', async ({ page }) => {
    await goTo(page, '/onboarding');

    // Capture initial state
    const initialUrl = page.url();
    const initialContent = await page.locator('h1, h2, h3').first().textContent();

    const nextButton = page.locator('button').filter({ hasText: /next|continue|proceed/i }).first();
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await page.waitForTimeout(1000);

    // Verify step advanced (URL change or content change)
    const newUrl = page.url();
    const newContent = await page.locator('h1, h2, h3').first().textContent();
    const hasAdvanced = newUrl !== initialUrl || newContent !== initialContent;
    expect(hasAdvanced).toBe(true);
  });

  test('back button works', async ({ page }) => {
    await goTo(page, '/onboarding');

    // Advance to step 2 first
    const nextButton = page.locator('button').filter({ hasText: /next|continue|proceed/i }).first();
    await nextButton.click();
    await page.waitForTimeout(1000);

    const step2Content = await page.locator('h1, h2, h3').first().textContent();

    const backButton = page.locator('button').filter({ hasText: /back|previous|prev/i }).first();
    await expect(backButton).toBeVisible();
    await backButton.click();
    await page.waitForTimeout(1000);

    const step1Content = await page.locator('h1, h2, h3').first().textContent();
    expect(step1Content).not.toBe(step2Content);
  });

  test('steps are skippable', async ({ page }) => {
    await goTo(page, '/onboarding');

    const skipButton = page.locator('button, a').filter({ hasText: /skip|skip this|not now|later/i }).first();
    await expect(skipButton).toBeVisible();

    const initialContent = await page.locator('h1, h2, h3').first().textContent();
    await skipButton.click();
    await page.waitForTimeout(1000);

    const afterSkipContent = await page.locator('h1, h2, h3').first().textContent();
    expect(afterSkipContent).not.toBe(initialContent);
  });
});

// ─── 12. CROSS-CUTTING CONCERNS ───────────────────────────────

test.describe('Cross-cutting: All Marketing Pages Load', () => {
  test.setTimeout(30_000);

  const allPages = [
    '/',
    '/pricing',
    '/features',
    '/features/trend-radar',
    '/features/ai-agents',
    '/features/pricing-intelligence',
    '/features/demand-forecasting',
    '/features/ai-briefings',
    '/integrations',
    '/about',
    '/blog',
    '/demo',
    '/onboarding',
    '/for-dropshippers',
    '/for-resellers',
    '/for-agencies',
    '/comparison/vs-fastmoss',
    '/comparison/vs-junglescout',
    '/comparison/vs-triple-whale',
  ];

  for (const path of allPages) {
    test(`${path} returns 200 and renders content`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'commit', timeout: 60000 });
      expect(response?.status()).toBe(200);

      await page
        .waitForFunction(() => document.body && document.body.innerHTML.length > 100, { timeout: 30000 })
        .catch(() => {});

      const bodyText = await page.evaluate(() => document.body.innerText.trim());
      expect(bodyText.length).toBeGreaterThan(50);
    });
  }
});

test.describe('Cross-cutting: No Console Errors on Key Pages', () => {
  test.setTimeout(30_000);

  const keyPages = ['/', '/pricing', '/features', '/demo', '/blog'];

  for (const path of keyPages) {
    test(`${path} has no uncaught JS errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await goTo(page, path);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Filter out known third-party errors that are not our concern
      const relevantErrors = errors.filter(
        (e) =>
          !e.includes('Script error') &&
          !e.includes('ResizeObserver') &&
          !e.includes('Loading chunk') &&
          !e.includes('ChunkLoadError')
      );
      expect(relevantErrors).toEqual([]);
    });
  }
});
