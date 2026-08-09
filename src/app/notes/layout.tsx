import { NotesSidebar } from "@/features/notes/presentation/organisms/NotesSidebar";
import { NoteSearchPalette } from "@/features/notes/presentation/organisms/NoteSearchPalette";

// Darker than the rest of the app on purpose — the notes workspace mockup calls
// for a near-black canvas, scoped here via a CSS var override so it doesn't
// change --background (and therefore every other page) globally.
const NOTES_BACKGROUND_OVERRIDE = { "--background": "0 0% 3%" } as React.CSSProperties;

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-[calc(100vh-3.5rem)] bg-background rounded-lg border border-border/60"
      style={NOTES_BACKGROUND_OVERRIDE}
    >
      <NoteSearchPalette />
      <NotesSidebar />
      {children}
    </div>
  );
}
