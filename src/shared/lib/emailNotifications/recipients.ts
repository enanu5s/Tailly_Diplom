import { getMockAuthAccounts } from '@/features/auth/data/mockAuthAccounts';
import {
  findProfileIndexBySlug,
  getProfileAtIndex,
} from '@/features/specialist-profile/data/mockSpecialistProfiles';
import { readManagedSpecialistAccounts } from '@/shared/lib/mock/specialistAccountsStorage';

export function resolveClientEmailByUserId(userId: string): string | null {
  const id = userId.trim();
  if (!id) {
    return null;
  }
  const account = getMockAuthAccounts().find((item) => item.id === id);
  const email = account?.email?.trim().toLowerCase();
  return email && email.includes('@') ? email : null;
}

export function resolveSpecialistEmailBySlug(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const index = findProfileIndexBySlug(normalized);
  if (index !== -1) {
    const fromProfile = getProfileAtIndex(index)?.main.email?.trim().toLowerCase();
    if (fromProfile && fromProfile.includes('@')) {
      return fromProfile;
    }
  }

  const managed = readManagedSpecialistAccounts().find(
    (item) => item.specialistSlug?.toLowerCase() === normalized,
  );
  const fromManaged = managed?.email?.trim().toLowerCase();
  return fromManaged && fromManaged.includes('@') ? fromManaged : null;
}
