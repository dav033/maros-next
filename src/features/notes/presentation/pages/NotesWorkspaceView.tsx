"use client";

import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  Eye,
  FileText,
  Folder,
  Globe,
  Plus,
  Share2,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NoteEditor } from "../organisms/NoteEditor";
import { ShareNoteDialog } from "../organisms/ShareNoteDialog";
import { NoteFolderView } from "./NoteFolderView";
import { TagPicker } from "../molecules/TagPicker";
import { NoteEntityPicker } from "../molecules/NoteEntityPicker";
import { useNoteEntityLabel } from "../hooks/data/useNoteEntityLabel";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import {
  noteAuthorInitials,
  noteAuthorName,
} from "../atoms/noteAuthorInitials";
import { noteTagColor } from "../atoms/noteVisualTokens";
import { emptyNoteDoc, resolveNoteAncestors } from "@/notes/domain";
import type { UseNotesWorkspaceLogicReturn } from "./useNotesWorkspaceLogic";

const SAVE_LABEL: Record<string, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  retrying: "Retrying…",
  conflict: "This page changed elsewhere — reload to see the latest version",
  error: "Couldn't save — edit again to retry",
};

export function NotesWorkspaceView({
  logic,
}: {
  logic: UseNotesWorkspaceLogicReturn;
}) {
  const ancestors =
    logic.activePageId != null
      ? resolveNoteAncestors(logic.tree, logic.activePageId)
      : [];
  const editor = logic.activePage?.lastEditedBy ?? null;
  const isFolder = logic.activePage?.kind === "folder";
  const entity = useNoteEntityLabel(
    logic.activePage?.entityKind ?? null,
    logic.activePage?.entityId ?? null,
  );

  return (
    <main className="notes-scrollbar min-w-0 flex-1 overflow-y-auto bg-background/20">
      {logic.activePageId == null ? (
        <div className="flex h-full min-h-[22rem] items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center shadow-sm">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-foreground">
              Your workspace is ready
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Select a page from the sidebar, or create a new one to get
              started.
            </p>
            <Button className="mt-5" onClick={() => logic.onCreateRoot("page")}>
              New page
            </Button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
          <nav
            aria-label="Note location"
            className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span className="font-medium text-foreground/70">Notes</span>
            {ancestors.map((ancestor) => (
              <span key={ancestor.id} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="max-w-[14rem] truncate">
                  {ancestor.title || "Untitled"}
                </span>
              </span>
            ))}
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="max-w-[14rem] truncate text-foreground/80">
              {logic.title || "Untitled"}
            </span>
          </nav>

          <div className="mb-4 flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              {isFolder ? (
                <Folder className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FileText className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            {logic.canEdit ? (
              <Input
                value={logic.title}
                onChange={(e) => logic.setTitle(e.target.value)}
                onBlur={logic.onTitleBlur}
                placeholder="Untitled"
                className="min-w-0 border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 sm:text-3xl"
              />
            ) : (
              // A disabled Input still reads as a field you might be able to use. A
              // read-only page simply has no field.
              <h1 className="min-w-0 truncate text-2xl font-semibold sm:text-3xl">
                {logic.title || "Untitled"}
              </h1>
            )}
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 sm:gap-4">
            <div className="flex min-h-8 min-w-0 items-center gap-2 text-xs text-muted-foreground">
              {logic.saveStatus !== "idle" ? (
                <span>{SAVE_LABEL[logic.saveStatus]}</span>
              ) : (
                logic.activePage && (
                  <>
                    {editor && (
                      <Avatar className="h-5 w-5">
                        {editor.picture && (
                          <AvatarImage src={editor.picture} alt="" />
                        )}
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
              {logic.activePage?.isPublished && (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                  title="This note is published on the web"
                >
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  Published
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={logic.onToggleFavorite}
                title="Toggle favorite"
                aria-label={
                  logic.activePage?.isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Star
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4",
                    logic.activePage?.isFavorite &&
                      "fill-current text-amber-400",
                  )}
                />
              </Button>
              {logic.canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 bg-background/40"
                  onClick={() => logic.setShareOpen(true)}
                  title="Share"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Share
                </Button>
              )}
              {logic.canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logic.onTrash}
                  title="Move to trash"
                  aria-label="Move to trash"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          {!logic.canEdit && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span>
                This note was shared with you as read-only. Ask its owner if you
                need to make changes.
              </span>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {logic.activePage?.entityKind &&
            logic.activePage.entityId != null ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 py-1 pl-2 pr-1 text-[12.5px]">
                <Briefcase
                  className="h-3.5 w-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                {entity.href ? (
                  <Link
                    href={entity.href}
                    className="max-w-[16rem] truncate hover:underline"
                  >
                    {entity.label ?? "Loading…"}
                  </Link>
                ) : (
                  <span className="max-w-[16rem] truncate">
                    {entity.label ?? "Loading…"}
                  </span>
                )}
                {logic.canEdit && (
                  <button
                    type="button"
                    onClick={() =>
                      logic.onEntityLinkChange({
                        entityKind: null,
                        entityId: null,
                      })
                    }
                    title="Unassign"
                    aria-label="Unassign from lead or project"
                    className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </span>
            ) : logic.canEdit ? (
              <NoteEntityPicker
                onSelect={logic.onEntityLinkChange}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:border-solid hover:bg-accent/50 hover:text-foreground"
                  >
                    <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                    Link to a lead, project, contact or company
                  </button>
                }
              />
            ) : null}
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            {(logic.activePage?.tags ?? []).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2 py-1 text-[12px] font-medium text-foreground/90"
              >
                <span
                  className="h-[7px] w-[7px] shrink-0 rounded-full"
                  style={{ backgroundColor: noteTagColor(tag.color) }}
                />
                {tag.name}
              </span>
            ))}
            {logic.canEdit && (
              <TagPicker
                selectedTagIds={logic.activePage?.tags.map((t) => t.id) ?? []}
                onChange={logic.onTagsChange}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-[12.5px] text-muted-foreground transition-colors hover:border-solid hover:bg-accent/50 hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    Add label
                  </button>
                }
              />
            )}
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
                editable={logic.canEdit}
              />
            ))}

          {logic.activePageId != null && (
            <ShareNoteDialog
              pageId={logic.activePageId}
              pageTitle={logic.title}
              open={logic.shareOpen}
              onOpenChange={logic.setShareOpen}
            />
          )}
        </div>
      )}
    </main>
  );
}
