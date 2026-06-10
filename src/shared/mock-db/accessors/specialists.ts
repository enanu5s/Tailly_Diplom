// src/shared/mock-db/accessors/specialists.ts

import { computeSpecialistStats } from '@/features/specialist-profile/lib/computeSpecialistStats';
import type { SpecialistProfileResponse } from '@/features/specialist-profile/model/types';
import { cloneDeep } from '@/shared/mock-db/cloneDeep';
import {
  patchMockDatabase,
  persistMockDatabase,
  unsafeMutableMockDb,
} from '@/shared/mock-db/store';

import { readServiceOrders } from './orders';

function clone<T>(value: T): T {
  return cloneDeep(value);
}

export function readSpecialistProfiles(): SpecialistProfileResponse[] {
  return clone(unsafeMutableMockDb().specialists.profiles);
}

export function findSpecialistProfileById(id: string): SpecialistProfileResponse | undefined {
  const normalized = id.trim();
  return readSpecialistProfiles().find((p) => p.id === normalized);
}

export function findSpecialistProfileBySlug(slug: string): SpecialistProfileResponse | undefined {
  const normalized = decodeURIComponent(slug).trim().toLowerCase();
  return readSpecialistProfiles().find(
    (p) => p.slug.trim().toLowerCase() === normalized || p.id.trim().toLowerCase() === normalized,
  );
}

export function findSpecialistProfileIndexBySlug(slug: string): number {
  const normalized = decodeURIComponent(slug).trim().toLowerCase();
  return unsafeMutableMockDb().specialists.profiles.findIndex(
    (p) => p.slug.trim().toLowerCase() === normalized || p.id.trim().toLowerCase() === normalized,
  );
}

export function withComputedStats(profile: SpecialistProfileResponse): SpecialistProfileResponse {
  const next = clone(profile);
  next.stats = computeSpecialistStats({
    id: next.id,
    slug: next.slug,
    experienceYears: next.stats.experienceYears,
    reviews: next.reviews,
    orders: readServiceOrders(),
  });
  return next;
}

export function updateSpecialistProfile(
  profileId: string,
  updater: (profile: SpecialistProfileResponse) => SpecialistProfileResponse,
): SpecialistProfileResponse | null {
  let updated: SpecialistProfileResponse | null = null;

  patchMockDatabase((db) => {
    const index = db.specialists.profiles.findIndex((p) => p.id === profileId);
    if (index === -1) {
      return;
    }

    const next = updater(clone(db.specialists.profiles[index]!));
    db.specialists.profiles[index] = next;
    updated = next;
  });

  return updated;
}

export function replaceSpecialistProfiles(profiles: SpecialistProfileResponse[]): void {
  patchMockDatabase((db) => {
    db.specialists.profiles = clone(profiles);
  });
}

export function persistSpecialistProfilesDirect(
  mutator: (profiles: SpecialistProfileResponse[]) => void,
): void {
  const db = unsafeMutableMockDb();
  mutator(db.specialists.profiles);
  persistMockDatabase();
}
