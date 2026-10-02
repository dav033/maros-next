import type { NotesAppContext } from "@/notes";
import type { NoteReferenceKind } from "@/notes/domain";

export async function removeNoteRelation(
  ctx: NotesAppContext,
  pageId: number,
  kind: NoteReferenceKind,
  targetId: number
): Promise<void> {
  return ctx.repos.noteReference.removeRelation(pageId, kind, targetId);
}
