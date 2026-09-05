"use client";

import Link from "next/link";
import {
  Briefcase,
  Check,
  ChevronRight,
  Eye,
  FileText,
  Folder,
  Globe,
  Loader2,
  MoreHorizontal,
  Plus,
  Share2,
  Star,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NoteEditor } from "../organisms/NoteEditor";
import { ShareNoteDialog } from "../organisms/ShareNoteDialog";
import { NoteFolderView } from "./NoteFolderView";
import { NotesHomeView } from "./NotesHomeView";
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

  if (
    (logic.activePageId == null && logic.treeLoading) ||
    (logic.activePageId != null && logic.activePageLoading)
  ) {
    return (
      <main
        className="min-w-0 flex-1 p-6 sm:p-10"
        aria-busy="true"
        aria-label="Loading notes"
      >
        <Skeleton className="mb-5 h-5 w-32" />
        <Skeleton className="mb-8 h-10 w-2/3" />
        {[1, 2, 3, 4].map((line) => (
          <Skeleton key={line} className="mb-4 h-8 w-full" />
        ))}
      </main>
    );
  }
  if (
    logic.activePageId != null &&
    !logic.activePage
  ) {
    return (
      <main className="flex min-w-0 flex-1 items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <FileText
            className="mx-auto mb-4 size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold">
            This page couldn't be opened
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try again, or return to your notes to find another page.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="outline" onClick={() => void logic.retryPage()}>
              Try again
            </Button>
            <Button asChild>
              <Link href="/notes">All notes</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="notes-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto bg-background">
      {logic.activePageId == null ? (
        <NotesHomeView
          pages={logic.tree}
          onCreate={logic.onCreateRoot}
          onSetFavorite={logic.onSetFavorite}
          creating={logic.creating}
        />
      ) : (
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
          <nav
            aria-label="Note location"
            className="mb-7 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link
              href="/notes"
              className="rounded-sm font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              All notes
            </Link>
            {ancestors.map((ancestor) => (
              <span key={ancestor.id} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <Link
                  href={`/notes/${ancestor.id}`}
                  className="max-w-[10rem] truncate rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {ancestor.title || "Untitled"}
                </Link>
              </span>
            ))}
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span
              aria-current="page"
              className="max-w-[14rem] truncate text-foreground/80"
            >
              {logic.title || "Untitled"}
            </span>
          </nav>

          <div className="mb-4 flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              {isFolder ? (
                <Folder className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FileText className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            {logic.canEdit ? (
              <textarea
                rows={1}
                aria-label={isFolder ? "Folder title" : "Page title"}
                value={logic.title}
                onChange={(e) => logic.setTitle(e.target.value)}
                onBlur={logic.onTitleBlur}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
                placeholder="Untitled"
                className="block min-h-11 w-full min-w-0 resize-none rounded-sm border-none bg-transparent px-0 py-1 text-2xl font-semibold leading-snug tracking-tight [field-sizing:content] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:text-3xl"
              />
            ) : (
              // A disabled Input still reads as a field you might be able to use. A
              // read-only page simply has no field.
              <h1 className="min-w-0 truncate text-2xl font-semibold sm:text-3xl">
                {logic.title || "Untitled"}
              </h1>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div
              role="status"
              aria-live="polite"
              className={cn(
                "flex min-h-8 min-w-0 items-center gap-2 text-xs text-muted-foreground",
                (logic.saveStatus === "error" ||
                  logic.saveStatus === "conflict") &&
                  "text-red-400",
              )}
            >
              {logic.saveStatus !== "idle" ? (
                <>
                  {logic.saveStatus === "saved" ? (
                    <Check
                      className="size-3.5 text-primary"
                      aria-hidden="true"
                    />
                  ) : logic.saveStatus === "saving" ||
                    logic.saveStatus === "retrying" ? (
                    <Loader2
                      className="size-3.5 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <TriangleAlert
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>{SAVE_LABEL[logic.saveStatus]}</span>
                </>
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
                aria-pressed={logic.activePage?.isFavorite ?? false}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label="More page actions"
                    >
                      <MoreHorizontal className="size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() =>
                        logic.onCreateChild(logic.activePageId!, "page")
                      }
                    >
                      <Plus className="mr-2 size-4" aria-hidden="true" />
                      New page inside
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={logic.onTrash}
                      className="text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="mr-2 size-4" aria-hidden="true" />
                      Move to trash
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

          <details className="group/details mb-6 rounded-lg border border-border/60">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <ChevronRight
                className="size-3.5 transition-transform group-open/details:rotate-90 motion-reduce:transition-none"
                aria-hidden="true"
              />
              <span>Labels & linked record</span>
              <span className="ml-auto truncate">
                {(logic.activePage?.tags.length ?? 0) > 0
                  ? `${logic.activePage?.tags.length} ${logic.activePage?.tags.length === 1 ? "label" : "labels"}`
                  : ""}
                {entity.label ? ` · ${entity.label}` : ""}
              </span>
            </summary>
            <div className="px-3 pb-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
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
                        Link a record
                      </button>
                    }
                  />
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
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
                    selectedTagIds={
                      logic.activePage?.tags.map((t) => t.id) ?? []
                    }
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
            </div>
          </details>

          {!logic.activePageLoading &&
            (isFolder ? (
              <NoteFolderView
                folderId={logic.activePageId}
                pages={logic.tree}
                onCreateChild={logic.onCreateChild}
                canEdit={logic.canEdit}
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
