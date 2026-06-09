# Спецификация API для фронтенда Tailly

Документ составлен по коду фронтенда: типам (`model/types`), контрактам `*Api.ts` (режим «реального» API, не моки) и структуре mock-db. Базовый URL API Gateway: **`http://localhost:5000`** (в проде — свой домен). Все запросы идут через Gateway.

**Все доменные модели в одном месте:** раздел **«Полный каталог моделей данных»** (после §2.5) — копии TypeScript-типов для бэкенда: питомцы, специалисты и календарь, заказы, магазин, чаты, заявки, админка, super-admin и т.д.

**Авторизация:** для защищённых маршрутов заголовок `Authorization: Bearer <access_token>`. При необходимости refresh — по контракту бэкенда (см. раздел «Auth»).

**Ошибки:** фронт ожидает тело с полями вроде `message`, `code`, опционально `errors` (см. `HttpError` в `shared/api/http.ts`). Коды логина: `INVALID_CREDENTIALS`, `TOO_MANY_ATTEMPTS`, `ACCOUNT_BLOCKED`, `INVALID_ROLE`, `ACCOUNT_PENDING_DELETION`.

---

## 1. Согласование с уже существующим Auth API

Сейчас на Gateway объявлены эндпоинты:

| Метод | Путь (у вас) | Назначение |
|-------|----------------|------------|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/confirm-email` | Подтверждение почты |
| POST | `/auth/login` | Логин |
| POST | `/auth/refresh` | Обновление токена |
| POST | `/auth/logout` | Выход |
| POST | `/auth/forgot-password` | Забыл пароль |
| POST | `/auth/reset-password` | Сброс пароля |
| POST | `/auth/change-password` | Смена пароля (JWT) |
| POST | `/auth/change-email/request` | Запрос смены email (JWT) |
| POST | `/auth/change-email/confirm` | Подтверждение смены email (JWT) |

Фронтенд в **реальном** режиме вызывает **другие пути** для многошаговой регистрации и восстановления пароля (см. ниже). Нужно либо:

- реализовать эти пути на Gateway и проксировать в сервисы, либо  
- изменить фронт под ваши единые `/auth/register`, `/auth/confirm-email` и т.д.

Ниже зафиксирован **ожидаемый фронтом** контракт (источник правды — `src/features/**/api/*.ts`).

---

## 2. Общие модели данных

### 2.1. Пользователь в JWT / ответе логина (`AuthUser`)

Используется везде после входа. Роль в сессии для клиента/специалиста задаётся при логине (`requestedRole`).

```ts
type UserRole = 'guest' | 'client' | 'specialist' | 'admin' | 'super_admin';

type AuthUser = {
  id: string;
  email: string;
  role: UserRole; // в ответе логина: client | specialist | admin | super_admin
  name?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  specialistId?: string;
  specialistSlug?: string;
  adminId?: string;
  isBlocked?: boolean;
};

type LoginSuccessResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
  user?: AuthUser;
};
```

Для входа с `requestedRole: 'specialist'` поле `user` обязательно должно содержать `role: 'specialist'`, `specialistId` и `specialistSlug`. `specialistSlug` используется для перехода в кабинет и проверки владельца профиля.

**Логин клиента/специалиста** — `POST /auth/login` (фронт: `LoginPayload`):

```ts
type LoginPayload = {
  email: string;
  password: string;
  requestedRole: 'client' | 'specialist';
};
```

**Логин админки** — отдельный путь: `POST /admin/auth/login` (тело: `{ email, password }`), ответ тот же `LoginSuccessResponse`.

### 2.2. Профиль клиента (не только email/пароль)

В БД недостаточно хранить только учётные данные: после регистрации и в кабинете нужен **полный профиль**, совпадающий с моками.

```ts
type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  avatarUrl?: string;
  city: string;       // отображаемое название НП
  phone: string;
  email: string;
};
```

Рекомендуемая **сущность пользователя (клиент)** на бэкенде (логическая модель):

| Поле | Описание |
|------|----------|
| `id` | UUID пользователя (= `AuthUser.id`) |
| `email` | Уникальный email |
| `passwordHash` | Хэш пароля |
| `emailConfirmed` | Почта подтверждена |
| `firstName`, `lastName`, `middleName` | ФИО |
| `cityId` | Внешний ключ на справочник городов (если есть) |
| `cityName` | Кэш названия для отображения |
| `phone` | Телефон |
| `avatarUrl` | URL аватара (после загрузки в хранилище) |
| `roles` | Набор ролей: клиент / специалист и т.д. |

### 2.3. Регистрация: поток, который ожидает фронт

Файл `registerApi.ts` вызывает:

1. `POST /auth/register/start` — начало: email + пароль.  
2. `POST /auth/register/verify` — проверка кода из письма.  
3. `GET /geo/cities` — список городов для выбора (или отдельный справочник).  
4. `POST /auth/register/complete` — ФИО, город, токен подтверждения шага 2; в ответе **сразу** `accessToken` + `user` (как после логина), с доп. полем `cityId`.

Типы:

```ts
type StartRegisterRequest = { email: string; password: string };
type StartRegisterResponse = { registrationId: string };

type VerifyCodeRequest = { registrationId: string; code: string };
type VerifyCodeResponse = { verificationToken: string };

type City = { id: string; name: string };

type CompleteProfileRequest = {
  verificationToken: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  cityId: string;
  cityName?: string;
};

type CompleteProfileResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
  user: AuthUser & { cityId: string };
};
```

**Связь с вашим `/auth/register` и `/auth/confirm-email`:** логически `register/start` + письмо = ваш register; `verify` = подтверждение кода; `complete` — создание записи профиля и выдача токенов. Если оставляете один `POST /auth/register`, нужно расширить тело до многошагового процесса или добавить недостающие маршруты на Gateway.

### 2.4. Восстановление пароля (как на фронте)

Пути в `passwordRecoveryApi.ts`:

| Метод | Путь | Тело |
|-------|------|------|
| POST | `/auth/password-recovery/start` | `{ email }` → `{ flow: 'default' \| 'admin' }` |
| POST | `/auth/password-recovery/send-code` | `{ email }` |
| POST | `/auth/password-recovery/verify-code` | `{ email, code }` |
| POST | `/auth/password-recovery/reset` | `{ email, code, newPassword }` |

Их нужно сопоставить с `/auth/forgot-password` и `/auth/reset-password` (и промежуточными шагами), либо добавить прокси-роуты.

### 2.5. Смена пароля / email для клиента в кабинете

Фронт использует **`/me/security/...`** (см. раздел 11), а не `/auth/change-password`. Для единообразия Gateway может проксировать `PUT /me/...` → Auth-сервис. Либо перевести фронт на ваши `/auth/change-password` и `/auth/change-email/*` под тем же JWT.

---

## Полный каталог моделей данных (как во фронтенде и моках)

Источники: `src/features/**/model/types.ts`, `src/features/auth/model/authStore.ts`, `src/shared/lib/mock/specialistAccountsStorage.ts`, `src/features/auth/data/mockAuthAccounts.ts`, `src/features/auth/data/mockAccountDeletionStorage.ts`, `src/shared/mock-db/types.ts`. Ниже — TypeScript-описания сущностей; бэкенд может отразить их в DTO/таблицах 1:1 или с нормализацией.

### Auth: ошибки логина и восстановление пароля

`src/features/auth/model/types.ts`:

```ts
export type LoginErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TOO_MANY_ATTEMPTS'
  | 'ACCOUNT_BLOCKED'
  | 'INVALID_ROLE'
  | 'ACCOUNT_PENDING_DELETION';

