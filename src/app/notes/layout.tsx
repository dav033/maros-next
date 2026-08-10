import { NotesSidebar } from "@/features/notes/presentation/organisms/NotesSidebar";
import { NoteSearchPalette } from "@/features/notes/presentation/organisms/NoteSearchPalette";
import { NotebookPen } from "lucide-react";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-full min-h-[calc(100dvh-7rem)] flex-col gap-3 md:min-h-[calc(100dvh-4rem)]"
    >
      <header className="dashboard-section-enter flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/40 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">Notes</h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Keep project context, decisions, and follow-ups in one place.
            </p>
          </div>
        </div>
        <NoteSearchPalette showTrigger />
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/30 shadow-sm">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <NotesSidebar />
          {children}
        </div>
      </section>
    </div>
  );
}
