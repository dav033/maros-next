export interface DepthRow {
  id: number;
  depth: number;
}

/**
 * Removes a row's descendants from a depth-first-flattened list, keeping the row itself.
 * Descendants of a dragged page must never be treated as valid drop targets or as
 * position anchors for it — dropping a page onto its own child would otherwise look
 * like a normal move to the projection algorithm, when it's actually a cycle.
 */
export function excludeDescendantRows<T extends DepthRow>(rows: T[], activeId: number): T[] {
  const activeIndex = rows.findIndex((r) => r.id === activeId);
  if (activeIndex === -1) return rows;

  const activeDepth = rows[activeIndex].depth;
  let endIndex = activeIndex + 1;
  while (endIndex < rows.length && rows[endIndex].depth > activeDepth) {
    endIndex++;
  }

  return [...rows.slice(0, activeIndex + 1), ...rows.slice(endIndex)];
}