export type SendRecoveryCodePayload = { email: string };
export type VerifyRecoveryCodePayload = { email: string; code: string };
export type ResetPasswordPayload = { email: string; code: string; newPassword: string };
export type PasswordRecoveryStartFlow = 'default' | 'admin';
export type StartPasswordRecoveryPayload = { email: string };
export type StartPasswordRecoveryResponse = { flow: PasswordRecoveryStartFlow };
```

`src/features/admin-auth/model/types.ts`:

```ts
export type AdminLoginPayload = { email: string; password: string };
export type AdminLoginErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TOO_MANY_ATTEMPTS'
  | 'ACCOUNT_BLOCKED';
```

### Учётная запись в моках (`MockAuthAccount`)

Логическая модель пользователя для клиента/админа в `mock-db` (пароль в проде не отдаётся в API):

```ts
export type UserRole = 'guest' | 'client' | 'specialist' | 'admin' | 'super_admin';

export type MockAuthAccount = {
  id: string;
  email: string;
  password: string; // только мок
  roles: UserRole[];
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  specialistId?: string;
  specialistSlug?: string;
  adminId?: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
  softDeletedAt?: string;
  softDeleteRestoreUntil?: string;
};

export type MockAttemptState = {
  failedAttempts: number;
  lockUntil: string | null;
};
```

### Управляемый аккаунт специалиста в моках (`ManagedSpecialistMockAccount`)

```ts
export type ManagedSpecialistMockAccount = {
  id: string;
  email: string;
  password: string;
  role: 'specialist';
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  city: string;
  about: string;
  specialistId: string;
  specialistSlug?: string;
  applicationId?: string;
  createdAt: string;
  createdBy: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
  lastLoginAt?: string | null;
};
```

### Мягкое удаление аккаунта (mock-db)

```ts
export type AccountSoftDeleteRecord = {
  softDeletedAt: string;
  restoreUntil: string;
  token: string;
};

export type MockAccountDeletionEmail = {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
};
```

### Питомцы и породы

`src/features/pets/model/types.ts` — см. также раздел 4 документа; полностью:

```ts
export type PetType =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rodent'
  | 'rabbit'
  | 'reptile'
  | 'fish'
  | 'amphibian';

/** Оценочная масса взрослого животного, кг */
export type PetSize =
  | 'up_to_2kg'
  | '2_5kg'
  | '5_10kg'
  | '10_20kg'
  | 'over_20kg';

export type PetGender = 'male' | 'female';
export type PetAttitude = 'friendly' | 'neutral' | 'aggressive' | 'unknown';
export type PetHomeAlone = 'ok' | 'not_ok' | 'unknown';
export type PetVaccinated = 'yes' | 'no' | 'unknown';

export type Pet = {
  id: string;
  photoUrl?: string;
  name: string;
  type: PetType | null;
  breedId: string | null;
  ageYears: number;
  ageMonths: number;
  size: PetSize | null;
  gender: PetGender | null;
  toOtherPets: PetAttitude | null;
  toKidsUnder10: PetAttitude | null;
  staysHomeAlone: PetHomeAlone | null;
  vaccinated: PetVaccinated | null;
  notes: string;
};

export type Breed = { id: string; type: PetType; title: string };
```

### Поиск специалистов и фильтры

`src/features/specialists-search/model/types.ts`:

```ts
import type { PetType } from '@/features/pets/model/types';
export type { PetType } from '@/features/pets/model/types';
export type SortMode = 'rating' | 'price';

export type SpecialistService = {
  serviceId: ServiceId | 'any';
  petTypes: PetType[];
  priceFrom: number;
  priceTo?: number;
  durationMinutes?: number;
  note?: string;
};

export type SpecialistCalendarSlot = {
  date: string;
  startTime: string;
  endTime: string;
  kind: 'available' | 'booked';
  serviceId?: ServiceId;
  title?: string;
};

export type GeoPoint = { lat: number; lon: number };

export type Specialist = {
  id: string;
  name: string;
  avatarUrl: string | null;
  city: string;
  district: string;
  description: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  location: GeoPoint;
  services: SpecialistService[];
  availabilityWeekdays?: number[];
  calendarSlots?: SpecialistCalendarSlot[];
};

export type DateRange = { from: string | null; to: string | null };
export type ViewMode = 'list' | 'map';

export type SearchFilters = {
  cityQuery: string;
  districtQuery: string;
  dateRange: DateRange;
  petType: PetType | 'any';
  serviceId: ServiceId | 'any';
  priceMin: number | null;
  priceMax: number | null;
  experienceMinYears: number | null;
  hasReviewsOnly: boolean;
};

export type MapBounds = { sw: GeoPoint; ne: GeoPoint };
```

`ServiceId` — `'walking' | 'boarding' | 'grooming' | 'training' | 'photoshoot'` (`shared/config/services.ts`). `ServiceConfig`: `{ id, title, subtitle, iconUrl }`.

### Геоподсказки (клиент 2GIS, типы для ответов)

`src/features/specialists-search/data/mockSpecialistsGeo.ts`:

```ts
export type GeoPoint = { lon: number; lat: number };

export type GeoSuggestItem = {
  id: string | null;
  name: string;
  fullName: string;
  point: GeoPoint | null;
  type: string | null;
  subtype: string | null;
};
```

### Запись на услугу (UI-состояние)

`src/features/service-booking/model/types.ts`:

```ts
export type ServiceBookingDraft = {
  specialistSlug: string;
  serviceId: string;
  petId: string;
  selectedDate: string;
  selectedSlotId: string;
  comment: string;
  /** см. `ServiceBookingMode` в orders/model/types.ts */
  bookingMode: 'fixed_slot' | 'time_range' | 'multi_day_stay' | 'open_request';
  requestedStartDate: string;
  requestedStartTime: string;
  requestedEndDate: string;
  requestedEndTime: string;
  stayCheckInDate: string;
  stayCheckInTime: string;
  stayCheckOutDate: string;
  stayCheckOutTime: string;
};

export type BookingDateOption = { date: string; label: string };
export type BookingSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  startIso: string;
  endIso: string;
  serviceIds?: string[];
};
```

### Профиль специалиста (публичный и редактирование)

`src/features/specialist-profile/model/types.ts` — полная модель:

```ts
import type { PetSize, PetType } from '@/features/pets/model/types';

export type SpecialistHousingType = 'apartment' | 'house' | 'townhouse' | 'other';
export type SpecialistPetSize = PetSize;
export type SpecialistPetAge = 'baby' | 'young' | 'adult' | 'senior';
export type SpecialistChildrenPolicy = 'yes' | 'no' | 'sometimes';
export type SpecialistPetType = PetType;
export type SpecialistServicePriceUnit = 'hour' | 'day' | 'service' | 'walk' | 'visit';
export type SpecialistExperienceUnit = 'years' | 'months';
export type SpecialistBookingMode =
  | 'fixed_slot' | 'time_range' | 'multi_day_stay' | 'open_request';
