# Tailly

Frontend дипломного проекта: платформа поиска петситтеров и специалистов по уходу за животными. SPA на React с разделением по ролям, feature-based структурой и переключением mock / реального API.

## Стек

- React 19, TypeScript (strict), Vite 7
- React Router 7, MobX
- CSS Modules, Recharts, 2GIS MapGL
- Zod — валидация ответов критичных эндпоинтов и тела ошибок API
- ESLint, Prettier
- Vitest + Testing Library — unit/component-тесты
- E2E: Playwright через pytest (`tests/e2e`)

## Структура `src/`

| Каталог     | Назначение                                           |
| ----------- | ---------------------------------------------------- |
| `app/`      | layout, роутинг, guards                              |
| `pages/`    | страницы (композиция features)                       |
| `features/` | доменная логика: `api/`, `model/`, `service/`, `ui/` |
| `shared/`   | UI-kit, `api/`, `config/`, `lib/`, mock-db           |

Переменные окружения и флаг mock читаются централизованно из `src/shared/config/env.ts` (`isMockApiMode`, `resolveApiBaseUrl`, `get2GisApiKey`, и т.д.).

## Роли

Гость, клиент, специалист, администратор, super-admin. Доступ к маршрутам ограничен guard-компонентами; окончательная авторизация должна дублироваться на backend.

## Скрипты

```bash
npm install          # зависимости
npm run dev          # dev-сервер (Vite)
npm run build        # production-сборка
npm run preview      # предпросмотр сборки
npm run lint         # ESLint
npm run lint:fix
npm run format       # Prettier — запись
npm run format:check # Prettier — проверка
npm run typecheck    # tsc -b
npm run test         # Vitest (unit/component)
npm run test:watch
npm run check        # lint + format + typecheck + test + build (используется в CI)
```

E2E (нужен запущенный `npm run dev`):

```bash
pip install -r tests/e2e/requirements.txt
npm run test:e2e
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости измените значения.

| Переменная           | Описание                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | URL API без `/` в конце. В dev при отсутствии используется `http://localhost:3000`. В production **обязательна**. |
| `VITE_USE_MOCK_API`  | `true` (по умолчанию) — mock; `false` — HTTP к backend.                                                           |
| `VITE_2GIS_API_KEY`  | Ключ для карты и геоподсказок (попадает в бандл).                                                                 |
| `VITE_SUPPORT_EMAIL` | Email поддержки в UI; если не задан — используется значение по умолчанию в коде.                                  |

## HTTP-слой и ошибки

- Клиент: `src/shared/api/http.ts` — таймауты, `AbortSignal`, `Authorization`, реакция на 401.
- Ожидаемый JSON при ошибке от сервера (парсится через Zod): поля `message`, `code`, `errors` (объект строк) — см. `src/shared/api/schemas/apiErrorBodySchema.ts`.
- Несоответствие ответа схеме после успешного HTTP даёт `ApiValidationError` (`src/shared/api/apiValidationError.ts`).
- Для **логина клиента/специалиста**, **логина админа** и **профиля** (`/me/profile`, контакты, основные данные) ответы проверяются Zod при `VITE_USE_MOCK_API=false`.

## CI

Workflow GitHub Actions: `.github/workflows/ci.yml` — на push/PR выполняется `npm ci` и `npm run check`.

## Качество кода

- TypeScript: `strict`, unused locals/parameters.
- Тесты лежат рядом с кодом: `*.test.ts`, `*.test.tsx` (в основной сборке `tsc` они исключены, см. `tsconfig.app.json`).

## Лицензия / статус

Проект учебный (диплом). Состояние репозитория: проходят `npm run check` и production build.
