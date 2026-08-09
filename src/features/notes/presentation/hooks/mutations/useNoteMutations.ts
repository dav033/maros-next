"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { notesKeys } from "@/notes/application";
import type { NoteEntityLink, NotePageDraft, NotePagePatch } from "@/notes/domain";
import {
  createNotePageAction,
  updateNotePageMetaAction,
  trashNotePageAction,
  moveNotePageAction,
  restoreNotePageAction,
  purgeNotePageAction,
  setNoteFavoriteAction,
  setNoteEntityLinkAction,
  setNotePageTagsAction,
} from "@/notes/actions/noteActions";

export function useNoteMutations() {
  const queryClient = useQueryClient();

  const createMutation = useEntityMutation({
    entityLabel: "Note",
    action: "created",
    mutationFn: (draft: NotePageDraft) => createNotePageAction(draft),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
    },
  });

  const renameMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    mutationFn: ({ id, patch }: { id: number; patch: NotePagePatch }) =>
      updateNotePageMetaAction(id, patch),
    invalidate: (qc, data) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
      queryClient.setQueryData(notesKeys.detail(data.id), data);
    },
  });

  const trashMutation = useEntityMutation({
    entityLabel: "Note",
    action: "deleted",
    mutationFn: (id: number) => trashNotePageAction(id),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
    },
  });

  const moveMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Note moved",
    mutationFn: ({
      id,
      parentId,
      beforeId,
      afterId,
    }: {
      id: number;
      parentId: number | null;
      beforeId?: number | null;
      afterId?: number | null;
    }) => moveNotePageAction(id, parentId, beforeId, afterId),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
    },
  });

  const restoreMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Note restored",
    mutationFn: (id: number) => restoreNotePageAction(id),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
      void qc.invalidateQueries({ queryKey: notesKeys.trash() });
    },
  });

  const purgeMutation = useEntityMutation({
    entityLabel: "Note",
    action: "deleted",
    successMessage: "Note permanently deleted",
    mutationFn: (id: number) => purgeNotePageAction(id),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: notesKeys.trash() });
    },
  });

  const favoriteMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Favorite updated",
    mutationFn: ({ id, isFavorite }: { id: number; isFavorite: boolean }) =>
      setNoteFavoriteAction(id, isFavorite),
    invalidate: (qc, data) => {
      void qc.invalidateQueries({ queryKey: notesKeys.favorites() });
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
      queryClient.setQueryData(notesKeys.detail(data.id), (old: unknown) =>
        old && typeof old === "object" ? { ...old, isFavorite: data.isFavorite } : old
      );
    },
  });

  const setEntityLinkMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Note assignment updated",
    mutationFn: ({ id, link }: { id: number; link: NoteEntityLink }) =>
      setNoteEntityLinkAction(id, link),
    invalidate: (qc, data) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
      // Invalidated by prefix: the list the note just left has to refetch too, and
      // that one isn't in the response — otherwise the old lead's detail card keeps
      // showing a note that moved away.
      void qc.invalidateQueries({ queryKey: notesKeys.byEntityAll() });
      queryClient.setQueryData(notesKeys.detail(data.id), (old: unknown) =>
        old && typeof old === "object"
          ? { ...old, entityKind: data.entityKind, entityId: data.entityId }
          : old
      );
    },
  });

  const setTagsMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Tags updated",
    mutationFn: ({ id, tagIds }: { id: number; tagIds: number[] }) =>
      setNotePageTagsAction(id, tagIds),
    invalidate: (qc, data) => {
      void qc.invalidateQueries({ queryKey: notesKeys.tree() });
      queryClient.setQueryData(notesKeys.detail(data.id), (old: unknown) =>
        old && typeof old === "object" ? { ...old, tags: data.tags } : old
      );
    },
  });

  return {
    createMutation,
    renameMutation,
    trashMutation,
    moveMutation,
    restoreMutation,
    purgeMutation,
    favoriteMutation,
    setTagsMutation,
    setEntityLinkMutation,
  };
}