export type SpecialistRecurrenceFrequency =
  | 'daily' | 'weekly' | 'every_n_days' | 'every_n_weeks';
export type SpecialistOccurrenceEditScope = 'single' | 'this_and_future';

export type SpecialistMainInfo = {
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  city: string;
  district: string;
  phone: string;
  email: string;
};

export type SpecialistStats = {
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  completedOrdersCount: number;
  repeatOrdersCount: number;
};

export type SpecialistCalendarDayStatus =
  | 'available' | 'partially_booked' | 'fully_booked' | 'day_off';

export type SpecialistCalendarDayOverride = {
  date: string;
  status: Exclude<SpecialistCalendarDayStatus, 'partially_booked'>;
};

export type SpecialistServiceDurationPolicy = {
  defaultDurationMinutes?: number;
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  durationStepMinutes?: number;
};

export type SpecialistServiceBufferPolicy = {
  hasBufferBefore: boolean;
  bufferBeforeMinutes: number;
  hasBufferAfter: boolean;
  bufferAfterMinutes: number;
};

export type SpecialistServiceCompatibilityPolicy = {
  canOverlapWithOtherServices: boolean;
  compatibleServiceIds: string[];
};

export type SpecialistServiceAdvancePolicy = {
  minAdvanceMinutes?: number;
  maxAdvanceDays?: number;
};

export type SpecialistServiceMultiDayPolicy = {
  allowsMultiDayBooking: boolean;
  minStayDays?: number;
  maxStayDays?: number;
  checkInTime?: string;
  checkOutTime?: string;
};

export type SpecialistServiceBookingPolicy = {
  mode: SpecialistBookingMode;
  duration: SpecialistServiceDurationPolicy;
  buffer: SpecialistServiceBufferPolicy;
  compatibility: SpecialistServiceCompatibilityPolicy;
  advance: SpecialistServiceAdvancePolicy;
  multiDay?: SpecialistServiceMultiDayPolicy;
  allowsClientComment: boolean;
  requiresSpecialistConfirmation: boolean;
};

export type SpecialistService = {
  id: string;
  name: string;
  locationLabel: string;
  price: number;
  priceUnit: SpecialistServicePriceUnit;
  bookingPolicy?: SpecialistServiceBookingPolicy;
};

export type SpecialistCalendarBookedSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceIds: string[];
  orderId?: string;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
};

export type SpecialistCalendarAvailabilityWindow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceIds: string[];
  comment?: string;
};

export type SpecialistCalendarBookingSettings = {
  dayStartTime: string;
  dayEndTime: string;
  slotStepMinutes: number;
  defaultDurationMinutes: number;
};

export type SpecialistAvailabilityRecurrenceRule = {
  frequency: SpecialistRecurrenceFrequency;
  interval: number;
  weekDays?: number[];
  occurrencesCount?: number;
  untilDate?: string;
};

export type SpecialistCalendarAvailabilityRule = {
  id: string;
  title: string;
  serviceIds: string[];
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  recurrence?: SpecialistAvailabilityRecurrenceRule;
  isEnabled: boolean;
  comment?: string;
};

export type SpecialistCalendarAvailabilityOverride = {
  id: string;
  targetDate: string;
  editScope: SpecialistOccurrenceEditScope;
  sourceRuleId?: string;
  serviceIds?: string[];
  startTime?: string;
  endTime?: string;
  removeAvailability?: boolean;
  comment?: string;
};

export type SpecialistCalendar = {
  timezone: string;
  dayOverrides: SpecialistCalendarDayOverride[];
  bookedSlots: SpecialistCalendarBookedSlot[];
  availabilityWindows: SpecialistCalendarAvailabilityWindow[];
  bookingSettings?: SpecialistCalendarBookingSettings;
  availabilityRules?: SpecialistCalendarAvailabilityRule[];
  availabilityOverrides?: SpecialistCalendarAvailabilityOverride[];
};

export type SpecialistGalleryItem = { id: string; imageUrl: string; alt: string };
export type SpecialistAdvantage = { id: string; title: string };

export type SpecialistReviewReply = { text: string; createdAt: string };

export type SpecialistReview = {
  id: string;
  orderId?: string;
  serviceTitle?: string;
  authorName: string;
  petName?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  text: string;
  specialistReply?: SpecialistReviewReply;
};

export type SpecialistReviewsRatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;
export type SpecialistReviewsReplyFilter = 'all' | 'with_reply' | 'without_reply';

export type SpecialistDetails = {
  experienceLabel: string;
  experienceDurationValue?: number;
  experienceDurationUnit?: SpecialistExperienceUnit;
  housingType: SpecialistHousingType;
  petSizes: SpecialistPetSize[];
  petAges: SpecialistPetAge[];
  hasChildrenUnderTen: SpecialistChildrenPolicy;
  petTypes: SpecialistPetType[];
  advantages: SpecialistAdvantage[];
  about: string;
};

export type SpecialistProfile = {
  id: string;
  slug: string;
  isOwner: boolean;
  main: SpecialistMainInfo;
  stats: SpecialistStats;
  calendar: SpecialistCalendar;
  specialistGallery?: SpecialistGalleryItem[];
  petGallery: SpecialistGalleryItem[];
  details: SpecialistDetails;
  services: SpecialistService[];
  reviews: SpecialistReview[];
};

export type SpecialistProfileResponse = Omit<SpecialistProfile, 'isOwner'>;

export type SpecialistMainInfoUpdatePayload = {
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  city: string;
  district: string;
  phone: string;
};

export type SpecialistServiceUpdateItem = {
  id: string;
  name: string;
  locationLabel: string;
  description?: string;
  price: number;
  priceUnit: SpecialistServicePriceUnit;
  bookingPolicy?: SpecialistServiceBookingPolicy;
};

export type SpecialistServiceCreatePayload = Omit<SpecialistServiceUpdateItem, 'id'>;
export type SpecialistServiceEditPayload = Omit<SpecialistServiceUpdateItem, 'id'>;

export type SpecialistDetailsUpdatePayload = {
  experienceLabel: string;
  experienceDurationValue?: number;
  experienceDurationUnit?: SpecialistExperienceUnit;
  housingType: SpecialistHousingType;
  petSizes: SpecialistPetSize[];
  petAges: SpecialistPetAge[];
  hasChildrenUnderTen: SpecialistChildrenPolicy;
  petTypes: SpecialistPetType[];
  advantages: string[];
  about: string;
  specialistGallery?: SpecialistGalleryItem[];
};

export type SpecialistCalendarUpdatePayload = {
  timezone: string;
  dayOverrides: SpecialistCalendarDayOverride[];
  availabilityWindows: SpecialistCalendarAvailabilityWindow[];
  bookingSettings: SpecialistCalendarBookingSettings;
  availabilityRules?: SpecialistCalendarAvailabilityRule[];
  availabilityOverrides?: SpecialistCalendarAvailabilityOverride[];
};

export type SpecialistReviewReplyUpsertPayload = {
  reviewId: string;
  text: string;
};
```

### Заказы услуг и товаров

`src/features/orders/model/types.ts` (без вспомогательных функций внизу файла):

```ts
export type OrderStatus =
  | 'pending_confirmation' | 'confirmed' | 'active' | 'completed' | 'canceled';

