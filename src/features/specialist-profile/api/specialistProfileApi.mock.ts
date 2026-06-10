// src/features/specialist-profile/api/specialistProfileApi.mock.ts

import {
  getMockServiceOrderById,
  updateMockServiceOrder,
} from '@/features/orders/data/mockOrders';
import { notifySpecialistServicesChanged } from '@/shared/lib/emailNotifications';

import {
  delay,
  cloneProfile,
  findProfileIndexBySlug,
  getProfileAtIndex,
  patchProfileBySlug,
  readSpecialistProfiles,
} from '../data/mockSpecialistProfiles';
import { computeSpecialistStats } from '../lib/computeSpecialistStats';
import { SpecialistEmailChangeError } from '../model/types';

import type {
  SpecialistCalendarUpdatePayload,
  SpecialistDetailsUpdatePayload,
  SpecialistProfileEditOptionsResponse,
  SpecialistEmailChangeSendCodePayload,
  SpecialistEmailChangeSendCodeResponse,
  SpecialistEmailChangeVerifyCodePayload,
  SpecialistEmailChangeVerifyCodeResponse,
  SpecialistMainInfoUpdatePayload,
  SpecialistProfileResponse,
  SpecialistReviewReplyUpsertPayload,
  SpecialistService,
  SpecialistServiceCreatePayload,
  SpecialistServiceEditPayload,
} from '../model/types';

const MOCK_PET_TYPE_ALIAS_OPTIONS: SpecialistProfileEditOptionsResponse['petTypeAliasOptions'] = [
  { id: 'cat', label: 'Кошка', type: 'cat' },
  { id: 'dog', label: 'Собака', type: 'dog' },
  { id: 'fish', label: 'Рыбка', type: 'fish' },
  { id: 'hamster', label: 'Хомяк', type: 'rodent' },
  { id: 'guinea-pig', label: 'Морская свинка', type: 'rodent' },
  { id: 'rabbit', label: 'Кролик', type: 'rabbit' },
  { id: 'turtle', label: 'Черепаха', type: 'reptile' },
  { id: 'rat', label: 'Крыса', type: 'rodent' },
  { id: 'mouse', label: 'Мышь', type: 'rodent' },
  { id: 'bird', label: 'Птица', type: 'bird' },
  { id: 'chinchilla', label: 'Шиншилла', type: 'rodent' },
  { id: 'ferret', label: 'Хорек', type: 'rodent' },
  { id: 'lizard', label: 'Ящерица', type: 'reptile' },
  { id: 'snake', label: 'Змея', type: 'reptile' },
  { id: 'snail', label: 'Улитка', type: 'reptile' },
];

const EMAIL_CHANGE_MAX_ATTEMPTS = 3;
const EMAIL_CHANGE_LOCK_MS = 60 * 60 * 1000;

type EmailChangeSession = {
  code: string;
  nextEmail: string;
  attemptsUsed: number;
  lockUntilMs: number | null;
};

const emailChangeSessionsBySpecialistSlug = new Map<string, EmailChangeSession>();

function getAttemptsLeft(session: EmailChangeSession): number {
  return Math.max(0, EMAIL_CHANGE_MAX_ATTEMPTS - session.attemptsUsed);
}

function toIsoOrNull(timestampMs: number | null): string | null {
  return timestampMs ? new Date(timestampMs).toISOString() : null;
}

function createCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeTime(value: string, fallback: string): string {
  const trimmed = value.trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

function notifyServicesChanged(
  currentProfile: SpecialistProfileResponse,
  lines: string[],
): void {
  if (lines.length === 0) {
    return;
  }

  const email = currentProfile.main.email?.trim().toLowerCase();
  if (!email?.includes('@')) {
    return;
  }

  notifySpecialistServicesChanged({
    specialistEmail: email,
    specialistName:
      `${currentProfile.main.firstName} ${currentProfile.main.lastName}`.trim(),
    lines,
  });
}

function normalizePositiveMinutes(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.round(value);
}

function withComputedStats(profile: SpecialistProfileResponse): SpecialistProfileResponse {
  const stats = computeSpecialistStats({
    id: profile.id,
    slug: profile.slug,
    experienceYears: profile.stats.experienceYears,
    reviews: profile.reviews,
  });

  const merged: SpecialistProfileResponse = {
    ...profile,
    stats,
  };

  return merged;
}

export async function mockGetSpecialistProfileBySlug(
  slug: string,
): Promise<SpecialistProfileResponse> {
  await delay(350);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const profile = getProfileAtIndex(profileIndex);
  if (!profile) {
    throw new Error('Профиль специалиста не найден.');
  }

  return withComputedStats(cloneProfile(profile));
}

export async function mockGetSpecialistProfileById(
  id: string,
): Promise<SpecialistProfileResponse> {
  await delay(350);

  const profile = readSpecialistProfiles().find((item) => item.id === id);

  if (!profile) {
    throw new Error('Профиль специалиста не найден.');
  }

  return withComputedStats(cloneProfile(profile));
}

export async function mockGetSpecialistProfileEditOptions(
  slug: string,
): Promise<SpecialistProfileEditOptionsResponse> {
  await delay(250);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const profile = getProfileAtIndex(profileIndex);
  if (!profile) {
    throw new Error('Профиль специалиста не найден.');
  }

  return {
    serviceCatalog: profile.services.map((service) => ({
      id: service.id,
      name: service.name,
    })),
    petTypeAliasOptions: [...MOCK_PET_TYPE_ALIAS_OPTIONS],
  };
}

export async function mockUpdateMainInfo(
  slug: string,
  payload: SpecialistMainInfoUpdatePayload,
): Promise<SpecialistProfileResponse> {
  await delay(450);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const updated = patchProfileBySlug(slug, (currentProfile) => ({
    ...currentProfile,
    main: {
      avatarUrl: payload.avatarUrl?.trim() || undefined,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      middleName: payload.middleName?.trim() || undefined,
      city: payload.city.trim(),
      district: payload.district.trim(),
      phone: payload.phone.trim(),
      email: currentProfile.main.email,
    },
  }));

  if (!updated) {
    throw new Error('Профиль специалиста не найден.');
  }

  return withComputedStats(cloneProfile(updated));
}

export async function mockSendEmailChangeCode(
  slug: string,
  payload: SpecialistEmailChangeSendCodePayload,
): Promise<SpecialistEmailChangeSendCodeResponse> {
  await delay(350);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const nextEmail = payload.nextEmail.trim().toLowerCase();

  if (!nextEmail || !nextEmail.includes('@')) {
    throw new SpecialistEmailChangeError({
      message: 'Укажи корректный email.',
    });
  }

  const existingSession = emailChangeSessionsBySpecialistSlug.get(slug);
  const now = Date.now();

  if (existingSession?.lockUntilMs && existingSession.lockUntilMs > now) {
    throw new SpecialistEmailChangeError({
      message: 'Лимит попыток исчерпан. Повторный запрос будет доступен позже.',
      attemptsLeft: 0,
      lockUntil: toIsoOrNull(existingSession.lockUntilMs),
    });
  }

  const session: EmailChangeSession = {
    code: createCode(),
    nextEmail,
    attemptsUsed: existingSession?.attemptsUsed ?? 0,
    lockUntilMs: null,
  };

  emailChangeSessionsBySpecialistSlug.set(slug, session);

  return {
    attemptsLeft: getAttemptsLeft(session),
    lockUntil: toIsoOrNull(session.lockUntilMs),
  };
}

export async function mockVerifyEmailChangeCode(
  slug: string,
  payload: SpecialistEmailChangeVerifyCodePayload,
): Promise<SpecialistEmailChangeVerifyCodeResponse> {
  await delay(350);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const session = emailChangeSessionsBySpecialistSlug.get(slug);

  if (!session) {
    throw new SpecialistEmailChangeError({
      message: 'Сессия подтверждения не найдена. Запроси код повторно.',
      attemptsLeft: EMAIL_CHANGE_MAX_ATTEMPTS,
      lockUntil: null,
    });
  }

  const now = Date.now();
  if (session.lockUntilMs && session.lockUntilMs > now) {
    throw new SpecialistEmailChangeError({
      message: 'Лимит попыток исчерпан. Повторный запрос будет доступен позже.',
      attemptsLeft: 0,
      lockUntil: toIsoOrNull(session.lockUntilMs),
    });
  }

  const submittedCode = payload.code.trim();
  const submittedEmail = payload.nextEmail.trim().toLowerCase();

  if (submittedEmail !== session.nextEmail || submittedCode !== session.code) {
    session.attemptsUsed += 1;

    if (session.attemptsUsed >= EMAIL_CHANGE_MAX_ATTEMPTS) {
      session.lockUntilMs = now + EMAIL_CHANGE_LOCK_MS;
      emailChangeSessionsBySpecialistSlug.set(slug, session);
      throw new SpecialistEmailChangeError({
        message: 'Код введен неверно. Достигнут лимит попыток.',
        attemptsLeft: 0,
        lockUntil: toIsoOrNull(session.lockUntilMs),
      });
    }

    emailChangeSessionsBySpecialistSlug.set(slug, session);
    throw new SpecialistEmailChangeError({
      message: 'Код введен неверно.',
      attemptsLeft: getAttemptsLeft(session),
      lockUntil: toIsoOrNull(session.lockUntilMs),
    });
  }

  const updated = patchProfileBySlug(slug, (profile) => ({
    ...profile,
    main: { ...profile.main, email: session.nextEmail },
  }));
  emailChangeSessionsBySpecialistSlug.delete(slug);

  if (!updated) {
    throw new Error('Профиль специалиста не найден.');
  }

  return {
    profile: withComputedStats(cloneProfile(updated)),
    attemptsLeft: EMAIL_CHANGE_MAX_ATTEMPTS,
    lockUntil: null,
  };
}

export async function mockUpdateDetails(
  slug: string,
  payload: SpecialistDetailsUpdatePayload,
): Promise<SpecialistProfileResponse> {
  await delay(500);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const updated = patchProfileBySlug(slug, (currentProfile) => ({
    ...currentProfile,
    specialistGallery: (payload.specialistGallery ?? []).map((item, index) => ({
      id: item.id || `specialist-gallery-${Date.now()}-${index}`,
      imageUrl: item.imageUrl.trim(),
      alt: item.alt.trim() || `Фото специалиста ${index + 1}`,
    })),
    details: {
      experienceLabel: payload.experienceLabel.trim(),
      experienceDurationValue: payload.experienceDurationValue,
      experienceDurationUnit: payload.experienceDurationUnit,
      housingType: payload.housingType,
      petSizes: [...payload.petSizes],
      petAges: [...payload.petAges],
      hasChildrenUnderTen: payload.hasChildrenUnderTen,
      petTypes: [...payload.petTypes],
      advantages: payload.advantages
        .map((title, index) => ({
          id: `adv-${Date.now()}-${index}`,
          title: title.trim(),
        }))
        .filter((item) => item.title.length > 0),
      about: payload.about.trim(),
    },
  }));

  if (!updated) {
    throw new Error('Профиль специалиста не найден.');
  }

  return withComputedStats(cloneProfile(updated));
}

export async function mockCreateService(
  slug: string,
  payload: SpecialistServiceCreatePayload,
): Promise<SpecialistProfileResponse> {
  await delay(300);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const service: SpecialistService = {
    id: `service-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: payload.name.trim(),
    locationLabel: payload.locationLabel.trim(),
    description: payload.description?.trim() || undefined,
    price: payload.price,
    priceUnit: payload.priceUnit,
    bookingPolicy: payload.bookingPolicy,
  };

  const updated = patchProfileBySlug(slug, (currentProfile) => ({
    ...currentProfile,
    services: [...currentProfile.services, service],
  }));

  if (!updated) {
    throw new Error('Профиль специалиста не найден.');
  }

  notifyServicesChanged(updated, [
    `Добавлена услуга «${service.name}» — ${service.price} ₽ (${service.locationLabel}).`,
  ]);

  return withComputedStats(cloneProfile(updated));
}

export async function mockUpdateService(
  slug: string,
  serviceId: string,
  payload: SpecialistServiceEditPayload,
): Promise<SpecialistProfileResponse> {
  await delay(300);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const service: SpecialistService = {
    id: serviceId,
    name: payload.name.trim(),
    locationLabel: payload.locationLabel.trim(),
    description: payload.description?.trim() || undefined,
    price: payload.price,
    priceUnit: payload.priceUnit,
    bookingPolicy: payload.bookingPolicy,
  };

  const updated = patchProfileBySlug(slug, (currentProfile) => {
    const serviceIndex = currentProfile.services.findIndex((s) => s.id === serviceId);
    if (serviceIndex === -1) {
      throw new Error('Услуга не найдена.');
    }

    const services = [...currentProfile.services];
    services[serviceIndex] = service;

    return { ...currentProfile, services };
  });

  if (!updated) {
    throw new Error('Профиль специалиста не найден.');
  }

  notifyServicesChanged(updated, [
    `Обновлена услуга «${service.name}» (изменились название, цена, локация или правила бронирования).`,
  ]);

  return withComputedStats(cloneProfile(updated));
}

export async function mockDeleteService(
  slug: string,
  serviceId: string,
): Promise<SpecialistProfileResponse> {
  await delay(300);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const currentProfile = getProfileAtIndex(profileIndex);
  const service = currentProfile?.services.find((item) => item.id === serviceId);

  if (!service) {
    throw new Error('Услуга не найдена.');
  }

  const updated = patchProfileBySlug(slug, (profile) => ({
    ...profile,
    services: profile.services.filter((item) => item.id !== serviceId),
  }));

  if (!updated) {
    throw new Error('Профиль специалиста не найден.');
  }

  notifyServicesChanged(updated, [`Услуга «${service.name}» удалена из профиля.`]);

  return withComputedStats(cloneProfile(updated));
}

export async function mockUpdateCalendar(
  slug: string,
  payload: SpecialistCalendarUpdatePayload,
): Promise<SpecialistProfileResponse> {
  await delay(450);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const currentProfile = getProfileAtIndex(profileIndex);
  if (!currentProfile) {
    throw new Error('Профиль специалиста не найден.');
  }

  const nextCalendar = {
    ...currentProfile.calendar,
    timezone: payload.timezone.trim(),
    dayOverrides: payload.dayOverrides.map((item) => ({
      date: item.date,
      status: item.status,
    })),
    availabilityWindows: payload.availabilityWindows.map((item, index) => ({
      id: item.id || `window-${Date.now()}-${index}`,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      serviceIds: [...item.serviceIds],
      comment: item.comment?.trim() || undefined,
    })),
    bookingSettings: {
      dayStartTime: normalizeTime(payload.bookingSettings.dayStartTime, '10:00'),
      dayEndTime: normalizeTime(payload.bookingSettings.dayEndTime, '19:00'),
      slotStepMinutes: normalizePositiveMinutes(
        payload.bookingSettings.slotStepMinutes,
        60,
      ),
      defaultDurationMinutes: normalizePositiveMinutes(
        payload.bookingSettings.defaultDurationMinutes,
        60,
      ),
    },
  };

  if (payload.availabilityRules !== undefined) {
    nextCalendar.availabilityRules = payload.availabilityRules.map((item, index) => ({
      id: item.id || `rule-${Date.now()}-${index}`,
      title: item.title,
      serviceIds: [...item.serviceIds],
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      recurrence: item.recurrence,
      isEnabled: item.isEnabled,
      comment: item.comment?.trim() || undefined,
    }));
  }

  if (payload.availabilityOverrides !== undefined) {
    nextCalendar.availabilityOverrides = payload.availabilityOverrides.map(
      (item, index) => ({
        id: item.id || `override-${Date.now()}-${index}`,
        targetDate: item.targetDate,
        editScope: item.editScope,
        sourceRuleId: item.sourceRuleId,
        serviceIds: item.serviceIds ? [...item.serviceIds] : undefined,
        startTime: item.startTime,
        endTime: item.endTime,
        removeAvailability: item.removeAvailability,
        comment: item.comment?.trim() || undefined,
      }),
    );
  }

  const updated = patchProfileBySlug(slug, (profile) => ({
    ...profile,
    calendar: nextCalendar,
  }));

  if (!updated) {
    throw new Error('Профиль специалиста не найден.');
  }

  return withComputedStats(cloneProfile(updated));
}

export async function mockUpsertReviewReply(
  slug: string,
  payload: SpecialistReviewReplyUpsertPayload,
): Promise<SpecialistProfileResponse> {
  await delay(400);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  const now = new Date();
  const createdAt = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const createdAtIso = now.toISOString();
  const trimmedReply = payload.text.trim();

  const updated = patchProfileBySlug(slug, (currentProfile) => {
    const reviewIndex = currentProfile.reviews.findIndex(
      (review) => review.id === payload.reviewId,
    );

    if (reviewIndex === -1) {
      throw new Error('Отзыв не найден.');
    }

    const reviews = [...currentProfile.reviews];
    reviews[reviewIndex] = {
      ...reviews[reviewIndex]!,
      specialistReply: {
        text: trimmedReply,
        createdAt,
      },
    };

    return { ...currentProfile, reviews };
  });

  if (!updated) {
    throw new Error('Профиль специалиста не найден.');
  }

  const linkedOrderId = updated.reviews.find((r) => r.id === payload.reviewId)?.orderId;

  if (linkedOrderId) {
    const order = getMockServiceOrderById(linkedOrderId);

    if (order?.review) {
      updateMockServiceOrder(linkedOrderId, {
        review: {
          ...order.review,
          specialistReply: {
            comment: trimmedReply,
            createdAt: createdAtIso,
          },
        },
      });
    }
  }

  return withComputedStats(cloneProfile(updated));
}
