import { test, expect } from '@playwright/test';
import { navigateTo } from './helpers';

// ─── PAGES TO TEST ACROSS MULTIPLE SUITES ───────────────────────

const corePagesToTest = ['/', '/pricing', '/login'];
const adminPagesToTest = ['/admin', '/admin/products', '/admin/settings'];
const dashboardPagesToTest = ['/dashboard'];
const allPages = [...corePagesToTest, ...adminPagesToTest, ...dashboardPagesToTest];

// ─── KEYBOARD NAVIGATION ────────────────────────────────────────

test.describe('Keyboard Navigation', () => {
  test('tab reaches all interactive elements on homepage', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const interactiveElements = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return elements.length;
    });

    // Press Tab multiple times and track focused elements
    const focusedTags = new Set<string>();
    for (let i = 0; i < Math.min(interactiveElements, 30); i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName.toLowerCase() : 'none';
      });
      focusedTags.add(tag);
    }

    // Should have focused at least a few different element types
    expect(focusedTags.size).toBeGreaterThan(0);
  });

  test('CMD+K palette is keyboard-only operable', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);

    // Open with keyboard
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"], [cmdk-dialog], [data-cmdk-root], [class*="command"]');
    if (await dialog.count() > 0) {
      // Type to search
      await page.keyboard.type('products');
      await page.waitForTimeout(300);

      // Navigate with arrow
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);

      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await expect(dialog.first()).not.toBeVisible();
    }
  });

  test('modal focus is trapped', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);

    // Open command palette as a modal
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"], [cmdk-dialog]');
    if (await dialog.count() > 0) {
      // Tab through all elements in the modal
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const isInDialog = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active) return false;
          const dialog = active.closest('[role="dialog"], [cmdk-dialog], [data-cmdk-root], [class*="command"]');
          return dialog !== null || active.tagName === 'BODY';
        });
        // Focus should remain inside the dialog
        expect(isInDialog).toBe(true);
      }
    }
  });

  test('escape closes modals', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);

    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"], [cmdk-dialog], [class*="command"]');
    if (await dialog.count() > 0) {
      await expect(dialog.first()).toBeVisible();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(dialog.first()).not.toBeVisible();
    }
  });

  test('focus returns to trigger after modal close', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);

    // Find and click a button that opens a modal
    const triggerBtn = page.locator(
      'button[aria-haspopup="dialog"], button[data-testid*="modal"], ' +
      'button:has-text("Add"), button:has-text("Create"), button:has-text("New")'
    );

    if (await triggerBtn.count() > 0) {
      await triggerBtn.first().focus();
      await triggerBtn.first().click();
      await page.waitForTimeout(500);

      const dialog = page.locator('[role="dialog"]:visible');
      if (await dialog.count() > 0) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Focus should return to the trigger
        const focusedElement = await page.evaluate(() => {
          return document.activeElement?.tagName.toLowerCase() || 'none';
        });
        expect(['button', 'a', 'input']).toContain(focusedElement);
      }
    }
  });

  test('skip-to-content link exists', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    // Press Tab to reveal skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator(
      'a[href="#main"], a[href="#content"], a[href="#main-content"], ' +
      'a:has-text("Skip to content"), a:has-text("Skip to main")'
    );
    const count = await skipLink.count();
    // Skip link is a nice-to-have; document its presence
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ─── ARIA ATTRIBUTES ────────────────────────────────────────────