export type ServicesFilter =
  | 'all' | 'upcoming' | 'pending_confirmation' | 'confirmed'
  | 'active' | 'completed' | 'canceled';

export type ServicePriceUnit = 'hour' | 'day' | 'service' | 'walk' | 'visit';
export type ServiceBookingMode =
  | 'fixed_slot' | 'time_range' | 'multi_day_stay' | 'open_request';

export type ServiceOrderLifecycleEvent = {
  status: OrderStatus;
  changedAt: string;
  comment?: string;
};

export type ServiceOrderFixedSlotSchedule = {
  mode: 'fixed_slot';
  startAt: string;
  endAt: string;
};

export type ServiceOrderTimeRangeSchedule = {
  mode: 'time_range';
  startAt: string;
  endAt: string;
};

export type ServiceOrderMultiDaySchedule = {
  mode: 'multi_day_stay';
  checkInAt: string;
  checkOutAt: string;
  stayDays: number;
};

export type ServiceOrderOpenRequestSchedule = {
  mode: 'open_request';
  requestedDate?: string;
  requestedStartTime?: string;
  requestedEndTime?: string;
};

export type ServiceOrderSchedule =
  | ServiceOrderFixedSlotSchedule
  | ServiceOrderTimeRangeSchedule
  | ServiceOrderMultiDaySchedule
  | ServiceOrderOpenRequestSchedule;

export type ServiceOrderServiceSnapshot = {
  id: string;
  title: string;
  locationLabel: string;
  price: number;
  priceUnit: ServicePriceUnit;
  bookingMode: ServiceBookingMode;
};

export type ServiceOrderReviewReply = { comment: string; createdAt: string };

export type ServiceOrderReview = {
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  photos: string[];
  createdAt: string;
  specialistReply?: ServiceOrderReviewReply | null;
};

export type LeaveServiceReviewPayload = {
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  photos: string[];
};

export type ServiceOrder = {
  id: string;
  createdAt: string;
  confirmedAt?: string;
  startedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  dateFrom: string;
  dateTo?: string;
  schedule: ServiceOrderSchedule;
  petId: string;
  petName: string;
  clientId: string;
  clientName: string;
  clientSlug: string;
  sitterId: string;
  sitterName: string;
  specialistSlug: string;
  status: OrderStatus;
  serviceId: string;
  serviceTitle: string;
  servicePriceUnit: ServicePriceUnit;
  serviceSnapshot: ServiceOrderServiceSnapshot;
  locationLabel: string;
  comment?: string;
  price: number;
  currency: 'RUB';
  rating?: number;
  hasReview: boolean;
  review?: ServiceOrderReview | null;
  lifecycle: ServiceOrderLifecycleEvent[];
};

export type CreateServiceOrderPayload = {
  dateFrom: string;
  dateTo?: string;
  schedule: ServiceOrderSchedule;
  petId: string;
  specialistId: string;
  specialistSlug: string;
  serviceId: string;
  locationLabel: string;
  comment?: string;
};

Backend заполняет `clientId`, `clientName`, `clientSlug`, `petName`, `sitterName`,
`serviceTitle`, `servicePriceUnit`, `bookingMode`, `price`, `currency` и
`serviceSnapshot` самостоятельно из JWT, питомца, специалиста и услуги.
В payload создания заказа `specialistId` — это идентификатор специалиста;
отдельный `sitterId` на backend не отправляется.

export type RepeatServiceOrderDraftPayload = {
  petId: string;
  petName: string;
  sitterId: string;
  sitterName: string;
  specialistSlug: string;
  serviceId: string;
  serviceTitle: string;
  servicePriceUnit: ServicePriceUnit;
  bookingMode: ServiceBookingMode;
  locationLabel: string;
  comment?: string;
  price: number;
  currency: 'RUB';
};

export type ProductOrderStatus =
  | 'created' | 'paid' | 'shipped' | 'delivered' | 'canceled';

export type ProductOrderItem = {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  variantId?: string;
  variantLabel?: string;
};

export type ProductOrderRecipient = { fullName: string; phone: string };

export type ProductOrderDeliveryAddress = {
  city: string;
  street: string;
  house: string;
  apartment?: string;
  comment?: string;
  postalCode?: string;
};

export type ProductOrderDelivery = {
  method: 'courier' | 'pickup';
  address?: ProductOrderDeliveryAddress;
  pickupPointLabel?: string;
  expectedAt?: string;
  trackingNumber?: string;
};

export type ProductOrderPayment = {
  method: 'card' | 'sbp' | 'cash_on_delivery';
  status: 'pending' | 'paid' | 'refunded';
};

export type ProductOrderLifecycleEvent = {
  status: ProductOrderStatus;
  changedAt: string;
  comment?: string;
};

export type ProductOrder = {
  id: string;
  number: string;
  status: ProductOrderStatus;
  createdAt: string;
  price: number;
  currency: 'RUB';
  itemsCount: number;
  productThumbs?: string[];
  ownerUserId?: string;
  items: ProductOrderItem[];
  recipient?: ProductOrderRecipient;
  delivery?: ProductOrderDelivery;
  payment?: ProductOrderPayment;
  cancelReason?: string;
  canceledAt?: string;
  lifecycle?: ProductOrderLifecycleEvent[];
};

export type RepeatResult = { ok: true; draftPayload?: RepeatServiceOrderDraftPayload };
export type ReviewResult = { ok: true; review?: ServiceOrderReview };
export type CompleteOrderResult = { ok: true };
export type ConfirmOrderResult = { ok: true };
export type StartOrderResult = { ok: true };
export type CancelOrderResult = { ok: true };
```

`src/features/orders/model/productOrderRepeatCheckout.ts`:

```ts
export type ProductOrderRepeatCheckoutItem = {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  variantId?: string;
  variantLabel?: string;
};

export type ProductOrderRepeatCheckoutDraft = {
  source: 'repeat_product_order';
  orderId: string;
  createdAt: string;
  items: ProductOrderRepeatCheckoutItem[];
};
```

### Магазин

`src/features/shop/model/types.ts`:

```ts
export type ProductCategory = { id: string; slug: string; title: string };
export type ProductSort =
  | 'popular' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest';
export type DeliveryMethod = 'courier' | 'pickup-point';
export type PaymentMethod = 'card' | 'sbp' | 'cash';

export type OrderStatus =
  | 'created' | 'paid' | 'processing' | 'delivering'
  | 'ready-for-pickup' | 'completed' | 'cancelled';

export type ProductReviewReply = {
  authorName: string;
  text: string;
  createdAt: string;
};

export type ProductReview = {
  id: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string;
  siteReply?: ProductReviewReply | null;
};

export type ProductImage = { id: string; url: string; alt: string };

export type ProductDescriptionContent = {
  summary?: string;
  suitableFor?: string[];
  benefits?: string[];
  features?: string[];
  usage?: string;
  composition?: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  shortDescription: string;
  description: string;
  descriptionContent?: ProductDescriptionContent;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviewsCount: number;
  isAvailable: boolean;
  stockQuantity: number;
  images: ProductImage[];
  reviews: ProductReview[];
  createdAt: string;
  updatedAt: string;
};

export type CatalogFilterState = {
  search: string;
  categoryIds: string[];
  minPrice: number | null;
  maxPrice: number | null;
  onlyAvailable: boolean;
  sort: ProductSort;
  page: number;
  limit: number;
};

