import type { NotesAppContext } from "@/notes";
import type { NotePageId } from "@/notes/domain";

export async function revokeNoteShare(
  ctx: NotesAppContext,
  id: NotePageId,
  shareId: number
): Promise<void> {
  return ctx.repos.noteSharing.removeShare(id, shareId);
}
