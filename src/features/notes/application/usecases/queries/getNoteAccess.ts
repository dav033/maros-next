import type { NotesAppContext } from "@/notes";
import type { NoteAccessPanel, NotePageId } from "@/notes/domain";

/** Visibility, grants (direct and inherited) and share links, in one request. */
export async function getNoteAccess(
  ctx: NotesAppContext,
  id: NotePageId
): Promise<NoteAccessPanel> {
  return ctx.repos.noteSharing.getAccessPanel(id);
}
