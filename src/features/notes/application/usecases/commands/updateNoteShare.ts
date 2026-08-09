import type { NotesAppContext } from "@/notes";
import type { NoteAccessPanel, NotePageId, NoteShareAccess } from "@/notes/domain";

export async function updateNoteShare(
  ctx: NotesAppContext,
  id: NotePageId,
  shareId: number,
  patch: { access?: NoteShareAccess; expiresAt?: string | null }
): Promise<NoteAccessPanel> {
  return ctx.repos.noteSharing.updateShare(id, shareId, patch);
}
