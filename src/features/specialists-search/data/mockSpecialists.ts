// src/features/specialists-search/data/mockSpecialists.ts
/** Список специалистов строится из mock-db при чтении (см. accessors/derived/specialistListing). */

import { cloneSpecialistListing } from '@/shared/mock-db/accessors';

import type { SpecialistProfileResponse } from '@/features/specialist-profile/model/types';

export function cloneSpecialists() {
  return cloneSpecialistListing();
}

/** @deprecated Слоты пересчитываются при чтении списка. */
export function syncMockSpecialistCalendarSlotsFromProfile(
  _profile: SpecialistProfileResponse,
): void {
  /* no-op: derived listing */
}

/** @deprecated Статистика пересчитывается при чтении списка. */
export function syncMockSpecialistListingStatsFromProfile(
  _profile: SpecialistProfileResponse,
): void {
  /* no-op: derived listing */
}

/** @deprecated */
export function refreshAllMockSpecialistListingStatsFromOrders(): void {
  /* no-op */
}
