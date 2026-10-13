import { notFound } from "next/navigation";
import { NotesPage } from "@/features/notes/presentation/pages/NotesPage";
import { parsePositiveSafeInteger } from "@/shared/utils/parsePositiveSafeInteger";

export const dynamic = "force-dynamic";

interface NotesPageRouteProps {
  params: Promise<{ pageId: string }>;
}

export default async function NotesByIdPage({ params }: NotesPageRouteProps) {
  const { pageId: pageIdParam } = await params;
  const pageId = parsePositiveSafeInteger(pageIdParam);
  if (pageId === null) {
    notFound();
  }

  return <NotesPage activePageId={pageId} />;
}
