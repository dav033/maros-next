import type { NotesAppContext } from "@/notes";
import type { NoteLinkDraft, NotePageId, NoteShareLink } from "@/notes/domain";

/**
 * Publishes the note to a public URL.
 *
 * The returned link carries `url`, and this is the only moment it exists: the server
 * stores a SHA-256 of the token, so nothing can recover it afterwards. Whatever calls
 * this has to show or copy the URL there and then.
 */
export async function publishNoteLink(
  ctx: NotesAppContext,
  id: NotePageId,
  draft: NoteLinkDraft
): Promise<NoteShareLink> {
  return ctx.repos.noteSharing.createLink(id, draft);
}
