"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { notesKeys } from "@/notes/application";
import type {
  NoteLinkDraft,
  NoteLinkPatch,
  NoteShareAccess,
  NoteVisibility,
} from "@/notes/domain";
import {
  setNoteVisibilityAction,
  shareNoteWithUserAction,
  updateNoteShareAction,
  revokeNoteShareAction,
  publishNoteLinkAction,
  updateNoteLinkAction,
  rotateNoteLinkAction,
  unpublishNoteLinkAction,
} from "@/notes/actions/noteSharingActions";

/**
 * Every mutation here invalidates the access panel for the page it touched, plus the
 * tree — the tree carries the "shared" and "published" badges, so a grant added in the
 * dialog has to show up in the sidebar without a reload.
 */
export function useNoteSharingMutations(pageId: number | null) {
  const queryClient = useQueryClient();

  const refresh = () => {
    if (pageId != null) {
      void queryClient.invalidateQueries({ queryKey: notesKeys.access(pageId) });
      void queryClient.invalidateQueries({ queryKey: notesKeys.detail(pageId) });
    }
    void queryClient.invalidateQueries({ queryKey: notesKeys.tree() });
    void queryClient.invalidateQueries({ queryKey: notesKeys.sharedWithMe() });
  };

  const visibilityMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Visibility updated",
    mutationFn: ({ id, visibility }: { id: number; visibility: NoteVisibility }) =>
      setNoteVisibilityAction(id, visibility),
    invalidate: refresh,
  });

  const shareMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Access granted",
    mutationFn: ({
      id,
      userId,
      access,
      expiresAt,
    }: {
      id: number;
      userId: number;
      access: NoteShareAccess;
      expiresAt?: string;
    }) => shareNoteWithUserAction(id, userId, access, expiresAt),
    invalidate: refresh,
  });

  const updateShareMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Access updated",
    mutationFn: ({
      id,
      shareId,
      patch,
    }: {
      id: number;
      shareId: number;
      patch: { access?: NoteShareAccess; expiresAt?: string | null };
    }) => updateNoteShareAction(id, shareId, patch),
    invalidate: refresh,
  });

  const revokeShareMutation = useEntityMutation({
    entityLabel: "Note",
    action: "updated",
    successMessage: "Access revoked",
    mutationFn: ({ id, shareId }: { id: number; shareId: number }) =>
      revokeNoteShareAction(id, shareId),
    invalidate: refresh,
  });

  /**
   * The response is the one and only carrier of the link's URL — the server keeps only
   * a hash of the token. Callers must read `url` off the result here; refetching the
   * panel afterwards will never bring it back.
   */
  const publishMutation = useEntityMutation({
    entityLabel: "Note",
    action: "created",
    successMessage: "Note published",
    mutationFn: ({ id, draft }: { id: number; draft: NoteLinkDraft }) =>
      publishNoteLinkAction(id, draft),
    invalidate: refresh,
  });

  const updateLinkMutation = useEntityMutation({
    entityLabel: "Link",
    action: "updated",
    successMessage: "Link updated",
    mutationFn: ({
      id,
      linkId,
      patch,
    }: {
      id: number;
      linkId: number;
      patch: NoteLinkPatch;
    }) => updateNoteLinkAction(id, linkId, patch),
    invalidate: refresh,
  });

  const rotateLinkMutation = useEntityMutation({
    entityLabel: "Link",
    action: "updated",
    successMessage: "New link generated — the old one no longer works",
    mutationFn: ({ id, linkId }: { id: number; linkId: number }) =>
      rotateNoteLinkAction(id, linkId),
    invalidate: refresh,
  });

  const unpublishMutation = useEntityMutation({
    entityLabel: "Link",
    action: "deleted",
    successMessage: "Note unpublished",
    mutationFn: ({ id, linkId }: { id: number; linkId: number }) =>
      unpublishNoteLinkAction(id, linkId),
    invalidate: refresh,
  });

  return {
    visibilityMutation,
    shareMutation,
    updateShareMutation,
    revokeShareMutation,
    publishMutation,
    updateLinkMutation,
    rotateLinkMutation,
    unpublishMutation,
  };
}
