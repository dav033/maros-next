import type { DepthRow } from "./excludeDescendantRows";

export interface ReparentProjection {
  parentId: number | null;
  beforeId: number | null;
  afterId: number | null;
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/**
 * Given the depth-first-flattened, currently VISIBLE rows (with the dragged row's own
 * descendants already excluded — see excludeDescendantRows), figures out where a page
 * dropped at `overId` should land: which parent it falls under, and which siblings it
 * sits between. `dragDepthDelta` is the horizontal drag distance in indent-widths
 * (rounded), so dragging right nests the page one level deeper, dragging left un-nests it.
 *
 * This mirrors the standard dnd-kit "sortable tree" projection algorithm: because the
 * list is a depth-first flatten, a row's siblings are exactly the maximal run of
 * neighbors at the same depth, bounded by the first shallower row in either direction —
 * so sibling boundaries and the parent id can both be read directly off `depth` without
 * needing the original nested tree.
 *
 * Returns null when activeId or overId isn't present in `rows` (e.g. the drop target was
 * one of the dragged row's own descendants, already filtered out) — the caller should
 * treat that as an invalid drop and no-op.
 */
export function projectNoteReparent(
  rows: DepthRow[],
  activeId: number,
  overId: number,
  dragDepthDelta: number
): ReparentProjection | null {
  const activeIndex = rows.findIndex((r) => r.id === activeId);
  const overIndex = rows.findIndex((r) => r.id === overId);
  if (activeIndex === -1 || overIndex === -1) return null;

  const reordered = arrayMove(rows, activeIndex, overIndex);
  const newIndex = reordered.findIndex((r) => r.id === activeId);
  const previous = reordered[newIndex - 1];
  const next = reordered[newIndex + 1];

  const maxDepth = previous ? previous.depth + 1 : 0;
  const minDepth = next ? next.depth : 0;
  const desiredDepth = (previous?.depth ?? 0) + dragDepthDelta;
  const depth = Math.max(minDepth, Math.min(desiredDepth, maxDepth));

  let parentId: number | null = null;
  if (depth > 0) {
    for (let i = newIndex - 1; i >= 0; i--) {
      if (reordered[i].depth === depth - 1) {
        parentId = reordered[i].id;
        break;
      }
      if (reordered[i].depth < depth - 1) break;
    }
  }

  let afterId: number | null = null;
  for (let i = newIndex - 1; i >= 0; i--) {
    if (reordered[i].depth < depth) break;
    if (reordered[i].depth === depth) {
      afterId = reordered[i].id;
      break;
    }
  }

  let beforeId: number | null = null;
  for (let i = newIndex + 1; i < reordered.length; i++) {
    if (reordered[i].depth < depth) break;
    if (reordered[i].depth === depth) {
      beforeId = reordered[i].id;
      break;
    }
  }

  return { parentId, beforeId, afterId };
}
