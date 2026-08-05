import type { NotesAppContext } from "@/notes";
import type { NotePage } from "@/notes/domain";

export async function saveNoteContent(
  ctx: NotesAppContext,
  id: number,
  content: Record<string, unknown>,
  expectedUpdatedAt?: string
): Promise<NotePage> {
  return ctx.repos.notePage.updateContent(id, content, expectedUpdatedAt);
}
