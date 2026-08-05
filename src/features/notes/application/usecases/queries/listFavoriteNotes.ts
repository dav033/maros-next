import type { NotesAppContext } from "@/notes";
import type { NotePageSummary } from "@/notes/domain";

export async function listFavoriteNotes(ctx: NotesAppContext): Promise<NotePageSummary[]> {
  return ctx.repos.notePage.listFavorites();
}
