"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { notesKeys, listNotesByEntity } from "@/notes/application";
import type { NoteEntityKind, NotePageSummary } from "@/notes/domain";

export function useInstantNotesByEntity(kind: NoteEntityKind, entityId: number) {
  const ctx = useNotesApp();
  const result = useInstantList<NotePageSummary>({
    queryKey: notesKeys.byEntity(kind, entityId),
    queryFn: () => listNotesByEntity(ctx, kind, entityId),
  });
  return { ...result, pages: result.data ?? [] };
}
