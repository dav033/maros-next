import type { NotesAppContext } from "@/notes";
import type { NoteDirectoryUser } from "@/notes/domain";

/**
 * Colleagues available in the people picker. Deliberately a plain directory — name,
 * email and picture — because listing users with their roles needs `users:read`, which
 * members do not have, and sharing a note must not require being an admin.
 */
export async function listNoteDirectory(
  ctx: NotesAppContext
): Promise<NoteDirectoryUser[]> {
  return ctx.repos.noteSharing.listDirectory();
}
