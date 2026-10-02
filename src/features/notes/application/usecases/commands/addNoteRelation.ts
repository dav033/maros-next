import type { NotesAppContext } from "@/notes";
import type { NoteReference, NoteReferenceKind } from "@/notes/domain";

export async function addNoteRelation(
  ctx: NotesAppContext,
  pageId: number,
  kind: NoteReferenceKind,
  targetId: number
): Promise<NoteReference[]> {
  return ctx.repos.noteReference.addRelation(pageId, kind, targetId);
}
