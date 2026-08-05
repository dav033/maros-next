import type { NotesAppContext } from "@/notes";
import type { NotePage } from "@/notes/domain";

export async function getNotePage(
  ctx: NotesAppContext,
  id: number
): Promise<NotePage | null> {
  return ctx.repos.notePage.getById(id);
}
