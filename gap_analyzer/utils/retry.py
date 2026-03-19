"""Exponential backoff retry decorator."""

import asyncio
import functools
import logging

logger = logging.getLogger("gap_analyzer")


def retry_async(max_retries: int = 3, base_delay: float = 2.0, max_delay: float = 30.0):
    """Decorator for async functions with exponential backoff retry."""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries:
                        delay = min(base_delay * (2 ** attempt), max_delay)
                        logger.warning(
                            f"[RETRY] {func.__name__} attempt {attempt + 1}/{max_retries} "
                            f"failed: {e}. Retrying in {delay}s..."
                        )
                        await asyncio.sleep(delay)
                    else:
                        logger.error(
                            f"[FAILED] {func.__name__} failed after {max_retries + 1} attempts: {e}"
                        )
            raise last_exception
        return wrapper
    return decorator


def retry_sync(max_retries: int = 3, base_delay: float = 2.0, max_delay: float = 30.0):
    """Decorator for sync functions with exponential backoff retry."""
    import time

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries:
                        delay = min(base_delay * (2 ** attempt), max_delay)
                        logger.warning(
                            f"[RETRY] {func.__name__} attempt {attempt + 1}/{max_retries} "
                            f"failed: {e}. Retrying in {delay}s..."
                        )
                        time.sleep(delay)
                    else:
                        logger.error(
                            f"[FAILED] {func.__name__} failed after {max_retries + 1} attempts: {e}"
                        )
            raise last_exception
        return wrapper
    return decorator
