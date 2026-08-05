import type { NotesAppContext } from "@/notes";
import { makeNotesAppContext, NotePageHttpRepository, NoteTagHttpRepository } from "@/notes";
import { SystemClock } from "@/shared/domain";

export function createNotesAppContext(): NotesAppContext {
  return makeNotesAppContext({
    clock: SystemClock,
    repos: {
      notePage: new NotePageHttpRepository(),
      noteTag: new NoteTagHttpRepository(),
    },
  });
}
