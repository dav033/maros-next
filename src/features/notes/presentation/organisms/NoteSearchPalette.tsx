"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

export function NoteSearchPalette({ showTrigger = false }: { showTrigger?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { hits, isLoading } = useNoteSearch(query);

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
          className="gap-2 bg-background/40"
          onClick={() => setOpen(true)}
          aria-label="Search notes"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Search notes</span>
          <kbd className="hidden rounded border border-border/70 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            {typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
              ? "⌘K"
              : "Ctrl K"}
          </kbd>
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          {/* Server-side search already filters `hits`; shouldFilter avoids cmdk
              re-filtering client-side against a `value` that isn't the note title. */}
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search notes…" value={query} onValueChange={setQuery} />
            <CommandList>
              {!isLoading && query.trim() && hits.length === 0 && (
                <CommandEmpty>No notes found.</CommandEmpty>
              )}
              <CommandGroup>
                {hits.map((hit) => (
                  <CommandItem
                    key={hit.id}
                    value={String(hit.id)}
                    onSelect={() => handleSelect(hit.id)}
                  >
                    {hit.icon ? <span>{hit.icon}</span> : <FileText className="h-4 w-4" />}
                    <span className="truncate">{hit.title || "Untitled"}</span>
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
