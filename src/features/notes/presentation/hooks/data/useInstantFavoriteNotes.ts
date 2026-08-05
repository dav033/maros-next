"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { notesKeys, listFavoriteNotes } from "@/notes/application";
import type { NotePageSummary } from "@/notes/domain";

export function useInstantFavoriteNotes() {
  const ctx = useNotesApp();
  const result = useInstantList<NotePageSummary>({
    queryKey: notesKeys.favorites(),
    queryFn: () => listFavoriteNotes(ctx),
  });
  return { ...result, pages: result.data ?? [] };
}
