# tests/e2e/test_user_mistakes.py
"""Сценарии «тупости» пользователя: пустые поля, мусор в URL, двойные клики, несуществующие сущности."""
from __future__ import annotations

import re

from playwright.sync_api import Page, expect

from helpers import (
    ADMIN_PASSWORD,
    CLIENT_EMAIL,
    DEMO_PASSWORD,
    PROFILE_LANDING_URL_RE,
    SPECIALIST_SLUG,
    fill_login_form,
    login_and_wait_redirect,
    submit_login,
)


def test_login_empty_fields_submit_disabled(page: Page) -> None:
    """Пользователь не ввёл почту/пароль — кнопка входа не должна отправлять форму."""
    page.goto("/login")
    page.get_by_label("Email").fill("")
    page.get_by_label("Пароль").fill("")
    expect(page.get_by_role("button", name="Войти")).to_be_disabled(timeout=5_000)


def test_login_whitespace_only_email_submit_disabled(page: Page) -> None:
    """Только пробелы в email — как пусто, кнопка неактивна."""
    page.goto("/login")
    page.get_by_label("Email").fill("   \t  ")
    page.get_by_label("Пароль").fill("123456")
    expect(page.get_by_role("button", name="Войти")).to_be_disabled(timeout=5_000)


def test_login_nonexistent_email_shows_error(page: Page) -> None:
    """Выдуманный ящик — предсказуемая ошибка, без падения страницы."""
    fill_login_form(page, "nobody-ever-exists-xyz@invalid.local", "any-password", as_specialist=False)
    submit_login(page)
    expect(page.get_by_text("Неверный логин или пароль.")).to_be_visible(timeout=20_000)


def test_login_email_with_extra_spaces_still_works(page: Page) -> None:
    """Пользователь копипастит email с пробелами — trim на бэкенде/mock, вход успешен."""
    page.goto("/login")
    page.get_by_label("Email").fill(f"  {CLIENT_EMAIL}  ")
    page.get_by_label("Пароль").fill(DEMO_PASSWORD)
    page.locator('form input[type="checkbox"]').uncheck()
    submit_login(page)
    expect(page).to_have_url(PROFILE_LANDING_URL_RE, timeout=20_000)


def test_login_double_click_submit_still_lands_once(page: Page) -> None:
    """Двойной клик «Войти» — один успешный редирект на профиль, без «мигания» ошибок."""
    fill_login_form(page, CLIENT_EMAIL, DEMO_PASSWORD, as_specialist=False)
    btn = page.get_by_role("button", name="Войти")
    btn.click(click_count=2, delay=50)
    expect(page).to_have_url(PROFILE_LANDING_URL_RE, timeout=20_000)
    expect(page.get_by_text("Неверный логин или пароль.")).not_to_be_visible()


def test_login_password_with_sqlish_garbage_shows_error_not_crash(page: Page) -> None:
    """«Шуточный» пароль с кавычками — обычная ошибка входа, приложение живо."""
    garbage = "'; DROP TABLE users; --"
    fill_login_form(page, CLIENT_EMAIL, garbage, as_specialist=False)
    submit_login(page)
    expect(page.get_by_text("Неверный логин или пароль.")).to_be_visible(timeout=20_000)


def test_specialist_profile_random_slug_shows_not_found(page: Page) -> None:
    """Случайный slug в URL — дружелюбное «Профиль не найден»."""
    page.goto("/specialists/this-specialist-does-not-exist-99999")
    expect(page.get_by_role("heading", name="Профиль не найден")).to_be_visible(timeout=20_000)


def test_post_random_id_shows_not_found(page: Page) -> None:
    """Несуществующий id поста."""
    page.goto("/posts/nonexistent-post-id-xyz")
    expect(page.get_by_text("Пост не найден", exact=False)).to_be_visible(timeout=20_000)


def test_shop_random_product_slug_shows_error_state(page: Page) -> None:
    """Выдуманный slug товара — экран ошибки, ссылка в каталог."""
    page.goto("/shop/totally-fake-product-slug-12345")
    expect(page.get_by_role("heading", name="Не удалось открыть товар")).to_be_visible(
        timeout=20_000,
    )


def test_guest_opens_profile_redirects_to_login(page: Page) -> None:
    """Неавторизованный лезет в /profile — на логин."""
    page.goto("/profile")
    expect(page).to_have_url(re.compile(r".*/login"), timeout=20_000)


def test_guest_opens_shop_orders_page_renders(page: Page) -> None:
    """Гость открывает /shop/orders — страница публичная, без белого экрана и без принудительного логина."""
    page.goto("/shop/orders")
    expect(page).to_have_url(re.compile(r".*/shop/orders"), timeout=20_000)
    expect(page.get_by_role("heading", name="Заказы магазина")).to_be_visible(
        timeout=20_000,
    )


