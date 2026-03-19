"""URL and domain normalisation utilities."""

import re
from urllib.parse import urlparse


def normalise_url(url: str) -> str:
    """Ensure URL has https://, strip trailing slash, lowercase."""
    if not url or not isinstance(url, str):
        return ""
    url = url.strip()
    if not url:
        return ""
    if not re.match(r"https?://", url, re.IGNORECASE):
        url = "https://" + url
    url = url.rstrip("/")
    parsed = urlparse(url)
    return f"{parsed.scheme.lower()}://{parsed.netloc.lower()}{parsed.path}"


def extract_domain(url: str) -> str:
    """Extract bare domain from URL, stripping www. prefix."""
    url = normalise_url(url)
    if not url:
        return ""
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def is_valid_url(url: str) -> bool:
    """Check if a string is a plausibly valid URL."""
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    if not url:
        return False
    normalised = normalise_url(url)
    parsed = urlparse(normalised)
    return bool(parsed.netloc) and "." in parsed.netloc
