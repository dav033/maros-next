import type { NotePageSummary } from "../models";

/** IDs removed together by the backend's cascading soft-delete of a folder. */
export function noteSubtreeIds(pages: NotePageSummary[], rootId: number): Set<number> {
  const childrenByParent = new Map<number, number[]>();
  for (const page of pages) {
    if (page.parentId == null) continue;
    const children = childrenByParent.get(page.parentId) ?? [];
    children.push(page.id);
    childrenByParent.set(page.parentId, children);
  }

  const ids = new Set<number>([rootId]);
  const pending = [rootId];
  while (pending.length > 0) {
    const id = pending.pop()!;
    for (const childId of childrenByParent.get(id) ?? []) {
      if (!ids.has(childId)) {
        ids.add(childId);
        pending.push(childId);
      }
    }
  }
  return ids;
}
