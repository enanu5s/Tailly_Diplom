# tests/e2e/test_auth.py
from __future__ import annotations

import re

from playwright.sync_api import Page, expect

from helpers import (
    ADMIN_LANDING_URL_RE,
    ADMIN_PASSWORD,
    CLIENT_EMAIL,
    DEMO_PASSWORD,
    PROFILE_LANDING_URL_RE,
    SPECIALIST_EMAIL,
    SPECIALIST_LANDING_URL_RE,
    fill_login_form,
    login_and_wait_redirect,
    submit_login,
)


def test_login_invalid_password_shows_error(page: Page) -> None:
    fill_login_form(page, CLIENT_EMAIL, "wrong-password", as_specialist=False)
    submit_login(page)
    expect(page.get_by_text("Неверный логин или пароль.")).to_be_visible(
        timeout=20_000,
    )


def test_login_client_wrong_role_checkbox_shows_error(page: Page) -> None:
    fill_login_form(page, CLIENT_EMAIL, DEMO_PASSWORD, as_specialist=True)
    submit_login(page)
    expect(
        page.get_by_text("Этот аккаунт не зарегистрирован как специалист."),
    ).to_be_visible(timeout=20_000)


def test_login_client_success(page: Page) -> None:
    login_and_wait_redirect(
        page,
        CLIENT_EMAIL,
        DEMO_PASSWORD,
        as_specialist=False,
        url_matcher=PROFILE_LANDING_URL_RE,
    )


def test_login_specialist_success(page: Page) -> None:
    login_and_wait_redirect(
        page,
        SPECIALIST_EMAIL,
        DEMO_PASSWORD,
        as_specialist=True,
        url_matcher=SPECIALIST_LANDING_URL_RE,
    )


def test_login_admin_success(page: Page) -> None:
    login_and_wait_redirect(
        page,
        "admin@tailly.local",
        ADMIN_PASSWORD,
        as_specialist=False,
        url_matcher=ADMIN_LANDING_URL_RE,
    )


def test_admin_forgot_password_page(page: Page) -> None:
    page.goto("/admin/forgot-password")
    expect(page.get_by_text("Восстановление", exact=False)).to_be_visible(
        timeout=20_000,
    )


def test_restore_account_token_route_loads(page: Page) -> None:
    page.goto("/account/restore/demo-token-123")
    expect(page).to_have_url(re.compile(r"/account/restore/"))
