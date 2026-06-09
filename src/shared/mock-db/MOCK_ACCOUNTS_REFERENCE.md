# Справочник демо-аккаунтов (mock)

Все учётные данные для локальной демо-сборки задаются в коде сидов. Удобнее всего смотреть **первоисточники** ниже; пароли повторяются по ролям.

## Где в коде заданы логины и пароли

| Роль                                                                    | Файл                                                | Что смотреть                                                                                                                                                          |
| ----------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Клиенты, специалисты, админы и суперадмин для входа через **`/login`**  | `src/shared/mock-db/seed/authBaseAccounts.seed.ts`  | массив `CORE_AUTH_ACCOUNTS` + `SEED_AUTH_BASE_ACCOUNTS` (доп. клиенты/специалисты/админы из `demoDataset.seed.ts`)                                                    |
| Доп. шаблоны email и паролей для массовых клиентов/специалистов/админов | `src/shared/mock-db/seed/demoDataset.seed.ts`       | `DEMO_CLIENT_SPECIALIST_PASSWORD`, `DEMO_ADMIN_PANEL_PASSWORD`, функции `buildExtraClientAccounts`, `buildExtraSpecialistAuthAccounts`, `buildExtraAdminAuthAccounts` |
| Вход в **админ-панель** (отдельная форма админа)                        | `src/features/admin-auth/data/mockAdminAccounts.ts` | `MOCK_ADMIN_ACCOUNTS` + `buildExtraMockAdminPanelAccounts()` из `demoDataset.seed.ts`                                                                                 |
| Список администраторов для **суперадмина**                              | `src/shared/mock-db/seed/superAdminAdmins.seed.ts`  | `SEED_SUPER_ADMIN_ADMINS`                                                                                                                                             |

## Пароли (кратко)

- **Обычный вход (`/login`)** для клиентов, специалистов и админов из mock: пароль **`123456`** (константа `DEMO_CLIENT_SPECIALIST_PASSWORD` в `demoDataset.seed.ts`).
- **Админ-панель** (`mockAdminAccounts`): основной админ — **`Admin123!`**, суперадмин — **`SuperAdmin123!`**; дополнительные админы `admin02@tailly.local` … — **`Admin123!`** (`DEMO_ADMIN_PANEL_PASSWORD`).

## Примеры логинов

- Клиенты: `client@tailly.local`, `client02@tailly.local` … `client20@tailly.local` — пароль **`123456`** (`/login`).
- Специалисты: `specialist@tailly.local`, `specialist02@tailly.local` … `specialist14@tailly.local` — пароль **`123456`** (`/login`).
- Администраторы (общий логин): `admin@tailly.local`, `admin02@tailly.local` … `admin12@tailly.local` — **`123456`** на `/login`; для страницы админ-панели у `admin@tailly.local` — **`Admin123!`**, у остальных `adminNN@` — **`Admin123!`**.
- Суперадмин: `superadmin@tailly.local` — **`123456`** на `/login`, **`SuperAdmin123!`** в админ-панели.

После смены сидов обновляйте этот файл при необходимости или ориентируйтесь на файлы из таблицы выше.
