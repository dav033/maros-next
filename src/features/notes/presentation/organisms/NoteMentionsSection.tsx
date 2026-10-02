"use client";

import Link from "next/link";
import { AtSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteReferenceKind } from "@/notes/domain";
import { useNotesMentioningEntity } from "../hooks/data/useNotesMentioningEntity";

/**
 * Notes that mention this record in their body — the reverse of an `@` chip.
 *
 * Deliberately separate from the record's Notes panel, which lists the notes *pinned* to
 * it. The two are different relationships and collapsing them would lose the distinction
 * that makes either useful: one is "the notes about this lead", the other is "every note
 * where this lead came up".
 *
 * Renders nothing when there are no mentions. A permanently empty "Mentioned in notes"
 * block on every record in the CRM would be noise on hundreds of pages.
 */
export function NoteMentionsSection({
  entityKind,
  entityId,
  className,
}: {
  entityKind: NoteReferenceKind;
  entityId: number;
  className?: string;
}) {
  const { mentions, isLoading } = useNotesMentioningEntity(entityKind, entityId);

  if (isLoading || mentions.length === 0) return null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <AtSign className="size-3" aria-hidden="true" />
        Mentioned in {mentions.length} {mentions.length === 1 ? "note" : "notes"}
      </p>

      <ul className="space-y-1">
        {mentions.map(({ page, contexts }) => (
          <li key={page.id}>
            <Link
              href={`/notes/${page.id}`}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-elev-3"
            >
              <span className="shrink-0">
                {page.icon ?? (
                  <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                )}
              </span>
              <span className="truncate">{page.title}</span>
            </Link>
            {contexts[0] && (
              <p className="ml-9 line-clamp-1 text-xs text-muted-foreground">{contexts[0]}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