def test_services_page_tolerates_nonsense_service_query(page: Page) -> None:
    """Битый ?service= в URL не ломает страницу поиска."""
    page.goto("/services?service=not_a_real_service_id")
    expect(page.get_by_text("Найдено", exact=False).first).to_be_visible(timeout=20_000)


def test_posts_page_tolerates_garbage_tag_query(page: Page) -> None:
    """Несуществующий тег — пустой список или сообщение, без белого экрана."""
    page.goto("/posts?tag=________________________________")
    expect(page.get_by_role("heading", name="Посты и новости")).to_be_visible(timeout=20_000)


def test_admin_login_with_client_password_fails(page: Page) -> None:
    """Пользователь путает пароль клиента и пароль админа."""
    fill_login_form(page, "admin@tailly.local", DEMO_PASSWORD, as_specialist=False)
    submit_login(page)
    expect(page.get_by_text("Неверный логин или пароль.")).to_be_visible(timeout=20_000)


def test_admin_correct_password_after_wrong_attempt_succeeds(page: Page) -> None:
    """Сначала неверный пароль, затем верный — доезжаем в админку."""
    page.goto("/login")
    fill_login_form(page, "admin@tailly.local", "wrong-on-purpose", as_specialist=False)
    submit_login(page)
    expect(page.get_by_text("Неверный логин или пароль.")).to_be_visible(timeout=20_000)
    page.get_by_label("Пароль").fill(ADMIN_PASSWORD)
    submit_login(page)
    expect(page).to_have_url(re.compile(r".*/admin$"), timeout=20_000)


def test_known_specialist_slug_still_works(page: Page) -> None:
    """Контроль: валидный slug после тестов с мусором всё ещё открывается (имя в h1)."""
    page.goto(f"/specialists/{SPECIALIST_SLUG}")
    expect(page.get_by_role("heading", name="Мария", exact=False).first).to_be_visible(
        timeout=20_000,
    )


def test_login_back_button_from_login_goes_home(page: Page) -> None:
    """Пользователь передумал — «Назад» с формы логина на главную."""
    page.goto("/login")
    page.get_by_role("button", name="← Назад").click()
    expect(page.get_by_text("Услуги", exact=False).first).to_be_visible(timeout=10_000)


def test_guest_shop_cart_redirects_to_login(page: Page) -> None:
    """Гость открывает корзину — только после входа."""
    page.goto("/shop/cart")
    expect(page).to_have_url(re.compile(r".*/login"), timeout=20_000)


def test_guest_admin_dashboard_redirects_to_login(page: Page) -> None:
    """Гость пытается зайти в /admin — на общий логин."""
    page.goto("/admin")
    expect(page).to_have_url(re.compile(r".*/login"), timeout=20_000)


def test_forgot_password_empty_submit_shows_validation(page: Page) -> None:
    """Отправка пустой формы восстановления — явная подсказка, без «тихого» успеха."""
    page.goto("/forgot-password")
    page.get_by_role("button", name="Продолжить").click()
    expect(page.get_by_text("Введите email.", exact=False)).to_be_visible(timeout=10_000)


def test_register_client_password_mismatch_shows_error(page: Page) -> None:
    """Пользователь вводит разные пароли на шаге 1 регистрации клиента."""
    page.goto("/register/client")
    page.get_by_placeholder("Email").fill("new-user-mismatch@example.com")
    page.get_by_placeholder("Пароль", exact=True).fill("secret123456")
    page.get_by_placeholder("Повторите пароль").fill("secret654321")
    page.locator('input[type="checkbox"]').check()
    page.get_by_role("button", name="Продолжить").click()
    expect(page.get_by_text("Пароли не совпадают", exact=False)).to_be_visible(
        timeout=10_000,
    )


def test_register_client_short_password_shows_error(page: Page) -> None:
    """Слишком короткий пароль — валидация до запроса на сервер."""
    page.goto("/register/client")
    page.get_by_placeholder("Email").fill("new-user-short@example.com")
    page.get_by_placeholder("Пароль", exact=True).fill("12")
    page.get_by_placeholder("Повторите пароль").fill("12")
    page.locator('input[type="checkbox"]').check()
    page.get_by_role("button", name="Продолжить").click()
    expect(page.get_by_text("минимум 6 символов", exact=False)).to_be_visible(
        timeout=10_000,
    )


def test_services_empty_service_query_still_renders(page: Page) -> None:
    """Пустой ?service= не ломает страницу поиска."""
    page.goto("/services?service=")
    expect(page.get_by_text("Найдено", exact=False).first).to_be_visible(timeout=20_000)


def test_shop_checkout_without_items_guest_redirects(page: Page) -> None:
    """Гость жмёт «оформить» без корзины / без входа — уходит на логин (или защищённый поток)."""
    page.goto("/shop/checkout")
    expect(page).to_have_url(re.compile(r".*/login"), timeout=20_000)
