// src/features/auth/data/mockPasswordRecovery.ts

type RecoverySession = {
  email: string;
  code: string;
  expiresAt: number;
};

const sessions = new Map<string, RecoverySession>();

export function wait(delay = 400): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createSession(email: string): string {
  const code = generateCode();

  sessions.set(email.toLowerCase(), {
    email,
    code,
    expiresAt: Date.now() + 5 * 60_000,
  });

  return code;
}

export function getSession(email: string): RecoverySession | null {
  return sessions.get(email.toLowerCase()) ?? null;
}

export function deleteSession(email: string): void {
  sessions.delete(email.toLowerCase());
}
