"use client";

import { FolderPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { noteAuthorName } from "../atoms/noteAuthorInitials";
import { NoteListPanel, NoteListRow } from "../molecules/NoteListRow";
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
  canEdit = true,
}: {
  folderId: number;
  pages: NotePageSummary[];
  onCreateChild: (parentId: number, kind?: NoteKind) => void;
  canEdit?: boolean;
}) {
  const children = pages
    .filter((page) => page.parentId === folderId)
    .sort((a, b) => a.position - b.position || a.id - b.id);

  return (
    <section>
      {canEdit && (
        <div className="mb-2.5 flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onClick={() => onCreateChild(folderId, "page")}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            New page
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            onClick={() => onCreateChild(folderId, "folder")}
          >
            <FolderPlus className="size-3.5" aria-hidden="true" />
            New folder
          </Button>
        </div>
      )}

      {children.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-elev-1 px-6 py-10 text-center">
          <p className="text-xs text-muted-foreground">
            {canEdit
              ? "This folder is empty — add a page, or drag one in from the sidebar."
              : "This folder has no pages yet."}
          </p>
        </div>
      ) : (
        <NoteListPanel>
          <ul className="divide-y divide-line/60">
            {children.map((child) => (
              <NoteListRow
                key={child.id}
                href={`/notes/${child.id}`}
                kind={child.kind}
                icon={child.icon || undefined}
                title={child.title}
                tags={child.tags}
                timestamp={formatRelativeTime(child.updatedAt)}
                context={
                  child.lastEditedBy
                    ? noteAuthorName(child.lastEditedBy)
                    : undefined
                }
              />
            ))}
          </ul>
        </NoteListPanel>
      )}
    </section>
  );
}
