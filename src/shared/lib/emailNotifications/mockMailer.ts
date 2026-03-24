export type MockMailEntry = {
  id: string;
  at: string;
  kind: string;
  to: string;
  subject: string;
  body: string;
};

const STORAGE_KEY = 'tailly_mock_email_log';
const MAX_ENTRIES = 200;

function readLog(): MockMailEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as MockMailEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: MockMailEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore quota */
  }
}

/**
 * Имитация отправки письма (демо / mock API): консоль + локальный журнал.
 * На реальном бэкенде вызывается сервис SMTP / очередь уведомлений.
 */
export function sendMockMail(params: {
  to: string;
  subject: string;
  body: string;
  kind: string;
}): void {
  const to = params.to.trim().toLowerCase();
  if (!to || !to.includes('@')) {
    return;
  }

  const entry: MockMailEntry = {
    id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    kind: params.kind,
    to,
    subject: params.subject.trim(),
    body: params.body.trim(),
  };

  const next = [entry, ...readLog()];
  writeLog(next);

  console.info('[Tailly mock email]', entry.kind, '→', entry.to, '—', entry.subject);
}
