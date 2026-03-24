//src/features/admin-specialists-management/api/adminSpecialistsManagementApi.mock.ts
import {
  readManagedSpecialistAccounts,
  upsertManagedSpecialistAccount,
  type ManagedSpecialistMockAccount,
} from '@/shared/lib/mock/specialistAccountsStorage';

import {
  buildSpecialistSlug,
  generateId,
  generateTemporaryPassword,
  mapCreatedAccountToResponse,
  wait,
} from '../data/mockAdminSpecialistsManagement';
import {
  AdminSpecialistsManagementError,
  type CreateSpecialistAccountPayload,
  type CreateSpecialistAccountResponse,
} from '../model/types';

export async function mockCreateSpecialistAccount(
  payload: CreateSpecialistAccountPayload,
): Promise<CreateSpecialistAccountResponse> {
  await wait();

  const existingAccounts = readManagedSpecialistAccounts();
  const normalizedEmail = payload.email.trim().toLowerCase();

  const emailTaken = existingAccounts.some(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );

  if (emailTaken) {
    throw new AdminSpecialistsManagementError('Специалист с таким email уже существует.');
  }

  const specialistId = generateId('specialist');
  const specialistSlug = buildSpecialistSlug(payload.firstName, payload.lastName);
  const temporaryPassword = generateTemporaryPassword();

  const createdAccount: ManagedSpecialistMockAccount = {
    id: specialistId,
    email: normalizedEmail,
    password: temporaryPassword,
    role: 'specialist',
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    middleName: payload.middleName?.trim() || undefined,
    phone: payload.phone?.trim() || undefined,
    city: payload.city.trim(),
    about: payload.about.trim(),
    specialistId,
    specialistSlug,
    applicationId: payload.applicationId,
    createdAt: new Date().toISOString(),
    createdBy: payload.reviewedBy,
    isBlocked: false,
  };

  upsertManagedSpecialistAccount(createdAccount);

  return mapCreatedAccountToResponse(createdAccount, temporaryPassword);
}
