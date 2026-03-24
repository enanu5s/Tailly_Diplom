// /src/shared/api/http.ts
import { apiErrorBodySchema } from '@/shared/api/schemas/apiErrorBodySchema';
import { resolveApiBaseUrl } from '@/shared/config/env';

const DEFAULT_REQUEST_TIMEOUT_MS = 15000;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestQueryValue = string | number | boolean | null | undefined;

export type RequestHeaders = Record<string, string>;

export type RequestQuery = Record<string, RequestQueryValue>;

export type ApiErrorPayload = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
};

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: RequestHeaders;
  query?: RequestQuery;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export class HttpError extends Error {
  status: number;
  body: unknown;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(params: {
    status: number;
    body: unknown;
    message?: string;
    code?: string;
    fieldErrors?: Record<string, string>;
  }) {
    super(params.message ?? `HTTP Error ${params.status}`);
    this.name = 'HttpError';
    this.status = params.status;
    this.body = params.body;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors;
  }
}

export class HttpTimeoutError extends Error {
  timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'HttpTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

type HttpClientConfig = {
  getAuthToken?: () => string | null;
  onUnauthorized?: () => void;
};

let authTokenGetter: (() => string | null) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function configureHttpClient(params: HttpClientConfig): void {
  authTokenGetter = params.getAuthToken ?? null;
  unauthorizedHandler = params.onUnauthorized ?? null;
}

export const API_BASE_URL = resolveApiBaseUrl();

function buildUrl(path: string, query?: RequestQuery): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (!query) {
    return url.toString();
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    value instanceof ReadableStream
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
}

function extractErrorPayload(body: unknown): ApiErrorPayload | null {
  const parsed = apiErrorBodySchema.safeParse(body);
  if (!parsed.success) {
    return null;
  }

  return {
    message: parsed.data.message,
    code: parsed.data.code,
    errors: parsed.data.errors,
  };
}

function createTimeoutSignal(timeoutMs: number): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort(new HttpTimeoutError(timeoutMs));
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => window.clearTimeout(timeoutId),
  };
}

function mergeAbortSignals(signals: AbortSignal[]): AbortSignal | undefined {
  const validSignals = signals.filter(Boolean);

  if (validSignals.length === 0) {
    return undefined;
  }

  if (validSignals.length === 1) {
    return validSignals[0];
  }

  const controller = new AbortController();

  const abort = (reason?: unknown): void => {
    if (!controller.signal.aborted) {
      controller.abort(reason);
    }
  };

  validSignals.forEach((signal) => {
    if (signal.aborted) {
      abort(signal.reason);
      return;
    }

    signal.addEventListener('abort', () => abort(signal.reason), { once: true });
  });

  return controller.signal;
}

function normalizeAbortError(error: unknown, timeoutMs: number): never {
  if (error instanceof HttpTimeoutError) {
    throw error;
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    throw new HttpTimeoutError(timeoutMs);
  }

  throw error;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    headers,
    query,
    signal,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  } = options;

  const resolvedToken = token ?? authTokenGetter?.() ?? null;

  const finalHeaders: RequestHeaders = {
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    ...(headers ?? {}),
  };

  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (isBodyInit(body)) {
      requestBody = body;
    } else {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] ?? 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  const timeoutController = createTimeoutSignal(timeoutMs);
  const finalSignal = mergeAbortSignals(
    [timeoutController.signal, signal].filter(Boolean) as AbortSignal[],
  );

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: finalHeaders,
      body: requestBody,
      signal: finalSignal,
    });
  } catch (error) {
    timeoutController.cleanup();
    normalizeAbortError(error, timeoutMs);
  }

  timeoutController.cleanup();

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const errorPayload = extractErrorPayload(data);

    if (response.status === 401) {
      unauthorizedHandler?.();
    }

    throw new HttpError({
      status: response.status,
      body: data,
      message: errorPayload?.message,
      code: errorPayload?.code,
      fieldErrors: errorPayload?.errors,
    });
  }

  return data as T;
}

export async function requestAndValidate<T>(
  path: string,
  validate: (data: unknown) => T,
  options: RequestOptions = {},
): Promise<T> {
  const data = await request<unknown>(path, options);
  return validate(data);
}
