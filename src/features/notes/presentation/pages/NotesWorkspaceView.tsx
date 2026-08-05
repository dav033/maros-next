"use client";

import Link from "next/link";
import { FileText, Star, Trash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NoteTreePanel } from "../organisms/NoteTreePanel";
import { NoteEditor } from "../organisms/NoteEditor";
import { NoteSearchPalette } from "../organisms/NoteSearchPalette";
import { TagPicker } from "../molecules/TagPicker";
import { emptyNoteDoc } from "@/notes/domain";
import type { UseNotesWorkspaceLogicReturn } from "./useNotesWorkspaceLogic";

const SAVE_LABEL: Record<string, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  conflict: "This page changed elsewhere — reload to see the latest version",
  error: "Couldn't save — retrying on next edit",
};

export function NotesWorkspaceView({ logic }: { logic: UseNotesWorkspaceLogicReturn }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <NoteSearchPalette />
      <aside className="flex w-64 shrink-0 flex-col border-r border-border/60">
        <div className="flex-1 overflow-hidden">
          <NoteTreePanel
            pages={logic.tree}
            onCreateRoot={logic.onCreateRoot}
            onCreateChild={logic.onCreateChild}
            onMove={logic.onMove}
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

      <main className="flex-1 overflow-y-auto">
        {logic.activePageId == null ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <FileText className="h-10 w-10" />
            <p>Select a page, or create a new one.</p>
            <Button onClick={logic.onCreateRoot}>New page</Button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-8 py-10">
            <div className="mb-4 flex items-center justify-between gap-4">
              <Input
                value={logic.title}
                onChange={(e) => logic.setTitle(e.target.value)}
                onBlur={logic.onTitleBlur}
                placeholder="Untitled"
                className="border-none px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
              />
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logic.onToggleFavorite}
                  title="Toggle favorite"
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      logic.activePage?.isFavorite && "fill-current text-amber-400"
                    )}
                  />
                </Button>
                <TagPicker
                  selectedTagIds={logic.activePage?.tags.map((t) => t.id) ?? []}
                  onChange={logic.onTagsChange}
                />
                <Button variant="ghost" size="icon" onClick={logic.onTrash} title="Move to trash">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mb-4 h-4 text-xs text-muted-foreground">
              {SAVE_LABEL[logic.saveStatus]}
            </p>
            {!logic.activePageLoading && (
              <NoteEditor
                key={logic.activePageId}
                pageId={logic.activePageId}
                initialContent={logic.activePage?.content ?? emptyNoteDoc()}
                onChange={logic.onContentChange}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
