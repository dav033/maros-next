import type { NotesAppContext } from "@/notes";
import type { NotePage, NotePagePatch } from "@/notes/domain";

export async function updateNotePageMeta(
  ctx: NotesAppContext,
  id: number,
  patch: NotePagePatch
): Promise<NotePage> {
  return ctx.repos.notePage.update(id, patch);
}
