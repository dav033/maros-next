"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNoteSearch } from "../hooks/data/useNoteSearch";

export function NoteSearchPalette() {
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
  );
}
