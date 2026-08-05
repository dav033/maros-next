import type { NotesAppContext } from "@/notes";
import type { NoteEntityKind, NotePageSummary } from "@/notes/domain";

export async function listNotesByEntity(
  ctx: NotesAppContext,
  kind: NoteEntityKind,
  entityId: number
): Promise<NotePageSummary[]> {
  return ctx.repos.notePage.listByEntity(kind, entityId);
}
