import axios, { AxiosError } from "axios";
import {
  FieldErrors,
  GENERIC_ERROR_MESSAGE,
  resolveUserMessage,
} from "./errorMessages";

export type AppErrorKind =
  | "network"
  | "timeout"
  | "canceled"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limited"
  | "server"
  | "unknown";

type BackendErrorBody = {
  statusCode?: number;
  message?: string | string[];
  code?: string;
  errors?: FieldErrors | Record<string, unknown>;
  error?: string;
};

export interface AppErrorOptions {
  userMessage: string;
  kind: AppErrorKind;
  status?: number;
  code?: string;
  serverMessage?: string;
  fieldErrors?: FieldErrors;
  cause?: unknown;
}

export class AppError extends Error {
  readonly userMessage: string;
  readonly kind: AppErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly serverMessage?: string;
  readonly fieldErrors?: FieldErrors;

  constructor(options: AppErrorOptions) {
    super(options.userMessage);
    this.name = "AppError";
    this.userMessage = options.userMessage;
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
    this.serverMessage = options.serverMessage;
    this.fieldErrors = options.fieldErrors;
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }

  static from(error: unknown): AppError {
    if (error instanceof AppError) return error;

    if (axios.isCancel(error)) {
      return new AppError({
        userMessage: "La operación fue cancelada.",
        kind: "canceled",
        code: "CANCELED",
        cause: error,
      });
    }

    if (axios.isAxiosError(error)) {
      return fromAxiosError(error);
    }

    if (isAbortError(error)) {
      return new AppError({
        userMessage: "La operación fue cancelada.",
        kind: "canceled",
        code: "CANCELED",
        cause: error,
      });
    }

    if (error instanceof Error) {
      if (/network|fetch failed|failed to fetch/i.test(error.message)) {
        return new AppError({
          userMessage: resolveUserMessage({ code: "NETWORK_ERROR" }),
          kind: "network",
          code: "NETWORK_ERROR",
          cause: error,
        });
      }
      if (/timeout|timed out/i.test(error.message)) {
        return new AppError({
          userMessage: resolveUserMessage({ code: "TIMEOUT" }),
          kind: "timeout",
          code: "TIMEOUT",
          cause: error,
        });
      }
      return new AppError({
        userMessage: GENERIC_ERROR_MESSAGE,
        kind: "unknown",
        serverMessage: error.message,
        cause: error,
      });
    }

    return new AppError({
      userMessage: GENERIC_ERROR_MESSAGE,
      kind: "unknown",
      cause: error,
    });
  }
}

function fromAxiosError(error: AxiosError): AppError {
  if (error.code === "ECONNABORTED" || /timeout/i.test(error.message)) {
    return new AppError({
      userMessage: resolveUserMessage({ code: "TIMEOUT" }),
      kind: "timeout",
      code: "TIMEOUT",
      cause: error,
    });
  }

  if (!error.response) {
    return new AppError({
      userMessage: resolveUserMessage({ code: "NETWORK_ERROR" }),
      kind: "network",
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  const status = error.response.status;
  const body = (error.response.data ?? {}) as BackendErrorBody;
  const code = typeof body.code === "string" ? body.code : undefined;
  const serverMessage = extractServerMessage(body);
  const fieldErrors = extractFieldErrors(body);

  return new AppError({
    userMessage: resolveUserMessage({ status, code, serverMessage }),
    kind: kindForStatus(status),
    status,
    code,
    serverMessage,
    fieldErrors,
    cause: error,
  });
}

function extractServerMessage(body: BackendErrorBody): string | undefined {
  if (typeof body.message === "string") return body.message;
  if (Array.isArray(body.message)) return body.message.join(", ");
  if (typeof body.error === "string") return body.error;
  return undefined;
}

function extractFieldErrors(body: BackendErrorBody): FieldErrors | undefined {
  const raw = body.errors;
  if (!raw || typeof raw !== "object") return undefined;
  const result: FieldErrors = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      result[key] = value as string[];
    } else if (typeof value === "string") {
      result[key] = [value];
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function kindForStatus(status: number): AppErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 408 || status === 504) return "timeout";
  if (status === 422 || status === 400) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: unknown }).name;
  return name === "AbortError" || name === "CanceledError";
}
