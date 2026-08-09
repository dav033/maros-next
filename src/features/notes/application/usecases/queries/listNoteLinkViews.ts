import type { NotesAppContext } from "@/notes";
import type { NoteLinkStats, NotePageId } from "@/notes/domain";

export async function listNoteLinkViews(
  ctx: NotesAppContext,
  id: NotePageId,
  linkId: number
): Promise<NoteLinkStats> {
  return ctx.repos.noteSharing.getLinkStats(id, linkId);
}
