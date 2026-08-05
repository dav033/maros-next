import { serverApiClient } from "@/shared/infra/http";
import { NotePageHttpRepository, makeNotesAppContext, NoteTagHttpRepository } from "@/notes";
import { listNoteTree } from "@/notes/application";
import { SystemClock } from "@/shared/domain";
import type { NotePageSummary } from "@/notes/domain";

export async function loadNoteTreeData(): Promise<NotePageSummary[]> {
  const ctx = makeNotesAppContext({
    clock: SystemClock,
    repos: {
      notePage: new NotePageHttpRepository(serverApiClient),
      noteTag: new NoteTagHttpRepository(serverApiClient),
    },
  });

  return listNoteTree(ctx).catch(() => []);
}
