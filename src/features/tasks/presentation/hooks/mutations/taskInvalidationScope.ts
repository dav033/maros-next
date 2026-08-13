import type { TaskPatch } from "@/tasks/domain";

export type TaskInvalidationScope = "detail" | "detail+board+lists" | "all";

/**
 * Fields a PATCH can touch that never render outside the detail sheet — description,
 * who's accountable, and when work starts. Editing only these needs no board/list/mine
 * refetch at all. `expectedUpdatedAt` is request metadata, not a rendered field, and is
 * ignored either way.
 */
const DETAIL_ONLY_FIELDS: ReadonlySet<keyof TaskPatch> = new Set(["description", "reporterId", "startDate"]);

/** Rendered on the board and the list, but not on "Mine" (MyTaskRow doesn't show priority). */
const BOARD_AND_LIST_FIELDS: ReadonlySet<keyof TaskPatch> = new Set(["priority"]);

const IGNORED_FIELDS: ReadonlySet<string> = new Set(["expectedUpdatedAt"]);

/**
 * What a `PATCH /tasks/:id` needs to invalidate, based on which fields it actually
 * touched — a description autosave or a start-date tweak (the common, frequent case)
 * no longer refetches the whole board and list on every keystroke's blur.
 *
 * `title`, `kind`, `dueDate` and `blockedReason` fall through to "all": each one
 * renders on the board, the list, *and* "Mine" (dueDate additionally decides which
 * due-date bucket "Mine" sorts a task into server-side), so there's no safe narrower
 * scope for them.
 */
export function scopeForTaskPatch(patch: TaskPatch): TaskInvalidationScope {
  const keys = Object.keys(patch).filter((key) => !IGNORED_FIELDS.has(key)) as Array<keyof TaskPatch>;
  if (keys.length === 0) return "detail";
  if (keys.every((key) => DETAIL_ONLY_FIELDS.has(key))) return "detail";
  if (keys.every((key) => DETAIL_ONLY_FIELDS.has(key) || BOARD_AND_LIST_FIELDS.has(key))) {
    return "detail+board+lists";
  }
  return "all";
}
