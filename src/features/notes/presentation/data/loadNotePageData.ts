import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import {
  NotePageHttpRepository,
  NoteSharingHttpRepository,
  NoteTagHttpRepository,
  makeNotesAppContext,
} from "@/notes";
import { listNoteTree, getNotePage } from "@/notes/application";
import { SystemClock } from "@/shared/domain";
import type { NotePage, NotePageSummary } from "@/notes/domain";

export interface NotePageRouteData {
  tree: NotePageSummary[];
  page: NotePage | null;
}

export async function loadNotePageData(pageId: number): Promise<NotePageRouteData> {
  const api = createServerApiClient(await headers());
  const ctx = makeNotesAppContext({
    clock: SystemClock,
    repos: {
      notePage: new NotePageHttpRepository(api),
      noteTag: new NoteTagHttpRepository(api),
      noteSharing: new NoteSharingHttpRepository(api),
    },
  });

  const [tree, page] = await Promise.all([
    listNoteTree(ctx).catch(() => []),
    getNotePage(ctx, pageId).catch(() => null),
  ]);

  return { tree, page };
}
