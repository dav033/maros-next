"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { noteTagColor } from "../atoms/noteVisualTokens";
import type { NoteKind, NoteTag } from "@/notes/domain";

/**
 * One line in every list of notes: the workspace home, favorites, shared-with-me,
 * the trash and a folder's contents.
 *
 * Those five were five different rows — three icon sizes, three paddings, three
 * ways of showing a label — which is why moving between them felt like moving
 * between apps. They are the same object in the same product, so they get one row.
 *
 * Single line on purpose: the old two-line row spent 72px on a title and the word
 * "Page", and five of them filled the viewport. This is ~36px, so the same screen
 * holds roughly twice as many notes without dropping anything that was being read.
 */
export function NoteListRow({
  href,
  icon,
  kind = "page",
  title,
  context,
  tags = [],
  timestamp,
  badges,
  actions,
  muted = false,
}: {
  href?: string;
  icon?: ReactNode;
  kind?: NoteKind;
  title: string;
  /** Where the page lives, or who last touched it — the thing that tells two "Untitled"s apart. */
  context?: ReactNode;
  tags?: NoteTag[];
  timestamp?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  /** Trashed pages read as already gone. */
  muted?: boolean;
}) {
  const isUntitled = !title.trim();
  const body = (
    <>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md bg-elev-3 text-muted-foreground transition-colors group-hover:bg-elev-4",
          muted && "opacity-70",
        )}
      >
        {icon ??
          (kind === "folder" ? (
            <Folder className="size-3.5" aria-hidden="true" />
          ) : (
            <FileText className="size-3.5" aria-hidden="true" />
          ))}
      </span>
      <span
        className={cn(
          "min-w-0 shrink truncate text-[13px] font-medium leading-5",
          isUntitled && "italic text-muted-foreground",
          muted && "text-foreground/60",
        )}
      >
        {isUntitled ? "Untitled" : title}
      </span>
      {badges}
      {context != null && context !== "" && (
        <span className="hidden min-w-0 shrink truncate text-[11px] leading-5 text-muted-foreground sm:inline">
          {context}
        </span>
      )}
      {tags.length > 0 && (
        <span className="hidden shrink-0 items-center gap-1.5 md:inline-flex">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full bg-elev-3 px-1.5 py-px text-[10px] font-medium text-foreground/85"
            >
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: noteTagColor(tag.color) }}
              />
              {tag.name}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{tags.length - 3}
            </span>
          )}
        </span>
      )}
      {timestamp && (
        <span className="ml-auto shrink-0 pl-2 text-[11px] leading-5 text-muted-foreground">
          {timestamp}
        </span>
      )}
    </>
  );

  return (
    <li className="group flex min-w-0 items-center gap-2 px-1.5 transition-colors hover:bg-elev-2">
      {href ? (
        <Link
          href={href}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pl-1 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {body}
        </Link>
      ) : (
        <span className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-1 pr-1">
          {body}
        </span>
      )}
      {actions && (
        <span className="flex shrink-0 items-center gap-0.5">{actions}</span>
      )}
    </li>
  );
}

/** The opaque frame every note list sits in — one elevation above the page. */
export function NoteListPanel({
  toolbar,
  children,
  className,
}: {
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-line bg-elev-1",
        className,
      )}
    >
      {toolbar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-elev-2 px-2.5 py-2">
          {toolbar}
        </div>
      )}
      {children}
    </div>
  );
}
