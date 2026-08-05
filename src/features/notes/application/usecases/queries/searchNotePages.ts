import type { NotesAppContext } from "@/notes";
import type { NoteSearchHit } from "@/notes/domain";

export async function searchNotePages(
  ctx: NotesAppContext,
  query: string,
  limit = 20
): Promise<NoteSearchHit[]> {
  if (!query.trim()) return [];
  return ctx.repos.notePage.search(query, limit);
}
