"use client";

import Link from "next/link";
import { Briefcase, ChevronRight, FileText, Folder, Plus, Star, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NoteEditor } from "../organisms/NoteEditor";
import { NoteFolderView } from "./NoteFolderView";
import { TagPicker } from "../molecules/TagPicker";
import { NoteEntityPicker } from "../molecules/NoteEntityPicker";
import { useNoteEntityLabel } from "../hooks/data/useNoteEntityLabel";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { noteAuthorInitials, noteAuthorName } from "../atoms/noteAuthorInitials";
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
  const editor = logic.activePage?.lastEditedBy ?? null;
  const isFolder = logic.activePage?.kind === "folder";
  const entity = useNoteEntityLabel(
    logic.activePage?.entityKind ?? null,
    logic.activePage?.entityId ?? null,
  );

  return (
    <main className="flex-1 overflow-y-auto">
      {logic.activePageId == null ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
          <FileText className="h-10 w-10" />
          <p>Select a page, or create a new one.</p>
          <Button onClick={() => logic.onCreateRoot("page")}>New page</Button>
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
              {isFolder ? <Folder className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
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
            <div className="flex min-h-5 min-w-0 items-center gap-2 text-xs text-muted-foreground">
              {logic.saveStatus !== "idle" ? (
                <span>{SAVE_LABEL[logic.saveStatus]}</span>
              ) : (
                logic.activePage && (
                  <>
                    {editor && (
                      <Avatar className="h-5 w-5">
                        {editor.picture && <AvatarImage src={editor.picture} alt="" />}
                        <AvatarFallback className="text-[9px] font-semibold">
                          {noteAuthorInitials(editor)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="truncate">
                      {editor ? `${noteAuthorName(editor)} · ` : ""}
                      Edited {formatRelativeTime(logic.activePage.updatedAt)}
                    </span>
                  </>
                )
              )}
            </div>
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

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {logic.activePage?.entityKind && logic.activePage.entityId != null ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent py-1 pl-2 pr-1 text-[12.5px]">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                {entity.href ? (
                  <Link href={entity.href} className="max-w-[16rem] truncate hover:underline">
                    {entity.label ?? "Loading…"}
                  </Link>
                ) : (
                  <span className="max-w-[16rem] truncate">{entity.label ?? "Loading…"}</span>
                )}
                <button
                  type="button"
                  onClick={() => logic.onEntityLinkChange({ entityKind: null, entityId: null })}
                  title="Unassign"
                  aria-label="Unassign from lead or project"
                  className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : (
              <NoteEntityPicker
                onSelect={logic.onEntityLinkChange}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1 text-[12.5px] text-muted-foreground hover:border-solid hover:text-foreground"
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    Assign to lead or project
                  </button>
                }
              />
            )}
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

          {!logic.activePageLoading &&
            (isFolder ? (
              <NoteFolderView
                folderId={logic.activePageId}
                pages={logic.tree}
                onCreateChild={logic.onCreateChild}
              />
            ) : (
              <NoteEditor
                key={logic.activePageId}
                pageId={logic.activePageId}
                initialContent={logic.activePage?.content ?? emptyNoteDoc()}
                onChange={logic.onContentChange}
              />
            ))}
        </div>
      )}
    </main>
  );
}
