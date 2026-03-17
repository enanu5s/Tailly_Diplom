// src/shared/api/http.ts

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  query?: Record<string, RequestQueryValue>;
  signal?: AbortSignal;
};

export type ApiErrorPayload = {
  message?: string;
  code?: string;
  errors?: Record<string, string[] | string>;
};

export class HttpError extends Error {
  status: number;
  body: unknown;
  code?: string;
  fieldErrors?: Record<string, string[] | string>;

  constructor(params: {
    status: number;
    body: unknown;
    message?: string;
    code?: string;
    fieldErrors?: Record<string, string[] | string>;
  }) {
    super(params.message ?? `HTTP Error ${params.status}`);
    this.name = 'HttpError';
    this.status = params.status;
    this.body = params.body;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors;
  }
}

let authTokenGetter: (() => string | null) | null = null;

export function configureHttpClient(params: {
  getAuthToken?: () => string | null;
}): void {
  authTokenGetter = params.getAuthToken ?? null;
}

function buildUrl(
  path: string,
  query?: Record<string, RequestQueryValue>,
): string {
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const url = new URL(`${normalizedBaseUrl}${normalizedPath}`);

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
  if (!body || typeof body !== 'object') {
    return null;
  }

  const maybePayload = body as ApiErrorPayload;

  return {
    message: maybePayload.message,
    code: maybePayload.code,
    errors: maybePayload.errors,
  };
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    headers,
    query,
    signal,
  } = options;

  const resolvedToken = token ?? authTokenGetter?.() ?? null;

  const finalHeaders: Record<string, string> = {
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    ...(headers ?? {}),
  };

  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (isBodyInit(body)) {
      requestBody = body;
    } else {
      finalHeaders['Content-Type'] =
        finalHeaders['Content-Type'] ?? 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: finalHeaders,
    body: requestBody,
    signal,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const errorPayload = extractErrorPayload(data);

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