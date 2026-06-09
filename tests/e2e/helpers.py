# tests/e2e/helpers.py
from __future__ import annotations

import re
from typing import Pattern

from playwright.sync_api import Page, expect


CLIENT_EMAIL = "client@tailly.local"
SPECIALIST_EMAIL = "specialist@tailly.local"
ADMIN_EMAIL = "admin@tailly.local"
SUPERADMIN_EMAIL = "superadmin@tailly.local"
# Совпадает с DEMO_CLIENT_SPECIALIST_PASSWORD в mock-db
DEMO_PASSWORD = "12345678"
# Совпадает с DEMO_ADMIN_PANEL_PASSWORD / DEMO_SUPER_ADMIN_PANEL_PASSWORD (demoDataset.seed)
ADMIN_PASSWORD = "Admin123!"
SUPERADMIN_PASSWORD = "SuperAdmin123!"

SPECIALIST_SLUG = "maria-ivanova"

PROFILE_LANDING_URL_RE = re.compile(r".*/profile$")
ADMIN_LANDING_URL_RE = re.compile(r".*/admin$")
SPECIALIST_LANDING_URL_RE = re.compile(rf".*/specialists/{SPECIALIST_SLUG}$")


def fill_login_form(
    page: Page,
    email: str,
    password: str,
    *,
    as_specialist: bool,
) -> None:
    page.goto("/login")
    page.get_by_label("Email").fill(email)
    page.get_by_label("Пароль").fill(password)
    checkbox = page.locator('form input[type="checkbox"]')
    if as_specialist:
        checkbox.check()
    else:
        checkbox.uncheck()


def submit_login(page: Page) -> None:
    page.get_by_role("button", name="Войти").click()


def login_and_wait_redirect(
    page: Page,
    email: str,
    password: str,
    *,
    as_specialist: bool,
    url_matcher: str | Pattern[str],
) -> None:
    fill_login_form(page, email, password, as_specialist=as_specialist)
    submit_login(page)
    expect(page).to_have_url(url_matcher, timeout=20_000)
