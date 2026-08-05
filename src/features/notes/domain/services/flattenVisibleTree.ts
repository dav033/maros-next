import type { NoteTreeNode } from "../models";

export interface VisibleNoteRow {
  id: number;
  parentId: number | null;
  title: string;
  icon: string | null;
  depth: number;
  hasChildren: boolean;
}

/** Flattens a tree into the rows actually on screen, respecting collapsed nodes. */
export function flattenVisibleTree(
  nodes: NoteTreeNode[],
  expandedIds: Set<string>,
  depth = 0
): VisibleNoteRow[] {
  const rows: VisibleNoteRow[] = [];

  for (const node of nodes) {
    rows.push({
      id: node.id,
      parentId: node.parentId,
      title: node.title,
      icon: node.icon,
      depth,
      hasChildren: node.children.length > 0,
    });
    if (node.children.length > 0 && expandedIds.has(String(node.id))) {
      rows.push(...flattenVisibleTree(node.children, expandedIds, depth + 1));
    }
  }

  return rows;
}
