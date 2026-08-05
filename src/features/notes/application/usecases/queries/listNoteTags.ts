import type { NotesAppContext } from "@/notes";
import type { NoteTag } from "@/notes/domain";

export async function listNoteTags(ctx: NotesAppContext): Promise<NoteTag[]> {
  return ctx.repos.noteTag.list();
}
