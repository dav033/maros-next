"use client";

import { RotateCcw, Trash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstantTrashNotes } from "../hooks/data/useInstantTrashNotes";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { NoteCollectionShell } from "./NoteCollectionShell";
import { NoteListRow } from "../molecules/NoteListRow";
import { resolveNoteAncestors } from "@/notes/domain";

export function NoteTrashPageView() {
  const { pages, isLoading } = useInstantTrashNotes();
  const { pages: allPages } = useInstantNoteTree();
  const { restoreMutation, purgeMutation } = useNoteMutations();

  const handlePurge = async (id: number, title: string) => {
    const confirmed = window.confirm(
      `Permanently delete "${title || "Untitled"}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    await purgeMutation.mutateAsync(id);
  };

  const handleEmptyTrash = async () => {
    if (pages.length === 0) return;
    const confirmed = window.confirm(
      `Permanently delete all ${pages.length} item${pages.length === 1 ? "" : "s"} in trash? This cannot be undone.`,
    );
    if (!confirmed) return;
    await Promise.all(pages.map((page) => purgeMutation.mutateAsync(page.id)));
  };

  return (
    <NoteCollectionShell
      icon={<Trash className="size-4 text-muted-foreground" />}
      title="Trash"
      description="Pages are permanently deleted after 30 days."
      count={isLoading ? null : pages.length}
      isEmpty={!isLoading && pages.length === 0}
      emptyTitle="Trash is empty"
      emptyBody="Pages you move to the trash wait here for 30 days before they are gone for good."
      action={
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-destructive/40 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pages.length === 0}
          onClick={handleEmptyTrash}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Empty trash
        </Button>
      }
    >
      {isLoading
        ? [1, 2, 3].map((row) => (
            <li key={row} className="px-2.5 py-2">
              <Skeleton className="h-5 w-full" />
            </li>
          ))
        : pages.map((page) => {
            const parentLabel = resolveNoteAncestors(allPages, page.id)[0]
              ?.title;
            return (
              <NoteListRow
                key={page.id}
                kind={page.kind}
                icon={page.icon || undefined}
                title={page.title}
                muted
                context={`${parentLabel ? `${parentLabel} · ` : ""}Deleted ${formatRelativeTime(page.deletedAt ?? page.updatedAt)}`}
                actions={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => restoreMutation.mutate(page.id)}
                    >
                      <RotateCcw className="size-3.5" aria-hidden="true" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 hover:bg-destructive/15 hover:text-destructive"
                      title="Delete permanently"
                      aria-label={`Permanently delete ${page.title || "Untitled"}`}
                      onClick={() => handlePurge(page.id, page.title)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                  </>
                }
              />
            );
          })}
    </NoteCollectionShell>
  );
}
