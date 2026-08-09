"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useInstantNotePage } from "../hooks/data/useInstantNotePage";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import { useNoteAutosave } from "../hooks/mutations/useNoteAutosave";
import { hasNoteAccess } from "@/notes/domain";
import type { NoteEntityLink, NoteKind, NotePage, NotePageSummary } from "@/notes/domain";

export interface UseNotesWorkspaceLogicOptions {
  activePageId: number | null;
  initialTree?: NotePageSummary[];
  initialPage?: NotePage | null;
}

export function useNotesWorkspaceLogic({
  activePageId,
  initialTree,
  initialPage,
}: UseNotesWorkspaceLogicOptions) {
  const router = useRouter();
  const tree = useInstantNoteTree(initialTree);
  const activePage = useInstantNotePage(activePageId, initialPage);
  const {
    createMutation,
    renameMutation,
    trashMutation,
    moveMutation,
    favoriteMutation,
    setTagsMutation,
    setEntityLinkMutation,
  } = useNoteMutations();
  const autosave = useNoteAutosave(activePageId ?? -1);

  const [title, setTitle] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const loadedPageIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activePage.page) return;
    if (loadedPageIdRef.current === activePage.page.id) return;
    loadedPageIdRef.current = activePage.page.id;
    setTitle(activePage.page.title);
    autosave.setBaseline(activePage.page);
  }, [activePage.page]);

  const handleCreateRoot = async (kind: NoteKind = "page") => {
    // useEntityMutation's onError already surfaces the failure (toast, or a
    // redirect to /login on an expired session) — this catch only stops the
    // rejection from reaching the console and skips the navigation below.
    try {
      const page = await createMutation.mutateAsync({
        title: kind === "folder" ? "New folder" : "Untitled",
        kind,
      });
      router.push(`/notes/${page.id}`);
    } catch {
      // handled by onError
    }
  };

  const handleCreateChild = async (parentId: number, kind: NoteKind = "page") => {
    try {
      const page = await createMutation.mutateAsync({
        title: kind === "folder" ? "New folder" : "Untitled",
        kind,
        parentId,
      });
      router.push(`/notes/${page.id}`);
    } catch {
      // handled by onError
    }
  };

  const handleContentChange = (content: Record<string, unknown>) => {
    if (activePageId != null) {
      autosave.scheduleSave(content);
    }
  };

  const handleTitleBlur = async () => {
    if (activePageId == null) return;
    const trimmed = title.trim() || "Untitled";
    if (trimmed === activePage.page?.title) return;
    try {
      await renameMutation.mutateAsync({ id: activePageId, patch: { title: trimmed } });
    } catch {
      // handled by onError
    }
  };

  const handleTrash = async () => {
    if (activePageId == null) return;
    // Start the mutation, then leave the page immediately. Its onMutate removes the
    // note/folder from the tree before the request reaches the server; on failure the
    // mutation restores that exact cached tree and shows the error toast.
    const request = trashMutation.mutateAsync(activePageId);
    router.push("/notes");
    try {
      await request;
    } catch {
      // handled by onError
    }
  };

  const handleToggleFavorite = () => {
    if (activePageId == null || !activePage.page) return;
    favoriteMutation.mutate({ id: activePageId, isFavorite: !activePage.page.isFavorite });
  };

  const handleTagsChange = (tagIds: number[]) => {
    if (activePageId == null) return;
    setTagsMutation.mutate({ id: activePageId, tagIds });
  };

  const handleEntityLinkChange = (link: NoteEntityLink) => {
    if (activePageId == null) return;
    setEntityLinkMutation.mutate({ id: activePageId, link });
  };

  const handleMove = (
    id: number,
    parentId: number | null,
    beforeId: number | null,
    afterId: number | null
  ) => {
    // `void` only discards the return value — it doesn't attach a catch, so
    // a rejection here would still surface as an unhandled promise rejection.
    moveMutation.mutate(
      { id, parentId, beforeId, afterId },
      {
        onSuccess: (result) => {
          // Grants are inherited downward, so dragging a page out of a shared folder
          // takes it away from everyone that folder was shared with. Saying so is the
          // difference between a deliberate change and a note someone can no longer
          // open for reasons nobody remembers.
          if (result.accessChanged) {
            toast.warning(
              "Moved out of a shared folder — people who reached this note through it have lost access."
            );
          }
        },
      }
    );
  };

  /**
   * What the open page allows. Defaults to `owner` while it loads so the toolbar does
   * not flicker from read-only into editable on every navigation; the server is the
   * real gate either way, this only decides what the UI offers.
   */
  const myAccess = activePage.page?.myAccess ?? "owner";
  const canEdit = hasNoteAccess(myAccess, "editor");

  return {
    tree: tree.pages,
    treeLoading: tree.isLoading,
    activePageId,
    activePage: activePage.page,
    activePageLoading: activePage.isLoading,
    title,
    setTitle,
    onContentChange: handleContentChange,
    onTitleBlur: handleTitleBlur,
    onCreateRoot: handleCreateRoot,
    onCreateChild: handleCreateChild,
    onTrash: handleTrash,
    onMove: handleMove,
    onToggleFavorite: handleToggleFavorite,
    onTagsChange: handleTagsChange,
    onEntityLinkChange: handleEntityLinkChange,
    myAccess,
    canEdit,
    canManage: hasNoteAccess(myAccess, "owner"),
    shareOpen,
    setShareOpen,
    onSetFavorite: (id: number, isFavorite: boolean) =>
      favoriteMutation.mutate({ id, isFavorite }),
    saveStatus: autosave.status,
  };
}

export type UseNotesWorkspaceLogicReturn = ReturnType<typeof useNotesWorkspaceLogic>;
