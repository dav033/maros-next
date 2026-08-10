"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notesKeys } from "@/notes/application";
import { saveNoteContentAction } from "@/notes/actions/noteActions";
import type { NotePage } from "@/notes/domain";
import { AppError, emitUnauthorized, type AppErrorKind } from "@/shared/errors";

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "retrying"
  | "conflict"
  | "error";

const DEBOUNCE_MS = 800;
const RETRYABLE_KINDS = new Set<AppErrorKind>([
  "network",
  "timeout",
  "server",
  "rate_limited",
]);

type PendingSave = {
  pageId: number;
  generation: number;
  content: Record<string, unknown>;
  json: string;
  retryAttempt: number;
};

type ActiveSave = PendingSave & { token: number };

type FailedActionResult = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
  kind?: AppErrorKind;
  code?: string;
  status?: number;
};

function appErrorFromActionResult(result: FailedActionResult): AppError {
  return new AppError({
    userMessage: result.error,
    kind: result.kind ?? "unknown",
    code: result.code,
    status: result.status,
    fieldErrors: result.fieldErrors,
  });
}

function retryDelay(attempt: number): number {
  return Math.min(30_000, 1_000 * 2 ** Math.min(attempt - 1, 4));
}

/**
 * Debounced, page-scoped content autosave.
 *
 * A save is only considered complete after the server confirms it. The latest edit
 * stays in `pendingRef` while a request is in flight, so rapid typing is serialized
 * instead of producing competing `expectedUpdatedAt` values. Transient failures are
 * retried with a small backoff; conflicts and permission/validation errors remain
 * visible without repeatedly overwriting somebody else's edit.
 */
export function useNoteAutosave(pageId: number) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const mountedRef = useRef(true);
  const pageIdRef = useRef(pageId);
  const generationRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<PendingSave | null>(null);
  const activeRef = useRef<ActiveSave | null>(null);
  const desiredRef = useRef<PendingSave | null>(null);
  const lastSavedJsonRef = useRef<string | null>(null);
  const lastKnownUpdatedAtRef = useRef<string | undefined>(undefined);
  const requestTokenRef = useRef(0);
  const flushRef = useRef<() => void>(() => undefined);

  const setSafeStatus = useCallback((next: SaveStatus) => {
    if (mountedRef.current) setStatus(next);
  }, []);

  const clearScheduledSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const flushPending = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending || activeRef.current) return;
    if (
      pending.pageId !== pageIdRef.current ||
      pending.generation !== generationRef.current ||
      pending.json === lastSavedJsonRef.current
    ) {
      pendingRef.current = null;
      return;
    }

    pendingRef.current = null;
    const active: ActiveSave = {
      ...pending,
      token: ++requestTokenRef.current,
    };
    activeRef.current = active;
    setSafeStatus("saving");

    void saveNoteContentAction(
      active.pageId,
      active.content,
      lastKnownUpdatedAtRef.current,
    )
      .then((result) => {
        if (!result.success) throw appErrorFromActionResult(result);

        const page: NotePage = result.data;
        const isCurrentRequest =
          activeRef.current?.token === active.token &&
          active.pageId === pageIdRef.current &&
          active.generation === generationRef.current;
        if (!isCurrentRequest) return;

        lastKnownUpdatedAtRef.current = page.updatedAt;
        lastSavedJsonRef.current = active.json;
        queryClient.setQueryData(notesKeys.detail(active.pageId), page);

        const desired = desiredRef.current;
        if (desired && desired.json !== lastSavedJsonRef.current) {
          pendingRef.current = { ...desired, retryAttempt: 0 };
          setSafeStatus("saving");
          setTimeout(() => flushRef.current(), 0);
        } else {
          desiredRef.current = null;
          setSafeStatus("saved");
        }
      })
      .catch((error: unknown) => {
        const appError = AppError.from(error);
        const isCurrentRequest =
          activeRef.current?.token === active.token &&
          active.pageId === pageIdRef.current &&
          active.generation === generationRef.current;
        if (!isCurrentRequest) return;

        // Keep the newest editor state. If there was no newer edit, restore the
        // request that failed so a retry never loses the user's draft.
        const desired = desiredRef.current;
        if (!desired || desired.json === active.json) {
          desiredRef.current = active;
          pendingRef.current = active;
        }

        const shouldRetry = RETRYABLE_KINDS.has(appError.kind);
        setSafeStatus(
          appError.kind === "conflict"
            ? "conflict"
            : shouldRetry
              ? "retrying"
              : "error",
        );
        if (appError.kind === "unauthorized") emitUnauthorized(appError);

        if (shouldRetry) {
          const retryPending = pendingRef.current;
          if (retryPending) {
            const nextAttempt = active.retryAttempt + 1;
            pendingRef.current = { ...retryPending, retryAttempt: nextAttempt };
            retryTimeoutRef.current = setTimeout(() => {
              retryTimeoutRef.current = null;
              flushRef.current();
            }, retryDelay(nextAttempt));
          }
        }
      })
      .finally(() => {
        if (activeRef.current?.token === active.token) activeRef.current = null;
      });
  }, [queryClient, setSafeStatus]);

  useEffect(() => {
    flushRef.current = flushPending;
  }, [flushPending]);

  useEffect(() => {
    if (pageIdRef.current === pageId) return;

    pageIdRef.current = pageId;
    generationRef.current += 1;
    clearScheduledSave();
    pendingRef.current = null;
    desiredRef.current = null;
    activeRef.current = null;
    lastSavedJsonRef.current = null;
    lastKnownUpdatedAtRef.current = undefined;
    setSafeStatus("idle");
  }, [clearScheduledSave, pageId, setSafeStatus]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      clearScheduledSave();
      pendingRef.current = null;
      desiredRef.current = null;
      activeRef.current = null;
    };
  }, [clearScheduledSave]);

  const scheduleSave = useCallback(
    (content: Record<string, unknown>) => {
      if (pageId <= 0) return;

      const json = JSON.stringify(content);
      desiredRef.current = {
        pageId,
        generation: generationRef.current,
        content,
        json,
        retryAttempt: 0,
      };

      if (json === lastSavedJsonRef.current) {
        pendingRef.current = null;
        if (!activeRef.current) setSafeStatus("saved");
        clearScheduledSave();
        return;
      }

      pendingRef.current = desiredRef.current;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      setSafeStatus("saving");
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        flushRef.current();
      }, DEBOUNCE_MS);
    },
    [clearScheduledSave, pageId, setSafeStatus],
  );

  const setBaseline = useCallback((page: NotePage) => {
    if (page.id !== pageIdRef.current) return;
    lastKnownUpdatedAtRef.current = page.updatedAt;
    lastSavedJsonRef.current = JSON.stringify(page.content);
    desiredRef.current = null;
    pendingRef.current = null;
  }, []);

  return { status, scheduleSave, setBaseline };
}
