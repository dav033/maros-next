"use client";

import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstantSharedWithMe } from "../hooks/data/useInstantSharedWithMe";
import { formatRelativeTime } from "../atoms/formatRelativeTime";
import { noteAuthorInitials, noteAuthorName } from "../atoms/noteAuthorInitials";
import { NoteCollectionShell } from "./NoteCollectionShell";
import { NoteListRow } from "../molecules/NoteListRow";

/**
 * Only pages reached through an explicit grant. Anything already visible to the whole
 * team is deliberately absent — otherwise this would just be a second copy of the
 * workspace, and the one thing it is meant to answer ("what did somebody hand me?")
 * would be buried in it.
 */
export function NoteSharedPageView() {
  const { pages, isLoading } = useInstantSharedWithMe();

  return (
    <NoteCollectionShell
      icon={<Users className="size-4 text-primary" />}
      title="Shared with me"
      description="Notes a colleague gave you access to. Sub-pages are included."
      count={isLoading ? null : pages.length}
      isEmpty={!isLoading && pages.length === 0}
      emptyTitle="Nothing shared with you"
      emptyBody="When somebody grants you access to one of their notes, it shows up here."
    >
      {isLoading
        ? [1, 2, 3].map((row) => (
            <li key={row} className="px-2.5 py-2">
              <Skeleton className="h-5 w-full" />
            </li>
          ))
        : pages.map((page) => (
            <NoteListRow
              key={page.id}
              href={`/notes/${page.id}`}
              kind={page.kind}
              icon={page.icon || undefined}
              title={page.title}
              tags={page.tags}
              timestamp={formatRelativeTime(page.updatedAt)}
              context={
                page.lastEditedBy ? (
                  <span className="inline-flex items-center gap-1.5 align-middle">
                    <Avatar className="size-4">
                      {page.lastEditedBy.picture && (
                        <AvatarImage src={page.lastEditedBy.picture} alt="" />
                      )}
                      <AvatarFallback className="text-[8px] font-semibold">
                        {noteAuthorInitials(page.lastEditedBy)}
                      </AvatarFallback>
                    </Avatar>
                    {noteAuthorName(page.lastEditedBy)}
                  </span>
                ) : undefined
              }
            />
          ))}
    </NoteCollectionShell>
  );
}
