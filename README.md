# README.md

# Tailly

Tailly — веб-платформа поиска петситтеров и услуг по уходу за домашними животными.

Проект реализует frontend части сервиса: поиск специалистов, профиль пользователя, управление услугами, интернет-магазин товаров для питомцев и административную панель.

Проект разработан как production-ready frontend дипломной работы.


# Технологии

Основной стек проекта:

- React
- TypeScript (strict mode)
- Vite
- React Router
- MobX
- CSS Modules

Дополнительно используется:

- lazy loading маршрутов
- разделение API на mock / real
- централизованный HTTP client
- строгая архитектура features



# Архитектура проекта

Проект использует feature-based архитектуру.

src
├ app
│   ├ router
│   └ layout
│
├ pages
│   └ страницы приложения
│
├ features
│   └ бизнес-логика приложения
│
├ shared
│   ├ api
│   ├ ui
│   ├ config
│   └ utils



### app

Глобальная инфраструктура приложения:

- Router
- Layout
- Providers

### pages

Страницы приложения.

Каждая страница собирает UI из features.

### features

Изолированные бизнес-модули:

- auth
- profile
- pets
- reviews
- shop
- specialist-profile
- specialist-search
- admin management

Структура feature:

feature
├ api
├ model
├ ui
└ index.ts


### shared

Общие переиспользуемые модули:

- HTTP client
- UI компоненты
- конфигурация
- утилиты



# Роутинг

Маршруты разделены по зонам доступа:


router
├ publicRoutes
├ clientRoutes
├ shopRoutes
└ adminRoutes


Используются guards:

- ProtectedRoute
- SpecialistOwnerRouteGuard
- AdminRouteGuard

Для оптимизации загрузки применяется lazy loading страниц.


# HTTP клиент

Все API вызовы выполняются через единый HTTP клиент:

src/shared/api/http.ts


Он автоматически:

- добавляет Authorization header
- сериализует JSON
- обрабатывает ошибки API

API функции располагаются в:

features/*/api


# Environment variables

Перед запуском необходимо создать файл окружения.

Скопируйте: .env.example в .env.local

Пример:
VITE_API_BASE_URL=[http://localhost:3000](http://localhost:3000)
VITE_USE_MOCK_API=true
VITE_MAP_API_KEY=your_key


# Запуск проекта

Установка зависимостей:

npm install


Запуск dev сервера:

npm run dev



Сборка production версии:

npm run build



Предпросмотр production сборки:

npm run preview



# Mock API

Проект поддерживает режим работы без backend.

Переключение выполняется через переменную:

VITE_USE_MOCK_API=true


В этом режиме используются mock данные внутри API модулей.



# Основной функционал

Реализованные возможности:

- регистрация пользователей
- профиль клиента
- управление питомцами
- поиск специалистов
- профиль специалиста
- отзывы о специалистах
- редактирование календаря специалиста
- интернет-магазин товаров для питомцев
- оформление заказов
- административная панель
- управление администраторами



# Особенности проекта

Проект разрабатывался с учётом production практик:

- строгая типизация TypeScript
- feature-based архитектура
- разделение API слоя
- централизованный HTTP клиент
- lazy loading страниц
- защита маршрутов
- mock API режим



# Автор

Дипломный проект.

Frontend разработка: React + TypeScript.