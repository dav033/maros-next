"use client";

import { useState } from "react";
import {
  FileText,
  FolderPlus,
  Globe,
  Plus,
  Search,
  Star,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { NoteKind, NotePageSummary } from "@/notes/domain";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { NoteListPanel, NoteListRow } from "../molecules/NoteListRow";
import { requestNoteContentSearch } from "../organisms/noteSearchBus";

export function NotesHomeView({
  pages,
  onCreate,
  onSetFavorite,
  creating = false,
}: {
  pages: NotePageSummary[];
  onCreate: (kind?: NoteKind) => void;
  onSetFavorite: (id: number, isFavorite: boolean) => void;
  creating?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | NoteKind>("all");
  const [sort, setSort] = useState("recent");
  const search = query.trim().toLocaleLowerCase();
  const titles = new Map(
    pages.map((page) => [page.id, page.title || "Untitled"]),
  );
  const visible = pages
    .filter(
      (page) =>
        (kind === "all" || page.kind === kind) &&
        [page.title || "Untitled", ...page.tags.map((tag) => tag.name)].some(
          (text) => text.toLocaleLowerCase().includes(search),
        ),
    )
    .sort((a, b) =>
      sort === "name"
        ? (a.title || "Untitled").localeCompare(b.title || "Untitled")
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
      {/* No second "Notes" heading: the workspace chrome above already says where
          we are, and two stacked headers cost ~140px before the first note. */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Your notes
        </h2>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            disabled={creating}
            onClick={() => onCreate("folder")}
          >
            <FolderPlus className="size-3.5" aria-hidden="true" /> New folder
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            disabled={creating}
            onClick={() => onCreate("page")}
          >
            <Plus className="size-3.5" aria-hidden="true" />{" "}
            {creating ? "Creating…" : "New page"}
          </Button>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-elev-1 px-6 py-12 text-center">
          <FileText
            className="mx-auto size-7 text-muted-foreground"
            aria-hidden="true"
          />
          <h3 className="mt-3 font-display text-sm font-semibold">
            A place for the details
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Capture meeting notes, project decisions, and follow-ups. Use
            folders to keep related pages together.
          </p>
          <Button
            size="sm"
            className="mt-4 h-8 text-xs"
            disabled={creating}
            onClick={() => onCreate("page")}
          >
            Create your first page
          </Button>
        </div>
      ) : (
        <NoteListPanel
          toolbar={
            <>
              <div className="relative min-w-0 flex-[1_1_12rem]">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Filter pages by title or label"
                  placeholder="Find a page or label…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-8 border-line bg-elev-1 pl-8 pr-8 text-xs"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0.5 top-0.5 size-7"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </Button>
                )}
              </div>
              {/* Segmented control on an opaque track, so the selected filter is a
                  raised chip rather than a slightly darker ghost button. */}
              <div
                className="flex shrink-0 items-center gap-0.5 rounded-md border border-line bg-elev-1 p-0.5"
                role="group"
                aria-label="Page type"
              >
                {(
                  [
                    ["all", "All"],
                    ["page", "Pages"],
                    ["folder", "Folders"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={kind === value}
                    onClick={() => setKind(value)}
                    className={cn(
                      "rounded px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      kind === value
                        ? "bg-elev-4 text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select
                aria-label="Sort pages"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-8 shrink-0 rounded-md border border-line bg-elev-1 px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="recent">Last edited</option>
                <option value="name">Title A–Z</option>
              </select>
              <span
                className="ml-auto shrink-0 rounded bg-elev-4 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide tabular-nums text-muted-foreground"
                role="status"
              >
                {visible.length} of {pages.length}
              </span>
            </>
          }
        >
          {visible.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs font-medium">No matching pages</p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                This only looks at titles and labels.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {/* The filter above never looks inside a note, so "no results"
                    used to be a dead end for anyone searching for a word they
                    know they wrote. Hand the query to the full-text palette. */}
                {search && (
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => requestNoteContentSearch(query)}
                  >
                    <Search className="size-3.5" aria-hidden="true" />
                    Search inside notes
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setQuery("");
                    setKind("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line/60">
              {visible.map((page) => (
                <NoteListRow
                  key={page.id}
                  href={`/notes/${page.id}`}
                  kind={page.kind}
                  icon={page.icon || undefined}
                  title={page.title}
                  context={
                    page.parentId
                      ? titles.get(page.parentId) || "Shared folder"
                      : page.kind === "folder"
                        ? "Folder"
                        : "Workspace"
                  }
                  tags={page.tags}
                  timestamp={formatRelativeTime(page.updatedAt)}
                  badges={
                    <>
                      {page.isPublished && (
                        <Globe
                          className="size-3 shrink-0 text-emerald-400"
                          aria-label="Published on the web"
                        />
                      )}
                      {page.isShared && !page.isPublished && (
                        <Users
                          className="size-3 shrink-0 text-muted-foreground"
                          aria-label="Shared with specific people"
                        />
                      )}
                    </>
                  }
                  actions={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-muted-foreground"
                      aria-label={`${page.isFavorite ? "Remove" : "Add"} ${page.title || "Untitled"} ${page.isFavorite ? "from" : "to"} favorites`}
                      aria-pressed={page.isFavorite}
                      onClick={() => onSetFavorite(page.id, !page.isFavorite)}
                    >
                      <Star
                        className={cn(
                          "size-3.5",
                          page.isFavorite && "fill-amber-400 text-amber-400",
                        )}
                        aria-hidden="true"
                      />
                    </Button>
                  }
                />
              ))}
            </ul>
          )}
        </NoteListPanel>
      )}
    </div>
  );
}