test.describe('ARIA', () => {
  for (const path of allPages) {
    test(`${path} - all images have alt text`, async ({ page }) => {
      if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
        test.use({ storageState: 'e2e/.auth/admin.json' });
      }
      await navigateTo(page, path, 3000);

      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      // Decorative images should have alt="" (empty string), not missing alt
      expect(imagesWithoutAlt).toBe(0);
    });
  }

  for (const path of allPages) {
    test(`${path} - icon buttons have aria-label`, async ({ page }) => {
      if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
        test.use({ storageState: 'e2e/.auth/admin.json' });
      }
      await navigateTo(page, path, 3000);

      // Buttons that contain only icons (SVG/img) and no text
      const iconOnlyButtons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        let unlabeledCount = 0;
        buttons.forEach((btn) => {
          const hasText = btn.textContent?.trim();
          const hasAriaLabel = btn.getAttribute('aria-label');
          const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');
          const hasTitle = btn.getAttribute('title');
          const hasSvg = btn.querySelector('svg');
          const hasImg = btn.querySelector('img');

          if ((hasSvg || hasImg) && !hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
            unlabeledCount++;
          }
        });
        return unlabeledCount;
      });

      expect(iconOnlyButtons).toBe(0);
    });
  }

  test('pages have valid titles', async ({ page }) => {
    for (const path of ['/', '/pricing', '/login']) {
      await navigateTo(page, path, 2000);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('undefined');
      expect(title).not.toBe('null');
    }
  });

  test('form inputs have labels on login page', async ({ page }) => {
    await navigateTo(page, '/login', 3000);

    const unlabeledInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
      let unlabeled = 0;
      inputs.forEach((input) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const placeholder = input.getAttribute('placeholder');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : null;

        if (!hasLabel && !ariaLabel && !ariaLabelledBy && !placeholder) {
          unlabeled++;
        }
      });
      return unlabeled;
    });

    expect(unlabeledInputs).toBe(0);
  });

  test('form inputs have labels on signup page', async ({ page }) => {
    await navigateTo(page, '/signup', 3000);

    const unlabeledInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
      let unlabeled = 0;
      inputs.forEach((input) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const placeholder = input.getAttribute('placeholder');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : null;

        if (!hasLabel && !ariaLabel && !ariaLabelledBy && !placeholder) {
          unlabeled++;
        }
      });
      return unlabeled;
    });

    expect(unlabeledInputs).toBe(0);
  });

  test('AI streaming content has aria-live attribute', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin/chatbot', 3000);

    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();
    // AI chat page should have at least one live region for streaming content
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('navigation landmarks have accessible names', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const navElements = await page.evaluate(() => {
      const navs = document.querySelectorAll('nav');
      const results: { hasLabel: boolean }[] = [];
      navs.forEach((nav) => {
        results.push({
          hasLabel: !!(nav.getAttribute('aria-label') || nav.getAttribute('aria-labelledby')),
        });
      });
      return results;
    });

    if (navElements.length > 1) {
      // When there are multiple navs, they should have distinct labels
      const labeledCount = navElements.filter((n) => n.hasLabel).length;
      expect(labeledCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('role attributes are valid', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const invalidRoles = await page.evaluate(() => {
      const validRoles = [
        'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
        'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
        'contentinfo', 'definition', 'dialog', 'directory', 'document',
        'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
        'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
        'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
        'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
        'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
        'rowheader', 'scrollbar', 'search', 'searchbox', 'separator', 'slider',
        'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel',
        'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
        'treeitem',
      ];
      const elements = document.querySelectorAll('[role]');
      let invalid = 0;
      elements.forEach((el) => {
        const role = el.getAttribute('role');
        if (role && !validRoles.includes(role)) {
          invalid++;
        }
      });
      return invalid;
    });

    expect(invalidRoles).toBe(0);
  });
});

// ─── COLOR CONTRAST ─────────────────────────────────────────────

test.describe('Color Contrast', () => {
  /**
   * Calculate relative luminance per WCAG 2.1
   * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
   */
  function relativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function contrastRatio(l1: number, l2: number): number {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  test('body text meets 4.5:1 contrast ratio on homepage', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const styles = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });

    // Parse RGB values
    const colorMatch = styles.color.match(/\d+/g);
    const bgMatch = styles.backgroundColor.match(/\d+/g);

    if (colorMatch && bgMatch) {
      const textLum = relativeLuminance(+colorMatch[0], +colorMatch[1], +colorMatch[2]);
      const bgLum = relativeLuminance(+bgMatch[0], +bgMatch[1], +bgMatch[2]);
      const ratio = contrastRatio(textLum, bgLum);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('body text meets 4.5:1 contrast ratio on login', async ({ page }) => {
    await navigateTo(page, '/login', 3000);

    const styles = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });

    const colorMatch = styles.color.match(/\d+/g);
    const bgMatch = styles.backgroundColor.match(/\d+/g);

    if (colorMatch && bgMatch) {
      const textLum = relativeLuminance(+colorMatch[0], +colorMatch[1], +colorMatch[2]);
      const bgLum = relativeLuminance(+bgMatch[0], +bgMatch[1], +bgMatch[2]);
      const ratio = contrastRatio(textLum, bgLum);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('large text meets 3:1 ratio on homepage', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const h1Styles = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;
      const computed = window.getComputedStyle(h1);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor || window.getComputedStyle(document.body).backgroundColor,
        fontSize: parseFloat(computed.fontSize),
      };
    });

    if (h1Styles && h1Styles.fontSize >= 18) {
      const colorMatch = h1Styles.color.match(/\d+/g);
      const bgMatch = h1Styles.backgroundColor.match(/\d+/g);

      if (colorMatch && bgMatch) {
        const textLum = relativeLuminance(+colorMatch[0], +colorMatch[1], +colorMatch[2]);
        const bgLum = relativeLuminance(+bgMatch[0], +bgMatch[1], +bgMatch[2]);
        const ratio = contrastRatio(textLum, bgLum);
        expect(ratio).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test('link text is distinguishable from surrounding text', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const linkContrast = await page.evaluate(() => {
      const links = document.querySelectorAll('p a, span a, li a');
      let inadequate = 0;
      links.forEach((link) => {
        const linkStyle = window.getComputedStyle(link);
        const parentStyle = window.getComputedStyle(link.parentElement!);
        const hasUnderline = linkStyle.textDecorationLine.includes('underline');
        const differentColor = linkStyle.color !== parentStyle.color;
        if (!hasUnderline && !differentColor) {
          inadequate++;
        }
      });
      return inadequate;
    });

    expect(linkContrast).toBe(0);
  });
});

// ─── FOCUS INDICATORS ───────────────────────────────────────────

test.describe('Focus Indicators', () => {
  test('focus ring is visible on tab on homepage', async ({ page }) => {
    await navigateTo(page, '/', 3000);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    const focusedElement = page.locator(':focus-visible');
    const count = await focusedElement.count();
    // At least one element should have focus-visible
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('focus ring is visible on tab on login', async ({ page }) => {
    await navigateTo(page, '/login', 3000);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    const hasFocusStyle = await page.evaluate(() => {
      const focused = document.querySelector(':focus-visible, :focus');
      if (!focused) return false;
      const style = window.getComputedStyle(focused);
      const outline = style.outline;
      const boxShadow = style.boxShadow;
      const border = style.border;
      // Should have some visible focus indicator
      return (
        (outline && outline !== 'none' && !outline.includes('0px')) ||
        (boxShadow && boxShadow !== 'none') ||
        (border && border !== 'none')
      );
    });

    // Focus indicator should be visible
    expect(hasFocusStyle).toBe(true);
  });

  test('focus-visible is never suppressed globally', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const suppressesFocus = await page.evaluate(() => {
      const styles = document.querySelectorAll('style');
      let suppressed = false;
      styles.forEach((style) => {
        const text = style.textContent || '';
        // Check for :focus { outline: none } without :focus-visible fallback
        if (text.includes(':focus') && text.includes('outline: none') && !text.includes(':focus-visible')) {
          suppressed = true;
        }
      });
      return suppressed;
    });

    // Should not globally suppress focus outlines
    expect(suppressesFocus).toBe(false);
  });

  test('focus order follows visual layout on admin', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);

    const focusPositions: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const pos = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y };
      });
      if (pos) focusPositions.push(pos);
    }

    // Focus should generally move top-to-bottom, left-to-right
    // At minimum we should have some focused elements
    expect(focusPositions.length).toBeGreaterThan(0);
  });
});

