import type { NotesAppContext } from "@/notes";
import type { NotePage, NotePageId, NoteVisibility } from "@/notes/domain";

export async function setNoteVisibility(
  ctx: NotesAppContext,
  id: NotePageId,
  visibility: NoteVisibility
): Promise<NotePage> {
  return ctx.repos.noteSharing.setVisibility(id, visibility);
}
