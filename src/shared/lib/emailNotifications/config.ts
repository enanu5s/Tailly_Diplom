import { getSupportEmailFromEnv } from '@/shared/config/env';

export function getSupportEmail(): string {
  const trimmed = getSupportEmailFromEnv();

  return trimmed && trimmed.includes('@') ? trimmed : 'support@tailly.ru';
}
