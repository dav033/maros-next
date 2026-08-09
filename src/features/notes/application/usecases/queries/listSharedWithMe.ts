import type { NotesAppContext } from "@/notes";
import type { NotePageSummary } from "@/notes/domain";

/** Notes someone granted the caller access to — nothing already visible team-wide. */
export async function listSharedWithMe(
  ctx: NotesAppContext
): Promise<NotePageSummary[]> {
  return ctx.repos.noteSharing.listSharedWithMe();
}
