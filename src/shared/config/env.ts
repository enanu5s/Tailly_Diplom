const DEFAULT_DEV_API_BASE_URL = 'http://localhost:3000';

function readStringEnv(key: string): string | undefined {
  const raw = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  const trimmed = raw?.trim();
  return trimmed || undefined;
}

/** `true`, если используется mock-слой API (без реального backend). По умолчанию в dev — mock. */
export const isMockApiMode: boolean =
  (import.meta.env.VITE_USE_MOCK_API ?? 'true') === 'true';

/** Базовый URL API без завершающего слэша. В production обязателен `VITE_API_BASE_URL`. */
export function resolveApiBaseUrl(): string {
  const rawBaseUrl = readStringEnv('VITE_API_BASE_URL');

  if (rawBaseUrl) {
    return rawBaseUrl.replace(/\/+$/, '');
  }

  if (import.meta.env.DEV) {
    return DEFAULT_DEV_API_BASE_URL;
  }

  throw new Error(
    'VITE_API_BASE_URL is not defined. Set it in the environment before running the app.',
  );
}

/** Как в `resolveApiBaseUrl`, но для модулей, которым нужна строка даже при пустом env (например, сборка URL вручную). */
export function getOptionalApiBaseUrl(): string {
  return readStringEnv('VITE_API_BASE_URL') ?? '';
}

/** Ключ 2GIS для карты и гео-подсказок (попадает в клиентский бандл — ограничьте домен в кабинете 2GIS). */
export function get2GisApiKey(): string {
  return readStringEnv('VITE_2GIS_API_KEY') ?? '';
}

/** Email поддержки из env или пустая строка (см. `getSupportEmail` в lib). */
export function getSupportEmailFromEnv(): string | undefined {
  return readStringEnv('VITE_SUPPORT_EMAIL');
}
