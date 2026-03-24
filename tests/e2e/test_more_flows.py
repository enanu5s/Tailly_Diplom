# tests/e2e/test_more_flows.py
"""Дополнительные функциональные сценарии поверх test_auth / shop / roles."""
from __future__ import annotations

import re

from playwright.sync_api import Page, expect

from helpers import (
    CLIENT_EMAIL,
    DEMO_PASSWORD,
    PROFILE_LANDING_URL_RE,
    SPECIALIST_SLUG,
    login_and_wait_redirect,
)


def test_guest_admin_protected_route_redirects_to_login(page: Page) -> None:
    page.goto("/admin/users")
    expect(page).to_have_url(re.compile(r".*/login"), timeout=20_000)


def test_guest_super_admin_route_redirects_to_login(page: Page) -> None:
    page.goto("/super-admin/admins")
    expect(page).to_have_url(re.compile(r".*/login"), timeout=20_000)


def test_home_footer_shows_navigation_and_documents(page: Page) -> None:
    page.goto("/")
    expect(page.get_by_role("contentinfo")).to_be_visible(timeout=20_000)
    expect(page.get_by_role("heading", name="Навигация")).to_be_visible()
    expect(page.get_by_role("heading", name="Документы")).to_be_visible()


def test_register_client_page_shows_email_step(page: Page) -> None:
    page.goto("/register/client")
    expect(page.get_by_text("Регистрация клиента", exact=False).first).to_be_visible(
        timeout=20_000,
    )
    expect(page.get_by_placeholder("Email")).to_be_visible()


def test_product_page_guest_sees_add_to_cart(page: Page) -> None:
    page.goto("/shop/cat-food-premium-salmon")
    expect(page.get_by_role("button", name="В корзину")).to_be_visible(
        timeout=20_000,
    )


def test_client_shop_orders_has_search_and_filters(page: Page) -> None:
    login_and_wait_redirect(
        page,
        CLIENT_EMAIL,
        DEMO_PASSWORD,
        as_specialist=False,
        url_matcher=PROFILE_LANDING_URL_RE,
    )
    page.goto("/shop/orders")
    expect(page.get_by_role("heading", name="Заказы магазина")).to_be_visible(
        timeout=20_000,
    )
    expect(page.get_by_label("Поиск по номеру заказа")).to_be_visible()
    expect(page.get_by_role("button", name="Все")).to_be_visible()


def test_client_sees_booking_cta_on_specialist_profile(page: Page) -> None:
    login_and_wait_redirect(
        page,
        CLIENT_EMAIL,
        DEMO_PASSWORD,
        as_specialist=False,
        url_matcher=PROFILE_LANDING_URL_RE,
    )
    page.goto(f"/specialists/{SPECIALIST_SLUG}")
    expect(page.get_by_role("button", name="Оформить заказ")).to_be_visible(
        timeout=20_000,
    )


def test_services_page_loads_specialist_search(page: Page) -> None:
    page.goto("/services")
    expect(page.get_by_text("Найдено", exact=False).first).to_be_visible(
        timeout=20_000,
    )
    expect(page.get_by_text("специалистов", exact=False).first).to_be_visible()


def test_posts_list_page_has_heading(page: Page) -> None:
    page.goto("/posts")
    expect(page.get_by_role("heading", name="Посты и новости")).to_be_visible(
        timeout=20_000,
    )
