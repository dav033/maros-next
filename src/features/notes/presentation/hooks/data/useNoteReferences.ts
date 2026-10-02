"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { listNoteReferences, notesKeys } from "@/notes/application";
import type { NoteReference } from "@/notes/domain";

/** Everything the open note points at — the chips in its header. */
export function useNoteReferences(pageId: number | null) {
  const ctx = useNotesApp();
  const result = useInstantList<NoteReference>({
    queryKey: notesKeys.references(pageId ?? 0),
    queryFn: () => listNoteReferences(ctx, pageId!),
    enabled: pageId != null,
  });
  return { ...result, references: result.data ?? [] };
}
