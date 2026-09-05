"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Folder,
  FolderPlus,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { NoteKind, NotePageSummary } from "@/notes/domain";
import { formatRelativeTime } from "../atoms/formatRelativeTime";

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
    <div className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-8 sm:py-9">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Your notes</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Pick up where you left off, or start a new page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={creating}
            onClick={() => onCreate("folder")}
          >
            <FolderPlus aria-hidden="true" /> New folder
          </Button>
          <Button
            size="sm"
            disabled={creating}
            onClick={() => onCreate("page")}
          >
            <Plus aria-hidden="true" /> {creating ? "Creating…" : "New page"}
          </Button>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="py-16 text-center">
          <FileText
            className="mx-auto size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h3 className="mt-4 text-base font-medium">
            A place for the details
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Capture meeting notes, project decisions, and follow-ups. Use
            folders to keep related pages together.
          </p>
          <Button
            className="mt-5"
            disabled={creating}
            onClick={() => onCreate("page")}
          >
            Create your first page
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-[1_1_14rem]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                aria-label="Filter pages by title or label"
                placeholder="Find a page or label…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9 pr-9"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 size-7"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X aria-hidden="true" />
                </Button>
              )}
            </div>
            <select
              aria-label="Sort pages"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="recent">Last edited</option>
              <option value="name">Title A–Z</option>
            </select>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex gap-1" role="group" aria-label="Page type">
              {(
                [
                  ["all", "All"],
                  ["page", "Pages"],
                  ["folder", "Folders"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="sm"
                  aria-pressed={kind === value}
                  onClick={() => setKind(value)}
                  className={cn(
                    "h-8",
                    kind === value
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground" role="status">
              {visible.length} {visible.length === 1 ? "result" : "results"}
            </span>
          </div>
          {visible.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium">No matching pages</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different title or label.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setQuery("");
                  setKind("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {visible.map((page) => (
                <li
                  key={page.id}
                  className="group flex min-w-0 items-center gap-1 rounded-md hover:bg-accent/30"
                >
                  <Link
                    href={`/notes/${page.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                      {page.icon ||
                        (page.kind === "folder" ? (
                          <Folder className="size-4" aria-hidden="true" />
                        ) : (
                          <FileText className="size-4" aria-hidden="true" />
                        ))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {page.title || "Untitled"}
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {page.parentId
                          ? titles.get(page.parentId) || "Shared folder"
                          : page.kind === "folder"
                            ? "Folder"
                            : "Page"}
                        {page.tags.length > 0 &&
                          ` · ${page.tags.map((tag) => tag.name).join(" · ")}`}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {formatRelativeTime(page.updatedAt)}
                    </span>
                    <ArrowUpRight
                      className="hidden size-3.5 shrink-0 text-muted-foreground group-hover:block sm:group-hover:hidden"
                      aria-hidden="true"
                    />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-1 size-8 shrink-0 text-muted-foreground"
                    aria-label={`${page.isFavorite ? "Remove" : "Add"} ${page.title || "Untitled"} ${page.isFavorite ? "from" : "to"} favorites`}
                    aria-pressed={page.isFavorite}
                    onClick={() => onSetFavorite(page.id, !page.isFavorite)}
                  >
                    <Star
                      className={cn(
                        "size-4",
                        page.isFavorite && "fill-amber-400 text-amber-400",
                      )}
                      aria-hidden="true"
                    />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
