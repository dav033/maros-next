"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesKeys } from "@/notes/application";
import { saveNoteContentAction } from "@/notes/actions/noteActions";
import type { NotePage } from "@/notes/domain";
import { AppError } from "@/shared/errors";

export type SaveStatus = "idle" | "saving" | "saved" | "conflict" | "error";

const DEBOUNCE_MS = 800;

/**
 * Debounced content autosave. Deliberately does NOT use useEntityMutation: that hook
 * always fires a toast and always invalidates on success, and a toast per keystroke
 * (plus a refetch that could clobber in-flight edits) would make the editor unusable.
 */
export function useNoteAutosave(pageId: number) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedJsonRef = useRef<string | null>(null);
  const lastKnownUpdatedAtRef = useRef<string | undefined>(undefined);

  const mutation = useMutation({
    mutationFn: (content: Record<string, unknown>) =>
      saveNoteContentAction(pageId, content, lastKnownUpdatedAtRef.current),
    onSuccess: (result) => {
      if (!result.success) {
        if (result.error) setStatus("error");
        return;
      }
      const page: NotePage = result.data;
      lastKnownUpdatedAtRef.current = page.updatedAt;
      setStatus("saved");
      queryClient.setQueryData(notesKeys.detail(pageId), page);
    },
    onError: (error: unknown) => {
      const appError = AppError.from(error);
      setStatus(appError.kind === "conflict" ? "conflict" : "error");
    },
  });

  const scheduleSave = useCallback(
    (content: Record<string, unknown>) => {
      const json = JSON.stringify(content);
      if (json === lastSavedJsonRef.current) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("saving");
      timeoutRef.current = setTimeout(() => {
        lastSavedJsonRef.current = json;
        mutation.mutate(content);
      }, DEBOUNCE_MS);
    },
    [mutation]
  );

  const setBaseline = useCallback((page: NotePage) => {
    lastKnownUpdatedAtRef.current = page.updatedAt;
    lastSavedJsonRef.current = JSON.stringify(page.content);
  }, []);

  return { status, scheduleSave, setBaseline };
}
