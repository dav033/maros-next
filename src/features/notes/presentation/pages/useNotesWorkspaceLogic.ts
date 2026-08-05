"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useInstantNotePage } from "../hooks/data/useInstantNotePage";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import { useNoteAutosave } from "../hooks/mutations/useNoteAutosave";
import type { NotePage, NotePageSummary } from "@/notes/domain";

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
  } = useNoteMutations();
  const autosave = useNoteAutosave(activePageId ?? -1);

  const [title, setTitle] = useState("");
  const loadedPageIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activePage.page) return;
    if (loadedPageIdRef.current === activePage.page.id) return;
    loadedPageIdRef.current = activePage.page.id;
    setTitle(activePage.page.title);
    autosave.setBaseline(activePage.page);
  }, [activePage.page]);

  const handleCreateRoot = async () => {
    const page = await createMutation.mutateAsync({ title: "Untitled" });
    router.push(`/notes/${page.id}`);
  };

  const handleCreateChild = async (parentId: number) => {
    const page = await createMutation.mutateAsync({ title: "Untitled", parentId });
    router.push(`/notes/${page.id}`);
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
    await renameMutation.mutateAsync({ id: activePageId, patch: { title: trimmed } });
  };

  const handleTrash = async () => {
    if (activePageId == null) return;
    await trashMutation.mutateAsync(activePageId);
    router.push("/notes");
  };

  const handleToggleFavorite = () => {
    if (activePageId == null || !activePage.page) return;
    favoriteMutation.mutate({ id: activePageId, isFavorite: !activePage.page.isFavorite });
  };

  const handleTagsChange = (tagIds: number[]) => {
    if (activePageId == null) return;
    setTagsMutation.mutate({ id: activePageId, tagIds });
  };

  const handleMove = (
    id: number,
    parentId: number | null,
    beforeId: number | null,
    afterId: number | null
  ) => {
    void moveMutation.mutateAsync({ id, parentId, beforeId, afterId });
  };

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
    saveStatus: autosave.status,
  };
}

export type UseNotesWorkspaceLogicReturn = ReturnType<typeof useNotesWorkspaceLogic>;
