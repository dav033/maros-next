import type {
  NotePageRepositoryPort,
  NoteSharingRepositoryPort,
  NoteTagRepositoryPort,
} from "@/features/notes/domain";
import type { Clock } from "@/shared/domain";

export type NotesAppContext = Readonly<{
  clock: Clock;
  repos: {
    notePage: NotePageRepositoryPort;
    noteTag: NoteTagRepositoryPort;
    noteSharing: NoteSharingRepositoryPort;
  };
}>;

export function makeNotesAppContext(deps: NotesAppContext): NotesAppContext {
  return deps;
}
