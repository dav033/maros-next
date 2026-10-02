import type { NotesAppContext } from "@/notes";
import type { NoteBacklink } from "@/notes/domain";

export async function listNoteBacklinks(
  ctx: NotesAppContext,
  pageId: number
): Promise<NoteBacklink[]> {
  return ctx.repos.noteReference.listBacklinks(pageId);
}
