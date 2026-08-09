import { NotesSidebar } from "@/features/notes/presentation/organisms/NotesSidebar";
import { NoteSearchPalette } from "@/features/notes/presentation/organisms/NoteSearchPalette";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <NoteSearchPalette />
      <NotesSidebar />
      {children}
    </div>
  );
}
