# tests/e2e/nonfunctional_helpers.py
from __future__ import annotations

import time
from typing import Any

from playwright.sync_api import Page


def horizontal_overflow_px(page: Page) -> int:
    """Разница между шириной контента и видимой областью (0 = нет горизонтального скролла)."""
    return int(
        page.evaluate(
            """() => {
            const el = document.documentElement;
            return Math.max(0, el.scrollWidth - el.clientWidth);
        }""",
        ),
    )


def navigation_dom_content_loaded_ms(page: Page) -> float | None:
    """Время domContentLoaded для последней полной навигации (PerformanceNavigationTiming)."""
    raw: Any = page.evaluate(
        """() => {
        const entries = performance.getEntriesByType('navigation');
        const e = entries[0];
        if (!e || e.domContentLoadedEventEnd <= 0) {
            return null;
        }
        return e.domContentLoadedEventEnd - e.startTime;
    }""",
    )
    return float(raw) if raw is not None else None


def goto_with_timing_ms(page: Page, path: str, *, wait_until: str = "load") -> float:
    """Полное время ответа страницы по wall-clock (удобно для SPA и dev-сервера)."""
    started = time.perf_counter()
    page.goto(path, wait_until=wait_until)
    return (time.perf_counter() - started) * 1000.0


def count_images_missing_alt(page: Page) -> int:
    return int(
        page.evaluate(
            """() => {
            return [...document.images].filter(
                (img) => !img.alt || img.alt.trim() === '',
            ).length;
        }""",
        ),
    )
