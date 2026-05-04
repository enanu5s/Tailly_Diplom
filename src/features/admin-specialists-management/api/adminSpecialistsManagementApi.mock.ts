//src/features/admin-specialists-management/api/adminSpecialistsManagementApi.mock.ts
import {
  readMockApplications,
  writeMockApplications,
} from '@/features/specialist-applications/data/mockSpecialistApplications';
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
  const applications = readMockApplications();
  const applicationIndex = applications.findIndex((item) => item.id === payload.applicationId);
  const normalizedEmail = payload.email.trim().toLowerCase();

  if (applicationIndex === -1) {
    throw new AdminSpecialistsManagementError('Заявка не найдена.');
  }

  const application = applications[applicationIndex]!;

  if (application.status !== 'approved') {
    throw new AdminSpecialistsManagementError(
      'Кабинет специалиста можно создать только для одобренной заявки.',
    );
  }

  if (application.specialistAccountCreatedAt || application.createdSpecialistId) {
    throw new AdminSpecialistsManagementError(
      'Для этой заявки уже создан кабинет специалиста.',
    );
  }

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
    profileSeed: payload.profileSeed,
    createdAt: new Date().toISOString(),
    createdBy: payload.reviewedBy,
    isBlocked: false,
  };

  applications[applicationIndex] = {
    ...application,
    reviewedBy: payload.reviewedBy,
    createdSpecialistId: specialistId,
    createdSpecialistSlug: specialistSlug,
    specialistAccountCreatedAt: createdAccount.createdAt,
    updatedAt: createdAccount.createdAt,
  };

  upsertManagedSpecialistAccount(createdAccount);
  writeMockApplications(applications);

  return mapCreatedAccountToResponse(createdAccount, temporaryPassword);
}