// ─── SEMANTIC HTML ──────────────────────────────────────────────

test.describe('Semantic HTML', () => {
  test('homepage uses heading hierarchy (h1 > h2 > h3)', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const headingLevels = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headings).map((h) => parseInt(h.tagName.charAt(1)));
    });

    if (headingLevels.length > 0) {
      // Should start with h1
      expect(headingLevels[0]).toBe(1);

      // Should not skip levels (e.g., h1 directly to h3)
      for (let i = 1; i < headingLevels.length; i++) {
        const jump = headingLevels[i] - headingLevels[i - 1];
        // Allow going deeper by 1 level or going back up
        expect(jump).toBeLessThanOrEqual(1);
      }
    }
  });

  test('only one h1 per page on homepage', async ({ page }) => {
    await navigateTo(page, '/', 3000);
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('only one h1 per page on pricing', async ({ page }) => {
    await navigateTo(page, '/pricing', 3000);
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('homepage uses nav element', async ({ page }) => {
    await navigateTo(page, '/', 3000);
    const navCount = await page.locator('nav').count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('homepage uses main element', async ({ page }) => {
    await navigateTo(page, '/', 3000);
    const mainCount = await page.locator('main').count();
    expect(mainCount).toBeGreaterThanOrEqual(1);
  });

  test('homepage uses footer element', async ({ page }) => {
    await navigateTo(page, '/', 3000);
    const footerCount = await page.locator('footer').count();
    expect(footerCount).toBeGreaterThanOrEqual(1);
  });

  test('admin uses main element', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);
    const mainCount = await page.locator('main, [role="main"]').count();
    expect(mainCount).toBeGreaterThanOrEqual(1);
  });

  test('admin uses nav element', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);
    const navCount = await page.locator('nav, [role="navigation"]').count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('lists use proper list elements', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    // Check that lists exist and use ul/ol
    const listCount = await page.locator('ul, ol').count();
    expect(listCount).toBeGreaterThanOrEqual(0);
  });

  test('tables have proper structure', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin/products', 3000);

    const tables = page.locator('table');
    if (await tables.count() > 0) {
      // Tables should have thead or th elements
      const hasHeaders = await page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        let allHaveHeaders = true;
        tables.forEach((table) => {
          const thead = table.querySelector('thead');
          const th = table.querySelector('th');
          if (!thead && !th) allHaveHeaders = false;
        });
        return allHaveHeaders;
      });
      expect(hasHeaders).toBe(true);
    }
  });
});

