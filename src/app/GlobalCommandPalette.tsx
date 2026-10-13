"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  KanbanSquare,
  ListTodo,
  Search,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import type { Permission } from "@/shared/auth/permissions";
import type { TaskStatus } from "@/tasks/domain";
import {
  SIDEBAR_CONFIG,
  type SidebarDropdownConfig,
  type SidebarSection,
} from "@/components/sidebar/sidebarConfig";
import { useInstantTasksList } from "@/features/tasks/presentation/hooks/data/useInstantTasksList";
import { useNoteSearch } from "@/features/notes/presentation/hooks/data/useNoteSearch";
import { useInstantNoteTree } from "@/features/notes/presentation/hooks/data/useInstantNoteTree";
import { formatRelativeTime } from "@/features/notes/presentation/atoms/formatRelativeTime";
import { onNoteContentSearch } from "@/features/notes/presentation/organisms/noteSearchBus";

const MAX_RESULTS = 12;
const TASK_STATUS_LABELS_ES: Record<TaskStatus, string> = {
  backlog: "Pendiente",
  todo: "Por hacer",
  in_progress: "En curso",
  blocked: "Bloqueada",
  done: "Completada",
  cancelled: "Cancelada",
};

type NavigationResult = {
  title: string;
  href: string;
  section: string;
};

function collectNavigationResults(
  items: SidebarDropdownConfig[],
  section: string,
  hasPermission: (permission: Permission) => boolean,
): NavigationResult[] {
  return items.flatMap((item) => {
    if ("trigger" in item) {
      return collectNavigationResults(
        item.items,
        item.trigger.title,
        hasPermission,
      );
    }

    if (item.permission && !hasPermission(item.permission)) return [];
    return [{ title: item.title, href: item.href, section }];
  });
}

function getNavigationResults(
  hasPermission: (permission: Permission) => boolean,
): NavigationResult[] {
  return SIDEBAR_CONFIG.top.flatMap((entry) => {
    if ("section" in entry) {
      return collectNavigationResults(
        (entry as SidebarSection).items,
        entry.section,
        hasPermission,
      );
    }

    return collectNavigationResults([entry], "Maros", hasPermission);
  });
}

function TaskResults({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (id: number) => void;
}) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const { tasks, isLoading, error, refetch } = useInstantTasksList({
    q: debouncedQuery.trim() || undefined,
    limit: MAX_RESULTS,
  });
  const isDebouncing = debouncedQuery !== query;

  if (error) {
    return (
      <div className="px-3 py-4 text-sm" role="alert">
        <p>No se pudieron buscar las tareas.</p>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0"
          onClick={() => void refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      {isLoading || isDebouncing ? (
        <p className="px-3 py-4 text-sm text-muted-foreground" role="status">
          Buscando tareas…
        </p>
      ) : tasks.length === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground" role="status">
          No se encontraron tareas.
        </p>
      ) : null}
      <CommandGroup heading="Tareas">
        {!isDebouncing &&
          tasks.slice(0, MAX_RESULTS).map((task) => (
            <CommandItem
              key={task.id}
              value={`tarea ${task.title} ${task.id}`}
              onSelect={() => onSelect(task.id)}
            >
              <ListTodo
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate">{task.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {TASK_STATUS_LABELS_ES[task.status]}
              </span>
            </CommandItem>
          ))}
      </CommandGroup>
    </>
  );
}

