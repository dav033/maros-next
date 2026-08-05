"use client";

import { useNotesWorkspaceLogic } from "./useNotesWorkspaceLogic";
import { NotesWorkspaceView } from "./NotesWorkspaceView";
import type { NotePage, NotePageSummary } from "@/notes/domain";

export function NotesPage({
  activePageId,
  initialTree,
  initialPage,
}: {
  activePageId: number | null;
  initialTree?: NotePageSummary[];
  initialPage?: NotePage | null;
}) {
  const logic = useNotesWorkspaceLogic({ activePageId, initialTree, initialPage });
  return <NotesWorkspaceView logic={logic} />;
}
