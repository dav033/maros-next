import type { NotesAppContext } from "@/notes";

export async function trashNotePage(ctx: NotesAppContext, id: number): Promise<void> {
  return ctx.repos.notePage.trash(id);
}
