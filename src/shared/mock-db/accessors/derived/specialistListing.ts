// src/shared/mock-db/accessors/derived/specialistListing.ts

import { calendarSlotsFromSpecialistCalendar } from '@/features/specialists-search/data/mockSpecialistCalendar';
import type { Specialist } from '@/features/specialists-search/model/types';
import type { ServiceId } from '@/shared/config/services';
import { getDemoSpecialistDisplayNameForProfileId } from '@/shared/mock-db/seed/demoDataset.seed';
import { cloneDeep } from '@/shared/mock-db/cloneDeep';

import { readSpecialistProfiles, withComputedStats } from '../specialists';

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Москва: { lat: 55.7558, lon: 37.6173 },
  'Санкт-Петербург': { lat: 59.9343, lon: 30.3351 },
  Казань: { lat: 55.7887, lon: 49.1221 },
  Екатеринбург: { lat: 56.8389, lon: 60.6057 },
  Краснодар: { lat: 45.0355, lon: 38.9753 },
  Новосибирск: { lat: 55.0084, lon: 82.9357 },
};

const SERVICE_ID_MAP: Record<string, ServiceId> = {
  walking: 'walking',
  boarding: 'boarding',
  grooming: 'grooming',
  training: 'training',
  photoshoot: 'photoshoot',
};

function availabilityWeekdaysForIndex(index: number): number[] {
  const base = [1, 2, 3, 4, 5];
  const num = Number.parseInt(index.toString().replace(/\D/g, ''), 10) || 1;
  const rotated = base.filter((_, i) => (i + num) % 2 === 0);
  return rotated.length > 0 ? rotated : base;
}

export function buildSpecialistListingFromProfiles(): Specialist[] {
  const profiles = readSpecialistProfiles().map(withComputedStats);

  return profiles.map((profile, i) => {
    const loc = CITY_COORDS[profile.main.city] ?? CITY_COORDS['Москва']!;
    const jitter = (i + 1) * 0.012;
    const middle = profile.main.middleName?.trim();
    const displayName = middle
      ? `${profile.main.firstName} ${middle.charAt(0)}.`
      : getDemoSpecialistDisplayNameForProfileId(profile.id);

    const services = profile.services.map((s) => ({
      serviceId: (SERVICE_ID_MAP[s.id] ?? 'walking') as ServiceId | 'any',
      petTypes: profile.details.petTypes.slice(0, 2),
      priceFrom: s.price,
      priceTo: s.priceUnit === 'day' ? s.price * 2 : undefined,
      durationMinutes: s.bookingPolicy?.duration.defaultDurationMinutes,
      note: s.name,
    }));

    return {
      id: profile.id,
      name: displayName,
      avatarUrl: profile.main.avatarUrl ?? null,
      city: profile.main.city,
      district: profile.main.district,
      description: profile.details.about,
      rating: profile.stats.rating,
      reviewsCount: profile.stats.reviewsCount,
      experienceYears: profile.stats.experienceYears,
      location: { lat: loc.lat + jitter, lon: loc.lon + jitter },
      petSizeCategories: ['under_2', '2_to_8', '8_15', '15_25'],
      petAgeCategories: ['6mo_to_2', '2_to_5', 'over_5'],
      availabilityWeekdays: availabilityWeekdaysForIndex(i),
      services,
      calendarSlots: calendarSlotsFromSpecialistCalendar(profile.calendar, profile.services),
    };
  });
}

export function cloneSpecialistListing(): Specialist[] {
  return cloneDeep(buildSpecialistListingFromProfiles());
}
