/**
 * EntityAttachmentsSection is shared across entity kinds and always hands back a
 * complete desired list — it doesn't know tasks need additive semantics (see
 * TaskPatch). This classifies that list against what the task last had, so the
 * caller can route to the right additive endpoint instead of replacing the whole
 * array. Only the three shapes EntityAttachmentsSection actually produces matter
 * here: an upload appends N new keys, a removal drops exactly one, a drag reorder
 * keeps the same set in a new order.
 */
export type TaskAttachmentsChange =
  | { op: "add"; keys: string[] }
  | { op: "remove"; key: string }
  | { op: "reorder"; keys: string[] }
  | { op: "noop" };

export function classifyAttachmentsChange(
  previous: string[],
  next: string[]
): TaskAttachmentsChange {
  const added = next.filter((key) => !previous.includes(key));
  const removed = previous.filter((key) => !next.includes(key));

  if (added.length === 0 && removed.length === 0) {
    return next.join("|") === previous.join("|") ? { op: "noop" } : { op: "reorder", keys: next };
  }
  if (removed.length === 1 && added.length === 0) {
    return { op: "remove", key: removed[0] };
  }
  if (added.length > 0 && removed.length === 0) {
    return { op: "add", keys: added };
  }
  // Not a shape EntityAttachmentsSection produces today (simultaneous add+remove, or
  // more than one removal at once) — reorder is the only safe fallback, since it can
  // never destroy data: reorderAttachments reconciles against the server's live set.
  return { op: "reorder", keys: next };
}
