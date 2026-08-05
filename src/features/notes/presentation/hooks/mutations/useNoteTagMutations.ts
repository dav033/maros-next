"use client";

import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { notesKeys } from "@/notes/application";
import {
  createNoteTagAction,
  updateNoteTagAction,
  deleteNoteTagAction,
} from "@/notes/actions/noteTagActions";

export function useNoteTagMutations() {
  const createTagMutation = useEntityMutation({
    entityLabel: "Tag",
    action: "created",
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      createNoteTagAction(name, color),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tags() });
    },
  });

  const updateTagMutation = useEntityMutation({
    entityLabel: "Tag",
    action: "updated",
    mutationFn: ({
      id,
      patch,
    }: {
      id: number;
      patch: { name?: string; color?: string };
    }) => updateNoteTagAction(id, patch),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tags() });
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
    },
  });

  const deleteTagMutation = useEntityMutation({
    entityLabel: "Tag",
    action: "deleted",
    mutationFn: (id: number) => deleteNoteTagAction(id),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tags() });
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
    },
  });

  return { createTagMutation, updateTagMutation, deleteTagMutation };
}
