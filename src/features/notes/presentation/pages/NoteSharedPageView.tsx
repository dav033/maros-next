"use client";

import Link from "next/link";
import { FileText, Folder, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInstantSharedWithMe } from "../hooks/data/useInstantSharedWithMe";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { noteAuthorInitials, noteAuthorName } from "../atoms/noteAuthorInitials";
import { noteTagColor } from "../atoms/noteVisualTokens";

/**
 * Only pages reached through an explicit grant. Anything already visible to the whole
 * team is deliberately absent — otherwise this would just be a second copy of the
 * workspace, and the one thing it is meant to answer ("what did somebody hand me?")
 * would be buried in it.
 */
export function NoteSharedPageView() {
  const { pages, isLoading } = useInstantSharedWithMe();

  return (
    <main className="notes-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
        <div className="mb-1 flex items-center gap-2.5">
          <Users className="h-[22px] w-[22px] text-primary" />
          <h1 className="text-[26px] font-semibold">Shared with me</h1>
        </div>
        <p className="mb-6 text-[13.5px] text-muted-foreground">
          Notes a colleague gave you access to. Sub-pages are included even when they are
          not listed here.
        </p>

        {!isLoading && pages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing yet — notes people share with you will show up here.
          </p>
        )}

        <div className="flex flex-col">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex min-w-0 flex-wrap items-center gap-3 border-b border-border/60 px-2 py-3 last:border-b-0 hover:rounded-lg hover:bg-accent/35 sm:flex-nowrap sm:gap-3.5"
            >
              <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                {page.icon ??
                  (page.kind === "folder" ? (
                    <Folder className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  ))}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/notes/${page.id}`}
                  className="block truncate text-[14.5px] font-medium hover:underline"
                >
                  {page.title || "Untitled"}
                </Link>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  {page.lastEditedBy && (
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar className="h-4 w-4">
                        {page.lastEditedBy.picture && (
                          <AvatarImage src={page.lastEditedBy.picture} alt="" />
                        )}
                        <AvatarFallback className="text-[8px] font-semibold">
                          {noteAuthorInitials(page.lastEditedBy)}
                        </AvatarFallback>
                      </Avatar>
                      {noteAuthorName(page.lastEditedBy)}
                    </span>
                  )}
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

              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(page.updatedAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
