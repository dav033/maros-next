import type { NotesAppContext } from "@/notes";
import type { NoteReference } from "@/notes/domain";

export async function listNoteReferences(
  ctx: NotesAppContext,
  pageId: number
): Promise<NoteReference[]> {
  return ctx.repos.noteReference.listForPage(pageId);
}
