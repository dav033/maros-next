import type { NotePageRepositoryPort, NoteTagRepositoryPort } from "@/features/notes/domain";
import type { Clock } from "@/shared/domain";

export type NotesAppContext = Readonly<{
  clock: Clock;
  repos: {
    notePage: NotePageRepositoryPort;
    noteTag: NoteTagRepositoryPort;
  };
}>;

export function makeNotesAppContext(deps: NotesAppContext): NotesAppContext {
  return deps;
}
