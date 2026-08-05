"use client";

import { FileText, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstantTrashNotes } from "../hooks/data/useInstantTrashNotes";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";

export function NoteTrashPageView() {
  const { pages, isLoading } = useInstantTrashNotes();
  const { restoreMutation, purgeMutation } = useNoteMutations();

  const handlePurge = async (id: number, title: string) => {
    const confirmed = window.confirm(
      `Permanently delete "${title || "Untitled"}"? This cannot be undone.`
    );
    if (!confirmed) return;
    await purgeMutation.mutateAsync(id);
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Trash</h1>
      {!isLoading && pages.length === 0 && (
        <p className="text-sm text-muted-foreground">Trash is empty.</p>
      )}
      <div className="space-y-1">
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2"
          >
            <span className="shrink-0">
              {page.icon ?? <FileText className="h-4 w-4 text-muted-foreground" />}
            </span>
            <span className="flex-1 truncate text-sm">{page.title || "Untitled"}</span>
            <Button
              variant="ghost"
              size="icon"
              title="Restore"
              onClick={() => restoreMutation.mutate(page.id)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete permanently"
              onClick={() => handlePurge(page.id, page.title)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
