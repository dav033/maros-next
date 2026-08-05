import type { NotesAppContext } from "@/notes";
import type { NotePageSummary } from "@/notes/domain";

export async function listTrashNotes(ctx: NotesAppContext): Promise<NotePageSummary[]> {
  return ctx.repos.notePage.listTrash();
}
