"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstantFavoriteNotes } from "../hooks/data/useInstantFavoriteNotes";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { NoteCollectionShell } from "./NoteCollectionShell";
import { NoteListRow } from "../molecules/NoteListRow";
import { resolveNoteAncestors } from "@/notes/domain";

export function NoteFavoritesPageView() {
  const { pages, isLoading } = useInstantFavoriteNotes();
  const { pages: allPages } = useInstantNoteTree();
  const { favoriteMutation } = useNoteMutations();

  return (
    <NoteCollectionShell
      icon={<Star className="size-4 fill-amber-400 text-amber-400" />}
      title="Favorites"
      description="Pages you've starred for quick access."
      count={isLoading ? null : pages.length}
      isEmpty={!isLoading && pages.length === 0}
      emptyTitle="Nothing starred yet"
      emptyBody="Star a page from the tree or from any list and it gets pinned here."
    >
      {isLoading
        ? [1, 2, 3].map((row) => (
            <li key={row} className="px-2.5 py-2">
              <Skeleton className="h-5 w-full" />
            </li>
          ))
        : pages.map((page) => {
            const ancestors = resolveNoteAncestors(allPages, page.id);
            return (
              <NoteListRow
                key={page.id}
                href={`/notes/${page.id}`}
                kind={page.kind}
                icon={page.icon || undefined}
                title={page.title}
                context={ancestors[0]?.title || "Workspace"}
                tags={page.tags}
                timestamp={formatRelativeTime(page.updatedAt)}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    title="Remove from favorites"
                    aria-label={`Remove ${page.title || "Untitled"} from favorites`}
                    onClick={() =>
                      favoriteMutation.mutate({ id: page.id, isFavorite: false })
                    }
                  >
                    <Star
                      className="size-3.5 fill-amber-400 text-amber-400"
                      aria-hidden="true"
                    />
                  </Button>
                }
              />
            );
          })}
    </NoteCollectionShell>
  );
}
