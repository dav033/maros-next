import type { NotesAppContext } from "@/notes";
import type { NotePage, NotePageDraft } from "@/notes/domain";

export async function createNotePage(
  ctx: NotesAppContext,
  draft: NotePageDraft
): Promise<NotePage> {
  return ctx.repos.notePage.create(draft);
}