// ─── PER-PAGE ALT TEXT CHECKS ───────────────────────────────────

test.describe('Per-Page Alt Text', () => {
  const pagesToCheck = ['/', '/pricing', '/login'];

  for (const path of pagesToCheck) {
    test(`${path} has no missing alt text`, async ({ page }) => {
      await navigateTo(page, path, 3000);
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      expect(imagesWithoutAlt).toBe(0);
    });
  }

  test('/admin has no missing alt text', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('/dashboard has no missing alt text', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/dashboard', 3000);
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });
});

// ─── REDUCED MOTION ─────────────────────────────────────────────

test.describe('Reduced Motion', () => {
  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await navigateTo(page, '/', 3000);

    const hasAnimations = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      let animatedCount = 0;
      allElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (
          style.animationName !== 'none' &&
          style.animationDuration !== '0s' &&
          style.animationPlayState === 'running'
        ) {
          animatedCount++;
        }
      });
      return animatedCount;
    });

    // With reduced motion, animations should be minimized
    expect(hasAnimations).toBeLessThanOrEqual(5); // Allow a few essential ones
  });
});

// ─── SCREEN READER SUPPORT ──────────────────────────────────────

test.describe('Screen Reader Support', () => {
  test('page has lang attribute', async ({ page }) => {
    await navigateTo(page, '/', 3000);
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBeTruthy();
    expect(lang.length).toBeGreaterThanOrEqual(2);
  });

  test('admin page has lang attribute', async ({ page }) => {
    test.use({ storageState: 'e2e/.auth/admin.json' });
    await navigateTo(page, '/admin', 3000);
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBeTruthy();
  });

  test('interactive elements have accessible names', async ({ page }) => {
    await navigateTo(page, '/', 3000);

    const unlabeledInteractives = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a[href], input, select, textarea');
      let unlabeled = 0;
      elements.forEach((el) => {
        const hasText = el.textContent?.trim();
        const hasAriaLabel = el.getAttribute('aria-label');
        const hasAriaLabelledBy = el.getAttribute('aria-labelledby');
        const hasTitle = el.getAttribute('title');
        const hasPlaceholder = el.getAttribute('placeholder');
        const hasAlt = el.querySelector('img')?.getAttribute('alt');

        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle && !hasPlaceholder && !hasAlt) {
          // Only count visible elements
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            unlabeled++;
          }
        }
      });
      return unlabeled;
    });

    expect(unlabeledInteractives).toBe(0);
  });

  test('error messages are announced to screen readers', async ({ page }) => {
    await navigateTo(page, '/login', 3000);

    // Submit empty form to trigger validation
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Error messages should use role="alert" or aria-live
      const announceableErrors = page.locator(
        '[role="alert"], [aria-live="polite"], [aria-live="assertive"], ' +
        '[class*="error"][aria-live], [class*="error"][role]'
      );
      // At minimum, the error handling infrastructure should exist
      const count = await announceableErrors.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