export type CatalogProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
};

export type CatalogMetaResponse = {
  categories: ProductCategory[];
  minPrice: number;
  maxPrice: number;
  availableSorts: ProductSort[];
};

export type CartItem = { productId: string; quantity: number };
export type CartDetailedItem = {
  product: Product;
  quantity: number;
  lineTotal: number;
};
export type CartSummary = {
  items: CartDetailedItem[];
  totalItems: number;
  totalPrice: number;
};
export type FavoriteItem = { productId: string; addedAt: string };

export type CheckoutRecipient = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type CheckoutAddress = {
  city: string;
  street: string;
  house: string;
  apartment: string;
  comment: string;
};

export type PickupPoint = {
  id: string;
  provider: 'cdek';
  title: string;
  address: string;
  estimatedDate: string;
};

export type CheckoutForm = {
  recipient: CheckoutRecipient;
  deliveryMethod: DeliveryMethod;
  address: CheckoutAddress;
  pickupPointId: string | null;
  paymentMethod: PaymentMethod;
};

export type Order = {
  id: string;
  status: OrderStatus;
  items: CartDetailedItem[];
  totalPrice: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  estimatedDeliveryDate: string | null;
  createdAt: string;
  canBeCancelled: boolean;
  ownerUserId?: string;
  recipientEmail?: string;
  recipientName?: string;
};
```

### Отзывы к заказу услуги (клиент)

`src/features/reviews/model/types.ts`:

```ts
export type ReviewCreatePayload = {
  orderId: string;
  rating: number;
  text: string;
  photoUrls: string[];
};

export type ReviewContext = {
  orderId: string;
  petId: string;
  petName: string;
  ownerFullName: string;
  sitterId: string;
  sitterName: string;
  serviceTitle: string;
};

export type Review = {
  id: string;
  orderId: string;
  rating: number;
  text: string;
  photoUrls: string[];
  createdAtIso: string;
  petName: string;
  ownerFullName: string;
  sitterId: string;
  sitterName: string;
  serviceTitle: string;
};
```

### Сообщения

`src/features/messages/model/types.ts` — полностью:

```ts
export type MessageParticipantRole =
  | 'client' | 'specialist' | 'admin' | 'super_admin' | 'support';

export type MessageThreadKind = 'support' | 'specialist_direct';

export type MessageParticipant = {
  userId: string;
  role: MessageParticipantRole;
  displayName: string;
  avatarUrl?: string;
};

export type MessagesViewer = {
  userId: string;
  role: MessageParticipantRole | 'guest';
  displayName: string;
  avatarUrl?: string;
};

export type MessageImageAttachment = {
  id: string;
  kind: 'image';
  name: string;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  sizeBytes: number;
};

export type MessageReplyPreview = {
  messageId: string;
  authorName: string;
  text: string;
  attachmentsCount: number;
};

export type StoredMessageThread = {
  id: string;
  kind: MessageThreadKind;
  participants: MessageParticipant[];
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
};

export type MessageThread = {
  id: string;
  kind: MessageThreadKind;
  participants: MessageParticipant[];
  title: string;
  avatarUrl?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  authorId: string;
  authorRole: MessageParticipantRole;
  authorName: string;
  authorSupportAgentName?: string;
  text: string;
  attachments: MessageImageAttachment[];
  replyTo?: MessageReplyPreview;
  createdAt: string;
  readByUserIds: string[];
};

export type MessagesSnapshot = {
  threads: MessageThread[];
  messages: ChatMessage[];
};

export type MessagesUnreadSummary = {
  unreadMessagesCount: number;
  unreadThreadsCount: number;
};
```

### Главная

`src/features/home/model/types.ts`:

```ts
export type HomeBanner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  createdAtIso: string;
  postId?: string;
  linkUrl?: string;
};

export type HomeReview = {
  id: string;
  createdAtIso: string;
  rating: number;
  text: string;
  petName: string;
  ownerName: string;
  sitterId: string;
  sitterName: string;
  serviceTitle: string;
  photoUrls: string[];
};
```

### Посты (публичные)

`src/features/posts/model/types.ts`:

```ts
export type Post = {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  imageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
};

export type PostsSort = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

export type PostsListParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort?: PostsSort;
  tag?: string;
};

export type PostsListResponse = {
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
  availableTags?: string[];
};
```

### Заявки специалистов

`src/features/specialist-applications/model/types.ts`:

```ts
export type SpecialistApplicationStatus =
  | 'pending_review' | 'interview_assigned' | 'approved' | 'rejected';

export type SpecialistApplicationQuestionnaire = {
  experienceYears: number;
  animalTypes: string[];
  serviceFormats: string[];
  canGiveMedication: boolean;
  canHandleDifficultBehavior: boolean;
  canTakeOvernightOrders: boolean;
  hasOwnPets: boolean;
  hasPetFirstAidBasics: boolean;
  housingType: string;
  districtPreferences: string;
  schedulePreferences: string;
  portfolioUrl: string;
  motivation: string;
  additionalInfo: string;
};

export type SpecialistApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  about: string;
  questionnaire?: SpecialistApplicationQuestionnaire | null;
  status: SpecialistApplicationStatus;
  createdAt: string;
  updatedAt: string;
  interviewDate?: string | null;
  reviewComment?: string | null;
  reviewedBy?: string | null;
  createdSpecialistId?: string | null;
  createdSpecialistSlug?: string | null;
  specialistAccountCreatedAt?: string | null;
};

export type CreateSpecialistApplicationPayload = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  about: string;
  questionnaire: SpecialistApplicationQuestionnaire;
};

export type CreateSpecialistApplicationResult = {
  id: string;
};

export type AssignInterviewPayload = {
  applicationId: string;
  interviewDate: string;
  reviewComment?: string;
  reviewedBy: string;
};

export type RejectSpecialistApplicationPayload = {
  applicationId: string;
  reviewComment: string;
  reviewedBy: string;
};

export type ApproveSpecialistApplicationPayload = {
  applicationId: string;
  reviewComment?: string;
  reviewedBy: string;
};

export type AttachCreatedSpecialistAccountPayload = {
  applicationId: string;
  specialistId: string;
  specialistSlug?: string;
  reviewedBy: string;
};
```

### Удаление аккаунта (превью)

`src/features/account-deletion/model/types.ts`:

```ts
export type AccountDeletionRestorePreview = {
  email: string;
  roleLabel: string;
  displayName: string;
  restoreDeadlineIso: string;
};
```

### Смена email в UI безопасности

`src/features/profileSecurity/emailChangeFlow/model/types.ts`:

```ts
export type EmailChangeFlowState = {
  step: 'request' | 'confirm' | 'done';
  requestId: string | null;
  maskedOldEmail: string | null;
};
```

### Админка: пользователи

`src/features/admin-users-management/model/types.ts`:

```ts
export type ManagedUserRole = 'client' | 'specialist';

export type ManagedUser = {
  id: string;
  email: string;
  role: ManagedUserRole;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  name?: string;
  specialistId?: string;
  specialistSlug?: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
  isScheduledForDeletion?: boolean;
  scheduledDeletionDeadline?: string;
};

