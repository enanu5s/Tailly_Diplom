# tests/e2e/test_role_areas.py
from __future__ import annotations

import re

from playwright.sync_api import Page, expect

from helpers import (
    ADMIN_LANDING_URL_RE,
    ADMIN_PASSWORD,
    CLIENT_EMAIL,
    DEMO_PASSWORD,
    SPECIALIST_SLUG,
    SUPERADMIN_EMAIL,
    SUPERADMIN_PASSWORD,
    login_and_wait_redirect,
    PROFILE_LANDING_URL_RE,
    SPECIALIST_LANDING_URL_RE,
)


def test_client_account_delete_page_opens(page: Page) -> None:
    login_and_wait_redirect(
        page,
        CLIENT_EMAIL,
        DEMO_PASSWORD,
        as_specialist=False,
        url_matcher=PROFILE_LANDING_URL_RE,
    )
    page.goto("/account/delete")
    expect(page.get_by_role("heading", name="Удаление аккаунта")).to_be_visible(
        timeout=20_000,
    )


def test_client_profile_and_booking_and_messages(page: Page) -> None:
    login_and_wait_redirect(
        page,
        CLIENT_EMAIL,
        DEMO_PASSWORD,
        as_specialist=False,
        url_matcher=PROFILE_LANDING_URL_RE,
    )
    expect(page.get_by_role("heading", name="Основные данные")).to_be_visible(
        timeout=20_000,
    )

    page.goto("/profile/security/email")
    expect(page.get_by_role("heading", name="Смена почты")).to_be_visible(
        timeout=20_000,
    )

    page.goto(f"/specialists/{SPECIALIST_SLUG}")
    order_btn = page.get_by_role("button", name="Оформить заказ")
    expect(order_btn).to_be_visible(timeout=20_000)
    order_btn.click()
    expect(page).to_have_url(re.compile(r"/service-booking"), timeout=20_000)
    expect(page.get_by_text("Оформление заказа")).to_be_visible(timeout=20_000)

    page.goto("/messages")
    expect(page.get_by_text("Чаты")).to_be_visible(timeout=20_000)


def test_client_specialist_owner_routes_forbidden(page: Page) -> None:
    login_and_wait_redirect(
        page,
        CLIENT_EMAIL,
        DEMO_PASSWORD,
        as_specialist=False,
        url_matcher=PROFILE_LANDING_URL_RE,
    )
    page.goto(f"/specialists/{SPECIALIST_SLUG}/calendar/edit")
    expect(page.get_by_text("Услуги").first).to_be_visible(timeout=15_000)


def test_specialist_orders_page_opens(page: Page) -> None:
    login_and_wait_redirect(
        page,
        "specialist@tailly.local",
        DEMO_PASSWORD,
        as_specialist=True,
        url_matcher=SPECIALIST_LANDING_URL_RE,
    )
    page.goto(f"/specialists/{SPECIALIST_SLUG}/orders")
    expect(page.locator("h1").filter(has_text="Заказы клиентов")).to_be_visible(
        timeout=20_000,
    )


def test_specialist_calendar_edit_opens(page: Page) -> None:
    login_and_wait_redirect(
        page,
        "specialist@tailly.local",
        DEMO_PASSWORD,
        as_specialist=True,
        url_matcher=SPECIALIST_LANDING_URL_RE,
    )
    page.goto(f"/specialists/{SPECIALIST_SLUG}/calendar/edit")
    expect(page).to_have_url(
        re.compile(rf".*/specialists/{SPECIALIST_SLUG}/calendar/edit"),
        timeout=20_000,
    )


def test_admin_dashboard_and_sections(page: Page) -> None:
    login_and_wait_redirect(
        page,
        "admin@tailly.local",
        ADMIN_PASSWORD,
        as_specialist=False,
        url_matcher=ADMIN_LANDING_URL_RE,
    )
    expect(page.get_by_text("Профиль администратора")).to_be_visible()

    page.goto("/admin/moderation/specialists")
    expect(page).to_have_url(re.compile(r".*/admin/moderation/specialists"))

    page.goto("/admin/users")
    expect(page).to_have_url(re.compile(r".*/admin/users"))

    page.goto("/admin/posts")
    expect(page).to_have_url(re.compile(r".*/admin/posts"))


def test_super_admin_extra_routes(page: Page) -> None:
    login_and_wait_redirect(
        page,
        SUPERADMIN_EMAIL,
        SUPERADMIN_PASSWORD,
        as_specialist=False,
        url_matcher=ADMIN_LANDING_URL_RE,
    )
    page.goto("/super-admin/admins")
    expect(page).to_have_url(re.compile(r".*/super-admin/admins"))
    expect(page.get_by_text("Управление администраторами")).to_be_visible(
        timeout=20_000,
    )

    page.goto("/super-admin/password-recovery")
    expect(page).to_have_url(re.compile(r".*/super-admin/password-recovery"))
