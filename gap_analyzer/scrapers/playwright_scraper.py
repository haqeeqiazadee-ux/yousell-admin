"""Playwright headless browser scraping module."""

import asyncio
import logging

logger = logging.getLogger("gap_analyzer")

MAX_CHARS = 4000
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


class PlaywrightScraper:
    """Scrapes pages using headless Chromium for JS-heavy sites."""

    def __init__(self):
        self._browser = None
        self._playwright = None

    async def _ensure_browser(self):
        """Launch browser if not already running."""
        if self._browser is None:
            try:
                from playwright.async_api import async_playwright
                self._playwright = await async_playwright().start()
                self._browser = await self._playwright.chromium.launch(headless=True)
            except Exception as e:
                logger.error(f"[ERROR] Failed to launch Playwright browser: {e}")
                raise

    async def scrape_page(self, url: str) -> str:
        """Scrape a single page using Playwright. Returns body text."""
        try:
            await self._ensure_browser()
        except Exception:
            return ""

        page = None
        try:
            page = await self._browser.new_page(
                viewport={"width": 1280, "height": 800},
                user_agent=USER_AGENT,
            )
            await page.goto(url, wait_until="networkidle", timeout=25000)
            await asyncio.sleep(2)
            text = await page.inner_text("body")
            return text[:MAX_CHARS] if text else ""
        except Exception as e:
            logger.warning(f"[WARN] Playwright failed for {url}: {e}")
            # Return whatever partial text we got
            if page:
                try:
                    text = await page.inner_text("body")
                    return text[:MAX_CHARS] if text else ""
                except Exception:
                    pass
            return ""
        finally:
            if page:
                try:
                    await page.close()
                except Exception:
                    pass

    async def scrape_pages(self, urls: list[str]) -> dict[str, str]:
        """Scrape multiple URLs. Returns url -> content dict."""
        results = {}
        for url in urls:
            content = await self.scrape_page(url)
            if content:
                results[url] = content
        return results

    async def close(self):
        """Close the browser."""
        if self._browser:
            try:
                await self._browser.close()
            except Exception:
                pass
        if self._playwright:
            try:
                await self._playwright.stop()
            except Exception:
                pass
