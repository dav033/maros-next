import { NotesSidebar } from "@/features/notes/presentation/organisms/NotesSidebar";
import { NoteSearchPalette } from "@/features/notes/presentation/organisms/NoteSearchPalette";
import { NotebookPen } from "lucide-react";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[32rem] flex-col gap-2.5 md:h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-4rem)]">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-elev-4 text-muted-foreground">
            <NotebookPen className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold tracking-tight">
              Notes
            </h1>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
              Project context, decisions, and follow-ups.
            </p>
          </div>
        </div>
        <NoteSearchPalette showTrigger />
      </header>

      <section
        aria-label="Notes workspace"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-background"
      >
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <NotesSidebar />
          {children}
        </div>
      </section>
    </div>
  );
}
