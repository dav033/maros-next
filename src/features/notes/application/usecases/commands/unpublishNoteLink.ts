import type { NotesAppContext } from "@/notes";
import type { NotePageId } from "@/notes/domain";

/** Soft revoke: the URL stops working, the audit trail of who published it survives. */
export async function unpublishNoteLink(
  ctx: NotesAppContext,
  id: NotePageId,
  linkId: number
): Promise<void> {
  return ctx.repos.noteSharing.revokeLink(id, linkId);
}
