"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { notesKeys, listSharedWithMe } from "@/notes/application";
import type { NotePageSummary } from "@/notes/domain";

export function useInstantSharedWithMe() {
  const ctx = useNotesApp();
  const result = useInstantList<NotePageSummary>({
    queryKey: notesKeys.sharedWithMe(),
    queryFn: () => listSharedWithMe(ctx),
  });
  return { ...result, pages: result.data ?? [] };
}
