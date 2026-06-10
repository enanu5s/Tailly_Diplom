// src/features/specialist-profile/data/mockSpecialistProfiles.ts

import {
  findSpecialistProfileById,
  findSpecialistProfileBySlug,
  findSpecialistProfileIndexBySlug,
  readSpecialistProfiles,
  updateSpecialistProfile,
  withComputedStats,
} from '@/shared/mock-db/accessors';

import type { SpecialistProfileResponse } from '../model/types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function cloneProfile(profile: SpecialistProfileResponse): SpecialistProfileResponse {
  return clone(profile);
}

export function normalizeProfileKey(value: string): string {
  return decodeURIComponent(value).trim().toLowerCase();
}

export function findProfileIndexBySlug(slug: string): number {
  return findSpecialistProfileIndexBySlug(slug);
}

export function getProfileAtIndex(index: number): SpecialistProfileResponse | undefined {
  return readSpecialistProfiles()[index];
}

export function patchProfileAtIndex(
  index: number,
  updater: (profile: SpecialistProfileResponse) => SpecialistProfileResponse,
): SpecialistProfileResponse | null {
  const profile = getProfileAtIndex(index);
  if (!profile) {
    return null;
  }

  return updateSpecialistProfile(profile.id, updater);
}

export function patchProfileBySlug(
  slug: string,
  updater: (profile: SpecialistProfileResponse) => SpecialistProfileResponse,
): SpecialistProfileResponse | null {
  const index = findProfileIndexBySlug(slug);
  if (index === -1) {
    return null;
  }

  return patchProfileAtIndex(index, updater);
}

export { findSpecialistProfileById, findSpecialistProfileBySlug, readSpecialistProfiles, withComputedStats };
