"use client";

import { ChevronRight, FileText, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NoteEditor } from "../organisms/NoteEditor";
import { TagPicker } from "../molecules/TagPicker";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { noteTagColor } from "../atoms/noteVisualTokens";
import { emptyNoteDoc, resolveNoteAncestors } from "@/notes/domain";
import type { UseNotesWorkspaceLogicReturn } from "./useNotesWorkspaceLogic";

const SAVE_LABEL: Record<string, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  conflict: "This page changed elsewhere — reload to see the latest version",
  error: "Couldn't save — retrying on next edit",
};

export function NotesWorkspaceView({ logic }: { logic: UseNotesWorkspaceLogicReturn }) {
  const ancestors =
    logic.activePageId != null ? resolveNoteAncestors(logic.tree, logic.activePageId) : [];
  const metaLine =
    logic.saveStatus !== "idle"
      ? SAVE_LABEL[logic.saveStatus]
      : logic.activePage
        ? `Edited ${formatRelativeTime(logic.activePage.updatedAt)}`
        : "";

  return (
    <main className="flex-1 overflow-y-auto">
      {logic.activePageId == null ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
          <FileText className="h-10 w-10" />
          <p>Select a page, or create a new one.</p>
          <Button onClick={logic.onCreateRoot}>New page</Button>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-8 py-10">
          <div className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Notes</span>
            {ancestors.map((ancestor) => (
              <span key={ancestor.id} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                <span className="max-w-[14rem] truncate">{ancestor.title || "Untitled"}</span>
              </span>
            ))}
            <ChevronRight className="h-3 w-3" />
            <span className="max-w-[14rem] truncate text-foreground/80">
              {logic.title || "Untitled"}
            </span>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <Input
              value={logic.title}
              onChange={(e) => logic.setTitle(e.target.value)}
              onBlur={logic.onTitleBlur}
              placeholder="Untitled"
              className="border-none px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="h-4 text-xs text-muted-foreground">{metaLine}</p>
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
              <Button variant="ghost" size="icon" onClick={logic.onTrash} title="Move to trash">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            {(logic.activePage?.tags ?? []).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground/90"
              >
                <span
                  className="h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: noteTagColor(tag.color) }}
                />
                {tag.name}
              </span>
            ))}
            <TagPicker
              selectedTagIds={logic.activePage?.tags.map((t) => t.id) ?? []}
              onChange={logic.onTagsChange}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                  Add label
                </button>
              }
            />
          </div>

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
  );
}
