"use client";

import { FileText, RotateCcw, Trash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstantTrashNotes } from "../hooks/data/useInstantTrashNotes";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { resolveNoteAncestors } from "@/notes/domain";

export function NoteTrashPageView() {
  const { pages, isLoading } = useInstantTrashNotes();
  const { pages: allPages } = useInstantNoteTree();
  const { restoreMutation, purgeMutation } = useNoteMutations();

  const handlePurge = async (id: number, title: string) => {
    const confirmed = window.confirm(
      `Permanently delete "${title || "Untitled"}"? This cannot be undone.`
    );
    if (!confirmed) return;
    await purgeMutation.mutateAsync(id);
  };

  const handleEmptyTrash = async () => {
    if (pages.length === 0) return;
    const confirmed = window.confirm(
      `Permanently delete all ${pages.length} item${pages.length === 1 ? "" : "s"} in trash? This cannot be undone.`
    );
    if (!confirmed) return;
    await Promise.all(pages.map((page) => purgeMutation.mutateAsync(page.id)));
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-10">
        <div className="mb-1 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Trash className="h-[22px] w-[22px] text-muted-foreground" />
            <h1 className="text-[26px] font-semibold">Trash</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={pages.length === 0}
            onClick={handleEmptyTrash}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Empty trash
          </Button>
        </div>
        <p className="mb-6 text-[13.5px] text-muted-foreground">
          Pages are permanently deleted after 30 days.
        </p>

        {!isLoading && pages.length === 0 && (
          <p className="text-sm text-muted-foreground">Trash is empty.</p>
        )}

        <div className="flex flex-col">
          {pages.map((page) => {
            const ancestors = resolveNoteAncestors(allPages, page.id);
            const parentLabel = ancestors[0]?.title;
            return (
              <div
                key={page.id}
                className="flex items-center gap-3.5 border-b border-border/60 py-3 px-2 last:border-b-0"
              >
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-accent/60 text-muted-foreground/70">
                  {page.icon ?? <FileText className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-medium text-foreground/65">
                    {page.title || "Untitled"}
                  </div>
                  <div className="text-xs text-muted-foreground/80">
                    {parentLabel ? `${parentLabel} · ` : ""}
                    Deleted {formatRelativeTime(page.deletedAt ?? page.updatedAt)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => restoreMutation.mutate(page.id)}
                  className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 hover:bg-destructive/15 hover:text-destructive"
                  title="Delete permanently"
                  onClick={() => handlePurge(page.id, page.title)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
