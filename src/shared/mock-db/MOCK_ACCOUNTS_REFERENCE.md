# Справочник демо-аккаунтов (mock)

Единый источник: [`seed/accounts.seed.ts`](seed/accounts.seed.ts)

## Пароли

| Роль | Пароль | Константа |
|------|--------|-----------|
| Клиенты | `12345678` | `DEMO_CLIENT_PASSWORD` |
| Специалисты | `12345678` | `DEMO_SPECIALIST_PASSWORD` |
| Администраторы | `Admin123!` | `DEMO_ADMIN_PASSWORD` |
| Главный администратор | `SuperAdmin123!` | `DEMO_SUPER_ADMIN_PASSWORD` |

## Клиенты (8)

| Email | ID | Заказы |
|-------|-----|--------|
| client@tailly.local | client-1 | много |
| client02@tailly.local | client-2 | много |
| client03@tailly.local | client-3 | много |
| client04@tailly.local | client-4 | много |
| client05@tailly.local | client-5 | много |
| client06@tailly.local | client-6 | много |
| client07@tailly.local | client-7 | **0** |
| client08@tailly.local | client-8 | **1** |

Пароль для всех: `12345678`

## Специалисты (10)

| Email | ID | Dual client+specialist |
|-------|-----|------------------------|
| specialist@tailly.local | specialist-1 | да |
| specialist02@tailly.local | specialist-2 | да |
| specialist03@ … specialist10@ | specialist-3 … specialist-10 | нет |

Пароль: `12345678`

## Администраторы (6 + суперадмин)

| Email | Роль |
|-------|------|
| admin@tailly.local | admin |
| admin02@ … admin06@tailly.local | admin |
| superadmin@tailly.local | super_admin |

Пароли: `Admin123!` (админы), `SuperAdmin123!` (суперадмин)
