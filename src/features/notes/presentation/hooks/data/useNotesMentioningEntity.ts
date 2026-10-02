"use client";

import { useInstantList } from "@/shared/query";
import { useNotesApp } from "@/di";
import { listNotesReferencingTarget, notesKeys } from "@/notes/application";
import type { NoteBacklink, NoteReferenceKind, NoteReferenceOrigin } from "@/notes/domain";

/**
 * Notes that merely *mention* a record, for its detail page.
 *
 * `inline` only by default: the notes pinned to the record are already listed in its
 * Notes panel, and showing them twice on one screen reads as a duplicate rather than as
 * two different relationships.
 */
export function useNotesMentioningEntity(
  kind: NoteReferenceKind,
  targetId: number,
  origins: NoteReferenceOrigin[] = ["inline"]
) {
  const ctx = useNotesApp();
  const result = useInstantList<NoteBacklink>({
    queryKey: notesKeys.referencingTarget(kind, targetId, origins),
    queryFn: () => listNotesReferencingTarget(ctx, kind, targetId, origins),
  });
  return { ...result, mentions: result.data ?? [] };
}
