import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import {
  NotePageHttpRepository,
  NoteSharingHttpRepository,
  NoteTagHttpRepository,
  makeNotesAppContext,
} from "@/notes";
import { listNoteTree } from "@/notes/application";
import { SystemClock } from "@/shared/domain";
import type { NotePageSummary } from "@/notes/domain";

export async function loadNoteTreeData(): Promise<NotePageSummary[]> {
  const api = createServerApiClient(await headers());
  const ctx = makeNotesAppContext({
    clock: SystemClock,
    repos: {
      notePage: new NotePageHttpRepository(api),
      noteTag: new NoteTagHttpRepository(api),
      noteSharing: new NoteSharingHttpRepository(api),
    },
  });

  return listNoteTree(ctx).catch(() => []);
}
