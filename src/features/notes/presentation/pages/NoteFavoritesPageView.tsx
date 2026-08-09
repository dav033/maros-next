"use client";

import Link from "next/link";
import { FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstantFavoriteNotes } from "../hooks/data/useInstantFavoriteNotes";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { noteTagColor } from "../atoms/noteVisualTokens";
import { resolveNoteAncestors } from "@/notes/domain";

export function NoteFavoritesPageView() {
  const { pages, isLoading } = useInstantFavoriteNotes();
  const { pages: allPages } = useInstantNoteTree();
  const { favoriteMutation } = useNoteMutations();

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
        <div className="mb-1 flex items-center gap-2.5">
          <Star className="h-[22px] w-[22px] fill-amber-400 text-amber-400" />
          <h1 className="text-[26px] font-semibold">Favorites</h1>
        </div>
        <p className="mb-6 text-[13.5px] text-muted-foreground">
          Pages you&apos;ve starred for quick access.
        </p>

        {!isLoading && pages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No favorites yet — star a page to pin it here.
          </p>
        )}

        <div className="flex flex-col">
          {pages.map((page) => {
            const ancestors = resolveNoteAncestors(allPages, page.id);
            const parentLabel = ancestors[0]?.title || "General";
            return (
              <div
                key={page.id}
                className="flex min-w-0 items-center gap-3 border-b border-border/60 py-3 px-2 last:border-b-0 hover:rounded-lg hover:bg-accent/35 sm:gap-3.5"
              >
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                  {page.icon ?? <FileText className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/notes/${page.id}`}
                    className="block truncate text-[14.5px] font-medium hover:underline"
                  >
                    {page.title || "Untitled"}
                  </Link>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <span>{parentLabel}</span>
                    {page.tags.map((tag) => (
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
                  {formatRelativeTime(page.updatedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  title="Remove from favorites"
                  aria-label="Remove from favorites"
                  onClick={() => favoriteMutation.mutate({ id: page.id, isFavorite: false })}
                >
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
