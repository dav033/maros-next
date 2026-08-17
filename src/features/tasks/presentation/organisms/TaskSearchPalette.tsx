"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KanbanSquare, ListTodo, UserCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useInstantTasksList } from "../hooks/data/useInstantTasksList";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
import { TASK_STATUS_LABELS } from "../atoms/taskVisualTokens";

const MAX_HITS = 20;

/**
 * The query only fires once the palette is actually open (this whole component only
 * mounts then — see TaskSearchPalette) — pressing ⌘K on the board shouldn't cost an
 * extra unfiltered /tasks fetch on every page load.
 */
function TaskResults({ query, onSelect }: { query: string; onSelect: (id: number) => void }) {
  const { tasks, showSkeleton } = useInstantTasksList({ q: query.trim() || undefined, limit: MAX_HITS });
  const hits = tasks.slice(0, MAX_HITS);

  return (
    <>
      {!showSkeleton && hits.length === 0 ? <CommandEmpty>No tasks found.</CommandEmpty> : null}
      <CommandGroup heading="Tasks">
        {hits.map((task) => (
          <CommandItem key={task.id} value={`task-${task.id}`} onSelect={() => onSelect(task.id)}>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{task.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{TASK_STATUS_LABELS[task.status]}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}

/** `⌘K`/`Ctrl K` palette — task search by title plus jumps to the three task views. */
export function TaskSearchPalette() {
  const router = useRouter();
  const { openTask } = useTaskDetailRoute();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSelectTask = (id: number) => {
    close();
    openTask(id);
  };

  const goTo = (path: string) => {
    close();
    router.push(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        {/* shouldFilter=false: TaskResults already narrows `tasks` itself (by title
            substring), and cmdk's own filter would otherwise match against `value`
            (`task-123`), not the title. */}
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search tasks or jump to a view…" value={query} onValueChange={setQuery} />
          <CommandList>
            {open ? <TaskResults query={query} onSelect={handleSelectTask} /> : null}
            <CommandSeparator />
            <CommandGroup heading="Go to">
              <CommandItem value="go-board" onSelect={() => goTo("/tasks")}>
                <KanbanSquare className="h-4 w-4 text-muted-foreground" />
                Board
              </CommandItem>
              <CommandItem value="go-list" onSelect={() => goTo("/tasks?view=list")}>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
                List
              </CommandItem>
              <CommandItem value="go-mine" onSelect={() => goTo("/tasks?view=mine")}>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                My tasks
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
