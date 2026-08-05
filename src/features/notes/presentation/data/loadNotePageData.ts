import { serverApiClient } from "@/shared/infra/http";
import { NotePageHttpRepository, makeNotesAppContext, NoteTagHttpRepository } from "@/notes";
import { listNoteTree, getNotePage } from "@/notes/application";
import { SystemClock } from "@/shared/domain";
import type { NotePage, NotePageSummary } from "@/notes/domain";

export interface NotePageRouteData {
  tree: NotePageSummary[];
  page: NotePage | null;
}

export async function loadNotePageData(pageId: number): Promise<NotePageRouteData> {
  const ctx = makeNotesAppContext({
    clock: SystemClock,
    repos: {
      notePage: new NotePageHttpRepository(serverApiClient),
      noteTag: new NoteTagHttpRepository(serverApiClient),
    },
  });

  const [tree, page] = await Promise.all([
    listNoteTree(ctx).catch(() => []),
    getNotePage(ctx, pageId).catch(() => null),
  ]);

  return { tree, page };
}
