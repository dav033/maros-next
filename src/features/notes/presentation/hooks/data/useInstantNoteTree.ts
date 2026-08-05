"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { notesKeys, listNoteTree } from "@/notes/application";
import type { NotePageSummary } from "@/notes/domain";

export function useInstantNoteTree(initialData?: NotePageSummary[]) {
  const ctx = useNotesApp();
  const result = useInstantList<NotePageSummary>({
    queryKey: notesKeys.tree(),
    queryFn: () => listNoteTree(ctx),
    initialData,
  });
  return { ...result, pages: result.data ?? [] };
}
