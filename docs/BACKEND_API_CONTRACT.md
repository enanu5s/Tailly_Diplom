# Контракт HTTP API для бэкенда (фронтенд Tailly)

Документ собран по вызовам `request` / `requestParsed` в коде при **`VITE_USE_MOCK_API=false`**. Базовый URL задаётся в **`VITE_API_BASE_URL`** (без завершающего `/`); пути ниже — относительные к нему.

Клиент отправляет **`Authorization: Bearer <accessToken>`**, если в приложении есть токен (см. `configureHttpClient` в `src/main.tsx`). Для публичных маршрутов токен может отсутствовать.

Ответы об ошибках: клиент ожидает JSON с полями в духе `message`, `code`, `errors` (см. `src/shared/api/schemas/apiErrorBodySchema.ts`). Код **401** инициирует выход из сессии и редирект на логин.

Типы тел запросов и ответов смотрите в соответствующих `*Api.ts` и `model/types` рядом с ними.

---

## Не бэкенд проекта

- **2GIS** (`VITE_2GIS_API_KEY`): карта и геоподсказки в поиске специалистов — внешний API 2GIS, не ваш сервер.
- Планировщик «писем» в `src/shared/lib/emailNotifications` при реальном бэке обычно заменяется серверной отправкой писем.

---

## Аутентификация и регистрация

| Метод | Путь | Назначение |
|--------|------|------------|
| POST | `/auth/login` | Вход (тело: логин/пароль; ответ по `loginSuccessResponseSchema`) |
| POST | `/auth/register/start` | Старт регистрации (email, password) → `registrationId` |
| POST | `/auth/register/verify` | Проверка кода → `verificationToken` |
| GET | `/geo/cities` | Список городов для выбора при завершении регистрации |
| POST | `/auth/register/complete` | Завершение профиля → `accessToken`, `user` |

## Восстановление пароля (клиент)

| Метод | Путь | Назначение |
|--------|------|------------|
| POST | `/auth/password-recovery/start` | Старт восстановления |
| POST | `/auth/password-recovery/send-code` | Отправка/повтор кода |
| POST | `/auth/password-recovery/verify-code` | Проверка кода |
| POST | `/auth/password-recovery/reset` | Новый пароль |

## Профиль пользователя (`/me`)

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/me/profile` | Текущий профиль (`userProfileSchema`) |
| PUT | `/me/profile/contacts` | Город, телефон |
| PUT | `/me/profile/main` | Имя, фамилия, отчество, аватар |

## Безопасность аккаунта (`/me/security`)

| Метод | Путь | Назначение |
|--------|------|------------|
| POST | `/me/security/email/change/request` | Запрос смены email → `requestId`, `maskedOldEmail` |
| POST | `/me/security/email/change/confirm` | Подтверждение смены email |
| POST | `/me/security/password/change` | Смена пароля |

## Заказы услуг и товаров (`/me/orders`)

### Услуги

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/me/orders/services` | Список; query `status` (если не `all`) |
| GET | `/me/orders/services/:orderId` | Карточка заказа |
| POST | `/me/orders/services` | Создание заказа |
| POST | `/me/orders/services/:orderId/confirm` | Подтверждение |
| POST | `/me/orders/services/:orderId/start` | Старт |
| POST | `/me/orders/services/:orderId/complete` | Завершение |
| POST | `/me/orders/services/:orderId/cancel` | Отмена |
| POST | `/me/orders/services/:orderId/repeat` | Повтор заказа |
| POST | `/me/orders/services/:orderId/review` | Отзыв по завершённому заказу услуги |

### Товары (магазин)

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/me/orders/products` | Список заказов товаров |
| GET | `/me/orders/products/:orderId` | Карточка |
| POST | `/me/orders/products/:orderId/cancel` | Отмена |
| POST | `/me/orders/products/:orderId/repeat` | Черновик повтора |

## Отзывы (отдельный модуль `reviewsApi`)

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/me/reviews/context/:orderId` | Контекст для формы отзыва |
| POST | `/me/reviews` | Создание отзыва (отдельный флоу от `.../services/.../review` в заказах — оба используются в коде) |

## Питомцы

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/me/pets` | Список питомцев пользователя |
| GET | `/pets/breeds` | Справочник пород |
| PUT | `/me/pets/:petId` | Создание/обновление |
| DELETE | `/me/pets/:petId` | Удаление |

## Сообщения (`/me/messages`)

| Метод | Путь | Назначение |
|--------|------|------------|
| POST | `/me/messages/snapshot` | Снимок переписок; body `{ viewer }` |
| POST | `/me/messages/unread-summary` | Сводка непрочитанных; body `{ viewer }` |
| POST | `/me/messages/threads/support` | Обеспечить тред поддержки |
| POST | `/me/messages/threads/specialist-direct` | Тред со специалистом |
| POST | `/me/messages/threads/client-direct` | Тред с клиентом |
| POST | `/me/messages/read` | Пометить прочитанным |
| POST | `/me/messages/send` | Отправить сообщение |

## Магазин (каталог и заказы)

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/shop/catalog/meta` | Категории и метаданные витрины |
| GET | `/shop/products` | Список/фильтры: `search`, `categoryIds`, `minPrice`, `maxPrice`, `onlyAvailable`, `sort`, `page`, `limit` |
| GET | `/shop/products/by-ids` | Товары по `ids` (через запятую) |
| GET | `/shop/products/:slug` | Карточка по slug |
| GET | `/shop/pickup-points` | Пункты выдачи; query `city` (опционально) |
| POST | `/shop/orders` | Оформление заказа |
| GET | `/shop/orders/:orderId` | Заказ (может быть `null`) |
| POST | `/shop/orders/:orderId/cancel` | Отмена |
| POST | `/shop/orders/:orderId/pay` | Оплата; body `{ paymentMethod: 'card' \| 'sbp' }` |

