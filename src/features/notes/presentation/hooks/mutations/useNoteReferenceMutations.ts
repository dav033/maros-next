"use client";

import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { notesKeys } from "@/notes/application";
import {
  addNoteRelationAction,
  removeNoteRelationAction,
} from "@/notes/actions/noteReferenceActions";
import type { NoteReferenceKind } from "@/notes/domain";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Pinning a record touches four lists at once: the note's own chips, the backlinks of
 * whatever was pinned, that record's Notes panel, and the note tree (whose rows carry the
 * primary relation). Invalidating the reference prefix plus the two entity lists is
 * cheaper to keep correct than naming each affected key — a relation is a fact about two
 * things, and only one of them is in scope here.
 */
function invalidateReferenceViews(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: notesKeys.referencesAll() });
  void qc.invalidateQueries({ queryKey: notesKeys.byEntityAll() });
  void qc.invalidateQueries({ queryKey: notesKeys.tree() });
}

export function useNoteReferenceMutations() {
  const addRelationMutation = useEntityMutation({
    entityLabel: "Relation",
    action: "created",
    mutationFn: ({
      pageId,
      kind,
      targetId,
    }: {
      pageId: number;
      kind: NoteReferenceKind;
      targetId: number;
    }) => addNoteRelationAction(pageId, kind, targetId),
    invalidate: invalidateReferenceViews,
  });

  const removeRelationMutation = useEntityMutation({
    entityLabel: "Relation",
    action: "deleted",
    mutationFn: ({
      pageId,
      kind,
      targetId,
    }: {
      pageId: number;
      kind: NoteReferenceKind;
      targetId: number;
    }) => removeNoteRelationAction(pageId, kind, targetId),
    invalidate: invalidateReferenceViews,
  });

  return { addRelationMutation, removeRelationMutation };
}
