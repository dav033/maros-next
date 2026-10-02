"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { listNoteBacklinks, notesKeys } from "@/notes/application";
import type { NoteBacklink } from "@/notes/domain";

/** Notes that link here — the "Linked references" panel under the document. */
export function useNoteBacklinks(pageId: number | null) {
  const ctx = useNotesApp();
  const result = useInstantList<NoteBacklink>({
    queryKey: notesKeys.backlinks(pageId ?? 0),
    queryFn: () => listNoteBacklinks(ctx, pageId!),
    enabled: pageId != null,
  });
  return { ...result, backlinks: result.data ?? [] };
}
