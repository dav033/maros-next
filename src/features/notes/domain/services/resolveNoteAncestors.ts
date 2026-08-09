import type { NotePageSummary } from "../models";

/**
 * Walks the parentId chain for a page, root-first, stopping at the page itself
 * (exclusive). Used for breadcrumbs and for the "parent" context shown next to
 * a note in the Favorites/Trash lists. Returns [] for a root page, and also
 * for a page whose parent chain can't be fully resolved against `pages` (e.g.
 * an ancestor was trashed independently and is no longer in the list) — callers
 * should treat a short/empty result as "no context available", not an error.
 */
export function resolveNoteAncestors(
  pages: NotePageSummary[],
  pageId: number
): NotePageSummary[] {
  const byId = new Map(pages.map((page) => [page.id, page]));
  const chain: NotePageSummary[] = [];
  const visited = new Set<number>();

  let current = byId.get(pageId);
  if (!current) return [];

  while (current.parentId != null) {
    if (visited.has(current.parentId)) break; // guard against a cyclic chain
    visited.add(current.parentId);
    const parent = byId.get(current.parentId);
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }

  return chain;
}
