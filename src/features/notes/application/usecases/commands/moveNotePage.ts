import type { NotesAppContext } from "@/notes";
import type { NoteMoveResult } from "@/notes/domain";

export async function moveNotePage(
  ctx: NotesAppContext,
  id: number,
  parentId: number | null,
  beforeId?: number | null,
  afterId?: number | null
): Promise<NoteMoveResult> {
  return ctx.repos.notePage.move(id, parentId, beforeId, afterId);
}
