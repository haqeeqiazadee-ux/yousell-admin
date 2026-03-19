"""Firecrawl API scraping module with requests.get fallback."""

import asyncio
import logging
import os
import re

import requests
from bs4 import BeautifulSoup

from utils.retry import retry_async

logger = logging.getLogger("gap_analyzer")

FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape"

PAGE_PATHS = {
    "homepage": ["/"],
    "features": ["/features", "/product", "/platform", "/solutions"],
    "pricing": ["/pricing", "/plans", "/packages"],
    "about": ["/about", "/about-us", "/company"],
    "customers": ["/customers", "/case-studies", "/testimonials"],
    "blog": ["/blog", "/resources", "/insights"],
    "integrations": ["/integrations", "/apps", "/marketplace"],
}

MAX_CHARS_PER_PAGE = 3500
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


class FirecrawlScraper:
    """Scrapes company pages using Firecrawl API with requests fallback."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("FIRECRAWL_API_KEY", "")
        self._semaphore = asyncio.Semaphore(1)
        self._last_call_time = 0.0

    async def _rate_limit(self):
        """Ensure minimum 0.8s between Firecrawl API calls."""
        async with self._semaphore:
            now = asyncio.get_event_loop().time()
            elapsed = now - self._last_call_time
            if elapsed < 0.8:
                await asyncio.sleep(0.8 - elapsed)
            self._last_call_time = asyncio.get_event_loop().time()

    @retry_async(max_retries=3, base_delay=2.0)
    async def _scrape_firecrawl(self, url: str) -> str:
        """Scrape a single URL via Firecrawl API."""
        if not self.api_key:
            raise ValueError("No Firecrawl API key configured")

        await self._rate_limit()

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        payload = {
            "url": url,
            "formats": ["markdown"],
            "onlyMainContent": True,
            "waitFor": 1500,
            "timeout": 35000,
        }

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: requests.post(
                FIRECRAWL_API_URL,
                json=payload,
                headers=headers,
                timeout=40,
            ),
        )

        if response.status_code == 429:
            raise Exception("Rate limited (429)")
        response.raise_for_status()

        data = response.json()
        if not data.get("success"):
            return ""

        content = data.get("data", {}).get("markdown", "")
        return content[:MAX_CHARS_PER_PAGE] if content else ""

    async def _scrape_requests_fallback(self, url: str) -> str:
        """Fallback: scrape with requests + BeautifulSoup."""
        loop = asyncio.get_event_loop()

        def _fetch():
            try:
                resp = requests.get(
                    url,
                    headers={"User-Agent": USER_AGENT},
                    timeout=20,
                    allow_redirects=True,
                )
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "lxml")
                for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
                    tag.decompose()
                text = soup.get_text(separator="\n", strip=True)
                # Collapse blank lines
                text = re.sub(r"\n{3,}", "\n\n", text)
                return text[:MAX_CHARS_PER_PAGE]
            except Exception as e:
                logger.warning(f"[WARN] Requests fallback failed for {url}: {e}")
                return ""

        return await loop.run_in_executor(None, _fetch)

    async def scrape_company(self, base_url: str) -> dict:
        """Scrape all pages for a company. Returns dict of page_name -> content."""
        base_url = base_url.rstrip("/")
        results = {}
        pages_scraped = []
        pages_failed = []

        for page_name, paths in PAGE_PATHS.items():
            content = ""
            tried_url = ""

            for path in paths:
                tried_url = f"{base_url}{path}"
                try:
                    content = await self._scrape_firecrawl(tried_url)
                    if content and len(content.strip()) > 50:
                        break
                except Exception as e:
                    logger.debug(f"Firecrawl failed for {tried_url}: {e}")
                    content = ""

            # Fallback to requests if Firecrawl returned empty
            if not content or len(content.strip()) < 50:
                fallback_url = f"{base_url}{paths[0]}"
                content = await self._scrape_requests_fallback(fallback_url)
                if content:
                    logger.info(
                        f"[DECISION] [{base_url}] Requests fallback used for {page_name} — "
                        "Firecrawl returned empty"
                    )

            if content and len(content.strip()) > 50:
                results[page_name] = content
                pages_scraped.append(page_name)
            else:
                pages_failed.append(page_name)

        return {
            "content": results,
            "pages_scraped": pages_scraped,
            "pages_failed": pages_failed,
            "source": "firecrawl",
        }


def build_scraped_document(scrape_result: dict) -> str:
    """Combine all scraped pages into a single document with labels."""
    content = scrape_result.get("content", {})
    if not content:
        return ""

    sections = []
    for page_name, text in content.items():
        sections.append(f"══ PAGE: {page_name.upper()} ══\n{text}")

    return "\n\n".join(sections)
