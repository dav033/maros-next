import type { NotePageSummary, NoteTreeNode } from "../models";

/**
 * Turns a flat list of pages into a nested tree. Starred pages lead each sibling group,
 * while position still controls the order within the starred and unstarred sections.
 * Pages whose parentId doesn't resolve to another page in the list (orphans — usually a
 * page whose parent was concurrently trashed) are surfaced as roots rather than silently
 * dropped.
 */
export function buildNoteTree(pages: NotePageSummary[]): NoteTreeNode[] {
  const nodeById = new Map<number, NoteTreeNode>();
  for (const page of pages) {
    nodeById.set(page.id, { ...page, children: [] });
  }

  const roots: NoteTreeNode[] = [];
  for (const page of pages) {
    const node = nodeById.get(page.id);
    if (!node) continue;

    const parent =
      page.parentId != null ? nodeById.get(page.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortByFavoriteThenPosition = (nodes: NoteTreeNode[]): void => {
    nodes.sort(
      (a, b) =>
        Number(b.isFavorite) - Number(a.isFavorite) || a.position - b.position,
    );
    for (const node of nodes) sortByFavoriteThenPosition(node.children);
  };
  sortByFavoriteThenPosition(roots);

  return roots;
}
