# tests/e2e/test_shop_flow.py
from __future__ import annotations

import re

from playwright.sync_api import Page, expect

from helpers import (
    ADMIN_EMAIL,
    CLIENT_EMAIL,
    DEMO_PASSWORD,
    login_and_wait_redirect,
    PROFILE_LANDING_URL_RE,
)


def test_guest_shop_cart_redirects_to_login(page: Page) -> None:
    page.goto("/shop/cart")
    expect(page).to_have_url(re.compile(r".*/login.*"), timeout=20_000)


def test_client_shop_cart_opens(page: Page) -> None:
    login_and_wait_redirect(
        page,
        CLIENT_EMAIL,
        DEMO_PASSWORD,
        as_specialist=False,
        url_matcher=PROFILE_LANDING_URL_RE,
    )
    page.goto("/shop/cart")
    expect(page.locator("h1").filter(has_text="Корзина").first).to_be_visible(
        timeout=20_000,
    )
    expect(page.get_by_text("Корзина пуста")).to_be_visible()


def test_admin_cannot_open_shop_cart(page: Page) -> None:
    login_and_wait_redirect(
        page,
        ADMIN_EMAIL,
        DEMO_PASSWORD,
        as_specialist=False,
        url_matcher=re.compile(r".*/admin$"),
    )
    page.goto("/shop/cart")
    expect(page).to_have_url(re.compile(r".*/admin$"), timeout=20_000)
