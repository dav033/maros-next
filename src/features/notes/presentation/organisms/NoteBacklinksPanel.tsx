"use client";

import Link from "next/link";
import { CornerDownRight, FileText } from "lucide-react";
import type { NoteBacklink } from "@/notes/domain";
import { useNoteBacklinks } from "../hooks/data/useNoteBacklinks";

/**
 * Which notes point here — the other half of a wikilink, and what turns a pile of pages
 * into something you can navigate backwards.
 *
 * Rendered under the document rather than in a side panel: it is the end of reading the
 * note, not a thing to consult while writing it, and the notes column is already narrow.
 *
 * Absent entirely when nothing links here. An empty "Linked references (0)" heading on
 * every note in the workspace would be a permanent reminder of a feature nobody used yet.
 */
export function NoteBacklinksPanel({ pageId }: { pageId: number }) {
  const { backlinks, isLoading } = useNoteBacklinks(pageId);

  if (isLoading || backlinks.length === 0) return null;

  return (
    <section className="mt-10 border-t border-line pt-4" aria-labelledby="note-backlinks">
      <h2
        id="note-backlinks"
        className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
      >
        <CornerDownRight className="size-3.5" aria-hidden="true" />
        Linked references
        <span className="font-normal normal-case tracking-normal">({backlinks.length})</span>
      </h2>

      <ul className="space-y-1.5">
        {backlinks.map((backlink) => (
          <BacklinkRow key={backlink.page.id} backlink={backlink} />
        ))}
      </ul>
    </section>
  );
}

function BacklinkRow({ backlink }: { backlink: NoteBacklink }) {
  const { page, contexts, origins } = backlink;

  return (
    <li className="rounded-md border border-line bg-elev-2 px-3 py-2">
      <Link
        href={`/notes/${page.id}`}
        className="flex items-center gap-2 text-sm font-medium hover:underline"
      >
        <span className="shrink-0">
          {page.icon ?? <FileText className="size-3.5 text-muted-foreground" aria-hidden="true" />}
        </span>
        <span className="truncate">{page.title}</span>
        {/* Only worth saying when the link is *only* a header relation: otherwise the
            quoted line below already shows where it came from. */}
        {!origins.includes("inline") && (
          <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
            Related
          </span>
        )}
      </Link>

      {contexts.length > 0 && (
        <ul className="mt-1.5 space-y-1 border-l-2 border-line-strong pl-2.5">
          {contexts.map((context, index) => (
            <li
              // Context strings are not unique — a note can mention this one twice in two
              // identical lines — so the index is the only stable key available.
              key={index}
              className="line-clamp-2 text-xs text-muted-foreground"
            >
              {context}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
