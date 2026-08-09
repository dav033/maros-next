"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Trash } from "lucide-react";
import { NoteTreePanel } from "./NoteTreePanel";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";

/**
 * The 256px note-tree sidebar, self-contained so it can be mounted once in
 * `app/notes/layout.tsx` and shown on every notes route (workspace, favorites,
 * trash) — not just the page-editing route it originally lived inside.
 */
export function NotesSidebar() {
  const router = useRouter();
  const tree = useInstantNoteTree();
  const { createMutation, moveMutation } = useNoteMutations();

  const handleCreateRoot = async () => {
    try {
      const page = await createMutation.mutateAsync({ title: "Untitled" });
      router.push(`/notes/${page.id}`);
    } catch {
      // handled by onError
    }
  };

  const handleCreateChild = async (parentId: number) => {
    try {
      const page = await createMutation.mutateAsync({ title: "Untitled", parentId });
      router.push(`/notes/${page.id}`);
    } catch {
      // handled by onError
    }
  };

  const handleMove = (
    id: number,
    parentId: number | null,
    beforeId: number | null,
    afterId: number | null
  ) => {
    moveMutation.mutate({ id, parentId, beforeId, afterId });
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border/60">
      <div className="flex-1 overflow-hidden">
        <NoteTreePanel
          pages={tree.pages}
          onCreateRoot={handleCreateRoot}
          onCreateChild={handleCreateChild}
          onMove={handleMove}
        />
      </div>
      <div className="border-t border-border/60">
        <Link
          href="/notes/favorites"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Star className="h-3.5 w-3.5" />
          Favorites
        </Link>
        <Link
          href="/notes/trash"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Trash className="h-3.5 w-3.5" />
          Trash
        </Link>
      </div>
    </aside>
  );
}
