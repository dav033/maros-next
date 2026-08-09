import type { NotesAppContext } from "@/notes";
import {
  makeNotesAppContext,
  NotePageHttpRepository,
  NoteSharingHttpRepository,
  NoteTagHttpRepository,
} from "@/notes";
import { SystemClock } from "@/shared/domain";

export function createNotesAppContext(): NotesAppContext {
  return makeNotesAppContext({
    clock: SystemClock,
    repos: {
      notePage: new NotePageHttpRepository(),
      noteTag: new NoteTagHttpRepository(),
      noteSharing: new NoteSharingHttpRepository(),
    },
  });
}
