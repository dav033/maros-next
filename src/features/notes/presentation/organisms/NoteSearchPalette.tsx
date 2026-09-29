"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNoteSearch } from "../hooks/data/useNoteSearch";
import { useInstantNoteTree } from "../hooks/data/useInstantNoteTree";
import { onNoteContentSearch } from "./noteSearchBus";
import { formatRelativeTime } from "../atoms/formatRelativeTime";

export function NoteSearchPalette({
  showTrigger = false,
}: {
  showTrigger?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { hits, isLoading } = useNoteSearch(query);
  const tree = useInstantNoteTree();
  const results = query.trim()
    ? hits
    : [...tree.pages]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 6);

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

  // Opened with a query already in hand by the home list's "no results" state.
  useEffect(
    () =>
      onNoteContentSearch((incoming) => {
        setQuery(incoming);
        setOpen(true);
      }),
    [],
  );

  const handleSelect = (id: number) => {
    setOpen(false);
    setQuery("");
    router.push(`/notes/${id}`);
  };

  return (
    <>
      {showTrigger && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setOpen(true)}
          aria-label="Search notes"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Search notes</span>
          <kbd className="hidden rounded border border-line bg-elev-4 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
            {typeof navigator !== "undefined" &&
            /Mac|iPhone|iPad/.test(navigator.platform)
              ? "⌘K"
              : "Ctrl K"}
          </kbd>
        </Button>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">Search notes</DialogTitle>
          <DialogDescription className="sr-only">
            Search page titles and content, or open a recently edited page.
          </DialogDescription>
          {/* Server-side search already filters `hits`; shouldFilter avoids cmdk
              re-filtering client-side against a `value` that isn't the note title. */}
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search notes…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {isLoading && (
                <p
                  role="status"
                  className="px-4 py-6 text-center text-sm text-muted-foreground"
                >
                  Searching notes…
                </p>
              )}
              {!query.trim() && results.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Type to search your notes.
                </p>
              )}
              {!isLoading && query.trim() && hits.length === 0 && (
                <CommandEmpty>No notes found.</CommandEmpty>
              )}
              <CommandGroup
                heading={
                  !query.trim() && results.length > 0
                    ? "Recently edited"
                    : undefined
                }
              >
                {results.map((hit) => (
                  <CommandItem
                    key={hit.id}
                    value={String(hit.id)}
                    onSelect={() => handleSelect(hit.id)}
                    className="gap-2"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-elev-3 text-muted-foreground">
                      {hit.icon ? (
                        <span className="text-[11px]">{hit.icon}</span>
                      ) : (
                        <FileText className="size-3" aria-hidden="true" />
                      )}
                    </span>
                    <span
                      className={
                        hit.title
                          ? "min-w-0 truncate text-[13px]"
                          : "min-w-0 truncate text-[13px] italic text-muted-foreground"
                      }
                    >
                      {hit.title || "Untitled"}
                    </span>
                    {/* Eight results all reading "Untitled" is the state this
                        workspace is actually in, so the timestamp is what tells
                        them apart. */}
                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                      {formatRelativeTime(hit.updatedAt)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
