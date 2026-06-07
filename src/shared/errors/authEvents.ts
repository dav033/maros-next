import type { AppError } from "./AppError";

export const UNAUTHORIZED_EVENT = "maros:auth:unauthorized";

export type UnauthorizedDetail = {
  message: string;
  status?: number;
  code?: string;
};

export function emitUnauthorized(error: AppError): void {
  if (typeof window === "undefined") return;
  const detail: UnauthorizedDetail = {
    message: error.userMessage,
    status: error.status,
    code: error.code,
  };
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail }));
}
