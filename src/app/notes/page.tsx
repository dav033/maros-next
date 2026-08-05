import { NotesPage } from "@/features/notes/presentation/pages/NotesPage";
import { loadNoteTreeData } from "@/features/notes/presentation/data/loadNoteTreeData";

export const dynamic = "force-dynamic";

export default async function NotesIndexPage() {
  const tree = await loadNoteTreeData();
  return <NotesPage activePageId={null} initialTree={tree} />;
}
