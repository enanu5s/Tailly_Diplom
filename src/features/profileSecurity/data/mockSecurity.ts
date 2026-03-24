// src/features/profileSecurity/data/mockSecurity.ts

let mockOldEmail = 'ivan.petrov@mail.ru';

export function getMockOldEmail(): string {
  return mockOldEmail;
}

export function setMockOldEmail(value: string): void {
  mockOldEmail = value;
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');

  if (!domain) {
    return '***';
  }

  const maskedName = name.length <= 2 ? `${name[0] ?? '*'}*` : `${name.slice(0, 2)}***`;

  return `${maskedName}@${domain}`;
}
