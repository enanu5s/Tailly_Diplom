# tests/e2e/test_public_routes.py
from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

from helpers import SPECIALIST_SLUG


@pytest.mark.parametrize(
    ("path", "text"),
    [
        ("/", "Услуги"),
        ("/about", "О нас"),
        ("/services", "специалистов"),
        ("/posts", "Посты и новости"),
        ("/posts/admin-post-1", "передержке"),
        ("/shop", "Магазин Tailly"),
        ("/login", "Вход в аккаунт"),
        ("/register", "Регистрация"),
        ("/register/client", "Регистрация клиента"),
        ("/forgot-password", "Восстановление пароля"),
        ("/become-specialist", "Заполнить форму"),
        ("/become-specialist/form", "анкет"),
        ("/privacy-policy", "Политика"),
        ("/user-agreement", "Пользовательск"),
        ("/public-offer", "оферт"),
        ("/refund-policy", "возврат"),
        ("/agency-contract", "Агентский"),
        (f"/specialists/{SPECIALIST_SLUG}", "Мария"),
        ("/shop/cat-food-premium-salmon", "лососем"),
    ],
)
def test_public_page_renders_key_content(page: Page, path: str, text: str) -> None:
    page.goto(path)
    expect(page.get_by_text(text, exact=False).first).to_be_visible(timeout=20_000)


def test_unknown_route_shows_not_found(page: Page) -> None:
    page.goto("/this-route-should-not-exist-xyz")
    expect(page.get_by_text("Страница не найдена")).to_be_visible()


def test_shop_orders_visible_for_guest(page: Page) -> None:
    page.goto("/shop/orders")
    expect(page.get_by_role("heading", name="Заказы из магазина")).to_be_visible(
        timeout=20_000,
    )
