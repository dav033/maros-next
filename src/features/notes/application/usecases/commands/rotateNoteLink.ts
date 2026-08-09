import type { NotesAppContext } from "@/notes";
import type { NotePageId, NoteShareLink } from "@/notes/domain";

/**
 * Kills the current URL and issues a new one, keeping the note published and its
 * settings intact — the fix for a link that reached the wrong inbox.
 */
export async function rotateNoteLink(
  ctx: NotesAppContext,
  id: NotePageId,
  linkId: number
): Promise<NoteShareLink> {
  return ctx.repos.noteSharing.rotateLink(id, linkId);
}
