import type { NotesAppContext } from "@/notes";
import type { NoteAccessPanel, NotePageId, NoteShareAccess } from "@/notes/domain";

/** A grant covers the page and everything under it — grants are inherited downward. */
export async function shareNoteWithUser(
  ctx: NotesAppContext,
  id: NotePageId,
  userId: number,
  access: NoteShareAccess,
  expiresAt?: string
): Promise<NoteAccessPanel> {
  return ctx.repos.noteSharing.addShare(id, {
    subjectType: "user",
    subjectId: userId,
    access,
    expiresAt,
  });
}
