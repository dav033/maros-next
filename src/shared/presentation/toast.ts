"use client";

import { toast } from "sonner";
import { AppError, GENERIC_ERROR_MESSAGE } from "@/shared/errors";

export type EntityAction = "created" | "updated" | "deleted";

const PAST_TENSE_LABEL: Record<EntityAction, string> = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
};

const VERB_LABEL: Record<EntityAction, string> = {
  created: "create",
  updated: "update",
  deleted: "delete",
};

export type EntityToastOptions = {
  undo?: { label?: string; onClick: () => void };
};

export function resolveErrorMessage(error: unknown, fallback?: string): string {
  if (error === undefined || error === null) {
    return fallback ?? GENERIC_ERROR_MESSAGE;
  }
  const appError = AppError.from(error);
  if (appError.kind === "canceled") {
    return "";
  }
  return appError.userMessage || fallback || GENERIC_ERROR_MESSAGE;
}

export function notifyError(error: unknown, fallback?: string): void {
  const message = resolveErrorMessage(error, fallback);
  if (!message) return;
  toast.error(message);
}

export function notifySuccess(message: string): void {
  toast.success(message);
}

export function notifyInfo(message: string): void {
  toast(message);
}

export const entityToast = {
  success(entityLabel: string, action: EntityAction, options?: EntityToastOptions) {
    const message = `${entityLabel} ${PAST_TENSE_LABEL[action]} successfully`;
    return toast.success(message, {
      action: options?.undo
        ? { label: options.undo.label ?? "Undo", onClick: options.undo.onClick }
        : undefined,
    });
  },

  error(entityLabel: string, action: EntityAction, error?: unknown) {
    const fallback = `Could not ${VERB_LABEL[action]} ${entityLabel.toLowerCase()}`;
    const message = resolveErrorMessage(error, fallback);
    if (!message) return;
    return toast.error(message);
  },

  info(message: string) {
    return toast(message);
  },
};