function NoteResults({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (id: number) => void;
}) {
  const {
    hits,
    isLoading,
    error: searchError,
    refetch: retrySearch,
  } = useNoteSearch(query);
  const {
    pages,
    isLoading: isTreeLoading,
    error: treeError,
    refetch: retryTree,
  } = useInstantNoteTree();
  const error = query.trim() ? searchError : treeError;
  const retry = query.trim() ? retrySearch : retryTree;
  const results = query.trim()
    ? hits.slice(0, MAX_RESULTS)
    : [...pages]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 6);
  const loading = query.trim() ? isLoading : isTreeLoading;

  if (error) {
    return (
      <div className="px-3 py-4 text-sm" role="alert">
        <p>No se pudieron cargar las notas.</p>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0"
          onClick={() => void retry()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <p className="px-3 py-4 text-sm text-muted-foreground" role="status">
          Buscando notas…
        </p>
      ) : results.length === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground" role="status">
          {query.trim()
            ? "No se encontraron notas."
            : "Aún no hay notas recientes."}
        </p>
      ) : null}
      <CommandGroup heading={query.trim() ? "Notas" : "Editadas recientemente"}>
        {results.map((note) => (
          <CommandItem
            key={note.id}
            value={`nota ${note.title || "sin título"} ${note.id}`}
            onSelect={() => onSelect(note.id)}
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-elev-3 text-muted-foreground">
              {note.icon ? (
                <span className="text-[11px]">{note.icon}</span>
              ) : (
                <FileText className="size-3" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {note.title || "Sin título"}
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {formatRelativeTime(note.updatedAt)}
            </span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}

export function GlobalCommandPalette() {
  const router = useRouter();
  const { hasPermission } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shortcut, setShortcut] = useState("Ctrl K");
  const canReadTasks = hasPermission("tasks:read");
  const canReadNotes = hasPermission("notes:read");
  const navigation = useMemo(
    () => getNavigationResults(hasPermission),
    [hasPermission],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const navigationResults = normalizedQuery
    ? navigation.filter((page) =>
        `${page.title} ${page.section} ${page.href}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : navigation;

  useEffect(() => {
    setShortcut(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K");

    const handler = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        event.defaultPrevented ||
        event.isComposing ||
        (target instanceof Element &&
          target.closest(
            'input, textarea, select, [contenteditable="true"], [role="textbox"]',
          ))
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(
    () =>
      onNoteContentSearch((incoming) => {
        setQuery(incoming);
        setOpen(true);
      }),
    [],
  );

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const selectTask = (id: number) => {
    close();
    router.push(`/tasks?task=${id}`);
  };

  const selectNote = (id: number) => {
    close();
    router.push(`/notes/${id}`);
  };

  const selectPage = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="min-w-0 justify-start gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label={`Buscar en Maros (${shortcut})`}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Buscar en Maros…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-line bg-elev-4 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
          {shortcut}
        </kbd>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-hidden rounded-xl p-0">
          <DialogTitle className="sr-only">Buscar en Maros</DialogTitle>
          <DialogDescription className="sr-only">
            Busca páginas, tareas y notas a las que tienes acceso.
          </DialogDescription>
          {/* Notes search includes body text; cmdk must not filter those server hits by title. */}
          <Command shouldFilter={false}>
            <CommandInput
              aria-label="Busca páginas, tareas y notas"
              placeholder="Busca páginas, tareas o notas…"
              value={query}
              onValueChange={setQuery}
              className="pr-12"
            />
            <CommandList>
              <CommandGroup heading="Páginas">
                {navigationResults.length > 0 ? (
                  navigationResults.map((page) => (
                    <CommandItem
                      key={page.href}
                      value={`página ${page.title} ${page.section} ${page.href}`}
                      onSelect={() => selectPage(page.href)}
                    >
                      <Search
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {page.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {page.section}
                      </span>
                    </CommandItem>
                  ))
                ) : query.trim() ? (
                  <p
                    className="px-3 py-4 text-sm text-muted-foreground"
                    role="status"
                  >
                    No hay páginas coincidentes.
                  </p>
                ) : null}
              </CommandGroup>
              <CommandSeparator />
              {open && canReadTasks ? (
                <TaskResults query={query} onSelect={selectTask} />
              ) : null}
              {open && canReadNotes ? (
                <NoteResults query={query} onSelect={selectNote} />
              ) : null}
              {!query.trim() && canReadTasks ? (
                <CommandGroup heading="Ir a tareas">
                  <CommandItem
                    value="tablero tareas board"
                    onSelect={() => selectPage("/tasks")}
                  >
                    <KanbanSquare aria-hidden="true" /> Tablero
                  </CommandItem>
                  <CommandItem
                    value="lista tareas list"
                    onSelect={() => selectPage("/tasks?view=list")}
                  >
                    <ListTodo aria-hidden="true" /> Lista
                  </CommandItem>
                  <CommandItem
                    value="mis tareas mine"
                    onSelect={() => selectPage("/tasks?view=mine")}
                  >
                    <UserCheck aria-hidden="true" /> Mis tareas
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
