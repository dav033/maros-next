"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FileText, Folder, Printer } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { buildNoteToc, buildNoteTree, flattenVisibleTree } from "@/notes/domain";
import type { PublicNoteResponse, PublicNoteTreeNode } from "@/notes/domain";
import { NoteReadOnlyView } from "../organisms/NoteReadOnlyView";
import { PublicNoteImageSource } from "../organisms/NoteImageSourceContext";
import { noteTagColor } from "../atoms/noteVisualTokens";
import { formatRelativeTime } from "../atoms/formatRelativeTime";

export interface PublicNoteReaderProps {
  token: string;
  data: PublicNoteResponse;
  tree: PublicNoteTreeNode[];
}

function initials(name: string | null): string {
  return (name?.trim() || "?").slice(0, 2).toUpperCase();
}

/**
 * The page an outside reader actually sees.
 *
 * Nothing here knows about sessions, permissions or the CRM shell — the token in the
 * URL already decided everything. What it does carry is the things a shared document
 * needs to be usable: a contents list, printable output, and a visible "last updated"
 * so nobody works from a version that moved on.
 */
export function PublicNoteReader({ token, data, tree }: PublicNoteReaderProps) {
  const { page } = data;

  const toc = useMemo(() => buildNoteToc(page.content), [page.content]);

  // The public tree comes back flat; the same builder the CRM sidebar uses turns it
  // into something navigable, so nesting behaves identically in both.
  const navRows = useMemo(() => {
    if (tree.length === 0) return [];
    const rows = tree.map((node) => ({
      ...node,
      isFavorite: false,
      visibility: "team" as const,
      isShared: false,
      isPublished: true,
      entityKind: null,
      entityId: null,
      ownerId: null,
      deletedAt: null,
      createdAt: "",
      updatedAt: "",
      lastEditedBy: null,
      tags: [],
    }));
    const built = buildNoteTree(rows);
    return flattenVisibleTree(
      built,
      new Set(rows.map((row) => String(row.id)))
    );
  }, [tree]);

  return (
    <PublicNoteImageSource token={token}>
      <div className="mx-auto flex max-w-6xl gap-10 px-4 py-6 sm:px-8 sm:py-10 lg:py-14">
        {navRows.length > 1 && (
          <nav
            aria-label="Pages"
            className="hidden w-56 shrink-0 lg:block print:hidden"
          >
            <div className="sticky top-10 space-y-0.5">
              {navRows.map((row) => (
                <Link
                  key={row.id}
                  href={
                    row.id === page.id
                      ? `/p/${token}`
                      : `/p/${token}?page=${row.id}`
                  }
                  style={{ paddingLeft: `${row.depth * 12}px` }}
                  className={
                    row.id === page.id
                      ? "flex items-center gap-1.5 rounded px-2 py-1 text-[13px] font-medium text-foreground"
                      : "flex items-center gap-1.5 rounded px-2 py-1 text-[13px] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }
                >
                  {row.kind === "folder" ? (
                    <Folder className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate">{row.title || "Untitled"}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}

        <article className="min-w-0 flex-1">
          <header className="mb-8 border-b border-border/60 pb-6">
            <div className="mb-3 flex items-start gap-3">
              {page.icon && <span className="text-3xl leading-none">{page.icon}</span>}
              <h1 className="min-w-0 break-words text-3xl font-semibold leading-tight sm:text-4xl">
                {page.title || "Untitled"}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              {page.author && (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    {page.author.picture && (
                      <AvatarImage src={page.author.picture} alt="" />
                    )}
                    <AvatarFallback className="text-[9px] font-semibold">
                      {initials(page.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  {page.author.name ?? "Maros Construction"}
                </span>
              )}
              <span>Updated {formatRelativeTime(page.updatedAt)}</span>
              {page.tags.map((tag) => (
                <span key={tag.name} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: noteTagColor(tag.color) }}
                  />
                  {tag.name}
                </span>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 gap-1.5 text-xs print:hidden"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
            </div>
          </header>

          {toc.length > 2 && (
            <nav
              aria-label="Contents"
              className="mb-8 rounded-lg border border-border/60 p-4 print:hidden"
            >
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contents
              </div>
              <ul className="space-y-1">
                {toc.map((entry) => (
                  <li
                    key={entry.id}
                    style={{ paddingLeft: `${(entry.level - 1) * 12}px` }}
                  >
                    <a
                      href={`#${entry.id}`}
                      className="break-words text-[13px] text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <NoteReadOnlyView content={page.content} />

          <footer className="mt-12 border-t border-border/60 pt-5 text-xs text-muted-foreground">
            Shared from Maros Construction
          </footer>
        </article>
      </div>
    </PublicNoteImageSource>
  );
}
