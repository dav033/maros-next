"use client";

import type { ReactNode } from "react";
import { NoteListPanel } from "../molecules/NoteListRow";

/**
 * The frame shared by Favorites, Shared with me and Trash.
 *
 * Each of the three used to build its own header, its own narrow 2xl column and its
 * own row, so the same page looked like a different product depending on which link
 * you arrived from. One shell, one measure, one list surface.
 */
export function NoteCollectionShell({
  icon,
  title,
  description,
  count,
  action,
  isEmpty,
  emptyTitle,
  emptyBody,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  count?: number | null;
  action?: ReactNode;
  isEmpty?: boolean;
  emptyTitle: string;
  emptyBody: string;
  children: ReactNode;
}) {
  return (
    <main className="notes-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-elev-4">
              {icon}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-semibold tracking-tight">
                {title}
              </h1>
              <p className="truncate text-[11px] text-muted-foreground">
                {description}
              </p>
            </div>
            {count != null && (
              <span className="shrink-0 rounded bg-elev-4 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {count}
              </span>
            )}
          </div>
          {action}
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-line bg-elev-1 px-6 py-12 text-center">
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {emptyBody}
            </p>
          </div>
        ) : (
          <NoteListPanel>
            <ul className="divide-y divide-line/60">{children}</ul>
          </NoteListPanel>
        )}
      </div>
    </main>
  );
}
