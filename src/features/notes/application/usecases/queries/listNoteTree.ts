import type { NotesAppContext } from "@/notes";
import type { NotePageSummary } from "@/notes/domain";

export async function listNoteTree(ctx: NotesAppContext): Promise<NotePageSummary[]> {
  return ctx.repos.notePage.list();
}
