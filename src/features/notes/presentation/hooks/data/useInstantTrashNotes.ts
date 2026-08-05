"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { notesKeys, listTrashNotes } from "@/notes/application";
import type { NotePageSummary } from "@/notes/domain";

export function useInstantTrashNotes() {
  const ctx = useNotesApp();
  const result = useInstantList<NotePageSummary>({
    queryKey: notesKeys.trash(),
    queryFn: () => listTrashNotes(ctx),
  });
  return { ...result, pages: result.data ?? [] };
}
