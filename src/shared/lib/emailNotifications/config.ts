export function getSupportEmail(): string {
  const raw = import.meta.env.VITE_SUPPORT_EMAIL as string | undefined;
  const trimmed = raw?.trim();

  return trimmed && trimmed.includes('@') ? trimmed : 'support@tailly.ru';
}
