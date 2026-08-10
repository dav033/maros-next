"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Star, Trash, Users } from "lucide-react";
import { NoteTreePanel } from "./NoteTreePanel";
import { ShareNoteDialog } from "./ShareNoteDialog";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import type { NoteKind, NotePageSummary } from "@/notes/domain";
import { cn } from "@/lib/utils";

/**
 * The 256px note-tree sidebar, self-contained so it can be mounted once in
 * `app/notes/layout.tsx` and shown on every notes route (workspace, favorites,
 * trash) — not just the page-editing route it originally lived inside.
 */
export function NotesSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const tree = useInstantNoteTree();
  const { createMutation, moveMutation, favoriteMutation, trashMutation } =
    useNoteMutations();
  const [shareTarget, setShareTarget] = useState<Pick<
    NotePageSummary,
    "id" | "title"
  > | null>(null);

  const titleFor = (kind: NoteKind) =>
    kind === "folder" ? "New folder" : "Untitled";

  const handleCreateRoot = async (kind: NoteKind = "page") => {
    try {
      const page = await createMutation.mutateAsync({
        title: titleFor(kind),
        kind,
      });
      router.push(`/notes/${page.id}`);
    } catch {
      // handled by onError
    }
  };

  const handleCreateChild = async (
    parentId: number,
    kind: NoteKind = "page",
  ) => {
    try {
      const page = await createMutation.mutateAsync({
        title: titleFor(kind),
        kind,
        parentId,
      });
      router.push(`/notes/${page.id}`);
    } catch {
      // handled by onError
    }
  };

  const handleMove = (
    id: number,
    parentId: number | null,
    beforeId: number | null,
    afterId: number | null,
  ) => {
    moveMutation.mutate({ id, parentId, beforeId, afterId });
  };

  const handleTrash = async (id: number) => {
    const request = trashMutation.mutateAsync(id);
    try {
      // Only navigate away when the page that just went to the trash is the one on
      // screen — trashing from the sidebar shouldn't yank the user off another note.
      if (pathname === `/notes/${id}`) router.push("/notes");
      await request;
    } catch {
      // handled by onError
    }
  };

  const secondaryLinks = [
    { href: "/notes/shared", label: "Shared with me", icon: Users },
    { href: "/notes/favorites", label: "Favorites", icon: Star },
    { href: "/notes/trash", label: "Trash", icon: Trash },
  ];

  return (
    <aside className="flex h-52 w-full shrink-0 flex-col border-b border-border/60 bg-card/20 md:h-auto md:w-64 md:border-b-0 md:border-r">
      <div className="min-h-0 flex-1 overflow-hidden">
        <NoteTreePanel
          pages={tree.pages}
          onCreateRoot={handleCreateRoot}
          onCreateChild={handleCreateChild}
          onOpenShare={(id, title) => setShareTarget({ id, title })}
          onMove={handleMove}
          onSetFavorite={(id, isFavorite) =>
            favoriteMutation.mutate({ id, isFavorite })
          }
          onTrash={handleTrash}
        />
      </div>
      <nav
        aria-label="Note collections"
        className="space-y-1 border-t border-border/60 p-2"
      >
        {secondaryLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-9 items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      {shareTarget && (
        <ShareNoteDialog
          key={shareTarget.id}
          pageId={shareTarget.id}
          pageTitle={shareTarget.title}
          defaultTab="link"
          open
          onOpenChange={(open) => !open && setShareTarget(null)}
        />
      )}
    </aside>
  );
}