## Главная страница и контент

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/services` | Конфигурация блоков услуг на главной |
| GET | `/home/reviews` | Отзывы для главной; query: `rating`, `limit`, `requirePhotos`, `minTextLength`, `minWords` |

## Посты

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/posts/latest` | Последние посты; query `limit` |
| GET | `/posts` | Пагинация; query `page`, `pageSize`, `sort`, `search`, `tag` |
| GET | `/posts/:id` | Пост по id |

## Специалисты (публичные и кабинет)

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/specialists` | Список для поиска/каталога |
| GET | `/specialists/:slug` | Профиль специалиста |
| PATCH | `/specialists/:slug/main` | Основная информация (кабинет) |
| PATCH | `/specialists/:slug/details` | Детали профиля |
| PATCH | `/specialists/:slug/calendar` | Календарь/доступность |
| PUT | `/specialists/:slug/reviews/:reviewId/reply` | Ответ на отзыв; body `{ text }` |

## Заявки специалистов

| Метод | Путь | Назначение |
|--------|------|------------|
| POST | `/specialist-applications` | Публичная подача заявки |
| GET | `/admin/specialist-applications` | Список заявок (админка) |
| POST | `/admin/specialist-applications/:applicationId/assign-interview` | Назначить интервью |
| POST | `/admin/specialist-applications/:applicationId/reject` | Отклонить |
| POST | `/admin/specialist-applications/:applicationId/approve` | Одобрить |
| POST | `/admin/specialist-applications/:applicationId/attach-specialist-account` | Привязать созданный аккаунт |

## Админка (роль admin)

| Метод | Путь | Назначение |
|--------|------|------------|
| POST | `/admin/auth/login` | Вход администратора (схема как у клиентского логина) |
| GET | `/admin/profile` | Профиль админа |
| PATCH | `/admin/profile` | Обновление профиля |
| POST | `/admin/profile/email-change/request` | Запрос смены email (супер-админский сценарий) |
| POST | `/admin/profile/email-change/confirm` | Подтверждение смены email |
| DELETE | `/admin/profile/email-change` | Отмена процесса смены email |
| DELETE | `/admin/profile/password-attempts-lock` | Сброс блокировки по паролю |
| POST | `/admin/security/password/change` | Смена пароля админа |
| POST | `/admin/password-recovery` | Запрос восстановления пароля админки (письмо/тикет) |
| GET | `/admin/users` | Пользователи |
| PATCH | `/admin/users/:userId/block-status` | Блокировка и параметры |
| PATCH | `/admin/users/:userId/profile` | Редактирование ФИО / slug специалиста |
| POST | `/admin/users/:userId/restore-from-deletion` | Восстановление из удаления |
| POST | `/admin/specialists` | Создание аккаунта специалиста |
| GET | `/admin/content` | Посты и баннеры для редактирования |
| POST | `/admin/content/posts` | Создание поста |
| PUT | `/admin/content/posts/:postId` | Обновление поста |
| DELETE | `/admin/content/posts/:postId` | Удаление поста |
| POST | `/admin/content/banners` | Создание баннера |
| PUT | `/admin/content/banners/:bannerId` | Обновление баннера |
| DELETE | `/admin/content/banners/:bannerId` | Удаление баннера |

## Супер-админ

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/super-admin/admins` | Список администраторов |
| POST | `/super-admin/admins` | Создание администратора |
| DELETE | `/super-admin/admins/:adminId` | Удаление |
| PATCH | `/super-admin/admins/:adminId` | Обновление |
| PATCH | `/super-admin/admins/:adminId/block` | Блокировка |
| DELETE | `/super-admin/admins/:adminId/password-attempts-lock` | Сброс блокировки ввода пароля |
| GET | `/super-admin/password-recovery-requests` | Очередь запросов на восстановление пароля админов |
| POST | `/super-admin/password-recovery-requests/:requestId/process` | Обработка запроса |

## Удаление аккаунта и обратная связь

| Метод | Путь | Назначение |
|--------|------|------------|
| POST | `/account/deletion/request` | Запрос удаления; body `userId`, `password` |
| GET | `/account/deletion/restore-preview` | Превью восстановления; query `token` |
| POST | `/account/deletion/restore` | Восстановление; body `{ token }` |
| POST | `/support/feedback` | Форма «написать в поддержку» |

---

## Примечание для бэкенд-команды

Реальные DTO и валидация на стороне клиента разбросаны по фичам; этот файл — **инвентаризация маршрутов**. Для OpenAPI/Swagger имеет смысл сгенерировать схемы из TypeScript или описать их отдельно, сверяясь с `*.mock.ts` как с примерами данных.
