# tests/e2e/test_nonfunctional.py
"""Нефункциональные проверки: адаптив, производительность загрузки, базовая a11y, документ."""
from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect, Locator

from nonfunctional_helpers import (
    count_images_missing_alt,
    goto_with_timing_ms,
    horizontal_overflow_px,
    navigation_dom_content_loaded_ms,
)

pytestmark = pytest.mark.nonfunctional

# Лимиты рассчитаны на dev-сервер (Vite); в CI при необходимости ослабьте или вынесите в env.
_MAX_FULL_LOAD_MS = 25_000.0
_MAX_HORIZONTAL_OVERFLOW_PX = 8


@pytest.mark.parametrize(
    "path",
    [
        "/",
        "/shop",
        "/login",
        "/services",
    ],
)
def test_mobile_viewport_no_horizontal_overflow(page: Page, path: str) -> None:
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(path)
    expect(page.locator("body")).to_be_visible(timeout=20_000)
    overflow = horizontal_overflow_px(page)
    assert overflow <= _MAX_HORIZONTAL_OVERFLOW_PX, (
        f"{path}: горизонтальный overflow {overflow}px при ширине 390px"
    )


@pytest.mark.parametrize(
    "path",
    [
        "/",
        "/shop",
        "/posts",
    ],
)
def test_full_page_load_wall_clock_under_limit(page: Page, path: str) -> None:
    elapsed = goto_with_timing_ms(page, path, wait_until="load")
    assert elapsed < _MAX_FULL_LOAD_MS, (
        f"{path}: load занял {elapsed:.0f}ms (лимит {_MAX_FULL_LOAD_MS:.0f}ms)"
    )


@pytest.mark.parametrize("path", ["/", "/shop"])
def test_dom_content_loaded_metric_available(page: Page, path: str) -> None:
    page.goto(path, wait_until="load")
    dcl = navigation_dom_content_loaded_ms(page)
    assert dcl is not None and dcl > 0, f"{path}: нет валидного domContentLoaded timing"


@pytest.mark.parametrize("path", ["/", "/shop", "/login"])
def test_initial_document_request_succeeds(page: Page, path: str) -> None:
    response = page.goto(path, wait_until="commit")
    assert response is not None and response.ok, (
        f"{path}: HTTP {getattr(response, 'status', '?')}"
    )


def test_html_element_has_lang(page: Page) -> None:
    page.goto("/")
    lang = page.locator("html").get_attribute("lang")
    assert lang and lang.strip(), "У корневого <html> должен быть непустой атрибут lang"


def test_document_title_not_empty(page: Page) -> None:
    page.goto("/login")
    title = page.title()
    assert title and title.strip(), "document.title не должен быть пустым"


def test_viewport_meta_allows_mobile_scale(page: Page) -> None:
    page.goto("/")
    viewport = page.locator('meta[name="viewport"]')
    expect(viewport).to_have_count(1)
    content = viewport.get_attribute("content")
    assert content and "width" in content.lower()


def test_main_landmark_present_on_layout_routes(page: Page) -> None:
    page.goto("/")
    expect(page.get_by_role("main")).to_be_visible(timeout=20_000)


def _input_has_accessible_name(page: Page, inp: Locator) -> bool:
    aria = inp.get_attribute("aria-label")
    if aria and aria.strip():
        return True
    id_attr = inp.get_attribute("id")
    if id_attr and page.locator(f'label[for="{id_attr}"]').count() > 0:
        return True
    wrapped = inp.evaluate(
        """(el) => {
            let p = el.parentElement;
            while (p) {
                if (p.tagName === 'LABEL') return true;
                p = p.parentElement;
            }
            return false;
        }""",
    )
    return bool(wrapped)


@pytest.mark.parametrize(
    "path",
    [
        "/login",
        "/forgot-password",
    ],
)
def test_key_forms_use_labels_or_aria(page: Page, path: str) -> None:
    page.goto(path)
    inputs = page.locator(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
    )
    count = inputs.count()
    if count == 0:
        return
    for i in range(min(count, 6)):
        inp = inputs.nth(i)
        expect(inp).to_be_visible()
        if _input_has_accessible_name(page, inp):
            continue
        pytest.fail(
            f"{path}: поле ввода #{i} без доступного имени "
            "(aria-label, label[for] или вложенность в <label>)",
        )


def test_shop_catalog_images_have_alt_text(page: Page) -> None:
    page.goto("/shop")
    expect(page.get_by_text("Магазин", exact=False).first).to_be_visible(
        timeout=20_000,
    )
    missing = count_images_missing_alt(page)
    assert missing == 0, f"На /shop найдено {missing} <img> без непустого alt"


def test_login_email_reachable_via_tab(page: Page) -> None:
    page.goto("/login")
    email = page.get_by_label("Email")
    expect(email).to_be_visible(timeout=10_000)
    for _ in range(14):
        if email.evaluate("el => el === document.activeElement"):
            return
        page.keyboard.press("Tab")
    pytest.fail("Поле Email не получило фокус за разумное число нажатий Tab")