export type UpdateUserBlockStatusPayload = {
  userId: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

export type UpdateManagedUserProfilePayload = {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  specialistSlug?: string;
};

export type RestoreManagedUserFromDeletionPayload = { userId: string };
```

### Админка: создание специалиста

`src/features/admin-specialists-management/model/types.ts`:

```ts
export type ManagedSpecialistAccount = {
  id: string;
  email: string;
  role: 'specialist';
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  city: string;
  about: string;
  specialistId: string;
  specialistSlug?: string;
  applicationId?: string;
  createdAt: string;
  createdBy: string;
  isBlocked: boolean;
};

export type CreateSpecialistAccountPayload = {
  applicationId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  city: string;
  about: string;
  reviewedBy: string;
};

export type CreateSpecialistAccountResponse = {
  account: ManagedSpecialistAccount;
  temporaryPassword: string;
};
```

### Админка: профиль администратора

`src/features/admin-profile/model/types.ts`:

```ts
export type AdminProfileRole = 'admin' | 'super_admin';

export type AdminLoginSecurityInfo = {
  isManuallyBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string | null;
  isPermanentBlock?: boolean;
  passwordAttemptsLockUntil: string | null;
  failedPasswordAttempts: number;
};

export type AdminProfile = {
  id: string;
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  phone?: string;
  position?: string;
  department?: string;
  role: AdminProfileRole;
  loginSecurity?: AdminLoginSecurityInfo;
};

export type UpdateAdminProfilePayload = {
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  birthDate?: string;
  position?: string;
  department?: string;
};

export type RequestSuperAdminEmailChangePayload = {
  newEmail: string;
  password: string;
};

export type RequestSuperAdminEmailChangeResponse = {
  message: string;
  mockCodeForDevelopment?: string;
};

export type ConfirmSuperAdminEmailChangePayload = { code: string };
```

### Админка: контент (посты и баннеры)

`src/features/admin-posts-banners-management/model/types.ts`:

```ts
export type AdminPostStatus = 'draft' | 'published' | 'archived';
export type BannerPlacement = 'home_hero' | 'posts' | 'specialists' | 'shop';
export type AdminBannerStatus = 'draft' | 'published' | 'archived';
export type BannerLinkTarget = 'home' | 'posts' | 'specialists' | 'shop' | 'profile';

export type AdminManagedPost = {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  coverImageUrl?: string;
  tags: string[];
  status: AdminPostStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminManagedBanner = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTarget: BannerLinkTarget;
  linkedPostId?: string;
  placement: BannerPlacement;
  status: AdminBannerStatus;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminPostsBannersResponse = {
  posts: AdminManagedPost[];
  banners: AdminManagedBanner[];
};

export type SaveAdminPostPayload = {
  id?: string;
  title: string;
  content: string;
  imageUrls: string[];
  coverImageUrl?: string;
  tags: string[];
  status: AdminPostStatus;
};

export type SaveAdminBannerPayload = {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  placement: BannerPlacement;
  linkTarget: BannerLinkTarget;
  linkedPostId?: string;
  status: AdminBannerStatus;
  startsAt?: string;
  endsAt?: string;
};
```

### Админка: восстановление пароля (форма)

`src/features/admin-password-recovery/model/types.ts`:

```ts
export type AdminPasswordRecoveryRequest = { email: string };
export type AdminPasswordRecoveryResponse = { success: true };
```

### Супер-админ: администраторы и заявки на сброс пароля

`src/features/super-admin-admins-management/model/types.ts`:

```ts
export type ManagedAdminRole = 'admin' | 'super_admin';
export type ManagedAdminStatus = 'active' | 'inactive';

export type ManagedAdmin = {
  id: string;
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  phone?: string;
  position?: string;
  department?: string;
  status: ManagedAdminStatus;
  role: ManagedAdminRole;
  createdAt: string;
  createdBy: string;
  lastLoginAt?: string | null;
  isBlocked?: boolean;
  blockReason?: string;
  blockedUntil?: string | null;
  isPermanentBlock?: boolean;
  passwordAttemptsLockUntil?: string | null;
  failedPasswordAttempts?: number;
};

export type CreateAdminPayload = {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  phone?: string;
  position?: string;
  department?: string;
  consent: boolean;
};

export type CreateAdminResponse = {
  admin: ManagedAdmin;
  temporaryPassword: string;
};

export type DeleteAdminPayload = { adminId: string };

export type UpdateAdminPayload = {
  adminId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  phone?: string;
  position?: string;
  department?: string;
};

export type UpdateAdminBlockStatusPayload = {
  adminId: string;
  isBlocked: boolean;
  blockReason?: string;
  blockedUntil?: string;
  isPermanentBlock?: boolean;
};

export type ClearAdminPasswordLockPayload = { adminId: string };
```

`src/features/admin-password-recovery-management/model/types.ts`:

```ts
export type AdminPasswordRecoveryRequestStatus = 'pending' | 'processed';

export type AdminPasswordRecoveryRequestItem = {
  id: string;
  email: string;
  requestedAt: string;
  status: AdminPasswordRecoveryRequestStatus;
  processedAt?: string;
  temporaryPassword?: string;
};

export type ProcessAdminPasswordRecoveryPayload = { requestId: string };

export type ProcessAdminPasswordRecoveryResponse = {
  request: AdminPasswordRecoveryRequestItem;
  temporaryPassword: string;
};
```

### Обратная связь

`src/shared/api/feedbackApi.ts`:

```ts
export type FeedbackRequest = {
  name: string;
  email: string;
  message: string;
};

export type FeedbackResponse = { ok: true };
```

### Срез mock-db (верхний уровень)

`src/shared/mock-db/types.ts` — как связаны крупные блоки данных в локальном хранилище:

- `auth.baseAccounts`, `auth.adminAttempts`
- `specialists.managed`
- `accountDeletion.softDeleteByUserId`, `permanentUserIds`, `deletionEmailOutbox`
- `orders.service`
- `shop.categories`, `products`, `orders`, `pickupPoints`
- `client.profiles`, `petsByUserId`, `breeds`
- `reviews.contexts`, `reviews.list`
- `applications.specialist`
- `superAdmin.admins`
- `adminPasswordRecovery.requests`
- `register` (сессия регистрации)
- `legacyProductOrders`
- `cms.posts`, `cms.banners`
- `messages.threads`, `messages.items`

---

## 3. Профиль клиента (`/me/profile`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/me/profile` | Текущий `UserProfile` |
| PUT | `/me/profile/contacts` | Тело: `Pick<UserProfile, 'city' \| 'phone'>` |
| PUT | `/me/profile/main` | Тело: `Pick<UserProfile, 'firstName' \| 'lastName' \| 'middleName' \| 'avatarUrl'>` |

Загрузка аватара: либо URL после `POST` на отдельный upload-эндпоинт (не задан на фронте явно — оставить на усмотрение бэка), либо `avatarUrl` с CDN.

---

## 4. Питомцы и породы

### 4.1. Модели

```ts
type PetType =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rodent'
  | 'rabbit'
  | 'reptile'
  | 'fish'
  | 'amphibian';

type PetSize =
  | 'up_to_2kg'
  | '2_5kg'
  | '5_10kg'
  | '10_20kg'
  | 'over_20kg';

type PetGender = 'male' | 'female';
type PetAttitude = 'friendly' | 'neutral' | 'aggressive' | 'unknown';
type PetHomeAlone = 'ok' | 'not_ok' | 'unknown';
type PetVaccinated = 'yes' | 'no' | 'unknown';

type Pet = {
  id: string;
  photoUrl?: string;
  name: string;
  type: PetType | null;
  breedId: string | null;
  ageYears: number;
  ageMonths: number;
  size: PetSize | null;
  gender: PetGender | null;
  toOtherPets: PetAttitude | null;
  toKidsUnder10: PetAttitude | null;
  staysHomeAlone: PetHomeAlone | null;
  vaccinated: PetVaccinated | null;
  notes: string;
};

type Breed = { id: string; type: PetType; title: string };
```

### 4.2. Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/me/pets` | Список питомцев текущего пользователя |
| PUT | `/me/pets/:petId` | Создание/обновление (полное тело `Pet`) |
| DELETE | `/me/pets/:petId` | Ответ `{ id: string }` |
| GET | `/pets/breeds` | Справочник пород (публичный или с кэшем) |

---

## 5. Поиск специалистов и карта

Фронт вызывает **`GET /specialists`** и передаёт query-фильтры из `SearchFilters`: `cityQuery`, `districtQuery`, `serviceId`, `priceMin`, `priceMax`, `experienceMinYears`, `hasReviewsOnly`. Backend должен применять эти фильтры на сервере и возвращать `Specialist[]`.

**Модель элемента списка (укороченно):**

```ts
type Specialist = {
  id: string;
  name: string;
  avatarUrl: string | null;
  city: string;
  district: string;
  description: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  location: { lat: number; lon: number };
  services: SpecialistService[]; // serviceId, petTypes, priceFrom, ...
  availabilityWeekdays?: number[];
  calendarSlots?: SpecialistCalendarSlot[];
};
```

**Геокодинг 2GIS** на фронте выполняется в браузере (ключ `VITE_2GIS_API_KEY`); отдельных backend-эндпоинтов под это в коде нет.

---

## 6. Профиль специалиста (публичный и редактирование)

Большая модель в `src/features/specialist-profile/model/types.ts` (`SpecialistProfile`, календарь, услуги, отзывы, галереи).

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/specialists/:slug` | `SpecialistProfileResponse` (без `isOwner`; владельца фронт вычисляет по сессии) |
| GET | `/specialists/by-id/:id` | `SpecialistProfileResponse` по `specialistId`, без двусмысленности со slug |
| GET | `/specialists/:slug/edit-options` | Справочники для редактирования профиля (`SpecialistProfileEditOptionsResponse`) |
| PATCH | `/specialists/:slug/main` | Основные контакты |
| PATCH | `/specialists/:slug/details` | Опыт, жильё, галерея, текст. Услуги не принимает |
| POST | `/specialists/:slug/services` | Создать услугу (`SpecialistServiceCreatePayload`) |
| PATCH | `/specialists/:slug/services/:serviceId` | Обновить существующую услугу (`SpecialistServiceEditPayload`) |
| DELETE | `/specialists/:slug/services/:serviceId` | Удалить услугу |
| PATCH | `/specialists/:slug/calendar` | Календарь, слоты, правила |
| PUT | `/specialists/:slug/reviews/:reviewId/reply` | Тело `{ text: string }` — ответ на отзыв |
| POST | `/specialists/:slug/email-change/send-code` | Отправить код смены email специалиста |
| POST | `/specialists/:slug/email-change/verify-code` | Подтвердить код смены email и вернуть обновлённый профиль |

---

## 7. Заказы услуг и товаров

Типы: `ServiceOrder`, `CreateServiceOrderPayload`, `ProductOrder`, статусы и пр. — `src/features/orders/model/types.ts`.

### 7.1. Услуги

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/me/orders/services` | Query `?status=` для фильтра (кроме `all`) |
| GET | `/me/orders/services/:orderId` | Детали |
| POST | `/me/orders/services` | Создание (`CreateServiceOrderPayload`) |
| POST | `/me/orders/services/:orderId/confirm` | Подтверждение |
| POST | `/me/orders/services/:orderId/start` | Старт |
| POST | `/me/orders/services/:orderId/complete` | Завершение |
| POST | `/me/orders/services/:orderId/cancel` | Отмена |
| POST | `/me/orders/services/:orderId/repeat` | Повтор → `{ ok: true, draftPayload? }` |
| POST | `/me/orders/services/:orderId/review` | Тело `LeaveServiceReviewPayload` (рейтинг, текст, фото) |

Все `/me/orders/services*` должны быть role-aware по JWT: клиент получает свои заказы как заказчик, специалист получает заказы, где он исполнитель (`specialistId`/`specialistSlug` из сессии), админские роли не должны получать клиентский/специалистский список через этот endpoint.

### 7.2. Товары (история заказов магазина)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/me/orders/products` | Список `ProductOrder` |
| GET | `/me/orders/products/:orderId` | Детали |
| POST | `/me/orders/products/:orderId/cancel` | Отмена |
| POST | `/me/orders/products/:orderId/repeat` | Черновик повтора (`ProductOrderRepeatCheckoutDraft`) |

---

## 8. Магазин (каталог и оформление)

Модели: `Product`, `CatalogFilterState`, `Order`, `CheckoutForm`, `PickupPoint` — `src/features/shop/model/types.ts`.

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/shop/catalog/meta` | Категории, диапазон цен, сортировки |
| GET | `/shop/products` | Фильтры: search, categoryIds, minPrice, maxPrice, onlyAvailable, sort, page, limit |
| GET | `/shop/products/by-ids` | Query `ids` — список через запятую |
| GET | `/shop/products/:slug` | Карточка товара |
| GET | `/cart` | Серверная корзина текущего клиента |
| POST | `/cart` | Добавить позицию серверной корзины: `{ productId: string; quantity: number }` |
| PUT | `/cart` | Обновить серверную корзину |
| DELETE | `/cart` | Очистить серверную корзину текущего клиента |
| PUT | `/cart/:productId` | Обновить количество товара в корзине |
| DELETE | `/cart/:productId` | Удалить товар из корзины |
| GET | `/shop/pickup-points` | Query `city` |
| POST | `/shop/orders` | Тело `{ form: CheckoutForm; items: { productId, quantity }[] }` (допустим PascalCase вариант `Form/Items`) |
| GET | `/shop/orders/:orderId` | Заказ |
| POST | `/shop/orders/:orderId/cancel` | Отмена |
| POST | `/shop/orders/:orderId/pay` | Тело `{ paymentMethod: 'card' \| 'sbp' }` |

---

## 9. Отзывы (после заказа услуги)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/me/reviews/context/:orderId` | Контекст для формы (`ReviewContext`) |
| POST | `/me/reviews` | Тело `ReviewCreatePayload` → созданный `Review` |

---

## 10. Сообщения / чаты

Модели: `MessagesSnapshot`, `ChatMessage`, `MessageThread`, `MessagesViewer` и др. — `src/features/messages/model/types.ts`.

Все методы **POST**, в теле передаётся `viewer` и прочие DTO:

| Путь | Назначение |
|------|------------|
| `/me/messages/snapshot` | Полный снимок чатов |
| `/me/messages/unread-summary` | Счётчики непрочитанного |
| `/me/messages/threads/support` | Создать/открыть тред поддержки |
| `/me/messages/threads/specialist-direct` | Чат с специалистом |
| `/me/messages/threads/client-direct` | Чат с клиентом (для специалиста) |
| `/me/messages/read` | Отметить прочитанным |
| `/me/messages/send` | Отправить сообщение (текст, вложения) |

Для вложений потребуется загрузка файлов (отдельный upload + URL в сообщении).

---

## 11. Безопасность аккаунта (клиент)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/me/security/email/change/request` | Ответ: `{ requestId, maskedOldEmail }` |
| POST | `/me/security/email/change/confirm` | `{ requestId, code, newEmail }` → `{ ok: true }` |
| POST | `/me/security/password/change` | `{ oldPassword, newPassword }` → `{ ok: true }` |

---

## 12. Удаление аккаунта

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/account/deletion/request` | `{ userId, password }` → `{ ok: true, restoreDeadlineIso }` |
| GET | `/account/deletion/restore-preview` | Query `token` → `AccountDeletionRestorePreview` |
| POST | `/account/deletion/restore` | `{ token }` |

```ts
type AccountDeletionRestorePreview = {
  email: string;
  roleLabel: string;
  displayName: string;
  restoreDeadlineIso: string;
};
```

---

## 13. Посты и баннеры (публичные)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/posts/latest` | Query `limit` |
| GET | `/posts` | Пагинация: page, pageSize, sort, search, tag |
| GET | `/posts/:id` | Один пост |

Типы: `Post`, `PostsListResponse` — `src/features/posts/model/types.ts`.

---

## 14. Главная страница

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/services` | Список услуг для блока на главной (`ServiceConfig`: id, title, subtitle, iconUrl) |
| GET | `/home/reviews` | Лучшие отзывы: query `rating`, `limit`, `requirePhotos`, `minTextLength`, `minWords` |

Баннеры на главной в реальном режиме строятся из **последних постов** (`postsApi.getLatestPosts`), не из отдельного API.

---

## 15. Обратная связь

| Метод | Путь | Тело | Ответ |
|-------|------|------|--------|
| POST | `/support/feedback` | `{ name, email, message }` | `{ ok: true }` |

---

## 16. Заявки на роль специалиста

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/specialist-applications` | Публичная заявка (`CreateSpecialistApplicationPayload`) → `{ id: string }` |
| GET | `/admin/specialist-applications` | Список (админ) |
| POST | `/admin/specialist-applications/:id/assign-interview` | Назначить собеседование |
| POST | `/admin/specialist-applications/:id/reject` | Отклонить |
| POST | `/admin/specialist-applications/:id/approve` | Одобрить; тело `{ note?: string, reviewedBy: string }` |
| POST | `/admin/specialist-applications/:id/attach-specialist-account` | Привязать созданный аккаунт специалиста |
| POST | `/admin/specialist-applications/:id/create-specialist-account` | Атомарно создать аккаунт специалиста из одобренной заявки и привязать его |

Модель `SpecialistApplication` и анкета — `src/features/specialist-applications/model/types.ts`.

`POST /admin/specialist-applications/:id/create-specialist-account` — основной контракт для создания кабинета специалиста из админки. Gateway должен выполнить создание auth/account записи специалиста и обновление заявки в одной транзакции. Если заявка не одобрена, уже привязана, email занят или нет прав, операция должна завершиться ошибкой без частично созданного аккаунта.

---

## 17. Админка: пользователи и специалисты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/admin/users` | `ManagedUser[]` |
| PATCH | `/admin/users/:userId/roles/:role/block-status` | Role-aware блокировка (`role`: `client` или `specialist`) |
| PATCH | `/admin/users/:userId/profile` | ФИО, `specialistSlug` для специалиста |
| POST | `/admin/users/:userId/roles/:role/restore-from-deletion` | Role-aware восстановление из soft-delete |
| POST | `/admin/specialists` | Legacy: создать аккаунт специалиста без привязки заявки. Для сценария заявки использовать атомарный `/admin/specialist-applications/:id/create-specialist-account` |

---

## 18. Админка: профиль администратора

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/admin/profile` | `AdminProfile` |
| PATCH | `/admin/profile` | Обновление полей |
| POST | `/admin/profile/email-change/request` | Смена email (super_admin) |
| POST | `/admin/profile/email-change/confirm` | Подтверждение кода |
| DELETE | `/admin/profile/email-change` | Отмена смены email |
| DELETE | `/admin/profile/password-attempts-lock` | Сброс блокировки по попыткам пароля |

---

## 19. Админка: контент (посты и баннеры)

| Метод | Путь |
|-------|------|
| GET | `/admin/content` |
| POST | `/admin/content/posts` |
| PUT | `/admin/content/posts/:id` |
| DELETE | `/admin/content/posts/:id` |
| POST | `/admin/content/banners` |
| PUT | `/admin/content/banners/:id` |
| DELETE | `/admin/content/banners/:id` |

Типы: `AdminManagedPost`, `AdminManagedBanner` — `src/features/admin-posts-banners-management/model/types.ts`.

---

## 20. Админка: восстановление пароля (заявка)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/admin/password-recovery` | `{ email }` → `{ success: true }` |

---

## 21. Админка: безопасность (смена пароля в админке)

| Метод | Путь |
|-------|------|
| POST | `/admin/security/password/change` |

---

## 22. Супер-админ: администраторы и заявки на сброс пароля

| Метод | Путь |
|-------|------|
| GET | `/super-admin/admins` |
| POST | `/super-admin/admins` |
| DELETE | `/super-admin/admins/:adminId` |
| PATCH | `/super-admin/admins/:adminId` |
| PATCH | `/super-admin/admins/:adminId/block` |
| DELETE | `/super-admin/admins/:adminId/password-attempts-lock` |
| GET | `/super-admin/password-recovery-requests` |
| POST | `/super-admin/password-recovery-requests/:requestId/process` |

Типы: `ManagedAdmin`, `CreateAdminPayload`, `ProcessAdminPasswordRecoveryPayload` и др. — `src/features/super-admin-admins-management/model/types.ts` и `admin-password-recovery-management/model/types.ts`.

---

## 23. Итоговый чеклист для бэкенда

1. **Полный каталог моделей** — см. раздел **«Полный каталог моделей данных»** выше: там перечислены все основные TypeScript-типы из фронта (заказы, магазин, специалисты, чаты, админка и т.д.).  
2. **Профиль и регистрация:** хранить ФИО, город, телефон, связь с `cityId`, аватар; многошаговая регистрация как в §2.3 или адаптация Gateway к вашим `/auth/register` + `/auth/confirm-email`.  
3. **Единый стиль JWT:** claims или ответ логина должны заполнять `AuthUser` (в т.ч. `specialistId` / `specialistSlug` / `adminId` по роли).  
4. **Согласовать** пути восстановления пароля и смены email/пароля между `/auth/*` (у вас) и `/me/security/*` + `/auth/password-recovery/*` (фронт).  
5. Реализовать **все** `/me/*`, `/shop/*`, `/specialists*`, заказы, чаты, контент и админские маршруты из разделов 3–22 — без этого соответствующие экраны останутся на моках.

---

*Документ сгенерирован по состоянию репозитория; при изменении `*Api.ts` имеет смысл обновить этот файл.*
