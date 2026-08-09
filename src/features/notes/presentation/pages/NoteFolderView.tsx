"use client";

import Link from "next/link";
import { FileText, Folder, FolderPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { noteAuthorName } from "../atoms/noteAuthorInitials";
import { noteTagColor } from "../atoms/noteVisualTokens";
import type { NoteKind, NotePageSummary } from "@/notes/domain";

/**
 * What a folder shows instead of an editor: its direct contents.
 *
 * Children come out of the tree the workspace already loaded rather than a dedicated
 * request — the sidebar has every page in memory anyway.
 */
export function NoteFolderView({
  folderId,
  pages,
  onCreateChild,
}: {
  folderId: number;
  pages: NotePageSummary[];
  onCreateChild: (parentId: number, kind?: NoteKind) => void;
}) {
  const children = pages
    .filter((page) => page.parentId === folderId)
    .sort((a, b) => a.position - b.position || a.id - b.id);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onCreateChild(folderId, "page")}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          New page
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onCreateChild(folderId, "folder")}>
          <FolderPlus className="mr-1 h-3.5 w-3.5" />
          New folder
        </Button>
      </div>

      {children.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          This folder is empty — add a page, or drag one in from the sidebar.
        </p>
      ) : (
        <div className="flex flex-col">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/notes/${child.id}`}
              className="flex min-w-0 items-center gap-3 rounded-lg border-b border-border/60 px-2 py-3 last:border-b-0 hover:bg-accent/35 sm:gap-3.5"
            >
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                {child.icon ??
                  (child.kind === "folder" ? (
                    <Folder className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  ))}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-medium">
                  {child.title || "Untitled"}
                </span>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  {child.lastEditedBy && <span>{noteAuthorName(child.lastEditedBy)}</span>}
                  {child.tags.map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: noteTagColor(tag.color) }}
                      />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(child.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
