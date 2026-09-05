import { NotesSidebar } from "@/features/notes/presentation/organisms/NotesSidebar";
import { NoteSearchPalette } from "@/features/notes/presentation/organisms/NoteSearchPalette";
import { NotebookPen } from "lucide-react";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[32rem] flex-col gap-4 md:h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-4rem)]">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted/50 text-muted-foreground">
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              Notes
            </h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Project context, decisions, and follow-ups.
            </p>
          </div>
        </div>
        <NoteSearchPalette showTrigger />
      </header>

      <section
        aria-label="Notes workspace"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-background"
      >
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <NotesSidebar />
          {children}
        </div>
      </section>
    </div>
  );
}
