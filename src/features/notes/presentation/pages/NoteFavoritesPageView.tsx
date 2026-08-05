"use client";

import Link from "next/link";
import { FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstantFavoriteNotes } from "../hooks/data/useInstantFavoriteNotes";
import { useNoteMutations } from "../hooks/mutations/useNoteMutations";

export function NoteFavoritesPageView() {
  const { pages, isLoading } = useInstantFavoriteNotes();
  const { favoriteMutation } = useNoteMutations();

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Favorites</h1>
      {!isLoading && pages.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No favorites yet — star a page to pin it here.
        </p>
      )}
      <div className="space-y-1">
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2"
          >
            <span className="shrink-0">
              {page.icon ?? <FileText className="h-4 w-4 text-muted-foreground" />}
            </span>
            <Link href={`/notes/${page.id}`} className="flex-1 truncate text-sm hover:underline">
              {page.title || "Untitled"}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              title="Remove from favorites"
              onClick={() => favoriteMutation.mutate({ id: page.id, isFavorite: false })}
            >
              <Star className="h-4 w-4 fill-current text-amber-400" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
