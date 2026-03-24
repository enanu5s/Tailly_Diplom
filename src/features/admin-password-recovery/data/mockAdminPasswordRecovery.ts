// src/features/admin-password-recovery/data/mockAdminPasswordRecovery.ts
import { getSuperAdminAdminsMutable } from '@/features/super-admin-admins-management/data/mockAdminsManagement';

import { AdminPasswordRecoveryError } from '../model/types';

export function wait(delay = 500): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function sendRecoveryRequest(email: string): void {
  const normalizedEmail = email.trim().toLowerCase();

  const admin = getSuperAdminAdminsMutable().find(
    (item) => item.email.toLowerCase() === normalizedEmail,
  );

  if (!admin) {
    throw new AdminPasswordRecoveryError(
      'Администратор с таким email не найден.',
    );
  }

  // ❗ ключевая бизнес-логика:
  // создаётся "запрос" супер админу (пока просто лог)
  console.log(
    '[ADMIN RECOVERY REQUEST]',
    `Администратор ${admin.email} запросил восстановление пароля`,
  );
}