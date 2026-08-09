import type { NotesAppContext } from "@/notes";
import type { NoteLinkPatch, NotePageId, NoteShareLink } from "@/notes/domain";

export async function updateNoteLink(
  ctx: NotesAppContext,
  id: NotePageId,
  linkId: number,
  patch: NoteLinkPatch
): Promise<NoteShareLink> {
  return ctx.repos.noteSharing.updateLink(id, linkId, patch);
}
