// src/features/specialist-profile/api/specialistProfileApi.mock.ts

import {
  delay,
  cloneProfile,
  findProfileIndexBySlug,
  MOCK_SPECIALIST_PROFILES,
} from '../data/mockSpecialistProfiles';

import type {
  SpecialistCalendarUpdatePayload,
  SpecialistDetailsUpdatePayload,
  SpecialistMainInfoUpdatePayload,
  SpecialistProfileResponse,
  SpecialistReviewReplyUpsertPayload,
} from '../model/types';

function normalizeTime(value: string, fallback: string): string {
  const trimmed = value.trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

function normalizePositiveMinutes(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.round(value);
}

export async function mockGetSpecialistProfileBySlug(
  slug: string,
): Promise<SpecialistProfileResponse> {
  await delay(350);

  const profileIndex = findProfileIndexBySlug(slug);

  if (profileIndex === -1) {
    throw new Error('Профиль специалиста не найден.');
  }

  return cloneProfile(MOCK_SPECIALIST_PROFILES[profileIndex]);
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

  const currentProfile = MOCK_SPECIALIST_PROFILES[profileIndex];

  Object.assign(currentProfile, {
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
  });

  return cloneProfile(currentProfile);
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

  const currentProfile = MOCK_SPECIALIST_PROFILES[profileIndex];

  Object.assign(currentProfile, {
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
    services: payload.services.map((service, index) => ({
      id: service.id || `service-${Date.now()}-${index}`,
      name: service.name.trim(),
      locationLabel: service.locationLabel.trim(),
      price: service.price,
      priceUnit: service.priceUnit,
    })),
  });

  return cloneProfile(currentProfile);
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

  const currentProfile = MOCK_SPECIALIST_PROFILES[profileIndex];

  Object.assign(currentProfile, {
    ...currentProfile,
    calendar: {
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
        dayStartTime: normalizeTime(
          payload.bookingSettings.dayStartTime,
          '10:00',
        ),
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
    },
  });

  return cloneProfile(currentProfile);
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

  const currentProfile = MOCK_SPECIALIST_PROFILES[profileIndex];

  const reviewIndex = currentProfile.reviews.findIndex(
    (review) => review.id === payload.reviewId,
  );

  if (reviewIndex === -1) {
    throw new Error('Отзыв не найден.');
  }

  const now = new Date();
  const createdAt = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  currentProfile.reviews[reviewIndex] = {
    ...currentProfile.reviews[reviewIndex],
    specialistReply: {
      text: payload.text.trim(),
      createdAt,
    },
  };

  return cloneProfile(currentProfile);
}