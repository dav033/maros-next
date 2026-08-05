"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { notesKeys, listNoteTags } from "@/notes/application";
import type { NoteTag } from "@/notes/domain";

export function useInstantNoteTags() {
  const ctx = useNotesApp();
  const result = useInstantList<NoteTag>({
    queryKey: notesKeys.tags(),
    queryFn: () => listNoteTags(ctx),
  });
  return { ...result, tags: result.data ?? [] };
}
