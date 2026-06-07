import { AppError } from "@/shared/errors";
import { resolveUserMessage } from "@/shared/errors";
import type { FieldErrors } from "@/shared/errors";
import type { HttpClientLike, RequestOptions } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

type BackendErrorBody = {
  statusCode?: number;
  message?: unknown;
  code?: unknown;
  error?: unknown;
  errors?: unknown;
};

export class ServerApiClient implements HttpClientLike {
  private readonly baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<{ data: T; status: number }> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    const searchParams = options?.params
      ? new URLSearchParams(
          Object.entries(options.params).reduce(
            (acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = String(value);
              }
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString()
      : "";

    const urlWithParams = searchParams ? `${fullUrl}?${searchParams}` : fullUrl;

    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: options?.withCredentials ? "include" : "same-origin",
      signal: options?.signal,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(urlWithParams, fetchOptions);
    } catch (error) {
      throw AppError.from(error);
    }

    if (!response.ok) {
      throw await buildAppErrorFromResponse(response);
    }

    const data = (await response.json().catch(() => ({}))) as T;
    return { data, status: response.status };
  }

  get<T = unknown>(url: string, options?: RequestOptions) {
    return this.request<T>("GET", url, undefined, options);
  }

  post<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", url, body, options);
  }

  put<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", url, body, options);
  }

  delete<T = unknown>(url: string, options?: RequestOptions) {
    return this.request<T>("DELETE", url, undefined, options);
  }
}

async function buildAppErrorFromResponse(response: Response): Promise<AppError> {
  const status = response.status;
  const raw = await response.text().catch(() => "");
  const body = safeParseJson(raw);
  const code = typeof body?.code === "string" ? body.code : undefined;
  const serverMessage = extractServerMessage(body, raw);
  const fieldErrors = extractFieldErrors(body);

  return new AppError({
    userMessage: resolveUserMessage({ status, code, serverMessage }),
    kind: kindForStatus(status),
    status,
    code,
    serverMessage,
    fieldErrors,
  });
}

function safeParseJson(raw: string): BackendErrorBody | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as BackendErrorBody) : null;
  } catch {
    return null;
  }
}

function extractServerMessage(
  body: BackendErrorBody | null,
  raw: string
): string | undefined {
  if (!body) return raw || undefined;
  if (typeof body.message === "string") return body.message;
  if (Array.isArray(body.message)) return body.message.filter((v) => typeof v === "string").join(", ");
  if (typeof body.error === "string") return body.error;
  return raw || undefined;
}

function extractFieldErrors(body: BackendErrorBody | null): FieldErrors | undefined {
  const raw = body?.errors;
  if (!raw || typeof raw !== "object") return undefined;
  const result: FieldErrors = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      result[key] = value as string[];
    } else if (typeof value === "string") {
      result[key] = [value];
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function kindForStatus(status: number) {
  if (status === 401) return "unauthorized" as const;
  if (status === 403) return "forbidden" as const;
  if (status === 404) return "not_found" as const;
  if (status === 409) return "conflict" as const;
  if (status === 408 || status === 504) return "timeout" as const;
  if (status === 422 || status === 400) return "validation" as const;
  if (status === 429) return "rate_limited" as const;
  if (status >= 500) return "server" as const;
  return "unknown" as const;
}

export const serverApiClient = new ServerApiClient(BASE_URL);
