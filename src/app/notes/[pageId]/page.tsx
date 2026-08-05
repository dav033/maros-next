import { notFound } from "next/navigation";
import { NotesPage } from "@/features/notes/presentation/pages/NotesPage";
import { loadNotePageData } from "@/features/notes/presentation/data/loadNotePageData";

export const dynamic = "force-dynamic";

interface NotesPageRouteProps {
  params: Promise<{ pageId: string }>;
}

export default async function NotesByIdPage({ params }: NotesPageRouteProps) {
  const { pageId: pageIdParam } = await params;
  const pageId = Number(pageIdParam);
  if (!Number.isInteger(pageId) || pageId <= 0) {
    notFound();
  }

  const { tree, page } = await loadNotePageData(pageId);

  return <NotesPage activePageId={pageId} initialTree={tree} initialPage={page} />;
}
