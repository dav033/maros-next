import type { NotesAppContext } from "@/notes";
import type { NoteBacklink, NoteReferenceKind, NoteReferenceOrigin } from "@/notes/domain";

/**
 * Notes pointing at a CRM record — what a lead, project, contact, company or task page
 * shows. `origins` narrows it: a record page asks for `inline` only, because the notes
 * pinned to it are already listed in its Notes panel.
 */
export async function listNotesReferencingTarget(
  ctx: NotesAppContext,
  kind: NoteReferenceKind,
  targetId: number,
  origins?: NoteReferenceOrigin[]
): Promise<NoteBacklink[]> {
  return ctx.repos.noteReference.listNotesReferencing(kind, targetId, origins);
}
